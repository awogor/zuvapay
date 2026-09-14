import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { DataPlan } from '@/types';
import { gongozFetch, NETWORK_IDS } from '@/lib/vendors/gongoz';
import { GONGOZ_DATA_PLANS } from '@/lib/data/gongozCatalog';
import { getStroWalletDataPlans, buyStroWalletData } from '@/lib/vendors/strowallet';
import { getPricingConfig, computeRetailPrice } from '@/lib/pricing/pricingStore';
import { checkServiceAvailability } from '@/lib/services/serviceStatusStore';

function parseStroDataAmount(name: string): string {
  const match = name.match(/(\d+(?:\.\d+)?\s*(?:MB|GB|TB))/i);
  return match ? match[1].toUpperCase() : 'Data Bundle';
}

function parseStroValidity(name: string): string {
  if (/(\d+\s*days?|daily)/i.test(name)) {
    const dMatch = name.match(/(\d+\s*days?|daily)/i);
    return dMatch ? dMatch[0] : 'Daily';
  }
  if (/weekly|(\d+\s*weeks?)/i.test(name)) return '7 Days';
  if (/monthly|30\s*days?/i.test(name)) return '30 Days';
  if (/night/i.test(name)) return 'Night (12am - 5am)';
  return 'Standard';
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const network = searchParams.get('network');

  const pricingConfig = await getPricingConfig();
  const globalRule = pricingConfig.gongoz.data.globalRule;
  const overrides = pricingConfig.gongoz.data.overrides;

  // Base Gongoz plans (SME, Gifting, Corporate)
  const dynamicallyPricedGongozPlans: DataPlan[] = GONGOZ_DATA_PLANS.map((p) => {
    const override = overrides[p.id];
    const { retailPrice } = computeRetailPrice(p.price, globalRule, override);
    return {
      ...p,
      price: retailPrice,
      vendor: 'gongoz',
    };
  });

  let allPlans = dynamicallyPricedGongozPlans;

  // If a specific network is requested, also fetch live StroWallet Direct plans
  if (network) {
    const netLower = network.toLowerCase();
    const filteredGongoz = dynamicallyPricedGongozPlans.filter(
      (p) => p.network.toLowerCase() === netLower
    );

    let stroPlans: DataPlan[] = [];
    try {
      const liveStroRes = await getStroWalletDataPlans(netLower);
      if (!liveStroRes.isMock && liveResIsOk(liveStroRes)) {
        const rawPlans =
          liveStroRes.data?.data?.varations ||
          liveStroRes.data?.data?.variations ||
          liveStroRes.data?.varations ||
          liveStroRes.data?.variations ||
          [];

        if (Array.isArray(rawPlans) && rawPlans.length > 0) {
          const serviceName = liveStroRes.data?.data?.service_name || `${netLower}-data`;
          const serviceId = liveStroRes.data?.data?.service_id || `${netLower}-data`;

          stroPlans = rawPlans.map((p: any) => {
            const rawPrice = parseFloat(p.variation_amount || p.amount || p.price || '0');
            const variationCode = p.variation_code || p.id;
            const planId = `stro-${netLower}-${variationCode}`;
            const planName = p.name || p.variation_name || `${network} Direct Bundle`;

            return {
              id: planId,
              network: network.toUpperCase(),
              type: 'Direct',
              name: planName,
              validity: parseStroValidity(planName),
              price: Math.round(rawPrice),
              dataAmount: parseStroDataAmount(planName),
              vendor: 'strowallet' as const,
              variationCode,
              serviceName,
              serviceId,
            };
          });
        }
      }
    } catch (err) {
      console.warn('Failed fetching live StroWallet direct data plans:', err);
    }

    return NextResponse.json({
      success: true,
      plans: [...filteredGongoz, ...stroPlans],
    });
  }

  return NextResponse.json({ success: true, plans: allPlans });
}

function liveResIsOk(res: any): boolean {
  return res && res.ok && res.data && (res.data.success === true || res.data.status === 'success' || Array.isArray(res.data?.data?.varations));
}

export async function POST(request: NextRequest) {
  try {
    const serviceCheck = checkServiceAvailability('data');
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
    const { network, phone, planId, vendor, variationCode, serviceName, serviceId, amount } = body;

    // -------------------------------------------------------------
    // 1. STROWALLET DIRECT DATA FULFILLMENT
    // -------------------------------------------------------------
    if (vendor === 'strowallet' || String(planId).startsWith('stro-')) {
      const code = variationCode || String(planId).replace(/^stro-[^-]+-/, '');
      const finalAmount = amount || 100;

      const stroRes = await buyStroWalletData({
        network,
        phone,
        variationCode: code,
        amount: finalAmount,
        serviceName,
        serviceId,
      });

      if (!stroRes.isMock) {
        const { data, ok } = stroRes;
        if (!ok || data?.success === false || data?.error) {
          const errMsg =
            (typeof data?.message === 'string' ? data.message : null) ||
            data?.response?.response_description ||
            data?.error ||
            'StroWallet Direct Data delivery failed';

          return NextResponse.json(
            { success: false, error: errMsg },
            { status: 502 }
          );
        }

        return NextResponse.json({
          success: true,
          operatorReference: data?.response?.transactions?.transactionId || data?.reference || `STRO-DAT-${Date.now()}`,
          network,
          phone,
          planName: body.planName || `${network} Direct Data`,
          price: finalAmount,
          vendor: 'strowallet',
        });
      }

      // Simulation fallback for StroWallet
      await new Promise((res) => setTimeout(res, 500));
      return NextResponse.json({
        success: true,
        operatorReference: `STRO-DAT-${Date.now()}`,
        network,
        phone,
        planName: body.planName || `${network} Direct Data`,
        price: finalAmount,
        vendor: 'strowallet',
      });
    }

    // -------------------------------------------------------------
    // 2. GONGOZ DATA FULFILLMENT (SME, Gifting, Corporate)
    // -------------------------------------------------------------
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
        vendor: 'gongoz',
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
      vendor: 'gongoz',
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
