# Coastal Nganya Awards Website

Production-ready event website with guest ticket sales (Paystack + M-Pesa/Card, HMAC-signed QR passes) and public voting (one verified vote per category, real-time live updates, fraud prevention).

---

## Architecture Overview

- **Framework**: Next.js 15 (App Router) + React 19 + TypeScript (Strict)
- **Styling**: Tailwind CSS + shadcn/ui + Framer Motion
- **Database & Auth**: Supabase Postgres with strict Row Level Security (RLS) + `@supabase/ssr`
- **Realtime**: Supabase Realtime for live vote counting with automatic 5-second polling fallback
- **Payments**: Paystack (Card + M-Pesa mobile money) with idempotent webhook processing and atomic reservation
- **Security**: HMAC-SHA256 signed QR payloads, salted SHA-256 IP telemetry, Cloudflare Turnstile bot protection

---

## 1. Local Development Setup

### Prerequisites
- Node.js 20+
- pnpm 9+
- Supabase CLI (optional for local Postgres emulation)

### Setup Steps
```bash
# Clone the repository
git clone <repo-url>
cd coastal

# Install dependencies
pnpm install

# Configure environment variables
cp .env.example .env.local
# Fill in your Supabase, Paystack, and Resend credentials in .env.local

# Run database seed (parses 61 categories, 505 nominees, default ticket tiers)
pnpm db:seed

# Run automated test suite
pnpm test

# Start Next.js development server
pnpm dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 2. Supabase Setup & Database Migration

1. Create a project at [supabase.com](https://supabase.com).
2. Go to **SQL Editor** in your Supabase dashboard.
3. Run the complete migration script located at:
   ```
   supabase/migrations/20251020000000_init_schema.sql
   ```
4. Run the seed script:
   ```
   supabase/seed/seed.sql
   ```
   Or execute `pnpm db:seed` with `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` set in your `.env.local`.

### Configuring Supabase Auth Email OTP & Resend SMTP
To avoid Supabase's default rate limits on OTP verification emails:
1. In Supabase Dashboard, go to **Project Settings** > **Authentication** > **SMTP Settings**.
2. Enable **Custom SMTP**.
   - **Host**: `smtp.resend.com`
   - **Port**: `465` (or `587`)
   - **Username**: `resend`
   - **Password**: Your Resend API Key (`re_...`)
   - **Sender Email**: `tickets@coastalngayaawards.com` (or your verified Resend domain)
3. In **Authentication** > **Email Templates** > **Confirmation / Magic Link / OTP**:
   - Customize template:
     ```html
     <h2>Your Coastal Nganya Awards Verification Code</h2>
     <p>Enter the 6-digit code below to confirm your voter session:</p>
     <h1 style="font-family: monospace; letter-spacing: 0.2em;">{{ .Token }}</h1>
     <p>This code expires in 10 minutes. If you did not request this, please ignore this email.</p>
     ```

### Creating the First Administrator
Admins are created securely via a one-time SQL execution in the Supabase SQL Editor (no hard-coded passwords in source):

```sql
-- Step 1: Sign up your admin email via /login or Supabase Auth dashboard
-- Step 2: Elevate your role to 'admin' using this query:
UPDATE profiles
SET role = 'admin'
WHERE email_normalized = 'admin@coastalngayaawards.com';
```

---

## 3. Paystack Setup & Go-Live Checklist

1. **Dashboard Configuration**:
   - Log in to your [Paystack Dashboard](https://dashboard.paystack.com).
   - Go to **Settings** > **Preferences** and ensure **Mobile Money (M-Pesa)** and **Cards** are enabled.
2. **Webhook URL**:
   - Go to **Settings** > **API Keys & Webhooks**.
   - Set **Live Webhook URL** to:
     `https://coastalngayaawards.com/api/payments/paystack/webhook`
   - Set **Test Webhook URL** for staging/preview deployments.
3. **Environment Variables**:
   - Set `PAYSTACK_SECRET_KEY` and `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY`.
   - Ensure `TICKET_SIGNING_SECRET` is set to a random 32+ character string.

---

## 4. Vercel Deployment & Custom Domain Setup

### Deploying to Vercel
1. Import the repository in [Vercel](https://vercel.com).
2. Framework Preset: **Next.js**.
3. Build Command: `pnpm build` (or default).
4. Populate all environment variables from `.env.example`.

### Custom Domain: `coastalngayaawards.com`
1. Go to **Project Settings** > **Domains** on Vercel.
2. Add `coastalngayaawards.com` and select the recommended redirect:
   - Redirect `www.coastalngayaawards.com` to `coastalngayaawards.com` (or vice-versa).
3. In your DNS provider (e.g. Cloudflare, Namecheap, GoDaddy):
   - **A Record**: `@` points to `76.76.21.21` (Vercel IP)
   - **CNAME Record**: `www` points to `cname.vercel-dns.com`
4. Once DNS propagates, Vercel automatically issues an SSL certificate.

---

## 5. Security & Anti-Abuse Measures

- **One Voter = One Vote**: Enforced at the PostgreSQL level via `UNIQUE (voter_id, category_id)` and composite foreign key constraint `(nominee_id, category_id)`.
- **Direct Writes Denied**: Direct client writes to `votes` are rejected by RLS. All votes pass through the atomic `cast_vote` RPC.
- **Disposable Email Blocking**: Automatically rejects temporary email inboxes (`tempmail.com`, `mailinator.com`, etc.).
- **Salted IP Telemetry**: Voter IP addresses are never logged raw. Only a one-way HMAC-SHA256 hash with `IP_HASH_SALT` is recorded to flag bot clusters without blocking legitimate Kenyan users on shared mobile carrier CGNAT.
- **Door Check-In**: Gate scanner validates cryptographic HMAC signatures of ticket QR payloads. Scanning a ticket twice is rejected with the exact time of the initial check-in.

---

## 6. Pre-Launch Verification Checklist

- [x] Landing page with animated hero, countdown, stats, sponsors, and CTAs.
- [x] Database migration with strict RLS policies on all tables.
- [x] 61 categories and 505 nominees seeded; 3 empty categories set to inactive.
- [x] Voter email OTP authentication (passwordless, long session).
- [x] Double-vote prevention tested with Vitest suite (`pnpm test`).
- [x] Real-time live leaderboard (`/results`) with 5-second polling fallback.
- [x] Paystack guest checkout (`/tickets`) with atomic stock reservation.
- [x] HMAC-signed QR ticket generation and email delivery via Resend.
- [x] Guest ticket retrieval via `/my-tickets`.
- [x] Door scanner terminal (`/admin/scan`) with green/red verification alerts.
- [x] Admin operations portal (`/admin`) for settings, categories, orders, and fraud review.
- [x] Compliance pages: `/terms` and `/privacy` (Kenya Data Protection Act).
