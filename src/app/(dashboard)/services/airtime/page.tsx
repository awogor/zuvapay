'use client';

import React, { useState, useEffect } from 'react';
import { useWallet } from '@/context/WalletContext';
import { useToast } from '@/components/common/Toast';
import { detectNetwork, formatNaira } from '@/lib/utils';
import { Smartphone, ArrowRight, ShieldCheck, ChevronDown, CheckCircle2, Wallet as WalletIcon, PlusCircle, Users } from 'lucide-react';
import CustomSearchDropdown from '@/components/common/CustomSearchDropdown';
import { BeneficiaryModal } from '@/components/modals/BeneficiaryModal';

const NETWORKS = [
  { id: 'MTN', name: 'MTN Nigeria' },
  { id: 'Airtel', name: 'Airtel Nigeria' },
  { id: 'Glo', name: 'Glo (Globacom)' },
  { id: '9mobile', name: '9mobile' },
  { id: 'Smile', name: 'Smile 4G LTE' },
];

export default function AirtimePage() {
  const { wallet, payBill, refundBill, openReceipt, openFundModal, formatBalance } = useWallet();
  const { success, error, info } = useToast();

  const [network, setNetwork] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [showBeneficiaryModal, setShowBeneficiaryModal] = useState(false);
  const [bypassValidation, setBypassValidation] = useState(false);

  const handlePhoneChange = (val: string) => {
    let clean = val.replace(/\D/g, '');
    if (clean.startsWith('234') && clean.length > 10) {
      clean = '0' + clean.slice(3);
    }
    setPhoneNumber(clean.slice(0, 11));
  };

  const handleSelectBeneficiary = (b: { phone: string; network?: string }) => {
    setPhoneNumber(b.phone);
    if (b.network) {
      const netStr = b.network.toLowerCase();
      const match = NETWORKS.find((n) => n.id.toLowerCase() === netStr);
      if (match) {
        setNetwork(match.id);
        setBypassValidation(true);
      }
    }
  };

  // Auto-detect network based on Nigerian phone prefix (unless bypassed for ported SIMs)
  useEffect(() => {
    if (bypassValidation) return;
    if (phoneNumber.length >= 4) {
      const detected = detectNetwork(phoneNumber);
      if (detected && detected !== network && NETWORKS.some((n) => n.id.toLowerCase() === detected.toLowerCase())) {
        setNetwork(detected);
      }
    }
  }, [phoneNumber, network, bypassValidation]);

  const numAmount = parseFloat(amount) || 0;
  const payableAmount = Math.round(numAmount);

  const quickAmounts = [200, 500, 1000, 2000, 5000];

  const handlePurchase = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!network) {
      error('Select Network', 'Please select a telco network provider');
      return;
    }

    if (!phoneNumber || phoneNumber.length < 11) {
      error('Invalid Phone Number', 'Enter a valid 11-digit phone number');
      return;
    }

    if (!amount || numAmount < 50) {
      error('Enter Recharge Amount', 'Minimum airtime purchase is ₦50');
      return;
    }

    // 1. Pre-flight Balance Check with Fund Wallet action
    const currentBalance = wallet?.balance || 0;
    if (currentBalance < payableAmount) {
      error(
        'Insufficient Balance',
        `You need ${formatNaira(payableAmount)}, but your balance is ${formatNaira(currentBalance)}. Please fund your wallet.`,
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
      amount: payableAmount,
      category: 'airtime',
      description: `${network} Airtime Recharge for ${phoneNumber}`,
      metadata: {
        network,
        phoneNumber,
        nominalAmount: numAmount,
        provider: 'strowallet',
        wholesale_cost: Number((numAmount * 0.98).toFixed(2)),
      },
    });

    if (!debitResult.success) {
      error('Debit Failed', debitResult.error || 'Could not debit wallet balance');
      setLoading(false);
      return;
    }

    const reference = debitResult.reference!;

    // 3. Call External Provider (GongozAPI)
    try {
      const res = await fetch('/api/services/airtime', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          network,
          phone: phoneNumber,
          amount: numAmount,
          reference,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        // 4. AUTOMATED REFUND ON FAILURE
        info('Order Failed', 'Reversing transaction and issuing full refund to wallet...');
        await refundBill({
          amount: payableAmount,
          title: `${network} Airtime (${phoneNumber})`,
          reason: data.error || 'Provider rejected request',
          originalReference: reference,
        });
        error('Recharge Failed & Refunded', data.error || 'Network error. Funds returned.');
        setLoading(false);
        return;
      }

      // 5. SUCCESS: Display receipt and toast
      success(
        'Airtime Successful!',
        `${formatNaira(numAmount)} ${network} airtime sent to ${phoneNumber}.`
      );

      // Auto-save recipient number as beneficiary (30-day auto-retention)
      fetch('/api/user/beneficiaries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: phoneNumber,
          network,
          service_type: 'airtime',
        }),
      }).catch(() => {});

      // Reset form so the page is immediately fresh for the next transaction
      setPhoneNumber('');
      setAmount('');

      if (debitResult.transaction) {
        openReceipt({
          ...debitResult.transaction,
          metadata: {
            ...debitResult.transaction.metadata,
            provider: data.provider || 'strowallet',
            operatorReference: data.operatorReference,
            wholesale_cost: data.wholesaleCost || Number((numAmount * 0.98).toFixed(2)),
          },
        });
      }
    } catch (err: any) {
      await refundBill({
        amount: payableAmount,
        title: `${network} Airtime (${phoneNumber})`,
        reason: err.message || 'Client network failure',
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
        <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
          <Smartphone className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">Buy Airtime</h1>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/80 p-6 md:p-8 backdrop-blur-xl shadow-xl space-y-6">
        <form onSubmit={handlePurchase} className="space-y-4">
          {/* Network Selector Dropdown */}
          <CustomSearchDropdown
            label="Select Telco Network"
            placeholder="Select Telco Network"
            searchPlaceholder="Search Network (MTN, Airtel, Glo...)"
            items={NETWORKS}
            selectedId={network}
            onSelect={(item) => setNetwork(String(item.id))}
            accentColor="orange"
            showSearchThreshold={5}
          />

          {/* Phone Number Input with Choose Beneficiary Link/Button */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Recipient Phone Number
              </label>
              <button
                type="button"
                onClick={() => setShowBeneficiaryModal(true)}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-orange hover:text-amber-600 dark:hover:text-amber-400 py-0.5 px-2 rounded-lg hover:bg-brand-orange/10 transition-all active:scale-95"
              >
                <Users className="w-3.5 h-3.5" />
                <span>Choose Beneficiary</span>
              </button>
            </div>
            <div className="relative">
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => handlePhoneChange(e.target.value)}
                placeholder="08031234567"
                maxLength={11}
                required
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white font-mono text-sm tracking-wider focus:outline-none focus:border-brand-orange pr-20"
              />
              {network && (
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 dark:bg-slate-800 text-brand-orange uppercase">
                    {network}
                  </span>
                </div>
              )}
            </div>

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

          {/* Amount */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Recharge Amount (₦)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-400">
                ₦
              </span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g. 1000"
                min={50}
                required
                className="w-full pl-8 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white font-mono font-bold text-sm focus:outline-none focus:border-brand-orange"
              />
            </div>
          </div>

          {/* Quick Amounts */}
          <div className="flex flex-wrap gap-2">
            {quickAmounts.map((amt) => (
              <button
                key={amt}
                type="button"
                onClick={() => setAmount(amt.toString())}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                  amount === amt.toString()
                    ? 'bg-brand-orange/10 border-brand-orange text-brand-orange font-bold'
                    : 'border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-950/60 text-slate-600 dark:text-slate-300 hover:border-slate-300'
                }`}
              >
                ₦{amt.toLocaleString()}
              </button>
            ))}
          </div>

          {/* Pricing Summary */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-white/5 space-y-2.5 text-xs">
            <div className="flex justify-between text-slate-500 dark:text-slate-400">
              <span>Recharge Value:</span>
              <span className="font-mono text-slate-800 dark:text-slate-200">{formatNaira(numAmount)}</span>
            </div>

            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
              <span>Available Wallet Balance:</span>
              <span className={`font-mono font-semibold ${(wallet?.balance || 0) < payableAmount ? 'text-rose-500' : 'text-slate-800 dark:text-slate-200'}`}>
                {formatBalance(wallet?.balance || 0)}
              </span>
            </div>

            <div className="flex justify-between pt-2 border-t border-slate-200 dark:border-white/5 text-sm font-bold text-slate-900 dark:text-white">
              <span>Total Debit from Wallet:</span>
              <span className="font-mono text-brand-orange">{formatNaira(payableAmount)}</span>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !network || numAmount < 50}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-brand-orange to-amber-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-bold text-sm shadow-xl shadow-orange-500/20 transition-all disabled:opacity-50"
          >
            {loading
              ? 'Executing Safe Debit & Recharge...'
              : !network
              ? 'Select Network Provider'
              : numAmount < 50
              ? 'Enter Recharge Amount'
              : `Pay ${formatNaira(payableAmount)} Now`}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-white/5 pt-3">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
          <span>Automated Refund: Immediate 100% wallet reversal if telco fails</span>
        </div>
      </div>

      {/* Beneficiary Selection Modal */}
      <BeneficiaryModal
        isOpen={showBeneficiaryModal}
        onClose={() => setShowBeneficiaryModal(false)}
        onSelect={handleSelectBeneficiary}
        serviceType="airtime"
      />
    </div>
  );
}

