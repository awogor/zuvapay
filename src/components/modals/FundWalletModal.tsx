'use client';

import React, { useState, useEffect } from 'react';
import { useWallet } from '@/context/WalletContext';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/common/Toast';
import { formatNaira } from '@/lib/utils';
import { VirtualAccount } from '@/types';
import {
  X,
  CreditCard,
  Building2,
  Copy,
  Check,
  Zap,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';

interface FundWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const BILLSTACK_BANKS = [
  {
    code: '9PSB',
    name: '9PSB Bank',
    tag: 'No KYC Required',
    badge: 'Default',
  },
  {
    code: 'PROVIDUS',
    name: 'Providus Bank',
    tag: 'Commercial Rails',
    badge: 'Popular',
  },
  {
    code: 'PALMPAY',
    name: 'PalmPay',
    tag: 'NIN / BVN Required',
    badge: 'Instant Transfer',
  },
] as const;

type SupportedBankCode = (typeof BILLSTACK_BANKS)[number]['code'];

export function FundWalletModal({ isOpen, onClose }: FundWalletModalProps) {
  const { fundWallet } = useWallet();
  const { user, profile } = useAuth();
  const { success, error, info } = useToast();

  const [tab, setTab] = useState<'transfer' | 'card'>('transfer');
  const [selectedBank, setSelectedBank] = useState<SupportedBankCode>('9PSB');
  const [amount, setAmount] = useState<string>('5000');
  const [loading, setLoading] = useState(false);
  const [copiedAccount, setCopiedAccount] = useState(false);

  // Multi-bank Virtual Accounts State
  const [accounts, setAccounts] = useState<VirtualAccount[]>([]);
  const [fetchingAccounts, setFetchingAccounts] = useState(true);
  const [generatingAccount, setGeneratingAccount] = useState(false);
  const [isSandboxMode, setIsSandboxMode] = useState(false);

  // PalmPay KYC inputs
  const [idType, setIdType] = useState<'nin' | 'bvn'>('nin');
  const [idNumber, setIdNumber] = useState('');

  // Fetch or auto-provision virtual accounts
  useEffect(() => {
    if (!isOpen) return;

    async function loadAccounts() {
      setFetchingAccounts(true);
      try {
        const res = await fetch('/api/wallet/virtual-account');
        const data = await res.json();
        if (data.success) {
          if (data.is_sandbox) {
            setIsSandboxMode(true);
          }
          if (data.accounts && Array.isArray(data.accounts)) {
            setAccounts(data.accounts);
          } else if (data.account) {
            setAccounts([data.account]);
          }
        }
      } catch (err) {
        console.warn('Virtual account load error:', err);
      } finally {
        setFetchingAccounts(false);
      }
    }

    loadAccounts();
  }, [isOpen, user]);

  if (!isOpen) return null;

  const quickAmounts = [2000, 5000, 10000, 20000, 50000];

  // Active account for the currently selected bank pill
  const activeAccount = accounts.find(
    (a) => (a.bank_code || '').toUpperCase() === selectedBank.toUpperCase()
  );

  const handleCopyAccount = () => {
    if (!activeAccount) return;
    navigator.clipboard.writeText(activeAccount.account_number);
    setCopiedAccount(true);
    setTimeout(() => setCopiedAccount(false), 2000);
  };

  const handleGenerateAccount = async (bankToGen: SupportedBankCode = selectedBank) => {
    setGeneratingAccount(true);

    try {
      const payload: any = {
        bank: bankToGen,
        userId: user?.id,
        name: profile ? `${profile.first_name} ${profile.last_name}` : 'ZuvaPay Customer',
        email: user?.email,
      };

      if (bankToGen === 'PALMPAY') {
        const cleanId = idNumber.trim();
        if (!cleanId || cleanId.length !== 11 || isNaN(Number(cleanId))) {
          error('Verification Required', `Please enter a valid 11-digit ${idType.toUpperCase()}`);
          setGeneratingAccount(false);
          return;
        }
        payload.idType = idType;
        payload.idNumber = cleanId;
      }

      const res = await fetch('/api/wallet/virtual-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.success && data.account) {
        setAccounts((prev) => {
          const filtered = prev.filter(
            (a) => (a.bank_code || '').toUpperCase() !== bankToGen.toUpperCase()
          );
          return [...filtered, data.account];
        });
        success(
          'Virtual Account Ready!',
          `Generated ${data.account.bank_name || bankToGen} dedicated account for automated funding.`
        );
      } else {
        const errMsg = data.error?.toLowerCase().includes('providus')
          ? 'Providus Bank virtual account reservation is temporarily undergoing maintenance by the bank. Please use 9PSB (Instant) or PalmPay.'
          : data.error || 'Could not generate virtual account';
        error('Bank System Notice', errMsg);
      }
    } catch (err: any) {
      error('Error', err.message || 'Failed to communicate with Billstack');
    } finally {
      setGeneratingAccount(false);
    }
  };

  const handleDeposit = async () => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount < 100) {
      error('Invalid Amount', 'Minimum deposit is ₦100');
      return;
    }

    setLoading(true);
    try {
      if (tab === 'card') {
        // Korapay Standard Checkout
        const res = await fetch('/api/wallet/korapay-checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: numAmount,
            userId: user?.id,
            email: user?.email,
            name: profile ? `${profile.first_name} ${profile.last_name}` : undefined,
          }),
        });

        const data = await res.json();

        if (data.success && data.checkoutUrl) {
          info('Redirecting to Korapay Checkout', 'Opening secure checkout for Card & Bank Transfer...');
          window.location.href = data.checkoutUrl;
          return;
        } else {
          error('Checkout Error', data.error || 'Failed to initialize Korapay checkout');
          setLoading(false);
          return;
        }
      }

      // Simulation fallback for manual testing
      const res = await fundWallet(numAmount, 'Virtual Dedicated Account');
      if (res.success) {
        success('Wallet Funded Successfully!', `Credited ${formatNaira(numAmount)} to your NGN wallet.`);
        onClose();
      } else {
        error('Deposit Failed', res.error || 'Could not fund wallet');
      }
    } catch (err: any) {
      error('Deposit Error', err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-lg max-h-[88dvh] sm:max-h-[90dvh] flex flex-col overflow-hidden rounded-t-[28px] sm:rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-200">
        {/* Mobile Drag Indicator */}
        <div className="sm:hidden pt-2.5 pb-1 flex justify-center flex-shrink-0 bg-transparent">
          <div className="w-10 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
        </div>

        {/* Header - Fixed at Top */}
        <div className="flex-shrink-0 flex items-center justify-between px-5 sm:px-6 pt-3 sm:pt-4 pb-3 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-brand-orange/10 border border-brand-orange/20 text-brand-orange">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">Fund Wallet</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Instant deposit via Dedicated Accounts or Card</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto overscroll-contain bg-white dark:bg-slate-900">
          <div className="p-5 sm:p-6 space-y-5">
            {/* Tabs Switcher */}
            <div className="flex p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl gap-1 border border-slate-200/60 dark:border-slate-700/60">
              <button
                type="button"
                onClick={() => setTab('transfer')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-black transition-all ${
                  tab === 'transfer'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm border border-slate-200/50 dark:border-slate-700/50'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Building2 className="w-4 h-4 text-brand-orange" />
                <span>Bank Transfer</span>
                <span className="text-[10px] uppercase font-extrabold px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  Instant
                </span>
              </button>
              <button
                type="button"
                onClick={() => setTab('card')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-black transition-all ${
                  tab === 'card'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm border border-slate-200/50 dark:border-slate-700/50'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <CreditCard className="w-4 h-4 text-brand-orange" />
                <span>Debit Card</span>
              </button>
            </div>

            {/* TAB 1: BANK TRANSFER (Dedicated Virtual Account) */}
            {tab === 'transfer' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                {/* Multi-bank Selector Pills */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 dark:text-slate-400 px-1">
                    <span>Select Receiving Bank:</span>
                    <span className="text-brand-orange font-semibold">3 Banks Available</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 p-1 bg-slate-100 dark:bg-slate-800/60 rounded-2xl border border-slate-200/60 dark:border-slate-700/60">
                    {BILLSTACK_BANKS.map((b) => {
                      const isSelected = selectedBank === b.code;
                      const hasAccount = accounts.some(
                        (a) => (a.bank_code || '').toUpperCase() === b.code
                      );
                      return (
                        <button
                          key={b.code}
                          type="button"
                          onClick={() => setSelectedBank(b.code)}
                          className={`relative flex flex-col items-center justify-center py-2 px-1 rounded-xl text-center transition-all ${
                            isSelected
                              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm border border-slate-200/80 dark:border-slate-700'
                              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                          }`}
                        >
                          <span className="text-xs font-black truncate block w-full">{b.name}</span>
                          <span className="text-[9px] text-slate-400 dark:text-slate-500 font-medium">
                            {hasAccount ? '✓ Active' : b.code === 'PALMPAY' ? 'NIN/BVN' : '1-Click'}
                          </span>
                          {hasAccount && (
                            <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {fetchingAccounts ? (
                  <div className="p-8 flex flex-col items-center justify-center space-y-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                    <RefreshCw className="w-7 h-7 text-brand-orange animate-spin" />
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                      Loading dedicated accounts...
                    </p>
                    <p className="text-xs text-slate-400">Instant funding via automated banking rails</p>
                  </div>
                ) : activeAccount ? (
                  <div className="space-y-4">
                    {/* Dedicated Account Card */}
                    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-850 to-slate-950 text-white p-5 border border-slate-800 shadow-xl">
                      <div className="flex items-center justify-between pb-3 border-b border-white/10">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-brand-orange">
                            <Building2 className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                              Bank Name
                            </span>
                            <span className="text-sm font-black text-white">
                              {activeAccount.bank_name || selectedBank}
                            </span>
                          </div>
                        </div>
                        {isSandboxMode ? (
                          <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-bold">
                            <ShieldCheck className="w-3 h-3 text-amber-400" />
                            <span>Sandbox (DB Safe)</span>
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold">
                            <Zap className="w-3 h-3 text-emerald-400" />
                            <span>Active &amp; Auto-Credit</span>
                          </div>
                        )}
                      </div>

                      {/* Account Number Box */}
                      <div className="my-4 p-4 rounded-xl bg-white/5 border border-white/10 flex flex-col min-[380px]:flex-row items-start min-[380px]:items-center justify-between gap-3">
                        <div className="w-full min-[380px]:w-auto">
                          <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block mb-1">
                            Account Number
                          </span>
                          <span className="font-mono text-2xl sm:text-3xl font-black tracking-widest text-brand-orange break-all">
                            {activeAccount.account_number}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={handleCopyAccount}
                          className={`w-full min-[380px]:w-auto flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black transition-all ${
                            copiedAccount
                              ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                              : 'bg-white/15 hover:bg-white/25 text-white'
                          }`}
                        >
                          {copiedAccount ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* Account Name */}
                      <div>
                        <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">
                          Account Name
                        </span>
                        <span className="text-sm font-bold text-slate-200">
                          {activeAccount.account_name}
                        </span>
                      </div>
                    </div>

                    {/* Instructions */}
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2.5 text-xs">
                      <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-xs">
                        <Zap className="w-4 h-4 text-brand-orange" />
                        <span>How dedicated bank transfer works:</span>
                      </div>
                      <ul className="space-y-2 text-slate-600 dark:text-slate-400 pl-1">
                        <li className="flex items-start gap-2">
                          <span className="w-4 h-4 rounded-full bg-brand-orange/10 text-brand-orange flex items-center justify-center font-bold text-[10px] flex-shrink-0 mt-0.5">
                            1
                          </span>
                          <span>Open any banking app (Opay, PalmPay, Kuda, GTBank, Zenith, Access, etc.).</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="w-4 h-4 rounded-full bg-brand-orange/10 text-brand-orange flex items-center justify-center font-bold text-[10px] flex-shrink-0 mt-0.5">
                            2
                          </span>
                          <span>
                            Transfer any amount to the <strong>{activeAccount.bank_name || selectedBank}</strong> account number above.
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="w-4 h-4 rounded-full bg-brand-orange/10 text-brand-orange flex items-center justify-center font-bold text-[10px] flex-shrink-0 mt-0.5">
                            3
                          </span>
                          <span>
                            Your ZuvaPay wallet is automatically credited in real-time. Standard <strong>₦50 flat fee</strong> applies per bank transfer.
                          </span>
                        </li>
                      </ul>
                    </div>

                    {/* Charges / Mode Notice */}
                    <div className="flex items-center justify-center gap-1.5 text-[11px] font-bold">
                      {isSandboxMode ? (
                        <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                          <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
                          <span>Sandbox Simulation Active • Supabase database writes skipped</span>
                        </span>
                      ) : (
                        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-semibold border border-slate-200/80 dark:border-slate-700/80">
                          <span className="inline-flex items-center gap-1 text-brand-orange font-black">
                            <Zap className="w-3.5 h-3.5 text-brand-orange" />
                            <span>₦50 Flat Fee</span>
                          </span>
                          <span className="text-slate-300 dark:text-slate-600">•</span>
                          <span>Instant Real-Time Credit</span>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  /* Generation View for Currently Selected Bank */
                  <div className="p-5 sm:p-6 text-center space-y-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                    <div className="w-12 h-12 rounded-2xl bg-brand-orange/10 text-brand-orange flex items-center justify-center mx-auto">
                      <Building2 className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-black text-slate-900 dark:text-white">
                        Generate Dedicated {selectedBank === 'PALMPAY' ? 'PalmPay' : selectedBank === 'PROVIDUS' ? 'Providus Bank' : '9PSB Bank'} Account
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                        {selectedBank === 'PALMPAY'
                          ? 'PalmPay requires a one-time 11-digit NIN or BVN identity verification as mandated by regulatory requirements.'
                          : selectedBank === 'PROVIDUS'
                          ? 'Get a permanent Providus Bank commercial account number reserved exclusively for your ZuvaPay wallet.'
                          : 'Get a permanent 9PSB bank account reserved exclusively for your wallet with zero KYC requirements.'}
                      </p>
                    </div>

                    {/* PalmPay Specific Verification Form */}
                    {selectedBank === 'PALMPAY' && (
                      <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 text-left">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                            Verification ID Type
                          </label>
                          <div className="flex p-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg">
                            <button
                              type="button"
                              onClick={() => setIdType('nin')}
                              className={`px-2.5 py-1 rounded-md text-[11px] font-extrabold transition-all ${
                                idType === 'nin'
                                  ? 'bg-brand-orange text-slate-950 shadow-xs'
                                  : 'text-slate-500 dark:text-slate-400'
                              }`}
                            >
                              NIN
                            </button>
                            <button
                              type="button"
                              onClick={() => setIdType('bvn')}
                              className={`px-2.5 py-1 rounded-md text-[11px] font-extrabold transition-all ${
                                idType === 'bvn'
                                  ? 'bg-brand-orange text-slate-950 shadow-xs'
                                  : 'text-slate-500 dark:text-slate-400'
                              }`}
                            >
                              BVN
                            </button>
                          </div>
                        </div>
                        <input
                          type="tel"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          maxLength={11}
                          value={idNumber}
                          onChange={(e) => setIdNumber(e.target.value.replace(/\D/g, ''))}
                          placeholder={`Enter 11-digit ${idType.toUpperCase()}`}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 text-xs font-mono font-bold focus:outline-none focus:border-brand-orange"
                        />
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => handleGenerateAccount(selectedBank)}
                      disabled={generatingAccount || (selectedBank === 'PALMPAY' && idNumber.trim().length !== 11)}
                      className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-brand-orange via-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 disabled:opacity-50"
                    >
                      {generatingAccount ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Generating Dedicated Account...</span>
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4" />
                          <span>
                            Generate {selectedBank === 'PALMPAY' ? 'PalmPay' : selectedBank === 'PROVIDUS' ? 'Providus Bank' : '9PSB'} Account
                          </span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: DEBIT CARD / KORAPAY CHECKOUT */}
            {tab === 'card' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2.5">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Amount to Fund (₦)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-black text-brand-orange text-lg">
                      ₦
                    </span>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="e.g. 5000"
                      className="w-full pl-9 pr-4 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20 text-base font-black shadow-xs"
                    />
                  </div>
                </div>

                {/* Quick Amount Pills */}
                <div className="flex flex-wrap gap-2">
                  {quickAmounts.map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setAmount(amt.toString())}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${
                        amount === amt.toString()
                          ? 'bg-gradient-to-r from-brand-orange/20 to-amber-500/20 border-brand-orange text-brand-orange shadow-xs'
                          : 'border-slate-200 dark:border-white/10 bg-white/90 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 hover:border-brand-orange/40 hover:bg-orange-50/50 dark:hover:bg-slate-800 shadow-2xs'
                      }`}
                    >
                      {formatNaira(amt)}
                    </button>
                  ))}
                </div>

                {/* Korapay Fee & Settlement Breakdown */}
                {parseFloat(amount) >= 100 && (
                  <div className="p-3.5 rounded-2xl bg-orange-50/60 dark:bg-slate-950/60 border border-brand-orange/25 dark:border-white/10 space-y-2 text-xs animate-in fade-in duration-150">
                    <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                      <span className="font-medium">Wallet Credit Amount</span>
                      <span className="font-mono font-bold text-slate-900 dark:text-white">
                        {formatNaira(parseFloat(amount))}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                      <span className="flex items-center gap-1 font-medium">
                        <span>Gateway Fee (1.5%)</span>
                        <span className="text-[10px] text-brand-orange font-semibold">(Korapay)</span>
                      </span>
                      <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
                        +{formatNaira(Math.min(2000, Math.round(parseFloat(amount) * 0.015 * 100) / 100))}
                      </span>
                    </div>
                    <div className="pt-2 border-t border-slate-200/80 dark:border-white/10 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white block">Total to Pay</span>
                        <span className="text-[10px] text-slate-400">Includes gateway processing charge</span>
                      </div>
                      <span className="font-mono font-black text-base text-brand-orange">
                        {formatNaira(
                          parseFloat(amount) +
                            Math.min(2000, Math.round(parseFloat(amount) * 0.015 * 100) / 100)
                        )}
                      </span>
                    </div>
                  </div>
                )}

                {/* Action */}
                <div className="pt-2">
                  <button
                    onClick={handleDeposit}
                    disabled={loading || isNaN(parseFloat(amount)) || parseFloat(amount) < 100}
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-brand-orange via-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black text-sm transition-all shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30 active:scale-[0.99] disabled:opacity-50"
                  >
                    <CreditCard className="w-4 h-4" />
                    {loading
                      ? 'Opening Checkout...'
                      : `Pay ${
                          parseFloat(amount) >= 100
                            ? formatNaira(
                                parseFloat(amount) +
                                  Math.min(2000, Math.round(parseFloat(amount) * 0.015 * 100) / 100)
                              )
                            : ''
                        } with Card / Checkout`}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  <span>256-bit Encrypted Banking Grade Gateway</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
