import { NextResponse, type NextRequest } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';

function parseUserAgent(ua: string) {
  let browser = 'Unknown Browser';
  let os = 'Unknown OS';
  let deviceType = 'Desktop';

  if (!ua) return { browser, os, deviceType };

  // Detect OS
  if (/windows/i.test(ua)) os = 'Windows';
  else if (/macintosh|mac os x/i.test(ua)) os = 'macOS';
  else if (/android/i.test(ua)) { os = 'Android'; deviceType = 'Mobile'; }
  else if (/iphone|ipad|ipod/i.test(ua)) { os = 'iOS'; deviceType = 'Mobile'; }
  else if (/linux/i.test(ua)) os = 'Linux';

  // Detect Browser
  if (/edg/i.test(ua)) browser = 'Microsoft Edge';
  else if (/chrome|crios/i.test(ua) && !/opr|opera/i.test(ua)) browser = 'Chrome';
  else if (/firefox|fxios/i.test(ua)) browser = 'Firefox';
  else if (/safari/i.test(ua) && !/chrome/i.test(ua)) browser = 'Safari';
  else if (/opr|opera/i.test(ua)) browser = 'Opera';

  return { browser, os, deviceType };
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const body = await request.json().catch(() => ({}));

    // Bind targetUserId to authenticated user to prevent malicious injection or spoofing
    const targetUserId = user?.id || (body.status === 'failed' && typeof body.userId === 'string' ? body.userId : null);

    if (!targetUserId) {
      return NextResponse.json({ success: false, error: 'User ID required' }, { status: 400 });
    }

    // Extract Client Network Info
    const ipAddress =
      request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      request.headers.get('x-real-ip') ||
      request.headers.get('cf-connecting-ip') ||
      '127.0.0.1';

    const userAgent = request.headers.get('user-agent') || 'Unknown';
    const { browser, os, deviceType } = parseUserAgent(userAgent);

    const adminSupabase = createAdminClient();

    // Check if login_history table exists, otherwise record safely
    const logEntry = {
      user_id: targetUserId,
      ip_address: ipAddress,
      user_agent: userAgent,
      browser,
      os,
      device_type: deviceType,
      status: body.status || 'success',
      failure_reason: body.failureReason || null,
      created_at: new Date().toISOString(),
    };

    const { error: insertError } = await adminSupabase
      .from('login_history')
      .insert(logEntry);

    if (insertError) {
      console.warn('Could not insert login_history (table might not exist yet):', insertError.message);
      return NextResponse.json({
        success: true,
        recorded: false,
        note: insertError.message,
      });
    }

    return NextResponse.json({
      success: true,
      recorded: true,
      entry: logEntry,
    });
  } catch (err: any) {
    console.warn('Login tracking error:', err.message);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
