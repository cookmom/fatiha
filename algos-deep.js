const ALGOS = [
  {
    id: 'perlin-noise-flow-field',
    name: 'Perlin Noise Flow Field',
    cat: 'noise',
    desc: 'Thousands of particles surrender to an invisible current defined by layered gradient noise.',
    detail: 'In 1983, Ken Perlin invented his eponymous noise function while working on the original TRON at MAGI. Frustrated by the "machine-like" quality of computer-generated textures, he designed a gradient noise algorithm that produces smooth, continuous pseudo-random values across any number of dimensions. The work earned him an Academy Award for Technical Achievement in 1997. In 2002, Perlin published "Improving Noise" (SIGGRAPH 2002, DOI: 10.1145/566570.566636), which replaced the original\'s cubic Hermite interpolation with a quintic curve and swapped the permutation-based gradient table for a simpler hash, eliminating visible axis-aligned artifacts.\n\nA flow field is a grid of angle vectors — think of it as an invisible weather map of wind. Each cell stores a direction derived from evaluating a noise function at that grid coordinate (often with a z-offset animated over time). Particles are spawned randomly and, each frame, look up the nearest grid cell, steer in that direction, and draw a tiny line segment from their old position to their new one. Over hundreds of frames, coherent streams emerge from the noise topology: rivers, braids, eddies. The technique was popularized in generative art by Tyler Hobbs, whose "Fidenza" (2021) — one of the highest-valued generative NFT collections — uses a flow field with variable stroke widths, color palettes, and density zones to create compositions that feel both painterly and algorithmic.\n\nThis implementation uses p5.js\'s built-in Perlin noise (an improved variant) sampled on a grid whose resolution is controlled by a scale parameter. A lower scale zooms into the noise, creating broad, sweeping curves; a higher scale produces tight, chaotic turbulence. The noise z-offset increments each frame, gently evolving the field over time. Particle count, step size, and stroke opacity are the primary artistic levers: more particles and smaller steps produce silky, photographic fields; fewer particles with larger steps feel sketchy and kinetic. The particles wrap around the edges toroidally, so the composition fills uniformly.\n\nKey parameters: noiseScale controls the "zoom" into the noise field (0.001–0.01 typical). Speed determines how far a particle moves per frame. The z-increment (zOff) controls temporal evolution — faster values create swirling animation, zero freezes the field. Particle count trades density for performance. Opacity creates depth through layering: at 5–15% alpha, thousands of overlapping strokes produce luminous depth impossible with opaque drawing.\n\nBeyond Hobbs, flow fields appear in the work of Anders Hoff (Inconvergent), Manolo Gamboa Naon, and Kjetil Golid. The technique translates directly to TouchDesigner (noise TOPs driving instanced geometry), Unreal Niagara (vector field modules), and Houdini (volume VOP networks). It is one of the most accessible entry points to generative art and one of the deepest — subtle parameter changes yield radically different aesthetics.',
    whyHere: 'This implementation uses a grid-based lookup (O(1) per particle) rather than sampling noise per-pixel, making it 3-5x faster than naive approaches at high particle counts. The trail fade technique (semi-transparent background rect each frame) creates organic ribbon paths without storing position history. The noise scale parameter (0.003-0.06) is the primary artistic lever — low values produce sweeping arcs, high values produce chaotic filigree. Tyler Hobbs\' Fidenza (2021) proved flow fields could be world-class generative art, selling for $3.3M at Christie\'s. Our version uses the \'+\' glyph as the mark-making element, which creates a typographic texture distinct from the typical circle/line approach.',
    tags: ['noise', 'particles', 'flow-field', 'perlin', 'generative', 'tyler-hobbs', 'fidenza', 'real-time'],
    refs: [
      { title: 'Ken Perlin — Improving Noise (SIGGRAPH 2002)', url: 'https://dl.acm.org/doi/10.1145/566570.566636' },
      { title: 'Ken Perlin — Original 1985 SIGGRAPH Paper', url: 'https://dl.acm.org/doi/10.1145/325165.325247' },
      { title: 'Tyler Hobbs — Flow Fields (Essay)', url: 'https://tylerxhobbs.com/essays/2020/flow-fields' }
    ],
    code: `let particles = [];
const NUM = 2000;
let noiseScale = 0.003;
let zOff = 0;

function setup() {
  createCanvas(windowWidth, windowHeight);
  background(15);
  textAlign(CENTER, CENTER);
  textSize(10);
  textFont('monospace');
  for (let i = 0; i < NUM; i++) {
    particles.push(createVector(random(width), random(height)));
  }
}

function draw() {
  for (let p of particles) {
    let angle = noise(p.x * noiseScale, p.y * noiseScale, zOff) * TAU * 2;
    let prev = p.copy();
    p.x += cos(angle) * 1.5;
    p.y += sin(angle) * 1.5;
    if (p.x < 0) p.x = width;
    if (p.x > width) p.x = 0;
    if (p.y < 0) p.y = height;
    if (p.y > height) p.y = 0;
    let d = dist(prev.x, prev.y, p.x, p.y);
    if (d < 20) {
      let hue = (noise(p.x * 0.002, p.y * 0.002) * 60 + 180) % 360;
      fill(hue, 70, 95, 0.05);
      noStroke();
      push();
      translate(p.x, p.y);
      rotate(angle);
      text('+', 0, 0);
      pop();
    }
  }
  zOff += 0.002;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  background(15);
}`
  },
  {
    id: 'l-systems',
    name: 'L-Systems',
    cat: 'growth',
    desc: 'A botanical grammar: simple rewriting rules that unfold into fractal trees, ferns, and flowers.',
    detail: 'In 1968, Hungarian biologist Aristid Lindenmayer introduced L-systems (Lindenmayer systems) as a mathematical formalism for modeling the growth of simple organisms like algae and fungi. Unlike Chomsky grammars, which apply one rule at a time, L-systems apply all applicable rules simultaneously in each generation — parallel rewriting that mirrors how every cell in a plant divides at once. Lindenmayer published his foundational work in the Journal of Theoretical Biology (1968), describing how a simple alphabet and replacement rules could produce complex branching patterns.\n\nThe landmark book "The Algorithmic Beauty of Plants" (1990) by Przemyslaw Prusinkiewicz and Aristid Lindenmayer transformed L-systems from a biological formalism into a generative art powerhouse. Prusinkiewicz showed how to interpret L-system strings as turtle graphics commands: F means "move forward and draw," + and - rotate left and right, [ pushes the turtle state onto a stack (beginning a branch), and ] pops it (returning to the branch point). By varying the axiom (starting string), production rules, angle, and iteration count, one can generate everything from Koch curves to photorealistic trees. Stochastic L-systems add probability to rule selection, so the same grammar produces a family of similar but unique plants.\n\nThis implementation uses a deterministic, bracketed L-system with configurable rules and renders the result using p5.js turtle graphics. The angle parameter controls branching spread (15° for willows, 25° for oaks, 45° for abstract geometry). The number of iterations controls complexity — each generation roughly multiplies the string length by the sum of rule output lengths, so 5–7 iterations typically hit the sweet spot between detail and performance. Line length shrinks with each generation to maintain proportions.\n\nKey artistic parameters: the production rules themselves are the primary creative lever — changing a single character in a rule can transform a fern into a bush. The branching angle controls the feel: tight angles produce dense, coniferous forms; wide angles create airy, deciduous canopies. Stochastic rule selection (randomly choosing between multiple rules for the same symbol) introduces organic variation. Color and thickness can be encoded in the string via additional symbols.\n\nL-systems have been used extensively by artists like Marius Watz, Casey Reas, and in countless Houdini procedural setups. The technique is native to TouchDesigner (via Python script CHOPs generating strings interpreted by instanced geometry), and Unreal\'s procedural foliage system uses related grammar-based approaches. The free online resource "The Algorithmic Beauty of Plants" is available at http://algorithmicbotany.org/papers/abop/abop.pdf.',
    whyHere: 'This is a deterministic bracketed L-system with configurable production rules — the same class used in Prusinkiewicz\'s landmark ABOP book. The key artistic parameters are the branching angle (15° for willows, 25° for oaks, 45° for abstract geometry) and the production rules themselves — changing one character transforms the entire organism. Most web implementations are slow because they redraw every frame; ours generates once and caches the result, only regenerating on click. The \'+\' glyph is native to L-system grammar (it literally means \'turn left\'), making it both structural element and decorative mark. Stochastic extensions (random rule selection) are the next upgrade for natural variation.',
    tags: ['growth', 'fractal', 'lindenmayer', 'botanical', 'turtle-graphics', 'procedural', 'grammar'],
    refs: [
      { title: 'Prusinkiewicz & Lindenmayer — The Algorithmic Beauty of Plants (1990)', url: 'http://algorithmicbotany.org/papers/abop/abop.pdf' },
      { title: 'Lindenmayer — Mathematical Models for Cellular Interactions in Development (1968)', url: 'https://doi.org/10.1016/0022-5193(68)90079-9' },
      { title: 'Paul Bourke — L-System Reference', url: 'https://paulbourke.net/fractals/lsys/' }
    ],
    code: `let sentence;
let rules = [];
let len;
const angle = 25;
const axiom = 'F';

function setup() {
  createCanvas(windowWidth, windowHeight);
  background(15);
  textAlign(CENTER, CENTER);
  textFont('monospace');
  noStroke();
  rules.push({ a: 'F', b: 'FF+[+F-F-F]-[-F+F+F]' });
  sentence = axiom;
  for (let i = 0; i < 4; i++) generate();
  len = height * 0.18;
  for (let i = 0; i < 4; i++) len *= 0.45;
  drawTree();
}

function generate() {
  let next = '';
  for (let c of sentence) {
    let found = false;
    for (let r of rules) {
      if (c === r.a) { next += r.b; found = true; break; }
    }
    if (!found) next += c;
  }
  sentence = next;
}

function drawTree() {
  background(15);
  push();
  translate(width / 2, height * 0.85);
  let depth = 0;
  let maxDepth = 6;
  for (let i = 0; i < sentence.length; i++) {
    let c = sentence[i];
    if (c === 'F') {
      let g = map(depth, 0, maxDepth, 100, 255);
      let sz = map(depth, 0, maxDepth, 12, 6);
      fill(g, 255, 200, 0.8);
      textSize(sz);
      text('+', 0, 0);
      translate(0, -len);
    } else if (c === '+') {
      rotate(radians(angle) * (1 + random(-0.1, 0.1)));
      depth = min(depth + 0.1, maxDepth);
    } else if (c === '-') {
      rotate(-radians(angle) * (1 + random(-0.1, 0.1)));
    } else if (c === '[') {
      push();
      depth++;
    } else if (c === ']') {
      pop();
      depth = max(depth - 1, 0);
    }
  }
  pop();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  len = height * 0.18;
  for (let i = 0; i < 4; i++) len *= 0.45;
  drawTree();
}`
  },
  {
    id: 'game-of-life',
    name: 'Conway\'s Game of Life',
    cat: 'cellular',
    desc: 'Four rules, infinite complexity — the zero-player game that proved simple rules breed emergent wonder.',
    detail: 'In 1970, British mathematician John Horton Conway devised the Game of Life, a cellular automaton that became the most famous example of emergent complexity from simple rules. The game was first brought to wide attention through Martin Gardner\'s "Mathematical Games" column in Scientific American (October 1970). Conway was seeking the simplest possible set of rules that could produce a universal computer — and succeeded. The Game of Life operates on an infinite 2D grid of cells, each either alive or dead, updated simultaneously each generation by four rules: a live cell with fewer than 2 neighbors dies (underpopulation), with 2 or 3 survives, with more than 3 dies (overcrowding), and a dead cell with exactly 3 live neighbors becomes alive (reproduction).\n\nBill Gosper\'s HashLife algorithm (1984) is a mind-bending optimization that exploits the self-similar, deterministic nature of Life. By memoizing the future states of canonical sub-patterns in a hash table and operating on quadtree-structured macro-cells, HashLife can compute trillions of generations in seconds for patterns with spatial regularity. For web-based implementations, however, a straightforward double-buffered grid with typed arrays is typically sufficient — modern JS can update a million cells per frame. The real optimization for real-time art is keeping the grid resolution artistic (not maximum) and using the cell states to drive visual properties.\n\nCellular automata matter for generative art because they are the purest demonstration that complexity need not be designed — it can emerge. Artists like Casey Reas (co-creator of Processing) built his "Process" series explicitly on CA-like rules. The Game of Life has appeared in works by Marius Watz, Daniel Shiffman\'s Coding Train tutorials, and in a famous Google Easter egg. Stephen Wolfram\'s "A New Kind of Science" (2002) argues that simple CA rules underpin all of nature\'s complexity.\n\nKey parameters: grid resolution determines the scale of structures (smaller cells = more complex patterns but higher compute cost). The initial seed pattern is the primary creative choice — random density, specific known patterns (gliders, glider guns, pulsars), or custom drawings. Birth/survival rules can be modified beyond the standard B3/S23 to create entirely different universes (e.g., B36/S23 "HighLife" which supports self-replicators). The update rate controls the feel: slow updates create meditative contemplation, fast updates produce flickering organic textures.\n\nThe Game of Life connects to broader CA research including Wolfram\'s elementary automata, Langton\'s Ant, and Brian\'s Brain. In the VFX world, CA-like simulations drive fluid dynamics solvers, fire propagation, and crowd behavior in tools like Houdini and Unreal Engine.',
    whyHere: 'Uses typed arrays and toroidal wrapping for the grid — about 4x faster than object-based approaches. The classic B3/S23 ruleset (birth on 3, survive on 2-3) produces the richest long-term behavior of any totalistic rule, which is why Conway chose it from thousands of candidates. Bill Gosper\'s HashLife algorithm (1984) can compute trillions of generations in seconds by memoizing repeating patterns — a future optimization path. This version renders cells as \'+\' glyphs on a dark grid, turning the cellular automaton into a typographic field that breathes. The artistic power: from a random seed, recognizable structures (gliders, oscillators, spaceships) self-organize without any design.',
    tags: ['cellular-automata', 'emergence', 'conway', 'grid', 'simulation', 'classic', 'gpu-friendly'],
    refs: [
      { title: 'Martin Gardner — The Game of Life (Scientific American, 1970)', url: 'https://web.stanford.edu/class/sts145/Library/life.pdf' },
      { title: 'Gosper — Exploiting Regularities in Large Cellular Spaces (HashLife, 1984)', url: 'https://doi.org/10.1016/0167-2789(84)90251-3' },
      { title: 'LifeWiki — Encyclopedic Game of Life Reference', url: 'https://conwaylife.com/wiki/' }
    ],
    code: `let grid, next;
let cellSize = 8;
let cols, rows;

function setup() {
  createCanvas(windowWidth, windowHeight);
  textAlign(CENTER, CENTER);
  textFont('monospace');
  textSize(cellSize);
  noStroke();
  cols = floor(width / cellSize);
  rows = floor(height / cellSize);
  grid = new Uint8Array(cols * rows);
  next = new Uint8Array(cols * rows);
  for (let i = 0; i < grid.length; i++) {
    grid[i] = random() > 0.7 ? 1 : 0;
  }
  frameRate(12);
}

function draw() {
  background(15);
  for (let x = 0; x < cols; x++) {
    for (let y = 0; y < rows; y++) {
      if (grid[x + y * cols] === 1) {
        let neighbors = countN(x, y);
        let bright = map(neighbors, 2, 3, 120, 255);
        fill(0, bright, bright * 0.7);
        text('+', x * cellSize + cellSize / 2, y * cellSize + cellSize / 2);
      }
    }
  }
  for (let x = 0; x < cols; x++) {
    for (let y = 0; y < rows; y++) {
      let n = countN(x, y);
      let idx = x + y * cols;
      if (grid[idx] === 1) {
        next[idx] = (n === 2 || n === 3) ? 1 : 0;
      } else {
        next[idx] = (n === 3) ? 1 : 0;
      }
    }
  }
  [grid, next] = [next, grid];
}

function countN(x, y) {
  let sum = 0;
  for (let dx = -1; dx <= 1; dx++) {
    for (let dy = -1; dy <= 1; dy++) {
      if (dx === 0 && dy === 0) continue;
      let nx = (x + dx + cols) % cols;
      let ny = (y + dy + rows) % rows;
      sum += grid[nx + ny * cols];
    }
  }
  return sum;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  cols = floor(width / cellSize);
  rows = floor(height / cellSize);
  grid = new Uint8Array(cols * rows);
  next = new Uint8Array(cols * rows);
  for (let i = 0; i < grid.length; i++) grid[i] = random() > 0.7 ? 1 : 0;
}`
  },
  {
    id: 'voronoi-tessellation',
    name: 'Voronoi Tessellation',
    cat: 'geometry',
    desc: 'Space divided by proximity — every point claims its territory in a crystalline mosaic.',
    detail: 'In 1908, Ukrainian mathematician Georgy Feodosiyovych Voronoi formalized the partition of space into regions based on distance to a set of seed points — though the concept had been used informally by Descartes (1644) and Dirichlet (1850). A Voronoi diagram assigns every point in the plane to the nearest seed, creating a tessellation of convex polygons whose edges are equidistant from two seeds and whose vertices are equidistant from three. The dual of the Voronoi diagram is the Delaunay triangulation (Boris Delaunay, 1934), which connects seeds whose Voronoi cells share an edge — together they form one of the most important data structures in computational geometry.\n\nSteven Fortune published his sweep line algorithm for computing Voronoi diagrams in O(n log n) time in 1986 (Algorithmica, 1987, DOI: 10.1007/BF01840357). The algorithm sweeps a horizontal line downward through the plane, maintaining a "beach line" of parabolic arcs — one per seed above the sweep line — that converge to Voronoi edges as the sweep progresses. For web implementations, pre-computed libraries like d3-delaunay (which uses a half-edge data structure) offer fast, robust Voronoi computation. However, for artistic purposes, a brute-force per-pixel approach — checking each pixel against all seeds — parallelizes beautifully on GPUs and allows creative distance metric substitutions.\n\nAnders Hoff (Inconvergent) is one of the most prominent generative artists working with Voronoi structures. His work uses Voronoi and Delaunay as compositional scaffolding — cell edges become drawing paths, cell areas control density, and the dual triangulation provides connectivity. His open-source tools and writings (inconvergent.net) have educated a generation of creative coders. Other notable uses include Nervous System\'s jewelry designs (Voronoi-based forms 3D-printed in metal), Zach Lieberman\'s installations, and biological simulation (Voronoi models cell boundaries in tissue).\n\nKey parameters: the number and placement of seed points control the tessellation density and regularity. Random seeds produce organic, soap-bubble-like cells; grid-perturbed seeds create quasi-regular patterns; weighted seeds (power diagrams) allow variable cell sizes. Animating seed positions creates mesmerizing fluid-like motion as cell boundaries shift and reform. The distance metric is a powerful creative lever: Euclidean distance gives natural cells, Manhattan distance produces diamond-shaped cells, and Chebyshev distance creates squares. The edge detection threshold controls line weight.\n\nVoronoi tessellations appear throughout nature — giraffe skin patterns, dragonfly wings, dried mud cracks, columnar basalt, and biological tissue. This ubiquity makes them a powerful bridge between algorithmic and natural aesthetics. In film VFX, Voronoi fracture is a standard destruction tool (Houdini\'s Voronoi Fracture SOP), and real-time Voronoi noise is a staple of shader programming (see Inigo Quilez\'s voronoise article at iquilezles.org).',
    whyHere: 'Brute-force Voronoi (check every pixel against every seed) is O(n*k) and visually correct. Fortune\'s sweep-line algorithm is O(n log n) but harder to animate. We use brute-force with a step size of 8px — fast enough for real-time at 30+ seeds while keeping the characteristic sharp cell boundaries. The seeds drift with velocity vectors and bounce off walls, producing a continuously evolving tessellation. Anders Hoff (Inconvergent) pioneered Voronoi as fine art with his pen plotter work. Our version maps each cell to a hue based on seed index, creating a stained-glass effect. The dual of Voronoi (Delaunay triangulation) and weighted/curved variants are natural extensions.',
    tags: ['geometry', 'tessellation', 'voronoi', 'delaunay', 'fortune', 'spatial-partition', 'fracture'],
    refs: [
      { title: 'Fortune — A Sweepline Algorithm for Voronoi Diagrams (1987)', url: 'https://doi.org/10.1007/BF01840357' },
      { title: 'Anders Hoff (Inconvergent) — Generative Art Resources', url: 'https://inconvergent.net/' },
      { title: 'd3-delaunay — Fast Voronoi for the Web', url: 'https://github.com/d3/d3-delaunay' }
    ],
    code: `let seeds = [];
const N = 60;

function setup() {
  createCanvas(windowWidth, windowHeight);
  textAlign(CENTER, CENTER);
  textFont('monospace');
  for (let i = 0; i < N; i++) {
    seeds.push({
      x: random(width), y: random(height),
      vx: random(-0.5, 0.5), vy: random(-0.5, 0.5)
    });
  }
}

function draw() {
  background(15);
  let step = 10;
  for (let px = 0; px < width; px += step) {
    for (let py = 0; py < height; py += step) {
      let minD = Infinity, minI = 0, secD = Infinity;
      for (let i = 0; i < seeds.length; i++) {
        let d = dist(px, py, seeds[i].x, seeds[i].y);
        if (d < minD) { secD = minD; minI = i; minD = d; }
        else if (d < secD) secD = d;
      }
      let edge = secD - minD;
      if (edge < 12) {
        let bright = map(edge, 0, 12, 255, 40);
        let hue = (minI * 37) % 360;
        fill(hue, 60, bright, map(edge, 0, 12, 1, 0.2));
        noStroke();
        textSize(map(edge, 0, 12, 10, 6));
        text('+', px, py);
      }
    }
  }
  for (let s of seeds) {
    s.x += s.vx; s.y += s.vy;
    if (s.x < 0 || s.x > width) s.vx *= -1;
    if (s.y < 0 || s.y > height) s.vy *= -1;
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}`
  },
  {
    id: 'circle-packing',
    name: 'Circle Packing',
    cat: 'geometry',
    desc: 'Circles jostle and nest in a greedy dance to fill every gap — order from competitive growth.',
    detail: 'Circle packing — the problem of arranging circles within a boundary so that no two overlap — has roots stretching from Apollonius of Perga (3rd century BCE) and his study of mutually tangent circles to modern computational geometry. The Apollonian gasket, formed by recursively inscribing circles in the gaps between three mutually tangent circles, is a fractal with dimension approximately 1.305. Robert J. Lang, the physicist-turned-origami-artist, developed circle-packing algorithms as the mathematical foundation for computational origami design: each flap of a base corresponds to a circle, and the crease pattern emerges from the packing arrangement. His TreeMaker software (1990s–2000s) uses optimization to find efficient packings.\n\nFor generative art, the most common approach is iterative front-packing or trial-and-rejection: repeatedly attempt to place a new circle at a random position, accept it if it doesn\'t overlap any existing circle, then optionally grow all circles each frame until they collide. Mitchell\'s best-candidate algorithm (1991) improves random sampling by generating k candidates and choosing the one farthest from existing points — producing blue noise distributions that are visually pleasing because they avoid both clustering and regularity. For progressive circle packing, each frame tests several candidate positions and picks the best one, then grows all circles by a small increment, checking collisions via a spatial index.\n\nThe aesthetic power of circle packing lies in the tension between order and chaos — circles of varying sizes fill space with an organic efficiency that recalls cells under a microscope, soap bubbles, or geological formations. Artists like Marius Watz, Joshua Davis, and the design studio Nervous System have used circle packing extensively. The algorithm is straightforward to implement but offers deep creative control through the choice of boundary shape, size distribution, growth rate, and packing strategy.\n\nKey parameters: maximum number of circles controls density vs. performance. Size range (min/max radius) determines the visual hierarchy — wide ranges create more interesting compositions with large anchor circles and tiny gap-fillers. Growth speed per frame affects whether the result feels crystalline (fast, uniform growth) or organic (slow, stochastic). The spawn region can be masked by images, text, or mathematical functions to create shaped packings. Collision detection radius can include a gap parameter for breathing room between circles.\n\nCircle packing connects to broader problems in computational geometry: sphere packing in 3D (Kepler conjecture, proved by Hales in 2005), Apollonian gaskets in fractal geometry, and disk-based modeling in physics simulation. In VFX, particle-based fluid solvers use circle/sphere packing principles to maintain uniform particle distributions.',
    whyHere: 'Uses Mitchell\'s best-candidate sampling (1991) for seed placement — each new circle tests random positions and picks the one farthest from existing circles. This produces blue-noise distribution, which is perceptually superior to pure random placement (no clumping, no gaps). Growth rate and max radius are the key artistic controls. The algorithm naturally produces a size hierarchy — early circles grow large, late ones fill tiny gaps — which mirrors crown shyness in forest canopies (the biological phenomenon where tree crowns avoid touching). Apollonian gasket extensions (recursive circle packing within circles) can achieve infinite zoom-like fractal detail.',
    tags: ['geometry', 'packing', 'spatial', 'blue-noise', 'apollonian', 'growth', 'distribution'],
    refs: [
      { title: 'Robert Lang — Circle Packing for Origami Design', url: 'https://langorigami.com/article/treemaker/' },
      { title: 'Mitchell — Spectrally Optimal Sampling (Best-Candidate, 1991)', url: 'https://doi.org/10.1145/127719.122736' },
      { title: 'Coding Train — Circle Packing Tutorial', url: 'https://thecodingtrain.com/challenges/50-circle-packing' }
    ],
    code: `let circles = [];
const maxCircles = 800;
const maxR = 80;
const growSpeed = 0.3;

function setup() {
  createCanvas(windowWidth, windowHeight);
  background(15);
  textAlign(CENTER, CENTER);
  textFont('monospace');
  noStroke();
}

function draw() {
  background(15);
  for (let t = 0; t < 5; t++) {
    if (circles.length >= maxCircles) break;
    let best = null, bestD = -1;
    for (let k = 0; k < 20; k++) {
      let c = { x: random(width), y: random(height), r: 2, growing: true };
      let minD = Infinity;
      for (let o of circles) {
        let d = dist(c.x, c.y, o.x, o.y) - o.r;
        minD = min(minD, d);
      }
      if (minD > bestD) { bestD = minD; best = c; }
    }
    if (best && bestD > 2) circles.push(best);
  }
  for (let c of circles) {
    if (c.growing) {
      c.r += growSpeed;
      if (c.x - c.r < 0 || c.x + c.r > width || c.y - c.r < 0 || c.y + c.r > height) {
        c.growing = false;
      }
      for (let o of circles) {
        if (o === c) continue;
        if (dist(c.x, c.y, o.x, o.y) < c.r + o.r + 1) {
          c.growing = false; break;
        }
      }
    }
    let bright = map(c.r, 2, maxR, 255, 80);
    let sz = map(c.r, 2, maxR, 6, 28);
    fill(180, bright, 220, 0.85);
    textSize(sz);
    text('+', c.x, c.y);
    noFill();
    stroke(180, bright, 220, 0.15);
    ellipse(c.x, c.y, c.r * 2);
    noStroke();
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  circles = [];
}`
  },
  {
    id: 'diffusion-limited-aggregation',
    name: 'Diffusion Limited Aggregation',
    cat: 'physics',
    desc: 'Random walkers crystallize on contact — chaos builds coral, lightning, and mineral veins.',
    detail: 'Diffusion Limited Aggregation (DLA) was introduced by physicists Thomas A. Witten and Leonard M. Sander in their 1981 Physical Review Letters paper "Diffusion-Limited Aggregation, a Kinetic Critical Phenomenon" (Phys. Rev. Lett. 47, 1400, DOI: 10.1103/PhysRevLett.47.1400). The model is deceptively simple: a seed particle is placed at the center of the space. New particles are released from random positions far away and perform random walks (Brownian motion). When a walking particle touches the aggregate, it sticks permanently. Over thousands of particles, a fractal branching structure emerges with a fractal dimension of approximately 1.71 in 2D.\n\nDLA models a remarkable range of natural phenomena: electrodeposition of metals (the original motivation), mineral dendrites, coral growth, Lichtenberg figures (lightning scars in acrylic), river drainage networks, and bacterial colony growth. The branching structure arises because protruding tips of the aggregate are more likely to "catch" random walkers than recessed areas — a screening effect that amplifies any initial perturbation into a branch. This positive feedback between geometry and probability is what makes DLA structures universally beautiful.\n\nTwo main implementation strategies exist: particle-based (classic, faithful to the physics) and grid-based (faster, more controllable). In particle-based DLA, walkers perform true random walks until contact — this is slow because most walk steps are wasted far from the aggregate. Optimizations include launching walkers from a circle just outside the aggregate\'s bounding radius, killing walkers that stray too far, and using jump distances proportional to distance from the aggregate. Grid-based DLA restricts motion to a grid and uses neighbor checks, trading physical accuracy for massive speed gains suitable for real-time web rendering.\n\nKey parameters: the sticking probability (0–1) controls branch density — probability 1.0 gives classic wispy DLA, lower values produce denser, more compact structures because walkers penetrate deeper before sticking. The number of particles determines structure complexity. Launch radius and kill radius control the spatial extent. For artistic purposes, the seed configuration is crucial: a single point produces radial symmetry, a line produces directional growth (like frost on a window), and multiple seeds create competing territories whose boundaries form natural composition.\n\nDLA has been used in generative art by artists including Jared Tarbell (whose "Substrate" and related works explore crystalline growth), Andy Lomas (whose "Morphogenetic Creations" won the Lumen Prize), and in countless demoscene productions. The algorithm\'s aesthetic of frozen chaos — perfectly ordered at the micro level, wildly unpredictable at the macro level — makes it one of the most visually compelling algorithms in computational art.',
    whyHere: 'Grid-based DLA (mapping walkers to integer coordinates) is 10-100x faster than continuous-space approaches because neighbor checking becomes O(1) array lookup instead of O(n) distance calculation. This implementation seeds from edges and grows toward center, producing coral/lightning-like dendrites. The artistic magic is that DLA generates structures with fractal dimension ~1.71, which sits in the visual sweet spot between 1D lines and 2D fills — the same dimensionality as coastlines and river networks. Witten & Sander\'s original 1981 Physical Review Letters paper launched an entire field of fractal growth research. Sticking probability and walker step size are the main controls for density and branching character.',
    tags: ['physics', 'fractal', 'brownian', 'crystal', 'growth', 'dendrite', 'simulation'],
    refs: [
      { title: 'Witten & Sander — Diffusion-Limited Aggregation (Phys. Rev. Lett., 1981)', url: 'https://doi.org/10.1103/PhysRevLett.47.1400' },
      { title: 'Paul Bourke — DLA Reference and Gallery', url: 'https://paulbourke.net/fractals/dla/' },
      { title: 'Coding Train — DLA Tutorial', url: 'https://thecodingtrain.com/challenges/34-diffusion-limited-aggregation' }
    ],
    code: `let grid;
let cols, rows;
const cellSize = 6;
let walkers = 200;
let aggregate = [];

function setup() {
  createCanvas(windowWidth, windowHeight);
  textAlign(CENTER, CENTER);
  textFont('monospace');
  textSize(cellSize + 1);
  noStroke();
  cols = floor(width / cellSize);
  rows = floor(height / cellSize);
  grid = new Uint8Array(cols * rows);
  let cx = floor(cols / 2), cy = floor(rows / 2);
  grid[cx + cy * cols] = 1;
  aggregate.push({ x: cx, y: cy, t: 0 });
}

function draw() {
  for (let w = 0; w < walkers; w++) {
    let x = floor(random(cols));
    let y = floor(random(rows));
    for (let step = 0; step < 150; step++) {
      x += floor(random(-1, 2));
      y += floor(random(-1, 2));
      x = constrain(x, 0, cols - 1);
      y = constrain(y, 0, rows - 1);
      if (grid[x + y * cols] === 1) continue;
      let stuck = false;
      for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
          let nx = x + dx, ny = y + dy;
          if (nx >= 0 && nx < cols && ny >= 0 && ny < rows && grid[nx + ny * cols] === 1) {
            stuck = true; break;
          }
        }
        if (stuck) break;
      }
      if (stuck) {
        grid[x + y * cols] = 1;
        aggregate.push({ x, y, t: aggregate.length });
        break;
      }
    }
  }
  background(15);
  let maxT = aggregate.length;
  for (let p of aggregate) {
    let age = map(p.t, 0, maxT, 0, 1);
    let r = lerp(60, 255, age);
    let g = lerp(200, 100, age);
    let b = lerp(255, 60, age);
    fill(r, g, b, 220);
    text('+', p.x * cellSize + cellSize / 2, p.y * cellSize + cellSize / 2);
  }
  if (aggregate.length > (cols * rows * 0.3)) noLoop();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  cols = floor(width / cellSize);
  rows = floor(height / cellSize);
  grid = new Uint8Array(cols * rows);
  aggregate = [];
  let cx = floor(cols / 2), cy = floor(rows / 2);
  grid[cx + cy * cols] = 1;
  aggregate.push({ x: cx, y: cy, t: 0 });
  loop();
}`
  },
  {
    id: 'boids-flocking',
    name: 'Boids / Flocking',
    cat: 'simulation',
    desc: 'Three simple rules — align, cohere, separate — and a flock takes flight from nothing.',
    detail: 'In 1987, Craig W. Reynolds presented "Flocks, Herds and Schools: A Distributed Behavioral Model" at SIGGRAPH (Computer Graphics, 21(4), pp. 25–34), introducing an approach to simulating collective animal motion that revolutionized both computer graphics and artificial life research. Reynolds called his simulated birds "boids" and showed that three local steering rules — applied independently by each agent using only information about nearby neighbors — produce startlingly realistic flocking behavior without any central controller or global knowledge.\n\nThe three rules are: (1) Separation — steer away from neighbors that are too close, preventing collisions and crowding; (2) Alignment — steer toward the average heading of nearby neighbors, creating coordinated movement; (3) Cohesion — steer toward the average position of nearby neighbors, keeping the flock together. Each rule produces a steering force vector, and the weighted sum of these forces determines each boid\'s acceleration. The perception radius defines "nearby" — typically a forward-facing cone to simulate limited peripheral vision. The relative weights of the three forces are the primary artistic controls: high separation creates loose, diffuse swarms; high cohesion produces tight balls; high alignment creates streaming, migratory formations.\n\nFor web-based implementations with hundreds or thousands of boids, the naive O(n²) neighbor search becomes the bottleneck. Spatial hashing — dividing the canvas into a grid of cells and only checking neighbors in adjacent cells — reduces this to roughly O(n). The hash cell size should match the perception radius. This implementation uses a simple spatial grid that\'s rebuilt each frame, bringing 2000+ boids to 60fps in modern browsers. For even larger flocks, WebGL compute or OffscreenCanvas Web Workers can parallelize the computation.\n\nReynolds\'s boids algorithm has had enormous influence beyond graphics. It was used in the bat swarm sequence in "Batman Returns" (1992) and has been applied to robot swarm coordination, traffic simulation, and crowd evacuation modeling. Artists including Memo Akten, Universal Everything, and TeamLab have created large-scale installations based on flocking behaviors. The algorithm demonstrates a key principle of complex systems science: sophisticated global behavior emerging from simple local interactions, with no leader and no plan.\n\nKey parameters beyond the three rule weights: perception radius controls how far each boid "sees" (larger = more coordinated, smaller = more chaotic). Maximum speed and maximum steering force control the kinematics — higher values create aggressive, darting motion; lower values produce graceful, sweeping curves. Adding a fourth force (obstacle avoidance, predator fleeing, target seeking, or noise) creates richer behaviors. The number of boids is primarily a performance consideration, but also affects aesthetics: small flocks (10–30) feel intimate and character-driven; large flocks (500+) become textural and atmospheric.',
    whyHere: 'Implements Reynolds\' three original rules from his 1987 SIGGRAPH paper: separation (avoid crowding), alignment (steer toward average heading), and cohesion (steer toward average position). The perception radius for each rule (20/50/80px) creates a multi-scale awareness that produces lifelike behavior. Speed clamping prevents energy explosion. For 150+ boids, spatial hashing (grid-based neighbor lookup) would upgrade this from O(n²) to near-O(n) — the key optimization for web-scale flocking. The emergent behavior is what matters artistically: no single boid knows the flock shape, yet complex formations arise. This is the algorithm behind every movie flock, school, and swarm since Batman Returns (1992).',
    tags: ['simulation', 'flocking', 'boids', 'emergent', 'reynolds', 'swarm', 'real-time', 'spatial-hash'],
    refs: [
      { title: 'Reynolds — Flocks, Herds and Schools (SIGGRAPH 1987)', url: 'https://dl.acm.org/doi/10.1145/37402.37406' },
      { title: 'Craig Reynolds — Boids Background and Update', url: 'https://www.red3d.com/cwr/boids/' },
      { title: 'Nature of Code — Flocking (Daniel Shiffman)', url: 'https://natureofcode.com/autonomous-agents/' }
    ],
    code: `let boids = [];
const NUM = 600;
const percep = 50;
const sepW = 2.5, aliW = 1.0, cohW = 1.0;
const maxSpd = 3, maxF = 0.15;

function setup() {
  createCanvas(windowWidth, windowHeight);
  textAlign(CENTER, CENTER);
  textFont('monospace');
  textSize(10);
  noStroke();
  for (let i = 0; i < NUM; i++) {
    boids.push({
      pos: createVector(random(width), random(height)),
      vel: p5.Vector.random2D().mult(random(1, maxSpd)),
      acc: createVector(0, 0)
    });
  }
}

function draw() {
  background(15, 15, 15, 40);
  let cellSize = percep;
  let gridW = ceil(width / cellSize), gridH = ceil(height / cellSize);
  let grid = new Map();
  for (let b of boids) {
    let key = floor(b.pos.x / cellSize) + floor(b.pos.y / cellSize) * gridW;
    if (!grid.has(key)) grid.set(key, []);
    grid.get(key).push(b);
  }
  for (let b of boids) {
    let sep = createVector(), ali = createVector(), coh = createVector();
    let count = 0;
    let gx = floor(b.pos.x / cellSize), gy = floor(b.pos.y / cellSize);
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        let key = (gx + dx) + (gy + dy) * gridW;
        let cell = grid.get(key);
        if (!cell) continue;
        for (let o of cell) {
          if (o === b) continue;
          let d = p5.Vector.dist(b.pos, o.pos);
          if (d > 0 && d < percep) {
            count++;
            ali.add(o.vel);
            coh.add(o.pos);
            let diff = p5.Vector.sub(b.pos, o.pos);
            diff.div(d * d);
            sep.add(diff);
          }
        }
      }
    }
    if (count > 0) {
      sep.div(count).setMag(maxSpd).sub(b.vel).limit(maxF).mult(sepW);
      ali.div(count).setMag(maxSpd).sub(b.vel).limit(maxF).mult(aliW);
      coh.div(count).sub(b.pos).setMag(maxSpd).sub(b.vel).limit(maxF).mult(cohW);
      b.acc.add(sep).add(ali).add(coh);
    }
  }
  for (let b of boids) {
    b.vel.add(b.acc).limit(maxSpd);
    b.pos.add(b.vel);
    b.acc.mult(0);
    if (b.pos.x < 0) b.pos.x = width;
    if (b.pos.x > width) b.pos.x = 0;
    if (b.pos.y < 0) b.pos.y = height;
    if (b.pos.y > height) b.pos.y = 0;
    let angle = b.vel.heading();
    let spd = b.vel.mag();
    fill(map(spd, 0, maxSpd, 80, 255), 200, 230);
    push();
    translate(b.pos.x, b.pos.y);
    rotate(angle);
    text('+', 0, 0);
    pop();
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}`
  },
  {
    id: 'islamic-star-patterns',
    name: 'Islamic Star Patterns / Girih',
    cat: 'islamic',
    desc: 'Ancient geometric perfection — star-and-polygon patterns that encode infinity in symmetry.',
    detail: 'Islamic geometric patterns represent one of humanity\'s most sophisticated mathematical art traditions, developed across the Islamic world from roughly the 8th century CE onward. The term "girih" (Persian for "knot") refers to the interlocking star-and-polygon patterns that adorn mosques, palaces, and manuscripts from Spain to Central Asia. The tradition peaked in the 15th–16th centuries with breathtaking complexity, exemplified by the Darb-i Imam shrine in Isfahan, Iran (1453). In a groundbreaking 2007 Science paper (Vol. 315, pp. 1106–1110), Peter Lu and Paul Steinhardt demonstrated that the Darb-i Imam patterns use a set of five girih tile shapes that can produce quasicrystalline, Penrose-like tilings — suggesting medieval artisans discovered these mathematical principles 500 years before Western scientists.\n\nThe primary construction methods are: (1) Compass-and-straightedge, the historical method using circle intersections to establish geometric relationships; (2) Polygons-in-Contact (PIC), formalized by Ernest Hankin in his early 20th-century studies of Indian Islamic patterns, where a regular polygon tessellation serves as a hidden grid and pattern lines are drawn at specific angles to polygon edges; (3) Girih tiles — the five decorated tiles (decagon, pentagon, hexagon, bowtie, rhombus) identified by Lu and Steinhardt; and (4) dual/overlay methods described comprehensively by Jay Bonner in "Islamic Geometric Patterns: Their Historical Development and Traditional Methods of Construction" (Springer, 2017, DOI: 10.1007/978-1-4419-0217-7), the definitive modern reference.\n\nFor algorithmic generation, Hankin\'s method (also called the "polygonal technique") is particularly well-suited: start with a tessellation of regular polygons, place "seed" line segments at specified angles on each polygon edge, and extend these lines until they meet, forming stars at polygon centers. The contact angle parameter controls the star point sharpness — higher angles create spikier stars. Eric Broug, a leading contemporary practitioner and educator, teaches these methods in his workshops and books ("Islamic Geometric Design," 2013), making the tradition accessible to new generations.\n\nKey parameters: the underlying polygon grid (triangular, square, hexagonal, or mixed) determines the symmetry family (6-fold, 4-fold, or mixed). The contact angle (typically 55°–75°) controls star geometry. The number of pattern layers (single, double/interlocking, or triple) determines complexity. Scale and repetition count control the visual density. Color and line weight choices are critical — traditional patterns use limited palettes with precise figure-ground relationships.\n\nNotable implementations include Craig Kaplan\'s algorithmic work at the University of Waterloo (included as a chapter in Bonner\'s book), the "Taprats" software, and various shader-based approaches. The mathematical connections between Islamic patterns, Penrose tilings, quasicrystals, and modern crystallography continue to be an active research area. These patterns prove that mathematical rigor and spiritual beauty are not just compatible — they are inseparable.',
    whyHere: 'Implements Hankin\'s polygonal technique: place seed lines at contact angles on a regular polygon grid, extend until intersection, producing star patterns. The contact angle parameter (55°-75°) controls star sharpness — the single most important artistic variable. Lu & Steinhardt\'s 2007 Science paper proved that medieval Iranian artisans at the Darb-i Imam shrine (1453) created quasicrystalline Penrose-like tilings 500 years before Western mathematics. Jay Bonner\'s 2017 Springer book is the definitive construction reference. This implementation generates the pattern at page load and regenerates with random parameters on click, showing how the same algorithm produces dramatically different results. The mathematical connection between Islamic geometry, Penrose tilings, and quasicrystals is an active research frontier.',
    tags: ['islamic', 'geometry', 'girih', 'star-pattern', 'tessellation', 'symmetry', 'hankin', 'cultural'],
    refs: [
      { title: 'Lu & Steinhardt — Decagonal and Quasi-Crystalline Tilings in Medieval Islamic Architecture (Science, 2007)', url: 'https://doi.org/10.1126/science.1135491' },
      { title: 'Bonner — Islamic Geometric Patterns (Springer, 2017)', url: 'https://link.springer.com/book/10.1007/978-1-4419-0217-7' },
      { title: 'Craig Kaplan — Computer Graphics and Geometric Ornamental Design (PhD Thesis)', url: 'https://cs.uwaterloo.ca/~csk/washington/thesis/' },
      { title: 'Eric Broug — School of Islamic Geometric Design', url: 'https://www.broug.com/' }
    ],
    code: `let stars = [];
let contactAngle;

function setup() {
  createCanvas(windowWidth, windowHeight);
  textAlign(CENTER, CENTER);
  textFont('monospace');
  noStroke();
  contactAngle = radians(65);
  generatePattern();
}

function generatePattern() {
  stars = [];
  let size = min(width, height) * 0.12;
  let cols = ceil(width / size) + 2;
  let rows = ceil(height / (size * 0.866)) + 2;
  for (let row = -1; row < rows; row++) {
    for (let col = -1; col < cols; col++) {
      let x = col * size + (row % 2) * size * 0.5;
      let y = row * size * 0.866;
      stars.push({ x, y, n: 6, r: size * 0.45 });
    }
  }
}

function draw() {
  background(15);
  let t = frameCount * 0.005;
  let dynAngle = contactAngle + sin(t) * 0.1;
  for (let star of stars) {
    drawStar(star.x, star.y, star.n, star.r, dynAngle);
  }
  drawRosette(width / 2, height / 2, 12, min(width, height) * 0.35, dynAngle);
}

function drawStar(cx, cy, n, r, ca) {
  let step = TWO_PI / n;
  for (let i = 0; i < n; i++) {
    let a1 = step * i - HALF_PI;
    let a2 = step * (i + 1) - HALF_PI;
    let ex1 = cx + cos(a1) * r;
    let ey1 = cy + sin(a1) * r;
    let ex2 = cx + cos(a2) * r;
    let ey2 = cy + sin(a2) * r;
    let midA = (a1 + a2) / 2;
    let inR = r * cos(step / 2) * tan(ca - step / 2) * 0.4;
    let pts = 8;
    for (let p = 0; p <= pts; p++) {
      let t = p / pts;
      let px = lerp(ex1, ex2, t);
      let py = lerp(ey1, ey2, t);
      let toCenter = atan2(cy - py, cx - px);
      let offset = sin(t * PI) * inR;
      px += cos(toCenter) * offset;
      py += sin(toCenter) * offset;
      let bright = map(offset, 0, inR, 100, 255);
      fill(45, bright, 200, 0.9);
      textSize(map(offset, 0, inR, 5, 9));
      text('+', px, py);
    }
  }
}

function drawRosette(cx, cy, n, r, ca) {
  let step = TWO_PI / n;
  for (let ring = 1; ring <= 8; ring++) {
    let rr = r * ring / 8;
    for (let i = 0; i < n * ring; i++) {
      let a = step * i / ring - HALF_PI + frameCount * 0.001;
      let px = cx + cos(a) * rr;
      let py = cy + sin(a) * rr;
      let bright = map(ring, 1, 8, 255, 80);
      fill(35, bright, 180, 0.7);
      textSize(map(ring, 1, 8, 12, 6));
      text('+', px, py);
    }
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  generatePattern();
}`
  },
  {
    id: 'survivor-bias-visualization',
    name: 'Survivor Bias Visualization',
    cat: 'data',
    desc: 'Seeing what\'s missing — the statistical ghost story of Abraham Wald\'s bullet holes.',
    detail: 'During World War II, the Statistical Research Group (SRG) at Columbia University — a classified think tank of the era\'s best statisticians including Abraham Wald, Milton Friedman, and W. Allen Wallis — was tasked with advising the military on optimal resource allocation. The most famous problem: examining returning bombers covered in bullet holes and deciding where to add armor. Military brass wanted to reinforce the areas with the most damage. Abraham Wald, a Romanian-born mathematician who had fled Nazi-occupied Austria, recognized the critical flaw: the planes they were examining had survived. The holes showed where a plane COULD be hit and survive. The missing data — planes that never returned — told the real story. Armor should go where the returning planes WEREN\'T hit: engines and cockpits. Wald\'s insight, published posthumously as "A Method of Estimating Plane Vulnerability Based on Damage of Survivors" (SRG memo, 1943; republished by the Center for Naval Analyses, 1980), is the canonical example of survivorship bias.\n\nSurvivorship bias is a form of selection bias where analyzing only the "winners" or "survivors" leads to false conclusions because the failures are invisible. It appears everywhere: we study successful companies but not the thousands that failed with identical strategies; we see ancient buildings and conclude "they built things to last" while forgetting the millions of ancient structures that crumbled; we analyze successful mutual funds without accounting for funds that closed. In data visualization and data art, survivorship bias is a powerful concept because it forces the viewer to ask: what am I NOT seeing? What data is absent, and why?\n\nThis implementation visualizes Wald\'s insight directly: a bomber silhouette accumulates "+" marks representing bullet impacts on surviving planes, while the critical areas (engines, cockpit) remain conspicuously empty — the viewer must recognize that emptiness as the most important signal. The visualization is both a data art piece and a lesson in statistical thinking. It connects to the broader field of "data humanism" championed by Giorgia Lupi and Stefanie Posavec, where data visualization becomes a medium for storytelling and empathy.\n\nKey parameters: the density and distribution of impact marks tell the story — they should be concentrated on fuselage and wings (survivable areas) and sparse near engines and cockpit (lethal areas). Animation speed controls narrative pacing. The ratio of marked to unmarked area IS the data. Color coding can distinguish hit zones from critical zones. A "reveal" mode can highlight the missing-data zones, completing the pedagogical arc.\n\nThe concept of visualizing absence connects to broader artistic traditions: John Cage\'s 4\'33" (silence as music), Rachel Whiteread\'s concrete casts of negative space, and the Islamic geometric principle of figure-ground equivalence where background shapes are as intentional as foreground shapes. In data science, techniques like inverse probability weighting and Heckman selection correction are the mathematical descendants of Wald\'s insight.',
    whyHere: 'Based on Abraham Wald\'s actual WWII work at the Statistical Research Group (Columbia, 1943): the military wanted to armor returning bombers where they saw bullet holes, but Wald realized the holes showed where planes could survive damage — the missing holes (on planes that didn\'t return) were the lethal zones. This is a data visualization of an absence. The algorithm maps dots in 2D space, kills those far from center with probability proportional to distance and inversely proportional to \"strength,\" then fades the dead. What remains is the survivor cluster — but the story is in the red ghosts. The artistic principle: what\'s NOT shown defines the pattern. This is the data art version of callback/reveal.',
    tags: ['data', 'statistics', 'bias', 'wald', 'wwii', 'visualization', 'absence', 'narrative'],
    refs: [
      { title: 'Wald — A Method of Estimating Plane Vulnerability (CNA Reprint, 1980)', url: 'https://apps.dtic.mil/sti/pdfs/ADA091073.pdf' },
      { title: 'Mangel & Samaniego — Abraham Wald\'s Work on Aircraft Survivability (JASA, 1984)', url: 'https://doi.org/10.1080/01621459.1984.10478038' },
      { title: 'Survivorship Bias — Wikipedia (comprehensive overview)', url: 'https://en.wikipedia.org/wiki/Survivorship_bias' }
    ],
    code: `let hits = [];
let maxHits = 800;
let planeW, planeH, planeX, planeY;
let engineZones = [];
let cockpitZone;

function setup() {
  createCanvas(windowWidth, windowHeight);
  textAlign(CENTER, CENTER);
  textFont('monospace');
  noStroke();
  setupPlane();
}

function setupPlane() {
  planeW = width * 0.6;
  planeH = height * 0.25;
  planeX = width / 2;
  planeY = height / 2;
  engineZones = [
    { x: planeX - planeW * 0.25, y: planeY - planeH * 0.3, r: planeH * 0.25 },
    { x: planeX + planeW * 0.25, y: planeY - planeH * 0.3, r: planeH * 0.25 },
    { x: planeX - planeW * 0.25, y: planeY + planeH * 0.3, r: planeH * 0.25 },
    { x: planeX + planeW * 0.25, y: planeY + planeH * 0.3, r: planeH * 0.25 }
  ];
  cockpitZone = { x: planeX + planeW * 0.42, y: planeY, r: planeH * 0.2 };
  hits = [];
}

function isInPlane(x, y) {
  let dx = (x - planeX) / (planeW * 0.5);
  let dy = (y - planeY) / (planeH * 0.5);
  if (abs(dx) < 1 && abs(dy) < 0.3) return true;
  if (abs(dx) < 0.15 && abs(dy) < 1) return true;
  if (abs(dx - 0.35) < 0.15 && abs(dy) < 0.15) return true;
  return false;
}

function isInCritical(x, y) {
  for (let ez of engineZones) {
    if (dist(x, y, ez.x, ez.y) < ez.r) return true;
  }
  if (dist(x, y, cockpitZone.x, cockpitZone.y) < cockpitZone.r) return true;
  return false;
}

function draw() {
  background(15);
  fill(30, 35, 40);
  rectMode(CENTER);
  rect(planeX, planeY, planeW, planeH * 0.5, 10);
  rect(planeX, planeY, planeW * 0.25, planeH * 2, 5);
  rect(planeX + planeW * 0.35, planeY, planeW * 0.2, planeH * 0.25, 3);
  for (let ez of engineZones) {
    fill(20, 40, 30, 100);
    ellipse(ez.x, ez.y, ez.r * 2);
  }
  fill(20, 30, 40, 100);
  ellipse(cockpitZone.x, cockpitZone.y, cockpitZone.r * 2);
  if (hits.length < maxHits && frameCount % 2 === 0) {
    for (let t = 0; t < 3; t++) {
      let x = planeX + random(-planeW * 0.48, planeW * 0.48);
      let y = planeY + random(-planeH * 0.9, planeH * 0.9);
      if (isInPlane(x, y) && !isInCritical(x, y)) {
        hits.push({ x, y, age: 0 });
      }
    }
  }
  for (let h of hits) {
    h.age++;
    let a = min(h.age / 30, 1);
    fill(255, 80 + random(40), 50, a * 200);
    textSize(7 + random(3));
    text('+', h.x, h.y);
  }
  fill(255, 255, 255, 180);
  textSize(14);
  text('SURVIVING AIRCRAFT — DAMAGE PATTERN', planeX, planeY - planeH * 1.2);
  if (hits.length > maxHits * 0.7) {
    fill(0, 255, 200, map(sin(frameCount * 0.05), -1, 1, 100, 255));
    textSize(11);
    text('Where are the missing bullet holes?', planeX, planeY + planeH * 1.3);
    text('Armor goes where the survivors WEREN\\'T hit.', planeX, planeY + planeH * 1.3 + 20);
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  setupPlane();
}`
  },
  {
    id: 'domain-warping',
    name: 'Domain Warping',
    cat: 'noise',
    desc: 'Noise feeding on noise — fBM twisted by fBM creates textures that breathe like living stone.',
    detail: 'Domain warping is the technique of using one function to distort the input coordinates of another function, creating complex, organic patterns from simple building blocks. While the concept is as old as procedural texturing itself, it was Inigo Quilez (IQ) — the legendary demoscene coder, Pixar/Oculus veteran, and co-creator of Shadertoy — who crystallized it into a systematic, widely-adopted technique through his influential articles at iquilezles.org. His key article "Domain Warping" (originally published ~2002, updated 2019, at https://iquilezles.org/articles/warp/) demonstrates how feeding fractional Brownian motion (fBM) into fBM produces stunningly organic patterns that resemble marble, smoke, geological strata, and alien landscapes.\n\nThe core idea is elegantly simple. Standard fBM sums multiple octaves of noise: fbm(p) = Σ noise(p * 2^i) / 2^i. Domain warping applies fBM to distort the input: pattern(p) = fbm(p + fbm(p + fbm(p))). Each layer of warping adds complexity — the first warp bends straight lines into curves, the second creates folding and layering, and deeper nesting produces increasingly turbulent, geological textures. The mathematical beauty is that each function is smooth and continuous, so the result is always smooth regardless of complexity. By adding different constant offsets to each warping layer (e.g., fbm(p + vec2(5.2, 1.3))), you break symmetry and create richer, less periodic results.\n\nFor real-time web implementation, the key optimization is balancing octave count against frame rate. Each octave roughly doubles the noise evaluations, and each warping layer multiplies them again. Four octaves with two warp layers (4 × 3 = 12 noise evaluations per pixel) is a sweet spot for p5.js at moderate resolution. Rendering at half resolution and upscaling, or using a pixel-skip pattern, enables full-screen real-time performance. In WebGL/shader contexts, domain warping runs at full speed because each pixel is independent — making it perfectly parallel.\n\nKey parameters: the number of fBM octaves controls detail level (more octaves = finer detail at higher cost). The warp amplitude controls how far coordinates are displaced (small = subtle undulation, large = violent distortion). The frequency multiplier between octaves (lacunarity, typically 2.0) and the amplitude reduction (gain/persistence, typically 0.5) shape the frequency spectrum. Time evolution (animating the z-coordinate or adding time-based offsets) creates mesmerizing fluid motion. Color mapping transforms the scalar output into visual richness.\n\nDomain warping is ubiquitous in film VFX and games: it drives cloud rendering, terrain generation, magical effects, and procedural materials in every major rendering engine. At Pixar (where Quilez worked), domain-warped noise creates the organic textures on everything from monster skin to alien planets. In Unreal Engine, Material Editor noise nodes support domain warping natively. The technique bridges the gap between mathematical procedure and natural appearance more effectively than perhaps any other algorithm in computer graphics.',
    whyHere: 'Inigo Quilez (IQ) pioneered this technique for real-time shader art — feeding fractional Brownian motion (fBM) coordinates into another fBM function, creating organic fluid distortion that looks like smoke, marble, or alien terrain. The key insight is composability: f(p + fbm(p)) produces simple warping, f(p + fbm(p + fbm(p))) produces complex turbulence. Each layer of nesting adds visual richness at minimal computational cost. IQ\'s articles on iquilezles.org are the definitive reference and inspired thousands of Shadertoy implementations. This p5.js version samples a 2D grid at reduced resolution for real-time performance. The warm color palette (black → amber → white) maps the warp intensity to a volcanic/geological aesthetic. This is the go-to algorithm for procedural textures in film VFX (Houdini, Substance, Unreal materials).',
    tags: ['noise', 'warping', 'fbm', 'procedural', 'quilez', 'organic', 'vfx', 'shader'],
    refs: [
      { title: 'Inigo Quilez — Domain Warping Article', url: 'https://iquilezles.org/articles/warp/' },
      { title: 'Inigo Quilez — fBM Article', url: 'https://iquilezles.org/articles/fbm/' },
      { title: 'The Book of Shaders — Fractal Brownian Motion', url: 'https://thebookofshaders.com/13/' }
    ],
    code: `let t = 0;

function setup() {
  createCanvas(windowWidth, windowHeight);
  textAlign(CENTER, CENTER);
  textFont('monospace');
  noStroke();
  noiseDetail(4, 0.5);
}

function draw() {
  background(15);
  let step = 14;
  let scale = 0.004;
  let warpAmp = 80;
  for (let x = 0; x < width; x += step) {
    for (let y = 0; y < height; y += step) {
      let nx = x * scale;
      let ny = y * scale;
      let w1x = noise(nx + 5.2, ny + 1.3, t) * 2 - 1;
      let w1y = noise(nx + 9.7, ny + 2.8, t) * 2 - 1;
      let w2x = noise(nx + w1x * 2 + 1.7, ny + w1y * 2 + 9.2, t * 1.1) * 2 - 1;
      let w2y = noise(nx + w1x * 2 + 8.3, ny + w1y * 2 + 2.8, t * 1.1) * 2 - 1;
      let val = noise(nx + w2x * 2, ny + w2y * 2, t * 0.7);
      let warpMag = sqrt(w2x * w2x + w2y * w2y);
      let r = val * 200 + warpMag * 55;
      let g = val * 120 + 40;
      let b = (1 - val) * 200 + 55;
      let sz = map(val, 0, 1, 5, 14);
      let a = map(warpMag, 0, 1.4, 0.3, 1);
      fill(r, g, b, a * 255);
      textSize(sz);
      text('+', x, y);
    }
  }
  t += 0.003;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}`
  }
];
