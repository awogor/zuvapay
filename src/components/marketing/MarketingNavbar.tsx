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
          {/* Brand Logo: ZuvaPay Solar Crest */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-zuva-solar via-zuva-amber to-zuva-gold font-black text-xl text-slate-950 shadow-md shadow-orange-500/25 group-hover:scale-105 transition-transform duration-200">
              <span className="font-display tracking-tighter text-slate-950 font-black">ZP</span>
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border-2 border-white"></span>
              </span>
            </div>
            <div className="flex flex-col">
              <span className="font-black text-2xl tracking-tight text-slate-950 flex items-center gap-0.5 font-display">
                Zuva<span className="text-transparent bg-clip-text bg-gradient-to-r from-zuva-solar to-zuva-amber">Pay</span>
              </span>
              <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1.5 uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live in Nigeria 🇳🇬
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-semibold text-slate-600">
            <Link
              href="/#services"
              className="hover:text-slate-950 transition-colors"
            >
              Services
            </Link>

            <Link
              href="/#rates"
              className="hover:text-slate-950 transition-colors flex items-center gap-1.5"
            >
              Live Rates
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200/60">
                Wholesale
              </span>
            </Link>

            <Link
              href="/#speed"
              className="hover:text-slate-950 transition-colors"
            >
              Speed Test
            </Link>

            <Link
              href="/#ambassador"
              className="hover:text-slate-950 transition-colors flex items-center gap-1.5 text-zuva-solar font-bold"
            >
              <span>Ambassador</span>
              <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-orange-100 text-orange-700 font-extrabold tracking-wide">
                Earn ₦50k
              </span>
            </Link>

            <Link
              href="/#faqs"
              className="hover:text-slate-950 transition-colors"
            >
              FAQs
            </Link>
          </nav>

          {/* Right Action Group */}
          <div className="hidden md:flex items-center gap-3">
            {/* Live Status Chip */}
            <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200/80 text-xs font-semibold text-slate-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>99.98% Gateway Uptime</span>
            </div>

            {user ? (
              <Link
                href="/dashboard"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-900 text-white text-xs font-bold transition-all hover:scale-105"
              >
                Go to Dashboard
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 text-xs font-bold text-slate-700 hover:text-slate-950 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-zuva-solar to-zuva-amber hover:from-amber-600 hover:to-orange-600 text-white text-xs font-black shadow-lg shadow-orange-500/20 transition-all hover:scale-105 active:scale-95"
                >
                  Create Account (₦0)
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
        <div className="md:hidden bg-white/98 border-b border-slate-200 px-6 py-6 space-y-4 backdrop-blur-2xl shadow-2xl animate-in slide-in-from-top-4">
          <div className="space-y-3 font-semibold">
            <Link
              href="/#services"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm text-slate-800 hover:text-zuva-solar py-1.5"
            >
              Services & Digital Tools
            </Link>
            <Link
              href="/#rates"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm text-slate-800 hover:text-zuva-solar py-1.5"
            >
              Live Wholesale Rates
            </Link>
            <Link
              href="/#speed"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm text-slate-800 hover:text-zuva-solar py-1.5"
            >
              Speed Test Simulator
            </Link>
            <Link
              href="/#ambassador"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between text-sm text-zuva-solar font-bold py-1.5"
            >
              <span>Campus Ambassador Program</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-orange-100 text-orange-700">Earn ₦50k</span>
            </Link>
            <Link
              href="/#faqs"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm text-slate-800 hover:text-zuva-solar py-1.5"
            >
              FAQs & Help
            </Link>
          </div>

          <div className="pt-4 border-t border-slate-200 flex flex-col gap-2.5">
            {user ? (
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-3 rounded-xl bg-slate-950 text-white font-bold text-sm shadow-md"
              >
                Open Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-3 rounded-xl border border-slate-300 text-slate-800 font-bold text-sm bg-slate-50"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-3 rounded-xl bg-gradient-to-r from-zuva-solar to-zuva-amber text-white font-black text-sm shadow-md shadow-orange-500/25"
                >
                  Create Account (₦0)
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
