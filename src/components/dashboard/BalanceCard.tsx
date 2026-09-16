'use client';

import React, { useState } from 'react';
import { useWallet } from '@/context/WalletContext';
import { formatNaira, formatUSD } from '@/lib/utils';
import {
  Wallet as WalletIcon,
  Eye,
  EyeOff,
  PlusCircle,
  RefreshCw,
  Sparkles,
  TrendingUp,
} from 'lucide-react';

interface BalanceCardProps {
  onFundWallet: () => void;
  onSwap: () => void;
}

export function BalanceCard({ onFundWallet, onSwap }: BalanceCardProps) {
  const { wallet, usdBalance, exchangeRate, isBalanceHidden, toggleBalanceHidden, formatBalance } = useWallet();

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-950 p-6 md:p-8 shadow-2xl backdrop-blur-xl">
      {/* Decorative gradient glow blobs */}
      <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-brand-orange/15 blur-3xl pointer-events-none" />
      <div className="absolute -left-16 -bottom-16 h-56 w-56 rounded-full bg-brand-blue/15 blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
        {/* Balances Area */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
              <WalletIcon className="h-4 w-4 text-brand-orange" />
              Wallet
            </span>
            <button
              onClick={toggleBalanceHidden}
              className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
              title={isBalanceHidden ? 'Show Balances' : 'Hide Balances'}
            >
              {isBalanceHidden ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            </button>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/20">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live Sync
            </span>
          </div>

          <div className="space-y-1">
            <h1 suppressHydrationWarning className="font-mono text-3xl font-black tracking-tight text-white md:text-5xl">
              {formatBalance(wallet?.balance || 0, 'NGN')}
            </h1>

            {/* Secondary USD balance info */}
            <div className="flex items-center gap-2 pt-1">
              <span className="text-xs text-slate-400">USD Balance:</span>
              <span suppressHydrationWarning className="font-mono text-xs md:text-sm font-bold text-emerald-400">
                {formatBalance(usdBalance, 'USD')}
              </span>
              <span className="text-[11px] text-slate-400">
                (Rate: ₦{exchangeRate.toLocaleString()}/$)
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={onFundWallet}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-brand-orange to-amber-500 hover:from-amber-600 hover:to-orange-600 px-5 py-3.5 text-xs md:text-sm font-bold text-slate-950 shadow-lg shadow-orange-500/20 transition-all active:scale-95"
          >
            <PlusCircle className="h-4 w-4 stroke-[2.5]" />
            Fund Wallet
          </button>

          <button
            onClick={onSwap}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-2xl border border-white/15 bg-slate-800/80 hover:bg-slate-800 px-5 py-3.5 text-xs md:text-sm font-bold text-white transition-all active:scale-95 hover:border-brand-orange/40"
          >
            <RefreshCw className="h-4 w-4 text-brand-orange" />
            Swap
          </button>
        </div>
      </div>
    </div>
  );
}
