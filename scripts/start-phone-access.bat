@echo off
title Athlete OS - Phone Access
cd /d "%~dp0.."

echo.
echo  ============================================
echo   ATHLETE OS - Phone Connection Helper
echo  ============================================
echo.

for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4"') do (
  set "IP=%%a"
  goto :foundip
)
:foundip
set IP=%IP: =%

echo  PC Wi-Fi IP: %IP%
echo  PC Wi-Fi name: (check Settings - must match your phone)
echo.
echo  START BOTH servers below, then on your phone try:
echo.
echo    https://%IP%:3443   (primary - accept cert warning)
echo    http://%IP%:3456    (fallback if https fails)
echo.
echo  Phone checklist:
echo    [ ] Phone on SAME Wi-Fi as this PC (not mobile data)
echo    [ ] NOT on Guest Wi-Fi (guest networks block device-to-device)
echo    [ ] Accept certificate warning for https
echo.
echo  Starting HTTPS on 3443 and HTTP on 3456...
echo  Keep this window open. Press Ctrl+C to stop both.
echo  ============================================
echo.

start "Athlete OS HTTPS" /min cmd /c "python -u scripts/start-server-https.py 3443"
timeout /t 2 /nobreak >nul
python -m http.server 3456 --bind 0.0.0.0
