@echo off
setlocal enabledelayedexpansion
title AI Director - Buat Cerita Butterfly Effect Baru
cd /d "%~dp0"

cls
echo ================================================================
echo       AI DIRECTOR & SUTRADARA OTOMATIS (100%% AI DRIVEN)
echo ================================================================
echo  Pipeline ini akan secara otomatis:
echo  1. AI Sutradara menyusun naskah & storyboard dari nol (Unik)
echo  2. Menentukan visual dinamis (foto arsip vs sketsa animasi)
echo  3. Mensintesis voiceover berkualitas tinggi (Gemini 3.8 TTS)
echo  4. Menyelaraskan subtitle milidetik via Groq Cloud (Whisper V3)
echo  5. Menghasilkan video yang siap tayang di YouTube / TikTok
echo ================================================================
echo.

set /p TOPIK="Masukkan topik baru (atau tekan ENTER untuk default Tembok Berlin): "

if "!TOPIK!"=="" (
    set "TOPIK=Runtuhnya Tembok Berlin Karena Salah Baca Memo"
)

echo.
echo Sedang memproses produksi AI: "!TOPIK!"...
echo.

node scripts/ai_director_pipeline.mjs "!TOPIK!"

if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Terjadi kesalahan dalam pipeline produksi.
    pause
    exit /b %errorlevel%
)

echo.
echo ================================================================
echo  PILIHAN LANGKAH SELANJUTNYA:
echo  [1] Buka Studio Preview di Browser (buka_studio.bat)
echo  [2] Render Video di Cloud GitHub (render_di_cloud.bat - Bebas Lag)
echo  [3] Keluar
echo ================================================================
set /p PILIHAN="Pilih opsi (1/2/3): "

if "!PILIHAN!"=="1" (
    start buka_studio.bat
) else if "!PILIHAN!"=="2" (
    call render_di_cloud.bat
)

pause
