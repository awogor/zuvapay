import { NextResponse, type NextRequest } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { buyAirtime } from '@/lib/vendors/strowallet';
import { checkServiceAvailability } from '@/lib/services/serviceStatusStore';

export async function POST(request: NextRequest) {
  try {
    const serviceCheck = checkServiceAvailability('airtime');
    if (!serviceCheck.allowed) {
      return NextResponse.json(
        { success: false, error: serviceCheck.message },
        { status: 503 }
      );
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }
    const body = await request.json();
    const { network, phone, amount, reference } = body;

    if (!network || !phone || !amount || !reference) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameters (network, phone, amount, reference)' },
        { status: 400 }
      );
    }

    const adminSupabase = createAdminClient();
    const isMock = process.env.NEXT_PUBLIC_MOCK_DATA === 'true';

    // Anti-exploit guard: Verify debit transaction in database
    let verifiedTx: any = null;
    if (!isMock) {
      const { data: tx, error: txErr } = await adminSupabase
        .from('transactions')
        .select('*, wallets!inner(user_id)')
        .eq('reference', reference)
        .maybeSingle();

      if (txErr || !tx) {
        return NextResponse.json(
          { success: false, error: 'Debit transaction reference not found or unverified' },
          { status: 400 }
        );
      }

      if (tx.wallets?.user_id !== user.id) {
        return NextResponse.json(
          { success: false, error: 'Unauthorized transaction reference' },
          { status: 403 }
        );
      }

      if (tx.type !== 'debit' || tx.status !== 'completed') {
        return NextResponse.json(
          { success: false, error: 'Transaction is not a verified completed debit' },
          { status: 400 }
        );
      }

      if (parseFloat(amount) < 50) {
        return NextResponse.json(
          { success: false, error: 'Minimum airtime purchase is ₦50' },
          { status: 400 }
        );
      }

      if (Number(tx.amount) < parseFloat(amount)) {
        return NextResponse.json(
          { success: false, error: 'Transaction amount does not match airtime value' },
          { status: 400 }
        );
      }

      if (tx.metadata?.fulfillment_status === 'fulfilled') {
        return NextResponse.json(
          { success: false, error: 'Transaction reference has already been fulfilled' },
          { status: 409 }
        );
      }

      verifiedTx = tx;
    }

    // Call StroWallet API: POST /api/buyairtime/request
    const stroRes = await buyAirtime({
      phone,
      network,
      amount,
    });

    if (!stroRes.isMock) {
      const { data, ok } = stroRes;
      if (!ok || data?.success === false || data?.status === 'failed') {
        return NextResponse.json(
          { 
            success: false, 
            error: data?.message || data?.error || 'StroWallet telco airtime delivery failed' 
          },
          { status: 502 }
        );
      }

      const operatorReference = data?.reference || data?.transaction_id || `STRO-AIR-${Date.now()}`;
      const wholesaleCost = Number((parseFloat(amount) * 0.98).toFixed(2));

      // Mark transaction fulfilled in database
      if (!isMock && verifiedTx) {
        await adminSupabase
          .from('transactions')
          .update({
            metadata: {
              ...(verifiedTx.metadata || {}),
              fulfillment_status: 'fulfilled',
              operatorReference,
              provider: 'strowallet',
              wholesale_cost: wholesaleCost,
              fulfilled_at: new Date().toISOString(),
            },
          })
          .eq('reference', reference);
      }

      return NextResponse.json({
        success: true,
        operatorReference,
        network,
        phone,
        amount,
        provider: 'strowallet',
        wholesaleCost,
      });
    }

    // Realistic simulation fallback for testing
    await new Promise((res) => setTimeout(res, 400));
    if (phone === '08000000000') {
      return NextResponse.json(
        { success: false, error: 'Telco provider network timeout. Automated refund initiated.' },
        { status: 502 }
      );
    }

    const simOperatorRef = `STRO-AIR-${Date.now()}`;
    const simWholesaleCost = Number((parseFloat(amount) * 0.98).toFixed(2));

    if (!isMock && verifiedTx) {
      await adminSupabase
        .from('transactions')
        .update({
          metadata: {
            ...(verifiedTx.metadata || {}),
            fulfillment_status: 'fulfilled',
            operatorReference: simOperatorRef,
            provider: 'strowallet',
            wholesale_cost: simWholesaleCost,
            fulfilled_at: new Date().toISOString(),
          },
        })
        .eq('reference', reference);
    }

    return NextResponse.json({
      success: true,
      operatorReference: simOperatorRef,
      network,
      phone,
      amount,
      provider: 'strowallet',
      wholesaleCost: simWholesaleCost,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
