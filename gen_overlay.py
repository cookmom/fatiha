#!/usr/bin/env python3
"""Generate golden ratio overlay (white lines on transparent) matching the reference."""
from PIL import Image, ImageDraw
import math

# Canvas size — match existing overlay.png
WD, HD = 860, 1864
PHI = 1.618033988749

img = Image.new('RGBA', (WD, HD), (0, 0, 0, 0))
draw = ImageDraw.Draw(img)

LINE_W = 2
COLOR = (255, 255, 255, 77)

# Margins
M = 24
gw = WD - M * 2
gh = gw * PHI
if gh > HD - M * 2:
    gh = HD - M * 2
    gw = gh / PHI
gx = (WD - gw) / 2
gy = (HD - gh) / 2

# Outer border
draw.rectangle([gx, gy, gx + gw, gy + gh], outline=COLOR, width=LINE_W)

# Recursive golden subdivision matching the reference:
# Direction cycle: 0=bottom, 1=left, 2=top, 3=right
# "bottom" means the square is at the visual bottom of the rect, etc.
LEVELS = 9
rx, ry, rw, rh = gx, gy, gw, gh

squares = []  # (sx, sy, sw, sh)

for i in range(LEVELS):
    sq = min(rw, rh)
    d = i % 4

    if d == 0:  # cut square from BOTTOM
        sx, sy = rx, ry + rh - sq
        # remainder on top
        rh -= sq
    elif d == 1:  # cut square from LEFT
        sx, sy = rx, ry
        rx += sq
        rw -= sq
    elif d == 2:  # cut square from TOP
        sx, sy = rx, ry
        ry += sq
        rh -= sq
    else:  # d == 3, cut square from RIGHT
        sx, sy = rx + rw - sq, ry
        rw -= sq

    squares.append((sx, sy, sq))

    # Draw the square border (subdivision line)
    draw.rectangle([sx, sy, sx + sq, sy + sq], outline=COLOR, width=LINE_W)

img.save('/home/openclaw-agent/.openclaw/workspace/fatiha-proto/overlay.png')
print('Saved overlay.png')
