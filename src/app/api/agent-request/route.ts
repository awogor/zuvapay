import { NextResponse } from 'next/server';
import { addAgentApplication } from '@/lib/data/agentApplicationStore';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { fullName, phone, email, state, businessType, dailyVolume, message } = body;

    if (!fullName || !phone || !state) {
      return NextResponse.json(
        { success: false, error: 'Full name, phone number, and location state are required.' },
        { status: 400 }
      );
    }

    const application = await addAgentApplication({
      fullName: fullName.trim(),
      phone: phone.trim(),
      email: email ? email.trim() : undefined,
      state: state.trim(),
      businessType: businessType || 'POS Shop / Kiosk',
      dailyVolume: dailyVolume || 'Under ₦50k/day',
      message: message ? message.trim() : undefined,
    });

    console.log('[AGENT REQUEST SAVED]', application);

    return NextResponse.json({
      success: true,
      message: 'Your agent request has been received. Our merchant onboarding officer will contact you within 24 hours.',
      applicationId: application.id,
    });
  } catch (error: any) {
    console.error('Error handling agent request:', error);
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred. Please reach out via WhatsApp.' },
      { status: 500 }
    );
  }
}
