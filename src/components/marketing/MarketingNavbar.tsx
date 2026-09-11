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
          ZOJAPAY-STYLE MEGA MENU 1: SERVICES & PAYMENTS (Floating Centered Card)
         ========================================================================= */}
      {activeDropdown === 'services' && (
        <div
          onMouseLeave={() => setActiveDropdown(null)}
          className="hidden md:block absolute top-[calc(100%+8px)] left-1/2 -translate-x-1/2 w-[94vw] max-w-5xl rounded-3xl border border-slate-200/90 bg-white/98 backdrop-blur-xl shadow-2xl shadow-slate-900/15 p-6 z-50 animate-in fade-in zoom-in-95 duration-150"
        >
          <div className="grid grid-cols-12 gap-5 items-stretch">
            {/* Column 1: Left Highlights & Quick Stats */}
            <div className="col-span-4 p-6 rounded-2xl bg-gradient-to-br from-orange-50/70 via-amber-50/40 to-slate-50 border border-orange-200/70 flex flex-col justify-between space-y-5">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-orange-200 text-zuva-solar text-[11px] font-bold shadow-xs">
                  <Sparkles className="w-3.5 h-3.5" />
                  Instant Services Suite
                </div>
                <h3 className="text-xl font-black text-slate-950 font-display leading-tight">
                  High-Speed Nigerian Utility Infrastructure
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Automated wholesale routing for SME data, prepaid Disco power tokens, virtual foreign SMS numbers, and instant Moniepoint bank accounts.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>100% Automated Instant Wallet Refund</span>
                </div>
                <Link
                  href="/services"
                  onClick={() => setActiveDropdown(null)}
                  className="inline-flex items-center justify-center w-full gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-zuva-solar to-zuva-amber hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs shadow-md shadow-orange-500/20 transition-all hover:scale-[1.02]"
                >
                  View Full Rates Catalog
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Column 2: Exact 6 Platform Services matching /services (2-column grid) */}
            <div className="col-span-8 grid grid-cols-2 gap-2.5">
              {/* 1. Airtime & SME Data */}
              <Link
                href="/services#data"
                onClick={() => setActiveDropdown(null)}
                className="p-3 rounded-2xl hover:bg-orange-50/50 transition-colors border border-transparent hover:border-orange-200/60 flex items-start gap-3 group"
              >
                <div className="p-2.5 rounded-xl bg-orange-100 text-zuva-solar group-hover:scale-105 transition-transform shrink-0">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-xs font-bold text-slate-900 group-hover:text-zuva-solar transition-colors">
                      Airtime & SME Data
                    </h4>
                    <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                      ₦240/GB
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                    MTN, Airtel, Glo & 9mobile with 2% airtime cashback.
                  </p>
                </div>
              </Link>

              {/* 2. Prepaid Electricity Tokens */}
              <Link
                href="/services#power"
                onClick={() => setActiveDropdown(null)}
                className="p-3 rounded-2xl hover:bg-teal-50/50 transition-colors border border-transparent hover:border-teal-200/60 flex items-start gap-3 group"
              >
                <div className="p-2.5 rounded-xl bg-teal-100 text-teal-700 group-hover:scale-105 transition-transform shrink-0">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-xs font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
                      Prepaid Electricity Tokens
                    </h4>
                    <span className="text-[10px] font-mono font-bold text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded">
                      0% Fee
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                    IKEDC, EKEDC, AEDC & IBEDC instant 20-digit tokens.
                  </p>
                </div>
              </Link>

              {/* 3. Virtual Foreign SMS Numbers (OTPs) */}
              <Link
                href="/services#sms"
                onClick={() => setActiveDropdown(null)}
                className="p-3 rounded-2xl hover:bg-purple-50/50 transition-colors border border-transparent hover:border-purple-200/60 flex items-start gap-3 group"
              >
                <div className="p-2.5 rounded-xl bg-purple-100 text-purple-700 group-hover:scale-105 transition-transform shrink-0">
                  <MessageSquareCode className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-xs font-bold text-slate-900 group-hover:text-purple-700 transition-colors">
                      Virtual SMS Numbers (OTPs)
                    </h4>
                    <span className="text-[10px] font-mono font-bold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded">
                      US / UK
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                    WhatsApp, OpenAI & Telegram. Full refund on timeout.
                  </p>
                </div>
              </Link>

              {/* 4. Cable TV Subscriptions */}
              <Link
                href="/services#tv"
                onClick={() => setActiveDropdown(null)}
                className="p-3 rounded-2xl hover:bg-sky-50/50 transition-colors border border-transparent hover:border-sky-200/60 flex items-start gap-3 group"
              >
                <div className="p-2.5 rounded-xl bg-sky-100 text-sky-700 group-hover:scale-105 transition-transform shrink-0">
                  <span className="text-sm">📺</span>
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-xs font-bold text-slate-900 group-hover:text-sky-700 transition-colors">
                      Cable TV Subscriptions
                    </h4>
                    <span className="text-[10px] font-mono font-bold text-sky-700 bg-sky-50 px-1.5 py-0.5 rounded">
                      Instant
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                    DStv, GOtv & StarTimes with live IUC pre-validation.
                  </p>
                </div>
              </Link>

              {/* 5. Social Media Boost & Aged Logs */}
              <Link
                href="/services#social"
                onClick={() => setActiveDropdown(null)}
                className="p-3 rounded-2xl hover:bg-rose-50/50 transition-colors border border-transparent hover:border-rose-200/60 flex items-start gap-3 group"
              >
                <div className="p-2.5 rounded-xl bg-rose-100 text-rose-700 group-hover:scale-105 transition-transform shrink-0">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-xs font-bold text-slate-900 group-hover:text-rose-700 transition-colors">
                      Social Growth & Aged Logs
                    </h4>
                    <span className="text-[10px] font-mono font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded">
                      Non-Drop
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                    YouTube boost, TikTok views & aged 2FA creator accounts.
                  </p>
                </div>
              </Link>

              {/* 6. Dedicated Virtual Accounts */}
              <Link
                href="/services#social"
                onClick={() => setActiveDropdown(null)}
                className="p-3 rounded-2xl hover:bg-emerald-50/50 transition-colors border border-transparent hover:border-emerald-200/60 flex items-start gap-3 group"
              >
                <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-700 group-hover:scale-105 transition-transform shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-xs font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                      Dedicated Virtual Accounts
                    </h4>
                    <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                      Moniepoint
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                    Permanent 10-digit NUBAN in your name with &lt; 2s top-ups.
                  </p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          ZOJAPAY-STYLE MEGA MENU 2: COMPANY (Floating Centered Card)
         ========================================================================= */}
      {activeDropdown === 'company' && (
        <div
          onMouseLeave={() => setActiveDropdown(null)}
          className="hidden md:block absolute top-[calc(100%+8px)] left-1/2 -translate-x-1/2 w-[90vw] max-w-3xl rounded-3xl border border-slate-200/90 bg-white/98 backdrop-blur-xl shadow-2xl shadow-slate-900/15 p-6 z-50 animate-in fade-in zoom-in-95 duration-150"
        >
          <div className="grid grid-cols-3 gap-4">
            <Link
              href="/about"
              onClick={() => setActiveDropdown(null)}
              className="p-4 rounded-2xl hover:bg-slate-50 transition-colors border border-slate-200/80 hover:border-zuva-solar/40 space-y-2 group"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-orange-100 text-zuva-solar">
                  <Building2 className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-slate-900 group-hover:text-zuva-solar transition-colors">
                  Our Story & Mission
                </h4>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Built by Nigerians who were tired of banking apps hanging when we needed them most.
              </p>
            </Link>

            <Link
              href="/#ambassador"
              onClick={() => setActiveDropdown(null)}
              className="p-4 rounded-2xl hover:bg-slate-50 transition-colors border border-slate-200/80 hover:border-zuva-solar/40 space-y-2 group"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-100 text-amber-700">
                  <Users className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-slate-900 group-hover:text-zuva-solar transition-colors">
                  Campus Ambassadors
                </h4>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Join our campus creator crew and earn ₦50,000+ monthly commissions sharing cheap data.
              </p>
            </Link>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-100 text-blue-700">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-slate-900">
                  Banking Partners
                </h4>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Moniepoint MFB & Wema ALAT regulated settlement with 256-bit TLS encryption.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          ZOJAPAY-STYLE MEGA MENU 3: HELP & SUPPORT (Floating Centered Card)
         ========================================================================= */}
      {activeDropdown === 'help' && (
        <div
          onMouseLeave={() => setActiveDropdown(null)}
          className="hidden md:block absolute top-[calc(100%+8px)] left-1/2 -translate-x-1/2 w-[90vw] max-w-3xl rounded-3xl border border-slate-200/90 bg-white/98 backdrop-blur-xl shadow-2xl shadow-slate-900/15 p-6 z-50 animate-in fade-in zoom-in-95 duration-150"
        >
          <div className="grid grid-cols-3 gap-4">
            <Link
              href="/#faqs"
              onClick={() => setActiveDropdown(null)}
              className="p-4 rounded-2xl hover:bg-slate-50 transition-colors border border-slate-200/80 hover:border-zuva-solar/40 space-y-2 group"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-orange-100 text-zuva-solar">
                  <HelpCircle className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-slate-900 group-hover:text-zuva-solar transition-colors">
                  FAQs & Guides
                </h4>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Learn about auto-refund guarantees, virtual OTP lines, and funding speeds.
              </p>
            </Link>

            <a
              href="https://wa.me/2348000000000?text=Hello%20ZuvaPay%20Support%2C%20I%20need%20assistance"
              target="_blank"
              rel="noreferrer"
              className="p-4 rounded-2xl hover:bg-slate-50 transition-colors border border-slate-200/80 hover:border-emerald-500/40 space-y-2 group"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
                  <MessageCircle className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-slate-900 group-hover:text-emerald-600 transition-colors flex items-center gap-1">
                  <span>WhatsApp Live</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </h4>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Chat directly with human support in Lagos (Average reply &lt; 3 mins).
              </p>
            </a>

            <a
              href="mailto:support@zuvapay.com"
              className="p-4 rounded-2xl hover:bg-slate-50 transition-colors border border-slate-200/80 hover:border-blue-500/40 space-y-2 group"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-100 text-blue-700">
                  <Mail className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                  Email Desk
                </h4>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                support@zuvapay.com for billing resolutions, partnership, or enterprise questions.
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
                  📱 Airtime & SME Data (from ₦240/GB)
                </Link>
                <Link
                  href="/services#power"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-1 hover:text-zuva-solar font-medium"
                >
                  ⚡ Prepaid Electricity Tokens (0% fee)
                </Link>
                <Link
                  href="/services#sms"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-1 hover:text-zuva-solar font-medium"
                >
                  💬 Virtual Foreign SMS (US & UK OTPs)
                </Link>
                <Link
                  href="/services#tv"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-1 hover:text-zuva-solar font-medium"
                >
                  📺 Cable TV Subscriptions (DStv, GOtv)
                </Link>
                <Link
                  href="/services#social"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-1 hover:text-zuva-solar font-medium"
                >
                  🚀 Social Growth & Aged Logs
                </Link>
                <Link
                  href="/services#social"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-1 hover:text-zuva-solar font-medium"
                >
                  🏦 Dedicated Virtual Accounts (Moniepoint)
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
