-- B&D E-commerce Schema
-- Extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Enums
CREATE TYPE order_status AS ENUM (
  'draft', 'pending_payment', 'paid', 'confirmed',
  'shipping', 'delivered', 'cancelled', 'refunded'
);
CREATE TYPE payment_status AS ENUM (
  'pending', 'processing', 'completed', 'failed', 'cancelled'
);
CREATE TYPE payment_provider AS ENUM ('vnpay', 'momo', 'zalopay', 'cod');
CREATE TYPE user_role AS ENUM ('customer', 'admin');

-- ============ CATALOG ============
CREATE TABLE collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  handle TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  handle TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  base_price INT NOT NULL DEFAULT 0,
  compare_at_price INT,
  category TEXT NOT NULL DEFAULT 'general',
  published BOOLEAN NOT NULL DEFAULT true,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  alt TEXT,
  sort_order INT NOT NULL DEFAULT 0
);

CREATE TABLE product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  sku TEXT NOT NULL UNIQUE,
  size TEXT NOT NULL,
  color_name TEXT NOT NULL,
  color_hex TEXT NOT NULL DEFAULT '#000000',
  price INT NOT NULL,
  stock_qty INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL
);

CREATE TABLE product_tag_assignments (
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (product_id, tag_id)
);

CREATE TABLE collection_products (
  collection_id UUID NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  sort_order INT NOT NULL DEFAULT 0,
  PRIMARY KEY (collection_id, product_id)
);

CREATE TABLE inventory_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  variant_id UUID NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
  delta INT NOT NULL,
  reason TEXT NOT NULL DEFAULT 'adjustment',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============ IDENTITY ============
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT '',
  phone TEXT,
  membership_tier TEXT NOT NULL DEFAULT 'standard',
  role user_role NOT NULL DEFAULT 'customer',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address_line TEXT NOT NULL,
  city TEXT NOT NULL,
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============ COMMERCE ============
CREATE TABLE carts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  guest_session_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT carts_owner_check CHECK (user_id IS NOT NULL OR guest_session_id IS NOT NULL)
);

CREATE UNIQUE INDEX carts_user_id_unique ON carts(user_id) WHERE user_id IS NOT NULL;
CREATE UNIQUE INDEX carts_guest_session_unique ON carts(guest_session_id) WHERE guest_session_id IS NOT NULL;

CREATE TABLE cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id UUID NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
  variant_id UUID NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
  quantity INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
  unit_price INT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (cart_id, variant_id)
);

CREATE TABLE wishlist_items (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, product_id)
);

CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT NOT NULL UNIQUE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status order_status NOT NULL DEFAULT 'pending_payment',
  subtotal INT NOT NULL DEFAULT 0,
  shipping_fee INT NOT NULL DEFAULT 0,
  total INT NOT NULL DEFAULT 0,
  shipping_address JSONB NOT NULL DEFAULT '{}',
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  variant_id UUID REFERENCES product_variants(id) ON DELETE SET NULL,
  product_title TEXT NOT NULL,
  variant_size TEXT NOT NULL,
  variant_color TEXT NOT NULL,
  unit_price INT NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  image_url TEXT
);

CREATE TABLE order_status_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  from_status order_status,
  to_status order_status NOT NULL,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  provider payment_provider NOT NULL,
  status payment_status NOT NULL DEFAULT 'pending',
  amount INT NOT NULL,
  transaction_ref TEXT,
  payment_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE payment_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id UUID NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
  gateway_event_id TEXT NOT NULL UNIQUE,
  payload JSONB NOT NULL DEFAULT '{}',
  processed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============ CONTENT & HR ============
CREATE TABLE blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  excerpt TEXT NOT NULL DEFAULT '',
  image_url TEXT NOT NULL,
  published_at DATE,
  published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE blog_post_products (
  blog_post_id UUID NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  PRIMARY KEY (blog_post_id, product_id)
);

CREATE TABLE cms_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  html_content TEXT NOT NULL DEFAULT '',
  published BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============ INDEXES ============
CREATE INDEX idx_products_handle ON products(handle);
CREATE INDEX idx_products_published ON products(published) WHERE deleted_at IS NULL;
CREATE INDEX idx_product_variants_product ON product_variants(product_id);
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_cart_items_cart ON cart_items(cart_id);
CREATE INDEX idx_payments_order ON payments(order_id);

-- ============ TRIGGERS ============
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER collections_updated_at BEFORE UPDATE ON collections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER carts_updated_at BEFORE UPDATE ON carts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (user_id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Order number generator
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
  seq INT;
BEGIN
  SELECT COUNT(*) + 1 INTO seq FROM orders;
  RETURN 'BD' || to_char(now(), 'YYMMDD') || lpad(seq::text, 4, '0');
END;
$$ LANGUAGE plpgsql;

-- Reserve stock RPC
CREATE OR REPLACE FUNCTION reserve_order_stock(p_order_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  item RECORD;
BEGIN
  FOR item IN
    SELECT oi.variant_id, oi.quantity
    FROM order_items oi
    WHERE oi.order_id = p_order_id AND oi.variant_id IS NOT NULL
  LOOP
    UPDATE product_variants
    SET stock_qty = stock_qty - item.quantity
    WHERE id = item.variant_id AND stock_qty >= item.quantity AND is_active = true;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'Insufficient stock for variant %', item.variant_id;
    END IF;
  END LOOP;
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- Enable RLS
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_tag_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_status_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_post_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_pages ENABLE ROW LEVEL SECURITY;

-- Public catalog read
CREATE POLICY "Public read collections" ON collections FOR SELECT USING (published = true);
CREATE POLICY "Public read products" ON products FOR SELECT USING (published = true AND deleted_at IS NULL);
CREATE POLICY "Public read product_images" ON product_images FOR SELECT USING (true);
CREATE POLICY "Public read product_variants" ON product_variants FOR SELECT USING (is_active = true);
CREATE POLICY "Public read tags" ON tags FOR SELECT USING (true);
CREATE POLICY "Public read product_tags" ON product_tag_assignments FOR SELECT USING (true);
CREATE POLICY "Public read collection_products" ON collection_products FOR SELECT USING (true);
CREATE POLICY "Public read blog" ON blog_posts FOR SELECT USING (published = true);
CREATE POLICY "Public read blog_products" ON blog_post_products FOR SELECT USING (true);
CREATE POLICY "Public read cms" ON cms_pages FOR SELECT USING (published = true);

-- Profiles
CREATE POLICY "Users read own profile" ON profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users update own profile" ON profiles FOR UPDATE USING (auth.uid() = user_id);

-- Addresses
CREATE POLICY "Users manage own addresses" ON addresses FOR ALL USING (auth.uid() = user_id);

-- Carts: user or guest via service role for guest
CREATE POLICY "Users read own cart" ON carts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own cart" ON carts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own cart" ON carts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own cart" ON carts FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users read own cart items" ON cart_items FOR SELECT
  USING (EXISTS (SELECT 1 FROM carts c WHERE c.id = cart_id AND c.user_id = auth.uid()));
CREATE POLICY "Users manage own cart items" ON cart_items FOR ALL
  USING (EXISTS (SELECT 1 FROM carts c WHERE c.id = cart_id AND c.user_id = auth.uid()));

-- Wishlist
CREATE POLICY "Users manage wishlist" ON wishlist_items FOR ALL USING (auth.uid() = user_id);

-- Orders
CREATE POLICY "Users read own orders" ON orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own orders" ON orders FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users read own order items" ON order_items FOR SELECT
  USING (EXISTS (SELECT 1 FROM orders o WHERE o.id = order_id AND o.user_id = auth.uid()));

CREATE POLICY "Users read own order logs" ON order_status_logs FOR SELECT
  USING (EXISTS (SELECT 1 FROM orders o WHERE o.id = order_id AND o.user_id = auth.uid()));

-- Payments: no public access (service role only)
-- Storage buckets (run via Supabase dashboard or API if INSERT fails)
INSERT INTO storage.buckets (id, name, public) VALUES
  ('product-images', 'product-images', true),
  ('blog-images', 'blog-images', true),
  ('user-uploads', 'user-uploads', false)
ON CONFLICT (id) DO NOTHING;
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
-- Migration 5: Promotions & Shipping
-- Run after 20260522000004_catalog_enhancements.sql

-- ============ 1. Promotions (Flexible Formula System) ============
CREATE TYPE promotion_type AS ENUM (
  'percentage', 'fixed_amount', 'free_shipping', 'buy_x_get_y', 'custom'
);
CREATE TYPE promotion_target AS ENUM ('cart', 'product', 'collection', 'category');
CREATE TYPE promotion_apply_mode AS ENUM ('auto', 'code');

CREATE TABLE promotions (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code             TEXT UNIQUE, -- NULL if auto-applied
  name             TEXT NOT NULL,
  description      TEXT,
  type             promotion_type NOT NULL,
  apply_mode       promotion_apply_mode NOT NULL DEFAULT 'code',
  value            INT NOT NULL DEFAULT 0,
  max_discount     INT,
  min_order_value  INT NOT NULL DEFAULT 0,
  min_qty          INT NOT NULL DEFAULT 1,
  target           promotion_target NOT NULL DEFAULT 'cart',
  target_ids       UUID[] NOT NULL DEFAULT '{}',
  buy_qty          INT,
  get_qty          INT,
  get_product_id   UUID REFERENCES products(id) ON DELETE SET NULL,
  
  -- Custom rule JSONB formula (e.g. {"conditions": [...], "action": {...}})
  custom_rule      JSONB,
  
  max_uses         INT, -- global usage limit
  uses_per_user    INT NOT NULL DEFAULT 1,
  usage_count      INT NOT NULL DEFAULT 0,
  starts_at        TIMESTAMPTZ,
  expires_at       TIMESTAMPTZ,
  published        BOOLEAN NOT NULL DEFAULT true,
  created_by       UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_promotions_code ON promotions(code) WHERE code IS NOT NULL;
CREATE INDEX idx_promotions_active ON promotions(published, starts_at, expires_at);

-- Usage tracking to enforce uses_per_user
CREATE TABLE promotion_usages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  promotion_id    UUID NOT NULL REFERENCES promotions(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  order_id        UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  discount_amount INT NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (promotion_id, order_id) -- one usage per order
);
CREATE INDEX idx_promo_usages_user ON promotion_usages(user_id, promotion_id);

-- ============ 2. Extend Orders ============
ALTER TABLE orders ADD COLUMN IF NOT EXISTS promotion_id     UUID REFERENCES promotions(id) ON DELETE SET NULL;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount_amount  INT NOT NULL DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS promotion_code   TEXT;

-- ============ 3. Shipping Zones ============
CREATE TABLE shipping_zones (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  provinces   TEXT[] NOT NULL DEFAULT '{}', -- e.g., ['HềEChí Minh', 'Hà Nội']
  fee         INT NOT NULL DEFAULT 0,
  free_above  INT, -- Free shipping if order total > this
  published   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_shipping_zones_provinces ON shipping_zones USING GIN(provinces);

-- Default fallback zone for unmapped provinces
INSERT INTO shipping_zones (name, provinces, fee, free_above, published)
VALUES ('Toàn quốc (Mặc định)', '{}', 35000, 1000000, true);

-- ============ RLS Policies ============
ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read active promotions" ON promotions
  FOR SELECT USING (published = true AND (expires_at IS NULL OR expires_at > now()));

ALTER TABLE shipping_zones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read active shipping zones" ON shipping_zones
  FOR SELECT USING (published = true);

ALTER TABLE promotion_usages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access on usages" ON promotion_usages
  USING (true);

-- ============ 4. RPCs ============
CREATE OR REPLACE FUNCTION increment_promotion_usage(p_promo_id UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE promotions
  SET usage_count = usage_count + 1
  WHERE id = p_promo_id;
END;
$$;

CREATE TABLE IF NOT EXISTS home_content_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  section TEXT NOT NULL,
  label TEXT NOT NULL,
  value TEXT NOT NULL DEFAULT '',
  type TEXT NOT NULL DEFAULT 'text' CHECK (type IN ('text', 'textarea', 'url')),
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_home_content_blocks_sort
  ON home_content_blocks(sort_order);

ALTER TABLE home_content_blocks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read home content" ON home_content_blocks;
CREATE POLICY "Public read home content" ON home_content_blocks
  FOR SELECT USING (true);

CREATE TRIGGER home_content_blocks_updated_at
  BEFORE UPDATE ON home_content_blocks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
-- Migration 9: DB Functions & Triggers
-- Run after migration 4 (requires stock_alert_config, admin_notifications,
-- membership_tier, membership_tier_config from migration 6)
-- NOTE: Some of these depend on tables from migrations 5, 6, 7.
-- Run after ALL migrations are applied.

-- ============ 1. Fix order_number race condition ============
CREATE SEQUENCE IF NOT EXISTS order_seq START 1000 INCREMENT 1;

CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT LANGUAGE plpgsql AS $$
BEGIN
  RETURN 'BD' || to_char(now(), 'YYMMDD') || lpad(nextval('order_seq')::text, 5, '0');
END;
$$;

-- ============ 2. Auto low-stock / out-of-stock admin notification ============
CREATE OR REPLACE FUNCTION check_low_stock()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_threshold  INT;
  v_prod_title TEXT;
BEGIN
  -- Resolve threshold: per-variant config > global default > hardcoded 5
  SELECT COALESCE(
    (SELECT low_stock_threshold FROM stock_alert_config
     WHERE variant_id = NEW.id LIMIT 1),
    (SELECT low_stock_threshold FROM stock_alert_config
     WHERE variant_id IS NULL LIMIT 1),
    5
  ) INTO v_threshold;

  SELECT p.title INTO v_prod_title
  FROM products p WHERE p.id = NEW.product_id;

  -- Out of stock
  IF NEW.stock_qty = 0 AND (OLD.stock_qty IS NULL OR OLD.stock_qty > 0) THEN
    INSERT INTO admin_notifications (type, title, body, entity, entity_id)
    VALUES (
      'out_of_stock',
      'Hết hàng: ' || v_prod_title,
      'SKU ' || NEW.sku || ' đã hết hàng (trước: ' || COALESCE(OLD.stock_qty, 0) || ')',
      'product_variants',
      NEW.id
    );

  -- Low stock crossing threshold going down
  ELSIF NEW.stock_qty > 0
    AND NEW.stock_qty <= v_threshold
    AND (OLD.stock_qty IS NULL OR OLD.stock_qty > v_threshold) THEN
    INSERT INTO admin_notifications (type, title, body, entity, entity_id)
    VALUES (
      'low_stock',
      'Sắp hết hàng: ' || v_prod_title,
      'SKU ' || NEW.sku || ' còn ' || NEW.stock_qty || ' cái (ngưỡng cảnh báo: ' || v_threshold || ')',
      'product_variants',
      NEW.id
    );
  END IF;

  RETURN NEW;
END;
$$;

-- Drop old trigger if exists, recreate
DROP TRIGGER IF EXISTS trg_low_stock ON product_variants;
CREATE TRIGGER trg_low_stock
  AFTER INSERT OR UPDATE OF stock_qty ON product_variants
  FOR EACH ROW EXECUTE FUNCTION check_low_stock();

-- ============ 3. Auto membership tier upgrade ============
-- Depends on: membership_tier ENUM + membership_tier_config (migration 6)
-- This function is safe to create now; calling it before migration 6 will fail gracefully.
CREATE OR REPLACE FUNCTION update_membership_tier(p_user_id UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_total_spent BIGINT;
  v_new_tier    TEXT;
BEGIN
  -- Sum all confirmed/delivered order totals
  SELECT COALESCE(SUM(total), 0) INTO v_total_spent
  FROM orders
  WHERE user_id = p_user_id
    AND status IN ('delivered', 'confirmed');

  -- Find highest qualifying tier
  SELECT tier::TEXT INTO v_new_tier
  FROM membership_tier_config
  WHERE min_spent <= v_total_spent
  ORDER BY min_spent DESC
  LIMIT 1;

  IF v_new_tier IS NOT NULL THEN
    UPDATE profiles
    SET membership_tier = v_new_tier::membership_tier,
        updated_at = now()
    WHERE user_id = p_user_id;
  END IF;
EXCEPTION
  WHEN OTHERS THEN NULL; -- safe: runs after migration 6
END;
$$;

-- Trigger: upgrade membership on order delivered/confirmed
CREATE OR REPLACE FUNCTION on_order_status_change()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.status IN ('delivered', 'confirmed')
    AND (OLD.status IS NULL OR OLD.status NOT IN ('delivered', 'confirmed')) THEN
    PERFORM update_membership_tier(NEW.user_id);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_order_status_change ON orders;
CREATE TRIGGER trg_order_status_change
  AFTER INSERT OR UPDATE OF status ON orders
  FOR EACH ROW EXECUTE FUNCTION on_order_status_change();

-- ============ 4. Validate & Apply Promotion RPC ============
-- Depends on: promotions, promotion_usages (migration 5)
-- Safe to create now; calling it before migration 5 will fail gracefully.
CREATE OR REPLACE FUNCTION apply_promotion(
  p_code        TEXT,
  p_user_id     UUID,
  p_cart_total  INT,
  p_item_count  INT
)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_promo     RECORD;
  v_user_uses INT;
  v_discount  INT := 0;
BEGIN
  -- Find active promotion by code
  SELECT * INTO v_promo
  FROM promotions
  WHERE code = p_code
    AND published = true
    AND (starts_at IS NULL OR starts_at <= now())
    AND (expires_at IS NULL OR expires_at > now())
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Mã không hợp lềEhoặc đã hết hạn');
  END IF;

  -- Check global usage limit
  IF v_promo.max_uses IS NOT NULL AND v_promo.usage_count >= v_promo.max_uses THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Mã đã được dùng hết lượt');
  END IF;

  -- Check per-user usage limit
  SELECT COUNT(*) INTO v_user_uses
  FROM promotion_usages
  WHERE promotion_id = v_promo.id AND user_id = p_user_id;

  IF v_user_uses >= v_promo.uses_per_user THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Bạn đã sử dụng mã này rồi');
  END IF;

  -- Check minimum order value
  IF p_cart_total < v_promo.min_order_value THEN
    RETURN jsonb_build_object(
      'ok', false,
      'error', format('Đơn hàng tối thiểu %s VND đềEdùng mã này', v_promo.min_order_value)
    );
  END IF;

  -- Check minimum item count
  IF p_item_count < v_promo.min_qty THEN
    RETURN jsonb_build_object(
      'ok', false,
      'error', format('Cần tối thiểu %s sản phẩm đềEdùng mã này', v_promo.min_qty)
    );
  END IF;

  -- Calculate discount based on type
  CASE v_promo.type
    WHEN 'percentage' THEN
      v_discount := (p_cart_total * v_promo.value / 100)::INT;
      IF v_promo.max_discount IS NOT NULL THEN
        v_discount := LEAST(v_discount, v_promo.max_discount);
      END IF;

    WHEN 'fixed_amount' THEN
      v_discount := LEAST(v_promo.value, p_cart_total);

    WHEN 'free_shipping' THEN
      v_discount := 0; -- Handled at order level via is_free_shipping flag

    WHEN 'buy_x_get_y' THEN
      -- Simplified: just return the rule for app layer to handle
      RETURN jsonb_build_object(
        'ok', true,
        'promotion_id', v_promo.id,
        'type', v_promo.type,
        'buy_qty', v_promo.buy_qty,
        'get_qty', v_promo.get_qty,
        'get_product_id', v_promo.get_product_id,
        'discount', 0,
        'is_free_shipping', false
      );

    WHEN 'custom' THEN
      -- Return custom rule for app layer (formula.evaluator.ts) to compute
      RETURN jsonb_build_object(
        'ok', true,
        'promotion_id', v_promo.id,
        'type', 'custom',
        'rule', v_promo.custom_rule,
        'discount', 0,
        'is_free_shipping', false
      );

    ELSE
      v_discount := 0;
  END CASE;

  RETURN jsonb_build_object(
    'ok', true,
    'promotion_id', v_promo.id,
    'type', v_promo.type::TEXT,
    'discount', v_discount,
    'is_free_shipping', v_promo.type = 'free_shipping'
  );

EXCEPTION
  WHEN undefined_table THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Promotions not configured');
END;
$$;
