# Mihrab Animation Brief

## Concept
Real-time p5.brush animation that draws the Ottoman mihrab sequentially, element by element. Each element gets a HUD tracking box showing the mathematical formula and live x,y coordinates of the brush.

## Drawing Sequence
1. Ground line
2. Column bases (left, then right)
3. Column shafts (drawing upward)
4. Capitals (flaring outward)
5. Main pointed arch (left arc, then right arc)
6. Arch legs (down to base)
7. Inscription band (horizontal lines, then calligraphy)
8. Vertical jambs (band down to capitals)
9. Crown arch (left arc, then right arc)
10. 12-fold star pattern (outer ring → inner rings)
11. Blue watercolor fill (last — wash floods the niche)

## HUD Tracking Box Design
- Rectangular bounding box around the element currently being drawn
- **Corner brackets** — small L-shaped marks at each corner (not full border)
- Thin 1px lines, accent color (cyan `#00d4ff` or green `#00ff88`)
- Small filled squares at each corner intersection (4-6px)
- **Label**: element name (e.g., "COLUMN BASE")
- **Formula**: the mathematical derivation (e.g., "width = U/φ² × φ/√2")
- **Live coords**: x,y updating as the brush moves
- Subtle pulse/glow when element completes
- Tech font (monospace)

## Math Derivations per Element
| Element | Width Formula | Height/Position Formula |
|---------|--------------|------------------------|
| Base unit U | W/(2φ+2) | — |
| Column base | U/φ² × φ/√2 | height = U/φ³ |
| Column shaft | U/φ² | springY to baseTop |
| Capital | U/φ² × φ | height = U/φ² × φ |
| Niche arch | span = 2U | R = 2U, H = U√3 |
| Inscription band | bandW | height = U/φ |
| Crown arch | bandW × √φ | R = span/√2 |
| Star layers | r, r/φ, r/φ², r/φ³ | center at crownPeak + crownH/φ |

## Technical Approach
- p5.brush in `draw()` loop
- Progress counter controlling which element + how much of it is drawn
- HTML overlay div for HUD (positioned absolutely over canvas)
- `brush.refreshField()` each frame for animated strokes
- Each element has: start frame, end frame, point sequence
- Between elements: brief pause, HUD transitions to next box

## Current File
`test-mihrab-option2.html` — static version with all math finalized

## Proportional System
- U = W/(2φ+2) ≈ 206px
- All dimensions derive from U using φ, √3, √2
- Springing at golden section (61.8% down)
- Star scales at φ ratios
