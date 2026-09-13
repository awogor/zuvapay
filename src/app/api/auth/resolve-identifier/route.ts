import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const rawIdentifier = (body.identifier || '').trim();

    if (!rawIdentifier) {
      return NextResponse.json({ error: 'Please enter your email or username' }, { status: 400 });
    }

    // If it looks like an email address, return directly
    if (EMAIL_REGEX.test(rawIdentifier)) {
      return NextResponse.json({ email: rawIdentifier.toLowerCase() });
    }

    // Otherwise treat as a username (strip leading @ if provided)
    const cleanUsername = rawIdentifier.replace(/^@/, '').toLowerCase().trim();

    // Fallback demo user support for local test environments
    if (cleanUsername === 'davidadeleke' || cleanUsername === 'david') {
      return NextResponse.json({ email: 'david@zuvapay.com' });
    }

    const supabase = createAdminClient();

    // 1. Search in auth.users user_metadata (Primary & guaranteed)
    const { data: userList } = await supabase.auth.admin.listUsers();
    if (userList?.users) {
      const match = userList.users.find(
        (u: any) =>
          u.user_metadata?.username?.toLowerCase() === cleanUsername ||
          u.user_metadata?.preferred_username?.toLowerCase() === cleanUsername
      );
      if (match?.email) {
        return NextResponse.json({ email: match.email });
      }
    }

    // 2. Fallback check profiles table if column exists
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, username')
        .ilike('username', cleanUsername)
        .maybeSingle();

      if (profile) {
        const { data: authData } = await supabase.auth.admin.getUserById(profile.id);
        if (authData?.user?.email) {
          return NextResponse.json({ email: authData.user.email });
        }
      }
    } catch {
      // Column might not exist in database yet
    }

    return NextResponse.json(
      { error: `No account found with username @${cleanUsername}. Please check your spelling or sign in with your email.` },
      { status: 404 }
    );
  } catch (err: any) {
    console.error('Error in resolve-identifier:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
