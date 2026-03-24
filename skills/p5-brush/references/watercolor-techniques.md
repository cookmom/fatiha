<!-- بسم الله الرحمن الرحيم -->

# Watercolor Techniques — p5.brush

---

## p5.brush Native Watercolor — Two Approaches

### Approach 1: `fillBleed` + `polygon/circle` (Simple)

Single-pass edge wobble on polygon shapes:

```js
brush.noStroke();
brush.fill("#6B8E5A", 60);
brush.fillBleed(0.5);          // 0.0 = rigid, 1.0 = heavy bleed
brush.fillTexture(0.4, 0.3);   // paper grain (set 0,0 to avoid artifacts)
brush.polygon(vertices);
```

- Fast, single render pass
- `fillBleed(0.001)` + `fillTexture(0, 0)` for clean fills without circle artifacts
- Higher bleed values (0.3–0.7) risk bubble artifacts

### Approach 2: `beginShape/vertex/endShape` + `fillBleed` (Watercolor Bleed — PREFERRED)

**Source: Alejandro Campos (p5.brush creator) — [demo sketch](https://editor.p5js.org/acamposuribe/sketches/gSQP6hHbi)**

Uses the shape builder API for organic watercolor stains with proper bleeding edges:

```js
brush.fill("#a08060", 70);       // color + opacity
brush.fillBleed(0.2);            // bleed amount (0.1–0.4 for organic stains)
brush.beginShape(0);             // 0 = fill mode
brush.vertex(x1, y1);            // irregular polygon vertices
brush.vertex(x2, y2);
brush.vertex(x3, y3);
// ... more vertices
randomSeed(42);                  // BEFORE endShape — locks bleed pattern
brush.endShape(CLOSE);
```

**Key details:**
- `brush.beginShape(0)` — the `0` parameter = fill mode
- `randomSeed()` BEFORE `brush.endShape(CLOSE)` — makes bleed deterministic (critical for animation loops)
- `fillBleed(0.15–0.4)` — gives organic watercolor bleeding edges. Higher = more bleed
- More vertices = more organic shape. Use Perlin noise for irregular outlines
- This is the v2 equivalent of v1's `brush.bleed()` — in v2 it's `brush.fillBleed()`
- Does NOT cause circle/bubble artifacts like high `fillTexture` values
- Brush strokes (brush.line, brush.spline) work correctly after these fills

**v1 → v2 API mapping:**
- `brush.bleed(x)` → `brush.fillBleed(x)`
- `brush.beginShape/vertex/endShape` — unchanged

**Coffee stain example with noise-driven shape:**
```js
function coffeeStain(cx, cy, r, nPts, col, opac, bleed, seed) {
  noiseSeed(seed);
  brush.fill(col, opac);
  brush.fillBleed(bleed);
  brush.beginShape(0);
  for (var i = 0; i < nPts; i++) {
    var a = i / nPts * TWO_PI;
    var wobble = 0.4 + 0.6 * noise(seed + cos(a)*2, sin(a)*2);
    brush.vertex(cx + r*wobble*cos(a), cy + r*wobble*sin(a));
  }
  randomSeed(seed);
  brush.endShape(CLOSE);
}
```

**Fill budget:** Each `beginShape/endShape` pair costs 1 fill unit (same as `brush.polygon`). Budget ~43 still applies.

---

## Tyler Hobbs Multi-Layer Technique

**The gold standard for algorithmic watercolor.** Described by Tyler Hobbs (Fidenza, Watercolor Engine).

### Core Principles

1. **30–100 stacked layers** — each at 3–4% opacity (255 × 0.035 ≈ 9 alpha units)
2. **Recursive polygon deformation** — Gaussian midpoint displacement on each layer independently
3. **Variable edge variance** — sharp anchor points interspersed with soft bleed areas
4. **Texture masking** — random circles punching transparency holes for paper-grain effect

### Opacity Math

```
Combined opacity of N layers at opacity X each:
  combined ≈ 1 - (1 - X/255)^N

Examples:
  30 layers × opacity 9  → 1 - (1 - 9/255)^30  ≈ 65% filled
  50 layers × opacity 9  → 1 - (1 - 9/255)^50  ≈ 83% filled
  80 layers × opacity 9  → 1 - (1 - 9/255)^80  ≈ 94% filled
```

Use this formula to hit your target opacity before spending fill budget.

### Tyler Hobbs Implementation in p5.brush Context

```js
// Deform a polygon using Gaussian midpoint displacement
function deformPolygon(vertices, rounds, variance) {
  let poly = [...vertices];
  for (let r = 0; r < rounds; r++) {
    let newPoly = [];
    for (let i = 0; i < poly.length; i++) {
      let a = poly[i];
      let b = poly[(i + 1) % poly.length];
      // Midpoint
      let mx = (a[0] + b[0]) / 2;
      let my = (a[1] + b[1]) / 2;
      // Gaussian displacement perpendicular to edge
      let dx = b[0] - a[0], dy = b[1] - a[1];
      let len = Math.sqrt(dx*dx + dy*dy);
      let nx = -dy/len, ny = dx/len;           // normal vector
      let disp = randomGaussian(0, variance * len);
      newPoly.push(a, [mx + nx*disp, my + ny*disp]);
    }
    poly = newPoly;
  }
  return poly;
}

// Watercolor fill using Tyler Hobbs approach
function tylerFill(vertices, color, layers=50, baseRounds=7, layerRounds=4) {
  let basePoly = deformPolygon(vertices, baseRounds, 0.4);

  brush.noStroke();
  for (let i = 0; i < layers; i++) {
    let layerPoly = deformPolygon(basePoly, layerRounds, 0.3);
    brush.fill(color, Math.floor(255 * 0.035));  // ~9 opacity per layer
    brush.fillBleed(0);    // NO fillBleed — our deformation IS the bleed
    brush.fillTexture(0, 0);
    brush.polygon(layerPoly);
  }
  brush.noFill();
}
```

**Note:** Each `brush.polygon()` call in the loop costs **1 fill budget unit**. 50 layers of Tyler Hobbs = 50 fills → **CRASHES p5.brush**. See Hybrid Integration below.

---

## Hybrid Integration Strategy

Combine Tyler Hobbs for quality + p5.brush native for budget management.

### When to Use Each

| Shape Size | Fill Count | Method |
|------------|------------|--------|
| Large (>100px) main shapes | 1–3 shapes | Tyler Hobbs custom renderer (bypass p5.brush fills) |
| Medium (30–100px) | 5–15 shapes | p5.brush `fillBleed(0.001)` + `fillTexture(0,0)` |
| Small (<30px) | Many | Option B: jittered circles (no fills) or stroke-only |
| Details/centers | Many | Stroke alternatives: spray, charcoal, marker — 0 fill cost |

### Option A: Tyler Hobbs for Large Fills (Recommended for Focal Elements)

Bypass p5.brush fill pipeline entirely for large shapes — draw directly with p5:

```js
function tylerFillDirect(vertices, hexColor, layers=50) {
  let [r, g, b] = hexToRgb(hexColor);
  let basePoly = deformPolygon(vertices, 7, 0.4);

  // Draw directly with p5 (NOT brush.polygon — bypasses fill budget)
  noStroke();
  for (let i = 0; i < layers; i++) {
    fill(r, g, b, Math.floor(255 * 0.035));
    let layerPoly = deformPolygon(basePoly, 4, 0.3);
    beginShape();
    for (let v of layerPoly) vertex(v[0], v[1]);
    endShape(CLOSE);
  }
}
```

**This completely bypasses the ~43 fill limit** — ideal for large botanical fills.

Then use p5.brush for outlines only:
```js
// After Tyler Hobbs fill, add tahrir outline via brush (stroke = no fill cost)
brush.set("tahrir_line", "#2A3A18", 0.3);
brush.noFill();
brush.polygon(originalVertices);
```

### Option B: Jittered Circles (Small Shapes)

Stack multiple small circles with position jitter — watercolor texture without Tyler Hobbs complexity:

```js
brush.noStroke();
for (let i = 0; i < 12; i++) {
  brush.fill(color, 20 + random(-5, 5));
  brush.fillBleed(random(0.3, 0.7), random() > 0.5 ? "out" : "in");
  brush.fillTexture(random(0.3, 0.6), random(0.2, 0.4));
  brush.circle(
    x + random(-3, 3),
    y + random(-3, 3),
    radius + random(-5, 5)
  );
}
```

- Each call costs 1 fill budget unit (12 circles = 12 budget)
- Good for small buds, pollen centers, tiny accent shapes
- Faster and simpler than Tyler Hobbs

---

## Fill Budget: ~43 Limit — Workarounds

### The Crash

p5.brush v2.0.2-beta throws `t.reduce(...).map is not a function` when the total fill count in a sketch exceeds ~43. This is a library bug in the fill pipeline, not a memory or performance issue.

### Counting Fills

Every `brush.fill()` + shape (circle/polygon/rect) = **1 fill unit**.  
Multiple fills on the same shape = multiple units.

```js
// This = 3 fill units:
brush.fill(c1, 60); brush.circle(x, y, r);   // 1
brush.fill(c2, 40); brush.circle(x, y, r);   // 2
brush.fill(c3, 30); brush.polygon(pts);       // 3
```

### Example Budget for Ottoman Rose

```
Atmospheric halos:          2 fills
Main leaves (6 leaves):     6 fills   (1 per leaf)
Sepals (5):                 5 fills
Outer petals (8):           8 fills
Mid ring petals (5):        5 fills
Inner petals (3):           3 fills
───────────────────────────────────
TOTAL:                     29 fills ✅ Safe
```

### Stroke-Based Alternatives (0 Fill Cost)

Use these INSTEAD of fills for center details:

| Element | Fill approach (costs budget) | Stroke alternative (free) |
|---------|------------------------------|--------------------------|
| Flower center pollen | `brush.fill() + circle()` | `brush.set("spray_pollen") + noFill() + circle()` |
| Leaf veins | `brush.fill() + polygon()` | `brush.set("tahrir_line") + line()` |
| Stem texture | `brush.fill() + rect()` | `brush.set("marker") + line()` with low opacity |
| Atmospheric haze | `brush.fill() + circle()` | `brush.set("spray") + noFill() + circle()` |
| Border texture | `brush.fill() + rect()` | `brush.hatch(density, angle, options)` |

### Tyler Hobbs Direct Bypass (0 Fill Cost)

For large shapes requiring authentic watercolor:
- Use `tylerFillDirect()` pattern above — draws with native p5 `beginShape/endShape`
- Completely bypasses p5.brush fill pipeline
- No fill budget consumed, unlimited layers
- Then use `brush.noFill()` + stroke for outlines (stroke = 0 fill cost)

---

## Recommended Workflow

```
1. PLAN BUDGET FIRST
   - List every filled shape
   - Count fills
   - If > 35, redesign or use stroke alternatives

2. LARGE SHAPES (main focal elements)
   - Use Tyler Hobbs direct bypass for quality
   - 0 fill budget consumed

3. MEDIUM SHAPES (supporting elements)
   - Use p5.brush fill with fillBleed(0.001) + fillTexture(0,0)
   - Budget 1 unit each

4. SMALL SHAPES / DETAILS
   - Use stroke-only brushes (spray, marker, line)
   - 0 fill budget consumed

5. OUTLINES
   - brush.noFill() + brush.set("tahrir_line") + polygon/spline
   - 0 fill budget consumed
```
