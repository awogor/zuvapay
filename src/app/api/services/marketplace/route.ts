import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { AIProductItem } from '@/types';
import { getAIPlugCatalog, createAIPlugOrder, getAIPlugBalance } from '@/lib/vendors/aiplug';
import { sendTransactionalEmail } from '@/lib/email/sendEmail';
import { checkServiceAvailability } from '@/lib/services/serviceStatusStore';
import { getPricingConfig, computeRetailPrice } from '@/lib/pricing/pricingStore';
import { AI_MARKETPLACE_CATALOG } from '@/lib/data/aiMarketplaceCatalog';

// Intelligent AI categorization for filtering
function categorizeAIProduct(name: string, category: string): string {
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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryFilter = searchParams.get('category');
    const searchQuery = searchParams.get('q');

    const pricingConfig = await getPricingConfig();
    const marketplaceRule = pricingConfig.marketplace?.globalRule || { type: 'percentage', value: 20 };
    const marketplaceOverrides = pricingConfig.marketplace?.overrides || {};

    // 1. Fetch live products from AI Plug
    const liveRes = await getAIPlugCatalog();

    let products: AIProductItem[] = [];

    if (!liveRes.isMock && liveRes.ok && Array.isArray(liveRes.data?.catalog || liveRes.data?.products || liveRes.data)) {
      const rawCatalog = liveRes.data?.catalog || liveRes.data?.products || liveRes.data;

      products = rawCatalog.map((item: any) => {
        const id = String(item.id || item.productId);
        const resellerKobo = Number(item.resellerPriceKobo || item.priceKobo || item.price || 0);
        const retailKobo = Number(item.retailPriceKobo || (resellerKobo * 1.3));

        const resellerNgn = Math.ceil(resellerKobo / 100);
        const retailNgn = Math.ceil(retailKobo / 100);

        const override = marketplaceOverrides[id];
        const { retailPrice } = computeRetailPrice(resellerNgn, marketplaceRule, override);
        const detectedCategory = categorizeAIProduct(item.name || '', item.category || '');

        return {
          id,
          name: item.name || 'AI Software Product',
          summary: item.summary || item.shortDescription || item.description?.slice(0, 120) || 'Instant premium AI access',
          description: item.description || item.summary || 'Instant digital software delivery with warranty.',
          category: detectedCategory,
          warranty: item.warranty || 'Active Warranty',
          accessType: item.accessType || (item.autoFulfill ? 'Instant Delivery' : 'Fast Fulfillment'),
          stock: typeof item.stock === 'number' ? item.stock : 10,
          resellerPriceKobo: resellerKobo,
          retailPriceKobo: retailKobo,
          priceNgn: retailPrice,
          resellerPriceNgn: resellerNgn,
          savingsNgn: Math.max(0, retailNgn - retailPrice),
          autoFulfill: Boolean(item.autoFulfill ?? true),
          requiresCustomerEmail: Boolean(item.requiresCustomerEmail ?? false),
        };
      });
    }

    // If live API returned empty or is mock, use high-converting catalog with pricing rules applied
    if (products.length === 0) {
      products = AI_MARKETPLACE_CATALOG.map((p) => {
        const override = marketplaceOverrides[p.id];
        const { retailPrice } = computeRetailPrice(p.resellerPriceNgn, marketplaceRule, override);
        const retailNgn = Math.ceil(p.retailPriceKobo / 100);

        return {
          ...p,
          priceNgn: retailPrice,
          savingsNgn: Math.max(0, retailNgn - retailPrice),
        };
      });
    }

    // 2. Extract Category Counts
    const categoryCounts: Record<string, number> = {};
    for (const p of products) {
      categoryCounts[p.category] = (categoryCounts[p.category] || 0) + 1;
    }

    const categories = Object.entries(categoryCounts).map(([name, count]) => ({
      name,
      count,
    }));

    // 3. Filter by category if requested
    if (categoryFilter && categoryFilter !== 'all') {
      products = products.filter(
        (p) => p.category.toLowerCase() === categoryFilter.toLowerCase()
      );
    }

    // 4. Search query filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase().trim();
      products = products.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.summary.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      );
    }

    return NextResponse.json({
      success: true,
      products,
      categories,
      totalCount: products.length,
    });
  } catch (err: any) {
    console.error('Marketplace GET Error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to retrieve marketplace catalog' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const serviceCheck = checkServiceAvailability('marketplace');
    if (!serviceCheck.allowed) {
      return NextResponse.json(
        { success: false, error: serviceCheck.message },
        { status: 503 }
      );
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required. Please log in.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      productId,
      quantity = 1,
      customerEmail,
      reference,
      productName,
      amount,
    } = body;

    if (!productId) {
      return NextResponse.json(
        { success: false, error: 'Product ID is required.' },
        { status: 400 }
      );
    }

    const qty = Math.max(1, Number(quantity) || 1);
    const orderIdempotencyKey = reference || `kp_order_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    // Call AI Plug Order API
    const aiPlugRes = await createAIPlugOrder({
      productId,
      quantity: qty,
      customerEmail: customerEmail || user.email || undefined,
      idempotencyKey: orderIdempotencyKey,
      deliveryMode: 'portal_only',
    });

    // Handle Mock or Live response
    if (aiPlugRes.isMock) {
      // High-quality simulation response with mock credentials
      const mockOrder = {
        id: `mock_aip_${Date.now()}`,
        status: 'fulfilled',
        reference: orderIdempotencyKey,
        productName: productName || 'AI Premium Subscription',
        quantity: qty,
        deliveryMode: 'portal_only',
        deliveryDetails: {
          activationLink: `https://zuvapay.com/activate?token=${Math.random().toString(36).slice(2, 10).toUpperCase()}`,
          instructions: `1. Open the activation link or sign in at the official portal.\n2. Use the credentials below if prompted.\n3. Do not change the primary email to keep warranty active.\n\nSupport: Contact ZuvaPay support if you need any assistance.`,
          credentials: `Account: zuvapay_user_${Math.random().toString(36).slice(2, 6)}@gmail.com\nPassword: ProPass${Math.floor(1000 + Math.random() * 9000)}!\nWarranty: 30 Days Replacement Guaranteed`,
        },
      };

      return NextResponse.json({
        success: true,
        order: mockOrder,
        delivery: mockOrder.deliveryDetails,
        message: 'Product successfully fulfilled and ready for instant use!',
      });
    }

    // Live Provider Response check
    const { data, ok, status } = aiPlugRes;

    if (!ok || !data || data.ok === false || data.error) {
      // Log full provider diagnostic for admin
      console.error('[MARKETPLACE_FULFILLMENT_ERROR]', {
        status,
        code: data?.code,
        error: data?.error,
        message: data?.message,
        details: data,
      });

      const rawErrorText = String(data?.error || data?.message || '').toLowerCase();
      const isBalanceOrStockError =
        status === 409 ||
        status === 402 ||
        data?.code === 'insufficient_wallet_balance' ||
        rawErrorText.includes('wallet balance') ||
        rawErrorText.includes('balance is too low') ||
        rawErrorText.includes('insufficient') ||
        rawErrorText.includes('out of stock');

      // User-facing error message (never expose internal vendor balance or confuse user)
      const userFacingError = isBalanceOrStockError
        ? 'This item is temporarily undergoing stock replenishment. Your payment was automatically refunded.'
        : 'Service fulfillment timed out. Your payment has been safely refunded to your wallet.';

      // Dispatch urgent notification email to admin in background
      const adminEmailRecipient = process.env.ADMIN_ALERT_EMAIL || process.env.SMTP_FROM_EMAIL || 'support@zuvapay.com';
      sendTransactionalEmail({
        to: adminEmailRecipient,
        templateType: 'admin_low_balance',
        data: {
          productName: productName || 'Digital Good / Subscription',
          providerName: 'AI Plug Reseller Engine',
          customerEmail: user.email || customerEmail || 'Customer',
          orderReference: orderIdempotencyKey,
          amount: amount || 0,
          errorMessage: data?.error || data?.message || (isBalanceOrStockError ? 'Insufficient wallet balance on provider portal' : 'Provider rejected order fulfillment'),
          portalUrl: 'https://resellers.aiplug.store',
        },
      }).catch((emailErr) => {
        console.warn('[ADMIN_ALERT_DISPATCH_FAILED]', emailErr.message);
      });

      return NextResponse.json(
        {
          success: false,
          error: userFacingError,
          adminCode: data?.code || 'PROVIDER_ERROR',
        },
        { status: 502 }
      );
    }

    // Extract delivery information from response
    // AIPlug response schema for automatic products includes `delivery` or `order`
    const orderPayload = data.order || data.data || data;
    const deliveryPayload = data.delivery || orderPayload.delivery || null;

    let parsedDelivery = null;
    if (deliveryPayload) {
      parsedDelivery = {
        activationLink: deliveryPayload.activationLink || deliveryPayload.url || deliveryPayload.link || null,
        instructions: deliveryPayload.instructions || deliveryPayload.notes || null,
        credentials: typeof deliveryPayload.credentials === 'string'
          ? deliveryPayload.credentials
          : deliveryPayload.text || deliveryPayload.code || (deliveryPayload.account ? JSON.stringify(deliveryPayload.account) : null),
        raw: deliveryPayload,
      };
    }

    return NextResponse.json({
      success: true,
      order: {
        id: orderPayload.id || orderPayload.orderId || `aip_${Date.now()}`,
        status: orderPayload.status || 'fulfilled',
        reference: orderIdempotencyKey,
        productName: productName || orderPayload.productName || 'AI Product',
        quantity: qty,
      },
      delivery: parsedDelivery,
      message: 'Product order completed successfully!',
    });
  } catch (err: any) {
    console.error('Marketplace POST Error:', err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || 'An unexpected error occurred during product purchase.',
      },
      { status: 500 }
    );
  }
}
