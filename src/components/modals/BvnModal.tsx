'use client';

import React, { useState } from 'react';
import {
  X,
  CreditCard,
  ShieldCheck,
  Lock,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Loader2,
  Building,
} from 'lucide-react';
import { useToast } from '@/components/common/Toast';

interface BvnModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BvnModal({ isOpen, onClose }: BvnModalProps) {
  const { success, error } = useToast();
  const [bvn, setBvn] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLinked, setIsLinked] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = bvn.replace(/\D/g, '');
    if (clean.length !== 11) {
      error('Invalid BVN', 'Your BVN must be exactly 11 numeric digits.');
      return;
    }

    setLoading(true);
    // Simulate verification delay
    setTimeout(() => {
      setLoading(false);
      setIsLinked(true);
      success('BVN Verified Successfully', 'Your account has been upgraded to Tier 2 limits!');
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-lg rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-white">BVN Information</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Manage your Bank Verification Number
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
        <div className="p-6 space-y-5 overflow-y-auto">
          {/* Security & Privacy Card */}
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-2">
            <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300 font-bold text-xs">
              <ShieldCheck className="w-4 h-4 text-amber-500" />
              <span>CBN Regulatory Requirement</span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
              In accordance with Central Bank of Nigeria (CBN) regulations, your BVN is strictly used to verify your identity and generate dedicated NUBAN bank accounts for automated wallet deposits.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-white/10 flex items-start gap-3">
            <Lock className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
            <div className="text-[11px] text-slate-600 dark:text-slate-300 space-y-1">
              <p className="font-bold text-slate-900 dark:text-white">Your Privacy is Protected</p>
              <p>
                ZuvaPay <strong>never</strong> has access to your bank balance or funds. We only cross-reference your full name and date of birth against the NIBSS regulatory registry.
              </p>
            </div>
          </div>

          {isLinked ? (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-emerald-500 text-slate-950 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
              </div>
              <h4 className="text-xs font-bold text-emerald-700 dark:text-emerald-300">
                BVN Successfully Verified
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                BVN: 222 •••••••• 89
              </p>
              <button
                onClick={onClose}
                className="mt-2 px-5 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold"
              >
                Close
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  11-Digit BVN
                </label>
                <div className="relative">
                  <CreditCard className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    inputMode="numeric"
                    maxLength={11}
                    value={bvn}
                    onChange={(e) => setBvn(e.target.value.replace(/\D/g, ''))}
                    placeholder="Enter 11-digit BVN"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs font-mono tracking-widest focus:outline-none focus:border-brand-orange"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Dial <strong>*565*0#</strong> on your registered SIM to retrieve your BVN.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading || bvn.length !== 11}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-brand-orange to-amber-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black text-xs shadow-md transition-all disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying with NIBSS...</span>
                  </>
                ) : (
                  <span>Verify BVN & Upgrade Account</span>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
