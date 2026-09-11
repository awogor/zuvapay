'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  X,
  Copy,
  Check,
  Clock,
  CheckCircle2,
  ExternalLink,
  RefreshCw,
  Search,
  Smartphone,
  ShieldCheck,
  Ban,
  MessageSquareCode,
} from 'lucide-react';
import {
  getSmsOrders,
  updateSmsOrderStatus,
  subscribeSmsOrders,
  type SmsOrderRecord,
} from '@/lib/smsOrders';
import { formatNaira } from '@/lib/utils';
import { useToast } from '@/components/common/Toast';

interface SmsHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SmsHistoryModal({ isOpen, onClose }: SmsHistoryModalProps) {
  const router = useRouter();
  const { success, error, info } = useToast();

  const [orders, setOrders] = useState<SmsOrderRecord[]>([]);
  const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'RECEIVED' | 'REFUNDED'>('ALL');
  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [checkingId, setCheckingId] = useState<string | null>(null);
  const [now, setNow] = useState<number>(Date.now());

  // Load orders and subscribe to changes
  useEffect(() => {
    if (!isOpen) return;

    const refreshOrders = () => {
      setOrders(getSmsOrders());
      setNow(Date.now());
    };

    refreshOrders();
    const unsubscribe = subscribeSmsOrders(refreshOrders);

    // 1-second interval to tick countdown timers
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => {
      unsubscribe();
      clearInterval(timer);
    };
  }, [isOpen]);

  // Periodic background check for active orders while modal is open
  useEffect(() => {
    if (!isOpen) return;

    const activeList = orders.filter((o) => o.status === 'WAIT_CODE' && o.expiresAt > Date.now());
    if (activeList.length === 0) return;

    const pollInterval = setInterval(async () => {
      for (const ord of activeList) {
        try {
          const res = await fetch(
            `/api/services/sms?action=getStatus&orderId=${ord.orderId}&server=${ord.server}`
          );
          const data = await res.json();
          if (data.success) {
            if (data.status === 'RECEIVED' && data.code) {
              updateSmsOrderStatus(ord.orderId, { status: 'RECEIVED', otpCode: data.code });
              success(`Code Received for ${ord.service}!`, `OTP: ${data.code}`);
            } else if (data.status === 'CANCELED') {
              updateSmsOrderStatus(ord.orderId, { status: 'CANCELED' });
            }
          }
        } catch {
          // ignore background poll errors
        }
      }
    }, 6000);

    return () => clearInterval(pollInterval);
  }, [isOpen, orders, success]);

  if (!isOpen) return null;

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    success('Copied to Clipboard!', text);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleManualCheck = async (ord: SmsOrderRecord) => {
    setCheckingId(ord.orderId);
    try {
      const res = await fetch(
        `/api/services/sms?action=getStatus&orderId=${ord.orderId}&server=${ord.server}`
      );
      const data = await res.json();

      if (data.success) {
        if (data.status === 'RECEIVED' && data.code) {
          updateSmsOrderStatus(ord.orderId, { status: 'RECEIVED', otpCode: data.code });
          success('Code Received!', `Your code is ${data.code}`);
        } else if (data.status === 'CANCELED') {
          updateSmsOrderStatus(ord.orderId, { status: 'CANCELED' });
          info('Order Cancelled', 'This rental has been cancelled.');
        } else {
          info('Still Waiting', 'No code received yet. Carrier gateway is waiting for incoming SMS.');
        }
      } else {
        error('Status Check Error', data.error || 'Failed to check status');
      }
    } catch (err: any) {
      error('Network Error', err.message || 'Failed to connect');
    } finally {
      setCheckingId(null);
    }
  };

  const openOrderRoom = (orderId: string) => {
    onClose();
    router.push(`/services/sms/active?orderId=${orderId}`);
  };

  // Filtered orders
  const filteredOrders = orders.filter((o) => {
    const matchesFilter =
      filter === 'ALL'
        ? true
        : filter === 'ACTIVE'
        ? o.status === 'WAIT_CODE' && o.expiresAt > now
        : filter === 'RECEIVED'
        ? o.status === 'RECEIVED'
        : o.status === 'CANCELED' || o.status === 'EXPIRED' || (o.status === 'WAIT_CODE' && o.expiresAt <= now);

    const q = search.toLowerCase().trim();
    const matchesSearch =
      !q ||
      o.service.toLowerCase().includes(q) ||
      o.country.toLowerCase().includes(q) ||
      o.phoneNumber.includes(q) ||
      o.orderId.toLowerCase().includes(q);

    return matchesFilter && matchesSearch;
  });

  const activeCount = orders.filter((o) => o.status === 'WAIT_CODE' && o.expiresAt > now).length;
  const receivedCount = orders.filter((o) => o.status === 'RECEIVED').length;
  const refundedCount = orders.filter(
    (o) => o.status === 'CANCELED' || o.status === 'EXPIRED' || (o.status === 'WAIT_CODE' && o.expiresAt <= now)
  ).length;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-md animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl border border-slate-200 dark:border-white/15 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Top Header */}
        <div className="p-5 sm:p-6 border-b border-slate-200 dark:border-white/10 flex items-center justify-between bg-slate-50/70 dark:bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-rose-500/10 text-rose-500 border border-rose-500/20">
              <MessageSquareCode className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                SMS Numbers & Order History
                {activeCount > 0 && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    {activeCount} Active
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                View all your temporary lines, incoming OTP codes, and live rooms
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Tabs & Search */}
        <div className="p-4 sm:px-6 border-b border-slate-200 dark:border-white/10 space-y-3 bg-white dark:bg-slate-900">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={() => setFilter('ALL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filter === 'ALL'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              All ({orders.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter('ACTIVE')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                filter === 'ACTIVE'
                  ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${activeCount > 0 ? 'bg-rose-400 animate-pulse' : 'bg-slate-400'}`} />
              Active Waiting ({activeCount})
            </button>
            <button
              type="button"
              onClick={() => setFilter('RECEIVED')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filter === 'RECEIVED'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              Received ({receivedCount})
            </button>
            <button
              type="button"
              onClick={() => setFilter('REFUNDED')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filter === 'REFUNDED'
                  ? 'bg-slate-800 text-white dark:bg-slate-700'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              Refunded / Expired ({refundedCount})
            </button>
          </div>

          {/* Search bar */}
          {orders.length > 3 && (
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by phone, service, country, or order ID..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-rose-500"
              />
            </div>
          )}
        </div>

        {/* Orders List Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3.5 divide-y divide-slate-100 dark:divide-white/5">
          {filteredOrders.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                <Smartphone className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                  {search ? 'No matching SMS orders found' : 'No SMS numbers in this category'}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {search ? 'Try clearing your search terms' : 'When you rent numbers for WhatsApp, Google, etc., they appear here.'}
                </p>
              </div>
            </div>
          ) : (
            filteredOrders.map((ord) => {
              const remainingSecs = Math.max(0, Math.floor((ord.expiresAt - now) / 1000));
              const isExpired = remainingSecs <= 0 && ord.status === 'WAIT_CODE';
              const isActive = ord.status === 'WAIT_CODE' && remainingSecs > 0;
              const isReceived = ord.status === 'RECEIVED';
              const isCanceled = ord.status === 'CANCELED';

              const mins = Math.floor(remainingSecs / 60);
              const secs = remainingSecs % 60;
              const formattedCountdown = `${mins}m ${secs < 10 ? '0' : ''}${secs}s`;

              return (
                <div
                  key={ord.orderId}
                  className="pt-3.5 first:pt-0 rounded-2xl bg-slate-50 dark:bg-slate-950/60 p-4 border border-slate-200 dark:border-white/10 space-y-3 transition-all hover:border-slate-300 dark:hover:border-white/20"
                >
                  {/* Top line: Service + Status */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg leading-none">{ord.countryFlag || '🌐'}</span>
                      <div>
                        <span className="text-xs font-black text-slate-900 dark:text-white">
                          {ord.service}
                        </span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 ml-1.5">
                          ({ord.country})
                        </span>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-md font-semibold bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        {ord.server === 'server2' ? 'Server 2' : 'Server 1'}
                      </span>
                    </div>

                    {/* Status Pill */}
                    <div>
                      {isActive && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                          Waiting for SMS ({formattedCountdown})
                        </span>
                      )}
                      {isReceived && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Code Received
                        </span>
                      )}
                      {isCanceled && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                          <Ban className="w-3.5 h-3.5" />
                          Cancelled & Refunded
                        </span>
                      )}
                      {isExpired && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                          <Clock className="w-3.5 h-3.5" />
                          Expired (15m elapsed)
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Phone Number Display */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5">
                    <div className="flex items-center gap-2">
                      <Smartphone className="w-4 h-4 text-rose-500 shrink-0" />
                      <span className="font-mono text-sm sm:text-base font-bold text-slate-900 dark:text-white tracking-wide">
                        {ord.phoneNumber}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => copyText(ord.phoneNumber, `phone-${ord.orderId}`)}
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
                    >
                      {copiedId === `phone-${ord.orderId}` ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Number</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* OTP Code Display if Received */}
                  {isReceived && ord.otpCode && (
                    <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between gap-3">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-400 tracking-wider">
                          Verification OTP Code
                        </span>
                        <p className="font-mono text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-300 tracking-widest">
                          {ord.otpCode}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => copyText(ord.otpCode!, `otp-${ord.orderId}`)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 transition-all"
                      >
                        {copiedId === `otp-${ord.orderId}` ? (
                          <>
                            <Check className="w-4 h-4" />
                            <span>Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" />
                            <span>Copy OTP</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {/* Bottom details & Actions */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px] text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-3">
                      <span>Cost: {formatNaira(ord.cost)}</span>
                      <span>•</span>
                      <span>Order: {ord.orderId.slice(0, 16)}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {isActive && (
                        <button
                          type="button"
                          disabled={checkingId === ord.orderId}
                          onClick={() => handleManualCheck(ord)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300 transition-colors disabled:opacity-50"
                        >
                          <RefreshCw className={`w-3 h-3 ${checkingId === ord.orderId ? 'animate-spin' : ''}`} />
                          <span>Check</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => openOrderRoom(ord.orderId)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/20 text-xs font-bold transition-colors"
                      >
                        <span>{isActive ? 'Open Live OTP Room' : 'View Full Details'}</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:px-6 border-t border-slate-200 dark:border-white/10 flex items-center justify-between bg-slate-50/70 dark:bg-slate-950/50 text-xs">
          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Automated Warranty: 100% full refund if no code arrives</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
