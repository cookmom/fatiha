# Dichroic Glass Prism Cube — Implementation Plan

## Research Summary

### Technique Analysis

**1. drei-vanilla MeshTransmissionMaterial** (by @N8python)
- Uses `onBeforeCompile` to patch `MeshPhysicalMaterial` shaders
- Chromatic aberration: samples the scene FBO 3× per sample iteration, each with a **different IOR**:
  - R channel: `material.ior` (base)
  - G channel: `material.ior * (1.0 + chromaticAberration * t)` 
  - B channel: `material.ior * (1.0 + 2.0 * chromaticAberration * t)`
- Uses `samples` loop (default 6) with randomized normals for blur
- **Too heavy for mobile** — 6 samples × 3 texture reads = 18 texture fetches per pixel, plus noise functions

**2. Maxime Heckel's FBO Refraction**
- Render scene (minus glass) to FBO → pass as `uTexture` uniform
- Fragment shader: `refract(eyeVector, worldNormal, 1.0/ior)` → offset UV
- Dispersion: 3 separate `refract()` calls with different IOR per R/G/B channel
- **Lightweight and perfect for mobile** — only 3 texture reads

**3. Taylor Petrick's Dispersion (OpenGL)**
- Same core technique as Heckel but extended to 6 wavelengths for smoother gradients
- Can compress back to RGB — reduces banding artifacts
- Good middle ground but 6 texture reads

### Chosen Approach: Hybrid FBO + Fake Internal Dichroic Face

For mobile 60fps, we use Heckel's FBO technique (3 texture reads) enhanced with:
- A subtle internal diagonal "dichroic coating" simulated via the normal
- Fresnel-based rainbow iridescence on the internal face
- Specular highlights for glass realism

---

## Complete Implementation

### Architecture

```
1. Render scene (rings, beams, background) to FBO — exclude cube
2. Cube uses custom ShaderMaterial reading the FBO
3. Fragment shader: per-channel refraction + internal dichroic face + Fresnel
4. Animate cube rotation slowly for prismatic shimmer
```

### Vertex Shader

```glsl
varying vec3 vWorldNormal;
varying vec3 vEyeVector;
varying vec3 vWorldPosition;
varying vec3 vLocalPosition;

void main() {
  vec4 worldPos = modelMatrix * vec4(position, 1.0);
  vWorldPosition = worldPos.xyz;
  vLocalPosition = position;
  
  vec4 mvPosition = viewMatrix * worldPos;
  gl_Position = projectionMatrix * mvPosition;
  
  vEyeVector = normalize(worldPos.xyz - cameraPosition);
  vWorldNormal = normalize((modelMatrix * vec4(normal, 0.0)).xyz);
}
```

### Fragment Shader

```glsl
uniform sampler2D uSceneTexture;
uniform vec2 uResolution;
uniform float uIorR;
uniform float uIorG;
uniform float uIorB;
uniform float uChromaticAberration;
uniform float uFresnelPower;
uniform float uDichroicIntensity;
uniform float uTime;

varying vec3 vWorldNormal;
varying vec3 vEyeVector;
varying vec3 vWorldPosition;
varying vec3 vLocalPosition;

// Simulate the internal diagonal dichroic coating
// Real dichroic cubes have a diagonal face that reflects some wavelengths
// and transmits others — we fake this with a normal perturbation
vec3 getDichroicNormal(vec3 normal, vec3 localPos) {
  // Internal diagonal plane: x + y = 0 (45° through cube center)
  // Distance from the diagonal
  float diag = localPos.x + localPos.y;
  // Blend factor: how close this fragment is to the internal face
  float diagInfluence = exp(-abs(diag) * 8.0) * uDichroicIntensity;
  // Perturb normal toward diagonal plane normal
  vec3 diagNormal = normalize(vec3(1.0, 1.0, 0.0));
  return normalize(mix(normal, diagNormal, diagInfluence));
}

// Thin-film iridescence approximation for dichroic coating
vec3 dichroicColor(float cosTheta, float thickness) {
  // Pearlescent/rainbow based on view angle
  float phase = 2.0 * 3.14159 * thickness * cosTheta;
  return vec3(
    0.5 + 0.5 * cos(phase),
    0.5 + 0.5 * cos(phase - 2.094),  // -2π/3
    0.5 + 0.5 * cos(phase + 2.094)   // +2π/3
  );
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;
  vec3 normal = normalize(vWorldNormal);
  
  // Apply dichroic internal face perturbation
  vec3 dichroicN = getDichroicNormal(normal, vLocalPosition);
  
  // Per-channel refraction with different IOR (dispersion)
  float iorR = 1.0 / uIorR;
  float iorG = 1.0 / uIorG;
  float iorB = 1.0 / uIorB;
  
  vec3 refractR = refract(vEyeVector, dichroicN, iorR);
  vec3 refractG = refract(vEyeVector, dichroicN, iorG);
  vec3 refractB = refract(vEyeVector, dichroicN, iorB);
  
  // Sample scene texture with refracted UVs
  float R = texture2D(uSceneTexture, uv + refractR.xy).r;
  float G = texture2D(uSceneTexture, uv + refractG.xy).g;
  float B = texture2D(uSceneTexture, uv + refractB.xy).b;
  
  vec3 refractedColor = vec3(R, G, B);
  
  // Fresnel reflection (glass edges glow)
  float cosTheta = 1.0 - abs(dot(vEyeVector, normal));
  float fresnel = pow(cosTheta, uFresnelPower);
  
  // Dichroic thin-film color on internal diagonal
  float diag = vLocalPosition.x + vLocalPosition.y;
  float diagInfluence = exp(-abs(diag) * 8.0) * uDichroicIntensity;
  vec3 iridescence = dichroicColor(cosTheta, 3.0 + uTime * 0.1);
  
  // Combine: refracted scene + dichroic iridescence + fresnel edge glow
  vec3 finalColor = refractedColor;
  finalColor = mix(finalColor, finalColor * iridescence, diagInfluence * 0.6);
  finalColor += fresnel * 0.15; // Subtle white edge reflection
  finalColor += iridescence * diagInfluence * fresnel * 0.3; // Rainbow on edges near diagonal
  
  gl_FragColor = vec4(finalColor, 1.0);
}
```

### Three.js Setup Code

```javascript
// ============================================================
// Dichroic Prism Cube — Three.js r170 ES Module Implementation
// ============================================================

// 1. Create render target for FBO
const fboResolution = window.devicePixelRatio > 1 ? 0.5 : 1.0; // Half-res on high-DPR for perf
const renderTarget = new THREE.WebGLRenderTarget(
  window.innerWidth * fboResolution,
  window.innerHeight * fboResolution,
  { 
    minFilter: THREE.LinearFilter, 
    magFilter: THREE.LinearFilter,
    format: THREE.RGBAFormat 
  }
);

// 2. Cube geometry + shader material
const cubeSize = 0.4; // Adjust to your scene scale
const cubeGeometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);

const cubeMaterial = new THREE.ShaderMaterial({
  vertexShader: VERTEX_SHADER,   // from above
  fragmentShader: FRAGMENT_SHADER, // from above
  uniforms: {
    uSceneTexture: { value: null },
    uResolution: { value: new THREE.Vector2(
      window.innerWidth * window.devicePixelRatio,
      window.innerHeight * window.devicePixelRatio
    )},
    uIorR: { value: 1.15 },  // Red refracts least
    uIorG: { value: 1.18 },  // Green in middle  
    uIorB: { value: 1.22 },  // Blue refracts most
    uChromaticAberration: { value: 0.06 },
    uFresnelPower: { value: 3.0 },
    uDichroicIntensity: { value: 0.7 },
    uTime: { value: 0 },
  },
  transparent: false,
  side: THREE.FrontSide,
});

const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
cube.rotation.set(Math.PI / 6, Math.PI / 4, 0); // Angled to show diagonal
scene.add(cube);

// 3. Render loop with FBO pass
function animate(time) {
  requestAnimationFrame(animate);
  
  const t = time * 0.001;
  cubeMaterial.uniforms.uTime.value = t;
  
  // Slow cube rotation for prismatic shimmer
  cube.rotation.y = Math.PI / 4 + Math.sin(t * 0.3) * 0.1;
  cube.rotation.x = Math.PI / 6 + Math.cos(t * 0.2) * 0.05;
  
  // --- FBO Pass: render scene WITHOUT cube ---
  cube.visible = false;
  renderer.setRenderTarget(renderTarget);
  renderer.render(scene, camera);
  renderer.setRenderTarget(null);
  cube.visible = true;
  
  // Pass FBO texture to cube material
  cubeMaterial.uniforms.uSceneTexture.value = renderTarget.texture;
  
  // --- Main Pass: render everything including cube ---
  renderer.render(scene, camera);
}
animate(0);

// 4. Handle resize
window.addEventListener('resize', () => {
  renderTarget.setSize(
    window.innerWidth * fboResolution,
    window.innerHeight * fboResolution
  );
  cubeMaterial.uniforms.uResolution.value.set(
    window.innerWidth * window.devicePixelRatio,
    window.innerHeight * window.devicePixelRatio
  );
});
```

### Lighting Setup for Beam Emergence

```javascript
// The three "clock hand" beams should be separate meshes (thin planes or 
// cylinders with emissive material) placed BEHIND the cube, so they appear
// in the FBO texture and get refracted through it.

// Beam material (emissive, bright)
const beamMaterial = new THREE.MeshBasicMaterial({
  color: 0xffffff,
  transparent: true,
  opacity: 0.9,
  side: THREE.DoubleSide,
});

// Create thin beam planes extending from cube center outward
function createBeam(angle, length, width) {
  const geom = new THREE.PlaneGeometry(length, width);
  geom.translate(length / 2, 0, 0); // Pivot from one end
  const beam = new THREE.Mesh(geom, beamMaterial.clone());
  beam.rotation.z = angle;
  beam.position.z = -0.01; // Slightly behind cube center
  return beam;
}

// The beams are part of the scene, so they'll appear in the FBO and
// get chromatically split by the cube's refraction — this naturally
// creates the "light emerging from prism" effect!
```

---

## Performance Budget (Mobile)

| Component | Cost |
|-----------|------|
| FBO render pass | 1 extra scene render (cheap if scene is simple rings) |
| Fragment shader | 3 texture reads + math (~0.1ms on Adreno 640) |
| Total draw calls | +1 (cube) + 1 (FBO pass) |
| Expected FPS | 60fps on iPhone 12+, Pixel 5+ |

### Optimizations Applied
- **3 samples only** (not 6-18 like MeshTransmissionMaterial)
- **Half-res FBO** on high-DPR devices
- **No noise/blur** — clean refraction is actually more prism-like
- **No multi-pass** — single FBO + main render
- **BoxGeometry** — 12 triangles, trivial

### If Still Too Slow
- Drop to 2 channels (R+B only, derive G as average)
- Use `THREE.HalfFloatType` for FBO
- Skip FBO entirely and use a cubemap environment instead (loses dynamic refraction of rings)

---

## Key IOR Values for Dichroic Look

Real beam-splitting cubes use BK7 glass (IOR ~1.52). For an exaggerated artistic look:

```
uIorR: 1.15   // Low dispersion (red bends least)  
uIorG: 1.18   // Medium
uIorB: 1.22   // High dispersion (blue bends most)
```

For subtle realism: narrow the range to 1.50–1.54.
For dramatic rainbow: widen to 1.10–1.30.

---

## The "Internal Dichroic Face" Trick

Real dichroic cubes are two right-angle prisms cemented together with a thin-film dichroic coating on the diagonal interface. The fragment shader simulates this by:

1. Computing distance from each fragment to the diagonal plane (`x + y = 0` in local space)
2. Fragments near the diagonal get their normal perturbed toward the diagonal's normal
3. This creates a visible "split" in the refraction pattern — exactly like a real beam splitter
4. Thin-film iridescence colors are added along this internal face based on view angle

The `uDichroicIntensity` uniform (0–1) controls how pronounced this effect is. At 0.7, you get a visible rainbow streak along the diagonal without overwhelming the refraction.
