-- Allow PostgREST to embed profiles on orders (same user_id)
ALTER TABLE orders
  ADD CONSTRAINT orders_profile_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES profiles(user_id)
  ON DELETE CASCADE;
