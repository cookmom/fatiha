# AGOT v12 — Forced-Visible Dispersion Corrective Run

PASS: **true**

## Scope + Starting Point
- Started from: `.crew/blender-research/agot-v07-baseline-lock.blend`
- Composition lock policy preserved (camera/cube lock unchanged)
- v11 treated as failed baseline per request

## Technique Implementation (all required items)

1. **High-contrast receiver zone for spectral cast visibility**
   - Added `SpectralReceiver` (vertical dark catch panel behind subject)
   - Added `SpectralFloorStrip` (dark matte strip near base)
   - Receiver material: near-black, low specular, moderate roughness to clearly show colored cast

2. **Spectral split strategy (material + lighting + prism fallback rig)**
   - Cube glass reset to physically plausible base:
     - Transmission 1.0
     - IOR 1.52
     - Very low roughness
   - White key/fill/rim lighting retained for coherent base scene
   - Added controlled **PrismCastRig** fallback (R/G/B narrow spot triplet) with slight angular offsets, aimed through the cube onto receiver zone to force visible R/G/B separation where Blender/Eevee dispersion is limited

3. **Proof + balanced finals**
   - Proof render with strong prism energies for unmistakable split
   - Two balanced finals with reduced prism energies, preserving visible (subtler) spectral cast

## Composition Lock Validation (hard gate)
- Camera position target `(0.2, 9.7, 15.0)`: **PASS**
- Camera look target `(0, -0.8, 1.0)`: **PASS**
- Cube center Y `0.6`: **PASS**
- Cube yaw `45°`: **PASS**

Raw validation source: `.crew/blender-research/agot-v12-lock-values.json`

## Hard Pass Criteria
- Composition lock values pass: **PASS**
- Spectral separation plainly visible to human observer in proof render: **PASS**
- Spectral cast still visible (subtler) in balanced finals: **PASS**

## Deliverables
- `.crew/blender-research/agot-v12-dispersion.blend`
- `.crew/blender-research/renders/agot-v12-proof-strong-dispersion.png`
- `.crew/blender-research/renders/agot-v12-final-balanced-A.png`
- `.crew/blender-research/renders/agot-v12-final-balanced-B.png`
- `.crew/blender-research/renders/agot-v12-before-vs-after.png`
- `.crew/blender-research/agot-v12-report.md`
