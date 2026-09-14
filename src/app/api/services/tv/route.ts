import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { subscribeCableTv, getCableTvPlans } from '@/lib/vendors/strowallet';
import { GONGOZ_CABLE_PLANS } from '@/lib/data/gongozCatalog';
import { getPricingConfig, computeRetailPrice } from '@/lib/pricing/pricingStore';
import { checkServiceAvailability } from '@/lib/services/serviceStatusStore';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const provider = searchParams.get('provider')?.toLowerCase();

  const pricingConfig = await getPricingConfig();
  const globalRule = pricingConfig.gongoz.cable.globalRule;
  const overrides = pricingConfig.gongoz.cable.overrides;

  // Try live StroWallet plans if provider requested
  if (provider) {
    try {
      const liveRes = await getCableTvPlans(provider);
      if (!liveRes.isMock && liveRes.ok && liveRes.data) {
        const rawPlans =
          liveRes.data?.data?.varations ||
          liveRes.data?.varations ||
          liveRes.data?.data?.variations ||
          liveRes.data?.variations ||
          (Array.isArray(liveRes.data) ? liveRes.data : liveRes.data?.plans || liveRes.data?.data);
        if (Array.isArray(rawPlans) && rawPlans.length > 0) {
          const mapped = rawPlans.map((p: any) => {
            const rawPrice = parseFloat(p.variation_amount || p.amount || p.price || '0');
            const planId = p.variation_code || p.id || String(p.service_name);
            // Cable TV has NO fees / markups added; sell at exact face-value amount
            return {
              id: planId,
              name: p.name || p.variation_name || p.service_name,
              price: Math.round(rawPrice),
              variationCode: p.variation_code || planId,
              provider,
            };
          });

          return NextResponse.json({
            success: true,
            bouquets: mapped,
          });
        }
      }
    } catch {
      // Graceful fallback to static catalog
    }
  }

  const getPricedBouquets = (prov: string) => {
    return GONGOZ_CABLE_PLANS.filter((p) => p.provider === prov).map((b) => {
      // Cable TV has NO fees / markups added; sell at exact face-value amount
      return {
        ...b,
        price: b.price,
        variationCode: b.id,
      };
    });
  };

  const dynamicCableBouquets = {
    dstv: getPricedBouquets('dstv'),
    gotv: getPricedBouquets('gotv'),
    startimes: getPricedBouquets('startimes'),
  };

  if (provider && dynamicCableBouquets[provider as keyof typeof dynamicCableBouquets]) {
    return NextResponse.json({
      success: true,
      bouquets: dynamicCableBouquets[provider as keyof typeof dynamicCableBouquets],
    });
  }

  return NextResponse.json({ success: true, all: dynamicCableBouquets });
}

export async function POST(request: NextRequest) {
  try {
    const serviceCheck = checkServiceAvailability('tv');
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
    const { provider, iucNumber, bouquetId, customerName, reference, amount, phone } = body;

    const bouquet = GONGOZ_CABLE_PLANS.find((b) => b.id === bouquetId);
    const bouquetName = bouquet?.name || body.bouquetName || 'Cable Bouquet';
    const variationCode = body.variationCode || bouquetId;
    const userPhone = phone || user.phone || user.user_metadata?.phone || user.user_metadata?.phone_number || '08012345678';
    const finalAmount = amount || bouquet?.price || 1000;

    // Call StroWallet API: POST /api/cable-subscription/request
    const stroRes = await subscribeCableTv({
      serviceId: provider,
      serviceName: bouquetName,
      variationCode,
      customerId: iucNumber,
      amount: finalAmount,
      phone: userPhone,
    });

    if (!stroRes.isMock) {
      const { data, ok } = stroRes;
      if (!ok || data?.success === false || data?.error) {
        const errMsg =
          (typeof data?.message === 'string' ? data.message : null) ||
          data?.response?.response_description ||
          data?.error ||
          'Cable TV provider activation failed';

        return NextResponse.json(
          { success: false, error: errMsg },
          { status: 502 }
        );
      }

      return NextResponse.json({
        success: true,
        operatorReference: data?.response?.transactions?.transactionId || data?.reference || `STRO-CAB-${Date.now()}`,
        provider,
        iucNumber,
        bouquetName,
      });
    }

    // Simulation
    await new Promise((res) => setTimeout(res, 500));

    if (iucNumber === '0000000000') {
      return NextResponse.json(
        { success: false, error: 'IUC card rejected by broadcast provider. Automated refund initiated.' },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      operatorReference: `STRO-CAB-${Date.now()}`,
      provider,
      iucNumber,
      bouquetName,
      customerName: customerName || 'Verified Cable Subscriber',
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
