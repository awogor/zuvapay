'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useWallet } from '@/context/WalletContext';
import { useToast } from '@/components/common/Toast';
import { formatNaira } from '@/lib/utils';
import { AccountLogItem } from '@/types';
import {
  ShoppingBag,
  ArrowLeft,
  ShieldCheck,
  AlertTriangle,
  Info,
  Check,
  Copy,
  Key,
  X,
  Boxes,
} from 'lucide-react';

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const productId = resolvedParams.id;
  const router = useRouter();

  const { wallet, payBill, refundBill, openReceipt } = useWallet();
  const { success, error, info } = useToast();

  const [product, setProduct] = useState<AccountLogItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [quantity, setQuantity] = useState<number>(1);

  // Modals
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [deliveredItem, setDeliveredItem] = useState<{
    title: string;
    credentials: any;
  } | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  useEffect(() => {
    async function loadProduct() {
      setFetching(true);
      try {
        const res = await fetch('/api/services/logs');
        const data = await res.json();
        if (data.success && Array.isArray(data.items)) {
          const found = data.items.find((p: AccountLogItem) => p.id === productId);
          setProduct(found || null);
        }
      } catch (err) {
        console.error('Failed to load product details', err);
      } finally {
        setFetching(false);
      }
    }
    loadProduct();
  }, [productId]);

  const maxQty = product?.stock ? Math.min(product.stock, 20) : 1;
  const unitPrice = product?.price || 0;
  const totalPrice = unitPrice * quantity;

  const handleBuy = async () => {
    if (!product) return;

    if (product.stock <= 0) {
      error('Out of Stock', 'This product is currently out of stock.');
      return;
    }

    if (quantity < 1 || quantity > product.stock) {
      error('Invalid Quantity', `Quantity must be between 1 and ${product.stock}`);
      return;
    }

    // 1. Pre-flight Balance Check
    if ((wallet?.balance || 0) < totalPrice) {
      error(
        'Insufficient Balance',
        `You need ${formatNaira(totalPrice)}, but your balance is ${formatNaira(
          wallet?.balance || 0
        )}. Please fund your wallet.`
      );
      return;
    }

    setLoading(true);

    // 2. CRITICAL: "Debit First, Fulfill Second"
    const debitResult = await payBill({
      amount: totalPrice,
      category: 'logs',
      description: `${product.title} (Qty: ${quantity})`,
      metadata: {
        itemId: product.id,
        itemTitle: product.title,
        category: product.category,
        quantity,
      },
    });

    if (!debitResult.success) {
      error('Debit Failed', debitResult.error || 'Failed to debit wallet');
      setLoading(false);
      return;
    }

    const reference = debitResult.reference!;

    // 3. Dispatch to Fadded API
    try {
      const res = await fetch('/api/services/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemId: product.id,
          quantity,
          reference,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        // 4. Automated Refund on Failure
        info('Fulfillment Rejected', 'Reversing transaction and refunding wallet immediately...');
        await refundBill({
          amount: totalPrice,
          title: `Account Log (${product.title})`,
          reason: data.error || 'Item out of stock or provider error',
          originalReference: reference,
        });
        error('Order Failed & Refunded', data.error || 'The provider could not fulfill this item.');
        setLoading(false);
        return;
      }

      // 5. Success: Open Instant Delivery Modal
      success('Purchase Successful!', 'Your account credentials have been released.');
      setDeliveredItem({
        title: product.title,
        credentials: data.credentials,
      });

      if (debitResult.transaction) {
        openReceipt({
          ...debitResult.transaction,
          metadata: {
            ...debitResult.transaction.metadata,
            faddedOrderId: data.orderId,
          },
        });
      }
    } catch (err: any) {
      await refundBill({
        amount: totalPrice,
        title: `Account Log (${product.title})`,
        reason: err.message || 'Client connection error',
        originalReference: reference,
      });
      error('Transaction Reverted', 'Network failure. Wallet balance has been refunded.');
    } finally {
      setLoading(false);
    }
  };

  const copyAllCredentials = () => {
    if (!deliveredItem?.credentials) return;
    const creds = deliveredItem.credentials;
    const text = creds.fullDetails || `Username: ${creds.username || ''}\nPassword: ${creds.password || ''}`;
    navigator.clipboard.writeText(text);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  if (fetching) {
    return (
      <div className="max-w-3xl mx-auto py-12 text-center space-y-4 animate-in fade-in">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm text-slate-500 dark:text-slate-400">Loading product details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-xl mx-auto py-12 text-center space-y-4">
        <div className="p-4 rounded-3xl bg-rose-500/10 text-rose-500 w-16 h-16 mx-auto flex items-center justify-center">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Product Not Found</h2>
        <p className="text-sm text-slate-500">The product you are looking for may have been archived or is out of stock.</p>
        <Link
          href="/services/logs/all"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 text-xs font-bold"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Store
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in pb-12">
      {/* Navigation Breadcrumb */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Products List
        </button>

        <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
          {product.category}
        </span>
      </div>

      {/* Main Product Card */}
      <div className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/80 p-6 md:p-8 backdrop-blur-xl shadow-xl space-y-6">
        {/* Title and Stock Banner */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 border-b border-slate-100 dark:border-white/5 pb-6">
          <div className="space-y-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-tight">
              {product.title}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Verified digital goods with instant sanitized credential delivery
            </p>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <span
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 ${
                product.stock > 0
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                  : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
              }`}
            >
              <Boxes className="w-4 h-4" />
              {product.stock > 0 ? `${product.stock} pcs in stock` : 'Out of stock'}
            </span>
          </div>
        </div>

        {/* Pricing & Quantity Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-white/5">
          <div>
            <span className="text-[11px] uppercase font-bold text-slate-400 block mb-1">Unit Price</span>
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
              {formatNaira(unitPrice)} <span className="text-xs text-slate-500 font-normal">/ Pcs</span>
            </div>
          </div>

          <div>
            <span className="text-[11px] uppercase font-bold text-slate-400 block mb-1">Select Quantity</span>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min={1}
                max={maxQty}
                value={quantity}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  if (isNaN(val)) setQuantity(1);
                  else setQuantity(Math.max(1, Math.min(val, product.stock)));
                }}
                disabled={product.stock <= 0}
                className="w-24 px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white font-mono font-bold text-base focus:outline-none focus:border-emerald-500"
              />
              <span className="text-xs text-slate-500">
                Total:{' '}
                <strong className="text-slate-900 dark:text-white font-mono text-sm">
                  {formatNaira(totalPrice)}
                </strong>
              </span>
            </div>
          </div>
        </div>

        {/* Product Description */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Product Description & Guidelines
          </h3>
          <div
            className="log-description-content prose dark:prose-invert max-w-none text-xs leading-relaxed text-slate-700 dark:text-slate-200 p-5 rounded-2xl bg-slate-50/50 dark:bg-slate-950/40 border border-slate-200 dark:border-white/5 space-y-2"
            dangerouslySetInnerHTML={{ __html: product.description }}
          />
        </div>

        {/* Disclaimer & Terms Box */}
        <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-500/5 to-teal-500/5 border border-emerald-500/20 space-y-2.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Info className="w-4 h-4 text-emerald-500" />
              Disclaimer
            </span>
            <button
              type="button"
              onClick={() => setShowTermsModal(true)}
              className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline flex items-center gap-1 text-[11px]"
            >
              👉 TERMS AND CONDITIONS
            </button>
          </div>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
            By purchasing any product, you agree that you are fully aware of these terms/conditions and agree to follow them!
          </p>
        </div>

        {/* Buy Now CTA */}
        <div className="pt-2">
          <button
            type="button"
            onClick={handleBuy}
            disabled={loading || product.stock <= 0}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm shadow-xl shadow-emerald-500/20 transition-all disabled:opacity-50"
          >
            <ShoppingBag className="w-5 h-5" />
            {loading
              ? 'Processing Secure Fulfillment...'
              : product.stock <= 0
              ? 'Currently Out of Stock'
              : `BUY NOW — ${formatNaira(totalPrice)}`}
          </button>

          <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 mt-3">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Automated Warranty: Immediate full wallet refund if purchase fails.</span>
          </div>
        </div>
      </div>

      {/* Small Terms & Conditions Popup Modal */}
      {showTermsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/10 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Terms and Condition 📝
              </h3>
              <button
                onClick={() => setShowTermsModal(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
              <p>
                Don’t use our product to harm other people , bullying on social networks, comment spam, threats, etc and to commit other illegal actions – fraud, extortion, data theft, etc.
              </p>
              <p className="font-bold text-rose-500">
                We do not support scam/fraud activities, so DO NOT USE OUR PRODUCTS FOR ILLEGAL ACTIVITIES .
              </p>
            </div>

            <button
              onClick={() => setShowTermsModal(false)}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg transition-all"
            >
              I Understand & Agree
            </button>
          </div>
        </div>
      )}

      {/* Instant Credentials Delivery Modal */}
      {deliveredItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-3xl border border-emerald-500/40 bg-white dark:bg-slate-900 shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-500">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Instant Goods Delivery</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{deliveredItem.title}</p>
                </div>
              </div>
              <button
                onClick={() => setDeliveredItem(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 space-y-3 font-mono text-xs">
              <div>
                <span className="text-slate-500 text-[10px] uppercase block">Credentials / Account Details:</span>
                <pre className="text-slate-900 dark:text-emerald-400 font-bold whitespace-pre-wrap select-all font-mono text-xs p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 overflow-x-auto">
                  {deliveredItem.credentials.fullDetails || deliveredItem.credentials.username}
                </pre>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={copyAllCredentials}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg transition-all"
              >
                {copiedAll ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copiedAll ? 'Credentials Copied!' : 'Copy All Credentials'}
              </button>
              <button
                onClick={() => setDeliveredItem(null)}
                className="px-5 py-3 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-semibold text-xs"
              >
                Done
              </button>
            </div>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Verified Account Credentials Delivered</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}