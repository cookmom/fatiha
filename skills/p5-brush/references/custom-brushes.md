<!-- بسم الله الرحمن الرحيم -->

# Custom Brushes — p5.brush

---

## `brush.add(name, config)`

Register a new brush. Call once in `setup()` BEFORE `brush.load()` is called — or immediately after, before drawing.

```js
brush.add("myBrush", {
  type:      "custom",   // "default" | "spray" | "marker" | "custom" | "image"
  weight:    8,          // base stroke width
  opacity:   60,         // 0–255
  spacing:   0.3,        // step between stamps (fraction of weight)
  pressure:  [0.3, 1.2, 0.1],  // [start, mid, end] pressure envelope
  rotate:    "natural",  // "natural" | "random" | "fixed" | degrees
  markerTip: false,      // true = soft tip buildup; false = clean stamps
  tip: (_m) => {         // required for type:"custom"
    _m.ellipse(0, 0, 2, 4);
  },
  scatter:   0.5,        // lateral scatter (spray-type)
  sharpness: 0.8,        // edge sharpness (default-type)
  grain:     3,          // paper grain interaction (default-type)
});
```

### Config Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `type` | string | Brush engine: `"default"`, `"spray"`, `"marker"`, `"custom"`, `"image"` |
| `weight` | number | Base width in pixels |
| `opacity` | number | 0–255, stroke transparency |
| `spacing` | number | Stamp step as fraction of weight (0.1=dense, 1.0=separated) |
| `pressure` | array | `[start, mid, end]` envelope — scales width at those positions |
| `rotate` | string/number | `"natural"` (follows stroke), `"random"`, `"fixed"`, or degrees |
| `markerTip` | boolean | `false` = clean stamp; `true` = marker buildup at endpoints |
| `tip` | function | `(_m) => { ... }` — draw shape in tip function for `"custom"` type |
| `scatter` | number | Lateral scatter radius (mainly for `"spray"`) |
| `sharpness` | number | 0–1, edge crispness (for `"default"` type) |
| `grain` | number | Paper grain texture strength (for `"default"` type) |

### `markerTip: false` — When to Use

Set `markerTip: false` for **custom** and **image** brushes where you want precise shape stamps without soft endpoint buildup. Essential for botanical stamps (petals, leaves) where you don't want smeared tips.

---

## Brush Maker Tool

**Interactive web tool:** https://acamposuribe.github.io/p5.brush/tools/brush-maker.html

- Live preview with light/dark mode toggle
- Tweak weight, scatter, sharpness, grain, opacity, spacing, rotation
- Pressure curves: simple [start, mid, end] or Gaussian modes
- Custom tip drawing via code editor
- Image tip upload and preview
- **Copy button** → generates ready-to-paste `brush.add()` code

Use this tool to design brushes visually, then paste the generated code.

---

## 5 Ready-to-Use Brush Recipes

### 1. `ottoman_petal` — Rose & Hatai Petals

Ottoman botanical ogee/almond petal shape. Use for rose outer petals, hatai blossoms.

```js
brush.add("ottoman_petal", {
  type: "custom",
  weight: 8,
  opacity: 60,
  spacing: 0.3,
  pressure: [0.3, 1.2, 0.1],   // taper in, fat middle, sharp tip
  markerTip: false,              // clean stamp, no buildup
  rotate: "natural",
  tip: (_m) => {
    // Ogee/almond petal — Ottoman botanical characteristic
    _m.beginShape();
    _m.vertex(0, -2);
    _m.bezierVertex(1.5, -1.5, 2, 0, 1.2, 1.5);   // right bulge
    _m.vertex(0, 3);                                  // tip
    _m.bezierVertex(-2, 0, -1.5, -1.5, 0, -2);      // left bulge
    _m.endShape(CLOSE);
  }
});
```

**Usage:**
```js
brush.set("ottoman_petal", "#C41E3A", 8);
brush.spline([[cx,cy,0.2],[cx+20,cy-30,1],[cx,cy-60,0.1]]);
```

---

### 2. `saz_leaf` — Curved Almond Leaf with Vein

Long saz-style leaf with asymmetric curve and central vein. Use for foliage along vine stems.

```js
brush.add("saz_leaf", {
  type: "custom",
  weight: 12,
  opacity: 45,
  spacing: 0.4,
  pressure: [0.5, 1.0, 0.2],   // starts medium, thins to tip
  markerTip: false,
  rotate: "natural",
  tip: (_m) => {
    // Long saz leaf with asymmetric curve
    _m.beginShape();
    _m.vertex(0, -1);
    _m.bezierVertex(1.8, -0.5, 2.2, 1, 0.8, 3);
    _m.vertex(0, 4);                                 // pointed tip
    _m.bezierVertex(-1.5, 1, -1.2, -0.5, 0, -1);
    _m.endShape(CLOSE);
    // Central vein
    _m.stroke(0, 80);
    _m.strokeWeight(0.15);
    _m.line(0, -0.5, 0, 3.5);
  }
});
```

**Usage:**
```js
brush.field("curved");
let walker = new brush.Position(100, 400);
for (let i = 0; i < 400; i++) {
  let angle = walker.angle();
  walker.moveTo(angle, 3, 0.2);
  if (i % 50 === 0) {
    brush.set("saz_leaf", "#4A7040", 12);
    brush.spline([[walker.x, walker.y, 0.5],[walker.x+10, walker.y-20, 1],[walker.x, walker.y-40, 0.2]]);
  }
}
```

---

### 3. `calligraphy_naskh` — Flat Nib for Arabic Letterforms

Flat chisel nib at ~30° angle (traditional naskh pen angle). Use for Arabic text and border calligraphy.

```js
brush.add("calligraphy_naskh", {
  type: "custom",
  weight: 6,
  opacity: 200,
  spacing: 0.15,              // very tight for smooth ink strokes
  pressure: [0.8, 1.0, 0.6],
  markerTip: true,            // buildup = ink pooling at stroke starts
  rotate: "natural",
  tip: (_m) => {
    // Flat chisel nib at 30° (traditional naskh angle)
    _m.rotate(30 * Math.PI / 180);
    _m.rect(-2, -0.3, 4, 0.6);  // wide flat nib
  }
});
```

**Usage:**
```js
brush.set("calligraphy_naskh", "#1A0A00", 6);
// Use spline with pressure variation for thick/thin contrast
brush.spline([[200,300,0.5],[250,280,1],[300,300,0.3],[350,320,1],[400,300,0.2]]);
```

---

### 4. `tahrir_line` — Fine Outline for Illumination Borders

Ultra-fine, slightly grainy outline pen. Use for tahrir (outlining) in Ottoman illumination — borders, leaf veins, petal outlines.

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

**Usage:**
```js
brush.set("tahrir_line", "#1A2A10", 0.3);
brush.noFill();
brush.polygon(leafVertices);      // clean outline over watercolor fill
```

---

### 5. `spray_pollen` — Golden Pollen Dots

Scattered gold dots for flower centers, pollen clouds, atmospheric sparkle. Does NOT consume fill budget (stroke-only).

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

**Usage:**
```js
// Flower center — no fill needed, free from fill budget
brush.set("spray_pollen", "#D4A820", 3);
brush.noFill();
brush.circle(flowerCx, flowerCy, 20);    // pollen cloud around center

// Or scattered cloud
for (let i = 0; i < 8; i++) {
  brush.circle(
    flowerCx + random(-15, 15),
    flowerCy + random(-15, 15),
    random(5, 12)
  );
}
```

---

## Combining Brushes: Botanical Flower Example

```js
// Register brushes (once in setup)
brush.add("ottoman_petal",  { /* ... recipe above */ });
brush.add("tahrir_line",    { /* ... recipe above */ });
brush.add("spray_pollen",   { /* ... recipe above */ });

function drawFlower(cx, cy, r, color) {
  // 1. Watercolor petals (costs fill budget — plan carefully!)
  brush.noStroke();
  brush.fill(color, 55);
  brush.fillBleed(0.001);
  brush.fillTexture(0, 0);
  for (let i = 0; i < 6; i++) {
    let angle = (i / 6) * TWO_PI;
    let px = cx + cos(angle) * r * 0.6;
    let py = cy + sin(angle) * r * 0.6;
    brush.circle(px, py, r * 0.5);   // 6 petals = 6 fill budget units
  }

  // 2. Tahrir outlines (free — stroke only)
  brush.set("tahrir_line", "#1A2A10", 0.3);
  brush.noFill();
  brush.circle(cx, cy, r);

  // 3. Pollen center (free — no fill)
  brush.set("spray_pollen", "#D4A820", 2);
  brush.noFill();
  brush.circle(cx, cy, r * 0.25);
}
```
