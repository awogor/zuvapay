import { renderBaseEmailLayout } from './baseLayout';
import { parseElectricityTokens } from '@/lib/electricity/tokenParser';

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
}: {
  name: string;
  email: string;
  virtualAccount?: any;
}): { subject: string; html: string } {
  const contentHtml = `
    <h1 style="margin: 0 0 8px 0; font-size: 20px; font-weight: 800; color: #0F172A; letter-spacing: -0.3px;">
      Welcome to ZuvaPay, ${name}! &#127881;
    </h1>
    <p style="margin: 0 0 12px 0; font-size: 14px; line-height: 22px; color: #475569;">
      Your ZuvaPay account has been successfully activated.
    </p>
    <p style="margin: 0 0 20px 0; font-size: 14px; line-height: 22px; color: #475569;">
      We're excited to have you on board. ZuvaPay gives you a faster, smarter way to handle everyday digital payments&mdash;from affordable data and airtime to electricity bills, cable TV renewals, and other essential utilities.
    </p>

    <div style="font-size: 14px; font-weight: 700; color: #0F172A; margin-bottom: 10px;">
      Here's what you can do
    </div>

    <!-- Services Overview with Colored Bullet Points -->
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 22px; font-size: 13px;">
      <tr>
        <td valign="top" style="padding: 8px 10px 8px 0; width: 14px; vertical-align: top; color: #FF6B00; font-size: 18px; line-height: 20px; font-weight: 900;">
          &bull;
        </td>
        <td style="padding: 8px 0; border-bottom: 1px solid #F1F5F9; color: #334155; line-height: 20px;">
          <strong style="color: #0F172A;">Data &amp; Airtime:</strong> Buy SME, VTU, corporate, and gifting bundles across MTN, Airtel, Glo, and 9mobile.
        </td>
      </tr>
      <tr>
        <td valign="top" style="padding: 8px 10px 8px 0; width: 14px; vertical-align: top; color: #FF6B00; font-size: 18px; line-height: 20px; font-weight: 900;">
          &bull;
        </td>
        <td style="padding: 8px 0; border-bottom: 1px solid #F1F5F9; color: #334155; line-height: 20px;">
          <strong style="color: #0F172A;">Electricity Bills:</strong> Generate instant prepaid meter tokens and pay postpaid bills for all Nigerian DisCos.
        </td>
      </tr>
      <tr>
        <td valign="top" style="padding: 8px 10px 8px 0; width: 14px; vertical-align: top; color: #FF6B00; font-size: 18px; line-height: 20px; font-weight: 900;">
          &bull;
        </td>
        <td style="padding: 8px 0; border-bottom: 1px solid #F1F5F9; color: #334155; line-height: 20px;">
          <strong style="color: #0F172A;">Cable TV &amp; Subscriptions:</strong> Renew DStv, GOtv, StarTimes, and other supported digital services in seconds.
        </td>
      </tr>
      <tr>
        <td valign="top" style="padding: 8px 10px 8px 0; width: 14px; vertical-align: top; color: #FF6B00; font-size: 18px; line-height: 20px; font-weight: 900;">
          &bull;
        </td>
        <td style="padding: 8px 0; border-bottom: 1px solid #F1F5F9; color: #334155; line-height: 20px;">
          <strong style="color: #0F172A;">Secure Wallet:</strong> Fund your ZuvaPay wallet and enjoy fast, reliable transactions anytime.
        </td>
      </tr>
    </table>

    <p style="margin: 0 0 22px 0; font-size: 14px; line-height: 22px; color: #475569;">
      Ready to begin? Log in to your dashboard and experience seamless digital payments with ZuvaPay.
    </p>

    <!-- Action Button -->
    <div style="margin: 0 0 10px 0;">
      <a href="${getEmailAppUrl()}/dashboard" style="display: inline-block; padding: 12px 26px; background-color: #FF6B00; color: #FFFFFF; font-size: 13px; font-weight: 700; text-decoration: none; border-radius: 8px;">
        Go to Dashboard &rarr;
      </a>
    </div>
  `;

  return {
    subject: `Welcome to ZuvaPay, ${name} - Your account is active`,
    html: renderBaseEmailLayout({
      previewText: `Welcome to ZuvaPay! Your account has been successfully activated.`,
      headerBadge: '✔ ACCOUNT ACTIVE',
      badgeType: 'success',
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
      headerBadge: '✔ WALLET CREDITED',
      badgeType: 'success',
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
      headerBadge: '✔ ORDER COMPLETED',
      badgeType: 'success',
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
      headerBadge: 'REFUND PROCESSED',
      badgeType: 'info',
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
      headerBadge: '⚠️ SECURITY ALERT',
      badgeType: 'warning',
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
  bonusToken,
  bonusUnits,
  tokens,
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
  bonusToken?: string;
  bonusUnits?: string;
  tokens?: any[];
  amount: number;
  reference: string;
  operatorReference?: string;
  date?: string;
}): { subject: string; html: string } {
  const parsed = parseElectricityTokens({
    token,
    units,
    bonus_token: bonusToken,
    bonus_units: bonusUnits,
    tokens,
  });

  let tokensBoxesHtml = '';

  if (parsed.isMultiToken) {
    tokensBoxesHtml = parsed.tokens
      .map((tok, idx) => {
        const isBonus = tok.type === 'bonus';
        const isKct = tok.type === 'kct1' || tok.type === 'kct2';

        const bg = isBonus ? '#FEFCE8' : (isKct ? '#F8FAFC' : '#FFF7ED');
        const border = isBonus ? '#FEF08A' : (isKct ? '#CBD5E1' : '#FED7AA');
        const headerColor = isBonus ? '#854D0E' : (isKct ? '#475569' : '#C2410C');
        const icon = isBonus ? '🎁' : (isKct ? '🔑' : '⚡');
        const numPrefix = `${idx + 1}. `;

        let title = tok.label;
        if (tok.type === 'main') title = `${numPrefix}Main Purchased Token`;
        else if (tok.type === 'bonus') title = `${numPrefix}BSST Bonus Token${tok.units ? ` (${tok.units})` : ' (Free Gift Units)'}`;
        else if (tok.type === 'kct1') title = `${numPrefix}Key Change Token 1 (KCT1)`;
        else if (tok.type === 'kct2') title = `${numPrefix}Key Change Token 2 (KCT2)`;

        const helper = isBonus
          ? 'Free electricity bonus units credited by DisCo. Enter into meter after main token.'
          : isKct
          ? (tok.subtitle || 'Key into meter keypad to reconfigure meter.')
          : 'Key these 20 digits into your meter CIU keypad, then press the <strong>Enter</strong> key.';

        return `
    <div class="token-box" style="background-color: ${bg}; border: 1px solid ${border}; border-radius: 10px; padding: 16px 14px; text-align: center; margin-bottom: 14px;">
      <div style="font-size: 11px; font-weight: 700; color: ${headerColor}; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 6px;">
        ${icon} ${title}
      </div>
      <div class="token-digits" style="font-size: 15px; font-weight: 800; font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace; color: #0F172A; letter-spacing: 1.2px; padding: 4px 0; white-space: nowrap;">
        ${tok.token}
      </div>
      <div style="font-size: 11.5px; color: ${isBonus ? '#713F12' : '#64748B'}; margin-top: 6px; line-height: 16px;">
        ${helper}
      </div>
      ${
        tok.units
          ? `
      <div style="margin-top: 8px; font-size: 12px; font-weight: 700; color: ${isBonus ? '#15803D' : '#059669'};">
        ${isBonus ? 'Bonus Subsidy' : 'Units Credited'}: ${tok.units}
      </div>`
          : ''
      }
    </div>`;
      })
      .join('');
  } else {
    // Single token fallback
    const singleToken = parsed.tokens[0]?.token || token;
    const cleanDigits = (singleToken || '').replace(/\D/g, '');
    const formattedToken =
      cleanDigits.length === 20
        ? cleanDigits.match(/.{1,4}/g)?.join(' - ') || singleToken
        : singleToken;

    tokensBoxesHtml = `
    <div class="token-box" style="background-color: #FFF7ED; border: 1px solid #FED7AA; border-radius: 10px; padding: 16px 14px; text-align: center; margin-bottom: 22px;">
      <div style="font-size: 11px; font-weight: 700; color: #C2410C; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 6px;">
        ⚡ 20-Digit Meter Token
      </div>
      <div class="token-digits" style="font-size: 15px; font-weight: 800; font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace; color: #0F172A; letter-spacing: 1.2px; padding: 4px 0; white-space: nowrap;">
        ${formattedToken}
      </div>
      <div style="font-size: 11.5px; color: #64748B; margin-top: 6px; line-height: 16px;">
        Key these 20 digits into your meter CIU keypad, then press the <strong>Enter</strong> key.
      </div>
      ${
        units
          ? `
      <div style="margin-top: 8px; font-size: 12px; font-weight: 700; color: #059669;">
        Units Credited: ${units}
      </div>`
          : ''
      }
    </div>`;
  }

  const contentHtml = `
    <!-- Header -->
    <div style="margin-bottom: 20px;">
      <h1 style="margin: 0 0 6px 0; font-size: 20px; font-weight: 800; color: #0F172A; letter-spacing: -0.3px;">
        ${parsed.isMultiToken ? `Your ${disco} Electricity Tokens` : `Your ${disco} Electricity Token`}
      </h1>
      <p style="margin: 0; font-size: 13px; color: #64748B;">
        Prepaid meter recharge for <strong>${meterNumber}</strong> (${disco})
      </p>
    </div>

    <!-- Token Box(es) -->
    ${tokensBoxesHtml}

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
      ${
        parsed.bonusToken
          ? `
      <tr>
        <td style="padding: 9px 0; border-bottom: 1px solid #F1F5F9; color: #64748B;">Bonus Token</td>
        <td align="right" style="padding: 9px 0; border-bottom: 1px solid #F1F5F9; font-family: monospace; font-size: 12px; font-weight: 700; color: #15803D;">${parsed.bonusToken}${parsed.bonusUnits ? ` (${parsed.bonusUnits})` : ''}</td>
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
    subject: parsed.isMultiToken
      ? `Your ${disco} Electricity Tokens (Includes Bonus Units) - ZuvaPay`
      : `Your ${disco} Electricity Token - ZuvaPay`,
    html: renderBaseEmailLayout({
      previewText: parsed.isMultiToken
        ? `Your ${disco} prepaid recharge tokens (including bonus units) are ready for meter ${meterNumber}. Amount: ₦${amount.toLocaleString('en-NG')}.`
        : `Your ${disco} meter recharge token is ready for meter ${meterNumber}. Amount: ₦${amount.toLocaleString('en-NG')}.`,
      headerBadge: parsed.isMultiToken ? '⚡ TOKENS GENERATED' : '⚡ TOKEN GENERATED',
      badgeType: 'success',
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
      headerBadge: 'ANNOUNCEMENT',
      badgeType: 'default',
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
      headerBadge: 'ACTION REQUIRED',
      badgeType: 'warning',
      contentHtml,
    }),
  };
}

/**
 * 8. Sanitize Zuva Auth URL
 */
export function sanitizeZuvaAuthUrl(url: string, defaultType: 'recovery' | 'signup', defaultNext: string): string {
  if (!url) {
    return `https://zuvapay.com/auth/callback?type=${defaultType}&next=${encodeURIComponent(defaultNext)}`;
  }

  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes('supabase.co')) {
      const token = parsed.searchParams.get('token') || parsed.searchParams.get('token_hash');
      const type = parsed.searchParams.get('type') || defaultType;
      let next = defaultNext;
      const redirectTo = parsed.searchParams.get('redirect_to');
      if (redirectTo) {
        try {
          const redirectParsed = new URL(redirectTo);
          const nextParam = redirectParsed.searchParams.get('next');
          if (nextParam) next = nextParam;
        } catch {}
      }
      if (token) {
        return `https://zuvapay.com/auth/callback?token_hash=${encodeURIComponent(token)}&type=${encodeURIComponent(type)}&next=${encodeURIComponent(next)}`;
      }
    }
  } catch {}

  return url
    .replace(/https?:\/\/localhost(:\d+)?/gi, 'https://zuvapay.com')
    .replace(/https?:\/\/127\.0\.0\.1(:\d+)?/gi, 'https://zuvapay.com');
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
  const safeVerifyUrl = sanitizeZuvaAuthUrl(verifyUrl, 'signup', '/dashboard');

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
    <div class="token-box" style="background-color: #FFF7ED; border: 1px solid #FED7AA; border-radius: 8px; padding: 14px 16px; text-align: center; margin: 18px 0;">
      <div style="font-size: 11px; font-weight: 700; color: #C2410C; text-transform: uppercase; letter-spacing: 0.6px; margin-bottom: 4px;">
        Verification Code
      </div>
      <div class="token-digits" style="font-size: 16px; font-weight: 800; font-family: 'SFMono-Regular', Consolas, monospace; letter-spacing: 3px; color: #0F172A;">
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
      headerBadge: 'VERIFY EMAIL',
      badgeType: 'default',
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
  const safeResetUrl = sanitizeZuvaAuthUrl(resetUrl, 'recovery', '/reset-password');

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
      headerBadge: 'PASSWORD RESET',
      badgeType: 'warning',
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
    <div class="token-box" style="background-color: #F0FDF4; border: 1px solid #BBF7D0; border-radius: 8px; padding: 16px; margin-bottom: 22px;">
      <div style="font-size: 11px; font-weight: 700; color: #15803D; text-transform: uppercase; letter-spacing: 0.6px; margin-bottom: 6px;">
        ${activationLink ? 'Access / License' : 'Access Code'}
      </div>
      <div style="font-size: 14px; font-weight: 700; font-family: 'SFMono-Regular', Consolas, monospace; color: #0F172A; word-break: break-all; margin-bottom: 8px;">
        ${code || activationLink || 'See instructions below'}
      </div>
      ${
        credentials && credentials !== code && credentials !== activationLink
          ? `
      <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid #BBF7D0; font-size: 12px; font-family: monospace; color: #166534; white-space: pre-wrap; word-break: break-all;">
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
      headerBadge: '✔ ORDER READY',
      badgeType: 'success',
      contentHtml,
    }),
  };
}

