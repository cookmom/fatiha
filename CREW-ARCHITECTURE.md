# CREW ARCHITECTURE — Seven Heavens Studio

_Inspired by the YOLO build/verify/review cycle. Adapted for our team._

## Roles

### 🍳 Chef (Orchestrator) — Main Session
- Writes feature specs (BRIEF.md)
- Dispatches to builder + reviewer in parallel
- QCs every render against spec before showing Tawfeeq
- Never does specialist work inline (no shader code, no pipeline scripts)
- Manages outer cycles (findings → next brief)

### 🎨 Chris (Lookdev/Builder)
- Domain: Shaders, materials, lighting, visual composition
- Reads spec, writes code, commits to working branch
- Writes FINDINGS.md after each cycle (what worked, what didn't, next steps)
- Spawned via `claude --print --dangerously-skip-permissions --tools "Edit,Bash"`

### ⚙️ Brett (Pipeline/Reviewer)
- Domain: Git, deploys, validation, code review, QA
- Runs PARALLEL to Chris — learns codebase while Chris builds
- Reviews Chris's diff against spec after each cycle
- Runs automated validation: render, console check, cache bust, perf
- Writes REVIEW.md with pass/fail + findings
- Catches: stale versions, geometry edge bugs, DPR issues, broken imports
- Spawned via `claude --print --dangerously-skip-permissions --tools "Read,Edit,Bash"`

### 🔨 Bob (Builder — Geometry)
- Domain: 3D modeling, mesh optimization, BufferGeometry
- Used when task is geometry-focused (not lighting)
- Same cycle as Chris

## The Cycle

```
┌─────────────────────────────────────────────────────┐
│                    SETUP                             │
│                                                      │
│  chef writes BRIEF.md ──→ git branch (feature/xxx)  │
│                           │                          │
│              ┌────────────┴────────────┐             │
│              ▼                         ▼             │
│         Chris (build)           Brett (review)       │
│         learns codebase         learns codebase      │
│              │                         │             │
│              └────────────┬────────────┘             │
│                           ▼                          │
│                    INNER LOOP                        │
│         (up to 3 retries per cycle)                  │
│                                                      │
│  1. BUILD    Chris writes code + commits             │
│      │                                               │
│  2. VERIFY   Brett runs render + console + checks    │
│      │                                               │
│      ├─ fail → 2b. FIX  Brett writes FINDINGS.md    │
│      │         Chris reads findings, fixes, go to 1  │
│      │                                               │
│      └─ pass →                                       │
│  3. PUBLISH  Commit to feature branch                │
│      │                                               │
│  4. QC GATE  Chef reviews render against spec        │
│      │                                               │
│      ├─ fail → Findings fed back as next cycle input │
│      │                                               │
│      └─ pass →                                       │
│  5. PRESENT  Chef sends render to Tawfeeq            │
│      │                                               │
│      ├─ fail → Tawfeeq notes → next BRIEF.md        │
│      │                                               │
│      └─ pass →                                       │
│  6. SHIP     ship.sh (auto cache bust + push main)   │
│                                                      │
└─────────────────────────────────────────────────────┘
```

## Outer Cycles (up to 5)
Each outer cycle = one BRIEF.md → one complete inner loop.
Findings from review/QC/Tawfeeq feed into next cycle's brief.
After 5 cycles without pass, STOP and escalate to Tawfeeq.

## File Convention
```
/home/tawfeeq/ramadan-clock-site/
  .crew/
    BRIEF.md          ← Current task spec (chef writes)
    FINDINGS.md       ← Builder's notes after each cycle
    REVIEW.md         ← Reviewer's pass/fail + notes
    cycle-log.md      ← Append-only log of all cycles
```

## Spawn Commands

### Chris (Builder)
```bash
claude --print --dangerously-skip-permissions \
  --tools "Edit,Bash" --model opus \
  "$(cat .crew/BRIEF.md)"
```

### Brett (Reviewer) — runs PARALLEL
```bash
claude --print --dangerously-skip-permissions \
  --tools "Read,Edit,Bash" --model sonnet \
  "You are Brett, pipeline reviewer for agiftoftime.app.
   Repo: /home/tawfeeq/ramadan-clock-site
   Your job:
   1. Read .crew/BRIEF.md (the spec)
   2. Wait for Chris's commit (poll git log every 30s, max 5 min)
   3. Review the diff against the spec
   4. Run: bash ship.sh 'review' auto (render + console check)
   5. Check render at references/ship-*.png — describe what you see
   6. Write .crew/REVIEW.md: PASS or FAIL + specific findings
   Be harsh. Check geometry edges, cache bust, console errors, DPR implications."
```

## Rules
1. **Never push from builder/reviewer sessions** — only chef pushes via ship.sh
2. **Brett runs parallel** — he starts learning the codebase while Chris builds
3. **Findings are structured** — not prose, but actionable items with file:line references
4. **Max 3 inner retries** — if builder can't fix in 3, escalate
5. **Max 5 outer cycles** — if spec can't be met in 5, stop and talk to Tawfeeq
6. **Chef QCs every render** — no rubber-stamping, check against BRIEF.md point by point
7. **All work on feature branch** — main only touched by ship.sh after human approval
