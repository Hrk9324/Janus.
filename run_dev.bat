@echo off
chcp 65001 >nul
title PBL6 AI Short Video Moderation - Dev Server
cd /d "%~dp0"
echo [*] Khoi dong moi truong phat trien PBL6...
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0run_dev.ps1"
if %ERRORLEVEL% neq 0 (
    echo.
    echo [ERROR] Co loi xay ra trong qua trinh chay he thong!
    pause
)
