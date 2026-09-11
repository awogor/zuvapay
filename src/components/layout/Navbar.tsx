'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useWallet } from '@/context/WalletContext';
import { useTheme } from '@/context/ThemeContext';
import { formatNaira, formatUSD } from '@/lib/utils';
import {
  Bell,
  Sun,
  Moon,
  Eye,
  EyeOff,
  User,
  LogOut,
  ChevronDown,
  Menu,
  ShieldCheck,
  CheckCheck,
  ArrowDownLeft,
  ArrowUpRight,
  MessageSquare,
  Zap,
  Wifi,
  Smartphone,
  Tv,
  Share2,
  Clock,
  Inbox,
} from 'lucide-react';

function getRelativeTime(dateString: string): string {
  try {
    const diffMs = Date.now() - new Date(dateString).getTime();
    const diffSec = Math.floor(diffMs / 1000);
    if (diffSec < 60) return 'Just now';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return new Date(dateString).toLocaleDateString('en-NG', { month: 'short', day: 'numeric' });
  } catch {
    return 'Recently';
  }
}

interface NavbarProps {
  onOpenMobileMenu?: () => void;
  onOpenFundModal?: () => void;
}

export function Navbar({ onOpenMobileMenu, onOpenFundModal }: NavbarProps) {
  const { user, profile, isAdmin, signOut } = useAuth();
  const effectiveUsername = profile?.username || user?.user_metadata?.username;
  const { wallet, usdBalance, transactions, openReceipt, isBalanceHidden, toggleBalanceHidden, formatBalance } = useWallet();
  const { theme, toggleTheme } = useTheme();
  const [userDropdown, setUserDropdown] = useState(false);
  const [notifDropdown, setNotifDropdown] = useState(false);
  const [lastReadTime, setLastReadTime] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('korrectpay_notifs_read_at');
      return saved ? parseInt(saved, 10) : 0;
    }
    return 0;
  });

  const recentTransactions = useMemo(() => {
    return (transactions || []).slice(0, 8);
  }, [transactions]);

  const unreadCount = useMemo(() => {
    return recentTransactions.filter((tx) => new Date(tx.created_at).getTime() > lastReadTime).length;
  }, [recentTransactions, lastReadTime]);

  const handleMarkAllRead = () => {
    const now = Date.now();
    setLastReadTime(now);
    if (typeof window !== 'undefined') {
      localStorage.setItem('korrectpay_notifs_read_at', String(now));
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 dark:border-white/10 bg-white/90 dark:bg-slate-950/80 px-4 md:px-8 backdrop-blur-md transition-colors">
      {/* Left: Mobile menu button & Live Balance Pill */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="rounded-lg p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-white md:hidden"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-slate-100 dark:bg-slate-900/90 border border-slate-200 dark:border-white/10 shadow-sm">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Wallet
          </span>
          <span suppressHydrationWarning className="font-mono text-xs md:text-sm font-bold text-slate-900 dark:text-white">
            {formatBalance(wallet?.balance || 0)}
          </span>
          <button
            onClick={toggleBalanceHidden}
            className="text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
            title={isBalanceHidden ? 'Show Balance' : 'Hide Balance'}
          >
            {isBalanceHidden ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          </button>
        </div>

        {onOpenFundModal && (
          <button
            onClick={onOpenFundModal}
            className="hidden sm:inline-flex items-center px-3 py-1.5 rounded-full bg-brand-orange/15 hover:bg-brand-orange/25 border border-brand-orange/30 text-brand-orange text-xs font-bold transition-all"
          >
            + Fund
          </button>
        )}
      </div>

      {/* Right: Notifications, Theme, User Profile */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="rounded-xl p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-all border border-slate-200/60 dark:border-white/10"
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          aria-label="Toggle Dark/Light Mode"
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400 transition-transform hover:rotate-45" />
          ) : (
            <Moon className="w-4 h-4 text-indigo-500 transition-transform hover:-rotate-12" />
          )}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => {
              setNotifDropdown(!notifDropdown);
              setUserDropdown(false);
            }}
            className="relative rounded-xl p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-white transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-brand-orange ring-2 ring-white dark:ring-slate-950 animate-pulse" />
            )}
          </button>

          {notifDropdown && (
            <>
              {/* Backdrop on mobile for clean tap-away dismiss */}
              <div
                className="fixed inset-0 z-40 bg-black/30 sm:bg-transparent"
                onClick={() => setNotifDropdown(false)}
              />

              {/* Notification Menu Container: Responsive on Mobile & Desktop */}
              <div className="fixed sm:absolute left-3 right-3 sm:left-auto sm:right-0 top-16 sm:top-full sm:mt-2 w-auto sm:w-88 md:w-96 max-h-[75dvh] sm:max-h-[480px] flex flex-col rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-white/10 bg-white/95 dark:bg-slate-900/95 p-0 shadow-2xl backdrop-blur-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                {/* Header */}
                <div className="flex-shrink-0 flex items-center justify-between px-4 py-3 sm:py-3.5 border-b border-slate-100 dark:border-white/5 bg-slate-50/90 dark:bg-slate-950/70 backdrop-blur-sm">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                      Notifications
                    </h4>
                    {unreadCount > 0 ? (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-orange/20 text-brand-orange font-bold">
                        {unreadCount} New
                      </span>
                    ) : (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-semibold">
                        All Read
                      </span>
                    )}
                  </div>

                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="text-[11px] font-semibold text-brand-orange hover:text-amber-500 flex items-center gap-1 transition-colors"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                      Mark all read
                    </button>
                  )}
                </div>

                {/* Notifications Scrollable List */}
                <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-white/5 overscroll-contain">
                  {recentTransactions.length > 0 ? (
                    recentTransactions.map((tx) => {
                      const isUnread = new Date(tx.created_at).getTime() > lastReadTime;
                      const isCredit = tx.type === 'credit';
                      return (
                        <div
                          key={tx.id}
                          onClick={() => {
                            if (openReceipt) openReceipt(tx);
                            setNotifDropdown(false);
                          }}
                          className={`p-3 sm:p-3.5 flex items-start gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors ${
                            isUnread ? 'bg-orange-500/5 dark:bg-brand-orange/5' : ''
                          }`}
                        >
                          {/* Category Icon */}
                          <div
                            className={`p-2 rounded-xl flex-shrink-0 mt-0.5 ${
                              isCredit
                                ? 'bg-emerald-500/10 text-emerald-500'
                                : tx.category === 'sms'
                                ? 'bg-rose-500/10 text-rose-500'
                                : tx.category === 'power'
                                ? 'bg-amber-500/10 text-amber-500'
                                : tx.category === 'data'
                                ? 'bg-sky-500/10 text-sky-500'
                                : tx.category === 'airtime'
                                ? 'bg-blue-500/10 text-blue-500'
                                : tx.category === 'social'
                                ? 'bg-pink-500/10 text-pink-500'
                                : 'bg-slate-500/10 text-slate-400'
                            }`}
                          >
                            {isCredit ? (
                              <ArrowDownLeft className="w-4 h-4" />
                            ) : (tx.category as string) === 'sms' ? (
                              <MessageSquare className="w-4 h-4" />
                            ) : (tx.category as string) === 'power' ? (
                              <Zap className="w-4 h-4" />
                            ) : (tx.category as string) === 'data' ? (
                              <Wifi className="w-4 h-4" />
                            ) : (tx.category as string) === 'airtime' ? (
                              <Smartphone className="w-4 h-4" />
                            ) : (tx.category as string) === 'cable' || (tx.category as string) === 'tv' ? (
                              <Tv className="w-4 h-4" />
                            ) : (tx.category as string) === 'social' ? (
                              <Share2 className="w-4 h-4" />
                            ) : (
                              <ArrowUpRight className="w-4 h-4" />
                            )}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                {tx.description || (isCredit ? 'Wallet Credited' : 'Bill Payment')}
                              </p>
                              <span
                                className={`text-xs font-mono font-bold whitespace-nowrap flex-shrink-0 ${
                                  isCredit ? 'text-emerald-500' : 'text-slate-900 dark:text-white'
                                }`}
                              >
                                {isCredit ? '+' : '-'}{formatNaira(tx.amount)}
                              </span>
                            </div>

                            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                              {tx.status === 'completed'
                                ? 'Transaction completed successfully'
                                : tx.status === 'pending'
                                ? 'Processing...'
                                : 'Failed / Reversed'}
                            </p>

                            <div className="flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                              <span className="flex items-center gap-1 font-medium">
                                <Clock className="w-3 h-3" />
                                {getRelativeTime(tx.created_at)}
                              </span>
                              <span className="font-mono text-brand-orange hover:underline">
                                View Receipt →
                              </span>
                            </div>
                          </div>

                          {isUnread && (
                            <span className="w-2 h-2 rounded-full bg-brand-orange flex-shrink-0 mt-2" />
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <div className="py-8 px-4 text-center space-y-2">
                      <div className="p-3 rounded-full bg-slate-100 dark:bg-slate-800/80 text-slate-400 w-fit mx-auto">
                        <Inbox className="w-5 h-5" />
                      </div>
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        No Recent Notifications
                      </p>
                      <p className="text-[11px] text-slate-400 max-w-xs mx-auto leading-relaxed">
                        Live alerts for wallet funding, bill payments, and OTP purchases will appear here.
                      </p>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="flex-shrink-0 p-2.5 bg-slate-50 dark:bg-slate-950/60 border-t border-slate-100 dark:border-white/5 text-center">
                  <Link
                    href="/dashboard"
                    onClick={() => setNotifDropdown(false)}
                    className="text-[11px] font-bold text-slate-600 dark:text-slate-400 hover:text-brand-orange transition-colors"
                  >
                    View All Activity on Dashboard →
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>

        {/* User profile avatar dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setUserDropdown(!userDropdown);
              setNotifDropdown(false);
            }}
            className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
          >
            <img
              src={profile?.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=KPUser'}
              alt="Avatar"
              className="h-8 w-8 rounded-full border border-slate-200 dark:border-white/20 bg-slate-100 dark:bg-slate-800 object-cover"
            />
            <div className="hidden lg:block text-left">
              <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                {profile?.first_name || 'User'}
              </p>
              <p className="text-[10px] font-mono text-brand-orange leading-tight">
                {effectiveUsername ? `@${effectiveUsername}` : 'Verified User'}
              </p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden lg:block" />
          </button>

          {userDropdown && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 p-2 shadow-xl z-50 animate-in fade-in">
              <div className="px-3 py-2 border-b border-slate-200 dark:border-white/10">
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  {profile?.title ? `${profile.title} ` : ''}{profile?.first_name} {profile?.last_name}
                </p>
                {effectiveUsername && (
                  <p className="text-[11px] font-mono font-bold text-brand-orange">
                    @{effectiveUsername}
                  </p>
                )}
              </div>

              <div className="py-1">
                <Link
                  href="/profile"
                  onClick={() => setUserDropdown(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  <User className="w-4 h-4 text-slate-400" />
                  My Profile
                </Link>
                <Link
                  href="/transactions"
                  onClick={() => setUserDropdown(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  <Clock className="w-4 h-4 text-slate-400" />
                  Transaction History
                </Link>
                {isAdmin && (
                  <Link
                    href="/admin"
                    onClick={() => setUserDropdown(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-brand-orange bg-brand-orange/10 hover:bg-brand-orange/20 transition-colors mt-1"
                  >
                    <ShieldCheck className="w-4 h-4 text-brand-orange" />
                    Admin Portal
                  </Link>
                )}
              </div>

              <div className="pt-1 border-t border-slate-200 dark:border-white/10">
                <button
                  onClick={() => {
                    setUserDropdown(false);
                    signOut();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-500 hover:bg-rose-500/10 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Log Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
