/**
 * MomoPanel SMM API Client
 * Official Spec: https://momopanel.com/api (Standard SMM v2 protocol)
 * Base URL: https://momopanel.com/api/v2
 */

const MOMO_BASE_URL = process.env.MOMO_API_BASE_URL || 'https://momopanel.com/api/v2';
const MOMO_API_KEY = process.env.MOMO_API_KEY || '';

export interface MomoServiceItem {
  service: number;
  name: string;
  type: string;
  category: string;
  rate: string;
  min: string;
  max: string;
  refill: boolean;
  cancel: boolean;
}

export interface MomoAddOrderParams {
  service: number | string;
  link: string;
  quantity?: number;
  runs?: number;
  interval?: number;
  comments?: string;
  username?: string;
  min?: number;
  max?: number;
}

export interface MomoOrderStatus {
  charge: string;
  start_count?: string;
  status: 'Pending' | 'In progress' | 'Completed' | 'Partial' | 'Canceled';
  remains?: string;
  currency: string;
}

export async function momoRequest(action: string, params: Record<string, any> = {}) {
  const isMock = !MOMO_API_KEY || MOMO_API_KEY.includes('mock') || MOMO_API_KEY.includes('your-');
  if (isMock) {
    return { isMock: true as const, status: 200, ok: true, data: null };
  }

  // Standard SMM v2 API uses application/x-www-form-urlencoded POST
  const body = new URLSearchParams();
  body.append('key', MOMO_API_KEY);
  body.append('action', action);

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) {
      body.append(key, String(value));
    }
  }

  try {
    const res = await fetch(MOMO_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
      cache: 'no-store',
    });

    const data = await res.json();
    return { isMock: false as const, status: res.status, ok: res.ok, data };
  } catch (err: any) {
    return {
      isMock: false as const,
      status: 500,
      ok: false,
      data: { error: err.message || 'MomoPanel connection error' },
    };
  }
}

/**
 * Fetch list of all available services from MomoPanel
 */
export async function getServices(): Promise<
  { isMock: true; data: null } | { isMock: false; ok: boolean; data: MomoServiceItem[] }
> {
  const res = await momoRequest('services');
  return res as any;
}

/**
 * Place a new boost order on MomoPanel
 */
export async function addOrder(params: MomoAddOrderParams) {
  const res = await momoRequest('add', params);
  if (res.isMock) return { isMock: true as const };

  if (res.data?.error) {
    return { isMock: false as const, success: false, error: res.data.error };
  }

  return {
    isMock: false as const,
    success: true,
    orderId: res.data?.order,
  };
}

/**
 * Check status of an individual order
 */
export async function getOrderStatus(orderId: number | string) {
  const res = await momoRequest('status', { order: orderId });
  if (res.isMock) return { isMock: true as const };

  if (res.data?.error) {
    return { isMock: false as const, success: false, error: res.data.error };
  }

  return {
    isMock: false as const,
    success: true,
    status: res.data as MomoOrderStatus,
  };
}

/**
 * Check status of multiple orders (comma-separated, up to 100)
 */
export async function getMultipleOrdersStatus(orderIds: (number | string)[]) {
  const res = await momoRequest('status', { orders: orderIds.join(',') });
  if (res.isMock) return { isMock: true as const };

  return {
    isMock: false as const,
    success: true,
    statuses: res.data,
  };
}

/**
 * Query current account balance on MomoPanel
 */
export async function getBalance() {
  const res = await momoRequest('balance');
  if (res.isMock) return { isMock: true as const, balance: '0.00', currency: 'USD' };

  if (res.data?.balance) {
    return {
      isMock: false as const,
      success: true,
      balance: res.data.balance,
      currency: res.data.currency || 'USD',
    };
  }

  return { isMock: false as const, success: false, error: res.data?.error || 'Failed to fetch balance' };
}

