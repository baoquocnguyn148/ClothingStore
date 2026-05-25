# 🏗️ Technical Architecture Guide

## Current Stack

```
Frontend:
├── Next.js 16 (App Router)
├── React 19
├── TailwindCSS 4
├── shadcn/ui (Radix UI)
├── Zustand (cart state)
├── React Hook Form
└── TypeScript

Backend:
├── Next.js API Routes
├── Supabase (PostgreSQL + Auth)
├── TypeScript
├── Environment variables

Integrations:
├── Shopify Storefront API (optional)
├── Unsplash (images)
└── Google Analytics

Deployment:
└── Vercel (recommended)
```

---

## Proposed Additions

### Frontend Libraries to Add

```json
{
  "search-optimization": {
    "react-use-trace-update": "trace React re-renders",
    "swr": "data fetching & caching",
    "react-query": "server state management (optional)"
  },
  "forms-validation": {
    "zod": "TypeScript-first schema validation",
    "react-hook-form": "already have, pairs well with Zod"
  },
  "ui-enhancements": {
    "framer-motion": "animations & micro-interactions",
    "react-hot-toast": "notifications (already similar)",
    "cmdk": "command palette / search (already have)"
  },
  "analytics": {
    "gtag": "Google Analytics 4",
    "mixpanel": "advanced analytics (optional)"
  },
  "testing": {
    "vitest": "unit testing",
    "@testing-library/react": "component testing",
    "@playwright/test": "e2e testing"
  }
}
```

### Backend Services to Add

```
Infrastructure:
├── Redis (caching & sessions)
├── Elasticsearch/Meilisearch (advanced search)
├── S3-compatible storage (images)
├── Message queue (Bull/RabbitMQ)
└── Monitoring (DataDog/NewRelic)

APIs & Webhooks:
├── VNPay payment API
├── GHN/Ahamove logistics
├── SendGrid/Resend (email)
├── Twilio (SMS)
└── Segment (CDP)

Admin Tools:
├── Prisma Studio (DB management)
├── API documentation (Swagger)
└── Admin panel generator
```

---

## Feature-by-Feature Technical Design

### 1️⃣ Search & Filters

**Architecture:**

```
User Input
    ↓
Frontend: Search Component (debounced)
    ↓
API Route: /api/v1/products/search?query=...&filters=...
    ↓
Backend Logic:
    ├── Parse query & filters
    ├── Build SQL WHERE clause
    ├── Apply sorting
    ├── Pagination (limit 20)
    └── Cache results (Redis)
    ↓
Response: { products: [], total: 100, page: 1 }
    ↓
Frontend: Product Grid (with loading states)
```

**Database Queries (Optimized):**

```sql
-- Indexed query for search
SELECT id, title, price, image, rating
FROM products
WHERE published = true
  AND (title ILIKE '%search%' OR description ILIKE '%search%')
  AND price BETWEEN $minPrice AND $maxPrice
  AND tags @> ARRAY[$tags]::text[]
ORDER BY created_at DESC
LIMIT 20 OFFSET $offset;

-- Create indexes
CREATE INDEX idx_products_title ON products USING gin(to_tsvector('english', title));
CREATE INDEX idx_products_tags ON products USING gin(tags);
CREATE INDEX idx_products_price ON products(price);
```

**Frontend Component Structure:**

```tsx
<SearchPage>
  <SearchInput onChange={handleSearch} />
  <FilterSidebar filters={filters} onChange={handleFilter} />
  <ProductGrid products={products} loading={loading} />
  <Pagination current={page} total={total} />
</SearchPage>
```

---

### 2️⃣ Product Reviews

**Database Schema:**

```sql
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id),
  user_id UUID NOT NULL REFERENCES users(id),
  rating INT CHECK (rating >= 1 AND rating <= 5),
  title VARCHAR(255),
  content TEXT,
  verified_purchase BOOLEAN,
  helpful_count INT DEFAULT 0,
  unhelpful_count INT DEFAULT 0,
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  images JSON, -- URLs to review photos
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(product_id, user_id) -- one review per product per user
);

CREATE INDEX idx_reviews_product_id ON reviews(product_id);
CREATE INDEX idx_reviews_status ON reviews(status);
```

**API Endpoints:**

```
GET /api/v1/products/:id/reviews?sort=helpful&page=1
POST /api/v1/products/:id/reviews (requires auth)
PATCH /api/v1/reviews/:id (admin only)
DELETE /api/v1/reviews/:id (admin only)
POST /api/v1/reviews/:id/helpful (mark as helpful)
```

**Frontend Flow:**

```tsx
<ReviewsSection>
  <ReviewStats average={4.2} count={125} />
  <ReviewFilters sort={sortBy} rating={filterRating} />
  <ReviewList reviews={reviews} />
  <WriteReview onSubmit={submitReview} />
</ReviewsSection>
```

---

### 3️⃣ Payment Processing (VNPay)

**Flow Diagram:**

```
Customer → Add to Cart → Checkout
    ↓
Frontend: Payment Method Selection
    ↓
POST /api/v1/payments/vnpay
    ↓
Backend:
  ├── Create order in DB
  ├── Generate VNPay payment URL
  ├── Return redirect URL
    ↓
Frontend: Redirect to VNPay
    ↓
Customer: Complete payment on VNPay
    ↓
VNPay IPN Webhook → /api/v1/payments/vnpay-callback
    ↓
Backend:
  ├── Verify IPN signature
  ├── Update order status
  ├── Send confirmation email
  ├── Update inventory
    ↓
Database: Order marked PAID
    ↓
Frontend: Show confirmation
```

**Implementation:**

```typescript
// lib/payment/vnpay.ts
export class VNPayClient {
  private sortedData: Record<string, any>;
  
  constructor(private config: VNPayConfig) {}
  
  generatePaymentURL(order: Order): string {
    const data = {
      vnp_Version: '2.1.0',
      vnp_Command: 'pay',
      vnp_TmnCode: this.config.tmnCode,
      vnp_Amount: order.total * 100, // VNPay expects cents
      vnp_CurrCode: 'VND',
      vnp_TxnRef: order.id,
      vnp_OrderInfo: `Order ${order.id}`,
      vnp_OrderType: 'other',
      vnp_ReturnUrl: `${this.config.returnUrl}/payment-result`,
      vnp_Url: this.config.apiUrl,
      vnp_CreateDate: formatDate(new Date()),
      vnp_IpAddr: clientIp,
    };
    
    // Sort and hash
    const signedData = this.sortData(data);
    const signature = this.hmacSHA512(signedData);
    
    return `${this.config.apiUrl}?${signedData}&vnp_SecureHash=${signature}`;
  }
  
  verifyIPNData(data: Record<string, any>): boolean {
    const signature = data.vnp_SecureHash;
    const sortedData = this.sortData(data);
    const computedSignature = this.hmacSHA512(sortedData);
    return signature === computedSignature;
  }
}
```

**Database Schema:**

```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  status ENUM('pending', 'paid', 'failed', 'cancelled') DEFAULT 'pending',
  total_amount DECIMAL(10, 2),
  items JSON, -- cart items
  shipping_address JSONB,
  billing_address JSONB,
  payment_method VARCHAR(50),
  payment_ref VARCHAR(255), -- VNPay transaction ID
  created_at TIMESTAMP DEFAULT NOW(),
  paid_at TIMESTAMP,
  shipped_at TIMESTAMP,
  delivered_at TIMESTAMP
);

CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
```

---

### 4️⃣ Order Management

**Order Lifecycle:**

```
Pending → Paid → Processing → Shipped → Delivered → Completed
              ↘ Failed (refund)
              ↘ Cancelled
```

**Backend State Machine:**

```typescript
type OrderStatus = 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'failed' | 'cancelled';

const transitionMap: Record<OrderStatus, OrderStatus[]> = {
  pending: ['paid', 'cancelled'],
  paid: ['processing', 'failed'],
  processing: ['shipped'],
  shipped: ['delivered'],
  delivered: ['completed'],
  failed: ['pending'], // retry
  cancelled: [], // terminal
};

function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  return transitionMap[from].includes(to);
}
```

**API Endpoints:**

```
GET /api/v1/orders (user's orders)
GET /api/v1/orders/:id (order details)
POST /api/v1/orders (create from cart)
PATCH /api/v1/orders/:id (admin: update status)
POST /api/v1/orders/:id/cancel (user: cancel if pending)
POST /api/v1/orders/:id/return (user: request return)
```

---

### 5️⃣ Admin Product CRUD

**Protected Routes:**

```typescript
// middleware.ts or API route
function requireAdmin(req: NextRequest): boolean {
  const user = getAuthUser(req);
  return user?.role === 'admin' || user?.email?.endsWith('@bd.local');
}
```

**Form Validation:**

```typescript
import { z } from 'zod';

const ProductSchema = z.object({
  title: z.string().min(3).max(255),
  description: z.string().min(10),
  price: z.number().positive(),
  category: z.enum(['tee', 'cap', 'hoodie', 'shorts']),
  images: z.array(z.string().url()).min(1),
  colors: z.array(z.object({
    name: z.string(),
    hex: z.string().regex(/^#[0-9A-F]{6}$/i)
  })),
  sizes: z.array(z.string()),
  tags: z.array(z.string()),
  stock: z.number().int().positive(),
});

type ProductInput = z.infer<typeof ProductSchema>;
```

**Bulk Upload CSV:**

```typescript
// /api/v1/admin/products/bulk-upload
// Accept multipart/form-data with CSV file
// Parse CSV → validate each row → insert into DB
```

---

## Performance Optimization

### Frontend Optimization

```typescript
// Code splitting
const ProductReviews = dynamic(() => import('./reviews'), {
  loading: () => <Skeleton />,
  ssr: false, // or true based on SEO needs
});

// Image optimization
<Image
  src={product.image}
  alt={product.title}
  width={400}
  height={500}
  quality={75}
  priority={isPriority}
  sizes="(max-width: 768px) 100vw, 50vw"
/>

// Query optimization with SWR
const { data: products } = useSWR(
  `/api/products?q=${search}`,
  fetcher,
  { revalidateOnFocus: false, revalidateOnReconnect: true }
);
```

### Backend Optimization

```typescript
// Database connection pooling
import { createPool } from '@vercel/postgres';

const pool = createPool({
  connectionString: process.env.DATABASE_URL,
  maxConnections: 10,
});

// Caching with Redis
const redis = new Redis(process.env.REDIS_URL);

async function getCachedProducts(query: string) {
  const cached = await redis.get(`products:${query}`);
  if (cached) return JSON.parse(cached);
  
  const products = await db.query(/* ... */);
  await redis.setex(`products:${query}`, 3600, JSON.stringify(products));
  return products;
}

// Pagination
function paginate(page: number, limit: number = 20) {
  return {
    skip: (page - 1) * limit,
    take: limit,
  };
}
```

---

## Monitoring & Logging

```typescript
// Error tracking (Sentry)
import * as Sentry from "@sentry/nextjs";

export async function POST(req: NextRequest) {
  try {
    // handler
  } catch (error) {
    Sentry.captureException(error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

// Logging
import pino from 'pino';
const logger = pino();

logger.info({ orderId, amount }, 'Payment processed');
logger.error({ error }, 'Payment failed');
```

---

## Security Best Practices

```typescript
// Input validation
import { z } from 'zod';

// Rate limiting
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // max 100 requests per windowMs
  message: 'Too many requests',
});

// CORS
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(','),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
};

// SQL injection prevention (use prepared statements)
const { data } = await supabase
  .from('products')
  .select('*')
  .eq('id', productId) // parameterized query
  .single();
```

---

## Testing Strategy

```typescript
// Unit test
import { describe, it, expect } from 'vitest';
import { calculateDiscount } from '@/lib/pricing';

describe('calculateDiscount', () => {
  it('should calculate 10% discount', () => {
    expect(calculateDiscount(100, 0.1)).toBe(90);
  });
});

// Integration test
import { createMocks } from 'node-mocks-http';
import { POST } from '@/app/api/v1/orders';

describe('/api/v1/orders', () => {
  it('should create an order', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: { items: [...] },
    });
    
    await POST(req, res);
    expect(res._getStatusCode()).toBe(201);
  });
});

// E2E test
import { test, expect } from '@playwright/test';

test('checkout flow', async ({ page }) => {
  await page.goto('/products');
  await page.click('text=Add to cart');
  await page.click('text=Checkout');
  await page.fill('input[name=email]', 'test@example.com');
  await page.click('text=Place order');
  await expect(page).toHaveURL('/order-confirmation');
});
```

---

## Deployment Checklist

```
Before Production:
- [ ] All tests passing
- [ ] Security audit completed
- [ ] Performance tested (Lighthouse > 90)
- [ ] Database backups setup
- [ ] Environment variables configured
- [ ] SSL certificates valid
- [ ] CDN configured
- [ ] Monitoring alerts setup
- [ ] Error tracking setup
- [ ] Analytics tracking verified

During Deployment:
- [ ] Deploy to staging first
- [ ] Smoke tests on staging
- [ ] Blue-green deployment if possible
- [ ] Database migrations tested

After Deployment:
- [ ] Monitor error rates
- [ ] Check performance metrics
- [ ] Verify all features working
- [ ] Monitor customer feedback
- [ ] Be ready to rollback if needed
```

---

**Last Updated:** 22/05/2026  
**Status:** Ready to implement Phase 1
