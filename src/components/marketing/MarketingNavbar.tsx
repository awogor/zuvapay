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
          ZOJAPAY-STYLE MEGA MENU 1: SERVICES & PAYMENTS
         ========================================================================= */}
      {activeDropdown === 'services' && (
        <div
          onMouseLeave={() => setActiveDropdown(null)}
          className="hidden md:block absolute top-full left-1/2 -translate-x-1/2 w-full max-w-6xl border-x border-b border-slate-200/80 bg-white shadow-2xl rounded-b-3xl animate-in fade-in slide-in-from-top-2 duration-200"
        >
          <div className="px-6 py-8">
            <div className="grid grid-cols-12 gap-8 items-stretch">
              {/* Column 1: Left CTA Callout Card (ZojaPay style) */}
              <div className="col-span-4 p-7 rounded-[28px] bg-gradient-to-br from-orange-50/60 via-amber-50/40 to-slate-50 border border-orange-200/60 flex flex-col justify-between space-y-6">
                <div className="space-y-3">
                  <div className="inline-flex items-center px-3 py-1 rounded-full bg-white border border-orange-200 text-zuva-solar text-xs font-bold shadow-sm">
                    Instant Payments Suite
                  </div>
                  <h3 className="text-2xl font-black text-slate-950 font-display leading-tight">
                    Get Instant Access to ZuvaPay Utilities
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Enjoy wholesale SME data from ₦240/GB, 1.1s instant electricity meter tokens, and dedicated automated virtual accounts that fund on the first try.
                  </p>
                </div>

                <div>
                  <Link
                    href="/signup"
                    onClick={() => setActiveDropdown(null)}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-zuva-solar to-zuva-amber hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs shadow-md shadow-orange-500/20 transition-all hover:scale-105"
                  >
                    Open Free Account
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              {/* Column 2: Service Links Directory (ZojaPay style) */}
              <div className="col-span-5 grid grid-cols-1 gap-2.5">
                <Link
                  href="/services#data"
                  onClick={() => setActiveDropdown(null)}
                  className="p-3.5 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200/80 flex items-start gap-3.5 group"
                >
                  <div className="p-2.5 rounded-xl bg-orange-100 text-zuva-solar group-hover:scale-105 transition-transform">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 group-hover:text-zuva-solar transition-colors">
                      Airtime & SME Data
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      MTN, Airtel, Glo, 9mobile from ₦240/GB with 100% automated refund.
                    </p>
                  </div>
                </Link>

                <Link
                  href="/services#power"
                  onClick={() => setActiveDropdown(null)}
                  className="p-3.5 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200/80 flex items-start gap-3.5 group"
                >
                  <div className="p-2.5 rounded-xl bg-teal-100 text-teal-700 group-hover:scale-105 transition-transform">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 group-hover:text-zuva-solar transition-colors">
                      Prepaid Electricity Tokens
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      IKEDC, EKEDC, AEDC instant 20-digit token generation without convenience fee.
                    </p>
                  </div>
                </Link>

                <Link
                  href="/services#sms"
                  onClick={() => setActiveDropdown(null)}
                  className="p-3.5 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200/80 flex items-start gap-3.5 group"
                >
                  <div className="p-2.5 rounded-xl bg-purple-100 text-purple-700 group-hover:scale-105 transition-transform">
                    <MessageSquareCode className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 group-hover:text-zuva-solar transition-colors">
                      Virtual SMS Phone Numbers (OTPs)
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Real US, UK, and Kenya lines for WhatsApp, OpenAI, and Telegram verification.
                    </p>
                  </div>
                </Link>

                <Link
                  href="/#mobile-app"
                  onClick={() => setActiveDropdown(null)}
                  className="p-3.5 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200/80 flex items-start gap-3.5 group"
                >
                  <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-700 group-hover:scale-105 transition-transform">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 group-hover:text-zuva-solar transition-colors">
                      Instant Wallet Funding
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Dedicated automated virtual account to fund your bill payment wallet in seconds.
                    </p>
                  </div>
                </Link>
              </div>

              {/* Column 3: Right Featured Card (ZojaPay style) */}
              <div
                data-preserve-dark
                className="col-span-3 flex flex-col justify-between p-6 rounded-[28px] !bg-[#0A0D14] !text-white border border-slate-800 relative overflow-hidden shadow-xl"
              >
                <div className="absolute top-0 right-0 w-40 h-40 bg-orange-500/20 rounded-full blur-2xl pointer-events-none" />

                <div className="space-y-3 relative z-10">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-zuva-amber">
                    Featured Release
                  </span>
                  <h4 className="text-lg font-black font-display !text-white">
                    ZuvaPay Mobile on iOS & Android
                  </h4>
                  <p className="text-xs !text-slate-300 leading-relaxed">
                    Carry zero-stress utility payments in your pocket. Biometric Face ID, offline cache, and instant push receipts.
                  </p>
                  <div className="pt-2 flex items-center gap-2 text-[11px] text-emerald-400 font-semibold">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Beta App Rolling Out</span>
                  </div>
                </div>

                <Link
                  href="/#mobile-app"
                  onClick={() => setActiveDropdown(null)}
                  className="mt-6 flex items-center justify-between text-xs font-bold !text-white hover:!text-zuva-amber transition-colors pt-4 border-t border-white/10"
                >
                  <span>See Mobile App UI</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          ZOJAPAY-STYLE MEGA MENU 2: COMPANY
         ========================================================================= */}
      {activeDropdown === 'company' && (
        <div
          onMouseLeave={() => setActiveDropdown(null)}
          className="hidden md:block absolute top-full left-1/2 -translate-x-1/2 w-full max-w-5xl border-x border-b border-slate-200/80 bg-white shadow-2xl rounded-b-3xl animate-in fade-in slide-in-from-top-2 duration-200"
        >
          <div className="px-6 py-8">
            <div className="grid grid-cols-3 gap-6">
              <Link
                href="/about"
                onClick={() => setActiveDropdown(null)}
                className="p-5 rounded-2xl hover:bg-slate-50 transition-colors border border-slate-200/80 hover:border-zuva-solar/40 space-y-2 group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-orange-100 text-zuva-solar">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 group-hover:text-zuva-solar transition-colors">
                    Our Story & Mission
                  </h4>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Built by Nigerians who were tired of banking apps hanging when we needed them most.
                </p>
              </Link>

              <Link
                href="/#ambassador"
                onClick={() => setActiveDropdown(null)}
                className="p-5 rounded-2xl hover:bg-slate-50 transition-colors border border-slate-200/80 hover:border-zuva-solar/40 space-y-2 group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-amber-100 text-amber-700">
                    <Users className="w-4 h-4" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 group-hover:text-zuva-solar transition-colors">
                    Campus Ambassador Program
                  </h4>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Join our campus creator crew and earn ₦50,000+ monthly commissions sharing cheap data.
                </p>
              </Link>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-blue-100 text-blue-700">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">
                    Licensed Partners & NDPR
                  </h4>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Settlement powered by CBN-licensed financial partners with 256-bit TLS encryption.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          ZOJAPAY-STYLE MEGA MENU 3: HELP & SUPPORT
         ========================================================================= */}
      {activeDropdown === 'help' && (
        <div
          onMouseLeave={() => setActiveDropdown(null)}
          className="hidden md:block absolute top-full left-1/2 -translate-x-1/2 w-full max-w-5xl border-x border-b border-slate-200/80 bg-white shadow-2xl rounded-b-3xl animate-in fade-in slide-in-from-top-2 duration-200"
        >
          <div className="p-8">
            <div className="grid grid-cols-3 gap-6">
              <Link
                href="https://wa.me/2348000000000?text=Hello%20ZuvaPay%20Help%20Desk"
                target="_blank"
                onClick={() => setActiveDropdown(null)}
                className="p-5 rounded-2xl bg-slate-50 hover:bg-emerald-50 border border-slate-200/80 hover:border-emerald-200 transition-all group"
              >
                <div className="p-3 rounded-xl bg-emerald-100 text-emerald-600 w-fit mb-3 group-hover:scale-110 transition-transform">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                  WhatsApp Instant Help
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Connect directly with our 24/7 human support team in Lagos.
                </p>
              </Link>

              <Link
                href="/#faqs"
                onClick={() => setActiveDropdown(null)}
                className="p-5 rounded-2xl bg-slate-50 hover:bg-orange-50 border border-slate-200/80 hover:border-orange-200 transition-all group"
              >
                <div className="p-3 rounded-xl bg-orange-100 text-zuva-solar w-fit mb-3 group-hover:scale-110 transition-transform">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-slate-900 group-hover:text-zuva-solar transition-colors">
                  Knowledge Base &amp; FAQ
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Step-by-step guides on virtual SIM setup, SME data, and tokens.
                </p>
              </Link>

              <Link
                href="mailto:support@zuvapay.com"
                onClick={() => setActiveDropdown(null)}
                className="p-5 rounded-2xl bg-slate-50 hover:bg-purple-50 border border-slate-200/80 hover:border-purple-200 transition-all group"
              >
                <div className="p-3 rounded-xl bg-purple-100 text-purple-600 w-fit mb-3 group-hover:scale-110 transition-transform">
                  <Mail className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-slate-900 group-hover:text-purple-700 transition-colors">
                  Email Support Desk
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Official inquiries, partnerships, and high-volume merchant queries.
                </p>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MOBILE DRAWER WITH ACCORDION SUBMENUS
         ========================================================================= */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200/80 bg-white/95 backdrop-blur-2xl px-5 pt-3 pb-6 space-y-4 animate-in slide-in-from-top-2 duration-200 max-h-[85vh] overflow-y-auto">
          {/* Services Accordion */}
          <div className="border-b border-slate-100 pb-3">
            <button
              onClick={() => toggleMobileSection('services')}
              className="flex items-center justify-between w-full py-2 text-sm font-bold text-slate-900"
            >
              <span>Services</span>
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-200 ${
                  mobileExpanded.services ? 'rotate-180 text-zuva-solar' : 'text-slate-400'
                }`}
              />
            </button>
            {mobileExpanded.services && (
              <div className="pl-3 pt-2 space-y-2.5 text-xs text-slate-600">
                <Link
                  href="/services#data"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-1 hover:text-zuva-solar font-medium"
                >
                  📱 Airtime &amp; SME Data (₦240/GB)
                </Link>
                <Link
                  href="/services#power"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-1 hover:text-zuva-solar font-medium"
                >
                  ⚡ Prepaid Electricity Tokens (0% Fee)
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
                  🏦 Dedicated Virtual Accounts
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
