<!-- بسم الله الرحمن الرحيم -->

# p5.brush API Guide

Complete API reference for p5.brush v2.0.2-beta.

---

## Initialization

```js
brush.load();   // REQUIRED — call once in setup() before any brush calls
```

---

## Brush Activation

### `brush.set(brushName, color, weight)`

Activates a named brush for subsequent drawing calls.

```js
brush.set("default", "#2A3A18", 1.5);   // pencil-like
brush.set("spray",   "#D4A820", 3);      // scattered dots
brush.set("marker",  "#C41E3A", 4);      // flat solid
brush.set("myCustomBrush", color, w);    // any brush added via brush.add()
```

- `brushName` — string, must match a registered brush name
- `color` — hex string, CSS color, or p5 color object
- `weight` — stroke weight multiplier (scales the brush's base weight)

---

## Drawing Primitives

### `brush.line(x1, y1, x2, y2)`

Draws a brush-stroked line from (x1,y1) to (x2,y2).

```js
brush.set("default", "#333", 1);
brush.line(100, 100, 400, 300);
```

---

### `brush.spline(points, tension?)`

Draws a smooth curve through control points with per-point pressure.

```js
brush.spline([
  [x1, y1, pressure1],   // pressure: 0.0–2.0 (1.0 = normal)
  [x2, y2, pressure2],
  [x3, y3, pressure3],
  // ...
], 0.8);                 // tension: 0.0–1.0 (default 0.5)
```

- Each point: `[x, y, pressure]` — pressure scales stroke width at that point
- Pressure `0.3` = thin, `1.0` = normal, `2.0` = double weight
- Useful for calligraphic strokes with thick/thin variation

---

### `brush.circle(cx, cy, radius)`

Draws a circle outline (stroke) or filled circle.

```js
brush.set("default", "#555", 1);
brush.circle(300, 300, 100);          // stroke only

brush.noStroke();
brush.fill("#8B4513", 60);
brush.fillBleed(0.001);
brush.circle(300, 300, 100);          // watercolor fill
```

---

### `brush.polygon(vertices)`

Draws a polygon from an array of [x,y] vertex pairs.

```js
let pts = [[100,200], [200,100], [300,200], [250,300], [150,300]];

// Stroke only
brush.set("default", "#333", 1);
brush.noFill();
brush.polygon(pts);

// Fill only
brush.noStroke();
brush.fill("#6B8E5A", 55);
brush.fillBleed(0.001);
brush.fillTexture(0, 0);
brush.polygon(pts);
```

---

### `brush.rect(x, y, w, h)`

Draws a rectangle.

```js
brush.set("marker", "#C41E3A", 2);
brush.rect(100, 100, 200, 150);
```

---

## Fill Controls

### `brush.fill(color, opacity)`

Sets the fill color and opacity for subsequent shape calls.

```js
brush.fill("#8B4513", 60);    // color, opacity 0–255
brush.fill("#6B8E5A", 35);    // low opacity for layering
```

- Opacity 0–255 (not 0–100 or 0–1)
- Layers compound quickly — see SKILL.md opacity stacking warning

---

### `brush.fillBleed(strength, direction?)`

Controls watercolor edge bleed.

```js
brush.fillBleed(0.001);           // clean edge, minimal bleed
brush.fillBleed(0.5);             // moderate organic bleed
brush.fillBleed(0.7, "out");      // bleed outward
brush.fillBleed(0.7, "in");       // bleed inward
```

- `strength` 0.0–1.0: 0.001 = clean, 0.3–0.7 = watercolor-like
- Values > 0.001 with texture can cause circle/bubble artifacts — test carefully

---

### `brush.fillTexture(strength, scale)`

Adds texture holes to fills (simulates paper grain absorbing pigment).

```js
brush.fillTexture(0, 0);          // NO texture — cleanest fills
brush.fillTexture(0.4, 0.3);      // moderate texture
brush.fillTexture(0.7, 0.5);      // heavy grain
```

- **Use `(0, 0)` when you see circle/bubble artifacts** — this is the fix
- Non-zero values cut random holes in the fill shape

---

### `brush.noFill()`

Disables fill for subsequent shapes.

```js
brush.noFill();
brush.set("default", "#333", 1);
brush.circle(300, 300, 100);     // stroke only, no fill
```

---

## Stroke Controls

### `brush.stroke()` / `brush.noStroke()`

Enable or disable stroke for subsequent shapes.

```js
brush.noStroke();                  // fill only
brush.fill("#8B4513", 60);
brush.circle(300, 300, 100);

brush.stroke();                    // re-enable
brush.set("default", "#333", 1);
```

---

### `brush.wiggle(amount)`

Adds path randomization to strokes (wobbly/organic quality).

```js
brush.wiggle(0.5);    // subtle wobble
brush.wiggle(2.0);    // very wobbly
brush.wiggle(0);      // straight/precise (default)
```

---

## Vector Fields

Vector fields define directional flow that strokes follow.

### `brush.field(name)`

Activates a named vector field.

```js
brush.field("curved");    // smooth organic curves
brush.field("hand");      // natural hand-drawn feel
brush.field("none");      // deactivate field
```

**Built-in fields:**
| Name | Character |
|------|-----------|
| `hand` | Natural hand-drawn, slight randomness |
| `curved` | Smooth organic arcs |
| `zigzag` | Back-and-forth angular motion |
| `waves` | Sinusoidal wave flow |
| `spiral` | Inward/outward spiral |
| `seabed` | Gentle undulating curves |
| `columns` | Vertical column flow |

---

### `brush.addField(name, fn, options?)`

Creates a custom vector field.

```js
brush.addField("goldenSpiral", function(t, field) {
  const cx = width * 0.55;
  const cy = height * 0.45;
  for (let col = 0; col < field.length; col++) {
    for (let row = 0; row < field[0].length; row++) {
      const x = col * (width / field.length);
      const y = row * (height / field[0].length);
      const dx = x - cx, dy = y - cy;
      const theta = Math.atan2(dy, dx);
      field[col][row] = (theta + Math.PI/2 + 0.15) * 180 / Math.PI;
    }
  }
  return field;
}, { angleMode: "degrees" });

brush.field("goldenSpiral");  // activate it
```

- `fn(t, field)` receives current time `t` and a 2D grid to fill with angle values
- `angleMode`: `"degrees"` or `"radians"`

---

### `brush.refreshField(seed)`

Re-seeds the active field — required for animation.

```js
function draw() {
  translate(-width/2, -height/2);
  brush.refreshField(frameCount / 10);  // evolving field
  // drawing calls...
}
```

---

## Position Walker

A walker that moves through the active vector field — useful for generating organic paths.

### `new brush.Position(x, y)`

Creates a walker at position (x, y).

```js
let walker = new brush.Position(startX, startY);
```

### `walker.angle()`

Returns the field angle at the walker's current position (degrees).

```js
let dir = walker.angle();
```

### `walker.moveTo(angle, distance, randomness)`

Moves the walker in a direction.

```js
walker.moveTo(angle, 2, 0.5);   // direction, step size, randomness 0–1
```

### Full Walker Example

```js
brush.field("curved");
let walker = new brush.Position(100, 400);
brush.set("default", "#2A3A18", 1);

for (let i = 0; i < 300; i++) {
  let angle = walker.angle();
  walker.moveTo(angle, 3, 0.3);

  // Stamp elements at intervals
  if (i % 40 === 0) {
    brush.set("spray_pollen", "#D4A820", 2);
    brush.circle(walker.x, walker.y, 8);
    brush.set("default", "#2A3A18", 1);
  }
}
```
