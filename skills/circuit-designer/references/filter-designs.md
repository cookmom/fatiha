# Filter Design Reference

## Passive Filters

### 1st-Order RC Low-Pass
```
fc = 1 / (2π·R·C)
Attenuation: -20 dB/decade above fc
Phase at fc: -45°

Design procedure:
1. Choose fc
2. Pick C (common value: 100nF for audio, 100pF for RF)
3. R = 1 / (2π·fc·C)

Example: fc = 1kHz
  C = 100nF → R = 1.59kΩ → use 1.5kΩ (E24) → fc = 1.06kHz
```

### 1st-Order RC High-Pass
```
Same formula: fc = 1 / (2π·R·C)
C in series, R to ground (swap positions vs LP)

Example: audio DC blocking
  fc = 20Hz, R = 100kΩ → C = 79.6nF → use 100nF → fc = 15.9Hz
```

### 2nd-Order LC Low-Pass
```
fc = 1 / (2π·√(L·C))
Attenuation: -40 dB/decade
Characteristic impedance: Z0 = √(L/C)

Butterworth: source and load impedance must match Z0
  L in series, C in shunt

Example: fc = 10kHz, Z0 = 600Ω
  L = Z0/(2π·fc) = 9.55mH → use 10mH
  C = 1/(2π·fc·Z0) = 26.5nF → use 27nF
```

### LC Pi Filter (power supply)
```
Better for power supply filtering than single LC.

Vin ──┬──[C1]──[L]──┬──[C2]── Vout
      │              │
     GND            GND

C1 = C2 = 100µF-1000µF (electrolytic)
L = 10µH-100µH (power inductor, rated for DC current)

Resonant frequency: fc = 1 / (2π·√(L·C))
Keep fc well below switching frequency (10× lower ideal)
```

## Active Filters

### Sallen-Key Low-Pass (2nd Order, Unity Gain)
```
         R1         R2
Vin ──┤├──┬──┤├──┬──[+]── Vout
          │       │  opamp  │
         [C1]    [C2]      │
          │       │    [-]──┘
         GND     GND

Equal component (Butterworth, Q=0.707):
  R1 = R2 = R
  C2 = 2·C1
  fc = 1 / (2π·R·√(2·C1²)) = 1 / (2π·R·C1·√2)

Design steps:
1. Choose C1 (standard value)
2. R = 1 / (2π·fc·C1·√2)
3. C2 = 2·C1

Example: fc = 1kHz
  C1 = 10nF, C2 = 22nF (close to 2×10nF)
  R = 1/(2π·1000·10e-9·1.414) = 11.25kΩ → use 11kΩ (E96) or 10kΩ (E12)
```

### Sallen-Key High-Pass (2nd Order)
```
Swap R and C from LP topology:
         C1         C2
Vin ──||──┬──||──┬──[+]── Vout
          │      │  opamp  │
         [R1]   [R2]      │
          │      │    [-]──┘
         GND    GND

Same formulas, same fc calculation.
```

### Multiple Feedback (MFB) Low-Pass
```
Higher Q capability than Sallen-Key.
Inverts signal.

        R1        C1
Vin ──┤├──┬──||──┬── [-]── opamp ── Vout
          │      │              │
         [R3]   [C2]          [R2]
          │      │              │
         GND    GND         Vin side (R1 junction)

Gain = -R2/R1
fc = 1/(2π) × √(1/(R2·R3·C1·C2))
Q = π·fc·C1·R2 (approximately)
```

### State Variable Filter
```
Provides simultaneous LP, HP, BP outputs.

Input → summing amp → integrator1 (HP→BP) → integrator2 (BP→LP)
                ↑                                    │
                └────────── feedback ────────────────┘

3 op-amps required.
fc = 1 / (2π·R·C)  (for the integrators, R and C equal)
Q = 1 + Rf/Rq  (set by feedback resistor ratio)

Common implementation: use matched resistors and caps.
Variable fc: use dual-gang pot for both integrator Rs.
Variable Q: single pot in feedback path.
```

### Voltage-Controlled Filter (VCF) for Eurorack
```
OTA-based (LM13700):
  Input → OTA (gm controlled by Iabc) → integrator → output
  fc proportional to Iabc
  Iabc controlled exponentially by CV:
    Iabc = Iref × exp(Vcv / Vt)
    Vt = kT/q ≈ 26mV at 25°C

Exponential converter needed for 1V/octave tracking.
Temperature compensation: use matched transistor pair (e.g., THAT340)

4-pole (24dB/oct, Moog-style):
  Cascade 4 OTA integrators with feedback from output to input.
  Self-oscillates when feedback gain = 1 (resonance).
```

## Filter Response Types

### Butterworth (maximally flat magnitude)
```
Q values per stage for cascaded 2nd-order sections:
  2nd order: Q = 0.7071
  4th order: Q1 = 0.5412, Q2 = 1.3066
  6th order: Q1 = 0.5177, Q2 = 0.7071, Q3 = 1.9319
  8th order: Q1 = 0.5098, Q2 = 0.6013, Q3 = 0.8999, Q4 = 2.5628
```

### Bessel (maximally flat group delay)
```
Best for preserving waveform shape. Gentle roll-off.
  2nd order: Q = 0.5774
  4th order: Q1 = 0.5219, Q2 = 0.8055
```

### Chebyshev Type I (ripple in passband)
```
Steeper roll-off than Butterworth, but has passband ripple.
0.5dB ripple, 2nd order: Q = 0.8637
1dB ripple, 2nd order: Q = 0.9565
3dB ripple, 2nd order: Q = 1.3049
```

## Practical Notes

- **Component tolerance matters**: use 1% resistors (E96) and C0G/NP0 caps for filters
- **Op-amp GBW**: must be ≥100× fc for accurate response
- **Parasitic capacitance**: affects filters above ~100kHz; keep traces short
- **Audio crossover filters**: use Linkwitz-Riley (LR4) = two cascaded Butterworth at same fc
  - LR4 (4th order): -6dB at crossover, flat power sum
