#!/usr/bin/env python3
"""Scrape URLs + analyze with Qwen via Ollama. Updates SQLite daily_items."""

import json, sqlite3, time, re, sys
from html.parser import HTMLParser
from urllib.request import urlopen, Request
from urllib.error import URLError, HTTPError
import ssl
SSL_CTX = ssl.create_default_context()
SSL_CTX.check_hostname = False
SSL_CTX.verify_mode = ssl.CERT_NONE

DB_PATH = '/var/lib/cookmom-workspace/kitchen.db'
OLLAMA_URL = 'http://localhost:11434/api/generate'
MODEL = 'qwen3.5:35b-a3b'

# Skip these domains for images (ads, trackers, tiny icons)
SKIP_IMG_DOMAINS = {'doubleclick.net','googlesyndication','facebook.com','google-analytics','pixel','track','beacon','1x1','spacer'}

class TextExtractor(HTMLParser):
    def __init__(self):
        super().__init__()
        self.text = []
        self.skip = False
        self.skip_tags = {'script','style','noscript','svg','head'}
    def handle_starttag(self, tag, attrs):
        if tag in self.skip_tags: self.skip = True
    def handle_endtag(self, tag):
        if tag in self.skip_tags: self.skip = False
    def handle_data(self, data):
        if not self.skip:
            self.text.append(data)
    def get_text(self):
        return re.sub(r'\s+', ' ', ' '.join(self.text)).strip()

class ImageExtractor(HTMLParser):
    def __init__(self, base_url):
        super().__init__()
        self.images = []
        self.base_url = base_url
    def handle_starttag(self, tag, attrs):
        if tag == 'img':
            attrs_d = dict(attrs)
            src = attrs_d.get('src','') or attrs_d.get('data-src','')
            if not src: return
            # Make absolute
            if src.startswith('//'): src = 'https:' + src
            elif src.startswith('/'): 
                from urllib.parse import urlparse
                p = urlparse(self.base_url)
                src = f'{p.scheme}://{p.netloc}{src}'
            elif not src.startswith('http'): return
            # Skip tiny/tracking
            if any(skip in src.lower() for skip in SKIP_IMG_DOMAINS): return
            w = attrs_d.get('width','')
            if w and w.isdigit() and int(w) < 80: return
            if src not in self.images:
                self.images.append(src)

    # Also grab og:image from meta
    def handle_startendtag(self, tag, attrs):
        self.handle_starttag(tag, attrs)
        if tag == 'meta':
            attrs_d = dict(attrs)
            prop = attrs_d.get('property','') or attrs_d.get('name','')
            if prop in ('og:image','twitter:image','twitter:image:src'):
                content = attrs_d.get('content','')
                if content and content.startswith('http') and content not in self.images:
                    self.images.insert(0, content)  # og:image first

def scrape_url(url, timeout=15):
    """Fetch URL, return (text, image_urls)"""
    try:
        req = Request(url, headers={'User-Agent':'Mozilla/5.0 (compatible; KitchenBot/1.0)'})
        with urlopen(req, timeout=timeout, context=SSL_CTX) as resp:
            html = resp.read().decode('utf-8', errors='replace')

        te = TextExtractor()
        te.feed(html)
        text = te.get_text()[:3000]

        ie = ImageExtractor(url)
        ie.feed(html)
        images = ie.images[:20]  # cap at 20

        return text, images
    except Exception as e:
        print(f'  Scrape failed: {e}')
        return None, []

def analyze_with_qwen(title, category, summary, page_text):
    """Send to Ollama, return (summary_brief, full_analysis)"""
    prompt = f"""You are an intelligence analyst for a creative technologist working in virtual production (ILM StageCraft), generative art, eurorack synthesis, and Islamic creative technology.

Analyze this item:

TITLE: {title}
CATEGORY: {category}
CURRENT SUMMARY: {summary or '(none)'}
PAGE CONTENT: {page_text or '(not available)'}

Respond in this exact format (no other text):

BRIEF: A 1-2 sentence executive summary of why this matters.

WHO: Key people, companies, or contacts.
WHAT: Core technology, product, or concept.
WHERE: Location, platform, or availability.
HOW: Technical implementation or approach.
OPPORTUNITIES: How this benefits a VP engineer / creative technologist.
IMPLEMENT: Concrete ways to build on this.
ALGO: Inferred algorithm, pattern, or technique."""

    # Use /api/chat with no-think to get direct response
    payload = json.dumps({
        'model': MODEL,
        'messages': [{'role':'user','content': prompt}],
        'stream': False,
        'think': False,
        'options': {'temperature': 0.3, 'num_predict': 1024}
    }).encode()

    try:
        req = Request(OLLAMA_URL.replace('/api/generate','/api/chat'), data=payload, headers={'Content-Type':'application/json'})
        with urlopen(req, timeout=120) as resp:
            result = json.loads(resp.read())
            msg = result.get('message', {})
            text = msg.get('content', '') or result.get('response', '')

        # Extract BRIEF for summary_brief
        brief_match = re.search(r'BRIEF:\s*(.+?)(?:\n\n|\nWHO:)', text, re.DOTALL)
        summary_brief = brief_match.group(1).strip() if brief_match else text[:200]

        return summary_brief, text
    except Exception as e:
        print(f'  Ollama failed: {e}')
        return None, None

def run(limit=None):
    db = sqlite3.connect(DB_PATH)
    db.row_factory = sqlite3.Row

    # Items with URLs but no analysis yet
    sql = 'SELECT * FROM daily_items WHERE url IS NOT NULL AND url != "" AND analysis IS NULL ORDER BY date DESC'
    if limit:
        sql += f' LIMIT {limit}'
    items = db.execute(sql).fetchall()

    print(f'Found {len(items)} items to analyze')

    for i, item in enumerate(items):
        print(f'\n[{i+1}/{len(items)}] {item["title"]}')
        print(f'  URL: {item["url"]}')

        # Step 1: Scrape
        text, images = scrape_url(item['url'])
        print(f'  Scraped: {len(text or "")} chars, {len(images)} images')

        # Step 2: Analyze
        summary_brief, analysis = analyze_with_qwen(
            item['title'], item['category'], item['summary'], text
        )
        if analysis:
            print(f'  Analysis: {len(analysis)} chars')
        else:
            print(f'  Analysis: FAILED')

        # Step 3: Update DB
        db.execute('''
            UPDATE daily_items SET analysis = ?, summary_brief = ?, images = ? WHERE id = ?
        ''', (analysis, summary_brief, json.dumps(images), item['id']))
        db.commit()

        # Rate limit
        time.sleep(1)

    db.close()
    print(f'\nDone. Analyzed {len(items)} items.')

if __name__ == '__main__':
    limit = int(sys.argv[1]) if len(sys.argv) > 1 else None
    run(limit)
