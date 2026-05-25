-- Storage buckets (run via Supabase dashboard or API if INSERT fails)
INSERT INTO storage.buckets (id, name, public) VALUES
  ('product-images', 'product-images', true),
  ('blog-images', 'blog-images', true),
  ('user-uploads', 'user-uploads', false)
ON CONFLICT (id) DO NOTHING;
