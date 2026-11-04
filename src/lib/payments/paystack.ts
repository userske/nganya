/**
 * Paystack API client for transaction initialization and verification.
 * Uses Web Crypto API (SubtleCrypto) for HMAC so this works on both
 * Cloudflare Workers edge runtime and Node.js — no `import crypto` needed.
 */

export interface InitializePaystackParams {
  amountKes: number;
  email: string;
  reference: string;
  callbackUrl: string;
  metadata?: Record<string, any>;
}

export interface PaystackInitResponse {
  status: boolean;
  message: string;
  data?: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

export interface PaystackVerifyResponse {
  status: boolean;
  message: string;
  data?: {
    id: number;
    status: string; // "success" | "failed" | "abandoned"
    reference: string;
    amount: number; // in subunits (cents) e.g. KES 1000 = 100000
    currency: string; // "KES"
    channel: string; // "card" | "mobile_money" (M-Pesa)
    customer: {
      email: string;
      phone?: string;
    };
    metadata?: Record<string, any>;
  };
}

/** Returns a hex string from a Uint8Array. */
function toHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export class PaystackClient {
  private secretKey: string;

  constructor(secretKey = process.env.PAYSTACK_SECRET_KEY ?? "") {
    this.secretKey = secretKey;
  }

  /**
   * Initializes a Paystack checkout transaction.
   * Paystack expects amount in the lowest currency subunit (1 KES = 100 subunits).
   */
  async initializeTransaction(params: InitializePaystackParams): Promise<PaystackInitResponse> {
    if (!this.secretKey) {
      console.warn("PAYSTACK_SECRET_KEY not configured. Running in sandbox simulation mode.");
      return {
        status: true,
        message: "Simulation mode active",
        data: {
          authorization_url: `${params.callbackUrl}&simulated=true`,
          access_code: `mock_code_${Date.now()}`,
          reference: params.reference,
        },
      };
    }

    const amountInSubunits = Math.round(params.amountKes * 100);

    const response = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.secretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: params.email,
        amount: amountInSubunits,
        currency: "KES",
        reference: params.reference,
        callback_url: params.callbackUrl,
        metadata: params.metadata,
        channels: ["card", "mobile_money"], // Enables cards & M-Pesa
      }),
    });

    return await response.json();
  }

  /**
   * Verifies transaction status directly with Paystack API.
   */
  async verifyTransaction(reference: string): Promise<PaystackVerifyResponse> {
    if (!this.secretKey) {
      // In local dev without keys, support clean simulation
      return {
        status: true,
        message: "Verification simulated",
        data: {
          id: 999999,
          status: "success",
          reference,
          amount: 100000,
          currency: "KES",
          channel: "mobile_money",
          customer: {
            email: "buyer@example.com",
          },
        },
      };
    }

    const response = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${this.secretKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    return await response.json();
  }

  /**
   * Validates Paystack webhook HMAC-SHA512 signature using SubtleCrypto.
   * Compatible with Cloudflare Workers edge runtime and Node.js 18+.
   */
  async verifyWebhookSignature(rawBody: string, signature: string): Promise<boolean> {
    if (!this.secretKey || !signature) return false;
    try {
      const enc = new TextEncoder();
      const key = await globalThis.crypto.subtle.importKey(
        "raw",
        enc.encode(this.secretKey),
        { name: "HMAC", hash: "SHA-512" },
        false,
        ["sign"]
      );
      const sigBuffer = await globalThis.crypto.subtle.sign("HMAC", key, enc.encode(rawBody));
      const hash = toHex(sigBuffer);
      return hash === signature;
    } catch {
      return false;
    }
  }
}
