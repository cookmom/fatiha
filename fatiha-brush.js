/**
 * fatiha.brush — Custom Ottoman Brush Engine
 *
 * WebGL2 instanced-quad renderer for real-time voice-reactive
 * Islamic calligraphic art. Retains the organic natural-media
 * aesthetic of p5.brush (watercolor bleeds, grain, soft edges)
 * while running at 60fps with 2000+ stamps.
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
flat out int v_instanceID;

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
    v_instanceID = gl_InstanceID;
}
`;

const STAMP_FRAG = `#version 300 es
precision highp float;

in vec2 v_uv;
in vec2 v_atlasUV;
in float v_atlasSize;
in vec4 v_color;
in float v_fade;
flat in int v_instanceID;

uniform sampler2D u_atlas;
uniform sampler2D u_grain;
uniform float u_grainStrength;
uniform vec2 u_grainOffset;

out vec4 fragColor;

// Integer hash for per-stamp color jitter
float ihash(int n) {
    int x = n;
    x = ((x >> 16) ^ x) * 0x45d9f3b;
    x = ((x >> 16) ^ x) * 0x45d9f3b;
    x = (x >> 16) ^ x;
    return float(x & 0xFFFF) / 65535.0;
}

void main() {
    if (v_fade <= 0.0) discard;

    // Sample brush tip from atlas
    vec2 atlasCoord = v_atlasUV + v_uv * v_atlasSize;
    float tipAlpha = texture(u_atlas, atlasCoord).r;

    // Sample grain texture (tiled) — stronger contrast
    vec2 grainCoord = gl_FragCoord.xy / 256.0 + u_grainOffset;
    float grain = texture(u_grain, grainCoord).r;
    float grainMod = mix(1.0, grain * 0.6 + 0.2, u_grainStrength);

    float alpha = tipAlpha * v_color.a * v_fade * grainMod;

    if (alpha < 0.003) discard;

    // Color jitter: ±10/255 per RGB channel based on stamp ID
    float jR = (ihash(v_instanceID * 3 + 0) - 0.5) * (20.0 / 255.0);
    float jG = (ihash(v_instanceID * 3 + 1) - 0.5) * (20.0 / 255.0);
    float jB = (ihash(v_instanceID * 3 + 2) - 0.5) * (20.0 / 255.0);
    vec3 color = clamp(v_color.rgb + vec3(jR, jG, jB), 0.0, 1.0);

    fragColor = vec4(color * alpha, alpha);
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
//  PROCEDURAL BRUSH TIPS
// ═══════════════════════════════════════════════════════════════

const BUILTIN_TIPS = {

    /** Soft round — Gaussian falloff, the workhorse watercolor stamp. */
    soft_round(ctx, size) {
        const cx = size / 2, cy = size / 2, r = size / 2 - 2;
        const imgData = ctx.getImageData(0, 0, size, size);
        const d = imgData.data;
        for (let py = 0; py < size; py++) {
            for (let px = 0; px < size; px++) {
                const dx = (px - cx) / r, dy = (py - cy) / r;
                const dist2 = dx * dx + dy * dy;
                if (dist2 > 1) continue;
                const alpha = Math.exp(-dist2 * 3) * 255;
                const idx = (py * size + px) * 4;
                d[idx] = 255; d[idx + 1] = 255; d[idx + 2] = 255;
                d[idx + 3] = alpha;
            }
        }
        ctx.putImageData(imgData, 0, 0);
    },

    /** Pointed leaf — elongated saz leaf silhouette with soft falloff. */
    pointed_leaf(ctx, size) {
        const cx = size / 2, cy = size / 2;
        const hw = size * 0.22, hh = size * 0.45;
        ctx.save();
        ctx.translate(cx, cy);

        // Draw leaf shape path
        ctx.beginPath();
        ctx.moveTo(0, -hh);
        ctx.bezierCurveTo(hw * 1.4, -hh * 0.5, hw * 1.4, hh * 0.5, 0, hh);
        ctx.bezierCurveTo(-hw * 1.4, hh * 0.5, -hw * 1.4, -hh * 0.5, 0, -hh);
        ctx.closePath();

        // Radial gradient fill for softness
        const g = ctx.createRadialGradient(0, 0, 0, 0, 0, hh);
        g.addColorStop(0, 'rgba(255,255,255,1)');
        g.addColorStop(0.5, 'rgba(255,255,255,0.7)');
        g.addColorStop(1, 'rgba(255,255,255,0.15)');
        ctx.fillStyle = g;
        ctx.fill();
        ctx.restore();
    },

    /** Petal — rounder ogee shape with soft feathered edges. */
    petal(ctx, size) {
        const cx = size / 2, cy = size / 2;
        const hw = size * 0.36, hh = size * 0.36;
        ctx.save();
        ctx.translate(cx, cy);

        // Rounder tips — wider control points, less pointy ends
        ctx.beginPath();
        ctx.moveTo(0, -hh);
        ctx.bezierCurveTo(hw * 2.2, -hh * 0.1, hw * 2.2, hh * 0.1, 0, hh);
        ctx.bezierCurveTo(-hw * 2.2, hh * 0.1, -hw * 2.2, -hh * 0.1, 0, -hh);
        ctx.closePath();

        const g = ctx.createRadialGradient(0, 0, 0, 0, 0, hh);
        g.addColorStop(0, 'rgba(255,255,255,1)');
        g.addColorStop(0.3, 'rgba(255,255,255,0.9)');
        g.addColorStop(0.6, 'rgba(255,255,255,0.5)');
        g.addColorStop(0.85, 'rgba(255,255,255,0.15)');
        g.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = g;
        ctx.fill();
        ctx.restore();
    },

    /** Spray — scattered dots for pollen/atmosphere effects. */
    spray(ctx, size) {
        const cx = size / 2, cy = size / 2, r = size / 2 - 4;
        // Multiple small dots in a circular area
        for (let i = 0; i < 40; i++) {
            const a = Math.random() * Math.PI * 2;
            const d = Math.random() * r;
            const dr = 1 + Math.random() * 3;
            const alpha = 0.3 + Math.random() * 0.7;
            ctx.fillStyle = `rgba(255,255,255,${alpha})`;
            ctx.beginPath();
            ctx.arc(cx + Math.cos(a) * d, cy + Math.sin(a) * d, dr, 0, Math.PI * 2);
            ctx.fill();
        }
    },

    /** Hatch line — thin elongated rect with tapered ends. For crosshatching. */
    hatch_line(ctx, size) {
        const cx = size / 2, cy = size / 2;
        const hw = size * 0.04, hh = size * 0.45;
        ctx.save();
        ctx.translate(cx, cy);

        // Tapered rectangle
        ctx.beginPath();
        ctx.moveTo(0, -hh);
        ctx.bezierCurveTo(hw, -hh * 0.7, hw, hh * 0.7, 0, hh);
        ctx.bezierCurveTo(-hw, hh * 0.7, -hw, -hh * 0.7, 0, -hh);
        ctx.closePath();

        const g = ctx.createLinearGradient(0, -hh, 0, hh);
        g.addColorStop(0, 'rgba(255,255,255,0)');
        g.addColorStop(0.15, 'rgba(255,255,255,0.9)');
        g.addColorStop(0.5, 'rgba(255,255,255,1)');
        g.addColorStop(0.85, 'rgba(255,255,255,0.9)');
        g.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = g;
        ctx.fill();
        ctx.restore();
    },

    /** Thorn — sharp triangle with gradient falloff. */
    thorn(ctx, size) {
        const cx = size / 2, cy = size / 2;
        const hw = size * 0.15, hh = size * 0.45;
        ctx.save();
        ctx.translate(cx, cy);

        ctx.beginPath();
        ctx.moveTo(0, -hh);
        ctx.lineTo(hw, hh * 0.6);
        ctx.lineTo(-hw, hh * 0.6);
        ctx.closePath();

        const g = ctx.createLinearGradient(0, -hh, 0, hh * 0.6);
        g.addColorStop(0, 'rgba(255,255,255,1)');
        g.addColorStop(0.7, 'rgba(255,255,255,0.6)');
        g.addColorStop(1, 'rgba(255,255,255,0.1)');
        ctx.fillStyle = g;
        ctx.fill();
        ctx.restore();
    },

    /** Bud — teardrop shape. */
    bud(ctx, size) {
        const cx = size / 2, cy = size / 2;
        const hw = size * 0.28, hh = size * 0.42;
        ctx.save();
        ctx.translate(cx, cy);

        ctx.beginPath();
        ctx.moveTo(0, -hh);
        ctx.bezierCurveTo(hw * 1.8, -hh * 0.2, hw * 1.5, hh * 0.8, 0, hh);
        ctx.bezierCurveTo(-hw * 1.5, hh * 0.8, -hw * 1.8, -hh * 0.2, 0, -hh);
        ctx.closePath();

        const g = ctx.createRadialGradient(0, -hh * 0.2, 0, 0, 0, hh);
        g.addColorStop(0, 'rgba(255,255,255,1)');
        g.addColorStop(0.4, 'rgba(255,255,255,0.8)');
        g.addColorStop(0.8, 'rgba(255,255,255,0.25)');
        g.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = g;
        ctx.fill();
        ctx.restore();
    }
};

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
     * @param {number} [opts.grainStrength=0.35] — grain texture intensity (0-1)
     */
    constructor(canvas, opts = {}) {
        this.canvas = canvas;
        this.maxStamps = opts.maxStamps || 4096;
        this.layerNames = opts.layers || ['default'];
        this.background = opts.background || '#000000';
        this.grainStrength = opts.grainStrength !== undefined ? opts.grainStrength : 0.55;

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

    /** Build the texture atlas from all registered tips. */
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
            ctx.save();
            ctx.translate(col * ATLAS_CELL, row * ATLAS_CELL);
            // Clear cell
            ctx.clearRect(0, 0, ATLAS_CELL, ATLAS_CELL);
            // Draw tip
            this._tipList[i].drawFn(ctx, ATLAS_CELL);
            ctx.restore();
        }

        // Apply noise-based opacity variation to all stamps
        const fullImg = ctx.getImageData(0, 0, atlasW, atlasH);
        const px = fullImg.data;
        for (let y = 0; y < atlasH; y++) {
            for (let x = 0; x < atlasW; x++) {
                const idx = (y * atlasW + x) * 4;
                if (px[idx + 3] === 0) continue;
                // Perlin-like smooth noise via sine superposition
                const noise = 0.7 + 0.3 * (
                    Math.sin(x * 0.15) * Math.cos(y * 0.12) * 0.5 +
                    Math.sin(x * 0.08 + y * 0.1) * 0.3 +
                    Math.sin(x * 0.25 - y * 0.18) * 0.2
                );
                px[idx + 3] = Math.min(255, px[idx + 3] * noise);
            }
        }
        ctx.putImageData(fullImg, 0, 0);

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

    /** Build grain noise texture. */
    _buildGrain() {
        const gl = this.gl;
        const size = GRAIN_SIZE;
        const data = new Uint8Array(size * size);

        // Generate Perlin-ish noise (simplified: white noise + box blur)
        for (let i = 0; i < data.length; i++) {
            data[i] = Math.random() * 255;
        }
        // Simple box blur pass for smoother grain
        const blurred = new Uint8Array(size * size);
        for (let y = 1; y < size - 1; y++) {
            for (let x = 1; x < size - 1; x++) {
                let sum = 0;
                for (let dy = -1; dy <= 1; dy++) {
                    for (let dx = -1; dx <= 1; dx++) {
                        sum += data[(y + dy) * size + (x + dx)];
                    }
                }
                blurred[y * size + x] = sum / 9;
            }
        }

        this._grainTex = gl.createTexture();
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, this._grainTex);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, size, size, 0,
                       gl.LUMINANCE, gl.UNSIGNED_BYTE, blurred);
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
        if (layer.blend === 'additive') {
            gl.blendFunc(gl.ONE, gl.ONE);
        } else {
            gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
        }

        gl.bindVertexArray(layer.vao);
        gl.drawArraysInstanced(gl.TRIANGLES, 0, 6, layer.count);
        gl.bindVertexArray(null);
    }

    _composeLayers() {
        const gl = this.gl;

        // Render to screen
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.viewport(0, 0, this.width, this.height);
        gl.clear(gl.COLOR_BUFFER_BIT);

        gl.useProgram(this._compositeProg);
        gl.bindVertexArray(this._fsQuadVAO);

        // Alpha blend for compositing
        gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

        for (const name of this.layerNames) {
            const layer = this._layers[name];
            if (layer.count === 0) continue;

            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, layer.texture);
            gl.uniform1i(this._uCompLayer, 0);
            gl.uniform1f(this._uCompOpacity, layer.opacity);

            // Set blend mode for this layer
            if (layer.blend === 'additive') {
                gl.blendFunc(gl.ONE, gl.ONE);
            } else {
                gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
            }

            gl.drawArrays(gl.TRIANGLES, 0, 6);
        }

        gl.bindVertexArray(null);
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
