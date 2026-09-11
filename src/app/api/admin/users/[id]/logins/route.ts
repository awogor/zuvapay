import { NextResponse, type NextRequest } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    const { data: userProfile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    if (!userProfile || userProfile.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized. Admin privileges required.' }, { status: 403 });
    }

    const { id: targetUserId } = await context.params;
    if (!targetUserId) {
      return NextResponse.json({ success: false, error: 'Target user ID required' }, { status: 400 });
    }

    const adminSupabase = createAdminClient();

    // Query login_history for the user
    const { data: logins, error } = await adminSupabase
      .from('login_history')
      .select('*')
      .eq('user_id', targetUserId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      // If table doesn't exist yet, return empty list cleanly without breaking
      console.warn('login_history table query notice:', error.message);
      return NextResponse.json({
        success: true,
        logins: [],
        tableReady: false,
      });
    }

    return NextResponse.json({
      success: true,
      logins: logins || [],
      tableReady: true,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message, logins: [] }, { status: 500 });
  }
}
