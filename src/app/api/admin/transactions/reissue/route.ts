import { NextResponse, type NextRequest } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { createAIPlugOrder, getAIPlugOrder, parseAIPlugDelivery } from '@/lib/vendors/aiplug';
import { buyStroWalletData, buyAirtime } from '@/lib/vendors/strowallet';
import { gongozFetch, NETWORK_IDS } from '@/lib/vendors/gongoz';
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
    const { transactionId, mode = 'auto', manualDelivery } = body;

    if (!transactionId) {
      return NextResponse.json({ success: false, error: 'Transaction ID is required' }, { status: 400 });
    }

    const adminSupabase = createAdminClient();

    // 2. Fetch target transaction with wallet & user info
    const { data: tx, error: txErr } = await adminSupabase
      .from('transactions')
      .select('*, wallets!inner(user_id, balance)')
      .eq('id', transactionId)
      .maybeSingle();

    if (txErr || !tx) {
      return NextResponse.json({ success: false, error: 'Transaction not found' }, { status: 404 });
    }

    if (tx.type !== 'debit') {
      return NextResponse.json({ success: false, error: 'Only debit transactions can be fulfilled or reissued' }, { status: 400 });
    }

    // Resolve customer profile for email delivery
    const { data: customerProfile } = await adminSupabase
      .from('profiles')
      .select('first_name, last_name, email, phone_number')
      .eq('id', tx.wallets.user_id)
      .maybeSingle();

    const customerEmail =
      tx.metadata?.customerEmail ||
      customerProfile?.email ||
      tx.metadata?.user_email ||
      tx.user_email;

    const customerName =
      customerProfile?.first_name
        ? `${customerProfile.first_name} ${customerProfile.last_name || ''}`.trim()
        : tx.metadata?.customerName || tx.user_name || 'Valued Customer';

    // 3. Mode A: Manual Fulfillment / Credential Injection
    if (mode === 'manual') {
      if (!manualDelivery || (!manualDelivery.activationLink && !manualDelivery.code && !manualDelivery.credentials && !manualDelivery.rawText)) {
        return NextResponse.json({ success: false, error: 'Manual delivery details (link, code, or credentials) are required' }, { status: 400 });
      }

      const parsedManual = {
        activationLink: manualDelivery.activationLink?.trim() || null,
        code: manualDelivery.code?.trim() || null,
        credentials: manualDelivery.credentials?.trim() || null,
        instructions: manualDelivery.instructions?.trim() || 'Follow the instructions above to activate your subscription.',
        rawText: manualDelivery.rawText?.trim() || '',
      };

      const updatedMeta = {
        ...(tx.metadata || {}),
        fulfillment_status: 'fulfilled',
        fulfilled_at: new Date().toISOString(),
        delivery: parsedManual,
        reissued_at: new Date().toISOString(),
        reissued_by: user.email,
        fulfillment_type: 'admin_manual',
      };

      await adminSupabase
        .from('transactions')
        .update({
          status: 'completed',
          metadata: updatedMeta,
        })
        .eq('id', tx.id);

      // Dispatch customer delivery email
      if (customerEmail) {
        await sendTransactionalEmail({
          to: customerEmail,
          templateType: 'marketplace_delivery',
          data: {
            recipientName: customerName,
            productName: tx.metadata?.productName || tx.description || 'Digital Subscription',
            reference: tx.reference,
            activationLink: parsedManual.activationLink || undefined,
            code: parsedManual.code || undefined,
            instructions: parsedManual.instructions || undefined,
            credentials: parsedManual.credentials || undefined,
            quantity: tx.metadata?.quantity || 1,
            warranty: 'Manual Admin Fulfillment & Active Warranty',
            isReissue: true,
          },
        }).catch((err) => console.warn('[ADMIN_MANUAL_DELIVERY_EMAIL_FAILED]', err.message));
      }

      return NextResponse.json({
        success: true,
        message: 'Order manually fulfilled and delivery email sent to customer!',
        delivery: parsedManual,
        transaction: { ...tx, status: 'completed', metadata: updatedMeta },
      });
    }

    // 4. Mode B: Automated Reissue via Provider
    if (tx.category === 'marketplace' || tx.category === 'digital_service') {
      const productId = tx.metadata?.productId;
      const quantity = Math.max(1, Number(tx.metadata?.quantity) || 1);

      if (!productId) {
        return NextResponse.json({ success: false, error: 'Cannot auto-reissue: Product ID is missing in transaction metadata.' }, { status: 400 });
      }

      // Generate a fresh idempotency key to prevent collision with previously rejected calls
      const idempotencyKey = `ZP-REISSUE-${tx.reference}-${Date.now().toString(36).toUpperCase()}`;

      const aiPlugRes = await createAIPlugOrder({
        productId,
        quantity,
        customerEmail: customerEmail || undefined,
        idempotencyKey,
        deliveryMode: 'portal_only',
      });

      if (aiPlugRes.isMock) {
        return NextResponse.json({ success: false, error: 'AI Plug is running in mock mode. Live API key is required to reissue.' }, { status: 400 });
      }

      const { data, ok, status } = aiPlugRes;

      if (!ok || !data || data.ok === false || data.error) {
        const rawError = data?.error || data?.message || 'Vendor rejected order fulfillment';
        console.error('[ADMIN_REISSUE_AIPLUG_FAILED]', { status, error: rawError, data });

        // Record attempt in transaction metadata for audit trail
        await adminSupabase
          .from('transactions')
          .update({
            metadata: {
              ...(tx.metadata || {}),
              last_reissue_error: rawError,
              last_reissue_attempt_at: new Date().toISOString(),
              last_reissue_attempt_by: user.email,
            },
          })
          .eq('id', tx.id);

        return NextResponse.json(
          {
            success: false,
            error: `AI Plug Error: ${rawError}`,
            code: data?.code,
          },
          { status: 400 }
        );
      }

      // Extract order and delivery payload
      const orderPayload = data.order || data.data || data;
      const supplierOrderId = orderPayload.id || orderPayload.orderId || data.id || null;
      let deliveryPayload = data.delivery || orderPayload.delivery || null;

      // Poll briefly if delivery not immediately attached
      if (supplierOrderId && (!deliveryPayload || orderPayload.status === 'pending' || orderPayload.status === 'processing')) {
        for (let attempt = 0; attempt < 3; attempt++) {
          await new Promise((r) => setTimeout(r, 1800));
          try {
            const pollRes = await getAIPlugOrder(supplierOrderId);
            if (pollRes.ok && pollRes.data) {
              const polledOrder = pollRes.data.order || pollRes.data.data || pollRes.data;
              if (polledOrder?.delivery || pollRes.data?.delivery) {
                deliveryPayload = polledOrder?.delivery || pollRes.data?.delivery;
                break;
              }
            }
          } catch (pollErr: any) {
            console.warn(`[REISSUE_POLL_ATTEMPT_${attempt + 1}_FAILED]`, pollErr.message);
          }
        }
      }

      const parsedDelivery = parseAIPlugDelivery(deliveryPayload);

      const updatedMeta = {
        ...(tx.metadata || {}),
        provider: 'aiplug',
        supplierOrderId: supplierOrderId || undefined,
        fulfillment_status: 'fulfilled',
        fulfilled_at: new Date().toISOString(),
        reissued_at: new Date().toISOString(),
        reissued_by: user.email,
        delivery: parsedDelivery,
        last_reissue_error: null,
      };

      await adminSupabase
        .from('transactions')
        .update({
          status: 'completed',
          metadata: updatedMeta,
        })
        .eq('id', tx.id);

      // Dispatch delivery transactional email to customer
      if (customerEmail) {
        await sendTransactionalEmail({
          to: customerEmail,
          templateType: 'marketplace_delivery',
          data: {
            recipientName: customerName,
            productName: tx.metadata?.productName || orderPayload.productName || 'Digital Subscription',
            reference: tx.reference,
            activationLink: parsedDelivery.activationLink || undefined,
            code: parsedDelivery.code || undefined,
            instructions: parsedDelivery.instructions || undefined,
            credentials: parsedDelivery.credentials || undefined,
            quantity,
            warranty: '48h Instant Activation & Replacement Guarantee',
            isReissue: true,
          },
        }).catch((emailErr) => {
          console.warn('[REISSUE_DELIVERY_EMAIL_FAILED]', emailErr.message);
        });
      }

      return NextResponse.json({
        success: true,
        message: 'Product successfully reissued via AI Plug and delivered to customer!',
        delivery: parsedDelivery,
        supplierOrderId,
        transaction: { ...tx, status: 'completed', metadata: updatedMeta },
      });
    }

    // 5. Mode B: Automated Reissue via Data Providers (Gongoz or StroWallet)
    if (tx.category === 'data') {
      const { phone, network, planId, variationCode, serviceName, serviceId } = tx.metadata || {};
      const targetPhone = phone || tx.metadata?.phone_number || tx.user_phone;
      const targetNetwork = String(network || '').toUpperCase();

      if (!targetPhone) {
        return NextResponse.json(
          { success: false, error: 'Cannot auto-reissue: Recipient phone number is missing from transaction metadata.' },
          { status: 400 }
        );
      }

      const isStro = tx.metadata?.provider === 'strowallet' || String(planId).startsWith('stro-');
      if (isStro) {
        const code = variationCode || String(planId).replace(/^stro-[^-]+-/, '');
        const stroRes = await buyStroWalletData({
          network: targetNetwork || 'MTN',
          phone: targetPhone,
          variationCode: code,
          amount: Number(tx.amount) || 100,
          serviceName,
          serviceId,
        });

        if (!stroRes.isMock) {
          const { data, ok } = stroRes;
          if (!ok || data?.success === false || data?.error) {
            const errMsg =
              data?.message ||
              data?.response?.response_description ||
              data?.error ||
              'StroWallet data delivery failed';
            return NextResponse.json({ success: false, error: `StroWallet Error: ${errMsg}` }, { status: 502 });
          }
          const opRef = data?.response?.transactions?.transactionId || data?.reference || `STRO-DAT-${Date.now()}`;
          const updatedMeta = {
            ...(tx.metadata || {}),
            fulfillment_status: 'fulfilled',
            operatorReference: opRef,
            provider: 'strowallet',
            fulfilled_at: new Date().toISOString(),
            reissued_at: new Date().toISOString(),
            reissued_by: user.email,
          };
          await adminSupabase.from('transactions').update({ status: 'completed', metadata: updatedMeta }).eq('id', tx.id);
          return NextResponse.json({
            success: true,
            message: `Data bundle successfully delivered to ${targetPhone} via StroWallet!`,
            operatorReference: opRef,
            transaction: { ...tx, status: 'completed', metadata: updatedMeta },
          });
        }
      } else {
        // GongozConcept Data
        const gongozPlanId =
          tx.metadata?.gongozPlanId ||
          tx.metadata?.plan_id ||
          parseInt(String(planId).replace(/^[^\d]+/, '')) ||
          8;
        const networkId = NETWORK_IDS[targetNetwork] || 1;

        const gongozRes = await gongozFetch('data/', {
          method: 'POST',
          body: JSON.stringify({
            network: networkId,
            mobile_number: targetPhone,
            plan: gongozPlanId,
            Ported_number: true,
          }),
        });

        if (!gongozRes.isMock) {
          const { data, ok } = gongozRes;
          if (!ok || data?.status === 'failed') {
            const errMsg = data?.message || data?.error || 'GongozConcept data delivery rejected';
            return NextResponse.json({ success: false, error: `Gongoz Error: ${errMsg}` }, { status: 502 });
          }
          const opRef = data?.id || data?.operator_ref || `GONGOZ-DAT-${Date.now()}`;
          const updatedMeta = {
            ...(tx.metadata || {}),
            fulfillment_status: 'fulfilled',
            operatorReference: opRef,
            provider: 'gongoz',
            fulfilled_at: new Date().toISOString(),
            reissued_at: new Date().toISOString(),
            reissued_by: user.email,
          };
          await adminSupabase.from('transactions').update({ status: 'completed', metadata: updatedMeta }).eq('id', tx.id);
          return NextResponse.json({
            success: true,
            message: `Data bundle successfully delivered to ${targetPhone} via Gongoz!`,
            operatorReference: opRef,
            transaction: { ...tx, status: 'completed', metadata: updatedMeta },
          });
        }
      }

      // Simulation fallback
      const mockOpRef = `DAT-REISSUE-${Date.now()}`;
      const updatedMeta = {
        ...(tx.metadata || {}),
        fulfillment_status: 'fulfilled',
        operatorReference: mockOpRef,
        fulfilled_at: new Date().toISOString(),
        reissued_at: new Date().toISOString(),
        reissued_by: user.email,
      };
      await adminSupabase.from('transactions').update({ status: 'completed', metadata: updatedMeta }).eq('id', tx.id);
      return NextResponse.json({
        success: true,
        message: `Data bundle simulated delivery to ${targetPhone}!`,
        operatorReference: mockOpRef,
        transaction: { ...tx, status: 'completed', metadata: updatedMeta },
      });
    }

    // 6. Mode B: Automated Reissue via Airtime Provider (StroWallet)
    if (tx.category === 'airtime') {
      const targetPhone = tx.metadata?.phone || tx.metadata?.phone_number || tx.user_phone;
      const targetNetwork = String(tx.metadata?.network || '').toUpperCase();
      if (!targetPhone) {
        return NextResponse.json({ success: false, error: 'Cannot auto-reissue: Phone number missing.' }, { status: 400 });
      }
      const stroRes = await buyAirtime({
        network: targetNetwork || 'MTN',
        phone: targetPhone,
        amount: Number(tx.amount),
      });
      if (!stroRes.isMock) {
        const { data, ok } = stroRes;
        if (!ok || data?.success === false) {
          const errMsg = data?.message || data?.error || 'StroWallet Airtime delivery failed';
          return NextResponse.json({ success: false, error: `Airtime Error: ${errMsg}` }, { status: 502 });
        }
        const opRef = data?.response?.transactions?.transactionId || `STRO-AIR-${Date.now()}`;
        const updatedMeta = {
          ...(tx.metadata || {}),
          fulfillment_status: 'fulfilled',
          operatorReference: opRef,
          provider: 'strowallet',
          fulfilled_at: new Date().toISOString(),
          reissued_at: new Date().toISOString(),
          reissued_by: user.email,
        };
        await adminSupabase.from('transactions').update({ status: 'completed', metadata: updatedMeta }).eq('id', tx.id);
        return NextResponse.json({
          success: true,
          message: `Airtime successfully reissued to ${targetPhone}!`,
          operatorReference: opRef,
          transaction: { ...tx, status: 'completed', metadata: updatedMeta },
        });
      }

      // Simulation fallback
      const mockOpRef = `AIR-REISSUE-${Date.now()}`;
      const updatedMeta = {
        ...(tx.metadata || {}),
        fulfillment_status: 'fulfilled',
        operatorReference: mockOpRef,
        fulfilled_at: new Date().toISOString(),
        reissued_at: new Date().toISOString(),
        reissued_by: user.email,
      };
      await adminSupabase.from('transactions').update({ status: 'completed', metadata: updatedMeta }).eq('id', tx.id);
      return NextResponse.json({
        success: true,
        message: `Airtime simulated delivery to ${targetPhone}!`,
        operatorReference: mockOpRef,
        transaction: { ...tx, status: 'completed', metadata: updatedMeta },
      });
    }

    return NextResponse.json({
      success: false,
      error: `Automated live API reissue is not configured for ${tx.category}. Please click "Cancel & Refund" to immediately credit customer wallet, or fulfill manually.`,
    }, { status: 400 });
  } catch (err: any) {
    console.error('Admin Reissue Error:', err);
    return NextResponse.json({ success: false, error: err.message || 'Failed to reissue transaction' }, { status: 500 });
  }
}
