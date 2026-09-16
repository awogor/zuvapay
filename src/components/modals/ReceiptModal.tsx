'use client';

import React, { useState } from 'react';
import { useWallet } from '@/context/WalletContext';
import { useAuth } from '@/context/AuthContext';
import { formatNaira, formatDate } from '@/lib/utils';
import { isShareableReceipt, shareOrDownloadReceiptImage } from '@/lib/receipt/generateReceiptImage';
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
  Share2,
  Loader2,
  Gift,
  Key,
} from 'lucide-react';
import { parseElectricityTokens, TokenItem } from '@/lib/electricity/tokenParser';

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
  const [isSharing, setIsSharing] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);

  if (!activeReceipt) return null;

  const canShare = isShareableReceipt(activeReceipt);

  const handleShare = async () => {
    if (!activeReceipt || isSharing) return;
    setIsSharing(true);
    try {
      await shareOrDownloadReceiptImage(activeReceipt, profile);
      setShareSuccess(true);
      setTimeout(() => setShareSuccess(false), 2500);
    } catch (err: any) {
      console.error('Error sharing receipt image:', err);
    } finally {
      setIsSharing(false);
    }
  };

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
  const isPostpaid = String(metadata.meter_type || metadata.meterType || '').toLowerCase() === 'postpaid';
  const parsedTokens = parseElectricityTokens(metadata);
  const token = isPostpaid ? null : (parsedTokens.mainToken || metadata.token || metadata.Token || metadata.meter_token || metadata.electricity_token);

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
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeReceipt();
      }}
    >
      <div className="relative w-full max-w-md max-h-[88vh] flex flex-col rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="flex-shrink-0 flex items-center justify-between px-5 py-4 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-orange text-white font-black text-xs shadow-sm">
              ZP
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">ZuvaPay</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Transaction Receipt</p>
            </div>
          </div>
          <button
            onClick={closeReceipt}
            className="rounded-lg p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Close Receipt"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Receipt Content - Scrollable container */}
        <div id="printable-receipt" className="flex-1 overflow-y-auto px-5 py-5 space-y-4 bg-white dark:bg-slate-900">
          
          {/* Status & Amount Hero */}
          <div className="text-center py-4 px-3 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800">
            <div className="inline-flex items-center justify-center p-2 rounded-full mb-2 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40">
              {activeReceipt.status === 'completed' && (
                <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400 stroke-[2.2]" />
              )}
              {activeReceipt.status === 'pending' && (
                <Clock className="w-6 h-6 text-amber-500 dark:text-amber-400 animate-pulse stroke-[2.2]" />
              )}
              {activeReceipt.status === 'failed' && (
                <AlertCircle className="w-6 h-6 text-rose-500 dark:text-rose-400 stroke-[2.2]" />
              )}
            </div>

            <p className="text-[11px] uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400">
              {isCredit ? 'Amount Credited' : 'Amount Paid'}
            </p>

            <h2
              className={`text-2xl sm:text-3xl font-black mt-1 tracking-tight ${
                isCredit ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'
              }`}
            >
              {isCredit ? '+' : '-'}
              {formatNaira(activeReceipt.amount)}
            </h2>

            <div className="mt-2.5 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400" />
              {activeReceipt.status.toUpperCase()}
            </div>
          </div>

          {/* Electricity Meter Status / Token Highlight */}
          {isPostpaid ? (
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-center space-y-1.5">
              <div className="flex items-center justify-center gap-1.5 text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                <Zap className="w-3.5 h-3.5 text-brand-orange" />
                Postpaid Bill Payment
              </div>
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                Payment Settled &amp; Account Credited
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Your payment has been credited to your electricity distribution account.
              </p>
            </div>
          ) : parsedTokens.hasTokens ? (
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-center space-y-3">
              {parsedTokens.tokens.length === 1 ? (
                // Single Token Display
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                      <Zap className="w-3.5 h-3.5 text-brand-orange" />
                      Prepaid Meter Token
                    </div>
                    {metadata.units && (
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        {metadata.units}
                      </span>
                    )}
                  </div>
                  <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <div className="font-mono text-sm sm:text-base font-extrabold text-slate-900 dark:text-white tracking-normal sm:tracking-wide select-all whitespace-nowrap overflow-x-auto text-center py-0.5">
                      {parsedTokens.tokens[0].token}
                    </div>
                  </div>
                  <div className="flex items-center justify-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => copyToken(parsedTokens.tokens[0].rawDigits || parsedTokens.tokens[0].token)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-orange text-white text-xs font-bold hover:bg-orange-600 transition-colors"
                    >
                      {tokenCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{tokenCopied ? 'Copied' : 'Copy Token'}</span>
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Enter these 20 digits into your CIU meter keypad and press Enter.
                  </p>
                </div>
              ) : (
                // Multi-Token Display (Main + Bonus / BSST / KCT)
                <div className="space-y-3 text-left">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
                      <Zap className="w-4 h-4 text-brand-orange" />
                      <span>Meter Tokens Generated ({parsedTokens.tokens.length})</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToken(parsedTokens.allTokensText)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-brand-orange hover:text-white text-slate-700 dark:text-slate-200 text-[11px] font-bold transition-all"
                      title="Copy all tokens with labels"
                    >
                      {tokenCopied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      <span>{tokenCopied ? 'Copied All' : 'Copy All'}</span>
                    </button>
                  </div>

                  <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[11.5px] text-amber-900 dark:text-amber-200">
                    Your purchase generated multiple meter tokens (including bonus/gift units or key change tokens). Please enter each token into your CIU keypad in order.
                  </div>

                  <div className="space-y-2">
                    {parsedTokens.tokens.map((tok: TokenItem, idx: number) => {
                      const isBonus = tok.type === 'bonus';
                      const isKct = tok.type === 'kct1' || tok.type === 'kct2';
                      return (
                        <div
                          key={idx}
                          className={`p-3 rounded-xl border space-y-1.5 ${
                            isBonus
                              ? 'bg-amber-50/70 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800'
                              : isKct
                              ? 'bg-blue-50/70 dark:bg-blue-950/20 border-blue-300 dark:border-blue-800'
                              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span
                              className={`text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                                isBonus
                                  ? 'text-amber-700 dark:text-amber-300'
                                  : isKct
                                  ? 'text-blue-700 dark:text-blue-300'
                                  : 'text-slate-700 dark:text-slate-300'
                              }`}
                            >
                              {isBonus ? <Gift className="w-3.5 h-3.5 text-amber-600" /> : isKct ? <Key className="w-3.5 h-3.5 text-blue-600" /> : <Zap className="w-3.5 h-3.5 text-brand-orange" />}
                              {tok.label}
                            </span>
                            {tok.units && (
                              <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                                {tok.units}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200/70 dark:border-slate-800 min-w-0">
                            <span className="font-mono text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white tracking-normal select-all whitespace-nowrap overflow-x-auto">
                              {tok.token}
                            </span>
                            <button
                              type="button"
                              onClick={() => copyToken(tok.rawDigits || tok.token)}
                              className="px-2.5 py-1 rounded-md bg-brand-orange hover:bg-orange-600 text-white text-[11px] font-bold transition-colors shrink-0"
                            >
                              Copy
                            </button>
                          </div>

                          {tok.subtitle && (
                            <p className="text-[10.5px] text-slate-500 dark:text-slate-400">
                              {tok.subtitle}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ) : null}

          {/* Digital Delivery & License Access (Marketplace, Software & Digital Accounts) */}
          {delivery && (
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-left space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wide">
                  <Sparkles className="w-3.5 h-3.5 text-brand-orange" />
                  Digital License &amp; Delivery
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                  Ready
                </span>
              </div>

              {/* Direct 1-Click Activation Link */}
              {delivery.activationLink && (
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">Direct Activation Link</label>
                  <div className="flex items-center gap-2">
                    <a
                      href={delivery.activationLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3.5 rounded-lg bg-brand-orange hover:bg-orange-600 text-white text-xs font-bold transition-all text-center truncate"
                    >
                      <span>Activate / Access Product</span>
                      <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
                    </a>
                    <button
                      type="button"
                      onClick={() => copyLink(delivery.activationLink!)}
                      className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors flex-shrink-0"
                      title="Copy Link"
                    >
                      {linkCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              )}

              {/* Activation Code / Key */}
              {delivery.code && delivery.code !== delivery.activationLink && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">Activation Code / Key</label>
                    <button
                      type="button"
                      onClick={() => copyCode(delivery.code!)}
                      className="text-[11px] text-brand-orange hover:underline flex items-center gap-1 font-semibold"
                    >
                      {codeCopied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                      {codeCopied ? 'Copied' : 'Copy Code'}
                    </button>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-900 dark:text-white break-all select-all">
                    {delivery.code}
                  </div>
                </div>
              )}

              {/* Login Credentials / Account Details */}
              {delivery.credentials && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">Login Credentials</label>
                    <button
                      type="button"
                      onClick={() => copyCreds(delivery.credentials!)}
                      className="text-[11px] text-brand-orange hover:underline flex items-center gap-1 font-semibold"
                    >
                      {credsCopied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                      {credsCopied ? 'Copied' : 'Copy Details'}
                    </button>
                  </div>
                  <pre className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-900 dark:text-white whitespace-pre-wrap break-all select-all leading-relaxed max-h-36 overflow-y-auto">
                    {delivery.credentials}
                  </pre>
                </div>
              )}

              {/* Instructions */}
              {delivery.instructions && (
                <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1 text-xs">
                  <span className="font-bold text-slate-700 dark:text-slate-300 text-[11px] uppercase tracking-wide flex items-center gap-1">
                    <FileText className="w-3 h-3 text-brand-orange" /> Instructions
                  </span>
                  <p className="text-slate-600 dark:text-slate-400 text-[11px] whitespace-pre-wrap leading-relaxed">
                    {delivery.instructions}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Transaction Key-Value Breakdown Table */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 divide-y divide-slate-200/70 dark:divide-slate-800/80 text-xs">
            
            <div className="flex justify-between items-center py-2">
              <span className="text-slate-500 dark:text-slate-400">Service Category</span>
              <span className="font-bold text-slate-800 dark:text-slate-200 capitalize">
                {activeReceipt.category}
              </span>
            </div>

            <div className="flex justify-between items-center py-2">
              <span className="text-slate-500 dark:text-slate-400">Description</span>
              <span className="font-semibold text-slate-900 dark:text-white text-right max-w-[240px]">
                {activeReceipt.description || 'Digital Payment'}
              </span>
            </div>

            <div className="flex justify-between items-center py-2">
              <span className="text-slate-500 dark:text-slate-400">Reference No.</span>
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-xs text-brand-orange font-bold">
                  {activeReceipt.reference}
                </span>
                <button
                  onClick={copyReference}
                  className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
                  title="Copy Reference"
                >
                  {copied ? (
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex justify-between items-center py-2">
              <span className="text-slate-500 dark:text-slate-400">Date &amp; Time</span>
              <span className="text-slate-700 dark:text-slate-300 font-mono">
                {formatDate(activeReceipt.created_at)}
              </span>
            </div>

            {profile && (
              <div className="flex justify-between items-center py-2">
                <span className="text-slate-500 dark:text-slate-400">Customer Name</span>
                <span className="text-slate-800 dark:text-slate-200 font-medium">
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
                    if (typeof val === 'object') return false;

                    const cleanKey = k.toLowerCase().replace(/[^a-z0-9]/g, '');

                    // Exclude keys handled by dedicated banners
                    if (['token', 'metertoken', 'electricitytoken'].includes(cleanKey)) return false;
                    if (['delivery', 'credentials', 'activationlink', 'instructions', 'rawtext', 'raw', 'code'].includes(cleanKey)) return false;

                    // Exclude internal vendor / operator details
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

                    if (['productid', 'itemid', 'planid', 'packageid', 'serviceid'].includes(cleanKey)) return false;
                    if (['customeremail', 'useremail', 'idempotencykey'].includes(cleanKey)) return false;

                    return true;
                  })
                  .map(([key, val]) => {
                    return (
                      <div key={key} className="flex justify-between items-center py-2">
                        <span className="text-slate-500 dark:text-slate-400">{formatMetaKey(key)}</span>
                        <span className="text-slate-900 dark:text-slate-100 font-semibold text-right max-w-[240px] break-all">
                          {String(val)}
                        </span>
                      </div>
                    );
                  })}
              </>
            )}
          </div>

          <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 pt-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Verified Secure ZuvaPay Transaction</span>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex-shrink-0 flex flex-wrap items-center justify-between gap-2 px-4 sm:px-5 py-3 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
          <div className="flex-1 min-w-[120px]">
            {canShare && (
              <button
                type="button"
                onClick={handleShare}
                disabled={isSharing}
                className="w-full sm:w-auto flex items-center justify-center gap-1.5 py-2 px-3 sm:px-3.5 rounded-xl bg-brand-orange hover:bg-orange-600 active:scale-[0.98] text-white text-xs font-bold transition-all shadow-sm shadow-orange-500/20 disabled:opacity-60"
                title="Share or Download Official Receipt Image"
              >
                {isSharing ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : shareSuccess ? (
                  <Check className="w-3.5 h-3.5" />
                ) : (
                  <Share2 className="w-3.5 h-3.5" />
                )}
                <span>
                  {isSharing ? 'Generating...' : shareSuccess ? 'Shared!' : 'Share Receipt'}
                </span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={copyReference}
              className="flex items-center gap-1.5 py-2 px-3 sm:px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Ref'}</span>
            </button>
            <button
              onClick={closeReceipt}
              className="px-4 sm:px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-950 text-xs font-bold transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
