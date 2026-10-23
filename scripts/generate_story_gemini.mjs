import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';
import { spawn } from 'child_process';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

const topic = process.argv[2] || 'Runtuhnya Tembok Berlin karena Salah Baca Memo';

console.log('====================================================');
console.log('   AI DIRECTOR ENGINE: NESSIE JUDGE STORYTELLING    ');
console.log(`   Topik: "${topic}"`);
console.log('====================================================\n');

const SYSTEM_PROMPT = `
Kamu adalah Creative Director dan Storyteller papan atas Indonesia dengan gaya bertutur sekelas Nessie Judge (Nerror).
Tugasmu adalah membuat naskah "Butterfly Effect" (efek domino sebab-akibat ekstrem) dalam durasi 45-55 detik untuk YouTube Shorts / TikTok (9:16).

ATURAN WAJIB NESSIE JUDGE:
1. HOOK (Detik 0-4): Langsung tancapkan paradoks ekstrem antara hal sepele dengan bencana global. DILARANG memakai sapaan formal. Mulai dengan: "Kalian bayangin... dari [hal sepele], [bencana dunia] terjadi dalam semalam?"
2. ESKALASI TEGANG (4 Node):
   - Node 1: Tindakan awal sepele / kesalahan konyol yang tampak remeh. (Chaos Level 25%)
   - Node 2: The Trigger – Kesalahan diucapkan / terjadi di depan publik. (Chaos Level 55%)
   - Node 3: The Domino – Kepanikan massal / reaksi berantai tak terkendali. (Chaos Level 80%)
   - Node 4: The Climax – Puncak bencana / sejarah dunia berubah selamanya. (Chaos Level 100%)
3. CHILLING OUTRO: Pertanyaan menggantung yang memicu penonton merinding dan berdebat di kolom komentar.
4. DIKSI: Wajib percakapan alami, misterius, padat, dan dramatis ("Kalian bayangin...", "Dan yang bikin merinding...", "Ternyata...", "Nggak ada yang nyangka kalau...").
5. OUTPUT: WAJIB HANYA JSON MURNI TANPA MARKDOWN!

FORMAT JSON WAJIB:
{
  "id": "slug-id",
  "title": "Judul Menarik",
  "hook": {
    "narration": "Kalian bayangin... dari [X], [Y] terjadi?",
    "leftTitle": "Hal Sepele",
    "rightTitle": "Dampak Global",
    "leftImageKeyword": "historical search query",
    "rightImageKeyword": "historical search query"
  },
  "nodes": [
    {
      "step": 1,
      "timeOrYear": "Tahun | Jam",
      "headline": "JUDUL PENDEK HURUF BESAR",
      "narration": "Naskah 15-20 kata gaya Nessie Judge...",
      "chaosLevel": 25,
      "caption": "Keterangan foto...",
      "imageKeyword": "historical search query"
    },
    {
      "step": 2,
      "timeOrYear": "Tahun | Jam",
      "headline": "JUDUL PENDEK HURUF BESAR",
      "narration": "Naskah 15-20 kata...",
      "chaosLevel": 55,
      "caption": "Keterangan foto...",
      "imageKeyword": "historical search query"
    },
    {
      "step": 3,
      "timeOrYear": "Tahun | Jam",
      "headline": "JUDUL PENDEK HURUF BESAR",
      "narration": "Naskah 15-20 kata...",
      "chaosLevel": 80,
      "caption": "Keterangan foto...",
      "imageKeyword": "historical search query"
    },
    {
      "step": 4,
      "timeOrYear": "Tahun | Jam",
      "headline": "JUDUL PENDEK HURUF BESAR",
      "narration": "Naskah 15-20 kata klimaks...",
      "chaosLevel": 100,
      "caption": "Keterangan foto...",
      "imageKeyword": "historical search query"
    }
  ],
  "outro": {
    "narration": "Cuma gara-gara satu kata. Menurutmu, apa keputusan sepelemu hari ini yang bakal ngerubah masa depan?",
    "question": "Apa keputusan sepelemu hari ini yang kira-kira bakal ngerubah hidupmu 5 tahun lagi?"
  }
}
`;

async function main() {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.log('[INFO] GEMINI_API_KEY belum diisi di file .env.');
    console.log('[INFO] Menggunakan dataset template kurasi yang sudah siap tayang.');
    console.log('[TIPS] Masukkan API Key Anda di file .env untuk men-generate topik baru secara otomatis.\n');
    return;
  }

  console.log('[1/3] Memanggil Gemini API untuk menyusun naskah & storyboard...');
  const ai = new GoogleGenAI({ apiKey });
  
  try {
    const response = await ai.models.generateContent({
      model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
      contents: [
        { role: 'user', parts: [{ text: `${SYSTEM_PROMPT}\n\nTopik yang harus kamu direct: "${topic}"` }] }
      ]
    });

    const rawText = response.text || '';
    const cleanJson = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
    const storyData = JSON.parse(cleanJson);

    console.log('[2/3] Naskah berhasil disusun oleh Gemini!');
    console.log(`      Judul: "${storyData.title}"`);
    console.log(`      Hook: "${storyData.hook.narration}"`);

    const outPath = path.join(ROOT_DIR, 'src', 'data', 'butterflyEffect', 'currentStory.json');
    fs.writeFileSync(outPath, JSON.stringify(storyData, null, 2), 'utf-8');
    console.log(`[3/3] Data naskah tersimpan di: ${outPath}`);
    console.log('\nSiap untuk audio synthesis dan cloud render!');
  } catch (err) {
    console.error('[ERROR] Gagal memanggil Gemini API:', err.message);
  }
}

main();
