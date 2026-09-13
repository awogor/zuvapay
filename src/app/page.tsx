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
} from 'lucide-react';

export default function HomePage() {
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
      q: 'How do I fund my wallet without card fraud or chargebacks?',
      a: 'Once you register, ZuvaPay generates a dedicated Nigerian virtual account in your name. Any transfer sent to this account credits your wallet balance immediately for checkout — even at 2 AM.',
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
          HERO SECTION: High-Energy, Bold Typography, ZuvaPay Solar Theme
         ========================================================================= */}
      <section className="relative pt-32 pb-20 md:pt-44 md:pb-28 overflow-hidden bg-gradient-to-b from-orange-50/30 via-white to-[#FDFDFC]">
        {/* Soft Ambient Background Solar Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[720px] h-[450px] bg-gradient-to-tr from-zuva-solar/10 via-amber-200/20 to-emerald-200/10 blur-[130px] pointer-events-none" />
        <div className="absolute top-1/3 -left-40 w-96 h-96 bg-amber-100/30 blur-[100px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Copy Area */}
            <div className="lg:col-span-7 space-y-7 text-center lg:text-left">
              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-[64px] font-black tracking-tight text-slate-950 leading-[1.08] font-display">
                Automate your bill payments{' '}
                <br className="hidden sm:inline" />
                with a{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-zuva-solar via-zuva-amber to-amber-500">
                  dedicated virtual account.
                </span>
              </h1>

              {/* Subheadline */}
              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Get a permanent Nigerian virtual account to power all your everyday utility bills. Instant wholesale SME data, prepaid power tokens, and foreign OTP numbers — funded in seconds with zero downtime.
              </p>

              {/* CTA Group */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  href="/signup"
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-zuva-solar to-zuva-amber hover:from-amber-600 hover:to-orange-600 text-white font-black text-sm shadow-xl shadow-orange-500/25 transition-all hover:scale-105 active:scale-95"
                >
                  Create Free Account (₦0)
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </Link>

                <Link
                  href="#services"
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-4 rounded-2xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-900 font-bold text-sm shadow-sm transition-all active:scale-95"
                >
                  Explore Services & Rates
                </Link>
              </div>
            </div>

            {/* Right Interactive Simulator */}
            <div className="lg:col-span-5" id="speed">
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
              <h3 className="text-xl font-bold text-slate-900 mt-5">Instant Wallet Top-Up</h3>
              <p className="text-xs text-slate-600 leading-relaxed mt-2.5">
                Top up your bill payment wallet 24/7 with dedicated automated virtual account numbers. Funds reflect in under 2 seconds to pay bills without card decline issues.
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
            {/* Service 1: Cheap Data */}
            <div className="p-6 rounded-3xl border border-slate-200/80 bg-slate-50/50 hover:bg-white hover:shadow-xl hover:border-slate-300 transition-all space-y-4">
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-2xl bg-orange-100 text-brand-orange">
                  <Smartphone className="w-6 h-6" />
                </div>
                <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                  From ₦240
                </span>
              </div>
              <div>
                <h4 className="text-lg font-bold text-slate-900">Instant Airtime & SME Data</h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Direct automated telco routing for MTN SME, Airtel Gifting, Glo Corporate, and 9mobile. Top up yourself or customers in 2 seconds.
                </p>
              </div>
              <ul className="text-[11px] text-slate-700 space-y-1.5 pt-2 border-t border-slate-200/60">
                <li className="flex items-center gap-2 font-medium">✓ 2% cashback discount on airtime</li>
                <li className="flex items-center gap-2 font-medium">✓ Instant 30-day data rollover</li>
              </ul>
            </div>

            {/* Service 2: Virtual SMS */}
            <div className="p-6 rounded-3xl border border-slate-200/80 bg-slate-50/50 hover:bg-white hover:shadow-xl hover:border-slate-300 transition-all space-y-4">
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-2xl bg-purple-100 text-purple-700">
                  <MessageSquareCode className="w-6 h-6" />
                </div>
                <span className="text-xs font-mono font-bold text-purple-700 bg-purple-50 border border-purple-200 px-2.5 py-1 rounded-full">
                  15-Min Live
                </span>
              </div>
              <div>
                <h4 className="text-lg font-bold text-slate-900">Foreign SMS / OTP Verification</h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Rent real non-VoIP temporary phone numbers from 150+ countries. Zero charge if no code is received within 15 minutes.
                </p>
              </div>
              <ul className="text-[11px] text-slate-700 space-y-1.5 pt-2 border-t border-slate-200/60">
                <li className="flex items-center gap-2 font-medium">✓ WhatsApp, OpenAI, Telegram & Google</li>
                <li className="flex items-center gap-2 font-medium">✓ Automated full wallet refund on timeout</li>
              </ul>
            </div>

            {/* Service 3: Power & Cable TV */}
            <div className="p-6 rounded-3xl border border-slate-200/80 bg-slate-50/50 hover:bg-white hover:shadow-xl hover:border-slate-300 transition-all space-y-4">
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-2xl bg-teal-100 text-teal-700">
                  <Zap className="w-6 h-6" />
                </div>
                <span className="text-xs font-mono font-bold text-teal-700 bg-teal-50 border border-teal-200 px-2.5 py-1 rounded-full">
                  0% Token Fee
                </span>
              </div>
              <div>
                <h4 className="text-lg font-bold text-slate-900">Electricity & Cable TV</h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Instant 20-digit token generation for IKEDC, EKEDC, AEDC, IBEDC, plus instant bouquet recharge for DSTV, GOtv, and StarTimes.
                </p>
              </div>
              <ul className="text-[11px] text-slate-700 space-y-1.5 pt-2 border-t border-slate-200/60">
                <li className="flex items-center gap-2 font-medium">✓ Pre-validation of customer meter name</li>
                <li className="flex items-center gap-2 font-medium">✓ Printable token receipts & SMS delivery</li>
              </ul>
            </div>

            {/* Service 4: Social Growth */}
            <div className="p-6 rounded-3xl border border-slate-200/80 bg-slate-50/50 hover:bg-white hover:shadow-xl hover:border-slate-300 transition-all space-y-4">
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-2xl bg-rose-100 text-rose-700">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <span className="text-xs font-mono font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-full">
                  Non-Drop
                </span>
              </div>
              <div>
                <h4 className="text-lg font-bold text-slate-900">Social Media Boost</h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Real engagement, views, and followers for YouTube, TikTok, Instagram, Twitter, Facebook, and Telegram. Fast start within 60 minutes.
                </p>
              </div>
              <ul className="text-[11px] text-slate-700 space-y-1.5 pt-2 border-t border-slate-200/60">
                <li className="flex items-center gap-2 font-medium">✓ 30-day refill guarantee on drop</li>
                <li className="flex items-center gap-2 font-medium">✓ Custom comments from real profiles</li>
              </ul>
            </div>

            {/* Service 5: Verified Logs */}
            <div className="p-6 rounded-3xl border border-slate-200/80 bg-slate-50/50 hover:bg-white hover:shadow-xl hover:border-slate-300 transition-all space-y-4">
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-2xl bg-sky-100 text-sky-700">
                  <ShoppingBag className="w-6 h-6" />
                </div>
                <span className="text-xs font-mono font-bold text-sky-700 bg-sky-50 border border-sky-200 px-2.5 py-1 rounded-full">
                  Instant Delivery
                </span>
              </div>
              <div>
                <h4 className="text-lg font-bold text-slate-900">Aged Social Logs & Dev Tools</h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Aged 2FA Facebook accounts, Instagram profiles, NordVPN subscriptions, and Windows RDP instances delivered immediately upon purchase.
                </p>
              </div>
              <ul className="text-[11px] text-slate-700 space-y-1.5 pt-2 border-t border-slate-200/60">
                <li className="flex items-center gap-2 font-medium">✓ Full credentials + 2FA recovery secret</li>
                <li className="flex items-center gap-2 font-medium">✓ Automated warranty replacement</li>
              </ul>
            </div>

            {/* Service 6: Dedicated Virtual Accounts */}
            <div className="p-6 rounded-3xl border border-slate-200/80 bg-slate-50/50 hover:bg-white hover:shadow-xl hover:border-slate-300 transition-all space-y-4">
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-2xl bg-amber-100 text-amber-700">
                  <Lock className="w-6 h-6" />
                </div>
                <span className="text-xs font-mono font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
                  Instant
                </span>
              </div>
              <div>
                <h4 className="text-lg font-bold text-slate-900">Dedicated Virtual Payment Accounts</h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Receive an automated 10-digit dedicated virtual account in your name. Instant wallet funding for bill checkouts 24/7.
                </p>
              </div>
              <ul className="text-[11px] text-slate-700 space-y-1.5 pt-2 border-t border-slate-200/60">
                <li className="flex items-center gap-2 font-medium">✓ Zero account maintenance charges</li>
                <li className="flex items-center gap-2 font-medium">✓ Protected by 4-digit security PIN</li>
              </ul>
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
                "As an agency owner running TikTok and Instagram campaigns for clients in Lagos, foreign SMS numbers used to be my biggest headache. With KorrectPay, I get a US line, receive the OTP in 10 seconds, and if anything happens, my money returns to my wallet immediately."
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
                "I buy data for almost 30 people every week for my church media group. MTN and Airtel SME bundles on KorrectPay never fail. 2.5GB for ₦640 delivers before I even close the success screen. The speed is crazy."
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
                "Power went out at 1:40 AM and my meter was beeping. My bank app was showing 'system maintenance'. I funded my ZuvaPay virtual account with ₦3,000, entered my IKEDC meter, and got my 20-digit token right there on screen. Saved my night."
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
              Create your account in under 60 seconds. Get your dedicated virtual account number instantly and start enjoying payments that never fail.
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
