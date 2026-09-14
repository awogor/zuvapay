'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { MarketingNavbar } from '@/components/marketing/MarketingNavbar';
import { MarketingFooter } from '@/components/marketing/MarketingFooter';
import { formatNaira } from '@/lib/utils';
import { AIProductItem } from '@/types';
import {
  Sparkles,
  Search,
  CheckCircle2,
  ShieldCheck,
  Zap,
  Layers,
  Bot,
  Video,
  Palette,
  Code2,
  FileText,
  Lock,
  ArrowRight,
  Eye,
  Package,
  X,
  Flame,
} from 'lucide-react';

const CATEGORY_TABS = [
  { id: 'all', name: 'All Subscriptions', icon: Layers },
  { id: 'AI Assistants & LLMs', name: 'AI & LLMs', icon: Bot },
  { id: 'Video, Audio & Creative', name: 'Video & Audio', icon: Video },
  { id: 'Design & Graphics', name: 'Design Tools', icon: Palette },
  { id: 'Developer & Coding Tools', name: 'Developer & Code', icon: Code2 },
  { id: 'Productivity & Writing', name: 'Productivity', icon: FileText },
  { id: 'VPN & Privacy', name: 'VPN & Privacy', icon: Lock },
];

export function PublicMarketplaceView() {
  const [products, setProducts] = useState<AIProductItem[]>([]);
  const [fetching, setFetching] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeProduct, setActiveProduct] = useState<AIProductItem | null>(null);

  useEffect(() => {
    async function loadCatalog() {
      setFetching(true);
      try {
        const res = await fetch('/api/services/marketplace');
        const data = await res.json();
        if (data.success && Array.isArray(data.products)) {
          setProducts(data.products);
        }
      } catch (err) {
        console.error('Failed to load public marketplace catalog', err);
      } finally {
        setFetching(false);
      }
    }
    loadCatalog();
  }, []);

  const filteredProducts = useMemo(() => {
    let list = products;
    if (selectedCategory !== 'all') {
      list = list.filter((p) => p.category.toLowerCase() === selectedCategory.toLowerCase());
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.summary.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      );
    }
    return list;
  }, [products, selectedCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-[#FBFBFE] text-slate-900 font-sans selection:bg-zuva-solar selection:text-white">
      <MarketingNavbar />

      {/* Streamlined Compact Header */}
      <section className="pt-24 sm:pt-28 pb-4 border-b border-slate-200/80 bg-gradient-to-b from-orange-50/50 via-white to-[#FBFBFE] relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-gradient-to-b from-zuva-solar/10 to-transparent blur-[80px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-2">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white border border-slate-200 shadow-xs text-[11px] font-semibold text-slate-700 mb-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>ZuvaPay Subscriptions Store</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-950 font-display">
                AI &amp; Software Marketplace
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 max-w-xl mt-0.5">
                Instant delivery on Gemini Pro, CapCut Pro, Grok, Canva Pro &amp; 50+ tools with full warranty.
              </p>
            </div>

            {/* Quick Search */}
            <div className="relative w-full sm:w-80 shrink-0">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Gemini, CapCut, Grok..."
                className="w-full pl-9 pr-8 py-2 rounded-xl bg-white border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-zuva-solar/40 text-slate-900 shadow-xs"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pt-3 pb-2 scrollbar-none border-t border-slate-100">
            {CATEGORY_TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = selectedCategory === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedCategory(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-slate-950 text-white shadow-xs'
                      : 'bg-white text-slate-600 hover:text-slate-950 border border-slate-200/80 hover:border-slate-300'
                  }`}
                >
                  <Icon className={`w-3 h-3 ${isActive ? 'text-zuva-amber' : 'text-slate-400'}`} />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Catalog Section */}
      <section id="catalog" className="pt-6 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {fetching ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="animate-pulse rounded-3xl bg-white border border-slate-200/80 p-6 space-y-4 shadow-sm"
              >
                <div className="h-5 bg-slate-200 rounded-full w-24" />
                <div className="h-6 bg-slate-200 rounded-xl w-3/4" />
                <div className="h-12 bg-slate-100 rounded-xl" />
                <div className="h-10 bg-slate-200 rounded-xl pt-4" />
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20 px-4 rounded-3xl bg-white border border-slate-200/80 space-y-3 shadow-sm">
            <Package className="w-12 h-12 text-slate-400 mx-auto stroke-1" />
            <h3 className="text-base font-bold text-slate-900">No subscriptions found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Try adjusting your search query or selecting a different category.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="text-xs font-bold text-zuva-solar hover:underline pt-2"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => {
              const hasStock = product.stock > 0;
              const isGemini = product.name.toLowerCase().includes('gemini');

              return (
                <div
                  key={product.id}
                  className={`group relative flex flex-col justify-between rounded-3xl bg-white border p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
                    isGemini
                      ? 'border-2 border-orange-400/90 shadow-lg shadow-orange-500/10 bg-gradient-to-b from-white via-orange-50/20 to-white'
                      : 'border-slate-200/80 hover:border-slate-300 shadow-sm'
                  }`}
                >
                  {isGemini && (
                    <div className="absolute -top-3.5 right-6 inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-gradient-to-r from-orange-600 via-zuva-solar to-amber-500 text-white font-black text-[10px] uppercase tracking-wider shadow-md shadow-orange-500/30">
                      <Flame className="w-3 h-3 fill-white" />
                      🔥 HOT DEAL
                    </div>
                  )}

                  <div className="space-y-3.5">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-orange-50 text-zuva-solar border border-orange-200">
                        {product.category}
                      </span>
                      <span
                        className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                          hasStock
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-600 border border-rose-200'
                        }`}
                      >
                        {hasStock ? `${product.stock} In Stock` : 'Out of Stock'}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base sm:text-lg font-black text-slate-950 group-hover:text-zuva-solar transition-colors leading-snug">
                        {product.name}
                      </h3>
                      <p className="text-xs text-slate-600 line-clamp-2 mt-1.5 leading-relaxed">
                        {product.summary}
                      </p>
                    </div>

                    <div className="space-y-1.5 pt-2 border-t border-slate-100 text-[11px] text-slate-600">
                      <div className="flex items-center gap-2">
                        <Zap className="w-3.5 h-3.5 text-amber-500" />
                        <span>{product.accessType || 'Instant Access'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{product.warranty || 'Active Warranty'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-5 mt-5 border-t border-slate-100 flex items-center justify-between gap-2">
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Price</p>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-lg sm:text-xl font-black text-slate-950 font-mono">
                          {formatNaira(product.priceNgn)}
                        </span>
                        {product.savingsNgn > 0 && (
                          <span className="text-[10px] text-slate-400 line-through">
                            {formatNaira(product.priceNgn + product.savingsNgn)}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => setActiveProduct(product)}
                        className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-all"
                      >
                        <Eye className="w-3.5 h-3.5 text-slate-500" />
                        <span>Details</span>
                      </button>

                      <Link
                        href={`/services/marketplace?product=${encodeURIComponent(product.id)}`}
                        className="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-zuva-solar to-zuva-amber hover:from-orange-600 hover:to-amber-600 text-white shadow-md shadow-orange-500/20 transition-all hover:scale-105 active:scale-95"
                      >
                        <span>Buy Now</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Product Details Modal */}
      {activeProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setActiveProduct(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-800 rounded-full hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1.5 pr-8">
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-orange-50 text-zuva-solar border border-orange-200">
                {activeProduct.category}
              </span>
              <h3 className="text-xl font-black text-slate-950">
                {activeProduct.name}
              </h3>
              <p className="text-xs text-slate-600">
                {activeProduct.summary}
              </p>
            </div>

            {/* Guarantees */}
            <div className="p-3.5 rounded-2xl bg-orange-50/70 border border-orange-200/80 grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-500 block text-[11px]">Warranty Guarantee:</span>
                <span className="font-bold text-slate-900">{activeProduct.warranty}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Delivery Mode:</span>
                <span className="font-bold text-slate-900">{activeProduct.accessType}</span>
              </div>
            </div>

            {/* Specifications Details */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5 text-xs text-slate-700 max-h-72 overflow-y-auto leading-relaxed">
              <div className="font-bold text-slate-900 uppercase tracking-wider text-[11px] pb-1 border-b border-slate-200">
                Product Features &amp; Guidelines
              </div>
              {activeProduct.description.split('\n').map((paragraph, idx) => {
                const cleanP = paragraph.trim();
                if (!cleanP) return null;
                if (cleanP.startsWith('•') || cleanP.startsWith('-') || cleanP.startsWith('*')) {
                  return (
                    <div key={idx} className="flex items-start gap-2 pl-1 text-slate-700">
                      <span className="text-zuva-solar font-bold">•</span>
                      <span>{cleanP.replace(/^[•\-\*]\s*/, '')}</span>
                    </div>
                  );
                }
                if (cleanP.includes('→')) {
                  return (
                    <div key={idx} className="p-2.5 rounded-xl bg-orange-100/60 border border-orange-200 text-orange-950 font-medium">
                      {cleanP}
                    </div>
                  );
                }
                return (
                  <p key={idx} className="text-slate-600 leading-relaxed">
                    {cleanP}
                  </p>
                );
              })}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Price</span>
                <span className="text-xl font-black text-slate-950 font-mono">
                  {formatNaira(activeProduct.priceNgn)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveProduct(null)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Close
                </button>
                <Link
                  href={`/services/marketplace?product=${encodeURIComponent(activeProduct.id)}`}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-zuva-solar to-zuva-amber hover:from-orange-600 hover:to-amber-600 text-white text-xs font-bold shadow-md shadow-orange-500/20 transition-all hover:scale-105 active:scale-95"
                >
                  <span>Buy Now</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      <MarketingFooter />
    </div>
  );
}
