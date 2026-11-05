import crypto from "crypto";

/**
 * Creates a salted SHA-256 hash of an IP address.
 * Never stores or logs raw IP addresses in votes or telemetry.
 */
export function hashIp(ip: string, salt = process.env.IP_HASH_SALT ?? "coastal-nganya-salt-2025"): string {
  if (!ip) return "unknown";
  return crypto
    .createHmac("sha256", salt)
    .update(ip.trim())
    .digest("hex");
}
