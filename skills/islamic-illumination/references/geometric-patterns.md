<!-- بسم الله الرحمن الرحيم -->

# Islamic Geometric Patterns — Design Reference

## Overview

Islamic geometric art is based on **infinite tiling** — mathematical structures that extend outlessly across surfaces. All patterns derive from a small set of underlying constructions:
1. **Star polygon** lattices (the points)
2. **Connecting lines** (the infill between stars)
3. **Girih tiles** (5 master shapes that tile the plane)

The aesthetic goal: dense, interlocking complexity that resolves into perfect order — symbolizing the infinite nature of Allah's creation.

---

## 1. Star Polygon Formula {n/k}

A `{n/k}` star polygon is drawn by:
1. Place `n` points equally spaced on a circle
2. Connect every `k`th point in a single continuous path

**Constraint:** `gcd(n, k) = 1` for a single continuous polygon.  
If `gcd(n, k) > 1`, the star decomposes into multiple overlapping polygons.

```js
function drawStarPolygon(cx, cy, R, n, k, startAngle = -HALF_PI) {
  const pts = [];
  for (let i = 0; i < n; i++) {
    const a = startAngle + (i * TWO_PI / n);
    pts.push([cx + R * cos(a), cy + R * sin(a)]);
  }
  beginShape();
  for (let i = 0; i < n; i++) {
    const [x, y] = pts[(i * k) % n];
    vertex(x, y);
  }
  endShape(CLOSE);
}
```

### Common Star Polygons in Islamic Art

| Symbol | n | k | Points | Pattern Use |
|--------|---|---|--------|-------------|
| {6/2} | 6 | 2 | 6 | Two overlapping triangles (Star of David) |
| {8/3} | 8 | 3 | 8 | 8-pointed star, basic Mamluk/Ottoman |
| {10/3} | 10 | 3 | 10 | 10-pointed star, rare accent |
| {10/4} | 10 | 4 | 10 | 5-pointed inner star (use {5/2} instead) |
| {12/5} | 12 | 5 | 12 | 12-pointed star, Ottoman crowns |
| {12/4} | 12 | 4 | — | 3 overlapping squares |

---

## 2. Six-Fold Patterns (Hexagonal Grid)

Based on the equilateral triangle / regular hexagon lattice.

**Lattice unit vectors:**
```
a1 = (1, 0)
a2 = (0.5, √3/2)
```

### 6-Pointed Star Construction

1. Draw regular hexagon (6 sides)
2. Connect alternate vertices → 2 overlapping equilateral triangles = {6/2}
3. For a tighter 6-star: use inner-point construction with `innerR = R × tan(30°) / tan(30° + stellationAngle)`

**Common stellation:** 6-fold with 30° points = basic star hexagon.

```js
function hexStar(cx, cy, R) {
  // Outer 6 points
  const outer = Array.from({length: 6}, (_, i) => ({
    x: cx + R * cos(i * PI/3 - PI/6),
    y: cy + R * sin(i * PI/3 - PI/6)
  }));
  // Inner 6 points (at 30° offset, innerR)
  const innerR = R * 0.4;
  const inner = Array.from({length: 6}, (_, i) => ({
    x: cx + innerR * cos(i * PI/3 + PI/6),
    y: cy + innerR * sin(i * PI/3 + PI/6)
  }));
  // Interleave for star shape
  beginShape();
  for (let i = 0; i < 6; i++) {
    vertex(outer[i].x, outer[i].y);
    vertex(inner[i].x, inner[i].y);
  }
  endShape(CLOSE);
}
```

---

## 3. Eight-Fold Patterns (Square Grid)

Based on the square lattice, 45° rotations.

**Lattice unit vector:** `a1 = (1, 0)`, `a2 = (0, 1)`

### 8-Pointed Star ({8/3}) Construction

Method: Overlapping squares at 45° rotation.

```js
function octaStar(cx, cy, R) {
  // Square 1 (0°)
  beginShape();
  for (let i = 0; i < 4; i++) {
    vertex(cx + R * cos(i * HALF_PI), cy + R * sin(i * HALF_PI));
  }
  endShape(CLOSE);
  // Square 2 (45°)
  beginShape();
  for (let i = 0; i < 4; i++) {
    vertex(cx + R * cos(i * HALF_PI + PI/4), cy + R * sin(i * HALF_PI + PI/4));
  }
  endShape(CLOSE);
}
```

Or using {8/3} star polygon formula: n=8, k=3, startAngle=−HALF_PI.

**8-fold infill tiles:**
- Between stars: small squares (rotated 45°)
- At interstices: L-shaped "kite" forms
- At grid centers: octagon forms

---

## 4. Ten-Fold Patterns (Pentagonal Quasi-Grid)

Pentagonal symmetry does NOT tile the Euclidean plane with a repeating unit.  
True 10-fold patterns use **quasi-periodic** grids (related to Penrose tilings).

However, **approximate 10-fold** patterns tile within a rectangular unit cell.

### 10-Pointed Star Construction

```js
// {10/3} star: 10 points, connect every 3rd
drawStarPolygon(cx, cy, R, 10, 3);

// {10/4} = two overlapping pentagons
drawStarPolygon(cx, cy, R, 10, 4);
// Or equivalently: two {5/2} pentagrams
```

**Infill around 10-stars:** "boat" and "dart" shapes (proto-Penrose tiles).

---

## 5. Twelve-Fold Patterns (Dodecagonal)

12-fold symmetry can tile via combinations of squares and equilateral triangles (Archimedean 3-4-6-4 tiling).

### 12-Pointed Star Construction

```js
// {12/5} — the Ottoman standard
drawStarPolygon(cx, cy, R, 12, 5);

// Nested scales for mihrab crown
const scales = [1.0, 0.68, 0.42, 0.23];
scales.forEach(s => {
  drawStarPolygon(cx, cy, R * s, 12, 5);
});
```

**12-fold infill:**
- Between stars: equilateral triangles and squares
- "Shield" forms (irregular hexagons)
- Small {12/5} rosettes at mid-points

---

## 6. Rosette Construction

A **rosette** is a compound form: a central star surrounded by interlocking petal forms that together create a dense flowering-wheel shape.

### Method: Overlapping Star Polygons

For a 12-petal rosette:
1. Draw {12/5} star at full radius R
2. Draw {12/5} star at ~0.75R, rotated 15°
3. The overlapping intersections define the petal outlines
4. Fill alternate regions for visual hierarchy

```js
function rosette12(cx, cy, R) {
  // Layer 1: full star
  drawStarPolygon(cx, cy, R, 12, 5);
  // Layer 2: offset
  push();
  translate(cx, cy);
  rotate(PI / 12);  // 15°
  translate(-cx, -cy);
  drawStarPolygon(cx, cy, R * 0.75, 12, 5);
  pop();
  // Center circle
  circle(cx, cy, R * 0.25);
}
```

### Rosette Construction (General)

For an n-petal rosette:
1. Draw n equal circles of radius r, arranged on a circle of radius r (each circle passes through the center)
2. Their intersections form a rosette with n petals
3. Radius ratio: all circles radius = center circle radius (vesica piscis geometry)

```js
function rosacea(cx, cy, R, n) {
  for (let i = 0; i < n; i++) {
    const a = i * TWO_PI / n;
    circle(cx + R * cos(a), cy + R * sin(a), R * 2);
  }
}
```

---

## 7. Girih Tiles

**Girih** (Persian: گره, "knot") is a 15th-century system of 5 interlocking polygon tiles that generates complex Islamic star patterns. Every tile has internal **strapwork lines** at 72° and 36° angles.

### The Five Girih Tiles

| Tile | Shape | Angles | Internal Lines |
|------|-------|--------|---------------|
| **Decagon** | Regular 10-gon | 10 × 144° | 10 lines through midpoints |
| **Pentagon** | Regular 5-gon | 5 × 108° | 5 lines at 72° |
| **Bowtie** (Bat) | Concave hex | 2×72° + 4×216° | 4 lines |
| **Rhombus** | Diamond | 2×72° + 2×108° | 2 lines through midpoints |
| **Hexagon** | Irregular | 4×108° + 2×72° | 6 lines |

**Key property:** All internal angles are multiples of 36° = π/5. This is why they all interlocks perfectly.

**Internal strapwork angle rule:** Strapwork lines always cross tile edges at **54°** (= 90° − 36°) from the edge's perpendicular, creating the interlacing ribbon appearance.

### Tiling with Girih Tiles

```
Decagon (center) + surrounding Pentagons + Rhombi filling gaps
→ Produces a Penrose-like quasi-periodic pattern

Decagon + Bowtie + Hexagon
→ Produces the classic Darb-i Imam shrine pattern (Isfahan, 1453)
```

### Code Approach (SVG / p5.js)

```js
// Decagon girih tile (regular 10-gon)
function decagonTile(cx, cy, R) {
  const pts = Array.from({length: 10}, (_, i) => ({
    x: cx + R * cos(i * TWO_PI/10 - HALF_PI),
    y: cy + R * sin(i * TWO_PI/10 - HALF_PI)
  }));
  // Outline
  beginShape();
  pts.forEach(p => vertex(p.x, p.y));
  endShape(CLOSE);
  // Internal strapwork lines (10 lines from every midpoint)
  for (let i = 0; i < 10; i++) {
    const mid = {
      x: (pts[i].x + pts[(i+1)%10].x) / 2,
      y: (pts[i].y + pts[(i+1)%10].y) / 2
    };
    // Line toward center of tile at 54° inward
    // (simplified: line from midpoint to center for basic render)
    line(mid.x, mid.y, cx, cy);
  }
}
```

### Girih Pattern Gallery

| Pattern | Tiles Used | Style | Famous Example |
|---------|-----------|-------|---------------|
| Darb-i Imam | Decagon + Bowtie + Hexagon | Persian | Darb-i Imam, Isfahan (1453) |
| Alhambra variant | Pentagon + Rhombus | Moroccan/Andalusian | Alhambra palace |
| Ottoman 12-star | Decagon + Pentagon + Rhombus | Ottoman | Topkapi tile panels |
| Penrose projection | Decagon + Bowtie | Quasi-periodic | Many Persian mosques |

---

## 8. Construction Rules Summary

| Symmetry | Grid Type | Key Tile | Typical App |
|----------|----------|---------|------------|
| 6-fold | Hexagonal | Equilateral triangle | Moroccan floors, Persian dadoes |
| 8-fold | Square | Square + octagon | Mamluk inlay, Ottoman dados |
| 10-fold | Quasi-periodic | Girih decagon | Persian domes, Andalusian stucco |
| 12-fold | Hex + Square hybrid | 12-star | Ottoman crowns, Mamluk vaults |

**Design rule:** In a wall composition, use ONE primary symmetry system and let all other patterns derive from it. Mixing 6-fold and 8-fold grids on the same surface creates visual dissonance. Persian mihrabs often mix 12-fold in the crown with 6-fold in the column zone — but with clear visual separation.
