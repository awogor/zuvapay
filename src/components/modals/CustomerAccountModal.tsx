'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useWallet } from '@/context/WalletContext';
import { useToast } from '@/components/common/Toast';
import { VirtualAccount } from '@/types';
import {
  X,
  Building2,
  Copy,
  Check,
  ShieldCheck,
  Zap,
  ArrowRight,
  RefreshCw,
  Info,
  CheckCircle2,
} from 'lucide-react';

interface CustomerAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenFundWallet?: () => void;
}

const SUPPORTED_BANKS = [
  {
    code: '9PSB',
    name: '9PSB Bank',
    tag: 'Zero KYC Required',
    badge: 'Default Account',
    description: 'Instant settlement rail with automated real-time wallet crediting.',
  },
  {
    code: 'PROVIDUS',
    name: 'Providus Bank',
    tag: 'Commercial Rails',
    badge: 'Alternative',
    description: 'Commercial bank virtual account powered by Providus Bank.',
  },
  {
    code: 'PALMPAY',
    name: 'PalmPay',
    tag: 'NIN / BVN Required',
    badge: 'Fintech Rail',
    description: 'Direct PalmPay virtual account for seamless transfers.',
  },
] as const;

export function CustomerAccountModal({
  isOpen,
  onClose,
  onOpenFundWallet,
}: CustomerAccountModalProps) {
  const { user, profile } = useAuth();
  const { openFundModal } = useWallet();
  const { success } = useToast();

  const [accounts, setAccounts] = useState<VirtualAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedAccount, setCopiedAccount] = useState<string | null>(null);

  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/wallet/virtual-account');
      const data = await res.json();
      if (data.success) {
        if (data.accounts && Array.isArray(data.accounts)) {
          setAccounts(data.accounts);
        } else if (data.account) {
          setAccounts([data.account]);
        }
      }
    } catch (err: any) {
      console.warn('Error fetching customer virtual accounts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchAccounts();
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const defaultAccount =
    accounts.find((a) => (a.bank_code || '').toUpperCase() === '9PSB') ||
    accounts[0];

  const handleCopy = (accNumber: string, label: string) => {
    navigator.clipboard.writeText(accNumber);
    setCopiedAccount(accNumber);
    success('Account Copied', `${label} (${accNumber}) copied to clipboard!`);
    setTimeout(() => setCopiedAccount(null), 2500);
  };

  const handleGoToFundWallet = () => {
    onClose();
    if (onOpenFundWallet) {
      onOpenFundWallet();
    } else {
      openFundModal();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-lg rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-white/10 bg-slate-50/50 dark:bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-orange/10 text-brand-orange flex items-center justify-center flex-shrink-0">
              <Building2 className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-slate-900 dark:text-white">Customer Account</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  Dedicated
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Your dedicated virtual bank accounts for automatic deposits
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-3">
              <RefreshCw className="w-8 h-8 text-brand-orange animate-spin" />
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Loading your dedicated bank accounts...
              </p>
            </div>
          ) : defaultAccount ? (
            <>
              {/* Default Dedicated Bank Card */}
              <div className="relative overflow-hidden rounded-3xl border-2 border-brand-orange/40 bg-gradient-to-br from-[#FFF9F3] via-white to-[#FFF3E6] dark:from-orange-950/20 dark:via-slate-900 dark:to-slate-900 p-5 shadow-sm space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-brand-orange text-slate-950">
                        Default Account
                      </span>
                      <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Active
                      </span>
                    </div>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white mt-1">
                      {defaultAccount.bank_name || '9PSB Bank'}
                    </h3>
                  </div>
                  <div className="w-10 h-10 rounded-2xl bg-brand-orange/15 text-brand-orange flex items-center justify-center">
                    <Building2 className="w-5 h-5" />
                  </div>
                </div>

                {/* Account Number Box */}
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-950/70 border border-brand-orange/20 flex items-center justify-between shadow-sm">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Account Number
                    </span>
                    <span className="text-2xl font-black font-mono tracking-wider text-slate-900 dark:text-white">
                      {defaultAccount.account_number}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(defaultAccount.account_number, defaultAccount.bank_name)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-brand-orange hover:bg-orange-600 text-slate-950 font-bold text-xs transition-colors active:scale-95 shadow-sm"
                  >
                    {copiedAccount === defaultAccount.account_number ? (
                      <>
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Account Name and Pricing Details */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200/70 dark:border-white/5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Account Name
                    </span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 truncate block mt-0.5">
                      {defaultAccount.account_name ||
                        (profile ? `${profile.first_name} ${profile.last_name}` : 'ZuvaPay Customer')}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200/70 dark:border-white/5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Deposit Fee
                    </span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400 block mt-0.5">
                      ₦50 Flat Fee
                    </span>
                  </div>
                </div>
              </div>

              {/* Other Virtual Accounts or Alternative Rails */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between px-1">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    All Assigned Bank Rails
                  </h4>
                  <span className="text-[11px] text-slate-400">Multi-Bank Redundancy</span>
                </div>

                <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50/60 dark:bg-slate-950/40 divide-y divide-slate-100 dark:divide-white/5 overflow-hidden">
                  {SUPPORTED_BANKS.map((bankDef) => {
                    const matchedAcc = accounts.find(
                      (a) => (a.bank_code || '').toUpperCase() === bankDef.code.toUpperCase()
                    );
                    const isDefault = bankDef.code === '9PSB';

                    return (
                      <div key={bankDef.code} className="p-3.5 flex items-center justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-slate-900 dark:text-white">
                              {bankDef.name}
                            </span>
                            {isDefault ? (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-brand-orange/15 text-brand-orange border border-brand-orange/30">
                                Default
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                                {bankDef.badge}
                              </span>
                            )}
                          </div>
                          {matchedAcc ? (
                            <p className="font-mono text-xs font-semibold text-slate-700 dark:text-slate-300 mt-0.5">
                              {matchedAcc.account_number}
                            </p>
                          ) : (
                            <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                              {bankDef.description}
                            </p>
                          )}
                        </div>

                        {matchedAcc ? (
                          <button
                            type="button"
                            onClick={() => handleCopy(matchedAcc.account_number, bankDef.name)}
                            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-white/10 transition-colors"
                            title="Copy Account Number"
                          >
                            {copiedAccount === matchedAcc.account_number ? (
                              <Check className="w-4 h-4 text-emerald-500 stroke-[3]" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={handleGoToFundWallet}
                            className="px-2.5 py-1 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-[11px] font-bold text-slate-700 dark:text-slate-300 transition-colors"
                          >
                            Provision
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* How it Works / Instructions */}
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs space-y-2">
                <div className="flex items-center gap-2 font-bold text-amber-800 dark:text-amber-400">
                  <Zap className="w-4 h-4 text-brand-orange flex-shrink-0" />
                  <span>Real-Time Automated Settlement</span>
                </div>
                <p className="text-[11px] leading-relaxed text-slate-600 dark:text-slate-400">
                  Transfer funds from any Nigerian banking app (OPay, Kuda, GTBank, Zenith, Access, Moniepoint, etc.) directly to your account number above. Your ZuvaPay NGN wallet will be credited automatically within seconds.
                </p>
              </div>
            </>
          ) : (
            <div className="py-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 mx-auto flex items-center justify-center text-slate-400">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                No Virtual Account Found Yet
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                Click below to provision your dedicated 9PSB virtual bank account instantly with zero KYC.
              </p>
              <button
                type="button"
                onClick={handleGoToFundWallet}
                className="px-4 py-2.5 rounded-xl bg-brand-orange hover:bg-orange-600 text-slate-950 font-bold text-xs transition-colors inline-flex items-center gap-1.5"
              >
                <span>Provision Bank Account</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 dark:border-white/10 bg-slate-50/50 dark:bg-slate-950/40 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={fetchAccounts}
            disabled={loading}
            className="p-2.5 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-white/10 transition-colors flex items-center gap-1.5 text-xs font-semibold"
            title="Refresh Account Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-white/5 transition-colors"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handleGoToFundWallet}
              className="px-5 py-2.5 rounded-xl bg-brand-orange hover:bg-orange-600 text-slate-950 font-bold text-xs transition-all shadow-md flex items-center gap-1.5 active:scale-95"
            >
              <span>Deposit / Fund Wallet</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
