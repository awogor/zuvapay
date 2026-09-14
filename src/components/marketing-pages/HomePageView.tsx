'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { MarketingNavbar } from '@/components/marketing/MarketingNavbar';
import { MarketingFooter } from '@/components/marketing/MarketingFooter';
import { HeroInteractiveDemo } from '@/components/marketing/HeroInteractiveDemo';
import { MobileAppShowcase } from '@/components/marketing/MobileAppShowcase';
import { FeaturedOn } from '@/components/marketing/FeaturedOn';
import { StrategicPartners } from '@/components/marketing/StrategicPartners';
import {
  Smartphone,
  MessageSquareCode,
  Zap,
  TrendingUp,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Lock,
  RefreshCw,
  ShoppingBag,
  Star,
  ChevronRight,
  Sparkles,
  Flame,
  CreditCard,
  Globe,
  Tv,
  Wifi,
} from 'lucide-react';

export function HomePageView() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setActiveFaq((prev) => (prev === index ? null : index));
  };

  const FAQS = [
    {
      q: 'What happens if a telco delays my airtime or data?',
      a: 'We operate on a strict "Debit First, Verify Delivery, Instant Auto-Refund" system. If MTN, Airtel, or Glo rejects your recharge or times out, your money returns into your wallet within 5 seconds. Zero customer care drama.',
    },
    {
      q: 'Are the virtual numbers real foreign SIM cards for OTP?',
      a: 'Yes. They are live real carrier lines (USA, UK, Kenya, Canada, etc.) that receive SMS verification codes directly for WhatsApp, Telegram, OpenAI ChatGPT, Google, and banking apps. You get a dedicated 15-minute window with live polling.',
    },
    {
      q: 'How do I fund my wallet for checkouts?',
      a: 'You can fund your ZuvaPay balance instantly 24/7 via automated bank transfer, card, or USSD. Your balance reflects in seconds so you can purchase data, electricity tokens, or foreign OTP numbers immediately.',
    },
    {
      q: 'Can I pay in both USD and Naira?',
      a: 'Yes. You have access to both an NGN wallet and a USD sub-wallet. You can seamlessly convert between Naira and Dollars in real-time at wholesale rates to pay for foreign SMS numbers and international digital tools.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#FDFDFC] text-slate-900 font-sans selection:bg-zuva-solar selection:text-white">
      <MarketingNavbar />

      {/* =========================================================================
          HERO SECTION: Streamlined & Balanced Typography, ZuvaPay Solar Theme
         ========================================================================= */}
      <section className="relative pt-24 pb-16 md:pt-28 md:pb-20 overflow-hidden bg-gradient-to-b from-orange-50/40 via-white to-[#FDFDFC]">
        {/* Soft Ambient Background Solar Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-zuva-solar/10 via-amber-200/20 to-emerald-200/10 blur-[110px] pointer-events-none" />
        <div className="absolute top-1/3 -left-40 w-80 h-80 bg-amber-100/30 blur-[90px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
            {/* Left Copy Area */}
            <div className="lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-left">
              {/* Category Pill / Kicker */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-zuva-solar text-xs font-bold mb-4 shadow-xs">
                <span className="w-2 h-2 rounded-full bg-zuva-solar animate-pulse" />
                <span>Zero-Delay Digital Utilities Platform</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-3xl sm:text-4xl md:text-[44px] lg:text-[48px] font-extrabold tracking-tight text-slate-950 leading-[1.18] max-w-xl">
                Instant SME data, electricity &amp; utility bills with{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-zuva-solar via-zuva-amber to-amber-500">
                  zero delay.
                </span>
              </h1>

              {/* Subheadline */}
              <p className="mt-4 text-sm sm:text-base text-slate-600 leading-relaxed max-w-xl">
                Power all your everyday digital essentials from one high-speed dashboard. Wholesale SME data from ₦240/GB, 20-digit electricity tokens in seconds, virtual OTP lines, and instant automated refunds.
              </p>

              {/* CTA Group */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 mt-6 w-full sm:w-auto">
                <Link
                  href="/signup"
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-zuva-solar to-zuva-amber hover:from-amber-600 hover:to-orange-600 text-white font-bold text-sm shadow-lg shadow-orange-500/20 transition-all hover:scale-[1.02] active:scale-95"
                >
                  Create Free Account (₦0)
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </Link>

                <Link
                  href="#services"
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-900 font-bold text-sm shadow-xs transition-all active:scale-95"
                >
                  Explore Services & Rates
                </Link>
              </div>

              {/* Trust Micro-Badges */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 mt-6 text-xs text-slate-500 font-medium">
                <span className="flex items-center gap-1.5">
                  <span className="text-emerald-500 font-bold">✓</span> ₦0 Account Opening
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="text-emerald-500 font-bold">✓</span> Instant Automated Refunds
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="text-emerald-500 font-bold">✓</span> 99.9% Switch Uptime
                </span>
              </div>
            </div>

            {/* Right Interactive Simulator */}
            <div className="lg:col-span-5 w-full max-w-lg mx-auto lg:max-w-none" id="speed">
              <HeroInteractiveDemo />
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SOCIAL PROOF: Real Nigerian Traction
         ========================================================================= */}
      <section className="py-14 bg-white" id="rates">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="space-y-1">
              <p className="font-mono text-3xl md:text-4xl font-black text-slate-950">32,400+</p>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Active Hustlers & Users</p>
            </div>
            <div className="space-y-1">
              <p className="font-mono text-3xl md:text-4xl font-black text-emerald-600">₦240M+</p>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Dispatched Volume</p>
            </div>
            <div className="space-y-1">
              <p className="font-mono text-3xl md:text-4xl font-black text-zuva-solar">&lt; 1.2 Sec</p>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Average Token Speed</p>
            </div>
            <div className="space-y-1">
              <p className="font-mono text-3xl md:text-4xl font-black text-indigo-600">150+ Countries</p>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Global SMS Numbers</p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          PAIN POINTS SOLVED: "Why ZuvaPay Hits Different"
         ========================================================================= */}
      <section className="py-24 relative overflow-hidden bg-[#FDFDFC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-xs font-bold text-zuva-solar">
              <span>Pain Points Solved</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-slate-950 font-display">
              Fast, reliable bill payments and communication tools without the stress.
            </h2>
            <p className="text-sm text-slate-600">
              We eliminated every annoying bottleneck where utility bills delay, SMS OTPs never arrive, or failed transactions hang your funds.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="p-8 rounded-[28px] border border-slate-200/80 bg-white shadow-sm hover:shadow-xl hover:border-orange-300 transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-orange-50 text-zuva-solar flex items-center justify-center font-bold shadow-sm">
                <RefreshCw className="w-6 h-6 group-hover:rotate-180 transition-transform duration-500" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mt-5">Instant 5-Second Auto-Refund</h3>
              <p className="text-xs text-slate-600 leading-relaxed mt-2.5">
                If MTN, Airtel, or an electricity Disco gateway times out, ZuvaPay cancels the transaction and refunds your wallet immediately. Zero 24-hour waiting periods.
              </p>
            </div>

            {/* Card 2 */}
            <div className="p-8 rounded-[28px] border border-slate-200/80 bg-white shadow-sm hover:shadow-xl hover:border-indigo-300 transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold shadow-sm">
                <MessageSquareCode className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mt-5">Real Foreign Non-VoIP SIMs</h3>
              <p className="text-xs text-slate-600 leading-relaxed mt-2.5">
                Rent legitimate US, UK, and Kenya mobile lines to register WhatsApp, Telegram, or OpenAI ChatGPT. Live OTP listening window with zero charge if no code is received.
              </p>
            </div>

            {/* Card 3 */}
            <div className="p-8 rounded-[28px] border border-slate-200/80 bg-white shadow-sm hover:shadow-xl hover:border-emerald-300 transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold shadow-sm">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mt-5">5-Second Auto-Refunds</h3>
              <p className="text-xs text-slate-600 leading-relaxed mt-2.5">
                If a telecom carrier or utility provider times out or rejects your order, 100% of your funds are returned immediately to your wallet. No waiting, no customer support calls.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          CORE SERVICE DIRECTORY
         ========================================================================= */}
      <section id="services" className="py-24 border-t border-slate-200/80 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
            <div className="space-y-3 max-w-xl">
              <h2 className="text-xs font-bold uppercase tracking-widest text-emerald-600">
                Unified Digital Suite
              </h2>
              <p className="text-3xl md:text-4xl font-black text-slate-950 font-display">
                Everything your business or hustle needs in one clean dashboard.
              </p>
            </div>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 text-sm font-bold text-brand-orange hover:text-amber-600 transition-colors"
            >
              Get started with ₦0 signup fee
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Service 1: Bill Payments */}
            <div className="p-6 rounded-3xl border border-slate-200/80 bg-slate-50/50 hover:bg-white hover:shadow-xl hover:border-slate-300 transition-all flex flex-col justify-between space-y-4 group">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="p-3 rounded-2xl bg-orange-100 text-brand-orange group-hover:scale-105 transition-transform">
                    <Smartphone className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                    2% Cashback
                  </span>
                </div>
                <div>
                  <h4 className="text-lg font-bold text-slate-900 group-hover:text-brand-orange transition-colors">
                    Bill Payments
                  </h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    Instant airtime top-up, utility bill settlements, and everyday recharge across Nigerian mobile networks with automated delivery.
                  </p>
                </div>
                <ul className="text-[11px] text-slate-700 space-y-1.5 pt-2 border-t border-slate-200/60">
                  <li className="flex items-center gap-2 font-medium">✓ 2% instant cashback discount on airtime</li>
                  <li className="flex items-center gap-2 font-medium">✓ Automated printable transaction receipts</li>
                </ul>
              </div>
              <Link
                href="/services/bill-payment"
                className="inline-flex items-center justify-between w-full pt-3 text-xs font-bold text-slate-900 group-hover:text-brand-orange transition-colors border-t border-slate-100"
              >
                <span>View Bill Payments</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Service 2: SME Data Subscription */}
            <div className="p-6 rounded-3xl border border-slate-200/80 bg-slate-50/50 hover:bg-white hover:shadow-xl hover:border-slate-300 transition-all flex flex-col justify-between space-y-4 group">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="p-3 rounded-2xl bg-sky-100 text-sky-700 group-hover:scale-105 transition-transform">
                    <Wifi className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                    From ₦240/GB
                  </span>
                </div>
                <div>
                  <h4 className="text-lg font-bold text-slate-900 group-hover:text-sky-700 transition-colors">
                    SME Data Subscription
                  </h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    High-speed SME, Corporate Gifting, and Direct Data bundles for MTN, Airtel, Glo, and 9mobile with instant 1.2s delivery.
                  </p>
                </div>
                <ul className="text-[11px] text-slate-700 space-y-1.5 pt-2 border-t border-slate-200/60">
                  <li className="flex items-center gap-2 font-medium">✓ 30-day automatic data rollover</li>
                  <li className="flex items-center gap-2 font-medium">✓ Wholesale prices for easy reselling</li>
                </ul>
              </div>
              <Link
                href="/services/sme-data"
                className="inline-flex items-center justify-between w-full pt-3 text-xs font-bold text-slate-900 group-hover:text-sky-700 transition-colors border-t border-slate-100"
              >
                <span>View SME Data Plans</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Service 3: Electricity Payment */}
            <div className="p-6 rounded-3xl border border-slate-200/80 bg-slate-50/50 hover:bg-white hover:shadow-xl hover:border-slate-300 transition-all flex flex-col justify-between space-y-4 group">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="p-3 rounded-2xl bg-teal-100 text-teal-700 group-hover:scale-105 transition-transform">
                    <Zap className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-mono font-bold text-teal-700 bg-teal-50 border border-teal-200 px-2.5 py-1 rounded-full">
                    0% Convenience Fee
                  </span>
                </div>
                <div>
                  <h4 className="text-lg font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
                    Electricity Payment
                  </h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    Generate 20-digit prepaid meter tokens instantly for IKEDC, EKEDC, AEDC, IBEDC, KEDCO, and all major Nigerian Discos.
                  </p>
                </div>
                <ul className="text-[11px] text-slate-700 space-y-1.5 pt-2 border-t border-slate-200/60">
                  <li className="flex items-center gap-2 font-medium">✓ Pre-validation of customer meter name</li>
                  <li className="flex items-center gap-2 font-medium">✓ Instant token display &amp; SMS receipt</li>
                </ul>
              </div>
              <Link
                href="/services/electricity"
                className="inline-flex items-center justify-between w-full pt-3 text-xs font-bold text-slate-900 group-hover:text-teal-700 transition-colors border-t border-slate-100"
              >
                <span>View Electricity Discos</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Service 4: Cable TV Subscription */}
            <div className="p-6 rounded-3xl border border-slate-200/80 bg-slate-50/50 hover:bg-white hover:shadow-xl hover:border-slate-300 transition-all flex flex-col justify-between space-y-4 group">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="p-3 rounded-2xl bg-sky-100 text-sky-700 group-hover:scale-105 transition-transform">
                    <Tv className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-mono font-bold text-sky-700 bg-sky-50 border border-sky-200 px-2.5 py-1 rounded-full">
                    Instant Activation
                  </span>
                </div>
                <div>
                  <h4 className="text-lg font-bold text-slate-900 group-hover:text-sky-700 transition-colors">
                    Cable TV Subscription
                  </h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    Instant bouquet recharge and signal restoration for DStv, GOtv, and StarTimes. Verify subscriber profile before debit.
                  </p>
                </div>
                <ul className="text-[11px] text-slate-700 space-y-1.5 pt-2 border-t border-slate-200/60">
                  <li className="flex items-center gap-2 font-medium">✓ Real-time IUC/Smartcard number validation</li>
                  <li className="flex items-center gap-2 font-medium">✓ Automated signal clearing within 60s</li>
                </ul>
              </div>
              <Link
                href="/services/cable-tv"
                className="inline-flex items-center justify-between w-full pt-3 text-xs font-bold text-slate-900 group-hover:text-sky-700 transition-colors border-t border-slate-100"
              >
                <span>View Cable Packages</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Service 5: Virtual Phone Number */}
            <div className="p-6 rounded-3xl border border-slate-200/80 bg-slate-50/50 hover:bg-white hover:shadow-xl hover:border-slate-300 transition-all flex flex-col justify-between space-y-4 group">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="p-3 rounded-2xl bg-purple-100 text-purple-700 group-hover:scale-105 transition-transform">
                    <MessageSquareCode className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-mono font-bold text-purple-700 bg-purple-50 border border-purple-200 px-2.5 py-1 rounded-full">
                    150+ Countries
                  </span>
                </div>
                <div>
                  <h4 className="text-lg font-bold text-slate-900 group-hover:text-purple-700 transition-colors">
                    Virtual Phone Number
                  </h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    Real non-VoIP carrier foreign numbers from the US, UK, Canada, and 150+ countries. Dedicated window with full refund guarantee.
                  </p>
                </div>
                <ul className="text-[11px] text-slate-700 space-y-1.5 pt-2 border-t border-slate-200/60">
                  <li className="flex items-center gap-2 font-medium">✓ WhatsApp, OpenAI, Telegram &amp; Google support</li>
                  <li className="flex items-center gap-2 font-medium">✓ Automated instant refund if no code arrives</li>
                </ul>
              </div>
              <Link
                href="/services/virtual-number"
                className="inline-flex items-center justify-between w-full pt-3 text-xs font-bold text-slate-900 group-hover:text-purple-700 transition-colors border-t border-slate-100"
              >
                <span>View Phone Numbers</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Service 6: Virtual Dollar Card */}
            <div className="p-6 rounded-3xl border border-slate-200/80 bg-slate-50/50 hover:bg-white hover:shadow-xl hover:border-slate-300 transition-all flex flex-col justify-between space-y-4 group">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="p-3 rounded-2xl bg-emerald-100 text-emerald-700 group-hover:scale-105 transition-transform">
                    <CreditCard className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                    Mastercard &amp; Visa
                  </span>
                </div>
                <div>
                  <h4 className="text-lg font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                    Virtual Dollar Card
                  </h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    Dedicated USD virtual cards with official US Delaware billing addresses for Netflix, Apple, AWS, OpenAI, and international checkout.
                  </p>
                </div>
                <ul className="text-[11px] text-slate-700 space-y-1.5 pt-2 border-t border-slate-200/60">
                  <li className="flex items-center gap-2 font-medium">✓ 100% Global Merchant Acceptance</li>
                  <li className="flex items-center gap-2 font-medium">✓ Funded directly from your Naira wallet</li>
                </ul>
              </div>
              <Link
                href="/services/virtual-dollar-card"
                className="inline-flex items-center justify-between w-full pt-3 text-xs font-bold text-slate-900 group-hover:text-emerald-700 transition-colors border-t border-slate-100"
              >
                <span>Explore Virtual Dollar Cards</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          VIRTUAL DOLLAR CARD SHOWCASE (Mastercard & Visa Global Payments)
         ========================================================================= */}
      <section id="card" className="py-24 bg-gradient-to-b from-[#FAF8F5] via-white to-[#FDFDFC] border-t border-slate-200/80 relative overflow-hidden">
        {/* Soft Ambient Glows */}
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-orange-200/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-80 h-80 bg-emerald-200/20 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
                <CreditCard className="w-3.5 h-3.5" />
                Global Virtual Dollar Cards
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-950 font-display tracking-tight">
                Spend Globally in Dollars with Zero Declines
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                Create instant 3D-Secure USD Mastercard &amp; Visa cards in seconds. Funded directly from your Naira wallet to pay for Apple, Google, AWS, Netflix, Spotify, Canva, and international merchant checkouts.
              </p>
            </div>

            <Link
              href="/signup"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-950 hover:bg-slate-900 text-white font-bold text-xs shadow-md transition-all hover:scale-105 active:scale-95 whitespace-nowrap self-start md:self-end"
            >
              <span>Get Your Dollar Card</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* 3 in a line on desktop */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-7 items-stretch">
            {/* Card 1: Instant Card Creation & 3DS */}
            <div className="relative p-7 rounded-[30px] bg-gradient-to-b from-white via-orange-50/30 to-amber-50/20 border-2 border-orange-400/90 shadow-xl shadow-orange-500/10 flex flex-col justify-between transition-all duration-300 hover:shadow-2xl hover:border-orange-500 hover:-translate-y-1">
              <div className="absolute -top-3.5 right-6 inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-gradient-to-r from-orange-600 via-zuva-solar to-amber-500 text-white font-black text-[11px] uppercase tracking-wider shadow-md shadow-orange-500/30">
                <CreditCard className="w-3.5 h-3.5" />
                POPULAR
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="p-3 rounded-2xl bg-orange-500 text-white shadow-md shadow-orange-500/25">
                    <CreditCard className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100/70 border border-emerald-300 px-2.5 py-0.5 rounded-full">
                    Instant Issuance
                  </span>
                </div>

                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-zuva-solar">
                    Mastercard &amp; Visa 3DS
                  </div>
                  <h3 className="text-xl font-black text-slate-950 mt-1 leading-snug">
                    Virtual USD Debit Card
                  </h3>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    Issued with an official 16-digit card number, CVV, expiry date, and verified US Delaware billing address for 100% acceptance.
                  </p>
                </div>

                <ul className="space-y-2 text-xs text-slate-700 pt-3 border-t border-orange-100">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-orange-500 flex-shrink-0" />
                    <span>Works on Apple Store, iCloud &amp; Google Play</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-orange-500 flex-shrink-0" />
                    <span>Fund directly from your Naira wallet in seconds</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-orange-500 flex-shrink-0" />
                    <span>Instant SMS &amp; Email OTP security alerts</span>
                  </li>
                </ul>
              </div>

              <div className="pt-6 mt-6 border-t border-orange-200/60 flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Card Creation</p>
                  <p className="text-2xl font-black text-slate-950 font-mono">$2.00</p>
                </div>
                <Link
                  href="/signup"
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-zuva-solar to-zuva-amber hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs shadow-md shadow-orange-500/20 transition-all hover:scale-105 active:scale-95"
                >
                  <span>Issue Card</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Card 2: Subscriptions & Cloud */}
            <div className="relative p-7 rounded-[30px] bg-white border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-slate-300 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="p-3 rounded-2xl bg-teal-100 text-teal-700">
                    <Globe className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-bold text-teal-700 bg-teal-50 border border-teal-200 px-2.5 py-0.5 rounded-full">
                    Zero Declines
                  </span>
                </div>

                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-teal-600">
                    Streaming &amp; Cloud Billing
                  </div>
                  <h3 className="text-xl font-black text-slate-950 mt-1 leading-snug">
                    International Subscriptions
                  </h3>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    Say goodbye to &quot;Transaction Not Permitted&quot; errors on Nigerian bank cards. Pay for Netflix, Spotify, Amazon, Canva, and Coursera smoothly.
                  </p>
                </div>

                <ul className="space-y-2 text-xs text-slate-700 pt-3 border-t border-slate-100">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-teal-600 flex-shrink-0" />
                    <span>Supports recurring monthly subscription billing</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-teal-600 flex-shrink-0" />
                    <span>Real-time transaction authorization feed</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-teal-600 flex-shrink-0" />
                    <span>Live mid-market currency exchange rates</span>
                  </li>
                </ul>
              </div>

              <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Exchange Rate</p>
                  <p className="text-2xl font-black text-slate-950 font-mono">₦1,480/$</p>
                </div>
                <Link
                  href="/signup"
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-950 text-white font-bold text-xs transition-all hover:scale-105 active:scale-95"
                >
                  <span>Start Paying</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Card 3: Developer & Enterprise Tools */}
            <div className="relative p-7 rounded-[30px] bg-white border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-slate-300 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="p-3 rounded-2xl bg-indigo-100 text-indigo-700">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-full">
                    Bank-Grade Security
                  </span>
                </div>

                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">
                    Developer &amp; SaaS Billing
                  </div>
                  <h3 className="text-xl font-black text-slate-950 mt-1 leading-snug">
                    Developer Infrastructure
                  </h3>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    Reliable card payments for Amazon AWS, DigitalOcean, GitHub Copilot, OpenAI ChatGPT Plus, Vercel, and Figma Pro.
                  </p>
                </div>

                <ul className="space-y-2 text-xs text-slate-700 pt-3 border-t border-slate-100">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                    <span>Freeze or unfreeze your card anytime in 1-click</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                    <span>Liquidate unused USD balance back to Naira anytime</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                    <span>Automated payment decline protection</span>
                  </li>
                </ul>
              </div>

              <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Funding Limit</p>
                  <p className="text-2xl font-black text-slate-950 font-mono">$1,000</p>
                </div>
                <Link
                  href="/signup"
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-950 text-white font-bold text-xs transition-all hover:scale-105 active:scale-95"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          ZUVAPAY MOBILE APP SHOWCASE (SquareMe inspired)
         ========================================================================= */}
      <MobileAppShowcase />

      {/* =========================================================================
          CAMPUS & HUSTLER AMBASSADOR PROGRAM (SquareMe / Zojapay inspired)
         ========================================================================= */}
      <section id="ambassador" className="py-20 bg-[#0B0F17] text-white relative overflow-hidden border-t border-slate-800">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/30 text-zuva-amber text-xs font-bold">
                <span>🌟 ZuvaPay Ambassador Program</span>
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black font-display tracking-tight text-white leading-tight">
                Put your friends on the ZuvaPay train. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-zuva-solar via-zuva-amber to-amber-300">
                  Earn unlimited cash bonuses.
                </span>
              </h2>

              <p className="text-slate-400 text-sm leading-relaxed">
                Whether you are a university student at UNILAG, UI, UNIBEN, or a freelance agency operator in Lagos, earn recurring commissions on every SME data and utility purchase made by your network.
              </p>

              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-500/20 text-zuva-amber font-bold text-xs">
                    ✓
                  </div>
                  <p className="text-xs font-medium text-slate-200">
                    Instant cash payout directly to your bank account or NGN wallet
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-500/20 text-zuva-amber font-bold text-xs">
                    ✓
                  </div>
                  <p className="text-xs font-medium text-slate-200">
                    Exclusive wholesale reseller pricing tiers (as low as ₦235/GB)
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-500/20 text-zuva-amber font-bold text-xs">
                    ✓
                  </div>
                  <p className="text-xs font-medium text-slate-200">
                    Free official ZuvaPay merch + direct WhatsApp VIP support desk
                  </p>
                </div>
              </div>

              <div className="pt-3">
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-zuva-solar to-zuva-amber hover:from-amber-600 hover:to-orange-600 text-white font-black text-sm shadow-xl shadow-orange-500/25 transition-all hover:scale-105 active:scale-95"
                >
                  Join the Ambassador Crew
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </Link>
              </div>
            </div>

            {/* Right Interactive Tier Cards (01, 02, 03) */}
            <div className="lg:col-span-6 space-y-4">
              <div className="p-6 rounded-3xl bg-white/[0.04] border border-white/10 backdrop-blur-md flex items-start gap-4">
                <span className="font-mono text-3xl font-black text-zuva-solar">01</span>
                <div>
                  <h4 className="text-base font-bold text-white">Create Your Free @username</h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Sign up on ZuvaPay in 30 seconds and claim your unique handle (e.g. <span className="text-zuva-amber font-mono font-bold">@yourname</span>).
                  </p>
                </div>
              </div>

              <div className="p-6 rounded-3xl bg-white/[0.04] border border-white/10 backdrop-blur-md flex items-start gap-4">
                <span className="font-mono text-3xl font-black text-zuva-amber">02</span>
                <div>
                  <h4 className="text-base font-bold text-white">Share Your Link on Campus & WhatsApp</h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Your referral link gives your friends cheap ₦240 data and instant electricity tokens.
                  </p>
                </div>
              </div>

              <div className="p-6 rounded-3xl bg-white/[0.04] border border-white/10 backdrop-blur-md flex items-start gap-4">
                <span className="font-mono text-3xl font-black text-emerald-400">03</span>
                <div>
                  <h4 className="text-base font-bold text-white">Cash Out Whenever You Want</h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Commissions accumulate in real time. Transfer to your local Nigerian bank account 24/7.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          STRATEGIC & LICENSED PARTNERS (Banking, Telco, Energy, Compliance)
         ========================================================================= */}
      <StrategicPartners />

      {/* =========================================================================
          REAL STORIES: Human, Authentic Nigerian Feedback
         ========================================================================= */}
      <section className="py-24 bg-[#FDFDFC] border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-xs font-bold text-zuva-solar">
              <span>Real User Stories</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-slate-950 font-display">
              Why thousands of Nigerians refuse to use any other utility app.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Review 1 */}
            <div className="p-7 rounded-3xl border border-slate-200/80 bg-white shadow-sm hover:shadow-md transition-shadow space-y-4">
              <div className="flex items-center gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-xs text-slate-700 leading-relaxed italic">
                "As an agency owner running TikTok and Instagram campaigns for clients in Lagos, foreign SMS numbers used to be my biggest headache. With ZuvaPay, I get a US line, receive the OTP in 10 seconds, and if anything happens, my money returns to my wallet immediately."
              </p>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-900">Chukwudi Nwachukwu</p>
                  <p className="text-[10px] text-slate-500 font-medium">Digital Strategist, Lekki</p>
                </div>
                <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                  Verified User
                </span>
              </div>
            </div>

            {/* Review 2 */}
            <div className="p-7 rounded-3xl border border-slate-200/80 bg-white shadow-sm hover:shadow-md transition-shadow space-y-4">
              <div className="flex items-center gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-xs text-slate-700 leading-relaxed italic">
                "I buy data for almost 30 people every week for my church media group. MTN and Airtel SME bundles on ZuvaPay never fail. 2.5GB for ₦640 delivers before I even close the success screen. The speed is crazy."
              </p>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-900">Amina Bello</p>
                  <p className="text-[10px] text-slate-500 font-medium">Content Lead, Abuja</p>
                </div>
                <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                  Verified User
                </span>
              </div>
            </div>

            {/* Review 3 */}
            <div className="p-7 rounded-3xl border border-slate-200/80 bg-white shadow-sm hover:shadow-md transition-shadow space-y-4">
              <div className="flex items-center gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-xs text-slate-700 leading-relaxed italic">
                "Power went out at 1:40 AM and my meter was beeping. My bank app was showing 'system maintenance'. I funded my ZuvaPay wallet with ₦3,000, entered my IKEDC meter, and got my 20-digit token right there on screen. Saved my night."
              </p>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-900">Tunde Ogundipe</p>
                  <p className="text-[10px] text-slate-500 font-medium">Software Engineer, Ibadan</p>
                </div>
                <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                  Verified User
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          FEATURED ON: Leading Nigerian Press & Media (Placed down near footer)
         ========================================================================= */}
      <FeaturedOn />

      {/* =========================================================================
          FAQ SECTION: Direct Answers, No Technical Jargon
         ========================================================================= */}
      <section className="py-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8" id="faqs">
        <div className="text-center space-y-3 mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-xs font-bold text-zuva-solar">
            <span>Clear Answers</span>
          </div>
          <h2 className="text-3xl font-black text-slate-950 font-display">Frequently Asked Questions</h2>
        </div>

        <div className="space-y-4">
          {FAQS.map((faq, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden transition-colors"
            >
              <button
                onClick={() => toggleFaq(idx)}
                className="w-full flex items-center justify-between p-5 text-left text-sm font-bold text-slate-900 hover:text-zuva-solar transition-colors"
              >
                <span>{faq.q}</span>
                <ChevronRight
                  className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                    activeFaq === idx ? 'rotate-90 text-zuva-solar' : ''
                  }`}
                />
              </button>
              {activeFaq === idx && (
                <div className="px-5 pb-5 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3 animate-in fade-in">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* =========================================================================
          FINAL CTA BANNER: High-Conversion Closing Push (ZuvaPay Solar)
         ========================================================================= */}
      <section className="py-20 relative overflow-hidden bg-slate-50/50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="relative rounded-[32px] border border-orange-300/40 bg-gradient-to-br from-zuva-solar via-zuva-amber to-amber-500 p-10 md:p-14 text-center space-y-6 shadow-2xl shadow-orange-500/25 overflow-hidden text-white">
            {/* Glowing pattern inside banner */}
            <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-white/20 blur-[90px] pointer-events-none" />

            <div className="inline-flex items-center px-3.5 py-1.5 rounded-full bg-white/20 border border-white/30 text-white text-xs font-bold">
              Join 32,400+ Nigerians on ZuvaPay (ZuvaPay.com)
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white font-display">
              Ready to stop dealing with hanging transactions?
            </h2>

            <p className="text-sm text-orange-50 max-w-xl mx-auto leading-relaxed">
              Create your account in under 60 seconds and start enjoying instant SME data, 20-digit electricity tokens, and foreign numbers that never fail.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/signup"
                data-preserve-dark
                className="w-full sm:w-auto px-9 py-4 rounded-2xl !bg-[#0B0F17] hover:!bg-black !text-white font-black text-sm shadow-xl transition-all hover:scale-105 active:scale-95 text-center"
              >
                Create Account Now — ₦0 Setup Fee
              </Link>
              <Link
                href="/login"
                className="w-full sm:w-auto px-7 py-4 rounded-2xl border border-white/40 bg-white/10 hover:bg-white/20 text-white font-bold text-sm backdrop-blur-sm"
              >
                Sign In to Existing Account
              </Link>
            </div>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
