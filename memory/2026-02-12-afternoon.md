# 2026-02-12 Afternoon Session

## Kitchen Fixes (Critical)
- Sub-agent `kitchen-inspo-expand` broke the page with **54 double-escaped quotes** (`\\'s` instead of `\'s`) and a **truncated Anthony McCall entry** (missing fields, jumped into CONCEPTS array)
- Fixed all escapes with sed, rebuilt McCall entry manually
- **Process drawer → floating popup**: Replaced inline drawer with FAB button (🔥, bottom-left) + popup window. Tawfeeq explicitly requested sub-agent/reasoning messages NOT in main chat thread — wants pop-out window
- **DOMContentLoaded bug**: Moved FAB/popup HTML to end of body but event listeners were in earlier script block → `null.addEventListener()` killed ALL JS including WebSocket. Fixed by wrapping in `DOMContentLoaded`
- Broadened `isProcessMsg()` regex to catch more sub-agent noise patterns

## Lessons Learned
- **Sub-agents producing JS strings WILL double-escape quotes** — must validate/fix after every sub-agent edit to kitchen HTML
- **Element binding order matters** — if HTML is after script, must defer listeners
- **One JS error kills the entire page** — no partial degradation in single-file HTML apps
- **Always syntax-check after sub-agent edits**: extract JS, run `node -c`, fix before deploy

## Bookmark: VertexCGI × LV Snow Monogram
- @blankspac_e (74K followers) shared VertexCGI work — massive Louis Vuitton monogram carved into ski slope snow
- Only readable from gondola altitude — Nazca lines principle
- **Taste pattern confirmed**: Tawfeeq gravitates to scale-dependent reveals (caustics, butterflies, now this). Zoom-as-reveal could be the fxhash interaction mechanic.

## Tawfeeq Feedback
- "I need this to feel inputting and fresh" — inspo content needs to be genuinely surprising, not just famous names with placeholder images
- Spawned a cook to find real images for SVG placeholders + add 10 fresh/surprising entries
- Kitchen reliability is becoming a trust issue — multiple crashes in one session. Need to be more careful with deploys.

## Sub-agent Deploy Gate (NEW RULE - Tawfeeq set 2026-02-12)
- **"Check all the subagent work before running it on a live site"**
- **"I don't have time to qc everything with you"** — Tawfeeq frustrated by repeated breakage
- **"need you to be more accountable and not so needy"**
- New process: sub-agents NEVER deploy to /tmp directly. I validate first:
  1. Extract JS → `node -c` syntax check
  2. Python check for double-escaped quotes (`\\\\'` → `\\'`)
  3. Check all my prior fixes still present (DOMContentLoaded, null guards, FAB HTML)
  4. Only then `cp` to `/tmp/kitchen.html`
- Sub-agent inspo cook completed: 89 entries total, all SVG placeholders replaced with real URLs, 10 new artists added. Had 45 double-escaped quotes — caught and fixed before deploy.

## New Artists Added
- Lawrence Abu Hamdan (Jordanian forensic sound, Turner Prize)
- Lulwah Al Homoud (Saudi generative calligraphy)
- Noor Riyadh 2025 (Saudi light festival)
- Kimsooja, Cevdet Erek, SpY, fabric|ch, Peter Vogel, Zahrah Al Ghamdi, Moritz Simon Geist

## Kitchen State
- workspace-v3.html (~248KB) served from /tmp/kitchen.html via Python HTTP on port 4000
- ~28 inspo entries, many with SVG placeholders needing real images
- Process popup (FAB + DOMContentLoaded fix) deployed
- WebSocket chat working after DOMContentLoaded fix
