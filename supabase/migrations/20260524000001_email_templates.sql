-- Migration 6: Email templates
-- Run after 20260522000005_promotions_and_shipping.sql

CREATE TABLE email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO email_templates (type, name, subject, body)
VALUES
  ('order_confirmation', 'Xác nhận đơn hàng', 'Đơn hàng của bạn đã được xác nhận', 'Xin chào {{customer_name}},\n\nCảm ơn bạn đã đặt hàng. Đơn hàng {{order_number}} của bạn đã được xác nhận và sẽ sớm được xử lý.'),
  ('order_shipped', 'Đơn hàng đang giao', 'Đơn hàng của bạn đã được gửi đi', 'Xin chào {{customer_name}},\n\nĐơn hàng {{order_number}} đang được vận chuyển. Mã theo dõi: {{tracking_number}}.'),
  ('order_cancelled', 'Đơn hàng đã hủy', 'Đơn hàng của bạn đã bị hủy', 'Xin chào {{customer_name}},\n\nĐơn hàng {{order_number}} đã bị hủy. Nếu cần hỗ trợ, vui lòng liên hệ bộ phận CSKH.');

ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access on email templates" ON email_templates
  USING (true);
