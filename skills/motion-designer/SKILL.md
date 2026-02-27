---
name: motion-designer
description: >-
  Animation and motion design for web/mobile UI. Generates CSS animations, GSAP/Framer Motion
  configs, micro-interactions, easing curves, stagger choreography, scroll-triggered animations,
  SVG path animations, and loading states. Use when asked to: create animations or transitions,
  design micro-interactions, configure easing/timing, build loading skeletons or shimmers,
  animate SVG paths, choreograph staggered reveals, set up scroll-triggered motion,
  or optimize animation performance.
---

# Motion Designer

Generate production-ready animations and motion design for web and mobile interfaces.

## Core Workflow

1. **Identify animation type** — What's moving? (element entrance, state change, loading, scroll-driven, decorative)
2. **Choose technology** — CSS (simple), GSAP (complex/sequenced), Framer Motion (React), Web Animations API
3. **Apply motion principles** — Use the 12 principles, pick appropriate easing and duration
4. **Ensure accessibility** — Always include `prefers-reduced-motion` handling
5. **Optimize performance** — Only animate transform/opacity; avoid layout triggers

## Output Format

Always provide:
- Complete, copy-paste-ready code
- `prefers-reduced-motion` media query variant
- Performance notes if relevant
- Duration/easing rationale

---

## The 12 Principles of Animation (Disney)

Apply these to UI motion:

1. **Squash & Stretch** — Elements compress on impact, stretch when moving fast. Use `scaleX`/`scaleY` for bouncy buttons, dropping items.
2. **Anticipation** — Small wind-up before main action. Button scales down slightly before bouncing up on click.
3. **Staging** — Direct attention. Dim surroundings when a modal appears; use motion to guide the eye.
4. **Straight Ahead / Pose to Pose** — CSS keyframes = pose to pose. Canvas/JS = straight ahead for particle effects.
5. **Follow Through & Overlapping** — Elements don't stop simultaneously. Stagger children; let trailing elements overshoot.
6. **Slow In / Slow Out** — Ease-in-out for most UI. Never use `linear` for element movement.
7. **Arcs** — Natural motion follows curves. Use `offset-path` or multi-point keyframes instead of straight lines.
8. **Secondary Action** — Supporting motion reinforces primary. Icon rotates while button scales.
9. **Timing** — Duration conveys weight and importance. See duration guidelines below.
10. **Exaggeration** — Overshoot/undershoot for personality. Spring physics for playful UIs.
11. **Solid Drawing** — Maintain consistent 3D perspective in transforms. Use `perspective` and `transform-style: preserve-3d`.
12. **Appeal** — Motion should feel good. Test on real devices; 60fps is the minimum.

---

## Duration Guidelines

| Animation Type | Duration | Rationale |
|---|---|---|
| Button/toggle state | 100–150ms | Instant feedback, no perceived delay |
| Tooltip/popover show | 150–200ms | Quick but visible |
| Fade in/out | 150–300ms | Opacity transitions feel slower |
| Slide/translate | 200–350ms | Needs time to read trajectory |
| Modal open | 250–350ms | Complex enough to need staging |
| Modal close | 200–250ms | Exits should be faster than entrances |
| Page transition | 300–500ms | Full context change needs breathing room |
| Collapse/expand | 200–400ms | Proportional to content height |
| Loading skeleton pulse | 1500–2500ms | Slow enough to feel ambient |
| Scroll-triggered reveal | 400–800ms | Leisurely, tied to scroll speed |
| Stagger delay between items | 50–100ms | Faster = wave, slower = cascade |
| Spring settle time | 400–800ms | Overshoots need time to resolve |
| Micro-interaction (like/heart) | 300–600ms | Playful, can be longer |

**Rules of thumb:**
- Exits are 20–30% faster than entrances
- Mobile animations should be ~30% shorter (smaller screens = less distance)
- Anything over 1s needs a reason (loading states, celebrations)
- Anything under 100ms is imperceptible — don't bother animating

---

## Easing Curve Reference

Load `references/easing-curves.md` for the complete library with cubic-bezier values and use cases.

### Quick Reference — Most Used

| Name | cubic-bezier | Use |
|---|---|---|
| `apple-ease` | (0.25, 0.1, 0.25, 1.0) | General Apple-style UI |
| `material-standard` | (0.2, 0.0, 0, 1.0) | Material Design default |
| `material-decelerate` | (0.0, 0.0, 0.2, 1.0) | Elements entering screen |
| `material-accelerate` | (0.4, 0.0, 1, 1.0) | Elements leaving screen |
| `ease-out-expo` | (0.16, 1, 0.3, 1) | Snappy entrance |
| `ease-out-back` | (0.34, 1.56, 0.64, 1) | Overshoot entrance |
| `ease-in-out-quint` | (0.83, 0, 0.17, 1) | Smooth page transitions |
| `spring-gentle` | (0.34, 1.2, 0.64, 1) | Subtle bounce |
| `bounce` | Use keyframes | Multi-bounce landing |

---

## Performance Best Practices

### Only Animate Composite Properties
```css
/* ✅ GPU-composited — cheap */
transform: translateX() translateY() scale() rotate();
opacity: 0..1;
filter: blur();

/* ❌ Triggers layout — expensive */
width, height, top, left, margin, padding, border
font-size, line-height
```

### Enable GPU Compositing
```css
.animated-element {
  will-change: transform, opacity;    /* Hint to browser */
  transform: translateZ(0);           /* Force own layer (fallback) */
  backface-visibility: hidden;        /* Prevent flicker */
  contain: layout style paint;        /* Isolate repaints */
}
```

### Performance Rules
- **`will-change`**: Add before animation starts, remove after. Don't set on everything.
- **Avoid animating `box-shadow`**: Animate `opacity` of a pseudo-element shadow instead.
- **Avoid animating `border-radius`** on large elements: Use `clip-path` or pre-rounded shapes.
- **`transform` vs `top/left`**: Transform is ~10x cheaper. Always prefer it.
- **Batch DOM reads/writes**: Use `requestAnimationFrame` for JS animations.
- **Use `content-visibility: auto`** for off-screen animated elements.
- **Test on low-end devices**: Throttle CPU 4x in DevTools.

---

## Accessibility — prefers-reduced-motion

**Every animation must have a reduced-motion fallback.**

```css
/* Full animation */
.element {
  animation: slideIn 400ms ease-out-expo forwards;
}

/* Reduced: instant or subtle fade */
@media (prefers-reduced-motion: reduce) {
  .element {
    animation: fadeIn 200ms ease forwards;
    /* OR */
    animation: none;
    opacity: 1;
  }
}
```

### JavaScript Detection
```js
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Framer Motion
<motion.div
  animate={{ x: 0 }}
  transition={prefersReduced ? { duration: 0 } : { type: "spring" }}
/>

// GSAP
if (!prefersReduced) {
  gsap.from('.item', { y: 50, opacity: 0, stagger: 0.1 });
} else {
  gsap.set('.item', { opacity: 1 });
}
```

### What to Reduce
- Remove decorative motion (parallax, floating elements)
- Replace slides/bounces with simple fades or instant appearance
- Keep functional motion (progress bars, loading indicators) but simplify
- Reduce stagger to 0 or near-0

---

## Platform-Specific Notes

### iOS / Apple
- **Spring physics** are the native model: `mass`, `stiffness`, `damping`
- Framer Motion: `type: "spring", stiffness: 300, damping: 24`
- iOS default spring ≈ `cubic-bezier(0.25, 0.1, 0.25, 1.0)` with overshoot
- Use `apple-ease` for non-spring CSS animations
- Avoid `bounce` — iOS prefers elegant springs over cartoon bounce
- Haptic feedback pairs with animation endpoints

### Android / Material Design
- **Emphasized easing** for large transitions: `(0.2, 0, 0, 1)`
- **Standard easing** for small changes: `(0.2, 0, 0, 1)`
- Material motion patterns: **Container transform**, **Shared axis**, **Fade through**, **Fade**
- Duration tokens: short1=50ms, short2=100ms, medium1=250ms, medium2=400ms, long1=450ms, long2=700ms
- Use `MDCAnimationTimingFunction` tokens on native

### Web General
- Target 60fps; use `will-change` sparingly
- Prefer CSS for simple animations, JS (GSAP/Web Animations API) for complex sequences
- CSS `@starting-style` for entry animations (modern browsers)
- View Transitions API for page-level transitions

---

## Common Animation Patterns

### Fade In Up (Entry)
```css
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.enter { animation: fadeInUp 400ms cubic-bezier(0.16, 1, 0.3, 1) forwards; }
```

### Scale Button Press
```css
.button {
  transition: transform 150ms cubic-bezier(0.25, 0.1, 0.25, 1);
}
.button:active {
  transform: scale(0.95);
}
.button:hover {
  transform: scale(1.02);
}
```

### Modal Entrance
```css
@keyframes modalIn {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(10px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}
.modal {
  animation: modalIn 300ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}
.modal-backdrop {
  animation: fadeIn 200ms ease forwards;
}
```

### Stagger Reveal (CSS)
```css
.stagger-item {
  opacity: 0;
  animation: fadeInUp 400ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
.stagger-item:nth-child(1) { animation-delay: 0ms; }
.stagger-item:nth-child(2) { animation-delay: 60ms; }
.stagger-item:nth-child(3) { animation-delay: 120ms; }
/* ... */
```

### Stagger Reveal (GSAP)
```js
gsap.from('.item', {
  y: 30,
  opacity: 0,
  duration: 0.5,
  ease: 'power3.out',
  stagger: {
    amount: 0.4,       // Total stagger time
    from: 'start',     // 'start' | 'end' | 'center' | 'edges' | 'random'
    grid: 'auto',      // For grid layouts
    axis: 'y',         // Stagger by row
  }
});
```

### Page Transition (Framer Motion)
```jsx
<AnimatePresence mode="wait">
  <motion.div
    key={pathname}
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -8 }}
    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
  >
    {children}
  </motion.div>
</AnimatePresence>
```

### Scroll-Triggered Reveal
```js
// GSAP + ScrollTrigger
gsap.from('.section', {
  scrollTrigger: {
    trigger: '.section',
    start: 'top 80%',
    end: 'top 20%',
    toggleActions: 'play none none reverse',
  },
  y: 60,
  opacity: 0,
  duration: 0.8,
  ease: 'power2.out',
});

// CSS-only (Intersection Observer)
const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) e.target.classList.add('visible');
  });
}, { threshold: 0.2 });
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
```

### SVG Line Draw
```css
.svg-path {
  stroke-dasharray: 1000;    /* >= path length */
  stroke-dashoffset: 1000;
  animation: draw 2s ease-in-out forwards;
}
@keyframes draw {
  to { stroke-dashoffset: 0; }
}
```
```js
// Get exact length
const length = document.querySelector('path').getTotalLength();
```

### SVG Morph (GSAP)
```js
gsap.to('#shape', {
  morphSVG: '#targetShape',
  duration: 0.8,
  ease: 'power2.inOut',
});
```

---

## Loading State Patterns

### Skeleton Screen
```css
.skeleton {
  background: linear-gradient(90deg,
    #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.8s ease-in-out infinite;
  border-radius: 4px;
}
@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* Dark mode */
.dark .skeleton {
  background: linear-gradient(90deg,
    #2a2a2a 25%, #3a3a3a 50%, #2a2a2a 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.8s ease-in-out infinite;
}
```

### Pulse Loading
```css
.pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}
```

### Progressive Blur (Content Loading)
```css
.loading-content {
  filter: blur(8px);
  transition: filter 600ms ease-out;
}
.loading-content.loaded {
  filter: blur(0);
}
```

### Spinner
```css
.spinner {
  width: 24px; height: 24px;
  border: 2.5px solid #e0e0e0;
  border-top-color: #333;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
```

### Skeleton Composition
```html
<!-- Card skeleton -->
<div class="skeleton-card">
  <div class="skeleton" style="width:100%;height:180px;border-radius:8px"></div>
  <div class="skeleton" style="width:70%;height:16px;margin-top:12px"></div>
  <div class="skeleton" style="width:100%;height:12px;margin-top:8px"></div>
  <div class="skeleton" style="width:90%;height:12px;margin-top:4px"></div>
</div>
```

---

## Stagger Choreography Patterns

### Cascade (Top to Bottom)
```js
gsap.from('.item', { y: 30, opacity: 0, stagger: 0.08, ease: 'power3.out' });
```

### Wave (Sine-based delay)
```js
items.forEach((el, i) => {
  const delay = Math.sin(i * 0.3) * 0.15 + i * 0.05;
  gsap.from(el, { y: 20, opacity: 0, delay, duration: 0.5 });
});
```

### Radial (From center outward)
```js
gsap.from('.grid-item', {
  scale: 0, opacity: 0, duration: 0.5, ease: 'back.out(1.7)',
  stagger: { from: 'center', grid: [rows, cols], amount: 0.6 }
});
```

### Random
```js
gsap.from('.item', {
  y: 30, opacity: 0, duration: 0.4,
  stagger: { amount: 0.5, from: 'random' }
});
```

### Edges Inward
```js
gsap.from('.item', {
  scale: 0.8, opacity: 0, duration: 0.5,
  stagger: { from: 'edges', amount: 0.4 }
});
```
