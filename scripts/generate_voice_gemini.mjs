import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config({ path: 'C:/Users/dinur/Documents/ButterflyProject/.env' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

// All 4 keys for automatic rotation / failover
const API_KEYS = [
  process.env.GEMINI_API_KEY,
  process.env.GEMINI_API_KEY_2,
  process.env.GEMINI_API_KEY_3,
  process.env.GEMINI_API_KEY_4,
].filter(Boolean);

export const EXPANDED_SCRIPT = (
  "Kalian bayangin... dari satu orang yang kelelahan dan salah baca selembar memo, sebuah negara adidaya bisa runtuh hanya dalam satu malam? " +
  "Ini adalah salah satu blunder paling fatal dan gila dalam sejarah modern dunia. " +
  "Tanggal 9 November 1989. Ketegangan di Jerman Timur sedang berada di titik didih. Puluhan ribu warga berdemonstrasi menuntut kebebasan. " +
  "Di markas partai, pemerintah sebenarnya hanya ingin membuat aturan pelonggaran visa biasa, yang baru berlaku besok lewat birokrasi ketat. " +
  "Tepat sebelum konferensi pers dimulai, juru bicara Günter Schabowski buru-buru disodorkan selembar memo tanpa sempat dia baca sama sekali. " +
  "Di depan ratusan jurnalis dari seluruh dunia, siaran langsung televisi pun dimulai. Semuanya berjalan membosankan... sampai menit ke-57. " +
  "Seorang jurnalis asal Italia, Riccardo Ehrman, melempar pertanyaan tak terduga: Kapan aturan perjalanan baru ini mulai berlaku? " +
  "Schabowski mendadak panik. Dia membolak-balik kertas memo di mejanya, kacamata melorot, lalu bergumam ragu: Setahu saya... segera. Detik ini juga. " +
  "Ruang pers langsung gempar! " +
  "Hanya dalam hitungan menit, stasiun berita internasional menyiarkan kabar mengejutkan: Pintu perbatasan Tembok Berlin telah dibuka! " +
  "Kabar itu menyebar liar bagai api membakar hutan kering. Puluhan ribu warga Berlin Timur langsung tumpah ruah ke jalanan, menyerbu pos perbatasan Bornholmer Straße. " +
  "Di pos perbatasan, para tentara gemetar ketakutan. Mereka panik menelepon atasan, tapi tidak ada satu pun jenderal yang berani memberi perintah tembak. " +
  "Kalah jumlah dan takut pertumpahan darah massal, gerbang perbatasan akhirnya dibuka paksa. " +
  "Malam itu, warga barat dan timur berpelukan sambil menangis. Mereka memanjat tembok dengan palu godam, menari di atas beton pembatas, dan meruntuhkan Tembok Berlin untuk selamanya. " +
  "Hanya berselang beberapa bulan, seluruh Uni Soviet bubar, dan peta geopolitik dunia berubah total. " +
  "Semua revolusi raksasa ini... dimulai dari satu orang yang salah ngomong satu kalimat di siaran TV. " +
  "Menurutmu, apa keputusan sepele yang kamu ambil hari ini... yang tanpa kamu sadari, bakal mengubah jalan hidupmu 5 tahun lagi?"
);

async function generateWithRotation(text) {
  let lastError = null;

  for (let i = 0; i < API_KEYS.length; i++) {
    const key = API_KEYS[i];
    console.log(`[TTS Engine] Mencoba API Key ${i + 1} / ${API_KEYS.length}...`);

    try {
      const ai = new GoogleGenAI({ apiKey: key });
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash-lite-tts',
        contents: text,
      });

      const part = response.candidates?.[0]?.content?.parts?.[0];
      if (part?.inlineData?.data) {
        console.log(`[TTS Engine] SUKSES menggunakan Key ${i + 1}!`);
        return Buffer.from(part.inlineData.data, 'base64');
      }
    } catch (err) {
      console.warn(`[TTS Engine] Key ${i + 1} gagal (${err.message}). Mencoba key berikutnya...`);
      lastError = err;
    }
  }

  throw new Error(`Semua 4 API Key gagal. Error terakhir: ${lastError?.message}`);
}

async function main() {
  console.log('===============================================================');
  console.log('   GOOGLE GEMINI 3.8 FLASH LITE TTS - STORYTELLER ENGINE       ');
  console.log('   Tersedia: 4 Kunci API Otomatis Rotasi (Anti-Limit)          ');
  console.log('===============================================================\n');

  try {
    const audioBuffer = await generateWithRotation(EXPANDED_SCRIPT);
    const outAudioWav = path.join(ROOT_DIR, 'public', 'butterfly', 'audio', 'berlin_wall_voiceover.wav');
    const outAudioMp3 = path.join(ROOT_DIR, 'public', 'butterfly', 'audio', 'berlin_wall_voiceover.mp3');

    fs.writeFileSync(outAudioWav, audioBuffer);
    fs.writeFileSync(outAudioMp3, audioBuffer);

    console.log(`\n[SUKSES] Audio voiceover Gemini 3.8 berhasil disimpan:`);
    console.log(`- ${outAudioWav}`);
    console.log(`- ${outAudioMp3}`);
  } catch (err) {
    console.error('[FATAL]', err.message);
  }
}

main();
