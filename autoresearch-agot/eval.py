#!/usr/bin/env python3
import argparse, csv, hashlib, json, os, subprocess, sys, time
from pathlib import Path
from PIL import Image
import numpy as np

ROOT = Path(__file__).resolve().parent
SHOT_DIR = ROOT / 'screenshots'
RESULTS_CSV = ROOT / 'results.csv'

PRAYER_TIMES = {
    'fajr': 330,    # 05:30
    'dhuhr': 750,   # 12:30
    'maghrib': 1095,# 18:15
    'isha': 1200,   # 20:00
}

GPU_ENV = {
    'GALLIUM_DRIVER': 'd3d12',
    'MESA_D3D12_DEFAULT_ADAPTER_NAME': 'NVIDIA',
}
CHROME_ARGS = [
    '--no-sandbox','--disable-gpu-sandbox','--use-gl=angle','--use-angle=gl-egl',
    '--ozone-platform=headless','--ignore-gpu-blocklist','--disable-dev-shm-usage',
    '--in-process-gpu','--enable-webgl'
]

def node_capture(url, out_png, force_min):
    script = f"""
const puppeteer = require('puppeteer-core');
(async () => {{
  const browser = await puppeteer.launch({{
    executablePath: '/usr/bin/google-chrome-stable',
    headless: 'new',
    args: {json.dumps(CHROME_ARGS)}
  }});
  const page = await browser.newPage();
  await page.setViewport({{ width: 430, height: 932, deviceScaleFactor: 2 }});
  await page.goto({json.dumps(url)}, {{ waitUntil: 'domcontentloaded', timeout: 120000 }});
  await new Promise(r => setTimeout(r, 12000));
  // Dismiss onboarding overlays
  await page.evaluate(() => {{ document.querySelectorAll('.clock-onboard').forEach(e => e.style.display = 'none'); }});
  await page.evaluate((m) => {{ window._forceTimeMin = m; window._devActive = true; }}, {force_min});
  await new Promise(r => setTimeout(r, 2000));
  const fps = await page.evaluate(async () => {{
    let frames = 0;
    const start = performance.now();
    return await new Promise(resolve => {{
      const step = (t) => {{
        frames++;
        if (t - start >= 3000) return resolve((frames * 1000) / (t - start));
        requestAnimationFrame(step);
      }};
      requestAnimationFrame(step);
    }});
  }});
  await page.screenshot({{ path: {json.dumps(str(out_png))}, fullPage: true }});
  await browser.close();
  console.log(JSON.stringify({{ fps }}));
}})().catch(e => {{ console.error(e); process.exit(1); }});
"""
    env = os.environ.copy()
    env.update(GPU_ENV)
    env['LD_LIBRARY_PATH'] = '/usr/lib/wsl/lib:' + env.get('LD_LIBRARY_PATH', '')
    proc = subprocess.run(['node', '-e', script], capture_output=True, text=True, env=env)
    if proc.returncode != 0:
        raise RuntimeError(proc.stderr)
    return json.loads(proc.stdout.strip().splitlines()[-1])['fps']

def image_metrics(img_path):
    img = Image.open(img_path).convert('RGB')
    arr = np.asarray(img).astype(np.float32) / 255.0
    h, w, _ = arr.shape
    cube = arr[int(h*0.22):int(h*0.62), int(w*0.18):int(w*0.82)]
    bg = arr[int(h*0.62):int(h*0.95), int(w*0.05):int(w*0.95)]

    gray = cube.mean(axis=2)
    hist, _ = np.histogram(gray, bins=32, range=(0,1), density=False)
    p = hist.astype(np.float64)
    p = p / (p.sum() + 1e-12)
    entropy = -np.sum((p + 1e-12) * np.log2(p + 1e-12)) / np.log2(32)

    cube_l = cube.mean()
    bg_l = bg.mean()
    contrast = (max(cube_l, bg_l)+0.05)/(min(cube_l, bg_l)+0.05)
    contrast_n = min(contrast/6.0, 1.0)

    rg = np.abs(cube[:,:,0]-cube[:,:,1]).mean()
    gb = np.abs(cube[:,:,1]-cube[:,:,2]).mean()
    rb = np.abs(cube[:,:,0]-cube[:,:,2]).mean()
    prismatic = min((rg+gb+rb)/0.35, 1.0)

    edge_band = cube[:,:10,:].mean() + cube[:,-10:,:].mean() + cube[:10,:,:].mean() + cube[-10:,:,:].mean()
    edge_lum = min((edge_band/4.0)/0.75, 1.0)

    brightness = cube.mean()
    balance = max(0.0, 1.0 - min(abs(brightness - 0.48)/0.48, 1.0))

    aesthetic = 100.0 * (0.25*entropy + 0.2*contrast_n + 0.25*prismatic + 0.15*edge_lum + 0.15*balance)
    return {
        'color_richness': float(entropy*100),
        'contrast': float(contrast_n*100),
        'prismatic': float(prismatic*100),
        'edge_luminance': float(edge_lum*100),
        'brightness_balance': float(balance*100),
        'aesthetic': float(aesthetic),
    }

def perf_score(fps):
    if fps >= 30:
        return min(100.0, 70.0 + (fps-30.0)*1.5)
    return max(0.0, 70.0 - (30.0-fps)*4.0)

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--url', default='http://127.0.0.1:7770')
    ap.add_argument('--label', default='run')
    ap.add_argument('--candidate', default=str(ROOT/'candidate.json'))
    args = ap.parse_args()

    SHOT_DIR.mkdir(parents=True, exist_ok=True)
    cand = Path(args.candidate)
    params = json.loads(cand.read_text()) if cand.exists() else {'baseline': True}
    p_hash = hashlib.sha1(json.dumps(params, sort_keys=True).encode()).hexdigest()[:10]

    per_time = {}
    fps_vals = []
    shots = {}

    for key, mins in PRAYER_TIMES.items():
      out = SHOT_DIR / f"{int(time.time())}_{args.label}_{key}_{p_hash}.png"
      fps = node_capture(args.url, out, mins)
      metrics = image_metrics(out)
      per_time[key] = {'fps': fps, **metrics}
      fps_vals.append(fps)
      shots[key] = str(out)

    aesthetic = float(np.mean([v['aesthetic'] for v in per_time.values()]))
    fps_avg = float(np.mean(fps_vals))
    performance = perf_score(fps_avg)
    combined = 0.7 * aesthetic + 0.3 * performance

    row = {
        'timestamp': int(time.time()),
        'label': args.label,
        'params_hash': p_hash,
        'aesthetic': round(aesthetic, 3),
        'performance': round(performance, 3),
        'combined': round(combined, 3),
        'fps_avg': round(fps_avg, 3),
        'shots': json.dumps(shots),
        'breakdown': json.dumps(per_time),
    }

    write_header = not RESULTS_CSV.exists()
    with RESULTS_CSV.open('a', newline='') as f:
        w = csv.DictWriter(f, fieldnames=list(row.keys()))
        if write_header:
            w.writeheader()
        w.writerow(row)

    print(json.dumps(row, indent=2))

if __name__ == '__main__':
    main()
