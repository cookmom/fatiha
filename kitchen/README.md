# Kitchen Dashboard

Local dashboard for chef's daily briefings, news analysis, and chat.

## Architecture

```
Browser (localhost:4000)
  ├── Kitchen HTML (canvas/kitchen/index.html)
  │     ├── Pantry: fetches items from Kitchen API
  │     ├── Chat: streams from Ollama directly
  │     ├── Code Canvas: p5.js sketch runner
  │     ├── Spotlight: item detail + analysis + image gallery
  │     └── Team Drawer: agent status display
  │
  ├── Kitchen API (localhost:4100)
  │     └── kitchen/api.py — Python stdlib REST API
  │           ├── GET  /api/items?limit=N&category=X&date=Y
  │           ├── POST /api/items (batch insert)
  │           ├── PATCH /api/items/:id (update)
  │           └── GET  /api/categories
  │           └── SQLite: /var/lib/cookmom-workspace/kitchen.db
  │
  └── Ollama (localhost:11434)
        └── qwen3.5:35b-a3b (35B MoE, 3B active)
              ├── Chat responses (streaming)
              └── Item analysis (via kitchen/analyze.py)
```

## Files

| File | Purpose |
|------|---------|
| `canvas/kitchen/index.html` | Main dashboard UI (single HTML file, all inline) |
| `kitchen/api.py` | REST API server (Python stdlib, no pip) |
| `kitchen/analyze.py` | Batch analysis pipeline (scrape URLs + Ollama) |
| `kitchen/schema.sql` | SQLite schema |
| `kitchen/migrate-from-supabase.py` | One-time migration from Supabase (already run) |
| `kitchen/serve.sh` | Auto-restart HTTP server for dashboard |
| `kitchen/BUILD-SPEC.md` | Original build spec |

## Ports

| Port | Protocol | Service | Root/Script |
|------|----------|---------|-------------|
| 4000 | HTTP | Kitchen dashboard | `canvas/kitchen/index.html` via `kitchen/serve.sh` |
| 4100 | HTTP | Kitchen REST API | `kitchen/api.py` |
| 11434 | HTTP | Ollama LLM | System service |

## Starting Everything

```bash
# 1. Kitchen API (if not running)
cd ~/.openclaw/workspace
nohup python3 kitchen/api.py > /tmp/kitchen-api.log 2>&1 &

# 2. Kitchen dashboard HTTP server (auto-restarts)
nohup kitchen/serve.sh > /tmp/kitchen-serve.log 2>&1 &

# 3. Ollama should already be running as a system service
# Verify: curl http://localhost:11434/api/tags
```

## Windows Portproxy (WSL2)

The kitchen runs inside WSL2. For the browser on Windows to reach these services, port forwarding is required:

```powershell
# Run in PowerShell as Administrator
netsh interface portproxy add v4tov4 listenport=4000 listenaddress=127.0.0.1 connectport=4000 connectaddress=192.168.1.81
netsh interface portproxy add v4tov4 listenport=4100 listenaddress=127.0.0.1 connectport=4100 connectaddress=192.168.1.81
netsh interface portproxy add v4tov4 listenport=11434 listenaddress=127.0.0.1 connectport=11434 connectaddress=192.168.1.81

# Verify all rules:
netsh interface portproxy show v4tov4
```

**Note:** WSL2 IP (`192.168.1.81`) may change on reboot if not using mirrored networking. Check with `hostname -I` inside WSL.

## Checking Status

```bash
# Quick health check — all three services
echo "Dashboard: $(curl -s -o /dev/null -w '%{http_code}' http://localhost:4000/)"
echo "API:       $(curl -s -o /dev/null -w '%{http_code}' http://localhost:4100/api/items?limit=1)"
echo "Ollama:    $(curl -s -o /dev/null -w '%{http_code}' http://localhost:11434/api/tags)"
```

## Database

- **Path:** `/var/lib/cookmom-workspace/kitchen.db`
- **Schema:** See `kitchen/schema.sql`
- **Tables:** `daily_items` (id, created_at, date, category, title, summary, url, tags, source, priority, analysis, summary_brief, images)
- **Current data:** 94 items (78 daily + 16 favorites), seeded from Supabase on 2026-03-02

## Analysis Pipeline

`kitchen/analyze.py` scrapes each item's URL for content and images, then sends to Ollama for structured analysis.

```bash
# Analyze all unanalyzed items
python3 kitchen/analyze.py

# Analyze specific items by ID
python3 kitchen/analyze.py --id <uuid>
```

Output format: BRIEF / WHO / WHAT / WHERE / HOW / OPPORTUNITIES / IMPLEMENT / ALGO

**Key Ollama settings:**
- Model: `qwen3.5:35b-a3b`
- Endpoint: `/api/chat` (not `/api/generate`)
- `"think": false` — REQUIRED or Qwen burns all tokens on thinking, returns empty content
- SSL verification disabled for URL scraping

## Chat

Chat talks directly to Ollama (no OpenClaw gateway dependency):
- Model: `qwen3.5:35b-a3b`
- Streaming enabled
- 20-message context window
- System prompt: chef persona

## Category Taxonomy

| Category | Color | Description |
|----------|-------|-------------|
| vp | #4a9eff | Virtual production |
| ai | #ff6b6b | AI/ML |
| tools | #50c878 | Software tools |
| synths-eurorack | #c084fc | Synths & eurorack |
| art | #f59e0b | Art & installations |
| creative-coding | #06b6d4 | Creative coding |
| research | #8b5cf6 | Research papers |
| opportunities | #ef4444 | Grants, residencies, open calls |
| discovery | #10b981 | New discoveries |
| concepts | #f472b6 | Ideas & concepts |
| favorites | #eab308 | Starred items |

## Known Issues

- Python SimpleHTTPServer dies silently under load. `kitchen/serve.sh` auto-restarts it.
- Portproxy rules don't survive Windows reboot — re-run the PowerShell commands after restart.
- Kitchen HTML is a single ~2000-line file. Major sections: CSS (1-440), Data (441-780), Pantry JS (781-1230), API helpers (1230-1430), Chat (1430-1600), Mobile (1600+).
