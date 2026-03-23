#!/bin/bash
# Sync renders from watch folder to gallery repo
# Run via cron every 60s or as a file watcher

WATCH_DIR="/home/openclaw-agent/.openclaw/workspace/fatiha-proto/renders"
GALLERY_DIR="/home/openclaw-agent/.openclaw/workspace/fatiha-gallery"

mkdir -p "$WATCH_DIR" "$GALLERY_DIR/images/renders"

# Copy any new PNGs/MP4s to gallery
NEW_FILES=$(find "$WATCH_DIR" -newer "$GALLERY_DIR/.last-sync" -type f \( -name "*.png" -o -name "*.mp4" \) 2>/dev/null)

if [ -z "$NEW_FILES" ]; then
  exit 0
fi

for f in $NEW_FILES; do
  cp "$f" "$GALLERY_DIR/images/renders/"
  echo "Synced: $(basename $f)"
done

# Auto-update iterations.json with new entries
cd "$GALLERY_DIR"
python3 -c "
import json, os, glob, time
renders = glob.glob('images/renders/*.png') + glob.glob('images/renders/*.mp4')
with open('iterations.json') as f:
    data = json.load(f)
existing_ids = {it.get('id') for it in data}
for r in sorted(renders):
    rid = os.path.basename(r).replace('.png','').replace('.mp4','')
    if rid in existing_ids:
        continue
    data.append({
        'id': rid,
        'title': rid.replace('-',' ').replace('_',' '),
        'image': r,
        'surah': 1,
        'surahName': 'Al-Fatiha',
        'verse': 'Bismillah',
        'version': rid,
        'generator': 'Devon/Opus',
        'created': time.strftime('%Y-%m-%dT%H:%M'),
        'builderNotes': 'Auto-synced from renders folder',
        'criticNotes': ''
    })
with open('iterations.json','w') as f:
    json.dump(data, f, indent=2)
" 2>/dev/null

# Git push
git add -A
git commit -m "auto-sync: $(echo $NEW_FILES | wc -w) new renders" 2>/dev/null
git push origin master 2>/dev/null

touch "$GALLERY_DIR/.last-sync"
