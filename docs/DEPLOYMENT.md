# Krag Organic — Deployment Guide

This guide describes how to deploy the Krag Organic full-stack platform to production environments such as **Vercel**, **Railway**, **Render**, or a standalone **Ubuntu VPS**.

---

## 1. Deploying to Vercel + Neon / Supabase PostgreSQL

### Step 1: Provision a PostgreSQL Database
1. Create a free account at [Neon.tech](https://neon.tech) or [Supabase.com](https://supabase.com).
2. Create a new database project named `krag_organic_prod`.
3. Copy the pooled connection string, for example:
   ```env
   DATABASE_URL="postgresql://krag_user:StrongPassword123@ep-proud-forest-123.us-east-2.aws.neon.tech/krag_organic?sslmode=require"
   ```

### Step 2: Switch Prisma Schema Datasource
In `prisma/schema.prisma`, update the datasource provider to `postgresql`:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### Step 3: Run Database Migrations & Initial Seed
Run the migration and seed scripts pointing to your production database URL:
```bash
npx prisma db push
npx tsx prisma/seed.ts
```

### Step 4: Configure Environment Variables in Vercel
In your Vercel Project Settings &rarr; **Environment Variables**, add:
- `DATABASE_URL`: Your PostgreSQL connection string.
- `JWT_SECRET`: A high-entropy random string (at least 32 characters).
- `NEXT_PUBLIC_APP_URL`: Your production custom domain (e.g., `https://kragorganic.com`).
- `ESEWA_MERCHANT_CODE`: Your live or test merchant code (`EPAYTEST`).
- `ESEWA_SECRET_KEY`: Your eSewa secret HMAC key.
- `KHALTI_PUBLIC_KEY`: Your Khalti public key.
- `KHALTI_SECRET_KEY`: Your Khalti secret key.
- `ADMIN_SETUP_SECRET`: A private key used for server maintenance.

### Step 5: Deploy
Push your repository to GitHub/GitLab and link it to Vercel. Vercel automatically runs:
```bash
npm run build
```
And deploys the serverless edge application worldwide.

---

## 2. Deploying via Docker / Standalone Linux Server (Ubuntu)

For on-premise hosting or digital sovereignty:

### 1. Build and Run
```bash
# Clone repository
git clone https://github.com/your-org/krag-organic.git
cd krag-organic

# Install dependencies and build
npm install
npm run build

# Start production server
npm run start
```

### 2. Systemd Service Configuration
Create `/etc/systemd/system/krag.service`:
```ini
[Unit]
Description=Krag Organic Next.js Production Service
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/krag-organic
EnvironmentFile=/var/www/krag-organic/.env
ExecStart=/usr/bin/npm start
Restart=always

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable krag
sudo systemctl start krag
```

---

## 3. Post-Deployment Verification
1. Access the storefront homepage at your domain.
2. Sign in to `/admin` using the seeded admin credentials.
3. Verify `/admin/settings` to ensure domestic shipping fees and notification marquee reflect current commercial terms.
4. Perform an end-to-end sandbox checkout via eSewa or Sandbox Card.
