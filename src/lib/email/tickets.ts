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
  const fromEmail = process.env.EMAIL_FROM || "tickets@coastalngayaawards.com";

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
      <div style="border: 2px solid #f59e0b; border-radius: 12px; padding: 20px; margin-bottom: 20px; background-color: #0f172a; color: #ffffff; text-align: center;">
        <h3 style="color: #f59e0b; margin: 0 0 10px 0; font-size: 20px; text-transform: uppercase;">${t.tierName}</h3>
        <p style="font-family: monospace; font-size: 18px; font-weight: bold; margin: 5px 0 15px 0; color: #ffffff;">Ticket Code: ${t.ticketCode}</p>
        <div style="background-color: #ffffff; display: inline-block; padding: 10px; border-radius: 8px;">
          <img src="${t.qrDataUrl}" alt="Ticket QR" width="200" height="200" style="display: block;" />
        </div>
        <p style="font-size: 12px; color: #94a3b8; margin-top: 15px;">Present this digital ticket or printed QR at the gate entrance.</p>
      </div>
    `
      )
      .join("");

    await resend.emails.send({
      from: `Coastal Nganya Awards <${fromEmail}>`,
      to: [buyerEmail],
      subject: `Your Coastal Nganya Awards Tickets [Order #${orderNumber}]`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #050810; padding: 30px; border-radius: 16px; color: #ffffff;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #f59e0b; margin: 0; font-size: 28px; text-transform: uppercase;">Coastal Nganya Awards</h1>
            <p style="color: #94a3b8; margin: 5px 0 0 0; font-size: 14px;">Mombasa's Premier Matatu Culture Awards</p>
          </div>

          <div style="background-color: rgba(255, 255, 255, 0.05); padding: 20px; border-radius: 12px; margin-bottom: 25px;">
            <p style="margin: 0 0 8px 0; font-size: 16px;">Hello <strong>${buyerName}</strong>,</p>
            <p style="margin: 0; color: #cbd5e1; font-size: 14px; line-height: 1.5;">
              Thank you for purchasing your ticket(s) for the Coastal Nganya Awards Night! Your digital tickets are attached below and available for gate entry.
            </p>
          </div>

          <div style="margin-bottom: 25px; padding: 15px; border-left: 4px solid #f59e0b; background-color: rgba(245, 158, 11, 0.05);">
            <p style="margin: 0; font-size: 13px; color: #cbd5e1;">
              <strong>Date:</strong> Saturday, December 6, 2025<br />
              <strong>Time:</strong> 6:00 PM EAT<br />
              <strong>Venue:</strong> Mombasa Cement Grounds, Mombasa
            </p>
          </div>

          ${ticketHtmlList}

          <div style="text-align: center; margin-top: 30px; border-top: 1px solid rgba(255, 255, 255, 0.1); padding-top: 20px; font-size: 12px; color: #64748b;">
            <p>You can also download or re-issue your tickets anytime at <a href="https://coastalngayaawards.com/my-tickets" style="color: #f59e0b; text-decoration: none;">coastalngayaawards.com/my-tickets</a>.</p>
            <p>&copy; Coastal Nganya Awards. Built for the culture.</p>
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
