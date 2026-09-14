'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/common/Toast';
import { Mail, Lock, User, Phone, ArrowRight, ArrowLeft, Eye, EyeOff } from 'lucide-react';

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

  const [showPassword, setShowPassword] = useState(false);
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
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-[#FFF9F3] bg-gradient-to-br from-[#FFF5EC] via-[#FFF9F4] to-[#FFF0E2] relative overflow-hidden selection:bg-zuva-solar selection:text-white">
      {/* Background ambient solar glow orbs */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-[#FF6B00]/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 h-96 w-96 rounded-full bg-[#F59E0B]/12 blur-[100px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[480px] w-[480px] rounded-full bg-[#FFF0E0]/60 blur-[120px] pointer-events-none" />

      {/* Floating back button */}
      <Link
        href="/"
        className="absolute top-5 left-5 z-20 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 hover:bg-white border border-slate-200 shadow-sm text-xs font-semibold text-slate-600 hover:text-slate-900 transition-all backdrop-blur-md"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Home</span>
      </Link>

      {/* Form Container - Compact, popping white card with zero wasted gaps */}
      <div className="relative z-10 w-full max-w-md rounded-2xl border border-slate-200/90 bg-white p-6 shadow-[0_20px_50px_-12px_rgba(255,107,0,0.12),0_8px_24px_-8px_rgba(15,23,42,0.06)] ring-1 ring-slate-900/5 my-4">
        {/* Clean Small Heading - No Icon, No Subtitle */}
        <div className="text-center mb-4">
          <h1 className="text-lg font-bold tracking-tight text-slate-900">
            Create an Account on <span className="text-zuva-solar">ZuvaPay</span>
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Title and First Name row */}
          <div className="grid grid-cols-3 gap-2.5">
            <div className="col-span-1">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Title
              </label>
              <select
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-2.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:bg-white focus:border-zuva-solar focus:ring-2 focus:ring-orange-500/10 text-xs font-medium transition-all"
              >
                <option value="Mr">Mr</option>
                <option value="Mrs">Mrs</option>
                <option value="Miss">Miss</option>
              </select>
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                First Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="David"
                  required
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-zuva-solar focus:ring-2 focus:ring-orange-500/10 text-xs font-medium transition-all"
                />
              </div>
            </div>
          </div>

          {/* Last Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Last Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Adeleke"
                required
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-zuva-solar focus:ring-2 focus:ring-orange-500/10 text-xs font-medium transition-all"
              />
            </div>
          </div>

          {/* Username Field */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Choose Username
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-zuva-solar text-xs select-none">
                @
              </div>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="davidadeleke"
                required
                className="w-full pl-7 pr-24 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-zuva-solar focus:ring-2 focus:ring-orange-500/10 text-xs font-mono font-medium lowercase transition-all"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-semibold">
                {checkingUsername && <span className="text-slate-400 animate-pulse">Checking...</span>}
                {!checkingUsername && usernameAvailable === true && (
                  <span className="text-emerald-600 font-bold">✓ Available</span>
                )}
                {!checkingUsername && usernameAvailable === false && (
                  <span className="text-rose-600 font-bold">✕ Taken</span>
                )}
              </div>
            </div>
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Phone Number
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="08012345678"
                required
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-zuva-solar focus:ring-2 focus:ring-orange-500/10 text-xs font-medium transition-all"
              />
            </div>
          </div>

          {/* Email Address */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="name@example.com"
                required
                autoCapitalize="none"
                autoCorrect="off"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-zuva-solar focus:ring-2 focus:ring-orange-500/10 text-xs font-medium transition-all"
              />
            </div>
          </div>

          {/* Password with Visibility Toggle */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="At least 6 characters"
                required
                className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-zuva-solar focus:ring-2 focus:ring-orange-500/10 text-xs font-medium transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="pt-1">
            <button
              type="submit"
              disabled={loading || usernameAvailable === false}
              className="w-full flex items-center justify-center gap-1.5 py-3 rounded-xl bg-gradient-to-r from-zuva-solar to-zuva-amber hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs transition-all shadow-md shadow-orange-500/20 disabled:opacity-50"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>

        <div className="mt-4 text-center text-xs text-slate-500">
          Already have an account?{' '}
          <Link href="/login" className="font-bold text-zuva-solar hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
