import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config({ path: path.resolve('C:/Users/dinur/Documents/ButterflyProject/.env') });

const API_KEYS = [
  process.env.GEMINI_API_KEY,
  process.env.GEMINI_API_KEY_2,
  process.env.GEMINI_API_KEY_3,
  process.env.GEMINI_API_KEY_4,
].filter(Boolean);

const prompt = `Anda adalah Sutradara & Naskah Penulis Dokumenter Sejarah Butterfly Effect.
Tuliskan 1 konsep naskah pembuka 3 detik (Hook) yang paling dramatis dan puitis tentang:
"Krisis Rudal Kuba 1962: Satu Kata Perwira Kapal Selam yang Menghentikan Perang Nuklir Dunia".

Format output JSON murni:
{
  "headline": "Judul Hook",
  "narration": "Teks narasi puitis dan mencekam...",
  "timeTag": "OKTOBER 1962"
}`;

async function testRace() {
  console.log(`Menjalankan balapan Gemini (Key 1..${API_KEYS.length})...`);
  const start = Date.now();
  const tasks = [];

  // Key 1
  if (API_KEYS[0]) {
    const ai1 = new GoogleGenAI({ apiKey: API_KEYS[0] });
    tasks.push(
      ai1.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
      }).then((res) => ({ provider: 'Key 1 (gemini-2.5-flash)', text: res.text }))
    );
  }

  // Key 2..4
  for (let k = 1; k < API_KEYS.length; k++) {
    const ai = new GoogleGenAI({ apiKey: API_KEYS[k] });
    tasks.push(
      ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
      }).then((res) => ({ provider: `Key ${k + 1} (gemini-3.5-flash)`, text: res.text }))
    );
    tasks.push(
      ai.models.generateContent({
        model: 'gemini-3.1-flash-lite-preview',
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
      }).then((res) => ({ provider: `Key ${k + 1} (gemini-3.1-flash-lite)`, text: res.text }))
    );
  }

  const winner = await Promise.any(tasks);
  const elapsed = ((Date.now() - start) / 1000).toFixed(1);
  console.log(`\n🎉 PEMENANG: ${winner.provider} dalam ${elapsed} detik!`);
  console.log('HASIL NASKAH GEMINI:');
  console.log(winner.text);
}

testRace().catch(console.error);
