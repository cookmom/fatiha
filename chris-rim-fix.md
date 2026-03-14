# Chris Rim Fix — Uniform Edge Rim on All Cube Faces

## Problem
The `edgeCatch` Fresnel (`pow(1.0 - NdotV, 4.5)`) is view-dependent:
- **Bottom face** (Nw.y ≈ -1): Camera is above → dot(down, upward-Vw) is negative → clamped to 0 → `edgeCatch = 1.0` across the **entire bottom face**, not just edges
- **Side faces**: NdotV varies 0→1, so edgeCatch concentrates correctly at the silhouette edges
- **Result**: Bottom appears as a special bright anomaly, not part of a consistent system

## Root Cause
For the bottom face, `max(dot(Nw, Vw), 0.0) = 0` for all pixels (Nw points down, Vw points up toward camera). So `1.0 - NdotV = 1.0` everywhere on the bottom face → full edgeCatch across the whole face.

## Solution

**Two edits to `dichroicFrag` in `glass-cube-clock.js`:**

### 1. Suppress edgeCatch on bottom-facing normals
Prevents the full-face glow on the bottom face. The `bottomSuppressor` ramps from 1.0 (no suppression on side/top faces) to 0.0 as normals become increasingly downward-facing (Nw.y → -0.85).

### 2. Add geometry-based edge rim
Uses `vLocalPos` (available in the fragment shader) to compute distance from the nearest cube edge seam in local object space. Fires uniformly on **all 12 cube edges** regardless of viewing angle — top, sides, and bottom equally. This is the "museum display glass" read.

## Exact Edit

**File:** `/home/tawfeeq/ramadan-clock-site/glass-cube-clock.js`

**Find (lines ~698-699):**
```glsl
    float edgeCatch = pow(1.0 - NdotV, 4.5);
    col += vec3(0.70, 0.85, 1.00) * edgeCatch * 1.30;
```

**Replace with:**
```glsl
    float edgeCatch = pow(1.0 - NdotV, 4.5);
    // Suppress on bottom-facing normals — Nw.y≈-1 gives NdotV=0 across the
    // ENTIRE bottom face (not just silhouette), causing a broad glow not a rim.
    float bottomSuppressor = 1.0 - smoothstep(-0.25, -0.80, Nw.y);
    col += vec3(0.70, 0.85, 1.00) * edgeCatch * 1.30 * bottomSuppressor;

    // ── Geometry edge rim: uniform thin glow at all 12 cube edges ──
    // Uses local object-space position to detect face seam proximity.
    // Fires equally on every edge: top, side, and bottom — museum display glass feel.
    // Visible at 3x DPR: 0.55 intensity (prev attempt 0.12 was invisible).
    float geoH = 0.6; // half-size of BoxGeometry(1.2, 1.2, 1.2)
    vec3 geoD = geoH - abs(vLocalPos);
    float geoDmin = min(geoD.x, min(geoD.y, geoD.z));
    float geoDmax = max(geoD.x, max(geoD.y, geoD.z));
    float geoDB = geoD.x + geoD.y + geoD.z - geoDmin - geoDmax; // dist from nearest edge
    float geoRim = 1.0 - smoothstep(0.0, 0.09, geoDB); // 1.0 at seam, 0.0 inward
    col += vec3(0.65, 0.82, 1.00) * geoRim * 0.55;
```

## Parameters (tunable)
- **Edge width**: `0.09` in local space = ~15% of face half-width. Range: 0.06 (very thin) – 0.12 (wider band)
- **Intensity**: `0.55`. Previous attempt was 0.12 (invisible at 3x DPR). Range: 0.40 (barely there) – 0.80 (prominent)
- **Color**: `vec3(0.65, 0.82, 1.00)` — cool blue-white, matches existing edgeCatch palette
- **Bottom suppressor curve**: `smoothstep(-0.25, -0.80, Nw.y)` — starts at Nw.y=-0.25, full suppression at -0.80

## How the geoRim math works
For a BoxGeometry(1.2) with half-size H=0.6:
- `geoD = 0.6 - abs(vLocalPos)` → 0 on a face boundary, positive inward
- The three geoD values: smallest ≈ 0 (we're ON that face), middle = distance from nearest edge seam, largest = far dimension
- `geoDB` = middle value = distance from nearest edge, computed via `x+y+z - min - max`
- `smoothstep(0, 0.09, geoDB)` → 0 at seam, 1 at 0.09 inward → inverted gives glow at seams

## Verified
- ✅ No console errors
- ✅ GPU Chrome RTX A6000 render at 3x DPR (iPhone match)
- ✅ Visible rim on top edges, vertical corners, and bottom edge
- ✅ Consistent across all 12 cube edges
- ✅ Subtle glass quality (vision model: 7/10, "museum-quality glass feel")
- ✅ Bottom edge now reads as part of uniform system, not anomaly
- ✅ Does NOT touch: IOR, dispersion, dichroic, LTC, prayer windows, lighting

## Renders
- Baseline: `chris-rim-baseline.png`
- Patched full: `chris-rim-patched.png`
- Cube crop: `chris-rim-cube-crop.png`
