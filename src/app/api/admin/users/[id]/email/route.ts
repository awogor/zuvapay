import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { sendTransactionalEmail } from '@/lib/email/sendEmail';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { id: targetUserId } = await context.params;

    if (!targetUserId) {
      return NextResponse.json({ success: false, error: 'Target user ID is required' }, { status: 400 });
    }

    // 1. Verify caller authentication & admin role
    const supabase = await createClient();
    const {
      data: { user: callerUser },
    } = await supabase.auth.getUser();

    if (!callerUser) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    const { data: callerProfile } = await supabase
      .from('profiles')
      .select('role, first_name, last_name')
      .eq('id', callerUser.id)
      .maybeSingle();

    if (!callerProfile || callerProfile.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Admin privileges required.' },
        { status: 403 }
      );
    }

    // 2. Parse request body
    const body = await request.json();
    const { subject, message, ctaText, ctaUrl, customEmail } = body;

    if (!subject || typeof subject !== 'string' || !subject.trim()) {
      return NextResponse.json({ success: false, error: 'Email subject is required' }, { status: 400 });
    }

    if (!message || typeof message !== 'string' || !message.trim()) {
      return NextResponse.json({ success: false, error: 'Email message body is required' }, { status: 400 });
    }

    // 3. Resolve target user info
    const adminSupabase = createAdminClient();

    // Fetch profile for recipient name
    const { data: targetProfile } = await adminSupabase
      .from('profiles')
      .select('first_name, last_name, title')
      .eq('id', targetUserId)
      .maybeSingle();

    // Fetch auth user for email address
    const { data: authData, error: authError } = await adminSupabase.auth.admin.getUserById(targetUserId);

    const recipientEmail = customEmail || authData?.user?.email;

    if (!recipientEmail || !recipientEmail.includes('@')) {
      return NextResponse.json(
        {
          success: false,
          error: `Could not resolve a valid email address for target user (User ID: ${targetUserId})`,
        },
        { status: 400 }
      );
    }

    const recipientName = [
      targetProfile?.title,
      targetProfile?.first_name,
      targetProfile?.last_name,
    ]
      .filter(Boolean)
      .join(' ')
      .trim() || 'Valued Customer';

    // 4. Convert plain text with newlines into clean HTML paragraphs
    const paragraphs = message
      .trim()
      .split(/\r?\n\r?\n/)
      .map((block: string) => {
        const safeLines = block
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/\r?\n/g, '<br />');
        return `<p style="margin: 0 0 14px 0; font-size: 14px; line-height: 22px; color: #334155;">${safeLines}</p>`;
      })
      .join('');

    // 5. Send email via ZuvaPay SMTP
    const emailResult = await sendTransactionalEmail({
      to: recipientEmail,
      templateType: 'admin_broadcast',
      customSubject: subject.trim(),
      data: {
        name: recipientName,
        headline: subject.trim(),
        bodyHtml: paragraphs,
        ctaText: ctaText?.trim() || undefined,
        ctaUrl: ctaUrl?.trim() || undefined,
      },
    });

    if (!emailResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: emailResult.error || 'Failed to dispatch email via SMTP server.',
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Email successfully delivered to ${recipientEmail}`,
      messageId: emailResult.messageId,
      simulated: emailResult.simulated ?? false,
      recipient: recipientEmail,
    });
  } catch (err: any) {
    console.error('Error sending direct email to user:', err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || 'Internal server error while sending email',
      },
      { status: 500 }
    );
  }
}
