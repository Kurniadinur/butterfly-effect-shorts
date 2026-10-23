@echo off
title Render Lokal - Butterfly Effect Shorts
cd /d "%~dp0"
echo ================================================================
echo       RENDER LOKAL VIDEO BUTTERFLY EFFECT (MP4 1080x1920)
echo ================================================================
echo.
if not exist "out" mkdir out
call npx remotion render src/index.ts ButterflyEffect-Shorts out/butterfly_effect_shorts.mp4
echo.
echo Selesai! Video tersimpan di: out\butterfly_effect_shorts.mp4
pause
