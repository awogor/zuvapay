'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useWallet } from '@/context/WalletContext';
import { useToast } from '@/components/common/Toast';
import { formatNaira, formatUSD, formatDate } from '@/lib/utils';
import {
  Users,
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  Activity,
  ShieldCheck,
  Search,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Lock,
  UserCheck,
  ShieldAlert,
  Sliders,
  DollarSign,
  Zap,
  FileText,
  RotateCcw,
  BookOpen,
} from 'lucide-react';
import Link from 'next/link';
import { AdminTransactionModal } from '@/components/modals/AdminTransactionModal';
import { AdminUserModal } from '@/components/modals/AdminUserModal';
import { GongozPricingModal } from '@/components/admin/GongozPricingModal';
import { FaddedPricingModal } from '@/components/admin/FaddedPricingModal';
import { MomoPricingModal } from '@/components/admin/MomoPricingModal';
import { SMSPricingModal } from '@/components/admin/SMSPricingModal';
import { AdminEmailTab } from '@/components/admin/AdminEmailTab';
import { AdminBusinessDocsTab } from '@/components/admin/AdminBusinessDocsTab';

function renderFormattedDescription(text: string) {
  if (!text) return null;
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

export default function AdminDashboardPage() {
  const { user, profile, isAdmin } = useAuth();
  const { wallet, refreshWallet, recordManualAdjustment } = useWallet();
  const { success, error, info } = useToast();
  const searchParams = useSearchParams();
  const urlTab = searchParams.get('tab');

  const [stats, setStats] = useState<any>(null);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'adjust' | 'vendors' | 'reports' | 'email' | 'business-docs'>('overview');
  const [selectedAuditTx, setSelectedAuditTx] = useState<any | null>(null);
  const [selectedDetailUser, setSelectedDetailUser] = useState<any | null>(null);
  const [openGongozModal, setOpenGongozModal] = useState(false);
  const [openFaddedModal, setOpenFaddedModal] = useState(false);
  const [openMomoModal, setOpenMomoModal] = useState(false);
  const [openSMSModal, setOpenSMSModal] = useState(false);
  const [smsModalProvider, setSmsModalProvider] = useState<'grizzly' | 'smspool'>('grizzly');

  const getTxUser = (walletId: string, tx?: any) => {
    // 1. Check usersList matched by wallet id or user id
    const found = usersList.find((u) => u.wallets?.some((w: any) => w.id === walletId) || (tx?.user_id && u.id === tx.user_id));
    if (found) {
      if (!found.email && tx?.user_email) {
        return { ...found, email: tx.user_email };
      }
      return found;
    }

    // 2. Check if transaction matches current logged in admin / user
    if (wallet && wallet.id === walletId && user) {
      return {
        id: user.id,
        first_name: profile?.first_name || 'Admin',
        last_name: profile?.last_name || '',
        email: user.email,
        phone_number: profile?.phone_number || '',
      };
    }

    // 3. Fallback to enriched user metadata on transaction
    if (tx?.user_email || tx?.user_name) {
      return {
        id: tx.user_id || 'N/A',
        first_name: tx.user_name || 'User',
        last_name: '',
        email: tx.user_email,
        phone_number: tx.user_phone || '',
      };
    }

    if (walletId === '26e7d4d2-eaa0-4e71-9708-a61e19752240') {
      return {
        id: 'a89f4ebe-f79a-4e06-8756-ab93c950c01a',
        first_name: 'Awogor',
        last_name: 'Matthew',
        email: 'awogorm@gmail.com',
        phone_number: '07012665024',
      };
    }

    return null;
  };

  useEffect(() => {
    if (urlTab && ['overview', 'users', 'adjust', 'vendors', 'reports', 'email', 'business-docs'].includes(urlTab)) {
      setActiveTab(urlTab as any);
    } else if (!urlTab) {
      setActiveTab('overview');
    }
  }, [urlTab]);

  // Manual Adjustment State
  const [adjustWalletId, setAdjustWalletId] = useState('');
  const [adjustAction, setAdjustAction] = useState<'credit' | 'debit'>('credit');
  const [adjustAmount, setAdjustAmount] = useState('');
  const [adjustReason, setAdjustReason] = useState('');
  const [adjustLoading, setAdjustLoading] = useState(false);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [resStats, resUsers] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/admin/users'),
      ]);

      const dataStats = await resStats.json();
      const dataUsers = await resUsers.json();

      if (dataStats.success) {
        setStats(dataStats.stats);
      }
      if (dataUsers.success) {
        setUsersList(dataUsers.users || []);
      }
    } catch (err: any) {
      error('Data Load Error', err.message || 'Failed to fetch admin metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleRoleChange = async (targetUserId: string, newRole: 'admin' | 'customer') => {
    try {
      info('Updating Role', `Changing role to ${newRole}...`);
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUserId, role: newRole }),
      });

      const data = await res.json();
      if (data.success) {
        success('Role Updated', data.message);
        loadAdminData();
      } else {
        error('Update Failed', data.error);
      }
    } catch (err: any) {
      error('Error', err.message || 'Failed to change role');
    }
  };

  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustWalletId || !adjustAmount) {
      error('Missing Information', 'Select a wallet and enter an amount');
      return;
    }

    setAdjustLoading(true);
    try {
      const res = await fetch('/api/admin/wallet-adjust', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletId: adjustWalletId,
          action: adjustAction,
          amount: adjustAmount,
          reason: adjustReason,
        }),
      });

      const data = await res.json();
      if (data.success) {
        success('Adjustment Complete', data.message);

        // Check if the adjusted wallet is the active user/admin's wallet
        const isCurrentAdminWallet =
          !wallet ||
          adjustWalletId === wallet.id ||
          adjustWalletId.includes(user?.id || '') ||
          adjustWalletId === 'mock-wallet-00000000-0000-0000-0000-000000000001' ||
          usersList.find((u) => u.id === user?.id)?.wallets?.some((w: any) => w.id === adjustWalletId);

        if (isCurrentAdminWallet && recordManualAdjustment) {
          await recordManualAdjustment({
            walletId: adjustWalletId,
            amount: parseFloat(adjustAmount),
            action: adjustAction,
            reason: adjustReason,
            reference: data.reference,
            newBalance: data.newBalance,
          });
        } else {
          await refreshWallet();
        }

        // Immediately update the wallet balance in usersList state so the table immediately reflects it
        setUsersList((prev) =>
          prev.map((u) => {
            const hasWallet = u.wallets?.some((w: any) => w.id === adjustWalletId);
            if (!hasWallet) return u;
            return {
              ...u,
              wallets: u.wallets.map((w: any) => {
                if (w.id !== adjustWalletId) return w;
                const oldBal = parseFloat(w.balance || 0);
                const delta = adjustAction === 'credit' ? parseFloat(adjustAmount) : -parseFloat(adjustAmount);
                const updatedBal = data.newBalance !== undefined ? data.newBalance : Math.max(0, oldBal + delta);
                return { ...w, balance: updatedBal };
              }),
            };
          })
        );

        setAdjustAmount('');
        setAdjustReason('');
        loadAdminData();
      } else {
        error('Adjustment Failed', data.error);
      }
    } catch (err: any) {
      error('Error', err.message || 'Failed to execute adjustment');
    } finally {
      setAdjustLoading(false);
    }
  };

  const filteredUsers = usersList.filter((u) => {
    const term = searchTerm.toLowerCase();
    const fullName = `${u.first_name || ''} ${u.last_name || ''}`.toLowerCase();
    const phone = (u.phone_number || '').toLowerCase();
    const role = (u.role || '').toLowerCase();
    return fullName.includes(term) || phone.includes(term) || role.includes(term);
  });

  return (
    <div className="space-y-8 animate-in fade-in">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-brand-orange/30 shadow-sm transition-colors">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-brand-orange/15 text-brand-orange dark:bg-brand-orange dark:text-slate-950 font-black text-[10px] uppercase tracking-wider border border-brand-orange/30">
              Super Admin Portal
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
              ZuvaPay Operations Console
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Platform Administration
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Manage users, inspect platform liquidity, audit transactions, and configure vendor health.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Link
            href="/admin?tab=business-docs"
            onClick={() => setActiveTab('business-docs')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-bold transition-all shadow-sm ${
              activeTab === 'business-docs'
                ? 'bg-brand-orange text-slate-950 border-brand-orange'
                : 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            Operations & Business Manual
          </Link>

          <button
            onClick={loadAdminData}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-white/10 text-xs font-bold text-slate-800 dark:text-white transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh Telemetry
          </button>
          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs hover:opacity-90 transition-all shadow-md"
          >
            Return to App
          </Link>
        </div>
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 shadow-sm backdrop-blur-xl space-y-2">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                <span className="text-xs font-semibold">Total Registered Users</span>
                <Users className="w-4 h-4 text-sky-500" />
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white">{stats?.totalUsers || 0}</p>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">Live Database Accounts</p>
            </div>

            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 shadow-sm backdrop-blur-xl space-y-2">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                <span className="text-xs font-semibold">Total NGN Liquidity</span>
                <Wallet className="w-4 h-4 text-emerald-500" />
              </div>
              <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                {formatNaira(stats?.totalNgnBalance || 0)}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">User Wallet Balances</p>
            </div>

            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 shadow-sm backdrop-blur-xl space-y-2">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                <span className="text-xs font-semibold">Total USD Liquidity</span>
                <DollarSign className="w-4 h-4 text-indigo-500" />
              </div>
              <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                {formatUSD(stats?.totalUsdBalance || 0)}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Multi-currency Reserves</p>
            </div>

            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 shadow-sm backdrop-blur-xl space-y-2">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                <span className="text-xs font-semibold">Platform Transactions</span>
                <Activity className="w-4 h-4 text-amber-500" />
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white">
                {stats?.totalTransactions || 0}
              </p>
              <p className="text-[11px] text-brand-orange font-semibold">Processed Events</p>
            </div>
          </div>

          {/* Recent Audit Feed */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                  Recent System Transactions Audit
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Click any transaction to inspect provider telemetry, wholesale cost, and order reference.
                </p>
              </div>
            </div>
            {stats?.recentTransactions && stats.recentTransactions.length > 0 ? (
              <div className="divide-y divide-slate-100 dark:divide-white/5">
                {stats.recentTransactions.map((tx: any) => {
                  const isTxRefund =
                    tx.category === 'refund' ||
                    tx.reference?.startsWith('KP-REF') ||
                    (tx.description || '').toLowerCase().startsWith('refund');

                  return (
                    <div
                      key={tx.id}
                      onClick={() => setSelectedAuditTx(tx)}
                      className="group py-3 px-2 rounded-2xl flex items-start justify-between gap-3 text-xs overflow-hidden cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-all border border-transparent hover:border-slate-200 dark:hover:border-white/5"
                      title="Click to view detailed provider telemetry and cost audit"
                    >
                      <div className="flex items-start gap-2.5 sm:gap-3 flex-1 min-w-0">
                        <div
                          className={`p-2 rounded-xl mt-0.5 flex-shrink-0 ${
                            isTxRefund
                              ? 'bg-purple-500/15 text-purple-600 dark:text-purple-400'
                              : tx.type === 'credit'
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                              : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                          }`}
                        >
                          {isTxRefund ? (
                            <RotateCcw className="w-4 h-4" />
                          ) : tx.type === 'credit' ? (
                            <ArrowDownLeft className="w-4 h-4" />
                          ) : (
                            <ArrowUpRight className="w-4 h-4" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0 max-w-sm sm:max-w-md md:max-w-lg pr-4">
                          <p className="text-[9.5px] sm:text-[11px] font-normal leading-relaxed text-slate-700 dark:text-slate-300 break-words">
                            {renderFormattedDescription(tx.description || (isTxRefund ? 'Refund' : tx.category))}
                          </p>
                          <div className="flex flex-wrap items-center gap-1.5 text-[8.5px] sm:text-[9px] text-slate-400 dark:text-slate-500 mt-1">
                            {isTxRefund && (
                              <span className="px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30">
                                Refund
                              </span>
                            )}
                            <span className="font-mono font-medium text-amber-600 dark:text-brand-orange">
                              {tx.reference}
                            </span>
                            <span>·</span>
                            <span>{formatDate(tx.created_at)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0 flex flex-col items-end justify-start pl-1">
                        <p
                          className={`font-black font-mono text-[11px] sm:text-xs whitespace-nowrap ${
                            isTxRefund
                              ? 'text-purple-600 dark:text-purple-400'
                              : tx.type === 'credit'
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-rose-600 dark:text-rose-400'
                          }`}
                        >
                          {tx.type === 'credit' ? '+' : '-'}
                          {formatNaira(parseFloat(tx.amount))}
                        </p>
                        <span className="inline-block px-1.5 py-0.5 rounded text-[8.5px] sm:text-[9px] font-semibold bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 capitalize whitespace-nowrap mt-0.5">
                          {tx.status}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-slate-400 text-center py-6">No platform transactions logged yet.</p>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Users */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search user by name, phone, or role..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-brand-orange shadow-sm"
              />
            </div>
          </div>

          <div className="overflow-x-auto rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/80 shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-950/60 uppercase tracking-wider text-[11px] text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="py-3.5 px-4 font-bold">User Identity</th>
                  <th className="py-3.5 px-4 font-bold">Account Type / Role</th>
                  <th className="py-3.5 px-4 font-bold">Wallet Balances</th>
                  <th className="py-3.5 px-4 font-bold">Virtual Account</th>
                  <th className="py-3.5 px-4 font-bold">Account Status</th>
                  <th className="py-3.5 px-4 font-bold">Joined</th>
                  <th className="py-3.5 px-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-slate-700 dark:text-slate-300">
                {filteredUsers.map((u) => {
                  const ngnWallet = u.wallets?.find((w: any) => w.currency === 'NGN');
                  const usdWallet = u.wallets?.find((w: any) => w.currency === 'USD');
                  const va = u.virtual_accounts?.[0];
                  const userStatus = u.status || 'active';

                  return (
                    <tr
                      key={u.id}
                      onClick={() => setSelectedDetailUser(u)}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors cursor-pointer group"
                      title="Click to view full user profile, transactions history, and moderation actions"
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={u.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=User'}
                            alt="Avatar"
                            className="w-8 h-8 rounded-full border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-slate-800 object-cover"
                          />
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white group-hover:text-brand-orange transition-colors">
                              {u.title ? `${u.title} ` : ''}{u.first_name} {u.last_name}
                            </p>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                              {u.phone_number || u.email || 'No contact set'}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-bold text-[10px] uppercase border ${
                            u.role === 'admin'
                              ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30'
                              : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                          }`}
                        >
                          {u.role === 'admin' ? (
                            <ShieldCheck className="w-3 h-3" />
                          ) : (
                            <UserCheck className="w-3 h-3" />
                          )}
                          {u.role || 'customer'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <p className="font-bold font-mono text-emerald-600 dark:text-emerald-400">
                          {formatNaira(parseFloat(ngnWallet?.balance || 0))}
                        </p>
                        {usdWallet && (
                          <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                            {formatUSD(parseFloat(usdWallet.balance || 0))}
                          </p>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        {va ? (
                          <div>
                            <p className="font-mono text-slate-900 dark:text-white font-bold">{va.account_number}</p>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400">{va.bank_name}</p>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">Not Generated</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                            userStatus === 'blocked'
                              ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
                              : userStatus === 'suspended'
                              ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                              : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                          }`}
                        >
                          {userStatus}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                        {formatDate(u.created_at)}
                      </td>

                      <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedDetailUser(u)}
                            className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[11px] font-bold transition-all"
                          >
                            Details & Actions
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Adjust */}
      {activeTab === 'adjust' && (
        <div className="max-w-2xl mx-auto p-6 md:p-8 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 shadow-sm space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sliders className="w-5 h-5 text-brand-orange" />
              Manual Customer Wallet Adjustment
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              Directly credit or debit a user's NGN wallet balance with an audit reason logged in transactions.
            </p>
          </div>

          <form onSubmit={handleAdjustSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Select Customer Wallet
              </label>
              <select
                value={adjustWalletId}
                onChange={(e) => setAdjustWalletId(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs font-medium focus:outline-none focus:border-brand-orange"
              >
                <option value="">-- Choose User Wallet --</option>
                {wallet && !usersList.some((u) => u.wallets?.some((w: any) => w.id === wallet.id)) && (
                  <option value={wallet.id}>
                    {profile?.first_name || 'Admin'} {profile?.last_name || 'Account'} (My Wallet) — Bal: {formatNaira(wallet.balance)}
                  </option>
                )}
                {usersList.map((u) => {
                  const ngnW = u.wallets?.find((w: any) => w.currency === 'NGN');
                  if (!ngnW) return null;
                  const isMe = u.id === user?.id || ngnW.id === wallet?.id;
                  return (
                    <option key={ngnW.id} value={ngnW.id}>
                      {u.first_name} {u.last_name} {isMe ? '(My Wallet)' : `(${u.phone_number || 'No phone'})`} — Bal: {formatNaira(parseFloat(ngnW.balance || 0))}
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Action Type
                </label>
                <select
                  value={adjustAction}
                  onChange={(e) => setAdjustAction(e.target.value as any)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs font-medium focus:outline-none focus:border-brand-orange"
                >
                  <option value="credit">Credit (+) User Wallet</option>
                  <option value="debit">Debit (-) User Wallet</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Amount (₦)
                </label>
                <input
                  type="number"
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(e.target.value)}
                  placeholder="e.g. 5000"
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs font-medium focus:outline-none focus:border-brand-orange"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Audit Reason / Reference Note
              </label>
              <input
                type="text"
                value={adjustReason}
                onChange={(e) => setAdjustReason(e.target.value)}
                placeholder="e.g. Compensation for delayed token or manual transfer"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs font-medium focus:outline-none focus:border-brand-orange"
              />
            </div>

            <button
              type="submit"
              disabled={adjustLoading}
              className={`w-full py-3 rounded-xl font-bold text-xs shadow-lg transition-all disabled:opacity-50 ${
                adjustAction === 'credit'
                  ? 'bg-emerald-500 hover:bg-emerald-600 text-slate-950'
                  : 'bg-rose-500 hover:bg-rose-600 text-white'
              }`}
            >
              {adjustLoading
                ? 'Processing Adjustment...'
                : `Execute ${adjustAction.toUpperCase()} of ${formatNaira(parseFloat(adjustAmount) || 0)}`}
            </button>
          </form>
        </div>
      )}

      {/* Tab 4: Vendors */}
      {activeTab === 'vendors' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-brand-orange" />
                Korapay Gateway
              </h4>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold border border-emerald-200 dark:border-emerald-500/20">
                LIVE PRODUCTION
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Dedicated Virtual Accounts & Standard Checkout (Cards, Bank Transfers).
            </p>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200/80 dark:border-white/5 font-mono text-[11px] text-slate-700 dark:text-slate-300 space-y-1">
              <p>Base URL: https://api.korapay.com/merchant/api/v1</p>
              <p>Supported Banks: Moniepoint (090405), Wema (035), Fidelity (070)</p>
              <p>Status: Healthy & Active</p>
            </div>
          </div>

          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Zap className="w-4 h-4 text-emerald-500" />
                StroWallet Gateway
              </h4>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold border border-emerald-200 dark:border-emerald-500/20">
                LIVE PRODUCTION
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Airtime VTU (All Networks), Direct Telco Data, 11 Electricity DISCOs, and Cable TV (DStv, GOtv, StarTimes).
            </p>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200/80 dark:border-white/5 font-mono text-[11px] text-slate-700 dark:text-slate-300 space-y-1">
              <p>Base URL: https://strowallet.com/api</p>
              <p>Public Key: Configured & Verified</p>
              <p>Direct Services: Airtime, Electricity, Cable TV (₦0 fee), Direct Data (HOT)</p>
              <p>Status: Healthy & Active</p>
            </div>
            <Link
              href="/admin?tab=business-docs"
              onClick={() => setActiveTab('business-docs')}
              className="w-full py-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold text-xs border border-emerald-500/20 flex items-center justify-center gap-2 transition-all shadow-sm"
            >
              <BookOpen className="w-4 h-4" />
              View StroWallet Routing Spec
            </Link>
          </div>

          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500" />
                GongozAPI Gateway
              </h4>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold border border-emerald-200 dark:border-emerald-500/20">
                CONNECTED
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Wholesale Data Subscriptions (SME, Gifting, Corporate Gifting) across all networks.
            </p>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200/80 dark:border-white/5 font-mono text-[11px] text-slate-700 dark:text-slate-300 space-y-1">
              <p>Base URL: https://www.gongozconcept.com/api</p>
              <p>Automated Debit-First, Refund-on-Error Protocol: Enabled</p>
              <p>Status: Healthy & Configured</p>
            </div>
            <button
              onClick={() => setOpenGongozModal(true)}
              className="w-full py-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold text-xs border border-amber-500/20 flex items-center justify-center gap-2 transition-all shadow-sm"
            >
              <Sliders className="w-4 h-4" />
              Manage Catalog & Margins (Data, Cable TV, Electricity)
            </button>
          </div>

          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-rose-500" />
                SMS Gateway: Server 1 (GrizzlySMS)
              </h4>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold border border-emerald-200 dark:border-emerald-500/20">
                CONNECTED
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Virtual SMS Numbers & OTP verification via Server 1 with 15-min countdown.
            </p>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200/80 dark:border-white/5 font-mono text-[11px] text-slate-700 dark:text-slate-300 space-y-1">
              <p>Base URL: https://api.grizzlysms.com/stubs/handler_api.php</p>
              <p>Timeout Auto-Refund: Enabled</p>
              <p>Status: Operational</p>
            </div>
            <button
              onClick={() => {
                setSmsModalProvider('grizzly');
                setOpenSMSModal(true);
              }}
              className="w-full py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 font-bold text-xs border border-rose-500/20 flex items-center justify-center gap-2 transition-all shadow-sm"
            >
              <Sliders className="w-4 h-4" />
              Manage Server 1 (Grizzly) Margins
            </button>
          </div>

          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-indigo-500" />
                SMS Gateway: Server 2 (SMSPool)
              </h4>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold border border-emerald-200 dark:border-emerald-500/20">
                CONNECTED
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              High-speed virtual SMS numbers & OTP verification via Server 2 (151 countries).
            </p>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200/80 dark:border-white/5 font-mono text-[11px] text-slate-700 dark:text-slate-300 space-y-1">
              <p>Base URL: https://api.smspool.net</p>
              <p>API Authentication: Active ($2.66 Balance)</p>
              <p>Status: Operational</p>
            </div>
            <button
              onClick={() => {
                setSmsModalProvider('smspool');
                setOpenSMSModal(true);
              }}
              className="w-full py-2.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-bold text-xs border border-indigo-500/20 flex items-center justify-center gap-2 transition-all shadow-sm"
            >
              <Sliders className="w-4 h-4" />
              Manage Server 2 (SMSPool) Margins
            </button>
          </div>

          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-pink-500" />
                MomoPanel Enterprise API
              </h4>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold border border-emerald-200 dark:border-emerald-500/20">
                CONNECTED
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Social Media Engagement (Followers, Likes, Views, Retweets, Shares) SMM Gateway.
            </p>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200/80 dark:border-white/5 font-mono text-[11px] text-slate-700 dark:text-slate-300 space-y-1">
              <p>Base URL: https://momopanel.com/api/v2</p>
              <p>Order Protocol: Instant Automated Dispatch</p>
              <p>Status: Operational</p>
            </div>
            <button
              onClick={() => setOpenMomoModal(true)}
              className="w-full py-2.5 rounded-xl bg-pink-500/10 hover:bg-pink-500/20 text-pink-600 dark:text-pink-400 font-bold text-xs border border-pink-500/20 flex items-center justify-center gap-2 transition-all shadow-sm"
            >
              <Sliders className="w-4 h-4" />
              Manage SMM Catalog & Margins
            </button>
          </div>

          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-purple-500" />
                Fadded Reseller API (v2)
              </h4>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold border border-emerald-200 dark:border-emerald-500/20">
                CONNECTED (v2)
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Digital Account Logs (Social media accounts, VPN profiles, RDP servers, and proxies).
            </p>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200/80 dark:border-white/5 font-mono text-[11px] text-slate-700 dark:text-slate-300 space-y-1">
              <p>Base URL: https://api.fadded.com/v2</p>
              <p>Stock Sanitization: Credentials hidden until payment</p>
              <p>Status: Operational</p>
            </div>
            <button
              onClick={() => setOpenFaddedModal(true)}
              className="w-full py-2.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-400 font-bold text-xs border border-purple-500/20 flex items-center justify-center gap-2 transition-all shadow-sm"
            >
              <Sliders className="w-4 h-4" />
              Manage Products & Margins
            </button>
          </div>
        </div>
      )}

      {/* Tab 5: Reports & Audit Logs */}
      {activeTab === 'reports' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                <span className="text-xs font-semibold">Total Audited Events</span>
                <FileText className="w-4 h-4 text-sky-500" />
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white">{stats?.totalTransactions || 0}</p>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">100% Immutable Ledger</p>
            </div>

            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                <span className="text-xs font-semibold">Reconciliation Status</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              </div>
              <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">Reconciled</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Zero orphaned debits</p>
            </div>

            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                <span className="text-xs font-semibold">Platform Vault Liquidity</span>
                <Wallet className="w-4 h-4 text-amber-500" />
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white">
                {formatNaira(stats?.totalNgnBalance || 0)}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Total NGN User Backing</p>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/80 shadow-sm p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-brand-orange" />
                  Financial & Transaction Ledger Audit
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                  Complete chronological record of all system debits, credits, refunds, and adjustments.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-white/5 transition-all shadow-sm"
                >
                  Print Report
                </button>
              </div>
            </div>

            {stats?.recentTransactions?.length === 0 ? (
              <div className="p-10 text-center text-xs text-slate-400">
                No system transactions recorded in the audit log yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-slate-200 dark:border-white/10 text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    <tr>
                      <th className="pb-3 font-semibold">Type</th>
                      <th className="pb-3 font-semibold">Category</th>
                      <th className="pb-3 font-semibold">Description / Ref</th>
                      <th className="pb-3 font-semibold">Amount</th>
                      <th className="pb-3 font-semibold">Status</th>
                      <th className="pb-3 font-semibold">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-slate-700 dark:text-slate-300 font-mono">
                    {stats?.recentTransactions?.map((tx: any) => {
                      const isTxRefund =
                        tx.category === 'refund' ||
                        tx.reference?.startsWith('KP-REF') ||
                        (tx.description || '').toLowerCase().startsWith('refund');

                      return (
                        <tr
                          key={tx.id}
                          onClick={() => setSelectedAuditTx(tx)}
                          className="hover:bg-slate-50/80 dark:hover:bg-slate-800/60 transition-colors cursor-pointer"
                          title="Click to view provider telemetry, wholesale cost, and order reference"
                        >
                          <td className="py-3">
                            <span
                              className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                                isTxRefund
                                  ? 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30'
                                  : tx.type === 'credit'
                                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                                  : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                              }`}
                            >
                              {isTxRefund ? 'Refund' : tx.type}
                            </span>
                          </td>
                          <td className="py-3 capitalize text-slate-600 dark:text-slate-300">
                            {isTxRefund ? (
                              <span className="px-2 py-0.5 rounded text-[9.5px] font-bold uppercase tracking-wider bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-500/25">
                                Refund
                              </span>
                            ) : (
                              tx.category
                            )}
                          </td>
                          <td className="py-3 font-sans max-w-xs md:max-w-md">
                            <p className="text-slate-800 dark:text-slate-200 font-normal text-[11px] leading-relaxed break-words">
                              {renderFormattedDescription(tx.description || 'System Event')}
                            </p>
                            <p className="text-[9.5px] text-amber-600 dark:text-brand-orange font-mono font-medium">{tx.reference}</p>
                          </td>
                          <td
                            className={`py-3 font-bold font-mono whitespace-nowrap ${
                              isTxRefund
                                ? 'text-purple-600 dark:text-purple-400'
                                : tx.type === 'credit'
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : 'text-rose-600 dark:text-rose-400'
                            }`}
                          >
                            {tx.type === 'credit' ? '+' : '-'}
                            {formatNaira(tx.amount)}
                          </td>
                          <td className="py-3">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
                              {tx.status}
                            </span>
                          </td>
                          <td className="py-3 text-slate-500 dark:text-slate-400 text-[11px] font-sans">
                            {formatDate(tx.created_at)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab: Email Campaigns & SMTP */}
      {activeTab === 'email' && <AdminEmailTab />}

      {/* Tab: Business Model, Architecture & Vendor Operations Manual */}
      {activeTab === 'business-docs' && <AdminBusinessDocsTab />}

      {/* Admin Audit Transaction Telemetry Modal */}
      <AdminTransactionModal
        isOpen={!!selectedAuditTx}
        tx={selectedAuditTx}
        user={selectedAuditTx ? getTxUser(selectedAuditTx.wallet_id, selectedAuditTx) : null}
        onClose={() => setSelectedAuditTx(null)}
      />

      {/* Gongoz Wholesale Catalog & Pricing Modal */}
      <GongozPricingModal
        isOpen={openGongozModal}
        onClose={() => setOpenGongozModal(false)}
      />

      {/* Fadded Reseller Products & Pricing Modal */}
      <FaddedPricingModal
        isOpen={openFaddedModal}
        onClose={() => setOpenFaddedModal(false)}
      />

      {/* MomoPanel SMM Pricing Modal */}
      <MomoPricingModal
        isOpen={openMomoModal}
        onClose={() => setOpenMomoModal(false)}
      />

      {/* SMS Gateways Wholesale Catalog & Margins Modal */}
      <SMSPricingModal
        isOpen={openSMSModal}
        initialProvider={smsModalProvider}
        onClose={() => setOpenSMSModal(false)}
      />

      {/* Admin User Inspection & Moderation Modal */}
      <AdminUserModal
        isOpen={!!selectedDetailUser}
        user={selectedDetailUser}
        onClose={() => setSelectedDetailUser(null)}
        onUserUpdated={loadAdminData}
      />
    </div>
  );
}
