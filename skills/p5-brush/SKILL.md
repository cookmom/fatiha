<!-- بسم الله الرحمن الرحيم -->

---
name: p5-brush
description: >
  Generate creative art using p5.js + p5.brush library. Use when asked to:
  create generative/algorithmic art, botanical illustrations, Islamic geometric
  patterns, watercolor-style sketches, calligraphic artwork, brush-stroke
  compositions, or any p5.js canvas art using painterly effects. Produces
  standalone HTML files with WEBGL canvas. Best for rapid prototyping of
  compositions before production render pipelines. NOT for 60fps audio-reactive
  animation (use fatiha-brush for that), nor for Tyler Hobbs-quality watercolor
  on complex shapes beyond the ~43-fill budget.
version: "1.0.0"
references:
  - references/api-guide.md
  - references/custom-brushes.md
  - references/watercolor-techniques.md
---

# p5-brush Skill

Generate standalone HTML files using **p5.js v2.0.3** + **p5.brush v2.0.2-beta** for painterly generative art.

## CDN URLs (exact versions — do not change)

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/2.0.3/p5.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/p5.brush@2.0.2-beta/dist/p5.brush.min.js"></script>
```

---

## Setup Boilerplate

Every sketch MUST use `WEBGL` mode. p5.brush v2 requires WebGL and will not work in 2D mode.

```html
<!-- بسم الله الرحمن الرحيم -->
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>body { margin: 0; background: #111; display: flex; justify-content: center; align-items: center; height: 100vh; }</style>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/2.0.3/p5.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/p5.brush@2.0.2-beta/dist/p5.brush.min.js"></script>
</head>
<body>
<script>
function setup() {
  createCanvas(800, 800, WEBGL);
  brush.load();                        // REQUIRED — initialize p5.brush
  translate(-width/2, -height/2);      // REQUIRED — shift to top-left coords

  // All static art goes here
  background(240, 220, 190);           // warm paper

  // --- your art here ---
}

// For animated sketches only — omit for static
function draw() {
  translate(-width/2, -height/2);
  brush.refreshField(frameCount / 10); // re-seed field each frame
  // animated drawing here
}
</script>
</body>
</html>
```

**Key rules:**
- `brush.load()` must be called once in `setup()` before any brush calls
- `translate(-width/2, -height/2)` corrects WEBGL's center-origin to top-left — call in BOTH `setup()` AND `draw()` if using draw loop
- Static art: everything in `setup()`, no `draw()` needed
- Animated art: use `draw()` + `brush.refreshField(seed)` for evolving vector fields

---

## ⚠️ CRITICAL: Fill Budget — Hard Limit ~43

**p5.brush v2.0.2-beta crashes with `t.reduce(...).map is not a function` when exceeding ~43 watercolor fills in a single sketch.**

This is a HARD limit, not a performance suggestion. Plan your fill budget before coding.

### Fill Budget Planning

Count every `brush.fill()` + shape call as one fill unit:
```
Bad example (crashes):
  2 halos + 8 leaves×2 + 5 sepals + 16 outer petals×2 + 6 mid + 4 inner = 47 → CRASH ❌

Good example (safe):
  2 halos + 6 leaves + 5 sepals + 12 petals + 4 inner = 29 → OK ✅
```

### When Budget Is Tight: Stroke-Based Alternatives

Replace filled shapes with stroke alternatives that don't consume fill budget:
- Flower centers → `brush.set("spray", color, weight)` + `brush.circle()`  (no fill = free)
- Pollen dots → spray brush with `noFill()`
- Leaf veins → `brush.line()` with `tahrir_line` style brush
- Texture/hatching → `brush.hatch()` (counts as stroke, not fill)

---

## Clean Fill Parameters

Avoid circle/bubble artifacts in watercolor fills:

```js
brush.noStroke();
brush.fill("#8B4513", 60);          // color, opacity (0–255)
brush.fillBleed(0.001);             // SMALL value → clean edges, no artifacts
brush.fillTexture(0, 0);            // zero texture → no circle artifacts
brush.polygon(vertices);
```

**fillBleed values:**
- `0.001` — clean, controlled edge
- `0.3–0.7` — organic bleed (more watercolor-like but risks artifacts)
- Avoid `fillTexture` non-zero if you see bubble/circle artifacts

---

## ⚠️ Opacity Stacking Warning

Opacity compounds across overlapping fills. Layers build FAST:

```
Formula: combined_opacity ≈ 1 - (1 - X/255)^N
  10 layers at opacity 20  → ~54% combined
  20 layers at opacity 20  → ~79% combined
  50 layers at opacity 20  → ~98% combined  (nearly opaque)
```

**Rule:** If pencil/sketch strokes must show through fills, use single fill ≤35 opacity. Stack fills carefully.

---

## Layered Painting Order

Always paint back-to-front:

```
1. Background          — paper color or dark ground
2. Atmospheric halos   — large low-opacity circles/washes
3. Large fills         — main shape watercolor fills
4. Structural strokes  — stems, veins, main lines
5. Detail strokes      — outlines, fine details, hatching
6. Foreground overlay  — particles, pollen, sparkles
```

---

## ⚠️ Animation in draw() Loop

p5.brush in WEBGL mode **redraws from scratch every frame** — it does NOT accumulate strokes between frames. For animated/progressive drawing:

### Redraw-all pattern
```js
function draw() {
  translate(-width/2, -height/2);
  background(242, 234, 218); // clear each frame
  
  // Redraw ALL completed elements at progress=1
  for (var i = 0; i < activeStep; i++) STEPS[i].draw(1);
  
  // Draw current element at partial progress
  STEPS[activeStep].draw(progress);
}
```

### Fill jitter fix — `randomSeed()` before each fill
Fills use random bleed patterns. Without a fixed seed, completed fills jitter every frame:
```js
randomSeed(1001); // unique seed per fill — same pattern every frame
brush.fill('#0c3a6a', 35);
brush.fillBleed(0.001); brush.fillTexture(0,0);
brush.polygon(poly);
brush.noFill();
```

### Performance: fills are expensive in draw() loops
Each `brush.polygon()` fill costs ~2-3ms. At 7+ fills per frame, expect 15-20fps instead of 60.
- Target **30fps** (`frameRate(30)`) for fill-heavy animations
- Make fill durations **instant** (0.1s) — fade-in ramps waste frames
- Use `pixelDensity(1)` to prevent DPR multiplication of the framebuffer

### Mobile Safari — canvas size limits
- Fixed canvas (e.g. 1080×1920) + CSS scaling is safer than DPR-responsive
- `pixelDensity(1)` AFTER `createCanvas()` to force 1:1 pixels
- `object-fit:contain` on canvas CSS prevents aspect stretch
- Use `100dvh` not `100vh` for Safari dynamic viewport

### Progressive line drawing
For stroke-by-stroke reveal, draw partial segments each frame:
```js
function drawSegments(segs, progress) {
  var totalLen = 0, lens = [];
  for (var i = 0; i < segs.length; i++) {
    var dx=segs[i].to[0]-segs[i].from[0], dy=segs[i].to[1]-segs[i].from[1];
    lens.push(Math.sqrt(dx*dx+dy*dy)); totalLen += lens[i];
  }
  var target = progress * totalLen, drawn = 0;
  for (var i = 0; i < segs.length; i++) {
    if (drawn+lens[i] <= target) {
      brush.line(segs[i].from[0],segs[i].from[1],segs[i].to[0],segs[i].to[1]);
      drawn += lens[i];
    } else {
      var t = (target-drawn)/lens[i];
      var px=segs[i].from[0]+(segs[i].to[0]-segs[i].from[0])*t;
      var py=segs[i].from[1]+(segs[i].to[1]-segs[i].from[1])*t;
      brush.line(segs[i].from[0],segs[i].from[1],px,py);
      return [px,py]; // tip position
    }
  }
}
```

### HUD overlay alignment
When canvas is CSS-scaled and centered, HUD elements need the canvas's live bounding rect:
```js
var r = canvasEl.getBoundingClientRect();
dotEl.style.left = (canvasX * hudScale + r.left) + 'px';
dotEl.style.top  = (canvasY * hudScale + r.top) + 'px';
```
Recalculate `r` every frame — Safari address bar changes offsets dynamically.

---

## Brush Types (5 Available)

### 1. Default (pencil-like)
```js
brush.set("default", "#2A3A18", 1.5);
brush.line(x1, y1, x2, y2);
```

### 2. Spray
```js
brush.set("spray", "#D4A820", 3);
brush.circle(cx, cy, r);           // scattered dot fill
```

### 3. Marker (flat, solid)
```js
brush.set("marker", "#C41E3A", 4);
brush.line(x1, y1, x2, y2);
```

### 4. Custom (user-defined tip)
```js
brush.add("myBrush", {
  type: "custom",
  weight: 8,
  opacity: 60,
  spacing: 0.3,
  tip: (_m) => {
    _m.ellipse(0, 0, 2, 4);        // define shape in tip function
  }
});
brush.set("myBrush", "#8B4513", 8);
```

### 5. Image (async, requires await)
```js
// Must be called with await in an async setup or preload
let img = await loadImage("petal.png");
brush.add("imgBrush", { type: "image", image: img, weight: 20 });
```

See [`references/custom-brushes.md`](references/custom-brushes.md) for 5 ready-to-use recipes.

---

## Quick Reference: Core Drawing

```js
// Strokes
brush.set("default", color, weight);  // activate brush
brush.line(x1, y1, x2, y2);
brush.spline([[x,y,pressure], [x,y,pressure], ...]);
brush.circle(cx, cy, radius);         // stroke circle outline
brush.polygon(vertexArray);           // stroke polygon
brush.rect(x, y, w, h);

// Fill
brush.fill(color, opacity);           // set fill (0–255 opacity)
brush.fillBleed(strength);            // edge wobble (0.001 = clean)
brush.fillTexture(strength, scale);   // texture (0,0 = no artifacts)
brush.noFill();

// Stroke on/off
brush.stroke();                       // enable stroke (default on)
brush.noStroke();
brush.wiggle(amount);                 // randomize stroke path

// Vector fields
brush.field("curved");                // activate named field
```

See [`references/api-guide.md`](references/api-guide.md) for full API.

---

## Watercolor Techniques

For authentic multi-layer watercolor beyond p5.brush's single-pass `fillBleed`, see [`references/watercolor-techniques.md`](references/watercolor-techniques.md) — covers Tyler Hobbs polygon deformation, hybrid integration strategy, and opacity math.

---

## Minimal Working Example

```html
<!-- بسم الله الرحمن الرحيم -->
<!DOCTYPE html><html><head><meta charset="utf-8">
<script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/2.0.3/p5.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/p5.brush@2.0.2-beta/dist/p5.brush.min.js"></script>
</head><body><script>
function setup() {
  createCanvas(600, 600, WEBGL);
  brush.load();
  translate(-width/2, -height/2);
  background(240, 225, 195);

  // Watercolor circle
  brush.noStroke();
  brush.fill("#6B8E5A", 55);
  brush.fillBleed(0.001);
  brush.fillTexture(0, 0);
  brush.circle(300, 300, 150);

  // Pencil outline
  brush.set("default", "#2A3A18", 1);
  brush.noFill();
  brush.circle(300, 300, 150);

  // Organic line
  brush.set("default", "#8B4513", 1.5);
  brush.spline([[100,500,0.5],[200,400,1],[300,450,0.8],[450,350,1],[550,300,0.3]]);
}
</script></body></html>
```
