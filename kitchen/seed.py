#!/usr/bin/env python3
"""
Seed script for kitchen newsfeed daily_items table.
Run AFTER creating the table via migration.sql in the Supabase dashboard.

Usage:
  python3 seed.py
"""

import json, urllib.request, urllib.error

SUPABASE_URL = 'https://wezxebfnxjviihawcexs.supabase.co'
SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndlenhlYmZueGp2aWloYXdjZXhzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjQ3NDMxNiwiZXhwIjoyMDg4MDUwMzE2fQ.GObc8-Bgr-7NAv3AtTTRfTTMw3hXSinZNDsheAmcVl4'

ITEMS = [
  # VP
  {"date":"2026-03-02","category":"vp","title":"Foundry Nuke Stage","summary":"New standalone ICVFX tool, real-time photorealistic playback, invite-only early access","url":"https://www.cgchannel.com/2025/04/foundry-unveils-new-virtual-production-and-icvfx-tool-nuke-stage/","priority":"normal"},
  {"date":"2026-03-02","category":"vp","title":"ISE 2026: VP enters production maturity","summary":"VP/ICVFX passed hype phase","url":"https://www.iseurope.org/news/under-hood-virtual-production","priority":"normal"},
  {"date":"2026-03-02","category":"vp","title":"Brompton Tessera powers Live Aid Musical","url":"https://www.etnow.com/news/2026/2/brompton-technology-powers-epic-led-visuals-for-just-for-one-day--the-live-aid-musical","priority":"normal"},
  {"date":"2026-03-02","category":"vp","title":"Cirque du Soleil ALIZE: Brompton + ROE Visual","url":"https://www.etnow.com/news/2026/1/cirque-du-soleils-aliz-comes-to-life-with-brompton-technology-and-theatrixx","priority":"normal"},
  {"date":"2026-03-02","category":"vp","title":"Brompton 8K Tessera SQ200","url":"https://plsn.com/featured/brompton-technology-unveils-8k-led-video-processor-tessera-sq200-at-nab-2024/","priority":"normal"},
  {"date":"2026-03-02","category":"vp","title":"Vicon Active Crown","summary":"Flexible camera tracking for ICVFX volumes","url":"https://www.vicon.com/hardware/devices/activecrown/","priority":"normal"},
  {"date":"2026-03-02","category":"vp","title":"UE 5.5 ICVFX production-ready","url":"https://www.unrealengine.com/en-US/blog/unreal-engine-5-5-is-now-available","priority":"normal"},
  {"date":"2026-03-02","category":"vp","title":"UE 5.7 What's New","url":"https://dev.epicgames.com/documentation/en-us/unreal-engine/whats-new","priority":"normal"},
  {"date":"2026-03-02","category":"vp","title":"SXSW 2026","summary":"March 12-18, Austin TX","url":"https://sxsw.com/festivals/innovation-conference/","priority":"normal"},
  {"date":"2026-03-02","category":"vp","title":"Disguise ISE 2026: X1 + GX 3+","url":"https://www.disguise.one/en/ise-2026","priority":"normal"},
  {"date":"2026-03-02","category":"vp","title":"NantStudios Dynamic Volume System","url":"https://www.bromptontech.com/case-study/reconfigurable-led-volume-for-next-gen-virtual-production/","priority":"normal"},
  # AI
  {"date":"2026-03-02","category":"ai","title":"Gemini 3.1 Pro","summary":"77.1% ARC-AGI-2, 1M context, beats GPT-5.2 + Claude Opus 4.6","url":"https://creati.ai/ai-news/2026-02-20/google-gemini-3-1-pro-release-beats-gpt-5-2-claude-benchmarks/","priority":"normal"},
  {"date":"2026-03-02","category":"ai","title":"Feb 2026 AI model wave","summary":"Gemini 3.1 + GPT 5.3 + Claude Fennec + Grok 4.20 + DeepSeek V4","url":"https://www.comparateur-ia-facile.com/en/blog/nouveaux-modeles-ia-fevrier-2026-gpt-claude-gemini","priority":"normal"},
  {"date":"2026-03-02","category":"ai","title":"AI video 2026: Kling 3.0 + Sora 2 Pro + Seedance 1.5","url":"https://medium.com/@cliprise/the-state-of-ai-video-generation-in-february-2026-every-major-model-analyzed-6dbfedbe3a5c","priority":"normal"},
  {"date":"2026-03-02","category":"ai","title":"Sora 2 + Runway Gen-4.5 lead cinematic","url":"https://pinggy.io/blog/best_video_generation_ai_models/","priority":"normal"},
  {"date":"2026-03-02","category":"ai","title":"LLM Stats tracker","url":"https://llm-stats.com/llm-updates","priority":"normal"},
  {"date":"2026-03-02","category":"ai","title":"Artists sidestepping AI in 2026","url":"https://www.creativebloq.com/art/digital-art/digital-art-trends-2026-reveal-how-creatives-are-responding-to-ai-pressure","priority":"normal"},
  {"date":"2026-03-02","category":"ai","title":"Suno v5 — 8-minute songs","url":"https://suno.com/hub/best-ai-music-generator","priority":"normal"},
  {"date":"2026-03-02","category":"ai","title":"DeepSeek V4 Engram architecture","url":"https://www.comparateur-ia-facile.com/en/blog/nouveaux-modeles-ia-fevrier-2026-gpt-claude-gemini","priority":"normal"},
  {"date":"2026-03-02","category":"ai","title":"Adobe Firefly Boards","url":"https://www.creativebloq.com/tech/from-firefly-to-graph-how-adobe-thinks-creatives-will-use-ai-in-2026","priority":"normal"},
  {"date":"2026-03-02","category":"ai","title":"2026 creative AI stack","url":"https://www.aibarcelona.org/2026/02/top-10-generative-ai-tools-digital-creators-2026.html","priority":"normal"},
  {"date":"2026-03-02","category":"ai","title":"Generative AI: 24% revenue loss for music creators","summary":"Up to 24% loss for music, 21% for AV by 2028","url":"https://www.globalissues.org/news/2026/02/25/42425","priority":"high"},
  # Tools
  {"date":"2026-03-02","category":"tools","title":"Bitwig Studio 6","summary":"March 11 release — automation clips, global key sig, clip aliases","url":"https://synthanatomy.com/2026/02/bitwig-studio-6.html","priority":"normal"},
  {"date":"2026-03-02","category":"tools","title":"Ableton Live 12 beta","url":"https://www.ableton.com/en/release-notes/live-12-beta/","priority":"normal"},
  {"date":"2026-03-02","category":"tools","title":"Ableton Push 12 beta","url":"https://www.ableton.com/en/release-notes/push-12-beta/","priority":"normal"},
  {"date":"2026-03-02","category":"tools","title":"Notch 2026.1","summary":"AE plugin, MOVIN mocap, OptiTrack support","url":"https://manual.notch.one/2026.1/en/docs/whats-new/everything/","priority":"normal"},
  {"date":"2026-03-02","category":"tools","title":"Notch 0.9.23 EOL","url":"https://manual.notch.one/2026.1/en/docs/whats-new/0923-access-support-licensing/","priority":"normal"},
  {"date":"2026-03-02","category":"tools","title":"Resolume 7.24.3","url":"https://www.resolume.com/download/","priority":"normal"},
  {"date":"2026-03-02","category":"tools","title":"TouchDesigner 2023 Timecode CHOP","url":"https://interactiveimmersive.io/blog/touchdesigner-resources/touchdesigner-2023-official-updates/","priority":"normal"},
  {"date":"2026-03-02","category":"tools","title":"Patchies — browser AV patcher","summary":"Strudel + Hydra + p5.js + GLSL in visual node graph","url":"https://github.com/heypoom/patchies","priority":"normal"},
  {"date":"2026-03-02","category":"tools","title":"Generative coding = breakthrough tech 2026","url":"https://www.technologyreview.com/2026/01/12/1130027/generative-coding-ai-software-2026-breakthrough-technology/","priority":"normal"},
  # Synths-Eurorack
  {"date":"2026-03-02","category":"synths-eurorack","title":"Make Noise Universal Skiff + MultiWave MIDI Inlet","url":"https://www.synthtopia.com/content/2026/01/24/make-noise-intros-new-universal-skiff-system-more/","priority":"normal"},
  {"date":"2026-03-02","category":"synths-eurorack","title":"midiphy zetaSID — C64 SID chip as 4HP eurorack","url":"https://synthanatomy.com/2026/02/midiphy-zetasid-revives-the-legendary-sid-chip-as-an-expandable-modular-synth-voice.html","priority":"normal"},
  {"date":"2026-03-02","category":"synths-eurorack","title":"VCV Rack: licensed Buchla/Moog/Intellijel modules","url":"https://www.gearnews.com/eurorack-in-techno-synths/","priority":"normal"},
  {"date":"2026-03-02","category":"synths-eurorack","title":"Suno Warp Markers + Time Sig support","url":"https://suno.com/blog/introducing-v4-5","priority":"normal"},
  {"date":"2026-03-02","category":"synths-eurorack","title":"Suno + Warner Music partnership","url":"https://www.wmg.com/news/warner-music-group-and-suno-forge-groundbreaking-partnership","priority":"normal"},
  {"date":"2026-03-02","category":"synths-eurorack","title":"Eurorack in Techno 2026","url":"https://www.gearnews.com/eurorack-in-techno-synths/","priority":"normal"},
  {"date":"2026-03-02","category":"synths-eurorack","title":"Best Eurorack modules 2026","url":"https://www.musicradar.com/news/the-best-eurorack-modules-in-the-world","priority":"normal"},
  {"date":"2026-03-02","category":"synths-eurorack","title":"Intellijel Jellymix + Swells + 7U case gen 2","url":"https://synthanatomy.com/2026/02/intellijel-jellymix-desktop-mixer-swells-stereo-reverb-module-and-updated-7u-case.html","priority":"normal"},
  {"date":"2026-03-02","category":"synths-eurorack","title":"Intellijel Multigrain granular","url":"https://modwiggler.com/forum/viewtopic.php?t=292563","priority":"normal"},
  {"date":"2026-03-02","category":"synths-eurorack","title":"Mannequins Silhouette","url":"https://www.reddit.com/r/modular/comments/1hj760v/new_module_from_mannequins_silhouette/","priority":"normal"},
  # Art
  {"date":"2026-03-02","category":"art","title":"ARTECHOUSE NYC SUBMERGE","url":"https://www.artechouse.com/location/nyc/","priority":"normal"},
  {"date":"2026-03-02","category":"art","title":"ECHOES OF TOMORROW — Signal Space Prague","summary":"Generative systems, lasers, spatial audio, 10 artists","url":"https://criticalplayground.org/echoes-of-tomorrow-at-signal-space/","priority":"normal"},
  {"date":"2026-03-02","category":"art","title":"LACMA 2026 Beeple","summary":"12 screens, audience remixes in real time","url":"https://unframed.lacma.org/2025/12/31/exhibitions-see-2026","priority":"normal"},
  {"date":"2026-03-02","category":"art","title":"Kim Hankyul — kinetic sculptor, first US museum commission","url":"https://www.artsy.net/article/artsy-editorial-11-artists-breakout-moments-2026","priority":"normal"},
  {"date":"2026-03-02","category":"art","title":"Artnet: 8 Artists 2026","url":"https://news.artnet.com/art-world/8-artists-poised-to-break-out-in-2026-2722681","priority":"normal"},
  {"date":"2026-03-02","category":"art","title":"22 LA exhibitions 2026","url":"https://www.timeout.com/los-angeles/news/22-art-exhibitions-in-l-a-to-look-forward-to-in-2026-123125","priority":"normal"},
  {"date":"2026-03-02","category":"art","title":"Zimoun — sound sculptor","summary":"Industrial materials + mechanics = emergent acoustics","url":"https://zimoun.net/","priority":"normal"},
  # Creative Coding
  {"date":"2026-03-02","category":"creative-coding","title":"fxhash FXH Protocol","summary":"FXH token + art coins + open-form generative art","url":"https://beta.fxhash.xyz/","priority":"normal"},
  {"date":"2026-03-02","category":"creative-coding","title":"Patchies","summary":"Multiplayer browser AV patcher","url":"https://patchies.app","priority":"normal"},
  {"date":"2026-03-02","category":"creative-coding","title":"flok.cc","summary":"Collaborative live coding: Strudel + Hydra","url":"https://flok.cc","priority":"normal"},
  {"date":"2026-03-02","category":"creative-coding","title":"Switch Angel — live coding techno with Strudel","url":"https://hackaday.com/2025/10/16/live-coding-techno-with-strudel/","priority":"normal"},
  {"date":"2026-03-02","category":"creative-coding","title":"awesome-creative-coding","url":"https://github.com/terkelg/awesome-creative-coding","priority":"normal"},
  # Research
  {"date":"2026-03-02","category":"research","title":"Algorithm Modeling in Islamic Geometric Pattern Reconfiguration","summary":"Journal of Islamic Architecture, June 2025","url":"https://www.researchgate.net/publication/393164774","priority":"normal"},
  {"date":"2026-03-02","category":"research","title":"The Islamic Algorithm — $15B Parametric Design","summary":"Ancient patterns to patented parametric designs. Algorithms are public domain, implementations are not.","url":"https://medium.com/@Architects_Blog/the-islamic-algorithm-how-ancient-geometric-ip-is-creating-a-15b-parametric-design-monopoly-ee29454f44c2","priority":"normal"},
  {"date":"2026-03-02","category":"research","title":"islamic-geometry GitHub","summary":"Open-source generative computational Islamic geometry","url":"https://github.com/TheBeachLab/islamic-geometry","priority":"normal"},
  {"date":"2026-03-02","category":"research","title":"MIT: Generative coding breakthrough 2026","url":"https://www.technologyreview.com/2026/01/12/1130027/generative-coding-ai-software-2026-breakthrough-technology/","priority":"normal"},
  # Opportunities
  {"date":"2026-03-02","category":"opportunities","title":"Prix Ars Electronica 2026 — DEADLINE MARCH 4","summary":"4 Golden Nicas, EUR 10k each, free entry","url":"https://ars.electronica.art/prix/en/opencall/","priority":"high"},
  {"date":"2026-03-02","category":"opportunities","title":"S+T+ARTS Prize 2026 — EXTENDED TO MARCH 9","summary":"EUR 40k, EU Commission","url":"https://starts-prize.aec.at/en/open-call/","priority":"high"},
  {"date":"2026-03-02","category":"opportunities","title":"Islamic Arts Society open call","url":"https://islamicartssociety.org/art-for-the-love-of-muhammad-pbuh-2026/","priority":"high"},
  {"date":"2026-03-02","category":"opportunities","title":"March 2026 Artist Opportunities (Colossal)","url":"https://www.thisiscolossal.com/2026/02/march-2026-opportunities-open-calls-residencies-grants/","priority":"high"},
  {"date":"2026-03-02","category":"opportunities","title":"SXSW 2026 Exhibitions","url":"https://sxsw.com/exhibitions/","priority":"high"},
  {"date":"2026-03-02","category":"opportunities","title":"50 Best Art Competitions 2026","url":"https://www.entrythingy.com/blog/best-art-calls-2026","priority":"high"},
  # Discovery
  {"date":"2026-03-02","category":"discovery","title":"midiphy zetaSID","summary":"C64 SID chip as 4HP eurorack voice — gaming history meets modular","url":"https://synthanatomy.com/2026/02/midiphy-zetasid-revives-the-legendary-sid-chip-as-an-expandable-modular-synth-voice.html","priority":"normal"},
  {"date":"2026-03-02","category":"discovery","title":"Patchies","summary":"Browser-native AV patcher — closest to TouchDesigner in a tab","url":"https://github.com/heypoom/patchies","priority":"normal"},
  {"date":"2026-03-02","category":"discovery","title":"The Islamic Algorithm","summary":"Ancient Islamic geometric patterns being patented for parametric design — public domain algorithms, proprietary implementations","url":"https://medium.com/@Architects_Blog/the-islamic-algorithm-how-ancient-geometric-ip-is-creating-a-15b-parametric-design-monopoly-ee29454f44c2","priority":"normal"},
  {"date":"2026-03-02","category":"discovery","title":"islamic-geometry GitHub","url":"https://github.com/TheBeachLab/islamic-geometry","priority":"normal"},
  {"date":"2026-03-02","category":"discovery","title":"Zimoun","summary":"Euclidean rhythms in physical form","url":"https://zimoun.net/","priority":"normal"},
  {"date":"2026-03-02","category":"discovery","title":"flok.cc","summary":"Multiplayer live coding — Strudel + Hydra simultaneously","url":"https://flok.cc","priority":"normal"},
  {"date":"2026-03-02","category":"discovery","title":"ECHOES OF TOMORROW","summary":"Signal Space Prague — generative + laser + spatial audio venue","url":"https://criticalplayground.org/echoes-of-tomorrow-at-signal-space/","priority":"normal"},
  {"date":"2026-03-02","category":"discovery","title":"Daric Gill 'The Shy Machine'","summary":"12-sided kinetic sculpture that learns room acoustics and adapts light to noise","url":"https://daricgill.com/2018/08/25/shy-machine-interactive-art/","priority":"normal"},
  {"date":"2026-03-02","category":"discovery","title":"Seedance 1.5 Pro","summary":"Underrated AI video model — watch for VP applications","url":"https://medium.com/@cliprise/the-state-of-ai-video-generation-in-february-2026-every-major-model-analyzed-6dbfedbe3a5c","priority":"normal"},
  {"date":"2026-03-02","category":"discovery","title":"FXH Protocol","summary":"Rearchitecting on-chain generative art — artist coins + open-form","url":"https://beta.fxhash.xyz/","priority":"normal"},
  {"date":"2026-03-02","category":"discovery","title":"Algorithm Modeling Islamic Geometric Pattern","summary":"Peer-reviewed computational approach to mosque ornament generation","url":"https://www.researchgate.net/publication/393164774","priority":"normal"},
  # Concepts
  {"date":"2026-03-02","category":"concepts","title":"agiftoftime.app for Prix Ars Electronica","summary":"AI + Ramadan + faith community + daily devotional practice = strong Digital Humanity narrative","priority":"normal"},
  {"date":"2026-03-02","category":"concepts","title":"SID chip revival pattern","summary":"Taking legendary obsolete sound hardware and giving it modular life — what else has not been revived?","priority":"normal"},
  {"date":"2026-03-02","category":"concepts","title":"Browser AV performance","summary":"Patchies + flok.cc = multiplayer real-time AV in a browser tab — teaching, collaboration, performance","priority":"normal"},
  {"date":"2026-03-02","category":"concepts","title":"VP convergence at ILM","summary":"UE 5.5 ICVFX production-ready + Foundry Nuke Stage launch = StageCraft intersection. Get on Nuke Stage beta.","priority":"normal"},
]

def insert_items(items):
    url = f'{SUPABASE_URL}/rest/v1/daily_items'
    data = json.dumps(items).encode('utf-8')
    req = urllib.request.Request(url, data=data, method='POST')
    req.add_header('apikey', SUPABASE_KEY)
    req.add_header('Authorization', f'Bearer {SUPABASE_KEY}')
    req.add_header('Content-Type', 'application/json')
    req.add_header('Prefer', 'return=minimal')
    try:
        with urllib.request.urlopen(req) as resp:
            status = resp.status
            print(f'Inserted {len(items)} items — HTTP {status}')
            return True
    except urllib.error.HTTPError as e:
        body = e.read().decode()
        print(f'HTTP {e.code}: {body}')
        return False

if __name__ == '__main__':
    print(f'Seeding {len(ITEMS)} items...')
    # Insert in batches of 20
    batch_size = 20
    for i in range(0, len(ITEMS), batch_size):
        batch = ITEMS[i:i+batch_size]
        insert_items(batch)
    print('Done.')
