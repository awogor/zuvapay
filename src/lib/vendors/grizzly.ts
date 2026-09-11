/**
 * GrizzlySMS API Client
 * Official Spec: https://grizzlysms.com/docs
 * Base URL: https://api.grizzlysms.com/stubs/handler_api.php
 * Protocol: SMS-Activate compatible API
 */

const GRIZZLY_BASE_URL =
  process.env.GRIZZLY_API_BASE_URL || 'https://api.grizzlysms.com/stubs/handler_api.php';
const GRIZZLY_API_KEY = process.env.GRIZZLY_API_KEY || '';

/**
 * Mapping of common country codes/aliases to Grizzly SMS numeric country IDs.
 */
export const GRIZZLY_COUNTRY_MAP: Record<string, number> = {
  ng: 19, // Nigeria
  nigeria: 19,
  usa: 187, // United States (Physical carrier)
  us: 187,
  'usa-virtual': 12,
  uk: 16, // United Kingdom
  gb: 16,
  ca: 36, // Canada
  ke: 76, // Kenya
  gh: 38, // Ghana
  za: 31, // South Africa
  in: 22, // India
  de: 43, // Germany
  fr: 78, // France
  nl: 48, // Netherlands
  br: 73, // Brazil
  ru: 0, // Russia
};

/**
 * Mapping of service codes/aliases to Grizzly SMS shortcodes.
 * Note: Grizzly uses 'dr' for OpenAI/ChatGPT.
 */
export const GRIZZLY_SERVICE_MAP: Record<string, string> = {
  wa: 'wa',
  whatsapp: 'wa',
  tg: 'tg',
  telegram: 'tg',
  go: 'go',
  google: 'go',
  youtube: 'go',
  oa: 'dr',
  openai: 'dr',
  chatgpt: 'dr',
  dr: 'dr',
  ig: 'ig',
  instagram: 'ig',
  tk: 'tk',
  tiktok: 'tk',
  fb: 'fb',
  facebook: 'fb',
  tw: 'tw',
  twitter: 'tw',
  x: 'tw',
  nf: 'nf',
  netflix: 'nf',
  st: 'mt',
  steam: 'mt',
  ds: 'ds',
  discord: 'ds',
  mm: 'mm',
  microsoft: 'mm',
};

export async function grizzlyRequest(params: Record<string, string | number | boolean>) {
  const isMock = !GRIZZLY_API_KEY || GRIZZLY_API_KEY.includes('mock') || GRIZZLY_API_KEY.includes('your-');
  if (isMock) {
    return { isMock: true, status: 200, ok: true, text: '' };
  }

  const query = new URLSearchParams({
    api_key: GRIZZLY_API_KEY,
    ...Object.fromEntries(
      Object.entries(params).map(([k, v]) => [k, String(v)])
    ),
  });

  const url = `${GRIZZLY_BASE_URL}?${query.toString()}`;
  try {
    const res = await fetch(url, { cache: 'no-store' });
    const text = await res.text();
    return { isMock: false, status: res.status, ok: res.ok, text };
  } catch (err: any) {
    return { isMock: false, status: 500, ok: false, text: err.message || 'Network error' };
  }
}

/**
 * Rent a temporary virtual phone number for a service.
 * Grizzly format: ACCESS_NUMBER:$activationId:$phoneNumber
 */
export async function getNumber(options: {
  service: string;
  country: string | number;
  maxPrice?: number;
}) {
  const serviceCode = GRIZZLY_SERVICE_MAP[options.service.toLowerCase()] || options.service.toLowerCase();
  
  let countryId: number;
  if (typeof options.country === 'number') {
    countryId = options.country;
  } else if (!isNaN(Number(options.country)) && options.country.trim() !== '') {
    countryId = Number(options.country);
  } else {
    countryId = GRIZZLY_COUNTRY_MAP[options.country.toLowerCase()] ?? 19;
  }

  const params: Record<string, string | number> = {
    action: 'getNumber',
    service: serviceCode,
    country: countryId,
  };

  if (options.maxPrice) {
    params.maxPrice = options.maxPrice;
  }

  const res = await grizzlyRequest(params);
  if (res.isMock) return { isMock: true as const };

  const raw = res.text.trim();
  if (raw.startsWith('ACCESS_NUMBER:')) {
    const parts = raw.split(':');
    return {
      isMock: false as const,
      success: true,
      activationId: parts[1],
      phoneNumber: parts[2],
      raw,
    };
  }

  return {
    isMock: false as const,
    success: false,
    error: raw,
    raw,
  };
}

/**
 * Poll the status of an active activation / SMS order.
 * Possible responses:
 * - STATUS_WAIT_CODE: SMS hasn't arrived yet
 * - STATUS_OK:$code: SMS code successfully received
 * - STATUS_CANCEL: Activation cancelled
 */
export async function getStatus(activationId: string) {
  const res = await grizzlyRequest({ action: 'getStatus', id: activationId });
  if (res.isMock) return { isMock: true as const };

  const raw = res.text.trim();
  if (raw.startsWith('STATUS_OK:')) {
    return { isMock: false as const, success: true, status: 'RECEIVED' as const, code: raw.split(':')[1], raw };
  }
  if (raw === 'STATUS_CANCEL') {
    return { isMock: false as const, success: true, status: 'CANCELED' as const, raw };
  }
  if (raw.startsWith('STATUS_WAIT_CODE') || raw.startsWith('STATUS_WAIT_RESEND')) {
    return { isMock: false as const, success: true, status: 'WAIT_CODE' as const, raw };
  }

  return { isMock: false as const, success: false, error: raw, raw };
}

/**
 * Update the status of an activation.
 * Status codes:
 * - 1: Number is ready to receive SMS
 * - 3: Request another SMS
 * - 6: Complete / finish activation
 * - 8: Cancel activation (and refund vendor balance)
 */
export async function setStatus(options: {
  activationId: string;
  status: 1 | 3 | 6 | 8;
}) {
  const res = await grizzlyRequest({
    action: 'setStatus',
    id: options.activationId,
    status: options.status,
  });
  if (res.isMock) return { isMock: true as const };

  const raw = res.text.trim();
  const success =
    raw === 'ACCESS_READY' ||
    raw === 'ACCESS_RETRY_GET' ||
    raw === 'ACCESS_ACTIVATION' ||
    raw === 'ACCESS_CANCEL';

  return { isMock: false as const, success, statusResponse: raw };
}

/**
 * Query real-time wholesale price for a service & country on GrizzlySMS.
 * Action: getPrices
 * Standard SMS-Activate / Grizzly response format: JSON mapping { countryId: { serviceCode: { "cost": 15.00, "count": 120 } } }
 */
export async function getPrices(options: {
  service: string;
  country: string | number;
}): Promise<{ cost: number; count: number } | null> {
  const serviceCode = GRIZZLY_SERVICE_MAP[options.service.toLowerCase()] || options.service.toLowerCase();

  let countryId: number;
  if (typeof options.country === 'number') {
    countryId = options.country;
  } else if (!isNaN(Number(options.country)) && String(options.country).trim() !== '') {
    countryId = Number(options.country);
  } else {
    countryId = GRIZZLY_COUNTRY_MAP[String(options.country).toLowerCase()] ?? 19;
  }

  const res = await grizzlyRequest({
    action: 'getPrices',
    service: serviceCode,
    country: countryId,
  });

  if (res.isMock) return null;

  try {
    const json = JSON.parse(res.text);
    // Structure: json[countryId][serviceCode] -> { cost, count }
    const countryObj = json[countryId] || json[String(countryId)];
    if (countryObj && countryObj[serviceCode]) {
      const entry = countryObj[serviceCode];
      return {
        cost: parseFloat(entry.cost) || 0,
        count: Number(entry.count) || 0,
      };
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Check Grizzly SMS API balance.
 * Response: ACCESS_BALANCE:$balance
 */
export async function getBalance() {
  const res = await grizzlyRequest({ action: 'getBalance' });
  if (res.isMock) return { isMock: true as const, balance: 0 };

  const raw = res.text.trim();
  if (raw.startsWith('ACCESS_BALANCE:')) {
    const balance = parseFloat(raw.split(':')[1]);
    return { isMock: false as const, success: true, balance, currency: 'RUB' };
  }

  return { isMock: false as const, success: false, error: raw, balance: 0 };
}
