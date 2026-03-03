# Brett — Pipeline Engineer Skills

## Web Scraping
**Always use `markitdown`** for any scrape-to-text pipeline. Never use raw BeautifulSoup/requests for doc ingestion.

```python
from markitdown import MarkItDown
md = MarkItDown()

# From URL
result = md.convert_url("https://example.com/page")
text = result.text_content  # clean markdown

# From local file (PDF, DOCX, etc.)
result = md.convert("/path/to/file.pdf")
text = result.text_content
```

Supports: HTML, PDF, DOCX, XLSX, PPTX, images (OCR), audio, YouTube URLs, EPubs, CSV, JSON, XML, ZIP.
Falls back to `requests` only if markitdown raises an exception on a specific URL.
Add 1-2s delay between requests to respect rate limits.

## Git Rules
- Never force-push, never delete branches, never rewrite history
- Always use SSH remote (`git@github.com:...`), never HTTPS
- Branch is `main` (not master)
- `git commit --no-verify` for internal workspace commits
- Never push env variables or secrets to any repo
- Workspace git repo is LOCAL ONLY — no remote

## Deployment (ramadan-clock-site)
- Always use `ship.sh` for deployment — never manual `git push`
- `ship.sh` auto-bumps cache bust, commits, renders, pauses for review
- Pre-push hook blocks stale cache bust — never bypass it
- Every JS change must bump `?v=N` in index.html

## File Rules
- Never touch `index.html` or `glass-cube-clock.js` unless explicitly tasked
- Never touch files in `/home/tawfeeq/ramadan-clock-site/` without explicit instruction
- Scratch dir: `/var/lib/cookmom-workspace/`

## Bob Knowledge Base
- Skill DB: `/home/openclaw-agent/.openclaw/workspace/memory/bob-skills.db`
- Import: `sys.path.insert(0, '/home/openclaw-agent/.openclaw/workspace/tools')` then `from bob_skills import SkillLibrary`
- Always check if skill exists before adding (lib.search by name)
- Log progress to `/tmp/brett-*.log`
- Report to `/tmp/brett-*-report.md`
