import { renderBaseEmailLayout } from './baseLayout';

export type EmailTemplateType =
  | 'welcome'
  | 'wallet_credit'
  | 'service_receipt'
  | 'refund_alert'
  | 'security_pin'
  | 'electricity_token'
  | 'admin_broadcast';

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
    <h1 style="margin: 0 0 12px 0; font-size: 24px; font-weight: 900; color: #0F172A; letter-spacing: -0.5px;">
      Welcome to the ZuvaPay family, ${name}! 👋
    </h1>
    <p style="margin: 0 0 20px 0; font-size: 14px; line-height: 22px; color: #475569;">
      Your account is fully activated. Say goodbye to hanging airtime, failed electricity tokens, and declining cards for foreign SMS codes.
    </p>

    <!-- Dedicated Account Box -->
    <div style="background-color: #FFFBEB; border: 1px solid #FDE68A; border-radius: 14px; padding: 20px; margin-bottom: 24px;">
      <div style="font-size: 11px; font-weight: 800; color: #B45309; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px;">
        💳 Your Dedicated Automated Funding Account
      </div>
      <div style="font-size: 18px; font-weight: 900; color: #0F172A; font-family: monospace; letter-spacing: 1px;">
        ${virtualAccount?.accountNumber || 'Assigned automatically on dashboard'}
      </div>
      <div style="font-size: 12px; color: #78350F; margin-top: 4px;">
        Bank: <strong>${virtualAccount?.bankName || 'Moniepoint / Wema Bank'}</strong> &bull; Name: <strong>${virtualAccount?.accountName || name}</strong>
      </div>
      <div style="font-size: 11px; color: #92400E; margin-top: 8px;">
        Any bank transfer sent to this account credits your wallet immediately — 24 hours a day.
      </div>
    </div>

    <!-- Quick Checklist -->
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 24px;">
      <tr>
        <td style="padding-bottom: 12px;">
          <strong style="font-size: 13px; color: #0F172A;">Three quick tips to get started:</strong>
        </td>
      </tr>
      <tr>
        <td style="font-size: 12px; color: #475569; line-height: 20px; padding-bottom: 8px;">
          🔒 <strong>Set a 4-Digit Security PIN:</strong> Protect all bill purchases and transfers from unauthorized access.
        </td>
      </tr>
      <tr>
        <td style="font-size: 12px; color: #475569; line-height: 20px; padding-bottom: 8px;">
          ⚡ <strong>Enjoy 100% Auto-Refunds:</strong> If a telecom gateway times out, your money returns instantly.
        </td>
      </tr>
      <tr>
        <td style="font-size: 12px; color: #475569; line-height: 20px;">
          🌐 <strong>Dual NGN & USD Wallets:</strong> Convert to Dollars anytime to pay for foreign SMS verification numbers.
        </td>
      </tr>
    </table>

    <!-- Action Button -->
    <div style="text-align: center; margin: 28px 0;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard" style="display: inline-block; padding: 14px 28px; background: linear-gradient(135deg, #FF6B00 0%, #EA580C 100%); color: #FFFFFF; font-size: 13px; font-weight: 800; text-decoration: none; border-radius: 12px; box-shadow: 0 4px 12px rgba(255, 107, 0, 0.3);">
        Go To Your Dashboard &rarr;
      </a>
    </div>
  `;

  return {
    subject: `Welcome to ZuvaPay, ${name}! Your Account is Ready 🚀`,
    html: renderBaseEmailLayout({
      previewText: `Welcome to ZuvaPay! Your account is active. Instant airtime, cheap SME data, and power tokens at wholesale rates.`,
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
