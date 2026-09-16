import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sendTransactionalEmail, SendEmailOptions } from '@/lib/email/sendEmail';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body: SendEmailOptions = await request.json();

    if (!body.to || !body.templateType) {
      return NextResponse.json(
        { success: false, error: 'Recipient email and templateType are required' },
        { status: 400 }
      );
    }

    // Unless user has admin privileges, users may only send transaction alerts to their own verified email address
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    const isAdmin = profile?.role === 'admin';
    if (!isAdmin && body.to.toLowerCase() !== user.email?.toLowerCase()) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized recipient. You can only send notifications to your account email.' },
        { status: 403 }
      );
    }

    const result = await sendTransactionalEmail(body);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error, details: result.details },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      messageId: result.messageId,
      simulated: result.simulated,
      details: result.details,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Internal server error processing email' },
      { status: 500 }
    );
  }
}
