import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export async function POST() {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut().catch(() => {});

    const cookieStore = await cookies();
    const allCookies = cookieStore.getAll();
    const response = NextResponse.json({ success: true });

    // Explicitly delete any supabase or auth related cookies on the response
    for (const cookie of allCookies) {
      if (cookie.name.includes('sb-') || cookie.name.includes('supabase') || cookie.name.includes('auth')) {
        response.cookies.set({
          name: cookie.name,
          value: '',
          maxAge: 0,
          path: '/',
        });
      }
    }

    return response;
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

