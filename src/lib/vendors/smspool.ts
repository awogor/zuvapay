/**
 * SMSPool API Client (Server 2)
 * Official Spec: https://www.smspool.net/article/how-to-use-the-smspool-api-0dd6eadf4c
 * Base URL: https://api.smspool.net
 */

const SMSPOOL_BASE_URL = process.env.SMSPOOL_BASE_URL || 'https://api.smspool.net';
const SMSPOOL_API_KEY = process.env.SMSPOOL_API_KEY || '';

export interface SMSPoolCountry {
  ID: number;
  name: string;
  short_name: string;
  cc: string;
  region?: string;
}

export interface SMSPoolService {
  ID: number;
  name: string;
  favourite?: number;
}

export interface SMSPoolPurchaseResult {
  success: boolean;
  orderId?: string;
  phoneNumber?: string;
  countryCode?: string;
  expiresIn?: number;
  error?: string;
  isMock?: boolean;
}

export interface SMSPoolCheckResult {
  success: boolean;
  status: 'WAIT_CODE' | 'RECEIVED' | 'CANCELED' | 'EXPIRED';
  code?: string;
  timeLeft?: number;
  error?: string;
  isMock?: boolean;
}

/**
 * Check balance on SMSPool
 */
export async function getSMSPoolBalance(): Promise<{ success: boolean; balance: number; currency: string; isMock?: boolean }> {
  if (!SMSPOOL_API_KEY || SMSPOOL_API_KEY.includes('mock')) {
    return { success: true, balance: 2.66, currency: 'USD', isMock: true };
  }

  try {
    const res = await fetch(`${SMSPOOL_BASE_URL}/request/balance?key=${SMSPOOL_API_KEY}`, {
      cache: 'no-store',
    });
    const data = await res.json();
    if (data && typeof data.balance !== 'undefined') {
      return { success: true, balance: parseFloat(data.balance) || 0, currency: 'USD', isMock: false };
    }
    return { success: false, balance: 0, currency: 'USD', isMock: false };
  } catch (err: any) {
    console.error('Failed to fetch SMSPool balance:', err);
    return { success: false, balance: 0, currency: 'USD' };
  }
}

/**
 * Fetch all available countries from SMSPool
 */
export async function getSMSPoolCountries(): Promise<SMSPoolCountry[]> {
  try {
    const res = await fetch(`${SMSPOOL_BASE_URL}/country/retrieve_all`, {
      next: { revalidate: 3600 },
    });
    const data = await res.json();
    if (Array.isArray(data)) {
      return data;
    }
    return [];
  } catch (err) {
    console.error('Failed to retrieve SMSPool countries:', err);
    return [];
  }
}

/**
 * Fetch all available services from SMSPool
 */
export async function getSMSPoolServices(): Promise<SMSPoolService[]> {
  try {
    const res = await fetch(`${SMSPOOL_BASE_URL}/service/retrieve_all`, {
      next: { revalidate: 3600 },
    });
    const data = await res.json();
    if (Array.isArray(data)) {
      return data;
    }
    return [];
  } catch (err) {
    console.error('Failed to retrieve SMSPool services:', err);
    return [];
  }
}

/**
 * Query current rate/price for a specific country & service
 */
export async function getSMSPoolPrice(params: {
  country: number | string;
  service: number | string;
}): Promise<{ price: number; highPrice: number; successRate: number } | null> {
  if (!SMSPOOL_API_KEY) return null;

  try {
    const res = await fetch(
      `${SMSPOOL_BASE_URL}/request/price?key=${SMSPOOL_API_KEY}&country=${encodeURIComponent(
        params.country
      )}&service=${encodeURIComponent(params.service)}`,
      { cache: 'no-store' }
    );
    const data = await res.json();
    if (data && typeof data.price !== 'undefined') {
      return {
        price: parseFloat(data.price) || 1.0,
        highPrice: parseFloat(data.high_price) || 1.2,
        successRate: Number(data.success_rate) || 80,
      };
    }
    return null;
  } catch (err) {
    console.error('Failed to fetch SMSPool price:', err);
    return null;
  }
}

/**
 * Purchase / Rent virtual phone number on SMSPool
 */
export async function purchaseSMSPoolNumber(params: {
  country: number | string;
  service: number | string;
}): Promise<SMSPoolPurchaseResult> {
  if (!SMSPOOL_API_KEY || SMSPOOL_API_KEY.includes('mock')) {
    const mockId = `SMP-MOCK-${Date.now()}`;
    return {
      success: true,
      orderId: mockId,
      phoneNumber: `+1415${Math.floor(1000000 + Math.random() * 9000000)}`,
      countryCode: '1',
      expiresIn: 600,
      isMock: true,
    };
  }

  try {
    const res = await fetch(`${SMSPOOL_BASE_URL}/purchase/sms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        key: SMSPOOL_API_KEY,
        country: String(params.country),
        service: String(params.service),
      }),
    });

    const data = await res.json();

    if (data.success === 1 || data.order_id) {
      let fullNumber = '';
      if (data.phonenumber) {
        const rawNum = String(data.phonenumber);
        if (rawNum.startsWith('+')) {
          fullNumber = rawNum;
        } else if (data.cc && !rawNum.startsWith(String(data.cc))) {
          fullNumber = `+${data.cc}${rawNum}`;
        } else {
          fullNumber = `+${rawNum}`;
        }
      }

      return {
        success: true,
        orderId: String(data.order_id),
        phoneNumber: fullNumber,
        countryCode: data.cc ? String(data.cc) : '1',
        expiresIn: Number(data.expires_in) || 600,
        isMock: false,
      };
    }

    let sanitizedError = data.message || 'Temporary lines for this service are currently out of stock.';
    const lower = sanitizedError.toLowerCase();
    if (lower.includes('whitelist') || lower.includes('smspool') || lower.includes('http') || lower.includes('request_access') || lower.includes('not available for you')) {
      sanitizedError = 'Temporary lines for this service are currently out of stock on this server route. Please switch to Server 1.';
    }

    return {
      success: false,
      error: sanitizedError,
      isMock: false,
    };
  } catch (err: any) {
    console.error('SMSPool purchase error:', err);
    return {
      success: false,
      error: err.message || 'Carrier network failure during purchase.',
      isMock: false,
    };
  }
}

/**
 * Check incoming SMS OTP status on SMSPool
 */
export async function checkSMSPoolStatus(params: {
  orderId: string;
}): Promise<SMSPoolCheckResult> {
  if (!SMSPOOL_API_KEY || SMSPOOL_API_KEY.includes('mock') || params.orderId.includes('MOCK')) {
    return {
      success: true,
      status: 'WAIT_CODE',
      isMock: true,
    };
  }

  try {
    const res = await fetch(
      `${SMSPOOL_BASE_URL}/sms/check?key=${SMSPOOL_API_KEY}&orderid=${encodeURIComponent(
        params.orderId
      )}`,
      { cache: 'no-store' }
    );
    const data = await res.json();

    // SMSPool status codes:
    // 1: Pending (waiting for code)
    // 2: Expired
    // 3: Completed (SMS received)
    // 5: Cancelled
    // 6: Refunded
    if (data.status === 3 || data.sms || data.code) {
      return {
        success: true,
        status: 'RECEIVED',
        code: String(data.sms || data.code),
        timeLeft: data.time_left,
        isMock: false,
      };
    }

    if (data.status === 1) {
      return {
        success: true,
        status: 'WAIT_CODE',
        timeLeft: data.time_left,
        isMock: false,
      };
    }

    if (data.status === 2) {
      return {
        success: true,
        status: 'EXPIRED',
        error: 'Order expired before SMS was received.',
        isMock: false,
      };
    }

    if (data.status === 5 || data.status === 6) {
      return {
        success: true,
        status: 'CANCELED',
        error: 'Order has been cancelled.',
        isMock: false,
      };
    }

    return {
      success: true,
      status: 'WAIT_CODE',
      isMock: false,
    };
  } catch (err: any) {
    console.error('SMSPool check error:', err);
    return {
      success: false,
      status: 'WAIT_CODE',
      error: err.message,
      isMock: false,
    };
  }
}

/**
 * Cancel an active SMS order on SMSPool
 */
export async function cancelSMSPoolOrder(params: {
  orderId: string;
}): Promise<{ success: boolean; message?: string }> {
  if (!SMSPOOL_API_KEY || SMSPOOL_API_KEY.includes('mock') || params.orderId.includes('MOCK')) {
    return { success: true, message: 'Mock order cancelled successfully.' };
  }

  try {
    const res = await fetch(`${SMSPOOL_BASE_URL}/sms/cancel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        key: SMSPOOL_API_KEY,
        orderid: params.orderId,
      }),
    });
    const data = await res.json();
    return {
      success: data.success === 1,
      message: data.message || (data.success === 1 ? 'Order cancelled' : 'Failed to cancel'),
    };
  } catch (err: any) {
    console.error('SMSPool cancel error:', err);
    return { success: false, message: err.message };
  }
}
