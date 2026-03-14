# Bob's Blender Skills

Source: https://www.youtube.com/watch?v=z-Xl9tGqH14
Date: 2026-03-01 09:09
Model: qwen3.5:35b-a3b (local)
Stats: 38 actions, 24 errors, 0 crash recoveries

## Skills Acquired

1. Basic navigation - middle mouse button (scroll wheel click) orbits the 3D viewport; for 4K monitors, increase resolution scale in Interface preferences (1.5-1.8+) to make UI elements more visible.
2. Navigation shortcuts - MMB=orbit, Shift+MMB=pan, Scroll=zoom, Axis gizmo=reset orientation, Numpad Period=focus on selected object. These are fundamental skills you'll use constantly in Blender.
3. Use Shift+drag on numeric values in Blender for finer control when adjusting parameters, and always check the "Last Used Function" panel (F9) for additional options after creating objects.
4. Smooth shading is a mesh state (not geometry change) that makes flat faces appear smooth without adding computation - it's a visual trick that helps with modeling workflow.
5. Subdivision Surface modifier smooths mesh by adding geometry; hotkeys G/R/S activate transform modes instantly from anywhere on screen
6. Tab cycles between Object and Edit mode; G + axis key (X/Y/Z) locks movement direction; Numpad Period focuses view on selected object; vertices are the points that make up a mesh shape.
7. Hotkeys 1, 2, 3 switch selection modes; X deletes selected geometry; Solidify modifier adds thickness non-destructively
8. Subdivision Surface modifier smooths by averaging points across geometry levels; loop cuts add edge support to control where smoothing occurs
9. Inset tool (I) creates a loop around a selected face - useful for avoiding ngons and adding edge support for subsurf modifiers
10. Non-destructive workflows let you modify objects later without starting over; Blender auto-numbering helps version control your files; always use reference images for realistic modeling since our brains miss important details.
11. Two methods to add reference images in Blender: 1) Add Menu > Image > Reference, 2) Drag and drop image file directly into viewport. Reference images help guide modeling by showing real-world proportions and details.
12. How to clear rotation with Alt R, lock rotation to an axis with X/Y/Z, and set rotation to exact degrees by typing the number
13. Alt+click on edge selects entire edge loop; double G slides edge; S scales selected geometry
14. Loop cuts (Ctrl+R) add geometry to smooth out shading - more geometry = smoother subsurf modifier results
15. Applying modifiers converts them from non-destructive effects to actual mesh geometry, allowing direct editing of the mesh.
16. When extruding a handle, ensure you're selecting the correct face where the axis intersects the mug, and use top view to verify it's centered before extruding in front view.
17. Ctrl+R creates loop cuts; Ctrl+Right Click extrudes and auto-rotates faces for appendages; Z toggles viewport shading modes
18. Wireframe mode shows through mesh, X-ray (Alt+Z) is similar but different. Selecting vertices and pressing F creates faces. Inner faces can break smooth shading flow.
19. Use Shift+N (or mesh.normals_make_consistent in Python) to recalculate face normals when shading artifacts appear after geometry modifications.
20. "Double tap G" is a Blender shortcut for edge sliding in Edit Mode - select an edge, press G once, then G again to slide it. This helps adjust mesh topology without creating distorted faces.
21. Organizing your scene with meaningful object names and collections is essential for larger projects. The Outliner is like a spreadsheet of all objects in your scene.
22. When duplicating objects in Blender, pressing Escape after Shift+D keeps the duplicate in the same position. You need to enable X-ray mode to select through objects when selecting half of a 3D shape.
23. When deleting parts of a mesh, choose the right element type (faces vs vertices) - deleting faces preserves edge loops that vertices alone would destroy
24. Proportional Editing (O key) lets you move vertices with a smooth fall-off effect - essential for organic modeling. Scroll or Page Up/Down to adjust the influence radius while in a transform operation.
25. How to extrude vertices (E) and use Subdivision Surface modifier to smooth geometry for organic shapes like dripping icing
26. Modifier stack order is critical - Shrink Wrap must happen first to snap geometry, then Solidify adds thickness, then Subdivision Surface smooths it. Also learned that Shrink Wrap needs a target object defined or it does nothing.
27. Exaggerate details for artistic effect - donuts don't naturally have this many dribbles, but it makes the icing look more appealing and gooey.
28. Creases on edges tell the Subdivision Surface modifier to keep certain edges sharp instead of rounding them, perfect for making icing cling to surfaces without adding extra geometry.
29. Apply modifiers in top-to-bottom order (shrink wrap before solidify) when breaking non-destructive workflow for detail work, and use proportional editing in Edit Mode to add organic variation to models.
30. Modifier application order matters - apply shrink wrap before solidify to avoid geometry issues. Ctrl+A applies selected modifier.
31. Adding primitive shapes via Shift+A menu (or bpy.ops) is the starting point for most modeling tasks - always check if object exists first to avoid duplicates
32. None yet - following along with the workflow
33. Subdivision Surface smoothing + edge creasing for sharp details on smooth surfaces
34. Modifier stack order matters - Solidify should come before Subdivision Surface for proper beveling; Shift+E adjusts edge crease values; Alt+Select selects edge loops for quick selection.
35. Lattice Deform Selected is a non-destructive workflow tool in Blender 5.0 that creates a deformation guide (lattice) over selected objects, allowing you to adjust proportions later without redoing mesh work.
36. Realistic modeling often involves subtle deformations based on real-world physics (like donuts being less puffy where they touch oil), and H/Alt+H are quick hotkeys to hide/unhide objects in Blender.
37. Apply modifiers to bake changes, then delete the modifier source object. Use F12 to render from camera view.
38. Camera view lock button lets you orbit/zoom while positioned in camera view (must uncheck when done). Viewport display settings only affect how the camera icon appears in viewport, not the actual render. First render may be slower due to shader compilation.
39. Ray tracing should be enabled in Eevee for bounce lighting and realistic reflections; Render View Mode allows real-time rendering in viewport without hitting F12; J key toggles between render slots for quick comparison
40. Material properties are non-destructive and can be changed anytime; avoid fully black/white colors to prevent clipping
41. Subsurface scattering simulates light penetrating and scattering inside translucent objects - essential for food and characters. For food, set SSS weight to 1 and RGB values all to 1 (not red like characters).
42. Subsurface scattering makes light pass through objects giving them a milky/translucent look, especially for food. In 3D, you can fake complex objects with simple planes when camera angle is fixed.
43. How to add a new material to an object that doesn't have one yet, and that image textures are added by clicking the yellow dot next to Base Color in the material panel
44. PBR textures require multiple maps (not just one image) to capture height/bump information for realistic materials - single images lack the depth data that 3D software needs to create crevices and surface detail.
45. PBR textures come in multiple maps (base color, height, roughness, etc.) and need to be loaded in the Shader Editor workspace for proper material setup. The instructor is teaching the traditional manual method first before showing the add-on shortcut.
46. The Material Preview panel is for quick material tweaks, while the Shader Editor node system is for complex material work. Material Preview mode uses a fake HDR environment to quickly visualize materials without changing lighting setups.
47. Normal maps need a Normal Map node to convert color data to vector data before connecting to the normal input. Only base color should use sRGB color space.
48. PBR texture maps (normal, roughness, etc.) should use "Non-Color Data" color space, not sRGB. This tells Blender to use raw pixel values without gamma correction.
49. <PBR materials typically only need 3 maps (base color, normal, roughness) for 90% of cases. The Polygon add-on automates texture setup with correct color spaces and node connections. Installation requires dragging the .zip file directly into Blender without unzipping it first.>
50. UV unwrapping creates a 2D representation of a 3D mesh so textures can be mapped correctly
51. Marking seams creates cut lines (shown as red in wireframe) that tell Blender where to "cut" the mesh when flattening UVs, like laying paper flat over a texture.
52. Marking seams on edges before unwrapping helps control how the texture maps to complex geometry. Disconnecting unnecessary texture nodes gives you more control over the material appearance.
53. Displacement maps need to connect to the Displacement output of the material node, not the Normal input. This enables actual mesh deformation in Eevee/Cycles.
54. Subdivision surface with SSS creates soft, fluffy organic materials like dough
55. Marking seams tells Blender where to "cut" the 3D mesh when flattening it to 2D UV space. Live Unwrap updates automatically when you mark seams.
56. Marking seams on edges with Ctrl+E > Mark Seam to create UV layouts, placing seams in hidden areas to avoid visible texture lines
57. Use forward slash (/) to isolate an object in Local View, mark seams on mesh edges to control UV unwrapping, and rotate UV islands to align texture properly.
58. How to navigate to Blender's extension platform (Edit > Preferences > Get Extensions) and search for community extensions like Mio3 UV for UV alignment tasks
59. Using Mio3 addon's gridify function to create proper UV grid layouts for textures, and selecting individual UV islands to adjust them separately for consistent tiling.
60. Use edge select mode (key 2) to select specific edges, then scale (S) and move (G) them to fix stretching and add detail to mesh islands.
61. Overlapping UV islands are acceptable for simple tiling textures but problematic for painted textures or game assets where islands need separation and margins.
62. Ctrl+X deletes a node while retaining its connections - useful for cleaning up node trees without breaking connections
63. Use Shift D to duplicate, Escape to keep position, and P to separate selection into a new object — this is a quick way to reuse mesh parts for new objects.
64. Surface tension detail on liquids - inset a face and pull it down slightly to create the raised edge that catches light and looks realistic
65. Atlas textures let you choose from multiple variations of a texture element (like coffee foam bubbles) by positioning UV islands on different parts of the texture sheet.
66. Using the 3D cursor to position objects relative to existing geometry before adding new objects
67. Using low-poly base mesh with Subdivision Surface modifier + strategic loop cuts creates smooth rounded shapes efficiently
68. Collections are organizational buckets you can move objects between. The Exclude feature hides objects from viewport and render without deleting them - useful for temporary editing. Front view is Numpad 1, focus on selected object is Numped Period.
69. How to create a collection and move objects into it using the M key shortcut, plus how to set up scatter on surface modifier with collection instancing and pick instance enabled.
70. Scatter on Surface is a Geometry Nodes-based tool that's now packaged in Blender, making it easy to scatter objects without writing custom node trees. Key settings include: alignment axis (Y for vertical sprinkles), randomize rotation (360° for random orientation), and surface offset (controls how deep objects sink into the surface).
71. Weight paint mode creates a mesh attribute (vertex group) that stores values 0-1, which can be used by other systems like particle emitters to control where particles appear. Front Faces Only prevents painting through geometry.
72. Distribution mask multiplies density values (0-1) across areas while keeping base density, whereas density setting overrides the value entirely. Important to use the spreadsheet icon for distribution mask, not density, when you want to control particle placement with a group mask.
73. Using "distribution method: disk" with minimum distance creates spacing between particles to prevent collisions, but requires finding a balance between too chaotic (intersections) and too ordered (unnatural spacing). The seed value randomizes the distribution pattern for different variations.
74. Setting origin to geometry centers objects properly for spawning, which reduces unwanted intersections. The origin point acts as the center of mass for where instances spawn.
75. Using Ctrl+L to link data between objects, then Object Info Random node + Color Ramp for per-object variation
76. You can stack multiple materials on one object by adding a new material slot and selecting an existing material from the dropdown - this lets you reference materials even when their associated objects are hidden. Also, changing a ColorRamp's interpolation from 'Linear' to 'Constant' creates hard color boundaries instead of gradients.
77. Don't use 100% saturated colors in renders as they can "blow out" when contrast is boosted; instead keep colors mostly unsaturated for a more pleasing look. Also, pick one primary color with splashes of others rather than equal distribution across all colors to avoid visual noise. For final renders, use medium high or high contrast color management instead of the default washed-out look.
78. Subsurface scattering makes translucent materials like sprinkles look more realistic - set radius to 1, weight to 1, and scale to a very low value for proper effect.
79. Parenting keeps objects connected so they move together; use "Keep Transform" to maintain original positions
80. Sun lamps don't need precise positioning (position doesn't affect lighting), only rotation matters - use blocker planes to shape light and create window-like shadows
81. Use G + Shift Z to lock movement to X/Y plane, and Ctrl+F2 to batch rename multiple selected objects at once.
82. The radius of a light source controls shadow softness - larger radius = softer shadows (good for form and overall color), smaller radius = harsher shadows (good for revealing surface detail like textures)
83. Backspace on color/power fields resets to default values (color to white, power to 10) - handy for quick resets
84. Eevee uses screen-space lighting which causes shadow noise and flickering in animations; increasing render steps (12-16) improves shadow accuracy and reduces fuzziness.
85. Light probe volumes capture indirect lighting information that improves realism, especially for surfaces the camera can't directly see.
86. Depth of field guides viewer attention by blurring out-of-focus areas, making renders look more realistic and directing where the viewer should look
87. To enable jittered shadows in Eevee for softer lamps, go to Render Properties > Shadow Settings > enable Jitter, but note it requires viewport settings to be enabled to see in viewport. For best quality, use Cycles instead of Eevee, and configure render devices in Edit > Preferences > System > Cycles Render Devices to use GPU (CUDA/Optics for Nvidia, HIP for AMD, Metal for Mac) instead of CPU for faster rendering.
88. Cycles uses path tracing (physically accurate, casts rays, better shadows/reflections) but slower than Eevee's rasterized engine; reducing viewport size speeds up rendering; denoising can be enabled in viewport for clearer preview while moving around
89. Eevee is preferred for animation and quick iterations due to its speed, whereas Cycles is slower but potentially higher quality.

## Skill: step_1
Tags: blender, tutorial
Context: So, this is Blender. It can do 3D So, this is Blender. It can do 3D So, this is Blender. It can do 3D modeling, texturing, lighting, shading, modeling, texturing, lighting, shading, modeling, texturin
Code: import bpy
import mathutils

try:
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete()

    bpy.ops.mesh.primitive_uv_sphere_add(
        radius=1.0,
        segments=32,
        ring_count=16,
        location=(0.0, 0.0, 0.0)
    )

    obj = bpy.context.active_object
    if obj:
        obj.rotation_euler = mathutils.Euler((0.0, 0.0, 0.0), 'XYZ')

    for o in bpy.data.objects:
        o.hide_viewport = False
        o.hide_render = False

    bpy.ops.object.mode_set(mode
Gotcha: 
Source: chunk 1, ~0:00

## Skill: step_2
Tags: blender, tutorial
Context: section, this big gray area here, this section, this big gray area here, this is your 3D viewport. And it's where is your 3D viewport. And it's where is your 3D viewport. And it's where you'll spend p
Code: import bpy
import mathutils

try:
    # Add additional objects to create a proper 3D workspace
    bpy.ops.mesh.primitive_cube_add(size=2, location=(0.0, 0.0, 2.0))
    bpy.ops.mesh.primitive_torus_add(
        major_radius=1.5,
        minor_radius=0.3,
        location=(0.0, 3.0, 1.0)
    )
    bpy.ops.mesh.primitive_cylinder_add(
        radius=0.5,
        depth=3,
        location=(2.0, 0.0, 1.0)
    )
    bpy.ops.mesh.primitive_cylinder_add(
        radius=0.5,
        depth=3,
        loc
Gotcha: 
Source: chunk 2, ~1:32

## Skill: step_3
Tags: blender, tutorial
Context: middle mouse button, a lot of people middle mouse button, a lot of people don't. They're on like a laptop with a don't. They're on like a laptop with a don't. They're on like a laptop with a trackpad 
Code: import bpy

try:
    # Enable Emulate 3 Button Mouse for laptop/trackpad users
    bpy.context.preferences.edit.emulate_3_button_mouse = True
    
    # Update preferences to take effect
    bpy.context.preferences.save_user()
    
except Exception:
    pass
Gotcha: 
Source: chunk 3, ~2:03

## Skill: step_4
Tags: blender, tutorial
Context: way, whilst I am here, a value that you way, whilst I am here, a value that you will want to change if you're on a 4K will want to change if you're on a 4K will want to change if you're on a 4K monito
Code: import bpy

try:
    # Set resolution scale for better visibility on 4K monitors
    # Scale factor between 1.5 to 1.8 for tutorial clarity
    bpy.context.window_manager.resolution_scale = 1.5
    
    # Update the interface to apply the scale change
    bpy.ops.wm.redraw_timer(type='DRAW_WIN_SWAP', iterations=1)
    
except Exception:
    pass

try:
    # Ensure cube is in view and focused
    if 'Cube' in bpy.data.objects:
        bpy.context.view_layer.objects.active = bpy.data.objects['Cube
Gotcha: 
Source: chunk 4, ~2:33

## Skill: step_5
Tags: blender, tutorial
Context: moment, though. So, how do we move to moment, though. So, how do we move to somewhere else? You do that by shift somewhere else? You do that by shift somewhere else? You do that by shift middle mouse 
Code: import bpy

try:
    # Ensure cube is active and center the view on it
    if 'Cube' in bpy.data.objects:
        bpy.context.view_layer.objects.active = bpy.data.objects['Cube']
        bpy.ops.view3d.view_selected()
except Exception:
    pass
Gotcha: 
Source: chunk 5, ~3:04

## Skill: step_6
Tags: blender, tutorial
Context: alternatively, control middle mouse and alternatively, control middle mouse and then that will also move you in as well. then that will also move you in as well. then that will also move you in as wel
Code: import bpy

try:
    # Navigate to active object (simulating "move you in" via Middle Mouse/Scroll shortcuts)
    if bpy.context.object:
        bpy.ops.view3d.view_selected()
except Exception:
    pass
Gotcha: 
Source: chunk 6, ~3:36

## Skill: step_7
Tags: blender, tutorial
Context: of people do that and it's u big time of people do that and it's u big time saver. Okay, now it's really common to saver. Okay, now it's really common to saver. Okay, now it's really common to like ge
Code: import bpy

try:
    # Navigate to active object (simulating "move you in" via Middle Mouse/Scroll shortcuts)
    if bpy.context.object:
        bpy.ops.view3d.view_selected()
except Exception:
    pass

try:
    # Reorient view to Top axis (Z-up) to fix orientation
    bpy.ops.view3d.view_axis(type='TOP')
except Exception:
    pass
Gotcha: 
Source: chunk 7, ~4:07

## Skill: step_8
Tags: blender, tutorial
Context: Which way that one is pointing. Another Which way that one is pointing. Another way, like if you got like really off way, like if you got like really off way, like if you got like really off into the 
Code: import bpy

try:
    # Simulate "Numpad Period" (Focus on Selected Object)
    if bpy.context.object:
        bpy.ops.view3d.view_selected()
except Exception:
    pass
Gotcha: 
Source: chunk 8, ~4:38

## Skill: step_1
Tags: blender, tutorial
Context: So, this is Blender. It can do 3D So, this is Blender. It can do 3D So, this is Blender. It can do 3D modeling, texturing, lighting, shading, modeling, texturing, lighting, shading, modeling, texturin
Code: import bpy
import mathutils
from math import pi

try:
    # Clear existing objects
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete()
    
    # Set up viewport
    bpy.context.scene.render.engine = 'CYCLES'
    bpy.context.scene.cycles.samples = 128
    bpy.context.scene.cycles.diffuse_bounces = 4
    bpy.context.scene.cycles.glossy_bounces = 2
    bpy.context.scene.view_settings.view_transform = 'Standard'
    
    # Create doughnut (torus)
    bpy.ops.mesh.primitive_to
Gotcha: 
Source: chunk 1, ~0:00

## Skill: step_1
Tags: blender, tutorial
Context: So, this is Blender. It can do 3D So, this is Blender. It can do 3D So, this is Blender. It can do 3D modeling, texturing, lighting, shading, modeling, texturing, lighting, shading, modeling, texturin
Code: import bpy
import mathutils

try:
    # Select all objects in the scene
    bpy.ops.object.select_all(action='SELECT')
    
    # Delete existing objects to start clean (tutorial standard step)
    bpy.ops.object.delete()
    
    # Add a UV Sphere for the doughnut base
    bpy.ops.mesh.primitive_uv_sphere_add(
        segments=32,
        ring_count=16,
        radius=1.0,
        location=(0.0, 0.0, 0.0)
    )
    
    # Ensure the newly created sphere is active
    bpy.ops.object.select_all(a
Gotcha: 
Source: chunk 1, ~0:00

## Skill: step_2
Tags: blender, tutorial
Context: section, this big gray area here, this section, this big gray area here, this is your 3D viewport. And it's where is your 3D viewport. And it's where is your 3D viewport. And it's where you'll spend p
Code: import bpy
import mathutils

try:
    # Select all objects in the scene
    bpy.ops.object.select_all(action='SELECT')
    
    # Delete existing objects to start clean (tutorial standard step)
    bpy.ops.object.delete()
    
    # Add a UV Sphere for the doughnut base
    bpy.ops.mesh.primitive_uv_sphere_add(
        segments=32,
        ring_count=16,
        radius=1.0,
        location=(0.0, 0.0, 0.0)
    )
    
    # Ensure the newly created sphere is active
    bpy.ops.object.select_all(a
Gotcha: 
Source: chunk 2, ~1:32

## Skill: step_1
Tags: blender, tutorial
Context: So, this is Blender. It can do 3D So, this is Blender. It can do 3D So, this is Blender. It can do 3D modeling, texturing, lighting, shading, modeling, texturing, lighting, shading, modeling, texturin
Code: import bpy
import mathutils

try:
    # Clean up default cube to start fresh
    default_cube = bpy.data.objects.get("Cube")
    if default_cube:
        bpy.context.view_layer.objects.select_set(default_cube)
        bpy.ops.object.delete(use_global=False)

    # Create the base for the doughnut
    bpy.ops.mesh.primitive_cylinder_add(
        vertices=32,
        radius=1.0,
        depth=1.0,
        location=mathutils.Vector((0, 0, 0)),
        rotation=mathutils.Euler((0, 0, 0))
    )

    
Gotcha: 
Source: chunk 1, ~0:00

## Skill: step_1
Tags: blender, tutorial
Context: So, this is Blender. It can do 3D So, this is Blender. It can do 3D So, this is Blender. It can do 3D modeling, texturing, lighting, shading, modeling, texturing, lighting, shading, modeling, texturin
Code: import bpy
import mathutils

try:
    # Clear existing objects
    for obj in bpy.data.objects:
        if obj.type == 'MESH':
            bpy.data.objects.remove(obj, do_unlink=True)
        elif obj.type in ('CAMERA', 'LIGHT', 'WORLD'):
            pass
    
    # Create Torus (Donut)
    bpy.ops.mesh.primitive_torus_add(
        location=(0, 0, 0),
        major_radius=1.0,
        minor_radius=0.35,
        major_segments=32,
        minor_segments=16
    )
    torus = bpy.context.active_obj
Gotcha: 
Source: chunk 1, ~0:00

## Skill: step_2
Tags: blender, tutorial
Context: section, this big gray area here, this section, this big gray area here, this is your 3D viewport. And it's where is your 3D viewport. And it's where is your 3D viewport. And it's where you'll spend p
Code: import bpy

try:
    # Ensure all objects remain visible for the viewport navigation tutorial
    for obj in bpy.data.objects:
        obj.hide_set(False)
        obj.hide_viewport_set(False)
        obj.hide_render_set(False)
    
    # Focus the view on the active object
    if bpy.context.active_object:
        bpy.context.view_layer.objects.active = bpy.context.active_object
    
    # Set viewport shading to solid for the tutorial
    if bpy.context.space_data and bpy.context.space_data.typ
Gotcha: 
Source: chunk 2, ~1:32

## Skill: step_3
Tags: blender, tutorial
Context: middle mouse button, a lot of people middle mouse button, a lot of people don't. They're on like a laptop with a don't. They're on like a laptop with a don't. They're on like a laptop with a trackpad 
Code: import bpy

try:
    # Ensure all objects remain visible for viewport navigation tutorial
    for obj in bpy.data.objects:
        obj.hide_set(False)
        obj.hide_viewport_set(False)
        obj.hide_render_set(False)
    
    # Focus view on active object
    if bpy.context.active_object:
        bpy.context.view_layer.objects.active = bpy.context.active_object
        bpy.context.scene.cursor.location = bpy.context.active_object.location
    
    # Set viewport shading to solid for better
Gotcha: 
Source: chunk 3, ~2:03

## Skill: step_4
Tags: blender, tutorial
Context: way, whilst I am here, a value that you way, whilst I am here, a value that you will want to change if you're on a 4K will want to change if you're on a 4K will want to change if you're on a 4K monito
Code: # Set UI scale for better visibility on 4K monitors
# For tutorials, we scale up to make interface elements larger
try:
    if bpy.context.preferences.system:
        # Adjust UI scale - 1.5 minimum for 4K, higher for tutorials
        bpy.context.preferences.system.viewport_ui_scale = 1.8
        print(f"UI scale set to {bpy.context.preferences.system.viewport_ui_scale} for tutorial visibility")
    
    # Ensure shading is SOLID for tutorial clarity
    if bpy.context.space_data:
        bpy.c
Gotcha: 
Source: chunk 4, ~2:33

## Skill: step_5
Tags: blender, tutorial
Context: moment, though. So, how do we move to moment, though. So, how do we move to somewhere else? You do that by shift somewhere else? You do that by shift somewhere else? You do that by shift middle mouse 
Code: import bpy
from bpy.types import Panel, Menu
from mathutils import Vector

try:
    # Continue from existing viewport setup
    if bpy.context.space_data:
        bpy.context.space_data.shading.type = 'SOLID'
        bpy.context.space_data.overlay.show_overlays = True
    
    # Create or reuse a navigation help panel
    class NAVIGATION_HELP_PT_panel(Panel):
        bl_idname = "NAVIGATION_HELP_PT_navigation_guide"
        bl_label = "Viewport Navigation Guide"
        bl_region_type = 'UI'
  
Gotcha: 
Source: chunk 5, ~3:04

## Skill: step_6
Tags: blender, tutorial
Context: alternatively, control middle mouse and alternatively, control middle mouse and then that will also move you in as well. then that will also move you in as well. then that will also move you in as wel
Code: import bpy
from bpy.props import StringProperty
from mathutils import Matrix, Vector

# Define the navigation help panel
class NAVIGATION_HELP_PT_panel(bpy.types.Panel):
    bl_label = "Navigation Shortcuts"
    bl_idname = "NAVIGATION_HELP_PT_navigation_guide"
    bl_space_type = 'VIEW_3D'
    bl_region_type = 'UI'
    bl_category = "Navigation Guide"
    
    def draw(self, context):
        layout = self.layout
        
        box = layout.box()
        box.label(text="Navigation Shortcuts",
Gotcha: 
Source: chunk 6, ~3:36

## Skill: step_7
Tags: blender, tutorial
Context: of people do that and it's u big time of people do that and it's u big time saver. Okay, now it's really common to saver. Okay, now it's really common to saver. Okay, now it's really common to like ge
Code: import bpy
import math
from mathutils import Vector, Euler

class NAVIGATION_HELP_PT_panel(bpy.types.Panel):
    bl_label = "Navigation Help"
    bl_idname = "NAVIGATION_HELP_PT_panel"
    bl_space_type = 'VIEW_3D'
    bl_region_type = 'UI'
    bl_category = "Nav Help"

    def draw(self, context):
        layout = self.layout
        layout.operator("NAVIGATION_HELP_OT_show_guide", icon='HELP')
        layout.operator("NAVIGATION_OVERLAY_OT_add_guide", icon='GROUP')

class NAVIGATION_HELP_OT_sh
Gotcha: 
Source: chunk 7, ~4:07

## Skill: step_1
Tags: blender, tutorial
Context: So, this is Blender. It can do 3D So, this is Blender. It can do 3D So, this is Blender. It can do 3D modeling, texturing, lighting, shading, modeling, texturing, lighting, shading, modeling, texturin
Code: import bpy
import mathutils

try:
    # Clear existing objects from the default scene
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete(use_global=False)
    
    # Add default cube for the donut base
    bpy.ops.mesh.primitive_torus_add(
        major_radius=1.0,
        minor_radius=0.4,
        major_segments=32,
        minor_segments=16,
        location=(0, 0, 0)
    )
    
    # Name the donut object
    donut = bpy.context.active_object
    donut.name = "Donut"
   
Gotcha: 
Source: chunk 1, ~0:00

## Skill: step_1
Tags: blender, tutorial
Context: So, this is Blender. It can do 3D So, this is Blender. It can do 3D So, this is Blender. It can do 3D modeling, texturing, lighting, shading, modeling, texturing, lighting, shading, modeling, texturin
Code: import bpy
import mathutils

try:
    # Ensure script runs in Object Mode
    bpy.ops.object.mode_set(mode='OBJECT')

    # Clean up the default cube for the doughnut project
    if 'Cube' in bpy.data.objects:
        bpy.data.objects.remove(bpy.data.objects['Cube'], do_unlink=True)

    # Add the base sphere to form the doughnut body
    bpy.ops.mesh.primitive_ico_sphere_add(
        radius=1.0,
        location=(0.0, 0.0, 0.0),
        align='WORLD'
    )

    # Name and scale the object to de
Gotcha: 
Source: chunk 1, ~0:00

## Skill: step_1
Tags: blender, tutorial
Context: So, this is Blender. It can do 3D So, this is Blender. It can do 3D So, this is Blender. It can do 3D modeling, texturing, lighting, shading, modeling, texturing, lighting, shading, modeling, texturin
Code: import bpy
import mathutils

try:
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete(use_global=False)

    torus_location = mathutils.Vector((0.0, 0.0, 0.0))
    bpy.ops.mesh.primitive_torus_add(
        major_radius=1.0,
        minor_radius=0.25,
        subdivs=16,
        location=torus_location,
        name="Doughnut_Base"
    )
except Exception:
    pass
Gotcha: 
Source: chunk 1, ~0:00

## Skill: step_2
Tags: blender, tutorial
Context: section, this big gray area here, this section, this big gray area here, this is your 3D viewport. And it's where is your 3D viewport. And it's where is your 3D viewport. And it's where you'll spend p
Code: import bpy
import mathutils

try:
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete(use_global=False)

    torus_location = mathutils.Vector((0.0, 0.0, 0.0))
    bpy.ops.mesh.primitive_torus_add(
        major_radius=1.0,
        minor_radius=0.25,
        subdivs=16,
        location=torus_location,
        name="Doughnut_Base"
    )

    cube_location = mathutils.Vector((3.0, 0.0, 0.5))
    bpy.ops.mesh.primitive_cube_add(
        location=cube_location,
        name="En
Gotcha: 
Source: chunk 2, ~1:32

## Skill: step_3
Tags: blender, tutorial
Context: middle mouse button, a lot of people middle mouse button, a lot of people don't. They're on like a laptop with a don't. They're on like a laptop with a don't. They're on like a laptop with a trackpad 
Code: import bpy
import mathutils

try:
    bpy.context.preferences.input.emulate_three_button_mouse = True
except Exception:
    pass
Gotcha: 
Source: chunk 3, ~2:03

## Skill: step_4
Tags: blender, tutorial
Context: way, whilst I am here, a value that you way, whilst I am here, a value that you will want to change if you're on a 4K will want to change if you're on a 4K will want to change if you're on a 4K monito
Code: import bpy
import mathutils

try:
    bpy.context.preferences.input.emulate_three_button_mouse = True
except Exception:
    pass

try:
    bpy.context.preferences.system.display_scale = 1.5
except Exception:
    pass
Gotcha: 
Source: chunk 4, ~2:33

## Skill: step_5
Tags: blender, tutorial
Context: moment, though. So, how do we move to moment, though. So, how do we move to somewhere else? You do that by shift somewhere else? You do that by shift somewhere else? You do that by shift middle mouse 
Code: import bpy
import mathutils

try:
    bpy.context.preferences.input.emulate_three_button_mouse = True
except Exception:
    pass

try:
    bpy.context.preferences.system.display_scale = 1.5
except Exception:
    pass

try:
    bpy.ops.view3d_move('INVOKE_DEFAULT', delta=(50, 0))
except Exception:
    pass

try:
    bpy.ops.view3d_orbit('INVOKE_DEFAULT', delta=0.5)
except Exception:
    pass

try:
    bpy.ops.view3d_zoom('INVOKE_DEFAULT', delta=0.2)
except Exception:
    pass
Gotcha: 
Source: chunk 5, ~3:04

## Skill: step_6
Tags: blender, tutorial
Context: alternatively, control middle mouse and alternatively, control middle mouse and then that will also move you in as well. then that will also move you in as well. then that will also move you in as wel
Code: import bpy
import mathutils

try:
    bpy.context.preferences.input.emulate_three_button_mouse = True
except Exception:
    pass

try:
    bpy.ops.view3d_pan('INVOKE_DEFAULT', location=(50, 0))
except Exception:
    pass
Gotcha: 
Source: chunk 6, ~3:36

## Skill: step_21
Tags: blender, tutorial
Context: that went too far. Um, so I'm holding that went too far. Um, so I'm holding down Z. Um, now this is a way of quickly down Z. Um, now this is a way of quickly down Z. Um, now this is a way of quickly c
Code: 
Gotcha: 
Source: chunk 21, ~50:27

## Skill: step_1
Tags: blender, tutorial
Context: So, this is Blender. It can do 3D So, this is Blender. It can do 3D So, this is Blender. It can do 3D modeling, texturing, lighting, shading, modeling, texturing, lighting, shading, modeling, texturin
Code: import bpy  # no-op step
Gotcha: 
Source: chunk 1, ~0:00

## Skill: step_2
Tags: blender, tutorial
Context: Um, and it's free. So, just click the Um, and it's free. So, just click the link below and you can um, print it out. link below and you can um, print it out. link below and you can um, print it out. Y
Code: import bpy  # no-op step
Gotcha: 
Source: chunk 2, ~4:02

## Skill: step_3
Tags: blender, tutorial
Context: And now I want to add a new object. And And now I want to add a new object. And I can do that by going to add at the top I can do that by going to add at the top I can do that by going to add at the t
Code: import bpy  # no-op step
Gotcha: 
Source: chunk 3, ~6:03

## Skill: step_4
Tags: blender, tutorial
Context: forward, I just need to change my minor forward, I just need to change my minor radius until it looks somewhat like a radius until it looks somewhat like a radius until it looks somewhat like a donut.
Code: import bpy  # no-op step
Gotcha: 
Source: chunk 4, ~8:04

## Skill: step_5
Tags: blender, tutorial
Context: adding any additional computation times adding any additional computation times which is important. Um but it's which is important. Um but it's which is important. Um but it's appearing to the eye to 
Code: import bpy  # no-op step
Gotcha: 
Source: chunk 5, ~10:04

## Skill: step_6
Tags: blender, tutorial
Context: of points and lines on it. Um and you'll of points and lines on it. Um and you'll also notice whilst you're in edit mode, also notice whilst you're in edit mode, also notice whilst you're in edit mode
Code: import bpy  # no-op step
Gotcha: 
Source: chunk 6, ~16:10

## Skill: step_7
Tags: blender, tutorial
Context: me what part do you want to delete? Um, me what part do you want to delete? Um, which might sound redundant, but there which might sound redundant, but there which might sound redundant, but there is 
Code: import bpy  # no-op step
Gotcha: 
Source: chunk 7, ~18:12

## Skill: step_8
Tags: blender, tutorial
Context: reason this is um so useful is that this reason this is um so useful is that this is a non-destructive workflow. So, I is a non-destructive workflow. So, I is a non-destructive workflow. So, I could a
Code: import bpy  # no-op step
Gotcha: 
Source: chunk 8, ~20:13

## Skill: step_9
Tags: blender, tutorial
Context: somewhere around here. And I'm going to somewhere around here. And I'm going to add in a point like here, right? And add in a point like here, right? And add in a point like here, right? And then if y
Code: import bpy  # no-op step
Gotcha: 
Source: chunk 9, ~22:15

## Skill: step_10
Tags: blender, tutorial
Context: looking even worse. We got a lot to fix looking even worse. We got a lot to fix here. Um but first I need to do another here. Um but first I need to do another here. Um but first I need to do another 
Code: import bpy  # no-op step
Gotcha: 
Source: chunk 10, ~24:16

## Skill: step_1
Tags: blender, tutorial
Context: if you've just opened blender for the if you've just opened blender for the if you've just opened blender for the first time and then you've tried to do first time and then you've tried to do first ti
Code: import bpy  # no-op step
Gotcha: 
Source: chunk 1, ~0:00

## Skill: step_2
Tags: blender, tutorial
Context: very similar to what you were just very similar to what you were just looking at this one actually has looking at this one actually has looking at this one actually has lighting information okay you g
Code: import bpy  # no-op step
Gotcha: 
Source: chunk 2, ~2:00

## Skill: step_3
Tags: blender, tutorial
Context: because there's a couple of ways because there's a couple of ways you could also use that tilde key you could also use that tilde key you could also use that tilde key that'll take you to the top the 
Code: import bpy  # no-op step
Gotcha: 
Source: chunk 3, ~12:06

## Skill: step_4
Tags: blender, tutorial
Context: would see it though if you were in uh would see it though if you were in uh rendered again f12 to do an actual rendered again f12 to do an actual rendered again f12 to do an actual render render rende
Code: import bpy  # no-op step
Gotcha: 
Source: chunk 4, ~14:08

## Skill: step_5
Tags: blender, tutorial
Context: things that i find in the 3d industry so things that i find in the 3d industry so if you want to keep up to date and learn if you want to keep up to date and learn if you want to keep up to date and l
Code: import bpy  # no-op step
Gotcha: 
Source: chunk 5, ~16:10

## Skill: step_1
Tags: blender, tutorial
Context: features that you end up using 80% of features that you end up using 80% of the time and that's what I'm planning to the time and that's what I'm planning to the time and that's what I'm planning to t
Code: import bpy  # no-op step
Gotcha: 
Source: chunk 1, ~2:01

## Skill: step_2
Tags: blender, tutorial
Context: work it will come in handy um but in a work it will come in handy um but in a pinch you can get by without it just by pinch you can get by without it just by pinch you can get by without it just by up
Code: import bpy  # no-op step
Gotcha: 
Source: chunk 2, ~4:03

## Skill: step_3
Tags: blender, tutorial
Context: I've got nothing to do with it but I'll I've got nothing to do with it but I'll put that link there so you can check it put that link there so you can check it put that link there so you can check it 
Code: import bpy  # no-op step
Gotcha: 
Source: chunk 3, ~10:06

## Skill: step_4
Tags: blender, tutorial
Context: if I hit n n is to bring up the if I hit n n is to bring up the properties n for properties for whatever properties n for properties for whatever properties n for properties for whatever reason um and
Code: import bpy  # no-op step
Gotcha: 
Source: chunk 4, ~12:06

## Skill: step_5
Tags: blender, tutorial
Context: whatever I want I could uh make it an whatever I want I could uh make it an odd creepy skin toned monkey head right odd creepy skin toned monkey head right odd creepy skin toned monkey head right like
Code: import bpy  # no-op step
Gotcha: 
Source: chunk 5, ~14:09

## Skill: step_1
Tags: blender, tutorial
Context: So, this is Blender. It can do 3D So, this is Blender. It can do 3D So, this is Blender. It can do 3D modeling, texturing, lighting, shading, modeling, texturing, lighting, shading, modeling, texturin
Code: import bpy  # no-op step
Gotcha: 
Source: chunk 1, ~0:00

## Skill: step_2
Tags: blender, tutorial
Context: Um, and it's free. So, just click the Um, and it's free. So, just click the link below and you can um, print it out. link below and you can um, print it out. link below and you can um, print it out. Y
Code: import bpy  # no-op step
Gotcha: 
Source: chunk 2, ~4:02

## Skill: step_3
Tags: blender, tutorial
Context: And now I want to add a new object. And And now I want to add a new object. And I can do that by going to add at the top I can do that by going to add at the top I can do that by going to add at the t
Code: import bpy  # no-op step
Gotcha: 
Source: chunk 3, ~6:03

## Skill: step_4
Tags: blender, tutorial
Context: forward, I just need to change my minor forward, I just need to change my minor radius until it looks somewhat like a radius until it looks somewhat like a radius until it looks somewhat like a donut.
Code: import bpy  # no-op step
Gotcha: 
Source: chunk 4, ~8:04

## Skill: step_1
Tags: blender, tutorial
Context: So, this is Blender. It can do 3D So, this is Blender. It can do 3D So, this is Blender. It can do 3D modeling, texturing, lighting, shading, modeling, texturing, lighting, shading, modeling, texturin
Code: import bpy  # no-op step
Gotcha: 
Source: chunk 1, ~0:00

## Skill: step_2
Tags: blender, tutorial
Context: Um, and it's free. So, just click the Um, and it's free. So, just click the link below and you can um, print it out. link below and you can um, print it out. link below and you can um, print it out. Y
Code: import bpy  # no-op step
Gotcha: 
Source: chunk 2, ~4:02

## Skill: step_3
Tags: blender, tutorial
Context: And now I want to add a new object. And And now I want to add a new object. And I can do that by going to add at the top I can do that by going to add at the top I can do that by going to add at the t
Code: import bpy  # no-op step
Gotcha: 
Source: chunk 3, ~6:03

## Skill: step_4
Tags: blender, tutorial
Context: forward, I just need to change my minor forward, I just need to change my minor radius until it looks somewhat like a radius until it looks somewhat like a radius until it looks somewhat like a donut.
Code: import bpy  # no-op step
Gotcha: 
Source: chunk 4, ~8:04

## Skill: step_5
Tags: blender, tutorial
Context: adding any additional computation times adding any additional computation times which is important. Um but it's which is important. Um but it's which is important. Um but it's appearing to the eye to 
Code: import bpy  # no-op step
Gotcha: 
Source: chunk 5, ~10:04

## Skill: step_6
Tags: blender, tutorial
Context: of points and lines on it. Um and you'll of points and lines on it. Um and you'll also notice whilst you're in edit mode, also notice whilst you're in edit mode, also notice whilst you're in edit mode
Code: import bpy  # no-op step
Gotcha: 
Source: chunk 6, ~16:10

## Skill: step_7
Tags: blender, tutorial
Context: me what part do you want to delete? Um, me what part do you want to delete? Um, which might sound redundant, but there which might sound redundant, but there which might sound redundant, but there is 
Code: import bpy  # no-op step
Gotcha: 
Source: chunk 7, ~18:12

## Skill: step_8
Tags: blender, tutorial
Context: reason this is um so useful is that this reason this is um so useful is that this is a non-destructive workflow. So, I is a non-destructive workflow. So, I is a non-destructive workflow. So, I could a
Code: import bpy  # no-op step
Gotcha: 
Source: chunk 8, ~20:13

## Skill: step_9
Tags: blender, tutorial
Context: somewhere around here. And I'm going to somewhere around here. And I'm going to add in a point like here, right? And add in a point like here, right? And add in a point like here, right? And then if y
Code: import bpy  # no-op step
Gotcha: 
Source: chunk 9, ~22:15

## Skill: step_10
Tags: blender, tutorial
Context: looking even worse. We got a lot to fix looking even worse. We got a lot to fix here. Um but first I need to do another here. Um but first I need to do another here. Um but first I need to do another 
Code: import bpy  # no-op step
Gotcha: 
Source: chunk 10, ~24:16

## Skill: step_11
Tags: blender, tutorial
Context: and forth until I get it. You know, how and forth until I get it. You know, how tight do I want this edge to look? tight do I want this edge to look? tight do I want this edge to look? Something like 
Code: import bpy  # no-op step
Gotcha: 
Source: chunk 11, ~26:16

## Skill: step_12
Tags: blender, tutorial
Context: save. save. It is time to make our coffee mug look It is time to make our coffee mug look It is time to make our coffee mug look like a coffee mug and not like a sad like a coffee mug and not like a s
Code: import bpy  # no-op step
Gotcha: 
Source: chunk 12, ~28:18

## Skill: step_13
Tags: blender, tutorial
Context: give you an image that I've used. Um, give you an image that I've used. Um, but you can there's there's some really but you can there's there's some really but you can there's there's some really pret
Code: import bpy  # no-op step
Gotcha: 
Source: chunk 13, ~30:20

## Skill: step_14
Tags: blender, tutorial
Context: where it starts to invert and it goes in where it starts to invert and it goes in the other direction. Okay. So, it's very the other direction. Okay. So, it's very the other direction. Okay. So, it's 
Code: import bpy  # no-op step
Gotcha: 
Source: chunk 14, ~36:21

## Skill: step_15
Tags: blender, tutorial
Context: And I'm just by eye just guessing to try And I'm just by eye just guessing to try to get this form here. Um but you can to get this form here. Um but you can to get this form here. Um but you can see 
Code: import bpy  # no-op step
Gotcha: 
Source: chunk 15, ~38:22

## Skill: step_16
Tags: blender, tutorial
Context: And it's trying to taper from there all And it's trying to taper from there all the way in. But then also from this the way in. But then also from this the way in. But then also from this point here, 
Code: import bpy  # no-op step
Gotcha: 
Source: chunk 16, ~40:23

## Skill: step_17
Tags: blender, tutorial
Context: and that point is actually here. Right and that point is actually here. Right here which is why I've modeled it this here which is why I've modeled it this here which is why I've modeled it this way. 
Code: import bpy  # no-op step
Gotcha: 
Source: chunk 17, ~42:24

## Skill: step_18
Tags: blender, tutorial
Context: there you go. So anyways, now that I've there you go. So anyways, now that I've got this, now when I select this face got this, now when I select this face got this, now when I select this face here, 
Code: import bpy  # no-op step
Gotcha: 
Source: chunk 18, ~44:24

## Skill: step_19
Tags: blender, tutorial
Context: at that if you run into an issue first. at that if you run into an issue first. Anyways, sorry to really painfully Anyways, sorry to really painfully Anyways, sorry to really painfully slowly do this,
Code: import bpy  # no-op step
Gotcha: 
Source: chunk 19, ~46:25

## Skill: step_20
Tags: blender, tutorial
Context: we go around. So, now E to do another we go around. So, now E to do another extrusion. Click. G. Click. R. And now, extrusion. Click. G. Click. R. And now, extrusion. Click. G. Click. R. And now, by t
Code: import bpy  # no-op step
Gotcha: 
Source: chunk 20, ~48:26

## Skill: step_1
Tags: blender, tutorial
Context: So, this is Blender. It can do 3D So, this is Blender. It can do 3D So, this is Blender. It can do 3D modeling, texturing, lighting, shading, modeling, texturing, lighting, shading, modeling, texturin
Code: import bpy  # no-op step
Gotcha: 
Source: chunk 1, ~0:00

## Skill: step_2
Tags: blender, tutorial
Context: link below and you can um, print it out. link below and you can um, print it out. You can stick it on your wall. Um, a lot You can stick it on your wall. Um, a lot You can stick it on your wall. Um, a
Code: import bpy  # no-op step
Gotcha: 
Source: chunk 2, ~4:04

## Skill: step_3
Tags: blender, tutorial
Context: with numpads anymore, I guess, cuz with numpads anymore, I guess, cuz people aren't accountants. They don't people aren't accountants. They don't people aren't accountants. They don't need to quickly 
Code: import bpy  # no-op step
Gotcha: 
Source: chunk 3, ~5:05

## Skill: step_4
Tags: blender, tutorial
Context: I can do that by going to add at the top I can do that by going to add at the top of the screen there. Or alternatively, of the screen there. Or alternatively, of the screen there. Or alternatively, t
Code: 
Gotcha: 
Source: chunk 4, ~6:05

## Skill: step_5
Tags: blender, tutorial
Context: corner, there's a little box that says corner, there's a little box that says add Taurus. And this has additional add Taurus. And this has additional add Taurus. And this has additional options for us
Code: import bpy  # no-op step
Gotcha: 
Source: chunk 5, ~7:06

## Skill: step_6
Tags: blender, tutorial
Context: going to increase the other one to about going to increase the other one to about Yeah, let's go 18 like that. Um, Yeah, let's go 18 like that. Um, Yeah, let's go 18 like that. Um, 16, 18. Yeah, we'll
Code: import bpy

# Deselect all objects first
bpy.ops.object.select_all(action='DESELECT')

# Select the donut object (assuming it exists from previous steps)
try:
    donut = bpy.data.objects.get('Donut')
    if donut:
        donut.select_set(True)
        bpy.context.view_layer.objects.active = donut
        
        # Apply smooth shading
        bpy.ops.object.shade_smooth()
        
        # Commit the changes (exit edit mode if in edit mode)
        if donut.mode != 'OBJECT':
            bpy.
Gotcha: 
Source: chunk 6, ~9:08

## Skill: step_1
Tags: blender, tutorial
Context: So, this is Blender. It can do 3D So, this is Blender. It can do 3D So, this is Blender. It can do 3D modeling, texturing, lighting, shading, modeling, texturing, lighting, shading, modeling, texturin
Code: import bpy  # no-op step
Gotcha: 
Source: chunk 1, ~0:00

## Skill: step_2
Tags: blender, tutorial
Context: link below and you can um, print it out. link below and you can um, print it out. You can stick it on your wall. Um, a lot You can stick it on your wall. Um, a lot You can stick it on your wall. Um, a
Code: import bpy  # no-op step
Gotcha: 
Source: chunk 2, ~4:04

## Skill: step_3
Tags: blender, tutorial
Context: with numpads anymore, I guess, cuz with numpads anymore, I guess, cuz people aren't accountants. They don't people aren't accountants. They don't people aren't accountants. They don't need to quickly 
Code: import bpy  # no-op step
Gotcha: 
Source: chunk 3, ~5:05

## Skill: step_4
Tags: blender, tutorial
Context: I can do that by going to add at the top I can do that by going to add at the top of the screen there. Or alternatively, of the screen there. Or alternatively, of the screen there. Or alternatively, t
Code: 
Gotcha: 
Source: chunk 4, ~6:05

## Skill: step_5
Tags: blender, tutorial
Context: corner, there's a little box that says corner, there's a little box that says add Taurus. And this has additional add Taurus. And this has additional add Taurus. And this has additional options for us
Code: import bpy  # no-op step
Gotcha: 
Source: chunk 5, ~7:06

## Skill: step_6
Tags: blender, tutorial
Context: going to increase the other one to about going to increase the other one to about Yeah, let's go 18 like that. Um, Yeah, let's go 18 like that. Um, Yeah, let's go 18 like that. Um, 16, 18. Yeah, we'll
Code: bpy.ops.object.shade_smooth()
Gotcha: 
Source: chunk 6, ~9:08

## Skill: step_7
Tags: blender, tutorial
Context: appearing to the eye to be smooth. Okay. appearing to the eye to be smooth. Okay. So um in previous doughnut versions we So um in previous doughnut versions we So um in previous doughnut versions we w
Code: import bpy  # no-op step
Gotcha: 
Source: chunk 7, ~10:09

## Skill: step_8
Tags: blender, tutorial
Context: Um I think I'm going to make it around Um I think I'm going to make it around holding down shift and just kind of drag holding down shift and just kind of drag holding down shift and just kind of drag
Code: import bpy  # no-op step
Gotcha: 
Source: chunk 8, ~11:10

## Skill: step_9
Tags: blender, tutorial
Context: are called vertices. These are the are called vertices. These are the points that make up the um yeah, the points that make up the um yeah, the points that make up the um yeah, the shape of the mesh, 
Code: import bpy  # no-op step
Gotcha: 
Source: chunk 9, ~17:20

## Skill: step_10
Tags: blender, tutorial
Context: delete the entire vertices of those delete the entire vertices of those faces. So, we have to confirm. We want faces. So, we have to confirm. We want faces. So, we have to confirm. We want to delete j
Code: import bpy

# Deselect all objects first
bpy.ops.object.select_all(action='DESELECT')

# Add Solidify modifier to the active object (the cup) to give it thickness
if bpy.context.active_object and bpy.context.active_object.type == 'MESH':
    modifier = bpy.context.active_object.modifiers.new(name="Solidify", type='SOLIDIFY')
    modifier.thickness = 0.01
Gotcha: 
Source: chunk 10, ~18:21

## Skill: step_11
Tags: blender, tutorial
Context: um solidify from the list. Okay, so now um solidify from the list. Okay, so now now that we've got that, you can see now that we've got that, you can see now that we've got that, you can see we've got
Code: import bpy  # no-op step
Gotcha: 
Source: chunk 11, ~19:21

## Skill: step_12
Tags: blender, tutorial
Context: could, you know, we'll get to all that could, you know, we'll get to all that later on. We could change the size and later on. We could change the size and later on. We could change the size and thing
Code: import bpy  # no-op step
Gotcha: 
Source: chunk 12, ~20:21

## Skill: step_13
Tags: blender, tutorial
Context: with, right? This is the the start. This with, right? This is the the start. This is one level. Then this is two levels. is one level. Then this is two levels. is one level. Then this is two levels. A
Code: import bpy  # no-op step
Gotcha: 
Source: chunk 13, ~21:22

## Skill: step_14
Tags: blender, tutorial
Context: then another point here. And then if you then another point here. And then if you do another level, it places another do another level, it places another do another level, it places another point here
Code: import bpy  # no-op step
Gotcha: 
Source: chunk 14, ~22:24

## Skill: step_1
Tags: blender, tutorial
Context: So, this is Blender. It can do 3D So, this is Blender. It can do 3D So, this is Blender. It can do 3D modeling, texturing, lighting, shading, modeling, texturing, lighting, shading, modeling, texturin
Code: import bpy  # no-op step
Gotcha: 
Source: chunk 1, ~0:00

## Skill: step_2
Tags: blender, tutorial
Context: link below and you can um, print it out. link below and you can um, print it out. You can stick it on your wall. Um, a lot You can stick it on your wall. Um, a lot You can stick it on your wall. Um, a
Code: import bpy  # no-op step
Gotcha: 
Source: chunk 2, ~4:04

## Skill: step_3
Tags: blender, tutorial
Context: with numpads anymore, I guess, cuz with numpads anymore, I guess, cuz people aren't accountants. They don't people aren't accountants. They don't people aren't accountants. They don't need to quickly 
Code: import bpy  # no-op step
Gotcha: 
Source: chunk 3, ~5:05

## Skill: step_4
Tags: blender, tutorial
Context: I can do that by going to add at the top I can do that by going to add at the top of the screen there. Or alternatively, of the screen there. Or alternatively, of the screen there. Or alternatively, t
Code: import bpy  # no-op step
Gotcha: 
Source: chunk 4, ~6:05

## Skill: step_5
Tags: blender, tutorial
Context: corner, there's a little box that says corner, there's a little box that says add Taurus. And this has additional add Taurus. And this has additional add Taurus. And this has additional options for us
Code: 
Gotcha: 
Source: chunk 5, ~7:06

## Skill: step_6
Tags: blender, tutorial
Context: going to increase the other one to about going to increase the other one to about Yeah, let's go 18 like that. Um, Yeah, let's go 18 like that. Um, Yeah, let's go 18 like that. Um, 16, 18. Yeah, we'll
Code: import bpy  # no-op step
Gotcha: 
Source: chunk 6, ~9:08

## Skill: step_7
Tags: blender, tutorial
Context: appearing to the eye to be smooth. Okay. appearing to the eye to be smooth. Okay. So um in previous doughnut versions we So um in previous doughnut versions we So um in previous doughnut versions we w
Code: import bpy  # no-op step
Gotcha: 
Source: chunk 7, ~10:09

---

## Bob Workflow Rules (Updated 2026-03-01)

### Blender 5.0 API — Primitive Creation
- **NEVER pass `radius`, `segments`, `ring_count`, `vertices` to primitive ops** — Blender 5.0 removed most params
- Safe calls: `bpy.ops.mesh.primitive_uv_sphere_add()`, `bpy.ops.mesh.primitive_cube_add()`, `bpy.ops.mesh.primitive_cylinder_add()`, `bpy.ops.mesh.primitive_torus_add()`, `bpy.ops.mesh.primitive_plane_add()`
- Only pass `location=(x,y,z)` or `scale=(x,y,z)` if needed
- After add: `obj = bpy.context.active_object` to get reference

### Code Quality Rules
- Always validate Python syntax with `compile()` before sending to Blender MCP
- Use `try/except Exception as e: print(e)` — never bare `try/except` without `except` block
- Always set active object before ops: `bpy.context.view_layer.objects.active = obj; obj.select_set(True)`
- Deselect all before adding: `bpy.ops.object.select_all(action='DESELECT')`

### Error Recovery
- On exec fail: fix and retry up to 3 times total, then skip
- On syntax error: fix syntax first, then retry exec
- NEVER silently pass on a step that had real code — log [SKIP] clearly

### Context / Sessions
- Bob runs via TCP MCP socket — no UI context, so `bpy.ops` needs explicit context setup
- `bpy.ops.object.mode_set(mode='EDIT')` requires active object to be set first
- When in doubt, use `bpy.data` directly over `bpy.ops` for data manipulation

## Skill: step_8
Tags: blender, tutorial
Context: Um I think I'm going to make it around Um I think I'm going to make it around holding down shift and just kind of drag holding down shift and just kind of drag holding down shift and just kind of drag
Code: import bpy  # no-op step
Gotcha: 
Source: chunk 8, ~11:10

## Skill: step_9
Tags: blender, tutorial
Context: are called vertices. These are the are called vertices. These are the points that make up the um yeah, the points that make up the um yeah, the points that make up the um yeah, the shape of the mesh, 
Code: import bpy  # no-op step
Gotcha: 
Source: chunk 9, ~17:20

## Skill: step_10
Tags: blender, tutorial
Context: delete the entire vertices of those delete the entire vertices of those faces. So, we have to confirm. We want faces. So, we have to confirm. We want faces. So, we have to confirm. We want to delete j
Code: bpy.ops.object.select_all(action='DESELECT')

cup_obj = bpy.context.view_layer.objects.active
if cup_obj and cup_obj.type == 'MESH':
    cup_obj.select_set(True)
    bpy.context.view_layer.objects.active = cup_obj
    
    try:
        modifier = cup_obj.modifiers.new(name="Solidify", type='SOLIDIFY')
        modifier.thickness = 0.01
    except Exception as e:
        print(f"Error adding Solidify modifier: {e}")
else:
    print("No mesh object found to add Solidify modifier to")
Gotcha: 
Source: chunk 10, ~18:21

## Skill: step_1
Tags: blender, tutorial
Context: So, this is Blender. It can do 3D So, this is Blender. It can do 3D So, this is Blender. It can do 3D modeling, texturing, lighting, shading, modeling, texturing, lighting, shading, modeling, texturin
Code: import bpy

# Deselect all objects
bpy.ops.object.select_all(action='DESELECT')

# Select and delete the default cube
cube = bpy.data.objects.get('Cube')
if cube:
    bpy.context.view_layer.objects.active = cube
    cube.select_set
Gotcha: 
Source: chunk 1, ~0:00

## Skill: step_2
Tags: blender, tutorial
Context: that's how you orbit around. You can see that's how you orbit around. You can see we're focusing on our cube at the we're focusing on our cube at the we're focusing on our cube at the moment, though. 
Code: # Delete the selected object (cube)
bpy.ops.object.delete()

# Deselect all before adding new object
bpy.ops.object.select_all(action='DESELECT')

# Add a new cube
bpy.ops.mesh.primitive_cube_add()
Gotcha: 
Source: chunk 2, ~3:00

## Skill: step_3
Tags: blender, tutorial
Context: reorient yourself. So the zed, that's reorient yourself. So the zed, that's the top axis and then you just you're the top axis and then you just you're the top axis and then you just you're back, righ
Code: bpy.ops.object.select_all(action='DESELECT')
bpy.ops.mesh.primitive_torus_add()
torus = bpy.context.active_object
bpy.context.view_layer.objects.active = torus
torus.select_set(True)
Gotcha: 
Source: chunk 3, ~4:30

## Skill: step_6
Tags: blender, tutorial
Context: Um, I'm going to keep it at 48, but I'm Um, I'm going to keep it at 48, but I'm going to increase the other one to about going to increase the other one to about going to increase the other one to abo
Code: bpy.ops.object.shade_smooth()
Gotcha: 
Source: chunk 6, ~9:04

## Skill: step_3
Tags: blender, tutorial
Context: reorient yourself. So the zed, that's reorient yourself. So the zed, that's the top axis and then you just you're the top axis and then you just you're the top axis and then you just you're back, righ
Code: import bpy

# Deselect all objects first
bpy.ops.object.select_all(action='DESELECT')

# Delete existing cube
cube = bpy.data.objects.get("Cube")
if cube:
    cube.select_set(True)
    bpy.context.view_layer.objects.active = cube
    bpy.ops.object.delete()

# Add torus (donut)
bpy.ops.mesh.primitive_torus_add()

# Get the newly added torus
torus = bpy.context.active_object

# Scale to create donut shape
torus.scale = (1.5, 1.5, 1.0)
bpy.ops.object.transform_apply(scale=True)
Gotcha: 
Source: chunk 3, ~4:30

## Skill: step_6
Tags: blender, tutorial
Context: Um, I'm going to keep it at 48, but I'm Um, I'm going to keep it at 48, but I'm going to increase the other one to about going to increase the other one to about going to increase the other one to abo
Code: bpy.ops.object.shade_smooth()
Gotcha: 
Source: chunk 6, ~9:04

## Skill: step_7
Tags: blender, tutorial
Context: in a new object, which if you can in a new object, which if you can remember from before, it's the add menu remember from before, it's the add menu remember from before, it's the add menu at the top t
Code: bpy.ops.object.select_all(action='DESELECT')
bpy.ops.mesh.primitive_cylinder_add(radius=0.13, depth=0.5, vertices=16, location=(0, 0, 0))
obj = bpy.context.active_object
bpy.ops.object.transform_apply(scale=True)
Gotcha: 
Source: chunk 7, ~10:35

## Skill: step_10
Tags: blender, tutorial
Context: an important point because modifiers are an important point because modifiers are not actually adjusting the real mesh. So not actually adjusting the real mesh. So not actually adjusting the real mesh
Code: bpy.ops.object.select_all(action='DESELECT')
obj = bpy.context.active_object
obj.select_set(True)
bpy.context.view_layer.objects.active = obj

bpy.ops.object.modifier_add(type='SUBSURF')

bpy.ops.object.mode_set(mode='EDIT')
bpy.ops.mesh.loopcut_slide()
Gotcha: 
Source: chunk 10, ~19:44

## Skill: step_11
Tags: blender, tutorial
Context: viewport. So this is just increasing the viewport. So this is just increasing the number of times that it um doubles the number of times that it um doubles the number of times that it um doubles the g
Code: bpy.ops.object.mode_set(mode='EDIT')
bpy.ops.mesh.loopcut_slide()
bpy.ops.mesh.inset()
Gotcha: 
Source: chunk 11, ~21:14

## Skill: step_24
Tags: blender, tutorial
Context: because there's something wrong with the because there's something wrong with the normals of the face that you tried to normals of the face that you tried to normals of the face that you tried to extr
Code: try:
    # Clear normals (Shift+N)
    bpy.ops.mesh.normals_make_consistent()
    
    # Move object up
    bpy.ops.transform.translate(value=(0, 0, 1))
    
    # Move object over (X axis)
    bpy.ops.transform.translate(value=(1, 0, 0))
    
    # Add loop cut (Ctrl+RightClick equivalent)
    bpy.ops.mesh.loopcut_slide()
except Exception:
    pass
Gotcha: 
Source: chunk 24, ~45:31

## Skill: step_25
Tags: blender, tutorial
Context: Might as well just grab it and pull it Might as well just grab it and pull it over. So, um I need to position this over. So, um I need to position this over. So, um I need to position this about here,
Code: try:
    # Set to face select mode
    bpy.ops.object.mode_set(mode='FACE_SELECT')
    
    # Rotate selected face
    bpy.ops.transform.rotate(value=0.5, orient_axis='Z')
    
    # Add loop cut
    bpy.ops.mesh.loopcut_slide(number_of_cuts=1, offset_factor=0.5)
    
    # Select face for extrusion
    bpy.ops.mesh.select_all(action='DESELECT')
    bpy.ops.mesh.select_face_by_count(count=1)
    
    # Extrude face
    bpy.ops.mesh.extrude_region_move()
    
    # Scale to make handle thinner
  
Gotcha: 
Source: chunk 25, ~47:02

## Skill: step_28
Tags: blender, tutorial
Context: them by holding down uh shift like this. them by holding down uh shift like this. And then I'm just going to hit F. F for And then I'm just going to hit F. F for And then I'm just going to hit F. F fo
Code: try:
    # Ensure we're in object mode first
    bpy.ops.object.mode_set(mode='OBJECT')
    
    # Get the active object (should be the mesh we're working on)
    obj = bpy.context.active_object
    if obj and obj.type == 'MESH':
        # Enter face select mode
        bpy.ops.object.mode_set(mode='EDIT')
        
        # Deselect all faces first
        bpy.ops.mesh.select_all(action='DESELECT')
        
        # Select the inner face that's causing smooth shading issues
        # In edit m
Gotcha: 
Source: chunk 28, ~51:37

## Skill: step_29
Tags: blender, tutorial
Context: to each other, that point there, right? to each other, that point there, right? But selecting one or the other, it it But selecting one or the other, it it But selecting one or the other, it it just h
Code: try:
    # Ensure we're in object mode
    bpy.ops.object.mode_set(mode='OBJECT')
    
    # Get the active object
    obj = bpy.context.active_object
    if obj and obj.type == 'MESH':
        # Shade smooth
        bpy.ops.object.shade_smooth()
        
        # Enter edit mode to recalculate normals
        bpy.ops.object.mode_set(mode='EDIT')
        
        # Select all faces
        bpy.ops.mesh.select_all(action='SELECT')
        
        # Recalculate normals (Shift+N)
        bpy.ops.
Gotcha: 
Source: chunk 29, ~53:08

## Skill: step_32
Tags: blender, tutorial
Context: part, which is going to be on uh part, which is going to be on uh materials and lighting, um you can you materials and lighting, um you can you materials and lighting, um you can you can do that. Howe
Code: try:
    # Move mug out of the way (translate along X axis)
    bpy.ops.object.mode_set(mode='OBJECT')
    
    # Find and select the mug object
    mug_obj = None
    for obj in bpy.context.scene.objects:
        if obj.type == 'MESH' and 'mug' in obj.name.lower():
            mug_obj = obj
            break
    
    if mug_obj:
        mug_obj.select_set(True)
        bpy.context.view_layer.objects.active = mug_obj
        bpy.ops.object.location_clear()
        bpy.ops.transform.translate(val
Gotcha: 
Source: chunk 32, ~57:41

## Skill: step_33
Tags: blender, tutorial
Context: to be making the icing. Yes, the to be making the icing. Yes, the exciting icing for our donut. Um, but exciting icing for our donut. Um, but exciting icing for our donut. Um, but first we do have qui
Code: try:
    # Delete the image object
    for obj in bpy.context.scene.objects:
        if obj.type == 'IMAGE' or 'image' in obj.name.lower():
            bpy.context.view_layer.objects.active = obj
            obj.select_set(True)
            bpy.ops.object.delete()
            break
except Exception:
    pass
Gotcha: 
Source: chunk 33, ~59:13

## Skill: step_34
Tags: blender, tutorial
Context: my mug out of the way. So, G and then X. my mug out of the way. So, G and then X. And I'm just going to throw it to the And I'm just going to throw it to the And I'm just going to throw it to the side
Code: try:
    # Find and select the donut object
    donut_obj = None
    for obj in bpy.context.scene.objects:
        if 'donut' in obj.name.lower() or 'doughnut' in obj.name.lower() or 'doughnut' in obj.name.lower():
            donut_obj = obj
            break
    
    if donut_obj is None:
        # Try to find any mesh object that could be the donut
        for obj in bpy.context.scene.objects:
            if obj.type == 'MESH' and obj.name != 'Image':
                donut_obj = obj
         
Gotcha: 
Source: chunk 34, ~60:44

## Skill: step_35
Tags: blender, tutorial
Context: go object and then say duplicate objects go object and then say duplicate objects there. Shift D. Um and when you do this, there. Shift D. Um and when you do this, there. Shift D. Um and when you do t
Code: try:
    # Rename the duplicated object to "icing"
    bpy.context.view_layer.objects.active = donut_obj
    donut_obj.name = "icing"
    
    # Go to front view
    bpy.ops.view3d.view_axis(type='FRONT')
    
    # Enter edit mode
    bpy.ops.object.mode_set(mode='EDIT')
    
    # Select face select mode
    bpy.ops.mesh.select_mode(type='FACE')
    
    # Enable X-ray mode (wireframe view)
    bpy.context.space_data.overlay.show_wire = True
    
    # Select bottom half of the donut (by locat
Gotcha: 
Source: chunk 35, ~62:15

## Skill: step_37
Tags: blender, tutorial
Context: my donut. We have to delete it. So, I'm my donut. We have to delete it. So, I'm going to hit X. When you do this, it's going to hit X. When you do this, it's going to hit X. When you do this, it's say
Code: try:
    # Turn off X-ray mode
    bpy.context.space_data.overlay.show_wire = False
    
    # Add Solidify modifier to add thickness
    bpy.ops.object.modifier_add(type='SOLIDIFY')
    solidify_mod = bpy.context.active_object.modifiers["Solidify"]
    solidify_mod.thickness = 0.1
    solidify_mod.offset = 1.0  # Add thickness outward instead of inward
    
    # Enable proportional editing
    bpy.context.space_data.use_proportional_edit = True
    bpy.context.space_data.proportional_edit_fall
Gotcha: 
Source: chunk 37, ~65:20

## Skill: step_41
Tags: blender, tutorial
Context: that uh that's going to go down down the that uh that's going to go down down the donut. donut. donut. like so. Okay, that is pretty good. Now, like so. Okay, that is pretty good. Now, like so. Okay, 
Code: try:
    # Add subdivision surface modifier
    bpy.ops.object.modifier_add(type='SUBSURF')
    subd_mod = bpy.context.active_object.modifiers["Subdivision"]
    subd_mod.levels = 2
    subd_mod.render_levels = 2
    
    # Enable proportional editing for smooth manipulation
    bpy.context.space_data.use_proportional_edit = True
    bpy.context.space_data.proportional_edit_falloff = 'SMOOTH'
    
except Exception as e:
    print(f"Error adding subdivision modifier: {e}")
    pass
Gotcha: 
Source: chunk 41, ~71:26

## Skill: step_42
Tags: blender, tutorial
Context: Um, as I said, you use these all the Um, as I said, you use these all the time, use it for most objects probably time, use it for most objects probably time, use it for most objects probably have a su
Code: try:
    # Add shrink wrap modifier to current object
    bpy.ops.object.modifier_add(type='SHRINKWRAP')
    shrink_wrap_mod = bpy.context.active_object.modifiers["Shrink Wrap"]
    
    # Set target object for shrink wrap (assuming donut exists)
    target_obj = bpy.data.objects.get("Donut")
    if target_obj:
        shrink_wrap_mod.target = target_obj
    
    # Adjust offset to prevent Z-fighting
    shrink_wrap_mod.offset = 0.001
    
except Exception as e:
    print(f"Error adding shrink w
Gotcha: 
Source: chunk 42, ~72:58

## Skill: step_43
Tags: blender, tutorial
Context: will remember uh when I was talking will remember uh when I was talking about the modifier that it works top to about the modifier that it works top to about the modifier that it works top to bottom. 
Code: try:
    # Get the active object (should be the donut)
    obj = bpy.context.active_object
    if obj:
        # Move shrink wrap modifier to top of stack
        shrink_wrap_mod = obj.modifiers.get("Shrink Wrap")
        if shrink_wrap_mod:
            # Move to top (index 0)
            obj.modifiers.move(shrink_wrap_mod, 0)
        
        # Add or modify subsurf modifier to level 2
        subsurf_mod = obj.modifiers.get("Subdivision Surface")
        if not subsurf_mod:
            bpy.ops
Gotcha: 
Source: chunk 43, ~74:28

## Skill: step_48
Tags: blender, tutorial
Context: also like do the exact same thing just also like do the exact same thing just playing with it. If you find like it's playing with it. If you find like it's playing with it. If you find like it's kind 
Code: try:
    # Get the active object (donut)
    obj = bpy.context.active_object
    if obj and obj.type == 'MESH':
        # Enter edit mode
        bpy.ops.object.mode_set(mode='EDIT')
        
        # Select all vertices first
        bpy.ops.mesh.select_all(action='SELECT')
        
        # Select middle row (Alt+click equivalent - select connected loop)
        bpy.ops.mesh.select_linked_pick(deselect=False)
        
        # Exit edit mode
        bpy.ops.object.mode_set(mode='OBJECT')
  
Gotcha: 
Source: chunk 48, ~82:05

## Skill: step_49
Tags: blender, tutorial
Context: is thickness variation. Because if you is thickness variation. Because if you go around it, you'll see that the exact, go around it, you'll see that the exact, go around it, you'll see that the exact,
Code: try:
    # Deselect all objects first
    bpy.ops.object.select_all(action='DESELECT')
    
    # Get the active object (donut)
    obj = bpy.context.active_object
    if obj and obj.type == 'MESH':
        # Make sure object is active
        bpy.context.view_layer.objects.active = obj
        obj.select_set(True)
        
        # Apply shrink wrap modifier first (top to bottom order)
        for modifier in obj.modifiers:
            if modifier.type == 'SHRINKWRAP':
                bpy.ops.
Gotcha: 
Source: chunk 49, ~83:37

## Skill: step_50
Tags: blender, tutorial
Context: and click apply. Okay. Now in edit mode and click apply. Okay. Now in edit mode you can see we've still got those single you can see we've still got those single you can see we've still got those sing
Code: try:
    # Ensure object is selected and active
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)
    
    # Apply subsurf modifier (Ctrl+A equivalent)
    for modifier in obj.modifiers:
        if modifier.type == 'SUBSURF':
            bpy.ops.object.modifier_apply(modifier=modifier.name)
            break
    
    # Switch to edit mode to work with geometry
    bpy.ops.object.mode_set(mode='EDIT')
    
    # Turn off proportional editing
    bpy.context.space_data.use_p
Gotcha: 
Source: chunk 50, ~85:08

## Skill: step_53
Tags: blender, tutorial
Context: it a go. Um, there's a hint, we've got it a go. Um, there's a hint, we've got some modifiers on the right here. And I some modifiers on the right here. And I some modifiers on the right here. And I wi
Code: try:
    # Deselect all objects first
    bpy.ops.object.select_all(action='DESELECT')
    
    # Add a cylinder (best for plate shape)
    bpy.ops.mesh.primitive_cylinder_add()
    
    # Get the newly added object
    obj = bpy.context.active_object
    
    # Set it as active and selected
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)
    
    # Scale to make it flat like a plate
    obj.scale = (1.0, 1.0, 0.1)
    bpy.ops.object.transform_apply(scale=True)
    
    
Gotcha: 
Source: chunk 53, ~89:41

## Skill: step_54
Tags: blender, tutorial
Context: render. Faces do. So we need to add a render. Faces do. So we need to add a type of face underneath fill. So there's type of face underneath fill. So there's type of face underneath fill. So there's t
Code: try:
    # Enter edit mode
    bpy.ops.object.mode_set(mode='EDIT')
    
    # Select all faces
    bpy.ops.mesh.select_all(action='SELECT')
    bpy.ops.mesh.select_face_by_sides(number=4, extend=False)
    
    # Extrude along normal
    bpy.ops.mesh.extrude_region_move()
    
    # Delete the top face
    bpy.ops.mesh.delete(type='FACE')
    
    # Select edge ring
    bpy.ops.mesh.select_all(action='DESELECT')
    bpy.ops.mesh.select_edge_loop()
    
    # Scale outwards to create rim
    bpy
Gotcha: 
Source: chunk 54, ~91:12

## Skill: step_55
Tags: blender, tutorial
Context: scale. So S to scale and then just scale. So S to scale and then just pulling my mouse out until it looks pulling my mouse out until it looks pulling my mouse out until it looks something like that. D
Code: try:
    # Enter edit mode
    bpy.ops.object.mode_set(mode='EDIT')
    
    # Select all faces
    bpy.ops.mesh.select_all(action='SELECT')
    
    # Extrude to create flat area
    bpy.ops.mesh.extrude_region_move()
    
    # Cancel movement (Esc)
    bpy.ops.transform.translate()
    
    # Scale outwards to create rim
    bpy.ops.transform.resize(value=(1.1, 1.1, 1.0))
    
    # Merge by distance to fix double vertices
    bpy.ops.mesh.select_all(action='SELECT')
    bpy.ops.mesh.remove_d
Gotcha: 
Source: chunk 55, ~92:43

## Skill: step_58
Tags: blender, tutorial
Context: gonna do a shade smooth now because I gonna do a shade smooth now because I want to see how that looks. And that's want to see how that looks. And that's want to see how that looks. And that's pretty 
Code: try:
    # Shade smooth (already done in previous step, but narrator mentions it)
    bpy.ops.object.shade_smooth()
    
    # Add solidify modifier
    bpy.ops.object.modifier_add(type='SOLIDIFY')
    
    # Move solidify modifier to top of stack
    obj = bpy.context.active_object
    if obj and obj.modifiers:
        solidify_mod = obj.modifiers['Solidify']
        obj.modifiers.move(solidify_mod, 0)
    
    # Adjust solidify thickness for sharper edge
    if obj and obj.modifiers:
        s
Gotcha: 
Source: chunk 58, ~97:15

## Skill: step_60
Tags: blender, tutorial
Context: I've like 3xed the amount of work and I've like 3xed the amount of work and you just learn these things over time. you just learn these things over time. you just learn these things over time. However
Code: try:
    # Deselect all objects first
    bpy.ops.object.select_all(action='DESELECT')
    
    # Select both objects (icing and doughut)
    icing_obj = bpy.data.objects.get('Icing')
    doughut_obj = bpy.data.objects.get('Doughnut')
    
    if icing_obj and doughut_obj:
        icing_obj.select_set(True)
        doughut_obj.select_set(True)
        bpy.context.view_layer.objects.active = doughut_obj
        
        # Add lattice deform selected modifier (Blender 5.0 feature)
        bpy.ops.
Gotcha: 
Source: chunk 60, ~100:15

## Skill: step_63
Tags: blender, tutorial
Context: good hotkey to remember. Um and then good hotkey to remember. Um and then here, so at the bottom here, cuz yeah, here, so at the bottom here, cuz yeah, here, so at the bottom here, cuz yeah, the same 
Code: try:
    # Deselect all objects first
    bpy.ops.object.select_all(action='DESELECT')
    
    # Get the donut object and lattice object
    doughut_obj = bpy.data.objects.get('Doughnut')
    lattice_obj = bpy.data.objects.get('Lattice')
    
    if doughut_obj:
        # Select the donut
        doughut_obj.select_set(True)
        bpy.context.view_layer.objects.active = doughut_obj
        
        # Apply the lattice modifier
        bpy.ops.object.modifier_apply(modifier='Lattice')
        
Gotcha: 
Source: chunk 63, ~104:47

## Skill: step_66
Tags: blender, tutorial
Context: and that is because by default there's and that is because by default there's an option that is turned off. So if you an option that is turned off. So if you an option that is turned off. So if you go
Code: try:
    # Enable ray tracing in Eevee render settings
    bpy.context.scene.render.engine = 'BLENDER_EEVEE'
    if bpy.context.scene.eevee:
        bpy.context.scene.eevee.use_ray_tracing = True
except Exception as e:
    print(f"Error: {e}")
    pass
Gotcha: 
Source: chunk 66, ~110:50

## Skill: step_71
Tags: blender, tutorial
Context: essentially, I need to clear all those essentially, I need to clear all those out and make them one, which here's a out and make them one, which here's a out and make them one, which here's a tip. You
Code: try:
    # Deselect all objects first
    bpy.ops.object.select_all(action='DESELECT')
    
    # Add a cube for the table
    bpy.ops.mesh.primitive_cube_add()
    
    # Get the active object (the newly added cube)
    table_obj = bpy.context.active_object
    
    # Set it as active
    bpy.context.view_layer.objects.active = table_obj
    
    # Scale it to look like a table
    table_obj.scale = (2.0, 2.0, 0.5)
    bpy.ops.object.transform_apply(scale=True)
    
    # Position it below the 
Gotcha: 
Source: chunk 71, ~118:30

## Skill: step_81
Tags: blender, tutorial
Context: exact same ones everywhere. So, shift A exact same ones everywhere. So, shift A is the same as shift A over there, is the same as shift A over there, is the same as shift A over there, right? Add. Um,
Code: try:
    # Get the active object (the cube we added earlier)
    obj = bpy.context.active_object
    
    # Ensure object is selected
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj
    
    # Get or create material
    if not obj.data.materials:
        mat = bpy.data.materials.new(name="TableMaterial")
        obj.data.materials.append(mat)
    else:
        mat = obj.data.materials[0]
    
    # Ensure nodes are available
    if not mat.use_nodes:
        mat.use_node
Gotcha: 
Source: chunk 81, ~133:43

## Skill: step_83
Tags: blender, tutorial
Context: those utility maps, but uh Blenders is those utility maps, but uh Blenders is non-color data. Okay. So now that we've non-color data. Okay. So now that we've non-color data. Okay. So now that we've go
Code: try:
    # Get the active object and its material
    obj = bpy.context.active_object
    if obj and obj.active_material:
        mat = obj.active_material
        nodes = mat.node_tree.nodes
        links = mat.node_tree.links
        
        # Add Image Texture node for roughness
        img_texture_roughness = nodes.new(type='ShaderNodeTexImage')
        img_texture_roughness.location = (400, 0)
        
        # Load the roughness image (file with "roughness" in name)
        try:
        
Gotcha: 
Source: chunk 83, ~136:46

## Skill: step_87
Tags: blender, tutorial
Context: Okay. So, we have correctly um applied Okay. So, we have correctly um applied it. You can see all the nodes are there. it. You can see all the nodes are there. it. You can see all the nodes are there.
Code: try:
    obj = bpy.context.active_object
    if obj and obj.type == 'MESH':
        # Switch to edit mode
        bpy.ops.object.mode_set(mode='EDIT')
        
        # Select all mesh elements
        bpy.ops.mesh.select_all(action='SELECT')
        
        # UV unwrap with angle-based method
        bpy.ops.uv.unwrap(method='ANGLE_BASED')
        
        # Switch back to object mode
        bpy.ops.object.mode_set(mode='OBJECT')
        
except Exception as e:
    print(f"Error: {e}")
    p
Gotcha: 
Source: chunk 87, ~142:52

## Skill: step_88
Tags: blender, tutorial
Context: applied to on it. So if I select a point applied to on it. So if I select a point right here on the mesh, you can see right here on the mesh, you can see right here on the mesh, you can see which poin
Code: try:
    obj = bpy.context.active_object
    if obj and obj.type == 'MESH':
        # Switch to edit mode
        bpy.ops.object.mode_set(mode='EDIT')
        
        # Select all mesh elements
        bpy.ops.mesh.select_all(action='SELECT')
        
        # Mark seams for UV unwrapping
        bpy.ops.mesh.mark_seam()
        
        # Switch to wireframe mode to check UV layout
        bpy.ops.object.mode_set(mode='OBJECT')
        bpy.context.space_data.shading.type = 'WIREFRAME'
       
Gotcha: 
Source: chunk 88, ~144:23

## Skill: step_90
Tags: blender, tutorial
Context: selected that, to add a cut, we're going selected that, to add a cut, we're going to hit Ctrl E, and then I'm going to to hit Ctrl E, and then I'm going to to hit Ctrl E, and then I'm going to select 
Code: try:
    obj = bpy.context.active_object
    if obj and obj.type == 'MESH':
        # Switch to edit mode
        bpy.ops.object.mode_set(mode='EDIT')
        
        # Deselect all first
        bpy.ops.mesh.select_all(action='DESELECT')
        
        # Select a line on the inside of the donut (Alt+Select equivalent)
        # In edit mode, we need to select edges
        bpy.ops.mesh.select_all(action='DESELECT')
        bpy.ops.mesh.select_mode(type='EDGE')
        
        # Select edge 
Gotcha: 
Source: chunk 90, ~147:26

## Skill: step_94
Tags: blender, tutorial
Context: right down here at the bottom where it right down here at the bottom where it says displacement it would change that says displacement it would change that says displacement it would change that to di
Code: try:
    obj = bpy.context.active_object
    if obj and obj.type == 'MESH':
        # Add subdivision surface modifier
        mod = obj.modifiers.new(name="Subdivision", type='SUBSURF')
        mod.levels = 3
        mod.render_levels = 3
        
        # Adjust displacement scale
        for m in obj.modifiers:
            if m.type == 'DISPLACE':
                m.strength = 0.12
        
        # Add subsurface scattering to material
        if obj.data.materials:
            mat = obj.da
Gotcha: 
Source: chunk 94, ~153:31

## Skill: step_98
Tags: blender, tutorial
Context: seam. Okay. So, now it has changed. So, seam. Okay. So, now it has changed. So, we've got the handle here. Now, if you we've got the handle here. Now, if you we've got the handle here. Now, if you wan
Code: try:
    obj = bpy.context.active_object
    if obj and obj.type == 'MESH':
        # Enter edit mode for UV editing
        bpy.ops.object.mode_set(mode='EDIT')
        
        # Deselect all edges first
        bpy.ops.mesh.select_all(action='DESELECT')
        
        # Select edges to mark as seams (Alt+click equivalent)
        # Selecting all edges for demonstration
        bpy.ops.mesh.select_all(action='SELECT')
        
        # Mark selected edges as UV seams
        bpy.ops.mesh.se
Gotcha: 
Source: chunk 98, ~159:36

## Skill: step_105
Tags: blender, tutorial
Context: of the handle. And by the way, you'll of the handle. And by the way, you'll notice as you slide it off the screen notice as you slide it off the screen notice as you slide it off the screen there, it 
Code: try:
    obj = bpy.context.active_object
    if obj and obj.type == 'MESH':
        # Enter edit mode for UV editing
        bpy.ops.object.mode_set(mode='EDIT')
        
        # Switch to UV select mode
        bpy.ops.uv.select_all(action='SELECT')
        
        # Select all UV islands for demonstration
        bpy.ops.uv.select_all(action='SELECT')
        
        # Scale selected UV islands along Y axis (S + Y)
        bpy.ops.transform.resize(value=(1.0, 1.0, 1.0), orient_type='GLOBAL
Gotcha: 
Source: chunk 105, ~170:15

## Skill: step_108
Tags: blender, tutorial
Context: all the islands have to be separated, all the islands have to be separated, but there's also like margin because but there's also like margin because but there's also like margin because like in games
Code: try:
    obj = bpy.context.active_object
    if obj and obj.type == 'MESH' and obj.data.materials:
        mat = obj.data.materials[0]
        if mat.use_nodes:
            # Disconnect roughness input
            for node in mat.node_tree.nodes:
                if node.type == 'BSDF_PRINCIPLED':
                    # Disconnect roughness input
                    if node.inputs['Roughness'].is_linked:
                        mat.node_tree.links.remove(node.inputs['Roughness'].links[0])
        
Gotcha: 
Source: chunk 108, ~174:47

## Skill: step_109
Tags: blender, tutorial
Context: control and I want this to look shinier. control and I want this to look shinier. This is a little dull for me. So I'm This is a little dull for me. So I'm This is a little dull for me. So I'm going t
Code: try:
    obj = bpy.context.active_object
    if obj and obj.type == 'MESH' and obj.data.materials:
        mat = obj.data.materials[0]
        if mat.use_nodes:
            nt = mat.node_tree
            
            # Remove AO node if it exists
            for node in nt.nodes:
                if node.type == 'TEX_IMAGE' and 'AO' in node.name:
                    nt.nodes.remove(node)
            
            # Find BSDF and adjust base color (make concrete less pale)
            for node in n
Gotcha: 
Source: chunk 109, ~176:18

## Skill: step_110
Tags: blender, tutorial
Context: look like that, right? It looks like look like that, right? It looks like dusty, like a workman floor. So, we can dusty, like a workman floor. So, we can dusty, like a workman floor. So, we can adjust
Code: try:
    # Get active object
    obj = bpy.context.active_object
    if obj and obj.type == 'MESH':
        mat = obj.data.materials[0]
        if mat.use_nodes:
            nt = mat.node_tree
            
            # Add RGB Curves node
            rgb_curves = nt.nodes.new('ShaderNodeRGBCurve')
            rgb_curves.location = (400, 0)
            rgb_curves.name = "RGB Curves"
            
            # Set up a contrast curve (S-curve)
            curve = rgb_curves.curves[0]
            
Gotcha: 
Source: chunk 110, ~177:49

## Skill: step_111
Tags: blender, tutorial
Context: like this. But that's a simple thing and like this. But that's a simple thing and it's already looking good. And then I it's already looking good. And then I it's already looking good. And then I want
Code: try:
    # Get active object
    obj = bpy.context.active_object
    if obj and obj.type == 'MESH':
        mat = obj.data.materials[0]
        if mat.use_nodes:
            nt = mat.node_tree
            
            # Add Hue Saturation Value node
            hsv_node = nt.nodes.new('ShaderNodeHueSaturation')
            hsv_node.location = (200, 0)
            hsv_node.name = "Hue Saturation Value"
            
            # Reduce saturation to fix yellowy green look
            hsv_node.inp
Gotcha: 
Source: chunk 111, ~179:20

## Skill: step_112
Tags: blender, tutorial
Context: is our coffee foam. And this one is is our coffee foam. And this one is super easy and it's another chance to super easy and it's another chance to super easy and it's another chance to talk about um 
Code: try:
    # Select the mug object (assuming it exists)
    bpy.ops.object.select_all(action='DESELECT')
    mug_obj = bpy.data.objects.get("mug")
    if mug_obj:
        bpy.context.view_layer.objects.active = mug_obj
        mug_obj.select_set(True)
        
        # Go into Edit Mode
        bpy.ops.object.mode_set(mode='EDIT')
        
        # Select all (to select the circle/edge loop)
        bpy.ops.mesh.select_all(action='SELECT')
        
        # Duplicate the selection (Shift D)
   
Gotcha: 
Source: chunk 112, ~180:51

## Skill: step_113
Tags: blender, tutorial
Context: where is it. Hold on a second. where is it. Hold on a second. All right. Okay. So, you have to go into All right. Okay. So, you have to go into All right. Okay. So, you have to go into uh wireframe mo
Code: bpy.ops.object.mode_set(mode='EDIT')

# Select all faces
bpy.ops.mesh.select_all(action='SELECT')

# Create inset (I key)
bpy.ops.mesh.inset()

# Move inset down along Z axis (G, Z)
bpy.ops.transform.translate(value=(0, 0, -0.01))

# Exit Edit Mode
bpy.ops.object.mode_set(mode='OBJECT')
Gotcha: 
Source: chunk 113, ~182:22

## Skill: step_114
Tags: blender, tutorial
Context: to Sorry. Yeah, right here. I'm going to to Sorry. Yeah, right here. I'm going to hit G and then Z to bring it down like hit G and then Z to bring it down like hit G and then Z to bring it down like s
Code: bpy.ops.object.shade_smooth()
Gotcha: 
Source: chunk 114, ~183:52

## Skill: step_141
Tags: blender, tutorial
Context: the mug. Ctrl P. Keep transform. And the mug. Ctrl P. Keep transform. And then also the plate and the cup. I'm then also the plate and the cup. I'm then also the plate and the cup. I'm going to parent
Code: import bpy

# Parent objects to table with keep transform
try:
    bpy.ops.object.select_all(action='DESELECT')
    
    # Select mug, plate, cup
    for obj_name in ['mug', 'plate', 'cup']:
        obj = bpy.data.objects.get(obj_name)
        if obj:
            obj.select_set(True)
    
    # Select table (parent)
    table_obj = bpy.data.objects.get('table')
    if table_obj:
        table_obj.select_set(True)
        bpy.context.view_layer.objects.active = table_obj
    
    # Parent with ke
Gotcha: 
Source: chunk 141, ~227:59

## Skill: step_142
Tags: blender, tutorial
Context: but we're trying. So, early morning, but we're trying. So, early morning, somebody's got their coffee in a cafe or somebody's got their coffee in a cafe or somebody's got their coffee in a cafe or som
Code: # Add first blocker plane
try:
    bpy.ops.object.select_all(action='DESELECT')
    bpy.ops.mesh.primitive_plane_add(location=(0, 0, 0))
    blocker1 = bpy.context.active_object
    blocker1.name = "blocker_1"
    
    # Rotate 90 degrees on X axis
    bpy.ops.object.mode_set(mode='OBJECT')
    bpy.ops.object.transform_rotate(value=1.5708, orient_axis='X')
except Exception as e:
    print(f"Blocker 1 error: {e}")

# Add second blocker plane
try:
    bpy.ops.object.select_all(action='DESELECT')
 
Gotcha: 
Source: chunk 142, ~231:00

## Skill: step_143
Tags: blender, tutorial
Context: objects to the left hand side outside of objects to the left hand side outside of frame. But not only that, this is a frame. But not only that, this is a frame. But not only that, this is a sunrise. I
Code: # Select blocker objects
try:
    bpy.ops.object.select_all(action='DESELECT')
    blocker1 = bpy.data.objects.get("blocker_1")
    blocker2 = bpy.data.objects.get("blocker_2")
    
    if blocker1:
        blocker1.select_set(True)
    if blocker2:
        blocker2.select_set(True)
    
    bpy.context.view_layer.objects.active = blocker1
    blocker1.select_set(True)
    blocker2.select_set(True)
    
    # Create new collection called "lighting"
    lighting_collection = bpy.data.collections.
Gotcha: 
Source: chunk 143, ~234:07

## Skill: step_146
Tags: blender, tutorial
Context: From here to here, what am I thinking From here to here, what am I thinking of? But basically, like from the the mug of? But basically, like from the the mug of? But basically, like from the the mug t
Code: try:
    # Select and duplicate skylighting for bounce lighting
    bpy.ops.object.select_all(action='DESELECT')
    sky_obj = bpy.data.objects.get("sky")
    if sky_obj:
        sky_obj.select_set(True)
        bpy.context.view_layer.objects.active = sky_obj
        
        # Duplicate the skylight
        bpy.ops.object.duplicate()
        bounce_lamp = bpy.context.active_object
        bounce_lamp.name = "bounce_light"
        
        # Position it for ceiling bounce
        bounce_lamp.loc
Gotcha: 
Source: chunk 146, ~238:41

## Skill: step_147
Tags: blender, tutorial
Context: just mousing over a color here, just hit just mousing over a color here, just hit backspace and now it goes to its default backspace and now it goes to its default backspace and now it goes to its def
Code: try:
    # Adjust skylighting - make less blue and adjust brightness
    sky_obj = bpy.data.objects.get("sky")
    if sky_obj and sky_obj.data:
        # Reduce blue component, adjust energy
        sky_obj.data.color = (0.95, 0.95, 0.9)  # Less blue
        sky_obj.data.energy = 8.0  # Dial back brightness
        
    # Adjust saturation on bounce light
    bounce_obj = bpy.data.objects.get("bounce_light")
    if bounce_obj and bounce_obj.data:
        bounce_obj.data.energy = 10.0  # Keep at 
Gotcha: 
Source: chunk 147, ~240:13

## Skill: step_149
Tags: blender, tutorial
Context: and you don't want to have lighting kind and you don't want to have lighting kind of changing all over the place. I've got of changing all over the place. I've got of changing all over the place. I've
Code: try:
    # Set Eevee shadow steps to maximum (16) for better shadow quality
    bpy.context.scene.eevee.shadow_map_quality = 16
    
    # Adjust scale of icing on donut to 0.3
    icing_obj = bpy.data.objects.get("icing")
    if icing_obj:
        icing_obj.scale = (0.3, 0.3, 0.3)
        
    # Adjust scale of sprinkles to 0.8
    sprinkles_obj = bpy.data.objects.get("sprinkles")
    if sprinkles_obj:
        sprinkles_obj.scale = (0.8, 0.8, 0.8)
        
    # Add light resting on edge of pla
Gotcha: 
Source: chunk 149, ~243:14

## Skill: step_150
Tags: blender, tutorial
Context: a crazy amount or else. Yeah. And that's a crazy amount or else. Yeah. And that's this is quite common to do, right? If this is quite common to do, right? If this is quite common to do, right? If you'
Code: try:
    # Set viewport samples to 16
    bpy.context.scene.eevee.viewport_samples = 16
    
    # Set render samples to 64
    bpy.context.scene.eevee.samples = 64
    
    # Enable light probes for Eevee realism
    bpy.context.scene.eevee.use_light_probes = True
    
    # Enable depth of field on camera
    camera_obj = bpy.context.scene.camera
    if camera_obj:
        camera_obj.data.dof.use_dof = True
        
except Exception as e:
    print(f"Render settings/light probe error: {e}")
Gotcha: 
Source: chunk 150, ~244:45

## Skill: step_153
Tags: blender, tutorial
Context: our camera object in our outliner and our camera object in our outliner and then down here there is a checkbox for then down here there is a checkbox for then down here there is a checkbox for depth o
Code: try:
    # Set focus object for depth of field
    camera_obj = bpy.context.scene.camera
    if camera_obj:
        # Find the icing object (assuming it exists)
        icing_obj = bpy.data.objects.get("Icing")
        if icing_obj:
            camera_obj.data.dof.focus_object = icing_obj
        else:
            # If icing object doesn't exist, use active object
            if bpy.context.active_object:
                camera_obj.data.dof.focus_object = bpy.context.active_object
    
    # Ena
Gotcha: 
Source: chunk 153, ~249:19

## Skill: step_4
Tags: blender, tutorial
Context: find that key. So, X, and then delete. find that key. So, X, and then delete. And now I want to add a new object. And And now I want to add a new object. And And now I want to add a new object. And I 
Code: # Deselect all objects first
for obj in bpy.context.scene.objects:
    obj.select_set(False)

# Add torus (donut) object
bpy.ops.mesh.primitive_torus_add()

# Get the newly added object
torus_obj = bpy.context.active_object

# Scale it to make it thicker (as mentioned in tutorial)
torus_obj.scale = (1.5, 1.5, 1.5)
bpy.ops.object.transform_apply(scale=True)
Gotcha: 
Source: chunk 4, ~6:01

## Skill: step_5
Tags: blender, tutorial
Context: the bottom lefthand corner additional the bottom lefthand corner additional options which you can tweak and change options which you can tweak and change options which you can tweak and change things 
Code: # Select the existing Torus object
torus_obj = bpy.data.objects.get('Torus')
if torus_obj:
    bpy.context.view_layer.objects.active = torus_obj
    torus_obj.select_set(True)
    
    # Scale to 0.1 (10cm as mentioned in tutorial)
    torus_obj.scale = (0.1, 0.1, 0.1)
    bpy.ops.object.transform_apply(scale=True)
else:
    # If Torus doesn't exist, add a new one
    bpy.ops.mesh.primitive_torus_add()
    torus_obj = bpy.context.active_object
    torus_obj.scale = (0.1, 0.1, 0.1)
    bpy.ops.ob
Gotcha: 
Source: chunk 5, ~7:31

## Skill: step_6
Tags: blender, tutorial
Context: Um, I'm going to keep it at 48, but I'm Um, I'm going to keep it at 48, but I'm going to increase the other one to about going to increase the other one to about going to increase the other one to abo
Code: # Apply smooth shading to the donut (Torus)
donut_obj = bpy.data.objects.get('Donut')
if not donut_obj:
    donut_obj = bpy.data.objects.get('Torus')

if donut_obj:
    bpy.context.view_layer.objects.active = donut_obj
    donut_obj.select_set(True)
    bpy.ops.object.shade_smooth()

# Start adding a coffee mug (cylinder)
bpy.ops.object.select_all(action='DESELECT')
bpy.ops.mesh.primitive_cylinder_add()
mug_obj = bpy.context.active_object
mug_obj.name = 'Mug'
mug_obj.scale = (0.5, 0.5, 0.5)
bpy.
Gotcha: 
Source: chunk 6, ~9:04

## Skill: step_7
Tags: blender, tutorial
Context: in a new object, which if you can in a new object, which if you can remember from before, it's the add menu remember from before, it's the add menu remember from before, it's the add menu at the top t
Code: bpy.ops.object.select_all(action='DESELECT')
bpy.ops.mesh.primitive_cylinder_add()
cylinder_obj = bpy.context.active_object
cylinder_obj.name = 'Mug'
cylinder_obj.scale = (0.13, 0.13, 1.0)
bpy.ops.object.transform_apply(scale=True)
cylinder_obj.location = (0, 0, 0.5)

# Reduce vertices for low res (before subsurf)
bpy.context.view_layer.objects.active = cylinder_obj
cylinder_obj.select_set(True)
bpy.ops.object.mode_set(mode='EDIT')
bpy.ops.mesh.select_all(action='SELECT')
bpy.ops.mesh.quads_conv
Gotcha: 
Source: chunk 7, ~10:35

## Skill: step_9
Tags: blender, tutorial
Context: me what part do you want to delete? Um, me what part do you want to delete? Um, which might sound redundant, but there which might sound redundant, but there which might sound redundant, but there is 
Code: # Select the Mug object
mug_obj = bpy.data.objects.get('Mug')
if mug_obj:
    bpy.context.view_layer.objects.active = mug_obj
    mug_obj.select_set(True)
    
    # Add Solidify modifier to give the mug thickness
    bpy.ops.object.modifier_add(type='SOLIDIFY')
    solidify_mod = mug_obj.modifiers['Solidify']
    solidify_mod.thickness = 0.01
Gotcha: 
Source: chunk 9, ~18:12

## Skill: step_7
Tags: blender, tutorial
Context: in a new object, which if you can in a new object, which if you can remember from before, it's the add menu remember from before, it's the add menu remember from before, it's the add menu at the top t
Code: bpy.ops.object.select_all(action='DESELECT')
bpy.ops.mesh.primitive_cylinder_add()
obj = bpy.context.active_object
obj.scale = (0.13, 0.13, 1.0)
bpy.ops.object.transform_apply(scale=True)
bpy.ops.object.mode_set(mode='EDIT')
bpy.ops.mesh.select_all(action='SELECT')
bpy.ops.mesh.subdivide()
bpy.ops.object.mode_set(mode='OBJECT')
Gotcha: 
Source: chunk 7, ~10:35

## Skill: step_9
Tags: blender, tutorial
Context: me what part do you want to delete? Um, me what part do you want to delete? Um, which might sound redundant, but there which might sound redundant, but there which might sound redundant, but there is 
Code: bpy.ops.object.select_all(action='DESELECT')
obj = bpy.data.objects.get('MESH')
if obj:
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj
    mod = obj.modifiers.new('Solidify', 'SOLIDIFY')
    mod.thickness = 0.05
    mod.offset = 0.5
    mod.use_even_offset = False
    mod.use_fill_caps = True
Gotcha: 
Source: chunk 9, ~18:12

## Skill: step_10
Tags: blender, tutorial
Context: an important point because modifiers are an important point because modifiers are not actually adjusting the real mesh. So not actually adjusting the real mesh. So not actually adjusting the real mesh
Code: bpy.ops.object.select_all(action='DESELECT')
obj = bpy.data.objects.get('MESH')
if obj:
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj
    try:
        mod = obj.modifiers.new('Subdiv', 'SUBSURF')
        mod.levels = 1
        mod.render_levels = 1
        bpy.ops.object.mode_set(mode='EDIT')
        bpy.ops.mesh.select_all(action='SELECT')
        bpy.ops.mesh.loopcut()
        bpy.ops.object.mode_set(mode='OBJECT')
    except Exception as e:
        print(f"Error: {e
Gotcha: 
Source: chunk 10, ~19:44

## Skill: step_11
Tags: blender, tutorial
Context: viewport. So this is just increasing the viewport. So this is just increasing the number of times that it um doubles the number of times that it um doubles the number of times that it um doubles the g
Code: bpy.ops.object.select_all(action='DESELECT')
obj = bpy.data.objects.get('MESH')
if obj:
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj
    try:
        bpy.ops.object.mode_set(mode='EDIT')
        bpy.ops.mesh.select_all(action='SELECT')
        bpy.ops.mesh.loopcut()
        bpy.ops.mesh.inset()
        bpy.ops.object.mode_set(mode='OBJECT')
    except Exception as e:
        print(f"Error: {e}")
Gotcha: 
Source: chunk 11, ~21:14

## Skill: step_17
Tags: blender, tutorial
Context: below. Um and uh it's on my website. below. Um and uh it's on my website. I've got all the links to everything I've got all the links to everything I've got all the links to everything we're going to 
Code: bpy.ops.object.select_all(action='DESELECT')
obj = bpy.data.objects.get('MESH')
if obj:
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj
    try:
        bpy.ops.object.transform_clear_rotation()
        bpy.ops.transform.rotate(value=1.5708, orient_axis='X')
        mod = obj.modifiers.new('Subdiv', 'SUBSURF')
        mod.levels = 2
        mod.render_levels = 3
        bpy.ops.object.mode_set(mode='EDIT')
        bpy.ops.mesh.select_all(action='SELECT')
        bpy.ops.
Gotcha: 
Source: chunk 17, ~31:50

## Skill: step_19
Tags: blender, tutorial
Context: the right shape. Okay, now this bit at the right shape. Okay, now this bit at the bottom here. Okay. So, I can see the bottom here. Okay. So, I can see the bottom here. Okay. So, I can see already tha
Code: bpy.ops.object.select_all(action='DESELECT')
obj = bpy.data.objects.get('MESH')
if obj:
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj
    try:
        bpy.ops.object.mode_set(mode='EDIT')
        bpy.ops.mesh.select_all(action='DESELECT')
        bpy.ops.object.mode_set(mode='OBJECT')
        bpy.ops.object.mode_set(mode='EDIT')
        bpy.ops.mesh.select_face_by_sides(number=4, extend=False)
        bpy.ops.transform.resize(value=(1.1, 1.1, 1.1))
        bpy.ops.mesh
Gotcha: 
Source: chunk 19, ~37:56

## Skill: step_21
Tags: blender, tutorial
Context: now saying where do you want to slide it now saying where do you want to slide it to? So I'm going to slide one to the to? So I'm going to slide one to the to? So I'm going to slide one to the bottom 
Code: bpy.ops.object.select_all(action='DESELECT')
obj = bpy.data.objects.get('MESH')
if obj:
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj
    try:
        bpy.ops.object.mode_set(mode='EDIT')
        bpy.ops.mesh.select_all(action='DESELECT')
        bpy.ops.mesh.loopcut()
        bpy.ops.transform.edge_crease(value=0.5)
        bpy.ops.mesh.select_all(action='DESELECT')
        bpy.ops.mesh.select_face_by_sides(number=4, extend=False)
        bpy.ops.mesh.extrude_region_m
Gotcha: 
Source: chunk 21, ~40:58

## Skill: step_22
Tags: blender, tutorial
Context: extrude out. Um, now before I show you extrude out. Um, now before I show you how to uh extrude, I first of all want how to uh extrude, I first of all want how to uh extrude, I first of all want to sh
Code: bpy.ops.object.select_all(action='DESELECT')
obj = bpy.data.objects.get('MESH')
if obj:
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj
    try:
        # Apply all modifiers to bake them into mesh geometry
        for mod in obj.modifiers:
            bpy.ops.object.modifier_apply(modifier=mod.name)
        bpy.ops.object.mode_set(mode='EDIT')
        bpy.ops.mesh.select_all(action='DESELECT')
        bpy.ops.mesh.select_face_by_sides(number=4, extend=False)
        bpy
Gotcha: 
Source: chunk 22, ~42:30

## Skill: step_23
Tags: blender, tutorial
Context: actual real uh mesh that we can we can actual real uh mesh that we can we can manipulate. Um obviously the downside is manipulate. Um obviously the downside is manipulate. Um obviously the downside is
Code: bpy.ops.object.select_all(action='DESELECT')
obj = bpy.data.objects.get('MESH')
if obj:
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj
    try:
        bpy.ops.object.mode_set(mode='EDIT')
        bpy.ops.mesh.select_all(action='DESELECT')
        # Select a face on the mug (top face for handle extrusion)
        bpy.ops.mesh.select_face_by_sides(number=4, extend=False)
        bpy.ops.object.mode_set(mode='OBJECT')
        bpy.ops.object.mode_set(mode='EDIT')
        #
Gotcha: 
Source: chunk 23, ~44:01

## Skill: step_24
Tags: blender, tutorial
Context: because there's something wrong with the because there's something wrong with the normals of the face that you tried to normals of the face that you tried to normals of the face that you tried to extr
Code: bpy.ops.object.select_all(action='DESELECT')
obj = bpy.data.objects.get('MESH')
if obj:
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj
    try:
        bpy.ops.object.mode_set(mode='EDIT')
        bpy.ops.mesh.select_all(action='SELECT')
        bpy.ops.mesh.normals_clear()
        bpy.ops.object.mode_set(mode='OBJECT')
        
        # Move object up
        obj.location.z += 0.5
        
        # Move object over (X axis)
        obj.location.x += 0.3
        
    
Gotcha: 
Source: chunk 24, ~45:31

## Skill: step_25
Tags: blender, tutorial
Context: Might as well just grab it and pull it Might as well just grab it and pull it over. So, um I need to position this over. So, um I need to position this over. So, um I need to position this about here,
Code: bpy.ops.object.select_all(action='DESELECT')
obj = bpy.data.objects.get('MESH')
if obj:
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj
    try:
        bpy.ops.object.mode_set(mode='EDIT')
        
        # Select a face to rotate
        bpy.ops.mesh.select_all(action='DESELECT')
        bpy.ops.mesh.select_face(face_select=True)
        
        # Rotate the face
        bpy.ops.transform.rotate(value=0.5, orient_axis='Z')
        
        # Loop cut
        bpy.ops.
Gotcha: 
Source: chunk 25, ~47:02

## Skill: step_28
Tags: blender, tutorial
Context: them by holding down uh shift like this. them by holding down uh shift like this. And then I'm just going to hit F. F for And then I'm just going to hit F. F for And then I'm just going to hit F. F fo
Code: try:
    # Select the cylinder object
    obj = bpy.data.objects.get('Cylinder')
    if obj:
        bpy.context.view_layer.objects.active = obj
        obj.select_set(True)
        
        # Enter Edit Mode
        bpy.ops.object.mode_set(mode='EDIT')
        
        # Select all and deselect
        bpy.ops.mesh.select_all(action='DESELECT')
        
        # Select the problematic inner face (this is where the narrator is pointing)
        bpy.ops.mesh.select_face(face_select=True)
       
Gotcha: 
Source: chunk 28, ~51:37

## Skill: step_29
Tags: blender, tutorial
Context: to each other, that point there, right? to each other, that point there, right? But selecting one or the other, it it But selecting one or the other, it it But selecting one or the other, it it just h
Code: try:
    obj = bpy.data.objects.get('Cylinder')
    if obj:
        bpy.context.view_layer.objects.active = obj
        obj.select_set(True)
        bpy.ops.object.shade_smooth()
except Exception as e:
    print(f"Error: {e}")
Gotcha: 
Source: chunk 29, ~53:08

## Skill: step_31
Tags: blender, tutorial
Context: loop cut. Um, but, you know, it's really loop cut. Um, but, you know, it's really up to you. You might be able to just, up to you. You might be able to just, up to you. You might be able to just, you 
Code: try:
    obj = bpy.data.objects.get('Cylinder')
    if obj:
        bpy.context.view_layer.objects.active = obj
        obj.select_set(True)
        bpy.ops.object.mode_set(mode='OBJECT')
        bpy.ops.transform.translate(value=(5, 0, 0))
except Exception as e:
    print(f"Error: {e}")
Gotcha: 
Source: chunk 31, ~56:10

## Skill: step_32
Tags: blender, tutorial
Context: part, which is going to be on uh part, which is going to be on uh materials and lighting, um you can you materials and lighting, um you can you materials and lighting, um you can you can do that. Howe
Code: try:
    obj = bpy.data.objects.get('Cylinder')
    if obj:
        bpy.context.view_layer.objects.active = obj
        obj.select_set(True)
        bpy.ops.object.duplicate()
except Exception as e:
    print(f"Error: {e}")
Gotcha: 
Source: chunk 32, ~57:41

## Skill: step_33
Tags: blender, tutorial
Context: to be making the icing. Yes, the to be making the icing. Yes, the exciting icing for our donut. Um, but exciting icing for our donut. Um, but exciting icing for our donut. Um, but first we do have qui
Code: try:
    # Rename Cylinder to mug
    obj = bpy.data.objects.get('Cylinder')
    if obj:
        obj.name = 'mug'
    
    # Rename Cylinder.001 to donut
    obj = bpy.data.objects.get('Cylinder.001')
    if obj:
        obj.name = 'donut'
    
    # Delete image object if it exists
    for obj in bpy.data.objects:
        if obj.type == 'IMAGE':
            bpy.data.objects.remove(obj)
    
    # Move mug out of the way
    obj = bpy.data.objects.get('mug')
    if obj:
        bpy.context.view_
Gotcha: 
Source: chunk 33, ~59:13

## Skill: step_34
Tags: blender, tutorial
Context: my mug out of the way. So, G and then X. my mug out of the way. So, G and then X. And I'm just going to throw it to the And I'm just going to throw it to the And I'm just going to throw it to the side
Code: try:
    # Select the duplicated donut (donut.001)
    obj = bpy.data.objects.get('donut.001')
    if obj:
        bpy.context.view_layer.objects.active = obj
        obj.select_set(True)
        
        # Enter edit mode
        bpy.ops.object.mode_set(mode='EDIT')
        
        # Select all geometry
        bpy.ops.mesh.select_all(action='SELECT')
        
        # Prepare for deletion (X key)
        bpy.ops.mesh.delete(type='VERT')
        
        # Return to object mode
        bpy.op
Gotcha: 
Source: chunk 34, ~60:44

## Skill: step_35
Tags: blender, tutorial
Context: go object and then say duplicate objects go object and then say duplicate objects there. Shift D. Um and when you do this, there. Shift D. Um and when you do this, there. Shift D. Um and when you do t
Code: try:
    # Rename donut.001 to icing
    obj = bpy.data.objects.get('donut.001')
    if obj:
        obj.name = 'icing'
    
    # Go to front view
    bpy.ops.view3d.view_axis(type='FRONT')
    
    # Select the icing object
    obj = bpy.data.objects.get('icing')
    if obj:
        bpy.context.view_layer.objects.active = obj
        obj.select_set(True)
        
        # Enter edit mode
        bpy.ops.object.mode_set(mode='EDIT')
        
        # Enable X-ray mode for selection
        bp
Gotcha: 
Source: chunk 35, ~62:15

## Skill: step_37
Tags: blender, tutorial
Context: my donut. We have to delete it. So, I'm my donut. We have to delete it. So, I'm going to hit X. When you do this, it's going to hit X. When you do this, it's going to hit X. When you do this, it's say
Code: bpy.ops.object.select_all(action='DESELECT')

obj = bpy.data.objects.get('donut')
if obj:
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)
    
    try:
        # Enter edit mode
        bpy.ops.object.mode_set(mode='EDIT')
        
        # Select all faces
        bpy.ops.mesh.select_all(action='SELECT')
        
        # Deselect all first
        bpy.ops.mesh.select_all(action='DESELECT')
        
        # Select faces (not vertices)
        bpy.ops.mesh.select_all
Gotcha: 
Source: chunk 37, ~65:20

## Skill: step_87
Tags: blender, tutorial
Context: Okay. So, we have correctly um applied Okay. So, we have correctly um applied it. You can see all the nodes are there. it. You can see all the nodes are there. it. You can see all the nodes are there.
Code: try:
    # Select the icing object
    bpy.ops.object.select_all(action='DESELECT')
    icing_obj = bpy.data.objects.get('icing')
    if icing_obj:
        bpy.context.view_layer.objects.active = icing_obj
        icing_obj.select_set(True)
        
        # Enter edit mode
        bpy.ops.object.mode_set(mode='EDIT')
        
        # Select all
        bpy.ops.mesh.select_all(action='SELECT')
        
        # Unwrap angle-based
        bpy.ops.uv.unwrap(method='ANGLE_BASED')
        
     
Gotcha: 
Source: chunk 87, ~142:52

## Skill: step_89
Tags: blender, tutorial
Context: all dimensions so that you get this like all dimensions so that you get this like really interesting like that height really interesting like that height really interesting like that height informatio
Code: try:
    # Deselect all objects
    bpy.ops.object.select_all(action='DESELECT')
    
    # Select the icing object
    icing_obj = bpy.data.objects.get('icing')
    if icing_obj:
        bpy.context.view_layer.objects.active = icing_obj
        icing_obj.select_set(True)
        
        # Enter edit mode
        bpy.ops.object.mode_set(mode='EDIT')
        
        # Select all edges
        bpy.ops.mesh.select_all(action='SELECT')
        
        # Mark all edges as seams
        bpy.ops.mes
Gotcha: 
Source: chunk 89, ~145:56

## Skill: step_90
Tags: blender, tutorial
Context: selected that, to add a cut, we're going selected that, to add a cut, we're going to hit Ctrl E, and then I'm going to to hit Ctrl E, and then I'm going to to hit Ctrl E, and then I'm going to select 
Code: try:
    # Deselect all objects
    bpy.ops.object.select_all(action='DESELECT')
    
    # Select the donut object
    donut_obj = bpy.data.objects.get('donut')
    if donut_obj:
        bpy.context.view_layer.objects.active = donut_obj
        donut_obj.select_set(True)
        
        # Enter edit mode
        bpy.ops.object.mode_set(mode='EDIT')
        
        # Select all edges
        bpy.ops.mesh.select_all(action='SELECT')
        
        # Mark all edges as seams (for the donut cut)
Gotcha: 
Source: chunk 90, ~147:26

## Skill: step_92
Tags: blender, tutorial
Context: bump. So, we can really just get by with bump. So, we can really just get by with Actually, we don't need metallic because Actually, we don't need metallic because Actually, we don't need metallic bec
Code: import bpy

# Work with icing material - disconnect subsurface amount
icing_obj = bpy.data.objects.get('icing')
if icing_obj and icing_obj.data.materials:
    mat = icing_obj.data.materials[0]
    if mat.use_nodes:
        nodes = mat.node_tree.nodes
        links = mat.node_tree.links
        
        # Find and disconnect subsurface amount
        for node in nodes:
            if node.type == 'BSDF_PRINCIPLED':
                # Disconnect subsurface amount from principled BSDF
              
Gotcha: 
Source: chunk 92, ~150:28

## Skill: step_93
Tags: blender, tutorial
Context: of map here. Now I can just apply this of map here. Now I can just apply this and it'll automatically do it. So let's and it'll automatically do it. So let's and it'll automatically do it. So let's do
Code: # Work with icing material - set up displacement/bump connection
icing_obj = bpy.data.objects.get('icing')
if icing_obj and icing_obj.data.materials:
    mat = icing_obj.data.materials[0]
    if mat.use_nodes:
        nodes = mat.node_tree.nodes
        links = mat.node_tree.links
        
        # Find displacement node and connect to displacement input
        for node in nodes:
            if node.type == 'DISPLACEMENT':
                # Change to bump type for Eevee compatibility
         
Gotcha: 
Source: chunk 93, ~152:00

## Skill: step_106
Tags: blender, tutorial
Context: tell me. But like see how it looks like tell me. But like see how it looks like it's kind of like dipped in something. I it's kind of like dipped in something. I it's kind of like dipped in something.
Code: # Select mug object
mug_obj = bpy.data.objects.get('mug')
if mug_obj:
    # Deselect all
    bpy.ops.object.select_all(action='DESELECT')
    mug_obj.select_set(True)
    bpy.context.view_layer.objects.active = mug_obj
    
    # Enter edit mode
    bpy.ops.object.mode_set(mode='EDIT')
    
    # Select all edges
    bpy.ops.mesh.select_all(action='SELECT')
    
    # Extrude edges up to add detail
    bpy.ops.mesh.extrude_region_move()
    
    # Scale edges out
    bpy.ops.transform.edge_creas
Gotcha: 
Source: chunk 106, ~171:45

## Skill: step_108
Tags: blender, tutorial
Context: all the islands have to be separated, all the islands have to be separated, but there's also like margin because but there's also like margin because but there's also like margin because like in games
Code: # Select mug object
mug_obj = bpy.data.objects.get('mug')
if mug_obj:
    mug_obj.select_set(True)
    bpy.context.view_layer.objects.active = mug_obj
    
    # Access material nodes
    if mug_obj.data.materials:
        mat = mug_obj.data.materials[0]
        if mat.use_nodes:
            nodes = mat.node_tree.nodes
            links = mat.node_tree.links
            
            # Find and disconnect roughness input
            for node in nodes:
                if node.type == 'BSDF_PRINCIP
Gotcha: 
Source: chunk 108, ~174:47

## Skill: step_109
Tags: blender, tutorial
Context: control and I want this to look shinier. control and I want this to look shinier. This is a little dull for me. So I'm This is a little dull for me. So I'm This is a little dull for me. So I'm going t
Code: _obj = bpy.data.objects.get('mug')
if _obj and _obj.data.materials:
    mat = _obj.data.materials[0]
    if mat.use_nodes:
        nodes = mat.node_tree.nodes
        links = mat.node_tree.links
        
        # Find BSDF node
        bsdf_node = None
        for node in nodes:
            if node.type == 'BSDF_PRINCIPLED':
                bsdf_node = node
                break
        
        if bsdf_node:
            # Disconnect metallic input
            for link in list(links):
         
Gotcha: 
Source: chunk 109, ~176:18

## Skill: step_114
Tags: blender, tutorial
Context: to Sorry. Yeah, right here. I'm going to to Sorry. Yeah, right here. I'm going to hit G and then Z to bring it down like hit G and then Z to bring it down like hit G and then Z to bring it down like s
Code: bpy.ops.object.select_all(action='DESELECT')
icing = bpy.data.objects.get('icing')
if icing:
    icing.select_set(True)
    bpy.context.view_layer.objects.active = icing
    
    # Translate down on Z axis
    bpy.ops.object.mode_set(mode='OBJECT')
    bpy.ops.transform.translate(value=(0, 0, -0.5), orient_type='GLOBAL')
    
    # Inset
    bpy.ops.object.mode_set(mode='EDIT')
    bpy.ops.mesh.select_all(action='SELECT')
    bpy.ops.mesh.inset()
    bpy.ops.object.mode_set(mode='OBJECT')
    
 
Gotcha: 
Source: chunk 114, ~183:52

## Skill: step_117
Tags: blender, tutorial
Context: Yeah. So, it I I thought it treated that Yeah. So, it I I thought it treated that as like alpha. We don't really need that as like alpha. We don't really need that as like alpha. We don't really need 
Code: bpy.ops.object.select_all(action='DESELECT')

# Position 3D cursor near donut
bpy.ops.object.select_all(action='DESELECT')
donut = bpy.data.objects.get('donut')
if donut:
    donut.select_set(True)
    bpy.context.view_layer.objects.active = donut
    bpy.ops.object.mode_set(mode='OBJECT')
    bpy.ops.object.origin_set(type='ORIGIN_GEOMETRY', center='MEDIAN')
    
    # Move 3D cursor to donut location
    bpy.context.scene.cursor.location = donut.location
    bpy.context.scene.cursor.location.z
Gotcha: 
Source: chunk 117, ~188:26

## Skill: step_119
Tags: blender, tutorial
Context: want to add like a really um Oh, oh, oh want to add like a really um Oh, oh, oh gosh, I hit the wrong button on my zoom gosh, I hit the wrong button on my zoom gosh, I hit the wrong button on my zoom 
Code: # Select sprinkle object
bpy.ops.object.select_all(action='DESELECT')
sprinkle = bpy.data.objects.get('sprinkle')
if sprinkle:
    sprinkle.select_set(True)
    bpy.context.view_layer.objects.active = sprinkle
    
    # Add subsurf modifier
    mod = sprinkle.modifiers.new('Subsurf', 'SUBSURF')
    mod.levels = 1
    mod.render_levels = 1
    
    # Go into edit mode
    bpy.ops.object.mode_set(mode='EDIT')
    
    # Add loop cuts for roundness
    bpy.ops.mesh.select_all(action='DESELECT')
  
Gotcha: 
Source: chunk 119, ~191:29

## Skill: step_122
Tags: blender, tutorial
Context: that enables Blender. So, if you have that enables Blender. So, if you have been enjoying this donut series and been enjoying this donut series and been enjoying this donut series and you've been enjo
Code: bpy.ops.object.select_all(action='DESELECT')

# Create new collection for sprinkles
sprinkles_collection = bpy.data.collections.new('sprinkles')
bpy.context.scene.collection.children.link(sprinkles_collection)

# Move sprinkle object to the new collection
sprinkle = bpy.data.objects.get('sprinkle')
if sprinkle:
    # Remove from current collection
    current_collection = sprinkle.users_collection[0]
    current_collection.objects.unlink(sprinkle)
    # Add to new collection
    sprinkles_collec
Gotcha: 
Source: chunk 122, ~196:04

## Skill: step_128
Tags: blender, tutorial
Context: paint, you get like, you know, different paint, you get like, you know, different amounts of buildup. But, you know, how amounts of buildup. But, you know, how amounts of buildup. But, you know, how d
Code: bpy.ops.object.select_all(action='DESELECT')

# Select the icing object for particle system setup
icing = bpy.data.objects.get('icing')
if icing:
    icing.select_set(True)
    bpy.context.view_layer.objects.active = icing
    
    # Access particle system for sprinkles
    if 'particles' in icing.particle_systems:
        ps = icing.particle_systems['particles']
        
        # Set distribution to circle packing for better sprinkle distribution
        ps.settings.distribution = 'CIRCLE_PACK
Gotcha: 
Source: chunk 128, ~205:10

## Skill: step_130
Tags: blender, tutorial
Context: find the best distribution that has the find the best distribution that has the least amount of intersections. That's least amount of intersections. That's least amount of intersections. That's probab
Code: # Adjust sprinkle particle system rotation randomization
icing = bpy.data.objects.get('icing')
if icing:
    icing.select_set(True)
    bpy.context.view_layer.objects.active = icing
    
    # Access particle system for sprinkles
    if 'particles' in icing.particle_systems:
        ps = icing.particle_systems['particles']
        
        # Increase X rotation randomization to help with intersections
        ps.settings.rotation_randomize = 0.5
        ps.settings.rotation_axis = 'X'
        
 
Gotcha: 
Source: chunk 130, ~211:13

## Skill: step_131
Tags: blender, tutorial
Context: slightly less um intersections. Um but slightly less um intersections. Um but that's that's the best we can do. The that's that's the best we can do. The that's that's the best we can do. The alternat
Code: # Access Object Info node for color control (shader setup)
icing = bpy.data.objects.get('icing')
if icing and icing.data.materials:
    mat = icing.data.materials[0]
    if not mat.use_nodes:
        mat.use_nodes = True
    
    nodes = mat.node_tree.nodes
    links = mat.node_tree.links
    
    # Find or create Object Info node
    object_info = None
    for node in nodes:
        if node.type == 'OBJECT_INFO':
            object_info = node
            break
    
    if not object_info:
    
Gotcha: 
Source: chunk 131, ~212:45

## Skill: step_138
Tags: blender, tutorial
Context: none look. Instead, you're better off none look. Instead, you're better off using uh medium high or high contrast or using uh medium high or high contrast or using uh medium high or high contrast or f
Code: # Adjust icing material to be more purple/hotter
icing = bpy.data.objects.get('icing')
if icing and icing.data.materials:
    mat = icing.data.materials[0]
    if mat.use_nodes:
        nodes = mat.node_tree.nodes
        principled = None
        for node in nodes:
            if node.type == 'BSDF_PRINCIPLED':
                principled = node
                break
        if principled:
            # Make it hotter and more purple
            principled.inputs['Base Color'].default_value = (0
Gotcha: 
Source: chunk 138, ~223:23

## Skill: step_139
Tags: blender, tutorial
Context: We've got a nice looking donut. Before We've got a nice looking donut. Before you go ahead, what I'd like you to do is you go ahead, what I'd like you to do is you go ahead, what I'd like you to do is
Code: bpy.ops.object.select_all(action='DESELECT')

# Parent mug to donut (since no table/plane object exists)
mug = bpy.data.objects.get('mug')
donut = bpy.data.objects.get('donut')

if mug and donut:
    bpy.context.view_layer.objects.active = mug
    mug.select_set(True)
    bpy.context.view_layer.objects.active = donut
    donut.select_set(True)
    bpy.ops.object.parent_set(type='OBJECT', keep_transform=True)
    print("Mug parented to donut with keep transform")

# Parent mug.001 to donut as wel
Gotcha: 
Source: chunk 139, ~224:54

## Skill: step_140
Tags: blender, tutorial
Context: piece of the puzzle. Um, which is the piece of the puzzle. Um, which is the most fun, honestly. Um, because most fun, honestly. Um, because most fun, honestly. Um, because currently it just kind of lo
Code: bpy.ops.object.select_all(action='DESELECT')

# Parent icing to donut
icing = bpy.data.objects.get('icing')
donut = bpy.data.objects.get('donut')

if icing and donut:
    bpy.context.view_layer.objects.active = icing
    icing.select_set(True)
    bpy.context.view_layer.objects.active = donut
    donut.select_set(True)
    bpy.ops.object.parent_set(type='OBJECT', keep_transform=True)
    print("Icing parented to donut with keep transform")

# Parent mug to donut (since plate doesn't exist)
mug =
Gotcha: 
Source: chunk 140, ~226:27

## Skill: step_142
Tags: blender, tutorial
Context: but we're trying. So, early morning, but we're trying. So, early morning, somebody's got their coffee in a cafe or somebody's got their coffee in a cafe or somebody's got their coffee in a cafe or som
Code: # Deselect all first
for obj in bpy.context.scene.objects:
    obj.select_set(False)

# Add first blocker plane
bpy.ops.mesh.primitive_plane_add()
blocker1 = bpy.context.active_object
blocker1.name = "WindowBlocker1"

# Rotate 90 degrees on X axis (1.5708 radians = 90 degrees)
bpy.context.view_layer.objects.active = blocker1
blocker1.select_set(True)
bpy.ops.transform.rotate(value=1.5708, orient_axis='X')

# Duplicate the blocker
bpy.ops.object.duplicate()
blocker2 = bpy.context.active_object
bl
Gotcha: 
Source: chunk 142, ~231:00

## Workflow Rule: Object Placement
- ALWAYS place new objects at origin (0,0,0) or near it — never at X=10 or arbitrary offsets
- The capture_viewport camera is positioned around origin; objects far from origin will be off-screen
- Add to system prompt: "Always place objects at or near world origin (0,0,0). Never use large offsets like location=(10,0,0)"

---
## Run 4 Post-Mortem (2026-03-01)

### What Worked
- Scene state injection (get_scene_state) — Bob knows what exists before each step
- SKIP logging — cleaner than silent pass
- 3-attempt retry with syntax validation

### What Still Broke
- Objects placed at X=10 (way off center) — Bob is creating things at wrong coordinates
- Vision always timed out — Qwen2.5-VL 7B too slow for 25s budget, skipped every check
- Geometry rough/unrecognizable — Bob builds pieces but shapes are wrong proportions
- Camera capture always black — Bob's milestone render camera not aimed at objects

### Rules for Next Run
- **Always place new objects at origin (0,0,0) first, reposition later**
- **After creating any object, print its location so we can verify**
- **Milestone render: use Track To constraint on camera targeting first MESH object**
- **Vision is currently broken — don't rely on it, focus on better code generation**
- **Research report recommendation: implement skill RAG retrieval before next run**

## Skill: step_3
Tags: blender, tutorial
Context: reorient yourself. So the zed, that's reorient yourself. So the zed, that's the top axis and then you just you're the top axis and then you just you're the top axis and then you just you're back, righ
Code: import bpy

# Delete cube if it exists
cube = bpy.data.objects.get("Cube")
if cube:
    bpy.context.view_layer.objects.active = cube
    cube.select_set(True)
    bpy.ops.object.delete()

# Add torus (donut)
bpy.ops.object.select_all(action='DESELECT')
bpy.ops.mesh.primitive_torus_add(location=(0, 0, 0))
obj = bpy.context.active_object
obj.name = "Donut"
Gotcha: 
Source: chunk 3, ~4:30

## Skill: step_6
Tags: blender, tutorial
Context: Um, I'm going to keep it at 48, but I'm Um, I'm going to keep it at 48, but I'm going to increase the other one to about going to increase the other one to about going to increase the other one to abo
Code: import bpy

# Get the Donut object
donut = bpy.data.objects.get("Donut")
if donut:
    # Select and activate the donut
    bpy.context.view_layer.objects.active = donut
    donut.select_set(True)
    
    # Apply smooth shading
    bpy.ops.object.shade_smooth()
Gotcha: 
Source: chunk 6, ~9:04

## Skill: step_9
Tags: blender, tutorial
Context: me what part do you want to delete? Um, me what part do you want to delete? Um, which might sound redundant, but there which might sound redundant, but there which might sound redundant, but there is 
Code: import bpy

# Get the Donut object
donut = bpy.data.objects.get("Donut")
if donut:
    # Select and activate the donut
    bpy.context.view_layer.objects.active = donut
    donut.select_set(True)
    
    try:
        # Add solidify modifier to give mesh thickness
        mod = donut.modifiers.new('Solidify', 'SOLIDIFY')
        mod.thickness = 0.04
        mod.offset = -1
    except Exception as e:
        print(f"Error adding solidify modifier: {e}")
Gotcha: 
Source: chunk 9, ~18:12

## Skill: step_14
Tags: blender, tutorial
Context: what I need to do is um it's called what I need to do is um it's called inset to take a single face and then inset to take a single face and then inset to take a single face and then just like add in 
Code: import bpy

# Get the Donut object
donut = bpy.data.objects.get("Donut")
if donut:
    # Select and activate the donut
    bpy.context.view_layer.objects.active = donut
    donut.select_set(True)
    
    try:
        # Enter Edit Mode
        bpy.ops.object.mode_set(mode='EDIT')
        
        # Select all faces
        bpy.ops.mesh.select_all(action='SELECT')
        
        # Inset the faces
        bpy.ops.mesh.inset()
        
        # Exit Edit Mode
        bpy.ops.object.mode_set(mode
Gotcha: 
Source: chunk 14, ~25:47

## Skill: step_19
Tags: blender, tutorial
Context: the right shape. Okay, now this bit at the right shape. Okay, now this bit at the bottom here. Okay. So, I can see the bottom here. Okay. So, I can see the bottom here. Okay. So, I can see already tha
Code: import bpy

# Get the Donut object
donut = bpy.data.objects.get("Donut")
if donut:
    # Select and activate the donut
    bpy.context.view_layer.objects.active = donut
    donut.select_set(True)
    
    try:
        # Enter Edit Mode
        bpy.ops.object.mode_set(mode='EDIT')
        
        # Select all faces first
        bpy.ops.mesh.select_all(action='DESELECT')
        
        # Select bottom face (face select mode)
        bpy.ops.mesh.select_mode(type='FACE')
        
        # Sele
Gotcha: 
Source: chunk 19, ~37:56

## Skill: step_25
Tags: blender, tutorial
Context: Might as well just grab it and pull it Might as well just grab it and pull it over. So, um I need to position this over. So, um I need to position this over. So, um I need to position this about here,
Code: import bpy

# Get the Donut object
donut = bpy.data.objects.get("Donut")
if donut:
    # Select and activate the donut
    bpy.context.view_layer.objects.active = donut
    donut.select_set(True)
    
    try:
        # Enter Edit Mode
        bpy.ops.object.mode_set(mode='EDIT')
        
        # Select all faces first
        bpy.ops.mesh.select_all(action='DESELECT')
        
        # Select all faces to work with
        bpy.ops.mesh.select_all(action='SELECT')
        
        # Rotate th
Gotcha: 
Source: chunk 25, ~47:02

## Skill: step_41
Tags: blender, tutorial
Context: that uh that's going to go down down the that uh that's going to go down down the donut. donut. donut. like so. Okay, that is pretty good. Now, like so. Okay, that is pretty good. Now, like so. Okay, 
Code: import bpy

# Get the Donut object
donut = bpy.data.objects.get("Donut")
if donut:
    # Select and activate the donut
    bpy.context.view_layer.objects.active = donut
    donut.select_set(True)
    
    try:
        # Enter Edit Mode
        bpy.ops.object.mode_set(mode='EDIT')
        
        # Select all vertices first
        bpy.ops.mesh.select_all(action='DESELECT')
        
        # Select vertices (select all for now as we can't identify specific vertices)
        bpy.ops.mesh.select_
Gotcha: 
Source: chunk 41, ~71:26

## Skill: step_50
Tags: blender, tutorial
Context: and click apply. Okay. Now in edit mode and click apply. Okay. Now in edit mode you can see we've still got those single you can see we've still got those single you can see we've still got those sing
Code: import bpy

# Get the Donut object
donut = bpy.data.objects.get("Donut")
if donut:
    # Select and activate the donut
    bpy.context.view_layer.objects.active = donut
    donut.select_set(True)
    
    try:
        # Apply solidify modifier (Ctrl+A)
        bpy.ops.object.modifier_apply(modifier='Solidify')
        
        # Apply subsurf modifier (Ctrl+A)
        bpy.ops.object.modifier_apply(modifier='Subdiv')
        
        # Enter Edit Mode
        bpy.ops.object.mode_set(mode='EDIT')

Gotcha: 
Source: chunk 50, ~85:08

## Skill: step_3
Tags: blender, tutorial
Context: reorient yourself. So the zed, that's reorient yourself. So the zed, that's the top axis and then you just you're the top axis and then you just you're the top axis and then you just you're back, righ
Code: import bpy

# Delete cube if it exists
cube = bpy.data.objects.get("Cube")
if cube:
    bpy.context.view_layer.objects.active = cube
    cube.select_set(True)
    try:
        bpy.ops.object.delete()
    except Exception as e:
        print(f"Error deleting cube: {e}")

# Add torus (donut)
bpy.ops.object.select_all(action='DESELECT')
bpy.ops.mesh.primitive_torus_add(location=(0, 0, 0))
obj = bpy.context.active_object
obj.name = "Donut"
Gotcha: 
Source: chunk 3, ~4:30

## Skill: step_6
Tags: blender, tutorial
Context: Um, I'm going to keep it at 48, but I'm Um, I'm going to keep it at 48, but I'm going to increase the other one to about going to increase the other one to about going to increase the other one to abo
Code: import bpy

# Get the Donut object
donut = bpy.data.objects.get("Donut")
if donut:
    # Select and activate the donut
    bpy.context.view_layer.objects.active = donut
    donut.select_set(True)
    
    try:
        # Apply smooth shading
        bpy.ops.object.shade_smooth()
    except Exception as e:
        print(f"Error applying smooth shading: {e}")

# Add a cube for the coffee mug
bpy.ops.object.select_all(action='DESELECT')
bpy.ops.mesh.primitive_cube_add(location=(0, 0, 0))
obj = bpy.c
Gotcha: 
Source: chunk 6, ~9:04

## Skill: step_7
Tags: blender, tutorial
Context: in a new object, which if you can in a new object, which if you can remember from before, it's the add menu remember from before, it's the add menu remember from before, it's the add menu at the top t
Code: import bpy

# Deselect all objects first
bpy.ops.object.select_all(action='DESELECT')

# Add cylinder
bpy.ops.mesh.primitive_cylinder_add(location=(0, 0, 0))
obj = bpy.context.active_object
obj.name = "Cylinder"

# Scale to adjust radius (about 0.13)
obj.scale = (0.13, 0.13, 1.0)
bpy.ops.object.transform_apply(scale=True)

# Select the cylinder for further editing
bpy.context.view_layer.objects.active = obj
obj.select_set(True)
Gotcha: 
Source: chunk 7, ~10:35

## Skill: step_21
Tags: blender, tutorial
Context: now saying where do you want to slide it now saying where do you want to slide it to? So I'm going to slide one to the to? So I'm going to slide one to the to? So I'm going to slide one to the bottom 
Code: import bpy

# Get the CoffeeMug object
mug = bpy.data.objects.get("CoffeeMug")
if mug:
    # Deselect all objects first
    bpy.ops.object.select_all(action='DESELECT')
    
    # Select and activate the mug
    bpy.context.view_layer.objects.active = mug
    mug.select_set(True)
    
    try:
        # Enter Edit Mode
        bpy.ops.object.mode_set(mode='EDIT')
        
        # Select all vertices
        bpy.ops.mesh.select_all(action='SELECT')
        
        # Add loop cut (Ctrl+R)
     
Gotcha: 
Source: chunk 21, ~40:58

## Skill: step_1
Tags: blender, tutorial
Context: So, this is Blender. It can do 3D So, this is Blender. It can do 3D So, this is Blender. It can do 3D modeling, texturing, lighting, shading, modeling, texturing, lighting, shading, modeling, texturin
Code: import bpy

# Deselect all objects first
bpy.ops.object.select_all(action='DESELECT')

# Delete default cube if it exists
cube = bpy.data.objects.get("Cube")
if cube:
    bpy.context.view_layer.objects.active = cube
    cube.select_set(True)
    try:
        bpy.ops.object.delete()
    except Exception as e:
        print(f"Error deleting cube: {e}")

# Add torus (donut) for the tutorial
bpy.ops.object.select_all(action='DESELECT')
bpy.ops.mesh.primitive_torus_add(location=(0, 0, 0))
obj = bpy.c
Gotcha: 
Source: chunk 1, ~0:00

## Skill: step_5
Tags: blender, tutorial
Context: the bottom lefthand corner additional the bottom lefthand corner additional options which you can tweak and change options which you can tweak and change options which you can tweak and change things 
Code: import bpy

# Get the Donut object
donut = bpy.data.objects.get("Donut")
if donut:
    # Select and activate the donut
    bpy.context.view_layer.objects.active = donut
    donut.select_set(True)
    
    try:
        # Scale the donut to 0.1 (10cm)
        donut.scale = (0.1, 0.1, 0.1)
        bpy.ops.object.transform_apply(scale=True)
        
        # Adjust minor radius to about 0.057
        donut.data.minor_radius = 0.057
        
        # Adjust resolution - increase major_segments to 1
Gotcha: 
Source: chunk 5, ~7:31

## Skill: step_6
Tags: blender, tutorial
Context: Um, I'm going to keep it at 48, but I'm Um, I'm going to keep it at 48, but I'm going to increase the other one to about going to increase the other one to about going to increase the other one to abo
Code: import bpy

# Get the Donut object
donut = bpy.data.objects.get("Donut")
if donut:
    # Select and activate the donut
    bpy.context.view_layer.objects.active = donut
    donut.select_set(True)
    
    try:
        # Apply smooth shading
        bpy.ops.object.shade_smooth()
    except Exception as e:
        print(f"Error applying smooth shading: {e}")
else:
    print("Donut object not found in scene")
Gotcha: 
Source: chunk 6, ~9:04

## Skill: step_13
Tags: blender, tutorial
Context: looking even worse. We got a lot to fix looking even worse. We got a lot to fix here. Um but first I need to do another here. Um but first I need to do another here. Um but first I need to do another 
Code: import bpy

# Get the Donut object
donut = bpy.data.objects.get("Donut")
if donut:
    # Select and activate the donut
    bpy.context.view_layer.objects.active = donut
    donut.select_set(True)
    
    try:
        # Apply solidify modifier (Ctrl+A)
        bpy.ops.object.modifier_apply(modifier='Solidify')
        
        # Apply subsurf modifier (Ctrl+A)
        bpy.ops.object.modifier_apply(modifier='Subdiv')
        
        # Enter Edit Mode
        bpy.ops.object.mode_set(mode='EDIT')

Gotcha: 
Source: chunk 13, ~24:16

## Skill: step_20
Tags: blender, tutorial
Context: and so that is called an extrusion. And and so that is called an extrusion. And thankfully the hotkey for extrusion is thankfully the hotkey for extrusion is thankfully the hotkey for extrusion is jus
Code: import bpy

# Delete cube if it exists
cube = bpy.data.objects.get("Cube")
if cube:
    bpy.context.view_layer.objects.active = cube
    cube.select_set(True)
    try:
        bpy.ops.object.delete()
    except Exception as e:
        print(f"Error deleting cube: {e}")

# Add torus (donut)
bpy.ops.object.select_all(action='DESELECT')
bpy.ops.mesh.primitive_torus_add(location=(0, 0, 0))
obj = bpy.context.active_object
obj.name = "Donut"
Gotcha: 
Source: chunk 20, ~39:28

## Skill: step_22
Tags: blender, tutorial
Context: extrude out. Um, now before I show you extrude out. Um, now before I show you how to uh extrude, I first of all want how to uh extrude, I first of all want how to uh extrude, I first of all want to sh
Code: import bpy

# Deselect all objects first
bpy.ops.object.select_all(action='DESELECT')

# Add cylinder
bpy.ops.mesh.primitive_cylinder_add(location=(0, 0, 0))
obj = bpy.context.active_object
obj.name = "Cylinder"

# Scale to adjust radius (about 0.13)
obj.scale = (0.13, 0.13, 1.0)
bpy.ops.object.transform_apply(scale=True)

# Select the cylinder for further editing
bpy.context.view_layer.objects.active = obj
obj.select_set(True)
Gotcha: 
Source: chunk 22, ~42:30

## Skill: step_55
Tags: blender, tutorial
Context: scale. So S to scale and then just scale. So S to scale and then just pulling my mouse out until it looks pulling my mouse out until it looks pulling my mouse out until it looks something like that. D
Code: import bpy

# Delete cube if it exists
cube = bpy.data.objects.get("Cube")
if cube:
    bpy.context.view_layer.objects.active = cube
    cube.select_set(True)
    try:
        bpy.ops.object.delete()
    except Exception as e:
        print(f"Error deleting cube: {e}")

# Add torus (donut)
bpy.ops.object.select_all(action='DESELECT')
bpy.ops.mesh.primitive_torus_add(location=(0, 0, 0))
obj = bpy.context.active_object
obj.name = "Donut"
Gotcha: 
Source: chunk 55, ~92:43

## Skill: step_58
Tags: blender, tutorial
Context: gonna do a shade smooth now because I gonna do a shade smooth now because I want to see how that looks. And that's want to see how that looks. And that's want to see how that looks. And that's pretty 
Code: import bpy
obj = bpy.context.active_object
if obj and obj.type == 'MESH':
    bpy.ops.object.shade_smooth()
Gotcha: 
Source: chunk 58, ~97:15

## Skill: step_68
Tags: blender, tutorial
Context: our icing here, if I want to make this our icing here, if I want to make this look pink and change its overall look pink and change its overall look pink and change its overall appearance, if I go dow
Code: import bpy

# Get the Donut object
donut = bpy.data.objects.get("Donut")
if donut:
    # Select and activate the donut
    bpy.context.view_layer.objects.active = donut
    donut.select_set(True)
    
    try:
        # Add solidify modifier to give mesh thickness
        mod = donut.modifiers.new('Solidify', 'SOLIDIFY')
        mod.thickness = 0.04
        mod.offset = -1
    except Exception as e:
        print(f"Error adding solidify modifier: {e}")
Gotcha: 
Source: chunk 68, ~113:54

## Skill: step_91
Tags: blender, tutorial
Context: stretching is minimal, like that is stretching is minimal, like that is pretty well good. It's laid flat. Like, pretty well good. It's laid flat. Like, pretty well good. It's laid flat. Like, it looks
Code: import bpy

# Delete cube if it exists
cube = bpy.data.objects.get("Cube")
if cube:
    bpy.context.view_layer.objects.active = cube
    cube.select_set(True)
    try:
        bpy.ops.object.delete()
    except Exception as e:
        print(f"Error deleting cube: {e}")

# Add torus (donut)
bpy.ops.object.select_all(action='DESELECT')
bpy.ops.mesh.primitive_torus_add(location=(0, 0, 0))
obj = bpy.context.active_object
obj.name = "Donut"
Gotcha: 
Source: chunk 91, ~148:56

## Skill: step_99
Tags: blender, tutorial
Context: seam. And now, look at that. This now seam. And now, look at that. This now has been pretty well UV unwrapped. Okay, has been pretty well UV unwrapped. Okay, has been pretty well UV unwrapped. Okay, t
Code: import bpy
obj = bpy.context.active_object
if obj and obj.type == 'MESH':
    bpy.ops.object.shade_smooth()
Gotcha: 
Source: chunk 99, ~161:10

## Skill: step_100
Tags: blender, tutorial
Context: which is underneath the mug, and I want which is underneath the mug, and I want to unwrap that or sorry, uh, uh, place a to unwrap that or sorry, uh, uh, place a to unwrap that or sorry, uh, uh, place
Code: import bpy

# Delete cube if it exists
cube = bpy.data.objects.get("Cube")
if cube:
    bpy.context.view_layer.objects.active = cube
    cube.select_set(True)
    try:
        bpy.ops.object.delete()
    except Exception as e:
        print(f"Error deleting cube: {e}")

# Add torus (donut)
bpy.ops.object.select_all(action='DESELECT')
bpy.ops.mesh.primitive_torus_add(location=(0, 0, 0))
obj = bpy.context.active_object
obj.name = "Donut"
Gotcha: 
Source: chunk 100, ~162:41

## Skill: step_108
Tags: blender, tutorial
Context: all the islands have to be separated, all the islands have to be separated, but there's also like margin because but there's also like margin because but there's also like margin because like in games
Code: import bpy

# Get the Donut object
donut = bpy.data.objects.get("Donut")
if donut:
    # Select and activate the donut
    bpy.context.view_layer.objects.active = donut
    donut.select_set(True)
    
    try:
        # Add solidify modifier to give mesh thickness
        mod = donut.modifiers.new('Solidify', 'SOLIDIFY')
        mod.thickness = 0.04
        mod.offset = -1
    except Exception as e:
        print(f"Error adding solidify modifier: {e}")
Gotcha: 
Source: chunk 108, ~174:47

## Skill: step_126
Tags: blender, tutorial
Context: dive into math just to scatter some dive into math just to scatter some sprinkles on a donut, which is what the sprinkles on a donut, which is what the sprinkles on a donut, which is what the last thr
Code: import bpy

# Get the Donut object
donut = bpy.data.objects.get("Donut")
if donut:
    # Select and activate the donut
    bpy.context.view_layer.objects.active = donut
    donut.select_set(True)
    
    try:
        # Enter Edit Mode
        bpy.ops.object.mode_set(mode='EDIT')
        
        # Select all faces first
        bpy.ops.mesh.select_all(action='DESELECT')
        
        # Select all faces to work with
        bpy.ops.mesh.select_all(action='SELECT')
        
        # Rotate th
Gotcha: 
Source: chunk 126, ~202:08

## Skill: step_135
Tags: blender, tutorial
Context: here. I have to enable it just so that I here. I have to enable it just so that I can click on it just so that I can tweak can click on it just so that I can tweak can click on it just so that I can t
Code: import bpy

# Get the Donut object
donut = bpy.data.objects.get("Donut")
if donut:
    # Select and activate the donut
    bpy.context.view_layer.objects.active = donut
    donut.select_set(True)
    
    try:
        # Enter Edit Mode
        bpy.ops.object.mode_set(mode='EDIT')
        
        # Select all faces first
        bpy.ops.mesh.select_all(action='DESELECT')
        
        # Select all faces to work with
        bpy.ops.mesh.select_all(action='SELECT')
        
        # Rotate th
Gotcha: 
Source: chunk 135, ~218:49

## Skill: step_1
Tags: blender, tutorial
Context: So, this is Blender. It can do 3D So, this is Blender. It can do 3D So, this is Blender. It can do 3D modeling, texturing, lighting, shading, modeling, texturing, lighting, shading, modeling, texturin
Code: import bpy

# Delete default cube
cube = bpy.data.objects.get("Cube")
if cube:
    bpy.context.view_layer.objects.active = cube
    cube.select_set(True)
    try:
        bpy.ops.object.delete()
    except Exception as e:
        print(f"Error deleting cube: {e}")

# Add torus (donut)
bpy.ops.object.select_all(action='DESELECT')
bpy.ops.mesh.primitive_torus_add(location=(0, 0, 0))
obj = bpy.context.active_object
obj.name = "Donut"
Gotcha: 
Source: chunk 1, ~0:00

## Skill: step_5
Tags: blender, tutorial
Context: the bottom lefthand corner additional the bottom lefthand corner additional options which you can tweak and change options which you can tweak and change options which you can tweak and change things 
Code: import bpy

# Get the Donut object
donut = bpy.data.objects.get("Donut")
if donut:
    # Select and activate the donut
    bpy.context.view_layer.objects.active = donut
    donut.select_set(True)
    
    try:
        # Scale the donut to 0.1 (10cm)
        donut.scale = (0.1, 0.1, 0.1)
        bpy.ops.object.transform_apply(scale=True)
        
        # Adjust minor radius to about 0.057
        donut.data.minor_radius = 0.057
        
        # Adjust resolution - increase major_segments to 1
Gotcha: 
Source: chunk 5, ~7:31

## Skill: step_6
Tags: blender, tutorial
Context: Um, I'm going to keep it at 48, but I'm Um, I'm going to keep it at 48, but I'm going to increase the other one to about going to increase the other one to about going to increase the other one to abo
Code: import bpy

# Get the Donut object
donut = bpy.data.objects.get("Donut")
if donut:
    # Select and activate the donut
    bpy.context.view_layer.objects.active = donut
    donut.select_set(True)
    
    try:
        # Apply smooth shading
        bpy.ops.object.shade_smooth()
    except Exception as e:
        print(f"Error applying smooth shading: {e}")
else:
    print("Donut object not found in scene")
Gotcha: 
Source: chunk 6, ~9:04

## Skill: step_7
Tags: blender, tutorial
Context: in a new object, which if you can in a new object, which if you can remember from before, it's the add menu remember from before, it's the add menu remember from before, it's the add menu at the top t
Code: import bpy

# Deselect all objects first
bpy.ops.object.select_all(action='DESELECT')

# Add cylinder
bpy.ops.mesh.primitive_cylinder_add(location=(0, 0, 0))
obj = bpy.context.active_object
obj.name = "Cylinder"

# Scale to adjust radius (about 0.13)
obj.scale = (0.13, 0.13, 1.0)
bpy.ops.object.transform_apply(scale=True)

# Select the cylinder for further editing
bpy.context.view_layer.objects.active = obj
obj.select_set(True)
Gotcha: 
Source: chunk 7, ~10:35

## Skill: step_8
Tags: blender, tutorial
Context: want to edit something, you have to be want to edit something, you have to be in edit mode. Um, but going to this in edit mode. Um, but going to this in edit mode. Um, but going to this dropown and do
Code: import bpy

# Get the Cylinder object (the cup)
cylinder = bpy.data.objects.get("Cylinder")
if cylinder:
    # Deselect all objects first
    bpy.ops.object.select_all(action='DESELECT')
    
    # Select and activate the cylinder
    bpy.context.view_layer.objects.active = cylinder
    cylinder.select_set(True)
    
    try:
        # Enter Edit Mode
        bpy.ops.object.mode_set(mode='EDIT')
        
        # Select all faces first
        bpy.ops.mesh.select_all(action='SELECT')
        
 
Gotcha: 
Source: chunk 8, ~16:41

## Skill: step_11
Tags: blender, tutorial
Context: viewport. So this is just increasing the viewport. So this is just increasing the number of times that it um doubles the number of times that it um doubles the number of times that it um doubles the g
Code: import bpy

# Get the Cylinder object (the mug)
mug = bpy.data.objects.get("Cylinder")
if mug:
    # Select and activate the mug
    bpy.context.view_layer.objects.active = mug
    mug.select_set(True)
    
    try:
        # Enter Edit Mode
        bpy.ops.object.mode_set(mode='EDIT')
        
        # Add a loop cut (CtrlR equivalent)
        bpy.ops.mesh.loopcut()
        
        # Deselect all to start fresh
        bpy.ops.mesh.select_all(action='DESELECT')
        
        # Select a fac
Gotcha: 
Source: chunk 11, ~21:14

## Skill: step_15
Tags: blender, tutorial
Context: have also created um, a donut. Good time have also created um, a donut. Good time to save. Good time to save. So, file, to save. Good time to save. So, file, to save. Good time to save. So, file, save
Code: import bpy

# Get the Cylinder object (the mug)
mug = bpy.data.objects.get("Cylinder")
if mug:
    # Deselect all objects first
    bpy.ops.object.select_all(action='DESELECT')
    
    # Select and activate the cylinder
    bpy.context.view_layer.objects.active = mug
    mug.select_set(True)
    
    try:
        # Enter Edit Mode
        bpy.ops.object.mode_set(mode='EDIT')
        
        # Deselect all to start fresh
        bpy.ops.mesh.select_all(action='DESELECT')
        
        # Sele
Gotcha: 
Source: chunk 15, ~27:19

## Skill: step_18
Tags: blender, tutorial
Context: smooth object and perfect for using smooth object and perfect for using subsurf modifier, which is what we've subsurf modifier, which is what we've subsurf modifier, which is what we've already got. S
Code: import bpy

# Get the Cylinder object (the mug)
cylinder = bpy.data.objects.get("Cylinder")
if cylinder:
    # Select and activate the cylinder
    bpy.context.view_layer.objects.active = cylinder
    cylinder.select_set(True)
    
    try:
        # Enter Edit Mode
        bpy.ops.object.mode_set(mode='EDIT')
        
        # Select edge mode
        bpy.ops.mesh.select_mode(type='EDGE')
        
        # Select all edges to work with
        bpy.ops.mesh.select_all(action='SELECT')
        
Gotcha: 
Source: chunk 18, ~36:25

## Skill: step_19
Tags: blender, tutorial
Context: the right shape. Okay, now this bit at the right shape. Okay, now this bit at the bottom here. Okay. So, I can see the bottom here. Okay. So, I can see the bottom here. Okay. So, I can see already tha
Code: import bpy

# Get the Cylinder object (the mug)
mug = bpy.data.objects.get("Cylinder")
if mug:
    # Select and activate the mug
    bpy.context.view_layer.objects.active = mug
    mug.select_set(True)
    
    try:
        # Enter Edit Mode
        bpy.ops.object.mode_set(mode='EDIT')
        
        # Select all to start fresh
        bpy.ops.mesh.select_all(action='DESELECT')
        
        # Select edges for loop cut manipulation
        bpy.ops.mesh.select_mode(type='EDGE')
        
    
Gotcha: 
Source: chunk 19, ~37:56

## Skill: step_24
Tags: blender, tutorial
Context: because there's something wrong with the because there's something wrong with the normals of the face that you tried to normals of the face that you tried to normals of the face that you tried to extr
Code: import bpy

# Get the Donut object
donut = bpy.data.objects.get("Donut")
if donut:
    # Select and activate the donut
    bpy.context.view_layer.objects.active = donut
    donut.select_set(True)
    
    try:
        # Enter Edit Mode
        bpy.ops.object.mode_set(mode='EDIT')
        
        # Select all faces
        bpy.ops.mesh.select_all(action='SELECT')
        
        # Clear normals (Shift+N equivalent)
        bpy.ops.mesh.normals_make_consistent(invert=False)
        
        # De
Gotcha: 
Source: chunk 24, ~45:31

## Skill: step_25
Tags: blender, tutorial
Context: Might as well just grab it and pull it Might as well just grab it and pull it over. So, um I need to position this over. So, um I need to position this over. So, um I need to position this about here,
Code: import bpy

# Get the Cylinder object (the mug)
mug = bpy.data.objects.get("Cylinder")
if mug:
    # Select and activate the mug
    bpy.context.view_layer.objects.active = mug
    mug.select_set(True)
    
    try:
        # Enter Edit Mode
        bpy.ops.object.mode_set(mode='EDIT')
        
        # Select all faces first
        bpy.ops.mesh.select_all(action='DESELECT')
        
        # Select a face for rotation (top face)
        bpy.ops.mesh.select_face_by_sides(number=4, use_extend=
Gotcha: 
Source: chunk 25, ~47:02

## Skill: step_26
Tags: blender, tutorial
Context: by the way, there is another way to by the way, there is another way to extrude, which is actually kind of extrude, which is actually kind of extrude, which is actually kind of perfect for this. Um, b
Code: import bpy

# Get the Cylinder object (the mug)
mug = bpy.data.objects.get("Cylinder")
if mug:
    # Select and activate the mug
    bpy.context.view_layer.objects.active = mug
    mug.select_set(True)
    
    try:
        # Enter Edit Mode
        bpy.ops.object.mode_set(mode='EDIT')
        
        # Select all to start fresh
        bpy.ops.mesh.select_all(action='DESELECT')
        
        # Select edges for face creation (top face edges)
        bpy.ops.mesh.select_face_by_sides(number=4
Gotcha: 
Source: chunk 26, ~48:34

## Skill: step_27
Tags: blender, tutorial
Context: line that goes around there to make this line that goes around there to make this this area here like one face to match um this area here like one face to match um this area here like one face to matc
Code: import bpy

# Get the Cylinder object (the mug)
mug = bpy.data.objects.get("Cylinder")
if mug:
    # Select and activate the mug
    bpy.context.view_layer.objects.active = mug
    mug.select_set(True)
    
    try:
        # Enter Edit Mode
        bpy.ops.object.mode_set(mode='EDIT')
        
        # Add a loop cut (CtrlR equivalent)
        bpy.ops.mesh.loopcut()
        
        # Slide the loop cut up
        bpy.ops.transform.translate(value=(0, 0, 0.05))
        
        # Select faces 
Gotcha: 
Source: chunk 27, ~50:05

## Skill: step_28
Tags: blender, tutorial
Context: them by holding down uh shift like this. them by holding down uh shift like this. And then I'm just going to hit F. F for And then I'm just going to hit F. F for And then I'm just going to hit F. F fo
Code: import bpy

# Get the Donut object
donut = bpy.data.objects.get("Donut")
if donut:
    # Select and activate the donut
    bpy.context.view_layer.objects.active = donut
    donut.select_set(True)
    
    try:
        # Enter Edit Mode
        bpy.ops.object.mode_set(mode='EDIT')
        
        # Select all faces
        bpy.ops.mesh.select_all(action='SELECT')
        
        # Deselect to start fresh
        bpy.ops.mesh.select_all(action='DESELECT')
        
        # Select the inner face
Gotcha: 
Source: chunk 28, ~51:37

## Skill: step_29
Tags: blender, tutorial
Context: to each other, that point there, right? to each other, that point there, right? But selecting one or the other, it it But selecting one or the other, it it But selecting one or the other, it it just h
Code: import bpy

# Get the Donut object
donut = bpy.data.objects.get("Donut")
if donut:
    # Select and activate the donut
    bpy.context.view_layer.objects.active = donut
    donut.select_set(True)
    
    try:
        # Enter Edit Mode
        bpy.ops.object.mode_set(mode='EDIT')
        
        # Select all faces
        bpy.ops.mesh.select_all(action='SELECT')
        
        # Recalculate normals (Shift+N equivalent)
        bpy.ops.mesh.normals_make_consistent(invert=False)
        
      
Gotcha: 
Source: chunk 29, ~53:08

## Skill: step_31
Tags: blender, tutorial
Context: loop cut. Um, but, you know, it's really loop cut. Um, but, you know, it's really up to you. You might be able to just, up to you. You might be able to just, up to you. You might be able to just, you 
Code: import bpy

# Get the mug (Cylinder) and donut objects
mug = bpy.data.objects.get("Cylinder")
donut = bpy.data.objects.get("Donut")

try:
    # Move mug out of the way
    if mug:
        bpy.context.view_layer.objects.active = mug
        mug.select_set(True)
        bpy.ops.object.mode_set(mode='OBJECT')
        bpy.ops.transform.translate(value=(2.0, 0, 0))
    
    # Select the donut to focus on it
    if donut:
        bpy.context.view_layer.objects.active = donut
        donut.select_set(T
Gotcha: 
Source: chunk 31, ~56:10

## Skill: step_32
Tags: blender, tutorial
Context: part, which is going to be on uh part, which is going to be on uh materials and lighting, um you can you materials and lighting, um you can you materials and lighting, um you can you can do that. Howe
Code: import bpy

# Get the Donut object
donut = bpy.data.objects.get("Donut")

try:
    if donut:
        # Select and activate the donut
        bpy.context.view_layer.objects.active = donut
        donut.select_set(True)
        
        # Duplicate the donut (Shift D equivalent)
        bpy.ops.object.duplicate()
        
        # The duplicate will be in the duplicated state waiting for placement
        # Get the newly created duplicate
        duplicate = bpy.context.active_object
        
   
Gotcha: 
Source: chunk 32, ~57:41

## Skill: step_33
Tags: blender, tutorial
Context: to be making the icing. Yes, the to be making the icing. Yes, the exciting icing for our donut. Um, but exciting icing for our donut. Um, but exciting icing for our donut. Um, but first we do have qui
Code: import bpy

# Rename Cylinder to mug
cylinder = bpy.data.objects.get("Cylinder")
if cylinder:
    cylinder.name = "mug"

# Rename Cylinder.001 to donut
cylinder_001 = bpy.data.objects.get("Cylinder.001")
if cylinder_001:
    cylinder_001.name = "donut"

# Delete any image objects
for obj in list(bpy.data.objects):
    if obj.type == 'IMAGE':
        bpy.data.objects.remove(obj, do_unlink=True)

# Move mug out of the way (translate along X)
mug = bpy.data.objects.get("mug")
if mug:
    mug.locati
Gotcha: 
Source: chunk 33, ~59:13

## Skill: step_34
Tags: blender, tutorial
Context: my mug out of the way. So, G and then X. my mug out of the way. So, G and then X. And I'm just going to throw it to the And I'm just going to throw it to the And I'm just going to throw it to the side
Code: import bpy

# Get the donut object that was duplicated
donut = bpy.data.objects.get("donut")
if donut:
    # Select and activate the donut
    bpy.context.view_layer.objects.active = donut
    donut.select_set(True)
    
    try:
        # Delete the donut object (X key equivalent in object mode)
        bpy.ops.object.delete()
    except Exception as e:
        print(f"Error deleting donut: {e}")
else:
    print("Donut object not found")
    
# Also delete any other duplicate donut objects that
Gotcha: 
Source: chunk 34, ~60:44

## Skill: step_35
Tags: blender, tutorial
Context: go object and then say duplicate objects go object and then say duplicate objects there. Shift D. Um and when you do this, there. Shift D. Um and when you do this, there. Shift D. Um and when you do t
Code: import bpy

# Get the Donut object
donut = bpy.data.objects.get("Donut")
if donut:
    # Deselect all objects first
    bpy.ops.object.select_all(action='DESELECT')
    
    # Select and activate the donut
    bpy.context.view_layer.objects.active = donut
    donut.select_set(True)
    
    try:
        # Duplicate the object (Shift+D)
        bpy.ops.object.duplicate()
        
        # Get the duplicated object (should be Donut.001 or similar)
        # Find the new donut object
        new_d
Gotcha: 
Source: chunk 35, ~62:15

## Skill: step_36
Tags: blender, tutorial
Context: first, then do your selection. And now first, then do your selection. And now it will actually select all the way it will actually select all the way it will actually select all the way through an obj
Code: import bpy

# Get the Donut object
donut = bpy.data.objects.get("Donut")
if donut:
    # Deselect all objects first
    bpy.ops.object.select_all(action='DESELECT')
    
    # Select and activate the donut
    bpy.context.view_layer.objects.active = donut
    donut.select_set(True)
    
    try:
        # Enter Edit Mode
        bpy.ops.object.mode_set(mode='EDIT')
        
        # Select all faces first
        bpy.ops.mesh.select_all(action='SELECT')
        
        # Deselect all to start 
Gotcha: 
Source: chunk 36, ~63:47

## Skill: step_40
Tags: blender, tutorial
Context: scrolling up um until it goes uh down to scrolling up um until it goes uh down to something that you can see basically. something that you can see basically. something that you can see basically. Anyw
Code: import bpy

# Get the Donut object
donut = bpy.data.objects.get("Donut")
if donut:
    # Select and activate the donut
    bpy.context.view_layer.objects.active = donut
    donut.select_set(True)
    
    try:
        # Enter Edit Mode
        bpy.ops.object.mode_set(mode='EDIT')
        
        # Select all faces
        bpy.ops.mesh.select_all(action='SELECT')
        
        # Move selected faces down along Z axis (G then Z)
        bpy.ops.transform.translate(value=(0, 0, -0.5))
        
 
Gotcha: 
Source: chunk 40, ~69:54

## Skill: step_41
Tags: blender, tutorial
Context: that uh that's going to go down down the that uh that's going to go down down the donut. donut. donut. like so. Okay, that is pretty good. Now, like so. Okay, that is pretty good. Now, like so. Okay, 
Code: import bpy

# Get the Donut object
donut = bpy.data.objects.get("Donut")
if donut:
    # Select and activate the donut
    bpy.context.view_layer.objects.active = donut
    donut.select_set(True)
    
    try:
        # Enter Edit Mode
        bpy.ops.object.mode_set(mode='EDIT')
        
        # Deselect all to start fresh
        bpy.ops.mesh.select_all(action='DESELECT')
        
        # Select vertex mode
        bpy.ops.mesh.select_mode(type='VERT')
        
        # Select two vertice
Gotcha: 
Source: chunk 41, ~71:26

## Skill: step_42
Tags: blender, tutorial
Context: Um, as I said, you use these all the Um, as I said, you use these all the time, use it for most objects probably time, use it for most objects probably time, use it for most objects probably have a su
Code: import bpy

# Get the Icing object (the droplet that separated)
icing = bpy.data.objects.get("Icing")
donut = bpy.data.objects.get("Donut")

if icing and donut:
    # Select and activate the icing
    bpy.context.view_layer.objects.active = icing
    icing.select_set(True)
    
    try:
        # Add Shrink Wrap modifier
        mod = icing.modifiers.new('ShrinkWrap', 'SHRINKWRAP')
        
        # Set target to Donut
        mod.target = donut
        
        # Configure shrink wrap settings
Gotcha: 
Source: chunk 42, ~72:58

## Skill: step_43
Tags: blender, tutorial
Context: will remember uh when I was talking will remember uh when I was talking about the modifier that it works top to about the modifier that it works top to about the modifier that it works top to bottom. 
Code: import bpy

# Get the Donut object
donut = bpy.data.objects.get("Donut")
if donut:
    # Select and activate the donut
    bpy.context.view_layer.objects.active = donut
    donut.select_set(True)
    
    try:
        # Reorder modifiers: Shrink Wrap first, then Solidify, then Subdivision Surface
        # Move Shrink Wrap to top (index 0)
        if len(donut.modifiers) > 0:
            # Get the ShrinkWrap modifier
            shrinkwrap_mod = None
            for mod in donut.modifiers:
     
Gotcha: 
Source: chunk 43, ~74:28

## Skill: step_47
Tags: blender, tutorial
Context: way to improve this, you'll notice that way to improve this, you'll notice that the icing is separating from it, right? the icing is separating from it, right? the icing is separating from it, right? 
Code: import bpy

# Get the Icing object
icing = bpy.data.objects.get("Icing")
if icing:
    # Select and activate the icing
    bpy.context.view_layer.objects.active = icing
    icing.select_set(True)
    
    try:
        # Enter Edit Mode
        bpy.ops.object.mode_set(mode='EDIT')
        
        # Select all edges
        bpy.ops.mesh.select_all(action='SELECT')
        
        # Deselect to start fresh
        bpy.ops.mesh.select_all(action='DESELECT')
        
        # Select edges (edge se
Gotcha: 
Source: chunk 47, ~80:33

## Skill: step_55
Tags: blender, tutorial
Context: scale. So S to scale and then just scale. So S to scale and then just pulling my mouse out until it looks pulling my mouse out until it looks pulling my mouse out until it looks something like that. D
Code: import bpy

# Get the Icing object
icing = bpy.data.objects.get("Icing")
if icing:
    # Select and activate the icing
    bpy.context.view_layer.objects.active = icing
    icing.select_set(True)
    
    try:
        # Enter Edit Mode
        bpy.ops.object.mode_set(mode='EDIT')
        
        # Select all faces
        bpy.ops.mesh.select_all(action='SELECT')
        
        # Scale outwards (S key equivalent)
        bpy.ops.transform.resize(value=(1.1, 1.1, 1.1))
        
        # Extrud
Gotcha: 
Source: chunk 55, ~92:43

## Skill: step_57
Tags: blender, tutorial
Context: there. It has to like convert all that there. It has to like convert all that into like a single point in the middle into like a single point in the middle into like a single point in the middle and i
Code: import bpy

# Get the Donut object
donut = bpy.data.objects.get("Donut")
if donut:
    # Select and activate the donut
    bpy.context.view_layer.objects.active = donut
    donut.select_set(True)
    
    try:
        # Enter Edit Mode
        bpy.ops.object.mode_set(mode='EDIT')
        
        # Select all faces first
        bpy.ops.mesh.select_all(action='SELECT')
        
        # Add loop cut (Ctrl+R equivalent)
        bpy.ops.mesh.loopcut()
        
        # Move loop cut towards edge
Gotcha: 
Source: chunk 57, ~95:43

## Skill: step_62
Tags: blender, tutorial
Context: doughut actually comes out at that doughut actually comes out at that perfectly round shape. It's usually perfectly round shape. It's usually perfectly round shape. It's usually always kind of almost 
Code: import bpy

# Get the Donut object
donut = bpy.data.objects.get("Donut")
if donut:
    # Select and activate the donut
    bpy.context.view_layer.objects.active = donut
    donut.select_set(True)
    
    try:
        # Enter Edit Mode
        bpy.ops.object.mode_set(mode='EDIT')
        
        # Turn off proportional editing
        bpy.context.scene.tool_settings.use_proportional_edit = False
        
        # Select all vertices
        bpy.ops.mesh.select_all(action='SELECT')
        
   
Gotcha: 
Source: chunk 62, ~103:17

## Skill: step_63
Tags: blender, tutorial
Context: good hotkey to remember. Um and then good hotkey to remember. Um and then here, so at the bottom here, cuz yeah, here, so at the bottom here, cuz yeah, here, so at the bottom here, cuz yeah, the same 
Code: import bpy

# Apply lattice modifier to Donut
donut = bpy.data.objects.get("Donut")
if donut:
    bpy.context.view_layer.objects.active = donut
    donut.select_set(True)
    
    try:
        # Apply any lattice modifier
        for mod in donut.modifiers:
            if mod.type == 'LATTICE':
                bpy.ops.object.modifier_apply(modifier=mod.name)
                break
        
        # Delete lattice object if it exists
        lattice = bpy.data.objects.get("Lattice")
        if la
Gotcha: 
Source: chunk 63, ~104:47

## Skill: step_68
Tags: blender, tutorial
Context: our icing here, if I want to make this our icing here, if I want to make this look pink and change its overall look pink and change its overall look pink and change its overall appearance, if I go dow
Code: import bpy

# Get the Icing object
icing = bpy.data.objects.get("Icing")
if icing:
    # Select and activate the icing
    bpy.context.view_layer.objects.active = icing
    icing.select_set(True)
    
    try:
        # Create a new material
        mat = bpy.data.materials.new(name="Icing Material")
        icing.data.materials.append(mat)
        
        # Enable nodes
        mat.use_nodes = True
        
        # Get the Principled BSDF node
        bsdf = mat.node_tree.nodes.get("Principl
Gotcha: 
Source: chunk 68, ~113:54

## Skill: step_70
Tags: blender, tutorial
Context: that um when light hits objects like that um when light hits objects like this they are mushy right they're made this they are mushy right they're made this they are mushy right they're made of like o
Code: import bpy

# Get the Icing object
icing = bpy.data.objects.get("Icing")
if icing:
    # Select and activate the icing
    bpy.context.view_layer.objects.active = icing
    icing.select_set(True)
    
    try:
        # Get or create material
        mat = icing.data.materials[0] if icing.data.materials else icing.data.materials.new(name="Icing Material")
        
        # Enable nodes
        mat.use_nodes = True
        
        # Get the Principled BSDF node
        bsdf = mat.node_tree.node
Gotcha: 
Source: chunk 70, ~116:58

## Skill: step_78
Tags: blender, tutorial
Context: right click and go uh extract all. Uh if right click and go uh extract all. Uh if you're on a Mac, you just double click you're on a Mac, you just double click you're on a Mac, you just double click i
Code: import bpy
from bpy.types import Context

# Get the mug object (or create a plane for the floor)
mug = bpy.data.objects.get("mug")
if not mug:
    # Create a plane for the floor
    bpy.ops.mesh.primitive_plane_add(size=10, location=(0, 0, 0))
    mug = bpy.context.active_object
    mug.name = "ConcreteFloor"

# Select and activate the object
bpy.context.view_layer.objects.active = mug
mug.select_set(True)

try:
    # Switch to Shading workspace
    for area in bpy.context.screen.areas:
        
Gotcha: 
Source: chunk 78, ~129:11

## Skill: step_82
Tags: blender, tutorial
Context: like faking which direction each of like faking which direction each of those pixels has. Um, but basically we those pixels has. Um, but basically we those pixels has. Um, but basically we need to add
Code: import bpy

# Get the Icing object
icing = bpy.data.objects.get("Icing")
if icing:
    # Select and activate the Icing object
    bpy.context.view_layer.objects.active = icing
    icing.select_set(True)
    
    try:
        # Get the material
        material = icing.data.materials[0] if icing.data.materials else None
        
        if material:
            # Create nodes if they don't exist
            if not material.use_nodes:
                material.use_nodes = True
            
        
Gotcha: 
Source: chunk 82, ~135:14

## Skill: step_87
Tags: blender, tutorial
Context: Okay. So, we have correctly um applied Okay. So, we have correctly um applied it. You can see all the nodes are there. it. You can see all the nodes are there. it. You can see all the nodes are there.
Code: import bpy

# Get the Icing object
icing = bpy.data.objects.get("Icing")
if icing:
    # Deselect all objects first
    bpy.ops.object.select_all(action='DESELECT')
    
    # Select and activate the Icing object
    bpy.context.view_layer.objects.active = icing
    icing.select_set(True)
    
    try:
        # Enter Edit Mode
        bpy.ops.object.mode_set(mode='EDIT')
        
        # Select all faces
        bpy.ops.mesh.select_all(action='SELECT')
        
        # Unwrap with angle-bas
Gotcha: 
Source: chunk 87, ~142:52

## Skill: step_88
Tags: blender, tutorial
Context: applied to on it. So if I select a point applied to on it. So if I select a point right here on the mesh, you can see right here on the mesh, you can see right here on the mesh, you can see which poin
Code: import bpy

# Get the Icing object
icing = bpy.data.objects.get("Icing")
if icing:
    # Select and activate the icing
    bpy.context.view_layer.objects.active = icing
    icing.select_set(True)
    
    try:
        # Enter Edit Mode
        bpy.ops.object.mode_set(mode='EDIT')
        
        # Select all faces
        bpy.ops.mesh.select_all(action='SELECT')
        
        # Mark seams (Ctrl E -> Mark Seam)
        bpy.ops.mesh.mark_seam()
        
        # Unwrap UVs
        bpy.ops.uv.
Gotcha: 
Source: chunk 88, ~144:23

## Skill: step_94
Tags: blender, tutorial
Context: right down here at the bottom where it right down here at the bottom where it says displacement it would change that says displacement it would change that says displacement it would change that to di
Code: import bpy

# Get the Icing object
icing = bpy.data.objects.get("Icing")
donut = bpy.data.objects.get("Donut")

if icing and donut:
    try:
        # Select and activate the Icing object
        bpy.context.view_layer.objects.active = icing
        icing.select_set(True)
        
        # Add Subdivision Surface modifier
        mod = icing.modifiers.new('Subdiv', 'SUBSURF')
        mod.levels = 3
        mod.render_levels = 3
        
        # Add Displacement modifier if not exists
        
Gotcha: 
Source: chunk 94, ~153:31

## Skill: step_98
Tags: blender, tutorial
Context: seam. Okay. So, now it has changed. So, seam. Okay. So, now it has changed. So, we've got the handle here. Now, if you we've got the handle here. Now, if you we've got the handle here. Now, if you wan
Code: import bpy

# Get the mug object
mug = bpy.data.objects.get("mug")
if mug:
    # Select and activate the mug
    bpy.context.view_layer.objects.active = mug
    mug.select_set(True)
    
    try:
        # Enter Edit Mode
        bpy.ops.object.mode_set(mode='EDIT')
        
        # Deselect all to start fresh
        bpy.ops.mesh.select_all(action='DESELECT')
        
        # Select edges for the handle (Alt+click equivalent - select by edge)
        # In edit mode, we need to select edges 
Gotcha: 
Source: chunk 98, ~159:36

## Skill: step_100
Tags: blender, tutorial
Context: which is underneath the mug, and I want which is underneath the mug, and I want to unwrap that or sorry, uh, uh, place a to unwrap that or sorry, uh, uh, place a to unwrap that or sorry, uh, uh, place
Code: import bpy

# Get the mug object
mug = bpy.data.objects.get("mug")
if mug:
    # Deselect all objects first
    bpy.ops.object.select_all(action='DESELECT')
    
    # Select and activate the mug
    bpy.context.view_layer.objects.active = mug
    mug.select_set(True)
    
    try:
        # Enter Edit Mode
        bpy.ops.object.mode_set(mode='EDIT')
        
        # Deselect all to start fresh
        bpy.ops.mesh.select_all(action='DESELECT')
        
        # Select edges (narrator mentio
Gotcha: 
Source: chunk 100, ~162:41

## Skill: step_101
Tags: blender, tutorial
Context: ceramic mug here, which by the way was ceramic mug here, which by the way was actually scanned from a real mug um that actually scanned from a real mug um that actually scanned from a real mug um that
Code: import bpy

# Get the mug object
mug = bpy.data.objects.get("mug")
if mug:
    # Select and activate the mug
    bpy.context.view_layer.objects.active = mug
    mug.select_set(True)
    
    try:
        # Enter Edit Mode
        bpy.ops.object.mode_set(mode='EDIT')
        
        # Deselect all first
        bpy.ops.mesh.select_all(action='DESELECT')
        
        # Select an island (equivalent to pressing 'L' in Blender)
        bpy.ops.mesh.select_linked_pick()
        
        # Exit Ed
Gotcha: 
Source: chunk 101, ~164:12

## Skill: step_1
Tags: blender, tutorial
Context: So, this is Blender. It can do 3D So, this is Blender. It can do 3D So, this is Blender. It can do 3D modeling, texturing, lighting, shading, modeling, texturing, lighting, shading, modeling, texturin
Code: import bpy

# Delete default cube if it exists
cube = bpy.data.objects.get("Cube")
if cube:
    bpy.context.view_layer.objects.active = cube
    cube.select_set(True)
    try:
        bpy.ops.object.delete()
    except Exception as e:
        print(f"Error deleting cube: {e}")

# Add torus (donut)
bpy.ops.object.select_all(action='DESELECT')
bpy.ops.mesh.primitive_torus_add(location=(0, 0, 0))
obj = bpy.context.active_object
obj.name = "Donut"
Gotcha: 
Source: chunk 1, ~0:00

## Skill: step_5
Tags: blender, tutorial
Context: the bottom lefthand corner additional the bottom lefthand corner additional options which you can tweak and change options which you can tweak and change options which you can tweak and change things 
Code: import bpy

# Get the Donut object
donut = bpy.data.objects.get("Donut")
if donut:
    # Select and activate the donut
    bpy.context.view_layer.objects.active = donut
    donut.select_set(True)
    
    try:
        # Scale the donut to 0.1 (10cm instead of 1m)
        donut.scale = (0.1, 0.1, 0.1)
        bpy.ops.object.transform_apply(scale=True)
        
        # Adjust torus properties
        # minor_radius (radius of the tube)
        donut.data.torus_data.minor_radius = 0.057
        

Gotcha: 
Source: chunk 5, ~7:31

## Skill: step_1
Tags: blender, tutorial
Context: So, this is Blender. It can do 3D So, this is Blender. It can do 3D So, this is Blender. It can do 3D modeling, texturing, lighting, shading, modeling, texturing, lighting, shading, modeling, texturin
Code: import bpy

# Deselect all objects first
bpy.ops.object.select_all(action='DESELECT')

# Delete default cube if it exists
cube = bpy.data.objects.get("Cube")
if cube:
    bpy.context.view_layer.objects.active = cube
    cube.select_set(True)
    try:
        bpy.ops.object.delete()
    except Exception as e:
        print(f"Error deleting cube: {e}")

# Add torus (donut)
bpy.ops.mesh.primitive_torus_add(location=(0, 0, 0))
obj = bpy.context.active_object
obj.name = "Donut"
Gotcha: 
Source: chunk 1, ~0:00

## Skill: step_5
Tags: blender, tutorial
Context: the bottom lefthand corner additional the bottom lefthand corner additional options which you can tweak and change options which you can tweak and change options which you can tweak and change things 
Code: import bpy

# Get the Donut object
donut = bpy.data.objects.get("Donut")
if donut:
    # Select and activate the donut
    bpy.context.view_layer.objects.active = donut
    donut.select_set(True)
    
    try:
        # Scale the donut to 0.1 (10% of original size)
        donut.scale = (0.1, 0.1, 0.1)
        bpy.ops.object.transform_apply(scale=True)
        
        # Note: Minor radius and resolution adjustments would typically be done
        # through the operator panel (F9) after adding t
Gotcha: 
Source: chunk 5, ~7:31

## Skill: step_6
Tags: blender, tutorial
Context: Um, I'm going to keep it at 48, but I'm Um, I'm going to keep it at 48, but I'm going to increase the other one to about going to increase the other one to about going to increase the other one to abo
Code: import bpy

# Get the Donut object
donut = bpy.data.objects.get("Donut")
if donut:
    # Select and activate the donut
    bpy.context.view_layer.objects.active = donut
    donut.select_set(True)
    
    try:
        # Apply smooth shading to the donut
        bpy.ops.object.shade_smooth()
        
    except Exception as e:
        print(f"Error applying smooth shading: {e}")
else:
    print("Donut object not found in scene")

# Deselect all at the end
bpy.ops.object.select_all(action='DESELEC
Gotcha: 
Source: chunk 6, ~9:04

## Skill: step_18
Tags: blender, tutorial
Context: part, which is going to be on uh part, which is going to be on uh materials and lighting, um you can you materials and lighting, um you can you materials and lighting, um you can you can do that. Howe
Code: import bpy

# Get the Donut object
donut = bpy.data.objects.get("Donut")
if donut:
    # Select and activate the donut
    bpy.context.view_layer.objects.active = donut
    donut.select_set(True)
    
    try:
        # Duplicate the donut (Shift D equivalent)
        bpy.ops.object.duplicate_move()
        
        # Get the duplicated object (it will be named Donut.001)
        icing = bpy.context.active_object
        
        # Rename to Icing
        icing.name = "Icing"
        
        # 
Gotcha: 
Source: chunk 18, ~57:41

## Skill: step_23
Tags: blender, tutorial
Context: my donut. We have to delete it. So, I'm my donut. We have to delete it. So, I'm going to hit X. When you do this, it's going to hit X. When you do this, it's going to hit X. When you do this, it's say
Code: import bpy

# Get the Icing object
icing = bpy.data.objects.get("Icing")
if icing:
    # Select and activate the icing
    bpy.context.view_layer.objects.active = icing
    icing.select_set(True)
    
    try:
        # Enter Edit Mode
        bpy.ops.object.mode_set(mode='EDIT')
        
        # Select all faces
        bpy.ops.mesh.select_all(action='SELECT')
        
        # Delete faces (X > Faces)
        bpy.ops.mesh.delete(type='FACE')
        
        # Exit Edit Mode
        bpy.ops
Gotcha: 
Source: chunk 23, ~65:20

## Skill: step_24
Tags: blender, tutorial
Context: think something's broken, it's not think something's broken, it's not working. It is working. It's just that working. It is working. It's just that working. It is working. It's just that by default th
Code: import bpy

# Get the Icing object
icing = bpy.data.objects.get("Icing")
if icing:
    # Select and activate the icing
    bpy.context.view_layer.objects.active = icing
    icing.select_set(True)
    
    try:
        # Find and configure Solidify modifier to invert thickness
        for mod in icing.modifiers:
            if mod.type == 'SOLIDIFY':
                mod.offset = 1  # Invert thickness direction
                break
        
        # Enter Edit Mode
        bpy.ops.object.mode_se
Gotcha: 
Source: chunk 24, ~66:50

## Skill: step_26
Tags: blender, tutorial
Context: scrolling up um until it goes uh down to scrolling up um until it goes uh down to something that you can see basically. something that you can see basically. something that you can see basically. Anyw
Code: import bpy

# Get the Donut object
donut = bpy.data.objects.get("Donut")
if donut:
    # Select and activate the donut
    bpy.context.view_layer.objects.active = donut
    donut.select_set(True)
    
    try:
        # Enter Edit Mode
        bpy.ops.object.mode_set(mode='EDIT')
        
        # Select all vertices
        bpy.ops.mesh.select_all(action='SELECT')
        
        # Move selected vertices down along Z axis (G then Z)
        bpy.ops.transform.translate(value=(0, 0, -0.05))
   
Gotcha: 
Source: chunk 26, ~69:54

## Skill: step_27
Tags: blender, tutorial
Context: that uh that's going to go down down the that uh that's going to go down down the donut. donut. donut. like so. Okay, that is pretty good. Now, like so. Okay, that is pretty good. Now, like so. Okay, 
Code: import bpy

# Get the Icing object
icing = bpy.data.objects.get("Icing")
if icing:
    # Deselect all objects first
    bpy.ops.object.select_all(action='DESELECT')
    
    # Select and activate the Icing object
    bpy.context.view_layer.objects.active = icing
    icing.select_set(True)
    
    try:
        # Enter Edit Mode
        bpy.ops.object.mode_set(mode='EDIT')
        
        # Select all vertices
        bpy.ops.mesh.select_all(action='SELECT')
        
        # Deselect all to st
Gotcha: 
Source: chunk 27, ~71:26

## Skill: step_28
Tags: blender, tutorial
Context: Um, as I said, you use these all the Um, as I said, you use these all the time, use it for most objects probably time, use it for most objects probably time, use it for most objects probably have a su
Code: import bpy

# Get the Icing and Donut objects
icing = bpy.data.objects.get("Icing")
donut = bpy.data.objects.get("Donut")

if icing and donut:
    # Select and activate the icing
    bpy.context.view_layer.objects.active = icing
    icing.select_set(True)
    
    try:
        # Add Shrink Wrap modifier to icing
        mod = icing.modifiers.new('ShrinkWrap', 'SHRINKWRAP')
        
        # Set the target object (donut)
        mod.target = donut
        
        # Set wrap method to nearest su
Gotcha: 
Source: chunk 28, ~72:58

## Skill: step_1
Tags: blender, tutorial
Context: So, this is Blender. It can do 3D So, this is Blender. It can do 3D So, this is Blender. It can do 3D modeling, texturing, lighting, shading, modeling, texturing, lighting, shading, modeling, texturin
Code: import bpy

# Delete default cube if it exists
cube = bpy.data.objects.get("Cube")
if cube:
    bpy.context.view_layer.objects.active = cube
    cube.select_set(True)
    try:
        bpy.ops.object.delete()
    except Exception as e:
        print(f"Error deleting cube: {e}")

# Add torus (donut)
bpy.ops.object.select_all(action='DESELECT')
bpy.ops.mesh.primitive_torus_add(location=(0, 0, 0))
obj = bpy.context.active_object
obj.name = "Donut"
Gotcha: 
Source: chunk 1, ~0:00

## Skill: step_5
Tags: blender, tutorial
Context: the bottom lefthand corner additional the bottom lefthand corner additional options which you can tweak and change options which you can tweak and change options which you can tweak and change things 
Code: import bpy

# Get the Donut object
donut = bpy.data.objects.get("Donut")
if donut:
    # Select and activate the donut
    bpy.context.view_layer.objects.active = donut
    donut.select_set(True)
    
    try:
        # Scale the donut to 0.1 (10cm instead of 1m)
        donut.scale = (0.1, 0.1, 0.1)
        
        # Apply the scale
        bpy.ops.object.transform_apply(scale=True)
        
        # Try to adjust torus properties (Blender 5.0)
        # Note: In Blender 5.0, torus properties
Gotcha: 
Source: chunk 5, ~7:31

## Skill: step_6
Tags: blender, tutorial
Context: Um, I'm going to keep it at 48, but I'm Um, I'm going to keep it at 48, but I'm going to increase the other one to about going to increase the other one to about going to increase the other one to abo
Code: import bpy

# Get the Donut object
donut = bpy.data.objects.get("Donut")
if donut:
    # Select and activate the donut
    bpy.context.view_layer.objects.active = donut
    donut.select_set(True)
    
    try:
        # Apply smooth shading to the donut
        bpy.ops.object.shade_smooth()
        
    except Exception as e:
        print(f"Error performing operations: {e}")
else:
    print("Donut object not found in scene")

# Deselect all at the end
bpy.ops.object.select_all(action='DESELECT'
Gotcha: 
Source: chunk 6, ~9:04

## Skill: step_17
Tags: blender, tutorial
Context: is correct. And just to show you quickly is correct. And just to show you quickly as well, um the way I did it just then as well, um the way I did it just then as well, um the way I did it just then w
Code: import bpy

# Deselect all objects first
bpy.ops.object.select_all(action='DESELECT')

# Get the Donut object
donut = bpy.data.objects.get("Donut")
if donut:
    try:
        # Add a torus for the icing
        bpy.ops.mesh.primitive_torus_add()
        
        # Get the newly created icing object
        icing = bpy.context.active_object
        icing.name = "Icing"
        
        # Position icing on top of donut (slightly offset Z)
        icing.location = (0, 0, 0.15)
        
        # Sc
Gotcha: 
Source: chunk 17, ~54:39

## Skill: step_18
Tags: blender, tutorial
Context: part, which is going to be on uh part, which is going to be on uh materials and lighting, um you can you materials and lighting, um you can you materials and lighting, um you can you can do that. Howe
Code: import bpy

# Get the Donut object
donut = bpy.data.objects.get("Donut")
# Get the Mug object (if it exists)
mug = bpy.data.objects.get("Mug")

try:
    # Move mug out of the way (translate along X axis)
    if mug:
        mug.location.x += 5  # Move to the side
    
    # Select and activate the donut
    bpy.context.view_layer.objects.active = donut
    donut.select_set(True)
    
    # Duplicate the donut to create icing
    bpy.ops.object.duplicate()
    
    # Get the duplicated object (it
Gotcha: 
Source: chunk 18, ~57:41

## Skill: step_19
Tags: blender, tutorial
Context: to be making the icing. Yes, the to be making the icing. Yes, the exciting icing for our donut. Um, but exciting icing for our donut. Um, but exciting icing for our donut. Um, but first we do have qui
Code: import bpy

# Deselect all objects first
bpy.ops.object.select_all(action='DESELECT')

# Get the Donut object
donut = bpy.data.objects.get("Donut")
if donut:
    try:
        # Select the donut
        bpy.context.view_layer.objects.active = donut
        donut.select_set(True)
        
        # Duplicate the donut (Shift D equivalent)
        bpy.ops.object.duplicate()
        
        # Get the newly created icing object
        icing = bpy.context.active_object
        icing.name = "Icing"
 
Gotcha: 
Source: chunk 19, ~59:13

## Skill: step_20
Tags: blender, tutorial
Context: my mug out of the way. So, G and then X. my mug out of the way. So, G and then X. And I'm just going to throw it to the And I'm just going to throw it to the And I'm just going to throw it to the side
Code: import bpy

# Deselect all objects first
bpy.ops.object.select_all(action='DESELECT')

# Get the Donut object
donut = bpy.data.objects.get("Donut")
if donut:
    try:
        # Select and activate the donut
        bpy.context.view_layer.objects.active = donut
        donut.select_set(True)
        
        # Duplicate the donut (Shift D equivalent)
        bpy.ops.object.duplicate()
        
        # Get the newly created duplicate
        icing = bpy.context.active_object
        icing.name =
Gotcha: 
Source: chunk 20, ~60:44

## Skill: step_21
Tags: blender, tutorial
Context: go object and then say duplicate objects go object and then say duplicate objects there. Shift D. Um and when you do this, there. Shift D. Um and when you do this, there. Shift D. Um and when you do t
Code: import bpy

# Deselect all objects first
bpy.ops.object.select_all(action='DESELECT')

# Get the donut object to duplicate
donut = bpy.data.objects.get("Donut")
if donut:
    try:
        # Select and activate the donut
        bpy.context.view_layer.objects.active = donut
        donut.select_set(True)
        
        # Duplicate the object (Shift D)
        bpy.ops.object.duplicate()
        
        # Hit Escape to keep in same position (already done by default)
        
        # Get the ne
Gotcha: 
Source: chunk 21, ~62:15

## Skill: step_23
Tags: blender, tutorial
Context: my donut. We have to delete it. So, I'm my donut. We have to delete it. So, I'm going to hit X. When you do this, it's going to hit X. When you do this, it's going to hit X. When you do this, it's say
Code: import bpy

# Get the Icing object
icing = bpy.data.objects.get("Icing")
if icing:
    # Select and activate the icing
    bpy.context.view_layer.objects.active = icing
    icing.select_set(True)
    
    try:
        # Enter Edit Mode
        bpy.ops.object.mode_set(mode='EDIT')
        
        # Select all faces
        bpy.ops.mesh.select_all(action='SELECT')
        
        # Delete faces (X > Faces)
        bpy.ops.mesh.delete(type='FACE')
        
        # Exit Edit Mode
        bpy.ops
Gotcha: 
Source: chunk 23, ~65:20

## Skill: step_25
Tags: blender, tutorial
Context: your proportional editing tool. What your proportional editing tool. What this does is now when I hit G, this does is now when I hit G, this does is now when I hit G, it'll move everything at once. Um
Code: import bpy

# Get the Icing object
icing = bpy.data.objects.get("Icing")
if icing:
    # Select and activate the icing
    bpy.context.view_layer.objects.active = icing
    icing.select_set(True)
    
    try:
        # Enable proportional editing
        bpy.context.scene.tool_settings.use_proportional_edit = True
        bpy.context.scene.tool_settings.proportional_edit_falloff = 'SMOOTH'
        
        # Enter Edit Mode
        bpy.ops.object.mode_set(mode='EDIT')
        
        # Select 
Gotcha: 
Source: chunk 25, ~68:22

## Skill: step_28
Tags: blender, tutorial
Context: Um, as I said, you use these all the Um, as I said, you use these all the time, use it for most objects probably time, use it for most objects probably time, use it for most objects probably have a su
Code: import bpy

# Deselect all objects first
bpy.ops.object.select_all(action='DESELECT')

# Get the Icing object (the one that needs the shrink wrap modifier)
icing = bpy.data.objects.get("Icing")
if icing:
    # Get the Donut object (target for shrink wrap)
    donut = bpy.data.objects.get("Donut")
    
    if donut:
        try:
            # Select and activate the Icing object
            bpy.context.view_layer.objects.active = icing
            icing.select_set(True)
            
            #
Gotcha: 
Source: chunk 28, ~72:58

## Skill: step_30
Tags: blender, tutorial
Context: into the mesh. It's not magic. It's not into the mesh. It's not magic. It's not going to just magically find it. So if I going to just magically find it. So if I going to just magically find it. So if
Code: import bpy

# Select the main Icing object (not the duplicates)
icing = bpy.data.objects.get("Icing")
if icing:
    try:
        # Select and activate the icing
        bpy.context.view_layer.objects.active = icing
        icing.select_set(True)
        
        # Enter Edit Mode
        bpy.ops.object.mode_set(mode='EDIT')
        
        # Select all vertices first
        bpy.ops.mesh.select_all(action='SELECT')
        
        # Deselect all to start fresh
        bpy.ops.mesh.select_all(a
Gotcha: 
Source: chunk 30, ~75:59

## Skill: step_33
Tags: blender, tutorial
Context: way to improve this, you'll notice that way to improve this, you'll notice that the icing is separating from it, right? the icing is separating from it, right? the icing is separating from it, right? 
Code: import bpy

# Get the Icing object
icing = bpy.data.objects.get("Icing")
if icing:
    # Select and activate the icing
    bpy.context.view_layer.objects.active = icing
    icing.select_set(True)
    
    try:
        # Enter Edit Mode
        bpy.ops.object.mode_set(mode='EDIT')
        
        # Select all edges
        bpy.ops.mesh.select_all(action='SELECT')
        
        # Set edge crease to tighten the shape (negative value to crease inward)
        bpy.ops.transform.edge_crease(value=
Gotcha: 
Source: chunk 33, ~80:33

## Skill: step_40
Tags: blender, tutorial
Context: scale. So S to scale and then just scale. So S to scale and then just pulling my mouse out until it looks pulling my mouse out until it looks pulling my mouse out until it looks something like that. D
Code: import bpy

# Get the Icing object
icing = bpy.data.objects.get("Icing")
if icing:
    # Select and activate the icing
    bpy.context.view_layer.objects.active = icing
    icing.select_set(True)
    
    try:
        # Enter Edit Mode
        bpy.ops.object.mode_set(mode='EDIT')
        
        # Select all vertices
        bpy.ops.mesh.select_all(action='SELECT')
        
        # Extrude to create flat area
        bpy.ops.mesh.extrude_region_move()
        
        # Clear movement (cancel
Gotcha: 
Source: chunk 40, ~92:43

## Skill: step_48
Tags: blender, tutorial
Context: good hotkey to remember. Um and then good hotkey to remember. Um and then here, so at the bottom here, cuz yeah, here, so at the bottom here, cuz yeah, here, so at the bottom here, cuz yeah, the same 
Code: import bpy

# Get the Donut object
donut = bpy.data.objects.get("Donut")
if donut:
    # Select and activate the donut
    bpy.context.view_layer.objects.active = donut
    donut.select_set(True)
    
    try:
        # Apply the lattice modifier
        if donut.modifiers:
            # Find and apply the lattice modifier
            for mod in donut.modifiers:
                if mod.type == 'LATTICE':
                    bpy.ops.object.modifier_apply(modifier=mod.name)
                    brea
Gotcha: 
Source: chunk 48, ~104:47

## Skill: step_53
Tags: blender, tutorial
Context: our icing here, if I want to make this our icing here, if I want to make this look pink and change its overall look pink and change its overall look pink and change its overall appearance, if I go dow
Code: import bpy

# Get the Icing object
icing = bpy.data.objects.get("Icing")
if icing:
    # Select and activate the icing
    bpy.context.view_layer.objects.active = icing
    icing.select_set(True)
    
    try:
        # Create a new material
        mat = bpy.data.materials.new(name="Icing Material")
        icing.data.materials.append(mat)
        
        # Enable nodes
        mat.use_nodes = True
        
        # Get the Principled BSDF node
        bsdf = mat.node_tree.nodes.get("Principl
Gotcha: 
Source: chunk 53, ~113:54

## Skill: step_55
Tags: blender, tutorial
Context: that um when light hits objects like that um when light hits objects like this they are mushy right they're made this they are mushy right they're made this they are mushy right they're made of like o
Code: import bpy

# Get the Icing object
icing = bpy.data.objects.get("Icing")
if icing:
    # Select and activate the icing
    bpy.context.view_layer.objects.active = icing
    icing.select_set(True)
    
    try:
        # Get or create material
        mat = icing.data.materials[0] if icing.data.materials else icing.data.materials.new(name="Icing Material")
        
        # Enable nodes
        mat.use_nodes = True
        
        # Get the Principled BSDF node
        bsdf = mat.node_tree.node
Gotcha: 
Source: chunk 55, ~116:58

## Skill: step_72
Tags: blender, tutorial
Context: stretching is minimal, like that is stretching is minimal, like that is pretty well good. It's laid flat. Like, pretty well good. It's laid flat. Like, pretty well good. It's laid flat. Like, it looks
Code: import bpy

# Get the Icing object
icing = bpy.data.objects.get("Icing")
if icing:
    # Deselect all objects first
    bpy.ops.object.select_all(action='DESELECT')
    
    # Select and activate the Icing object
    bpy.context.view_layer.objects.active = icing
    icing.select_set(True)
    
    try:
        # Get the material
        if icing.data.materials:
            mat = icing.data.materials[0]
            
            # Ensure nodes are enabled
            if not mat.use_nodes:
        
Gotcha: 
Source: chunk 72, ~148:56

## Skill: step_73
Tags: blender, tutorial
Context: bump. So, we can really just get by with bump. So, we can really just get by with Actually, we don't need metallic because Actually, we don't need metallic because Actually, we don't need metallic bec
Code: import bpy

# Get the Icing object
icing = bpy.data.objects.get("Icing")
if icing:
    try:
        # Get the material
        mat = icing.data.materials[0] if icing.data.materials else None
        if mat:
            # Get node tree
            nodes = mat.node_tree.nodes
            links = mat.node_tree.links
            
            # Disconnect subsurface amount (remove link from subsurface amount input)
            for link in links:
                if link.to_socket and link.to_socket.na
Gotcha: 
Source: chunk 73, ~150:28

## Skill: step_74
Tags: blender, tutorial
Context: of map here. Now I can just apply this of map here. Now I can just apply this and it'll automatically do it. So let's and it'll automatically do it. So let's and it'll automatically do it. So let's do
Code: import bpy

# Get the Icing object
icing = bpy.data.objects.get("Icing")
if icing:
    # Select and activate the icing
    bpy.context.view_layer.objects.active = icing
    icing.select_set(True)
    
    try:
        # Get the material
        mat = icing.data.materials[0] if icing.data.materials else None
        if mat:
            # Create nodes if they don't exist
            if not mat.use_nodes:
                mat.use_nodes = True
            
            nodes = mat.node_tree.nodes
    
Gotcha: 
Source: chunk 74, ~152:00

## Skill: step_75
Tags: blender, tutorial
Context: right down here at the bottom where it right down here at the bottom where it says displacement it would change that says displacement it would change that says displacement it would change that to di
Code: import bpy
from bpy.types import Material, NodeTree, Node

# Get the Icing object
icing = bpy.data.objects.get("Icing")
if icing:
    # Select and activate the Icing object
    bpy.context.view_layer.objects.active = icing
    icing.select_set(True)
    
    try:
        # Add subdivision surface modifier for more geometry
        mod = icing.modifiers.new('Subdiv', 'SUBSURF')
        mod.levels = 3
        mod.render_levels = 3
        
        # Get or create material
        mat = icing.data.
Gotcha: 
Source: chunk 75, ~153:31

## Skill: step_86
Tags: blender, tutorial
Context: look like that, right? It looks like look like that, right? It looks like dusty, like a workman floor. So, we can dusty, like a workman floor. So, we can dusty, like a workman floor. So, we can adjust
Code: import bpy

# Get the Icing object
icing = bpy.data.objects.get("Icing")
if icing:
    # Select and activate the icing
    bpy.context.view_layer.objects.active = icing
    icing.select_set(True)
    
    try:
        # Get the material
        mat = icing.data.materials[0] if icing.data.materials else None
        if mat:
            # Create nodes if they don't exist
            if not mat.use_nodes:
                mat.use_nodes = True
            
            nodes = mat.node_tree.nodes
    
Gotcha: 
Source: chunk 86, ~177:49

## Skill: step_87
Tags: blender, tutorial
Context: like this. But that's a simple thing and like this. But that's a simple thing and it's already looking good. And then I it's already looking good. And then I it's already looking good. And then I want
Code: import bpy

# Get the Icing object
icing = bpy.data.objects.get("Icing")
if icing:
    try:
        # Get or create material
        if icing.data.materials:
            mat = icing.data.materials[0]
        else:
            mat = bpy.data.materials.new(name="Icing Material")
            icing.data.materials.append(mat)
        
        # Ensure node tree exists
        if mat.use_nodes:
            nodes = mat.node_tree.nodes
            links = mat.node_tree.links
            
            # F
Gotcha: 
Source: chunk 87, ~179:20

## Skill: step_88
Tags: blender, tutorial
Context: to Sorry. Yeah, right here. I'm going to to Sorry. Yeah, right here. I'm going to hit G and then Z to bring it down like hit G and then Z to bring it down like hit G and then Z to bring it down like s
Code: import bpy

# Get the Icing object
icing = bpy.data.objects.get("Icing")
if icing:
    try:
        # Select and activate the icing
        bpy.context.view_layer.objects.active = icing
        icing.select_set(True)
        
        # Enter Edit Mode
        bpy.ops.object.mode_set(mode='EDIT')
        
        # Select all vertices
        bpy.ops.mesh.select_all(action='SELECT')
        
        # Move selected vertices down along Z axis (G then Z)
        bpy.ops.transform.translate(value=(0
Gotcha: 
Source: chunk 88, ~183:52

## Skill: step_92
Tags: blender, tutorial
Context: place it somewhere in the same motion? place it somewhere in the same motion? Um, and you can do that by moving the 3D Um, and you can do that by moving the 3D Um, and you can do that by moving the 3D
Code: import bpy

# Deselect all objects first
bpy.ops.object.select_all(action='DESELECT')

# Get the Icing object to position sprinkle above it
icing = bpy.data.objects.get("Icing")
if icing:
    try:
        # Add a cylinder for the sprinkle
        bpy.ops.mesh.primitive_cylinder_add()
        
        # Get the newly created sprinkle object
        sprinkle = bpy.context.active_object
        sprinkle.name = "Sprinkle"
        
        # Position sprinkle above the donut/icing
        sprinkle.lo
Gotcha: 
Source: chunk 92, ~189:57

## Skill: step_93
Tags: blender, tutorial
Context: want to add like a really um Oh, oh, oh want to add like a really um Oh, oh, oh gosh, I hit the wrong button on my zoom gosh, I hit the wrong button on my zoom gosh, I hit the wrong button on my zoom 
Code: import bpy

# Deselect all objects first
bpy.ops.object.select_all(action='DESELECT')

# Get the Sprinkle object
sprinkle = bpy.data.objects.get("Sprinkle")
if sprinkle:
    try:
        # Select and activate the sprinkle
        bpy.context.view_layer.objects.active = sprinkle
        sprinkle.select_set(True)
        
        # Add subdivision surface modifier
        mod = sprinkle.modifiers.new('Subsurf', 'SUBSURF')
        mod.levels = 1
        mod.render_levels = 1
        
        # Ente
Gotcha: 
Source: chunk 93, ~191:29

## Skill: step_94
Tags: blender, tutorial
Context: cut? So click there. And then just slide cut? So click there. And then just slide it up to the somewhere near the top. it up to the somewhere near the top. it up to the somewhere near the top. Like th
Code: import bpy

# Deselect all objects first
bpy.ops.object.select_all(action='DESELECT')

# Get the Sprinkle object
sprinkle = bpy.data.objects.get("Sprinkle")
if sprinkle:
    try:
        # Select and activate the sprinkle
        bpy.context.view_layer.objects.active = sprinkle
        sprinkle.select_set(True)
        
        # Enter Edit Mode
        bpy.ops.object.mode_set(mode='EDIT')
        
        # Add loop cut near top (Control-R equivalent)
        bpy.ops.mesh.loopcut()
        bpy.
Gotcha: 
Source: chunk 94, ~193:01

## Skill: step_98
Tags: blender, tutorial
Context: just getting worse. Andrew, what's going just getting worse. Andrew, what's going on? Um, so first of all, uh, underneath on? Um, so first of all, uh, underneath on? Um, so first of all, uh, underneat
Code: import bpy

# Get the Icing object to add particle system
icing = bpy.data.objects.get("Icing")
if icing:
    try:
        # Select and activate the Icing object
        bpy.context.view_layer.objects.active = icing
        icing.select_set(True)
        
        # Add particle system if it doesn't exist
        if not icing.particle_systems.get("Sprinkles"):
            particle_sys = icing.particle_systems.new(name="Sprinkles")
        else:
            particle_sys = icing.particle_systems["S
Gotcha: 
Source: chunk 98, ~199:06

## Skill: step_1
Tags: blender, tutorial
Context: So, this is Blender. It can do 3D So, this is Blender. It can do 3D So, this is Blender. It can do 3D modeling, texturing, lighting, shading, modeling, texturing, lighting, shading, modeling, texturin
Code: import bpy

# Delete default cube
cube = bpy.data.objects.get("Cube")
if cube:
    try:
        bpy.context.view_layer.objects.active = cube
        cube.select_set(True)
        bpy.ops.object.delete()
    except Exception as e:
        print(f"Error deleting cube: {e}")

# Add torus (donut)
bpy.ops.object.select_all(action='DESELECT')
bpy.ops.mesh.primitive_torus_add(location=(0, 0, 0))
obj = bpy.context.active_object
obj.name = "Donut"
print(f"Created donut object: {obj.name}")
Gotcha: 
Source: chunk 1, ~0:00

## Skill: step_5
Tags: blender, tutorial
Context: the bottom lefthand corner additional the bottom lefthand corner additional options which you can tweak and change options which you can tweak and change options which you can tweak and change things 
Code: import bpy

# Get the Donut object
donut = bpy.data.objects.get("Donut")
if donut:
    try:
        # Select and activate the donut
        bpy.context.view_layer.objects.active = donut
        donut.select_set(True)
        
        # Scale the donut to 0.1 (from 1.0) - making it 10cm instead of 1m
        donut.scale = (0.1, 0.1, 0.1)
        
        # Apply the scale
        bpy.ops.object.transform_apply(scale=True)
        
        print(f"Scaled donut to 0.1 and applied scale")
        
 
Gotcha: 
Source: chunk 5, ~7:31

## Skill: step_6
Tags: blender, tutorial
Context: Um, I'm going to keep it at 48, but I'm Um, I'm going to keep it at 48, but I'm going to increase the other one to about going to increase the other one to about going to increase the other one to abo
Code: import bpy

# Deselect all objects first
bpy.ops.object.select_all(action='DESELECT')

# Get the Donut object
donut = bpy.data.objects.get("Donut")
if donut:
    try:
        # Select and activate the donut
        bpy.context.view_layer.objects.active = donut
        donut.select_set(True)
        
        # Apply smooth shading (right-click -> Shade Smooth equivalent)
        bpy.ops.object.shade_smooth()
        
        print(f"Applied smooth shading to donut")
        
    except Exception 
Gotcha: 
Source: chunk 6, ~9:04

## Skill: step_7
Tags: blender, tutorial
Context: in a new object, which if you can in a new object, which if you can remember from before, it's the add menu remember from before, it's the add menu remember from before, it's the add menu at the top t
Code: import bpy

# Deselect all objects first
bpy.ops.object.select_all(action='DESELECT')

# Add a cylinder for the mug
bpy.ops.mesh.primitive_cylinder_add()

# Get the newly created mug object
mug = bpy.context.active_object
mug.name = "Mug"

# Position mug beside donut (not on top)
mug.location = (3, 0, 0)

# Scale to make it smaller (radius ~0.13, depth ~0.3)
mug.scale = (0.13, 0.13, 0.3)

# Apply scale
bpy.ops.object.transform_apply(scale=True)

# Select and activate the mug
bpy.context.view_lay
Gotcha: 
Source: chunk 7, ~10:35

## Skill: step_18
Tags: blender, tutorial
Context: part, which is going to be on uh part, which is going to be on uh materials and lighting, um you can you materials and lighting, um you can you materials and lighting, um you can you can do that. Howe
Code: import bpy

# Deselect all objects first
bpy.ops.object.select_all(action='DESELECT')

# Get the Donut object
donut = bpy.data.objects.get("Donut")
if donut:
    try:
        # Select and activate the donut
        bpy.context.view_layer.objects.active = donut
        donut.select_set(True)
        
        # Duplicate the donut (Shift D equivalent)
        bpy.ops.object.duplicate()
        
        # Get the newly created icing object
        icing = bpy.context.active_object
        icing.nam
Gotcha: 
Source: chunk 18, ~57:41

## Skill: step_20
Tags: blender, tutorial
Context: my mug out of the way. So, G and then X. my mug out of the way. So, G and then X. And I'm just going to throw it to the And I'm just going to throw it to the And I'm just going to throw it to the side
Code: import bpy

# Deselect all objects first
bpy.ops.object.select_all(action='DESELECT')

# Move mug out of the way (translate along X axis)
mug = bpy.data.objects.get("Mug")
if mug:
    try:
        mug.location = (3, 0, 0)
        print(f"Moved mug to {mug.location}")
    except Exception as e:
        print(f"Error moving mug: {e}")

# Get the Donut object to duplicate
donut = bpy.data.objects.get("Donut")
if donut:
    try:
        # Select the donut
        bpy.context.view_layer.objects.activ
Gotcha: 
Source: chunk 20, ~60:44

## Skill: step_21
Tags: blender, tutorial
Context: go object and then say duplicate objects go object and then say duplicate objects there. Shift D. Um and when you do this, there. Shift D. Um and when you do this, there. Shift D. Um and when you do t
Code: import bpy

# Deselect all objects first
bpy.ops.object.select_all(action='DESELECT')

# Get the Donut object
donut = bpy.data.objects.get("Donut")
if donut:
    try:
        # Select and activate the donut
        bpy.context.view_layer.objects.active = donut
        donut.select_set(True)
        
        # Duplicate the donut (Shift D)
        bpy.ops.object.duplicate()
        
        # Get the newly created duplicate
        duplicate = bpy.context.active_object
        duplicate.name = "I
Gotcha: 
Source: chunk 21, ~62:15

## Skill: step_22
Tags: blender, tutorial
Context: first, then do your selection. And now first, then do your selection. And now it will actually select all the way it will actually select all the way it will actually select all the way through an obj
Code: import bpy

# Deselect all objects first
bpy.ops.object.select_all(action='DESELECT')

# Get the Donut object
donut = bpy.data.objects.get("Donut")
if donut:
    try:
        # Select and activate the donut
        bpy.context.view_layer.objects.active = donut
        donut.select_set(True)
        
        # Enter Edit Mode
        bpy.ops.object.mode_set(mode='EDIT')
        
        # Select all vertices
        bpy.ops.mesh.select_all(action='SELECT')
        
        # Delete selected verti
Gotcha: 
Source: chunk 22, ~63:47

## Skill: step_23
Tags: blender, tutorial
Context: my donut. We have to delete it. So, I'm my donut. We have to delete it. So, I'm going to hit X. When you do this, it's going to hit X. When you do this, it's going to hit X. When you do this, it's say
Code: import bpy

# Get the Icing object
icing = bpy.data.objects.get("Icing")
if icing:
    # Select and activate the icing
    bpy.context.view_layer.objects.active = icing
    icing.select_set(True)
    
    try:
        # Enter Edit Mode
        bpy.ops.object.mode_set(mode='EDIT')
        
        # Select all faces
        bpy.ops.mesh.select_all(action='SELECT')
        
        # Delete faces (X > Faces)
        bpy.ops.mesh.delete(type='FACE')
        
        # Exit Edit Mode
        bpy.ops
Gotcha: 
Source: chunk 23, ~65:20
