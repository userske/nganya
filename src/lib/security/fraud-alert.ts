import { createAdminClient } from "@/lib/supabase/server";
import { Resend } from "resend";

export interface FraudAlertParams {
  eventType:
    | "DISPOSABLE_EMAIL_SIGNIN_ATTEMPT"
    | "DISPOSABLE_EMAIL_VOTE_ATTEMPT"
    | "DISQUALIFIED_NOMINEE_VOTE_ATTEMPT"
    | "IP_CLUSTER_SURGE"
    | "TURNSTILE_BOT_DETECTED"
    | "TAMPER_ATTEMPT";
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  email?: string;
  ip?: string;
  ipHash?: string;
  categoryId?: string;
  categoryName?: string;
  nomineeId?: string;
  nomineeName?: string;
  reason: string;
  metadata?: Record<string, any>;
}

// In-memory throttling map to prevent alert email floods during automated bursts (max 1 email per eventType+identifier per 5 minutes)
const alertThrottleMap = new Map<string, number>();
const THROTTLE_WINDOW_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Automatically logs a fraudulent attempt to the database audit_log
 * and immediately dispatches an alert email to the site administrator.
 */
export async function recordSecurityIncidentAndAlertAdmin(params: FraudAlertParams): Promise<void> {
  const timestamp = new Date().toISOString();
  const eatTime = new Date().toLocaleString("en-KE", { timeZone: "Africa/Nairobi" });

  console.warn(`[SECURITY ALERT] [${params.severity}] ${params.eventType}: ${params.reason}`, {
    email: params.email,
    ipHash: params.ipHash,
    nominee: params.nomineeName,
    category: params.categoryName,
  });

  // 1. Persist to audit_log table in database
  try {
    const adminClient = await createAdminClient();
    await adminClient.from("audit_log").insert({
      action: "FRAUD_SECURITY_ALERT",
      entity_type: params.eventType,
      entity_id: params.nomineeId || params.categoryId || params.email || null,
      details: {
        severity: params.severity,
        eventType: params.eventType,
        email: params.email,
        ipHash: params.ipHash,
        category: params.categoryName,
        nominee: params.nomineeName,
        reason: params.reason,
        timestamp,
        eatTime,
        ...params.metadata,
      },
    });
  } catch (dbErr) {
    console.error("[FraudAlert] Error logging to database audit_log:", dbErr);
  }

  // 2. Check throttling to avoid burning email quota during scripted attacks
  const throttleKey = `${params.eventType}:${params.email || params.ipHash || "global"}`;
  const lastAlertTime = alertThrottleMap.get(throttleKey) || 0;
  const now = Date.now();

  if (now - lastAlertTime < THROTTLE_WINDOW_MS) {
    console.log(`[FraudAlert] Alert email throttled for ${throttleKey} (sent recently)`);
    return;
  }
  alertThrottleMap.set(throttleKey, now);

  // 3. Dispatch automated alert email to Admin
  const primaryKey = process.env.RESEND_API_KEY;
  const backupKeys = [
    process.env.RESEND_API_KEY_SECONDARY,
    process.env.RESEND_BACKUP_API_KEY,
  ].filter(Boolean) as string[];
  const extraKeys = (process.env.RESEND_API_KEYS || "")
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean);

  const candidateKeys = [primaryKey, ...backupKeys, ...extraKeys].filter(Boolean) as string[];

  if (candidateKeys.length === 0) {
    console.warn("[FraudAlert] No Resend API key configured to dispatch alert email.");
    return;
  }

  const rawAdmins = process.env.ADMIN_EMAIL || "info@coastalnganyaawards.com";
  const adminRecipients = rawAdmins
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  if (adminRecipients.length === 0) return;

  const fromAddress = process.env.EMAIL_FROM || "noreply@coastalnganyaawards.com";
  const sender = fromAddress.includes("<")
    ? fromAddress
    : `Coastal Nganya Security <${fromAddress}>`;

  const severityColor =
    params.severity === "CRITICAL"
      ? "#ef4444"
      : params.severity === "HIGH"
      ? "#f97316"
      : "#f59e0b";

  const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Security Alert</title>
</head>
<body style="margin: 0; padding: 0; background-color: #000000; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #ffffff;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #000000; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #0d0d0d; border: 1px solid rgba(255,255,255,0.12); border-radius: 20px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.8);">
          
          <!-- Header Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, rgba(239,68,68,0.2) 0%, rgba(245,158,11,0.1) 100%); padding: 28px 32px; border-bottom: 1px solid rgba(255,255,255,0.08);">
              <div style="display: inline-block; padding: 4px 12px; background-color: ${severityColor}; color: #000000; font-size: 11px; font-weight: 900; letter-spacing: 0.1em; border-radius: 9999px; text-transform: uppercase; margin-bottom: 12px;">
                ${params.severity} SEVERITY INCIDENT
              </div>
              <h1 style="margin: 0; font-size: 22px; font-weight: 800; color: #ffffff; letter-spacing: -0.02em; text-transform: uppercase;">
                Fraudulent Activity Detected & Blocked
              </h1>
              <p style="margin: 6px 0 0 0; font-size: 13px; color: rgba(255,255,255,0.6);">
                Coastal Nganya Awards 2026 Security Monitoring
              </p>
            </td>
          </tr>

          <!-- Incident Details -->
          <tr>
            <td style="padding: 32px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 12px; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 16px; border-bottom: 1px solid rgba(255,255,255,0.06); font-size: 12px; color: rgba(255,255,255,0.5); width: 140px;">Incident Type:</td>
                  <td style="padding: 16px; border-bottom: 1px solid rgba(255,255,255,0.06); font-size: 13px; font-weight: 700; color: #ffffff; font-family: monospace;">${params.eventType}</td>
                </tr>
                ${
                  params.email
                    ? `<tr>
                  <td style="padding: 16px; border-bottom: 1px solid rgba(255,255,255,0.06); font-size: 12px; color: rgba(255,255,255,0.5);">Offender Email:</td>
                  <td style="padding: 16px; border-bottom: 1px solid rgba(255,255,255,0.06); font-size: 13px; font-weight: 700; color: #f59e0b; font-family: monospace;">${params.email}</td>
                </tr>`
                    : ""
                }
                ${
                  params.categoryName
                    ? `<tr>
                  <td style="padding: 16px; border-bottom: 1px solid rgba(255,255,255,0.06); font-size: 12px; color: rgba(255,255,255,0.5);">Target Category:</td>
                  <td style="padding: 16px; border-bottom: 1px solid rgba(255,255,255,0.06); font-size: 13px; font-weight: 600; color: #ffffff;">${params.categoryName}</td>
                </tr>`
                    : ""
                }
                ${
                  params.nomineeName
                    ? `<tr>
                  <td style="padding: 16px; border-bottom: 1px solid rgba(255,255,255,0.06); font-size: 12px; color: rgba(255,255,255,0.5);">Target Nominee:</td>
                  <td style="padding: 16px; border-bottom: 1px solid rgba(255,255,255,0.06); font-size: 13px; font-weight: 700; color: #ffffff;">${params.nomineeName}</td>
                </tr>`
                    : ""
                }
                ${
                  params.ipHash
                    ? `<tr>
                  <td style="padding: 16px; border-bottom: 1px solid rgba(255,255,255,0.06); font-size: 12px; color: rgba(255,255,255,0.5);">Client IP Hash:</td>
                  <td style="padding: 16px; border-bottom: 1px solid rgba(255,255,255,0.06); font-size: 11px; font-family: monospace; color: rgba(255,255,255,0.7);">${params.ipHash}</td>
                </tr>`
                    : ""
                }
                <tr>
                  <td style="padding: 16px; font-size: 12px; color: rgba(255,255,255,0.5);">Timestamp (EAT):</td>
                  <td style="padding: 16px; font-size: 12px; color: rgba(255,255,255,0.8); font-family: monospace;">${eatTime}</td>
                </tr>
              </table>

              <!-- Forensic Explanation -->
              <div style="background-color: rgba(239,68,68,0.08); border-left: 3px solid ${severityColor}; padding: 14px 18px; border-radius: 8px; margin-bottom: 24px;">
                <p style="margin: 0; font-size: 13px; line-height: 1.5; color: rgba(255,255,255,0.9);">
                  <strong>Detection Reason:</strong> ${params.reason}
                </p>
                <p style="margin: 6px 0 0 0; font-size: 12px; color: #10b981; font-weight: 600;">
                  Automated Action: Attempt rejected immediately. No vote was recorded.
                </p>
              </div>

              <!-- Button CTA -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="https://coastalnganyaawards.com/admin" style="display: inline-block; background-color: #f59e0b; color: #000000; text-decoration: none; font-weight: 800; font-size: 13px; padding: 14px 28px; border-radius: 12px; text-transform: uppercase; letter-spacing: 0.05em;">
                      Open Security Dashboard &rarr;
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 32px; background-color: rgba(0,0,0,0.5); border-top: 1px solid rgba(255,255,255,0.06); text-align: center; font-size: 11px; color: rgba(255,255,255,0.4);">
              Automated election integrity protection for Coastal Nganya Awards 2026.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  for (const key of candidateKeys) {
    try {
      const resend = new Resend(key);
      const res = await resend.emails.send({
        from: sender,
        to: adminRecipients,
        subject: `🚨 [SECURITY ALERT] ${params.severity}: ${params.eventType} — Coastal Nganya Awards`,
        html: emailHtml,
      });
      if (res.data?.id) {
        console.log(`[FraudAlert] Alert email dispatched to ${adminRecipients.join(", ")} via Resend (${key.slice(0, 6)}...): ${res.data.id}`);
        return;
      }
    } catch (emailErr) {
      console.warn(`[FraudAlert] Key (${key.slice(0, 6)}...) failed, attempting next:`, emailErr);
    }
  }
}
