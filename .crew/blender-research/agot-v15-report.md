# AGOT v15 SOTA Dispersion Report

## Pass summary
Implemented **Cycles 7-band physically-informed dispersion approximation** from the locked baseline, via Blender MCP bridge only.

- Source baseline: `.crew/blender-research/agot-v07-baseline-lock.blend`
- Output blend: `.crew/blender-research/agot-v15-sota.blend`
- Method: Cycles multi-band glass lobes (7 wavelength bands), Cauchy-driven IOR values, no fake RGB prism light rig.

## Composition lock verification
From `.crew/blender-research/agot-v15-lock-values.json`:

- Camera position: `[0.2, 9.7, 15.0]` ✅
- Look target: `[0.0, -0.8, 1.0]` ✅
- Cube center: `[0.0, 0.6, 1.0]` ✅
- Cube yaw: `45.0°` ✅

All composition lock checks passed.

## Dispersion implementation details
- Renderer: **Cycles**
- Band centers (nm): `430, 470, 510, 550, 590, 630, 670`
- IOR model: Cauchy `n(λ) = A + B/λ²` (λ in µm), with:
  - `A = 1.5046`
  - `B = 0.00420`
- Final-pass IORs (blue→red):
  - `1.5273, 1.5236, 1.5207, 1.5185, 1.5167, 1.5152, 1.5140`
- Weighted 7-lobe additive shader stack + subtle volume absorption.
- Lighting uses hard white key + gentle fill/rim for readable caustics.
- Explicitly removed/avoided `Prism_*` and `PrismCastRig` fake RGB light approach.

## Deliverables generated
- `.crew/blender-research/agot-v15-sota.blend`
- `.crew/blender-research/renders/agot-v15-final-A.png`
- `.crew/blender-research/renders/agot-v15-final-B.png`
- `.crew/blender-research/renders/agot-v15-dispersion-proof.png`
- `.crew/blender-research/renders/agot-v15-baseline-vs-final.png`
- `.crew/blender-research/agot-v15-report.md`

## Notes
- Due bridge path behavior, renders were written from Blender to `C:/Users/Public/` then copied into workspace `renders/` paths.
- No git edits were made.