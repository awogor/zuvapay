'use client';

import React, { useState, useEffect } from 'react';
import { useToast } from '@/components/common/Toast';
import { formatNaira, formatDate } from '@/lib/utils';
import {
  DollarSign,
  TrendingUp,
  CreditCard,
  Percent,
  Calendar,
  Filter,
  Download,
  Printer,
  RefreshCw,
  Zap,
  ShoppingBag,
  Sparkles,
  Smartphone,
  Wifi,
  ChevronDown,
  ArrowUpRight,
  ArrowDownLeft,
  RotateCcw,
  CheckCircle2,
  FileSpreadsheet,
  Layers,
  BarChart3,
  Search,
  Activity,
  Landmark,
  Building2,
  Wallet,
  Receipt,
} from 'lucide-react';
import { ProviderSummary, CategorySummary, TimeSeriesPoint } from '@/app/api/admin/financial-reports/route';

const PROVIDER_ICONS: Record<string, any> = {
  gongoz: Wifi,
  fadded: ShoppingBag,
  momo: TrendingUp,
  grizzly: Smartphone,
  smspool: Smartphone,
  marketplace: Sparkles,
  korapay: CreditCard,
  billstack: Landmark,
  internal: Zap,
};

export function AdminFinancialReportsTab({ onSelectAuditTx }: { onSelectAuditTx?: (tx: any) => void }) {
  const { success, error, info } = useToast();

  const [period, setPeriod] = useState<'today' | 'yesterday' | '7d' | '30d' | 'month' | 'year' | 'all' | 'custom'>('month');
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
  const [selectedProvider, setSelectedProvider] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{
    summary: {
      totalVolume?: number;
      totalTransactionsCount?: number;
      totalGrossDeposits?: number;
      totalNetDeposits?: number;
      totalDepositVolume?: number;
      totalDepositCount?: number;
      totalCollectionFees?: number;
      totalGrossSales: number;
      totalWholesaleCost: number;
      totalServiceProfit?: number;
      totalNetProfit: number;
      overallMarginPercent: number;
      totalCompletedOrders: number;
      totalRefundOrders: number;
      totalRefundAmount: number;
      averageOrderValue: number;
    };
    providerBreakdown: ProviderSummary[];
    categoryBreakdown: CategorySummary[];
    timeSeries: TimeSeriesPoint[];
    itemizedLedger: any[];
  } | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'providers' | 'categories' | 'ledger'>('overview');

  const fetchReports = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('period', period);
      params.set('provider', selectedProvider);
      params.set('category', selectedCategory);
      params.set('year', String(selectedYear));
      params.set('month', String(selectedMonth));
      if (period === 'custom' && startDate && endDate) {
        params.set('startDate', startDate);
        params.set('endDate', endDate);
      }

      const res = await fetch(`/api/admin/financial-reports?${params.toString()}`);
      const resJson = await res.json();

      if (resJson.success) {
        setData(resJson);
      } else {
        error('Report Error', resJson.error || 'Failed to load report data');
      }
    } catch (err: any) {
      error('Network Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [period, selectedYear, selectedMonth, selectedProvider, selectedCategory]);

  const handleExportCSV = () => {
    if (!data || !data.itemizedLedger || data.itemizedLedger.length === 0) {
      info('No Data', 'No transactions found for the selected period to export.');
      return;
    }

    const headers = [
      'Reference',
      'Date',
      'Type',
      'Category',
      'Provider / Gateway',
      'Description',
      'Gross Amount (NGN)',
      'Wholesale Cost (NGN)',
      'Collection Fee (NGN)',
      'Net Profit (NGN)',
      'Margin (%)',
      'Status',
    ];
    const rows = data.itemizedLedger.map((row) => [
      `"${row.reference}"`,
      `"${new Date(row.date).toLocaleString()}"`,
      `"${row.type}"`,
      `"${row.category}"`,
      `"${row.providerName}"`,
      `"${(row.description || '').replace(/"/g, '""')}"`,
      row.retailPrice || 0,
      row.wholesaleCost || 0,
      row.fee || 0,
      row.netProfit || 0,
      `${row.marginPercent || 0}%`,
      `"${row.status}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `ZuvaPay_Financial_Report_${period}_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    success('Export Complete', 'Financial statement exported to CSV successfully');
  };

  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const years = [2026, 2025, 2024];

  const filteredLedger = (data?.itemizedLedger || []).filter((item) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (item.reference || '').toLowerCase().includes(q) ||
      (item.description || '').toLowerCase().includes(q) ||
      (item.providerName || '').toLowerCase().includes(q) ||
      (item.category || '').toLowerCase().includes(q)
    );
  });

  const maxTimeSeriesSales = Math.max(1, ...(data?.timeSeries || []).map((t) => t.sales));

  return (
    <div className="space-y-6">
      {/* Top Banner & Action Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-6 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-black text-[10px] uppercase tracking-wider border border-emerald-500/30 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              Executive Financial Suite
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
              Revenue, Margins & Profitability
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Comprehensive Financial & Sales Intelligence
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Real-time analytics on gross customer sales, wholesale provider fulfillment costs, net margins, and periodic trends.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={fetchReports}
            disabled={loading}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-white/10 text-xs font-bold text-slate-800 dark:text-white transition-all disabled:opacity-50"
            title="Refresh calculations"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-bold transition-all shadow-sm"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            Export CSV
          </button>

          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-white/10 text-xs font-bold text-slate-800 dark:text-white transition-all shadow-sm"
          >
            <Printer className="w-3.5 h-3.5" />
            Print Statement
          </button>
        </div>
      </div>

      {/* Timeframe & Period Selectors */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Preset Buttons */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" /> Period:
            </span>
            {[
              { id: 'today', label: 'Today' },
              { id: 'yesterday', label: 'Yesterday' },
              { id: '7d', label: 'Last 7 Days' },
              { id: '30d', label: 'Last 30 Days' },
              { id: 'month', label: 'This Month' },
              { id: 'year', label: 'This Year' },
              { id: 'all', label: 'All-Time' },
              { id: 'custom', label: 'Custom' },
            ].map((btn) => (
              <button
                key={btn.id}
                onClick={() => setPeriod(btn.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  period === btn.id
                    ? 'bg-brand-orange text-slate-950 shadow-md scale-105'
                    : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>

          {/* Month & Year Selectors */}
          <div className="flex items-center gap-2">
            {period === 'month' && (
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-brand-orange"
              >
                {months.map((m, idx) => (
                  <option key={m} value={idx}>
                    {m}
                  </option>
                ))}
              </select>
            )}

            {(period === 'month' || period === 'year') && (
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-brand-orange"
              >
                {years.map((y) => (
                  <option key={y} value={y}>
                    Year {y}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Custom Range Picker */}
        {period === 'custom' && (
          <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100 dark:border-white/5 animate-in fade-in">
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400 font-semibold">From:</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 text-xs font-semibold text-slate-900 dark:text-white"
              />
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400 font-semibold">To:</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 text-xs font-semibold text-slate-900 dark:text-white"
              />
            </div>
            <button
              onClick={fetchReports}
              disabled={!startDate || !endDate}
              className="px-4 py-1.5 rounded-xl bg-brand-orange hover:bg-amber-500 text-slate-950 font-bold text-xs transition-all disabled:opacity-50"
            >
              Apply Filter
            </button>
          </div>
        )}

        {/* Filters: Provider & Category */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100 dark:border-white/5">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400 font-semibold flex items-center gap-1">
              <Filter className="w-3 h-3" /> Provider / Gateway:
            </span>
            <select
              value={selectedProvider}
              onChange={(e) => setSelectedProvider(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-brand-orange"
            >
              <option value="all">All Providers & Gateways (Consolidated)</option>
              <option value="billstack">Billstack Dedicated Accounts (9PSB)</option>
              <option value="korapay">Korapay Virtual Accounts & Checkout</option>
              <option value="strowallet">StroWallet API Gateway (Electricity & Cable TV)</option>
              <option value="gongoz">GongozAPI Gateway (Airtime & SME Data)</option>
              <option value="fadded">Fadded Inventory (Account Logs)</option>
              <option value="momo">MomoPanel (Social Media Boost)</option>
              <option value="smspool">SMSPool (Server 1 SMS)</option>
              <option value="grizzly">GrizzlySMS (Server 2 SMS)</option>
              <option value="marketplace">AI Marketplace Gateway</option>
            </select>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400 font-semibold">Category:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-brand-orange"
            >
              <option value="all">All Service Categories</option>
              <option value="deposit">Wallet Funding & Collections</option>
              <option value="data">Data Bundles</option>
              <option value="airtime">Airtime VTU</option>
              <option value="power">Electricity Tokens</option>
              <option value="cable">Cable TV</option>
              <option value="sms">Virtual Phone Numbers</option>
              <option value="social">Social Media Boost</option>
              <option value="logs">Social Account Logs</option>
              <option value="marketplace">AI Marketplace Accounts</option>
            </select>
          </div>
        </div>
      </div>

      {/* 8 Big Executive Financial Cards (2 Strategic Tiers) */}
      <div className="space-y-4">
        {/* Tier 1: Platform Inflow, GMV & Retained Earnings */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Turnover / Volume */}
          <div className="p-5 rounded-3xl bg-gradient-to-br from-brand-orange/10 via-white to-amber-500/10 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 border-2 border-brand-orange/40 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
              <span className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-brand-orange" />
                Gross Platform Turnover
              </span>
              <div className="w-8 h-8 rounded-xl bg-brand-orange/15 text-brand-orange flex items-center justify-center">
                <Activity className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {formatNaira(data?.summary.totalVolume || 0)}
            </p>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-500 dark:text-slate-400">
                {data?.summary.totalTransactionsCount || 0} Total Transactions
              </span>
              <span className="text-brand-orange font-bold">Total Flow</span>
            </div>
          </div>

          {/* Card 2: Combined Net Retained Profit */}
          <div className="p-5 rounded-3xl bg-gradient-to-br from-emerald-500/10 via-white to-teal-500/10 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 border-2 border-emerald-500/30 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
              <span className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                Total Platform Net Profit
              </span>
              <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
              +{formatNaira(data?.summary.totalNetProfit || 0)}
            </p>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-500 dark:text-slate-400 truncate">
                Services: {formatNaira(data?.summary.totalServiceProfit || 0)} · Fees: {formatNaira(data?.summary.totalCollectionFees || 0)}
              </span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold shrink-0">Retained</span>
            </div>
          </div>

          {/* Card 3: Delivered Service Sales */}
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                <ShoppingBag className="w-3.5 h-3.5 text-sky-500" />
                Delivered Service Sales
              </span>
              <div className="w-8 h-8 rounded-xl bg-sky-500/10 text-sky-500 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {formatNaira(data?.summary.totalGrossSales || 0)}
            </p>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-500 dark:text-slate-400">
                {data?.summary.totalCompletedOrders || 0} Successful Orders (Avg: {formatNaira(data?.summary.averageOrderValue || 0)})
              </span>
              <span className="text-sky-600 dark:text-sky-400 font-bold">GMV</span>
            </div>
          </div>

          {/* Card 4: Profit Margin Yield */}
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                <Percent className="w-3.5 h-3.5 text-purple-500" />
                Overall Margin Yield
              </span>
              <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
                <Percent className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-purple-600 dark:text-purple-400 tracking-tight">
              {data?.summary.overallMarginPercent || 0}%
            </p>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-500 dark:text-slate-400">
                Yield Across Total Flow
              </span>
              <span className="text-purple-600 dark:text-purple-400 font-bold">Efficiency</span>
            </div>
          </div>
        </div>

        {/* Tier 2: Wallet Funding, Collection Fees, COGS & Reversals */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 5: Gross Wallet Inflow (Deposits) */}
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                <ArrowDownLeft className="w-3.5 h-3.5 text-blue-500" />
                Gross Wallet Inflow
              </span>
              <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                <Wallet className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-blue-600 dark:text-blue-400 tracking-tight">
              {formatNaira(data?.summary.totalGrossDeposits || data?.summary.totalDepositVolume || 0)}
            </p>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-500 dark:text-slate-400">
                {data?.summary.totalDepositCount || 0} Deposits · Net: {formatNaira(data?.summary.totalNetDeposits || 0)}
              </span>
              <span className="text-blue-600 dark:text-blue-400 font-bold">Collections</span>
            </div>
          </div>

          {/* Card 6: Payment Collection Fees Made */}
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                <Receipt className="w-3.5 h-3.5 text-emerald-500" />
                Collection Fees Made
              </span>
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Landmark className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
              +{formatNaira(data?.summary.totalCollectionFees || 0)}
            </p>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-500 dark:text-slate-400">
                Dedicated Accounts & Gateway Fees
              </span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">100% Retained</span>
            </div>
          </div>

          {/* Card 7: Wholesale Provider Costs (COGS) */}
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-amber-500" />
                Wholesale Provider Costs
              </span>
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                <CreditCard className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400 tracking-tight">
              {formatNaira(data?.summary.totalWholesaleCost || 0)}
            </p>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-500 dark:text-slate-400">Cost of Goods Sold (COGS)</span>
              <span className="text-amber-600 dark:text-amber-400 font-bold">Supplier Debits</span>
            </div>
          </div>

          {/* Card 8: Refunds & Auto-Reversals */}
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                <RotateCcw className="w-3.5 h-3.5 text-rose-500" />
                Auto-Refunded Orders
              </span>
              <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
                <RotateCcw className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-rose-600 dark:text-rose-400 tracking-tight">
              {formatNaira(data?.summary.totalRefundAmount || 0)}
            </p>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-500 dark:text-slate-400">
                {data?.summary.totalRefundOrders || 0} Orders Restored to Wallets
              </span>
              <span className="text-rose-600 dark:text-rose-400 font-bold">100% Reversed</span>
            </div>
          </div>
        </div>
      </div>

      {/* Reversals & Failed Orders Audit Alert */}
      {data?.summary && data.summary.totalRefundOrders > 0 && (
        <div className="p-4 rounded-3xl bg-rose-500/10 border border-rose-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-rose-500/20 text-rose-500 flex items-center justify-center shrink-0">
              <RotateCcw className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-rose-600 dark:text-rose-400 text-xs sm:text-sm">
                {data.summary.totalRefundOrders} Failed & Reversed {data.summary.totalRefundOrders === 1 ? 'Order' : 'Orders'} ({formatNaira(data.summary.totalRefundAmount)})
              </p>
              <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
                Funds were automatically refunded back to customer wallets. These are strictly excluded from actual revenue and wholesale provider costs.
              </p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full bg-rose-500/20 text-rose-600 dark:text-rose-400 font-mono font-bold text-[11px] self-start sm:self-center shrink-0">
            100% Refunded
          </span>
        </div>
      )}

      {/* Visual Periodic Performance Trend */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-brand-orange" />
              Periodic Sales vs Provider Costs vs Net Profit Visualizer
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Comparative volume distribution across the active time window ({period.toUpperCase()}).
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs font-semibold">
            <div className="flex items-center gap-1 text-sky-600 dark:text-sky-400">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
              Sales (₦)
            </div>
            <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              Cost (₦)
            </div>
            <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              Profit (₦)
            </div>
          </div>
        </div>

        {/* Interactive Bar Visualizer */}
        {!data?.timeSeries || data.timeSeries.length === 0 ? (
          <div className="h-44 flex items-center justify-center text-slate-400 text-xs">
            No periodic transactions recorded for this timeframe.
          </div>
        ) : (
          <div className="pt-4 overflow-x-auto">
            <div className="min-w-[600px] flex items-end justify-between gap-2 h-48 border-b border-slate-100 dark:border-white/5 pb-2">
              {data.timeSeries.map((pt, idx) => {
                const salesHeight = Math.max(8, Math.round((pt.sales / maxTimeSeriesSales) * 100));
                const costHeight = Math.max(6, Math.round((pt.cost / maxTimeSeriesSales) * 100));
                const profitHeight = Math.max(4, Math.round((pt.profit / maxTimeSeriesSales) * 100));

                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-1 group relative">
                    {/* Tooltip on Hover */}
                    <div className="absolute -top-16 left-1/2 -translate-x-1/2 hidden group-hover:flex flex-col items-center p-2 rounded-xl bg-slate-950 text-white text-[10px] shadow-xl z-20 whitespace-nowrap border border-white/10 pointer-events-none">
                      <span className="font-bold text-amber-400">{pt.label}</span>
                      <span>Sales: {formatNaira(pt.sales)}</span>
                      <span>Cost: {formatNaira(pt.cost)}</span>
                      <span className="text-emerald-400 font-bold">Profit: +{formatNaira(pt.profit)}</span>
                    </div>

                    <div className="w-full flex items-end justify-center gap-1 h-36">
                      <div
                        style={{ height: `${salesHeight}%` }}
                        className="w-2.5 sm:w-3.5 bg-sky-500 rounded-t-sm transition-all duration-300 opacity-90 group-hover:opacity-100"
                      />
                      <div
                        style={{ height: `${costHeight}%` }}
                        className="w-2.5 sm:w-3.5 bg-amber-500/80 rounded-t-sm transition-all duration-300 opacity-80 group-hover:opacity-100"
                      />
                      <div
                        style={{ height: `${profitHeight}%` }}
                        className="w-2.5 sm:w-3.5 bg-emerald-500 rounded-t-sm transition-all duration-300 opacity-90 group-hover:opacity-100"
                      />
                    </div>
                    <span className="text-[9.5px] font-mono text-slate-400 truncate max-w-[48px]">
                      {pt.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-white/10 pb-2">
        <button
          onClick={() => setActiveSubTab('overview')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'overview'
              ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Provider Breakdown Matrix
        </button>

        <button
          onClick={() => setActiveSubTab('categories')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'categories'
              ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Service Category Breakdown
        </button>

        <button
          onClick={() => setActiveSubTab('ledger')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'ledger'
              ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Itemized Financial Audit Ledger ({filteredLedger.length})
        </button>
      </div>

      {/* SubTab 1: Provider Breakdown Matrix */}
      {activeSubTab === 'overview' && (
        <div className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/80 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Fulfillment Provider Performance & Margins
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Detailed comparison of revenue, wholesale expenses, and margins across each integrated vendor.
              </p>
            </div>
            <span className="text-xs font-mono text-slate-400">
              {data?.providerBreakdown.length || 0} Registered Providers
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-950/60 uppercase tracking-wider text-[11px] text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="py-3.5 px-4 font-bold">Provider / Gateway</th>
                  <th className="py-3.5 px-4 font-bold text-center">Orders</th>
                  <th className="py-3.5 px-4 font-bold text-right">Gross Volume</th>
                  <th className="py-3.5 px-4 font-bold text-right">Wholesale Cost</th>
                  <th className="py-3.5 px-4 font-bold text-right">Fees Retained</th>
                  <th className="py-3.5 px-4 font-bold text-right">Net Profit</th>
                  <th className="py-3.5 px-4 font-bold text-center">Margin %</th>
                  <th className="py-3.5 px-4 font-bold text-center">Reversals</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-slate-700 dark:text-slate-300">
                {!data?.providerBreakdown || data.providerBreakdown.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-10 text-slate-400">
                      No provider sales recorded for this timeframe.
                    </td>
                  </tr>
                ) : (
                  data.providerBreakdown.map((p) => {
                    const Icon = PROVIDER_ICONS[p.providerId] || Zap;
                    return (
                      <tr
                        key={p.providerId}
                        className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300">
                              <Icon className="w-3.5 h-3.5" />
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 dark:text-white text-xs">
                                {p.name}
                              </p>
                              <span className="text-[10px] text-slate-400 font-mono">
                                ID: {p.providerId}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-center font-mono font-semibold">
                          {p.totalOrders}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900 dark:text-white">
                          {formatNaira(p.grossSales)}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono text-amber-600 dark:text-amber-400">
                          {formatNaira(p.totalCost)}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono font-semibold text-teal-600 dark:text-teal-400">
                          {p.collectionFees > 0 ? `+${formatNaira(p.collectionFees)}` : '₦0.00'}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          +{formatNaira(p.netProfit)}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                            {p.marginPercent}%
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center font-mono text-[11px] text-slate-400">
                          {p.refundedCount > 0 ? (
                            <span className="text-rose-500 font-semibold">
                              {p.refundedCount} ({formatNaira(p.refundedAmount)})
                            </span>
                          ) : (
                            '0'
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SubTab 2: Category Breakdown */}
      {activeSubTab === 'categories' && (
        <div className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/80 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 dark:border-white/5">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Service Category & Collections Profitability
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Contribution to top-line turnover and bottom-line retained profit across all service pillars and funding collections.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-950/60 uppercase tracking-wider text-[11px] text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="py-3.5 px-4 font-bold">Category</th>
                  <th className="py-3.5 px-4 font-bold text-center">Volume</th>
                  <th className="py-3.5 px-4 font-bold text-right">Gross Sales / Inflow</th>
                  <th className="py-3.5 px-4 font-bold text-right">Wholesale Cost</th>
                  <th className="py-3.5 px-4 font-bold text-right">Fees Retained</th>
                  <th className="py-3.5 px-4 font-bold text-right">Net Profit</th>
                  <th className="py-3.5 px-4 font-bold text-center">Net Margin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-slate-700 dark:text-slate-300">
                {!data?.categoryBreakdown || data.categoryBreakdown.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-10 text-slate-400">
                      No category metrics available for this period.
                    </td>
                  </tr>
                ) : (
                  data.categoryBreakdown.map((cat) => (
                    <tr
                      key={cat.category}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3.5 px-4 font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                        {cat.label}
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono font-semibold">
                        {cat.totalOrders}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900 dark:text-white">
                        {formatNaira(cat.grossSales)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono text-amber-600 dark:text-amber-400">
                        {formatNaira(cat.totalCost)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-semibold text-teal-600 dark:text-teal-400">
                        {cat.collectionFees > 0 ? `+${formatNaira(cat.collectionFees)}` : '₦0.00'}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        +{formatNaira(cat.netProfit)}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          {cat.marginPercent}%
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SubTab 3: Itemized Financial Audit Ledger */}
      {activeSubTab === 'ledger' && (
        <div className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/80 shadow-sm p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Itemized Sales & Profit Audit Log
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Click any row to open the complete diagnostic modal with provider telemetry and raw payload.
              </p>
            </div>

            <div className="relative min-w-[240px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search reference, item or provider..."
                className="w-full pl-9 pr-4 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-brand-orange"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-950/60 uppercase tracking-wider text-[11px] text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="py-3.5 px-4 font-bold">Ref / Date</th>
                  <th className="py-3.5 px-4 font-bold">Category</th>
                  <th className="py-3.5 px-4 font-bold">Description</th>
                  <th className="py-3.5 px-4 font-bold">Provider / Gateway</th>
                  <th className="py-3.5 px-4 font-bold text-right">Gross Amount</th>
                  <th className="py-3.5 px-4 font-bold text-right">Wholesale Cost</th>
                  <th className="py-3.5 px-4 font-bold text-right">Fee Retained</th>
                  <th className="py-3.5 px-4 font-bold text-right">Net Profit</th>
                  <th className="py-3.5 px-4 font-bold text-center">Margin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-slate-700 dark:text-slate-300 font-mono">
                {filteredLedger.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-10 text-slate-400 font-sans">
                      No matching records found.
                    </td>
                  </tr>
                ) : (
                  filteredLedger.map((row) => (
                    <tr
                      key={row.id}
                      onClick={() =>
                        onSelectAuditTx &&
                        onSelectAuditTx({
                          ...row,
                          amount: row.retailPrice,
                          created_at: row.date,
                        })
                      }
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors cursor-pointer"
                      title="Click to view full provider telemetry in audit modal"
                    >
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-amber-600 dark:text-brand-orange block text-xs">
                          {row.reference}
                        </span>
                        <span className="text-[10px] text-slate-400 font-sans">
                          {formatDate(row.date)}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 uppercase font-bold text-[10px] text-slate-600 dark:text-slate-400">
                        {row.category}
                      </td>
                      <td className="py-3.5 px-4 font-sans max-w-xs truncate text-slate-800 dark:text-slate-200">
                        {row.description}
                      </td>
                      <td className="py-3.5 px-4 font-sans text-xs">
                        <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-[10px]">
                          {row.providerName}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold">
                        {row.type === 'reversal' || row.status === 'refunded' ? (
                          <span className="text-rose-500 font-semibold line-through">
                            {formatNaira(row.retailPrice)}
                          </span>
                        ) : (
                          <span className="text-slate-900 dark:text-white">
                            {formatNaira(row.retailPrice)}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right text-amber-600 dark:text-amber-400">
                        {formatNaira(row.wholesaleCost)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-semibold">
                        {row.fee > 0 ? (
                          <span className="text-teal-600 dark:text-teal-400">
                            +{formatNaira(row.fee)}
                          </span>
                        ) : (
                          <span className="text-slate-400 font-normal">₦0.00</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold">
                        {row.type === 'reversal' || row.status === 'refunded' ? (
                          <span className="text-slate-400 font-normal">₦0.00</span>
                        ) : (
                          <span className="text-emerald-600 dark:text-emerald-400">
                            +{formatNaira(row.netProfit)}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {row.type === 'reversal' || row.status === 'refunded' ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-500 border border-rose-500/20">
                            Reversed
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                            {row.marginPercent}%
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

