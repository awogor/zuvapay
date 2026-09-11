import fs from 'fs';
import path from 'path';

export interface MarginRule {
  type: 'percentage' | 'percent' | 'fixed';
  value: number;
}

export interface GongozPricingConfig {
  data: {
    globalRule: MarginRule;
    overrides: Record<string, number>; // planId -> retail price NGN
  };
  cable: {
    globalRule: MarginRule;
    overrides: Record<string, number>; // bouquetId -> retail price NGN
  };
  power: {
    globalRule: MarginRule;
    overrides: Record<string, number>; // discoCode -> convenience fee NGN
  };
}

export interface FaddedPricingConfig {
  globalRule: MarginRule;
  overrides: Record<string, number>; // productId / productKey -> retail price NGN
}

export interface MomoPricingConfig {
  usdToNgnRate: number; // e.g. 1650
  globalRule: MarginRule; // e.g. { type: 'percentage', value: 45 }
  overrides: Record<string, number>; // serviceId -> retail price NGN per 1000
}

export interface GrizzlyPricingConfig {
  usdToNgnRate: number; // e.g. 1650
  globalRule: MarginRule; // e.g. { type: 'percentage', value: 30 }
  overrides: Record<string, number>; // serviceId -> base retail price NGN
}

export interface SMSPoolPricingConfig {
  usdToNgnRate: number; // e.g. 1650
  globalRule: MarginRule; // e.g. { type: 'percentage', value: 25 }
  overrides: Record<string, number>; // serviceId -> base retail price NGN
}

export interface ProviderPricingConfig {
  gongoz: GongozPricingConfig;
  fadded: FaddedPricingConfig;
  momo: MomoPricingConfig;
  grizzly: GrizzlyPricingConfig;
  smspool: SMSPoolPricingConfig;
  updatedAt?: string;
}

const DEFAULT_CONFIG: ProviderPricingConfig = {
  gongoz: {
    data: {
      globalRule: { type: 'percentage', value: 10 },
      overrides: {},
    },
    cable: {
      globalRule: { type: 'fixed', value: 100 },
      overrides: {},
    },
    power: {
      globalRule: { type: 'fixed', value: 100 },
      overrides: {},
    },
  },
  fadded: {
    globalRule: { type: 'percentage', value: 25 },
    overrides: {},
  },
  momo: {
    usdToNgnRate: 1650,
    globalRule: { type: 'percentage', value: 45 },
    overrides: {},
  },
  grizzly: {
    usdToNgnRate: 1650,
    globalRule: { type: 'percentage', value: 30 },
    overrides: {},
  },
  smspool: {
    usdToNgnRate: 1650,
    globalRule: { type: 'percentage', value: 25 },
    overrides: {},
  },
};

const CONFIG_FILE_PATH = path.join(process.cwd(), 'src', 'lib', 'data', 'pricingRules.json');

// In-memory cache for ultra-fast access
let inMemoryConfig: ProviderPricingConfig | null = null;

export function getPricingConfigSync(): ProviderPricingConfig {
  if (inMemoryConfig) return inMemoryConfig;

  try {
    if (fs.existsSync(CONFIG_FILE_PATH)) {
      const content = fs.readFileSync(CONFIG_FILE_PATH, 'utf-8');
      const parsed = JSON.parse(content);
      inMemoryConfig = {
        gongoz: {
          data: {
            globalRule: parsed?.gongoz?.data?.globalRule || DEFAULT_CONFIG.gongoz.data.globalRule,
            overrides: parsed?.gongoz?.data?.overrides || {},
          },
          cable: {
            globalRule: parsed?.gongoz?.cable?.globalRule || DEFAULT_CONFIG.gongoz.cable.globalRule,
            overrides: parsed?.gongoz?.cable?.overrides || {},
          },
          power: {
            globalRule: parsed?.gongoz?.power?.globalRule || DEFAULT_CONFIG.gongoz.power.globalRule,
            overrides: parsed?.gongoz?.power?.overrides || {},
          },
        },
        fadded: {
          globalRule: parsed?.fadded?.globalRule || DEFAULT_CONFIG.fadded.globalRule,
          overrides: parsed?.fadded?.overrides || {},
        },
        momo: {
          usdToNgnRate: Number(parsed?.momo?.usdToNgnRate) || DEFAULT_CONFIG.momo.usdToNgnRate,
          globalRule: parsed?.momo?.globalRule || DEFAULT_CONFIG.momo.globalRule,
          overrides: parsed?.momo?.overrides || {},
        },
        grizzly: {
          usdToNgnRate: Number(parsed?.grizzly?.usdToNgnRate) || DEFAULT_CONFIG.grizzly.usdToNgnRate,
          globalRule: parsed?.grizzly?.globalRule || DEFAULT_CONFIG.grizzly.globalRule,
          overrides: parsed?.grizzly?.overrides || {},
        },
        smspool: {
          usdToNgnRate: Number(parsed?.smspool?.usdToNgnRate) || DEFAULT_CONFIG.smspool.usdToNgnRate,
          globalRule: parsed?.smspool?.globalRule || DEFAULT_CONFIG.smspool.globalRule,
          overrides: parsed?.smspool?.overrides || {},
        },
        updatedAt: parsed?.updatedAt,
      };
      return inMemoryConfig!;
    }
  } catch (err) {
    console.warn('Failed to read pricing config file, using defaults', err);
  }

  inMemoryConfig = DEFAULT_CONFIG;
  return inMemoryConfig;
}

export async function getPricingConfig(): Promise<ProviderPricingConfig> {
  return getPricingConfigSync();
}

export async function savePricingConfig(newConfig: ProviderPricingConfig): Promise<void> {
  inMemoryConfig = {
    ...newConfig,
    updatedAt: new Date().toISOString(),
  };

  try {
    const dir = path.dirname(CONFIG_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(CONFIG_FILE_PATH, JSON.stringify(inMemoryConfig, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write pricing rules to file', err);
  }
}

/**
 * Calculates retail selling price given wholesale cost and margin rule / override.
 */
export function computeRetailPrice(
  wholesaleCost: number,
  globalRule: MarginRule,
  overridePrice?: number | null
): {
  retailPrice: number;
  marginAmount: number;
  marginPercent: number;
  isOverridden: boolean;
} {
  const wholesale = Math.max(0, Number(wholesaleCost) || 0);

  // If there's an explicit override price set by admin
  if (overridePrice !== undefined && overridePrice !== null && !isNaN(Number(overridePrice)) && Number(overridePrice) > 0) {
    const override = Math.round(Number(overridePrice));
    const margin = override - wholesale;
    const marginPct = wholesale > 0 ? Math.round((margin / wholesale) * 100) : 0;
    return {
      retailPrice: override,
      marginAmount: margin,
      marginPercent: marginPct,
      isOverridden: true,
    };
  }

  // Otherwise calculate using global rule
  let retail = wholesale;
  const isPercent = globalRule.type === 'percentage' || globalRule.type === 'percent';
  if (isPercent) {
    const markup = (wholesale * (globalRule.value || 0)) / 100;
    retail = Math.round(wholesale + markup);
  } else {
    retail = Math.round(wholesale + (Number(globalRule.value) || 0));
  }

  const margin = retail - wholesale;
  const marginPct = wholesale > 0 ? Math.round((margin / wholesale) * 100) : 0;

  return {
    retailPrice: retail,
    marginAmount: margin,
    marginPercent: marginPct,
    isOverridden: false,
  };
}
