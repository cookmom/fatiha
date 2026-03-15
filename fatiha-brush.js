/**
 * fatiha.brush — Custom Ottoman Brush Engine (v2: organic watercolor)
 *
 * WebGL2 instanced-quad renderer for real-time voice-reactive
 * Islamic calligraphic art. Organic natural-media aesthetic with
 * Gaussian-falloff brush tips, per-stamp noise grain, color jitter,
 * and multi-octave paper texture.
 *
 * Usage:
 *   const fb = new FatihaBrush(canvas, { maxStamps: 4096, layers: ['garden','glow'] });
 *   fb.addStamp({ x, y, texture: 'soft_round', r:1, g:0, b:0, a:0.5, layer: 'garden' });
 *   fb.update(dt);
 *   fb.render();
 */

// ═══════════════════════════════════════════════════════════════
//  CONSTANTS
// ═══════════════════════════════════════════════════════════════

const FLOATS_PER_STAMP = 14;
// x, y, rotation, scaleX, scaleY, r, g, b, a, texU, texV, texSize, age, lifetime

const ATLAS_CELL = 128;   // pixels per brush tip cell
const ATLAS_COLS = 4;
const ATLAS_ROWS = 2;
const ATLAS_SIZE = ATLAS_CELL * ATLAS_COLS; // 512×256 atlas
const GRAIN_SIZE = 256;

// ═══════════════════════════════════════════════════════════════
//  SHADERS
// ═══════════════════════════════════════════════════════════════

const STAMP_VERT = `#version 300 es
precision highp float;

// Quad geometry (2 triangles)
layout(location = 0) in vec2 a_quadPos;

// Per-instance attributes
layout(location = 1) in vec2 a_pos;
layout(location = 2) in float a_rot;
layout(location = 3) in vec2 a_scale;
layout(location = 4) in vec4 a_color;
layout(location = 5) in vec3 a_tex;   // u, v, size in atlas (normalized)
layout(location = 6) in vec2 a_life;  // age, lifetime

uniform vec2 u_resolution;

out vec2 v_uv;        // local quad UV [0,1]
out vec2 v_atlasUV;   // atlas UV for this tip
out float v_atlasSize; // atlas cell size (normalized)
out vec4 v_color;
out float v_fade;
out vec2 v_stampPos;   // stamp world position for per-stamp jitter

void main() {
    float age = a_life.x;
    float lifetime = a_life.y;

    // Compute fade: ramp in over first 5 frames, ramp out over last 30
    float fadeIn = clamp(age / 5.0, 0.0, 1.0);
    float remaining = lifetime - age;
    float fadeOut = (lifetime > 9999.0) ? 1.0 : clamp(remaining / 30.0, 0.0, 1.0);
    v_fade = fadeIn * fadeOut;

    // Skip dead stamps
    if (v_fade <= 0.0) {
        gl_Position = vec4(2.0, 2.0, 0.0, 1.0); // off-screen
        return;
    }

    // Rotate and scale the quad
    float c = cos(a_rot);
    float s = sin(a_rot);
    mat2 rot = mat2(c, s, -s, c);
    vec2 scaled = a_quadPos * a_scale;
    vec2 rotated = rot * scaled;
    vec2 worldPos = a_pos + rotated;

    // Convert to clip space (0,0 = top-left, w,h = bottom-right)
    vec2 ndc = (worldPos / u_resolution) * 2.0 - 1.0;
    ndc.y = -ndc.y; // flip Y for canvas coords
    gl_Position = vec4(ndc, 0.0, 1.0);

    v_uv = a_quadPos * 0.5 + 0.5; // [-1,1] → [0,1]
    v_atlasUV = a_tex.xy;
    v_atlasSize = a_tex.z;
    v_color = a_color;
    v_stampPos = a_pos;
}
`;

const STAMP_FRAG = `#version 300 es
precision highp float;

in vec2 v_uv;
in vec2 v_atlasUV;
in float v_atlasSize;
in vec4 v_color;
in float v_fade;
in vec2 v_stampPos;

uniform sampler2D u_atlas;
uniform sampler2D u_grain;
uniform float u_grainStrength;
uniform vec2 u_grainOffset;
uniform float u_colorJitter;

// Pseudo-random hash for per-stamp variation
float hash(vec2 p) {
    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}

out vec4 fragColor;

void main() {
    if (v_fade <= 0.0) discard;

    // Sample brush tip from atlas
    vec2 atlasCoord = v_atlasUV + v_uv * v_atlasSize;
    float tipAlpha = texture(u_atlas, atlasCoord).r;

    // Sample grain texture (tiled) — visible paper texture
    vec2 grainCoord = gl_FragCoord.xy / 256.0 + u_grainOffset;
    float grainRaw = texture(u_grain, grainCoord).r;
    // Remap for more contrast: range [0.2, 1.0] instead of [0, 1]
    float grain = 0.2 + grainRaw * 0.8;
    float grainMod = mix(1.0, grain, u_grainStrength);

    float alpha = tipAlpha * v_color.a * v_fade * grainMod;

    if (alpha < 0.003) discard;

    // Per-stamp color jitter — different offset per RGB channel
    float jr = (hash(v_stampPos) - 0.5) * u_colorJitter;
    float jg = (hash(v_stampPos * 1.371) - 0.5) * u_colorJitter;
    float jb = (hash(v_stampPos * 2.417) - 0.5) * u_colorJitter;
    vec3 col = clamp(v_color.rgb + vec3(jr, jg, jb), 0.0, 1.0);

    fragColor = vec4(col * alpha, alpha);
}
`;

// Composite shader: renders a layer FBO to screen
const COMPOSITE_VERT = `#version 300 es
precision highp float;
layout(location = 0) in vec2 a_pos;
out vec2 v_uv;
void main() {
    v_uv = a_pos * 0.5 + 0.5;
    gl_Position = vec4(a_pos, 0.0, 1.0);
}
`;

const COMPOSITE_FRAG = `#version 300 es
precision highp float;
in vec2 v_uv;
uniform sampler2D u_layer;
uniform float u_opacity;
out vec4 fragColor;
void main() {
    vec4 col = texture(u_layer, v_uv);
    fragColor = col * u_opacity;
}
`;

// ═══════════════════════════════════════════════════════════════
//  UTILITY
// ═══════════════════════════════════════════════════════════════

/** Parse hex color string to [r, g, b] floats (0-1). */
function hexToRGB(hex) {
    hex = hex.replace('#', '');
    if (hex.length === 3) hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
    const n = parseInt(hex, 16);
    return [(n >> 16 & 255) / 255, (n >> 8 & 255) / 255, (n & 255) / 255];
}

/** Compile a WebGL shader. */
function compileShader(gl, type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        const log = gl.getShaderInfoLog(s);
        gl.deleteShader(s);
        throw new Error('Shader compile error: ' + log);
    }
    return s;
}

/** Link a WebGL program from vertex + fragment shaders. */
function linkProgram(gl, vs, fs) {
    const p = gl.createProgram();
    gl.attachShader(p, vs);
    gl.attachShader(p, fs);
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
        const log = gl.getProgramInfoLog(p);
        gl.deleteProgram(p);
        throw new Error('Program link error: ' + log);
    }
    return p;
}

// ═══════════════════════════════════════════════════════════════
//  PROCEDURAL BRUSH TIPS — Gaussian falloff + organic edges
// ═══════════════════════════════════════════════════════════════

const BUILTIN_TIPS = {

    /** Soft round — very soft Gaussian radial falloff, the workhorse watercolor stamp.
     *  Uses a gentler falloff (sigma=2.0) so overlapping stamps blend smoothly
     *  instead of showing hard edges. */
    soft_round(ctx, size) {
        const cx = size / 2, cy = size / 2, r = size / 2 - 1;
        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
        // Gentler Gaussian: e^(-2.0 * t^2) — softer edges for better overlap blending
        for (let i = 0; i <= 24; i++) {
            const t = i / 24;
            const a = Math.exp(-2.0 * t * t);
            g.addColorStop(t, `rgba(255,255,255,${a.toFixed(4)})`);
        }
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();
    },

    /** Pointed leaf — organic wobbled edges with multi-pass softness. */
    pointed_leaf(ctx, size) {
        const cx = size / 2, cy = size / 2;
        const hw = size * 0.24, hh = size * 0.45;
        ctx.save();
        ctx.translate(cx, cy);

        // 3 passes: outer halo, mid body, inner core
        const passes = [
            { scale: 1.18, alpha: 0.12 },
            { scale: 1.0,  alpha: 0.35 },
            { scale: 0.78, alpha: 0.55 }
        ];

        for (const p of passes) {
            const s = p.scale;
            // Organic wobble on bezier control points
            const w = () => (Math.random() - 0.5) * size * 0.03;

            ctx.beginPath();
            ctx.moveTo(w(), -hh * s + w());
            ctx.bezierCurveTo(
                hw * 1.5 * s + w(), -hh * 0.4 * s + w(),
                hw * 1.5 * s + w(), hh * 0.4 * s + w(),
                w(), hh * s + w()
            );
            ctx.bezierCurveTo(
                -hw * 1.5 * s + w(), hh * 0.4 * s + w(),
                -hw * 1.5 * s + w(), -hh * 0.4 * s + w(),
                w(), -hh * s + w()
            );
            ctx.closePath();

            const g = ctx.createRadialGradient(0, 0, 0, 0, 0, hh * s * 1.1);
            for (let i = 0; i <= 12; i++) {
                const t = i / 12;
                const a = p.alpha * Math.exp(-2.8 * t * t);
                g.addColorStop(t, `rgba(255,255,255,${a.toFixed(4)})`);
            }
            ctx.fillStyle = g;
            ctx.fill();
        }
        ctx.restore();
    },

    /** Petal — wide ogee/almond with Gaussian falloff and multi-pass bleed. */
    petal(ctx, size) {
        const cx = size / 2, cy = size / 2;
        const hw = size * 0.34, hh = size * 0.42;
        ctx.save();
        ctx.translate(cx, cy);

        // 3 passes for watercolor edge bleed
        const passes = [
            { scale: 1.2,  alpha: 0.10 },
            { scale: 1.0,  alpha: 0.40 },
            { scale: 0.75, alpha: 0.65 }
        ];

        for (const p of passes) {
            const s = p.scale;
            ctx.beginPath();
            ctx.moveTo(0, -hh * s);
            ctx.bezierCurveTo(hw * 2.2 * s, -hh * 0.2 * s, hw * 2.2 * s, hh * 0.2 * s, 0, hh * s);
            ctx.bezierCurveTo(-hw * 2.2 * s, hh * 0.2 * s, -hw * 2.2 * s, -hh * 0.2 * s, 0, -hh * s);
            ctx.closePath();

            const g = ctx.createRadialGradient(0, -hh * 0.1, 0, 0, 0, hh * s * 1.1);
            for (let i = 0; i <= 12; i++) {
                const t = i / 12;
                const a = p.alpha * Math.exp(-2.5 * t * t);
                g.addColorStop(t, `rgba(255,255,255,${a.toFixed(4)})`);
            }
            ctx.fillStyle = g;
            ctx.fill();
        }
        ctx.restore();
    },

    /** Spray — scattered soft dots for pollen/atmosphere. */
    spray(ctx, size) {
        const cx = size / 2, cy = size / 2, r = size / 2 - 4;
        for (let i = 0; i < 50; i++) {
            const a = Math.random() * Math.PI * 2;
            const d = Math.pow(Math.random(), 0.7) * r; // cluster toward center
            const dr = 1.5 + Math.random() * 3.5;
            const alpha = 0.15 + Math.random() * 0.5;

            // Each dot gets a small Gaussian gradient
            const dx = cx + Math.cos(a) * d;
            const dy = cy + Math.sin(a) * d;
            const g = ctx.createRadialGradient(dx, dy, 0, dx, dy, dr);
            g.addColorStop(0, `rgba(255,255,255,${alpha})`);
            g.addColorStop(0.5, `rgba(255,255,255,${(alpha * 0.4).toFixed(3)})`);
            g.addColorStop(1, 'rgba(255,255,255,0)');
            ctx.fillStyle = g;
            ctx.beginPath();
            ctx.arc(dx, dy, dr, 0, Math.PI * 2);
            ctx.fill();
        }
    },

    /** Hatch line — thin tapered stroke with Gaussian along length. */
    hatch_line(ctx, size) {
        const cx = size / 2, cy = size / 2;
        const hw = size * 0.04, hh = size * 0.45;
        ctx.save();
        ctx.translate(cx, cy);

        ctx.beginPath();
        ctx.moveTo(0, -hh);
        ctx.bezierCurveTo(hw, -hh * 0.7, hw, hh * 0.7, 0, hh);
        ctx.bezierCurveTo(-hw, hh * 0.7, -hw, -hh * 0.7, 0, -hh);
        ctx.closePath();

        const g = ctx.createLinearGradient(0, -hh, 0, hh);
        // Gaussian taper at both ends
        g.addColorStop(0, 'rgba(255,255,255,0)');
        g.addColorStop(0.08, 'rgba(255,255,255,0.3)');
        g.addColorStop(0.2, 'rgba(255,255,255,0.8)');
        g.addColorStop(0.5, 'rgba(255,255,255,1)');
        g.addColorStop(0.8, 'rgba(255,255,255,0.8)');
        g.addColorStop(0.92, 'rgba(255,255,255,0.3)');
        g.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = g;
        ctx.fill();
        ctx.restore();
    },

    /** Thorn — sharp triangle with soft gradient falloff. */
    thorn(ctx, size) {
        const cx = size / 2, cy = size / 2;
        const hw = size * 0.15, hh = size * 0.45;
        ctx.save();
        ctx.translate(cx, cy);

        // Two passes: outer glow + inner shape
        for (let pass = 0; pass < 2; pass++) {
            const s = pass === 0 ? 1.15 : 1.0;
            const alpha = pass === 0 ? 0.2 : 0.7;

            ctx.beginPath();
            ctx.moveTo(0, -hh * s);
            ctx.lineTo(hw * s, hh * 0.6 * s);
            ctx.lineTo(-hw * s, hh * 0.6 * s);
            ctx.closePath();

            const g = ctx.createLinearGradient(0, -hh * s, 0, hh * 0.6 * s);
            g.addColorStop(0, `rgba(255,255,255,${alpha})`);
            g.addColorStop(0.5, `rgba(255,255,255,${(alpha * 0.7).toFixed(3)})`);
            g.addColorStop(0.85, `rgba(255,255,255,${(alpha * 0.25).toFixed(3)})`);
            g.addColorStop(1, 'rgba(255,255,255,0)');
            ctx.fillStyle = g;
            ctx.fill();
        }
        ctx.restore();
    },

    /** Bud — teardrop with Gaussian softness and multi-pass bleed. */
    bud(ctx, size) {
        const cx = size / 2, cy = size / 2;
        const hw = size * 0.28, hh = size * 0.42;
        ctx.save();
        ctx.translate(cx, cy);

        const passes = [
            { scale: 1.15, alpha: 0.12 },
            { scale: 1.0,  alpha: 0.4 },
            { scale: 0.8,  alpha: 0.6 }
        ];

        for (const p of passes) {
            const s = p.scale;
            ctx.beginPath();
            ctx.moveTo(0, -hh * s);
            ctx.bezierCurveTo(hw * 1.8 * s, -hh * 0.2 * s, hw * 1.5 * s, hh * 0.8 * s, 0, hh * s);
            ctx.bezierCurveTo(-hw * 1.5 * s, hh * 0.8 * s, -hw * 1.8 * s, -hh * 0.2 * s, 0, -hh * s);
            ctx.closePath();

            const g = ctx.createRadialGradient(0, -hh * 0.2, 0, 0, 0, hh * s * 1.1);
            for (let i = 0; i <= 10; i++) {
                const t = i / 10;
                const a = p.alpha * Math.exp(-2.5 * t * t);
                g.addColorStop(t, `rgba(255,255,255,${a.toFixed(4)})`);
            }
            ctx.fillStyle = g;
            ctx.fill();
        }
        ctx.restore();
    }
};

// ═══════════════════════════════════════════════════════════════
//  STAMP GRAIN — noise-based opacity variation within each tip
// ═══════════════════════════════════════════════════════════════

/** Apply paper grain noise to a canvas cell, modulating alpha for absorption. */
function applyGrainToCell(ctx, ox, oy, size, strength) {
    const imgData = ctx.getImageData(ox, oy, size, size);
    const d = imgData.data;

    // Generate noise field
    const noise = new Float32Array(size * size);
    for (let i = 0; i < noise.length; i++) noise[i] = Math.random();

    // Box blur for smooth grain (kernel radius 2)
    const blurred = new Float32Array(size * size);
    const k = 2;
    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            let sum = 0, cnt = 0;
            for (let dy = -k; dy <= k; dy++) {
                for (let dx = -k; dx <= k; dx++) {
                    const ny = y + dy, nx = x + dx;
                    if (ny >= 0 && ny < size && nx >= 0 && nx < size) {
                        sum += noise[ny * size + nx]; cnt++;
                    }
                }
            }
            blurred[y * size + x] = sum / cnt;
        }
    }

    // Modulate alpha — simulates uneven paper absorption
    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            const i = (y * size + x) * 4;
            if (d[i + 3] === 0) continue;
            const n = blurred[y * size + x];
            const mod = 1.0 - strength + strength * n;
            d[i + 3] = Math.min(255, Math.round(d[i + 3] * mod));
        }
    }

    ctx.putImageData(imgData, ox, oy);
}

// ═══════════════════════════════════════════════════════════════
//  FATIHA BRUSH — MAIN CLASS
// ═══════════════════════════════════════════════════════════════

class FatihaBrush {

    /**
     * @param {HTMLCanvasElement} canvas
     * @param {Object} opts
     * @param {number} [opts.maxStamps=4096] — ring buffer capacity
     * @param {string[]} [opts.layers=['default']] — layer names, composited in order
     * @param {string} [opts.background='#000000'] — background color hex
     * @param {number} [opts.width] — canvas width (defaults to canvas.width)
     * @param {number} [opts.height] — canvas height (defaults to canvas.height)
     * @param {number} [opts.grainStrength=0.5] — grain texture intensity (0-1)
     * @param {number} [opts.colorJitter=0.06] — per-stamp RGB jitter (0-1, ±range)
     */
    constructor(canvas, opts = {}) {
        this.canvas = canvas;
        this.maxStamps = opts.maxStamps || 4096;
        this.layerNames = opts.layers || ['default'];
        this.background = opts.background || '#000000';
        this.grainStrength = opts.grainStrength !== undefined ? opts.grainStrength : 0.5;
        this.colorJitter = opts.colorJitter !== undefined ? opts.colorJitter : 0.06;

        this.width = opts.width || canvas.width;
        this.height = opts.height || canvas.height;
        canvas.width = this.width;
        canvas.height = this.height;

        // Audio reactive parameter bus
        this.audio = { amplitude: 0, energy: 0, smoothing: 0.12 };

        // Tip registry: name → { index, drawFn }
        this._tips = new Map();
        this._tipList = []; // ordered list for atlas building

        // Stamp storage: per-layer arrays
        this._layers = {};
        for (const name of this.layerNames) {
            this._layers[name] = {
                stamps: new Float32Array(this.maxStamps * FLOATS_PER_STAMP),
                count: 0,
                head: 0,       // ring buffer write head
                opacity: 1.0,
                blend: 'alpha', // 'alpha' or 'additive'
                dirty: true,
                fbo: null,
                texture: null
            };
        }

        // Register built-in tips
        for (const [name, fn] of Object.entries(BUILTIN_TIPS)) {
            this.registerTip(name, fn);
        }

        // Init WebGL
        this._initGL();
        this._initShaders();
        this._initGeometry();
        this._buildAtlas();
        this._buildGrain();
        this._initLayers();
        this._initMixbox();

        // Frame counter for grain animation
        this._frame = 0;
    }

    // ─── TEXTURE ATLAS ───────────────────────────────────────

    /**
     * Register a custom brush tip.
     * @param {string} name — unique tip name
     * @param {function} drawFn — function(ctx, cellSize) that draws white-on-transparent
     */
    registerTip(name, drawFn) {
        const index = this._tipList.length;
        this._tips.set(name, { index, drawFn });
        this._tipList.push({ name, drawFn });
    }

    /** Get atlas UV coordinates for a tip name. Returns { u, v, size }. */
    _getUV(name) {
        const tip = this._tips.get(name);
        if (!tip) {
            console.warn(`FatihaBrush: unknown tip "${name}", falling back to soft_round`);
            return this._getUV('soft_round');
        }
        const col = tip.index % ATLAS_COLS;
        const row = Math.floor(tip.index / ATLAS_COLS);
        const atlasW = ATLAS_COLS * ATLAS_CELL;
        const atlasH = Math.ceil(this._tipList.length / ATLAS_COLS) * ATLAS_CELL;
        return {
            u: (col * ATLAS_CELL) / atlasW,
            v: (row * ATLAS_CELL) / atlasH,
            size: ATLAS_CELL / atlasW // assumes square cells in a wider atlas
        };
    }

    /** Build the texture atlas from all registered tips, with per-cell grain noise. */
    _buildAtlas() {
        const gl = this.gl;
        const cols = ATLAS_COLS;
        const rows = Math.ceil(this._tipList.length / cols);
        const atlasW = cols * ATLAS_CELL;
        const atlasH = rows * ATLAS_CELL;

        const c = document.createElement('canvas');
        c.width = atlasW;
        c.height = atlasH;
        const ctx = c.getContext('2d');

        for (let i = 0; i < this._tipList.length; i++) {
            const col = i % cols;
            const row = Math.floor(i / cols);
            const ox = col * ATLAS_CELL;
            const oy = row * ATLAS_CELL;

            ctx.save();
            ctx.translate(ox, oy);
            ctx.clearRect(0, 0, ATLAS_CELL, ATLAS_CELL);
            this._tipList[i].drawFn(ctx, ATLAS_CELL);
            ctx.restore();

            // Apply paper grain noise to this cell — simulates uneven ink absorption
            applyGrainToCell(ctx, ox, oy, ATLAS_CELL, 0.3);
        }

        // Upload to WebGL
        this._atlasTex = gl.createTexture();
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this._atlasTex);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, c);

        this._atlasWidth = atlasW;
        this._atlasHeight = atlasH;
    }

    /** Build multi-octave grain noise texture for paper feel. */
    _buildGrain() {
        const gl = this.gl;
        const size = GRAIN_SIZE;

        // Helper: box blur with wrapping
        const blur = (src, radius) => {
            const dst = new Float32Array(size * size);
            for (let y = 0; y < size; y++) {
                for (let x = 0; x < size; x++) {
                    let sum = 0, cnt = 0;
                    for (let dy = -radius; dy <= radius; dy++) {
                        for (let dx = -radius; dx <= radius; dx++) {
                            const ny = (y + dy + size) % size;
                            const nx = (x + dx + size) % size;
                            sum += src[ny * size + nx]; cnt++;
                        }
                    }
                    dst[y * size + x] = sum / cnt;
                }
            }
            return dst;
        };

        // Octave 1: coarse paper fiber
        const raw1 = new Float32Array(size * size);
        for (let i = 0; i < raw1.length; i++) raw1[i] = Math.random();
        const coarse = blur(raw1, 4);

        // Octave 2: fine grain detail
        const raw2 = new Float32Array(size * size);
        for (let i = 0; i < raw2.length; i++) raw2[i] = Math.random();
        const fine = blur(raw2, 1);

        // Combine: 65% coarse + 35% fine, with contrast boost
        const result = new Uint8Array(size * size);
        for (let i = 0; i < result.length; i++) {
            const v = coarse[i] * 0.65 + fine[i] * 0.35;
            // Slight contrast boost via power curve
            const c = Math.pow(v, 0.85);
            result[i] = Math.round(c * 255);
        }

        this._grainTex = gl.createTexture();
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, this._grainTex);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, size, size, 0,
                       gl.LUMINANCE, gl.UNSIGNED_BYTE, result);
    }

    // ─── WEBGL INIT ──────────────────────────────────────────

    _initGL() {
        const gl = this.canvas.getContext('webgl2', {
            alpha: false,
            premultipliedAlpha: false,
            antialias: false,
            preserveDrawingBuffer: true
        });
        if (!gl) throw new Error('FatihaBrush: WebGL2 not supported');
        this.gl = gl;

        gl.enable(gl.BLEND);
        gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA); // premultiplied alpha
        gl.disable(gl.DEPTH_TEST);

        // Set clear color from background
        const bg = hexToRGB(this.background);
        gl.clearColor(bg[0], bg[1], bg[2], 1.0);
    }

    _initShaders() {
        const gl = this.gl;

        // Stamp shader program
        const svs = compileShader(gl, gl.VERTEX_SHADER, STAMP_VERT);
        const sfs = compileShader(gl, gl.FRAGMENT_SHADER, STAMP_FRAG);
        this._stampProg = linkProgram(gl, svs, sfs);
        gl.deleteShader(svs);
        gl.deleteShader(sfs);

        this._uResolution = gl.getUniformLocation(this._stampProg, 'u_resolution');
        this._uAtlas = gl.getUniformLocation(this._stampProg, 'u_atlas');
        this._uGrain = gl.getUniformLocation(this._stampProg, 'u_grain');
        this._uGrainStrength = gl.getUniformLocation(this._stampProg, 'u_grainStrength');
        this._uGrainOffset = gl.getUniformLocation(this._stampProg, 'u_grainOffset');
        this._uColorJitter = gl.getUniformLocation(this._stampProg, 'u_colorJitter');

        // Composite shader program
        const cvs = compileShader(gl, gl.VERTEX_SHADER, COMPOSITE_VERT);
        const cfs = compileShader(gl, gl.FRAGMENT_SHADER, COMPOSITE_FRAG);
        this._compositeProg = linkProgram(gl, cvs, cfs);
        gl.deleteShader(cvs);
        gl.deleteShader(cfs);

        this._uCompLayer = gl.getUniformLocation(this._compositeProg, 'u_layer');
        this._uCompOpacity = gl.getUniformLocation(this._compositeProg, 'u_opacity');
    }

    _initGeometry() {
        const gl = this.gl;

        // Unit quad: two triangles covering [-1, -1] to [1, 1]
        const quadVerts = new Float32Array([
            -1, -1,   1, -1,   1,  1,
            -1, -1,   1,  1,  -1,  1
        ]);

        this._quadVBO = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this._quadVBO);
        gl.bufferData(gl.ARRAY_BUFFER, quadVerts, gl.STATIC_DRAW);

        // Per-layer instance buffers + VAOs
        for (const name of this.layerNames) {
            const layer = this._layers[name];
            layer.vao = gl.createVertexArray();
            layer.instanceVBO = gl.createBuffer();

            gl.bindVertexArray(layer.vao);

            // Quad geometry attribute (location 0)
            gl.bindBuffer(gl.ARRAY_BUFFER, this._quadVBO);
            gl.enableVertexAttribArray(0);
            gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

            // Instance buffer
            gl.bindBuffer(gl.ARRAY_BUFFER, layer.instanceVBO);
            gl.bufferData(gl.ARRAY_BUFFER, layer.stamps.byteLength, gl.DYNAMIC_DRAW);

            // Instance attributes (locations 1-6)
            const stride = FLOATS_PER_STAMP * 4;

            // a_pos (vec2) — offset 0
            gl.enableVertexAttribArray(1);
            gl.vertexAttribPointer(1, 2, gl.FLOAT, false, stride, 0);
            gl.vertexAttribDivisor(1, 1);

            // a_rot (float) — offset 8
            gl.enableVertexAttribArray(2);
            gl.vertexAttribPointer(2, 1, gl.FLOAT, false, stride, 8);
            gl.vertexAttribDivisor(2, 1);

            // a_scale (vec2) — offset 12
            gl.enableVertexAttribArray(3);
            gl.vertexAttribPointer(3, 2, gl.FLOAT, false, stride, 12);
            gl.vertexAttribDivisor(3, 1);

            // a_color (vec4) — offset 20
            gl.enableVertexAttribArray(4);
            gl.vertexAttribPointer(4, 4, gl.FLOAT, false, stride, 20);
            gl.vertexAttribDivisor(4, 1);

            // a_tex (vec3) — offset 36
            gl.enableVertexAttribArray(5);
            gl.vertexAttribPointer(5, 3, gl.FLOAT, false, stride, 36);
            gl.vertexAttribDivisor(5, 1);

            // a_life (vec2) — offset 48
            gl.enableVertexAttribArray(6);
            gl.vertexAttribPointer(6, 2, gl.FLOAT, false, stride, 48);
            gl.vertexAttribDivisor(6, 1);

            gl.bindVertexArray(null);
        }

        // Fullscreen quad for compositing
        this._fsQuadVAO = gl.createVertexArray();
        gl.bindVertexArray(this._fsQuadVAO);
        gl.bindBuffer(gl.ARRAY_BUFFER, this._quadVBO);
        gl.enableVertexAttribArray(0);
        gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
        gl.bindVertexArray(null);
    }

    _initLayers() {
        const gl = this.gl;
        for (const name of this.layerNames) {
            const layer = this._layers[name];
            layer.fbo = gl.createFramebuffer();
            layer.texture = gl.createTexture();

            gl.bindTexture(gl.TEXTURE_2D, layer.texture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this.width, this.height, 0,
                           gl.RGBA, gl.UNSIGNED_BYTE, null);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

            gl.bindFramebuffer(gl.FRAMEBUFFER, layer.fbo);
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0,
                                     gl.TEXTURE_2D, layer.texture, 0);

            // Clear layer
            gl.clearColor(0, 0, 0, 0);
            gl.clear(gl.COLOR_BUFFER_BIT);
        }
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);

        // Restore background clear color
        const bg = hexToRGB(this.background);
        gl.clearColor(bg[0], bg[1], bg[2], 1.0);
    }

    // ─── MIXBOX PIGMENT BLENDING ─────────────────────────────

    _initMixbox() {
        this._hasMixbox = false;
        if (typeof mixbox === 'undefined') return;

        const gl = this.gl;

        try {
            // Get Mixbox LUT texture
            this._mixboxLUT = mixbox.lutTexture(gl);

            // Build Mixbox compositing fragment shader at runtime
            // (mixbox.glsl() provides the GLSL code including mixbox_lut uniform)
            const fragSrc = `#version 300 es
precision highp float;
#define texture2D texture

in vec2 v_uv;
uniform sampler2D u_accumulation;
uniform sampler2D u_layer;
uniform float u_opacity;
uniform int u_additive;

${mixbox.glsl()}

out vec4 fragColor;

void main() {
    vec4 acc = texture(u_accumulation, v_uv);
    vec4 layer = texture(u_layer, v_uv);

    float layerAlpha = layer.a * u_opacity;

    if (layerAlpha < 0.001) {
        fragColor = acc;
        return;
    }

    // Unpremultiply layer color (stamps output premultiplied alpha)
    vec3 layerRGB = layer.rgb / max(layer.a, 0.001);

    if (u_additive == 1) {
        // Additive (glow) layers — skip pigment mixing
        fragColor = vec4(clamp(acc.rgb + layerRGB * layerAlpha, 0.0, 1.0), 1.0);
        return;
    }

    // Pigment-based blend using Mixbox Kubelka-Munk model
    vec3 mixed = mixbox_lerp(acc.rgb, layerRGB, layerAlpha);
    fragColor = vec4(mixed, 1.0);
}`;

            const vs = compileShader(gl, gl.VERTEX_SHADER, COMPOSITE_VERT);
            const fs = compileShader(gl, gl.FRAGMENT_SHADER, fragSrc);
            this._mixboxProg = linkProgram(gl, vs, fs);
            gl.deleteShader(vs);
            gl.deleteShader(fs);

            this._uMixAcc = gl.getUniformLocation(this._mixboxProg, 'u_accumulation');
            this._uMixLayer = gl.getUniformLocation(this._mixboxProg, 'u_layer');
            this._uMixOpacity = gl.getUniformLocation(this._mixboxProg, 'u_opacity');
            this._uMixAdditive = gl.getUniformLocation(this._mixboxProg, 'u_additive');
            this._uMixboxLUT = gl.getUniformLocation(this._mixboxProg, 'mixbox_lut');

            // Create ping-pong accumulation FBOs for Mixbox compositing
            this._accFBOs = [null, null];
            this._accTextures = [null, null];
            for (let i = 0; i < 2; i++) {
                this._accFBOs[i] = gl.createFramebuffer();
                this._accTextures[i] = gl.createTexture();

                gl.bindTexture(gl.TEXTURE_2D, this._accTextures[i]);
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this.width, this.height, 0,
                               gl.RGBA, gl.UNSIGNED_BYTE, null);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

                gl.bindFramebuffer(gl.FRAMEBUFFER, this._accFBOs[i]);
                gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0,
                                         gl.TEXTURE_2D, this._accTextures[i], 0);
            }
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);

            // Restore default clear color
            const bg = hexToRGB(this.background);
            gl.clearColor(bg[0], bg[1], bg[2], 1.0);

            this._hasMixbox = true;
            console.log('FatihaBrush: Mixbox pigment blending enabled');

        } catch (e) {
            console.warn('FatihaBrush: Mixbox init failed, using standard blending:', e);
            this._hasMixbox = false;
        }
    }

    // ─── STAMP MANAGEMENT ────────────────────────────────────

    /**
     * Add a single stamp.
     * @param {Object} opts
     * @param {number} opts.x — x position
     * @param {number} opts.y — y position
     * @param {number} [opts.rotation=0] — rotation in radians
     * @param {number} [opts.scaleX=10] — half-width in pixels
     * @param {number} [opts.scaleY=10] — half-height in pixels
     * @param {number} [opts.r=1] — red (0-1)
     * @param {number} [opts.g=1] — green (0-1)
     * @param {number} [opts.b=1] — blue (0-1)
     * @param {number} [opts.a=1] — alpha (0-1)
     * @param {string} [opts.color] — hex color string (overrides r/g/b)
     * @param {string} [opts.texture='soft_round'] — brush tip name
     * @param {string} [opts.layer='default'] — layer name
     * @param {number} [opts.lifetime=Infinity] — frames until removal
     * @param {number} [opts.jitter=0] — random position offset
     */
    addStamp(opts) {
        const layerName = opts.layer || this.layerNames[0];
        const layer = this._layers[layerName];
        if (!layer) {
            console.warn(`FatihaBrush: unknown layer "${layerName}"`);
            return;
        }

        const idx = layer.head;
        const off = idx * FLOATS_PER_STAMP;

        // Parse color
        let r = opts.r !== undefined ? opts.r : 1;
        let g = opts.g !== undefined ? opts.g : 1;
        let b = opts.b !== undefined ? opts.b : 1;
        if (opts.color) {
            const rgb = hexToRGB(opts.color);
            r = rgb[0]; g = rgb[1]; b = rgb[2];
        }

        const jitter = opts.jitter || 0;
        const jx = jitter ? (Math.random() - 0.5) * jitter : 0;
        const jy = jitter ? (Math.random() - 0.5) * jitter : 0;

        // Get atlas UV
        const uv = this._getUV(opts.texture || 'soft_round');

        const stamps = layer.stamps;
        stamps[off + 0] = (opts.x || 0) + jx;           // x
        stamps[off + 1] = (opts.y || 0) + jy;           // y
        stamps[off + 2] = opts.rotation || 0;             // rotation
        stamps[off + 3] = opts.scaleX !== undefined ? opts.scaleX : 10;  // scaleX
        stamps[off + 4] = opts.scaleY !== undefined ? opts.scaleY : 10;  // scaleY
        stamps[off + 5] = r;                              // r
        stamps[off + 6] = g;                              // g
        stamps[off + 7] = b;                              // b
        stamps[off + 8] = opts.a !== undefined ? opts.a : 1;  // a
        stamps[off + 9] = uv.u;                           // texU
        stamps[off + 10] = uv.v;                          // texV
        stamps[off + 11] = uv.size;                       // texSize
        stamps[off + 12] = 0;                             // age
        stamps[off + 13] = opts.lifetime !== undefined ? opts.lifetime : 99999; // lifetime

        layer.head = (idx + 1) % this.maxStamps;
        if (layer.count < this.maxStamps) layer.count++;
        layer.dirty = true;
    }

    /**
     * Add multiple stamps at once.
     * @param {Object[]} arr — array of stamp option objects
     */
    addStamps(arr) {
        for (let i = 0; i < arr.length; i++) {
            this.addStamp(arr[i]);
        }
    }

    /**
     * Add a soft watercolor wash — multiple overlapping soft_round stamps
     * with random offset to simulate watercolor bleed.
     * @param {Object} opts — same as addStamp, plus:
     * @param {number} [opts.bleed=8] — number of overlapping stamps
     * @param {number} [opts.bleedRadius=5] — max random offset
     */
    addWash(opts) {
        const count = opts.bleed || 8;
        const radius = opts.bleedRadius || 5;
        const baseA = (opts.a !== undefined ? opts.a : 0.3) / Math.sqrt(count);

        for (let i = 0; i < count; i++) {
            this.addStamp({
                ...opts,
                texture: 'soft_round',
                a: baseA * (0.5 + Math.random() * 0.5),
                jitter: radius,
                scaleX: (opts.scaleX || 10) * (0.85 + Math.random() * 0.3),
                scaleY: (opts.scaleY || 10) * (0.85 + Math.random() * 0.3),
                rotation: (opts.rotation || 0) + (Math.random() - 0.5) * 0.3
            });
        }
    }

    /**
     * Add hatch lines inside a circle region.
     * @param {number} cx — center x
     * @param {number} cy — center y
     * @param {number} radius — region radius
     * @param {number} angle — hatch angle in radians
     * @param {number} spacing — distance between lines
     * @param {Object} opts — stamp options for line appearance
     */
    addHatch(cx, cy, radius, angle, spacing, opts = {}) {
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        const lineLen = radius * 1.6;

        for (let d = -radius; d <= radius; d += spacing) {
            // Line center offset perpendicular to hatch angle
            const lx = cx + sin * d;
            const ly = cy - cos * d;

            // Clip to circle
            const dist = Math.abs(d);
            if (dist > radius) continue;
            const halfChord = Math.sqrt(radius * radius - dist * dist);
            const lineScale = halfChord / (lineLen * 0.5);

            this.addStamp({
                x: lx,
                y: ly,
                rotation: angle,
                scaleX: 1.5 + (opts.weight || 0),
                scaleY: halfChord * (0.8 + Math.random() * 0.2),
                color: opts.color || '#000000',
                a: (opts.a || 0.4) * (0.7 + Math.random() * 0.3),
                texture: 'hatch_line',
                layer: opts.layer || this.layerNames[0],
                lifetime: opts.lifetime || 99999,
                jitter: spacing * 0.15
            });
        }
    }

    // ─── STROKE RENDERING (p5.brush-style) ─────────────────

    /**
     * Draw a continuous stroke along a path — the core organic rendering technique.
     * Places densely overlapping stamps along the path with:
     *   - Gaussian pressure curve (natural tapering at start/end)
     *   - Direction-aware perpendicular jitter (scatter)
     *   - Per-stamp opacity and size randomization
     *   - Probabilistic stamp skipping for grain texture
     *
     * @param {Array<{x:number, y:number}>} points — path points
     * @param {Object} opts
     * @param {string} [opts.color='#ffffff'] — stroke color
     * @param {number} [opts.weight=4] — base stroke weight (radius in px)
     * @param {number} [opts.alpha=0.3] — base opacity per stamp
     * @param {string} [opts.texture='soft_round'] — brush tip name
     * @param {string} [opts.layer] — layer name
     * @param {number} [opts.spacing=0.35] — stamp spacing as fraction of weight (smaller = denser)
     * @param {number} [opts.scatter=0.3] — perpendicular jitter as fraction of weight
     * @param {number} [opts.grain=0.7] — probability of placing each stamp (0-1, lower = sketchier)
     * @param {number} [opts.pressureStart=0.15] — pressure at stroke start (0-1)
     * @param {number} [opts.pressureEnd=0.15] — pressure at stroke end (0-1)
     * @param {number} [opts.pressurePeak=1.0] — peak pressure (mid-stroke)
     * @param {number} [opts.pressureCenter=0.5] — where peak occurs (0-1 along stroke)
     * @param {number} [opts.alphaJitter=0.25] — per-stamp alpha randomization (±fraction)
     * @param {number} [opts.sizeJitter=0.15] — per-stamp size randomization (±fraction)
     * @param {number} [opts.lifetime=99999]
     */
    drawStroke(points, opts = {}) {
        if (!points || points.length < 2) return;

        const color = opts.color || '#ffffff';
        const weight = opts.weight || 4;
        const baseAlpha = opts.alpha !== undefined ? opts.alpha : 0.3;
        const texture = opts.texture || 'soft_round';
        const layer = opts.layer || this.layerNames[0];
        const spacing = (opts.spacing !== undefined ? opts.spacing : 0.35) * weight;
        const scatter = (opts.scatter !== undefined ? opts.scatter : 0.3) * weight;
        const grain = opts.grain !== undefined ? opts.grain : 0.7;
        const pStart = opts.pressureStart !== undefined ? opts.pressureStart : 0.15;
        const pEnd = opts.pressureEnd !== undefined ? opts.pressureEnd : 0.15;
        const pPeak = opts.pressurePeak !== undefined ? opts.pressurePeak : 1.0;
        const pCenter = opts.pressureCenter !== undefined ? opts.pressureCenter : 0.5;
        const alphaJit = opts.alphaJitter !== undefined ? opts.alphaJitter : 0.25;
        const sizeJit = opts.sizeJitter !== undefined ? opts.sizeJitter : 0.15;
        const lifetime = opts.lifetime !== undefined ? opts.lifetime : 99999;

        // Compute cumulative arc lengths
        const dists = [0];
        for (let i = 1; i < points.length; i++) {
            const dx = points[i].x - points[i - 1].x;
            const dy = points[i].y - points[i - 1].y;
            dists.push(dists[i - 1] + Math.sqrt(dx * dx + dy * dy));
        }
        const totalLen = dists[dists.length - 1];
        if (totalLen < 0.5) return;

        // Walk along the path at fixed spacing intervals
        const stepSize = Math.max(0.5, spacing);
        const totalSteps = Math.ceil(totalLen / stepSize);
        let ptIdx = 0; // current segment index

        for (let step = 0; step <= totalSteps; step++) {
            // Probabilistic grain: skip some stamps
            if (Math.random() > grain) continue;

            const d = step * stepSize;
            const t = d / totalLen; // 0-1 along stroke

            // Advance segment index
            while (ptIdx < points.length - 2 && dists[ptIdx + 1] < d) ptIdx++;

            // Interpolate position on segment
            const segLen = dists[ptIdx + 1] - dists[ptIdx];
            const segT = segLen > 0 ? (d - dists[ptIdx]) / segLen : 0;
            const x = points[ptIdx].x + (points[ptIdx + 1].x - points[ptIdx].x) * segT;
            const y = points[ptIdx].y + (points[ptIdx + 1].y - points[ptIdx].y) * segT;

            // Direction (tangent angle)
            const dx = points[ptIdx + 1].x - points[ptIdx].x;
            const dy = points[ptIdx + 1].y - points[ptIdx].y;
            const angle = Math.atan2(dy, dx);

            // Gaussian pressure curve: bell curve centered at pCenter
            const sigma = 0.4; // controls taper width
            const gx = (t - pCenter) / sigma;
            const gaussVal = Math.exp(-0.5 * gx * gx);
            // Blend between start/end pressure and peak
            const endLerp = t < pCenter
                ? pStart + (pPeak - pStart) * (gaussVal - Math.exp(-0.5 * (pCenter / sigma) ** 2)) / (1 - Math.exp(-0.5 * (pCenter / sigma) ** 2))
                : pEnd + (pPeak - pEnd) * (gaussVal - Math.exp(-0.5 * ((1 - pCenter) / sigma) ** 2)) / (1 - Math.exp(-0.5 * ((1 - pCenter) / sigma) ** 2));
            const pressure = Math.max(0.05, Math.min(1, endLerp));

            // Direction-aware perpendicular jitter (like p5.brush)
            const perpJit = (Math.random() * 2 - 1) * scatter * (1 / (pressure + 0.3));
            const alongJit = (Math.random() * 2 - 1) * scatter * 0.3;
            const perpX = -Math.sin(angle);
            const perpY = Math.cos(angle);
            const jx = perpX * perpJit + Math.cos(angle) * alongJit;
            const jy = perpY * perpJit + Math.sin(angle) * alongJit;

            // Per-stamp randomization
            const aRand = 1 + (Math.random() * 2 - 1) * alphaJit;
            const sRand = 1 + (Math.random() * 2 - 1) * sizeJit;
            const stampSize = weight * pressure * sRand;

            this.addStamp({
                x: x + jx,
                y: y + jy,
                color,
                a: baseAlpha * pressure * aRand,
                rotation: angle + (Math.random() - 0.5) * 0.3,
                scaleX: stampSize,
                scaleY: stampSize,
                texture,
                layer,
                lifetime
            });
        }
    }

    /**
     * Draw a straight line stroke between two points.
     * Convenience wrapper around drawStroke.
     */
    drawLine(x1, y1, x2, y2, opts = {}) {
        const steps = Math.max(2, Math.ceil(
            Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2) / 2
        ));
        const pts = [];
        for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            pts.push({ x: x1 + (x2 - x1) * t, y: y1 + (y2 - y1) * t });
        }
        this.drawStroke(pts, opts);
    }

    // ─── UPDATE ──────────────────────────────────────────────

    /**
     * Age all stamps. Call once per frame.
     * @param {number} [dt=1] — delta time in frames
     */
    update(dt = 1) {
        this._frame++;
        for (const name of this.layerNames) {
            const layer = this._layers[name];
            if (layer.count === 0) continue;

            const stamps = layer.stamps;
            let anyChanged = false;

            for (let i = 0; i < layer.count; i++) {
                const off = i * FLOATS_PER_STAMP;
                const age = stamps[off + 12];
                const lifetime = stamps[off + 13];

                if (age <= lifetime) {
                    stamps[off + 12] = age + dt;
                    anyChanged = true;
                }
            }

            if (anyChanged) layer.dirty = true;
        }
    }

    // ─── RENDER ──────────────────────────────────────────────

    /** Main render pass: draw all layers then composite to screen. */
    render() {
        const gl = this.gl;

        // Render each layer to its FBO
        gl.useProgram(this._stampProg);

        // Bind textures
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this._atlasTex);
        gl.uniform1i(this._uAtlas, 0);

        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, this._grainTex);
        gl.uniform1i(this._uGrain, 1);

        gl.uniform1f(this._uGrainStrength, this.grainStrength);
        gl.uniform1f(this._uColorJitter, this.colorJitter);
        // Slowly drift grain for organic feel
        gl.uniform2f(this._uGrainOffset,
            Math.sin(this._frame * 0.01) * 0.5,
            Math.cos(this._frame * 0.013) * 0.5
        );
        gl.uniform2f(this._uResolution, this.width, this.height);

        for (const name of this.layerNames) {
            this._renderLayer(name);
        }

        // Composite all layers to screen
        this._composeLayers();
    }

    _renderLayer(name) {
        const gl = this.gl;
        const layer = this._layers[name];
        if (layer.count === 0) return;

        // Upload instance data if changed
        if (layer.dirty) {
            gl.bindBuffer(gl.ARRAY_BUFFER, layer.instanceVBO);
            // Upload only the used portion
            const usedBytes = layer.count * FLOATS_PER_STAMP * 4;
            gl.bufferSubData(gl.ARRAY_BUFFER, 0,
                layer.stamps.subarray(0, layer.count * FLOATS_PER_STAMP));
            layer.dirty = false;
        }

        // Render to layer FBO (accumulate — don't clear)
        gl.bindFramebuffer(gl.FRAMEBUFFER, layer.fbo);
        gl.viewport(0, 0, this.width, this.height);

        // Set blend mode
        // Saturating blend (p5.brush technique): new stamps contribute less
        // where alpha is already high, preventing ring artifacts at overlap edges
        if (layer.blend === 'additive') {
            gl.blendFunc(gl.ONE, gl.ONE);
        } else {
            gl.blendFunc(gl.ONE_MINUS_DST_ALPHA, gl.ONE);
        }

        gl.bindVertexArray(layer.vao);
        gl.drawArraysInstanced(gl.TRIANGLES, 0, 6, layer.count);
        gl.bindVertexArray(null);
    }

    _composeLayers() {
        if (this._hasMixbox) {
            this._composeLayersMixbox();
        } else {
            this._composeLayersSimple();
        }
    }

    /** Standard compositing fallback (no Mixbox). */
    _composeLayersSimple() {
        const gl = this.gl;

        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.viewport(0, 0, this.width, this.height);
        gl.clear(gl.COLOR_BUFFER_BIT);

        gl.useProgram(this._compositeProg);
        gl.bindVertexArray(this._fsQuadVAO);
        gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

        for (const name of this.layerNames) {
            const layer = this._layers[name];
            if (layer.count === 0) continue;

            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, layer.texture);
            gl.uniform1i(this._uCompLayer, 0);
            gl.uniform1f(this._uCompOpacity, layer.opacity);

            if (layer.blend === 'additive') {
                gl.blendFunc(gl.ONE, gl.ONE);
            } else {
                gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
            }

            gl.drawArrays(gl.TRIANGLES, 0, 6);
        }

        gl.bindVertexArray(null);
    }

    /** Mixbox pigment compositing via ping-pong FBOs. */
    _composeLayersMixbox() {
        const gl = this.gl;
        const bg = hexToRGB(this.background);

        // Initialize accumulation FBO 0 with background color
        gl.bindFramebuffer(gl.FRAMEBUFFER, this._accFBOs[0]);
        gl.viewport(0, 0, this.width, this.height);
        gl.clearColor(bg[0], bg[1], bg[2], 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);

        gl.useProgram(this._mixboxProg);
        gl.bindVertexArray(this._fsQuadVAO);

        // Shader handles all blending — disable GL blend
        gl.disable(gl.BLEND);

        // Bind Mixbox LUT to texture unit 2
        gl.activeTexture(gl.TEXTURE2);
        gl.bindTexture(gl.TEXTURE_2D, this._mixboxLUT);
        gl.uniform1i(this._uMixboxLUT, 2);

        let readIdx = 0, writeIdx = 1;

        for (const name of this.layerNames) {
            const layer = this._layers[name];
            if (layer.count === 0) continue;

            // Write to the other accumulation FBO
            gl.bindFramebuffer(gl.FRAMEBUFFER, this._accFBOs[writeIdx]);
            gl.viewport(0, 0, this.width, this.height);

            // Read: accumulated result so far
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, this._accTextures[readIdx]);
            gl.uniform1i(this._uMixAcc, 0);

            // Read: current layer
            gl.activeTexture(gl.TEXTURE1);
            gl.bindTexture(gl.TEXTURE_2D, layer.texture);
            gl.uniform1i(this._uMixLayer, 1);

            gl.uniform1f(this._uMixOpacity, layer.opacity);
            gl.uniform1i(this._uMixAdditive, layer.blend === 'additive' ? 1 : 0);

            gl.drawArrays(gl.TRIANGLES, 0, 6);

            // Swap read/write
            const tmp = readIdx; readIdx = writeIdx; writeIdx = tmp;
        }

        // Blit final accumulation result to screen
        gl.bindFramebuffer(gl.READ_FRAMEBUFFER, this._accFBOs[readIdx]);
        gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, null);
        gl.blitFramebuffer(0, 0, this.width, this.height,
                           0, 0, this.width, this.height,
                           gl.COLOR_BUFFER_BIT, gl.NEAREST);

        gl.bindVertexArray(null);

        // Restore GL state
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
        gl.clearColor(bg[0], bg[1], bg[2], 1.0);
    }

    // ─── LAYER CONTROL ───────────────────────────────────────

    /** Set layer opacity (0-1). */
    setLayerOpacity(name, val) {
        const layer = this._layers[name];
        if (layer) layer.opacity = val;
    }

    /** Set layer blend mode ('alpha' or 'additive'). */
    setLayerBlend(name, mode) {
        const layer = this._layers[name];
        if (layer) layer.blend = mode;
    }

    /** Clear all stamps from a layer and its FBO. */
    clearLayer(name) {
        const gl = this.gl;
        const layer = this._layers[name];
        if (!layer) return;

        layer.count = 0;
        layer.head = 0;
        layer.dirty = true;

        gl.bindFramebuffer(gl.FRAMEBUFFER, layer.fbo);
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);

        // Restore background clear color
        const bg = hexToRGB(this.background);
        gl.clearColor(bg[0], bg[1], bg[2], 1.0);
    }

    /** Clear all layers. */
    clearAll() {
        for (const name of this.layerNames) {
            this.clearLayer(name);
        }
    }

    // ─── AUDIO BUS ───────────────────────────────────────────

    /**
     * Update audio bus from Web Audio analyser.
     * @param {AnalyserNode} analyser
     * @param {Uint8Array} timeData — pre-allocated buffer
     */
    updateAudio(analyser, timeData) {
        if (!analyser || !timeData) return;
        analyser.getByteTimeDomainData(timeData);
        let rms = 0;
        for (let i = 0; i < timeData.length; i++) {
            const v = (timeData[i] - 128) / 128;
            rms += v * v;
        }
        const raw = Math.sqrt(rms / timeData.length);
        this.audio.amplitude = raw > 0.005 ? raw : 0;
        this.audio.energy += (Math.min(1, this.audio.amplitude * 3) - this.audio.energy) * this.audio.smoothing;
    }

    // ─── UTILITY ─────────────────────────────────────────────

    /** Current total live stamp count across all layers. */
    get stampCount() {
        let n = 0;
        for (const name of this.layerNames) {
            n += this._layers[name].count;
        }
        return n;
    }

    /** Handle canvas resize. */
    resize(w, h) {
        const gl = this.gl;
        this.width = w;
        this.height = h;
        this.canvas.width = w;
        this.canvas.height = h;

        // Rebuild layer FBOs
        for (const name of this.layerNames) {
            const layer = this._layers[name];
            gl.bindTexture(gl.TEXTURE_2D, layer.texture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0,
                           gl.RGBA, gl.UNSIGNED_BYTE, null);
        }

        // Rebuild Mixbox accumulation FBOs
        if (this._hasMixbox) {
            for (let i = 0; i < 2; i++) {
                gl.bindTexture(gl.TEXTURE_2D, this._accTextures[i]);
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0,
                               gl.RGBA, gl.UNSIGNED_BYTE, null);
            }
        }
    }

    /** Cleanup all WebGL resources. */
    dispose() {
        const gl = this.gl;
        for (const name of this.layerNames) {
            const layer = this._layers[name];
            gl.deleteBuffer(layer.instanceVBO);
            gl.deleteVertexArray(layer.vao);
            gl.deleteFramebuffer(layer.fbo);
            gl.deleteTexture(layer.texture);
        }
        gl.deleteBuffer(this._quadVBO);
        gl.deleteVertexArray(this._fsQuadVAO);
        gl.deleteTexture(this._atlasTex);
        gl.deleteTexture(this._grainTex);
        gl.deleteProgram(this._stampProg);
        gl.deleteProgram(this._compositeProg);

        // Cleanup Mixbox resources
        if (this._hasMixbox) {
            gl.deleteProgram(this._mixboxProg);
            gl.deleteTexture(this._mixboxLUT);
            for (let i = 0; i < 2; i++) {
                gl.deleteFramebuffer(this._accFBOs[i]);
                gl.deleteTexture(this._accTextures[i]);
            }
        }
    }
}

// ═══════════════════════════════════════════════════════════════
//  EXPORTS
// ═══════════════════════════════════════════════════════════════

// Support both module and script tag usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { FatihaBrush, hexToRGB };
} else {
    window.FatihaBrush = FatihaBrush;
    window.hexToRGB = hexToRGB;
}
