# ASSUMPTIONS.md — Coastal Nganya Awards

All design decisions and ambiguities resolved during the build are recorded here.

---

## Domain

The brief mentions `coastalngayaawards.com` but the event is called "Coastal Nganya Awards". The domain is stored exclusively in `NEXT_PUBLIC_SITE_URL` — change that one variable to update the domain everywhere. No domain is hard-coded in source.

---

## Category Groupings

The 61 categories are grouped as follows (using the `group_name` column):

| Group | Rationale |
|---|---|
| **Nganya – Mombasa 1** | Categories explicitly scoped to Mombasa 1 route |
| **Nganya – Jomvu** | Categories scoped to Jomvu route |
| **Nganya – Kisauni** | Categories scoped to Kisauni route |
| **Nganya – Mikindani** | Categories scoped to Mikindani route |
| **Nganya – Likoni** | Categories scoped to Likoni route |
| **Nganya – Other Routes** | Other route-specific nganya categories |
| **Drivers & Conductors** | Best Driver and Best Conductor awards |
| **Business & Services** | Sacco, mechanics, parks, IT, catering, hardware, spare parts, etc. |
| **Special Awards** | Legend, MVP, Viral Moment, Innovation, Lifetime Achievement, etc. |

Categories without route context (general fleet, iconic, entertainment) fall into Special Awards or Business & Services as appropriate. Final assignment is in the seed JSON.

---

## Three Empty Categories

"Mombasa 1 Matatu", "Best Driver Mombasa", and "Best Conductor Mombasa" have no nominees in the source document. They are seeded as `is_active = false`. Admins can add nominees and activate them before voting opens.

---

## Anti-Cheat Honest Assessment

No online voting system can fully prevent a determined individual using multiple real email addresses (especially free providers like Gmail). The mitigations deployed:

1. **Email normalisation** — strips Gmail dots and `+` tags, lowercases and trims. One Gmail inbox = one voter.
2. **Disposable email blocklist** — a maintained list of ≈2 000+ throw-away domains (e.g. mailinator, guerrillamail, trashmail) is rejected at OTP request time.
3. **Cloudflare Turnstile** — bot/automated script detection on OTP request and vote submission endpoints.
4. **Rate limiting** — Upstash Redis (or Postgres fallback): 5 OTP requests per IP per hour, 30 vote submissions per IP per hour.
5. **IP hash flagging** — salted SHA-256 of the raw IP; stored on every vote and OTP request; admin view surfaces IPs with many distinct voter accounts.
6. **Supabase DB uniqueness** — `UNIQUE (voter_id, category_id)` enforced at DB level; the `cast_vote()` RPC is the only insert path.
7. **Soft-void** — admin can void a voter's votes with an audit entry; count decrements automatically.
8. **What cannot be stopped** — someone with 10 Gmail accounts and 10 phone SIMs can vote 10 times. The event organisers accept this residual risk (as with all public online votes).

---

## Email OTP vs Magic Link

Magic links break inside WhatsApp, Facebook, and Instagram in-app browsers (which are common in Kenya). 6-digit codes are used throughout, never magic links.

---

## SMS / Phone OTP

Not implemented. The voter auth interface (`IVoterAuth`) is isolated so a phone OTP provider (Africa's Talking, Twilio) can be plugged in later without changing the voting logic.

---

## Paystack — M-Pesa Channel

M-Pesa STK Push via Paystack is available when the Paystack account has mobile-money enabled (Kenya). The implementation passes `channels: ['mobile_money', 'card']` to the Initialize Transaction API. The payment popup or redirect handles the channel selection.

---

## Rate Limiting Fallback

If `UPSTASH_REDIS_REST_URL` is not set, the application falls back to a Postgres-backed rate-limit table (`rate_limit_attempts`). This is slower but sufficient for moderate traffic. Set Upstash in production for best performance.

---

## Ticket Stock Reservation

Reservation timeout is **10 minutes**. A cron job (Vercel Cron or a Supabase pg_cron rule) runs every 5 minutes and releases expired reservations (`status = 'pending'` and `reserved_until < NOW()`).

---

## Realtime Vote Count Batching

Client-side Realtime updates are batched with a 1-second debounce using `requestAnimationFrame`. If the Supabase Realtime WebSocket disconnects (plan connection limit reached or network drop), the client falls back to HTTP polling every 5 seconds.

---

## QR Ticket Signing

Ticket QR payloads are HMAC-SHA256 signed with `TICKET_SIGNING_SECRET`. The payload is `{ticketId}:{orderId}:{tierId}:{issuedAt}`. This prevents forged QR codes without a full database lookup on every scan, but the scan endpoint also verifies against the DB.

---

## Paystack Popup vs Redirect

Both Paystack Popup (inline) and redirect are supported. Default is **redirect** (`/api/payments/paystack/initialize` returns the `authorization_url` and the client redirects). This is more reliable on mobile browsers and avoids popup blockers.

---

## Image Storage

Nominee and hero images are stored in the Supabase Storage bucket `public-assets` with a public access policy. The admin upload endpoint writes to `nominees/{categorySlug}/{nomineeId}.webp` (resized to max 800 × 800 px server-side via the `sharp` library).

---

## Seed Data Tidying Rules

- Trim leading/trailing whitespace.
- Normalise dashes: `–` and `-` preceded/followed by space become ` – ` (en-dash with spaces).
- Capitalise first letter of each word where the source is all-caps or all-lower (preserve mixed-case that appears intentional, e.g. "MV Likoni ferry").
- A trailing ` – <hint>` or ` (<hint>)` where `<hint>` is a plate/route/team is split into the `subtitle` field.
- Near-duplicates like `"Sammy – guap"` and `"Sammy- guap"` in the **same category** are de-duplicated (first occurrence kept). Occurrences in **different categories** are kept as separate entries (they represent different awards contexts).

---

## Admin Bootstrap

The first admin account is created by running:

```sql
-- After creating a user via Supabase Auth dashboard or CLI:
UPDATE profiles SET role = 'admin' WHERE email_normalized = 'your@email.com';
```

This avoids hard-coded credentials. Documented in `README.md`.

---

## SEO / Analytics

Google Analytics / GA4 is stubbed (a `<Script>` component with `NEXT_PUBLIC_GA_ID` env var, no-op when unset). No cookie banner is required for the basic site since the site itself does not set tracking cookies by default. If analytics are enabled, a consent banner must be added before go-live (noted in the pre-launch checklist in `README.md`).

