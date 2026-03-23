// ============================================================
// OttomanFlower — polygon-based flower library for p5.brush
// Extracted from watercolor-variations.html
// Each method returns arrays of [x,y] points for brush.polygon()
// ============================================================

class OttomanFlower {

  // ── Petal polygon constructors ──

  // Standard rose petal: broad rounded shape with curvature
  static makePetalPoly(baseX, baseY, angle, length, width, curvature) {
    const pts = [];
    const n = 24;
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      let w;
      if (t < 0.08) w = t / 0.08 * 0.2;
      else if (t < 0.3) w = 0.2 + (t - 0.08) / 0.22 * 0.8;
      else if (t < 0.75) w = 1.0;
      else w = Math.cos((t - 0.75) / 0.25 * Math.PI * 0.5);
      const along = t * length;
      const across = w * width * 0.5;
      const curveOffset = curvature * Math.sin(t * Math.PI) * length * 0.08;
      const x = baseX + along * Math.cos(angle) - (across + curveOffset) * Math.sin(angle);
      const y = baseY + along * Math.sin(angle) + (across + curveOffset) * Math.cos(angle);
      pts.push([x, y]);
    }
    for (let i = n; i >= 0; i--) {
      const t = i / n;
      let w;
      if (t < 0.08) w = t / 0.08 * 0.2;
      else if (t < 0.3) w = 0.2 + (t - 0.08) / 0.22 * 0.8;
      else if (t < 0.75) w = 1.0;
      else w = Math.cos((t - 0.75) / 0.25 * Math.PI * 0.5);
      const along = t * length;
      const across = -w * width * 0.5;
      const curveOffset = curvature * Math.sin(t * Math.PI) * length * 0.08;
      const x = baseX + along * Math.cos(angle) - (across + curveOffset) * Math.sin(angle);
      const y = baseY + along * Math.sin(angle) + (across + curveOffset) * Math.cos(angle);
      pts.push([x, y]);
    }
    return pts;
  }

  // Narrow bud petal: tighter, more pointed
  static makeBudPetalPoly(baseX, baseY, angle, length, width, curvature) {
    const pts = [];
    const n = 24;
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      let w;
      if (t < 0.1) w = t / 0.1 * 0.15;
      else if (t < 0.4) w = 0.15 + (t - 0.1) / 0.3 * 0.85;
      else if (t < 0.6) w = 1.0;
      else w = Math.cos((t - 0.6) / 0.4 * Math.PI * 0.5);
      const along = t * length;
      const across = w * width * 0.5;
      const curveOffset = curvature * Math.sin(t * Math.PI) * length * 0.06;
      const x = baseX + along * Math.cos(angle) - (across + curveOffset) * Math.sin(angle);
      const y = baseY + along * Math.sin(angle) + (across + curveOffset) * Math.cos(angle);
      pts.push([x, y]);
    }
    for (let i = n; i >= 0; i--) {
      const t = i / n;
      let w;
      if (t < 0.1) w = t / 0.1 * 0.15;
      else if (t < 0.4) w = 0.15 + (t - 0.1) / 0.3 * 0.85;
      else if (t < 0.6) w = 1.0;
      else w = Math.cos((t - 0.6) / 0.4 * Math.PI * 0.5);
      const along = t * length;
      const across = -w * width * 0.5;
      const curveOffset = curvature * Math.sin(t * Math.PI) * length * 0.06;
      const x = baseX + along * Math.cos(angle) - (across + curveOffset) * Math.sin(angle);
      const y = baseY + along * Math.sin(angle) + (across + curveOffset) * Math.cos(angle);
      pts.push([x, y]);
    }
    return pts;
  }

  // Tulip flame petal: narrow base, pointed tip, S-curve
  static makeTulipPetalPoly(baseX, baseY, angle, length, width, curvature) {
    const pts = [];
    const n = 28;
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      let w;
      if (t < 0.05) w = t / 0.05 * 0.1;
      else if (t < 0.25) w = 0.1 + (t - 0.05) / 0.2 * 0.9;
      else if (t < 0.55) w = 1.0 - (t - 0.25) * 0.15;
      else if (t < 0.85) w = (1.0 - (t - 0.25) * 0.15) * (1 - (t - 0.55) / 0.3 * 0.3);
      else w = Math.max(0, Math.cos((t - 0.85) / 0.15 * Math.PI * 0.5) * 0.4);
      const along = t * length;
      const across = w * width * 0.5;
      const sCurve = Math.sin(t * Math.PI * 1.3) * curvature * length * 0.06;
      const x = baseX + along * Math.cos(angle) - (across + sCurve) * Math.sin(angle);
      const y = baseY + along * Math.sin(angle) + (across + sCurve) * Math.cos(angle);
      pts.push([x, y]);
    }
    for (let i = n; i >= 0; i--) {
      const t = i / n;
      let w;
      if (t < 0.05) w = t / 0.05 * 0.1;
      else if (t < 0.25) w = 0.1 + (t - 0.05) / 0.2 * 0.9;
      else if (t < 0.55) w = 1.0 - (t - 0.25) * 0.15;
      else if (t < 0.85) w = (1.0 - (t - 0.25) * 0.15) * (1 - (t - 0.55) / 0.3 * 0.3);
      else w = Math.max(0, Math.cos((t - 0.85) / 0.15 * Math.PI * 0.5) * 0.4);
      const along = t * length;
      const across = -w * width * 0.5;
      const sCurve = Math.sin(t * Math.PI * 1.3) * curvature * length * 0.06;
      const x = baseX + along * Math.cos(angle) - (across + sCurve) * Math.sin(angle);
      const y = baseY + along * Math.sin(angle) + (across + sCurve) * Math.cos(angle);
      pts.push([x, y]);
    }
    return pts;
  }

  // Hyacinth bell floret: elongated bell/tube shape
  static makeHyacinthBellPoly(baseX, baseY, angle, length, width) {
    const pts = [];
    const n = 24;
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      let w;
      if (t < 0.15) w = 0.3 + t / 0.15 * 0.15;
      else if (t < 0.5) w = 0.45 + (t - 0.15) / 0.35 * 0.1;
      else if (t < 0.75) w = 0.55 + (t - 0.5) / 0.25 * 0.45;
      else w = 1.0 - (t - 0.75) / 0.25 * 0.15;
      const along = t * length;
      const across = w * width * 0.5;
      const x = baseX + along * Math.cos(angle) - across * Math.sin(angle);
      const y = baseY + along * Math.sin(angle) + across * Math.cos(angle);
      pts.push([x, y]);
    }
    for (let i = n; i >= 0; i--) {
      const t = i / n;
      let w;
      if (t < 0.15) w = 0.3 + t / 0.15 * 0.15;
      else if (t < 0.5) w = 0.45 + (t - 0.15) / 0.35 * 0.1;
      else if (t < 0.75) w = 0.55 + (t - 0.5) / 0.25 * 0.45;
      else w = 1.0 - (t - 0.75) / 0.25 * 0.15;
      const along = t * length;
      const across = -w * width * 0.5;
      const x = baseX + along * Math.cos(angle) - across * Math.sin(angle);
      const y = baseY + along * Math.sin(angle) + across * Math.cos(angle);
      pts.push([x, y]);
    }
    return pts;
  }

  // Carnation: ruffled circle with serrated edge
  static makeCarnationPoly(cx, cy, radius, ruffleAmp, numRuffles) {
    const pts = [];
    const n = 120;
    for (let i = 0; i < n; i++) {
      const angle = (i / n) * Math.PI * 2;
      const ruffle1 = Math.sin(angle * numRuffles) * ruffleAmp;
      const ruffle2 = Math.sin(angle * numRuffles * 2.3 + 1.5) * ruffleAmp * 0.4;
      const ruffle3 = Math.sin(angle * numRuffles * 0.7 + 3.1) * ruffleAmp * 0.6;
      const r = radius + ruffle1 + ruffle2 + ruffle3;
      pts.push([cx + Math.cos(angle) * r, cy + Math.sin(angle) * r]);
    }
    return pts;
  }

  // Saz leaf: long curved Ottoman leaf
  static makeSazLeafPoly(baseX, baseY, size, angle, side) {
    const leafLen = size * 1.2;
    const leafWidth = size * 0.28;
    const leafCurve = (side || 1) * 0.15;
    const steps = 24;
    const pts = [];
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const along = leafLen * t;
      const w = Math.sin(t * Math.PI) * leafWidth * (1 - t * 0.3);
      const curveOff = Math.sin(t * Math.PI) * leafCurve * leafLen;
      const ax = angle + curveOff / leafLen;
      pts.push([
        baseX + Math.cos(ax) * along + Math.cos(ax + Math.PI / 2) * w,
        baseY + Math.sin(ax) * along + Math.sin(ax + Math.PI / 2) * w
      ]);
    }
    for (let i = steps; i >= 0; i--) {
      const t = i / steps;
      const along = leafLen * t;
      const w = Math.sin(t * Math.PI) * leafWidth * (1 - t * 0.3);
      const curveOff = Math.sin(t * Math.PI) * leafCurve * leafLen;
      const ax = angle + curveOff / leafLen;
      pts.push([
        baseX + Math.cos(ax) * along + Math.cos(ax - Math.PI / 2) * w,
        baseY + Math.sin(ax) * along + Math.sin(ax - Math.PI / 2) * w
      ]);
    }
    return pts;
  }

  // Rose leaflet: serrated teardrop
  static makeRoseLeaflet(baseX, baseY, angle, length, width) {
    const pts = [];
    const n = 20;
    const serrations = 5;
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      let w;
      if (t < 0.1) w = t / 0.1 * 0.3;
      else if (t < 0.45) w = 0.3 + (t - 0.1) / 0.35 * 0.7;
      else if (t < 0.7) w = 1.0 - (t - 0.45) * 0.3;
      else w = Math.max(0, (1 - t) / 0.3 * 0.6);
      const serrAmp = 0.08 * Math.sin(t * serrations * Math.PI * 2);
      w += serrAmp;
      const along = t * length;
      const across = w * width * 0.5;
      const x = baseX + along * Math.cos(angle) - across * Math.sin(angle);
      const y = baseY + along * Math.sin(angle) + across * Math.cos(angle);
      pts.push([x, y]);
    }
    for (let i = n; i >= 0; i--) {
      const t = i / n;
      let w;
      if (t < 0.1) w = t / 0.1 * 0.3;
      else if (t < 0.45) w = 0.3 + (t - 0.1) / 0.35 * 0.7;
      else if (t < 0.7) w = 1.0 - (t - 0.45) * 0.3;
      else w = Math.max(0, (1 - t) / 0.3 * 0.6);
      const serrAmp = 0.08 * Math.sin(t * serrations * Math.PI * 2);
      w += serrAmp;
      const along = t * length;
      const across = -w * width * 0.5;
      const x = baseX + along * Math.cos(angle) - across * Math.sin(angle);
      const y = baseY + along * Math.sin(angle) + across * Math.cos(angle);
      pts.push([x, y]);
    }
    return pts;
  }

  // Tulip leaf: long smooth blade with twist
  static makeTulipLeafPoly(baseX, baseY, angle, length, width) {
    const pts = [];
    const n = 28;
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      let w;
      if (t < 0.15) w = t / 0.15 * 0.6;
      else if (t < 0.5) w = 0.6 + (t - 0.15) / 0.35 * 0.4;
      else if (t < 0.85) w = 1.0 - (t - 0.5) / 0.35 * 0.5;
      else w = Math.max(0, (1 - t) / 0.15 * 0.5);
      const along = t * length;
      const twist = Math.sin(t * Math.PI * 0.8) * width * 0.12;
      const across = w * width * 0.5 + twist;
      const x = baseX + along * Math.cos(angle) - across * Math.sin(angle);
      const y = baseY + along * Math.sin(angle) + across * Math.cos(angle);
      pts.push([x, y]);
    }
    for (let i = n; i >= 0; i--) {
      const t = i / n;
      let w;
      if (t < 0.15) w = t / 0.15 * 0.6;
      else if (t < 0.5) w = 0.6 + (t - 0.15) / 0.35 * 0.4;
      else if (t < 0.85) w = 1.0 - (t - 0.5) / 0.35 * 0.5;
      else w = Math.max(0, (1 - t) / 0.15 * 0.5);
      const along = t * length;
      const twist = Math.sin(t * Math.PI * 0.8) * width * 0.12;
      const across = -(w * width * 0.5) + twist;
      const x = baseX + along * Math.cos(angle) - across * Math.sin(angle);
      const y = baseY + along * Math.sin(angle) + across * Math.cos(angle);
      pts.push([x, y]);
    }
    return pts;
  }

  // ── Flower type definitions ──
  // Each returns { petals: [[polygon, color, opacity], ...], leaves: [...] }

  static COLORS = {
    crimson:     '#C0392B',
    crimsonDark: '#911A2A',
    pink:        '#D73C5A',
    pinkLight:   '#E8849A',
    gold:        '#B8860B',
    goldLight:   '#DAB94E',
    amber:       '#CD853F',
    maroon:      '#8B2252',
    darkRed:     '#8B1A1A',
    sienna:      '#A0522D',
    green:       '#1A5A2A',
    greenDark:   '#0E4D2E',
    greenLight:  '#3A8A3C',
    blue:        '#283C8C',
    white:       '#F5F0EB',
    cream:       '#F0ECE4',
    yellowCenter:'#DCB94E',
  };

  // Helper: generate slight random variation
  static _v(base, spread) {
    return base + (Math.random() - 0.5) * spread;
  }
  static _rv() { return (Math.random() - 0.5) * 2; }

  // ── 1. Crimson Bud ──
  static crimsonBud(cx, cy, size) {
    const s = size || 30;
    const petals = [];
    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI * 2 + this._rv() * 0.15;
      const dist = s * 0.3;
      const bx = cx + Math.cos(angle) * dist;
      const by = cy + Math.sin(angle) * dist;
      petals.push({
        poly: this.makeBudPetalPoly(bx, by, angle + this._rv() * 0.2, s * 0.9, s * 0.45, this._rv() * 0.3),
        color: this.COLORS.crimson, opacity: 120
      });
    }
    // Inner tight petals
    for (let i = 0; i < 3; i++) {
      const angle = (i / 3) * Math.PI * 2 + this._rv() * 0.4;
      petals.push({
        poly: this.makeBudPetalPoly(cx, cy, angle, s * 0.25, s * 0.16, this._rv() * 0.3),
        color: this.COLORS.crimsonDark, opacity: 100
      });
    }
    return { petals, leaves: this._roseLeaves(cx, cy, s) };
  }

  // ── 2. Half-Open Rose ──
  static halfOpenRose(cx, cy, size) {
    const s = size || 40;
    const petals = [];
    // Inner ring
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2 + this._rv() * 0.2;
      const dist = s * 0.35;
      const bx = cx + Math.cos(angle) * dist;
      const by = cy + Math.sin(angle) * dist;
      petals.push({
        poly: this.makePetalPoly(bx, by, angle + this._rv() * 0.2, s * 0.8, s * 0.55, this._rv() * 0.5),
        color: this.COLORS.pink, opacity: 110
      });
    }
    // Outer ring
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2 + this._rv() * 0.12 + 0.3;
      const dist = s * 0.6;
      const bx = cx + Math.cos(angle) * dist;
      const by = cy + Math.sin(angle) * dist;
      petals.push({
        poly: this.makePetalPoly(bx, by, angle + this._rv() * 0.25, s * 1.05, s * 0.75, this._rv() * 0.7),
        color: this.COLORS.crimson, opacity: 120
      });
    }
    // Center
    for (let i = 0; i < 3; i++) {
      const angle = (i / 3) * Math.PI * 2 + this._rv() * 0.4;
      petals.push({
        poly: this.makePetalPoly(cx, cy, angle, s * 0.22, s * 0.15, this._rv() * 0.3),
        color: this.COLORS.crimsonDark, opacity: 90
      });
    }
    return { petals, leaves: this._roseLeaves(cx, cy, s) };
  }

  // ── 3. Full Bloom Rose ──
  static fullBloomRose(cx, cy, size) {
    const s = size || 50;
    const petals = [];
    // Outer ring: 7 large petals
    for (let i = 0; i < 7; i++) {
      const angle = (i / 7) * Math.PI * 2 + this._rv() * 0.15 + 0.4;
      const dist = s * 0.5;
      const bx = cx + Math.cos(angle) * dist;
      const by = cy + Math.sin(angle) * dist;
      petals.push({
        poly: this.makePetalPoly(bx, by, angle + this._rv() * 0.25, s * 1.1, s * 0.8, this._rv() * 1.0),
        color: this.COLORS.pinkLight, opacity: 130
      });
    }
    // Mid ring: 5 petals
    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI * 2 + this._rv() * 0.15 + 0.2;
      const dist = s * 0.28;
      const bx = cx + Math.cos(angle) * dist;
      const by = cy + Math.sin(angle) * dist;
      petals.push({
        poly: this.makePetalPoly(bx, by, angle + this._rv() * 0.2, s * 0.76, s * 0.56, this._rv() * 0.7),
        color: this.COLORS.pink, opacity: 110
      });
    }
    // Inner: 4 tight petals
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2 + this._rv() * 0.3;
      const dist = this._rv() * 2;
      petals.push({
        poly: this.makePetalPoly(cx + Math.cos(angle) * dist, cy + Math.sin(angle) * dist,
          angle + this._rv() * 0.3, s * 0.44, s * 0.32, this._rv() * 0.5),
        color: this.COLORS.maroon, opacity: 100
      });
    }
    // Dark center
    const cPoly = [];
    const cR = s * 0.12;
    for (let j = 0; j < 16; j++) {
      const a = (j / 16) * Math.PI * 2;
      cPoly.push([cx + Math.cos(a) * cR, cy + Math.sin(a) * cR]);
    }
    petals.push({ poly: cPoly, color: this.COLORS.crimsonDark, opacity: 140 });
    return { petals, leaves: this._roseLeaves(cx, cy, s) };
  }

  // ── 4. Golden Rose ──
  static goldenRose(cx, cy, size) {
    const s = size || 45;
    const petals = [];
    // Outer: 6
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2 + this._rv() * 0.15 + 0.3;
      const dist = s * 0.5;
      const bx = cx + Math.cos(angle) * dist;
      const by = cy + Math.sin(angle) * dist;
      petals.push({
        poly: this.makePetalPoly(bx, by, angle + this._rv() * 0.25, s * 1.0, s * 0.75, this._rv() * 0.9),
        color: this.COLORS.goldLight, opacity: 120
      });
    }
    // Mid: 5
    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI * 2 + this._rv() * 0.15 + 0.15;
      const dist = s * 0.28;
      const bx = cx + Math.cos(angle) * dist;
      const by = cy + Math.sin(angle) * dist;
      petals.push({
        poly: this.makePetalPoly(bx, by, angle + this._rv() * 0.2, s * 0.7, s * 0.5, this._rv() * 0.6),
        color: this.COLORS.gold, opacity: 110
      });
    }
    // Inner: 3
    for (let i = 0; i < 3; i++) {
      const angle = (i / 3) * Math.PI * 2 + this._rv() * 0.3;
      petals.push({
        poly: this.makePetalPoly(cx, cy, angle + this._rv() * 0.2, s * 0.37, s * 0.27, this._rv() * 0.4),
        color: this.COLORS.amber, opacity: 100
      });
    }
    return { petals, leaves: this._roseLeaves(cx, cy, s) };
  }

  // ── 5. Ottoman Tulip ──
  static ottomanTulip(cx, cy, size) {
    const s = size || 45;
    const petals = [];
    const petalAngles = [-0.35, -0.12, 0.12, 0.35];
    for (let i = 0; i < 4; i++) {
      const angle = -Math.PI / 2 + petalAngles[i] + this._rv() * 0.05;
      const dist = 4 + Math.abs(petalAngles[i]) * 10;
      const bx = cx + Math.cos(angle + Math.PI / 2) * dist * 0.5;
      const by = cy + s * 0.2;
      const isOuter = (i === 0 || i === 3);
      petals.push({
        poly: this.makeTulipPetalPoly(bx, by, angle,
          s * 1.2 * (isOuter ? 0.9 : 1.0), s * 0.4 * (isOuter ? 1.15 : 1.0),
          (0.5 + this._rv() * 0.3) * (i < 2 ? 1 : -1)),
        color: isOuter ? '#D24114' : '#E65519',
        opacity: 130
      });
    }
    // Inner glow
    for (let i = 0; i < 2; i++) {
      const angle = -Math.PI / 2 + (i === 0 ? -0.06 : 0.06);
      petals.push({
        poly: this.makeTulipPetalPoly(cx, cy + s * 0.25, angle, s * 0.85, s * 0.18, 0.3 + this._rv() * 0.2),
        color: this.COLORS.goldLight, opacity: 70
      });
    }
    const leaves = [];
    // Long blade leaves
    leaves.push({
      poly: this.makeTulipLeafPoly(cx - 2, cy + s * 0.6, -Math.PI / 2 - 0.3, s * 1.8, s * 0.2),
      color: this.COLORS.green, opacity: 110
    });
    leaves.push({
      poly: this.makeTulipLeafPoly(cx + 2, cy + s * 0.6, -Math.PI / 2 + 0.35, s * 1.7, s * 0.18),
      color: this.COLORS.green, opacity: 110
    });
    return { petals, leaves };
  }

  // ── 6. Carnation ──
  static carnation(cx, cy, size) {
    const s = size || 40;
    const petals = [];
    petals.push({ poly: this.makeCarnationPoly(cx, cy, s * 0.8, s * 0.15, 14), color: '#C31E32', opacity: 130 });
    petals.push({ poly: this.makeCarnationPoly(cx, cy, s * 0.65, s * 0.12, 12), color: '#AF1932', opacity: 120 });
    petals.push({ poly: this.makeCarnationPoly(cx, cy, s * 0.45, s * 0.1, 10), color: '#9B1426', opacity: 110 });
    petals.push({ poly: this.makeCarnationPoly(cx, cy, s * 0.25, s * 0.05, 8), color: '#78101E', opacity: 100 });
    return { petals, leaves: [] };
  }

  // ── 7. Blue Hyacinth ──
  static blueHyacinth(cx, cy, size) {
    const s = size || 45;
    const petals = [];
    const numRows = 10;
    const spikeLen = s * 1.5;
    const startY = cy + spikeLen * 0.35;
    for (let i = 0; i < numRows; i++) {
      const t = i / (numRows - 1);
      const fy = startY - t * spikeLen;
      const bellScale = 0.5 + 0.5 * (1 - t * 0.4);
      const bellLen = s * 0.35 * bellScale;
      const bellWid = s * 0.13 * bellScale;
      const bellsInRow = (i < 2 || i > numRows - 3) ? 2 : 3;
      for (let j = 0; j < bellsInRow; j++) {
        const spread = (j - (bellsInRow - 1) / 2) * (0.35 + this._rv() * 0.05);
        const bellAngle = Math.PI / 2 + spread;
        const fx = cx + Math.cos(bellAngle) * 2;
        petals.push({
          poly: this.makeHyacinthBellPoly(fx, fy, bellAngle, bellLen, bellWid),
          color: this.COLORS.blue, opacity: 120
        });
      }
    }
    return { petals, leaves: [] };
  }

  // ── 8. White Jasmine ──
  static whiteJasmine(cx, cy, size) {
    const s = size || 35;
    const petals = [];
    // Outer star
    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI * 2 - Math.PI / 2 + this._rv() * 0.08;
      const bx = cx + Math.cos(angle) * 5;
      const by = cy + Math.sin(angle) * 5;
      petals.push({
        poly: this.makePetalPoly(bx, by, angle + this._rv() * 0.1, s * 1.1, s * 0.5, this._rv() * 0.2),
        color: this.COLORS.white, opacity: 140
      });
    }
    // Inner star
    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI * 2 - Math.PI / 2 + Math.PI / 5 + this._rv() * 0.08;
      const bx = cx + Math.cos(angle) * 3;
      const by = cy + Math.sin(angle) * 3;
      petals.push({
        poly: this.makePetalPoly(bx, by, angle + this._rv() * 0.1, s * 0.85, s * 0.35, this._rv() * 0.2),
        color: this.COLORS.cream, opacity: 120
      });
    }
    // Yellow center
    for (let i = 0; i < 3; i++) {
      const angle = (i / 3) * Math.PI * 2 + this._rv() * 0.5;
      petals.push({
        poly: this.makePetalPoly(cx, cy, angle, s * 0.2, s * 0.18, this._rv() * 0.2),
        color: this.COLORS.yellowCenter, opacity: 100
      });
    }
    return { petals, leaves: [] };
  }

  // ── 9. Penc Filler ──
  static pencFiller(cx, cy, size) {
    const s = size || 25;
    const petals = [];
    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI * 2 - Math.PI / 2 + this._rv() * 0.1;
      const bx = cx + Math.cos(angle) * 4;
      const by = cy + Math.sin(angle) * 4;
      petals.push({
        poly: this.makePetalPoly(bx, by, angle + this._rv() * 0.1, s * 0.9, s * 0.7, this._rv() * 0.15),
        color: this.COLORS.pink, opacity: 120
      });
    }
    // Dark center
    for (let i = 0; i < 3; i++) {
      const angle = (i / 3) * Math.PI * 2 + this._rv() * 0.5;
      petals.push({
        poly: this.makePetalPoly(cx, cy, angle, s * 0.35, s * 0.3, this._rv() * 0.2),
        color: this.COLORS.crimsonDark, opacity: 100
      });
    }
    return { petals, leaves: [] };
  }

  // ── 10. Berry Cluster ──
  static berryCluster(cx, cy, size) {
    const s = size || 30;
    const petals = [];
    const numBerries = 7;
    const clusterR = s * 0.7;
    for (let i = 0; i < numBerries; i++) {
      let bx, by;
      if (i === 0) { bx = cx; by = cy; }
      else {
        const angle = ((i - 1) / (numBerries - 1)) * Math.PI * 2 + this._rv() * 0.2;
        bx = cx + Math.cos(angle) * clusterR;
        by = cy + Math.sin(angle) * clusterR;
      }
      const berryR = s * 0.22;
      const berryPoly = [];
      for (let j = 0; j < 24; j++) {
        const a = (j / 24) * Math.PI * 2;
        berryPoly.push([bx + Math.cos(a) * berryR, by + Math.sin(a) * berryR]);
      }
      petals.push({ poly: berryPoly, color: this.COLORS.darkRed, opacity: 120 });
      // Highlight
      const hlPoly = [];
      const hlR = berryR * 0.3;
      for (let j = 0; j < 12; j++) {
        const a = (j / 12) * Math.PI * 2;
        hlPoly.push([bx - berryR * 0.25 + Math.cos(a) * hlR, by - berryR * 0.25 + Math.sin(a) * hlR]);
      }
      petals.push({ poly: hlPoly, color: this.COLORS.sienna, opacity: 60 });
    }
    return { petals, leaves: [] };
  }

  // ── Leaf helper for rose types ──
  static _roseLeaves(cx, cy, s) {
    const leaves = [];
    for (let i = 0; i < 2; i++) {
      const angle = Math.PI * 0.2 + i * Math.PI * 0.6 + this._rv() * 0.15;
      const dist = s * 0.8;
      const lx = cx + Math.cos(angle) * dist;
      const ly = cy + Math.sin(angle) * dist;
      leaves.push({
        poly: this.makeRoseLeaflet(lx, ly, angle + Math.PI, s * 0.5, s * 0.25),
        color: this.COLORS.green, opacity: 110
      });
    }
    return leaves;
  }

  // ── Dispatch by type name ──
  static TYPES = [
    'crimsonBud', 'halfOpenRose', 'fullBloomRose', 'goldenRose',
    'ottomanTulip', 'carnation', 'blueHyacinth', 'whiteJasmine',
    'pencFiller', 'berryCluster'
  ];

  static create(type, cx, cy, size) {
    switch (type) {
      case 'crimsonBud':    return this.crimsonBud(cx, cy, size);
      case 'halfOpenRose':  return this.halfOpenRose(cx, cy, size);
      case 'fullBloomRose': return this.fullBloomRose(cx, cy, size);
      case 'goldenRose':    return this.goldenRose(cx, cy, size);
      case 'ottomanTulip':  return this.ottomanTulip(cx, cy, size);
      case 'carnation':     return this.carnation(cx, cy, size);
      case 'blueHyacinth':  return this.blueHyacinth(cx, cy, size);
      case 'whiteJasmine':  return this.whiteJasmine(cx, cy, size);
      case 'pencFiller':    return this.pencFiller(cx, cy, size);
      case 'berryCluster':  return this.berryCluster(cx, cy, size);
      default:              return this.pencFiller(cx, cy, size);
    }
  }

  // Get all petal polygons for a flower, ready for brush.polygon()
  static getPetals(type, cx, cy, size) {
    const flower = this.create(type, cx, cy, size);
    return [...flower.leaves, ...flower.petals];
  }
}
