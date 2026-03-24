# Mihrab Architecture — Design Reference

## Anatomy of a Mihrab (Ottoman Style)

### Vertical Hierarchy (bottom to top)
1. **Ground line / base plinth**
2. **Column bases** — wider than shaft (~1.3× column width), with molding line
3. **Column shafts** — flanking the niche, with fluting and entasis rings
4. **Capitals** — lotus/muqarnas-form brackets, wider than shaft (~1.5× column width), with volute scrolls
5. **Main arch** — pointed (equilateral), springs from column capitals
6. **Inscription band** — sits ABOVE the arch peak, spans between column outer edges. Quranic calligraphy (Thuluth or Kufic)
7. **Crown arch** — typically a SEMI-DOME (rounded), not pointed. Provides visual contrast with pointed niche below
8. **Star/medallion** — centered inside crown with generous negative space

### Key Proportional Relationships (Ottoman)
- `archSpan / totalWidth ≈ 1/φ (0.618)` — golden ratio
- `columnWidth = archSpan / 7` — substantial, not thin
- `capitalHeight = columnWidth × 1.4`
- `bandHeight = capitalHeight × 0.6`
- `baseHeight = columnWidth × 0.45`
- `crownSpan ≈ bandWidth × 1.15` — slightly wider than inscription band
- `starRadius ≈ crownHeight × 0.26` — leaves breathing room

### Critical Design Rules
1. **NEVER use pointed-on-pointed** — if niche is pointed arch, crown should be rounded (semi-dome). The contrast between forms is essential
2. **Inscription band is the separator** — it's the visual break between niche and crown. Must be substantial
3. **Vertical jambs** connect inscription band down to capitals — the band doesn't float
4. **Columns must be substantial** — thin pilasters look weak. Ottoman columns are ~1/7 of arch span
5. **Every element must be structurally grounded** — nothing floats. Each layer sits on or connects to the layer below
6. **Crown has generous negative space** — star/medallion should NOT touch the arch walls

### Architectural Components (Turkish Names)
- **Kavsara** — the niche (recessed area where imam stands)
- **Taç/Hilly** — the arch framing the niche
- **Kuşak** — rectangular border/inscription band
- **Sütunlar** — columns/pilasters flanking the niche
- **Köşelik** — spandrel triangles between arch and rectangular frame
- **Muqarnas** — stalactite vaulting (common in crown/semi-dome area)

### Style Variations
| Style | Crown | Arch | Columns | Key Feature |
|-------|-------|------|---------|-------------|
| **Ottoman** | Semi-dome | Pointed | Substantial with capitals | Inscription band, muqarnas |
| **Moroccan/Andalusian** | Alfiz (rectangular frame) | Horseshoe | Slender | Vine spandrels, zellige tile |
| **Persian/Safavid** | Nested arch-within-arch | Pointed | Embedded pilasters | Continuous double-line border |
| **Mamluk** | Muqarnas hood | Pointed/keel | Inlaid marble | Stalactite bridge between arches |
| **Mughal** | Keel/ogee arch | Ogee | Pilasters with plinth | Lotus finial, medallion |

### p5.brush Implementation Notes
- `brush.fill()` opacity: keep ≤35 for wash over pencil strokes (layers compound fast)
- `fillBleed(0.001)` + `fillTexture(0, 0)` for clean fills without bubble artifacts
- Draw fills FIRST, then all pencil strokes on top
- Star pattern: `{12/5}` star polygon at 4 nested scales (100%, 68%, 42%, 23%)
- For semi-dome crown: use `brush.arc()` or parametric semicircle spline
