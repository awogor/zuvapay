'use client';

import React, { useState } from 'react';
import { useWallet } from '@/context/WalletContext';
import { useAuth } from '@/context/AuthContext';
import { formatNaira, formatDate } from '@/lib/utils';
import {
  X,
  Copy,
  Check,
  CheckCircle2,
  Clock,
  AlertCircle,
  ShieldCheck,
  Zap,
  ExternalLink,
  Sparkles,
  FileText,
} from 'lucide-react';

function formatMetaKey(key: string): string {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
    .replace(/_/g, ' ')
    .trim();
}

export function ReceiptModal() {
  const { activeReceipt, closeReceipt } = useWallet();
  const { profile } = useAuth();
  const [copied, setCopied] = useState(false);
  const [tokenCopied, setTokenCopied] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [credsCopied, setCredsCopied] = useState(false);

  if (!activeReceipt) return null;

  const copyReference = () => {
    navigator.clipboard.writeText(activeReceipt.reference);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyToken = (tok: string) => {
    navigator.clipboard.writeText(tok);
    setTokenCopied(true);
    setTimeout(() => setTokenCopied(false), 2000);
  };

  const copyCode = (c: string) => {
    navigator.clipboard.writeText(c);
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  };

  const copyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const copyCreds = (text: string) => {
    navigator.clipboard.writeText(text);
    setCredsCopied(true);
    setTimeout(() => setCredsCopied(false), 2000);
  };

  const isCredit = activeReceipt.type === 'credit';
  const metadata = activeReceipt.metadata || {};
  const token = metadata.token || metadata.Token || metadata.meter_token || metadata.electricity_token;

  const rawDelivery = metadata.delivery || (metadata.credentials ? {
    credentials: metadata.credentials,
    instructions: metadata.instructions,
    activationLink: metadata.activationLink,
    code: metadata.code,
  } : null);

  const delivery = rawDelivery ? {
    activationLink: rawDelivery.activationLink || null,
    code: rawDelivery.code || null,
    credentials: typeof rawDelivery.credentials === 'string'
      ? rawDelivery.credentials
      : (rawDelivery.credentials?.username ? `Username: ${rawDelivery.credentials.username}\nPassword: ${rawDelivery.credentials.password || ''}` : (rawDelivery.credentials ? JSON.stringify(rawDelivery.credentials) : null)),
    instructions: rawDelivery.instructions || null,
    rawText: rawDelivery.rawText || null,
  } : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-md animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeReceipt();
      }}
    >
      <div className="relative w-full max-w-lg md:max-w-xl max-h-[86dvh] sm:max-h-[90vh] flex flex-col rounded-2xl sm:rounded-3xl border border-white/15 bg-slate-900 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Top decorative bar */}
        <div
          className={`h-2.5 w-full flex-shrink-0 ${
            activeReceipt.status === 'completed'
              ? isCredit
                ? 'bg-emerald-500'
                : 'bg-brand-orange'
              : activeReceipt.status === 'pending'
              ? 'bg-amber-500'
              : 'bg-rose-500'
          }`}
        />

        {/* Modal Header - Sticky at top */}
        <div className="sticky top-0 z-20 flex-shrink-0 flex items-center justify-between px-6 py-4 bg-slate-900/95 backdrop-blur-sm border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-zuva-solar via-zuva-amber to-zuva-gold font-black text-slate-950 shadow-lg shadow-orange-500/20">
              ZP
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-wide">ZuvaPay</h3>
              <p className="text-[11px] text-slate-400">Transaction Receipt</p>
            </div>
          </div>
          <button
            onClick={closeReceipt}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors border border-transparent hover:border-white/10"
            title="Close Receipt"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Receipt Content - Scrollable container */}
        <div id="printable-receipt" className="flex-1 overflow-y-auto px-6 py-5 space-y-5 scrollbar-thin scrollbar-thumb-slate-700">
          {/* Status & Amount Hero */}
          <div className="text-center py-4 px-4 bg-slate-950/70 rounded-2xl border border-white/5 shadow-inner">
            <div className="inline-flex items-center justify-center p-2.5 rounded-full mb-2 bg-white/5">
              {activeReceipt.status === 'completed' && (
                <CheckCircle2 className="w-9 h-9 text-emerald-400" />
              )}
              {activeReceipt.status === 'pending' && (
                <Clock className="w-9 h-9 text-amber-400 animate-pulse" />
              )}
              {activeReceipt.status === 'failed' && (
                <AlertCircle className="w-9 h-9 text-rose-400" />
              )}
            </div>
            <p className="text-xs uppercase tracking-wider font-semibold text-slate-400">
              {isCredit ? 'Amount Credited' : 'Amount Paid'}
            </p>
            <h2
              className={`text-3xl sm:text-4xl font-black mt-1 tracking-tight ${
                isCredit ? 'text-emerald-400' : 'text-white'
              }`}
            >
              {isCredit ? '+' : '-'}
              {formatNaira(activeReceipt.amount)}
            </h2>
            <div className="mt-2.5 inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {activeReceipt.status.toUpperCase()}
            </div>
          </div>

          {/* Electricity Token Highlight (if applicable) */}
          {token && (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-center space-y-2">
              <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-amber-400 uppercase tracking-wider">
                <Zap className="w-4 h-4" />
                Electricity Token (Prepaid Units)
              </div>
              <div className="flex items-center justify-center gap-2">
                <span className="font-mono text-xl sm:text-2xl font-black text-amber-300 tracking-wider">
                  {token}
                </span>
                <button
                  type="button"
                  onClick={() => copyToken(String(token))}
                  className="p-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 transition-colors"
                  title="Copy Token"
                >
                  {tokenCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[11px] text-slate-400">Load this token directly into your prepaid meter</p>
            </div>
          )}

          {/* Digital Delivery & License Access (Marketplace, Software & Digital Accounts) */}
          {delivery && (
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-purple-950/70 via-slate-900 to-indigo-950/70 border border-purple-500/30 text-left space-y-3.5 shadow-lg shadow-purple-950/40">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-purple-300 uppercase tracking-wider">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  Digital License & Delivery Details
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Ready for Use
                </span>
              </div>

              {/* Direct 1-Click Activation Link */}
              {delivery.activationLink && (
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-slate-300">Direct Activation Link</label>
                  <div className="flex items-center gap-2">
                    <a
                      href={delivery.activationLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-purple-600/30 transition-all text-center truncate"
                    >
                      <span>Activate / Access Product Now</span>
                      <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
                    </a>
                    <button
                      type="button"
                      onClick={() => copyLink(delivery.activationLink!)}
                      className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors flex-shrink-0"
                      title="Copy Link"
                    >
                      {linkCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}

              {/* Activation Code / Key */}
              {delivery.code && delivery.code !== delivery.activationLink && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-semibold text-slate-300">Activation Code / Token</label>
                    <button
                      type="button"
                      onClick={() => copyCode(delivery.code!)}
                      className="text-[11px] text-purple-400 hover:text-purple-300 flex items-center gap-1 font-semibold"
                    >
                      {codeCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      {codeCopied ? 'Copied' : 'Copy Code'}
                    </button>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950/80 border border-purple-500/20 font-mono text-xs text-purple-200 break-all select-all">
                    {delivery.code}
                  </div>
                </div>
              )}

              {/* Login Credentials / Account Details */}
              {delivery.credentials && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-semibold text-slate-300">Login Credentials & Details</label>
                    <button
                      type="button"
                      onClick={() => copyCreds(delivery.credentials!)}
                      className="text-[11px] text-purple-400 hover:text-purple-300 flex items-center gap-1 font-semibold"
                    >
                      {credsCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      {credsCopied ? 'Copied' : 'Copy Details'}
                    </button>
                  </div>
                  <pre className="p-3 rounded-xl bg-slate-950/80 border border-purple-500/20 font-mono text-xs text-emerald-300/90 whitespace-pre-wrap break-all select-all leading-relaxed max-h-48 overflow-y-auto">
                    {delivery.credentials}
                  </pre>
                </div>
              )}

              {/* Instructions */}
              {delivery.instructions && (
                <div className="p-3 rounded-xl bg-slate-900/90 border border-white/5 space-y-1 text-xs">
                  <span className="font-bold text-amber-300 text-[11px] uppercase tracking-wide flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5" /> How To Redeem & Instructions
                  </span>
                  <p className="text-slate-300 text-[11px] whitespace-pre-wrap leading-relaxed">
                    {delivery.instructions}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Transaction Metadata Breakdown */}
          <div className="rounded-2xl bg-slate-950/40 p-4 border border-white/5 space-y-3 text-sm">
            <div className="flex justify-between items-center py-1.5 border-b border-white/5">
              <span className="text-slate-400 text-xs">Service Category</span>
              <span className="font-semibold text-slate-200 capitalize text-xs bg-slate-800/60 px-2.5 py-0.5 rounded-md border border-white/5">
                {activeReceipt.category}
              </span>
            </div>

            <div className="flex justify-between items-center py-1.5 border-b border-white/5">
              <span className="text-slate-400 text-xs">Description</span>
              <span className="font-medium text-slate-200 text-xs text-right max-w-[280px]">
                {activeReceipt.description || 'Digital Payment'}
              </span>
            </div>

            <div className="flex justify-between items-center py-1.5 border-b border-white/5">
              <span className="text-slate-400 text-xs">Reference No.</span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-brand-orange font-bold">
                  {activeReceipt.reference}
                </span>
                <button
                  onClick={copyReference}
                  className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  title="Copy Reference"
                >
                  {copied ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex justify-between items-center py-1.5 border-b border-white/5">
              <span className="text-slate-400 text-xs">Date & Time</span>
              <span className="text-slate-300 text-xs font-mono">
                {formatDate(activeReceipt.created_at)}
              </span>
            </div>

            {profile && (
              <div className="flex justify-between items-center py-1.5 border-b border-white/5">
                <span className="text-slate-400 text-xs">Customer Name</span>
                <span className="text-slate-200 font-medium text-xs">
                  {profile.first_name} {profile.last_name}
                </span>
              </div>
            )}

            {/* Custom service metadata display */}
            {activeReceipt.metadata && (
              <>
                {Object.entries(activeReceipt.metadata)
                  .filter(([k, val]) => {
                    if (val === null || val === undefined || val === '') return false;
                    // Never render nested objects or arrays as raw strings in the key-value table
                    if (typeof val === 'object') return false;

                    const cleanKey = k.toLowerCase().replace(/[^a-z0-9]/g, '');

                    // 1. Exclude electricity token (rendered in dedicated token hero box)
                    if (['token', 'metertoken', 'electricitytoken'].includes(cleanKey)) return false;

                    // 2. Exclude digital delivery, credentials, instructions (rendered in dedicated license box)
                    if (['delivery', 'credentials', 'activationlink', 'instructions', 'rawtext', 'raw', 'code'].includes(cleanKey)) return false;

                    // 3. STRICT ADMIN & VENDOR ISOLATION: Never expose vendor/supplier/operator keys to customer
                    const isInternalVendorKey =
                      cleanKey.includes('supplier') ||
                      cleanKey.includes('vendor') ||
                      cleanKey.includes('provider') ||
                      cleanKey.includes('operator') ||
                      cleanKey.includes('external') ||
                      cleanKey.includes('upstream') ||
                      cleanKey.includes('backend') ||
                      cleanKey.includes('fadded') ||
                      cleanKey.includes('aiplug') ||
                      cleanKey.includes('gongoz') ||
                      cleanKey.includes('grizzly') ||
                      cleanKey.includes('momo');

                    if (isInternalVendorKey) return false;

                    // 4. Hide internal raw catalog IDs (e.g. ext:67, numeric vendor IDs) - customers only care about Product Name
                    if (['productid', 'itemid', 'planid', 'packageid', 'serviceid'].includes(cleanKey)) return false;

                    // 5. Hide internal user emails or session tokens if present in metadata
                    if (['customeremail', 'useremail', 'idempotencykey'].includes(cleanKey)) return false;

                    return true;
                  })
                  .map(([key, val]) => {
                    return (
                      <div key={key} className="flex justify-between items-center py-1.5 border-b border-white/5 last:border-0">
                        <span className="text-slate-400 text-xs">{formatMetaKey(key)}</span>
                        <span className="text-slate-200 font-medium text-xs text-right max-w-[280px] break-all">
                          {String(val)}
                        </span>
                      </div>
                    );
                  })}
              </>
            )}
          </div>

          <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 pt-1 pb-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Verified Secure ZuvaPay Transaction</span>
          </div>
        </div>

        {/* Modal Actions - Sticky at bottom */}
        <div className="sticky bottom-0 z-20 flex-shrink-0 no-print flex items-center justify-end gap-2 p-3 sm:p-4 bg-slate-950/95 backdrop-blur-sm border-t border-white/10">
          <button
            onClick={copyReference}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 py-2 px-3.5 rounded-xl bg-gradient-to-r from-brand-orange to-amber-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 text-[11px] sm:text-xs font-bold transition-all shadow-md shadow-orange-500/20"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied' : 'Copy Ref'}
          </button>
          <button
            onClick={closeReceipt}
            className="px-3.5 py-2 rounded-xl border border-white/10 text-slate-300 hover:bg-slate-800 hover:text-white text-[11px] sm:text-xs font-semibold transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
