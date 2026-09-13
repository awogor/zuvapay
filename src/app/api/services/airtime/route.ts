import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { buyAirtime } from '@/lib/vendors/strowallet';

export async function POST(request: NextRequest) {
  try {
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

      return NextResponse.json({
        success: true,
        operatorReference: data?.reference || data?.transaction_id || `STRO-AIR-${Date.now()}`,
        network,
        phone,
        amount,
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

    return NextResponse.json({
      success: true,
      operatorReference: `STRO-AIR-${Date.now()}`,
      network,
      phone,
      amount,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
