/**
 * GongozConcept API Client
 * Official Spec: https://documenter.getpostman.com/view/25060066/2sA35G4htY?version=latest
 * Base URL: https://www.gongozconcept.com/api/
 * Authentication: Authorization: Token <apiKey>
 */

const GONGOZ_BASE_URL = process.env.GONGOZ_API_BASE_URL || 'https://www.gongozconcept.com/api';
const GONGOZ_API_KEY = process.env.GONGOZ_API_KEY || '';

/**
 * Official Gongoz Network IDs:
 * 1: MTN
 * 2: GLO
 * 3: 9MOBILE
 * 4: AIRTEL
 * 6: SMILE
 */
export const NETWORK_IDS: Record<string, number> = {
  MTN: 1,
  GLO: 2,
  '9MOBILE': 3,
  AIRTEL: 4,
  SMILE: 6,
};

export const CABLE_IDS: Record<string, number> = {
  gotv: 1,
  dstv: 2,
  startimes: 3,
};

export const DISCO_IDS: Record<string, number> = {
  ikeja: 1,
  eko: 2,
  abuja: 3,
  kano: 4,
  enugu: 5,
  portharcourt: 6,
  ibadan: 7,
  kaduna: 8,
  jos: 9,
  benin: 10,
  yola: 11,
};

export const DISCO_API_NAMES: Record<string, string> = {
  ikeja: 'Ikeja Electric',
  eko: 'Eko Electric',
  abuja: 'Abuja Electric',
  kano: 'Kano Electric',
  enugu: 'Enugu Electric',
  portharcourt: 'Port Harcourt Electric',
  ibadan: 'Ibadan Electric',
  kaduna: 'Kaduna Electric',
  jos: 'Jos Electric',
  benin: 'Benin Electric',
  yola: 'Yola Electric',
};

export const CABLE_API_NAMES: Record<string, string> = {
  gotv: 'GOTV',
  dstv: 'DSTV',
  startimes: 'STARTIMES',
};

export async function gongozFetch(endpoint: string, options: RequestInit = {}) {
  const isMock = !GONGOZ_API_KEY || GONGOZ_API_KEY.includes('mock') || GONGOZ_API_KEY.includes('your-');
  if (isMock) {
    return { isMock: true };
  }

  const url = `${GONGOZ_BASE_URL.replace(/\/$/, '')}/${endpoint.replace(/^\//, '')}`;
  const headers = {
    Authorization: `Token ${GONGOZ_API_KEY}`,
    'Content-Type': 'application/json',
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
