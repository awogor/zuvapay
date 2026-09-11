import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { gongozFetch, NETWORK_IDS } from '@/lib/vendors/gongoz';

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

    const netUpper = network.toUpperCase();
    const networkId = NETWORK_IDS[netUpper] || 1;

    // Call GongozConcept API endpoint: POST /topup/
    const gongozRes = await gongozFetch('topup/', {
      method: 'POST',
      body: JSON.stringify({
        network: networkId,
        amount: parseFloat(amount),
        mobile_number: phone,
        Ported_number: true,
        airtime_type: 'VTU',
      }),
    });

    if (!gongozRes.isMock) {
      const { data, ok } = gongozRes;
      if (!ok || data?.status === 'failed') {
        return NextResponse.json(
          { success: false, error: data?.message || data?.error || 'GongozConcept rejected airtime recharge' },
          { status: 502 }
        );
      }

      return NextResponse.json({
        success: true,
        operatorReference: data?.id || data?.operator_ref || `GONGOZ-AIR-${Date.now()}`,
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
      operatorReference: `GONGOZ-AIR-${Date.now()}`,
      network,
      phone,
      amount,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
