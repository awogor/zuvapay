/**
 * Base responsive HTML email template for ZuvaPay.
 * Clean, modern, professional fintech standard (Stripe/Paystack style).
 * Single unified card, high-contrast readable typography, perfectly responsive on mobile.
 */
export function renderBaseEmailLayout({
  previewText,
  contentHtml,
}: {
  previewText: string;
  headerBadge?: string;
  badgeColor?: string;
  contentHtml: string;
}): string {
  const currentYear = new Date().getFullYear();

  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="color-scheme" content="light" />
  <meta name="supported-color-schemes" content="light" />
  <title>ZuvaPay</title>
  <style type="text/css">
    /* Global Resets */
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }
    body { height: 100% !important; margin: 0 !important; padding: 0 !important; width: 100% !important; background-color: #F8FAFC; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
    
    /* Responsive */
    @media screen and (max-width: 600px) {
      .email-wrapper { padding: 12px 8px !important; }
      .email-card { width: 100% !important; padding: 24px 16px !important; border-radius: 8px !important; border: 1px solid #E2E8F0 !important; }
      .token-box { padding: 16px 10px !important; }
      .token-digits { font-size: 16px !important; letter-spacing: 1px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #F8FAFC; color: #0F172A;">
  <!-- Preview Text (Hidden in body, visible in inbox list) -->
  <div style="display: none; font-size: 1px; color: #F8FAFC; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;">
    ${previewText}
    &zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;
  </div>

  <table border="0" cellpadding="0" cellspacing="0" width="100%" class="email-wrapper" style="background-color: #F8FAFC; padding: 32px 12px;">
    <tr>
      <td align="center">
        <!-- Main Card Container: Single clean, border-defined card -->
        <table border="0" cellpadding="0" cellspacing="0" width="560" class="email-card" style="max-width: 560px; width: 100%; background-color: #FFFFFF; border-radius: 12px; border: 1px solid #E2E8F0; padding: 32px 28px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);">
          
          <!-- BRAND HEADER: Clean & Professional -->
          <tr>
            <td style="padding-bottom: 24px; border-bottom: 1px solid #F1F5F9;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td>
                    <table border="0" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="vertical-align: middle;">
                          <div style="display: inline-block; width: 32px; height: 32px; line-height: 32px; background: #FF6B00; border-radius: 8px; text-align: center; font-weight: 900; font-size: 15px; color: #FFFFFF; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                            ZP
                          </div>
                        </td>
                        <td style="vertical-align: middle; padding-left: 10px;">
                          <span style="font-size: 18px; font-weight: 800; color: #0F172A; letter-spacing: -0.4px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                            Zuva<span style="color: #FF6B00;">Pay</span>
                          </span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- BODY CONTENT -->
          <tr>
            <td style="padding-top: 24px;">
              ${contentHtml}
            </td>
          </tr>

          <!-- BRAND FOOTER: Subtle & Clean -->
          <tr>
            <td style="padding-top: 28px; border-top: 1px solid #F1F5F9;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td style="font-size: 12px; line-height: 18px; color: #94A3B8;">
                    Questions or need assistance? Reply to this email or reach us at <a href="mailto:hello@zuvapay.com" style="color: #64748B; text-decoration: underline;">hello@zuvapay.com</a>.
                  </td>
                </tr>
                <tr>
                  <td style="font-size: 11px; line-height: 16px; color: #CBD5E1; padding-top: 8px;">
                    &copy; ${currentYear} ZuvaPay Technologies. Automated transactional notification.
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
