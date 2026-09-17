'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  Lock,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  AlertCircle,
  KeyRound,
  ArrowLeft,
  Loader2,
  Delete,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { PinSetupModal } from '@/components/modals/PinSetupModal';

interface AdminPinGateProps {
  onUnlock: () => void;
  userEmail?: string;
  userName?: string;
}

export function AdminPinGate({ onUnlock, userEmail, userName }: AdminPinGateProps) {
  const { isMockMode } = useAuth();
  const [digits, setDigits] = useState<string[]>(['', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isShaking, setIsShaking] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [attemptsRemaining, setAttemptsRemaining] = useState<number | null>(null);
  const [needsSetup, setNeedsSetup] = useState(false);
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [isMasked, setIsMasked] = useState(true);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Fetch live PIN configuration and remaining attempts on mount
  useEffect(() => {
    fetch('/api/auth/pin')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.success) {
          if (!data.isPinSet) {
            setNeedsSetup(true);
          } else if (data.isLocked) {
            setIsLocked(true);
            setAttemptsRemaining(0);
            setErrorMsg(
              data.error || 'Your account is locked due to 4 incorrect PIN attempts. Please contact support.'
            );
          } else {
            setAttemptsRemaining(data.attemptsRemaining ?? 4);
          }
        }
      })
      .catch(() => {});

    // Focus initial input
    setTimeout(() => {
      inputRefs.current[0]?.focus();
    }, 200);
  }, []);

  const triggerShake = () => {
    setIsShaking(true);
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([60, 50, 60]);
    }
    setTimeout(() => setIsShaking(false), 500);
  };

  const handleVerifyPin = async (enteredPin: string) => {
    if (enteredPin.length !== 4) return;
    if (isLocked) return;
    setLoading(true);
    setErrorMsg(null);

    // Mock Mode fallback
    if (isMockMode) {
      await new Promise((r) => setTimeout(r, 400));
      setLoading(false);
      onUnlock();
      return;
    }

    try {
      const res = await fetch('/api/auth/pin', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: enteredPin }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.success) {
        triggerShake();
        setDigits(['', '', '', '']);
        inputRefs.current[0]?.focus();

        if (data.isLocked) {
          setIsLocked(true);
          setAttemptsRemaining(0);
          setErrorMsg(
            data.error || 'Account locked: 4 incorrect PIN attempts. Contact support to restore access.'
          );
        } else {
          setAttemptsRemaining(data.attemptsRemaining ?? null);
          setErrorMsg(data.error || 'Incorrect transaction PIN. Please try again.');
        }
        return;
      }

      // Success: notify parent to unlock admin console
      onUnlock();
    } catch (err: any) {
      triggerShake();
      setErrorMsg(err.message || 'Network error verifying PIN. Please try again.');
      setDigits(['', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleDigitChange = (index: number, val: string) => {
    const cleaned = val.replace(/\D/g, '');
    if (!cleaned && val !== '') return;

    const newDigits = [...digits];
    const char = cleaned.slice(-1);
    newDigits[index] = char;
    setDigits(newDigits);
    setErrorMsg(null);

    // Auto-advance
    if (char && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all 4 digits are entered
    const fullPin = newDigits.join('');
    if (fullPin.length === 4 && index === 3 && char) {
      handleVerifyPin(fullPin);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!digits[index] && index > 0) {
        const newDigits = [...digits];
        newDigits[index - 1] = '';
        setDigits(newDigits);
        inputRefs.current[index - 1]?.focus();
      } else {
        const newDigits = [...digits];
        newDigits[index] = '';
        setDigits(newDigits);
      }
      setErrorMsg(null);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4);
    if (!pasted) return;

    const newDigits = ['', '', '', ''];
    for (let i = 0; i < pasted.length; i++) {
      newDigits[i] = pasted[i];
    }
    setDigits(newDigits);
    setErrorMsg(null);

    if (pasted.length === 4) {
      inputRefs.current[3]?.focus();
      handleVerifyPin(pasted);
    } else {
      inputRefs.current[Math.min(3, pasted.length)]?.focus();
    }
  };

  const handleKeypadPress = (num: string) => {
    if (loading || isLocked) return;
    const firstEmpty = digits.findIndex((d) => !d);
    if (firstEmpty !== -1) {
      handleDigitChange(firstEmpty, num);
    }
  };

  const handleKeypadBackspace = () => {
    if (loading || isLocked) return;
    const lastFilled = [...digits].reverse().findIndex((d) => d !== '');
    if (lastFilled !== -1) {
      const targetIndex = 3 - lastFilled;
      const newDigits = [...digits];
      newDigits[targetIndex] = '';
      setDigits(newDigits);
      setErrorMsg(null);
      inputRefs.current[targetIndex]?.focus();
    }
  };

  const handleKeypadClear = () => {
    if (loading || isLocked) return;
    setDigits(['', '', '', '']);
    setErrorMsg(null);
    inputRefs.current[0]?.focus();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl animate-in fade-in duration-300">
      {/* Decorative ambient background glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-orange/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

      <div
        className={`relative w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900/95 p-6 sm:p-8 shadow-2xl backdrop-blur-md transition-all ${
          isShaking ? 'animate-[shake_0.5s_ease-in-out]' : ''
        }`}
      >
        {/* Top Header Badge */}
        <div className="flex flex-col items-center text-center space-y-2">
          {isLocked ? (
            <div className="w-14 h-14 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center animate-pulse shadow-lg shadow-rose-500/10">
              <ShieldAlert className="w-7 h-7 stroke-[2.2]" />
            </div>
          ) : (
            <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-orange/20 to-amber-500/20 border border-brand-orange/30 text-brand-orange flex items-center justify-center shadow-lg shadow-orange-500/15">
              <Lock className="w-7 h-7 stroke-[2.2]" />
              <div className="absolute -bottom-1 -right-1 p-1 rounded-full bg-brand-orange text-slate-950 shadow-sm">
                <ShieldCheck className="w-3 h-3" />
              </div>
            </div>
          )}

          <div className="space-y-1 pt-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-orange/10 border border-brand-orange/20 text-[10px] font-bold uppercase tracking-wider text-brand-orange">
              <ShieldCheck className="w-3 h-3" />
              Administrative Security Gate
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {isLocked ? 'Account Locked' : 'Authorize Admin Access'}
            </h2>
            <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
              {isLocked
                ? 'Your account has been locked due to 4 incorrect PIN attempts.'
                : 'Enter your 4-digit transaction PIN to unlock and enter the Operations Console.'}
            </p>
          </div>

          {userEmail && (
            <div className="text-[11px] font-mono text-slate-400 bg-slate-950/80 px-3 py-1 rounded-lg border border-white/5">
              Admin: <span className="text-amber-400 font-semibold">{userEmail}</span>
            </div>
          )}
        </div>

        {/* Locked State Warning */}
        {isLocked ? (
          <div className="mt-6 space-y-4">
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs flex items-start gap-3 text-left">
              <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold text-rose-200">Security Lockout Active</p>
                <p className="leading-relaxed text-[11px] text-rose-300/90">
                  Access to administrative management is restricted after 4 failed PIN attempts. Contact the root system administrator or support to verify identity and unlock your account.
                </p>
              </div>
            </div>

            <Link
              href="/dashboard"
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-white text-slate-950 font-bold text-xs hover:bg-slate-100 transition-all shadow-md"
            >
              <ArrowLeft className="w-4 h-4" />
              Return to Customer Dashboard
            </Link>
          </div>
        ) : needsSetup ? (
          /* Needs PIN Setup */
          <div className="mt-6 space-y-4">
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-start gap-3 text-left">
              <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold text-amber-200">Transaction PIN Not Configured</p>
                <p className="leading-relaxed text-[11px] text-amber-300/90">
                  Every administrator must configure a secure 4-digit transaction PIN before entering the ZuvaPay Admin Console.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowSetupModal(true)}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-brand-orange to-amber-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black text-xs transition-all shadow-lg shadow-orange-500/20"
            >
              <KeyRound className="w-4 h-4 stroke-[2.5]" />
              Set Up 4-Digit PIN Now
            </button>

            <Link
              href="/dashboard"
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-slate-800 text-slate-400 hover:text-white text-xs font-semibold transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Return to Customer Dashboard
            </Link>
          </div>
        ) : (
          /* Active PIN Input */
          <div className="mt-6 space-y-4">
            {/* 4 Digit Boxes */}
            <div className="flex justify-center items-center gap-3">
              {digits.map((digit, idx) => (
                <div key={idx} className="relative">
                  <input
                    ref={(el) => {
                      inputRefs.current[idx] = el;
                    }}
                    type={isMasked ? 'password' : 'text'}
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleDigitChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    onPaste={handlePaste}
                    disabled={loading}
                    className={`w-14 h-16 sm:w-16 sm:h-16 text-center font-mono text-2xl font-black rounded-2xl border transition-all focus:outline-none ${
                      digit
                        ? 'border-brand-orange bg-brand-orange/10 text-white ring-2 ring-brand-orange/30'
                        : 'border-slate-800 bg-slate-950 text-white focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/30'
                    } ${errorMsg ? 'border-rose-500 ring-rose-500/30' : ''}`}
                  />
                  {digit && (
                    <span className="absolute bottom-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-brand-orange pointer-events-none" />
                  )}
                </div>
              ))}
            </div>

            {/* Mask Toggle & Info */}
            <div className="flex items-center justify-between text-xs px-1">
              <button
                type="button"
                onClick={() => setIsMasked(!isMasked)}
                className="inline-flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors text-[11px]"
              >
                {isMasked ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                <span>{isMasked ? 'Show digits' : 'Hide digits'}</span>
              </button>

              <span className="text-[10.5px] text-slate-500 font-mono">
                {digits.filter(Boolean).length}/4 digits entered
              </span>
            </div>

            {/* Remaining Attempts Warning */}
            {attemptsRemaining !== null && attemptsRemaining < 4 && (
              <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/25 text-rose-400 text-xs text-center space-y-1.5 animate-in fade-in">
                <div className="flex items-center justify-center gap-1.5 font-bold">
                  <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 text-rose-500" />
                  <span>
                    {attemptsRemaining === 1
                      ? 'FINAL WARNING: 1 attempt remaining'
                      : `${attemptsRemaining} of 4 attempts remaining`}
                  </span>
                </div>
                <div className="flex items-center justify-center gap-1.5 py-0.5">
                  {[1, 2, 3, 4].map((step) => {
                    const isFailed = step <= 4 - (attemptsRemaining ?? 4);
                    return (
                      <div
                        key={step}
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          isFailed ? 'w-5 bg-rose-500' : 'w-2 bg-slate-700'
                        }`}
                      />
                    );
                  })}
                </div>
                {errorMsg && <p className="text-[11px] text-rose-300 font-medium">{errorMsg}</p>}
              </div>
            )}

            {/* Standard Error (when not in warning state) */}
            {errorMsg && (attemptsRemaining === null || attemptsRemaining === 4) && (
              <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center justify-center gap-2 text-center animate-in fade-in">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Loading Indicator */}
            {loading && (
              <div className="flex items-center justify-center gap-2 text-xs text-brand-orange font-semibold py-1">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Authorizing administrative credential...</span>
              </div>
            )}

            {/* On-Screen Touch Numpad */}
            <div className="pt-2">
              <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => handleKeypadPress(num)}
                    disabled={loading || isLocked}
                    className="h-12 rounded-2xl bg-slate-950/80 hover:bg-slate-800 text-white font-mono text-lg font-bold border border-white/5 hover:border-brand-orange/30 transition-all active:scale-95 disabled:opacity-50"
                  >
                    {num}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={handleKeypadClear}
                  disabled={loading || isLocked || digits.every((d) => !d)}
                  className="h-12 rounded-2xl bg-slate-950/80 hover:bg-slate-800 text-slate-400 hover:text-white font-bold text-xs border border-white/5 transition-all active:scale-95 disabled:opacity-30"
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={() => handleKeypadPress('0')}
                  disabled={loading || isLocked}
                  className="h-12 rounded-2xl bg-slate-950/80 hover:bg-slate-800 text-white font-mono text-lg font-bold border border-white/5 hover:border-brand-orange/30 transition-all active:scale-95 disabled:opacity-50"
                >
                  0
                </button>
                <button
                  type="button"
                  onClick={handleKeypadBackspace}
                  disabled={loading || isLocked || digits.every((d) => !d)}
                  className="h-12 rounded-2xl bg-slate-950/80 hover:bg-slate-800 text-slate-400 hover:text-rose-400 flex items-center justify-center border border-white/5 transition-all active:scale-95 disabled:opacity-30"
                  title="Backspace"
                >
                  <Delete className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Back to Dashboard Link */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-center">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Exit and return to Customer Dashboard</span>
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Embedded Setup Modal when PIN is not set */}
      {showSetupModal && (
        <PinSetupModal
          isOpen={showSetupModal}
          onSuccess={() => {
            setShowSetupModal(false);
            setNeedsSetup(false);
            setDigits(['', '', '', '']);
            setAttemptsRemaining(4);
            setTimeout(() => {
              inputRefs.current[0]?.focus();
            }, 300);
          }}
        />
      )}
    </div>
  );
}
