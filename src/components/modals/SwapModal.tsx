'use client';

import React, { useState } from 'react';
import { useWallet } from '@/context/WalletContext';
import { useToast } from '@/components/common/Toast';
import { formatNaira, formatUSD } from '@/lib/utils';
import { X, ArrowDownUp, RefreshCw } from 'lucide-react';

interface SwapModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SwapModal({ isOpen, onClose }: SwapModalProps) {
  const { wallet, usdBalance, swapCurrency, exchangeRate, formatBalance } = useWallet();
  const { success, error } = useToast();
  const [direction, setDirection] = useState<'NGN_TO_USD' | 'USD_TO_NGN'>('NGN_TO_USD');
  const [amount, setAmount] = useState<string>('15500');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const numAmount = parseFloat(amount) || 0;
  const converted =
    direction === 'NGN_TO_USD'
      ? Number((numAmount / exchangeRate).toFixed(2))
      : Number((numAmount * exchangeRate).toFixed(2));

  const toggleDirection = () => {
    setDirection((prev) => (prev === 'NGN_TO_USD' ? 'USD_TO_NGN' : 'NGN_TO_USD'));
    setAmount('');
  };

  const handleSwap = async () => {
    if (numAmount <= 0) {
      error('Invalid Amount', 'Enter a valid positive amount to swap');
      return;
    }

    if (direction === 'NGN_TO_USD' && (wallet?.balance || 0) < numAmount) {
      error('Insufficient Funds', 'Your NGN balance is lower than the amount to swap.');
      return;
    }

    if (direction === 'USD_TO_NGN' && usdBalance < numAmount) {
      error('Insufficient Funds', 'Your USD balance is lower than the amount to swap.');
      return;
    }

    setLoading(true);
    try {
      const res = await swapCurrency(
        direction === 'NGN_TO_USD' ? 'NGN' : 'USD',
        direction === 'NGN_TO_USD' ? 'USD' : 'NGN',
        numAmount,
        exchangeRate
      );

      if (res.success) {
        success(
          'Currency Swapped Successfully!',
          direction === 'NGN_TO_USD'
            ? `Swapped ${formatNaira(numAmount)} for ${formatUSD(converted)}`
            : `Swapped ${formatUSD(numAmount)} for ${formatNaira(converted)}`
        );
        onClose();
      } else {
        error('Swap Failed', res.error || 'Could not complete swap');
      }
    } catch (err: any) {
      error('Swap Error', err.message || 'An error occurred during currency swap');
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
      <div className="relative w-full max-w-md max-h-[88dvh] sm:max-h-[90dvh] flex flex-col overflow-hidden rounded-t-[28px] sm:rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-200">
        {/* Top brand accent bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-brand-orange via-amber-500 to-brand-blue flex-shrink-0" />

        {/* Mobile Drag Indicator */}
        <div className="sm:hidden pt-2.5 pb-1 flex justify-center flex-shrink-0 bg-transparent">
          <div className="w-10 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
        </div>

        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between px-5 sm:px-6 pt-3 sm:pt-4 pb-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-brand-orange/10 border border-brand-orange/20 text-brand-orange shadow-xs">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">Instant Currency Swap</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Exchange between NGN & USD balances</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 overscroll-contain">
          {/* Rate ticker */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 text-xs">
            <span className="text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5 font-semibold">
              Live Mid-Market Rate:
            </span>
            <span className="font-mono font-black text-emerald-700 dark:text-emerald-400 text-sm">
              1 USD = ₦{exchangeRate.toLocaleString()} NGN
            </span>
          </div>

          {/* From Input */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2.5">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500 dark:text-slate-400 font-semibold">You Pay</span>
              <span className="text-slate-700 dark:text-slate-300 font-bold">
                Balance:{' '}
                {direction === 'NGN_TO_USD'
                  ? formatBalance(wallet?.balance || 0, 'NGN')
                  : formatBalance(usdBalance, 'USD')}
              </span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full !bg-transparent border-0 !p-0 text-2xl font-black text-slate-900 dark:text-white focus:outline-none focus:ring-0 placeholder-slate-400 dark:placeholder-slate-600 shadow-none"
              />
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-white shadow-xs flex-shrink-0">
                <span>{direction === 'NGN_TO_USD' ? '🇳🇬 NGN' : '🇺🇸 USD'}</span>
              </div>
            </div>
          </div>

          {/* Toggle Direction Button */}
          <div className="flex justify-center -my-2 relative z-10">
            <button
              onClick={toggleDirection}
              className="p-2.5 rounded-full bg-brand-orange hover:bg-orange-600 text-white shadow-md shadow-orange-500/25 transition-transform hover:rotate-180 duration-300 active:scale-95"
              title="Reverse Swap Direction"
            >
              <ArrowDownUp className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>

          {/* To Input (Calculated) */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2.5">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500 dark:text-slate-400 font-semibold">You Receive (Estimated)</span>
              <span className="text-slate-700 dark:text-slate-300 font-bold">
                Balance:{' '}
                {direction === 'NGN_TO_USD'
                  ? formatBalance(usdBalance, 'USD')
                  : formatBalance(wallet?.balance || 0, 'NGN')}
              </span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                {direction === 'NGN_TO_USD'
                  ? formatUSD(converted)
                  : formatNaira(converted)}
              </span>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-white shadow-xs flex-shrink-0">
                <span>{direction === 'NGN_TO_USD' ? '🇺🇸 USD' : '🇳🇬 NGN'}</span>
              </div>
            </div>
          </div>

          {/* Action button */}
          <div className="pt-2">
            <button
              onClick={handleSwap}
              disabled={loading || numAmount <= 0}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-brand-orange to-amber-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-orange-500/20 disabled:opacity-50"
            >
              {loading ? 'Processing Swap...' : 'Confirm Currency Swap'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
