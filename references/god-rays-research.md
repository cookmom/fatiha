# God Rays + Dust Motes — Lookdev Research Brief
*Chris (lookdev) — 2026-02-27*

## 1. God Ray Techniques Compared

### A. Screen-Space Radial Blur (Post-Process)
GPU Gems 3 Ch.13 (Kenny Mitchell). Render light as white, occluders as black, radial blur toward projected light position.

| Pros | Cons |
|------|------|
| Cheap — single fullscreen pass | Rays only work when light source on-screen or near edge |
| Battle-tested | **Our camera looks DOWN — light is BEHIND camera. Projects to center = uniform glow, not shafts** |
| Easy to tune | Doesn't interact with geometry |

**Verdict: ❌ POOR FIT.** Camera-light geometry is wrong.

### B. Shadow-Map Raymarching (three-good-godrays)
Raymarch through world space, sample light's shadow map at each step. Accumulate lit samples → volumetric density.

| Pros | Cons |
|------|------|
| True volumetric — any camera/light angle | 40-60 steps per pixel × shadow map lookups |
| Cube casts real shaped shadows | 60 steps at full res on iPhone 14 is borderline |
| `three-good-godrays` npm package, pmndrs compatible | Requires EffectComposer (~50KB deps) |

**Verdict: ✅ BEST PHYSICALLY CORRECT. But expensive — needs 1/2 res + ~30 steps. Upgrade path for later.**

### C. Mesh-Based Light Shaft (Fake Volumetric)
ConeGeometry from light source, custom shader: alpha by view angle (Fresnel), distance attenuation, additive blending.

References: `threex.volumetricspotlight` (Jerome Etienne), Spite's looper #251.

| Pros | Cons |
|------|------|
| **~0.1ms** — just a mesh | Doesn't respect occluders |
| Works from any angle | Requires art direction |
| No EffectComposer | Less physically based |
| Trivially 60fps everywhere | |

**Verdict: ✅ BEST PERFORMANCE/AESTHETIC RATIO. Cathedral light is faked this way in film VFX.**

### D. Hybrid: Mesh Shaft + Shaped Mask
Cone mesh with gobo/cookie texture mimicking cube's shadow shape.

**Verdict: ✅ STRONG. Shaped god rays for free if we derive mask from cube's refraction.**

---

## 2. Dust Particles Compared

### A. THREE.Points + BufferGeometry ✅ RECOMMENDED
200-500 motes, custom ShaderMaterial, soft circle texture. Brightness via Mie forward scattering.

**Light-catching shader:**
```glsl
uniform vec3 lightPos;
uniform vec3 lightDir;
varying float vBrightness;

void main() {
  vec3 toLight = normalize(lightPos - position);
  // Mie-like forward scattering: bright when between camera and light
  float scatter = pow(max(dot(normalize(cameraPosition - position), -toLight), 0.0), 4.0);
  // Bright when in the light cone
  float inCone = smoothstep(cos(coneAngle), 1.0, dot(-toLight, lightDir));
  vBrightness = mix(0.05, 1.0, scatter * inCone);
}
```

### B. Sprites ❌ NEVER
200 sprites = 200 draw calls = death on mobile.

### C. GPU Compute ❌ OVERKILL
WebGL2 has no compute shaders. FBO ping-pong possible but insane for 200 motes.

### D. InstancedMesh 🟡 VIABLE BUT UNNECESSARY
Points with soft texture look identical at this scale.

---

## 3. Recommended Implementation

### Mesh Cone God Ray
- Inverted `ConeGeometry` — wide at top (light), narrowing toward cube
- `ShaderMaterial`: `transparent: true, blending: AdditiveBlending, depthWrite: false, side: DoubleSide`
- Alpha: view-angle Fresnel + distance attenuation + optional scrolling noise
- Opacity: 0.03-0.08 max — divine light is SUBTLE
- Color: warm white `vec3(1.0, 0.95, 0.85)` with gold hint
- **Cost: ~0.1ms**

### Points Dust Motes
- 200-400 particles in volume around/above cube
- CPU: gentle Brownian drift, slow downward bias, respawn below floor
- Shader: soft circle, Mie forward scattering brightness
- Size: 2-5px, additive blending, depthWrite: false
- Color: warm white matching cone tint
- **Cost: ~0.2ms**

### Total: ~0.3ms. Zero EffectComposer. Zero additional render passes.

---

## 4. Key Shader Snippets

### God Ray Cone — Fragment
```glsl
uniform vec3 lightColor;    // vec3(1.0, 0.95, 0.85)
uniform float attenuation;  // 2.0-5.0
uniform float anglePower;   // 2.0-8.0 (edge falloff)
uniform float maxOpacity;   // 0.03-0.08

varying vec3 vWorldPos;
varying vec3 vNormal;
varying float vDistFromApex;

void main() {
  // Fresnel-like: transparent looking straight in, visible from the side
  vec3 viewDir = normalize(cameraPosition - vWorldPos);
  float edgeFade = 1.0 - abs(dot(normalize(vNormal), viewDir));
  edgeFade = pow(edgeFade, anglePower);

  // Distance attenuation along cone length
  float distFade = pow(1.0 - vDistFromApex, attenuation);

  float alpha = edgeFade * distFade * maxOpacity;
  gl_FragColor = vec4(lightColor, alpha);
}
```

### God Ray Cone — Vertex
```glsl
varying vec3 vWorldPos;
varying vec3 vNormal;
varying float vDistFromApex;

uniform float coneHeight;

void main() {
  vec4 worldPos = modelMatrix * vec4(position, 1.0);
  vWorldPos = worldPos.xyz;
  vNormal = normalize(normalMatrix * normal);
  // 0 at apex (light), 1 at base (floor)
  vDistFromApex = clamp(position.y / coneHeight, 0.0, 1.0);
  gl_Position = projectionMatrix * viewMatrix * worldPos;
}
```

### Dust Mote — Fragment
```glsl
uniform vec3 dustColor;
varying float vBrightness;
varying float vSize;

void main() {
  // Soft circle
  float d = length(gl_PointCoord - vec2(0.5));
  float alpha = 1.0 - smoothstep(0.3, 0.5, d);
  alpha *= vBrightness * 0.6; // keep subtle
  gl_FragColor = vec4(dustColor, alpha);
}
```

---

## 5. References

| Resource | Type | Notes |
|----------|------|-------|
| [three-good-godrays](https://github.com/ameobea/three-good-godrays) | npm | Shadow-map raymarched. Upgrade path. |
| [threex.volumetricspotlight](https://github.com/jeromeetienne/threex.volumetricspotlight) | Library | Classic mesh cone shader concept |
| [Spite's looper #251](https://github.com/spite/looper/blob/master/loops/251.js) | Demo | Elegant minimal mesh cones |
| [GPU Gems 3 Ch.13](https://developer.nvidia.com/gpugems/GPUGems3/gpugems3_ch13.html) | Paper | OG screen-space technique |
| [Codrops Volumetric Light Rays](https://tympanus.net/codrops/2022/06/27/volumetric-light-rays-with-three-js/) | Tutorial | Step-by-step Three.js |
| [Three.js BufferGeometry particles](https://threejs.org/examples/#webgl_buffergeometry_custom_attributes_particles) | Official | Custom per-particle attributes |
