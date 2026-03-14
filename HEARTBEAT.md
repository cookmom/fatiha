# HEARTBEAT.md

## Pre-Flight (EVERY heartbeat)
- Re-read `PREFLIGHT.md` — the 5 sins
- If agiftoftime.app work is active: verify last push has matching cache bust version
- Run `bash /home/tawfeeq/ramadan-clock-site/pre-push-check.sh` to catch stale state

## Check Supabase Inbox
- Query `signups` and `feedback` tables for new entries (status='new')
- If anything new: notify Tawfeeq on Telegram immediately
- Flag business inquiries, bug reports, or anything urgent
- Mark reviewed items (update status via service_role key)
- Silent if nothing new

## Twitter Watchlist (Chef's Daily)
Check these handles 1x/day during cron daily, report anything notable:
- **@karpathy** — autoresearch project (autonomous LLM training agent on git branches). Track progress, new repos, insights on autonomous AI research loops. Relevant to our dual A6000 training pipeline (fatiha.app stroke model).
- **@yazins** — offline Quran verse recognition (FastConformer phoneme model). Track accuracy improvements, streaming perf, new releases. Direct dependency for fatiha.app ASR layer.
- **@IOivm** (Aluan Campos Uribe) — InkField, p5.brush. Track releases, ink physics updates. Our brush rendering engine for fatiha.app.

Use: `tools/twitter-feed.sh <handle>` for each.

### Discovery Mode (1–2x/week rotation)
Don't just monitor — **scout**. Search for new accounts, researchers, papers, and repos in these domains:
- **Autonomous AI research** (self-improving agents, automated ML, neural architecture search)
- **Arabic/Quran NLP** (speech recognition, calligraphy generation, Islamic tech)
- **Procedural art + creative coding** (p5.js, GLSL, Three.js, generative calligraphy, ink simulation)
- **Real-time rendering** (WebGPU, TSL, virtual production, LED volume tech)
- **Browser AI** (on-device models, ONNX in browser, WebNN, client-side inference)
- **Eurorack / generative music** (MIDI sequencing, Euclidean rhythms, modular synthesis)

Search methods: Twitter search, HN, arxiv, GitHub trending, Papers With Code.
When you find something genuinely interesting, add to watchlist + flag to Tawfeeq in the daily briefing.
Quality over quantity — only surface things that sharpen our edge or open new doors.

## ⚠️ OpenClaw Fork Sync Alert (2026-03-01)
- Fork `cookmom/openclaw` is **4,430 commits behind** upstream
- Auto-sync blocked: upstream has workflow changes → needs `workflow` gh scope
- **Action needed:** Run on your machine:
  ```
  gh auth refresh -s workflow
  gh repo sync cookmom/openclaw
  ```
- Notable upstream: Android capability parity, Feishu mega-drop, cron routing fixes, 2026.2.26+2026.2.27 released
