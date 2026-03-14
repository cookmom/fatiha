# Kitchen Local Stack — Build Spec

## Overview
Replace Supabase-backed pantry with fully local: SQLite + Python API + Ollama analysis.

## Files to Create

### 1. `kitchen/schema.sql` — run once to create DB
### 2. `kitchen/migrate-from-supabase.py` — one-time migration
### 3. `kitchen/api.py` — local API server (port 4100)
### 4. `kitchen/analyze.py` — scrape URLs + Qwen analysis pipeline
### 5. Update `canvas/kitchen/index.html` — Supabase → localhost:4100

## Stack
- SQLite at `/var/lib/cookmom-workspace/kitchen.db`
- Python stdlib only (no pip)
- Ollama at `localhost:11434`, model `qwen3.5:35b-a3b`
- API on port 4100, kitchen HTML on port 4000

## Schema
See `schema.sql`

## API Endpoints
- `GET /api/items?category=X&date=Y&search=Z&limit=N`
- `GET /api/items/<id>`
- `POST /api/items` (JSON body, single or array)
- `PATCH /api/items/<id>` (partial update)
- `GET /api/categories` (list with counts)

## Analysis Prompt
See `analyze.py` — structured WHO/WHAT/WHERE/HOW/OPPORTUNITIES/IMPLEMENT/ALGO

## Kitchen HTML Changes
- Replace Supabase URL+headers with `http://localhost:4100/api/items`
- Spotlight: show `summary_brief` as header, `analysis` pre-rendered, `images` as scrollable gallery
- Keep browser Qwen for interactive chat
