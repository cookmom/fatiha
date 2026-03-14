# AGOT v14 Notes — elegant dispersion pass

## Source
- Started from: `.crew/blender-research/agot-v07-baseline-lock.blend`
- Bridge used: `tools/blender-bridge.py` (Blender MCP TCP bridge)

## Objective
Produce believable, elegant dispersion while preserving the AGOT composition lock (camera, target, cube position/yaw).

## What changed

### 1) Composition lock preserved
- Camera location unchanged: `(0.2, 9.7, 15.0)`
- Look target unchanged: `(0.0, -0.8, 1.0)`
- Cube center unchanged: `(0.0, 0.6, 1.0)`
- Cube yaw unchanged: `~45°`

### 2) Removed fake RGB split-light approach
- Removed any `Prism_*` lights / `PrismCastRig` from prior dispersion approaches.
- No tri-light RGB cheat rig used for v14.

### 3) Material architecture (glass)
- Built a split reflection/refraction shader stack:
  - `Glossy BSDF` + `Refraction BSDF`
  - mixed with `Fresnel` for angle-coupled behavior
- Introduced continuous spectral proxy in material domain:
  - high-frequency `Noise Texture`
  - spectrum `Color Ramp` + `RGB Curves`
  - controlled IOR band via `Map Range` (mild in finals, wider in proof)
- Added subtle volume absorption to keep body elegant and avoid neon clipping.

### 4) Lighting hierarchy
- Dominant near-collimated key (`KeyWhite` spot)
- Low-level cool fill (`FillCool`)
- Subtle neutral rim (`RimNeutral`)
- Retained/used dark receivers for readable cast separation.

## Render outputs
- `.crew/blender-research/renders/agot-v14-A.png` (balanced)
- `.crew/blender-research/renders/agot-v14-B.png` (highlight/contrast variant)
- `.crew/blender-research/renders/agot-v14-dispersion-proof.png` (stronger proof frame)
- `.crew/blender-research/renders/agot-v14-before-after.png` (v07 baseline vs v14)

## Files delivered
- `.crew/blender-research/agot-v14.blend`
- `.crew/blender-research/agot-v14-notes.md`
- all required render PNGs listed above

## Technical note
Bridge path behavior on this host writes rendered stills reliably to Windows path (`C:/Users/Public/...`) then copied into workspace render targets. Scene and lock state are saved in `.crew/blender-research/agot-v14.blend`.
