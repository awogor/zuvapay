'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useWallet } from '@/context/WalletContext';
import { useTheme } from '@/context/ThemeContext';
import { useSupport } from '@/components/modals/SupportModal';
import { useToast } from '@/components/common/Toast';
import {
  User,
  Lock,
  ShieldCheck,
  CreditCard,
  BadgeCheck,
  Bell,
  Mail,
  Moon,
  Sun,
  Headphones,
  LogOut,
  ChevronRight,
  CheckCircle2,
  Sparkles,
  Shield,
  Wallet,
  ArrowRight,
  AlertTriangle,
} from 'lucide-react';
import { ProfileInfoModal } from '@/components/modals/ProfileInfoModal';
import { PinSetupModal } from '@/components/modals/PinSetupModal';
import { AccountLimitModal } from '@/components/modals/AccountLimitModal';
import { KycModal } from '@/components/modals/KycModal';
import { BvnModal } from '@/components/modals/BvnModal';

export default function ProfilePage() {
  const searchParams = useSearchParams();
  const { user, profile, signOut } = useAuth();
  const { wallet, formatBalance } = useWallet();
  const { theme, toggleTheme } = useTheme();
  const { openSupport } = useSupport();
  const { success } = useToast();

  const effectiveUsername = profile?.username || user?.user_metadata?.username;
  const fullName = profile?.first_name
    ? `${profile.first_name} ${profile.last_name || ''}`.trim()
    : user?.user_metadata?.first_name
    ? `${user.user_metadata.first_name} ${user.user_metadata.last_name || ''}`.trim()
    : 'Valued User';

  // Modal display states
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [showKycModal, setShowKycModal] = useState(false);
  const [showBvnModal, setShowBvnModal] = useState(false);
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  // Preference switches (persisted in localStorage)
  const [smsAlertEnabled, setSmsAlertEnabled] = useState<boolean>(true);
  const [emailAlertEnabled, setEmailAlertEnabled] = useState<boolean>(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedSms = localStorage.getItem('zuvapay_pref_sms_alert');
      if (savedSms !== null) setSmsAlertEnabled(savedSms === 'true');

      const savedEmail = localStorage.getItem('zuvapay_pref_email_alert');
      if (savedEmail !== null) setEmailAlertEnabled(savedEmail === 'true');
    }
  }, []);

  // Check query parameter to trigger username claim automatically
  useEffect(() => {
    if (searchParams?.get('action') === 'claim_username') {
      setShowProfileModal(true);
    }
  }, [searchParams]);

  const toggleSmsAlert = () => {
    const next = !smsAlertEnabled;
    setSmsAlertEnabled(next);
    if (typeof window !== 'undefined') {
      localStorage.setItem('zuvapay_pref_sms_alert', String(next));
    }
    success('Preference Updated', next ? 'SMS alerts enabled' : 'SMS alerts paused');
  };

  const toggleEmailAlert = () => {
    const next = !emailAlertEnabled;
    setEmailAlertEnabled(next);
    if (typeof window !== 'undefined') {
      localStorage.setItem('zuvapay_pref_email_alert', String(next));
    }
    success('Preference Updated', next ? 'Email receipts enabled' : 'Email receipts paused');
  };

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut();
    } finally {
      setIsSigningOut(false);
      setShowSignOutConfirm(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-5 animate-in fade-in pb-16">
      {/* Page Title & Subtitle */}
      <div className="px-1">
        <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
          Account Settings
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Manage your account and preferences
        </p>
      </div>

      {/* User Profile Banner Card (Inspired by reference screenshot) */}
      <div className="relative overflow-hidden rounded-3xl border border-orange-200/70 dark:border-white/10 bg-gradient-to-br from-[#FFE8D6] via-[#FFF3E8] to-[#FFDFC4] dark:from-amber-950/40 dark:via-orange-950/25 dark:to-slate-900/90 p-5 sm:p-6 shadow-sm transition-all">
        {/* Soft Ambient Glows */}
        <div className="absolute -top-10 -right-10 w-36 h-36 rounded-full bg-brand-orange/15 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-amber-500/10 blur-xl pointer-events-none" />

        <div className="relative z-10 flex items-center gap-4 sm:gap-5">
          {/* Avatar Icon */}
          <div className="relative flex-shrink-0">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#FFD1AC] dark:bg-orange-950/60 border-2 border-brand-orange/30 flex items-center justify-center text-brand-orange shadow-inner">
              <User className="w-8 h-8 sm:w-10 sm:h-10 text-brand-orange stroke-[2.2]" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 text-slate-950 border-2 border-white dark:border-slate-900 flex items-center justify-center shadow-sm">
              <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />
            </div>
          </div>

          {/* User Details */}
          <div className="flex-1 min-w-0 space-y-1">
            <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight truncate">
              {fullName}
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 font-medium truncate">
              {user?.email || 'customer@zuvapay.com'}
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-[10.5px] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Verified
              </span>

              {effectiveUsername ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-brand-orange/15 border border-brand-orange/30 text-brand-orange text-[10.5px] font-black">
                  @{effectiveUsername}
                </span>
              ) : (
                <button
                  onClick={() => setShowProfileModal(true)}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 text-amber-800 dark:text-amber-300 text-[10px] font-bold transition-colors"
                >
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  Claim Handle
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Group 1: Account */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 px-2">
          Account
        </h3>

        <div className="rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900/80 shadow-sm overflow-hidden divide-y divide-slate-100 dark:divide-white/5">
          {/* 1. Profile Information */}
          <button
            type="button"
            onClick={() => setShowProfileModal(true)}
            className="w-full flex items-center justify-between p-3.5 sm:p-4 hover:bg-slate-50 dark:hover:bg-white/5 active:bg-slate-100 dark:active:bg-white/10 transition-colors text-left group"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-11 h-11 rounded-2xl bg-orange-100/80 dark:bg-orange-950/50 text-brand-orange flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                <User className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div className="min-w-0">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                  Profile Information
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  View and update your profile
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-white group-hover:translate-x-0.5 transition-all flex-shrink-0" />
          </button>

          {/* 2. Change PIN */}
          <button
            type="button"
            onClick={() => setShowPinModal(true)}
            className="w-full flex items-center justify-between p-3.5 sm:p-4 hover:bg-slate-50 dark:hover:bg-white/5 active:bg-slate-100 dark:active:bg-white/10 transition-colors text-left group"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-11 h-11 rounded-2xl bg-purple-100/80 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                <Lock className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div className="min-w-0">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                  Change PIN
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  Update your transaction PIN
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-white group-hover:translate-x-0.5 transition-all flex-shrink-0" />
          </button>

          {/* 3. Account Limit */}
          <button
            type="button"
            onClick={() => setShowLimitModal(true)}
            className="w-full flex items-center justify-between p-3.5 sm:p-4 hover:bg-slate-50 dark:hover:bg-white/5 active:bg-slate-100 dark:active:bg-white/10 transition-colors text-left group"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-11 h-11 rounded-2xl bg-blue-100/80 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                <ShieldCheck className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div className="min-w-0">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                  Account Limit
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  Manage your transaction limits
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-white group-hover:translate-x-0.5 transition-all flex-shrink-0" />
          </button>

          {/* 4. KYC Verification */}
          <button
            type="button"
            onClick={() => setShowKycModal(true)}
            className="w-full flex items-center justify-between p-3.5 sm:p-4 hover:bg-slate-50 dark:hover:bg-white/5 active:bg-slate-100 dark:active:bg-white/10 transition-colors text-left group"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-11 h-11 rounded-2xl bg-teal-100/80 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                <BadgeCheck className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div className="min-w-0">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                  KYC Verification
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  View your KYC status
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-white group-hover:translate-x-0.5 transition-all flex-shrink-0" />
          </button>

          {/* 5. BVN Information */}
          <button
            type="button"
            onClick={() => setShowBvnModal(true)}
            className="w-full flex items-center justify-between p-3.5 sm:p-4 hover:bg-slate-50 dark:hover:bg-white/5 active:bg-slate-100 dark:active:bg-white/10 transition-colors text-left group"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-11 h-11 rounded-2xl bg-amber-100/80 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                <CreditCard className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div className="min-w-0">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                  BVN Information
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  Manage your BVN details
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-white group-hover:translate-x-0.5 transition-all flex-shrink-0" />
          </button>
        </div>
      </div>

      {/* Group 2: Preferences */}
      <div className="space-y-2 pt-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 px-2">
          Preferences
        </h3>

        <div className="rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900/80 shadow-sm overflow-hidden divide-y divide-slate-100 dark:divide-white/5">
          {/* SMS Alert Toggle */}
          <div className="flex items-center justify-between p-3.5 sm:p-4">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-11 h-11 rounded-2xl bg-rose-100/80 dark:bg-rose-950/50 text-rose-500 flex items-center justify-center flex-shrink-0">
                <Bell className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div className="min-w-0">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                  SMS Alert
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  Receive SMS alerts for transactions
                </p>
              </div>
            </div>

            {/* Switch Toggle */}
            <button
              type="button"
              onClick={toggleSmsAlert}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                smsAlertEnabled ? 'bg-brand-orange' : 'bg-slate-200 dark:bg-slate-700'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  smsAlertEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Email Receipts Toggle */}
          <div className="flex items-center justify-between p-3.5 sm:p-4">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-11 h-11 rounded-2xl bg-sky-100/80 dark:bg-sky-950/50 text-sky-500 flex items-center justify-center flex-shrink-0">
                <Mail className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div className="min-w-0">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                  Email Receipts
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  Instant invoices and recharge tokens
                </p>
              </div>
            </div>

            {/* Switch Toggle */}
            <button
              type="button"
              onClick={toggleEmailAlert}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                emailAlertEnabled ? 'bg-brand-orange' : 'bg-slate-200 dark:bg-slate-700'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  emailAlertEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Theme Mode Toggle */}
          <div className="flex items-center justify-between p-3.5 sm:p-4">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-11 h-11 rounded-2xl bg-indigo-100/80 dark:bg-indigo-950/50 text-indigo-500 flex items-center justify-center flex-shrink-0">
                {theme === 'dark' ? (
                  <Moon className="w-5 h-5 stroke-[2.2]" />
                ) : (
                  <Sun className="w-5 h-5 stroke-[2.2]" />
                )}
              </div>
              <div className="min-w-0">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                  Dark Mode
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  {theme === 'dark' ? 'Dark theme active' : 'Light theme active'}
                </p>
              </div>
            </div>

            {/* Switch Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                theme === 'dark' ? 'bg-brand-orange' : 'bg-slate-200 dark:bg-slate-700'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  theme === 'dark' ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Group 3: Support & Security */}
      <div className="space-y-2 pt-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 px-2">
          Support & Security
        </h3>

        <div className="rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900/80 shadow-sm overflow-hidden divide-y divide-slate-100 dark:divide-white/5">
          {/* Customer Care */}
          <button
            type="button"
            onClick={() => openSupport({ issue: 'General Inquiry' })}
            className="w-full flex items-center justify-between p-3.5 sm:p-4 hover:bg-slate-50 dark:hover:bg-white/5 active:bg-slate-100 dark:active:bg-white/10 transition-colors text-left group"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-11 h-11 rounded-2xl bg-emerald-100/80 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                <Headphones className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div className="min-w-0">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                  Help & Support
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  Contact our 24/7 customer care desk
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-white group-hover:translate-x-0.5 transition-all flex-shrink-0" />
          </button>

          {/* Sign Out */}
          <button
            type="button"
            onClick={() => setShowSignOutConfirm(true)}
            className="w-full flex items-center justify-between p-3.5 sm:p-4 hover:bg-rose-50 dark:hover:bg-rose-500/10 active:bg-rose-100 dark:active:bg-rose-500/20 transition-colors text-left group"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-11 h-11 rounded-2xl bg-rose-100/80 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                <LogOut className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div className="min-w-0">
                <h4 className="text-sm font-bold text-rose-600 dark:text-rose-400 leading-snug">
                  Sign Out
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  Log out of your ZuvaPay account
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-rose-400 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
          </button>
        </div>
      </div>

      {/* App Version Info */}
      <div className="text-center pt-3 text-[11px] text-slate-400 dark:text-slate-600">
        ZuvaPay v2.4.0 • Licensed by CBN & NDIC Insured Partners
      </div>

      {/* Interactive Modals */}
      {showProfileModal && (
        <ProfileInfoModal
          isOpen={showProfileModal}
          onClose={() => setShowProfileModal(false)}
          autoFocusClaim={searchParams?.get('action') === 'claim_username'}
        />
      )}

      {showPinModal && (
        <PinSetupModal
          isOpen={showPinModal}
          onClose={() => setShowPinModal(false)}
          onSuccess={() => setShowPinModal(false)}
          mode={profile?.is_pin_set ? 'change' : 'create'}
        />
      )}

      {showLimitModal && (
        <AccountLimitModal
          isOpen={showLimitModal}
          onClose={() => setShowLimitModal(false)}
          onUpgrade={() => setShowBvnModal(true)}
        />
      )}

      {showKycModal && (
        <KycModal
          isOpen={showKycModal}
          onClose={() => setShowKycModal(false)}
          onVerifyBvn={() => setShowBvnModal(true)}
        />
      )}

      {showBvnModal && (
        <BvnModal
          isOpen={showBvnModal}
          onClose={() => setShowBvnModal(false)}
        />
      )}

      {/* Sign Out Confirmation Modal */}
      {showSignOutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-sm rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 p-6 shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 border border-rose-500/20 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6 stroke-[2.2]" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                Sign Out Confirmation
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Are you sure you want to sign out of your ZuvaPay account?
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowSignOutConfirm(false)}
                disabled={isSigningOut}
                className="py-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSignOut}
                disabled={isSigningOut}
                className="py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold transition-colors shadow-md shadow-rose-500/20 disabled:opacity-50"
              >
                {isSigningOut ? 'Signing out...' : 'Yes, Sign Out'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
