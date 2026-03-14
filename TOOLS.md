# TOOLS.md - Local Notes

Skills define _how_ tools work. This file is for _your_ specifics — the stuff that's unique to your setup.

## What Goes Here

Things like:

- Camera names and locations
- SSH hosts and aliases
- Preferred voices for TTS
- Speaker/room names
- Device nicknames
- Anything environment-specific

## Examples

```markdown
### Cameras

- living-room → Main area, 180° wide angle
- front-door → Entrance, motion-triggered

### SSH

- home-server → 192.168.1.100, user: admin

### TTS

- Preferred voice: "Nova" (warm, slightly British)
- Default speaker: Kitchen HomePod
```

### Web Scraping — Standard Method
- **Always use `markitdown`** for converting web pages/docs to clean text for LLM ingestion
- Already installed: v0.1.5 (`pip show markitdown`)
- MIT license, Microsoft, no telemetry, no network calls beyond the target URL
- ```python
  from markitdown import MarkItDown
  md = MarkItDown()
  result = md.convert_url("https://example.com/page")
  text = result.text_content  # clean markdown string
  # Or from local file:
  result = md.convert("/path/to/file.pdf")
  ```
- Supports: HTML, PDF, DOCX, XLSX, PPTX, images (OCR), audio, YouTube URLs, EPubs, CSV, JSON, XML, ZIP
- Use instead of BeautifulSoup/requests for any scrape-to-text pipeline
- Falls back to `requests` only if markitdown fails on a specific URL

### Local Servers & Ports

| Port | Protocol | What | Root / Script | Portproxy |
|------|----------|------|---------------|-----------|
| 4000 | HTTP | Kitchen dashboard | `kitchen/serve.sh` → `canvas/kitchen/` | `127.0.0.1 → 192.168.1.81` |
| 4100 | HTTP | Kitchen SQLite API | `kitchen/api.py` | `127.0.0.1 → 192.168.1.81` |
| 7747 | HTTP | AGOT dev server | `/home/tawfeeq/ramadan-clock-site/` | `127.0.0.1 → 192.168.1.81` |
| 7749 | HTTPS | AGOT phone testing (gyro) | `/home/tawfeeq/ramadan-clock-site/` | `0.0.0.0 → 192.168.1.81` |
| 11434 | HTTP | Ollama LLM | System service | `127.0.0.1 → 192.168.1.81` |

**Full kitchen docs:** `kitchen/README.md`

**WiFi IP**: `192.168.1.81` (WSL2 mirrored networking)

**Windows portproxy rules** (PowerShell admin — needed after reboot):
```powershell
netsh interface portproxy add v4tov4 listenport=4000 listenaddress=127.0.0.1 connectport=4000 connectaddress=192.168.1.81
netsh interface portproxy add v4tov4 listenport=4100 listenaddress=127.0.0.1 connectport=4100 connectaddress=192.168.1.81
netsh interface portproxy add v4tov4 listenport=11434 listenaddress=127.0.0.1 connectport=11434 connectaddress=192.168.1.81
netsh interface portproxy add v4tov4 listenport=7747 listenaddress=127.0.0.1 connectport=7747 connectaddress=192.168.1.81
netsh interface portproxy add v4tov4 listenport=7749 listenaddress=0.0.0.0 connectport=7749 connectaddress=192.168.1.81
# Verify: netsh interface portproxy show v4tov4
```

**Quick health check:**
```bash
for p in 4000 4100 11434 7747; do echo "$p: $(curl -s -o /dev/null -w '%{http_code}' http://localhost:$p/)"; done
```

**Note**: Python HTTP servers die silently. `kitchen/serve.sh` auto-restarts the dashboard. API server (`api.py`) needs manual restart if it dies. Always verify with `ss -tlnp | grep PORT`.

### Twitter/X Scraping
- **Primary**: `api.vxtwitter.com` — JSON API, no auth needed
  - Single tweet: `curl -sL "https://api.vxtwitter.com/<handle>/status/<id>"`
  - Returns: full text, media URLs, likes, retweets, date
- **Profile check**: `syndication.twitter.com/srv/timeline-profile/screen-name/<handle>` — confirms profile exists, returns timeline HTML
  - ```bash
    curl -sL "https://syndication.twitter.com/srv/timeline-profile/screen-name/HANDLE" | python3 -c "
    import sys, re; html = sys.stdin.read()
    print('NOT FOUND' if 'does not exist' in html else 'EXISTS')
    m = re.search(r'\"name\":\"([^\"]+)\"', html)
    if m: print('Name:', m.group(1))
    "
    ```
- **NEVER use `web_fetch` on x.com** — always blocked. Use the above methods.
- Script: `tools/twitter-feed.sh <handle>` or `tools/twitter-feed.sh --tweet <id>`
- Use vxtwitter for daily monitoring of tracked handles

### Supabase — A Gift of Time
- Project URL: `https://ypniokxbftuebagppxzj.supabase.co`
- Anon key (public): `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlwbmlva3hiZnR1ZWJhZ3BweHpqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzExOTQ2MjcsImV4cCI6MjA4Njc3MDYyN30.u63gpVUX7bOm5WQZkgt1elVWwwSBx_UGektwDTnllhw`
- Tables: `signups`, `feedback`, `analytics`
- RLS: insert-only for anon, no public reads
- Need service_role key to READ data (ask Tawfeeq if needed)
- Formspree also configured: `https://formspree.io/f/mojndzlr` (backup)

### Lookdev Pipeline (GPU Chrome — RTX A6000)
- **Chrome**: `/usr/bin/google-chrome-stable` (v145)
- **Puppeteer**: `puppeteer-core` with `executablePath: '/usr/bin/google-chrome-stable'`
- **Env vars** (MUST set for GPU):
  ```
  GALLIUM_DRIVER=d3d12
  MESA_D3D12_DEFAULT_ADAPTER_NAME=NVIDIA
  LD_LIBRARY_PATH=/usr/lib/wsl/lib:$LD_LIBRARY_PATH
  ```
- **Chrome args** (ALL required):
  ```
  --no-sandbox --disable-gpu-sandbox --use-gl=angle --use-angle=gl-egl
  --ozone-platform=headless --ignore-gpu-blocklist --disable-dev-shm-usage
  --in-process-gpu --enable-webgl
  ```
- **Renderer**: `ANGLE (Microsoft Corporation, D3D12 (NVIDIA RTX A6000), OpenGL ES 3.1)`
- **GPU path**: Chrome ANGLE → Mesa EGL → d3d12 Gallium → libdxcore → /dev/dxg → Windows NVIDIA driver → RTX A6000
- **Site load wait**: Three.js + HDRI takes ~12s — `await new Promise(r=>setTimeout(r,12000))` after `domcontentloaded`
- **Viewport**: `{width:430, height:932, deviceScaleFactor:2}` for mobile lookdev
- **Production repo**: `/home/tawfeeq/ramadan-clock-site/` → GitHub Pages at agiftoftime.app
- **Local dev server**: `cd /home/tawfeeq/ramadan-clock-site && python3 -m http.server <port>`
- **Rule 0c workflow**: Edit → syntax check → serve locally → GPU screenshot → inspect → iterate → push only when verified
- **NEVER use llvmpipe/SwiftShader** — if renderer string doesn't show `D3D12 (NVIDIA RTX A6000)`, fix before proceeding

### Lookdev Crop Coordinates (430x932 viewport, 2x DPR)
- **Full clock (landing)**: `{x:60, y:190, width:740, height:740}`
- **Subdial at 6 o'clock (landing)**: `{x:100, y:210, width:240, height:240}`
- **Full landing page**: no clip (full viewport screenshot)
- Always verify coordinates if layout changes

### WSL npm SSL Fix
- WSL2 has recurring OpenSSL cipher failures when npm fetches from registry
- `ERR_SSL_CIPHER_OPERATION_FAILED` / `ossl_gcm_stream_update:cipher operation failed`
- **What works:** `export NODE_OPTIONS=--openssl-config=/dev/null` then `sudo -E npm i -g <package>`
- For tarballs: `curl -L <url> -o /tmp/pkg.tgz` may also fail (same SSL issue)
- If curl works: download tarball first, then install from local file with the NODE_OPTIONS trick
- Full sequence that worked (2026-02-17):
  ```
  curl -L https://registry.npmjs.org/openclaw/-/openclaw-2026.2.17.tgz -o /tmp/openclaw.tgz
  export NODE_OPTIONS=--openssl-config=/dev/null
  sudo -E npm i -g /tmp/openclaw.tgz
  ```

### Lookdev Crop Coordinates (430x932 viewport, 2x DPR)
- **Full clock (landing)**: canvas is ~370px diameter centered at (215, 280) in CSS → DPR crop: `{x:60, y:190, width:740, height:740}`
- **Subdial at 6 o'clock**: center ~(215, 420) in CSS → DPR crop: `{x:280, y:700, width:200, height:200}`
- **Fullscreen clock**: fills viewport, subdial at ~(215, 620) → DPR crop: `{x:280, y:1100, width:200, height:200}`
- Always verify coordinates if layout changes

### Crew Model Assignments (Claude Code CLI)
| Agent | Model | Flag | Rationale |
|-------|-------|------|-----------|
| **Chris (Lookdev)** | Opus | `--model opus` | Aesthetic judgment, taste, nuance |
| **Devon (Builder)** | Sonnet (default) | _(none)_ | Code implementation |
| **Brett (Reviewer)** | Sonnet or Qwen local | _(none)_ or Ollama | Diff review, QA |
| **Bob (3D)** | Sonnet (default) | _(none)_ | Geometry, math |

Claude Code default model: `sonnet` (set in `~/.claude/settings.json`).
Override per spawn: `claude --model opus --print --permission-mode bypassPermissions "..."`

### Ollama (Local LLM — RTX A6000)
- **Service**: `systemctl status ollama` (runs on port 11434)
- **Models**:
  - `qwen3.5:35b-a3b` (24GB) — **Brett's reviewer model**. Beats Claude Opus 4.5 on SWE-bench. Code review, diff analysis, thinking mode. ~2.8s/200 tokens warm.
  - `qwen2.5-coder:32b` (19GB) — Backup code model.
  - `llama3:70b` (39GB) — Heavy reasoning. Needs both GPUs. Slow cold start.
  - `llama3:latest` (4.7GB) — Lightweight tasks, cron reinforcement. ~1s response.
- **API**: `curl http://localhost:11434/api/generate -d '{"model":"qwen2.5-coder:32b","prompt":"...","stream":false}'`
- **Cold start**: ~30s (model load into VRAM). Warm: instant.
- **VRAM**: Qwen 32B fits on one A6000 (20GB/48GB). Llama 70B spans both.
- **Brett script**: `brett-review.sh` — reads .crew/BRIEF.md + git diff, sends to Qwen, writes .crew/REVIEW.md
- **Token cost**: ZERO — all local. No rate limits, no API costs.

### References
- `references/claude-skills-guide.pdf` — Anthropic's "Complete Guide to Building Skills for Claude" (33 pages, Jan 2026)
  - Skills = structured systems, not just prompts
  - Covers: SKILL.md format, testing, workflow patterns, org deployment
  - Directly relevant to our OpenClaw skill usage + potential skill creation

## Why Separate?

Skills are shared. Your setup is yours. Keeping them apart means you can update skills without losing your notes, and share skills without leaking your infrastructure.

---

Add whatever helps you do your job. This is your cheat sheet.

### Deployment Pipeline (agiftoftime.app)

**Remotes:**
| Remote | Repo | Purpose |
|--------|------|---------|
| `origin` | `cookmom/ramadan-clock-site` | Legacy (backup) |
| `stagingrepo` | `cookmom/ramadan-clock-site-staging` | Legacy staging preview |
| `tawfeeq` | `tawfeeqmartin/agiftoftime` | **Primary** — Cloudflare deploys from here |

**Branches:** `staging` (dev) → `main` (production)

**Hosting:** Cloudflare Pages (free tier), auto-deploys on push to `main`

**Domain:** `agiftoftime.app` — DNS via Cloudflare, registered on Squarespace

**Production vs Staging behavior** (same codebase, hostname switch):
- `agiftoftime.app` → production: dev panel disabled (D key + `?dev` blocked), version tag hidden
- `agiftoftime.pages.dev` / `localhost` / staging URLs → dev panel + version tag enabled
- Gate: `var _isProduction = (location.hostname === 'agiftoftime.app');` in `glass-cube-clock.js`

**Push flow:**
```bash
# After edits:
./test-render.sh                    # GPU Chrome verify
git add -A && git commit -m "msg"   # commits as Tawfeeq Martin
git push tawfeeq staging            # staging preview
git push tawfeeq staging:main       # production deploy (auto via Cloudflare)
```

**Git author:** `Tawfeeq Martin <tawfeeqmartin@gmail.com>` (repo-level config)

**GitHub token (tawfeeqmartin):** Fine-grained PAT, all repos, admin+contents. Stored in `tawfeeq` remote URL.
