import asyncio
import json
import edge_tts

SCRIPT = (
    "Kalian bayangin... dari salah baca selembar memo, sebuah negara adidaya runtuh dalam semalam? "
    "Tahun 1989, juru bicara Jerman Timur Günter Schabowski kelelahan dan disodorkan memo aturan imigrasi tanpa sempat dibaca. "
    "Di siaran langsung televisi, saat ditanya kapan aturan berlaku, dia panik dan menjawab asal: Detik ini juga. "
    "Hanya dalam hitungan menit, berita menyebar liar! Puluhan ribu warga langsung mengepung gerbang Tembok Berlin, sementara tentara bingung tanpa instruksi atasan. "
    "Kalah jumlah dan takut pertumpahan darah, gerbang akhirnya dibuka. Malam itu, Tembok Berlin tumbang, dan Uni Soviet bubar selamanya! "
    "Cuma gara-gara salah satu kata. Menurutmu, apa keputusan sepelemu hari ini yang bakal ngerubah hidupmu 5 tahun lagi?"
)

async def main():
    c = edge_tts.Communicate(SCRIPT, 'id-ID-GadisNeural', rate='+3%')
    sentences = []
    async for chunk in c.stream():
        if chunk['type'] == 'SentenceBoundary':
            sec = chunk['offset'] / 10_000_000
            dur = chunk['duration'] / 10_000_000
            sentences.append({
                'text': chunk['text'],
                'startSec': round(sec, 2),
                'durationSec': round(dur, 2),
                'startFrame': int(sec * 30),
                'endFrame': int((sec + dur) * 30)
            })
    print(json.dumps(sentences, indent=2))

if __name__ == '__main__':
    asyncio.run(main())
