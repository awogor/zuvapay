import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  getAgentApplications,
  saveAgentApplications,
  AgentApplication,
} from '@/lib/data/agentApplicationStore';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get('status');

    let applications = await getAgentApplications();

    if (statusFilter && statusFilter !== 'all') {
      applications = applications.filter((a) => a.status === statusFilter);
    }

    return NextResponse.json({
      success: true,
      applications,
      totalCount: applications.length,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { id, status, adminNotes } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Application ID is required' }, { status: 400 });
    }

    const applications = await getAgentApplications();
    const appIndex = applications.findIndex((a) => a.id === id);

    if (appIndex === -1) {
      return NextResponse.json({ success: false, error: 'Application not found' }, { status: 404 });
    }

    const existing = applications[appIndex];
    const updated: AgentApplication = {
      ...existing,
      status: status || existing.status,
      adminNotes: adminNotes !== undefined ? adminNotes : existing.adminNotes,
      updatedAt: new Date().toISOString(),
    };

    applications[appIndex] = updated;
    await saveAgentApplications(applications);

    return NextResponse.json({
      success: true,
      message: `Application for ${updated.fullName} marked as ${updated.status}`,
      application: updated,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
