import { NextResponse, type NextRequest } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { amount, title, reason, originalReference } = body;

    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Valid positive amount required for refund' },
        { status: 400 }
      );
    }

    if (!originalReference) {
      return NextResponse.json(
        { success: false, error: 'Original transaction reference required' },
        { status: 400 }
      );
    }

    const cleanReason = reason
      ? String(reason)
          .replace(/https?:\/\/[^\s)]+/g, '')
          .replace(/smspool\.net|smspool|grizzlysms|grizzly|momo|fadded|gongoz|strowallet/gi, 'provider')
          .replace(/\s+/g, ' ')
          .trim()
      : 'Service Unfulfilled';

    const isMock = process.env.NEXT_PUBLIC_MOCK_DATA === 'true';
    if (isMock) {
      const refundRef = `ZP-REF-MOCK-${Date.now()}`;
      return NextResponse.json({
        success: true,
        refundReference: refundRef,
        message: 'Mock refund accepted',
      });
    }

    const adminSupabase = createAdminClient();

    // 1. Verify original debit transaction belongs to this user
    const { data: origTx, error: txErr } = await adminSupabase
      .from('transactions')
      .select('*, wallets!inner(user_id)')
      .eq('reference', originalReference)
      .maybeSingle();

    if (txErr || !origTx) {
      return NextResponse.json(
        { success: false, error: 'Original transaction reference not found' },
        { status: 404 }
      );
    }

    if (origTx.wallets?.user_id !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized transaction reference' },
        { status: 403 }
      );
    }

    if (origTx.type !== 'debit') {
      return NextResponse.json(
        { success: false, error: 'Only debit transactions are eligible for refund' },
        { status: 400 }
      );
    }

    // Idempotency: Check if already refunded
    if (origTx.metadata?.refunded === true) {
      return NextResponse.json({
        success: true,
        message: 'Transaction has already been refunded',
        refundReference: origTx.metadata?.refund_reference,
      });
    }

    // Guard: Do not refund transactions marked fulfilled by provider
    if (origTx.metadata?.fulfillment_status === 'fulfilled') {
      return NextResponse.json(
        { success: false, error: 'Transaction has already been fulfilled by the provider' },
        { status: 400 }
      );
    }

    // Guard: Prevent refunding more than the original debit amount
    if (numAmount > Number(origTx.amount)) {
      return NextResponse.json(
        { success: false, error: 'Refund amount cannot exceed the original debit amount' },
        { status: 400 }
      );
    }

    const refundReference = `ZP-REF-${originalReference}`;
    const description = `Refund: ${title || 'Service'} (${cleanReason}) [Ref: ${originalReference}]`;

    // 2. Atomic lock: mark original transaction as refund_pending to prevent race condition double-refunds
    const { data: lockTx, error: lockErr } = await adminSupabase
      .from('transactions')
      .update({
        metadata: {
          ...(origTx.metadata || {}),
          refund_in_progress: true,
          refund_reference: refundReference,
        },
      })
      .eq('id', origTx.id)
      .neq('status', 'failed')
      .not('metadata->>refund_in_progress', 'eq', 'true')
      .select('id')
      .maybeSingle();

    if (lockErr || !lockTx) {
      return NextResponse.json(
        { success: false, error: 'Transaction is already refunded or undergoing refund processing' },
        { status: 409 }
      );
    }

    // 3. Execute secure refund RPC using service_role
    const { data: rpcData, error: rpcErr } = await adminSupabase.rpc('refund_wallet_for_bill', {
      p_wallet_id: origTx.wallet_id,
      p_amount: numAmount,
      p_category: 'refund',
      p_description: description,
      p_reference: refundReference,
      p_metadata: {
        original_reference: originalReference,
        refund_reason: cleanReason,
      },
    });

    if (rpcErr || !rpcData?.success) {
      console.error('[Refund RPC Error]', rpcErr || rpcData?.error);
      // Revert lock so user can retry or report
      await adminSupabase
        .from('transactions')
        .update({
          metadata: origTx.metadata || {},
        })
        .eq('id', origTx.id);

      return NextResponse.json(
        { success: false, error: rpcErr?.message || rpcData?.error || 'Refund database execution failed' },
        { status: 500 }
      );
    }

    // 4. Finalize original transaction as failed / refunded
    await adminSupabase
      .from('transactions')
      .update({
        status: 'failed',
        metadata: {
          ...(origTx.metadata || {}),
          refunded: true,
          refund_in_progress: false,
          refund_reason: cleanReason,
          refund_reference: refundReference,
          refunded_at: new Date().toISOString(),
        },
      })
      .eq('id', origTx.id);

    return NextResponse.json({
      success: true,
      refundReference,
      newBalance: rpcData?.new_balance,
    });
  } catch (err: any) {
    console.error('[Wallet Refund Route Error]', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Internal refund error' },
      { status: 500 }
    );
  }
}
