'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/components/common/Toast';
import { Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';

export default function ResetPasswordPage() {
  const router = useRouter();
  const supabase = createClient();
  const { success, error } = useToast();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isDone, setIsDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password || password.length < 6) {
      error('Weak Password', 'Password must be at least 6 characters long');
      return;
    }

    if (password !== confirmPassword) {
      error('Mismatch', 'The passwords entered do not match');
      return;
    }

    setLoading(true);
    try {
      const { error: updateErr } = await supabase.auth.updateUser({
        password: password,
      });

      if (updateErr) throw updateErr;

      setIsDone(true);
      success('Password Updated', 'Your password has been changed securely.');
      setTimeout(() => {
        router.push('/login');
      }, 2500);
    } catch (err: any) {
      error('Password Update Failed', err.message || 'Could not update password. Please try requesting a new link.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[100dvh] min-h-[100dvh] max-h-[100dvh] w-full flex flex-col justify-center items-center px-4 py-2 sm:p-0 bg-white sm:bg-[#FFF9F3] sm:bg-gradient-to-br sm:from-[#FFF5EC] sm:via-[#FFF9F4] sm:to-[#FFF0E2] relative overflow-y-auto sm:overflow-hidden selection:bg-brand-orange selection:text-white">
      {/* Background ambient solar glow orbs */}
      <div className="hidden sm:block absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-[#FF6B00]/10 blur-[100px] pointer-events-none" />
      <div className="hidden sm:block absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 h-96 w-96 rounded-full bg-[#F59E0B]/12 blur-[100px] pointer-events-none" />
      <div className="hidden sm:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[480px] w-[480px] rounded-full bg-[#FFF0E0]/60 blur-[120px] pointer-events-none" />

      {/* Form Container - Stays exactly in the middle with zero scrolling */}
      <div className="relative z-10 w-full max-w-[400px] rounded-3xl border-0 sm:border sm:border-slate-200/90 bg-white p-3 sm:p-6 sm:shadow-[0_20px_50px_-12px_rgba(255,107,0,0.12),0_8px_24px_-8px_rgba(15,23,42,0.06)] sm:ring-1 sm:ring-slate-900/5">
        
        {/* Clickable Logo Mark centered directly above Heading */}
        <div className="text-center mb-4">
          <Link
            href="/"
            className="inline-block transition-transform active:scale-95 group mb-2"
            title="Back to Home"
          >
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-brand-orange via-amber-500 to-amber-400 flex items-center justify-center font-black text-lg sm:text-xl text-slate-950 shadow-md shadow-orange-500/25 group-hover:scale-105 transition-transform duration-200 mx-auto ring-2 ring-orange-500/20">
              ZP
            </div>
          </Link>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
            Set New Password
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Create a strong new password for your account
          </p>
        </div>

        {isDone ? (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
            <p className="text-sm font-bold text-emerald-800">Password Changed Successfully!</p>
            <p className="text-xs text-slate-600">
              You will be redirected to the sign in page in a moment...
            </p>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 mt-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-orange to-amber-500 text-slate-950 text-xs font-black shadow-md shadow-orange-500/20"
            >
              Sign In Now <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                New Password
              </label>
              <div className="flex items-center gap-2.5 p-1 sm:p-1.5 rounded-2xl bg-slate-50 border border-slate-200 focus-within:border-brand-orange focus-within:ring-2 focus-within:ring-orange-500/15 transition-all shadow-sm">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-brand-orange/10 text-brand-orange flex items-center justify-center flex-shrink-0">
                  <Lock className="w-4 h-4 text-brand-orange" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  required
                  style={{ backgroundColor: 'transparent' }}
                  className="w-full bg-transparent border-0 outline-none ring-0 shadow-none text-sm font-bold text-slate-900 placeholder:text-slate-400 placeholder:font-normal py-1.5 sm:py-2 focus:outline-none focus:ring-0 leading-normal appearance-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-2 text-slate-400 hover:text-slate-700 transition-colors flex-shrink-0 mr-0.5"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Confirm New Password
              </label>
              <div className="flex items-center gap-2.5 p-1 sm:p-1.5 rounded-2xl bg-slate-50 border border-slate-200 focus-within:border-brand-orange focus-within:ring-2 focus-within:ring-orange-500/15 transition-all shadow-sm">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-brand-orange/10 text-brand-orange flex items-center justify-center flex-shrink-0">
                  <Lock className="w-4 h-4 text-brand-orange" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  required
                  style={{ backgroundColor: 'transparent' }}
                  className="w-full bg-transparent border-0 outline-none ring-0 shadow-none text-sm font-bold text-slate-900 placeholder:text-slate-400 placeholder:font-normal py-1.5 sm:py-2 focus:outline-none focus:ring-0 leading-normal appearance-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-xl bg-gradient-to-r from-brand-orange to-amber-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black text-sm transition-all shadow-md shadow-orange-500/20 disabled:opacity-50 flex items-center justify-center gap-2 active:scale-[0.99] mt-1"
            >
              <span>{loading ? 'Updating Password...' : 'Save New Password'}</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </form>
        )}

        <div className="pt-3 text-center text-xs text-slate-600 border-t border-slate-100 mt-3">
          Remember your password?{' '}
          <Link href="/login" className="font-black text-brand-orange hover:underline ml-1">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
