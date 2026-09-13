'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Smartphone,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Lock,
  ArrowRight,
  Eye,
  Bell,
  ArrowDownLeft,
  ArrowUpRight,
  Wifi,
  X,
} from 'lucide-react';

export function MobileAppShowcase() {
  const [modalOpen, setModalOpen] = useState(false);
  const [targetStore, setTargetStore] = useState<'google' | 'apple'>('google');
  const [waitlistEmail, setWaitlistEmail] = useState('');
  const [waitlistSubmitted, setWaitlistSubmitted] = useState(false);

  const handleStoreClick = (store: 'google' | 'apple') => {
    setTargetStore(store);
    setModalOpen(true);
    setWaitlistSubmitted(false);
  };

  const handleWaitlistSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!waitlistEmail) return;
    setWaitlistSubmitted(true);
    setTimeout(() => {
      setModalOpen(false);
      setWaitlistEmail('');
    }, 2500);
  };

  return (
    <section className="py-24 bg-gradient-to-b from-white via-orange-50/30 to-white relative overflow-hidden border-t border-slate-200/80" id="mobile-app">
      {/* Radiant Solar Background Glows */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-zuva-solar/10 via-amber-200/15 to-transparent blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-orange-400/10 blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Main Banner Card (SquareMe style) */}
        <div data-preserve-dark className="rounded-[36px] bg-gradient-to-br from-[#0B0F17] via-[#111827] to-[#1E293B] border border-white/10 p-8 sm:p-12 lg:p-16 text-white shadow-2xl relative overflow-hidden">
          {/* Flare behind phone frames */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-bl from-zuva-solar/20 via-amber-500/15 to-transparent blur-[120px] pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Column: Copy & App Store Badges */}
            <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 text-zuva-amber text-xs font-bold backdrop-blur-md">
                <span>ZuvaPay Mobile iOS & Android</span>
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black font-display tracking-tight text-white leading-[1.12]">
                Do more with{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-zuva-solar via-zuva-amber to-amber-300">
                  ZuvaPay Mobile.
                </span>
              </h2>

              <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-xl mx-auto lg:mx-0">
                Enjoy lightning-fast payments on any smartphone you have. Instant SME data refills, 1.1s electricity meter tokens in the dark, foreign SMS OTP lines, and instant bank-funded virtual accounts right from your pocket.
              </p>

              {/* Feature bullet highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs text-slate-300 font-medium">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-zuva-solar flex-shrink-0" />
                  <span>Real-time push OTP alerts</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-zuva-solar flex-shrink-0" />
                  <span>Biometric Face ID & 4-Digit PIN</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-zuva-solar flex-shrink-0" />
                  <span>5-Second Automated Refunds</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-zuva-solar flex-shrink-0" />
                  <span>Instant Automated Virtual Account</span>
                </div>
              </div>

              {/* App Store & Google Play Download Badges (SquareMe style) */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-4">
                {/* Google Play Badge */}
                <button
                  onClick={() => handleStoreClick('google')}
                  className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-white text-slate-950 hover:bg-slate-100 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-black/30 group"
                  aria-label="Download on Google Play"
                >
                  <svg className="w-6 h-6 flex-shrink-0" viewBox="0 0 24 24" fill="none">
                    <path d="M3.609 1.813L13.882 12.086 3.609 22.36C3.256 21.996 3 21.439 3 20.73V3.443C3 2.734 3.256 2.177 3.609 1.813Z" fill="#2196F3"/>
                    <path d="M17.307 8.661L13.882 12.086 3.609 1.813C3.962 1.459 4.519 1.282 5.176 1.636L17.307 8.661Z" fill="#4CAF50"/>
                    <path d="M17.307 15.511L5.176 22.536C4.519 22.89 3.962 22.713 3.609 22.36L13.882 12.086 17.307 15.511Z" fill="#F44336"/>
                    <path d="M20.81 12.086L17.307 8.661 13.882 12.086 17.307 15.511 20.81 12.086C21.416 11.732 21.416 11.162 20.81 12.086Z" fill="#FFEB3B"/>
                  </svg>
                  <div className="text-left">
                    <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider leading-none">GET IT ON</p>
                    <p className="text-sm font-black text-slate-950 font-display leading-tight">Google Play</p>
                  </div>
                </button>

                {/* Apple App Store Badge */}
                <button
                  onClick={() => handleStoreClick('apple')}
                  className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-white text-slate-950 hover:bg-slate-100 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-black/30 group"
                  aria-label="Download on the App Store"
                >
                  <svg className="w-6 h-6 flex-shrink-0 fill-current text-slate-950" viewBox="0 0 24 24">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.85c.66-.82 1.11-1.95.99-3.09-.96.04-2.11.64-2.8 1.44-.6.7-1.13 1.83-1 2.94 1.07.08 2.16-.57 2.81-1.29z"/>
                  </svg>
                  <div className="text-left">
                    <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider leading-none">Download on the</p>
                    <p className="text-sm font-black text-slate-950 font-display leading-tight">App Store</p>
                  </div>
                </button>
              </div>

              <div className="flex items-center justify-center lg:justify-start gap-4 pt-1 text-xs text-slate-400">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Live Mobile Sync
                </span>
                <span>•</span>
                <span>Instant Android & iOS Access</span>
              </div>
            </div>

            {/* Right Column: Dual Realistic Smartphone Mockups (SquareMe style) */}
            <div className="lg:col-span-6 relative flex justify-center items-center py-6 lg:py-0">
              {/* Secondary Phone: Security PIN Screen (Tilted Behind) */}
              <div className="hidden sm:block absolute right-0 sm:right-6 lg:-right-4 top-10 w-[240px] md:w-[260px] rounded-[42px] p-3 bg-slate-800/90 border-4 border-slate-700 shadow-2xl backdrop-blur-xl rotate-[8deg] hover:rotate-0 transition-transform duration-500 z-10 pointer-events-none opacity-80 hover:opacity-100">
                <div className="rounded-[34px] bg-[#0B0F17] p-4 text-center space-y-4 border border-white/10">
                  {/* Dynamic Island */}
                  <div className="mx-auto w-24 h-4 rounded-full bg-black flex items-center justify-end px-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  </div>

                  <div className="pt-2">
                    <div className="w-10 h-10 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-zuva-solar mx-auto flex items-center justify-center">
                      <Lock className="w-5 h-5" />
                    </div>
                    <p className="text-[11px] font-bold text-white mt-2">Enter 4-Digit Security PIN</p>
                    <p className="text-[9px] text-slate-400">Confirm ₦1,500 Airtime Recharge</p>
                  </div>

                  {/* 4 Pin Dots */}
                  <div className="flex justify-center items-center gap-3 py-1">
                    <span className="w-3 h-3 rounded-full bg-zuva-solar shadow-md shadow-orange-500/50" />
                    <span className="w-3 h-3 rounded-full bg-zuva-solar shadow-md shadow-orange-500/50" />
                    <span className="w-3 h-3 rounded-full bg-zuva-solar shadow-md shadow-orange-500/50" />
                    <span className="w-3 h-3 rounded-full bg-white/20" />
                  </div>

                  {/* Mini Keypad */}
                  <div className="grid grid-cols-3 gap-2 pt-2 text-white font-mono text-xs font-bold">
                    {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'FaceID', '0', '⌫'].map((k, idx) => (
                      <div
                        key={idx}
                        className="h-8 rounded-xl bg-white/[0.05] border border-white/5 flex items-center justify-center text-[10px]"
                      >
                        {k}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Primary Phone: ZuvaPay Main Dashboard Screen */}
              <div className="w-[280px] sm:w-[310px] md:w-[325px] rounded-[48px] p-3.5 bg-gradient-to-b from-slate-700 via-slate-800 to-slate-950 border-[5px] border-slate-600 shadow-2xl relative z-20 hover:scale-[1.02] transition-transform duration-300">
                <div className="rounded-[38px] bg-[#0B0F17] overflow-hidden border border-white/10 text-white flex flex-col">
                  {/* Status Bar & Dynamic Island */}
                  <div className="pt-2 px-5 flex items-center justify-between text-[11px] font-semibold text-slate-300">
                    <span>9:41</span>
                    <div className="w-24 h-5 rounded-full bg-black flex items-center justify-between px-2.5">
                      <span className="w-2 h-2 rounded-full bg-slate-900" />
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Wifi className="w-3 h-3" />
                      <span className="text-[10px]">100%</span>
                    </div>
                  </div>

                  {/* App Navigation Header */}
                  <div className="px-4 pt-3 pb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-zuva-solar to-zuva-amber text-slate-950 font-black text-xs flex items-center justify-center">
                        D
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 leading-tight">Welcome back,</p>
                        <p className="text-xs font-black text-white leading-tight">David</p>
                      </div>
                    </div>
                    <div className="relative p-2 rounded-full bg-white/5 border border-white/10">
                      <Bell className="w-3.5 h-3.5 text-slate-300" />
                      <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-zuva-solar" />
                    </div>
                  </div>

                  {/* Wallet Balance Card (Zuva Solar Gradient) */}
                  <div className="mx-3.5 my-2 p-4 rounded-3xl bg-gradient-to-br from-[#FF6B00] via-[#F59E0B] to-[#D97706] text-slate-950 shadow-xl relative overflow-hidden">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-900/80">
                        Total Balance (NGN)
                      </span>
                      <Eye className="w-3.5 h-3.5 text-slate-900/70" />
                    </div>

                    <div className="my-1.5">
                      <h3 className="font-mono text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
                        ₦500,000.00
                      </h3>
                      <p className="text-[9px] font-mono text-slate-900/80">
                        Virtual Account • 8140291048
                      </p>
                    </div>

                    {/* Action buttons on card */}
                    <div className="flex items-center gap-2 pt-2 border-t border-slate-900/10">
                      <div
                        data-preserve-dark
                        className="flex-1 py-1.5 rounded-xl !bg-[#0B0F17] !text-white text-[11px] font-bold text-center flex items-center justify-center gap-1.5 shadow-sm"
                      >
                        <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span className="!text-white font-bold">Fund</span>
                      </div>
                      <div
                        data-preserve-dark
                        className="flex-1 py-1.5 rounded-xl !bg-white !text-slate-950 text-[11px] font-bold text-center flex items-center justify-center gap-1.5 shadow-sm"
                      >
                        <ArrowUpRight className="w-3.5 h-3.5 text-zuva-solar shrink-0" />
                        <span className="!text-slate-950 font-bold">Transfer</span>
                      </div>
                    </div>
                  </div>

                  {/* Quick Utility Grid */}
                  <div className="px-3.5 py-2">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                      Quick Services
                    </p>
                    <div className="grid grid-cols-4 gap-2 text-center text-[9px] font-semibold text-slate-300">
                      <div className="p-2 rounded-2xl bg-white/5 border border-white/5 flex flex-col items-center gap-1">
                        <span className="text-base">📱</span>
                        <span>SME Data</span>
                      </div>
                      <div className="p-2 rounded-2xl bg-white/5 border border-white/5 flex flex-col items-center gap-1">
                        <span className="text-base">⚡</span>
                        <span>Prepaid</span>
                      </div>
                      <div className="p-2 rounded-2xl bg-white/5 border border-white/5 flex flex-col items-center gap-1">
                        <span className="text-base">💬</span>
                        <span>SMS OTP</span>
                      </div>
                      <div className="p-2 rounded-2xl bg-white/5 border border-white/5 flex flex-col items-center gap-1">
                        <span className="text-base">📺</span>
                        <span>Cable TV</span>
                      </div>
                    </div>
                  </div>

                  {/* Recent Activity Mini List */}
                  <div className="px-3.5 pt-1 pb-3 flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Recent Activity
                      </p>
                      <span className="text-[9px] text-zuva-solar font-bold">View All</span>
                    </div>

                    <div className="space-y-1.5 text-[10px]">
                      <div className="p-2 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          <div>
                            <p className="font-bold text-white text-[10px]">MTN 2.5GB SME</p>
                            <p className="text-[8px] text-slate-400">Delivered in 1.1s</p>
                          </div>
                        </div>
                        <span className="font-mono font-bold text-rose-400">-₦650</span>
                      </div>

                      <div className="p-2 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                          <div>
                            <p className="font-bold text-white text-[10px]">Wallet Topup</p>
                            <p className="text-[8px] text-slate-400">Bank Transfer</p>
                          </div>
                        </div>
                        <span className="font-mono font-bold text-emerald-400">+₦120,000</span>
                      </div>
                    </div>
                  </div>

                  {/* App Bottom Bar */}
                  <div className="px-6 py-2.5 bg-slate-900/90 border-t border-white/10 flex items-center justify-between text-slate-400 text-[9px] font-bold">
                    <span className="text-zuva-solar flex flex-col items-center">● Home</span>
                    <span>Services</span>
                    <span>History</span>
                    <span>Profile</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Beta / Store Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) setModalOpen(false);
          }}
        >
          <div className="relative w-full max-w-md rounded-3xl border border-white/10 bg-slate-900 p-6 sm:p-8 text-white shadow-2xl animate-in zoom-in-95 duration-200 space-y-5">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-gradient-to-tr from-zuva-solar to-zuva-amber text-slate-950 font-black">
                <Smartphone className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black font-display text-white">
                  {targetStore === 'apple' ? 'ZuvaPay on App Store' : 'ZuvaPay on Google Play'}
                </h3>
                <p className="text-xs text-slate-400">Official Mobile App Release</p>
              </div>
            </div>

            {waitlistSubmitted ? (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs text-center space-y-1.5 animate-in fade-in">
                <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto" />
                <p className="font-bold text-sm text-emerald-200">You are on the VIP Beta List!</p>
                <p className="text-slate-400 text-[11px]">
                  We will send your direct TestFlight / APK download invite as soon as the build is live.
                </p>
              </div>
            ) : (
              <>
                <p className="text-xs text-slate-300 leading-relaxed">
                  The native <strong className="text-white">ZuvaPay Mobile App</strong> is currently rolling out in closed beta on iOS (TestFlight) and Android Play Store.
                </p>

                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-300">
                    <span>App Status:</span>
                    <span className="font-bold text-emerald-400">Final Store Review</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span>Target Platforms:</span>
                    <span className="font-bold text-white">iOS 16+ & Android 10+</span>
                  </div>
                </div>

                <form onSubmit={handleWaitlistSubmit} className="space-y-3">
                  <label className="block text-xs font-semibold text-slate-300">
                    Get Early VIP Download Access:
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="email"
                      required
                      value={waitlistEmail}
                      onChange={(e) => setWaitlistEmail(e.target.value)}
                      placeholder="Enter your email address"
                      className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-zuva-solar"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-zuva-solar to-zuva-amber hover:from-amber-600 hover:to-orange-600 text-white font-bold text-xs shadow-md"
                    >
                      Notify Me
                    </button>
                  </div>
                </form>

                <div className="pt-2 border-t border-white/10 text-center">
                  <Link
                    href="/signup"
                    onClick={() => setModalOpen(false)}
                    className="inline-flex items-center gap-1.5 text-xs text-zuva-solar hover:underline font-bold"
                  >
                    Or use the Instant Web App right now
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
