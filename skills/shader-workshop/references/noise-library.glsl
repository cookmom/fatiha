// ============================================================
// Noise Library — Copy-paste GLSL noise functions
// For use with shader-workshop skill
// ============================================================

// ------------------------------------------------------------
// HASH FUNCTIONS (pseudo-random, no texture needed)
// ------------------------------------------------------------

float hash(float n) { return fract(sin(n) * 43758.5453123); }
float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
vec2 hash2(vec2 p) {
  return fract(sin(vec2(dot(p, vec2(127.1, 311.7)),
                        dot(p, vec2(269.5, 183.3)))) * 43758.5453);
}
vec3 hash3(vec2 p) {
  vec3 q = vec3(dot(p, vec2(127.1, 311.7)),
                dot(p, vec2(269.5, 183.3)),
                dot(p, vec2(419.2, 371.9)));
  return fract(sin(q) * 43758.5453);
}

// ------------------------------------------------------------
// VALUE NOISE (2D)
// ------------------------------------------------------------

float valueNoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f); // cubic hermite

  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));

  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

// ------------------------------------------------------------
// PERLIN / GRADIENT NOISE (2D) — based on Inigo Quilez
// ------------------------------------------------------------

vec2 gradientDir(vec2 p) {
  p = mod(p, 289.0);
  float x = mod(((34.0 * p.x + 1.0) * p.x), 289.0) + p.y;
  x = mod((34.0 * x + 1.0) * x, 289.0);
  x = fract(x / 41.0) * 2.0 - 1.0;
  return normalize(vec2(x, abs(x) - 0.5));
}

float gradientNoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0); // quintic

  return mix(mix(dot(gradientDir(i + vec2(0, 0)), f - vec2(0, 0)),
                 dot(gradientDir(i + vec2(1, 0)), f - vec2(1, 0)), u.x),
             mix(dot(gradientDir(i + vec2(0, 1)), f - vec2(0, 1)),
                 dot(gradientDir(i + vec2(1, 1)), f - vec2(1, 1)), u.x), u.y);
}

// Alias
float perlinNoise(vec2 p) { return gradientNoise(p); }

// ------------------------------------------------------------
// SIMPLEX NOISE (2D) — Ashima Arts / Ian McEwan
// ------------------------------------------------------------

vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 permute(vec3 x) { return mod289(((x * 34.0) + 1.0) * x); }

float simplexNoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187,   // (3.0-sqrt(3.0))/6.0
                      0.366025403784439,   // 0.5*(sqrt(3.0)-1.0)
                     -0.577350269189626,   // -1.0 + 2.0 * C.x
                      0.024390243902439);  // 1.0 / 41.0

  vec2 i = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);

  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;

  i = mod289(i);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0))
                          + i.x + vec3(0.0, i1.x, 1.0));

  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy),
                           dot(x12.zw, x12.zw)), 0.0);
  m = m * m;
  m = m * m;

  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;

  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);

  vec3 g;
  g.x = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

// ------------------------------------------------------------
// WORLEY / CELLULAR NOISE (2D)
// ------------------------------------------------------------

// Returns (F1, F2) — distances to nearest and second-nearest cell point
vec2 worleyNoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);

  float f1 = 1.0;
  float f2 = 1.0;

  for (int y = -1; y <= 1; y++) {
    for (int x = -1; x <= 1; x++) {
      vec2 neighbor = vec2(float(x), float(y));
      vec2 point = hash2(i + neighbor);
      vec2 diff = neighbor + point - f;
      float d = dot(diff, diff); // squared distance

      if (d < f1) {
        f2 = f1;
        f1 = d;
      } else if (d < f2) {
        f2 = d;
      }
    }
  }

  return sqrt(vec2(f1, f2));
}

// Convenience: just F1
float cellNoise(vec2 p) { return worleyNoise(p).x; }

// Cracked pattern: F2 - F1
float cracks(vec2 p) {
  vec2 w = worleyNoise(p);
  return w.y - w.x;
}

// ------------------------------------------------------------
// FBM (Fractal Brownian Motion) — works with any noise function
// ------------------------------------------------------------

// Generic FBM using value noise
float fbm(vec2 p) {
  float value = 0.0;
  float amplitude = 0.5;
  float frequency = 1.0;
  for (int i = 0; i < 6; i++) {
    value += amplitude * valueNoise(p * frequency);
    frequency *= 2.0;
    amplitude *= 0.5;
  }
  return value;
}

// FBM with simplex noise
float fbmSimplex(vec2 p) {
  float value = 0.0;
  float amplitude = 0.5;
  float frequency = 1.0;
  for (int i = 0; i < 6; i++) {
    value += amplitude * simplexNoise(p * frequency);
    frequency *= 2.0;
    amplitude *= 0.5;
  }
  return value;
}

// Ridged FBM (mountains, ridges)
float fbmRidged(vec2 p) {
  float value = 0.0;
  float amplitude = 0.5;
  float frequency = 1.0;
  float prev = 1.0;
  for (int i = 0; i < 6; i++) {
    float n = abs(simplexNoise(p * frequency));
    n = 1.0 - n;    // invert
    n = n * n;       // sharpen
    n *= prev;       // weight by previous octave
    prev = n;
    value += n * amplitude;
    frequency *= 2.0;
    amplitude *= 0.5;
  }
  return value;
}

// Turbulence (absolute value FBM)
float turbulence(vec2 p) {
  float value = 0.0;
  float amplitude = 0.5;
  float frequency = 1.0;
  for (int i = 0; i < 6; i++) {
    value += amplitude * abs(simplexNoise(p * frequency));
    frequency *= 2.0;
    amplitude *= 0.5;
  }
  return value;
}

// ------------------------------------------------------------
// CURL NOISE (2D → 2D, divergence-free)
// ------------------------------------------------------------

vec2 curlNoise(vec2 p) {
  float eps = 0.001;
  float n1 = simplexNoise(vec2(p.x, p.y + eps));
  float n2 = simplexNoise(vec2(p.x, p.y - eps));
  float a = (n1 - n2) / (2.0 * eps);

  n1 = simplexNoise(vec2(p.x + eps, p.y));
  n2 = simplexNoise(vec2(p.x - eps, p.y));
  float b = (n1 - n2) / (2.0 * eps);

  return vec2(a, -b);
}

// ------------------------------------------------------------
// 3D SIMPLEX NOISE (for volumetric / time-varying effects)
// ------------------------------------------------------------

vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
float mod289(float x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float simplexNoise3D(vec3 v) {
  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

  vec3 i = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);

  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);

  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;

  i = mod289(i);
  vec4 p = permute(permute(permute(
    i.z + vec4(0.0, i1.z, i2.z, 1.0))
  + i.y + vec4(0.0, i1.y, i2.y, 1.0))
  + i.x + vec4(0.0, i1.x, i2.x, 1.0));

  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);

  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);

  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;

  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);

  vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;

  vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}
