import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { sendTransactionalEmail } from '@/lib/email/sendEmail';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, firstName, lastName, phone, title, username, gender } = body;

    if (!email || !password || !firstName || !phone) {
      return NextResponse.json(
        { success: false, error: 'All required fields must be provided' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanUsername = (username || email.split('@')[0]).trim().toLowerCase().replace(/^@/, '');
    const cleanGender = gender === 'Female' || gender === 'female' ? 'Female' : 'Male';
    const effectiveTitle = title || (cleanGender === 'Female' ? 'Mrs' : 'Mr');

    const origin =
      process.env.NEXT_PUBLIC_APP_URL && !process.env.NEXT_PUBLIC_APP_URL.includes('localhost')
        ? process.env.NEXT_PUBLIC_APP_URL
        : request.headers.get('origin') && !request.headers.get('origin')?.includes('localhost')
        ? request.headers.get('origin')!
        : 'https://zuvapay.com';

    const supabaseAdmin = createAdminClient();

    // Check if username already exists in profiles
    if (cleanUsername) {
      const { data: existingUser } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('username', cleanUsername)
        .maybeSingle();

      if (existingUser) {
        return NextResponse.json(
          { success: false, error: `Username @${cleanUsername} is already taken` },
          { status: 400 }
        );
      }
    }

    // 1. Create user in Supabase Auth via Admin Client
    // email_confirm: false so that verification is required
    const { data: userData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: cleanEmail,
      password: password,
      email_confirm: false,
      user_metadata: {
        username: cleanUsername,
        title: effectiveTitle,
        gender: cleanGender,
        first_name: firstName,
        last_name: lastName || '',
        phone: phone,
        phone_number: phone,
      },
    });

    if (createError) {
      return NextResponse.json(
        { success: false, error: createError.message },
        { status: 400 }
      );
    }

    const user = userData.user;

    // 2. Ensure profile entry has username and full details
    const profilePayload: Record<string, any> = {
      id: user.id,
      username: cleanUsername,
      title: effectiveTitle,
      gender: cleanGender,
      first_name: firstName,
      last_name: lastName || '',
      phone_number: phone,
      status: 'active',
      role: cleanEmail === 'awogorm@gmail.com' ? 'admin' : 'customer',
    };

    const { error: upsertError } = await supabaseAdmin
      .from('profiles')
      .upsert(profilePayload, { onConflict: 'id' });

    // Resilient fallback if profiles table in Postgres does not have gender column yet
    if (upsertError && (upsertError.message?.includes('gender') || upsertError.code === '42703')) {
      delete profilePayload.gender;
      await supabaseAdmin
        .from('profiles')
        .upsert(profilePayload, { onConflict: 'id' });
    }

    // 3. Generate verification link using Supabase Admin
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'signup',
      email: cleanEmail,
      password: password,
      options: {
        redirectTo: `${origin}/auth/callback?next=/dashboard`,
      },
    });

    const tokenHash = linkData?.properties?.hashed_token;

    // Direct ZuvaPay branded URL: No Supabase domain exposed, zero localhost redirect
    const verificationUrl = tokenHash
      ? `${origin}/auth/callback?token_hash=${encodeURIComponent(tokenHash)}&type=signup&next=/dashboard`
      : `${origin}/login?verified=true`;

    // 4. Dispatch branded ZuvaPay verification email via custom SMTP
    await sendTransactionalEmail({
      to: cleanEmail,
      templateType: 'email_verification',
      data: {
        name: `${firstName} ${lastName}`.trim(),
        verificationUrl,
        verifyUrl: verificationUrl,
        token: linkData?.properties?.email_otp,
      },
    });

    return NextResponse.json({
      success: true,
      requiresEmailVerification: true,
      message: 'Account created. Please check your email to verify your address.',
      userId: user.id,
    });
  } catch (err: any) {
    console.error('[SIGNUP_API_ERROR]', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Internal server error during registration' },
      { status: 500 }
    );
  }
}
