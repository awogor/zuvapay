'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { MarketingNavbar } from '@/components/marketing/MarketingNavbar';
import { MarketingFooter } from '@/components/marketing/MarketingFooter';
import {
  Wifi,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Zap,
  RefreshCw,
  Clock,
  ChevronDown,
  Sparkles,
} from 'lucide-react';

export function SmeDataPageView() {
  const [selectedNetwork, setSelectedNetwork] = useState<'mtn' | 'airtel' | 'glo' | '9mobile'>('mtn');
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const toggleFaq = (idx: number) => {
    setActiveFaq((prev) => (prev === idx ? null : idx));
  };

  const DATA_BUNDLES = {
    mtn: [
      { size: '500MB', price: '₦140', validity: '30 Days', type: 'SME' },
      { size: '1.0GB', price: '₦260', validity: '30 Days', type: 'SME' },
      { size: '2.0GB', price: '₦520', validity: '30 Days', type: 'SME' },
      { size: '3.0GB', price: '₦780', validity: '30 Days', type: 'SME' },
      { size: '5.0GB', price: '₦1,300', validity: '30 Days', type: 'SME' },
      { size: '10.0GB', price: '₦2,600', validity: '30 Days', type: 'Corporate' },
    ],
    airtel: [
      { size: '500MB', price: '₦150', validity: '30 Days', type: 'Gifting' },
      { size: '1.0GB', price: '₦280', validity: '30 Days', type: 'Gifting' },
      { size: '2.0GB', price: '₦560', validity: '30 Days', type: 'Gifting' },
      { size: '5.0GB', price: '₦1,400', validity: '30 Days', type: 'Gifting' },
      { size: '10.0GB', price: '₦2,800', validity: '30 Days', type: 'Corporate' },
      { size: '15.0GB', price: '₦4,200', validity: '30 Days', type: 'Corporate' },
    ],
    glo: [
      { size: '1.0GB', price: '₦250', validity: '30 Days', type: 'Corporate' },
      { size: '2.0GB', price: '₦500', validity: '30 Days', type: 'Corporate' },
      { size: '3.0GB', price: '₦750', validity: '30 Days', type: 'Corporate' },
      { size: '5.0GB', price: '₦1,250', validity: '30 Days', type: 'Corporate' },
      { size: '10.0GB', price: '₦2,500', validity: '30 Days', type: 'Corporate' },
    ],
    '9mobile': [
      { size: '1.0GB', price: '₦220', validity: '30 Days', type: 'SME' },
      { size: '2.0GB', price: '₦440', validity: '30 Days', type: 'SME' },
      { size: '3.0GB', price: '₦660', validity: '30 Days', type: 'SME' },
      { size: '5.0GB', price: '₦1,100', validity: '30 Days', type: 'SME' },
      { size: '10.0GB', price: '₦2,200', validity: '30 Days', type: 'SME' },
    ],
  };

  const FAQS = [
    {
      q: 'What is SME Data and how is it different from direct telco data?',
      a: 'SME Data is wholesale corporate bulk data allocated by Nigerian telecom operators (MTN, Airtel, Glo, 9mobile). It works exactly like regular data with full 4G/5G browsing and download speeds, but costs up to 60% less than direct telco retail pricing.',
    },
    {
      q: 'How long does it take for data to arrive after I purchase?',
      a: 'Our automated routing engine dispatches data bundles in an average of 1.2 seconds directly via telco API switches. You receive an instant carrier SMS confirmation as soon as it reflects on the line.',
    },
    {
      q: 'Do your data bundles expire quickly or roll over?',
      a: 'All our SME and Corporate Gifting bundles come with a full 30-day validity. If you recharge before your current 30-day window expires, any unused data balances roll over automatically.',
    },
    {
      q: 'Can I start my own VTU data reselling business with ZuvaPay?',
      a: 'Yes! Thousands of Nigerian students, freelancers, and businesses use ZuvaPay as their wholesale data provider. With 1GB starting from ₦240, you can sell to friends and clients at ₦300–₦350 and keep the profit margin.',
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
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Wholesale SME Data Rates from ₦240/GB • 1.2s Delivery
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-950 font-display max-w-4xl mx-auto leading-tight">
            High-Speed SME Data Subscriptions
          </h1>

          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Get instant SME, Corporate Gifting, and Direct Data bundles across MTN, Airtel, Glo, and 9mobile at rock-bottom prices. 30-day validity, automated data rollover, and instant refund guarantees.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              href="/signup"
              className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white font-bold text-sm shadow-lg shadow-sky-500/25 transition-all hover:scale-105"
            >
              Buy SME Data Now
            </Link>
            <Link
              href="#data-catalog"
              className="px-6 py-3.5 rounded-xl border border-slate-300 hover:border-slate-400 bg-white text-slate-800 font-bold text-sm transition-all"
            >
              View Data Plans
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="p-6 rounded-3xl border border-slate-200/80 bg-white shadow-sm hover:shadow-md transition-all space-y-3">
            <div className="p-3 rounded-2xl bg-sky-100 text-sky-700 w-fit">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">1.2s Delivery Speed</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Automated API routing sends data to your recipient line in under 2 seconds.
            </p>
          </div>

          <div className="p-6 rounded-3xl border border-slate-200/80 bg-white shadow-sm hover:shadow-md transition-all space-y-3">
            <div className="p-3 rounded-2xl bg-emerald-100 text-emerald-700 w-fit">
              <RefreshCw className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Automated Refund</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              If an operator fails or times out, 100% of your funds are credited back instantly.
            </p>
          </div>

          <div className="p-6 rounded-3xl border border-slate-200/80 bg-white shadow-sm hover:shadow-md transition-all space-y-3">
            <div className="p-3 rounded-2xl bg-purple-100 text-purple-700 w-fit">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">30-Day Validity</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Every data bundle comes with standard 30-day validity and rollover on recharge.
            </p>
          </div>

          <div className="p-6 rounded-3xl border border-slate-200/80 bg-white shadow-sm hover:shadow-md transition-all space-y-3">
            <div className="p-3 rounded-2xl bg-orange-100 text-zuva-solar w-fit">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Reseller Friendly</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Wholesale pricing from ₦240/GB empowers you to resell and profit on every transaction.
            </p>
          </div>
        </div>
      </section>

      {/* Interactive Pricing Catalog */}
      <section id="data-catalog" className="py-16 border-t border-slate-200/80 bg-slate-50/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-widest text-sky-600">
                Live Data Catalog
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-950 font-display">
                Wholesale SME Data Plans
              </h2>
              <p className="text-xs text-slate-600">
                Choose your network provider to explore transparent SME data bundles.
              </p>
            </div>

            {/* Network Switcher */}
            <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-200/80 border border-slate-300">
              {(['mtn', 'airtel', 'glo', '9mobile'] as const).map((net) => (
                <button
                  key={net}
                  onClick={() => setSelectedNetwork(net)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                    selectedNetwork === net
                      ? 'bg-sky-600 text-white shadow-md shadow-sky-500/20'
                      : 'text-slate-600 hover:text-slate-950'
                  }`}
                >
                  {net}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {DATA_BUNDLES[selectedNetwork].map((bundle, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl border border-slate-200/80 bg-white hover:border-sky-400 hover:shadow-lg transition-all text-center space-y-2 group"
              >
                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500">
                  <span className="uppercase">{selectedNetwork}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-bold">{bundle.type}</span>
                </div>
                <p className="font-mono text-2xl font-black text-slate-900 group-hover:text-sky-600 transition-colors">
                  {bundle.size}
                </p>
                <p className="font-mono text-base font-bold text-emerald-600">{bundle.price}</p>
                <p className="text-[10px] text-slate-500">{bundle.validity}</p>
                <Link
                  href="/signup"
                  className="w-full mt-2 inline-flex items-center justify-center py-2 rounded-xl bg-slate-100 hover:bg-slate-900 hover:text-white text-slate-800 text-[11px] font-bold transition-all"
                >
                  Buy Now
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
            Fast Fulfillment
          </span>
          <h2 className="text-3xl font-black text-slate-950 font-display">
            How to Buy SME Data in 3 Steps
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 rounded-3xl border border-slate-200/80 bg-white space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-700 font-black text-xl flex items-center justify-center mx-auto">
              1
            </div>
            <h3 className="text-lg font-bold text-slate-900">Fund Your Wallet</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Transfer funds to your dedicated ZuvaPay bank account. Balance updates in 1.2s.
            </p>
          </div>

          <div className="p-8 rounded-3xl border border-slate-200/80 bg-white space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 font-black text-xl flex items-center justify-center mx-auto">
              2
            </div>
            <h3 className="text-lg font-bold text-slate-900">Choose Network &amp; Plan</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Enter the recipient phone number and select the data bundle size (500MB to 50GB).
            </p>
          </div>

          <div className="p-8 rounded-3xl border border-slate-200/80 bg-white space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 font-black text-xl flex items-center justify-center mx-auto">
              3
            </div>
            <h3 className="text-lg font-bold text-slate-900">Data Delivered in 1.2s</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Confirm purchase. Data lands on the recipient device instantly with telco SMS confirmation.
            </p>
          </div>
        </div>
      </section>

      {/* FAQs Section */}
      <section className="py-20 border-t border-slate-200/80 bg-slate-50/70">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="text-center space-y-2 mb-10">
            <span className="text-xs font-bold uppercase tracking-widest text-sky-600">
              SME Data FAQs
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
                  className="w-full flex items-center justify-between p-5 text-left text-sm font-bold text-slate-900 hover:text-sky-600 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-200 text-slate-400 ${
                      activeFaq === idx ? 'rotate-180 text-sky-600' : ''
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
              Unbeatable Data Rates
            </span>
            <h3 className="text-2xl sm:text-4xl font-black font-display leading-tight">
              Ready to buy or resell high-speed SME data?
            </h3>
            <p className="text-xs sm:text-sm text-slate-400">
              Join thousands of Nigerian smartphone users enjoying wholesale data prices daily.
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
