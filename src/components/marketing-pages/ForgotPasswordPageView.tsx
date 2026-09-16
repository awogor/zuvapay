'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useToast } from '@/components/common/Toast';
import { Mail, Send } from 'lucide-react';

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
    <div className="h-[100dvh] min-h-[100dvh] max-h-[100dvh] w-full flex flex-col justify-center items-center px-4 py-2 sm:p-0 bg-white sm:bg-[#FFF9F3] sm:bg-gradient-to-br sm:from-[#FFF5EC] sm:via-[#FFF9F4] sm:to-[#FFF0E2] relative overflow-y-auto sm:overflow-hidden selection:bg-brand-orange selection:text-white">
      {/* Background ambient solar glow orbs - visible on desktop */}
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
            Reset Password
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Enter your account email to receive a password reset link
          </p>
        </div>

        {submitted ? (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
            <p className="text-sm font-bold text-emerald-800">Recovery Email Dispatched</p>
            <p className="text-xs text-slate-600 leading-relaxed">
              If an account matches <strong>{email}</strong>, a reset link has been sent.
            </p>
            <Link
              href="/login"
              className="inline-block mt-2 px-5 py-2.5 rounded-xl bg-slate-900 text-xs font-bold text-white hover:bg-slate-800 transition-colors shadow-sm"
            >
              Return to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Account Email
              </label>
              <div className="flex items-center gap-2.5 p-1 sm:p-1.5 rounded-2xl bg-slate-50 border border-slate-200 focus-within:border-brand-orange focus-within:ring-2 focus-within:ring-orange-500/15 transition-all shadow-sm">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-brand-orange/10 text-brand-orange flex items-center justify-center flex-shrink-0">
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
                  style={{ backgroundColor: 'transparent' }}
                  className="w-full bg-transparent border-0 outline-none ring-0 shadow-none text-sm font-bold text-slate-900 placeholder:text-slate-400 placeholder:font-normal py-1.5 sm:py-2 pr-2.5 focus:outline-none focus:ring-0 leading-normal appearance-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-xl bg-gradient-to-r from-brand-orange to-amber-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black text-sm transition-all shadow-md shadow-orange-500/20 disabled:opacity-50 flex items-center justify-center gap-2 active:scale-[0.99] mt-1"
            >
              <Send className="w-4 h-4 stroke-[2.5]" />
              <span>{loading ? 'Sending...' : 'Send Recovery Link'}</span>
            </button>
          </form>
        )}

        {/* Return to login link */}
        <div className="pt-3 text-center text-xs text-slate-600 border-t border-slate-100 mt-3">
          Remember your password?{' '}
          <Link href="/login" className="font-black text-brand-orange hover:underline ml-1">
            Log In
          </Link>
        </div>
      </div>
    </div>
  );
}
