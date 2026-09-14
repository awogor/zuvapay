'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useWallet } from '@/context/WalletContext';
import { useToast } from '@/components/common/Toast';
import { formatNaira } from '@/lib/utils';
import { AIProductItem } from '@/types';
import {
  Sparkles,
  Search,
  CheckCircle2,
  ShieldCheck,
  Zap,
  Copy,
  Check,
  ExternalLink,
  Layers,
  Bot,
  Video,
  Palette,
  Code2,
  FileText,
  Lock,
  ArrowRight,
  Info,
  X,
  Package,
  Eye,
  ShoppingCart,
} from 'lucide-react';

const CATEGORY_TABS = [
  { id: 'all', name: 'All Products', icon: Layers },
  { id: 'AI Assistants & LLMs', name: 'AI & LLMs', icon: Bot },
  { id: 'Video, Audio & Creative', name: 'Video & Audio', icon: Video },
  { id: 'Design & Graphics', name: 'Design Tools', icon: Palette },
  { id: 'Developer & Coding Tools', name: 'Developer & Code', icon: Code2 },
  { id: 'Productivity & Writing', name: 'Productivity', icon: FileText },
  { id: 'VPN & Privacy', name: 'VPN & Privacy', icon: Lock },
];

export default function MarketplacePage() {
  const { wallet, payBill, refundBill, openReceipt, openFundModal, formatBalance } = useWallet();
  const { success, error, info } = useToast();

  const [products, setProducts] = useState<AIProductItem[]>([]);
  const [categories, setCategories] = useState<{ name: string; count: number }[]>([]);
  const [fetching, setFetching] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Active product modal
  const [activeProduct, setActiveProduct] = useState<AIProductItem | null>(null);
  const [modalTab, setModalTab] = useState<'details' | 'purchase'>('details');
  const [quantity, setQuantity] = useState(1);
  const [customerEmail, setCustomerEmail] = useState('');
  const [purchasing, setPurchasing] = useState(false);

  // Delivered product modal
  const [deliveryResult, setDeliveryResult] = useState<{
    productName: string;
    orderId: string;
    reference: string;
    delivery: any;
  } | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    async function loadCatalog() {
      setFetching(true);
      try {
        const res = await fetch('/api/services/marketplace');
        const data = await res.json();
        if (data.success && Array.isArray(data.products)) {
          setProducts(data.products);
          if (data.categories) {
            setCategories(data.categories);
          }
        }
      } catch (err) {
        console.error('Failed to load marketplace catalog', err);
      } finally {
        setFetching(false);
      }
    }
    loadCatalog();
  }, []);

  // Filter products by selected category and search query
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

  const handleOpenDetails = (product: AIProductItem) => {
    setActiveProduct(product);
    setModalTab('details');
    setQuantity(1);
    setCustomerEmail('');
  };

  const handleOpenPurchase = (product: AIProductItem) => {
    setActiveProduct(product);
    setModalTab('purchase');
    setQuantity(1);
    setCustomerEmail('');
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handlePurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProduct) return;

    if (activeProduct.requiresCustomerEmail && (!customerEmail || !customerEmail.includes('@'))) {
      error('Email Required', 'Please enter a valid email address to receive your invite or license.');
      return;
    }

    const totalPrice = activeProduct.priceNgn * quantity;
    const currentBalance = wallet?.balance || 0;

    // 1. Balance Pre-check
    if (currentBalance < totalPrice) {
      error(
        'Insufficient Balance',
        `You need ${formatNaira(totalPrice)}, but your wallet balance is ${formatNaira(
          currentBalance
        )}. Please fund your wallet.`,
        {
          label: 'Fund Wallet',
          onClick: openFundModal,
        }
      );
      return;
    }

    setPurchasing(true);

    // 2. CRITICAL: Debit First, Fulfill Second
    const debitResult = await payBill({
      amount: totalPrice,
      category: 'marketplace',
      description: `${activeProduct.name} (Qty: ${quantity})`,
      metadata: {
        productId: activeProduct.id,
        productName: activeProduct.name,
        category: activeProduct.category,
        quantity,
        customerEmail: customerEmail || undefined,
      },
    });

    if (!debitResult.success) {
      error('Debit Failed', debitResult.error || 'Failed to debit wallet');
      setPurchasing(false);
      return;
    }

    const reference = debitResult.reference!;

    // 3. Provider Order Fulfillment Call
    try {
      const res = await fetch('/api/services/marketplace', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: activeProduct.id,
          productName: activeProduct.name,
          quantity,
          customerEmail: customerEmail.trim() || undefined,
          reference,
          amount: totalPrice,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        // 4. Automated Immediate Refund on Failure
        info('Order Failed', 'Reversing transaction and returning funds to your wallet...');
        await refundBill({
          amount: totalPrice,
          title: `Marketplace (${activeProduct.name})`,
          reason: data.error || 'Provider rejected order or stock unavailable',
          originalReference: reference,
        });

        error('Order Failed & Refunded', data.error || 'Fulfillment error. Your money has been safely refunded.');
        setPurchasing(false);
        return;
      }

      // 5. Success
      success('Order Fulfilled!', `${activeProduct.name} is ready for instant access.`);
      const deliveredProduct = activeProduct;
      setActiveProduct(null);

      // Open delivery details modal
      setDeliveryResult({
        productName: deliveredProduct.name,
        orderId: data.order?.id || reference,
        reference,
        delivery: data.delivery || {
          activationLink: null,
          credentials: 'Login credentials and activation link will be sent to your email shortly.',
          instructions: 'Check your transactions tab or registered email for details.',
        },
      });

      if (debitResult.transaction) {
        openReceipt(debitResult.transaction);
      }
    } catch (err: any) {
      // Catch-all refund
      await refundBill({
        amount: totalPrice,
        title: `Marketplace (${activeProduct.name})`,
        reason: 'Network disconnect during order dispatch',
        originalReference: reference,
      });
      error('Order Interrupted & Refunded', 'Network error. Funds have been refunded to your wallet.');
    } finally {
      setPurchasing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in pb-16">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 border border-purple-500/20 shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Tools & Premium Subscriptions Hub</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
              AI Marketplace & Software
            </h1>
            <p className="text-sm sm:text-base text-slate-300">
              Instant access to Gemini Pro, ChatGPT Plus, CapCut Pro, Canva Pro, ElevenLabs, Cursor AI, and 50+ developer & creative subscriptions with guaranteed warranty.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col gap-3 bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/10 shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-400">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-400">Delivery Mode</p>
                <p className="text-sm font-bold text-white">Instant Automated</p>
              </div>
            </div>
            <div className="flex items-center gap-3 pt-2 sm:pt-0 md:pt-2 sm:border-l sm:pl-3 md:border-l-0 md:pl-0 border-white/10 md:border-t">
              <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-400">Protection</p>
                <p className="text-sm font-bold text-white">Full Replacement Warranty</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Controls: Search & Categories */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          {/* Search Input */}
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Gemini, CapCut, Canva, Cursor..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-slate-900 dark:text-white"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-200"
              >
                Clear
              </button>
            )}
          </div>

          <div className="text-xs font-medium text-slate-500 dark:text-slate-400 self-end sm:self-center">
            Showing <span className="text-purple-600 dark:text-purple-400 font-bold">{filteredProducts.length}</span> tools
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {CATEGORY_TABS.map((tab) => {
            const Icon = tab.icon;
            const isSelected = selectedCategory === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedCategory(tab.id)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/60 border border-slate-200 dark:border-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Products Grid */}
      {fetching ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-64 rounded-2xl bg-slate-100 dark:bg-slate-800/50 animate-pulse border border-slate-200 dark:border-slate-800"
            />
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-16 px-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
          <Package className="w-12 h-12 text-slate-400 mx-auto stroke-1" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">No products found</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            Try adjusting your search query or selecting a different category tab.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
            }}
            className="text-xs font-semibold text-purple-600 dark:text-purple-400 hover:underline"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProducts.map((product) => {
            const hasStock = product.stock > 0;
            return (
              <div
                key={product.id}
                className="group relative flex flex-col justify-between rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 hover:border-purple-500/40 dark:hover:border-purple-500/40 transition-all hover:shadow-lg hover:shadow-purple-500/5"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                      {product.category}
                    </span>
                    <span
                      className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                        hasStock
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          : 'bg-rose-500/10 text-rose-500'
                      }`}
                    >
                      {hasStock ? `${product.stock} Available` : 'Out of Stock'}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors line-clamp-1">
                      {product.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1 min-h-[32px]">
                      {product.summary}
                    </p>
                  </div>

                  <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400">
                    <div className="flex items-center gap-2">
                      <Zap className="w-3.5 h-3.5 text-amber-500" />
                      <span>{product.accessType || 'Instant Access'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                      <span>{product.warranty || 'Active Warranty'}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <p className="text-[11px] text-slate-400">Price</p>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-lg font-black text-slate-900 dark:text-white">
                        {formatNaira(product.priceNgn)}
                      </span>
                      {product.savingsNgn > 0 && (
                        <span className="text-[11px] text-slate-400 line-through">
                          {formatNaira(product.priceNgn + product.savingsNgn)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenDetails(product)}
                      className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-all"
                      title="View product specifications and instructions"
                    >
                      <Eye className="w-3.5 h-3.5 text-slate-400" />
                      <span>Details</span>
                    </button>

                    <button
                      disabled={!hasStock}
                      onClick={() => handleOpenPurchase(product)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm shadow-purple-600/20"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                      <span>Buy Now</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Purchase Modal */}
      {activeProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setActiveProduct(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400">
                {activeProduct.category}
              </span>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">
                {activeProduct.name}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {activeProduct.summary}
              </p>
            </div>

            {/* Modal Tabs: Product Details vs Instant Checkout */}
            <div className="flex border-b border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setModalTab('details')}
                className={`flex-1 py-2.5 text-xs font-bold transition-all border-b-2 ${
                  modalTab === 'details'
                    ? 'border-purple-600 text-purple-600 dark:text-purple-400'
                    : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                Features & Details
              </button>
              <button
                type="button"
                onClick={() => setModalTab('purchase')}
                className={`flex-1 py-2.5 text-xs font-bold transition-all border-b-2 ${
                  modalTab === 'purchase'
                    ? 'border-purple-600 text-purple-600 dark:text-purple-400'
                    : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                Checkout & Delivery
              </button>
            </div>

            {/* Guarantees Box */}
            <div className="p-3.5 rounded-2xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/40 grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-500 dark:text-purple-300 block text-[11px]">Warranty Guarantee:</span>
                <span className="font-bold text-slate-900 dark:text-purple-100">{activeProduct.warranty}</span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-purple-300 block text-[11px]">Delivery Mode:</span>
                <span className="font-bold text-slate-900 dark:text-purple-100">{activeProduct.accessType}</span>
              </div>
            </div>

            {/* TAB 1: Detailed Specifications & Guide */}
            {modalTab === 'details' ? (
              <div className="space-y-4 animate-in fade-in">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-2.5 text-xs text-slate-700 dark:text-slate-300 max-h-72 overflow-y-auto leading-relaxed">
                  <div className="font-semibold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] pb-1 border-b border-slate-200 dark:border-slate-700">
                    Product Overview & Access Guidelines
                  </div>
                  {activeProduct.description.split('\n').map((paragraph, idx) => {
                    const cleanP = paragraph.trim();
                    if (!cleanP) return null;
                    if (cleanP.startsWith('•') || cleanP.startsWith('-') || cleanP.startsWith('*')) {
                      return (
                        <div key={idx} className="flex items-start gap-2 pl-1 text-slate-700 dark:text-slate-300">
                          <span className="text-purple-600 dark:text-purple-400 font-bold">•</span>
                          <span>{cleanP.replace(/^[•\-\*]\s*/, '')}</span>
                        </div>
                      );
                    }
                    if (cleanP.includes('→')) {
                      return (
                        <div key={idx} className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-700 dark:text-purple-300 font-medium">
                          {cleanP}
                        </div>
                      );
                    }
                    return (
                      <p key={idx} className="text-slate-600 dark:text-slate-300 leading-normal">
                        {cleanP}
                      </p>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div>
                    <span className="text-[11px] text-slate-400 block">Unit Price</span>
                    <span className="text-lg font-black text-slate-900 dark:text-white">
                      {formatNaira(activeProduct.priceNgn)}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setModalTab('purchase')}
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all shadow-md shadow-purple-600/20"
                  >
                    <span>Proceed to Purchase</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              /* TAB 2: Purchase & Payment Form */
              <form onSubmit={handlePurchase} className="space-y-4 animate-in fade-in">
                {activeProduct.requiresCustomerEmail && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Recipient Email Address <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="Enter your email to receive invite / login link"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-900 dark:text-white"
                    />
                    <p className="text-[11px] text-slate-500">
                      Required by this service for direct team invite or license dispatch.
                    </p>
                  </div>
                )}

                {/* Quantity */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                  <div>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Quantity</p>
                    <p className="text-[11px] text-slate-400">Up to {activeProduct.stock} units</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-700 font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600"
                    >
                      -
                    </button>
                    <span className="w-8 text-center text-sm font-bold text-slate-900 dark:text-white">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.min(activeProduct.stock, q + 1))}
                      className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-700 font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 space-y-2">
                  <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span>Unit Price</span>
                    <span>{formatNaira(activeProduct.priceNgn)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span>Quantity</span>
                    <span>x {quantity}</span>
                  </div>
                  <div className="flex justify-between text-sm font-black text-slate-900 dark:text-white pt-2 border-t border-slate-200 dark:border-slate-700">
                    <span>Total Due</span>
                    <span className="text-purple-600 dark:text-purple-400">
                      {formatNaira(activeProduct.priceNgn * quantity)}
                    </span>
                  </div>
                </div>

                {/* Wallet Info */}
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
                  <span>Wallet Balance:</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {formatBalance ? formatBalance() : formatNaira(wallet?.balance || 0)}
                  </span>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setModalTab('details')}
                    className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    View Details
                  </button>
                  <button
                    type="submit"
                    disabled={purchasing}
                    className="flex-[2] py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold disabled:opacity-50 transition-all shadow-md shadow-purple-600/20"
                  >
                    {purchasing ? 'Processing Order...' : `Confirm & Pay ${formatNaira(activeProduct.priceNgn * quantity)}`}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Post-Purchase Delivery Modal */}
      {deliveryResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-emerald-500/30 rounded-3xl p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">
                Delivery Successful!
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Your order for <span className="font-bold text-slate-900 dark:text-white">{deliveryResult.productName}</span> has been fulfilled.
              </p>
            </div>

            {/* Delivery Box */}
            <div className="space-y-3">
              {deliveryResult.delivery?.activationLink && (
                <div className="p-3.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/50 space-y-1.5">
                  <p className="text-xs font-bold text-purple-900 dark:text-purple-300">Activation Link</p>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={deliveryResult.delivery.activationLink}
                      className="w-full text-xs bg-white dark:bg-slate-900 px-3 py-2 rounded-lg border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 font-mono select-all"
                    />
                    <a
                      href={deliveryResult.delivery.activationLink}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              )}

              {deliveryResult.delivery?.credentials && (
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-slate-900 dark:text-white">Credentials / License Key</p>
                    <button
                      onClick={() => handleCopy(deliveryResult.delivery.credentials, 'creds')}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-purple-600 dark:text-purple-400 hover:underline"
                    >
                      {copiedKey === 'creds' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedKey === 'creds' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <pre className="text-xs bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800 font-mono text-slate-800 dark:text-slate-200 whitespace-pre-wrap select-all">
                    {deliveryResult.delivery.credentials}
                  </pre>
                </div>
              )}

              {deliveryResult.delivery?.instructions && (
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
                  <p className="text-xs font-bold text-slate-900 dark:text-white">Usage Instructions</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400 whitespace-pre-wrap leading-relaxed">
                    {deliveryResult.delivery.instructions}
                  </p>
                </div>
              )}
            </div>

            <div className="pt-2 flex gap-3">
              <button
                onClick={() => setDeliveryResult(null)}
                className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all shadow-md shadow-purple-600/20"
              >
                Done & Return to Store
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
