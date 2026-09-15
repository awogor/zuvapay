'use client';

import React, { useState } from 'react';
import { useWallet } from '@/context/WalletContext';
import { formatNaira, formatDate } from '@/lib/utils';
import { Transaction, TransactionCategory } from '@/types';
import {
  Smartphone,
  Wifi,
  Zap,
  Tv,
  MessageSquareCode,
  TrendingUp,
  ShoppingBag,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowRightLeft,
  CreditCard,
  Search,
  ExternalLink,
} from 'lucide-react';

interface RecentTransactionsProps {
  limit?: number;
  showFilters?: boolean;
}

function sanitizeDescription(desc?: string | null): string {
  if (!desc) return '';
  return desc
    .replace(/https?:\/\/[^\s)]+/g, '')
    .replace(/You can request access here:\s*/gi, '')
    .replace(/smspool\.net|smspool|grizzlysms|grizzly|momo|fadded|gongoz/gi, 'provider')
    .replace(/\s+/g, ' ')
    .replace(/\(\s*\)/g, '')
    .trim();
}

function renderFormattedDescription(text: string) {
  const refMatch = text.match(/(\[Ref:\s*[^\]]+\])/);
  if (!refMatch) return text;

  const parts = text.split(refMatch[0]);
  return (
    <>
      {parts[0]}
      <span className="font-mono font-medium text-amber-600 dark:text-brand-orange">
        {refMatch[0]}
      </span>
      {parts[1]}
    </>
  );
}

export function RecentTransactions({ limit = 5, showFilters = true }: RecentTransactionsProps) {
  const { transactions, openReceipt } = useWallet();
  const [filter, setFilter] = useState<'all' | 'credit' | 'debit'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const getCategoryIcon = (category: TransactionCategory, type: string) => {
    switch (category) {
      case 'airtime':
        return <Smartphone className="w-3.5 h-3.5 text-amber-400" />;
      case 'data':
        return <Wifi className="w-3.5 h-3.5 text-sky-400" />;
      case 'power':
        return <Zap className="w-3.5 h-3.5 text-emerald-400" />;
      case 'cable':
        return <Tv className="w-3.5 h-3.5 text-purple-400" />;
      case 'sms':
        return <MessageSquareCode className="w-3.5 h-3.5 text-rose-400" />;
      case 'social':
        return <TrendingUp className="w-3.5 h-3.5 text-pink-400" />;
      case 'logs':
        return <ShoppingBag className="w-3.5 h-3.5 text-cyan-400" />;
      case 'swap':
        return <ArrowRightLeft className="w-3.5 h-3.5 text-indigo-400" />;
      case 'card':
      case 'virtual_card':
      case 'virtual_card_topup':
        return <CreditCard className="w-3.5 h-3.5 text-amber-400" />;
      default:
        return type === 'credit' ? (
          <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-400" />
        ) : (
          <ArrowUpRight className="w-3.5 h-3.5 text-rose-400" />
        );
    }
  };

  const filtered = transactions
    .filter((tx) => {
      if (filter !== 'all' && tx.type !== filter) return false;
      if (searchTerm) {
        const query = searchTerm.toLowerCase();
        return (
          tx.description?.toLowerCase().includes(query) ||
          tx.reference.toLowerCase().includes(query) ||
          tx.category.toLowerCase().includes(query)
        );
      }
      return true;
    })
    .slice(0, limit);

  return (
    <div className="rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900/70 p-4 sm:p-6 backdrop-blur-xl shadow-sm space-y-4 overflow-hidden">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-base md:text-lg font-bold text-slate-900 dark:text-white">Recent Transactions</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Click any transaction to view or copy receipt details
          </p>
        </div>

        {showFilters && (
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-950/80 border border-slate-200 dark:border-white/5 text-xs font-semibold">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-lg transition-all ${
                filter === 'all'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('credit')}
              className={`px-3 py-1 rounded-lg transition-all ${
                filter === 'credit'
                  ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Credits
            </button>
            <button
              onClick={() => setFilter('debit')}
              className={`px-3 py-1 rounded-lg transition-all ${
                filter === 'debit'
                  ? 'bg-rose-500/20 text-rose-700 dark:text-rose-400 font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Debits
            </button>
          </div>
        )}
      </div>

      {/* Transactions List */}
      <div className="divide-y divide-slate-100 dark:divide-white/5">
        {filtered.length === 0 ? (
          <div className="py-12 text-center text-slate-400">
            <p className="text-sm font-medium">No transactions found</p>
            <p className="text-xs text-slate-500 mt-1">
              Your activity across web and mobile will appear here automatically.
            </p>
          </div>
        ) : (
          filtered.map((tx) => {
            const isCredit = tx.type === 'credit';
            return (
              <div
                key={tx.id}
                onClick={() => openReceipt(tx)}
                className="group flex items-start justify-between gap-2.5 sm:gap-4 py-3 px-1 sm:px-2 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors overflow-hidden"
              >
                {/* Left content with icon and description */}
                <div className="flex items-start gap-2.5 sm:gap-3 flex-1 min-w-0">
                  <div
                    className={`flex h-8 w-8 sm:h-9 sm:w-9 flex-shrink-0 items-center justify-center rounded-xl border mt-0.5 ${
                      isCredit
                        ? 'border-emerald-500/20 bg-emerald-500/10'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800/80'
                    }`}
                  >
                    {getCategoryIcon(tx.category, tx.type)}
                  </div>
                  <div className="flex-1 min-w-0 max-w-sm sm:max-w-md md:max-w-lg pr-4">
                    <p className="text-[9.5px] sm:text-[11px] font-normal leading-relaxed text-slate-700 dark:text-slate-300 break-words group-hover:text-brand-orange transition-colors">
                      {renderFormattedDescription(sanitizeDescription(tx.description) || tx.category)}
                    </p>
                    <div className="flex flex-wrap items-center gap-1.5 text-[8.5px] sm:text-[9px] text-slate-400 dark:text-slate-500 mt-1">
                      <span className="font-mono font-medium text-amber-600 dark:text-brand-orange">
                        {tx.reference}
                      </span>
                      <span>•</span>
                      <span>{formatDate(tx.created_at)}</span>
                      {(tx.metadata?.delivery || tx.metadata?.credentials) && (
                        <>
                          <span>•</span>
                          <span className="px-1.5 py-0.5 rounded-full bg-purple-500/15 text-purple-600 dark:text-purple-300 font-bold border border-purple-500/30">
                            License / Key Ready
                          </span>
                        </>
                      )}
                      {(tx.metadata?.token || tx.metadata?.meter_token || tx.metadata?.electricity_token) && (
                        <>
                          <span>•</span>
                          <span className="px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-300 font-bold border border-amber-500/30">
                            Token Generated
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right content with amount and badge */}
                <div className="text-right flex-shrink-0 flex flex-col items-end justify-start pl-1">
                  <p
                    className={`font-mono text-[11px] sm:text-xs font-bold whitespace-nowrap ${
                      isCredit ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'
                    }`}
                  >
                    {isCredit ? '+' : '-'}
                    {formatNaira(tx.amount)}
                  </p>
                  <span
                    className={`inline-block mt-0.5 text-[8.5px] sm:text-[9px] font-semibold px-1.5 py-0.5 rounded capitalize whitespace-nowrap ${
                      tx.status === 'completed'
                        ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20'
                        : tx.status === 'pending'
                        ? 'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20'
                        : 'text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20'
                    }`}
                  >
                    {tx.status}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
