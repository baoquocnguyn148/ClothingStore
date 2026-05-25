# B&D Backend — Supabase + Payments

## Architecture

- **PostgreSQL** on Supabase (migrations in `supabase/migrations/`)
- **Auth** via Supabase Auth (email/password)
- **BFF** REST API at `/api/v1/*`
- **Payments** VNPay, MoMo, ZaloPay (demo redirect)

## Setup

1. Create a [Supabase](https://supabase.com) project.

2. Copy env:
   ```bash
   cp .env.example .env.local
   ```

3. Run migrations in Supabase SQL Editor (in order):
   - `supabase/migrations/20260521000001_initial_schema.sql`
   - `supabase/migrations/20260521000002_rls_policies.sql`
   - `supabase/migrations/20260521000003_storage_buckets.sql`

4. Seed data:
   ```bash
   npm install
   npx tsx scripts/seed-supabase.ts
   ```

5. Enable Supabase mode:
   ```
   COMMERCE_PROVIDER=supabase
   NEXT_PUBLIC_COMMERCE_PROVIDER=supabase
   ```

6. Start app:
   ```bash
   npm run dev
   ```

## Schema overview

| Domain | Tables |
|--------|--------|
| Catalog | `products`, `product_variants`, `product_images`, `collections`, `tags` |
| Commerce | `carts`, `cart_items`, `orders`, `order_items`, `payments`, `payment_events` |
| Identity | `profiles`, `addresses`, `wishlist_items` |
| Content | `blog_posts`, `cms_pages` |

## API v1

| Endpoint | Auth |
|----------|------|
| `GET /api/v1/products` | Public |
| `GET /api/v1/cart` | Guest cookie or user |
| `POST /api/v1/orders` | Required |
| `POST /api/v1/orders/:id/pay` | Required |
| `GET /api/v1/me` | Required |

## Payment methods

| Provider | Flow |
|----------|------|
| **COD** | Xác nhận ngay → `confirmed`, thu tiền khi giao. Dùng để test nhanh (không cần VNPay/MoMo). |
| VNPay / MoMo | Redirect gateway → webhook → `paid` |
| ZaloPay | Demo redirect (dev only) |

## Payment webhooks

- VNPay IPN: `GET /api/webhooks/vnpay`
- MoMo IPN: `POST /api/webhooks/momo`

Set `NEXT_PUBLIC_APP_URL` to your public URL for production webhooks.

## Mock fallback

Without Supabase env vars, set `COMMERCE_PROVIDER=mock` — storefront uses local JSON + localStorage (unchanged).

## Extending

Add new features via new tables + `lib/server/<context>/` services without breaking existing APIs.
