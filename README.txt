================================================================================
   B&D FASHION — Enterprise E-Commerce Platform
   Vietnamese Streetwear | Full-Stack Web Application
================================================================================

  Live Demo : https://clothing-store-82ef.vercel.app/
  GitHub    : https://github.com/baoquocnguyn148/ClothingStore
  Version   : 0.1.0

--------------------------------------------------------------------------------
TABLE OF CONTENTS
--------------------------------------------------------------------------------
  1. Project Overview
  2. Technology Stack
  3. System Architecture
  4. Feature List
  5. Prerequisites
  6. Quick Start (Mock Mode — No Database Required)
  7. Full Setup (Supabase + Real Database)
  8. Environment Variables Reference
  9. Database Setup (Migrations)
 10. Available Scripts
 11. Project Structure
 12. Admin Panel Access
 13. Deployment (Vercel)
 14. Troubleshooting
 15. License & Credits

================================================================================
1. PROJECT OVERVIEW
================================================================================

B&D Fashion is a full-featured e-commerce platform built for a Vietnamese
streetwear brand. It combines a premium storefront (B2C) with a comprehensive
admin/ERP system in a single Next.js monorepo.

  Key Highlights:
  - Premium storefront UI inspired by global fashion brands (Levents, ARKET)
  - Complete Admin Panel with TPS / MIS / DSS / ESS / CRM modules
  - Dual-mode: runs with real Supabase DB or offline with Mock data
  - Vietnamese payment gateways: VNPay, MoMo (sandbox-ready)
  - AI-powered chatbot assistant (built-in)
  - SEO-optimized with sitemap.xml, robots.txt, SSR / SSG

================================================================================
2. TECHNOLOGY STACK
================================================================================

  FRONTEND
  --------
  - Framework   : Next.js 15 (App Router) — SSR & SSG
  - UI Library  : React 19
  - Language    : TypeScript 5.7
  - Styling     : Tailwind CSS v4 + custom CSS micro-animations
  - Icons       : Lucide React
  - Components  : Radix UI (headless), shadcn/ui pattern
  - Charts      : Recharts
  - Fonts       : Google Fonts (Inter, Geist)

  BACKEND
  -------
  - API Layer   : Next.js Route Handlers (app/api/*) + Server Actions
  - BaaS        : Supabase (Auth, Database, Storage, Realtime)
  - Auth        : Supabase Auth — JWT, Email/Password, Session management
  - Email       : Resend API
  - Payments    : VNPay (sandbox), MoMo (sandbox)

  DATABASE
  --------
  - Engine      : PostgreSQL (managed by Supabase)
  - Client      : @supabase/supabase-js v2
  - ORM         : Raw SQL via Supabase client + RLS policies
  - Migrations  : 16 sequential migration files in /supabase/migrations/

  DEVOPS & TESTING
  ----------------
  - Hosting     : Vercel (recommended)
  - E2E Tests   : Playwright
  - Unit Tests  : Node.js built-in test runner (tsx --test)
  - Analytics   : Vercel Analytics

================================================================================
3. SYSTEM ARCHITECTURE
================================================================================

  Architecture: Monolithic SSR (single-repo, Next.js App Router)

  ┌─────────────────────────────────────────────────────────────────┐
  │  Browser (Client)                                               │
  └───────────────────────────┬─────────────────────────────────────┘
                              │ HTTP
  ┌───────────────────────────▼─────────────────────────────────────┐
  │  Next.js Server (BFF — Backend for Frontend)                    │
  │  ┌─────────────────────┐  ┌──────────────────────────────────┐  │
  │  │  Storefront          │  │  Admin Dashboard                 │  │
  │  │  app/(store)/*       │  │  app/admin/*                     │  │
  │  │  - SSR / SSG pages   │  │  - Dynamic / Realtime pages      │  │
  │  │  - SEO optimized     │  │  - Role-based auth required      │  │
  │  └─────────────────────┘  └──────────────────────────────────┘  │
  │  ┌─────────────────────────────────────────────────────────┐     │
  │  │  API Routes: app/api/*  (REST endpoints + webhooks)     │     │
  └──┴─────────────────────────────────────────────────────────┴─────┘
                              │
  ┌───────────────────────────▼─────────────────────────────────────┐
  │  Supabase (PostgreSQL + Auth + Storage)                         │
  └─────────────────────────────────────────────────────────────────┘

  Two running modes:
  [1] MOCK MODE   — No database needed. Uses local static data from /data/mock/
  [2] SUPABASE    — Full live database with auth, orders, inventory, etc.

================================================================================
4. FEATURE LIST
================================================================================

  STOREFRONT (Customer-facing)
  ----------------------------
  [x] Home Page — Dynamic hero banner, new arrivals, best sellers, blog section
  [x] Collections — Sidebar filter by category, tag (new / best-seller)
  [x] Product Detail — Image gallery, color/size picker, real-time stock check
  [x] Search — Full-text product search
  [x] Cart — Slide-in drawer with free-shipping progress bar (gamification)
  [x] Checkout — One-page checkout (VNPay / MoMo / COD)
  [x] Authentication — Login, Register, Forgot Password
  [x] User Account — Order history, Wishlist, Address management
  [x] Membership Tiers — Points accumulation, VIP / Member badges
  [x] Blog — Styled editorial posts
  [x] About / Careers — Static info pages
  [x] Size Guide — Popup size chart per product
  [x] AI Chatbot — In-page chat widget for product Q&A
  [x] Reviews — Customer review submission and display

  ADMIN PANEL (Staff/Management)
  --------------------------------
  [TPS] Orders        — Full order lifecycle management (create → ship → complete)
  [TPS] Products      — CRUD products + variants (color, size), image upload
  [TPS] Collections   — Manage product collections/categories
  [TPS] Promotions    — Discount codes, vouchers, campaign management
  [MIS] Inventory     — SKU-level stock, low-stock alerts, movement log
  [MIS] MIS Reports   — Revenue dashboard, order trends, top products
  [DSS] Analytics     — Conversion rate, sell-through rate, demand forecasting
  [ESS] Executive     — C-level KPI dashboard: growth rate, financial overview
  [CRM] Customers     — Customer profiles, purchase history, tier management
  [CRM] Notifications — Push notifications + email template editor
  [CMS] Blog          — Create/edit blog posts
  [CMS] Pages         — Manage static CMS pages
  [CMS] Home Content  — Edit homepage banners and text via admin UI
  [SYS] Settings      — Shipping zones, email config, system preferences

================================================================================
5. PREREQUISITES
================================================================================

  Required:
  - Node.js  >= 18.17.0   (download: https://nodejs.org/)
  - Git                   (download: https://git-scm.com/)
  - npm      >= 9.x       (bundled with Node.js)

  Optional (for full database features):
  - Supabase account      (free tier available: https://supabase.com/)

  To verify your Node.js version:
    node --version
    npm --version

================================================================================
6. QUICK START (MOCK MODE — No Database Required)
================================================================================

  This mode uses static mock data. No Supabase account needed.
  Perfect for development, demo, and UI testing.

  STEP 1 — Clone the repository
  ------------------------------
    git clone https://github.com/baoquocnguyn148/ClothingStore.git
    cd ClothingStore

  STEP 2 — Install dependencies
  ------------------------------
    npm install

  STEP 3 — Create environment file
  ----------------------------------
    Copy .env.example to .env.local:

    Windows (cmd):     copy .env.example .env.local
    Windows (PS):      Copy-Item .env.example .env.local
    Mac/Linux:         cp .env.example .env.local

    Make sure these values are set in .env.local:
      COMMERCE_PROVIDER=mock
      NEXT_PUBLIC_COMMERCE_PROVIDER=mock

  STEP 4 — Start the development server
  ----------------------------------------
    npm run dev

  STEP 5 — Open in browser
  -------------------------
    Storefront  : http://localhost:3000
    Admin Panel : http://localhost:3000/admin

  NOTE: In Mock Mode, login/register and checkout will not persist data.
        The admin panel will show mock analytics data.

================================================================================
7. FULL SETUP (SUPABASE + REAL DATABASE)
================================================================================

  STEP 1–2: Same as Quick Start above (clone + npm install)

  STEP 3 — Create a Supabase project
  ------------------------------------
    a) Go to https://supabase.com/ and create a free account
    b) Create a new project (choose any region)
    c) Wait for the project to initialize (~2 minutes)
    d) Go to Project Settings > API to find your keys:
       - Project URL     (NEXT_PUBLIC_SUPABASE_URL)
       - anon/public key (NEXT_PUBLIC_SUPABASE_ANON_KEY)
       - service_role key (SUPABASE_SERVICE_ROLE_KEY)  [keep this SECRET]

  STEP 4 — Configure environment variables
  ------------------------------------------
    Create .env.local in the project root with the following content:

      NEXT_PUBLIC_APP_URL=http://localhost:3000

      COMMERCE_PROVIDER=supabase
      NEXT_PUBLIC_COMMERCE_PROVIDER=supabase

      NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
      NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
      SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

    Optional (for payment gateways):
      VNPAY_TMN_CODE=your-vnpay-code
      VNPAY_HASH_SECRET=your-vnpay-secret
      VNPAY_PAYMENT_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html

      MOMO_PARTNER_CODE=your-momo-code
      MOMO_ACCESS_KEY=your-momo-access-key
      MOMO_SECRET_KEY=your-momo-secret
      MOMO_ENDPOINT=https://test-payment.momo.vn/v2/gateway/api/create

  STEP 5 — Run database migrations
  ----------------------------------
    Option A: Via Supabase Dashboard (easiest)
      - Go to your Supabase project > SQL Editor
      - Run each file in /supabase/migrations/ in order (by filename)
      - Files are named with timestamps, run from oldest to newest

    Option B: Via Supabase CLI (advanced)
      npm install -g supabase
      supabase login
      supabase link --project-ref your-project-ref
      supabase db push

  STEP 6 — Seed sample data (optional)
  ---------------------------------------
    npm run db:seed

    This inserts sample products, categories, users, and orders
    so the admin panel has demo data to display.

  STEP 7 — Create an admin user
  ------------------------------
    a) Register a new account at http://localhost:3000/register
    b) Run the make-admin script to grant admin role:

       npx tsx scripts/make-admin.ts your@email.com

  STEP 8 — Start development server
  -----------------------------------
    npm run dev

    Storefront  : http://localhost:3000
    Admin Panel : http://localhost:3000/admin  (requires admin account)

================================================================================
8. ENVIRONMENT VARIABLES REFERENCE
================================================================================

  Variable                         Required  Description
  -------------------------------- --------- ----------------------------------
  NEXT_PUBLIC_APP_URL              No        App base URL (default: localhost:3000)
  COMMERCE_PROVIDER                No        "mock" or "supabase" (default: mock)
  NEXT_PUBLIC_COMMERCE_PROVIDER    No        Same as above, exposed to browser
  NEXT_PUBLIC_SUPABASE_URL         Supabase  Your Supabase project URL
  NEXT_PUBLIC_SUPABASE_ANON_KEY    Supabase  Supabase public anonymous key
  SUPABASE_SERVICE_ROLE_KEY        Supabase  Supabase service role key (server-only)
  VNPAY_TMN_CODE                   Payment   VNPay terminal merchant code
  VNPAY_HASH_SECRET                Payment   VNPay HMAC hash secret
  VNPAY_PAYMENT_URL                Payment   VNPay payment gateway URL
  MOMO_PARTNER_CODE                Payment   MoMo partner code
  MOMO_ACCESS_KEY                  Payment   MoMo access key
  MOMO_SECRET_KEY                  Payment   MoMo secret key
  MOMO_ENDPOINT                    Payment   MoMo API endpoint
  SHOPIFY_STORE_DOMAIN             Optional  Shopify store domain (if using Shopify)
  SHOPIFY_STOREFRONT_ACCESS_TOKEN  Optional  Shopify storefront token

  IMPORTANT: Never commit .env.local to git. It is already in .gitignore.
             The SUPABASE_SERVICE_ROLE_KEY must NEVER be exposed to the browser.

================================================================================
9. DATABASE SETUP (MIGRATIONS)
================================================================================

  Run these SQL files in order via the Supabase SQL Editor:

  Order  File                                      Description
  -----  ----------------------------------------  ----------------------------
   1     20260521000001_initial_schema.sql          Core tables: users, products,
                                                    orders, variants, inventory
   2     20260521000002_rls_policies.sql            Row-Level Security policies
   3     20260521000003_storage_buckets.sql         Supabase Storage buckets
   4     20260522000004_catalog_enhancements.sql    Product catalog improvements
   5     20260522000005_promotions_and_shipping.sql Promo codes & shipping zones
   6     20260522000009_functions_and_triggers.sql  DB functions & triggers
   7     20260522000010_orders_profile_fk.sql       Order-to-profile FK constraint
   8     20260523000001_remove_careers.sql          Remove careers table
   9     20260523000002_home_content_blocks.sql     CMS home content blocks
  10     20260524000001_email_templates.sql         Email template table
  11     20260524000001_phase_b_order_jobs.sql      Order job queue
  12     20260524000002_admin_notifications.sql     Admin notification system
  13     20260525000001_crm_core.sql                CRM customer tables
  14     20260525000002_admin_audit_logs.sql        Admin audit logging
  15     20260525000003_mis_dss_campaigns.sql       MIS/DSS campaign analytics
  16     20260529000001_inventory_enhancements.sql  Inventory improvements

================================================================================
10. AVAILABLE SCRIPTS
================================================================================

  npm run dev                    Start development server (localhost:3000)
  npm run build                  Build production bundle
  npm run start                  Start production server (after build)
  npm run lint                   Run ESLint code linting
  npm run test                   Run unit tests
  npm run db:seed                Seed Supabase with sample data
  npm run db:seed-email-templates  Seed email templates to DB
  npm run db:sync-assets         Sync product image assets

================================================================================
11. PROJECT STRUCTURE
================================================================================

  levents-clone/
  ├── app/                       # Next.js App Router
  │   ├── (store)/               # Storefront routes (customer-facing)
  │   │   ├── page.tsx           # Home page
  │   │   ├── collections/       # Product collections + filters
  │   │   ├── products/          # Product detail pages
  │   │   ├── checkout/          # Checkout flow
  │   │   ├── account/           # User dashboard
  │   │   ├── login/             # Authentication pages
  │   │   ├── register/
  │   │   ├── blog/              # Blog/editorial
  │   │   ├── search/            # Search results
  │   │   ├── about-us/          # Static info pages
  │   │   └── careers/
  │   ├── admin/                 # Admin Panel routes
  │   │   ├── page.tsx           # Admin dashboard (analytics overview)
  │   │   ├── products/          # Product management
  │   │   ├── orders/            # Order management
  │   │   ├── inventory/         # Inventory management
  │   │   ├── customers/         # CRM - customer profiles
  │   │   ├── collections/       # Collection management
  │   │   ├── promotions/        # Discount/voucher management
  │   │   ├── reports/           # MIS reports
  │   │   ├── executive/         # ESS executive dashboard
  │   │   ├── decision-support/  # DSS analytics
  │   │   ├── crm/               # CRM campaigns
  │   │   ├── notifications/     # Admin notifications
  │   │   ├── blog/              # CMS blog
  │   │   ├── home-content/      # CMS homepage editor
  │   │   ├── pages/             # CMS static pages
  │   │   ├── careers/           # Careers management
  │   │   ├── reviews/           # Review moderation
  │   │   └── settings/          # System settings
  │   ├── api/                   # REST API endpoints
  │   │   ├── v1/                # Versioned API routes
  │   │   ├── auth/              # Auth callbacks
  │   │   ├── products/          # Product endpoints
  │   │   ├── careers/           # Careers endpoints
  │   │   ├── admin/             # Admin-only endpoints
  │   │   └── webhooks/          # Payment webhooks (VNPay, MoMo)
  │   ├── layout.tsx             # Root layout (fonts, providers)
  │   ├── globals.css            # Global styles + CSS variables
  │   ├── robots.ts              # SEO robots.txt
  │   └── sitemap.ts             # Dynamic sitemap.xml
  │
  ├── components/
  │   ├── store/                 # Storefront components
  │   │   ├── header.tsx         # Navigation header
  │   │   ├── cart-drawer.tsx    # Slide-in cart
  │   │   ├── product-card.tsx   # Product card
  │   │   ├── product-detail.tsx # Full product detail view
  │   │   ├── product-grid.tsx   # Product listing grid
  │   │   ├── chat-widget.tsx    # AI chatbot widget
  │   │   └── ...               # Other store components
  │   ├── admin/                 # Admin panel components
  │   │   ├── sidebar.tsx        # Admin navigation
  │   │   ├── product-form.tsx   # Product CRUD form
  │   │   ├── inventory-table.tsx
  │   │   └── ...
  │   └── ui/                    # Reusable UI primitives (shadcn/ui)
  │       ├── button.tsx, input.tsx, dialog.tsx ...
  │       └── chart.tsx          # Recharts wrapper
  │
  ├── lib/                       # Shared utilities & integrations
  │   ├── supabase/              # Supabase client (client/server/admin)
  │   ├── commerce/              # Commerce layer (mock/supabase/shopify)
  │   ├── server/                # Server-only logic (payment, email)
  │   ├── auth/                  # Auth utilities
  │   ├── cart/                  # Cart state management
  │   ├── wishlist/              # Wishlist logic
  │   ├── home-content/          # CMS content helpers
  │   ├── brand.ts               # Brand constants (name, contact)
  │   ├── config.ts              # App configuration
  │   └── utils.ts               # cn() class utility
  │
  ├── hooks/                     # React custom hooks
  │   ├── use-chat.ts            # Chatbot hook
  │   ├── use-mobile.ts          # Mobile detection hook
  │   └── use-toast.ts           # Toast notification hook
  │
  ├── data/
  │   ├── mock/                  # Static mock data (products, blog, reviews)
  │   └── chat/                  # Chatbot knowledge base (policies, style guide)
  │
  ├── supabase/
  │   ├── migrations/            # 16 SQL migration files (run in order)
  │   └── seed.sql               # Basic seed data
  │
  ├── scripts/                   # Utility scripts
  │   ├── seed-supabase.ts       # Seed database with demo data
  │   ├── make-admin.ts          # Grant admin role to a user
  │   ├── reset-password.ts      # Reset user password via CLI
  │   ├── seed-email-templates.ts
  │   └── sync-product-assets.ts
  │
  ├── tests/                     # Unit tests
  │   ├── admin-analytics.test.ts
  │   ├── mock-commerce.test.ts
  │   └── promotion-formula.test.ts
  │
  ├── public/                    # Static assets (icons, placeholder images)
  ├── styles/                    # Additional stylesheets
  ├── middleware.ts              # Next.js middleware (auth, redirects)
  ├── next.config.mjs            # Next.js configuration (image domains)
  ├── tsconfig.json              # TypeScript configuration
  ├── .env.example               # Environment variables template
  └── package.json               # Dependencies and scripts

================================================================================
12. ADMIN PANEL ACCESS
================================================================================

  URL: http://localhost:3000/admin

  Default admin setup after Supabase installation:
  1. Register a new account at /register with any email
  2. Run: npx tsx scripts/make-admin.ts your@email.com
  3. Login again — you will now have admin access

  The admin panel is protected by middleware. Non-admin users are
  automatically redirected to the storefront homepage.

  Admin sections and required roles:
  - /admin                → Overview dashboard (admin)
  - /admin/products       → Manage products (admin)
  - /admin/orders         → Manage orders (admin)
  - /admin/inventory      → Inventory control (admin)
  - /admin/customers      → CRM (admin)
  - /admin/executive      → Executive ESS (admin)
  - /admin/settings       → System config (admin)

================================================================================
13. DEPLOYMENT (VERCEL)
================================================================================

  Recommended deployment: Vercel (free tier available)

  STEP 1: Push your code to GitHub
    git add .
    git commit -m "Initial commit"
    git push origin main

  STEP 2: Import project at https://vercel.com/new

  STEP 3: Add environment variables in Vercel project settings
    Add all variables from .env.example with your real values.
    Set NEXT_PUBLIC_APP_URL to your Vercel domain (e.g. https://myapp.vercel.app)

  STEP 4: Deploy
    Vercel will automatically build and deploy on every push to main.

  Build command (auto-detected): npm run build
  Output directory (auto-detected): .next

  IMPORTANT: After deploying, update NEXT_PUBLIC_APP_URL to your live URL.
             This is required for correct OAuth redirects and email links.

================================================================================
14. TROUBLESHOOTING
================================================================================

  ISSUE: "Cannot find module" error on npm run dev
  SOLUTION: Run "npm install" again. Make sure you are in the project root.

  ISSUE: Admin panel redirects to homepage
  SOLUTION: You need an admin role. Run: npx tsx scripts/make-admin.ts your@email.com
            Make sure SUPABASE_SERVICE_ROLE_KEY is set in .env.local

  ISSUE: Images not loading from Supabase
  SOLUTION: Check that your Supabase Storage bucket is set to public.
            Go to Supabase > Storage > your-bucket > Make Public.

  ISSUE: "Invalid API key" from Supabase
  SOLUTION: Double-check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
            in .env.local. Make sure there are no trailing spaces.

  ISSUE: App shows blank/mock data even in Supabase mode
  SOLUTION: Check COMMERCE_PROVIDER=supabase is set (not "mock") in .env.local.
            Restart the dev server after changing .env.local.

  ISSUE: VNPay/MoMo payment not working
  SOLUTION: Payment gateways require sandbox keys. Register at:
            VNPay: https://sandbox.vnpayment.vn/
            MoMo:  https://business.momo.vn/
            These only work in production with a registered merchant account.

  ISSUE: Build fails with TypeScript errors
  SOLUTION: Run "npm run lint" first to identify issues.
            TypeScript version must match: 5.7.x

  ISSUE: __pycache__ folder appears in project
  SOLUTION: This is from old Python doc-editing scripts. Safe to delete.
            Add to .gitignore: __pycache__/, *.pyc

================================================================================
15. LICENSE & CREDITS
================================================================================

  This project was built as an academic final thesis (Báo Cáo Chuyên Đề)
  demonstrating enterprise information systems concepts:
    - Transaction Processing System (TPS)
    - Management Information System (MIS)
    - Decision Support System (DSS)
    - Executive Support System (ESS)
    - Customer Relationship Management (CRM)

  Built with:
  - Next.js — https://nextjs.org/ (MIT License)
  - Supabase — https://supabase.com/ (Apache 2.0)
  - Tailwind CSS — https://tailwindcss.com/ (MIT License)
  - Radix UI — https://radix-ui.com/ (MIT License)
  - Recharts — https://recharts.org/ (MIT License)
  - Lucide React — https://lucide.dev/ (ISC License)

  Brand: B&D® — Vietnamese Streetwear (fictional brand for academic purposes)
  Inspired by: Levents® (https://levents.asia/)

  Author   : baoquocnguyn148
  Platform : UEF University — Information Systems Major
  Year     : 2026

================================================================================
  END OF README
================================================================================
