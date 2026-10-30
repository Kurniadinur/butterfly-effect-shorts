import asyncio
import os
import edge_tts
import subprocess

async def generate_doctor_vo(text, out_mp3_path, out_wav_path, voice='id-ID-ArdiNeural', rate='-3%', pitch='-1Hz'):
    print(f"[Doctor VO] Generating voiceover using {voice} (rate: {rate}, pitch: {pitch})...")
    communicate = edge_tts.Communicate(text, voice, rate=rate, pitch=pitch)
    await communicate.save(out_mp3_path)
    print(f"[Doctor VO] Saved MP3: {out_mp3_path}")
    
    # Convert MP3 to WAV using ffmpeg for maximum compatibility with Whisper & Remotion
    ffmpeg_cmd = ['ffmpeg', '-y', '-i', out_mp3_path, '-ar', '44100', '-ac', '2', out_wav_path]
    res = subprocess.run(ffmpeg_cmd, capture_output=True, text=True)
    if res.returncode == 0:
        print(f"[Doctor VO] Converted to WAV: {out_wav_path}")
    else:
        print(f"[Doctor VO] Note: ffmpeg failed or not found ({res.stderr}), keeping MP3/WAV")
        # If ffmpeg not available, copy or read
        import shutil
        shutil.copyfile(out_mp3_path, out_wav_path)

if __name__ == '__main__':
    # Test script
    sample = "Secara medis, saat cairan ini tertahan di dalam panggul, kandung kemih dipaksa bekerja di bawah tekanan ekstrem."
    asyncio.run(generate_doctor_vo(sample, 'test_doc.mp3', 'test_doc.wav'))
