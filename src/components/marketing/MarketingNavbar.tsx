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
          {/* Brand Logo: ZuvaPay */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-zuva-solar to-zuva-amber text-slate-950 font-black text-lg shadow-sm shadow-orange-500/20 group-hover:scale-105 transition-transform duration-200">
              <span className="font-display tracking-tight text-slate-950 font-black">ZP</span>
            </div>
            <span className="font-black text-2xl tracking-tight text-slate-950 font-display">
              Zuva<span className="text-transparent bg-clip-text bg-gradient-to-r from-zuva-solar to-zuva-amber">Pay</span>
            </span>
          </Link>

          {/* Desktop Navigation Links - Clean, Uncluttered */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <Link
              href="/services"
              className="hover:text-slate-950 transition-colors"
            >
              Services
            </Link>

            <Link
              href="/pricing"
              className="hover:text-slate-950 transition-colors"
            >
              Pricing
            </Link>

            <Link
              href="/#ambassador"
              className="hover:text-slate-950 transition-colors"
            >
              Ambassador
            </Link>

            <Link
              href="/about"
              className="hover:text-slate-950 transition-colors"
            >
              About
            </Link>

            <Link
              href="/#faqs"
              className="hover:text-slate-950 transition-colors"
            >
              FAQs
            </Link>
          </nav>

          {/* Right Action Group */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <Link
                href="/dashboard"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-900 text-white text-xs font-bold transition-all hover:scale-105"
              >
                Dashboard
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-semibold text-slate-700 hover:text-slate-950 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-zuva-solar to-zuva-amber hover:from-orange-600 hover:to-amber-600 text-white text-xs font-bold shadow-md shadow-orange-500/20 transition-all hover:scale-105 active:scale-95"
                >
                  Create Account
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
              className="block text-sm font-medium text-slate-800 hover:text-zuva-solar py-2"
            >
              Services
            </Link>
            <Link
              href="/pricing"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-medium text-slate-800 hover:text-zuva-solar py-2"
            >
              Pricing
            </Link>
            <Link
              href="/#ambassador"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-medium text-slate-800 hover:text-zuva-solar py-2"
            >
              Ambassador
            </Link>
            <Link
              href="/about"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-medium text-slate-800 hover:text-zuva-solar py-2"
            >
              About
            </Link>
            <Link
              href="/#faqs"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-medium text-slate-800 hover:text-zuva-solar py-2"
            >
              FAQs
            </Link>
          </div>

          <div className="pt-4 border-t border-slate-200 flex flex-col gap-2.5">
            {user ? (
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-3 rounded-xl bg-slate-950 text-white font-bold text-sm shadow-md"
              >
                Dashboard
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
                  className="w-full text-center py-3 rounded-xl bg-gradient-to-r from-zuva-solar to-zuva-amber text-white font-bold text-sm shadow-md shadow-orange-500/25"
                >
                  Create Account
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
