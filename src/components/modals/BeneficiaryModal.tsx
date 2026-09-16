'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  X,
  Trash2,
  Clock,
  Check,
  Smartphone,
  ShieldCheck,
  Loader2,
  ArrowRight,
} from 'lucide-react';
import { BeneficiaryItem } from '@/app/api/user/beneficiaries/route';

interface BeneficiaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (beneficiary: { phone: string; network: string }) => void;
  serviceType?: 'airtime' | 'data';
}

function getNetworkBadgeStyle(network: string) {
  const norm = (network || '').toLowerCase();
  if (norm.includes('mtn')) {
    return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
  }
  if (norm.includes('airtel')) {
    return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20';
  }
  if (norm.includes('glo')) {
    return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
  }
  if (norm.includes('9mobile') || norm.includes('etisalat')) {
    return 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20';
  }
  return 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20';
}

function formatPhoneDisplay(phone: string) {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 11) {
    return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
  }
  return phone;
}

function getDaysRemaining(lastUsedIso: string) {
  const lastUsed = new Date(lastUsedIso).getTime();
  const diffMs = 30 * 24 * 60 * 60 * 1000 - (Date.now() - lastUsed);
  const days = Math.max(1, Math.ceil(diffMs / (24 * 60 * 60 * 1000)));
  return days;
}

function formatRelativeTime(lastUsedIso: string) {
  const now = Date.now();
  const last = new Date(lastUsedIso).getTime();
  const diffHours = Math.floor((now - last) / (1000 * 60 * 60));
  if (diffHours < 1) return 'Just now';
  if (diffHours < 24) return `${diffHours} hr${diffHours > 1 ? 's' : ''} ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return 'Yesterday';
  return `${diffDays} days ago`;
}

export function BeneficiaryModal({
  isOpen,
  onClose,
  onSelect,
  serviceType = 'airtime',
}: BeneficiaryModalProps) {
  const [beneficiaries, setBeneficiaries] = useState<BeneficiaryItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      setLoading(true);
      fetch(`/api/user/beneficiaries?service_type=${serviceType}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.success && Array.isArray(data.beneficiaries)) {
            setBeneficiaries(data.beneficiaries);
          }
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [isOpen, serviceType]);

  if (!isOpen) return null;

  const handleDelete = async (e: React.MouseEvent, item: BeneficiaryItem) => {
    e.stopPropagation();
    const targetId = item.id || item.phone;
    setDeletingId(targetId);

    try {
      const res = await fetch('/api/user/beneficiaries', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: item.id, phone: item.phone }),
      });
      if (res.ok) {
        setBeneficiaries((prev) =>
          prev.filter((b) => (item.id ? b.id !== item.id : b.phone !== item.phone))
        );
      }
    } catch {
      // Ignored
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = beneficiaries.filter((b) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    const cleanQ = q.replace(/\D/g, '');
    const cleanPhone = b.phone.replace(/\D/g, '');
    return (
      (cleanQ.length > 0 && cleanPhone.includes(cleanQ)) ||
      b.phone.toLowerCase().includes(q) ||
      b.network.toLowerCase().includes(q) ||
      (b.nickname && b.nickname.toLowerCase().includes(q))
    );
  });

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-md max-h-[85dvh] flex flex-col rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-brand-orange/10 border border-brand-orange/20 text-brand-orange flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                Saved Beneficiaries
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Auto-saved from your recent purchases (30-day retention)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search Input */}
        <div className="p-3 sm:p-4 border-b border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-950/40">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by phone number or network..."
              className="w-full pl-9 pr-8 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-brand-orange"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Content List */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2 overscroll-contain">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-400 text-xs">
              <Loader2 className="w-5 h-5 animate-spin text-brand-orange" />
              <span>Loading saved numbers...</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-10 px-4 text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                <Smartphone className="w-6 h-6" />
              </div>
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                {searchQuery ? 'No matching beneficiaries' : 'No beneficiaries saved yet'}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                {searchQuery
                  ? 'Try searching with a different phone number.'
                  : 'Whenever you purchase airtime or data, the recipient number will be automatically saved here for 30 days.'}
              </p>
            </div>
          ) : (
            filtered.map((item) => {
              const daysLeft = getDaysRemaining(item.last_used_at);
              const relativeUsed = formatRelativeTime(item.last_used_at);
              const isDeleting = deletingId === (item.id || item.phone);

              return (
                <div
                  key={item.id || item.phone}
                  onClick={() => {
                    onSelect({ phone: item.phone, network: item.network });
                    onClose();
                  }}
                  className="group flex items-center justify-between p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-brand-orange/40 hover:bg-brand-orange/5 dark:hover:bg-brand-orange/5 transition-all cursor-pointer shadow-sm"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider border flex-shrink-0 ${getNetworkBadgeStyle(
                        item.network
                      )}`}
                    >
                      {item.network}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-bold text-slate-900 dark:text-white tracking-wide">
                          {formatPhoneDisplay(item.phone)}
                        </span>
                        {item.nickname && (
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate font-medium">
                            ({item.nickname})
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {relativeUsed}
                        </span>
                        <span>•</span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                          Saved for {daysLeft} more day{daysLeft > 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={(e) => handleDelete(e, item)}
                      disabled={isDeleting}
                      title="Remove Beneficiary"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                    >
                      {isDeleting ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <div className="p-1.5 text-brand-orange opacity-0 group-hover:opacity-100 transition-opacity">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            Auto-expires after 30 days of inactivity
          </span>
          <button
            onClick={onClose}
            className="text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-brand-orange"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
