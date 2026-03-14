# PREFLIGHT.md — Read Before EVERY Action on agiftoftime.app

## The 5 Sins (Things I Keep Doing Wrong)

### 1. STALE CACHE BUST
Every time `glass-cube-clock.js` changes, `index.html` version MUST increment.
Use `ship.sh` — it auto-bumps. Never manual commit + push.

### 2. TESTING MY RENDER, NOT TAWFEEQ'S DEVICE
My headless Chrome ≠ iPhone Safari. Key differences:
- iPhone renders at 3x DPR (my renders are 1x)
- iPhone Safari has different canvas sizing behavior
- Texture filtering/blur looks different at higher DPR
- **Always assume sharper edges on device than in my render**
- When Tawfeeq says "sharp" and my render looks "soft" → he's right, I'm wrong

### 3. SURFACE-LEVEL DIAGNOSIS
"Blur the texture" doesn't fix geometry edges. Think about ALL sources of sharpness:
- Texture content (arch shape, strokes)
- Texture filtering (bilinear vs blur)
- **Geometry boundaries** (PlaneGeometry has hard rectangular edges)
- Material blending (additive can clip)
- DPR scaling (edges sharpen at higher resolution)
Before applying a fix, LIST every possible source, then fix ALL of them.

### 4. PUSHING WITHOUT SHOWING TAWFEEQ
The workflow is: render → show Tawfeeq → get approval → push.
Never: render → push → show Tawfeeq.
Never: describe changes → push without render.

### 5. LOSING CONTEXT MID-SESSION
After compaction, re-read:
- This file (PREFLIGHT.md)
- memory/lessons.md
- MEMORY.md (main session only)
- Last 2 daily notes

## ⚠️ SIN #6 — TOUCHING THE CUBE WITHOUT WARNING (Added 2026-03-04)
**Tawfeeq is happy with the cube right now. Do NOT change:**
- Shader code (FBO, dichroic, IOR, Fresnel, tone mapping)
- Cube geometry or subdivision
- cubeSun / lighting rig affecting cube appearance
- Per-face optical differentiation values
- Transmission, absorption, any glass material property

**If ANY proposed change could affect cube rendering/aesthetics/quality:**
1. **STOP**
2. Message Tawfeeq IN BOLD before touching anything
3. Wait for explicit approval
4. Only then proceed

This applies to chef AND all crew agents (Chris, Devon, Bob, Brett).

## ⚠️ SIN #7 — GUESSING AND SHIPPING (Added 2026-03-14)
**The pattern that has cost Tawfeeq DAYS:**
I make a spatial/visual change → eyeball a screenshot → ship it → it's wrong → repeat 4x.

**HARD GATE — Before sending ANY visual work to Tawfeeq:**
1. Run `verify.js` (for fatiha.app) or log actual computed values
2. Read the numbers. Do they match the intent? (e.g., "start bottom-right" → x>70%, y>80%)
3. If numbers don't match → FIX FIRST, don't render
4. Only after numbers verify → capture frames → screenshot → send

**If you catch yourself about to send a render without verification data:**
STOP. Run verify.js. Read the output. Then decide.

**Tawfeeq's kill switch:** If he says "verify" → stop everything, run the check, show numbers.

**One `console.log` takes 3 seconds. One wrong render wastes 15 minutes. Do the math.**

---

## Push Checklist (Print This On Your Brain)
- [ ] Code change saved
- [ ] `ship.sh "commit message"` (auto-bumps cache, commits, renders)
- [ ] Read the render screenshot MYSELF
- [ ] Check for: geometry edges, texture edges, blowouts, artifacts
- [ ] Send render to Tawfeeq
- [ ] Wait for approval
- [ ] `git push origin main`
- [ ] Confirm version tag updated in footer
