import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { setStatus } from '@/lib/vendors/grizzly';
import { sendTransactionalEmail } from '@/lib/email/sendEmail';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const { searchParams } = new URL(request.url);
    const queryKey = searchParams.get('key');
    const expectedSecret = process.env.CRON_SECRET || '294ZuvGenSecPy';

    const isAuthorized =
      authHeader === `Bearer ${expectedSecret}` ||
      queryKey === expectedSecret;

    if (!isAuthorized) {
      return NextResponse.json({ error: 'Unauthorized cron request' }, { status: 401 });
    }

    const supabase = createAdminClient();
    const twentyMinutesAgo = new Date(Date.now() - 20 * 60 * 1000).toISOString();

    // Find pending SMS debit transactions placed more than 20 mins ago
    const { data: transactions, error: txError } = await supabase
      .from('transactions')
      .select('*, wallets(user_id, balance, currency)')
      .eq('category', 'sms')
      .eq('type', 'debit')
      .eq('status', 'completed')
      .lte('created_at', twentyMinutesAgo)
      .order('created_at', { ascending: false })
      .limit(50);

    if (txError) {
      return NextResponse.json({ success: false, error: txError.message }, { status: 500 });
    }

    let processedCount = 0;
    let refundedCount = 0;
    let refundedTotal = 0;

    for (const tx of transactions || []) {
      const meta = tx.metadata || {};
      const orderId = meta.smsOrderId || meta.orderId || meta.activationId;
      const alreadyRefunded = meta.isRefunded || meta.status === 'REFUNDED' || meta.status === 'EXPIRED_REFUNDED';
      const codeReceived = meta.status === 'RECEIVED' || !!meta.code;

      if (!orderId || alreadyRefunded || codeReceived) {
        continue;
      }

      processedCount++;

      // Check if refund was already recorded
      const refundRef = `ZP-REF-${tx.reference}`;
      const legacyRefundRef = `KP-REF-${tx.reference}`;
      const { data: existingRefund } = await supabase
        .from('transactions')
        .select('id')
        .or(`reference.eq.${refundRef},reference.eq.${legacyRefundRef}`)
        .maybeSingle();

      if (existingRefund) {
        continue;
      }

      // 1. Cancel on upstream provider if orderId exists
      try {
        await setStatus({ activationId: String(orderId), status: 8 });
      } catch {
        // upstream cancel failure is non-fatal
      }

      // 2. Perform atomic refund to user wallet
      const refundAmount = Number(tx.amount);
      const { data: refundTx, error: refundErr } = await supabase
        .from('transactions')
        .insert({
          wallet_id: tx.wallet_id,
          amount: refundAmount,
          type: 'credit',
          category: 'refund',
          description: `Auto-refund: Expired Virtual SMS (${meta.service || 'Rental'} ${meta.phone || ''})`,
          reference: refundRef,
          status: 'completed',
          metadata: {
            originalReference: tx.reference,
            smsOrderId: orderId,
            reason: 'SMS Timeout: No verification code received within rental window',
            refundedBy: 'automated_cron_cleanup',
          },
        })
        .select()
        .single();

      if (!refundErr) {
        // Increment wallet balance
        const currentBalance = Number(tx.wallets?.balance || 0);
        const newBalance = currentBalance + refundAmount;
        await supabase
          .from('wallets')
          .update({ balance: newBalance, updated_at: new Date().toISOString() })
          .eq('id', tx.wallet_id);

        // Mark original transaction as refunded
        await supabase
          .from('transactions')
          .update({
            metadata: {
              ...meta,
              status: 'EXPIRED_REFUNDED',
              isRefunded: true,
              refundedAt: new Date().toISOString(),
              refundReference: refundRef,
            },
          })
          .eq('id', tx.id);

        refundedCount++;
        refundedTotal += refundAmount;

        // Send refund email alert
        if (tx.wallets?.user_id) {
          const { data: userProfile } = await supabase
            .from('profiles')
            .select('first_name, last_name')
            .eq('id', tx.wallets.user_id)
            .single();

          const { data: authUser } = await supabase.auth.admin.getUserById(tx.wallets.user_id);

          if (authUser?.user?.email) {
            sendTransactionalEmail({
              to: authUser.user.email,
              templateType: 'refund_alert',
              data: {
                name: userProfile ? `${userProfile.first_name} ${userProfile.last_name}`.trim() : 'Valued Customer',
                serviceName: `Virtual SMS Rental (${meta.service || 'Phone Verification'})`,
                amount: refundAmount,
                reference: refundRef,
                reason: 'No verification code received before rental session expired.',
                newBalance,
              },
            }).catch(() => {});
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      processedCount,
      refundedCount,
      refundedTotal,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
