# Annotation Layout System v2 — Architectural Convention

## Rules (from ISO 128, ASME Y14.5, NCS)

1. **All dimensions OUTSIDE the drawing** — connected by extension lines
2. **Extension lines**: start U/φ⁴ gap from object, extend U/φ⁴ past dimension line
3. **Stacked parallel rows**: smallest closest, largest outermost
4. **Row spacing**: U/φ³ between parallel dimension rows
5. **First row offset**: U/φ² from outermost drawing element
6. **Text always horizontal**, centered on dimension line
7. **Leaders never cross each other**
8. **Dimension lines never cross** — bump to next row if conflict

## Layout Zones

```
                    ROW 3 (overall)
                    ROW 2 (medium spans)
                    ROW 1 (detail)
     ┌──────────────────────────────┐
     │          DRAWING             │
R    │                              │  R
O    │     (mihrab composition)     │  O
W    │                              │  W
S    │                              │  S
     └──────────────────────────────┘
                    ROW 1 (detail)
                    ROW 2 (spans)
```

- **Bottom rows**: horizontal dimensions (spans, widths)
- **Right rows**: vertical dimensions (heights)  
- **Left rows**: vertical labels/formulas
- **Inside drawing**: radius callouts only (with leader + circle at center)

## Dimension Row System

```js
// Row offsets from drawing edge (in canvas coords)
var ROW_OFFSET_1 = U / (PHI*PHI);        // first row from edge
var ROW_SPACING = U / (PHI*PHI*PHI);      // between rows

// Bottom horizontal rows
var bottomRow1Y = baseBot + ROW_OFFSET_1;
var bottomRow2Y = bottomRow1Y + ROW_SPACING;

// Right vertical rows  
var rightRow1X = drawingRight + ROW_OFFSET_1;
var rightRow2X = rightRow1X + ROW_SPACING;
var rightRow3X = rightRow2X + ROW_SPACING;
```

## Elements per row (smallest → largest)
### Bottom rows (horizontal dimensions):
- Row 1: column width (U/φ²), base width
- Row 2: arch span (2U), band width
- Row 3: crown span (bandW×√φ)

### Right rows (vertical dimensions):
- Row 1: capital height (colW×φ), band height (U/φ)
- Row 2: column height, arch height (U√3)  
- Row 3: total composition height

### Inside drawing (radius callouts only):
- Arch radius R=2U (leader from center to arc)
- Crown radius R=span/√2
- Star radius r (leader from center to outer vertex)
