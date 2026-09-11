import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const adminClient = createAdminClient();

    const { data: profile, error: profileError } = await adminClient
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (profileError) {
      console.warn('Profile fetch warning:', profileError.message);
    }

    const effectiveRole = profile?.role || user.user_metadata?.role || (user.email === 'awogorm@gmail.com' || user.email === 'david@korrectpay.com' ? 'admin' : 'customer');
    const effectiveUsername = profile?.username || user.user_metadata?.username || null;

    const mergedProfile = {
      id: user.id,
      role: effectiveRole,
      status: profile?.status || 'active',
      is_pin_set: profile?.is_pin_set ?? false,
      title: profile?.title || user.user_metadata?.title || 'Mr',
      first_name: profile?.first_name || user.user_metadata?.first_name || 'User',
      last_name: profile?.last_name || user.user_metadata?.last_name || '',
      phone_number: profile?.phone_number || user.user_metadata?.phone || '',
      username: effectiveUsername,
      avatar_url: profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`,
      created_at: profile?.created_at || user.created_at,
    };

    return NextResponse.json({ profile: mergedProfile });
  } catch (err: any) {
    console.error('Error fetching user profile:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
