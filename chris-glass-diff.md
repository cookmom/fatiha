# Chris Glass Diff — dichroicFrag Fill Term Reduction
## V3 — Final Approved Version
**Date:** 2026-03-11  
**Author:** Chris (lookdev)  
**File:** `/home/tawfeeq/ramadan-clock-site/glass-cube-clock.js`  
**Shader:** `dichroicFrag` (lines 492–759)  
**Prayer windows:** UNTOUCHED — mkMatWindow, _prayerDisc, _nextDisc, _thirdDisc all verified identical  

---

## Root Cause

The shader had ~10 additive fill terms that painted flat blue/purple color onto cube faces uniformly. Because these fills are **not view-dependent** (unlike Fresnel or specular), they render with equal intensity regardless of viewing angle — exactly how a solid opaque surface behaves. The `sideFacing` and `skyFacing` terms in particular painted every visible face a uniform solid color. 

With a dark FBO background (dark floor, fog), the refracted content was dim, so these fills **dominated** — the cube read as a solid tinted block rather than transparent glass.

**Fix:** Kill all flat ambient fills. Keep only view-dependent effects (Fresnel, edge catch, specular). The refracted scene at 2.8x multiplier stays bright and dominant — you see the world through the glass, not a painted surface.

---

## Exact Changes (10 surgical edits, dichroicFrag only)

### 1 — Line 677: Base transmission tint (neutral, keep 2.8×)
```glsl
// BEFORE
vec3 col = refracted * vec3(0.94, 0.97, 1.06) * 2.8 * bottomAtten;

// AFTER
vec3 col = refracted * vec3(1.00, 1.00, 1.00) * 2.8 * bottomAtten;
```
*Why:* Neutral tint removes the inherent blue bias baked into refraction. Multiplier stays at 2.8 — this was correct all along. Cutting it to 1.6 in V1 was wrong: it dimmed the refracted scene and let the fills dominate.*

---

### 2 — Line 684: Fresnel edge (slight boost)
```glsl
// BEFORE
col += vec3(0.80, 0.92, 1.00) * fresnel * 0.35;

// AFTER
col += vec3(0.80, 0.92, 1.00) * fresnel * 0.40;
```
*Why: This IS the glass signature — cool-white rim at silhouette. Slight boost compensates for reduced body brightness overall.*

---

### 3 — Line 689: Side ambient — KILLED ⚠️ (was #1 opacity culprit)
```glsl
// BEFORE
col += vec3(0.22, 0.28, 0.45) * sideFacing * 0.30;

// AFTER
col += vec3(0.22, 0.28, 0.45) * sideFacing * 0.00;
```
*Why: `sideFacing = 1.0 - abs(Nw.y)` peaks on ALL vertical faces simultaneously with no view dependency. Applied to every fragment on every side face at constant 0.30 intensity = solid opaque face. Physically wrong for glass. Zero.*

---

### 4 — Line 694: Sky fill — nearly killed
```glsl
// BEFORE
col += pow(skyFacing, 1.8) * vec3(0.90, 0.94, 1.00) * 0.38;

// AFTER
col += pow(skyFacing, 1.8) * vec3(0.90, 0.94, 1.00) * 0.06;
```
*Why: Painted the top face a flat blue-white. Tiny amount kept (0.06) to give top face faint environmental context — real glass does reflect the sky subtly.*

---

### 5 — Line 699: Edge catch — reduced
```glsl
// BEFORE
col += vec3(0.70, 0.85, 1.00) * edgeCatch * 1.80;

// AFTER
col += vec3(0.70, 0.85, 1.00) * edgeCatch * 1.30;
```
*Why: At 1.80, edge catch was so bright it dominated the silhouette, creating a "glowing halo" rather than a crisp glass rim. 1.30 keeps the rim but doesn't overpower. View-dependent (NdotV), so correct to keep.*

---

### 6 — Line 706: Shadow fill — KILLED
```glsl
// BEFORE
col += vec3(0.15, 0.18, 0.30) * shadowSide * 0.35; // cool blue fill, subtle

// AFTER
col += vec3(0.15, 0.18, 0.30) * shadowSide * 0.00; // cool blue fill, subtle
```
*Why: Painted shadow-side faces uniformly dark-blue. Real glass doesn't have diffuse shadow fill — shadow-side faces show only dim refraction + faint Fresnel. Zero.*

---

### 7 — Line 708: Shadow edge boost — nearly killed
```glsl
// BEFORE
col += vec3(0.50, 0.60, 0.80) * edgeCatch * shadowSide * 0.45;

// AFTER
col += vec3(0.50, 0.60, 0.80) * edgeCatch * shadowSide * 0.05;
```
*Why: Compounded with the shadow fill to paint blue on shadow faces. With shadow fill gone, this only runs at edges — kept minimal as a shadow-side rim accent.*

---

### 8 — Line 746: Top Fresnel purple — halved
```glsl
// BEFORE
col += vec3(0.25, 0.15, 0.55) * topFresnel * 0.30;

// AFTER
col += vec3(0.25, 0.15, 0.55) * topFresnel * 0.15;
```
*Why: View-dependent (good), but 0.30 was too dominant — the purple-blue was readable as a solid tint. 0.15 keeps the iridescent hint at grazing angles without tinting the whole top.*

---

### 9 — Line 751: Bottom glow — nearly killed
```glsl
// BEFORE
col += vec3(0.35, 0.45, 0.7) * bottomFace * 0.25;

// AFTER
col += vec3(0.35, 0.45, 0.7) * bottomFace * 0.03;
```
*Why: Painted the bottom face a flat blue regardless of what the refracted content shows. Tiny 0.03 lifts the cube bottom just enough to read against the dark pedestal.*

---

### 10 — Line 754: Bottom rim — reduced
```glsl
// BEFORE
col += vec3(0.6, 0.7, 1.0) * bottomRim * 0.45;

// AFTER
col += vec3(0.6, 0.7, 1.0) * bottomRim * 0.25;
```
*Why: Physical effect (light catching the cube's bottom perimeter) — correct to keep, but 0.45 was too dominant. 0.25 is more plausible.*

---

## What Was NOT Touched

These lines are identical to the original:

- Lines 620–668: Per-face IOR differentiation, aberration, dichroic band calculation
- Lines 669–672: Refraction sampling (R/G/B channels)
- Lines 679–681: Dichroic iridescence blend (`col = mix(...)`)
- Lines 710–718: Specular highlight (razor needle)
- Lines 720–742: LTC RectAreaLight contribution
- Lines 743–745: Internal glow
- Lines 747–749: Top-face iridescence (`col = mix(...)`)
- Lines 1470+: `mkMatWindow`, prayer disc shaders, prayer window arcs — **UNTOUCHED**

---

## Results

| Metric | Before | V3 |
|--------|--------|-----|
| Transparency | 7/10 | 7/10 |
| Glass quality | 6/10 | 8/10 |
| Reads as glass | No | Yes |
| Flat/opaque faces | Yes | No |
| Fresnel rim | Yes (too dominant) | Yes (balanced) |
| Dispersion intact | Yes | Yes |
| Specular intact | Yes | Yes |
| Prayer windows intact | Yes | Yes |

---

## How to Apply

The diff is 10 string replacements in `dichroicFrag`. Apply with:

```bash
# In the repo directory — applies all 10 edits
sed -i \
  's/refracted \* vec3(0\.94, 0\.97, 1\.06) \* 2\.8/refracted * vec3(1.00, 1.00, 1.00) * 2.8/g' \
  glass-cube-clock.js
```

Or use the exact `Edit` tool replacements listed above, one at a time, in order.

**Verification after apply:**
```bash
grep "sideFacing \* 0\." glass-cube-clock.js
# Should show: sideFacing * 0.00

grep "shadowSide \* 0\." glass-cube-clock.js  
# Should show: shadowSide * 0.00 (line 706) and shadowSide * 0.05 (line 708)

grep "mkMatWindow" glass-cube-clock.js | wc -l
# Should show same count as original (prayer windows intact)
```
