#!/usr/bin/env python3
"""Migrate daily_items from Supabase to local SQLite. Run once."""

import json, sqlite3, urllib.request

SUPABASE_URL = 'https://wezxebfnxjviihawcexs.supabase.co'
SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndlenhlYmZueGp2aWloYXdjZXhzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjQ3NDMxNiwiZXhwIjoyMDg4MDUwMzE2fQ.GObc8-Bgr-7NAv3AtTTRfTTMw3hXSinZNDsheAmcVl4'
DB_PATH = '/var/lib/cookmom-workspace/kitchen.db'

def fetch_supabase():
    url = f'{SUPABASE_URL}/rest/v1/daily_items?order=date.desc&limit=500'
    req = urllib.request.Request(url)
    req.add_header('apikey', SUPABASE_KEY)
    req.add_header('Authorization', f'Bearer {SUPABASE_KEY}')
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read())

def migrate():
    items = fetch_supabase()
    print(f'Fetched {len(items)} items from Supabase')

    db = sqlite3.connect(DB_PATH)
    # Create table if not exists
    with open('/home/openclaw-agent/.openclaw/workspace/kitchen/schema.sql') as f:
        db.executescript(f.read())

    inserted = 0
    for item in items:
        try:
            db.execute('''
                INSERT OR IGNORE INTO daily_items (id, created_at, date, category, title, summary, url, tags, source, priority)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                item.get('id', ''),
                item.get('created_at', ''),
                item.get('date', ''),
                item.get('category', ''),
                item.get('title', ''),
                item.get('summary'),
                item.get('url'),
                json.dumps(item.get('tags', [])),
                item.get('source'),
                item.get('priority', 'normal'),
            ))
            inserted += 1
        except Exception as e:
            print(f'Skip: {e}')

    db.commit()
    db.close()
    print(f'Inserted {inserted} items into {DB_PATH}')

if __name__ == '__main__':
    migrate()
