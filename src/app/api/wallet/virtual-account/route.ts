import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateBillstackVirtualAccount } from '@/lib/billstack';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // 1. Query all existing virtual accounts in Supabase for user
    const { data: existingAccounts, error } = await supabase
      .from('virtual_accounts')
      .select('*')
      .eq('user_id', user.id);

    if (error) {
      console.warn('Error fetching virtual accounts:', error.message);
    }

    if (existingAccounts && existingAccounts.length > 0) {
      // Find 9PSB primary or first available
      const primary =
        existingAccounts.find((a) => a.bank_code === '9PSB') || existingAccounts[0];
      return NextResponse.json({
        success: true,
        accounts: existingAccounts,
        account: primary,
      });
    }

    // 2. Auto-provision dedicated 9PSB virtual account if none exists (Zero KYC required)
    const { data: profile } = await supabase
      .from('profiles')
      .select('first_name, last_name, phone_number')
      .eq('id', user.id)
      .maybeSingle();

    const firstName =
      profile?.first_name ||
      user.user_metadata?.first_name ||
      'Customer';
    const lastName =
      profile?.last_name ||
      user.user_metadata?.last_name ||
      '';
    const phone =
      profile?.phone_number ||
      user.user_metadata?.phone_number ||
      '08012345678';
    const email = user.email || 'customer@zuvapay.com';

    const accountRef = `BS-VA-${user.id.substring(0, 8)}-9PSB-${Date.now().toString(36).toUpperCase()}`;

    const billstackRes = await generateBillstackVirtualAccount({
      reference: accountRef,
      email,
      phone,
      firstName,
      lastName,
      bank: '9PSB',
    });

    if (billstackRes.status && billstackRes.data?.account?.length) {
      const acc = billstackRes.data.account[0];
      const virtualAccountData = {
        user_id: user.id,
        bank_name: acc.bank_name || '9PSB Bank',
        bank_code: '9PSB',
        account_number: acc.account_number,
        account_name: acc.account_name,
        account_reference: billstackRes.data.reference || accountRef,
        unique_id: `BS-${Date.now()}`,
        status: 'active',
      };

      // Only persist real accounts to Supabase database when live BILLSTACK_SECRET_KEY is configured
      const secretKey = process.env.BILLSTACK_SECRET_KEY;
      const isSandbox = !secretKey || secretKey.includes('your-') || secretKey.includes('mock');

      if (!isSandbox) {
        try {
          const { error: insErr } = await supabase
            .from('virtual_accounts')
            .upsert(virtualAccountData, { onConflict: 'user_id,bank_code' });
          if (insErr) {
            await supabase
              .from('virtual_accounts')
              .upsert(virtualAccountData, { onConflict: 'user_id' });
          }
        } catch (dbErr) {
          console.warn('Could not persist to virtual_accounts table in Supabase:', dbErr);
        }
      } else {
        console.log('[BILLSTACK] Sandbox mode active: skipping Supabase database write to keep tables clean.');
      }

      return NextResponse.json({
        success: true,
        accounts: [virtualAccountData],
        account: virtualAccountData,
        is_sandbox: isSandbox,
      });
    }

    return NextResponse.json({
      success: true,
      accounts: [],
      account: null,
      message: billstackRes.message || 'No virtual account found',
    });
  } catch (err: any) {
    console.error('Virtual account GET error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { bank = '9PSB', idType, idNumber } = body;

    const validBanks = ['9PSB', 'PROVIDUS', 'PALMPAY', 'SAFEHAVEN'];
    const selectedBank = validBanks.includes((bank || '').toUpperCase())
      ? (bank || '').toUpperCase()
      : '9PSB';

    // PalmPay regulatory requirement check
    if (selectedBank === 'PALMPAY') {
      if (!idType || !idNumber || !['nin', 'bvn'].includes(idType.toLowerCase())) {
        return NextResponse.json(
          {
            success: false,
            error: 'PalmPay virtual account requires an 11-digit NIN or BVN.',
          },
          { status: 400 }
        );
      }
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('first_name, last_name, phone_number')
      .eq('id', user.id)
      .maybeSingle();

    const firstName =
      profile?.first_name ||
      user.user_metadata?.first_name ||
      'Customer';
    const lastName =
      profile?.last_name ||
      user.user_metadata?.last_name ||
      '';
    const phone =
      profile?.phone_number ||
      user.user_metadata?.phone_number ||
      '08012345678';
    const email = user.email || 'customer@zuvapay.com';

    const accountRef = `BS-VA-${user.id.substring(0, 8)}-${selectedBank}-${Date.now().toString(36).toUpperCase()}`;

    const billstackRes = await generateBillstackVirtualAccount({
      reference: accountRef,
      email,
      phone,
      firstName,
      lastName,
      bank: selectedBank as any,
      idType: idType ? idType.toLowerCase() : undefined,
      idNumber: idNumber ? idNumber.trim() : undefined,
    });

    if (!billstackRes.status || !billstackRes.data?.account?.length) {
      return NextResponse.json(
        {
          success: false,
          error: billstackRes.message || `Failed to generate ${selectedBank} account via Billstack`,
        },
        { status: 502 }
      );
    }

    const acc = billstackRes.data.account[0];
    const defaultBankName =
      selectedBank === 'PALMPAY'
        ? 'PalmPay Bank'
        : selectedBank === 'PROVIDUS'
        ? 'Providus Bank'
        : selectedBank === 'SAFEHAVEN'
        ? 'SafeHaven MFB'
        : '9PSB Bank';

    const virtualAccountData = {
      user_id: user.id,
      bank_name: acc.bank_name || defaultBankName,
      bank_code: selectedBank,
      account_number: acc.account_number,
      account_name: acc.account_name,
      account_reference: billstackRes.data.reference || accountRef,
      unique_id: `BS-${Date.now()}`,
      status: 'active',
    };

    // Only persist real accounts to Supabase database when live BILLSTACK_SECRET_KEY is configured
    const secretKey = process.env.BILLSTACK_SECRET_KEY;
    const isSandbox = !secretKey || secretKey.includes('your-') || secretKey.includes('mock');

    if (!isSandbox) {
      try {
        const { error: insErr } = await supabase
          .from('virtual_accounts')
          .upsert(virtualAccountData, { onConflict: 'user_id,bank_code' });
        if (insErr) {
          await supabase
            .from('virtual_accounts')
            .upsert(virtualAccountData, { onConflict: 'user_id' });
        }
      } catch (dbErr) {
        console.warn('Could not persist to virtual_accounts table in Supabase:', dbErr);
      }
    } else {
      console.log('[BILLSTACK] Sandbox mode active: skipping Supabase database write to keep tables clean.');
    }

    return NextResponse.json({
      success: true,
      account: virtualAccountData,
      is_sandbox: isSandbox,
      message: isSandbox
        ? `Dedicated ${virtualAccountData.bank_name} simulated (Sandbox Mode: database write skipped).`
        : `Dedicated ${virtualAccountData.bank_name} generated successfully via Billstack.`,
    });
  } catch (err: any) {
    console.error('Virtual account POST error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
