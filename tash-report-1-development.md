# REPORT 1: TASH's Development Practices & Workflow

## Who Is Tash
Real name **Lex**, ~32 years old, living in Costa Rica. Former touring organic house music producer (71M+ streams) turned AI-first builder. Runs **sequins.music** — a software company selling VST plugins (Anima, Angels, Words) and browser-based MIDI tools, built entirely without writing code.

---

## How He Uses Claude Code

### Philosophy: "Stop Telling Claude Code What To Do"
Tash's core insight is that vibe coding failures are **your fault, not the AI's**:

> "If I can't do something with AI, that is a reflection of my ability to manage and to guide the AI, far more so than it is a reflection of the AI's capability to do so."

> "You need to learn far more... you don't need to learn how to write the code, but you need to learn how to direct the AI to learn how to write the code."

He treats the AI like a good employee with a good boss — not barking orders, but providing clear context and blaming himself when things fail:

> "How did I fail the model? How could I have given better instructions? How could I have better researched the tasks that I was asking it to implement?"

### Prompting Strategy
- **Always uses `--dangerously-skip-permissions`** to let Claude work uninterrupted
- **XML formatting over Markdown** for all instructions, skills, slash commands, and sub-agents. He explicitly states: "Ask Claude yourself what would be better for you to follow complex instructions. Claude will always say XML because it gives clear boundaries."
- **Dictation-first workflow** — uses Mac Whisper to dictate prompts rather than typing
- **Never assumes enough context** — always gives the option "ask me more questions" in interactive flows
- **Multiple-choice ask-user patterns** — all his systems present numbered options with a "type something" escape hatch
- **Screenshot annotation** — uses ScreenBrush to annotate screenshots with arrows and notes, then pastes into Claude

### Slash Commands
He wraps skills in thin slash command wrappers to guarantee 100% invocation:

```
/create-agent-skill → invokes the create-agent-skills skill
/dream → ideation workflow for new plugins
/implement → kicks off build workflow  
/improve → improvement/bugfix workflow
/continue [plugin-name] → resumes from handoff file
/research → deep investigation of problems
/doc-fix → documents a solved problem
/add-critical-pattern → promotes a fix to always-read context
/install-plugin → build & install script
/check-todos → reviews per-directory todo list
/add-to-todos → captures ideas mid-flow
/heal-skill → analyzes conversation for skill failures and rewrites the skill
```

### Skills System
- Skills live in `~/.claude/skills/` as folders with `skill.md` files
- Front matter (name + description) is ~50-100 tokens, loaded at session start
- Full skill body + reference files only loaded on invocation
- Reference files for deep domain knowledge (API security, common patterns, etc.)
- Naming convention: **verb-noun-skill** (e.g., `create-agent-skill`, `generate-natal-chart`)

**The Meta-Skill**: His `create-agent-skills` skill creates other skills. It:
1. Asks clarifying questions (never assumes)
2. Optionally researches APIs/libraries via web search and Context7
3. Generates the skill in pure XML
4. Creates a corresponding slash command wrapper

**The Heal Skill**: Analyzes conversation context to find where a skill gave wrong instructions, compares with what actually worked, and rewrites the skill. This creates a self-improving loop.

### Context Management
- **Always clears context between stages** — never pollutes chat with stale info
- **Continue-here files** — every stage creates a handoff document with: last update time, current stage, what's completed, next steps
- **Sub-agents for heavy tasks** — DSP implementation, GUI building, foundation setup each run in their own context window via sub-agents
- **Per-directory todo system** — `add-to-todos` captures ideas mid-flow with full context; `check-todos` presents them with numbered selection later

> "Don't try and do it right now. Add it to your to-dos, you know? Particularly if it's late at night... just go to bed."

---

## The GSD Framework (Get Shit Done)

Open-sourced Claude Code framework that hit **6,000 GitHub stars** and **28,000 downloads** in a month. It's "the exact system that I use to build all three of the plugins." The virality was organic — AI influencers picked it up, leading to the memecoin situation ($70K in 5 days from trading fees via bags.fm).

---

## The Plugin Freedom System (Evolved Workflow)

This is the mature, multi-stage system for building VST plugins. It represents "hundreds, maybe even bordering on a thousand hours" of refinement.

### Stage 0: Dream (Ideation)
- Interactive Q&A to define the plugin concept
- Creates a **creative brief** with vision, parameters, ranges, UI concept
- Multiple rounds of questions (3 rounds before nudging to continue)
- Inspired by the BMAD workflow

### Stage 1: UI Mockup (HTML-first)
- Creates mockups as **standalone HTML/CSS files** (not JUCE look-and-feel)
- Uses JUCE's WebView API to render HTML UIs in the actual plugin
- Iterative refinement with screenshots and annotations (typically 3-5 iterations)
- Generates a **YAML spec** alongside HTML for later consumption
- Can save aesthetic templates for reuse across plugins

### Design Sync Validation
- Compares creative brief against mockup
- Updates creative brief to match reality
- Creates **parameter spec** — an immutable contract consumed by all later stages
- Uses Sequential Thinking MCP server for structured comparison

### Stage 2: Research
- Web searches for DSP algorithms, JUCE APIs, implementations
- Uses **Context7 MCP server** for JUCE documentation
- References existing plugins for proven implementations
- Creates an **architecture file** with: core components, JUCE classes, processing chain, parameter mapping, algorithm details, special considerations
- 12-15 step sequential thinking process

### Stage 3: Planning  
- Reads architecture file
- Calculates complexity
- Breaks into phases (e.g., reverb → modulation → saturation/filter → routing)
- Creates **implementation plan** with phases

### Stage 4: Implementation (Sub-agents)
- **Foundation Agent**: Creates JUCE project structure, CMake, parameter bindings
- **Shell Agent**: Sets up APVTS classes needed for DSP
- **DSP Agent**: Implements signal processing in phases (4.1, 4.2, 4.3, 4.4)
- Each agent has its own spec file with step-by-step instructions and "never do" rules
- Build verification after each phase via `build-and-install.sh`

### Stage 5: GUI Implementation (Sub-agent)
- Takes the HTML mockup and implements it in JUCE
- Three sub-stages
- Opens standalone plugin for visual verification

### Stage 6: Validation
- Creates presets
- Runs PluginVal testing
- Installs in DAW
- Final build in release mode

### Improvement Workflow
- Creates backup before changes
- Version bumping (semantic versioning)
- **Deep Research skill** with graduated levels:
  - Level 0: Can I just fix this?
  - Level 1: Check troubleshooting docs + Context7 lookup
  - Level 2: JUCE forum search, GitHub issues, Context7 deep dive
  - Level 3: Uses Opus model for deep investigation
- **Parallel research agents** for multiple issues simultaneously
- **Doc-fix** after solving: creates YAML-formatted troubleshooting document
- **Add-critical-pattern** promotes fixes to always-read context

### Key Technical Details
- **Build-and-install script**: Clears Ableton's plugin database and Logic's cache, ensures fresh install every time. "Sometimes you make changes and Ableton still opens the old one."
- **JUCE 8 Critical Patterns file**: Read at the start of every coding task. Prevents deprecated API usage, wrong header files. Gets appended to as new issues are discovered.
- **Contracts**: Immutable parameter specs that prevent drift during implementation
- **Continuous validation**: Smoke tests, audio tests (sine wave/noise through plugin), CPU benchmarks, UI screenshot verification
- **TDD approach**: Write failing test → minimal code to pass → refactor
- **Commit at every stage** for rollback capability

---

## The Earlier (V1) Plugin Workflow

From the "Vibe Coding VST Plugins" video — simpler 4-prompt system:

1. **`/1-juice-research`**: Classifies plugin (standard/advanced/novel), web searches, creates research/ folder with open-source.md, tutorials.md, papers.md, summary.md
2. **`/2-juice-specification`**: Ultra-think through research, creates spec.md (~700 words, no code)
3. **`/3-juice-checklist`**: Phase-based build checklist with atomic subtasks (<20 lines each), TDD
4. **`/4-juice-build`**: Execute the checklist

Key additions in parent `claude.md`:
- "Before writing/editing code, you must query the Context7 MCP server"
- "Never assume you know how to implement without first researching"
- Continuous validation standard (smoke test, audio test, CPU benchmark, screenshot)
- GUI design rules (overlap detection, resize testing, look-and-feel subclass)

---

## Licensing & Business

### Licensing System
- Built entirely with Claude Code with zero prior knowledge
- Backend server validates license keys
- Proper activation/deactivation flow
- Automatic updates (Sparkle framework for Mac)

### Self-Serve Refund System
> "I've never seen a business do this... you go to sequins.music/refund, put in your email and license key, click request refund, it instantly revokes your license and triggers a refund."

### Revenue
- ~$35K revenue in first 30 days
- 200+ buyers of Angels alone
- 30% launch discount codes (first 100 customers)
- 30-day free trial on all products

### Business Infrastructure (all built with Claude Code)
- Stripe checkout integration
- GitHub and Discord OAuth for user accounts
- Meta advertising pixel tracking
- Sentry error logging
- BunnyCDN for distribution
- Automatic update delivery
- Email automation
- Can run entire business from terminal: check emails, gift licenses, check error logs, ship updates

### The Memecoin Windfall
Someone created a Solana memecoin called GSD pegged to his GitHub account via bags.fm. 1% of all trading fees auto-sent to him. Result: **$70K in 5 days**, paid off all credit card debt. Token hit $8M market cap. He reinvested $11K which grew to $140K.

### Community
- Launched a Circle community at $47/month
- Weekly Q&A calls for plugin development support
- Live streams of building (1,700 concurrent viewers at peak)

---

## Lessons Learned & Mistakes

### What Worked
- **XML over Markdown** for all AI instructions
- **Slash command wrappers** around skills for 100% invocation rate
- **Continue-here files** for context handoff between sessions
- **Sub-agents** for heavy implementation tasks (saves main context)
- **Immutable contracts** (parameter specs) to prevent drift
- **Troubleshooting docs** with YAML front matter for pattern matching
- **Build-and-install script** that clears DAW caches
- **HTML mockups before implementation** — "doing this now saves you so much time"
- **Open-sourcing GSD** — "giving away something for free has been the most profitable project"

### What Didn't Work
- Previous system: UIs sucked, no consistency, too much deviation
- Trying to fix UI after building the plugin (wrong order)
- Letting Claude code directly without sub-agents (context pollution)
- Not documenting solved problems (same bugs recurring)
- Not clearing DAW plugin caches (testing stale versions)
- Using JUCE's default look-and-feel (ugly, hard to customize)
- Not verifying files actually exist before continuing
- Global controls: "Sometimes Claude confidently declares 'Cool, I've made these changes' and nothing changed"
- Making multiple fixes at once — "probably better to do them one by one"

### Key Principles
1. **Blame yourself, not the AI** when things fail
2. **Document everything** — especially what didn't work
3. **Research before implementing** — don't let Claude hallucinate
4. **Verify at every stage** — build tests, existence checks, contract validation
5. **Clear context frequently** — stale context causes drift
6. **Create systems, not one-off prompts** — repeatability is everything
7. **Dream bigger** — "it's your responsibility to assume that everything is possible"
