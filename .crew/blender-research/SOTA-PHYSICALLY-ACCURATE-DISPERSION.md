# SOTA Physically Accurate Dispersion Through a Glass Cube in Blender

## Executive take
For **true physical dispersion**, the current best path in a Blender-centered workflow is still **spectral rendering (LuxCore in Blender)**. For **Blender-native Cycles**, the most credible method is a **multi-band wavelength approximation** (not 3-band RGB only), driven by real dispersion equations (Sellmeier/Cauchy), plus caustics-focused lighting and render settings.

---

## 1) Ranked method stack (best → fallback)

## 1) **Spectral path tracing in Blender pipeline (LuxCore Blender addon)** — best physical truth
- **Physical accuracy:** Highest (actual wavelength-domain behavior, not RGB proxy)
- **Render cost:** High
- **Control:** Medium (physically constrained, less “art-directable cheating”)
- **When to use:** Hero stills / short shots where prism credibility is mission-critical

## 2) **Cycles multi-band wavelength approximation (5–9 bands recommended)** — best Blender-native
- **Physical accuracy:** High-ish for RGB renderer (significantly better than 3-channel hack)
- **Render cost:** Medium-high to very high (node complexity + samples)
- **Control:** High (full shader control)
- **When to use:** Production in native Cycles where realism matters and render budget exists

## 3) **Cycles 3-band RGB IOR split (classic)** — practical fallback
- **Physical accuracy:** Moderate/low (coarse, can band)
- **Render cost:** Medium
- **Control:** Very high
- **When to use:** Fast lookdev, motion where exact optical fidelity is less critical

## 4) **Compositor/lens-dispersion cheats** — last resort
- **Physical accuracy:** Low
- **Render cost:** Low
- **Control:** Very high
- **When to use:** Stylized or deadline panic only

---

## 2) Exact node/network strategies

## Method 1 — LuxCore spectral (true wavelength)
1. Use LuxCore render engine in Blender.
2. Glass material as physical dielectric (IOR from real glass family: BK7/crown/flint equivalents).
3. Enable caustic-friendly integrator settings (bidirectional/caustic-capable mode in LuxCore profile).
4. Keep roughness near 0 for prism cast; add tiny roughness only for premium realism (micro-surface, not frosted).

**Practical target values**
- Roughness: **0.0–0.01** for clean dispersion caustic
- Cube scale: **5–20 cm** (small enough for controlled cast, large enough to resolve separation)
- Cast distance (cube → receiver): **0.2–1.5 m**

## Method 2 — Cycles multi-band spectral approximation (recommended native)
Build a node group `Dispersion_Glass_MultiBand`:

1. Create **N glass lobes** (N=5, 7, or 9): each lobe = `Glass BSDF`.
2. For each lobe, assign wavelength center λᵢ in visible range (e.g. 420, 470, 520, 570, 620, 670 nm for 6-band).
3. Compute IOR per lobe from material equation:
   - Fast: Cauchy `n(λ)=A + B/λ²`
   - Better: Sellmeier coefficients for chosen optical glass
4. Weight each lobe by spectral response proxy (uniform or daylight-biased weights).
5. Sum lobes via `Add Shader` chain.
6. For color energy, keep each lobe color narrow around its λᵢ (HSV ramp or predefined spectral colors), but avoid neon saturation.
7. Optional realism: multiply transmission by subtle `Volume Absorption` for path length tint.

**Concrete IOR range guidance (glass)**
- Typical visible IOR span for common optical glass across blue→red: roughly **Δn ≈ 0.008–0.02** depending on material.
- Practical Cycles multi-band setup start:
  - Center IOR (green): **~1.50–1.53**
  - Blue end offset: **+0.004 to +0.012**
  - Red end offset: **-0.004 to -0.010**

## Method 3 — Cycles 3-band RGB split
1. Three `Glass BSDF` nodes: R, G, B.
2. IOR triplet start point (common practical):
   - **R: 1.495**
   - **G: 1.505**
   - **B: 1.515**
3. Add shaders and output directly (avoid fragile Light Path transmission-depth gating unless absolutely needed).

This is the known practical trick used widely by artists; fast, but visibly coarse.

---

## 3) Lighting + geometry prerequisites for visible prism cast

1. **Need a hard/small bright source**
- Sun lamp angle low (tight), or small area light with high intensity.
- Broad HDRI alone rarely yields strong readable prism cast.

2. **Need distance to separate wavelengths**
- Receiver too close = white-ish blur.
- Start with **0.3–1.0 m** separation from cube to catch surface.

3. **Need oblique incidence**
- Rotate cube so rays hit at non-normal angles (e.g. **15–35°** incidence).

4. **Need clean optical geometry**
- Real thickness, clean normals, no doubled faces.
- Bevel tiny edges (**0.1–0.5 mm**) for realistic highlights without destroying caustic sharpness.

5. **Need caustic-aware render setup in Cycles**
- Enable/retain refractive caustic paths where needed.
- Use object/light/world caustic flags + shadow caustics strategy when relevant.

---

## 4) Common failure modes + debugging

1. **“No rainbow appears”**
- Cause: source too soft, cast distance too short, or IOR spread too small.
- Fix: smaller/harder source, increase receiver distance, widen blue-red IOR separation gradually.

2. **“Looks fake/neon”**
- Cause: over-saturated lobe colors or too-wide RGB split.
- Fix: reduce chroma, increase number of bands, constrain to realistic IOR dispersion.

3. **“Too noisy / fireflies”**
- Cause: caustic paths under-sampled.
- Fix: increase samples, tune `Filter Glossy` around **0.5–1.5** start range, verify caustic settings and light tree/path-guiding usage.

4. **“Dispersion disappears behind additional glass layers”**
- Cause: brittle Light Path transmission-depth logic.
- Fix: remove unnecessary Light Path gates; prefer direct summed-dispersion output (known issue pattern in production Q&A).

5. **“Shading artifacts / triangular reflections”**
- Cause: bad topology or broken normals.
- Fix: rebuild mesh loops, recalc normals, remove orphan edges/ngons in critical refractive surfaces.

---

## 5) Minimal validation protocol + acceptance criteria

## Validation protocol (10–15 min)
1. Test scene: one cube, one hard light, one matte receiver plane.
2. Render A/B:
   - A = no dispersion (single glass)
   - B = chosen dispersion method
3. Capture three camera distances and two cube rotations.
4. Sample line profile across caustic in compositor/image editor:
   - Verify spatial separation of R/G/B peaks (or multi-band equivalent).
5. Check stability at final shot resolution + denoise pass.

## Acceptance criteria
- Visible, directional prism cast on receiver in at least 2/3 angles.
- No severe neon clipping in highlights.
- No topology-driven artifacts in refracted reflections.
- Noise manageable within agreed sample budget.
- Look holds up in motion (no temporal rainbow flicker beyond acceptable threshold).

---

## 6) Recommendation for AGOT context (run this first)

**Run first:** Method 2 (Cycles multi-band approximation, 5–7 bands), with strict lighting geometry setup.

Why for AGOT:
- Keeps workflow fully native to Blender/Cycles.
- Delivers premium realism beyond common RGB hack.
- Still art-directable for product-grade beauty shots.

**Execution order for AGOT**
1. Build 5-band node group from physical IOR equation (Sellmeier preferred, Cauchy acceptable).
2. Lock lighting for readable caustic (hard key + controlled receiver distance).
3. Tune IOR spread to real-glass range first, then very slight artistic push only if needed.
4. If realism still insufficient for hero frame: escalate only that shot to LuxCore spectral.

---

## Sources / techniques cited
1. Blender Manual (Glass BSDF): states glass mixes refraction/reflection and is noisy due to caustics; distribution/roughness behavior.  
   https://docs.blender.org/manual/en/latest/render/shader_nodes/shader/glass.html
2. Blender Manual (Cycles Light Paths): max bounces, reflective/refractive caustics toggles, filter glossy guidance.  
   https://docs.blender.org/manual/en/latest/render/cycles/render_settings/light_paths.html
3. Blender Manual (Cycles Object settings): Shadow Caustics notes, MNEE-based limitations and physical inaccuracies.  
   https://docs.blender.org/manual/en/latest/render/cycles/object_settings/object_data.html
4. Blender Manual (Cycles Sampling): Path Guiding notes and limits; training sample guidance (128–256 typical).  
   https://docs.blender.org/manual/en/latest/render/cycles/render_settings/sampling.html
5. Cycles renderer feature overview (physically based/path guiding/MNEE context in ecosystem).  
   https://www.cycles-renderer.org/features/
6. Blender StackExchange (dispersion in Principled context; widespread practical approximations, non-physical hacks acknowledged).  
   https://stackprinter.appspot.com/export?question=201085&service=blender.stackexchange&language=en&width=700&hideAnswers=false&showAll=true
7. Blender StackExchange (transmission depth pitfall and fix for layered glass dispersion setups).  
   https://stackprinter.appspot.com/export?question=305839&service=blender.stackexchange&language=en&width=700&hideAnswers=false&showAll=true
8. Dispersion equations references:
   - Cauchy equation: https://en.wikipedia.org/wiki/Cauchy%27s_equation
   - Sellmeier equation (incl. BK7 example coefficients): https://en.wikipedia.org/wiki/Sellmeier_equation
   - Refractive index database context: https://refractiveindex.info/

---

## Confidence / caveat
- High confidence on **method ranking + Cycles practical setup**.
- Important caveat: current Cycles workflow remains fundamentally RGB-based; “physically accurate” in Cycles means **physically informed approximation**, not full spectral transport.