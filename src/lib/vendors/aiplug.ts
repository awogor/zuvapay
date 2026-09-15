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

// Intelligent AI categorization for filtering
export function categorizeAIProduct(name: string, category: string): string {
  const n = (name + ' ' + (category || '')).toLowerCase();

  if (
    n.includes('chatgpt') ||
    n.includes('openai') ||
    n.includes('gemini') ||
    n.includes('claude') ||
    n.includes('grok') ||
    n.includes('perplexity') ||
    n.includes('llm') ||
    n.includes('poe')
  ) {
    return 'AI Assistants & LLMs';
  }

  if (
    n.includes('capcut') ||
    n.includes('elevenlabs') ||
    n.includes('midjourney') ||
    n.includes('runway') ||
    n.includes('pika') ||
    n.includes('suno') ||
    n.includes('udio') ||
    n.includes('fliki') ||
    n.includes('heygen') ||
    n.includes('video') ||
    n.includes('audio') ||
    n.includes('voice')
  ) {
    return 'Video, Audio & Creative';
  }

  if (
    n.includes('canva') ||
    n.includes('figma') ||
    n.includes('adobe') ||
    n.includes('freepik') ||
    n.includes('envato') ||
    n.includes('vecteezy') ||
    n.includes('design') ||
    n.includes('photo')
  ) {
    return 'Design & Graphics';
  }

  if (
    n.includes('cursor') ||
    n.includes('copilot') ||
    n.includes('github') ||
    n.includes('supabase') ||
    n.includes('v0') ||
    n.includes('replit') ||
    n.includes('codeium') ||
    n.includes('developer') ||
    n.includes('api') ||
    n.includes('flow')
  ) {
    return 'Developer & Coding Tools';
  }

  if (
    n.includes('quillbot') ||
    n.includes('grammarly') ||
    n.includes('turnitin') ||
    n.includes('notion') ||
    n.includes('word') ||
    n.includes('office') ||
    n.includes('writing') ||
    n.includes('education')
  ) {
    return 'Productivity & Writing';
  }

  if (
    n.includes('vpn') ||
    n.includes('nord') ||
    n.includes('express') ||
    n.includes('surfshark') ||
    n.includes('security')
  ) {
    return 'VPN & Privacy';
  }

  return 'Software & Utilities';
}

export interface ParsedAIPlugDelivery {
  activationLink: string | null;
  code: string | null;
  instructions: string | null;
  credentials: string | null;
  rawText: string;
}

export function parseAIPlugDelivery(delivery: any): ParsedAIPlugDelivery {
  if (!delivery) {
    return {
      activationLink: null,
      code: null,
      instructions: null,
      credentials: null,
      rawText: '',
    };
  }

  if (typeof delivery === 'object') {
    return {
      activationLink: delivery.activationLink || delivery.url || delivery.link || null,
      code: delivery.code || delivery.token || null,
      instructions: delivery.instructions || delivery.notes || null,
      credentials: typeof delivery.credentials === 'string'
        ? delivery.credentials
        : delivery.text || (delivery.account ? JSON.stringify(delivery.account) : null),
      rawText: typeof delivery.raw === 'string' ? delivery.raw : JSON.stringify(delivery),
    };
  }

  const rawText = String(delivery).trim();

  // Extract URLs (like activation links)
  const urlMatches = rawText.match(/https?:\/\/[^\s]+/gi);
  const activationLink = urlMatches && urlMatches.length > 0 ? urlMatches[0] : null;

  // Extract code (e.g. Your code: XXX or the activation link)
  let code: string | null = null;
  const codeMatch = rawText.match(/Your code:?\s*([^\n\r]+)/i);
  if (codeMatch && codeMatch[1]) {
    code = codeMatch[1].trim();
  } else if (activationLink) {
    code = activationLink;
  }

  // Extract Instructions (e.g. How To Redeem...)
  let instructions: string | null = null;
  const instructionsIdx = rawText.search(/how to redeem/i);
  if (instructionsIdx !== -1) {
    instructions = rawText.substring(instructionsIdx).trim();
  } else if (!activationLink) {
    instructions = rawText;
  }

  return {
    activationLink,
    code,
    instructions,
    credentials: rawText,
    rawText,
  };
}
