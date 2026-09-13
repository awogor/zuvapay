import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const body = await request.json();
    const { amount, redirectUrl } = body;

    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount < 100) {
      return NextResponse.json(
        { success: false, error: 'Minimum deposit amount is ₦100' },
        { status: 400 }
      );
    }

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const userId = user.id;
    const userEmail = user.email || 'customer@zuvapay.com';
    const userName =
      user.user_metadata?.first_name && user.user_metadata?.last_name
        ? `${user.user_metadata.first_name} ${user.user_metadata.last_name}`
        : user.user_metadata?.first_name || 'ZuvaPay Customer';

    const korapaySecretKey = process.env.KORAPAY_SECRET_KEY;
    const isMock = !korapaySecretKey || korapaySecretKey.includes('test') || korapaySecretKey.includes('mock');

    const reference = `KP-CHG-${userId.substring(0, 8)}-${Date.now().toString(36).toUpperCase()}`;
    const baseUrl = process.env.KORAPAY_BASE_URL || 'https://api.korapay.com/merchant/api/v1';
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    if (!isMock) {
      // Real Korapay Standard Checkout Initialize
      const korapayRes = await fetch(`${baseUrl}/charges/initialize`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${korapaySecretKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: numAmount,
          currency: 'NGN',
          reference,
          customer: {
            name: userName,
            email: userEmail,
          },
          narration: `ZuvaPay Wallet Deposit - ${userName}`,
          redirect_url: redirectUrl || `${appUrl}/dashboard?payment=success&ref=${reference}`,
          channels: ['card', 'bank_transfer', 'pay_with_bank'],
          metadata: {
            user_id: userId,
            purpose: 'wallet_funding',
          },
        }),
      });

      const resData = await korapayRes.json();

      if (!korapayRes.ok || !resData.status) {
        return NextResponse.json(
          {
            success: false,
            error: resData.message || 'Failed to initialize payment with Korapay',
          },
          { status: 502 }
        );
      }

      return NextResponse.json({
        success: true,
        reference,
        checkoutUrl: resData.data.checkout_url,
      });
    }

    // Fallback Mock URL if running in test
    return NextResponse.json({
      success: true,
      reference,
      checkoutUrl: `${appUrl}/dashboard?payment=mock_success&ref=${reference}&amt=${numAmount}`,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to initiate checkout' },
      { status: 500 }
    );
  }
}
