import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { sendTransactionalEmail } from '@/lib/email/sendEmail';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { success: false, error: 'A valid email address is required' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const origin =
      request.headers.get('origin') ||
      process.env.NEXT_PUBLIC_APP_URL ||
      'http://localhost:3000';

    const supabaseAdmin = createAdminClient();

    // Check if user exists first to get name / avoid error exposure
    const { data: usersData } = await supabaseAdmin.auth.admin.listUsers();
    const foundUser = usersData?.users?.find((u: any) => u.email?.toLowerCase() === cleanEmail);
    let name = cleanEmail.split('@')[0];
    if (foundUser) {
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('first_name, last_name, username')
        .eq('id', foundUser.id)
        .maybeSingle();
      if (profile?.first_name) {
        name = profile.first_name;
      }
    }

    // Generate secure recovery link using Supabase Admin API
    const { data, error } = await supabaseAdmin.auth.admin.generateLink({
      type: 'recovery',
      email: cleanEmail,
      options: {
        redirectTo: `${origin}/auth/callback?next=/reset-password`,
      },
    });

    if (error) {
      console.warn('[PASSWORD_RESET_GEN_ERROR]', error.message);
      // For security, do not reveal user existence to prevent enumeration
      return NextResponse.json({
        success: true,
        message: 'If this email is registered, recovery instructions have been sent.',
      });
    }

    const resetUrl =
      data?.properties?.action_link ||
      `${origin}/auth/callback?token_hash=${data?.properties?.hashed_token}&type=recovery&next=/reset-password`;

    const forwardedFor = request.headers.get('x-forwarded-for');
    const ipAddress = forwardedFor
      ? forwardedFor.split(',')[0].trim()
      : (request.headers.get('x-real-ip') || 'Unknown Location');

    // Dispatch branded ZuvaPay email via custom SMTP
    await sendTransactionalEmail({
      to: cleanEmail,
      templateType: 'password_reset',
      data: {
        name,
        resetUrl,
        ipAddress,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'If this email is registered, recovery instructions have been sent.',
    });
  } catch (err: any) {
    console.error('[PASSWORD_RESET_ERROR]', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Internal server error processing recovery' },
      { status: 500 }
    );
  }
}
