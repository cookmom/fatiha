# REPORT 2: TASH's Novel Music & Creative Ideas

## His Generative Music Philosophy

### The Problem with Traditional Sequencing
> "I've been producing for so long now that it doesn't matter how many things I know, I sit down and I end up running into the same patterns again and again. I sit at a piano and if I'm not careful I'll end up playing the same D minor 9 into the F major 7."

> "The problem with random is that after a while it doesn't really give the listener or even you as a creator anything to really latch onto and so it just feels a bit meandering and lacking in soul."

His solution: use **existing data from non-musical sources** to generate music — text, drawings, gestures — creating patterns that are neither predictable nor truly random.

### Core Concept: "Backwards Ways to Make Music"
He's obsessed with approaches that produce **surprising but repeatable** results. The key tension: deterministic enough to latch onto, but surprising enough to escape your habitual patterns.

---

## Specific Plugins & Techniques

### Angels (Granular Effect Plugin)
His self-described "Magnum Opus." A granular processor that transforms any audio input.

**Core Parameters:**
- **Blend**: Dry/wet between original and granular output
- **Size**: Grain size, with direction — clockwise = forward grains, counterclockwise = reverse grains
- **Density/Sync**: Clock-synced grain triggering (quarter notes → 32nd notes), with probability (50% chance any 16th note triggers)
- **Deja Vu**: Pattern repetition control. Center = locked 8-step loop. Left = new random pattern. Controls how quickly the loop pattern evolves.
- **Bloom**: Scale note restriction. All the way down = only root/octaves. Halfway = adds fifths. Full = entire scale available.
- **Sparkle**: Randomly adds fifths and octaves on top of grains — interacts beautifully with feedback
- **Pitch randomization**: Scale-aware, with sample-and-hold mode synced to triggers
- **Feedback**: Creates resonant, self-reinforcing grain patterns
- **Wow & Flutter**: Tape-style modulation on the granular output
- **Drive**: Saturation/distortion
- **Character modes**: Clean (float32), Vintage Tape (16-bit), Lo-fi Crunch (mu-law + 8-bit)
- **Pre-verb / Post-verb**: Reverb before and after grain processing

**Three Playback Modes (V2.2 addition):**
1. **Sync mode** (default): Grains trigger at clock-synced intervals
2. **Triggered mode**: Grains only trigger when receiving external MIDI notes. Sync control greys out — each MIDI note = one grain. "This can be really cool because it means we can create patterns."
3. **Gated mode**: Like triggered, but note *length* matters. While a note is held, grains play at the density rate. Short note = one grain. Long note = stream of grains at synced tempo.

**The "One Note Melody" Technique:**
Feed a single sustained note into Angels with scale-aware pitch randomization. Because it's monophonic, pitch shifting works perfectly (unlike polyphonic material where chord intervals would be destroyed). The result: complex evolving melodies from a single MIDI note.

> "Because this is a single note, you really can just go wild with the pitch here."

**Using position modulation instead of pitch** for polyphonic/harmonic material:
> "This is actually a really good example of when to use position modulation more so than transpose."

### Anima (Resonance/Physical Modeling Plugin)

**V1.2 additions:**
- **Transient snapping**: Detects transients in loaded samples, snaps grain start positions to them. With random start position, it randomly selects different transients.
- **Material modes**: String (default), Membrane (drum-like), Bar (xylophone/tube), Plate, Bell — each with different harmonic decay and spread ratios
- **Spread control**: Changes the "tightness of the skin" in membrane mode, or harmonic spacing in other modes
- **Concert pitch options**: 440Hz (default), 432Hz, 415Hz, 444Hz, custom
- **UI scaling**: Rememberable across sessions

**Membrane mode for drums**: Load a sample, snap to transients, set to membrane mode. Each triggered transient becomes a tuned drum hit. "Sounds a lot more drum-like."

### Words (Text-to-MIDI App)

**The Mapping Algorithm:**
- Each letter → number (A=1, B=2... Z=26)
- Sum all letter values in a word, modulo 7, add 1 → scale degree
- **Note duration** = number of syllables (e.g., "beautiful" = 3/16 note)
- **Rest between words** = (sum of word1 + sum of word2) / 2, rounded up, modulo 4, +1
- **Velocity** = 50 + (first letter value - last letter value)
- **Deterministic**: Same text always produces same MIDI output — "it's like learning a new language"

**Key Features:**
- Multi-channel output (different words → different MIDI channels → different instruments)
- **Transpose presets**: Keyboard shortcuts to shift everything by scale degrees (not semitones)
- **Transpose lock**: Per-pattern lock so some patterns stay fixed while others shift (creates pedal tones)
- **Density control**: Per-pattern probability of note playback
- **Bloom**: Restricts available scale degrees (start with just roots, gradually add more notes)
- **Harmony voices**: Add parallel voices at scale degree intervals with independent probability
- **Play modes**: Forward, backward, random per pattern
- **Randomize pitch/velocity/length**: Per-pattern randomization
- Save/load presets as JSON

**The Polymetric Magic:**
Because each word has a different length, patterns cycle at different rates, creating polymetric phasing. "The universe will probably be over by the time some of these patterns actually repeat."

### Gestures (Drawing-to-MIDI)

Browser-based tool where you draw shapes on a canvas and they map to MIDI notes.

**Prime Number Loop Lengths**: Each drawn note is randomly assigned a prime number loop length (3, 5, 7, 11...). Because primes have no common factors, the composite pattern takes enormous time to fully repeat — creating ever-evolving polymetric cycles.

> "The more and more notes you add, the longer and longer it will take for the cycle to ever fully repeat."

**Drawing mechanics:**
- Y-axis = pitch (bottom = low, top = high, across 1-5 octave spread)
- Drawing speed = velocity (fast strokes = louder)
- Right-click to set octave spread per note before drawing

### Shake (Shaker Plugin)
Simple but solves a real problem: "I was always searching for shaker loops and it was always such a hassle." Generates synthetic shaker patterns with presets like "low low high." Has humanize controls for subtle velocity and timing shifts.

### AutoClip
Mentioned in passing — a clipping/limiting plugin being improved.

### Flutter Verb (Built in the 1h48m video)
A reverb where wow/flutter and drive only affect the wet signal. DJ-style filter (center = flat, left = LP, right = HP) with toggle for wet-only or full-signal filtering. Built entirely from scratch in one session using the Plugin Freedom System.

### Radio Music (VST recreation)
Recreation of a Eurorack module. Load a folder of audio files, scrub through them, re-trigger at different start positions. "This very organic approach to almost like dumb-finding sounds."

---

## Sound Design Techniques Worth Stealing

### 1. Resonance Bank from Ambient Noise
From the "AC Noise & Rain" video — a complete technique in 5 minutes:
1. Record room ambience (AC hum, rain)
2. Add sharp EQ boosts at **octave-related frequencies** (220Hz, 440Hz, 880Hz — all octaves of A)
3. Duplicate and layer the EQ'd recordings
4. Resample the result
5. Load into a sampler, play with MIDI notes (D, F, A, C, E)
6. Use follow actions for random cycling between notes
7. Duplicate across octaves (-12, +12)
8. Add reverb, erosion, delay with time wobble, auto-pan
9. De-tune duplicates ±10 cents, pan L/R for width

**Result**: Beautiful ambient music from literally nothing but room noise.

### 2. Euclidean Rhythms as Modulation Source
Uses Bitwig's Note Repeat in Euclidean mode to generate trigger patterns for Angels. Then modulates the Euclidean parameters (fill amount, rotation) with LFOs to create evolving rhythmic patterns.

### 3. Freeze + Position Modulation
Freeze a buffer in Angels, then modulate the playback position with an LFO. "If I bring blend all the way down, we're only hearing the wet signal. But I can do some cool shit by modulating the position of freeze."

Toggle freeze on/off to periodically update the buffer with new content.

### 4. Cascading Angels Instances
Stack multiple Angels instances in series, each with different settings:
- First: reverse grains, octave down, high reverb
- Second: "magic tickles" preset, octave + fifth up
- Third: plucky 16th notes, two octaves up, with probability

### 5. Sample-and-Hold for Stepped Randomization
Set pitch randomization to sample-and-hold mode synced to triggers. Each trigger gets a new random (but scale-quantized) pitch value. Combined with gated mode: "every time a trigger is sent, we get a random value."

### 6. Bitwig Modulation + Angels
He extensively uses Bitwig's modulation system with Angels:
- Note-hold randoms for per-note pan, decay, filter values
- Step modulators synced to note advance for rhythmic parameter changes
- LFOs on Euclidean fill/rotation to evolve trigger patterns
- Filter envelope triggered by incoming MIDI note side-chain
- Macro knobs that simultaneously control multiple parameters across multiple tracks

### 7. The "Bigger" Macro
A single knob that simultaneously: increases reverb sends, opens filters, adds grain size, increases feedback, brings in delay, adds randomization amounts. Creates a "breakdown" effect.

---

## Plugin Design Philosophy

### What Makes a Good Instrument
- **Surprise over precision**: "I didn't want another tool that I have to think too much about"
- **Musical constraints**: Scale-aware pitch randomization prevents atonal chaos
- **Deja Vu / Lock pattern**: Repeatable but evolvable — not pure random, not static
- **Single-note-in, complex-out**: The "one note melody" paradigm
- **Performability**: Everything should be jammable with a single knob twist
- **Self-serve refunds**: "If you don't absolutely love it, you can have a refund"
- **30-day free trial** on all products

### Design Approach
- Uses familiar languages (HTML/CSS) for UI rather than JUCE's look-and-feel
- Character modes that dramatically change the sonic signature (clean → tape → lo-fi crunch)
- Physical modeling modes (string, membrane, bar, plate, bell) that behave like real materials
- Concert pitch flexibility (432Hz crowd)

---

## His Views on AI in Music

### The Sampling Analogy
> "You're not just sampling the music, you're sampling what the bassist had for breakfast, you know, you're sampling the situation between the studio manager and the secretary on that date."

He sees AI-generated audio as **sample material to be curated and transformed**, not finished products:

> "At no point did I ever think, or will I ever think, that the benefit of AI-generated music is typing in a prompt, getting a result, and saying, 'That's it.'"

### The Three Skills for AI Music
1. **Define your vision**: Get extremely clear on what you want — genres, textures, emotions, eras, countries. Know what you DON'T want equally well.
2. **Master the tools**: Use manual/advanced controls in Udio, understand seed values, prompt strength, prompt structure.
3. **Production expertise**: Fix the "fucked up audio quality" — spectral smearing, stem separation artifacts. Know EQ, compression, spectral repair. Arrange full songs.

### The Language Insight
> "A lot of people on earth will get bad results with AI for one key reason... they don't know what they want in any capacity."

AI music forced him to articulate what was previously intuitive: "I needed to understand beyond just 'Tash makes organic house.' I needed to understand what the intended feelings were."

He maintains **thousands of descriptive words** organized by what he likes (dusty, vintage, warm, mellow, melancholic, spiritual) vs. what he doesn't (harsh, aggressive, poppy, broken).

### His Workflow with Udio
- Uses custom GPTs as "prompt generators" loaded with his aesthetic vocabulary
- Asks for prompt combinations: "Give me an African style prompt" → gets Afrobeat + West African percussion + Mali blues combinations
- Cherry-picks words across multiple generated prompts
- Uses Udio's manual mode (seed values, prompt strength sliders)
- Generates ~150+ variations for a single song
- Splits stems with RipX
- Samples isolated parts exactly as he would vinyl or field recordings
- Only ONE released song used AI-generated samples as primary material

### On Quality
> "Human art will hundred billion times always be better than AI art because of the magic of intention that AI does not have."

But: Suno = "garbage, Sesame Street quality." Udio = far superior for actual usable material.

---

## Ideas Applicable to Visual Art / TouchDesigner / Audiovisual

### 1. Text-to-Generative-Pattern
The Words algorithm (letter→number→scale degree, syllables→duration) could map to:
- Visual parameters (color, position, size, rotation)
- TouchDesigner CHOP values
- Particle system behaviors
- Each word = a visual "note" with duration and intensity

### 2. Prime Number Phasing for Visual Loops
Assign prime-number loop lengths to visual elements. They'll phase in and out of alignment, creating ever-evolving compositions that never exactly repeat. Perfect for installations.

### 3. Gesture-to-Parameter
The Gestures concept (draw shapes → map to values) translates directly to:
- Drawing curves that become animation paths
- Sketch-to-shader parameter mapping
- Live performance visual instruments

### 4. Resonance Bank from Any Signal
The AC noise technique (sharp EQ boosts at harmonic intervals) could:
- Extract pitched content from any noise source for both audio and video reactivity
- Create visual "tuning" of random noise into structured patterns
- Drive TouchDesigner audio-reactive visuals from ambient sound

### 5. Bloom as Energy Control
The Bloom concept (gradually revealing more scale degrees) could map to visual complexity — start with simple shapes/colors, gradually introduce more elements as energy builds.

### 6. Freeze + Scrub as Visual Technique
Freeze a visual buffer, then modulate the scrub position — creates glitchy, time-stretched visual effects. Toggle freeze on/off to capture new frames.

### 7. The "Bigger" Macro for AV Shows
One controller simultaneously increases: visual complexity, audio reverb/delay, particle count, color saturation, camera zoom. Creates unified build-ups.

---

## Musical Scales He Loves
- **Hijaz** (Middle Eastern): "I'm a big fan of this Hijaz scale... sounds truly dark as fuck"
- **Celtic/Scottish Pentatonic**: "I'm always using this one"
- **Chinese Shang**: Used extensively with Angels bass patches
- **Major Pentatonic**: Default go-to for jamming
- **Tazita Minor**: Used for shimmer/atmospheric work
- His scale library includes Ethiopian, Jewish, Thai, Flamenco, Indian ragas, and many more — "one thing that always pisses me off about a lot of tools is when they just do major and minor"
