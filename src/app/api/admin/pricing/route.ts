import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  getPricingConfig,
  savePricingConfig,
  computeRetailPrice,
  MarginRule,
} from '@/lib/pricing/pricingStore';
import {
  GONGOZ_DATA_PLANS,
  GONGOZ_CABLE_PLANS,
  GONGOZ_DISCOS,
  GongozDisco,
} from '@/lib/data/gongozCatalog';
import { faddedFetch } from '@/lib/vendors/fadded';
import { GRIZZLY_SERVICES, SMSPOOL_SERVICES } from '@/lib/data/smsCatalog';
import { AI_MARKETPLACE_CATALOG } from '@/lib/data/aiMarketplaceCatalog';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Enforce strict admin authorization
    if (!user) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized. Admin access required.' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const provider = searchParams.get('provider') || 'all';

    const config = await getPricingConfig();

    const result: any = {
      success: true,
      config,
    };

    // If Gongoz requested or all, attach catalog with computed prices
    if (provider === 'all' || provider === 'gongoz') {
      const dataPlansWithPricing = GONGOZ_DATA_PLANS.map((p) => {
        const wholesaleCost = p.price;
        const override = config.gongoz.data.overrides[p.id];
        const { retailPrice, marginAmount, marginPercent, isOverridden } = computeRetailPrice(
          wholesaleCost,
          config.gongoz.data.globalRule,
          override
        );
        return {
          ...p,
          wholesaleCost,
          retailPrice,
          marginAmount,
          marginPercent,
          isOverridden,
        };
      });

      const cableBouquetsWithPricing = GONGOZ_CABLE_PLANS.map((c) => {
        const wholesaleCost = c.price;
        const override = config.gongoz.cable.overrides[c.id];
        const { retailPrice, marginAmount, marginPercent, isOverridden } = computeRetailPrice(
          wholesaleCost,
          config.gongoz.cable.globalRule,
          override
        );
        return {
          ...c,
          wholesaleCost,
          retailPrice,
          marginAmount,
          marginPercent,
          isOverridden,
        };
      });

      const discosWithPricing = GONGOZ_DISCOS.map((d: GongozDisco) => {
        const defaultConvenienceFee = config.gongoz.power.globalRule.value;
        const overrideFee = config.gongoz.power.overrides[d.code];
        const fee = overrideFee !== undefined ? overrideFee : defaultConvenienceFee;
        return {
          ...d,
          convenienceFee: fee,
          isOverridden: overrideFee !== undefined,
        };
      });

      result.gongoz = {
        dataPlans: dataPlansWithPricing,
        cableBouquets: cableBouquetsWithPricing,
        discos: discosWithPricing,
      };
    }

    // If Fadded requested or all, fetch live Fadded products
    if (provider === 'all' || provider === 'fadded') {
      let faddedProducts: any[] = [];
      try {
        const res = await faddedFetch('products');
        if (!res.isMock && res.data) {
          const list = Array.isArray(res.data)
            ? res.data
            : res.data.products || res.data.data || [];
          faddedProducts = list;
        }
      } catch (err) {
        console.warn('Fadded API fetch error in pricing route', err);
      }

      if (faddedProducts.length === 0) {
        // Fallback standard products
        faddedProducts = [
          { id: 'prod_12', name: 'Facebook Aged Account [2017-2019 · 2FA Enabled]', unit_price: 6500, in_stock: 14 },
          { id: 'prod_13', name: 'Instagram Aged Account [Phone Verified · Real Followers]', unit_price: 5200, in_stock: 22 },
          { id: 'prod_14', name: 'Twitter / X Account [2020 Creation · 1,200 Followers]', unit_price: 8500, in_stock: 8 },
          { id: 'prod_15', name: 'NordVPN Premium Account [1 Year Warranty]', unit_price: 4500, in_stock: 35 },
          { id: 'prod_16', name: 'USA Windows RDP [16GB RAM · 8 vCPU · 10Gbps Port]', unit_price: 12000, in_stock: 6 },
        ];
      }

      const productsWithPricing = faddedProducts.map((p: any) => {
        const key = p.product_key || (p.id ? String(p.id) : `prod_${p.product_id}`);
        const wholesaleCost = p.unit_price || p.base_api_price || 1000;
        const override = config.fadded.overrides[key];
        const { retailPrice, marginAmount, marginPercent, isOverridden } = computeRetailPrice(
          wholesaleCost,
          config.fadded.globalRule,
          override
        );

        return {
          id: key,
          product_key: key,
          name: p.name || p.title,
          category: p.category || 'General',
          wholesaleCost,
          retailPrice,
          marginAmount,
          marginPercent,
          isOverridden,
          in_stock: p.in_stock !== undefined ? p.in_stock : 10,
        };
      });

      result.fadded = {
        products: productsWithPricing,
      };
    }

    // If MomoPanel requested or all, fetch live/fallback Momo services
    if (provider === 'all' || provider === 'momo') {
      let momoServices: any[] = [];
      try {
        const { getServices } = await import('@/lib/vendors/momo');
        const res = await getServices();
        if (!res.isMock && res.ok && Array.isArray(res.data)) {
          momoServices = res.data;
        }
      } catch (err) {
        console.warn('Momo API fetch error in pricing route', err);
      }

      if (momoServices.length === 0) {
        // Standard catalog items across platforms
        momoServices = [
          { service: '101', name: 'Instagram High-Quality Followers [Non-Drop • Real Profiles]', category: 'Instagram Followers (Guaranteed)', rate: '1.95', min: '100', max: '50000' },
          { service: '102', name: 'Instagram Fast Likes [Explore Reach • Instant]', category: 'Instagram Likes', rate: '0.45', min: '50', max: '20000' },
          { service: '103', name: 'Instagram Video / Reels Views [High Retention]', category: 'Instagram Views / Reels', rate: '0.12', min: '500', max: '500000' },
          { service: '493', name: 'Instagram Custom Comments | Speed 5K | Instant | Non-Drop', category: 'Instagram Comments', rate: '2.50', min: '5', max: '10000' },
          { service: '201', name: 'TikTok Genuine Followers [Real Accounts • Instant]', category: 'TikTok Followers', rate: '2.40', min: '100', max: '25000' },
          { service: '202', name: 'TikTok Video Likes [Instant Delivery]', category: 'TikTok Likes', rate: '0.65', min: '100', max: '50000' },
          { service: '203', name: 'TikTok FYP Viral Views [100% Non-Drop]', category: 'TikTok Views', rate: '0.15', min: '1000', max: '1000000' },
          { service: '301', name: 'YouTube Monetization Subscribers [Non-Drop • Safe]', category: 'YouTube Subscribers', rate: '9.80', min: '50', max: '5000' },
          { service: '302', name: 'YouTube High Retention Watch Time Views', category: 'YouTube Views', rate: '2.80', min: '500', max: '100000' },
          { service: '303', name: 'YouTube Live Stream Concurrent Viewers [15-30 Mins]', category: 'YouTube Live Stream', rate: '2.10', min: '50', max: '10000' },
          { service: '798', name: 'YouTube Custom Comments | 30K/DAY | super instant | No Refill', category: 'YouTube Comments', rate: '1.80', min: '5', max: '100000' },
          { service: '401', name: 'Twitter / X High Quality Followers', category: 'Twitter Followers', rate: '3.90', min: '100', max: '10000' },
          { service: '402', name: 'Twitter / X Retweets & Quotes', category: 'Twitter Retweets', rate: '2.10', min: '50', max: '10000' },
          { service: '501', name: 'Facebook Page & Profile Followers [Non-Drop]', category: 'Facebook Page Followers', rate: '1.75', min: '100', max: '50000' },
          { service: '502', name: 'Facebook Post Reactions (Like / Love / Care)', category: 'Facebook Post Reactions', rate: '0.48', min: '50', max: '25000' },
          { service: '1094', name: 'Facebook Post Custom Comments [Non-Drop • Real Profiles]', category: 'Facebook Comments', rate: '2.20', min: '5', max: '1000' },
          { service: '601', name: 'Telegram Channel / Group Members [Search Optimized]', category: 'Telegram Members', rate: '1.10', min: '100', max: '50000' },
          { service: '602', name: 'Telegram Post Views [Instant Delivery]', category: 'Telegram Views', rate: '0.18', min: '200', max: '100000' },
        ];
      }

      const usdToNgn = config.momo.usdToNgnRate || 1650;

      const servicesWithPricing = momoServices.map((s: any) => {
        const id = String(s.service || s.serviceId || s.id);
        const usdRate = parseFloat(s.rate) || 0.1;
        // Wholesale NGN cost per 1000 units
        const wholesaleCost = Math.round(usdRate * usdToNgn);
        const override = config.momo.overrides[id];
        const { retailPrice, marginAmount, marginPercent, isOverridden } = computeRetailPrice(
          wholesaleCost,
          config.momo.globalRule,
          override
        );

        return {
          id,
          serviceId: Number(id),
          name: s.name,
          category: s.category || 'General',
          usdRate,
          wholesaleCost,
          retailPrice,
          marginAmount,
          marginPercent,
          isOverridden,
          min: Number(s.min) || 10,
          max: Number(s.max) || 100000,
        };
      });

      result.momo = {
        services: servicesWithPricing,
        usdToNgnRate: usdToNgn,
      };
    }

    // Server 1: GrizzlySMS Catalog & Pricing
    if (provider === 'all' || provider === 'grizzly') {
      const grizzlyRate = config.grizzly?.usdToNgnRate || 1650;
      const grizzlyServices = GRIZZLY_SERVICES.map((s) => {
        const wholesaleCost = Math.round(s.usdCost * grizzlyRate);
        const override = config.grizzly?.overrides?.[s.id];
        const { retailPrice, marginAmount, marginPercent, isOverridden } = computeRetailPrice(
          wholesaleCost,
          config.grizzly?.globalRule || { type: 'percentage', value: 30 },
          override
        );
        return {
          id: s.id,
          name: s.name,
          category: s.category || 'General',
          usdCost: s.usdCost,
          wholesaleCost,
          retailPrice,
          marginAmount,
          marginPercent,
          isOverridden,
        };
      });

      result.grizzly = {
        services: grizzlyServices,
        usdToNgnRate: grizzlyRate,
      };
    }

    // Server 2: SMSPool Catalog & Pricing
    if (provider === 'all' || provider === 'smspool') {
      const smspoolRate = config.smspool?.usdToNgnRate || 1650;
      const smspoolServices = SMSPOOL_SERVICES.map((s) => {
        const wholesaleCost = Math.round(s.usdCost * smspoolRate);
        const override = config.smspool?.overrides?.[s.id];
        const { retailPrice, marginAmount, marginPercent, isOverridden } = computeRetailPrice(
          wholesaleCost,
          config.smspool?.globalRule || { type: 'percentage', value: 25 },
          override
        );
        return {
          id: s.id,
          name: s.name,
          category: s.category || 'General',
          usdCost: s.usdCost,
          wholesaleCost,
          retailPrice,
          marginAmount,
          marginPercent,
          isOverridden,
        };
      });

      result.smspool = {
        services: smspoolServices,
        usdToNgnRate: smspoolRate,
      };
    }

    // Provider: AI Marketplace (AIPlug)
    if (provider === 'all' || provider === 'marketplace') {
      const marketplaceRule = config.marketplace?.globalRule || { type: 'percentage', value: 20 };
      const marketplaceOverrides = config.marketplace?.overrides || {};

      const productsWithPricing = AI_MARKETPLACE_CATALOG.map((p) => {
        const wholesaleCost = p.resellerPriceNgn;
        const override = marketplaceOverrides[p.id];
        const { retailPrice, marginAmount, marginPercent, isOverridden } = computeRetailPrice(
          wholesaleCost,
          marketplaceRule,
          override
        );

        return {
          id: p.id,
          name: p.name,
          category: p.category,
          summary: p.summary,
          description: p.description,
          wholesaleCost,
          retailPrice,
          marginAmount,
          marginPercent,
          isOverridden,
          stock: p.stock,
          accessType: p.accessType,
          warranty: p.warranty,
        };
      });

      result.marketplace = {
        products: productsWithPricing,
        globalRule: marketplaceRule,
      };
    }

    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Enforce strict admin authorization
    if (!user) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized. Admin access required.' }, { status: 403 });
    }

    const body = await request.json();
    const { action, provider, service, itemId, price, rule, rate } = body;

    const currentConfig = await getPricingConfig();
    const updated = JSON.parse(JSON.stringify(currentConfig));

    if (action === 'set_global_rule') {
      if (!rule || !rule.type || typeof rule.value !== 'number') {
        return NextResponse.json({ success: false, error: 'Invalid margin rule provided' }, { status: 400 });
      }

      const normalizedType: 'percentage' | 'fixed' =
        rule.type === 'percent' || rule.type === 'percentage' ? 'percentage' : 'fixed';

      if (provider === 'gongoz') {
        if (service === 'data') {
          updated.gongoz.data.globalRule = { type: normalizedType, value: Number(rule.value) };
        } else if (service === 'cable') {
          updated.gongoz.cable.globalRule = { type: normalizedType, value: Number(rule.value) };
        } else if (service === 'power') {
          updated.gongoz.power.globalRule = { type: normalizedType, value: Number(rule.value) };
        } else {
          return NextResponse.json({ success: false, error: 'Unknown Gongoz service' }, { status: 400 });
        }
      } else if (provider === 'fadded') {
        updated.fadded.globalRule = { type: normalizedType, value: Number(rule.value) };
      } else if (provider === 'momo') {
        updated.momo.globalRule = { type: normalizedType, value: Number(rule.value) };
      } else if (provider === 'grizzly') {
        if (!updated.grizzly) updated.grizzly = { globalRule: { type: 'percentage', value: 30 }, overrides: {} };
        updated.grizzly.globalRule = { type: normalizedType, value: Number(rule.value) };
      } else if (provider === 'smspool') {
        if (!updated.smspool) updated.smspool = { globalRule: { type: 'percentage', value: 25 }, overrides: {} };
        updated.smspool.globalRule = { type: normalizedType, value: Number(rule.value) };
      } else if (provider === 'marketplace') {
        if (!updated.marketplace) updated.marketplace = { globalRule: { type: 'percentage', value: 20 }, overrides: {} };
        updated.marketplace.globalRule = { type: normalizedType, value: Number(rule.value) };
      } else {
        return NextResponse.json({ success: false, error: 'Unknown provider' }, { status: 400 });
      }
    } else if (action === 'set_exchange_rate') {
      if (typeof rate === 'number' && rate > 0) {
        const roundedRate = Math.round(rate);
        if (provider === 'momo') {
          updated.momo.usdToNgnRate = roundedRate;
        } else if (provider === 'grizzly') {
          if (!updated.grizzly) updated.grizzly = { usdToNgnRate: 1650, globalRule: { type: 'percentage', value: 30 }, overrides: {} };
          updated.grizzly.usdToNgnRate = roundedRate;
        } else if (provider === 'smspool') {
          if (!updated.smspool) updated.smspool = { usdToNgnRate: 1650, globalRule: { type: 'percentage', value: 25 }, overrides: {} };
          updated.smspool.usdToNgnRate = roundedRate;
        } else {
          return NextResponse.json({ success: false, error: 'Unknown provider for exchange rate' }, { status: 400 });
        }
      } else {
        return NextResponse.json({ success: false, error: 'Invalid exchange rate' }, { status: 400 });
      }
    } else if (action === 'set_override') {
      if (!itemId || typeof price !== 'number' || price <= 0) {
        return NextResponse.json({ success: false, error: 'Invalid itemId or override price' }, { status: 400 });
      }

      if (provider === 'gongoz') {
        if (service === 'data') {
          updated.gongoz.data.overrides[itemId] = Math.round(price);
        } else if (service === 'cable') {
          updated.gongoz.cable.overrides[itemId] = Math.round(price);
        } else if (service === 'power') {
          updated.gongoz.power.overrides[itemId] = Math.round(price);
        }
      } else if (provider === 'fadded') {
        updated.fadded.overrides[itemId] = Math.round(price);
      } else if (provider === 'momo') {
        updated.momo.overrides[String(itemId)] = Math.round(price);
      } else if (provider === 'grizzly') {
        if (!updated.grizzly) updated.grizzly = { globalRule: { type: 'percentage', value: 30 }, overrides: {} };
        updated.grizzly.overrides[String(itemId)] = Math.round(price);
      } else if (provider === 'smspool') {
        if (!updated.smspool) updated.smspool = { globalRule: { type: 'percentage', value: 25 }, overrides: {} };
        updated.smspool.overrides[String(itemId)] = Math.round(price);
      } else if (provider === 'marketplace') {
        if (!updated.marketplace) updated.marketplace = { globalRule: { type: 'percentage', value: 20 }, overrides: {} };
        updated.marketplace.overrides[String(itemId)] = Math.round(price);
      }
    } else if (action === 'clear_override') {
      if (!itemId) {
        return NextResponse.json({ success: false, error: 'Missing itemId to clear' }, { status: 400 });
      }

      if (provider === 'gongoz') {
        if (service === 'data') {
          delete updated.gongoz.data.overrides[itemId];
        } else if (service === 'cable') {
          delete updated.gongoz.cable.overrides[itemId];
        } else if (service === 'power') {
          delete updated.gongoz.power.overrides[itemId];
        }
      } else if (provider === 'fadded') {
        delete updated.fadded.overrides[itemId];
      } else if (provider === 'momo') {
        delete updated.momo.overrides[String(itemId)];
      } else if (provider === 'grizzly') {
        if (updated.grizzly?.overrides) {
          delete updated.grizzly.overrides[String(itemId)];
        }
      } else if (provider === 'smspool') {
        if (updated.smspool?.overrides) {
          delete updated.smspool.overrides[String(itemId)];
        }
      } else if (provider === 'marketplace') {
        if (updated.marketplace?.overrides) {
          delete updated.marketplace.overrides[String(itemId)];
        }
      }
    } else {
      return NextResponse.json({ success: false, error: `Unknown action: ${action}` }, { status: 400 });
    }

    await savePricingConfig(updated);

    return NextResponse.json({
      success: true,
      message: 'Pricing rule / override saved successfully',
      config: updated,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
