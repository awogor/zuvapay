'use client';

import React from 'react';
import { ShieldCheck, Building2, Smartphone, Zap } from 'lucide-react';

export function StrategicPartners() {
  return (
    <section className="py-20 bg-slate-50/70 border-t border-slate-200/80 relative overflow-hidden" id="partners">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-orange-100 text-zuva-solar text-xs font-bold">
            <span>Infrastructure & Compliance</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-950 font-display tracking-tight">
            Powered by Licensed Banking &amp; Tier-1 African Infrastructure
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed max-w-2xl mx-auto">
            ZuvaPay integrates directly with CBN-licensed settlement institutions, direct telecom carrier switches, and electricity DisCos to guarantee sub-second delivery and 100% automated refunds.
          </p>
        </div>

        {/* 4 Infrastructure Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Pillar 1: Banking & Settlement */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="p-2.5 rounded-2xl bg-blue-50 text-blue-600">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900 font-display">Banking Settlement</h3>
                <p className="text-[11px] text-slate-500 font-medium">CBN Regulated Partners</p>
              </div>
            </div>

            <ul className="space-y-3 text-xs">
              <li className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="font-bold text-slate-800">Moniepoint MFB</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-semibold">Virtual Accounts</span>
              </li>
              <li className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="font-bold text-slate-800">Wema Bank (ALAT)</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 font-semibold">Auto-Credit</span>
              </li>
              <li className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="font-bold text-slate-800">Interswitch &amp; NIBSS</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-semibold">Instant Switch</span>
              </li>
              <li className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="font-bold text-slate-800">Korapay &amp; Paystack</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 font-semibold">Gateway Switch</span>
              </li>
            </ul>
          </div>

          {/* Pillar 2: Telecom Switches */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="p-2.5 rounded-2xl bg-amber-50 text-amber-600">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900 font-display">Telecom Pipelines</h3>
                <p className="text-[11px] text-slate-500 font-medium">Direct Carrier SME Routing</p>
              </div>
            </div>

            <ul className="space-y-3 text-xs">
              <li className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  <span className="font-bold text-slate-800">MTN Nigeria</span>
                </div>
                <span className="text-[10px] font-mono font-bold text-amber-700">from ₦240/GB</span>
              </li>
              <li className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                  <span className="font-bold text-slate-800">Airtel Nigeria</span>
                </div>
                <span className="text-[10px] font-mono font-bold text-red-700">from ₦238/GB</span>
              </li>
              <li className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="font-bold text-slate-800">Glo Mobile</span>
                </div>
                <span className="text-[10px] font-mono font-bold text-emerald-700">from ₦230/GB</span>
              </li>
              <li className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-green-700" />
                  <span className="font-bold text-slate-800">9mobile</span>
                </div>
                <span className="text-[10px] font-mono font-bold text-green-800">from ₦190/GB</span>
              </li>
            </ul>
          </div>

          {/* Pillar 3: Power & Energy DisCos */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="p-2.5 rounded-2xl bg-teal-50 text-teal-600">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900 font-display">Electricity DisCos</h3>
                <p className="text-[11px] text-slate-500 font-medium">Instant 20-Digit Tokens</p>
              </div>
            </div>

            <ul className="space-y-3 text-xs">
              <li className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="font-bold text-slate-800">Ikeja Electric (IKEDC)</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-100 text-teal-700 font-semibold">0% Fee</span>
              </li>
              <li className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="font-bold text-slate-800">Eko Electric (EKEDC)</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-100 text-teal-700 font-semibold">0% Fee</span>
              </li>
              <li className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="font-bold text-slate-800">Abuja Electric (AEDC)</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-100 text-teal-700 font-semibold">0% Fee</span>
              </li>
              <li className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="font-bold text-slate-800">Ibadan Electric (IBEDC)</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-100 text-teal-700 font-semibold">0% Fee</span>
              </li>
            </ul>
          </div>

          {/* Pillar 4: Security & Compliance */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="p-2.5 rounded-2xl bg-indigo-50 text-indigo-600">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900 font-display">Security &amp; Legal</h3>
                <p className="text-[11px] text-slate-500 font-medium">NDPR Data Protection</p>
              </div>
            </div>

            <ul className="space-y-3 text-xs">
              <li className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="font-bold text-slate-800">NDPR Compliant</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-semibold">Verified</span>
              </li>
              <li className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="font-bold text-slate-800">256-Bit SSL/TLS</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 font-semibold">Bank Grade</span>
              </li>
              <li className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="font-bold text-slate-800">4-Digit PIN Lock</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200 text-slate-800 font-semibold">Protected</span>
              </li>
              <li className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="font-bold text-slate-800">Atomic Auto-Refund</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-semibold">100% Funds Back</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
