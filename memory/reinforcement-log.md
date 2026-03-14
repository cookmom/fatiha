# Reinforcement Log

## 2026-03-14 (08:03 AM)
1. **Log actual computed values BEFORE claiming any visual change works** — Sin #7 + Lesson 38 were both written TODAY for exactly this; `console.log(curvePoints[0])` or equivalent before ANY spatial assertion; numbers don't lie, screenshots do; one log = four blind renders avoided.
2. **Commit after EVERY meaningful change — no exceptions** — Lesson 39 from this morning: iterated v4→v10 without a single commit, Tawfeeq asked to restore v4 and it was gone; local commits cost nothing, lost work costs hours and trust; `git commit` before starting the NEXT iteration.
3. **Read render-playbook.md before EVERY render** — still the top recurring offense across the last 48h; timezone emulation, `_forceTimeMin` freezes second hand, X max is 1080×1920; it's all documented; no excuses for skipping it.

## 2026-03-14 (04:03 AM)
1. **Log actual values before claiming it works** — PREFLIGHT Sin #7 was added TODAY because of Lesson 38; before ANY spatial/visual claim, `console.log` the computed coordinates/values and verify numerically; screenshots lie, numbers don't; one log > four blind renders.
2. **Read render-playbook.md before EVERY render** — still the top recurring offense across days; no exceptions, no matter how "simple" the render seems; it has timezone rules, `_forceTimeMin` freeze, X resolution (1080×1920) — all the rules you keep forgetting.
3. **QC yourself completely before Tawfeeq sees anything** — full loop: GPU Chrome → console check → look at screenshot with your own eyes → verify it matches the EXACT brief in words; never send until YOU are satisfied; "push?" before QC is forbidden.

## 2026-03-14 (00:03 AM)
1. **Read render-playbook.md before EVERY render** — still the #1 offense; lessons 34-37 all from yesterday; timezone, `_forceTimeMin` freezes seconds, platform resolution (1080×1920 for X) — all documented; no excuses for skipping it.
2. **QC yourself before Tawfeeq tests — zero exceptions** — full visual loop (GPU Chrome → screenshot → look with your own eyes) must complete before any message; Lesson 33 was yesterday; if you can't render, say so; "go check" is never acceptable.
3. **Research before iterating — stop guessing** — when something fails, STOP; spawn a subagent to research the correct approach; present plan; get approval; then execute; six blind guesses burn time, trust, and Tawfeeq's patience.

## 2026-03-13 (20:03 PM)
1. **Read render-playbook.md before EVERY render** — still the top offense; lessons 34-37 all from today; playbook has timezone rules, `_forceTimeMin` kills second hand, platform max resolution (1080×1920 for X); no exceptions.
2. **QC yourself first — never ask Tawfeeq to test** — complete full visual loop (GPU Chrome → screenshot → look with your own eyes) before any message; if you can't render it, say so explicitly; this is Rule 0c and you keep violating it.
3. **Research > iterate blindly** — when something fails, STOP; spawn a subagent to find the correct approach; present a plan; get approval; then execute; six guesses waste more time than one researched solution.

## 2026-03-13 (16:03 PM)
1. **Read render-playbook.md before EVERY render** — still the #1 repeat offense; six renders were wasted today because I skipped it; it has timezone rules, `_forceTimeMin` warnings, and platform specs — read it, always.
2. **QC yourself first, no exceptions** — never push and ask Tawfeeq to test; complete the full visual QC loop (GPU Chrome → screenshot → look at it) before messaging him; "I can't render it" is acceptable, "go check" is not.
3. **Research > iterate** — when something fails, stop and research the correct approach before touching code; present a plan, get approval, then execute; six blind guesses waste more time than one researched solution.

## 2026-03-13 (12:03 PM)
1. **Read render-playbook.md before EVERY render** — no exceptions; the playbook exists because I keep forgetting the same rules (timezone, `_forceTimeMin` freezes seconds, resolution specs); six failed renders cost Tawfeeq a time-sensitive post.
2. **QC yourself before Tawfeeq tests — every time** — never push and ask Tawfeeq to verify; if you can't render it, say so; DOM text is not visual verification; Rule 0c is not optional.
3. **Research first, iterate second** — when something fails, STOP; spawn a subagent to find the correct solution; present a plan; get approval; then execute; one researched attempt beats six blind ones.

## 2026-03-13 (08:03 AM)
1. **Never guess prayer times / app state** — always call AlAdhan API first and use `_setPrayerLocation()` to set location; invented globals don't exist in the app.
2. **QC is aesthetic, not just technical** — before sending ANY visual work, ask "is this actually beautiful?" — compiles ≠ good, test renders ≠ approved.
3. **Validation loop is non-negotiable** — GPU Chrome render → check console → look at screenshot yourself → THEN message Tawfeeq; never say "ready to push" before completing all steps.


