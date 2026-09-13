'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import {
  HelpCircle,
  MessageCircle,
  Send,
  Mail,
  PhoneCall,
  X,
  Copy,
  Check,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';

interface SupportContextData {
  issue?: string;
  reference?: string;
  service?: string;
  meta?: Record<string, any>;
}

interface SupportContextType {
  openSupport: (data?: SupportContextData) => void;
  closeSupport: () => void;
}

const SupportContext = createContext<SupportContextType | undefined>(undefined);

export function useSupport() {
  const ctx = useContext(SupportContext);
  if (!ctx) {
    throw new Error('useSupport must be used within a SupportProvider');
  }
  return ctx;
}

// Configurable ZuvaPay Official Support Contacts
const SUPPORT_CONTACTS = {
  whatsapp: {
    number: '+2348000000000',
    cleanNumber: '2348000000000',
    label: 'WhatsApp Support',
    handle: 'Chat with Support Team',
  },
  telegram: {
    handle: '@ZuvaPaySupport',
    url: 'https://t.me/ZuvaPaySupport',
    label: 'Telegram Official Desk',
  },
  email: {
    address: 'support@zuvapay.com',
    label: 'Email Helpdesk',
  },
  phone: {
    number: '+234 800 ZUVAPAY',
    raw: '+2348005677328',
    label: 'Emergency Hotlines',
  },
};

export function SupportProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [contextData, setContextData] = useState<SupportContextData | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const openSupport = useCallback((data?: SupportContextData) => {
    setContextData(data || null);
    setIsOpen(true);
  }, []);

  const closeSupport = useCallback(() => {
    setIsOpen(false);
  }, []);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const getWhatsAppMessage = () => {
    let msg = 'Hello ZuvaPay Support, I need assistance with my account.\n\n';
    if (contextData?.service) {
      msg += `• Service: ${contextData.service}\n`;
    }
    if (contextData?.reference) {
      msg += `• Reference: ${contextData.reference}\n`;
    }
    if (contextData?.issue) {
      msg += `• Issue: ${contextData.issue}\n`;
    }
    return encodeURIComponent(msg);
  };

  const whatsappUrl = `https://wa.me/${SUPPORT_CONTACTS.whatsapp.cleanNumber}?text=${getWhatsAppMessage()}`;

  return (
    <SupportContext.Provider value={{ openSupport, closeSupport }}>
      {children}

      {/* Floating Support Modal */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeSupport();
          }}
        >
          <div className="relative w-full max-w-md max-h-[85dvh] sm:max-h-[85vh] flex flex-col rounded-t-[28px] sm:rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-200">
            {/* Mobile Drag Indicator */}
            <div className="sm:hidden pt-2.5 pb-1 flex justify-center flex-shrink-0 bg-slate-50/90 dark:bg-slate-950/80">
              <div className="w-10 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
            </div>

            {/* Header - Fixed at Top */}
            <div className="flex-shrink-0 px-4 py-3 sm:p-5 border-b border-slate-100 dark:border-white/5 flex items-center justify-between bg-slate-50/90 dark:bg-slate-950/80 backdrop-blur-sm">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-brand-orange/10 text-brand-orange">
                  <HelpCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white leading-tight">
                    Contact Support
                  </h3>
                  <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400">
                    24/7 Priority Resolution & Live Assistance
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={closeSupport}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>

            {/* Scrollable Body Content */}
            <div className="flex-1 overflow-y-auto px-4 py-3.5 sm:p-5 space-y-3 overscroll-contain">
              {contextData?.issue && (
                <div className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-amber-700 dark:text-amber-400 text-[11px] sm:text-xs">
                    <ShieldAlert className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                    <span>Reported Context:</span>
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 font-medium text-[11px] sm:text-xs">
                    {contextData.issue}
                  </p>
                  {contextData.reference && (
                    <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 pt-1 font-mono">
                      <span>Trace Ref: {contextData.reference}</span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(contextData.reference!, 'ref')}
                        className="text-brand-orange hover:underline inline-flex items-center gap-1"
                      >
                        {copiedField === 'ref' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        {copiedField === 'ref' ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                  )}
                </div>
              )}

              <p className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                If a temporary line was out of stock or a carrier gateway is pending, our operations desk can inspect gateway balances or activate alternative routes for you instantly:
              </p>

              {/* Channels List */}
              <div className="space-y-2 sm:space-y-2.5">
                {/* 1. WhatsApp Priority */}
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 sm:p-3.5 rounded-xl sm:rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 transition-all group"
                >
                  <div className="flex items-center gap-2.5 sm:gap-3">
                    <div className="p-2 rounded-lg sm:rounded-xl bg-emerald-500 text-white shadow-sm flex-shrink-0">
                      <MessageCircle className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                        <span>WhatsApp Live Chat</span>
                        <span className="px-1.5 py-0.2 rounded text-[9px] bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-extrabold uppercase">
                          Fastest
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {SUPPORT_CONTACTS.whatsapp.number}
                      </p>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-emerald-600 dark:text-emerald-400 group-hover:translate-x-0.5 transition-transform flex-shrink-0" />
                </a>

                {/* 2. Telegram Support */}
                <a
                  href={SUPPORT_CONTACTS.telegram.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 sm:p-3.5 rounded-xl sm:rounded-2xl bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 transition-all group"
                >
                  <div className="flex items-center gap-2.5 sm:gap-3">
                    <div className="p-2 rounded-lg sm:rounded-xl bg-sky-500 text-white shadow-sm flex-shrink-0">
                      <Send className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-sky-800 dark:text-sky-300">
                        Telegram Desk
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {SUPPORT_CONTACTS.telegram.handle}
                      </p>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-sky-600 dark:text-sky-400 group-hover:translate-x-0.5 transition-transform flex-shrink-0" />
                </a>

                {/* 3. Official Email */}
                <div className="flex items-center justify-between p-3 sm:p-3.5 rounded-xl sm:rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-white/10">
                  <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                    <div className="p-2 rounded-lg sm:rounded-xl bg-rose-500 text-white shadow-sm flex-shrink-0">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-900 dark:text-white">
                        Email Support
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono truncate">
                        {SUPPORT_CONTACTS.email.address}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(SUPPORT_CONTACTS.email.address, 'email')}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors flex-shrink-0"
                  >
                    {copiedField === 'email' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedField === 'email' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Footer - Fixed at Bottom */}
            <div className="flex-shrink-0 px-4 py-3 sm:p-4 bg-slate-50 dark:bg-slate-950/60 border-t border-slate-100 dark:border-white/5 text-center">
              <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400">
                ZuvaPay Desk operates 24 hours daily • Typical response under 5 minutes
              </p>
            </div>
          </div>
        </div>
      )}
    </SupportContext.Provider>
  );
}
