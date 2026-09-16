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

const BANKS = [
  { code: '090405', name: 'Moniepoint MFB' },
  { code: '035', name: 'Wema Bank' },
  { code: '070', name: 'Fidelity Bank' },
];

export function FundWalletModal({ isOpen, onClose }: FundWalletModalProps) {
  const { fundWallet } = useWallet();
  const { user, profile } = useAuth();
  const { success, error, info } = useToast();

  const [tab, setTab] = useState<'transfer' | 'card'>('card');
  const [amount, setAmount] = useState<string>('5000');
  const [loading, setLoading] = useState(false);
  const [copiedAccount, setCopiedAccount] = useState(false);

  // Dynamic Korapay Virtual Account State
  const [virtualAccount, setVirtualAccount] = useState<VirtualAccount | null>(null);
  const [fetchingAccount, setFetchingAccount] = useState(true);
  const [generatingAccount, setGeneratingAccount] = useState(false);
  const [selectedBankCode, setSelectedBankCode] = useState('090405');
  const [bvnInput, setBvnInput] = useState('');

  // Fetch or check existing virtual account
  useEffect(() => {
    if (!isOpen) return;

    async function loadAccount() {
      setFetchingAccount(true);
      try {
        const res = await fetch('/api/wallet/virtual-account');
        const data = await res.json();
        if (data.success && data.account) {
          setVirtualAccount(data.account);
        } else {
          // Check local storage fallback for demo/sandbox user
          const saved = localStorage.getItem(`zuvapay_vba_${user?.id || 'demo'}`);
          if (saved) {
            setVirtualAccount(JSON.parse(saved));
          } else {
            setVirtualAccount(null);
          }
        }
      } catch (err) {
        console.warn('Virtual account check:', err);
      } finally {
        setFetchingAccount(false);
      }
    }

    loadAccount();
  }, [isOpen, user]);

  if (!isOpen) return null;

  const quickAmounts = [2000, 5000, 10000, 20000, 50000];

  const handleCopyAccount = () => {
    if (!virtualAccount) return;
    navigator.clipboard.writeText(virtualAccount.account_number);
    setCopiedAccount(true);
    setTimeout(() => setCopiedAccount(false), 2000);
  };

  const handleGenerateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneratingAccount(true);

    try {
      const res = await fetch('/api/wallet/virtual-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bankCode: selectedBankCode,
          bvn: bvnInput || '22222222222',
          userId: user?.id,
          name: profile ? `${profile.first_name} ${profile.last_name}` : 'ZuvaPay Customer',
          email: user?.email,
        }),
      });

      const data = await res.json();

      if (data.success && data.account) {
        setVirtualAccount(data.account);
        localStorage.setItem(
          `zuvapay_vba_${user?.id || 'demo'}`,
          JSON.stringify(data.account)
        );
        success(
          'Virtual Account Ready!',
          `Generated ${data.account.bank_name} dedicated account for automated funding.`
        );
      } else {
        error('Generation Failed', data.error || 'Could not generate virtual account');
      }
    } catch (err: any) {
      error('Error', err.message || 'Failed to communicate with Korapay');
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
        // Real Korapay Standard Checkout
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
      const res = await fundWallet(
        numAmount,
        'Virtual Dedicated Account'
      );
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
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Instant deposit via Card &amp; Bank Transfer</p>
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
          <div className="p-6 space-y-5">
            <div className="space-y-4">
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
                      } with Card / Transfer`}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>256-bit Encrypted Banking Grade Gateway via Korapay</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
