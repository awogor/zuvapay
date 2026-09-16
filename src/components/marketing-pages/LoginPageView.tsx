'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/common/Toast';
import { Mail, Lock, ArrowRight, AtSign, Eye, EyeOff } from 'lucide-react';

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
    <div className="min-h-screen w-full flex flex-col justify-center items-center py-6 px-4 sm:py-12 bg-white sm:bg-[#FFF9F3] sm:bg-gradient-to-br sm:from-[#FFF5EC] sm:via-[#FFF9F4] sm:to-[#FFF0E2] relative overflow-y-auto selection:bg-brand-orange selection:text-white">
      {/* Background ambient solar glow orbs - visible on desktop */}
      <div className="hidden sm:block absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-[#FF6B00]/10 blur-[100px] pointer-events-none" />
      <div className="hidden sm:block absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 h-96 w-96 rounded-full bg-[#F59E0B]/12 blur-[100px] pointer-events-none" />
      <div className="hidden sm:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[480px] w-[480px] rounded-full bg-[#FFF0E0]/60 blur-[120px] pointer-events-none" />

      {/* Main Login Form Container - Full width dynamic on mobile, sleek centered card on desktop */}
      <div className="relative z-10 w-full max-w-md rounded-3xl border-0 sm:border sm:border-slate-200/90 bg-white p-4 sm:p-8 sm:shadow-[0_20px_50px_-12px_rgba(255,107,0,0.12),0_8px_24px_-8px_rgba(15,23,42,0.06)] sm:ring-1 sm:ring-slate-900/5 my-auto">
        
        {/* 1 & 2: Clickable Logo Mark centered directly above Welcome Back (Back to Home button removed) */}
        <div className="text-center mb-6">
          <Link
            href="/"
            className="inline-block transition-transform active:scale-95 group mb-3"
            title="Back to Home"
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-orange via-amber-500 to-amber-400 flex items-center justify-center font-black text-xl text-slate-950 shadow-md shadow-orange-500/25 group-hover:scale-105 transition-transform duration-200 mx-auto ring-2 ring-orange-500/20">
              ZP
            </div>
          </Link>
          <h1 className="text-2xl sm:text-2xl font-black tracking-tight text-slate-900">
            Welcome Back
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            Enter your details to continue to your dashboard
          </p>
        </div>

        <div className="space-y-4 w-full">
          {isMockMode && (
            <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200/80 text-xs text-amber-900 flex items-center justify-between">
              <span className="text-xs font-medium text-amber-800">Demo User: @davidadeleke</span>
              <button
                onClick={handleQuickDemo}
                type="button"
                className="px-2.5 py-1 rounded-lg bg-brand-orange text-slate-950 font-bold text-xs shadow-sm hover:opacity-90"
              >
                1-Click Demo
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username / Email Field - Circular icon, bold text, no white background box */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Username or Email
              </label>
              <div className="flex items-center gap-3 p-1.5 rounded-2xl bg-slate-50 border border-slate-200 focus-within:border-brand-orange focus-within:ring-2 focus-within:ring-orange-500/15 transition-all shadow-sm">
                <div className="w-10 h-10 rounded-full bg-brand-orange/10 text-brand-orange flex items-center justify-center flex-shrink-0">
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
                  style={{ backgroundColor: 'transparent' }}
                  className="w-full bg-transparent border-0 outline-none ring-0 shadow-none text-sm sm:text-base font-bold text-slate-900 placeholder:text-slate-400 placeholder:font-normal py-2 sm:py-2.5 pr-3 focus:outline-none focus:ring-0 leading-relaxed appearance-none"
                />
              </div>
            </div>

            {/* Password Field - Circular icon, bold text, no white background box */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
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
              <div className="flex items-center gap-3 p-1.5 rounded-2xl bg-slate-50 border border-slate-200 focus-within:border-brand-orange focus-within:ring-2 focus-within:ring-orange-500/15 transition-all shadow-sm">
                <div className="w-10 h-10 rounded-full bg-brand-orange/10 text-brand-orange flex items-center justify-center flex-shrink-0">
                  <Lock className="w-4 h-4 text-brand-orange" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  style={{ backgroundColor: 'transparent' }}
                  className="w-full bg-transparent border-0 outline-none ring-0 shadow-none text-sm sm:text-base font-bold text-slate-900 placeholder:text-slate-400 placeholder:font-normal py-2 sm:py-2.5 focus:outline-none focus:ring-0 leading-relaxed appearance-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-2 text-slate-400 hover:text-slate-700 transition-colors flex-shrink-0 mr-1"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Full Width Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-brand-orange to-amber-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black text-sm transition-all shadow-md shadow-orange-500/20 disabled:opacity-50 flex items-center justify-center gap-2 active:scale-[0.99] mt-2"
            >
              <span>{loading ? 'Signing in...' : 'Log In'}</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </form>

          {/* Security Notice Pill */}
          <div className="p-2.5 rounded-xl bg-orange-500/5 border border-orange-500/15 text-slate-700 text-xs flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-brand-orange/10 text-brand-orange flex items-center justify-center flex-shrink-0">
              <Lock className="w-3.5 h-3.5 stroke-[2.5]" />
            </div>
            <span className="text-xs font-medium text-slate-600 leading-snug">
              Protected by 256-bit financial encryption
            </span>
          </div>

          {/* 4: Shifted Up Register Link directly below the security pill */}
          <div className="pt-4 text-center text-xs sm:text-sm text-slate-600 border-t border-slate-100">
            Don't have an account?{' '}
            <Link href="/signup" className="font-black text-brand-orange hover:underline ml-1">
              Register
            </Link>
          </div>
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
