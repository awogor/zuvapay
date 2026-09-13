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
              The high-velocity digital platform for bill payments and communication tools. Cheap SME data, instant airtime, electricity tokens, foreign SMS OTP numbers, and automated wallet funding.
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Dedicated Automated Virtual Accounts
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[11px] font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                NDPR Compliant
              </span>
            </div>
          </div>

          {/* Col 2: Services */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Utilities & Services
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/services#data" className="hover:text-white transition-colors">
                  Buy Airtime (MTN, Airtel, Glo, 9mobile)
                </Link>
              </li>
              <li>
                <Link href="/services#data" className="hover:text-white transition-colors">
                  Cheap SME Data from ₦240/GB
                </Link>
              </li>
              <li>
                <Link href="/services#power" className="hover:text-white transition-colors">
                  Prepaid Meter Tokens (IKEDC, AEDC)
                </Link>
              </li>
              <li>
                <Link href="/services#power" className="hover:text-white transition-colors">
                  Cable TV (DSTV, GOtv, Startimes)
                </Link>
              </li>
              <li>
                <Link href="/services#sms" className="hover:text-white transition-colors">
                  Virtual Foreign SMS (US/UK OTP)
                </Link>
              </li>
              <li>
                <Link href="/services#sms" className="hover:text-white transition-colors">
                  Social Media Growth & Followers
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
                  href="https://wa.me/2348000000000?text=Hello%20KorrectPay%20Customer%20Desk"
                  target="_blank"
                  className="flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 font-semibold"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  Instant WhatsApp Help
                </Link>
              </li>
              <li className="text-slate-400">
                Email: <span className="text-slate-200">support@zuvapay.com</span>
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

        {/* Regulatory & Legal Disclaimers (Diplomatic, Partner-Agnostic) */}
        <div className="pt-8 pb-6 border-b border-slate-800/80 space-y-3 text-[11px] leading-relaxed text-slate-400">
          <p>
            ZuvaPay Technologies Limited is FCCPC approved and NDPR compliant, with registered operating address in Lagos, Nigeria.
          </p>
          <p>
            ZuvaPay is a financial technology platform, not a bank. All payment processing, banking services, and dedicated virtual accounts are provided by licensed financial institution partners. Regulated utility and telecommunication services are delivered through licensed switches and authorized service providers.
          </p>
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
