'use client';

import React from 'react';
import Link from 'next/link';
import { MarketingNavbar } from '@/components/marketing/MarketingNavbar';
import { MarketingFooter } from '@/components/marketing/MarketingFooter';
import {
  ShieldCheck,
  Lock,
  Eye,
  FileText,
  Server,
  Share2,
  CheckCircle2,
  Mail,
  Building2,
  ArrowRight,
} from 'lucide-react';

export function PrivacyPageView() {
  return (
    <div className="min-h-screen bg-[#FDFDFC] text-slate-900 font-sans selection:bg-zuva-solar selection:text-white">
      <MarketingNavbar />

      {/* Header Banner */}
      <section className="pt-32 pb-14 border-b border-slate-200/80 bg-gradient-to-b from-orange-50/40 via-white to-[#FDFDFC] relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-48 bg-gradient-to-b from-zuva-solar/10 to-transparent blur-[110px] pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>NDPC Compliant • Nigeria Data Protection Act (NDPA 2023)</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-slate-950">
            Privacy Policy &amp; Data Protection
          </h1>

          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            At ZuvaPay, we hold your personal and transactional information with the highest confidentiality. This policy outlines how your data is collected, processed, and safeguarded.
          </p>

          <p className="text-xs text-slate-400 font-medium">
            Last Updated &amp; Effective: September 14, 2026
          </p>
        </div>
      </section>

      {/* Main Policy Content */}
      <section className="py-14 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-10 shadow-xs space-y-10">
          {/* Quick Notice Card */}
          <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-amber-950 text-xs leading-relaxed space-y-2">
            <p className="font-bold flex items-center gap-2 text-sm text-amber-900">
              <ShieldCheck className="w-4 h-4 text-amber-600" />
              Summary of Our Regulatory Standing
            </p>
            <p>
              ZuvaPay operates in compliance with the <strong>Nigeria Data Protection Commission (NDPC)</strong> guidelines and the <strong>Nigeria Data Protection Act (NDPA 2023)</strong>. We adhere strictly to data minimization, lawful processing, purpose limitation, and robust storage encryption.
            </p>
          </div>

          {/* Section 1 */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5 text-slate-900">
              <div className="w-7 h-7 rounded-lg bg-orange-100 text-zuva-solar flex items-center justify-center font-bold text-xs">
                1
              </div>
              <h2 className="text-lg font-bold text-slate-950">Who We Are</h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pl-9">
              ZuvaPay (&ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;) is an automated digital utilities aggregation platform operated by ZuvaPay Technologies Limited in Lagos, Nigeria. We connect consumers and businesses directly with telecommunication networks, power distribution companies, cable television operators, and digital service vendors.
            </p>
          </div>

          {/* Section 2 */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5 text-slate-900">
              <div className="w-7 h-7 rounded-lg bg-orange-100 text-zuva-solar flex items-center justify-center font-bold text-xs">
                2
              </div>
              <h2 className="text-lg font-bold text-slate-950">Information We Collect</h2>
            </div>
            <div className="text-xs sm:text-sm text-slate-600 leading-relaxed pl-9 space-y-2">
              <p>We only collect information necessary to fulfill your requested transactions and secure your account:</p>
              <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
                <li><strong>Identity &amp; Contact:</strong> Full name, telephone number, and email address provided during registration or checkout.</li>
                <li><strong>Utility &amp; Transactional Data:</strong> Meter numbers, smartcard numbers, recipient phone numbers for data/airtime top-ups, transaction references, and timestamp logs.</li>
                <li><strong>Security Credentials:</strong> Encrypted password hashes and a self-selected 4-digit transaction authorization PIN. We never store plain-text passwords or PINs.</li>
                <li><strong>Technical Information:</strong> IP address, device operating system, browser type, and diagnostic error logs used solely for fraud prevention, rate limiting, and system stability.</li>
              </ul>
            </div>
          </div>

          {/* Section 3 - Third Party Fulfillment Highlight */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5 text-slate-900">
              <div className="w-7 h-7 rounded-lg bg-orange-100 text-zuva-solar flex items-center justify-center font-bold text-xs">
                3
              </div>
              <h2 className="text-lg font-bold text-slate-950">Third-Party Service Providers &amp; Data Sharing</h2>
            </div>
            <div className="text-xs sm:text-sm text-slate-600 leading-relaxed pl-9 space-y-3">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 space-y-2">
                <p className="font-semibold text-slate-900">
                  Notice on Third-Party Fulfillment:
                </p>
                <p>
                  ZuvaPay is a technology aggregator. Many of our core utility services are fulfilled through regulated external partners, telecom aggregators, and financial infrastructure providers.
                </p>
              </div>

              <p>To successfully process your orders, specific transactional identifiers are shared with authorized third parties on a strict need-to-know basis:</p>
              <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
                <li><strong>Telecommunication Carriers &amp; Aggregators:</strong> Recipient phone numbers and requested bundle sizes are shared with carriers (MTN, Airtel, Glo, 9mobile) and certified data gateways to dispatch SME data and airtime.</li>
                <li><strong>Electricity Distribution Companies (Discos):</strong> Meter numbers and payment amounts are transmitted to discos (IKEDC, EKEDC, AEDC, IBEDC, etc.) to generate your 20-digit prepaid recharge token.</li>
                <li><strong>Licensed Payment Gateways &amp; Banks:</strong> Payment processing, card clearing, and bank transfer verifications are executed via PCI-DSS certified payment processors (e.g. Paystack, Monnify). ZuvaPay does not store or process raw debit card PANs or CVVs.</li>
                <li><strong>International Carrier Aggregators:</strong> For foreign virtual SMS numbers, requests are forwarded to global telecom switches without sharing your personal identity.</li>
              </ul>

              <p className="text-slate-500 text-xs">
                We never sell, rent, or trade your personal information to marketing brokers, data aggregators, or unauthorized third parties.
              </p>
            </div>
          </div>

          {/* Section 4 - NDPC Rights */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5 text-slate-900">
              <div className="w-7 h-7 rounded-lg bg-orange-100 text-zuva-solar flex items-center justify-center font-bold text-xs">
                4
              </div>
              <h2 className="text-lg font-bold text-slate-950">Your Rights Under NDPA (2023)</h2>
            </div>
            <div className="text-xs sm:text-sm text-slate-600 leading-relaxed pl-9 space-y-2">
              <p>As a data subject under Nigerian law, you are entitled to:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="p-3 rounded-xl border border-slate-100 bg-slate-50/50">
                  <p className="font-bold text-slate-900">Right to Access</p>
                  <p className="text-xs text-slate-500 mt-0.5">Request a complete copy of all personal records we hold about you.</p>
                </div>
                <div className="p-3 rounded-xl border border-slate-100 bg-slate-50/50">
                  <p className="font-bold text-slate-900">Right to Rectification</p>
                  <p className="text-xs text-slate-500 mt-0.5">Correct inaccurate, outdated, or incomplete profile details.</p>
                </div>
                <div className="p-3 rounded-xl border border-slate-100 bg-slate-50/50">
                  <p className="font-bold text-slate-900">Right to Erasure (&ldquo;To be Forgotten&rdquo;)</p>
                  <p className="text-xs text-slate-500 mt-0.5">Request account deletion, subject to statutory financial audit record retention.</p>
                </div>
                <div className="p-3 rounded-xl border border-slate-100 bg-slate-50/50">
                  <p className="font-bold text-slate-900">Right to Object</p>
                  <p className="text-xs text-slate-500 mt-0.5">Opt out of non-essential promotional SMS or emails at any time.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Section 5 */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5 text-slate-900">
              <div className="w-7 h-7 rounded-lg bg-orange-100 text-zuva-solar flex items-center justify-center font-bold text-xs">
                5
              </div>
              <h2 className="text-lg font-bold text-slate-950">Data Security &amp; Encryption</h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pl-9">
              All communications between your device and ZuvaPay are protected using modern TLS/SSL 256-bit encryption. Sensitive database fields are hashed with robust cryptographic salts. Additionally, every financial debit on your wallet is guarded by your private 4-digit PIN.
            </p>
          </div>

          {/* Section 6 - Contact */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5 text-slate-900">
              <div className="w-7 h-7 rounded-lg bg-orange-100 text-zuva-solar flex items-center justify-center font-bold text-xs">
                6
              </div>
              <h2 className="text-lg font-bold text-slate-950">Data Protection Officer (DPO) Contact</h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pl-9">
              For privacy inquiries, rights enforcement, or NDPC-related questions, contact our designated Data Protection Officer:
            </p>
            <div className="pl-9 pt-1">
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 text-xs space-y-1 max-w-md">
                <p className="font-bold text-slate-900">ZuvaPay Data Privacy Office</p>
                <p className="text-slate-600">Email: <a href="mailto:hello@zuvapay.com" className="text-zuva-solar font-medium underline">hello@zuvapay.com</a></p>
                <p className="text-slate-600">Location: Victoria Island, Lagos State, Nigeria</p>
              </div>
            </div>
          </div>

          {/* Bottom Back Button */}
          <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <Link
              href="/terms"
              className="text-xs font-semibold text-slate-600 hover:text-zuva-solar flex items-center gap-1.5"
            >
              Read Terms &amp; Conditions <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              href="/"
              className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
