'use client';

import React from 'react';
import {
  X,
  ShieldCheck,
  CheckCircle2,
  Lock,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  Building2,
} from 'lucide-react';

interface AccountLimitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade?: () => void;
}

export function AccountLimitModal({
  isOpen,
  onClose,
  onUpgrade,
}: AccountLimitModalProps) {
  if (!isOpen) return null;

  const tiers = [
    {
      tier: 'Tier 1',
      title: 'Starter Wallet',
      isCurrent: true,
      dailyLimit: '₦50,000',
      singleLimit: '₦20,000',
      maxBalance: '₦300,000',
      requirements: ['Verified Mobile Phone', 'Verified Email Address'],
      color: 'emerald',
    },
    {
      tier: 'Tier 2',
      title: 'Standard Verified',
      isCurrent: false,
      dailyLimit: '₦500,000',
      singleLimit: '₦100,000',
      maxBalance: '₦1,000,000',
      requirements: ['BVN (Bank Verification Number)', 'National ID (NIN)'],
      color: 'amber',
    },
    {
      tier: 'Tier 3',
      title: 'Merchant & Premium',
      isCurrent: false,
      dailyLimit: '₦5,000,000+',
      singleLimit: '₦1,000,000',
      maxBalance: 'Unlimited',
      requirements: ['Government Photo ID', 'Proof of Address (Utility Bill)'],
      color: 'purple',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-lg rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-100 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-white">Account Limits</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                CBN regulatory transaction & wallet limits
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

        {/* Content */}
        <div className="p-6 space-y-4 overflow-y-auto">
          {/* Current Level Pill Banner */}
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-full bg-emerald-500 text-slate-950">
                <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">Current Tier: Tier 1 Active</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Daily transaction limit: ₦50,000</p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
              Verified
            </span>
          </div>

          {/* Tiers List */}
          <div className="space-y-3">
            {tiers.map((t, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-2xl border transition-all ${
                  t.isCurrent
                    ? 'border-emerald-500/40 bg-emerald-50/50 dark:bg-emerald-950/10 ring-1 ring-emerald-500/20'
                    : 'border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-950/40'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                        t.isCurrent
                          ? 'bg-emerald-500 text-slate-950'
                          : 'bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {t.tier}
                    </span>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">{t.title}</h4>
                  </div>
                  {t.isCurrent && (
                    <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Active Tier
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-2 py-2 border-y border-slate-100 dark:border-white/5 text-center my-2">
                  <div>
                    <span className="block text-[10px] text-slate-400 dark:text-slate-500">Daily Limit</span>
                    <span className="text-xs font-bold font-mono text-slate-900 dark:text-white">
                      {t.dailyLimit}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-400 dark:text-slate-500">Single Tx</span>
                    <span className="text-xs font-bold font-mono text-slate-900 dark:text-white">
                      {t.singleLimit}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-400 dark:text-slate-500">Max Balance</span>
                    <span className="text-xs font-bold font-mono text-slate-900 dark:text-white">
                      {t.maxBalance}
                    </span>
                  </div>
                </div>

                <div className="space-y-1 pt-1">
                  <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    Requirements
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {t.requirements.map((req, rIdx) => (
                      <span
                        key={rIdx}
                        className="inline-flex items-center gap-1 text-[10.5px] px-2 py-0.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300"
                      >
                        {t.isCurrent ? (
                          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                        ) : (
                          <Lock className="w-3 h-3 text-slate-400" />
                        )}
                        {req}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Upgrade CTA */}
          <div className="pt-2">
            <button
              onClick={() => {
                onClose();
                onUpgrade?.();
              }}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-brand-orange to-amber-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black text-xs shadow-md transition-all"
            >
              <TrendingUp className="w-4 h-4" />
              Upgrade Tier (Link BVN / NIN)
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
