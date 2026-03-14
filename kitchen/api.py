#!/usr/bin/env python3
"""Kitchen API — lightweight local server for daily_items SQLite DB.
Runs on port 4100. Stdlib only, no pip installs."""

import json, sqlite3, os
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs

DB_PATH = '/var/lib/cookmom-workspace/kitchen.db'
PORT = 4100

def get_db():
    db = sqlite3.connect(DB_PATH)
    db.row_factory = sqlite3.Row
    return db

def row_to_dict(row):
    d = dict(row)
    # Parse JSON fields
    for k in ('tags', 'images'):
        if d.get(k):
            try: d[k] = json.loads(d[k])
            except: pass
        else:
            d[k] = []
    return d

class Handler(BaseHTTPRequestHandler):
    def _cors(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')

    def _json(self, code, data):
        body = json.dumps(data, default=str).encode()
        self.send_response(code)
        self.send_header('Content-Type', 'application/json')
        self._cors()
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self):
        self.send_response(204)
        self._cors()
        self.end_headers()

    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path.rstrip('/')
        qs = parse_qs(parsed.query)

        if path == '/api/items':
            db = get_db()
            sql = 'SELECT * FROM daily_items WHERE 1=1'
            params = []
            if 'category' in qs:
                sql += ' AND category = ?'
                params.append(qs['category'][0])
            if 'date' in qs:
                sql += ' AND date = ?'
                params.append(qs['date'][0])
            if 'search' in qs:
                sql += ' AND (title LIKE ? OR summary LIKE ? OR analysis LIKE ?)'
                s = f'%{qs["search"][0]}%'
                params.extend([s, s, s])
            sql += ' ORDER BY date DESC, created_at DESC'
            limit = int(qs.get('limit', [500])[0])
            sql += f' LIMIT {limit}'
            rows = db.execute(sql, params).fetchall()
            db.close()
            self._json(200, [row_to_dict(r) for r in rows])

        elif path.startswith('/api/items/'):
            item_id = path.split('/api/items/')[1]
            db = get_db()
            row = db.execute('SELECT * FROM daily_items WHERE id = ?', (item_id,)).fetchone()
            db.close()
            if row:
                self._json(200, row_to_dict(row))
            else:
                self._json(404, {'error': 'not found'})

        elif path == '/api/categories':
            db = get_db()
            rows = db.execute('SELECT category, COUNT(*) as count FROM daily_items GROUP BY category ORDER BY count DESC').fetchall()
            db.close()
            self._json(200, [dict(r) for r in rows])

        else:
            self._json(404, {'error': 'not found'})

    def do_POST(self):
        parsed = urlparse(self.path)
        if parsed.path.rstrip('/') != '/api/items':
            self._json(404, {'error': 'not found'})
            return

        length = int(self.headers.get('Content-Length', 0))
        body = json.loads(self.rfile.read(length))
        items = body if isinstance(body, list) else [body]

        db = get_db()
        inserted = 0
        for item in items:
            try:
                db.execute('''
                    INSERT INTO daily_items (date, category, title, summary, url, tags, source, priority, analysis, summary_brief, images)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ''', (
                    item.get('date', ''),
                    item.get('category', ''),
                    item.get('title', ''),
                    item.get('summary'),
                    item.get('url'),
                    json.dumps(item.get('tags', [])),
                    item.get('source'),
                    item.get('priority', 'normal'),
                    item.get('analysis'),
                    item.get('summary_brief'),
                    json.dumps(item.get('images', [])),
                ))
                inserted += 1
            except Exception as e:
                print(f'Insert error: {e}')
        db.commit()
        db.close()
        self._json(201, {'inserted': inserted})

    def do_PATCH(self):
        parsed = urlparse(self.path)
        path = parsed.path.rstrip('/')
        if not path.startswith('/api/items/'):
            self._json(404, {'error': 'not found'})
            return

        item_id = path.split('/api/items/')[1]
        length = int(self.headers.get('Content-Length', 0))
        body = json.loads(self.rfile.read(length))

        # Build SET clause from provided fields
        allowed = ('date', 'category', 'title', 'summary', 'url', 'tags', 'source', 'priority', 'analysis', 'summary_brief', 'images')
        sets = []
        params = []
        for k, v in body.items():
            if k in allowed:
                if k in ('tags', 'images') and isinstance(v, list):
                    v = json.dumps(v)
                sets.append(f'{k} = ?')
                params.append(v)

        if not sets:
            self._json(400, {'error': 'no valid fields'})
            return

        params.append(item_id)
        db = get_db()
        db.execute(f'UPDATE daily_items SET {", ".join(sets)} WHERE id = ?', params)
        db.commit()
        db.close()
        self._json(200, {'updated': item_id})

    def log_message(self, fmt, *args):
        pass  # silent logging

if __name__ == '__main__':
    # Ensure DB exists
    if not os.path.exists(DB_PATH):
        db = sqlite3.connect(DB_PATH)
        with open(os.path.join(os.path.dirname(__file__), 'schema.sql')) as f:
            db.executescript(f.read())
        db.close()
        print(f'Created {DB_PATH}')

    server = HTTPServer(('0.0.0.0', PORT), Handler)
    print(f'Kitchen API running on port {PORT}')
    server.serve_forever()
