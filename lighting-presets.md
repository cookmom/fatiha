# Lighting Presets — Three.js Clock

## 🏆 "NOMOS Studio" (v75 — CURRENT FAVORITE)
The one Tawfeeq liked. Warm/cool split, orange second hand, no shadows.
```
Key: RectAreaLight(0xfff5e8, 3.5, 250, 250) at (-50, 140, 250)
Cool Fill: RectAreaLight(0xc8d8f0, 1.2, 200, 200) at (120, 40, 150)
Front Fill: RectAreaLight OFF (0)
Spot: SpotLight(0xffeedd, 1.5, 400, PI*0.12, 0.7, 1.5) at (20, -40, 250) → target (0, -R*0.3, 0)
Point Spec: PointLight(0xffffff, 15, 300, 2) at (30, 60, 180)
Ambient: 0.3
Shadows: OFF
HDRI/Env: NONE
Exposure: 1.5
Tone: ACES Filmic
MSAA: 4x
Hands: MeshPhysical(roughness:0.15, metalness:0.5, clearcoat:1.0, clearcoatRoughness:0.05)
Dial: MeshPhysical(roughness:0.88, metalness:0, sheen:0.25, sheenColor:#706860, sheenRoughness:0.8)
Gauge: MeshPhysical(color:#a8b0b8, roughness:0.4, metalness:0.5, clearcoat:0.3)
SecHand: MeshStandard(roughness:0.3, metalness:0.15)
Palette: bg:#585860, lume:#e8e0c8, hand:#d0d0d4, sec:#ff6633, text:#e8e0c8
Background: #1a1a22
```

## "Clean Slate" (v57 — pre-creative)
Stable, no blowout, HDRI shielded from non-metals. Before dark bg experiments.
```
Key: DirectionalLight(0xffffff, 1.0) at (-40, 200, 200) — castShadow
Fill: DirectionalLight(0xffffff, 0.45) at (60, -60, 200)
Rect: RectAreaLight(0xffffff, 0.5, 447, 447) at (0, 0, 300)
Ambient: 0.25
Shadows: VSM, 2048, radius 3
HDRI: studio_small_08, envIntensity 0.9 (async load)
Exposure: 1.1
Hands: MeshPhysical(roughness:0.04, metalness:0.95, clearcoat:0.9)
Dial: envMapIntensity=0 on dial/lume/numerals
Palette: bg:#3a3a44, lume:#c0c0ca, hand:#e0e0e4, sec:#f0f0f4
Background: matches dial
```

## "Product Shot" (v51 — first good HDRI moment)
When the HDRI first clicked. More overhead light, dramatic.
```
Key: DirectionalLight(0xffffff, 1.0) at (-40, 200, 200) — castShadow
Rect: RectAreaLight(0xffffff, 0.5, 447, 447) at (0, 0, 300)
Ambient: 0.25
Fill: OFF
Shadows: VSM, 2048, radius 3
HDRI: studio_small_03, envIntensity 0.6
Exposure: 1.1
Hands: MeshPhysical(roughness:0.08, metalness:0.95, clearcoat:0.8)
Palette: original slate
```

## "Soft Rect Only" (v70 — first all-rect test)
When directional was first replaced. Soft, no artifacts, a bit washed.
```
Key: RectAreaLight(0xfff5e8, 3, 300, 300) at (-60, 160, 220)
Fill Rect: RectAreaLight(0xffffff, 0.3, 447, 447) at (0, 0, 300)
Rim: DirectionalLight(0xddeeff, 0.35) at (80, 40, -100)
Spot: SpotLight(0xffeedd, 2.0) on gauge
Ambient: 0.3
Shadows: OFF
HDRI: NONE
Exposure: 1.8
Palette: bg:#4a4a54, original colors
```

---
*Updated: 2026-02-15*
