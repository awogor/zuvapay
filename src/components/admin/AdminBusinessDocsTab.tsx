'use client';

import React from 'react';
import {
  BookOpen,
  Zap,
  ArrowRight,
  ShieldCheck,
  Server,
  DollarSign,
  Radio,
  Tv,
  PhoneCall,
  Wifi,
  TrendingUp,
  Layers,
  Database,
} from 'lucide-react';
import Link from 'next/link';

export function AdminBusinessDocsTab() {
  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-12">
      {/* Header Banner */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-amber-500/10 via-brand-orange/10 to-indigo-500/10 border border-brand-orange/30 shadow-sm relative overflow-hidden">
        <div className="relative z-10 space-y-3 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-orange text-slate-950 font-black text-[10px] uppercase tracking-wider shadow-sm">
            <BookOpen className="w-3.5 h-3.5" />
            Executive Operations Manual
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            How ZuvaPay Works: Architecture, Vendors & Revenue Model
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            A comprehensive operational blueprint detailing vendor distribution, API routing logic, margin controls, settlement flows, and failure containment across all product verticals.
          </p>
        </div>
      </div>

      {/* Grid: 6 Core Business Verticals */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-brand-orange" />
              Service Verticals & Vendor Matrix
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Where each digital product is sourced, how it is fulfilled, and how our revenue is generated.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Card 1: Airtime */}
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 shadow-sm space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                    <PhoneCall className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">Airtime Recharge</h4>
                    <span className="text-[10px] text-slate-400 font-medium">MTN, Airtel, Glo, 9mobile</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase">
                  StroWallet
                </span>
              </div>

              <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                <p>
                  <strong>Vendor:</strong> StroWallet (<code className="font-mono text-[11px] bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">POST /buyairtime/request</code>)
                </p>
                <p>
                  <strong>Customer Pricing:</strong> Face-value with cashback discounts (e.g. 2% cashback incentive for users).
                </p>
                <p>
                  <strong>Business Margin:</strong> StroWallet provides airtime at wholesale discounts (~2.5% to 4% depending on network carrier). The delta between the vendor wholesale cost and customer retail is captured as platform gross profit.
                </p>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200/80 dark:border-white/5 text-[11px] text-slate-500 dark:text-slate-400">
              ⚡ <strong>Speed:</strong> Delivered in ~1.5 seconds directly via carrier gateways.
            </div>
          </div>

          {/* Card 2: Internet Data */}
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 shadow-sm space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 rounded-2xl bg-sky-500/10 text-sky-500 border border-sky-500/20">
                    <Wifi className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">Internet Data</h4>
                    <span className="text-[10px] text-slate-400 font-medium">SME, Gifting & Direct</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-600 dark:text-sky-400 text-[10px] font-black uppercase">
                  Hybrid Sourcing
                </span>
              </div>

              <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                <p>
                  <strong>Wholesale Vendor:</strong> GongozConcept for SME, Gifting & Corporate pools (<code className="font-mono text-[11px] bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">POST /data/</code>).
                </p>
                <p>
                  <strong>Direct Vendor:</strong> StroWallet for official telco direct daily/monthly packages labeled <span className="font-bold text-rose-500">(HOT)</span>.
                </p>
                <p>
                  <strong>Business Margin:</strong> Configurable margin via <em>Admin Gongoz Pricing Modal</em> (default +10% on wholesale SME price). Direct telco packages sold at face value.
                </p>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200/80 dark:border-white/5 text-[11px] text-slate-500 dark:text-slate-400">
              🔄 <strong>Failover:</strong> If SME routes experience telco congestion, customers can instantly switch to Direct Data.
            </div>
          </div>

          {/* Card 3: Electricity */}
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 shadow-sm space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">Electricity Bills</h4>
                    <span className="text-[10px] text-slate-400 font-medium">11 National DisCos</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-black uppercase">
                  StroWallet
                </span>
              </div>

              <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                <p>
                  <strong>Vendor:</strong> StroWallet (<code className="font-mono text-[11px] bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">/electricity/request</code>)
                </p>
                <p>
                  <strong>Pre-validation:</strong> Real-time meter lookup returns consumer name & verified billing address before debit.
                </p>
                <p>
                  <strong>Business Margin:</strong> StroWallet provides token purchases with operator commission. A platform convenience fee (configurable ₦0 - ₦100) can be levied per meter generation.
                </p>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200/80 dark:border-white/5 text-[11px] text-slate-500 dark:text-slate-400">
              🏷️ <strong>Token Output:</strong> Generates official 20-digit STS meter token with kilowatt unit computation.
            </div>
          </div>

          {/* Card 4: Cable TV */}
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 shadow-sm space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 rounded-2xl bg-purple-500/10 text-purple-500 border border-purple-500/20">
                    <Tv className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">Cable TV</h4>
                    <span className="text-[10px] text-slate-400 font-medium">DStv, GOtv, StarTimes</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 text-[10px] font-black uppercase">
                  StroWallet
                </span>
              </div>

              <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                <p>
                  <strong>Vendor:</strong> StroWallet (<code className="font-mono text-[11px] bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">/cable-subscription/request</code>)
                </p>
                <p>
                  <strong>Fee Policy:</strong> <strong>₦0 Convenience Fee</strong>. Sells at exact broadcaster face-value price to build trust and high transaction frequency.
                </p>
                <p>
                  <strong>Business Margin:</strong> StroWallet allocates commission discounts at wallet merchant level upon successful activation.
                </p>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200/80 dark:border-white/5 text-[11px] text-slate-500 dark:text-slate-400">
              📺 <strong>Auto-Reactivation:</strong> Direct IUC / SmartCard verification displays subscriber name automatically.
            </div>
          </div>

          {/* Card 5: Virtual SMS */}
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 shadow-sm space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 rounded-2xl bg-rose-500/10 text-rose-500 border border-rose-500/20">
                    <Radio className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">Virtual SMS Numbers</h4>
                    <span className="text-[10px] text-slate-400 font-medium">150+ Countries & OTPs</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 text-[10px] font-black uppercase">
                  Grizzly / SMSPool
                </span>
              </div>

              <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                <p>
                  <strong>Vendors:</strong> Dual routing through GrizzlySMS (Server 1) & SMSPool (Server 2).
                </p>
                <p>
                  <strong>Customer Pricing:</strong> Foreign numbers priced in NGN with 15-minute countdown clock.
                </p>
                <p>
                  <strong>Business Margin:</strong> Sourced at wholesale USD rates (~$0.15 - $0.80) and converted at administrative exchange rate with +50% to +150% markup.
                </p>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200/80 dark:border-white/5 text-[11px] text-slate-500 dark:text-slate-400">
              ⏱️ <strong>Guaranteed Safety:</strong> If no SMS code arrives within 15 minutes, funds are 100% reversed automatically.
            </div>
          </div>

          {/* Card 6: Digital Logs & Social */}
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 shadow-sm space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 rounded-2xl bg-pink-500/10 text-pink-500 border border-pink-500/20">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">Social Boost & Logs</h4>
                    <span className="text-[10px] text-slate-400 font-medium">Engagement & Accounts</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-pink-500/10 text-pink-600 dark:text-pink-400 text-[10px] font-black uppercase">
                  Momo / Fadded
                </span>
              </div>

              <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                <p>
                  <strong>Vendors:</strong> MomoPanel (SMM likes, views, followers) + Fadded (digital accounts, VPNs).
                </p>
                <p>
                  <strong>Fulfillment:</strong> Automated instant queue dispatch on MomoPanel; sanitized credential delivery on Fadded.
                </p>
                <p>
                  <strong>Business Margin:</strong> High margin product (up to 40% - 100% markup above base vendor costs).
                </p>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200/80 dark:border-white/5 text-[11px] text-slate-500 dark:text-slate-400">
              🔒 <strong>Delivery:</strong> Protected by atomic wallet row locks before account credentials or order IDs are dispatched.
            </div>
          </div>
        </div>
      </div>

      {/* Architecture & Financial Flow */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Settlement & Banking */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-brand-orange/10 text-brand-orange border border-brand-orange/20">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Treasury & Wallet Funding Infrastructure
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">How real money enters the ecosystem</p>
            </div>
          </div>

          <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-white/5 space-y-1">
              <span className="font-bold text-slate-900 dark:text-white block">1. Dedicated Virtual Accounts (Korapay & Monnify)</span>
              <p>
                Every user gets permanent, dedicated automated virtual bank accounts (Moniepoint, Wema, Sterling). When money is transferred, a webhook fires immediately to <code className="text-brand-orange">/api/webhooks/korapay</code> or <code className="text-brand-orange">/api/webhooks/monnify</code> with cryptographic HMAC verification before crediting the user balance.
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-white/5 space-y-1">
              <span className="font-bold text-slate-900 dark:text-white block">2. Dual Currency Engine (NGN & USD)</span>
              <p>
                The platform runs a unified dual-currency ledger with real-time conversion rates managed in the pricing store, allowing seamless payment across foreign and domestic services.
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-white/5 space-y-1">
              <span className="font-bold text-slate-900 dark:text-white block">3. Vendor Capital Requirements</span>
              <p>
                For services to execute automatically, your master balance on StroWallet, Gongoz, and MomoPanel must be funded in advance. When customers pay with their ZuvaPay wallet, the API executes against your vendor master balances.
              </p>
            </div>
          </div>
        </div>

        {/* Security & Risk Containment */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                "Debit First, Fulfill Second" Financial Protocol
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Zero double-spending guarantee</p>
            </div>
          </div>

          <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            <div className="p-3 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 space-y-1">
              <span className="font-bold text-emerald-700 dark:text-emerald-400 block">Step A: Atomic Wallet Lock & Debit</span>
              <p>
                Before any external vendor API is invoked, the customer's wallet balance is locked and debited directly in Postgres via RLS-protected RPC calls. If their balance is insufficient, the request halts immediately with no external calls.
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-white/5 space-y-1">
              <span className="font-bold text-slate-900 dark:text-white block">Step B: Vendor Gateway Dispatch</span>
              <p>
                The purchase is dispatched to StroWallet or Gongoz with unique idempotent transaction references.
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-1">
              <span className="font-bold text-amber-700 dark:text-amber-400 block">Step C: Automated Reversal on Failure</span>
              <p>
                If the vendor rejects the transaction or times out, the system automatically triggers <code className="text-amber-600 dark:text-amber-400">refundBill()</code>, restoring 100% of the customer's funds instantly without requiring manual support tickets.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Quick Links */}
      <div className="p-6 rounded-3xl bg-slate-900 text-white space-y-4 shadow-xl">
        <h3 className="text-sm font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
          <Zap className="w-4 h-4" />
          Direct Admin Action Center
        </h3>
        <p className="text-xs text-slate-300">
          Jump directly to any administrative configuration panel:
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <Link
            href="/admin?tab=vendors"
            className="p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-white flex items-center justify-between transition-colors group"
          >
            <span>Vendor Gateways</span>
            <ArrowRight className="w-4 h-4 text-brand-orange group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href="/admin?tab=adjust"
            className="p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-white flex items-center justify-between transition-colors group"
          >
            <span>Wallet Adjustment</span>
            <ArrowRight className="w-4 h-4 text-brand-orange group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href="/admin?tab=reports"
            className="p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-white flex items-center justify-between transition-colors group"
          >
            <span>Audit Reports</span>
            <ArrowRight className="w-4 h-4 text-brand-orange group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href="/admin?tab=email"
            className="p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-white flex items-center justify-between transition-colors group"
          >
            <span>Email Campaigns</span>
            <ArrowRight className="w-4 h-4 text-brand-orange group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
}
