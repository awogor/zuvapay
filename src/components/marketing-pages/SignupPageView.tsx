'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/common/Toast';
import { Mail, Lock, User, Phone, ArrowRight, ShieldCheck, ArrowLeft } from 'lucide-react';

export function SignupPageView() {
  const router = useRouter();
  const { signUp } = useAuth();
  const { success, error } = useToast();

  const [formData, setFormData] = useState({
    title: 'Mr',
    firstName: '',
    lastName: '',
    username: '',
    phone: '',
    email: '',
    password: '',
  });

  const [loading, setLoading] = useState(false);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [usernameFeedback, setUsernameFeedback] = useState<string>('');

  // Debounced username availability checker
  useEffect(() => {
    const rawUsername = formData.username.trim().toLowerCase().replace(/^@/, '');
    if (!rawUsername || rawUsername.length < 3) {
      setUsernameAvailable(null);
      setUsernameFeedback('');
      return;
    }

    const timer = setTimeout(async () => {
      setCheckingUsername(true);
      try {
        const res = await fetch(`/api/users/check-username?username=${encodeURIComponent(rawUsername)}`);
        const data = await res.json();
        if (res.ok) {
          setUsernameAvailable(data.available);
          setUsernameFeedback(data.message || (data.available ? 'Username is available!' : 'Username is already taken'));
        }
      } catch (err) {
        console.warn('Username check error:', err);
      } finally {
        setCheckingUsername(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [formData.username]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName || !formData.email || !formData.password || !formData.phone) {
      error('Missing Information', 'Please complete all required fields');
      return;
    }

    if (usernameAvailable === false) {
      error('Username Unavailable', usernameFeedback || 'Please choose a different username');
      return;
    }

    if (formData.password.length < 6) {
      error('Password Too Short', 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const res = await signUp({
        title: formData.title,
        username: formData.username.trim(),
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
      });

      if (res.error) {
        error('Registration Failed', res.error);
      } else if (res.requiresEmailVerification) {
        success('Account Created', 'Please check your email to verify your account.');
        router.push('/login?registered=true');
      } else {
        // Send branded welcome onboarding email
        fetch('/api/email/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: formData.email,
            templateType: 'welcome',
            data: {
              name: `${formData.firstName} ${formData.lastName}`.trim(),
            },
          }),
        }).catch(() => {});

        success('Welcome to ZuvaPay!', 'Your account has been created.');
        router.push('/dashboard');
      }
    } catch (err: any) {
      error('Registration Error', err.message || 'An error occurred during registration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-orange-50/80 via-amber-50/40 to-slate-100/90 relative overflow-hidden selection:bg-zuva-solar selection:text-white">
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
      <div className="relative z-10 w-full max-w-lg rounded-[28px] border border-slate-200/90 bg-white/95 p-8 sm:p-10 shadow-[0_25px_60px_-15px_rgba(255,107,0,0.12),0_12px_30px_-10px_rgba(15,23,42,0.08)] backdrop-blur-xl ring-1 ring-slate-900/5 my-8">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center space-y-3 mb-8">
          <Link href="/" className="group">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-zuva-solar via-zuva-amber to-zuva-gold font-black text-xl text-slate-950 shadow-md shadow-orange-500/25 group-hover:scale-105 transition-transform duration-200">
              ZP
            </div>
          </Link>
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-950 font-display">
              Create Your Account
            </h1>
            <p className="text-xs text-slate-500">
              One unified wallet for cheap SME data, electricity tokens, virtual dollar cards, and bill payments
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title and First Name row */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-1">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Title
              </label>
              <select
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-3 py-3 rounded-xl bg-slate-50/90 border border-slate-200 text-slate-900 focus:outline-none focus:bg-white focus:border-zuva-solar focus:ring-4 focus:ring-orange-500/10 text-xs font-medium transition-all"
              >
                <option value="Mr">Mr</option>
                <option value="Mrs">Mrs</option>
                <option value="Miss">Miss</option>
              </select>
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                First Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="e.g. David"
                  required
                  className="w-full pl-10 pr-3.5 py-3 rounded-xl bg-slate-50/90 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-zuva-solar focus:ring-4 focus:ring-orange-500/10 text-xs font-medium transition-all"
                />
              </div>
            </div>
          </div>

          {/* Last Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Last Name
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="e.g. Adeleke"
                required
                className="w-full pl-10 pr-3.5 py-3 rounded-xl bg-slate-50/90 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-zuva-solar focus:ring-4 focus:ring-orange-500/10 text-xs font-medium transition-all"
              />
            </div>
          </div>

          {/* Unique Username Field with @ prefix */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Choose Username (@handle)
            </label>
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-zuva-solar text-xs select-none">
                @
              </div>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="e.g. davidadeleke, chidi_fintech"
                required
                className="w-full pl-8 pr-28 py-3 rounded-xl bg-slate-50/90 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-zuva-solar focus:ring-4 focus:ring-orange-500/10 text-xs font-mono font-medium lowercase transition-all"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-semibold">
                {checkingUsername && <span className="text-slate-400 animate-pulse">Checking...</span>}
                {!checkingUsername && usernameAvailable === true && (
                  <span className="text-emerald-600 flex items-center gap-1 font-bold">✓ Available</span>
                )}
                {!checkingUsername && usernameAvailable === false && (
                  <span className="text-rose-600 flex items-center gap-1 font-bold">✕ Taken</span>
                )}
              </div>
            </div>
            {usernameFeedback && (
              <p className={`text-[11px] mt-1 font-medium ${usernameAvailable === false ? 'text-rose-600' : 'text-emerald-600'}`}>
                {usernameFeedback}
              </p>
            )}
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Phone Number
            </label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="08012345678"
                required
                className="w-full pl-10 pr-3.5 py-3 rounded-xl bg-slate-50/90 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-zuva-solar focus:ring-4 focus:ring-orange-500/10 text-xs font-medium transition-all"
              />
            </div>
          </div>

          {/* Email Address */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="name@example.com"
                required
                autoCapitalize="none"
                autoCorrect="off"
                className="w-full pl-10 pr-3.5 py-3 rounded-xl bg-slate-50/90 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-zuva-solar focus:ring-4 focus:ring-orange-500/10 text-xs font-medium transition-all"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
                className="w-full pl-10 pr-3.5 py-3 rounded-xl bg-slate-50/90 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-zuva-solar focus:ring-4 focus:ring-orange-500/10 text-xs font-medium transition-all"
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-1">Must be at least 6 characters</p>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading || usernameAvailable === false}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-zuva-solar to-zuva-amber hover:from-orange-600 hover:to-amber-600 text-white font-bold text-sm transition-all shadow-lg shadow-orange-500/25 hover:shadow-orange-500/35 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
            >
              {loading ? 'Creating Account...' : 'Create Free Account'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-100 text-center text-xs text-slate-500">
          Already have an account?{' '}
          <Link href="/login" className="font-bold text-zuva-solar hover:text-orange-700 hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
