-- Phase B: order operations hardening
-- - Add release_order_stock RPC (pairs with reserve_order_stock)
-- - Add auto-cancel job for stale pending_payment orders (>24h) via pg_cron

-- pg_cron extension (requires it enabled on the Supabase project)
CREATE EXTENSION IF NOT EXISTS "pg_cron";

-- Release stock RPC
CREATE OR REPLACE FUNCTION release_order_stock(p_order_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  item RECORD;
BEGIN
  FOR item IN
    SELECT oi.variant_id, oi.quantity
    FROM order_items oi
    WHERE oi.order_id = p_order_id AND oi.variant_id IS NOT NULL
  LOOP
    UPDATE product_variants
    SET stock_qty = stock_qty + item.quantity
    WHERE id = item.variant_id;
  END LOOP;

  RETURN true;
END;
$$;

-- Auto-cancel stale pending_payment orders
CREATE OR REPLACE FUNCTION cancel_stale_pending_orders(p_hours INT DEFAULT 24)
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count INT := 0;
BEGIN
  -- Identify orders to cancel
  WITH to_cancel AS (
    SELECT id
    FROM orders
    WHERE status = 'pending_payment'
      AND created_at < now() - make_interval(hours => p_hours)
  ),
  updated AS (
    UPDATE orders o
    SET status = 'cancelled'
    FROM to_cancel tc
    WHERE o.id = tc.id
    RETURNING o.id
  )
  SELECT COUNT(*) INTO v_count FROM updated;

  -- Log status change (only for actually-cancelled orders)
  INSERT INTO order_status_logs (order_id, from_status, to_status, note)
  SELECT u.id, 'pending_payment', 'cancelled', 'Auto-cancel: pending_payment timeout'
  FROM updated u;

  -- Cancel pending/processing payments of those orders (best-effort)
  UPDATE payments p
  SET status = 'cancelled'
  WHERE p.order_id IN (SELECT id FROM updated)
    AND p.status IN ('pending', 'processing');

  RETURN v_count;
END;
$$;

-- Ensure we don't duplicate the job on re-apply
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'cancel_stale_pending_orders') THEN
    PERFORM cron.unschedule(jobid)
    FROM cron.job
    WHERE jobname = 'cancel_stale_pending_orders';
  END IF;
END;
$$;

-- Run hourly; function itself enforces the >24h threshold
SELECT cron.schedule(
  'cancel_stale_pending_orders',
  '0 * * * *',
  $$SELECT cancel_stale_pending_orders(24);$$
);

