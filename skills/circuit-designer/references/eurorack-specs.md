# Eurorack Specifications

## Doepfer A-100 Bus Standard

### Power Connector (2×5 IDC, shrouded)
```
Pin layout (looking at module PCB header, keyed):

        -12V  ●  ●  -12V       (Pin 1,2 — red stripe side)
         GND  ●  ●  GND        (Pin 3,4)
         GND  ●  ●  GND        (Pin 5,6)
        +12V  ●  ●  +12V       (Pin 7,8)
        +12V  ●  ●  +12V       (Pin 9,10)
```

### Extended Bus (2×8 IDC)
```
Additional pins beyond 2×5:
        +5V   ●  ●  +5V        (Pin 11,12)
         CV   ●  ●  CV         (Pin 13,14)  — bus CV (rarely used)
       GATE   ●  ●  GATE       (Pin 15,16)  — bus gate (rarely used)
```

### Power Specifications
| Rail | Voltage | Tolerance | Typical module current |
|------|---------|-----------|----------------------|
| +12V | +12V DC | ±5% (11.4-12.6V) | 20-80mA typical |
| -12V | -12V DC | ±5% (-11.4 to -12.6V) | 10-40mA typical |
| +5V | +5V DC | ±5% | 0-50mA (optional, not always available) |

### Case Power Budgets (typical)
- Small (84HP): ±12V @ 1.2A, +5V @ 1A
- Medium (2×104HP): ±12V @ 2A, +5V @ 2A
- Large (2×168HP): ±12V @ 4A, +5V @ 3A

## Mechanical

### Panel Dimensions
```
Height: 3U = 128.5mm (5.059")
Width: measured in HP (Horizontal Pitch)
  1 HP = 5.08mm (0.2")
  Common widths:
    2HP  = 10.16mm    (attenuators, mults)
    4HP  = 20.32mm    (utilities)
    6HP  = 30.48mm    
    8HP  = 40.64mm    (VCAs, mixers)
    10HP = 50.80mm    (filters, oscillators)
    12HP = 60.96mm    (larger modules)
    14HP = 71.12mm
    16HP = 81.28mm    (complex modules)
    20HP = 101.60mm   (large modules)
    28HP = 142.24mm   (big sequencers)

Panel thickness: 2mm aluminum (typical DIY)
Material: aluminum (anodized), steel, PCB panel, acrylic
```

### Mounting Holes
```
M3 screws (or M2.5 in some systems)
Hole diameter: 3.2mm
Position: centered 3mm from top/bottom panel edge
Horizontal positions (from left edge):
  1HP module: 7.5mm
  >1HP module: 7.5mm from each edge
Rail slot height: top rail center at ~3mm from top, bottom rail at ~3mm from bottom
```

### Depth (behind panel)
```
Skiff-friendly: ≤ 25mm
Standard: 25-40mm
Deep: 40-55mm
Note: include power cable bend radius (~10mm)
```

## Signal Standards

### Audio Signals
```
Level: ±5V typical (10Vpp)
Impedance: 1kΩ output, 100kΩ input
AC coupled for audio (10µF series cap for >1.6Hz with 100kΩ)
DC coupled for CV and audio (Eurorack standard)
```

### Control Voltage (CV)
```
Pitch (1V/octave):
  0V = C0 (lowest), each +1V = one octave up
  Typical range: 0-10V (10 octaves)
  Accuracy needed: ±1mV for good tuning (<2 cents)
  
  Voltage for MIDI note N: V = (N - 24) / 12
  MIDI 60 (C4): (60-24)/12 = 3.0V
  
Modulation CV:
  Unipolar: 0V to +5V or 0V to +10V
  Bipolar: -5V to +5V
  
LFO output: typically ±5V
Envelope output: typically 0-8V
```

### Gate & Trigger
```
Gate:
  Low: 0V
  High: +5V (some modules output +8V or +10V)
  Threshold: >+2.5V considered HIGH (design for >+1.5V for compatibility)
  Duration: variable (note on → note off)

Trigger:
  Short pulse, typically 1-10ms at +5V
  Used for: clock, reset, accent
```

## Common Module Circuits

### Input Buffer (for jacks)
```
Use voltage follower op-amp behind each input jack
Add 100kΩ pull-down if normalled connection expected
Normalling: use switched jacks (Thonkiconn tip-switch)
```

### Output Driver
```
1kΩ series resistor on output (short-circuit protection + impedance)
Op-amp should handle ±10V swing → needs ±12V supply
Choose op-amp with >10V/µs slew rate for audio
```

### Potentiometer Wiring
```
Attenuator (unipolar):
  Signal → pot pin 3 (CW)
  Pot pin 1 (CCW) → GND
  Pot wiper (pin 2) → output

Attenuverter (bipolar):
  Signal → pot pin 3 (CW)
  -Signal (inverted) → pot pin 1 (CCW)
  Pot wiper → output
  Center position = zero output

CV + pot (manual + CV control):
  Use summing amplifier:
  Vout = -(Rf/R) × (Vpot + Vcv)
```
