import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

dotenv.config({ path: path.join(ROOT_DIR, '.env') });

const API_KEYS = [
  process.env.GEMINI_API_KEY,
  process.env.GEMINI_API_KEY_2,
  process.env.GEMINI_API_KEY_3,
  process.env.GEMINI_API_KEY_4,
].filter(Boolean);

/**
 * Generate complete YouTube Shorts viral publishing package:
 * - 3 High-CTR Titles
 * - Viral Description
 * - 15-20 Trending Hashtags
 * - High-Engagement Pinned Comment
 */
export async function generatePublishingPack(storyData) {
  console.log('\n----------------------------------------------------------------');
  console.log('   VIRAL PUBLISHING PACK GENERATOR (METADATA YOUTUBE SHORTS)     ');
  console.log('----------------------------------------------------------------');

  const prompt = `Anda adalah Ahli Algoritma YouTube Shorts & Growth Strategist untuk channel edukasi sejarah viral dengan jutaan penonton.
Berdasarkan data naskah video Butterfly Effect berikut, buatkan paket metadata publikasi YouTube Shorts lengkap yang memaksimalkan CTR (Click-Through Rate), Retensi, dan Interaksi Komentar.

DATA NASKAH:
Judul Internal: ${storyData.title}
Hook Pembuka: "${storyData.hook.headline}" - ${storyData.hook.narration}
Langkah Eskalasi:
${storyData.nodes.map((n) => `- ${n.timeOrYear}: ${n.headline} (${n.narration})`).join('\n')}
Outro Penutup: "${storyData.outro.question}"

TUGAS ANDA:
1. BUAT 3 OPSI JUDUL SHORTS VIRAL (Maksimal 60 karakter per judul):
   - Opsi 1 (Curiosity Gap): Memancing rasa penasaran ekstrem tentang benda/momen sepele.
   - Opsi 2 (Misteri Mendesak): Menyoroti kontras antara kesalahan kecil vs bencana masif.
   - Opsi 3 (Fakta Mengguncang): Format pengungkapan rahasia sejarah nyata.
   Semua wajib diakhiri hashtag #shorts.

2. BUAT DESKRIPSI LENGKAP:
   - Hook sinopsis 2 kalimat yang memancing penonton menonton sampai tuntas.
   - Timeline peristiwa bersejarah.
   - Ajakan berlangganan (Subscribe).
   - Disclaimer fakta sejarah otentik.

3. BUAT 15-20 HASHTAG VIRAL:
   - Kombinasi hashtag umum algoritma (#shorts, #fyp, #sejarah, #faktamenarik, #edukasi) dan spesifik topik.

4. BUAT PINNED COMMENT PEMANTIK DEBAT (Algorithmic Comment Bait):
   - Pertanyaan provokatif dan mendalam yang memancing penonton mengetik opini di kolom komentar untuk mendongkrak sinyal algoritma YouTube.

OUTPUT FORMAT JSON MURNI (TANPA PREAMBLE):
{
  "titleOptions": [
    "Opsi 1...",
    "Opsi 2...",
    "Opsi 3..."
  ],
  "recommendedTitle": "Opsi terbaik yang paling disarankan",
  "description": "Teks deskripsi lengkap dengan timeline dan disclaimer...",
  "hashtags": ["#shorts", "#sejarah", ...],
  "pinnedComment": "Teks komentar tersemat untuk memicu perdebatan penonton...",
  "thumbnailFrameRecommended": "Frame 45 (Hook Reveal)"
}`;

  const candidates = API_KEYS.map((key, idx) => async () => {
    const ai = new GoogleGenAI({ apiKey: key });
    const res = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return { text: res.text, keyIndex: idx + 1 };
  });

  const winner = await Promise.any(candidates.map((fn) => fn()));
  let cleanJson = winner.text.replace(/```json/gi, '').replace(/```/g, '').trim();
  const firstBrace = cleanJson.indexOf('{');
  const lastBrace = cleanJson.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1) {
    cleanJson = cleanJson.slice(firstBrace, lastBrace + 1);
  }
  const pack = JSON.parse(cleanJson);

  // Save to out/publishing_pack/<storyId>_publishing_pack.json
  const packDir = path.join(ROOT_DIR, 'out', 'publishing_pack');
  fs.mkdirSync(packDir, { recursive: true });
  const packPath = path.join(packDir, `${storyData.id}_publish_pack.json`);
  fs.writeFileSync(packPath, JSON.stringify(pack, null, 2), 'utf-8');

  console.log(`      ✓ Judul Rekomendasi: "${pack.recommendedTitle}"`);
  console.log(`      ✓ Pinned Comment   : "${pack.pinnedComment}"`);
  console.log(`      ✓ Paket Publikasi tersimpan di: out/publishing_pack/${storyData.id}_publish_pack.json`);
  console.log('----------------------------------------------------------------\n');

  return pack;
}

export function getCurrentStory() {
  try {
    const filePath = path.join(ROOT_DIR, 'src', 'data', 'currentStory.ts');
    if (!fs.existsSync(filePath)) return null;
    const content = fs.readFileSync(filePath, 'utf8');
    const marker = 'CURRENT_STORY';
    const markerIdx = content.indexOf(marker);
    if (markerIdx === -1) return null;
    const startIdx = content.indexOf('{', markerIdx);
    const endIdx = content.lastIndexOf('}');
    if (startIdx !== -1 && endIdx !== -1) {
      return JSON.parse(content.slice(startIdx, endIdx + 1));
    }
  } catch (err) {
    return null;
  }
}

// Standalone execution test
if (process.argv[1] && path.resolve(fileURLToPath(import.meta.url)) === path.resolve(process.argv[1])) {
  const story = getCurrentStory();
  if (story) {
    generatePublishingPack(story).catch(console.error);
  } else {
    console.error('File currentStory.ts tidak ditemukan atau tidak valid.');
  }
}
