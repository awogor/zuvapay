import { renderBaseEmailLayout } from './baseLayout';

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
  | 'admin_low_balance';

/**
 * 1. Welcome Email Template
 */
export function renderWelcomeEmail({
  name,
  email,
}: {
  name: string;
  email: string;
  virtualAccount?: { bankName: string; accountNumber: string; accountName: string };
}): { subject: string; html: string } {
  const contentHtml = `
    <h1 style="margin: 0 0 12px 0; font-size: 22px; font-weight: 800; color: #0F172A; letter-spacing: -0.5px;">
      Welcome to ZuvaPay, ${name}!
    </h1>
    <p style="margin: 0 0 20px 0; font-size: 14px; line-height: 24px; color: #475569;">
      Your account is active and ready to use. ZuvaPay makes it easy to purchase cheap SME data bundles, generate instant 20-digit electricity tokens, pay cable TV bills, and manage digital subscriptions all in one place.
    </p>

    <!-- Services Overview Card -->
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; margin-bottom: 24px; padding: 14px;">
      <tr>
        <td style="padding: 8px 12px; font-size: 13px; color: #334155; line-height: 20px;">
          <strong>Internet Data &amp; Airtime:</strong> Instant wholesale SME &amp; gifting bundles for MTN, Airtel, Glo, and 9mobile.
        </td>
      </tr>
      <tr>
        <td style="padding: 8px 12px; font-size: 13px; color: #334155; line-height: 20px;">
          <strong>Electricity Tokens:</strong> Instant 20-digit prepaid tokens and postpaid bill payment for all Discos.
        </td>
      </tr>
      <tr>
        <td style="padding: 8px 12px; font-size: 13px; color: #334155; line-height: 20px;">
          <strong>Cable TV &amp; Subscriptions:</strong> Fast renewals for DStv, GOtv, StarTimes, and verified digital software.
        </td>
      </tr>
    </table>

    <!-- Action Button -->
    <div style="text-align: center; margin: 28px 0;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://zuvapay.com'}/dashboard" style="display: inline-block; padding: 12px 28px; background-color: #FF6B00; color: #FFFFFF; font-size: 13px; font-weight: 700; text-decoration: none; border-radius: 10px;">
        Go to Your Dashboard &rarr;
      </a>
    </div>

    <p style="margin: 0; font-size: 12px; line-height: 20px; color: #64748B;">
      If you have questions or need help, you can reply directly to this email or reach us anytime at <a href="mailto:hello@zuvapay.com" style="color: #FF6B00; text-decoration: none; font-weight: 600;">hello@zuvapay.com</a>.
    </p>
  `;

  return {
    subject: `Welcome to ZuvaPay, ${name}`,
    html: renderBaseEmailLayout({
      previewText: `Welcome to ZuvaPay! Your account is active and ready to use.`,
      headerBadge: 'Account Ready',
      badgeColor: '#10B981',
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
    <div style="text-align: center; margin-bottom: 24px;">
      <div style="display: inline-block; width: 56px; height: 56px; line-height: 56px; background-color: #ECFDF5; border-radius: 50%; text-align: center; font-size: 28px; margin-bottom: 12px;">
        💰
      </div>
      <h1 style="margin: 0 0 6px 0; font-size: 22px; font-weight: 900; color: #0F172A;">
        Wallet Credited Successfully!
      </h1>
      <div style="font-size: 32px; font-weight: 900; color: #059669; font-family: monospace; letter-spacing: -1px; margin-top: 8px;">
        +₦${amount.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
      </div>
    </div>

    <!-- Transaction Summary Receipt -->
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 14px; margin-bottom: 24px;">
      <tr>
        <td style="padding: 14px 18px; border-bottom: 1px solid #EDF2F7; font-size: 12px; color: #64748B;">Recipient</td>
        <td style="padding: 14px 18px; border-bottom: 1px solid #EDF2F7; font-size: 12px; font-weight: 700; color: #0F172A; text-align: right;">${name}</td>
      </tr>
      <tr>
        <td style="padding: 14px 18px; border-bottom: 1px solid #EDF2F7; font-size: 12px; color: #64748B;">Source / Payer</td>
        <td style="padding: 14px 18px; border-bottom: 1px solid #EDF2F7; font-size: 12px; font-weight: 700; color: #0F172A; text-align: right;">${payerName || 'Bank Transfer'} (${bankName || 'Virtual Account'})</td>
      </tr>
      <tr>
        <td style="padding: 14px 18px; border-bottom: 1px solid #EDF2F7; font-size: 12px; color: #64748B;">Transaction Ref</td>
        <td style="padding: 14px 18px; border-bottom: 1px solid #EDF2F7; font-size: 12px; font-weight: 700; color: #0F172A; font-family: monospace; text-align: right;">${reference}</td>
      </tr>
      <tr>
        <td style="padding: 14px 18px; border-bottom: 1px solid #EDF2F7; font-size: 12px; color: #64748B;">Date & Time</td>
        <td style="padding: 14px 18px; border-bottom: 1px solid #EDF2F7; font-size: 12px; font-weight: 700; color: #0F172A; text-align: right;">${date || new Date().toLocaleString('en-NG')}</td>
      </tr>
      <tr>
        <td style="padding: 14px 18px; font-size: 12px; color: #64748B;">Updated Wallet Balance</td>
        <td style="padding: 14px 18px; font-size: 13px; font-weight: 900; color: #0F172A; font-family: monospace; text-align: right;">₦${newBalance.toLocaleString('en-NG', { minimumFractionDigits: 2 })}</td>
      </tr>
    </table>

    <div style="text-align: center; margin-top: 24px;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard" style="display: inline-block; padding: 12px 24px; background-color: #0F172A; color: #FFFFFF; font-size: 12px; font-weight: 700; text-decoration: none; border-radius: 10px;">
        View Transaction in Dashboard
      </a>
    </div>
  `;

  return {
    subject: `Credit Alert: ₦${amount.toLocaleString('en-NG')} received in your wallet! 💰`,
    html: renderBaseEmailLayout({
      previewText: `₦${amount.toLocaleString('en-NG')} successfully credited to your ZuvaPay wallet. New Balance: ₦${newBalance.toLocaleString('en-NG')}.`,
      headerBadge: 'Credit Alert',
      badgeColor: '#10B981',
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
        <td style="padding: 12px 18px; border-bottom: 1px solid #EDF2F7; font-size: 12px; color: #64748B;">${key}</td>
        <td style="padding: 12px 18px; border-bottom: 1px solid #EDF2F7; font-size: 12px; font-weight: 700; color: #0F172A; text-align: right; font-family: ${key.toLowerCase().includes('token') || key.toLowerCase().includes('code') || key.toLowerCase().includes('password') ? 'monospace' : 'inherit'};">${val}</td>
      </tr>
    `
      )
      .join('');
  }

  const contentHtml = `
    <div style="text-align: center; margin-bottom: 24px;">
      <div style="display: inline-block; width: 56px; height: 56px; line-height: 56px; background-color: #FEF3C7; border-radius: 50%; text-align: center; font-size: 28px; margin-bottom: 12px;">
        ⚡
      </div>
      <h1 style="margin: 0 0 6px 0; font-size: 22px; font-weight: 900; color: #0F172A;">
        Fulfillment Confirmed!
      </h1>
      <p style="margin: 0; font-size: 13px; color: #64748B;">
        Your order for <strong>${serviceName}</strong> has been fulfilled.
      </p>
    </div>

    <!-- Itemized Table -->
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 14px; margin-bottom: 24px;">
      <tr>
        <td style="padding: 12px 18px; border-bottom: 1px solid #EDF2F7; font-size: 12px; color: #64748B;">Service Item</td>
        <td style="padding: 12px 18px; border-bottom: 1px solid #EDF2F7; font-size: 12px; font-weight: 700; color: #0F172A; text-align: right;">${serviceName}</td>
      </tr>
      <tr>
        <td style="padding: 12px 18px; border-bottom: 1px solid #EDF2F7; font-size: 12px; color: #64748B;">Category</td>
        <td style="padding: 12px 18px; border-bottom: 1px solid #EDF2F7; font-size: 11px; font-weight: 800; color: #EA580C; text-transform: uppercase; text-align: right;">${category}</td>
      </tr>
      <tr>
        <td style="padding: 12px 18px; border-bottom: 1px solid #EDF2F7; font-size: 12px; color: #64748B;">Amount Paid</td>
        <td style="padding: 12px 18px; border-bottom: 1px solid #EDF2F7; font-size: 13px; font-weight: 900; color: #0F172A; font-family: monospace; text-align: right;">₦${amount.toLocaleString('en-NG', { minimumFractionDigits: 2 })}</td>
      </tr>
      <tr>
        <td style="padding: 12px 18px; border-bottom: 1px solid #EDF2F7; font-size: 12px; color: #64748B;">Order Reference</td>
        <td style="padding: 12px 18px; border-bottom: 1px solid #EDF2F7; font-size: 12px; font-weight: 700; color: #0F172A; font-family: monospace; text-align: right;">${reference}</td>
      </tr>
      ${detailsHtml}
      <tr>
        <td style="padding: 12px 18px; font-size: 12px; color: #64748B;">Date</td>
        <td style="padding: 12px 18px; font-size: 12px; font-weight: 700; color: #0F172A; text-align: right;">${date || new Date().toLocaleString('en-NG')}</td>
      </tr>
    </table>

    <div style="background-color: #ECFDF5; border: 1px solid #A7F3D0; border-radius: 12px; padding: 14px; text-align: center; font-size: 11px; color: #065F46;">
      🛡️ <strong>Automated Warranty:</strong> Immediate full wallet refund if purchase fails or is rejected by provider switches.
    </div>
  `;

  return {
    subject: `Order Receipt: ${serviceName} Delivered (Ref: ${reference})`,
    html: renderBaseEmailLayout({
      previewText: `Your ${serviceName} order of ₦${amount.toLocaleString('en-NG')} was fulfilled successfully.`,
      headerBadge: 'Order Completed',
      badgeColor: '#10B981',
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
    <div style="text-align: center; margin-bottom: 24px;">
      <div style="display: inline-block; width: 56px; height: 56px; line-height: 56px; background-color: #EFF6FF; border-radius: 50%; text-align: center; font-size: 28px; margin-bottom: 12px;">
        ↩️
      </div>
      <h1 style="margin: 0 0 6px 0; font-size: 22px; font-weight: 900; color: #0F172A;">
        Automated Instant Refund
      </h1>
      <p style="margin: 0; font-size: 13px; color: #64748B;">
        The provider switch rejected or timed out your order. <strong>100% of your funds have been returned to your wallet.</strong>
      </p>
    </div>

    <!-- Refund Receipt Box -->
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 14px; margin-bottom: 24px;">
      <tr>
        <td style="padding: 12px 18px; border-bottom: 1px solid #EDF2F7; font-size: 12px; color: #64748B;">Failed Service</td>
        <td style="padding: 12px 18px; border-bottom: 1px solid #EDF2F7; font-size: 12px; font-weight: 700; color: #0F172A; text-align: right;">${serviceName}</td>
      </tr>
      <tr>
        <td style="padding: 12px 18px; border-bottom: 1px solid #EDF2F7; font-size: 12px; color: #64748B;">Refunded Amount</td>
        <td style="padding: 12px 18px; border-bottom: 1px solid #EDF2F7; font-size: 14px; font-weight: 900; color: #2563EB; font-family: monospace; text-align: right;">+₦${amount.toLocaleString('en-NG', { minimumFractionDigits: 2 })}</td>
      </tr>
      <tr>
        <td style="padding: 12px 18px; border-bottom: 1px solid #EDF2F7; font-size: 12px; color: #64748B;">Reason</td>
        <td style="padding: 12px 18px; border-bottom: 1px solid #EDF2F7; font-size: 12px; font-weight: 600; color: #DC2626; text-align: right;">${reason || 'Carrier gateway timed out / out of stock'}</td>
      </tr>
      <tr>
        <td style="padding: 12px 18px; border-bottom: 1px solid #EDF2F7; font-size: 12px; color: #64748B;">Original Reference</td>
        <td style="padding: 12px 18px; border-bottom: 1px solid #EDF2F7; font-size: 12px; font-weight: 700; color: #0F172A; font-family: monospace; text-align: right;">${reference}</td>
      </tr>
      ${
        newBalance !== undefined
          ? `
      <tr>
        <td style="padding: 12px 18px; font-size: 12px; color: #64748B;">Current Balance</td>
        <td style="padding: 12px 18px; font-size: 13px; font-weight: 900; color: #0F172A; font-family: monospace; text-align: right;">₦${newBalance.toLocaleString('en-NG', { minimumFractionDigits: 2 })}</td>
      </tr>`
          : ''
      }
    </table>

    <div style="background-color: #FEF2F2; border: 1px solid #FECACA; border-radius: 12px; padding: 14px; text-align: center; font-size: 11px; color: #991B1B;">
      No support ticket required! Your funds were automatically credited back into your wallet within 5 seconds.
    </div>
  `;

  return {
    subject: `Instant Refund: ₦${amount.toLocaleString('en-NG')} returned to your wallet (Ref: ${reference})`,
    html: renderBaseEmailLayout({
      previewText: `Your order for ${serviceName} could not be delivered by the operator. ₦${amount.toLocaleString('en-NG')} was automatically refunded.`,
      headerBadge: 'Auto Refund',
      badgeColor: '#3B82F6',
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
    <div style="text-align: center; margin-bottom: 24px;">
      <div style="display: inline-block; width: 56px; height: 56px; line-height: 56px; background-color: #FEF2F2; border-radius: 50%; text-align: center; font-size: 28px; margin-bottom: 12px;">
        🛡️
      </div>
      <h1 style="margin: 0 0 6px 0; font-size: 22px; font-weight: 900; color: #0F172A;">
        Security Notification
      </h1>
      <p style="margin: 0; font-size: 13px; color: #64748B;">
        Important security activity was detected on your ZuvaPay account: <strong>${actionType}</strong>.
      </p>
    </div>

    <!-- Security Activity Details -->
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 14px; margin-bottom: 24px;">
      <tr>
        <td style="padding: 12px 18px; border-bottom: 1px solid #EDF2F7; font-size: 12px; color: #64748B;">Action</td>
        <td style="padding: 12px 18px; border-bottom: 1px solid #EDF2F7; font-size: 12px; font-weight: 700; color: #0F172A; text-align: right;">${actionType}</td>
      </tr>
      <tr>
        <td style="padding: 12px 18px; border-bottom: 1px solid #EDF2F7; font-size: 12px; color: #64748B;">Date & Time</td>
        <td style="padding: 12px 18px; border-bottom: 1px solid #EDF2F7; font-size: 12px; font-weight: 700; color: #0F172A; text-align: right;">${date || new Date().toLocaleString('en-NG')}</td>
      </tr>
      ${
        ipAddress
          ? `
      <tr>
        <td style="padding: 12px 18px; border-bottom: 1px solid #EDF2F7; font-size: 12px; color: #64748B;">IP Address</td>
        <td style="padding: 12px 18px; border-bottom: 1px solid #EDF2F7; font-size: 12px; font-weight: 700; color: #0F172A; font-family: monospace; text-align: right;">${ipAddress}</td>
      </tr>`
          : ''
      }
      ${
        userAgent
          ? `
      <tr>
        <td style="padding: 12px 18px; font-size: 12px; color: #64748B;">Device</td>
        <td style="padding: 12px 18px; font-size: 11px; font-weight: 600; color: #475569; text-align: right;">${userAgent}</td>
      </tr>`
          : ''
      }
    </table>

    <div style="background-color: #FFFBEB; border: 1px solid #FCD34D; border-radius: 12px; padding: 14px; font-size: 12px; color: #92400E; line-height: 18px;">
      ⚠️ <strong>Didn't authorize this?</strong> If you did not perform this change, immediately message our security desk via WhatsApp to freeze your wallet and reset your credentials.
    </div>
  `;

  return {
    subject: `Security Alert: ${actionType} on your ZuvaPay Account`,
    html: renderBaseEmailLayout({
      previewText: `Security alert: ${actionType} was recently performed on your ZuvaPay profile.`,
      headerBadge: 'Security Alert',
      badgeColor: '#EF4444',
      contentHtml,
    }),
  };
}

/**
 * 6. Electricity / NEPA Prepaid Meter Token Alert Template
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
  // Ensure token is cleanly formatted with spaces or hyphens for ease of reading
  const cleanDigits = (token || '').replace(/\D/g, '');
  const formattedToken =
    cleanDigits.length === 20
      ? cleanDigits.match(/.{1,4}/g)?.join(' - ') || token
      : token;

  const contentHtml = `
    <!-- Hero Header -->
    <div style="text-align: center; margin-bottom: 24px;">
      <div style="display: inline-block; width: 56px; height: 56px; line-height: 56px; background-color: #FEF3C7; border-radius: 50%; text-align: center; font-size: 28px; margin-bottom: 12px; border: 2px solid #FDE68A;">
        ⚡
      </div>
      <h1 style="margin: 0 0 6px 0; font-size: 22px; font-weight: 900; color: #0F172A; letter-spacing: -0.5px;">
        Your NEPA Token is Ready!
      </h1>
      <p style="margin: 0; font-size: 13px; color: #64748B;">
        Electricity recharge generated for <strong>${disco}</strong> (${meterType})
      </p>
    </div>

    <!-- Highlighted NEPA Token Box -->
    <div style="background-color: #0F172A; border: 2px solid #10B981; border-radius: 16px; padding: 24px 20px; text-align: center; margin-bottom: 24px; box-shadow: 0 8px 24px rgba(16, 185, 129, 0.15);">
      <div style="font-size: 11px; font-weight: 800; color: #10B981; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">
        ⚡ 20-Digit Meter Recharge Token
      </div>
      <div style="font-size: 22px; sm-font-size: 26px; font-weight: 900; color: #34D399; font-family: 'Courier New', Courier, monospace; letter-spacing: 2px; word-break: break-all; padding: 10px 0;">
        ${formattedToken}
      </div>
      <div style="font-size: 11px; color: #94A3B8; margin-top: 6px;">
        Key these 20 digits on your meter CIU keypad followed by the <strong>blue/red enter key (↵ / #)</strong>.
      </div>
      ${
        units
          ? `
      <div style="display: inline-block; margin-top: 14px; padding: 6px 14px; background-color: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 20px; font-size: 12px; font-weight: 800; color: #6EE7B7;">
        ⚡ Units Credited: ${units}
      </div>`
          : ''
      }
    </div>

    <!-- Meter & Account Summary Table -->
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 14px; margin-bottom: 24px;">
      <tr>
        <td style="padding: 12px 18px; border-bottom: 1px solid #EDF2F7; font-size: 12px; color: #64748B;">DISCO Provider</td>
        <td style="padding: 12px 18px; border-bottom: 1px solid #EDF2F7; font-size: 12px; font-weight: 800; color: #0F172A; text-align: right;">${disco}</td>
      </tr>
      <tr>
        <td style="padding: 12px 18px; border-bottom: 1px solid #EDF2F7; font-size: 12px; color: #64748B;">Meter Number</td>
        <td style="padding: 12px 18px; border-bottom: 1px solid #EDF2F7; font-size: 13px; font-weight: 800; color: #0F172A; font-family: monospace; text-align: right;">${meterNumber}</td>
      </tr>
      <tr>
        <td style="padding: 12px 18px; border-bottom: 1px solid #EDF2F7; font-size: 12px; color: #64748B;">Meter Type</td>
        <td style="padding: 12px 18px; border-bottom: 1px solid #EDF2F7; font-size: 11px; font-weight: 800; color: #EA580C; text-transform: uppercase; text-align: right;">${meterType}</td>
      </tr>
      <tr>
        <td style="padding: 12px 18px; border-bottom: 1px solid #EDF2F7; font-size: 12px; color: #64748B;">Customer / Owner</td>
        <td style="padding: 12px 18px; border-bottom: 1px solid #EDF2F7; font-size: 12px; font-weight: 700; color: #0F172A; text-align: right;">${customerName}</td>
      </tr>
      ${
        customerAddress
          ? `
      <tr>
        <td style="padding: 12px 18px; border-bottom: 1px solid #EDF2F7; font-size: 12px; color: #64748B;">Premise Address</td>
        <td style="padding: 12px 18px; border-bottom: 1px solid #EDF2F7; font-size: 11px; color: #334155; text-align: right; max-width: 220px;">${customerAddress}</td>
      </tr>`
          : ''
      }
      <tr>
        <td style="padding: 12px 18px; border-bottom: 1px solid #EDF2F7; font-size: 12px; color: #64748B;">Amount Paid</td>
        <td style="padding: 12px 18px; border-bottom: 1px solid #EDF2F7; font-size: 13px; font-weight: 900; color: #0F172A; font-family: monospace; text-align: right;">₦${amount.toLocaleString('en-NG', { minimumFractionDigits: 2 })}</td>
      </tr>
      <tr>
        <td style="padding: 12px 18px; border-bottom: 1px solid #EDF2F7; font-size: 12px; color: #64748B;">Transaction Ref</td>
        <td style="padding: 12px 18px; border-bottom: 1px solid #EDF2F7; font-size: 11px; font-weight: 700; color: #64748B; font-family: monospace; text-align: right;">${reference}</td>
      </tr>
      ${
        operatorReference
          ? `
      <tr>
        <td style="padding: 12px 18px; border-bottom: 1px solid #EDF2F7; font-size: 12px; color: #64748B;">Disco Operator Ref</td>
        <td style="padding: 12px 18px; border-bottom: 1px solid #EDF2F7; font-size: 11px; font-weight: 700; color: #64748B; font-family: monospace; text-align: right;">${operatorReference}</td>
      </tr>`
          : ''
      }
      <tr>
        <td style="padding: 12px 18px; font-size: 12px; color: #64748B;">Recharge Date</td>
        <td style="padding: 12px 18px; font-size: 12px; font-weight: 700; color: #0F172A; text-align: right;">${date || new Date().toLocaleString('en-NG')}</td>
      </tr>
    </table>

    <!-- Meter Recharge Instructions -->
    <div style="background-color: #FFFBEB; border: 1px solid #FDE68A; border-radius: 14px; padding: 18px; margin-bottom: 24px;">
      <div style="font-size: 12px; font-weight: 800; color: #B45309; text-transform: uppercase; margin-bottom: 8px;">
        💡 How to Load Your Token onto Your Meter:
      </div>
      <ol style="margin: 0; padding-left: 18px; font-size: 12px; line-height: 20px; color: #78350F;">
        <li>Ensure your meter interface unit (CIU) is connected to a direct wall socket.</li>
        <li>Carefully type in the <strong>20 digits</strong> displayed above.</li>
        <li>Press the <strong>blue/red button</strong> or <strong>Enter / #</strong> key.</li>
        <li>Your meter will display <strong>ACCEPTED</strong> or <strong>GOOD</strong> and credit the kWh units.</li>
      </ol>
    </div>

    <!-- Automated Warranty -->
    <div style="background-color: #ECFDF5; border: 1px solid #A7F3D0; border-radius: 12px; padding: 14px; text-align: center; font-size: 11px; color: #065F46;">
      🛡️ <strong>Automated Warranty:</strong> If your token is not accepted due to carrier switch errors, our team resolves it within minutes or refunds your wallet in full.
    </div>
  `;

  return {
    subject: `⚡ Your NEPA Token: ${token} (${disco} - ${units || `₦${amount.toLocaleString('en-NG')}`})`,
    html: renderBaseEmailLayout({
      previewText: `Your 20-digit ${disco} token is: ${token}. Units: ${units || 'Generated'}. Amount: ₦${amount.toLocaleString('en-NG')}.`,
      headerBadge: 'Token Delivered',
      badgeColor: '#10B981',
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
    <h1 style="margin: 0 0 14px 0; font-size: 22px; font-weight: 900; color: #0F172A;">
      ${headline}
    </h1>
    <div style="font-size: 13px; line-height: 22px; color: #475569; margin-bottom: 24px;">
      ${bodyHtml}
    </div>

    ${
      ctaText && ctaUrl
        ? `
    <div style="text-align: center; margin: 28px 0;">
      <a href="${ctaUrl}" style="display: inline-block; padding: 14px 28px; background: linear-gradient(135deg, #FF6B00 0%, #EA580C 100%); color: #FFFFFF; font-size: 13px; font-weight: 800; text-decoration: none; border-radius: 12px; box-shadow: 0 4px 12px rgba(255, 107, 0, 0.3);">
        ${ctaText}
      </a>
    </div>`
        : ''
    }
  `;

  return {
    subject: headline,
    html: renderBaseEmailLayout({
      previewText: headline,
      headerBadge: 'Official Update',
      badgeColor: '#FF6B00',
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
    <div style="background-color: #FEF2F2; border: 1px solid #FCA5A5; border-radius: 14px; padding: 20px; margin-bottom: 24px;">
      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
        <span style="font-size: 11px; font-weight: 900; color: #DC2626; text-transform: uppercase; letter-spacing: 0.5px;">
          ⚠️ Action Required: Supplier Wallet Depleted
        </span>
      </div>
      <h2 style="margin: 0 0 10px 0; font-size: 18px; font-weight: 900; color: #991B1B;">
        Customer purchase blocked due to low provider balance
      </h2>
      <p style="margin: 0; font-size: 13px; line-height: 20px; color: #7F1D1D;">
        A customer tried to purchase <strong>${productName}</strong>, but the order could not be fulfilled by <strong>${providerName}</strong> because your reseller wallet balance is depleted.
      </p>
    </div>

    <!-- Diagnostic Details Table -->
    <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 14px; padding: 18px; margin-bottom: 24px;">
      <div style="font-size: 11px; font-weight: 800; color: #64748B; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px;">
        Diagnostic Incident Details
      </div>

      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="font-size: 13px;">
        <tr>
          <td style="color: #64748B; padding: 6px 0;">Attempted Product:</td>
          <td align="right" style="font-weight: 800; color: #0F172A; padding: 6px 0;">${productName}</td>
        </tr>
        <tr>
          <td style="color: #64748B; padding: 6px 0;">API Provider / Gateway:</td>
          <td align="right" style="font-weight: 800; color: #7C3AED; padding: 6px 0;">${providerName}</td>
        </tr>
        <tr>
          <td style="color: #64748B; padding: 6px 0;">Order Value:</td>
          <td align="right" style="font-weight: 800; color: #0F172A; padding: 6px 0;">₦${typeof amount === 'number' ? amount.toLocaleString() : amount}</td>
        </tr>
        <tr>
          <td style="color: #64748B; padding: 6px 0;">Customer Account:</td>
          <td align="right" style="font-weight: 700; color: #0F172A; padding: 6px 0;">${customerEmail}</td>
        </tr>
        <tr>
          <td style="color: #64748B; padding: 6px 0;">Order Reference:</td>
          <td align="right" style="font-family: monospace; font-weight: 700; color: #475569; padding: 6px 0;">${orderReference}</td>
        </tr>
        <tr>
          <td style="color: #64748B; padding: 6px 0;">Provider Error Reason:</td>
          <td align="right" style="font-weight: 800; color: #DC2626; padding: 6px 0;">${errorMessage}</td>
        </tr>
        <tr>
          <td style="color: #64748B; padding: 6px 0;">User Status:</td>
          <td align="right" style="font-weight: 800; color: #059669; padding: 6px 0;">Automatically Refunded to Wallet</td>
        </tr>
      </table>
    </div>

    <!-- CTA Button to Fund Provider -->
    <div style="text-align: center; margin: 28px 0 16px 0;">
      <a href="${portalUrl || 'https://resellers.aiplug.store'}" target="_blank" style="display: inline-block; padding: 14px 28px; background: linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%); color: #FFFFFF; font-size: 13px; font-weight: 800; text-decoration: none; border-radius: 12px; box-shadow: 0 4px 12px rgba(124, 58, 237, 0.3);">
        Fund ${providerName} Wallet Now →
      </a>
    </div>

    <p style="text-align: center; font-size: 11px; color: #94A3B8; margin: 0;">
      Once funded, subsequent customer orders for this product will complete automatically.
    </p>
  `;

    return {
    subject: `🚨 [URGENT] ${providerName} Wallet Low: Customer purchase of "${productName}" failed`,
    html: renderBaseEmailLayout({
      previewText: `Action required: Fund your ${providerName} wallet. Customer order failed due to low balance.`,
      headerBadge: 'Low Provider Balance',
      badgeColor: '#DC2626',
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
  const contentHtml = `
    <h1 style="margin: 0 0 12px 0; font-size: 24px; font-weight: 900; color: #0F172A; letter-spacing: -0.5px;">
      Verify your email address, ${name} ✨
    </h1>
    <p style="margin: 0 0 20px 0; font-size: 14px; line-height: 22px; color: #475569;">
      Thank you for creating your account with <strong>ZuvaPay</strong>. Please confirm that <strong>${email}</strong> belongs to you to activate automated wallet funding and wholesale telecom utilities.
    </p>

    <!-- Security Box -->
    <div style="background-color: #F0FDF4; border: 1px solid #BBF7D0; border-radius: 14px; padding: 20px; margin-bottom: 24px;">
      <div style="font-size: 11px; font-weight: 800; color: #15803D; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px;">
        🛡️ Secure 1-Click Verification
      </div>
      <p style="margin: 0 0 14px 0; font-size: 13px; line-height: 20px; color: #166534;">
        Click the button below to instantly verify your account and unlock your dedicated virtual funding account.
      </p>
      <div style="text-align: center; margin: 16px 0;">
        <a href="${verifyUrl}" target="_blank" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #FF6B00 0%, #EA580C 100%); color: #FFFFFF; font-size: 14px; font-weight: 800; text-decoration: none; border-radius: 12px; box-shadow: 0 4px 14px rgba(255, 107, 0, 0.35);">
          Verify My Email Address →
        </a>
      </div>
      ${token ? `
      <div style="text-align: center; margin-top: 12px; font-size: 12px; color: #15803D;">
        Or enter this 6-digit verification code on your screen:
        <div style="font-size: 24px; font-family: monospace; font-weight: 900; letter-spacing: 4px; color: #0F172A; margin-top: 6px;">
          ${token}
        </div>
      </div>` : ''}
    </div>

    <!-- Secondary Link Copy Box -->
    <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 14px; margin-bottom: 24px;">
      <p style="margin: 0 0 6px 0; font-size: 11px; font-weight: 700; color: #64748B;">
        Button not working? Copy and paste this link into your browser:
      </p>
      <p style="margin: 0; font-size: 11px; font-family: monospace; word-break: break-all; color: #3B82F6;">
        ${verifyUrl}
      </p>
    </div>

    <div style="border-top: 1px solid #E2E8F0; padding-top: 16px; font-size: 12px; color: #64748B; line-height: 18px;">
      <p style="margin: 0 0 6px 0;">
        <strong>Didn't sign up for ZuvaPay?</strong> You can safely ignore this email. No account will be activated without verification.
      </p>
      <p style="margin: 0; font-size: 11px; color: #94A3B8;">
        This verification link will expire in 7 minutes for your account security.
      </p>
    </div>
  `;

  return {
    subject: `Verify your ZuvaPay account — ${name}`,
    html: renderBaseEmailLayout({
      previewText: `Confirm your email to activate your ZuvaPay account and unlock instant utilities.`,
      headerBadge: 'Email Verification',
      badgeColor: '#10B981',
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
  const contentHtml = `
    <h1 style="margin: 0 0 12px 0; font-size: 24px; font-weight: 900; color: #0F172A; letter-spacing: -0.5px;">
      Reset your ZuvaPay password 🔒
    </h1>
    <p style="margin: 0 0 20px 0; font-size: 14px; line-height: 22px; color: #475569;">
      We received a request to reset the password for your ZuvaPay account (<strong>${email}</strong>).
    </p>

    <!-- Reset Action Box -->
    <div style="background-color: #FFF7ED; border: 1px solid #FFEDD5; border-radius: 14px; padding: 22px; margin-bottom: 24px;">
      <div style="font-size: 11px; font-weight: 800; color: #C2410C; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">
        🔑 Password Recovery
      </div>
      <p style="margin: 0 0 16px 0; font-size: 13px; line-height: 20px; color: #9A3412;">
        Click the button below to choose a strong, new password. For your security, this recovery link will expire in <strong>7 minutes</strong>.
      </p>
      <div style="text-align: center; margin: 18px 0;">
        <a href="${resetUrl}" target="_blank" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #FF6B00 0%, #EA580C 100%); color: #FFFFFF; font-size: 14px; font-weight: 800; text-decoration: none; border-radius: 12px; box-shadow: 0 4px 14px rgba(255, 107, 0, 0.35);">
          Set New Password →
        </a>
      </div>
    </div>

    <!-- Security Advisory & Metadata -->
    <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 16px; margin-bottom: 24px;">
      <div style="font-size: 11px; font-weight: 800; color: #64748B; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 10px;">
        Security Advisory & Request Details
      </div>
      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="font-size: 12px;">
        <tr>
          <td style="color: #64748B; padding: 4px 0;">Target Account:</td>
          <td align="right" style="font-weight: 700; color: #0F172A; padding: 4px 0;">${email}</td>
        </tr>
        <tr>
          <td style="color: #64748B; padding: 4px 0;">Requested At:</td>
          <td align="right" style="font-weight: 700; color: #0F172A; padding: 4px 0;">${new Date().toLocaleString('en-NG', { timeZone: 'Africa/Lagos' })} WAT</td>
        </tr>
        ${ipAddress ? `
        <tr>
          <td style="color: #64748B; padding: 4px 0;">Request IP Address:</td>
          <td align="right" style="font-family: monospace; font-weight: 700; color: #475569; padding: 4px 0;">${ipAddress}</td>
        </tr>` : ''}
      </table>
    </div>

    <!-- Secondary Fallback Link -->
    <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 14px; margin-bottom: 24px;">
      <p style="margin: 0 0 6px 0; font-size: 11px; font-weight: 700; color: #64748B;">
        Button not opening? Copy and paste this URL into your browser:
      </p>
      <p style="margin: 0; font-size: 11px; font-family: monospace; word-break: break-all; color: #3B82F6;">
        ${resetUrl}
      </p>
    </div>

    <div style="border-top: 1px solid #E2E8F0; padding-top: 16px; font-size: 12px; color: #64748B; line-height: 18px;">
      <p style="margin: 0 0 6px 0; color: #DC2626; font-weight: 700;">
        ⚠️ Didn't request a password reset?
      </p>
      <p style="margin: 0; font-size: 11px; color: #64748B;">
        If you didn't initiate this request, your account may be at risk. We recommend reviewing your security settings or reaching out immediately to <strong>support@zuvapay.com</strong>.
      </p>
    </div>
  `;

  return {
    subject: `Reset your ZuvaPay password`,
    html: renderBaseEmailLayout({
      previewText: `Reset your ZuvaPay password safely. Link expires in 7 minutes.`,
      headerBadge: 'Security Alert',
      badgeColor: '#F59E0B',
      contentHtml,
    }),
  };
}

