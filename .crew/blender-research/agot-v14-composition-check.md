# AGOT v14 Composition Enforcer Check

## Scope
- Baseline lock source: `agot-v07-lock-values.json`
- Required target: **v14 Blender bridge scene dump** (`v14` lock/scene JSON)
- Lock dimensions enforced: camera position, camera look target, cube center Y, cube yaw
- Tolerance: ±0.001 per scalar component

## Baseline (v07)
- camera_position: `[0.20000000298023224, 9.699999809265137, 15.0]`
- camera_look_target: `[0.0, -0.800000011920929, 1.0]`
- cube_center: `[0.0, 0.6000000238418579, 1.0]`
- cube_yaw_degrees: `45.00000125223908`

## v14 Dump Discovery
- ❌ No v14 scene dump found in `.crew/blender-research/` matching expected patterns:
  - `agot-v14-lock-values.json`
  - `agot-v14-*.json`
  - `*v14*lock*.json`
  - `*v14*scene*.json`
  - `*v14*dump*.json`

## Enforcement Result
**FAIL** — cannot validate AGOT composition lock for v14 because required Blender bridge v14 scene dump artifact is missing.

### Why this is a hard fail
- Composition enforcer must compare actual v14 scene values against v07 baseline.
- Missing v14 dump means lock integrity is unprovable and therefore rejected.

## Context (latest non-v14 lock dumps, informational only)
- `agot-v08-lock-values.json`: PASS (Δcam=[0.0, 0.0, 0.0], Δlook=[0.0, 0.0, 0.0], ΔcubeY=0.0, Δyaw=0.0)
- `agot-v11-lock-values.json`: PASS (Δcam=[0.0, 0.0, 0.0], Δlook=[1.4901161193847656e-08, 1.1324882507324219e-06, 0.0], ΔcubeY=0.0, Δyaw=0.0)
- `agot-v12-lock-values.json`: PASS (Δcam=[0.0, 0.0, 0.0], Δlook=[0.0, 0.0, 0.0], ΔcubeY=0.0, Δyaw=0.0)
