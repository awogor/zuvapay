'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWallet } from '@/context/WalletContext';
import { useToast } from '@/components/common/Toast';
import { formatNaira } from '@/lib/utils';
import CustomSearchDropdown, { type DropdownItem } from '@/components/common/CustomSearchDropdown';
import {
  MessageSquareCode,
  ArrowRight,
  ShieldCheck,
  Zap,
  HelpCircle,
  MessageCircle,
  Info,
  History,
  Clock,
} from 'lucide-react';
import { useSupport } from '@/components/modals/SupportModal';
import SmsHistoryModal from '@/components/modals/SmsHistoryModal';
import {
  getSmsOrders,
  getActiveSmsOrders,
  saveSmsOrder,
  subscribeSmsOrders,
  type SmsOrderRecord,
} from '@/lib/smsOrders';

export default function VirtualSmsCatalogPage() {
  const router = useRouter();
  const { wallet, payBill, refundBill, formatBalance } = useWallet();
  const { success, error, info } = useToast();
  const { openSupport } = useSupport();

  const [selectedServer, setSelectedServer] = useState<'server1' | 'server2'>('server1');
  const [countries, setCountries] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [loading, setLoading] = useState(false);
  const [catalogLoading, setCatalogLoading] = useState(true);

  // SMS Order History & Active Orders State
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [smsOrders, setSmsOrders] = useState<SmsOrderRecord[]>([]);
  const [activeOrders, setActiveOrders] = useState<SmsOrderRecord[]>([]);

  // Dynamic live carrier quote state
  const [liveQuote, setLiveQuote] = useState<{
    retailPrice: number;
    usdCost: number;
    wholesaleNgn: number;
    usdToNgnRate: number;
    isOverridden: boolean;
    isLive: boolean;
    successRate?: number;
  } | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);

  // Subscribe to SMS orders and active status
  useEffect(() => {
    const syncOrders = () => {
      setSmsOrders(getSmsOrders());
      setActiveOrders(getActiveSmsOrders());
    };

    syncOrders();
    const unsub = subscribeSmsOrders(syncOrders);
    const interval = setInterval(syncOrders, 4000);

    return () => {
      unsub();
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    async function loadCatalog() {
      setCatalogLoading(true);
      setSelectedCountry('');
      setSelectedServiceId('');
      setLiveQuote(null);
      try {
        const res = await fetch(`/api/services/sms?action=catalog&server=${selectedServer}`);
        const data = await res.json();
        if (data.success) {
          setCountries(data.countries || []);
          setServices(data.services || []);
        }
      } catch (err) {
        console.error('Failed to load SMS catalog', err);
      } finally {
        setCatalogLoading(false);
      }
    }
    loadCatalog();
  }, [selectedServer]);

  // Query live carrier quote when country and service are selected
  useEffect(() => {
    if (!selectedCountry || !selectedServiceId) {
      setLiveQuote(null);
      return;
    }

    let isMounted = true;
    async function fetchQuote() {
      setQuoteLoading(true);
      try {
        const res = await fetch(
          `/api/services/sms?action=quote&server=${selectedServer}&countryCode=${selectedCountry}&serviceId=${selectedServiceId}`
        );
        const data = await res.json();
        if (isMounted && data.success && data.quote) {
          setLiveQuote(data.quote);
        }
      } catch (err) {
        console.warn('Failed to fetch live quote', err);
      } finally {
        if (isMounted) setQuoteLoading(false);
      }
    }

    fetchQuote();
    return () => {
      isMounted = false;
    };
  }, [selectedServer, selectedCountry, selectedServiceId]);

  const countryObj = countries.find((c) => c.code === selectedCountry) || null;
  const serviceObj = services.find((s) => s.id === selectedServiceId) || null;

  const catalogEstimatedCost = countryObj && serviceObj
    ? Math.round(serviceObj.basePrice * (countryObj.costMultiplier || 1.1))
    : 0;

  // The actual dynamic amount debited at checkout
  const effectiveCost = liveQuote ? liveQuote.retailPrice : catalogEstimatedCost;

  // Format dropdown items for Country selector
  const countryDropdownItems: DropdownItem[] = countries.map((c) => ({
    id: c.code,
    name: c.name,
    flag: c.flag || '🌐',
    isPriority: Boolean(c.isPriority),
  }));

  // Format dropdown items for Service selector
  const serviceDropdownItems: DropdownItem[] = services.map((s) => {
    const cost = countryObj
      ? Math.round(s.basePrice * (countryObj.costMultiplier || 1.1))
      : s.basePrice;
    return {
      id: s.id,
      name: s.name,
      subtitle: formatNaira(cost),
      isPriority: Boolean(s.isPriority),
    };
  });

  const handleBuyNumber = async () => {
    if (!countryObj) {
      error('Select Country', 'Please select a country first');
      return;
    }
    if (!serviceObj) {
      error('Select Service', 'Please select an online service / app');
      return;
    }

    // 1. Pre-flight Balance Check
    if ((wallet?.balance || 0) < effectiveCost) {
      error(
        'Insufficient Balance',
        `You need ${formatNaira(effectiveCost)} to rent a ${countryObj.name} ${serviceObj.name} virtual number. Please fund your wallet.`
      );
      return;
    }

    setLoading(true);

    // 2. CRITICAL: "Debit First, Fulfill Second"
    const debitResult = await payBill({
      amount: effectiveCost,
      category: 'sms',
      description: `Virtual SMS Number (${countryObj.name} - ${serviceObj.name})`,
      metadata: {
        country: countryObj.name,
        countryCode: countryObj.code,
        service: serviceObj.name,
        serviceId: serviceObj.id,
        server: selectedServer,
        usdCost: liveQuote?.usdCost,
        exchangeRate: liveQuote?.usdToNgnRate,
        isDynamicQuote: Boolean(liveQuote),
      },
    });

    if (!debitResult.success) {
      error('Debit Failed', debitResult.error || 'Failed to debit wallet');
      setLoading(false);
      return;
    }

    const reference = debitResult.reference!;

    // 3. Dispatch to SMS Gateway
    try {
      const res = await fetch('/api/services/sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'buy',
          server: selectedServer,
          countryCode: countryObj.code,
          serviceId: serviceObj.id,
          expectedCost: effectiveCost,
          reference,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        // 4. Automated Refund on Failure
        info('Order Reverted', 'Temporary lines are currently out of stock. Reversing transaction...');
        await refundBill({
          amount: effectiveCost,
          title: `SMS Rental (${countryObj.name} ${serviceObj.name})`,
          reason: data.error || 'Out of stock in carrier pool',
          originalReference: reference,
        });
        error(
          'Order Reverted & Refunded',
          data.error || `Temporary lines for this service are currently out of stock on ${selectedServer === 'server1' ? 'Server 1' : 'Server 2'}. Please try switching servers. Funds have been returned to your wallet.`,
          {
            label: 'Contact Support',
            onClick: () =>
              openSupport({
                service: `${countryObj.name} - ${serviceObj.name} (SMS OTP - ${selectedServer.toUpperCase()})`,
                reference,
                issue: data.error || 'Carrier lines unavailable / out of stock',
              }),
          }
        );
        setLoading(false);
        return;
      }

      // 5. Success: Redirect to Active Polling Room
      success('Number Allocated!', `Rented ${data.phoneNumber}. Redirecting to live OTP room.`);

      // Persist active order details to centralized history and session
      const activeOrder: SmsOrderRecord = {
        orderId: data.orderId,
        phoneNumber: data.phoneNumber,
        country: data.country || countryObj.name,
        countryFlag: countryObj.flag,
        service: data.service || serviceObj.name,
        cost: data.cost || effectiveCost,
        server: data.server || selectedServer,
        expiresAt: data.expiresAt || Date.now() + 15 * 60 * 1000,
        createdAt: Date.now(),
        reference,
        status: 'WAIT_CODE',
        otpCode: null,
      };
      saveSmsOrder(activeOrder);

      router.push(`/services/sms/active?orderId=${data.orderId}`);
    } catch (err: any) {
      await refundBill({
        amount: effectiveCost,
        title: `SMS Rental (${countryObj.name} ${serviceObj.name})`,
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
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-500 border border-rose-500/20 shrink-0">
            <MessageSquareCode className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              Temporary Virtual Numbers (SMS OTP)
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Rent 15-minute disposable phone numbers for WhatsApp, Telegram, Google & 2,000+ apps
            </p>
          </div>
        </div>

        {/* History / Active Orders Trigger Button */}
        <button
          type="button"
          onClick={() => setIsHistoryOpen(true)}
          className="self-start sm:self-auto inline-flex items-center gap-2 px-3.5 py-2.5 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm transition-all"
        >
          <History className="w-4 h-4 text-rose-500" />
          <span>Order History</span>
          {smsOrders.length > 0 && (
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                activeOrders.length > 0
                  ? 'bg-rose-500 text-white animate-pulse'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              {activeOrders.length > 0 ? `${activeOrders.length} Active` : smsOrders.length}
            </span>
          )}
        </button>
      </div>

      {/* Active Orders Quick Alert Banner */}
      {activeOrders.length > 0 && (
        <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-rose-500/15 via-orange-500/10 to-amber-500/10 border border-rose-500/30 shadow-lg shadow-rose-500/5 space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-rose-600 dark:text-rose-400">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
              <span>
                {activeOrders.length === 1
                  ? 'Active number currently waiting for SMS code'
                  : `${activeOrders.length} active numbers waiting for SMS codes`}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsHistoryOpen(true)}
              className="text-[11px] font-bold text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
            >
              View All ({activeOrders.length}) →
            </button>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/90 dark:bg-slate-900/90 p-3.5 rounded-2xl border border-rose-500/20 backdrop-blur-md">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="text-lg leading-none">{activeOrders[0].countryFlag || '🌐'}</span>
                <span className="font-mono text-sm font-black text-slate-900 dark:text-white">
                  {activeOrders[0].phoneNumber}
                </span>
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                  • {activeOrders[0].service}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>Live polling room open</span>
                <span>•</span>
                <span>
                  Expires in {Math.max(1, Math.ceil((activeOrders[0].expiresAt - Date.now()) / 60000))}m
                </span>
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => router.push(`/services/sms/active?orderId=${activeOrders[0].orderId}`)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 text-white text-xs font-bold shadow-md shadow-rose-500/20 transition-all"
              >
                <span>Return to Live OTP Room</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Dropdown Form Card */}
      <div className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/80 p-6 md:p-8 backdrop-blur-xl shadow-xl space-y-5">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleBuyNumber();
          }}
          className="space-y-4"
        >
          {/* Server Selector (Server 1 vs Server 2) */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
              <span>Select Server</span>
              <span className="text-[11px] font-normal text-slate-500 dark:text-slate-400">
                {selectedServer === 'server1' ? 'High Capacity Pool' : 'Instant Delivery Pool'}
              </span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSelectedServer('server1')}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-bold transition-all ${
                  selectedServer === 'server1'
                    ? 'border-rose-500 bg-rose-500/10 text-rose-500 ring-1 ring-rose-500/30'
                    : 'border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${selectedServer === 'server1' ? 'bg-rose-500 animate-pulse' : 'bg-slate-400'}`} />
                Server 1
              </button>
              <button
                type="button"
                onClick={() => setSelectedServer('server2')}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-bold transition-all ${
                  selectedServer === 'server2'
                    ? 'border-rose-500 bg-rose-500/10 text-rose-500 ring-1 ring-rose-500/30'
                    : 'border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${selectedServer === 'server2' ? 'bg-rose-500 animate-pulse' : 'bg-slate-400'}`} />
                Server 2
              </button>
            </div>
          </div>

          {/* 1. In-Place Country Custom Dropdown */}
          <CustomSearchDropdown
            label="1. Select Country"
            placeholder="-- Select Country --"
            searchPlaceholder="Search country name..."
            items={countryDropdownItems}
            selectedId={selectedCountry}
            onSelect={(item) => setSelectedCountry(String(item.id))}
            disabled={catalogLoading}
            isLoading={catalogLoading}
            loadingText="Loading country list..."
            prioritySectionTitle="⭐ Popular / Recommended Countries"
            allSectionTitle="🌐 All Other Supported Countries"
          />

          {/* 2. In-Place Service Custom Dropdown */}
          <CustomSearchDropdown
            label="2. Select Online Service / Application"
            placeholder="-- Select Online Service / App --"
            searchPlaceholder="Search service (e.g. WhatsApp, OpenAI, Telegram)..."
            items={serviceDropdownItems}
            selectedId={selectedServiceId}
            onSelect={(item) => setSelectedServiceId(String(item.id))}
            disabled={catalogLoading}
            isLoading={catalogLoading}
            loadingText="Loading service list..."
            prioritySectionTitle="⭐ Popular Online Services"
            allSectionTitle="📱 All Other Supported Services (2,000+ Apps)"
            helperText={
              <p className="text-[10.5px] sm:text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
                <Info className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
                <span>Rates may vary slightly in real time based on carrier supply and demand.</span>
              </p>
            }
          />

          {/* Pricing & Rental Details Summary Card */}
          {countryObj && serviceObj && (
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-white/5 space-y-2.5 text-xs animate-in fade-in">
              <div className="flex justify-between text-slate-500 dark:text-slate-400">
                <span>Selected Destination:</span>
                <span className="font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                  <span className="text-base leading-none">{countryObj.flag}</span>
                  {countryObj.name}
                </span>
              </div>

              <div className="flex justify-between text-slate-500 dark:text-slate-400">
                <span>Target App / Service:</span>
                <span className="font-bold text-slate-800 dark:text-white">{serviceObj.name}</span>
              </div>

              <div className="flex justify-between text-slate-500 dark:text-slate-400">
                <span>Rental Window:</span>
                <span className="text-slate-700 dark:text-slate-300 font-medium flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  15 Minutes Live OTP
                </span>
              </div>

              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                <span>Available Wallet Balance:</span>
                <span
                  className={`font-mono font-semibold ${
                    (wallet?.balance || 0) < effectiveCost
                      ? 'text-rose-500'
                      : 'text-slate-800 dark:text-slate-200'
                  }`}
                >
                  {formatBalance(wallet?.balance || 0)}
                </span>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-white/5 text-sm font-bold text-slate-900 dark:text-white">
                <div className="flex flex-col">
                  <span>Total Rental Cost:</span>
                  <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    {quoteLoading ? (
                      <span className="text-amber-500 animate-pulse">Querying live carrier rate...</span>
                    ) : liveQuote?.isLive ? (
                      <span className="text-emerald-500 flex items-center gap-1 font-semibold">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Live Carrier Rate
                      </span>
                    ) : (
                      <span className="text-slate-400">Guaranteed Rate</span>
                    )}
                    {liveQuote?.successRate ? (
                      <span className="text-slate-400">({liveQuote.successRate}% route success)</span>
                    ) : null}
                  </span>
                </div>
                <span className="font-mono text-rose-600 dark:text-rose-400 text-base">
                  {quoteLoading ? '...' : formatNaira(effectiveCost)}
                </span>
              </div>
            </div>
          )}

          {/* Action Button */}
          <button
            type="submit"
            disabled={loading || catalogLoading || quoteLoading || !countryObj || !serviceObj}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 text-white font-bold text-sm shadow-xl shadow-rose-500/20 transition-all disabled:opacity-50"
          >
            {loading
              ? 'Allocating Virtual Line...'
              : quoteLoading
              ? 'Verifying Live Price...'
              : !countryObj
              ? 'Select Country'
              : !serviceObj
              ? 'Select Online Service / App'
              : `Rent Virtual Number (${formatNaira(effectiveCost)})`}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-white/5 pt-3">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400 flex-shrink-0" />
          <span>Automated Refund: Immediate 100% wallet reversal if SMS does not arrive</span>
        </div>
      </div>

      {/* Stranded User Support Help Card */}
      <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3 text-left">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <MessageCircle className="w-4 h-4" />
          </div>
          <div>
            <p className="font-bold text-slate-800 dark:text-white">
              Need a specific country or service line?
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Our operations team can check carrier pool stock or top up gateway lines immediately.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() =>
            openSupport({
              service: `${countryObj?.name || 'Virtual Country'} - ${serviceObj?.name || 'SMS Service'}`,
              issue: 'User inquiring about line availability or gateway balance',
            })
          }
          className="w-full sm:w-auto px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-bold text-xs hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors shadow-sm flex items-center justify-center gap-1.5 flex-shrink-0"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Contact Support</span>
        </button>
      </div>

      {/* SMS Orders & History Modal */}
      <SmsHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
      />
    </div>
  );
}
