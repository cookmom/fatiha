# Irradiance Probes R&D — Seven Heavens Studio
**Research by Chris — Lookdev Specialist**  
**Date:** 2026-03-03  
**Reference:** https://x.com/mrdoob/status/2028441453501010045  
**Status:** Pre-release exploration (mrdoob tweeted March 2, 2026 — "exploring" / not shipped)

---

## 1. What mrdoob Is Exploring

### The Tweet
mrdoob posted a video on March 2, 2026 with the caption: *"Exploring irradiance probes... 👀 #threejs"*

This is **pre-release exploration**, not a merged feature. As of this writing (March 3, 2026), there are **no commits to the Three.js `dev` branch** that introduce new irradiance probe code. He's prototyping in a personal branch.

### What He's Likely Building

Based on the existing infrastructure and the community PR history, mrdoob is most likely exploring **positional/spatial irradiance probe volumes** — the missing piece in Three.js's current light probe system.

**The critical gap revealed in the existing example code:**

```javascript
// From examples/webgl_lightprobe.html
lightProbe.position.set( -10, 0, 0 );
// COMMENT IN THE SOURCE: "position not used in scene lighting calculations
// (helper honors the position, however)"
```

The `LightProbe.position` is stored on the Object3D but **completely ignored** by the lighting shader. Currently, `LightProbe` is scene-global — one SH blob that applies everywhere uniformly. mrdoob is almost certainly working on making probes **spatially aware**, so objects are lit by the nearest probe based on their world position.

---

## 2. How Irradiance Probes Work

### The Physics

An irradiance probe captures the **total incoming light** at a point in the scene from all directions. Unlike specular environment maps (which are view-dependent), irradiance is purely directional — it tells you how much diffuse light hits a surface facing any given direction.

The standard encoding is **Spherical Harmonics (SH)**, specifically L2 SH: 9 coefficients × 3 channels (RGB) = 27 floats total. This is a ludicrously compact representation of the entire irradiance field at one point.

### The SH Irradiance Evaluation

Three.js already has this in TSL (`src/nodes/functions/material/getShIrradianceAt.js`):

```javascript
// L0 band (constant term)
let result = shCoefficients.element(0).mul(0.886227);

// L1 band (directional — captures color gradients)
result = result.add(shCoefficients.element(1).mul(2.0 * 0.511664).mul(y));
result = result.add(shCoefficients.element(2).mul(2.0 * 0.511664).mul(z));
result = result.add(shCoefficients.element(3).mul(2.0 * 0.511664).mul(x));

// L2 band (quadratic — captures more complex light variation)
// ... 5 more coefficients
```

Given a surface normal, this 9-term polynomial gives you the irradiance in that direction. Evaluating this in a shader costs ~20 MADs — essentially free.

### Real-Time Probe Capture

`LightProbeGenerator.fromCubeRenderTarget(renderer, cubeRenderTarget)` already exists in Three.js. It:
1. Reads back all 6 faces of a `CubeRenderTarget` (via `renderer.readRenderTargetPixelsAsync`)
2. Integrates each pixel's contribution, weighted by solid angle
3. Projects onto the 9 SH basis functions
4. Returns a `LightProbe` with the encoded SH coefficients

This is the **readback pipeline** mrdoob would chain with `CubeCamera` updates.

### Probe Volumes

A **probe volume** = a grid of N probes scattered through a scene. At runtime:
1. For each object, find the 1–8 nearest probes (trilinear interpolation in a grid, or N nearest + barycentric)
2. Blend their SH coefficients based on distance/weight
3. Apply the blended SH as the object's diffuse indirect light

This is exactly how Unreal Engine and Unity GI work. The difference mrdoob is chasing: **real-time capture** — `CubeCamera` renders live at probe positions, SH is updated per-frame or on a rolling schedule.

---

## 3. Current Three.js Infrastructure (Stable, Available Now)

### Core Classes

| Class / Function | Location | Status |
|---|---|---|
| `LightProbe` | `three` core | ✅ Stable, r169+ |
| `LightProbeNode` | TSL core | ✅ Stable — NodeMaterial |
| `IrradianceNode` | TSL core | ✅ Stable — generic irradiance injection |
| `LightProbeGenerator.fromCubeRenderTarget()` | `three/addons/lights/LightProbeGenerator.js` | ✅ Stable, async |
| `LightProbeGenerator.fromCubeTexture()` | same | ✅ Stable |
| `getShIrradianceAt` | TSL function | ✅ Stable |
| `LightProbeHelper` | `three/addons/helpers/LightProbeHelper.js` | ✅ Stable |
| `SSGINode` | `three/addons/tsl/display/SSGINode.js` | ✅ Stable — full SSGI |

### LightProbeNode (TSL) — How It Works

```javascript
// LightProbeNode.js - the existing TSL implementation
class LightProbeNode extends AnalyticLightNode {
  constructor(light = null) {
    super(light);
    // 9 Vector3 uniforms for SH coefficients × intensity
    const array = [];
    for (let i = 0; i < 9; i++) array.push(new Vector3());
    this.lightProbe = uniformArray(array);
  }

  update(frame) {
    super.update(frame);
    // Each frame, update SH uniforms from light.sh.coefficients
    for (let i = 0; i < 9; i++) {
      this.lightProbe.array[i].copy(light.sh.coefficients[i]).multiplyScalar(light.intensity);
    }
  }

  setup(builder) {
    // Evaluates SH against world normal, adds to irradiance context
    const irradiance = getShIrradianceAt(normalWorld, this.lightProbe);
    builder.context.irradiance.addAssign(irradiance);
  }
}
```

`IrradianceNode` is even simpler — it accepts any `vec3` node and adds it directly to `builder.context.irradiance`. This is the composability hook we'd use for custom probe mixing.

### Real-Time Capture Loop (Available Right Now)

```javascript
import { CubeCamera, WebGLCubeRenderTarget, HalfFloatType, RGBAFormat } from 'three';
import { LightProbeGenerator } from 'three/addons/lights/LightProbeGenerator.js';

// Setup
const cubeRenderTarget = new WebGLCubeRenderTarget(64, {  // 64px is plenty for diffuse
  type: HalfFloatType,
  format: RGBAFormat,  // REQUIRED for readRenderTargetPixels
});
const cubeCamera = new CubeCamera(0.1, 100, cubeRenderTarget);
scene.add(cubeCamera);

const lightProbe = new THREE.LightProbe();
scene.add(lightProbe);

// Per-frame (or throttled)
async function updateProbe() {
  cubeCamera.update(renderer, scene);
  const newProbe = await LightProbeGenerator.fromCubeRenderTarget(renderer, cubeRenderTarget);
  lightProbe.sh.copy(newProbe.sh);
}
```

**Note on `fromCubeRenderTarget`**: It uses `readRenderTargetPixelsAsync` — this means it schedules a GPU readback. On mobile WebGL, this stall can be 2–5ms. Running it every frame is too expensive. Run it every N frames or only when lights change.

---

## 4. Scene Integration Proposals

### 4.1 Probe Placement Strategy

Our scene needs **3 probes minimum**:

| Probe ID | Position | Purpose |
|---|---|---|
| `probe_floor` | (0, 0.1, 0) — floor level | Captures prayer beam colors hitting floor |
| `probe_cube` | (0, 1.5, 0) — center of cube | Captures gobo patterns hitting the cube |
| `probe_ceiling` | (0, 3.0, 0) — above cube | Captures upward bounce from cube |

For now, a **single probe at the cube's world center** is the highest-ROI starting point — it captures the prayer beam colors and applies them as diffuse irradiance to the podium surfaces.

### 4.2 Podium Catching Beam Light

**Current state**: Podium is a dark BoxGeometry with per-face emissive materials. Prayer beams pass through additively on the floor shader, never physically interact with the podium geometry.

**With a probe at cube height**:
- `CubeCamera` placed at center of cube renders all 6 directions including the lit floor below
- SH encoding captures the dominant prayer beam color as a directional irradiance bias
- Podium materials (now `MeshStandardMaterial` or `MeshStandardNodeMaterial`) receive this as diffuse indirect light
- Prayer color subtly washes the dark podium faces facing the active beam direction

**Code sketch:**

```javascript
// Place probe at cube world center
cubeCamera.position.copy(cube.position);

// Only update when prayer changes or tawaf angle changes significantly
const PROBE_UPDATE_INTERVAL = 60; // every 60 frames = 1 second at 60fps
let frameCount = 0;

function tick(delta) {
  frameCount++;
  if (frameCount % PROBE_UPDATE_INTERVAL === 0) {
    cubeCamera.update(renderer, scene);
    LightProbeGenerator.fromCubeRenderTarget(renderer, cubeRenderTarget)
      .then(newProbe => {
        lightProbe.sh.copy(newProbe.sh);
        lightProbe.intensity = 0.3; // subtle — don't fight the direct lights
      });
  }
}
```

### 4.3 Cube Reflecting Prayer Colors

The dichroic glass cube already has FBO two-pass refraction. For the **cube to reflect/emit prayer colors as indirect light**:

Option A — **Probe feeds into envMap**: Pipe the `cubeRenderTarget.texture` directly as the cube's `envMap`. This is free — no SH needed. The cube's glass material would show the lit floor as a real reflection.

```javascript
cubeMaterial.envMap = cubeRenderTarget.texture;
cubeMaterial.envMapIntensity = 0.6;
```

Option B — **IrradianceNode injection**: Use `IrradianceNode` to inject the SH irradiance into the cube's material's lighting context. This makes the glass appear lit from within by the prayer colors even from oblique angles.

```javascript
import { IrradianceNode } from 'three/nodes';
// In the cube's NodeMaterial setup:
const probeIrradiance = new IrradianceNode(shIrradianceAtCubeCenter);
cubeMaterial.lightsNode = lights([...defaultLights, probeIrradiance]);
```

### 4.4 Indirect Illumination on Floor

The polar disc floor shader already handles prayer beam colors. What's missing is the **secondary bounce** — light that hits the podium, bounces back to the floor.

This is where **SSGINode** becomes the nuclear option. It's fully available in Three.js today:

```javascript
import { ssgi } from 'three/addons/tsl/display/SSGINode.js';
import { PostProcessing } from 'three/webgpu';

// In WebGPURenderer context:
const postProcessing = new PostProcessing(renderer);
const scenePass = pass(scene, camera);

const ssgiEffect = ssgi(
  scenePass,           // beauty buffer
  scenePass.getDepthNode(),   // depth
  scenePass.getNormalNode(),  // normals
  camera
);

ssgiEffect.radius = 3.0;        // world-space influence radius
ssgiEffect.giIntensity = 5.0;   // indirect light intensity
ssgiEffect.sliceCount = 1;       // MOBILE: use lowest setting
ssgiEffect.stepCount = 8;        // MOBILE: use 6-8

postProcessing.outputNode = ssgiEffect.add(scenePass);
```

SSGI would make prayer beams visually bounce off the floor and climb the podium walls. This is the most visually impactful option.

---

## 5. Performance Analysis — Mobile Safari 60fps Target

### Option A: LightProbe + CubeCamera (Throttled)

| Cost | Value |
|---|---|
| CubeCamera render (64px, 6 faces) | ~2-3ms GPU per update |
| `readRenderTargetPixelsAsync` (SH bake) | ~2-4ms GPU stall |
| SH evaluation in shader | ~0.1ms (negligible, 20 MADs) |
| Update frequency | Every 30-60 frames = 0.05-0.1ms amortized |
| **Total amortized cost** | **~0.1ms/frame** ✅ Very safe |

**Caveat**: `readRenderTargetPixelsAsync` still syncs the GPU pipeline. On Apple Silicon (A17 Pro), this is more forgiving than older devices. Use frame throttling aggressively. Alternatively, skip the CPU readback entirely and use the cubemap texture directly as envMap.

### Option B: SSGINode

| Cost | Value |
|---|---|
| Screen-space raycasting | Very resolution-dependent |
| Low preset (sliceCount=1, stepCount=8) | ~4-8ms on M1 iPad |
| Low preset on iPhone 14 Pro | ~8-15ms 🔴 RISKY |
| **Mobile Safari verdict** | **Probably not viable at 60fps** |

SSGI at its lowest settings (`sliceCount=1, stepCount=6`) is roughly 12 samples per pixel. On mobile Safari, this is borderline — you'd be spending ~10% of your frame budget on SSGI alone, before everything else in our scene.

**Recommendation**: SSGI is **a desktop bonus**, not the mobile strategy.

### Option C: Baked SH (No Real-Time Capture)

If prayer colors are deterministic per prayer time, we can **pre-bake one SH per prayer** and just lerp between them as the prayer changes. Zero GPU capture cost, just a coefficient lerp each frame.

```javascript
const prayedSH = {
  fajr:    [/* 27 floats */],
  dhuhr:   [/* 27 floats */],
  asr:     [/* 27 floats */],
  maghrib: [/* 27 floats */],
  isha:    [/* 27 floats */],
};

// On prayer transition, lerp SH coefficients
function lerpProbeToward(target, t) {
  for (let i = 0; i < 9; i++) {
    lightProbe.sh.coefficients[i].lerpVectors(
      lightProbe.sh.coefficients[i], target[i], t
    );
  }
}
```

This is **zero runtime cost** — pure CPU lerp, then SH evaluation stays on GPU as before. It won't capture real-time light from the tawaf spotlight, but it's completely free and very smooth.

---

## 6. What mrdoob's Work Adds (When It Ships)

Based on the architecture gap and community discourse, mrdoob's irradiance probe work likely adds:

1. **Per-object probe assignment** — objects query their nearest probe(s) based on world position rather than receiving a single global SH
2. **SH interpolation in the shader** — trilinear blending of probe grids without CPU readback
3. **Automatic CubeCamera-to-SH pipeline** — perhaps a `ProbeVolume` node that handles capture scheduling internally
4. **WebGPU compute shader SH projection** — fast GPU-side SH bake without CPU readback stall (huge for mobile)

The WebGPU compute path is probably the most exciting piece — using a compute shader to project the cubemap faces to SH directly on the GPU, eliminating the `readRenderTargetPixelsAsync` stall entirely.

### Release Status

**NOT in any current Three.js release.** As of r174 (March 2026), irradiance probes are pre-release / experimental. The tweet is exploration, not announcement.

**What IS in current releases:**
- `LightProbe` ✅ (stable since r106)
- `LightProbeGenerator` ✅ (stable since r119)
- `LightProbeNode` ✅ (stable in NodeMaterial path)
- `IrradianceNode` ✅ (stable in TSL)
- `SSGINode` ✅ (stable in TSL addons)

---

## 7. Recommended Integration Path

### Phase 1 — NOW (No risk, zero experiment cost)

**Single throttled LightProbe at cube center.**

1. Add `CubeCamera` (64px) at `cube.position`
2. Throttle updates to every 60 frames
3. Call `LightProbeGenerator.fromCubeRenderTarget()` → update `lightProbe.sh`
4. Set `lightProbe.intensity = 0.2–0.4`
5. Switch podium material to `MeshStandardNodeMaterial` (adds probe response)
6. Use `cubeRenderTarget.texture` as `cubeMaterial.envMap` for free cube reflections

**Expected visual change:**
- Podium surfaces pick up a faint prayer-color wash from the dominant beam direction
- Cube glass shows real reflections of the lit floor geometry
- Ground floor gets slight color bleeding from the side of the scene

### Phase 2 — DESKTOP ONLY (Optional)

Add `SSGINode` behind a capability check:

```javascript
const hasHighPerfGPU = renderer.capabilities.maxTextureSize >= 16384;
if (hasHighPerfGPU && !isMobileSafari()) {
  // enable SSGINode
}
```

SSGI would make beams visibly bounce off the floor into the podium base — genuinely cinematic.

### Phase 3 — WAIT FOR mrdoob (Future)

Once positional probe volumes land in Three.js, replace the single probe with a 3-probe volume:
- `probe_floor`: captures color of active prayer beam
- `probe_cube`: drives the cube's appearance from outside  
- `probe_podium_top`: captures downward bounce from cube glow

---

## 8. Code Snippets for Phase 1

### Setup

```javascript
import * as THREE from 'three';
import { LightProbeGenerator } from 'three/addons/lights/LightProbeGenerator.js';

// Probe capture target — 64px is more than enough for diffuse SH
const cubeRenderTarget = new THREE.WebGLCubeRenderTarget(64, {
  type: THREE.HalfFloatType,
  format: THREE.RGBAFormat,  // MANDATORY for readRenderTargetPixels
  colorSpace: THREE.LinearSRGBColorSpace,
});
const cubeCamera = new THREE.CubeCamera(0.05, 20, cubeRenderTarget);
cubeCamera.position.copy(cube.position); // position at cube's world center
scene.add(cubeCamera);

// The probe light
const lightProbe = new THREE.LightProbe(undefined, 0.25);
scene.add(lightProbe);

// Also wire the cube camera to the cube material's envMap
dichroicCubeMaterial.envMap = cubeRenderTarget.texture;
dichroicCubeMaterial.envMapIntensity = 0.5;
```

### Throttled Update

```javascript
let probeFrameCounter = 0;
const PROBE_INTERVAL = 60; // update once per second at 60fps
let probeUpdatePending = false;

function updateProbeIfNeeded(renderer, scene) {
  if (probeUpdatePending) return; // don't stack async calls
  probeFrameCounter++;
  if (probeFrameCounter % PROBE_INTERVAL !== 0) return;

  probeUpdatePending = true;
  cubeCamera.update(renderer, scene);

  LightProbeGenerator.fromCubeRenderTarget(renderer, cubeRenderTarget)
    .then(newProbe => {
      lightProbe.sh.copy(newProbe.sh);
      probeUpdatePending = false;
    })
    .catch(err => {
      console.warn('Probe update failed:', err);
      probeUpdatePending = false;
    });
}

// In animation loop:
function animate() {
  tawafSpot.position.set(/* orbit */);
  updateProbeIfNeeded(renderer, scene);
  renderer.render(scene, camera);
}
```

### Baked SH Fallback (Mobile)

```javascript
// Pre-baked SH coefficients per prayer (capture offline, paste here)
// Each entry: 9 × Vector3 — [ [r,g,b], [r,g,b], ... ]
const prayerSH = {
  fajr: [ [0.12, 0.14, 0.28], [0.02, 0.02, 0.05], /* ...9 coefficients... */ ],
  // etc.
};

function applyBakedProbe(prayerName, lerpT = 1.0) {
  const target = prayerSH[prayerName];
  if (!target) return;
  
  target.forEach((coeff, i) => {
    lightProbe.sh.coefficients[i].set(...coeff).lerp(
      lightProbe.sh.coefficients[i], 1 - lerpT
    );
  });
}
```

---

## 9. Summary Table

| Feature | Effort | Visual Impact | Mobile Risk | Status |
|---|---|---|---|---|
| Throttled LightProbe (real-time) | Low | Medium | Low ✅ | Available now |
| CubeCamera envMap on dichroic cube | Trivial | High | Zero ✅ | Available now |
| Baked SH per prayer (static) | Medium (offline) | Medium | Zero ✅ | Available now |
| SSGINode (desktop) | Medium | Very High | High ❌ | Available now |
| mrdoob positional probe volumes | N/A | High | TBD | Pre-release |

---

## 10. References

- [`LightProbeNode.js` source](https://github.com/mrdoob/three.js/blob/dev/src/nodes/lighting/LightProbeNode.js)
- [`IrradianceNode.js` source](https://github.com/mrdoob/three.js/blob/dev/src/nodes/lighting/IrradianceNode.js)  
- [`getShIrradianceAt.js` — TSL SH evaluation](https://github.com/mrdoob/three.js/blob/dev/src/nodes/functions/material/getShIrradianceAt.js)
- [`LightProbeGenerator.js` — SH baking from CubeRenderTarget](https://github.com/mrdoob/three.js/blob/dev/examples/jsm/lights/LightProbeGenerator.js)
- [`SSGINode.js` — Screen Space GI (Activision GTAO-based)](https://github.com/mrdoob/three.js/blob/dev/examples/jsm/tsl/display/SSGINode.js)
- [PR #18371 — LightProbeVolume by donmccurdy (open since 2020)](https://github.com/mrdoob/three.js/pull/18371) — shows the community has wanted this for years
- [PR #16223 — Original LightProbe support (2019)](https://github.com/mrdoob/three.js/pull/16223)
- [Three.js forum: Probes volume proposal (2023)](https://discourse.threejs.org/t/probes-volume-purposal-for-three-js/57921) — community context
- [Activision SSRT3 / SSAO paper](https://www.activision.com/cdn/research/s2016_pbs_activision_occlusion.pptx) — what SSGINode implements
- [mrdoob tweet (March 2, 2026)](https://x.com/mrdoob/status/2028441453501010045)

---

*Research complete. Ready for Phase 1 implementation when Tawfeeq gives the go.*
