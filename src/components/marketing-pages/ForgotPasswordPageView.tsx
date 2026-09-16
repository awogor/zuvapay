'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useToast } from '@/components/common/Toast';
import { Mail, ArrowLeft, Send } from 'lucide-react';

export function ForgotPasswordPageView() {
  const { success, error } = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      error('Email Required', 'Please provide your account email address');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to send recovery link');
      }

      setSubmitted(true);
      success('Reset Link Sent', 'Check your email inbox for password recovery instructions.');
    } catch (err: any) {
      error('Password Reset Error', err.message || 'Failed to send recovery link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-0 sm:py-10 sm:px-4 bg-white sm:bg-[#FFF9F3] sm:bg-gradient-to-br sm:from-[#FFF5EC] sm:via-[#FFF9F4] sm:to-[#FFF0E2] relative overflow-y-auto selection:bg-brand-orange selection:text-white">
      {/* Background ambient solar glow orbs - visible on desktop */}
      <div className="hidden sm:block absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-[#FF6B00]/10 blur-[100px] pointer-events-none" />
      <div className="hidden sm:block absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 h-96 w-96 rounded-full bg-[#F59E0B]/12 blur-[100px] pointer-events-none" />
      <div className="hidden sm:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[480px] w-[480px] rounded-full bg-[#FFF0E0]/60 blur-[120px] pointer-events-none" />

      {/* Form Container - Full width dynamic on mobile, sleek centered card on desktop */}
      <div className="relative z-10 w-full min-h-screen sm:min-h-0 sm:max-w-sm flex flex-col justify-between sm:justify-center rounded-none sm:rounded-3xl border-0 sm:border sm:border-slate-200/90 bg-white p-5 sm:p-7 sm:shadow-[0_20px_50px_-12px_rgba(255,107,0,0.12),0_8px_24px_-8px_rgba(15,23,42,0.06)] sm:ring-1 sm:ring-slate-900/5 sm:my-auto">
        <div className="flex items-center justify-between w-full mb-6 sm:mb-4">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border border-slate-200 shadow-sm text-xs font-bold transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Login</span>
          </Link>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-orange to-amber-500 flex items-center justify-center font-black text-base text-slate-950 shadow-md shadow-orange-500/20 ring-2 ring-orange-500/15">
            ZP
          </div>
        </div>

        <div className="flex-1 flex flex-col justify-center sm:block">
          {/* Clean Small Heading */}
          <div className="text-center mb-6 sm:mb-5">
            <h1 className="text-2xl sm:text-lg font-black tracking-tight text-slate-900">
              Reset Password
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Enter your account email to receive a password reset link
            </p>
          </div>

        {submitted ? (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
            <p className="text-xs font-bold text-emerald-800">Recovery Email Dispatched</p>
            <p className="text-xs text-slate-600 leading-relaxed">
              If an account matches <strong>{email}</strong>, a reset link has been sent.
            </p>
            <Link
              href="/login"
              className="inline-block mt-1 px-4 py-2 rounded-lg bg-slate-900 text-xs font-bold text-white hover:bg-slate-800 transition-colors"
            >
              Return to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Account Email
              </label>
              <div className="flex items-center gap-2.5 p-1 sm:p-1.5 rounded-xl sm:rounded-2xl bg-slate-50 border border-slate-200 focus-within:border-brand-orange focus-within:bg-white focus-within:ring-2 focus-within:ring-orange-500/15 transition-all shadow-sm">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-brand-orange/10 text-brand-orange flex items-center justify-center flex-shrink-0">
                  <Mail className="w-4 h-4 text-brand-orange" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  autoCapitalize="none"
                  autoCorrect="off"
                  className="w-full bg-transparent text-xs sm:text-sm font-semibold text-slate-900 placeholder-slate-400 focus:outline-none py-1 pr-2.5"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-1 flex items-center justify-center gap-1.5 py-3 rounded-xl bg-gradient-to-r from-zuva-solar to-zuva-amber hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs transition-all shadow-md shadow-orange-500/20 disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              {loading ? 'Sending...' : 'Send Recovery Link'}
            </button>
          </form>
        )}
        </div>

        {/* Return to login link */}
        <div className="pt-4 text-center text-xs text-slate-600 border-t border-slate-100 mt-6 sm:mt-4">
          Remember your password?{' '}
          <Link href="/login" className="font-black text-brand-orange hover:underline ml-1">
            Log In
          </Link>
        </div>
      </div>
    </div>
  );
}
