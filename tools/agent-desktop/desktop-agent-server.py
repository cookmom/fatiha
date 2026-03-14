#!/usr/bin/env python3
"""
Agent Desktop Server — Windows desktop control for AI agents.
Listens on localhost:9878, accepts JSON commands over TCP.
Protocol: newline-delimited JSON. Each request/response is one JSON object + \n.

Privacy mode: Ctrl+Shift+F12 toggles. When active, screenshots return black,
mouse/keyboard commands are blocked. Tray icon shows red (private) or green (active).

Requires: pyautogui, pillow, pystray, keyboard, pywin32
"""

import json
import socket
import threading
import sys
import os
import io
import base64
import ctypes
import logging
from pathlib import Path

import pyautogui
import keyboard
from PIL import Image, ImageDraw
import pystray
import win32gui
import win32con
import win32process

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------

HOST = "127.0.0.1"
PORT = 9878
CONFIG_DIR = Path(os.environ["APPDATA"]) / "AgentDesktop"
CONFIG_FILE = CONFIG_DIR / "config.json"

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%H:%M:%S",
)
log = logging.getLogger("agent-desktop")

# Disable pyautogui fail-safe (corner pause) — agents need full screen access
pyautogui.FAILSAFE = False

# ---------------------------------------------------------------------------
# State
# ---------------------------------------------------------------------------

privacy_mode = False
tray_icon = None
server_socket = None


def load_config():
    """Load persisted config (privacy state)."""
    global privacy_mode
    try:
        if CONFIG_FILE.exists():
            cfg = json.loads(CONFIG_FILE.read_text())
            privacy_mode = cfg.get("privacy", False)
    except Exception:
        pass


def save_config():
    """Persist current config."""
    CONFIG_DIR.mkdir(parents=True, exist_ok=True)
    CONFIG_FILE.write_text(json.dumps({"privacy": privacy_mode}, indent=2))


# ---------------------------------------------------------------------------
# Tray icon
# ---------------------------------------------------------------------------

def make_icon_image(color):
    """Generate a simple 64x64 circle icon."""
    img = Image.new("RGBA", (64, 64), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    draw.ellipse([4, 4, 60, 60], fill=color, outline=(255, 255, 255, 200), width=2)
    # Draw a small "A" in the center for "Agent"
    try:
        draw.text((22, 16), "A", fill=(255, 255, 255, 230))
    except Exception:
        pass
    return img


def update_tray():
    """Update tray icon color based on privacy state."""
    global tray_icon
    if tray_icon is None:
        return
    color = (220, 40, 40, 255) if privacy_mode else (40, 200, 40, 255)
    tray_icon.icon = make_icon_image(color)
    status = "PRIVATE" if privacy_mode else "Active"
    tray_icon.title = f"Agent Desktop — {status}"


def toggle_privacy():
    """Toggle privacy mode (called from hotkey)."""
    global privacy_mode
    privacy_mode = not privacy_mode
    save_config()
    update_tray()
    state = "ON (blocking)" if privacy_mode else "OFF (active)"
    log.info(f"Privacy mode: {state}")


def on_tray_quit(icon, item):
    """Quit from tray menu."""
    log.info("Shutting down via tray menu")
    icon.stop()
    if server_socket:
        server_socket.close()
    os._exit(0)


def on_tray_toggle(icon, item):
    """Toggle privacy from tray menu."""
    toggle_privacy()


def start_tray():
    """Start the system tray icon in a background thread."""
    global tray_icon
    color = (220, 40, 40, 255) if privacy_mode else (40, 200, 40, 255)
    menu = pystray.Menu(
        pystray.MenuItem("Toggle Privacy", on_tray_toggle),
        pystray.MenuItem("Quit", on_tray_quit),
    )
    tray_icon = pystray.Icon(
        "agent-desktop",
        make_icon_image(color),
        "Agent Desktop",
        menu,
    )
    update_tray()
    # pystray.run() blocks, so run in thread
    threading.Thread(target=tray_icon.run, daemon=True).start()


# ---------------------------------------------------------------------------
# Command handlers
# ---------------------------------------------------------------------------

def cmd_status(params):
    return {"status": "ok", "privacy": privacy_mode}


def cmd_screenshot(params):
    max_width = params.get("max_width", 1920)
    if privacy_mode:
        # Return a small black image
        img = Image.new("RGB", (max_width, int(max_width * 9 / 16)), (0, 0, 0))
    else:
        img = pyautogui.screenshot()
        if img.width > max_width:
            ratio = max_width / img.width
            img = img.resize((max_width, int(img.height * ratio)), Image.LANCZOS)

    buf = io.BytesIO()
    img.save(buf, format="PNG", optimize=True)
    b64 = base64.b64encode(buf.getvalue()).decode("ascii")
    return {"status": "ok", "image": b64, "width": img.width, "height": img.height}


def cmd_click(params):
    if privacy_mode:
        return {"status": "privacy_mode"}
    x, y = params["x"], params["y"]
    button = params.get("button", "left")
    double = params.get("double", False)
    clicks = 2 if double else 1
    pyautogui.click(x, y, clicks=clicks, button=button)
    return {"status": "ok"}


def cmd_move(params):
    if privacy_mode:
        return {"status": "privacy_mode"}
    pyautogui.moveTo(params["x"], params["y"])
    return {"status": "ok"}


def cmd_type(params):
    if privacy_mode:
        return {"status": "privacy_mode"}
    pyautogui.typewrite(params["text"], interval=0.02) if all(
        ord(c) < 128 for c in params["text"]
    ) else pyautogui.write(params["text"])
    return {"status": "ok"}


def cmd_key(params):
    if privacy_mode:
        return {"status": "privacy_mode"}
    keys = params["keys"]  # e.g. "ctrl+z", "tab", "enter"
    pyautogui.hotkey(*keys.split("+"))
    return {"status": "ok"}


def cmd_scroll(params):
    if privacy_mode:
        return {"status": "privacy_mode"}
    x = params.get("x", None)
    y = params.get("y", None)
    clicks = params.get("clicks", 3)
    if x is not None and y is not None:
        pyautogui.moveTo(x, y)
    pyautogui.scroll(clicks)
    return {"status": "ok"}


def cmd_get_cursor(params):
    pos = pyautogui.position()
    return {"status": "ok", "x": pos.x, "y": pos.y}


def cmd_get_windows(params):
    """List visible windows with title, position, size."""
    windows = []

    def enum_handler(hwnd, _):
        if not win32gui.IsWindowVisible(hwnd):
            return
        title = win32gui.GetWindowText(hwnd)
        if not title:
            return
        try:
            rect = win32gui.GetWindowRect(hwnd)
            _, pid = win32process.GetWindowThreadProcessId(hwnd)
            windows.append({
                "title": title,
                "hwnd": hwnd,
                "pid": pid,
                "x": rect[0], "y": rect[1],
                "width": rect[2] - rect[0],
                "height": rect[3] - rect[1],
            })
        except Exception:
            pass

    win32gui.EnumWindows(enum_handler, None)
    return {"status": "ok", "windows": windows}


def cmd_focus_window(params):
    """Bring a window to front by partial title match."""
    target = params["title"].lower()
    result = {"status": "error", "message": "Window not found"}

    def enum_handler(hwnd, _):
        nonlocal result
        if not win32gui.IsWindowVisible(hwnd):
            return
        title = win32gui.GetWindowText(hwnd)
        if target in title.lower():
            try:
                # Restore if minimized
                if win32gui.IsIconic(hwnd):
                    win32gui.ShowWindow(hwnd, win32con.SW_RESTORE)
                win32gui.SetForegroundWindow(hwnd)
                result = {"status": "ok", "title": title}
            except Exception as e:
                result = {"status": "error", "message": str(e)}

    win32gui.EnumWindows(enum_handler, None)
    return result


COMMANDS = {
    "status": cmd_status,
    "screenshot": cmd_screenshot,
    "click": cmd_click,
    "move": cmd_move,
    "type": cmd_type,
    "key": cmd_key,
    "scroll": cmd_scroll,
    "get_cursor": cmd_get_cursor,
    "get_windows": cmd_get_windows,
    "focus_window": cmd_focus_window,
}


# ---------------------------------------------------------------------------
# TCP server
# ---------------------------------------------------------------------------

def handle_client(conn, addr):
    """Handle a single TCP connection (newline-delimited JSON)."""
    log.info(f"Client connected: {addr}")
    buf = b""
    try:
        while True:
            data = conn.recv(65536)
            if not data:
                break
            buf += data
            while b"\n" in buf:
                line, buf = buf.split(b"\n", 1)
                line = line.strip()
                if not line:
                    continue
                try:
                    req = json.loads(line)
                    cmd_type = req.get("type", "")
                    params = req.get("params", {})
                    handler = COMMANDS.get(cmd_type)
                    if handler:
                        resp = handler(params)
                    else:
                        resp = {"status": "error", "message": f"Unknown command: {cmd_type}"}
                except json.JSONDecodeError:
                    resp = {"status": "error", "message": "Invalid JSON"}
                except Exception as e:
                    resp = {"status": "error", "message": str(e)}

                conn.sendall(json.dumps(resp).encode() + b"\n")
    except (ConnectionResetError, BrokenPipeError):
        pass
    finally:
        conn.close()
        log.info(f"Client disconnected: {addr}")


def start_server():
    """Start the TCP server."""
    global server_socket
    server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server_socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    server_socket.bind((HOST, PORT))
    server_socket.listen(5)
    log.info(f"Listening on {HOST}:{PORT}")

    while True:
        try:
            conn, addr = server_socket.accept()
            threading.Thread(target=handle_client, args=(conn, addr), daemon=True).start()
        except OSError:
            break


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    log.info("Agent Desktop Server starting...")

    # Load persisted config
    load_config()

    # Register global hotkey
    keyboard.add_hotkey("ctrl+shift+f12", toggle_privacy)
    log.info("Privacy hotkey: Ctrl+Shift+F12")

    # Start tray icon
    start_tray()

    # Start TCP server (blocks)
    start_server()


if __name__ == "__main__":
    main()
