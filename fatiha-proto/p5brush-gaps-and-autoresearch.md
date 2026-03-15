# p5.brush: Gaps Analysis & Autoresearch Strategy

## The Vision

A real-time, voice-reactive Islamic calligraphic art experience. Live microphone input drives procedural growth of Ottoman flowers and calligraphy. Not pre-recorded — truly generative.

---

## PART 1: What's Missing from p5.brush

### 1. Real-Time Performance at 60fps — CRITICAL GAP

**Verdict: p5.brush was not designed for real-time animation.**

The library is **immediate-mode**: every `brush.line()`, `brush.circle()`, `brush.spline()` call renders directly to the WebGL canvas. There is no internal scene graph, no display list, no retained-mode buffer. Once a stroke is drawn, it's permanent pixel data.

This means:
- **No accumulation buffer** — you can't "keep what's already drawn" at the library level
- **Every dynamic element must be re-rendered every frame** — or you must manually track what's been drawn (which we do with `drawn: true` flags)
- **Each filled+hatched+stroked shape = 3 GPU passes** — a scene with 50 flowers × 3 passes = 150 draw calls per frame
- **Stamp-based rendering**: each stroke is a chain of tiny tip stamps along the path. A single `brush.spline()` with 100 points could mean 500+ stamp operations

Our current prototype already hits this wall. The `fatiha-paintbrush.html` version works by cheating — drawing elements once, marking them `drawn: true`, and never re-rendering them. This works for pre-recorded audio playback but **breaks completely for live mic input** where the garden must respond dynamically.

**What we'd need:** A retained-mode layer system where completed strokes persist as textures, and only new/changing strokes get rendered each frame.

### 2. Dynamic/Growing Strokes — PARTIAL SOLUTION EXISTS

**Can we animate a vine extending frame by frame?**

p5.brush has no built-in progressive reveal. But we've already implemented a working approach:
- Pre-compute spiral path points
- Track `drawnVineIdx` — how far along we've drawn
- Each frame, only render the new segment via `brush.spline(newPoints)`

This works well for linear growth. **The gap**: there's no way to animate *stroke properties* along the growth — you can't make a vine tip thinner/lighter while the base stays thick. The pressure parameter in `brush.spline([[x, y, pressure], ...])` is set at draw time, not animatable after.

**What we'd need:** Per-segment pressure/color/opacity that can be set at draw time for the new segment, which partially exists via the pressure array in spline points. Good enough.

### 3. Erasing/Fading Old Strokes — HARD GAP

**No mechanism exists.** Zero. Once pixels hit the canvas, they're permanent.

Options:
- **Redraw entire background** — expensive, loses everything
- **Semi-transparent overlay** — fake fade, creates muddy colors over time
- **Offscreen buffer per layer** — draw to `p5.Graphics`, composite manually, clear individual buffers

For our "petals dying and falling" effect, we currently animate separate petal objects on top of static drawn elements. True fading of *brush strokes* (like a calligraphic letter dissolving) is not possible without a layer system we'd have to build ourselves.

**What we'd need:** Layer-based rendering with per-layer opacity/blend controls. Think Photoshop layers but for real-time brush output.

### 4. Audio-Reactive Parameter Modulation — NOT BUILT IN, BUT DOABLE

p5.brush has no audio awareness whatsoever. But since all parameters are just function calls, we can modulate them ourselves:

```javascript
// Amplitude → brush weight (pressure)
const amp = getAmplitude();  // from Web Audio API
brush.strokeWeight(map(amp, 0, 1, 0.5, 3.0));

// Frequency → color hue
const freq = getDominantFreq();
const hue = map(freq, 80, 800, 0, 360);
brush.stroke(color(hue, 80, 90));

// Onset → spawn event
if (detectOnset()) spawnFlower();
```

**The gap isn't p5.brush — it's that modulating parameters per-frame requires re-rendering**, which brings us back to the performance problem. If amplitude changes the brush weight of an already-drawn vine, we can't update it. We can only affect *new* strokes.

This is actually fine for our vision — new growth responds to current audio, old growth stays. But it means we need the audio pipeline (Web Audio API AnalyserNode, FFT, onset detection) as a separate system feeding parameters into the brush calls.

### 5. Performance with Hundreds of Simultaneous Elements — RED FLAG

Testing shows degradation with complexity:
- **< 20 elements with fill+hatch+stroke**: smooth on modern GPU
- **50-100 elements**: noticeable frame drops
- **200+ elements**: unusable for real-time

The bottleneck is hatch lines — `brush.hatch(dist=4)` on a medium circle generates ~100 individual brush strokes. Multiply by 50 flowers = 5000 stroke operations.

**Mitigations we've used:**
1. Draw once, mark `drawn: true` (static elements)
2. Only hatch key focal flowers, not all
3. Reduce hatch density for background elements
4. Limit dynamic elements (falling petals) to ~15 at once

**What we'd need for live performance:** Either GPU-instanced rendering of brush stamps (batch hundreds of stamps into a single draw call) or a fundamentally different approach — pre-render brush textures as sprites and composite them.

### 6. Custom Post-Processing (Bloom, Glow) — CLOSED SYSTEM

**p5.brush exposes zero shader API.** The internal shaders for watercolor bleed/texture are not accessible. You cannot:
- Add a bloom/glow pass
- Do custom color grading
- Apply vignette or chromatic aberration
- Run any post-processing shader

**Workaround:** Render all brush output to a `p5.Graphics` buffer, then draw that buffer to the main canvas and apply p5.js `filter()` or use a separate WebGL pipeline (three.js) for post-processing. This adds another full-screen copy per frame.

**What we'd need:** Either fork p5.brush to expose shader hooks, or accept the buffer-copy overhead.

### 7. 3D Brush Strokes — NOT POSSIBLE

p5.brush is 2D only. The WEBGL requirement is for GPU acceleration, not 3D rendering. All geometry lives in a 2D plane. No depth, no z-axis, no 3D brush paths.

For our vision this might be fine — Ottoman illumination art is inherently 2D. But if we ever wanted parallax depth, z-layered petals, or camera rotation, we'd need a completely different system.

### 8. Contributing Back — POSSIBLE BUT NICHE

The library is MIT-licensed on GitHub. We could contribute:
- Retained-mode layer system
- Batch rendering / instanced stamps
- Progressive stroke reveal API
- Per-layer opacity and fade
- Shader pipeline hooks

But these are **architectural changes**, not features bolted on. The maintainer would need to agree to a significant refactor. More realistic: **maintain our own fork** optimized for real-time animation.

---

## Summary of Gaps

| Need | p5.brush Status | Severity |
|------|----------------|----------|
| Real-time 60fps rendering | Not designed for it | **CRITICAL** |
| Growing/progressive strokes | Manual workaround exists | Medium |
| Fading/erasing strokes | Impossible without layers | **HIGH** |
| Audio parameter modulation | Works (we do it externally) | Low |
| 200+ simultaneous elements | Performance collapse | **HIGH** |
| Post-processing shaders | Closed system | Medium |
| 3D brush strokes | Not possible | Low (not needed) |
| Layer-based compositing | Not built in | **HIGH** |

### Honest Assessment

p5.brush is **excellent for what it was designed for**: rendering beautiful, natural-looking static illustrations. Our prototype proves it creates stunning Ottoman garden aesthetics. But it was built as a *drawing tool*, not an *animation engine*. The further we push toward real-time, voice-reactive performance, the more we fight the library's architecture.

**Two paths forward:**
1. **Fork and extend p5.brush** — add retained-mode layers, batch rendering, shader hooks. Preserves the beautiful brush aesthetics we've proven work.
2. **Build a custom renderer** inspired by p5.brush's stamp-based approach, but designed from the ground up for real-time animation with WebGL instancing, layer compositing, and shader pipeline.

---

## PART 2: Autoresearch for Brush Optimization

### What is Autoresearch?

Karpathy's autoresearch framework lets AI agents autonomously run experiments. The core loop:

1. Agent reads the current code + instructions (`program.md`)
2. Agent modifies the experiment code (`train.py`)
3. Experiment runs for a **fixed time budget** (5 min wall-clock)
4. Result is evaluated against a **single scalar metric** (val_bpb)
5. Agent decides keep/discard, proposes next modification
6. Loop repeats — ~12 experiments/hour, ~100 overnight

Three files: `prepare.py` (fixed infrastructure), `train.py` (agent modifies), `program.md` (instructions/policy).

### Adapting Autoresearch for Brush Optimization

The key insight: we need a **single scalar metric** and a **bounded experiment**. For our brush system, this maps cleanly:

#### What Parameters Could Be Auto-Tuned?

**Brush Configuration Space** (per brush type):
- `weight` — base thickness (1-50 canvas units)
- `scatter` — sideways spread (0-5)
- `spacing` — stamp gap along stroke (0.1-3.0)
- `opacity` — stamp opacity (0-255)
- `pressure` — curve function `(t) => value` or `[start, mid, end]`
- `sharpness` — edge softness (0-1, default type only)
- `grain` — texture density (0-1, default type only)
- `rotate` — stamp rotation mode (`"none"`, `"natural"`, `"random"`)

**Watercolor Fill Space:**
- `fillBleed` strength (0-1) and direction (`"out"`, `"in"`)
- `fillTexture` textureStrength (0-1) and borderIntensity (0-1)
- Fill opacity (0-255)

**Composition Space:**
- Color palette selection (hue, saturation, value ranges)
- Element density (flowers per unit area)
- Hatch spacing, angle, randomness
- Vector field choice and parameters
- Growth rate curves (how vine extends over time)
- Element size distribution

**Total parameter space: ~40-60 continuous parameters** — large but tractable.

#### Aesthetic Scoring Model

**The hardest part.** We need a function `score(rendered_image) → float` where higher = more beautiful/authentic Ottoman garden aesthetic.

**Option A: CLIP-based scoring**
- Use CLIP (or SigLIP) to compute similarity between rendered frame and reference Ottoman art images
- Collect 100-200 reference images: Turkish tezhib, Iznik tiles, Topkapi illuminations
- Score = average CLIP similarity to reference set
- **Pro:** No training needed, works immediately
- **Con:** CLIP measures semantic similarity, not aesthetic quality. A photo of Ottoman art would score higher than our generative version.

**Option B: Fine-tuned aesthetic model**
- Start from a pretrained aesthetic scorer (LAION-Aesthetics, NIMA)
- Fine-tune on paired comparisons: show two renders, human picks preferred
- Build dataset of 500-1000 pairs from our own renders
- **Pro:** Directly measures what we care about
- **Con:** Requires human labeling effort upfront

**Option C: Multi-objective scoring**
Combine automated metrics:
- **CLIP similarity** to reference Ottoman art (0-1)
- **Color harmony score** — measure palette coherence (extracting dominant colors, checking complementary/analogous relationships)
- **Spatial balance** — golden ratio adherence, symmetry metrics
- **Complexity score** — edge density, detail distribution (not too sparse, not too busy)
- **Temporal smoothness** — for animations, measure frame-to-frame jitter
- Weighted sum: `score = 0.3*clip + 0.2*harmony + 0.2*balance + 0.2*complexity + 0.1*smoothness`

**Recommendation: Start with Option C**, graduate to Option B once we have enough renders to build a preference dataset. Option C gives us immediate signal without human labeling.

#### The Experiment Loop

```
┌─────────────────────────────────────────────────────┐
│                   PREPARE (fixed)                    │
│  • Load reference Ottoman art images                 │
│  • Initialize CLIP/aesthetic scorer on GPU           │
│  • Define parameter bounds and render pipeline       │
│  • Set up headless p5.js via Puppeteer/Playwright    │
└──────────────────────┬──────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────┐
│                EXPERIMENT (agent modifies)            │
│  1. Agent reads current brush_config.json            │
│  2. Agent proposes modifications (guided by scores)  │
│  3. Config is loaded into headless p5.js renderer    │
│  4. Render 10 variations at different random seeds   │
│  5. Run aesthetic scorer on all 10 renders           │
│  6. Report mean ± std of scores                      │
│  7. Budget: 2 minutes per experiment                 │
│     (render ~10 images + score them)                 │
└──────────────────────┬──────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────┐
│                EVALUATE & ITERATE                    │
│  • If mean_score > best_score: KEEP, save config    │
│  • Else: DISCARD, try different direction            │
│  • Agent sees full history of attempts + scores      │
│  • Agent proposes next modification                  │
│  • ~30 experiments/hour (2 min each)                 │
│  • ~360 experiments overnight (12 hours)             │
└─────────────────────────────────────────────────────┘
```

#### Specific Experiment Types

**Experiment 1: Optimal Flower Brush**
- Search space: weight, scatter, spacing, opacity, pressure curve, sharpness
- Fix: single flower rendered at center, standard palette
- Metric: CLIP similarity to reference Ottoman tulips/carnations
- ~200 experiments to converge

**Experiment 2: Watercolor Fill Tuning**
- Search space: bleed, texture, opacity, layer count
- Fix: single filled circle with known reference appearance
- Metric: perceptual similarity to watercolor washes in reference art
- ~100 experiments

**Experiment 3: Full Composition**
- Search space: element density, size distribution, color palette, hatch parameters
- Fix: vine path, audio timing
- Metric: multi-objective score (CLIP + harmony + balance + complexity)
- ~500 experiments (larger search space)

**Experiment 4: Animation Smoothness**
- Search space: growth rate curves, spawn timing, field animation speed
- Render: 5-second animation clips
- Metric: temporal smoothness + per-frame aesthetic score
- ~200 experiments

#### Using Dual RTX A6000s

Each A6000 has 48GB VRAM — massive headroom. Here's how to use both:

**GPU 0: Renderer**
- Run headless Chromium with WebGL (p5.js + p5.brush)
- Render experiment images/clips
- Could run 4-8 parallel headless browser instances
- WebGL rendering uses GPU compute but not much VRAM

**GPU 1: Scorer**
- Run CLIP/SigLIP model for aesthetic scoring
- Run fine-tuned aesthetic model (when ready)
- Batch score multiple images simultaneously
- 48GB VRAM = can load multiple scoring models

**Parallel pipeline:**
```
GPU 0: Render batch N+1  ←→  GPU 1: Score batch N
        (2 min)                    (30 sec)
```

This pipelining means scoring is essentially free — it happens while the next batch renders. **Effective throughput: ~30 experiments/hour, ~360/night.**

**Alternative: Both GPUs for scoring**
If rendering is fast (it should be — WebGL on A6000 is overkill), use both GPUs for parallel scoring with different models:
- GPU 0: CLIP similarity scoring
- GPU 1: Learned aesthetic model + color harmony analysis
- Render on CPU-side WebGL (still fast for 2D)

#### The `program.md` for Our Use Case

```markdown
# Ottoman Garden Brush Optimization

## Goal
Find brush configurations that produce the most authentic, beautiful
Ottoman illumination garden aesthetic when rendered procedurally.

## Constraints
- All parameters must work in real-time (no configs that require
  offline rendering tricks)
- Render at 1080x1920 (portrait mobile)
- Each experiment renders 10 images with different random seeds
- Score is mean aesthetic score across all 10

## Strategy
- Start with coarse sweeps of each parameter independently
- Once you find good regions, do fine-grained joint optimization
- Pay special attention to: fill bleed (too much = muddy, too little = flat),
  hatch density (too dense = slow, too sparse = empty), pressure curves
  (affect the "life" of each stroke)
- If score plateaus, try bold architectural changes: different brush types
  for different elements, asymmetric compositions, varying the vine path

## What NOT to change
- The p5.brush library itself
- The rendering pipeline code
- The scoring model
```

#### What the Agent Would Actually Discover

Based on our manual experimentation, the autoresearch agent would likely converge on:

1. **Brush weight sweet spot**: 1.5-2.5x scale for Ottoman proportions (not too delicate, not too heavy)
2. **Fill bleed at 0.10-0.20**: enough softness for watercolor look, not so much it becomes muddy
3. **Hatch spacing 6-10px**: dense enough for texture, sparse enough for performance
4. **Pressure curves**: concave `(t) => pow(t, 0.7)` for organic taper (the "calligraphic" feel)
5. **Color palette clustering**: 3-4 color families (crimson, gold, green, deep blue) with limited saturation range
6. **Element density**: ~30-40 elements for rich composition without overcrowding
7. **Growth rate**: logarithmic (fast initial growth, slow settling) feels most natural

The value isn't just finding optimal parameters — it's **mapping the landscape**. We'd know which parameters are sensitive (small changes = big aesthetic impact) vs. robust (wide range looks fine). This guides where to spend engineering effort.

---

## Recommended Next Steps

### Immediate (this week)
1. **Benchmark p5.brush real-time limits** — render N elements, measure frame time, find the exact threshold on target devices
2. **Prototype the layer system** — draw to separate `p5.Graphics` buffers, composite manually, measure overhead
3. **Set up Web Audio API pipeline** — AnalyserNode, FFT, amplitude envelope, onset detection from live mic

### Short-term (next 2 weeks)
4. **Build headless rendering pipeline** — Puppeteer + p5.js, render to PNG, automate via Node.js
5. **Set up CLIP scoring** — load SigLIP on GPU 1, score rendered images against Ottoman art reference set
6. **First autoresearch run** — optimize single flower brush parameters overnight

### Medium-term (month)
7. **Decide: fork p5.brush or build custom renderer** — based on benchmark results
8. **Build preference dataset** — generate 1000 paired renders, label via A/B comparison
9. **Train aesthetic scorer** — fine-tune on our preference data
10. **Full autoresearch campaign** — optimize full composition over multiple nights

### The Critical Question

Can we push p5.brush far enough for live performance, or do we need to build from scratch?

The answer depends entirely on the benchmark results from step 1. If we can maintain 30fps with 40+ elements using the layer caching approach, p5.brush is viable with a lightweight fork. If not, we take the stamp-rendering concept and rebuild it with WebGL instancing and a proper retained-mode architecture.

Either way, autoresearch gives us the parameter optimization layer on top — it works regardless of which renderer we use underneath.
