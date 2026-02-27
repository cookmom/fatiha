# Lookdev Research Brief — NOMOS-Quality Clock Rendering

## Reference Images
- `references/nomos-campus-reference.jpg` — 4-watch lineup, salmon + green dials, day mode
- `references/nomos-campus-lume-reference.webp` — close-up night mode, cyan SuperLuminova glow
- `references/nomos-campus-texture-closeup.jpg` — macro dial texture, applied numerals, hand reflections
- `references/nomos-neomatik-arabic-reference.jpg` — Arabic-Indic numerals, burgundy dial, layout balance

## What We Need (Priority Order)

### 1. Dial Grain Texture (HIGHEST PRIORITY)
**The gap:** Our dials are uniform flat color. Real NOMOS dials have a fine micro-texture (sandblasted/granulated finish) visible at macro distances.

**Technical approach:**
- Generate a **procedural roughness map** using CanvasTexture at runtime
- Use random noise per-pixel on a 512×512 canvas
- Values centered around base roughness (0.9-0.95) with ±0.05 variation
- Apply as `roughnessMap` on the dial MeshPhysicalMaterial
- This gives light-dependent grain — shifts as you tilt (env rotation)

**Code pattern:**
```js
function makeGrainTexture(size = 512, baseRough = 0.92, spread = 0.06) {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');
  const img = ctx.createImageData(size, size);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = Math.floor((baseRough + (Math.random() - 0.5) * spread) * 255);
    img.data[i] = img.data[i+1] = img.data[i+2] = v;
    img.data[i+3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  return tex;
}
// Usage: dialMat.roughnessMap = makeGrainTexture();
```

### 2. Applied (Extruded) Numerals (HIGH PRIORITY)
**The gap:** Our numerals are flat plane meshes with texture. Real NOMOS numerals are physically raised off the dial surface, catching light on their top faces and casting micro-shadows.

**Technical approach — Option A (TextGeometry):**
- Use `FontLoader` + `TextGeometry` from Three.js addons
- Depth: 0.3-0.5 units (subtle, not chunky)
- No bevel (NOMOS numerals have sharp edges)
- Need a `.typeface.json` font file — convert from TTF using Facetype.js
- For Arabic-Indic numerals: need a font that supports Arabic glyphs

**Technical approach — Option B (ExtrudeGeometry from SVG paths):**
- Define numeral shapes as SVG paths
- Convert to THREE.Shape, then ExtrudeGeometry with depth: 0.3
- More control, no font dependency
- Works for both Western and Arabic-Indic numerals

**Technical approach — Option C (bumpMap/normalMap):**
- Render numerals onto a canvas
- Convert to grayscale bump map
- Apply to dial as `bumpMap` with `bumpScale: 0.3`
- Cheaper than geometry, but less accurate parallax

**Recommendation:** Option C for now (fastest to ship for Ramadan), Option A or B for post-launch polish.

### 3. Numeral Material (MEDIUM)
**The gap:** Real applied numerals are polished metal sitting on matte dial. Our numerals are matte.

**Target values (from reference):**
- Material: MeshPhysicalMaterial
- metalness: 0.6 (same as hands — they're stamped from same stock)
- roughness: 0.15 (polished, catches light)
- envMapIntensity: 1.5 (need to see env reflections)
- Color: match hand color (silver steel or rose gold depending on dial)

### 4. Subdial Depth (MEDIUM)
**The gap:** Real NOMOS subdial is physically recessed into the dial. Ours is a flat disc on the same plane.

**Technical approach:**
- Move subdial mesh Z position slightly behind dial face (z: -0.5)
- Add a thin ring mesh around subdial opening (the recessed edge)
- The HDRI + lighting naturally creates shadow at the lip
- Alternative: circular bevel on the dial ShapeGeometry

### 5. Minute Track Detail (LOW)
**The gap:** Real NOMOS has printed minute markers around the outer edge. Ours has tick meshes.

**Current state:** Already have tick meshes — may just need refinement (thinner, more precise spacing).

### 6. Crown Detail (FUTURE)
Not visible in our straight-on view. Skip for now.

## Current A Gift of Time Feature Set (for context)
- 11 dial themes (named for Surahs of the Quran)
- Qibla compass in 6 o'clock subdial (Ressence-style orbital)
- Split-flap countdown at 12 o'clock
- Prayer time markers around dial edge
- Fasting arc with red sphere tip
- Night mode with bloom, SuperLuminova lume glow
- Tilt-reactive lighting (camera parallax + env rotation + spec tracking)
- Tawaf animation at Maghrib
- Celestial (moon + stars) synced to tawaf
- Full adhan system with HRTF spatial audio toward Qibla
- 11 stars for Yusuf's dream (12:4) in sujud arc
- PWA with service worker
- Auto-detect location for prayer times
- HDRI environment map (Poly Haven studio_small_08)

## Implementation Plan
1. **Grain texture** — generate CanvasTexture, apply as roughnessMap (30 min)
2. **Bump numerals** — render to canvas, apply as bumpMap (1 hr)
3. **Numeral material upgrade** — metalness 0.6, roughness 0.15 (15 min)
4. **Subdial recess** — Z-offset + lip ring (30 min)
5. **Test across all 11 dials day+night** — headless Chrome captures
6. **Sync to landing page clock.js**

## Performance Notes
- CanvasTexture at 512×512 = ~1MB GPU memory, negligible
- BumpMap adds one texture sample per fragment — minimal cost
- TextGeometry adds ~2000-5000 triangles per numeral — only if we go Option A
- Avoid: large normalMaps (1024+), displacement maps (subdivide geometry)
