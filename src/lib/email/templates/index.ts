import { renderBaseEmailLayout } from './baseLayout';

/**
 * Safely resolves the public domain for all customer-facing emails.
 * Never outputs 'localhost' in email templates to ensure 100% deliverability
 * and prevent spam filters (e.g. Google Mail, Yahoo) from penalizing emails with high spam scores.
 */
export function getEmailAppUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL;
  if (envUrl && !envUrl.includes('localhost') && !envUrl.includes('127.0.0.1')) {
    return envUrl.replace(/\/$/, '');
  }
  return 'https://zuvapay.com';
}

export type EmailTemplateType =
  | 'welcome'
  | 'email_verification'
  | 'password_reset'
  | 'wallet_credit'
  | 'service_receipt'
  | 'refund_alert'
  | 'security_pin'
  | 'electricity_token'
  | 'admin_broadcast'
  | 'admin_low_balance'
  | 'marketplace_delivery';

/**
 * 1. Welcome Email Template
 */
export function renderWelcomeEmail({
  name,
  email,
  virtualAccount,
}: {
  name: string;
  email: string;
  virtualAccount?: { bankName: string; accountNumber: string; accountName: string };
}): { subject: string; html: string } {
  const contentHtml = `
    <h1 style="margin: 0 0 8px 0; font-size: 20px; font-weight: 800; color: #0F172A; letter-spacing: -0.3px;">
      Welcome to ZuvaPay, ${name}
    </h1>
    <p style="margin: 0 0 20px 0; font-size: 14px; line-height: 22px; color: #475569;">
      Your account is active. ZuvaPay gives you fast, reliable access to telecom data bundles, electricity tokens, cable TV renewals, and digital utilities.
    </p>

    <!-- Services Overview -->
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 24px; font-size: 13px;">
      <tr>
        <td style="padding: 10px 0; border-bottom: 1px solid #F1F5F9; color: #334155; line-height: 20px;">
          <strong>Data &amp; Airtime:</strong> Instant wholesale SME &amp; gifting bundles across MTN, Airtel, Glo, and 9mobile.
        </td>
      </tr>
      <tr>
        <td style="padding: 10px 0; border-bottom: 1px solid #F1F5F9; color: #334155; line-height: 20px;">
          <strong>Electricity:</strong> Instant 20-digit prepaid meter tokens and postpaid settlements for all Discos.
        </td>
      </tr>
      <tr>
        <td style="padding: 10px 0; border-bottom: 1px solid #F1F5F9; color: #334155; line-height: 20px;">
          <strong>Cable &amp; Subscriptions:</strong> Instant renewals for DStv, GOtv, StarTimes, and software tools.
        </td>
      </tr>
    </table>

    <!-- Action Button -->
    <div style="margin: 24px 0 20px 0;">
      <a href="${getEmailAppUrl()}/dashboard" style="display: inline-block; padding: 11px 24px; background-color: #FF6B00; color: #FFFFFF; font-size: 13px; font-weight: 700; text-decoration: none; border-radius: 8px;">
        Go to Dashboard &rarr;
      </a>
    </div>
  `;

  return {
    subject: `Welcome to ZuvaPay, ${name}`,
    html: renderBaseEmailLayout({
      previewText: `Welcome to ZuvaPay! Your account is active and ready to use.`,
      contentHtml,
    }),
  };
}

/**
 * 2. Wallet Funded / Credit Alert Template
 */
export function renderWalletCreditEmail({
  name,
  amount,
  newBalance,
  reference,
  payerName,
  bankName,
  date,
}: {
  name: string;
  amount: number;
  newBalance: number;
  reference: string;
  payerName?: string;
  bankName?: string;
  date?: string;
}): { subject: string; html: string } {
  const contentHtml = `
    <div style="margin-bottom: 20px;">
      <h1 style="margin: 0 0 4px 0; font-size: 20px; font-weight: 800; color: #0F172A; letter-spacing: -0.3px;">
        Wallet Credited
      </h1>
      <div style="font-size: 28px; font-weight: 800; color: #059669; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin-top: 6px;">
        +₦${amount.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
      </div>
    </div>

    <!-- Transaction Summary -->
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 24px; font-size: 13px;">
      <tr>
        <td style="padding: 9px 0; border-bottom: 1px solid #F1F5F9; color: #64748B;">Recipient</td>
        <td align="right" style="padding: 9px 0; border-bottom: 1px solid #F1F5F9; font-weight: 700; color: #0F172A;">${name}</td>
      </tr>
      <tr>
        <td style="padding: 9px 0; border-bottom: 1px solid #F1F5F9; color: #64748B;">Source</td>
        <td align="right" style="padding: 9px 0; border-bottom: 1px solid #F1F5F9; font-weight: 600; color: #0F172A;">${payerName || 'Bank Transfer'} (${bankName || 'Virtual Account'})</td>
      </tr>
      <tr>
        <td style="padding: 9px 0; border-bottom: 1px solid #F1F5F9; color: #64748B;">Reference</td>
        <td align="right" style="padding: 9px 0; border-bottom: 1px solid #F1F5F9; font-family: monospace; font-size: 12px; color: #64748B;">${reference}</td>
      </tr>
      <tr>
        <td style="padding: 9px 0; border-bottom: 1px solid #F1F5F9; color: #64748B;">Date</td>
        <td align="right" style="padding: 9px 0; border-bottom: 1px solid #F1F5F9; font-weight: 600; color: #0F172A;">${date || new Date().toLocaleString('en-NG')}</td>
      </tr>
      <tr>
        <td style="padding: 9px 0; color: #64748B;">Wallet Balance</td>
        <td align="right" style="padding: 9px 0; font-weight: 800; color: #0F172A;">₦${newBalance.toLocaleString('en-NG', { minimumFractionDigits: 2 })}</td>
      </tr>
    </table>
  `;

  return {
    subject: `Wallet Credited: ₦${amount.toLocaleString('en-NG', { minimumFractionDigits: 2 })} - ZuvaPay`,
    html: renderBaseEmailLayout({
      previewText: `₦${amount.toLocaleString('en-NG')} credited to your ZuvaPay wallet. New Balance: ₦${newBalance.toLocaleString('en-NG')}.`,
      contentHtml,
    }),
  };
}

/**
 * 3. Service Fulfillment / Purchase Receipt Template
 */
export function renderServiceReceiptEmail({
  name,
  serviceName,
  category,
  amount,
  reference,
  date,
  details,
}: {
  name: string;
  serviceName: string;
  category: string;
  amount: number;
  reference: string;
  date?: string;
  details?: Record<string, string>;
}): { subject: string; html: string } {
  let detailsHtml = '';
  if (details && Object.keys(details).length > 0) {
    detailsHtml = Object.entries(details)
      .map(
        ([key, val]) => `
      <tr>
        <td style="padding: 9px 0; border-bottom: 1px solid #F1F5F9; color: #64748B;">${key}</td>
        <td align="right" style="padding: 9px 0; border-bottom: 1px solid #F1F5F9; font-weight: 600; color: #0F172A; font-family: ${key.toLowerCase().includes('token') || key.toLowerCase().includes('code') || key.toLowerCase().includes('password') ? 'monospace' : 'inherit'};">${val}</td>
      </tr>
    `
      )
      .join('');
  }

  const contentHtml = `
    <div style="margin-bottom: 20px;">
      <h1 style="margin: 0 0 4px 0; font-size: 20px; font-weight: 800; color: #0F172A; letter-spacing: -0.3px;">
        Order Receipt
      </h1>
      <p style="margin: 0; font-size: 13px; color: #64748B;">
        Your order for <strong>${serviceName}</strong> has been fulfilled.
      </p>
    </div>

    <!-- Summary Table -->
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 24px; font-size: 13px;">
      <tr>
        <td style="padding: 9px 0; border-bottom: 1px solid #F1F5F9; color: #64748B;">Service</td>
        <td align="right" style="padding: 9px 0; border-bottom: 1px solid #F1F5F9; font-weight: 700; color: #0F172A;">${serviceName}</td>
      </tr>
      <tr>
        <td style="padding: 9px 0; border-bottom: 1px solid #F1F5F9; color: #64748B;">Category</td>
        <td align="right" style="padding: 9px 0; border-bottom: 1px solid #F1F5F9; font-weight: 600; color: #475569; text-transform: uppercase; font-size: 11px;">${category}</td>
      </tr>
      <tr>
        <td style="padding: 9px 0; border-bottom: 1px solid #F1F5F9; color: #64748B;">Amount Paid</td>
        <td align="right" style="padding: 9px 0; border-bottom: 1px solid #F1F5F9; font-weight: 800; color: #0F172A;">₦${amount.toLocaleString('en-NG', { minimumFractionDigits: 2 })}</td>
      </tr>
      <tr>
        <td style="padding: 9px 0; border-bottom: 1px solid #F1F5F9; color: #64748B;">Reference</td>
        <td align="right" style="padding: 9px 0; border-bottom: 1px solid #F1F5F9; font-family: monospace; font-size: 12px; color: #64748B;">${reference}</td>
      </tr>
      ${detailsHtml}
      <tr>
        <td style="padding: 9px 0; color: #64748B;">Date</td>
        <td align="right" style="padding: 9px 0; font-weight: 600; color: #0F172A;">${date || new Date().toLocaleString('en-NG')}</td>
      </tr>
    </table>
  `;

  return {
    subject: `Receipt for ${serviceName} - ZuvaPay`,
    html: renderBaseEmailLayout({
      previewText: `Your ${serviceName} order of ₦${amount.toLocaleString('en-NG')} was fulfilled successfully.`,
      contentHtml,
    }),
  };
}

/**
 * 4. Automated Refund Alert Template
 */
export function renderRefundEmail({
  name,
  serviceName,
  amount,
  reference,
  reason,
  newBalance,
}: {
  name: string;
  serviceName: string;
  amount: number;
  reference: string;
  reason?: string;
  newBalance?: number;
}): { subject: string; html: string } {
  const contentHtml = `
    <div style="margin-bottom: 20px;">
      <h1 style="margin: 0 0 4px 0; font-size: 20px; font-weight: 800; color: #0F172A; letter-spacing: -0.3px;">
        Refund Processed
      </h1>
      <div style="font-size: 28px; font-weight: 800; color: #2563EB; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin-top: 6px;">
        +₦${amount.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
      </div>
      <p style="margin: 8px 0 0 0; font-size: 13px; color: #64748B;">
        Your order could not be completed by the carrier gateway. Funds have been returned to your wallet.
      </p>
    </div>

    <!-- Refund Table -->
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 24px; font-size: 13px;">
      <tr>
        <td style="padding: 9px 0; border-bottom: 1px solid #F1F5F9; color: #64748B;">Item</td>
        <td align="right" style="padding: 9px 0; border-bottom: 1px solid #F1F5F9; font-weight: 700; color: #0F172A;">${serviceName}</td>
      </tr>
      <tr>
        <td style="padding: 9px 0; border-bottom: 1px solid #F1F5F9; color: #64748B;">Refunded Amount</td>
        <td align="right" style="padding: 9px 0; border-bottom: 1px solid #F1F5F9; font-weight: 800; color: #2563EB;">₦${amount.toLocaleString('en-NG', { minimumFractionDigits: 2 })}</td>
      </tr>
      <tr>
        <td style="padding: 9px 0; border-bottom: 1px solid #F1F5F9; color: #64748B;">Reason</td>
        <td align="right" style="padding: 9px 0; border-bottom: 1px solid #F1F5F9; color: #64748B; font-size: 12px;">${reason || 'Carrier gateway timeout'}</td>
      </tr>
      <tr>
        <td style="padding: 9px 0; border-bottom: 1px solid #F1F5F9; font-size: 12px; color: #64748B;">Original Reference</td>
        <td align="right" style="padding: 9px 0; border-bottom: 1px solid #F1F5F9; font-family: monospace; font-size: 12px; color: #64748B;">${reference}</td>
      </tr>
      ${
        newBalance !== undefined
          ? `
      <tr>
        <td style="padding: 9px 0; color: #64748B;">Current Wallet Balance</td>
        <td align="right" style="padding: 9px 0; font-weight: 800; color: #0F172A;">₦${newBalance.toLocaleString('en-NG', { minimumFractionDigits: 2 })}</td>
      </tr>`
          : ''
      }
    </table>
  `;

  return {
    subject: `Refund Confirmation: ₦${amount.toLocaleString('en-NG', { minimumFractionDigits: 2 })} - ZuvaPay`,
    html: renderBaseEmailLayout({
      previewText: `Your order for ${serviceName} was refunded. ₦${amount.toLocaleString('en-NG')} credited to your wallet.`,
      contentHtml,
    }),
  };
}

/**
 * 5. Security & Transaction PIN Alert
 */
export function renderSecurityPinEmail({
  name,
  actionType,
  ipAddress,
  userAgent,
  date,
}: {
  name: string;
  actionType: string;
  ipAddress?: string;
  userAgent?: string;
  date?: string;
}): { subject: string; html: string } {
  const contentHtml = `
    <div style="margin-bottom: 20px;">
      <h1 style="margin: 0 0 6px 0; font-size: 20px; font-weight: 800; color: #0F172A; letter-spacing: -0.3px;">
        Security Notification
      </h1>
      <p style="margin: 0; font-size: 13px; color: #64748B;">
        Important security activity was detected on your ZuvaPay account: <strong>${actionType}</strong>.
      </p>
    </div>

    <!-- Security Activity Details -->
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 24px; font-size: 13px;">
      <tr>
        <td style="padding: 9px 0; border-bottom: 1px solid #F1F5F9; color: #64748B;">Action</td>
        <td align="right" style="padding: 9px 0; border-bottom: 1px solid #F1F5F9; font-weight: 700; color: #0F172A;">${actionType}</td>
      </tr>
      <tr>
        <td style="padding: 9px 0; border-bottom: 1px solid #F1F5F9; color: #64748B;">Date &amp; Time</td>
        <td align="right" style="padding: 9px 0; border-bottom: 1px solid #F1F5F9; font-weight: 600; color: #0F172A;">${date || new Date().toLocaleString('en-NG')}</td>
      </tr>
      ${
        ipAddress
          ? `
      <tr>
        <td style="padding: 9px 0; border-bottom: 1px solid #F1F5F9; color: #64748B;">IP Address</td>
        <td align="right" style="padding: 9px 0; border-bottom: 1px solid #F1F5F9; font-family: monospace; font-size: 12px; color: #0F172A;">${ipAddress}</td>
      </tr>`
          : ''
      }
      ${
        userAgent
          ? `
      <tr>
        <td style="padding: 9px 0; color: #64748B;">Device</td>
        <td align="right" style="padding: 9px 0; font-size: 11px; font-weight: 600; color: #475569;">${userAgent}</td>
      </tr>`
          : ''
      }
    </table>

    <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 14px; font-size: 12px; color: #64748B; line-height: 18px;">
      <strong style="color: #0F172A;">Didn't authorize this?</strong> If you did not perform this change, please immediately contact our support desk at <a href="mailto:hello@zuvapay.com" style="color: #FF6B00; text-decoration: none; font-weight: 600;">hello@zuvapay.com</a> to secure your account.
    </div>
  `;

  return {
    subject: `Security Alert: ${actionType} - ZuvaPay`,
    html: renderBaseEmailLayout({
      previewText: `Security alert: ${actionType} was recorded on your ZuvaPay account.`,
      contentHtml,
    }),
  };
}

/**
 * 6. Electricity Prepaid Meter Token Email Template
 */
export function renderElectricityTokenEmail({
  name,
  disco,
  meterNumber,
  meterType = 'Prepaid',
  customerName,
  customerAddress,
  token,
  units,
  amount,
  reference,
  operatorReference,
  date,
}: {
  name: string;
  disco: string;
  meterNumber: string;
  meterType?: string;
  customerName: string;
  customerAddress?: string;
  token: string;
  units?: string;
  amount: number;
  reference: string;
  operatorReference?: string;
  date?: string;
}): { subject: string; html: string } {
  // Format token cleanly: "6032 - 5848 - 1710 - 4711 - 0091"
  const cleanDigits = (token || '').replace(/\D/g, '');
  const formattedToken =
    cleanDigits.length === 20
      ? cleanDigits.match(/.{1,4}/g)?.join(' - ') || token
      : token;

  const contentHtml = `
    <!-- Header -->
    <div style="margin-bottom: 20px;">
      <h1 style="margin: 0 0 6px 0; font-size: 20px; font-weight: 800; color: #0F172A; letter-spacing: -0.3px;">
        Your ${disco} Electricity Token
      </h1>
      <p style="margin: 0; font-size: 13px; color: #64748B;">
        Prepaid meter recharge for <strong>${meterNumber}</strong> (${disco})
      </p>
    </div>

    <!-- Token Box: Responsive & Never breaks awkwardly on mobile -->
    <div class="token-box" style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 10px; padding: 20px 16px; text-align: center; margin-bottom: 24px;">
      <div style="font-size: 11px; font-weight: 700; color: #64748B; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">
        20-Digit Meter Token
      </div>
      <div class="token-digits" style="font-size: 18px; font-weight: 800; font-family: 'Courier New', Courier, monospace; color: #0F172A; letter-spacing: 1.5px; padding: 4px 0; white-space: nowrap;">
        ${formattedToken}
      </div>
      <div style="font-size: 12px; color: #64748B; margin-top: 8px;">
        Key these 20 digits into your meter CIU keypad, then press the <strong>Enter</strong> key.
      </div>
      ${
        units
          ? `
      <div style="margin-top: 10px; font-size: 12px; font-weight: 700; color: #059669;">
        Units Credited: ${units}
      </div>`
          : ''
      }
    </div>

    <!-- Recharge Summary -->
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 20px; font-size: 13px;">
      <tr>
        <td style="padding: 9px 0; border-bottom: 1px solid #F1F5F9; color: #64748B;">Provider</td>
        <td align="right" style="padding: 9px 0; border-bottom: 1px solid #F1F5F9; font-weight: 700; color: #0F172A;">${disco}</td>
      </tr>
      <tr>
        <td style="padding: 9px 0; border-bottom: 1px solid #F1F5F9; color: #64748B;">Meter Number</td>
        <td align="right" style="padding: 9px 0; border-bottom: 1px solid #F1F5F9; font-family: monospace; font-weight: 700; color: #0F172A;">${meterNumber}</td>
      </tr>
      <tr>
        <td style="padding: 9px 0; border-bottom: 1px solid #F1F5F9; color: #64748B;">Customer Name</td>
        <td align="right" style="padding: 9px 0; border-bottom: 1px solid #F1F5F9; font-weight: 600; color: #0F172A;">${customerName}</td>
      </tr>
      ${
        customerAddress
          ? `
      <tr>
        <td style="padding: 9px 0; border-bottom: 1px solid #F1F5F9; color: #64748B;">Premise Address</td>
        <td align="right" style="padding: 9px 0; border-bottom: 1px solid #F1F5F9; color: #334155; font-size: 12px; max-width: 240px;">${customerAddress}</td>
      </tr>`
          : ''
      }
      <tr>
        <td style="padding: 9px 0; border-bottom: 1px solid #F1F5F9; color: #64748B;">Amount Paid</td>
        <td align="right" style="padding: 9px 0; border-bottom: 1px solid #F1F5F9; font-weight: 800; color: #0F172A;">₦${amount.toLocaleString('en-NG', { minimumFractionDigits: 2 })}</td>
      </tr>
      <tr>
        <td style="padding: 9px 0; border-bottom: 1px solid #F1F5F9; color: #64748B;">Transaction Ref</td>
        <td align="right" style="padding: 9px 0; border-bottom: 1px solid #F1F5F9; font-family: monospace; font-size: 12px; color: #64748B;">${reference}</td>
      </tr>
      ${
        operatorReference
          ? `
      <tr>
        <td style="padding: 9px 0; border-bottom: 1px solid #F1F5F9; color: #64748B;">Operator Ref</td>
        <td align="right" style="padding: 9px 0; border-bottom: 1px solid #F1F5F9; font-family: monospace; font-size: 12px; color: #64748B;">${operatorReference}</td>
      </tr>`
          : ''
      }
      <tr>
        <td style="padding: 9px 0; color: #64748B;">Date</td>
        <td align="right" style="padding: 9px 0; font-weight: 600; color: #0F172A;">${date || new Date().toLocaleString('en-NG')}</td>
      </tr>
    </table>
  `;

  return {
    subject: `Your ${disco} Electricity Token - ZuvaPay`,
    html: renderBaseEmailLayout({
      previewText: `Your ${disco} meter recharge token is ready for meter ${meterNumber}. Amount: ₦${amount.toLocaleString('en-NG')}.`,
      contentHtml,
    }),
  };
}

/**
 * 6. Admin Custom Campaign / Broadcast Note
 */
export function renderAdminBroadcastEmail({
  name,
  headline,
  bodyHtml,
  ctaText,
  ctaUrl,
}: {
  name: string;
  headline: string;
  bodyHtml: string;
  ctaText?: string;
  ctaUrl?: string;
}): { subject: string; html: string } {
  const contentHtml = `
    <h1 style="margin: 0 0 12px 0; font-size: 20px; font-weight: 800; color: #0F172A; letter-spacing: -0.3px;">
      ${headline}
    </h1>
    <div style="font-size: 14px; line-height: 22px; color: #475569; margin-bottom: 24px;">
      ${bodyHtml}
    </div>

    ${
      ctaText && ctaUrl
        ? `
    <div style="margin: 24px 0;">
      <a href="${ctaUrl}" style="display: inline-block; padding: 12px 24px; background-color: #FF6B00; color: #FFFFFF; font-size: 13px; font-weight: 700; text-decoration: none; border-radius: 8px;">
        ${ctaText} &rarr;
      </a>
    </div>`
        : ''
    }
  `;

  return {
    subject: `${headline} - ZuvaPay`,
    html: renderBaseEmailLayout({
      previewText: headline,
      contentHtml,
    }),
  };
}

/**
 * 7. Admin Action Required: API Provider Low Balance / Out-of-Stock Alert
 */
export function renderAdminLowBalanceEmail({
  productName,
  providerName,
  customerEmail,
  orderReference,
  amount,
  errorMessage,
  portalUrl,
}: {
  productName: string;
  providerName: string;
  customerEmail: string;
  orderReference: string;
  amount: string | number;
  errorMessage: string;
  portalUrl?: string;
}): { subject: string; html: string } {
  const contentHtml = `
    <div style="margin-bottom: 20px;">
      <div style="font-size: 11px; font-weight: 700; color: #DC2626; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">
        Action Required
      </div>
      <h1 style="margin: 0 0 6px 0; font-size: 20px; font-weight: 800; color: #0F172A; letter-spacing: -0.3px;">
        Low Provider Balance: ${providerName}
      </h1>
      <p style="margin: 0; font-size: 13px; color: #64748B; line-height: 20px;">
        A customer order for <strong>${productName}</strong> could not be fulfilled because your reseller wallet balance on <strong>${providerName}</strong> is depleted. The customer has been automatically refunded.
      </p>
    </div>

    <!-- Diagnostic Details Table -->
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 24px; font-size: 13px;">
      <tr>
        <td style="padding: 9px 0; border-bottom: 1px solid #F1F5F9; color: #64748B;">Attempted Product</td>
        <td align="right" style="padding: 9px 0; border-bottom: 1px solid #F1F5F9; font-weight: 700; color: #0F172A;">${productName}</td>
      </tr>
      <tr>
        <td style="padding: 9px 0; border-bottom: 1px solid #F1F5F9; color: #64748B;">API Gateway</td>
        <td align="right" style="padding: 9px 0; border-bottom: 1px solid #F1F5F9; font-weight: 600; color: #0F172A;">${providerName}</td>
      </tr>
      <tr>
        <td style="padding: 9px 0; border-bottom: 1px solid #F1F5F9; color: #64748B;">Order Value</td>
        <td align="right" style="padding: 9px 0; border-bottom: 1px solid #F1F5F9; font-weight: 800; color: #0F172A;">₦${typeof amount === 'number' ? amount.toLocaleString('en-NG') : amount}</td>
      </tr>
      <tr>
        <td style="padding: 9px 0; border-bottom: 1px solid #F1F5F9; color: #64748B;">Customer Account</td>
        <td align="right" style="padding: 9px 0; border-bottom: 1px solid #F1F5F9; font-weight: 600; color: #0F172A;">${customerEmail}</td>
      </tr>
      <tr>
        <td style="padding: 9px 0; border-bottom: 1px solid #F1F5F9; color: #64748B;">Order Reference</td>
        <td align="right" style="padding: 9px 0; border-bottom: 1px solid #F1F5F9; font-family: monospace; font-size: 12px; color: #475569;">${orderReference}</td>
      </tr>
      <tr>
        <td style="padding: 9px 0; border-bottom: 1px solid #F1F5F9; color: #64748B;">Error Reason</td>
        <td align="right" style="padding: 9px 0; border-bottom: 1px solid #F1F5F9; font-weight: 600; color: #DC2626;">${errorMessage}</td>
      </tr>
      <tr>
        <td style="padding: 9px 0; color: #64748B;">Customer Status</td>
        <td align="right" style="padding: 9px 0; font-weight: 600; color: #059669;">Automatically Refunded</td>
      </tr>
    </table>

    <!-- CTA Button to Fund Provider -->
    <div style="margin: 24px 0 12px 0;">
      <a href="${portalUrl || 'https://resellers.aiplug.store'}" target="_blank" style="display: inline-block; padding: 12px 24px; background-color: #0F172A; color: #FFFFFF; font-size: 13px; font-weight: 700; text-decoration: none; border-radius: 8px;">
        Fund ${providerName} Balance &rarr;
      </a>
    </div>

    <p style="font-size: 12px; color: #94A3B8; margin: 0;">
      Once funded, subsequent customer orders for this product will complete automatically.
    </p>
  `;

  return {
    subject: `Action Required: Low ${providerName} Balance - ZuvaPay`,
    html: renderBaseEmailLayout({
      previewText: `Action required: Low balance on ${providerName}. Customer order failed and was refunded.`,
      contentHtml,
    }),
  };
}

/**
 * 9. Custom Email Verification Template
 */
export function renderEmailVerificationEmail({
  name,
  email,
  verifyUrl,
  token,
}: {
  name: string;
  email: string;
  verifyUrl: string;
  token?: string;
}): { subject: string; html: string } {
  const safeVerifyUrl = (verifyUrl || `${getEmailAppUrl()}/auth/callback?type=signup&next=/dashboard`)
    .replace(/https?:\/\/localhost(:\d+)?/gi, 'https://zuvapay.com')
    .replace(/https?:\/\/127\.0\.0\.1(:\d+)?/gi, 'https://zuvapay.com');

  const contentHtml = `
    <div style="margin-bottom: 20px;">
      <h1 style="margin: 0 0 8px 0; font-size: 20px; font-weight: 800; color: #0F172A; letter-spacing: -0.3px;">
        Verify your email address
      </h1>
      <p style="margin: 0; font-size: 14px; line-height: 22px; color: #475569;">
        Thanks for signing up for ZuvaPay, ${name}. Please confirm that <strong>${email}</strong> is your email address to get started.
      </p>
    </div>

    <!-- Verification Button -->
    <div style="margin: 24px 0;">
      <a href="${safeVerifyUrl}" target="_blank" style="display: inline-block; padding: 12px 28px; background-color: #FF6B00; color: #FFFFFF; font-size: 14px; font-weight: 700; text-decoration: none; border-radius: 8px;">
        Verify Email Address &rarr;
      </a>
    </div>

    ${
      token
        ? `
    <div class="token-box" style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 16px; text-align: center; margin: 20px 0;">
      <div style="font-size: 11px; font-weight: 700; color: #64748B; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px;">
        Verification Code
      </div>
      <div class="token-digits" style="font-size: 22px; font-weight: 800; font-family: monospace; letter-spacing: 4px; color: #0F172A;">
        ${token}
      </div>
    </div>`
        : ''
    }

    <!-- Fallback Link -->
    <div style="margin-bottom: 20px; font-size: 12px; color: #64748B; line-height: 18px;">
      <p style="margin: 0 0 4px 0;">If the button above does not work, copy and paste this link into your browser:</p>
      <p style="margin: 0; font-family: monospace; word-break: break-all; color: #FF6B00;">${safeVerifyUrl}</p>
    </div>

    <div style="border-top: 1px solid #F1F5F9; padding-top: 16px; font-size: 12px; color: #94A3B8; line-height: 18px;">
      This link will expire in 7 minutes. If you did not create an account, you can safely ignore this email.
    </div>
  `;

  return {
    subject: `Verify your email address - ZuvaPay`,
    html: renderBaseEmailLayout({
      previewText: `Verify your email address to activate your ZuvaPay account.`,
      contentHtml,
    }),
  };
}

/**
 * 10. Custom Password Reset Template
 */
export function renderPasswordResetEmail({
  name,
  email,
  resetUrl,
  ipAddress,
}: {
  name: string;
  email: string;
  resetUrl: string;
  ipAddress?: string;
}): { subject: string; html: string } {
  const safeResetUrl = (resetUrl || `${getEmailAppUrl()}/reset-password`)
    .replace(/https?:\/\/localhost(:\d+)?/gi, 'https://zuvapay.com')
    .replace(/https?:\/\/127\.0\.0\.1(:\d+)?/gi, 'https://zuvapay.com');

  const contentHtml = `
    <div style="margin-bottom: 20px;">
      <h1 style="margin: 0 0 8px 0; font-size: 20px; font-weight: 800; color: #0F172A; letter-spacing: -0.3px;">
        Reset your password
      </h1>
      <p style="margin: 0; font-size: 14px; line-height: 22px; color: #475569;">
        We received a request to reset the password for your ZuvaPay account (<strong>${email}</strong>).
      </p>
    </div>

    <!-- Reset Button -->
    <div style="margin: 24px 0;">
      <a href="${safeResetUrl}" target="_blank" style="display: inline-block; padding: 12px 28px; background-color: #FF6B00; color: #FFFFFF; font-size: 14px; font-weight: 700; text-decoration: none; border-radius: 8px;">
        Reset Password &rarr;
      </a>
    </div>

    <!-- Request Details -->
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 20px; font-size: 13px;">
      <tr>
        <td style="padding: 9px 0; border-bottom: 1px solid #F1F5F9; color: #64748B;">Account</td>
        <td align="right" style="padding: 9px 0; border-bottom: 1px solid #F1F5F9; font-weight: 600; color: #0F172A;">${email}</td>
      </tr>
      <tr>
        <td style="padding: 9px 0; border-bottom: 1px solid #F1F5F9; color: #64748B;">Date</td>
        <td align="right" style="padding: 9px 0; border-bottom: 1px solid #F1F5F9; font-weight: 600; color: #0F172A;">${new Date().toLocaleString('en-NG')}</td>
      </tr>
      ${
        ipAddress
          ? `
      <tr>
        <td style="padding: 9px 0; border-bottom: 1px solid #F1F5F9; color: #64748B;">IP Address</td>
        <td align="right" style="padding: 9px 0; border-bottom: 1px solid #F1F5F9; font-family: monospace; font-size: 12px; color: #0F172A;">${ipAddress}</td>
      </tr>`
          : ''
      }
    </table>

    <!-- Fallback Link -->
    <div style="margin-bottom: 20px; font-size: 12px; color: #64748B; line-height: 18px;">
      <p style="margin: 0 0 4px 0;">If the button does not work, copy and paste this link into your browser:</p>
      <p style="margin: 0; font-family: monospace; word-break: break-all; color: #FF6B00;">${safeResetUrl}</p>
    </div>

    <div style="border-top: 1px solid #F1F5F9; padding-top: 16px; font-size: 12px; color: #94A3B8; line-height: 18px;">
      This password reset link will expire in 7 minutes. If you did not request this, please ignore this email or contact <a href="mailto:hello@zuvapay.com" style="color: #64748B; text-decoration: underline;">hello@zuvapay.com</a> if you suspect unauthorized access.
    </div>
  `;

  return {
    subject: `Reset your password - ZuvaPay`,
    html: renderBaseEmailLayout({
      previewText: `Reset your ZuvaPay password. This link will expire in 7 minutes.`,
      contentHtml,
    }),
  };
}

/**
 * 11. Digital Marketplace & Software Delivery Template
 */
export function renderMarketplaceDeliveryEmail({
  name,
  productName,
  quantity = 1,
  amount,
  reference,
  date,
  delivery,
}: {
  name: string;
  productName: string;
  quantity?: number;
  amount?: number;
  reference: string;
  date?: string;
  delivery: {
    activationLink?: string | null;
    code?: string | null;
    instructions?: string | null;
    credentials?: string | null;
    rawText?: string;
  };
}): { subject: string; html: string } {
  const activationLink = delivery?.activationLink || null;
  const code = delivery?.code || null;
  const instructions = delivery?.instructions || null;
  const credentials = delivery?.credentials || null;

  const contentHtml = `
    <div style="margin-bottom: 20px;">
      <h1 style="margin: 0 0 4px 0; font-size: 20px; font-weight: 800; color: #0F172A; letter-spacing: -0.3px;">
        Your Digital Order is Ready
      </h1>
      <p style="margin: 0; font-size: 13px; color: #64748B;">
        Your order for <strong>${productName}</strong> has been fulfilled.
      </p>
    </div>

    <!-- Product Access Box -->
    <div class="token-box" style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 18px; margin-bottom: 24px;">
      <div style="font-size: 11px; font-weight: 700; color: #64748B; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">
        ${activationLink ? 'Access / License' : 'Access Code'}
      </div>
      <div style="font-size: 15px; font-weight: 800; font-family: monospace; color: #0F172A; word-break: break-all; margin-bottom: 8px;">
        ${code || activationLink || 'See instructions below'}
      </div>
      ${
        credentials && credentials !== code && credentials !== activationLink
          ? `
      <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid #E2E8F0; font-size: 12px; font-family: monospace; color: #475569; white-space: pre-wrap; word-break: break-all;">
        ${credentials}
      </div>`
          : ''
      }
      ${
        activationLink
          ? `
      <div style="margin-top: 14px;">
        <a href="${activationLink}" target="_blank" style="display: inline-block; padding: 10px 20px; background-color: #FF6B00; color: #FFFFFF; font-size: 12px; font-weight: 700; text-decoration: none; border-radius: 6px;">
          Open Link &rarr;
        </a>
      </div>`
          : ''
      }
    </div>

    ${
      instructions
        ? `
    <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 14px; margin-bottom: 24px; font-size: 12px; line-height: 20px; color: #475569; white-space: pre-wrap;">
      <strong style="color: #0F172A; display: block; margin-bottom: 4px;">Instructions:</strong>
      ${instructions}
    </div>`
        : ''
    }

    <!-- Order Summary Table -->
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 24px; font-size: 13px;">
      <tr>
        <td style="padding: 9px 0; border-bottom: 1px solid #F1F5F9; color: #64748B;">Product</td>
        <td align="right" style="padding: 9px 0; border-bottom: 1px solid #F1F5F9; font-weight: 700; color: #0F172A;">${productName}</td>
      </tr>
      <tr>
        <td style="padding: 9px 0; border-bottom: 1px solid #F1F5F9; color: #64748B;">Quantity</td>
        <td align="right" style="padding: 9px 0; border-bottom: 1px solid #F1F5F9; font-weight: 600; color: #0F172A;">${quantity} unit${quantity > 1 ? 's' : ''}</td>
      </tr>
      ${
        amount
          ? `
      <tr>
        <td style="padding: 9px 0; border-bottom: 1px solid #F1F5F9; color: #64748B;">Amount Paid</td>
        <td align="right" style="padding: 9px 0; border-bottom: 1px solid #F1F5F9; font-weight: 800; color: #0F172A;">₦${amount.toLocaleString('en-NG', { minimumFractionDigits: 2 })}</td>
      </tr>`
          : ''
      }
      <tr>
        <td style="padding: 9px 0; border-bottom: 1px solid #F1F5F9; color: #64748B;">Order Reference</td>
        <td align="right" style="padding: 9px 0; border-bottom: 1px solid #F1F5F9; font-family: monospace; font-size: 12px; color: #64748B;">${reference}</td>
      </tr>
      <tr>
        <td style="padding: 9px 0; color: #64748B;">Date</td>
        <td align="right" style="padding: 9px 0; font-weight: 600; color: #0F172A;">${date || new Date().toLocaleString('en-NG')}</td>
      </tr>
    </table>

    <div style="margin-top: 20px;">
      <a href="${getEmailAppUrl()}/dashboard" style="display: inline-block; padding: 11px 24px; background-color: #0F172A; color: #FFFFFF; font-size: 12px; font-weight: 700; text-decoration: none; border-radius: 8px;">
        View in Dashboard &rarr;
      </a>
    </div>
  `;

  return {
    subject: `Your digital order: ${productName} - ZuvaPay`,
    html: renderBaseEmailLayout({
      previewText: `Your digital order for ${productName} is ready. Order Ref: ${reference}.`,
      contentHtml,
    }),
  };
}

