'use client';

import React, { useState, useEffect } from 'react';
import { useToast } from '@/components/common/Toast';
import {
  Mail,
  Send,
  Eye,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Server,
  Sparkles,
  ShieldCheck,
  Zap,
  Globe,
  Lock,
} from 'lucide-react';

export function AdminEmailTab() {
  const { success, error, info } = useToast();

  const [smtpStatus, setSmtpStatus] = useState<any>(null);
  const [checkingSmtp, setCheckingSmtp] = useState(false);

  // Email form state
  const [targetEmail, setTargetEmail] = useState('');
  const [templateType, setTemplateType] = useState<
    | 'welcome'
    | 'email_verification'
    | 'password_reset'
    | 'wallet_credit'
    | 'service_receipt'
    | 'refund_alert'
    | 'security_pin'
    | 'electricity_token'
    | 'admin_broadcast'
  >('welcome');
  const [customSubject, setCustomSubject] = useState('');
  const [recipientName, setRecipientName] = useState('David Adeleke');

  // Preview state
  const [previewData, setPreviewData] = useState<{ subject: string; html: string } | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [sending, setSending] = useState(false);

  // Load SMTP connection status
  const checkSmtpConnection = async () => {
    setCheckingSmtp(true);
    try {
      const res = await fetch('/api/admin/email/test');
      const data = await res.json();
      setSmtpStatus(data);
      if (data.success) {
        success('SMTP Active', data.message);
      } else {
        info('SMTP Notice', data.message);
      }
    } catch (err: any) {
      error('Connection Error', err.message || 'Failed to verify SMTP server');
    } finally {
      setCheckingSmtp(false);
    }
  };

  useEffect(() => {
    checkSmtpConnection();
  }, []);

  // Fetch HTML preview whenever templateType or recipientName changes
  const fetchPreview = async (type = templateType, name = recipientName) => {
    setLoadingPreview(true);
    try {
      const res = await fetch('/api/admin/email/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'preview',
          templateType: type,
          targetEmail: targetEmail || 'customer@zuvapay.com',
          sampleData: {
            name,
            amount: 5000,
            newBalance: 18500,
            reference: 'KP-TX-99021',
            serviceName: 'MTN SME Data 2.5GB (30 Days)',
            category: 'DATA BUNDLE',
            payerName: 'Musa Ibrahim',
          },
        }),
      });

      const data = await res.json();
      if (data.success) {
        setPreviewData({
          subject: data.subject,
          html: data.html,
        });
      }
    } catch (err) {
      console.error('Failed to load email preview', err);
    } finally {
      setLoadingPreview(false);
    }
  };

  useEffect(() => {
    fetchPreview(templateType, recipientName);
  }, [templateType, recipientName]);

  const handleSendTestEmail = async () => {
    if (!targetEmail || !targetEmail.includes('@')) {
      error('Invalid Email', 'Please provide a valid recipient email address');
      return;
    }

    setSending(true);
    try {
      info('Dispatching Email', `Sending ${templateType} email to ${targetEmail}...`);

      const res = await fetch('/api/admin/email/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send_test',
          targetEmail,
          templateType,
          customSubject: customSubject.trim() || undefined,
          sampleData: {
            name: recipientName,
            amount: 5000,
            newBalance: 18500,
            serviceName: 'MTN 2.5GB SME Data',
            category: 'DATA',
            payerName: 'Admin Simulator',
          },
        }),
      });

      const data = await res.json();
      if (data.success) {
        if (data.simulated) {
          success(
            'Simulated Delivery',
            `Email logged in simulation mode (SMTP not yet configured in .env.local). Message ID: ${data.messageId}`
          );
        } else {
          success(
            'Email Delivered!',
            `Successfully dispatched via live SMTP to ${targetEmail} (MessageId: ${data.messageId})`
          );
        }
      } else {
        error('Delivery Failed', data.error || 'SMTP server rejected the message.');
      }
    } catch (err: any) {
      error('Transmission Error', err.message || 'An error occurred while sending');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* SMTP Connection Card */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-white/5 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-brand-orange/10 text-brand-orange">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                SMTP Server Gateway
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    smtpStatus?.success
                      ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                      : 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                  }`}
                >
                  {smtpStatus?.success ? '● Active Live' : '● Simulation / Unset'}
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Any standard SMTP host (Gmail, Amazon SES, Postmark, SendGrid, Brevo, cPanel) configured in{' '}
                <code className="px-1 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[11px] font-mono">
                  .env.local
                </code>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={checkSmtpConnection}
            disabled={checkingSmtp}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold text-slate-800 dark:text-white transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${checkingSmtp ? 'animate-spin' : ''}`} />
            Check Connection
          </button>
        </div>

        {/* Server Config Telemetry Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-white/5">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Host</span>
            <span className="font-mono font-bold text-slate-800 dark:text-slate-200 truncate block">
              {smtpStatus?.config?.host || '(not set)'}
            </span>
          </div>
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-white/5">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Port & SSL</span>
            <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
              {smtpStatus?.config?.port || 587} {smtpStatus?.config?.secure ? '(SSL 465)' : '(STARTTLS)'}
            </span>
          </div>
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-white/5">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">From Address</span>
            <span className="font-mono font-bold text-slate-800 dark:text-slate-200 truncate block">
              {smtpStatus?.config?.fromEmail || 'support@zuvapay.com'}
            </span>
          </div>
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-white/5">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Auth User</span>
            <span className="font-mono font-bold text-slate-800 dark:text-slate-200 truncate block">
              {smtpStatus?.config?.user || '(not set)'}
            </span>
          </div>
        </div>
      </div>

      {/* Campaign Sender & Live Visual Preview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Dispatch Console */}
        <div className="lg:col-span-5 p-6 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 shadow-sm space-y-5">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-brand-orange" />
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
              Transactional Dispatch Console
            </h3>
          </div>

          <div className="space-y-4 text-xs">
            {/* Template Selector */}
            <div>
              <label className="block text-slate-600 dark:text-slate-400 font-bold mb-1.5">
                Select Transactional Template Flow
              </label>
              <select
                value={templateType}
                onChange={(e) => setTemplateType(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-medium focus:outline-none focus:border-brand-orange"
              >
                <option value="welcome">👋 1. Welcome to ZuvaPay (Account Ready)</option>
                <option value="email_verification">✉️ 2. Verify Your Email Address (ZuvaPay Branded)</option>
                <option value="password_reset">🔐 3. Password Reset Security Recovery (ZuvaPay Branded)</option>
                <option value="wallet_credit">💰 4. Wallet Funded (Credit Receipt)</option>
                <option value="service_receipt">⚡ 5. Service Purchase Receipt (Airtime/Data/Power)</option>
                <option value="electricity_token">⚡ 6. NEPA Electricity Token Delivery (20-Digit Code)</option>
                <option value="refund_alert">↩️ 7. Instant Auto-Refund Notification</option>
                <option value="security_pin">🛡️ 8. Security & Transaction PIN Alert</option>
                <option value="admin_broadcast">📢 9. Custom Platform Broadcast</option>
              </select>
            </div>

            {/* Recipient Email */}
            <div>
              <label className="block text-slate-600 dark:text-slate-400 font-bold mb-1.5">
                Target Recipient Email
              </label>
              <input
                type="email"
                placeholder="customer@example.com"
                value={targetEmail}
                onChange={(e) => setTargetEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-mono placeholder-slate-400 focus:outline-none focus:border-brand-orange"
              />
            </div>

            {/* Customer Name */}
            <div>
              <label className="block text-slate-600 dark:text-slate-400 font-bold mb-1.5">
                Recipient Customer Name
              </label>
              <input
                type="text"
                placeholder="e.g. David Adeleke"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-medium focus:outline-none focus:border-brand-orange"
              />
            </div>

            {/* Optional Custom Subject */}
            <div>
              <label className="block text-slate-600 dark:text-slate-400 font-bold mb-1.5">
                Custom Subject Line (Optional override)
              </label>
              <input
                type="text"
                placeholder={previewData?.subject || 'Leave blank to use template default'}
                value={customSubject}
                onChange={(e) => setCustomSubject(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-medium placeholder-slate-400 focus:outline-none focus:border-brand-orange"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={handleSendTestEmail}
              disabled={sending || !targetEmail}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-gradient-to-r from-brand-orange to-amber-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black text-xs transition-all shadow-lg shadow-orange-500/20 disabled:opacity-50"
            >
              {sending ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Transmitting Email via SMTP...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Send Test Email Now
                </>
              )}
            </button>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-white/5 space-y-1.5 text-[11px] text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              Automated Event Triggers Active
            </div>
            <p>
              • <strong>Signups:</strong> triggers the Welcome Email automatically.<br />
              • <strong>Korapay Virtual Account Funding:</strong> triggers Wallet Credit Receipts.<br />
              • <strong>Telecom Switch Failures:</strong> triggers Instant Refund Notices.
            </p>
          </div>
        </div>

        {/* Right: Live Responsive HTML Preview */}
        <div className="lg:col-span-7 p-6 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-3">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-emerald-500" />
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                Live Responsive Template Preview
              </h3>
            </div>
            {loadingPreview && (
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <RefreshCw className="w-3 h-3 animate-spin" /> Rendering...
              </span>
            )}
          </div>

          {previewData && (
            <div className="space-y-2">
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-white/5 text-xs">
                <span className="text-slate-400 font-bold mr-2">Subject:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {customSubject || previewData.subject}
                </span>
              </div>

              {/* Rendered HTML Container */}
              <div className="rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden shadow-inner bg-slate-100 p-2 sm:p-4">
                <iframe
                  title="Email HTML Preview"
                  srcDoc={previewData.html}
                  className="w-full h-[580px] rounded-xl border border-slate-300 dark:border-white/10 bg-white"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
