'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { formatNaira } from '@/lib/utils';
import { AccountLogItem } from '@/types';
import {
  ShoppingBag,
  Search,
  ChevronRight,
  Boxes,
  ShieldCheck,
  Package,
} from 'lucide-react';
import CustomSearchDropdown, { type DropdownItem } from '@/components/common/CustomSearchDropdown';

interface CategorySummary {
  name: string;
  count: number;
}

export default function LogsMarketplacePage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const currentCategory = resolvedParams.category || 'all';

  const [items, setItems] = useState<AccountLogItem[]>([]);
  const [categories, setCategories] = useState<CategorySummary[]>([]);
  const [fetching, setFetching] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Selected category in dropdown
  const [selectedCat, setSelectedCat] = useState<string>(
    currentCategory === 'all' ? '' : decodeURIComponent(currentCategory)
  );

  useEffect(() => {
    async function loadCatalog() {
      setFetching(true);
      try {
        const url = `/api/services/logs?category=${encodeURIComponent(currentCategory)}`;
        const res = await fetch(url);
        const data = await res.json();
        if (data.success) {
          setItems(data.items || []);
          if (data.categories) {
            setCategories(data.categories);
          }
        }
      } catch (err) {
        console.error('Failed to load logs catalog', err);
      } finally {
        setFetching(false);
      }
    }
    loadCatalog();
  }, [currentCategory]);

  // Client-side search filtering
  const displayedItems = React.useMemo(() => {
    if (!searchQuery.trim()) return items;
    const q = searchQuery.toLowerCase().trim();
    return items.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
    );
  }, [items, searchQuery]);

  // Build dropdown items for categories
  const categoryDropdownItems: DropdownItem[] = [
    { id: 'all', name: '🌐 All Categories', badge: `${items.length} products` },
    ...categories.map((c) => ({
      id: c.name,
      name: c.name,
      badge: `${c.count} items`,
    })),
  ];

  const handleSelectCategory = (item: DropdownItem) => {
    const catId = String(item.id);
    setSelectedCat(catId === 'all' ? '' : catId);
    if (catId === 'all') {
      router.push('/services/logs/all');
    } else {
      router.push(`/services/logs/${encodeURIComponent(catId)}`);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in pb-12">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
          <ShoppingBag className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            Account Logs & Digital Goods
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Aged social accounts, VPNs, proxies & developer software with instant delivery
          </p>
        </div>
      </div>

      {/* Top Filter Bar: Category Dropdown + Search Box */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
        <div className="md:col-span-6">
          <CustomSearchDropdown
            label="Shop by Categories"
            placeholder="-- Select Product Category --"
            searchPlaceholder="Search categories..."
            items={categoryDropdownItems}
            selectedId={selectedCat || 'all'}
            onSelect={handleSelectCategory}
            accentColor="emerald"
            showSearchThreshold={5}
          />
        </div>

        <div className="md:col-span-6">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Quick Search Products
          </label>
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Quick search products (e.g. 9proxy, tiktok, facebook)..."
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white text-sm font-medium focus:outline-none focus:border-emerald-500"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Section Header */}
      <div className="flex items-center justify-between pt-2">
        <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
          <span>Our Recent Products</span>
          <span className="text-amber-500">👌</span>
          <span className="text-xs font-normal text-slate-500">
            ({displayedItems.length} available)
          </span>
        </h2>

        {selectedCat && (
          <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase">
            {selectedCat}
          </span>
        )}
      </div>

      {/* Products List (Table / Card Row Layout) */}
      {fetching ? (
        <div className="p-12 text-center space-y-3 rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/60">
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500 dark:text-slate-400">Loading catalog items...</p>
        </div>
      ) : displayedItems.length === 0 ? (
        <div className="p-12 text-center space-y-3 rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/60">
          <Package className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">No Products Found</h3>
          <p className="text-xs text-slate-500">
            {searchQuery
              ? `No products matched "${searchQuery}". Try a different term.`
              : 'There are no active products in this category right now.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {displayedItems.map((item) => (
            <Link
              key={item.id}
              href={`/services/logs/item/${encodeURIComponent(item.id)}`}
              className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/80 hover:border-emerald-500/40 hover:shadow-lg dark:hover:bg-slate-900 transition-all cursor-pointer"
            >
              {/* Product Icon & Title */}
              <div className="flex items-start sm:items-center gap-3.5 flex-1 min-w-0">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center font-bold flex-shrink-0 group-hover:scale-105 transition-transform">
                  <ShoppingBag className="w-5 h-5 text-emerald-500" />
                </div>

                <div className="min-w-0 space-y-1">
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-2 leading-snug">
                    {item.title}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 truncate">
                      {item.category}
                    </span>
                  </div>
                </div>
              </div>

              {/* Price, Stock & Action Trigger */}
              <div className="flex items-center justify-between sm:justify-end gap-3 flex-shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-white/5">
                {/* Price Pill */}
                <div className="px-3.5 py-1.5 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-mono font-bold text-xs sm:text-sm">
                  {formatNaira(item.price)}
                </div>

                {/* Stock Badge */}
                <div
                  className={`px-3 py-1.5 rounded-full text-xs font-mono font-bold flex items-center gap-1 ${
                    item.stock > 0
                      ? 'bg-slate-900 dark:bg-slate-950 text-white dark:text-slate-200 border border-slate-800 dark:border-white/10'
                      : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                  }`}
                >
                  <Boxes className="w-3.5 h-3.5" />
                  {item.stock > 0 ? `${item.stock} pcs` : 'Out'}
                </div>

                {/* Shopping Bag Button */}
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition-all flex items-center justify-center">
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Footer Warranty Disclaimer */}
      <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 pt-3 border-t border-slate-200 dark:border-white/5">
        <ShieldCheck className="w-4 h-4 text-emerald-500" />
        <span>Automated Warranty: 100% full refund if delivered credentials cannot be activated.</span>
      </div>
    </div>
  );
}
