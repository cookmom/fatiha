# Lessons to append to lessons.md (2026-02-23)

### 6. Three.js ShaderMaterial is INVISIBLE to transmission FBO
**When:** Feb 23, 2026
**What happened:** Glass cube appeared opaque. Spent hours tweaking material properties, onBeforeCompile overrides, render order — nothing worked.
**Root cause:** Ring meshes behind the glass used custom ShaderMaterial. Three.js's transmission pre-pass ONLY captures objects with built-in materials (MeshBasicMaterial, MeshStandardMaterial, etc). ShaderMaterial objects are silently skipped.
**Lesson:** For any object that needs to be visible through transmissive glass, use built-in Three.js materials. Never ShaderMaterial.

### 7. ALWAYS verify with GPU Chrome before pushing
**When:** Feb 23, 2026
**What happened:** Pushed 10+ broken versions. Tawfeeq had to QC every version.
**Lesson:** Fix infrastructure (permissions, exec access) BEFORE starting code work. Never push without a GPU screenshot verification. Rule 0c is non-negotiable.

### 8. Proxy dedup keys must be stable
**When:** Feb 23, 2026
**What happened:** Heartbeat and main session killed each other in a dedup loop.
**Lesson:** Session key = body.user > X-Session-ID > model name. Never include volatile data in dedup keys.
