#!/bin/bash
# Restart Blender and wait for MCP to come online

POWERSHELL="/mnt/c/Windows/System32/WindowsPowerShell/v1.0/powershell.exe"

echo "Restart actions disabled for safety."
echo "This script will no longer kill/start Blender automatically."
echo "Use Blender UI + MCP controls manually."

echo "Waiting for MCP on port 9877..."
for i in $(seq 1 20); do
    sleep 3
    STATUS=$(python3 -c "
import socket
s=socket.socket()
s.settimeout(3)
try:
    s.connect(('localhost',9877))
    s.close()
    print('UP')
except:
    print('WAIT')
" 2>/dev/null)
    if [ "$STATUS" = "UP" ]; then
        echo "MCP online!"
        exit 0
    fi
    echo "  waiting... ($i/20)"
done
echo "MCP did not come online automatically"
echo "Please enable the MCP addon in Blender: Edit > Preferences > Add-ons > Blender MCP"
exit 1
