'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { MarketingNavbar } from '@/components/marketing/MarketingNavbar';
import { MarketingFooter } from '@/components/marketing/MarketingFooter';
import {
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  RefreshCw,
  Clock,
  ChevronDown,
  Globe,
  Lock,
  Eye,
  EyeOff,
  Copy,
  Check,
  Building2,
  Sparkles,
} from 'lucide-react';

export function VirtualDollarCardPageView() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [showCardDetails, setShowCardDetails] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const toggleFaq = (idx: number) => {
    setActiveFaq((prev) => (prev === idx ? null : idx));
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const FAQS = [
    {
      q: 'Will this card work on Apple, Google, AWS, and Netflix?',
      a: 'Yes, 100%. ZuvaPay Virtual Dollar Cards are issued with an official US Delaware billing address and standard Address Verification System (AVS) compatibility, ensuring zero declines on Apple App Store, Google Play, Netflix, AWS, OpenAI ChatGPT Plus, Meta Ads, and Spotify.',
    },
    {
      q: 'How do I fund my virtual dollar card?',
      a: 'You fund your card directly from your ZuvaPay Naira (NGN) wallet balance. The currency conversion happens automatically in real time at transparent, competitive market FX rates with zero hidden markups.',
    },
    {
      q: 'Does the card support 3D Secure (3DS) for online checkout?',
      a: 'Yes. All online checkouts requiring two-factor authorization receive a real-time 3D Secure push OTP code directly in your ZuvaPay dashboard, allowing you to complete high-security purchases smoothly.',
    },
    {
      q: 'Can I freeze or block the card if needed?',
      a: 'Absolutely. You have 100% self-service control. You can freeze the card in one click to prevent recurring charges or unauthorized transactions, and unfreeze it whenever you are ready to spend again.',
    },
  ];

  const POPULAR_MERCHANTS = [
    { name: 'Apple Services', desc: 'iCloud+, App Store, Apple Music', category: 'Tech' },
    { name: 'OpenAI ChatGPT', desc: 'ChatGPT Plus, OpenAI API billing', category: 'AI' },
    { name: 'Amazon Web Services', desc: 'AWS cloud servers, compute, S3', category: 'Cloud' },
    { name: 'Netflix International', desc: 'Global subscriptions in USD', category: 'Streaming' },
    { name: 'Spotify Premium', desc: 'Individual and Family plans', category: 'Audio' },
    { name: 'Meta & Google Ads', desc: 'Facebook, Instagram & Google campaigns', category: 'Ads' },
    { name: 'Canva Pro & Adobe', desc: 'Creative design software subscriptions', category: 'Design' },
    { name: 'GitHub & Vercel', desc: 'Developer tool subscriptions & team seats', category: 'Dev' },
  ];

  return (
    <div className="min-h-screen bg-[#FBFBFE] text-slate-900 font-sans selection:bg-zuva-solar selection:text-white">
      <MarketingNavbar />

      {/* Hero Section */}
      <section className="pt-36 pb-20 border-b border-slate-200/80 bg-gradient-to-b from-amber-50/50 via-white to-[#FBFBFE] relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-56 bg-gradient-to-b from-amber-500/10 to-transparent blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white border border-amber-200 shadow-sm text-xs font-semibold text-amber-900">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Mastercard &amp; Visa • 100% Global Acceptance
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-950 font-display leading-tight">
                Spend Globally With Zero Declines
              </h1>

              <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Create dedicated USD virtual cards in seconds. Funded directly with your Naira balance at real-time market rates. Enjoy 3DS security and official US Delaware billing addresses for Apple, Netflix, AWS, and OpenAI.
              </p>

              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
                <Link
                  href="/signup"
                  className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-zuva-solar to-zuva-amber hover:from-orange-600 hover:to-amber-600 text-white font-bold text-sm shadow-lg shadow-orange-500/25 transition-all hover:scale-105"
                >
                  Create Dollar Card ($2 Fee)
                </Link>
                <Link
                  href="#merchants"
                  className="px-6 py-3.5 rounded-xl border border-slate-300 hover:border-slate-400 bg-white text-slate-800 font-bold text-sm transition-all"
                >
                  Supported Merchants
                </Link>
              </div>
            </div>

            {/* Interactive 3D Card Showcase */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="w-full max-w-sm">
                <div className="relative aspect-[1.586/1] rounded-[24px] p-6 text-white shadow-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950/80 border border-white/20 flex flex-col justify-between overflow-hidden">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/20 rounded-full blur-2xl pointer-events-none" />

                  <div className="flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-6 rounded-md bg-gradient-to-r from-amber-400 to-amber-200 shadow-inner flex items-center justify-center">
                        <div className="w-7 h-4 border border-slate-900/30 rounded-sm" />
                      </div>
                      <span className="text-[10px] font-mono tracking-widest text-slate-300 uppercase">Debit USD</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      Active
                    </span>
                  </div>

                  <div className="space-y-1 relative z-10">
                    <p className="text-[10px] uppercase font-mono tracking-widest text-slate-400">Card Number</p>
                    <div className="flex items-center justify-between">
                      <p className="font-mono text-lg tracking-[0.2em] font-black text-white">
                        {showCardDetails ? '5399 4182 9012 8921' : '5399 •••• •••• 8921'}
                      </p>
                      <button
                        onClick={() => setShowCardDetails(!showCardDetails)}
                        className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 transition-colors"
                      >
                        {showCardDetails ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-end justify-between relative z-10 pt-2 border-t border-white/10">
                    <div>
                      <p className="text-[9px] uppercase font-mono tracking-wider text-slate-400">Cardholder</p>
                      <p className="text-xs font-bold tracking-wider text-white">CHUKWUDI E. OKAFOR</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] uppercase font-mono tracking-wider text-slate-400">Expires</p>
                      <p className="font-mono text-xs font-bold text-white">08/29</p>
                    </div>
                    <div className="flex items-center -space-x-2">
                      <div className="w-6 h-6 rounded-full bg-red-500/90" />
                      <div className="w-6 h-6 rounded-full bg-amber-500/90" />
                    </div>
                  </div>
                </div>

                {/* Card perks ticker below */}
                <div className="mt-4 p-4 rounded-2xl border border-slate-200 bg-white/80 backdrop-blur-sm space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">Billing Country</span>
                    <span className="font-bold text-slate-900 flex items-center gap-1">
                      <span>🇺🇸</span> United States (AVS Verified)
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">3DS Verification</span>
                    <span className="font-bold text-emerald-600">Automated Push OTP</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">Naira Funding Rate</span>
                    <span className="font-mono font-bold text-slate-900">₦1,480 / $1</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="p-6 rounded-3xl border border-slate-200/80 bg-white shadow-sm hover:shadow-md transition-all space-y-3">
            <div className="p-3 rounded-2xl bg-amber-100 text-amber-700 w-fit">
              <Globe className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">100% Global Acceptance</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Issued with a genuine US Delaware billing address to pass strict AVS checks on international stores.
            </p>
          </div>

          <div className="p-6 rounded-3xl border border-slate-200/80 bg-white shadow-sm hover:shadow-md transition-all space-y-3">
            <div className="p-3 rounded-2xl bg-emerald-100 text-emerald-700 w-fit">
              <RefreshCw className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Direct Naira Funding</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Top up directly from your ZuvaPay Naira wallet. No need to look for black-market crypto or Bureau de Change.
            </p>
          </div>

          <div className="p-6 rounded-3xl border border-slate-200/80 bg-white shadow-sm hover:shadow-md transition-all space-y-3">
            <div className="p-3 rounded-2xl bg-sky-100 text-sky-700 w-fit">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">3D Secure Protection</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Receive one-time checkout codes in real time inside your dashboard for verified high-trust shopping.
            </p>
          </div>

          <div className="p-6 rounded-3xl border border-slate-200/80 bg-white shadow-sm hover:shadow-md transition-all space-y-3">
            <div className="p-3 rounded-2xl bg-purple-100 text-purple-700 w-fit">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Instant Card Freeze</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              One-click security freeze prevents unexpected recurring charges from international services.
            </p>
          </div>
        </div>
      </section>

      {/* Popular Supported Merchants */}
      <section id="merchants" className="py-16 border-t border-slate-200/80 bg-slate-50/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-2 mb-10 text-center md:text-left">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-700">
              Tested &amp; Verified
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-950 font-display">
              Works Across Every Major Global Platform
            </h2>
            <p className="text-xs text-slate-600 max-w-2xl">
              Pay for international software, cloud compute, media subscriptions, and global courses seamlessly.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {POPULAR_MERCHANTS.map((merchant, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl border border-slate-200/80 bg-white hover:border-amber-300 hover:shadow-md transition-all space-y-2"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-900">{merchant.name}</h4>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                    {merchant.category}
                  </span>
                </div>
                <p className="text-xs text-slate-500">{merchant.desc}</p>
                <p className="text-[11px] text-emerald-600 font-semibold pt-1">✓ 100% Zero-Decline Tested</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Billing Address Details Box */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-10 rounded-3xl border border-slate-200 bg-white shadow-sm space-y-6">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-zuva-solar">
              Official US Billing Credentials
            </span>
            <h3 className="text-2xl font-bold text-slate-950 font-display">
              Delaware Corporate Address for Maximum Acceptance
            </h3>
            <p className="text-xs text-slate-600 max-w-2xl">
              Merchants like Apple, Spotify, and AWS check your card address against the US Postal Service database. We provide an authentic Delaware commercial address with 0% state sales tax.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <p className="text-[10px] uppercase font-mono font-bold text-slate-400">Street Address</p>
              <p className="text-sm font-bold text-slate-900">1209 North Orange St, Suite 400</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <p className="text-[10px] uppercase font-mono font-bold text-slate-400">City, State &amp; Zip</p>
              <p className="text-sm font-bold text-slate-900">Wilmington, DE 19801</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <p className="text-[10px] uppercase font-mono font-bold text-slate-400">Country</p>
              <p className="text-sm font-bold text-slate-900">United States (USA)</p>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-200/80">
        <div className="text-center space-y-3 mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-700">
            Instant Issuance
          </span>
          <h2 className="text-3xl font-black text-slate-950 font-display">
            How to Get Your Virtual Dollar Card in 3 Steps
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 rounded-3xl border border-slate-200/80 bg-white space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 font-black text-xl flex items-center justify-center mx-auto">
              1
            </div>
            <h3 className="text-lg font-bold text-slate-900">Create Free Account</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Sign up in 30 seconds and fund your Naira wallet using your dedicated virtual account.
            </p>
          </div>

          <div className="p-8 rounded-3xl border border-slate-200/80 bg-white space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 font-black text-xl flex items-center justify-center mx-auto">
              2
            </div>
            <h3 className="text-lg font-bold text-slate-900">Instant Card Issuance</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Pay the one-time $2 creation fee and choose your starting USD balance ($5, $10, $25+).
            </p>
          </div>

          <div className="p-8 rounded-3xl border border-slate-200/80 bg-white space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 font-black text-xl flex items-center justify-center mx-auto">
              3
            </div>
            <h3 className="text-lg font-bold text-slate-900">Spend Anywhere</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Copy your 16-digit card number, CVV, and Delaware address to check out on any international site.
            </p>
          </div>
        </div>
      </section>

      {/* FAQs Section */}
      <section className="py-20 border-t border-slate-200/80 bg-slate-50/70">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="text-center space-y-2 mb-10">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-700">
              Card FAQs
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
                  className="w-full flex items-center justify-between p-5 text-left text-sm font-bold text-slate-900 hover:text-amber-700 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-200 text-slate-400 ${
                      activeFaq === idx ? 'rotate-180 text-amber-700' : ''
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
            <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
              Global Financial Freedom
            </span>
            <h3 className="text-2xl sm:text-4xl font-black font-display leading-tight">
              Ready to create your USD Virtual Card today?
            </h3>
            <p className="text-xs sm:text-sm text-slate-400">
              Say goodbye to card declines and arbitrary bank FX limits with ZuvaPay.
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
