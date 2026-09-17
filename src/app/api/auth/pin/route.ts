import { NextResponse, type NextRequest } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

function hashPin(pin: string, userId: string): string {
  const salt = process.env.PIN_SALT || 'zuvapay_secure_salt_2026';
  return crypto.createHmac('sha256', salt).update(`${userId}:${pin}`).digest('hex');
}

// POST /api/auth/pin -> Set up new 4-digit PIN
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ success: false, error: 'Unauthorized: Please sign in to set up your PIN' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { pin, confirmPin, oldPin } = body;

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

    const adminSupabase = createAdminClient();
    const { data: profile } = await adminSupabase
      .from('profiles')
      .select('is_pin_set, transaction_pin_hash, status')
      .eq('id', user.id)
      .maybeSingle();

    // Security Gate: If PIN is already set, oldPin MUST be provided and verified!
    if (profile?.is_pin_set && profile?.transaction_pin_hash) {
      if (!oldPin || typeof oldPin !== 'string' || !/^\d{4}$/.test(oldPin)) {
        return NextResponse.json(
          { success: false, error: 'Current PIN is required to change your transaction PIN.' },
          { status: 400 }
        );
      }

      const candidateHash = hashPin(oldPin, user.id);
      const candidateBuf = Buffer.from(candidateHash, 'utf8');
      const targetBuf = Buffer.from(profile.transaction_pin_hash, 'utf8');
      const isMatch = candidateBuf.length === targetBuf.length && crypto.timingSafeEqual(candidateBuf, targetBuf);

      if (!isMatch) {
        return NextResponse.json(
          { success: false, error: 'Current PIN is incorrect.' },
          { status: 401 }
        );
      }

      if (oldPin === pin) {
        return NextResponse.json(
          { success: false, error: 'New PIN cannot be the same as your current PIN.' },
          { status: 400 }
        );
      }
    }

    const hashedPin = hashPin(pin, user.id);

    const { error: updateError } = await adminSupabase
      .from('profiles')
      .update({
        is_pin_set: true,
        transaction_pin_hash: hashedPin,
        pin_updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('Failed to set transaction PIN in database:', updateError);
      return NextResponse.json(
        { success: false, error: updateError.message || 'Could not save transaction PIN' },
        { status: 500 }
      );
    }

    // Reset failed attempts upon setting new PIN
    await adminSupabase.auth.admin.updateUserById(user.id, {
      user_metadata: {
        ...(user.user_metadata || {}),
        pin_failed_attempts: 0,
      },
    });

    return NextResponse.json({
      success: true,
      message: '4-Digit Transaction PIN set successfully! Your account is now secured.',
    });
  } catch (err: any) {
    console.error('Unexpected error in POST /api/auth/pin:', err);
    return NextResponse.json({ success: false, error: err.message || 'Server error' }, { status: 500 });
  }
}

// GET /api/auth/pin -> Check PIN setup status and remaining attempts
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

    const adminSupabase = createAdminClient();
    const { data: profile } = await adminSupabase
      .from('profiles')
      .select('is_pin_set, status')
      .eq('id', user.id)
      .maybeSingle();

    const failedAttempts = Number(user.user_metadata?.pin_failed_attempts || 0);
    const remainingAttempts = Math.max(0, 4 - failedAttempts);
    const isLocked = profile?.status === 'blocked' || profile?.status === 'suspended' || failedAttempts >= 4;

    return NextResponse.json({
      success: true,
      isPinSet: !!profile?.is_pin_set,
      isLocked,
      status: profile?.status || 'active',
      failedAttempts,
      attemptsRemaining: remainingAttempts,
      maxAttempts: 4,
    });
  } catch (err: any) {
    console.error('Error in GET /api/auth/pin:', err);
    return NextResponse.json({ success: false, error: err.message || 'Server error' }, { status: 500 });
  }
}

// PUT /api/auth/pin -> Verify transaction PIN with max 4 attempts lockout
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ success: false, error: 'Unauthorized: Please log in to authorize this transaction' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
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
      .maybeSingle();

    if (error) {
      console.error('Database error fetching profile for PIN verification:', error);
      return NextResponse.json({ success: false, error: 'Database error verifying PIN' }, { status: 500 });
    }

    if (!profile) {
      return NextResponse.json({ success: false, error: 'User profile not found' }, { status: 404 });
    }

    const currentAttempts = Number(user.user_metadata?.pin_failed_attempts || 0);

    if (profile.status === 'blocked' || profile.status === 'suspended' || currentAttempts >= 4) {
      return NextResponse.json(
        {
          success: false,
          error: `Your account is ${profile.status || 'suspended'}. Maximum PIN attempts exceeded. Transactions cannot proceed. Please contact support to restore access.`,
          isLocked: true,
          attemptsRemaining: 0,
        },
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
    const candidateBuf = Buffer.from(candidateHash, 'utf8');
    const targetBuf = Buffer.from(profile.transaction_pin_hash, 'utf8');
    const isMatch = candidateBuf.length === targetBuf.length && crypto.timingSafeEqual(candidateBuf, targetBuf);

    if (!isMatch) {
      const newAttempts = currentAttempts + 1;
      const remainingAttempts = Math.max(0, 4 - newAttempts);

      if (newAttempts >= 4) {
        // Lock account in database and mark metadata
        await adminSupabase
          .from('profiles')
          .update({ status: 'suspended' })
          .eq('id', user.id);

        await adminSupabase.auth.admin.updateUserById(user.id, {
          user_metadata: {
            ...(user.user_metadata || {}),
            pin_failed_attempts: 4,
            locked_at: new Date().toISOString(),
            lock_reason: 'Account locked: 4 incorrect transaction PIN attempts',
          },
        });

        return NextResponse.json(
          {
            success: false,
            error: 'Account locked: You have entered an incorrect PIN 4 times. For security, your account has been locked. Please contact support.',
            isLocked: true,
            attemptsRemaining: 0,
            totalAttempts: 4,
            failedAttempts: 4,
          },
          { status: 403 }
        );
      } else {
        // Increment failed attempts
        await adminSupabase.auth.admin.updateUserById(user.id, {
          user_metadata: {
            ...(user.user_metadata || {}),
            pin_failed_attempts: newAttempts,
          },
        });

        return NextResponse.json(
          {
            success: false,
            error: `Incorrect transaction PIN. ${remainingAttempts} attempt${remainingAttempts === 1 ? '' : 's'} remaining. Note: Your account will be locked on the 4th wrong attempt.`,
            attemptsRemaining: remainingAttempts,
            totalAttempts: 4,
            failedAttempts: newAttempts,
            isLocked: false,
          },
          { status: 401 }
        );
      }
    }

    // Success: Reset failed attempts
    if (currentAttempts > 0) {
      await adminSupabase.auth.admin.updateUserById(user.id, {
        user_metadata: {
          ...(user.user_metadata || {}),
          pin_failed_attempts: 0,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Transaction PIN verified successfully.',
      attemptsRemaining: 4,
      failedAttempts: 0,
    });
  } catch (err: any) {
    console.error('Unexpected error in PUT /api/auth/pin:', err);
    return NextResponse.json({ success: false, error: err.message || 'Server error' }, { status: 500 });
  }
}
