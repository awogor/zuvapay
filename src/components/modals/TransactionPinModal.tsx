'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Lock,
  ShieldCheck,
  ShieldAlert,
  AlertCircle,
  AlertTriangle,
  X,
  Loader2,
  Delete,
  KeyRound,
} from 'lucide-react';
import { formatNaira, formatUSD } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';

export interface PinPromptDetails {
  title?: string;
  category?: string;
  amount: number;
  currency?: 'NGN' | 'USD';
  description?: string;
}

interface TransactionPinModalProps {
  isOpen: boolean;
  details: PinPromptDetails | null;
  onSuccess: () => void;
  onCancel: () => void;
  onNeedSetupPin?: () => void;
}

export function TransactionPinModal({
  isOpen,
  details,
  onSuccess,
  onCancel,
  onNeedSetupPin,
}: TransactionPinModalProps) {
  const { isMockMode } = useAuth();
  const [digits, setDigits] = useState<string[]>(['', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isShaking, setIsShaking] = useState(false);
  const [needsSetup, setNeedsSetup] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [attemptsRemaining, setAttemptsRemaining] = useState<number | null>(null);
  const [failedAttempts, setFailedAttempts] = useState<number>(0);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (isOpen) {
      setDigits(['', '', '', '']);
      setErrorMsg(null);
      setLoading(false);
      setIsShaking(false);
      setNeedsSetup(false);
      setIsLocked(false);

      // Fetch live PIN status and remaining attempts
      fetch('/api/auth/pin')
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (data?.success) {
            if (data.isLocked) {
              setIsLocked(true);
              setAttemptsRemaining(0);
              setFailedAttempts(4);
              setErrorMsg(
                data.error || 'Your account is locked due to 4 incorrect PIN attempts. Please contact support.'
              );
            } else {
              setAttemptsRemaining(data.attemptsRemaining ?? 4);
              setFailedAttempts(data.failedAttempts ?? 0);
            }
          }
        })
        .catch(() => {});

      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 200);
    }
  }, [isOpen]);

  if (!isOpen || !details) return null;

  const triggerShake = () => {
    setIsShaking(true);
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
      onSuccess();
      return;
    }

    try {
      const res = await fetch('/api/auth/pin', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: enteredPin }),
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
            ? 'Session expired. Please refresh and log in again.' 
            : rawText || `Server communication error (${res.status}). Please try again.`,
        };
      }

      if (res.ok && data.success) {
        setLoading(false);
        setAttemptsRemaining(4);
        setFailedAttempts(0);
        setIsLocked(false);
        onSuccess();
      } else {
        setLoading(false);
        if (data.requiresPinSetup) {
          setNeedsSetup(true);
          setErrorMsg('You have not set up a 4-digit transaction PIN yet.');
        } else if (data.isLocked) {
          setIsLocked(true);
          setAttemptsRemaining(0);
          setFailedAttempts(4);
          setErrorMsg(data.error || 'Account locked: Maximum of 4 incorrect PIN attempts reached.');
          triggerShake();
        } else {
          const rem = data.attemptsRemaining ?? (attemptsRemaining !== null ? attemptsRemaining - 1 : 3);
          const failed = data.failedAttempts ?? (4 - rem);
          setAttemptsRemaining(rem);
          setFailedAttempts(failed);
          setErrorMsg(
            data.error ||
            `Incorrect transaction PIN. ${rem} attempt${rem === 1 ? '' : 's'} remaining. Note: Your account will be locked on the 4th wrong attempt.`
          );
          triggerShake();
          setDigits(['', '', '', '']);
          setTimeout(() => {
            inputRefs.current[0]?.focus();
          }, 100);
        }
      }
    } catch (err: any) {
      setLoading(false);
      setErrorMsg(err.message || 'Verification network error. Please try again.');
      triggerShake();
    }
  };

  const handleDigitChange = (index: number, val: string) => {
    const cleaned = val.replace(/\D/g, '');
    const newDigits = [...digits];

    if (cleaned.length > 0) {
      newDigits[index] = cleaned[cleaned.length - 1];
      setDigits(newDigits);
      setErrorMsg(null);

      if (index < 3) {
        inputRefs.current[index + 1]?.focus();
      } else {
        const fullPin = newDigits.join('');
        if (fullPin.length === 4) {
          handleVerifyPin(fullPin);
        }
      }
    } else {
      newDigits[index] = '';
      setDigits(newDigits);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'Escape') {
      onCancel();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4);
    if (!pastedData) return;

    const newDigits = ['', '', '', ''];
    for (let i = 0; i < pastedData.length; i++) {
      newDigits[i] = pastedData[i];
    }
    setDigits(newDigits);
    setErrorMsg(null);

    if (pastedData.length === 4) {
      inputRefs.current[3]?.focus();
      handleVerifyPin(pastedData);
    } else {
      inputRefs.current[pastedData.length]?.focus();
    }
  };

  const handleKeypadPress = (digit: string) => {
    if (loading) return;
    const nextIdx = digits.findIndex((d) => d === '');
    if (nextIdx !== -1) {
      const newDigits = [...digits];
      newDigits[nextIdx] = digit;
      setDigits(newDigits);
      setErrorMsg(null);

      if (nextIdx === 3) {
        const fullPin = newDigits.join('');
        handleVerifyPin(fullPin);
      } else {
        inputRefs.current[nextIdx + 1]?.focus();
      }
    }
  };

  const handleKeypadBackspace = () => {
    if (loading) return;
    const filledIndices = digits.map((d, i) => (d !== '' ? i : -1)).filter((i) => i !== -1);
    if (filledIndices.length > 0) {
      const lastFilled = filledIndices[filledIndices.length - 1];
      const newDigits = [...digits];
      newDigits[lastFilled] = '';
      setDigits(newDigits);
      inputRefs.current[lastFilled]?.focus();
    }
  };

  const formattedAmount =
    details.currency === 'USD' ? formatUSD(details.amount) : formatNaira(details.amount);

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) onCancel();
      }}
    >
      <div
        className={`relative w-full max-w-sm max-h-[92dvh] flex flex-col overflow-y-auto rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-2xl transition-all overscroll-contain ${
          isShaking ? 'animate-[shake_0.5s_ease-in-out]' : ''
        }`}
      >
        <button
          onClick={onCancel}
          disabled={loading}
          className="absolute top-3 right-3 p-1.5 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50 z-10"
          title="Cancel Transaction"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex flex-col items-center text-center pt-1">
          {isLocked ? (
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center mb-2 animate-pulse">
              <ShieldAlert className="w-5 h-5 stroke-[2.5]" />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-xl bg-brand-orange/10 border border-brand-orange/20 text-brand-orange flex items-center justify-center mb-2">
              <Lock className="w-5 h-5 stroke-[2.5]" />
            </div>
          )}

          <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-tight">
            {isLocked ? 'Account Locked' : 'Authorize Transaction'}
          </h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            {isLocked
              ? 'Security lockout: 4 incorrect PIN attempts'
              : 'Enter your 4-digit transaction PIN to confirm'}
          </p>
        </div>

        <div className="my-2.5 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-0.5 text-center">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            {details.title || details.category || 'Transaction Payment'}
          </div>
          <div className="font-mono text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {formattedAmount}
          </div>
          {details.description && (
            <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 px-1">
              {details.description}
            </p>
          )}
        </div>

        {isLocked ? (
          <div className="space-y-3 my-3">
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-start gap-2.5 text-left">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold text-xs">Maximum 4 attempts exceeded</p>
                <p className="text-[11px] text-rose-600/90 dark:text-rose-300 leading-relaxed">
                  Your account has been locked for security. Transactions cannot proceed. Please contact ZuvaPay support to verify your identity and restore access.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onCancel}
              className="w-full py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-bold text-xs hover:opacity-90 transition-all shadow-md"
            >
              Close
            </button>
          </div>
        ) : needsSetup ? (
          <div className="space-y-2.5 my-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs flex items-center gap-2 text-left">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>You must set up your 4-digit PIN before completing transactions.</span>
            </div>
            <button
              onClick={() => {
                onCancel();
                if (onNeedSetupPin) onNeedSetupPin();
              }}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-brand-orange to-amber-500 text-slate-950 font-bold text-xs hover:from-amber-600 hover:to-orange-600 transition-all shadow-md shadow-orange-500/20 flex items-center justify-center gap-2"
            >
              <KeyRound className="w-4 h-4" />
              Set Up Transaction PIN Now
            </button>
          </div>
        ) : (
          <>
            <div className="flex justify-center gap-2.5 my-2.5">
              {digits.map((digit, idx) => (
                <div key={idx} className="relative">
                  <input
                    ref={(el) => {
                      inputRefs.current[idx] = el;
                    }}
                    type="password"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleDigitChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    onPaste={handlePaste}
                    disabled={loading}
                    className={`w-11 h-12 text-center font-mono text-xl font-bold rounded-xl border transition-all focus:outline-none ${
                      digit
                        ? 'border-brand-orange bg-brand-orange/5 text-brand-orange dark:text-white ring-2 ring-brand-orange/20'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20'
                    } ${errorMsg ? 'border-rose-500 ring-rose-500/20' : ''}`}
                  />
                  {digit && (
                    <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-brand-orange pointer-events-none" />
                  )}
                </div>
              ))}
            </div>

            {/* Visual attempt indicator & warning when attemptsRemaining < 4 */}
            {attemptsRemaining !== null && attemptsRemaining < 4 && (
              <div className="flex flex-col items-center gap-1.5 my-1.5 p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs text-center animate-in fade-in">
                <div className="flex items-center gap-1.5 font-bold">
                  <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 text-rose-500" />
                  <span>
                    {attemptsRemaining === 1
                      ? 'FINAL ATTEMPT: 1 attempt remaining'
                      : `${attemptsRemaining} of 4 attempts remaining`}
                  </span>
                </div>
                <div className="flex items-center justify-center gap-1.5 py-0.5">
                  {[1, 2, 3, 4].map((step) => {
                    const isFailed = step <= (4 - (attemptsRemaining ?? 4));
                    return (
                      <div
                        key={step}
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          isFailed
                            ? 'w-5 bg-rose-500'
                            : 'w-2 bg-slate-300 dark:bg-slate-700'
                        }`}
                      />
                    );
                  })}
                </div>
                <span className="text-[10.5px] text-rose-600 dark:text-rose-300 font-medium">
                  {errorMsg || 'Note: Your account will be locked on the 4th wrong attempt.'}
                </span>
              </div>
            )}

            {errorMsg && (attemptsRemaining === null || attemptsRemaining === 4) && (
              <div className="flex items-center justify-center gap-1.5 text-xs text-rose-500 font-medium my-1 text-center animate-in fade-in">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {loading && (
              <div className="flex items-center justify-center gap-2 text-xs text-brand-orange font-medium py-1">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Verifying secure PIN...</span>
              </div>
            )}

            <div className="grid grid-cols-3 gap-1.5 mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => handleKeypadPress(num)}
                  disabled={loading}
                  className="py-2.5 rounded-xl font-mono text-base font-bold text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 transition-all disabled:opacity-50"
                >
                  {num}
                </button>
              ))}
              <button
                type="button"
                onClick={() => {
                  setDigits(['', '', '', '']);
                  setErrorMsg(null);
                  inputRefs.current[0]?.focus();
                }}
                disabled={loading}
                className="py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white bg-slate-50 dark:bg-slate-800/30 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 transition-all"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={() => handleKeypadPress('0')}
                disabled={loading}
                className="py-2.5 rounded-xl font-mono text-base font-bold text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 transition-all disabled:opacity-50"
              >
                0
              </button>
              <button
                type="button"
                onClick={handleKeypadBackspace}
                disabled={loading}
                className="py-2.5 rounded-xl flex items-center justify-center text-slate-500 hover:text-slate-800 dark:hover:text-white bg-slate-50 dark:bg-slate-800/30 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 transition-all disabled:opacity-50"
              >
                <Delete className="w-4 h-4" />
              </button>
            </div>
          </>
        )}

        <div className="mt-2.5 pt-2 flex items-center justify-center gap-1 text-[10px] text-slate-400 border-t border-slate-100 dark:border-slate-800">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Protected by ZuvaPay 256-Bit Financial Encryption</span>
        </div>
      </div>
    </div>
  );
}
