import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';

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

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const body = await request.json().catch(() => ({}));
    const rawUsername = (body.username || '').trim();
    const cleanUsername = rawUsername.toLowerCase().replace(/^@/, '');

    const targetUserId = user?.id || body.userId;

    if (!targetUserId) {
      return NextResponse.json({ error: 'You must be signed in to claim a username.' }, { status: 401 });
    }

    if (!cleanUsername) {
      return NextResponse.json({ error: 'Username is required.' }, { status: 400 });
    }

    if (!USERNAME_REGEX.test(cleanUsername)) {
      return NextResponse.json({
        error: 'Username must be 3-20 characters and contain only letters, numbers, and underscores.',
      }, { status: 400 });
    }

    if (RESERVED_USERNAMES.has(cleanUsername)) {
      return NextResponse.json({
        error: 'This username is reserved by the platform.',
      }, { status: 400 });
    }

    const adminClient = createAdminClient();

    // 1. Check if username is already taken by another account in Auth Users
    const { data: userList } = await adminClient.auth.admin.listUsers();
    if (userList?.users) {
      const takenByUser = userList.users.find(
        (u: any) =>
          u.id !== targetUserId &&
          (u.user_metadata?.username?.toLowerCase() === cleanUsername ||
            u.user_metadata?.preferred_username?.toLowerCase() === cleanUsername)
      );
      if (takenByUser) {
        return NextResponse.json({
          error: `@${cleanUsername} is already claimed by another user.`,
        }, { status: 409 });
      }
    }

    // 2. Also check profiles table if column exists
    try {
      const { data: existingProf, error: profErr } = await adminClient
        .from('profiles')
        .select('id')
        .ilike('username', cleanUsername)
        .neq('id', targetUserId)
        .maybeSingle();

      if (!profErr && existingProf) {
        return NextResponse.json({
          error: `@${cleanUsername} is already claimed by another user.`,
        }, { status: 409 });
      }
    } catch {
      // Column might not exist in database yet; user_metadata check suffices
    }

    // 3. Update auth user metadata (Primary & 100% reliable)
    const { data: targetUserData } = await adminClient.auth.admin.getUserById(targetUserId);
    const existingMeta = targetUserData?.user?.user_metadata || {};

    const { error: metaErr } = await adminClient.auth.admin.updateUserById(targetUserId, {
      user_metadata: {
        ...existingMeta,
        username: cleanUsername,
      },
    });

    if (metaErr) {
      console.error('Failed to update user_metadata username:', metaErr);
      return NextResponse.json({ error: metaErr.message || 'Failed to claim username.' }, { status: 500 });
    }

    // 4. Also update profiles table if column exists (graceful fallback if not migrated yet)
    try {
      const { error: profileErr } = await adminClient
        .from('profiles')
        .update({ username: cleanUsername })
        .eq('id', targetUserId);

      if (profileErr) {
        console.warn('Notice updating profiles.username (column may not exist in DB yet):', profileErr.message);
      }
    } catch (e: any) {
      console.warn('Notice updating profiles table:', e.message);
    }

    return NextResponse.json({
      success: true,
      username: cleanUsername,
      message: `Congratulations! @${cleanUsername} is now your official KorrectPay handle.`,
    });
  } catch (err: any) {
    console.error('Error claiming username:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
