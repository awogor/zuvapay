import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { EmailOtpType } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const tokenHash = requestUrl.searchParams.get('token_hash');
  const type = requestUrl.searchParams.get('type') as EmailOtpType | null;
  let next = requestUrl.searchParams.get('next') || '/dashboard';

  // Prevent Open Redirect: must start with / and not //
  if (!next.startsWith('/') || next.startsWith('//')) {
    next = '/dashboard';
  }

  const supabase = await createClient();

  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash: tokenHash,
    });
    if (error) {
      console.error('[AUTH_VERIFY_ERROR]', error.message);
      return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(error.message)}`, requestUrl.origin));
    }

    // Upon successful signup verification, dispatch branded Welcome onboarding email
    if (type === 'signup' || type === 'email') {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.email) {
          const { sendTransactionalEmail } = await import('@/lib/email/sendEmail');
          const name = user.user_metadata?.first_name
            ? `${user.user_metadata.first_name} ${user.user_metadata.last_name || ''}`.trim()
            : user.email.split('@')[0];
          sendTransactionalEmail({
            to: user.email,
            templateType: 'welcome',
            data: { name },
          }).catch((err) => console.warn('[WELCOME_EMAIL_ERR]', err));
        }
      } catch (e) {
        console.warn('[WELCOME_CALLBACK_ERR]', e);
      }
    }
  } else if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      console.error('[AUTH_CODE_EXCHANGE_ERROR]', error.message);
      return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(error.message)}`, requestUrl.origin));
    }
  }

  // URL to redirect to after sign in or verification process completes
  return NextResponse.redirect(new URL(next, requestUrl.origin));
}

