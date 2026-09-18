import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { sendTransactionalEmail } from '@/lib/email/sendEmail';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, context: RouteContext) {
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
      .select('role')
      .eq('id', callerUser.id)
      .maybeSingle();

    if (!callerProfile || callerProfile.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Admin privileges required.' },
        { status: 403 }
      );
    }

    // 2. Fetch target user's metadata from auth admin
    const adminSupabase = createAdminClient();
    const { data: authData, error: authError } = await adminSupabase.auth.admin.getUserById(targetUserId);

    if (authError || !authData?.user) {
      return NextResponse.json(
        { success: false, error: authError?.message || 'User not found' },
        { status: 404 }
      );
    }

    const sentEmails = (authData.user.user_metadata?.sent_emails as any[]) || [];

    return NextResponse.json({
      success: true,
      emails: sentEmails,
    });
  } catch (err: any) {
    console.error('Error fetching user email history:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch email history' },
      { status: 500 }
    );
  }
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

    // Fetch auth user for email address and metadata
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
    // Automatically BCC hello@zuvapay.com for audit trail unless target is hello@zuvapay.com
    const adminCopyEmail = 'hello@zuvapay.com';
    const bccEmail = recipientEmail.toLowerCase() !== adminCopyEmail ? adminCopyEmail : undefined;

    const emailResult = await sendTransactionalEmail({
      to: recipientEmail,
      templateType: 'admin_broadcast',
      customSubject: subject.trim(),
      bcc: bccEmail,
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

    // 6. Record sent email in user's metadata for audit history
    const callerAdminName = [callerProfile?.first_name, callerProfile?.last_name].filter(Boolean).join(' ').trim() || 'Admin';
    const sentEmailEntry = {
      id: `mail_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      sent_at: new Date().toISOString(),
      sent_by_admin: {
        id: callerUser.id,
        name: callerAdminName,
        email: callerUser.email,
      },
      recipient: recipientEmail,
      recipient_name: recipientName,
      subject: subject.trim(),
      message: message.trim(),
      bodyHtml: paragraphs,
      ctaText: ctaText?.trim() || null,
      ctaUrl: ctaUrl?.trim() || null,
      messageId: emailResult.messageId || null,
      status: emailResult.success ? (emailResult.simulated ? 'simulated' : 'delivered') : 'failed',
    };

    const existingEmails: any[] = Array.isArray(authData?.user?.user_metadata?.sent_emails)
      ? authData.user.user_metadata.sent_emails
      : [];

    const updatedEmails = [sentEmailEntry, ...existingEmails].slice(0, 50);

    try {
      await adminSupabase.auth.admin.updateUserById(targetUserId, {
        user_metadata: {
          ...(authData?.user?.user_metadata || {}),
          sent_emails: updatedEmails,
        },
      });
    } catch (saveErr) {
      console.warn('Could not update user_metadata with sent email record:', saveErr);
    }

    return NextResponse.json({
      success: true,
      message: `Email successfully delivered to ${recipientEmail}`,
      messageId: emailResult.messageId,
      simulated: emailResult.simulated ?? false,
      recipient: recipientEmail,
      email: sentEmailEntry,
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
