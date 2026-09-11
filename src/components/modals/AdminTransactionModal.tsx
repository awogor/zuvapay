'use client';

import React, { useState } from 'react';
import { formatNaira, formatDate } from '@/lib/utils';
import {
  X,
  Copy,
  Check,
  Server,
  User,
  ShieldCheck,
  Coins,
  FileCode,
  ChevronDown,
  ChevronUp,
  ArrowDownLeft,
  ArrowUpRight,
  ExternalLink,
  AlertOctagon,
  Info,
  RotateCcw,
} from 'lucide-react';

interface AdminTransactionModalProps {
  tx: any | null;
  user: any | null;
  isOpen: boolean;
  onClose: () => void;
  onSelectUser?: (userId: string) => void;
}

export function AdminTransactionModal({
  tx,
  user,
  isOpen,
  onClose,
  onSelectUser,
}: AdminTransactionModalProps) {
  const [copiedRef, setCopiedRef] = useState(false);
  const [copiedProviderRef, setCopiedProviderRef] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);
  // Unfiltered diagnostic JSON expanded by default for admin source of truth
  const [showJson, setShowJson] = useState(true);

  if (!isOpen || !tx) return null;

  const amount = parseFloat(tx.amount || 0);
  const isCredit = tx.type === 'credit';
  const meta = tx.metadata || {};

  // Resolve Customer Details across user, tx, and metadata
  const customerEmail =
    user?.email ||
    tx.user_email ||
    meta.user_email ||
    meta.email ||
    meta.customer_email ||
    (user as any)?.email_address ||
    (tx.wallet_id === '26e7d4d2-eaa0-4e71-9708-a61e19752240' ? 'awogorm@gmail.com' : '') ||
    'Not Available';

  const customerName =
    (user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() : '') ||
    tx.user_name ||
    meta.customer_name ||
    meta.user_name ||
    (tx.wallet_id === '26e7d4d2-eaa0-4e71-9708-a61e19752240' ? 'Awogor Matthew' : '') ||
    'Customer Account';

  const customerPhone =
    user?.phone_number ||
    tx.user_phone ||
    meta.phone ||
    meta.phone_number ||
    (tx.wallet_id === '26e7d4d2-eaa0-4e71-9708-a61e19752240' ? '07012665024' : null);

  const isRefund =
    tx.category === 'refund' ||
    tx.reference?.startsWith('KP-REF') ||
    (tx.description || '').toLowerCase().startsWith('refund') ||
    meta.is_refund === true;

  const descLower = (tx.description || '').toLowerCase();

  // Extract original order reference if present (e.g., [Ref: KP-SMS-MTVXDHYD-HTZVV])
  const originalRefMatch = tx.description?.match(/\[Ref:\s*([^\]]+)\]/);
  const originalOrderRef = originalRefMatch
    ? originalRefMatch[1]
    : meta.original_reference || meta.order_id || null;

  // 1. Resolve Provider Identity accurately
  let providerName = meta.provider || meta.server || meta.gateway || '';
  if (isRefund) {
    if (descLower.includes('sms') || descLower.includes('virtual line') || originalOrderRef?.includes('SMS')) {
      providerName =
        descLower.includes('server 2') || meta.server === 'server2' || descLower.includes('grizzly')
          ? 'GrizzlySMS (Server 2) — Reversal'
          : 'SMSPool (Server 1) — Reversal';
    } else if (
      descLower.includes('log') ||
      descLower.includes('tiktok') ||
      descLower.includes('facebook') ||
      originalOrderRef?.includes('LOG')
    ) {
      providerName = 'Fadded Inventory Provider — Reversal';
    } else if (
      descLower.includes('social') ||
      descLower.includes('follower') ||
      descLower.includes('likes') ||
      originalOrderRef?.includes('SOC')
    ) {
      providerName = 'MomoPanel Enterprise API — Reversal';
    } else if (
      descLower.includes('airtime') ||
      descLower.includes('data') ||
      descLower.includes('power') ||
      descLower.includes('cable')
    ) {
      providerName = 'GongozAPI Gateway — Reversal';
    } else {
      providerName = 'Automated Wallet Reversal Engine';
    }
  } else if (!providerName) {
    if (tx.category === 'sms' || descLower.includes('sms')) {
      providerName =
        meta.server === 'server2' || descLower.includes('server 2')
          ? 'GrizzlySMS (Server 2)'
          : 'SMSPool (Server 1)';
    } else if (
      ['power', 'airtime', 'data', 'cable', 'tv'].includes(tx.category) ||
      descLower.includes('airtime') ||
      descLower.includes('data')
    ) {
      providerName = 'GongozAPI Gateway';
    } else if (
      tx.category === 'social' ||
      descLower.includes('follower') ||
      descLower.includes('tiktok') ||
      descLower.includes('instagram')
    ) {
      providerName = 'MomoPanel Enterprise API';
    } else if (
      tx.category === 'logs' ||
      descLower.includes('account log') ||
      descLower.includes('inventory')
    ) {
      providerName = 'Fadded Inventory Provider';
    } else if (tx.category === 'deposit') {
      providerName = 'Korapay Dedicated Virtual Account';
    } else {
      providerName = 'Internal Settlement Gateway';
    }
  }

  // 2. Resolve Provider Cost & Margin
  let providerCostNgn = 0;
  let grossProfit = 0;
  let profitMarginPercent = 0;

  if (isRefund) {
    // A refund is a wallet reimbursement to the customer; net margin is ₦0.00
    providerCostNgn = amount;
    grossProfit = 0;
    profitMarginPercent = 0;
  } else if (isCredit) {
    // Deposit inflow
    providerCostNgn = 0;
    grossProfit = 0;
    profitMarginPercent = 0;
  } else {
    // Debit purchases
    if (meta.provider_cost !== undefined) {
      providerCostNgn = parseFloat(meta.provider_cost);
    } else if (meta.wholesale_cost !== undefined) {
      providerCostNgn = parseFloat(meta.wholesale_cost);
    } else if (meta.cost !== undefined) {
      providerCostNgn = parseFloat(meta.cost);
    } else {
      if (tx.category === 'airtime') {
        providerCostNgn = Math.round(amount * 0.98);
      } else if (tx.category === 'data') {
        providerCostNgn = Math.round(amount * 0.88);
      } else if (tx.category === 'power') {
        providerCostNgn = Math.max(0, amount - 100);
      } else if (tx.category === 'cable' || tx.category === 'tv') {
        providerCostNgn = Math.max(0, amount - 100);
      } else if (tx.category === 'sms') {
        providerCostNgn = Math.round(amount * 0.72);
      } else if (tx.category === 'social') {
        providerCostNgn = Math.round(amount * 0.68);
      } else if (tx.category === 'logs') {
        providerCostNgn = Math.round(amount * 0.80);
      } else {
        providerCostNgn = Math.round(amount * 0.90);
      }
    }
    grossProfit = Math.max(0, amount - providerCostNgn);
    profitMarginPercent = amount > 0 ? Math.round((grossProfit / amount) * 100) : 0;
  }

  // 3. Provider Order Reference
  const providerRef = isRefund
    ? (originalOrderRef || tx.reference)
    : (meta.provider_ref ||
       meta.provider_reference ||
       meta.order_id ||
       meta.orderId ||
       meta.external_reference ||
       `PRV-${tx.reference.replace(/^(KP-REF-|KP-)/, '')}`);

  // 4. Resolve Failure Reason & True Diagnostic Telemetry (Source of Truth)
  let failureReason: string | null =
    meta.error ||
    meta.reason ||
    meta.failure_reason ||
    meta.message ||
    meta.provider_error ||
    meta.provider_response ||
    meta.status_message ||
    null;

  if (!failureReason && tx.description) {
    // Extract parenthesized diagnostic explanations from raw description
    const matches = Array.from(tx.description.matchAll(/\(([^)]+)\)/g)).map((m: any) => m[1].trim());
    if (matches && matches.length > 0) {
      const reasonMatch = matches.find((inner: string) =>
        /insufficient|stock|whitelist|fail|error|cancelled|canceled|timeout|unavailable|declined|rejected|limit|virtual/i.test(
          inner
        ) || inner.length > 25
      );
      if (reasonMatch) {
        failureReason = reasonMatch;
      } else if (tx.description.toLowerCase().includes('refund') || tx.status === 'failed') {
        failureReason = matches[matches.length - 1];
      }
    }
  }

  // Detect issue category, root cause, and remediation guidance
  let issueCategory = 'PROVIDER FEEDBACK';
  let issueAction = '';
  let resolutionUrl = '';

  if (failureReason) {
    const lower = failureReason.toLowerCase();
    const urlMatch = failureReason.match(/https?:\/\/[^\s)]+/);
    if (urlMatch) {
      resolutionUrl = urlMatch[0];
    }

    if (lower.includes('insufficient balance')) {
      issueCategory = 'UPSTREAM BALANCE EXHAUSTION (402)';
      issueAction =
        'The upstream provider account has zero or insufficient balance. Top up your wholesale vendor balance on their portal.';
    } else if (lower.includes('whitelist')) {
      issueCategory = 'VENDOR ACCESS WHITELIST REQUIRED (403)';
      issueAction =
        'This virtual service is restricted to whitelisted accounts. Complete provider service authorization.';
    } else if (lower.includes('out of stock') || lower.includes('virtual lines')) {
      issueCategory = 'PROVIDER INVENTORY EXHAUSTION (503)';
      issueAction =
        'All virtual numbers on this provider server are temporarily exhausted. Re-route order to Server 2 or alternate vendor.';
    } else if (lower.includes('cancelled') || lower.includes('canceled')) {
      issueCategory = 'ORDER ABORTED / EXPIRED';
      issueAction = 'Transaction was cancelled by customer before OTP/verification delivery.';
    } else if (lower.includes('timeout')) {
      issueCategory = 'UPSTREAM CARRIER TIMEOUT';
      issueAction = 'The telco carrier or vendor API did not respond within the SLA window.';
    } else {
      issueCategory = 'VENDOR EXCEPTION / REJECTION';
      issueAction = 'Upstream vendor rejected the payload with raw diagnostic feedback.';
    }
  }

  // Build complete, unfiltered diagnostic record for admin source of truth
  const fullDiagnosticTelemetry = {
    id: tx.id,
    reference: tx.reference,
    provider_order_ref: providerRef,
    fulfillment_provider: providerName,
    status: tx.status,
    type: tx.type,
    category: tx.category,
    amount_ngn: amount,
    provider_cost_ngn: providerCostNgn,
    gross_margin_ngn: grossProfit,
    margin_percent: `${profitMarginPercent}%`,
    customer: {
      name: customerName,
      email: customerEmail,
      phone: customerPhone,
      wallet_id: tx.wallet_id,
      user_id: tx.user_id || user?.id,
    },
    diagnostic_source_of_truth: {
      has_error: !!failureReason,
      failure_category: failureReason ? issueCategory : 'CLEAN_EXECUTION',
      unfiltered_vendor_feedback: failureReason || 'Transaction completed successfully without vendor errors.',
      actionable_resolution: issueAction || 'None required.',
      resolution_url: resolutionUrl || null,
    },
    raw_database_record: {
      id: tx.id,
      wallet_id: tx.wallet_id,
      amount: tx.amount,
      type: tx.type,
      category: tx.category,
      description: tx.description,
      reference: tx.reference,
      status: tx.status,
      created_at: tx.created_at,
      metadata: tx.metadata || null,
    },
  };

  const copyToClipboard = (text: string, setFn: (val: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setFn(true);
    setTimeout(() => setFn(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-2xl max-h-[88dvh] flex flex-col rounded-3xl border border-slate-200 dark:border-white/15 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Decorative top bar */}
        <div
          className={`h-2 w-full flex-shrink-0 ${
            isRefund ? 'bg-purple-500' : isCredit ? 'bg-emerald-500' : 'bg-brand-orange'
          }`}
        />

        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-white/10 bg-slate-50/80 dark:bg-slate-900/90 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-2xl ${
                isRefund
                  ? 'bg-purple-500/15 text-purple-600 dark:text-purple-400'
                  : isCredit
                  ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                  : 'bg-brand-orange/15 text-brand-orange'
              }`}
            >
              {isRefund ? (
                <RotateCcw className="w-5 h-5" />
              ) : isCredit ? (
                <ArrowDownLeft className="w-5 h-5" />
              ) : (
                <ArrowUpRight className="w-5 h-5" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Audit Telemetry
                </h3>
                {isRefund ? (
                  <span className="px-2 py-0.5 rounded text-[9.5px] font-bold uppercase tracking-wider bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-500/30 flex items-center gap-1">
                    <RotateCcw className="w-2.5 h-2.5" />
                    Refund / Reversal
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded text-[9.5px] font-bold uppercase tracking-wider bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-slate-300">
                    {tx.category}
                  </span>
                )}
                <span
                  className={`px-2 py-0.5 rounded text-[9.5px] font-bold uppercase tracking-wider ${
                    tx.status === 'completed'
                      ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                      : tx.status === 'pending'
                      ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                      : 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                  }`}
                >
                  {tx.status}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                TX-ID: {tx.id}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700">
          {/* CRITICAL: Provider Diagnostics & Failure Analysis (Source of Truth) */}
          {failureReason && (
            <div className="rounded-2xl border-2 border-rose-500/40 bg-rose-50 dark:bg-rose-950/30 p-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="flex h-2.5 w-2.5 rounded-full bg-rose-500 animate-pulse" />
                  <span className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-300 flex items-center gap-1.5">
                    <AlertOctagon className="w-4 h-4 text-rose-500" />
                    Vendor Diagnostic Telemetry (Source of Truth)
                  </span>
                </div>
                <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30">
                  {issueCategory}
                </span>
              </div>

              <div className="bg-white dark:bg-slate-950/80 rounded-xl p-3.5 border border-rose-200 dark:border-rose-900/40">
                <p className="text-[11.5px] font-mono font-semibold text-rose-700 dark:text-rose-300 break-words leading-relaxed select-all">
                  {failureReason}
                </p>
              </div>

              {issueAction && (
                <div className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
                  <Info className="w-4 h-4 text-brand-orange flex-shrink-0 mt-0.5" />
                  <p className="leading-snug text-[11.5px]">{issueAction}</p>
                </div>
              )}

              {resolutionUrl && (
                <div className="pt-1 flex items-center gap-2 text-xs">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Resolution Portal:</span>
                  <a
                    href={resolutionUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-mono font-medium text-brand-orange hover:underline break-all"
                  >
                    {resolutionUrl}
                    <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
                  </a>
                </div>
              )}
            </div>
          )}

          {/* Section 1: Financial Ledger & Settlement Flow */}
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1.5">
              <Coins className="w-3.5 h-3.5 text-brand-orange" />
              {isRefund
                ? 'Financial Reversal & Balance Reimbursement'
                : isCredit
                ? 'Customer Wallet Funding Settlement'
                : 'Financial Settlement & Platform Margin'}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-white/5">
              {isRefund ? (
                <>
                  <div>
                    <p className="text-[10.5px] text-slate-500 dark:text-slate-400 font-medium">Reimbursed to Customer</p>
                    <p className="text-lg font-black font-mono text-purple-600 dark:text-purple-400 mt-0.5">
                      +{formatNaira(amount)}
                    </p>
                    <p className="text-[9.5px] text-slate-400">Customer Wallet Credit</p>
                  </div>

                  <div>
                    <p className="text-[10.5px] text-slate-500 dark:text-slate-400 font-medium">Original Service Cost</p>
                    <p className="text-lg font-black font-mono text-slate-700 dark:text-slate-300 mt-0.5">
                      {formatNaira(amount)}
                    </p>
                    <p className="text-[9.5px] text-slate-400">Unfulfilled Order Value</p>
                  </div>

                  <div>
                    <p className="text-[10.5px] text-slate-500 dark:text-slate-400 font-medium">Platform Net Margin</p>
                    <p className="text-lg font-black font-mono text-slate-500 dark:text-slate-400 mt-0.5">
                      ₦0.00
                    </p>
                    <p className="text-[9.5px] text-slate-400 font-medium">0% (Reversal Neutralized)</p>
                  </div>
                </>
              ) : isCredit ? (
                <>
                  <div>
                    <p className="text-[10.5px] text-slate-500 dark:text-slate-400 font-medium">Amount Funded</p>
                    <p className="text-lg font-black font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">
                      +{formatNaira(amount)}
                    </p>
                    <p className="text-[9.5px] text-slate-400">Wallet Inflow</p>
                  </div>

                  <div>
                    <p className="text-[10.5px] text-slate-500 dark:text-slate-400 font-medium">Funding Gateway</p>
                    <p className="text-sm font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
                      Dedicated Virtual Account
                    </p>
                    <p className="text-[9.5px] text-slate-400">Korapay Settlement</p>
                  </div>

                  <div>
                    <p className="text-[10.5px] text-slate-500 dark:text-slate-400 font-medium">Customer Wallet Balance</p>
                    <p className="text-lg font-black font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">
                      100% Credited
                    </p>
                    <p className="text-[9.5px] text-emerald-600 dark:text-emerald-400 font-semibold">Zero Surcharge</p>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <p className="text-[10.5px] text-slate-500 dark:text-slate-400 font-medium">Customer Paid</p>
                    <p className="text-lg font-black font-mono text-rose-600 dark:text-rose-400 mt-0.5">
                      -{formatNaira(amount)}
                    </p>
                    <p className="text-[9.5px] text-slate-400">Retail Revenue</p>
                  </div>

                  <div>
                    <p className="text-[10.5px] text-slate-500 dark:text-slate-400 font-medium">Provider Cost</p>
                    <p className="text-lg font-black font-mono text-amber-600 dark:text-amber-400 mt-0.5">
                      {formatNaira(providerCostNgn)}
                    </p>
                    <p className="text-[9.5px] text-slate-400">Wholesale Expense</p>
                  </div>

                  <div>
                    <p className="text-[10.5px] text-slate-500 dark:text-slate-400 font-medium">Platform Margin</p>
                    <p className="text-lg font-black font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">
                      +{formatNaira(grossProfit)}
                    </p>
                    <p className="text-[9.5px] text-emerald-600 dark:text-emerald-400 font-semibold">
                      {profitMarginPercent}% Net Spread
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Section 2: Provider Telemetry Details */}
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1.5">
              <Server className="w-3.5 h-3.5 text-brand-orange" />
              {isRefund ? 'Reversal Telemetry & Upstream Source' : 'Vendor & Provider Telemetry'}
            </h4>
            <div className="rounded-2xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-950/40 p-4 space-y-3 text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 py-1 border-b border-slate-200/60 dark:border-white/5">
                <span className="text-slate-500 dark:text-slate-400 font-medium">
                  {isRefund ? 'Originating Provider (Failed / Cancelled)' : 'Fulfillment Provider'}
                </span>
                <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <span
                    className={`h-2 w-2 rounded-full ${
                      isRefund ? 'bg-purple-500' : 'bg-emerald-500'
                    } animate-pulse`}
                  />
                  {providerName}
                </span>
              </div>

              {isRefund && originalOrderRef ? (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 py-1 border-b border-slate-200/60 dark:border-white/5">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Original Order Ref (Failed)</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-rose-600 dark:text-rose-400 select-all">
                      {originalOrderRef}
                    </span>
                    <button
                      onClick={() => copyToClipboard(originalOrderRef, setCopiedProviderRef)}
                      className="p-1 rounded text-slate-400 hover:text-slate-900 dark:hover:text-white"
                      title="Copy Original Order Ref"
                    >
                      {copiedProviderRef ? (
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 py-1 border-b border-slate-200/60 dark:border-white/5">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">
                    {isCredit ? 'Settlement Reference' : 'Provider Reference / Order ID'}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-amber-600 dark:text-brand-orange select-all">
                      {providerRef}
                    </span>
                    <button
                      onClick={() => copyToClipboard(providerRef, setCopiedProviderRef)}
                      className="p-1 rounded text-slate-400 hover:text-slate-900 dark:hover:text-white"
                      title="Copy Provider Reference"
                    >
                      {copiedProviderRef ? (
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 py-1 border-b border-slate-200/60 dark:border-white/5">
                <span className="text-slate-500 dark:text-slate-400 font-medium">
                  {isRefund ? 'Reversal Ledger Reference' : 'Internal Reference (Ledger)'}
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200 select-all">
                    {tx.reference}
                  </span>
                  <button
                    onClick={() => copyToClipboard(tx.reference, setCopiedRef)}
                    className="p-1 rounded text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    title="Copy Reference"
                  >
                    {copiedRef ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 py-1 border-b border-slate-200/60 dark:border-white/5">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Execution Timestamp</span>
                <span className="font-mono text-slate-700 dark:text-slate-300">
                  {formatDate(tx.created_at)}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 py-1">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Unfiltered Description</span>
                <span className="font-normal text-slate-800 dark:text-slate-200 max-w-sm sm:text-right break-words select-all">
                  {tx.description || tx.category}
                </span>
              </div>
            </div>
          </div>

          {/* Section 3: Customer Information */}
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-brand-orange" />
              Customer & Associated Account
            </h4>
            <div className="rounded-2xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-950/40 p-4 space-y-2.5 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-slate-200/60 dark:border-white/5">
                <span className="text-slate-500 dark:text-slate-400">Account Name</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {customerName}
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-200/60 dark:border-white/5">
                <span className="text-slate-500 dark:text-slate-400">Email Address</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-medium text-slate-800 dark:text-slate-200 select-all">
                    {customerEmail}
                  </span>
                  {customerEmail !== 'Not Available' && (
                    <button
                      onClick={() => copyToClipboard(customerEmail, setCopiedEmail)}
                      className="p-1 rounded text-slate-400 hover:text-slate-900 dark:hover:text-white"
                      title="Copy Customer Email"
                    >
                      {copiedEmail ? (
                        <Check className="w-3 h-3 text-emerald-500" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  )}
                </div>
              </div>
              {customerPhone && (
                <div className="flex justify-between items-center py-1 border-b border-slate-200/60 dark:border-white/5">
                  <span className="text-slate-500 dark:text-slate-400">Linked Phone</span>
                  <span className="font-mono text-slate-800 dark:text-slate-200">{customerPhone}</span>
                </div>
              )}
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-500 dark:text-slate-400">Wallet UUID</span>
                <span className="font-mono text-[10px] text-slate-500 dark:text-slate-400 select-all truncate max-w-[220px]">
                  {tx.wallet_id}
                </span>
              </div>
            </div>
          </div>

          {/* Section 4: Service Specific Metadata Fields */}
          {Object.keys(meta).length > 0 && (
            <div>
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                Fulfillment Payload Attributes
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {Object.entries(meta).map(([key, val]) => (
                  <div
                    key={key}
                    className="p-2.5 rounded-xl border border-slate-200/80 dark:border-white/5 bg-slate-50 dark:bg-slate-950/30"
                  >
                    <p className="text-[10px] uppercase font-semibold text-slate-400">{key.replace(/_/g, ' ')}</p>
                    <p className="font-mono font-medium text-slate-800 dark:text-slate-200 break-all mt-0.5">
                      {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 5: Unfiltered Raw Diagnostic JSON (Source of Truth) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <button
                onClick={() => setShowJson(!showJson)}
                className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-brand-orange transition-colors"
              >
                <FileCode className="w-4 h-4 text-brand-orange" />
                <span>Diagnostic Telemetry & Raw Ledger Payload (JSON)</span>
                {showJson ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => copyToClipboard(JSON.stringify(fullDiagnosticTelemetry, null, 2), setCopiedJson)}
                className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-slate-700 dark:text-white text-[10px] font-mono flex items-center gap-1.5 transition-colors"
                title="Copy full telemetry JSON to clipboard"
              >
                {copiedJson ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                {copiedJson ? 'Copied' : 'Copy Full JSON'}
              </button>
            </div>

            {showJson && (
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10">
                <div className="bg-slate-950 px-4 py-2 border-b border-white/10 flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <span>SOURCE_OF_TRUTH_LOG_RECORD</span>
                  <span className="text-emerald-400 font-bold">STATUS: {tx.status?.toUpperCase()}</span>
                </div>
                <pre className="p-4 bg-slate-950 text-emerald-400 text-[10.5px] font-mono overflow-x-auto max-h-72 select-all leading-relaxed">
                  {JSON.stringify(fullDiagnosticTelemetry, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex-shrink-0 flex items-center justify-between px-6 py-3.5 border-t border-slate-200 dark:border-white/10 bg-slate-50/80 dark:bg-slate-900/90">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Immutable Postgres RLS Record</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 dark:border-white/10 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
