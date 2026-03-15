# p5.brush Deep Techniques — Ottoman Garden Application

Research document: comprehensive API study + creative plan for Fatiha.

---

## 1. Complete Tool Inventory

### Setup & Configuration
| Method | Purpose |
|--------|---------|
| `createCanvas(w, h, WEBGL)` | **Required** — canvas must be WEBGL mode |
| `brush.scaleBrushes(scale)` | Scale all registered brushes globally. Call once in setup |
| `brush.load(buffer?)` | Redirect drawing to a `p5.Graphics` or `p5.Framebuffer`. No-arg = main canvas. **Not needed** for main canvas (auto-inits) |
| `brush.instance(p)` | For p5 instance mode. Call before setup/draw |
| `brush.preload()` | Preload image tips (usually unnecessary if you `await brush.add()`) |
| `brush.clip([x1,y1,x2,y2])` | Clip all strokes to a rect |
| `brush.noClip()` | Remove clipping |

### p5 Integration (Automatic)
- `push()/pop()` — saves/restores brush stroke, fill, and hatch state
- `translate()/rotate()/scale()` — all p5 transforms apply to brush strokes
- `randomSeed(n)` / `noiseSeed(n)` — seeds both p5 and brush library
- `angleMode(mode)` — brush APIs follow p5's current angle mode

**No separate `brush.push()`, `brush.translate()`, or `brush.seed()` needed.**

---

### Stroke Operations
| Method | Purpose |
|--------|---------|
| `brush.set(name, color, weight)` | Set brush name, color (hex/p5.Color), weight multiplier. Enables stroke |
| `brush.pick(name)` | Change brush type only, keep color/weight |
| `brush.stroke(color)` | Set stroke color only. Enables stroke |
| `brush.strokeWeight(w)` | Set weight multiplier only |
| `brush.noStroke()` | Disable stroke |

### Manual Stroke Construction
```js
brush.beginStroke("curve", x, y)   // or "segments"
brush.move(angle, length, pressure)
brush.move(angle, length, pressure)
brush.endStroke(angle, pressure)
```
- `"curve"` mode = smooth interpolation between moves
- `"segments"` mode = straight segments between moves
- Pressure affects stroke width at each point

---

### Drawing Primitives

#### Lines (stroke only — no fill/hatch)
| Method | Purpose |
|--------|---------|
| `brush.line(x1, y1, x2, y2)` | Straight line with current brush |
| `brush.flowLine(x, y, length, dir)` | Line following active vector field. `dir` = initial angle |
| `brush.spline(points, curvature?)` | Smooth curve through `[[x,y], [x,y,pressure], ...]`. Curvature 0–1 |

**Key insight for us**: `brush.spline()` accepts per-point pressure as optional third element! This means we can taper strokes along the spiral by providing `[[x, y, pressure], ...]`.

#### Shapes (affected by stroke + fill + hatch)
| Method | Purpose |
|--------|---------|
| `brush.rect(x, y, w, h, mode?)` | Rectangle. Mode: `"corner"` (default) or `"center"` |
| `brush.circle(x, y, radius, r?)` | Circle. `r` = irregularity 0–1. **Can be stroked, hatched, AND filled** |
| `brush.arc(x, y, radius, start, end)` | Arc. **Stroke only** |
| `brush.polygon(pointsArray)` | Polygon from `[[x,y], ...]`. Not affected by vector fields |
| `brush.beginShape(curvature?) / brush.vertex(x,y,p?) / brush.endShape(close?)` | Custom shape with optional per-vertex pressure |

---

### Fill Operations — Watercolor Simulation

Fill simulates watercolor with soft edges, bleed, and texture layering.

| Method | Purpose |
|--------|---------|
| `brush.fill(color, opacity)` | Set fill color + opacity (0–255 alpha). Enables fill |
| `brush.noFill()` | Disable fill |
| `brush.fillBleed(strength, direction?)` | Edge bleed 0–1. Direction: `"out"` or `"in"` |
| `brush.fillTexture(textureStrength, borderIntensity)` | Texture grain + border darkness, both 0–1 |

#### Fill Mechanics
- Fill renders **inside shapes** (rect, circle, polygon, beginShape/endShape)
- Multiple overlapping fills create watercolor layering effects
- `fillBleed` with `"out"` makes color seep beyond shape edges (natural watercolor look)
- `fillBleed` with `"in"` makes edges retreat inward (dried-out look)
- `fillTexture(0.8, 0.6)` gives paper grain + pronounced edge darkening (natural watercolor pooling at edges)

#### Layering Strategy for Ottoman Flowers
```
// Layer 1: Base wash — low opacity, high bleed
brush.fill(CRIMSON, 60)
brush.fillBleed(0.4, "out")
brush.fillTexture(0.3, 0.2)
brush.circle(x, y, r, 0.15)

// Layer 2: Deeper core — higher opacity, less bleed
brush.fill(DARK_CRIMSON, 90)
brush.fillBleed(0.15, "in")
brush.fillTexture(0.5, 0.4)
brush.circle(x, y, r * 0.6, 0.1)
```

---

### Hatch Operations — Parallel Line Fills

Hatching draws parallel brush strokes inside shapes. **Must be activated before drawing the shape.**

| Method | Purpose |
|--------|---------|
| `brush.hatch(dist, angle, options?)` | Enable hatching. `dist` = spacing (canvas units), `angle` follows angleMode |
| `brush.noHatch()` | Disable hatching |
| `brush.hatchStyle(name, color, weight)` | Set brush used for hatch lines (independent of stroke brush) |
| `brush.hatchArray(polygons)` | Apply current hatch directly to Polygon(s) |

#### Hatch Options
```js
brush.hatch(dist, angle, {
  rand: 0.05,        // 0–1: randomness in line spacing/position
  continuous: true,   // lines continue across gaps (vs restart each gap)
  gradient: 0.3       // 0–1: fade intensity across the hatch area
})
```

#### Combining Fill + Hatch
Both can be active simultaneously on the same shape:
```js
brush.fill('#C00830', 80)
brush.fillBleed(0.2)
brush.fillTexture(0.4, 0.3)

brush.hatchStyle('2H', '#8B0020', 0.5)
brush.hatch(4, 45, { rand: 0.08 })

brush.noStroke()
brush.circle(x, y, radius, 0.1)

brush.noFill()
brush.noHatch()
```
This creates a watercolor-filled circle with pencil crosshatching on top — **perfect for Ottoman flower interiors**.

---

### Vector Fields — Organic Flow

Fields direct `flowLine()` strokes and shape outlines to follow flow patterns.

#### Built-in Fields
| Name | Effect |
|------|--------|
| `"hand"` | Subtle hand-drawn wobble |
| `"curved"` | Smooth curving flow |
| `"zigzag"` | Zigzag pattern |
| `"waves"` | Undulating wave pattern |
| `"seabed"` | Ocean floor organic pattern |
| `"spiral"` | Spiral flow from center |
| `"columns"` | Vertical column flow |

#### Field API
| Method | Purpose |
|--------|---------|
| `brush.field(name)` | Activate a named field |
| `brush.noField()` | Deactivate field |
| `brush.wiggle(intensity)` | Shorthand: activate `"hand"` field with wobble 1–10 |
| `brush.refreshField(t)` | Update time-dependent fields (call in draw loop) |
| `brush.listFields()` | Returns array of all field names |
| `brush.addField(name, fn, options?)` | Create custom field |

#### Custom Field Creation
```js
brush.addField("gardenSpiral", (t, field) => {
  // field is a 2D grid of angles
  // t is the time parameter from refreshField(t)
  for (let col = 0; col < field.length; col++) {
    for (let row = 0; row < field[0].length; row++) {
      // Calculate angle based on position relative to spiral center
      field[col][row] = /* angle in degrees (default) */;
    }
  }
  return field;
}, { angleMode: "radians" })  // optional: declare radians instead of degrees
```

The field grid maps to the canvas. Each cell stores the angle that strokes passing through that area should follow.

---

### Brush Management

#### Built-in Brushes
| Name | Type | Character |
|------|------|-----------|
| `2B` | Pencil (default) | Soft, dark, expressive graphite |
| `HB` | Pencil (default) | Medium graphite |
| `2H` | Pencil (default) | Hard, light, precise graphite |
| `cpencil` | Pencil (default) | Colored pencil |
| `pen` | Default | Ink pen — crisp, uniform |
| `rotring` | Default | Technical drawing pen |
| `spray` | Spray | Scattered particles, airbrush effect |
| `marker` | Marker | Broad, solid, slightly translucent |
| `marker2` | Marker | Second marker variant |
| `charcoal` | Default | Rough, textured, expressive |
| `hatch_brush` | Default | Specialized for hatching |

#### `brush.add(name, params)` — Custom Brush Definition

| Property | Type | Description |
|----------|------|-------------|
| `type` | string | `"default"`, `"spray"`, `"marker"`, `"custom"`, `"image"` |
| `weight` | number | Base thickness in canvas units |
| `scatter` | number | Sideways spread/jitter |
| `sharpness` | number | Edge softness 0–1 (`"default"` type only) |
| `grain` | number | Texture density (`"default"` type only) |
| `opacity` | number | Mark opacity 0–255 |
| `spacing` | number | Stamp gap along stroke. 1 = no overlap, <1 = overlap, >1 = gaps |
| `pressure` | array/fn | `[start, end]` or `[start, mid, end]` or `(t) => value` |
| `tip` | function | `"custom"` type: `(_m) => { _m.rect(...) }` for custom geometry |
| `image` | object | `"image"` type: `{ src: "./tip.jpg" }` |
| `rotate` | string | `"none"`, `"natural"` (follows stroke direction), `"random"` |

#### Brush Type Details

**`"default"` (pencil-like)**
- Uses `sharpness` and `grain` for texture
- Simulates graphite/charcoal with per-pixel noise
- Good for: veins, outlines, delicate details

**`"spray"` (scattered particles)**
- Each stamp scatters many small dots
- `scatter` controls spray radius
- Good for: atmospheric effects, pollen, soft glows, ghunnah marks

**`"marker"` (solid broad strokes)**
- Semi-transparent overlapping stamps
- Slightly translucent for layering
- Good for: bold petals, broad leaves, vine strokes

**`"custom"` (user-drawn tip geometry)**
- `tip` function receives `_m` context with p5 drawing commands
- Each stamp draws the tip geometry at that point
- Tip is drawn at origin, rotated/scaled by the engine
- Good for: **custom petal shapes, leaf tips, arabesque motifs**

**`"image"` (photo-based tip)**
- Requires `await brush.add(...)` in `async setup()`
- Uses an image file as the brush stamp
- Good for: photorealistic textures, scanned brush tips

#### Pressure System
Pressure modulates stroke width along the path:
- `[start, end]` — linear interpolation from start to end weight multiplier
- `[start, mid, end]` — three-point curve (start, middle, end)
- `(t) => value` — custom function, t goes 0→1 along stroke

```js
// Petal stroke: swell in middle, taper at ends
pressure: [0.3, 1.5, 0.2]

// Leaf stroke: start thin, end thick
pressure: [0.2, 1.0]

// Custom: organic petal with slight wobble
pressure: (t) => 0.3 + Math.sin(t * Math.PI) * 1.2 + Math.sin(t * 8) * 0.05
```

---

### Exposed Classes

#### `brush.Polygon(pointsArray)`
Polygon for fill/hatch operations.
```js
let p = new brush.Polygon([[x1,y1],[x2,y2],[x3,y3]])
p.draw(brushName, color, weight)     // stroke outline
p.fill(color, opacity, bleed, texture)  // watercolor fill
p.hatch(distance, angle, options)    // hatch fill
p.intersect(line)                    // returns [{x,y}, ...]
// Attributes: p.vertices, p.sides
```

#### `brush.Plot(type)` — Programmatic Stroke Paths
Build reusable stroke paths that can be drawn multiple times at different positions.
```js
let plot = new brush.Plot("curve")   // or "segments"
plot.addSegment(angle, length, pressure)
plot.endPlot(angle, pressure)

plot.draw(x, y)    // draws with current stroke state
plot.fill(x, y)    // fills with current fill state
plot.hatch(x, y)   // hatches with current hatch state
plot.rotate(angle)  // rotate the plot

let poly = plot.genPol(x, y)  // generate Polygon from plot path
```

**Key for our project**: We can define a petal Plot once, then stamp it at different positions around a flower center with different rotations. This is far more efficient than recalculating points each time.

#### `brush.Position(x, y)` — Field-Aware Movement
Point that follows vector fields when moving.
```js
let pos = new brush.Position(x, y)
pos.moveTo(dir, length, stepLength)     // move through field
pos.plotTo(plot, length, stepLength, scale)  // generate plot along field
```

This is how we can make elements "grow" along the spiral field — the Position object automatically bends its path to follow the active vector field.

---

## 2. Custom Brush Tips for Ottoman Garden Elements

### Petal Brush
```js
brush.add("ottoman_petal", {
  type: "custom",
  weight: 8,
  scatter: 0.03,
  opacity: 45,
  spacing: 0.4,
  pressure: [0.3, 1.5, 0.2],  // swell in middle, taper at tips
  tip: (_m) => {
    // Almond/ogee shape — classic Ottoman petal form
    _m.beginShape();
    _m.vertex(0, -2);
    _m.bezierVertex(3, -1.5, 3, 1.5, 0, 2);
    _m.bezierVertex(-3, 1.5, -3, -1.5, 0, -2);
    _m.endShape();
  },
  rotate: "natural"
})
```

### Leaf Brush
```js
brush.add("ottoman_leaf", {
  type: "custom",
  weight: 6,
  scatter: 0.02,
  opacity: 35,
  spacing: 0.5,
  pressure: [0.4, 1.2, 0.1],  // taper to fine point
  tip: (_m) => {
    // Pointed leaf shape
    _m.beginShape();
    _m.vertex(3, 0);
    _m.bezierVertex(2, -1.5, -1, -1, -3, 0);
    _m.bezierVertex(-1, 1, 2, 1.5, 3, 0);
    _m.endShape();
  },
  rotate: "natural"
})
```

### Bud Brush
```js
brush.add("ottoman_bud", {
  type: "custom",
  weight: 5,
  scatter: 0.05,
  opacity: 50,
  spacing: 0.3,
  pressure: [0.8, 1.0, 0.6],  // fat and round
  tip: (_m) => {
    // Teardrop/bud form
    _m.ellipse(0, 0, 2, 3);
  },
  rotate: "natural"
})
```

### Thorn Brush
```js
brush.add("ottoman_thorn", {
  type: "custom",
  weight: 3,
  scatter: 0,
  opacity: 80,
  spacing: 0.8,
  pressure: [1.0, 0.1],  // sharp taper
  tip: (_m) => {
    _m.triangle(0, -1.5, 1, 1.5, -1, 1.5);
  },
  rotate: "natural"
})
```

### Vine Tendril Brush (fine curling line)
```js
brush.add("ottoman_tendril", {
  type: "default",
  weight: 2,
  scatter: 0.01,
  sharpness: 0.7,
  grain: 80,
  opacity: 60,
  spacing: 0.3,
  pressure: [0.8, 0.1],  // start thick, fade out
  rotate: "natural"
})
```

**Note on custom tip functions**: The `_m` context supports p5 drawing primitives — `rect()`, `ellipse()`, `triangle()`, `beginShape()/vertex()/endShape()`, `rotate()`, `bezierVertex()`. The tip is drawn at the origin and the engine handles positioning, rotation, and scaling along the stroke path.

---

## 3. Spline + Field: Strokes Following the Spiral

### Strategy: Custom "gardenSpiral" Field

We can create a vector field that matches our golden spiral, so any `flowLine()` or field-affected stroke will naturally bend to follow it:

```js
brush.addField("gardenSpiral", (t, field) => {
  const cx = CW / 2, cy = CH / 2;
  for (let col = 0; col < field.length; col++) {
    for (let row = 0; row < field[0].length; row++) {
      // Map grid position to canvas position
      const x = (col / field.length) * CW;
      const y = (row / field[0].length) * CH;
      // Angle from spiral center — creates spiral flow
      const dx = x - cx, dy = y - cy;
      const angle = Math.atan2(dy, dx);
      // Add spiral twist: angle + offset based on distance
      const dist = Math.sqrt(dx*dx + dy*dy);
      field[col][row] = angle + Math.PI/2 + dist * 0.005 + t * 0.1;
    }
  }
  return field;
}, { angleMode: "radians" });
```

### Combining spline() with field-following

The library's `brush.spline()` does NOT follow the active field — it just draws through the given points. But we can use it strategically:

1. **Vine main stroke**: Use `brush.spline(spiralPts, 0.5)` with our pre-computed spiral points — this already follows the spiral precisely.

2. **Organic variation around the vine**: Activate the field, then use `brush.flowLine()` to draw secondary tendrils that naturally follow the spiral flow:
   ```js
   brush.field("gardenSpiral");
   brush.set("ottoman_tendril", STEM_GREEN, 1);
   // Start at vine point, flow outward following spiral
   brush.flowLine(vineX, vineY, 60, tangentAngle);
   brush.noField();
   ```

3. **Per-point pressure on spline**: Our spiral points can carry pressure data:
   ```js
   // Vine thins toward the center of the spiral
   const pressuredPts = spiralPts.map((pt, i) => {
     const t = i / spiralPts.length;
     const pressure = 1.0 - t * 0.7;  // thick→thin
     return [pt.x, pt.y, pressure];
   });
   brush.spline(pressuredPts, 0.5);
   ```

### brush.Position for Field-Following Growth

```js
brush.field("gardenSpiral");
let pos = new brush.Position(startX, startY);
// Position.moveTo follows the active field
pos.moveTo(tangentAngle, 100, 2);  // grows 100px along field, step=2px
brush.noField();
```

This creates strokes that organically follow our spiral field, perfect for tendrils and vine extensions.

---

## 4. Fill + Hatch: Textured Flower Interiors

### Watercolor Rose Interior
```js
// Outer wash — soft, bleeding
brush.fill(ROSE_PINK, 50);
brush.fillBleed(0.35, "out");
brush.fillTexture(0.4, 0.2);
brush.noStroke();
brush.circle(x, y, petalRadius, 0.15);

// Inner glow — concentrated
brush.fill(CRIMSON, 80);
brush.fillBleed(0.1, "in");
brush.fillTexture(0.6, 0.5);
brush.circle(x, y, petalRadius * 0.4, 0.1);

// Hatch for texture — fine pencil lines
brush.hatchStyle("2H", "#5a0018", 0.5);
brush.hatch(3, 60, { rand: 0.1, gradient: 0.4 });
brush.noFill();
brush.circle(x, y, petalRadius * 0.7, 0.1);
brush.noHatch();
```

### Leaf with Fill + Hatch (vein simulation)
```js
// Build leaf polygon
let leafPoly = new brush.Polygon(leafPoints);

// Watercolor base
leafPoly.fill(LEAF_GREEN, 70, 0.2, 0.3);

// Vein-like hatching at leaf angle
brush.hatchStyle("pen", DARK_GREEN, 0.3);
leafPoly.hatch(5, leafAngle, { rand: 0.05, continuous: true });
```

### Using brush.Polygon for Ottoman Shapes
```js
// Build an ogee/almond shape for petal
function ogeePoly(x, y, w, h, angle) {
  const pts = [];
  for (let i = 0; i <= 20; i++) {
    const t = i / 20;
    const theta = t * Math.PI * 2;
    // Ogee curve: wider in middle, pointed at ends
    const r = (w/2) * Math.sin(theta) * (1 + 0.3 * Math.cos(2*theta));
    const ry = (h/2) * Math.cos(theta);
    const rx2 = r * Math.cos(angle) - ry * Math.sin(angle);
    const ry2 = r * Math.sin(angle) + ry * Math.cos(angle);
    pts.push([x + rx2, y + ry2]);
  }
  return new brush.Polygon(pts);
}

let petal = ogeePoly(px, py, 30, 50, petalAngle);
petal.fill(CRIMSON, 60, 0.25, 0.4);
petal.hatch(4, petalAngle + 45, { rand: 0.08, gradient: 0.3 });
petal.draw("pen", "#3a0010", 0.3);  // thin outline
```

---

## 5. Creative Techniques

### A. Layering for Depth
p5.brush's semi-transparent strokes naturally layer. Strategy:
1. **Background wash** — large, low-opacity fills for atmosphere
2. **Mid-ground elements** — medium opacity fills + hatching
3. **Foreground details** — high-opacity strokes, fine brushes

Each layer adds to what's below — no need to erase. This matches traditional Ottoman illumination technique (layers of gold and pigment).

### B. Pressure Simulation for Organic Strokes
Three approaches:
1. **Array pressure** `[0.3, 1.5, 0.2]` — simple swell/taper
2. **Function pressure** `(t) => ...` — full control, add tremor:
   ```js
   pressure: (t) => {
     const base = Math.sin(t * Math.PI) * 1.2;  // swell
     const tremor = Math.sin(t * 20) * 0.05;     // hand wobble
     return Math.max(0.1, base + tremor);
   }
   ```
3. **Per-point pressure in spline** — `[[x, y, pressure], ...]`

### C. Combining Multiple Brush Types on Same Element
```js
// Rose petal: marker base + charcoal texture + pen outline
push();
translate(x, y);
rotate(petalAngle);

// 1. Broad marker base
brush.set("marker", CRIMSON, 1.5);
brush.spline(petalCurve, 0.6);

// 2. Charcoal texture overlay
brush.set("charcoal", "#2a0008", 0.4);
brush.spline(petalCurve, 0.6);

// 3. Fine pen outline
brush.set("pen", "#1a0005", 0.3);
brush.spline(petalCurve, 0.6);

pop();
```

### D. Wiggle for Hand-Drawn Feel
```js
brush.wiggle(3);  // subtle wobble on all subsequent strokes
// draw elements...
brush.noField();  // disable after
```
This makes every stroke slightly imperfect — matching the hand-painted quality of real Ottoman illumination.

### E. brush.Plot for Reusable Motifs
```js
// Define a petal plot once
let petalPlot = new brush.Plot("curve");
petalPlot.addSegment(0, 15, 0.3);      // start thin
petalPlot.addSegment(-15, 20, 1.2);    // swell left
petalPlot.addSegment(10, 15, 0.8);     // curve right
petalPlot.endPlot(0, 0.1);             // taper to point

// Stamp it around a flower center
for (let i = 0; i < 8; i++) {
  petalPlot.rotate(360/8);
  brush.set("marker", CRIMSON, 1);
  petalPlot.draw(flowerX, flowerY);
}
```

### F. Gradient Hatching for Shading
```js
brush.hatch(4, 45, { gradient: 0.6 });
// Hatch density fades across the shape — simulates light/shadow
```

### G. Cross-Hatching (Multiple Hatch Passes)
```js
// First pass
brush.hatchStyle("2H", "#333", 0.4);
brush.hatch(6, 45, { rand: 0.05 });
brush.noStroke(); brush.noFill();
brush.circle(x, y, r, 0.1);
brush.noHatch();

// Second pass at perpendicular angle
brush.hatch(8, -45, { rand: 0.08 });
brush.circle(x, y, r, 0.1);
brush.noHatch();
```

---

## 6. Application Plan for Ottoman Garden Elements

### Current Issues in fatiha-paintbrush.html
1. **Only using `marker`, `spray`, `pen`** — missing the rich texture potential
2. **No fill or hatch** — flower interiors are just overlapping lines
3. **No vector fields** — vine doesn't feel organic
4. **No custom brushes** — everything uses generic tips
5. **No pressure variation on spline** — vine is uniform thickness
6. **No layering** — single-pass drawing, no depth

### Upgrade Plan by Element

#### Vine (Main Spiral)
- **Custom field** matching golden spiral for organic flow
- **Spline with per-point pressure**: thick at base, thin toward center
- **Multi-brush layering**: marker base (STEM_GREEN) → charcoal texture (DARK_GREEN) → pen highlights (LIGHT_GREEN)
- **wiggle(2)** for hand-painted imperfection
- **Custom "vine" brush**: default type with grain for bark-like texture

#### Leaves
- **brush.Polygon** for leaf shape → fill + hatch combination
- **Watercolor fill**: green wash with bleed "out" for soft edges
- **Vein hatching**: fine pen strokes along leaf axis with `continuous: true`
- **Custom "ottoman_leaf" brush** for the outline stroke
- **Pressure function**: thick midrib, fine tip

#### Rose / Golden Rose
- **brush.Plot** to define one petal, stamp around center with rotation
- **Layered fills**: outer wash → inner glow → center highlight
- **Cross-hatch interior** for texture depth
- **Multiple petal layers** with decreasing radius (already done, but upgrade to fill+hatch)
- **Spray center** for pollen/stamen effect (keep existing)

#### Buds
- **Custom "ottoman_bud" brush** — teardrop tip
- **Watercolor fill** with high bleed for soft, unfurling look
- **Single hatch pass** at bud angle for texture
- **Sepal strokes** with pen brush + pressure taper

#### Ghunnah (Sustained Sound Marks)
- **Spray brush** with large scatter for ethereal effect (keep)
- **Add watercolor fill circles** underneath — very low opacity, high bleed
- **Multiple spray passes** at different sizes for depth
- **Optional: gentle hatch with cpencil** for warmth

#### Thorns
- **Custom "ottoman_thorn" brush** — triangle tip
- **Sharp pressure taper** `[1.0, 0.1]`
- **No fill needed** — thorns should be crisp and sharp

#### Vine Tendrils
- **brush.flowLine** with gardenSpiral field active
- **Custom "ottoman_tendril" brush** — thin default with grain
- **Pressure taper** to nothing at the end
- **brush.Position** to trace path through field organically

#### Falling Petals
- **Custom petal brush** instead of generic spray
- **Lower opacity** as they fall (life-based)
- **Natural rotation** following fall direction

### Performance Considerations
- `brush.Plot` is more efficient than recalculating spline points each frame
- Custom brushes with complex tips (`"custom"` type) are heavier than built-ins
- Fill/hatch operations are expensive — do them once (not per-frame)
- Our current architecture (draw once, mark as `drawn`) is correct for this
- `brush.clip()` can optimize by skipping off-screen brush work

### Rendering Order (Back to Front)
1. Background atmosphere (very low opacity fills, large shapes)
2. Vine main stroke (multi-layer)
3. Leaves (fill + hatch + outline)
4. Buds and thorns
5. Roses (layered petals with fill)
6. Ghunnah effects (spray + fill)
7. Falling petals (foreground)
8. Fine detail highlights (pen strokes, sparkles)

---

## Key Gotchas
- Canvas **must be WEBGL** — `createCanvas(w, h, WEBGL)` ✓ (we do this)
- WEBGL origin is center — need `translate(-w/2, -h/2)` for top-left coords ✓ (we do this)
- `brush.circle()` supports fill+hatch+stroke. `brush.arc()` is stroke-only
- `brush.load()` not needed for main canvas ✓ (we call it unnecessarily — can remove)
- Image brushes need `async setup()` + `await brush.add()`
- `brush.rect()` mode is strings `"corner"`/`"center"` not p5 constants
- Fill opacity is p5-style 0–255
- `randomSeed()` auto-seeds brush library — good for reproducible renders
- `brush.polygon()` is NOT affected by vector fields
- `hatch()` must be set BEFORE drawing the shape
