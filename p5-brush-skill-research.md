# p5.brush Skill Research — Fatiha Extended Skill Design

## 1. How the p5-brush Skill Works

### Structure
- Takes a natural language description → generates standalone HTML with p5.js + p5.brush
- Template: WEBGL canvas, `brush.load()`, `translate(-width/2, -height/2)` for top-left coords
- Static art goes entirely in `setup()` — no `draw()` loop needed
- CDN: `p5@2` + `p5.brush@2.0.0-beta`

### Composition Technique
The skill uses a **layered painting approach**:
1. Background first (paper color or dark bg)
2. Large atmospheric shapes (sky washes, ground)
3. Mid-layer structural elements (trees, stems)
4. Detail elements (leaves, flowers, textures)
5. Foreground overlays (rain, butterflies, particles)

### Animation
- Uses `draw()` loop with `brush.refreshField(frameCount/10)` for animated fields
- Rain: flow lines with gravity-influenced field
- Butterflies: spline paths with oscillating positions
- Breathing: subtle scale/opacity pulsing via `sin(frameCount)`

### Key Techniques
- **Vector fields**: `brush.field("curved")` for organic flow, custom fields for specific patterns
- **Watercolor fills**: `brush.fill()` + `brush.fillBleed()` + `brush.fillTexture()` — max ~50 filled shapes
- **Layering**: Multiple passes with low opacity build depth
- **Mixed media**: Hatching + watercolor + pencil outlines for texture stacking
- **Organic variation**: `random()` and `noise()` everywhere — never exact repetition

---

## 2. p5.brush v2.0.2 Updates

### Performance
The fill pipeline has been significantly optimized in v2.x compared to earlier versions:
- WebGL-based rendering (requires WEBGL mode in createCanvas)
- Fill budget guidance: keep under ~50 complex fills with high bleed
- The library syncs random/noise seeds automatically for reproducibility

### New: `markerTip` Option
```js
brush.add("myBrush", {
  type: "marker",  // or "custom", "image"
  markerTip: false  // Disables extra soft tip buildup at start/end of strokes
});
```
- Default: `true`
- Set `false` for cleaner custom/image/marker stamps without marker-style buildup
- Useful for our Ottoman petal stamps where we want precise shape, not smudged tips

### Brush Maker Tool
Interactive web tool at `https://acamposuribe.github.io/p5.brush/tools/brush-maker.html`:
- Live preview with light/dark mode
- Configure: weight, scatter, sharpness, grain, opacity, spacing, rotation
- Pressure: simple or Gaussian modes (start/mid/end points)
- Custom tip drawing with code editor
- Image tip upload/preview
- **Copy button** → generates ready-to-paste `brush.add()` code

### Brush Types (5 total)
1. **default** — pencil-like, sharpness + grain control
2. **spray** — scattered dots/particles
3. **marker** — flat, solid strokes
4. **custom** — user-defined tip via `tip: (_m) => { ... }` function
5. **image** — requires `await` for async loading

---

## 3. Gap Analysis: p5.brush vs Our fatiha-brush

### What p5.brush Does Well
- Beautiful stroke simulation (pencil, pen, marker, spray)
- Hatch patterns built-in
- Vector field integration for organic strokes
- Fill with watercolor bleed simulation
- Plot/Polygon/Position classes for reusable geometry
- Fast WebGL rendering

### What Our fatiha-brush Has That p5.brush Doesn't
- **Tyler Hobbs wet watercolor** — recursive polygon deformation with Gaussian midpoint displacement, layer stacking at 3-4% opacity, variable variance per edge, texture masking
- **Mixbox pigment blending** — physically accurate subtractive color mixing (not just alpha blending)
- **Audio-reactive system** — energy/frequency analysis driving growth, bloom, particle spawn
- **Layer compositing** — named layers with blend modes (garden, glow, petals)
- **Wet paint simulation** — progressive drying with `maxWetness` and `concentratePigment`
- **Stamp-based GPU rendering** — 262K stamp budget with texture atlases
- **Precise botanical polygon generators** — saz leaf, ogee petal, teardrop bud shapes

### What p5.brush Has That We're Missing
- Built-in vector field library (hand, curved, zigzag, waves, spiral, seabed, columns)
- Spline curves with per-point pressure
- Cross-hatching with configurable angle/density
- Flow lines that follow fields
- Easy custom brush creation with tip functions
- The `beginShape/endShape` paradigm for field-affected custom shapes

---

## 4. Custom Brush Designs for Fatiha

### `ottoman_petal` — For rose and hatai petals
```js
brush.add("ottoman_petal", {
  type: "custom",
  weight: 8,
  opacity: 60,
  spacing: 0.3,
  pressure: [0.3, 1.2, 0.1],  // taper in, fat middle, sharp tip
  markerTip: false,            // clean stamp, no buildup
  rotate: "natural",
  tip: (_m) => {
    // Ogee/almond petal shape — Ottoman botanical characteristic
    _m.beginShape();
    _m.vertex(0, -2);      // base
    _m.bezierVertex(1.5, -1.5, 2, 0, 1.2, 1.5);  // right bulge
    _m.vertex(0, 3);       // tip
    _m.bezierVertex(-2, 0, -1.5, -1.5, 0, -2);   // left bulge
    _m.endShape(CLOSE);
  }
});
```

### `saz_leaf` — Curved almond leaf with central vein
```js
brush.add("saz_leaf", {
  type: "custom",
  weight: 12,
  opacity: 45,
  spacing: 0.4,
  pressure: [0.5, 1.0, 0.2],  // starts medium, thins to tip
  markerTip: false,
  rotate: "natural",
  tip: (_m) => {
    // Long saz leaf with asymmetric curve
    _m.beginShape();
    _m.vertex(0, -1);
    _m.bezierVertex(1.8, -0.5, 2.2, 1, 0.8, 3);
    _m.vertex(0, 4);       // pointed tip
    _m.bezierVertex(-1.5, 1, -1.2, -0.5, 0, -1);
    _m.endShape(CLOSE);
    // Central vein
    _m.stroke(0, 80);
    _m.strokeWeight(0.15);
    _m.line(0, -0.5, 0, 3.5);
  }
});
```

### `calligraphy_naskh` — Flat nib for Arabic letterforms
```js
brush.add("calligraphy_naskh", {
  type: "custom",
  weight: 6,
  opacity: 200,
  spacing: 0.15,       // very tight for smooth strokes
  pressure: [0.8, 1.0, 0.6],
  markerTip: true,     // buildup gives ink pooling at starts
  rotate: "natural",
  tip: (_m) => {
    // Flat chisel nib at ~30° angle (traditional naskh angle)
    _m.rotate(30 * PI / 180);
    _m.rect(-2, -0.3, 4, 0.6);  // wide flat nib
  }
});
```

### `spray_pollen` — Golden pollen dots for flower centers
```js
brush.add("spray_pollen", {
  type: "spray",
  weight: 3,
  scatter: 4,
  opacity: 80,
  spacing: 0.8,
  pressure: [1, 0.5],
  rotate: "random"
});
```

### `tahrir_line` — Fine outline for Ottoman illumination borders
```js
brush.add("tahrir_line", {
  type: "default",
  weight: 0.3,
  scatter: 0.1,
  sharpness: 0.9,
  grain: 3,
  opacity: 180,
  spacing: 0.08,
  pressure: [0.8, 1.0, 0.8],
  rotate: "natural"
});
```

---

## 5. Painting Sequences for Ottoman Garden

### Full Garden Composition Order
```
1. BACKGROUND
   - Dark charcoal (#0d0d0d) or cream paper
   - Subtle noise texture via light hatch

2. GOLDEN SPIRAL PATH
   - Build spiral geometry (9 quarter-arc segments)
   - Draw vine stem with flow field following spiral
   - brush.field("spiral") or custom field matching our golden ratio path

3. VINE → LEAVES → BUDS (along spiral, progressive)
   - Vine: flowLine segments with "saz_leaf" stamps at intervals
   - Leaves: saz_leaf polygons with watercolor fill + tahrir outline
   - Buds: teardrop shapes with bleed fill

4. FLOWERS (at key spiral positions)
   - Rose: concentric ogee petal rings (outer→inner), watercolor per petal
   - Golden rose: amber/gold palette version at golden ratio focal point
   - Bloom: 6-petal star flowers at secondary positions

5. CENTER DETAILS
   - Pollen spray at flower centers
   - Vein lines on leaves (tahrir_line brush)
   - Tendril curls extending from vine

6. ATMOSPHERIC
   - Ghunnah glow orbs (additive blend, low opacity circles)
   - Falling petals (animated stamps with lifetime)
   - Subtle overall grain texture
```

### Audio-Reactive Mapping
```
Audio Parameter    → Visual Response
─────────────────────────────────────
energy (RMS)       → vine growth speed, petal spawn rate
bass frequency     → flower bloom scale, glow intensity
mid frequency      → leaf sway amplitude, hatch density
high frequency     → sparkle/pollen opacity, tendril curl speed
onset detection    → tajweed event trigger (new leaf/bud/flower)
```

---

## 6. Integrating Tyler Hobbs Watercolor with p5.brush Fill

### The Problem
p5.brush's `fillBleed()` is a single-pass edge wobble. Tyler Hobbs' technique uses:
- **30-100 stacked layers** at 3-4% opacity each
- **Recursive polygon deformation** (Gaussian midpoint displacement)
- **Variable edge variance** (sharp edges + soft bleeds on same shape)
- **Texture masking** (random circles punching transparency holes)

### Integration Strategy

**Option A: Hybrid Approach (Recommended)**
Use p5.brush for strokes/hatching/outlines but implement Tyler Hobbs fill separately:

```js
// 1. Draw watercolor fill using our custom deformation pipeline
function tylerFill(vertices, color, layers=50, baseRounds=7, layerRounds=4) {
  // Deform base polygon
  let basePoly = deformPolygon(vertices, baseRounds, 0.4);

  for (let i = 0; i < layers; i++) {
    // Per-layer deformation
    let layerPoly = deformPolygon(basePoly, layerRounds, 0.3);

    // Draw with very low opacity
    brush.noStroke();
    brush.fill(color, Math.floor(255 * 0.035));
    brush.fillBleed(0);  // No additional bleed — our deformation IS the bleed
    brush.polygon(layerPoly);
    brush.noFill();
  }
}

// 2. Then use p5.brush for the tahrir outline on top
brush.set("tahrir_line", "#2A3A18", 0.3);
brush.spline(vertices.map(v => [v[0], v[1]]), 0.8);
```

**Option B: Pure p5.brush Approximation**
Stack multiple `brush.circle()` or `brush.polygon()` calls with slight position jitter:
```js
brush.noStroke();
for (let i = 0; i < 12; i++) {
  brush.fill(color, 20 + random(-5, 5));
  brush.fillBleed(random(0.3, 0.7), random() > 0.5 ? "out" : "in");
  brush.fillTexture(random(0.3, 0.6), random(0.2, 0.4));
  brush.circle(x + random(-3, 3), y + random(-3, 3), radius + random(-5, 5));
}
```
Faster but less authentic — good for small shapes (buds, pollen).

### Critical: Fill Budget is HARD ~43
Empirically tested: p5.brush v2.0.0-beta crashes with `t.reduce(...).map is not a function` when exceeding ~43-45 watercolor fills in a single sketch. This is a hard limit, not a soft performance suggestion. For an Ottoman rose with stem, leaves, sepals, and petal rings, the budget is:
- 2 atmospheric halos + 8 leaves (2 fills each) + 5 sepals + 16 outer petals (2 each) + 6 mid + 4 inner = **47 fills → CRASH**
- Solution: Use stroke-based alternatives (spray, charcoal, marker) for center details and pollen instead of fills

### Recommendation
**Use Hybrid (Option A) for large shapes** (roses, main leaves) and **Option B for small shapes** (buds, tendrils, pollen dots). This keeps the fill budget under p5.brush's ~43 hard limit while getting authentic watercolor for focal elements.

---

## 7. Golden Spiral Path in p5.brush

### Custom Vector Field for Spiral
```js
brush.addField("goldenSpiral", function(t, field) {
  const cx = width * 0.55;  // spiral center
  const cy = height * 0.45;
  for (let col = 0; col < field.length; col++) {
    for (let row = 0; row < field[0].length; row++) {
      const x = col * (width / field.length);
      const y = row * (height / field[0].length);
      const dx = x - cx;
      const dy = y - cy;
      const r = Math.sqrt(dx*dx + dy*dy);
      const theta = Math.atan2(dy, dx);
      // Spiral: angle perpendicular to radius + slight inward pull
      const spiralAngle = theta + PI/2 + 0.15;  // golden ratio approximation
      field[col][row] = spiralAngle * 180 / PI;
    }
  }
  return field;
}, { angleMode: "degrees" });
```

### Using Position Walker
```js
brush.field("goldenSpiral");
let walker = new brush.Position(startX, startY);
brush.set("saz_leaf", STEM_GREEN, 2);

for (let i = 0; i < 500; i++) {
  let angle = walker.angle();
  walker.moveTo(angle, 2, 0.5);
  // Stamp leaves at intervals
  if (i % 30 === 0) {
    drawSazLeaf(walker.x, walker.y, angle);
  }
}
```

---

## 8. Extended Skill Template for Fatiha

### Differences from Base p5-brush Skill
1. **Canvas size**: 430×932 (mobile portrait, iPhone 16 Pro Max)
2. **Dark background**: `#0d0d0d` instead of warm paper
3. **Custom brushes**: ottoman_petal, saz_leaf, calligraphy_naskh, tahrir_line, spray_pollen
4. **Painting pipeline**: vine → leaves → buds → flowers → center details → atmospheric
5. **Audio integration**: `draw()` loop with frequency analysis driving parameters
6. **Mixbox integration**: pigment-accurate color blending (separate from p5.brush)
7. **Tyler Hobbs watercolor**: custom polygon deformation for fills (not just `fillBleed`)
8. **Golden spiral geometry**: pre-computed arc path, custom vector field

### When to Use p5.brush vs fatiha-brush
| Feature | p5.brush | fatiha-brush |
|---------|----------|-------------|
| Quick sketches/prototypes | ✅ Best | Overkill |
| Stroke simulation | ✅ Great built-ins | Custom stamps |
| Hatching patterns | ✅ Built-in | Not available |
| Watercolor fill (simple) | ✅ fillBleed | N/A |
| Watercolor fill (authentic) | ❌ Single-pass | ✅ Tyler Hobbs 50-layer |
| Audio reactivity | Manual via draw() | ✅ Built-in system |
| 60fps animation | ⚠️ Fill budget limits | ✅ GPU stamp pipeline |
| Mixbox pigment blending | ❌ RGB only | ✅ GLSL integration |
| Ottoman botanical shapes | Via custom brushes | ✅ Precise polygon generators |

### Conclusion
**p5.brush is excellent for rapid prototyping** — test compositions, try brush combinations, generate variations quickly. For the production fatiha.app render pipeline, our custom fatiha-brush with Tyler Hobbs watercolor + Mixbox + GPU stamps remains superior for authentic Ottoman illumination at 60fps. The ideal workflow: **sketch in p5.brush → refine in fatiha-brush**.
