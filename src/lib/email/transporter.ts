import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

export interface SmtpConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  fromEmail: string;
  fromName: string;
  isConfigured: boolean;
}

/**
 * Reads SMTP credentials dynamically from environment.
 * Any standard SMTP provider (Gmail, Amazon SES, Postmark, SendGrid, Brevo, Mailgun, cPanel, etc.)
 */
export function getSmtpConfig(): SmtpConfig {
  const host = process.env.SMTP_HOST?.trim() || '';
  const port = parseInt(process.env.SMTP_PORT?.trim() || '587', 10);
  const secure = process.env.SMTP_SECURE === 'true' || port === 465;
  const user = process.env.SMTP_USER?.trim() || '';
  const pass = process.env.SMTP_PASS?.trim() || '';
  const fromEmail = process.env.SMTP_FROM_EMAIL?.trim() || 'support@zuvapay.com';
  const fromName = process.env.SMTP_FROM_NAME?.trim() || 'ZuvaPay';

  const isConfigured = Boolean(host && user && pass);

  return {
    host,
    port,
    secure,
    user,
    pass,
    fromEmail,
    fromName,
    isConfigured,
  };
}

let cachedTransporter: Transporter | null = null;
let lastHostConfigKey = '';

/**
 * Returns a nodemailer transporter instance configured with current SMTP settings.
 */
export function getEmailTransporter(): {
  transporter: Transporter | null;
  config: SmtpConfig;
} {
  const config = getSmtpConfig();
  const currentKey = `${config.host}:${config.port}:${config.user}:${config.secure}`;

  if (!config.isConfigured) {
    return { transporter: null, config };
  }

  if (!cachedTransporter || lastHostConfigKey !== currentKey) {
    cachedTransporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: {
        user: config.user,
        pass: config.pass,
      },
      tls: {
        rejectUnauthorized: false, // Prevents certificate trust issues across diverse custom cPanel/postfix relays
      },
    });
    lastHostConfigKey = currentKey;
  }

  return { transporter: cachedTransporter, config };
}

/**
 * Tests the SMTP connection.
 */
export async function verifySmtpConnection(): Promise<{
  success: boolean;
  message: string;
  config: { host: string; port: number; secure: boolean; user: string; fromEmail: string };
}> {
  const { transporter, config } = getEmailTransporter();

  if (!config.isConfigured || !transporter) {
    return {
      success: false,
      message: 'SMTP credentials are not yet configured in .env.local (SMTP_HOST, SMTP_USER, SMTP_PASS).',
      config: {
        host: config.host || '(not set)',
        port: config.port,
        secure: config.secure,
        user: config.user ? `${config.user.slice(0, 3)}***` : '(not set)',
        fromEmail: config.fromEmail,
      },
    };
  }

  try {
    await transporter.verify();
    return {
      success: true,
      message: `Successfully connected to SMTP server at ${config.host}:${config.port}`,
      config: {
        host: config.host,
        port: config.port,
        secure: config.secure,
        user: config.user,
        fromEmail: config.fromEmail,
      },
    };
  } catch (err: any) {
    return {
      success: false,
      message: err.message || 'Failed to authenticate with SMTP server.',
      config: {
        host: config.host,
        port: config.port,
        secure: config.secure,
        user: config.user,
        fromEmail: config.fromEmail,
      },
    };
  }
}
