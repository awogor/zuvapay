import { NextResponse, type NextRequest } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { AIProductItem } from '@/types';
import {
  getAIPlugCatalog,
  createAIPlugOrder,
  getAIPlugOrder,
  parseAIPlugDelivery,
  getAIPlugBalance,
  categorizeAIProduct,
} from '@/lib/vendors/aiplug';
import { sendTransactionalEmail } from '@/lib/email/sendEmail';
import { checkServiceAvailability } from '@/lib/services/serviceStatusStore';
import { getPricingConfig, computeRetailPrice } from '@/lib/pricing/pricingStore';
import { AI_MARKETPLACE_CATALOG } from '@/lib/data/aiMarketplaceCatalog';

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

    if (!productId || !reference) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameters (productId, reference).' },
        { status: 400 }
      );
    }

    const adminSupabase = createAdminClient();
    const isMock = process.env.NEXT_PUBLIC_MOCK_DATA === 'true';

    // Anti-exploit guard: Verify debit transaction in database
    let verifiedTx: any = null;
    if (!isMock) {
      const { data: tx, error: txErr } = await adminSupabase
        .from('transactions')
        .select('*, wallets!inner(user_id)')
        .eq('reference', reference)
        .maybeSingle();

      if (txErr || !tx) {
        return NextResponse.json(
          { success: false, error: 'Debit transaction reference not found or unverified' },
          { status: 400 }
        );
      }

      if (tx.wallets?.user_id !== user.id) {
        return NextResponse.json(
          { success: false, error: 'Unauthorized transaction reference' },
          { status: 403 }
        );
      }

      if (tx.type !== 'debit' || tx.status !== 'completed') {
        return NextResponse.json(
          { success: false, error: 'Transaction is not a verified completed debit' },
          { status: 400 }
        );
      }

      if (tx.category !== 'marketplace' && tx.category !== 'digital_service') {
        return NextResponse.json(
          { success: false, error: 'Transaction category mismatch for marketplace order' },
          { status: 400 }
        );
      }

      if (amount && Number(tx.amount) < Number(amount)) {
        return NextResponse.json(
          { success: false, error: 'Debit transaction amount is insufficient for marketplace order' },
          { status: 400 }
        );
      }

      if (tx.metadata?.fulfillment_status === 'fulfilled') {
        return NextResponse.json(
          { success: false, error: 'This transaction has already been fulfilled' },
          { status: 409 }
        );
      }
      verifiedTx = tx;
    }

    const qty = Math.max(1, Number(quantity) || 1);
    const orderIdempotencyKey = reference;

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
          code: `ACT-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
          instructions: `1. Open the activation link or sign in at the official portal.\n2. Use the credentials below if prompted.\n3. Do not change the primary email to keep warranty active.\n\nSupport: Contact ZuvaPay support if you need any assistance.`,
          credentials: `Account: zuvapay_user_${Math.random().toString(36).slice(2, 6)}@gmail.com\nPassword: ProPass${Math.floor(1000 + Math.random() * 9000)}!\nWarranty: 30 Days Replacement Guaranteed`,
          rawText: `Mock License Delivered for ${productName || 'AI Product'}`,
        },
      };

      try {
        const adminSupabase = createAdminClient();
        const { data: existingTx } = await adminSupabase
          .from('transactions')
          .select('id, metadata')
          .eq('reference', orderIdempotencyKey)
          .maybeSingle();

        const mergedMetadata = {
          ...(existingTx?.metadata || {}),
          supplierOrderId: mockOrder.id,
          fulfillment_status: 'fulfilled',
          fulfilled_at: new Date().toISOString(),
          delivery: mockOrder.deliveryDetails,
        };

        await adminSupabase
          .from('transactions')
          .update({
            metadata: mergedMetadata,
            status: 'completed',
          })
          .eq('reference', orderIdempotencyKey);
      } catch (dbErr: any) {
        console.warn('[MARKETPLACE_MOCK_METADATA_UPDATE_FAILED]', dbErr.message);
      }

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

      // 1. Immediately persist failure and provider diagnostic in Postgres transaction ledger
      try {
        const adminSupabase = createAdminClient();
        const { data: existingTx } = await adminSupabase
          .from('transactions')
          .select('id, wallet_id, amount, metadata')
          .eq('reference', orderIdempotencyKey)
          .maybeSingle();

        const baseUpdatedMeta = {
          ...(existingTx?.metadata || {}),
          provider: 'aiplug',
          fulfillment_status: 'failed',
          provider_error: data?.error || data?.message || 'Vendor rejected order fulfillment',
          provider_code: data?.code,
          provider_status: status,
          failed_at: new Date().toISOString(),
        };

        await adminSupabase
          .from('transactions')
          .update({
            status: 'failed',
            metadata: baseUpdatedMeta,
          })
          .eq('reference', orderIdempotencyKey);

        // 2. Server-side atomic auto-refund: restore customer funds immediately without relying on client browser
        if (existingTx) {
          const refundReference = `KP-REF-${orderIdempotencyKey}`;
          const refundDesc = `Refund: Marketplace (${productName || 'Product'}) (Stock replenishment) [Ref: ${orderIdempotencyKey}]`;
          const { data: rpcData, error: rpcErr } = await adminSupabase.rpc('refund_wallet_for_bill', {
            p_wallet_id: existingTx.wallet_id,
            p_amount: Number(existingTx.amount),
            p_category: 'refund',
            p_description: refundDesc,
            p_reference: refundReference,
            p_metadata: {
              original_reference: orderIdempotencyKey,
              refund_reason: 'Provider stock replenishment / upstream failure',
              auto_refund: true,
            },
          });

          if (!rpcErr && rpcData?.success) {
            await adminSupabase
              .from('transactions')
              .update({
                status: 'refunded',
                metadata: {
                  ...baseUpdatedMeta,
                  refunded: true,
                  refund_reference: refundReference,
                  refunded_at: new Date().toISOString(),
                },
              })
              .eq('reference', orderIdempotencyKey);
          }
        }
      } catch (dbErr: any) {
        console.error('[MARKETPLACE_PERSIST_FAILURE_ERROR]', dbErr.message);
      }

      // User-facing error message (never expose internal vendor balance or confuse user)
      const userFacingError = isBalanceOrStockError
        ? 'This item is temporarily undergoing stock replenishment. Your payment was automatically refunded.'
        : 'Service fulfillment timed out. Your payment has been safely refunded to your wallet.';

      // Dispatch urgent notification email to admin in background
      const adminEmailRecipient = process.env.ADMIN_ALERT_EMAIL || process.env.SMTP_FROM_EMAIL || 'hello@zuvapay.com';
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
          refunded: true,
        },
        { status: 502 }
      );
    }

    // Extract order identifier
    const orderPayload = data.order || data.data || data;
    const supplierOrderId = orderPayload.id || orderPayload.orderId || data.id || null;
    let deliveryPayload = data.delivery || orderPayload.delivery || null;

    // If order was queued/pending or delivery not yet attached, briefly poll the order status
    if (supplierOrderId && (!deliveryPayload || orderPayload.status === 'pending' || orderPayload.status === 'processing')) {
      for (let attempt = 0; attempt < 4; attempt++) {
        await new Promise((r) => setTimeout(r, 1800));
        try {
          const pollRes = await getAIPlugOrder(supplierOrderId);
          if (pollRes.ok && pollRes.data) {
            const polledOrder = pollRes.data.order || pollRes.data.data || pollRes.data;
            if (polledOrder?.delivery || pollRes.data?.delivery) {
              deliveryPayload = polledOrder?.delivery || pollRes.data?.delivery;
              orderPayload.status = polledOrder?.status || 'fulfilled';
              break;
            }
          }
        } catch (pollErr: any) {
          console.warn(`[AI_PLUG_POLL_ATTEMPT_${attempt + 1}_FAILED]`, pollErr.message);
        }
      }
    }

    // Parse and normalize delivery text/attributes
    const parsedDelivery = parseAIPlugDelivery(deliveryPayload);
    const hasValidDelivery = Boolean(
      parsedDelivery.activationLink ||
      parsedDelivery.code ||
      (parsedDelivery.credentials && parsedDelivery.credentials.trim().length > 0) ||
      (parsedDelivery.rawText && parsedDelivery.rawText.trim().length > 0)
    );

    const fulfillmentStatus = hasValidDelivery ? 'fulfilled' : 'processing';

    // Save supplierOrderId and parsed delivery into Supabase transactions table
    try {
      const adminSupabase = createAdminClient();
      const { data: existingTx } = await adminSupabase
        .from('transactions')
        .select('id, metadata')
        .eq('reference', orderIdempotencyKey)
        .maybeSingle();

      const mergedMetadata = {
        ...(existingTx?.metadata || {}),
        provider: 'aiplug',
        supplierOrderId: supplierOrderId || undefined,
        fulfillment_status: fulfillmentStatus,
        fulfilled_at: hasValidDelivery ? new Date().toISOString() : undefined,
        delivery: hasValidDelivery ? parsedDelivery : null,
      };

      await adminSupabase
        .from('transactions')
        .update({
          metadata: mergedMetadata,
          status: 'completed',
        })
        .eq('reference', orderIdempotencyKey);
    } catch (dbErr: any) {
      console.error('[MARKETPLACE_METADATA_PERSIST_ERROR]', dbErr.message);
    }

    // Only dispatch delivery transactional email if delivery credentials actually exist!
    const recipientEmail = customerEmail?.trim() || user.email;
    if (recipientEmail && hasValidDelivery) {
      const displayName = user.user_metadata?.first_name || user.email?.split('@')[0] || 'Valued Customer';
      sendTransactionalEmail({
        to: recipientEmail,
        templateType: 'marketplace_delivery',
        data: {
          recipientName: displayName,
          productName: productName || orderPayload.productName || 'Digital Subscription / License',
          reference: orderIdempotencyKey,
          activationLink: parsedDelivery.activationLink || undefined,
          code: parsedDelivery.code || undefined,
          instructions: parsedDelivery.instructions || undefined,
          credentials: parsedDelivery.credentials || undefined,
          quantity: qty,
          warranty: '48h Instant Activation & Replacement Guarantee',
        },
      }).catch((emailErr) => {
        console.warn('[MARKETPLACE_DELIVERY_EMAIL_FAILED]', emailErr.message);
      });
    }

    return NextResponse.json({
      success: true,
      order: {
        id: orderIdempotencyKey,
        status: fulfillmentStatus,
        reference: orderIdempotencyKey,
        productName: productName || orderPayload.productName || 'AI Product',
        quantity: qty,
      },
      delivery: hasValidDelivery ? parsedDelivery : null,
      message: hasValidDelivery
        ? 'Product order completed successfully!'
        : 'Order received and is currently processing. Your credentials will be delivered to your email and dashboard within a few minutes.',
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
