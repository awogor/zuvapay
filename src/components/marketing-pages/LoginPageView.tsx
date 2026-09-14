'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/common/Toast';
import { Mail, Lock, ArrowRight, AtSign, ArrowLeft } from 'lucide-react';

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signIn, isMockMode } = useAuth();
  const { success, error } = useToast();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
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
        // Full window navigation ensures fresh SSR session and wallet hydration
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
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 bg-gradient-to-br from-orange-50/80 via-amber-50/40 to-slate-100/90 relative overflow-hidden selection:bg-zuva-solar selection:text-white">
      {/* Background ambient solar glow orbs */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-zuva-solar/15 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 h-96 w-96 rounded-full bg-zuva-amber/15 blur-[120px] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:24px_24px] opacity-60 pointer-events-none" />

      {/* Floating back button */}
      <Link
        href="/"
        className="absolute top-6 left-6 z-20 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/80 hover:bg-white border border-slate-200 shadow-sm text-xs font-bold text-slate-700 hover:text-slate-950 transition-all backdrop-blur-md"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Home</span>
      </Link>

      {/* Form Container - Pops Out Crisp & Clean */}
      <div className="relative z-10 w-full max-w-md rounded-[28px] border border-slate-200/90 bg-white/95 p-8 sm:p-10 shadow-[0_25px_60px_-15px_rgba(255,107,0,0.12),0_12px_30px_-10px_rgba(15,23,42,0.08)] backdrop-blur-xl ring-1 ring-slate-900/5">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center space-y-3 mb-8">
          <Link href="/" className="group">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-zuva-solar via-zuva-amber to-zuva-gold font-black text-xl text-slate-950 shadow-md shadow-orange-500/25 group-hover:scale-105 transition-transform duration-200">
              ZP
            </div>
          </Link>
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-950 font-display">
              Welcome to Zuva<span className="text-transparent bg-clip-text bg-gradient-to-r from-zuva-solar to-zuva-amber">Pay</span>
            </h1>
            <p className="text-xs text-slate-500">
              Sign in to manage your wallet, SME data, utilities, and dollar cards
            </p>
          </div>
        </div>

        {isMockMode && (
          <div className="mb-6 p-3.5 rounded-2xl bg-amber-50 border border-amber-200/80 text-xs text-amber-900 flex items-center justify-between">
            <div>
              <span className="font-bold block text-amber-950">Demo Mode Active</span>
              <span className="text-[11px] text-amber-700">Login with username @davidadeleke</span>
            </div>
            <button
              onClick={handleQuickDemo}
              type="button"
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-zuva-solar to-zuva-amber text-white font-bold text-xs shadow-sm hover:opacity-90 transition-opacity"
            >
              1-Click Demo
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Email Address or @Username
            </label>
            <div className="relative">
              {identifier.startsWith('@') ? (
                <AtSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zuva-solar" />
              ) : (
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              )}
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="name@example.com or @username"
                required
                autoCapitalize="none"
                autoCorrect="off"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50/90 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-zuva-solar focus:ring-4 focus:ring-orange-500/10 text-xs font-medium transition-all"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-bold text-slate-700">Password</label>
              <Link
                href="/forgot-password"
                className="text-xs font-bold text-zuva-solar hover:text-orange-700 hover:underline transition-colors"
              >
                Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50/90 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-zuva-solar focus:ring-4 focus:ring-orange-500/10 text-xs font-medium transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-zuva-solar to-zuva-amber hover:from-orange-600 hover:to-amber-600 text-white font-bold text-sm transition-all shadow-lg shadow-orange-500/25 hover:shadow-orange-500/35 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In to ZuvaPay'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-100 text-center text-xs text-slate-500">
          Don't have an account yet?{' '}
          <Link href="/signup" className="font-bold text-zuva-solar hover:text-orange-700 hover:underline">
            Create Account
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
