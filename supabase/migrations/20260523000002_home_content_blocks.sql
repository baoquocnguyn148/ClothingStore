CREATE TABLE IF NOT EXISTS home_content_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  section TEXT NOT NULL,
  label TEXT NOT NULL,
  value TEXT NOT NULL DEFAULT '',
  type TEXT NOT NULL DEFAULT 'text' CHECK (type IN ('text', 'textarea', 'url')),
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_home_content_blocks_sort
  ON home_content_blocks(sort_order);

ALTER TABLE home_content_blocks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read home content" ON home_content_blocks;
CREATE POLICY "Public read home content" ON home_content_blocks
  FOR SELECT USING (true);

CREATE TRIGGER home_content_blocks_updated_at
  BEFORE UPDATE ON home_content_blocks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
