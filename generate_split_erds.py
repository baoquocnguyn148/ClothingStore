# -*- coding: utf-8 -*-
import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
import re
import urllib.request

sql_content = """
CREATE TABLE public.collections (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  handle text NOT NULL UNIQUE,
  title text NOT NULL,
  description text,
  image_url text,
  sort_order integer NOT NULL DEFAULT 0,
  published boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT collections_pkey PRIMARY KEY (id)
);
CREATE TABLE public.products (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  handle text NOT NULL UNIQUE,
  title text NOT NULL,
  description text NOT NULL DEFAULT ''::text,
  base_price integer NOT NULL DEFAULT 0,
  compare_at_price integer,
  category text NOT NULL DEFAULT 'general'::text,
  published boolean NOT NULL DEFAULT true,
  deleted_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  category_id uuid,
  fts tsvector DEFAULT to_tsvector('simple'::regconfig, ((COALESCE(title, ''::text) || ' '::text) || COALESCE(description, ''::text))),
  CONSTRAINT products_pkey PRIMARY KEY (id),
  CONSTRAINT products_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id)
);
CREATE TABLE public.product_images (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL,
  url text NOT NULL,
  alt text,
  sort_order integer NOT NULL DEFAULT 0,
  CONSTRAINT product_images_pkey PRIMARY KEY (id),
  CONSTRAINT product_images_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id)
);
CREATE TABLE public.product_variants (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL,
  sku text NOT NULL UNIQUE,
  size text NOT NULL,
  color_name text NOT NULL,
  color_hex text NOT NULL DEFAULT '#000000'::text,
  price integer NOT NULL,
  stock_qty integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT product_variants_pkey PRIMARY KEY (id),
  CONSTRAINT product_variants_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id)
);
CREATE TABLE public.tags (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  label text NOT NULL,
  CONSTRAINT tags_pkey PRIMARY KEY (id)
);
CREATE TABLE public.product_tag_assignments (
  product_id uuid NOT NULL,
  tag_id uuid NOT NULL,
  CONSTRAINT product_tag_assignments_pkey PRIMARY KEY (product_id, tag_id),
  CONSTRAINT product_tag_assignments_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id),
  CONSTRAINT product_tag_assignments_tag_id_fkey FOREIGN KEY (tag_id) REFERENCES public.tags(id)
);
CREATE TABLE public.collection_products (
  collection_id uuid NOT NULL,
  product_id uuid NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  CONSTRAINT collection_products_pkey PRIMARY KEY (collection_id, product_id),
  CONSTRAINT collection_products_collection_id_fkey FOREIGN KEY (collection_id) REFERENCES public.collections(id),
  CONSTRAINT collection_products_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id)
);
CREATE TABLE public.inventory_movements (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  variant_id uuid NOT NULL,
  delta integer NOT NULL,
  reason text NOT NULL DEFAULT 'adjustment'::text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  actor_id uuid,
  note text,
  reference_order_id uuid,
  CONSTRAINT inventory_movements_pkey PRIMARY KEY (id),
  CONSTRAINT inventory_movements_variant_id_fkey FOREIGN KEY (variant_id) REFERENCES public.product_variants(id),
  CONSTRAINT inventory_movements_actor_id_fkey FOREIGN KEY (actor_id) REFERENCES auth.users(id),
  CONSTRAINT inventory_movements_reference_order_id_fkey FOREIGN KEY (reference_order_id) REFERENCES public.orders(id)
);
CREATE TABLE public.profiles (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  full_name text NOT NULL DEFAULT ''::text,
  phone text,
  membership_tier text NOT NULL DEFAULT 'standard'::text,
  role USER-DEFINED NOT NULL DEFAULT 'customer'::user_role,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.addresses (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  phone text NOT NULL,
  address_line text NOT NULL,
  city text NOT NULL,
  is_default boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT addresses_pkey PRIMARY KEY (id),
  CONSTRAINT addresses_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.carts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  guest_session_id text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT carts_pkey PRIMARY KEY (id),
  CONSTRAINT carts_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.cart_items (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  cart_id uuid NOT NULL,
  variant_id uuid NOT NULL,
  quantity integer NOT NULL DEFAULT 1 CHECK (quantity > 0),
  unit_price integer NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT cart_items_pkey PRIMARY KEY (id),
  CONSTRAINT cart_items_cart_id_fkey FOREIGN KEY (cart_id) REFERENCES public.carts(id),
  CONSTRAINT cart_items_variant_id_fkey FOREIGN KEY (variant_id) REFERENCES public.product_variants(id)
);
CREATE TABLE public.wishlist_items (
  user_id uuid NOT NULL,
  product_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT wishlist_items_pkey PRIMARY KEY (user_id, product_id),
  CONSTRAINT wishlist_items_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT wishlist_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id)
);
CREATE TABLE public.orders (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  order_number text NOT NULL UNIQUE,
  user_id uuid NOT NULL,
  status USER-DEFINED NOT NULL DEFAULT 'pending_payment'::order_status,
  subtotal integer NOT NULL DEFAULT 0,
  shipping_fee integer NOT NULL DEFAULT 0,
  total integer NOT NULL DEFAULT 0,
  shipping_address jsonb NOT NULL DEFAULT '{}'::jsonb,
  note text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  promotion_id uuid,
  discount_amount integer NOT NULL DEFAULT 0,
  promotion_code text,
  CONSTRAINT orders_pkey PRIMARY KEY (id),
  CONSTRAINT orders_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT orders_promotion_id_fkey FOREIGN KEY (promotion_id) REFERENCES public.promotions(id)
);
CREATE TABLE public.order_items (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL,
  variant_id uuid,
  product_title text NOT NULL,
  variant_size text NOT NULL,
  variant_color text NOT NULL,
  unit_price integer NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  image_url text,
  CONSTRAINT order_items_pkey PRIMARY KEY (id),
  CONSTRAINT order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id),
  CONSTRAINT order_items_variant_id_fkey FOREIGN KEY (variant_id) REFERENCES public.product_variants(id)
);
CREATE TABLE public.order_status_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL,
  from_status USER-DEFINED,
  to_status USER-DEFINED NOT NULL,
  note text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT order_status_logs_pkey PRIMARY KEY (id),
  CONSTRAINT order_status_logs_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id)
);
CREATE TABLE public.payments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL,
  provider USER-DEFINED NOT NULL,
  status USER-DEFINED NOT NULL DEFAULT 'pending'::payment_status,
  amount integer NOT NULL,
  transaction_ref text,
  payment_url text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT payments_pkey PRIMARY KEY (id),
  CONSTRAINT payments_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id)
);
CREATE TABLE public.payment_events (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  payment_id uuid NOT NULL,
  gateway_event_id text NOT NULL UNIQUE,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  processed boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT payment_events_pkey PRIMARY KEY (id),
  CONSTRAINT payment_events_payment_id_fkey FOREIGN KEY (payment_id) REFERENCES public.payments(id)
);
CREATE TABLE public.blog_posts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  excerpt text NOT NULL DEFAULT ''::text,
  image_url text NOT NULL,
  published_at date,
  published boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT blog_posts_pkey PRIMARY KEY (id)
);
CREATE TABLE public.blog_post_products (
  blog_post_id uuid NOT NULL,
  product_id uuid NOT NULL,
  CONSTRAINT blog_post_products_pkey PRIMARY KEY (blog_post_id, product_id),
  CONSTRAINT blog_post_products_blog_post_id_fkey FOREIGN KEY (blog_post_id) REFERENCES public.blog_posts(id),
  CONSTRAINT blog_post_products_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id)
);
CREATE TABLE public.cms_pages (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  html_content text NOT NULL DEFAULT ''::text,
  published boolean NOT NULL DEFAULT true,
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT cms_pages_pkey PRIMARY KEY (id)
);
CREATE TABLE public.careers (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  location text NOT NULL,
  job_type text NOT NULL DEFAULT 'Full-time'::text,
  description text NOT NULL,
  requirements jsonb NOT NULL DEFAULT '[]'::jsonb,
  benefits jsonb NOT NULL DEFAULT '[]'::jsonb,
  published boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT careers_pkey PRIMARY KEY (id)
);
CREATE TABLE public.career_applications (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  career_id uuid NOT NULL,
  full_name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  cv_storage_path text,
  status text NOT NULL DEFAULT 'submitted'::text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT career_applications_pkey PRIMARY KEY (id),
  CONSTRAINT career_applications_career_id_fkey FOREIGN KEY (career_id) REFERENCES public.careers(id)
);
CREATE TABLE public.categories (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  parent_id uuid,
  image_url text,
  sort_order integer NOT NULL DEFAULT 0,
  published boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT categories_pkey PRIMARY KEY (id),
  CONSTRAINT categories_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.categories(id)
);
CREATE TABLE public.product_reviews (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL,
  user_id uuid NOT NULL,
  order_id uuid,
  rating smallint NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title text,
  body text,
  images jsonb NOT NULL DEFAULT '[]'::jsonb,
  verified boolean NOT NULL DEFAULT false,
  published boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT product_reviews_pkey PRIMARY KEY (id),
  CONSTRAINT product_reviews_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id),
  CONSTRAINT product_reviews_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT product_reviews_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id)
);
CREATE TABLE public.media_assets (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  bucket text NOT NULL DEFAULT 'public'::text,
  path text NOT NULL UNIQUE,
  url text NOT NULL,
  mime_type text,
  width integer,
  height integer,
  size_bytes integer,
  alt text,
  uploaded_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT media_assets_pkey PRIMARY KEY (id),
  CONSTRAINT media_assets_uploaded_by_fkey FOREIGN KEY (uploaded_by) REFERENCES auth.users(id)
);
CREATE TABLE public.stock_alert_config (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  variant_id uuid UNIQUE,
  low_stock_threshold integer NOT NULL DEFAULT 5,
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT stock_alert_config_pkey PRIMARY KEY (id),
  CONSTRAINT stock_alert_config_variant_id_fkey FOREIGN KEY (variant_id) REFERENCES public.product_variants(id)
);
CREATE TABLE public.promotions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  code text UNIQUE,
  name text NOT NULL,
  description text,
  type USER-DEFINED NOT NULL,
  apply_mode USER-DEFINED NOT NULL DEFAULT 'code'::promotion_apply_mode,
  value integer NOT NULL DEFAULT 0,
  max_discount integer,
  min_order_value integer NOT NULL DEFAULT 0,
  min_qty integer NOT NULL DEFAULT 1,
  target USER-DEFINED NOT NULL DEFAULT 'cart'::promotion_target,
  target_ids ARRAY NOT NULL DEFAULT '{}'::uuid[],
  buy_qty integer,
  get_qty integer,
  get_product_id uuid,
  custom_rule jsonb,
  max_uses integer,
  uses_per_user integer NOT NULL DEFAULT 1,
  usage_count integer NOT NULL DEFAULT 0,
  starts_at timestamp with time zone,
  expires_at timestamp with time zone,
  published boolean NOT NULL DEFAULT true,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT promotions_pkey PRIMARY KEY (id),
  CONSTRAINT promotions_get_product_id_fkey FOREIGN KEY (get_product_id) REFERENCES public.products(id),
  CONSTRAINT promotions_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id)
);
CREATE TABLE public.promotion_usages (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  promotion_id uuid NOT NULL,
  user_id uuid NOT NULL,
  order_id uuid NOT NULL,
  discount_amount integer NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT promotion_usages_pkey PRIMARY KEY (id),
  CONSTRAINT promotion_usages_promotion_id_fkey FOREIGN KEY (promotion_id) REFERENCES public.promotions(id),
  CONSTRAINT promotion_usages_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT promotion_usages_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id)
);
CREATE TABLE public.shipping_zones (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  provinces ARRAY NOT NULL DEFAULT '{}'::text[],
  fee integer NOT NULL DEFAULT 0,
  free_above integer,
  published boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT shipping_zones_pkey PRIMARY KEY (id)
);
CREATE TABLE public.admin_notifications (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  type text NOT NULL,
  title text NOT NULL,
  body text,
  entity text,
  entity_id uuid,
  read boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT admin_notifications_pkey PRIMARY KEY (id)
);
CREATE TABLE public.membership_tier_config (
  tier USER-DEFINED NOT NULL,
  min_spent bigint NOT NULL,
  discount_percent integer DEFAULT 0,
  benefits ARRAY,
  CONSTRAINT membership_tier_config_pkey PRIMARY KEY (tier)
);
CREATE TABLE public.email_templates (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  type text NOT NULL UNIQUE,
  name text NOT NULL,
  subject text NOT NULL,
  body text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT email_templates_pkey PRIMARY KEY (id)
);
CREATE TABLE public.crm_notes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  customer_user_id uuid NOT NULL,
  body text NOT NULL,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT crm_notes_pkey PRIMARY KEY (id),
  CONSTRAINT crm_notes_customer_user_id_fkey FOREIGN KEY (customer_user_id) REFERENCES auth.users(id),
  CONSTRAINT crm_notes_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id)
);
CREATE TABLE public.crm_tasks (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  customer_user_id uuid NOT NULL,
  title text NOT NULL,
  body text,
  due_at timestamp with time zone,
  status USER-DEFINED NOT NULL DEFAULT 'open'::crm_task_status,
  priority USER-DEFINED NOT NULL DEFAULT 'normal'::crm_task_priority,
  assigned_to uuid,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT crm_tasks_pkey PRIMARY KEY (id),
  CONSTRAINT crm_tasks_customer_user_id_fkey FOREIGN KEY (customer_user_id) REFERENCES auth.users(id),
  CONSTRAINT crm_tasks_assigned_to_fkey FOREIGN KEY (assigned_to) REFERENCES auth.users(id),
  CONSTRAINT crm_tasks_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id)
);
CREATE TABLE public.crm_tickets (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  customer_user_id uuid NOT NULL,
  order_id uuid,
  subject text NOT NULL,
  body text,
  status USER-DEFINED NOT NULL DEFAULT 'open'::crm_ticket_status,
  priority USER-DEFINED NOT NULL DEFAULT 'normal'::crm_ticket_priority,
  assigned_to uuid,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT crm_tickets_pkey PRIMARY KEY (id),
  CONSTRAINT crm_tickets_customer_user_id_fkey FOREIGN KEY (customer_user_id) REFERENCES auth.users(id),
  CONSTRAINT crm_tickets_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id),
  CONSTRAINT crm_tickets_assigned_to_fkey FOREIGN KEY (assigned_to) REFERENCES auth.users(id),
  CONSTRAINT crm_tickets_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id)
);
CREATE TABLE public.admin_audit_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  actor_id uuid,
  action text NOT NULL,
  entity text NOT NULL,
  entity_id text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT admin_audit_logs_pkey PRIMARY KEY (id),
  CONSTRAINT admin_audit_logs_actor_id_fkey FOREIGN KEY (actor_id) REFERENCES auth.users(id)
);
CREATE TABLE public.crm_segments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  description text,
  rule jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT crm_segments_pkey PRIMARY KEY (id)
);
CREATE TABLE public.crm_campaigns (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  objective text,
  segment_id uuid,
  channel text NOT NULL DEFAULT 'email'::text,
  status USER-DEFINED NOT NULL DEFAULT 'draft'::crm_campaign_status,
  scheduled_at timestamp with time zone,
  budget integer NOT NULL DEFAULT 0,
  expected_revenue integer NOT NULL DEFAULT 0,
  notes text,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT crm_campaigns_pkey PRIMARY KEY (id),
  CONSTRAINT crm_campaigns_segment_id_fkey FOREIGN KEY (segment_id) REFERENCES public.crm_segments(id),
  CONSTRAINT crm_campaigns_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id)
);
"""

# Very simple SQL parser to extract tables and foreign keys
tables = {}
foreign_keys = []
table_matches = re.finditer(r'CREATE TABLE ([\w\.]+)\s*\((.*?)\);', sql_content, re.DOTALL)
for match in table_matches:
    table_name = match.group(1).replace('public.', '')
    body = match.group(2)
    columns = []
    lines = body.split('\n')
    for line in lines:
        line = line.strip()
        if not line: continue
        if line.startswith('CONSTRAINT'):
            fk_match = re.search(r'FOREIGN KEY \((.*?)\) REFERENCES ([\w\.]+)\((.*?)\)', line)
            if fk_match:
                from_col = fk_match.group(1).strip()
                to_table = fk_match.group(2).replace('public.', '').replace('auth.', '')
                to_col = fk_match.group(3).strip()
                foreign_keys.append((table_name, from_col, to_table, to_col))
        elif not line.startswith('PRIMARY KEY') and not line.startswith('FOREIGN KEY') and not line.startswith('UNIQUE'):
            parts = line.split()
            if len(parts) >= 2:
                col_name = parts[0]
                col_type = parts[1]
                columns.append((col_name, col_type))
    tables[table_name] = columns

tables['users'] = [('id', 'uuid')]

modules = {
    "ERD_1_Catalog_Inventory": {
        "title": "Module: Catalog & Inventory",
        "tables": [
            'categories', 'products', 'product_variants', 'product_images', 
            'collections', 'collection_products', 'tags', 'product_tag_assignments', 
            'product_reviews', 'stock_alert_config', 'inventory_movements'
        ]
    },
    "ERD_2_Sales_Checkout": {
        "title": "Module: Sales & Checkout",
        "tables": [
            'users', 'profiles', 'addresses', 'carts', 'cart_items', 
            'orders', 'order_items', 'order_status_logs', 'payments', 
            'payment_events', 'shipping_zones', 'promotions'
        ]
    },
    "ERD_3_CRM_Marketing": {
        "title": "Module: CRM & Marketing",
        "tables": [
            'users', 'promotions', 'promotion_usages', 'crm_notes', 
            'crm_tasks', 'crm_tickets', 'crm_segments', 'crm_campaigns', 
            'membership_tier_config'
        ]
    },
    "ERD_4_CMS_Admin": {
        "title": "Module: CMS & Admin",
        "tables": [
            'users', 'blog_posts', 'blog_post_products', 'cms_pages', 
            'careers', 'career_applications', 'media_assets', 'email_templates', 
            'admin_notifications', 'admin_audit_logs'
        ]
    }
}

for mod_name, mod_data in modules.items():
    puml = ["@startuml"]
    puml.append("hide circle")
    puml.append("skinparam linetype ortho")
    puml.append("skinparam nodesep 50")
    puml.append("skinparam ranksep 60")
    puml.append("skinparam class {")
    puml.append("  BackgroundColor #F9FAFB")
    puml.append("  BorderColor #3B82F6")
    puml.append("  ArrowColor #64748B")
    puml.append("}")
    puml.append(f"title {mod_data['title']}")
    
    target_tables = mod_data['tables']
    
    stubs = set()
    for fk in foreign_keys:
        from_tbl, from_col, to_tbl, to_col = fk
        if from_tbl in target_tables and to_tbl not in target_tables:
            stubs.add(to_tbl)
            
    for table in target_tables:
        if table not in tables: continue
        cols = tables[table]
        puml.append(f'entity "{table}" as {table} {{')
        for col_name, col_type in cols:
            prefix = "* " if col_name == 'id' else "  "
            if col_name == 'id':
                puml.append(f"  {prefix}{col_name} : {col_type} <<PK>>")
            else:
                is_fk = any(fk[0] == table and fk[1] == col_name for fk in foreign_keys)
                suffix = " <<FK>>" if is_fk else ""
                puml.append(f"  {prefix}{col_name} : {col_type}{suffix}")
        puml.append("}")
        
    for stub in stubs:
        if stub not in tables: continue
        puml.append(f'entity "{stub}" as {stub} #E2E8F0 {{')
        puml.append(f"  * id : uuid <<PK>>")
        puml.append("  .. (external) ..")
        puml.append("}")
        
    all_shown_tables = set(target_tables) | stubs
    for from_tbl, from_col, to_tbl, to_col in foreign_keys:
        if from_tbl in all_shown_tables and to_tbl in all_shown_tables:
            puml.append(f"{to_tbl} ||--o{{ {from_tbl} : \"{from_col}\"")

    puml.append("@enduml")
    puml_text = "\n".join(puml)
    
    print(f"Generating {mod_name}...")
    try:
        req = urllib.request.Request('https://kroki.io/plantuml/png', data=puml_text.encode('utf-8'), method='POST')
        req.add_header('Content-Type', 'text/plain')
        req.add_header('User-Agent', 'Mozilla/5.0')
        with urllib.request.urlopen(req) as response:
            png_data = response.read()
        filename = f"{mod_name}.png"
        with open(filename, 'wb') as f:
            f.write(png_data)
        print(f"  Saved to {filename}")
    except Exception as e:
        print(f"  Error: {e}")

print("All modules generated!")
