#!/usr/bin/env python3
"""
Blender MCP Bridge — sends commands to Blender via TCP socket.
Used by Bob (builder agent) to drive Blender from WSL2.

Usage:
    python3 blender-bridge.py scene          # get scene info
    python3 blender-bridge.py exec "code"    # execute bpy code
    python3 blender-bridge.py screenshot     # capture viewport
    python3 blender-bridge.py object "name"  # get object info
"""

import socket
import json
import sys
import time
import select

HOST = 'localhost'
PORT = 9877
TIMEOUT = 30


def send_command(cmd_type, params=None):
    """Send a command to Blender MCP and return the response."""
    if params is None:
        params = {}

    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    sock.connect((HOST, PORT))

    cmd = json.dumps({"type": cmd_type, "params": params})
    sock.sendall(cmd.encode('utf-8'))

    data = b''
    start = time.time()
    while time.time() - start < TIMEOUT:
        r, _, _ = select.select([sock], [], [], 1.0)
        if r:
            chunk = sock.recv(16384)
            if chunk:
                data += chunk
                try:
                    parsed = json.loads(data.decode())
                    sock.close()
                    return parsed
                except json.JSONDecodeError:
                    pass
            else:
                break

    sock.close()
    if data:
        return json.loads(data.decode())
    return {"status": "error", "message": "No response from Blender"}


def get_scene_info():
    return send_command("get_scene_info")


def execute_code(code):
    return send_command("execute_code", {"code": code})


def get_object_info(name):
    return send_command("get_object_info", {"name": name})


def get_screenshot(filepath="/tmp/blender_viewport.png", max_size=1200):
    return send_command("get_viewport_screenshot", {
        "filepath": filepath,
        "max_size": max_size
    })


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: blender-bridge.py [scene|exec|object|screenshot] [args]")
        sys.exit(1)

    action = sys.argv[1]

    if action == "scene":
        result = get_scene_info()
    elif action == "exec":
        if len(sys.argv) < 3:
            print("Usage: blender-bridge.py exec 'python code'")
            sys.exit(1)
        result = execute_code(sys.argv[2])
    elif action == "object":
        if len(sys.argv) < 3:
            print("Usage: blender-bridge.py object 'ObjectName'")
            sys.exit(1)
        result = get_object_info(sys.argv[2])
    elif action == "screenshot":
        path = sys.argv[2] if len(sys.argv) > 2 else "/tmp/blender_viewport.png"
        result = get_screenshot(path)
    else:
        print(f"Unknown action: {action}")
        sys.exit(1)

    print(json.dumps(result, indent=2))
