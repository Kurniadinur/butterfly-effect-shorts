@echo off
setlocal enabledelayedexpansion
title Render Lokal - Butterfly Effect Shorts
cd /d "%~dp0"
echo ================================================================
echo       RENDER LOKAL VIDEO BUTTERFLY EFFECT (MP4 1080x1920)
echo ================================================================
echo.
echo Pilih alur render:
echo   [1] Render langsung cerita yang aktif di src/data/currentStory.ts
echo   [2] Sutradara AI buat naskah, visual, VO & subtitle BARU dulu lalu render
echo ================================================================
set /p PILIH_MODE="Pilih mode [1/2] (Tekan ENTER untuk 1): "

if "!PILIH_MODE!"=="2" (
    echo.
    set /p TOPIK="Masukkan judul/topik baru (atau ENTER untuk default Tembok Berlin): "
    if "!TOPIK!"=="" (
        set "TOPIK=Runtuhnya Tembok Berlin Karena Salah Baca Memo"
    )
    echo.
    echo Menjalankan Sutradara AI untuk memproduksi cerita baru...
    call node scripts/ai_director_pipeline.mjs "!TOPIK!"
    if !errorlevel! neq 0 (
        echo [ERROR] Pipeline AI Sutradara gagal. Pembatalan render lokal.
        pause
        exit /b 1
    )
    echo.
)

if not exist "out" mkdir out
echo Sedang merender video MP4 dengan Remotion...
call npx remotion render src/index.ts ButterflyEffect-Shorts out/butterfly_effect_shorts.mp4
echo.
echo Selesai! Video tersimpan di: out\butterfly_effect_shorts.mp4
pause
