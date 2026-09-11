'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  ChevronUp,
  HelpCircle,
  MessageCircle,
  Mail,
  Sparkles,
  Users,
  Building2,
  ExternalLink,
} from 'lucide-react';

type DropdownType = 'services' | 'company' | 'help' | null;

export function MarketingNavbar() {
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<DropdownType>(null);
  const [mobileExpanded, setMobileExpanded] = useState<{ services: boolean; company: boolean; help: boolean }>({
    services: false,
    company: false,
    help: false,
  });

  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mega menu on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleDropdown = (name: DropdownType) => {
    setActiveDropdown((prev) => (prev === name ? null : name));
  };

  const toggleMobileSection = (key: 'services' | 'company' | 'help') => {
    setMobileExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <header
      ref={navRef}
      onMouseLeave={() => setActiveDropdown(null)}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled || activeDropdown
          ? 'bg-white/95 backdrop-blur-2xl border-b border-slate-200/80 shadow-md'
          : 'bg-white/70 backdrop-blur-md border-b border-slate-200/40'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo: ZuvaPay */}
          <Link
            href="/"
            onClick={() => setActiveDropdown(null)}
            className="flex items-center gap-2.5 group"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-zuva-solar to-zuva-amber text-slate-950 font-black text-lg shadow-sm shadow-orange-500/20 group-hover:scale-105 transition-transform duration-200">
              <span className="font-display tracking-tight text-slate-950 font-black">ZP</span>
            </div>
            <span className="font-black text-2xl tracking-tight text-slate-950 font-display">
              Zuva<span className="text-transparent bg-clip-text bg-gradient-to-r from-zuva-solar to-zuva-amber">Pay</span>
            </span>
          </Link>

          {/* Desktop Navigation Links with ZojaPay-style Mega Menus */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            {/* 1. Services / Payment Mega Menu Trigger */}
            <div
              className="relative"
              onMouseEnter={() => setActiveDropdown('services')}
            >
              <button
                onClick={() => toggleDropdown('services')}
                className={`flex items-center gap-1.5 transition-colors font-semibold py-2 ${
                  activeDropdown === 'services'
                    ? 'text-zuva-solar'
                    : 'text-slate-700 hover:text-slate-950'
                }`}
              >
                <span>Services</span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${
                    activeDropdown === 'services' ? 'rotate-180 text-zuva-solar' : 'text-slate-400'
                  }`}
                />
              </button>
            </div>

            {/* 2. Company Dropdown Trigger */}
            <div
              className="relative"
              onMouseEnter={() => setActiveDropdown('company')}
            >
              <button
                onClick={() => toggleDropdown('company')}
                className={`flex items-center gap-1.5 transition-colors font-semibold py-2 ${
                  activeDropdown === 'company'
                    ? 'text-zuva-solar'
                    : 'text-slate-700 hover:text-slate-950'
                }`}
              >
                <span>Company</span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${
                    activeDropdown === 'company' ? 'rotate-180 text-zuva-solar' : 'text-slate-400'
                  }`}
                />
              </button>
            </div>

            {/* 3. Pricing (Direct Link) */}
            <Link
              href="/pricing"
              onClick={() => setActiveDropdown(null)}
              className="hover:text-slate-950 text-slate-700 font-semibold transition-colors"
            >
              Pricing
            </Link>

            {/* 4. Help Dropdown Trigger */}
            <div
              className="relative"
              onMouseEnter={() => setActiveDropdown('help')}
            >
              <button
                onClick={() => toggleDropdown('help')}
                className={`flex items-center gap-1.5 transition-colors font-semibold py-2 ${
                  activeDropdown === 'help'
                    ? 'text-zuva-solar'
                    : 'text-slate-700 hover:text-slate-950'
                }`}
              >
                <span>Help</span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${
                    activeDropdown === 'help' ? 'rotate-180 text-zuva-solar' : 'text-slate-400'
                  }`}
                />
              </button>
            </div>
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
                  Get Started
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

      {/* =========================================================================
          ZOJAPAY-STYLE MEGA MENU 1: SERVICES & PAYMENTS (FLOATING CARD)
         ========================================================================= */}
      {activeDropdown === 'services' && (
        <div
          onMouseLeave={() => setActiveDropdown(null)}
          className="hidden md:block absolute top-[calc(100%+12px)] left-1/2 -translate-x-1/2 w-[94vw] max-w-5xl rounded-[32px] bg-white border border-slate-200/90 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.18)] p-8 before:content-[''] before:absolute before:-top-3 before:left-0 before:right-0 before:h-4 animate-in fade-in zoom-in-95 duration-200"
        >
          <div className="grid grid-cols-12 gap-8 items-stretch">
            {/* Column 1: Left CTA Callout (ZojaPay style) */}
            <div className="col-span-4 flex flex-col justify-between pr-2 space-y-6">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 border border-orange-200/70 text-zuva-solar text-xs font-bold shadow-sm">
                  <Sparkles className="w-3.5 h-3.5" />
                  Instant Payments Suite
                </div>
                <h3 className="text-2xl font-black text-slate-950 font-display leading-tight">
                  Get Instant Access to ZuvaPay Utilities
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Enjoy wholesale SME data from ₦240/GB, 1.1s instant electricity meter tokens, and dedicated Moniepoint virtual accounts that fund on the first try.
                </p>
              </div>

              <div>
                <Link
                  href="/signup"
                  onClick={() => setActiveDropdown(null)}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-slate-950 hover:bg-slate-850 text-white font-bold text-xs tracking-wide shadow-md transition-all hover:scale-105"
                >
                  <span>Open Free Account</span>
                  <ArrowRight className="w-4 h-4 text-zuva-amber" />
                </Link>
              </div>
            </div>

            {/* Column 2: Service Directory Links (ZojaPay clean list style) */}
            <div className="col-span-4 space-y-4 border-l border-slate-100 pl-6 flex flex-col justify-center">
              <Link
                href="/services#data"
                onClick={() => setActiveDropdown(null)}
                className="group block p-2 rounded-xl hover:bg-slate-50 transition-colors"
              >
                <h4 className="text-sm font-bold text-slate-950 group-hover:text-zuva-solar transition-colors">
                  Bills & SME Data
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  MTN, Airtel, Glo from ₦240/GB with automated refund.
                </p>
              </Link>

              <Link
                href="/services#power"
                onClick={() => setActiveDropdown(null)}
                className="group block p-2 rounded-xl hover:bg-slate-50 transition-colors"
              >
                <h4 className="text-sm font-bold text-slate-950 group-hover:text-zuva-solar transition-colors">
                  Electricity Tokens
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  IKEDC, EKEDC, AEDC instant 20-digit meter tokens.
                </p>
              </Link>

              <Link
                href="/services#sms"
                onClick={() => setActiveDropdown(null)}
                className="group block p-2 rounded-xl hover:bg-slate-50 transition-colors"
              >
                <h4 className="text-sm font-bold text-slate-950 group-hover:text-zuva-solar transition-colors">
                  Virtual Foreign SMS (OTPs)
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Real US, UK & Kenya numbers for instant OTPs.
                </p>
              </Link>

              <Link
                href="/#mobile-app"
                onClick={() => setActiveDropdown(null)}
                className="group block p-2 rounded-xl hover:bg-slate-50 transition-colors"
              >
                <h4 className="text-sm font-bold text-slate-950 group-hover:text-zuva-solar transition-colors">
                  Dedicated Bank Accounts
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Instant Moniepoint & Wema accounts in your name.
                </p>
              </Link>
            </div>

            {/* Column 3: Right Featured Card (ZojaPay style with Guaranteed Visible Text) */}
            <div className="col-span-4 flex flex-col justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5 block">
                Featured
              </span>
              <div
                data-preserve-dark="true"
                style={{ backgroundColor: '#0B1120', color: '#FFFFFF' }}
                className="relative flex-1 rounded-[24px] overflow-hidden p-6 border border-slate-800 shadow-lg flex flex-col justify-between group"
              >
                {/* Glowing ambient background orb */}
                <div className="absolute -top-10 -right-10 w-44 h-44 bg-orange-500/20 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10 space-y-2">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-500/20 border border-orange-500/30 text-zuva-amber text-[10px] font-black tracking-widest uppercase">
                    <Sparkles className="w-3 h-3 text-zuva-amber" />
                    Mobile App Release
                  </div>
                  <h4 className="text-lg font-black font-display text-white tracking-tight leading-snug">
                    ZuvaPay for iOS & Android
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed font-normal">
                    Carry ₦240/GB SME data, 1.1s power tokens, and Moniepoint virtual accounts right in your pocket.
                  </p>

                  <div className="pt-2 flex flex-wrap items-center gap-2 text-[10px]">
                    <span className="px-2.5 py-1 rounded-lg bg-white/10 border border-white/15 text-white font-semibold flex items-center gap-1.5">
                      <Smartphone className="w-3 h-3 text-zuva-amber" />
                      iOS & Android Beta
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Live Preview
                    </span>
                  </div>
                </div>

                <Link
                  href="/#mobile-app"
                  onClick={() => setActiveDropdown(null)}
                  className="relative z-10 mt-5 pt-3 border-t border-white/10 flex items-center justify-between text-xs font-bold text-zuva-amber group-hover:text-white transition-colors"
                >
                  <span>Explore Mobile UI Showcase</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          ZOJAPAY-STYLE MEGA MENU 2: COMPANY (FLOATING CARD)
         ========================================================================= */}
      {activeDropdown === 'company' && (
        <div
          onMouseLeave={() => setActiveDropdown(null)}
          className="hidden md:block absolute top-[calc(100%+12px)] left-1/2 -translate-x-1/2 w-[92vw] max-w-3xl rounded-[28px] bg-white border border-slate-200/90 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.18)] p-6 before:content-[''] before:absolute before:-top-3 before:left-0 before:right-0 before:h-4 animate-in fade-in zoom-in-95 duration-200"
        >
          <div className="grid grid-cols-3 gap-4">
            <Link
              href="/about"
              onClick={() => setActiveDropdown(null)}
              className="p-4 rounded-2xl hover:bg-slate-50 transition-colors border border-slate-200/70 hover:border-zuva-solar/40 space-y-2 group"
            >
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-orange-100 text-zuva-solar">
                  <Building2 className="w-4 h-4" />
                </div>
                <h4 className="text-sm font-bold text-slate-900 group-hover:text-zuva-solar transition-colors">
                  Our Story & Mission
                </h4>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Built by Nigerians tired of banking apps hanging when we need them most.
              </p>
            </Link>

            <Link
              href="/#ambassador"
              onClick={() => setActiveDropdown(null)}
              className="p-4 rounded-2xl hover:bg-slate-50 transition-colors border border-slate-200/70 hover:border-zuva-solar/40 space-y-2 group"
            >
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-100 text-amber-700">
                  <Users className="w-4 h-4" />
                </div>
                <h4 className="text-sm font-bold text-slate-900 group-hover:text-zuva-solar transition-colors">
                  Campus Ambassador
                </h4>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Join our campus creator crew and earn ₦50,000+ monthly sharing cheap data.
              </p>
            </Link>

            <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/70 space-y-2">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-blue-100 text-blue-700">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <h4 className="text-sm font-bold text-slate-900">
                  Banking & NDPR
                </h4>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Partnered with Moniepoint MFB & Wema Bank. Regulated settlement & 256-bit TLS.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          ZOJAPAY-STYLE MEGA MENU 3: HELP & SUPPORT (FLOATING CARD)
         ========================================================================= */}
      {activeDropdown === 'help' && (
        <div
          onMouseLeave={() => setActiveDropdown(null)}
          className="hidden md:block absolute top-[calc(100%+12px)] left-1/2 -translate-x-1/2 w-[92vw] max-w-3xl rounded-[28px] bg-white border border-slate-200/90 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.18)] p-6 before:content-[''] before:absolute before:-top-3 before:left-0 before:right-0 before:h-4 animate-in fade-in zoom-in-95 duration-200"
        >
          <div className="grid grid-cols-3 gap-4">
            <Link
              href="/#faqs"
              onClick={() => setActiveDropdown(null)}
              className="p-4 rounded-2xl hover:bg-slate-50 transition-colors border border-slate-200/70 hover:border-zuva-solar/40 space-y-2 group"
            >
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-orange-100 text-zuva-solar">
                  <HelpCircle className="w-4 h-4" />
                </div>
                <h4 className="text-sm font-bold text-slate-900 group-hover:text-zuva-solar transition-colors">
                  FAQs & Answers
                </h4>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Learn about auto-refund guarantees, virtual OTP lines, and funding speeds.
              </p>
            </Link>

            <a
              href="https://wa.me/2348000000000?text=Hello%20ZuvaPay%20Support%2C%20I%20need%20assistance"
              target="_blank"
              rel="noreferrer"
              className="p-4 rounded-2xl hover:bg-slate-50 transition-colors border border-slate-200/70 hover:border-emerald-500/40 space-y-2 group"
            >
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
                  <MessageCircle className="w-4 h-4" />
                </div>
                <h4 className="text-sm font-bold text-slate-900 group-hover:text-emerald-600 transition-colors flex items-center gap-1">
                  <span>WhatsApp Live</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </h4>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Chat directly with our human support team in Lagos (Average reply &lt; 3 mins).
              </p>
            </a>

            <a
              href="mailto:support@zuvapay.com"
              className="p-4 rounded-2xl hover:bg-slate-50 transition-colors border border-slate-200/70 hover:border-blue-500/40 space-y-2 group"
            >
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-blue-100 text-blue-700">
                  <Mail className="w-4 h-4" />
                </div>
                <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                  Email Desk
                </h4>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Write to support@zuvapay.com for billing resolutions, partnership, or enterprise questions.
              </p>
            </a>
          </div>
        </div>
      )}

      {/* =========================================================================
          MOBILE DRAWER WITH ACCORDION SUBMENUS
         ========================================================================= */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-6 py-6 space-y-4 shadow-2xl animate-in slide-in-from-top-4 max-h-[85vh] overflow-y-auto">
          {/* Services Accordion */}
          <div className="border-b border-slate-100 pb-3">
            <button
              onClick={() => toggleMobileSection('services')}
              className="w-full flex items-center justify-between text-sm font-bold text-slate-900 py-2"
            >
              <span>Services</span>
              <ChevronDown
                className={`w-4 h-4 transition-transform ${mobileExpanded.services ? 'rotate-180 text-zuva-solar' : 'text-slate-400'}`}
              />
            </button>
            {mobileExpanded.services && (
              <div className="pl-3 py-2 space-y-2.5 text-xs text-slate-600 animate-in fade-in">
                <Link
                  href="/services#data"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-1 hover:text-zuva-solar font-medium"
                >
                  📱 Airtime & SME Data (from ₦240)
                </Link>
                <Link
                  href="/services#power"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-1 hover:text-zuva-solar font-medium"
                >
                  ⚡ Prepaid Electricity Tokens
                </Link>
                <Link
                  href="/services#sms"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-1 hover:text-zuva-solar font-medium"
                >
                  💬 Virtual Foreign SMS (US/UK OTP)
                </Link>
                <Link
                  href="/#mobile-app"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-1 hover:text-zuva-solar font-medium"
                >
                  🏦 Virtual Bank Accounts (Moniepoint)
                </Link>
              </div>
            )}
          </div>

          {/* Company Accordion */}
          <div className="border-b border-slate-100 pb-3">
            <button
              onClick={() => toggleMobileSection('company')}
              className="w-full flex items-center justify-between text-sm font-bold text-slate-900 py-2"
            >
              <span>Company</span>
              <ChevronDown
                className={`w-4 h-4 transition-transform ${mobileExpanded.company ? 'rotate-180 text-zuva-solar' : 'text-slate-400'}`}
              />
            </button>
            {mobileExpanded.company && (
              <div className="pl-3 py-2 space-y-2.5 text-xs text-slate-600 animate-in fade-in">
                <Link
                  href="/about"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-1 hover:text-zuva-solar font-medium"
                >
                  🏢 Our Story & Mission
                </Link>
                <Link
                  href="/#ambassador"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-1 hover:text-zuva-solar font-medium"
                >
                  🌟 Campus Ambassador Program (Earn ₦50k)
                </Link>
              </div>
            )}
          </div>

          {/* Direct Pricing Link */}
          <div className="border-b border-slate-100 pb-3">
            <Link
              href="/pricing"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-bold text-slate-900 py-2 hover:text-zuva-solar"
            >
              Pricing & Wholesale Margins
            </Link>
          </div>

          {/* Help Accordion */}
          <div className="border-b border-slate-100 pb-3">
            <button
              onClick={() => toggleMobileSection('help')}
              className="w-full flex items-center justify-between text-sm font-bold text-slate-900 py-2"
            >
              <span>Help & Support</span>
              <ChevronDown
                className={`w-4 h-4 transition-transform ${mobileExpanded.help ? 'rotate-180 text-zuva-solar' : 'text-slate-400'}`}
              />
            </button>
            {mobileExpanded.help && (
              <div className="pl-3 py-2 space-y-2.5 text-xs text-slate-600 animate-in fade-in">
                <Link
                  href="/#faqs"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-1 hover:text-zuva-solar font-medium"
                >
                  ❓ FAQs & Answers
                </Link>
                <a
                  href="https://wa.me/2348000000000?text=Hello%20ZuvaPay%20Support"
                  target="_blank"
                  rel="noreferrer"
                  className="block py-1 text-emerald-600 font-bold"
                >
                  💬 WhatsApp Support (Live)
                </a>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="pt-2 flex flex-col gap-2.5">
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
                  Get Started Free
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
