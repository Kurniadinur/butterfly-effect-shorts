@echo off
title Setup Akun GitHub Sekali Saja (ButterflyProject)
cd /d "%~dp0"

set "PATH=%LOCALAPPDATA%\Programs\MinGit\cmd;%LOCALAPPDATA%\Microsoft\WinGet\Packages\GitHub.cli_Microsoft.Winget.Source_8wekyb3d8bbwe\bin;%PATH%"

echo ================================================================
echo       SETUP REPOSITORY GITHUB (CUKUP DIJALANKAN SEKALI)
echo ================================================================
echo.

set /p REPO_NAME="Masukkan nama repository GitHub (default: butterfly-effect-shorts): "
if "%REPO_NAME%"=="" set REPO_NAME=butterfly-effect-shorts

echo.
echo [1/3] Menyiapkan git lokal...
git init
git config user.email "kreator@remotion.local"
git config user.name "Remotion Creator"

echo.
echo [2/3] Menambahkan file dan commit awal...
git add .
git commit -m "Initial commit: Butterfly Effect Forensic Storytelling Engine"

echo.
echo [3/3] Membuat repository privat di akun GitHub Anda dan push...
gh repo create %REPO_NAME% --private --source=. --remote=origin --push
if %errorlevel% neq 0 (
    echo [INFO] Jika repo sudah ada di GitHub, mencoba menghubungkan remote dan push...
    git remote add origin https://github.com/Kurniadinur/%REPO_NAME%.git >nul 2>&1
    git branch -M main
    git push -u origin main
)

echo.
echo ================================================================
echo              SETUP SELESAI DENGAN SUKSES!
echo ================================================================
echo Sekarang Anda sudah bisa langsung klik file:
echo    "render_di_cloud.bat"
echo untuk merender video Butterfly Effect di server GitHub Cloud secara gratis!
echo.
pause
