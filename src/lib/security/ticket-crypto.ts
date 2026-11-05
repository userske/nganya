import crypto from "crypto";

export interface TicketPayload {
  code: string;
  orderNumber: string;
  tierName: string;
  buyerName: string;
  issuedAt: number;
}

const DEFAULT_SECRET = process.env.TICKET_SIGNING_SECRET || "coastal-nganya-tickets-secret-key-32chars";

/**
 * Generates an HMAC-signed QR string for a ticket.
 * Format: base64(JSON(payload)).HMAC_SHA256_HEX
 */
export function generateSignedQrPayload(
  payload: TicketPayload,
  secret = DEFAULT_SECRET
): string {
  const jsonStr = JSON.stringify(payload);
  const dataB64 = Buffer.from(jsonStr, "utf8").toString("base64url");
  const signature = crypto
    .createHmac("sha256", secret)
    .update(dataB64)
    .digest("hex");

  return `${dataB64}.${signature}`;
}

/**
 * Validates a signed QR string and unpacks the ticket payload.
 * Returns null if the signature is invalid or tampered with.
 */
export function verifySignedQrPayload(
  signedQr: string,
  secret = DEFAULT_SECRET
): TicketPayload | null {
  if (!signedQr || !signedQr.includes(".")) return null;

  const [dataB64, signature] = signedQr.split(".");
  if (!dataB64 || !signature) return null;

  const expectedSig = crypto
    .createHmac("sha256", secret)
    .update(dataB64)
    .digest("hex");

  // Constant time comparison to prevent timing attacks
  const sigBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSig);

  if (sigBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(sigBuffer, expectedBuffer)) {
    return null;
  }

  try {
    const jsonStr = Buffer.from(dataB64, "base64url").toString("utf8");
    return JSON.parse(jsonStr) as TicketPayload;
  } catch {
    return null;
  }
}
