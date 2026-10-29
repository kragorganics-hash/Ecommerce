# Krag Organic — Full-Stack E-Commerce Platform

A production-ready e-commerce platform for **Krag Organic**, a retail brand selling clean protein powders, sports nutrition, micronized strength enhancers, and Himalayan wellness supplements.

Built with **Next.js 16 (App Router)**, **TypeScript**, **Tailwind CSS v4**, **Prisma ORM**, and secure server-verified payments (eSewa, Khalti, Cash on Delivery, and Sandbox Card).

---

## 🌿 Brand Identity & Design System

- **Palette:** Forest green (`#12281e`, `#1b3b2c`), warm off-white (`#fbf9f5`, `#f3eee3`), charcoal (`#141716`), and restrained earthy gold accents (`#dcb36d`, `#8c571e`).
- **Typography:** Refined editorial serifs paired with crisp geometric sans-serif for high readability and premium aesthetic.
- **Product Experience:** Multi-variant selectors (flavor and weight), stock availability badges, clean ingredients disclosure, sample verification markers, and customer review submission.
- **100% Responsive:** Tailored layouts across mobile, tablet, and desktop screens.

---

## ⚡ Core Features

### 🛒 Customer-Facing Storefront
- **Homepage (`/`):** Hero section with value propositions, curated category cards, featured batches, bestsellers, new arrivals, quality standards section (`#our-standards`), brand story, clearly identified sample customer testimonials, and newsletter subscription.
- **Product Catalog (`/products`):** Real database-backed grid with search (`?q=`), category filtering, price and in-stock toggles, sorting options (Price Low/High, Rating, Newest), and active filter reset.
- **Product Details (`/products/[slug]`):** High-resolution image gallery, dynamic variant selector (updating price and stock in real time), low-stock warnings, tabbed formulation breakdown (Overview, Ingredients, Usage & Disclaimers), customer reviews with verified purchaser badges, and review submission form.
- **Shopping Cart & Slide-Over Drawer (`/cart` & Drawer):** Persistent local cart with server-side validation, item steppers, promo coupon application (`KRAG10`), and free domestic shipping progress bar.
- **Checkout Flow (`/checkout`):** Collects domestic Nepal delivery addresses, shipping method (Standard vs. Express), and integrated payment methods.
- **Order Confirmation (`/checkout/success`):** Summarizes order reference, items, address, payment method, and tracking information.
- **Customer Accounts:** Registration (`/register`), Login (`/login`), Order History (`/account/orders`), and Profile Address Book (`/account/profile`).
- **Policy Pages:** Privacy Policy (`/privacy`), Terms of Service (`/terms`), Shipping Policy (`/shipping-policy`), and Refund Policy (`/refund-policy`).

### 🛡️ Admin Dashboard (`/admin`)
Protected by **server-enforced role-based access control (RBAC)**:
- **Overview (`/admin`):** Real-time gross revenue, total orders, active customer counts, active product counts, low-stock warnings table, and recent orders.
- **Product Management (`/admin/products`):** Full CRUD for products, image URLs, categories, flavor/weight variants, pricing, and active/archive status.
- **Inventory Control (`/admin/inventory`):** SKU-level stock monitoring and adjustment dialog with reason logging (Restock, Damage, Manual Adjustment, Return) creating immutable `InventoryLog` records.
- **Order Management (`/admin/orders`):** Search, status filtering, order status transitions (PENDING &rarr; PROCESSING &rarr; SHIPPED &rarr; DELIVERED / CANCELLED), carrier airway bill assignment, and automatic inventory restocking on cancellation.
- **Customer Management (`/admin/customers`):** Member directory with order counts and lifetime spend (passwords and secrets are never exposed).
- **Promotions (`/admin/promotions`):** Percentage and fixed-amount coupon codes with minimum spend requirements and usage limit counters.
- **Store Settings (`/admin/settings`):** Configurable free shipping thresholds, domestic delivery fees, contact details, and top announcement marquee message.
- **Audit Logs (`/admin/audit-logs`):** Chronological log of administrative actions.

### 💳 Payment & Logistics Abstraction
- **eSewa (ePay v2):** Server-side HMAC-SHA256 signature generation and return verification.
- **Khalti (ePayment v2):** Paisa calculation and server-to-server transaction verification.
- **Cash on Delivery (COD):** Domestic doorstep cash collection workflow.
- **Sandbox Card (Simulated):** Clear test card simulation for international/testing without collecting raw card secrets.

---

## 🛠️ Technology Stack

- **Framework:** [Next.js 16 (App Router)](https://nextjs.org/)
- **Frontend:** React 19, TypeScript
- **Styling:** Tailwind CSS v4
- **ORM & Database:** [Prisma ORM 6.4.1](https://www.prisma.io/) with SQLite (local development) / PostgreSQL (production)
- **Authentication:** Jose (JWT Session Tokens) & BcryptJS (Password Hashing)
- **Validation:** Zod
- **Icons:** Lucide React
- **Testing:** Vitest

---

## 🚀 Quickstart & Setup Guide

### 1. Prerequisites
- **Node.js:** v20.x, v22.x, or v24.x
- **npm:** v10+

### 2. Installation
```bash
git clone https://github.com/your-username/krag-organic.git
cd krag-organic
npm install
```

### 3. Environment Setup
Copy the example environment configuration:
```bash
cp .env.example .env
```
*(By default, `.env` is pre-configured with a zero-friction local SQLite database and eSewa/Khalti sandbox credentials).*

### 4. Database Initialization & Seeding
Initialize the database and seed 14 realistic sample products across all categories, sample orders, discounts, and store settings:
```bash
# Push schema to database
npx prisma db push

# Seed sample products, categories, reviews, and test accounts
npm run seed
```

### 5. Start the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 Test Accounts & Demo Credentials

| Role | Email Address | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@kragorganic.com` | `KragAdmin2026!` | Full access to `/admin` dashboard and management APIs |
| **Customer** | `customer@example.com` | `Customer2026!` | Storefront purchasing, address book, order history |

### Sample Coupon Codes
- `KRAG10`: 10% off entire order (minimum order: Rs. 2,000)
- `WELCOME500`: Rs. 500 flat discount (minimum order: Rs. 4,000)

---

## 🧪 Running Automated Tests

Run the Vitest test suite covering cart calculations, payment abstractions, authentication, and validation schemas:
```bash
npm run test
```

### Test Coverage Highlights:
- `tests/cart.test.ts`: Free shipping thresholds, standard vs express courier fee calculations, percentage and fixed coupon calculations.
- `tests/auth.test.ts`: Bcrypt password hashing, salt validation, Jose JWT session token signing and role extraction.
- `tests/payments.test.ts`: eSewa HMAC-SHA256 signature generation, Cash on Delivery status persistence, test card simulation.
- `tests/validations.test.ts`: Zod schema validation for checkout, login, products, and discounts.

---

## 📦 Building for Production

Verify compilation and generate production assets:
```bash
npm run build
npm run start
```

---

## 📚 Documentation Reference

- [Architecture & Database Schema](docs/ARCHITECTURE.md)
- [External Integrations & Payment Credentials](docs/INTEGRATIONS.md)
- [Production Deployment Guide](docs/DEPLOYMENT.md)
- [Pre-Launch Production Checklist](docs/PRODUCTION_CHECKLIST.md)

---

## 📄 License & Disclaimers

All rights reserved &copy; Krag Organic.

*Disclaimer: This project contains sample store content and placeholder nutritional information designed for technical demonstration. Laboratory analysis and DFTQC compliance verification must be conducted before commercial manufacture and distribution.*
