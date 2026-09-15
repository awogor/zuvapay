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

export interface MarketplacePricingConfig {
  globalRule: MarginRule; // e.g. { type: 'percentage', value: 20 }
  overrides: Record<string, number>; // productId -> retail price NGN
}

export interface ProviderPricingConfig {
  gongoz: GongozPricingConfig;
  fadded: FaddedPricingConfig;
  momo: MomoPricingConfig;
  grizzly: GrizzlyPricingConfig;
  smspool: SMSPoolPricingConfig;
  marketplace: MarketplacePricingConfig;
  updatedAt?: string;
}

const DEFAULT_CONFIG: ProviderPricingConfig = {
  gongoz: {
    data: {
      globalRule: { type: 'percentage', value: 10 },
      overrides: {},
    },
    cable: {
      globalRule: { type: 'fixed', value: 0 },
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
  marketplace: {
    globalRule: { type: 'percentage', value: 20 },
    overrides: {},
  },
};

const CONFIG_FILE_PATH = path.join(process.cwd(), 'src', 'lib', 'data', 'pricingRules.json');
const BUCKET_NAME = 'system-config';
const PRICING_FILE_NAME = 'pricingRules.json';

// In-memory cache for ultra-fast access
let inMemoryConfig: ProviderPricingConfig | null = null;

function normalizeConfig(parsed: any): ProviderPricingConfig {
  return {
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
    marketplace: {
      globalRule: parsed?.marketplace?.globalRule || DEFAULT_CONFIG.marketplace.globalRule,
      overrides: parsed?.marketplace?.overrides || {},
    },
    updatedAt: parsed?.updatedAt || new Date().toISOString(),
  };
}

export function getPricingConfigSync(): ProviderPricingConfig {
  if (inMemoryConfig) return inMemoryConfig;

  try {
    if (fs.existsSync(CONFIG_FILE_PATH)) {
      const content = fs.readFileSync(CONFIG_FILE_PATH, 'utf-8');
      const parsed = JSON.parse(content);
      inMemoryConfig = normalizeConfig(parsed);
      return inMemoryConfig;
    }
  } catch (err) {
    console.warn('[pricingStore] Failed to read local pricing config file, using defaults', err);
  }

  inMemoryConfig = { ...DEFAULT_CONFIG };
  return inMemoryConfig;
}

export async function getPricingConfig(): Promise<ProviderPricingConfig> {
  if (inMemoryConfig) return inMemoryConfig;

  // 1. Try fetching persistent configuration from Supabase Storage
  try {
    const { createAdminClient } = await import('@/lib/supabase/server');
    const supabase = createAdminClient();
    const { data, error } = await supabase.storage.from(BUCKET_NAME).download(PRICING_FILE_NAME);

    if (data && !error) {
      const text = await data.text();
      const parsed = JSON.parse(text);
      if (parsed && typeof parsed === 'object') {
        inMemoryConfig = normalizeConfig(parsed);
        // Sync local disk copy if writable
        try {
          fs.writeFileSync(CONFIG_FILE_PATH, JSON.stringify(inMemoryConfig, null, 2), 'utf-8');
        } catch {}
        return inMemoryConfig;
      }
    }
  } catch (err) {
    console.warn('[pricingStore] Supabase Storage fetch failed, falling back to local file:', err);
  }

  // 2. Fallback to local file or defaults
  return getPricingConfigSync();
}

export async function savePricingConfig(newConfig: ProviderPricingConfig): Promise<void> {
  inMemoryConfig = {
    ...newConfig,
    updatedAt: new Date().toISOString(),
  };

  // 1. Persist to Supabase Storage bucket 'system-config' (survives all redeployments and container rebuilds)
  try {
    const { createAdminClient } = await import('@/lib/supabase/server');
    const supabase = createAdminClient();
    const jsonString = JSON.stringify(inMemoryConfig, null, 2);
    const { error: uploadError } = await supabase.storage.from(BUCKET_NAME).upload(
      PRICING_FILE_NAME,
      Buffer.from(jsonString),
      {
        contentType: 'application/json',
        upsert: true,
      }
    );

    if (uploadError) {
      console.error('[pricingStore] Failed to upload pricing to Supabase Storage:', uploadError);
    } else {
      console.log('[pricingStore] Successfully persisted pricing to Supabase Storage');
    }
  } catch (storageErr) {
    console.error('[pricingStore] Error saving to Supabase Storage:', storageErr);
  }

  // 2. Also write to local disk as fallback
  try {
    const dir = path.dirname(CONFIG_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(CONFIG_FILE_PATH, JSON.stringify(inMemoryConfig, null, 2), 'utf-8');
  } catch (err) {
    console.error('[pricingStore] Failed to write pricing rules to file:', err);
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
