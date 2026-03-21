# Islamic Geometric Patterns: Tools, Algorithms & Academic Research

Comprehensive research compiled 2026-03-20.

---

## 1. CRAIG S. KAPLAN — University of Waterloo

### Background
- Professor in the Cheriton School of Computer Science, University of Waterloo
- PhD: "Computer Graphics and Geometric Ornamental Design" (University of Washington, 2002)
- Website: https://isohedral.ca/ | https://cs.uwaterloo.ca/~csk/
- GitHub: https://github.com/isohedral

### Key Publications

**"Computer Generated Islamic Star Patterns" (2000)**
- Bridges Conference paper introducing the computational framework
- PDF: https://cs.uwaterloo.ca/~csk/publications/Papers/kaplan_2000.pdf

**"Islamic Star Patterns in Absolute Geometry" (2004)**
- Co-authored with David Salesin
- Published: ACM Transactions on Graphics 23(2):97-119
- Presents **Najm** — tools built on axioms of absolute geometry
- Uses "inflation tilings" as guides for star patterns
- Patterns work equally on Euclidean plane, hyperbolic plane, and sphere
- As curvature decreases (sphere -> Euclidean -> hyperbolic), same pattern accommodates stars with more points
- PDF: https://grail.cs.washington.edu/wp-content/uploads/2015/08/kaplan-2004-isp.pdf

**"Islamic Star Patterns from Polygons in Contact" (2005)**
- The definitive paper on computational Hankin method
- PDF: https://cs.uwaterloo.ca/~csk/publications/Papers/kaplan_2005.pdf

**"Introductory Tiling Theory for Computer Graphics" (book)**
- Covers: tiling basics, symmetry, tilings by polygons, isohedral tilings, nonperiodic/aperiodic tilings, orbifolds, fundamental regions
- Describes algorithms and data structures for practical tiling implementation
- Springer: https://link.springer.com/book/10.1007/978-3-031-79543-5

**"Freeform Islamic Geometric Patterns" (2023)**
- Co-authored with Rebecca Lin, arXiv:2301.01471
- Non-periodic rosette compositions using circle packing
- https://arxiv.org/abs/2301.01471

### Kaplan's Two Methods

**Method 1: "Najm" (Explicit Motifs)**
- User selects radially-symmetric motifs for each regular polygon in template tiling
- Computer fills remaining (irregular) tiles using the inference algorithm
- More user control over design

**Method 2: "Hankin" (Inference Only)**
- No explicit motifs — uses only the inference algorithm
- Parameterized by a single "contact angle" value
- More automated, fewer parameters

### The Inference Algorithm (Core of Kaplan's Work)

**Purpose:** Fill irregular polygonal "holes" (gaps between regular polygons) with plausible motifs.

**Guiding principle:** Create perfect crossings at every contact position by extending contact edges of motifs adjacent to the hole, then cutting them appropriately.

**Process:**
1. Start with a template tiling of the plane (containing regular + irregular polygons)
2. Place star/rosette motifs in regular polygons (motif points bisect polygon edges)
3. For irregular gap regions: extend line segments terminating on the boundary until they meet other extended segments in the interior
4. Erase the underlying tiling
5. Join inferred motifs together -> star pattern emerges

**Parameters:**
- **theta (contact angle)**: Angle at which rays meet polygon edges. Can vary continuously to create parquet deformations.
- **delta**: Distance between new starting points of rays. Varies from 0 (original construction) up to shortest tile edge length.
- **s**: Number of subsegments kept when truncating star segments.

### Star Construction (from Kaplan's paper)

**Basic Star {n/d}s:**
- n = number of points (n >= 3)
- d = step parameter (1 <= d < n/2)
- s = subsegment count

**Vertex positions:** Points on unit circle: gamma(t) = (cos(2*pi*t/n), sin(2*pi*t/n))
**Segments:** sigma_i connects gamma(i) to gamma(i+d) for 0 <= i < n
**Non-integer d:** Point P = intersection of gamma(i)->gamma(i+d) and gamma(i+floor(d)-d)->gamma(i+floor(d)). Replace sigma_i with two segments.

### Rosette Construction (Lee's Method, n >= 5)

1. Inscribe regular n-gon in unit circle
2. Draw inner n-gon with vertices bisecting outer n-gon edges
3. Point E = intersection of segment CD with angle bisector of angle OAB
4. Point F = intersection of line OA with line through E parallel to OD
5. Apply dihedral symmetry group d_n to replicate edges DE and EF
6. Inner star points at F-copies, completed using standard star construction
7. E can slide along bisector to vary rosette shape while preserving congruence

### Template Tilings (14 encoded in Kaplan's system)

Three sources:
1. **Familiar tilings** — regular or semi-regular (Archimedean) tessellations
2. **Pattern-derived tilings** — extracted from existing Islamic designs
3. **Experimental tilings** — novel arrangements for new patterns

---

## 2. HANKIN'S "POLYGONS IN CONTACT" METHOD (1925)

### Historical Origin
- E. H. Hankin, "The Drawing of Geometric Patterns in Saracenic Art" (1925)
- Published in Memoirs of the Archaeological Survey of India, No. 15

### The Algorithm

1. Cover the surface with a network of **polygons in contact** (touching edge-to-edge)
2. Through the **center (midpoint) of each side** of each polygon, draw two lines crossing like an X
3. Continue these lines until they meet other lines of similar origin
4. Delete the original construction lines
5. The pattern remains without any visible clue to the method

### Key Concepts

**1-Point Pattern:** Single ray emanates from each edge midpoint
**2-Point Pattern:** Two rays emanate from points offset by delta from midpoint

**Contact angle theta:** The angle between the ray and the polygon edge. This single parameter controls the entire pattern character.

**For regular n-gon:** A new regular n-gon is placed concentric but rotated, with segments connecting vertices to edge midpoints of the original polygon.

### Why It Works
Roman Verostko argues these constructions are effectively **algorithms**, making Islamic geometric patterns forerunners of modern algorithmic art.

### Paper: Hankin's Method Formalized
- "Hankin's 'Polygons in Contact' Grid Method for Recreating..." Bridges 2008
- PDF: https://archive.bridgesmathart.org/2008/bridges2008-21.pdf

---

## 3. TAPRATS SOFTWARE

### Overview
- Java application for generating Islamic geometric patterns
- Created by Craig S. Kaplan, extended by Pierre Baillargeon
- Open source (GPL v2+)
- Download: https://sourceforge.net/projects/taprats/
- Website: https://taprats.sourceforge.net/

### Two Techniques Implemented

**Technique 1: Hankin-Lee Method**
- Start with plane tilings of regular polygons
- Fill with radially symmetric motifs
- Extend lines across gap-filling tiles
- Result: unified network with graph-theoretic properties for coloring/weaving

**Technique 2: Lu-Steinhardt Method (Girih Tiles)**
- Based on classical girih tiles (equilateral polygons)
- Decorate tiles with specific line patterns
- Assembly produces historical Islamic designs

### Features
- Built-in library of historical Islamic tilings
- Parameterized pattern construction
- Coloring capabilities
- Weave/interlacing rendering
- Customizable pattern generation

---

## 4. ERIC BROUG — Author, Educator, Artist

### Background
- MA in History of Islamic Art and Architecture, SOAS London
- One of the world's leading experts in Islamic geometric pattern design
- Runs the School of Islamic Geometric Design
- Website: http://broug.com/
- Online courses: https://sigd.teachable.com/

### Books

**"Islamic Geometric Patterns" (Thames & Hudson)**
- 23 geometric patterns with step-by-step instructions
- Covers three foundational "family" shapes: square, hexagon, pentagon
- Technical tips on geometric basics
- Historical context of famous Islamic art/architecture

**"Islamic Geometric Design" (Thames & Hudson)**
- In-depth analysis of complex geometric designs in historical/physical context
- Reveals techniques used to create patterns on Islamic buildings

**"Islamic Design Workbook"**
- Practical workbook format

### Teaching Approach
- Compass-and-straightedge construction (no angle measurements needed)
- "The craftsmen who created these designs were not mathematicians but people who worked with their hands"
- Online course: 13 lectures including "How Grids and Patterns Work Together" and "How to Tessellate a Sixfold Pattern"
- TED-Ed lesson: "The complex geometry of Islamic design" — https://ed.ted.com/lessons/the-complex-geometry-of-islamic-design-eric-broug

### Core Teaching Method
- All patterns start with circles and straight lines
- Three families: based on square, hexagon, or pentagon
- Step-by-step ruler-and-compass instructions mimicking historical craftsman techniques
- Patterns can be reproduced without measuring angles

---

## 5. JAY BONNER — Pattern Classification

### Book: "Islamic Geometric Patterns: Their Historical Development and Traditional Methods of Construction" (Springer, 2017)
- 600+ color images, co-authored with Craig Kaplan
- Focus on the **polygonal technique** — the primary historical method
- https://link.springer.com/book/10.1007/978-1-4419-0217-7

### Classification System

**Two main streams:**
1. **Systematic patterns** — use a finite set of tiles combining in innumerable ways
2. **Nonsystematic patterns** — unique constructions

**Five Historical Systems (within systematic):**
1. System using regular polygons
2. First fourfold system
3. Second fourfold system
4. Fivefold system
5. Sevenfold system

### Grid Types Used
Orthogonal, isometric, rhombic, rectangular, regular hexagonal, irregular hexagonal, and radial grids — with single or multiple regions of local symmetry.

### Dual-Level Designs
Girih patterns evolved in dual levels: filling spaces between large-scale pattern lines with small-scale patterns (self-similar decoration).

---

## 6. GIRIH TILES & QUASICRYSTALS

### Lu & Steinhardt Discovery (2007)
- Peter Lu and Paul Steinhardt, "Decagonal and Quasi-Crystalline Tilings in Medieval Islamic Architecture"
- Published in Science 315:1106 (2007)
- PDF: https://www.physics.rutgers.edu/~pchandra/physics601/Lu_Steinhardt.pdf

### The Five Girih Tiles
A set of five equilateral polygons decorated with lines:
- **Decagon** (10-sided)
- **Pentagon** (5-sided)
- **Hexagon** (elongated, 6-sided)
- **Bowtie** (non-convex)
- **Rhombus**

When tiles are laid edge-to-edge, decorated lines connect to form continuous patterns.

### Historical Timeline
- By ~1200 CE: girih patterns reconceived as tessellations of girih tiles
- By 15th century: combined with **self-similar transformations** to construct quasi-crystalline Penrose patterns
- This was **five centuries before** Western discovery of Penrose tilings

### Subdivision/Inflation Rules
Each large girih tile can be subdivided into smaller girih tiles:
- 1 LARGE BOWTIE = 14 small decagons + 14 small bowties + 6 small hexagons
- 1 LARGE HEXAGON = 22 small decagons + 22 small bowties + 10 small hexagons
- 1 LARGE DECAGON = 80 small decagons + 80 small bowties + 36 small hexagons

### Connection to Penrose Tilings
- Penrose tilings are self-similar via inflation/deflation
- Substitution rules decompose each tile into smaller tiles of the same shapes
- The Darb-e Imam shrine in Isfahan shows near-perfect quasi-crystalline patterns

---

## 7. FREEFORM ISLAMIC GEOMETRIC PATTERNS (Lin & Kaplan, 2023)

### Paper: arXiv:2301.01471
- https://ar5iv.labs.arxiv.org/html/2301.01471

### Algorithm (Circle Packing Approach)

**Step 1: Input — Simplicial Complex**
- Collection of non-overlapping triangles meeting edge-to-edge
- Can be authored manually or generated (e.g., Delaunay triangulation)

**Step 2: Circle Packing**
- Discrete Uniformization Theorem guarantees packing exists
- Uses Collins & Stephenson iterative approach
- Each vertex gets a circle; circles tangent iff vertices share an edge
- Boundary radii: **r = (1 - sin(phi)) / sin(phi)** where **phi = pi/(2n-2)** for degree-n boundary vertex

**Step 3: Polygonal Patch**
For each interior circle C with degree k:
- Create 2k vertices: k tangency points + k arc midpoints
- Scale polygon by factor **tau** (default 0.8) relative to circle center
- tau balances star quality vs. filler pentagon regularity

**Filler Pentagon Generation:**
For each triplet of mutually tangent circles (Ci, Cj, Ck):
- Divide gaps into 3 pentagons using edges through tangency points
- Inner edges connect to point **o** = incenter of triangle from circle centers

**Step 4: Motif Construction**

*For Cyclic Polygons (Wheel Construction):*
- Select edge midpoints of cyclic 2k-gon as outer star points
- Inner circle radius: **r = rC * cos(pi/2k)**
- Scaling ratio alpha: **alpha = 1 - [2*sin(pi/n)*sin(pi(n-2)/2n)*sin(theta - pi/n)] / sin(pi/2 + 2*pi/n - theta)**
- Connect every other star point with zig-zag paths

*For Filler Pentagons (PIC method):*
- Ray pairs from each edge midpoint, rotated by +/- theta from edge normal
- Contact angle theta defaults to **2*pi/5**
- Truncate rays at intersection with adjacent edge rays
- Pentagon edges adjacent to cyclic polygons: use contact angles yielding rays parallel to adjacent star edges
- Pentagon-to-pentagon edges: use global theta

### Key Formula: Converting PIC angle to wheel scaling

For consecutive points: **alpha = 1 - [sin(pi/n)*sin(theta)] / sin(pi(n+2)/2n - theta)**
For non-consecutive: **alpha = 1 - [2*sin(pi/n)*sin(pi(n-2)/2n)*sin(theta - pi/n)] / sin(pi/2 + 2*pi/n - theta)**

### Data Structures
- **Complex K**: vertices, edges, faces (triangular)
- **Circle Packing**: collection of circles with position and radius
- **Patch**: cyclic polygons + filler pentagons with vertex coordinates
- **Motifs**: line segments forming stars and rosette arms

### Rosette Properties
- Order = twice the degree of associated vertex
- Odd orders require "bowtie gadgets"
- "Square gadgets" produce octagons surrounded by four rosettes

### Quality Control
- Pentagon regularity measured using continuous symmetry measures (Zabrodsky et al.)
- tau optimized by testing values in (0.7, 0.9), minimizing average pentagon deviation

---

## 8. MODERN TOOLS & SOFTWARE

### Web-Based Tools

**Girih Tiling Editor** — https://girihdesigner.com/
- Browser-based, infinite canvas
- Five historical girih tiles
- Color/style customization
- Vector export
- By Nikolaus Baumgarten (2014-2016)

**Zillij - Islamic Pattern Generator** — https://islamicpattern.top/
- AI-powered Islamic pattern generation
- Cultural authenticity focus

**QFI Mosaic Tilemaker** — https://tilemaker.qfi.org/learn/
- Educational web app for mosaic patterns

**Islamic Pattern Generator (SVG)** — CodePen by Adrian Parr
- https://codepen.io/adrianparr/pen/VmBoLO
- Configurable parameters: dimensions, step distance, number of angles, colors
- SVG and PNG export

**Drawing Islamic Geometric Designs** — https://www.drawingislamicgeometricdesigns.com/

### Desktop Software

**Taprats** (Java) — https://sourceforge.net/projects/taprats/
- Craig Kaplan's star pattern generator (see section 3)

**Girih App** (macOS)
- Vector graphics design software for Islamic art
- Export: SVG, PNG, JPEG
- https://apps.apple.com/us/app/girih-polygon-pattern-design/id1400485589

**Tiled Pattern Maker** — https://github.com/ChortleMortal/TiledPatternMaker
- C++ tool for Andalusian and Islamic art patterns

**Arabeske** (Java) — Another pattern generation tool

**Generative Zellij** (Kaplan) — Procedural composition tool, SVG export

### CAD Plugins

**Girih for Grasshopper/Rhino** — https://www.food4rhino.com/en/app/girih
- Formal grammar and string rewriting system
- Letters/symbols generate formula for each pattern

**PatGen** — Islamic Pattern Generator by Serkan Uysal (2008)
- https://www.designcoding.net/patgen-islamic-pattern-generator/

### Code Libraries & Implementations

**CodingTrain StarPatterns (JavaScript/p5.js)**
- https://github.com/CodingTrain/StarPatterns
- Key files: hankin.js, polygon.js, edge.js, sketch.js
- Tiling files: HexagonalTiling.js, SquareOctagonTiling.js, DodecaHexaSquareTiling.js
- Based on Kaplan's Hankin method
- Uses Paul Bourke's line-line intersection algorithms

**miracle2k/islamic-patterns (TypeScript)**
- https://github.com/miracle2k/islamic-patterns
- Two approaches: geometric reconstruction + polygons-in-contact
- Uses Eric Broug's book for geometric foundations
- Editor interface, Artblocks integration
- Key files: featureScript.ts, editor.html

**harpninja/geometric (JavaScript/D3.js)**
- https://github.com/harpninja/geometric
- Modular: geometry.js (math), constructors.js (patterns), draw.js (D3 rendering)
- Patterns: 8-point star, octagon, fourfold
- Based on Eric Broug's "Islamic Geometric Designs"

**jaycody/saracenic-stars (JavaScript/p5.js)**
- https://github.com/jaycody/saracenic-stars
- Polygons-in-contact implementation
- Heptagonal tiling in non-Euclidean space

**Ehyaei/Kaashi (R)**
- https://github.com/Ehyaei/Kaashi
- R package implementing Hankin method
- Based on Kaplan's "Islamic Star Patterns from Polygons in Contact"

**p5.js Islamic Pattern Generator**
- https://editor.p5js.org/mortuish/sketches/VY-zqiIAp

**aykae/procedural-islamic-geometry (Houdini)**
- https://github.com/aykae/procedural-islamic-geometry
- L-Systems (Lindenmayer Systems) for pattern generation
- Encodes line sequences into rewriting rules
- 3D carving with boolean operations

### Tom Christie's Rosettes (Processing)
- https://tom-christie.github.io/islamic-geometric-patterns/
- Euclidean compass-and-ruler construction
- Interactive applet for dragging/resizing circles
- No angle measurements needed

---

## 9. WALLPAPER GROUPS & SYMMETRY

### The 17 Wallpaper Groups
- Only 17 possible plane symmetry groups
- Four basic transformations: translation, reflection, rotation, glide reflection
- Conway notation: * = reflection, x = glide-reflection, n = rotation order n

### Lattice Types
- 12 groups have rectangular symmetries
- 5 groups have hexagonal symmetries
- Five lattice types total

### Implementation Approach

**Fundamental domain method:**
1. Define the fundamental region (smallest repeating unit)
2. Apply symmetry group operations to create the unit cell
3. Replicate unit cell across the lattice

**For purely translational patterns:**
- Identify two linearly independent vectors v1, v2
- Symmetry group = translations by a*v1 + b*v2 for all integers a, b
- Fundamental region is a parallelogram

**For SVG rendering:**
- Generate minimal geometric information within fundamental region
- Apply inner symmetries (rotation, reflection) to create unit motif
- Execute translations via SVG `<use>` elements or `transform="translate(x,y)"`
- Use `transform="rotate(angle)"` for rotational symmetry

### Tools
- **MadPattern**: Free Adobe Illustrator templates for all 17 groups
- **Wallpaper Symmetry**: Free online JavaScript tool for all 17 groups

---

## 10. PROCEDURAL GENERATION METHODS — Summary of Algorithms

### Method 1: Hankin / Polygons in Contact
1. Choose a base tiling (regular polygons)
2. At each polygon edge midpoint, place ray(s) at contact angle theta
3. Extend rays until they intersect other rays
4. Delete construction lines
**Params:** theta (contact angle), delta (ray offset)
**Strength:** Simple, parameterized, easy to implement

### Method 2: Explicit Motif + Inference (Kaplan's Najm)
1. Choose template tiling with regular + irregular regions
2. User selects star/rosette for each regular polygon type
3. Inference algorithm fills irregular "holes"
4. Erase tiling, join motifs
**Params:** star (n, d, s), rosette parameters, tiling choice
**Strength:** More control, historical fidelity

### Method 3: Girih Tile Assembly (Lu-Steinhardt)
1. Select from 5 girih tile types
2. Lay tiles edge-to-edge
3. Decorated lines on tiles connect automatically
4. Apply subdivision rules for self-similar patterns
**Strength:** Historical authenticity, subdivision for detail

### Method 4: Circle Packing / Freeform (Lin-Kaplan 2023)
1. Create triangulated region
2. Compute circle packing
3. Build cyclic polygons + filler pentagons from circles
4. Fill with star/rosette motifs using wheel construction + PIC
**Strength:** Non-periodic, freeform compositions

### Method 5: L-Systems / Formal Grammar
1. Identify line sequences in pattern
2. Encode as L-system rewriting rules
3. Iterate rules to generate geometry
**Strength:** Compact encoding, animation potential

### Method 6: Dual Graph / Medial Axis
1. Start with a tiling
2. Compute dual (connect tile centers through shared edges)
3. Pattern lines follow medial axes between tile boundaries
**Strength:** Mathematical elegance

---

## 11. IMPLEMENTATION GUIDE — Data Structures & Code Architecture

### Core Data Structures

```
Point { x: float, y: float }

Edge {
  p1: Point,
  p2: Point,
  midpoint(): Point,
  length(): float,
  normal(): Vector,
  intersect(other: Edge): Point | null
}

Polygon {
  vertices: Point[],
  edges: Edge[],
  center: Point,
  isRegular: boolean,
  nSides: int,
  area(): float,
  contains(p: Point): boolean
}

Tiling {
  polygons: Polygon[],
  adjacency: Map<Edge, [Polygon, Polygon]>,
  fundamentalDomain: Polygon,
  symmetryGroup: WallpaperGroup,
  latticeVectors: [Vector, Vector]
}

StarMotif {
  n: int,          // number of points
  d: float,        // step parameter
  s: int,          // subsegments
  segments: Edge[],
  generate(polygon: Polygon): Edge[]
}

RosetteMotif extends StarMotif {
  innerStar: StarMotif,
  hexagons: Polygon[],
  generate(polygon: Polygon): Edge[]
}
```

### Core Algorithm: Line-Line Intersection

Essential for Hankin method — Paul Bourke's algorithm:
```
Given lines P1-P2 and P3-P4:
denominator = (y4-y3)(x2-x1) - (x4-x3)(y2-y1)
ua = ((x4-x3)(y1-y3) - (y4-y3)(x1-x3)) / denominator
ub = ((x2-x1)(y1-y3) - (y2-y1)(x1-x3)) / denominator
If 0 <= ua <= 1 and 0 <= ub <= 1: intersection exists
Point = (x1 + ua*(x2-x1), y1 + ua*(y2-y1))
```

### SVG Generation Approach

```svg
<svg viewBox="0 0 800 800">
  <defs>
    <!-- Define fundamental domain as a group -->
    <g id="motif">
      <path d="M... L... L..." stroke="..." fill="none"/>
    </g>
    <!-- Define unit cell (motif + symmetry operations) -->
    <g id="cell">
      <use href="#motif"/>
      <use href="#motif" transform="rotate(60, cx, cy)"/>
      <use href="#motif" transform="rotate(120, cx, cy)"/>
      <!-- ... more symmetry copies ... -->
    </g>
  </defs>

  <!-- Tile the plane with unit cells -->
  <use href="#cell" transform="translate(0, 0)"/>
  <use href="#cell" transform="translate(dx, 0)"/>
  <use href="#cell" transform="translate(dx/2, dy)"/>
  <!-- ... more translations ... -->
</svg>
```

### Canvas/WebGL Rendering

For **Canvas 2D:**
- Draw motif paths using ctx.beginPath(), ctx.lineTo()
- Apply transformations: ctx.translate(), ctx.rotate(), ctx.scale()
- Use ctx.save()/ctx.restore() for transformation stacking
- Batch render with requestAnimationFrame for animation

For **WebGL/Shaders:**
- Fragment shader approach: multiply UV coordinates to create grid
- Use mod() for tiling, step() and smoothstep() for lines
- Rotation matrices in shader for symmetry
- Distance fields for smooth anti-aliased edges
- Reference: The Book of Shaders ch.9 (https://thebookofshaders.com/09/)

---

## 12. KEY ACADEMIC PAPERS & REFERENCES

1. Hankin, E.H. "The Drawing of Geometric Patterns in Saracenic Art" (1925). Memoirs of the Archaeological Survey of India, No. 15.

2. Kaplan, C.S. "Computer Generated Islamic Star Patterns" (2000). Bridges Conference.

3. Kaplan, C.S. "Computer Graphics and Geometric Ornamental Design" (2002). PhD thesis, University of Washington.

4. Kaplan, C.S. & Salesin, D.H. "Islamic Star Patterns in Absolute Geometry" (2004). ACM TOG 23(2):97-119.

5. Kaplan, C.S. "Islamic Star Patterns from Polygons in Contact" (2005). Graphics Interface.

6. Lu, P. & Steinhardt, P. "Decagonal and Quasi-Crystalline Tilings in Medieval Islamic Architecture" (2007). Science 315:1106.

7. Bonner, J. "Islamic Geometric Patterns: Their Historical Development and Traditional Methods of Construction" (2017). Springer.

8. Kaplan, C.S. "Introductory Tiling Theory for Computer Graphics" (2009). Morgan & Claypool.

9. Lin, R. & Kaplan, C.S. "Freeform Islamic Geometric Patterns" (2023). arXiv:2301.01471.

10. Refalian, G. et al. "Formal grammar methodology for digital visualization of Islamic geometric patterns" (2022). IJAC.

11. Naserabad, A.A. & Ghanbaran, A. "Computational approach in presentation a parametric method to construct hybrid girihs" (2025). IJAC.

12. Broug, E. "Islamic Geometric Patterns" (2008). Thames & Hudson.

13. Broug, E. "Islamic Geometric Design" (2013). Thames & Hudson.

---

## Sources

- [Craig Kaplan PhD thesis](https://cs.uwaterloo.ca/~csk/other/phd/)
- [Islamic Star Patterns project page](https://cs.uwaterloo.ca/~csk/other/starpatterns/)
- [Taprats on SourceForge](https://taprats.sourceforge.net/)
- [Kaplan 2005 paper (PDF)](https://cs.uwaterloo.ca/~csk/publications/Papers/kaplan_2005.pdf)
- [Kaplan 2004 paper (PDF)](https://grail.cs.washington.edu/wp-content/uploads/2015/08/kaplan-2004-isp.pdf)
- [Kaplan 2000 paper (PDF)](https://cs.uwaterloo.ca/~csk/publications/Papers/kaplan_2000.pdf)
- [Isohedral.ca (Kaplan's website)](https://isohedral.ca/)
- [Freeform Islamic Patterns (arXiv)](https://ar5iv.labs.arxiv.org/html/2301.01471)
- [Hankin Bridges 2008 paper (PDF)](https://archive.bridgesmathart.org/2008/bridges2008-21.pdf)
- [Lu & Steinhardt 2007 (PDF)](https://www.physics.rutgers.edu/~pchandra/physics601/Lu_Steinhardt.pdf)
- [Jay Bonner book (Springer)](https://link.springer.com/book/10.1007/978-1-4419-0217-7)
- [Eric Broug website](http://broug.com/)
- [Eric Broug online school](https://sigd.teachable.com/)
- [Eric Broug TED-Ed lesson](https://ed.ted.com/lessons/the-complex-geometry-of-islamic-design-eric-broug)
- [CodingTrain StarPatterns (GitHub)](https://github.com/CodingTrain/StarPatterns)
- [miracle2k/islamic-patterns (GitHub)](https://github.com/miracle2k/islamic-patterns)
- [harpninja/geometric D3.js (GitHub)](https://github.com/harpninja/geometric)
- [jaycody/saracenic-stars (GitHub)](https://github.com/jaycody/saracenic-stars)
- [Kaashi R package (GitHub)](https://github.com/Ehyaei/Kaashi)
- [Girih Tiling Editor](https://girihdesigner.com/)
- [Tiled Pattern Maker (GitHub)](https://github.com/ChortleMortal/TiledPatternMaker)
- [TheBeachLab islamic-geometry (GitHub)](https://github.com/TheBeachLab/islamic-geometry)
- [Tom Christie rosettes](https://tom-christie.github.io/islamic-geometric-patterns/)
- [p5.js Islamic Pattern Generator](https://editor.p5js.org/mortuish/sketches/VY-zqiIAp)
- [CodePen SVG Pattern Generator](https://codepen.io/adrianparr/pen/VmBoLO)
- [Wallpaper group (Wikipedia)](https://en.wikipedia.org/wiki/Wallpaper_group)
- [The Book of Shaders: Patterns](https://thebookofshaders.com/09/)
- [Kaplan Tiling Theory book (Springer)](https://link.springer.com/book/10.1007/978-3-031-79543-5)
