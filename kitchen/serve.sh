#!/bin/bash
# Kitchen dashboard HTTP server — auto-restarts on crash
PORT=4000
DIR="/home/openclaw-agent/.openclaw/workspace/canvas/kitchen"
while true; do
  echo "[$(date)] Starting kitchen server on port $PORT"
  cd "$DIR" && python3 -m http.server "$PORT" --bind 0.0.0.0 2>&1
  echo "[$(date)] Server died, restarting in 2s..."
  sleep 2
done
