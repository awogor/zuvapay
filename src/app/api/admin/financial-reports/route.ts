import { NextResponse, type NextRequest } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';

export interface ProviderSummary {
  providerId: string;
  name: string;
  category: string;
  totalOrders: number;
  grossSales: number;
  totalCost: number;
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
  netProfit: number;
  marginPercent: number;
}

export interface TimeSeriesPoint {
  label: string;
  periodKey: string;
  sales: number;
  cost: number;
  profit: number;
  ordersCount: number;
}

function resolveProvider(tx: any): { id: string; name: string } {
  const meta = tx.metadata || {};
  const descLower = (tx.description || '').toLowerCase();
  const cat = (tx.category || '').toLowerCase();

  if (meta.provider) {
    const p = String(meta.provider).toLowerCase();
    if (p.includes('gongoz') || p.includes('strowallet')) return { id: 'gongoz', name: 'GongozAPI Gateway' };
    if (p.includes('fadded')) return { id: 'fadded', name: 'Fadded Inventory Provider' };
    if (p.includes('momo')) return { id: 'momo', name: 'MomoPanel Enterprise API' };
    if (p.includes('grizzly')) return { id: 'grizzly', name: 'GrizzlySMS (Server 2)' };
    if (p.includes('smspool')) return { id: 'smspool', name: 'SMSPool (Server 1)' };
    if (p.includes('marketplace') || p.includes('aiplug')) return { id: 'marketplace', name: 'AI Marketplace Gateway' };
    if (p.includes('korapay')) return { id: 'korapay', name: 'Korapay Virtual Accounts' };
  }

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
  if (['airtime', 'data', 'power', 'cable', 'tv'].includes(cat) || descLower.includes('airtime') || descLower.includes('data bundle')) {
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
  if (cat === 'deposit') {
    return { id: 'korapay', name: 'Korapay Dedicated Bank' };
  }

  return { id: 'internal', name: 'Internal Settlement Engine' };
}

function calculateTxCost(tx: any): { cost: number; profit: number } {
  const amount = parseFloat(tx.amount || 0);
  const meta = tx.metadata || {};
  const isRefund =
    tx.category === 'refund' ||
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

    if (cat === 'airtime') cost = Math.round(amount * 0.98);
    else if (cat === 'data') cost = Math.round(amount * 0.88);
    else if (cat === 'power' || cat === 'cable' || cat === 'tv') cost = Math.max(0, amount - 100);
    else if (cat === 'sms') cost = Math.round(amount * 0.72);
    else if (cat === 'social') cost = Math.round(amount * 0.68);
    else if (cat === 'logs') cost = Math.round(amount * 0.80);
    else if (cat === 'marketplace' || descLower.includes('chatgpt') || descLower.includes('cursor')) cost = Math.round(amount * 0.82);
    else cost = Math.round(amount * 0.90);
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

    const adminSupabase = createAdminClient();
    const { data: dbTxs } = await adminSupabase
      .from('transactions')
      .select('*')
      .order('created_at', { ascending: false });

    const mergedTxs = dbTxs || [];

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

    const filteredTxs = mergedTxs.filter((tx: any) => {
      const txTime = new Date(tx.created_at);
      if (txTime < startTime || txTime > endTime) return false;

      const provider = resolveProvider(tx);
      if (providerFilter !== 'all' && provider.id !== providerFilter) return false;

      const cat = (tx.category || '').toLowerCase();
      if (categoryFilter !== 'all' && cat !== categoryFilter) return false;

      return true;
    });

    let totalGrossSales = 0;
    let totalWholesaleCost = 0;
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
        timeSeriesMap.set(key, { label: name, periodKey: key, sales: 0, cost: 0, profit: 0, ordersCount: 0 });
      });
    } else if (period === 'month') {
      const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
      for (let day = 1; day <= daysInMonth; day++) {
        const key = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        timeSeriesMap.set(key, { label: `Day ${day}`, periodKey: key, sales: 0, cost: 0, profit: 0, ordersCount: 0 });
      }
    } else if (period === '7d') {
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now.getTime() - i * 86400 * 1000);
        const key = d.toISOString().split('T')[0];
        const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' });
        timeSeriesMap.set(key, { label: dayLabel, periodKey: key, sales: 0, cost: 0, profit: 0, ordersCount: 0 });
      }
    }

    filteredTxs.forEach((tx: any) => {
      const amount = parseFloat(tx.amount || 0);
      const isRefund =
        tx.category === 'refund' ||
        tx.reference?.startsWith('KP-REF') ||
        (tx.description || '').toLowerCase().startsWith('refund') ||
        tx.metadata?.is_refund === true;
      const isDebitPurchase = tx.type === 'debit' && !isRefund;

      const provider = resolveProvider(tx);
      const cat = (tx.category || 'other').toLowerCase();

      if (!providerMap.has(provider.id)) {
        providerMap.set(provider.id, {
          providerId: provider.id,
          name: provider.name,
          category: cat,
          totalOrders: 0,
          grossSales: 0,
          totalCost: 0,
          netProfit: 0,
          marginPercent: 0,
          refundedCount: 0,
          refundedAmount: 0,
        });
      }
      const pSummary = providerMap.get(provider.id)!;

      if (!categoryMap.has(cat)) {
        categoryMap.set(cat, {
          category: cat,
          label: cat.toUpperCase(),
          totalOrders: 0,
          grossSales: 0,
          totalCost: 0,
          netProfit: 0,
          marginPercent: 0,
        });
      }
      const cSummary = categoryMap.get(cat)!;

      const { cost, profit } = calculateTxCost(tx);

      const txDate = new Date(tx.created_at);
      let timeKey = txDate.toISOString().split('T')[0];
      if (period === 'year') {
        timeKey = `${txDate.getFullYear()}-${String(txDate.getMonth() + 1).padStart(2, '0')}`;
      }

      if (!timeSeriesMap.has(timeKey)) {
        timeSeriesMap.set(timeKey, {
          label: timeKey,
          periodKey: timeKey,
          sales: 0,
          cost: 0,
          profit: 0,
          ordersCount: 0,
        });
      }
      const tsPoint = timeSeriesMap.get(timeKey)!;

      if (isDebitPurchase) {
        totalGrossSales += amount;
        totalWholesaleCost += cost;
        totalCompletedOrders += 1;

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
          netProfit: profit,
          marginPercent: amount > 0 ? Math.round((profit / amount) * 100) : 0,
          status: tx.status || 'completed',
          type: 'sale',
        });
      } else if (isRefund) {
        totalRefundOrders += 1;
        totalRefundAmount += amount;
        pSummary.refundedCount += 1;
        pSummary.refundedAmount += amount;

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
          netProfit: 0,
          marginPercent: 0,
          status: 'refunded',
          type: 'refund',
        });
      }
    });

    const totalNetProfit = Math.max(0, totalGrossSales - totalWholesaleCost);
    const overallMarginPercent =
      totalGrossSales > 0 ? Math.round((totalNetProfit / totalGrossSales) * 100) : 0;
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

    const timeSeries = Array.from(timeSeriesMap.values());

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
        totalGrossSales,
        totalWholesaleCost,
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
      itemizedLedger: itemizedList.slice(0, 100),
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
