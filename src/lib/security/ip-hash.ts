/**
 * Creates a salted hash of an IP address using a pure-JS imul approach.
 * This avoids Node.js `crypto` which is not available on Cloudflare Workers edge runtime.
 * Never stores or logs raw IP addresses in votes or telemetry.
 */
export function hashIp(ip: string, salt = process.env.IP_HASH_SALT ?? "coastal-nganya-salt-2025"): string {
  if (!ip) return "unknown";
  const input = `${salt}:${ip.trim()}`;
  // 128-bit pure-JS hash (4 × 32-bit imul lanes) → 32-char hex string
  let h1 = 0xdeadbeef ^ 0;
  let h2 = 0x41c6ce57 ^ 0;
  let h3 = 0x9e3779b9 ^ 0;
  let h4 = 0x6c62272e ^ 0;
  for (let i = 0; i < input.length; i++) {
    const ch = input.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
    h3 = Math.imul(h3 ^ ch, 2246822519);
    h4 = Math.imul(h4 ^ ch, 3266489917);
  }
  h1 ^= Math.imul(h1 ^ (h2 >>> 17), 1540483477);
  h2 ^= Math.imul(h2 ^ (h3 >>> 11), 2654435761);
  h3 ^= Math.imul(h3 ^ (h4 >>> 7), 1597334677);
  h4 ^= Math.imul(h4 ^ (h1 >>> 15), 2246822519);
  return (
    (h1 >>> 0).toString(16).padStart(8, "0") +
    (h2 >>> 0).toString(16).padStart(8, "0") +
    (h3 >>> 0).toString(16).padStart(8, "0") +
    (h4 >>> 0).toString(16).padStart(8, "0")
  );
}
