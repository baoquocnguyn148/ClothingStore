-- Migration: Inventory Enhancements
-- Adds actor tracking, notes, and order references to inventory movements

-- Add actor_id (admin user who made the change)
ALTER TABLE inventory_movements
  ADD COLUMN IF NOT EXISTS actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Add human-readable note
ALTER TABLE inventory_movements
  ADD COLUMN IF NOT EXISTS note TEXT;

-- Add optional order reference (e.g. when stock is reduced by an order)
ALTER TABLE inventory_movements
  ADD COLUMN IF NOT EXISTS reference_order_id UUID REFERENCES orders(id) ON DELETE SET NULL;

-- Improve index for filtering by reason and actor
CREATE INDEX IF NOT EXISTS idx_inv_movements_variant_created
  ON inventory_movements(variant_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_inv_movements_actor
  ON inventory_movements(actor_id);

CREATE INDEX IF NOT EXISTS idx_inv_movements_reason
  ON inventory_movements(reason);

-- Cost price as 50% of sell price view (no extra column needed)
-- We use a view to expose cost_price = price * 0.5
CREATE OR REPLACE VIEW product_variants_with_cost AS
SELECT
  pv.*,
  ROUND(pv.price * 0.5) AS cost_price,
  ROUND(pv.stock_qty * pv.price * 0.5) AS stock_value
FROM product_variants pv;
