import { getPricingConfigSync, computeRetailPrice } from './pricingStore';
import { GRIZZLY_SERVICES, SMSPOOL_SERVICES } from '../data/smsCatalog';
import { getPrices } from '../vendors/grizzly';
import { getSMSPoolPrice } from '../vendors/smspool';

export interface SMSPriceQuote {
  server: 'server1' | 'server2';
  countryCode: string | number;
  countryName?: string;
  serviceId: string;
  serviceName?: string;
  usdCost: number;
  usdToNgnRate: number;
  wholesaleNgn: number;
  retailPrice: number;
  marginAmount: number;
  marginPercent: number;
  isOverridden: boolean;
  isLive: boolean;
  successRate?: number;
}

/**
 * Calculates genuine dynamic SMS price for GrizzlySMS (Server 1) or SMSPool (Server 2):
 * 1. Checks live carrier wholesale quote from vendor API (USD or converted from RUB).
 * 2. Falls back to verified catalog wholesale USD cost if vendor offline/mock.
 * 3. Converts wholesale USD to NGN using the configured admin exchange rate.
 * 4. Applies configured admin margin rule (% or ₦) or service-level manual override.
 */
export async function getDynamicSMSQuote(options: {
  server: 'server1' | 'server2';
  countryCode: string | number;
  countryName?: string;
  serviceId: string;
  serviceName?: string;
  costMultiplier?: number;
}): Promise<SMSPriceQuote> {
  const { server, countryCode, countryName, serviceId, serviceName, costMultiplier = 1.0 } = options;
  const config = getPricingConfigSync();

  // ---------------------------------------------
  // SERVER 2: SMSPool
  // ---------------------------------------------
  if (server === 'server2') {
    const smspoolConfig = config.smspool || {
      usdToNgnRate: 1650,
      globalRule: { type: 'percentage', value: 25 },
      overrides: {},
    };
    const rate = smspoolConfig.usdToNgnRate || 1650;
    const rule = smspoolConfig.globalRule || { type: 'percentage', value: 25 };
    const override = smspoolConfig.overrides?.[String(serviceId)];

    let liveUsdCost: number | null = null;
    let liveSuccessRate: number | undefined = undefined;

    try {
      const liveData = await getSMSPoolPrice({
        country: countryCode,
        service: serviceId,
      });
      if (liveData && typeof liveData.price === 'number' && liveData.price > 0) {
        liveUsdCost = liveData.price;
        liveSuccessRate = liveData.successRate;
      }
    } catch (err) {
      console.warn('[SMSPool] Live price check error:', err);
    }

    const isLive = liveUsdCost !== null;
    const catalogItem = SMSPOOL_SERVICES.find((s) => s.id === String(serviceId));
    const baseUsd = liveUsdCost ?? (catalogItem?.usdCost || 0.60);
    // Apply country cost multiplier if using catalog fallback
    const finalUsd = isLive ? baseUsd : baseUsd * costMultiplier;

    const wholesaleNgn = Math.round(finalUsd * rate);
    const { retailPrice, marginAmount, marginPercent, isOverridden } = computeRetailPrice(
      wholesaleNgn,
      rule,
      override
    );

    return {
      server: 'server2',
      countryCode,
      countryName,
      serviceId: String(serviceId),
      serviceName: serviceName || catalogItem?.name,
      usdCost: Number(finalUsd.toFixed(2)),
      usdToNgnRate: rate,
      wholesaleNgn,
      retailPrice,
      marginAmount,
      marginPercent,
      isOverridden,
      isLive,
      successRate: liveSuccessRate,
    };
  }

  // ---------------------------------------------
  // SERVER 1: GrizzlySMS
  // ---------------------------------------------
  const grizzlyConfig = config.grizzly || {
    usdToNgnRate: 1650,
    globalRule: { type: 'percentage', value: 30 },
    overrides: {},
  };
  const rate = grizzlyConfig.usdToNgnRate || 1650;
  const rule = grizzlyConfig.globalRule || { type: 'percentage', value: 30 };
  const override = grizzlyConfig.overrides?.[String(serviceId).toLowerCase()];

  let liveUsdCost: number | null = null;

  try {
    const liveData = await getPrices({
      service: String(serviceId),
      country: countryCode,
    });
    if (liveData && liveData.cost > 0) {
      // Standard Grizzly accounts return prices in Russian Rubles (RUB)
      // Conversion ~95 RUB per USD
      if (liveData.cost > 3) {
        liveUsdCost = liveData.cost / 95;
      } else {
        liveUsdCost = liveData.cost;
      }
    }
  } catch (err) {
    console.warn('[GrizzlySMS] Live price check error:', err);
  }

  const isLive = liveUsdCost !== null;
  const catalogItem = GRIZZLY_SERVICES.find(
    (s) => s.id.toLowerCase() === String(serviceId).toLowerCase()
  );
  const baseUsd = liveUsdCost ?? (catalogItem?.usdCost || 0.40);
  const finalUsd = isLive ? baseUsd : baseUsd * costMultiplier;

  const wholesaleNgn = Math.round(finalUsd * rate);
  const { retailPrice, marginAmount, marginPercent, isOverridden } = computeRetailPrice(
    wholesaleNgn,
    rule,
    override
  );

  return {
    server: 'server1',
    countryCode,
    countryName,
    serviceId: String(serviceId),
    serviceName: serviceName || catalogItem?.name,
    usdCost: Number(finalUsd.toFixed(2)),
    usdToNgnRate: rate,
    wholesaleNgn,
    retailPrice,
    marginAmount,
    marginPercent,
    isOverridden,
    isLive,
  };
}
