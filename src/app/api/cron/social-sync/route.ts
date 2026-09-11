import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { getMultipleOrdersStatus } from '@/lib/vendors/momo';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const { searchParams } = new URL(request.url);
    const queryKey = searchParams.get('key');
    const expectedSecret = process.env.CRON_SECRET || 'korrectpay_cron_secret_2026';

    const isAuthorized =
      authHeader === `Bearer ${expectedSecret}` ||
      queryKey === expectedSecret;

    if (!isAuthorized) {
      return NextResponse.json({ error: 'Unauthorized cron request' }, { status: 401 });
    }

    const supabase = createAdminClient();
    const threeDaysAgo = new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString();

    // Query active social boost transactions
    const { data: transactions, error: txError } = await supabase
      .from('transactions')
      .select('*')
      .eq('category', 'social')
      .eq('type', 'debit')
      .eq('status', 'completed')
      .gte('created_at', threeDaysAgo)
      .order('created_at', { ascending: false })
      .limit(50);

    if (txError) {
      return NextResponse.json({ success: false, error: txError.message }, { status: 500 });
    }

    const activeTxMap = new Map<string, any>();
    const orderIds: string[] = [];

    for (const tx of transactions || []) {
      const meta = tx.metadata || {};
      const orderId = meta.momoOrderId || meta.orderId;
      const status = meta.deliveryStatus || meta.status || 'Pending';

      if (orderId && status !== 'Completed' && status !== 'Canceled') {
        const idStr = String(orderId);
        if (!idStr.startsWith('KP-')) {
          activeTxMap.set(idStr, tx);
          orderIds.push(idStr);
        }
      }
    }

    if (orderIds.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No pending social orders to sync',
        syncedCount: 0,
      });
    }

    // Call MomoPanel batch status
    const batchRes = await getMultipleOrdersStatus(orderIds);
    let updatedCount = 0;

    if (!batchRes.isMock && batchRes.success && batchRes.statuses) {
      for (const [id, raw] of Object.entries<any>(batchRes.statuses)) {
        const tx = activeTxMap.get(id);
        if (tx && raw && raw.status) {
          const currentMeta = tx.metadata || {};
          await supabase
            .from('transactions')
            .update({
              metadata: {
                ...currentMeta,
                deliveryStatus: raw.status,
                start_count: raw.start_count,
                remains: raw.remains,
                charge: raw.charge,
                lastSyncedAt: new Date().toISOString(),
              },
            })
            .eq('id', tx.id);
          updatedCount++;
        }
      }
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      queriedOrders: orderIds.length,
      updatedCount,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
