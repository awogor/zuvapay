import { NextResponse, type NextRequest } from 'next/server';
import { gongozFetch, DISCO_IDS, CABLE_IDS } from '@/lib/vendors/gongoz';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, account, provider, meterType } = body;

    if (!account || !provider) {
      return NextResponse.json(
        { success: false, error: 'Account number and provider required' },
        { status: 400 }
      );
    }

    if (type === 'electricity') {
      const discoId = DISCO_IDS[provider.toLowerCase()] || 1;
      const mtype = meterType?.toLowerCase() === 'postpaid' ? 'Postpaid' : 'Prepaid';

      // Gongoz spec: GET /validatemeter?meternumber=meter&disconame=id&mtype=metertype
      const res = await gongozFetch(
        `validatemeter?meternumber=${account}&disconame=${discoId}&mtype=${mtype}`
      );

      if (!res.isMock) {
        const { data, ok } = res;
        if (!ok || data?.status === 'failed' || data?.invalid) {
          return NextResponse.json(
            { success: false, error: data?.message || 'Could not verify meter with selected Disco. Please verify the Disco and meter number.' },
            { status: 400 }
          );
        }

        return NextResponse.json({
          success: true,
          customerName: data?.name || data?.customer_name || 'Verified Customer',
          address: data?.address || 'Service Address Verified',
          account,
          provider,
        });
      }
    } else {
      // Cable IUC validation: GET /validateiuc?smart_card_number=iuc&cablename=id
      const cableId = CABLE_IDS[provider.toLowerCase()] || 1;
      const res = await gongozFetch(
        `validateiuc?smart_card_number=${account}&cablename=${cableId}`
      );

      if (!res.isMock) {
        const { data, ok } = res;
        if (!ok || data?.status === 'failed' || data?.invalid) {
          return NextResponse.json(
            { success: false, error: data?.message || 'Invalid IUC number for selected provider' },
            { status: 400 }
          );
        }

        return NextResponse.json({
          success: true,
          customerName: data?.name || data?.customer_name || 'Verified Subscriber',
          account,
          provider,
        });
      }
    }

    // Mock validation
    await new Promise((res) => setTimeout(res, 350));

    if (account.length < 8) {
      return NextResponse.json(
        { success: false, error: 'Account number must be at least 8 digits' },
        { status: 400 }
      );
    }

    const mockCustomers: Record<string, string> = {
      '0123456789': 'Alhaji Ibrahim Danladi',
      '1122334455': 'Mrs. Chioma Okonkwo',
      '9988776655': 'Dr. Babatunde Raji',
      '0801234567': 'Mr. Emmanuel Adeleke',
    };

    const customerName = mockCustomers[account] || 'Alhaji Musa Mohammed';
    const address = 'Plot 14, Admiralty Way, Lekki Phase 1, Lagos';

    return NextResponse.json({
      success: true,
      customerName,
      address: type === 'electricity' ? address : undefined,
      account,
      provider,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
