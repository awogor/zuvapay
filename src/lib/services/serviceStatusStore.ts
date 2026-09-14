import fs from 'fs';
import path from 'path';

export interface ServiceSwitch {
  key: string;
  name: string;
  category: string;
  enabled: boolean;
  maintenanceMessage?: string;
  updatedAt?: string;
}

export interface ServiceSwitchesConfig {
  services: Record<string, ServiceSwitch>;
  updatedAt?: string;
}

const DEFAULT_SERVICES: Record<string, ServiceSwitch> = {
  airtime: {
    key: 'airtime',
    name: 'Airtime VTU',
    category: 'Bills & Utilities',
    enabled: true,
    maintenanceMessage: 'Airtime VTU service is temporarily undergoing scheduled telco maintenance.',
  },
  data: {
    key: 'data',
    name: 'Internet Data (SME & Direct)',
    category: 'Bills & Utilities',
    enabled: true,
    maintenanceMessage: 'Data bundle dispensing is undergoing telco maintenance. Please check back shortly.',
  },
  power: {
    key: 'power',
    name: 'Electricity Bills (DISCOs)',
    category: 'Bills & Utilities',
    enabled: true,
    maintenanceMessage: 'Electricity bill payment and token generation is temporarily offline for maintenance.',
  },
  tv: {
    key: 'tv',
    name: 'Cable TV (DStv, GOtv, StarTimes)',
    category: 'Bills & Utilities',
    enabled: true,
    maintenanceMessage: 'Cable TV subscription renewal is temporarily undergoing provider gateway maintenance.',
  },
  sms: {
    key: 'sms',
    name: 'Virtual SMS / OTP Verification',
    category: 'Digital & Growth',
    enabled: true,
    maintenanceMessage: 'Virtual phone number dispatch is temporarily paused for line pool replenishment.',
  },
  social: {
    key: 'social',
    name: 'Social Media Boost (SMM)',
    category: 'Digital & Growth',
    enabled: true,
    maintenanceMessage: 'Social engagement dispatch is temporarily paused for server updates.',
  },
  logs: {
    key: 'logs',
    name: 'Digital Account Logs',
    category: 'Digital & Growth',
    enabled: true,
    maintenanceMessage: 'Account logs stock delivery is temporarily paused for credential sanitization.',
  },
  marketplace: {
    key: 'marketplace',
    name: 'AI Marketplace & Software',
    category: 'Digital & Growth',
    enabled: true,
    maintenanceMessage: 'AI software activations are temporarily offline for license inventory update.',
  },
};

const SWITCHES_FILE_PATH = path.join(process.cwd(), 'src', 'lib', 'data', 'serviceSwitches.json');

let inMemorySwitches: ServiceSwitchesConfig | null = null;

export function getServiceSwitchesSync(): ServiceSwitchesConfig {
  if (inMemorySwitches) return inMemorySwitches;

  try {
    if (fs.existsSync(SWITCHES_FILE_PATH)) {
      const content = fs.readFileSync(SWITCHES_FILE_PATH, 'utf-8');
      const parsed = JSON.parse(content);
      const mergedServices: Record<string, ServiceSwitch> = {};

      for (const [key, def] of Object.entries(DEFAULT_SERVICES)) {
        if (parsed?.services?.[key]) {
          mergedServices[key] = {
            ...def,
            ...parsed.services[key],
          };
        } else {
          mergedServices[key] = { ...def };
        }
      }

      inMemorySwitches = {
        services: mergedServices,
        updatedAt: parsed?.updatedAt,
      };
      return inMemorySwitches!;
    }
  } catch (err) {
    console.warn('Failed to read service switches, using default configuration', err);
  }

  inMemorySwitches = {
    services: { ...DEFAULT_SERVICES },
    updatedAt: new Date().toISOString(),
  };
  return inMemorySwitches;
}

export async function getServiceSwitches(): Promise<ServiceSwitchesConfig> {
  return getServiceSwitchesSync();
}

export async function saveServiceSwitches(newConfig: ServiceSwitchesConfig): Promise<void> {
  inMemorySwitches = {
    ...newConfig,
    updatedAt: new Date().toISOString(),
  };

  try {
    const dir = path.dirname(SWITCHES_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(SWITCHES_FILE_PATH, JSON.stringify(inMemorySwitches, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save service switches to disk', err);
  }
}

export function checkServiceAvailability(serviceKey: string): {
  allowed: boolean;
  message?: string;
} {
  const config = getServiceSwitchesSync();
  const service = config.services[serviceKey];
  if (!service) return { allowed: true };

  if (!service.enabled) {
    return {
      allowed: false,
      message: service.maintenanceMessage || `${service.name} is temporarily undergoing scheduled maintenance. Please check back shortly.`,
    };
  }

  return { allowed: true };
}
