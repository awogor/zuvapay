import { NextResponse, type NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { sendTransactionalEmail } from '@/lib/email/sendEmail';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const reference = searchParams.get('ref') || searchParams.get('reference');

    if (!reference) {
      return NextResponse.json({ success: false, error: 'Reference required' }, { status: 400 });
    }

    const supabaseAdmin = createAdminClient();

    // 1. Idempotency Check: Was it already credited?
    const { data: existingTx } = await supabaseAdmin
      .from('transactions')
      .select('id, amount, status, wallet_id')
      .eq('reference', reference)
      .maybeSingle();

    if (existingTx) {
      return NextResponse.json({
        success: true,
        alreadyCredited: true,
        message: 'Transaction already credited to wallet',
        amount: existingTx.amount,
      });
    }

    // 2. Query Korapay to verify charge status
    const korapaySecretKey = process.env.KORAPAY_SECRET_KEY;
    const baseUrl = process.env.KORAPAY_BASE_URL || 'https://api.korapay.com/merchant/api/v1';

    if (!korapaySecretKey) {
      return NextResponse.json({ success: false, error: 'Payment gateway configuration missing' }, { status: 500 });
    }

    const korapayRes = await fetch(`${baseUrl}/charges/${encodeURIComponent(reference)}`, {
      headers: {
        Authorization: `Bearer ${korapaySecretKey}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    const resData = await korapayRes.json();

    if (!korapayRes.ok || !resData.status || resData.data?.status !== 'success') {
      return NextResponse.json({
        success: false,
        status: resData.data?.status || 'pending',
        error: resData.message || 'Payment not yet confirmed by gateway',
      }, { status: 200 });
    }

    const chargeData = resData.data;
    const depositAmount = parseFloat(chargeData.amount || chargeData.amount_paid || chargeData.amount_accepted);
    const userId = chargeData.metadata?.user_id;

    if (!userId) {
      return NextResponse.json({ success: false, error: 'User ID missing in payment metadata' }, { status: 400 });
    }

    // 3. Retrieve user wallet
    const { data: wallet, error: walletErr } = await supabaseAdmin
      .from('wallets')
      .select('id, balance, user_id')
      .eq('user_id', userId)
      .eq('currency', 'NGN')
      .single();

    if (walletErr || !wallet) {
      return NextResponse.json({ success: false, error: 'User wallet not found' }, { status: 404 });
    }

    // Double check before atomic update
    const { data: recheckTx } = await supabaseAdmin
      .from('transactions')
      .select('id')
      .eq('reference', reference)
      .maybeSingle();

    if (recheckTx) {
      return NextResponse.json({
        success: true,
        alreadyCredited: true,
        message: 'Transaction already credited to wallet',
        amount: depositAmount,
      });
    }

    // 4. Update wallet balance
    const currentBalance = parseFloat(wallet.balance || 0);
    const newBalance = currentBalance + depositAmount;

    const { error: updateErr } = await supabaseAdmin
      .from('wallets')
      .update({ balance: newBalance, updated_at: new Date().toISOString() })
      .eq('id', wallet.id);

    if (updateErr) {
      return NextResponse.json({ success: false, error: 'Failed to update wallet balance' }, { status: 500 });
    }

    // 5. Insert transaction record
    const payerName =
      chargeData.payer_bank_account?.account_name ||
      chargeData.bank_transfer?.payer_bank_account?.account_name ||
      chargeData.customer?.name ||
      'Online Deposit';

    await supabaseAdmin.from('transactions').insert({
      wallet_id: wallet.id,
      amount: depositAmount,
      type: 'credit',
      category: 'deposit',
      description: `Wallet Deposit via Korapay (${payerName})`,
      reference: reference,
      status: 'completed',
      metadata: {
        gateway: 'korapay',
        method: 'checkout',
        fee: chargeData.fee,
        payerName,
        sessionId: chargeData.session_id,
        customerEmail: chargeData.customer?.email,
      },
    });

    // 6. Send transactional email
    if (chargeData.customer?.email) {
      sendTransactionalEmail({
        to: chargeData.customer.email,
        templateType: 'wallet_credit',
        data: {
          name: chargeData.customer.name || payerName,
          amount: depositAmount,
          newBalance,
          reference,
          payerName,
          bankName: chargeData.payer_bank_account?.bank_name || 'Online Checkout',
          date: new Date().toLocaleString('en-NG'),
        },
      }).catch((err) => console.error('[VERIFY_EMAIL_ERROR]', err));
    }

    return NextResponse.json({
      success: true,
      credited: true,
      amount: depositAmount,
      newBalance,
      reference,
      message: `₦${depositAmount.toLocaleString()} successfully credited to your wallet!`,
    });
  } catch (err: any) {
    console.error('[VERIFY_CHECKOUT_ERROR]', err);
    return NextResponse.json({ success: false, error: err.message || 'Server error' }, { status: 500 });
  }
}
