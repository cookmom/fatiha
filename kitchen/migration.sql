-- Kitchen Newsfeed: daily_items table
-- Run this in the Supabase Dashboard > SQL Editor for project wezxebfnxjviihawcexs

CREATE TABLE IF NOT EXISTS daily_items (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamptz DEFAULT now(),
  date date NOT NULL,
  category text NOT NULL,
  title text NOT NULL,
  summary text,
  url text,
  tags text[] DEFAULT '{}',
  source text,
  priority text DEFAULT 'normal'
);

CREATE INDEX IF NOT EXISTS idx_daily_items_date ON daily_items (date DESC);
CREATE INDEX IF NOT EXISTS idx_daily_items_category ON daily_items (category);

ALTER TABLE daily_items ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if re-running
DROP POLICY IF EXISTS "Public read access" ON daily_items;
DROP POLICY IF EXISTS "Service role full access" ON daily_items;

CREATE POLICY "Public read access" ON daily_items FOR SELECT USING (true);
CREATE POLICY "Service role full access" ON daily_items FOR ALL USING (true);
