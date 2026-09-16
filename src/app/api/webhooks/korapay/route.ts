import { NextResponse, type NextRequest } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';
import { sendTransactionalEmail } from '@/lib/email/sendEmail';

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('x-korapay-signature');

    const korapaySecretKey = process.env.KORAPAY_SECRET_KEY;

    // 1. Fail-closed HMAC SHA256 Signature Verification
    if (!korapaySecretKey) {
      console.error('Korapay Webhook Error: KORAPAY_SECRET_KEY is not configured on the server');
      return NextResponse.json({ error: 'Server webhook configuration error' }, { status: 500 });
    }

    if (!signature) {
      return NextResponse.json({ error: 'Missing x-korapay-signature header' }, { status: 401 });
    }

    const expectedHash = crypto
      .createHmac('sha256', korapaySecretKey)
      .update(rawBody)
      .digest('hex');

    // Timing-safe comparison against timing attacks
    const sigBuffer = Buffer.from(signature, 'utf8');
    const expectedBuffer = Buffer.from(expectedHash, 'utf8');

    if (sigBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(sigBuffer, expectedBuffer)) {
      return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 401 });
    }

    const payload = JSON.parse(rawBody);
    const { event, data } = payload;

    if (event !== 'charge.success' || data?.status !== 'success') {
      return NextResponse.json({ status: 'ignored', message: 'Event not actionable' });
    }

    const {
      reference,
      amount,
      currency = 'NGN',
      virtual_bank_account_details,
    } = data;

    const vba = virtual_bank_account_details?.virtual_bank_account;
    const accountRef = vba?.account_reference;
    const accountNumber = vba?.account_number;
    const payerName =
      virtual_bank_account_details?.payer_bank_account?.account_name || 'Bank Transfer';

    if (!reference || !amount) {
      return NextResponse.json({ error: 'Missing payment data' }, { status: 400 });
    }

    // Initialize Supabase admin / service client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: 'Supabase configuration missing' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // 2. Idempotency Check: Prevent duplicate credit if webhook is redelivered
    const { data: existingTx } = await supabase
      .from('transactions')
      .select('id')
      .eq('reference', reference)
      .maybeSingle();

    if (existingTx) {
      return NextResponse.json({ status: 'success', message: 'Transaction already processed' });
    }

    // 3. Locate user: either from virtual_accounts (VBA) or metadata.user_id (standard checkout charge)
    let userId: string | null = data?.metadata?.user_id || null;

    if (!userId && accountRef) {
      const { data: va } = await supabase
        .from('virtual_accounts')
        .select('user_id')
        .eq('account_reference', accountRef)
        .maybeSingle();
      if (va) userId = va.user_id;
    }

    if (!userId && accountNumber) {
      const { data: va } = await supabase
        .from('virtual_accounts')
        .select('user_id')
        .eq('account_number', accountNumber)
        .maybeSingle();
      if (va) userId = va.user_id;
    }

    // Fallback: match by customer email if metadata was not passed
    if (!userId && data?.customer?.email) {
      const { data: usersData } = await supabase.auth.admin.listUsers();
      const matchedUser = usersData?.users?.find(
        (u) => u.email?.toLowerCase() === data.customer.email.toLowerCase()
      );
      if (matchedUser) userId = matchedUser.id;
    }

    if (!userId) {
      console.warn(`Korapay Webhook: No user matched ref ${reference}, VBA ref ${accountRef}, or acc ${accountNumber}`);
      return NextResponse.json({ error: 'User could not be identified' }, { status: 404 });
    }

    // 4. Retrieve user's NGN wallet
    const { data: wallet, error: walletErr } = await supabase
      .from('wallets')
      .select('id, balance')
      .eq('user_id', userId)
      .eq('currency', 'NGN')
      .single();

    if (walletErr || !wallet) {
      return NextResponse.json({ error: 'User wallet not found' }, { status: 404 });
    }

    const depositAmount = parseFloat(amount);
    const description = `Auto-Funded via Korapay Virtual Account (from ${payerName})`;

    // 5. Atomic Deposit Crediting via RPC (with row lock and idempotency)
    const { data: rpcRes, error: rpcErr } = await supabase.rpc('credit_wallet_deposit', {
      p_wallet_id: wallet.id,
      p_amount: depositAmount,
      p_description: description,
      p_reference: reference,
      p_metadata: {
        gateway: 'korapay',
        payerName,
        accountNumber,
        accountRef,
        fee: data.fee || null,
        fee_bearer: 'customer',
      },
    });

    if (!rpcErr && rpcRes && rpcRes.success) {
      // Dispatch asynchronous branded credit receipt email
      const targetUserEmail = data?.customer?.email;
      if (targetUserEmail) {
        sendTransactionalEmail({
          to: targetUserEmail,
          templateType: 'wallet_credit',
          data: {
            name: data?.customer?.name || payerName || 'Valued Customer',
            amount: depositAmount,
            newBalance: rpcRes.new_balance,
            reference,
            payerName,
            bankName: 'Virtual Payment Account',
            date: new Date().toLocaleString('en-NG'),
          },
        }).catch((e) => console.error('Failed to send wallet credit email:', e));
      }

      return NextResponse.json({
        status: 'success',
        message: `Successfully credited ₦${depositAmount} to user wallet.`,
        new_balance: rpcRes.new_balance,
      });
    }

    // Fallback if RPC function has not yet been applied to Postgres schema:
    const newBalance = parseFloat(wallet.balance) + depositAmount;
    const { error: updateErr } = await supabase
      .from('wallets')
      .update({ balance: newBalance, updated_at: new Date().toISOString() })
      .eq('id', wallet.id);

    if (updateErr) {
      return NextResponse.json({ error: 'Failed to credit wallet' }, { status: 500 });
    }

    // Insert credit deposit transaction
    await supabase.from('transactions').insert({
      wallet_id: wallet.id,
      amount: depositAmount,
      type: 'credit',
      category: 'deposit',
      description,
      reference,
      status: 'completed',
      metadata: {
        gateway: 'korapay',
        payerName,
        accountNumber,
        accountRef,
      },
    });

    // Dispatch asynchronous branded credit receipt email (fallback path)
    const targetUserEmail = data?.customer?.email;
    if (targetUserEmail) {
      sendTransactionalEmail({
        to: targetUserEmail,
        templateType: 'wallet_credit',
        data: {
          name: data?.customer?.name || payerName || 'Valued Customer',
          amount: depositAmount,
          newBalance,
          reference,
          payerName,
          bankName: 'Virtual Payment Account',
          date: new Date().toLocaleString('en-NG'),
        },
      }).catch((e) => console.error('Failed to send wallet credit email:', e));
    }

    return NextResponse.json({
      status: 'success',
      message: `Successfully credited ₦${depositAmount} to user wallet.`,
      new_balance: newBalance,
    });
  } catch (err: any) {
    console.error('Korapay webhook processing exception:', err);
    return NextResponse.json({ error: err.message || 'Webhook error' }, { status: 500 });
  }
}
