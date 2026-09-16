'use client';

import React, { useState, useEffect } from 'react';
import { useWallet } from '@/context/WalletContext';
import { useToast } from '@/components/common/Toast';
import { formatNaira } from '@/lib/utils';
import { Tv, UserCheck, AlertCircle, ArrowRight, ShieldCheck, ChevronDown, PlusCircle } from 'lucide-react';
import CustomSearchDropdown, { type DropdownItem } from '@/components/common/CustomSearchDropdown';
import { BeneficiaryModal } from '@/components/modals/BeneficiaryModal';

const PROVIDERS = [
  { id: 'gotv', name: 'GOtv Nigeria' },
  { id: 'dstv', name: 'DStv Nigeria' },
  { id: 'startimes', name: 'StarTimes' },
];

export default function CableTvPage() {
  const { wallet, payBill, refundBill, openReceipt, openFundModal, formatBalance } = useWallet();
  const { success, error, info } = useToast();

  const [provider, setProvider] = useState('');
  const [iucNumber, setIucNumber] = useState('');
  const [bouquets, setBouquets] = useState<{ id: string; name: string; price: number }[]>([]);
  const [selectedBouquetId, setSelectedBouquetId] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingBouquets, setLoadingBouquets] = useState(false);
  const [showBeneficiaryModal, setShowBeneficiaryModal] = useState(false);

  // Validation state
  const [validating, setValidating] = useState(false);
  const [customerName, setCustomerName] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSelectBeneficiary = (b: {
    phone: string;
    network: string;
    customerName?: string;
  }) => {
    setIucNumber(b.phone);
    if (b.network) {
      setProvider(b.network.toLowerCase());
    }
    if (b.customerName) {
      setCustomerName(b.customerName);
      setValidationError(null);
    }
  };

  // Fetch bouquets when provider changes
  useEffect(() => {
    if (!provider) {
      setBouquets([]);
      setSelectedBouquetId('');
      return;
    }

    async function loadBouquets() {
      setLoadingBouquets(true);
      try {
        const res = await fetch(`/api/services/tv?provider=${provider}`);
        const data = await res.json();
        if (data.success && data.bouquets && data.bouquets.length > 0) {
          setBouquets(data.bouquets);
          setSelectedBouquetId('');
        } else {
          setBouquets([]);
          setSelectedBouquetId('');
        }
      } catch (err) {
        console.error('Failed to load bouquets', err);
      } finally {
        setLoadingBouquets(false);
      }
    }
    loadBouquets();
  }, [provider]);

  // Debounced smartcard validation
  useEffect(() => {
    if (!provider || iucNumber.trim().length < 8) {
      setCustomerName(null);
      setValidationError(null);
      return;
    }

    const timer = setTimeout(async () => {
      setValidating(true);
      setValidationError(null);
      try {
        const res = await fetch('/api/services/validate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'cable',
            account: iucNumber.trim(),
            provider,
          }),
        });
        const data = await res.json();
        if (data.success) {
          setCustomerName(data.customerName);
        } else {
          setCustomerName(null);
          setValidationError(data.error || 'Smartcard verification failed');
        }
      } catch {
        setValidationError('Validation service unreachable');
      } finally {
        setValidating(false);
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [iucNumber, provider]);

  const selectedBouquet = bouquets.find((b) => b.id === selectedBouquetId);
  const price = selectedBouquet?.price || 0;

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!provider) {
      error('Select Provider', 'Please select a TV provider first');
      return;
    }

    if (!iucNumber || iucNumber.length < 8) {
      error('Invalid Smartcard', 'Please enter a valid Smartcard / IUC number');
      return;
    }

    if (!selectedBouquet) {
      error('Select Bouquet', 'Please choose a TV subscription package');
      return;
    }

    // Pre-flight balance check with Fund Wallet action
    const currentBalance = wallet?.balance || 0;
    if (currentBalance < price) {
      error(
        'Insufficient Balance',
        `You need ${formatNaira(price)}, but your balance is ${formatNaira(currentBalance)}. Please fund your wallet.`,
        {
          label: 'Fund Wallet',
          onClick: openFundModal,
        }
      );
      return;
    }

    setLoading(true);

    // 1. Debit First
    const debitResult = await payBill({
      amount: price,
      category: 'cable',
      description: `${provider.toUpperCase()} TV: ${selectedBouquet.name} (${iucNumber})`,
      metadata: {
        provider,
        iucNumber,
        bouquetName: selectedBouquet.name,
        customerName: customerName || 'Verified Subscriber',
      },
    });

    if (!debitResult.success) {
      error('Debit Failed', debitResult.error || 'Failed to debit wallet');
      setLoading(false);
      return;
    }

    const reference = debitResult.reference!;

    // 2. Dispatch to Provider API
    try {
      const res = await fetch('/api/services/tv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider,
          iucNumber,
          bouquetId: selectedBouquet.id,
          bouquetName: selectedBouquet.name,
          variationCode: (selectedBouquet as any).variationCode || selectedBouquet.id,
          amount: selectedBouquet.price,
          customerName,
          reference,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        // 3. Automated Refund on Failure
        info('Activation Failed', 'Reversing transaction and refunding wallet...');
        await refundBill({
          amount: price,
          title: `${provider.toUpperCase()} Subscription (${selectedBouquet.name})`,
          reason: data.error || 'Provider rejected request',
          originalReference: reference,
        });
        error('Cable TV Failed & Refunded', data.error || 'Gateway timeout. Funds returned.');
        setLoading(false);
        return;
      }

      // 4. Success
      success('TV Subscription Active!', `${selectedBouquet.name} activated on smartcard ${iucNumber}.`);

      // Auto-save IUC / smartcard as beneficiary (30-day auto-retention)
      fetch('/api/user/beneficiaries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: iucNumber,
          network: provider,
          service_type: 'tv',
          customer_name: customerName || undefined,
        }),
      }).catch(() => {});

      // Reset form so the page is immediately fresh for the next transaction
      setIucNumber('');
      setSelectedBouquetId('');
      setCustomerName(null);
      setValidationError(null);

      if (debitResult.transaction) {
        openReceipt({
          ...debitResult.transaction,
          metadata: {
            ...debitResult.transaction.metadata,
            operatorReference: data.operatorReference,
          },
        });
      }
    } catch (err: any) {
      await refundBill({
        amount: price,
        title: `${provider.toUpperCase()} Subscription (${selectedBouquet.name})`,
        reason: err.message || 'Client connection failure',
        originalReference: reference,
      });
      error('Transaction Reverted', 'Connection failure. Wallet balance has been refunded.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6 animate-in fade-in">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-500 border border-purple-500/20">
          <Tv className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">Cable TV Subscription</h1>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/80 p-6 md:p-8 backdrop-blur-xl shadow-xl space-y-6">
        <form onSubmit={handleSubscribe} className="space-y-4">
          {/* Provider Dropdown */}
          <CustomSearchDropdown
            label="Select TV Provider"
            placeholder="-- Select TV Provider --"
            searchPlaceholder="Search provider (e.g. DStv, GOtv)..."
            items={PROVIDERS.map((p) => ({
              id: p.id,
              name: p.name,
            }))}
            selectedId={provider}
            onSelect={(item) => setProvider(String(item.id))}
            accentColor="purple"
            showSearchThreshold={10}
          />

          {/* Bouquet Selection Dropdown */}
          <CustomSearchDropdown
            label="Package Bouquet"
            placeholder={
              !provider
                ? '-- Select TV Provider First --'
                : loadingBouquets
                ? '-- Loading Bouquets --'
                : '-- Select Package Bouquet --'
            }
            searchPlaceholder="Search bouquet plans..."
            items={bouquets.map((b) => ({
              id: b.id,
              name: b.name,
              subtitle: formatNaira(b.price),
            }))}
            selectedId={selectedBouquetId}
            onSelect={(item) => setSelectedBouquetId(String(item.id))}
            disabled={!provider || loadingBouquets || bouquets.length === 0}
            isLoading={loadingBouquets}
            loadingText="Loading bouquets..."
            accentColor="purple"
          />

          {/* IUC / Smartcard Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Smartcard / IUC Number
              </label>
              <div className="flex items-center gap-2">
                {customerName && (
                  <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <UserCheck className="w-3.5 h-3.5" />
                    Verified
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => setShowBeneficiaryModal(true)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 py-0.5 px-2 rounded-lg hover:bg-sky-500/10 transition-all active:scale-95"
                >
                  <Tv className="w-3.5 h-3.5" />
                  <span>Saved Smartcards</span>
                </button>
              </div>
            </div>
            <div className="relative">
              <input
                type="text"
                value={iucNumber}
                onChange={(e) => setIucNumber(e.target.value)}
                placeholder="Enter 10 or 11 digit smartcard number"
                required
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white font-mono text-sm focus:outline-none focus:border-purple-500 pr-24"
              />
              {validating && (
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-amber-500 animate-pulse font-semibold">
                  Verifying...
                </span>
              )}
            </div>

            {customerName && (
              <div className="mt-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-300">
                <UserCheck className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <span className="font-bold">{customerName}</span>
              </div>
            )}

            {validationError && (
              <div className="mt-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-2 text-xs text-rose-600 dark:text-rose-300">
                <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />
                <span>{validationError}</span>
              </div>
            )}
          </div>

          {/* Pricing summary */}
          {selectedBouquet && (
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-white/5 space-y-2.5 text-xs">
              <div className="flex justify-between text-slate-500 dark:text-slate-400">
                <span>Selected Package:</span>
                <span className="font-bold text-slate-800 dark:text-white">{selectedBouquet.name}</span>
              </div>

              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                <span>Available Wallet Balance:</span>
                <span className={`font-mono font-semibold ${(wallet?.balance || 0) < selectedBouquet.price ? 'text-rose-500' : 'text-slate-800 dark:text-slate-200'}`}>
                  {formatBalance(wallet?.balance || 0)}
                </span>
              </div>

              <div className="flex justify-between text-slate-500 dark:text-slate-400">
                <span>Convenience / Service Fee:</span>
                <span className="font-bold text-emerald-500 dark:text-emerald-400">₦0 (No Fee)</span>
              </div>

              <div className="flex justify-between pt-2 border-t border-slate-200 dark:border-white/5 text-sm font-bold text-slate-900 dark:text-white">
                <span>Total Debit Amount:</span>
                <span className="font-mono text-purple-600 dark:text-purple-400">{formatNaira(selectedBouquet.price)}</span>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || validating || !provider || !selectedBouquet || !iucNumber}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-bold text-sm shadow-xl shadow-purple-500/20 transition-all disabled:opacity-50"
          >
            {loading
              ? 'Activating Subscription...'
              : validating
              ? 'Validating Smartcard...'
              : !provider
              ? 'Select TV Provider'
              : !selectedBouquet
              ? 'Select Package Bouquet'
              : `Pay ${formatNaira(price)} Now`}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-white/5 pt-3">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
          <span>Automated Refund: Immediate 100% wallet reversal if activation fails</span>
        </div>
      </div>

      <BeneficiaryModal
        isOpen={showBeneficiaryModal}
        onClose={() => setShowBeneficiaryModal(false)}
        onSelect={handleSelectBeneficiary}
        serviceType="tv"
      />
    </div>
  );
}

