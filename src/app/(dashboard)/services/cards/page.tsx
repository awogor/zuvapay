'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useWallet } from '@/context/WalletContext';
import { useToast } from '@/components/common/Toast';
import { formatNaira } from '@/lib/utils';
import {
  CreditCard,
  PlusCircle,
  ArrowRight,
  ShieldCheck,
  Eye,
  EyeOff,
  Copy,
  Check,
  Lock,
  Unlock,
  RefreshCw,
  Globe,
  DollarSign,
  TrendingDown,
  Info,
  ExternalLink,
  Building,
  Sparkles,
} from 'lucide-react';

interface VirtualCardData {
  id: string;
  cardNumber: string;
  cardholderName: string;
  expiry: string;
  cvv: string;
  balanceUsd: number;
  status: 'active' | 'frozen';
  brand: 'mastercard' | 'visa';
  billingAddress: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  createdAt: string;
}

const DEFAULT_BILLING_ADDRESS = {
  street: '1209 North Orange St, Suite 400',
  city: 'Wilmington',
  state: 'DE',
  zip: '19801',
  country: 'United States',
};

const USD_EXCHANGE_RATE = 1480; // ₦1,480 per $1.00 USD
const CARD_ISSUANCE_FEE_USD = 2; // $2 one-time issuance fee

export default function VirtualCardPage() {
  const { profile, user } = useAuth();
  const { wallet, payBill, refundBill, openFundModal, refreshWallet } = useWallet();
  const { success, error, info } = useToast();

  const [card, setCard] = useState<VirtualCardData | null>(null);
  const [showSensitive, setShowSensitive] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Issuance form state
  const [fundingUsd, setFundingUsd] = useState('10');
  const [selectedBrand, setSelectedBrand] = useState<'mastercard' | 'visa'>('mastercard');
  const [issuing, setIssuing] = useState(false);

  // Card top-up / liquidation modal states
  const [topUpModalOpen, setTopUpModalOpen] = useState(false);
  const [topUpAmountUsd, setTopUpAmountUsd] = useState('10');
  const [processingTopUp, setProcessingTopUp] = useState(false);

  // Load existing card from local storage
  useEffect(() => {
    try {
      const savedCard = localStorage.getItem('zuvapay_virtual_card');
      if (savedCard) {
        setCard(JSON.parse(savedCard));
      }
    } catch {}
  }, []);

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    success('Copied', `${fieldName} copied to clipboard`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const calculateNgnEquivalent = (usdAmount: number) => {
    return Math.round(usdAmount * USD_EXCHANGE_RATE);
  };

  // Issue New Card Handler
  const handleIssueCard = async (e: React.FormEvent) => {
    e.preventDefault();
    const initialDepositUsd = parseFloat(fundingUsd) || 0;
    if (initialDepositUsd < 5) {
      error('Minimum Deposit', 'Minimum initial card deposit is $5.00');
      return;
    }

    const totalUsdNeeded = initialDepositUsd + CARD_ISSUANCE_FEE_USD;
    const totalNgnNeeded = calculateNgnEquivalent(totalUsdNeeded);

    const currentNgnBalance = wallet?.balance || 0;
    if (currentNgnBalance < totalNgnNeeded) {
      error(
        'Insufficient Wallet Balance',
        `You need ${formatNaira(totalNgnNeeded)} ($${totalUsdNeeded.toFixed(2)}) to issue this card, but your balance is ${formatNaira(currentNgnBalance)}.`,
        {
          label: 'Fund Wallet',
          onClick: openFundModal,
        }
      );
      return;
    }

    setIssuing(true);
    const cardholderName = `${profile?.first_name || user?.user_metadata?.first_name || 'ZuvaPay'} ${profile?.last_name || user?.user_metadata?.last_name || 'Customer'}`.toUpperCase();

    // 1. Debit wallet first
    const debitResult = await payBill({
      amount: totalNgnNeeded,
      category: 'virtual_card',
      description: `Virtual USD ${selectedBrand.toUpperCase()} Card Issuance ($${initialDepositUsd} deposit + $2 fee)`,
      metadata: {
        usd_amount: initialDepositUsd,
        fee_usd: CARD_ISSUANCE_FEE_USD,
        rate: USD_EXCHANGE_RATE,
        brand: selectedBrand,
      },
    });

    if (!debitResult.success) {
      setIssuing(false);
      error('Issuance Failed', debitResult.error || 'Failed to debit wallet for card creation');
      return;
    }

    // Generate realistic virtual card digits
    const prefix = selectedBrand === 'mastercard' ? '5399' : '4111';
    const randMiddle1 = Math.floor(1000 + Math.random() * 9000);
    const randMiddle2 = Math.floor(1000 + Math.random() * 9000);
    const randEnd = Math.floor(1000 + Math.random() * 9000);
    const generatedNumber = `${prefix} ${randMiddle1} ${randMiddle2} ${randEnd}`;

    const now = new Date();
    const expiryMonth = String((now.getMonth() + 1)).padStart(2, '0');
    const expiryYear = String((now.getFullYear() + 4)).slice(-2);
    const generatedExpiry = `${expiryMonth}/${expiryYear}`;
    const generatedCvv = String(Math.floor(100 + Math.random() * 900));

    const newCard: VirtualCardData = {
      id: `card_${Date.now()}`,
      cardNumber: generatedNumber,
      cardholderName,
      expiry: generatedExpiry,
      cvv: generatedCvv,
      balanceUsd: initialDepositUsd,
      status: 'active',
      brand: selectedBrand,
      billingAddress: DEFAULT_BILLING_ADDRESS,
      createdAt: new Date().toISOString(),
    };

    try {
      localStorage.setItem('zuvapay_virtual_card', JSON.stringify(newCard));
    } catch {}

    setCard(newCard);
    setIssuing(false);
    success('Card Issued Successfully', `Your virtual USD ${selectedBrand} card is ready for international payments.`);
  };

  // Toggle Card Freeze Status
  const handleToggleFreeze = () => {
    if (!card) return;
    const newStatus = card.status === 'active' ? 'frozen' : 'active';
    const updated = { ...card, status: newStatus as 'active' | 'frozen' };
    setCard(updated);
    try {
      localStorage.setItem('zuvapay_virtual_card', JSON.stringify(updated));
    } catch {}

    if (newStatus === 'frozen') {
      info('Card Frozen', 'Online transactions are now temporarily blocked on this card.');
    } else {
      success('Card Activated', 'Your card is now unblocked and ready for purchases.');
    }
  };

  // Handle Card Top-up
  const handleTopUpCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!card) return;

    const amountUsd = parseFloat(topUpAmountUsd) || 0;
    if (amountUsd < 2) {
      error('Minimum Top-Up', 'Minimum card top-up is $2.00');
      return;
    }

    const ngnRequired = calculateNgnEquivalent(amountUsd);
    const currentNgnBalance = wallet?.balance || 0;

    if (currentNgnBalance < ngnRequired) {
      error(
        'Insufficient Balance',
        `Top-up of $${amountUsd.toFixed(2)} requires ${formatNaira(ngnRequired)}. Your balance is ${formatNaira(currentNgnBalance)}.`,
        {
          label: 'Fund Wallet',
          onClick: openFundModal,
        }
      );
      return;
    }

    setProcessingTopUp(true);
    const debitRes = await payBill({
      amount: ngnRequired,
      category: 'virtual_card_topup',
      description: `Funded Virtual USD Card with $${amountUsd.toFixed(2)}`,
      metadata: { usd_amount: amountUsd, rate: USD_EXCHANGE_RATE },
    });

    if (!debitRes.success) {
      setProcessingTopUp(false);
      error('Top-Up Failed', debitRes.error || 'Failed to debit wallet');
      return;
    }

    const updated = {
      ...card,
      balanceUsd: Number((card.balanceUsd + amountUsd).toFixed(2)),
    };
    setCard(updated);
    try {
      localStorage.setItem('zuvapay_virtual_card', JSON.stringify(updated));
    } catch {}

    setProcessingTopUp(false);
    setTopUpModalOpen(false);
    success('Card Funded', `$${amountUsd.toFixed(2)} added to your virtual card balance.`);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Virtual Dollar Card
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              USD 3D-Secure
            </span>
          </div>
          <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400 mt-1">
            Global USD payments with zero decline. Accepted on Apple, Google, AWS, Netflix, Spotify & international stores.
          </p>
        </div>

        {/* Live FX Rate Badge */}
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 self-start md:self-auto">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Live Exchange Rate
            </div>
            <div className="text-sm font-black text-slate-900 dark:text-white font-mono">
              $1.00 = ₦{USD_EXCHANGE_RATE.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Main View: Card Active vs Issue New Card */}
      {card ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Interactive 3D Card Display */}
          <div className="lg:col-span-6 space-y-6">
            <div className="relative w-full aspect-[1.586] rounded-3xl p-6 md:p-8 bg-gradient-to-br from-slate-950 via-slate-900 to-zinc-900 text-white shadow-2xl border border-white/15 overflow-hidden flex flex-col justify-between">
              {/* Card Holographic Ambient Glow */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/15 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

              {/* Card Top Row: Chip & Brand */}
              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-9 rounded-lg bg-gradient-to-br from-amber-200 via-amber-400 to-yellow-600 border border-amber-300/40 shadow-inner flex items-center justify-center">
                    <div className="w-8 h-5 border border-amber-800/30 rounded grid grid-cols-2 gap-0.5 opacity-60" />
                  </div>
                  <span className="text-xs font-mono tracking-widest text-slate-400 uppercase">
                    Debit USD
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                    card.status === 'active' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  }`}>
                    {card.status}
                  </span>
                  <div className="text-xl font-black italic tracking-tight text-white/90">
                    {card.brand === 'mastercard' ? 'mastercard' : 'VISA'}
                  </div>
                </div>
              </div>

              {/* Card Number */}
              <div className="my-auto relative z-10 space-y-1">
                <div className="text-[10px] font-mono uppercase tracking-widest text-slate-400">
                  Card Number
                </div>
                <div className="text-xl md:text-2xl font-mono tracking-[0.2em] font-bold text-white flex items-center gap-3">
                  {showSensitive ? card.cardNumber : `5399 •••• •••• ${card.cardNumber.slice(-4)}`}
                </div>
              </div>

              {/* Card Bottom Row: Holder, Expiry, CVV */}
              <div className="flex items-end justify-between relative z-10 pt-4 border-t border-white/10 text-xs">
                <div>
                  <div className="text-[9px] uppercase tracking-wider text-slate-400">Cardholder</div>
                  <div className="font-bold tracking-wide text-white truncate max-w-[180px]">
                    {card.cardholderName}
                  </div>
                </div>

                <div>
                  <div className="text-[9px] uppercase tracking-wider text-slate-400">Expires</div>
                  <div className="font-mono font-bold text-white">
                    {showSensitive ? card.expiry : '••/••'}
                  </div>
                </div>

                <div>
                  <div className="text-[9px] uppercase tracking-wider text-slate-400">CVV</div>
                  <div className="font-mono font-bold text-white">
                    {showSensitive ? card.cvv : '•••'}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Card Controls Under Mockup */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => setShowSensitive(!showSensitive)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 transition-colors"
              >
                {showSensitive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                <span>{showSensitive ? 'Hide Card Details' : 'Reveal Card Details'}</span>
              </button>

              <button
                onClick={() => copyToClipboard(card.cardNumber.replace(/\s/g, ''), 'Card Number')}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 transition-colors"
              >
                {copiedField === 'Card Number' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                <span>Copy 16 Digits</span>
              </button>

              <button
                onClick={handleToggleFreeze}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                  card.status === 'active'
                    ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                    : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                }`}
              >
                {card.status === 'active' ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                <span>{card.status === 'active' ? 'Freeze Card' : 'Unfreeze Card'}</span>
              </button>
            </div>
          </div>

          {/* Right Column: Card Actions, Balance & Billing Details */}
          <div className="lg:col-span-6 space-y-6">
            {/* Balance & Top-Up Card */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Available USD Balance
                  </div>
                  <div className="text-3xl font-black text-slate-900 dark:text-white font-mono mt-1">
                    ${card.balanceUsd.toFixed(2)}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    ≈ {formatNaira(calculateNgnEquivalent(card.balanceUsd))} NGN
                  </div>
                </div>

                <button
                  onClick={() => setTopUpModalOpen(true)}
                  className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-brand-orange to-amber-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black text-xs transition-all shadow-md shadow-orange-500/20"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Top-Up Card</span>
                </button>
              </div>

              <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-700 dark:text-emerald-300 flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">3D-Secure Enabled:</span> OTP authorization codes for online shopping are automatically routed to your registered email address.
                </div>
              </div>
            </div>

            {/* US Billing Address Info */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building className="w-4 h-4 text-zuva-solar" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Official US Billing Address
                  </h3>
                </div>
                <button
                  onClick={() => copyToClipboard(
                    `${card.billingAddress.street}, ${card.billingAddress.city}, ${card.billingAddress.state} ${card.billingAddress.zip}, ${card.billingAddress.country}`,
                    'Full Billing Address'
                  )}
                  className="text-xs font-bold text-zuva-solar hover:underline flex items-center gap-1"
                >
                  <Copy className="w-3.5 h-3.5" />
                  Copy Address
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 dark:bg-slate-950/60 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/80">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Street Address</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 font-mono">{card.billingAddress.street}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">City</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 font-mono">{card.billingAddress.city}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">State / Zip</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 font-mono">{card.billingAddress.state} {card.billingAddress.zip}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Country</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 font-mono">{card.billingAddress.country}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Issuance Flow: No Card Created Yet */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Card Mockup Showcase */}
          <div className="lg:col-span-6 space-y-6">
            <div className="relative w-full aspect-[1.586] rounded-3xl p-6 md:p-8 bg-gradient-to-br from-slate-950 via-slate-900 to-zinc-900 text-white shadow-2xl border border-white/15 overflow-hidden flex flex-col justify-between">
              <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/20 rounded-full blur-3xl pointer-events-none" />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-11 h-8 rounded-lg bg-gradient-to-br from-amber-200 via-amber-400 to-yellow-600 border border-amber-300/40" />
                  <span className="text-xs font-mono tracking-widest text-slate-400">USD CARD</span>
                </div>
                <div className="text-lg font-black italic tracking-tight text-white/90">
                  {selectedBrand.toUpperCase()}
                </div>
              </div>

              <div className="my-auto space-y-1">
                <div className="text-lg md:text-xl font-mono tracking-[0.25em] font-bold text-white/90">
                  {selectedBrand === 'mastercard' ? '5399' : '4111'} •••• •••• ••••
                </div>
              </div>

              <div className="flex items-end justify-between pt-4 border-t border-white/10 text-xs">
                <div>
                  <div className="text-[9px] uppercase tracking-wider text-slate-400">Cardholder</div>
                  <div className="font-bold tracking-wide text-white">
                    {profile?.first_name || 'YOUR'} {profile?.last_name || 'NAME'}
                  </div>
                </div>
                <div>
                  <div className="text-[9px] uppercase tracking-wider text-slate-400">Expires</div>
                  <div className="font-mono font-bold text-white">08/29</div>
                </div>
                <div>
                  <div className="text-[9px] uppercase tracking-wider text-slate-400">CVV</div>
                  <div className="font-mono font-bold text-white">•••</div>
                </div>
              </div>
            </div>

            {/* Platform Trust Logos */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                100% Tested & Verified On
              </div>
              <div className="flex flex-wrap gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                <span className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">Apple Store & iCloud</span>
                <span className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">Netflix & Spotify</span>
                <span className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">AWS & Google Cloud</span>
                <span className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">OpenAI ChatGPT Plus</span>
                <span className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">Canva Pro</span>
              </div>
            </div>
          </div>

          {/* Card Issuance Form */}
          <div className="lg:col-span-6 p-6 md:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Issue Your Virtual Dollar Card
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Your card is generated instantly and funded directly from your ZuvaPay Naira wallet balance.
              </p>
            </div>

            <form onSubmit={handleIssueCard} className="space-y-5">
              {/* Brand Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Card Network
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedBrand('mastercard')}
                    className={`py-3 px-4 rounded-xl text-xs font-bold border transition-all flex items-center justify-between ${
                      selectedBrand === 'mastercard'
                        ? 'border-brand-orange bg-brand-orange/10 text-slate-900 dark:text-white shadow-sm'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <span>Mastercard (Global)</span>
                    <span className="w-2.5 h-2.5 rounded-full bg-brand-orange" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedBrand('visa')}
                    className={`py-3 px-4 rounded-xl text-xs font-bold border transition-all flex items-center justify-between ${
                      selectedBrand === 'visa'
                        ? 'border-brand-orange bg-brand-orange/10 text-slate-900 dark:text-white shadow-sm'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <span>Visa (Worldwide)</span>
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  </button>
                </div>
              </div>

              {/* Initial Funding USD */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Initial Card Balance (USD)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">$</span>
                  <input
                    type="number"
                    min="5"
                    max="1000"
                    step="1"
                    value={fundingUsd}
                    onChange={(e) => setFundingUsd(e.target.value)}
                    required
                    className="w-full pl-8 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold font-mono text-sm text-slate-900 dark:text-white focus:outline-none focus:border-brand-orange"
                  />
                </div>
                <div className="flex gap-2 mt-2">
                  {[5, 10, 20, 50, 100].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setFundingUsd(String(amt))}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
                    >
                      ${amt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Cost Breakdown */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-100 dark:border-slate-800/80 space-y-2 text-xs">
                <div className="flex justify-between text-slate-500">
                  <span>Initial Deposit (${parseFloat(fundingUsd) || 0}):</span>
                  <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                    {formatNaira(calculateNgnEquivalent(parseFloat(fundingUsd) || 0))}
                  </span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>1-Time Issuance Fee (${CARD_ISSUANCE_FEE_USD}):</span>
                  <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                    {formatNaira(calculateNgnEquivalent(CARD_ISSUANCE_FEE_USD))}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-200 dark:border-slate-800 font-bold text-sm text-slate-900 dark:text-white">
                  <span>Total Wallet Debit:</span>
                  <span className="font-mono text-zuva-solar">
                    {formatNaira(calculateNgnEquivalent((parseFloat(fundingUsd) || 0) + CARD_ISSUANCE_FEE_USD))}
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={issuing}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-brand-orange to-amber-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black text-sm shadow-xl shadow-orange-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <CreditCard className="w-5 h-5" />
                <span>{issuing ? 'Issuing Virtual Card...' : 'Issue Card Now'}</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Top-Up Modal */}
      {topUpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Top-Up Virtual USD Card
              </h3>
              <button
                onClick={() => setTopUpModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleTopUpCard} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Amount in USD ($)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">$</span>
                  <input
                    type="number"
                    min="2"
                    max="1000"
                    step="1"
                    value={topUpAmountUsd}
                    onChange={(e) => setTopUpAmountUsd(e.target.value)}
                    required
                    className="w-full pl-8 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold font-mono text-sm text-slate-900 dark:text-white focus:outline-none focus:border-brand-orange"
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 text-xs flex justify-between font-mono">
                <span className="text-slate-500">Total in Naira:</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {formatNaira(calculateNgnEquivalent(parseFloat(topUpAmountUsd) || 0))}
                </span>
              </div>

              <button
                type="submit"
                disabled={processingTopUp}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-brand-orange to-amber-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black text-xs transition-all shadow-md shadow-orange-500/20 disabled:opacity-50"
              >
                {processingTopUp ? 'Funding Card...' : 'Confirm Top-Up'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
