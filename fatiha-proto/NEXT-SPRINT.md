# Next Sprint — Gallery + Studio Merge

## Features Requested

### 1. Procreate Tools in Lightbox
- Port ALL drawing tools from studio.html into the gallery lightbox edit mode
- All p5.brush brushes (2H, HB, 2B, pen, marker, charcoal, crayon, spray, watercolor)
- Size slider, opacity slider
- Color picker with Islamic palette
- Layers panel
- Undo/redo
- When user taps an image in the gallery → opens in full drawing mode, not just annotation

### 2. Easy Exit from Lightbox on Phone
- Large visible X button (current one too small)
- Swipe down to dismiss
- Back button/gesture support

### 3. Image Import as Layers
- Import any image (photo, reference, previous render) as a new layer
- Scale + transform the imported image (pinch to zoom, drag to position)
- Set opacity on the imported layer
- Draw/trace on a layer OVER the imported image
- Use case: import a reference flower photo, trace over it with p5.brush

### 4. Auto-sync Renders
- Devon drops renders to fatiha-proto/renders/ with proper naming
- Background watcher syncs to gallery every 60s
- Zero token cost for uploads
- Currently running as background bash process

## Priority Order
1. Image import + layers (enables tracing workflow)
2. Procreate tools in lightbox (enables full editing)
3. Easy exit (UX fix)
4. Auto-sync (already running)
