'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useWallet } from '@/context/WalletContext';
import { useToast } from '@/components/common/Toast';
import { formatNaira } from '@/lib/utils';
import {
  TrendingUp,
  Instagram,
  Video,
  Youtube,
  Twitter,
  Facebook,
  Send,
  Link2,
  ArrowRight,
  ShieldCheck,
  ChevronDown,
  MessageSquare,
  Sparkles,
  Radio,
} from 'lucide-react';
import CustomSearchDropdown, { type DropdownItem } from '@/components/common/CustomSearchDropdown';
import SocialOrdersModal from '@/components/modals/SocialOrdersModal';
import {
  saveSocialOrder,
  getSocialOrders,
  getActiveSocialOrders,
  subscribeSocialOrders,
  type SocialOrderRecord,
} from '@/lib/socialOrders';

// Official TikTok SVG Icon
function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298-.002.595.042.88.13V9.4a6.33 6.33 0 0 0-.88-.06A6.34 6.34 0 0 0 3.14 15.7a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.75a8.28 8.28 0 0 0 4.87 1.58V6.87a4.87 4.87 0 0 1-1.1-.18Z" />
    </svg>
  );
}

const PLATFORMS = [
  { id: 'youtube', name: 'YouTube', icon: Youtube, color: 'text-red-500' },
  { id: 'instagram', name: 'Instagram', icon: Instagram, color: 'text-pink-500' },
  { id: 'facebook', name: 'Facebook', icon: Facebook, color: 'text-blue-500' },
  { id: 'twitter', name: 'X (Twitter)', icon: Twitter, color: 'text-sky-400' },
  { id: 'tiktok', name: 'TikTok', icon: TikTokIcon, color: 'text-pink-500 dark:text-cyan-400' },
  { id: 'telegram', name: 'Telegram', icon: Send, color: 'text-sky-500' },
];

export default function SocialBoostPage() {
  const routeParams = useParams();
  const router = useRouter();

  const selectedPlatform = (typeof routeParams?.category === 'string' ? routeParams.category : 'youtube').toLowerCase();

  const { wallet, payBill, refundBill, openReceipt, formatBalance } = useWallet();
  const { success, error, info } = useToast();

  const [services, setServices] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(null);
  const [link, setLink] = useState('');
  const [quantity, setQuantity] = useState<string>('');
  const [comments, setComments] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [fetchingServices, setFetchingServices] = useState(true);
  const [isOrdersModalOpen, setIsOrdersModalOpen] = useState(false);
  const [activeSocialOrders, setActiveSocialOrders] = useState<SocialOrderRecord[]>([]);
  const [allOrdersCount, setAllOrdersCount] = useState(0);

  // Sync social orders counts and live subscriptions
  useEffect(() => {
    const updateCounts = () => {
      const all = getSocialOrders();
      setAllOrdersCount(all.length);
      setActiveSocialOrders(getActiveSocialOrders());
    };
    updateCounts();
    const unsub = subscribeSocialOrders(updateCounts);
    return () => unsub();
  }, []);

  // Fetch services for the active platform
  useEffect(() => {
    async function loadServices() {
      setFetchingServices(true);
      setSelectedCategory('');
      setSelectedServiceId(null);
      setComments('');
      setQuantity('');
      try {
        const res = await fetch(`/api/services/social?platform=${selectedPlatform}`);
        const data = await res.json();
        if (data.success && data.services) {
          setServices(data.services);
        } else {
          setServices([]);
        }
      } catch (err) {
        console.error('Failed to load social services', err);
      } finally {
        setFetchingServices(false);
      }
    }
    loadServices();
  }, [selectedPlatform]);

  // Extract distinct subcategories for the current platform
  const categories = React.useMemo(() => {
    const set = new Set<string>();
    services.forEach((s) => {
      if (s.category) set.add(s.category);
    });
    return Array.from(set);
  }, [services]);

  // Filter services under the currently selected subcategory, sorted by minimum quantity ascending
  const filteredServices = React.useMemo(() => {
    if (!selectedCategory) return [];
    return services
      .filter((s) => s.category === selectedCategory)
      .sort((a, b) => a.min - b.min);
  }, [services, selectedCategory]);

  const selectedService = services.find((s) => s.serviceId === selectedServiceId);

  // Check if selected service requires custom comments
  const isCustomComment = Boolean(
    selectedService?.isCustomComment ||
    (selectedService?.type && selectedService.type.toLowerCase().includes('custom comment')) ||
    (selectedService?.name && selectedService.name.toLowerCase().includes('custom comment'))
  );

  // Count valid comment lines
  const commentLines = React.useMemo(() => {
    if (!comments) return [];
    return comments
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0);
  }, [comments]);

  // Quantity is automatically derived from the count of comments if custom comment, otherwise from quantity input
  const numQty = isCustomComment ? commentLines.length : parseInt(quantity, 10) || 0;

  const calculatedCost = selectedService
    ? Math.round((selectedService.ratePer1000 / 1000) * numQty)
    : 0;

  const handleOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCategory) {
      error('Select Category', 'Please choose a service category first');
      return;
    }

    if (!selectedService) {
      error('Select Package', 'Please choose a growth service package');
      return;
    }

    if (!link || !link.startsWith('http')) {
      error('Invalid Link', 'Please enter a valid URL (starting with https://)');
      return;
    }

    if (isCustomComment) {
      if (commentLines.length === 0) {
        error('Custom Comments Required', 'Please enter your custom comments (one per line).');
        return;
      }
      if (commentLines.length < selectedService.min || commentLines.length > selectedService.max) {
        error(
          'Comment Count Mismatch',
          `You provided ${commentLines.length} comments. This package requires between ${selectedService.min} and ${selectedService.max} comments.`
        );
        return;
      }
    } else {
      if (numQty < selectedService.min || numQty > selectedService.max) {
        error(
          'Invalid Quantity',
          `Quantity must be between ${selectedService.min} and ${selectedService.max}`
        );
        return;
      }
    }

    // 1. Pre-flight Balance Check
    if ((wallet?.balance || 0) < calculatedCost) {
      error(
        'Insufficient Balance',
        `You need ${formatNaira(calculatedCost)}, but your balance is ${formatNaira(
          wallet?.balance || 0
        )}. Please fund your wallet.`
      );
      return;
    }

    setLoading(true);

    // 2. CRITICAL: "Debit First, Fulfill Second"
    const debitResult = await payBill({
      amount: calculatedCost,
      category: 'social',
      description: `${selectedService.name} (${isCustomComment ? `${numQty} Custom Comments` : `Qty: ${numQty.toLocaleString()}`})`,
      metadata: {
        platform: selectedPlatform,
        category: selectedCategory,
        serviceId: selectedService.serviceId,
        serviceName: selectedService.name,
        targetLink: link,
        quantity: numQty,
        isCustomComment,
        commentsCount: isCustomComment ? commentLines.length : undefined,
      },
    });

    if (!debitResult.success) {
      error('Debit Failed', debitResult.error || 'Failed to debit wallet');
      setLoading(false);
      return;
    }

    const reference = debitResult.reference!;

    // 3. Dispatch to MomoPanel API
    try {
      const res = await fetch('/api/services/social', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceId: selectedService.serviceId,
          link,
          quantity: numQty,
          comments: isCustomComment ? comments : undefined,
          reference,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        // 4. Automated Refund on Failure
        info('Order Failed', 'Reversing transaction and refunding wallet immediately...');
        await refundBill({
          amount: calculatedCost,
          title: `Social Boost (${selectedService.name})`,
          reason: data.error || 'Provider rejected request',
          originalReference: reference,
        });
        error('Order Failed & Refunded', data.error || 'Provider rejected order.');
        setLoading(false);
        return;
      }

      // 5. Success - Register into Live Social Tracker
      saveSocialOrder({
        orderId: data.orderId,
        reference,
        platform: (selectedPlatform as any) || 'youtube',
        category: selectedCategory,
        serviceName: selectedService.name,
        serviceId: selectedService.serviceId,
        link,
        quantity: numQty,
        price: calculatedCost,
        createdAt: Date.now(),
        status: 'Pending',
        remains: numQty,
      });

      success('Order Placed!', `Order #${data.orderId} submitted for ${link}.`);

      if (debitResult.transaction) {
        openReceipt({
          ...debitResult.transaction,
          metadata: {
            ...debitResult.transaction.metadata,
            momoOrderId: data.orderId,
          },
        });
      }
    } catch (err: any) {
      await refundBill({
        amount: calculatedCost,
        title: `Social Boost (${selectedService.name})`,
        reason: err.message || 'Client network failure',
        originalReference: reference,
      });
      error('Transaction Reverted', 'Network failure. Wallet balance has been refunded.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6 animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-pink-500/10 text-pink-500 border border-pink-500/20">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              Social Media Growth
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Real followers, likes, views & livestream engagement for your favorite platforms
            </p>
          </div>
        </div>

        {/* Live Order Tracker Trigger */}
        <button
          type="button"
          onClick={() => setIsOrdersModalOpen(true)}
          className="relative flex items-center gap-2 px-3.5 py-2.5 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold text-slate-800 dark:text-white shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98] group flex-shrink-0 self-start sm:self-auto"
        >
          <Radio className={`w-3.5 h-3.5 text-brand-orange ${activeSocialOrders.length > 0 ? 'animate-pulse' : ''}`} />
          <span>Track Orders</span>
          {activeSocialOrders.length > 0 ? (
            <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[10px] font-black border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              {activeSocialOrders.length} active
            </span>
          ) : allOrdersCount > 0 ? (
            <span className="px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 text-[10px] font-bold">
              {allOrdersCount}
            </span>
          ) : null}
        </button>
      </div>

      {/* 1. Platform Selector (Small Icon Left, Text Right, Compact Rounded Pills) */}
      <div className="flex flex-wrap items-center gap-2">
        {PLATFORMS.map((plat) => {
          const Icon = plat.icon;
          const isActive = selectedPlatform === plat.id;

          return (
            <button
              key={plat.id}
              type="button"
              onClick={() => router.push(`/services/social/${plat.id}`)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-semibold transition-all shadow-sm ${
                isActive
                  ? 'border-brand-orange bg-brand-orange/10 text-brand-orange ring-1 ring-brand-orange/30 shadow-brand-orange/5 font-bold'
                  : 'border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/70 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-white/20 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${plat.color}`} />
              <span className="truncate whitespace-nowrap">{plat.name}</span>
            </button>
          );
        })}
      </div>

      {/* Active Boost In-Progress Mini Banner */}
      {activeSocialOrders.length > 0 && (
        <div
          onClick={() => setIsOrdersModalOpen(true)}
          className="cursor-pointer p-3.5 rounded-2xl border border-brand-orange/30 bg-gradient-to-r from-brand-orange/10 via-pink-500/10 to-transparent flex items-center justify-between gap-3 text-xs text-slate-800 dark:text-slate-200 hover:border-brand-orange/50 transition-all shadow-sm group"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-orange animate-ping flex-shrink-0" />
            <div className="truncate">
              <span className="font-bold text-brand-orange">Live Delivery: </span>
              <span className="font-semibold text-slate-900 dark:text-white truncate">
                {activeSocialOrders[0].serviceName}
              </span>
              <span className="text-slate-500 dark:text-slate-400 text-[11px] ml-1.5">
                (#{activeSocialOrders[0].orderId})
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1 font-bold text-brand-orange text-[11px] flex-shrink-0 group-hover:translate-x-0.5 transition-transform">
            <span>View Tracker</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>
      )}

      {/* Main Order Form Card */}
      <div className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/80 p-6 md:p-8 backdrop-blur-xl shadow-xl space-y-5">
        <form onSubmit={handleOrder} className="space-y-4">
          {/* 2. Service Category Dropdown */}
          <CustomSearchDropdown
            label="1. Select Category"
            placeholder={
              fetchingServices
                ? '-- Loading categories... --'
                : '-- Select Service Category --'
            }
            searchPlaceholder="Search category..."
            items={categories.map((cat) => ({
              id: cat,
              name: cat,
            }))}
            selectedId={selectedCategory}
            onSelect={(item) => {
              setSelectedCategory(String(item.id));
              setSelectedServiceId(null);
            }}
            disabled={fetchingServices || categories.length === 0}
            isLoading={fetchingServices}
            loadingText="Loading categories..."
            accentColor="orange"
          />

          {/* 3. Package / Service Dropdown */}
          <CustomSearchDropdown
            label="2. Select Package / Service"
            placeholder={
              !selectedCategory
                ? '-- Select Category First --'
                : '-- Select Package / Service --'
            }
            searchPlaceholder="Search packages & rates..."
            items={filteredServices.map((s) => ({
              id: s.serviceId,
              name: s.name,
              subtitle: `${formatNaira(s.ratePer1000)} / 1K`,
            }))}
            selectedId={selectedServiceId}
            onSelect={(item) => setSelectedServiceId(Number(item.id))}
            disabled={!selectedCategory || filteredServices.length === 0}
            accentColor="orange"
          />
          {selectedService?.description && (
            <p className="text-[11px] text-slate-500 dark:text-slate-400 -mt-1">
              {selectedService.description}
            </p>
          )}

          {/* 4. Target Profile / Post URL */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Target Link / URL
            </label>
            <div className="relative">
              <Link2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="url"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder="https://... profile, post, channel, or video link"
                required
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white text-sm font-medium focus:outline-none focus:border-brand-orange"
              />
            </div>
          </div>

          {/* 5. Custom Comments Section (Shown when selected package is Custom Comments) */}
          {selectedService && isCustomComment ? (
            <div className="space-y-2 p-4 rounded-2xl bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-amber-500" />
                  Custom Comments (1 per line)
                </label>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[11px] font-mono font-bold ${
                      commentLines.length >= selectedService.min && commentLines.length <= selectedService.max
                        ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                        : commentLines.length > 0
                        ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                    }`}
                  >
                    {commentLines.length} {commentLines.length === 1 ? 'comment' : 'comments'}
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">
                    Min: {selectedService.min} • Max: {selectedService.max.toLocaleString()}
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Write or paste each comment on a separate new line. Each non-empty line counts as 1 comment.
              </p>

              <textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder={`Great video! Very informative!\nLove this content, keep it up 🔥\nSubscribed and liked! 👏\nLooking forward to the next upload.`}
                rows={5}
                required
                className="w-full p-3.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white font-sans text-xs leading-relaxed focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 resize-y"
              />

              {commentLines.length > 0 && (
                <div className="flex items-center justify-between text-[11px] pt-1">
                  <span className="text-slate-500 dark:text-slate-400">
                    Calculated Quantity:{' '}
                    <strong className="text-slate-900 dark:text-white font-mono">
                      {commentLines.length}
                    </strong>
                  </span>
                  {commentLines.length < selectedService.min && (
                    <span className="text-rose-500 font-semibold">
                      Need at least {selectedService.min - commentLines.length} more comment{selectedService.min - commentLines.length > 1 ? 's' : ''}
                    </span>
                  )}
                  {commentLines.length > selectedService.max && (
                    <span className="text-rose-500 font-semibold">
                      Exceeds max limit by {commentLines.length - selectedService.max} comments
                    </span>
                  )}
                </div>
              )}
            </div>
          ) : (
            /* Standard Quantity Input */
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Quantity
                </label>
                {selectedService ? (
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Min: {selectedService.min.toLocaleString()} • Max:{' '}
                    {selectedService.max.toLocaleString()}
                  </span>
                ) : (
                  <span className="text-[11px] text-slate-400 italic">Select package to view limits</span>
                )}
              </div>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder={selectedService ? `e.g. ${selectedService.min}` : 'Select package first'}
                disabled={!selectedService}
                min={selectedService?.min || 10}
                max={selectedService?.max || 1000000}
                step={50}
                required
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white font-mono text-base font-bold focus:outline-none focus:border-brand-orange disabled:opacity-50"
              />
            </div>
          )}

          {/* 6. Pricing Breakdown */}
          {selectedService && (
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-white/5 space-y-2 text-xs animate-in fade-in">
              <div className="flex justify-between text-slate-500 dark:text-slate-400">
                <span>Rate per 1,000 Units:</span>
                <span className="font-mono text-slate-800 dark:text-slate-200">
                  {formatNaira(selectedService.ratePer1000)}
                </span>
              </div>
              <div className="flex justify-between text-slate-500 dark:text-slate-400">
                <span>Ordered Quantity:</span>
                <span className="font-mono text-slate-800 dark:text-slate-200">
                  {numQty > 0 ? numQty.toLocaleString() : '0'}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                <span>Available Wallet Balance:</span>
                <span
                  className={`font-mono font-semibold ${
                    (wallet?.balance || 0) < calculatedCost
                      ? 'text-rose-500'
                      : 'text-slate-800 dark:text-slate-200'
                  }`}
                >
                  {formatBalance(wallet?.balance || 0)}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-200 dark:border-white/5 text-sm font-bold text-slate-900 dark:text-white">
                <span>Total Debit:</span>
                <span className="font-mono text-brand-orange">
                  {calculatedCost > 0 ? formatNaira(calculatedCost) : '—'}
                </span>
              </div>
            </div>
          )}

          {/* Action Button */}
          <button
            type="submit"
            disabled={
              loading ||
              !selectedCategory ||
              !selectedService ||
              numQty < (selectedService?.min || 1) ||
              numQty > (selectedService?.max || 1000000) ||
              calculatedCost <= 0
            }
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-brand-orange to-pink-500 hover:from-orange-600 hover:to-pink-600 text-slate-950 font-bold text-sm shadow-xl shadow-pink-500/20 transition-all disabled:opacity-50"
          >
            {loading
              ? 'Submitting order...'
              : !selectedCategory
              ? 'Select Service Category'
              : !selectedService
              ? 'Select Package / Service'
              : isCustomComment && numQty === 0
              ? 'Write Custom Comments (1 per line)'
              : isCustomComment && numQty < (selectedService?.min || 1)
              ? `Add More Comments (Min: ${selectedService.min})`
              : isCustomComment && numQty > (selectedService?.max || 1000000)
              ? `Too Many Comments (Max: ${selectedService.max})`
              : numQty <= 0
              ? 'Enter Desired Quantity'
              : isCustomComment
              ? `Submit ${numQty} Custom Comments (${formatNaira(calculatedCost)})`
              : `Order Now (${formatNaira(calculatedCost)})`}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-white/5 pt-3">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400 flex-shrink-0" />
          <span>Automated Refund: If server cannot fulfill order, wallet is refunded 100%</span>
        </div>
      </div>

      {/* Live Social Boost Order Tracker Modal */}
      <SocialOrdersModal
        isOpen={isOrdersModalOpen}
        onClose={() => setIsOrdersModalOpen(false)}
        defaultPlatform={selectedPlatform}
      />
    </div>
  );
}
