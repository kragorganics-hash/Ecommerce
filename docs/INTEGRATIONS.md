# Krag Organic — External Integrations & Gateway Credentials

This document outlines all external accounts, services, and credentials required to run **Krag Organic** in production versus local sandbox development.

---

## 1. Domestic Payment Gateways (Nepal)

Krag Organic integrates with Nepal's two leading payment networks, plus Cash on Delivery and a documented Sandbox mode.

### A. eSewa (ePay v2)
- **Account Type:** Merchant Account with eSewa Nepal (F1Soft International).
- **Registration Portal:** [https://esewa.com.np](https://esewa.com.np) (Merchant onboarding requires PAN/VAT certificate, company registration, and bank account).
- **Environment Variables:**
  - `ESEWA_MERCHANT_CODE`: Live Merchant Code provided upon activation (Default sandbox: `EPAYTEST`).
  - `ESEWA_SECRET_KEY`: HMAC-SHA256 signature secret key for server-side signing and verification.
  - `ESEWA_PAYMENT_URL`: `https://epay.esewa.com.np/api/epay/main/v2/form` (Live) or `https://rc-epay.esewa.com.np/api/epay/main/v2/form` (Sandbox).
  - `ESEWA_VERIFY_URL`: `https://epay.esewa.com.np/mobile/ecode` (Live) or `https://rc.esewa.com.np/mobile/ecode` (Sandbox).

### B. Khalti ePayment v2
- **Account Type:** Khalti Merchant Account.
- **Registration Portal:** [https://admin.khalti.com](https://admin.khalti.com)
- **Environment Variables:**
  - `KHALTI_PUBLIC_KEY`: Public client key for frontend or redirect metadata.
  - `KHALTI_SECRET_KEY`: Live authorization secret key (Prefixed with `Key `).
  - `KHALTI_API_URL`: `https://khalti.com/api/v2` (Live) or `https://a.khalti.com/api/v2` (Sandbox).
- **Workflow:** Krag Organic server calls `/epayment/initiate/` with amounts in paisa (1 NPR = 100 Paisa), redirects the user to the Khalti gateway, and performs server-to-server verification via `/epayment/lookup/` with idempotency protections.

### C. Cash on Delivery (COD)
- **Dependencies:** In-house dispatch team or third-party domestic courier partner with COD collection agreement (e.g., Sundar Delivery, Nepal Post, Aramex, Dash Logistics).
- **Configuration:** Managed directly through `/admin/settings` (configure standard shipping fees and free delivery thresholds).

### D. Sandbox / Test Card Mode
- **Status:** Built-in simulation provider.
- **Purpose:** Allows full end-to-end purchasing flows to be verified without requiring active merchant credentials. Clearly marked as simulated in all UI badges and receipt metadata.

---

## 2. Database Hosting

### Local Development:
- Runs out of the box with embedded SQLite (`file:./dev.db`) requiring 0 external accounts or daemons.

### Production PostgreSQL Options:
1. **Supabase** ([https://supabase.com](https://supabase.com)):
   - Connection URL: `postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres?sslmode=require`
2. **Neon Serverless Postgres** ([https://neon.tech](https://neon.tech)):
   - Connection URL: `postgresql://[USER]:[PASSWORD]@[ENDPOINT].neon.tech/[DATABASE]?sslmode=require`
3. **AWS RDS / Railway / DigitalOcean**:
   - Connection URL: `postgresql://[USER]:[PASSWORD]@[HOST]:5432/[DB]?schema=public`

---

## 3. Image Storage Provider

- **Current Setup:** High-resolution product images reference trusted CDNs (Unsplash) with Next.js Turbopack image optimization.
- **Production Upload Integration:**
  - **AWS S3 / Cloudflare R2 / Supabase Storage**: Admin can upload custom packaging photography directly or supply signed URLs.
  - Image domain allowlist configured in `next.config.ts`.

---

## 4. Summary Matrix

| Service | Environment | Provider | Required Credentials |
| :--- | :--- | :--- | :--- |
| **eSewa** | Sandbox / Live | F1Soft eSewa | Merchant Code, HMAC Secret Key |
| **Khalti** | Sandbox / Live | Khalti | Secret Key, Public Key |
| **Cash on Delivery** | Live | Domestic Courier | None (Internal workflow) |
| **Database** | Dev: SQLite / Prod: Postgres | Local / Neon / Supabase | `DATABASE_URL` |
| **Authentication** | Dev & Prod | Built-in Jose JWT | `JWT_SECRET` |
| **Admin Setup** | Bootstrap | Server environment | `ADMIN_SETUP_SECRET` |
