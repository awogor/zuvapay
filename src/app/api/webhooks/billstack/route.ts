import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyBillstackWebhook } from '@/lib/billstack';
import { sendTransactionalEmail } from '@/lib/email/sendEmail';

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const headers = request.headers;

    // 1. Signature Verification
    const secretKey = process.env.BILLSTACK_SECRET_KEY;
    const isProduction = process.env.NODE_ENV === 'production';

    if (isProduction && !secretKey) {
      console.error('[BILLSTACK_WEBHOOK] Missing BILLSTACK_SECRET_KEY in production environment!');
      return NextResponse.json(
        { status: false, message: 'Server webhook configuration error' },
        { status: 500 }
      );
    }

    if (secretKey) {
      const isValid = verifyBillstackWebhook(rawBody, headers, secretKey);
      if (!isValid) {
        console.warn('[BILLSTACK_WEBHOOK] Invalid or missing signature rejected.');
        return NextResponse.json({ status: false, message: 'Invalid signature' }, { status: 401 });
      }
    } else {
      console.log('[BILLSTACK_WEBHOOK] Development local bypass active');
    }

    // 2. Parse Payload
    let payload: any;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ status: false, message: 'Invalid JSON body' }, { status: 400 });
    }

    const { event, data } = payload || {};

    // Billstack events: "PAYMENT_NOTIFICATION"
    if (event !== 'PAYMENT_NOTIFICATION') {
      return NextResponse.json({ status: true, message: 'Event ignored' }, { status: 200 });
    }

    if (!data) {
      return NextResponse.json({ status: false, message: 'Missing transaction data' }, { status: 400 });
    }

    // Verify transaction status: only credit completed/successful deposits
    const txStatus = (data.status || '').toUpperCase();
    if (txStatus && txStatus !== 'SUCCESS' && txStatus !== 'SUCCESSFUL' && txStatus !== 'COMPLETED') {
      console.warn(`[BILLSTACK_WEBHOOK] Non-successful transaction status ignored: ${data.status}`);
      return NextResponse.json({ status: true, message: `Event ignored (status: ${data.status})` }, { status: 200 });
    }

    const {
      amount,
      fee = 0,
      net_amount,
      reference,
      merchant_reference,
      transaction_ref,
      wiaxy_ref,
      account,   // { account_number, account_name, bank_name, reference }
      customer,  // { name, firstName, lastName, email, phone }
      payer,     // Array of payers
    } = data;

    const txReference = transaction_ref || wiaxy_ref || reference;
    if (!txReference || !amount) {
      return NextResponse.json({ status: false, message: 'Missing reference or amount' }, { status: 400 });
    }

    const rawAmount = typeof amount === 'string' ? parseFloat(amount) : Number(amount);
    if (isNaN(rawAmount) || rawAmount <= 0) {
      return NextResponse.json({ status: false, message: 'Invalid deposit amount' }, { status: 400 });
    }

    // Dedicated virtual account flat fee: ₦50 per deposit
    const flatFee = 50;
    const feeCharged = typeof fee === 'number' && fee > 0 ? fee : flatFee;

    // Credit net amount to wallet (gross amount transferred minus ₦50 flat fee)
    const depositAmount =
      net_amount && Number(net_amount) > 0 && Number(net_amount) < rawAmount
        ? Number(net_amount)
        : Math.max(0, rawAmount - feeCharged);

    if (depositAmount <= 0) {
      console.warn(`[BILLSTACK_WEBHOOK] Deposit amount after ₦${feeCharged} fee is zero or negative: raw ${rawAmount}`);
      return NextResponse.json(
        { status: false, message: `Deposit amount must exceed the ₦${feeCharged} service fee` },
        { status: 400 }
      );
    }

    // Initialize Supabase admin / service client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ status: false, message: 'Supabase configuration missing' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // 3. Idempotency Check: Prevent duplicate credit if webhook is redelivered
    const { data: existingTx } = await supabase
      .from('transactions')
      .select('id')
      .or(`reference.eq.${txReference},reference.eq.${reference || txReference}`)
      .maybeSingle();

    if (existingTx) {
      return NextResponse.json({ status: true, message: 'Transaction already processed' });
    }

    // 4. Locate user via virtual_accounts
    const accNumber = account?.account_number || payer?.[0]?.account_number;
    const accRef = merchant_reference || account?.reference;
    let userId: string | null = null;

    if (accRef) {
      const { data: va } = await supabase
        .from('virtual_accounts')
        .select('user_id')
        .eq('account_reference', accRef)
        .maybeSingle();
      if (va) userId = va.user_id;
    }

    if (!userId && accNumber) {
      const { data: va } = await supabase
        .from('virtual_accounts')
        .select('user_id')
        .eq('account_number', accNumber)
        .maybeSingle();
      if (va) userId = va.user_id;
    }

    // Fallback: match by customer email
    if (!userId && customer?.email) {
      const { data: usersData } = await supabase.auth.admin.listUsers();
      const matched = usersData?.users?.find(
        (u) => u.email?.toLowerCase() === customer.email.toLowerCase()
      );
      if (matched) userId = matched.id;
    }

    if (!userId) {
      console.warn(`[BILLSTACK_WEBHOOK] No user matched reference ${reference}, acc ${accNumber}, or email ${customer?.email}`);
      return NextResponse.json({ status: false, message: 'User could not be identified' }, { status: 404 });
    }

    // 5. Retrieve user's NGN wallet
    const { data: wallet, error: walletErr } = await supabase
      .from('wallets')
      .select('id, balance')
      .eq('user_id', userId)
      .eq('currency', 'NGN')
      .single();

    if (walletErr || !wallet) {
      return NextResponse.json({ status: false, message: 'User wallet not found' }, { status: 404 });
    }

    const payerName =
      customer?.name ||
      (customer?.firstName ? `${customer.firstName} ${customer.lastName || ''}`.trim() : null) ||
      payer?.[0]?.account_name ||
      account?.account_name ||
      'Bank Transfer';
    const bankName = account?.bank_name || '9PSB Bank';
    const description = `Auto-Funded via ${bankName} (${accNumber || 'Dedicated Account'}) [₦${feeCharged} Fee Deducted]`;

    // 6. Atomic Deposit Crediting via RPC (with row-level lock and idempotency)
    const { data: rpcRes, error: rpcErr } = await supabase.rpc('credit_wallet_deposit', {
      p_wallet_id: wallet.id,
      p_amount: depositAmount,
      p_description: description,
      p_reference: txReference,
      p_metadata: {
        gateway: 'billstack',
        payerName,
        accountNumber: accNumber,
        accountRef: accRef,
        bankName,
        gross_amount: rawAmount,
        fee: feeCharged,
        net_amount: depositAmount,
        transaction_ref: txReference,
        billstack_ref: reference,
        merchant_reference: merchant_reference || accRef,
      },
    });

    if (rpcErr || (rpcRes && rpcRes.success === false)) {
      console.error('[BILLSTACK_WEBHOOK] RPC credit error:', rpcErr || rpcRes?.error);
      return NextResponse.json(
        { status: false, message: rpcErr?.message || rpcRes?.error || 'Failed to credit wallet' },
        { status: 500 }
      );
    }

    const creditedBalance = rpcRes?.new_balance ?? (parseFloat(wallet.balance) + depositAmount);

    // 7. Dispatch asynchronous branded credit receipt email to the actual wallet owner
    try {
      const { data: authUserData } = await supabase.auth.admin.getUserById(userId);
      const ownerEmail = authUserData?.user?.email;

      const { data: profile } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('id', userId)
        .maybeSingle();

      const ownerName = profile?.first_name
        ? `${profile.first_name} ${profile.last_name || ''}`.trim()
        : authUserData?.user?.user_metadata?.first_name || 'Valued Customer';

      if (ownerEmail) {
        sendTransactionalEmail({
          to: ownerEmail,
          templateType: 'wallet_credit',
          data: {
            name: ownerName,
            amount: depositAmount,
            newBalance: creditedBalance,
            reference: txReference,
            payerName,
            bankName,
            date: new Date().toLocaleString('en-NG'),
          },
        }).catch((e) => console.error('[BILLSTACK_WEBHOOK] Failed to send wallet credit email:', e));
      }
    } catch (notifyErr) {
      console.warn('[BILLSTACK_WEBHOOK] Notification lookup failed:', notifyErr);
    }

    return NextResponse.json({
      status: true,
      message: 'successful',
      new_balance: creditedBalance,
    });
  } catch (err: any) {
    console.error('[BILLSTACK_WEBHOOK] Exception:', err);
    return NextResponse.json({ status: false, message: err.message || 'Webhook error' }, { status: 500 });
  }
}
