#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
REPO="/home/tawfeeq/ramadan-clock-site"
BRANCH="autoresearch/shader-lookdev"
JS="$REPO/glass-cube-clock.js"
PARAMS="$ROOT/params.json"
CANDIDATE="${1:-$ROOT/candidate.json}"
PORT=7770

cleanup() {
  set +e
  [[ -n "${SERVER_PID:-}" ]] && kill "$SERVER_PID" >/dev/null 2>&1
  if [[ -f "$JS.bak_autoresearch" && "${KEEP_PATCHED:-0}" != "1" ]]; then mv "$JS.bak_autoresearch" "$JS"; fi
  [[ -f "$JS.bak_autoresearch" && "${KEEP_PATCHED:-0}" == "1" ]] && rm -f "$JS.bak_autoresearch"
}
trap cleanup EXIT

cd "$REPO"
git checkout "$BRANCH" >/dev/null 2>&1 || git checkout -b "$BRANCH"
cp "$JS" "$JS.bak_autoresearch"

python3 - "$PARAMS" "$CANDIDATE" "$JS" <<'PY'
import json,re,sys,pathlib
params=json.loads(pathlib.Path(sys.argv[1]).read_text())['parameters']
cand=json.loads(pathlib.Path(sys.argv[2]).read_text()) if pathlib.Path(sys.argv[2]).exists() else {}
js=pathlib.Path(sys.argv[3])
text=js.read_text()
for p in params:
    n=p['name']
    if n not in cand: continue
    v=float(cand[n])
    mn,mx=float(p['min']),float(p['max'])
    v=max(mn,min(mx,v))
    pat=re.compile(p['pattern'])
    def repl(m):
        return m.group(1)+f"{v:.6g}"+m.group(3)
    text,new_count=pat.subn(repl,text,count=1)
    if new_count==0:
        print('WARN no patch for',n,file=sys.stderr)
js.write_text(text)
print('patched candidate params')
PY

python3 -m http.server "$PORT" --directory "$REPO" >/tmp/autoresearch_server.log 2>&1 &
SERVER_PID=$!
sleep 2

RUN_LABEL="$(date +%Y%m%d-%H%M%S)"
python3 "$ROOT/eval.py" --url "http://127.0.0.1:$PORT" --label "$RUN_LABEL" --candidate "$CANDIDATE" | tee "$ROOT/last_eval.json"

BASELINE_FILE="$ROOT/baseline_score.txt"
BEST=$(python3 - <<'PY'
import csv, pathlib
p=pathlib.Path('/home/openclaw-agent/.openclaw/workspace/autoresearch-agot/results.csv')
if not p.exists():
    print(0); raise SystemExit
rows=list(csv.DictReader(p.open()))
print(max(float(r['combined']) for r in rows[:-1]) if len(rows)>1 else 0)
PY
)
CUR=$(python3 - <<'PY'
import json
j=json.load(open('/home/openclaw-agent/.openclaw/workspace/autoresearch-agot/last_eval.json'))
print(j['combined'])
PY
)
if [[ ! -f "$BASELINE_FILE" ]]; then
  echo "$CUR" > "$BASELINE_FILE"
  echo "baseline recorded: $CUR"
else
  BASE=$(cat "$BASELINE_FILE")
  THRESH=$(python3 - <<PY
print(max(float('$BEST'), float('$BASE')))
PY
)
  if awk -v c="$CUR" -v b="$THRESH" 'BEGIN{exit !(c>b)}'; then
    git add glass-cube-clock.js
    if git commit -m "autoresearch: improve shader score to ${CUR}" >/dev/null 2>&1; then
      KEEP_PATCHED=1
    fi
  fi
fi

echo "run complete: combined=$CUR best_before=$BEST"
