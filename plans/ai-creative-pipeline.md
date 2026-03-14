# AI Creative Pipeline — Workflow Notes

## Pipeline Overview
**Nano Banana 2** (reference gen) → **Blender MCP** (3D modeling) → **Export GLB** → **Three.js** (interactive web) → **Figma MCP** (UI design) → **Deploy**

## Setup

### Gemini API (Nano Banana 2 Image Gen)
- **Working key**: stored in `~/.openclaw/workspace/.env.gemini` (chmod 600)
- **Model**: `gemini-3.1-flash-image-preview` = Nano Banana 2
- **Also available**: `nano-banana-pro-preview` (Nano Banana Pro), `imagen-4.0-generate-001` (Imagen 4)
- **API**: `POST https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={KEY}`
- **Request format**:
  ```json
  {
    "contents": [{"parts": [{"text": "Generate an image: {prompt}"}]}],
    "generationConfig": {"responseModalities": ["TEXT", "IMAGE"]}
  }
  ```
- **Response**: `candidates[].content.parts[].inlineData.data` (base64 PNG)
- **Key gotcha**: Free tier has quota=0 for image gen. Must enable billing on Google Cloud project AND create key in a billing-enabled project. AI Studio free tier key ≠ paid key.
- **Cost**: ~$0.02-0.04 per image

### Blender MCP
- **Port**: 9877 (Windows-side, visible to WSL2 via mirrored networking)
- **Protocol**: Raw TCP socket, JSON messages
- **Command format**: `{"type": "command_name", "params": {"key": "value"}}`
- **Key commands discovered**:
  - `get_scene_info` — returns all objects, locations, types
  - `execute_code` — runs arbitrary bpy Python: `{"type": "execute_code", "params": {"code": "..."}}`
- **NOT**: `{"type": "...", "code": "..."}` — params wrapper is required
- **Connection**: `socket.connect(('127.0.0.1', 9877))`, timeout 10-15s for complex operations

### Spline MCP — ABANDONED
- `aydinfer/spline-mcp-server` is built against `api.spline.design` which is NOT a public API
- No way to get a Spline API key — it doesn't exist for external developers
- **Decision**: Skip Spline entirely, go direct to Three.js (we're better at it anyway)
- Repo cloned at `/var/lib/cookmom-workspace/spline-mcp-server/` — can delete

### Figma MCP
- Remote MCP + Desktop at `localhost:3845`
- Not yet tested in this pipeline

## Test Case: AGOT v2 Clone
- Use AGOT (agiftoftime.app) as benchmark — rebuild with AI pipeline
- Compare speed and quality vs hand-built original
- **Environment**: Clinical white gallery, not dark (opposite of AGOT's dark theme)
- **Scene**: Glass cube on white plinth, two walls meeting at corner for depth, all same flat matte white material, lighting defines all separation

## Prompt Engineering Notes (Nano Banana 2)
- Describe physical objects clearly — "tall rectangular white column pedestal" > "square tube platform"
- Reference known aesthetics — "Apple product photography", "museum art plinth"
- Lighting descriptions matter — "soft even lighting, subtle glass reflections"
- For white-on-white: emphasize "lighting is the only thing that defines shapes and separates them"
- "Seamless cyclorama" understood correctly

## Blender Scene Build Notes
- Clear scene: `select_all` + `delete`, then purge materials and meshes
- White matte: Roughness=1.0, Specular=0.0, Base Color=(0.95, 0.95, 0.95)
- Glass: Transmission Weight=1.0, Roughness=0.0, IOR=1.45
- Walls as rotated planes (size=20)
- Camera: `TRACK_TO` constraint targeting hero object
- Lighting: 3-point (key 200W/size 4, fill 80W/size 6, rim 40W/size 3)
- Cycles GPU, 128 samples for preview, bump for final
- World background: light gray (0.95) at strength 0.3

## Date
Started: March 3, 2026
