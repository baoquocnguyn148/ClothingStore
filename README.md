# B&D Storefront

Modern e-commerce storefront and admin panel built with Next.js App Router, React, Tailwind CSS, shadcn/Radix UI, and Supabase.

The project can run in two modes:

- `mock`: local catalog/content data and localStorage cart/account fallback. Best for quick frontend development.
- `supabase`: Supabase Auth, PostgreSQL-backed catalog/cart/orders/wishlist/admin, payments, promotions, shipping, reviews, and inventory.

Recruitment/careers and job application features are intentionally not part of this system.

## Tech Stack

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS 4
- shadcn/Radix UI components
- Supabase Auth, PostgreSQL, Storage
- VNPay, MoMo, and ZaloPay demo payment flows
- Node test runner via `tsx --test`

## Prerequisites

- Node.js 22 or newer is recommended.
- npm 10 or newer.
- A Supabase project if you want to run the full backend mode.

This repository includes `package-lock.json`, so npm is the default package manager.

## Quick Start: Mock Mode

Mock mode does not require Supabase credentials.

```bash
npm install
copy .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

On macOS/Linux, use:

```bash
cp .env.example .env.local
```

Make sure these values remain set in `.env.local`:

```env
COMMERCE_PROVIDER=mock
NEXT_PUBLIC_COMMERCE_PROVIDER=mock
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Full Backend: Supabase Mode

Use Supabase mode when you need real auth, cart, wishlist, checkout, orders, admin, inventory, promotions, shipping, and reviews.

### 1. Create `.env.local`

```bash
copy .env.example .env.local
```

Fill in:

```env
COMMERCE_PROVIDER=supabase
NEXT_PUBLIC_COMMERCE_PROVIDER=supabase
NEXT_PUBLIC_APP_URL=http://localhost:3000

NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

Payment variables are optional for basic catalog/admin work, but required for live VNPay/MoMo payment creation:

```env
VNPAY_TMN_CODE=
VNPAY_HASH_SECRET=
VNPAY_PAYMENT_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html

MOMO_PARTNER_CODE=
MOMO_ACCESS_KEY=
MOMO_SECRET_KEY=
MOMO_ENDPOINT=https://test-payment.momo.vn/v2/gateway/api/create
```

### 2. Run migrations

Run the SQL files in this order in the Supabase SQL Editor:

```text
supabase/migrations/20260521000001_initial_schema.sql
supabase/migrations/20260521000002_rls_policies.sql
supabase/migrations/20260521000003_storage_buckets.sql
supabase/migrations/20260522000004_catalog_enhancements.sql
supabase/migrations/20260522000005_promotions_and_shipping.sql
supabase/migrations/20260522000009_functions_and_triggers.sql
supabase/migrations/20260523000001_remove_careers.sql
supabase/migrations/20260523000002_home_content_blocks.sql
```

If you prefer a single file for a fresh database, use `all_migrations_to_copy.sql`. For existing databases, still apply any newer migration files that were added after your previous setup.

### 3. Seed demo data

```bash
npm run db:seed
```

The seed script requires:

- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

### 4. Create an admin user

1. Register a user through `/register`, or create one in Supabase Auth.
2. Promote that user to admin:

```bash
npx tsx scripts/make-admin.ts user@example.com
```

Admin users are identified by `profiles.role = 'admin'`.

### 5. Start the app

```bash
npm run dev
```

Open:

- Storefront: [http://localhost:3000](http://localhost:3000)
- Admin: [http://localhost:3000/admin](http://localhost:3000/admin)

## Available Scripts

```bash
npm run dev       # Start local Next.js dev server
npm run build     # Build production bundle
npm run start     # Start production server after build
npm test          # Run unit tests
npm run db:seed   # Seed Supabase demo data
```

`npm run lint` is present in `package.json`, but the current repository does not include `eslint` as a dependency. Install/configure ESLint before relying on that script.

On Windows PowerShell, if `npm` is blocked by execution policy, run the same commands with `npm.cmd`, for example:

```powershell
npm.cmd install
npm.cmd run dev
npm.cmd test
```

## Environment Variables

| Variable | Required | Mode | Description |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_APP_URL` | Yes | All | Public app URL used for callbacks and demo payment redirects. |
| `COMMERCE_PROVIDER` | Yes | All | Server-side provider: `mock`, `supabase`, or `shopify`. |
| `NEXT_PUBLIC_COMMERCE_PROVIDER` | Yes | All | Client-side provider flag. Keep it aligned with `COMMERCE_PROVIDER`. |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase | Supabase project URL. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase | Supabase anon key for browser auth/client usage. |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase/admin/seed | Service role key for server-side admin operations and seed scripts. Never expose publicly. |
| `VNPAY_TMN_CODE` | Payment | Supabase | VNPay sandbox/merchant terminal code. |
| `VNPAY_HASH_SECRET` | Payment | Supabase | VNPay signing secret. |
| `VNPAY_PAYMENT_URL` | Payment | Supabase | VNPay payment URL. Defaults to sandbox in `.env.example`. |
| `MOMO_PARTNER_CODE` | Payment | Supabase | MoMo partner code. |
| `MOMO_ACCESS_KEY` | Payment | Supabase | MoMo access key. |
| `MOMO_SECRET_KEY` | Payment | Supabase | MoMo signing secret. |
| `MOMO_ENDPOINT` | Payment | Supabase | MoMo payment creation endpoint. |
| `SHOPIFY_STORE_DOMAIN` | Optional | Shopify | Shopify store domain. Shopify support currently falls back to mock data for most storefront behavior. |
| `SHOPIFY_STOREFRONT_ACCESS_TOKEN` | Optional | Shopify | Shopify Storefront API token. |

## Main Features

### Storefront

- Homepage with announcement bar, hero, product sections, collections, styling/outfit content, and reviews teaser.
- Collection and category browsing.
- Search, filtering, and sorting.
- Product detail pages with variants, image gallery, related products, add-to-cart, and wishlist.
- Cart drawer with mock localStorage mode or Supabase-backed cart mode.
- Checkout with order creation and payment redirect flow.
- Account dashboard, profile, addresses, wishlist, and order history.
- Blog/outfit and CMS policy pages.

### Admin

- Admin-only layout and route/API guards.
- Dashboard statistics, revenue chart, status overview, and notifications.
- Editable homepage copy via the admin Home Content module.
- Product list, create, edit, soft delete, and publish/unpublish basics.
- Inventory alerts and inline restock.
- Order list, detail, and status updates.
- Review moderation.
- Promotions list/API and shipping zone list/calculation support.

Some admin modules are intentionally partial placeholders, such as customers, blog management, and notification settings.

## Project Structure

```text
app/
  (store)/                 Storefront pages
  admin/                   Admin pages
  api/                     Next.js route handlers

components/
  store/                   Storefront components
  admin/                   Admin components
  ui/                      Shared UI primitives

data/mock/                 Local mock products, collections, blog, policies
lib/
  api/                     API helpers
  auth/                    Mock local session helpers
  cart/                    Cart context and API client
  commerce/                Commerce provider abstraction
  server/                  Server-side business services
  supabase/                Supabase clients
  wishlist/                Wishlist context

scripts/                   Seed/admin maintenance scripts
supabase/migrations/       SQL migrations
tests/                     Unit tests
public/                    Static images and icons
```

## Testing and Verification

Run unit tests:

```bash
npm test
```

Build the app:

```bash
npm run build
```

Known build warning:

- Next.js warns that the `middleware.ts` convention is deprecated in favor of `proxy`. This is a framework migration warning and does not currently block the build.

## Payment Webhooks

The app exposes:

- VNPay IPN: `GET /api/webhooks/vnpay`
- MoMo IPN: `POST /api/webhooks/momo`

For local webhook testing, expose your localhost with a tunnel and set:

```env
NEXT_PUBLIC_APP_URL=https://your-public-tunnel-url
```

## Troubleshooting

### `Supabase admin client requires ...`

You are running Supabase mode or an admin/seed script without:

- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

Fill them in `.env.local`, or switch back to mock mode.

### Login/register does not persist

Check that `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are valid and that Supabase Auth email/password sign-in is enabled.

### Admin redirects to home

The user exists but is not an admin. Set `profiles.role = 'admin'` or run:

```bash
npx tsx scripts/make-admin.ts user@example.com
```

### PowerShell blocks `npm`

Use `npm.cmd`:

```powershell
npm.cmd run dev
```

### `npm run lint` fails because `eslint` is missing

The lint script is present, but ESLint is not currently installed in this repository. Add an ESLint setup before using the lint command.

## License

Private/internal project. Do not use third-party brand names, trademarks, or assets commercially without permission.
