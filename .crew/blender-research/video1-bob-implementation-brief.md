# Video 1 — Bob Implementation Brief (Transcript-First)

**Source video:** https://youtu.be/lEPZ1IUkoB4?si=lDpbZ1i7hsiA_ifQ  
**Method:** Built from full captions + only explicit visual cues stated/shown in narration (no speculative lookdev).

---

## 1) Core Visual Thesis (what actually matters)

This tutorial’s real contribution is **continuous-looking glass dispersion** in Blender by replacing 3-channel RGB split with a **micro-fragmented spectral mapping** pipeline:

1. **Separate reflection and refraction** (Refraction BSDF + Glossy BSDF driven by Fresnel) instead of relying on one Principled block.
2. Drive refraction IOR variation via a **tiny-scale white-noise indexed color spectrum** (not isolated RGB layers).
3. Map that 0–1 spectrum into an IOR range using **Map Range** and shape physically plausible nonlinearity with **RGB Curves** (blue bends more, red less).
4. Keep glass neutral at baseline by choosing a spectrum that averages to white; allow tint as a controlled multiply stage.

What matters visually: **no large RGB gaps**, a continuous prismatic spread, and stronger blue-side deviation than red-side deviation.

---

## 2) Lighting Recipe (ratios, placement logic, failure modes)

### Placement / logic (from transcript cues)
- Use a **near-collimated / almost straight beam emitter** aimed through/along glass edges to reveal dispersion clearly.
- Keep scene lighting minimal while validating shader behavior; this is effectively a **beam-through-medium test rig**.
- In Cycles, expect expensive renders for clean caustic/prismatic read (author reports ~40 min per still in their setup).

### Practical ratio guidance for AGOT tests
- **Key beam dominance:** 1.0 (beam) : 0.05–0.20 (ambient/fill) as starting range.
- Goal: beam defines the dispersion; fill only preserves silhouette and prevents crushed blacks.

### Failure modes
- **Too broad/soft key** → dispersion washes out, reads as generic chromatic fringe.
- **Too much fill/HDRI** → rainbow contrast collapses; hard to evaluate shader correctness.
- **Insufficient samples/incorrect Cycles quality settings** → noisy or fake-looking bands.
- **Beam not intersecting refractive geometry effectively** → weak prism effect despite correct shader.

---

## 3) Material Recipe (glass behavior priorities, what to avoid)

### Priorities
1. **Dual-lobe structure:** Refraction and reflection independently controllable.
2. **Fresnel-coupled mix:** physically sensible angle response.
3. **Continuous spectral proxy:** color ramp/spectrum + white-noise fragmentation at tiny scale.
4. **IOR control model:**
   - `IOR_base` (glass baseline)
   - `Dispersion_amount` (spread amplitude)
   - Map range converts spectral index to IOR band.
5. **Nonlinear dispersion:** RGB Curves so blue refracts most, red least.
6. **Neutral baseline:** choose spectrum whose mean is white to avoid unintended global tint.
7. **Optional tint stage:** multiply output color after neutralization.

### What to avoid
- Stacked RGB glass shaders with offset IOR as final solution (causes visible channel gaps under strong dispersion).
- Arbitrary spectrum palettes that do not average to white (creates dirty/unpleasant cast).
- Linear-only wavelength mapping (misses real-world curved behavior).
- One-knob Principled-only setup when you need independent refraction/reflection control.

---

## 4) Composition / Camera Rules relevant to AGOT

For AGOT product-style shots (watch/ornament-like hero object), use composition to **prove dispersion, not hide it**:

1. Favor **3/4 macro angles** where beam enters and exits visible thickness/edges.
2. Include at least one shot with **dark/neutral background** for rainbow separation readability.
3. Keep FOV moderate (avoid ultra-wide distortion that fakes dispersion scale).
4. Lock camera for shader validation passes; move lights/beam first, camera second.
5. Require one controlled comparison frame:
   - `Dispersion_amount = 0`
   - `Dispersion_amount = target`
   same camera + same lights.

Reject compositions where dispersion is only visible as fringe on silhouettes and not as volumetric/through-glass behavior.

---

## 5) Stepwise Execution Plan (Blender)

1. **Build validation scene**
   - Simple refractive test object + dark backdrop + beam emitter.
2. **Base shader architecture**
   - Refraction BSDF + Glossy BSDF; Fresnel as mix factor.
3. **Create spectral index driver**
   - White Noise Texture feeding a custom color spectrum ramp.
   - Scale to very small pattern size until macro patching disappears.
4. **Set neutral spectrum**
   - Tune ramp so average output is white at equal IOR.
5. **Map to IOR space**
   - Map Range from 0–1 spectrum index to `IOR_base … IOR_base+Dispersion_amount` (or equivalent spread logic).
6. **Apply nonlinear correction**
   - RGB Curves to push stronger blue-side refraction and gentler red-side shift.
7. **Expose controls in node group**
   - Reflection color/roughness
   - Refraction color/roughness
   - IOR base
   - Dispersion amount
8. **Add optional tint multiply**
   - Post-spectrum color multiply for artistic tint, default neutral.
9. **Cycles quality pass**
   - Increase quality/sampling until noise doesn’t masquerade as dispersion detail.
10. **AGOT framing pass**
   - Shoot fixed camera validation set (off/on dispersion, same lighting).

---

## 6) Hard Acceptance Gates + Reject Conditions

### Must-pass gates
1. **Continuity gate:** At target dispersion, no obvious RGB channel gaps/banding islands in primary prismatic region.
2. **Neutrality gate:** With tint disabled and equalized IOR, glass reads neutral (no persistent magenta/green cast).
3. **Directionality gate:** Blue-side deflection visibly exceeds red-side deflection.
4. **Control gate:** `IOR_base` and `Dispersion_amount` independently and predictably affect look.
5. **Repeatability gate:** Same scene/settings reproduce same dispersion pattern behavior across rerenders.

### Immediate reject conditions
- Rainbow effect appears only as post-like edge fringing.
- Strong dispersion introduces black/empty gaps between color bands.
- Shader requires color-tint compromise to “look right” (neutral baseline broken).
- Reflection/refraction cannot be tuned separately.
- Noise or fireflies dominate read such that dispersion cannot be judged.

---

## Transcript-grounded Notes
- Author explicitly contrasts this method against standard RGB-split glass and calls out gap artifacts at higher dispersion.
- Author emphasizes nonlinear wavelength behavior (curved response, blue refracts more).
- Author reports Cycles proof-of-concept quality cost as high per-frame and still recommends LuxCore for easiest realistic dispersion.
- Eevee compatibility is mentioned via the same chromatic-aberration-style logic / shader adaptation.
