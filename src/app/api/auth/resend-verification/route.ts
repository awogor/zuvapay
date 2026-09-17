import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { sendTransactionalEmail } from '@/lib/email/sendEmail';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { email } = body;

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json(
        { success: false, error: 'A valid email address is required.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const origin =
      process.env.NEXT_PUBLIC_APP_URL && !process.env.NEXT_PUBLIC_APP_URL.includes('localhost')
        ? process.env.NEXT_PUBLIC_APP_URL
        : request.headers.get('origin') && !request.headers.get('origin')?.includes('localhost')
        ? request.headers.get('origin')!
        : 'https://zuvapay.com';

    const supabaseAdmin = createAdminClient();

    // 1. Check if user exists in Supabase
    const { data: usersData, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    if (listError) {
      console.error('[RESEND_VERIFICATION_LIST_ERR]', listError);
      return NextResponse.json(
        { success: false, error: 'Failed to query user records' },
        { status: 500 }
      );
    }

    const foundUser = usersData?.users?.find(
      (u: any) => u.email?.toLowerCase() === cleanEmail
    );

    if (!foundUser) {
      return NextResponse.json(
        { success: false, error: 'No ZuvaPay account found with this email address.' },
        { status: 404 }
      );
    }

    // If user is already verified, inform them
    if (foundUser.email_confirmed_at) {
      return NextResponse.json({
        success: true,
        alreadyVerified: true,
        message: 'Your email is already verified. You can sign in immediately.',
      });
    }

    // 2. Fetch user profile name
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('first_name, last_name, username')
      .eq('id', foundUser.id)
      .maybeSingle();

    const name = profile?.first_name
      ? `${profile.first_name} ${profile.last_name || ''}`.trim()
      : foundUser.user_metadata?.first_name
      ? `${foundUser.user_metadata.first_name} ${foundUser.user_metadata.last_name || ''}`.trim()
      : cleanEmail.split('@')[0];

    // 3. Generate fresh verification link
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'signup',
      email: cleanEmail,
      options: {
        redirectTo: `${origin}/auth/callback?next=/dashboard`,
      },
    });

    if (linkError) {
      console.error('[RESEND_VERIFY_LINK_ERR]', linkError);
      return NextResponse.json(
        { success: false, error: linkError.message || 'Could not generate verification link.' },
        { status: 500 }
      );
    }

    const tokenHash = linkData?.properties?.hashed_token;
    const emailOtp = linkData?.properties?.email_otp;

    const verificationUrl = tokenHash
      ? `${origin}/auth/callback?token_hash=${encodeURIComponent(tokenHash)}&type=signup&next=/dashboard`
      : `${origin}/login?verified=true`;

    // 4. Dispatch verification email via custom SMTP
    await sendTransactionalEmail({
      to: cleanEmail,
      templateType: 'email_verification',
      data: {
        name,
        verificationUrl,
        verifyUrl: verificationUrl,
        token: emailOtp,
      },
    });

    return NextResponse.json({
      success: true,
      message: `A fresh verification link has been dispatched to ${cleanEmail}. Please check your inbox or spam folder.`,
    });
  } catch (err: any) {
    console.error('[RESEND_VERIFICATION_ERROR]', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Internal server error while resending verification' },
      { status: 500 }
    );
  }
}
