<!-- بسم الله الرحمن الرحيم -->

# Mihrab Architecture — Complete Design Reference

## 1. Full Anatomy of a Mihrab

### Vertical Hierarchy (bottom to top)

```
        ★  Star / Medallion
    ╔══════════════╗
    ║   Crown Arch ║  (Taç iç — inner crown)
    ╚══════════════╝
  ┌────────────────────┐
  │   Inscription Band │  Kuşak — spans outer column edges
  └────────────────────┘
    │              │   Vertical jambs (band → capitals)
   ╔╪╗            ╔╪╗
   ║ ║  Kavsara   ║ ║   Spandrel (Köşelik)
   ║ ╚════════════╝ ║
   ║   Niche Arch   ║   Taç/Hilly — pointed equilateral
   ║                ║
   ╬────────────────╬   Capitals (muqarnas/lotus)
   ║                ║
   ║    Sütunlar    ║   Column shafts (Sütunlar)
   ║                ║
   ╩════════════════╩   Column bases
   ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬   Base plinth
```

### Component-by-Component Description

| Layer | Turkish Name | Description |
|-------|-------------|-------------|
| Base plinth | Taban kaidesi | Full-width footer, decorative molding along top edge |
| Column bases | Kaidelik | Step-wider than shaft (~1.3×), often with decorative lip |
| Column shafts | Sütun gövdesi | Vertical, with fluting lines and optional entasis rings |
| Capitals | Başlık | Lotus/muqarnas-form brackets; wider than shaft (~1.5×), volute scrolls |
| Spandrel triangles | Köşelik | Fill corner between arch curve and rectangular inscription frame; always decorated |
| Niche arch | Taç / Hilly | Pointed equilateral arch; springs from column capitals |
| Niche recess | Kavsara | Recessed area behind arch where imam stands |
| Inscription band | Kuşak | Horizontal rectangular band above arch peak; Quranic calligraphy (Thuluth or Kufic) |
| Vertical jambs | — | Connect inscription band down to capitals; prevent band from floating |
| Crown arch | Taç üst | ROUNDED (semi-dome, horseshoe dome, or keel); NEVER pointed if niche is pointed |
| Star/Medallion | Yıldız | Centered inside crown; generous negative space around it |

---

## 2. Proportional System — Single Base Unit (Proven)

All dimensions derive from one base unit **U** using φ, √3, √2:

```
U = canvasWidth / (2φ + 2)        — base unit (~206px on 1080w canvas)

HORIZONTAL:
  archSpan     = 2U                — niche width
  colWidth     = U / φ²            — column width (~79px)
  colGap       = colWidth / φ      — gap between arch edge and column
  bandOverhang = colWidth / 2      — band extends past column edges
  crownSpan    = bandWidth × √φ    — crown arch width (~1.27× band)
  capWidth     = colWidth × φ      — capital width
  baseWidth    = colWidth × φ/√2   — base plinth width

VERTICAL:
  springY      = compTop + compH/φ — springing at golden section (61.8% down)
  archH        = archSpan × √3/2  — equilateral pointed arch height
  capHeight    = colWidth × φ      — capital height (~127px)
  bandHeight   = U / φ             — inscription band height (~127px)
  baseHeight   = colWidth / φ      — column base plinth (~48px)
  crownR       = crownSpan × √2/2 — crown radius (sub-equilateral = dome-like)
  bandGap      = U / φ³            — breathing room above arch peak to band

STAR (12-fold, {12/5} polygon):
  starCy       = crownPeak + crownH/φ  — center at golden section of crown
  starR        = min(crownH/(2φ), crownHalfSpan/φ²)  — fits with breathing room
  nested scales: r, r/φ, r/φ², r/φ³   — 4 layers at golden ratio

ENTASIS:
  column rings at 1/φ and 1/φ² of column height
```

### Worked Example (W = 1080px canvas)

```
U           = 1080 / (2×1.618+2) = 1080 / 5.236 ≈ 206px
archSpan    = 2 × 206             = 412px
colWidth    = 206 / 1.618²        ≈ 79px
capHeight   = 79 × 1.618          ≈ 128px
bandHeight  = 206 / 1.618         ≈ 127px
baseHeight  = 79 / 1.618          ≈ 49px
crownSpan   = bandW × √1.618     ≈ bandW × 1.272
starR       ≈ 85px (4 nested layers: 85, 53, 33, 20)
```

Every dimension is annotatable in a HUD animation — nothing is arbitrary.

### Pointed Arch Geometry (Equilateral)

The Ottoman pointed arch uses two arcs of radius = `archSpan`:
- Left arc center: `(x_left, y_spring)` where `x_left` is left column inner edge
- Right arc center: `(x_right, y_spring)` where `x_right = x_left + archSpan`
- Apex: `(x_left + archSpan/2, y_spring - archSpan × sin(60°))`
- `apex_y = y_spring - archSpan × 0.866`

```js
// Pointed arch apex calculation
const archSpan = 432.6;
const x_left   = (totalW - archSpan) / 2;
const x_right  = x_left + archSpan;
const y_spring = y_base_of_arch;  // where arch springs from capitals
const apex_y   = y_spring - archSpan * Math.sin(Math.PI / 3);  // × 0.866
const apex_x   = (x_left + x_right) / 2;
```

### Semi-Dome Crown Geometry

```js
// Semi-dome: a simple semicircle
const crownCX  = totalW / 2;
const crownCY  = y_inscription_top;  // top of inscription band
const crownR   = bandWidth / 2;
// Arc: from angle PI to 0 (half circle, opening downward)
```

---

## 3. Architectural Terms (Extended)

| Term | Language | Meaning |
|------|----------|---------|
| Mihrab | Arabic | Prayer niche; wall recess indicating qibla direction |
| Kavsara | Turkish | The niche/recess itself |
| Taç | Turkish | Crown/arch; literal "crown" |
| Hilly | Ottoman Turkish | Arch |
| Kuşak | Turkish | Belt/band; inscription band |
| Sütunlar | Turkish | Columns (plural) |
| Köşelik | Turkish | Corner piece; spandrel triangles |
| Muqarnas | Arabic | Stalactite/honeycomb vaulting; geometric 3D cellular ornament |
| Alfiz | Spanish Arabic | Rectangular frame around Moroccan arches |
| Ablaq | Arabic | Alternating light/dark stone banding (Mamluk) |
| Arabesk / Arabesque | Arabic | Interlacing vine/floral scroll pattern |
| Rumi | Ottoman | Stylized split-leaf motif unique to Ottoman art |
| Hatai | Ottoman | Stylized composite flower (Chinese-influenced) |
| Kıvrık dal | Turkish | "Twisting branch" — the vine/stem underlying botanical patterns |
| Saz üslubu | Turkish | "Reed style" — Ottoman court style with saz leaves and hatai |
| Zellige | Moroccan Arabic | Geometric mosaic tilework |
| Pietra dura | Italian/Mughal | Stone inlay (Mughal "parchin kari") |

---

## 4. Style Comparison Table

| Feature | Ottoman | Moroccan | Persian/Safavid | Mamluk | Mughal |
|---------|---------|----------|----------------|--------|--------|
| **Crown arch form** | Semi-dome (rounded) | Alfiz + horseshoe | Nested pointed arches | Muqarnas hood | Keel/ogee arch |
| **Niche arch** | Pointed equilateral | Horseshoe | Pointed | Pointed/keel | Ogee |
| **Column style** | Substantial muqarnas capitals | Slender, plain capitals | Embedded pilasters | Inlaid marble columns | Pilasters with plinth |
| **Inscription position** | Band above arch, full-width | Integrated into alfiz | Runs along arch intrados | Above arch + side bands | Above arch |
| **Script style** | Thuluth (Ottoman) | Kufic / Thuluth | Nasta'liq | Thuluth / Naskh | Nasta'liq |
| **Tilework base** | Iznik tile dados | Zellige floor-to-dado | Tile mosaic (kashi) | Inlaid stone | Pietra dura |
| **Spandrel fill** | Geometric + floral | Carved stucco arabesque | Tile geometric | Geometric interlace | Floral medallion |
| **Signature colors** | Cobalt blue, white, red | Green, yellow, blue | Turquoise, cobalt, gold | Black, cream, gold | Red, green, gold, white |
| **Key example** | Süleymaniye Mosque, Istanbul | Bou Inania Madrasa, Fez | Shah Mosque, Isfahan | Sultan Hassan Mosque, Cairo | Badshahi Mosque, Lahore |

---

## 5. Star Pattern Construction

### {12/5} Star Polygon — Ottoman Mihrab Standard

Used in the crown medallion at 4 nested scales.

**Construction steps:**
1. Place 12 points equally on a circle: `angle_i = (i × 360°) / 12` for i = 0..11
2. Connect every 5th point: 0→5→10→3→8→1→6→11→4→9→2→7→0
3. This produces the {12/5} star — 12 points, skip-5 polygon

```js
function starPolygon(cx, cy, R, n, skip) {
  // n = number of points, skip = connection interval
  const pts = [];
  for (let i = 0; i < n; i++) {
    const angle = (i * TWO_PI / n) - HALF_PI;  // start at top
    pts.push({ x: cx + R * cos(angle), y: cy + R * sin(angle) });
  }
  // Draw: connect pt[0] → pt[skip] → pt[2*skip % n] → ...
  beginShape();
  for (let i = 0; i < n; i++) {
    const idx = (i * skip) % n;
    vertex(pts[idx].x, pts[idx].y);
  }
  endShape(CLOSE);
}
```

### 4 Nested Scales (Mihrab Crown)

```
Scale 1: R = crownHeight × 0.26   (outer star — main medallion)
Scale 2: R = R1 × 0.68            (second ring)
Scale 3: R = R1 × 0.42            (third ring)
Scale 4: R = R1 × 0.23            (innermost — small accent)
```

Each scale uses {12/5} (Ottoman default), drawn with decreasing opacity or alternating fill colors.

### Other Star Polygon Notations

| Symbol | Points | Skip | Visual |
|--------|--------|------|--------|
| {6/2} | 6 | 2 | Star of David (2 triangles) |
| {8/3} | 8 | 3 | 8-pointed star |
| {10/3} | 10 | 3 | 10-pointed star |
| {12/5} | 12 | 5 | 12-pointed Ottoman star |

General formula: `n` points on circle, connect every `k`th → `{n/k}` star polygon.
Requires `gcd(n, k) = 1` for a single continuous path.

---

## 6. Muqarnas (Stalactite Vaulting)

Used in Ottoman semi-dome crowns and Mamluk hoods.

**Structure:** Interlocking 3D cells arranged in horizontal tiers. Each tier projects further forward than the one above. From below, creates the impression of stalactites or a honeycomb vault.

**2D representation (SVG/p5.js):** Draw as nested concentric arcs with radiating "cell" divisions:
- Outer arc: crown semi-dome outline
- Inner rings: smaller arcs at ~0.7, 0.45, 0.25 of crown radius
- Radial lines: fan out from dome center, spacing decreases toward center

```js
// Simplified muqarnas in 2D
function drawMuqarnas(cx, cy, R, tiers=3) {
  const scales = [1.0, 0.7, 0.45, 0.25];
  for (let t = 0; t < tiers; t++) {
    const r = R * scales[t];
    arc(cx, cy, r*2, r*2, PI, 0);  // half-arc
    // Add radial cell lines
    const cells = 6 + t * 4;
    for (let i = 0; i <= cells; i++) {
      const a = PI + (i / cells) * PI;
      line(cx, cy, cx + r * cos(a), cy + r * sin(a));
    }
  }
}
```
