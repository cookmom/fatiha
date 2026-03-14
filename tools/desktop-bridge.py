#!/usr/bin/env python3
"""
Desktop Bridge — WSL2 client for Agent Desktop Server.
Connects to the Windows-side server on localhost:9878.

Usage:
    python3 desktop-bridge.py screenshot [output.png]
    python3 desktop-bridge.py click <x> <y> [button] [--double]
    python3 desktop-bridge.py move <x> <y>
    python3 desktop-bridge.py type <text>
    python3 desktop-bridge.py key <keys>
    python3 desktop-bridge.py scroll <x> <y> <clicks>
    python3 desktop-bridge.py get_windows
    python3 desktop-bridge.py focus_window <title>
    python3 desktop-bridge.py get_cursor
    python3 desktop-bridge.py status

As a library:
    from desktop_bridge import DesktopBridge
    bridge = DesktopBridge()
    bridge.screenshot("/tmp/screen.png")
    bridge.click(500, 300)
"""

import json
import socket
import sys
import base64
from pathlib import Path

HOST = "127.0.0.1"
PORT = 9878
TIMEOUT = 30  # seconds


class DesktopBridge:
    """Client for the Agent Desktop Server."""

    def __init__(self, host=HOST, port=PORT):
        self.host = host
        self.port = port

    def _send(self, command: str, params: dict = None) -> dict:
        """Send a command and return the response."""
        req = json.dumps({"type": command, "params": params or {}}) + "\n"
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(TIMEOUT)
        try:
            sock.connect((self.host, self.port))
            sock.sendall(req.encode())
            # Read response until newline
            buf = b""
            while b"\n" not in buf:
                chunk = sock.recv(1048576)  # 1MB chunks for screenshots
                if not chunk:
                    break
                buf += chunk
            return json.loads(buf.strip())
        finally:
            sock.close()

    def status(self) -> dict:
        return self._send("status")

    def screenshot(self, output_path: str = None, max_width: int = 1920) -> dict:
        """Capture screenshot. If output_path given, saves PNG there."""
        resp = self._send("screenshot", {"max_width": max_width})
        if output_path and resp.get("status") == "ok" and "image" in resp:
            img_bytes = base64.b64decode(resp["image"])
            Path(output_path).write_bytes(img_bytes)
            print(f"Screenshot saved: {output_path} ({resp['width']}x{resp['height']})")
            # Don't return the huge base64 string
            return {"status": "ok", "width": resp["width"], "height": resp["height"], "path": output_path}
        return resp

    def click(self, x: int, y: int, button: str = "left", double: bool = False) -> dict:
        return self._send("click", {"x": x, "y": y, "button": button, "double": double})

    def move(self, x: int, y: int) -> dict:
        return self._send("move", {"x": x, "y": y})

    def type_text(self, text: str) -> dict:
        return self._send("type", {"text": text})

    def press_key(self, keys: str) -> dict:
        return self._send("key", {"keys": keys})

    def scroll(self, x: int, y: int, clicks: int = 3) -> dict:
        return self._send("scroll", {"x": x, "y": y, "clicks": clicks})

    def get_windows(self) -> dict:
        return self._send("get_windows")

    def focus_window(self, title: str) -> dict:
        return self._send("focus_window", {"title": title})

    def get_cursor(self) -> dict:
        return self._send("get_cursor")


def main():
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)

    bridge = DesktopBridge()
    cmd = sys.argv[1]

    try:
        if cmd == "screenshot":
            output = sys.argv[2] if len(sys.argv) > 2 else "/tmp/desktop-screenshot.png"
            result = bridge.screenshot(output)
        elif cmd == "click":
            x, y = int(sys.argv[2]), int(sys.argv[3])
            button = sys.argv[4] if len(sys.argv) > 4 and sys.argv[4] != "--double" else "left"
            double = "--double" in sys.argv
            result = bridge.click(x, y, button, double)
        elif cmd == "move":
            result = bridge.move(int(sys.argv[2]), int(sys.argv[3]))
        elif cmd == "type":
            result = bridge.type_text(sys.argv[2])
        elif cmd == "key":
            result = bridge.press_key(sys.argv[2])
        elif cmd == "scroll":
            result = bridge.scroll(int(sys.argv[2]), int(sys.argv[3]), int(sys.argv[4]))
        elif cmd == "get_windows":
            result = bridge.get_windows()
        elif cmd == "focus_window":
            result = bridge.focus_window(sys.argv[2])
        elif cmd == "get_cursor":
            result = bridge.get_cursor()
        elif cmd == "status":
            result = bridge.status()
        else:
            print(f"Unknown command: {cmd}")
            sys.exit(1)

        print(json.dumps(result, indent=2))
    except ConnectionRefusedError:
        print(json.dumps({"status": "error", "message": "Cannot connect to Agent Desktop Server. Is it running on Windows?"}))
        sys.exit(1)
    except Exception as e:
        print(json.dumps({"status": "error", "message": str(e)}))
        sys.exit(1)


if __name__ == "__main__":
    main()
