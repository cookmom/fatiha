# Agent Desktop Server

Windows desktop control server for AI agents. Runs on Windows, controlled from WSL2/Linux via TCP.

## Quick Start

1. **Install** (on Windows): Double-click `install.bat`
2. **Start**: `pythonw "%APPDATA%\AgentDesktop\desktop-agent-server.py"` (auto-starts on boot)
3. **From WSL2**: `python3 ~/workspace/tools/desktop-bridge.py screenshot /tmp/screen.png`

## Protocol

TCP on `localhost:9878`. Newline-delimited JSON.

**Request:** `{"type": "command_name", "params": {...}}\n`
**Response:** `{"status": "ok", ...}\n`

## Commands

| Command | Params | Description |
|---------|--------|-------------|
| `status` | — | Health check, returns privacy state |
| `screenshot` | `max_width` (default 1920) | Capture screen as base64 PNG |
| `click` | `x`, `y`, `button`, `double` | Mouse click |
| `move` | `x`, `y` | Move cursor |
| `type` | `text` | Type text |
| `key` | `keys` (e.g. "ctrl+z") | Press key combo |
| `scroll` | `x`, `y`, `clicks` | Scroll wheel |
| `get_windows` | — | List open windows |
| `focus_window` | `title` (partial match) | Bring window to front |
| `get_cursor` | — | Current cursor position |

## Privacy Mode

**Hotkey:** `Ctrl+Shift+F12` toggles privacy on/off.

When private:
- Screenshots return a black image
- Mouse/keyboard commands are blocked (return `{"status": "privacy_mode"}`)
- Tray icon turns **red**

When active:
- Full desktop control enabled
- Tray icon is **green**

State persists across restarts in `%APPDATA%\AgentDesktop\config.json`.

## WSL2 Bridge

```bash
# Screenshot
python3 desktop-bridge.py screenshot /tmp/screen.png

# Click
python3 desktop-bridge.py click 500 300

# Type text
python3 desktop-bridge.py type "hello world"

# Press keys
python3 desktop-bridge.py key "ctrl+s"

# List windows
python3 desktop-bridge.py get_windows

# Focus window
python3 desktop-bridge.py focus_window "Chrome"
```

## Architecture

```
WSL2 Agent  ──TCP──►  Windows Server (localhost:9878)
                           │
                           ├─ pyautogui (mouse/keyboard/screenshot)
                           ├─ pywin32 (window management)
                           ├─ pystray (system tray icon)
                           └─ keyboard (global hotkey)
```

## Uninstall

Double-click `uninstall.bat`. Removes everything: server, config, startup shortcut, firewall rule.
