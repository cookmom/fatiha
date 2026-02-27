# SKILL.md — CSS Stacking Contexts & Z-Index Layering

> The complete mental model for controlling what renders on top of what in CSS, with special focus on Three.js canvas + overlay patterns.

## Core Mental Model

A **stacking context** is a 3D conceptual layer. Elements within a stacking context are painted together as a unit. Children of a stacking context can never escape it — they can only be reordered *within* their parent context.

Think of stacking contexts like **sealed envelopes**. You can reorder cards inside an envelope, but the entire envelope sits at one position in the outer stack. No card can poke through the envelope.

---

## 1. What Creates a Stacking Context

Any of these on an element creates a new stacking context:

| Trigger | Example | Notes |
|---|---|---|
| `position` + `z-index` (not `auto`) | `position: relative; z-index: 1` | The classic one |
| `position: fixed/sticky` | — | Always creates one (even without z-index) |
| `opacity` < 1 | `opacity: 0.99` | **Sneaky!** Even 0.999 triggers it |
| `transform` (not `none`) | `transform: translateZ(0)` | Including `translate3d`, `scale`, etc. |
| `filter` (not `none`) | `filter: blur(0px)` | Even a no-op filter creates one |
| `backdrop-filter` | `backdrop-filter: blur(10px)` | — |
| **`mix-blend-mode`** (not `normal`) | `mix-blend-mode: multiply` | ⚠️ **This was our bug** |
| `isolation: isolate` | — | Explicitly creates one (that's its whole job) |
| `will-change` | `will-change: transform` | If it references a stacking-context property |
| `contain: paint/layout/strict/content` | — | — |
| Flex/grid child with `z-index` (not `auto`) | `z-index: 0` on a flex item | No `position` needed! |
| `clip-path` / `mask` | — | — |
| `-webkit-overflow-scrolling: touch` | — | iOS Safari |

### The Killer Insight

**`z-index` only works on positioned elements** (or flex/grid children). Setting `z-index: 9999` on a `position: static` element does **nothing**.

But many other properties (opacity, transform, filter, mix-blend-mode) create stacking contexts *without* needing position. This mismatch causes most confusion.

---

## 2. Painting Order Within a Stacking Context

Within each stacking context, elements paint in this exact order (back to front):

```
1. Background & borders of the stacking context root
2. Child stacking contexts with negative z-index (most negative first)
3. In-flow, non-positioned block-level elements (normal flow)
4. Non-positioned floats
5. In-flow, non-positioned inline-level elements (text, inline-blocks)
6. Child stacking contexts with z-index: 0 or auto + positioned elements with z-index: auto
7. Child stacking contexts with positive z-index (lowest first)
```

**Key takeaway**: Non-positioned block elements paint *below* floats, which paint *below* inline content, which paints *below* positioned elements. This is why text appears over backgrounds "for free."

---

## 3. Common Gotchas

### 3a. z-index Does Nothing

```css
/* ❌ BROKEN — not positioned */
.overlay { z-index: 9999; }

/* ✅ FIXED */
.overlay { position: relative; z-index: 9999; }
```

### 3b. Stacking Context Isolation (The Envelope Problem)

```css
/* Parent A: z-index: 1 */
/*   Child:  z-index: 9999 — TRAPPED inside Parent A */
/* Parent B: z-index: 2 — renders ON TOP of Child */
```

No matter how high the child's z-index, it cannot escape its parent's stacking context. The parents are compared first.

### 3c. z-index: auto vs z-index: 0

- `auto` — Does **not** create a new stacking context. Children participate in the parent's stacking context.
- `0` — **Creates** a new stacking context. Children are sealed inside.

This difference is critical for overlay patterns.

### 3d. Pseudo-Elements

`::before` and `::after` are children of their element. With `z-index: -1` and `position: absolute`, a pseudo-element renders *behind* its parent's content but:
- If the parent has a stacking context → pseudo stays inside it
- If the parent does NOT have a stacking context → pseudo can go behind the parent's background (renders in the grandparent's context at step 2)

```css
/* Pseudo behind parent — parent must NOT be a stacking context */
.parent { position: relative; /* no z-index, no opacity<1, no transform */ }
.parent::before {
  content: '';
  position: absolute;
  z-index: -1;
  inset: 0;
  background: red; /* renders behind .parent's content */
}
```

---

## 4. mix-blend-mode Creates Stacking Contexts (Our Bug)

**This is the critical gotcha we hit.**

```css
.grain-overlay {
  mix-blend-mode: multiply; /* ← Creates a new stacking context! */
  z-index: 5;
}
```

When `mix-blend-mode` is anything other than `normal`, the browser:
1. Creates a new stacking context on that element
2. Creates an **isolation group** — the element composites with what's *directly behind it* in paint order

**Why this broke our overlay**: The blend mode created a stacking context that interacted with the painting order in unexpected ways. The grain overlay either:
- Got sealed inside a parent stacking context (couldn't sit between background and canvas)
- Created its own compositing group that blended with the wrong layer

### The Fix Pattern

Use `isolation: isolate` on the container to control *what* the blend mode composites against. Or restructure so the blend-mode element and its compositing target are siblings in the same stacking context.

```css
.scene-container {
  position: relative;
  isolation: isolate; /* Controls compositing boundary */
}

.grain-overlay {
  position: absolute;
  inset: 0;
  mix-blend-mode: multiply;
  z-index: 1; /* Between bg (auto) and canvas (2) */
  pointer-events: none;
}

canvas {
  position: relative;
  z-index: 2;
}
```

---

## 5. Canvas Elements & CSS Layers

### Opaque vs Transparent Canvas

By default, `<canvas>` has an **opaque** backing store. CSS layers behind it are invisible through it.

```js
// Make canvas transparent so CSS layers show through
renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.setClearColor(0x000000, 0); // Fully transparent clear
```

Without `alpha: true`, the canvas is a solid rectangle — nothing behind it is visible regardless of z-index.

### Canvas Compositing with CSS

The canvas element participates in CSS stacking like any other element. Its rendered content is composited as a bitmap into the CSS layer stack. Key points:

- Canvas is a **replaced element** (like `<img>`)
- It paints at its position in the stacking order
- With `alpha: true`, transparent pixels let lower layers show through
- GPU-composited canvases may be on their own compositor layer (browser optimization), but this doesn't change logical stacking order

### Canvas + Overlay Pattern

For grain/noise over a Three.js scene:

```
Layer stack (back to front):
  1. Page background (CSS)
  2. Three.js canvas (alpha:true, z-index:0 or auto)
  3. Grain overlay (z-index:1, pointer-events:none)
```

For grain *under* a transparent canvas (visible through transparent areas):

```
Layer stack (back to front):
  1. Page background (CSS)
  2. Grain texture (z-index:0)
  3. Three.js canvas (alpha:true, z-index:1)
```

---

## 6. Best Practices for Overlay/Underlay Patterns

### Pattern A: Grain Texture Over WebGL

```css
.container {
  position: relative;
  isolation: isolate; /* Clean compositing boundary */
}

canvas {
  display: block;
  /* No position/z-index needed if it's the base layer */
}

.grain {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  background: url('grain.png');
  opacity: 0.15; /* ⚠️ Creates stacking context — fine here, we want it on top */
  /* OR use mix-blend-mode: overlay; — also fine on the topmost layer */
}
```

### Pattern B: Glass Effect (Blur + Tint Over Canvas)

```css
.glass {
  position: absolute;
  z-index: 2;
  backdrop-filter: blur(12px);
  background: rgba(255, 255, 255, 0.1);
  pointer-events: auto; /* This one IS interactive */
}
```

Note: `backdrop-filter` only blurs what's *behind* the element in paint order. If the canvas is on a separate compositor layer, `backdrop-filter` may not capture it (browser-dependent).

### Pattern C: HUD Over Three.js

```css
.hud-container {
  position: absolute;
  inset: 0;
  z-index: 10;
  pointer-events: none; /* Let clicks pass to canvas */
}

.hud-container button {
  pointer-events: auto; /* Re-enable on interactive elements */
}
```

### Golden Rules

1. **Use `isolation: isolate`** on the shared container to scope blend modes
2. **Always `pointer-events: none`** on non-interactive overlays
3. **`alpha: true`** on WebGLRenderer if you need CSS layers visible through the canvas
4. **Don't mix blend modes and z-index** unless you understand both create stacking contexts
5. **Prefer flat sibling structures** — avoid deep nesting that creates implicit stacking contexts
6. **Debug with DevTools**: Chrome → Layers panel shows actual compositor layers and stacking contexts

---

## Quick-Reference Cheat Sheet

```
CREATES STACKING CONTEXT?
  position + z-index (not auto)  ✅
  position: fixed/sticky          ✅
  opacity < 1                     ✅  ← sneaky
  transform (not none)            ✅  ← sneaky
  filter (not none)               ✅  ← sneaky
  mix-blend-mode (not normal)     ✅  ← sneaky, also compositing group
  isolation: isolate              ✅  ← explicit, use this!
  will-change (stacking prop)     ✅
  flex/grid child + z-index       ✅  ← no position needed!
  contain: paint/layout           ✅

z-index WORKS ON:
  position: relative/absolute/fixed/sticky  ✅
  flex children                              ✅
  grid children                              ✅
  position: static                           ❌ (ignored!)

PAINTING ORDER (back → front):
  bg/border → z<0 → blocks → floats → inlines → z:0/auto → z>0

CANVAS TRANSPARENCY:
  new THREE.WebGLRenderer({ alpha: true })
  renderer.setClearColor(0x000000, 0)
```

---

## Common Bug Patterns & Fixes

### Bug: "z-index: 9999 isn't working!"
**Cause**: Element is `position: static`
**Fix**: Add `position: relative` (or the element is a flex/grid child)

### Bug: "Child can't appear above a sibling's parent"
**Cause**: Parent has a stacking context (z-index, opacity, transform, etc.)
**Fix**: Remove the parent's stacking context trigger, or restructure as siblings

### Bug: "Overlay appears behind canvas"
**Cause**: Canvas has higher stacking position, or overlay isn't positioned
**Fix**: `position: absolute; z-index` higher than canvas on the overlay

### Bug: "Grain overlay covers everything, even UI"
**Cause**: Overlay z-index is above UI elements
**Fix**: Put overlay + canvas in an `isolation: isolate` container; keep UI outside or at higher z-index

### Bug: "mix-blend-mode overlay doesn't blend with expected layer"
**Cause**: `mix-blend-mode` creates a stacking context + compositing group. It blends with whatever is directly below in paint order within its parent stacking context.
**Fix**: Use `isolation: isolate` on the common container. Ensure blend target is a sibling, not a cousin.

### Bug: "Canvas is a solid black/white rectangle, nothing shows through"
**Cause**: WebGL context is opaque by default
**Fix**: `{ alpha: true }` + `setClearColor(0x000000, 0)` + ensure scene background is null/transparent

### Bug: "opacity: 0.99 overlay broke z-index of children"
**Cause**: `opacity < 1` creates a stacking context, sealing children inside
**Fix**: Use `opacity: 1` if you don't need transparency, or accept the stacking context and adjust z-indices within

### Bug: "backdrop-filter doesn't blur the canvas content"
**Cause**: Browser may composite canvas on a separate GPU layer that `backdrop-filter` can't sample
**Fix**: Browser-specific; try `will-change: auto` on canvas, or render blur in Three.js instead

---

## Proven Pattern: Bauhaus Grain Overlay (agiftoftime.app v188+)

The "transparent canvas sandwich" — grain texture between CSS background and WebGL content.

### Architecture
```
┌─────────────────────────────────┐
│ .overlay (position:fixed)       │  ← CSS background-color (dial color)
│                                 │
│  ::after (z-index:1)            │  ← grain texture tile (plus-lighter, 0.2)
│                                 │
│  <canvas> (z-index:2)           │  ← Three.js, alpha:true, transparent bg
│    scene.background = null      │     only clock elements render
│    renderer.setClearColor(0,0,0,0)
└─────────────────────────────────┘
```

### CSS
```css
.clock-fs-overlay {
  position: fixed; inset: 0;
  background: #585860; /* dial color — synced from JS */
}
.clock-fs-overlay::after {
  content: '';
  position: absolute; inset: 0;
  z-index: 1;
  background-image: url(grain-fine.png);
  background-repeat: repeat;
  background-size: 148.5px auto;    /* 75% of 200px tile = denser */
  mix-blend-mode: plus-lighter;     /* adds luminosity, not overlay */
  opacity: 0.2;
  pointer-events: none;
}
.clock-fs-overlay canvas {
  z-index: 2;                       /* above grain, transparent bg */
}
```

### Three.js Setup
```js
// Renderer MUST have alpha:true at creation (can't change later)
const renderer = new THREE.WebGLRenderer({ alpha: true });

// In fullscreen mode:
scene.background = null;
renderer.setClearColor(0x000000, 0);  // fully transparent
// Hide any background geometry (dial mesh, bg planes)
if (dialMesh) dialMesh.visible = false;
```

### Key Lessons
1. **`plus-lighter`** blend mode adds light — grain glows on colored bg, barely affects dark elements
2. **Canvas must be created with `alpha: true`** — cannot be changed after construction
3. **Three things for transparent canvas**: `alpha:true` + `setClearColor(0,0,0,0)` + `scene.background = null`
4. **Sync CSS bg color from JS** — update `.overlay.style.background` in render loop for day/night transitions
5. **Grain tile at 75% of source size** — denser tiling looks more refined (148.5px for 200px tile)
6. **Reaction-diffusion vermiculate texture** — Gray-Scott f=0.029, k=0.057 for labyrinthine worm-track pattern
