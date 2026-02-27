---
name: svg-designer
description: >-
  Generate production-quality SVG markup. Use when asked to create: diagrams
  (flowcharts, system architecture, entity relationships, sequence diagrams),
  icons (Phosphor-style thin line icons, UI icons), floor plans (dimensioned
  rooms with furniture and labels), circuit schematics (resistors, capacitors,
  ICs, connections), illustrations (abstract, geometric, decorative),
  data visualizations (bar charts, line charts, pie charts, graphs),
  UI mockups (wireframes, app screens), logos, badges, or any visual that
  can be represented as SVG.
---

# SVG Designer

Generate clean, minimal, production-quality SVG. Every SVG you produce should be valid, accessible, well-structured, and ready for direct use in web pages, documents, or design tools.

## Core Principles

1. **Minimal markup** — No unnecessary wrappers, no inline styles when attributes suffice, no redundant transforms
2. **Semantic grouping** — Use `<g>` with meaningful `id` or `aria-label` for logical sections
3. **Accessibility first** — Always include `<title>` and `<desc>`, use `role="img"` and `aria-labelledby`
4. **Precision** — Use integer coordinates when possible; avoid sub-pixel values that cause blurring
5. **Scalability** — Always use `viewBox`; never hardcode `width`/`height` in px without viewBox

## SVG Boilerplate

Every SVG must start with this structure:

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" role="img" aria-labelledby="title desc">
  <title id="title">{Short title}</title>
  <desc id="desc">{Longer description for screen readers}</desc>
  <!-- content -->
</svg>
```

### viewBox Conventions by Category

| Category | viewBox | Rationale |
|---|---|---|
| Icons | `0 0 24 24` or `0 0 32 32` | Standard icon grid, Phosphor uses 256 but 24/32 is web-standard |
| Diagrams | `0 0 800 600` | 4:3, good for flowcharts and architecture |
| Wide diagrams | `0 0 1200 600` | 2:1, sequence diagrams, timelines |
| Floor plans | `0 0 1000 800` | Generous space for rooms + labels |
| Circuit schematics | `0 0 1000 600` | Landscape for horizontal signal flow |
| Charts/Viz | `0 0 600 400` | 3:2, standard chart ratio |
| UI mockups | `0 0 375 812` | iPhone-sized, or `0 0 1440 900` for desktop |
| Illustrations | `0 0 400 400` | Square, or match content aspect ratio |
| Logos/badges | `0 0 100 100` | Square, simple coordinate math |

### Output Sizing

When the user will embed the SVG, omit `width`/`height` (let CSS control it). When standalone, add responsive defaults:

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="100%" height="auto">
```

For fixed-size contexts (e.g., email), use explicit dimensions:
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600">
```

## Color Palettes

### Default Neutral Palette
Use for diagrams, schematics, and professional output:
- Background: `#FFFFFF` or `none`
- Primary: `#1A1A2E` (near-black)
- Secondary: `#16213E` (dark navy)
- Accent: `#0F3460` (medium blue)
- Highlight: `#E94560` (coral red)
- Light fill: `#F0F0F5` (light gray)
- Mid fill: `#D1D5DB` (medium gray)
- Lines/strokes: `#374151` (dark gray)
- Text: `#111827`

### Categorical Palette (for charts/data viz)
Colorblind-safe, max 8 categories:
```
#4E79A7  (blue)
#F28E2B  (orange)
#E15759  (red)
#76B7B2  (teal)
#59A14F  (green)
#EDC948  (yellow)
#B07AA1  (purple)
#FF9DA7  (pink)
```

### Semantic Colors
- Success: `#22C55E`
- Warning: `#F59E0B`
- Error: `#EF4444`
- Info: `#3B82F6`

### Custom Palette Integration
When the user provides brand colors or a palette, use them as:
1. Primary → main fills and key elements
2. Secondary → supporting elements
3. Accent → highlights, call-to-action, key data points
4. Neutral → backgrounds, borders, labels

Define colors as `<defs>` constants when reused:
```xml
<defs>
  <style>
    :root { --primary: #4E79A7; --accent: #E15759; --bg: #F8F9FA; }
  </style>
</defs>
```

## Category-Specific Guidelines

---

### 1. Diagrams (Flowcharts, Architecture, ER)

**Structure:**
- Nodes as rounded rectangles (`rx="8"`) or circles
- Connections as paths with arrowhead markers
- Labels centered in shapes using `<text>` with `text-anchor="middle"` and `dominant-baseline="central"`

**Reusable markers:**
```xml
<defs>
  <marker id="arrow" viewBox="0 0 10 7" refX="10" refY="3.5"
          markerWidth="10" markerHeight="7" orient="auto-start-reverse">
    <polygon points="0 0, 10 3.5, 0 7" fill="#374151"/>
  </marker>
</defs>
```

**Layout rules:**
- Flowcharts: top-to-bottom, 120px vertical spacing between nodes
- Architecture: left-to-right layers (client → API → service → DB)
- ER diagrams: entities as rectangles, relationships as diamonds
- Consistent node sizing: width 160-200px, height 60-80px
- Connection paths: use cubic beziers for curves, straight lines for grid layouts
- Min 20px padding between edge of shape and text

**Example — Simple Flowchart:**
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" role="img" aria-labelledby="title desc">
  <title id="title">User Login Flow</title>
  <desc id="desc">Flowchart showing login, validation, and redirect steps</desc>
  <defs>
    <marker id="arrow" viewBox="0 0 10 7" refX="10" refY="3.5"
            markerWidth="10" markerHeight="7" orient="auto-start-reverse">
      <polygon points="0 0, 10 3.5, 0 7" fill="#374151"/>
    </marker>
  </defs>
  <g id="nodes">
    <g id="start">
      <rect x="300" y="30" width="200" height="60" rx="30" fill="#F0F0F5" stroke="#374151" stroke-width="2"/>
      <text x="400" y="60" text-anchor="middle" dominant-baseline="central" font-family="system-ui, sans-serif" font-size="14" fill="#111827">Start</text>
    </g>
    <g id="input">
      <rect x="300" y="150" width="200" height="60" rx="8" fill="#FFFFFF" stroke="#374151" stroke-width="2"/>
      <text x="400" y="180" text-anchor="middle" dominant-baseline="central" font-family="system-ui, sans-serif" font-size="14" fill="#111827">Enter Credentials</text>
    </g>
    <g id="validate">
      <polygon points="400,270 500,330 400,390 300,330" fill="#FFFFFF" stroke="#374151" stroke-width="2"/>
      <text x="400" y="330" text-anchor="middle" dominant-baseline="central" font-family="system-ui, sans-serif" font-size="14" fill="#111827">Valid?</text>
    </g>
  </g>
  <g id="connections" fill="none" stroke="#374151" stroke-width="2" marker-end="url(#arrow)">
    <line x1="400" y1="90" x2="400" y2="150"/>
    <line x1="400" y1="210" x2="400" y2="270"/>
  </g>
</svg>
```

---

### 2. Icons (Phosphor-style)

**Rules:**
- viewBox `0 0 24 24` (or `0 0 256 256` for Phosphor-native scale)
- Stroke-based, no fills (thin line style)
- `stroke-width="1.5"` for 24px grid, `stroke-width="16"` for 256px grid
- `stroke-linecap="round"` and `stroke-linejoin="round"` always
- `fill="none"` on all paths
- Center the icon in the grid with ~2px padding (24px grid)
- Consistent visual weight across a set

**Template:**
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
     stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"
     role="img" aria-labelledby="icon-title">
  <title id="icon-title">{Icon name}</title>
  <!-- paths here -->
</svg>
```

**Example — Home icon:**
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
     stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"
     role="img" aria-labelledby="icon-title">
  <title id="icon-title">Home</title>
  <path d="M3 12L12 3l9 9"/>
  <path d="M5 10v9a1 1 0 001 1h3v-5h6v5h3a1 1 0 001-1v-9"/>
</svg>
```

---

### 3. Floor Plans

**Conventions:**
- Scale: 1 SVG unit = 1 cm (or label the scale explicitly)
- Walls: `stroke-width="4"` (exterior) / `stroke-width="2"` (interior)
- Doors: 90° arc with `<path>` using arc commands
- Windows: dashed line on wall (`stroke-dasharray="6 3"`)
- Rooms labeled with centered `<text>`, include dimensions
- Furniture as simplified rectangles/circles in a lighter stroke

**Dimension lines:**
```xml
<g class="dimension" stroke="#999" stroke-width="0.5" font-size="10" fill="#666">
  <line x1="100" y1="520" x2="400" y2="520" marker-start="url(#dim-tick)" marker-end="url(#dim-tick)"/>
  <text x="250" y="515" text-anchor="middle">3.0m</text>
</g>
```

**Door arc pattern:**
```xml
<!-- Door at position (200, 300), opening right, 80px wide -->
<g class="door">
  <line x1="200" y1="300" x2="200" y2="300" stroke="#374151" stroke-width="2"/>
  <path d="M200,300 A80,80 0 0,1 280,300" fill="none" stroke="#374151" stroke-width="1" stroke-dasharray="4 2"/>
</g>
```

---

### 4. Circuit Schematics

**Component library** (see `references/circuit-components.svg`):

| Component | Symbol approach |
|---|---|
| Resistor | Zigzag path (US) or rectangle (EU) |
| Capacitor | Two parallel lines with gap |
| Inductor | Series of bumps/arcs |
| Diode | Triangle + line |
| LED | Diode + two arrows |
| Transistor (NPN) | Circle with emitter arrow out |
| IC/Chip | Rectangle with pin labels |
| Ground | Three decreasing horizontal lines |
| Battery | Alternating long/short parallel lines |
| Switch | Angled line with gap |

**Rules:**
- Signal flows left-to-right
- Power rails top (VCC) to bottom (GND)
- Grid-snap: all junctions on 20px grid
- Connection dots: `<circle r="3" fill="#374151"/>` at wire junctions
- No-connect: small X at wire end
- Component labels above, values below
- Use `<use>` with `<defs>` for repeated components

**Wire connection dot:**
```xml
<circle cx="200" cy="300" r="3" fill="#374151"/>
```

**Resistor (US-style, horizontal, centered at cx,cy):**
```xml
<g id="resistor-h" transform="translate({cx},{cy})">
  <path d="M-30,0 -20,0 -15,-10 -5,10 5,-10 15,10 20,0 30,0" fill="none" stroke="#374151" stroke-width="2"/>
  <text x="0" y="-15" text-anchor="middle" font-family="system-ui" font-size="11" fill="#374151">R1</text>
  <text x="0" y="22" text-anchor="middle" font-family="system-ui" font-size="10" fill="#666">10kΩ</text>
</g>
```

---

### 5. Illustrations (Abstract, Geometric, Decorative)

**Guidelines:**
- Use geometric primitives: `<circle>`, `<rect>`, `<polygon>`, `<path>`
- Layer with opacity for depth: `opacity="0.6"`
- Gradients for polish (linear or radial in `<defs>`)
- Keep path count low — suggest complexity through overlap and color, not detail
- Use `<clipPath>` for masked regions
- Decorative patterns via `<pattern>` in `<defs>`

**Gradient template:**
```xml
<defs>
  <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
    <stop offset="0%" stop-color="#4E79A7"/>
    <stop offset="100%" stop-color="#E15759"/>
  </linearGradient>
</defs>
<circle cx="200" cy="200" r="150" fill="url(#grad1)"/>
```

**Pattern template:**
```xml
<defs>
  <pattern id="dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
    <circle cx="10" cy="10" r="2" fill="#D1D5DB"/>
  </pattern>
</defs>
<rect width="400" height="400" fill="url(#dots)"/>
```

---

### 6. Data Visualizations

**Chart types and approach:**

| Chart | Technique |
|---|---|
| Bar chart | `<rect>` elements, bottom-aligned |
| Line chart | `<polyline>` or `<path>` with data points as `<circle>` |
| Pie chart | `<path>` arcs using arc commands, or `stroke-dasharray` on circle |
| Area chart | `<path>` filled to baseline |
| Scatter plot | `<circle>` elements positioned by data |
| Horizontal bar | `<rect>` left-aligned |

**Chart structure:**
```xml
<g id="chart" transform="translate(60, 20)">
  <!-- Chart area: 500x340 inside 600x400 viewBox -->
  <g id="axes">
    <line x1="0" y1="0" x2="0" y2="340" stroke="#374151" stroke-width="1"/>  <!-- Y axis -->
    <line x1="0" y1="340" x2="500" y2="340" stroke="#374151" stroke-width="1"/>  <!-- X axis -->
  </g>
  <g id="grid" stroke="#E5E7EB" stroke-width="0.5">
    <!-- Horizontal grid lines at intervals -->
  </g>
  <g id="data">
    <!-- Bars, lines, or points -->
  </g>
  <g id="labels" font-family="system-ui, sans-serif" font-size="11" fill="#374151">
    <!-- Axis labels and values -->
  </g>
</g>
```

**Rules:**
- Always include axis labels and a title
- Use the categorical palette for multi-series data
- Add a legend when >1 series
- Y-axis starts at 0 for bar charts (no truncation)
- Data labels on bars when ≤10 bars
- Grid lines: light gray, behind data
- Animate sparingly (only if requested): use CSS `@keyframes` or SMIL

**Bar chart bar pattern:**
```xml
<!-- Bar: x position, width, value mapped to height -->
<rect x="{barX}" y="{barY}" width="40" height="{barH}" rx="2" fill="#4E79A7"/>
<text x="{barX + 20}" y="{barY - 5}" text-anchor="middle" font-size="11" fill="#374151">{value}</text>
```

---

### 7. UI Mockups (Wireframes)

**Conventions:**
- Use grayscale only (wireframe = structure, not style)
- Background: `#F8F9FA`, cards: `#FFFFFF`, text placeholder: `#9CA3AF`
- Text: use actual labels, not lorem ipsum (unless asked)
- Rectangles with `rx="8"` for cards/buttons
- Wavy lines or gray bars for placeholder text blocks
- Image placeholders: rectangle with diagonal cross + "Image" label
- Use `font-family="system-ui, sans-serif"` consistently

**Common UI elements:**

Button:
```xml
<g id="button">
  <rect x="0" y="0" width="120" height="40" rx="8" fill="#111827"/>
  <text x="60" y="20" text-anchor="middle" dominant-baseline="central" font-size="14" fill="#FFFFFF" font-family="system-ui">Submit</text>
</g>
```

Text input:
```xml
<g id="input">
  <rect x="0" y="0" width="280" height="40" rx="6" fill="#FFFFFF" stroke="#D1D5DB" stroke-width="1"/>
  <text x="12" y="20" dominant-baseline="central" font-size="13" fill="#9CA3AF" font-family="system-ui">Placeholder text</text>
</g>
```

Image placeholder:
```xml
<g id="img-placeholder">
  <rect x="0" y="0" width="200" height="150" rx="4" fill="#E5E7EB"/>
  <line x1="0" y1="0" x2="200" y2="150" stroke="#D1D5DB" stroke-width="1"/>
  <line x1="200" y1="0" x2="0" y2="150" stroke="#D1D5DB" stroke-width="1"/>
  <text x="100" y="75" text-anchor="middle" dominant-baseline="central" font-size="12" fill="#9CA3AF">Image</text>
</g>
```

Navigation bar:
```xml
<g id="navbar">
  <rect x="0" y="0" width="375" height="56" fill="#FFFFFF"/>
  <line x1="0" y1="56" x2="375" y2="56" stroke="#E5E7EB" stroke-width="1"/>
  <text x="187" y="28" text-anchor="middle" dominant-baseline="central" font-size="16" font-weight="bold" fill="#111827" font-family="system-ui">Title</text>
</g>
```

---

## SVG Best Practices Checklist

Before outputting any SVG, verify:

- [ ] `xmlns="http://www.w3.org/2000/svg"` present
- [ ] `viewBox` set with appropriate dimensions
- [ ] `<title>` and `<desc>` for accessibility
- [ ] `role="img"` and `aria-labelledby` on root `<svg>`
- [ ] Logical `<g>` grouping with `id` attributes
- [ ] No inline styles — use attributes (`fill`, `stroke`, etc.)
- [ ] Reusable elements in `<defs>` referenced via `<use>`
- [ ] Text uses `text-anchor` and `dominant-baseline` for alignment
- [ ] `font-family="system-ui, sans-serif"` (safe web fallback)
- [ ] No unnecessary `transform` nesting
- [ ] Coordinates on integer grid where possible
- [ ] Colors from the appropriate palette
- [ ] `stroke-linecap` and `stroke-linejoin` set on stroked paths
- [ ] Markers defined in `<defs>` for arrows/endpoints
- [ ] Clean indentation and readable structure

## Tips for Minimal Output

1. **Prefer `<path>` over multiple primitives** when shapes are complex
2. **Use `<use href="#id">` ** to repeat symbols — define once in `<defs>`
3. **Avoid `<style>` blocks** when only a few elements need styling — use direct attributes
4. **Use `<style>` blocks** when many elements share styles (>5 elements with same fill/stroke)
5. **Shorthand path commands**: `h`, `v`, `z` for horizontal/vertical/close
6. **Round coordinates** to integers; use max 1 decimal place if needed
7. **Remove default values**: don't write `opacity="1"` or `fill-rule="nonzero"`
8. **Combine connected paths** into a single `<path>` when they share style
9. **Use `currentColor`** for icons so they inherit text color from CSS

## Animation (When Requested)

Prefer CSS animations over SMIL for browser compatibility:

```xml
<style>
  @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
  .animated { animation: fadeIn 0.5s ease-in-out; }
</style>
```

For simple transitions, SMIL is acceptable:
```xml
<circle r="5">
  <animate attributeName="r" values="5;10;5" dur="2s" repeatCount="indefinite"/>
</circle>
```

## File Output

When writing SVG to a file, use `.svg` extension. The SVG should be self-contained (no external references) unless the user specifies otherwise.

For reference component libraries, see:
- `references/circuit-components.svg` — Reusable circuit symbols
- `references/ui-components.svg` — Reusable wireframe elements
- `references/patterns.svg` — Decorative fill patterns
