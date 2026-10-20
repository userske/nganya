/**
 * Voter email normalization & validation utilities.
 * Ensures "one verified email = one voter" and rejects disposable emails.
 */

const DISPOSABLE_DOMAINS = new Set([
  "tempmail.com",
  "mailinator.com",
  "guerrillamail.com",
  "10minutemail.com",
  "throwawaymail.com",
  "sharklasers.com",
  "yopmail.com",
  "trashmail.com",
  "getnada.com",
  "dispostable.com",
  "mohmal.com",
  "crazymailing.com",
]);

export function normalizeEmail(email: string): string {
  if (!email) return "";
  const trimmed = email.trim().toLowerCase();
  const parts = trimmed.split("@");
  if (parts.length !== 2) return trimmed;

  let [local, domain] = parts;

  // Gmail, Googlemail, and Protonmail ignore dots and everything after '+'
  if (domain === "gmail.com" || domain === "googlemail.com") {
    domain = "gmail.com";
    local = local.replace(/\./g, "");
    const plusIndex = local.indexOf("+");
    if (plusIndex !== -1) {
      local = local.substring(0, plusIndex);
    }
  } else {
    // For other providers, strip +tag as standard RFC extension
    const plusIndex = local.indexOf("+");
    if (plusIndex !== -1) {
      local = local.substring(0, plusIndex);
    }
  }

  return `${local}@${domain}`;
}

export function isDisposableEmail(email: string): boolean {
  if (!email) return false;
  const parts = email.trim().toLowerCase().split("@");
  if (parts.length !== 2) return false;
  return DISPOSABLE_DOMAINS.has(parts[1]);
}
