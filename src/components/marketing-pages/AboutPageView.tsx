'use client';

import React from 'react';
import Link from 'next/link';
import { MarketingNavbar } from '@/components/marketing/MarketingNavbar';
import { MarketingFooter } from '@/components/marketing/MarketingFooter';
import {
  ArrowRight,
} from 'lucide-react';

export function AboutPageView() {
  return (
    <div className="min-h-screen bg-[#FBFBFE] text-slate-900 font-sans selection:bg-brand-orange selection:text-white">
      <MarketingNavbar />

      {/* Hero */}
      <section className="pt-32 pb-16 border-b border-slate-200/80 bg-gradient-to-b from-orange-50/40 via-white to-[#FDFDFC] relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-48 bg-gradient-to-b from-zuva-solar/10 to-transparent blur-[110px] pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-zuva-solar text-xs font-bold shadow-xs">
            <span className="w-2 h-2 rounded-full bg-zuva-solar animate-pulse" />
            <span>Our Story &amp; Mission</span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-slate-950 leading-[1.25] max-w-3xl mx-auto">
            Built by Nigerians who were tired of banking apps hanging when we needed them most.
          </h1>
          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            We started ZuvaPay with one clear rule: if an app is taking someone&apos;s hard-earned money in Nigeria, it must work on the first try — without excuses, without network lag, and without customer care stress.
          </p>
        </div>
      </section>

      {/* Origin Story */}
      <section className="py-16 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div className="space-y-3.5">
            <span className="text-xs font-bold uppercase tracking-wider text-zuva-solar">
              The Reality of Nigerian Payments
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-950 leading-snug">
              You shouldn&apos;t have to pray before buying electricity or recharging data.
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Every Nigerian knows that sinking feeling: you are in an emergency at 11:30 PM, your light goes out, you open your regular banking app to buy electricity, and it spends 3 minutes spinning — only to debit your account without generating the 20-digit token.
            </p>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Or you want to verify a WhatsApp business account for your client with a US number, and foreign card decline issues stop your work completely.
            </p>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              We engineered ZuvaPay from the ground up to solve these exact frustrations. We integrated directly with tier-1 telecom switches, electricity discos, and global carrier aggregators to make digital fulfillment instantaneous.
            </p>
          </div>

          <div className="p-6 sm:p-8 rounded-3xl border border-slate-200/80 bg-white shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              The ZuvaPay Promise:
            </h3>

            <div className="space-y-3 text-xs text-slate-700">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70">
                <p className="font-bold text-slate-900 mb-0.5">1. Atomic Refunds Over Waiting Games</p>
                <p className="text-slate-600 leading-relaxed">
                  If an operator fails to deliver your utility or airtime, our system instantly cancels the transaction and returns 100% of your funds to your wallet. You never have to ask &ldquo;where is my money?&rdquo;.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70">
                <p className="font-bold text-slate-900 mb-0.5">2. Zero Hidden Markups</p>
                <p className="text-slate-600 leading-relaxed">
                  What you see on the screen is exactly what leaves your balance. No arbitrary card maintenance fees or surprise charges.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70">
                <p className="font-bold text-slate-900 mb-0.5">3. Humans On Customer Support</p>
                <p className="text-slate-600 leading-relaxed">
                  When you message our WhatsApp helpline, you speak with a real human support specialist in Lagos who understands your issue and resolves it in minutes.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 border-t border-slate-200/80 bg-slate-50 text-center">
        <div className="max-w-2xl mx-auto px-4 space-y-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-950 tracking-tight">
            Experience the difference today.
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto">
            Join over 24,000 creators, freelancers, and businesses across Nigeria who trust ZuvaPay for zero-stress digital payments.
          </p>
          <div className="pt-2">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-zuva-solar to-zuva-amber hover:from-amber-600 hover:to-orange-600 text-white font-bold text-xs shadow-md shadow-orange-500/20 transition-all hover:scale-105 active:scale-95"
            >
              Create Your Account in 60 Seconds
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </Link>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
