# Lookdev Research Report — Premium Dichroic Ka'bah Cube

## Mission Context
- Object must remain Ka'bah proportions: **1.05 × 1.5 × 1.2**
- Keep sacred/elegant tone (no gimmicky sci-fi clutter)
- Target: **60fps on iPhone 14+**
- Existing tech: custom dichroic shader (per-channel IOR) + **3-pass FBO pipeline**

---

## Visual Reference Scan (web)

## 1) Anderson Mancini — GemGPU / WebGPU gem renderer
- Ref: https://www.youtube.com/watch?v=H4kB_mjNWoI  
- Ref (search snippet): https://x.com/Andersonmancini/highlights (mentions custom refraction + SSR + SSGTAO)
- Why it looks premium:
  - Strong **energy conservation** feel: bright facets, dark valleys, no flat milky glass
  - Controlled **facet contrast** (hard spec lines + deep internal darkness)
  - Reflections from adjacent surfaces (metal/gem interaction) increase perceived realism
- Premium signal vs beginner:
  - Beginner glass = uniform transparency
  - Premium gem = **structured internal contrast** + purposeful highlight choreography

## 2) r/threejs — subsurface refraction shader showcase
- Ref: https://www.reddit.com/r/threejs/comments/1huapi3/i_created_a_simple_subsurface_refraction_shader/
- Demo/source linked in thread: https://prizemlenie.github.io/subsurface-refraction-shader/ and https://github.com/prizemlenie/subsurface-refraction-shader
- Why it looks premium:
  - Introduces **internal volumetric softness** instead of hollow plastic look
  - Convex forms show richer body due to diffusion/refraction blend
- Premium signal vs beginner:
  - Beginner glass is all shell, no body
  - Premium crystal has **interior life** (light appears to travel through substance)

## 3) Swarovski Award (Adjaye Associates)
- Ref: https://www.adjaye.com/work/swarovski-award/
- Key extracted note: optical effects achieved through geometry amplifying refraction/distortion/reflection; six-sided taper + concave wave-cut surfaces
- Why it looks premium:
  - Geometry is doing the heavy lifting (not random noise)
  - **Concave/convex micro-facet logic** yields controlled refraction events
- Premium signal vs beginner:
  - Beginner = decorative internals without optical logic
  - Premium = every cut has a lighting purpose

## 4) Chihuly installation references
- Ref: https://www.chihuly.com/work/chandeliers
- Ref: https://crystalbridges.org/news-room/crystal-bridges-presents-chihuly/
- Why it looks premium:
  - Large-scale glass reads through **silhouette rhythm** + color hierarchy
  - High-end feel comes from curated asymmetry, not random complexity
- Premium signal vs beginner:
  - Beginner = too much uniform detail
  - Premium = **intentional focal hierarchy** and breathing negative space

## 5) Apple “Liquid Glass” design language
- Ref: https://www.apple.com/newsroom/2025/06/apple-introduces-a-delightful-and-elegant-new-software-design/
- Why it looks premium:
  - Real-time spec highlights respond to movement but remain subtle
  - Tight control of translucency and edge clarity; never noisy
- Premium signal vs beginner:
  - Beginner = effects turned to 100
  - Premium = **restraint + consistency**

## 6) Luxury watch sapphire crystal cues
- Ref: https://www.botta-design.de/en/blogs/wissen/sapphire-crystal-glass-and-anti-reflective-coating
- Why it looks premium:
  - Sapphire reads as nearly invisible head-on, strong at grazing angles
  - AR-coated surfaces preserve dial clarity while keeping selective edge glint
- Premium signal vs beginner:
  - Beginner = constant mirror glare everywhere
  - Premium = **angle-dependent reflection discipline**

## 7) Lalique sculpture direction (brand visual language)
- Ref: https://us.lalique.com/collections/sculptures
- Why it looks premium (observed across Lalique style language):
  - Frequent **frosted vs polished contrast zones**
  - Soft body + razor edge interplay creates luxury tactility
- Premium signal vs beginner:
  - Beginner = single finish across object
  - Premium = **finish layering** (matte diffusion + polished specular edges)

## 8) Islamic crystal chandelier cues (Sheikh Zayed context)
- Ref: https://www.szgmc.gov.ae/en/islamic-architecture/the-chandeliers (indexable snippet via search)
- Ref: https://en.wikipedia.org/wiki/Sheikh_Zayed_Grand_Mosque
- Why it looks premium/sacred:
  - Repetition with geometry discipline; ornament has order and reverence
  - Crystal/glass is integrated with **gold, rhythm, and symmetry**
- Premium signal vs beginner:
  - Beginner = flashy rainbow chaos
  - Premium = **composed luminosity** with symbolic structure

## 9) Behance chromatic glass pack (trend signal)
- Ref: https://www.behance.net/gallery/227985783/Chromatic-Glass-Shapes-162-Iridescent-3D-Elements
- Why it looks good:
  - Subtle scratches + iridescent finish + high-res gradients
- Why to be careful:
  - Easily slides into “poster asset” vibe if overused

---

## What Actually Makes Glass Look Expensive (distilled)

1. **Edge intelligence**
   - Strongest highlights on silhouette/grazing angles
   - Broad faces stay cleaner and quieter

2. **Internal depth with hierarchy**
   - 1–2 dominant internal events, not many competing ones
   - Darkness is as important as brightness (contrast creates perceived density)

3. **Color absorption, not just tint**
   - Premium crystal color emerges with thickness/path length
   - Flat RGBA tint screams beginner

4. **Environmental story**
   - High-end glass always reflects a curated world (softboxes, architectural bands, controlled darks)

5. **Micro-imperfection discipline**
   - Extremely subtle anisotropic wipe, hairline polish marks, tiny surface waviness
   - If visible at first glance, it’s too much

6. **Material layering**
   - Polished + diffused areas in deliberate zones
   - Single uniform perfect smoothness feels CG-cheap

---

## Ranked Proposals (implementable in your current 3-pass FBO)

## Proposal 1 — **“Sacred Edge Halo” Fresnel Architecture**
**Reference anchor:** Apple Liquid Glass + luxury sapphire crystals  
**Concept:** Keep main faces calm/clear; concentrate premium energy on controlled edge halos and corner spectral flares.

**Technique (FBO-friendly):**
- Pass A (already): scene capture without cube
- Pass B: backface normal/depth for thickness approximation
- Pass C shader:
  - strong view-dependent Fresnel remap focused at high grazing angles
  - per-channel IOR offset only near silhouette bands (not full-face)
  - optional thin AR-like suppression on near-normal incidence

**Why this upgrades look:**
- Stops the “everything sparkles equally” beginner look
- Creates watch-grade discipline: quiet center, expensive edges

**Difficulty:** 2/5  
**Visual Impact:** 5/5  
**Mobile risk:** Low

---

## Proposal 2 — **“Optical Core” (one internal caustic spine, no slabs/wires)**
**Reference anchor:** Swarovski Adjaye trophy (geometry-driven refraction)  
**Concept:** Add one internal optical event: a subtle central vertical refractive spine/gradient field that bends light differently through cube center.

**Technique (FBO-friendly):**
- No visible inner mesh needed
- In refraction shader, modulate distortion using analytic field (distance to centerline + height weighting)
- Increase chromatic separation only within this spine volume
- Keep effect soft and monolithic

**Why this upgrades look:**
- Adds “cut-crystal intelligence” without ugly internal geometry
- Feels intentional and architectural, not decorative

**Difficulty:** 3/5  
**Visual Impact:** 5/5  
**Mobile risk:** Low–Medium

---

## Proposal 3 — **Lalique Finish Split (Polished edges + whisper-frost body)**
**Reference anchor:** Lalique frosted/polished language  
**Concept:** Body receives micro-diffusion; edges/corners remain highly polished.

**Technique (FBO-friendly):**
- Single material, spatially varying roughness in shader:
  - edge mask from normal/curvature proxy -> roughness near 0
  - broad face zones -> roughness 0.03–0.07
- Very subtle anisotropic micro-scratch normal noise at ultra-low amplitude

**Why this upgrades look:**
- Introduces tactile realism and luxury craft feel
- Prevents toy-like perfect plastic sheen

**Difficulty:** 3/5  
**Visual Impact:** 4/5  
**Mobile risk:** Low

---

## Proposal 4 — **Curated Reflection Rig (studio bands, not random HDRI)**
**Reference anchor:** high-end product/watch photography + Chihuly installation contrast discipline  
**Concept:** Build a dedicated environment with 2–3 large soft light bands + deep dark gaps to sculpt reflection rhythm.

**Technique (FBO-friendly):**
- Keep current passes; change only reflected/refracted scene content
- Use lightweight emissive cards / gradient dome instead of heavy HDR where possible
- Position bands to align with Ka'bah verticality (sacred compositional stability)

**Why this upgrades look:**
- Premium look is mostly about what glass sees
- Makes every rotation read intentional and elegant

**Difficulty:** 2/5  
**Visual Impact:** 4/5  
**Mobile risk:** Very low

---

## Proposal 5 — **Sacred Lattice Caustic Projection (very subtle floor-only)**
**Reference anchor:** Islamic chandelier rhythm + mosque geometric order  
**Concept:** Introduce a restrained geometric caustic motif projected beneath cube (8-point/star-inspired, very soft), no flashy rainbow blast.

**Technique (FBO-friendly):**
- Reuse pass outputs to derive a low-frequency projected light texture
- Apply only on ground plane under cube with low opacity/additive clamp
- Animate minimally (slow shimmer tied to camera or light drift)

**Why this upgrades look:**
- Embeds Islamic design language without literal ornament on cube surface
- Adds sacred atmosphere while preserving minimalist form

**Difficulty:** 4/5  
**Visual Impact:** 4/5  
**Mobile risk:** Medium (must keep texture resolution modest)

---

## Priority Order (recommended)
1. **Proposal 1 (Sacred Edge Halo)** — biggest quality jump, lowest risk
2. **Proposal 2 (Optical Core)** — solves “beginner” perception directly
3. **Proposal 4 (Curated Reflection Rig)** — multiplies quality of everything else
4. **Proposal 3 (Lalique Finish Split)** — adds premium tactility
5. **Proposal 5 (Sacred Lattice Caustic)** — optional poetic layer

---

## Practical Performance Guidance (iPhone 14+)
- Prefer **one dominant hero effect** + two subtle support effects
- Keep additional sampling tight (avoid stacking many noisy refraction loops)
- Bias quality budget toward silhouette/edge zones (where audience reads luxury)
- Clamp additive glow under cube center to avoid white clip/plastic look

---

## Final Art Direction Verdict
The cube will look premium when we stop trying to “decorate inside it” and instead make it behave like **engineered crystal**: controlled edges, restrained internal optical hierarchy, and a curated reflection world.  
That is the gap between beginner glass and luxury sacred object.
