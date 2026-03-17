# Passive Income Research: AI + Dual RTX A6000 GPUs

**Date:** 2026-03-16
**Hardware:** 2× RTX A6000 (96GB VRAM total), running 24/7
**Constraint:** All strategies must be halal (no riba, no maysir, no haram industries)

---

## Executive Summary

After researching MiroFish swarm intelligence, prediction market bots, GPU monetization platforms, and halal compliance frameworks, the honest picture is:

- **MiroFish / swarm trading is overhyped** — the viral claims (67% win rate, Sharpe 8+) are fabricated
- **Prediction markets are haram** — strong scholarly consensus classifies them as maysir (gambling)
- **GPU compute rental is the most reliable passive income** — $150–600/month with minimal effort
- **Islamic generative art is the highest-ceiling opportunity** — leverages existing skills, underserved niche
- **Combined realistic expectation: $300–800/month** after electricity, with 1–2 hrs/week maintenance

---

## Part 1: MiroFish Swarm Intelligence — Debunked

### What MiroFish Actually Is
MiroFish (GitHub: `666ghj/MiroFish`, ~30K stars) is a multi-agent social simulation engine by Guo Hangjiang, a Chinese undergraduate. Received ~$4M from Shanda Group. It simulates agents interacting on a fake social platform to observe emergent opinion patterns.

### Architecture (5-stage pipeline)
1. Knowledge graph construction via GraphRAG
2. Agent persona generation (configurable count, not fixed at 168)
3. Parallel simulation on CAMEL-AI's OASIS framework (23 social actions)
4. Report generation by a specialized ReportAgent
5. Interactive query interface

### What's Real vs. Fabricated

| Claim | Verdict |
|---|---|
| "168-agent swarm" | Agent count is configurable. 168 is not a magic number |
| "Belief propagation, Monte Carlo" | **Not implemented.** A GitHub issue (#185) proposed this theoretically; it's not in the code |
| "67% win rate" | **Fabricated.** Zero evidence anywhere — MiroFish has published no prediction benchmarks |
| "Sharpe 8+" | **Fabricated.** Renaissance Technologies' Medallion Fund achieves ~Sharpe 2–3. Sharpe 8 would be unprecedented |
| "$1.49M Polymarket profits" | One unverifiable Twitter thread from an engagement-farming account. No wallet addresses, no trade logs |
| "Adapted for prediction markets" | MiroFish creator explicitly warns against short-term price prediction use |

### Can It Run on Our Hardware?
Technically yes at small scale (20–50 agents pointing at local Ollama). But each simulation round requires thousands of LLM calls. At ~2–5 sec/call locally, a 100-agent × 40-round simulation = 2–6 hours. The "700,000 agent" marketing is cloud-API dependent and impossible locally.

**Verdict: Interesting research project. Not a money-making tool. The trading hype is fabricated.**

---

## Part 2: Halal Compliance Assessment

### Summary Table

| Strategy | Ruling | Confidence |
|---|---|---|
| **Prediction markets** (Polymarket, Kalshi) | **HARAM** — maysir (gambling) | Strong consensus |
| **Algo trading** (halal-screened stocks) | **HALAL with conditions** | Strong consensus |
| **Crypto spot trading** (BTC, halal tokens) | **Conditionally halal** | Moderate consensus |
| **DeFi lending / yield farming** | **HARAM** — riba (interest) | Strong consensus |
| **DeFi liquidity providing** | **Debated, potentially halal** | Weak consensus |
| **Crypto staking** | **Debated** | No consensus |
| **AI content generation services** | **HALAL** | Strong consensus |
| **NFTs / digital art sales** | **HALAL with conditions** | Moderate consensus |
| **AI/ML services & fine-tuning** | **HALAL** | Strong consensus |
| **GPU compute rental** | **HALAL** | No concerns |

### Key Halal Conditions for Trading
- **AAOIFI Standard No. 21:** Debt < 30% market cap, interest income < 5%, no haram sector revenue
- **No short selling** (selling what you don't own)
- **No margin/leverage** (interest-based financing)
- **No derivatives** (futures, options — gharar)
- **Screening tools:** Zoya, Musaffa, Islamicly, Muslim Xchange

### Why Prediction Markets Are Haram
Money staked on uncertain outcomes where the loser pays the winner with no real counter-value = textbook maysir. Scholarly advice: if you believe an outcome will happen, invest in its real-world consequences instead of betting on it.

---

## Part 3: Strategies Ranked by Feasibility

### Tier 1: Do This First (Low effort, genuinely passive)

#### 1. GPU Compute Rental — Vast.ai / RunPod
- **Monthly income:** $150–600 (after electricity)
- **Electricity cost:** ~$80–120/month (480W combined, 24/7, $0.12/kWh)
- **Setup:** 1–3 days (Linux, Docker, register, get verified)
- **Maintenance:** ~1 hr/week (uptime monitoring, driver updates)
- **Passivity:** 8/10
- **Halal status:** ✅ No concerns
- **How it works:** List GPUs on marketplace → renters pay $0.33–0.56/hr per A6000 → you receive 70–85% after platform fees
- **Key advantage:** 48GB VRAM per card handles large model workloads that consumer GPUs cannot
- **Risk:** Low. Utilization varies 30–70%. Verified hosts get more jobs

#### 2. LLM Inference Provider — ShareAI Network
- **Monthly income:** $100–500
- **Setup:** 1–2 weeks (vLLM setup, join provider network)
- **Maintenance:** 2–4 hrs/week
- **Passivity:** 6/10
- **Halal status:** ✅ No concerns
- **How it works:** Run open-source models (Llama 3, DeepSeek, Qwen) → sell API access via ShareAI (70% revenue share) or OpenRouter
- **Key advantage:** 96GB VRAM can run 70B parameter models that most providers can't
- **Risk:** Low-medium. Demand growing but pricing pressure from cloud providers

### Tier 2: Build Over Time (Medium effort, semi-passive)

#### 3. Islamic Generative Art — Etsy + Print-on-Demand
- **Monthly income:** $50–1,000 (scales with catalog size)
- **Setup:** 2–4 weeks for initial catalog of 50+ listings
- **Maintenance:** 5–10 hrs/week (new designs, trend monitoring)
- **Passivity:** 4/10 initially → 6/10 once catalog is established
- **Halal status:** ✅ Halal (avoid animate being depictions if following stricter scholarly opinion)
- **How it works:** Generate Islamic geometric patterns, Ottoman designs, calligraphy art → sell as digital downloads (Etsy), prints (Redbubble, Society6), or custom commissions
- **Key advantage:** Existing p5.brush Ottoman garden work provides genuine differentiation from generic AI art. Human-modified generative art has stronger copyright claims
- **Risk:** Medium. Market saturation in generic AI art, but Islamic niche is underserved
- **Platforms:** Etsy (digital downloads), Redbubble/Society6 (print-on-demand), Creative Market (design assets)

#### 4. Halal Algorithmic Trading (Stocks)
- **Monthly income:** Highly variable. Could be negative. Realistic: $0–500/month on small capital
- **Setup:** 1–3 months (screening integration, strategy development, backtesting)
- **Maintenance:** 5–10 hrs/week (monitoring, rebalancing)
- **Passivity:** 3/10
- **Halal status:** ✅ Halal IF following AAOIFI screening, no leverage, no shorts, no derivatives
- **How it works:** Use local LLM for sentiment analysis + Shariah-compliant stock screener → automated long-only trading of halal stocks
- **Key advantage:** Local inference means no API costs for running sentiment models
- **Risk:** HIGH. Markets can go down. Most retail algo traders lose money. No leverage = slower growth
- **Reality check:** This is active investing, not passive income. The GPU just saves on API costs

### Tier 3: Freelance Work (High effort, not truly passive)

#### 5. Model Fine-Tuning Service
- **Monthly income:** $200–2,000
- **Setup:** 2–4 weeks (pipeline setup, portfolio)
- **Maintenance:** 5–15 hrs/week per active project
- **Passivity:** 2/10 — this is consulting, not passive income
- **Halal status:** ✅ Halal (standard service business)
- **Risk:** Medium. Competition from cloud one-click fine-tuning platforms

#### 6. AI Agent / Research Services
- **Monthly income:** $0–2,000
- **Setup:** 1–3 months (build pipelines, find clients)
- **Maintenance:** 10–20 hrs/week
- **Passivity:** 2/10 — this is a business
- **Halal status:** ✅ Halal
- **Risk:** High setup effort, uncertain client acquisition

### Tier 4: Don't Bother

#### 7. Crypto Mining
- **Monthly income:** -$50 to +$30 (likely net loss after electricity)
- **Verdict:** GPU rental pays 10–50× more on the same hardware

#### 8. AI Trading Bots / Swarm Trading
- **Monthly income:** Likely negative
- **Verdict:** 95% of retail trading bots lose money. CFTC explicitly warns against AI trading hype. The successful examples (ai16z) are VC-backed teams, not solo GPU operators

#### 9. Prediction Markets
- **Monthly income:** N/A
- **Verdict:** Haram (maysir). Not an option regardless of profitability claims

---

## Part 4: Risk Assessment

| Risk | Strategies Affected | Mitigation |
|---|---|---|
| GPU depreciation | All GPU-based | Hardware already owned; extract value while it's competitive |
| Electricity costs ($80–120/mo) | All | Factor into all income calculations; already deducted above |
| Low utilization on rental platforms | #1, #2 | Get verified early; offer competitive pricing; list on multiple platforms |
| Market saturation (AI art) | #3 | Focus on Islamic niche differentiation; human-modified works |
| Trading losses | #4 | Start with paper trading; small position sizes; accept this isn't truly passive |
| Platform risk (Vast.ai, ShareAI) | #1, #2 | Diversify across platforms |
| Copyright uncertainty (AI art) | #3 | Substantial human modification strengthens claims; p5.js workflow helps |
| Regulatory changes | #4, crypto | Monitor; halal stock trading on regulated exchanges is safest |

---

## Part 5: Top 3 Recommendations — Implementation Plan

### Recommendation 1: GPU Compute Rental (Start Week 1)

**Why:** Lowest effort, most predictable income, zero halal concerns.

**Steps:**
1. Ensure Ubuntu + NVIDIA drivers + Docker are configured
2. Register on Vast.ai as a host → complete verification
3. Also register on RunPod (diversification)
4. Set competitive pricing (~$0.40/hr per A6000)
5. Monitor utilization for first 2 weeks, adjust pricing

**Expected outcome:** $150–400/month net after 2–4 weeks of ramp-up.

### Recommendation 2: Islamic Art Store (Start Month 1–2)

**Why:** Leverages existing Ottoman design skills, underserved niche, semi-passive once catalog is built, strongest long-term ceiling.

**Steps:**
1. Generate initial catalog: 50 Islamic geometric patterns, Ottoman-inspired designs, calligraphy compositions using existing p5.brush pipeline
2. Open Etsy shop → list as instant digital downloads (SVG, PNG, PDF)
3. Set up Redbubble/Society6 for print-on-demand (wall art, pillows, phone cases)
4. Add 5–10 new designs per week for first 3 months
5. Optimize listings for SEO (Islamic art, geometric pattern, mosque decor, Ramadan gifts)

**Expected outcome:** $100–500/month after 3–6 months of catalog building. Scales with catalog size.

### Recommendation 3: LLM Inference Provider (Start Week 2–3)

**Why:** Good complement to GPU rental — fills idle GPU time. Growing demand for local inference.

**Steps:**
1. Install vLLM alongside Ollama for production serving
2. Register on ShareAI provider network
3. Serve Qwen 3.5:35b and/or Llama 3 70B (fits in 96GB)
4. Configure to run during off-peak rental hours

**Expected outcome:** $100–300/month additional, running alongside Vast.ai during low-demand periods.

---

## Combined Income Projection (Realistic)

| Timeline | Monthly Income (net) | Effort |
|---|---|---|
| Month 1 | $100–300 | 10–15 hrs setup |
| Month 3 | $250–600 | 2–4 hrs/week maintenance |
| Month 6 | $400–900 | 2–4 hrs/week maintenance |
| Month 12 | $500–1,200 | 2–4 hrs/week (art store scaling) |

**Honest bottom line:** This is supplemental income, not a salary replacement. The dual A6000s are a genuine asset — 96GB VRAM is valuable — but passive income from consumer/prosumer GPU hardware realistically tops out at $500–1,200/month in the best case. Anyone promising more is selling something.

---

## What About the Swarm Dream?

MiroFish and swarm intelligence are genuinely interesting for **research and scenario analysis** — simulating how opinions form, testing narratives, exploring "what if" scenarios. But they are not money-printing machines.

If you want to explore swarm simulation as a learning project:
- Run MiroFish locally with 20–50 agents pointed at Ollama
- Use it for qualitative research (e.g., "how might the market react to X?")
- Do NOT use it for automated trading decisions
- Treat it as a tool for generating hypotheses, not predictions

The gap between "interesting AI research" and "reliable passive income" is vast. Build income on proven, boring strategies (GPU rental, art sales) while experimenting with swarm intelligence as a side project.

---

*Research compiled 2026-03-16. Sources include Vast.ai, RunPod, ShareAI, AAOIFI Shariah Standards, Islamic Finance Guru, Musaffa Academy, CFTC advisories, MiroFish GitHub repository, and multiple Islamic scholarly sources on halal finance.*
