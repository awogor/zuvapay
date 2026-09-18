import { NextResponse, type NextRequest } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';

export interface ProviderSummary {
  providerId: string;
  name: string;
  category: string;
  totalOrders: number;
  grossSales: number;
  totalCost: number;
  collectionFees: number;
  netProfit: number;
  marginPercent: number;
  refundedCount: number;
  refundedAmount: number;
}

export interface CategorySummary {
  category: string;
  label: string;
  totalOrders: number;
  grossSales: number;
  totalCost: number;
  collectionFees: number;
  netProfit: number;
  marginPercent: number;
}

export interface TimeSeriesPoint {
  label: string;
  periodKey: string;
  sales: number;
  cost: number;
  collectionFees: number;
  profit: number;
  ordersCount: number;
}

function extractDepositFee(tx: any): { fee: number; grossAmount: number; netAmount: number } {
  const netAmount = Math.abs(parseFloat(tx.amount || 0));
  const meta = tx.metadata || {};
  const desc = tx.description || '';

  let fee = 0;
  if (meta.fee !== undefined && meta.fee !== null && !isNaN(parseFloat(meta.fee))) {
    fee = parseFloat(meta.fee);
  } else if (meta.gross_amount && meta.net_amount) {
    fee = Math.max(0, parseFloat(meta.gross_amount) - parseFloat(meta.net_amount));
  } else {
    // Check if description has "[₦50 Fee Deducted]" or similar
    const feeMatch = desc.match(/\[₦?([0-9,.]+)\s*Fee\s*Deducted\]/i);
    if (feeMatch && feeMatch[1]) {
      fee = parseFloat(feeMatch[1].replace(/,/g, ''));
    } else if (desc.toLowerCase().includes('9psb') || meta.gateway === 'billstack' || meta.bankName) {
      // 9PSB / Billstack flat dedicated account fee is ₦50
      fee = 50;
    }
  }

  const grossAmount = meta.gross_amount
    ? parseFloat(meta.gross_amount)
    : meta.total_paid
    ? parseFloat(meta.total_paid)
    : netAmount + fee;

  return { fee, grossAmount, netAmount };
}

function resolveProvider(tx: any): { id: string; name: string } {
  const meta = tx.metadata || {};
  const descLower = (tx.description || '').toLowerCase();
  const cat = (tx.category || '').toLowerCase();
  const rawProvider = String(meta.provider || meta.vendor || meta.supplier || meta.gateway || '').toLowerCase();
  const opRef = String(meta.operatorReference || meta.operator_reference || meta.provider_ref || '').toUpperCase();
  const planId = String(meta.planId || meta.plan_id || '').toLowerCase();
  const planType = String(meta.planType || meta.type || '').toLowerCase();

  // 1. Explicit vendor or gateway metadata
  if (rawProvider) {
    if (rawProvider.includes('billstack') || meta.bankName || descLower.includes('billstack') || descLower.includes('9psb')) {
      return { id: 'billstack', name: 'Billstack (9PSB Dedicated Account)' };
    }
    if (rawProvider.includes('korapay') || opRef.startsWith('ZP-VBA') || opRef.startsWith('KP-VBA') || opRef.startsWith('KP-') || descLower.includes('korapay')) {
      return { id: 'korapay', name: 'Korapay Virtual Accounts' };
    }
    if (rawProvider.includes('strowallet')) return { id: 'strowallet', name: 'StroWallet API Gateway' };
    if (rawProvider.includes('gongoz')) return { id: 'gongoz', name: 'GongozAPI Gateway' };
    if (rawProvider.includes('fadded')) return { id: 'fadded', name: 'Fadded Inventory Provider' };
    if (rawProvider.includes('momo')) return { id: 'momo', name: 'MomoPanel Enterprise API' };
    if (rawProvider.includes('grizzly')) return { id: 'grizzly', name: 'GrizzlySMS (Server 2)' };
    if (rawProvider.includes('smspool')) return { id: 'smspool', name: 'SMSPool (Server 1)' };
    if (rawProvider.includes('marketplace') || rawProvider.includes('aiplug')) return { id: 'marketplace', name: 'AI Marketplace Gateway' };
  }

  // 2. Upstream operator reference prefix inspection
  if (opRef.startsWith('STRO-') || planId.startsWith('stro-')) {
    return { id: 'strowallet', name: 'StroWallet API Gateway' };
  }
  if (opRef.startsWith('GONGOZ-') || planId.startsWith('gongoz-')) {
    return { id: 'gongoz', name: 'GongozAPI Gateway' };
  }
  if (opRef.startsWith('GRIZZLY-')) {
    return { id: 'grizzly', name: 'GrizzlySMS (Server 2)' };
  }
  if (opRef.startsWith('SMSP-')) {
    return { id: 'smspool', name: 'SMSPool (Server 1)' };
  }
  if (opRef.startsWith('MOMO-')) {
    return { id: 'momo', name: 'MomoPanel Enterprise API' };
  }

  // 3. Deposit & funding categorization
  if (cat === 'deposit' || tx.type === 'credit') {
    if (descLower.includes('9psb') || meta.bankName || descLower.includes('billstack')) {
      return { id: 'billstack', name: 'Billstack (9PSB Dedicated Account)' };
    }
    if (descLower.includes('korapay') || tx.reference?.startsWith('ZP-CHG') || tx.reference?.startsWith('KP-CHG') || tx.reference?.startsWith('KP-')) {
      return { id: 'korapay', name: 'Korapay Dedicated Account' };
    }
    if (descLower.includes('admin') || tx.reference?.startsWith('ADM-')) {
      return { id: 'internal', name: 'Manual Admin Adjustment' };
    }
    return { id: 'billstack', name: 'Dedicated Virtual Account' };
  }

  // 4. Category contextual fallback
  if (
    cat === 'marketplace' ||
    descLower.includes('chatgpt') ||
    descLower.includes('cursor') ||
    descLower.includes('gemini') ||
    descLower.includes('canva') ||
    descLower.includes('capcut')
  ) {
    return { id: 'marketplace', name: 'AI Marketplace Gateway' };
  }
  if (
    ['power', 'cable', 'tv', 'virtual_card', 'card'].includes(cat) ||
    descLower.includes('electricity') ||
    descLower.includes('meter') ||
    descLower.includes('dstv') ||
    descLower.includes('gotv') ||
    descLower.includes('startimes')
  ) {
    return { id: 'strowallet', name: 'StroWallet API Gateway' };
  }
  if (cat === 'airtime') {
    return { id: 'strowallet', name: 'StroWallet API Gateway' };
  }
  if (cat === 'data') {
    if (planType === 'direct' || planId.startsWith('stro-') || descLower.includes('direct')) {
      return { id: 'strowallet', name: 'StroWallet API Gateway' };
    }
    return { id: 'gongoz', name: 'GongozAPI Gateway' };
  }
  if (cat === 'logs' || descLower.includes('account log') || descLower.includes('inventory')) {
    return { id: 'fadded', name: 'Fadded Inventory Provider' };
  }
  if (cat === 'social' || descLower.includes('follower') || descLower.includes('instagram') || descLower.includes('tiktok boost')) {
    return { id: 'momo', name: 'MomoPanel Enterprise API' };
  }
  if (cat === 'sms' || descLower.includes('virtual line') || descLower.includes('otp')) {
    if (meta.server === 'server2' || descLower.includes('server 2')) {
      return { id: 'grizzly', name: 'GrizzlySMS (Server 2)' };
    }
    return { id: 'smspool', name: 'SMSPool (Server 1)' };
  }

  return { id: 'internal', name: 'Internal Settlement Engine' };
}

function calculateTxCost(tx: any): { cost: number; profit: number } {
  const amount = parseFloat(tx.amount || 0);
  const meta = tx.metadata || {};
  const isRefund =
    tx.category === 'refund' ||
    tx.reference?.startsWith('ZP-REF') ||
    tx.reference?.startsWith('KP-REF') ||
    (tx.description || '').toLowerCase().startsWith('refund') ||
    meta.is_refund === true;

  if (isRefund || tx.type === 'credit') {
    return { cost: 0, profit: 0 };
  }

  let cost = 0;
  if (meta.provider_cost !== undefined) {
    cost = parseFloat(meta.provider_cost);
  } else if (meta.wholesale_cost !== undefined) {
    cost = parseFloat(meta.wholesale_cost);
  } else if (meta.cost !== undefined) {
    cost = parseFloat(meta.cost);
  } else {
    const cat = (tx.category || '').toLowerCase();
    const descLower = (tx.description || '').toLowerCase();

    if (cat === 'airtime') cost = Number((amount * 0.98).toFixed(2));
    else if (cat === 'data') cost = Number((amount * 0.90).toFixed(2));
    else if (cat === 'power') cost = Number((amount * 0.995).toFixed(2)); // ~0.5% DisCo operator commission
    else if (cat === 'cable' || cat === 'tv') cost = Number((amount * 0.990).toFixed(2)); // ~1.0% bouquet commission
    else if (cat === 'sms') cost = Number((amount * 0.75).toFixed(2));
    else if (cat === 'social') cost = Number((amount * 0.68).toFixed(2));
    else if (cat === 'logs') cost = Number((amount * 0.80).toFixed(2));
    else if (cat === 'marketplace' || descLower.includes('chatgpt') || descLower.includes('cursor')) cost = Number((amount * 0.82).toFixed(2));
    else cost = Number((amount * 0.90).toFixed(2));
  }

  const profit = Math.max(0, amount - cost);
  return { cost, profit };
}



export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    const { data: userProfile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    if (!userProfile || userProfile.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Access denied. Admins only.' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'month';
    const providerFilter = searchParams.get('provider') || 'all';
    const categoryFilter = searchParams.get('category') || 'all';
    const selectedYear = searchParams.get('year') ? parseInt(searchParams.get('year')!) : new Date().getFullYear();
    const selectedMonth = searchParams.get('month') ? parseInt(searchParams.get('month')!) : new Date().getMonth();
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');

    const now = new Date();
    let startTime = new Date(0);
    let endTime = new Date(now.getTime() + 86400 * 1000);

    if (period === 'today') {
      startTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
      endTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
    } else if (period === 'yesterday') {
      const yesterday = new Date(now.getTime() - 86400 * 1000);
      startTime = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 0, 0, 0);
      endTime = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 23, 59, 59);
    } else if (period === '7d') {
      startTime = new Date(now.getTime() - 7 * 86400 * 1000);
    } else if (period === '30d') {
      startTime = new Date(now.getTime() - 30 * 86400 * 1000);
    } else if (period === 'month') {
      startTime = new Date(selectedYear, selectedMonth, 1, 0, 0, 0);
      endTime = new Date(selectedYear, selectedMonth + 1, 0, 23, 59, 59);
    } else if (period === 'year') {
      startTime = new Date(selectedYear, 0, 1, 0, 0, 0);
      endTime = new Date(selectedYear, 11, 31, 23, 59, 59);
    } else if (period === 'custom' && startDateParam && endDateParam) {
      startTime = new Date(startDateParam);
      endTime = new Date(new Date(endDateParam).getTime() + 86400 * 1000);
    }

    const adminSupabase = createAdminClient();
    let query = adminSupabase
      .from('transactions')
      .select('*')
      .gte('created_at', startTime.toISOString())
      .lte('created_at', endTime.toISOString())
      .order('created_at', { ascending: false })
      .limit(5000);

    const { data: dbTxs, error: queryErr } = await query;
    if (queryErr) {
      console.error('[FINANCIAL_REPORTS_QUERY_ERROR]', queryErr);
    }
    const mergedTxs = dbTxs || [];

    const filteredTxs = mergedTxs.filter((tx: any) => {
      const provider = resolveProvider(tx);
      if (providerFilter !== 'all' && provider.id !== providerFilter) return false;

      const cat = (tx.category || '').toLowerCase();
      if (categoryFilter !== 'all' && cat !== categoryFilter) return false;

      return true;
    });

    let totalVolume = 0;
    let totalTransactionsCount = 0;

    // Funding & Collections
    let totalGrossDeposits = 0;
    let totalNetDeposits = 0;
    let totalDepositCount = 0;
    let totalCollectionFees = 0;

    // Service Fulfillment Sales
    let totalGrossSales = 0;
    let totalWholesaleCost = 0;
    let totalServiceProfit = 0;
    let totalCompletedOrders = 0;
    let totalRefundOrders = 0;
    let totalRefundAmount = 0;

    const providerMap = new Map<string, ProviderSummary>();
    const categoryMap = new Map<string, CategorySummary>();
    const itemizedList: any[] = [];
    const timeSeriesMap = new Map<string, TimeSeriesPoint>();

    if (period === 'year') {
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      monthNames.forEach((name, idx) => {
        const key = `${selectedYear}-${String(idx + 1).padStart(2, '0')}`;
        timeSeriesMap.set(key, { label: name, periodKey: key, sales: 0, cost: 0, collectionFees: 0, profit: 0, ordersCount: 0 });
      });
    } else if (period === 'month') {
      const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
      for (let day = 1; day <= daysInMonth; day++) {
        const key = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        timeSeriesMap.set(key, { label: `Day ${day}`, periodKey: key, sales: 0, cost: 0, collectionFees: 0, profit: 0, ordersCount: 0 });
      }
    } else if (period === '7d' || period === '30d') {
      const numDays = period === '7d' ? 7 : 30;
      for (let i = numDays - 1; i >= 0; i--) {
        const d = new Date(now.getTime() - i * 86400 * 1000);
        const key = d.toISOString().split('T')[0];
        const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' });
        timeSeriesMap.set(key, { label: dayLabel, periodKey: key, sales: 0, cost: 0, collectionFees: 0, profit: 0, ordersCount: 0 });
      }
    } else if (period === 'today' || period === 'yesterday') {
      const targetDate = period === 'today' ? now : new Date(now.getTime() - 86400 * 1000);
      const datePrefix = targetDate.toISOString().split('T')[0];
      for (let h = 0; h < 24; h++) {
        const key = `${datePrefix}T${String(h).padStart(2, '0')}`;
        const label = `${String(h).padStart(2, '0')}:00`;
        timeSeriesMap.set(key, { label, periodKey: key, sales: 0, cost: 0, collectionFees: 0, profit: 0, ordersCount: 0 });
      }
    }

    // Build set of all refunded/reversed references to prevent counting failed orders as sales
    const refundedReferences = new Set<string>();
    mergedTxs.forEach((tx: any) => {
      const isRefundTx =
        tx.category === 'refund' ||
        tx.reference?.startsWith('ZP-REF') ||
        tx.reference?.startsWith('KP-REF') ||
        (tx.description || '').toLowerCase().startsWith('refund') ||
        tx.metadata?.is_refund === true;

      if (isRefundTx) {
        const orig =
          tx.metadata?.original_reference ||
          tx.metadata?.originalReference ||
          tx.metadata?.originalRef;
        if (orig) refundedReferences.add(orig);

        const m = (tx.description || '').match(/\[Ref:\s*([^\]]+)\]/i);
        if (m && m[1]) refundedReferences.add(m[1].trim());
      }
    });

    filteredTxs.forEach((tx: any) => {
      const amount = Math.abs(parseFloat(tx.amount || 0));

      const isDeposit =
        tx.type === 'credit' &&
        (tx.category === 'deposit' ||
          (tx.description || '').toLowerCase().includes('deposit') ||
          (tx.description || '').toLowerCase().includes('funded'));

      const isRefund =
        tx.category === 'refund' ||
        tx.reference?.startsWith('ZP-REF') ||
        tx.reference?.startsWith('KP-REF') ||
        (tx.description || '').toLowerCase().startsWith('refund') ||
        tx.metadata?.is_refund === true;

      const isFailedOrRefundedDebit =
        tx.type === 'debit' &&
        (tx.status === 'failed' ||
          tx.status === 'reversed' ||
          tx.status === 'refunded' ||
          tx.metadata?.refunded === true ||
          refundedReferences.has(tx.reference));

      const isDeliveredSale = tx.type === 'debit' && !isRefund && !isFailedOrRefundedDebit;

      const provider = resolveProvider(tx);
      const cat = isDeposit ? 'deposit' : (tx.category || 'other').toLowerCase();

      // Ensure Provider Map entry exists
      if (!providerMap.has(provider.id)) {
        providerMap.set(provider.id, {
          providerId: provider.id,
          name: provider.name,
          category: cat,
          totalOrders: 0,
          grossSales: 0,
          totalCost: 0,
          collectionFees: 0,
          netProfit: 0,
          marginPercent: 0,
          refundedCount: 0,
          refundedAmount: 0,
        });
      }
      const pSummary = providerMap.get(provider.id)!;

      // Ensure Category Map entry exists
      if (!categoryMap.has(cat)) {
        categoryMap.set(cat, {
          category: cat,
          label: cat === 'deposit' ? 'WALLET FUNDING & COLLECTIONS' : cat.toUpperCase(),
          totalOrders: 0,
          grossSales: 0,
          totalCost: 0,
          collectionFees: 0,
          netProfit: 0,
          marginPercent: 0,
        });
      }
      const cSummary = categoryMap.get(cat)!;

      const txDate = new Date(tx.created_at);
      let timeKey = txDate.toISOString().split('T')[0];
      if (period === 'year' || period === 'all') {
        timeKey = `${txDate.getFullYear()}-${String(txDate.getMonth() + 1).padStart(2, '0')}`;
      } else if (period === 'today' || period === 'yesterday') {
        timeKey = `${txDate.toISOString().split('T')[0]}T${String(txDate.getHours()).padStart(2, '0')}`;
      }

      if (!timeSeriesMap.has(timeKey)) {
        let label = timeKey;
        if (period === 'all' || period === 'year') {
          label = txDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        } else if (period === 'today' || period === 'yesterday') {
          label = `${String(txDate.getHours()).padStart(2, '0')}:00`;
        }
        timeSeriesMap.set(timeKey, {
          label,
          periodKey: timeKey,
          sales: 0,
          cost: 0,
          collectionFees: 0,
          profit: 0,
          ordersCount: 0,
        });
      }
      const tsPoint = timeSeriesMap.get(timeKey)!;

      if (isDeposit) {
        // Handle incoming wallet funding & collection fees
        const { fee, grossAmount, netAmount } = extractDepositFee(tx);

        totalGrossDeposits += grossAmount;
        totalNetDeposits += netAmount;
        totalDepositCount += 1;
        totalCollectionFees += fee;
        totalVolume += grossAmount;
        totalTransactionsCount += 1;

        pSummary.totalOrders += 1;
        pSummary.grossSales += grossAmount;
        pSummary.collectionFees += fee;
        pSummary.netProfit += fee; // Collection fee is direct platform retained profit

        cSummary.totalOrders += 1;
        cSummary.grossSales += grossAmount;
        cSummary.collectionFees += fee;
        cSummary.netProfit += fee;

        tsPoint.sales += grossAmount;
        tsPoint.collectionFees = (tsPoint.collectionFees || 0) + fee;
        tsPoint.profit += fee;
        tsPoint.ordersCount += 1;

        itemizedList.push({
          id: tx.id,
          reference: tx.reference,
          date: tx.created_at,
          category: 'deposit',
          description: tx.description || 'Wallet Deposit',
          providerId: provider.id,
          providerName: provider.name,
          retailPrice: grossAmount,
          wholesaleCost: 0,
          fee: fee,
          netProfit: fee,
          marginPercent: grossAmount > 0 ? Math.round((fee / grossAmount) * 100) : 0,
          status: 'credited',
          type: 'deposit',
        });
      } else if (isDeliveredSale) {
        // Actual Delivered Product / Bill Fulfillment Revenue
        const { cost, profit } = calculateTxCost(tx);

        totalGrossSales += amount;
        totalWholesaleCost += cost;
        totalServiceProfit += profit;
        totalCompletedOrders += 1;
        totalVolume += amount;
        totalTransactionsCount += 1;

        pSummary.totalOrders += 1;
        pSummary.grossSales += amount;
        pSummary.totalCost += cost;
        pSummary.netProfit += profit;

        cSummary.totalOrders += 1;
        cSummary.grossSales += amount;
        cSummary.totalCost += cost;
        cSummary.netProfit += profit;

        tsPoint.sales += amount;
        tsPoint.cost += cost;
        tsPoint.profit += profit;
        tsPoint.ordersCount += 1;

        itemizedList.push({
          id: tx.id,
          reference: tx.reference,
          date: tx.created_at,
          category: cat,
          description: tx.description,
          providerId: provider.id,
          providerName: provider.name,
          retailPrice: amount,
          wholesaleCost: cost,
          fee: 0,
          netProfit: profit,
          marginPercent: amount > 0 ? Math.round((profit / amount) * 100) : 0,
          status: 'completed',
          type: 'sale',
        });
      } else if (isFailedOrRefundedDebit) {
        // Failed / Refunded purchase: Exclude from delivered sales and provider COGS
        totalRefundOrders += 1;
        totalRefundAmount += amount;
        totalVolume += amount;
        totalTransactionsCount += 1;

        pSummary.refundedCount += 1;
        pSummary.refundedAmount += amount;

        itemizedList.push({
          id: tx.id,
          reference: tx.reference,
          date: tx.created_at,
          category: cat,
          description: `${tx.description || 'Order'} (Failed & Refunded)`,
          providerId: provider.id,
          providerName: provider.name,
          retailPrice: amount,
          wholesaleCost: 0,
          fee: 0,
          netProfit: 0,
          marginPercent: 0,
          status: 'refunded',
          type: 'reversal',
        });
      } else if (isRefund) {
        // Refund credit log
        const origRef = tx.metadata?.original_reference;
        const alreadyCountedInDebit = origRef && filteredTxs.some((t: any) => t.reference === origRef);

        if (!alreadyCountedInDebit) {
          totalRefundOrders += 1;
          totalRefundAmount += amount;
          pSummary.refundedCount += 1;
          pSummary.refundedAmount += amount;
        }
        totalTransactionsCount += 1;

        itemizedList.push({
          id: tx.id,
          reference: tx.reference,
          date: tx.created_at,
          category: 'refund',
          description: tx.description,
          providerId: provider.id,
          providerName: provider.name,
          retailPrice: -amount,
          wholesaleCost: 0,
          fee: 0,
          netProfit: 0,
          marginPercent: 0,
          status: 'refunded',
          type: 'refund',
        });
      }
    });

    const totalNetProfit = Math.max(0, totalServiceProfit + totalCollectionFees);
    const overallMarginPercent =
      totalVolume > 0 ? Math.round((totalNetProfit / totalVolume) * 100) : 0;
    const averageOrderValue =
      totalCompletedOrders > 0 ? Math.round(totalGrossSales / totalCompletedOrders) : 0;

    const providerBreakdown = Array.from(providerMap.values()).map((p) => ({
      ...p,
      marginPercent: p.grossSales > 0 ? Math.round((p.netProfit / p.grossSales) * 100) : 0,
    })).sort((a, b) => b.grossSales - a.grossSales);

    const categoryBreakdown = Array.from(categoryMap.values()).map((c) => ({
      ...c,
      marginPercent: c.grossSales > 0 ? Math.round((c.netProfit / c.grossSales) * 100) : 0,
    })).sort((a, b) => b.grossSales - a.grossSales);

    const timeSeries = Array.from(timeSeriesMap.values()).sort((a, b) =>
      a.periodKey.localeCompare(b.periodKey)
    );

    return NextResponse.json({
      success: true,
      period,
      year: selectedYear,
      month: selectedMonth,
      dateRange: {
        start: startTime.toISOString(),
        end: endTime.toISOString(),
      },
      summary: {
        totalVolume,
        totalTransactionsCount,
        // Funding & Collections
        totalGrossDeposits,
        totalNetDeposits,
        totalDepositVolume: totalNetDeposits, // Backward-compatibility
        totalDepositCount,
        totalCollectionFees,
        // Service Fulfillment
        totalGrossSales,
        totalWholesaleCost,
        totalServiceProfit,
        // Combined Platform Earnings
        totalNetProfit,
        overallMarginPercent,
        totalCompletedOrders,
        totalRefundOrders,
        totalRefundAmount,
        averageOrderValue,
      },
      providerBreakdown,
      categoryBreakdown,
      timeSeries,
      itemizedLedger: itemizedList.slice(0, 5000),
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
