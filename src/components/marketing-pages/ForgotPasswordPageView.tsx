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
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 bg-gradient-to-br from-orange-50/80 via-amber-50/40 to-slate-100/90 relative overflow-hidden selection:bg-zuva-solar selection:text-white">
      {/* Background ambient solar glow orbs */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-zuva-solar/15 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 h-96 w-96 rounded-full bg-zuva-amber/15 blur-[120px] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:24px_24px] opacity-60 pointer-events-none" />

      {/* Form Container - Pops Out Crisp & Clean */}
      <div className="relative z-10 w-full max-w-md rounded-[28px] border border-slate-200/90 bg-white/95 p-8 sm:p-10 shadow-[0_25px_60px_-15px_rgba(255,107,0,0.12),0_12px_30px_-10px_rgba(15,23,42,0.08)] backdrop-blur-xl ring-1 ring-slate-900/5">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Login
        </Link>

        {/* Brand Header */}
        <div className="flex flex-col items-center text-center space-y-3 mb-8">
          <Link href="/" className="group">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-zuva-solar via-zuva-amber to-zuva-gold font-black text-xl text-slate-950 shadow-md shadow-orange-500/25 group-hover:scale-105 transition-transform duration-200">
              ZP
            </div>
          </Link>
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-950 font-display">
              Reset Password
            </h1>
            <p className="text-xs text-slate-500">
              Enter your registered email address and we'll send you a password recovery link.
            </p>
          </div>
        </div>

        {submitted ? (
          <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3">
            <p className="text-sm font-bold text-emerald-800">Recovery Email Dispatched</p>
            <p className="text-xs text-slate-600 leading-relaxed">
              If an account matches <strong>{email}</strong>, you will receive a secure reset link shortly.
            </p>
            <Link
              href="/login"
              className="inline-block mt-2 px-5 py-2.5 rounded-xl bg-slate-900 text-xs font-bold text-white hover:bg-slate-800 transition-colors shadow-sm"
            >
              Return to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Account Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  autoCapitalize="none"
                  autoCorrect="off"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50/90 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-zuva-solar focus:ring-4 focus:ring-orange-500/10 text-xs font-medium transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-zuva-solar to-zuva-amber hover:from-orange-600 hover:to-amber-600 text-white font-bold text-sm transition-all shadow-lg shadow-orange-500/25 hover:shadow-orange-500/35 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              {loading ? 'Sending...' : 'Send Recovery Link'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
