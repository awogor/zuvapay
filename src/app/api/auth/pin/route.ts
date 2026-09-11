import { NextResponse, type NextRequest } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import crypto from 'crypto';

function hashPin(pin: string, userId: string): string {
  const salt = process.env.PIN_SALT || 'korrectpay_secure_salt_2026';
  return crypto.createHmac('sha256', salt).update(`${userId}:${pin}`).digest('hex');
}

// POST /api/auth/pin -> Set up new 4-digit PIN
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { pin, confirmPin } = body;

    if (!pin || typeof pin !== 'string' || !/^\d{4}$/.test(pin)) {
      return NextResponse.json(
        { success: false, error: 'PIN must be exactly 4 digits (numeric only).' },
        { status: 400 }
      );
    }

    if (confirmPin !== undefined && pin !== confirmPin) {
      return NextResponse.json(
        { success: false, error: 'PIN confirmation does not match.' },
        { status: 400 }
      );
    }

    const hashedPin = hashPin(pin, user.id);
    const adminSupabase = createAdminClient();

    const { error: updateError } = await adminSupabase
      .from('profiles')
      .update({
        is_pin_set: true,
        transaction_pin_hash: hashedPin,
        pin_updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('Failed to set transaction PIN:', updateError);
      return NextResponse.json(
        { success: false, error: updateError.message || 'Could not save transaction PIN' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: '4-Digit Transaction PIN set successfully! Your account is now secured.',
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// PUT /api/auth/pin -> Verify transaction PIN
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { pin } = body;

    if (!pin || typeof pin !== 'string' || !/^\d{4}$/.test(pin)) {
      return NextResponse.json(
        { success: false, error: 'Please provide a valid 4-digit PIN.' },
        { status: 400 }
      );
    }

    const adminSupabase = createAdminClient();
    const { data: profile, error } = await adminSupabase
      .from('profiles')
      .select('transaction_pin_hash, is_pin_set, status')
      .eq('id', user.id)
      .single();

    if (error || !profile) {
      return NextResponse.json({ success: false, error: 'User profile not found' }, { status: 404 });
    }

    if (profile.status === 'blocked' || profile.status === 'suspended') {
      return NextResponse.json(
        { success: false, error: `Account is ${profile.status}. Transactions cannot proceed.` },
        { status: 403 }
      );
    }

    if (!profile.is_pin_set || !profile.transaction_pin_hash) {
      return NextResponse.json(
        { success: false, error: 'No transaction PIN has been set up yet.', requiresPinSetup: true },
        { status: 400 }
      );
    }

    const candidateHash = hashPin(pin, user.id);
    if (candidateHash !== profile.transaction_pin_hash) {
      return NextResponse.json(
        { success: false, error: 'Incorrect transaction PIN. Please try again.' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Transaction PIN verified successfully.',
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
