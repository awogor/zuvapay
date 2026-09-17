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

    const {
      amount,
      fee = 0,
      net_amount,
      reference, // Unique transaction reference from Billstack
      account,   // { account_number, account_name, bank_name, reference }
      customer,  // { name, email, phone }
    } = data;

    if (!reference || !amount) {
      return NextResponse.json({ status: false, message: 'Missing reference or amount' }, { status: 400 });
    }

    const depositAmount = typeof amount === 'string' ? parseFloat(amount) : Number(amount);
    if (isNaN(depositAmount) || depositAmount <= 0) {
      return NextResponse.json({ status: false, message: 'Invalid deposit amount' }, { status: 400 });
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
      .eq('reference', reference)
      .maybeSingle();

    if (existingTx) {
      return NextResponse.json({ status: true, message: 'Transaction already processed' });
    }

    // 4. Locate user via virtual_accounts
    const accNumber = account?.account_number;
    const accRef = account?.reference;
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

    const payerName = customer?.name || 'Bank Transfer';
    const bankName = account?.bank_name || '9PSB Bank';
    const description = `Auto-Funded via ${bankName} (${accNumber || 'Dedicated Account'})`;

    // 6. Atomic Deposit Crediting via RPC (with row-level lock and idempotency)
    const { data: rpcRes, error: rpcErr } = await supabase.rpc('credit_wallet_deposit', {
      p_wallet_id: wallet.id,
      p_amount: depositAmount,
      p_description: description,
      p_reference: reference,
      p_metadata: {
        gateway: 'billstack',
        payerName,
        accountNumber: accNumber,
        accountRef: accRef,
        bankName,
        fee,
        net_amount: net_amount || depositAmount,
      },
    });

    let creditedBalance = 0;

    if (!rpcErr && rpcRes && rpcRes.success) {
      creditedBalance = rpcRes.new_balance;
    } else {
      // Fallback if RPC is not available in test environment
      const newBalance = parseFloat(wallet.balance) + depositAmount;
      const { error: updateErr } = await supabase
        .from('wallets')
        .update({ balance: newBalance, updated_at: new Date().toISOString() })
        .eq('id', wallet.id);

      if (updateErr) {
        return NextResponse.json({ status: false, message: 'Failed to credit wallet' }, { status: 500 });
      }

      await supabase.from('transactions').insert({
        wallet_id: wallet.id,
        amount: depositAmount,
        type: 'credit',
        category: 'deposit',
        description,
        reference,
        status: 'completed',
        metadata: {
          gateway: 'billstack',
          payerName,
          accountNumber: accNumber,
          accountRef: accRef,
          bankName,
          fee,
        },
      });

      creditedBalance = newBalance;
    }

    // 7. Dispatch asynchronous branded credit receipt email
    const targetEmail = customer?.email;
    if (targetEmail) {
      sendTransactionalEmail({
        to: targetEmail,
        templateType: 'wallet_credit',
        data: {
          name: customer?.name || payerName || 'Valued Customer',
          amount: depositAmount,
          newBalance: creditedBalance,
          reference,
          payerName,
          bankName,
          date: new Date().toLocaleString('en-NG'),
        },
      }).catch((e) => console.error('Failed to send wallet credit email:', e));
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
