const fs = require('fs');
const path = require('path');
const { createCanvas, loadImage } = require('canvas');

const FPS = 30;
const INTERVAL = 0.5; // seconds
const FRAME_STEP = Math.round(FPS * INTERVAL); // 15 frames apart

async function pixelDiff(pathA, pathB) {
  const [imgA, imgB] = await Promise.all([loadImage(pathA), loadImage(pathB)]);
  const w = imgA.width, h = imgA.height;
  const canvasA = createCanvas(w, h);
  const ctxA = canvasA.getContext('2d');
  ctxA.drawImage(imgA, 0, 0);
  const dataA = ctxA.getImageData(0, 0, w, h).data;

  const canvasB = createCanvas(w, h);
  const ctxB = canvasB.getContext('2d');
  ctxB.drawImage(imgB, 0, 0);
  const dataB = ctxB.getImageData(0, 0, w, h).data;

  let diffPixels = 0;
  const totalPixels = w * h;
  for (let i = 0; i < dataA.length; i += 4) {
    const dr = Math.abs(dataA[i] - dataB[i]);
    const dg = Math.abs(dataA[i+1] - dataB[i+1]);
    const db = Math.abs(dataA[i+2] - dataB[i+2]);
    if (dr + dg + db > 30) diffPixels++;
  }
  return (diffPixels / totalPixels * 100);
}

(async () => {
  const framesDir = path.join(__dirname, 'frames');
  const files = fs.readdirSync(framesDir).filter(f => f.endsWith('.png')).sort();
  const total = files.length;

  let allPass = true;
  let results = [];

  for (let i = 0; i + FRAME_STEP < total; i += FRAME_STEP) {
    const fA = path.join(framesDir, files[i]);
    const fB = path.join(framesDir, files[i + FRAME_STEP]);
    const diff = await pixelDiff(fA, fB);
    const pass = diff > 10;
    const t1 = (i / FPS).toFixed(1);
    const t2 = ((i + FRAME_STEP) / FPS).toFixed(1);
    const status = pass ? 'PASS' : 'FAIL';
    console.log(`${status}: t=${t1}s → t=${t2}s  diff=${diff.toFixed(1)}%`);
    results.push({ t1, t2, diff, pass });
    if (!pass) allPass = false;
  }

  console.log(`\n${results.filter(r => r.pass).length}/${results.length} pairs pass (>10% diff)`);
  if (!allPass) process.exit(1);
})();
