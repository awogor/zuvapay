import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,20}$/;
const RESERVED_USERNAMES = new Set([
  'admin',
  'administrator',
  'support',
  'help',
  'korrectpay',
  'official',
  'billing',
  'security',
  'finance',
  'wallet',
  'api',
  'dashboard',
]);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const rawUsername = searchParams.get('username') || '';
    const clean = rawUsername.trim().toLowerCase().replace(/^@/, '');

    if (!clean) {
      return NextResponse.json({ available: false, error: 'Username is required' }, { status: 400 });
    }

    if (!USERNAME_REGEX.test(clean)) {
      return NextResponse.json({
        available: false,
        error: 'Username must be 3-20 characters long and contain only letters, numbers, and underscores.',
      });
    }

    if (RESERVED_USERNAMES.has(clean)) {
      return NextResponse.json({
        available: false,
        error: 'This username is reserved by the platform.',
      });
    }

    const supabase = createAdminClient();

    // 1. Check Auth Users user_metadata
    const { data: userList } = await supabase.auth.admin.listUsers();
    if (userList?.users) {
      const takenByUser = userList.users.find(
        (u: any) =>
          u.user_metadata?.username?.toLowerCase() === clean ||
          u.user_metadata?.preferred_username?.toLowerCase() === clean
      );
      if (takenByUser) {
        return NextResponse.json({
          available: false,
          error: `@${clean} is already taken`,
        });
      }
    }

    // 2. Also check profiles table if column exists
    try {
      const { data: existing, error } = await supabase
        .from('profiles')
        .select('id')
        .ilike('username', clean)
        .maybeSingle();

      if (existing) {
        return NextResponse.json({
          available: false,
          error: `@${clean} is already taken`,
        });
      }
    } catch {
      // Column might not exist in profiles table yet
    }

    return NextResponse.json({
      available: true,
      username: clean,
      message: `@${clean} is available!`,
    });
  } catch (err: any) {
    return NextResponse.json({ available: false, error: err.message }, { status: 500 });
  }
}
