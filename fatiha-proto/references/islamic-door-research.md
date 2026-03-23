# Islamic Door Design — Research & Mathematical Formulas

## I. HISTORICAL CONTEXT

### Masjid al-Nabawi Doors (Prophet's Mosque, Medina)
- Each door panel: ~1600 pieces of teak wood, joined with brass frames
- Brass plated with 23-carat gold, then polished
- Weight: ~2500 kg per door, yet opens effortlessly due to precision
- Gate configurations: single portal, triple-arched, and multi-portal (up to 7 doors)
- All doors share the same geometric design language
- Quranic verse above each entrance: "Enter with peace and security" (Surah al-Hijr, 15:46)
- Sources: [Local Guides Connect](https://www.localguidesconnect.com/t/the-beautiful-decorative-doors-of-masjid-al-nabawi/371485), [Madain Project](https://madainproject.com/gates_of_masjid_an_nabawi)

### Alhambra Doors (Nasrid, 1238–1492)
- Wooden marquetry (taracea) with intersecting geometric patterns
- Hall of the Kings: 12-pointed black star wheel based on equilateral triangles
- 8-pointed star (Khatam) used as symbol of life
- Materials: carved stucco, mosaic tilework (alicatado/zellij), wood marquetry
- Comares Palace doors: exquisite intersecting marquetry patterns
- Sources: [Dosde](https://www.dosde.com/discover/en/tilework-in-the-alhambra/), [Piccavey](https://piccavey.com/granada-alhambra-walls/)

### Ottoman Palace Doors (Topkapi, 15th–16th c.)
- Topkapi Scroll: 114 patterns including 59 muqarnas, 44 geometric repeat units
- Ottoman doors: large wooden panels with brass studs for protection + decoration
- Decorative repertoire: rumî, hatayî, saz motifs alongside geometry
- Door studs originally protective (against swords/axes), evolved into decoration
- Source: [Ottoman decoration (Wikipedia)](https://en.wikipedia.org/wiki/Ottoman_decoration)

### Persian/Iranian Doors
- Two knockers per door: right (men, lighter ring sound) and left (women, deeper bar sound)
- Called "kubeh" in Persian
- Geometric lattice frames (gereh), sometimes inset with colored glass
- Safavid period: mosaic panels of wood for walls, ceilings, doors
- Replica dimensions available: 400×300cm, 300×200cm, 200×120cm
- Source: [Taste Iran](https://www.tasteiran.net/stories/8034/kubeh-iranian-door-knocker)

---

## II. ARCH TYPES & MATHEMATICAL CONSTRUCTION

### A. Two-Center Pointed Arch (الأقواس المدببة)

The fundamental Islamic arch. Two arcs intersect at an apex.

**Setup**: Span = S, springing points at (−S/2, 0) and (+S/2, 0)
**Centers**: C₁ = (−e, 0) and C₂ = (+e, 0) where e = half the distance between centers
**Radius**: R = S/2 + e (each arc reaches the opposite springing point)
**Apex height**: H = √(R² − e²) = √((S/2 + e)² − e²) = √(S²/4 + Se)

| Variant | Center separation 2e | Radius R | Apex height H | H/S ratio |
|---------|---------------------|----------|---------------|-----------|
| **Equilateral** | S (centers at springings) | S | S√3/2 | 0.866 |
| **Nilometer** (861 CE) | S/3 | 2S/3 | S√15/6 | 0.645 |
| **Slight point** | S/5 | 3S/5 | S√(9/25 − 1/100)^½ ≈ | 0.583 |
| **Semicircular** | 0 | S/2 | S/2 | 0.500 |

**Equilateral pointed arch** (most common Islamic door arch):
- Centers AT the springing points: C₁ = (−S/2, 0), C₂ = (S/2, 0)
- R = S (full span width)
- H = S × √3/2 ≈ 0.866 × S
- Arc angle: each side sweeps 60° (from horizontal to apex)
- This creates a "kite" shape when mirrored

**Code formula**:
```javascript
// Two-center pointed arch
function pointedArchY(x, cx, halfSpan, e) {
  // e = half the center-to-center distance
  var R = halfSpan + e;
  if (x <= cx) {
    // Left arc: center at (cx + e, springY)
    var dx = x - (cx + e);
    return springY - Math.sqrt(R * R - dx * dx);
  } else {
    // Right arc: center at (cx - e, springY)
    var dx = x - (cx - e);
    return springY - Math.sqrt(R * R - dx * dx);
  }
}
```

### B. Horseshoe Arch (قوس حدوة الحصان)

Moorish signature. Arc continues past 180°, narrowing below maximum width.

**Setup**: Center at (0, 0), radius R
**Maximum width**: 2R (at the center height)
**Springing width**: 2R × cos(α) where α is the extra angle below horizontal
**Typical α**: 15°–30° (Moorish standard ~22.5°)
**Arc extent**: 180° + 2α
**Height above spring line**: R × sin(α) + R = R(1 + sin α)

For α = 22.5°: springing width = 2R × cos(22.5°) ≈ 1.848R
Total arc = 225° of full circle

### C. Four-Center (Tudor/Persian) Arch (قوس فارسي)

Low, wide pointed arch. Common in Timurid, Safavid, Mughal architecture.

**Construction**:
1. Two lower centers (near springings): small radius r₁ → steep lower curves
2. Two upper centers (below spring line): large radius r₂ → flat upper curves
3. The transition between the two radii must be tangent (smooth)

**Typical proportions**:
- r₁ ≈ S/6 to S/4 (steep sides)
- r₂ ≈ S to 2S (gentle crown)
- Height H ≈ S/3 to S/2

### D. Ogee (Keel) Arch (قوس مقرنص)

S-curve meeting at a sharp point. Mughal/Persian specialty.

**Construction**: Four centers — two above spring line (concave lower section), two below (convex upper section). The inflection point where concave meets convex creates the characteristic S-curve.

---

## III. DOOR PANEL GEOMETRY

### Panel Layout (Standard Islamic Double Door)
Traditional Islamic doors divide into rectangular panels arranged vertically:

```
┌─────────────┐
│  ARCH AREA  │  ← Geometric fill or muqarnas
├──┬─────┬────┤
│  │UPPER│    │  ← Upper panels (often square)
│  │PANEL│    │     with 8-fold or 12-fold rosette
│  ├─────┤    │
│B │BAND │ B  │  ← Arabesque border band
│O ├─────┤ O  │
│R │LOWER│ R  │  ← Lower panels (often taller)
│D │PANEL│ D  │     with matching or different rosette
│E ├─────┤ E  │
│R │STUD │ R  │  ← Bottom panel with nail/stud grid
│  │AREA │    │
└──┴─────┴────┘
```

### Proportional System
- Door height:width ratio ≈ 2:1 to 5:2 (golden ratio φ ≈ 1.618 is common)
- Panel width:height follows √2 or golden ratio
- Border band width ≈ 1/8 to 1/10 of panel width
- Stud spacing follows hexagonal or square grid

---

## IV. 8-FOLD STAR ROSETTE (KHATAM) — Panel Center Pattern

The most common door panel motif. Two overlapping squares rotated 45°.

### Construction (from islamic-geometry skill)

1. **Draw mother circle** of radius r centered on panel center
2. **Divide into 8** using compass: 4-fold (perpendicular bisector) → 8-fold (bisect each 90°)
3. **Connect every 3rd point**: {8/3} star polygon → the 8-pointed star
4. **Inner octagon** formed by the intersections of the star lines
5. **Kite shapes** fill between star points

**Mathematical details**:
- 8 points at angles: k × 45° (k = 0, 1, ..., 7)
- Star polygon {8/3}: connect vertex i to vertex (i+3) mod 8
- Inner octagon radius: r × cos(π/8) × (1 − tan(π/8)) ≈ 0.414r (ratio α)
- Star point tip angle: 45° (= 360°/8)
- Kite diagonal ratio: related to √2

**Code**:
```javascript
function draw8FoldStar(cx, cy, r, drawLine) {
  var pts = [];
  for (var i = 0; i < 8; i++) {
    var a = i * Math.PI / 4 - Math.PI / 2; // start from top
    pts.push({ x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) });
  }
  // Draw {8/3} star — connect every 3rd vertex
  for (var i = 0; i < 8; i++) {
    var j = (i + 3) % 8;
    drawLine(pts[i].x, pts[i].y, pts[j].x, pts[j].y);
  }
  // Inner octagon (from line intersections)
  var innerR = r * (Math.sqrt(2) - 1); // ≈ 0.414r
  var innerPts = [];
  for (var i = 0; i < 8; i++) {
    var a = i * Math.PI / 4 - Math.PI / 2 + Math.PI / 8; // offset 22.5°
    innerPts.push({ x: cx + innerR * Math.cos(a), y: cy + innerR * Math.sin(a) });
  }
  // Draw inner octagon
  for (var i = 0; i < 8; i++) {
    drawLine(innerPts[i].x, innerPts[i].y, innerPts[(i+1)%8].x, innerPts[(i+1)%8].y);
  }
}
```

### Khatam Pattern Tiling ({8,8,4})
When the 8-fold star is tiled: **octagons + squares** fill the plane.
- Wallpaper group: **p4m** (4-fold rotation + reflections)
- Each octagon hosts a star, each square hosts a smaller rotated square
- This is the most common Islamic door panel pattern

---

## V. 12-FOLD STAR ROSETTE — Alternative Panel Pattern

### Construction
1. Divide circle into 12 (combine 4-fold and 6-fold: mark at every 30°)
2. Star polygon {12/5}: connect every 5th point
3. Creates a 12-pointed star with interior dodecagon

**Mathematical details**:
- 12 points at angles: k × 30° (k = 0, 1, ..., 11)
- Star point tip angle: 30° (= 360°/12)
- Inner dodecagon radius: r × (2 − √3) ≈ 0.268r
- Wallpaper group: **p6m** (most symmetric)

---

## VI. ARABESQUE BORDER BAND — Between Panels

### Interlocking Zigzag (Simplest)
A continuous zigzag band that creates a chain of triangles or rhombi.

**Construction**:
- Band width: w
- Repeat unit length: w × √3 (equilateral triangles) or w (squares)
- Zigzag angle: 60° (hexagonal) or 45° (square)

### Interlacing Band
Two lines weave over-under through the border strip.

**Mathematical formula** for sinusoidal interlace:
```
y₁(x) = bandCenter + (bandWidth/2) × sin(2π × x / repeatLength)
y₂(x) = bandCenter - (bandWidth/2) × sin(2π × x / repeatLength)
```

### Chain Pattern (Common Door Border)
Linked oval or pointed oval shapes:
- Each link: two arcs of radius r meeting at pointed ends
- Link length = 2r × sin(θ), link width = 2r × (1 − cos(θ))
- Typical θ = 60° → length = r√3, width = r

---

## VII. DECORATIVE NAIL/STUD PATTERN

### Historical Function
Originally protective (against swords and axes on castle gates), studs evolved into purely decorative elements on mosque and palace doors.

### Grid Types

**Square grid**: Studs at regular intervals on a square lattice
- Spacing: s (uniform in both directions)
- Pattern: rows and columns aligned

**Hexagonal (close-packed) grid** (more common on Islamic doors):
- Even rows: studs at x = k × s
- Odd rows: studs at x = (k + 0.5) × s, y offset by s × √3/2
- This creates equilateral triangles between adjacent studs
- Maximum packing density

**Typical proportions**:
- Stud diameter d ≈ 8–15mm
- Spacing s ≈ 4d to 8d (center-to-center)
- Border clearance ≈ 2d from panel edge

### Stud Shape
- Dome-headed (most common)
- Flat rosette-headed (decorative)
- Pyramid-headed (defensive)

---

## VIII. DOOR KNOCKER (حلقة / HALQA)

### Traditional Design
- **Shape**: Ring hanging from a decorative plate (round or star-shaped)
- **Position**: Centered horizontally, at approximately 2/3 door height from bottom
- **Two-knocker system** (Persian/Iranian):
  - Right side: metal ring → lighter sound (for men)
  - Left side: thick metal bar → deeper tone (for women)
- **Plate shapes**: 8-pointed star, circular medallion, lion's head
- **Ring diameter**: proportional to door — typically 1/6 to 1/8 of door width
- Source: [Taste Iran](https://www.tasteiran.net/stories/8034/kubeh-iranian-door-knocker)

---

## IX. ARCH TYMPANUM (لنتو / LUNETTE)

The area between the arch curve and the spring line rectangle.

### Common Fills
1. **Radiating geometric lines** from apex
2. **Small-scale star pattern** (different from panel rosettes)
3. **Muqarnas-style** stepped niches
4. **Calligraphic** inscription in the lunette
5. **Vegetal arabesque** flowing from center

### Geometric Fill
For a pointed arch tympanum:
- Subdivide with radial lines from center, creating sector segments
- Fill each sector with small 6-fold or 8-fold patterns
- Border the arch with a narrow interlace band

---

## X. DESIGN FORMULAS SUMMARY FOR OUR DOOR

### Our Door Dimensions
- Canvas: 1080 × 1920
- Door width (S): 720px, half-span: 360px
- Door height: 1500px
- Arch spring Y: doorY + 380

### Pointed Arch (using equilateral proportions)
- **e = S × 0.55 / 2** (current code uses co = halfDW × 0.55)
- This gives a slightly pointed horseshoe — KEEP THIS, it's good
- R = halfDW + co = 360 + 198 = 558
- Arch height ≈ √(558² − 198²) ≈ 522px above spring line

### Panel Star Rosettes
- **8-fold Khatam star** in each panel
- Rosette inscribing circle radius: min(panelWidth, panelHeight) × 0.4
- Star constructed as {8/3} polygon
- Inner octagon at r × (√2 − 1) ≈ 0.414r

### Border Bands
- Width: 15–20px
- Zigzag pattern at 60° angles
- Repeat unit: band_width × √3

### Nail/Stud Grid
- Hexagonal close-packed grid in bottom panel area
- Stud radius: 3–4px (as small dots)
- Spacing: 25–30px center-to-center
- Rows offset by half-spacing

### Door Knocker
- Two ring shapes, positioned at ~60% down from arch spring
- Ring radius: 15–20px
- Plate: 8-pointed star, radius 25px

---

## SOURCES

- [AramcoWorld: The Point of the Arch](https://archive.aramcoworld.com/issue/201203/the.point.of.the.arch.htm)
- [Local Guides Connect: Doors of Masjid Al-Nabawi](https://www.localguidesconnect.com/t/the-beautiful-decorative-doors-of-masjid-al-nabawi/371485)
- [Madain Project: Gates of Masjid an-Nabawi](https://madainproject.com/gates_of_masjid_an_nabawi)
- [Dosde: Tilework in the Alhambra](https://www.dosde.com/discover/en/tilework-in-the-alhambra/)
- [Art of Islamic Pattern: 16-Fold Rosette](https://artofislamicpattern.com/online-classes/online-drawing-igp-december-2020-update/exploring-8-fold-symmetry-5-16-fold-rosette/)
- [Drawing Islamic Geometric Designs: Rosettes](https://www.drawingislamicgeometricdesigns.com/basic-rosettes-anthony-lees-methods/Blog%20Post%20Title%20One-n5m4l)
- [Taste Iran: Kubeh Iranian Door Knocker](https://www.tasteiran.net/stories/8034/kubeh-iranian-door-knocker)
- Islamic Geometry Skill — comprehensive construction methods (islamic-geometry/SKILL.md)
- Bonner, *Islamic Geometric Patterns* (Springer, 2017)
- Necipoglu, *The Topkapi Scroll* (Getty, 1995)
