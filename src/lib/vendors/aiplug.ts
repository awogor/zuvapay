/**
 * AI Plug Marketplace Reseller API Client
 * Official Spec: https://resellers.aiplug.store/api/reseller/v1
 * Currency: Kobo (1 NGN = 100 Kobo)
 */

const AIPLUG_BASE_URL = process.env.AIPLUG_BASE_URL || 'https://resellers.aiplug.store/api/reseller/v1';
const AIPLUG_API_KEY = process.env.AIPLUG_API_KEY || '';

export async function aiplugFetch(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ isMock: boolean; status: number; ok: boolean; data: any }> {
  const isMock =
    !AIPLUG_API_KEY ||
    AIPLUG_API_KEY.includes('mock') ||
    AIPLUG_API_KEY.includes('your-') ||
    AIPLUG_API_KEY.trim() === '';

  if (isMock) {
    return {
      isMock: true,
      status: 200,
      ok: true,
      data: null,
    };
  }

  const cleanBase = AIPLUG_BASE_URL.replace(/\/$/, '');
  const cleanEndpoint = endpoint.replace(/^\//, '');
  const url = `${cleanBase}/${cleanEndpoint}`;

  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${AIPLUG_API_KEY.trim()}`,
        ...(options.headers || {}),
      },
      cache: 'no-store',
    });

    let data: any;
    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      data = await res.json();
    } else {
      const rawText = await res.text();
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

// 1. Fetch live product catalog
export async function getAIPlugCatalog() {
  return aiplugFetch('catalog', {
    method: 'GET',
  });
}

// 2. Fetch reseller wallet balance
export async function getAIPlugBalance() {
  return aiplugFetch('balance', {
    method: 'GET',
  });
}

// 3. Place order
export async function createAIPlugOrder({
  productId,
  quantity = 1,
  customerEmail,
  idempotencyKey,
  deliveryMode = 'portal_only',
}: {
  productId: string;
  quantity?: number;
  customerEmail?: string;
  idempotencyKey: string;
  deliveryMode?: 'portal_only' | 'email_and_portal';
}) {
  return aiplugFetch('orders', {
    method: 'POST',
    headers: {
      'Idempotency-Key': idempotencyKey,
    },
    body: JSON.stringify({
      items: [
        {
          productId,
          quantity,
        },
      ],
      deliveryMode,
      ...(customerEmail ? { customerEmail } : {}),
    }),
  });
}

// 4. Poll / Retrieve order status & delivery details
export async function getAIPlugOrder(orderId: string) {
  return aiplugFetch(`orders/${orderId}`, {
    method: 'GET',
  });
}
