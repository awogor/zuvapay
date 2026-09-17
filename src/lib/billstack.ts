import crypto from 'crypto';

export interface BillstackVirtualAccountRequest {
  reference: string;
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  bank?: '9PSB' | 'SAFEHAVEN' | 'PROVIDUS' | 'PALMPAY';
  idType?: 'nin' | 'bvn';
  idNumber?: string;
}

export interface BillstackAccountItem {
  account_number: string;
  account_name: string;
  bank_name: string;
  bank_id: string;
  created_at: string;
}

export interface BillstackVirtualAccountResponse {
  status: boolean;
  message: string;
  data?: {
    reference: string;
    account: BillstackAccountItem[];
    meta?: {
      firstName: string;
      lastName: string;
      email: string;
    };
  } | null;
}

export const BILLSTACK_BASE_URL =
  process.env.BILLSTACK_BASE_URL || 'https://api.billstack.co/v2';

/**
 * Generate a dedicated virtual account via Billstack API
 */
export async function generateBillstackVirtualAccount(
  params: BillstackVirtualAccountRequest
): Promise<BillstackVirtualAccountResponse> {
  const secretKey = process.env.BILLSTACK_SECRET_KEY;
  const isProduction = process.env.NODE_ENV === 'production';

  if (!secretKey || secretKey.includes('your-') || secretKey.includes('mock')) {
    if (isProduction) {
      console.error('[BILLSTACK] BILLSTACK_SECRET_KEY is not configured in production environment.');
      return {
        status: false,
        message: 'Payment gateway configuration error: BILLSTACK_SECRET_KEY is missing in production.',
      };
    }

    // Local developer fallback only when running in development without live keys
    const randomAcc = Math.floor(9000000000 + Math.random() * 999999999).toString();
    const bankName =
      params.bank === 'SAFEHAVEN'
        ? 'SafeHaven MFB'
        : params.bank === 'PROVIDUS'
        ? 'Providus Bank'
        : '9PSB Bank';

    return {
      status: true,
      message: 'Account reserved (Simulated Sandbox)',
      data: {
        reference: params.reference,
        account: [
          {
            account_number: randomAcc,
            account_name: `ZuvaPay / ${params.firstName} ${params.lastName}`.trim(),
            bank_name: bankName,
            bank_id: params.bank || '9PSB',
            created_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
          },
        ],
        meta: {
          firstName: params.firstName,
          lastName: params.lastName,
          email: params.email,
        },
      },
    };
  }

  const endpoint = `${BILLSTACK_BASE_URL}/thirdparty/generateVirtualAccount/`;
  const selectedBank = params.bank || '9PSB';

  const bodyPayload: Record<string, any> = {
    reference: params.reference,
    email: params.email,
    phone: params.phone,
    firstName: params.firstName,
    lastName: params.lastName || params.firstName,
    bank: selectedBank,
  };

  if (selectedBank === 'PALMPAY' && params.idType && params.idNumber) {
    bodyPayload.idType = params.idType;
    bodyPayload.idNumber = params.idNumber;
  }

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${secretKey.trim()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(bodyPayload),
  });

  const data: BillstackVirtualAccountResponse = await res.json();
  return data;
}

/**
 * Verify Billstack Webhook signature using HMAC-SHA256
 */
export function verifyBillstackWebhook(
  rawBody: string,
  headers: Headers | Record<string, string | string[] | undefined>,
  secretKey?: string
): boolean {
  const key = (
    secretKey ||
    process.env.BILLSTACK_WEBHOOK_SECRET ||
    process.env.BILLSTACK_SECRET_KEY ||
    ''
  ).trim();
  if (!key) return false;

  const getHeader = (name: string): string | null => {
    if (typeof (headers as Headers).get === 'function') {
      return (headers as Headers).get(name);
    }
    const val =
      (headers as Record<string, any>)[name.toLowerCase()] ||
      (headers as Record<string, any>)[name];
    if (Array.isArray(val)) return val[0] || null;
    return val || null;
  };

  const signature256 = getHeader('x-wiaxy-signature-256');
  const timestamp = getHeader('x-wiaxy-timestamp');
  const legacySig = getHeader('x-wiaxy-signature');

  // 1. Recommended HMAC-SHA256 signature verification
  if (signature256 && timestamp) {
    // Replay attack prevention: must be within 300 seconds (5 minutes)
    const nowSeconds = Math.floor(Date.now() / 1000);
    const eventSeconds = Number(timestamp);
    if (isNaN(eventSeconds) || Math.abs(nowSeconds - eventSeconds) > 300) {
      console.warn('[BILLSTACK_WEBHOOK] Stale webhook timestamp rejected:', timestamp);
      return false;
    }

    const payloadToSign = `${timestamp}.${rawBody}`;
    const expected = crypto
      .createHmac('sha256', key)
      .update(payloadToSign)
      .digest('hex')
      .toLowerCase();

    const incomingSig = signature256.trim().toLowerCase();

    try {
      const sigBuf = Buffer.from(incomingSig, 'hex');
      const expBuf = Buffer.from(expected, 'hex');
      if (sigBuf.length === expBuf.length && crypto.timingSafeEqual(sigBuf, expBuf)) {
        return true;
      }
    } catch {
      // Direct string comparison fallback
      if (incomingSig === expected) return true;
    }
  }

  // 2. Fallback: Legacy MD5 check if HMAC-SHA256 header was omitted
  if (legacySig) {
    const expectedMd5 = crypto.createHash('md5').update(key).digest('hex').toLowerCase();
    if (legacySig.trim().toLowerCase() === expectedMd5) {
      return true;
    }
  }

  return false;
}
