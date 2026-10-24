@echo off
title Butterfly Effect Studio UI
cd /d "%~dp0"

echo ================================================================
echo       MEMBUKA BUTTERFLY EFFECT STUDIO DASHBOARD (UI)
echo ================================================================
echo.

REM Cek apakah server UI di port 3333 sudah aktif
netstat -ano | findstr :3333 | findstr LISTENING >nul 2>&1
if %errorlevel% neq 0 (
    echo [1/2] Menyalakan Server UI Studio di background...
    start "Butterfly Studio Server" /B node scripts/ui_server.mjs
    timeout /t 2 /nobreak >nul
) else (
    echo [1/2] Server UI Studio sudah aktif di port 3333.
)

echo [2/2] Membuka browser ke dashboard studio...
start http://localhost:3333

echo.
echo ================================================================
echo   Dashboard UI terbuka di browser: http://localhost:3333
echo   (Tutup jendela ini jika sudah selesai)
echo ================================================================
pause
