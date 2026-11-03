import QRCode from "qrcode";
import { Resend } from "resend";

interface SendTicketEmailParams {
  buyerName: string;
  buyerEmail: string;
  orderNumber: string;
  tickets: Array<{
    ticketCode: string;
    tierName: string;
    qrPayload: string;
  }>;
}

/** Generates a QR data-URL (base64 PNG) for embedding inline in email */
async function generateQrDataUrl(payload: string): Promise<string> {
  return QRCode.toDataURL(payload, {
    width: 260,
    margin: 2,
    color: {
      dark: "#000000",
      light: "#ffffff",
    },
    errorCorrectionLevel: "M",
  });
}

function buildTicketCard(
  t: { ticketCode: string; tierName: string; qrDataUrl: string },
  idx: number,
  buyerName: string
): string {
  return `
    <!-- Ticket Card ${idx + 1} -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0"
      style="border: 1px solid #2a2a2a; border-radius: 16px; margin-bottom: 20px; overflow: hidden;">
      <tr>
        <!-- Gold left accent bar -->
        <td width="6" style="background: linear-gradient(180deg, #f59e0b 0%, #d97706 100%); border-radius: 16px 0 0 16px;">&nbsp;</td>
        <td style="padding: 24px;">
          <!-- Tier badge -->
          <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 14px;">
            <tr>
              <td style="background-color: #f59e0b; border-radius: 6px; padding: 4px 12px;">
                <span style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                  font-size: 11px; font-weight: 700; color: #000; text-transform: uppercase; letter-spacing: 0.08em;">
                  ${t.tierName} &bull; Pass #${idx + 1}
                </span>
              </td>
            </tr>
          </table>

          <!-- Two column layout: info + QR -->
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <!-- Left: ticket details -->
              <td valign="top" style="padding-right: 20px;">
                <p style="margin: 0 0 16px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                  font-size: 20px; font-weight: 800; color: #ffffff; text-transform: uppercase; letter-spacing: 0.03em; line-height: 1.2;">
                  Coastal Nganya<br/>Awards Night
                </p>
                <table cellpadding="0" cellspacing="0" border="0">
                  <tr><td style="padding-bottom: 6px;">
                    <span style="font-family: monospace; font-size: 11px; color: #737373; text-transform: uppercase; letter-spacing: 0.08em;">Holder</span><br/>
                    <span style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 13px; font-weight: 600; color: #ffffff;">${buyerName}</span>
                  </td></tr>
                  <tr><td style="padding-bottom: 6px;">
                    <span style="font-family: monospace; font-size: 11px; color: #737373; text-transform: uppercase; letter-spacing: 0.08em;">Ticket Code</span><br/>
                    <span style="font-family: monospace; font-size: 14px; font-weight: 700; color: #f59e0b; letter-spacing: 0.12em;">${t.ticketCode}</span>
                  </td></tr>
                  <tr><td style="padding-bottom: 6px;">
                    <span style="font-family: monospace; font-size: 11px; color: #737373; text-transform: uppercase; letter-spacing: 0.08em;">Date &amp; Time</span><br/>
                    <span style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 13px; color: #d4d4d4;">Sunday, December 6, 2026 &bull; 2:00 PM EAT</span>
                  </td></tr>
                  <tr><td>
                    <span style="font-family: monospace; font-size: 11px; color: #737373; text-transform: uppercase; letter-spacing: 0.08em;">Venue</span><br/>
                    <span style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 13px; color: #d4d4d4;">Mamba Village, Mombasa</span>
                  </td></tr>
                </table>
              </td>
              <!-- Right: QR Code -->
              <td valign="top" align="center" width="140" style="min-width: 130px;">
                <div style="background: #ffffff; padding: 10px; border-radius: 12px; display: inline-block;">
                  <img src="${t.qrDataUrl}" alt="Ticket QR Code" width="120" height="120"
                    style="display: block; border-radius: 6px;" />
                </div>
                <p style="margin: 6px 0 0 0; font-family: monospace; font-size: 10px; font-weight: 700;
                  color: #737373; text-transform: uppercase; letter-spacing: 0.08em; text-align: center;">
                  Scan at Gate
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  `;
}

export async function sendTicketEmail({
  buyerName,
  buyerEmail,
  orderNumber,
  tickets,
}: SendTicketEmailParams) {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.EMAIL_FROM || "info@coastalnganyaawards.com";
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://coastalnganyaawards.com").replace(/\/$/, "");

  if (!apiKey) {
    console.warn("[Email] RESEND_API_KEY not set — skipping email delivery.");
    return { success: true, simulated: true };
  }

  const resend = new Resend(apiKey);

  try {
    // Generate QR data-URLs for all tickets in parallel
    const ticketsWithQr = await Promise.all(
      tickets.map(async (t) => ({
        ...t,
        qrDataUrl: await generateQrDataUrl(
          `${siteUrl}/verify/${encodeURIComponent(t.ticketCode)}`
        ),
      }))
    );

    const ticketCardsHtml = ticketsWithQr
      .map((t, i) => buildTicketCard(t, i, buyerName))
      .join("");

    const pluralTickets = tickets.length === 1 ? "ticket" : "tickets";

    const htmlBody = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Your Coastal Nganya Awards Tickets</title>
</head>
<body style="margin: 0; padding: 0; background-color: #080808;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0"
    style="background-color: #080808; min-height: 100vh;">
    <tr>
      <td align="center" style="padding: 32px 16px;">
        <!-- Outer card -->
        <table width="600" cellpadding="0" cellspacing="0" border="0"
          style="max-width: 600px; width: 100%; background-color: #111111;
            border: 1px solid #222222; border-radius: 20px; overflow: hidden;">

          <!-- ===== HEADER ===== -->
          <tr>
            <td style="background: linear-gradient(135deg, #0a0a0a 0%, #1a1200 100%);
              border-bottom: 1px solid #2a2000; padding: 32px 32px 24px 32px; text-align: center;">
              <!-- Logo area -->
              <table cellpadding="0" cellspacing="0" border="0" align="center"
                style="margin: 0 auto 16px auto;">
                <tr>
                  <td style="background-color: #f59e0b; width: 4px; border-radius: 2px; min-height: 36px;">&nbsp;</td>
                  <td style="padding: 0 12px;">
                    <p style="margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                      font-size: 24px; font-weight: 900; color: #ffffff;
                      text-transform: uppercase; letter-spacing: 0.06em; line-height: 1;">
                      COASTAL NGANYA
                    </p>
                    <p style="margin: 2px 0 0 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                      font-size: 11px; color: #f59e0b; text-transform: uppercase; letter-spacing: 0.18em; font-weight: 600;">
                      AWARDS NIGHT 2026
                    </p>
                  </td>
                  <td style="background-color: #f59e0b; width: 4px; border-radius: 2px;">&nbsp;</td>
                </tr>
              </table>

              <p style="margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                font-size: 12px; color: #737373; letter-spacing: 0.06em; text-transform: uppercase;">
                Mombasa's Premier Matatu Culture Awards
              </p>
            </td>
          </tr>

          <!-- ===== GREETING ===== -->
          <tr>
            <td style="padding: 28px 32px 20px 32px;">
              <p style="margin: 0 0 8px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                font-size: 22px; font-weight: 800; color: #ffffff;">
                Your ${pluralTickets} ${tickets.length === 1 ? "is" : "are"} confirmed ✓
              </p>
              <p style="margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                font-size: 14px; color: #a3a3a3; line-height: 1.6;">
                Hello <strong style="color: #ffffff;">${buyerName}</strong> — thank you for securing
                your ${pluralTickets} for the <strong style="color: #f59e0b;">Coastal Nganya Awards Night</strong>.
                Show your QR code(s) at the gate entrance for instant scan-in.
              </p>
            </td>
          </tr>

          <!-- ===== ORDER INFO STRIP ===== -->
          <tr>
            <td style="padding: 0 32px 24px 32px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0"
                style="background-color: rgba(245,158,11,0.08); border: 1px solid rgba(245,158,11,0.2);
                  border-radius: 10px; padding: 14px 18px;">
                <tr>
                  <td>
                    <span style="font-family: monospace; font-size: 11px; color: #737373; text-transform: uppercase; letter-spacing: 0.08em;">Order Reference</span><br/>
                    <span style="font-family: monospace; font-size: 16px; font-weight: 700; color: #f59e0b; letter-spacing: 0.1em;">${orderNumber}</span>
                  </td>
                  <td align="right">
                    <span style="font-family: monospace; font-size: 11px; color: #737373; text-transform: uppercase; letter-spacing: 0.08em;">Tickets</span><br/>
                    <span style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 16px; font-weight: 700; color: #ffffff;">${tickets.length} Pass${tickets.length !== 1 ? "es" : ""}</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ===== EVENT DETAILS ===== -->
          <tr>
            <td style="padding: 0 32px 24px 32px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0"
                style="border-left: 3px solid #f59e0b; padding-left: 0; background-color: #0d0d0d;
                  border-radius: 0 10px 10px 0; overflow: hidden;">
                <tr>
                  <td style="padding: 16px 18px;">
                    <table cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="padding-right: 32px; padding-bottom: 8px; vertical-align: top;">
                          <span style="font-family: monospace; font-size: 10px; color: #737373; text-transform: uppercase; letter-spacing: 0.08em; display: block; margin-bottom: 2px;">Date</span>
                          <span style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 13px; color: #e5e5e5; font-weight: 600;">Sunday, Dec 6, 2026</span>
                        </td>
                        <td style="padding-bottom: 8px; vertical-align: top;">
                          <span style="font-family: monospace; font-size: 10px; color: #737373; text-transform: uppercase; letter-spacing: 0.08em; display: block; margin-bottom: 2px;">Time</span>
                          <span style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 13px; color: #e5e5e5; font-weight: 600;">2:00 PM EAT</span>
                        </td>
                      </tr>
                      <tr>
                        <td colspan="2" style="vertical-align: top;">
                          <span style="font-family: monospace; font-size: 10px; color: #737373; text-transform: uppercase; letter-spacing: 0.08em; display: block; margin-bottom: 2px;">Venue</span>
                          <span style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 13px; color: #e5e5e5; font-weight: 600;">Mamba Village, Mombasa, Kenya</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ===== DIVIDER ===== -->
          <tr>
            <td style="padding: 0 32px 20px 32px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="border-top: 1px solid #222; height: 1px; font-size: 0;">&nbsp;</td>
                  <td align="center" style="padding: 0 12px; white-space: nowrap;">
                    <span style="font-family: monospace; font-size: 10px; color: #444; text-transform: uppercase; letter-spacing: 0.1em;">
                      &mdash;&nbsp; YOUR ${tickets.length === 1 ? "TICKET" : "TICKETS"} &nbsp;&mdash;
                    </span>
                  </td>
                  <td style="border-top: 1px solid #222; height: 1px; font-size: 0;">&nbsp;</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ===== TICKET CARDS ===== -->
          <tr>
            <td style="padding: 0 32px 24px 32px;">
              ${ticketCardsHtml}
            </td>
          </tr>

          <!-- ===== INSTRUCTIONS ===== -->
          <tr>
            <td style="padding: 0 32px 24px 32px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0"
                style="background-color: #0d0d0d; border: 1px solid #1e1e1e;
                  border-radius: 12px; padding: 0;">
                <tr>
                  <td style="padding: 18px 20px;">
                    <p style="margin: 0 0 12px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                      font-size: 13px; font-weight: 700; color: #ffffff; text-transform: uppercase; letter-spacing: 0.04em;">
                      Gate Entry Instructions
                    </p>
                    <table cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="padding-bottom: 8px; vertical-align: top; padding-right: 10px;">
                          <span style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                            font-size: 16px; color: #f59e0b;">1.</span>
                        </td>
                        <td style="padding-bottom: 8px;">
                          <span style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                            font-size: 13px; color: #a3a3a3; line-height: 1.5;">
                            Open this email on your phone or print it before arriving.
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding-bottom: 8px; vertical-align: top; padding-right: 10px;">
                          <span style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                            font-size: 16px; color: #f59e0b;">2.</span>
                        </td>
                        <td style="padding-bottom: 8px;">
                          <span style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                            font-size: 13px; color: #a3a3a3; line-height: 1.5;">
                            Present your QR code(s) to gate staff for scanning.
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td style="vertical-align: top; padding-right: 10px;">
                          <span style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                            font-size: 16px; color: #f59e0b;">3.</span>
                        </td>
                        <td>
                          <span style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                            font-size: 13px; color: #a3a3a3; line-height: 1.5;">
                            Re-issue or view your tickets anytime at
                            <a href="${siteUrl}/my-account"
                              style="color: #f59e0b; text-decoration: none; font-weight: 600;">
                              coastalnganyaawards.com/my-account
                            </a>
                          </span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ===== FOOTER ===== -->
          <tr>
            <td style="padding: 20px 32px 28px 32px; border-top: 1px solid #1e1e1e; text-align: center;">
              <p style="margin: 0 0 8px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                font-size: 12px; color: #555555;">
                This is an automated confirmation. If you have questions, email&nbsp;
                <a href="mailto:info@coastalnganyaawards.com"
                  style="color: #737373; text-decoration: underline;">
                  info@coastalnganyaawards.com
                </a>
              </p>
              <p style="margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                font-size: 11px; color: #333333;">
                &copy; 2026 Coastal Nganya Awards &bull; Mombasa, Kenya
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    const result = await resend.emails.send({
      from: `Coastal Nganya Awards <${fromEmail}>`,
      to: [buyerEmail],
      subject: `Your Ticket${tickets.length > 1 ? "s" : ""} — Coastal Nganya Awards Night [${orderNumber}]`,
      html: htmlBody,
    });

    console.log("[Email] Ticket email sent:", result.data?.id);
    return { success: true, emailId: result.data?.id };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[Email] Resend ticket email failed:", message);
    return { success: false, error: message };
  }
}
