'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Search,
  Check,
  RotateCcw,
  Sliders,
  MessageSquare,
  Save,
  Server,
  DollarSign,
} from 'lucide-react';
import { formatNaira } from '@/lib/utils';
import { useToast } from '@/components/common/Toast';

interface SMSPricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialProvider?: 'grizzly' | 'smspool';
}

export function SMSPricingModal({
  isOpen,
  onClose,
  initialProvider = 'grizzly',
}: SMSPricingModalProps) {
  const { success, error, info } = useToast();
  const [activeProvider, setActiveProvider] = useState<'grizzly' | 'smspool'>(initialProvider);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savingFx, setSavingFx] = useState(false);

  const [services, setServices] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  // USD to NGN conversion rate state
  const [fxRate, setFxRate] = useState<string>('1650');

  // Margin rule state
  const [marginType, setMarginType] = useState<'percent' | 'fixed'>('percent');
  const [marginVal, setMarginVal] = useState<string>('30');

  // Overrides state: itemId -> retail price string
  const [editingOverrides, setEditingOverrides] = useState<Record<string, string>>({});
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    setActiveProvider(initialProvider);
  }, [initialProvider]);

  const fetchPricing = async (provider = activeProvider) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/pricing?provider=${provider}`);
      const data = await res.json();
      if (data.success) {
        const providerData = provider === 'grizzly' ? data.grizzly : data.smspool;
        setServices(providerData?.services || []);

        if (providerData?.usdToNgnRate) {
          setFxRate(String(providerData.usdToNgnRate));
        } else {
          setFxRate('1650');
        }

        const activeRule =
          provider === 'grizzly'
            ? data.config?.grizzly?.globalRule
            : data.config?.smspool?.globalRule;

        if (activeRule) {
          const normalized =
            activeRule.type === 'percentage' || activeRule.type === 'percent'
              ? 'percent'
              : 'fixed';
          setMarginType(normalized);
          setMarginVal(String(activeRule.value));
        } else {
          setMarginType('percent');
          setMarginVal(provider === 'grizzly' ? '30' : '25');
        }
      } else {
        error('Failed to load', data.error || 'Could not fetch SMS pricing');
      }
    } catch (err: any) {
      error('Network Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchPricing(activeProvider);
    }
  }, [isOpen, activeProvider]);

  if (!isOpen) return null;

  const handleSaveFxRate = async () => {
    const rateVal = parseFloat(fxRate);
    if (isNaN(rateVal) || rateVal <= 0) {
      error('Invalid Rate', 'Please enter a valid conversion rate greater than 0');
      return;
    }

    setSavingFx(true);
    try {
      const res = await fetch('/api/admin/pricing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'set_exchange_rate',
          provider: activeProvider,
          rate: rateVal,
        }),
      });

      const resData = await res.json();
      if (resData.success) {
        success('Conversion Rate Updated', `USD to NGN rate updated to ₦${rateVal}/$1`);
        fetchPricing();
      } else {
        error('Failed to Save', resData.error);
      }
    } catch (err: any) {
      error('Error', err.message);
    } finally {
      setSavingFx(false);
    }
  };

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
          provider: activeProvider,
          rule: {
            type: marginType,
            value: val,
          },
        }),
      });

      const resData = await res.json();
      if (resData.success) {
        success('Margin Updated', `Global ${activeProvider === 'grizzly' ? 'GrizzlySMS' : 'SMSPool'} retail margin rule saved!`);
        fetchPricing();
      } else {
        error('Failed to Save', resData.error);
      }
    } catch (err: any) {
      error('Error', err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveOverride = async (itemId: string) => {
    const entered = editingOverrides[itemId];
    const priceNum = parseFloat(entered);

    if (isNaN(priceNum) || priceNum <= 0) {
      error('Invalid Price', 'Please enter a valid price greater than 0');
      return;
    }

    setUpdatingId(itemId);
    try {
      const res = await fetch('/api/admin/pricing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'set_override',
          provider: activeProvider,
          itemId,
          price: priceNum,
        }),
      });

      const resData = await res.json();
      if (resData.success) {
        success('Override Saved', 'Custom retail price active!');
        setEditingOverrides((prev) => {
          const next = { ...prev };
          delete next[itemId];
          return next;
        });
        fetchPricing();
      } else {
        error('Failed to Save', resData.error);
      }
    } catch (err: any) {
      error('Error', err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleClearOverride = async (itemId: string) => {
    setUpdatingId(itemId);
    try {
      const res = await fetch('/api/admin/pricing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'clear_override',
          provider: activeProvider,
          itemId,
        }),
      });

      const resData = await res.json();
      if (resData.success) {
        info('Override Cleared', 'Reverted back to automatic global margin rule');
        setEditingOverrides((prev) => {
          const next = { ...prev };
          delete next[itemId];
          return next;
        });
        fetchPricing();
      } else {
        error('Failed to Clear', resData.error);
      }
    } catch (err: any) {
      error('Error', err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  // Categories list
  const categories = ['ALL', ...Array.from(new Set(services.map((s) => s.category || 'General')))];

  const filteredServices = services.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(s.id).toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'ALL' || s.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl max-h-[90vh] flex flex-col rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-white/5 flex items-start justify-between bg-slate-50/50 dark:bg-slate-950/40">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 font-black text-[10px] uppercase tracking-wider border border-rose-500/20">
                SMS Wholesale Catalog & Margins
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {activeProvider === 'grizzly' ? 'Server 1 (GrizzlySMS)' : 'Server 2 (SMSPool)'}
              </span>
            </div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white">
              Manage SMS Numbers & Markup Overrides
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Configure global retail percentage markup or manually override individual online services (WhatsApp, Telegram, OpenAI, etc.).
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Provider Switcher Tabs */}
        <div className="flex border-b border-slate-100 dark:border-white/5 px-6 pt-3 bg-white dark:bg-slate-900 gap-4">
          <button
            onClick={() => setActiveProvider('grizzly')}
            className={`pb-3 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
              activeProvider === 'grizzly'
                ? 'border-brand-orange text-brand-orange'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Server className="w-4 h-4 text-rose-500" />
            Server 1: GrizzlySMS
          </button>
          <button
            onClick={() => setActiveProvider('smspool')}
            className={`pb-3 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
              activeProvider === 'smspool'
                ? 'border-brand-orange text-brand-orange'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Server className="w-4 h-4 text-indigo-500" />
            Server 2: SMSPool
          </button>
        </div>

        {/* Global Controls: FX Rate & Margin Rule */}
        <div className="p-4 sm:p-6 bg-slate-50/50 dark:bg-slate-950/40 border-b border-slate-100 dark:border-white/5 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 1. USD to NGN Conversion Rate */}
          <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 flex items-center justify-between gap-3 shadow-sm">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                <DollarSign className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">USD Conversion Rate</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Converts {activeProvider === 'grizzly' ? 'Grizzly' : 'SMSPool'} USD costs to base ₦</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center rounded-xl bg-slate-100 dark:bg-slate-800 px-2.5 py-1.5 border border-slate-200 dark:border-white/10">
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
                className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-950 text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 disabled:opacity-50"
              >
                {savingFx ? '...' : 'Save FX'}
              </button>
            </div>
          </div>

          {/* 2. Global Margin Rule */}
          <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 flex items-center justify-between gap-3 shadow-sm">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                <Sliders className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">Global Retail Margin</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Auto markup across all {activeProvider === 'grizzly' ? 'Grizzly' : 'SMSPool'} numbers</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-0.5 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setMarginType('percent')}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    marginType === 'percent'
                      ? 'bg-white dark:bg-slate-900 text-brand-orange shadow-sm'
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
                      ? 'bg-white dark:bg-slate-900 text-brand-orange shadow-sm'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  ₦
                </button>
              </div>
              <input
                type="number"
                min="0"
                step="any"
                value={marginVal}
                onChange={(e) => setMarginVal(e.target.value)}
                placeholder="30"
                className="w-16 px-2.5 py-1.5 text-xs font-bold font-mono rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:border-brand-orange text-right"
              />
              <button
                type="button"
                onClick={handleSaveGlobalRule}
                disabled={saving}
                className="px-3 py-1.5 rounded-xl bg-brand-orange hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 disabled:opacity-50"
              >
                {saving ? '...' : 'Apply'}
              </button>
            </div>
          </div>
        </div>

        {/* Filter / Search Bar */}
        <div className="p-4 border-b border-slate-100 dark:border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search service name..."
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-brand-orange"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 sm:pb-0">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-xl text-[11px] font-bold transition-all shrink-0 ${
                  selectedCategory === cat
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Services Table */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {loading ? (
            <div className="py-20 text-center text-xs text-slate-400">Loading catalog and pricing...</div>
          ) : filteredServices.length === 0 ? (
            <div className="py-20 text-center text-xs text-slate-400">No matching services found.</div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-white/5">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-950/50 border-b border-slate-200 dark:border-white/5 text-[11px] font-bold uppercase text-slate-500">
                  <tr>
                    <th className="py-3 px-4">Service</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">USD Cost ($)</th>
                    <th className="py-3 px-4">Wholesale (₦)</th>
                    <th className="py-3 px-4">Active Retail Price</th>
                    <th className="py-3 px-4">Profit Margin</th>
                    <th className="py-3 px-4 text-right">Manual Override</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                  {filteredServices.map((s) => {
                    const isOverridden = s.isOverridden;
                    const isEditing = editingOverrides[s.id] !== undefined;
                    const currentValue = isEditing ? editingOverrides[s.id] : String(s.retailPrice);
                    const isUpdating = updatingId === s.id;

                    return (
                      <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                        <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                          <div className="flex items-center gap-2">
                            <MessageSquare className="w-4 h-4 text-brand-orange" />
                            <span>{s.name}</span>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-medium text-slate-600 dark:text-slate-400">
                            {s.category || 'General'}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 font-mono font-bold text-sky-600 dark:text-sky-400">
                          ${Number(s.usdCost || 0).toFixed(2)}
                        </td>

                        <td className="py-3.5 px-4 font-mono font-bold text-slate-600 dark:text-slate-300">
                          {formatNaira(s.wholesaleCost)}
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-black text-emerald-600 dark:text-emerald-400">
                              {formatNaira(s.retailPrice)}
                            </span>
                            {isOverridden ? (
                              <span className="px-1.5 py-0.2 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 text-[9px] font-bold uppercase border border-purple-500/20">
                                Overridden
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 text-[9px] font-bold uppercase">
                                Auto
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="py-3.5 px-4 font-mono">
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                            +{formatNaira(s.marginAmount)} ({s.marginPercent}%)
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <div className="relative w-28">
                              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-[11px]">
                                ₦
                              </span>
                              <input
                                type="number"
                                min="0"
                                value={currentValue}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setEditingOverrides((prev) => ({
                                    ...prev,
                                    [s.id]: val,
                                  }));
                                }}
                                className={`w-full pl-6 pr-2 py-1.5 text-xs font-mono font-bold rounded-lg border focus:outline-none ${
                                  isEditing
                                    ? 'bg-white dark:bg-slate-950 border-brand-orange text-slate-900 dark:text-white'
                                    : 'bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300'
                                }`}
                              />
                            </div>

                            {isEditing && (
                              <button
                                onClick={() => handleSaveOverride(s.id)}
                                disabled={isUpdating}
                                className="p-1.5 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 transition-colors"
                                title="Save Override"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {isOverridden && !isEditing && (
                              <button
                                onClick={() => handleClearOverride(s.id)}
                                disabled={isUpdating}
                                className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-rose-500 transition-colors"
                                title="Reset to Global Margin"
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                              </button>
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

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-slate-950/40 flex items-center justify-between text-xs text-slate-500">
          <span>
            Showing {filteredServices.length} {activeProvider === 'grizzly' ? 'GrizzlySMS' : 'SMSPool'} services
          </span>
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
