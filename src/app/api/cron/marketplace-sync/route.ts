import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { getAIPlugOrder, parseAIPlugDelivery } from '@/lib/vendors/aiplug';
import { sendTransactionalEmail } from '@/lib/email/sendEmail';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const { searchParams } = new URL(request.url);
    const queryKey = searchParams.get('key');
    const expectedSecret = process.env.CRON_SECRET || '294ZuvGenSecPy';

    const isAuthorized =
      authHeader === `Bearer ${expectedSecret}` ||
      queryKey === expectedSecret;

    if (!isAuthorized) {
      return NextResponse.json({ error: 'Unauthorized cron request' }, { status: 401 });
    }

    const supabase = createAdminClient();
    const threeDaysAgo = new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString();

    // Query active marketplace transactions
    const { data: transactions, error: txError } = await supabase
      .from('transactions')
      .select('*, wallets!inner(user_id)')
      .eq('category', 'marketplace')
      .eq('type', 'debit')
      .gte('created_at', threeDaysAgo)
      .order('created_at', { ascending: false })
      .limit(50);

    if (txError) {
      return NextResponse.json({ success: false, error: txError.message }, { status: 500 });
    }

    let syncedCount = 0;
    let fulfilledCount = 0;

    for (const tx of transactions || []) {
      const meta = tx.metadata || {};
      const supplierOrderId = meta.supplierOrderId || meta.orderId || meta.order_id;
      const isFulfilled =
        meta.fulfillment_status === 'fulfilled' &&
        meta.delivery &&
        (meta.delivery.activationLink || meta.delivery.code || meta.delivery.credentials);

      // Only check orders that have a supplier order ID and are either processing or missing delivery
      if (supplierOrderId && !isFulfilled && tx.status !== 'refunded') {
        try {
          const pollRes = await getAIPlugOrder(String(supplierOrderId));
          syncedCount++;

          if (pollRes.ok && pollRes.data) {
            const orderPayload = pollRes.data.order || pollRes.data.data || pollRes.data;
            const orderStatus = orderPayload.status;
            const deliveryData = orderPayload.delivery || pollRes.data.delivery;

            if (orderStatus === 'fulfilled' && deliveryData) {
              const parsedDelivery = parseAIPlugDelivery(deliveryData);

              const updatedMeta = {
                ...meta,
                fulfillment_status: 'fulfilled',
                fulfilled_at: orderPayload.fulfilledAt || new Date().toISOString(),
                delivery: parsedDelivery,
                cron_synced_at: new Date().toISOString(),
              };

              await supabase
                .from('transactions')
                .update({
                  status: 'completed',
                  metadata: updatedMeta,
                })
                .eq('id', tx.id);

              fulfilledCount++;

              // Fetch customer email
              const { data: customerProfile } = await supabase
                .from('profiles')
                .select('first_name, last_name, email')
                .eq('id', tx.wallets.user_id)
                .maybeSingle();

              const customerEmail =
                meta.customerEmail ||
                customerProfile?.email ||
                tx.user_email;

              const customerName =
                customerProfile?.first_name
                  ? `${customerProfile.first_name} ${customerProfile.last_name || ''}`.trim()
                  : meta.customerName || tx.user_name || 'Valued Customer';

              if (customerEmail) {
                await sendTransactionalEmail({
                  to: customerEmail,
                  templateType: 'marketplace_delivery',
                  data: {
                    recipientName: customerName,
                    productName: meta.productName || orderPayload.productName || tx.description || 'Digital Subscription',
                    reference: tx.reference,
                    activationLink: parsedDelivery.activationLink || undefined,
                    code: parsedDelivery.code || undefined,
                    instructions: parsedDelivery.instructions || undefined,
                    credentials: parsedDelivery.credentials || undefined,
                    quantity: meta.quantity || 1,
                    warranty: '48h Instant Activation & Replacement Guarantee',
                    isReissue: false,
                  },
                }).catch((err) => console.warn('[CRON_DELIVERY_EMAIL_FAILED]', err.message));
              }
            }
          }
        } catch (syncErr: any) {
          console.warn(`[CRON_SYNC_TX_${tx.id}_FAILED]`, syncErr.message);
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Marketplace sync completed. Checked ${syncedCount} orders, fulfilled & emailed ${fulfilledCount}.`,
      syncedCount,
      fulfilledCount,
    });
  } catch (err: any) {
    console.error('Marketplace Sync Cron Error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
