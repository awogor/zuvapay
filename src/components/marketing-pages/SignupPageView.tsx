'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/common/Toast';
import { Mail, Lock, User, Phone, ArrowRight, Eye, EyeOff } from 'lucide-react';

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
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 sm:py-8 bg-white sm:bg-[#FFF9F3] sm:bg-gradient-to-br sm:from-[#FFF5EC] sm:via-[#FFF9F4] sm:to-[#FFF0E2] relative overflow-y-auto selection:bg-brand-orange selection:text-white">
      {/* Background ambient solar glow orbs - visible on desktop */}
      <div className="hidden sm:block absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-[#FF6B00]/10 blur-[100px] pointer-events-none" />
      <div className="hidden sm:block absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 h-96 w-96 rounded-full bg-[#F59E0B]/12 blur-[100px] pointer-events-none" />
      <div className="hidden sm:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[480px] w-[480px] rounded-full bg-[#FFF0E0]/60 blur-[120px] pointer-events-none" />

      {/* Form Container - Centered on desktop */}
      <div className="relative z-10 w-full max-w-[440px] rounded-3xl border-0 sm:border sm:border-slate-200/90 bg-white p-4 sm:p-6 sm:shadow-[0_20px_50px_-12px_rgba(255,107,0,0.12),0_8px_24px_-8px_rgba(15,23,42,0.06)] sm:ring-1 sm:ring-slate-900/5 my-auto">
        
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
            Create an Account on <span className="text-brand-orange">ZuvaPay</span>
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Fast, reliable everyday digital payments
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Title and First Name row */}
          <div className="grid grid-cols-3 gap-2.5">
            <div className="col-span-1">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Title
              </label>
              <select
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-3 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-brand-orange focus:ring-2 focus:ring-orange-500/15 text-xs font-bold transition-all"
              >
                <option value="Mr">Mr</option>
                <option value="Mrs">Mrs</option>
                <option value="Miss">Miss</option>
              </select>
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                First Name
              </label>
              <div className="flex items-center gap-2.5 p-1.5 rounded-2xl bg-slate-50 border border-slate-200 focus-within:border-brand-orange focus-within:ring-2 focus-within:ring-orange-500/15 transition-all shadow-sm">
                <div className="w-9 h-9 rounded-full bg-brand-orange/10 text-brand-orange flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-brand-orange" />
                </div>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="David"
                  required
                  style={{ backgroundColor: 'transparent' }}
                  className="w-full bg-transparent border-0 outline-none ring-0 shadow-none text-sm font-bold text-slate-900 placeholder:text-slate-400 placeholder:font-normal py-1 pr-2 focus:outline-none focus:ring-0 leading-relaxed appearance-none"
                />
              </div>
            </div>
          </div>

          {/* Last Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Last Name
            </label>
            <div className="flex items-center gap-3 p-1.5 rounded-2xl bg-slate-50 border border-slate-200 focus-within:border-brand-orange focus-within:ring-2 focus-within:ring-orange-500/15 transition-all shadow-sm">
              <div className="w-10 h-10 rounded-full bg-brand-orange/10 text-brand-orange flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 text-brand-orange" />
              </div>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Adeleke"
                required
                style={{ backgroundColor: 'transparent' }}
                className="w-full bg-transparent border-0 outline-none ring-0 shadow-none text-sm sm:text-base font-bold text-slate-900 placeholder:text-slate-400 placeholder:font-normal py-2 sm:py-2.5 pr-3 focus:outline-none focus:ring-0 leading-relaxed appearance-none"
              />
            </div>
          </div>

          {/* Username Field */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Choose Username
            </label>
            <div className="flex items-center gap-3 p-1.5 rounded-2xl bg-slate-50 border border-slate-200 focus-within:border-brand-orange focus-within:ring-2 focus-within:ring-orange-500/15 transition-all shadow-sm relative">
              <div className="w-10 h-10 rounded-full bg-brand-orange/10 text-brand-orange flex items-center justify-center flex-shrink-0 font-bold text-sm select-none">
                @
              </div>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="davidadeleke"
                required
                style={{ backgroundColor: 'transparent' }}
                className="w-full bg-transparent border-0 outline-none ring-0 shadow-none text-sm sm:text-base font-bold font-mono text-slate-900 placeholder:text-slate-400 placeholder:font-normal py-2 sm:py-2.5 pr-20 focus:outline-none focus:ring-0 leading-relaxed lowercase appearance-none"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold">
                {checkingUsername && <span className="text-slate-400 animate-pulse">Checking...</span>}
                {!checkingUsername && usernameAvailable === true && (
                  <span className="text-emerald-600 font-black">✓ Available</span>
                )}
                {!checkingUsername && usernameAvailable === false && (
                  <span className="text-rose-600 font-black">✕ Taken</span>
                )}
              </div>
            </div>
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Phone Number
            </label>
            <div className="flex items-center gap-3 p-1.5 rounded-2xl bg-slate-50 border border-slate-200 focus-within:border-brand-orange focus-within:ring-2 focus-within:ring-orange-500/15 transition-all shadow-sm">
              <div className="w-10 h-10 rounded-full bg-brand-orange/10 text-brand-orange flex items-center justify-center flex-shrink-0">
                <Phone className="w-4 h-4 text-brand-orange" />
              </div>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="08012345678"
                required
                style={{ backgroundColor: 'transparent' }}
                className="w-full bg-transparent border-0 outline-none ring-0 shadow-none text-sm sm:text-base font-bold text-slate-900 placeholder:text-slate-400 placeholder:font-normal py-2 sm:py-2.5 pr-3 focus:outline-none focus:ring-0 leading-relaxed appearance-none"
              />
            </div>
          </div>

          {/* Email Address */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Email Address
            </label>
            <div className="flex items-center gap-3 p-1.5 rounded-2xl bg-slate-50 border border-slate-200 focus-within:border-brand-orange focus-within:ring-2 focus-within:ring-orange-500/15 transition-all shadow-sm">
              <div className="w-10 h-10 rounded-full bg-brand-orange/10 text-brand-orange flex items-center justify-center flex-shrink-0">
                <Mail className="w-4 h-4 text-brand-orange" />
              </div>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="name@example.com"
                required
                autoCapitalize="none"
                autoCorrect="off"
                style={{ backgroundColor: 'transparent' }}
                className="w-full bg-transparent border-0 outline-none ring-0 shadow-none text-sm sm:text-base font-bold text-slate-900 placeholder:text-slate-400 placeholder:font-normal py-2 sm:py-2.5 pr-3 focus:outline-none focus:ring-0 leading-relaxed appearance-none"
              />
            </div>
          </div>

          {/* Password with Visibility Toggle */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Password
            </label>
            <div className="flex items-center gap-3 p-1.5 rounded-2xl bg-slate-50 border border-slate-200 focus-within:border-brand-orange focus-within:ring-2 focus-within:ring-orange-500/15 transition-all shadow-sm">
              <div className="w-10 h-10 rounded-full bg-brand-orange/10 text-brand-orange flex items-center justify-center flex-shrink-0">
                <Lock className="w-4 h-4 text-brand-orange" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="At least 6 characters"
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

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading || usernameAvailable === false}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-brand-orange to-amber-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black text-sm transition-all shadow-md shadow-orange-500/20 disabled:opacity-50 flex items-center justify-center gap-2 active:scale-[0.99]"
            >
              <span>{loading ? 'Creating Account...' : 'Create Account'}</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        </form>

        <div className="pt-4 text-center text-xs sm:text-sm text-slate-600 border-t border-slate-100 mt-5">
          Already have an account?{' '}
          <Link href="/login" className="font-black text-brand-orange hover:underline ml-1">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
