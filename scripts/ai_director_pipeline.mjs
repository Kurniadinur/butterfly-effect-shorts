import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { transcribeWithGroq } from './align_groq.mjs';

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

if (API_KEYS.length === 0) {
  console.error('[FATAL] Tidak ada GEMINI_API_KEY yang ditemukan di file .env.');
  console.error('Silakan isi setidaknya satu GEMINI_API_KEY di file .env.');
  process.exit(1);
}

const DEFAULT_TOPIC = 'Runtuhnya Tembok Berlin Karena Salah Baca Memo';
const topic = process.argv[2] || DEFAULT_TOPIC;

console.log('================================================================');
console.log('       AI DIRECTOR & SUTRADARA VIDEO PIPELINE (AUTONOMOUS)      ');
console.log('================================================================');
console.log(`Topik Naskah : "${topic}"`);
console.log(`Tersedia     : ${API_KEYS.length} API Key (Rotasi Otomatis Failover)`);
console.log('================================================================\n');

// -----------------------------------------------------------------------------
// 1. MASTER SUTRADARA & CREATIVE DIRECTOR PROMPT
// -----------------------------------------------------------------------------
const DIRECTOR_PROMPT = `
Kamu adalah Creative Director & Sutradara Dokumenter Tingkat Dunia, sekaligus Storyteller bertaraf Nessie Judge (Nerror).
Tugasmu adalah menciptakan naskah "Butterfly Effect" (efek domino sebab-akibat ekstrem) berdurasi 60-120 detik untuk YouTube Shorts / TikTok (9:16).

PRINSIP SUTRADARA & KURASI VISUAL (ANTI-AI & ANTI-MEMBOSANKAN):
1. DILARANG KERAS mengulang foto orang atau objek yang sama berturut-turut! Penonton bosan melihat foto statis yang diulang-ulang.
2. Jika suatu adegan tidak memiliki foto otentik, atau berupa adegan abstrak (dokumen rahasia, penyerahan memo, pertanyaan jurnalis, kepanikan telepon, peta runtuhnya negara, radar/alarm), SUTRADARA WAJIB memilih:
   "mediaType": "graphic"
   dan tentukan "directorType" dari salah satu opsi berikut:
   - "bureaucracy-draft"  : Dokumen rahasia birokrasi di atas meja kayu.
   - "memo-handoff"       : Sketsa tangan menyelipkan kertas memo rahasia di meja.
   - "press-question"     : Siluet jurnalis mengangkat mikrofon di bawah lampu sorot.
   - "schabowski-slip"    : Kacamata melorot, jam digital berdetik, ucapan fatal.
   - "breaking-news"      : Monitor TV tabung 1989 dengan breaking news ticker.
   - "panic-phone"        : Pos jaga dengan telepon engkol berdering panik tanpa perintah.
   - "soviet-collapse"    : Peta geopolitik retak dan bubar menjadi banyak negara.
   - "forensic-dossier"   : Berkas penyelidikan deklasifikasi dengan stempel TOP SECRET.
   - "tactical-map"       : Radar taktis melingkar dengan titik koordinat target.
   - "critical-gauge"     : Indikator tekanan bahaya dan alarm kelebihan beban.
   - "breaking-ticker"    : Berita breaking news satelit siaran darurat.
3. Gunakan "mediaType": "photo" HANYA jika ada adegan foto sejarah riil yang relevan (misal: kerumunan demonstran, gerbang perbatasan, tembok diruntuhkan).
4. Struktur Naskah Nessie Judge:
   - HOOK: "Kalian bayangin... dari [hal sepele], [dampak global masif] bisa terjadi dalam semalam?"
   - ESKALASI TEGANG (8 hingga 14 Nodes): Mulai dari kesalahan kecil sepele, kebingungan, penyebaran kabar, kepanikan, klimaks runtuhnya peristiwa, hingga dampak global.
   - CHILLING OUTRO: Pertanyaan psikologis menggantung yang memicu penonton berkomentar ("Menurutmu, apa keputusan sepele yang kamu ambil hari ini yang bakal mengubah hidupmu 5 tahun lagi?").
5. HANYA OUTPUT JSON MURNI TANPA KATA PENGANTAR DAN TANPA MARKDOWN!

FORMAT JSON WAJIB:
{
  "id": "slug-id",
  "title": "Judul Menarik Huruf Besar",
  "hook": {
    "narration": "Kalian bayangin... dari [hal sepele], [dampak raksasa] terjadi?",
    "leftTitle": "Hal Sepele",
    "rightTitle": "Dampak Masif",
    "leftImage": "butterfly/media/schabowski_press.jpg",
    "rightImage": "butterfly/media/wall_demolition.jpg"
  },
  "nodes": [
    {
      "step": 1,
      "timeOrYear": "LOKASI / TAHUN • JAM",
      "headline": "JUDUL ADEGAN SINGKAT",
      "narration": "Naskah narasi suara 10-25 kata yang dramatis...",
      "chaosLevel": 20,
      "mediaType": "photo atau graphic",
      "directorType": "pilih salah satu dari 11 tipe di atas jika graphic",
      "mediaUrl": "butterfly/media/... jika photo, atau nama directorType jika graphic",
      "caption": "Keterangan forensik singkat..."
    }
  ],
  "outro": {
    "narration": "Menurutmu, apa keputusan sepele yang kamu ambil hari ini, yang tanpa kamu sadari, bakal mengubah jalan hidupmu 5 tahun lagi?",
    "question": "Menurutmu, apa keputusan sepele yang kamu ambil hari ini yang bakal mengubah jalan hidupmu 5 tahun lagi?"
  }
}
`;

// Helper: Rotational Gemini Caller
async function callGeminiWithRotation(taskFn) {
  let lastErr = null;
  for (let i = 0; i < API_KEYS.length; i++) {
    const key = API_KEYS[i];
    try {
      const ai = new GoogleGenAI({ apiKey: key });
      return await taskFn(ai, key, i + 1);
    } catch (err) {
      console.warn(`[Failover] Key ${i + 1} mengalami kendala: ${err.message}. Mencoba key berikutnya...`);
      lastErr = err;
    }
  }
  throw new Error(`Semua ${API_KEYS.length} API Key gagal dieksekusi. Error terakhir: ${lastErr?.message}`);
}

// -----------------------------------------------------------------------------
// STEP 1: Direct Storyboard via Gemini
// -----------------------------------------------------------------------------
async function generateStoryboard(topic) {
  console.log('[1/4] Sutradara AI sedang merancang alur cerita & kurasi visual...');
  const result = await callGeminiWithRotation(async (ai, key, keyNum) => {
    const response = await ai.models.generateContent({
      model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [{ text: `${DIRECTOR_PROMPT}\n\nTopik Butterfly Effect: "${topic}"` }],
        },
      ],
    });
    return response.text || '';
  });

  const cleaned = result.replace(/```json/gi, '').replace(/```/g, '').trim();
  const storyData = JSON.parse(cleaned);

  console.log(`      ✓ Judul: "${storyData.title}"`);
  console.log(`      ✓ Jumlah Adegan: ${storyData.nodes.length} adegan`);
  const graphicCount = storyData.nodes.filter((n) => n.mediaType === 'graphic').length;
  const photoCount = storyData.nodes.filter((n) => n.mediaType === 'photo').length;
  console.log(`      ✓ Visual: ${photoCount} Foto Dokumenter + ${graphicCount} Sketsa Animasi Forensik\n`);

  return storyData;
}

// -----------------------------------------------------------------------------
// STEP 2: Synthesize Voiceover via Gemini 3.8 Flash Lite TTS
// -----------------------------------------------------------------------------
async function generateVoiceover(storyData) {
  console.log('[2/4] Mensintesis narasi vokal via Gemini 3.8 Flash Lite TTS...');

  // Combine full narration
  const scriptParts = [
    storyData.hook.narration,
    ...storyData.nodes.map((n) => n.narration),
    storyData.outro.narration,
  ];
  const fullScript = scriptParts.join(' ');

  const audioBuffer = await callGeminiWithRotation(async (ai, key, keyNum) => {
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash-lite-tts',
      contents: fullScript,
    });
    const part = response.candidates?.[0]?.content?.parts?.[0];
    if (part?.inlineData?.data) {
      console.log(`      ✓ Sintesis TTS berhasil menggunakan Key ${keyNum}!`);
      return Buffer.from(part.inlineData.data, 'base64');
    }
    throw new Error('TTS response tidak memuat inline audio bytes');
  });

  const outDir = path.join(ROOT_DIR, 'public', 'butterfly', 'audio');
  fs.mkdirSync(outDir, { recursive: true });

  const wavFilename = `${storyData.id}_voiceover.wav`;
  const wavPath = path.join(outDir, wavFilename);
  fs.writeFileSync(wavPath, audioBuffer);
  console.log(`      ✓ File audio tersimpan di: ${wavPath}\n`);

  return { wavPath, relAudioUrl: `butterfly/audio/${wavFilename}`, scriptParts };
}

// -----------------------------------------------------------------------------
// STEP 3: Whisper Millisecond Ground-Truth Alignment (Groq Cloud LPU)
// -----------------------------------------------------------------------------
async function runWhisperAlignment(wavPath, storyId) {
  const jsonOutput = path.join(ROOT_DIR, 'public', 'butterfly', 'audio', `${storyId}_whisper.json`);
  const groqApiKey = process.env.GROQ_API_KEY;

  if (groqApiKey) {
    try {
      console.log('[3/4] Melakukan penyelarasan audio via Groq Cloud LPU (Whisper Large V3)...');
      console.log('      (Kecepatan tinggi ~3 detik, akurasi tinggi, bebas beban CPU!)');
      const whisperData = await transcribeWithGroq(wavPath, jsonOutput);
      console.log(`      ✓ Total durasi audio: ${whisperData.totalDurationSec} detik`);
      console.log(`      ✓ Total kata terdeteksi: ${whisperData.allWords.length} kata (Whisper Large V3)\n`);
      return whisperData;
    } catch (groqErr) {
      console.warn(`[Peringatan] Groq Cloud gagal (${groqErr.message}). Beralih ke fallback Whisper lokal...`);
    }
  }

  console.log('[3/4] Menjalankan fallback Whisper ASR lokal...');
  await new Promise((resolve, reject) => {
    const py = spawn('python', [
      path.join(__dirname, 'align_whisper.py'),
      wavPath,
      jsonOutput,
    ], { stdio: 'inherit' });

    py.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`align_whisper.py keluar dengan kode ${code}`));
    });
  });

  const whisperData = JSON.parse(fs.readFileSync(jsonOutput, 'utf8'));
  console.log(`      ✓ Total durasi audio: ${whisperData.totalDurationSec} detik`);
  console.log(`      ✓ Total kata terdeteksi: ${whisperData.allWords.length} kata\n`);

  return whisperData;
}

// -----------------------------------------------------------------------------
// STEP 4: Subtitle Paging & Story Construction
// -----------------------------------------------------------------------------
function cleanSubtitleWord(rawWord) {
  if (!rawWord) return '';
  return rawWord
    .replace(/[":;?!,()[\]{}…«»“”‘’\\/]/g, '')
    .replace(/\.+/g, '')
    .replace(/^-+|-+$/g, '')
    .trim();
}

function partitionIntoChunks(items) {
  const chunks = [];
  let i = 0;
  while (i < items.length) {
    const remaining = items.length - i;
    let size = 3;
    if (remaining === 4) {
      size = 2;
    } else if (remaining === 2) {
      size = 2;
    } else if (remaining === 1) {
      if (chunks.length > 0 && chunks[chunks.length - 1].length <= 2) {
        chunks[chunks.length - 1].push(items[i]);
        break;
      }
      size = 1;
    }
    chunks.push(items.slice(i, i + size));
    i += size;
  }
  return chunks;
}

function buildSynchronizedStory(storyData, whisperData, relAudioUrl) {
  console.log('[4/4] Membangun timeline sinkron dan kinetic subtitle stationary...');

  const FPS = 30;
  const totalFrames = Math.round(whisperData.totalDurationSec * FPS);

  // Distribute segment timings across story parts
  const allWords = whisperData.allWords;
  let wordIdx = 0;

  // Build clean stationary subtitle pages
  const wordTimestamps = [];
  let pageIndex = 0;

  for (const seg of whisperData.segments) {
    const segWords = seg.words.map((w) => ({
      word: cleanSubtitleWord(w.word),
      startFrame: Math.round(w.start * FPS),
      endFrame: Math.round(w.end * FPS),
    })).filter((w) => w.word.length > 0);

    const chunks = partitionIntoChunks(segWords);
    for (const chunk of chunks) {
      chunk.forEach((w) => {
        wordTimestamps.push({
          ...w,
          pageIndex,
        });
      });
      pageIndex++;
    }
  }

  // Calculate proportional durations for Hook, Nodes, and Outro
  const allScriptParts = [
    storyData.hook.narration,
    ...storyData.nodes.map((n) => n.narration),
    storyData.outro.narration,
  ];

  const totalChars = allScriptParts.reduce((acc, text) => acc + text.length, 0);

  let currentFrame = 0;

  // Hook frames
  const hookRatio = storyData.hook.narration.length / totalChars;
  const hookFrames = Math.max(90, Math.round(totalFrames * hookRatio));
  storyData.hook.durationFrames = hookFrames;
  currentFrame += hookFrames;

  // Nodes frames
  for (let i = 0; i < storyData.nodes.length; i++) {
    const node = storyData.nodes[i];
    const nodeRatio = node.narration.length / totalChars;
    const isLastNode = i === storyData.nodes.length - 1;

    let nodeFrames = Math.round(totalFrames * nodeRatio);
    if (nodeFrames < 90) nodeFrames = 90;

    node.startFrame = currentFrame;
    node.durationFrames = nodeFrames;
    currentFrame += nodeFrames;
  }

  // Outro frames (remaining frames)
  const outroFrames = Math.max(90, totalFrames - currentFrame);
  storyData.outro.durationFrames = outroFrames;
  const actualTotalFrames = currentFrame + outroFrames;

  const fullStory = {
    id: storyData.id,
    title: storyData.title,
    hook: storyData.hook,
    nodes: storyData.nodes,
    outro: storyData.outro,
    wordTimestamps,
    audioUrl: relAudioUrl,
    totalDurationFrames: actualTotalFrames,
  };

  // Save to active story file
  const outStoryTs = path.join(ROOT_DIR, 'src', 'data', 'currentStory.ts');
  const fileContent = `// Automatically generated by AI Director & Sutradara Pipeline
import { ButterflyStoryData } from './types';
export { cleanSubtitleWord } from '../utils/textUtils';

export const CURRENT_STORY: ButterflyStoryData = ${JSON.stringify(fullStory, null, 2)};
`;

  fs.writeFileSync(outStoryTs, fileContent, 'utf-8');
  console.log(`      ✓ Data cerita tersimpan dan aktif di: src/data/currentStory.ts`);
  console.log(`      ✓ Total frame video: ${actualTotalFrames} frames (${(actualTotalFrames / 30).toFixed(2)} detik)`);
  console.log(`      ✓ Total halaman subtitle: ${pageIndex} halaman stationary\n`);
}

// -----------------------------------------------------------------------------
// MAIN ENTRY
// -----------------------------------------------------------------------------
async function main() {
  try {
    const storyData = await generateStoryboard(topic);
    const { wavPath, relAudioUrl } = await generateVoiceover(storyData);
    const whisperData = await runWhisperAlignment(wavPath, storyData.id);
    buildSynchronizedStory(storyData, whisperData, relAudioUrl);

    console.log('================================================================');
    console.log('   PRODUKSI SUKSES! VIDEO SIAP DITINJAU ATAU DIRENDER CLOUD     ');
    console.log('================================================================');
    console.log('1. Buka preview instan di browser : jalankan "buka_studio.bat"');
    console.log('2. Render MP4 gratis di Cloud    : jalankan "render_di_cloud.bat"');
    console.log('   (Server GitHub RAM 16GB bekerja, laptop Anda tetap dingin!)');
    console.log('================================================================\n');
  } catch (err) {
    console.error('\n[FATAL ERROR]', err.message);
    process.exit(1);
  }
}

main();
