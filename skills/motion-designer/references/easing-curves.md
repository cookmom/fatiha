# Easing Curve Library

Complete reference of named easing curves with `cubic-bezier()` values.

## Standard CSS Keywords

| Name | cubic-bezier | Notes |
|---|---|---|
| `linear` | (0, 0, 1, 1) | No easing. Only for rotation/progress bars |
| `ease` | (0.25, 0.1, 0.25, 1.0) | CSS default, decent general purpose |
| `ease-in` | (0.42, 0, 1, 1) | Accelerating. For exits |
| `ease-out` | (0, 0, 0.58, 1) | Decelerating. For entrances |
| `ease-in-out` | (0.42, 0, 0.58, 1) | Symmetric. For state changes |

## Platform Curves

| Name | cubic-bezier | Platform |
|---|---|---|
| `apple-ease` | (0.25, 0.1, 0.25, 1.0) | iOS/macOS general |
| `apple-spring` | (0.34, 1.3, 0.64, 1) | iOS spring approximation |
| `apple-bounce` | (0.34, 1.56, 0.64, 1) | iOS bouncy spring |
| `material-standard` | (0.2, 0, 0, 1) | Material 3 standard |
| `material-decelerate` | (0, 0, 0.2, 1) | Material entering |
| `material-accelerate` | (0.4, 0, 1, 1) | Material exiting |
| `material-emphasized` | (0.2, 0, 0, 1) | Material large transitions |
| `fluent-accelerate` | (0.9, 0.1, 1, 0.2) | Microsoft Fluent |
| `fluent-decelerate` | (0.1, 0.9, 0.2, 1) | Microsoft Fluent |
| `fluent-standard` | (0.8, 0, 0.2, 1) | Microsoft Fluent |

## Power / Polynomial

| Name | cubic-bezier | Character |
|---|---|---|
| `ease-in-quad` | (0.55, 0.085, 0.68, 0.53) | Gentle acceleration |
| `ease-out-quad` | (0.25, 0.46, 0.45, 0.94) | Gentle deceleration |
| `ease-in-out-quad` | (0.455, 0.03, 0.515, 0.955) | Gentle symmetric |
| `ease-in-cubic` | (0.55, 0.055, 0.675, 0.19) | Medium acceleration |
| `ease-out-cubic` | (0.215, 0.61, 0.355, 1) | Medium deceleration |
| `ease-in-out-cubic` | (0.645, 0.045, 0.355, 1) | Medium symmetric |
| `ease-in-quart` | (0.895, 0.03, 0.685, 0.22) | Strong acceleration |
| `ease-out-quart` | (0.165, 0.84, 0.44, 1) | Strong deceleration |
| `ease-in-out-quart` | (0.77, 0, 0.175, 1) | Strong symmetric |
| `ease-in-quint` | (0.755, 0.05, 0.855, 0.06) | Very strong acceleration |
| `ease-out-quint` | (0.23, 1, 0.32, 1) | Very strong deceleration |
| `ease-in-out-quint` | (0.83, 0, 0.17, 1) | Very strong symmetric |

## Exponential & Circular

| Name | cubic-bezier | Character |
|---|---|---|
| `ease-in-expo` | (0.95, 0.05, 0.795, 0.035) | Sharp acceleration |
| `ease-out-expo` | (0.16, 1, 0.3, 1) | Snappy stop — great for entrances |
| `ease-in-out-expo` | (0.87, 0, 0.13, 1) | Dramatic symmetric |
| `ease-in-circ` | (0.6, 0.04, 0.98, 0.335) | Circular acceleration |
| `ease-out-circ` | (0.075, 0.82, 0.165, 1) | Circular deceleration |
| `ease-in-out-circ` | (0.785, 0.135, 0.15, 0.86) | Circular symmetric |

## Back (Overshoot)

| Name | cubic-bezier | Character |
|---|---|---|
| `ease-in-back` | (0.6, -0.28, 0.735, 0.045) | Pull back then go |
| `ease-out-back` | (0.34, 1.56, 0.64, 1) | Overshoot then settle |
| `ease-in-out-back` | (0.68, -0.55, 0.265, 1.55) | Pull back, overshoot, settle |
| `ease-out-back-gentle` | (0.34, 1.2, 0.64, 1) | Subtle overshoot |
| `ease-out-back-strong` | (0.34, 1.8, 0.64, 1) | Pronounced overshoot |

## Spring Approximations

| Name | cubic-bezier | Character |
|---|---|---|
| `spring-gentle` | (0.34, 1.2, 0.64, 1) | Soft spring, minimal overshoot |
| `spring-medium` | (0.34, 1.4, 0.64, 1) | Balanced spring |
| `spring-bouncy` | (0.34, 1.56, 0.64, 1) | Noticeable bounce |
| `spring-snappy` | (0.16, 1.1, 0.3, 1) | Quick spring, fast settle |
| `spring-wobbly` | (0.34, 1.8, 0.64, 1) | Exaggerated overshoot |

> **Note:** True spring physics (damped harmonic oscillator) can't be perfectly represented by cubic-bezier. For real springs, use Framer Motion `type: "spring"` or GSAP CustomEase with multiple bounces.

## Framer Motion Spring Presets

```js
// Gentle
{ type: "spring", stiffness: 120, damping: 20, mass: 1 }

// Snappy
{ type: "spring", stiffness: 400, damping: 30, mass: 1 }

// Bouncy
{ type: "spring", stiffness: 300, damping: 10, mass: 1 }

// Heavy
{ type: "spring", stiffness: 200, damping: 25, mass: 2 }

// Quick settle
{ type: "spring", stiffness: 500, damping: 35, mass: 0.8 }
```

## GSAP Ease Equivalents

| CSS Name | GSAP |
|---|---|
| `ease-out-expo` | `power4.out` or `expo.out` |
| `ease-out-cubic` | `power2.out` |
| `ease-out-quart` | `power3.out` |
| `ease-out-back` | `back.out(1.7)` |
| `ease-in-out-quint` | `power4.inOut` |
| `ease-out-circ` | `circ.out` |

## Choosing the Right Curve

| Scenario | Recommended Curve |
|---|---|
| Button press/release | `apple-ease` or `ease-out-cubic` |
| Element entering screen | `ease-out-expo` or `material-decelerate` |
| Element leaving screen | `ease-in-cubic` or `material-accelerate` |
| Modal/dialog open | `ease-out-back` (subtle overshoot) |
| Modal/dialog close | `ease-in-cubic` (no overshoot) |
| Page transition | `ease-in-out-quint` |
| Toggle/switch | `spring-gentle` |
| Playful interaction | `spring-bouncy` |
| Dropdown expand | `ease-out-quart` |
| Collapse/accordion | `ease-in-out-cubic` |
| Scroll-triggered reveal | `ease-out-expo` |
| Hover effect | `ease-out-quad` (fast, subtle) |
| Loading spinner | `linear` (constant rotation) |
| Progress bar | `ease-in-out-cubic` |
