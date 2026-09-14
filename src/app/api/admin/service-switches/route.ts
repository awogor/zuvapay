import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  getServiceSwitches,
  saveServiceSwitches,
  ServiceSwitch,
} from '@/lib/services/serviceStatusStore';

export async function GET() {
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

    const config = await getServiceSwitches();

    return NextResponse.json({
      success: true,
      services: Object.values(config.services),
      config,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
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
    const { serviceKey, enabled, maintenanceMessage } = body;

    if (!serviceKey) {
      return NextResponse.json({ success: false, error: 'serviceKey is required' }, { status: 400 });
    }

    const config = await getServiceSwitches();
    const existing = config.services[serviceKey];

    if (!existing) {
      return NextResponse.json({ success: false, error: `Unknown service: ${serviceKey}` }, { status: 404 });
    }

    const updatedService: ServiceSwitch = {
      ...existing,
      enabled: typeof enabled === 'boolean' ? enabled : existing.enabled,
      maintenanceMessage:
        typeof maintenanceMessage === 'string'
          ? maintenanceMessage
          : existing.maintenanceMessage,
      updatedAt: new Date().toISOString(),
    };

    const updatedConfig = {
      ...config,
      services: {
        ...config.services,
        [serviceKey]: updatedService,
      },
      updatedAt: new Date().toISOString(),
    };

    await saveServiceSwitches(updatedConfig);

    return NextResponse.json({
      success: true,
      message: `${existing.name} switch updated to ${updatedService.enabled ? 'LIVE' : 'OFFLINE'}`,
      service: updatedService,
      config: updatedConfig,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
