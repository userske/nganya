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

export async function sendTicketEmail({
  buyerName,
  buyerEmail,
  orderNumber,
  tickets,
}: SendTicketEmailParams) {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.EMAIL_FROM || "info@coastalnganyaawards.com";

  if (!apiKey) {
    console.warn("RESEND_API_KEY not configured. Skipping email delivery in dev mode.");
    return { success: true, simulated: true };
  }

  const resend = new Resend(apiKey);

  try {
    // Generate QR data URLs for inline display
    const ticketsWithQr = await Promise.all(
      tickets.map(async (t) => {
        const qrDataUrl = await QRCode.toDataURL(t.qrPayload, {
          width: 250,
          margin: 2,
          color: {
            dark: "#000000",
            light: "#ffffff",
          },
        });
        return { ...t, qrDataUrl };
      })
    );

    const ticketHtmlList = ticketsWithQr
      .map(
        (t) => `
      <div style="border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 12px; padding: 24px; margin-bottom: 20px; background-color: #0a0a0a; color: #ffffff; text-align: center;">
        <h3 style="color: #ffffff; margin: 0 0 8px 0; font-size: 20px; text-transform: uppercase; font-weight: 800; letter-spacing: 0.05em;">${t.tierName}</h3>
        <p style="font-family: monospace; font-size: 16px; font-weight: bold; margin: 5px 0 16px 0; color: #ffffff; letter-spacing: 0.1em;">Ticket Code: ${t.ticketCode}</p>
        <div style="background-color: #ffffff; display: inline-block; padding: 12px; border-radius: 10px;">
          <img src="${t.qrDataUrl}" alt="Ticket QR" width="200" height="200" style="display: block;" />
        </div>
        <p style="font-size: 12px; color: #a3a3a3; margin-top: 16px;">Present this digital ticket or printed QR at the gate entrance.</p>
      </div>
    `
      )
      .join("");

    await resend.emails.send({
      from: `Coastal Nganya Awards <${fromEmail}>`,
      to: [buyerEmail],
      subject: `Your Coastal Nganya Awards Tickets [Order #${orderNumber}]`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #000000; padding: 32px; border-radius: 16px; color: #ffffff; border: 1px solid rgba(255, 255, 255, 0.1);">
          <div style="text-align: center; margin-bottom: 32px;">
            <h1 style="color: #ffffff; margin: 0; font-size: 26px; text-transform: uppercase; font-weight: 900; letter-spacing: 0.05em;">Coastal Nganya Awards</h1>
            <p style="color: #737373; margin: 6px 0 0 0; font-size: 13px; text-transform: uppercase; letter-spacing: 0.1em;">Mombasa's Premier Matatu Culture Awards</p>
          </div>

          <div style="background-color: rgba(255, 255, 255, 0.04); padding: 20px; border-radius: 12px; margin-bottom: 24px; border: 1px solid rgba(255, 255, 255, 0.08);">
            <p style="margin: 0 0 8px 0; font-size: 16px;">Hello <strong>${buyerName}</strong>,</p>
            <p style="margin: 0; color: #a3a3a3; font-size: 14px; line-height: 1.5;">
              Thank you for purchasing your ticket(s) for the Coastal Nganya Awards Night! Your digital tickets are attached below and ready for gate entry.
            </p>
          </div>

          <div style="margin-bottom: 24px; padding: 16px; border-left: 3px solid #ffffff; background-color: rgba(255, 255, 255, 0.03);">
            <p style="margin: 0; font-size: 13px; color: #d4d4d4; line-height: 1.6;">
              <strong>Date:</strong> Sunday, December 6, 2026<br />
              <strong>Time:</strong> 2:00 PM EAT<br />
              <strong>Venue:</strong> Mamba Village, Mombasa
            </p>
          </div>

          ${ticketHtmlList}

          <div style="text-align: center; margin-top: 32px; border-top: 1px solid rgba(255, 255, 255, 0.1); padding-top: 20px; font-size: 12px; color: #737373;">
            <p>You can also download or re-issue your tickets anytime at <a href="https://coastalnganyaawards.com/my-tickets" style="color: #ffffff; text-decoration: underline;">coastalnganyaawards.com/my-tickets</a>.</p>
            <p style="margin-top: 6px;">&copy; Coastal Nganya Awards. Mombasa, Kenya.</p>
          </div>
        </div>
      `,
    });

    return { success: true };
  } catch (err: any) {
    console.error("Resend ticket email failed:", err);
    return { success: false, error: err.message };
  }
}
