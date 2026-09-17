'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  ShieldCheck,
  Lock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  KeyRound,
  X,
  Loader2,
  HelpCircle,
  RotateCcw,
} from 'lucide-react';
import { useToast } from '@/components/common/Toast';
import { useAuth } from '@/context/AuthContext';
import { useSupport } from '@/components/modals/SupportModal';

interface PinSetupModalProps {
  isOpen: boolean;
  onClose?: () => void;
  onSuccess?: () => void;
  mode?: 'create' | 'change';
}

export function PinSetupModal({
  isOpen,
  onClose,
  onSuccess,
  mode,
}: PinSetupModalProps) {
  const { success, error } = useToast();
  const { profile, refreshProfile, isMockMode } = useAuth();
  const { openSupport } = useSupport();

  // Determine whether this is a PIN change (requires old PIN verification) or initial creation
  const isChangeMode = mode === 'change' || !!profile?.is_pin_set;

  const [step, setStep] = useState<'old' | 'create' | 'confirm'>('create');
  const [oldDigits, setOldDigits] = useState(['', '', '', '']);
  const [pinDigits, setPinDigits] = useState(['', '', '', '']);
  const [confirmDigits, setConfirmDigits] = useState(['', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [pinError, setPinError] = useState<string | null>(null);
  const [isShaking, setIsShaking] = useState(false);

  const oldRefs = useRef<(HTMLInputElement | null)[]>([]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const confirmRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (isOpen) {
      const initialStep = isChangeMode ? 'old' : 'create';
      setStep(initialStep);
      setOldDigits(['', '', '', '']);
      setPinDigits(['', '', '', '']);
      setConfirmDigits(['', '', '', '']);
      setPinError(null);

      setTimeout(() => {
        if (initialStep === 'old') {
          oldRefs.current[0]?.focus();
        } else {
          inputRefs.current[0]?.focus();
        }
      }, 250);
    }
  }, [isOpen, isChangeMode]);

  if (!isOpen) return null;

  const triggerShake = () => {
    setIsShaking(true);
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([50, 40, 50]);
    }
    setTimeout(() => setIsShaking(false), 450);
  };

  const handleDigitChange = (
    index: number,
    value: string,
    target: 'old' | 'create' | 'confirm'
  ) => {
    const cleaned = value.replace(/\D/g, '');
    const char = cleaned.length > 0 ? cleaned[cleaned.length - 1] : '';

    let currentDigits: string[];
    let setDigits: React.Dispatch<React.SetStateAction<string[]>>;
    let refs: React.MutableRefObject<(HTMLInputElement | null)[]>;

    if (target === 'old') {
      currentDigits = [...oldDigits];
      setDigits = setOldDigits;
      refs = oldRefs;
    } else if (target === 'confirm') {
      currentDigits = [...confirmDigits];
      setDigits = setConfirmDigits;
      refs = confirmRefs;
    } else {
      currentDigits = [...pinDigits];
      setDigits = setPinDigits;
      refs = inputRefs;
    }

    currentDigits[index] = char;
    setDigits(currentDigits);
    setPinError(null);

    // Auto-advance
    if (char && index < 3) {
      refs.current[index + 1]?.focus();
    }

    // Auto-submit on 4th digit for old PIN
    if (target === 'old' && index === 3 && char) {
      const fullOld = currentDigits.join('');
      if (fullOld.length === 4) {
        verifyOldPin(fullOld);
      }
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
    target: 'old' | 'create' | 'confirm'
  ) => {
    let currentDigits: string[];
    let setDigits: React.Dispatch<React.SetStateAction<string[]>>;
    let refs: React.MutableRefObject<(HTMLInputElement | null)[]>;

    if (target === 'old') {
      currentDigits = oldDigits;
      setDigits = setOldDigits;
      refs = oldRefs;
    } else if (target === 'confirm') {
      currentDigits = confirmDigits;
      setDigits = setConfirmDigits;
      refs = confirmRefs;
    } else {
      currentDigits = pinDigits;
      setDigits = setPinDigits;
      refs = inputRefs;
    }

    if (e.key === 'Backspace') {
      if (!currentDigits[index] && index > 0) {
        const next = [...currentDigits];
        next[index - 1] = '';
        setDigits(next);
        refs.current[index - 1]?.focus();
      } else {
        const next = [...currentDigits];
        next[index] = '';
        setDigits(next);
      }
      setPinError(null);
    }
  };

  // Step 1 (Change mode): Verify current old PIN against server
  const verifyOldPin = async (enteredOldPin?: string) => {
    const oldPinToVerify = enteredOldPin || oldDigits.join('');
    if (oldPinToVerify.length !== 4) {
      setPinError('Please enter all 4 digits of your current PIN');
      return;
    }

    setLoading(true);
    setPinError(null);

    if (isMockMode) {
      await new Promise((r) => setTimeout(r, 400));
      setLoading(false);
      setStep('create');
      setTimeout(() => inputRefs.current[0]?.focus(), 150);
      return;
    }

    try {
      const res = await fetch('/api/auth/pin', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: oldPinToVerify }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.success) {
        triggerShake();
        setOldDigits(['', '', '', '']);
        oldRefs.current[0]?.focus();
        setPinError(data.error || 'Incorrect current PIN. Please try again.');
        return;
      }

      // Success: move to new PIN creation
      setStep('create');
      setPinError(null);
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 200);
    } catch (err: any) {
      triggerShake();
      setPinError(err.message || 'Network error verifying current PIN');
      setOldDigits(['', '', '', '']);
      oldRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Validate New PIN & Proceed to Confirm
  const handleCreateNext = () => {
    const enteredPin = pinDigits.join('');
    const enteredOld = oldDigits.join('');

    if (enteredPin.length !== 4) {
      setPinError('Please enter all 4 digits for your new PIN');
      return;
    }

    if (isChangeMode && enteredOld && enteredPin === enteredOld) {
      triggerShake();
      setPinError('New PIN cannot be the same as your current PIN.');
      return;
    }

    setStep('confirm');
    setPinError(null);
    setTimeout(() => {
      confirmRefs.current[0]?.focus();
    }, 150);
  };

  // Step 3: Final confirmation and submission to server
  const handleSubmitPin = async () => {
    const enteredPin = pinDigits.join('');
    const confirmedPin = confirmDigits.join('');
    const enteredOld = oldDigits.join('');

    if (confirmedPin.length !== 4) {
      setPinError('Please enter all 4 digits to confirm');
      return;
    }

    if (enteredPin !== confirmedPin) {
      triggerShake();
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
          ...(isChangeMode && enteredOld ? { oldPin: enteredOld } : {}),
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok && data.success) {
        success(
          isChangeMode ? 'PIN Updated' : 'Security Enabled',
          isChangeMode
            ? 'Your 4-digit transaction PIN has been changed successfully!'
            : 'Your 4-digit transaction PIN has been set successfully!'
        );
        await refreshProfile();
        if (onSuccess) onSuccess();
        if (onClose) onClose();
      } else {
        triggerShake();
        setPinError(data.error || 'Failed to save PIN. Please try again.');
      }
    } catch (err: any) {
      triggerShake();
      setPinError(err.message || 'Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className={`relative w-full max-w-md rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-2xl text-center overflow-hidden transition-all ${
          isShaking ? 'animate-[shake_0.5s_ease-in-out]' : ''
        }`}
      >
        {/* Close button */}
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Top Icon */}
        <div
          className={`mx-auto w-12 h-12 rounded-2xl flex items-center justify-center mb-3 shadow-sm ${
            step === 'old'
              ? 'bg-purple-100 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 border border-purple-500/20'
              : 'bg-brand-orange/15 border border-brand-orange/30 text-brand-orange'
          }`}
        >
          {step === 'old' ? (
            <Lock className="w-6 h-6 stroke-[2.2]" />
          ) : (
            <KeyRound className="w-6 h-6 stroke-[2.5]" />
          )}
        </div>

        {/* Header Title & Description */}
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          {step === 'old'
            ? 'Verify Current PIN'
            : step === 'create'
            ? isChangeMode
              ? 'Create New PIN'
              : 'Create Transaction PIN'
            : isChangeMode
            ? 'Confirm New PIN'
            : 'Confirm Transaction PIN'}
        </h2>

        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 max-w-xs mx-auto leading-relaxed">
          {step === 'old'
            ? 'Enter your current 4-digit transaction PIN to authorize changing it.'
            : step === 'create'
            ? isChangeMode
              ? 'Enter your new secret 4-digit PIN. You will use this to authorize all future transactions.'
              : 'Set up your secret 4-digit transaction PIN. You will use this to authorize withdrawals, bill payments, and services.'
            : 'Re-enter your new 4-digit PIN to confirm and secure your ZuvaPay wallet.'}
        </p>

        {/* Step Indicator Progress */}
        <div className="flex items-center justify-center gap-2 my-4">
          {isChangeMode && (
            <span
              className={`h-1.5 rounded-full transition-all duration-300 ${
                step === 'old'
                  ? 'w-8 bg-purple-600 dark:bg-purple-400'
                  : 'w-4 bg-emerald-500'
              }`}
            />
          )}
          <span
            className={`h-1.5 rounded-full transition-all duration-300 ${
              step === 'create'
                ? 'w-8 bg-brand-orange'
                : step === 'confirm'
                ? 'w-4 bg-emerald-500'
                : 'w-4 bg-slate-200 dark:bg-slate-700'
            }`}
          />
          <span
            className={`h-1.5 rounded-full transition-all duration-300 ${
              step === 'confirm'
                ? 'w-8 bg-brand-orange'
                : 'w-4 bg-slate-200 dark:bg-slate-700'
            }`}
          />
        </div>

        {/* STEP 1: Verify Current PIN */}
        {step === 'old' && (
          <div className="space-y-5">
            <div className="flex items-center justify-center gap-3 sm:gap-4 my-5">
              {oldDigits.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => {
                    oldRefs.current[idx] = el;
                  }}
                  type="password"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={1}
                  value={digit}
                  disabled={loading}
                  onChange={(e) => handleDigitChange(idx, e.target.value, 'old')}
                  onKeyDown={(e) => handleKeyDown(idx, e, 'old')}
                  className="w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-black rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-purple-300/40 dark:border-purple-500/30 text-slate-900 dark:text-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all shadow-inner"
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
              type="button"
              onClick={() => verifyOldPin()}
              disabled={loading || oldDigits.some((d) => d === '')}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-sm transition-all shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2 disabled:opacity-40"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying Current PIN...</span>
                </>
              ) : (
                <>
                  <span>Verify & Proceed</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Forgot PIN Link */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  if (onClose) onClose();
                  openSupport({ issue: 'Forgot Transaction PIN' });
                }}
                className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-brand-orange transition-colors"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Forgot your current PIN?</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Enter New PIN */}
        {step === 'create' && (
          <div className="space-y-5">
            <div className="flex items-center justify-center gap-3 sm:gap-4 my-5">
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
                  disabled={loading}
                  onChange={(e) => handleDigitChange(idx, e.target.value, 'create')}
                  onKeyDown={(e) => handleKeyDown(idx, e, 'create')}
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

            <div className="flex items-center gap-2.5">
              {isChangeMode && (
                <button
                  type="button"
                  onClick={() => {
                    setStep('old');
                    setPinError(null);
                    setTimeout(() => oldRefs.current[0]?.focus(), 150);
                  }}
                  className="flex-1 py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition-all"
                >
                  Back
                </button>
              )}
              <button
                type="button"
                onClick={handleCreateNext}
                disabled={pinDigits.some((d) => d === '')}
                className="flex-[2] py-3.5 rounded-2xl bg-brand-orange hover:bg-amber-400 disabled:opacity-40 disabled:hover:bg-brand-orange text-slate-950 font-bold text-sm transition-all shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2"
              >
                <span>Continue to Confirm</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Confirm New PIN */}
        {step === 'confirm' && (
          <div className="space-y-5">
            <div className="flex items-center justify-center gap-3 sm:gap-4 my-5">
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
                  disabled={loading}
                  onChange={(e) => handleDigitChange(idx, e.target.value, 'confirm')}
                  onKeyDown={(e) => handleKeyDown(idx, e, 'confirm')}
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
                type="button"
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
                type="button"
                onClick={handleSubmitPin}
                disabled={loading || confirmDigits.some((d) => d === '')}
                className="flex-[2] py-3.5 rounded-2xl bg-brand-orange hover:bg-amber-400 disabled:opacity-40 disabled:hover:bg-brand-orange text-slate-950 font-bold text-sm transition-all shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving Security PIN...</span>
                  </>
                ) : (
                  <>
                    <span>{isChangeMode ? 'Update PIN' : 'Activate PIN & Access'}</span>
                    <CheckCircle2 className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Security badge footer note */}
        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-white/5 flex items-center justify-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Hashed & Salted with HMAC-SHA256 • Never Stored in Plaintext</span>
        </div>
      </div>
    </div>
  );
}
