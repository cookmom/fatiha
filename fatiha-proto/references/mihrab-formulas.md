# Mihrab Geometric Formulas

## 1. Equilateral Pointed Arch

The arch type used in this mihrab is an **equilateral pointed arch** (two-center pointed arch where centers are at the springing points).

```
Span S = archWidth
Centers: C₁ = (cx - S/2, springY), C₂ = (cx + S/2, springY)
Radius: R = S (each arc radius equals the full span)
Apex height: H = S × √3/2 ≈ 0.866 × S
Apex point: (cx, springY - H)
Each arc sweeps 60° from horizontal to apex
```

**Parametric arc (left side, from springing to apex):**
```
For θ ∈ [0°, 60°]:
  x(θ) = C₁.x + R × cos(θ)
  y(θ) = C₁.y - R × sin(θ)
```

**Parametric arc (right side, from springing to apex):**
```
For θ ∈ [120°, 180°]:
  x(θ) = C₂.x + R × cos(θ)
  y(θ) = C₂.y - R × sin(θ)
```

**Derived values for this composition:**
- Canvas: 1080 × 1920
- S = 640 (arch span)
- R = 640
- H = 640 × √3/2 = 554.3
- Spring line Y = 1400
- Apex Y = 1400 - 554.3 = 845.7

---

## 2. Eight-Fold Star Pattern {8/3}

The interior geometric fill uses an **8-fold star pattern** based on the {8/3} star polygon (connect every 3rd vertex of a regular octagon).

### Star polygon {8/3}:
```
8 vertices at angles: k × 45° (k = 0..7), starting from top (-π/2)
  P_k = (cx + r × cos(k × π/4 - π/2), cy + r × sin(k × π/4 - π/2))

Star connection: each vertex P_k connects to P_{(k+3) mod 8}
Star point tip angle: 45°
```

### Inner octagon (formed by star intersections):
```
Inner radius: r_inner = r × (√2 - 1) ≈ 0.4142 × r
Inner octagon offset: rotated 22.5° (π/8) from outer vertices
  Q_k = (cx + r_inner × cos(k × π/4 - π/2 + π/8),
         cy + r_inner × sin(k × π/4 - π/2 + π/8))
```

### Kite shapes (between star points):
```
Each kite is formed by 4 points:
  - Two adjacent star points (outer)
  - Two adjacent inner octagon vertices (inner)
Area per kite = r² × sin(π/4) × (1 - (√2-1)²) / 2
```

### Tiling: {8,8,4} pattern
```
Wallpaper group: p4m (square lattice with 4-fold + reflections)
Unit cell: one octagon + two half-squares
Cell size: a = 2r × (1 + √2 - 1) = 2r (center-to-center)
Tile spacing: d = r × (1 + √2) for interlocking grid
```

---

## 3. Twelve-Fold Rosette (Central Medallion)

A 12-fold rosette at the arch center, based on {12/5} star polygon.

```
12 vertices at angles: k × 30° (k = 0..11)
  P_k = (cx + r × cos(k × π/6 - π/2), cy + r × sin(k × π/6 - π/2))

Star connection {12/5}: each P_k connects to P_{(k+5) mod 12}
Star point tip angle: 30°
Inner dodecagon radius: r × (2 - √3) ≈ 0.2679 × r
Wallpaper group: p6m
```

---

## 4. Border Band — Interlacing Zigzag

Frieze group: **p2mm** (translation + two perpendicular reflections + 180° rotation)

```
Band width: w = 28
Repeat unit length: L = w × √3 ≈ 48.5 (equilateral zigzag)
Zigzag angle: 60° to horizontal

Zigzag vertices along band:
  For each repeat i:
    Top vertex: (x₀ + i × L, bandY - w/2)
    Bottom vertex: (x₀ + i × L + L/2, bandY + w/2)

Second interlacing line: offset by L/2 → creates diamond chain
```

---

## 5. Arabesque Arch Molding

The arch molding uses a **sinusoidal vine scroll** following the arch curvature.

```
Along arch parameter t ∈ [0, 1] (from left springing to right springing via apex):
  Arch center line: (archX(t), archY(t)) — follows the pointed arch curve
  Normal to arch: n(t) perpendicular to tangent

Vine displacement:
  offset(t) = A × sin(2π × N × t)
  where A = amplitude (15px), N = number of oscillations (12)

Vine position:
  x(t) = archX(t) + offset(t) × n_x(t)
  y(t) = archY(t) + offset(t) × n_y(t)
```

---

## 6. Spandrel Pattern — 6-Fold Subtle Stars

Light embossed-feel pattern in the rectangular area outside the arch.

```
6-fold star {6/2} (Star of David):
  6 vertices at 60° intervals
  Connection: every 2nd vertex (two overlapping triangles)

Grid: hexagonal close-packed
  Row spacing: d × √3/2
  Column spacing: d
  Alternate rows offset: d/2
  Star radius: r_star = d/3
```

---

## 7. Column Proportions

Based on classical Islamic column proportions:

```
Column height: from base (Y=1500) to spring line (Y=1250)
Column width: S/12 ≈ 48px
Capital height: column_width × 0.6
Base height: column_width × 0.4

Twisted rope pattern (Solomon's column):
  Period: column_height / 5
  Twist angle: atan(period / (π × column_width/2))
```

---

## 8. Depth Shading (Blue Gradient)

Three-zone watercolor fill creating architectural depth:

```
Light blue (#4a7ab0): Y < archApex + H/3 (upper third)
  → highlights, catching light from above

Mid blue (#1a4a8a): archApex + H/3 < Y < springY - H/3
  → main body fill

Dark blue (#0a2a5a): Y > springY - H/3 (lower third)
  → shadows, recesses, depth illusion

Opacity gradient:
  opacity(y) = lerp(80, 160, (y - apexY) / (springY - apexY))
```

---

## Summary Table

| Element | Type | Key Formula | Parameters |
|---------|------|-------------|------------|
| Arch | Equilateral pointed | R = S, H = S√3/2 | S=640 |
| Star fill | {8/3} star polygon | 8 pts at 45° intervals | r=48, spacing=r×(1+√2)×0.78 |
| Palmette | Radial fan | 13 rays from apex | ray lengths 35–95 |
| Border | Sinusoidal scroll | A×sin(2πNt) along normals | A=10, N=18 |
| Spandrels | {8/3} hex grid | d×(1+√2)×0.9 spacing | r=48 |
| Columns | Jambs w/ scroll | Sinusoidal decoration | A=10, N=8 |
