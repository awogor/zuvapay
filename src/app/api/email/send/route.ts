import { NextRequest, NextResponse } from 'next/server';
import { sendTransactionalEmail, SendEmailOptions } from '@/lib/email/sendEmail';

export async function POST(request: NextRequest) {
  try {
    const body: SendEmailOptions = await request.json();

    if (!body.to || !body.templateType) {
      return NextResponse.json(
        { success: false, error: 'Recipient email and templateType are required' },
        { status: 400 }
      );
    }

    const result = await sendTransactionalEmail(body);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error, details: result.details },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      messageId: result.messageId,
      simulated: result.simulated,
      details: result.details,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Internal server error processing email' },
      { status: 500 }
    );
  }
}
