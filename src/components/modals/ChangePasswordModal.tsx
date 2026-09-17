'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/common/Toast';
import { createClient } from '@/lib/supabase/client';
import {
  X,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ChangePasswordModal({ isOpen, onClose }: ChangePasswordModalProps) {
  const { user } = useAuth();
  const { success, error } = useToast();
  const supabase = createClient();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [isDone, setIsDone] = useState(false);

  if (!isOpen) return null;

  const resetForm = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setIsDone(false);
    setLoading(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword) {
      error('Current Password Required', 'Please enter your current password to confirm identity.');
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      error('Weak Password', 'New password must be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      error('Mismatch', 'The new passwords do not match.');
      return;
    }

    if (currentPassword === newPassword) {
      error('Same Password', 'New password cannot be identical to your current password.');
      return;
    }

    setLoading(true);
    try {
      if (user?.email) {
        const { error: verifyErr } = await supabase.auth.signInWithPassword({
          email: user.email,
          password: currentPassword,
        });

        if (verifyErr) {
          error('Incorrect Password', 'Your current password was entered incorrectly.');
          setLoading(false);
          return;
        }
      }

      const { error: updateErr } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateErr) {
        throw updateErr;
      }

      setIsDone(true);
      success('Password Updated! 🔒', 'Your account password has been updated securely.');
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (err: any) {
      error('Update Failed', err.message || 'Could not update password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div className="relative w-full max-w-md rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900 shadow-2xl p-5 sm:p-6 overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-orange/10 dark:bg-brand-orange/20 text-brand-orange flex items-center justify-center flex-shrink-0">
              <Lock className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                Change Password
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Update your account login password
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        {isDone ? (
          <div className="py-8 text-center space-y-3 animate-in fade-in">
            <div className="w-14 h-14 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto ring-4 ring-emerald-500/20">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-base font-black text-slate-900 dark:text-white">
              Password Changed Successfully
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
              Your new password is now active. Use it the next time you sign in to ZuvaPay.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5 pt-4">
            {/* Current Password */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Current Password
              </label>
              <div className="flex items-center gap-2 p-1 sm:p-1.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-white/10 focus-within:border-brand-orange focus-within:ring-2 focus-within:ring-orange-500/15 transition-all">
                <input
                  type={showCurrent ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  required
                  className="w-full bg-transparent border-0 outline-none ring-0 shadow-none text-xs sm:text-sm font-bold text-slate-900 dark:text-white placeholder:text-slate-400 placeholder:font-normal py-1 px-3 focus:outline-none focus:ring-0"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                New Password
              </label>
              <div className="flex items-center gap-2 p-1 sm:p-1.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-white/10 focus-within:border-brand-orange focus-within:ring-2 focus-within:ring-orange-500/15 transition-all">
                <input
                  type={showNew ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  required
                  minLength={6}
                  className="w-full bg-transparent border-0 outline-none ring-0 shadow-none text-xs sm:text-sm font-bold text-slate-900 dark:text-white placeholder:text-slate-400 placeholder:font-normal py-1 px-3 focus:outline-none focus:ring-0"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Confirm New Password
              </label>
              <div className="flex items-center gap-2 p-1 sm:p-1.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-white/10 focus-within:border-brand-orange focus-within:ring-2 focus-within:ring-orange-500/15 transition-all">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  required
                  minLength={6}
                  className="w-full bg-transparent border-0 outline-none ring-0 shadow-none text-xs sm:text-sm font-bold text-slate-900 dark:text-white placeholder:text-slate-400 placeholder:font-normal py-1 px-3 focus:outline-none focus:ring-0"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-300 text-xs flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-brand-orange flex-shrink-0 mt-0.5" />
              <p className="text-[11px] leading-relaxed">
                Choose a strong password with a mix of letters, numbers, and symbols. Never share your password or transaction PIN with anyone.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-xl bg-gradient-to-r from-brand-orange to-amber-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black text-xs sm:text-sm transition-all shadow-md shadow-orange-500/20 disabled:opacity-50 flex items-center justify-center gap-2 active:scale-[0.99]"
            >
              <span>{loading ? 'Updating Password...' : 'Save New Password'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
