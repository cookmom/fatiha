# fatiha.brush — Custom Ottoman Brush Engine

## Why

p5.brush produces stunning natural-media aesthetics — watercolor bleeds, grain texture, soft edges, hatching — but it's an **immediate-mode illustration library**, not an animation engine. Our gap analysis confirmed:

- No retained stroke graph → can't fade/remove stamps after drawing
- Performance degrades past ~50 simultaneous elements at 60fps
- No shader hooks for custom post-processing
- Closed rendering pipeline → can't add glow, bloom, or layer compositing

**fatiha.brush** keeps the organic look but rebuilds the renderer for real-time voice-reactive art.

---

## 1. Architecture Overview

```
┌─────────────────────────────────────────────────┐
│                 fatiha.brush                      │
├─────────────────────────────────────────────────┤
│  StampBuffer (Float32Array ring buffer)          │
│  ├── position (x, y)                             │
│  ├── rotation (radians)                          │
│  ├── scale (sx, sy)                              │
│  ├── color (r, g, b, a)                          │
│  ├── texIndex (which brush tip)                  │
│  ├── age / lifetime                              │
│  └── layer index                                 │
├─────────────────────────────────────────────────┤
│  TextureAtlas                                    │
│  ├── Procedural brush tips (soft round, leaf,    │
│  │   petal, spray, hatch line)                   │
│  └── Loaded from canvas → WebGL texture          │
├─────────────────────────────────────────────────┤
│  Layer System                                    │
│  ├── Each layer = separate framebuffer           │
│  ├── Composited in order with blend modes        │
│  └── Per-layer opacity, blur, blend              │
├─────────────────────────────────────────────────┤
│  WebGL Instanced Renderer                        │
│  ├── Single draw call per layer                  │
│  ├── Instanced quads with per-stamp attributes   │
│  ├── Fragment shader: texture sample × color     │
│  │   × grain noise × opacity fade                │
│  └── Additive / alpha blend modes                │
├─────────────────────────────────────────────────┤
│  Audio Parameter Bus                             │
│  ├── amplitude → stamp scale, spawn rate         │
│  ├── energy → color saturation, opacity          │
│  └── Smoothed with exponential filter            │
└─────────────────────────────────────────────────┘
```

### Key Design Decisions

- **Retained mode**: All stamps live in a GPU-side buffer. Can be aged, faded, removed.
- **Instanced rendering**: One `drawArraysInstanced` call per layer for ALL stamps in that layer. No per-stamp draw calls.
- **Ring buffer**: Fixed-capacity stamp buffer. When full, oldest stamps are overwritten (or expired stamps are recycled).
- **Procedural textures**: Brush tips generated on a canvas at init, uploaded as a texture atlas. No external image dependencies.

---

## 2. Core API Design

```js
// ── Initialization ──────────────────────────────
const fb = new FatihaBrush(canvas, {
  maxStamps: 4096,        // ring buffer capacity
  layers: ['garden', 'glow', 'petals'],
  background: '#0d0d0d',
  width: 430,
  height: 932
});

// ── Stamp Operations ────────────────────────────
fb.addStamp({
  x, y,                   // position
  rotation: 0,            // radians
  scaleX: 1, scaleY: 1,   // size multipliers
  r, g, b, a,             // color (0-1 floats)
  texture: 'soft_round',  // brush tip name
  layer: 'garden',        // which layer
  lifetime: Infinity,     // frames until fade-out (Infinity = permanent)
  fadeIn: 0,              // frames to fade in
  fadeOut: 30             // frames to fade out at end of life
});

// Batch add for performance (vine segments, etc.)
fb.addStamps(stampArray);

// ── Brush Tip Registry ──────────────────────────
fb.registerTip('soft_round', (ctx, size) => { ... });
fb.registerTip('petal', (ctx, size) => { ... });
// Returns texture atlas index

// ── Layer Control ───────────────────────────────
fb.setLayerOpacity('glow', 0.6);
fb.setLayerBlend('glow', 'additive');
fb.clearLayer('petals');

// ── Update & Render ─────────────────────────────
fb.update(dt);   // age stamps, expire dead ones, update fades
fb.render();     // draw all layers to screen

// ── Audio Bus ───────────────────────────────────
fb.audio.amplitude = 0.7;  // set from analyser
fb.audio.energy = 0.5;     // derived metric
// Accessed by stamp generators for reactive sizing

// ── Utility ─────────────────────────────────────
fb.stampCount;             // current live stamps
fb.resize(w, h);           // handle window resize
fb.dispose();              // cleanup WebGL resources
```

---

## 3. Stamp Texture System

### Texture Atlas Layout

A single 512×512 (or 1024×1024) texture atlas containing all brush tips in a grid.

```
┌────┬────┬────┬────┐
│soft │leaf│petal│spray│  Row 0: 128×128 cells
│round│    │    │     │
├────┬────┬────┬────┤
│hatch│thorn│bud │ ...│  Row 1
│line │    │    │     │
└────┴────┴────┴────┘
```

### Procedural Generation

Each tip is drawn on an offscreen `<canvas>` at init time:

- **soft_round**: Radial gradient, white center → transparent edge. The workhorse watercolor stamp.
- **pointed_leaf**: Saz leaf silhouette with soft edge falloff. Elongated ellipse with pointed ends.
- **petal**: Ogee/almond shape. Wider than leaf, rounder.
- **spray**: Scattered dots (stipple pattern). For pollen/atmosphere effects.
- **hatch_line**: Thin elongated rectangle with tapered ends. For crosshatching.
- **thorn**: Sharp triangle with gradient falloff.
- **bud**: Teardrop shape.

### Grain Texture

A separate 256×256 noise texture (Perlin or white noise) sampled in the fragment shader and multiplied into stamp opacity. This gives the "paper grain" effect that makes p5.brush look like real media.

---

## 4. Audio-Reactive Parameter Bus

```js
class AudioBus {
  constructor() {
    this.amplitude = 0;    // 0-1, raw RMS from analyser
    this.energy = 0;       // 0-1, smoothed energy metric
    this.smoothing = 0.12; // EMA coefficient
  }

  update(analyser, timeData) {
    // Extract RMS from Web Audio analyser
    analyser.getByteTimeDomainData(timeData);
    let rms = 0;
    for (let i = 0; i < timeData.length; i++) {
      const v = (timeData[i] - 128) / 128;
      rms += v * v;
    }
    this.amplitude = Math.sqrt(rms / timeData.length);
    this.energy += (Math.min(1, this.amplitude * 3) - this.energy) * this.smoothing;
  }
}
```

The bus is a plain object — stamp generators read `fb.audio.energy` to modulate:
- **Stamp scale**: `baseSize * (1 + energy * 0.5)`
- **Spawn rate**: more stamps per frame when energy is high
- **Color saturation**: shift hue toward vivid when energy peaks
- **Opacity**: atmospheric elements (ghunnah) pulse with amplitude

---

## 5. Performance Targets

| Metric | Target | Strategy |
|--------|--------|----------|
| Stamps rendered | 2000+ at 60fps | Instanced rendering, one draw call per layer |
| Draw calls | ≤ 5 per frame | One per layer + final composite |
| CPU per frame | < 4ms | Typed array buffer updates, no GC pressure |
| GPU memory | < 20MB | 4096 stamps × 52 bytes = 208KB instance data + textures |
| Texture atlas | 1 bind | Single atlas for all tips |
| Init time | < 200ms | Procedural texture gen is fast |

### Instance Data Layout (per stamp, 52 bytes)

```
Float32: x, y           (8 bytes)  — position
Float32: rotation        (4 bytes)  — angle
Float32: scaleX, scaleY  (8 bytes)  — size
Float32: r, g, b, a      (16 bytes) — color + opacity
Float32: texU, texV       (8 bytes)  — atlas UV offset
Float32: age, lifetime    (8 bytes)  — for fade calculations
```

Total: 13 floats × 4 bytes = 52 bytes per stamp.
4096 stamps = 208KB — fits in any GPU buffer.

---

## 6. Module Breakdown

### `fatiha-brush.js` — Single-file library (Phase 1)

```
FatihaBrush (main class)
├── constructor(canvas, options)
├── _initGL()              — WebGL2 context, extensions, buffers
├── _initShaders()         — compile vertex + fragment shaders
├── _initGeometry()        — unit quad VAO
├── _initTextures()        — build atlas + grain texture
│
├── Stamp Management
│   ├── addStamp(opts)     — push to ring buffer
│   ├── addStamps(arr)     — batch add
│   ├── update(dt)         — age stamps, handle fades, recycle dead
│   └── _uploadInstances() — sync Float32Array → GPU buffer
│
├── Texture Atlas
│   ├── registerTip(name, drawFn)
│   ├── _buildAtlas()      — render all tips to atlas canvas
│   └── _getUV(name)       — return atlas coordinates
│
├── Layer System
│   ├── _initLayers()      — create framebuffers
│   ├── setLayerOpacity(name, val)
│   ├── setLayerBlend(name, mode)
│   ├── clearLayer(name)
│   └── _composeLayers()   — render FBOs to screen
│
├── Rendering
│   ├── render()           — main render pass
│   ├── _renderLayer(layer)— instanced draw for one layer
│   └── _renderComposite() — final screen output
│
├── Audio Bus
│   └── audio { amplitude, energy, update() }
│
└── Utility
    ├── stampCount
    ├── resize(w, h)
    └── dispose()
```

### Future Modules (Phase 2+)

- `fatiha-brush-effects.js` — Bloom, glow, blur post-processing
- `fatiha-brush-paths.js` — Spline/bezier stroke generation (vine drawing helpers)
- `fatiha-brush-garden.js` — Ottoman element presets (leaf, rose, bud, etc.)

---

## 7. Phase 1 Deliverables

### Minimum Viable: Vine + Flowers + Leaves along Golden Spiral

**fatiha-brush.js** must support:

1. **WebGL2 instanced quad renderer** — single draw call per layer
2. **Stamp class** with all attributes (position, rotation, scale, color, opacity, age, texture)
3. **Procedural brush tips**: soft_round, pointed_leaf, petal, spray, hatch_line, thorn, bud
4. **Grain texture** overlay for natural-media feel
5. **addStamp() / addStamps() / update() / render()** API
6. **Layer system** — at minimum: garden (main elements) + glow (atmospheric) + petals (falling)
7. **Time-based fade** — stamps decay over their lifetime with configurable fade-in/fade-out
8. **Color from hex** — utility to parse hex colors to float RGBA

**fatiha-brush-demo.html** must:

1. Load fatiha-brush.js (no other dependencies)
2. Compute golden spiral geometry (reuse existing `buildSpiralPoints()`)
3. Draw vine along spiral using overlapping soft_round stamps (multi-layer like p5.brush version)
4. Play bismillah.mp3 and dispatch tajweed events
5. Spawn garden elements (leaf, bud, rose, bloom, ghunnah, thorn, tendril) as stamp clusters
6. Falling petals with physics
7. Audio-reactive scaling via parameter bus
8. Support `window._synthTime` for headless capture
9. Visual quality approaching p5.brush aesthetic (soft edges, grain, layered color)

### What Phase 1 Does NOT Include

- Post-processing effects (bloom, blur) — Phase 2
- Spline path helpers — vine is built from raw stamps
- Autoresearch parameter optimization — Phase 3
- 3D or depth effects — Phase 2
- Custom blend modes beyond alpha/additive — Phase 2
