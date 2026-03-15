# Tyler Hobbs Techniques — Research for fatiha.brush

Comprehensive notes from five articles by Tyler Hobbs, distilled for implementation in our WebGL2 brush engine.

---

## 1. How to Hack a Painting

**Core idea:** You don't simulate physics — you simulate the *appearance* of paint. Fake it convincingly.

### Layering Strategy
- Build paintings in **global layer passes**: define all shapes first, then render layer 1 of every shape, layer 2 of every shape, etc.
- This causes colors to **interleave** at overlap zones rather than one shape fully covering another — critical for watercolor realism.
- Within each shape: 30–100 layers at very low opacity (~4% per layer).

### Polygon Deformation (the main algorithm)
- Start with a simple polygon (triangle, quad, etc.).
- For each edge, find a midpoint via **Gaussian distribution** (not exact center).
- Displace that midpoint **perpendicular** to the edge by a Gaussian-distributed magnitude.
- Replace the original edge with two edges through the displaced point.
- Repeat recursively **~7 times** for base shape, then **3–5 more** per layer.
- Each edge carries a **variance level** that children inherit with slight mutation — this creates regions of soft vs. hard edges on the same shape.

### Texture Masking
- Per layer: scatter ~1000 small circles randomly across the canvas.
- Intersect (darkest blend) between the polygon and the circles.
- Vary circle positions per layer — builds up organic grain like paper texture.
- This prevents shapes from looking flat/digital.

### Pigment Concentration
- First ⅓ of layers: only 1 deformation round (tight to base polygon) → concentrated center.
- Middle ⅓: 2 rounds.
- Final ⅓: full 3+ rounds → feathered edges.
- This naturally concentrates opacity in the center with soft bleeding edges.

---

## 2. Watercolor Simulation

**The definitive algorithm — this is the one to build.**

### Step-by-Step Process
1. **Create base polygon** — simple shape (triangle/quad/custom).
2. **Deform edges recursively** (~7 rounds) to create organic outline.
3. **For each of 30–100 layers:**
   a. Start from the base (7-round) polygon.
   b. Apply 4–5 additional deformation rounds.
   c. Fill with very low opacity (~4%).
   d. Apply texture mask (scattered circles, darkest blend).
4. All layers share the same macro shape but differ in micro detail.

### Key Parameters
| Parameter | Value | Notes |
|---|---|---|
| Base deformation rounds | ~7 | Creates organic outline |
| Per-layer extra rounds | 4–5 | Fine detail variation |
| Layer count | 30–100 | More = smoother |
| Layer opacity | ~4% (0.04) | Very transparent |
| Texture circles per layer | ~1000 | Paper grain simulation |
| Displacement distribution | Gaussian | Mean at midpoint, variance controls softness |

### Variance Inheritance
- Each edge segment has a `variance` property.
- When an edge splits, children inherit parent's variance ± small random delta.
- High-variance edges become wild/feathery; low-variance edges stay tight.
- This is what makes some parts of a watercolor blob crisp and others bleedy.

### Color Interleaving
- Instead of rendering all 50 layers of blob A, then all 50 of blob B:
- Render 5 layers of A, 5 of B, 5 of A, 5 of B...
- Creates natural color mixing at overlap zones.

---

## 3. Creating Soft Textures

**Five techniques for organic edges and fills.**

### Technique 1: Layered Transparent Polygons
- Stack 20–100 slightly varied polygons at 2–10% opacity.
- Vary width/position per layer using Gaussian distribution (mean=0, variance=100px).
- Creates soft gradient transitions.
- **Application to fatiha.brush:** This is essentially what `addWash` does but should be expanded — vary shape per layer, not just position.

### Technique 2: Complex Polygon Edges
- Apply independent Gaussian noise to top/bottom edges of shapes.
- Use cubic Bézier curves with Gaussian-noised control points instead of straight lines.
- Fan-out effects: leave gaps at boundaries, randomize extension amounts.
- **Application:** Our polygon deformation should output Bézier paths, not just jagged lines.

### Technique 3: Stippled Dots
- 20,000 tiny dots (2×2 px) placed with Gaussian distribution from an edge.
- `x = edge + abs(gauss(0, 60))` — dots cluster near edge, fade outward.
- Y distributed uniformly along the edge length.
- Creates smooth, even fade without directional bias.
- **Application:** New `stipple()` method on FatihaBrush.

### Technique 4: Line-Based Stippling
- Thousands of thin strokes (weight 0.1) using `hatch_line` brush.
- **Horizontal:** length = `abs(gauss(0, 60))` from edge.
- **Vertical:** x-position = `gauss(edge, 60)`, spans full height.
- **Omnidirectional:** both endpoints independently Gaussian-distributed.
- **Application:** Enhanced `addHatch()` with Gaussian distribution option.

### Technique 5: Clustered Lines
- Pick a random start/end using `gauss(0, 60)`.
- Generate **8 variants** around those points using tight `gauss(coord, 5)`.
- Creates organic "bird's nest" bundles.
- **Application:** New `drawCluster()` method.

### Key Parameters
| Technique | Count | Opacity | Variance |
|---|---|---|---|
| Layered polygons | 20–100 | 0.02–0.1 | 100px |
| Stipple dots | 20,000 | 1.0 | 60px from edge |
| Line stipple | 1,000+ | 0.1–1.0 | 60px |
| Clustered lines | 8 per group | 0.1–1.0 | 5px tight cluster |

---

## 4. Probability Distributions

**The single most important technique for organic-looking generative art.**

### Uniform Distribution
- `Math.random()` — equal odds everywhere.
- Use for: even coverage, static-like fills, background noise.
- **Caveat:** Real uniform randomness has more clustering than people expect — embrace gaps/clusters, don't "fix" them.

### Gaussian (Normal) Distribution
- Hobbs' **most-used distribution**.
- `mean + stddev * randomGaussian()`
- Use for: "approximately the same, but with some outliers."
- Controls: `mean` (center) and `stddev` (spread).
- **No inherent bounds** — must clamp/truncate for safety.
- Natural for: sizes, positions, angles, timing, opacity variation.
- **Implementation:** Box-Muller transform for GPU/JS.

### Power Law (Pareto) Distribution
- Exponentially skewed toward minimum — "many small, few large."
- Use for: element sizes (many tiny flowers, few large), spacing, stroke weights.
- Creates natural hierarchy without manual size classes.
- **Implementation:** `min * (1 - Math.random()) ^ (-1/alpha)`

### Applications to fatiha.brush
- **Stamp placement jitter:** Gaussian instead of uniform — clusters more naturally.
- **Element sizing:** Power law for petal/leaf sizes — many small, few large.
- **Opacity variation:** Gaussian around target — most stamps near target, a few outliers.
- **Spacing:** Gaussian or power law — irregular but patterned.
- **Color variation:** Gaussian jitter in HSL space — natural color drift.

---

## 5. Code Goes In, Art Comes Out (Philosophy)

### Guided Randomness
- Code defines **guidelines, not specifications**.
- Best results come from programs that push in a direction but don't fully control output.
- Run the same code many times — select the best outputs.

### Iteration Workflow
- Tight feedback loop: change → render → evaluate.
- No predetermined goals — explore, discover, keep surprises.
- Save seeds, not images — can re-render at any resolution.

### Control Spectrum
- Too little randomness → mechanical, boring.
- Too much → chaos, no coherence.
- Sweet spot: "pleasant every 10–20 runs."
- **Application:** Every parameter should have a sensible default but accept a variance/jitter parameter.

### Emergent Systems
- Simple rules, iterated → complex structure.
- Agent-based systems, cellular automata — potential future direction.
- **Application:** Our garden growth could be agent-based.

---

## Implementation Plan for fatiha.brush

### New Methods to Add

1. **`gaussian(mean, stddev)`** — Box-Muller Gaussian RNG (static utility)
2. **`powerLaw(min, alpha)`** — Pareto power-law RNG (static utility)
3. **`watercolor(polygon, opts)`** — Full Hobbs watercolor: polygon deformation + layering + texture mask
4. **`softEdge(x, y, w, h, opts)`** — Layered transparent rectangles with Gaussian edge variation
5. **`stipple(points, opts)`** — Gaussian dot scatter along path/region
6. **`drawCluster(x, y, angle, opts)`** — Clustered line bundles (bird's nest)
7. **`deformPolygon(points, opts)`** — Core polygon deformation algorithm (recursive midpoint displacement)
8. **`textureMask(polygon, layer, opts)`** — Scatter circles for paper grain

### Integration with Existing Features
- All new methods use existing `addStamp()` / `drawStroke()` internally.
- Mixbox pigment blending applies automatically through layer compositing.
- Audio reactivity can modulate variance/opacity parameters in real-time.
- New tools work with existing layer system — watercolor on 'garden', glow on 'glow'.
