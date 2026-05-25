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
    RETURN jsonb_build_object('ok', false, 'error', 'Mã không hợp lệ hoặc đã hết hạn');
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
      'error', format('Đơn hàng tối thiểu %s VND để dùng mã này', v_promo.min_order_value)
    );
  END IF;

  -- Check minimum item count
  IF p_item_count < v_promo.min_qty THEN
    RETURN jsonb_build_object(
      'ok', false,
      'error', format('Cần tối thiểu %s sản phẩm để dùng mã này', v_promo.min_qty)
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
