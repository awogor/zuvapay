'use client';

import React, { useState, useEffect } from 'react';
import { useWallet } from '@/context/WalletContext';
import { useToast } from '@/components/common/Toast';
import { formatNaira } from '@/lib/utils';
import {
  Zap,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  ArrowRight,
  ShieldCheck,
  UserCheck,
  ChevronDown,
  PlusCircle,
  Mail,
  Send,
  Share2,
  RefreshCw,
} from 'lucide-react';
import CustomSearchDropdown from '@/components/common/CustomSearchDropdown';

const DISCOS = [
  { id: 'ikeja', name: 'Ikeja Electric (IKEDC)' },
  { id: 'eko', name: 'Eko Electric (EKEDC)' },
  { id: 'abuja', name: 'Abuja Electricity (AEDC)' },
  { id: 'kano', name: 'Kano Electricity (KEDCO)' },
  { id: 'enugu', name: 'Enugu Electricity (EEDC)' },
  { id: 'portharcourt', name: 'Port Harcourt Electric (PHED)' },
  { id: 'ibadan', name: 'Ibadan Electricity (IBEDC)' },
  { id: 'kaduna', name: 'Kaduna Electric (KAEDCO)' },
  { id: 'jos', name: 'Jos Electricity (JED)' },
  { id: 'benin', name: 'Benin Electricity (BEDC)' },
  { id: 'yola', name: 'Yola Electricity (YEDC)' },
];

export default function ElectricityPage() {
  const { wallet, payBill, refundBill, openReceipt, openFundModal, formatBalance } = useWallet();
  const { success, error, info } = useToast();

  const [disco, setDisco] = useState('');
  const [meterType, setMeterType] = useState<'prepaid' | 'postpaid'>('prepaid');
  const [meterNumber, setMeterNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  // Meter Validation State
  const [validating, setValidating] = useState(false);
  const [customerName, setCustomerName] = useState<string | null>(null);
  const [customerAddress, setCustomerAddress] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Generated Token state
  const [generatedToken, setGeneratedToken] = useState<string | null>(null);
  const [tokenUnits, setTokenUnits] = useState<string | null>(null);
  const [copiedToken, setCopiedToken] = useState(false);
  const [tokenEmailSentTo, setTokenEmailSentTo] = useState<string | null>(null);
  const [tokenMetadata, setTokenMetadata] = useState<any>(null);
  const [forwardEmail, setForwardEmail] = useState('');
  const [forwarding, setForwarding] = useState(false);
  const [showForwardForm, setShowForwardForm] = useState(false);
  const [isValidated, setIsValidated] = useState(false);

  // Explicit Meter Validation function
  const handleValidateMeter = async () => {
    if (!disco) {
      error('Select DISCO', 'Please select your electricity distribution company first');
      return;
    }
    if (!meterNumber.trim() || meterNumber.trim().length < 8) {
      error('Invalid Meter', 'Please enter a valid 11 or 13 digit meter number');
      return;
    }

    setValidating(true);
    setValidationError(null);
    try {
      const res = await fetch('/api/services/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'electricity',
          account: meterNumber.trim(),
          provider: disco,
          meterType,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setCustomerName(data.customerName);
        setCustomerAddress(data.address);
        setIsValidated(true);
        success('Meter Verified', `Account verified: ${data.customerName}`);
      } else {
        setCustomerName(null);
        setCustomerAddress(null);
        setIsValidated(false);
        setValidationError(data.error || 'Could not verify meter. Please check your DISCO and meter number.');
      }
    } catch {
      setCustomerName(null);
      setCustomerAddress(null);
      setIsValidated(false);
      setValidationError('Verification gateway temporarily unreachable. Please try again.');
    } finally {
      setValidating(false);
    }
  };

  // Reset verification state when disco, meter number, or meter type changes
  useEffect(() => {
    setCustomerName(null);
    setCustomerAddress(null);
    setValidationError(null);
    setIsValidated(false);
  }, [meterNumber, disco, meterType]);

  const numAmount = parseFloat(amount) || 0;

  const handlePurchase = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!disco) {
      error('Select DISCO', 'Please select your electricity distribution company (DISCO)');
      return;
    }

    if (!meterNumber || meterNumber.trim().length < 8) {
      error('Invalid Meter', 'Please enter a valid meter number');
      return;
    }

    if (numAmount < 1000) {
      error('Minimum Amount', 'Minimum electricity payment is ₦1,000 for this DisCo.');
      return;
    }

    if ((wallet?.balance || 0) < numAmount) {
      error(
        'Insufficient Funds',
        `You have ${formatBalance(wallet?.balance || 0)} but need ${formatNaira(numAmount)}. Please fund your wallet.`,
        {
          label: 'Fund Wallet',
          onClick: openFundModal,
        }
      );
      return;
    }

    setLoading(true);

    if (!isValidated || !customerName) {
      error('Verify Meter First', 'Please click the Validate button to verify your meter details before proceeding.');
      setLoading(false);
      return;
    }

    // 1. Debit First
    const debitResult = await payBill({
      amount: numAmount,
      category: 'power',
      description: `${disco.toUpperCase()} Electricity (${meterType.toUpperCase()}: ${meterNumber})`,
      metadata: {
        provider: 'strowallet',
        disco,
        meterType,
        meterNumber,
        customerName: customerName || 'Verified Customer',
        meterAddress: customerAddress || undefined,
        wholesale_cost: Number((numAmount * 0.992).toFixed(2)),
      },
    });

    if (!debitResult.success) {
      error('Debit Failed', debitResult.error || 'Could not debit wallet balance');
      setLoading(false);
      return;
    }

    const reference = debitResult.reference!;

    // 2. Call External Provider
    try {
      const res = await fetch('/api/services/power', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          disco,
          meterNumber,
          meterType,
          amount: numAmount,
          customerName,
          customerAddress,
          reference,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        // 3. Automated Refund on Error
        info('Order Failed', 'Reversing electricity transaction and refunding wallet...');
        await refundBill({
          amount: numAmount,
          title: `${disco.toUpperCase()} Bill (${meterNumber})`,
          reason: data.error || 'Disco rejected bill token generation',
          originalReference: reference,
        });
        error('Power Bill Failed & Refunded', data.error || 'Disco gateway timeout');
        setLoading(false);
        return;
      }

      // 4. Success: set token and email metadata
      setGeneratedToken(data.token);
      setTokenUnits(data.units || null);
      setTokenEmailSentTo(data.emailSentTo || null);
      setTokenMetadata({
        disco,
        meterNumber,
        meterType,
        amount: numAmount,
        customerName: data.customerName || customerName,
        customerAddress: data.customerAddress || customerAddress,
        token: data.token,
        units: data.units || undefined,
        reference,
        operatorReference: data.operatorReference,
      });

      success('Electricity Paid!', `Token generated for meter ${meterNumber}. Email alert dispatched.`);

      // Reset input form fields so a new recharge can be initiated cleanly
      setMeterNumber('');
      setAmount('');
      setCustomerName(null);
      setCustomerAddress(null);
      setIsValidated(false);

      if (debitResult.transaction) {
        openReceipt({
          ...debitResult.transaction,
          metadata: {
            ...debitResult.transaction.metadata,
            provider: 'strowallet',
            token: data.token,
            ...(data.units ? { units: data.units } : {}),
            meterAddress: data.customerAddress || customerAddress || undefined,
            operatorReference: data.operatorReference, // Kept in backend metadata for admin telemetry, hidden in customer receipt
            wholesale_cost: Number((numAmount * 0.995).toFixed(2)),
          },
        });
      }
    } catch (err: any) {
      await refundBill({
        amount: numAmount,
        title: `${disco.toUpperCase()} Bill (${meterNumber})`,
        reason: err.message || 'Client connection failure',
        originalReference: reference,
      });
      error('Transaction Reverted', 'Connection failure. Wallet balance has been refunded.');
    } finally {
      setLoading(false);
    }
  };

  const handleForwardTokenEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forwardEmail || !forwardEmail.includes('@')) {
      error('Invalid Email', 'Please enter a valid email address');
      return;
    }
    if (!generatedToken || !tokenMetadata) return;

    setForwarding(true);
    try {
      const res = await fetch('/api/services/power', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'resend_email',
          recipientEmail: forwardEmail.trim(),
          ...tokenMetadata,
        }),
      });
      const data = await res.json();
      if (data.success) {
        success('Token Email Sent!', `Recharge token & receipt delivered to ${forwardEmail.trim()}`);
        setForwardEmail('');
        setShowForwardForm(false);
      } else {
        error('Delivery Failed', data.error || 'Failed to dispatch email');
      }
    } catch (err: any) {
      error('Error', err.message || 'Could not send token email');
    } finally {
      setForwarding(false);
    }
  };

  const copyToken = () => {
    if (generatedToken) {
      navigator.clipboard.writeText(generatedToken.replace(/-/g, ''));
      setCopiedToken(true);
      setTimeout(() => setCopiedToken(false), 2000);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6 animate-in fade-in">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
          <Zap className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">Electricity Bill Payment</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Instant token generation and validation for all 11 Nigerian Electricity Discos
          </p>
        </div>
      </div>

      {/* Generated Token Banner */}
      {generatedToken && (
        <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 dark:from-emerald-950/80 dark:to-slate-900 border border-emerald-500/30 shadow-2xl space-y-3 animate-in zoom-in-95">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              Prepaid Meter Token Generated
            </span>
            {tokenUnits && (
              <span className="text-xs font-mono text-slate-600 dark:text-slate-300 font-semibold">{tokenUnits}</span>
            )}
          </div>
          <div className="flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-slate-950/80 border border-emerald-500/20 dark:border-white/10">
            <span className="font-mono text-xl md:text-2xl font-black text-emerald-600 dark:text-emerald-300 tracking-widest">
              {generatedToken}
            </span>
            <button
              onClick={copyToken}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold transition-all"
            >
              {copiedToken ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copiedToken ? 'Copied' : 'Copy'}
            </button>
          </div>

          {/* Email Delivery Alert Notice & Forward Form */}
          <div className="pt-2 border-t border-emerald-500/20 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-1.5 text-emerald-800 dark:text-emerald-300 font-medium">
                <Mail className="w-3.5 h-3.5 flex-shrink-0 text-emerald-600 dark:text-emerald-400" />
                <span>
                  Token & receipt alert delivered to{' '}
                  <strong className="font-bold text-slate-900 dark:text-white">
                    {tokenEmailSentTo || 'your registered email'}
                  </strong>
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowForwardForm(!showForwardForm)}
                className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
              >
                <Share2 className="w-3 h-3" />
                {showForwardForm ? 'Cancel' : 'Send copy to another email'}
              </button>
            </div>

            {showForwardForm && (
              <form onSubmit={handleForwardTokenEmail} className="pt-2 flex items-center gap-2">
                <input
                  type="email"
                  value={forwardEmail}
                  onChange={(e) => setForwardEmail(e.target.value)}
                  placeholder="Enter email (e.g. tenant@gmail.com, landlord@yahoo.com)"
                  className="flex-1 px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-emerald-500/30 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-emerald-500"
                  required
                />
                <button
                  type="submit"
                  disabled={forwarding}
                  className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all disabled:opacity-50 flex-shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                  {forwarding ? 'Sending...' : 'Send Alert'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      <div className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/80 p-6 md:p-8 backdrop-blur-xl shadow-xl space-y-6">
        <form onSubmit={handlePurchase} className="space-y-4">
          {/* Disco Selector Dropdown */}
          <CustomSearchDropdown
            label="Select Distribution Company (Disco)"
            placeholder="Select Distribution Company (DISCO)"
            searchPlaceholder="Search DISCO (e.g. Ikeja, Eko, Abuja)..."
            items={DISCOS}
            selectedId={disco}
            onSelect={(item) => setDisco(String(item.id))}
            accentColor="emerald"
            showSearchThreshold={5}
          />

          {/* Meter Type Dropdown */}
          <CustomSearchDropdown
            label="Meter Account Type"
            placeholder="Select Meter Type"
            items={[
              { id: 'prepaid', name: 'Prepaid (Token Generation)', subtitle: 'Instant 20-digit recharge token' },
              { id: 'postpaid', name: 'Postpaid (Monthly Bill Payment)', subtitle: 'Direct account credit against monthly bill' },
            ]}
            selectedId={meterType}
            onSelect={(item) => setMeterType(item.id as 'prepaid' | 'postpaid')}
            accentColor="emerald"
            showSearchThreshold={10}
          />

          {/* Meter Number */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Meter / Account Number
              </label>
              {customerName && (
                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <UserCheck className="w-3.5 h-3.5" />
                  Verified
                </span>
              )}
            </div>
            <div className="relative flex items-center">
              <input
                type="text"
                value={meterNumber}
                onChange={(e) => setMeterNumber(e.target.value)}
                placeholder="Enter 11 or 13 digit meter number"
                required
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white font-mono text-sm focus:outline-none focus:border-emerald-500 pr-28"
              />
              <button
                type="button"
                onClick={handleValidateMeter}
                disabled={validating || !disco || meterNumber.trim().length < 8}
                className="absolute right-2 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 dark:disabled:bg-white/10 text-white disabled:text-slate-400 text-xs font-bold transition-all shadow-sm flex items-center gap-1"
              >
                {validating ? (
                  <>
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    <span>Checking...</span>
                  </>
                ) : isValidated ? (
                  <span>Re-check</span>
                ) : (
                  <span>Validate</span>
                )}
              </button>
            </div>

            {/* Validation feedback card */}
            {customerName && (
              <div className="mt-2.5 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-start gap-2.5 text-xs text-emerald-600 dark:text-emerald-300 animate-in fade-in duration-200">
                <UserCheck className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">{customerName}</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">{customerAddress}</p>
                </div>
              </div>
            )}

            {validationError && (
              <div className="mt-2.5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-2 text-xs text-rose-600 dark:text-rose-300 animate-in fade-in duration-200">
                <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />
                <span className="flex-1">{validationError}</span>
              </div>
            )}
          </div>

          {/* Amount */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Payment Amount (₦)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-400">
                ₦
              </span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g. 5000"
                min={1000}
                required
                className="w-full pl-8 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white font-mono font-bold text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>
            <p className="mt-1 text-[11px] text-slate-400">Minimum payment: ₦1,000</p>
          </div>

          {/* Balance row */}
          <div className="flex items-center justify-between text-xs px-1 text-slate-500 dark:text-slate-400">
            <span>Available Wallet Balance:</span>
            <span className={`font-mono font-semibold ${(wallet?.balance || 0) < numAmount ? 'text-rose-500' : 'text-slate-800 dark:text-slate-200'}`}>
              {formatBalance(wallet?.balance || 0)}
            </span>
          </div>

          <button
            type="submit"
            disabled={loading || validating || !disco || !meterNumber || !isValidated || numAmount < 1000}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-slate-950 font-bold text-sm shadow-xl shadow-emerald-500/20 transition-all disabled:opacity-50"
          >
            {loading
              ? 'Processing Payment...'
              : validating
              ? 'Validating Meter...'
              : !disco
              ? 'Select Electricity DISCO'
              : !meterNumber || meterNumber.length < 8
              ? 'Enter Meter Number'
              : !isValidated
              ? 'Validate Meter to Continue'
              : numAmount < 1000
              ? 'Enter Payment Amount (Min ₦1,000)'
              : `Pay ${formatNaira(numAmount)} Electricity`}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-white/5 pt-3">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
          <span>Automated Refund: Immediate 100% wallet reversal if token fails</span>
        </div>
      </div>
    </div>
  );
}

