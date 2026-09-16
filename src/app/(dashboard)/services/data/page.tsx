'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useWallet } from '@/context/WalletContext';
import { useToast } from '@/components/common/Toast';
import { detectNetwork, formatNaira } from '@/lib/utils';
import { DataPlan } from '@/types';
import { Wifi, ArrowRight, ShieldCheck, ChevronDown, CheckCircle2, PlusCircle, Users } from 'lucide-react';
import CustomSearchDropdown, { type DropdownItem } from '@/components/common/CustomSearchDropdown';
import { BeneficiaryModal } from '@/components/modals/BeneficiaryModal';

const NETWORKS = [
  { id: 'MTN', name: 'MTN Nigeria' },
  { id: 'Airtel', name: 'Airtel Nigeria' },
  { id: 'Glo', name: 'Glo (Globacom)' },
  { id: '9mobile', name: '9mobile' },
  { id: 'Smile', name: 'Smile 4G LTE' },
];

export default function DataBundlePage() {
  const { wallet, payBill, refundBill, openReceipt, openFundModal, formatBalance } = useWallet();
  const { success, error, info } = useToast();

  const [network, setNetwork] = useState('');
  const [phone, setPhone] = useState('');
  const [plans, setPlans] = useState<DataPlan[]>([]);
  const [selectedPlanType, setSelectedPlanType] = useState<string>('All');
  const [selectedPlanId, setSelectedPlanId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [fetchingPlans, setFetchingPlans] = useState(false);
  const [showBeneficiaryModal, setShowBeneficiaryModal] = useState(false);
  const [bypassValidation, setBypassValidation] = useState(false);

  const handlePhoneChange = (val: string) => {
    let clean = val.replace(/\D/g, '');
    if (clean.startsWith('234') && clean.length > 10) {
      clean = '0' + clean.slice(3);
    }
    setPhone(clean.slice(0, 11));
  };

  const handleSelectBeneficiary = (b: { phone: string; network?: string }) => {
    setPhone(b.phone);
    if (b.network) {
      const netStr = b.network.toLowerCase();
      const match = NETWORKS.find((n) => n.id.toLowerCase() === netStr);
      if (match) {
        setNetwork(match.id);
      }
    }
  };

  // Auto-detect network from phone (unless bypassed for ported SIMs)
  useEffect(() => {
    if (bypassValidation) return;
    if (phone.length >= 4) {
      const detected = detectNetwork(phone);
      if (detected && detected !== network && NETWORKS.some((n) => n.id.toLowerCase() === detected.toLowerCase())) {
        setNetwork(detected);
      }
    }
  }, [phone, network, bypassValidation]);

  // Fetch plans when network changes
  useEffect(() => {
    async function loadPlans() {
      if (!network) {
        setPlans([]);
        setSelectedPlanId('');
        return;
      }

      setFetchingPlans(true);
      try {
        const res = await fetch(`/api/services/data?network=${network}`);
        const data = await res.json();
        if (data.success && data.plans.length > 0) {
          setPlans(data.plans);
          setSelectedPlanType('All');
          setSelectedPlanId('');
        } else {
          setPlans([]);
          setSelectedPlanId('');
        }
      } catch (err) {
        console.error('Failed to load data plans', err);
      } finally {
        setFetchingPlans(false);
      }
    }
    loadPlans();
  }, [network]);

  // Extract unique plan types for current network and place Direct in the middle with priority
  const availableTypes = useMemo(() => {
    const rawTypes = Array.from(new Set(plans.map((p) => p.type))).filter(Boolean);
    const hasDirect = rawTypes.includes('Direct');
    const otherTypes = rawTypes.filter((t) => t !== 'Direct');

    // Place 'Direct' strategically in the middle of the list
    if (hasDirect) {
      const mid = Math.floor(otherTypes.length / 2);
      const reordered = [
        ...otherTypes.slice(0, mid),
        'Direct',
        ...otherTypes.slice(mid),
      ];
      return ['All', ...reordered];
    }

    return ['All', ...rawTypes];
  }, [plans]);

  // Filter plans by selected plan category
  const filteredPlans = useMemo(() => {
    if (selectedPlanType === 'All') return plans;
    return plans.filter((p) => p.type === selectedPlanType);
  }, [plans, selectedPlanType]);

  // Keep selected plan valid when filtered list changes without auto-selecting
  useEffect(() => {
    if (filteredPlans.length > 0) {
      const exists = filteredPlans.some((p) => p.id === selectedPlanId);
      if (!exists) {
        setSelectedPlanId('');
      }
    } else {
      setSelectedPlanId('');
    }
  }, [filteredPlans, selectedPlanId]);

  const selectedPlan = plans.find((p) => p.id === selectedPlanId);

  const handlePurchase = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedPlan) {
      error('Select Plan', 'Please select a data bundle from the dropdown');
      return;
    }

    if (!phone || phone.length < 11) {
      error('Invalid Phone', 'Please enter a valid 11-digit phone number');
      return;
    }

    const price = selectedPlan.price;

    // 1. Pre-flight Balance Check with Fund Wallet action
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

    // 2. CRITICAL: "Debit First, Fulfill Second"
    const debitResult = await payBill({
      amount: price,
      category: 'data',
      description: `${network} ${selectedPlan.name} (${selectedPlan.dataAmount}) for ${phone}`,
      metadata: {
        network,
        phone,
        planName: selectedPlan.name,
        planType: selectedPlan.type,
        validity: selectedPlan.validity,
        planId: selectedPlan.id,
        provider: selectedPlan.vendor || (String(selectedPlan.id).startsWith('stro-') ? 'strowallet' : 'gongoz'),
        wholesale_cost: selectedPlan.vendor === 'strowallet' ? Math.round(price * 0.95) : Math.round(price * 0.90),
      },
    });

    if (!debitResult.success) {
      error('Debit Failed', debitResult.error || 'Failed to debit wallet');
      setLoading(false);
      return;
    }

    const reference = debitResult.reference!;

    // 3. Dispatch to Provider API
    try {
      const res = await fetch('/api/services/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          network,
          phone,
          planId: selectedPlan.id,
          vendor: selectedPlan.vendor || 'gongoz',
          variationCode: selectedPlan.variationCode,
          serviceName: selectedPlan.serviceName,
          serviceId: selectedPlan.serviceId,
          amount: selectedPlan.price,
          reference,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        // 4. AUTOMATED REFUND ON FAILURE
        info('Delivery Failed', 'Reversing transaction and returning funds to wallet...');
        await refundBill({
          amount: price,
          title: `${network} Data (${selectedPlan.name})`,
          reason: data.error || 'Provider rejected request',
          originalReference: reference,
        });
        error('Data Delivery Failed & Refunded', data.error || 'Network error. Funds returned.');
        setLoading(false);
        return;
      }

      // 5. SUCCESS
      success('Data Activated!', `${selectedPlan.name} has been sent to ${phone}.`);

      // Auto-save recipient number as beneficiary (30-day auto-retention)
      fetch('/api/user/beneficiaries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone,
          network,
          service_type: 'data',
        }),
      }).catch(() => {});

      // Reset form so the page is immediately fresh for the next transaction
      setPhone('');
      setSelectedPlanId('');

      if (debitResult.transaction) {
        openReceipt({
          ...debitResult.transaction,
          metadata: {
            ...debitResult.transaction.metadata,
            provider: data.vendor || selectedPlan.vendor || (String(selectedPlan.id).startsWith('stro-') ? 'strowallet' : 'gongoz'),
            operatorReference: data.operatorReference,
            wholesale_cost: data.wholesaleCost || (selectedPlan.vendor === 'strowallet' ? Math.round(price * 0.95) : Math.round(price * 0.90)),
          },
        });
      }
    } catch (err: any) {
      await refundBill({
        amount: price,
        title: `${network} Data (${selectedPlan.name})`,
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
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-2xl bg-sky-500/10 text-sky-500 border border-sky-500/20">
          <Wifi className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">Internet Data Bundles</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Instant automated SME, Corporate Gifting, and Direct Data activation
          </p>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/80 p-6 md:p-8 backdrop-blur-xl shadow-xl space-y-6">
        <form onSubmit={handlePurchase} className="space-y-4">
          {/* Network Dropdown */}
          <CustomSearchDropdown
            label="Select Network Provider"
            placeholder="-- Select Network Provider --"
            searchPlaceholder="Search network (e.g. MTN, Airtel)..."
            items={NETWORKS.map((n) => ({
              id: n.id,
              name: n.name,
            }))}
            selectedId={network}
            onSelect={(item) => setNetwork(String(item.id))}
            accentColor="sky"
            showSearchThreshold={10}
          />

          {/* Plan Category / Type Dropdown */}
          <CustomSearchDropdown
            label="Plan Category"
            placeholder="-- Select Plan Category --"
            searchPlaceholder="Search category..."
            items={availableTypes.map((t) => {
              const isDirect = t.toLowerCase() === 'direct';
              return {
                id: t,
                name: t === 'All' ? 'All Plan Types' : isDirect ? 'DIRECT Plans' : `${t} Plans`,
                badge: isDirect ? '(HOT)' : undefined,
                badgeColor: isDirect ? 'hot' : undefined,
              };
            })}
            selectedId={selectedPlanType}
            onSelect={(item) => setSelectedPlanType(String(item.id))}
            disabled={fetchingPlans || !network}
            accentColor="sky"
            showSearchThreshold={10}
          />

          {/* Data Bundle Package Dropdown */}
          <CustomSearchDropdown
            label="Data Bundle Package"
            placeholder={
              !network
                ? '-- Choose Network First --'
                : fetchingPlans
                ? '-- Loading Available Bundles --'
                : '-- Select Data Bundle Package --'
            }
            searchPlaceholder="Search bundles (e.g. 1GB, 5GB, Monthly)..."
            items={filteredPlans.map((p) => ({
              id: p.id,
              name: `${p.dataAmount} — ${p.validity} [${p.type}]`,
              subtitle: formatNaira(p.price),
            }))}
            selectedId={selectedPlanId}
            onSelect={(item) => setSelectedPlanId(String(item.id))}
            disabled={fetchingPlans || filteredPlans.length === 0}
            isLoading={fetchingPlans}
            loadingText="Updating plans..."
            accentColor="sky"
          />

          {/* Recipient Phone with Choose Beneficiary Link/Button */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Recipient Phone Number
              </label>
              <button
                type="button"
                onClick={() => setShowBeneficiaryModal(true)}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-500 hover:text-sky-600 dark:hover:text-sky-400 py-0.5 px-2 rounded-lg hover:bg-sky-500/10 transition-all active:scale-95"
              >
                <Users className="w-3.5 h-3.5" />
                <span>Choose Beneficiary</span>
              </button>
            </div>
            <input
              type="tel"
              value={phone}
              onChange={(e) => handlePhoneChange(e.target.value)}
              placeholder="08031234567"
              maxLength={11}
              required
              className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white font-mono text-sm tracking-wider focus:outline-none focus:border-sky-500"
            />

            {/* Ported SIM Bypass Number Validation Button */}
            <div className="flex items-center justify-between mt-2 px-0.5">
              <button
                type="button"
                onClick={() => setBypassValidation(!bypassValidation)}
                className={`inline-flex items-center gap-2 text-xs font-semibold transition-all py-1 px-2.5 rounded-lg border ${
                  bypassValidation
                    ? 'bg-amber-500/10 border-brand-orange/40 text-brand-orange dark:text-amber-400'
                    : 'bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <span
                  className={`w-3.5 h-3.5 rounded border flex items-center justify-center text-[10px] font-black transition-colors ${
                    bypassValidation
                      ? 'bg-brand-orange border-brand-orange text-slate-950'
                      : 'border-slate-400 dark:border-slate-600'
                  }`}
                >
                  {bypassValidation && '✓'}
                </span>
                <span>Bypass number validation</span>
              </button>
            </div>
          </div>

          {/* Selected Plan Details & Summary */}
          {selectedPlan && (
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-white/5 space-y-2.5 text-xs">
              <div className="flex justify-between text-slate-500 dark:text-slate-400">
                <span>Selected Bundle:</span>
                <span className="font-bold text-slate-800 dark:text-white">{selectedPlan.name}</span>
              </div>
              <div className="flex justify-between text-slate-500 dark:text-slate-400">
                <span>Validity & Type:</span>
                <span className="text-slate-700 dark:text-slate-300">{selectedPlan.validity} • {selectedPlan.type}</span>
              </div>

              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                <span>Available Wallet Balance:</span>
                <span className={`font-mono font-semibold ${(wallet?.balance || 0) < selectedPlan.price ? 'text-rose-500' : 'text-slate-800 dark:text-slate-200'}`}>
                  {formatBalance(wallet?.balance || 0)}
                </span>
              </div>

              <div className="flex justify-between pt-2 border-t border-slate-200 dark:border-white/5 text-sm font-bold text-slate-900 dark:text-white">
                <span>Total Debit:</span>
                <span className="font-mono text-sky-600 dark:text-sky-400">{formatNaira(selectedPlan.price)}</span>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !network || !selectedPlan}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-bold text-sm shadow-xl shadow-blue-500/20 transition-all disabled:opacity-50"
          >
            {loading
              ? 'Activating Data...'
              : !network
              ? 'Select Network Provider'
              : !selectedPlan
              ? 'Select Data Bundle Package'
              : `Pay ${formatNaira(selectedPlan.price)} Now`}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-white/5 pt-3">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
          <span>Automated Refund: Immediate wallet reversal if carrier network fails</span>
        </div>
      </div>

      {/* Beneficiary Selection Modal */}
      <BeneficiaryModal
        isOpen={showBeneficiaryModal}
        onClose={() => setShowBeneficiaryModal(false)}
        onSelect={handleSelectBeneficiary}
        serviceType="data"
      />
    </div>
  );
}

