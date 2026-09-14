'use client';

import React from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Zap,
  Lock,
  MessageCircle,
  ExternalLink,
  Smartphone,
  CreditCard,
  Building2,
  HeartHandshake,
} from 'lucide-react';

export function MarketingFooter() {
  return (
    <footer className="relative bg-[#0B0F17] text-slate-400 border-t border-slate-800/80 overflow-hidden">
      {/* Subtle solar flare background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-orange-500/5 blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
          {/* Col 1: Brand & Nigerian Trust */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-zuva-solar via-zuva-amber to-zuva-gold font-black text-lg text-slate-950 shadow-md shadow-orange-500/20">
                ZP
              </div>
              <span className="font-extrabold text-2xl tracking-tight text-white font-display">
                Zuva<span className="text-transparent bg-clip-text bg-gradient-to-r from-zuva-solar to-zuva-amber">Pay</span>
              </span>
            </Link>

            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              The high-velocity digital platform for Nigerian bill payments and global transactions. Cheap SME data, instant airtime, electricity tokens, virtual phone numbers, and virtual dollar cards.
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Instant Automated Delivery
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[11px] font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                256-Bit SSL Encrypted
              </span>
            </div>
          </div>

          {/* Col 2: Services */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Utilities &amp; Services
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/services/bill-payment" className="hover:text-white transition-colors">
                  Bill Payments (Airtime &amp; Utilities)
                </Link>
              </li>
              <li>
                <Link href="/services/sme-data" className="hover:text-white transition-colors">
                  SME Data Subscription (From ₦240/GB)
                </Link>
              </li>
              <li>
                <Link href="/services/electricity" className="hover:text-white transition-colors">
                  Electricity Payment (Prepaid Tokens)
                </Link>
              </li>
              <li>
                <Link href="/services/cable-tv" className="hover:text-white transition-colors">
                  Cable TV Subscription (DStv, GOtv)
                </Link>
              </li>
              <li>
                <Link href="/services/virtual-number" className="hover:text-white transition-colors">
                  Virtual Phone Number (150+ Countries)
                </Link>
              </li>
              <li>
                <Link href="/services/virtual-dollar-card" className="hover:text-white transition-colors">
                  Virtual Dollar Card (Mastercard &amp; Visa)
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Company & Trust */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Why ZuvaPay
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  Our Story & Mission
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-white transition-colors">
                  Live Pricing & Margins
                </Link>
              </li>
              <li>
                <Link href="/agent" className="text-amber-400 hover:text-amber-300 font-semibold transition-colors flex items-center gap-1">
                  <span>Become an Agent</span>
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/30">REQUEST</span>
                </Link>
              </li>
              <li>
                <span className="text-slate-300">Automatic Wallet Refunds</span>
              </li>
              <li>
                <span className="text-slate-300">Dual Currency (NGN & USD)</span>
              </li>
              <li>
                <span className="text-slate-300">4-Digit Security PIN</span>
              </li>
            </ul>
          </div>

          {/* Col 4: Support & Contact */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Direct Support
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link
                  href="https://wa.me/2349038416331?text=Hello%20ZuvaPay%20Customer%20Desk"
                  target="_blank"
                  className="flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 font-semibold"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  Instant WhatsApp Help
                </Link>
              </li>
              <li className="text-slate-400">
                Email: <span className="text-slate-200">hello@zuvapay.com</span>
              </li>
              <li className="text-slate-400">
                Operating Hub: <span className="text-slate-300">Victoria Island, Lagos, Nigeria</span>
              </li>
              <li className="pt-1">
                <span className="inline-block text-[11px] text-amber-400 font-medium">
                  ⚡ Average response time: under 3 minutes
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Legal Disclaimers */}
        <div className="pt-8 pb-6 border-b border-slate-800/80 space-y-3 text-[11px] leading-relaxed text-slate-400">
          <p>
            ZuvaPay (ZuvaPay.com) is an automated bill payment and digital services platform operated by ZuvaPay Technologies Limited in Nigeria.
          </p>
          <p>
            ZuvaPay is a technology aggregator, not a bank or telecommunication operator. Bill payment processing, telecommunication airtime, SME data bundles, electricity meter tokens, and digital subscription services are provisioned and fulfilled by licensed third-party partners and regulated carriers.
          </p>
          <div className="flex flex-wrap items-center gap-4 pt-1 text-slate-300 font-medium">
            <Link href="/privacy" className="hover:text-white transition-colors underline decoration-slate-600 underline-offset-4">
              NDPC Privacy Policy
            </Link>
            <span>•</span>
            <Link href="/terms" className="hover:text-white transition-colors underline decoration-slate-600 underline-offset-4">
              Terms &amp; Conditions
            </Link>
            <span>•</span>
            <Link href="/agent" className="hover:text-white transition-colors underline decoration-slate-600 underline-offset-4">
              Become an Agent (Request Access)
            </Link>
          </div>
        </div>

        {/* Bottom copyright & security badges */}
        <div className="pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>
            © {new Date().getFullYear()} ZuvaPay Technologies Limited (ZuvaPay.com). All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5 text-slate-300">
              <Lock className="w-3.5 h-3.5 text-zuva-solar" />
              256-Bit SSL Encrypted
            </span>
            <span className="flex items-center gap-1.5 text-slate-300">
              <HeartHandshake className="w-3.5 h-3.5 text-rose-400" />
              Proudly Built for Nigeria
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
