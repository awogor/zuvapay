'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Copy,
  Check,
  Clock,
  CheckCircle2,
  ExternalLink,
  RefreshCw,
  Search,
  Share2,
  AlertCircle,
  TrendingUp,
  Ban,
  Radio,
} from 'lucide-react';
import {
  getSocialOrders,
  updateSocialOrderStatus,
  subscribeSocialOrders,
  type SocialOrderRecord,
  type SocialPlatform,
} from '@/lib/socialOrders';
import { formatNaira, formatDate } from '@/lib/utils';
import { useToast } from '@/components/common/Toast';

interface SocialOrdersModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultPlatform?: string;
}

export default function SocialOrdersModal({
  isOpen,
  onClose,
  defaultPlatform,
}: SocialOrdersModalProps) {
  const { success, error, info } = useToast();

  const [orders, setOrders] = useState<SocialOrderRecord[]>([]);
  const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'COMPLETED' | 'OTHER'>('ALL');
  const [platformFilter, setPlatformFilter] = useState<string>(defaultPlatform || 'ALL');
  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [checkingId, setCheckingId] = useState<string | number | null>(null);
  const [refreshingAll, setRefreshingAll] = useState(false);

  // Sync orders from storage
  useEffect(() => {
    if (!isOpen) return;

    const refresh = () => setOrders(getSocialOrders());
    refresh();
    const unsub = subscribeSocialOrders(refresh);

    return () => unsub();
  }, [isOpen]);

  // Periodic polling for active orders while modal is open
  useEffect(() => {
    if (!isOpen) return;

    const activeList = orders.filter(
      (o) => o.status === 'Pending' || o.status === 'In progress' || o.status === 'Processing'
    );
    if (activeList.length === 0) return;

    const pollInterval = setInterval(async () => {
      for (const ord of activeList.slice(0, 5)) {
        try {
          const res = await fetch(`/api/services/social?action=status&orderId=${ord.orderId}`);
          const data = await res.json();
          if (data.success && data.status) {
            const raw = data.status;
            const newStatus = raw.status || ord.status;
            if (newStatus !== ord.status || raw.remains !== undefined) {
              updateSocialOrderStatus(ord.orderId, {
                status: newStatus,
                startCount: raw.start_count,
                remains: raw.remains,
                charge: raw.charge,
              });
              if (newStatus === 'Completed' && ord.status !== 'Completed') {
                success('Boost Completed!', `${ord.serviceName} has finished delivery.`);
              }
            }
          }
        } catch {
          // ignore
        }
      }
    }, 8000);

    return () => clearInterval(pollInterval);
  }, [isOpen, orders, success]);

  if (!isOpen) return null;

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    success('Copied!', 'Link copied to clipboard');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCheckStatus = async (ord: SocialOrderRecord) => {
    setCheckingId(ord.orderId);
    try {
      const res = await fetch(`/api/services/social?action=status&orderId=${ord.orderId}`);
      const data = await res.json();

      if (data.success && data.status) {
        const raw = data.status;
        const updated = updateSocialOrderStatus(ord.orderId, {
          status: raw.status || ord.status,
          startCount: raw.start_count,
          remains: raw.remains,
          charge: raw.charge,
        });

        const statusLabel = raw.status || 'Updated';
        success(`Status: ${statusLabel}`, `Order #${ord.orderId} is currently ${statusLabel}.`);
      } else {
        error('Check Error', data.error || 'Could not retrieve latest status.');
      }
    } catch (err: any) {
      error('Network Error', err.message || 'Failed to ping provider');
    } finally {
      setCheckingId(null);
    }
  };

  const handleRefreshAll = async () => {
    const active = orders.filter(
      (o) => o.status === 'Pending' || o.status === 'In progress' || o.status === 'Processing'
    );
    if (active.length === 0) {
      info('All Caught Up', 'No active or pending orders in delivery queue.');
      return;
    }

    setRefreshingAll(true);
    let updatedCount = 0;

    try {
      for (const ord of active) {
        const res = await fetch(`/api/services/social?action=status&orderId=${ord.orderId}`);
        const data = await res.json();
        if (data.success && data.status) {
          updateSocialOrderStatus(ord.orderId, {
            status: data.status.status || ord.status,
            startCount: data.status.start_count,
            remains: data.status.remains,
            charge: data.status.charge,
          });
          updatedCount++;
        }
      }
      success('Status Synced', `Refreshed ${updatedCount} active order(s).`);
    } catch {
      error('Refresh Incomplete', 'Could not refresh all orders.');
    } finally {
      setRefreshingAll(false);
    }
  };

  // Filter orders
  const filteredOrders = orders.filter((ord) => {
    const isAct = ord.status === 'Pending' || ord.status === 'In progress' || ord.status === 'Processing';
    const isComp = ord.status === 'Completed';
    const isOther = ord.status === 'Partial' || ord.status === 'Canceled';

    const matchesStatus =
      filter === 'ALL'
        ? true
        : filter === 'ACTIVE'
        ? isAct
        : filter === 'COMPLETED'
        ? isComp
        : isOther;

    const matchesPlatform =
      platformFilter === 'ALL' ? true : ord.platform === platformFilter.toLowerCase();

    const q = search.toLowerCase().trim();
    const matchesSearch =
      !q ||
      ord.serviceName.toLowerCase().includes(q) ||
      ord.link.toLowerCase().includes(q) ||
      String(ord.orderId).includes(q) ||
      ord.platform.includes(q);

    return matchesStatus && matchesPlatform && matchesSearch;
  });

  const activeCount = orders.filter(
    (o) => o.status === 'Pending' || o.status === 'In progress' || o.status === 'Processing'
  ).length;
  const completedCount = orders.filter((o) => o.status === 'Completed').length;
  const otherCount = orders.filter((o) => o.status === 'Partial' || o.status === 'Canceled').length;

  const platformBadge = (plat: SocialPlatform) => {
    switch (plat) {
      case 'youtube':
        return { label: 'YouTube', color: 'bg-red-500/10 text-red-600 border-red-500/20' };
      case 'instagram':
        return { label: 'Instagram', color: 'bg-rose-500/10 text-rose-600 border-rose-500/20' };
      case 'tiktok':
        return { label: 'TikTok', color: 'bg-slate-900/10 dark:bg-white/10 text-slate-900 dark:text-white border-slate-300 dark:border-white/20' };
      case 'facebook':
        return { label: 'Facebook', color: 'bg-blue-500/10 text-blue-600 border-blue-500/20' };
      case 'twitter':
        return { label: 'Twitter / X', color: 'bg-sky-500/10 text-sky-600 border-sky-500/20' };
      case 'telegram':
        return { label: 'Telegram', color: 'bg-cyan-500/10 text-cyan-600 border-cyan-500/20' };
      default:
        return { label: plat, color: 'bg-slate-100 text-slate-600 border-slate-200' };
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-md animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col rounded-3xl border border-slate-200 dark:border-white/15 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Top Header */}
        <div className="p-5 sm:p-6 border-b border-slate-200 dark:border-white/10 flex items-center justify-between bg-slate-50/70 dark:bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-brand-orange/10 text-brand-orange border border-brand-orange/20">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                Social Boost Live Tracker
                {activeCount > 0 && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                    {activeCount} In Delivery
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Real-time MomoPanel carrier updates for Followers, Likes, Views & Comments
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleRefreshAll}
              disabled={refreshingAll || activeCount === 0}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-white/10 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors disabled:opacity-40"
              title="Refresh all active deliveries"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshingAll ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh All</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter Tabs & Search */}
        <div className="p-4 sm:px-6 border-b border-slate-200 dark:border-white/10 space-y-3 bg-white dark:bg-slate-900">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-1.5">
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
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${activeCount > 0 ? 'bg-blue-400 animate-pulse' : 'bg-slate-400'}`} />
                Active / Delivering ({activeCount})
              </button>
              <button
                type="button"
                onClick={() => setFilter('COMPLETED')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  filter === 'COMPLETED'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                }`}
              >
                Completed ({completedCount})
              </button>
              <button
                type="button"
                onClick={() => setFilter('OTHER')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  filter === 'OTHER'
                    ? 'bg-slate-800 text-white dark:bg-slate-700'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                }`}
              >
                Partial / Canceled ({otherCount})
              </button>
            </div>

            {/* Platform dropdown selector */}
            <select
              value={platformFilter}
              onChange={(e) => setPlatformFilter(e.target.value)}
              className="text-xs px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 font-semibold focus:outline-none"
            >
              <option value="ALL">All Platforms</option>
              <option value="youtube">YouTube</option>
              <option value="instagram">Instagram</option>
              <option value="tiktok">TikTok</option>
              <option value="facebook">Facebook</option>
              <option value="twitter">Twitter / X</option>
              <option value="telegram">Telegram</option>
            </select>
          </div>

          {/* Search bar */}
          {orders.length > 2 && (
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by username/link, package name, or Order ID..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-brand-orange"
              />
            </div>
          )}
        </div>

        {/* Orders List Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 divide-y divide-slate-100 dark:divide-white/5">
          {filteredOrders.length === 0 ? (
            <div className="py-14 text-center space-y-3">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                <Share2 className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                  {search ? 'No matching social boost orders found' : 'No orders in this category'}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {search ? 'Try clearing your search query' : 'When you order Followers, Views, or Likes, they will appear here in real time.'}
                </p>
              </div>
            </div>
          ) : (
            filteredOrders.map((ord) => {
              const badge = platformBadge(ord.platform);
              const isPending = ord.status === 'Pending';
              const isInProgress = ord.status === 'In progress' || ord.status === 'Processing';
              const isCompleted = ord.status === 'Completed';
              const isPartial = ord.status === 'Partial';
              const isCanceled = ord.status === 'Canceled';

              // Delivery calculation
              const remainsNum = ord.remains !== undefined ? Number(ord.remains) : null;
              const delivered =
                remainsNum !== null && !isNaN(remainsNum)
                  ? Math.max(0, ord.quantity - remainsNum)
                  : isCompleted
                  ? ord.quantity
                  : 0;

              const percent = Math.min(100, Math.round((delivered / ord.quantity) * 100));

              return (
                <div
                  key={ord.orderId + ord.reference}
                  className="pt-4 first:pt-0 rounded-2xl bg-slate-50 dark:bg-slate-950/60 p-4 sm:p-5 border border-slate-200 dark:border-white/10 space-y-3.5 transition-all hover:border-slate-300 dark:hover:border-white/20"
                >
                  {/* Top Bar: Platform, Package, and Status Pill */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border uppercase tracking-wider ${badge.color}`}>
                        {badge.label}
                      </span>
                      <span className="text-xs font-black text-slate-900 dark:text-white line-clamp-1">
                        {ord.serviceName}
                      </span>
                    </div>

                    {/* Status Pill */}
                    <div>
                      {isPending && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                          <Clock className="w-3.5 h-3.5" />
                          Pending in Queue
                        </span>
                      )}
                      {isInProgress && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                          Delivering ({percent}%)
                        </span>
                      )}
                      {isCompleted && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Completed
                        </span>
                      )}
                      {isPartial && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                          <AlertCircle className="w-3.5 h-3.5" />
                          Partial (Remains: {ord.remains})
                        </span>
                      )}
                      {isCanceled && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                          <Ban className="w-3.5 h-3.5" />
                          Canceled & Refunded
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Target Link & Quantity Display */}
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <div className="space-y-0.5 min-w-0 flex-1 mr-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Target Destination / Link
                      </span>
                      <p className="text-xs font-mono font-medium text-slate-800 dark:text-slate-200 break-all line-clamp-1">
                        {ord.link}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        Qty: {ord.quantity.toLocaleString()}
                      </span>
                      <button
                        type="button"
                        onClick={() => copyText(ord.link, `link-${ord.orderId}`)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-slate-700 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 transition-colors"
                        title="Copy link"
                      >
                        {copiedId === `link-${ord.orderId}` ? (
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                      <a
                        href={ord.link.startsWith('http') ? ord.link : `https://${ord.link}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded-lg text-slate-500 hover:text-slate-700 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 transition-colors"
                        title="Open external link"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>

                  {/* Delivery Progress Bar (For in-progress, completed, and partial orders) */}
                  {(isInProgress || isCompleted || isPartial) && (
                    <div className="space-y-1.5 pt-0.5">
                      <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-1.5">
                          <span>Progress:</span>
                          <span className="text-slate-900 dark:text-white font-bold">
                            {delivered.toLocaleString()} / {ord.quantity.toLocaleString()} delivered
                          </span>
                          {ord.startCount !== undefined && ord.startCount !== null && (
                            <span className="text-slate-400 font-normal">
                              (Start Count: {ord.startCount})
                            </span>
                          )}
                        </span>
                        <span className="font-mono text-slate-800 dark:text-slate-200 font-bold">
                          {percent}%
                        </span>
                      </div>

                      <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isCompleted
                              ? 'bg-emerald-500'
                              : isPartial
                              ? 'bg-purple-500'
                              : 'bg-gradient-to-r from-blue-500 to-cyan-500'
                          }`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Footer Line: Price, Order ID, and Live Check Button */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px] text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-2.5">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        Paid: {formatNaira(ord.price)}
                      </span>
                      <span>•</span>
                      <span>Momo Order #{ord.orderId}</span>
                      <span>•</span>
                      <span>{formatDate(new Date(ord.createdAt))}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={checkingId === ord.orderId}
                        onClick={() => handleCheckStatus(ord)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300 transition-colors disabled:opacity-50"
                      >
                        <RefreshCw className={`w-3 h-3 ${checkingId === ord.orderId ? 'animate-spin' : ''}`} />
                        <span>Check Live Status</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Bottom Bar */}
        <div className="p-4 sm:px-6 border-t border-slate-200 dark:border-white/10 flex items-center justify-between bg-slate-50/70 dark:bg-slate-950/50 text-xs">
          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
            <Radio className="w-3.5 h-3.5 text-emerald-500 shrink-0 animate-pulse" />
            <span>Connected to Live SMM Dispatch • Auto-sync active</span>
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
