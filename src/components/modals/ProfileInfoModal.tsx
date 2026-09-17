'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/common/Toast';
import {
  X,
  User,
  Phone,
  Mail,
  AtSign,
  Check,
  Loader2,
  Save,
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

  const effectiveUsername = profile?.username || user?.user_metadata?.username;

  const [title, setTitle] = useState(profile?.title || 'Mr');
  const [firstName, setFirstName] = useState(profile?.first_name || '');
  const [lastName, setLastName] = useState(profile?.last_name || '');
  const [phoneNumber, setPhoneNumber] = useState(profile?.phone_number || '');
  const [loading, setLoading] = useState(false);

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
    if (profile) {
      if (profile.title) setTitle(profile.title);
      if (profile.first_name) setFirstName(profile.first_name);
      if (profile.last_name) setLastName(profile.last_name);
      if (profile.phone_number) setPhoneNumber(profile.phone_number);
    }
  }, [profile]);

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
        onClose();
      }
    } catch (err: any) {
      error('Error', err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-lg rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-100 dark:bg-orange-950/50 text-brand-orange flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-white">Profile Information</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">View and update your personal details</p>
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
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* User Avatar & Identity Header */}
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-white/10">
            <img
              src={profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user?.email || profile?.first_name || 'KPUser')}`}
              alt="Avatar"
              className="w-14 h-14 rounded-full border-2 border-brand-orange/40 bg-orange-100 dark:bg-slate-800 object-cover shadow-sm flex-shrink-0"
            />
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                {profile?.title ? `${profile.title} ` : ''}{firstName} {lastName}
              </h3>
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
                Send & receive funds with your unique @username.
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

          {/* Form Fields */}
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Title
                </label>
                <select
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs font-medium focus:outline-none focus:border-brand-orange"
                >
                  <option value="Mr">Mr</option>
                  <option value="Mrs">Mrs</option>
                  <option value="Miss">Miss</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs font-medium focus:outline-none focus:border-brand-orange"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Last Name
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs font-medium focus:outline-none focus:border-brand-orange"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="08012345678"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs font-medium focus:outline-none focus:border-brand-orange"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-950/40 border border-slate-200 dark:border-white/5 text-slate-500 dark:text-slate-400 text-xs font-medium cursor-not-allowed"
                />
              </div>
            </div>

            {effectiveUsername && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  ZuvaPay Handle
                </label>
                <div className="relative">
                  <AtSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-orange" />
                  <input
                    type="text"
                    value={`@${effectiveUsername}`}
                    disabled
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-950/40 border border-slate-200 dark:border-white/5 text-brand-orange font-bold text-xs cursor-not-allowed"
                  />
                </div>
              </div>
            )}

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-brand-orange to-amber-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black text-xs shadow-md transition-all disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {loading ? 'Saving Changes...' : 'Save Profile Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
