<!-- بسم الله الرحمن الرحيم -->

---
name: islamic-illumination
version: 1.0.0
description: Domain knowledge for Islamic architectural and decorative art — mihrab composition, geometric patterns, and Ottoman/Moroccan/Persian/Mamluk/Mughal styles.
triggers:
  - mihrab
  - Islamic architectural design
  - Ottoman geometric patterns
  - Moroccan zellige
  - Persian illumination
  - Mamluk design
  - Mughal arch
  - girih tiles
  - Islamic art
  - Arabic calligraphy layout
  - muqarnas
  - arabesque
tools: []
---

# Islamic Illumination Skill

## When to Use This Skill

Use when the task involves:
- Designing or rendering a **mihrab** (Islamic prayer niche)
- Creating **geometric star patterns** (6-fold, 8-fold, 10-fold, 12-fold)
- Laying out **Ottoman botanical compositions** (hatai, saz leaves, ogee petals)
- Applying **style rules** for Ottoman, Moroccan, Persian, Mamluk, or Mughal aesthetics
- Generating SVG, p5.js, or Three.js renderings of Islamic architectural elements
- Any question about proportions, anatomy, or naming of Islamic decorative forms

---

## Mihrab Vertical Hierarchy

Every mihrab reads bottom-to-top in a strict structural sequence. Nothing floats — each layer sits on the one below.

```
        ★  (Star / Medallion)
    ╔══════════╗
    ║  Crown   ║  ← ROUNDED dome (semi-dome or keel arch)
    ╚══════════╝
  ┌──────────────┐
  │ Inscription  │  ← Kuşak — Quranic text band
  └──────────────┘
      /        \
     /  Niche   \  ← Kavsara — pointed arch framing
    /   (Arch)   \
   │             │  ← Köşelik — spandrel triangles
  ║│             │║  ← Sütunlar — columns with capitals
  ║│             │║
   ╚═════════════╝  ← Base plinth
```

**Layer order (bottom → top):**
1. **Base plinth** — wider footer, molding line
2. **Column bases** — ~1.3× column width, with step detail
3. **Column shafts** — substantial (Ottoman: ~1/7 arch span), fluted
4. **Capitals** — muqarnas or lotus-form brackets, ~1.5× column width
5. **Main arch (Taç/Hilly)** — pointed (equilateral) niche arch, springs from capitals
6. **Inscription band (Kuşak)** — sits ABOVE arch peak, spans full column outer edges
7. **Crown arch** — ROUNDED dome (semi-dome or ogee) — NEVER a second pointed arch
8. **Star/Medallion** — centered in crown with generous negative space

---

## Key Proportional System (Ottoman)

Based on golden ratio (φ ≈ 1.618):

```
archSpan / totalWidth   ≈ 1/φ  (0.618)
columnWidth             = archSpan / 7
capitalHeight           = columnWidth × 1.4
bandHeight              = capitalHeight × 0.6
baseHeight              = columnWidth × 0.45
crownSpan               ≈ bandWidth × 1.15   (slightly wider than inscription band)
starRadius              ≈ crownHeight × 0.26  (generous breathing room)
```

> **Usage:** If `totalWidth = 700`, then `archSpan ≈ 433`, `columnWidth ≈ 62`, etc.

---

## Critical Design Rules

1. **NEVER pointed-on-pointed.** If the niche arch is pointed, the crown MUST be rounded (semi-dome, horseshoe dome, or keel). The contrast between forms is structurally and aesthetically essential.
2. **Inscription band is the separator.** It must be visually substantial — the visual break between niche and crown. Never omit it.
3. **Vertical jambs connect everything.** The inscription band connects down to the capitals via jamb strips. It must not float.
4. **Columns must be substantial.** Ottoman columns are ~1/7 arch span. Thin pilasters look structurally dishonest.
5. **Every element is structurally grounded.** Nothing floats. Each layer connects to the layer below via visible transitions.
6. **Crown has generous negative space.** Star/medallion inside the crown should have ≥25% margin from arch walls.
7. **Spandrels (Köşelik) fill the corners.** The triangles between the arch curve and the rectangular inscription frame must be decorated, never left empty.

---

## Style Quick Reference

| Style | Crown | Niche Arch | Columns | Signature |
|-------|-------|-----------|---------|-----------|
| **Ottoman** | Semi-dome | Pointed equilateral | Substantial, muqarnas capitals | Inscription band, muqarnas semi-dome |
| **Moroccan** | Alfiz (rect frame) | Horseshoe | Slender | Vine spandrels, zellige tile base |
| **Persian/Safavid** | Nested arch-within-arch | Pointed | Embedded pilasters | Continuous double-line border, tile mosaic |
| **Mamluk** | Muqarnas hood | Pointed/keel | Inlaid marble columns | Stalactite bridge, ablaq marble banding |
| **Mughal** | Keel/ogee | Ogee | Pilasters with plinth | Lotus finial, pietra dura inlay |

---

## Architectural Terms (Turkish/Arabic)

| Term | Meaning |
|------|---------|
| **Kavsara** | The niche — recessed prayer space |
| **Taç / Hilly** | The arch framing the niche |
| **Kuşak** | Rectangular inscription/border band |
| **Sütunlar** | Columns or pilasters flanking the niche |
| **Köşelik** | Spandrel triangles between arch and frame |
| **Muqarnas** | Stalactite/honeycomb vaulting |
| **Mihrab** | The entire prayer niche structure |
| **Alfiz** | Rectangular frame enclosing Moroccan arch |

---

## Reference Files

For detailed technical documentation, see:

- **`references/mihrab-architecture-guide.md`** — Full anatomy, proportional math, style comparison table, star pattern construction at 4 nested scales
- **`references/ottoman-botanical-patterns.md`** — Saz leaf, ogee petal, hatai flower, golden spiral composition, tahrir outline, color palettes
- **`references/geometric-patterns.md`** — 6/8/10/12-fold star construction, {n/k} star polygon formula, rosette and girih tile construction

---

## Quick Code Hints (p5.js / SVG)

```js
// Mihrab proportions
const totalW = 700;
const archSpan = totalW / 1.618;           // 432.6
const colW = archSpan / 7;                 // 61.8
const capH = colW * 1.4;                   // 86.5
const bandH = capH * 0.6;                  // 51.9
const crownSpan = (totalW - archSpan) * 1.15 + archSpan; // slightly wider band

// Pointed arch (equilateral — radius = archSpan)
// Center-left tangent: (x0, y_spring), Center-right tangent: (x0 + archSpan, y_spring)
// Arc radius = archSpan, two circles intersect at apex

// Semi-dome crown (rounded)
// Simple semicircle: arc(cx, cy, crownSpan/2, PI, 0)
```
