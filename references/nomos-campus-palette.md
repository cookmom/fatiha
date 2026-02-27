# NOMOS Club Campus — Dial Color Palette

Extracted from official product photography at nomos-glashuette.com (Feb 2026).
Reference model: Club Campus (36mm, manual wind, Alpha caliber).

## Common Design Language
- **Hands**: rhodium-plated steel, warm white (~#e8e4dc)
- **Lume**: white Superluminova (warm white ~#e9e6e1, blue luminescence)
- **Seconds hand**: neon orange (#f56623) — the signature Campus accent
- **Minute numerals**: white (outer ring, small)
- **Hour markers**: mix of Arabic (12, 10, 2) and Roman (VIII, IV) numerals
- **Case**: polished stainless steel
- **Strap**: gray velour (default)

## Dial Colors

| Name | Hex | RGB | Description |
|------|-----|-----|-------------|
| Deep Pink | `#bc4b79` | 188, 75, 121 | Bold magenta-pink. HSL 336° 46% 52% |
| Nonstop Red | `#df473a` | 223, 71, 58 | Vivid coral-red. Energetic, warm |
| Cream Coral | `#e8967a` | 232, 150, 122 | Warm peach-salmon. Soft, inviting |
| Starlight | `#e9e872` | 233, 232, 114 | Bright lemon yellow. Playful, sunny |
| Electric Green | `#3ba785` | 59, 167, 133 | Vivid mint/emerald. Fresh, modern |
| Endless Blue | `#63afb9` | 99, 175, 185 | Turquoise/teal. Calm, oceanic |
| Blue Purple | `#5d6278` | 93, 98, 120 | Muted slate-blue. Sophisticated, subtle |
| Night Sky | `#132653` | 19, 38, 83 | Deep navy blue. Dark, dramatic |
| White | `#e0e0e0` | 224, 224, 224 | Silver-white. Neutral, clean |

## For clock.js (Three.js hex format)

```javascript
// NOMOS Club Campus dial colors — extracted from product photography
deep_pink:      {bg:0xbc4b79, lume:0xe9e6e1, hand:0xe9e6e1, sec:0xf56623, text:'#e9e6e1'},
nonstop_red:    {bg:0xdf473a, lume:0xe9e6e1, hand:0xe9e6e1, sec:0xf56623, text:'#e9e6e1'},
cream_coral:    {bg:0xe8967a, lume:0xe9e6e1, hand:0xe9e6e1, sec:0xf56623, text:'#e9e6e1'},
starlight:      {bg:0xddd84c, lume:0xe9e6e1, hand:0xe9e6e1, sec:0xf54020, text:'#e9e6e1'},
electric_green: {bg:0x30b080, lume:0xe9e6e1, hand:0xe9e6e1, sec:0xf5a020, text:'#e9e6e1'},
endless_blue:   {bg:0x3ca8a8, lume:0xe9e6e1, hand:0xe9e6e1, sec:0xf56623, text:'#e9e6e1'},
blue_purple:    {bg:0x5d6278, lume:0xe9e6e1, hand:0xe9e6e1, sec:0xf56623, text:'#e9e6e1'},
night_sky:      {bg:0x132653, lume:0xf0ecf0, hand:0xf0ecf0, sec:0xf56623, text:'#f0ecf0'},
white:          {bg:0xf0ece4, lume:0x2a2a30, hand:0x888890, sec:0xf56623, text:'#2a2a30'},
```

## Notes
- Starlight has a red (not orange) seconds hand — slightly different accent
- Electric Green has a yellow-orange seconds hand
- Night Sky needs brighter elements (high contrast white on dark navy)
- White/cream needs dark elements (dark on light)
- Blue Purple is the closest to our existing `slate` dial
- All colors pair with the gray velour strap — neutral base

## Source Images
- `references/nomos-campus-pink-closeup-hires.jpg` (1280×854) — Deep Pink detail
- `references/nomos-campus-teal-closeup.jpg` (1280×854) — Endless Blue detail
- `/tmp/nomos-nonstop-red.jpg` — Nonstop Red product shot
- `/tmp/nomos-38-night-sky.jpg` — Night Sky product shot
- `/tmp/nomos-blue-purple.jpg` — Blue Purple detail shot
- `/tmp/nomos-cream-coral.jpg` — Cream Coral wrist shot
- `/tmp/nomos-electric-green.jpg` — Electric Green wrist shot
- `/tmp/nomos-starlight.jpg` — Starlight wrist shot
- `/tmp/nomos-endless-blue.jpg` — Endless Blue wrist shot
