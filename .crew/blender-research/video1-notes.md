# Video 1 Research Notes — Continuous Glass Dispersion (YouTube: lEPZ1IUkoB4)

## 1) Shot breakdown (camera, key/fill/rim, material cues, post FX)

### A. Hero intro/result shots (glass objects on dark floor)
- **Camera**: mostly static beauty angles; low-to-mid height, 3/4 perspective, moderate focal feel (roughly 50–85mm look), shallow-to-moderate DOF in hero moments.
- **Composition**: subject isolated in center/near-center; lots of negative space; dark background to make refraction and spectrum read.
- **Lighting ratio**:
  - **Key**: dominant, small-ish/hard source or narrow beam for strong spectral splitting.
  - **Fill**: very low (roughly ~1:4 to 1:8 feel).
  - **Rim**: mostly emergent from Fresnel + back/side environment highlights, not a broad soft rim.
- **Material cues**: high transmission, low roughness, clean Fresnel edges, visible internal bounce, prism-like rainbow separation on exits.
- **Post**: restrained bloom/glare at hotspots; moderate contrast with darker toe; slight vignette in some hero frames.

### B. Demo comparisons ("bad RGB split" vs improved continuous dispersion)
- **Camera**: didactic, locked framing.
- **Lighting**: intentionally simple to expose artifacts.
- **Key visual lesson**: naïve 3-shader RGB split creates visible color gaps; continuous spectrum mapping removes banding/gaps and feels physically coherent.

### C. Node-graph/tutorial sections
- Mostly technical setup with occasional test renders.
- The strongest lookdev moments are where **single bright beam + dark surround** create readable caustic/spectral behavior.

---

## 2) Shader/material notes (dispersion, roughness, caustics)

## Core shader architecture
- **Separate reflection and refraction** rather than relying purely on Principled defaults:
  - Refraction BSDF + Glossy BSDF, mixed by Fresnel.
- This gives independent control of:
  - reflection color/roughness
  - refraction color/roughness
  - dispersion strength behavior

## Continuous dispersion strategy
- Instead of 3 fixed RGB lobes, map many tiny spectral bins:
  - white-noise driven micro-variation
  - color ramp spectrum engineered to average to white (to avoid global tint)
  - map-range from base IOR + dispersion amount
- **Important**: dispersion response should be **curved, not linear** (blue refracts more than red).
  - RGB Curves (or equivalent remap) used to bias higher refraction toward blue end.

## Roughness strategy
- Keep **refraction roughness near-zero** for crisp dispersion readability.
- Add only micro roughness if needed to avoid CG-perfect glass; too much kills spectral separation fast.
- Reflection roughness can be slightly higher than refraction roughness for nicer highlight rolloff.

## Caustic cues
- Real look comes from:
  - bright narrow source
  - dark receiving surface
  - sufficient transmission/refraction bounces
- Cycles can do this but is expensive/noisy; LuxCore mentioned as easier physically-correct path.
- Practical cue: if spectrum is visible in object but not on receiver, lighting path/contrast is insufficient.

---

## 3) Concrete mapping to AGOT glass cube scene

## Change first (highest ROI)
1. **Lighting contrast pass first**
   - Introduce one dominant narrow key (or beam-like source) aimed to produce readable exit/refraction.
   - Reduce ambient fill so spectral events are not washed out.
   - Keep background/floor darker and simpler for separation.

2. **Shader architecture split**
   - Move cube material to explicit refraction+glossy Fresnel mix.
   - Expose controls: base IOR, dispersion amount, reflection roughness, refraction roughness.

3. **Replace RGB triplet hack with continuous spectrum mapping**
   - Implement spectrum ramp + remapped IOR distribution (curved bias toward blue).
   - Goal: eliminate discrete red/green/blue “gaps” and get continuous rainbow transitions on edges/caustics.

4. **Caustic readability tuning**
   - Ensure receiver plane/material supports seeing projected color.
   - Increase transmission/refraction bounces as needed (performance permitting).

5. **Post subtlety**
   - Add only slight bloom on brightest spectral highlights; avoid heavy chromatic post that fakes/doubles dispersion.

## Do NOT touch yet (protect current look stability)
- Don’t overhaul camera animation/composition until shader+lighting are physically behaving.
- Don’t add heavy fog/volumetrics before caustics/dispersion read cleanly.
- Don’t crank roughness to “cinematic softness” early; it hides whether dispersion is actually working.
- Don’t stack post chromatic aberration on top of shader dispersion during lookdev (creates misleading result).

## Suggested AGOT order of operations
1. lock one hero angle
2. lock key/fill contrast
3. implement continuous dispersion shader
4. validate on neutral dark receiver
5. then reintroduce creative color grade and motion

---

## 4) Practical target values to start from (for AGOT cube)
- Base IOR: **1.45** start point
- Dispersion spread: small-medium first, then push
- Refraction roughness: **0.0–0.02**
- Reflection roughness: **0.02–0.08**
- Light ratio target: key dominant, fill at roughly **25% or less** of key influence
- Post bloom: minimal, highlight-only

---

## 5) Bottom line
This video’s strongest transferable lesson is not “more rainbow”; it is **control structure**:
- physically-plausible dispersion distribution,
- strict lighting contrast,
- and minimal post.

For AGOT glass cube, the fastest win is: **rebuild material control + key/fill contrast before touching art direction polish.**