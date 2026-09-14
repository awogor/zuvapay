'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { MarketingNavbar } from '@/components/marketing/MarketingNavbar';
import { MarketingFooter } from '@/components/marketing/MarketingFooter';
import {
  Store,
  CheckCircle2,
  Percent,
  Zap,
  ShieldCheck,
  Send,
  MessageCircle,
  Clock,
  ArrowRight,
} from 'lucide-react';

export function AgentPageView() {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [state, setState] = useState('');
  const [businessType, setBusinessType] = useState('POS Shop / Kiosk');
  const [dailyVolume, setDailyVolume] = useState('₦20,000 - ₦100,000/day');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!fullName.trim() || !phone.trim() || !state.trim()) {
      setErrorMsg('Please provide your full name, phone number, and location state.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/agent-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          phone,
          email,
          state,
          businessType,
          dailyVolume,
          message,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSubmitted(true);
      } else {
        setErrorMsg(data.error || 'Failed to submit request. Please reach out via WhatsApp.');
      }
    } catch (err: any) {
      setErrorMsg('Network error. Please try again or chat with us on WhatsApp.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFDFC] text-slate-900 font-sans selection:bg-zuva-solar selection:text-white">
      <MarketingNavbar />

      {/* Header Banner */}
      <section className="pt-32 pb-14 border-b border-slate-200/80 bg-gradient-to-b from-orange-50/40 via-white to-[#FDFDFC] relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-48 bg-gradient-to-b from-zuva-solar/10 to-transparent blur-[110px] pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-zuva-solar text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-zuva-solar animate-pulse" />
            <span>Direct Partner Program • Zero Signup Obligations</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-slate-950">
            Request to Become a ZuvaPay Agent
          </h1>

          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Run your own bill payment and SME data reselling business with wholesale margins, zero franchise fees, and direct aggregator discounts. No forced account registration required to apply.
          </p>
        </div>
      </section>

      {/* Main Form & Benefits Grid */}
      <section className="py-14 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Left Column: Why Partner */}
          <div className="lg:col-span-5 space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-zuva-solar">
                Agent Benefits
              </span>
              <h2 className="text-2xl font-black text-slate-950">
                High Wholesale Margins with Zero Delay
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                Whether you operate a physical POS kiosk, an internet cafe, or an online resell group on WhatsApp, ZuvaPay provides you with the lowest bulk rates in Nigeria.
              </p>
            </div>

            <div className="space-y-3.5">
              <div className="p-4 rounded-2xl bg-white border border-slate-200/80 flex items-start gap-3 shadow-xs">
                <div className="p-2 rounded-xl bg-orange-100 text-zuva-solar mt-0.5">
                  <Percent className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900">Tier-1 Bulk Discounts</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    MTN &amp; Airtel SME data from ₦240/GB. Retain 15% to 30% profit margin on every gigabyte sold.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-slate-200/80 flex items-start gap-3 shadow-xs">
                <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700 mt-0.5">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900">Instant Automated Refunds</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Never lose customer trust. If a telco network times out, the funds bounce back to your wallet instantly.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-slate-200/80 flex items-start gap-3 shadow-xs">
                <div className="p-2 rounded-xl bg-blue-100 text-blue-700 mt-0.5">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900">Priority Merchant Desk</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Direct access to a dedicated WhatsApp relationship manager in Lagos for high-volume transactions.
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Contact Card */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
              <p className="font-bold text-slate-900">Need Immediate Onboarding?</p>
              <p className="text-slate-600">
                You can also chat directly with our merchant desk on WhatsApp:
              </p>
              <a
                href="https://wa.me/2349038416331?text=Hello%20ZuvaPay%20Agent%20Desk"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-emerald-600 font-bold hover:underline"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                Chat with Merchant Onboarding Desk
              </a>
            </div>
          </div>

          {/* Right Column: Clean Request Form */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
              {submitted ? (
                <div className="text-center py-10 space-y-4">
                  <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900">
                    Agent Request Submitted!
                  </h3>
                  <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                    Thank you, <strong className="text-slate-900">{fullName}</strong>. Our merchant onboarding team has received your details and will contact you at <strong className="text-slate-900">{phone}</strong> within 24 hours.
                  </p>
                  <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                    <button
                      onClick={() => {
                        setSubmitted(false);
                        setFullName('');
                        setPhone('');
                        setEmail('');
                        setState('');
                        setMessage('');
                      }}
                      className="px-5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      Submit Another Request
                    </button>
                    <Link
                      href="/"
                      className="px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors"
                    >
                      Return to Home
                    </Link>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-950">
                      Submit Agent Onboarding Request
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Tell us about your business location and expected daily volume. No signup required.
                    </p>
                  </div>

                  {errorMsg && (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                      {errorMsg}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Full Name */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Full Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. Chukwuma Adeleke"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-zuva-solar transition-all"
                      />
                    </div>

                    {/* Phone Number */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        WhatsApp / Phone Number <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="0803 000 0000"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-zuva-solar transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Email */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Email Address (Optional)
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="yourname@gmail.com"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-zuva-solar transition-all"
                      />
                    </div>

                    {/* State */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        State of Operation <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        placeholder="e.g. Lagos, Abuja, Rivers, Kano"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-zuva-solar transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Business Type */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Business Model
                      </label>
                      <select
                        value={businessType}
                        onChange={(e) => setBusinessType(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-zuva-solar transition-all"
                      >
                        <option>POS Shop / Kiosk</option>
                        <option>API Reseller / Developer Integration</option>
                        <option>Cyber Cafe / Business Centre</option>
                        <option>Online SME Data Vendor (WhatsApp/IG)</option>
                        <option>Campus Tech Vendor</option>
                        <option>Supermarket / Pharmacy Top-Up</option>
                        <option>Individual Starter</option>
                      </select>
                    </div>

                    {/* Estimated Daily Volume */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Expected Daily Volume
                      </label>
                      <select
                        value={dailyVolume}
                        onChange={(e) => setDailyVolume(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-zuva-solar transition-all"
                      >
                        <option>Under ₦20,000 / day</option>
                        <option>₦20,000 - ₦100,000 / day</option>
                        <option>₦100,000 - ₦500,000 / day</option>
                        <option>₦500,000+ / day (High-Volume Merchant)</option>
                      </select>
                    </div>
                  </div>

                  {/* Notes / Special Requests */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Additional Details / Special Requests
                    </label>
                    <textarea
                      rows={3}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="e.g. We have 3 POS outlets in Ikeja and need automated bulk data dispensing..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-zuva-solar transition-all resize-none"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-zuva-solar to-zuva-amber hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs shadow-md shadow-orange-500/20 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                  >
                    {submitting ? (
                      <span>Submitting Request...</span>
                    ) : (
                      <>
                        <span>Submit Agent Request</span>
                        <Send className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>

                  <p className="text-[11px] text-slate-400 text-center pt-1">
                    🔒 No sign-up required. Your details are strictly protected according to our NDPC privacy policy.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
