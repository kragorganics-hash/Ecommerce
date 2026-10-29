# Krag Organic — Production Readiness Checklist

Before public commercial launch, review and execute each item below to ensure technical compliance, legal integrity, and operational reliability.

---

## 1. Security & Authentication
- [x] **Server-side RBAC Enforced:** All `/admin/*` and `/api/admin/*` endpoints strictly require an active session with `role === "ADMIN"`.
- [x] **No Public Admin Registration:** The registration endpoint `/api/auth/register` hardcodes `role: "CUSTOMER"` for all public signups.
- [x] **Password Hashing:** Passwords hashed using `bcryptjs` with salt rounds = 10.
- [x] **HttpOnly Cookie Sessions:** Session tokens transmitted via `HttpOnly`, `SameSite=Lax`, and `Secure` cookies.
- [x] **Zero Raw Card Exposure:** Neither frontend nor backend stores credit/debit card numbers or CVVs.
- [ ] **Rotate Production Secrets:** Ensure `JWT_SECRET` and `ADMIN_SETUP_SECRET` are replaced with 64-character cryptographically random strings in production environment variables.

---

## 2. Regulatory & Nutritional Information
- [x] **Sample Content Disclaimers:** Visible disclaimers present in the header, footer, product usage tabs, and terms noting that sample data requires commercial verification.
- [ ] **Laboratory Certificate of Analysis (CoA):** Physical batch testing for protein content (Kjeldahl method), heavy metals (ICP-MS), and microbiological safety prior to commercial sale.
- [ ] **Department of Food Technology and Quality Control (DFTQC) Nepal:** Verify packaging compliance with mandatory Nepali/English labeling regulations.

---

## 3. Domestic Payments & Logistics (Nepal)
- [x] **eSewa Integration:** Form signature generation (HMAC-SHA256) and return verification tested.
- [x] **Khalti Integration:** Paisa conversion logic (1 NPR = 100 Paisa) and server-to-server lookup verified.
- [x] **Cash on Delivery (COD):** Status lifecycle verified (remains `PENDING` until doorstep handover).
- [ ] **Live Merchant Keys:** Replace `EPAYTEST` and Khalti sandbox test keys with live production merchant credentials from eSewa and Khalti.
- [ ] **Domestic Courier Contract:** Formalize delivery SLA and COD remittance schedule with local logistics courier (e.g., Sundar Delivery, Nepal Post, Aramex).

---

## 4. Database & Reliability
- [x] **Atomic Transactions:** Order creation, inventory deduction, coupon usage increment, and inventory logging wrapped in `db.$transaction()`.
- [x] **Cancellation Restock:** Cancelling an order in `/admin/orders/[id]` restores item quantities to inventory and creates an audit record.
- [x] **Automated Test Suite:** 17 unit and integration tests passing (`cart.test.ts`, `auth.test.ts`, `payments.test.ts`, `validations.test.ts`).
- [x] **Production Build Clean:** Production build compiles and statically optimizes all 43 routes without errors.
- [ ] **Automated Database Backups:** Configure daily snapshot backups on PostgreSQL (e.g., automated Neon/Supabase point-in-time recovery).

---

## 5. Sample Data Purging
- When ready for commercial launch, run the automated wipe script:
  ```bash
  # Resets sample data and prepares clean schema
  npx prisma db push --force-reset
  # Or selectively archive sample products via the Admin Dashboard (/admin/products)
  ```
