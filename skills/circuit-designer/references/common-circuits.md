# Common Circuit Reference

## Voltage Regulators

### 5V from 12V (Linear - LM7805)
```
12V ──[1N5817]──┬──[330nF]──┬──[LM7805]──┬──[100nF]──┬── 5V out
                │            │   IN  OUT   │           │
               GND          GND   GND     [10µF]     GND
                                   │       │
                                  GND     GND

Heat dissipation at 500mA: (12-5) × 0.5 = 3.5W → needs heatsink!
TO-220 heatsink: ~10°C/W → 35°C rise
```

### 3.3V from 5V (LDO - AMS1117-3.3)
```
5V ──┬──[10µF]──┬──[AMS1117-3.3]──┬──[22µF]──┬── 3.3V
     │          │    IN     OUT    │          │
    GND        GND    GND        GND        GND

Dropout: ~1.1V (need Vin ≥ 4.4V)
Max current: 1A
```

### Adjustable Regulator (LM317)
```
Vin ──┬──[Cin]──[LM317 IN→OUT]──┬──[R1=240Ω]──┬──[Cout]── Vout
      │          ADJ             │              │
     GND          │             [R2]           GND
                  └──────────────┘
                        │
                       GND

Vout = 1.25 × (1 + R2/R1) + Iadj×R2
Iadj ≈ 50µA (negligible)

Example outputs:
  5V:  R2 = 720Ω  → use 750Ω (E24)
  9V:  R2 = 1488Ω → use 1.5kΩ
  12V: R2 = 2064Ω → use 2kΩ (or 2.2kΩ = 12.7V)
```

## Audio Circuits

### Simple Mixer (Inverting Summing)
```
In1 ──[100kΩ]──┐
In2 ──[100kΩ]──┤
In3 ──[100kΩ]──┤──[V-]──opamp──Vout
                    │         │
                   [100kΩ Rf] │
                    └─────────┘
                   [V+]──GND

Gain per input: -Rf/Rin = -1 (unity)
Add pot on each input for level control
```

### Headphone Amplifier (simple)
```
Audio ──[10kΩ pot]──[1µF]──[V+]──opamp──[100Ω]──┬── headphone jack
                           [V-]──┐               │
                                 [Rf=10kΩ]       │
                                 └────────────────┘
                          GND ──[Rg=10kΩ]──[V-]

Gain: 1 + Rf/Rg = 2
100Ω output resistor protects op-amp
Use OPA2134 or NE5532
```

## Sensor Circuits

### Voltage Divider Sensor (NTC Thermistor, LDR, FSR)
```
VCC ──[Rfixed]──┬──[Rsensor]── GND
                │
            ADC input

For NTC (10kΩ at 25°C): Rfixed = 10kΩ
For LDR: Rfixed = 10kΩ (adjust for range)
Add 100nF cap from ADC to GND for noise filtering
```

### Current Sense (INA219 I2C)
```
Power ──[Rshunt 0.1Ω]──┬── Load
                         │
        INA219 IN+ ──────┘
        INA219 IN- ────── (other side of shunt)
        SDA, SCL with 4.7kΩ pullups
        
Resolution: 0.1mA with 0.1Ω shunt
Max current: ±3.2A (with default gain)
```

## Timing Circuits

### 555 Astable Oscillator
```
VCC ──┬──[R1]──┬──[R2]──┬── GND
      │        │        │
      │     DISCH    THRESH/TRIG
      │     (pin7)   (pin6/pin2)
      │        │        │
      │     [555]    [C]
      │        │        │
      │      OUT      GND
      │     (pin3)
      │        │
      ├────── VCC (pin8)
      │
    [100nF]── CTRL (pin5) ── GND (via 10nF)
    GND ────── GND (pin1)

f = 1.44 / ((R1 + 2×R2) × C)
tH = 0.693 × (R1+R2) × C
tL = 0.693 × R2 × C

Example 1kHz: R1=1kΩ, R2=6.8kΩ, C=100nF → f=986Hz
```

### 555 Monostable (One-Shot)
```
Trigger (falling edge) → pin 2
Output pulse width: t = 1.1 × R × C

Example 100ms pulse: R=91kΩ, C=1µF
```

## Protection Circuits

### Crowbar Overvoltage Protection
```
Vin ──[Fuse]──┬── Load
              │
           [SCR Anode]
              │
           [SCR Cathode]── GND
              
[SCR Gate] ←── [Zener + R divider]

When Vin exceeds Zener voltage, SCR fires → blows fuse
Use for catastrophic overvoltage protection
```

### Soft Start
```
Vin ──[P-FET]──── Load
        │
       Gate ──[100kΩ]── Vin
        │
       [10µF]── GND

FET turns on slowly as cap charges through 100kΩ
τ = 100kΩ × 10µF = 1 second
Limits inrush current to capacitive loads
```

## Signal Conditioning

### Instrumentation Amplifier (INA128)
```
Signal+ ──── IN+  ┐
Signal- ──── IN-  ├── INA128 ── Vout
  REF ──── REF    ┘
  
  RG between pins 1 and 8
  
Gain = 1 + 50kΩ/RG
  G=10: RG = 5.56kΩ → 5.6kΩ
  G=100: RG = 505Ω → 510Ω
  G=1000: RG = 50.05Ω → 49.9Ω

CMRR: >100dB at G=100
Use for: strain gauges, thermocouples, Wheatstone bridges
```

### Anti-Aliasing Filter (before ADC)
```
2nd-order Sallen-Key LP at fs/2 (Nyquist)

Example: 10kHz sample rate → fc = 5kHz
R1 = R2 = 22kΩ, C1 = 680pF, C2 = 1.5nF
→ fc ≈ 4.95kHz, Butterworth response
```
