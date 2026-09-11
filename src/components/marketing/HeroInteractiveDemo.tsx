'use client';

import React, { useState } from 'react';
import {
  Smartphone,
  MessageSquareCode,
  Zap,
  TrendingUp,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';

export function HeroInteractiveDemo() {
  const [activeTab, setActiveTab] = useState<'data' | 'sms' | 'power'>('data');
  const [phone, setPhone] = useState('0803 123 4567');
  const [meter, setMeter] = useState('4501 8291 002');
  const [smsService, setSmsService] = useState('WhatsApp (US +1)');
  const [simulating, setSimulating] = useState(false);
  const [successStatus, setSuccessStatus] = useState<string | null>(null);

  const handleSimulate = () => {
    setSimulating(true);
    setSuccessStatus(null);
    setTimeout(() => {
      setSimulating(false);
      if (activeTab === 'data') {
        setSuccessStatus('Instant 2.5GB Delivered in 1.4s! Operator Ref: MTN-SME-9021');
      } else if (activeTab === 'sms') {
        setSuccessStatus('Live US Number Assigned! OTP received: 749-102 (Valid 15m)');
      } else {
        setSuccessStatus('IKEDC Token: 4920-1920-4819-0021 (28.4 kWh credited)');
      }
    }, 1100);
  };

  return (
    <div className="relative rounded-3xl border border-slate-200/90 bg-white p-6 md:p-8 shadow-2xl shadow-slate-200/60 overflow-hidden">
      {/* Glow blobs inside card */}
      <div className="absolute -top-20 -right-20 w-56 h-56 rounded-full bg-brand-orange/15 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-56 h-56 rounded-full bg-blue-400/10 blur-3xl pointer-events-none" />

      {/* Card Header with tabs */}
      <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-4 mb-6">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Interactive Speed Test
          </span>
        </div>
        <span className="text-[11px] font-mono font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
          99.98% Success Rate
        </span>
      </div>

      {/* Tab Switcher */}
      <div className="grid grid-cols-3 gap-2 p-1.5 rounded-2xl bg-slate-100/90 border border-slate-200/80 mb-6">
        <button
          onClick={() => {
            setActiveTab('data');
            setSuccessStatus(null);
          }}
          className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'data'
              ? 'bg-gradient-to-r from-brand-orange to-amber-500 text-white shadow-md shadow-orange-500/25'
              : 'text-slate-600 hover:text-slate-950'
          }`}
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Instant</span> Data
        </button>

        <button
          onClick={() => {
            setActiveTab('sms');
            setSuccessStatus(null);
          }}
          className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'sms'
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-500/25'
              : 'text-slate-600 hover:text-slate-950'
          }`}
        >
          <MessageSquareCode className="w-3.5 h-3.5" />
          Foreign SMS
        </button>

        <button
          onClick={() => {
            setActiveTab('power');
            setSuccessStatus(null);
          }}
          className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'power'
              ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-md shadow-teal-500/25'
              : 'text-slate-600 hover:text-slate-950'
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          Power Token
        </button>
      </div>

      {/* Interactive Form Display */}
      <div className="space-y-4">
        {activeTab === 'data' && (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Recipient Phone Number (MTN / Airtel / Glo)
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange transition-all"
              />
            </div>
            <div className="p-3.5 rounded-xl bg-orange-50/60 border border-orange-100 flex items-center justify-between text-xs">
              <span className="text-slate-600 font-medium">Selected Plan:</span>
              <span className="font-bold text-slate-900">MTN SME 2.5GB (30 Days)</span>
              <span className="font-mono font-extrabold text-brand-orange">₦640</span>
            </div>
          </div>
        )}

        {activeTab === 'sms' && (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Foreign Service & Country
              </label>
              <select
                value={smsService}
                onChange={(e) => setSmsService(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-400/20 focus:border-purple-400 transition-all"
              >
                <option>WhatsApp (United States 🇺🇸)</option>
                <option>Telegram (United Kingdom 🇬🇧)</option>
                <option>OpenAI / ChatGPT (USA 🇺🇸)</option>
                <option>Google / Gmail (Kenya 🇰🇪)</option>
              </select>
            </div>
            <div className="p-3.5 rounded-xl bg-purple-50/60 border border-purple-100 flex items-center justify-between text-xs">
              <span className="text-slate-600 font-medium">Rental Rate:</span>
              <span className="font-bold text-slate-900">15-Minute Dedicated Line</span>
              <span className="font-mono font-extrabold text-purple-700">₦780 ($0.45)</span>
            </div>
          </div>
        )}

        {activeTab === 'power' && (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Prepaid Meter Number (IKEDC / AEDC / EKEDC)
              </label>
              <input
                type="text"
                value={meter}
                onChange={(e) => setMeter(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-teal-400/20 focus:border-teal-500 transition-all"
              />
            </div>
            <div className="p-3.5 rounded-xl bg-teal-50/60 border border-teal-100 flex items-center justify-between text-xs">
              <span className="text-slate-600 font-medium">Customer Verified:</span>
              <span className="font-bold text-emerald-700">Musa Adeleke (Lekki Phase 1)</span>
              <span className="font-mono font-extrabold text-slate-900">₦2,500</span>
            </div>
          </div>
        )}

        {/* Action Button */}
        <button
          onClick={handleSimulate}
          disabled={simulating}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs md:text-sm transition-all shadow-lg shadow-slate-900/10 active:scale-95 disabled:opacity-50"
        >
          {simulating ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-brand-orange" />
              Routing via Live Carrier Gateway...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-brand-orange" />
              Test 1-Second Fulfillment Now
            </>
          )}
        </button>

        {/* Success Output */}
        {successStatus && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2.5 animate-in fade-in slide-in-from-top-1">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-bold text-emerald-900">Delivery Confirmed!</p>
              <p className="font-mono text-[11px] text-emerald-700 mt-0.5">{successStatus}</p>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            Automatic refund if telco hangs
          </span>
          <span className="text-slate-600 font-medium">0% transaction charge</span>
        </div>
      </div>
    </div>
  );
}
