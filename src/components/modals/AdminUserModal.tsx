'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  ShieldCheck,
  UserCheck,
  ShieldAlert,
  Ban,
  Lock,
  KeyRound,
  RotateCcw,
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  Building2,
  Calendar,
  Phone,
  Mail,
  Send,
  Loader2,
  Sparkles,
  ExternalLink,
  Check,
  Activity,
  AlertTriangle,
  CheckCircle2,
  History,
  Laptop,
  Smartphone,
  Globe,
} from 'lucide-react';
import { formatNaira, formatUSD, formatDate } from '@/lib/utils';
import { useToast } from '@/components/common/Toast';

interface AdminUserModalProps {
  isOpen: boolean;
  user: any | null;
  onClose: () => void;
  onUserUpdated?: () => void;
}

export function AdminUserModal({
  isOpen,
  user,
  onClose,
  onUserUpdated,
}: AdminUserModalProps) {
  const { success, error, info } = useToast();
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'logins' | 'email'>('overview');
  const [transactions, setTransactions] = useState<any[]>([]);
  const [logins, setLogins] = useState<any[]>([]);
  const [loadingTx, setLoadingTx] = useState(false);
  const [loadingLogins, setLoadingLogins] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Direct email composer state
  const [emailSubject, setEmailSubject] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [emailCtaText, setEmailCtaText] = useState('');
  const [emailCtaUrl, setEmailCtaUrl] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);

  // Local user state reflecting optimistic or fetched updates
  const [currentUser, setCurrentUser] = useState<any | null>(user);

  const fetchUserTransactions = async (userId: string) => {
    setLoadingTx(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}/transactions`);
      const data = await res.json();
      if (data.success) {
        setTransactions(data.transactions || []);
      }
    } catch (err: any) {
      console.warn('Failed to load user transactions:', err.message);
    } finally {
      setLoadingTx(false);
    }
  };

  const fetchUserLogins = async (userId: string) => {
    setLoadingLogins(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}/logins`);
      const data = await res.json();
      if (data.success) {
        setLogins(data.logins || []);
      }
    } catch (err: any) {
      console.warn('Failed to load login history:', err.message);
    } finally {
      setLoadingLogins(false);
    }
  };

  useEffect(() => {
    setCurrentUser(user);
    if (user && isOpen) {
      fetchUserTransactions(user.id);
      fetchUserLogins(user.id);
    }
  }, [user, isOpen]);

  if (!isOpen || !currentUser) return null;

  const handleStatusChange = async (newStatus: 'active' | 'suspended' | 'blocked') => {
    const confirmMsg =
      newStatus === 'suspended'
        ? 'Are you sure you want to SUSPEND this user? They will be prevented from performing transactions and purchasing services.'
        : newStatus === 'blocked'
        ? 'Are you sure you want to BLOCK this user? Their account will be completely locked.'
        : 'Are you sure you want to reactivate this user account?';

    if (!window.confirm(confirmMsg)) return;

    setActionLoading(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetUserId: currentUser.id,
          action: 'change_status',
          status: newStatus,
        }),
      });

      const data = await res.json();
      if (data.success) {
        success('Status Changed', data.message);
        setCurrentUser((prev: any) => ({ ...prev, status: newStatus }));
        if (onUserUpdated) onUserUpdated();
      } else {
        error('Action Failed', data.error);
      }
    } catch (err: any) {
      error('Error', err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRoleToggle = async () => {
    const targetRole = currentUser.role === 'admin' ? 'customer' : 'admin';
    if (
      !window.confirm(
        `Are you sure you want to change this user's role to ${targetRole.toUpperCase()}?`
      )
    )
      return;

    setActionLoading(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetUserId: currentUser.id,
          action: 'change_role',
          role: targetRole,
        }),
      });

      const data = await res.json();
      if (data.success) {
        success('Role Updated', data.message);
        setCurrentUser((prev: any) => ({ ...prev, role: targetRole }));
        if (onUserUpdated) onUserUpdated();
      } else {
        error('Role Change Failed', data.error);
      }
    } catch (err: any) {
      error('Error', err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleResetPin = async () => {
    if (
      !window.confirm(
        'Are you sure you want to RESET this user’s 4-digit transaction PIN? The current PIN will be wiped and the user will be prompted to create a new PIN immediately upon logging in.'
      )
    )
      return;

    setActionLoading(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetUserId: currentUser.id,
          action: 'reset_pin',
        }),
      });

      const data = await res.json();
      if (data.success) {
        success('PIN Reset Triggered', data.message);
        setCurrentUser((prev: any) => ({ ...prev, is_pin_set: false }));
        if (onUserUpdated) onUserUpdated();
      } else {
        error('PIN Reset Failed', data.error);
      }
    } catch (err: any) {
      error('Error', err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleManualVerifyEmail = async () => {
    if (!currentUser?.id) return;
    if (
      !window.confirm(
        `Mark email address as VERIFIED for ${currentUser.email || 'this user'}? This will officially confirm their email in Supabase Auth.`
      )
    )
      return;

    setActionLoading(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetUserId: currentUser.id,
          action: 'verify_email',
        }),
      });

      const data = await res.json();
      if (data.success) {
        success('Email Verified', data.message);
        setCurrentUser((prev: any) => ({
          ...prev,
          is_email_verified: true,
          email_confirmed_at: new Date().toISOString(),
        }));
        if (onUserUpdated) onUserUpdated();
      } else {
        error('Verification Failed', data.error);
      }
    } catch (err: any) {
      error('Error', err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const EMAIL_PRESETS = [
    {
      label: 'General Notice',
      subject: 'Important update regarding your ZuvaPay account',
      message: `Hello ${currentUser?.first_name || 'Valued Customer'},\n\nWe are reaching out with an important update regarding your ZuvaPay account. Please review the details or reach out to our team if you have any questions.\n\nThank you for choosing ZuvaPay.`,
      ctaText: 'Open ZuvaPay Dashboard',
      ctaUrl: 'https://zuvapay.com/dashboard',
    },
    {
      label: 'Email Verification',
      subject: 'Please verify your email address on ZuvaPay',
      message: `Hello ${currentUser?.first_name || 'Valued Customer'},\n\nWe noticed that your email address has not been verified yet. Verifying your email address ensures you never miss automated transaction receipts, electricity tokens, and security notices.\n\nPlease log in to your dashboard to complete your email verification.`,
      ctaText: 'Log In & Verify',
      ctaUrl: 'https://zuvapay.com/login',
    },
    {
      label: 'Support & Resolution',
      subject: 'Update regarding your support inquiry on ZuvaPay',
      message: `Hello ${currentUser?.first_name || 'Valued Customer'},\n\nOur administration team has reviewed your transaction activity or recent support inquiry. All adjustments or service verifications have been processed.\n\nPlease check your transaction history or wallet balance. We appreciate your patience!`,
      ctaText: 'View Transaction History',
      ctaUrl: 'https://zuvapay.com/transactions',
    },
    {
      label: 'Security & PIN Alert',
      subject: 'Security Notice regarding your ZuvaPay credentials',
      message: `Hello ${currentUser?.first_name || 'Valued Customer'},\n\nThis is an official security advisory from the ZuvaPay administration team. To maintain the integrity of your account and protect your funds, please ensure your 4-digit transaction PIN is never shared with anyone.\n\nIf you ever suspect unauthorized access, contact us immediately.`,
      ctaText: 'Security Settings',
      ctaUrl: 'https://zuvapay.com/settings',
    },
  ];

  const applyEmailPreset = (preset: typeof EMAIL_PRESETS[0]) => {
    setEmailSubject(preset.subject);
    setEmailMessage(preset.message);
    setEmailCtaText(preset.ctaText);
    setEmailCtaUrl(preset.ctaUrl);
  };

  const handleSendDirectEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser.email) {
      error('No Recipient Email', 'This user does not have an email address associated with their account.');
      return;
    }
    if (!emailSubject.trim()) {
      error('Subject Missing', 'Please enter an email subject.');
      return;
    }
    if (!emailMessage.trim()) {
      error('Message Missing', 'Please enter the email body message.');
      return;
    }

    setSendingEmail(true);
    try {
      const res = await fetch(`/api/admin/users/${currentUser.id}/email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: emailSubject.trim(),
          message: emailMessage.trim(),
          ctaText: emailCtaText.trim() || undefined,
          ctaUrl: emailCtaUrl.trim() || undefined,
          customEmail: currentUser.email,
        }),
      });

      const data = await res.json();
      if (data.success) {
        success('Email Sent', data.message || `Email delivered to ${currentUser.email}`);
        setEmailSubject('');
        setEmailMessage('');
        setEmailCtaText('');
        setEmailCtaUrl('');
      } else {
        error('Delivery Failed', data.error || 'Failed to dispatch email via SMTP server');
      }
    } catch (err: any) {
      error('Error', err.message || 'Error communicating with email dispatch service');
    } finally {
      setSendingEmail(false);
    }
  };

  const ngnWallet = currentUser.wallets?.find((w: any) => w.currency === 'NGN');
  const usdWallet = currentUser.wallets?.find((w: any) => w.currency === 'USD');
  const va = currentUser.virtual_accounts?.[0];
  const userStatus = currentUser.status || 'active';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-100 dark:border-white/5 flex items-start justify-between bg-slate-50/50 dark:bg-slate-950/40">
          <div className="flex items-center gap-4">
            <img
              src={currentUser.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=User'}
              alt="Avatar"
              className="w-14 h-14 rounded-2xl border-2 border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-slate-800 object-cover shadow-sm"
            />
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  {currentUser.title ? `${currentUser.title} ` : ''}
                  {currentUser.first_name} {currentUser.last_name}
                </h3>
                {/* Role Badge */}
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                    currentUser.role === 'admin'
                      ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20'
                      : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                  }`}
                >
                  {currentUser.role === 'admin' ? (
                    <ShieldCheck className="w-3 h-3" />
                  ) : (
                    <UserCheck className="w-3 h-3" />
                  )}
                  {currentUser.role || 'customer'}
                </span>

                {/* Status Badge */}
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                    userStatus === 'blocked'
                      ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
                      : userStatus === 'suspended'
                      ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                      : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                  }`}
                >
                  {userStatus === 'blocked' ? (
                    <Ban className="w-3 h-3" />
                  ) : userStatus === 'suspended' ? (
                    <AlertTriangle className="w-3 h-3" />
                  ) : (
                    <CheckCircle2 className="w-3 h-3" />
                  )}
                  {userStatus}
                </span>

                {/* PIN Status */}
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                    currentUser.is_pin_set
                      ? 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-white/5'
                  }`}
                >
                  <KeyRound className="w-2.5 h-2.5" />
                  {currentUser.is_pin_set ? 'PIN Configured' : 'No PIN Set'}
                </span>

                {/* Email Verification Status Badge */}
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                    currentUser.is_email_verified
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25'
                      : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25'
                  }`}
                  title={
                    currentUser.is_email_verified
                      ? `Email address verified${currentUser.email_confirmed_at ? ` on ${formatDate(currentUser.email_confirmed_at)}` : ''}`
                      : 'User has not verified their email address'
                  }
                >
                  {currentUser.is_email_verified ? (
                    <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                  ) : (
                    <AlertTriangle className="w-3 h-3 text-amber-500" />
                  )}
                  {currentUser.is_email_verified ? 'Email Verified' : 'Email Unverified'}
                </span>
              </div>

              {/* Subtitle info */}
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1">
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  {currentUser.email || 'No email provided'}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 font-mono">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  {currentUser.phone_number || 'No phone set'}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Action Control Strip */}
        <div className="p-4 bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200/80 dark:border-white/5 flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex flex-wrap items-center gap-2">
            {/* Suspend / Unsuspend */}
            {userStatus === 'suspended' ? (
              <button
                onClick={() => handleStatusChange('active')}
                disabled={actionLoading}
                className="px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Unsuspend Account
              </button>
            ) : (
              <button
                onClick={() => handleStatusChange('suspended')}
                disabled={actionLoading || userStatus === 'blocked'}
                className="px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-xs font-bold transition-all flex items-center gap-1.5 disabled:opacity-40"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                Suspend Account
              </button>
            )}

            {/* Block / Unblock */}
            {userStatus === 'blocked' ? (
              <button
                onClick={() => handleStatusChange('active')}
                disabled={actionLoading}
                className="px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Unblock Account
              </button>
            ) : (
              <button
                onClick={() => handleStatusChange('blocked')}
                disabled={actionLoading}
                className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/20 text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <Ban className="w-3.5 h-3.5" />
                Block Account
              </button>
            )}

            {/* PIN Reset Trigger */}
            <button
              onClick={handleResetPin}
              disabled={actionLoading}
              className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-all flex items-center gap-1.5"
              title="Wipes transaction PIN so user is forced to create a new PIN"
            >
              <KeyRound className="w-3.5 h-3.5 text-brand-orange" />
              Reset PIN
            </button>

            {/* Send Direct Email Button */}
            <button
              onClick={() => setActiveTab('email')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
                activeTab === 'email'
                  ? 'bg-brand-orange text-white border-brand-orange shadow-sm shadow-brand-orange/30'
                  : 'bg-brand-orange/10 hover:bg-brand-orange/20 text-brand-orange border-brand-orange/25'
              }`}
              title="Compose and send an official branded email to this user"
            >
              <Mail className="w-3.5 h-3.5" />
              Send Direct Email
            </button>

            {/* Manual Mark Email Verified Button (if not yet verified) */}
            {!currentUser.is_email_verified && (
              <button
                onClick={handleManualVerifyEmail}
                disabled={actionLoading}
                className="px-3 py-1.5 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 text-teal-600 dark:text-teal-400 border border-teal-500/25 text-xs font-bold transition-all flex items-center gap-1.5 disabled:opacity-40"
                title="Mark this user's email address as verified in Supabase Auth"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-500" />
                Mark Email Verified
              </button>
            )}
          </div>

          <div>
            {/* Role Change */}
            <button
              onClick={handleRoleToggle}
              disabled={actionLoading}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                currentUser.role === 'admin'
                  ? 'border-amber-500/30 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10'
                  : 'bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-400 border-purple-500/30'
              }`}
            >
              {currentUser.role === 'admin' ? 'Demote to Customer' : 'Promote to Admin'}
            </button>
          </div>
        </div>

        {/* Modal Tabs Navigation */}
        <div className="flex border-b border-slate-100 dark:border-white/5 px-6 pt-2 bg-white dark:bg-slate-900 overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-3 px-3 text-xs font-bold transition-all border-b-2 whitespace-nowrap ${
              activeTab === 'overview'
                ? 'border-brand-orange text-brand-orange'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Account Overview & Balances
          </button>
          <button
            onClick={() => setActiveTab('transactions')}
            className={`pb-3 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'transactions'
                ? 'border-brand-orange text-brand-orange'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Transaction History
            <span className="px-1.5 py-0.2 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-mono text-slate-600 dark:text-slate-400">
              {transactions.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('logins')}
            className={`pb-3 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'logins'
                ? 'border-brand-orange text-brand-orange'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Login History
            <span className="px-1.5 py-0.2 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-mono text-slate-600 dark:text-slate-400">
              {logins.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('email')}
            className={`pb-3 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'email'
                ? 'border-brand-orange text-brand-orange'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            Direct Email (SMTP)
          </button>
        </div>

        {/* Modal Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Financial Liquidity & Virtual Account Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* NGN Balance */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-white/5 space-y-1.5">
                  <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                    <span className="text-[11px] font-semibold">NGN Wallet Balance</span>
                    <Wallet className="w-4 h-4 text-emerald-500" />
                  </div>
                  <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                    {formatNaira(parseFloat(ngnWallet?.balance || 0))}
                  </p>
                  <p className="text-[10px] text-slate-400 font-mono">ID: {ngnWallet?.id || 'Pending'}</p>
                </div>

                {/* USD Balance */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-white/5 space-y-1.5">
                  <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                    <span className="text-[11px] font-semibold">USD Wallet Balance</span>
                    <Wallet className="w-4 h-4 text-indigo-500" />
                  </div>
                  <p className="text-xl font-black text-indigo-600 dark:text-indigo-400 font-mono">
                    {formatUSD(parseFloat(usdWallet?.balance || 0))}
                  </p>
                  <p className="text-[10px] text-slate-400 font-mono">ID: {usdWallet?.id || 'Pending'}</p>
                </div>

                {/* Korapay Dedicated Virtual Account */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-white/5 space-y-1.5">
                  <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                    <span className="text-[11px] font-semibold">Dedicated Virtual Bank</span>
                    <Building2 className="w-4 h-4 text-amber-500" />
                  </div>
                  {va ? (
                    <div>
                      <p className="text-base font-black text-slate-900 dark:text-white font-mono">
                        {va.account_number}
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                        {va.bank_name}
                      </p>
                      <p className="text-[10px] text-slate-400 truncate">{va.account_name}</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-xs text-slate-400 italic">Not yet generated</p>
                      <p className="text-[10px] text-slate-500">Auto-created upon first Korapay deposit</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Account Metadata Detail Grid */}
              <div className="p-5 rounded-2xl bg-slate-50/70 dark:bg-slate-950/40 border border-slate-200 dark:border-white/5 space-y-3 text-xs">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                  User Identification & Security Telemetry
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-600 dark:text-slate-400">
                  <div>
                    <span className="text-slate-400 block text-[11px]">User UUID:</span>
                    <span className="font-mono font-medium text-slate-900 dark:text-white select-all">
                      {currentUser.id}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Registration Date:</span>
                    <span className="font-mono text-slate-900 dark:text-white">
                      {formatDate(currentUser.created_at)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Transaction PIN Status:</span>
                    <span className="font-medium text-slate-900 dark:text-white flex items-center gap-1.5 mt-0.5">
                      {currentUser.is_pin_set ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                          <span>4-Digit PIN is active & secured</span>
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                          <span>No PIN configured (User will be prompted upon login)</span>
                        </>
                      )}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Account Status:</span>
                    <span className="font-bold uppercase tracking-wider text-slate-900 dark:text-white mt-0.5 block">
                      {userStatus}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Email Verification Status:</span>
                    <div className="font-medium text-slate-900 dark:text-white flex items-center gap-1.5 mt-0.5">
                      {currentUser.is_email_verified ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                            Verified {currentUser.email_confirmed_at ? `(${formatDate(currentUser.email_confirmed_at)})` : ''}
                          </span>
                        </>
                      ) : (
                        <div className="flex flex-wrap items-center gap-2">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                          <span className="text-xs text-amber-600 dark:text-amber-400 font-semibold">
                            Unverified (Pending confirmation)
                          </span>
                          <button
                            onClick={handleManualVerifyEmail}
                            disabled={actionLoading}
                            className="text-[10px] font-bold text-teal-600 dark:text-teal-400 hover:underline bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/20"
                          >
                            Mark Verified
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Last Sign-In Activity:</span>
                    <span className="font-mono text-slate-900 dark:text-white text-xs mt-0.5 block">
                      {currentUser.last_sign_in_at ? formatDate(currentUser.last_sign_in_at) : 'Never logged in'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'transactions' && (
            <div className="space-y-4">
              {loadingTx ? (
                <div className="p-12 text-center text-slate-400 text-xs">
                  Loading user's personal transaction history...
                </div>
              ) : transactions.length === 0 ? (
                <div className="p-12 text-center text-slate-400 text-xs border border-dashed border-slate-200 dark:border-white/10 rounded-2xl">
                  No transactions found for this user account yet.
                </div>
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-white/5 bg-slate-50/40 dark:bg-slate-950/20">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-white/5 bg-slate-100/50 dark:bg-slate-800/40 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                        <th className="py-2.5 px-3">Type</th>
                        <th className="py-2.5 px-3">Description / Category</th>
                        <th className="py-2.5 px-3 font-mono">Amount</th>
                        <th className="py-2.5 px-3 font-mono">Reference</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3 text-right">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-white/5 font-medium">
                      {transactions.map((tx) => {
                        const isCredit = tx.type === 'credit';
                        return (
                          <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-white/[0.02]">
                            <td className="py-2.5 px-3">
                              <span
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                  isCredit
                                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                    : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                                }`}
                              >
                                {isCredit ? (
                                  <ArrowDownLeft className="w-3 h-3" />
                                ) : (
                                  <ArrowUpRight className="w-3 h-3" />
                                )}
                                {tx.type}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 max-w-xs">
                              <p className="font-bold text-slate-900 dark:text-white truncate">
                                {tx.description || tx.category}
                              </p>
                              <p className="text-[10px] text-slate-400 capitalize">{tx.category}</p>
                            </td>
                            <td className="py-2.5 px-3 font-mono font-bold">
                              <span className={isCredit ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}>
                                {isCredit ? '+' : '-'}{formatNaira(parseFloat(tx.amount || 0))}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 font-mono text-[11px] text-amber-600 dark:text-brand-orange">
                              {tx.reference || 'N/A'}
                            </td>
                            <td className="py-2.5 px-3">
                              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
                                {tx.status || 'completed'}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono text-[11px] text-slate-400">
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
          )}

          {/* Tab 3: Login History */}
          {activeTab === 'logins' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <History className="w-4 h-4 text-brand-orange" />
                    Security & Session History
                  </h4>
                  <p className="text-xs text-slate-500">
                    Audit log of recent logins, IP addresses, client devices, and authorization statuses.
                  </p>
                </div>
                <button
                  onClick={() => fetchUserLogins(currentUser.id)}
                  disabled={loadingLogins}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5"
                >
                  <RotateCcw className={`w-3.5 h-3.5 ${loadingLogins ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
              </div>

              {loadingLogins ? (
                <div className="py-12 text-center text-xs text-slate-400">Loading login audit trail...</div>
              ) : logins.length === 0 ? (
                <div className="py-12 text-center rounded-2xl border border-dashed border-slate-200 dark:border-white/10 p-8 space-y-2">
                  <Globe className="w-8 h-8 mx-auto text-slate-400" />
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">No Login Activity Recorded</p>
                  <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                    New logins from this user will be logged with their IP address, browser, operating system, and timestamp.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-white/5">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-950/50 border-b border-slate-200 dark:border-white/5 text-[11px] font-bold uppercase text-slate-500">
                      <tr>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4">IP Address</th>
                        <th className="py-3 px-4">Device & OS</th>
                        <th className="py-3 px-4">Browser / Agent</th>
                        <th className="py-3 px-4 text-right">Login Time</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                      {logins.map((lg: any, idx: number) => {
                        const isSuccess = lg.status === 'success';
                        const isMobile = lg.device_type === 'Mobile';
                        return (
                          <tr key={lg.id || idx} className="hover:bg-slate-50 dark:hover:bg-white/[0.02]">
                            <td className="py-3 px-4">
                              <span
                                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                  isSuccess
                                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                                    : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                                }`}
                              >
                                {isSuccess ? (
                                  <CheckCircle2 className="w-3 h-3" />
                                ) : (
                                  <Ban className="w-3 h-3" />
                                )}
                                {lg.status}
                              </span>
                            </td>

                            <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white">
                              {lg.ip_address || '127.0.0.1'}
                            </td>

                            <td className="py-3 px-4">
                              <div className="flex items-center gap-1.5">
                                {isMobile ? (
                                  <Smartphone className="w-3.5 h-3.5 text-slate-400" />
                                ) : (
                                  <Laptop className="w-3.5 h-3.5 text-slate-400" />
                                )}
                                <span className="font-semibold text-slate-800 dark:text-slate-200">
                                  {lg.os || 'Unknown OS'}
                                </span>
                                <span className="text-[10px] text-slate-400">({lg.device_type || 'Desktop'})</span>
                              </div>
                            </td>

                            <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                              <p className="font-medium">{lg.browser || 'Web Browser'}</p>
                              {lg.failure_reason && (
                                <p className="text-[10px] text-rose-500">{lg.failure_reason}</p>
                              )}
                            </td>

                            <td className="py-3 px-4 text-right font-mono text-[11px] text-slate-400">
                              {formatDate(lg.created_at)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'email' && (
            <div className="space-y-5">
              {/* Recipient & Channel Status Header */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-white/5 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-orange/10 flex items-center justify-center text-brand-orange border border-brand-orange/20">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        Dispatching to: {currentUser.email || 'No email set'}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                          currentUser.is_email_verified
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                            : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                        }`}
                      >
                        {currentUser.is_email_verified ? 'Verified Email' : 'Unverified Email'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Sent from <strong className="text-slate-700 dark:text-slate-300">ZuvaPay Official SMTP Gateway</strong> (<code className="font-mono text-[10px]">support@zuvapay.com</code>)
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[11px] font-semibold border border-emerald-500/20">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    SMTP Connected
                  </span>
                </div>
              </div>

              {/* Quick Template Presets */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-brand-orange" />
                    Quick Message Presets (Click to autofill)
                  </span>
                  {(emailSubject || emailMessage) && (
                    <button
                      type="button"
                      onClick={() => {
                        setEmailSubject('');
                        setEmailMessage('');
                        setEmailCtaText('');
                        setEmailCtaUrl('');
                      }}
                      className="text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      Clear Form
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {EMAIL_PRESETS.map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => applyEmailPreset(preset)}
                      className={`p-2.5 rounded-xl border text-left transition-all group ${
                        emailSubject === preset.subject
                          ? 'border-brand-orange bg-brand-orange/5 dark:bg-brand-orange/10 shadow-sm'
                          : 'border-slate-200 dark:border-white/5 hover:border-brand-orange/40 bg-white dark:bg-slate-900/60'
                      }`}
                    >
                      <p className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-brand-orange transition-colors">
                        {preset.label}
                      </p>
                      <p className="text-[10px] text-slate-400 truncate mt-0.5">
                        {preset.subject}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Composer Form */}
              <form onSubmit={handleSendDirectEmail} className="space-y-4">
                {/* Subject */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Email Subject Line <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    placeholder="e.g. Important update regarding your ZuvaPay account"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-950/60 text-slate-900 dark:text-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-brand-orange/30 focus:border-brand-orange transition-all placeholder:text-slate-400"
                  />
                </div>

                {/* Message Body */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                      Message Body <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-[10px] text-slate-400">
                      Paragraphs are automatically formatted in the branded email template
                    </span>
                  </div>
                  <textarea
                    rows={6}
                    value={emailMessage}
                    onChange={(e) => setEmailMessage(e.target.value)}
                    placeholder={`Hello ${currentUser.first_name || 'there'},\n\nWrite your message here...`}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-950/60 text-slate-900 dark:text-white text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-brand-orange/30 focus:border-brand-orange transition-all placeholder:text-slate-400 font-sans"
                  />
                </div>

                {/* Optional Call-to-Action (CTA) */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-white/5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Optional Action Button (Call to Action)
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Adds a clickable button inside the email body
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] text-slate-500 mb-1">
                        Button Label
                      </label>
                      <input
                        type="text"
                        value={emailCtaText}
                        onChange={(e) => setEmailCtaText(e.target.value)}
                        placeholder="e.g. View Dashboard, Verify Account"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-brand-orange/30"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-500 mb-1">
                        Target Destination URL
                      </label>
                      <input
                        type="text"
                        value={emailCtaUrl}
                        onChange={(e) => setEmailCtaUrl(e.target.value)}
                        placeholder="e.g. https://zuvapay.com/login"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-mono focus:outline-none focus:ring-2 focus:ring-brand-orange/30"
                      />
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-2">
                  <p className="text-[11px] text-slate-400 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                    Recipient will receive a secure HTML email with ZuvaPay header & footer.
                  </p>

                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => setActiveTab('overview')}
                      className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={sendingEmail || !currentUser.email}
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-orange to-orange-600 hover:opacity-90 text-white text-xs font-bold shadow-md shadow-brand-orange/25 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                      {sendingEmail ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Dispatching via SMTP...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>Send Email via SMTP</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-slate-950/40 flex items-center justify-between text-xs text-slate-500">
          <span>User ID: {currentUser.id}</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-bold transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
