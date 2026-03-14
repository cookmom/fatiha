# Blender Scene Blueprint — AGOT Glass Cube (Dispersion Upgrade)

## Goal
Rebuild the AGOT Three.js glass-cube hero shot in Blender with stronger chromatic dispersion, cleaner composition, and physically plausible floor interaction, while staying reproducible for staging lookdev.

---

## 0) Environment & Control Status

### Blender MCP endpoint probe (port 9877)
- TCP connectivity to `127.0.0.1:9877`: **reachable**
- HTTP probe (`/` and `/health`): **no response (timeout)**
- Result: **Endpoint appears open but not controllable with available protocol/tooling from this environment.**

### Command log
```bash
# Run in /home/openclaw-agent/.openclaw/workspace
curl -sS -m 2 http://127.0.0.1:9877/
curl -sS -m 2 http://127.0.0.1:9877/health
nc -zv -w 1 127.0.0.1 9877
```
Observed:
- `curl` timed out for both paths.
- `nc` reported successful TCP connect.

### Artifact paths
- No MCP-controlled Blender session could be executed.
- No automated `.blend`/render exports generated from this environment.

---

## 1) Scene Setup (reproducible baseline)

## Units / scale
- **Unit system:** Metric
- **Unit scale:** 1.0
- **Cube target size:** 1.20 m edge length
- **World origin:** center of cube at `(0, 0, 0.60)` so cube rests just above floor (with tiny gap/soft contact)

## Collections
1. `COL_CUBE`
2. `COL_FLOOR`
3. `COL_LIGHTS`
4. `COL_CAMERA`
5. `COL_HELPERS`

## Geometry
- Cube:
  - Add Cube, dimensions `1.2, 1.2, 1.2`
  - Bevel modifier:
    - Width `0.015 m`
    - Segments `6`
    - Limit Method: Angle
  - Weighted Normal modifier ON
- Floor:
  - Plane size `24 m`
  - Subdivision optional (for micro variation), 100x100 if using displaced roughness

---

## 2) Camera Targets (composition-first)

## Camera A — Hero (default)
- **Lens:** `85 mm`
- **Sensor:** 36 mm
- **Position:** `(3.80, -3.20, 2.35)`
- **Rotation (XYZ Euler):** `(63.0°, 0.0°, 44.5°)`
- **Focus object:** Empty at cube center `(0,0,0.60)`
- **DOF F-stop:** `2.8`
- **Focus distance:** auto via focus object
- **Frame:** 4:5 or 9:16 deliverable, cube occupying ~55–65% frame height

## Camera B — Product clean alt
- **Lens:** `65 mm`
- **Position:** `(3.10, -2.90, 1.95)`
- **Rotation:** `(61.0°, 0.0°, 40.0°)`
- DOF F-stop `4.0` (cleaner edge readability)

## Framing rules
- Keep horizon low or hidden.
- Preserve negative space in top-left quadrant for title/clock overlay if needed.

---

## 3) Lighting Rig (Key / Fill / Rim / Back / Practical)

Render engine target below is Cycles. Values tuned for realistic glass plus intentional stylization.

## Light 1 — KEY (Area)
- Type: Area (Rectangle)
- Size: `2.2 m x 1.6 m`
- Power: `1800 W`
- Color temperature: `5600K`
- Position: `(2.70, -2.10, 2.80)`
- Rotation: points to cube center
- Purpose: primary specular shape and major refraction energy

## Light 2 — FILL (Area)
- Type: Area (Rectangle)
- Size: `3.2 m x 2.2 m`
- Power: `420 W`
- Color temperature: `7200K` (slightly cool)
- Position: `(-3.00, -1.20, 2.20)`
- Purpose: open shadows while keeping contrast

## Light 3 — RIM (Spot)
- Type: Spot
- Power: `950 W`
- Color temperature: `9000K` subtle cyan bias
- Spot Size: `38°`
- Blend: `0.24`
- Position: `(-1.60, 3.20, 2.50)`
- Purpose: edge separation + dispersion sparkle on bevels

## Light 4 — BACK KICK (Area)
- Type: Area
- Size: `1.4 m`
- Power: `680 W`
- Color temperature: `4300K` warm-neutral
- Position: `(0.20, 3.60, 1.80)`
- Purpose: rear-face readability and volume cue

## Light 5 — PRACTICAL GLOW (Emissive card)
- Plane at rear-left, invisible to camera but visible in reflections
- Emission strength: `12`
- Color: warm amber `#FFB066`
- Dimensions: `0.8 m x 1.8 m`
- Position: `(-2.4, 1.8, 1.3)`
- Purpose: cinematic reflection variation and color split against cool fill/rim

## World
- Strength: `0.08` (very low)
- HDRI optional: neutral studio HDRI at low intensity (`0.15`) for richer reflections

---

## 4) Glass Material Node Setup (dispersion-forward)

Use **Cycles** with dispersion support.

## Material: `MAT_Glass_Dispersion`

### Core node graph
1. **Glass BSDF** (main body)
   - IOR: `1.52`
   - Roughness: `0.015`
2. **Principled BSDF** (edge energy + slight imperfections)
   - Transmission: `1.0`
   - Roughness: `0.03`
   - IOR: `1.52`
   - Specular: `0.5`
   - Coat: `0.0`
3. Mix Shader (Glass + Principled)
   - Factor: `0.35` (favor Glass)
4. **Volume Absorption**
   - Color: very pale teal `#DFFBFF`
   - Density: `0.04`
5. **Volume Scatter** (very subtle)
   - Color: white
   - Density: `0.003`
   - Anisotropy: `0.0`
6. Material Output
   - Surface: mixed surface
   - Volume: Absorption + Scatter (Add Shader)

### Dispersion controls
- Render Properties > Light Paths > **Transmission Bounces**: `16`
- Caustics:
  - Reflective caustics ON
  - Refractive caustics ON
- Filter Glossy: `0.2`
- If fireflies appear, clamp indirect slightly (`2.0`)

### Imperfection masks (optional but recommended)
- Noise Texture (scale `350`, detail `2`) -> Bump (strength `0.015`, distance `0.001`) -> Normal input
- Keeps cube from CG-perfect sterility

---

## 5) Floor Material (response under glass)

Material: `MAT_Floor_Satin`
- Principled BSDF:
  - Base Color: neutral charcoal `#1A1C20`
  - Roughness: `0.34`
  - Specular: `0.45`
  - Metallic: `0.0`
- Clearcoat: `0.08`
- Clearcoat Roughness: `0.25`
- Very subtle noise roughness breakup:
  - Noise(scale `14`) -> ColorRamp (soft) -> Roughness add/multiply

Goal behavior:
- Should show soft cube reflection + colored dispersion streak hints near contact zone.
- Avoid mirror floor; preserve premium satin look.

---

## 6) Render Settings (Cycles)

- Device: GPU
- Samples:
  - Viewport: `128`
  - Final: `1024` (hero still), `256–512` (animation previz)
- Denoise: OpenImageDenoise (final pass)
- Light Paths:
  - Total: `14`
  - Diffuse: `4`
  - Glossy: `6`
  - Transmission: `16`
  - Transparent: `8`
- Caustics: ON (reflective + refractive)
- Color Management:
  - View Transform: `Filmic`
  - Look: `Medium High Contrast`
  - Exposure: start `+0.45`
  - Gamma: `1.0`

---

## 7) Compositor Settings (final polish)

Node chain:
1. Render Layers
2. Denoise (if not done in render)
3. Glare (Fog Glow)
   - Threshold: `1.0`
   - Size: `6`
   - Mix: `-0.85` (subtle)
4. Lens Distortion
   - Distort: `0.008`
   - Dispersion: `0.012`
5. Color Balance (Lift/Gamma/Gain)
   - Lift slightly cool (`~0.98, 0.99, 1.02`)
   - Gain slightly warm (`~1.02, 1.00, 0.98`)
6. Vignette (Ellipse mask + blur + mix multiply)
   - Strength: `0.08`
7. Composite + File Output

Deliverables:
- 16-bit PNG or EXR master
- sRGB 8-bit PNG/JPG derivatives for web previews

---

## 8) Manual Build Procedure (fallback workflow)

1. Start new Blender file, switch to Cycles GPU.
2. Set units and world scale exactly as above.
3. Create cube + bevel + weighted normal.
4. Create floor and assign satin floor material.
5. Build glass material with surface + volume stack.
6. Place Camera A and set DOF target empty.
7. Add five-light rig with exact values above.
8. Enable caustics + light-path values.
9. Render test at 50% resolution, 128 samples.
10. Tune only exposure ±0.3 before touching light powers.
11. Render final at 1024 samples.
12. Apply compositor chain and export master + web derivatives.

---

## 9) QC Checklist
- [ ] Cube edges readable, not clipped by black crush.
- [ ] Visible but controlled chromatic split on high-contrast edges.
- [ ] Floor contact/reflection present but not mirror-like.
- [ ] No dominant fireflies in hero crop.
- [ ] Composition has intentional negative space for AGOT overlays.
