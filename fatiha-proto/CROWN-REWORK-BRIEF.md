# Crown Arch Rework Brief

## What Tawfeeq wants
- Crown arch base 50% wider than current
- Same peak height
- That's it. Simple.

## Current crown
- Base width: 949px (x=65 to x=1015 on 1080px canvas)
- Height: 475px
- Drawn as two circular arcs (equilateral pointed arch with R=671)

## Why it keeps failing
- 949 × 1.5 = 1424px — wider than the 1080px canvas
- The circular arc construction places springing points off-canvas
- p5.brush splines break when control points are off-screen
- Compass sweep animation also generates off-screen points
- Crown wash fill polygon also goes off-screen

## The right approach
DON'T use circular arcs. Draw the crown as a simple parametric curve:
- Start at (0, crownSpringY) — left edge of canvas
- Curve up to (cx, crownPeakY) — peak
- Curve down to (W, crownSpringY) — right edge of canvas
- All points always on-canvas
- Use a cosine curve or quadratic bezier — no arc centers needed
- The "50% wider" is achieved because the arch now spans the FULL canvas width
  instead of 88% of it

## What needs to change
1. Crown spline pre-computation — replace arc math with parametric curve
2. Crown compass sweep animation — replace with parametric progress
3. Crown wash fill polygon — use same parametric points
4. Crown annotations (R callout) — update formula display
5. crownC1x/C2x — remove, no longer needed
