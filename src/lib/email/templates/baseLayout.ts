/**
 * Base responsive HTML email template for ZuvaPay.
 * Built with bulletproof table layouts, inline CSS, high-contrast typography,
 * brand gradient header, trust badges, and Lagos support desk information.
 */
export function renderBaseEmailLayout({
  previewText,
  headerBadge = 'Official Notification',
  badgeColor = '#FF6B00',
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
  <title>ZuvaPay Transactional Alert</title>
  <style type="text/css">
    /* Global Resets */
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }
    body { height: 100% !important; margin: 0 !important; padding: 0 !important; width: 100% !important; background-color: #F8FAFC; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
    
    /* Responsive */
    @media screen and (max-width: 600px) {
      .email-container { width: 100% !important; padding: 12px !important; }
      .content-cell { padding: 24px 18px !important; }
      .metric-col { display: block !important; width: 100% !important; margin-bottom: 12px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #F8FAFC; color: #0F172A;">
  <!-- Preview Text (Hidden in body, visible in inbox list) -->
  <div style="display: none; font-size: 1px; color: #F8FAFC; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;">
    ${previewText}
    &zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;
  </div>

  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #F8FAFC; padding: 24px 0;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table border="0" cellpadding="0" cellspacing="0" width="600" class="email-container" style="max-width: 600px; width: 100%; background-color: #FFFFFF; border-radius: 20px; overflow: hidden; border: 1px solid #E2E8F0; box-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.05);">
          
          <!-- BRAND HEADER: Gradient Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #0F172A 0%, #1E293B 100%); padding: 30px 32px; border-bottom: 3px solid #FF6B00;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td>
                    <!-- Logo & Brand Name -->
                    <table border="0" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="vertical-align: middle;">
                          <div style="display: inline-block; width: 38px; height: 38px; line-height: 38px; background: linear-gradient(135deg, #FF6B00 0%, #FFAA00 100%); border-radius: 12px; text-align: center; font-weight: 900; font-size: 18px; color: #0F172A;">
                            ZP
                          </div>
                        </td>
                        <td style="vertical-align: middle; padding-left: 12px;">
                          <span style="font-size: 20px; font-weight: 900; color: #FFFFFF; letter-spacing: -0.5px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                            Zuva<span style="color: #FF6B00;">Pay</span>
                          </span>
                          <span style="display: block; font-size: 10px; font-weight: 700; color: #94A3B8; text-transform: uppercase; letter-spacing: 1px;">
                            Instant Digital Utility
                          </span>
                        </td>
                      </tr>
                    </table>
                  </td>
                  <td align="right" style="vertical-align: middle;">
                    <span style="display: inline-block; padding: 5px 12px; background-color: rgba(255, 255, 255, 0.08); border: 1px solid rgba(255, 255, 255, 0.15); border-radius: 20px; font-size: 11px; font-weight: 700; color: ${badgeColor}; text-transform: uppercase; letter-spacing: 0.5px;">
                      ● ${headerBadge}
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- BODY CONTENT -->
          <tr>
            <td class="content-cell" style="padding: 36px 32px; background-color: #FFFFFF;">
              ${contentHtml}
            </td>
          </tr>

          <!-- QUICK SUPPORT CTA -->
          <tr>
            <td style="padding: 0 32px 28px 32px; background-color: #FFFFFF;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 14px 18px;">
                <tr>
                  <td style="vertical-align: middle;">
                    <div style="font-size: 12px; font-weight: 700; color: #0F172A;">Need assistance?</div>
                    <div style="font-size: 11px; color: #64748B;">Our customer support team is available 24/7.</div>
                  </td>
                  <td align="right" style="vertical-align: middle;">
                    <a href="mailto:hello@zuvapay.com" style="display: inline-block; padding: 7px 14px; background-color: #0F172A; color: #FFFFFF; font-size: 11px; font-weight: 700; text-decoration: none; border-radius: 8px;">
                      Contact Support
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- BRAND FOOTER -->
          <tr>
            <td style="background-color: #F8FAFC; padding: 24px 32px; border-top: 1px solid #E2E8F0; text-align: center;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center" style="font-size: 11px; line-height: 18px; color: #64748B;">
                    &copy; ${currentYear} ZuvaPay Technologies. All rights reserved.<br />
                    Lagos, Nigeria &bull; <a href="mailto:hello@zuvapay.com" style="color: #64748B; text-decoration: underline;">hello@zuvapay.com</a>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="font-size: 10px; line-height: 16px; color: #94A3B8; padding-top: 8px;">
                    This is an automated transactional notification sent to your registered ZuvaPay account.
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
