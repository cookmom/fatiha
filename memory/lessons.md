# lessons.md - What I've Learned the Hard Way

_Reviewed at session start. Every entry is a scar that makes me sharper._

## Format
Each lesson: what happened, what I did wrong, the rule I wrote to prevent it.

---

### 1. Never blame the user's device
**When:** Early sessions, Feb 2026
**What happened:** Blamed cache/browser when my code was broken.
**Rule:** Rule 0 — verify it yourself before blaming anything external. Own every mistake immediately.

### 2. Don't push untested work
**When:** Feb 15-16, 2026
**What happened:** Pushed code that hadn't been rendered/verified, Tawfeeq had to QC it.
**Rule:** Rule 0c — TEST before presenting. Run code, screenshot, verify visuals. Never push blind.

### 3. Don't blind-crank multiple requests
**When:** Feb 18, 2026
**What happened:** Made multiple changes without verifying each one individually.
**Rule:** Rule 0d — VERIFY every ask. Render and visually check EACH change before shipping.

### 4. Figma HTML-to-Design doesn't work for WebGL
**When:** Feb 20, 2026
**What happened:** Spent multiple attempts trying to capture agiftoftime.app (Three.js canvas) via Figma's HTML-to-Design capture. The script serializes DOM, not rendered WebGL pixels — it either times out or captures a flat rectangle.
**Lesson:** For WebGL/Three.js/canvas-based sites, use GPU screenshots via puppeteer instead. Figma capture is for DOM-based sites only.

### 5. captureForDesign() hangs on heavy pages
**When:** Feb 20, 2026
**What happened:** The Figma capture JS injection called `captureForDesign()` and never resolved on a Three.js page with HDRI loading.
**Lesson:** Set a timeout on capture calls. If it doesn't resolve in 30s, it's not going to. Fail fast and switch approach.

### 6. Always test with GPU Chrome and check console after code changes
**When:** Feb 26, 2026
**What happened:** Made multiple code changes (adhan-js integration, prayer time rewrites) without testing. Broke the clock — `ptParseMin` crashed on missing `Midnight` key, bigdatacloud API returned 403, service worker choked on chrome-extension URLs. Tawfeeq had to find "thousands of errors" himself.
**Rule:** Rule 0c updated — after EVERY code change, run GPU Chrome (puppeteer-core + RTX A6000) to load the page AND check console for errors. Never use the OpenClaw headless browser (no GPU, no WebGL). Never tell Tawfeeq "refresh and check" without checking yourself first.

### 7. ALWAYS commit changes locally — git is your only safety net
**When:** Feb 26, 2026
**What happened:** Made an entire day of edits to glass-cube-clock.js (specular highlights, atan fix, prayer disc shader, dev panel, camera positions, lighting values — hundreds of lines). Never committed once. Then ran `git checkout -- glass-cube-clock.js` to "revert" a sub-agent's changes, which instantly wiped EVERYTHING. Hours of work gone. Had to manually rebuild from memory and screenshots.
**Rule:** ALWAYS `git commit` after any meaningful change — even if not pushing to remote. Commit early, commit often. Local commits are free insurance. NEVER run `git checkout` or `git restore` on a file with uncommitted work. Before any destructive git operation, ALWAYS check `git diff` first and commit or stash.

---

### 8. Long sessions degrade quality — dump state and start fresh
**Date:** 2026-02-26
**What happened:** After 15 compactions in a single session, I started missing obvious context ("we're fine" → kept questioning), repeating questions already answered, and making sloppy mistakes. Tawfeeq called it out: "why are you getting dumber?"
**What went wrong:** Each compaction loses nuance. After 15, I'm working from lossy summaries of summaries. Important details and recent decisions evaporate.
**Rule:** When compaction count hits ~10, proactively suggest a fresh session. Before closing: dump ALL current state to `memory/YYYY-MM-DD.md` and `MEMORY.md` — every value, every decision, every design choice. Fresh-me reads these on startup and gets clean context. Quality > marathon sessions.

### 9. Audit transcripts for EVERY detail, not just "does the variable exist"
**Date:** 2026-02-26
**What happened:** First sub-agent audit said "zero discrepancies." Tawfeeq immediately found theme-color sampling was wrong (`_themeFrameCount = 0` instead of `3599`, `>= 60` instead of `>= 3600`). The audit checked if code existed, not if values matched.
**What went wrong:** Surface-level verification. Checking "is there a theme sampler?" instead of "does `_themeFrameCount` init to 3599 and threshold at 3600?"
**Rule:** Audits must check EXACT VALUES — initial values, thresholds, constants, comments, conditionals. A variable existing with the wrong value is worse than missing (silent bug vs visible error).

---

_Add new lessons as they happen. Be honest. Future-me will thank present-me._
