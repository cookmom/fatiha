CREATE TABLE IF NOT EXISTS daily_items (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  created_at TEXT DEFAULT (datetime('now')),
  date TEXT NOT NULL,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  summary TEXT,
  url TEXT,
  tags TEXT DEFAULT '[]',
  source TEXT,
  priority TEXT DEFAULT 'normal',
  analysis TEXT,
  summary_brief TEXT,
  images TEXT DEFAULT '[]'
);

CREATE INDEX IF NOT EXISTS idx_date ON daily_items(date DESC);
CREATE INDEX IF NOT EXISTS idx_category ON daily_items(category);
