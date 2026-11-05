import { describe, it, expect } from "vitest";
import { normalizeEmail, isDisposableEmail } from "@/lib/auth/email";
import { hashIp } from "@/lib/security/ip-hash";
import {
  generateSignedQrPayload,
  verifySignedQrPayload,
  type TicketPayload,
} from "@/lib/security/ticket-crypto";

describe("Voter Identity & Email Normalization", () => {
  it("normalizes Gmail dots and plus tags to the same voter email", () => {
    const email1 = "john.doe+awards1@gmail.com";
    const email2 = "johndoe@gmail.com";
    const email3 = "j.o.h.n.d.o.e@googlemail.com";

    expect(normalizeEmail(email1)).toBe("johndoe@gmail.com");
    expect(normalizeEmail(email2)).toBe("johndoe@gmail.com");
    expect(normalizeEmail(email3)).toBe("johndoe@gmail.com");
  });

  it("handles standard non-Gmail addresses and trims whitespace", () => {
    expect(normalizeEmail("  user+tag@coastalngayaawards.com  ")).toBe(
      "user@coastalngayaawards.com"
    );
  });

  it("detects disposable email services", () => {
    expect(isDisposableEmail("attacker@tempmail.com")).toBe(true);
    expect(isDisposableEmail("cheater@mailinator.com")).toBe(true);
    expect(isDisposableEmail("realvoter@gmail.com")).toBe(false);
    expect(isDisposableEmail("fan@yahoo.com")).toBe(false);
  });
});

describe("Salted IP Hashing", () => {
  it("produces deterministic, non-reversible hashes", () => {
    const ip = "197.232.61.10"; // Typical Kenyan ISP IP
    const salt = "test-salt-12345";

    const hash1 = hashIp(ip, salt);
    const hash2 = hashIp(ip, salt);

    expect(hash1).toBe(hash2);
    expect(hash1).toHaveLength(64); // SHA-256 hex string
    expect(hash1).not.toContain(ip);
  });

  it("produces different hashes with different salts", () => {
    const ip = "197.232.61.10";
    const hash1 = hashIp(ip, "salt-A");
    const hash2 = hashIp(ip, "salt-B");
    expect(hash1).not.toBe(hash2);
  });
});

describe("Ticket QR Code Signing and Verification", () => {
  const sampleTicket: TicketPayload = {
    code: "CNA-TKT-884920",
    orderNumber: "CNA-ORD-7721",
    tierName: "VIP Lounge Pass",
    buyerName: "Ali Hassan",
    issuedAt: Date.now(),
  };

  it("generates a signed QR string and successfully verifies valid signature", () => {
    const signedQr = generateSignedQrPayload(sampleTicket, "test-ticket-secret");
    expect(signedQr).toContain(".");

    const verified = verifySignedQrPayload(signedQr, "test-ticket-secret");
    expect(verified).not.toBeNull();
    expect(verified?.code).toBe("CNA-TKT-884920");
    expect(verified?.buyerName).toBe("Ali Hassan");
  });

  it("rejects tampered QR payloads", () => {
    const signedQr = generateSignedQrPayload(sampleTicket, "test-ticket-secret");
    const [payloadB64, signature] = signedQr.split(".");

    // Tamper with payload
    const tamperedPayloadB64 = Buffer.from(
      JSON.stringify({ ...sampleTicket, tierName: "VVIP Table of 5" })
    ).toString("base64url");

    const tamperedQr = `${tamperedPayloadB64}.${signature}`;
    const result = verifySignedQrPayload(tamperedQr, "test-ticket-secret");
    expect(result).toBeNull();
  });

  it("rejects QR signed with a different secret", () => {
    const signedQr = generateSignedQrPayload(sampleTicket, "secret-one");
    const result = verifySignedQrPayload(signedQr, "secret-two");
    expect(result).toBeNull();
  });
});

describe("Vote Uniqueness and Constraints Simulation", () => {
  // Pure functional simulation of the database cast_vote constraints
  interface SimulatedVote {
    voterId: string;
    categoryId: string;
    nomineeId: string;
  }

  interface SimulatedNominee {
    id: string;
    categoryId: string;
    name: string;
    isActive: boolean;
  }

  const nominees: SimulatedNominee[] = [
    { id: "nom-1", categoryId: "cat-jomvu", name: "Guap", isActive: true },
    { id: "nom-2", categoryId: "cat-jomvu", name: "Silver", isActive: true },
    { id: "nom-3", categoryId: "cat-kisauni", name: "Bokoboko", isActive: true },
  ];

  function simulateCastVote(
    votes: SimulatedVote[],
    voterId: string,
    categoryId: string,
    nomineeId: string,
    windowOpen: boolean
  ) {
    if (!windowOpen) {
      throw new Error("VOTING_CLOSED");
    }

    // Verify composite foreign key: nominee must belong to category
    const nominee = nominees.find(
      (n) => n.id === nomineeId && n.categoryId === categoryId
    );
    if (!nominee) {
      throw new Error("NOMINEE_INVALID");
    }

    // Verify unique(voter_id, category_id)
    const existing = votes.find(
      (v) => v.voterId === voterId && v.categoryId === categoryId
    );
    if (existing) {
      throw new Error("ALREADY_VOTED");
    }

    votes.push({ voterId, categoryId, nomineeId });
    return true;
  }

  it("allows a voter to vote once in a category", () => {
    const votes: SimulatedVote[] = [];
    const success = simulateCastVote(votes, "voter-1", "cat-jomvu", "nom-1", true);
    expect(success).toBe(true);
    expect(votes).toHaveLength(1);
  });

  it("rejects a second vote in the same category (ALREADY_VOTED)", () => {
    const votes: SimulatedVote[] = [];
    simulateCastVote(votes, "voter-1", "cat-jomvu", "nom-1", true);

    expect(() =>
      simulateCastVote(votes, "voter-1", "cat-jomvu", "nom-2", true)
    ).toThrow("ALREADY_VOTED");
  });

  it("allows the same voter to vote in a different category", () => {
    const votes: SimulatedVote[] = [];
    simulateCastVote(votes, "voter-1", "cat-jomvu", "nom-1", true);
    const successCat2 = simulateCastVote(
      votes,
      "voter-1",
      "cat-kisauni",
      "nom-3",
      true
    );
    expect(successCat2).toBe(true);
    expect(votes).toHaveLength(2);
  });

  it("rejects voting for a nominee of another category (composite foreign key)", () => {
    const votes: SimulatedVote[] = [];
    // nom-3 belongs to cat-kisauni, trying to vote for it under cat-jomvu
    expect(() =>
      simulateCastVote(votes, "voter-1", "cat-jomvu", "nom-3", true)
    ).toThrow("NOMINEE_INVALID");
  });

  it("rejects votes when voting window is closed", () => {
    const votes: SimulatedVote[] = [];
    expect(() =>
      simulateCastVote(votes, "voter-1", "cat-jomvu", "nom-1", false)
    ).toThrow("VOTING_CLOSED");
  });
});
