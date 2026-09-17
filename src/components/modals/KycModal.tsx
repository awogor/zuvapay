'use client';

import React from 'react';
import {
  X,
  BadgeCheck,
  CheckCircle2,
  Clock,
  Shield,
  ArrowRight,
  FileCheck,
  CreditCard,
  Building,
} from 'lucide-react';

interface KycModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerifyBvn?: () => void;
}

export function KycModal({ isOpen, onClose, onVerifyBvn }: KycModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-lg rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-100 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400 flex items-center justify-center">
              <BadgeCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-white">KYC Verification</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Know Your Customer compliance status
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
          {/* Status summary banner */}
          <div className="p-4 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-teal-500 text-slate-950">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">Tier 1: Basic Identity Active</p>
                <p className="text-[11px] text-teal-700 dark:text-teal-300">
                  Your email and mobile number are verified.
                </p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-teal-500/20 text-teal-700 dark:text-teal-300 border border-teal-500/30">
              Active
            </span>
          </div>

          {/* Stepper items */}
          <div className="space-y-3 pt-1">
            {/* Step 1 */}
            <div className="p-4 rounded-2xl border border-emerald-500/30 bg-emerald-50/40 dark:bg-emerald-950/10 flex items-start gap-3.5">
              <div className="p-2 rounded-xl bg-emerald-500 text-slate-950 mt-0.5">
                <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">Tier 1 — Phone & Email</h4>
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">Completed</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Enables basic wallet funding, bill payments, airtime, and data subscriptions up to ₦50,000 daily.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="p-4 rounded-2xl border border-amber-500/30 bg-amber-50/40 dark:bg-amber-950/10 flex items-start gap-3.5">
              <div className="p-2 rounded-xl bg-amber-500 text-slate-950 mt-0.5">
                <CreditCard className="w-4 h-4 stroke-[2.5]" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">Tier 2 — BVN / NIN Verification</h4>
                  <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400">Available</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Enables dedicated virtual bank accounts (Wema, Moniepoint) with ₦500,000 daily transaction limits.
                </p>
                <button
                  onClick={() => {
                    onClose();
                    onVerifyBvn?.();
                  }}
                  className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 text-slate-950 text-[11px] font-bold hover:bg-amber-600 transition-colors shadow-sm"
                >
                  Link BVN / NIN
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Step 3 */}
            <div className="p-4 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-950/40 flex items-start gap-3.5 opacity-80">
              <div className="p-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-500 mt-0.5">
                <FileCheck className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">Tier 3 — Merchant & Full ID</h4>
                  <span className="text-[10px] font-bold text-slate-400">Locked</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Upload government ID (International Passport, Driver License, or Voter Card) and proof of address for unlimited transaction limits.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-2 text-center">
            <p className="text-[11px] text-slate-400">
              Compliant with Central Bank of Nigeria (CBN) AML & CFT Tiered KYC Regulations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
