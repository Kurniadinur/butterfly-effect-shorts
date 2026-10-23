@echo off
title Remotion Studio - Butterfly Effect
cd /d "%~dp0"
echo Membuka Remotion Studio...
call npx remotion studio src/index.ts
pause
