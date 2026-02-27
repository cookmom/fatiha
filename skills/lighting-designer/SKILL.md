---
name: lighting-designer
description: >-
  3D lighting design for Three.js scenes and product photography. Use when asked about:
  Three.js light types (DirectionalLight, SpotLight, PointLight, RectAreaLight, HemisphereLight),
  product photography lighting setups (soft box, rim, fill, accent), named lighting patterns
  (Rembrandt, butterfly, split, loop, broad, short), cinematic lighting (practical motivation,
  color temperature, contrast ratios), HDRI/environment maps, shadow configuration,
  color temperature (kelvin to hex), day/night cycles, tone mapping (ACES filmic, AgX, Reinhard),
  exposure control, bloom/glow post-processing, or any 3D scene lighting question.
---

# Lighting Designer

Design lighting setups for Three.js 3D scenes and product photography with physically-motivated, aesthetically compelling results.

## Core Workflow

1. **Understand the scene** — What's being lit (product, environment, character), mood, style
2. **Choose a lighting pattern** — Select from presets or named patterns below
3. **Configure lights** — Types, positions, intensities, colors, shadows
4. **Set tone mapping & exposure** — Match the desired look
5. **Add post-processing** — Bloom, glow, ambient occlusion as needed
6. **Optimize** — Balance quality vs performance for target platform

---

## Three.js Light Types Reference

### AmbientLight
Uniform omnidirectional light. No shadows. Use sparingly as base fill.
```js
const ambient = new THREE.AmbientLight(0xffffff, 0.15);
// Parameters: color, intensity
// No position needed — affects all objects equally
```

### HemisphereLight
Sky/ground gradient. Good for outdoor base lighting.
```js
const hemi = new THREE.HemisphereLight(
  0x87CEEB, // sky color
  0x362D1B, // ground color
  0.6       // intensity
);
// No shadows. Position Y-up for correct gradient direction.
```

### DirectionalLight
Parallel rays (simulates sun). Casts shadows.
```js
const dir = new THREE.DirectionalLight(0xffffff, 1.0);
dir.position.set(5, 10, 7);
dir.castShadow = true;
dir.shadow.mapSize.set(2048, 2048);
dir.shadow.camera.near = 0.5;
dir.shadow.camera.far = 50;
dir.shadow.camera.left = -10;
dir.shadow.camera.right = 10;
dir.shadow.camera.top = 10;
dir.shadow.camera.bottom = -10;
dir.shadow.bias = -0.0001;
dir.shadow.normalBias = 0.02;
// Target defaults to (0,0,0). Set dir.target.position for aim.
```

### PointLight
Omnidirectional from a point. Casts shadows (cube map, expensive).
```js
const point = new THREE.PointLight(0xff9944, 1.0, 20, 2);
// Parameters: color, intensity, distance (0=infinite), decay
// decay=2 is physically correct (inverse square)
point.position.set(0, 3, 0);
point.castShadow = true;
point.shadow.mapSize.set(1024, 1024);
```

### SpotLight
Cone of light. Casts shadows. Most versatile for product lighting.
```js
const spot = new THREE.SpotLight(0xffffff, 1.0, 30, Math.PI / 6, 0.5, 2);
// Parameters: color, intensity, distance, angle, penumbra, decay
// angle: max cone half-angle (radians). Math.PI/6 = 30°
// penumbra: 0 = hard edge, 1 = fully soft edge
spot.position.set(3, 5, 3);
spot.target.position.set(0, 0, 0);
spot.castShadow = true;
spot.shadow.mapSize.set(2048, 2048);
```

### RectAreaLight
Rectangular area emitter. Soft, diffuse light. **No shadows natively.**
Requires `RectAreaLightUniformsLib` import.
```js
import { RectAreaLightUniformsLib } from 'three/examples/jsm/lights/RectAreaLightUniformsLib.js';
RectAreaLightUniformsLib.init();

const rect = new THREE.RectAreaLight(0xffffff, 5, 4, 2);
// Parameters: color, intensity, width, height
rect.position.set(-3, 3, 3);
rect.lookAt(0, 0, 0);
// Simulates soft box, window, panel light
// Only works with MeshStandardMaterial / MeshPhysicalMaterial
```

---

## Light Positioning Formulas

### Spherical Coordinates for Light Placement
Place lights around a subject using angles:
```js
function placeLightSpherical(radius, elevationDeg, azimuthDeg) {
  const elev = THREE.MathUtils.degToRad(elevationDeg);
  const azim = THREE.MathUtils.degToRad(azimuthDeg);
  return new THREE.Vector3(
    radius * Math.cos(elev) * Math.sin(azim),
    radius * Math.sin(elev),
    radius * Math.cos(elev) * Math.cos(azim)
  );
}
// Key light: radius=5, elevation=30°, azimuth=45°
// Fill light: radius=5, elevation=15°, azimuth=-30°
// Rim/back: radius=5, elevation=20°, azimuth=160°
```

### Intensity vs Distance (Inverse Square)
With `decay=2` (physically correct):
- Doubling distance → ¼ intensity
- To maintain apparent brightness at distance `d`: `intensity = baseIntensity * (d/baseDistance)²`

### Light Size → Softness
Larger light source relative to subject = softer shadows:
- RectAreaLight: increase width/height for softer light
- SpotLight: increase penumbra (0→1) for softer cone edge
- Move light closer = effectively larger = softer

---

## Preset Lighting Rigs

### Studio (3-Point Classic)
Standard key/fill/rim setup. Clean, professional.
```js
// Key: 45° right, 30° up
const key = new THREE.SpotLight(0xFFF5E6, 2.0, 30, Math.PI/5, 0.6, 2);
key.position.set(3, 4, 3);
key.castShadow = true;

// Fill: 30° left, 15° up — half key intensity
const fill = new THREE.SpotLight(0xE6F0FF, 0.8, 30, Math.PI/4, 0.8, 2);
fill.position.set(-3, 2, 3);

// Rim/Back: behind subject, high
const rim = new THREE.SpotLight(0xFFFFFF, 1.5, 30, Math.PI/6, 0.4, 2);
rim.position.set(-1, 5, -4);
rim.castShadow = false;

// Base ambient
const ambient = new THREE.AmbientLight(0x404040, 0.2);
```

### Product Photography
Optimized for small objects on surface. Soft, even, highlight-controlled.
```js
// Main soft box (overhead, slightly forward)
const mainRect = new THREE.RectAreaLight(0xFFFFFF, 8, 3, 3);
mainRect.position.set(0, 4, 2);
mainRect.lookAt(0, 0, 0);

// Side fill (camera left, lower)
const sideFill = new THREE.RectAreaLight(0xF0F0FF, 4, 2, 2);
sideFill.position.set(-3, 2, 1);
sideFill.lookAt(0, 0, 0);

// Rim accent (behind, camera right)
const rimAccent = new THREE.SpotLight(0xFFFFFF, 2.0, 20, Math.PI/8, 0.3, 2);
rimAccent.position.set(2, 3, -3);
rimAccent.castShadow = true;

// Ground bounce
const ambient = new THREE.HemisphereLight(0xFFFFFF, 0xE0E0E0, 0.3);
```

### Cinematic (Moody)
High contrast, motivated by practical sources, warm/cool split.
```js
// Motivated key (warm practical — lamp, window)
const key = new THREE.SpotLight(0xFFAA66, 2.5, 25, Math.PI/7, 0.5, 2);
key.position.set(4, 3, 2);
key.castShadow = true;

// Cool fill (ambient bounce from environment)
const fill = new THREE.SpotLight(0x6688CC, 0.4, 25, Math.PI/3, 0.9, 2);
fill.position.set(-4, 2, 2);

// Edge/hair light
const edge = new THREE.SpotLight(0xFFDDCC, 1.8, 20, Math.PI/8, 0.3, 2);
edge.position.set(-2, 5, -4);

// Minimal ambient
const ambient = new THREE.AmbientLight(0x111122, 0.1);
```

### Architectural (Interior)
Even, realistic indoor lighting with area lights.
```js
// Ceiling panel lights
const ceiling1 = new THREE.RectAreaLight(0xFFF4E8, 6, 2, 2);
ceiling1.position.set(-2, 2.9, 0);
ceiling1.rotation.x = -Math.PI / 2;

const ceiling2 = new THREE.RectAreaLight(0xFFF4E8, 6, 2, 2);
ceiling2.position.set(2, 2.9, 0);
ceiling2.rotation.x = -Math.PI / 2;

// Window (cool daylight)
const window = new THREE.RectAreaLight(0xCCDDFF, 10, 3, 2.5);
window.position.set(-5, 2, 0);
window.rotation.y = Math.PI / 2;

const ambient = new THREE.HemisphereLight(0xFFF4E8, 0x806040, 0.2);
```

### Flat (UI / Showcase)
Even lighting, minimal shadows. Good for 360° product viewers.
```js
const front = new THREE.DirectionalLight(0xFFFFFF, 0.8);
front.position.set(0, 2, 5);

const back = new THREE.DirectionalLight(0xFFFFFF, 0.5);
back.position.set(0, 2, -5);

const left = new THREE.DirectionalLight(0xFFFFFF, 0.6);
left.position.set(-5, 2, 0);

const right = new THREE.DirectionalLight(0xFFFFFF, 0.6);
right.position.set(5, 2, 0);

const ambient = new THREE.AmbientLight(0xFFFFFF, 0.4);
// No shadows — maximum clarity
```

---

## Named Portrait Lighting Patterns

Apply these to 3D characters/busts or product "hero" angles:

| Pattern | Key Position | Shadow Characteristic | Mood |
|---------|-------------|----------------------|------|
| **Rembrandt** | 45° side, 45° up | Triangle of light on shadow-side cheek | Dramatic, classic |
| **Butterfly** | Directly above, centered | Butterfly shadow under nose | Glamorous, beauty |
| **Split** | 90° side, eye level | Half face lit, half dark | Dramatic, mysterious |
| **Loop** | 30-40° side, slightly above | Small nose shadow loops toward cheek | Natural, flattering |
| **Broad** | Key lights the side facing camera | Wider lit area | Makes face appear wider |
| **Short** | Key lights the side away from camera | Narrow lit area | Slimming, dramatic |

### Three.js Implementation (Rembrandt example)
```js
const key = new THREE.SpotLight(0xFFF0DD, 2.0, 20, Math.PI/6, 0.5, 2);
key.position.set(3, 3, 2); // 45° right, 45° up
key.castShadow = true;

const fill = new THREE.SpotLight(0xDDE0FF, 0.4, 20, Math.PI/3, 0.8, 2);
fill.position.set(-2, 1.5, 3); // Soft opposite fill

const rim = new THREE.SpotLight(0xFFFFFF, 1.2, 20, Math.PI/6, 0.3, 2);
rim.position.set(-1, 4, -3); // Behind, separates from background
```

---

## Key:Fill:Rim Ratio Guidelines

Ratios expressed as stops of light (each stop = 2× intensity):

| Style | Key:Fill Ratio | Rim | Use Case |
|-------|---------------|-----|----------|
| **High key** | 1:1 to 2:1 | Optional | Beauty, product, e-commerce |
| **Natural** | 2:1 to 3:1 | 1:1 with key | Portraits, general |
| **Dramatic** | 4:1 to 8:1 | 1.5:1 with key | Film noir, moody product |
| **Extreme** | 8:1+ | Strong or none | Horror, artistic |

**Converting ratios to Three.js intensity:**
- Key intensity = 2.0, Fill at 3:1 ratio → Fill = 2.0 / 3 ≈ 0.67
- Rim typically 0.5× to 1.5× key intensity depending on desired edge separation

---

## Color Temperature Reference

### Kelvin to Hex Mapping
```
1800K  Candle           → #FF6E00
2200K  Sodium lamp      → #FF8912
2700K  Warm white bulb  → #FFA757
3000K  Halogen          → #FFB46B
3200K  Tungsten studio  → #FFBB78
3500K  Warm fluorescent → #FFC885
4000K  Neutral          → #FFD9A3
4500K  Cool fluorescent → #FFE4B8
5000K  Horizon daylight → #FFECD2
5500K  Mid-day sun      → #FFF3E8
6000K  Bright daylight  → #FFF9F4
6500K  Overcast/LCD     → #FFFFFF
7500K  North sky blue   → #E0EEFF
10000K Clear blue sky   → #C4D9FF
```

### Three.js Helper
```js
function kelvinToColor(kelvin) {
  // Attempt approximation (use a lookup or library for precision)
  const temp = kelvin / 100;
  let r, g, b;
  if (temp <= 66) {
    r = 255;
    g = Math.min(255, Math.max(0, 99.4708 * Math.log(temp) - 161.1196));
    b = temp <= 19 ? 0 : Math.min(255, Math.max(0, 138.5177 * Math.log(temp - 10) - 305.0448));
  } else {
    r = Math.min(255, Math.max(0, 329.6987 * Math.pow(temp - 60, -0.1332)));
    g = Math.min(255, Math.max(0, 288.1221 * Math.pow(temp - 60, -0.0755)));
    b = 255;
  }
  return new THREE.Color(r / 255, g / 255, b / 255);
}
```

---

## Shadow Configuration

### Shadow Map Sizes (Quality vs Performance)

| Map Size | Quality | GPU Cost | Use Case |
|----------|---------|----------|----------|
| 512×512 | Low | Minimal | Mobile, many lights |
| 1024×1024 | Medium | Low | General use |
| 2048×2048 | High | Medium | Hero shadows, product |
| 4096×4096 | Very High | High | Close-up hero shots |

### Shadow Bias Tuning
```js
light.shadow.bias = -0.0001;       // Fixes shadow acne (dark artifacts)
light.shadow.normalBias = 0.02;    // Fixes peter-panning (shadow detachment)
// Start with these values, adjust per scene
// Too much bias → shadow lifts off surface
// Too little bias → surface acne
```

### Soft Shadows
```js
// PCF Soft Shadows (built-in)
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

// VSM Shadows (smoother but can have light bleeding)
renderer.shadowMap.type = THREE.VSMShadowMap;
light.shadow.blurSamples = 25;
light.shadow.radius = 4; // Only works with PCFSoftShadowMap
```

### Contact Shadows (GroundProjectedEnv or custom)
For product shots where objects sit on a surface:
```js
// Option 1: Simple shadow plane
const shadowGeo = new THREE.PlaneGeometry(10, 10);
const shadowMat = new THREE.ShadowMaterial({ opacity: 0.3 });
const shadowPlane = new THREE.Mesh(shadowGeo, shadowMat);
shadowPlane.rotation.x = -Math.PI / 2;
shadowPlane.receiveShadow = true;

// Option 2: Contact shadow via @pmndrs/drei (React Three Fiber)
// <ContactShadows position={[0, -0.01, 0]} opacity={0.4} blur={2.5} />
```

---

## Tone Mapping & Exposure

### Tone Mapping Modes
```js
// Linear — no tone mapping, raw HDR values clipped at 1.0
renderer.toneMapping = THREE.LinearToneMapping;

// Reinhard — simple, preserves detail in highlights, can look washed
renderer.toneMapping = THREE.ReinhardToneMapping;

// ACES Filmic — cinematic, S-curve, saturated shadows, rolled highlights
renderer.toneMapping = THREE.ACESFilmicToneMapping;
// Best for: product shots, cinematic scenes, anything that should "look good"
// Slightly desaturates and shifts hues — intentional filmic look

// AgX — newer, more perceptually uniform than ACES
renderer.toneMapping = THREE.AgXToneMapping;
// Better color preservation in saturated regions
// Less hue shift than ACES. Good for colorful products.

// Cinematic — similar to ACES with different curve
renderer.toneMapping = THREE.CineonToneMapping;
```

### ACES Filmic Explained
ACES (Academy Color Encoding System) applies an S-shaped curve:
- **Toe** (shadows): Lifts blacks slightly, adds density
- **Linear mid** (midtones): Near 1:1 mapping
- **Shoulder** (highlights): Gracefully compresses bright values, prevents clipping
- **Result**: Increased perceived dynamic range, filmic contrast
- **Caveat**: Shifts highly saturated colors (blues shift toward purple). If color accuracy is critical, use AgX.

### Exposure Control
```js
renderer.toneMappingExposure = 1.0; // Default
// < 1.0 = darker (underexposed)
// > 1.0 = brighter (overexposed)
// Adjust in 0.1 increments. Range 0.5–2.0 covers most needs.
// With ACES: exposure 1.0-1.2 usually looks best
```

---

## Environment Maps & HDRI

### Loading HDRI
```js
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';

new RGBELoader().load('path/to/env.hdr', (texture) => {
  texture.mapping = THREE.EquirectangularReflectionMapping;
  scene.environment = texture;     // PBR material reflections
  scene.background = texture;      // Visible background (optional)
  scene.backgroundBlurriness = 0.05; // Slight blur for depth
  scene.backgroundIntensity = 0.8;
  scene.environmentIntensity = 1.0;
});
```

### HDRI Selection Guide

| Scene Type | HDRI Style | Examples |
|-----------|-----------|---------|
| **Product (neutral)** | Studio, soft gradient | Studio small, photo studio loft |
| **Product (lifestyle)** | Interior with windows | Living room, kitchen |
| **Jewelry/watches** | High-contrast studio | Sharp reflections, dark bg with bright panels |
| **Architectural** | Outdoor, sky-heavy | Parking lot, courtyard |
| **Cinematic** | Dramatic sky, sunset | Golden hour field, cloudy dramatic |
| **Automotive** | Garage, tunnel, road | Industrial, long highlights |

### Best Practices
- **For reflective products** (watches, jewelry): Use HDRIs with distinct bright panels on dark background. This creates crisp reflections showing form.
- **Resolution**: 2K (2048×1024) for background, 1K for reflections-only. 4K only if HDRI is the hero background.
- **Rotation**: `scene.environmentRotation.y = Math.PI * 0.25` to position highlights optimally.
- **Sources**: [Poly Haven](https://polyhaven.com/hdris) (free, CC0), [HDRI Haven](https://hdrihaven.com).

---

## Watch & Jewelry Product Lighting

This is our specific use case. Reflective, small, detailed objects need controlled lighting.

### Key Principles
1. **Reflections define form** — On metallic/glossy surfaces, you're lighting reflections, not surfaces
2. **Large soft sources** — RectAreaLights or HDRI panels for broad, clean reflections
3. **Dark gaps** — Negative fill (dark cards) between light sources create contrast and show edges
4. **Minimal shadows** — Soft contact shadow only; hard shadows distract from product
5. **Color temp** — Neutral to slightly warm (5000K–5500K) for metals; cooler (6000K) for silver/platinum

### Watch Product Shot Rig
```js
// === ENVIRONMENT ===
// Use a studio HDRI with bright panels and dark gaps
// Or build a virtual light tent:

// Main overhead soft box (defines top surface reflections)
const mainBox = new THREE.RectAreaLight(0xFFF5EB, 10, 4, 4);
mainBox.position.set(0, 5, 0);
mainBox.lookAt(0, 0, 0);

// Left strip light (defines left edge, creates form)
const leftStrip = new THREE.RectAreaLight(0xFFFFFF, 6, 0.5, 4);
leftStrip.position.set(-3, 2, 0);
leftStrip.lookAt(0, 0, 0);

// Right strip light (complementary edge)
const rightStrip = new THREE.RectAreaLight(0xFFFFFF, 6, 0.5, 4);
rightStrip.position.set(3, 2, 0);
rightStrip.lookAt(0, 0, 0);

// Front fill (opens up the dial, softens)
const frontFill = new THREE.RectAreaLight(0xFFF8F0, 3, 3, 1.5);
frontFill.position.set(0, 1, 4);
frontFill.lookAt(0, 0, 0);

// Accent spot (catches crystal edge, creates sparkle)
const accent = new THREE.SpotLight(0xFFFFFF, 3.0, 15, Math.PI/12, 0.2, 2);
accent.position.set(1.5, 4, 2);
accent.target.position.set(0, 0, 0);

// Ground plane with soft shadow
const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(20, 20),
  new THREE.ShadowMaterial({ opacity: 0.15 })
);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -0.5;
ground.receiveShadow = true;

// Tone mapping
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.1;
```

### Jewelry (Gems/Diamonds) Tips
- Use **MeshPhysicalMaterial** with `transmission`, `ior: 2.4` (diamond), `thickness`
- Multiple small bright point sources create sparkle/fire in gems
- Add a subtle environment rotation animation for "life" in reflections
- `envMapIntensity: 1.5` on material to boost reflections
- Background: solid dark (#1a1a1a) or gradient for contrast

### Common Watch/Jewelry Materials
```js
// Brushed steel
const steel = new THREE.MeshPhysicalMaterial({
  color: 0xcccccc, metalness: 0.9, roughness: 0.35,
  envMapIntensity: 1.2
});

// Polished gold
const gold = new THREE.MeshPhysicalMaterial({
  color: 0xFFD700, metalness: 1.0, roughness: 0.05,
  envMapIntensity: 1.5
});

// Watch crystal (sapphire)
const crystal = new THREE.MeshPhysicalMaterial({
  transmission: 0.95, ior: 1.77, thickness: 1.5,
  roughness: 0.0, clearcoat: 1.0, clearcoatRoughness: 0.0,
  envMapIntensity: 1.0
});

// Leather strap
const leather = new THREE.MeshStandardMaterial({
  color: 0x3B2414, roughness: 0.8, metalness: 0.0
});
```

---

## Post-Processing for Lighting

### Bloom (Glow Effect)
```js
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));

const bloom = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  0.3,    // strength — 0.1-0.5 for subtle, 1.0+ for dramatic
  0.4,    // radius — spread of glow
  0.85    // threshold — only pixels brighter than this glow
);
composer.addPass(bloom);

// Render with: composer.render() instead of renderer.render()
```

### Bloom Guidelines
| Product Type | Strength | Threshold | Effect |
|-------------|----------|-----------|--------|
| Watch/Jewelry | 0.15–0.3 | 0.85–0.95 | Subtle sparkle on metal highlights |
| Neon/Emissive | 0.8–1.5 | 0.5–0.7 | Strong glow halos |
| Cinematic | 0.3–0.6 | 0.7–0.85 | Filmic light wrap |
| Clean product | 0.0–0.1 | 0.95 | Almost none, just a touch |

### Selective Bloom (Emission-based)
```js
// Set emissive on materials you want to glow
material.emissive = new THREE.Color(0xFFAA00);
material.emissiveIntensity = 2.0;
// With bloom threshold at 0.9, only emissive surfaces will bloom
```

### Screen Space Ambient Occlusion (SSAO)
Adds contact darkening in crevices. Subtle but adds realism:
```js
import { SSAOPass } from 'three/examples/jsm/postprocessing/SSAOPass.js';
const ssao = new SSAOPass(scene, camera, width, height);
ssao.kernelRadius = 8;
ssao.minDistance = 0.005;
ssao.maxDistance = 0.1;
composer.addPass(ssao);
```

---

## Day/Night Cycle Transitions

### Sun Position from Time
```js
function getSunPosition(hourOfDay, latitude = 40) {
  // Simplified — hour 0-24, returns elevation & azimuth
  const noon = 12;
  const hourAngle = (hourOfDay - noon) * 15; // degrees
  const declination = 23.5 * Math.sin(THREE.MathUtils.degToRad((hourOfDay / 24) * 360));
  const elevation = 90 - latitude + declination - Math.abs(hourAngle) * 0.7;
  const azimuth = hourAngle * 1.2;
  return { elevation: Math.max(-10, elevation), azimuth };
}
```

### Color Temperature by Time of Day
| Time | Kelvin | Hex | Description |
|------|--------|-----|-------------|
| Golden hour (sunrise) | 2500K | #FF9933 | Warm orange |
| Morning | 3500K | #FFC885 | Warm neutral |
| Midday | 5500K | #FFF3E8 | Bright neutral |
| Afternoon | 4500K | #FFE4B8 | Slight warm |
| Golden hour (sunset) | 2200K | #FF8912 | Deep warm |
| Twilight | 7500K | #E0EEFF | Cool blue |
| Night | 10000K | #C4D9FF | Deep blue |

### Transition Implementation
```js
function updateLighting(hour) {
  const { elevation, azimuth } = getSunPosition(hour);
  const pos = placeLightSpherical(50, elevation, azimuth);
  sunLight.position.copy(pos);

  // Interpolate color temperature
  const temp = hour > 6 && hour < 18
    ? THREE.MathUtils.lerp(2500, 5500, Math.min(1, (hour - 6) / 4))
    : THREE.MathUtils.lerp(5500, 2200, Math.min(1, (hour - 16) / 3));
  sunLight.color.copy(kelvinToColor(temp));

  // Fade intensity
  const intensity = Math.max(0, Math.sin(elevation * Math.PI / 180)) * 2.0;
  sunLight.intensity = intensity;
}
```

---

## Quick Reference Card

### Starting Point for Any Scene
```js
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
```

### Checklist
- [ ] Tone mapping set (ACES or AgX for most cases)
- [ ] Exposure tuned (0.8–1.3 typical range)
- [ ] Output color space = sRGB
- [ ] Shadow maps enabled, bias tuned
- [ ] At least one shadow-casting light
- [ ] Environment map for reflections (even if not visible as bg)
- [ ] Key:fill ratio matches intended mood
- [ ] Post-processing bloom if metallic/emissive surfaces present

See `references/kelvin-hex-table.md` for full color temperature lookup and `references/hdri-recommendations.md` for HDRI selection by scene type.

---

## State-of-the-Art (2025 Research)

> Research pass by Chris (lookdev). Last updated: Feb 2025.
> Sources: Three.js migration guide (r183), discourse.threejs.org, pmndrs/drei-vanilla docs, Maxime Heckel blog (caustics Jan 2024), Codrops 2025, Poly Haven, modelviewer.dev PBR Neutral guide.

---

### 1. Shadow System — 2025 Changes (r182+)

**Breaking change in r182**: `PCFShadowMap` is now soft by default. `PCFSoftShadowMap` is **deprecated**.

```js
// r182+ correct setup:
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap; // now soft by default — use this

// DEPRECATED (still works but will warn):
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // ← don't use

// Shadow quality: control softness via mapSize and light size (not type)
light.shadow.mapSize.set(2048, 2048); // higher = sharper soft shadows
light.shadow.camera.near = 0.1;
light.shadow.camera.far = 30;
// Tight frustum = better shadow quality (use smallest frustum that covers scene)
```

**VSM (Variance Shadow Maps)** — best for naturally soft, wide-area shadows:
```js
renderer.shadowMap.type = THREE.VSMShadowMap;
light.shadow.blurSamples = 8;   // 4–25, higher = smoother blur
light.shadow.radius = 8;        // Blur radius for VSM
// Gotcha: VSM can produce light bleeding on thin geometry
// Fix: increase shadow.bias magnitude slightly (e.g., bias = -0.001)
```

**PCSS (Percentage Closer Soft Shadows)** — contact hardening:
PCSS is not built into Three.js core. It's implemented via shader injection on SpotLight/DirectionalLight. See `three/examples/webgl_shadowmap_pcss.html` for the official example. The shadow gets harder near contact points and softer further away — most realistic.

For production use, the pmndrs `SoftShadows` (drei-vanilla) provides a drop-in PCSS implementation via shader injection:
```js
// Conceptually (drei-vanilla):
// SoftShadows({ size: 25, focus: 0, samples: 10 })
// Injects PCSS into all shadow-casting lights via shader patching
```

---

### 2. RectAreaLight — Current State & LTC Textures

RectAreaLight uses **Linearly Transformed Cosines (LTC)** for area-light shading on PBR materials. This is initialized via `RectAreaLightUniformsLib` — still required as of r183.

```js
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js';
import { RectAreaLightHelper } from 'three/addons/helpers/RectAreaLightHelper.js';

// MUST be called once before any RectAreaLight is used
RectAreaLightUniformsLib.init();

const rect = new THREE.RectAreaLight(0xFFFFFF, 10, 4, 2);
rect.position.set(0, 3, 2);
rect.lookAt(0, 0, 0);
scene.add(rect);

// Visual debug helper (shows the light source as a rectangle)
const helper = new RectAreaLightHelper(rect);
rect.add(helper); // Add as child of light, not scene
```

**RectAreaLight limitations (still current in r183):**
- No shadow casting (fundamental limitation of area lights in rasterization)
- Only works with `MeshStandardMaterial` and `MeshPhysicalMaterial`
- Does NOT affect `MeshBasicMaterial`, `MeshLambertMaterial`, `MeshPhongMaterial`
- For glass: RectAreaLight contributes to specular highlights on the glass surface but NOT to the transmission/refraction content

**Using RectAreaLight as a backlight for glass:**
```js
// Place RectAreaLight BEHIND glass to create a bright "glow" source
// The light will contribute specular highlights on the near glass face
// AND the bright light position will be visible through transmission (as HDRI would be)
const backLight = new THREE.RectAreaLight(0xFFFFFF, 20, 3, 3);
backLight.position.set(0, 0, -2);
backLight.lookAt(0, 0, 0); // Faces the camera through the glass
// Intensity: 15–25 for dramatic glass brightening effect
```

---

### 3. IBL / PMREM — Best Practices

**IBL pipeline overview:**
1. Load HDRI (`.hdr` or `.exr`)
2. Generate PMREM (pre-filtered mipmap radiant environment map)
3. Assign to `scene.environment` for PBR materials
4. Optionally assign to `scene.background` for visible skybox

```js
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';
// NOTE: r180 renamed RGBELoader → HDRLoader; RGBELoader still works in r183

const pmrem = new THREE.PMREMGenerator(renderer);
pmrem.compileEquirectangularShader(); // Pre-compile to avoid stutter on first load

new RGBELoader().load('studio.hdr', (hdrTex) => {
  const envMap = pmrem.fromEquirectangular(hdrTex).texture;

  scene.environment = envMap;
  scene.environmentIntensity = 1.5;       // r152+: global IBL multiplier
  scene.backgroundBlurriness = 0.05;      // Depth blur on background
  scene.backgroundIntensity = 0.8;        // Background brightness (separate from IBL)
  scene.environmentRotation.y = Math.PI * 0.25; // Rotate lighting without touching bg

  hdrTex.dispose();   // Release original HDR — only keep PMREM
  pmrem.dispose();    // Dispose generator (keep envMap!)
});
```

**LightProbeGenerator** — spherical harmonics diffuse IBL from cubemap:
```js
import { LightProbeGenerator } from 'three/addons/lights/LightProbeGenerator.js';

// Create a CubeCamera to capture the scene
const cubeCamera = new THREE.CubeCamera(0.1, 100, new THREE.WebGLCubeRenderTarget(256));
scene.add(cubeCamera);
cubeCamera.update(renderer, scene);

// Convert to SH light probe
const probe = LightProbeGenerator.fromCubeRenderTarget(renderer, cubeCamera.renderTarget);
probe.intensity = 0.5;
scene.add(probe);

// Use case: dynamic scenes where HDRI changes (day/night cycle)
// Update cubeCamera + probe each frame or at intervals
```

---

### 4. Tone Mapping — 2024/2025 Decision Guide

**Full comparison:**

| Tone Mapper | Three.js Constant | Added | Best For | Gotchas |
|------------|-----------------|-------|----------|---------|
| Linear | `LinearToneMapping` | always | HDR displays, passthrough | Clips at 1.0 |
| Reinhard | `ReinhardToneMapping` | always | Gentle, dreamy | Washed out highlights |
| Cineon | `CineonToneMapping` | always | Film emulation | |
| ACES Filmic | `ACESFilmicToneMapping` | always | Cinematic product shots | Blue→purple hue shift; paper-white is gray |
| AgX | `AgXToneMapping` | r155 | Colorful objects, gems | Slightly low contrast |
| Neutral (PBR) | `NeutralToneMapping` | r158 | E-commerce, color-accurate | Slightly flat vs ACES |
| Custom | `CustomToneMapping` | always | Full GLSL control | Must provide GLSL |

**Key insight — NeutralToneMapping for e-commerce/product:**
- Developed by Khronos for glTF / model-viewer
- Paper-white material → white pixels (ACES makes it ~80% gray)
- Highlights desaturate toward white correctly (gold highlight stays gold, not yellow)
- Adopted as default in `<model-viewer>` v4 (2024)
- Both Three.js and Google Filament added it in March 2024

```js
// For glass/crystal product shots — recommended:
renderer.toneMapping = THREE.NeutralToneMapping;
renderer.toneMappingExposure = 1.0;
// Glass colors stay accurate; highlights clip cleanly to white

// For cinematic/moody glass:
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.1;
// More drama, but blue glass can shift purple
```

**OutputPass — required for correct post-processing pipeline:**
```js
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
// ... bloom, SSAO etc ...
composer.addPass(new OutputPass()); // MUST be last — handles colorspace + tone mapping
// Without OutputPass, tone mapping in post-processing pipeline is wrong
```

---

### 5. Bloom — Selective and Physical (2024)

**Correct bloom setup with OutputPass:**
```js
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
composer.addPass(new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  0.25,   // strength
  0.4,    // radius
  0.88    // threshold (only HDR-bright pixels bloom)
));
composer.addPass(new OutputPass()); // Critical: LAST pass

// In render loop: composer.render() — NOT renderer.render()
```

**Selective bloom technique (bloom only specific objects):**
```js
// Technique: set threshold to 1.0, then boost only target materials above 1.0

bloom.threshold = 1.0; // Nothing naturally blooms

// Materials you want to glow: push luminance above 1.0 via emissive
mat.emissive = new THREE.Color(0xFFFFFF);
mat.emissiveIntensity = 2.0; // >1 = above bloom threshold

// Alternative: render bloom layer separately and composite
// See three.js example: webgl_postprocessing_unreal_bloom_selective
```

**For glass glow (transmission + emissive combo):**
```js
// Glass with a faint inner light (e.g. glowing crystal)
const glowGlass = new THREE.MeshPhysicalMaterial({
  transmission: 1.0,
  thickness: 0.5,
  ior: 1.52,
  roughness: 0.0,
  emissive: 0x4488FF,     // Blue inner glow
  emissiveIntensity: 0.8, // Below bloom threshold for subtle effect
  // With bloom threshold 0.7: this will bloom slightly — adds halo
});
```

---

### 6. Glass-Specific Lighting Rules

These rules come from studying real glass photography and simulating it in WebGL:

#### Rule 1: The Bright-Background Rule
**Glass reads lighter than its background only if light comes from behind it.**
- Place a bright RectAreaLight or emissive panel BEHIND the glass (z-negative of glass, facing camera)
- The glass will refract and transmit this brightness, creating a luminous interior
- Without this: glass looks like a dark hole, not a glowing object

#### Rule 2: Edge Lighting Creates Presence
Glass gets its "solidity" from edge reflections. Use:
```js
// Side RectAreaLights at ~90° create bright edge streaks
// These are Fresnel reflections — stronger at grazing angles
// Critical for glass cubes and bottles
const leftRim = new THREE.RectAreaLight(0xFFFFFF, 10, 0.5, 4);
leftRim.position.set(-3, 0, 0);
leftRim.lookAt(0, 0, 0);

const rightRim = leftRim.clone();
rightRim.position.x = 3;
rightRim.lookAt(0, 0, 0);
```

#### Rule 3: Light Positions Show as Reflections in Glass
The glass surface reflects the light source positions directly. For a glass cube:
- Overhead RectAreaLight → top face shows bright rectangular reflection
- Side strip lights → vertical bright stripe on glass face
- Use this to *design* what the glass looks like

#### Rule 4: High `envMapIntensity` for Glass
Glass materials need more environmental detail than metals:
```js
// Metals: envMapIntensity 1.0–1.5
// Glass: envMapIntensity 1.5–2.5
// More IBL = richer reflections and more convincing "depth"
mat.envMapIntensity = 2.0;
scene.environmentIntensity = 2.0; // Global boost
```

#### Rule 5: Color Temperature for Glass
- **Clear glass**: neutral 5500–6500K (daylight balanced)
- **Warm glass** (amber, champagne flute): warm key 3000K + cool fill 6500K
- **Blue glass / sapphire**: cool key 7000K+ creates crisp, icy look
- **Crystal / lead glass**: neutral key with subtle cool fill for "luxury" appearance

#### Rule 6: The DoubleSide Trap
Don't use `side: THREE.DoubleSide` on transmission materials — it causes incorrect sorting:
```js
// ❌ Wrong: creates sorting artifacts, dark patches on glass interior
mat.side = THREE.DoubleSide;
mat.transmission = 1.0;

// ✅ Correct: use MeshTransmissionMaterial with backside=true
// OR: use TWO separate meshes (outer shell front side + inner shell back side)
```

---

### 7. Contact Shadows for Glass

Glass is transparent, so a standard shadow looks wrong (too dark, or geometric mismatch). Approach by quality level:

**Level 1 — Fake contact shadow (fast):**
```js
// ShadowMaterial with very low opacity + blue/purple tint
// Represents the slight geometric shadow of the glass body
const shadowMat = new THREE.ShadowMaterial({
  color: 0x001144,   // Cool tint — glass casts slightly blue shadows
  opacity: 0.06,     // Very faint — glass is mostly transparent
});
const ground = new THREE.Mesh(new THREE.PlaneGeometry(10, 10), shadowMat);
ground.receiveShadow = true;
glassMesh.castShadow = true; // Even transparent geometry casts some shadow
```

**Level 2 — Drei ContactShadows (drop shadow style):**
```js
// Renders a downward-projected soft shadow independent of light direction
// Fake but very controllable and good-looking
// In R3F: <ContactShadows position={[0,-0.5,0]} opacity={0.1} blur={3} color="#001144" />
```

**Level 3 — Caustic projection (physically motivated, Jan 2024 technique):**
```
Algorithm (Maxime Heckel / drei Caustics component):
1. Render glass mesh normals into FBO at light POV
2. For each texel: compute refracted ray direction through the surface
3. Accumulate refracted ray convergence into caustic intensity buffer:
   - Compute oldArea (surface element before refraction)
   - Compute newArea (surface element after refraction, using dFdx/dFdy)
   - intensity = oldArea / newArea (converging rays = brighter spot)
4. Project caustic texture onto floor plane (scale by height from floor)
5. Apply Gaussian blur for natural caustic spread

Parameters:
- ior: 1.0–1.2 for subtle; 1.5+ for strong prismatic effect
- intensity: 0.05–0.5
- worldRadius: 0.3125 (default)
- frames: 1 for static glass; Infinity for animated
```

---

### 8. HDRI Selection for Glass Product Shots

**The glass HDRI principle**: The HDRI content is transmitted and refracted *through* the glass, not just reflected on the surface. A studio HDRI with distinct bright/dark zones creates the most dramatic and convincing glass.

**What makes a good glass HDRI:**
- Large bright panel (softbox) visible through refraction → glowing interior
- Dark surrounding area → contrast against glass body
- Minimal color cast → lets glass material color dominate
- High dynamic range → rich specular on glass edges

**Poly Haven recommendations:**

| HDRI | URL slug | Character | Why Good for Glass |
|------|----------|-----------|-------------------|
| Monochrome Studio 03 | `monochrome_studio_03` | Soft box + dark ceiling, 20K | Clean refraction, no distracting content |
| PAV Studio 01 | `pav_studio_01` | High contrast key + window | Strong light/dark = glass reads clearly |
| Ferndale Studio 11 | `ferndale_studio_11` | Warm tubes + soft box | Warm glass tones |
| Photo Studio Loft 01 | `photo_studio_loft_01` | High key windows | Crystal/sapphire lookdev |
| Studio Small 08 | `studio_small_08` | Balanced small studio | General baseline |

**Loading 2K for glass:**
```js
// Use 2K minimum for glass — 1K is visually too coarse for refraction detail
new RGBELoader().load('/hdri/monochrome_studio_03_2k.hdr', (tex) => {
  scene.environment = pmrem.fromEquirectangular(tex).texture;
});
```

---

### 9. Scene-Level Environment Controls (r152+)

These were added in r152 and are now the preferred way to manage IBL:

```js
// All available scene-level controls:
scene.environment = envMap;              // IBL source for all PBR materials
scene.background = envMap;              // Visible background (can differ from environment)
scene.environmentIntensity = 1.5;       // Global IBL multiplier (new r152+)
scene.backgroundIntensity = 0.8;        // Background brightness
scene.backgroundBlurriness = 0.05;      // Background blur (0=sharp, 1=fully blurred)
scene.environmentRotation.y = Math.PI * 0.25; // Rotate IBL without rotating background

// Practical glass lookdev workflow:
// 1. Load studio HDRI with good panel positioning
// 2. Set environmentIntensity = 2.0 for glass brightness
// 3. Rotate via environmentRotation to place key reflection
// 4. Set backgroundBlurriness 0.05-0.15 for product focus
```

---

### 10. Full Glass Scene — Lighting Checklist

Use this checklist for any glass object lighting:

- [ ] **Environment map set** (`scene.environment`) — glass is 90% reflection + refraction
- [ ] **environmentIntensity ≥ 1.5** — glass needs more IBL than metals
- [ ] **Backlight present** — RectAreaLight or bright plane behind glass
- [ ] **Rim lights** — side RectAreaLights at 90° to define glass edges
- [ ] **Transmission material correct** — `thickness` set, `ior` set, `dispersion` tuned
- [ ] **Shadow receiving plane** — ShadowMaterial, low opacity, cool tint
- [ ] **Tone mapping** — Neutral or AgX (not ACES for colored glass)
- [ ] **OutputPass last** — in post-processing pipeline
- [ ] **Background contrast** — dark or mid background makes glass pop visually
- [ ] **envMapIntensity** — glass material: 1.5–2.5 range

---

### 11. Key API Changes Summary (r152–r183) for Lighting

| Version | Change | Action Required |
|---------|--------|-----------------|
| r152 | `scene.environmentIntensity` added | Use instead of iterating materials |
| r155 | `AgXToneMapping` added | Available for better color accuracy |
| r158 | `NeutralToneMapping` added | Preferred for product/e-commerce |
| r167 | WebGPU renderer default | Use `WebGPURenderer` for future-proofing |
| r180 | `RGBELoader` → `HDRLoader` | Update import in new projects |
| r181 | PBR indirect specular improved | Review existing scenes — may look brighter |
| r181 | Energy conservation improved for rough materials | Rough materials appear brighter |
| r182 | `PCFShadowMap` now soft; `PCFSoftShadowMap` deprecated | Use `PCFShadowMap` |
| r182 | Shadow bias improvements in WebGPU | May reduce need for manual bias tweaking |
| r183 | PostProcessing → RenderPipeline | Update class names in new code |
| r183 | `Clock` → `Timer` | Update animation timing code |
| r183 | RoomEnvironment PMREM updated | Lighting may look different — re-review |

---

## Glass Lookdev & Lighting (2025)

### Why Dark Scenes Kill Glass

- Glass is **defined by what it reflects and refracts** — remove that, and it disappears
- A pure black background = glass refracts black = invisible object
- Even a slight grey gradient behind glass creates visible refraction distortion
- **Fresnel effect**: at grazing angles glass always reflects environment, even at `transmission: 1` — so environment maps are essential
- Without `scene.environment`, even well-configured glass looks like a dark blob

### Lighting Rules for Glass

**The fundamental rule: Glass needs CONTRAST. Light edges against dark areas, or bright centers against dark surroundings.**

#### The 3-Light Studio Setup for Glass:
1. **Key light (front-side, high):** SpotLight or RectAreaLight at ~45°. Creates the main highlight and defines form. Intensity: moderate.
2. **Backlight / Rim light (behind object, aimed at camera):** This is the most critical for glass. Creates bright silhouette from Fresnel. A RectAreaLight placed directly behind and below creates a "hot base" glow. 
3. **Environment contribution:** PMREM env map provides ambient Fresnel and fill across all surface angles.

#### Backlight technique:
```js
// RectAreaLight behind the glass object — aimed toward camera
const backLight = new THREE.RectAreaLight(0xffffff, 8, 3, 5);
backLight.position.set(0, 1, -3); // behind object
backLight.lookAt(0, 1, 0);        // aim back toward object center
scene.add(backLight);
// No shadows, but creates strong Fresnel rim visible from camera angle
```

#### Rim / edge light:
- Place a dim fill light (`PointLight` or `SpotLight`) at low intensity off to the side
- Color it slightly cool (0x88aaff) — creates separation from warm key light
- Even `intensity: 0.3–0.8` creates enough contrast to reveal glass silhouette

#### Why background brightness matters:
- Glass refracts background — a lighter background = visibly bent, warped background through glass = glass is "readable"
- Rule: background should be **at least 20-30% grey** for glass to be visible in a "dark" scene
- Alternatively, place a bright gradient plane behind the glass at a slight offset

### RectAreaLight vs SpotLight vs PointLight for Glass Product Shots

| Light Type | Glass Reflection | Shadows | Best For |
|---|---|---|---|
| **RectAreaLight** | Soft, rectangular highlight — mimics studio softbox / window | ❌ No shadows | Main studio key/fill, large reflections, product shots |
| **SpotLight** | Hard circular highlight, defined edges | ✅ Yes | Accent lights, under-lighting, dramatic caustic suggestion |
| **PointLight** | Soft omnidirectional, no directionality | ✅ Yes | Ambient fill, subtle fill inside glass | 
| **DirectionalLight** | Parallel rays, hard edge | ✅ Yes | Outdoor/sunlight simulation |

**Studio glass recommendation:** RectAreaLight (key) + SpotLight (backlit accent) + PMREM env (fill)

- **RectAreaLight** is best for glass because its soft rectangular reflection looks like a studio window on glass surfaces — exactly what product photography uses
- Use `RectAreaLightHelper` to visualize placement
- RectAreaLight requires `RectAreaLightUniformsLib.init()` (import from examples)
- No shadow support for RectAreaLight — use SpotLight for shadow casters in the same scene

#### RectAreaLight setup:
```js
import { RectAreaLightUniformsLib } from 'three/examples/jsm/lights/RectAreaLightUniformsLib.js';
RectAreaLightUniformsLib.init(); // REQUIRED — or RectAreaLight renders black

const softBox = new THREE.RectAreaLight(0xfff5e0, 5, 4, 6); // warm white
softBox.position.set(3, 3, 2);
softBox.lookAt(0, 0, 0);
scene.add(softBox);
```

### PMREM + Environment Maps for Glass

#### Setup:
```js
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
const pmrem = new THREE.PMREMGenerator(renderer);
pmrem.compileEquirectangularShader();

new RGBELoader().load('studio.hdr', (hdr) => {
  const envMap = pmrem.fromEquirectangular(hdr).texture;
  scene.environment = envMap;  // all materials receive this
  // scene.background = envMap; // optional — show env as bg
  hdr.dispose();
  pmrem.dispose();
});
```

#### Key points:
- `scene.environment` drives Fresnel on ALL materials without needing `material.envMap`
- `material.envMapIntensity = 2–8` on dark scenes — default of 1 is too dim for dramatic glass
- Bright studio HDRIs (windows, softboxes, strip lights visible) give the most interesting glass reflections
- HDRs with **high dynamic range** (very bright whites) create more pronounced Fresnel separation
- PMREM enables roughness-based env sampling: `roughness: 0.3` glass gets properly blurred env reflections

#### Studio HDRI recommendations for glass:
- **White studio / neutral**: `envMapIntensity: 1–2`, good for product shots with bright surroundings
- **Dark studio with bright windows**: `envMapIntensity: 3–6`, dramatic glass with visible edge light
- **Night / dark scene with few light sources**: `envMapIntensity: 8–15` + add practical lights manually

### Glass Lighting Checklist
- [ ] `scene.environment` set (PMREM) — essential for any transmission material
- [ ] `envMapIntensity >= 2` on dark scene glass materials
- [ ] Backlight or rim light behind/around glass object
- [ ] Background has some luminance (not pure black) for visible refraction
- [ ] `RectAreaLightUniformsLib.init()` called if using RectAreaLight
- [ ] `renderer.physicallyCorrectLights` = false (deprecated) → use `renderer.useLegacyLights = false` (r152+)
