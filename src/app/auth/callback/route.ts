import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createAdminClient } from '@/lib/supabase/server';
import type { EmailOtpType } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

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

  const origin =
    process.env.NEXT_PUBLIC_APP_URL && !process.env.NEXT_PUBLIC_APP_URL.includes('localhost')
      ? process.env.NEXT_PUBLIC_APP_URL
      : request.headers.get('origin') && !request.headers.get('origin')?.includes('localhost')
      ? request.headers.get('origin')!
      : 'https://zuvapay.com';

  // Prepare redirect response
  let redirectUrl = new URL(next, origin);
  let response = NextResponse.redirect(redirectUrl);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    '';

  // Create SSR client with cookies tied directly to the redirect response
  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.redirect(redirectUrl);
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  if (tokenHash && type) {
    const { data: verifyData, error } = await supabase.auth.verifyOtp({
      type,
      token_hash: tokenHash,
    });

    if (error) {
      console.warn('[AUTH_VERIFY_WARNING]', error.message);
      if (type === 'recovery') {
        return NextResponse.redirect(
          new URL(`/forgot-password?error=${encodeURIComponent('Password reset link has expired or is invalid. Please request a new one.')}`, origin)
        );
      }
      return NextResponse.redirect(
        new URL(`/login?info=${encodeURIComponent('Verification link has expired or was already used. Please sign in or request a new link.')}`, origin)
      );
    }

    // Failsafe confirmation in Supabase Admin database
    if (verifyData?.user?.id && (type === 'signup' || type === 'email')) {
      try {
        const adminSupabase = createAdminClient();
        await adminSupabase.auth.admin.updateUserById(verifyData.user.id, {
          email_confirm: true,
        });
        await adminSupabase
          .from('profiles')
          .update({ status: 'active' })
          .eq('id', verifyData.user.id);
      } catch (err) {
        console.warn('[ADMIN_CONFIRM_FAILSAFE]', err);
      }

      // Dispatch branded Welcome onboarding email
      try {
        const user = verifyData.user;
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
      return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(error.message)}`, origin));
    }
  }

  return response;
}
