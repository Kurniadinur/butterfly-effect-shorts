import fs from 'fs';
import path from 'path';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve('C:/Users/dinur/Documents/ButterflyProject/.env') });

const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey });

async function testVision() {
  const imagePath = 'C:/Users/dinur/Documents/ButterflyProject/scratch/audit_test.png';
  const imageBase64 = fs.readFileSync(imagePath).toString('base64');

  const prompt = `Anda adalah AI Creative Director & Chief Visual Inspector untuk konten YouTube Shorts viral.
Analisis frame video ini (1080x1920 9:16) berdasarkan:
1. Tipografi & Subtitle (Keterbacaan teks, kontras, posisi safe zone Shorts)
2. Desain Visual Forensik (Sketsa, estetika noir, grafis bukti)
3. Potensi Retensi (Daya tarik hook visual dalam 3 detik pertama)

Berikan output JSON murni dengan struktur:
{
  "visualScore": 95,
  "status": "APPROVED" | "NEEDS_FIX",
  "safeZoneClear": true,
  "legibilityRating": "EXCELLENT" | "GOOD" | "POOR",
  "critique": "analisis singkat tentang kekuatan visual dan keterbacaan",
  "hookEngagement": "analisis daya pikat visual hook",
  "recommendedAction": "langkah selanjutnya atau tips polesan"
}`;

  console.log('Mengirim gambar ke Gemini Vision...');
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: [
      {
        role: 'user',
        parts: [
          { text: prompt },
          {
            inlineData: {
              mimeType: 'image/png',
              data: imageBase64,
            },
          },
        ],
      },
    ],
  });

  console.log('Hasil Audit Vision AI:');
  console.log(response.text);
}

testVision().catch(console.error);
