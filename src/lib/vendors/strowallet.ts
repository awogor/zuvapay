/**
 * StroWallet API Client
 * Official Spec: https://strowallet.readme.io/reference/welcome
 * Base URL: https://strowallet.com/api/
 * Authentication: POST body / GET query parameter public_key
 */

const STROWALLET_BASE_URL = process.env.STROWALLET_BASE_URL || 'https://strowallet.com/api';
const STROWALLET_PUBLIC_KEY = process.env.STROWALLET_PUBLIC_KEY || '';

/**
 * Normalizes DisCo names into StroWallet service_name slugs:
 * ikeja-electric, eko-electric, kano-electric, portharcourt-electric, jos-electric,
 * kaduna-electric, abuja-electric, ibadan-electric, enugu-electric, benin-electric,
 * aba-electric, yola-electric
 */
export const STROWALLET_DISCO_SLUGS: Record<string, string> = {
  ikeja: 'ikeja-electric',
  'ikeja electric': 'ikeja-electric',
  eko: 'eko-electric',
  'eko electric': 'eko-electric',
  abuja: 'abuja-electric',
  'abuja electric': 'abuja-electric',
  kano: 'kano-electric',
  'kano electric': 'kano-electric',
  enugu: 'enugu-electric',
  'enugu electric': 'enugu-electric',
  portharcourt: 'portharcourt-electric',
  'port harcourt': 'portharcourt-electric',
  'port harcourt electric': 'portharcourt-electric',
  ibadan: 'ibadan-electric',
  'ibadan electric': 'ibadan-electric',
  kaduna: 'kaduna-electric',
  'kaduna electric': 'kaduna-electric',
  jos: 'jos-electric',
  'jos electric': 'jos-electric',
  benin: 'benin-electric',
  'benin electric': 'benin-electric',
  yola: 'yola-electric',
  'yola electric': 'yola-electric',
  aba: 'aba-electric',
  'aba electric': 'aba-electric',
};

/**
 * Normalizes Network names to StroWallet network identifiers:
 * mtn, glo, airtel, etisalat
 */
export const STROWALLET_NETWORK_SLUGS: Record<string, string> = {
  MTN: 'mtn',
  GLO: 'glo',
  AIRTEL: 'airtel',
  '9MOBILE': 'etisalat',
  ETISALAT: 'etisalat',
};

/**
 * Normalizes Network names to StroWallet Data service_name:
 * mtn-data, glo-data, airtel-data, etisalat-data
 */
export const STROWALLET_DATA_SERVICES: Record<string, { serviceName: string; serviceId: string }> = {
  mtn: { serviceName: 'mtn-data', serviceId: 'mtn-data' },
  airtel: { serviceName: 'airtel-data', serviceId: 'airtel-data' },
  glo: { serviceName: 'glo-data', serviceId: 'glo-data' },
  '9mobile': { serviceName: 'etisalat-data', serviceId: 'etisalat-data' },
  etisalat: { serviceName: 'etisalat-data', serviceId: 'etisalat-data' },
};

/**
 * Normalizes Cable TV service_id:
 * dstv, gotv, startimes, showmax
 */
export const STROWALLET_CABLE_SERVICES: Record<string, string> = {
  dstv: 'dstv',
  gotv: 'gotv',
  startimes: 'startimes',
  showmax: 'showmax',
};

export async function strowalletFetch(endpoint: string, options: RequestInit = {}) {
  const isMock =
    !STROWALLET_PUBLIC_KEY ||
    STROWALLET_PUBLIC_KEY.includes('mock') ||
    STROWALLET_PUBLIC_KEY.includes('your-') ||
    STROWALLET_PUBLIC_KEY.trim() === '';

  if (isMock) {
    return { isMock: true, status: 200, ok: true, data: null };
  }

  const cleanBase = STROWALLET_BASE_URL.replace(/\/$/, '');
  const cleanEp = endpoint.replace(/^\//, '');
  const url = `${cleanBase}/${cleanEp}`;
  const headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(options.headers || {}),
  };

  try {
    const res = await fetch(url, {
      ...options,
      headers,
    });

    const rawText = await res.text();
    let data: any = null;
    if (rawText && rawText.trim().length > 0) {
      try {
        data = JSON.parse(rawText);
      } catch {
        data = { message: rawText };
      }
    }
    return { isMock: false, status: res.status, ok: res.ok, data };
  } catch (err: any) {
    return { isMock: false, status: 500, ok: false, data: { message: err.message } };
  }
}

// -------------------------------------------------------------
// 1. AIRTIME
// -------------------------------------------------------------
export async function buyAirtime({
  phone,
  network,
  amount,
}: {
  phone: string;
  network: string;
  amount: string | number;
}) {
  const netSlug = STROWALLET_NETWORK_SLUGS[network.toUpperCase()] || network.toLowerCase();

  return strowalletFetch('buyairtime/request', {
    method: 'POST',
    body: JSON.stringify({
      public_key: STROWALLET_PUBLIC_KEY,
      amount: String(amount),
      phone: String(phone).trim(),
      service_name: netSlug,
    }),
  });
}

// -------------------------------------------------------------
// 2. ELECTRICITY (METER VALIDATION & SUBSCRIPTION)
// -------------------------------------------------------------
export async function verifyMeter({
  meterNumber,
  disco,
  meterType,
}: {
  meterNumber: string;
  disco: string;
  meterType: 'prepaid' | 'postpaid' | string;
}) {
  const discoSlug = STROWALLET_DISCO_SLUGS[disco.toLowerCase()] || disco.toLowerCase();
  const mType = meterType.toLowerCase() === 'postpaid' ? 'postpaid' : 'prepaid';

  return strowalletFetch('electricity/verify-merchant', {
    method: 'POST',
    body: JSON.stringify({
      public_key: STROWALLET_PUBLIC_KEY,
      service_name: discoSlug,
      meter_type: mType,
      meter_number: String(meterNumber).trim(),
    }),
  });
}

export async function subscribeElectricity({
  meterNumber,
  disco,
  meterType,
  amount,
  phone,
}: {
  meterNumber: string;
  disco: string;
  meterType: 'prepaid' | 'postpaid' | string;
  amount: string | number;
  phone: string;
}) {
  const discoSlug = STROWALLET_DISCO_SLUGS[disco.toLowerCase()] || disco.toLowerCase();
  const mType = meterType.toLowerCase() === 'postpaid' ? 'postpaid' : 'prepaid';

  return strowalletFetch('electricity/request', {
    method: 'POST',
    body: JSON.stringify({
      public_key: STROWALLET_PUBLIC_KEY,
      amount: String(amount),
      phone: String(phone).trim(),
      service_name: discoSlug,
      meter_number: String(meterNumber).trim(),
      meter_type: mType,
    }),
  });
}

// -------------------------------------------------------------
// 3. CABLE TV (PLANS, VERIFY SMARTCARD, SUBSCRIBE)
// -------------------------------------------------------------
export async function getCableTvPlans(serviceId: string) {
  const service = STROWALLET_CABLE_SERVICES[serviceId.toLowerCase()] || serviceId.toLowerCase();
  const query = new URLSearchParams({
    public_key: STROWALLET_PUBLIC_KEY,
    service_id: service,
  });

  return strowalletFetch(`cable-subscription/plans?${query.toString()}`, {
    method: 'GET',
  });
}

export async function verifySmartCard({
  serviceId,
  customerId,
}: {
  serviceId: string;
  customerId: string;
}) {
  const service = STROWALLET_CABLE_SERVICES[serviceId.toLowerCase()] || serviceId.toLowerCase();

  return strowalletFetch('cable-subscription/verify-merchant', {
    method: 'POST',
    body: JSON.stringify({
      public_key: STROWALLET_PUBLIC_KEY,
      service_id: service,
      customer_id: String(customerId).trim(),
    }),
  });
}

export async function subscribeCableTv({
  serviceId,
  serviceName,
  variationCode,
  customerId,
  amount,
  phone,
}: {
  serviceId: string;
  serviceName?: string;
  variationCode?: string;
  customerId: string;
  amount: string | number;
  phone: string;
}) {
  const service = STROWALLET_CABLE_SERVICES[serviceId.toLowerCase()] || serviceId.toLowerCase();

  return strowalletFetch('cable-subscription/request', {
    method: 'POST',
    body: JSON.stringify({
      public_key: STROWALLET_PUBLIC_KEY,
      amount: String(amount),
      phone: String(phone).trim(),
      service_name: serviceName || service,
      service_id: service,
      variation_code: variationCode || '',
      customer_id: String(customerId).trim(),
    }),
  });
}

// -------------------------------------------------------------
// 4. DIRECT DATA SUBSCRIPTIONS (OFFICIAL TELCO BUNDLES)
// -------------------------------------------------------------
export async function getStroWalletDataPlans(network: string) {
  const normKey = network.toLowerCase();
  const serviceConfig = STROWALLET_DATA_SERVICES[normKey];
  if (!serviceConfig) {
    return { isMock: false, status: 400, ok: false, data: { message: `Unsupported network: ${network}` } };
  }

  const query = new URLSearchParams({
    public_key: STROWALLET_PUBLIC_KEY,
    service_name: serviceConfig.serviceName,
  });

  return strowalletFetch(`buydata/plans?${query.toString()}`, {
    method: 'GET',
  });
}

export async function buyStroWalletData({
  network,
  phone,
  variationCode,
  amount,
  serviceName,
  serviceId,
}: {
  network: string;
  phone: string;
  variationCode: string;
  amount: string | number;
  serviceName?: string;
  serviceId?: string;
}) {
  const normKey = network.toLowerCase();
  const serviceConfig = STROWALLET_DATA_SERVICES[normKey];
  const sName = serviceName || serviceConfig?.serviceName || `${normKey}-data`;
  const sId = serviceId || serviceConfig?.serviceId || `${normKey}-data`;

  return strowalletFetch('buydata/request', {
    method: 'POST',
    body: JSON.stringify({
      public_key: STROWALLET_PUBLIC_KEY,
      service_name: sName,
      service_id: sId,
      variation_code: variationCode,
      phone: String(phone).trim(),
      amount: String(amount),
    }),
  });
}

