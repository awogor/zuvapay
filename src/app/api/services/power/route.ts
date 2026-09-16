import { NextResponse, type NextRequest } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { subscribeElectricity } from '@/lib/vendors/strowallet';
import { sendTransactionalEmail } from '@/lib/email/sendEmail';
import { checkServiceAvailability } from '@/lib/services/serviceStatusStore';
import { parseElectricityTokens } from '@/lib/electricity/tokenParser';

export async function POST(request: NextRequest) {
  try {
    const serviceCheck = checkServiceAvailability('power');
    if (!serviceCheck.allowed) {
      return NextResponse.json(
        { success: false, error: serviceCheck.message },
        { status: 503 }
      );
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const {
      disco,
      meterNumber,
      meterType,
      amount,
      customerName,
      customerAddress,
      reference,
      recipientEmail,
      action,
      token: existingToken,
      units: existingUnits,
      bonusToken: existingBonusToken,
      bonusUnits: existingBonusUnits,
      tokens: existingTokens,
      operatorReference: existingOpRef,
    } = body;

    // Resend email action
    if (action === 'resend_email') {
      const targetEmail = recipientEmail || user.email;
      if (!targetEmail) {
        return NextResponse.json({ success: false, error: 'Recipient email required' }, { status: 400 });
      }

      if (!existingToken) {
        return NextResponse.json({ success: false, error: 'No token to deliver' }, { status: 400 });
      }

      const emailRes = await sendTransactionalEmail({
        to: targetEmail,
        templateType: 'electricity_token',
        data: {
          name: user.user_metadata?.full_name || customerName || 'Valued Customer',
          disco: (disco || 'DISCO').toUpperCase(),
          meterNumber: meterNumber || '00000000000',
          meterType: meterType || 'Prepaid',
          customerName: customerName || 'Verified Customer',
          customerAddress,
          token: existingToken,
          units: existingUnits,
          bonusToken: existingBonusToken,
          bonusUnits: existingBonusUnits,
          tokens: existingTokens,
          amount: parseFloat(amount) || 0,
          reference: reference || `KP-PWR-${Date.now()}`,
          operatorReference: existingOpRef,
          date: new Date().toLocaleString('en-NG'),
        },
      });

      return NextResponse.json({
        success: true,
        message: `NEPA token successfully emailed to ${targetEmail}`,
        emailSentTo: targetEmail,
        details: emailRes,
      });
    }

    if (!disco || !meterNumber || !amount || !reference) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameters' },
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

      if (amount && Number(tx.amount) < parseFloat(amount)) {
        return NextResponse.json(
          { success: false, error: 'Transaction debit amount is less than required power bill' },
          { status: 400 }
        );
      }

      if (tx.metadata?.fulfillment_status === 'fulfilled') {
        return NextResponse.json(
          { success: false, error: 'Transaction reference has already been fulfilled' },
          { status: 409 }
        );
      }

      verifiedTx = tx;
    }

    const mType = meterType?.toLowerCase() === 'postpaid' ? 'postpaid' : 'prepaid';
    const userPhone = user.phone || user.user_metadata?.phone || user.user_metadata?.phone_number || '08012345678';

    // Call StroWallet API endpoint: POST /api/electricity/request
    const stroRes = await subscribeElectricity({
      meterNumber: String(meterNumber).trim(),
      disco,
      meterType: mType,
      amount: String(amount),
      phone: userPhone,
    });

    if (!stroRes.isMock) {
      const { data, ok } = stroRes;

      if (!ok || data?.success === false || data?.error) {
        const errMsg =
          (typeof data?.message === 'string' ? data.message : null) ||
          data?.response?.response_description ||
          data?.error ||
          'Electricity provider could not generate token at this time. Please verify meter number and amount.';

        return NextResponse.json(
          { 
            success: false, 
            error: errMsg 
          },
          { status: 502 }
        );
      }

      // StroWallet returns token in response.Token or purchased_code or message
      const resp = data?.response || {};
      const parsedTokens = parseElectricityTokens({
        meter_type: mType,
        token: resp?.Token || (resp?.purchased_code ? resp.purchased_code.replace(/^Token\s*:\s*/i, '').trim() : null) || data?.token,
        bonus_token: resp?.BonusToken || resp?.bonus_token || resp?.bonusToken || resp?.gift_token || resp?.free_token || resp?.bsstToken || resp?.bsst_token || resp?.BSSToken || data?.bonus_token,
        bonus_units: resp?.BonusUnits || resp?.bonus_units || resp?.bonusUnits || resp?.free_units || data?.bonus_units,
        units: resp?.Units ? `${resp.Units} kWh` : data?.units,
        kct1: resp?.KCT1 || resp?.kct1,
        kct2: resp?.KCT2 || resp?.kct2,
      });

      const finalToken = parsedTokens.mainToken;
      const finalBonusToken = parsedTokens.bonusToken;
      const finalBonusUnits = parsedTokens.bonusUnits;
      const finalUnits = mType === 'postpaid' ? null : (resp?.Units ? `${resp.Units} kWh` : data?.units || null);
      const finalCustName = resp?.CustomerName || data?.customer_name || customerName || 'Verified Customer';
      const finalCustAddress = resp?.CustomerAddress || data?.customer_address || customerAddress || null;
      const finalOpRef = resp?.transactions?.transactionId || resp?.requestId || resp?.Receipt || data?.reference || `STRO-PWR-${Date.now()}`;
      const targetEmail = recipientEmail || user.email;

      // Dispatched automatically in background
      if (targetEmail) {
        if (mType === 'postpaid') {
          sendTransactionalEmail({
            to: targetEmail,
            templateType: 'service_receipt',
            data: {
              name: user.user_metadata?.full_name || finalCustName || 'Valued Customer',
              serviceName: `${disco.toUpperCase()} Postpaid Electricity Bill`,
              category: 'POWER BILL',
              amount: parseFloat(amount),
              reference,
              date: new Date().toLocaleString('en-NG'),
              details: {
                'Meter / Account': meterNumber,
                'DisCo Provider': disco.toUpperCase(),
                'Customer Name': finalCustName || 'Verified Postpaid Account',
                'Payment Status': 'Payment Settled & Account Credited',
                ...(finalCustAddress ? { 'Premise Address': finalCustAddress } : {}),
                ...(finalOpRef ? { 'Operator Ref': finalOpRef } : {}),
              },
            },
          }).catch((err) => console.error('[Power Postpaid Receipt Email Delivery Error]', err));
        } else {
          sendTransactionalEmail({
            to: targetEmail,
            templateType: 'electricity_token',
            data: {
              name: user.user_metadata?.full_name || finalCustName || 'Valued Customer',
              disco: disco.toUpperCase(),
              meterNumber,
              meterType: 'Prepaid',
              customerName: finalCustName,
              customerAddress: finalCustAddress,
              token: finalToken || undefined,
              units: finalUnits || undefined,
              bonusToken: finalBonusToken || undefined,
              bonusUnits: finalBonusUnits || undefined,
              tokens: parsedTokens.tokens,
              amount: parseFloat(amount),
              reference,
              operatorReference: finalOpRef,
              date: new Date().toLocaleString('en-NG'),
            },
          }).catch((err) => console.error('[Power Token Email Delivery Error]', err));
        }
      }

      if (!isMock && verifiedTx && reference) {
        await adminSupabase
          .from('transactions')
          .update({
            metadata: {
              ...(verifiedTx.metadata || {}),
              fulfillment_status: 'fulfilled',
              operatorReference: finalOpRef,
              meter_type: mType,
              token: finalToken,
              bonus_token: finalBonusToken,
              bonus_units: finalBonusUnits,
              tokens: parsedTokens.tokens,
              units: finalUnits,
              fulfilled_at: new Date().toISOString(),
            },
          })
          .eq('reference', reference);
      }

      return NextResponse.json({
        success: true,
        token: finalToken,
        bonusToken: finalBonusToken,
        bonusUnits: finalBonusUnits,
        tokens: parsedTokens.tokens,
        units: finalUnits,
        meterType: mType,
        operatorReference: finalOpRef,
        disco,
        meterNumber,
        customerName: finalCustName,
        customerAddress: finalCustAddress,
        emailSentTo: targetEmail,
      });
    }

    // Simulation
    await new Promise((res) => setTimeout(res, 600));

    if (meterNumber === '00000000000') {
      return NextResponse.json(
        { success: false, error: 'Disco meter gateway timeout. Automated refund initiated.' },
        { status: 502 }
      );
    }

    const tokenPart = () => Math.floor(1000 + Math.random() * 9000);
    const mockToken = mType === 'postpaid' ? null : `${tokenPart()}-${tokenPart()}-${tokenPart()}-${tokenPart()}-${tokenPart()}`;
    const hasBonus = (meterNumber.endsWith('99') || meterNumber.toLowerCase().includes('bonus')) && mType !== 'postpaid';
    const mockBonusToken = hasBonus ? `${tokenPart()}-${tokenPart()}-${tokenPart()}-${tokenPart()}-${tokenPart()}` : null;
    const mockBonusUnits = hasBonus ? '9.0 kWh' : null;

    const unitsVal = mType === 'postpaid' ? null : `${(parseFloat(amount) / 68.5).toFixed(1)} kWh`;

    const parsedMockTokens = parseElectricityTokens({
      meter_type: mType,
      token: mockToken,
      bonus_token: mockBonusToken,
      bonus_units: mockBonusUnits,
      units: unitsVal,
    });
    const finalCustName = customerName || 'Verified Electricity Customer';
    const finalOpRef = `STRO-PWR-${Date.now()}`;
    const targetEmail = recipientEmail || user.email;

    // Dispatched automatically in background
    if (targetEmail) {
      if (mType === 'postpaid') {
        sendTransactionalEmail({
          to: targetEmail,
          templateType: 'service_receipt',
          data: {
            name: user.user_metadata?.full_name || finalCustName || 'Valued Customer',
            serviceName: `${disco.toUpperCase()} Postpaid Electricity Bill`,
            category: 'POWER BILL',
            amount: parseFloat(amount),
            reference,
            date: new Date().toLocaleString('en-NG'),
            details: {
              'Meter / Account': meterNumber,
              'DisCo Provider': disco.toUpperCase(),
              'Customer Name': finalCustName || 'Verified Postpaid Account',
              'Payment Status': 'Payment Settled & Account Credited',
              ...(customerAddress ? { 'Premise Address': customerAddress } : {}),
              ...(finalOpRef ? { 'Operator Ref': finalOpRef } : {}),
            },
          },
        }).catch((err) => console.error('[Power Postpaid Receipt Email Delivery Error]', err));
      } else {
        sendTransactionalEmail({
          to: targetEmail,
          templateType: 'electricity_token',
          data: {
            name: user.user_metadata?.full_name || finalCustName || 'Valued Customer',
            disco: disco.toUpperCase(),
            meterNumber,
            meterType: 'Prepaid',
            customerName: finalCustName,
            customerAddress,
            token: mockToken || undefined,
            units: unitsVal || undefined,
            bonusToken: mockBonusToken || undefined,
            bonusUnits: mockBonusUnits || undefined,
            tokens: parsedMockTokens.tokens,
            amount: parseFloat(amount),
            reference,
            operatorReference: finalOpRef,
            date: new Date().toLocaleString('en-NG'),
          },
        }).catch((err) => console.error('[Power Token Email Delivery Error]', err));
      }
    }

    if (!isMock && verifiedTx && reference) {
      await adminSupabase
        .from('transactions')
        .update({
          metadata: {
            ...(verifiedTx.metadata || {}),
            fulfillment_status: 'fulfilled',
            operatorReference: finalOpRef,
            meter_type: mType,
            token: mockToken,
            bonus_token: mockBonusToken,
            bonus_units: mockBonusUnits,
            tokens: parsedMockTokens.tokens,
            units: unitsVal,
            fulfilled_at: new Date().toISOString(),
          },
        })
        .eq('reference', reference);
    }

    return NextResponse.json({
      success: true,
      token: mockToken,
      bonusToken: mockBonusToken,
      bonusUnits: mockBonusUnits,
      tokens: parsedMockTokens.tokens,
      units: unitsVal,
      meterType: mType,
      operatorReference: finalOpRef,
      disco,
      meterNumber,
      customerName: finalCustName,
      customerAddress,
      emailSentTo: targetEmail,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
