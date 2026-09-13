'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/common/Toast';
import { Mail, Lock, ArrowRight, ShieldCheck, Clock, AtSign, User } from 'lucide-react';

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signIn, isMockMode } = useAuth();
  const { success, error } = useToast();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionExpiredNotice, setSessionExpiredNotice] = useState(false);

  useEffect(() => {
    const reason = searchParams?.get('reason');
    const localExpired = typeof window !== 'undefined' && localStorage.getItem('zuvapay_session_expired') === 'true';
    if (reason === 'session_expired' || localExpired) {
      setSessionExpiredNotice(true);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('zuvapay_session_expired');
        // Clean URL query parameters completely so the URL is always pristine /login
        if (window.location.search) {
          window.history.replaceState({}, '', window.location.pathname);
        }
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
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/4 h-80 w-80 rounded-full bg-brand-orange/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 h-80 w-80 rounded-full bg-brand-blue/10 blur-[100px] pointer-events-none" />

      <div className="relative w-full max-w-md rounded-3xl border border-white/10 bg-slate-900/80 p-8 shadow-2xl backdrop-blur-xl">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center space-y-2 mb-8">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-brand-orange to-amber-500 font-black text-2xl text-slate-950 shadow-xl shadow-orange-500/20">
            KP
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white mt-2">
            Welcome to Korrect<span className="text-brand-orange">Pay</span>
          </h1>
        </div>

        {sessionExpiredNotice && (
          <div className="mb-5 p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-start gap-2.5 animate-in fade-in">
            <Clock className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-bold text-amber-200">Session Expired Due to Inactivity</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                For your account security, you have been automatically signed out after 1 hour of inactivity. Please sign in again to continue.
              </p>
            </div>
          </div>
        )}

        {isMockMode && (
          <div className="mb-5 p-3 rounded-xl bg-brand-orange/10 border border-brand-orange/20 text-xs text-amber-300 flex items-center justify-between">
            <div>
              <span className="font-semibold block">Demo Mode Active</span>
              <span className="text-[10px] text-slate-400">Use email or username @davidadeleke</span>
            </div>
            <button
              onClick={handleQuickDemo}
              className="px-2.5 py-1 rounded-lg bg-brand-orange text-slate-950 font-bold hover:bg-amber-400 transition-colors"
            >
              1-Click Demo
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Email Address or @Username
            </label>
            <div className="relative">
              {identifier.startsWith('@') ? (
                <AtSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-orange" />
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
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950/80 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-brand-orange text-xs font-medium"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-semibold text-slate-300">Password</label>
              <Link
                href="/forgot-password"
                className="text-xs font-medium text-brand-orange hover:underline"
              >
                Forgot?
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
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950/80 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-brand-orange text-xs font-medium"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-zuva-solar to-zuva-amber hover:from-amber-600 hover:to-orange-600 text-white font-bold text-xs md:text-sm transition-all shadow-lg shadow-orange-500/20 disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In to ZuvaPay'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-400">
          Don't have an account yet?{' '}
          <Link href="/signup" className="font-bold text-zuva-solar hover:underline">
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#0B1120] text-slate-400 text-xs">
        Loading ZuvaPay Sign In...
      </div>
    }>
      <LoginFormContent />
    </Suspense>
  );
}
