/**
 * Base responsive HTML email template for ZuvaPay.
 * Clean, modern, professional fintech standard (Stripe/Paystack style).
 * 3-Zone Architecture:
 * 1. Header: Light warm tinted background (#FFF7ED) with brand logo and optional pill badge.
 * 2. Body: Clean plain white (#FFFFFF) with high-contrast typography.
 * 3. Footer: Light neutral tinted background (#F8FAFC) with support contact, security notice, and copyright.
 */
export function renderBaseEmailLayout({
  previewText,
  headerBadge,
  badgeType = 'default',
  contentHtml,
}: {
  previewText: string;
  headerBadge?: string;
  badgeType?: 'success' | 'warning' | 'info' | 'default';
  contentHtml: string;
}): string {
  const currentYear = new Date().getFullYear();

  // Badge styles
  const badgeStyles = {
    success: 'background-color: #DCFCE7; border: 1px solid #86EFAC; color: #15803D;',
    warning: 'background-color: #FEF3C7; border: 1px solid #FCD34D; color: #B45309;',
    info: 'background-color: #E0F2FE; border: 1px solid #BAE6FD; color: #0369A1;',
    default: 'background-color: #FFEDD5; border: 1px solid #FED7AA; color: #C2410C;',
  }[badgeType];

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
    body { height: 100% !important; margin: 0 !important; padding: 0 !important; width: 100% !important; background-color: #F1F5F9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
    ul { padding-left: 20px; margin: 12px 0; }
    li { margin-bottom: 8px; }
    li::marker { color: #FF6B00; font-size: 1.15em; }
    
    /* Responsive */
    @media screen and (max-width: 600px) {
      .email-wrapper { padding: 12px 6px !important; }
      .email-card { width: 100% !important; border-radius: 8px !important; }
      .header-cell { padding: 16px 16px !important; }
      .body-cell { padding: 22px 16px !important; }
      .footer-cell { padding: 18px 16px !important; }
      .token-box { padding: 14px 10px !important; }
      .token-digits { font-size: 14px !important; letter-spacing: 0.8px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #F1F5F9; color: #0F172A;">
  <!-- Preview Text (Hidden in body, visible in inbox list) -->
  <div style="display: none; font-size: 1px; color: #F1F5F9; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;">
    ${previewText}
    &zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;
  </div>

  <table border="0" cellpadding="0" cellspacing="0" width="100%" class="email-wrapper" style="background-color: #F1F5F9; padding: 32px 12px;">
    <tr>
      <td align="center">
        <!-- Main Card: Single Unified Border-Defined Card -->
        <table border="0" cellpadding="0" cellspacing="0" width="560" class="email-card" style="max-width: 560px; width: 100%; border: 1px solid #E2E8F0; border-radius: 14px; overflow: hidden; background-color: #FFFFFF; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);">
          
          <!-- 1. HEADER: Light Colored (Warm Cream/Orange #FFF7ED) -->
          <tr>
            <td bgcolor="#FFF7ED" class="header-cell" style="background-color: #FFF7ED; padding: 20px 28px; border-bottom: 1px solid #FED7AA;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="left" style="vertical-align: middle;">
                    <table border="0" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="vertical-align: middle;">
                          <div style="display: inline-block; width: 30px; height: 30px; line-height: 30px; background-color: #FF6B00; border-radius: 7px; text-align: center; font-weight: 900; font-size: 14px; color: #FFFFFF; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                            ZP
                          </div>
                        </td>
                        <td style="vertical-align: middle; padding-left: 10px;">
                          <span style="font-size: 17px; font-weight: 800; color: #0F172A; letter-spacing: -0.3px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                            Zuva<span style="color: #FF6B00;">Pay</span>
                          </span>
                        </td>
                      </tr>
                    </table>
                  </td>
                  ${
                    headerBadge
                      ? `
                  <td align="right" style="vertical-align: middle;">
                    <span style="display: inline-block; font-size: 10.5px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.6px; padding: 4px 10px; border-radius: 9999px; ${badgeStyles}">
                      ${headerBadge}
                    </span>
                  </td>`
                      : ''
                  }
                </tr>
              </table>
            </td>
          </tr>

          <!-- 2. BODY CONTENT: Plain Crisp White (#FFFFFF) -->
          <tr>
            <td bgcolor="#FFFFFF" class="body-cell" style="background-color: #FFFFFF; padding: 28px 28px;">
              ${contentHtml}
            </td>
          </tr>

          <!-- 3. FOOTER: Light Neutral Tinted (#F8FAFC) -->
          <tr>
            <td bgcolor="#F8FAFC" class="footer-cell" style="background-color: #F8FAFC; padding: 22px 28px; border-top: 1px solid #E2E8F0;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td style="font-size: 12px; line-height: 18px; color: #64748B;">
                    Questions or need assistance? Reply to this email or reach our operations desk at <a href="mailto:hello@zuvapay.com" style="color: #FF6B00; font-weight: 600; text-decoration: none;">hello@zuvapay.com</a>.
                  </td>
                </tr>
                <tr>
                  <td style="font-size: 11px; line-height: 16px; color: #94A3B8; padding-top: 10px;">
                    🔒 Protected by ZuvaPay 256-Bit Financial Encryption. Never share your password or transaction PIN with anyone.
                  </td>
                </tr>
                <tr>
                  <td style="font-size: 11px; line-height: 16px; color: #CBD5E1; padding-top: 8px;">
                    &copy; ${currentYear} ZuvaPay Technologies Limited. Automated transactional notification.
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
