'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/common/Toast';
import { Mail, Lock, ArrowRight, AtSign, ArrowLeft, Eye, EyeOff } from 'lucide-react';

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signIn, isMockMode } = useAuth();
  const { success, error } = useToast();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('zuvapay_session_expired');
      if (window.location.search) {
        window.history.replaceState({}, '', window.location.pathname);
      }
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanIdentifier = identifier.trim();
    if (!cleanIdentifier || !password) {
      error('Required Fields', 'Please enter your email or username, and password');
      return;
    }

    setLoading(true);
    try {
      let targetEmail = cleanIdentifier;

      // If user typed a username (starts with @ or doesn't have an email domain format)
      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanIdentifier);
      if (!isEmail) {
        const resolveRes = await fetch('/api/auth/resolve-identifier', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ identifier: cleanIdentifier }),
        });
        const resolveData = await resolveRes.json();

        if (!resolveRes.ok || !resolveData.email) {
          setLoading(false);
          error('Sign In Failed', resolveData.error || 'No account found with this username');
          return;
        }
        targetEmail = resolveData.email;
      }

      const res = await signIn(targetEmail, password);
      if (res.error) {
        error('Sign In Failed', res.error);
        fetch('/api/auth/login-track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'failed', failureReason: res.error }),
        }).catch(() => {});
      } else {
        fetch('/api/auth/login-track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'success' }),
        }).catch(() => {});

        success('Welcome Back!', 'Successfully signed in to your ZuvaPay account.');
        window.location.href = '/dashboard';
      }
    } catch (err: any) {
      error('Error', err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async () => {
    setIdentifier('davidadeleke');
    setPassword('password123');
    setLoading(true);
    await signIn('david@zuvapay.com', 'password123');
    success('Demo Access Granted', 'Signed in as verified user @davidadeleke');
    window.location.href = '/dashboard';
    setLoading(false);
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-center items-center py-8 sm:py-10 px-4 bg-[#FFF9F3] bg-gradient-to-br from-[#FFF5EC] via-[#FFF9F4] to-[#FFF0E2] relative overflow-y-auto selection:bg-brand-orange selection:text-white">
      {/* Background ambient solar glow orbs */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-[#FF6B00]/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 h-96 w-96 rounded-full bg-[#F59E0B]/12 blur-[100px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[480px] w-[480px] rounded-full bg-[#FFF0E0]/60 blur-[120px] pointer-events-none" />

      {/* Floating Home Back Button */}
      <Link
        href="/"
        className="absolute top-4 left-4 sm:top-5 sm:left-5 z-20 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/90 hover:bg-white text-slate-700 hover:text-slate-900 border border-slate-200 shadow-sm text-xs font-bold transition-all backdrop-blur-md"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Home</span>
      </Link>

      {/* Main Login Card - Compact, sleek, responsive */}
      <div className="relative z-10 w-full max-w-[400px] rounded-2xl sm:rounded-3xl border border-slate-200/90 bg-white p-4.5 sm:p-6 shadow-[0_20px_50px_-12px_rgba(255,107,0,0.12),0_8px_24px_-8px_rgba(15,23,42,0.06)] ring-1 ring-slate-900/5 my-auto">
        {/* Header with popping brand logo and black heading */}
        <div className="text-center mb-3 sm:mb-3.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-orange to-amber-500 flex items-center justify-center font-black text-lg text-slate-950 shadow-md shadow-orange-500/20 mx-auto mb-1.5 ring-2 ring-orange-500/15">
            ZP
          </div>
          <h1 className="text-lg sm:text-xl font-black tracking-tight text-slate-900">
            Welcome Back
          </h1>
          <p className="text-[11px] sm:text-xs text-slate-500 font-medium mt-0.5">
            Enter your details to continue to your dashboard
          </p>
        </div>

        <div className="space-y-3">
          {isMockMode && (
            <div className="p-2 rounded-xl bg-amber-50 border border-amber-200/80 text-xs text-amber-900 flex items-center justify-between">
              <span className="text-[11px] font-medium text-amber-800">Demo User: @davidadeleke</span>
              <button
                onClick={handleQuickDemo}
                type="button"
                className="px-2 py-0.5 rounded-lg bg-brand-orange text-slate-950 font-bold text-[11px] shadow-sm hover:opacity-90"
              >
                1-Click Demo
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Username / Email Field - With brand icon background */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Username or Email
              </label>
              <div className="flex items-center gap-2.5 p-1 sm:p-1.5 rounded-xl sm:rounded-2xl bg-slate-50 border border-slate-200 focus-within:border-brand-orange focus-within:bg-white focus-within:ring-2 focus-within:ring-orange-500/15 transition-all shadow-sm">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-brand-orange/10 text-brand-orange flex items-center justify-center flex-shrink-0">
                  {identifier.startsWith('@') ? (
                    <AtSign className="w-4 h-4 text-brand-orange" />
                  ) : (
                    <Mail className="w-4 h-4 text-brand-orange" />
                  )}
                </div>
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="Enter your username or email"
                  required
                  autoCapitalize="none"
                  autoCorrect="off"
                  className="w-full bg-transparent text-xs sm:text-sm font-semibold text-slate-900 placeholder-slate-400 focus:outline-none py-1 pr-2.5"
                />
              </div>
            </div>

            {/* Password Field - With brand icon background & Forgot password on top */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-bold text-slate-700">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs font-bold text-brand-orange hover:text-amber-600 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="flex items-center gap-2.5 p-1 sm:p-1.5 rounded-xl sm:rounded-2xl bg-slate-50 border border-slate-200 focus-within:border-brand-orange focus-within:bg-white focus-within:ring-2 focus-within:ring-orange-500/15 transition-all shadow-sm">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-brand-orange/10 text-brand-orange flex items-center justify-center flex-shrink-0">
                  <Lock className="w-4 h-4 text-brand-orange" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="w-full bg-transparent text-xs sm:text-sm font-semibold text-slate-900 placeholder-slate-400 focus:outline-none py-1"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 transition-colors flex-shrink-0 mr-1"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Sleek Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-xl bg-gradient-to-r from-brand-orange to-amber-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-bold text-xs sm:text-sm transition-all shadow-md shadow-orange-500/20 disabled:opacity-50 flex items-center justify-center gap-1.5 active:scale-[0.99] mt-1"
            >
              <span>{loading ? 'Signing in...' : 'Log In'}</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </form>

          {/* Security Notice Pill */}
          <div className="p-2 sm:p-2.5 rounded-xl bg-orange-500/5 border border-orange-500/15 text-slate-700 text-xs flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-lg bg-brand-orange/10 text-brand-orange flex items-center justify-center flex-shrink-0">
              <Lock className="w-3 h-3 stroke-[2.5]" />
            </div>
            <span className="text-[11px] font-medium text-slate-600 leading-snug">
              Protected by 256-bit financial encryption
            </span>
          </div>
        </div>

        {/* Register Footer Link */}
        <div className="pt-3 text-center text-xs text-slate-600 border-t border-slate-100 mt-3">
          Don't have an account?{' '}
          <Link href="/signup" className="font-black text-brand-orange hover:underline">
            Register
          </Link>
        </div>
      </div>
    </div>
  );
}

export function LoginPageView() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500 text-xs">
          Loading ZuvaPay Sign In...
        </div>
      }
    >
      <LoginFormContent />
    </Suspense>
  );
}
