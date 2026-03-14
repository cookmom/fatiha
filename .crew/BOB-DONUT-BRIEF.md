# Bob's First Brief — Blender Donut Tutorial (Blender Guru, Blender 5.0)

## Your Mission
Work through this tutorial IN Blender, live. Every step executes in the real GUI — Tawfeeq is watching. But this isn't just about making a donut. **You are building your foundational Blender muscle memory.** Every technique you learn here — mesh primitives, edit mode, modifiers, shading — is a tool you'll reach for on every future brief.

## How to Learn (Not Just Follow)
For each step:
1. **Understand WHY** before you execute. What principle does this teach?
2. **Execute the code** — make it happen in Blender
3. **Verify visually** — check the scene state after each step
4. **Log the transferable skill** — strip the donut-specific detail, keep the universal technique

Example: "Delete the default cube" → Skill: `bpy.data.objects.remove()` to clean scene before starting. Always start from a clean slate.

## Tutorial Transcript

### Phase 1: Scene Setup
- Delete the default cube (X → Delete, or `bpy.data.objects.remove()`)
- Add a Torus mesh (Shift+A → Mesh → Torus)
  - Major radius: 0.1 (10cm — real-world scale matters)
  - Minor radius: 0.057
  - Major segments: 48, Minor segments: 18
- Apply Shade Smooth (right-click → Shade Smooth)
- **Skill: Choosing the right primitive. Pick the shape closest to your target. Torus for donut, cylinder for mug. Real-world scale (0.1m = 10cm) keeps lighting and physics predictable.**

### Phase 2: Adding a Second Object (Coffee Mug)
- Add Cylinder (Shift+A → Mesh → Cylinder)
  - Radius: 0.13
  - Depth (height): adjust to look right (~0.2)
  - Vertices: 14 (deliberately low — subdivision will add geometry later)
- Move cylinder behind donut: G → Y to push back
- **Skill: Start low-poly when you know you'll subdivide. High base + subdivision = unnecessarily heavy mesh. G/R/S (Grab/Rotate/Scale) are the holy trinity of transforms.**

### Phase 3: Edit Mode — Hollowing the Mug
- Select the cylinder, Tab into Edit Mode
- Switch to Face Select mode (3 key)
- Select top face, X → Delete Faces (hollow the cup)
- **Skill: Edit Mode vs Object Mode — the fundamental duality. Face/Edge/Vertex selection modes (1/2/3). Deleting faces vs vertices vs edges — know the difference.**

### Phase 4: Solidify Modifier (Adding Thickness)
- Add Solidify modifier to the cylinder
  - Thickness: ~0.01 (thin but visible wall)
  - Offset: -1 (grow inward)
- **Skill: Modifiers are non-destructive transforms. Solidify adds wall thickness to any hollow mesh. The modifier stack is your undo safety net — changes without commitment.**

### Phase 5: Subdivision Surface Modifier
- Add Subdivision Surface modifier
  - Viewport: 2, Render: 2
- Apply AFTER Solidify in the stack (order matters!)
- **Skill: Modifier stack ORDER matters. Solidify → Subdiv gives clean thickness then smooth. Subdiv → Solidify would subdivide first then add thickness to every tiny face. Think of it as a pipeline.**

### Phase 6: Shaping the Mug (Edit Mode Sculpting)
- Tab into Edit Mode
- Enable Proportional Editing (O key)
  - Falloff: Smooth
- Select vertices at the top rim
- Scale inward slightly (S → Shift+Z to exclude Z axis)
- Adjust proportional editing radius with scroll wheel
- Shape the bottom to taper slightly
- **Skill: Proportional Editing is soft selection — it moves nearby vertices with falloff. Essential for organic shapes. Axis exclusion (Shift+Z = "everything except Z") is a power move.**

### Phase 7: Adding a Handle (Extrusion)
- In Edit Mode, Face Select mode
- Select a face on the side of the mug
- Extrude (E) outward, then scale, then extrude again
- Shape into a handle loop
- Bridge Edge Loops to close the handle
- **Skill: Extrusion is how you grow geometry from existing faces. The Extrude → Scale → Extrude pattern creates complex shapes from simple ones. Bridge Edge Loops connects two open loops into a seamless mesh.**

### Phase 8: Materials Basics
- Create a new material for the mug
- Set Base Color
- Adjust Roughness (lower = shinier)
- Create a second material for the donut
- **Skill: Materials define surface appearance. Base Color + Roughness + Metallic are the PBR trinity. Assign materials per-object or per-face for variation.**

## After You're Done
Write a summary of every transferable skill you learned, in a format that future-you can reference on any brief. Not donut-specific — universal Blender techniques.

Save to: `/home/openclaw-agent/.openclaw/workspace/memory/bob-blender-skills.md`
