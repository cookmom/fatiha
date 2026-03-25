<!-- بسم الله الرحمن الرحيم -->

# Ottoman Botanical Patterns — Design Reference

## Overview

Ottoman botanical art (saz üslubu — "reed style") developed in the 16th-century Iznik and Istanbul court ateliers. It features a dynamic interplay of:
- **Kıvrık dal** (twisting branch/vine) — the structural spine
- **Saz yaprak** (saz leaf) — long, serrated, asymmetric leaves
- **Hatai** (composite flower) — stylized, layered blossom
- **Gonca** (bud) — teardrop-form closed blossom
- **Rumi** (split leaf) — curved, bifurcated leaf form

Everything grows from the vine. Nothing floats. Every leaf, bud, and flower must be visibly attached.

---

## 1. Botanical Shape Vocabulary

### Saz Leaf (Saz Yaprak)

**Character:** Long, curved, asymmetric. One edge is convex/swelling, the opposite edge is concave or straight. Comes to a sharp pointed tip. A single central vein runs full length.

**Shape construction:**
```js
// Saz leaf bezier path (normalized, tip at top)
// Width ≈ 0.35 of length
beginShape();
vertex(0, 0);                            // base
bezierVertex(0.6, 0.2, 0.7, 0.8, 0, 1); // right (convex) edge to tip
bezierVertex(-0.35, 0.7, -0.2, 0.2, 0, 0); // left (concave) edge back
endShape(CLOSE);

// Central vein: faint line from base to ~85% of length
line(0, 0.05, 0, 0.85);
```

**Variants:**
- **Serrated saz leaf** — add small triangular notches along outer edge (common in Bosphorus workshops)
- **Rumi leaf** — split into two curved lobes at the tip (Y-form)
- **Cloud band** — exaggerated S-curve, often used as vine connector between large forms

**Scale:** Saz leaves are large relative to buds. In a full garden composition, a major saz leaf spans ~20-25% of canvas height.

---

### Ogee Petal (Gül Yaprağı)

**Character:** Almond/ogee shape. Wide in the middle, tapering to two points (base and tip). Used for individual rose petals and hatai flower segments.

```js
// Ogee petal (normalized, axis vertical)
beginShape();
vertex(0, -1);                            // base point
bezierVertex(0.5, -0.5, 0.65, 0.3, 0, 1); // right bulge
bezierVertex(-0.65, 0.3, -0.5, -0.5, 0, -1); // left bulge
endShape(CLOSE);
```

**Ottoman rose construction:**
- Outer ring: 8 petals, scale 1.0, slight overlap, rotate 0/45/90...
- Middle ring: 6 petals, scale 0.72, rotate 30° offset
- Inner ring: 4 petals, scale 0.48, rotate 45° offset
- Center: pollen spray or small hatai

---

### Teardrop Bud (Gonca)

**Character:** Closed blossom. Rounded at base, pointed at top. Slightly asymmetric — the tip leans 5-15° off vertical to suggest movement. A few visible petal edges at the top suggest the blossom is about to open.

```js
// Teardrop bud (normalized)
beginShape();
vertex(0, 1);    // rounded base
bezierVertex(0.55, 0.9, 0.6, -0.2, 0.1, -1);  // right edge, leans right
bezierVertex(-0.25, -0.9, -0.55, 0.7, 0, 1);   // left edge
endShape(CLOSE);

// Petal hint lines (3 short curves near tip)
// drawn with thin tahrir line
```

**Usage:** Buds appear at vine branch tips and in unfilled corners. They fill compositional gaps between major elements.

---

### Hatai Flower

**Character:** Stylized composite flower of Chinese/Central Asian origin. Multi-layer structure — outer petals, then inner petals, then a small central disc. Always depicted in "bloom" face-on view.

**Structure layers:**
1. **Outer petals** (6-8): ogee petal form, radiating equally
2. **Inner petals** (4-6): smaller, rotated offset from outer
3. **Sepal ring**: small triangular forms between outer petals, pointing inward
4. **Center disc**: small circle, often with geometric star or dot cluster

```js
// Hatai composition
function drawHatai(cx, cy, R) {
  // Outer petals
  for (let i = 0; i < 8; i++) {
    push();
    translate(cx, cy);
    rotate(i * TWO_PI / 8);
    translate(0, -R * 0.55);
    drawOgeePetal(0, 0, R * 0.5);
    pop();
  }
  // Inner petals (rotated 22.5°)
  for (let i = 0; i < 6; i++) {
    push();
    translate(cx, cy);
    rotate(i * TWO_PI / 6 + PI/6);
    translate(0, -R * 0.32);
    drawOgeePetal(0, 0, R * 0.3);
    pop();
  }
  // Center
  circle(cx, cy, R * 0.18);
}
```

---

## 2. Composition Technique

### The Vine Spine (Kıvrık Dal)

The vine is the compositional skeleton. All forms attach to it.

**Rules:**
- Vine follows a **golden spiral** path or a series of flowing S-curves
- Never straight, never angular — always in smooth motion
- Branch points occur where the vine curves most sharply
- Each branch is shorter than the one it grew from (self-similar ratio ~0.618)
- Leaves always grow from branch attachment points, never from mid-span

**Growth order in composition:**
```
1. VINE (kıvrık dal)      — draw first, establishes all positions
2. LEAVES (saz yaprak)    — attach at every major branch point
3. BUDS (gonca)           — at branch tips, unfilled corners
4. FLOWERS (hatai/gül)    — at vine's major curve nodes (1-3 per composition)
5. DETAIL (venation, rumi)— fine vein lines, small rumi leaves in remaining gaps
```

### Spatial Hierarchy

| Element | Position on Vine | Scale | Fill |
|---------|-----------------|-------|------|
| Hatai (main) | Golden ratio focal point | Largest (100%) | Rich color |
| Rose (gül) | Secondary curve node | 80% of hatai | Gradient |
| Saz leaf | Every major branch | 60-80% | Translucent wash |
| Gonca bud | Branch tips | 30-40% | Closed form |
| Rumi leaf | Gap filler | 20-30% | Minimal fill |

---

## 3. Golden Spiral Path for Organic Layout

The vine typically follows a golden/Fibonacci spiral emanating from one corner or focal point.

```js
// Golden spiral: series of quarter-arc segments
// Each arc radius = previous × φ (1.618)
const PHI = 1.618;
let r = 40;  // starting radius
let cx = width * 0.55, cy = height * 0.45;  // spiral center

// 9 quarter-arc segments (270° total sweep covers canvas)
const arcs = [];
for (let i = 0; i < 9; i++) {
  arcs.push({
    cx: cx,
    cy: cy,
    r: r,
    startAngle: PI/2 * i,
    endAngle: PI/2 * (i + 1)
  });
  r *= PHI;
}

// Sample points along spiral for vine path
function sampleSpiral(totalPoints = 200) {
  const pts = [];
  for (let i = 0; i < totalPoints; i++) {
    const t = i / totalPoints;
    const theta = t * 9 * HALF_PI;
    const radius = 40 * pow(PHI, theta / HALF_PI);
    pts.push([
      cx + radius * cos(theta + PI),
      cy + radius * sin(theta + PI)
    ]);
  }
  return pts;
}
```

---

## 4. Tahrir Outline Technique

**Tahrir** (Arabic: تحرير, "liberation/finishing") is the fine outline stroke applied AFTER fills to define, sharpen, and separate botanical forms. It is the defining mark of Ottoman court illumination quality.

**Characteristics:**
- Very fine (0.3-0.8px at standard scale)
- Slightly variable weight — swells gently at curves, sharpens at tips
- High opacity (180-220/255) — solid, precise
- Color is usually very dark but NOT pure black:
  - `#1A1A2E` (near-black with blue undertone) on light grounds
  - `#C9A84C` (gold) on dark grounds
  - `#2A3A18` (dark green) for leaf outlines on cream grounds

**Application sequence:**
1. Draw watercolor fill (low opacity, bleed enabled)
2. Wait (in code: fills first, then strokes)
3. Apply tahrir outline on TOP of fills
4. Never apply tahrir before fill — it gets buried

```js
// Tahrir in p5.brush
brush.add("tahrir_line", {
  type: "default",
  weight: 0.3,
  scatter: 0.1,
  sharpness: 0.9,
  grain: 3,
  opacity: 180,
  spacing: 0.08,
  pressure: [0.8, 1.0, 0.8],
  rotate: "natural"
});

// Usage
brush.set("tahrir_line", "#1A1A2E", 0.3);
brush.spline(leafOutlinePoints, 0.9);
```

---

## 5. Color Palettes

### Ottoman Court Palette (Iznik, 16th century)

| Color | Name | Hex | Usage |
|-------|------|-----|-------|
| Cobalt blue | Kobalt | `#1B3D8A` | Major field color, vine fill |
| Lapis blue | Lazurit | `#2B4AC8` | Background washes, alternate fields |
| Coral red | Mercan | `#C8412B` | Rose petals, accent borders |
| Sage green | Çayır | `#5B7A3A` | Leaf fill base |
| Emerald green | Zümrüt | `#1A6B3A` | Leaf accents, vine |
| Turquoise | Firuze | `#2B8A88` | Hatai accent petals |
| Gold | Altın | `#C9A84C` | Outlines, star, band highlights |
| Pale gold | Soluk altın | `#E8CC7A` | Fill washes, lighter accents |
| Warm cream | Krem | `#F5EDD8` | Paper ground, negative space |
| Near-black | — | `#1A1A2E` | Tahrir outlines |

### Dark Ground Palette (for mihrab / night compositions)

| Color | Hex | Usage |
|-------|-----|-------|
| Deep charcoal | `#0D0D0D` | Background |
| Midnight blue | `#0D1B3E` | Deep field |
| Gold (bright) | `#D4AF37` | Outlines, star |
| Gold (warm) | `#C9A84C` | Fill washes |
| Ivory | `#F5EDD8` | Calligraphy text |
| Crimson | `#8B0000` | Accent petals |
| Forest green | `#1A4A2A` | Leaf fill |
| Pale turquoise | `#8ABAD1` | Highlight accents |

### Moroccan Zellige Palette

Inspired by Fez and Marrakech tilework:
`#2B5F8A` (blue) · `#1A7A4A` (green) · `#D4A017` (amber) · `#C8412B` (terracotta) · `#F5F0E8` (white) · `#1A1A1A` (black grout)

---

## 6. Composition Checklist

Before finalizing any Ottoman botanical composition:

- [ ] All forms visibly attached to the vine
- [ ] Vine follows a continuous S-curve or golden spiral
- [ ] No two identical shapes placed symmetrically (slight variations always)
- [ ] Leaves vary in angle and scale along the vine (±15° rotation, ±20% scale)
- [ ] Negative space (ground) flows as an integrated shape, not just leftover gaps
- [ ] Tahrir outlines applied on top of all fills
- [ ] Color value contrast between adjacent fills (≥30% luminance difference)
- [ ] At least one major focal flower at the golden ratio focal point
- [ ] No tangent alignments — no two edges running parallel and nearly touching
