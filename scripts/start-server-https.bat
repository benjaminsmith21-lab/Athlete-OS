@echo off
title Athlete OS HTTPS Server
cd /d "%~dp0.."

echo.
echo  Starting HTTPS server...
echo  (Use this if http:// gives "secure connection" error on phone)
echo.

python -u scripts/start-server-https.py 3443
