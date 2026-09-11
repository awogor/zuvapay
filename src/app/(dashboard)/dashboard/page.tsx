'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useWallet } from '@/context/WalletContext';
import { BalanceCard } from '@/components/dashboard/BalanceCard';
import { ServicesGrid } from '@/components/dashboard/ServicesGrid';
import { RecentTransactions } from '@/components/dashboard/RecentTransactions';
import { FundWalletModal } from '@/components/modals/FundWalletModal';
import { SwapModal } from '@/components/modals/SwapModal';
import { useToast } from '@/components/common/Toast';
import { Sparkles, ArrowRight, ShieldCheck, AtSign } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { user, profile } = useAuth();
  const { success } = useToast();
  const [fundModalOpen, setFundModalOpen] = useState(false);
  const [swapModalOpen, setSwapModalOpen] = useState(false);

  const effectiveUsername = profile?.username || user?.user_metadata?.username;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Greeting */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            Hello, {profile?.title ? `${profile.title} ` : ''}{profile?.first_name || 'KorrectPay User'} 👋
          </h1>
          <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400">
            Welcome back to your unified financial and digital operations center.
          </p>
        </div>

        <div className="flex items-center gap-2 mt-2 sm:mt-0">
          <Link
            href="/services/sms"
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold hover:bg-rose-500/20 transition-all"
          >
            <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping" />
            Active SMS OTP Available
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Claim Username Prompt Banner for existing accounts without a handle */}
      {!effectiveUsername && (
        <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-amber-500/15 via-brand-orange/15 to-amber-500/10 border border-brand-orange/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg shadow-orange-500/5">
          <div className="flex items-center gap-3.5">
            <div className="h-11 w-11 rounded-2xl bg-brand-orange/20 border border-brand-orange/30 flex items-center justify-center text-brand-orange font-black text-xl flex-shrink-0">
              @
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-black text-slate-900 dark:text-white">
                  Claim your unique @username handle
                </h4>
                <span className="px-2 py-0.5 rounded text-[10px] bg-brand-orange text-slate-950 font-black uppercase tracking-wider">
                  New
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                Enable 1-click @username transfers, receive payments directly to your handle, and prepare for KorrectPay Commerce.
              </p>
            </div>
          </div>
          <Link
            href="/profile?action=claim_username"
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-orange to-amber-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black text-xs transition-all flex items-center gap-2 flex-shrink-0 shadow-md shadow-orange-500/20 whitespace-nowrap"
          >
            Claim Handle Now
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* Balance Card */}
      <BalanceCard
        onFundWallet={() => setFundModalOpen(true)}
        onSwap={() => setSwapModalOpen(true)}
      />

      {/* Services Grid */}
      <ServicesGrid />

      {/* Recent Transactions Feed */}
      <div className="pt-2">
        <RecentTransactions limit={6} showFilters={true} />
      </div>

      {/* Embedded Modals */}
      <FundWalletModal
        isOpen={fundModalOpen}
        onClose={() => setFundModalOpen(false)}
      />
      <SwapModal
        isOpen={swapModalOpen}
        onClose={() => setSwapModalOpen(false)}
      />
    </div>
  );
}
