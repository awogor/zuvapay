'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Search,
  Check,
  RotateCcw,
  Sliders,
  Sparkles,
  Save,
} from 'lucide-react';
import { formatNaira } from '@/lib/utils';
import { useToast } from '@/components/common/Toast';

interface AIMarketplacePricingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AIMarketplacePricingModal({ isOpen, onClose }: AIMarketplacePricingModalProps) {
  const { success, error, info } = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [, setPricingConfig] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  // Global Margin Rule inputs
  const [marginType, setMarginType] = useState<'percent' | 'fixed'>('percent');
  const [marginVal, setMarginVal] = useState<string>('15');

  // Inline editing state: mapping id -> edited price string
  const [editingOverrides, setEditingOverrides] = useState<Record<string, string>>({});
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchMarketplacePricing = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/pricing?provider=marketplace');
      const data = await res.json();
      if (data.success) {
        setPricingConfig(data.config);
        setProducts(data.marketplace?.products || []);

        const activeRule = data.config?.marketplace?.globalRule;
        if (activeRule) {
          const normalized = activeRule.type === 'percentage' || activeRule.type === 'percent' ? 'percent' : 'fixed';
          setMarginType(normalized);
          setMarginVal(String(activeRule.value));
        }
      } else {
        error('Failed to load', data.error || 'Could not fetch AI Marketplace pricing');
      }
    } catch (err: any) {
      error('Network Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchMarketplacePricing();
    }
  }, [isOpen]);

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
          provider: 'marketplace',
          rule: {
            type: marginType,
            value: val,
          },
        }),
      });

      const resData = await res.json();
      if (resData.success) {
        success('Margin Updated', 'Global AI Marketplace retail margin rule saved successfully!');
        fetchMarketplacePricing();
      } else {
        error('Update Failed', resData.error || 'Could not save margin');
      }
    } catch (err: any) {
      error('Error', err.message);
    } finally {
      setSaving(false);
    }
  };

  // Handle Individual Override Save
  const handleSaveOverride = async (itemId: string) => {
    const customVal = parseFloat(editingOverrides[itemId]);
    if (isNaN(customVal) || customVal <= 0) {
      error('Invalid Price', 'Please enter a valid selling price');
      return;
    }

    setUpdatingId(itemId);
    try {
      const res = await fetch('/api/admin/pricing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'set_override',
          provider: 'marketplace',
          itemId,
          price: customVal,
        }),
      });

      const resData = await res.json();
      if (resData.success) {
        success('Override Saved', 'Custom product price set as active override');
        setEditingOverrides((prev) => {
          const updated = { ...prev };
          delete updated[itemId];
          return updated;
        });
        fetchMarketplacePricing();
      } else {
        error('Save Failed', resData.error || 'Could not save custom price');
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
          provider: 'marketplace',
          itemId,
        }),
      });

      const resData = await res.json();
      if (resData.success) {
        info('Reverted', 'Product price restored to global margin calculation');
        fetchMarketplacePricing();
      } else {
        error('Revert Failed', resData.error);
      }
    } catch (err: any) {
      error('Error', err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  // Extract unique categories
  const categories = ['ALL', ...Array.from(new Set(products.map((p) => p.category || 'General')))];

  // Filtered product list
  const filteredProducts = products.filter((p) => {
    const matchesCat = selectedCategory === 'ALL' || (p.category || 'General') === selectedCategory;
    const matchesSearch =
      (p.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.category || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.id || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-white/5 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-600 dark:text-purple-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  AI Marketplace Reseller v2 Products & Pricing Manager
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold border border-emerald-500/20">
                  REAL-TIME OVERRIDES
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Configure global margin rule (% or fixed ₦) and set custom retail price overrides per digital product.
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

        {/* Global Margin Control Bar */}
        <div className="p-4 mx-6 my-4 rounded-2xl bg-purple-50 dark:bg-purple-500/5 border border-purple-200/70 dark:border-purple-500/20 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">
                Global Margin Rule for AI Marketplace Products
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Applied to AI Marketplace wholesale cost across all accounts, VPNs, RDPs, and proxies unless overridden.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex rounded-xl bg-slate-200 dark:bg-slate-800 p-0.5 text-xs font-bold">
              <button
                type="button"
                onClick={() => setMarginType('percent')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  marginType === 'percent'
                    ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                % Percentage
              </button>
              <button
                type="button"
                onClick={() => setMarginType('fixed')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  marginType === 'fixed'
                    ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                ₦ Fixed Naira
              </button>
            </div>

            <div className="relative">
              <input
                type="number"
                value={marginVal}
                onChange={(e) => setMarginVal(e.target.value)}
                className="w-24 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-300 dark:border-white/10 text-xs font-bold text-slate-900 dark:text-white text-right focus:outline-none focus:border-purple-500"
                placeholder={marginType === 'percent' ? '15' : '500'}
              />
              <span className="absolute left-2.5 top-1.5 text-xs text-slate-400 font-bold">
                {marginType === 'percent' ? '%' : '₦'}
              </span>
            </div>

            <button
              onClick={handleSaveGlobalRule}
              disabled={saving}
              className="px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm disabled:opacity-50 transition-all"
            >
              <Save className="w-3.5 h-3.5" />
              {saving ? 'Saving...' : 'Apply Global'}
            </button>
          </div>
        </div>

        {/* Filters & Search Header */}
        <div className="px-6 py-2 flex flex-wrap items-center justify-between gap-3">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search product title, category, or ID..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="flex items-center gap-1 overflow-x-auto pb-1 max-w-[50%]">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-950'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable Products Table */}
        <div className="flex-1 overflow-y-auto px-6 py-2">
          {loading ? (
            <div className="py-20 text-center space-y-3">
              <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-slate-500 font-medium">Loading AI Marketplace products & active pricing...</p>
            </div>
          ) : (
            <div className="border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden bg-white dark:bg-slate-950/40">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-white/10 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    <th className="py-3 px-4">Product Title</th>
                    <th className="py-3 px-4">AI Marketplace Wholesale</th>
                    <th className="py-3 px-4">Our Retail Price</th>
                    <th className="py-3 px-4">Profit Spread</th>
                    <th className="py-3 px-4">Stock</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Individual Override</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5 font-medium">
                  {filteredProducts.map((p) => {
                    const isEditing = editingOverrides[p.id] !== undefined;
                    const isUpdating = updatingId === p.id;
                    return (
                      <tr key={p.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900 dark:text-white line-clamp-1">{p.name}</div>
                          <div className="text-[11px] text-slate-400 font-mono">
                            Category: {p.category} · Key: {p.id}
                          </div>
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-400">
                          {formatNaira(p.wholesaleCost)}
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white">
                          {formatNaira(p.retailPrice)}
                        </td>
                        <td className="py-3 px-4 font-mono text-emerald-600 dark:text-emerald-400">
                          +{formatNaira(p.marginAmount)} ({p.marginPercent}%)
                        </td>
                        <td className="py-3 px-4 font-mono">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            p.stock > 0
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                              : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                          }`}>
                            {p.stock} in stock
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {p.isOverridden ? (
                            <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-bold border border-amber-500/20">
                              Override
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
                                  value={editingOverrides[p.id]}
                                  onChange={(e) =>
                                    setEditingOverrides({
                                      ...editingOverrides,
                                      [p.id]: e.target.value,
                                    })
                                  }
                                  placeholder="Selling ₦"
                                  className="w-24 px-2 py-1 rounded-lg bg-white dark:bg-slate-900 border border-purple-500 text-slate-900 dark:text-white font-mono text-xs text-right focus:outline-none"
                                  autoFocus
                                />
                                <button
                                  onClick={() => handleSaveOverride(p.id)}
                                  disabled={isUpdating}
                                  className="p-1.5 rounded-lg bg-emerald-500 text-slate-950 font-bold hover:bg-emerald-600 transition-colors"
                                  title="Save Override"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() =>
                                    setEditingOverrides((prev) => {
                                      const copy = { ...prev };
                                      delete copy[p.id];
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
                                      [p.id]: String(p.retailPrice),
                                    })
                                  }
                                  className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-[11px] transition-colors"
                                >
                                  Edit ₦
                                </button>
                                {p.isOverridden && (
                                  <button
                                    onClick={() => handleClearOverride(p.id)}
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

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-slate-950/40 flex items-center justify-between text-xs text-slate-500">
          <span>
            Showing {filteredProducts.length} AI Marketplace products ({categories.length - 1} categories)
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
