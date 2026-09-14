'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { MarketingNavbar } from '@/components/marketing/MarketingNavbar';
import { MarketingFooter } from '@/components/marketing/MarketingFooter';
import {
  Tv,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  RefreshCw,
  Clock,
  ChevronDown,
  Sparkles,
  Zap,
} from 'lucide-react';

export function CableTvPageView() {
  const [selectedProvider, setSelectedProvider] = useState<'dstv' | 'gotv' | 'startimes'>('dstv');
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const toggleFaq = (idx: number) => {
    setActiveFaq((prev) => (prev === idx ? null : idx));
  };

  const BOUQUETS = {
    dstv: [
      { name: 'DStv Padi', price: '₦4,400', channels: '45+ Channels', desc: 'Entry-level news, local entertainment, and kids channels' },
      { name: 'DStv Yanga', price: '₦6,000', channels: '85+ Channels', desc: 'Family entertainment, movies, Africa Magic, and music' },
      { name: 'DStv Confam', price: '₦11,000', channels: '105+ Channels', desc: 'Expanded sports, international drama, and documentaries' },
      { name: 'DStv Compact', price: '₦19,000', channels: '130+ Channels', desc: 'Premier League live, blockbusters, and premier kids TV' },
      { name: 'DStv Compact Plus', price: '₦30,000', channels: '145+ Channels', desc: 'Champions League, UFC, motorsport, and premium series' },
      { name: 'DStv Premium', price: '₦44,000', channels: '160+ Channels', desc: 'Complete sports, VIP movie channels, and Showmax access' },
    ],
    gotv: [
      { name: 'GOtv Smallie', price: '₦1,900', channels: '35+ Channels', desc: 'Budget-friendly local news, religious, and entertainment' },
      { name: 'GOtv Jinja', price: '₦3,900', channels: '45+ Channels', desc: 'Local movies, music, cartoons, and Africa Magic Epic' },
      { name: 'GOtv Jolli', price: '₦5,800', channels: '65+ Channels', desc: 'Expanded family drama, WWE, action, and lifestyle' },
      { name: 'GOtv Max', price: '₦8,500', channels: '75+ Channels', desc: 'La Liga, Serie A, Hollywood blockbusters, and kids TV' },
      { name: 'GOtv Supa', price: '₦11,400', channels: '80+ Channels', desc: 'Exclusive telenovelas, kids channels, and lifestyle' },
      { name: 'GOtv Supa+', price: '₦16,800', channels: '85+ Channels', desc: 'Premier League coverage and premium family entertainment' },
    ],
    startimes: [
      { name: 'StarTimes Nova', price: '₦1,900', channels: '30+ Channels', desc: 'Essential local news, music, and general entertainment' },
      { name: 'StarTimes Basic', price: '₦3,700', channels: '40+ Channels', desc: 'Kids programming, local drama, and documentaries' },
      { name: 'StarTimes Smart', price: '₦5,100', channels: '55+ Channels', desc: 'Sports, movies, telenovelas, and premium documentaries' },
      { name: 'StarTimes Classic', price: '₦6,500', channels: '70+ Channels', desc: 'Expanded international news, drama, and live football' },
      { name: 'StarTimes Super', price: '₦9,000', channels: '85+ Channels', desc: 'Full sports suite, European leagues, and premier cinema' },
    ],
  };

  const FAQS = [
    {
      q: 'How fast does my TV signal reconnect after payment?',
      a: 'In 98% of cases, your decoder reconnects within 60 seconds of successful transaction. Make sure your decoder is powered ON on a normal channel (e.g., Channel 100 on DStv or Channel 1 on GOtv) when paying.',
    },
    {
      q: 'How do I know I am paying for the right Smartcard or IUC number?',
      a: 'ZuvaPay queries MultiChoice and StarTimes APIs in real time. Once you type in your Smartcard/IUC number, we instantly fetch and display the registered account owner name, current bouquet, and expiration date.',
    },
    {
      q: 'Can I change or upgrade my bouquet during renewal?',
      a: 'Yes! You can choose any bouquet from the list. If you choose an upgraded package, the new bouquet activates immediately.',
    },
    {
      q: 'What should I do if my decoder still shows an error code (E16) after paying?',
      a: 'Keep your decoder ON. You can use the MultiChoice self-service SMS code or contact our 24/7 in-app support desk, and our team will trigger an instant signal reset for your smartcard.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#FBFBFE] text-slate-900 font-sans selection:bg-zuva-solar selection:text-white">
      <MarketingNavbar />

      {/* Hero Section */}
      <section className="pt-36 pb-20 border-b border-slate-200/80 bg-gradient-to-b from-sky-50/50 via-white to-[#FBFBFE] relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-56 bg-gradient-to-b from-sky-500/10 to-transparent blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-5 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white border border-sky-200 shadow-sm text-xs font-semibold text-sky-800">
            <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse" />
            Live Smartcard Pre-Validation • 60-Second Auto Reconnection
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-950 font-display max-w-4xl mx-auto leading-tight">
            Renew DStv, GOtv &amp; StarTimes With Zero Interruption
          </h1>

          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Never miss a live Premier League match or your favorite telenovela. Pre-validate subscriber names, switch bouquets seamlessly, and restore decoder signals in under 60 seconds.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              href="/signup"
              className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white font-bold text-sm shadow-lg shadow-sky-500/25 transition-all hover:scale-105"
            >
              Renew Subscription Now
            </Link>
            <Link
              href="#bouquets"
              className="px-6 py-3.5 rounded-xl border border-slate-300 hover:border-slate-400 bg-white text-slate-800 font-bold text-sm transition-all"
            >
              Compare Bouquets
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="p-6 rounded-3xl border border-slate-200/80 bg-white shadow-sm hover:shadow-md transition-all space-y-3">
            <div className="p-3 rounded-2xl bg-sky-100 text-sky-700 w-fit">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">60s Reconnection</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Automated API calls transmit payment confirmation directly to MultiChoice and StarTimes.
            </p>
          </div>

          <div className="p-6 rounded-3xl border border-slate-200/80 bg-white shadow-sm hover:shadow-md transition-all space-y-3">
            <div className="p-3 rounded-2xl bg-emerald-100 text-emerald-700 w-fit">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Name Pre-Validation</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              We check the registered owner name on the IUC/Smartcard to eliminate wrong-number payments.
            </p>
          </div>

          <div className="p-6 rounded-3xl border border-slate-200/80 bg-white shadow-sm hover:shadow-md transition-all space-y-3">
            <div className="p-3 rounded-2xl bg-purple-100 text-purple-700 w-fit">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Upgrade / Downgrade</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Easily move between Compact, Confam, Max, or Supa+ bouquets with live pro-rated billing.
            </p>
          </div>

          <div className="p-6 rounded-3xl border border-slate-200/80 bg-white shadow-sm hover:shadow-md transition-all space-y-3">
            <div className="p-3 rounded-2xl bg-orange-100 text-zuva-solar w-fit">
              <RefreshCw className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Instant Refund Guarantee</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              If an activation request times out, 100% of your funds are returned to your wallet immediately.
            </p>
          </div>
        </div>
      </section>

      {/* Bouquets Catalog */}
      <section id="bouquets" className="py-16 border-t border-slate-200/80 bg-slate-50/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-widest text-sky-600">
                Official MultiChoice &amp; StarTimes Packages
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-950 font-display">
                Bouquet Options &amp; Channel Guides
              </h2>
              <p className="text-xs text-slate-600">
                Select your cable television provider to view available monthly packages.
              </p>
            </div>

            {/* Provider Switcher */}
            <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-200/80 border border-slate-300">
              {(['dstv', 'gotv', 'startimes'] as const).map((prov) => (
                <button
                  key={prov}
                  onClick={() => setSelectedProvider(prov)}
                  className={`px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                    selectedProvider === prov
                      ? 'bg-slate-900 text-white shadow-md'
                      : 'text-slate-600 hover:text-slate-950'
                  }`}
                >
                  {prov}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {BOUQUETS[selectedProvider].map((bouquet, idx) => (
              <div
                key={idx}
                className="p-6 rounded-3xl border border-slate-200/80 bg-white hover:border-sky-300 hover:shadow-lg transition-all space-y-3 group"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-bold text-slate-900 group-hover:text-sky-600 transition-colors">
                    {bouquet.name}
                  </h4>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200">
                    {bouquet.channels}
                  </span>
                </div>
                <p className="font-mono text-2xl font-black text-slate-950">{bouquet.price}</p>
                <p className="text-xs text-slate-500 leading-relaxed">{bouquet.desc}</p>
                <Link
                  href="/signup"
                  className="w-full mt-4 inline-flex items-center justify-center py-2.5 rounded-xl bg-slate-100 hover:bg-slate-900 hover:text-white text-slate-800 text-xs font-bold transition-all"
                >
                  Renew {bouquet.name}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-3 mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-sky-600">
            Automated Reconnection
          </span>
          <h2 className="text-3xl font-black text-slate-950 font-display">
            How to Renew Cable TV in 3 Steps
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 rounded-3xl border border-slate-200/80 bg-white space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-700 font-black text-xl flex items-center justify-center mx-auto">
              1
            </div>
            <h3 className="text-lg font-bold text-slate-900">Select Provider &amp; Plan</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Choose DStv, GOtv, or StarTimes and select your desired monthly package from the catalog.
            </p>
          </div>

          <div className="p-8 rounded-3xl border border-slate-200/80 bg-white space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 font-black text-xl flex items-center justify-center mx-auto">
              2
            </div>
            <h3 className="text-lg font-bold text-slate-900">Verify IUC / Smartcard</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Type in your 10-digit number. We instantly display your subscriber name and current expiry date.
            </p>
          </div>

          <div className="p-8 rounded-3xl border border-slate-200/80 bg-white space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 font-black text-xl flex items-center justify-center mx-auto">
              3
            </div>
            <h3 className="text-lg font-bold text-slate-900">Signal Restored in 60s</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Pay with your funded wallet. MultiChoice or StarTimes automatically clears the error code on your decoder.
            </p>
          </div>
        </div>
      </section>

      {/* FAQs Section */}
      <section className="py-20 border-t border-slate-200/80 bg-slate-50/70">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="text-center space-y-2 mb-10">
            <span className="text-xs font-bold uppercase tracking-widest text-sky-600">
              Cable TV FAQs
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
                  className="w-full flex items-center justify-between p-5 text-left text-sm font-bold text-slate-900 hover:text-sky-700 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-200 text-slate-400 ${
                      activeFaq === idx ? 'rotate-180 text-sky-700' : ''
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
            <span className="text-xs font-bold uppercase tracking-widest text-sky-400">
              Never Miss A Moment
            </span>
            <h3 className="text-2xl sm:text-4xl font-black font-display leading-tight">
              Ready to renew your cable decoder with instant activation?
            </h3>
            <p className="text-xs sm:text-sm text-slate-400">
              Join thousands of Nigerian entertainment lovers who rely on ZuvaPay for seamless cable renewals.
            </p>
          </div>

          <div className="relative z-10 flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            <Link
              href="/signup"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 text-white font-bold text-sm text-center shadow-lg shadow-sky-500/25 transition-all hover:scale-105"
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
