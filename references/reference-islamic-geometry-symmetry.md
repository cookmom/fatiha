# Islamic Geometric Pattern Symmetry Systems & Rosette Construction

Research compiled 2026-03-20.

---

## 1. N-Fold Symmetry Systems

Islamic geometric patterns are built on **divided circles** — the number of equal divisions around a circle determines the symmetry fold. All repeating patterns depend at their roots on the divided circle.

### The Crystallographic Restriction Theorem

For patterns that tile the plane with translational periodicity, only **2-, 3-, 4-, and 6-fold** rotational symmetries are permitted. The proof: if a lattice has a rotation of order n, then 2cos(2pi/n) must be an integer, which only holds for n = 1, 2, 3, 4, 6.

However, Islamic art **transcends this restriction** by using 5-fold, 8-fold, 10-fold, and 12-fold LOCAL symmetry at star centers, while the overall tiling lattice uses a compatible translational symmetry (typically rectangular or hexagonal).

### Fold Systems — Angles and Properties

| Fold | Central angle | Grid type | Root proportion | Constructible? | Key stars |
|------|--------------|-----------|----------------|---------------|-----------|
| **4-fold** | 90deg | Square | sqrt(2) | Yes (perpendicular bisector) | {8/2}, {8/3} |
| **5-fold** | 72deg | Irregular / 54deg rectangle | Golden ratio phi | Yes (pentagon construction) | {5/2}, {10/3}, {10/4} |
| **6-fold** | 60deg | Hexagonal / triangular | sqrt(3) | Yes (radius = side of inscribed hexagon) | {6/2}, {12/4}, {12/5} |
| **8-fold** | 45deg | Square (octagonal sublattice) | sqrt(2) | Yes (bisect 90deg) | {8/3} |
| **10-fold** | 36deg | Rectangular / rhombic | Golden ratio phi | Yes (bisect 72deg) | {10/3}, {10/4} |
| **12-fold** | 30deg | Hexagonal (dodecagonal sublattice) | sqrt(3) | Yes (bisect 60deg) | {12/4}, {12/5} |
| **7-fold** | ~51.43deg | Irregular | — | NO (requires approximation) | {7/2}, {7/3} |
| **9-fold** | 40deg | Irregular | — | NO (requires approximation) | {9/3}, {9/4} |

### Circle Division Procedures (Compass & Straightedge)

**6-fold (exact, simplest):**
The compass radius fits exactly 6 times around any circle. Step the compass around the circumference from any starting point.

**4-fold (exact):**
Draw a diameter, then construct its perpendicular bisector. This gives 4 equal divisions at 90deg. Further bisection yields 8-fold (45deg), then 16-fold, etc.

**5-fold (exact, via pentagon construction):**
1. Draw circle with center O on horizontal line
2. Find midpoint M of radius OA (right side)
3. Arc from M with radius M-to-top-of-circle, swing down to horizontal line = point P
4. Distance from top-of-circle to P = side length of inscribed pentagon
5. Step this length around the circle 5 times

**10-fold:** Extend the 5-fold division across the diameter (each 72deg arc bisected = 36deg).

**12-fold:** Combine the 4-fold and 6-fold divisions on the same circle (gives 30deg spacing).

**7-fold and 9-fold:** No exact compass-and-straightedge solution exists. Historical Islamic geometers used known approximations acceptable for small-scale work.

### What Determines Which Fold Is Used?

- **Region/tradition**: North African (Moorish) art favors 8-fold and 12-fold; Persian art favors 5-fold and 10-fold; Ottoman art uses 6-fold and 12-fold extensively
- **Material constraints**: Zellij (cut tile) works well with angles that subdivide 360deg evenly; woodwork (girih) accommodates more complex folds
- **Aesthetic complexity**: Higher folds create denser, more intricate patterns
- **Combinability**: 4-fold and 8-fold combine naturally (both based on sqrt(2)); 5-fold and 10-fold combine (both based on phi); 6-fold and 12-fold combine (both based on sqrt(3))

---

## 2. Star Polygon Notation: {n/k}

### Definition

A **regular star polygon {n/k}** (Schlafli symbol) is constructed by placing n equally-spaced points on a circle and connecting every k-th point with straight lines.

- **n** = number of vertices (points on the circle)
- **k** = step size (connect every k-th point), also called the "density"
- Constraint: **gcd(n, k) = 1** and **k >= 2** for a true star (otherwise degenerate)
- **k < n/2** (since {n/k} = {n/(n-k)} traversed in reverse)

### Symmetry Group

The symmetry group of {n/k} is the **dihedral group D_n**, of order 2n, independent of k.

### Mathematical Construction

The unit circle is parameterized as:
```
gamma(t) = (cos(2*pi*t/n), sin(2*pi*t/n))
```

For integers 0 <= i < n, line segments sigma_i connect gamma(i) to gamma(i+k).

### Extended Notation: {n/k}s

Drawing only the first **s** subsegments at either end of each line segment. Intersections between segments divide them into parts, and s controls how far from each vertex the lines extend. This is critical for creating the "strapwork" effect in Islamic patterns.

### Non-Integer k (Fractional Stars)

When k is non-integer, point P is computed as the intersection of line segments gamma(i)*gamma(i+k) and gamma(i+floor(k)-k)*gamma(i+floor(k)). This allows continuous variation of star shape.

### Common Islamic Star Polygons

| Star | Points | Step | Interior point angle | Used in |
|------|--------|------|---------------------|---------|
| {5/2} | 5 | 2 | 36deg | Pentagram; Persian 5-fold |
| {6/2} | 6 | 2 | 60deg | Star of David; hexagonal tilings |
| {8/2} | 8 | 2 | 90deg | Simple octagram |
| {8/3} | 8 | 3 | 45deg | Classic Islamic 8-pointed star |
| {10/3} | 10 | 3 | 72deg | Persian 10-fold rosette (parallel petals) |
| {10/4} | 10 | 4 | 36deg | Persian 10-fold rosette (tapered petals) |
| {12/4} | 12 | 4 | 60deg | Dodecagonal patterns |
| {12/5} | 12 | 5 | 30deg | Complex 12-pointed star |

### Point Angle Formula

The interior angle at each point of a star polygon {n/k} is:
```
alpha = 180 * (n - 2k) / n  degrees
```

Or equivalently: `alpha = 180 - 360k/n` degrees.

For the isotoxal (outline-only) simple polygon |n/k|:
- Outer internal angle: `alpha = 180 * (1 - 2k/n)` degrees
- Inner external angle: `beta_ext = 180 * (1 - 2(k-1)/n)` degrees

---

## 3. Rosette Construction

### What Is a Rosette?

An n-fold rosette is a central {n/k} star surrounded by a ring of hexagonal "petals" that preserve the d_n symmetry. It is the fundamental motif of Islamic star-and-rosette patterns.

### Lee's Construction Method (Step by Step for n-fold Rosette)

1. **Divide master circle** into 2n equal parts
2. **Draw three concentric circles** at center O:
   - Circle [oa] — outer boundary (peripheral polygon)
   - Circle [ob] — inner star polygon boundary
   - Circle [oc] — petal proportion circle
3. **Locate points P** at inter-radii intersections on diagonal sides
4. **Connect P1 to P2** — this intersection with the outer circle defines point **a**, setting circle [oa]
5. **Draw circle [P1-a]** from peripheral polygon vertex — this is the "critical proportioning circle" — it intersects radius [oP1] at point **b**, defining circle [ob]
6. **Line b1-b5** (for parallel petals) or **b1-b4** (for tapered petals) determines:
   - The central star polygon type ({n/3} vs {n/4})
   - Petal width and orientation
7. **Point g** on the angle bisector of side [P1-Pn] completes the petal definition
8. **Line [a-g]** defines petal endpoints

### Key Properties of Rosette Petals

- Each hexagonal petal has 4 edges not adjacent to the central star
- All 4 of these edges are congruent
- The outermost edges lie on the regular n-gon
- The radial edges are parallel to each other
- Sliding point E along the bisector of angle OAB continuously varies the rosette shape while preserving edge congruence

### Rosette Order and Circle Packing

When rosettes tile in "closest packing," the order of a rosette equals **twice the degree** of its associated vertex in the underlying triangulation. Peripheral circles of adjacent rosettes create emergent star patterns (e.g., five 10-fold rosettes packed together naturally produce 5-pointed stars in the interstices).

---

## 4. Circle Packing Methods

### Traditional Approach

The underlying geometry consists of aligned rows and columns of mutually touching, equally sized circles, with a secondary grid offset by the circle's radius. This produces the framework for Islamic patterns.

### Modern Computational Approach (Kaplan & Lin)

1. **Input**: A triangulation defining the desired rosette adjacency structure
2. **Circle packing** (Collins-Stephenson algorithm): Iteratively adjust radii until tangency conditions are satisfied
   - For boundary vertex of degree n: initial radius r = (1 - sin(phi)) / sin(phi), where phi = pi/(2n-2)
   - The Discrete Uniformization Theorem guarantees a packing exists for any triangulation
3. **Cyclic polygon construction**: For each interior circle C with degree k:
   - Construct cyclic 2k-gon P with vertices at k tangency points + k arc midpoints (scaled inward by factor tau)
   - Default tau = 0.8
4. **Filler polygons**: Gaps between three mutually tangent circles filled with pentagonal tiles
5. **Star inscription** via wheel construction:
   - Inner circle radius: `r_inner = r_C * cos(pi / (2k))`
   - Scaling ratio alpha relates to contact angle theta

### Conversion Formulas: Contact Angle theta <-> Wheel Ratio alpha

For **consecutive** tangency points:
```
alpha = 1 - [sin(pi/n) * sin(theta)] / [sin(pi*(n+2)/(2n) - theta)]
```

For **alternating** tangency points:
```
alpha = 1 - [2*sin(pi/n) * sin(pi*(n-2)/(2n)) * sin(theta - pi/n)] / [sin(pi/2 + 2*pi/n - theta)]
```

---

## 5. The Polygons-in-Contact (PIC / Hankin) Method

### Procedure

1. **Subdivide the canvas** into edge-to-edge polygons (the "contact polygons")
2. **Select a global contact angle** theta in (0, pi/2) — typically theta = 2*pi/5 (72deg)
3. **At each polygon edge midpoint**, construct two rays rotated by +/-theta relative to the edge normal
4. **Truncate rays** where they intersect rays from neighboring edges
5. The resulting line segments form the star pattern

### Contact Angle Effects

- **Small theta** (close to 0): produces thin, elongated stars
- **theta = pi/n** for an n-gon: produces the "ideal" star for that polygon
- **Large theta** (close to pi/2): produces fat, blunt stars
- **theta = 2*pi/5** (72deg): inscribes a perfect pentacle in a regular pentagon — a common default

---

## 6. The 17 Wallpaper Groups in Islamic Art

### The 17 Groups (IUCr / Orbifold Notation)

| # | IUCr | Orbifold | Rotations | Reflections | Glide | Lattice |
|---|------|----------|-----------|-------------|-------|---------|
| 1 | p1 | o | none | none | none | oblique |
| 2 | p2 | 2222 | 180deg | none | none | oblique |
| 3 | pm | ** | none | yes | yes (implicit) | rectangular |
| 4 | pg | xx | none | none | yes | rectangular |
| 5 | cm | *x | none | yes | yes | rhombic |
| 6 | pmm | *2222 | 180deg | yes | yes | rectangular |
| 7 | pmg | 22* | 180deg | yes | yes | rectangular |
| 8 | pgg | 22x | 180deg | none | yes | rectangular |
| 9 | cmm | 2*22 | 180deg | yes | yes | rhombic |
| 10 | p4 | 442 | 90deg | none | none | square |
| 11 | p4m | *442 | 90deg | yes | yes | square |
| 12 | p4g | 4*2 | 90deg | yes | yes | square |
| 13 | p3 | 333 | 120deg | none | none | hexagonal |
| 14 | p3m1 | *333 | 120deg | yes | yes | hexagonal |
| 15 | p31m | 3*3 | 120deg | yes | yes | hexagonal |
| 16 | p6 | 632 | 60deg | none | none | hexagonal |
| 17 | p6m | *632 | 60deg | yes | yes | hexagonal |

### Why Only Orders 2, 3, 4, 6?

The **crystallographic restriction theorem**: in a 2D lattice with translational symmetry, only rotations of order 1, 2, 3, 4, or 6 are compatible. Proof sketch: a rotation R applied to a lattice point must map it to another lattice point. For the resulting displacement to also be a lattice vector, 2*cos(2*pi/n) must be an integer, constraining n to {1, 2, 3, 4, 6}.

### Why Exactly 17?

The orbifold Euler characteristic must equal zero for a planar wallpaper group. Each symmetry feature contributes a fractional value:
- Rotation of order n (before *): contributes (n-1)/n
- Rotation of order n (after *): contributes (n-1)/(2n)
- Mirror (*) or glide (x): contributes 1
- No symmetry (o): contributes 2

The feature values must sum to exactly 2. Enumerating all valid combinations yields exactly 17 solutions.

### The Alhambra Debate

**The claim**: The Alhambra palace in Granada, Spain contains examples of all 17 wallpaper groups in its tilework — often cited as evidence of medieval Islamic mathematicians' deep understanding of symmetry.

**The evidence**:
- **Edith Muller (1944 PhD thesis)**: identified **11** of 17 groups in the Alhambra
- **Later researchers**: claimed **13** groups
- **Some authors**: claim all 17 are present (widely repeated in popular mathematics)
- **Branko Grunbaum (2006)**: challenged the claim in "The Emperor's New Clothes," arguing only **13** are convincingly documented
- **Blanco & de Camargo**: presented evidence that all 17 can indeed be found, though some require generous interpretation

**Groups reliably absent or debated**: **pg** and **pgg** — both have low visual symmetry (no reflections, only glide reflections and 180deg rotations). They may have been avoided by Islamic artisans for aesthetic reasons, or examples may exist but be difficult to classify definitively.

**Broader Islamic art**: When all Islamic architectural sites are considered (not just the Alhambra), all 17 groups have been documented. The most commonly appearing groups in Islamic art are **p4m** (*442), **p6m** (*632), **cmm** (2*22), and **pmm** (*2222) — all high-symmetry groups with reflections.

### Mapping N-Fold Local Symmetry to Wallpaper Groups

- **4-fold star patterns** -> typically p4m (*442) or p4g (4*2)
- **6-fold star patterns** -> typically p6m (*632) or p6 (632)
- **8-fold star patterns** -> p4m (*442) — the 8-fold local star sits on a square lattice with 4-fold translational symmetry
- **10-fold star patterns** -> pmm (*2222) or cmm (2*22) — rectangular/rhombic lattice with 2-fold translational symmetry
- **12-fold star patterns** -> p6m (*632) — hexagonal lattice with 6-fold translational symmetry

---

## 7. Girih Tiles

Five specific tile shapes that can construct a vast range of Islamic patterns:

1. **Regular decagon** — 10 sides, all angles 144deg
2. **Elongated (irregular) hexagon** — "bowtie" shape, angles 72deg and 144deg
3. **Bowtie** (non-convex) — angles 72deg and 216deg
4. **Rhombus** — angles 72deg and 108deg
5. **Regular pentagon** — all angles 108deg

All edges are the same length. All angles are multiples of 36deg (= pi/5). The girih tiles anticipate Penrose tilings by ~500 years (Darb-i Imam shrine, Isfahan, 1453 CE shows a pattern that maps to Penrose rhombs).

---

## Sources

- Craig S. Kaplan, "Islamic Star Patterns in Absolute Geometry" (2004)
- Kaplan & Lin, "Freeform Islamic Geometric Patterns" (2023, arXiv:2301.01471)
- Anthony Lee, rosette construction methods (drawingislamicgeometricdesigns.com)
- Syed Jan Abas & Amer Shaker Salman, "Symmetries of Islamic Geometrical Patterns" (1995)
- Edith Muller, "Gruppentheoretische und Strukturanalytische Untersuchungen der Maurischen Ornamente aus der Alhambra in Granada" (1944)
- Branko Grunbaum, "The Emperor's New Clothes: Full Regalia, G-string, or Nothing?" (2006)
- Blanco & de Camargo, "Symmetry Groups in the Alhambra" (2011)
- John Baez, "This Week's Finds in Mathematical Physics" #267
- Brian Wichmann, "Symmetry in Islamic Geometric Art" (2020)
- artofislamicpattern.com educational resources
- geometrical.design (Mohamad Aljanabi)
- catnaps.org/islamic/geometry.html
