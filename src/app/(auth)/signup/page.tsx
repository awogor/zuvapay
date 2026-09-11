'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/common/Toast';
import { Mail, Lock, User, Phone, ArrowRight, ShieldCheck, AtSign, Check, X } from 'lucide-react';

export default function SignUpPage() {
  const router = useRouter();
  const { signUp } = useAuth();
  const { success, error } = useToast();

  const [formData, setFormData] = useState({
    title: 'Mr',
    username: '',
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    password: '',
  });
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [usernameFeedback, setUsernameFeedback] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'username') {
      const clean = value.toLowerCase().replace(/[^a-z0-9_]/g, '');
      setFormData((prev) => ({ ...prev, username: clean }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Debounced live username availability checking
  useEffect(() => {
    const raw = formData.username.trim();
    if (!raw) {
      setUsernameAvailable(null);
      setUsernameFeedback('');
      setCheckingUsername(false);
      return;
    }

    if (raw.length < 3) {
      setUsernameAvailable(false);
      setUsernameFeedback('Username must be at least 3 characters');
      setCheckingUsername(false);
      return;
    }

    const timer = setTimeout(async () => {
      setCheckingUsername(true);
      try {
        const res = await fetch(`/api/users/check-username?username=${encodeURIComponent(raw)}`);
        const data = await res.json();
        if (data.available) {
          setUsernameAvailable(true);
          setUsernameFeedback(data.message || `@${raw} is available!`);
        } else {
          setUsernameAvailable(false);
          setUsernameFeedback(data.error || `@${raw} is unavailable`);
        }
      } catch {
        setUsernameAvailable(null);
        setUsernameFeedback('');
      } finally {
        setCheckingUsername(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [formData.username]);

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
        // Send branded welcome/verification notice
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

        success('Account Created', 'Please check your email to verify your account.');
        router.push('/login');
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

        success('Welcome to KorrectPay!', 'Your account has been created.');
        router.push('/dashboard');
      }
    } catch (err: any) {
      error('Registration Error', err.message || 'An error occurred during registration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="absolute top-1/4 left-1/4 h-80 w-80 rounded-full bg-brand-orange/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 h-80 w-80 rounded-full bg-brand-emerald/10 blur-[100px] pointer-events-none" />

      <div className="relative w-full max-w-lg rounded-3xl border border-white/10 bg-slate-900/80 p-8 shadow-2xl backdrop-blur-xl">
        <div className="flex flex-col items-center text-center space-y-2 mb-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-brand-orange to-amber-500 font-black text-xl text-slate-950 shadow-xl shadow-orange-500/20">
            KP
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white mt-1">
            Create Your Account
          </h1>
          <p className="text-xs text-slate-400">
            One account for Airtime, Data, Utilities, SMS Numbers & Social Growth
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Line Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Title
            </label>
            <select
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-white/10 text-white focus:outline-none focus:border-brand-orange text-xs font-medium"
            >
              <option value="Mr">Mr</option>
              <option value="Mrs">Mrs</option>
              <option value="Miss">Miss</option>
            </select>
          </div>

          {/* Full Line First Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
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
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-brand-orange text-xs font-medium"
              />
            </div>
          </div>

          {/* Full Line Last Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
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
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-brand-orange text-xs font-medium"
              />
            </div>
          </div>

          {/* Unique Username Field with @ prefix */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Choose Username (@handle)
            </label>
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-brand-orange text-xs select-none">
                @
              </div>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="e.g. davidadeleke, chidi_fintech"
                required
                className="w-full pl-8 pr-28 py-2.5 rounded-xl bg-slate-950/80 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-brand-orange text-xs font-mono font-medium lowercase"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-semibold">
                {checkingUsername && <span className="text-slate-400 animate-pulse">Checking...</span>}
                {!checkingUsername && usernameAvailable === true && (
                  <span className="text-emerald-400 flex items-center gap-1 font-bold">✓ Available</span>
                )}
                {!checkingUsername && usernameAvailable === false && (
                  <span className="text-rose-400 flex items-center gap-1 font-bold">✕ Taken</span>
                )}
              </div>
            </div>
            {usernameFeedback && (
              <p className={`text-[10px] mt-1 font-medium ${usernameAvailable === false ? 'text-rose-400' : 'text-emerald-400/90'}`}>
                {usernameFeedback}
              </p>
            )}
          </div>

          {/* Full Line Phone Number */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
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
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-brand-orange text-xs font-medium"
              />
            </div>
          </div>

          {/* Full Line Email Address */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                required
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-brand-orange text-xs font-medium"
              />
            </div>
          </div>

          {/* Full Line Password */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="At least 6 characters"
                required
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-brand-orange text-xs font-medium"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-3 flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-brand-orange to-amber-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-bold text-xs md:text-sm transition-all shadow-lg shadow-orange-500/20 disabled:opacity-50"
          >
            {loading ? 'Creating account...' : 'Create Account'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-5 text-center text-xs text-slate-400">
          Already have an account?{' '}
          <Link href="/login" className="font-bold text-brand-orange hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
