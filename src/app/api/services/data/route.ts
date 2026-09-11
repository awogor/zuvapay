import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { DataPlan } from '@/types';
import { gongozFetch, NETWORK_IDS } from '@/lib/vendors/gongoz';
import { GONGOZ_DATA_PLANS } from '@/lib/data/gongozCatalog';

import { getPricingConfig, computeRetailPrice } from '@/lib/pricing/pricingStore';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const network = searchParams.get('network');

  const pricingConfig = await getPricingConfig();
  const globalRule = pricingConfig.gongoz.data.globalRule;
  const overrides = pricingConfig.gongoz.data.overrides;

  const dynamicallyPricedPlans = GONGOZ_DATA_PLANS.map((p) => {
    const override = overrides[p.id];
    const { retailPrice } = computeRetailPrice(p.price, globalRule, override);
    return {
      ...p,
      price: retailPrice,
    };
  });

  if (network) {
    const filtered = dynamicallyPricedPlans.filter(
      (p) => p.network.toLowerCase() === network.toLowerCase()
    );
    return NextResponse.json({ success: true, plans: filtered });
  }

  return NextResponse.json({ success: true, plans: dynamicallyPricedPlans });
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const { network, phone, planId, reference } = body;

    const plan = GONGOZ_DATA_PLANS.find((p) => p.id === planId);
    if (!plan) {
      return NextResponse.json(
        { success: false, error: 'Invalid data plan selected' },
        { status: 400 }
      );
    }

    const netUpper = network.toUpperCase();
    const networkId = NETWORK_IDS[netUpper] || 1;

    // Call GongozConcept API endpoint: POST /data/
    const gongozRes = await gongozFetch('data/', {
      method: 'POST',
      body: JSON.stringify({
        network: networkId,
        mobile_number: phone,
        plan: plan.gongozPlanId || 8,
        Ported_number: true,
      }),
    });

    if (!gongozRes.isMock) {
      const { data, ok } = gongozRes;
      if (!ok || data?.status === 'failed') {
        return NextResponse.json(
          { success: false, error: data?.message || data?.error || 'GongozConcept data delivery failed' },
          { status: 502 }
        );
      }

      return NextResponse.json({
        success: true,
        operatorReference: data?.id || data?.operator_ref || `GONGOZ-DAT-${Date.now()}`,
        network,
        phone,
        planName: plan.name,
        price: plan.price,
      });
    }

    // Realistic Simulation
    await new Promise((res) => setTimeout(res, 500));
    if (phone === '08000000000') {
      return NextResponse.json(
        { success: false, error: 'Telco SME gateway congestion. Automated refund initiated.' },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      operatorReference: `GONGOZ-DAT-${Date.now()}`,
      network,
      phone,
      planName: plan.name,
      price: plan.price,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
