import { NextResponse, type NextRequest } from 'next/server';
import { verifyMeter, verifySmartCard } from '@/lib/vendors/strowallet';

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
      const mtype = meterType?.toLowerCase() === 'postpaid' ? 'postpaid' : 'prepaid';

      // Call StroWallet: POST /api/electricity/verify-merchant
      const res = await verifyMeter({
        meterNumber: account,
        disco: provider,
        meterType: mtype,
      });

      if (!res.isMock) {
        const { data, ok, status } = res;

        // Check for error responses from StroWallet
        if (!ok || data?.success === false || data?.error) {
          const errMsg =
            (typeof data?.message === 'string' ? data.message : null) ||
            (data?.message?.meter_number ? data.message.meter_number[0] : null) ||
            data?.error ||
            'Could not verify meter with selected Disco. Please verify the Disco and meter number.';

          return NextResponse.json(
            { success: false, error: errMsg },
            { status: (status !== undefined && status >= 500) ? 502 : 400 }
          );
        }

        const customerName = data?.customer_name || data?.CustomerName || data?.name || 'Verified Customer';
        const address = data?.address || data?.CustomerAddress || data?.customer_address || 'Service Address Verified';

        return NextResponse.json({
          success: true,
          customerName: customerName.trim(),
          address: address.trim(),
          account,
          provider,
        });
      }
    } else {
      // Cable IUC validation via StroWallet: POST /api/cable-subscription/verify-merchant
      const res = await verifySmartCard({
        serviceId: provider,
        customerId: account,
      });

      if (!res.isMock) {
        const { data, ok, status } = res;

        if (!ok || data?.success === false || data?.error) {
          const errMsg =
            (typeof data?.message === 'string' ? data.message : null) ||
            (data?.message?.customer_id ? data.message.customer_id[0] : null) ||
            data?.error ||
            'Invalid Smartcard / IUC number for selected provider';

          return NextResponse.json(
            { success: false, error: errMsg },
            { status: (status !== undefined && status >= 500) ? 502 : 400 }
          );
        }

        const customerName = data?.customer_name || data?.name || data?.CustomerName || 'Verified Subscriber';

        return NextResponse.json({
          success: true,
          customerName: customerName.trim(),
          account,
          provider,
        });
      }
    }

    // Mock validation fallback
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
