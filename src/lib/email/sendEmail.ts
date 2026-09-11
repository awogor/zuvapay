import { getEmailTransporter } from './transporter';
import {
  EmailTemplateType,
  renderWelcomeEmail,
  renderWalletCreditEmail,
  renderServiceReceiptEmail,
  renderRefundEmail,
  renderSecurityPinEmail,
  renderElectricityTokenEmail,
  renderAdminBroadcastEmail,
} from './templates';

export interface SendEmailOptions {
  to: string;
  templateType: EmailTemplateType;
  data: Record<string, any>;
  customSubject?: string;
}

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  simulated?: boolean;
  error?: string;
  details?: {
    to: string;
    subject: string;
    templateType: EmailTemplateType;
  };
}

/**
 * Dispatches a branded transactional email via configured SMTP server.
 * If SMTP is not yet configured, gracefully logs and returns simulated response.
 */
export async function sendTransactionalEmail(
  options: SendEmailOptions
): Promise<SendEmailResult> {
  const { to, templateType, data, customSubject } = options;

  if (!to || !to.includes('@')) {
    return {
      success: false,
      error: 'Invalid recipient email address',
    };
  }

  // 1. Render Template HTML
  let rendered: { subject: string; html: string };

  switch (templateType) {
    case 'welcome':
      rendered = renderWelcomeEmail({
        name: data.name || 'Valued Customer',
        email: to,
        virtualAccount: data.virtualAccount,
      });
      break;

    case 'wallet_credit':
      rendered = renderWalletCreditEmail({
        name: data.name || 'Valued Customer',
        amount: Number(data.amount) || 0,
        newBalance: Number(data.newBalance) || 0,
        reference: data.reference || `KP-DEP-${Date.now()}`,
        payerName: data.payerName,
        bankName: data.bankName,
        date: data.date,
      });
      break;

    case 'service_receipt':
      rendered = renderServiceReceiptEmail({
        name: data.name || 'Valued Customer',
        serviceName: data.serviceName || 'Utility Service',
        category: data.category || 'General',
        amount: Number(data.amount) || 0,
        reference: data.reference || `KP-TX-${Date.now()}`,
        date: data.date,
        details: data.details,
      });
      break;

    case 'refund_alert':
      rendered = renderRefundEmail({
        name: data.name || 'Valued Customer',
        serviceName: data.serviceName || 'Utility Service',
        amount: Number(data.amount) || 0,
        reference: data.reference || `KP-REF-${Date.now()}`,
        reason: data.reason,
        newBalance: data.newBalance !== undefined ? Number(data.newBalance) : undefined,
      });
      break;

    case 'security_pin':
      rendered = renderSecurityPinEmail({
        name: data.name || 'Valued Customer',
        actionType: data.actionType || 'Security Update',
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        date: data.date,
      });
      break;

    case 'electricity_token':
      rendered = renderElectricityTokenEmail({
        name: data.name || 'Valued Customer',
        disco: data.disco || 'DISCO Provider',
        meterNumber: data.meterNumber || '00000000000',
        meterType: data.meterType || 'Prepaid',
        customerName: data.customerName || 'Verified Customer',
        customerAddress: data.customerAddress,
        token: data.token || '0000-0000-0000-0000-0000',
        units: data.units,
        amount: Number(data.amount) || 0,
        reference: data.reference || `KP-PWR-${Date.now()}`,
        operatorReference: data.operatorReference,
        date: data.date,
      });
      break;

    case 'admin_broadcast':
      rendered = renderAdminBroadcastEmail({
        name: data.name || 'Valued Customer',
        headline: data.headline || 'Important Update from KorrectPay',
        bodyHtml: data.bodyHtml || '<p>Here is an update regarding your KorrectPay account.</p>',
        ctaText: data.ctaText,
        ctaUrl: data.ctaUrl,
      });
      break;

    default:
      return {
        success: false,
        error: `Unknown template type: ${templateType}`,
      };
  }

  const subject = customSubject || rendered.subject;
  const { transporter, config } = getEmailTransporter();

  // 2. Simulated Dispatch (if SMTP credentials are not yet populated in .env.local)
  if (!config.isConfigured || !transporter) {
    console.log(`[Email Simulator] SMTP not configured. Simulated dispatch to ${to}: "${subject}"`);
    return {
      success: true,
      simulated: true,
      messageId: `sim-${Date.now()}`,
      details: {
        to,
        subject,
        templateType,
      },
    };
  }

  // 3. Live SMTP Transmission
  try {
    const info = await transporter.sendMail({
      from: `"${config.fromName}" <${config.fromEmail}>`,
      to,
      subject,
      html: rendered.html,
      text: rendered.html.replace(/<[^>]*>?/gm, ' ').replace(/\s\s+/g, ' ').trim(), // Plaintext fallback
    });

    console.log(`[Email SMTP Success] Delivered to ${to} (MessageId: ${info.messageId})`);

    return {
      success: true,
      messageId: info.messageId,
      simulated: false,
      details: {
        to,
        subject,
        templateType,
      },
    };
  } catch (err: any) {
    console.error(`[Email SMTP Failure] Failed to send email to ${to}:`, err.message);
    return {
      success: false,
      error: err.message || 'SMTP transmission error',
      details: {
        to,
        subject,
        templateType,
      },
    };
  }
}
