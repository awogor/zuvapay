'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { MarketingNavbar } from '@/components/marketing/MarketingNavbar';
import { MarketingFooter } from '@/components/marketing/MarketingFooter';
import {
  Zap,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  RefreshCw,
  Clock,
  ChevronDown,
  Building2,
  FileText,
  Smartphone,
} from 'lucide-react';

export function ElectricityPageView() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const toggleFaq = (idx: number) => {
    setActiveFaq((prev) => (prev === idx ? null : idx));
  };

  const DISCOS = [
    { name: 'Ikeja Electric (IKEDC)', coverage: 'Lagos Mainland, Ikeja, Agege, Ikorodu', tag: 'Instant Token' },
    { name: 'Eko Electric (EKEDC)', coverage: 'Lagos Island, Victoria Island, Lekki, Ajah, Festac', tag: 'Instant Token' },
    { name: 'Abuja Electric (AEDC)', coverage: 'FCT Abuja, Nasarawa, Niger, Kogi', tag: 'Instant Token' },
    { name: 'Ibadan Electric (IBEDC)', coverage: 'Oyo, Ogun, Osun, Kwara, parts of Ekiti', tag: 'Instant Token' },
    { name: 'Kano Electric (KEDCO)', coverage: 'Kano, Katsina, Jigawa', tag: 'Instant Token' },
    { name: 'Enugu Electric (EEDC)', coverage: 'Enugu, Anambra, Imo, Abia, Ebonyi', tag: 'Instant Token' },
    { name: 'Port Harcourt (PHED)', coverage: 'Rivers, Bayelsa, Cross River, Akwa Ibom', tag: 'Instant Token' },
    { name: 'Benin Electric (BEDC)', coverage: 'Edo, Delta, Ondo, Ekiti', tag: 'Instant Token' },
    { name: 'Kaduna Electric (KAEDCO)', coverage: 'Kaduna, Kebbi, Sokoto, Zamfara', tag: 'Instant Token' },
    { name: 'Jos Electric (JED)', coverage: 'Plateau, Bauchi, Benue, Gombe', tag: 'Instant Token' },
  ];

  const FAQS = [
    {
      q: 'Do you charge a ₦100 or ₦200 convenience fee for electricity tokens?',
      a: 'No! Unlike traditional banking apps that charge convenience fees on power recharges, ZuvaPay offers 100% ₦0 convenience fee. If you buy ₦5,000 electricity, the exact ₦5,000 is credited directly to your Disco meter.',
    },
    {
      q: 'How do I know my meter number is correct before paying?',
      a: 'ZuvaPay includes real-time Disco API pre-validation. The moment you enter your meter number, we query the power distribution company and display your registered customer name and meter address so you never recharge the wrong meter.',
    },
    {
      q: 'How fast do I receive the 20-digit token?',
      a: 'Your 20-digit token is generated in under 1.5 seconds. It is displayed on your screen instantly, sent via SMS to your phone, and backed up in your transaction receipt history.',
    },
    {
      q: 'What should I do if my prepaid meter rejects the token?',
      a: 'Make sure your meter is plugged into a live electrical socket and you have keyed in all 20 digits accurately without pausing longer than 10 seconds. If your Disco requires a Key Revision Number (KRN) token reset, our 24/7 support team assists immediately.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#FBFBFE] text-slate-900 font-sans selection:bg-zuva-solar selection:text-white">
      <MarketingNavbar />

      {/* Hero Section */}
      <section className="pt-36 pb-20 border-b border-slate-200/80 bg-gradient-to-b from-teal-50/50 via-white to-[#FBFBFE] relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-56 bg-gradient-to-b from-teal-500/10 to-transparent blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-5 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white border border-teal-200 shadow-sm text-xs font-semibold text-teal-800">
            <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
            0% Convenience Fee • Instant 20-Digit Token Generation
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-950 font-display max-w-4xl mx-auto leading-tight">
            Pay Prepaid &amp; Postpaid Electricity With ₦0 Extra Fee
          </h1>

          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Generate your 20-digit prepaid electricity tokens in 1.5 seconds across IKEDC, EKEDC, AEDC, IBEDC, and all major Nigerian Discos with instant customer name pre-validation.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              href="/signup"
              className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-bold text-sm shadow-lg shadow-teal-500/25 transition-all hover:scale-105"
            >
              Pay Electricity Bill Now
            </Link>
            <Link
              href="#discos"
              className="px-6 py-3.5 rounded-xl border border-slate-300 hover:border-slate-400 bg-white text-slate-800 font-bold text-sm transition-all"
            >
              Check Supported Discos
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="p-6 rounded-3xl border border-slate-200/80 bg-white shadow-sm hover:shadow-md transition-all space-y-3">
            <div className="p-3 rounded-2xl bg-teal-100 text-teal-700 w-fit">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Zero Convenience Fee</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              We never charge the ₦100 or ₦200 convenience fee seen on standard banking apps.
            </p>
          </div>

          <div className="p-6 rounded-3xl border border-slate-200/80 bg-white shadow-sm hover:shadow-md transition-all space-y-3">
            <div className="p-3 rounded-2xl bg-emerald-100 text-emerald-700 w-fit">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Meter Pre-Validation</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Customer name and registered address are verified before any debit takes place.
            </p>
          </div>

          <div className="p-6 rounded-3xl border border-slate-200/80 bg-white shadow-sm hover:shadow-md transition-all space-y-3">
            <div className="p-3 rounded-2xl bg-orange-100 text-zuva-solar w-fit">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Printable Receipts</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Download clean PDF receipts showing token units, tariff rate, VAT, and meter details.
            </p>
          </div>

          <div className="p-6 rounded-3xl border border-slate-200/80 bg-white shadow-sm hover:shadow-md transition-all space-y-3">
            <div className="p-3 rounded-2xl bg-purple-100 text-purple-700 w-fit">
              <Smartphone className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Instant SMS Backup</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Your 20-digit token is dispatched instantly via SMS directly to your mobile phone.
            </p>
          </div>
        </div>
      </section>

      {/* Supported Discos Catalog */}
      <section id="discos" className="py-16 border-t border-slate-200/80 bg-slate-50/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-2 mb-10 text-center md:text-left">
            <span className="text-xs font-bold uppercase tracking-widest text-teal-600">
              National Grid Coverage
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-950 font-display">
              Supported Electricity Distribution Companies
            </h2>
            <p className="text-xs text-slate-600 max-w-2xl">
              All Nigerian prepaid and postpaid electricity discos are fully integrated for real-time token dispatch.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {DISCOS.map((disco, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl border border-slate-200/80 bg-white hover:border-teal-300 hover:shadow-md transition-all space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-teal-600" />
                    <h4 className="text-sm font-bold text-slate-900">{disco.name}</h4>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
                    {disco.tag}
                  </span>
                </div>
                <p className="text-xs text-slate-500">{disco.coverage}</p>
                <p className="text-[11px] text-emerald-600 font-semibold pt-1">
                  ✓ Prepaid (Meter Token) &amp; Postpaid Supported
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-3 mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-teal-600">
            Frictionless Token Generation
          </span>
          <h2 className="text-3xl font-black text-slate-950 font-display">
            How to Buy Electricity in 3 Steps
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 rounded-3xl border border-slate-200/80 bg-white space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-700 font-black text-xl flex items-center justify-center mx-auto">
              1
            </div>
            <h3 className="text-lg font-bold text-slate-900">Select Disco &amp; Meter Type</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Pick your power provider (IKEDC, EKEDC, AEDC, etc.) and choose Prepaid or Postpaid.
            </p>
          </div>

          <div className="p-8 rounded-3xl border border-slate-200/80 bg-white space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 font-black text-xl flex items-center justify-center mx-auto">
              2
            </div>
            <h3 className="text-lg font-bold text-slate-900">Verify Customer Name</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Enter your meter number. We automatically query the Disco and confirm the meter owner name before debit.
            </p>
          </div>

          <div className="p-8 rounded-3xl border border-slate-200/80 bg-white space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-orange-100 text-zuva-solar font-black text-xl flex items-center justify-center mx-auto">
              3
            </div>
            <h3 className="text-lg font-bold text-slate-900">Instant 20-Digit Token</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Pay with your funded wallet. Your 20-digit token appears on screen instantly with full unit breakdown.
            </p>
          </div>
        </div>
      </section>

      {/* FAQs Section */}
      <section className="py-20 border-t border-slate-200/80 bg-slate-50/70">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="text-center space-y-2 mb-10">
            <span className="text-xs font-bold uppercase tracking-widest text-teal-600">
              Electricity FAQs
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
                  className="w-full flex items-center justify-between p-5 text-left text-sm font-bold text-slate-900 hover:text-teal-700 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-200 text-slate-400 ${
                      activeFaq === idx ? 'rotate-180 text-teal-700' : ''
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
            <span className="text-xs font-bold uppercase tracking-widest text-teal-400">
              Keep The Power On
            </span>
            <h3 className="text-2xl sm:text-4xl font-black font-display leading-tight">
              Ready to buy electricity tokens with zero convenience fee?
            </h3>
            <p className="text-xs sm:text-sm text-slate-400">
              Join thousands of Nigerian homes and businesses that generate tokens with ZuvaPay 24/7.
            </p>
          </div>

          <div className="relative z-10 flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            <Link
              href="/signup"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-bold text-sm text-center shadow-lg shadow-teal-500/25 transition-all hover:scale-105"
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
