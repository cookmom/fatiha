---
name: shader-workshop
description: >-
  GLSL/WebGL shader and Three.js material creation. Use when asked about:
  fragment shaders (noise, patterns, gradients, distortions, procedural textures),
  vertex shaders (displacement, morphing, wave effects), PBR materials and
  physically-based parameter sets, Three.js ShaderMaterial or MeshPhysicalMaterial
  configuration, post-processing effects (bloom, vignette, chromatic aberration, grain),
  procedural textures (wood, marble, metal, fabric, water), noise functions
  (Perlin, Simplex, Worley, curl, FBM), Shadertoy conversions, or any shader/material
  authoring task.
---

# Shader Workshop

Create production-quality GLSL shaders, Three.js materials, and post-processing effects.

## Core Workflow

1. **Clarify intent** — What visual effect? Real-time or offline? Target platform (WebGL 1/2, mobile)?
2. **Choose approach** — Custom ShaderMaterial vs built-in material vs post-processing pass
3. **Write shader code** — Clean, commented GLSL with performance in mind
4. **Provide integration** — Complete Three.js setup with uniforms, geometry, and animation loop
5. **Optimize** — Flag performance concerns, suggest fallbacks for mobile

---

## GLSL Cheat Sheet

### Types

| Type | Description | Example |
|------|-------------|---------|
| `float` | Single scalar | `float x = 1.0;` |
| `vec2/3/4` | Float vectors | `vec3 color = vec3(1.0, 0.0, 0.5);` |
| `ivec2/3/4` | Integer vectors | `ivec2 pixel = ivec2(10, 20);` |
| `mat2/3/4` | Matrices | `mat3 rot = mat3(1.0);` |
| `sampler2D` | 2D texture | `uniform sampler2D uTex;` |
| `samplerCube` | Cube texture | `uniform samplerCube uEnv;` |
| `bool` | Boolean | `bool active = true;` |

### Swizzling

```glsl
vec4 v = vec4(1.0, 2.0, 3.0, 4.0);
v.xy    // vec2(1.0, 2.0)
v.rgb   // vec3(1.0, 2.0, 3.0)
v.zyx   // vec3(3.0, 2.0, 1.0)  — reorder
v.xxx   // vec3(1.0, 1.0, 1.0)  — repeat
v.ra    // vec2(1.0, 4.0)       — mix xyzw/rgba/stpq
```

### Built-in Functions

**Math:** `abs` `sign` `floor` `ceil` `fract` `mod` `min` `max` `clamp` `mix` `step` `smoothstep` `pow` `exp` `log` `sqrt` `inversesqrt`

**Trig:** `sin` `cos` `tan` `asin` `acos` `atan` (2-arg version for atan2)

**Vector:** `length` `distance` `dot` `cross` `normalize` `reflect` `refract` `faceforward`

**Texture:** `texture2D(sampler, uv)` (WebGL1) · `texture(sampler, uv)` (WebGL2)

**Derivatives (frag only):** `dFdx` `dFdy` `fwidth` — useful for anti-aliasing

### Precision Qualifiers

```glsl
precision highp float;   // Desktop default — use this
precision mediump float;  // Mobile-safe, faster
// lowp: only for color values where 8-bit is fine
```

---

## Common Uniforms

```glsl
uniform float uTime;          // elapsed seconds
uniform vec2 uResolution;     // viewport width/height in pixels
uniform vec2 uMouse;          // mouse position (pixels or normalized)
uniform mat4 modelMatrix;     // Three.js: object → world
uniform mat4 viewMatrix;      // Three.js: world → camera
uniform mat4 projectionMatrix;// Three.js: camera → clip
uniform vec3 cameraPosition;  // Three.js: camera world position
uniform mat3 normalMatrix;    // Three.js: for transforming normals
```

Three.js auto-injects `projectionMatrix`, `modelViewMatrix`, `normalMatrix`, `position`, `normal`, `uv` into ShaderMaterial.

---

## Common Shader Patterns

### Minimal ShaderMaterial Boilerplate

```javascript
const material = new THREE.ShaderMaterial({
  uniforms: {
    uTime: { value: 0 },
    uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform float uTime;
    uniform vec2 uResolution;
    varying vec2 vUv;
    void main() {
      vec3 color = vec3(vUv, 0.5 + 0.5 * sin(uTime));
      gl_FragColor = vec4(color, 1.0);
    }
  `,
});

// In animation loop:
material.uniforms.uTime.value = clock.getElapsedTime();
```

### Vertex Displacement

```glsl
// Vertex shader
uniform float uTime;
varying vec2 vUv;
varying float vElevation;

void main() {
  vUv = uv;
  vec3 pos = position;
  float elevation = sin(pos.x * 4.0 + uTime) * sin(pos.z * 4.0 + uTime) * 0.2;
  pos.y += elevation;
  vElevation = elevation;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
```

### Gradient Patterns

```glsl
// Radial gradient
float d = length(vUv - 0.5);
vec3 color = mix(vec3(1.0, 0.4, 0.1), vec3(0.05), smoothstep(0.0, 0.5, d));

// Angular gradient
float angle = atan(vUv.y - 0.5, vUv.x - 0.5);
float t = angle / 6.2832 + 0.5;

// Stripe pattern
float stripes = step(0.5, fract(vUv.x * 10.0));
```

### SDF Shapes (2D)

```glsl
float sdCircle(vec2 p, float r) { return length(p) - r; }
float sdBox(vec2 p, vec2 b) { vec2 d = abs(p) - b; return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0); }
float sdRoundedBox(vec2 p, vec2 b, float r) { return sdBox(p, b - r) - r; }

// Usage: smooth edge with fwidth
float d = sdCircle(vUv - 0.5, 0.3);
float aa = fwidth(d);
float shape = 1.0 - smoothstep(-aa, aa, d);
```

---

## Noise Functions

See `references/noise-library.glsl` for copy-paste implementations.

### Quick Reference

| Noise Type | Character | Use For |
|-----------|-----------|---------|
| **Perlin/Value** | Smooth, blobby | Terrain, clouds, general organic |
| **Simplex** | Smoother, less grid artifacts | Same as Perlin but better quality |
| **Worley/Cellular** | Cell-like, cracks | Stone, scales, caustics, veins |
| **Curl** | Divergence-free flow | Fluid motion, smoke trails |
| **FBM** (Fractal Brownian Motion) | Layered detail | Clouds, terrain, any multi-scale |

### FBM Pattern

```glsl
float fbm(vec2 p) {
  float value = 0.0, amplitude = 0.5, frequency = 1.0;
  for (int i = 0; i < 6; i++) {
    value += amplitude * noise(p * frequency); // plug in your noise fn
    frequency *= 2.0;
    amplitude *= 0.5;
  }
  return value;
}
```

### Domain Warping

```glsl
// Warp UV with noise for organic distortion
vec2 q = vec2(fbm(p), fbm(p + vec2(5.2, 1.3)));
vec2 r = vec2(fbm(p + 4.0 * q + vec2(1.7, 9.2) + 0.15 * uTime),
              fbm(p + 4.0 * q + vec2(8.3, 2.8) + 0.126 * uTime));
float f = fbm(p + 4.0 * r);
```

---

## Procedural Textures

### Wood

```glsl
float wood(vec2 p) {
  float r = length(p) * 10.0;
  return fract(r + 0.5 * noise(p * 8.0));
}
// Color: mix(vec3(0.4, 0.2, 0.07), vec3(0.6, 0.35, 0.15), wood(vUv))
```

### Marble

```glsl
float marble(vec2 p) {
  return 0.5 + 0.5 * sin(p.x * 6.0 + fbm(p * 4.0) * 6.0);
}
// Color: mix(vec3(0.9), vec3(0.2, 0.2, 0.25), marble(vUv))
```

### Water Caustics

```glsl
float caustic(vec2 p, float t) {
  float c = 0.0;
  for (int i = 0; i < 3; i++) {
    float fi = float(i);
    vec2 q = p * (1.0 + fi * 0.5) + vec2(t * 0.1 * (fi + 1.0));
    c += 1.0 / (1.0 + 60.0 * abs(voronoi(q) - 0.5)); // voronoi from noise lib
  }
  return c / 3.0;
}
```

### Metal (Brushed)

```glsl
float brushed(vec2 p) {
  return 0.5 + 0.5 * sin(p.x * 200.0 + noise(vec2(p.x * 100.0, p.y * 2.0)) * 3.0);
}
// Combine with environment reflection for realism
```

---

## PBR Material Reference

### Real-World Material Values

| Material | Metalness | Roughness | IOR | Color (sRGB hex) | Notes |
|----------|-----------|-----------|-----|-------------------|-------|
| **Gold** | 1.0 | 0.2–0.4 | — | `#FFD700` | F0: (1.0, 0.71, 0.29) |
| **Silver** | 1.0 | 0.15–0.35 | — | `#C0C0C0` | F0: (0.95, 0.93, 0.88) |
| **Copper** | 1.0 | 0.25–0.5 | — | `#B87333` | F0: (0.95, 0.64, 0.54) |
| **Iron** | 1.0 | 0.4–0.7 | — | `#6A6A6A` | F0: (0.56, 0.57, 0.58) |
| **Aluminum** | 1.0 | 0.1–0.4 | — | `#D4D4D4` | F0: (0.91, 0.92, 0.92) |
| **Glass** | 0.0 | 0.0–0.1 | 1.5 | `#FFFFFF` | transmission: 1.0 |
| **Diamond** | 0.0 | 0.0 | 2.42 | `#FFFFFF` | Very high specular |
| **Water** | 0.0 | 0.0 | 1.33 | `#FFFFFF` | transmission: 1.0 |
| **Plastic** | 0.0 | 0.3–0.6 | 1.46 | varies | F0 ≈ 0.04 |
| **Rubber** | 0.0 | 0.8–1.0 | 1.52 | varies | Nearly Lambertian |
| **Wood** | 0.0 | 0.5–0.9 | 1.5 | varies | Add clearcoat for varnish |
| **Ceramic** | 0.0 | 0.05–0.5 | 1.5 | varies | Glazed = low roughness |
| **Concrete** | 0.0 | 0.8–1.0 | 1.5 | `#8C8C8C` | Very diffuse |
| **Skin** | 0.0 | 0.4–0.6 | 1.4 | varies | Add subsurface scattering |
| **Fabric/Cloth** | 0.0 | 0.8–1.0 | 1.5 | varies | Sheen for velvet/silk |
| **Marble** | 0.0 | 0.1–0.3 | 1.5 | `#F0EDE4` | Polished = very smooth |

### IOR Quick Reference

Dielectric F0 from IOR: `F0 = ((ior - 1) / (ior + 1))²`

| IOR | F0 | Material |
|-----|-----|----------|
| 1.0 | 0.0 | Vacuum |
| 1.33 | 0.02 | Water |
| 1.45 | 0.035 | Plastic/acrylic |
| 1.5 | 0.04 | Glass (common) |
| 1.77 | 0.08 | Sapphire |
| 2.42 | 0.17 | Diamond |

---

## Three.js Material Hierarchy

### When to Use Each

| Material | When | Performance |
|----------|------|-------------|
| `MeshBasicMaterial` | Unlit, UI, skybox, debug | ⚡ Fastest |
| `MeshLambertMaterial` | Diffuse-only, stylized/low-poly | ⚡ Fast |
| `MeshPhongMaterial` | Specular highlights, legacy look | ⚡ Fast |
| `MeshStandardMaterial` | PBR metallic/roughness workflow | 🔶 Medium |
| `MeshPhysicalMaterial` | Clearcoat, transmission, sheen, IOR | 🔴 Expensive |
| `ShaderMaterial` | Full custom shaders | Varies |
| `RawShaderMaterial` | Custom + no Three.js uniforms injected | Varies |

### MeshPhysicalMaterial Example

```javascript
const mat = new THREE.MeshPhysicalMaterial({
  color: 0xffffff,
  metalness: 0.0,
  roughness: 0.05,
  transmission: 1.0,       // glass
  thickness: 0.5,          // refraction depth
  ior: 1.5,
  clearcoat: 1.0,
  clearcoatRoughness: 0.1,
  envMapIntensity: 1.0,
  // sheen: 1.0,           // for fabric
  // sheenColor: new THREE.Color(0.5, 0.2, 0.8),
  // iridescence: 1.0,     // soap bubble
});
```

### ShaderMaterial with Three.js Lighting

To use Three.js lights in a ShaderMaterial, include their chunks:

```javascript
const material = new THREE.ShaderMaterial({
  lights: true,
  uniforms: THREE.UniformsUtils.merge([
    THREE.UniformsLib.lights,
    { uTime: { value: 0 } }
  ]),
  vertexShader: `...`,
  fragmentShader: `...`,
});
```

---

## Lighting Models

### Lambert (Diffuse)
```glsl
float diffuse = max(dot(normal, lightDir), 0.0);
```
Cheap. No specular. Good for matte/stylized.

### Blinn-Phong (Specular)
```glsl
vec3 halfDir = normalize(lightDir + viewDir);
float spec = pow(max(dot(normal, halfDir), 0.0), shininess);
```
Classic specular. `shininess` 16–256. Not energy conserving.

### Cook-Torrance (PBR Specular)
```glsl
// D: GGX/Trowbridge-Reitz normal distribution
float D_GGX(float NdotH, float roughness) {
  float a2 = roughness * roughness;
  a2 *= a2; // remap to α²
  float denom = NdotH * NdotH * (a2 - 1.0) + 1.0;
  return a2 / (3.14159 * denom * denom);
}

// F: Schlick Fresnel
vec3 F_Schlick(float cosTheta, vec3 F0) {
  return F0 + (1.0 - F0) * pow(1.0 - cosTheta, 5.0);
}

// G: Smith-GGX geometry
float G_Smith(float NdotV, float NdotL, float roughness) {
  float k = (roughness + 1.0) * (roughness + 1.0) / 8.0;
  float g1 = NdotV / (NdotV * (1.0 - k) + k);
  float g2 = NdotL / (NdotL * (1.0 - k) + k);
  return g1 * g2;
}

// Full specular BRDF
vec3 specBRDF = D * F * G / (4.0 * NdotV * NdotL + 0.001);
```

### Energy Conservation
```glsl
vec3 kS = F_Schlick(max(dot(halfDir, viewDir), 0.0), F0);
vec3 kD = (1.0 - kS) * (1.0 - metalness); // metals have no diffuse
vec3 Lo = (kD * albedo / PI + specBRDF) * radiance * NdotL;
```

---

## Post-Processing Effects

Use with `EffectComposer` + custom `ShaderPass`:

```javascript
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
composer.addPass(new ShaderPass(MyEffect));
// In loop: composer.render() instead of renderer.render()
```

### Vignette

```glsl
uniform sampler2D tDiffuse;
varying vec2 vUv;
void main() {
  vec4 color = texture2D(tDiffuse, vUv);
  float d = length(vUv - 0.5);
  color.rgb *= smoothstep(0.8, 0.3, d);
  gl_FragColor = color;
}
```

### Chromatic Aberration

```glsl
float offset = 0.003;
float r = texture2D(tDiffuse, vUv + vec2(offset, 0.0)).r;
float g = texture2D(tDiffuse, vUv).g;
float b = texture2D(tDiffuse, vUv - vec2(offset, 0.0)).b;
gl_FragColor = vec4(r, g, b, 1.0);
```

### Film Grain

```glsl
float grain(vec2 co, float t) {
  return fract(sin(dot(co + t, vec2(12.9898, 78.233))) * 43758.5453);
}
// Mix: color.rgb += (grain(vUv * uResolution, uTime) - 0.5) * 0.08;
```

### Bloom (Simplified)

Bloom typically requires multi-pass (threshold → blur → composite). Use Three.js `UnrealBloomPass`:

```javascript
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
const bloom = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  1.5,  // strength
  0.4,  // radius
  0.85  // threshold
);
composer.addPass(bloom);
```

---

## Shadertoy → Three.js Conversion

### Variable Mapping

| Shadertoy | Three.js Equivalent |
|-----------|-------------------|
| `fragCoord` | `gl_FragCoord.xy` or `vUv * uResolution` |
| `iResolution` | `uniform vec2 uResolution` |
| `iTime` | `uniform float uTime` |
| `iTimeDelta` | `uniform float uDelta` |
| `iMouse` | `uniform vec4 uMouse` (xy=current, zw=click) |
| `iChannel0..3` | `uniform sampler2D uTex0..3` |
| `fragColor` | `gl_FragColor` |
| `mainImage(out vec4, in vec2)` | `void main()` |

### Conversion Template

**Shadertoy original:**
```glsl
void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = fragCoord / iResolution.xy;
  vec3 col = 0.5 + 0.5 * cos(iTime + uv.xyx + vec3(0,2,4));
  fragColor = vec4(col, 1.0);
}
```

**Three.js version:**
```glsl
uniform float uTime;
uniform vec2 uResolution;
varying vec2 vUv;

void main() {
  vec2 uv = vUv; // or gl_FragCoord.xy / uResolution.xy
  vec3 col = 0.5 + 0.5 * cos(uTime + uv.xyx + vec3(0, 2, 4));
  gl_FragColor = vec4(col, 1.0);
}
```

### Key Differences
- Replace `mainImage` signature with `void main()`
- Replace `fragCoord/iResolution.xy` with `vUv` (already 0–1)
- Replace `iResolution` / `iTime` / `iMouse` with your uniforms
- Replace `fragColor =` with `gl_FragColor =`
- Add `varying vec2 vUv;` and pass from vertex shader
- For multipass: each Shadertoy "Buffer" = separate render target + ShaderPass
- `texture(iChannel0, uv)` → `texture2D(uTex0, uv)` (WebGL1)

---

## SuperLuminova / Lume Glow Shader

A photoluminescent glow effect simulating watch lume (SuperLuminova):

```glsl
// Fragment shader
uniform float uTime;
uniform float uCharge;      // 0–1, how "charged" the lume is
uniform vec3 uLumeColor;    // e.g. vec3(0.6, 1.0, 0.8) for green lume
varying vec2 vUv;

void main() {
  // Base lume intensity with exponential decay
  float decay = exp(-uTime * 0.0005); // slow decay over hours
  float intensity = uCharge * decay;

  // Subtle noise variation (lume isn't perfectly uniform)
  float n = fract(sin(dot(vUv, vec2(12.9898, 78.233))) * 43758.5453);
  float variation = 0.9 + 0.1 * n;

  // Lume glow with bloom-like falloff
  float glow = intensity * variation;

  // Soft edge emission (thicker lume at edges glows more)
  float edgeBoost = 1.0 + 0.3 * smoothstep(0.0, 0.05, min(vUv.x, min(vUv.y, min(1.0 - vUv.x, 1.0 - vUv.y))));

  vec3 color = uLumeColor * glow * edgeBoost;

  // Add subtle blue shift as lume fades (characteristic of SrAl₂O₄:Eu²⁺)
  float fadeShift = smoothstep(0.5, 0.0, intensity);
  color = mix(color, color * vec3(0.7, 0.9, 1.2), fadeShift * 0.3);

  gl_FragColor = vec4(color, 1.0);
}
```

### Lume Color Presets

| Type | Color vec3 | Look |
|------|-----------|------|
| C3 SuperLuminova (green) | `(0.6, 1.0, 0.7)` | Classic green glow |
| BGW9 (blue) | `(0.4, 0.7, 1.0)` | Cool blue |
| Old radium (vintage) | `(0.9, 0.95, 0.6)` | Warm yellow-green |
| Orange lume | `(1.0, 0.6, 0.2)` | Warm orange |

Combine with bloom post-processing for realistic lume-in-the-dark effect. Use `MeshPhysicalMaterial.emissive` + `emissiveIntensity` for a simpler approach.

---

## Performance Tips

### Do

- **Use `smoothstep` over `if/else`** — GPU branches are expensive
- **Pre-compute constants** — move invariant math out of loops
- **Use `lowp`/`mediump`** where precision doesn't matter (colors, UVs)
- **Minimize texture lookups** — each is ~100x slower than a math op
- **Use mipmaps** — `texture2D` with minification without mipmaps = aliasing + slow
- **Pack data** — use all 4 channels (RGBA) of a texture, not separate textures
- **Use built-ins** — `mix`, `clamp`, `step` compile to single GPU instructions

### Don't

- **Avoid dynamic branching** — `if (noise > 0.5)` in fragment shaders kills parallelism
- **Avoid `discard`** — breaks early-Z optimization on many GPUs
- **Avoid dependent texture reads** — reading tex at coords computed from another tex read
- **Don't unroll too much** — keep FBM octaves ≤ 6–8 for real-time
- **Don't use `pow` with large exponents** — use approximations or LUTs
- **Avoid `sin`/`cos` in tight loops** — precompute or use polynomial approximations

### Mobile Gotchas

- `highp` may not be available in fragment shaders — check `GL_FRAGMENT_PRECISION_HIGH`
- Max texture units: often 8 (vs 16+ desktop)
- Max varying vectors: often 8
- Keep shader instructions under ~128 for older mobile GPUs
- Test on actual devices — emulators lie about performance

---

## References

- `references/noise-library.glsl` — Copy-paste noise implementations (Perlin, Simplex, Worley, FBM)
- `references/pbr-materials.md` — Extended PBR material database with F0 spectral values
