import { NextResponse, type NextRequest } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';

const FALLBACK_USERS = [
  {
    id: '00000000-0000-0000-0000-000000000001',
    role: 'admin',
    email: 'admin@zuvapay.com',
    title: 'Mr',
    first_name: 'David',
    last_name: 'Adeleke (Admin)',
    phone_number: '08031234567',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ZuvaUser1',
    status: 'active',
    is_pin_set: true,
    created_at: new Date().toISOString(),
    wallets: [
      {
        id: 'mock-wallet-00000000-0000-0000-0000-000000000001',
        balance: 42800,
        currency: 'NGN',
      },
    ],
    virtual_accounts: [
      {
        bank_name: 'Wema Bank',
        account_number: '9902819201',
        account_name: 'David Adeleke / ZuvaPay',
        status: 'active',
      },
    ],
  },
  {
    id: 'mock-user-customer-1',
    role: 'customer',
    email: 'amara.eze@example.com',
    title: 'Ms',
    first_name: 'Amara',
    last_name: 'Eze',
    phone_number: '08129876543',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=AmaraEze',
    status: 'active',
    is_pin_set: false,
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    wallets: [
      {
        id: 'mock-wallet-customer-1',
        balance: 15400,
        currency: 'NGN',
      },
    ],
    virtual_accounts: [
      {
        bank_name: 'Sterling Bank',
        account_number: '8810294821',
        account_name: 'Amara Eze / ZuvaPay',
        status: 'active',
      },
    ],
  },
  {
    id: 'mock-user-customer-2',
    role: 'customer',
    email: 'tunde.bakare@example.com',
    title: 'Mr',
    first_name: 'Tunde',
    last_name: 'Bakare',
    phone_number: '09012348765',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=TundeBakare',
    status: 'suspended',
    is_pin_set: true,
    created_at: new Date(Date.now() - 86400000 * 7).toISOString(),
    wallets: [
      {
        id: 'mock-wallet-customer-2',
        balance: 5000,
        currency: 'NGN',
      },
    ],
    virtual_accounts: [
      {
        bank_name: 'Fidelity Bank',
        account_number: '7729104829',
        account_name: 'Tunde Bakare / ZuvaPay',
        status: 'active',
      },
    ],
  },
];

export async function GET() {
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

    const adminSupabase = createAdminClient();
    const { data: authUsersRes } = await adminSupabase.auth.admin.listUsers().catch(() => ({ data: { users: [] } }));
    let profilesData: any[] | null = null;

    // Try full select with new moderation columns first
    const { data: fullProfiles, error: fullError } = await adminSupabase
      .from('profiles')
      .select(`
        id,
        role,
        status,
        is_pin_set,
        pin_updated_at,
        title,
        first_name,
        last_name,
        phone_number,
        avatar_url,
        created_at,
        wallets (id, balance, currency),
        virtual_accounts (bank_name, account_number, account_name, status)
      `)
      .order('created_at', { ascending: false });

    if (!fullError && fullProfiles) {
      profilesData = fullProfiles;
    } else {
      // Fallback to base profiles columns if schema migration hasn't added status/is_pin_set yet
      console.warn('Profiles query with new columns failed, falling back to base columns:', fullError?.message);
      const { data: baseProfiles, error: baseError } = await adminSupabase
        .from('profiles')
        .select(`
          id,
          role,
          title,
          first_name,
          last_name,
          phone_number,
          avatar_url,
          created_at,
          wallets (id, balance, currency),
          virtual_accounts (bank_name, account_number, account_name, status)
        `)
        .order('created_at', { ascending: false });

      if (baseError) {
        console.error('Supabase base profiles query error in /api/admin/users:', baseError);
        return NextResponse.json({ success: false, error: baseError.message, users: [] }, { status: 500 });
      }
      profilesData = baseProfiles || [];
    }

    if (!profilesData || profilesData.length === 0) {
      return NextResponse.json({ success: true, users: [] });
    }

    const emailMap = new Map<string, string>();
    authUsersRes?.users?.forEach((u: any) => {
      if (u.id && u.email) emailMap.set(u.id, u.email);
    });

    const enrichedProfiles = profilesData.map((p: any) => ({
      ...p,
      status: p.status || 'active',
      is_pin_set: Boolean(p.is_pin_set),
      email: emailMap.get(p.id) || (p as any).email || null,
    }));

    return NextResponse.json({ success: true, users: enrichedProfiles });
  } catch (err: any) {
    console.error('Error fetching admin users:', err);
    return NextResponse.json({ success: false, error: err.message, users: [] }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
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

    const body = await request.json();
    const { targetUserId, action, role, status } = body;

    if (!targetUserId) {
      return NextResponse.json({ success: false, error: 'Target user ID is required' }, { status: 400 });
    }

    const adminSupabase = createAdminClient();

    // 1. Role modification (legacy & new)
    if (action === 'change_role' || role) {
      const newRole = role;
      if (!['admin', 'customer'].includes(newRole)) {
        return NextResponse.json({ success: false, error: 'Invalid role parameter' }, { status: 400 });
      }

      const { error: updateError } = await adminSupabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', targetUserId);

      if (updateError) {
        return NextResponse.json({ success: false, error: updateError.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, message: `Updated user role to ${newRole}` });
    }

    // 2. Status change: suspend, unsuspend, block, unblock
    if (action === 'change_status') {
      if (!['active', 'suspended', 'blocked'].includes(status)) {
        return NextResponse.json({ success: false, error: 'Invalid status parameter' }, { status: 400 });
      }

      const { error: updateError } = await adminSupabase
        .from('profiles')
        .update({ status })
        .eq('id', targetUserId);

      if (updateError) {
        return NextResponse.json({ success: false, error: updateError.message }, { status: 500 });
      }

      const statusLabels: Record<string, string> = {
        active: 'Account restored to Active',
        suspended: 'Account Suspended (Transactions Disabled)',
        blocked: 'Account Blocked (Access Locked)',
      };

      return NextResponse.json({
        success: true,
        message: statusLabels[status] || `Account status changed to ${status}`,
        status,
      });
    }

    // 3. Reset 4-digit transaction PIN
    if (action === 'reset_pin') {
      const { error: resetError } = await adminSupabase
        .from('profiles')
        .update({
          is_pin_set: false,
          transaction_pin_hash: null,
          pin_updated_at: new Date().toISOString(),
        })
        .eq('id', targetUserId);

      if (resetError) {
        return NextResponse.json({ success: false, error: resetError.message }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        message: 'Transaction PIN reset successfully. User will be required to create a new 4-digit PIN upon next sign-in.',
      });
    }

    return NextResponse.json({ success: false, error: `Unknown action: ${action}` }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
