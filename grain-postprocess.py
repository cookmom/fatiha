#!/usr/bin/env python3
"""Add film grain to poster PNGs."""
import sys, os, glob
import numpy as np
from PIL import Image

OUTPUT_DIR = '/home/openclaw-agent/.openclaw/workspace'
POSTERS = [
    'poster-clock-isha', 'poster-clock-maghrib', 'poster-clock-fajr',
    'poster-clock-qiyam', 'poster-compass', 'poster-title',
]

for name in POSTERS:
    src = os.path.join(OUTPUT_DIR, f'{name}.png')
    dst = os.path.join(OUTPUT_DIR, f'{name}-grain.png')
    if not os.path.exists(src):
        print(f'SKIP {name} (not found)')
        continue
    img = np.array(Image.open(src))
    noise = np.random.normal(0, 6, img.shape).astype(np.int16)
    result = np.clip(img.astype(np.int16) + noise, 0, 255).astype(np.uint8)
    Image.fromarray(result).save(dst)
    sz = os.path.getsize(dst) // 1024
    print(f'OK {name}-grain.png ({sz}KB)')

print('Done.')
