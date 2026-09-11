'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useWallet } from '@/context/WalletContext';
import { useToast } from '@/components/common/Toast';
import { formatNaira } from '@/lib/utils';
import {
  MessageSquareCode,
  Clock,
  Copy,
  Check,
  Ban,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  Smartphone,
  ArrowLeft,
  RefreshCw,
  HelpCircle,
  History,
} from 'lucide-react';
import Link from 'next/link';
import { useSupport } from '@/components/modals/SupportModal';
import SmsHistoryModal from '@/components/modals/SmsHistoryModal';
import {
  getSmsOrderById,
  updateSmsOrderStatus,
  saveSmsOrder,
  type SmsOrderRecord,
} from '@/lib/smsOrders';

function ActiveOtpContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get('orderId');

  const { refundBill } = useWallet();
  const { success, error, info } = useToast();
  const { openSupport } = useSupport();

  const [order, setOrder] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState<number>(15 * 60); // 15 minutes in seconds
  const [otpCode, setOtpCode] = useState<string | null>(null);
  const [status, setStatus] = useState<'WAIT_CODE' | 'RECEIVED' | 'CANCELED' | 'EXPIRED'>('WAIT_CODE');
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [copiedOtp, setCopiedOtp] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const hasRefundedRef = useRef(false);

  // Load order data from centralized history or session/local storage
  useEffect(() => {
    if (orderId) {
      const rec = getSmsOrderById(orderId);
      if (rec) {
        setOrder(rec);
        if (rec.otpCode) setOtpCode(rec.otpCode);
        if (rec.status) {
          setStatus(rec.status);
          if (rec.status === 'EXPIRED' || rec.status === 'CANCELED' || rec.status === 'RECEIVED') {
            hasRefundedRef.current = true;
          }
        }
        const remainingSecs = Math.max(0, Math.floor((rec.expiresAt - Date.now()) / 1000));
        setTimeLeft(remainingSecs);
        if (remainingSecs === 0) {
          hasRefundedRef.current = true;
        }
        return;
      }

      let saved = sessionStorage.getItem(`korrectpay_active_sms_${orderId}`);
      if (!saved) {
        saved = localStorage.getItem(`korrectpay_active_sms_${orderId}`);
      }

      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setOrder(parsed);
          if (parsed.otpCode) setOtpCode(parsed.otpCode);
          if (parsed.status) {
            setStatus(parsed.status);
            if (parsed.status === 'EXPIRED' || parsed.status === 'CANCELED' || parsed.status === 'RECEIVED') {
              hasRefundedRef.current = true;
            }
          }
          const remainingSecs = Math.max(0, Math.floor((parsed.expiresAt - Date.now()) / 1000));
          setTimeLeft(remainingSecs);
          if (remainingSecs === 0) {
            hasRefundedRef.current = true;
          }
        } catch {
          // ignore
        }
      } else {
        // Fallback demo order if directly navigated
        const fallback = {
          orderId,
          phoneNumber: '+14155552671',
          country: 'United States',
          service: 'WhatsApp',
          cost: 1620,
          expiresAt: Date.now() + 15 * 60 * 1000,
          reference: 'KP-SMS-ACTIVE',
        };
        setOrder(fallback);
      }
    }
  }, [orderId]);

  // 1-Second Countdown Timer (pure updater, no external side-effects)
  useEffect(() => {
    if (status !== 'WAIT_CODE') return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [status]);

  // Automated Refund on Timeout (Runs safely inside useEffect after render commit)
  useEffect(() => {
    if (timeLeft <= 0 && status === 'WAIT_CODE' && order && !hasRefundedRef.current) {
      hasRefundedRef.current = true;
      setStatus('EXPIRED');
      updateSmsOrderStatus(order.orderId, { status: 'EXPIRED' });

      (async () => {
        info('15-Minute Timeout Reached', 'Number expired without receiving code. Crediting full refund to wallet...');
        try {
          await refundBill({
            amount: order.cost,
            title: `SMS Rental Timeout (${order.phoneNumber})`,
            reason: 'No SMS received within 15 minutes window',
            originalReference: order.reference,
          });
          success('Refund Credited', `Refunded ${formatNaira(order.cost)} to your NGN wallet.`);
        } catch (e) {
          console.error('Timeout refund error:', e);
        }
      })();
    }
  }, [timeLeft, status, order, info, refundBill, success]);

  // Auto-poll SMS status every 3 seconds
  useEffect(() => {
    if (!orderId || status === 'RECEIVED' || status === 'CANCELED' || status === 'EXPIRED') {
      return;
    }

    const pollInterval = setInterval(async () => {
      try {
        const serverQuery = order?.server ? `&server=${order.server}` : '';
        const res = await fetch(`/api/services/sms?action=getStatus&orderId=${orderId}${serverQuery}`);
        const data = await res.json();

        if (data.success) {
          if (data.status === 'RECEIVED' && data.code) {
            setOtpCode(data.code);
            setStatus('RECEIVED');
            updateSmsOrderStatus(orderId, { status: 'RECEIVED', otpCode: data.code });
            success('OTP Code Received!', `Your verification code is ${data.code}`);
            clearInterval(pollInterval);
          } else if (data.status === 'CANCELED') {
            setStatus('CANCELED');
            updateSmsOrderStatus(orderId, { status: 'CANCELED' });
            clearInterval(pollInterval);
          }
        }
      } catch (err) {
        console.warn('Polling error:', err);
      }
    }, 3000);

    return () => clearInterval(pollInterval);
  }, [orderId, status, order?.server, success]);

  // Manual User Cancellation with Instant Refund
  const handleCancelAndRefund = async () => {
    if (!order) return;
    if (status === 'RECEIVED') {
      error('Cannot Cancel', 'An OTP code was already received on this number.');
      return;
    }

    setCancelling(true);
    try {
      // 1. Tell provider to release number
      await fetch('/api/services/sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'cancel',
          orderId: order.orderId,
          server: order.server || 'server1',
        }),
      });

      // 2. Automated Refund
      await refundBill({
        amount: order.cost,
        title: `SMS Rental Cancelled (${order.phoneNumber})`,
        reason: 'User cancelled before receiving code',
        originalReference: order.reference,
      });

      setStatus('CANCELED');
      updateSmsOrderStatus(order.orderId, { status: 'CANCELED' });
      success('Cancelled & Refunded', `${formatNaira(order.cost)} has been returned to your wallet.`);
      setTimeout(() => {
        router.push('/services/sms');
      }, 1500);
    } catch (err: any) {
      error('Cancel Error', err.message || 'Failed to cancel rental');
    } finally {
      setCancelling(false);
    }
  };

  const copyPhone = () => {
    if (order?.phoneNumber) {
      navigator.clipboard.writeText(order.phoneNumber);
      setCopiedPhone(true);
      success('Copied!', 'Phone number copied to clipboard');
      setTimeout(() => setCopiedPhone(false), 2000);
    }
  };

  const copyOtp = () => {
    if (otpCode) {
      navigator.clipboard.writeText(otpCode);
      setCopiedOtp(true);
      success('Copied!', 'Verification code copied to clipboard');
      setTimeout(() => setCopiedOtp(false), 2000);
    }
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-500 border border-rose-500/20">
            <MessageSquareCode className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white">
              Active SMS Waiting Room
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Live automated polling for your verification code
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsHistoryOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-white/10 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
          >
            <History className="w-3.5 h-3.5 text-rose-500" />
            <span>Orders & History</span>
          </button>
          <button
            type="button"
            onClick={() =>
              openSupport({
                service: `${order?.country || 'Country'} - ${order?.service || 'Service'} (Active Line)`,
                reference: order?.reference,
                issue: `Awaiting OTP for number ${order?.phoneNumber || 'allocated line'}.`,
              })
            }
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 transition-colors"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            Support
          </button>
          <Link
            href="/services/sms"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-white/10 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Rent Another
          </Link>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/90 p-6 md:p-8 backdrop-blur-xl shadow-xl space-y-6">
        {/* Allocated Phone Number Card */}
        <div className="p-5 md:p-6 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-white/10 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-rose-500" />
              <span className="text-slate-600 dark:text-slate-400 uppercase tracking-wider font-bold">
                Target Service: <span className="text-slate-900 dark:text-white">{order?.service || 'Online App'}</span> ({order?.country || 'Destination'})
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-600 dark:text-slate-400 font-semibold text-[11px] bg-slate-200 dark:bg-white/10 px-2 py-0.5 rounded-md border border-slate-300 dark:border-white/10">
                {order?.server === 'server2' ? 'Server 2' : 'Server 1'}
              </span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1.5 text-[11px] bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Online & Ready
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
            <span className="font-mono text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-wider select-all">
              {order?.phoneNumber || 'Loading number...'}
            </span>
            <button
              type="button"
              onClick={copyPhone}
              className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
                copiedPhone
                  ? 'bg-emerald-500 text-white'
                  : 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/20'
              }`}
            >
              {copiedPhone ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copiedPhone ? 'Copied Number!' : 'Copy Phone Number'}
            </button>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Paste this number into <strong>{order?.service || 'your app'}</strong>. Once the verification SMS is sent, the code will appear below automatically.
          </p>
        </div>

        {/* OTP Arrived Screen or Live Polling Timer */}
        {status === 'RECEIVED' && otpCode ? (
          <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/90 dark:to-slate-900 border-2 border-emerald-500 shadow-2xl space-y-4 text-center animate-in zoom-in-95">
            <div className="inline-flex p-3.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <p className="text-xs uppercase font-extrabold text-emerald-700 dark:text-emerald-400 tracking-wider">
                SMS Verification Code Received!
              </p>
              <h2 className="font-mono text-4xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-widest my-3 select-all">
                {otpCode}
              </h2>
            </div>
            <button
              type="button"
              onClick={copyOtp}
              className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-black text-sm transition-all shadow-lg ${
                copiedOtp
                  ? 'bg-emerald-600 text-white'
                  : 'bg-emerald-500 hover:bg-emerald-600 text-slate-950 shadow-emerald-500/30'
              }`}
            >
              {copiedOtp ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copiedOtp ? 'Copied to Clipboard!' : 'Copy OTP Code'}
            </button>
          </div>
        ) : status === 'CANCELED' ? (
          <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-950/90 border border-slate-200 dark:border-white/5 text-center space-y-2">
            <Ban className="w-8 h-8 text-rose-500 mx-auto" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Order Cancelled</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Your wallet balance has been refunded in full ({formatNaira(order?.cost || 0)}).
            </p>
          </div>
        ) : (
          <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-950/90 border border-slate-200 dark:border-white/5 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 font-semibold">
                <Clock className="w-4 h-4 text-amber-500 animate-pulse" />
                <span>Time Remaining for SMS Arrival:</span>
              </div>
              <span className="font-mono text-xl font-black text-amber-600 dark:text-amber-400">
                {formattedTime}
              </span>
            </div>

            {/* Pulsing live radar waiting status */}
            <div className="py-6 flex flex-col items-center justify-center text-center space-y-3 bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-200/60 dark:border-white/5">
              <div className="relative">
                <div className="w-14 h-14 rounded-full border-2 border-rose-500/30 border-t-rose-500 animate-spin" />
                <Sparkles className="w-6 h-6 text-rose-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white flex items-center justify-center gap-2">
                  <span>Awaiting SMS verification code...</span>
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center justify-center gap-1.5">
                  <RefreshCw className="w-3 h-3 animate-spin text-rose-500" />
                  <span>Auto-checking gateway every 3 seconds</span>
                </p>
              </div>
            </div>

            {/* Action Buttons: Cancel & Contact Support */}
            <div className="pt-2 border-t border-slate-200 dark:border-white/5 flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                onClick={handleCancelAndRefund}
                disabled={cancelling}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-300 font-bold text-xs transition-colors"
              >
                <Ban className="w-4 h-4" />
                {cancelling ? 'Reversing Transaction...' : 'Cancel Number & Refund'}
              </button>
              <button
                type="button"
                onClick={() =>
                  openSupport({
                    service: `${order?.country || 'Country'} - ${order?.service || 'Service'}`,
                    reference: order?.reference,
                    issue: `Code delayed for active number: ${order?.phoneNumber}`,
                  })
                }
                className="sm:w-auto px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300 font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <HelpCircle className="w-4 h-4 text-brand-orange" />
                <span>Need Help?</span>
              </button>
            </div>
          </div>
        )}

        <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-white/5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400 flex-shrink-0" />
          <span>Automated Refund Guarantee: You are never charged if a code does not arrive</span>
        </div>
      </div>

      {/* SMS Orders & History Modal */}
      <SmsHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
      />
    </div>
  );
}

export default function ActiveOtpPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400">Loading Active OTP Room...</div>}>
      <ActiveOtpContent />
    </Suspense>
  );
}
