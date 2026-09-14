import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { sendTransactionalEmail } from '@/lib/email/sendEmail';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, firstName, lastName, phone, title, username } = body;

    if (!email || !password || !firstName || !phone) {
      return NextResponse.json(
        { success: false, error: 'All required fields must be provided' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanUsername = (username || email.split('@')[0]).trim().toLowerCase().replace(/^@/, '');
    const origin =
      request.headers.get('origin') ||
      process.env.NEXT_PUBLIC_APP_URL ||
      'http://localhost:3000';

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
        title: title || 'Mr',
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
    await supabaseAdmin
      .from('profiles')
      .upsert({
        id: user.id,
        username: cleanUsername,
        title: title || 'Mr',
        first_name: firstName,
        last_name: lastName || '',
        phone_number: phone,
        status: 'active',
        role: cleanEmail === 'awogorm@gmail.com' ? 'admin' : 'customer',
      }, { onConflict: 'id' });

    // 3. Generate verification link using Supabase Admin
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'signup',
      email: cleanEmail,
      password: password,
      options: {
        redirectTo: `${origin}/auth/callback?next=/dashboard`,
      },
    });

    const verificationUrl =
      linkData?.properties?.action_link ||
      `${origin}/auth/callback?token_hash=${linkData?.properties?.hashed_token}&type=signup&next=/dashboard`;

    // 4. Dispatch branded ZuvaPay verification email via custom SMTP
    await sendTransactionalEmail({
      to: cleanEmail,
      templateType: 'email_verification',
      data: {
        name: `${firstName} ${lastName}`.trim(),
        verificationUrl,
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
