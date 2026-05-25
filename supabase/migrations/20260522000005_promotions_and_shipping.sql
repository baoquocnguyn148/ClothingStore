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
  provinces   TEXT[] NOT NULL DEFAULT '{}', -- e.g., ['Hồ Chí Minh', 'Hà Nội']
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
