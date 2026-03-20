// بسم الله الرحمن الرحيم
// Extract shaped Arabic bezier curves for Al-Fatiha
// Uses HarfBuzz for proper Arabic shaping + opentype.js for bezier paths

const fs = require('fs');
const opentype = require('opentype.js');

const FATIHA = [
  'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ',
  'ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَٰلَمِينَ',
  'ٱلرَّحْمَٰنِ ٱلرَّحِيمِ',
  'مَٰلِكِ يَوْمِ ٱلدِّينِ',
  'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ',
  'ٱهْدِنَا ٱلصِّرَٰطَ ٱلْمُسْتَقِيمَ',
  'صِرَٰطَ ٱلَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ ٱلْمَغْضُوبِ عَلَيْهِمْ وَلَا ٱلضَّآلِّينَ'
];

function extractVerseCurves(font, hb, hbFont, face, blob, text, fontSize) {
  const buffer = hb.createBuffer();
  buffer.addText(text);
  buffer.guessSegmentProperties();
  hb.shape(hbFont, buffer);

  const shaped = buffer.json();
  const scale = fontSize / font.unitsPerEm;
  const curves = [];

  // RTL: glyphs come in visual order (left to right) from HarfBuzz
  let cursorX = 0;
  for (const g of shaped) {
    const glyph = font.glyphs.get(g.g);
    if (!glyph) { cursorX += g.ax * scale; continue; }

    const path = glyph.getPath(0, 0, font.unitsPerEm); // get at unitsPerEm, we'll scale ourselves
    let cx = 0, cy = 0;

    for (const cmd of path.commands) {
      if (cmd.type === 'M') {
        cx = cmd.x; cy = cmd.y;
      } else if (cmd.type === 'L') {
        const mx = (cx + cmd.x) * 0.5;
        const my = (cy + cmd.y) * 0.5;
        curves.push([
          (cx * scale + cursorX + g.dx * scale), (-cy * scale + g.dy * scale),
          (mx * scale + cursorX + g.dx * scale), (-my * scale + g.dy * scale),
          (cmd.x * scale + cursorX + g.dx * scale), (-cmd.y * scale + g.dy * scale)
        ]);
        cx = cmd.x; cy = cmd.y;
      } else if (cmd.type === 'Q') {
        curves.push([
          (cx * scale + cursorX + g.dx * scale), (-cy * scale + g.dy * scale),
          (cmd.x1 * scale + cursorX + g.dx * scale), (-cmd.y1 * scale + g.dy * scale),
          (cmd.x * scale + cursorX + g.dx * scale), (-cmd.y * scale + g.dy * scale)
        ]);
        cx = cmd.x; cy = cmd.y;
      } else if (cmd.type === 'C') {
        // Approximate cubic with 2 quadratics
        const mx = (cmd.x1 + cmd.x2) * 0.5;
        const my = (cmd.y1 + cmd.y2) * 0.5;
        curves.push([
          (cx * scale + cursorX + g.dx * scale), (-cy * scale + g.dy * scale),
          (cmd.x1 * scale + cursorX + g.dx * scale), (-cmd.y1 * scale + g.dy * scale),
          (mx * scale + cursorX + g.dx * scale), (-my * scale + g.dy * scale)
        ]);
        curves.push([
          (mx * scale + cursorX + g.dx * scale), (-my * scale + g.dy * scale),
          (cmd.x2 * scale + cursorX + g.dx * scale), (-cmd.y2 * scale + g.dy * scale),
          (cmd.x * scale + cursorX + g.dx * scale), (-cmd.y * scale + g.dy * scale)
        ]);
        cx = cmd.x; cy = cmd.y;
      }
    }
    cursorX += g.ax * scale;
  }

  buffer.destroy();

  // Compute bounding box
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const c of curves) {
    for (let i = 0; i < 6; i += 2) {
      minX = Math.min(minX, c[i]); maxX = Math.max(maxX, c[i]);
      minY = Math.min(minY, c[i+1]); maxY = Math.max(maxY, c[i+1]);
    }
  }

  return {
    curves, // each: [p1x, p1y, p2x, p2y, p3x, p3y]
    bbox: { minX, maxX, minY, maxY },
    width: cursorX,
    glyphCount: shaped.length
  };
}

(async () => {
  const hb = await require('harfbuzzjs');
  const font = opentype.loadSync('fonts/AmiriQuran.ttf');
  const fontData = fs.readFileSync('fonts/AmiriQuran.ttf');
  const blob = hb.createBlob(fontData);
  const face = hb.createFace(blob, 0);
  const hbFont = hb.createFont(face);
  hbFont.setScale(font.unitsPerEm, font.unitsPerEm);

  const fontSize = 28; // base size, will scale in browser
  const verses = [];
  let totalCurves = 0;

  for (let i = 0; i < FATIHA.length; i++) {
    const v = extractVerseCurves(font, hb, hbFont, face, blob, FATIHA[i], fontSize);
    verses.push({
      text: FATIHA[i],
      curves: v.curves,
      bbox: v.bbox,
      width: v.width,
      glyphCount: v.glyphCount,
      curveCount: v.curves.length
    });
    totalCurves += v.curves.length;
    console.log(`Verse ${i+1}: ${v.curves.length} curves, ${v.glyphCount} glyphs, width ${v.width.toFixed(1)}`);
  }

  const output = { fontSize, totalCurves, verses };
  fs.writeFileSync('fatiha-curves.json', JSON.stringify(output));
  console.log(`\nTotal: ${totalCurves} curves saved to fatiha-curves.json`);

  hbFont.destroy();
  face.destroy();
  blob.destroy();
})();
