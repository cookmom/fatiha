#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd)"
python3 - <<'PY'
import csv, json, pathlib, html
root=pathlib.Path('/home/openclaw-agent/.openclaw/workspace/autoresearch-agot')
rows=list(csv.DictReader((root/'results.csv').open())) if (root/'results.csv').exists() else []
if not rows:
    print('no results'); raise SystemExit(1)
rows=sorted(rows,key=lambda r: float(r['combined']), reverse=True)[:5]
out=root/'reports'/'top5.html'
out.parent.mkdir(parents=True, exist_ok=True)
parts=['<html><body style="font-family:system-ui;background:#111;color:#eee"><h1>AGOT Autoresearch Top 5</h1>']
for i,r in enumerate(rows,1):
    shots=json.loads(r['shots'])
    parts.append(f"<h2>#{i} score={float(r['combined']):.2f} (A={r['aesthetic']} P={r['performance']})</h2><div style='display:flex;gap:8px;flex-wrap:wrap'>")
    for k,p in shots.items():
        p_rel = pathlib.Path(p)
        parts.append(f"<figure><figcaption>{html.escape(k)}</figcaption><img src='../screenshots/{p_rel.name}' style='width:220px;border:1px solid #333'></figure>")
    parts.append('</div><pre>'+html.escape(r['breakdown'])+'</pre>')
parts.append('</body></html>')
out.write_text('\n'.join(parts))
print(out)
PY
