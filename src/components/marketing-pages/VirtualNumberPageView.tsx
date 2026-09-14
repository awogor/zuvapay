'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { MarketingNavbar } from '@/components/marketing/MarketingNavbar';
import { MarketingFooter } from '@/components/marketing/MarketingFooter';
import {
  MessageSquareCode,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  RefreshCw,
  Clock,
  ChevronDown,
  Globe,
  Sparkles,
  Lock,
} from 'lucide-react';

export function VirtualNumberPageView() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const toggleFaq = (idx: number) => {
    setActiveFaq((prev) => (prev === idx ? null : idx));
  };

  const POPULAR_COUNTRIES = [
    { name: 'United States', code: '+1', flag: '🇺🇸', price: 'From ₦750', popularFor: 'WhatsApp, OpenAI, Telegram, Google' },
    { name: 'United Kingdom', code: '+44', flag: '🇬🇧', price: 'From ₦850', popularFor: 'PayPal, WhatsApp Business, Stripe' },
    { name: 'Canada', code: '+1', flag: '🇨🇦', price: 'From ₦800', popularFor: 'Shopify, Google Workspace, OpenAI' },
    { name: 'Kenya', code: '+254', flag: '🇰🇪', price: 'From ₦550', popularFor: 'TikTok Creator, WhatsApp, M-Pesa' },
    { name: 'Germany', code: '+49', flag: '🇩🇪', price: 'From ₦900', popularFor: 'European FinTechs, Telegram, Amazon' },
    { name: 'France', code: '+33', flag: '🇫🇷', price: 'From ₦950', popularFor: 'Claude AI, WhatsApp, Discord' },
    { name: 'India', code: '+91', flag: '🇮🇳', price: 'From ₦600', popularFor: 'Freelancing Platforms, Truecaller' },
    { name: 'South Africa', code: '+27', flag: '🇿🇦', price: 'From ₦700', popularFor: 'Regional Apps, Uber, WhatsApp' },
  ];

  const FAQS = [
    {
      q: 'Are these real cellular lines or cheap VoIP numbers that get rejected?',
      a: 'ZuvaPay routes non-VoIP physical SIM lines directly from Tier-1 mobile carriers in each country (such as AT&T and T-Mobile in the US, Vodafone and EE in the UK). Because they are genuine mobile carrier numbers, platforms like WhatsApp, OpenAI, and Telegram accept them without restriction.',
    },
    {
      q: 'What happens if the service verification code does not arrive?',
      a: 'We operate on a 100% automated refund guarantee. When you rent a virtual phone number, you get a dedicated 15-minute live reception window. If no verification code is received within that window, your wallet is automatically and fully refunded to the last Kobo.',
    },
    {
      q: 'Can anyone else receive messages sent to my rented number?',
      a: 'No. During your active rental session, that phone number is private and allocated exclusively to your user account. Once your session ends or completes, the number is retired.',
    },
    {
      q: 'How many countries are supported?',
      a: 'ZuvaPay supports virtual phone numbers across more than 150 countries worldwide including the US, UK, Canada, Kenya, Germany, France, Netherlands, India, and South Africa.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#FBFBFE] text-slate-900 font-sans selection:bg-zuva-solar selection:text-white">
      <MarketingNavbar />

      {/* Hero Section */}
      <section className="pt-36 pb-20 border-b border-slate-200/80 bg-gradient-to-b from-purple-50/50 via-white to-[#FBFBFE] relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-56 bg-gradient-to-b from-purple-500/10 to-transparent blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-5 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white border border-purple-200 shadow-sm text-xs font-semibold text-purple-800">
            <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
            150+ Countries • Non-VoIP Physical Carrier SIMs
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-950 font-display max-w-4xl mx-auto leading-tight">
            Virtual Phone Numbers for Global Verification
          </h1>

          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Rent real non-VoIP temporary foreign phone numbers from the US, UK, Canada, and 150+ countries. Dedicated 15-minute reception window with 100% automated refund guarantee if no code arrives.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              href="/signup"
              className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-sm shadow-lg shadow-purple-500/25 transition-all hover:scale-105"
            >
              Get Virtual Phone Number
            </Link>
            <Link
              href="#countries"
              className="px-6 py-3.5 rounded-xl border border-slate-300 hover:border-slate-400 bg-white text-slate-800 font-bold text-sm transition-all"
            >
              Browse 150+ Countries
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="p-6 rounded-3xl border border-slate-200/80 bg-white shadow-sm hover:shadow-md transition-all space-y-3">
            <div className="p-3 rounded-2xl bg-purple-100 text-purple-700 w-fit">
              <Globe className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">150+ Countries</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Rent numbers from the United States, United Kingdom, Canada, Kenya, Europe, and Asia.
            </p>
          </div>

          <div className="p-6 rounded-3xl border border-slate-200/80 bg-white shadow-sm hover:shadow-md transition-all space-y-3">
            <div className="p-3 rounded-2xl bg-emerald-100 text-emerald-700 w-fit">
              <RefreshCw className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Automated Full Refund</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              If the code does not arrive within the 15-minute window, you are refunded 100% automatically.
            </p>
          </div>

          <div className="p-6 rounded-3xl border border-slate-200/80 bg-white shadow-sm hover:shadow-md transition-all space-y-3">
            <div className="p-3 rounded-2xl bg-sky-100 text-sky-700 w-fit">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Real Non-VoIP Lines</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Direct carrier lines that pass strict fraud prevention checks on WhatsApp, Google, and OpenAI.
            </p>
          </div>

          <div className="p-6 rounded-3xl border border-slate-200/80 bg-white shadow-sm hover:shadow-md transition-all space-y-3">
            <div className="p-3 rounded-2xl bg-orange-100 text-zuva-solar w-fit">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Live 15-Min Window</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Real-time message polling displays your verification code on screen the split-second it arrives.
            </p>
          </div>
        </div>
      </section>

      {/* Popular Countries Catalog */}
      <section id="countries" className="py-16 border-t border-slate-200/80 bg-slate-50/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-2 mb-10 text-center md:text-left">
            <span className="text-xs font-bold uppercase tracking-widest text-purple-600">
              Worldwide Carrier Selection
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-950 font-display">
              Popular Virtual Phone Number Destinations
            </h2>
            <p className="text-xs text-slate-600 max-w-2xl">
              Select a country to rent a dedicated foreign phone line for instant application verification.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {POPULAR_COUNTRIES.map((country, idx) => (
              <div
                key={idx}
                className="p-6 rounded-3xl border border-slate-200/80 bg-white hover:border-purple-300 hover:shadow-md transition-all space-y-3 group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-3xl">{country.flag}</span>
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                    {country.code}
                  </span>
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900 group-hover:text-purple-600 transition-colors">
                    {country.name}
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">{country.popularFor}</p>
                </div>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-purple-700">{country.price}</span>
                  <Link
                    href="/signup"
                    className="text-xs font-bold text-slate-900 hover:text-purple-600 inline-flex items-center gap-1"
                  >
                    <span>Rent Line</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-3 mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-purple-600">
            Frictionless Verification
          </span>
          <h2 className="text-3xl font-black text-slate-950 font-display">
            How to Use Your Virtual Number in 3 Steps
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 rounded-3xl border border-slate-200/80 bg-white space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 font-black text-xl flex items-center justify-center mx-auto">
              1
            </div>
            <h3 className="text-lg font-bold text-slate-900">Choose Country &amp; App</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Select your destination country (e.g., US or UK) and the platform you want to verify (WhatsApp, OpenAI, Telegram, etc.).
            </p>
          </div>

          <div className="p-8 rounded-3xl border border-slate-200/80 bg-white space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 font-black text-xl flex items-center justify-center mx-auto">
              2
            </div>
            <h3 className="text-lg font-bold text-slate-900">Enter Number in App</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Copy your assigned private foreign phone number and paste it into the application or website.
            </p>
          </div>

          <div className="p-8 rounded-3xl border border-slate-200/80 bg-white space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 font-black text-xl flex items-center justify-center mx-auto">
              3
            </div>
            <h3 className="text-lg font-bold text-slate-900">Instant Code Display</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Watch the live dashboard. The verification code displays on screen automatically within seconds.
            </p>
          </div>
        </div>
      </section>

      {/* FAQs Section */}
      <section className="py-20 border-t border-slate-200/80 bg-slate-50/70">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="text-center space-y-2 mb-10">
            <span className="text-xs font-bold uppercase tracking-widest text-purple-600">
              Virtual Number FAQs
            </span>
            <h2 className="text-3xl font-black text-slate-950 font-display">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-slate-200/80 bg-white overflow-hidden transition-all"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full flex items-center justify-between p-5 text-left text-sm font-bold text-slate-900 hover:text-purple-700 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-200 text-slate-400 ${
                      activeFaq === idx ? 'rotate-180 text-purple-700' : ''
                    }`}
                  />
                </button>
                {activeFaq === idx && (
                  <div className="px-5 pb-5 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* High-impact CTA banner */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-10 md:p-14 rounded-[32px] bg-[#0A0D14] text-white relative overflow-hidden shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-xl relative z-10 text-center md:text-left">
            <span className="text-xs font-bold uppercase tracking-widest text-purple-400">
              Global Reach
            </span>
            <h3 className="text-2xl sm:text-4xl font-black font-display leading-tight">
              Ready to verify your international accounts with zero hassle?
            </h3>
            <p className="text-xs sm:text-sm text-slate-400">
              Get dedicated non-VoIP carrier numbers backed by our automated full refund guarantee.
            </p>
          </div>

          <div className="relative z-10 flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            <Link
              href="/signup"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-sm text-center shadow-lg shadow-purple-500/25 transition-all hover:scale-105"
            >
              Open Free Account
            </Link>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
