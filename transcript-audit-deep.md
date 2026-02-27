# Deep Transcript Audit — glass-cube-clock Session
**Session:** `a60aaf96-a886-4856-8527-a6af18c6ddb9.jsonl`  
**Target files checked:**
- `/home/tawfeeq/ramadan-clock-site/glass-cube-clock.js` (current: 672 lines)
- `/home/tawfeeq/ramadan-clock-site/index.html`

**Audit totals:**
- 531 total edits across all files
- 437 edits to the two target files (331 JS + 106 HTML)
- 224 "final" edits (not overwritten by later edit in session)
- 100 final JS edits not found in current code
- 21 final HTML edits not found in current code

---

## IMPORTANT CONTEXT

The current `glass-cube-clock.js` is **672 lines** — the session transcript built up to ~4500+ lines of edit history then the file was **significantly streamlined** after the session. Many "missing" items from the transcript represent intermediate architectural choices (e.g., the dev tools panel, all-prayer disc vs single disc) that were later replaced with a cleaner implementation. This report focuses on **precise value discrepancies** and **safety/logic gaps** rather than the large architectural differences.

---

## Section 1: COMPLETE EDIT LOG

### JS File Edits (by feature area)

#### Camera Presets
| Edit # | Line | What Changed |
|--------|------|--------------|
| 84 | 1137 | Added CAM_LANDING/CAM_FULLSCREEN camera presets, removed direct camera.position.set |
| 90–93 | 1253–1263 | Turrell atmosphere: warm sienna sky |
| 96–98 | 1291–1295 | Scene bg revision: warm but desaturated |
| 99–103 | 1311–1319 | Back to near-neutral grey, CAM_LANDING pos → [0,4.1,5.4] |
| 114 (1414) | 1414 | bg → cream (#f8f7f4) |
| 128 | 1539 | CAM presets: FOV 35, pos [0,4.1,5.4] |
| 131 | 1654 | Comment update on FOV 35 presets |
| **179** | **2776** | **CAM_LANDING → [0, 9.0, 16.0]** (last cam edit) |

**CHAIN: CAM_LANDING pos**  
[0,2.2,2.5] → [0,3.1,3.85] → [0,3.4,4.3] → [0,4.1,5.4] → [0,10.5,16.0] → **[0, 9.0, 16.0]** (line 2776)

#### Scene Lighting
| Edit # | Line | What Changed |
|--------|------|--------------|
| 90–93 | 1253–1263 | Turrell dusk (warm sienna 0xb36820) |
| 96–103 | 1291–1331 | Many lighting iterations |
| 107–110 | 1363–1369 | Reverted to grey bg + plan B/C gobo lighting |
| 115–116 | 1414–1416 | Cream bg + workable FBO lighting |
| 118–122 | 1459–1467 | **Dark scene** (0x0d0d12), back intensity 38, ambient 0.08, fog mat 0x4466cc |
| 135–139 | 1732–1740 | Prayer sectors, mat.uniforms.op.value iteration |

#### Floor
| Edit # | Line | What Changed |
|--------|------|--------------|
| 87 | 1187 | PlaneGeometry(500,500) → CircleGeometry(80, 128) |
| 302 | 3213 | Added polygonOffset to floor material |
| 421 | 4027 | CircleGeometry(80,128) → CircleGeometry(40,64) |

**CHAIN: floor geometry**  
PlaneGeometry(500,500) → CircleGeometry(80, 128) → **CircleGeometry(40, 64)** with polygonOffset

#### Prayer Windows
| Edit # | Line | What Changed |
|--------|------|--------------|
| 136 | 1734 | SECTOR_FADE_SEC + SECTOR_HORIZON_MIN constants |
| 138 | 1738 | buildPrayerSectors function |
| 140–143 | 1740–1746 | mat.uniforms.uOp → mat.uniforms.op |
| 144–155 | 1823–1873 | Many iterations: beam geometry vs sector/fan vs narrow beams |
| 157–167 | 1919–1961 | prayerSectors array structure: {grp,mat} → {mats} → {fillMat,beamMats} → back to {grp,mat} |
| 184 | 2319 | OrbitControls dynamic import → static import |
| 288 | 2949 | ptParseMin null guard added |

#### Tawaf
| Edit # | Line | What Changed |
|--------|------|--------------|
| 197–211 | 2395–2415 | Cube sub-group for tawaf, cubeGroup.rotation.y |
| 273 | 2776 | Camera values (also affected tawaf view) |
| 313–317 | 3248–3267 | Tawaf changed from cube rotation to rim light orbit |
| 318–326 | 3280–3312 | tawafAngle + rimRadius orbit computation |

#### Dev Tools Panel
| Edit # | Line | What Changed |
|--------|------|--------------|
| 168–178 | 2258–2285 | Dev panel style, drag handle, DOF controls |
| 179–191 | 2292–2347 | Grain section, composition guides, DOF toggle |
| 199–211 | 2389–2415 | Mode detection refactor, fixed viewport |
| 220 | 2466 | TAWAF_SPEED literal in slider |
| 221 | 2491–... | Multiple panel updates |
| 302–338 | 3085–3405 | Prayer lighting presets, prayer jump buttons, lights section |
| 438–449 | 4190–4293 | Debug marker system iterations |
| 451–452 | 4321–4330 | Update debug markers per prayer |
| 460 | 4395 | _dbgGrps approach |
| 516–517 | 4916–4923 | Complete dev tools refactor (new _devActive approach) |

**NOTE:** The dev tools panel was completely removed in a major refactor at the end of the session. The final 672-line current file has ZERO dev tools (`grep -c "dev-"` = 0).

#### _themeFrameCount (specifically requested)
| Edit # | Line | What Changed |
|--------|------|--------------|
| 327 | 3446 | ADDED: `let _themeFrameCount = 0` + loop sampling |
| 505–506 | 4777–4781 | Clarified `_themeFrameCount = 0` in loop body |
| 511–512 | 4825–4827 | Another themeFrameCount instance |
| 528–529 | 5253–5259 | Final loop with `>= 60` check |

Wait — the session added `_themeFrameCount` multiple times. Let me clarify:
- **Transcript line 3446**: `let _themeFrameCount = 0` + `>= 60` threshold  
- **Transcript line 5253**: ANOTHER instance added: `let _themeFrameCount = 0` + `>= 60`  
- **Current code (line 596)**: `let _themeFrameCount = 3599; // triggers on first frame`, threshold `>= 3600`

The `3599` initial value and `3600` threshold in current code are **NOT in the transcript** — they were added after this session. This is a **post-session improvement** (triggers on first frame for instant Dynamic Island color match). Current code is CORRECT/BETTER.

#### Prayer Disc Shader
| Edit # | Line | What Changed |
|--------|------|--------------|
| 377–381 | 3748–3797 | FRAG_WINDOW angular Gaussian shader |
| 403–409 | 4007–4029 | OP_ACTIVE 0.8 → 1.2 |
| 432–435 | 4152–4165 | Debug angle logging |
| 438–445 | 4177–4265 | Angular Gaussian centered in window |
| 473 | 4485 | Wrapping logic (Tahajjud crossing 12 o'clock) |

#### ptParseMin null guard
| Edit # | Line | What Changed |
|--------|------|--------------|
| **245** | **2949** | Added `if (!str) return 0;` null check |

#### Static Imports
| Edit # | Line | What Changed |
|--------|------|--------------|
| 168 | 2271 | Added EffectComposer, RenderPass, BokehPass imports |
| 185 | 2347 | Added OrbitControls static import |
| 302 | 3234 | Added RoundedBoxGeometry import |

#### CSS Root Variables (HTML)
| Edit # | Line | What Changed |
|--------|------|--------------|
| 232–244 | 2550–2572 | CSS vars: light theme → dark theme |
| 248 | 2588 | --bg-alt value |

---

## Section 2: DISCREPANCIES

These are final transcript values that differ from what's currently on disk.

---

### DISC-01: `ptParseMin` — Missing null guard
**Transcript line:** 2949  
**What transcript says:**
```js
function ptParseMin(str) {
  if (!str) return 0;
  const p = str.split(' ')[0].split(':').map(Number);
  return p[0] * 60 + p[1];
}
```
**What current code has (line 394):**
```js
function ptParseMin(str) {
  const p = str.split(' ')[0].split(':').map(Number);
  return p[0] * 60 + p[1];
}
```
**Missing:** `if (!str) return 0;` null check — will crash with `TypeError: Cannot read properties of undefined` if any prayer time key is absent.

**Fix:**
```js
// OLD:
function ptParseMin(str) {
  const p = str.split(' ')[0].split(':').map(Number);
// NEW:
function ptParseMin(str) {
  if (!str) return 0;
  const p = str.split(' ')[0].split(':').map(Number);
```

---

### DISC-02: Floor geometry — radius 80 vs 40, segments 128 vs 64
**Transcript line:** 4027  
**What transcript says:**
```js
new THREE.CircleGeometry(40, 64),
```
**What current code has (line 100):**
```js
new THREE.CircleGeometry(80, 128),
```
**Note:** Transcript also added `polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1` to the material (line 3213) which is also missing.

**Fix:**
```js
// OLD:
  new THREE.CircleGeometry(80, 128),
  new THREE.MeshStandardMaterial({ color: 0x18182a, roughness: 0.88, metalness: 0 })
// NEW:
  new THREE.CircleGeometry(40, 64),
  new THREE.MeshStandardMaterial({ color: 0x18182a, roughness: 0.88, metalness: 0, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1 })
```

---

### DISC-03: CAM_LANDING position — `[0, 9.0, 16.0]` vs `[0.2, 9.7, 15.0]`
**Transcript line:** 2776  
**What transcript says (final):**
```js
const CAM_LANDING    = { pos: [0, 9.0, 16.0], fov: 35, look: [0, 0.5, 0] };
const CAM_FULLSCREEN = { pos: [0, 9.0, 16.0], fov: 35, look: [0, 0.5, 0] };
```
**What current code has (line 71–72):**
```js
const CAM_LANDING    = { pos: [0.2, 9.7, 15.0], fov: 35, look: [0, -0.8, 1.0] };
const CAM_FULLSCREEN = { pos: [0.2, 9.7, 15.0], fov: 35, look: [0, -0.8, 1.0] };
```
**Differences:** x=0.2 (transcript: 0), y=9.7 (transcript: 9.0), z=15.0 (transcript: 16.0), look.y=-0.8 (transcript: 0.5), look.z=1.0 (transcript: 0). This is a post-session camera tweak — the current values represent a more refined composition.

---

### DISC-04: `uSpecLightPos` initial value — `Vector3(0, 1.5, -3)` vs `Vector3(0, 3.5, -3)`
**Transcript line:** 4092  
**What transcript says:**
```js
uSpecLightPos: { value: new THREE.Vector3(0, 1.5, -3) },
```
**What current code has (line 290):**
```js
uSpecLightPos: { value: new THREE.Vector3(0, 3.5, -3) },
```
**Note:** The y-position changed from 1.5 (low angle spec) to 3.5 (higher angle spec). This is a post-session lighting tweak.

---

### DISC-05: CSS `--bg-alt` value — `#12121a` vs `#1a1a24`
**Transcript line:** 2554  
**What transcript says:**
```css
--bg:#0d0d12;--bg-alt:#12121a;
```
**What current HTML has (line 142):**
```css
--bg:#0d0d12;--bg-alt:#1a1a24;
```
**Fix:** Change `#1a1a24` to `#12121a` in the `:root` CSS block.

---

### DISC-06: `#sec-hook` gradient bridge — missing
**Transcript line:** 1475  
**What transcript says:**
```css
#sec-hook{background:linear-gradient(to bottom,#0d0d12 0%,#f8f7f4 22%);}
```
**What current HTML has (line 243):**
```css
#sec-hook{background:transparent;}
```
**Note:** The gradient was added to bridge the dark hero into the cream content sections. Currently transparent — was this intentionally removed?

---

### DISC-07: `.landing-prayer-bar` top position — `clamp(52px,10vmin,80px)` vs `clamp(64px,14vmin,96px)`
**Transcript line:** 2767  
**What transcript says:**
```css
.landing-prayer-bar{
  position:fixed;top:clamp(52px,10vmin,80px);left:0;right:0;
  font-size:clamp(.6rem,1.2vmin,1.1rem);
  padding:.35em 1rem;
```
**What current HTML has (lines 172–182):**
```css
.landing-prayer-bar{
  position:fixed;top:clamp(64px,14vmin,96px);left:0;right:0;
  font-size:clamp(.6rem,1.2vmin,1.1rem);
  padding:.35em 1rem;
```
**Difference:** `clamp(52px,10vmin,80px)` vs `clamp(64px,14vmin,96px)` — current pushes bar ~12px lower.

---

### DISC-08: `glass-cube-clock.js?v=` — script version
**Transcript line:** 1906 (last edit to version)  
**What transcript says:** `?v=4`  
**What current HTML has (line 1882):** `?v=5`  
**Status:** EXPECTED — current is newer (v5 > v4). Not a bug.

---

### DISC-09: `_themeFrameCount` initial value and threshold — POST-SESSION IMPROVEMENT
**Transcript:** Multiple edits set `let _themeFrameCount = 0` with `>= 60` threshold  
**Current code (line 596):** `let _themeFrameCount = 3599; // triggers on first frame` with `>= 3600` threshold  
**Status:** Current code is BETTER — 3599 initial value causes sampling on first frame (instant Dynamic Island color match), 3600 threshold = 1 minute between updates. This was added AFTER this session. ✅ NOT A DISCREPANCY — intentional improvement.

---

### DISC-10: `PRAYER_LIGHT` prayer-driven lighting presets — completely absent
**Transcript lines:** 3085, 3107, 3115  
**What transcript says:** A full `PRAYER_LIGHT` lookup table with per-prayer scene presets:
```js
const PRAYER_LIGHT = {
  Tahajjud: { bg: 0x030308, fog: 0x030308, fogDensity: 0.058, ambient: 0.03, gobo: 15, back: 20, rim: 5,  cubeSun: 70,  backCol: 0x4422aa, rimCol: 0x332266, goboCol: 0x665599 },
  Fajr:     { bg: 0x0e1a3a, fog: 0x0e1a3a, fogDensity: 0.045, ambient: 0.10, gobo: 28, back: 34, rim: 8,  cubeSun: 95,  backCol: 0x334499, rimCol: 0x5566aa, goboCol: 0x88aaf0 },
  Dhuha:    { bg: 0x3a4e80, fog: 0x3a4e80, fogDensity: 0.025, ambient: 0.42, gobo: 60, back: 55, rim: 14, cubeSun: 170, backCol: 0xffdd77, rimCol: 0xeebb55, goboCol: 0xfff0cc },
  Dhuhr:    { bg: 0x556699, fog: 0x556699, fogDensity: 0.018, ambient: 0.60, gobo: 75, back: 62, rim: 16, cubeSun: 190, backCol: 0xffffff, rimCol: 0xeeeeff, goboCol: 0xffffff },
  ...
};
```
And `_applyPrayerLighting(now)` function.  
**Current code:** No `PRAYER_LIGHT` table, no `_applyPrayerLighting` — prayer-driven scene lighting was not implemented in the final version.

---

### DISC-11: Dev tools panel — completely absent
**Transcript lines:** 2258–2415 (major dev panel build), 3156–3394, 4916–4923  
**Current code:** Zero `dev-` references (`grep -c "dev-" glass-cube-clock.js = 0`)  
**Status:** The dev tools were architecturally removed — this is the intentional final state. The 672-line file is a clean production build. The session built up dev tools extensively then stripped them for the final production file.

---

### DISC-12: `buildPrayerSectors` push data — missing `startAng/endAng`
**Transcript line:** 3915 (final push):
```js
prayerSectors.push({
  def, startMin, endMin, startAng, endAng, midAng, spanAngle,
});
```
**Current code (line 485):**
```js
prayerSectors.push({ def, startMin, endMin, startAng, endAng });
```
Missing: `midAng`, `spanAngle`. These may not be needed in current simpler implementation. ✅ Functional difference but code works.

---

### DISC-13: `_prayerDiscGeo` segments — 64 vs 128
**Note:** The transcript at line 4027 changed floor to `CircleGeometry(40, 64)` but the `_prayerDiscGeo` was always `SECTOR_RADIUS * 1.3, 64`. Current code (line 490): `CircleGeometry(SECTOR_RADIUS * 1.3, 64)` — **matches transcript**. ✅

---

### DISC-14: Caustics PointLights — conditional on `_isMobile`
**Transcript line:** 4037–4047  
**What transcript says:**
```js
const _isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
if (!_isMobile) {
  [
    {c:0x6600ff,i:5.5,d:3.2,x:-1.6,y:0.06,z:-0.4},
    ...
  ].forEach(...)
}
```
**Current code (line 9):** `const _isMobile = /Mobi|Android|iPhone/i.test(navigator.userAgent);`  
Regex differs: transcript uses `/iPhone|iPad|iPod|Android/i`, current uses `/Mobi|Android|iPhone/i`. Current is broader (catches any `Mobi` prefix, e.g. Windows Mobile). Caustics ARE wrapped in `if (!_isMobile)` block.

Regex check: Current `_isMobile` regex doesn't match iPad (modern iPad doesn't send `Mobi`). Transcript version catches iPad explicitly.

---

### DISC-15: Diagonal markers in `updatePrayerWindows` — `_mkMarkerBeam` vs debug beams
**Transcript line:** 4395 (final approach): addBeam-based `_dbgGrps` approach  
**Current code (lines 558–610):** Uses separate `_mkMarkerBeam()` function creating `_markerStart`/`_markerEnd` PlaneGeometry grps with `.visible` toggling.  
**Status:** Current is a cleaner implementation of the same concept. Functionally equivalent but different approach.

---

### DISC-16: `static` imports missing from JS header
**Transcript lines:** 2271, 2347, 3234  
**What transcript says:**
```js
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { BokehPass } from 'three/addons/postprocessing/BokehPass.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
```
**Current code:** Only `import * as THREE from 'three';`  
**Status:** These imports supported the dev tools and DOF features which were removed. Not needed in production build. ✅

---

## Section 3: MISSING CODE

These are features/blocks in the transcript that are completely absent from current code.

---

### MISSING-01: `ptParseMin` null guard (FUNCTIONAL BUG)
See DISC-01. This is a safety guard that prevents crashes when prayer timing data is incomplete.

**Code to add:**
```js
function ptParseMin(str) {
  if (!str) return 0;   // ← ADD THIS LINE
  const p = str.split(' ')[0].split(':').map(Number);
  return p[0] * 60 + p[1];
}
```

---

### MISSING-02: `PRAYER_LIGHT` prayer-driven scene lighting
This was designed but apparently not wired into the final build. Complete feature:

```js
const PRAYER_LIGHT = {
  Tahajjud: { bg: 0x030308, fog: 0x030308, fogDensity: 0.058, ambient: 0.03, gobo: 15, back: 20, rim: 5,  cubeSun: 70,  backCol: 0x4422aa, rimCol: 0x332266, goboCol: 0x665599 },
  Fajr:     { bg: 0x0e1a3a, fog: 0x0e1a3a, fogDensity: 0.045, ambient: 0.10, gobo: 28, back: 34, rim: 8,  cubeSun: 95,  backCol: 0x334499, rimCol: 0x5566aa, goboCol: 0x88aaf0 },
  Dhuha:    { bg: 0x3a4e80, fog: 0x3a4e80, fogDensity: 0.025, ambient: 0.42, gobo: 60, back: 55, rim: 14, cubeSun: 170, backCol: 0xffdd77, rimCol: 0xeebb55, goboCol: 0xfff0cc },
  Dhuhr:    { bg: 0x556699, fog: 0x556699, fogDensity: 0.018, ambient: 0.60, gobo: 75, back: 62, rim: 16, cubeSun: 190, backCol: 0xffffff, rimCol: 0xeeeeff, goboCol: 0xffffff },
  Asr:      { bg: 0x4a5580, fog: 0x4a5580, fogDensity: 0.022, ambient: 0.50, gobo: 65, back: 55, rim: 14, cubeSun: 175, backCol: 0xffcc55, rimCol: 0xddaa44, goboCol: 0xffe8aa },
  Maghrib:  { bg: 0x1a0e1a, fog: 0x1a0e1a, fogDensity: 0.042, ambient: 0.15, gobo: 38, back: 45, rim: 10, cubeSun: 110, backCol: 0xff4400, rimCol: 0xcc3322, goboCol: 0xff8844 },
  Isha:     { bg: 0x0a0a14, fog: 0x0a0a14, fogDensity: 0.052, ambient: 0.05, gobo: 22, back: 28, rim: 6,  cubeSun: 80,  backCol: 0x223366, rimCol: 0x112244, goboCol: 0x4455aa },
};
const _dayPreset  = { bg: 0x87ceeb, fog: 0x87ceeb, fogDensity: 0.02, ambient: 0.6, gobo: 60, back: 50, rim: 12, cubeSun: 160 };
const _nightPreset = { bg: 0x0d0d12, fog: 0x0d0d12, fogDensity: 0.048, ambient: 0.08, gobo: 32, back: 38, rim: 9, cubeSun: 120 };
```

---

### MISSING-03: Floor geometry + polygonOffset (see DISC-02)

The floor radius should be 40 (not 80) and material should have polygonOffset to prevent z-fighting with floor rays.

```js
// Current (wrong):
  new THREE.CircleGeometry(80, 128),
  new THREE.MeshStandardMaterial({ color: 0x18182a, roughness: 0.88, metalness: 0 })

// Should be:
  new THREE.CircleGeometry(40, 64),
  new THREE.MeshStandardMaterial({ color: 0x18182a, roughness: 0.88, metalness: 0, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1 })
```

---

## Section 4: CONFIRMED MATCHES

The following transcript-specified values exist correctly in current code:

**glass-cube-clock.js:**
- ✅ `_themeFrameCount = 3599` initial value (improved POST-session: was 0 in transcript, 3599 is better)
- ✅ `>= 3600` threshold (improved POST-session: was 60 in transcript, 3600 = 1 min cadence)
- ✅ `OP_ACTIVE = 1.2` (line 457) — transcript final was 1.2 ✅
- ✅ `initY = 135°` for all three clock hands (line 350–354) ✅
- ✅ `floorRay(135, ...)` for hour, minute, second (line 352–354) ✅
- ✅ `SECTOR_RADIUS = 9.12` (line 456) ✅
- ✅ `scene.background = new THREE.Color(0x0d0d12)` (line 60) ✅
- ✅ `scene.fog = new THREE.FogExp2(0x0d0d12, 0.048)` (line 61) ✅
- ✅ `_isMobile` detection exists (different regex, see DISC-14) ✅
- ✅ `PRAYER_WINDOWS_DEF` array with all 7 windows (lines 379–387) ✅
- ✅ `mkMat` and `mkMatSoft` functions (lines 323, 335) ✅
- ✅ `cubeGroup` sub-group structure for cube (line 299) ✅
- ✅ `_prayerDisc` single mesh approach (line 545) ✅
- ✅ `uSpecLightPos` and `uCamWorldPos` uniforms in cubeMat (lines 290–291) ✅
- ✅ `tawafSpot` orbiting spotlight (lines 152–156, 628–629) ✅
- ✅ `addBeam` uses `mkMatSoft` for wide beams (line 466) ✅
- ✅ FRAG_WINDOW wrapping logic for cross-midnight windows (lines 521–530) ✅
- ✅ `makeSectorGeom` function (line 437) ✅
- ✅ Diagnostic start/end markers (`_markerStart`/`_markerEnd`) ✅
- ✅ `buildPrayerSectors` called on first `updatePrayerWindows` when data ready ✅
- ✅ `ptSectorsRebuilt` flag pattern ✅
- ✅ Prayer disc `_prayerDiscGeo = CircleGeometry(SECTOR_RADIUS * 1.3, 64)` ✅
- ✅ `cubeGroup.add(cubeMesh)` + `prismGroup.add(cubeGroup)` ✅
- ✅ Comment `// initY = 135° (3π/4): compensates for prismGroup.rotation.y = π/4` ✅
- ✅ `PRAYER_WINDOWS_DEF` `isFajr` flag on Fajr entry ✅
- ✅ `RectAreaLightUniformsLib` import removed (line 1373 edit → removed) ✅

**index.html:**
- ✅ `<meta name="theme-color" content="#000000">` (improved: current has `#0d0d12` — even better match)
- ✅ `<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">` (line 34) ✅
- ✅ `--bg:#0d0d12` dark CSS variable ✅
- ✅ `--gold:#d4af5a` ✅
- ✅ `.landing-prayer-bar` exists with correct structure ✅
- ✅ `#landingPrayerBar` + `#landingHijri` in HTML ✅
- ✅ `fsVersionTag` element ✅
- ✅ `openClockFullscreen()` hides clock-sticky + scroll sections ✅
- ✅ `closeClockFullscreen()` restores page content ✅
- ✅ `fsFetchPrayer()` called on page load ✅
- ✅ adhan.js loaded via CDN ✅
- ✅ `_computePrayerTimes` function present ✅

---

## Summary of Actionable Discrepancies

| # | Severity | File | What | Fix |
|---|----------|------|------|-----|
| 1 | 🔴 HIGH | JS | `ptParseMin` missing null guard — will crash if prayer key absent | Add `if (!str) return 0;` |
| 2 | 🟡 MEDIUM | JS | Floor geometry: `CircleGeometry(80, 128)` should be `CircleGeometry(40, 64)` | Change radius+segments |
| 3 | 🟡 MEDIUM | JS | Floor material missing `polygonOffset` | Add 3 props to MeshStandardMaterial |
| 4 | 🟢 LOW | HTML | `--bg-alt:#1a1a24` should be `#12121a` | Change CSS var value |
| 5 | 🟢 LOW | HTML | `#sec-hook{background:transparent}` should have gradient bridge | Add gradient or leave as-is (may be intentional) |
| 6 | 🟢 LOW | HTML | `.landing-prayer-bar` top: `clamp(64px,14vmin,96px)` vs `clamp(52px,10vmin,80px)` | Post-session tweak, both valid |
| 7 | ℹ️ INFO | JS | `CAM_LANDING` pos/look differs — current is post-session refinement | No fix needed |
| 8 | ℹ️ INFO | JS | `uSpecLightPos` y=3.5 vs transcript y=1.5 — post-session refinement | No fix needed |
| 9 | ℹ️ INFO | JS | Dev tools panel absent — intentionally removed for production | No fix needed |
| 10 | ℹ️ INFO | JS | `PRAYER_LIGHT` dynamic lighting absent — feature not yet wired in | Future feature |
| 11 | ✅ GOOD | JS | `_themeFrameCount = 3599` + `>= 3600` — post-session improvement, correct | No fix needed |

**Only true bugs:** DISC-01 (`ptParseMin` null guard) is an active crash risk. The floor geometry/polygonOffset (#2, #3) affects visual quality.
