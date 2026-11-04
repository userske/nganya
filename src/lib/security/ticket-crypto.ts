/**
 * HMAC-signed QR payload utilities for ticket verification.
 * Uses Web Crypto API (SubtleCrypto) so this works on Cloudflare Workers
 * edge runtime and Node.js 18+ without `import crypto` from Node.js.
 */

export interface TicketPayload {
  code: string;
  orderNumber: string;
  tierName: string;
  buyerName: string;
  issuedAt: number;
}

const DEFAULT_SECRET = process.env.TICKET_SIGNING_SECRET || "coastal-nganya-tickets-secret-key-32chars";

/** Returns a lowercase hex string from an ArrayBuffer. */
function toHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** Imports a raw HMAC-SHA256 key via SubtleCrypto. */
async function importHmacKey(secret: string): Promise<CryptoKey> {
  const enc = new TextEncoder();
  return globalThis.crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

/** Base64url encode a UTF-8 string (no padding), safe for all Unicode. */
function toBase64url(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

/** Base64url decode to UTF-8 string. */
function fromBase64url(b64: string): string {
  const pad = b64.length % 4;
  const padded = pad ? b64 + "=".repeat(4 - pad) : b64;
  const binary = atob(padded.replace(/-/g, "+").replace(/_/g, "/"));
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

/**
 * Generates an HMAC-signed QR string for a ticket.
 * Format: base64url(JSON(payload)).HMAC_SHA256_HEX
 */
export async function generateSignedQrPayload(
  payload: TicketPayload,
  secret = DEFAULT_SECRET
): Promise<string> {
  const jsonStr = JSON.stringify(payload);
  const dataB64 = toBase64url(jsonStr);
  const enc = new TextEncoder();
  const key = await importHmacKey(secret);
  const sigBuffer = await globalThis.crypto.subtle.sign("HMAC", key, enc.encode(dataB64));
  const signature = toHex(sigBuffer);
  return `${dataB64}.${signature}`;
}

/**
 * Validates a signed QR string and unpacks the ticket payload.
 * Returns null if the signature is invalid or tampered with.
 */
export async function verifySignedQrPayload(
  signedQr: string,
  secret = DEFAULT_SECRET
): Promise<TicketPayload | null> {
  if (!signedQr || !signedQr.includes(".")) return null;

  const dotIdx = signedQr.lastIndexOf(".");
  const dataB64 = signedQr.slice(0, dotIdx);
  const signature = signedQr.slice(dotIdx + 1);

  if (!dataB64 || !signature) return null;

  try {
    const enc = new TextEncoder();
    const key = await importHmacKey(secret);
    // Recompute expected signature
    const sigBuffer = await globalThis.crypto.subtle.sign("HMAC", key, enc.encode(dataB64));
    const expectedSig = toHex(sigBuffer);

    // Constant-time comparison: compare lengths then every char
    if (expectedSig.length !== signature.length) return null;
    let mismatch = 0;
    for (let i = 0; i < expectedSig.length; i++) {
      mismatch |= expectedSig.charCodeAt(i) ^ signature.charCodeAt(i);
    }
    if (mismatch !== 0) return null;

    const jsonStr = fromBase64url(dataB64);
    return JSON.parse(jsonStr) as TicketPayload;
  } catch {
    return null;
  }
}
