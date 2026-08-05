@echo off
title Athlete OS Server
cd /d "%~dp0.."

for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4"') do (
  set "IP=%%a"
  goto :found
)
:found
set IP=%IP: =%

echo.
echo  ========================================
echo   ATHLETE OS - Phone Access
echo  ========================================
echo.
echo  1. Phone must be on the SAME Wi-Fi as this PC
echo  2. On your phone browser, open:
echo.
echo       http://%IP%:3456
echo.
echo  Do NOT use your public internet IP (180.x.x.x).
echo  Press Ctrl+C to stop the server.
echo  ========================================
echo.

python -m http.server 3456 --bind 0.0.0.0
