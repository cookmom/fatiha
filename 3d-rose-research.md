# 3D Rose Research — Organic Geometry & Ottoman Aesthetics

## Problem with v1 (threejs-3d.html)

The current `createPetalGeometry()` is a flat parametric sheet with:
- Simple `sin(v * PI)` envelope for width — too symmetric, too smooth
- Linear height (`v * height`) — no curvature along the spine
- Curl is just a negative Z offset — petals don't actually **bend** in 3D
- No variation between petal layers beyond scale
- Result: looks like colored paper cutouts arranged in rings, not organic petals

---

## 1. Petal Geometry Techniques

### What professionals actually do (Blender/Maya workflow)

Real 3D roses are NOT built from flat shapes. Key techniques:

1. **Bezier surface patches** — define a petal as a bicubic Bezier patch with ~16 control points. The control cage gives you:
   - Curvature along the spine (midrib vein)
   - Roll/cup across the width
   - Tip curl that's independent of edge curl
   - Asymmetric edges (one side slightly longer)

2. **Subdivision from quads** — start with a 4-8 vertex quad, subdivide 2-3 times, position control points. The subdivision rounds everything naturally. All-quad topology avoids pinching artifacts.

3. **LatheGeometry + deformation** — define a 2D petal profile curve, revolve partially (not full 360), then warp/bend the result. Three.js examples at ibiblio.org use this for cartoon flowers with morph targets.

4. **Spine + cross-section sweep** — define a curved spine (CatmullRom), sweep an evolving cross-section along it. The cross-section changes from narrow at base to wide+cupped in middle to pointed at tip.

### What we should do in Three.js (no subdivision modifier available)

**Best approach: Parametric Bezier patch → BufferGeometry**

Build each petal from a **bicubic Bezier surface** evaluated on a UV grid:

```
For u in [0,1] (across width), v in [0,1] (base to tip):
  P(u,v) = Σ Σ B_i(u) * B_j(v) * controlPoint[i][j]
```

Where `B_i` are Bernstein basis polynomials (degree 3 = 4x4 = 16 control points).

**Why this works:**
- 16 control points per petal give enough freedom for organic curves
- Different control point layouts = different petal characters (cupped, recurved, ruffled)
- Evaluate at 12x16 grid → 192 vertices per petal, smooth enough
- Each petal layer gets a different control point set — inner petals tight/vertical, outer petals swept back
- Can add noise displacement AFTER evaluation for organic imperfection

**Alternative: Enhanced parametric with multiple curve influences**

If Bezier patches feel too heavy, use the parametric approach but with:
- **Spine curve** (cubic bezier in YZ plane) — petal bends along this
- **Width envelope** (separate bezier) — controls width at each v
- **Cup/roll function** — rotates each cross-section row around the spine
- **Edge ruffle** — high-frequency sin wave that increases toward tip and edges

### Key petal characteristics to model

From studying Ottoman botanical sketches and real roses:

- **Inner petals**: nearly vertical, tightly cupped, slight spiral twist
- **Mid petals**: opening like a bowl, edges beginning to curl back
- **Outer petals**: strongly recurved (tip bends backward), wider, slight ruffle on edges
- **All petals**: asymmetric — one edge slightly higher/longer than other
- **Base**: narrow, thick where it attaches to receptacle
- **Tip**: can be pointed (hybrid tea) or rounded (garden rose)
- **Midrib**: subtle crease/fold running base-to-tip along center

---

## 2. Material Setup for Realistic Petals

### MeshPhysicalMaterial configuration

Three.js's `MeshPhysicalMaterial` has everything we need. Key insight from the Three.js GitHub: **thin-walled model** (`thickness: 0`) is the correct approach for petals — it bypasses volume refraction and uses a simpler, more correct light transmission.

**Recommended petal material:**

```js
const petalMat = new THREE.MeshPhysicalMaterial({
  color: 0xC82050,           // deep rose pink
  roughness: 0.45,           // slightly glossy, like waxy petal surface
  metalness: 0.0,

  // TRANSMISSION — thin-wall model
  transmission: 0.25,        // petals are partially translucent
  thickness: 0,              // thin-wall mode (no volume refraction)
  // NOTE: with thickness=0, attenuationColor/Distance are ignored (correct for thin surfaces)

  // IRIDESCENCE — subtle color shift like real petals
  iridescence: 0.3,          // subtle, not soap-bubble level
  iridescenceIOR: 1.3,
  iridescenceThicknessRange: [100, 300],

  // SHEEN — velvet/silk quality of petal surface
  sheen: 0.8,
  sheenColor: new THREE.Color(0xff88aa),  // lighter pink sheen
  sheenRoughness: 0.3,

  // CLEARCOAT — waxy surface of fresh petals
  clearcoat: 0.15,
  clearcoatRoughness: 0.4,

  side: THREE.DoubleSide,    // petals visible from both sides
});
```

**Per-layer variation:**
- Inner petals: higher `roughness` (0.55), lower `transmission` (0.1), deeper `color`
- Outer petals: lower `roughness` (0.35), higher `transmission` (0.3), lighter `color`
- Petal edges: could use vertex colors or a gradient texture for the 3-shade technique

### Fast subsurface scattering (custom shader approach)

From Matt DesLauriers' gist, a custom SSS technique adds translucency uniforms to the standard material:

- `thicknessMap` — texture where thin areas glow more
- `thicknessPower: 20` — falloff sharpness
- `thicknessScale: 4` — overall strength
- `thicknessDistortion: 0.185` — normal distortion for scattered look

The calculation: `pow(saturate(dot(V, -LTLight)), thicknessPower) * thicknessScale`

This creates beautiful backlit glow through thin petal areas. Could be added via `material.onBeforeCompile` to inject the shader chunk.

**Verdict:** Start with built-in `transmission` + `sheen` + `iridescence`. Only go custom SSS if the built-in look isn't sufficient.

### The three-shade technique (Ottoman tezhip)

Ottoman illumination paints each petal in 3 tones:
1. Light base wash
2. Medium middle tone
3. Dark edge/shadow

In 3D, achieve this with:
- **Vertex colors** mapped to UV: base=light at u=0.5, dark at u=0/u=1 (edges)
- Or a **1D gradient texture** mapped across petal width
- Or simply let the **lighting + material** do it naturally — sheen catches highlights in the center, edges naturally darken from Fresnel

---

## 3. References & Examples

### Three.js / WebGL flower examples
- [Procedural Lathe Flowers](https://www.ibiblio.org/e-notes/webxr/garden/lathe/anim3gl.htm) — LatheGeometry approach with morph targets for petal animation
- [Procedural flowers showcase](https://discourse.threejs.org/t/procedural-flowers/22772) — hierarchy of paths with instanced meshes
- [Procedural trees & flowers](https://discourse.threejs.org/t/procedural-trees-flowers/40797) — vanilla JS + Three.js, path hierarchy
- [Three.js SSS example](https://threejs.org/examples/webgl_materials_subsurface_scattering.html) — official fast subsurface scattering demo
- [Fast SSS shader gist](https://gist.github.com/mattdesl/2ee82157a86962347dedb6572142df7c) — translucency uniforms for PBR material
- [Codrops glass/plastic tutorial](https://tympanus.net/codrops/2021/10/27/creating-the-effect-of-transparent-glass-and-plastic-in-three-js/) — transmission + attenuation setup
- [MeshPhysicalMaterial thin surface issue](https://github.com/mrdoob/three.js/issues/23448) — thin-wall vs volume rendering discussion
- [Petals 2020 contest entry](https://discourse.threejs.org/t/petals-2020-for-ny-contest/11623) — Three.js petal showcase

### Ottoman floral references
- [Turkish Ottoman Floral Motifs](https://www.islamicillumination.com/blog/turkish-ottoman-floral-motifs) — Hatayi, Penc, stylization rules
- [Introduction to Arabesque/Islimi](https://artofislamicpattern.com/resources/introduction-to-islimi/) — biomorphic patterns in Islamic art
- [Flora Islamica exhibition](https://hali.com/news/flora-islamica-plant-motifs-in-the-art-of-islam-in-copenhagen/) — plant motifs across Islamic art traditions

### Local references (in references/ folder)
- `hatayi-reference.png` — Hatayi flower from bird's eye, shows stylized petal layers with stem/sepal/pollen
- `penc-reference.png` — Penc (5-petal) from top view, geometric radial symmetry, three concentric petal rings
- `composition-ref-hatai.jpg` — Traditional tezhip painting showing 3-shade crimson flowers on gold vine, the exact target aesthetic
- `sketch-hatai-closeup.jpg` — Line drawing of hatai with nested circular petal layers, scalloped edges
- `sketch-saz-carnation.jpg` — Saz-style composition with carnations, tulips, feathered leaves
- `sketch-layered-flower.jpg` — Side-view layered flower showing how petals stack from above
- `sketch-penc-circle.jpg` — Penc arrangement in circular composition — penç + small fill flowers on vines
- `ref-peony-layered.jpg` — Peony-style layered petals, three concentric rings visible
- `golden-ratio-spiral-ref.jpg` — Golden spiral reference for arrangement

### Bezier surface math
- [Bezier surface (Wikipedia)](https://en.wikipedia.org/wiki/B%C3%A9zier_surface) — bicubic patch formulation
- [Bezier patches tutorial](https://www.gamedeveloper.com/programming/curved-surfaces-using-b-zier-patches) — converting patches to polygon grids
- [Rose curve (math)](https://en.wikipedia.org/wiki/Rose_(mathematics)) — r = A cos(kθ), petal arrangement in polar coords

---

## 4. Key Design Vocabulary

From `references/books.md` and research:

| Term | Meaning | 3D Application |
|------|---------|---------------|
| **Penç** | Flower from TOP (bird's eye), radial 5-fold symmetry | Small fill flowers, flat disc geometry |
| **Hatâyî** | Flower from SIDE, shows petal depth/layering | Main rose, full 3D petal construction |
| **Goncagül** | Rosebud in profile, tight wrapped petals | Bud meshes with closed spiral |
| **Three-shade** | Light base → medium → dark edge per petal | Vertex color gradient or texture |
| **Tahrir** | Fine contour line defining each petal | Edge outline shader or geometry edge |
| **Saz** | Feathered leaf style, serrated edges | Leaf geometry with edge displacement |

---

## 5. Plan for Next Attempt

### Geometry overhaul

1. **Replace flat parametric with Bezier patch evaluator**
   - Write `evaluateBezierPatch(controlPoints4x4, u, v)` using Bernstein polynomials
   - Create 3-4 control point presets:
     - `OUTER_PETAL` — wide, recurved, slight edge ruffle
     - `MID_PETAL` — cupped bowl shape
     - `INNER_PETAL` — tight, nearly vertical, slight spiral
     - `BUD_PETAL` — tightly wrapped, minimal opening

2. **Add organic variation per-petal**
   - Perturb control points ±5-10% randomly per instance
   - Slight asymmetry: offset one edge column of control points
   - Add simplex noise displacement to final vertex positions (small amplitude)

3. **Spiral phyllotaxis arrangement**
   - Instead of rigid rings, arrange petals using golden angle (137.5°)
   - Each successive petal is slightly higher, slightly more open
   - Creates the natural spiral visible in real roses

4. **Edge detail**
   - Add slight waviness to petal edges via sin displacement on border vertices
   - Ottoman roses have scalloped/ruffled edges — increase wave frequency

### Material refinement

5. **Use thin-wall transmission** (`thickness: 0, transmission: 0.2-0.3`)
6. **Add iridescence** for subtle color shift (0.2-0.4 intensity)
7. **Sheen** for the velvet quality of petal surfaces
8. **Per-layer color variation** — darker inner, lighter outer, matching 3-shade aesthetic
9. **Consider vertex colors** for base-to-tip gradient (lighter at base, deeper at edges)

### Lighting for translucency

10. **Backlight** — position a warm light behind/below the rose so transmission glows through thin petals
11. **Rim light** — cool tone to catch petal edges
12. **Environment map** — even a simple gradient env map dramatically improves MeshPhysicalMaterial quality

### Ottoman aesthetic touches

13. **Gold accents** — metallic gold for stamens, possibly thin gold tahrir lines
14. **Color palette** — deep crimson/rose (not hot pink), emerald green leaves, gold details
15. **Symmetry with imperfection** — Ottoman flowers are geometric but hand-drawn; add slight irregularity
16. **Consider penç (top-view) variant** — for smaller fill flowers in the composition, flat disc with radial petals
