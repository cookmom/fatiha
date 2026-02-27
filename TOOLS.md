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

### Twitter/X Scraping
- **Primary**: `api.vxtwitter.com` — JSON API, no auth needed
  - Single tweet: `curl -sL "https://api.vxtwitter.com/<handle>/status/<id>"`
  - Returns: full text, media URLs, likes, retweets, date
- **Backup**: `syndication.twitter.com/srv/timeline-profile/screen-name/<handle>` — full timeline HTML (rate limited)
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

### References
- `references/claude-skills-guide.pdf` — Anthropic's "Complete Guide to Building Skills for Claude" (33 pages, Jan 2026)
  - Skills = structured systems, not just prompts
  - Covers: SKILL.md format, testing, workflow patterns, org deployment
  - Directly relevant to our OpenClaw skill usage + potential skill creation

## Why Separate?

Skills are shared. Your setup is yours. Keeping them apart means you can update skills without losing your notes, and share skills without leaking your infrastructure.

---

Add whatever helps you do your job. This is your cheat sheet.
