import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    'placeholder-anon-key';

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  // Check user session
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/signup') || pathname.startsWith('/forgot-password');
  // Public marketing pages under /services
  const publicServicesMarketingRoutes = [
    '/services',
    '/services/bill-payment',
    '/services/sme-data',
    '/services/electricity',
    '/services/cable-tv',
    '/services/virtual-number',
    '/services/virtual-dollar-card',
  ];
  const isPublicServiceMarketing = publicServicesMarketingRoutes.includes(pathname);

  // Protected dashboard action routes
  const isProtectedRoute = pathname.startsWith('/dashboard') || 
    (pathname.startsWith('/services/') && !isPublicServiceMarketing) || 
    pathname.startsWith('/transactions') || 
    pathname.startsWith('/profile');

  // If user is authenticated and tries to access login/signup, redirect to /dashboard
  if (user && isAuthRoute) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  // If user is NOT authenticated and tries to access protected routes, redirect to /login
  // Only enforce strict redirect if Supabase is configured with real URL; otherwise allow dev preview
  const isConfigured = process.env.NEXT_PUBLIC_SUPABASE_URL && !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder');
  if (!user && isProtectedRoute && isConfigured) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
