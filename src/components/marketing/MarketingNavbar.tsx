'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import {
  Menu,
  X,
  ArrowRight,
  Zap,
  Smartphone,
  ShieldCheck,
  MessageSquareCode,
  TrendingUp,
  ChevronDown,
  ShoppingBag,
} from 'lucide-react';

export function MarketingNavbar() {
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [servicesDropdownOpen, setServicesDropdownOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/90 backdrop-blur-xl border-b border-slate-200/80 shadow-sm'
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-brand-orange via-amber-500 to-yellow-400 font-black text-xl text-slate-950 shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform duration-200">
              KP
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-xl tracking-tight text-slate-900 flex items-center gap-1 font-display">
                Korrect<span className="text-brand-orange">Pay</span>
              </span>
              <span className="text-[10px] font-semibold text-slate-500 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live in Nigeria
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
            {/* Services Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setServicesDropdownOpen(true)}
              onMouseLeave={() => setServicesDropdownOpen(false)}
            >
              <button
                className="flex items-center gap-1.5 text-slate-700 hover:text-slate-950 transition-colors py-2 font-medium"
                onClick={() => setServicesDropdownOpen((prev) => !prev)}
              >
                Services
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${servicesDropdownOpen ? 'rotate-180 text-brand-orange' : ''}`} />
              </button>

              {servicesDropdownOpen && (
                <div className="absolute top-full -left-4 w-80 p-3 rounded-2xl bg-white border border-slate-200 shadow-xl backdrop-blur-2xl animate-in fade-in slide-in-from-top-2">
                  <div className="space-y-1">
                    <Link
                      href="/services#data"
                      className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors group"
                    >
                      <div className="p-2 rounded-lg bg-orange-50 text-brand-orange">
                        <Smartphone className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900 group-hover:text-brand-orange transition-colors">
                          Airtime & SME Data
                        </p>
                        <p className="text-[11px] text-slate-500">MTN, Airtel, Glo, 9mobile with 0% fail rate</p>
                      </div>
                    </Link>

                    <Link
                      href="/services#sms"
                      className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors group"
                    >
                      <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
                        <MessageSquareCode className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900 group-hover:text-purple-600 transition-colors">
                          Virtual SMS Numbers
                        </p>
                        <p className="text-[11px] text-slate-500">USA, UK, Kenya OTPs with instant auto-refunds</p>
                      </div>
                    </Link>

                    <Link
                      href="/services#power"
                      className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors group"
                    >
                      <div className="p-2 rounded-lg bg-teal-50 text-teal-600">
                        <Zap className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900 group-hover:text-teal-600 transition-colors">
                          Electricity & Cable TV
                        </p>
                        <p className="text-[11px] text-slate-500">Instant tokens for IKEDC, AEDC, DSTV & GOtv</p>
                      </div>
                    </Link>

                    <Link
                      href="/services#social"
                      className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors group"
                    >
                      <div className="p-2 rounded-lg bg-rose-50 text-rose-600">
                        <TrendingUp className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900 group-hover:text-rose-600 transition-colors">
                          Social Growth & Logs
                        </p>
                        <p className="text-[11px] text-slate-500">Creators & marketers boost tools & verified logs</p>
                      </div>
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <Link href="/pricing" className="hover:text-slate-950 transition-colors font-medium">
              Pricing
            </Link>
            <Link href="/about" className="hover:text-slate-950 transition-colors font-medium">
              Why KorrectPay
            </Link>
            <Link
              href="https://wa.me/2348000000000?text=Hello%20KorrectPay%20Support"
              target="_blank"
              className="hover:text-slate-950 transition-colors flex items-center gap-1.5 font-medium"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              WhatsApp Help
            </Link>
          </nav>

          {/* Right Action Area */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <Link
                href="/dashboard"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-orange to-amber-500 hover:from-orange-600 hover:to-amber-600 text-slate-950 font-bold text-xs shadow-md shadow-orange-500/20 transition-all active:scale-95"
              >
                Go to Dashboard
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2.5 text-xs font-bold text-slate-700 hover:text-slate-950 transition-colors"
                >
                  Log In
                </Link>
                <Link
                  href="/signup"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-orange to-amber-500 hover:from-orange-600 hover:to-amber-600 text-slate-950 font-bold text-xs shadow-md shadow-orange-500/20 transition-all active:scale-95"
                >
                  Create Free Account
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-800"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white/95 border-b border-slate-200 px-6 py-6 space-y-4 backdrop-blur-2xl shadow-xl animate-in slide-in-from-top-4">
          <div className="space-y-3">
            <Link
              href="/services"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-bold text-slate-800 hover:text-brand-orange py-2"
            >
              All Services & Live Pricing
            </Link>
            <Link
              href="/pricing"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-bold text-slate-800 hover:text-brand-orange py-2"
            >
              Pricing Breakdown
            </Link>
            <Link
              href="/about"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-bold text-slate-800 hover:text-brand-orange py-2"
            >
              Why KorrectPay
            </Link>
            <Link
              href="https://wa.me/2348000000000"
              target="_blank"
              className="flex items-center gap-2 text-sm font-bold text-emerald-600 py-2"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Chat on WhatsApp (24/7)
            </Link>
          </div>

          <div className="pt-4 border-t border-slate-200 flex flex-col gap-2.5">
            {user ? (
              <Link
                href="/dashboard"
                className="w-full text-center py-3 rounded-xl bg-brand-orange text-slate-950 font-bold text-sm shadow-md"
              >
                Open Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="w-full text-center py-3 rounded-xl border border-slate-200 text-slate-800 font-bold text-sm bg-slate-50"
                >
                  Log In
                </Link>
                <Link
                  href="/signup"
                  className="w-full text-center py-3 rounded-xl bg-gradient-to-r from-brand-orange to-amber-500 text-slate-950 font-bold text-sm shadow-md"
                >
                  Get Started (₦0 Free)
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
