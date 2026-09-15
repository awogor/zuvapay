import { NextRequest, NextResponse } from 'next/server';
import { verifySmtpConnection } from '@/lib/email/transporter';
import { sendTransactionalEmail } from '@/lib/email/sendEmail';
import {
  EmailTemplateType,
  renderWelcomeEmail,
  renderWalletCreditEmail,
  renderServiceReceiptEmail,
  renderRefundEmail,
  renderSecurityPinEmail,
  renderElectricityTokenEmail,
  renderAdminBroadcastEmail,
  renderEmailVerificationEmail,
  renderPasswordResetEmail,
  renderAdminLowBalanceEmail,
  renderMarketplaceDeliveryEmail,
  getEmailAppUrl,
} from '@/lib/email/templates';

export async function GET() {
  // Test SMTP connection and return configuration status
  const connection = await verifySmtpConnection();
  return NextResponse.json(connection);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action = 'send_test', targetEmail, templateType = 'welcome', sampleData = {} } = body;

    if (action === 'preview') {
      // Return rendered HTML and subject for visual email previewing
      let rendered = { subject: '', html: '' };
      const name = sampleData.name || 'David Adeleke';

      switch (templateType as EmailTemplateType) {
        case 'welcome':
          rendered = renderWelcomeEmail({
            name,
            email: targetEmail || 'david@zuvapay.com',
            virtualAccount: sampleData.virtualAccount || {
              bankName: 'Moniepoint Microfinance Bank',
              accountNumber: '8102938192',
              accountName: 'ZuvaPay / David Adeleke',
            },
          });
          break;

        case 'wallet_credit':
          rendered = renderWalletCreditEmail({
            name,
            amount: sampleData.amount || 15000,
            newBalance: sampleData.newBalance || 24850,
            reference: sampleData.reference || 'KP-DEP-8492019',
            payerName: sampleData.payerName || 'Musa Ibrahim',
            bankName: sampleData.bankName || 'Wema Bank Virtual Account',
            date: new Date().toLocaleString('en-NG'),
          });
          break;

        case 'service_receipt':
          rendered = renderServiceReceiptEmail({
            name,
            serviceName: sampleData.serviceName || 'MTN SME Data 2.5GB (30 Days)',
            category: sampleData.category || 'DATA BUNDLE',
            amount: sampleData.amount || 640,
            reference: sampleData.reference || 'KP-DAT-994820',
            date: new Date().toLocaleString('en-NG'),
            details: sampleData.details || {
              'Beneficiary Number': '0803 123 4567',
              'Operator Status': 'DELIVERED IN 1.8s',
              'Operator Ref': 'MTN-SME-9021',
            },
          });
          break;

        case 'refund_alert':
          rendered = renderRefundEmail({
            name,
            serviceName: sampleData.serviceName || 'IKEDC Prepaid Electricity ₦3,000',
            amount: sampleData.amount || 3000,
            reference: sampleData.reference || 'KP-PWR-882910',
            reason: sampleData.reason || 'Disco switch timed out (Auto-reversal executed)',
            newBalance: sampleData.newBalance || 14200,
          });
          break;

        case 'security_pin':
          rendered = renderSecurityPinEmail({
            name,
            actionType: sampleData.actionType || 'Transaction PIN Setup & Verification',
            ipAddress: '102.89.23.14 (Lagos, NG)',
            userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)',
            date: new Date().toLocaleString('en-NG'),
          });
          break;

        case 'electricity_token':
          rendered = renderElectricityTokenEmail({
            name,
            disco: sampleData.disco || 'IKEDC (Ikeja Electric)',
            meterNumber: sampleData.meterNumber || '45028492019',
            meterType: sampleData.meterType || 'Prepaid',
            customerName: sampleData.customerName || 'Adewale Johnson',
            customerAddress: sampleData.customerAddress || '14 Admiralty Way, Lekki Phase 1, Lagos',
            token: sampleData.token || '4839-2049-1830-4920-1940',
            units: sampleData.units || '73.0 kWh',
            amount: sampleData.amount || 5000,
            reference: sampleData.reference || 'KP-PWR-920194',
            operatorReference: sampleData.operatorReference || 'IKEDC-TX-88201',
            date: new Date().toLocaleString('en-NG'),
          });
          break;

        case 'admin_broadcast':
          rendered = renderAdminBroadcastEmail({
            name,
            headline: sampleData.headline || 'Scheduled Maintenance: MTN Data Switch Upgraded',
            bodyHtml:
              sampleData.bodyHtml ||
              '<p>Hello,</p><p>We have successfully upgraded our MTN SME & Gifting route to a direct tier-1 telco gateway. Fulfillment latency is now consistently under 1.5 seconds.</p><p>Thank you for choosing ZuvaPay!</p>',
            ctaText: 'Test Speed in Dashboard',
            ctaUrl: `${getEmailAppUrl()}/dashboard`,
          });
          break;

        case 'email_verification':
          rendered = renderEmailVerificationEmail({
            name,
            email: targetEmail || 'david@zuvapay.com',
            verifyUrl: sampleData.verifyUrl || sampleData.verificationUrl || `${getEmailAppUrl()}/auth/callback?type=signup&next=/dashboard`,
          });
          break;

        case 'password_reset':
          rendered = renderPasswordResetEmail({
            name,
            email: targetEmail || 'david@zuvapay.com',
            resetUrl: sampleData.resetUrl || `${getEmailAppUrl()}/reset-password`,
            ipAddress: '102.89.23.14 (Lagos, NG)',
          });
          break;

        case 'admin_low_balance':
          rendered = renderAdminLowBalanceEmail({
            productName: sampleData.productName || 'MTN SME Data 1GB',
            providerName: sampleData.providerName || 'Gongoz Switch 1',
            customerEmail: targetEmail || 'customer@zuvapay.com',
            orderReference: sampleData.orderReference || 'KP-ORD-882190',
            amount: sampleData.amount || 280,
            errorMessage: sampleData.errorMessage || 'Reseller wallet balance insufficient (NGN 14.20 left)',
            portalUrl: sampleData.portalUrl || 'https://resellers.aiplug.store',
          });
          break;

        case 'marketplace_delivery':
          rendered = renderMarketplaceDeliveryEmail({
            name,
            productName: sampleData.productName || 'Gemini Pro 18-Month Activation Links',
            quantity: sampleData.quantity || 1,
            amount: sampleData.amount || 6000,
            reference: sampleData.reference || 'KP-MAR-MU2AQF29-DW815',
            date: sampleData.date,
            delivery: sampleData.delivery || {
              activationLink: 'https://serviceactivation.google.com/subscription/new/AQCpiIGS...',
              code: 'https://serviceactivation.google.com/subscription/new/AQCpiIGS...',
              instructions: '⚡ Paste the received redeem link into your browser and click on "Activate Offer".\n\n⚡ Important Note: The redeem link must be used within 48 hours.',
            },
          });
          break;

        default:
          rendered = renderWelcomeEmail({ name, email: targetEmail || 'david@zuvapay.com' });
      }

      return NextResponse.json({
        success: true,
        subject: rendered.subject,
        html: rendered.html,
      });
    }

    // Default action: send_test
    if (!targetEmail) {
      return NextResponse.json(
        { success: false, error: 'targetEmail is required to send a test email' },
        { status: 400 }
      );
    }

    const testPayload = {
      name: sampleData.name || 'Test Admin',
      amount: sampleData.amount || 5000,
      newBalance: sampleData.newBalance || 18500,
      reference: sampleData.reference || `TEST-${Date.now().toString().slice(-6)}`,
      serviceName: sampleData.serviceName || sampleData.productName || 'MTN 2.5GB SME Data',
      productName: sampleData.productName || 'Gemini Pro 18-Month Activation Links',
      category: sampleData.category || 'DATA',
      reason: 'Simulated Gateway Failure (100% Refunded)',
      actionType: 'Security PIN Setup',
      verificationUrl: `${getEmailAppUrl()}/auth/callback?type=signup&next=/dashboard`,
      resetUrl: `${getEmailAppUrl()}/reset-password`,
      ipAddress: '102.89.23.14 (Lagos, NG)',
      delivery: sampleData.delivery || {
        activationLink: 'https://serviceactivation.google.com/subscription/new/AQCpiIGS...',
        code: 'https://serviceactivation.google.com/subscription/new/AQCpiIGS...',
        instructions: '⚡ Paste the received redeem link into your browser and click on "Activate Offer".\n\n⚡ Important Note: The redeem link must be used within 48 hours.',
      },
      virtualAccount: {
        bankName: 'Moniepoint MFB',
        accountNumber: '8910293819',
        accountName: 'ZuvaPay / Test User',
      },
      details: {
        Recipient: targetEmail,
        'Carrier Gateway': 'Gongoz Switch 1',
        Status: 'Verified Delivery',
      },
      ...sampleData,
    };

    const res = await sendTransactionalEmail({
      to: targetEmail,
      templateType: templateType as EmailTemplateType,
      data: testPayload,
      customSubject: body.customSubject,
    });

    return NextResponse.json(res);
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Error processing email test' },
      { status: 500 }
    );
  }
}
