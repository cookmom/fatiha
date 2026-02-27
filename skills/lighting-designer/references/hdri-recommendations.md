# HDRI Recommendations by Scene Type

All HDRIs available from [Poly Haven](https://polyhaven.com/hdris) (CC0, free).

## Product Photography

### Watches & Jewelry (Reflective)
Best: Studio HDRIs with distinct bright panels and dark gaps.
- **studio_small_09** — Clean panels, dark bg, sharp reflections
- **photo_studio_loft_hall** — Large soft panels, professional
- **studio_small_08** — High contrast, good for showing metal form
- **christmas_photo_studio** — Soft, warm toned panels

### General Products
- **photo_studio_01** — Balanced, neutral, versatile
- **studio_small_03** — Even soft lighting
- **indoor_workshop** — Lifestyle context with good lighting

## Architectural Visualization

### Interior
- **modern_buildings_2** — Clean daylight through windows
- **old_hall** — Dramatic interior, warm tones
- **hotel_room** — Residential warm feel

### Exterior
- **kloppenheim_06** — Clean blue sky, good sun
- **industrial_sunset_02** — Dramatic sky, golden
- **parking_lot** — Neutral outdoor, automotive favorite

## Cinematic / Dramatic

- **sunset_fairway** — Golden hour, cinematic warmth
- **evening_road_01** — Moody, low sun
- **moonless_golf** — Night sky, very dark, dramatic
- **the_sky_is_on_fire** — Intense sunset, maximum drama

## Nature / Outdoor

- **meadow_at_night** — Starry, cool ambience
- **rural_asphalt_road** — Daytime neutral
- **cape_hill** — Coastal, overcast, soft

## Tips

1. **Resolution**: Download 1K for reflection-only, 2K if visible as background, 4K for hero backgrounds
2. **Format**: Use `.hdr` (RGBE) with `RGBELoader`. EXR also works with `EXRLoader` but larger files.
3. **For watches**: Pick HDRIs where you can see distinct rectangular bright areas — these become the clean reflections that define the watch form
4. **Rotation**: Always try rotating the environment (`scene.environmentRotation.y`) to find the best reflection angle for your camera position
5. **Custom**: For ultimate control, build a virtual light tent with RectAreaLights instead of relying on HDRI
