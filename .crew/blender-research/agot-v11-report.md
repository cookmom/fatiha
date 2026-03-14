# AGOT v11 — Video1 First-Reference Implementation Report

PASS: **true**

## Locked Composition Validation (tolerance: position <= 0.001, yaw <= 0.1°)
- Camera position `(0.2, 9.7, 15.0)`: **PASS**
  - actual: `[0.20000000298023224, 9.699999809265137, 15.0]`
- Camera look target `(0, -0.8, 1.0)`: **PASS**
  - actual: `[1.4901161193847656e-08, -0.8000011444091797, 1.0]`
- Cube center Y `0.6`: **PASS**
  - actual: `0.6000000238418579`
- Cube yaw `45°`: **PASS**
  - actual: `45.00000125223908°`

## Video1 Lessons Implemented
1. **Dominant narrow key + low fill + dark receiver**
   - Replaced baseline light with a narrow **Spot key** as the dominant source.
   - Added very low-energy cool fill and subtle rim.
   - Added a dark receiver plane material for cast visibility and contrast.

2. **Physically coherent glass base**
   - Cube material set to transmissive glass behavior (Transmission 1.0, IOR 1.52, low roughness, Fresnel/specular coherent setup).

3. **Visible spectral cast proof render**
   - Added proof pass with tighter, stronger key to force clear color separation on receiver.

## Output Files
- `.crew/blender-research/agot-v11-video1.blend`
- `.crew/blender-research/renders/agot-v11-final-A.png`
- `.crew/blender-research/renders/agot-v11-final-B.png`
- `.crew/blender-research/renders/agot-v11-dispersion-proof.png`
- `.crew/blender-research/renders/agot-v11-baseline-vs-final.png`
