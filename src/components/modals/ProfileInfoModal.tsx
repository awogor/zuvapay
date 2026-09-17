'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/common/Toast';
import { useSupport } from '@/components/modals/SupportModal';
import {
  X,
  User,
  Phone,
  Mail,
  AtSign,
  Check,
  Loader2,
  Lock,
  ShieldCheck,
  Headphones,
  CheckCircle2,
} from 'lucide-react';

interface ProfileInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  autoFocusClaim?: boolean;
}

export function ProfileInfoModal({
  isOpen,
  onClose,
  autoFocusClaim = false,
}: ProfileInfoModalProps) {
  const { user, profile, updateProfile } = useAuth();
  const { success, error } = useToast();
  const { openSupport } = useSupport();

  const effectiveUsername = profile?.username || user?.user_metadata?.username;
  const effectiveGender =
    profile?.gender ||
    user?.user_metadata?.gender ||
    (profile?.title === 'Mrs' || profile?.title === 'Miss' ? 'Female' : 'Male');

  // Username claim states
  const [claimHandle, setClaimHandle] = useState('');
  const [isCheckingHandle, setIsCheckingHandle] = useState(false);
  const [handleStatus, setHandleStatus] = useState<{
    available?: boolean;
    message?: string;
  } | null>(null);
  const [isClaimingHandle, setIsClaimingHandle] = useState(false);
  const claimInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && autoFocusClaim && claimInputRef.current) {
      setTimeout(() => {
        claimInputRef.current?.focus();
      }, 200);
    }
  }, [isOpen, autoFocusClaim]);

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

  if (!isOpen) return null;

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

  const fullName = profile?.first_name
    ? `${profile?.title ? `${profile.title} ` : ''}${profile.first_name} ${profile.last_name || ''}`.trim()
    : user?.user_metadata?.first_name
    ? `${user?.user_metadata?.title ? `${user.user_metadata.title} ` : ''}${user.user_metadata.first_name} ${user.user_metadata.last_name || ''}`.trim()
    : 'Valued Customer';

  const phoneNumber = profile?.phone_number || user?.user_metadata?.phone || 'Not provided';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-100 dark:bg-orange-950/50 text-brand-orange flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-white">Profile Information</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Verified account identity details</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 space-y-5 overflow-y-auto">
          {/* User Avatar & Identity Header */}
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-white/10">
            <div className="relative flex-shrink-0">
              <img
                src={profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user?.email || profile?.first_name || 'KPUser')}`}
                alt="Avatar"
                className="w-14 h-14 rounded-full border-2 border-brand-orange/40 bg-orange-100 dark:bg-slate-800 object-cover shadow-sm"
              />
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 text-slate-950 border-2 border-white dark:border-slate-900 flex items-center justify-center shadow-sm">
                <CheckCircle2 className="w-3 h-3 stroke-[3]" />
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                  {fullName}
                </h3>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold">
                  Verified
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user?.email}</p>
              {effectiveUsername && (
                <span className="inline-block text-[11px] font-mono font-bold text-brand-orange mt-0.5">
                  @{effectiveUsername}
                </span>
              )}
            </div>
          </div>

          {/* Claim Username Box if not claimed */}
          {!effectiveUsername && (
            <div className="p-4 rounded-2xl border border-brand-orange/30 bg-gradient-to-br from-amber-500/10 via-brand-orange/5 to-transparent dark:bg-slate-950/60">
              <div className="flex items-center gap-2 mb-1.5">
                <div className="h-6 w-6 rounded-lg bg-brand-orange/20 text-brand-orange font-bold text-xs flex items-center justify-center">
                  @
                </div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Claim Your ZuvaPay Handle</h4>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-brand-orange text-slate-950 uppercase">
                  Free
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-3">
                Send & receive funds with your unique @username. Once chosen, your handle is permanent.
              </p>

              <form onSubmit={handleClaimUsername} className="space-y-2">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-brand-orange" />
                    <input
                      ref={claimInputRef}
                      type="text"
                      value={claimHandle}
                      onChange={(e) => setClaimHandle(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                      placeholder="e.g. adeleke_pay"
                      maxLength={20}
                      className="w-full pl-8 pr-8 py-2 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/10 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-brand-orange"
                    />
                    <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
                      {isCheckingHandle && <Loader2 className="w-3.5 h-3.5 text-slate-400 animate-spin" />}
                      {!isCheckingHandle && handleStatus?.available === true && <Check className="w-3.5 h-3.5 text-emerald-500" />}
                      {!isCheckingHandle && handleStatus?.available === false && <X className="w-3.5 h-3.5 text-rose-500" />}
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={!handleStatus?.available || isClaimingHandle}
                    className="px-4 py-2 rounded-xl bg-brand-orange hover:bg-orange-600 text-slate-950 font-bold text-xs transition-all disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {isClaimingHandle ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Claim'}
                  </button>
                </div>
                {handleStatus && (
                  <p className={`text-[10px] font-medium ${handleStatus.available ? 'text-emerald-500' : 'text-rose-400'}`}>
                    {handleStatus.message}
                  </p>
                )}
              </form>
            </div>
          )}

          {/* Locked Identity Details */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Identity Details</span>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-500 dark:text-slate-400">
                <Lock className="w-3 h-3 text-amber-500" />
                Locked (Non-Editable)
              </span>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50/80 dark:bg-slate-950/40 divide-y divide-slate-200/70 dark:divide-white/5 overflow-hidden">
              {/* Full Name */}
              <div className="p-3 sm:p-3.5 flex items-center justify-between">
                <div>
                  <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider block">Legal Name</span>
                  <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">{fullName}</span>
                </div>
                <Lock className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              </div>

              {/* Gender */}
              <div className="p-3 sm:p-3.5 flex items-center justify-between">
                <div>
                  <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider block">Gender</span>
                  <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">{effectiveGender}</span>
                </div>
                <Lock className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              </div>

              {/* Phone Number */}
              <div className="p-3 sm:p-3.5 flex items-center justify-between">
                <div>
                  <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider block">Phone Number</span>
                  <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white font-mono">{phoneNumber}</span>
                </div>
                <Lock className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              </div>

              {/* Email Address */}
              <div className="p-3 sm:p-3.5 flex items-center justify-between">
                <div>
                  <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider block">Registered Email</span>
                  <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate block">{user?.email}</span>
                </div>
                <Lock className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              </div>

              {/* Handle */}
              {effectiveUsername && (
                <div className="p-3 sm:p-3.5 flex items-center justify-between">
                  <div>
                    <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider block">ZuvaPay Handle</span>
                    <span className="text-xs sm:text-sm font-bold font-mono text-brand-orange">@{effectiveUsername}</span>
                  </div>
                  <Lock className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                </div>
              )}
            </div>
          </div>

          {/* Security & KYC Notice Card */}
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-300 text-xs space-y-2">
            <div className="flex items-center gap-2 font-bold text-amber-800 dark:text-amber-400">
              <ShieldCheck className="w-4 h-4 text-brand-orange flex-shrink-0" />
              <span>KYC & Identity Protection Active</span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-600 dark:text-slate-400">
              To safeguard your funds and maintain regulatory compliance, personal identity details (legal name, gender, phone number, and handle) cannot be modified from the app. Only your <strong>login password</strong> and <strong>transaction PIN</strong> are editable.
            </p>
            <div className="pt-1">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  openSupport({
                    issue: 'Request Legal Name / Phone Correction',
                    service: 'Account Identity Management',
                  });
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-900 dark:text-amber-300 font-bold text-xs transition-colors"
              >
                <Headphones className="w-3.5 h-3.5 text-brand-orange" />
                <span>Contact Support for Corrections</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
