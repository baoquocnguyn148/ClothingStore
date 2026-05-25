-- Migration 7: Ensure admin_notifications table exists
-- Run after 20260524000001_email_templates.sql

CREATE TABLE IF NOT EXISTS admin_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  entity TEXT,
  entity_id UUID,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_admin_notifications_read ON admin_notifications(read);
CREATE INDEX IF NOT EXISTS idx_admin_notifications_created_at ON admin_notifications(created_at);

ALTER TABLE admin_notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service role full access on admin notifications" ON admin_notifications;
CREATE POLICY "Service role full access on admin notifications" ON admin_notifications
  USING (true);
