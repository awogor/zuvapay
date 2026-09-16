'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ShieldCheck, Lock, CheckCircle2, AlertCircle, ArrowRight, KeyRound, Sparkles } from 'lucide-react';
import { useToast } from '@/components/common/Toast';
import { useAuth } from '@/context/AuthContext';

interface PinSetupModalProps {
  isOpen: boolean;
  onSuccess?: () => void;
}

export function PinSetupModal({ isOpen, onSuccess }: PinSetupModalProps) {
  const { success, error } = useToast();
  const { refreshProfile } = useAuth();

  const [step, setStep] = useState<'create' | 'confirm'>('create');
  const [pinDigits, setPinDigits] = useState(['', '', '', '']);
  const [confirmDigits, setConfirmDigits] = useState(['', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [pinError, setPinError] = useState<string | null>(null);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const confirmRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (isOpen) {
      setStep('create');
      setPinDigits(['', '', '', '']);
      setConfirmDigits(['', '', '', '']);
      setPinError(null);
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 300);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDigitChange = (
    index: number,
    value: string,
    isConfirm: boolean = false
  ) => {
    // Only accept numeric digit
    const cleaned = value.replace(/\D/g, '');
    const currentDigits = isConfirm ? [...confirmDigits] : [...pinDigits];
    const refs = isConfirm ? confirmRefs : inputRefs;

    if (cleaned.length > 0) {
      currentDigits[index] = cleaned[cleaned.length - 1];
      if (isConfirm) {
        setConfirmDigits(currentDigits);
      } else {
        setPinDigits(currentDigits);
      }
      setPinError(null);

      // Auto-advance to next input
      if (index < 3) {
        refs.current[index + 1]?.focus();
      }
    } else {
      currentDigits[index] = '';
      if (isConfirm) {
        setConfirmDigits(currentDigits);
      } else {
        setPinDigits(currentDigits);
      }
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
    isConfirm: boolean = false
  ) => {
    const currentDigits = isConfirm ? confirmDigits : pinDigits;
    const refs = isConfirm ? confirmRefs : inputRefs;

    if (e.key === 'Backspace' && !currentDigits[index] && index > 0) {
      refs.current[index - 1]?.focus();
    }
  };

  const handleCreateNext = () => {
    const enteredPin = pinDigits.join('');
    if (enteredPin.length !== 4) {
      setPinError('Please enter all 4 digits for your PIN');
      return;
    }

    setStep('confirm');
    setPinError(null);
    setTimeout(() => {
      confirmRefs.current[0]?.focus();
    }, 150);
  };

  const handleSubmitPin = async () => {
    const enteredPin = pinDigits.join('');
    const confirmedPin = confirmDigits.join('');

    if (confirmedPin.length !== 4) {
      setPinError('Please enter all 4 digits to confirm');
      return;
    }

    if (enteredPin !== confirmedPin) {
      setPinError('PINs do not match. Please try again.');
      setConfirmDigits(['', '', '', '']);
      confirmRefs.current[0]?.focus();
      return;
    }

    setLoading(true);
    setPinError(null);

    try {
      const res = await fetch('/api/auth/pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pin: enteredPin,
          confirmPin: confirmedPin,
        }),
      });

      let data: any = {};
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        try {
          data = await res.json();
        } catch {
          data = { success: false, error: 'Malformed response from server' };
        }
      } else {
        const rawText = await res.text().catch(() => '');
        data = {
          success: false,
          error: res.status === 401 
            ? 'Session expired. Please log in again.' 
            : rawText || `Server communication error (${res.status}). Please try again.`,
        };
      }

      if (res.ok && data.success) {
        success('Security Enabled', 'Your 4-digit transaction PIN has been set successfully!');
        await refreshProfile();
        if (onSuccess) onSuccess();
      } else {
        setPinError(data.error || 'Failed to save PIN. Please try again.');
      }
    } catch (err: any) {
      setPinError(err.message || 'Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="relative w-full max-w-md rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/95 p-6 sm:p-8 shadow-2xl backdrop-blur-2xl text-center overflow-hidden">
        {/* Glow ambient background */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-24 bg-brand-orange/20 blur-3xl pointer-events-none" />

        {/* Shield Icon */}
        <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-orange to-amber-500 p-0.5 shadow-xl shadow-orange-500/20 mb-4 flex items-center justify-center text-slate-950">
          <KeyRound className="w-7 h-7 stroke-[2.5]" />
        </div>

        {/* Title & Description */}
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          {step === 'create' ? 'Create Transaction PIN' : 'Confirm Transaction PIN'}
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 max-w-xs mx-auto leading-relaxed">
          {step === 'create'
            ? 'Set up your secret 4-digit transaction PIN. You will use this to authorize withdrawals, bill payments, and services.'
            : 'Re-enter your 4-digit PIN to confirm and secure your ZuvaPay wallet.'}
        </p>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-2 my-5">
          <span
            className={`h-1.5 rounded-full transition-all duration-300 ${
              step === 'create' ? 'w-8 bg-brand-orange' : 'w-4 bg-emerald-500'
            }`}
          />
          <span
            className={`h-1.5 rounded-full transition-all duration-300 ${
              step === 'confirm' ? 'w-8 bg-brand-orange' : 'w-4 bg-slate-200 dark:bg-slate-700'
            }`}
          />
        </div>

        {/* PIN Inputs (Step 1: Create) */}
        {step === 'create' && (
          <div className="space-y-6">
            <div className="flex items-center justify-center gap-3 sm:gap-4 my-6">
              {pinDigits.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => {
                    inputRefs.current[idx] = el;
                  }}
                  type="password"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleDigitChange(idx, e.target.value, false)}
                  onKeyDown={(e) => handleKeyDown(idx, e, false)}
                  className="w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-black rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white focus:outline-none focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20 transition-all shadow-inner"
                />
              ))}
            </div>

            {pinError && (
              <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 dark:text-rose-400 text-xs flex items-center justify-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{pinError}</span>
              </div>
            )}

            <button
              onClick={handleCreateNext}
              disabled={pinDigits.some((d) => d === '')}
              className="w-full py-3.5 rounded-2xl bg-brand-orange hover:bg-amber-400 disabled:opacity-40 disabled:hover:bg-brand-orange text-slate-950 font-bold text-sm transition-all shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2"
            >
              Continue to Confirm
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* PIN Inputs (Step 2: Confirm) */}
        {step === 'confirm' && (
          <div className="space-y-6">
            <div className="flex items-center justify-center gap-3 sm:gap-4 my-6">
              {confirmDigits.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => {
                    confirmRefs.current[idx] = el;
                  }}
                  type="password"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleDigitChange(idx, e.target.value, true)}
                  onKeyDown={(e) => handleKeyDown(idx, e, true)}
                  className="w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-black rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white focus:outline-none focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20 transition-all shadow-inner"
                />
              ))}
            </div>

            {pinError && (
              <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 dark:text-rose-400 text-xs flex items-center justify-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{pinError}</span>
              </div>
            )}

            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setStep('create');
                  setConfirmDigits(['', '', '', '']);
                  setPinError(null);
                  setTimeout(() => inputRefs.current[0]?.focus(), 150);
                }}
                disabled={loading}
                className="flex-1 py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition-all"
              >
                Back
              </button>
              <button
                onClick={handleSubmitPin}
                disabled={loading || confirmDigits.some((d) => d === '')}
                className="flex-[2] py-3.5 rounded-2xl bg-brand-orange hover:bg-amber-400 disabled:opacity-40 disabled:hover:bg-brand-orange text-slate-950 font-bold text-sm transition-all shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2"
              >
                {loading ? 'Saving Security PIN...' : 'Activate PIN & Access'}
                <CheckCircle2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Security badge note */}
        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-white/5 flex items-center justify-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Hashed & Salted with HMAC-SHA256 • Never Stored in Plaintext</span>
        </div>
      </div>
    </div>
  );
}
