import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

dotenv.config({ path: path.join(ROOT_DIR, '.env') });

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
  "Ribuan warga Berlin Timur yang menonton siaran itu langsung tumpah ruah ke pos-pos perbatasan Tembok Berlin malam itu juga. " +
  "Para tentara penjaga perbatasan bingung, komandan mereka tidak menerima instruksi apa pun. " +
  "Massa yang membludak makin tak terbendung. Karena takut terjadi pertumpahan darah massal, tentara penjaga akhirnya menyerah dan membuka gerbang. " +
  "Malam itu juga, warga dari kedua sisi berpelukan sambil menangis, menaiki tembok, dan mulai menghancurkan beton Tembok Berlin dengan palu. " +
  "Sebuah insiden salah baca memo... yang secara tak sengaja mengakhiri Perang Dingin dan mengubah sejarah dunia selamanya."
);

export async function generateFullVoiceover() {
  if (API_KEYS.length === 0) {
    throw new Error('Tidak ada GEMINI_API_KEY yang ditemukan di .env');
  }

  const outDir = path.join(ROOT_DIR, 'public', 'butterfly', 'audio');
  fs.mkdirSync(outDir, { recursive: true });
  const outWav = path.join(outDir, 'berlin_wall_narrator.wav');

  let lastError = null;

  for (let i = 0; i < API_KEYS.length; i++) {
    const key = API_KEYS[i];
    console.log(`[Gemini TTS] Mencoba Key ${i + 1}/${API_KEYS.length}...`);

    try {
      const ai = new GoogleGenAI({ apiKey: key });

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: `Bacakan naskah dokumenter sejarah berikut dengan intonasi dramatis, misterius, berwibawa, dan dinamis layaknya narator dokumenter kelas dunia (Vox/Johnny Harris/MagnatesMedia). Berikan jeda yang tepat pada momen-momen penekanan dan buat pendengar terhanyut:\n\n"${EXPANDED_SCRIPT}"`,
              },
            ],
          },
        ],
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: {
                voiceName: 'Puck',
              },
            },
          },
        },
      });

      const audioPart = response.candidates?.[0]?.content?.parts?.find(
        (p) => p.inlineData && p.inlineData.mimeType?.startsWith('audio/')
      );

      if (!audioPart || !audioPart.inlineData?.data) {
        throw new Error('Respons model tidak mengandung data audio');
      }

      const buffer = Buffer.from(audioPart.inlineData.data, 'base64');
      fs.writeFileSync(outWav, buffer);
      console.log(`✓ Audio dokumenter berhasil digenerate via Key ${i + 1} (${(buffer.length / 1024).toFixed(1)} KB)`);
      console.log(`  Lokasi: ${outWav}`);
      return outWav;
    } catch (err) {
      console.warn(`⚠ Gagal dengan Key ${i + 1}: ${err.message}`);
      lastError = err;
    }
  }

  throw new Error(`Semua ${API_KEYS.length} Gemini API Key gagal: ${lastError?.message}`);
}

if (process.argv[1] && path.resolve(fileURLToPath(import.meta.url)) === path.resolve(process.argv[1])) {
  generateFullVoiceover().catch(console.error);
}
