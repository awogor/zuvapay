'use client';

import React, { useState } from 'react';
import {
  Smartphone,
  MessageSquareCode,
  CheckCircle2,
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
        setSuccessStatus('Instant 2.5GB Delivered in 1.1s! Telco Ref: MTN-SME-9021');
      } else if (activeTab === 'sms') {
        setSuccessStatus('Live US Number Assigned (+1 646 592 1092)! OTP: 749-102');
      } else {
        setSuccessStatus('IKEDC Token: 4920-1920-4819-0021 (28.4 kWh credited)');
      }
    }, 1000);
  };

  return (
    <div className="relative">
      {/* Floating Live Transaction Pill (Zojapay / SquareMe style) */}
      <div className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-full bg-white/95 border border-slate-200/90 shadow-lg shadow-slate-900/5 absolute -top-5 -left-6 z-20">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
        <p className="text-[11px] font-semibold text-slate-800">
          <strong className="text-slate-950">Adaeze</strong> recharged 25GB SME Data — 2m ago
        </p>
      </div>

      {/* Floating Operator Speed Chip */}
      <div
        data-preserve-dark
        className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full !bg-[#0B0F17] !text-white shadow-xl absolute -bottom-4 -right-4 z-20 text-[11px] font-bold border border-slate-800"
      >
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="font-mono font-black !text-emerald-400">0.8s</span>
        <span className="!text-slate-300">Delivery Speed</span>
      </div>

      {/* Main Card Container */}
      <div className="relative rounded-[28px] border border-slate-200/90 bg-white p-6 md:p-8 shadow-2xl shadow-slate-200/80 overflow-hidden">
        {/* Soft Solar Glow inside Card */}
        <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-orange-400/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-amber-300/15 blur-3xl pointer-events-none" />

        {/* Header with tabs */}
        <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-4 mb-5">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-black uppercase tracking-wider text-slate-900 font-display">
              Live Fulfillment Demo
            </span>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-3 gap-2 p-1.5 rounded-2xl bg-slate-100/90 border border-slate-200/80 mb-5">
          <button
            onClick={() => {
              setActiveTab('data');
              setSuccessStatus(null);
            }}
            className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'data'
                ? 'bg-gradient-to-r from-zuva-solar to-zuva-amber text-white shadow-md shadow-orange-500/25'
                : 'text-slate-600 hover:text-slate-950'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>SME Data</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('sms');
              setSuccessStatus(null);
            }}
            className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'sms'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-purple-500/25'
                : 'text-slate-600 hover:text-slate-950'
            }`}
          >
            <MessageSquareCode className="w-3.5 h-3.5" />
            <span>Foreign SMS</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('power');
              setSuccessStatus(null);
            }}
            className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'power'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-teal-500/25'
                : 'text-slate-600 hover:text-slate-950'
            }`}
          >
            <span>Power Token</span>
          </button>
        </div>

        {/* Interactive Form Display */}
        <div className="space-y-4">
          {activeTab === 'data' && (
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    Recipient Phone (MTN / Airtel / Glo)
                  </label>
                  <span className="text-[10px] text-emerald-600 font-bold">Auto-Detect Network</span>
                </div>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-zuva-solar transition-all"
                />
              </div>
              <div className="p-3.5 rounded-xl bg-orange-50/70 border border-orange-100 flex items-center justify-between text-xs">
                <span className="text-slate-600 font-medium">Selected Package:</span>
                <span className="font-bold text-slate-900">MTN SME 2.5GB (30 Days)</span>
                <span className="font-mono font-black text-zuva-solar text-sm">₦640</span>
              </div>
            </div>
          )}

          {activeTab === 'sms' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Foreign Service & Country
                </label>
                <select
                  value={smsService}
                  onChange={(e) => setSmsService(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                >
                  <option>WhatsApp (United States 🇺🇸)</option>
                  <option>Telegram (United Kingdom 🇬🇧)</option>
                  <option>OpenAI / ChatGPT (USA 🇺🇸)</option>
                  <option>Google / Gmail (Kenya 🇰🇪)</option>
                </select>
              </div>
              <div className="p-3.5 rounded-xl bg-indigo-50/70 border border-indigo-100 flex items-center justify-between text-xs">
                <span className="text-slate-600 font-medium">Duration:</span>
                <span className="font-bold text-slate-900">15-Min Live Dedicated SIM</span>
                <span className="font-mono font-black text-indigo-700 text-sm">₦780 ($0.45)</span>
              </div>
            </div>
          )}

          {activeTab === 'power' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Prepaid Meter Number (IKEDC / AEDC / EKEDC)
                </label>
                <input
                  type="text"
                  value={meter}
                  onChange={(e) => setMeter(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                />
              </div>
              <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-100 flex items-center justify-between text-xs">
                <span className="text-slate-600 font-medium">Customer Verified:</span>
                <span className="font-bold text-emerald-800">Musa Adeleke (Lekki Phase 1)</span>
                <span className="font-mono font-black text-slate-900 text-sm">₦2,500</span>
              </div>
            </div>
          )}

          {/* Action Button */}
          <button
            onClick={handleSimulate}
            disabled={simulating}
            data-preserve-dark
            className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-gradient-to-r from-zuva-solar to-zuva-amber hover:from-orange-600 hover:to-amber-600 !text-white font-bold text-xs md:text-sm transition-all shadow-xl shadow-orange-500/25 active:scale-95 disabled:opacity-50"
          >
            {simulating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin !text-white" />
                <span className="!text-white font-bold">Connecting Carrier Switch...</span>
              </>
            ) : (
              <span className="!text-white font-bold">Simulate Instant Delivery</span>
            )}
          </button>

          {/* Success Output Receipt */}
          {successStatus && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-black text-emerald-950 text-xs">Fulfillment Confirmed (0.9s)</p>
                <p className="font-mono text-[11px] text-emerald-800 mt-0.5">{successStatus}</p>
                <div className="flex items-center gap-3 pt-2 text-[10px] text-emerald-700 font-semibold">
                  <span>✓ ₦0 Gateway Surcharge</span>
                  <span>✓ SMS & Email Receipt Dispatched</span>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Instant auto-refund on downtime
            </span>
            <span className="text-slate-600 font-bold">₦0 Account Maintenance</span>
          </div>
        </div>
      </div>
    </div>
  );
}
