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
    gender: 'Male',
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
    setFormData((prev) => {
      const next = { ...prev, [name]: value };
      if (name === 'title') {
        if (value === 'Mr') next.gender = 'Male';
        else if (value === 'Mrs' || value === 'Miss') next.gender = 'Female';
      } else if (name === 'gender') {
        if (value === 'Male' && (prev.title === 'Mrs' || prev.title === 'Miss')) next.title = 'Mr';
        else if (value === 'Female' && prev.title === 'Mr') next.title = 'Mrs';
      }
      return next;
    });
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
        gender: formData.gender,
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
    <div className="h-[100dvh] min-h-[100dvh] max-h-[100dvh] w-full flex flex-col justify-center items-center px-4 py-2 sm:p-0 bg-white sm:bg-[#FFF9F3] sm:bg-gradient-to-br sm:from-[#FFF5EC] sm:via-[#FFF9F4] sm:to-[#FFF0E2] relative overflow-y-auto sm:overflow-hidden selection:bg-brand-orange selection:text-white">
      {/* Background ambient solar glow orbs - visible on desktop */}
      <div className="hidden sm:block absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-[#FF6B00]/10 blur-[100px] pointer-events-none" />
      <div className="hidden sm:block absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 h-96 w-96 rounded-full bg-[#F59E0B]/12 blur-[100px] pointer-events-none" />
      <div className="hidden sm:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[480px] w-[480px] rounded-full bg-[#FFF0E0]/60 blur-[120px] pointer-events-none" />

      {/* Form Container - Stays exactly in the middle with zero scrolling */}
      <div className="relative z-10 w-full max-w-[440px] rounded-3xl border-0 sm:border sm:border-slate-200/90 bg-white p-3 sm:p-5 sm:shadow-[0_20px_50px_-12px_rgba(255,107,0,0.12),0_8px_24px_-8px_rgba(15,23,42,0.06)] sm:ring-1 sm:ring-slate-900/5">
        
        {/* Clickable Logo Mark centered directly above Heading */}
        <div className="text-center mb-3">
          <Link
            href="/"
            className="inline-block transition-transform active:scale-95 group mb-1.5"
            title="Back to Home"
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-brand-orange via-amber-500 to-amber-400 flex items-center justify-center font-black text-base sm:text-lg text-slate-950 shadow-md shadow-orange-500/25 group-hover:scale-105 transition-transform duration-200 mx-auto ring-2 ring-orange-500/20">
              ZP
            </div>
          </Link>
          <h1 className="text-lg sm:text-xl font-black tracking-tight text-slate-900">
            Create an Account on <span className="text-brand-orange">ZuvaPay</span>
          </h1>
          <p className="text-[11px] sm:text-xs text-slate-500 font-medium mt-0.5">
            Fast, reliable everyday digital payments
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-2 sm:space-y-2.5">
          {/* Row 1: Title and Gender */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] sm:text-xs font-bold text-slate-700 mb-0.5">
                Title
              </label>
              <select
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-2.5 py-1.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-brand-orange focus:ring-2 focus:ring-orange-500/15 text-xs font-bold transition-all h-[38px] sm:h-[42px]"
              >
                <option value="Mr">Mr</option>
                <option value="Mrs">Mrs</option>
                <option value="Miss">Miss</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] sm:text-xs font-bold text-slate-700 mb-0.5">
                Gender
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full px-2.5 py-1.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-brand-orange focus:ring-2 focus:ring-orange-500/15 text-xs font-bold transition-all h-[38px] sm:h-[42px]"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
          </div>

          {/* Row 2: First Name and Last Name */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] sm:text-xs font-bold text-slate-700 mb-0.5">
                First Name
              </label>
              <div className="flex items-center gap-2 p-1 sm:p-1.5 rounded-2xl bg-slate-50 border border-slate-200 focus-within:border-brand-orange focus-within:ring-2 focus-within:ring-orange-500/15 transition-all shadow-sm h-[38px] sm:h-[42px]">
                <div className="w-8 h-8 rounded-full bg-brand-orange/10 text-brand-orange flex items-center justify-center flex-shrink-0">
                  <User className="w-3.5 h-3.5 text-brand-orange" />
                </div>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="David"
                  required
                  style={{ backgroundColor: 'transparent' }}
                  className="w-full bg-transparent border-0 outline-none ring-0 shadow-none text-xs sm:text-sm font-bold text-slate-900 placeholder:text-slate-400 placeholder:font-normal py-1 pr-2 focus:outline-none focus:ring-0 leading-normal appearance-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] sm:text-xs font-bold text-slate-700 mb-0.5">
                Last Name
              </label>
              <div className="flex items-center gap-2 p-1 sm:p-1.5 rounded-2xl bg-slate-50 border border-slate-200 focus-within:border-brand-orange focus-within:ring-2 focus-within:ring-orange-500/15 transition-all shadow-sm h-[38px] sm:h-[42px]">
                <div className="w-8 h-8 rounded-full bg-brand-orange/10 text-brand-orange flex items-center justify-center flex-shrink-0">
                  <User className="w-3.5 h-3.5 text-brand-orange" />
                </div>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Adeleke"
                  required
                  style={{ backgroundColor: 'transparent' }}
                  className="w-full bg-transparent border-0 outline-none ring-0 shadow-none text-xs sm:text-sm font-bold text-slate-900 placeholder:text-slate-400 placeholder:font-normal py-1 pr-2 focus:outline-none focus:ring-0 leading-normal appearance-none"
                />
              </div>
            </div>
          </div>

          {/* Row 3: Phone Number */}
          <div>
            <label className="block text-[11px] sm:text-xs font-bold text-slate-700 mb-0.5">
              Phone Number
            </label>
            <div className="flex items-center gap-2 p-1 sm:p-1.5 rounded-2xl bg-slate-50 border border-slate-200 focus-within:border-brand-orange focus-within:ring-2 focus-within:ring-orange-500/15 transition-all shadow-sm h-[38px] sm:h-[42px]">
              <div className="w-8 h-8 rounded-full bg-brand-orange/10 text-brand-orange flex items-center justify-center flex-shrink-0">
                <Phone className="w-3.5 h-3.5 text-brand-orange" />
              </div>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="08012345678"
                required
                style={{ backgroundColor: 'transparent' }}
                className="w-full bg-transparent border-0 outline-none ring-0 shadow-none text-xs sm:text-sm font-bold text-slate-900 placeholder:text-slate-400 placeholder:font-normal py-1 pr-2 focus:outline-none focus:ring-0 leading-normal appearance-none"
              />
            </div>
          </div>

          {/* Row 3: Username Field */}
          <div>
            <label className="block text-[11px] sm:text-xs font-bold text-slate-700 mb-0.5">
              Choose Username
            </label>
            <div className="flex items-center gap-2 p-1 sm:p-1.5 rounded-2xl bg-slate-50 border border-slate-200 focus-within:border-brand-orange focus-within:ring-2 focus-within:ring-orange-500/15 transition-all shadow-sm relative h-[38px] sm:h-[42px]">
              <div className="w-8 h-8 rounded-full bg-brand-orange/10 text-brand-orange flex items-center justify-center flex-shrink-0 font-bold text-xs select-none">
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
                className="w-full bg-transparent border-0 outline-none ring-0 shadow-none text-xs sm:text-sm font-bold font-mono text-slate-900 placeholder:text-slate-400 placeholder:font-normal py-1 pr-16 focus:outline-none focus:ring-0 leading-normal lowercase appearance-none"
              />
              <div className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] font-bold">
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

          {/* Row 4: Email Address */}
          <div>
            <label className="block text-[11px] sm:text-xs font-bold text-slate-700 mb-0.5">
              Email Address
            </label>
            <div className="flex items-center gap-2 p-1 sm:p-1.5 rounded-2xl bg-slate-50 border border-slate-200 focus-within:border-brand-orange focus-within:ring-2 focus-within:ring-orange-500/15 transition-all shadow-sm h-[38px] sm:h-[42px]">
              <div className="w-8 h-8 rounded-full bg-brand-orange/10 text-brand-orange flex items-center justify-center flex-shrink-0">
                <Mail className="w-3.5 h-3.5 text-brand-orange" />
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
                className="w-full bg-transparent border-0 outline-none ring-0 shadow-none text-xs sm:text-sm font-bold text-slate-900 placeholder:text-slate-400 placeholder:font-normal py-1 pr-2.5 focus:outline-none focus:ring-0 leading-normal appearance-none"
              />
            </div>
          </div>

          {/* Row 5: Password with Visibility Toggle */}
          <div>
            <label className="block text-[11px] sm:text-xs font-bold text-slate-700 mb-0.5">
              Password
            </label>
            <div className="flex items-center gap-2 p-1 sm:p-1.5 rounded-2xl bg-slate-50 border border-slate-200 focus-within:border-brand-orange focus-within:ring-2 focus-within:ring-orange-500/15 transition-all shadow-sm h-[38px] sm:h-[42px]">
              <div className="w-8 h-8 rounded-full bg-brand-orange/10 text-brand-orange flex items-center justify-center flex-shrink-0">
                <Lock className="w-3.5 h-3.5 text-brand-orange" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="At least 6 characters"
                required
                style={{ backgroundColor: 'transparent' }}
                className="w-full bg-transparent border-0 outline-none ring-0 shadow-none text-xs sm:text-sm font-bold text-slate-900 placeholder:text-slate-400 placeholder:font-normal py-1 focus:outline-none focus:ring-0 leading-normal appearance-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="p-1.5 text-slate-400 hover:text-slate-700 transition-colors flex-shrink-0 mr-0.5"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <div className="pt-1">
            <button
              type="submit"
              disabled={loading || usernameAvailable === false}
              className="w-full h-10 sm:h-11 rounded-xl bg-gradient-to-r from-brand-orange to-amber-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black text-xs sm:text-sm transition-all shadow-md shadow-orange-500/20 disabled:opacity-50 flex items-center justify-center gap-2 active:scale-[0.99]"
            >
              <span>{loading ? 'Creating Account...' : 'Create Account'}</span>
              <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
          </div>
        </form>

        <div className="pt-2.5 text-center text-xs text-slate-600 border-t border-slate-100 mt-2.5">
          Already have an account?{' '}
          <Link href="/login" className="font-black text-brand-orange hover:underline ml-1">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
