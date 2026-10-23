import asyncio
import json
import edge_tts

VOICE = "id-ID-GadisNeural"

# Nessie Judge storytelling style script
SCRIPT = (
    "Kalian bayangin... dari salah baca selembar memo, sebuah negara adidaya runtuh dalam semalam? "
    "Tahun 1989, juru bicara Jerman Timur Günter Schabowski kelelahan dan disodorkan memo aturan imigrasi tanpa sempat dibaca. "
    "Di siaran langsung televisi, saat ditanya kapan aturan berlaku, dia panik dan menjawab asal: Detik ini juga. "
    "Hanya dalam hitungan menit, berita menyebar liar! Puluhan ribu warga langsung mengepung gerbang Tembok Berlin, sementara tentara bingung tanpa instruksi atasan. "
    "Kalah jumlah dan takut pertumpahan darah, gerbang akhirnya dibuka. Malam itu, Tembok Berlin tumbang, dan Uni Soviet bubar selamanya! "
    "Cuma gara-gara salah satu kata. Menurutmu, apa keputusan sepelemu hari ini yang bakal ngerubah hidupmu 5 tahun lagi?"
)

OUTPUT_FILE = "public/butterfly/audio/berlin_wall_voiceover.mp3"
TIMESTAMPS_FILE = "public/butterfly/audio/timestamps.json"

async def main():
    communicate = edge_tts.Communicate(SCRIPT, VOICE, rate="+3%", pitch="-1Hz")
    
    words = []
    with open(OUTPUT_FILE, "wb") as file:
        async for chunk in communicate.stream():
            if chunk["type"] == "audio":
                file.write(chunk["data"])
            elif chunk["type"] == "WordBoundary":
                # offset and duration in 100ns (ticks)
                start_sec = chunk["offset"] / 10_000_000
                duration_sec = chunk["duration"] / 10_000_000
                end_sec = start_sec + duration_sec
                word = chunk["text"]
                words.append({
                    "word": word,
                    "startFrame": int(start_sec * 30),
                    "endFrame": int(end_sec * 30)
                })
                
    with open(TIMESTAMPS_FILE, "w", encoding="utf-8") as f:
        json.dump(words, f, indent=2, ensure_ascii=False)
        
    print(f"Generated {len(words)} word timestamps saved to {TIMESTAMPS_FILE}")

if __name__ == "__main__":
    asyncio.run(main())
