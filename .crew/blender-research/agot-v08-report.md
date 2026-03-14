# AGOT v08 Improved Report

PASS: **true**

## Locked Composition Validation (tolerance: position <= 0.001, yaw <= 0.1°)
- Camera position target `(0.2, 9.7, 15.0)`: **PASS**
  - actual: `[0.20000000298023224, 9.699999809265137, 15.0]`
- Camera look target `(0, -0.8, 1.0)`: **PASS**
  - actual: `[0.0, -0.800000011920929, 1.0]`
- Cube center Y target `0.6`: **PASS**
  - actual: `0.6000000238418579`
- Cube yaw target `45°`: **PASS**
  - actual: `45.00000125223908°`

## Improvements Applied (allowed-only)
1. **Lighting hierarchy polish (key/fill/rim):**
   - Rebalanced warm key, cool fill, and added controlled rim + top kicker for clearer edge definition and depth layering.
2. **Glass realism improvement:**
   - Converted cube to physically plausible transmissive glass setup (Transmission 1.0, IOR 1.52, low roughness for controlled spec/refraction balance).
3. **Subtle readable spectral cast:**
   - Added grazing-angle spectral tint via Layer Weight + ColorRamp, kept intentionally subtle for readability.

## Visual PASS Evidence
- Baseline lock render vs improved render confirms visible quality uplift while preserving composition:
  - stronger silhouette separation
  - clearer glass read (reflections + transmission)
  - subtle but present cool spectral edge cast

## Outputs
- `.crew/blender-research/agot-v08-improved.blend`
- `.crew/blender-research/renders/agot-v08-improved-A.png`
- `.crew/blender-research/renders/agot-v08-improved-B.png`
- `.crew/blender-research/renders/agot-v08-baseline-vs-improved.png`
