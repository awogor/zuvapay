import { NextResponse, type NextRequest } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { sendTransactionalEmail } from '@/lib/email/sendEmail';

export async function POST(request: NextRequest) {
  try {
    // 1. Admin Authentication & Role Authorization
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

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
    const { transactionId, reason } = body;

    if (!transactionId) {
      return NextResponse.json({ success: false, error: 'Transaction ID is required' }, { status: 400 });
    }

    const adminSupabase = createAdminClient();

    // 2. Fetch target transaction with wallet
    const { data: origTx, error: txErr } = await adminSupabase
      .from('transactions')
      .select('*, wallets!inner(user_id, balance)')
      .eq('id', transactionId)
      .maybeSingle();

    if (txErr || !origTx) {
      return NextResponse.json({ success: false, error: 'Transaction not found' }, { status: 404 });
    }

    if (origTx.type !== 'debit') {
      return NextResponse.json({ success: false, error: 'Only debit transactions are eligible for refund' }, { status: 400 });
    }

    if (origTx.metadata?.refunded === true) {
      return NextResponse.json({ success: false, error: 'Transaction has already been refunded' }, { status: 409 });
    }

    const cleanReason = reason?.trim() || 'Admin manual refund';
    const numAmount = Number(origTx.amount);
    const refundReference = `KP-REF-${origTx.reference}`;
    const description = `Admin Refund: ${origTx.description || 'Service'} (${cleanReason}) [Ref: ${origTx.reference}]`;

    // 3. Execute atomic refund RPC using service_role
    const { data: rpcData, error: rpcErr } = await adminSupabase.rpc('refund_wallet_for_bill', {
      p_wallet_id: origTx.wallet_id,
      p_amount: numAmount,
      p_category: 'refund',
      p_description: description,
      p_reference: refundReference,
      p_metadata: {
        original_reference: origTx.reference,
        refund_reason: cleanReason,
        admin_refunded_by: user.email,
        admin_refunded_at: new Date().toISOString(),
      },
    });

    if (rpcErr || !rpcData?.success) {
      console.error('[ADMIN_REFUND_RPC_ERROR]', rpcErr || rpcData?.error);
      return NextResponse.json(
        { success: false, error: rpcData?.error || rpcErr?.message || 'Failed to credit customer wallet' },
        { status: 500 }
      );
    }

    // 4. Update original transaction metadata
    const updatedMeta = {
      ...(origTx.metadata || {}),
      refunded: true,
      refund_reference: refundReference,
      refund_reason: cleanReason,
      admin_refunded_by: user.email,
      admin_refunded_at: new Date().toISOString(),
    };

    await adminSupabase
      .from('transactions')
      .update({
        status: 'refunded',
        metadata: updatedMeta,
      })
      .eq('id', origTx.id);

    // 5. Notify customer via transactional email
    const { data: customerProfile } = await adminSupabase
      .from('profiles')
      .select('first_name, last_name, email')
      .eq('id', origTx.wallets.user_id)
      .maybeSingle();

    const customerEmail =
      origTx.metadata?.customerEmail ||
      customerProfile?.email ||
      origTx.user_email;

    if (customerEmail) {
      const customerName = customerProfile?.first_name || 'Valued Customer';
      sendTransactionalEmail({
        to: customerEmail,
        templateType: 'refund_alert',
        data: {
          name: customerName,
          serviceName: origTx.description || 'Digital Order',
          amount: numAmount,
          reference: refundReference,
          reason: cleanReason,
          newBalance: rpcData.new_balance,
        },
      }).catch((emailErr) => console.warn('[ADMIN_REFUND_EMAIL_FAILED]', emailErr.message));
    }

    return NextResponse.json({
      success: true,
      message: `₦${numAmount.toLocaleString()} successfully refunded to customer wallet!`,
      refundReference,
      newBalance: rpcData.new_balance,
      transaction: { ...origTx, status: 'refunded', metadata: updatedMeta },
    });
  } catch (err: any) {
    console.error('Admin Refund Error:', err);
    return NextResponse.json({ success: false, error: err.message || 'Internal refund execution error' }, { status: 500 });
  }
}
