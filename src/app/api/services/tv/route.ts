import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { gongozFetch, CABLE_IDS } from '@/lib/vendors/gongoz';
import { GONGOZ_CABLE_PLANS } from '@/lib/data/gongozCatalog';

import { getPricingConfig, computeRetailPrice } from '@/lib/pricing/pricingStore';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const provider = searchParams.get('provider')?.toLowerCase();

  const pricingConfig = await getPricingConfig();
  const globalRule = pricingConfig.gongoz.cable.globalRule;
  const overrides = pricingConfig.gongoz.cable.overrides;

  const getPricedBouquets = (prov: string) => {
    return GONGOZ_CABLE_PLANS.filter((p) => p.provider === prov).map((b) => {
      const override = overrides[b.id];
      const { retailPrice } = computeRetailPrice(b.price, globalRule, override);
      return {
        ...b,
        price: retailPrice,
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
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const { provider, iucNumber, bouquetId, customerName, reference } = body;

    const cableId = CABLE_IDS[provider.toLowerCase()] || 1;
    const bouquet = GONGOZ_CABLE_PLANS.find((b) => b.id === bouquetId);

    // Call GongozConcept API endpoint: POST /cablesub/
    const gongozRes = await gongozFetch('cablesub/', {
      method: 'POST',
      body: JSON.stringify({
        cablename: cableId,
        cableplan: bouquet?.gongozPlanId || 1,
        smart_card_number: iucNumber,
      }),
    });

    if (!gongozRes.isMock) {
      const { data, ok } = gongozRes;
      if (!ok || data?.status === 'failed') {
        return NextResponse.json(
          { success: false, error: data?.message || data?.error || 'Cable TV provider activation failed' },
          { status: 502 }
        );
      }

      return NextResponse.json({
        success: true,
        operatorReference: data?.id || `GONGOZ-CAB-${Date.now()}`,
        provider,
        iucNumber,
        bouquetName: bouquet?.name,
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
      operatorReference: `GONGOZ-CAB-${Date.now()}`,
      provider,
      iucNumber,
      bouquetName: bouquet?.name || 'Selected Bouquet',
      customerName: customerName || 'Verified Cable Subscriber',
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
