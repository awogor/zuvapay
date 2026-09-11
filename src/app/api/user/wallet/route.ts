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

    let { data: wallet, error: walletError } = await adminClient
      .from('wallets')
      .select('*')
      .eq('user_id', user.id)
      .eq('currency', 'NGN')
      .maybeSingle();

    if (!wallet && !walletError) {
      // Auto-initialize wallet if absent
      const { data: newWallet } = await adminClient
        .from('wallets')
        .insert({ user_id: user.id, balance: 0.0, currency: 'NGN' })
        .select()
        .single();
      wallet = newWallet;
    }

    let transactions: any[] = [];
    if (wallet?.id) {
      const { data: txList } = await adminClient
        .from('transactions')
        .select('*')
        .eq('wallet_id', wallet.id)
        .order('created_at', { ascending: false })
        .limit(50);
      transactions = txList || [];
    }

    return NextResponse.json({
      wallet: wallet
        ? {
            ...wallet,
            balance: parseFloat(wallet.balance),
          }
        : null,
      transactions: transactions.map((t) => ({
        ...t,
        amount: parseFloat(t.amount),
      })),
    });
  } catch (err: any) {
    console.error('Error fetching wallet:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
