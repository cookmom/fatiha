---
name: circuit-designer
description: >-
  Electronic circuit design and schematic generation. Use when asked about:
  schematic design, component selection, circuit analysis, voltage regulators,
  amplifiers, filters, oscillators, motor drivers, Eurorack module design,
  Arduino/ESP32/Raspberry Pi interfacing, PCB layout, SVG schematic output,
  KiCAD netlist generation, power supply design, op-amp circuits, or any
  electronics engineering question.
---

# Circuit Designer

Design electronic circuits, generate schematics (SVG), and produce KiCAD netlists.

## Core Workflow

1. **Understand requirements** — Voltage/current specs, input/output, environment, budget
2. **Select topology** — Choose circuit pattern from cookbook below
3. **Calculate component values** — Use formulas in reference sections
4. **Select real components** — Match to standard value series, check availability
5. **Generate schematic** — SVG output with IEEE/IEC symbols
6. **Provide netlist** — KiCAD format if requested
7. **PCB guidelines** — Trace widths, layout advice, thermal considerations

---

## Standard Component Symbols (SVG)

Use these SVG snippets when generating schematics. All symbols follow IEEE/IEC conventions.
Coordinate system: 1 grid unit = 10px. Standard component size: 60px length.

### Resistor (IEEE zigzag)
```svg
<g id="resistor" transform="translate(X,Y)">
  <path d="M0,0 L10,0 L15,-8 L25,8 L35,-8 L45,8 L55,-8 L60,0 L70,0" 
        fill="none" stroke="#000" stroke-width="2"/>
  <text x="35" y="-15" text-anchor="middle" font-size="12">R1</text>
  <text x="35" y="20" text-anchor="middle" font-size="10">10kΩ</text>
</g>
```

### Capacitor (unpolarized)
```svg
<g id="capacitor" transform="translate(X,Y)">
  <line x1="0" y1="0" x2="30" y2="0" stroke="#000" stroke-width="2"/>
  <line x1="30" y1="-12" x2="30" y2="12" stroke="#000" stroke-width="2"/>
  <line x1="40" y1="-12" x2="40" y2="12" stroke="#000" stroke-width="2"/>
  <line x1="40" y1="0" x2="70" y2="0" stroke="#000" stroke-width="2"/>
  <text x="35" y="-18" text-anchor="middle" font-size="12">C1</text>
  <text x="35" y="25" text-anchor="middle" font-size="10">100nF</text>
</g>
```

### Electrolytic Capacitor (polarized)
```svg
<g id="cap-polar" transform="translate(X,Y)">
  <line x1="0" y1="0" x2="30" y2="0" stroke="#000" stroke-width="2"/>
  <line x1="30" y1="-12" x2="30" y2="12" stroke="#000" stroke-width="2"/>
  <path d="M40,-12 Q44,0 40,12" fill="none" stroke="#000" stroke-width="2"/>
  <line x1="40" y1="0" x2="70" y2="0" stroke="#000" stroke-width="2"/>
  <text x="25" y="-10" font-size="8">+</text>
</g>
```

### Inductor
```svg
<g id="inductor" transform="translate(X,Y)">
  <line x1="0" y1="0" x2="10" y2="0" stroke="#000" stroke-width="2"/>
  <path d="M10,0 A6,6 0 0,1 22,0 A6,6 0 0,1 34,0 A6,6 0 0,1 46,0 A6,6 0 0,1 58,0" 
        fill="none" stroke="#000" stroke-width="2"/>
  <line x1="58" y1="0" x2="70" y2="0" stroke="#000" stroke-width="2"/>
</g>
```

### Diode
```svg
<g id="diode" transform="translate(X,Y)">
  <line x1="0" y1="0" x2="25" y2="0" stroke="#000" stroke-width="2"/>
  <polygon points="25,-10 25,10 45,0" fill="none" stroke="#000" stroke-width="2"/>
  <line x1="45" y1="-10" x2="45" y2="10" stroke="#000" stroke-width="2"/>
  <line x1="45" y1="0" x2="70" y2="0" stroke="#000" stroke-width="2"/>
</g>
```

### LED
```svg
<g id="led" transform="translate(X,Y)">
  <!-- Same as diode + arrows -->
  <polygon points="25,-10 25,10 45,0" fill="none" stroke="#000" stroke-width="2"/>
  <line x1="45" y1="-10" x2="45" y2="10" stroke="#000" stroke-width="2"/>
  <line x1="38" y1="-14" x2="44" y2="-20" stroke="#000" stroke-width="1.5"/>
  <polygon points="44,-20 40,-18 42,-22" fill="#000"/>
  <line x1="42" y1="-12" x2="48" y2="-18" stroke="#000" stroke-width="1.5"/>
  <polygon points="48,-18 44,-16 46,-20" fill="#000"/>
</g>
```

### NPN Transistor (BJT)
```svg
<g id="npn" transform="translate(X,Y)">
  <line x1="0" y1="0" x2="20" y2="0" stroke="#000" stroke-width="2"/> <!-- base -->
  <line x1="20" y1="-20" x2="20" y2="20" stroke="#000" stroke-width="3"/> <!-- body -->
  <line x1="20" y1="-10" x2="40" y2="-25" stroke="#000" stroke-width="2"/> <!-- collector -->
  <line x1="20" y1="10" x2="40" y2="25" stroke="#000" stroke-width="2"/> <!-- emitter -->
  <polygon points="34,22 40,25 36,18" fill="#000"/> <!-- arrow -->
  <line x1="40" y1="-25" x2="40" y2="-35" stroke="#000" stroke-width="2"/>
  <line x1="40" y1="25" x2="40" y2="35" stroke="#000" stroke-width="2"/>
</g>
```

### N-Channel MOSFET
```svg
<g id="nmos" transform="translate(X,Y)">
  <line x1="0" y1="0" x2="15" y2="0" stroke="#000" stroke-width="2"/> <!-- gate -->
  <line x1="15" y1="-20" x2="15" y2="20" stroke="#000" stroke-width="2"/>
  <line x1="20" y1="-20" x2="20" y2="20" stroke="#000" stroke-width="3"/>
  <line x1="20" y1="-15" x2="40" y2="-15" stroke="#000" stroke-width="2"/> <!-- drain -->
  <line x1="20" y1="15" x2="40" y2="15" stroke="#000" stroke-width="2"/> <!-- source -->
  <line x1="20" y1="0" x2="40" y2="0" stroke="#000" stroke-width="2"/>
  <line x1="40" y1="0" x2="40" y2="15" stroke="#000" stroke-width="2"/>
  <polygon points="24,0 32,-4 32,4" fill="#000"/> <!-- arrow toward body -->
</g>
```

### Op-Amp
```svg
<g id="opamp" transform="translate(X,Y)">
  <polygon points="0,-30 0,30 50,0" fill="none" stroke="#000" stroke-width="2"/>
  <line x1="-20" y1="-15" x2="0" y2="-15" stroke="#000" stroke-width="2"/> <!-- +in -->
  <line x1="-20" y1="15" x2="0" y2="15" stroke="#000" stroke-width="2"/> <!-- -in -->
  <line x1="50" y1="0" x2="70" y2="0" stroke="#000" stroke-width="2"/> <!-- out -->
  <text x="8" y="-11" font-size="12">+</text>
  <text x="8" y="19" font-size="12">−</text>
  <!-- V+ and V- supply pins at top/bottom of triangle -->
  <line x1="25" y1="-15" x2="25" y2="-25" stroke="#000" stroke-width="1.5"/>
  <line x1="25" y1="15" x2="25" y2="25" stroke="#000" stroke-width="1.5"/>
</g>
```

### Ground Symbol
```svg
<g id="gnd" transform="translate(X,Y)">
  <line x1="0" y1="0" x2="0" y2="10" stroke="#000" stroke-width="2"/>
  <line x1="-10" y1="10" x2="10" y2="10" stroke="#000" stroke-width="2"/>
  <line x1="-6" y1="14" x2="6" y2="14" stroke="#000" stroke-width="2"/>
  <line x1="-2" y1="18" x2="2" y2="18" stroke="#000" stroke-width="2"/>
</g>
```

### VCC/Power Rail
```svg
<g id="vcc" transform="translate(X,Y)">
  <line x1="0" y1="10" x2="0" y2="0" stroke="#000" stroke-width="2"/>
  <line x1="-8" y1="0" x2="8" y2="0" stroke="#000" stroke-width="2"/>
  <text x="0" y="-5" text-anchor="middle" font-size="10">VCC</text>
</g>
```

### IC Package (generic DIP)
```svg
<g id="ic-dip" transform="translate(X,Y)">
  <rect x="0" y="0" width="80" height="100" fill="none" stroke="#000" stroke-width="2"/>
  <path d="M35,0 A5,5 0 0,1 45,0" fill="none" stroke="#000" stroke-width="1.5"/>
  <text x="40" y="55" text-anchor="middle" font-size="11">U1</text>
  <!-- Pin stubs: add lines extending left/right from rect edges -->
</g>
```

### Schematic SVG Template
```svg
<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800">
  <style>
    text { font-family: monospace; }
    .wire { stroke: #000; stroke-width: 2; fill: none; }
    .junction { fill: #000; }
    .label { font-size: 12px; }
    .value { font-size: 10px; fill: #444; }
    .title { font-size: 16px; font-weight: bold; }
  </style>
  
  <!-- Title block -->
  <rect x="900" y="720" width="290" height="70" fill="none" stroke="#000" stroke-width="1"/>
  <text x="910" y="745" class="title">CIRCUIT TITLE</text>
  <text x="910" y="765" class="label">Date: YYYY-MM-DD</text>
  <text x="910" y="780" class="label">Rev: A</text>
  
  <!-- Components go here -->
  
  <!-- Wires -->
  <!-- Use class="wire" for all connections -->
  <!-- Junction dots at wire intersections that connect: -->
  <!-- <circle cx="X" cy="Y" r="3" class="junction"/> -->
</svg>
```

---

## Voltage/Current Calculations

### Ohm's Law & Power
```
V = I × R          I = V / R          R = V / I
P = V × I          P = I² × R        P = V² / R
```

### Voltage Divider
```
Vout = Vin × R2 / (R1 + R2)

For loaded divider (RL in parallel with R2):
Vout = Vin × (R2 ∥ RL) / (R1 + R2 ∥ RL)
where R2 ∥ RL = (R2 × RL) / (R2 + RL)

Rule of thumb: divider current ≥ 10× load current for <10% error
```

### Current Limiting Resistor
```
R = (Vsource - Vload) / Iload

LED example: R = (5V - 2V) / 20mA = 150Ω → use 150Ω (E24)
```

### Capacitor Charge/Discharge
```
V(t) = Vfinal × (1 - e^(-t/RC))        (charging)
V(t) = Vinitial × e^(-t/RC)             (discharging)
τ = R × C                                (time constant)
5τ ≈ fully charged (99.3%)
```

### Inductor Current
```
I(t) = Ifinal × (1 - e^(-tR/L))
τ = L / R
```

### Energy Storage
```
E_cap = ½CV²          E_ind = ½LI²
```

### RMS Values
```
Vrms = Vpeak / √2 ≈ 0.707 × Vpeak      (sine wave)
Vrms = Vpeak                              (DC)
Vrms = Vpeak / √3 ≈ 0.577 × Vpeak       (triangle wave)
```

---

## Component Value Series

### E12 (±10% tolerance)
```
1.0  1.2  1.5  1.8  2.2  2.7  3.3  3.9  4.7  5.6  6.8  8.2
```

### E24 (±5% tolerance)
```
1.0  1.1  1.2  1.3  1.5  1.6  1.8  2.0  2.2  2.4  2.7  3.0
3.3  3.6  3.9  4.3  4.7  5.1  5.6  6.2  6.8  7.5  8.2  9.1
```

### E96 (±1% tolerance)
```
1.00 1.02 1.05 1.07 1.10 1.13 1.15 1.18 1.21 1.24 1.27 1.30
1.33 1.37 1.40 1.43 1.47 1.50 1.54 1.58 1.62 1.65 1.69 1.74
1.78 1.82 1.87 1.91 1.96 2.00 2.05 2.10 2.15 2.21 2.26 2.32
2.37 2.43 2.49 2.55 2.61 2.67 2.74 2.80 2.87 2.94 3.01 3.09
3.16 3.24 3.32 3.40 3.48 3.57 3.65 3.74 3.83 3.92 4.02 4.12
4.22 4.32 4.42 4.53 4.64 4.75 4.87 4.99 5.11 5.23 5.36 5.49
5.62 5.76 5.90 6.04 6.19 6.34 6.49 6.65 6.81 6.98 7.15 7.32
7.50 7.68 7.87 8.06 8.25 8.45 8.66 8.87 9.09 9.31 9.53 9.76
```

### Common Capacitor Values
```
Standard (pF): 10, 22, 33, 47, 100, 220, 330, 470
Standard (nF): 1, 2.2, 3.3, 4.7, 10, 22, 33, 47, 100, 220, 330, 470
Standard (µF): 1, 2.2, 3.3, 4.7, 10, 22, 33, 47, 100, 220, 470, 1000

Capacitor types by application:
- Ceramic (MLCC): bypass/decoupling, high-freq filtering. C0G for precision, X7R general, Y5V cheap/unstable
- Film: audio coupling, timing, snubbers. Stable, low loss
- Electrolytic (aluminum): bulk storage, power filtering. ESR matters for switching supplies
- Tantalum: compact bulk storage. Derate 50%+ voltage, can fail short (fire risk!)
- MLCC voltage derating: X7R/X5R lose 50-80% capacitance at rated voltage!
```

---

## Filter Design

### RC Low-Pass Filter
```
fc = 1 / (2π × R × C)
H(f) = 1 / √(1 + (f/fc)²)
Phase = -arctan(f/fc)
Roll-off: -20 dB/decade (-6 dB/octave)

Design: pick C, then R = 1/(2π×fc×C)
```

### RC High-Pass Filter
```
fc = 1 / (2π × R × C)
H(f) = 1 / √(1 + (fc/f)²)
Roll-off: +20 dB/decade below fc
```

### LC Filter (2nd order)
```
fc = 1 / (2π × √(L×C))
Q = (1/R) × √(L/C)          (series RLC)
Q = R × √(C/L)              (parallel RLC)
Roll-off: -40 dB/decade

Bandwidth (bandpass): BW = fc / Q
```

### Active Filters (Sallen-Key topology)

#### 2nd-Order Low-Pass (unity gain)
```
        R1        R2
Vin ──┤├──┬──┤├──┬──[+]─── Vout
           │        │    opamp  │
           C1       C2         │
           │        │          │
          GND      GND    [-]──┘

fc = 1 / (2π × √(R1×R2×C1×C2))
Q = √(R1×R2×C1×C2) / (C2×(R1+R2))

Butterworth (Q=0.707): set R1=R2=R, C2=2×C1
  fc = 1 / (2π × R × C1 × √2)
```

#### 2nd-Order High-Pass (unity gain)
```
Swap R↔C in Sallen-Key LP.
fc = 1 / (2π × √(R1×R2×C1×C2))
```

### Bandpass: cascade HP + LP with fc_HP < fc_LP

### State Variable Filter (universal)
Use for simultaneous LP/HP/BP outputs. See `references/filter-designs.md`.

---

## Op-Amp Circuit Cookbook

**Golden rules (ideal op-amp):**
1. No current flows into inputs (Z_in = ∞)
2. V+ = V- (when in negative feedback)
3. Output drives to make rule 2 true

### Inverting Amplifier
```
Gain = -Rf / Rin
Vout = -Vin × (Rf / Rin)

Rin ──┤├── V- ──┤├── Vout
              │    Rf
             opamp
              │
V+ ── GND
```

### Non-Inverting Amplifier
```
Gain = 1 + Rf / Rg
Vout = Vin × (1 + Rf/Rg)

Vin ── V+
          opamp ── Vout
V- ──┤├── GND
  │   Rg
  ├──┤├──┘
      Rf
```

### Voltage Follower (Buffer)
```
Gain = 1, Zin = very high, Zout = very low
Vin ── V+ ── opamp ── Vout
       V- ──────────┘
```

### Summing Amplifier
```
Vout = -Rf × (V1/R1 + V2/R2 + V3/R3)
```

### Difference Amplifier
```
Vout = (Rf/Rin) × (V2 - V1)    (when R1=R3=Rin, R2=R4=Rf)
```

### Integrator
```
Vout = -(1/RC) × ∫Vin dt
Use Rf (large, ~10×R) across C to prevent DC saturation
```

### Differentiator
```
Vout = -RC × dVin/dt
Add small R in series with C to limit HF gain
```

### Schmitt Trigger (Non-Inverting)
```
V_TH = Vout_high × R1/(R1+R2)    (rising threshold)
V_TL = Vout_low × R1/(R1+R2)     (falling threshold)
Hysteresis = V_TH - V_TL
```

### Recommended Op-Amps
| Part | Supply | GBW | Slew | Notes |
|------|--------|-----|------|-------|
| TL072 | ±5-18V | 3MHz | 13V/µs | Audio, low noise, JFET |
| LM358 | 3-32V | 1MHz | 0.3V/µs | Single supply, cheap |
| OPA2134 | ±2.5-18V | 8MHz | 20V/µs | Audio precision |
| MCP6002 | 1.8-6V | 1MHz | 0.6V/µs | Low power, rail-to-rail |
| LM4562 | ±2.5-17V | 55MHz | 20V/µs | Ultra-low noise audio |
| OPA1678 | ±2.25-18V | 8MHz | 5V/µs | Low noise, audio |
| NE5532 | ±3-22V | 10MHz | 9V/µs | Classic audio |

---

## Power Supply Design Patterns

### Linear Regulator (LM7805 / LM317)
```
LM7805 fixed 5V:
  Vin (≥7V) ──[7805]── 5V out
  Cin: 330nF ceramic (input)
  Cout: 100nF ceramic (output)
  Max current: 1.5A (with heatsink)
  Dropout: ~2V
  Power dissipation: P = (Vin-Vout) × Iload → needs heatsink!

LM317 adjustable:
  Vout = 1.25V × (1 + R2/R1)
  R1 = 240Ω (standard)
  R2 = R1 × (Vout/1.25 - 1)
  Iadj ≈ 50µA (flows through R2, usually negligible)
```

### Switching Regulators
```
Buck (step-down): Vin > Vout, high efficiency
  Common: LM2596, MP1584, TPS5430
  
Boost (step-up): Vin < Vout
  Common: MT3608, TPS61040

Buck-Boost: Vin can be above or below Vout
  Common: TPS63000 series

Key parameters:
  - Switching frequency (higher = smaller inductor, more EMI)
  - Inductor: L = Vout(1-D)/(fs×ΔI), D = Vout/Vin
  - Output cap: sized for ripple requirement
  - Input cap: sized for RMS ripple current
```

### Bipolar Supply from Single Rail
```
Virtual ground (op-amp):
  V+ rail ──[R]──┬──[R]── GND
                  │
              [op-amp buffer]── VGND
                  │
              [big cap]── GND

Charge pump (ICL7660 / LM2662):
  +V → -V converter
  For ±12V from +12V
```

### USB Power
```
USB 2.0: 5V, 500mA max (100mA before enumeration)
USB 3.0: 5V, 900mA
USB-C (default): 5V, 1.5A or 3A (with CC resistors)
USB-PD: 5/9/15/20V, up to 100W (needs PD controller IC)

CC resistors for 5V/1.5A sink: 5.1kΩ to GND on each CC pin
```

---

## Eurorack Module Design

See `references/eurorack-specs.md` for complete specifications.

### Quick Reference
```
Power: ±12V (regulated), +5V optional
Current budget: typically 30-50mA per rail for simple modules
Connector: 2×5 IDC (Doepfer standard) or 2×8 (with +5V/CV/Gate)
Panel: 3U height (128.5mm), width in HP (1 HP = 5.08mm)
  Common widths: 4HP, 8HP, 10HP, 12HP, 14HP, 16HP, 20HP
Panel mounting: M3 screws, rails at top/bottom
Depth: ≤ 25mm (skiff-friendly) to ~50mm (deep cases)

Signal levels:
  Audio: ±5V (10Vpp) typical
  CV: 0-5V or 0-10V (pitch), ±5V (modulation)
  Gate/Trigger: 0V (low) / +5V (high), >+2.5V = high
  1V/octave: 1V per octave pitch standard

Pitch CV: V = (note - 69) / 12 × 1V  (where note=MIDI note, 69=A4)

I/O: 3.5mm (⅛") mono jacks (Thonkiconn PJ398SM common)
Pots: 9mm Alpha pots, typically B10K-B100K (linear), A10K-A100K (log)
```

### Eurorack Power Supply Filtering
```
From bus:
+12V ──[10Ω]──┬──[47µF]──┬──[100nF]── +12V_filtered
               │           │
              GND         GND

-12V ──[10Ω]──┬──[47µF]──┬──[100nF]── -12V_filtered
               │           │
              GND         GND

Reverse polarity protection: use Schottky diodes (1N5817) or series ferrite beads
Power connector: keyed 2×5 IDC, pin 1 = -12V (red stripe)
```

### CV Input Circuit
```
             100kΩ
CV_in ──┤├──┬── to op-amp summing node
             │
           100kΩ (to set input impedance ~100kΩ)
             │
            GND
Add 1kΩ + clamp diodes to ±12V for protection
```

### Audio Output Circuit
```
                 1kΩ
Op-amp out ──┤├──┬── jack tip
                  │
                [100Ω to GND for DC path]
Output impedance: 1kΩ (standard for Eurorack)
```

---

## Arduino / ESP32 / Raspberry Pi Interfacing

### Arduino (ATmega328P / Uno)
```
Logic: 5V (3.3V for Due, Zero, etc.)
Digital I/O: source/sink 20mA per pin (40mA absolute max)
Total I/O current: ≤200mA across all pins
ADC: 10-bit, 0-5V, ~10kHz max sample rate
PWM: 490Hz (pins 5,6) or 976Hz (pins 3,9,10,11)
Serial: 1 UART, SPI, I2C
Supply: 7-12V (Vin), 5V (USB), 3.3V output (50mA max from regulator)
```

### ESP32
```
Logic: 3.3V (NOT 5V tolerant!)
GPIO current: 12mA source (safe), 20mA max per pin
ADC: 12-bit, 0-3.3V (non-linear, use calibration)
  ADC2 unavailable when WiFi active!
DAC: 2× 8-bit (GPIO25, GPIO26)
PWM: any GPIO, up to 40MHz resolution
WiFi + BLE built-in
Supply: 3.3V (min 500mA for WiFi bursts)
Level shifting needed for 5V devices: BSS138 MOSFET or TXS0108E
```

### Raspberry Pi GPIO
```
Logic: 3.3V (NOT 5V tolerant! Will damage GPIO)
GPIO current: 16mA max per pin, 50mA total for all GPIOs
No ADC (use MCP3008 SPI ADC for analog input)
PWM: hardware on GPIO12,13,18,19; software on any
Serial: 1 UART (GPIO14 TX, GPIO15 RX), SPI, I2C
Supply: 5V/2.5A+ (Pi 3), 5V/3A (Pi 4) via USB-C
Always use level shifter or voltage divider for 5V signals
```

### Level Shifting
```
5V → 3.3V: voltage divider (R1=10kΩ, R2=20kΩ) or dedicated IC
3.3V → 5V: BSS138 N-MOSFET with 10kΩ pullups to each rail
Bidirectional: TXS0108E, TXB0104 (auto-direction)
```

---

## Communication Interfaces

### I2C
```
Signals: SDA (data), SCL (clock) — open-drain with pullups
Pullups: 2.2kΩ-10kΩ to VCC (4.7kΩ typical)
  Short bus (<10cm): 4.7kΩ
  Long bus / fast mode: 2.2kΩ
  Low power: 10kΩ
Speed: 100kHz (standard), 400kHz (fast), 1MHz (fast-mode+), 3.4MHz (high-speed)
Addressing: 7-bit (128 devices, ~112 usable)
Bus capacitance: max 400pF
Max practical length: ~1m (with low capacitance cable, strong pullups)
```

### SPI
```
Signals: MOSI, MISO, SCLK, CS (active low)
Full duplex, no addressing (use CS per device)
Speed: up to 10-50MHz typical (device dependent)
Modes (CPOL, CPHA):
  Mode 0 (0,0): clock idle low, sample rising — most common
  Mode 1 (0,1): clock idle low, sample falling
  Mode 2 (1,0): clock idle high, sample falling
  Mode 3 (1,1): clock idle high, sample rising
No pullups needed. Point-to-point or daisy-chain.
Practical length: ~10-30cm at high speed
```

### UART
```
Signals: TX, RX (cross-connect: TX→RX, RX→TX)
Baud rates: 9600, 19200, 38400, 57600, 115200 (common)
Format: 8N1 (8 data, no parity, 1 stop) — most common
Logic levels: TTL (3.3V/5V) — NOT RS-232 (±12V)!
RS-232 adapter: MAX3232 (3.3V) or MAX232 (5V)
No clock signal — both sides must agree on baud rate
Max length (TTL): ~1m. RS-485 for long distances (1200m)
```

---

## PCB Design Rules of Thumb

### Trace Width (1oz copper, outer layer)
```
Current (A)  →  Min trace width (mil/mm)
0.5A             10 mil / 0.25mm
1.0A             20 mil / 0.50mm
2.0A             40 mil / 1.00mm
3.0A             60 mil / 1.50mm
5.0A            110 mil / 2.80mm

Formula (IPC-2221): W = (I / (k × ΔT^0.44))^(1/0.725) / thickness
  External: k = 0.048    Internal: k = 0.024
  ΔT = temperature rise in °C (10-20°C typical budget)
```

### Clearance
```
Voltage       Min clearance (PCB internal)
< 50V         6 mil / 0.15mm (typical minimum for manufacturing)
50-100V       10 mil / 0.25mm
100-300V      20 mil / 0.50mm
Mains (240V)  2.5mm+ (creepage/clearance per IPC/UL)

Default for hobby: 8 mil trace/space minimum (6 mil if fab supports)
```

### Via Sizing
```
Standard: 0.3mm drill / 0.6mm pad
Small: 0.2mm drill / 0.45mm pad
Current per via: ~0.5-1A (standard via)
Use multiple vias for high current paths
Thermal vias under power pads: 0.3mm drill, array pattern
```

### Layout Guidelines
```
1. Place decoupling caps FIRST — as close to IC power pins as possible
   - 100nF ceramic per power pin (mandatory)
   - 10µF bulk cap per IC or power section
   - Via directly to ground plane under cap

2. Ground plane — use solid ground pour on one layer minimum
   - Don't split ground plane unless you know why
   - Star ground only for mixed-signal (analog/digital separation)
   
3. Component placement order:
   Connectors → MCU/main IC → power → decoupling → passives

4. Keep analog and digital sections separate
   - Analog ground and digital ground meet at ONE point
   - Keep noisy signals (clocks, switching) away from analog

5. Return current path — current flows in loops
   - Signal trace return current flows directly under the trace on ground plane
   - Don't route signals across ground plane splits

6. Crystal/oscillator: keep traces SHORT, ground guard ring around crystal

7. Power traces: wide traces or copper pours, short paths

8. Thermal relief on ground plane pads for through-hole soldering

9. Silkscreen: mark pin 1, polarity, test points, version number

10. Design for manufacturing (DFM):
    - Min trace/space: check with your fab (usually 6-8 mil)
    - Min drill: 0.3mm standard, 0.2mm costs more
    - Board outline clearance: 0.5mm from edge to copper
    - Panelization: add fiducials and tooling holes for assembly
```

---

## Safety & Protection Circuits

### Reverse Polarity Protection
```
Method 1 — Series diode (simple, lossy):
  Vin ──|>|── circuit
  Loss: 0.3V (Schottky) to 0.7V (silicon)

Method 2 — P-MOSFET (low loss, recommended):
  Vin ──┤ S  G  D ├── circuit
         │  │
         └──┘  (gate to input, source to Vin)
  Use: IRLML6402 or similar logic-level P-FET
  Loss: Rdson × I² (millivolts typically)
```

### ESD Protection
```
TVS diodes on external-facing signals:
  Signal ──┤├── ESD_TVS ──┤── GND
  
Common parts: PRTR5V0U2X (USB), TPD2E001 (general)
Place TVS as close to connector as possible
Clamp voltage must be below IC max rated voltage
```

### Overcurrent Protection
```
Fuse: series with power input
  PTC (resettable): 0.1A-5A, resets after fault clears
  Standard fuse: blow once, more reliable for safety-critical

Current limiting IC: TPS2553 (USB), MAX14575 (general)

Current sense resistor + comparator:
  Rsense ── load
  Monitor Vsense = I × Rsense, trip at threshold
  Rsense: 0.1Ω-1Ω (low value = less voltage drop)
```

### Overvoltage Protection
```
Zener clamp: 
  Input ──[R]──┬── protected_signal
               │
            [Zener]
               │
              GND

TVS diode (faster than Zener):
  Input ──┬── protected_signal
          │
       [TVS bi]
          │
         GND
```

### Voltage Clamping (for analog inputs)
```
            R_series (1kΩ)
Signal ──┤├──┬── ADC_input
              │
           ┌──┤──┐
          D1     D2     (small signal diodes: 1N4148 or BAT54)
           │      │
          VCC    GND

Clamps signal to GND-0.3V to VCC+0.3V range
```

### Hot-Swap / Inrush Current Limiting
```
For large capacitive loads:
NTC thermistor in series (simple, self-heating limits ongoing loss)
Or: TPS2490/LTC4213 hot-swap controller
```

---

## Common Circuit Patterns

### Voltage Regulator (5V from 12V)
See `references/common-circuits.md` for full schematics.

### LED Driver
```
Single LED: R = (Vsupply - Vf) / If
  Vf typical: Red=1.8V, Green=2.2V, Blue/White=3.0V
  If typical: 20mA (standard), 2mA (minimum visible)

Constant current source (for high-power LEDs):
  LM317: Iout = 1.25V / Rset
  Rset = 1.25V / desired_current
  e.g., 350mA: Rset = 3.57Ω → 3.6Ω (E24)
```

### Oscillators
```
555 Timer (astable):
  f = 1.44 / ((R1 + 2×R2) × C)
  Duty cycle = (R1 + R2) / (R1 + 2×R2)
  For 50% duty: use diode across R2

Crystal oscillator:
  Load caps: CL = (C1 × C2)/(C1 + C2) + Cstray
  Cstray ≈ 3-5pF
  If crystal spec CL=18pF: C1 = C2 = 2×(18-5) = 26pF → use 27pF
```

### Motor Drivers
```
DC motor (small): 
  NPN transistor (TIP120) or N-MOSFET (IRLZ44N) + flyback diode
  Gate/base drive from MCU via resistor

H-Bridge: L298N (through-hole), DRV8871 (SMD), TB6612FNG
  Direction control: 2 inputs per motor
  PWM for speed control

Servo: PWM signal, 1-2ms pulse width, 50Hz (20ms period)
  1ms = full left, 1.5ms = center, 2ms = full right

Stepper: A4988, DRV8825, TMC2209 (silent)
  Microstepping: 1/16 (A4988), 1/32 (DRV8825), 1/256 (TMC2209)
```

### Relay Driver
```
MCU ──[1kΩ]── NPN base
               NPN collector ── relay coil ── VCC
               NPN emitter ── GND
Flyback diode (1N4148) across relay coil (cathode to VCC)
For >5V coils: use separate supply
Optocoupler (PC817) for isolation
```

---

## KiCAD Netlist Generation

When generating KiCAD netlists, use this format:

```kicad
(export (version D)
  (design
    (source "circuit.kicad_sch")
    (date "2026-02-15")
    (tool "circuit-designer skill"))
  (components
    (comp (ref R1)
      (value 10k)
      (footprint Resistor_SMD:R_0805_2012Metric)
      (libsource (lib Device) (part R) (description "Resistor")))
    (comp (ref C1)
      (value 100n)
      (footprint Capacitor_SMD:C_0805_2012Metric)
      (libsource (lib Device) (part C) (description "Capacitor")))
    ;; Add more components...
  )
  (nets
    (net (code 0) (name "GND")
      (node (ref R1) (pin 2))
      (node (ref C1) (pin 2)))
    (net (code 1) (name "VCC")
      (node (ref R1) (pin 1)))
    (net (code 2) (name "Net1")
      (node (ref C1) (pin 1)))
    ;; Add more nets...
  )
)
```

### Common Footprints
```
Resistors:  R_0402, R_0603, R_0805, R_1206 (SMD)
            R_Axial_DIN0207_L6.3mm (through-hole)
Caps:       C_0402, C_0603, C_0805, C_1206 (SMD ceramic)
            CP_Radial_D5.0mm_P2.50mm (electrolytic TH)
ICs:        SOIC-8, SOIC-14, SOIC-16, TSSOP-14, DIP-8, DIP-14
Connectors: PinHeader_1x0N_P2.54mm, PinHeader_2x05_P2.54mm (Eurorack)
Jacks:      Jack_3.5mm_QingPu_WQP-PJ398SM (Thonkiconn)
Pots:       Potentiometer_Alpha_RD901F-40-00D_9mm (Alpha 9mm)
```

---

## Design Checklist

Before finalizing any circuit:

- [ ] All ICs have decoupling caps (100nF minimum, close to pins)
- [ ] Power supply has bulk capacitance and input protection
- [ ] Unused op-amp inputs tied to appropriate rail (not floating)
- [ ] Unused CMOS inputs tied high or low (never floating!)
- [ ] Pull-up/down on reset pins, enable pins
- [ ] Flyback diodes on all inductive loads (relays, motors, solenoids)
- [ ] Current limiting on all LED circuits
- [ ] Input protection on external-facing connections
- [ ] Power dissipation calculated for regulators and power devices
- [ ] Thermal management for components dissipating >0.5W
- [ ] Test points on key signals
- [ ] Connector pinout clearly documented
- [ ] Values snapped to standard E-series
- [ ] Voltage ratings checked (caps rated ≥2× operating voltage)
