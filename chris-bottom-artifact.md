# Bottom Edge Artifact — Chris Lookdev Analysis

**Verdict: Mixed. The bright diagonal streak is physically correct. The bottom rim band is artistic, not physical.**

---

## What the screenshot shows

A bright, sharp diagonal streak emanating from the cube's bottom corner, plus a faint luminous band hugging the very base perimeter of the cube.

---

## Term-by-term breakdown

### 1. `edgeCatch` — **PHYSICALLY CORRECT**
```glsl
float NdotV = max(dot(Nw, Vw), 0.0);
float edgeCatch = pow(1.0 - NdotV, 4.5);
col += vec3(0.70, 0.85, 1.00) * edgeCatch * 1.30;
```
At the bottom *corners* of the cube, two faces meet at a hard edge. The interpolated world normal at those edge fragments is near-perpendicular to the view vector (NdotV → 0), which fires `edgeCatch` very hard. On real optical glass this is exactly where you'd see the brightest Fresnel return — the glass physically concentrates reflected energy at grazing silhouette angles. The `1.30` multiplier is strong, but the underlying behavior is correct Fresnel physics. **This is not a bug.**

### 2. `bottomAtten` — **PHYSICALLY MOTIVATED**
```glsl
float bottomAtten = 1.0 - 0.55 * smoothstep(-0.3, -0.95, Nw.y);
col = refracted * vec3(1.00, 1.00, 1.00) * 2.8 * bottomAtten;
```
Reduces transmission brightness on downward-facing normals to prevent the bottom face from blowing out when the refraction samples a bright area of the scene texture. Approximates the reduced transmittance at steep internal angles. Not derived from first principles but the *direction* is physically correct. **Not a bug.**

### 3. `bottomFace` — **ARTISTIC (minor)**
```glsl
float bottomFace = smoothstep(-0.5, -0.92, Nw.y);
col += vec3(0.35, 0.45, 0.7) * bottomFace * 0.03;
```
Pure artistic emission — not physically derived. At 0.03 strength it's extremely subtle (barely adds 1–2% brightness). Not the source of any visible artifact. **Ignore.**

### 4. `bottomRim` — **ARTISTIC, NOT PHYSICAL — the band you're seeing**
```glsl
float bottomRim = smoothstep(-0.7, -0.98, Nw.y) * (1.0 - smoothstep(-0.98, -1.0, Nw.y));
col += vec3(0.6, 0.7, 1.0) * bottomRim * 0.25;
```
This is the source of the luminous band at the cube's base perimeter. It's a **manually authored halo** — a smoothstep window that peaks at `Nw.y ≈ -0.98` (nearly straight-down normals), adding a bright blue-white band exactly at the cube's bottom edge ring. There is no glass physics behind this. It was added intentionally to "separate cube from dark podium" but it's an artist hack, not a physical phenomenon. At `0.25` strength it's clearly visible.

**Real physics at the bottom edge:** A real glass cube sitting on a surface would show caustic refraction patterns *projected onto the surface beneath it*, not a glowing ring on the cube itself. The cube's bottom face would be dark or show scene texture refracted upward. There would be no self-illuminated rim.

---

## Conclusion

| Effect | Physical? | Visible artifact? | Fix needed? |
|--------|-----------|-------------------|-------------|
| `edgeCatch` at bottom corners | ✅ Yes — Fresnel grazing angle | Yes — bright diagonal streak | No |
| `bottomAtten` | ✅ Motivated | No | No |
| `bottomFace * 0.03` | ❌ Artistic | No (too subtle) | No |
| `bottomRim * 0.25` | ❌ Artistic hack | **Yes — glowing perimeter band** | Optional |

**The diagonal bright streak = correct Fresnel physics. Leave it.**

**The glowing perimeter band = `bottomRim` — artistic, not physical.** Whether to remove it is a *taste* call, not a bug fix. It was put there on purpose to lift the cube off the dark plinth visually. If Tawfeeq likes the way the cube reads off the plinth, leave it. If it reads as a glitch on-device, it can be tuned down (`0.25` → `0.10`) or removed entirely — one line, zero visual side effects elsewhere.

---

## If Tawfeeq wants to tune it

**Reduce** (subtle, still separates cube from plinth):
```glsl
// line 754 — was 0.25
col += vec3(0.6, 0.7, 1.0) * bottomRim * 0.10;
```

**Remove entirely** (purist glass — no artistic band):
```glsl
// delete or comment out lines 753–754
```

No other shader terms need touching. Surgical.
