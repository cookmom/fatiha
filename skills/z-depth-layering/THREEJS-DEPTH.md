# Three.js Depth, Render Order & Z-Fighting — Skill Reference

## Quick-Reference Cheat Sheet

| Problem | Fix | Code |
|---|---|---|
| Z-fighting (coplanar faces) | Polygon offset | `material.polygonOffset = true; material.polygonOffsetFactor = -1; material.polygonOffsetUnits = -1;` |
| Z-fighting (slight) | Nudge z position | `mesh.position.z += 0.01;` |
| Z-fighting (large scale range) | Logarithmic depth buffer | `new THREE.WebGLRenderer({ logarithmicDepthBuffer: true })` |
| Decal on surface | depthWrite: false + renderOrder | `material.depthWrite = false; mesh.renderOrder = 1;` |
| Force render on top | renderOrder + depthTest off | `mesh.renderOrder = 999; material.depthTest = false;` |
| Transparent canvas | alpha + clear color | `renderer = new THREE.WebGLRenderer({ alpha: true }); renderer.setClearColor(0x000000, 0); scene.background = null;` |
| Transparent objects wrong order | Set `transparent: true` + trust auto-sort | Three.js sorts transparent objects back-to-front by centroid |
| CSS behind Three.js | Canvas `position: absolute` + transparent renderer | See §8 |
| Dial on background plane | polygonOffset OR z-nudge OR renderOrder+depthWrite:false | See §3 |

---

## 1. How the Depth Buffer Works

WebGL's depth buffer (z-buffer) is a per-pixel buffer storing the depth of the closest fragment rendered so far. Three.js exposes control via material properties:

### `depthTest` (default: `true`)
When true, the GPU compares this fragment's depth against the buffer. If it fails the test, the fragment is discarded.

### `depthWrite` (default: `true`)
When true, fragments that pass the depth test write their depth to the buffer. Set to `false` for overlays, decals, or transparent objects that shouldn't occlude things behind them.

### `depthFunc` (default: `THREE.LessEqualDepth`)
The comparison function. Options:
- `THREE.NeverDepth` — never passes
- `THREE.AlwaysDepth` — always passes
- `THREE.EqualDepth` — passes if equal
- `THREE.LessDepth` — passes if less than buffer
- `THREE.LessEqualDepth` — passes if ≤ buffer (default)
- `THREE.GreaterDepth` / `THREE.GreaterEqualDepth` — reverse
- `THREE.NotEqualDepth`

```js
const material = new THREE.MeshStandardMaterial({
  depthTest: true,      // compare against depth buffer
  depthWrite: true,     // write to depth buffer
  depthFunc: THREE.LessEqualDepth
});
```

### Depth Buffer Precision
- WebGL typically uses 24-bit depth buffer
- Depth values are **non-linear** — more precision near the near plane, less near the far plane
- Rule: keep `camera.near` as large as possible, `camera.far` as small as possible
- Ratio `far/near < 10000` is a good target; `far/near > 100000` will cause visible z-fighting

---

## 2. `renderOrder` Property

Every `Object3D` has a `renderOrder` property (default `0`). Objects are sorted by renderOrder first, then by the default sorting (distance-based for transparent, material/geometry grouping for opaque).

```js
backgroundPlane.renderOrder = 0;
dialMesh.renderOrder = 1;       // renders AFTER background
overlayMesh.renderOrder = 100;  // renders last
```

**Key behavior:**
- renderOrder is an integer; lower renders first
- It does NOT disable depth testing — objects still write/test depth unless you change material settings
- For a HUD/overlay: combine `renderOrder` with `depthTest: false` and `depthWrite: false`
- renderOrder is per-object, not per-material

```js
// HUD element that always renders on top
const hudMesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({
  depthTest: false,
  depthWrite: false,
  transparent: true
}));
hudMesh.renderOrder = 999;
```

---

## 3. Z-Fighting: Causes and Fixes

### Causes
1. **Coplanar geometry** — two faces at the exact same z position (e.g., a dial face on a background plane)
2. **Depth buffer precision limits** — at far distances, the non-linear depth buffer can't distinguish close surfaces
3. **Large near/far ratio** — spreads precision too thin

### Fix 1: Polygon Offset (Best for decals/coplanar)
Biases the depth value of a material during the depth test. Negative values push toward camera.

```js
const dialMaterial = new THREE.MeshStandardMaterial({
  polygonOffset: true,
  polygonOffsetFactor: -1,  // negative = closer to camera
  polygonOffsetUnits: -1
});
```

- `polygonOffsetFactor` — scales by the polygon's slope (angle relative to camera)
- `polygonOffsetUnits` — constant offset in depth buffer units
- Values of `-1, -1` are typical for "render in front"; use `1, 1` for "render behind"

### Fix 2: Slight Z Separation
Physically offset the mesh by a tiny amount:

```js
dialMesh.position.z = backgroundPlane.position.z + 0.01;
```

Simple, reliable, but requires manual management.

### Fix 3: Logarithmic Depth Buffer
Replaces the default non-linear depth buffer with a logarithmic one, giving more uniform precision across the entire range.

```js
const renderer = new THREE.WebGLRenderer({ logarithmicDepthBuffer: true });
```

**Trade-offs:**
- Fixes z-fighting at extreme distances
- Slightly more expensive (fragment shader does extra math)
- Some post-processing effects may not work correctly
- Disables `gl_FragDepth` optimizations on some hardware
- Can break `THREE.Points` and some custom shaders

### Fix 4: depthWrite: false + renderOrder
When you know the layering order and don't need mutual occlusion:

```js
// Background doesn't need to write depth (nothing behind it matters)
backgroundMaterial.depthWrite = true;  // writes depth
backgroundMesh.renderOrder = 0;

// Dial renders after, reads depth but doesn't fight because it's declared later
dialMaterial.depthWrite = false;
dialMesh.renderOrder = 1;
```

### Our Specific Case: Dial on Background Plane
**Recommended approach** (combine for robustness):
```js
// Option A: Polygon offset on the dial
dialMaterial.polygonOffset = true;
dialMaterial.polygonOffsetFactor = -1;
dialMaterial.polygonOffsetUnits = -1;

// Option B: Z-nudge (simpler)
dialMesh.position.z += 0.01;

// Option C: renderOrder + depthWrite control
backgroundMesh.renderOrder = 0;
dialMesh.renderOrder = 1;
dialMaterial.depthWrite = false;
```

---

## 4. Transparency Sorting

Three.js splits rendering into two passes:

1. **Opaque objects** — sorted front-to-back (for early-z rejection efficiency), grouped by material/geometry for batching
2. **Transparent objects** — sorted back-to-front by object centroid distance to camera

### How sorting works:
- An object is "transparent" if `material.transparent === true`
- Sorting is by **object centroid**, not per-triangle — large overlapping transparent objects will have artifacts
- Within the same distance, `renderOrder` breaks ties

### Common issues:
- **Transparent object behind opaque one**: works fine (depth test handles it)
- **Two overlapping transparent objects**: sorted by centroid — if centroids are at the same distance, order is undefined → flickering
- **Large transparent object partially in front/behind another**: per-object sorting fails → use `renderOrder` to force order

```js
// Force specific transparent rendering order
backTransparent.renderOrder = 0;
frontTransparent.renderOrder = 1;
```

### `alphaTest` as an alternative to transparency
For textures with hard edges (cutout leaves, fences), use `alphaTest` instead of `transparent`:

```js
const material = new THREE.MeshStandardMaterial({
  map: texture,
  alphaTest: 0.5,    // discard fragments with alpha < 0.5
  transparent: false  // treated as opaque! No sorting issues
});
```

---

## 5. THREE.Layers for Separating Render Groups

Layers let you selectively render subsets of objects per camera. Each object and camera has a `.layers` bitmask (32 layers, 0–31).

```js
// Setup
const LAYER_BG = 0;
const LAYER_FG = 1;
const LAYER_UI = 2;

backgroundMesh.layers.set(LAYER_BG);
dialMesh.layers.set(LAYER_FG);
hudMesh.layers.set(LAYER_UI);

// Render background only
camera.layers.set(LAYER_BG);
renderer.render(scene, camera);

// Then foreground (without clearing)
camera.layers.set(LAYER_FG);
renderer.autoClear = false;
renderer.render(scene, camera);

// Then UI
camera.layers.set(LAYER_UI);
renderer.render(scene, camera);

renderer.autoClear = true;
```

**Use cases:**
- Separate depth passes for background vs foreground
- Render UI without depth interference
- Selective post-processing per layer

---

## 6. Render-to-Texture / Multi-Pass Compositing

### EffectComposer
```js
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
// Add post-processing passes...
composer.render();
```

### Separate Scenes Approach
Render multiple scenes to textures, composite them:

```js
const bgScene = new THREE.Scene();
const fgScene = new THREE.Scene();

const bgTarget = new THREE.WebGLRenderTarget(width, height);
const fgTarget = new THREE.WebGLRenderTarget(width, height, {
  format: THREE.RGBAFormat  // preserve alpha for compositing
});

// Render background to texture
renderer.setRenderTarget(bgTarget);
renderer.render(bgScene, camera);

// Render foreground to texture
renderer.setRenderTarget(fgTarget);
renderer.render(fgScene, camera);

// Composite (use a ShaderPass or render fullscreen quads)
renderer.setRenderTarget(null);
// ... composite bgTarget.texture and fgTarget.texture
```

This completely eliminates z-fighting between layers since they have independent depth buffers.

---

## 7. Making Three.js Canvas Transparent

All three of these are required:

```js
// 1. Enable alpha on the WebGL context
const renderer = new THREE.WebGLRenderer({ alpha: true });

// 2. Set clear color with alpha = 0
renderer.setClearColor(0x000000, 0);

// 3. Remove scene background
scene.background = null;  // NOT new THREE.Color(...) — that's opaque
```

### Common mistakes:
- ❌ Setting `alpha: true` but leaving `scene.background` set → opaque
- ❌ `renderer.setClearColor(0x000000)` without the second arg → alpha defaults to 1 (opaque)
- ❌ Forgetting `alpha: true` → WebGL context has no alpha channel at all
- ❌ Using `premultipliedAlpha: false` without adjusting blending → dark fringes

### `premultipliedAlpha`
Default is `true`. This means the RGB values in the canvas are pre-multiplied by alpha. CSS compositing expects this. If you set it to `false`, you may get dark edges around semi-transparent areas.

```js
// Usually just leave the default:
const renderer = new THREE.WebGLRenderer({
  alpha: true,
  premultipliedAlpha: true  // default, CSS expects this
});
```

---

## 8. Mixing CSS Layers with Three.js

### Architecture

```
┌─────────────────────────────┐
│  CSS Background Layer       │  z-index: 0 (or position in DOM)
│  (gradients, images, etc.)  │
├─────────────────────────────┤
│  Three.js Canvas            │  position: absolute; z-index: 1
│  (transparent background)   │  pointer-events: none (if needed)
├─────────────────────────────┤
│  CSS Foreground / UI        │  z-index: 2
│  (HTML overlays, text)      │
└─────────────────────────────┘
```

```html
<div class="scene-container" style="position: relative;">
  <!-- CSS background -->
  <div class="bg-layer" style="position: absolute; inset: 0; z-index: 0;
    background: radial-gradient(circle, #1a1a2e, #0a0a0a);">
  </div>

  <!-- Three.js canvas (transparent) -->
  <canvas id="three-canvas" style="position: absolute; inset: 0; z-index: 1;"></canvas>

  <!-- HTML overlay -->
  <div class="ui-overlay" style="position: absolute; inset: 0; z-index: 2;
    pointer-events: none;">
    <h1 style="pointer-events: auto;">Title</h1>
  </div>
</div>
```

```js
const canvas = document.getElementById('three-canvas');
const renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
renderer.setClearColor(0x000000, 0);
scene.background = null;
```

### Tips:
- Use `pointer-events: none` on the canvas if CSS elements above need interaction
- Use `pointer-events: none` on overlay containers, `auto` on interactive children
- The canvas must have `position: absolute` or `fixed` to stack properly
- Resize handling: match canvas size to container with `ResizeObserver`

---

## 9. Material Properties Affecting Depth

| Property | Default | Effect |
|---|---|---|
| `transparent` | `false` | If true, object enters transparent sort pass (back-to-front) |
| `opacity` | `1` | Visual only — doesn't affect depth unless `transparent: true` |
| `alphaTest` | `0` | Fragments with alpha below this are discarded entirely (no depth write) |
| `depthTest` | `true` | Whether to compare against depth buffer |
| `depthWrite` | `true` | Whether to write to depth buffer |
| `depthFunc` | `LessEqualDepth` | Comparison function |
| `side` | `FrontSide` | `FrontSide`, `BackSide`, `DoubleSide` — affects which faces are rendered/depth-tested |
| `polygonOffset` | `false` | Enable polygon offset |
| `polygonOffsetFactor` | `0` | Slope-dependent offset |
| `polygonOffsetUnits` | `0` | Constant offset |
| `colorWrite` | `true` | If false, writes depth but not color (shadow/depth-only pass) |
| `stencilWrite` | `false` | For stencil buffer operations |

### `side` and depth:
- `FrontSide` — only front faces rendered and depth-tested
- `BackSide` — only back faces
- `DoubleSide` — both faces rendered; can cause self-z-fighting on thin geometry

### `colorWrite: false` trick:
Render an object to the depth buffer only (invisible blocker):
```js
const blockerMaterial = new THREE.MeshBasicMaterial({
  colorWrite: false,
  depthWrite: true
});
```

---

## Common Bug Patterns

### Bug: "My transparent object is invisible"
**Cause:** `transparent: true` with `opacity: 1` but object is behind something that wrote to depth buffer.
**Fix:** Check `depthWrite` on objects in front. Or set `renderOrder`.

### Bug: "Z-fighting flicker on coplanar surfaces"
**Cause:** Two meshes at identical z with both writing depth.
**Fix:** polygonOffset, z-nudge, or depthWrite:false on the front one.

### Bug: "Canvas background is black, not transparent"
**Cause:** Missing one of: `alpha: true`, `setClearColor(..., 0)`, `scene.background = null`.
**Fix:** Set all three. Check `scene.background` isn't a Color or texture.

### Bug: "Transparent objects render in wrong order / flicker"
**Cause:** Object centroids at similar distances → unstable sort.
**Fix:** Set explicit `renderOrder` on each transparent object.

### Bug: "Object renders on top of everything"
**Cause:** `depthTest: false` without realizing it.
**Fix:** Check material. `depthTest: false` means it ignores the depth buffer entirely.

### Bug: "Dark fringe around semi-transparent edges over CSS"
**Cause:** `premultipliedAlpha: false` or incorrect blending.
**Fix:** Leave `premultipliedAlpha: true` (default). If using custom shaders, ensure premultiplied output.

### Bug: "logarithmicDepthBuffer breaks my custom shader"
**Cause:** Log depth requires specific fragment shader code.
**Fix:** Include `#include <logdepthbuf_pars_fragment>` and `#include <logdepthbuf_fragment>` in custom shaders.

---

## Decision Tree

```
Need to render A in front of B?
├── A and B at same z position?
│   ├── Yes → polygonOffset on A (factor=-1, units=-1)
│   │        OR nudge A's z by +0.001 to +0.01
│   └── No  → Just position them correctly
├── A is a UI overlay?
│   └── renderOrder=999, depthTest=false, depthWrite=false
├── A is transparent?
│   ├── renderOrder > B's renderOrder
│   └── depthWrite=false on A (usually)
├── Large scene with extreme distances?
│   └── logarithmicDepthBuffer: true
└── Need CSS visible behind Three.js?
    └── alpha:true + setClearColor(0,0) + scene.background=null
```
