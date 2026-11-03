/**
 * Voter email normalization & validation utilities.
 * Ensures "one verified email = one voter", rejects disposable emails,
 * and detects domain typos before triggering external SMTP bounces.
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
  "fakemailgenerator.com",
  "emailondeck.com",
  "temp-mail.org",
  "generator.email",
]);

export const COMMON_DOMAIN_TYPOS: Record<string, string> = {
  "gmial.com": "gmail.com",
  "gmaill.com": "gmail.com",
  "gmai.com": "gmail.com",
  "gamil.com": "gmail.com",
  "gnail.com": "gmail.com",
  "gmal.com": "gmail.com",
  "gmaik.com": "gmail.com",
  "gmail.co": "gmail.com",
  "gmail.con": "gmail.com",
  "gmail.comm": "gmail.com",
  "googlemail.co": "gmail.com",
  "yaho.com": "yahoo.com",
  "yahoo.co": "yahoo.com",
  "yaho.co.ke": "yahoo.co.ke",
  "yahooo.com": "yahoo.com",
  "yaho.comm": "yahoo.com",
  "hotmai.com": "hotmail.com",
  "hotmial.com": "hotmail.com",
  "hotmal.com": "hotmail.com",
  "hotmail.co": "hotmail.com",
  "outloo.com": "outlook.com",
  "outlok.com": "outlook.com",
  "outloot.com": "outlook.com",
  "icolud.com": "icloud.com",
  "icloude.com": "icloud.com",
};

export function checkEmailTypo(email: string): string | null {
  if (!email || !email.includes("@")) return null;
  const parts = email.trim().toLowerCase().split("@");
  if (parts.length !== 2) return null;
  const domain = parts[1];
  const suggested = COMMON_DOMAIN_TYPOS[domain];
  return suggested ? `${parts[0]}@${suggested}` : null;
}

export function isValidEmailFormat(email: string): boolean {
  if (!email) return false;
  // RFC 5322 standard regex subset
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  return emailRegex.test(email.trim());
}

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
