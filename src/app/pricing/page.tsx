'use client';

import React from 'react';
import Link from 'next/link';
import { MarketingNavbar } from '@/components/marketing/MarketingNavbar';
import { MarketingFooter } from '@/components/marketing/MarketingFooter';
import {
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#FBFBFE] text-slate-900 font-sans selection:bg-brand-orange selection:text-white">
      <MarketingNavbar />

      {/* Hero Header */}
      <section className="pt-36 pb-16 border-b border-slate-200/80 bg-gradient-to-b from-orange-50/50 via-white to-[#FBFBFE] relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-56 bg-gradient-to-b from-brand-orange/10 to-transparent blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white border border-slate-200 shadow-sm text-xs font-semibold text-slate-700">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            100% Transparent Fee Structure
          </div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-950 font-display">
            Wholesale Rates for Everyone. No Hidden Markups.
          </h1>
          <p className="text-sm text-slate-600 max-w-2xl mx-auto">
            Whether you are buying 1GB for personal use or running a digital agency with hundreds of orders every day, here is exactly what you pay.
          </p>
        </div>
      </section>

      {/* Pricing Comparison Grid */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {/* Tier 1: Personal & Casual */}
          <div className="p-8 rounded-3xl border border-slate-200/80 bg-white shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Personal & Everyday Use
              </span>
              <h3 className="text-2xl font-black text-slate-950 font-display">Regular User</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Perfect for students, individuals, and families looking for dependable data, instant meter tokens, and cable recharge without banking downtime.
              </p>
              <div className="pt-4 border-t border-slate-100">
                <span className="font-mono text-3xl font-black text-slate-950">₦0</span>
                <span className="text-xs text-slate-500"> / forever free</span>
              </div>
              <ul className="space-y-2.5 text-xs text-slate-700 pt-4 border-t border-slate-100 font-medium">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  MTN & Airtel SME data from ₦240/GB
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  0% Convenience fee on Electricity Tokens
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  2% Cashback discount on Airtime recharges
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Dedicated Moniepoint / Wema account
                </li>
              </ul>
            </div>

            <Link
              href="/signup"
              className="w-full py-3.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-900 font-bold text-xs text-center transition-colors"
            >
              Get Started Free
            </Link>
          </div>

          {/* Tier 2: Creators & Digital Hustlers (Featured) */}
          <div className="p-8 rounded-3xl border-2 border-zuva-solar bg-white shadow-2xl shadow-orange-500/10 relative flex flex-col justify-between space-y-6">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-zuva-solar to-zuva-amber text-white font-black text-[11px] uppercase tracking-wider shadow-lg shadow-orange-500/30">
              Most Popular
            </div>

            <div className="space-y-4 pt-2">
              <span className="text-xs font-bold uppercase tracking-wider text-zuva-solar">
                Creators & Growth Marketers
              </span>
              <h3 className="text-2xl font-black text-slate-950 font-display">Hustler & Creator</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                For freelancers, media marketers, and developers who need foreign phone numbers, aged accounts, and social visibility tools.
              </p>
              <div className="pt-4 border-t border-slate-100">
                <span className="font-mono text-3xl font-black text-slate-950">Pay As You Go</span>
                <span className="text-xs text-slate-500"> (No subscription fees)</span>
              </div>
              <ul className="space-y-2.5 text-xs text-slate-800 pt-4 border-t border-slate-100 font-medium">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-zuva-solar" />
                  US, UK, Kenya OTP phone lines from ₦750
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-zuva-solar" />
                  Automatic full refund if no SMS arrives in 15m
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-zuva-solar" />
                  Dual NGN & USD wallet with real-time conversion
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-zuva-solar" />
                  Aged social logs with 2FA + Windows RDP access
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-zuva-solar" />
                  Non-drop YouTube & TikTok boost starting at ₦450
                </li>
              </ul>
            </div>

            <Link
              href="/signup"
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-zuva-solar to-zuva-amber hover:from-amber-600 hover:to-orange-600 text-white font-black text-sm text-center shadow-xl shadow-orange-500/25 transition-all"
            >
              Sign Up Now — Zero Setup Fee
            </Link>
          </div>

          {/* Tier 3: Resellers & Agencies */}
          <div className="p-8 rounded-3xl border border-slate-200/80 bg-white shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Resellers & Developers
              </span>
              <h3 className="text-2xl font-black text-slate-950 font-display">Business & Agency</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                For merchants reselling data, corporate bulk airtime, and enterprises requiring dedicated support and high volume.
              </p>
              <div className="pt-4 border-t border-slate-100">
                <span className="font-mono text-3xl font-black text-slate-950">Wholesale</span>
                <span className="text-xs text-slate-500"> / Volume Margins</span>
              </div>
              <ul className="space-y-2.5 text-xs text-slate-700 pt-4 border-t border-slate-100 font-medium">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Lowest wholesale data pricing tiers
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Direct Priority WhatsApp Account Manager
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Dedicated Virtual Account with high volume transaction limits
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Bulk CSV transaction export for bookkeeping
                </li>
              </ul>
            </div>

            <Link
              href="https://wa.me/2348000000000?text=Hello%20ZuvaPay%20I%20want%20to%20inquire%20about%20Business%20Wholesale%20tier"
              target="_blank"
              className="w-full py-3.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-900 font-bold text-xs text-center transition-colors"
            >
              Contact Sales on WhatsApp
            </Link>
          </div>
        </div>
      </section>

      {/* Safety & Fee Policy Guarantee */}
      <section className="py-16 border-t border-slate-200/80 bg-slate-50/70">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-4">
          <ShieldCheck className="w-10 h-10 text-zuva-emerald mx-auto" />
          <h3 className="text-2xl font-bold text-slate-950 font-display">
            The ZuvaPay "No-Downtime, No-Loss" Guarantee
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Unlike other platforms where failed requests leave your money stuck for weeks, our system reverses failed transactions atomically back into your wallet balance in under 5 seconds. If a service does not deliver, you do not pay.
          </p>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
