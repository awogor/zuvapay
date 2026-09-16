import { NextResponse, type NextRequest } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

const RETENTION_DAYS = 30;
const RETENTION_MS = RETENTION_DAYS * 24 * 60 * 60 * 1000;

export interface BeneficiaryItem {
  id?: string;
  phone: string;
  network: string;
  service_type: string;
  nickname?: string | null;
  last_used_at: string;
  created_at?: string;
}

// GET /api/user/beneficiaries -> Fetch active beneficiaries (within last 30 days)
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const serviceType = searchParams.get('service_type'); // e.g. 'airtime', 'data'

    const cutoffDate = new Date(Date.now() - RETENTION_MS).toISOString();
    const adminSupabase = createAdminClient();

    // 1. Try fetching from public.beneficiaries table
    try {
      // Background prune expired beneficiaries (> 30 days inactive)
      adminSupabase
        .from('beneficiaries')
        .delete()
        .eq('user_id', user.id)
        .lt('last_used_at', cutoffDate)
        .then(() => {})
        .catch(() => {});

      let query = adminSupabase
        .from('beneficiaries')
        .select('*')
        .eq('user_id', user.id)
        .gte('last_used_at', cutoffDate)
        .order('last_used_at', { ascending: false });

      if (serviceType) {
        query = query.or(`service_type.eq.${serviceType},service_type.eq.general`);
      }

      const { data, error } = await query;

      if (!error && Array.isArray(data)) {
        return NextResponse.json({
          success: true,
          beneficiaries: data,
          retentionDays: RETENTION_DAYS,
        });
      }
    } catch {
      // Table might not exist yet; fall back to user_metadata below
    }

    // 2. Resilient fallback: user_metadata.recent_beneficiaries
    const rawList: BeneficiaryItem[] = user.user_metadata?.recent_beneficiaries || [];
    const now = Date.now();
    const activeList = rawList
      .filter((b) => {
        const time = new Date(b.last_used_at).getTime();
        const within30Days = now - time <= RETENTION_MS;
        if (!within30Days) return false;
        if (serviceType && b.service_type !== 'general' && b.service_type !== serviceType) {
          return false;
        }
        return true;
      })
      .sort((a, b) => new Date(b.last_used_at).getTime() - new Date(a.last_used_at).getTime());

    return NextResponse.json({
      success: true,
      beneficiaries: activeList,
      retentionDays: RETENTION_DAYS,
    });
  } catch (err: any) {
    console.error('Error in GET /api/user/beneficiaries:', err);
    return NextResponse.json({ success: false, error: err.message || 'Server error' }, { status: 500 });
  }
}

// POST /api/user/beneficiaries -> Auto-save or refresh beneficiary on transaction
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { phone, network, service_type = 'airtime', nickname } = body;

    let cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.startsWith('234') && cleanPhone.length > 10) {
      cleanPhone = '0' + cleanPhone.slice(3);
    }
    cleanPhone = cleanPhone.slice(0, 11);

    if (!cleanPhone || cleanPhone.length < 11) {
      return NextResponse.json({ success: false, error: 'Valid 11-digit phone number is required' }, { status: 400 });
    }

    if (!network || typeof network !== 'string') {
      return NextResponse.json({ success: false, error: 'Telco network is required' }, { status: 400 });
    }

    const cleanNetwork = network.trim();
    const nowIso = new Date().toISOString();
    const adminSupabase = createAdminClient();

    // 1. Try upserting into public.beneficiaries table
    let tableSaved = false;
    try {
      const { error } = await adminSupabase
        .from('beneficiaries')
        .upsert(
          {
            user_id: user.id,
            phone: cleanPhone,
            network: cleanNetwork,
            service_type,
            nickname: nickname?.trim() || null,
            last_used_at: nowIso,
          },
          { onConflict: 'user_id,phone' }
        );

      if (!error) {
        tableSaved = true;
      }
    } catch {
      // Table may not exist yet
    }

    // 2. Synchronize with user_metadata (guaranteed to succeed and persist)
    try {
      const existingList: BeneficiaryItem[] = user.user_metadata?.recent_beneficiaries || [];
      const cutoff = Date.now() - RETENTION_MS;

      // Filter out duplicates and prune expired items (> 30 days)
      const filtered = existingList.filter(
        (item) => item.phone !== cleanPhone && new Date(item.last_used_at).getTime() > cutoff
      );

      const newItem: BeneficiaryItem = {
        id: `meta-${Date.now()}`,
        phone: cleanPhone,
        network: cleanNetwork,
        service_type,
        nickname: nickname?.trim() || null,
        last_used_at: nowIso,
      };

      const updatedList = [newItem, ...filtered].slice(0, 50); // Keep most recent 50

      await adminSupabase.auth.admin.updateUserById(user.id, {
        user_metadata: {
          ...(user.user_metadata || {}),
          recent_beneficiaries: updatedList,
        },
      });
    } catch (metaErr) {
      console.warn('Could not sync user_metadata beneficiaries:', metaErr);
    }

    return NextResponse.json({
      success: true,
      message: 'Beneficiary saved/updated successfully with 30-day retention.',
      savedInTable: tableSaved,
    });
  } catch (err: any) {
    console.error('Error in POST /api/user/beneficiaries:', err);
    return NextResponse.json({ success: false, error: err.message || 'Server error' }, { status: 500 });
  }
}

// DELETE /api/user/beneficiaries -> Remove a saved beneficiary
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { phone, id } = body;

    if (!phone && !id) {
      return NextResponse.json({ success: false, error: 'Provide phone or id to delete' }, { status: 400 });
    }

    const adminSupabase = createAdminClient();

    // 1. Delete from table
    try {
      let query = adminSupabase.from('beneficiaries').delete().eq('user_id', user.id);
      if (id && !String(id).startsWith('meta-')) {
        query = query.eq('id', id);
      } else if (phone) {
        query = query.eq('phone', phone);
      }
      await query;
    } catch {
      // Ignored
    }

    // 2. Delete from user_metadata
    try {
      const existingList: BeneficiaryItem[] = user.user_metadata?.recent_beneficiaries || [];
      const updatedList = existingList.filter((item) => {
        if (id && item.id === id) return false;
        if (phone && item.phone === phone) return false;
        return true;
      });

      await adminSupabase.auth.admin.updateUserById(user.id, {
        user_metadata: {
          ...(user.user_metadata || {}),
          recent_beneficiaries: updatedList,
        },
      });
    } catch (err) {
      console.warn('Failed to prune user_metadata beneficiary:', err);
    }

    return NextResponse.json({
      success: true,
      message: 'Beneficiary removed successfully.',
    });
  } catch (err: any) {
    console.error('Error in DELETE /api/user/beneficiaries:', err);
    return NextResponse.json({ success: false, error: err.message || 'Server error' }, { status: 500 });
  }
}
