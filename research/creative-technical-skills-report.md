# Creative & Technical Domain Skills Research Report
**Date:** 2026-02-15 | **For:** OpenClaw Agent Skill Development

---

## Executive Summary

The creative/technical AI agent space is rapidly maturing. Key findings:
- **Anthropic's official `frontend-design` skill** exists for Claude Code — it covers UI/UX, color theory, motion, and typography
- **Remotion Agent Skills** (viral, 8.3M views) let Claude Code generate motion graphics/video from prompts
- **Three.js Skills** (`CloudAI-X/threejs-skills`) provide 10 specialized skill files for 3D/WebGL
- **KiCAD MCP Server** enables natural-language PCB design
- **Blender MCP** connects Claude to Blender for 3D modeling
- **ClawHub** has 5,705 skills (3,002 curated) but **very few cover creative/visual domains** — this is the gap

---

## 1. Circuit Design

### Existing Tools & Skills
- **KiCAD MCP Server** (`github.com/mixelpixx/KiCAD-MCP-Server`) — MCP implementation letting Claude directly interact with KiCAD. Natural language → PCB design. V2.0 rebuild in progress.
  - URL: https://github.com/mixelpixx/KiCAD-MCP-Server
  - LobeHub listing: https://lobehub.com/mcp/mixelpixx-kicad-mcp-server
- **Circuit-Synth** — Python library + Claude Code infrastructure that generates KiCAD projects with hierarchical labels and rectangular PCB layouts
  - Discussed on KiCAD dev mailing list: https://groups.google.com/a/kicad.org/g/devlist/c/4hjJIFbBtXU

### Prompting Techniques
- Describe circuits functionally: "Design a 5V buck converter with 24V input and 2A output"
- Use incremental design: specify subcircuits, then ask for integration
- Request BOM (Bill of Materials) alongside schematics

### Reference Tools/APIs
- KiCAD Python API (scripting console)
- SPICE simulation (LTspice, ngspice)
- JLCPCB/LCSC component APIs for part selection
- Octopart API for component search

### Gap Analysis — Skills to Build
- ❌ No OpenClaw/ClawHub skill for circuit design
- ❌ No SPICE simulation integration skill
- ❌ No component selection/BOM optimization skill
- **BUILD:** `circuit-designer` skill — wraps KiCAD Python API + component databases, generates netlists from natural language descriptions

---

## 2. Blueprint/Architectural Design

### Existing Tools
- **Maket.ai** — AI floor plan generator from text descriptions (https://www.maket.ai/)
- **Blueprints AI** — Simple 2D layout generator
- **Getfloorplan** — Converts sketches to 2D/3D floor plans
- **Snaptrude** — AI-powered architecture tool (https://www.snaptrude.com/)

### What Claude Can Do Directly
- Generate SVG floor plans with precise dimensions
- Output DXF-like coordinate data
- Create room layout algorithms
- Generate building code compliance checklists

### Prompting Techniques
- Specify exact dimensions, room counts, adjacency requirements
- Ask for SVG output with labeled rooms and dimensions
- Use constraints: "north-facing living room, kitchen adjacent to dining"
- Request multiple layout options for comparison

### Gap Analysis — Skills to Build
- ❌ No ClawHub skill for floor plans or architectural design
- ❌ No SVG-based floor plan generation skill
- **BUILD:** `floor-plan-generator` skill — generates dimensioned SVG floor plans from natural language, supports building codes, outputs to Canvas
- **BUILD:** `architectural-drawing` skill — technical drawing conventions, section cuts, elevation views

---

## 3. Creative Design (UI/UX, Graphic Design)

### Existing Skills & Tools
- **Anthropic's Official `frontend-design` Skill** — Part of Claude Code's plugin system
  - URL: https://github.com/anthropics/claude-code/blob/main/plugins/frontend-design/skills/frontend-design/SKILL.md
  - Covers: color & theme (CSS variables, dominant + accent), motion/micro-interactions, typography hierarchy, layout patterns
  - Key insight: "Dominant colors with sharp accents outperform timid, evenly-distributed palettes"
- **Claude Code UI Agents** (`github.com/mustafakendiguzel/claude-code-ui-agents`) — Curated prompt collection for UI/UX
  - URL: https://github.com/mustafakendiguzel/claude-code-ui-agents
- **Reddit: "8 years of product design condensed into a Claude skill"** — Community skill for polished UI generation
  - URL: https://www.reddit.com/r/ClaudeAI/comments/1q4l76k/
- **Figma MCP** — Claude can generate design systems directly in Figma
  - Claude → Figma design system generation demonstrated by TJ Pitre
  - URL: https://www.reddit.com/r/ClaudeAI/comments/1qo371x/
- **Claude + Figma + Code Connect** workflow documented:
  - URL: https://uxdesign.cc/designing-with-claude-code-and-codex-cli-building-ai-driven-workflows-powered-by-code-connect-ui-f10c136ec11f

### Prompting Techniques
- Reference specific design systems (Material Design 3, Apple HIG)
- Specify visual density and whitespace preferences
- Ask for CSS custom properties for theming
- Request component states: default, hover, active, disabled, loading, error, empty
- "Design mobile-first, then responsive breakpoints"

### Gap Analysis
- ✅ Frontend design skill exists (Anthropic official)
- ❌ No dedicated design system generator skill on ClawHub
- ❌ No icon/illustration generation skill (SVG)
- **BUILD:** `design-system-builder` — generates complete design tokens, component library specs, Figma-exportable assets
- **BUILD:** `svg-illustration` — generates SVG icons, illustrations, and diagrams from descriptions

---

## 4. CG/VFX Modeling

### Existing Tools & Skills
- **Blender MCP** — AI-powered 3D modeling with Claude integration
  - URL: https://blender-mcp.com/
  - Create, modify, enhance 3D models via natural language
  - Tutorial: https://designcode.io/cursor-create-3d-models-with-claude-ai-and-blender-mcp/
  - Video demo: https://www.youtube.com/watch?v=r7H60u0kHRA
- **Claude for 3D Design Guide** — Detailed guide on procedural generation via Claude
  - URL: https://www.becomeanaimarketer.com/p/guide-claude-for-3d-design
  - Key: Systematic incremental approach (walls → columns → arches)
  - Complex procedural Python scripts for gothic arch curves, ribbed vault geometry

### How People Are Using It
- Writing Blender Python scripts for procedural geometry
- Node-based shader networks via natural language
- Generating parametric architecture (gothic cathedrals, modern buildings)
- Creating geometry nodes setups

### Prompting Techniques
- Break complex models into subsystems
- Specify topology requirements (quad-dominant, subdivision-ready)
- Reference real-world dimensions
- Ask for Blender Python scripts, not just descriptions

### Reference APIs
- Blender Python API (`bpy`)
- OpenUSD/glTF for interchange
- Houdini HDAs (procedural)

### Gap Analysis
- ❌ No ClawHub/OpenClaw skill for Blender automation
- ❌ No procedural geometry generation skill
- ❌ No glTF/USD scene description skill
- **BUILD:** `blender-procedural` — Blender Python script generation for procedural modeling
- **BUILD:** `scene-description` — generates glTF/USD scene graphs from natural language

---

## 5. Lookdev (Materials/Shaders/Texturing)

### Existing Tools
- **Three.js Materials Skill** (part of `CloudAI-X/threejs-skills`)
  - `threejs-materials` — PBR materials, basic/phong/standard, shader materials
  - `threejs-textures` — UV mapping, environment maps, render targets
  - URL: https://github.com/CloudAI-X/threejs-skills
- **D5 AI PBR Material Snap** — Photo → PBR material conversion
  - URL: https://www.d5render.com/posts/free-pbr-textures-ai-pbr-material-snap-d5
- **V-Ray AI Material Generator** — Photos → PBR materials for Houdini/Maya
  - URL: https://blog.chaos.com/real-time-rendering-arrives-in-houdini-and-maya-viewports

### What Claude Can Generate Directly
- GLSL/TSL shader code for custom materials
- PBR parameter sets (albedo, roughness, metalness, normal)
- Blender shader node graphs via Python
- Three.js ShaderMaterial with proper uniforms
- CSS material-like effects (glassmorphism, neumorphism)

### Reference Resources
- LearnOpenGL PBR: https://learnopengl.com/PBR/Lighting
- Shadertoy (inspiration + patterns)
- ambientCG (free PBR textures)
- Poly Haven (HDRIs, textures, models)

### Gap Analysis
- ❌ No dedicated lookdev/material design skill
- ❌ No PBR parameter reference skill
- **BUILD:** `pbr-material-designer` — generates complete PBR material definitions with proper physically-based values, outputs to Three.js/Blender/USD
- **BUILD:** `shader-workshop` — interactive GLSL shader development with live preview via Canvas

---

## 6. Lighting

### Existing Skills
- **Three.js Lighting Skill** (part of `CloudAI-X/threejs-skills`)
  - `threejs-lighting` — Light types, shadows, environment lighting, helpers
  - URL: https://github.com/CloudAI-X/threejs-skills

### What Claude Can Do
- Generate Three.js lighting setups (3-point, product, cinematic)
- Write Blender Python for lighting rigs
- Describe IES light profiles
- Create CSS lighting effects (gradients, shadows, backdrop-filter)
- HDRI environment selection guidance

### Prompting Techniques
- Reference photography lighting setups by name (Rembrandt, butterfly, split)
- Specify mood/atmosphere first, then technical parameters
- Ask for light ratios (key:fill:rim)
- Request shadow softness and falloff values

### Gap Analysis
- ❌ No dedicated lighting design skill
- **BUILD:** `lighting-designer` — lighting rig generator for Three.js and Blender, includes preset library (studio, product, cinematic, architectural), outputs proper shadow maps and light parameters

---

## 7. Animation

### Existing Skills & Tools
- **Remotion Agent Skills** — THE breakthrough. Claude Code generates motion graphics as React components, renders to MP4.
  - Official docs: https://www.remotion.dev/docs/ai/claude-code
  - Went viral (8.3M views on X, Jan 2026)
  - Guide: https://medium.com/@joe.njenga/claude-code-can-now-create-videos-with-this-one-skill-that-i-just-tested-e8a6a40e7e89
  - Reddit setup guide: https://www.reddit.com/r/MotionDesign/comments/1qkqxwm/
- **Three.js Animation Skill** (part of `CloudAI-X/threejs-skills`)
  - `threejs-animation` — Keyframe, skeletal, morph targets, animation mixing
- **Vibe Animating** (ClaudeLog technique)
  - URL: https://claudelog.com/inventions/vibe-animating/
  - Split SVGs into logical parts, animate with CSS
- **Framer Motion generation** via Claude for React apps
  - URL: https://uxplanet.org/claude-for-code-how-to-use-claude-to-streamline-product-design-process-97d4e4c43ca4
- **AI Co-Artist** — LLM-powered GLSL shader animation evolution
  - URL: https://arxiv.org/html/2512.08951v1

### Prompting Techniques
- Describe motion in terms of easing and timing: "ease-out over 300ms with a 50ms stagger"
- Reference motion design principles: anticipation, follow-through, squash-and-stretch
- For CSS: specify transform properties separately for compositing
- For Remotion: describe scenes as compositions with timelines

### Gap Analysis
- ✅ Remotion exists for video generation
- ❌ No dedicated CSS animation/micro-interaction skill
- ❌ No Lottie/bodymovin generation skill
- ❌ No easing curve designer skill
- **BUILD:** `motion-designer` — generates CSS/Framer Motion animations from natural language, includes easing curve library, stagger patterns, and choreography
- **BUILD:** `lottie-generator` — creates Lottie JSON animations for icons and micro-interactions

---

## Cross-Cutting: Tools & Skills That Apply Everywhere

### Canvas (OpenClaw Built-in)
- OpenClaw's Canvas can render HTML/CSS/JS live — perfect for previewing SVGs, animations, Three.js scenes, and UI components
- **This is underutilized** — a skill that outputs to Canvas for visual preview would be enormously valuable

### Three.js Skills Bundle
- **`CloudAI-X/threejs-skills`** — 10 comprehensive skill files covering the full Three.js pipeline
- URL: https://github.com/CloudAI-X/threejs-skills
- Covers: fundamentals, geometry, materials, lighting, textures, animation, loaders, shaders, postprocessing, interaction
- Verified against Three.js r160+ docs

### Anthropic's Frontend Design Plugin
- URL: https://github.com/anthropics/claude-code/blob/main/plugins/frontend-design/skills/frontend-design/SKILL.md
- Key principles encoded: cohesive aesthetics, CSS variables, motion for effects, typography hierarchy

### ClawHub Ecosystem
- 5,705 total skills, 3,002 curated (awesome-openclaw-skills)
- Categories with creative relevance: "Image & Video Generation" (60), "Web & Frontend Development" (202)
- URL: https://clawhub.ai
- Awesome list: https://github.com/VoltAgent/awesome-openclaw-skills

---

## Priority Build List (Skills That Don't Exist Yet)

### Tier 1 — High Impact, Clear Path
1. **`svg-designer`** — SVG generation for diagrams, icons, illustrations, floor plans, circuit schematics. Outputs to Canvas for preview.
2. **`motion-designer`** — CSS/Framer Motion/GSAP animations from natural language. Easing library, stagger choreography, micro-interactions.
3. **`shader-workshop`** — GLSL/TSL shader authoring with live Canvas preview. PBR materials, procedural textures, post-processing effects.

### Tier 2 — Domain-Specific, High Value
4. **`circuit-designer`** — Natural language → KiCAD netlists/schematics. Component database integration.
5. **`floor-plan-generator`** — Dimensioned SVG floor plans from room specs. Building code awareness.
6. **`lighting-designer`** — Three.js/Blender lighting rig presets from mood descriptions.

### Tier 3 — Ambitious, Differentiated
7. **`blender-procedural`** — Blender Python for procedural geometry and shader node graphs.
8. **`lottie-generator`** — JSON Lottie animations from descriptions for icons and UI.
9. **`design-system-builder`** — Complete design tokens + component specs from brand guidelines.

---

## Key Reference URLs

| Resource | URL |
|----------|-----|
| ClawHub (skills registry) | https://clawhub.ai |
| Awesome OpenClaw Skills | https://github.com/VoltAgent/awesome-openclaw-skills |
| ClawHub GitHub | https://github.com/openclaw/clawhub |
| Anthropic frontend-design skill | https://github.com/anthropics/claude-code/blob/main/plugins/frontend-design/skills/frontend-design/SKILL.md |
| Three.js Skills Bundle | https://github.com/CloudAI-X/threejs-skills |
| KiCAD MCP Server | https://github.com/mixelpixx/KiCAD-MCP-Server |
| Blender MCP | https://blender-mcp.com/ |
| Remotion + Claude Code | https://www.remotion.dev/docs/ai/claude-code |
| AI Co-Artist (GLSL evolution) | https://arxiv.org/html/2512.08951v1 |
| Claude UI Agents prompts | https://github.com/mustafakendiguzel/claude-code-ui-agents |
| Vibe Animating technique | https://claudelog.com/inventions/vibe-animating/ |
| Claude for 3D Design guide | https://www.becomeanaimarketer.com/p/guide-claude-for-3d-design |
| LearnOpenGL PBR | https://learnopengl.com/PBR/Lighting |
| Circuit-Synth discussion | https://groups.google.com/a/kicad.org/g/devlist/c/4hjJIFbBtXU |

---

## Anthropic Skills Guide Summary
The PDF at `references/claude-skills-guide.pdf` (33 pages) covers the SKILL.md format, testing, workflow patterns, and organizational deployment. Skills = structured systems with frontmatter metadata, not just prompts. Key takeaway: skills should declare their `requires` (env vars, binaries) in frontmatter, include quick-start examples, and cross-reference related skills.
