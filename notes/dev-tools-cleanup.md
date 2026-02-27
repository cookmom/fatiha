# Dev Tools Cleanup Checklist — Ramadan Clock

Remove all of these before production/Ramadan release.

## Adhan Debug System (index.html)
- [ ] `_ADHAN_VER` constant (~line 1424) — remove entirely
- [ ] `_adhanLog` array + `adhanDbg()` function (~line 1425-1436) — remove
- [ ] `requestAnimationFrame(()=>{adhanDbg('ready');});` — auto-show on load (~line 1427)
- [ ] `#adhan-dbg` pre element (auto-created by adhanDbg) — removed when function goes
- [ ] All `adhanDbg(...)` calls throughout adhan code (~30+ instances)
- [ ] `HIDE-pre:` diagnostic logging in visibilitychange handler
- [ ] `VIS: skip swap` diagnostic logging

## Dev Mode (index.html)
- [ ] `devMode`, `devTimeMin`, `devRamadan`, `devLocation` variables (~line 444)
- [ ] Dev mode panel (double-tap to open)
- [ ] Dev trigger for adhan (+30s scheduled test)
- [ ] Long-press for tawaf trigger
- [ ] Day simulator / time slider
- [ ] Location presets

## Notes
- Dev mode is useful for ongoing development — consider keeping behind a harder toggle (URL param?) rather than removing entirely
- Debug panel is strictly for this HRTF debugging sprint — remove completely
- Keep the `adhanPosition()` wall-clock logic, just remove the logging
