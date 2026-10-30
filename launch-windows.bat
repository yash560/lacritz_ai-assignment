@echo off
echo ========================================================
echo       Parakeet AI - Quick Launcher for Windows
echo ========================================================

where python >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [INFO] Python found. Launching Python Desktop Copilot...
    start python desktop_parakeet.py
) else (
    echo [INFO] Python not found in PATH. Launching Web interface...
)

where npm >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [INFO] Starting Next.js Web Interface on http://localhost:3000...
    npm run dev
) else (
    echo [ERROR] Please install Python 3.10+ or Node.js to run Parakeet AI.
)
pause
