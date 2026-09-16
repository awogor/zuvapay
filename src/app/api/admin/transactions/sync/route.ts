import { NextResponse, type NextRequest } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { getAIPlugOrder, parseAIPlugDelivery } from '@/lib/vendors/aiplug';
import { sendTransactionalEmail } from '@/lib/email/sendEmail';

export async function POST(request: NextRequest) {
  try {
    // 1. Admin Authentication & Role Authorization
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    const { data: userProfile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    if (!userProfile || userProfile.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized. Admin privileges required.' }, { status: 403 });
    }

    const body = await request.json();
    const { transactionId } = body;

    if (!transactionId) {
      return NextResponse.json({ success: false, error: 'Transaction ID is required' }, { status: 400 });
    }

    const adminSupabase = createAdminClient();

    // 2. Fetch target transaction with wallet
    const { data: tx, error: txErr } = await adminSupabase
      .from('transactions')
      .select('*, wallets!inner(user_id)')
      .eq('id', transactionId)
      .maybeSingle();

    if (txErr || !tx) {
      return NextResponse.json({ success: false, error: 'Transaction not found' }, { status: 404 });
    }

    const meta = tx.metadata || {};
    const supplierOrderId = meta.supplierOrderId || meta.orderId || meta.order_id;

    if (!supplierOrderId) {
      return NextResponse.json(
        { success: false, error: 'No upstream supplier order ID found on this transaction to sync.' },
        { status: 400 }
      );
    }

    // Resolve customer profile for email delivery
    const { data: customerProfile } = await adminSupabase
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

    // 3. Sync from AI Plug
    if (tx.category === 'marketplace' || tx.category === 'digital_service' || String(supplierOrderId).startsWith('AIP-')) {
      const pollRes = await getAIPlugOrder(String(supplierOrderId));

      if (!pollRes.ok || !pollRes.data) {
        return NextResponse.json(
          { success: false, error: pollRes.data?.error || pollRes.data?.message || 'Failed to fetch order from AI Plug' },
          { status: 400 }
        );
      }

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
          synced_at: new Date().toISOString(),
          synced_by: user.email,
        };

        await adminSupabase
          .from('transactions')
          .update({
            status: 'completed',
            metadata: updatedMeta,
          })
          .eq('id', tx.id);

        // Dispatch live delivery email to customer
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
          }).catch((err) => console.warn('[SYNC_DELIVERY_EMAIL_FAILED]', err.message));
        }

        return NextResponse.json({
          success: true,
          status: 'fulfilled',
          message: 'Order verified and fulfilled by AI Plug! Delivery credentials saved and emailed to customer.',
          delivery: parsedDelivery,
          transaction: { ...tx, status: 'completed', metadata: updatedMeta },
        });
      }

      if (orderStatus === 'processing' || orderStatus === 'pending') {
        const updatedMeta = {
          ...meta,
          fulfillment_status: 'processing',
          last_sync_check_at: new Date().toISOString(),
        };

        await adminSupabase
          .from('transactions')
          .update({
            metadata: updatedMeta,
          })
          .eq('id', tx.id);

        return NextResponse.json({
          success: false,
          status: orderStatus,
          message: `Order is currently ${orderStatus.toUpperCase()} on AI Plug. Waiting for supplier release.`,
          transaction: { ...tx, metadata: updatedMeta },
        });
      }

      return NextResponse.json({
        success: false,
        status: orderStatus,
        message: `AI Plug reported order status: ${orderStatus}`,
      });
    }

    return NextResponse.json({ success: false, error: 'Automatic sync not configured for this vendor' }, { status: 400 });
  } catch (err: any) {
    console.error('Admin Sync Error:', err);
    return NextResponse.json({ success: false, error: err.message || 'Failed to sync transaction' }, { status: 500 });
  }
}
