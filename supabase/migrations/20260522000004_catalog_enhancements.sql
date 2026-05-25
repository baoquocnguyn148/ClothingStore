-- Migration 4: Catalog Enhancements
-- Run after 20260521000003_storage_buckets.sql

-- ============ 1. Categories (normalize products.category TEXT) ============
CREATE TABLE categories (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug       TEXT NOT NULL UNIQUE,
  name       TEXT NOT NULL,
  parent_id  UUID REFERENCES categories(id) ON DELETE SET NULL,
  image_url  TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  published  BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_categories_parent ON categories(parent_id);
CREATE INDEX idx_categories_slug   ON categories(slug);

-- Add FK to products (keep TEXT column for migration compatibility)
ALTER TABLE products ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES categories(id) ON DELETE SET NULL;
CREATE INDEX idx_products_category ON products(category_id);

-- ============ 2. Full-text search on products ============
ALTER TABLE products ADD COLUMN IF NOT EXISTS fts tsvector
  GENERATED ALWAYS AS (
    to_tsvector('simple',
      coalesce(title, '') || ' ' || coalesce(description, '')
    )
  ) STORED;
CREATE INDEX idx_products_fts ON products USING GIN(fts);

-- ============ 3. Product Reviews ============
CREATE TABLE product_reviews (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id  UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  order_id    UUID REFERENCES orders(id) ON DELETE SET NULL,
  rating      SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title       TEXT,
  body        TEXT,
  images      JSONB NOT NULL DEFAULT '[]',
  verified    BOOLEAN NOT NULL DEFAULT false,  -- verified purchase
  published   BOOLEAN NOT NULL DEFAULT false,  -- admin must approve
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, product_id, order_id)
);
CREATE INDEX idx_reviews_product   ON product_reviews(product_id) WHERE published = true;
CREATE INDEX idx_reviews_user      ON product_reviews(user_id);
CREATE INDEX idx_reviews_pending   ON product_reviews(published, created_at DESC) WHERE published = false;

-- ============ 4. Media Assets Library ============
CREATE TABLE media_assets (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bucket      TEXT NOT NULL DEFAULT 'public',
  path        TEXT NOT NULL UNIQUE,
  url         TEXT NOT NULL,
  mime_type   TEXT,
  width       INT,
  height      INT,
  size_bytes  INT,
  alt         TEXT,
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_media_bucket ON media_assets(bucket, created_at DESC);

-- ============ 5. Stock Alert Config ============
-- variant_id NULL = global default; variant_id NOT NULL = per-variant override
CREATE TABLE stock_alert_config (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  variant_id          UUID UNIQUE REFERENCES product_variants(id) ON DELETE CASCADE,
  low_stock_threshold INT NOT NULL DEFAULT 5,
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Insert global default (threshold = 5)
INSERT INTO stock_alert_config (low_stock_threshold) VALUES (5);

-- ============ RLS Policies ============
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read categories" ON categories
  FOR SELECT USING (published = true);

ALTER TABLE product_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read published reviews" ON product_reviews
  FOR SELECT USING (published = true);
CREATE POLICY "Users read own reviews" ON product_reviews
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert reviews" ON product_reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

ALTER TABLE media_assets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read media" ON media_assets
  FOR SELECT USING (true);

-- stock_alert_config: no public access (service role only)
ALTER TABLE stock_alert_config ENABLE ROW LEVEL SECURITY;
