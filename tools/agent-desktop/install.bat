@echo off
setlocal enabledelayedexpansion

echo ============================================
echo   Agent Desktop Server — Installer
echo ============================================
echo.

:: Check Python
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python not found. Install Python 3.8+ and add to PATH.
    pause
    exit /b 1
)

:: Verify Python version >= 3.8
for /f "tokens=2 delims= " %%v in ('python --version 2^>^&1') do set PYVER=%%v
for /f "tokens=1,2 delims=." %%a in ("!PYVER!") do (
    if %%a LSS 3 (
        echo [ERROR] Python 3.8+ required, found !PYVER!
        pause
        exit /b 1
    )
    if %%a EQU 3 if %%b LSS 8 (
        echo [ERROR] Python 3.8+ required, found !PYVER!
        pause
        exit /b 1
    )
)
echo [OK] Python !PYVER! detected

:: Install dependencies
echo.
echo Installing Python dependencies...
pip install pyautogui pillow pystray keyboard pywin32
if errorlevel 1 (
    echo [WARN] Some packages may have failed. Check above output.
)
echo [OK] Dependencies installed

:: Create install directory
set "INSTALL_DIR=%APPDATA%\AgentDesktop"
if not exist "%INSTALL_DIR%" mkdir "%INSTALL_DIR%"

:: Copy server script
copy /y "%~dp0desktop-agent-server.py" "%INSTALL_DIR%\desktop-agent-server.py" >nul
echo [OK] Server installed to %INSTALL_DIR%

:: Create default config if it doesn't exist
if not exist "%INSTALL_DIR%\config.json" (
    echo {"privacy": false}> "%INSTALL_DIR%\config.json"
    echo [OK] Default config created
) else (
    echo [OK] Existing config preserved
)

:: Create startup shortcut via PowerShell
set "STARTUP_DIR=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup"
set "SHORTCUT=%STARTUP_DIR%\AgentDesktop.lnk"
powershell -NoProfile -Command ^
    "$ws = New-Object -ComObject WScript.Shell; ^
     $sc = $ws.CreateShortcut('%SHORTCUT%'); ^
     $sc.TargetPath = (Get-Command pythonw -ErrorAction SilentlyContinue).Source; ^
     if (-not $sc.TargetPath) { $sc.TargetPath = (Get-Command python).Source }; ^
     $sc.Arguments = '\"%INSTALL_DIR%\desktop-agent-server.py\"'; ^
     $sc.WorkingDirectory = '%INSTALL_DIR%'; ^
     $sc.WindowStyle = 7; ^
     $sc.Description = 'Agent Desktop Server'; ^
     $sc.Save()"
if exist "%SHORTCUT%" (
    echo [OK] Startup shortcut created
) else (
    echo [WARN] Could not create startup shortcut
)

:: Add firewall rule (needs admin — skip gracefully if not)
netsh advfirewall firewall show rule name="AgentDesktop" >nul 2>&1
if errorlevel 1 (
    netsh advfirewall firewall add rule name="AgentDesktop" dir=in action=allow protocol=TCP localport=9878 remoteip=127.0.0.1 >nul 2>&1
    if errorlevel 1 (
        echo [WARN] Could not add firewall rule (needs admin). Server will still work on localhost.
    ) else (
        echo [OK] Firewall rule added (localhost only, port 9878)
    )
) else (
    echo [OK] Firewall rule already exists
)

echo.
echo ============================================
echo   Installation complete!
echo.
echo   Server location: %INSTALL_DIR%
echo   Auto-start: enabled (Windows startup)
echo   Port: 9878 (localhost only)
echo.
echo   Privacy hotkey: Ctrl+Shift+F12
echo   Tray icon: green = active, red = private
echo.
echo   To start now, run:
echo     pythonw "%INSTALL_DIR%\desktop-agent-server.py"
echo ============================================
pause
