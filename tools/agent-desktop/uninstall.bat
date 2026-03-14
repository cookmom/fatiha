@echo off
echo ============================================
echo   Agent Desktop Server — Uninstaller
echo ============================================
echo.

:: Kill running server
taskkill /f /fi "WINDOWTITLE eq desktop-agent-server*" >nul 2>&1
wmic process where "commandline like '%%desktop-agent-server%%'" call terminate >nul 2>&1
echo [OK] Stopped running server (if any)

:: Remove startup shortcut
set "SHORTCUT=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup\AgentDesktop.lnk"
if exist "%SHORTCUT%" (
    del /f "%SHORTCUT%"
    echo [OK] Startup shortcut removed
)

:: Remove install directory
set "INSTALL_DIR=%APPDATA%\AgentDesktop"
if exist "%INSTALL_DIR%" (
    rmdir /s /q "%INSTALL_DIR%"
    echo [OK] Installation directory removed
)

:: Remove firewall rule
netsh advfirewall firewall delete rule name="AgentDesktop" >nul 2>&1
if not errorlevel 1 (
    echo [OK] Firewall rule removed
) else (
    echo [INFO] No firewall rule found (or needs admin)
)

echo.
echo ============================================
echo   Agent Desktop fully removed.
echo ============================================
pause
