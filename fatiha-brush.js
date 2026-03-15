/**
 * fatiha.brush — Custom Ottoman Brush Engine (v3: procedural SDF stamps)
 *
 * WebGL2 instanced-quad renderer for real-time voice-reactive
 * Islamic calligraphic art. Resolution-independent brush tips via
 * procedural signed distance fields in the fragment shader — no
 * procedural SDF brush tips. Per-pixel Gaussian falloff, fwidth() antialiasing,
 * procedural grain noise, color jitter, and Mixbox pigment blending.
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
// x, y, rotation, scaleX, scaleY, r, g, b, a, brushType, (unused), (unused), age, lifetime

// Procedural brush type IDs — mapped to SDF functions in the fragment shader
const BRUSH_TYPES = {
    soft_round:   0,
    pointed_leaf: 1,
    petal:        2,
    spray:        3,
    hatch_line:   4,
    thorn:        5,
    bud:          6
};

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
layout(location = 5) in vec3 a_tex;   // x = brush type ID, y/z unused
layout(location = 6) in vec2 a_life;  // age, lifetime

uniform vec2 u_resolution;

out vec2 v_uv;         // local quad UV [0,1]
out float v_brushType; // procedural brush type ID
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
    v_brushType = a_tex.x;
    v_color = a_color;
    v_stampPos = a_pos;
}
`;

const STAMP_FRAG = `#version 300 es
precision highp float;

in vec2 v_uv;
in float v_brushType;
in vec4 v_color;
in float v_fade;
in vec2 v_stampPos;

uniform float u_grainStrength;
uniform float u_colorJitter;

// ── Procedural noise (replaces baked grain texture) ──────────

float hash(vec2 p) {
    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}

// Smooth value noise for organic paper grain
float valueNoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

// Multi-octave grain: coarse paper fiber + fine detail
float grainNoise(vec2 p) {
    return valueNoise(p * 8.0) * 0.6
         + valueNoise(p * 24.0) * 0.3
         + valueNoise(p * 64.0) * 0.1;
}

// ── Procedural SDF brush tips ────────────────────────────────
// All shapes defined in UV space, centered at origin.
// Uses fwidth() for resolution-independent antialiasing (like p5.brush).

out vec4 fragColor;

void main() {
    if (v_fade <= 0.0) discard;

    // Center UV: (0,0) = stamp center, range [-0.5, 0.5]
    vec2 p = v_uv - 0.5;
    int brushType = int(v_brushType + 0.5);

    float tipAlpha = 0.0;

    if (brushType == 0) {
        // ── soft_round: Gaussian circle ──
        // The workhorse watercolor stamp. Smooth radial falloff,
        // no hard edge at any zoom level.
        float d = length(p) * 2.0;
        float aa = fwidth(d);
        float edge = 1.0 - smoothstep(1.0 - aa, 1.0, d);
        tipAlpha = exp(-2.0 * d * d) * edge;
    }
    else if (brushType == 1) {
        // ── pointed_leaf: narrow vertical ellipse ──
        // Organic leaf stamp with narrow width, pointed tips.
        vec2 q = p * vec2(1.0 / 0.24, 1.0 / 0.45);
        float d = length(q);
        float aa = fwidth(d);
        float edge = 1.0 - smoothstep(1.0 - aa, 1.0, d);
        tipAlpha = exp(-2.8 * d * d) * edge;
    }
    else if (brushType == 2) {
        // ── petal: wide ogee/almond ──
        // Wider than leaf, used for flower petals and ogee motifs.
        vec2 q = p * vec2(1.0 / 0.34, 1.0 / 0.42);
        float d = length(q);
        float aa = fwidth(d);
        float edge = 1.0 - smoothstep(1.0 - aa, 1.0, d);
        tipAlpha = exp(-2.5 * d * d) * edge;
    }
    else if (brushType == 3) {
        // ── spray: scattered soft dots ──
        // Multiple procedural circles for pollen/atmosphere effects.
        float total = 0.0;
        for (int i = 0; i < 12; i++) {
            float fi = float(i);
            vec2 center = vec2(
                hash(vec2(fi, 0.37)) - 0.5,
                hash(vec2(0.73, fi)) - 0.5
            ) * 0.8;
            float radius = 0.03 + hash(vec2(fi, fi * 1.7)) * 0.06;
            float d = length(p - center) / radius;
            float dotAlpha = exp(-2.0 * d * d) * (0.3 + hash(vec2(fi * 1.3, fi * 2.7)) * 0.7);
            total += dotAlpha;
        }
        tipAlpha = min(total, 1.0);
    }
    else if (brushType == 4) {
        // ── hatch_line: thin vertical stroke ──
        // Tapered at both ends via Gaussian along length.
        float dx = abs(p.x) / 0.04;
        float dy = abs(p.y) / 0.45;
        float d = max(dx, dy);
        float aa = fwidth(d);
        float shape = 1.0 - smoothstep(1.0 - aa, 1.0, d);
        float taper = exp(-3.0 * dy * dy);
        tipAlpha = shape * taper;
    }
    else if (brushType == 5) {
        // ── thorn: sharp triangle/wedge ──
        // Points upward, wider at base. Soft Gaussian falloff.
        float ty = (p.y + 0.45) / 0.9;
        float halfWidth = 0.15 * (1.0 - ty);
        float dx = abs(p.x);
        float d = dx / max(halfWidth, 0.001);
        float aa = fwidth(d);
        float inBounds = step(0.0, ty) * step(ty, 1.0);
        float shape = (1.0 - smoothstep(1.0 - aa * 2.0, 1.0, d)) * inBounds;
        float falloff = exp(-1.5 * d * d) * (0.3 + 0.7 * ty);
        tipAlpha = shape * falloff;
    }
    else if (brushType == 6) {
        // ── bud: teardrop ──
        // Wider at top, tapering to a point at bottom.
        float yNorm = (p.y + 0.42) / 0.84;
        float widthScale = 0.28 * (1.0 - 0.5 * yNorm * yNorm);
        vec2 q = vec2(p.x / max(widthScale, 0.001), p.y / 0.42);
        float d = length(q);
        float aa = fwidth(d);
        float edge = 1.0 - smoothstep(1.0 - aa, 1.0, d);
        tipAlpha = exp(-2.5 * d * d) * edge;
    }

    // Per-pixel procedural grain (replaces baked grain texture)
    vec2 grainCoord = gl_FragCoord.xy / 256.0;
    float grain = grainNoise(grainCoord);
    float grainMod = mix(1.0, 0.2 + grain * 0.8, u_grainStrength);

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

        // Brush type registry: name → type ID (for procedural SDF lookup)
        this._tipNames = Object.keys(BRUSH_TYPES);

        // Audio reactive parameter bus
        this.audio = { amplitude: 0, energy: 0, smoothing: 0.12 };

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

        // Init WebGL
        this._initGL();
        this._initShaders();
        this._initGeometry();
        this._initLayers();
        this._initMixbox();

        // Frame counter for grain animation
        this._frame = 0;

        // Wet watercolor elements — progressive "watching paint dry" system
        // Each element starts crisp and deforms more over consecutive frames
        this._wetElements = [];
    }

    // ─── BRUSH TYPE REGISTRY ─────────────────────────────────

    /**
     * Register a custom brush tip name mapped to an existing SDF type.
     * @param {string} name — unique tip name
     * @param {string} [sdfType='soft_round'] — built-in SDF type to map to
     */
    registerTip(name, sdfType = 'soft_round') {
        const id = BRUSH_TYPES[sdfType] !== undefined ? BRUSH_TYPES[sdfType] : 0;
        BRUSH_TYPES[name] = id;
        this._tipNames.push(name);
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
        this._uGrainStrength = gl.getUniformLocation(this._stampProg, 'u_grainStrength');
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

        // Get procedural brush type ID
        const brushType = BRUSH_TYPES[opts.texture || 'soft_round'] || 0;

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
        stamps[off + 9] = brushType;                      // brush type ID (SDF)
        stamps[off + 10] = 0;                             // (unused)
        stamps[off + 11] = 0;                             // (unused)
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

    // ─── TYLER HOBBS PAINTING TOOLKIT ──────────────────────
    // Watercolor simulation, soft textures, probability distributions,
    // and layered painting techniques from Tyler Hobbs' research.
    // See tyler-hobbs-techniques.md for full documentation.

    // ── Probability Distributions ────────────────────────────

    /**
     * Gaussian (normal) random number via Box-Muller transform.
     * The most important distribution for organic variation.
     * @param {number} [mean=0]
     * @param {number} [stddev=1]
     * @returns {number}
     */
    static gaussian(mean = 0, stddev = 1) {
        // Box-Muller transform
        let u, v, s;
        do {
            u = Math.random() * 2 - 1;
            v = Math.random() * 2 - 1;
            s = u * u + v * v;
        } while (s >= 1 || s === 0);
        const mul = Math.sqrt(-2 * Math.log(s) / s);
        return mean + stddev * u * mul;
    }

    /**
     * Power-law (Pareto) random number — "many small, few large."
     * Use for element sizing, spacing hierarchy.
     * @param {number} [min=1] — minimum value
     * @param {number} [alpha=2] — shape parameter (higher = less extreme)
     * @returns {number}
     */
    static powerLaw(min = 1, alpha = 2) {
        return min / Math.pow(Math.random(), 1 / alpha);
    }

    /**
     * Truncated Gaussian — Gaussian clamped to [lo, hi].
     * Useful when you need organic variation but within bounds.
     * @param {number} mean
     * @param {number} stddev
     * @param {number} lo
     * @param {number} hi
     * @returns {number}
     */
    static truncGaussian(mean, stddev, lo, hi) {
        let val;
        do {
            val = FatihaBrush.gaussian(mean, stddev);
        } while (val < lo || val > hi);
        return val;
    }

    // ── Polygon Deformation (Core Watercolor Algorithm) ──────

    /**
     * Recursively deform a polygon by displacing edge midpoints.
     * This is Tyler Hobbs' core watercolor technique — creates organic,
     * paint-like blob shapes from simple input polygons.
     *
     * @param {Array<{x:number, y:number, variance?:number}>} points — polygon vertices
     * @param {Object} [opts]
     * @param {number} [opts.rounds=5] — deformation iterations
     * @param {number} [opts.variance=0.5] — base displacement magnitude (fraction of edge length)
     * @param {number} [opts.varianceDrift=0.1] — how much child variance can differ from parent
     * @param {number} [opts.angleMean=0] — mean displacement angle offset from perpendicular (radians)
     * @param {number} [opts.angleVariance=0.3] — displacement angle randomization
     * @returns {Array<{x:number, y:number, variance:number}>} — deformed polygon
     */
    deformPolygon(points, opts = {}) {
        const rounds = opts.rounds !== undefined ? opts.rounds : 5;
        const baseVar = opts.variance !== undefined ? opts.variance : 0.5;
        const varDrift = opts.varianceDrift !== undefined ? opts.varianceDrift : 0.1;
        const angleMean = opts.angleMean || 0;
        const angleVar = opts.angleVariance !== undefined ? opts.angleVariance : 0.3;

        let poly = points.map(p => ({
            x: p.x, y: p.y,
            variance: p.variance !== undefined ? p.variance : baseVar
        }));

        for (let round = 0; round < rounds; round++) {
            const next = [];
            for (let i = 0; i < poly.length; i++) {
                const a = poly[i];
                const b = poly[(i + 1) % poly.length];

                // Midpoint with Gaussian offset along edge
                const midT = FatihaBrush.truncGaussian(0.5, 0.1, 0.3, 0.7);
                const mx = a.x + (b.x - a.x) * midT;
                const my = a.y + (b.y - a.y) * midT;

                // Edge length and perpendicular
                const edgeLen = Math.sqrt((b.x - a.x) ** 2 + (b.y - a.y) ** 2);
                const edgeAngle = Math.atan2(b.y - a.y, b.x - a.x);
                const perpAngle = edgeAngle + Math.PI / 2 +
                    FatihaBrush.gaussian(angleMean, angleVar);

                // Displacement magnitude — Gaussian, scaled by edge length and vertex variance
                const parentVar = (a.variance + b.variance) / 2;
                const magnitude = Math.abs(FatihaBrush.gaussian(0, parentVar * edgeLen * 0.5));

                // Displaced midpoint
                const dx = Math.cos(perpAngle) * magnitude;
                const dy = Math.sin(perpAngle) * magnitude;

                // Child variance inherits from parent with drift
                const childVar = Math.max(0.05,
                    parentVar + FatihaBrush.gaussian(0, varDrift));

                next.push(a);
                next.push({ x: mx + dx, y: my + dy, variance: childVar });
            }
            poly = next;
        }

        return poly;
    }

    // ── Watercolor Rendering ─────────────────────────────────

    /**
     * Render a watercolor blob — the full Tyler Hobbs technique.
     * Takes a simple polygon, deforms it, and renders 30-100 low-opacity
     * layers with per-layer deformation and texture masking.
     *
     * @param {Array<{x:number, y:number}>} polygon — simple input polygon (3+ vertices)
     * @param {Object} [opts]
     * @param {string} [opts.color='#4488aa'] — fill color
     * @param {number} [opts.layers=50] — number of transparent layers
     * @param {number} [opts.opacity=0.04] — per-layer opacity
     * @param {number} [opts.baseRounds=5] — deformation rounds for base shape
     * @param {number} [opts.layerRounds=3] — extra deformation rounds per layer
     * @param {number} [opts.variance=0.4] — base deformation variance
     * @param {number} [opts.textureDots=0] — circles per layer for paper grain (0 = disabled)
     * @param {number} [opts.textureRadius=3] — radius of grain texture dots
     * @param {string} [opts.layer] — render layer name
     * @param {number} [opts.lifetime=99999]
     * @param {boolean} [opts.concentratePigment=true] — more opacity in center (Hobbs technique)
     */
    watercolor(polygon, opts = {}) {
        if (!polygon || polygon.length < 3) return;

        const color = opts.color || '#4488aa';
        const numLayers = opts.layers || 50;
        const baseOpacity = opts.opacity !== undefined ? opts.opacity : 0.04;
        const baseRounds = opts.baseRounds !== undefined ? opts.baseRounds : 5;
        const layerRounds = opts.layerRounds !== undefined ? opts.layerRounds : 3;
        const baseVar = opts.variance !== undefined ? opts.variance : 0.4;
        const textureDots = opts.textureDots || 0;
        const textureRadius = opts.textureRadius || 3;
        const layer = opts.layer || this.layerNames[0];
        const lifetime = opts.lifetime !== undefined ? opts.lifetime : 99999;
        const concentrate = opts.concentratePigment !== false;

        // Compute polygon centroid and bounding radius (for texture masking)
        let cx = 0, cy = 0;
        for (const p of polygon) { cx += p.x; cy += p.y; }
        cx /= polygon.length;
        cy /= polygon.length;
        let boundR = 0;
        for (const p of polygon) {
            const d = Math.sqrt((p.x - cx) ** 2 + (p.y - cy) ** 2);
            if (d > boundR) boundR = d;
        }

        // Create base deformed polygon
        const basePoly = this.deformPolygon(polygon, {
            rounds: baseRounds,
            variance: baseVar
        });

        // Render layers
        for (let i = 0; i < numLayers; i++) {
            const t = i / numLayers; // 0-1 progress through layers

            // Pigment concentration: fewer deformation rounds for early layers
            // (tighter to center), more for later layers (feathered edges)
            let extraRounds = layerRounds;
            if (concentrate) {
                if (t < 0.33) extraRounds = Math.max(1, Math.floor(layerRounds * 0.4));
                else if (t < 0.66) extraRounds = Math.max(1, Math.floor(layerRounds * 0.7));
            }

            // Deform base polygon further for this layer
            const layerPoly = this.deformPolygon(basePoly, {
                rounds: extraRounds,
                variance: baseVar * 0.6
            });

            // Render the deformed polygon as a fan of stamps from centroid
            this._renderPolygonFill(layerPoly, cx, cy, {
                color,
                a: baseOpacity,
                layer,
                lifetime,
                texture: 'soft_round'
            });

            // Texture masking: scattered dots for paper grain
            if (textureDots > 0) {
                for (let d = 0; d < textureDots; d++) {
                    const tx = cx + FatihaBrush.gaussian(0, boundR * 0.6);
                    const ty = cy + FatihaBrush.gaussian(0, boundR * 0.6);
                    this.addStamp({
                        x: tx, y: ty,
                        color,
                        a: baseOpacity * 0.5,
                        scaleX: textureRadius * (0.5 + Math.random()),
                        scaleY: textureRadius * (0.5 + Math.random()),
                        texture: 'soft_round',
                        layer,
                        lifetime
                    });
                }
            }
        }
    }

    // ── Wet Watercolor — "Watching Paint Dry" Progressive System ──

    /**
     * Progressive watercolor — "watching paint dry" effect.
     * Instead of rendering all layers immediately, each element starts crisp
     * and progressively deforms over consecutive frames. Early frames: tight
     * shape. Later frames: full Tyler Hobbs watercolor bleed.
     *
     * @param {Array<{x:number, y:number}>} polygon — simple input polygon
     * @param {Object} [opts] — same as watercolor() plus:
     * @param {number} [opts.maxWetness=80] — frames to reach full deformation
     * @param {number} [opts.layers=50] — total layers to render over lifetime
     * @param {number} [opts.peakBaseRounds=7] — max base deformation rounds at full wetness
     * @param {number} [opts.peakLayerRounds=5] — max per-layer deformation rounds at full wetness
     * @param {number} [opts.variance=0.4] — deformation variance
     * @param {number} [opts.opacity=0.04] — per-layer opacity
     * @param {boolean} [opts.concentratePigment=true] — pigment concentration
     * @param {string} [opts.color='#4488aa']
     * @param {string} [opts.layer]
     * @param {number} [opts.lifetime=99999]
     */
    wetWatercolor(polygon, opts = {}) {
        if (!polygon || polygon.length < 3) return;

        // Compute centroid and bounding radius
        let cx = 0, cy = 0;
        for (const p of polygon) { cx += p.x; cy += p.y; }
        cx /= polygon.length;
        cy /= polygon.length;
        let boundR = 0;
        for (const p of polygon) {
            const d = Math.sqrt((p.x - cx) ** 2 + (p.y - cy) ** 2);
            if (d > boundR) boundR = d;
        }

        this._wetElements.push({
            polygon: polygon.map(p => ({ x: p.x, y: p.y })),
            color: opts.color || '#4488aa',
            layer: opts.layer || this.layerNames[0],
            lifetime: opts.lifetime !== undefined ? opts.lifetime : 99999,
            opacity: opts.opacity !== undefined ? opts.opacity : 0.04,
            variance: opts.variance !== undefined ? opts.variance : 0.4,
            peakBaseRounds: opts.peakBaseRounds !== undefined ? opts.peakBaseRounds : 7,
            peakLayerRounds: opts.peakLayerRounds !== undefined ? opts.peakLayerRounds : 5,
            concentrate: opts.concentratePigment !== false,
            textureDots: opts.textureDots || 0,
            textureRadius: opts.textureRadius || 3,
            cx, cy, boundR,
            wetness: 0,
            maxWetness: opts.maxWetness !== undefined ? opts.maxWetness : 80,
            targetLayers: opts.layers || 50,
            layersRendered: 0,
            _cachedBase: null,
            _cachedBaseLevel: -1
        });
    }

    /**
     * Advance all wet watercolor elements by one frame.
     * Called automatically from update(). Each frame, elements gain wetness
     * and render 1+ new watercolor layers at the current deformation level.
     * @private
     */
    _advanceWetElements() {
        for (let i = this._wetElements.length - 1; i >= 0; i--) {
            const el = this._wetElements[i];
            el.wetness = Math.min(el.wetness + 1, el.maxWetness);

            // How many layers to add this frame (spread evenly over lifetime)
            const layersPerFrame = Math.max(1, Math.ceil(el.targetLayers / el.maxWetness));
            const layersThisFrame = Math.min(layersPerFrame, el.targetLayers - el.layersRendered);

            if (layersThisFrame <= 0) {
                this._wetElements.splice(i, 1);
                continue;
            }

            // Deformation quality ramps up with wetness (the "paint drying" effect)
            const t = el.wetness / el.maxWetness; // 0→1

            // Base deformation: 1 round at start → peakBaseRounds at full wetness
            const baseRounds = Math.max(1, Math.round(1 + t * (el.peakBaseRounds - 1)));
            // Per-layer deformation: 0 at start → peakLayerRounds at full wetness
            const layerRounds = Math.round(t * el.peakLayerRounds);
            // Variance grows as paint spreads
            const variance = el.variance * (0.3 + t * 0.7);

            // Recompute base polygon when deformation level changes
            if (el._cachedBaseLevel !== baseRounds) {
                el._cachedBase = this.deformPolygon(el.polygon, {
                    rounds: baseRounds,
                    variance: el.variance
                });
                el._cachedBaseLevel = baseRounds;
            }

            for (let l = 0; l < layersThisFrame; l++) {
                const layerT = el.layersRendered / el.targetLayers;

                // Pigment concentration: early layers → tight; late → feathered
                let extraRounds = layerRounds;
                if (el.concentrate) {
                    if (layerT < 0.33) extraRounds = Math.max(0, Math.floor(layerRounds * 0.3));
                    else if (layerT < 0.66) extraRounds = Math.max(0, Math.floor(layerRounds * 0.6));
                }

                const layerPoly = extraRounds > 0
                    ? this.deformPolygon(el._cachedBase, {
                        rounds: extraRounds,
                        variance: variance * 0.6
                      })
                    : el._cachedBase;

                this._renderPolygonFill(layerPoly, el.cx, el.cy, {
                    color: el.color,
                    a: el.opacity,
                    layer: el.layer,
                    lifetime: el.lifetime,
                    texture: 'soft_round'
                });

                // Texture masking dots
                if (el.textureDots > 0) {
                    for (let d = 0; d < el.textureDots; d++) {
                        const tx = el.cx + FatihaBrush.gaussian(0, el.boundR * 0.6);
                        const ty = el.cy + FatihaBrush.gaussian(0, el.boundR * 0.6);
                        this.addStamp({
                            x: tx, y: ty,
                            color: el.color,
                            a: el.opacity * 0.5,
                            scaleX: el.textureRadius * (0.5 + Math.random()),
                            scaleY: el.textureRadius * (0.5 + Math.random()),
                            texture: 'soft_round',
                            layer: el.layer,
                            lifetime: el.lifetime
                        });
                    }
                }

                el.layersRendered++;
            }
        }
    }

    /**
     * Internal: fill a deformed polygon using triangle-fan scatter.
     * Places stamps at random positions inside the polygon by sampling
     * random triangles in the centroid fan with barycentric coordinates.
     * Stamp size scales with polygon bounding radius for full coverage.
     */
    _renderPolygonFill(poly, cx, cy, opts) {
        const n = poly.length;
        if (n < 3) return;

        // Compute bounding radius for adaptive stamp sizing
        let boundR = 0;
        for (let i = 0; i < n; i++) {
            const dx = poly[i].x - cx, dy = poly[i].y - cy;
            const d = Math.sqrt(dx * dx + dy * dy);
            if (d > boundR) boundR = d;
        }

        // Stamp size scales with polygon — larger stamps for larger shapes
        const stampScale = Math.max(4, boundR * 0.4);
        // Number of stamps scales with area (bounded)
        const numStamps = Math.max(10, Math.min(80, Math.ceil(boundR * 1.2)));

        for (let s = 0; s < numStamps; s++) {
            // Pick a random triangle in the centroid → edge fan
            const i = Math.floor(Math.random() * n);
            const v0 = poly[i];
            const v1 = poly[(i + 1) % n];

            // Random barycentric coordinates within triangle
            let u = Math.random(), v = Math.random();
            if (u + v > 1) { u = 1 - u; v = 1 - v; }
            const w = 1 - u - v;

            const px = cx * w + v0.x * u + v1.x * v;
            const py = cy * w + v0.y * u + v1.y * v;

            this.addStamp({
                x: px + FatihaBrush.gaussian(0, 2),
                y: py + FatihaBrush.gaussian(0, 2),
                color: opts.color,
                a: opts.a,
                scaleX: stampScale * (0.7 + Math.random() * 0.6),
                scaleY: stampScale * (0.7 + Math.random() * 0.6),
                texture: opts.texture || 'soft_round',
                layer: opts.layer,
                lifetime: opts.lifetime || 99999
            });
        }
    }

    // ── Soft Textures ────────────────────────────────────────

    /**
     * Soft edge gradient — layered transparent rectangles with
     * Gaussian-varied edges. Creates organic fade transitions.
     *
     * @param {number} x — left edge
     * @param {number} y — top edge
     * @param {number} w — width
     * @param {number} h — height
     * @param {Object} [opts]
     * @param {string} [opts.color='#ffffff']
     * @param {number} [opts.layers=40] — number of transparent layers
     * @param {number} [opts.opacity=0.04] — per-layer opacity
     * @param {number} [opts.variance=30] — Gaussian edge variance in pixels
     * @param {string} [opts.edge='right'] — which edge to soften ('left','right','top','bottom','all')
     * @param {string} [opts.layer]
     * @param {number} [opts.lifetime=99999]
     */
    softEdge(x, y, w, h, opts = {}) {
        const color = opts.color || '#ffffff';
        const numLayers = opts.layers || 40;
        const opacity = opts.opacity !== undefined ? opts.opacity : 0.04;
        const variance = opts.variance || 30;
        const edge = opts.edge || 'right';
        const layer = opts.layer || this.layerNames[0];
        const lifetime = opts.lifetime !== undefined ? opts.lifetime : 99999;

        for (let i = 0; i < numLayers; i++) {
            // Vary the rectangle edge position with Gaussian noise
            let lx = x, ly = y, lw = w, lh = h;

            if (edge === 'right' || edge === 'all') {
                lw += FatihaBrush.gaussian(0, variance);
            }
            if (edge === 'left' || edge === 'all') {
                const shift = FatihaBrush.gaussian(0, variance);
                lx += shift;
                lw -= shift;
            }
            if (edge === 'bottom' || edge === 'all') {
                lh += FatihaBrush.gaussian(0, variance);
            }
            if (edge === 'top' || edge === 'all') {
                const shift = FatihaBrush.gaussian(0, variance);
                ly += shift;
                lh -= shift;
            }

            if (lw <= 0 || lh <= 0) continue;

            // Fill with stamps
            const stampSize = Math.min(lw, lh, 12);
            const cols = Math.max(1, Math.ceil(lw / stampSize));
            const rows = Math.max(1, Math.ceil(lh / stampSize));
            for (let r = 0; r < rows; r++) {
                for (let c = 0; c < cols; c++) {
                    this.addStamp({
                        x: lx + (c + 0.5) * (lw / cols) + FatihaBrush.gaussian(0, 1),
                        y: ly + (r + 0.5) * (lh / rows) + FatihaBrush.gaussian(0, 1),
                        color,
                        a: opacity,
                        scaleX: stampSize * 0.6,
                        scaleY: stampSize * 0.6,
                        texture: 'soft_round',
                        layer,
                        lifetime
                    });
                }
            }
        }
    }

    /**
     * Stipple dots with Gaussian falloff from a path or region edge.
     * Creates smooth organic fades without directional bias.
     *
     * @param {Array<{x:number, y:number}>} edgePoints — points defining the edge to stipple from
     * @param {Object} [opts]
     * @param {string} [opts.color='#ffffff']
     * @param {number} [opts.count=5000] — total dots
     * @param {number} [opts.spread=60] — Gaussian spread from edge (px)
     * @param {number} [opts.dotSize=2] — base dot radius
     * @param {number} [opts.opacity=0.8] — per-dot opacity
     * @param {string} [opts.direction='outward'] — 'outward', 'inward', or 'both'
     * @param {string} [opts.layer]
     * @param {number} [opts.lifetime=99999]
     */
    stipple(edgePoints, opts = {}) {
        if (!edgePoints || edgePoints.length < 2) return;

        const color = opts.color || '#ffffff';
        const count = opts.count || 5000;
        const spread = opts.spread || 60;
        const dotSize = opts.dotSize || 2;
        const opacity = opts.opacity !== undefined ? opts.opacity : 0.8;
        const direction = opts.direction || 'outward';
        const layer = opts.layer || this.layerNames[0];
        const lifetime = opts.lifetime !== undefined ? opts.lifetime : 99999;

        // Compute cumulative edge lengths for uniform sampling along edge
        const lengths = [0];
        for (let i = 1; i < edgePoints.length; i++) {
            const dx = edgePoints[i].x - edgePoints[i - 1].x;
            const dy = edgePoints[i].y - edgePoints[i - 1].y;
            lengths.push(lengths[i - 1] + Math.sqrt(dx * dx + dy * dy));
        }
        const totalLen = lengths[lengths.length - 1];
        if (totalLen < 1) return;

        for (let d = 0; d < count; d++) {
            // Pick random point along edge
            const dist = Math.random() * totalLen;
            let seg = 0;
            while (seg < edgePoints.length - 2 && lengths[seg + 1] < dist) seg++;
            const segLen = lengths[seg + 1] - lengths[seg];
            const segT = segLen > 0 ? (dist - lengths[seg]) / segLen : 0;

            const ex = edgePoints[seg].x + (edgePoints[seg + 1].x - edgePoints[seg].x) * segT;
            const ey = edgePoints[seg].y + (edgePoints[seg + 1].y - edgePoints[seg].y) * segT;

            // Edge normal (perpendicular)
            const dx = edgePoints[seg + 1].x - edgePoints[seg].x;
            const dy = edgePoints[seg + 1].y - edgePoints[seg].y;
            const len = Math.sqrt(dx * dx + dy * dy);
            const nx = -dy / (len || 1);
            const ny = dx / (len || 1);

            // Gaussian offset from edge
            let offset;
            if (direction === 'both') {
                offset = FatihaBrush.gaussian(0, spread);
            } else if (direction === 'inward') {
                offset = -Math.abs(FatihaBrush.gaussian(0, spread));
            } else {
                offset = Math.abs(FatihaBrush.gaussian(0, spread));
            }

            this.addStamp({
                x: ex + nx * offset + FatihaBrush.gaussian(0, 1),
                y: ey + ny * offset + FatihaBrush.gaussian(0, 1),
                color,
                a: opacity * (0.3 + Math.random() * 0.7),
                scaleX: dotSize * (0.5 + Math.random()),
                scaleY: dotSize * (0.5 + Math.random()),
                texture: 'soft_round',
                layer,
                lifetime
            });
        }
    }

    /**
     * Draw clustered line bundles — Tyler Hobbs' "bird's nest" technique.
     * Groups of 8 closely-related lines create organic texture.
     *
     * @param {number} x — center x
     * @param {number} y — center y
     * @param {Object} [opts]
     * @param {string} [opts.color='#ffffff']
     * @param {number} [opts.groups=20] — number of line groups
     * @param {number} [opts.linesPerGroup=8] — lines per cluster
     * @param {number} [opts.spread=60] — Gaussian spread for group placement
     * @param {number} [opts.clusterTight=5] — tightness within each group (px)
     * @param {number} [opts.lineLength=40] — base line length
     * @param {number} [opts.weight=1] — stroke weight
     * @param {number} [opts.opacity=0.3]
     * @param {string} [opts.layer]
     * @param {number} [opts.lifetime=99999]
     */
    drawCluster(x, y, opts = {}) {
        const color = opts.color || '#ffffff';
        const groups = opts.groups || 20;
        const linesPerGroup = opts.linesPerGroup || 8;
        const spread = opts.spread || 60;
        const tight = opts.clusterTight || 5;
        const lineLen = opts.lineLength || 40;
        const weight = opts.weight || 1;
        const opacity = opts.opacity !== undefined ? opts.opacity : 0.3;
        const layer = opts.layer || this.layerNames[0];
        const lifetime = opts.lifetime !== undefined ? opts.lifetime : 99999;

        for (let g = 0; g < groups; g++) {
            // Group center and direction
            const gx = x + FatihaBrush.gaussian(0, spread);
            const gy = y + FatihaBrush.gaussian(0, spread);
            const angle = Math.random() * Math.PI;
            const halfLen = Math.abs(FatihaBrush.gaussian(lineLen / 2, lineLen * 0.3));

            for (let l = 0; l < linesPerGroup; l++) {
                // Tight variation within group
                const lx1 = gx + FatihaBrush.gaussian(0, tight);
                const ly1 = gy + FatihaBrush.gaussian(0, tight);
                const la = angle + FatihaBrush.gaussian(0, 0.15);
                const lLen = halfLen + FatihaBrush.gaussian(0, tight);

                const lx2 = lx1 + Math.cos(la) * lLen;
                const ly2 = ly1 + Math.sin(la) * lLen;

                this.drawLine(lx1, ly1, lx2, ly2, {
                    color,
                    weight,
                    alpha: opacity * (0.5 + Math.random() * 0.5),
                    texture: 'hatch_line',
                    layer,
                    spacing: 0.5,
                    scatter: 0.1,
                    grain: 0.8,
                    lifetime
                });
            }
        }
    }

    // ── Layered Painting (Hack-a-Painting approach) ──────────

    /**
     * Paint interleaved watercolor blobs — the "hack a painting" technique.
     * Renders multiple blobs simultaneously, interleaving their layers
     * for natural color mixing at overlaps.
     *
     * @param {Array<{polygon: Array<{x:number, y:number}>, color: string}>} blobs
     *   Array of blob definitions, each with polygon vertices and color.
     * @param {Object} [opts]
     * @param {number} [opts.layers=50] — total layers per blob
     * @param {number} [opts.opacity=0.04] — per-layer opacity
     * @param {number} [opts.interleave=5] — layers of each blob before switching
     * @param {number} [opts.baseRounds=5] — base polygon deformation
     * @param {number} [opts.layerRounds=3] — per-layer extra deformation
     * @param {number} [opts.variance=0.4]
     * @param {string} [opts.layer]
     * @param {number} [opts.lifetime=99999]
     */
    paintInterleaved(blobs, opts = {}) {
        if (!blobs || blobs.length === 0) return;

        const numLayers = opts.layers || 50;
        const baseOpacity = opts.opacity !== undefined ? opts.opacity : 0.04;
        const interleave = opts.interleave || 5;
        const baseRounds = opts.baseRounds !== undefined ? opts.baseRounds : 5;
        const layerRounds = opts.layerRounds !== undefined ? opts.layerRounds : 3;
        const baseVar = opts.variance !== undefined ? opts.variance : 0.4;
        const layer = opts.layer || this.layerNames[0];
        const lifetime = opts.lifetime !== undefined ? opts.lifetime : 99999;

        // Pre-compute base polygons and centroids for each blob
        const blobData = blobs.map(blob => {
            const basePoly = this.deformPolygon(blob.polygon, {
                rounds: baseRounds,
                variance: baseVar
            });
            let cx = 0, cy = 0;
            for (const p of blob.polygon) { cx += p.x; cy += p.y; }
            cx /= blob.polygon.length;
            cy /= blob.polygon.length;
            return { basePoly, cx, cy, color: blob.color || '#4488aa' };
        });

        // Render interleaved: `interleave` layers of each blob in round-robin
        const totalPasses = Math.ceil(numLayers / interleave);

        for (let pass = 0; pass < totalPasses; pass++) {
            for (let bi = 0; bi < blobData.length; bi++) {
                const b = blobData[bi];
                const startLayer = pass * interleave;
                const endLayer = Math.min(startLayer + interleave, numLayers);

                for (let li = startLayer; li < endLayer; li++) {
                    const t = li / numLayers;

                    // Pigment concentration
                    let extraRounds = layerRounds;
                    if (t < 0.33) extraRounds = Math.max(1, Math.floor(layerRounds * 0.4));
                    else if (t < 0.66) extraRounds = Math.max(1, Math.floor(layerRounds * 0.7));

                    const layerPoly = this.deformPolygon(b.basePoly, {
                        rounds: extraRounds,
                        variance: baseVar * 0.6
                    });

                    this._renderPolygonFill(layerPoly, b.cx, b.cy, {
                        color: b.color,
                        a: baseOpacity,
                        layer,
                        lifetime,
                        texture: 'soft_round'
                    });
                }
            }
        }
    }

    /**
     * Create a simple polygon shape for use with watercolor()/paintInterleaved().
     * Convenience method for common shapes.
     *
     * @param {string} type — 'circle', 'triangle', 'quad', 'petal', 'star'
     * @param {number} cx — center x
     * @param {number} cy — center y
     * @param {number} radius — approximate size
     * @param {Object} [opts]
     * @param {number} [opts.rotation=0] — rotation in radians
     * @param {number} [opts.points=12] — vertex count for circle
     * @param {number} [opts.aspect=1] — width/height ratio
     * @returns {Array<{x:number, y:number}>}
     */
    static makePolygon(type, cx, cy, radius, opts = {}) {
        const rot = opts.rotation || 0;
        const aspect = opts.aspect || 1;

        const rotate = (px, py) => {
            const cos = Math.cos(rot);
            const sin = Math.sin(rot);
            return {
                x: cx + (px * cos - py * sin),
                y: cy + (px * sin + py * cos)
            };
        };

        switch (type) {
            case 'circle': {
                const n = opts.points || 12;
                const pts = [];
                for (let i = 0; i < n; i++) {
                    const a = (i / n) * Math.PI * 2;
                    pts.push(rotate(
                        Math.cos(a) * radius * aspect,
                        Math.sin(a) * radius
                    ));
                }
                return pts;
            }
            case 'triangle':
                return [
                    rotate(0, -radius),
                    rotate(-radius * aspect * 0.866, radius * 0.5),
                    rotate(radius * aspect * 0.866, radius * 0.5)
                ];
            case 'quad':
                return [
                    rotate(-radius * aspect, -radius),
                    rotate(radius * aspect, -radius),
                    rotate(radius * aspect, radius),
                    rotate(-radius * aspect, radius)
                ];
            case 'petal':
                // Ogee/almond shape — 8 control points
                return [
                    rotate(0, -radius),
                    rotate(radius * aspect * 0.4, -radius * 0.6),
                    rotate(radius * aspect * 0.5, 0),
                    rotate(radius * aspect * 0.4, radius * 0.6),
                    rotate(0, radius),
                    rotate(-radius * aspect * 0.4, radius * 0.6),
                    rotate(-radius * aspect * 0.5, 0),
                    rotate(-radius * aspect * 0.4, -radius * 0.6)
                ];
            case 'star': {
                const n = opts.points || 5;
                const pts = [];
                for (let i = 0; i < n * 2; i++) {
                    const a = (i / (n * 2)) * Math.PI * 2;
                    const r = (i % 2 === 0) ? radius : radius * 0.4;
                    pts.push(rotate(Math.cos(a) * r * aspect, Math.sin(a) * r));
                }
                return pts;
            }
            default:
                return [rotate(-radius, -radius), rotate(radius, -radius),
                        rotate(radius, radius), rotate(-radius, radius)];
        }
    }

    // ── Combined Wash + Texture (Convenience) ────────────────

    /**
     * Rich watercolor wash — combines watercolor blob with stipple edge
     * and optional hatch texture. A high-level "just paint something beautiful" method.
     *
     * @param {number} cx — center x
     * @param {number} cy — center y
     * @param {number} radius — approximate blob radius
     * @param {Object} [opts]
     * @param {string} [opts.color='#4488aa']
     * @param {number} [opts.layers=30] — watercolor layers
     * @param {number} [opts.opacity=0.04]
     * @param {number} [opts.edgeStipple=2000] — stipple dots around edge (0 = none)
     * @param {number} [opts.edgeSpread=20] — stipple spread in px
     * @param {boolean} [opts.hatch=false] — add hatch texture
     * @param {number} [opts.hatchSpacing=4]
     * @param {string} [opts.shape='circle'] — base shape type
     * @param {number} [opts.variance=0.4]
     * @param {string} [opts.layer]
     * @param {number} [opts.lifetime=99999]
     */
    richWash(cx, cy, radius, opts = {}) {
        const color = opts.color || '#4488aa';
        const shape = opts.shape || 'circle';
        const layer = opts.layer || this.layerNames[0];
        const lifetime = opts.lifetime !== undefined ? opts.lifetime : 99999;

        // Create base polygon
        const polygon = FatihaBrush.makePolygon(shape, cx, cy, radius, {
            rotation: opts.rotation || 0,
            aspect: opts.aspect || 1
        });

        // Main watercolor fill
        this.watercolor(polygon, {
            color,
            layers: opts.layers || 30,
            opacity: opts.opacity !== undefined ? opts.opacity : 0.04,
            variance: opts.variance !== undefined ? opts.variance : 0.4,
            layer,
            lifetime,
            baseRounds: opts.baseRounds,
            layerRounds: opts.layerRounds,
            concentratePigment: opts.concentratePigment
        });

        // Edge stipple for soft bleeding
        if (opts.edgeStipple !== 0) {
            this.stipple(polygon, {
                color,
                count: opts.edgeStipple || 2000,
                spread: opts.edgeSpread || 20,
                dotSize: 1.5,
                opacity: 0.3,
                direction: 'both',
                layer,
                lifetime
            });
        }

        // Optional hatch texture
        if (opts.hatch) {
            this.addHatch(cx, cy, radius * 0.7,
                FatihaBrush.gaussian(0, Math.PI / 4),
                opts.hatchSpacing || 4, {
                    color,
                    a: 0.15,
                    layer,
                    lifetime
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

        // Advance wet watercolor elements (progressive deformation)
        this._advanceWetElements();

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

        // Set uniforms (no textures needed — all procedural)
        gl.uniform1f(this._uGrainStrength, this.grainStrength);
        gl.uniform1f(this._uColorJitter, this.colorJitter);
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
        this._wetElements = [];
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
