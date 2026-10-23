@echo off
setlocal enabledelayedexpansion
title Render Butterfly Effect di Cloud GitHub (Gratis & Otomatis)
cd /d "%~dp0"

REM Pastikan path git dan gh terdeteksi
set "PATH=%LOCALAPPDATA%\Programs\MinGit\cmd;%LOCALAPPDATA%\Microsoft\WinGet\Packages\GitHub.cli_Microsoft.Winget.Source_8wekyb3d8bbwe\bin;%PATH%"

REM Konfigurasi SSL dan auth git
git config --global http.sslBackend "schannel" >nul 2>&1
call gh auth setup-git >nul 2>&1

set COMPOSITION=ButterflyEffect-Shorts
set OUTPUT_NAME=butterfly_effect_shorts.mp4

cls
echo ================================================================
echo       RENDER BUTTERFLY EFFECT DI GITHUB CLOUD (RAM 16GB)
echo ================================================================
echo   Komposisi : %COMPOSITION%
echo   Output    : %OUTPUT_NAME%
echo ================================================================
echo.

echo [1/4] Mengirim update kode & aset terbaru ke GitHub...
git add .
git commit -m "Trigger cloud render: %COMPOSITION%" >nul 2>&1
git push origin main
if %errorlevel% neq 0 (
    echo [Peringatan] Push gagal atau tidak ada perubahan baru. Melanjutkan trigger cloud...
)

echo.
echo [2/4] Menyalakan Cloud Runner di GitHub Actions...
gh workflow run render.yml -f composition=%COMPOSITION% -f output_filename=%OUTPUT_NAME%
if %errorlevel% neq 0 (
    echo [ERROR] Gagal memicu workflow GitHub.
    echo Pastikan repo GitHub sudah di-setup dengan menjalankan 'setup_github_sekali.bat'.
    pause
    exit /b 1
)

REM Tunggu 3 detik agar ID run tercatat di GitHub
timeout /t 3 /nobreak >nul

REM Ambil ID run terbaru secara otomatis
set RUN_ID=
for /f "tokens=*" %%i in ('gh run list --workflow=render.yml --limit 1 --json databaseId --jq ".[0].databaseId"') do set RUN_ID=%%i

echo.
echo [3/4] Sedang merender di Cloud (Run ID: !RUN_ID!)...
echo (Server GitHub RAM 16GB sedang bekerja, laptop Anda tetap dingin!)
if not "!RUN_ID!"=="" (
    gh run watch !RUN_ID! --exit-status
) else (
    gh run watch --exit-status
)

echo.
echo [4/4] Mengunduh hasil video MP4 dari Cloud ke folder out/...
if not exist "out" mkdir out
if exist "out\%OUTPUT_NAME%" del /f /q "out\%OUTPUT_NAME%" >nul 2>&1
if exist "out\temp_cloud" rmdir /s /q "out\temp_cloud" >nul 2>&1

if not "!RUN_ID!"=="" (
    gh run download !RUN_ID! -n remotion-video --dir out/temp_cloud
) else (
    gh run download -n remotion-video --dir out/temp_cloud
)

if exist "out\temp_cloud\%OUTPUT_NAME%" (
    move /y "out\temp_cloud\%OUTPUT_NAME%" "out\%OUTPUT_NAME%" >nul
    rmdir /s /q "out\temp_cloud" >nul 2>&1
)

echo.
echo ================================================================
echo   SUKSES! Video selesai dirender dan tersimpan di:
echo   out\%OUTPUT_NAME%
echo ================================================================
echo.

if exist "out\%OUTPUT_NAME%" (
    explorer.exe /select,"%~dp0out\%OUTPUT_NAME%"
) else (
    explorer.exe "%~dp0out"
)

pause
