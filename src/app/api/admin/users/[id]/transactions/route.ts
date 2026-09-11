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

    // 1. Get user's wallet IDs
    const { data: userWallets } = await adminSupabase
      .from('wallets')
      .select('id, currency, balance')
      .eq('user_id', targetUserId);

    const walletIds = (userWallets || []).map((w: any) => w.id);

    if (walletIds.length === 0) {
      return NextResponse.json({
        success: true,
        transactions: [],
        wallets: [],
      });
    }

    // 2. Fetch transactions for these wallets
    const { data: transactions, error } = await adminSupabase
      .from('transactions')
      .select('*')
      .in('wallet_id', walletIds)
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      transactions: transactions || [],
      wallets: userWallets,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
