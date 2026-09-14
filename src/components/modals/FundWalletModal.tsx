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
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-lg max-h-[88dvh] sm:max-h-[90dvh] flex flex-col overflow-hidden rounded-t-[28px] sm:rounded-3xl border border-white/10 bg-slate-900 shadow-2xl animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-200">
        {/* Mobile Drag Indicator */}
        <div className="sm:hidden pt-2.5 pb-1 flex justify-center flex-shrink-0 bg-slate-900">
          <div className="w-10 h-1 rounded-full bg-slate-700" />
        </div>

        {/* Header - Fixed at Top */}
        <div className="flex-shrink-0 flex items-center justify-between px-5 sm:px-6 pt-3 sm:pt-5 pb-3 border-b border-white/10">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white">Fund ZuvaPay Wallet</h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          <div className="p-6 space-y-5">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Amount to Fund (₦)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-400">
                    ₦
                  </span>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="e.g. 5000"
                    className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-brand-orange text-sm font-semibold"
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
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                      amount === amt.toString()
                        ? 'bg-brand-orange/20 border-brand-orange text-brand-orange'
                        : 'border-white/10 bg-slate-800/50 text-slate-300 hover:border-white/20'
                    }`}
                  >
                    {formatNaira(amt)}
                  </button>
                ))}
              </div>

              {/* Action */}
              <div className="pt-2">
                <button
                  onClick={handleDeposit}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-brand-orange to-amber-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-bold text-sm transition-all shadow-lg hover:shadow-orange-500/20 disabled:opacity-50"
                >
                  <CreditCard className="w-4 h-4" />
                  {loading ? 'Opening Checkout...' : 'Pay with Card / Bank Transfer'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>256-bit Encrypted Banking Grade Gateway via Korapay</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
