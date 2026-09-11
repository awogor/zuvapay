'use client';

import React, { useState, useEffect, useMemo, useDeferredValue } from 'react';
import {
  X,
  Search,
  Check,
  RotateCcw,
  Sliders,
  Activity,
  DollarSign,
  Sparkles,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { formatNaira } from '@/lib/utils';
import { useToast } from '@/components/common/Toast';

interface MomoPricingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ITEMS_PER_PAGE = 50;

export function MomoPricingModal({ isOpen, onClose }: MomoPricingModalProps) {
  const { success, error, info } = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savingFx, setSavingFx] = useState(false);

  const [services, setServices] = useState<any[]>([]);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const deferredSearch = useDeferredValue(searchQuery);
  const [selectedPlatform, setSelectedPlatform] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);

  // Exchange rate state
  const [fxRate, setFxRate] = useState<string>('1650');

  // Global Margin Rule inputs
  const [marginType, setMarginType] = useState<'percent' | 'fixed'>('percent');
  const [marginVal, setMarginVal] = useState<string>('45');

  // Inline editing state: mapping serviceId -> edited price string
  const [editingOverrides, setEditingOverrides] = useState<Record<string, string>>({});
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchMomoPricing = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/pricing?provider=momo');
      const data = await res.json();
      if (data.success) {
        setServices(data.momo?.services || []);
        if (data.momo?.usdToNgnRate) {
          setFxRate(String(data.momo.usdToNgnRate));
        }

        const activeRule = data.config?.momo?.globalRule;
        if (activeRule) {
          const normalized = activeRule.type === 'percentage' || activeRule.type === 'percent' ? 'percent' : 'fixed';
          setMarginType(normalized);
          setMarginVal(String(activeRule.value));
        }
      } else {
        error('Failed to load', data.error || 'Could not fetch MomoPanel pricing');
      }
    } catch (err: any) {
      error('Network Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchMomoPricing();
    }
  }, [isOpen]);

  // Reset pagination when filter or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [deferredSearch, selectedPlatform]);

  if (!isOpen) return null;

  // Handle Global Margin Save
  const handleSaveGlobalRule = async () => {
    const val = parseFloat(marginVal);
    if (isNaN(val) || val < 0) {
      error('Invalid Margin', 'Please enter a valid non-negative number');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/admin/pricing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'set_global_rule',
          provider: 'momo',
          rule: {
            type: marginType,
            value: val,
          },
        }),
      });

      const resData = await res.json();
      if (resData.success) {
        success('Margin Updated', 'Global MomoPanel retail margin rule saved successfully!');
        fetchMomoPricing();
      } else {
        error('Update Failed', resData.error || 'Could not save margin');
      }
    } catch (err: any) {
      error('Error', err.message);
    } finally {
      setSaving(false);
    }
  };

  // Handle FX Rate Save
  const handleSaveFxRate = async () => {
    const rateVal = parseFloat(fxRate);
    if (isNaN(rateVal) || rateVal <= 0) {
      error('Invalid FX Rate', 'Please enter a valid USD/NGN exchange rate');
      return;
    }

    setSavingFx(true);
    try {
      const res = await fetch('/api/admin/pricing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'set_exchange_rate',
          provider: 'momo',
          rate: rateVal,
        }),
      });

      const resData = await res.json();
      if (resData.success) {
        success('FX Rate Updated', `USD to NGN exchange rate updated to ₦${rateVal}/$1`);
        fetchMomoPricing();
      } else {
        error('Save Failed', resData.error);
      }
    } catch (err: any) {
      error('Error', err.message);
    } finally {
      setSavingFx(false);
    }
  };

  // Handle Individual Override Save
  const handleSaveOverride = async (itemId: string) => {
    const customVal = parseFloat(editingOverrides[itemId]);
    if (isNaN(customVal) || customVal <= 0) {
      error('Invalid Price', 'Please enter a valid retail price per 1,000 units');
      return;
    }

    setUpdatingId(itemId);
    try {
      const res = await fetch('/api/admin/pricing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'set_override',
          provider: 'momo',
          itemId,
          price: customVal,
        }),
      });

      const resData = await res.json();
      if (resData.success) {
        success('Override Saved', 'Custom retail rate per 1k set as active override');
        setEditingOverrides((prev) => {
          const updated = { ...prev };
          delete updated[itemId];
          return updated;
        });
        fetchMomoPricing();
      } else {
        error('Save Failed', resData.error || 'Could not save custom rate');
      }
    } catch (err: any) {
      error('Error', err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  // Handle Clear Override
  const handleClearOverride = async (itemId: string) => {
    setUpdatingId(itemId);
    try {
      const res = await fetch('/api/admin/pricing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'clear_override',
          provider: 'momo',
          itemId,
        }),
      });

      const resData = await res.json();
      if (resData.success) {
        info('Reverted', 'Service rate restored to global margin calculation');
        fetchMomoPricing();
      } else {
        error('Revert Failed', resData.error);
      }
    } catch (err: any) {
      error('Error', err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  // Filtered services with useMemo to keep UI blazing fast
  const platforms = ['ALL', 'Instagram', 'TikTok', 'YouTube', 'Facebook', 'Twitter', 'Telegram'];

  const filteredServices = useMemo(() => {
    const query = deferredSearch.trim().toLowerCase();
    const plat = selectedPlatform.toLowerCase();

    return services.filter((s) => {
      const name = (s.name || '').toLowerCase();
      const cat = (s.category || '').toLowerCase();

      const matchesPlatform =
        selectedPlatform === 'ALL' ||
        cat.includes(plat) ||
        name.includes(plat);

      if (!matchesPlatform) return false;

      if (!query) return true;

      return (
        name.includes(query) ||
        cat.includes(query) ||
        String(s.serviceId).includes(query)
      );
    });
  }, [services, deferredSearch, selectedPlatform]);

  const totalPages = Math.max(1, Math.ceil(filteredServices.length / ITEMS_PER_PAGE));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedServices = useMemo(() => {
    const start = (safeCurrentPage - 1) * ITEMS_PER_PAGE;
    return filteredServices.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredServices, safeCurrentPage]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl w-full max-w-6xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-white/5 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-600 dark:text-pink-400">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  MomoPanel SMM Services & Margins Manager
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-pink-500/10 text-pink-600 dark:text-pink-400 text-[10px] font-bold border border-pink-500/20">
                  REAL-TIME OVERRIDES
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Manage USD/NGN exchange rate, global profit margin (% or fixed), and override cheap or high-value services individually.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Global Controls Grid */}
        <div className="p-4 mx-6 my-4 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-white/5 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* USD/NGN Conversion */}
          <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 flex items-center justify-between gap-3 shadow-sm">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                <DollarSign className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">Momo USD Conversion Rate</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Converts MomoPanel USD rates to base wholesale ₦</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center rounded-xl bg-slate-100 dark:bg-slate-800 px-2 py-1 border border-slate-200 dark:border-white/10">
                <span className="text-xs font-bold text-slate-400 mr-1">₦</span>
                <input
                  type="number"
                  value={fxRate}
                  onChange={(e) => setFxRate(e.target.value)}
                  className="w-16 bg-transparent text-xs font-bold text-slate-900 dark:text-white text-right focus:outline-none"
                  placeholder="1650"
                />
              </div>
              <button
                type="button"
                onClick={handleSaveFxRate}
                disabled={savingFx}
                className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-950 text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
              >
                {savingFx ? '...' : 'Save FX'}
              </button>
            </div>
          </div>

          {/* Global Margin Control */}
          <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 flex items-center justify-between gap-3 shadow-sm">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-pink-500/10 text-pink-600 dark:text-pink-400 flex items-center justify-center font-bold">
                <Sliders className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">Global Margin Rule</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Applied across all SMM packages unless overridden</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-0.5 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setMarginType('percent')}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    marginType === 'percent'
                      ? 'bg-white dark:bg-slate-900 text-pink-600 dark:text-pink-400 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  %
                </button>
                <button
                  type="button"
                  onClick={() => setMarginType('fixed')}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    marginType === 'fixed'
                      ? 'bg-white dark:bg-slate-900 text-pink-600 dark:text-pink-400 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  ₦
                </button>
              </div>
              <input
                type="number"
                value={marginVal}
                onChange={(e) => setMarginVal(e.target.value)}
                placeholder="45"
                className="w-16 px-2 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-mono text-xs text-center focus:outline-none focus:ring-1 focus:ring-pink-500"
              />
              <button
                type="button"
                onClick={handleSaveGlobalRule}
                disabled={saving}
                className="px-3 py-1.5 rounded-xl bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
              >
                {saving ? '...' : 'Apply Global'}
              </button>
            </div>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="px-6 pb-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
            {platforms.map((plat) => (
              <button
                key={plat}
                onClick={() => setSelectedPlatform(plat)}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                  selectedPlatform === plat
                    ? 'bg-pink-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {plat}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, category, or service ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-pink-500"
            />
          </div>
        </div>

        {/* Services Table */}
        <div className="flex-1 overflow-y-auto px-6 pb-2">
          {loading ? (
            <div className="p-12 text-center text-slate-400 text-sm">
              Loading MomoPanel services and live margin calculations...
            </div>
          ) : filteredServices.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-sm">
              No MomoPanel services matching your search filter.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-white/5 bg-slate-50/30 dark:bg-slate-950/20">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-white/5 bg-slate-100/50 dark:bg-slate-800/40 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4">Service Details</th>
                    <th className="py-3 px-4">Momo Cost / 1k</th>
                    <th className="py-3 px-4">Our Retail / 1k</th>
                    <th className="py-3 px-4">Margin Spread</th>
                    <th className="py-3 px-4">Min / Max</th>
                    <th className="py-3 px-4">Rule Mode</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5 font-medium">
                  {paginatedServices.map((s) => {
                    const isEditing = editingOverrides[s.id] !== undefined;
                    const isUpdating = updatingId === s.id;

                    return (
                      <tr
                        key={s.id}
                        className={`hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors ${
                          s.isOverridden ? 'bg-amber-500/[0.03]' : ''
                        }`}
                      >
                        <td className="py-3 px-4 max-w-xs">
                          <div className="font-bold text-slate-900 dark:text-white line-clamp-1">
                            {s.name}
                          </div>
                          <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                            <span className="font-mono text-pink-600 dark:text-pink-400">ID: {s.serviceId}</span>
                            <span>•</span>
                            <span className="truncate">{s.category}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-400">
                          <div>{formatNaira(s.wholesaleCost)}</div>
                          <div className="text-[10px] text-slate-400">${s.usdRate.toFixed(3)}</div>
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white">
                          {formatNaira(s.retailPrice)}
                        </td>
                        <td className="py-3 px-4 font-mono text-emerald-600 dark:text-emerald-400">
                          +{formatNaira(s.marginAmount)} ({s.marginPercent}%)
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-500">
                          {s.min?.toLocaleString()} - {s.max?.toLocaleString()}
                        </td>
                        <td className="py-3 px-4">
                          {s.isOverridden ? (
                            <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-bold border border-amber-500/20 flex items-center gap-1 w-fit">
                              <Sparkles className="w-3 h-3" />
                              Custom Override
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-semibold">
                              Global Rule
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {isEditing ? (
                              <>
                                <input
                                  type="number"
                                  value={editingOverrides[s.id]}
                                  onChange={(e) =>
                                    setEditingOverrides({
                                      ...editingOverrides,
                                      [s.id]: e.target.value,
                                    })
                                  }
                                  placeholder="Rate/1k"
                                  className="w-24 px-2 py-1 rounded-lg bg-white dark:bg-slate-900 border border-pink-500 text-slate-900 dark:text-white font-mono text-xs text-right focus:outline-none"
                                  autoFocus
                                />
                                <button
                                  onClick={() => handleSaveOverride(s.id)}
                                  disabled={isUpdating}
                                  className="p-1.5 rounded-lg bg-emerald-500 text-slate-950 font-bold hover:bg-emerald-600 transition-colors"
                                  title="Save Override Rate"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() =>
                                    setEditingOverrides((prev) => {
                                      const copy = { ...prev };
                                      delete copy[s.id];
                                      return copy;
                                    })
                                  }
                                  className="p-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-300 transition-colors"
                                  title="Cancel"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() =>
                                    setEditingOverrides({
                                      ...editingOverrides,
                                      [s.id]: String(s.retailPrice),
                                    })
                                  }
                                  className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-[11px] transition-colors"
                                >
                                  Override ₦
                                </button>
                                {s.isOverridden && (
                                  <button
                                    onClick={() => handleClearOverride(s.id)}
                                    disabled={isUpdating}
                                    className="p-1 rounded-lg text-rose-500 hover:bg-rose-500/10 transition-colors"
                                    title="Reset to Global Margin"
                                  >
                                    <RotateCcw className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer & Pagination */}
        <div className="p-4 border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-slate-950/40 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-3">
            <span>
              Showing {filteredServices.length > 0 ? (safeCurrentPage - 1) * ITEMS_PER_PAGE + 1 : 0} -{' '}
              {Math.min(safeCurrentPage * ITEMS_PER_PAGE, filteredServices.length)} of {filteredServices.length} packages
            </span>
            {totalPages > 1 && (
              <div className="flex items-center gap-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-2 py-1">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={safeCurrentPage <= 1}
                  className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 disabled:opacity-30 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="px-2 font-mono font-bold text-slate-900 dark:text-white">
                  {safeCurrentPage} / {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={safeCurrentPage >= totalPages}
                  className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 disabled:opacity-30 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-bold transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
