---
name: context-optimization
description: Optimize token usage and reduce credit burn across sessions and sub-agents. Use when: planning a multi-step coding task, noticing sessions are getting expensive, structuring sub-agent work, or building long-running iterative workflows. NOT for: simple single-turn tasks.
---

# Context Optimization

## Security Boundaries (Non-Negotiable)
Before applying any optimization:

- **Sub-agents are untrusted contexts** — never pass MEMORY.md, USER.md, personal data, or credentials into sub-agent tasks
- **KV-cache persists on provider infrastructure** — do not put sensitive data (keys, tokens, PII) in the stable prefix; cache the structure, not the secrets
- **Observation masking ≠ security** — masking removes content from context, but it was already sent to the provider. For actual secrets: don't read them into context at all if avoidable
- **Compacted summaries can outlive their scope** — review summaries before forwarding; strip anything personal or credential-adjacent

## Four Levers (in order of impact)

### 1. Sub-Agent Partitioning (biggest win)
Isolate work in sub-agents with minimal context. Each agent gets only what it needs — technical task brief only, no personal context.

**Pattern:**
```text
task = "Goal. Constraints. Write result to /path/output.md."
sessions_spawn(task=task, mode="run")
```

### 2. Compaction (second lever)
Summarize context at logical boundaries — end of a feature, after a debug cycle, before switching tasks. Don't wait for auto-compaction to kick in. See context-compression skill for the structured summary format.

Review summaries for personal data before they persist as session history.

### 3. Observation Masking (tool output hygiene)
Large file reads, exec logs, web fetches — extract the signal, drop the noise. After reading a 500-line file, what stays in context is: "file X does Y, key function is Z."

**Never mask:** the most recent tool output, anything still actively needed for current reasoning.

**Security note:** masking doesn't erase — it only removes from active context window. Don't rely on masking to protect secrets already sent.

### 4. KV-Cache Stability
Keep structurally stable content (system prompt, SOUL.md) consistent across sessions. Dynamic content goes last. Consistent structure = cache hits = lower cost per session.

**What NOT to put in the stable cacheable prefix:** MEMORY.md (personal), credentials, anything that shouldn't persist at the provider level longer than necessary.

**Rule:** Don't restructure startup files without a real reason.

## Budget Awareness
| Component | Typical Size | Strategy |
|-----------|-------------|----------|
| Sub-agent brief | Target <500 tokens | Trim aggressively, no personal context |
| File reads | 5k–50k tokens | Read → extract key points → drop raw |
| Exec output | 1k–10k tokens | Key result only |
| Session history | Grows unbounded | Compress at task boundaries |

## Biggest Credit Burn Sources (Ranked)
1. **Coding loops in main session** → fix: sub-agents for all iterative work
2. **Large file contents held in context** → fix: read → summarize → drop
3. **Repeated lookdev/screenshot iterations without compaction** → fix: compress after each pass
4. **Sub-agent briefs with full session history** → fix: lean briefs, goal + constraints only

## Quick Reference
- **Before sub-agent:** goal + constraints + file paths only — no personal data
- **After coding loop:** write structured summary before continuing
- **After large read:** keep only the key finding
- **Every ~50 messages on complex task:** consider triggering compaction
- **Stable prefix:** structure only, never secrets or personal context
