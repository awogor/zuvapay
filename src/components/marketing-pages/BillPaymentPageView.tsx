'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { MarketingNavbar } from '@/components/marketing/MarketingNavbar';
import { MarketingFooter } from '@/components/marketing/MarketingFooter';
import {
  Smartphone,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Zap,
  RefreshCw,
  Clock,
  Sparkles,
  ChevronDown,
} from 'lucide-react';

export function BillPaymentPageView() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const toggleFaq = (idx: number) => {
    setActiveFaq((prev) => (prev === idx ? null : idx));
  };

  const FAQS = [
    {
      q: 'How fast does airtime and bill payment deliver?',
      a: 'Transactions are routed directly via Tier-1 telecom switches. Delivery takes an average of 1.2 seconds to reflect on your line after purchase.',
    },
    {
      q: 'What happens if a telco network is experiencing downtime?',
      a: 'We implement strict "Debit First, Fulfill Second" with automated rollbacks. If the telecom operator fails to acknowledge delivery within 5 seconds, your wallet is automatically and instantly refunded 100% of the debited amount.',
    },
    {
      q: 'Do you charge extra convenience fees for bill payments?',
      a: 'No! We charge ₦0 convenience fees on bill settlements and even offer up to 2% instant cashback discount on airtime top-ups.',
    },
    {
      q: 'Can I generate printable receipts for my accounting records?',
      a: 'Yes! Every completed transaction generates an immutable cryptographic receipt that you can print, download as PDF, or share via WhatsApp.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#FBFBFE] text-slate-900 font-sans selection:bg-zuva-solar selection:text-white">
      <MarketingNavbar />

      {/* Hero Section */}
      <section className="pt-36 pb-20 border-b border-slate-200/80 bg-gradient-to-b from-orange-50/50 via-white to-[#FBFBFE] relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-56 bg-gradient-to-b from-zuva-solar/10 to-transparent blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-5 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white border border-slate-200 shadow-sm text-xs font-semibold text-slate-700">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            2% Instant Cashback • Tier-1 Telecom Direct Route
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-950 font-display max-w-4xl mx-auto leading-tight">
            Airtime Top-Up &amp; Everyday Bill Payments
          </h1>

          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Recharge MTN, Airtel, Glo, and 9mobile lines with instant 2% cashback discount. Fast utility settlements, automated printable receipts, and 100% instant refund guarantee on any network timeout.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              href="/signup"
              className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-zuva-solar to-zuva-amber hover:from-orange-600 hover:to-amber-600 text-white font-bold text-sm shadow-lg shadow-orange-500/25 transition-all hover:scale-105"
            >
              Get Started with ₦0 Fee
            </Link>
            <Link
              href="#features"
              className="px-6 py-3.5 rounded-xl border border-slate-300 hover:border-slate-400 bg-white text-slate-800 font-bold text-sm transition-all"
            >
              Explore Features
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section id="features" className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="p-6 rounded-3xl border border-slate-200/80 bg-white shadow-sm hover:shadow-md transition-all space-y-3">
            <div className="p-3 rounded-2xl bg-orange-100 text-zuva-solar w-fit">
              <Smartphone className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">2% Instant Cashback</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Enjoy automated discount savings on every single VTU airtime recharge across all 4 major Nigerian carriers.
            </p>
          </div>

          <div className="p-6 rounded-3xl border border-slate-200/80 bg-white shadow-sm hover:shadow-md transition-all space-y-3">
            <div className="p-3 rounded-2xl bg-emerald-100 text-emerald-700 w-fit">
              <RefreshCw className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Automated Refund</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              If an operator fails or rejects delivery, your money is credited back into your wallet within 5 seconds.
            </p>
          </div>

          <div className="p-6 rounded-3xl border border-slate-200/80 bg-white shadow-sm hover:shadow-md transition-all space-y-3">
            <div className="p-3 rounded-2xl bg-sky-100 text-sky-700 w-fit">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">1.2s Delivery Speed</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Direct API integrations route recharges and bill settlements instantly without third-party delay.
            </p>
          </div>

          <div className="p-6 rounded-3xl border border-slate-200/80 bg-white shadow-sm hover:shadow-md transition-all space-y-3">
            <div className="p-3 rounded-2xl bg-purple-100 text-purple-700 w-fit">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">24/7 Availability</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Recharge in the middle of the night or on public holidays without fearing stuck transactions.
            </p>
          </div>
        </div>
      </section>

      {/* Network Coverage */}
      <section className="py-16 border-t border-slate-200/80 bg-slate-50/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-2 mb-10 text-center md:text-left">
            <span className="text-xs font-bold uppercase tracking-widest text-zuva-solar">
              Carrier Support
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-950 font-display">
              All Nigerian Mobile Networks Supported
            </h2>
            <p className="text-xs text-slate-600 max-w-2xl">
              Enjoy instant automated airtime top-up across MTN, Airtel, Glo, and 9mobile.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { name: 'MTN Nigeria', discount: '2.0% Cashback', tag: 'Fastest 4G/5G' },
              { name: 'Airtel Nigeria', discount: '2.0% Cashback', tag: 'High Uptime' },
              { name: 'Glo Mobile', discount: '2.0% Cashback', tag: 'Grandmasters of Data' },
              { name: '9mobile', discount: '2.0% Cashback', tag: 'Clear Voice' },
            ].map((net, idx) => (
              <div
                key={idx}
                className="p-6 rounded-3xl border border-slate-200/80 bg-white hover:border-zuva-solar/40 hover:shadow-md transition-all space-y-3"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-base font-bold text-slate-900">{net.name}</h4>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {net.discount}
                  </span>
                </div>
                <p className="text-xs text-slate-500">{net.tag}</p>
                <Link
                  href="/signup"
                  className="w-full inline-flex items-center justify-center py-2.5 rounded-xl bg-slate-100 hover:bg-slate-900 hover:text-white text-slate-800 text-xs font-bold transition-all"
                >
                  Recharge {net.name}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-3 mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-zuva-solar">
            Simple 3-Step Process
          </span>
          <h2 className="text-3xl font-black text-slate-950 font-display">
            How to Pay Bills in 30 Seconds
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 rounded-3xl border border-slate-200/80 bg-white space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-orange-100 text-zuva-solar font-black text-xl flex items-center justify-center mx-auto">
              1
            </div>
            <h3 className="text-lg font-bold text-slate-900">Create &amp; Fund Wallet</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Sign up in 30 seconds and fund your wallet via instant bank transfer using your personalized virtual account number.
            </p>
          </div>

          <div className="p-8 rounded-3xl border border-slate-200/80 bg-white space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-700 font-black text-xl flex items-center justify-center mx-auto">
              2
            </div>
            <h3 className="text-lg font-bold text-slate-900">Choose Network &amp; Amount</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Select MTN, Airtel, Glo, or 9mobile, type in the recipient phone number, and enter the airtime or bill amount.
            </p>
          </div>

          <div className="p-8 rounded-3xl border border-slate-200/80 bg-white space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 font-black text-xl flex items-center justify-center mx-auto">
              3
            </div>
            <h3 className="text-lg font-bold text-slate-900">Instant Delivery &amp; Cashback</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Hit confirm. Airtime is delivered in 1.2s and your 2% cashback discount applies automatically to your wallet balance.
            </p>
          </div>
        </div>
      </section>

      {/* FAQs Section */}
      <section className="py-20 border-t border-slate-200/80 bg-slate-50/70">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="text-center space-y-2 mb-10">
            <span className="text-xs font-bold uppercase tracking-widest text-zuva-solar">
              Bill Payment FAQs
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
                  className="w-full flex items-center justify-between p-5 text-left text-sm font-bold text-slate-900 hover:text-zuva-solar transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-200 text-slate-400 ${
                      activeFaq === idx ? 'rotate-180 text-zuva-solar' : ''
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
            <span className="text-xs font-bold uppercase tracking-widest text-zuva-amber">
              Start Saving Today
            </span>
            <h3 className="text-2xl sm:text-4xl font-black font-display leading-tight">
              Ready to recharge with zero delays and guaranteed refunds?
            </h3>
            <p className="text-xs sm:text-sm text-slate-400">
              Join thousands of Nigerians who rely on ZuvaPay daily for reliable telecom utilities.
            </p>
          </div>

          <div className="relative z-10 flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            <Link
              href="/signup"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-zuva-solar to-zuva-amber text-white font-bold text-sm text-center shadow-lg shadow-orange-500/25 transition-all hover:scale-105"
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
