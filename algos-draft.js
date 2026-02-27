const ALGOS = [
  {
    id: 'perlin-flow-field',
    name: 'Perlin Noise Flow Field',
    cat: 'noise',
    desc: 'Particles follow invisible rivers of Perlin noise, creating organic flow patterns.',
    detail: 'A flow field divides the canvas into a grid where each cell holds an angle derived from Perlin noise. Particles moving through the field sample the angle at their position and steer accordingly, producing smooth, wind-like trajectories. The magic is in the coherence — nearby particles move in similar directions, creating the illusion of an invisible current.\n\nBecause Perlin noise is continuous and differentiable, small changes in position yield small changes in direction. This gives you organic motion without any physics simulation. You can animate the field by stepping through a third noise dimension over time, making the rivers shift and swirl. Adjusting the noise scale zooms in or out on the turbulence — tight scales produce chaotic filigree, wide scales produce sweeping arcs.\n\nFor generative art, flow fields are a gateway drug. They\'re simple to implement, endlessly tweakable, and produce results that feel alive. Layer them with color mapping, trail fade, and density variation and you get pieces that reward long viewing.',
    whyHere: 'Flow fields are the connective tissue of motion graphics pipelines. In TouchDesigner and Unreal Niagara, vector fields drive particle systems at massive scale — understanding the algorithm underneath gives you precise control when the GUI isn\'t enough. The "+" glyphs tracing these invisible currents echo Tawfeeq\'s signature while revealing the hidden structure of noise space.',
    tags: ['organic', 'meditation', 'particle-system', 'slow-reveal', 'ambient'],
    code: `let particles = [];
const COLS = 60, ROWS = 60;
let field = [];
let sc = 0.06, zOff = 0;

function setup() {
  createCanvas(800, 800);
  background(15);
  textAlign(CENTER, CENTER);
  textSize(10);
  for (let i = 0; i < 800; i++) {
    particles.push({ x: random(width), y: random(height) });
  }
}

function draw() {
  background(15, 12);
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      let angle = noise(x * sc, y * sc, zOff) * TAU * 2;
      field[y * COLS + x] = angle;
    }
  }
  zOff += 0.003;
  fill(220, 180);
  noStroke();
  for (let p of particles) {
    let col = floor(p.x / (width / COLS));
    let row = floor(p.y / (height / ROWS));
    if (col >= 0 && col < COLS && row >= 0 && row < ROWS) {
      let angle = field[row * COLS + col];
      p.x += cos(angle) * 1.5;
      p.y += sin(angle) * 1.5;
    }
    text('+', p.x, p.y);
    if (p.x < 0 || p.x > width || p.y < 0 || p.y > height) {
      p.x = random(width);
      p.y = random(height);
    }
  }
}`
  },
  {
    id: 'l-systems',
    name: 'L-Systems',
    cat: 'growth',
    desc: 'Recursive string-rewriting rules that grow branching structures like plants and fractals.',
    detail: 'An L-System starts with an axiom — a seed string — and a set of production rules that replace characters with longer strings each generation. After several iterations, you interpret the resulting string as drawing commands: F means draw forward, + and - mean turn, [ and ] mean push and pop the turtle\'s state. The result is branching, self-similar structures that look strikingly like plants, blood vessels, or lightning.\n\nThe power of L-Systems is that tiny rule changes produce dramatically different organisms. Swap one production rule and a fern becomes a bush becomes a snowflake. Stochastic L-Systems add randomness to rule selection, breaking the perfect symmetry and producing natural variation. Context-sensitive rules let characters react to their neighbors, enabling signal propagation along branches.\n\nFor generative artists, L-Systems are a lesson in emergence: complex visual structure from trivial grammar. They\'re also deeply composable — you can feed L-System geometry into physics simulations, use it as scaffolding for particle systems, or drive audio parameters from branch depth.',
    whyHere: 'L-Systems bridge biology and computation — the same territory Tawfeeq navigates building organic CG creatures at ILM. In Houdini and Unreal PCG, procedural growth systems use identical principles to generate vegetation and coral. Here, the "+" glyph does double duty: it\'s both Tawfeeq\'s signature mark and a literal turn command in the L-System grammar.',
    tags: ['growth', 'fractal', 'botanical', 'recursive', 'branching'],
    code: `let axiom = 'F';
let sentence = axiom;
let rules = { F: 'FF+[+F-F-F]-[-F+F+F]' };
let len = 150;
let angle = 25;
let generated = false;

function setup() {
  createCanvas(800, 800);
  background(15);
  textAlign(CENTER, CENTER);
  textSize(8);
}

function generate() {
  let next = '';
  for (let c of sentence) {
    next += rules[c] || c;
  }
  sentence = next;
  len *= 0.5;
}

function draw() {
  if (!generated) {
    for (let i = 0; i < 4; i++) generate();
    generated = true;
  }
  background(15);
  fill(220);
  noStroke();
  push();
  translate(width / 2, height - 40);
  for (let c of sentence) {
    if (c === 'F') {
      text('+', 0, 0);
      translate(0, -len);
    } else if (c === '+') {
      rotate(radians(angle));
    } else if (c === '-') {
      rotate(radians(-angle));
    } else if (c === '[') {
      push();
    } else if (c === ']') {
      pop();
    }
  }
  pop();
  noLoop();
}`
  },
  {
    id: 'game-of-life',
    name: 'Conway\'s Game of Life',
    cat: 'cellular',
    desc: 'Four simple rules on a grid produce startlingly complex emergent behavior.',
    detail: 'Conway\'s Game of Life is a zero-player game — you set the initial state and watch. Each cell is alive or dead. Every tick, a cell counts its eight neighbors: fewer than two alive and it dies of loneliness, more than three and it dies of overcrowding, exactly three and a dead cell springs to life. That\'s it. Four rules. From this, you get gliders, oscillators, Turing-complete logic gates, and self-replicating patterns.\n\nThe deeper lesson is about emergence. No single rule is interesting. But their interaction on a grid produces behavior so rich that people have spent decades cataloging the zoo of patterns that arise. It\'s a perfect demonstration that complexity doesn\'t require complex rules — it requires interaction at scale.\n\nFor generative art, Life is a texture machine. Run it on a large grid with random initialization and you get organic, ever-shifting patterns. Map cell age to color and you reveal history. Run it at low resolution as a control signal and you get unpredictable but structured animation triggers.',
    whyHere: 'Cellular automata are the conceptual backbone of simulation — from Houdini\'s vellum solver to Unreal\'s Chaos physics. Understanding Life helps Tawfeeq reason about any system where local rules produce global behavior. The "+" glyphs flickering on and off turn the grid into a living typography field — his mark breathing with emergent life.',
    tags: ['emergence', 'simulation', 'grid', 'binary', 'texture'],
    code: `const RES = 12;
let cols, rows, grid, next;

function setup() {
  createCanvas(800, 800);
  cols = floor(width / RES);
  rows = floor(height / RES);
  grid = make2D(cols, rows);
  next = make2D(cols, rows);
  for (let i = 0; i < cols; i++)
    for (let j = 0; j < rows; j++)
      grid[i][j] = random() > 0.6 ? 1 : 0;
  textAlign(CENTER, CENTER);
  textSize(RES - 2);
  frameRate(12);
}

function make2D(c, r) {
  return Array.from({ length: c }, () => new Array(r).fill(0));
}

function countNeighbors(g, x, y) {
  let sum = 0;
  for (let i = -1; i <= 1; i++)
    for (let j = -1; j <= 1; j++) {
      let ci = (x + i + cols) % cols;
      let cj = (y + j + rows) % rows;
      sum += g[ci][cj];
    }
  return sum - g[x][y];
}

function draw() {
  background(15);
  fill(220);
  noStroke();
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      if (grid[i][j] === 1) {
        text('+', i * RES + RES / 2, j * RES + RES / 2);
      }
      let n = countNeighbors(grid, i, j);
      if (grid[i][j] === 1) {
        next[i][j] = (n === 2 || n === 3) ? 1 : 0;
      } else {
        next[i][j] = n === 3 ? 1 : 0;
      }
    }
  }
  [grid, next] = [next, grid];
}`
  },
  {
    id: 'voronoi-tessellation',
    name: 'Voronoi Tessellation',
    cat: 'geometry',
    desc: 'Space divided into regions — each point owns the territory closest to it.',
    detail: 'Given a set of seed points, a Voronoi diagram partitions the plane so every location belongs to the nearest seed. The boundaries form a mesh of convex polygons — organic yet precise, like mud cracks, giraffe skin, or city districts drawn by proximity. The dual of the Voronoi diagram is the Delaunay triangulation, connecting seeds whose regions share an edge.\n\nComputing Voronoi efficiently uses Fortune\'s sweep-line algorithm (O(n log n)), but for creative coding you can brute-force it: for each pixel, find the nearest seed and color accordingly. Animating the seeds produces morphing cells — fluid, biological, mesmerizing. Adding weighted distances or Manhattan metrics twists the cells into alien geometries.\n\nVoronoi is everywhere in generative art because it bridges order and chaos. Random seeds produce organic cells. Grid seeds produce regular tiles. Perturbed grid seeds produce the sweet spot — structured enough to read as intentional, irregular enough to feel alive.',
    whyHere: 'Voronoi appears constantly in VFX — shatter simulations, terrain generation, procedural texturing in Substance and Unreal materials. Tawfeeq encounters it daily. Understanding its guts means knowing when to reach for it and when to hack it. The "+" at each cell center is both a seed marker and his signature stamp on each territory.',
    tags: ['spatial', 'partition', 'organic', 'architecture', 'procedural'],
    code: `let seeds = [];
const N = 40;

function setup() {
  createCanvas(800, 800);
  for (let i = 0; i < N; i++) {
    seeds.push({
      x: random(width), y: random(height),
      vx: random(-0.5, 0.5), vy: random(-0.5, 0.5),
      col: color(random(60, 200), random(60, 150), random(100, 220), 80)
    });
  }
  textAlign(CENTER, CENTER);
  textSize(14);
}

function draw() {
  background(15);
  loadPixels();
  for (let px = 0; px < width; px += 6) {
    for (let py = 0; py < height; py += 6) {
      let minD = Infinity, closest = 0;
      for (let i = 0; i < seeds.length; i++) {
        let d = dist(px, py, seeds[i].x, seeds[i].y);
        if (d < minD) { minD = d; closest = i; }
      }
      let c = seeds[closest].col;
      fill(c);
      noStroke();
      rect(px, py, 6, 6);
    }
  }
  fill(220);
  for (let s of seeds) {
    text('+', s.x, s.y);
    s.x += s.vx; s.y += s.vy;
    if (s.x < 0 || s.x > width) s.vx *= -1;
    if (s.y < 0 || s.y > height) s.vy *= -1;
  }
}`
  },
  {
    id: 'circle-packing',
    name: 'Circle Packing',
    cat: 'geometry',
    desc: 'Circles grow to fill space without overlapping — density from simple collision rules.',
    detail: 'Circle packing is a greedy spatial algorithm. Drop a circle at a random location, grow it until it touches another circle or the canvas edge, then freeze it and drop another. Repeat thousands of times. The result is a dense, organic fill that naturally emphasizes negative space — large circles claim territory early, smaller ones fill the cracks between.\n\nThe algorithm is computationally simple: each frame, check every growing circle against every frozen one for overlap. When overlap occurs, stop growing. For better performance, use a spatial hash or quadtree, but brute force works fine for hundreds of circles. You can constrain packing to arbitrary shapes by rejecting seed points outside a mask — pack an image, a word, a silhouette.\n\nCircle packing produces compositions that feel hand-arranged but are actually inevitable — the geometry of fitting rounds into a finite plane. It\'s deeply satisfying to watch and surprisingly versatile: swap circles for any shape, vary growth rates, add color rules based on size or position.',
    whyHere: 'Packing problems appear everywhere in Tawfeeq\'s world — UV packing in texturing, lightmap density in Unreal, even mixing levels in Ableton (fitting sounds into frequency space). The "+" glyphs at each circle center transform the packing into a constellation of his marks, dense where space is tight, breathing where it opens up.',
    tags: ['density', 'fill', 'organic', 'composition', 'mask-driven'],
    code: `let circles = [];
const MAX = 600;

function setup() {
  createCanvas(800, 800);
  background(15);
  textAlign(CENTER, CENTER);
  noStroke();
}

function draw() {
  background(15);
  for (let attempt = 0; attempt < 10; attempt++) {
    if (circles.length >= MAX) break;
    let c = { x: random(20, width - 20), y: random(20, height - 20), r: 2, growing: true };
    let valid = true;
    for (let o of circles) {
      if (dist(c.x, c.y, o.x, o.y) < o.r + c.r + 2) { valid = false; break; }
    }
    if (valid) circles.push(c);
  }
  for (let c of circles) {
    if (!c.growing) continue;
    c.r += 0.4;
    if (c.x - c.r < 0 || c.x + c.r > width || c.y - c.r < 0 || c.y + c.r > height) {
      c.growing = false; continue;
    }
    for (let o of circles) {
      if (o === c) continue;
      if (dist(c.x, c.y, o.x, o.y) < c.r + o.r + 2) { c.growing = false; break; }
    }
  }
  for (let c of circles) {
    stroke(220, 60);
    noFill();
    ellipse(c.x, c.y, c.r * 2);
    noStroke();
    fill(220);
    textSize(max(8, c.r * 0.6));
    text('+', c.x, c.y);
  }
}`
  },
  {
    id: 'dla',
    name: 'Diffusion Limited Aggregation',
    cat: 'growth',
    desc: 'Random walkers stick on contact, building coral-like fractal structures.',
    detail: 'DLA simulates how particles undergoing Brownian motion aggregate into clusters. A seed particle sits at the center. Walkers are released from the periphery and stumble randomly until they touch the growing cluster, at which point they freeze in place. Over thousands of particles, the cluster develops branching, dendritic arms with a fractal dimension around 1.7 — eerily similar to lightning, mineral dendrites, and coral.\n\nThe algorithm is beautiful in its simplicity but computationally hungry. Each walker might take thousands of steps before finding the cluster. Optimizations include killing walkers that drift too far, spawning them closer to the cluster\'s bounding circle, and using a grid lookup for adjacency instead of checking every frozen particle. Even so, DLA rewards patience — the best structures emerge from long runs.\n\nDLA structures have a haunting organic quality because they\'re shaped by the same mathematics as real diffusion processes. The branching is not random — it\'s the inevitable result of exposed tips capturing more walkers than sheltered valleys. This preferential growth at extremities is why DLA looks alive.',
    whyHere: 'DLA is procedural growth distilled to its essence — the same principle drives frost formation, electrical discharge effects, and creature-growth simulations in VFX. For Tawfeeq, it\'s a direct bridge between natural phenomena and the procedural systems he builds in Houdini and Unreal. Each "+" that locks into the cluster is his mark growing organically, one random walk at a time.',
    tags: ['growth', 'fractal', 'patience', 'organic', 'dendrite'],
    code: `let tree = [];
let walkers = [];
const GRID = 4;
let cols, rows, occupied;

function setup() {
  createCanvas(800, 800);
  background(15);
  cols = floor(width / GRID);
  rows = floor(height / GRID);
  occupied = new Set();
  let cx = floor(cols / 2), cy = floor(rows / 2);
  tree.push({ x: cx, y: cy });
  occupied.add(cx + ',' + cy);
  textAlign(CENTER, CENTER);
  textSize(GRID);
}

function gKey(x, y) { return x + ',' + y; }

function isAdjacentToTree(x, y) {
  for (let dx = -1; dx <= 1; dx++)
    for (let dy = -1; dy <= 1; dy++)
      if (occupied.has(gKey(x + dx, y + dy))) return true;
  return false;
}

function draw() {
  background(15);
  for (let i = 0; i < 20; i++) {
    let angle = random(TAU);
    let rad = min(tree.length * 0.15 + 50, width / 2 - 10);
    walkers.push({
      x: floor(cols / 2 + cos(angle) * rad / GRID),
      y: floor(rows / 2 + sin(angle) * rad / GRID)
    });
  }
  for (let i = walkers.length - 1; i >= 0; i--) {
    let w = walkers[i];
    w.x += floor(random(-1, 2));
    w.y += floor(random(-1, 2));
    if (w.x < 1 || w.x >= cols - 1 || w.y < 1 || w.y >= rows - 1) {
      walkers.splice(i, 1); continue;
    }
    if (isAdjacentToTree(w.x, w.y)) {
      tree.push(w);
      occupied.add(gKey(w.x, w.y));
      walkers.splice(i, 1);
    }
  }
  if (walkers.length > 500) walkers.splice(0, walkers.length - 500);
  fill(220);
  noStroke();
  for (let t of tree) {
    text('+', t.x * GRID + GRID / 2, t.y * GRID + GRID / 2);
  }
  fill(220, 40);
  for (let w of walkers) {
    text('+', w.x * GRID + GRID / 2, w.y * GRID + GRID / 2);
  }
}`
  },
  {
    id: 'boids',
    name: 'Boids / Flocking',
    cat: 'physics',
    desc: 'Three rules — separate, align, cohere — produce lifelike flocking behavior.',
    detail: 'Craig Reynolds\' 1986 boids model shows that flocking needs no leader and no global plan. Each boid follows three local rules: separation (steer away from nearby boids), alignment (match the heading of neighbors), and cohesion (steer toward the average position of neighbors). The interaction of these three vectors produces emergent flocking — splitting, merging, wheeling, and flowing around obstacles.\n\nImplementation is straightforward: each frame, each boid scans for neighbors within a perception radius, computes three steering vectors, weights and sums them, and updates its velocity. The tuning is where the art lives — heavy separation produces nervous scattering, heavy cohesion produces tight balls, heavy alignment produces synchronized rivers. Adding a fourth force (attraction to mouse, avoidance of predators, wind) layers in interactivity.\n\nBoids remain one of the most elegant demonstrations of emergence in computer science. They\'re also immediately useful — film crowds, game AI, music visualization, drone choreography. The gap between the simplicity of the rules and the richness of the behavior never stops being surprising.',
    whyHere: 'Flocking drives crowd simulation at ILM — from bird swarms to battle armies. In TouchDesigner, boids are a go-to for reactive installations. Tawfeeq knows this algorithm professionally; having it in the kitchen means he can prototype variations fast. The "+" glyphs moving as a flock turn his signature into a living, breathing swarm.',
    tags: ['swarm', 'emergence', 'interactive', 'crowd', 'kinetic'],
    code: `let flock = [];
const N = 150;

function setup() {
  createCanvas(800, 800);
  for (let i = 0; i < N; i++) {
    flock.push({
      x: random(width), y: random(height),
      vx: random(-2, 2), vy: random(-2, 2)
    });
  }
  textAlign(CENTER, CENTER);
  textSize(12);
}

function draw() {
  background(15, 30);
  for (let b of flock) {
    let sx = 0, sy = 0, ax = 0, ay = 0, cx = 0, cy = 0;
    let sc = 0, ac = 0, cc = 0;
    for (let o of flock) {
      let d = dist(b.x, b.y, o.x, o.y);
      if (o === b || d > 80) continue;
      if (d < 25) { sx += b.x - o.x; sy += b.y - o.y; sc++; }
      ax += o.vx; ay += o.vy; ac++;
      cx += o.x; cy += o.y; cc++;
    }
    if (sc > 0) { b.vx += sx / sc * 0.05; b.vy += sy / sc * 0.05; }
    if (ac > 0) { b.vx += (ax / ac - b.vx) * 0.02; b.vy += (ay / ac - b.vy) * 0.02; }
    if (cc > 0) { b.vx += (cx / cc - b.x) * 0.002; b.vy += (cy / cc - b.y) * 0.002; }
    let spd = sqrt(b.vx * b.vx + b.vy * b.vy);
    if (spd > 3) { b.vx = b.vx / spd * 3; b.vy = b.vy / spd * 3; }
    b.x += b.vx; b.y += b.vy;
    if (b.x < 0) b.x = width;
    if (b.x > width) b.x = 0;
    if (b.y < 0) b.y = height;
    if (b.y > height) b.y = 0;
  }
  fill(220);
  noStroke();
  for (let b of flock) text('+', b.x, b.y);
}`
  },
  {
    id: 'islamic-star',
    name: 'Islamic Star Patterns / Girih',
    cat: 'islamic',
    desc: 'Geometric constructions from polygon tessellations — infinite symmetry from finite rules.',
    detail: 'Islamic geometric patterns are constructed through a systematic process: start with a regular tessellation of polygons (often combinations of decagons, pentagons, and hexagons), find the midpoints of edges, and connect them according to angle rules to create interlocking star and rosette motifs. The Girih system, discovered in medieval Islamic architecture, uses five specific tile shapes whose edges can be decorated with lines that continue seamlessly across tile boundaries.\n\nWhat makes these patterns extraordinary is their mathematical depth. Some exhibit quasi-crystalline symmetry — five-fold rotational patterns that never exactly repeat, predating Penrose tilings by five centuries. The construction methods encode deep truths about symmetry groups, and the patterns achieve visual complexity through pure geometric logic rather than organic randomness.\n\nFor generative artists, Islamic patterns offer a masterclass in constraint-based design. The rules are rigid — angles must meet precisely, lines must continue across boundaries — but within those constraints, the design space is vast. Parameterize the star angle, the tessellation type, or the interlace depth and you get infinite variation while maintaining the mathematical harmony that makes these patterns transcendent.',
    whyHere: 'This is personal for Tawfeeq. Islamic geometric art is a living tradition that connects mathematics, spirituality, and craftsmanship — values that resonate through his engineering practice. As a VP at ILM working with cutting-edge tech, bringing these ancient algorithms into the same toolkit as Perlin noise and flocking is an act of cultural integration. The "+" glyph at each vertex is a quiet assertion: this heritage belongs in the future too.',
    tags: ['symmetry', 'sacred-geometry', 'tessellation', 'precision', 'cultural'],
    code: `let angle = 0;

function setup() {
  createCanvas(800, 800);
  textAlign(CENTER, CENTER);
  textSize(8);
  noLoop();
}

function draw() {
  background(15);
  fill(220);
  noStroke();
  let cx = width / 2, cy = height / 2;
  drawStar(cx, cy, 200, 10, 2);
  drawStar(cx, cy, 130, 10, 2);
  let outerR = 300;
  for (let i = 0; i < 10; i++) {
    let a = TAU / 10 * i - HALF_PI;
    let sx = cx + cos(a) * outerR;
    let sy = cy + sin(a) * outerR;
    drawStar(sx, sy, 80, 10, 1);
  }
}

function drawStar(cx, cy, r, points, depth) {
  let inner = r * 0.4;
  stroke(220, 80);
  strokeWeight(1);
  for (let i = 0; i < points; i++) {
    let a1 = TAU / points * i - HALF_PI;
    let a2 = TAU / points * (i + 0.5) - HALF_PI;
    let a3 = TAU / points * (i + 1) - HALF_PI;
    let ox = cx + cos(a1) * r;
    let oy = cy + sin(a1) * r;
    let ix = cx + cos(a2) * inner;
    let iy = cy + sin(a2) * inner;
    let nx = cx + cos(a3) * r;
    let ny = cy + sin(a3) * r;
    line(ox, oy, ix, iy);
    line(ix, iy, nx, ny);
    noStroke();
    fill(220);
    text('+', ox, oy);
    text('+', ix, iy);
    stroke(220, 80);
    strokeWeight(1);
  }
  noStroke();
  fill(220);
  text('+', cx, cy);
}`
  },
  {
    id: 'survivor-bias',
    name: 'Survivor Bias Visualization',
    cat: 'data',
    desc: 'The famous WWII bomber problem — visualizing what\'s missing tells you more than what survived.',
    detail: 'During WWII, Abraham Wald was asked where to add armor to bombers. The military wanted to reinforce the areas with the most bullet holes on returning planes. Wald\'s insight was profound: the holes showed where planes could take damage and survive. The missing data — the planes that didn\'t return — told you where armor was actually needed. Survivorship bias is the logical error of concentrating on things that passed a selection process while overlooking those that didn\'t.\n\nAs a visualization, this becomes a powerful data-art piece. You render the bomber outline, scatter impact points where returning planes showed damage, then reveal the critical zones — the areas with no impacts, where hits were fatal. The visual rhetoric is striking: absence becomes the message. The empty spaces on the diagram are more important than the marked ones.\n\nThis algorithm is unique in this collection because it\'s not about generation — it\'s about perception. It\'s a reminder that data visualization is an argument, and the most important features of a dataset might be what\'s not there. For creative technologists, it\'s a prompt to think about negative space, selection effects, and the stories that silence tells.',
    whyHere: 'Tawfeeq works in an industry built on visible output — the final render, the shipped shot. But the craft lives in what you don\'t see: the optimizations, the failed iterations, the invisible infrastructure. This algo is a philosophical anchor in the kitchen, a reminder that the "+" marks showing impact are less important than the spaces where no mark exists. It\'s also a gorgeous data-art piece that bridges engineering rigor with visual storytelling.',
    tags: ['data-viz', 'narrative', 'negative-space', 'history', 'critical-thinking'],
    code: `let impacts = [];
let bomberPts = [];
let phase = 0;

function setup() {
  createCanvas(800, 800);
  textAlign(CENTER, CENTER);
  textSize(10);
  // Simple bomber silhouette points
  bomberPts = [
    {x: 400, y: 150}, {x: 420, y: 200}, {x: 430, y: 350},
    {x: 500, y: 400}, {x: 430, y: 420}, {x: 425, y: 600},
    {x: 480, y: 650}, {x: 420, y: 660}, {x: 400, y: 700},
    {x: 380, y: 660}, {x: 320, y: 650}, {x: 375, y: 600},
    {x: 370, y: 420}, {x: 300, y: 400}, {x: 370, y: 350},
    {x: 380, y: 200}
  ];
  // Survivor impacts - areas where planes survived hits
  for (let i = 0; i < 60; i++) {
    let x = random(320, 480);
    let y = random(200, 650);
    // Avoid engines and cockpit (critical zones)
    let inCritical = (y < 250) || (abs(x - 400) > 60 && y > 350 && y < 450);
    if (!inCritical) {
      impacts.push({ x, y, shown: false, frame: floor(random(30, 200)) });
    }
  }
}

function draw() {
  background(15);
  // Draw bomber outline
  stroke(220, 40);
  strokeWeight(1);
  noFill();
  beginShape();
  for (let p of bomberPts) vertex(p.x, p.y);
  endShape(CLOSE);
  // Wings
  line(300, 380, 180, 360);
  line(500, 380, 620, 360);
  line(180, 360, 180, 400);
  line(620, 360, 620, 400);
  line(180, 400, 300, 420);
  line(620, 400, 500, 420);
  noStroke();
  // Reveal impacts over time
  fill(180, 80, 80);
  for (let imp of impacts) {
    if (frameCount > imp.frame) {
      imp.shown = true;
      text('+', imp.x, imp.y);
    }
  }
  // Labels
  if (frameCount > 220) {
    fill(80, 200, 120);
    textSize(12);
    text('+ CRITICAL: No impacts here', 400, 220);
    text('+ (planes hit here didn\\'t return)', 400, 240);
    text('+', 190, 380);
    text('+', 610, 380);
    textSize(10);
  }
  // Title
  fill(220);
  textSize(14);
  text('SURVIVORSHIP BIAS', 400, 50);
  textSize(10);
  text('Where should we add armor?', 400, 70);
}`
  },
  {
    id: 'domain-warping',
    name: 'Domain Warping',
    cat: 'noise',
    desc: 'Noise feeding into noise — layered distortions that produce organic, fluid landscapes.',
    detail: 'Domain warping is what happens when you use one noise function to distort the input coordinates of another. Instead of sampling noise(x, y), you sample noise(x + noise(x, y), y + noise(x, y)). The result is dramatically more organic than plain Perlin noise — you get swirling, marbled textures that look like satellite photos of Jupiter, geological strata, or ink diffusing in water. Stack more layers and the distortions compound, producing increasingly alien and beautiful forms.\n\nThe technique was popularized by Inigo Quilez, who showed that the formula f(p) = fbm(p + fbm(p + fbm(p))) produces extraordinary visual complexity from simple ingredients. Each layer of warping adds a frequency of distortion — the first bends, the second ripples the bends, the third frays the ripples. You can animate by sliding the noise offset over time, and the whole landscape breathes and morphs.\n\nDomain warping is important because it demonstrates a general principle in generative art: composition of simple functions produces complex results. It\'s the noise equivalent of feedback in audio or video — feeding output back into input. Once you internalize this pattern, you see opportunities everywhere: warp UVs, warp time, warp any parameter space.',
    whyHere: 'Domain warping is the secret sauce behind countless Unreal and TouchDesigner material effects — lava, clouds, force fields, magical energy. Tawfeeq has almost certainly built materials using this technique without knowing the formal name. Having it in the kitchen as a first-class algorithm means he can prototype warping patterns in p5.js before porting to HLSL or GLSL. The "+" glyphs sampled across the warped domain reveal the distortion field itself — his mark bent through layers of mathematical turbulence.',
    tags: ['noise', 'fluid', 'organic', 'material', 'feedback', 'psychedelic'],
    code: `let t = 0;

function setup() {
  createCanvas(800, 800);
  textAlign(CENTER, CENTER);
  textSize(10);
  noiseDetail(4, 0.5);
}

function draw() {
  background(15);
  let step = 20;
  noStroke();
  for (let x = 0; x < width; x += step) {
    for (let y = 0; y < height; y += step) {
      let nx = x * 0.004;
      let ny = y * 0.004;

      // First warp layer
      let q1 = noise(nx + t * 0.3, ny, 0) * 4;
      let q2 = noise(nx, ny + t * 0.3, 5.2) * 4;

      // Second warp layer
      let r1 = noise(nx + q1 + 1.7, ny + q2 + 9.2, t * 0.15) * 4;
      let r2 = noise(nx + q1 + 8.3, ny + q2 + 2.8, t * 0.15) * 4;

      // Final sample
      let val = noise(nx + r1, ny + r2, t * 0.1);
      let bright = val * 255;
      let hue = (val * 360 + frameCount) % 360;

      // Map to warm palette
      let r = bright * 0.9 + 30;
      let g = val * val * 180;
      let b = (1 - val) * 120 + 40;

      fill(r, g, b, 200);
      text('+', x + step / 2, y + step / 2);
    }
  }
  t += 0.005;
}`
  }
];
