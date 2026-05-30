-- MIS/DSS reporting layer and CRM campaign planning.

CREATE TYPE crm_campaign_status AS ENUM ('draft', 'scheduled', 'running', 'completed', 'cancelled');

CREATE TABLE IF NOT EXISTS crm_segments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  rule JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS crm_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  objective TEXT,
  segment_id UUID REFERENCES crm_segments(id) ON DELETE SET NULL,
  channel TEXT NOT NULL DEFAULT 'email',
  status crm_campaign_status NOT NULL DEFAULT 'draft',
  scheduled_at TIMESTAMPTZ,
  budget INT NOT NULL DEFAULT 0,
  expected_revenue INT NOT NULL DEFAULT 0,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_crm_campaigns_status ON crm_campaigns(status, scheduled_at);
CREATE INDEX IF NOT EXISTS idx_crm_campaigns_segment ON crm_campaigns(segment_id);

CREATE TRIGGER crm_segments_updated_at BEFORE UPDATE ON crm_segments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER crm_campaigns_updated_at BEFORE UPDATE ON crm_campaigns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE crm_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_campaigns ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role full access on crm segments" ON crm_segments;
CREATE POLICY "Service role full access on crm segments" ON crm_segments
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Service role full access on crm campaigns" ON crm_campaigns;
CREATE POLICY "Service role full access on crm campaigns" ON crm_campaigns
  USING (true)
  WITH CHECK (true);

INSERT INTO crm_segments (slug, name, description, rule)
VALUES
  ('vip-care', 'VIP care', 'High-value customers for personal care.', '{"type":"rfm","min_total_spent":5000000}'::jsonb),
  ('win-back', 'Win-back', 'Customers with historical spend but no recent purchase.', '{"type":"rfm","inactive_days":60}'::jsonb),
  ('new-no-order', 'New no order', 'Registered customers without completed orders.', '{"type":"lifecycle","order_count":0}'::jsonb)
ON CONFLICT (slug) DO NOTHING;

CREATE OR REPLACE VIEW mis_daily_sales_summary AS
SELECT
  date_trunc('day', created_at)::date AS report_date,
  COUNT(*) AS order_count,
  COUNT(*) FILTER (WHERE status IN ('paid', 'confirmed', 'shipping', 'delivered')) AS revenue_order_count,
  COALESCE(SUM(total) FILTER (WHERE status IN ('paid', 'confirmed', 'shipping', 'delivered')), 0) AS revenue,
  COALESCE(AVG(total) FILTER (WHERE status IN ('paid', 'confirmed', 'shipping', 'delivered')), 0)::int AS average_order_value,
  COUNT(*) FILTER (WHERE status IN ('cancelled', 'refunded')) AS exception_order_count
FROM orders
GROUP BY 1;

CREATE OR REPLACE VIEW mis_customer_metrics AS
SELECT
  p.user_id,
  p.full_name,
  p.phone,
  p.membership_tier,
  p.created_at,
  COUNT(o.id) FILTER (WHERE o.status IN ('paid', 'confirmed', 'shipping', 'delivered')) AS completed_order_count,
  COALESCE(SUM(o.total) FILTER (WHERE o.status IN ('paid', 'confirmed', 'shipping', 'delivered')), 0) AS total_spent,
  MAX(o.created_at) FILTER (WHERE o.status IN ('paid', 'confirmed', 'shipping', 'delivered')) AS last_order_at
FROM profiles p
LEFT JOIN orders o ON o.user_id = p.user_id
WHERE p.role = 'customer'
GROUP BY p.user_id, p.full_name, p.phone, p.membership_tier, p.created_at;

CREATE OR REPLACE VIEW mis_crm_sla_summary AS
SELECT
  (SELECT COUNT(*) FROM crm_tickets WHERE status IN ('open', 'pending')) AS open_tickets,
  (SELECT COUNT(*) FROM crm_tickets WHERE status IN ('resolved', 'closed')) AS resolved_tickets,
  (SELECT COUNT(*) FROM crm_tickets WHERE status IN ('open', 'pending') AND priority IN ('high', 'urgent')) AS high_priority_open_tickets,
  (SELECT COUNT(*) FROM crm_tasks WHERE status = 'open') AS open_tasks,
  (SELECT COUNT(*) FROM crm_tasks WHERE status = 'open' AND due_at < now()) AS overdue_tasks;
