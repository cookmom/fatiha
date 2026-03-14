#!/usr/bin/env python3
import argparse, csv, json, random, subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parent
PARAMS = json.loads((ROOT/'params.json').read_text())['parameters']
RESULTS = ROOT/'results.csv'
CAND = ROOT/'candidate.json'


def best_row():
    if not RESULTS.exists():
        return None
    rows = list(csv.DictReader(RESULTS.open()))
    if not rows:
        return None
    return max(rows, key=lambda r: float(r['combined']))


def sample_candidate(center=None, scale=0.22):
    c = {}
    for p in PARAMS:
        mn, mx = p['min'], p['max']
        base = center.get(p['name'], p['value']) if center else p['value']
        span = (mx - mn) * scale
        v = random.uniform(max(mn, base-span), min(mx, base+span))
        c[p['name']] = round(v, 6)
    return c


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('-n', '--iterations', type=int, default=20)
    args = ap.parse_args()

    center = {p['name']: p['value'] for p in PARAMS}
    best_score = float(best_row()['combined']) if best_row() else -1e9

    for i in range(args.iterations):
        scale = 0.28 if i < max(4, args.iterations//3) else 0.10
        cand = sample_candidate(center=center, scale=scale)
        CAND.write_text(json.dumps(cand, indent=2))
        subprocess.run([str(ROOT/'run.sh'), str(CAND)], check=True)

        rows = list(csv.DictReader(RESULTS.open())) if RESULTS.exists() else []
        if rows:
            cur_best = max(rows, key=lambda r: float(r['combined']))
            cur_score = float(cur_best['combined'])
            if cur_score > best_score:
                best_score = cur_score
                # Bayesian-inspired narrowing: move center toward winner
                last = json.loads(CAND.read_text())
                center.update(last)

    rows = list(csv.DictReader(RESULTS.open())) if RESULTS.exists() else []
    top = sorted(rows, key=lambda r: float(r['combined']), reverse=True)[:5]
    out = ROOT/'top5.json'
    out.write_text(json.dumps(top, indent=2))
    print(f'wrote {out}')

if __name__ == '__main__':
    main()
