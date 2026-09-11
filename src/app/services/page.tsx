'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { MarketingNavbar } from '@/components/marketing/MarketingNavbar';
import { MarketingFooter } from '@/components/marketing/MarketingFooter';
import {
  Smartphone,
  MessageSquareCode,
  Zap,
  TrendingUp,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Sparkles,
  RefreshCw,
  ShoppingBag,
} from 'lucide-react';

export default function ServicesPage() {
  const [selectedNetwork, setSelectedNetwork] = useState<'mtn' | 'airtel' | 'glo' | '9mobile'>('mtn');

  const DATA_BUNDLES = {
    mtn: [
      { size: '500MB', price: '₦140', validity: '30 Days' },
      { size: '1.0GB', price: '₦260', validity: '30 Days' },
      { size: '2.0GB', price: '₦520', validity: '30 Days' },
      { size: '3.0GB', price: '₦780', validity: '30 Days' },
      { size: '5.0GB', price: '₦1,300', validity: '30 Days' },
      { size: '10.0GB', price: '₦2,600', validity: '30 Days' },
    ],
    airtel: [
      { size: '500MB', price: '₦150', validity: '30 Days' },
      { size: '1.0GB', price: '₦280', validity: '30 Days' },
      { size: '2.0GB', price: '₦560', validity: '30 Days' },
      { size: '5.0GB', price: '₦1,400', validity: '30 Days' },
    ],
    glo: [
      { size: '1.0GB', price: '₦250', validity: '30 Days' },
      { size: '2.0GB', price: '₦500', validity: '30 Days' },
      { size: '3.0GB', price: '₦750', validity: '30 Days' },
      { size: '5.0GB', price: '₦1,250', validity: '30 Days' },
    ],
    '9mobile': [
      { size: '1.0GB', price: '₦220', validity: '30 Days' },
      { size: '2.0GB', price: '₦440', validity: '30 Days' },
      { size: '5.0GB', price: '₦1,100', validity: '30 Days' },
    ],
  };

  return (
    <div className="min-h-screen bg-[#FBFBFE] text-slate-900 font-sans selection:bg-brand-orange selection:text-white">
      <MarketingNavbar />

      {/* Header Banner */}
      <section className="pt-36 pb-16 border-b border-slate-200/80 bg-gradient-to-b from-orange-50/50 via-white to-[#FBFBFE] relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-56 bg-gradient-to-b from-brand-orange/10 to-transparent blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white border border-slate-200 shadow-sm text-xs font-semibold text-slate-700">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Transparent Nigerian Pricing Catalog
          </div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-950 font-display">
            Every Service. Live Delivery Speeds. Zero Hidden Charges.
          </h1>
          <p className="text-sm text-slate-600 max-w-2xl mx-auto">
            Explore our real-time rates for Nigerian SME data bundles, electricity meters, foreign SMS verification lines, and digital creator growth.
          </p>
        </div>
      </section>

      {/* 1. Airtime & Data Section */}
      <section id="data" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-brand-orange">
              Telco Connectivity
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-950 font-display">
              Airtime & SME Data Bundles
            </h2>
            <p className="text-xs text-slate-600">
              Direct API tie-ins with Nigerian telecoms. 100% automated refund if operator times out.
            </p>
          </div>

          {/* Network Switcher */}
          <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-100 border border-slate-200">
            {(['mtn', 'airtel', 'glo', '9mobile'] as const).map((net) => (
              <button
                key={net}
                onClick={() => setSelectedNetwork(net)}
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                  selectedNetwork === net
                    ? 'bg-brand-orange text-white shadow-md shadow-orange-500/20'
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
              className="p-5 rounded-2xl border border-slate-200/80 bg-white hover:border-brand-orange/40 hover:shadow-lg transition-all text-center space-y-2 group"
            >
              <span className="text-[11px] font-semibold text-slate-500 uppercase">
                {selectedNetwork}
              </span>
              <p className="font-mono text-2xl font-black text-slate-900 group-hover:text-brand-orange transition-colors">
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
      </section>

      {/* 2. Virtual SMS Numbers Section */}
      <section id="sms" className="py-20 border-t border-slate-200/80 bg-slate-50/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-2 mb-10 text-center md:text-left">
            <span className="text-xs font-bold uppercase tracking-widest text-purple-600">
              Foreign Identity & Verification
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-950 font-display">
              Virtual SMS Phone Numbers (OTPs)
            </h2>
            <p className="text-xs text-slate-600 max-w-2xl">
              15-minute dedicated window for receiving OTP codes. No monthly commitments. If the verification code doesn't arrive, you are not charged 1 Kobo.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="p-6 rounded-3xl border border-slate-200/80 bg-white shadow-sm hover:shadow-md transition-shadow space-y-4">
              <div className="text-3xl">🇺🇸</div>
              <h4 className="text-base font-bold text-slate-900">United States Lines</h4>
              <p className="text-xs text-slate-600">
                Works seamlessly for WhatsApp, Telegram, OpenAI ChatGPT, and Google.
              </p>
              <p className="font-mono text-xl font-bold text-purple-700">From ₦750 / line</p>
              <Link
                href="/signup"
                className="w-full inline-flex items-center justify-center py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition-colors shadow-md shadow-purple-500/20"
              >
                Rent US Line
              </Link>
            </div>

            <div className="p-6 rounded-3xl border border-slate-200/80 bg-white shadow-sm hover:shadow-md transition-shadow space-y-4">
              <div className="text-3xl">🇬🇧</div>
              <h4 className="text-base font-bold text-slate-900">United Kingdom Lines</h4>
              <p className="text-xs text-slate-600">
                Ideal for UK WhatsApp business accounts, PayPal, and European apps.
              </p>
              <p className="font-mono text-xl font-bold text-purple-700">From ₦850 / line</p>
              <Link
                href="/signup"
                className="w-full inline-flex items-center justify-center py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition-colors shadow-md shadow-purple-500/20"
              >
                Rent UK Line
              </Link>
            </div>

            <div className="p-6 rounded-3xl border border-slate-200/80 bg-white shadow-sm hover:shadow-md transition-shadow space-y-4">
              <div className="text-3xl">🇰🇪</div>
              <h4 className="text-base font-bold text-slate-900">Kenya & African Lines</h4>
              <p className="text-xs text-slate-600">
                High deliverability for regional WhatsApp setups, TikTok creator accounts.
              </p>
              <p className="font-mono text-xl font-bold text-purple-700">From ₦550 / line</p>
              <Link
                href="/signup"
                className="w-full inline-flex items-center justify-center py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition-colors shadow-md shadow-purple-500/20"
              >
                Rent Kenya Line
              </Link>
            </div>

            <div className="p-6 rounded-3xl border border-slate-200/80 bg-white shadow-sm hover:shadow-md transition-shadow space-y-4">
              <div className="text-3xl">🌐</div>
              <h4 className="text-base font-bold text-slate-900">150+ Other Countries</h4>
              <p className="text-xs text-slate-600">
                Canada, Germany, France, India, Ghana, South Africa & more.
              </p>
              <p className="font-mono text-xl font-bold text-purple-700">Live Carrier Rates</p>
              <Link
                href="/signup"
                className="w-full inline-flex items-center justify-center py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold text-xs transition-colors"
              >
                Explore All Countries
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Electricity & Utilities */}
      <section id="power" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-2 mb-10 text-center md:text-left">
          <span className="text-xs font-bold uppercase tracking-widest text-teal-600">
            Utility Discos
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-950 font-display">
            Prepaid Meter Electricity Tokens
          </h2>
          <p className="text-xs text-slate-600">
            Zero convenience fee. Pre-validation ensures your meter number and customer name are confirmed before debit.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { name: 'Ikeja Electric (IKEDC)', coverage: 'Lagos Mainland & Ikeja' },
            { name: 'Eko Electric (EKEDC)', coverage: 'Lagos Island, Lekki & Ajah' },
            { name: 'Abuja Electric (AEDC)', coverage: 'FCT Abuja, Nasarawa, Niger' },
            { name: 'Kano Electric (KEDCO)', coverage: 'Kano, Katsina, Jigawa' },
            { name: 'Enugu Electric (EEDC)', coverage: 'Enugu, Anambra, Imo, Abia' },
            { name: 'Port Harcourt (PHED)', coverage: 'Rivers, Bayelsa, Cross River' },
            { name: 'Ibadan Electric (IBEDC)', coverage: 'Oyo, Ogun, Osun, Kwara' },
            { name: 'Benin Electric (BEDC)', coverage: 'Edo, Delta, Ondo, Ekiti' },
          ].map((disco, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl border border-slate-200/80 bg-white hover:border-teal-300 hover:shadow-md transition-all space-y-2"
            >
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-teal-600" />
                <h4 className="text-xs font-bold text-slate-900">{disco.name}</h4>
              </div>
              <p className="text-[11px] text-slate-500">{disco.coverage}</p>
              <p className="text-[10px] text-emerald-600 font-semibold">● Instant Token Generation</p>
            </div>
          ))}
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
