#!/usr/bin/env python3
"""Brett — fatiha.app research scraper.
Searches for relevant research and populates kitchen DB with category='fatiha'.
Uses Qwen 3.5 35B via Ollama for analysis. Zero API cost.
"""

import json, sqlite3, ssl, urllib.request, uuid, datetime, time, sys

DB_PATH = '/var/lib/cookmom-workspace/kitchen.db'
OLLAMA_URL = 'http://localhost:11434/api/chat'
DATE = datetime.date.today().isoformat()

# Research queries — broad net for fatiha.app
SEARCHES = [
    # Calligraphy + ML
    "Arabic calligraphy generation neural network",
    "Islamic calligraphy procedural generation",
    "Arabic handwriting synthesis deep learning",
    "Sketch-RNN Arabic calligraphy",
    "stroke prediction model handwriting generation",
    "generative Arabic typography machine learning",
    "computational Islamic art calligraphy",
    # Brush / ink simulation
    "p5.js brush engine digital calligraphy",
    "ink simulation fluid dynamics canvas",
    "digital brush stroke physics simulation",
    "procedural brush strokes generative art",
    "WebGPU paint simulation real-time",
    # Voice + Quran
    "Tarteel AI Quran recognition API",
    "real-time speech recognition Arabic recitation",
    "voice reactive generative art",
    "audio reactive visual art web",
    # Islamic art + geometry
    "procedural Islamic geometric patterns code",
    "Islamic illuminated manuscript digital recreation",
    "generative Islamic art p5.js",
    "arabesque pattern algorithm",
    # Datasets
    "Arabic handwriting dataset KHATT",
    "Islamic calligraphy dataset machine learning",
    # Progressive reveal / interactive
    "progressive reveal animation generative art",
    "interactive calligraphy web application",
    "real-time drawing generation browser",
]

def brave_search(query, count=5):
    """Search via web_search style — use Brave Search."""
    # Use urllib to hit Brave Search API
    # We'll use a simpler approach: scrape via DuckDuckGo lite
    url = f"https://html.duckduckgo.com/html/?q={urllib.parse.quote(query)}"
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        resp = urllib.request.urlopen(req, context=ctx, timeout=10)
        html = resp.read().decode('utf-8', errors='replace')
        # Extract result URLs and titles from DuckDuckGo HTML
        results = []
        import re
        # DDG lite has <a rel="nofollow" class="result__a" href="...">title</a>
        for m in re.finditer(r'class="result__a"[^>]*href="([^"]+)"[^>]*>([^<]+)', html):
            href, title = m.group(1), m.group(2).strip()
            # DDG wraps URLs in redirect, extract actual URL
            actual = re.search(r'uddg=([^&]+)', href)
            if actual:
                href = urllib.parse.unquote(actual.group(1))
            if href.startswith('http') and len(results) < count:
                results.append({'url': href, 'title': title})
        return results
    except Exception as e:
        print(f"  Search failed for '{query}': {e}", file=sys.stderr)
        return []


def analyze_with_qwen(title, url, content_snippet):
    """Send to Qwen 3.5 35B for structured analysis."""
    prompt = f"""Analyze this resource for relevance to building a voice-reactive Islamic calligraphy app (fatiha.app).
The app uses: voice recitation input (Tarteel AI), procedural calligraphy/art generation, p5.js brush engine, 
stroke prediction models, Islamic art traditions.

Title: {title}
URL: {url}
Content: {content_snippet[:2000]}

Provide a JSON response with:
- "relevant": true/false (is this useful for fatiha.app?)
- "summary_brief": one-line summary (max 80 chars)
- "summary": 2-3 sentence description of what this offers
- "tags": array of tags like ["calligraphy", "ml", "dataset", "brush", "voice", "geometry", "reference"]
- "priority": "high" / "normal" / "low"

Return ONLY valid JSON, no markdown."""

    payload = json.dumps({
        "model": "qwen3.5:35b-a3b",
        "messages": [{"role": "user", "content": prompt}],
        "stream": False,
        "think": False
    }).encode()

    req = urllib.request.Request(OLLAMA_URL, data=payload,
                                 headers={'Content-Type': 'application/json'})
    try:
        resp = urllib.request.urlopen(req, timeout=60)
        data = json.loads(resp.read())
        content = data.get('message', {}).get('content', '')
        # Try to parse JSON from response
        # Strip markdown fences if present
        content = content.strip()
        if content.startswith('```'):
            content = content.split('\n', 1)[1] if '\n' in content else content
            content = content.rsplit('```', 1)[0]
        return json.loads(content)
    except Exception as e:
        print(f"  Qwen analysis failed: {e}", file=sys.stderr)
        return None


def scrape_url(url):
    """Fetch URL and extract text content."""
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        resp = urllib.request.urlopen(req, context=ctx, timeout=15)
        html = resp.read().decode('utf-8', errors='replace')
        # Strip HTML tags for a rough text extraction
        import re
        text = re.sub(r'<script[^>]*>.*?</script>', '', html, flags=re.DOTALL)
        text = re.sub(r'<style[^>]*>.*?</style>', '', text, flags=re.DOTALL)
        text = re.sub(r'<[^>]+>', ' ', text)
        text = re.sub(r'\s+', ' ', text).strip()
        return text[:3000]
    except Exception as e:
        print(f"  Scrape failed for {url}: {e}", file=sys.stderr)
        return ""


def insert_item(db, title, url, analysis):
    """Insert into kitchen DB as fatiha category."""
    item_id = uuid.uuid4().hex
    tags = json.dumps(analysis.get('tags', []))
    db.execute(
        '''INSERT OR IGNORE INTO daily_items 
           (id, date, category, title, summary, url, tags, source, priority, analysis, summary_brief)
           VALUES (?, ?, 'fatiha', ?, ?, ?, ?, 'brett-research', ?, ?, ?)''',
        (item_id, DATE, title, analysis.get('summary', ''), url, tags,
         analysis.get('priority', 'normal'), json.dumps(analysis), analysis.get('summary_brief', ''))
    )
    db.commit()


def main():
    db = sqlite3.connect(DB_PATH)
    seen_urls = set()
    total_added = 0
    total_searched = 0

    # Get existing URLs to avoid duplicates
    for row in db.execute('SELECT url FROM daily_items WHERE url IS NOT NULL'):
        seen_urls.add(row[0])

    print(f"Starting fatiha.app research scrape — {len(SEARCHES)} queries")
    print(f"Existing URLs in DB: {len(seen_urls)}")
    print("=" * 60)

    for i, query in enumerate(SEARCHES):
        print(f"\n[{i+1}/{len(SEARCHES)}] Searching: {query}")
        results = brave_search(query, count=5)
        total_searched += 1

        for r in results:
            url = r['url']
            title = r['title']

            if url in seen_urls:
                print(f"  Skip (dupe): {title[:50]}")
                continue
            seen_urls.add(url)

            print(f"  Scraping: {title[:60]}...")
            content = scrape_url(url)
            if not content:
                continue

            print(f"  Analyzing with Qwen...")
            analysis = analyze_with_qwen(title, url, content)
            if not analysis:
                continue

            if not analysis.get('relevant', False):
                print(f"  Not relevant — skipping")
                continue

            insert_item(db, title, url, analysis)
            total_added += 1
            print(f"  ✓ Added: {analysis.get('summary_brief', title[:50])} [{analysis.get('priority', '?')}]")

            time.sleep(0.5)  # be nice to servers

        time.sleep(1)  # pause between search queries

    print(f"\n{'=' * 60}")
    print(f"Done! Added {total_added} items from {total_searched} queries")
    db.close()


if __name__ == '__main__':
    main()
