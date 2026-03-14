# AGOT v13 — Transcript-grounded dispersion pass (from brief)

PASS: **true**

## Source of truth
- `.crew/blender-research/video1-bob-implementation-brief.md`

## Hard constraints check
- AGOT v07 locked composition preserved: **PASS**
  - Camera: `(0.2, 9.7, 15.0)`
  - Look target Empty: `(0.0, -0.8, 1.0)`
  - Cube center: `(0.0, 0.6, 1.0)`
  - Cube yaw: `45.000001°`
- No fake RGB hack rig: **PASS**
  - Removed/avoided prism/RGB pin-light split approach
- Transcript-grounded lighting/material behavior: **PASS**

## Implemented (brief-aligned)
1. **Lighting hierarchy**
   - Dominant near-collimated key beam
   - Minimal fill (~5–20% range behavior)
   - Subtle rim for silhouette separation
   - Dark receiver planes retained for readable spectral cast

2. **Material architecture**
   - Split reflection/refraction control:
     - `Glossy BSDF` (reflection lobe)
     - `Refraction BSDF` path (refraction lobe)
     - `Fresnel` mix for angle-coupled behavior
   - Continuous spectral proxy:
     - Micro-scale `Noise Texture` + spectrum ramp
     - `RGB Curves` nonlinear shaping (blue weighted stronger)
     - `Map Range` to IOR band for dispersion control
   - Neutral baseline tint behavior retained (no forced magenta/green cast)

3. **Proof set**
   - Balanced finals A/B
   - Stronger dispersion proof frame
   - Before-vs-after comparison frame

## Deliverables generated
- `.crew/blender-research/agot-v13-from-brief.blend`
- `.crew/blender-research/renders/agot-v13-final-A.png`
- `.crew/blender-research/renders/agot-v13-final-B.png`
- `.crew/blender-research/renders/agot-v13-dispersion-proof.png`
- `.crew/blender-research/renders/agot-v13-before-vs-after.png`
- `.crew/blender-research/agot-v13-report.md`

## Notes
- Blender bridge save/render path quirk was encountered (nested `.crew/blender-research/.crew/blender-research/...` output); final required artifacts were normalized to requested paths.
