'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useWallet } from '@/context/WalletContext';
import { useToast } from '@/components/common/Toast';
import { formatNaira } from '@/lib/utils';
import {
  User,
  Phone,
  Mail,
  Shield,
  Key,
  Wallet,
  CheckCircle2,
  Save,
  LogOut,
  AtSign,
  Check,
  X,
  Loader2,
  ArrowRight,
} from 'lucide-react';

export default function ProfilePage() {
  const searchParams = useSearchParams();
  const { user, profile, updateProfile, signOut } = useAuth();
  const { wallet, formatBalance } = useWallet();
  const { success, error } = useToast();

  const effectiveUsername = profile?.username || user?.user_metadata?.username;

  const [title, setTitle] = useState(profile?.title || 'Mr');
  const [firstName, setFirstName] = useState(profile?.first_name || '');
  const [lastName, setLastName] = useState(profile?.last_name || '');
  const [phoneNumber, setPhoneNumber] = useState(profile?.phone_number || '');
  const [loading, setLoading] = useState(false);

  // Username claim states for accounts without a handle
  const [claimHandle, setClaimHandle] = useState('');
  const [isCheckingHandle, setIsCheckingHandle] = useState(false);
  const [handleStatus, setHandleStatus] = useState<{
    available?: boolean;
    message?: string;
  } | null>(null);
  const [isClaimingHandle, setIsClaimingHandle] = useState(false);
  const claimInputRef = useRef<HTMLInputElement>(null);

  // Focus claim input if redirected with action=claim_username
  useEffect(() => {
    if (searchParams?.get('action') === 'claim_username' && claimInputRef.current) {
      claimInputRef.current.focus();
    }
  }, [searchParams]);

  // Synchronize state once profile data resolves from Supabase
  useEffect(() => {
    if (profile) {
      if (profile.title) setTitle(profile.title);
      if (profile.first_name) setFirstName(profile.first_name);
      if (profile.last_name) setLastName(profile.last_name);
      if (profile.phone_number) setPhoneNumber(profile.phone_number);
    }
  }, [profile]);

  // Debounced check for username availability
  useEffect(() => {
    const clean = claimHandle.trim().toLowerCase().replace(/^@/, '');
    if (!clean) {
      setHandleStatus(null);
      setIsCheckingHandle(false);
      return;
    }

    if (clean.length < 3) {
      setHandleStatus({
        available: false,
        message: 'Must be at least 3 characters',
      });
      setIsCheckingHandle(false);
      return;
    }

    setIsCheckingHandle(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/users/check-username?username=${encodeURIComponent(clean)}`);
        const data = await res.json();
        setHandleStatus({
          available: data.available,
          message: data.available ? data.message : data.error,
        });
      } catch {
        setHandleStatus({
          available: false,
          message: 'Error checking handle availability',
        });
      } finally {
        setIsCheckingHandle(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [claimHandle]);

  const handleClaimUsername = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = claimHandle.trim().toLowerCase().replace(/^@/, '');
    if (!clean || !handleStatus?.available) return;

    setIsClaimingHandle(true);
    try {
      const res = await fetch('/api/users/claim-username', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: clean, userId: user?.id || profile?.id }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        error('Claim Failed', data.error || 'Could not claim this handle.');
        return;
      }

      await updateProfile({ username: clean });
      success('Handle Claimed! 🎉', `You are now @${clean} on ZuvaPay!`);
      setClaimHandle('');
      setHandleStatus(null);
    } catch (err: any) {
      error('Error', err.message || 'Failed to claim handle.');
    } finally {
      setIsClaimingHandle(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await updateProfile({
        title,
        first_name: firstName,
        last_name: lastName,
        phone_number: phoneNumber,
      });

      if (res.error) {
        error('Update Failed', res.error);
      } else {
        success('Profile Updated', 'Your profile details have been saved.');
      }
    } catch (err: any) {
      error('Error', err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">Profile & Security</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Manage your ZuvaPay profile identity, username handle, and linked contact info.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="p-6 rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/70 shadow-sm dark:shadow-none backdrop-blur-xl flex flex-col items-center text-center space-y-4">
          <div className="relative">
            <img
              src={profile?.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=KPUser'}
              alt="Avatar"
              className="w-24 h-24 rounded-full border-2 border-brand-orange bg-slate-100 dark:bg-slate-800 object-cover shadow-xl"
            />
            <span className="absolute bottom-1 right-1 p-1 rounded-full bg-emerald-500 text-slate-950 border-2 border-white dark:border-slate-900">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </span>
          </div>

          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {profile?.title ? `${profile.title} ` : ''}{profile?.first_name} {profile?.last_name}
            </h3>
            {effectiveUsername ? (
              <div className="mt-1 flex items-center justify-center gap-1.5">
                <span className="font-bold text-brand-orange text-xs">@{effectiveUsername}</span>
                <span className="px-1.5 py-0.5 rounded text-[9px] bg-brand-orange/15 text-brand-orange font-black uppercase">
                  Handle
                </span>
              </div>
            ) : (
              <p className="text-xs text-slate-500 dark:text-slate-400">{user?.email}</p>
            )}
            <span className="inline-block mt-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[11px] font-bold border border-emerald-500/20">
              KYC Tier 1 Active
            </span>
          </div>

          <div className="w-full pt-4 border-t border-slate-100 dark:border-white/10 text-left space-y-2 text-xs">
            {effectiveUsername && (
              <div className="flex justify-between py-1">
                <span className="text-slate-500 dark:text-slate-400">Username:</span>
                <span className="font-bold text-brand-orange">@{effectiveUsername}</span>
              </div>
            )}
            <div className="flex justify-between py-1">
              <span className="text-slate-500 dark:text-slate-400">Email:</span>
              <span className="font-medium text-slate-800 dark:text-slate-200 truncate max-w-[160px]">{user?.email}</span>
            </div>
            {profile?.phone_number && (
              <div className="flex justify-between py-1">
                <span className="text-slate-500 dark:text-slate-400">Phone:</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">{profile.phone_number}</span>
              </div>
            )}
            <div className="flex justify-between py-1">
              <span className="text-slate-500 dark:text-slate-400">NGN Balance:</span>
              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                {formatBalance(wallet?.balance || 0)}
              </span>
            </div>
          </div>

          <button
            onClick={() => signOut()}
            className="w-full mt-4 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-rose-500/30 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 text-xs font-bold transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>

        {/* Right Section: Handle Claim (if missing) + Edit Details Form */}
        <div className="md:col-span-2 space-y-6">
          {/* Claim Username Card if not set */}
          {!effectiveUsername && (
            <div className="p-6 rounded-3xl border border-brand-orange/30 bg-gradient-to-br from-amber-500/10 via-brand-orange/10 to-transparent dark:bg-slate-900/80 shadow-sm backdrop-blur-xl">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-7 w-7 rounded-lg bg-brand-orange/20 border border-brand-orange/40 flex items-center justify-center text-brand-orange font-bold text-sm">
                  @
                </div>
                <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                  Claim Your Unique @Username Handle
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-brand-orange text-slate-950 uppercase tracking-wider">
                  Important
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 mb-4">
                Your @username allows other ZuvaPay users to send you funds instantly and enables sign-in via your handle.
              </p>

              <form onSubmit={handleClaimUsername} className="space-y-3">
                <div className="flex flex-col sm:flex-row gap-2.5">
                  <div className="relative flex-1">
                    <AtSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-orange" />
                    <input
                      ref={claimInputRef}
                      type="text"
                      value={claimHandle}
                      onChange={(e) => setClaimHandle(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                      placeholder="e.g. adeleke_pay"
                      maxLength={20}
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 text-xs font-semibold focus:outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange"
                    />
                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                      {isCheckingHandle && (
                        <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />
                      )}
                      {!isCheckingHandle && handleStatus?.available === true && (
                        <Check className="w-4 h-4 text-emerald-500" />
                      )}
                      {!isCheckingHandle && handleStatus?.available === false && (
                        <X className="w-4 h-4 text-rose-500" />
                      )}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={!handleStatus?.available || isClaimingHandle}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-orange to-amber-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black text-xs transition-all shadow-md shadow-orange-500/20 disabled:opacity-50 flex items-center justify-center gap-1.5 flex-shrink-0"
                  >
                    {isClaimingHandle ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Claiming...
                      </>
                    ) : (
                      <>
                        Claim Handle
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>

                {handleStatus && (
                  <p
                    className={`text-[11px] font-medium flex items-center gap-1.5 ${
                      handleStatus.available ? 'text-emerald-500' : 'text-rose-400'
                    }`}
                  >
                    {handleStatus.available ? (
                      <Check className="w-3 h-3 flex-shrink-0" />
                    ) : (
                      <X className="w-3 h-3 flex-shrink-0" />
                    )}
                    {handleStatus.message}
                  </p>
                )}
              </form>
            </div>
          )}

          {/* Edit Details Form */}
          <div className="p-6 md:p-8 rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/70 shadow-sm dark:shadow-none backdrop-blur-xl space-y-6">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <User className="w-4 h-4 text-brand-orange" />
              Personal Information
            </h3>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Title
                </label>
                <select
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs font-medium focus:outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange"
                >
                  <option value="Mr">Mr</option>
                  <option value="Mrs">Mrs</option>
                  <option value="Miss">Miss</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  First Name
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs font-medium focus:outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Last Name
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs font-medium focus:outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Phone Number (Linked to Mobile Wallet)
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="08012345678"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs font-medium focus:outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-950/40 border border-slate-200 dark:border-white/5 text-slate-500 dark:text-slate-400 text-xs font-medium cursor-not-allowed"
                  />
                </div>
              </div>

              {effectiveUsername && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    ZuvaPay Handle
                  </label>
                  <div className="relative">
                    <AtSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-orange" />
                    <input
                      type="text"
                      value={`@${effectiveUsername}`}
                      disabled
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-950/40 border border-slate-200 dark:border-white/5 text-brand-orange font-bold text-xs cursor-not-allowed"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Your handle is permanent and uniquely bound to your ZuvaPay account.
                  </p>
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-brand-orange to-amber-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-bold text-xs shadow-lg transition-all disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {loading ? 'Saving Changes...' : 'Save Profile Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
