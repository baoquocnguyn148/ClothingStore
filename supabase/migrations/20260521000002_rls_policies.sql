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
