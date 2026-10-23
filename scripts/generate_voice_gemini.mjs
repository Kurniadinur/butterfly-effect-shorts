import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

const SCRIPT_TEXT = (
  "Kalian bayangin... dari salah baca selembar memo, sebuah negara adidaya runtuh dalam semalam? " +
  "Tahun 1989, juru bicara Jerman Timur Günter Schabowski kelelahan dan disodorkan memo aturan imigrasi tanpa sempat dibaca. " +
  "Di siaran langsung televisi, saat ditanya kapan aturan berlaku, dia panik dan menjawab asal: Detik ini juga. " +
  "Hanya dalam hitungan menit, berita menyebar liar! Puluhan ribu warga langsung mengepung gerbang Tembok Berlin, sementara tentara bingung tanpa instruksi atasan. " +
  "Kalah jumlah dan takut pertumpahan darah, gerbang akhirnya dibuka. Malam itu, Tembok Berlin tumbang, dan Uni Soviet bubar selamanya! " +
  "Cuma gara-gara salah satu kata. Menurutmu, apa keputusan sepelemu hari ini yang bakal ngerubah hidupmu 5 tahun lagi?"
);

async function main() {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.log('===============================================================');
    console.log('[PERHATIAN] GEMINI_API_KEY di file .env masih kosong!');
    console.log('Untuk menggunakan suara Gemini TTS resmi dari Google:');
    console.log('1. Buka file: C:\\Users\\dinur\\Documents\\ButterflyProject\\.env');
    console.log('2. Isi GEMINI_API_KEY=AIzaSy... Anda.');
    console.log('3. Jalankan kembali script ini.');
    console.log('===============================================================\n');
    return;
  }

  console.log('[1/3] Menghubungi Google Gemini API untuk sintesis suara...');
  const ai = new GoogleGenAI({ apiKey });

  try {
    const response = await ai.models.generateContent({
      model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `Bertindaklah sebagai storyteller misteri Indonesia sekelas Nessie Judge. Bacakan teks berikut dengan intonasi dramatis, jeda napas yang pas saat ada titik-tiga, dan suara yang memikat:\n\n${SCRIPT_TEXT}`,
            },
          ],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName: 'Aoede', // Pilihan suara ekspresif wanita Google (Aoede, Kore) atau pria (Puck, Fenrir)
            },
          },
        },
      },
    });

    const candidates = response.candidates;
    if (candidates && candidates[0]?.content?.parts) {
      for (const part of candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
          const buffer = Buffer.from(part.inlineData.data, 'base64');
          const outAudio = path.join(ROOT_DIR, 'public', 'butterfly', 'audio', 'berlin_wall_voiceover.wav');
          fs.writeFileSync(outAudio, buffer);
          console.log(`[2/3] Audio Gemini TTS berhasil disimpan di: ${outAudio}`);
          console.log('[3/3] Selesai! Suara narasi Google Gemini siap digunakan.');
          return;
        }
      }
    }

    console.log('[INFO] Model mengembalikan respon teks:', response.text);
  } catch (err) {
    console.error('[ERROR] Gagal men-generate suara Gemini:', err.message);
  }
}

main();
