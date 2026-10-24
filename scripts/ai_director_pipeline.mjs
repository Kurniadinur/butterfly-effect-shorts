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
console.log(`Audio Sync   : Groq Cloud LPU (Whisper Large V3)`);
console.log('================================================================\n');

// -----------------------------------------------------------------------------
// 1. MASTER SUTRADARA & CREATIVE DIRECTOR PROMPT
// -----------------------------------------------------------------------------
const DIRECTOR_PROMPT = `
Kamu adalah Creative Director & Sutradara Dokumenter Papan Atas Dunia sekaligus Storyteller bertaraf Nessie Judge (Nerror).
Tugasmu adalah menciptakan naskah dan alur visual "Butterfly Effect" (efek domino sebab-akibat ekstrem) berdurasi 60-120 detik untuk YouTube Shorts / TikTok (9:16).

PRINSIP WAJIB SUTRADARA KELAS DUNIA (VISUAL HARUS 100% MENJELASKAN MOMEN):
1. VISUAL FIDELITY MUTLAK (DILARANG ASAL GAMBAR):
   - DILARANG menampilkan visual yang abstrak atau tidak ada kaitannya dengan kalimat narasi!
   - Setiap adegan WAJIB secara gamblang memperlihatkan bukti visual dari apa yang sedang diucapkan:
     * Jika narasi menyebut dokumen/memo/surat rahasia -> Visual WAJIB memperlihatkan dokumen/memo tersebut secara close-up dengan teks dan stempel yang relevan.
     * Jika narasi menyebut wartawan melempar pertanyaan mendadak -> Visual WAJIB memperlihatkan suasana konferensi pers dan mikrofon dengan kutipan pertanyaan spesifik.
     * Jika narasi menyebut kepanikan tokoh utama -> Visual WAJIB memperlihatkan kepanikan tokoh atau meja kerjanya yang kacau, BUKAN foto formal yang tenang.
     * Jika narasi menyebut kerumunan menyerbu gerbang perbatasan -> Visual WAJIB memperlihatkan gerbang perbatasan dan massa rakyat yang menembusnya.
     * Jika narasi menyebut pos jaga panik menelepon atasan -> Visual WAJIB memperlihatkan telepon darurat pos jaga bergetar merah tanpa ada jawaban jenderal.
2. JANGAN PERNAH MENAMPILKAN WAJAH PELAKU / FOKUS UTAMA DI HOOK VIDEO (DETIK 0-4)!
   - Di Hook, penonton HANYA boleh merasakan KONTRAS EKSTREM antara:
     * Awal Sepele (misal: "Selembar Memo Tanpa Dibaca", "Kunci Teropong Tertinggal", "Uji Coba Daya Reaktor").
     * Bencana Global (misal: "Uni Soviet Runtuh", "Kapal Titanic Tenggelam", "Reaktor Nuklir Meledak").
   - Wajah tokoh HANYA boleh muncul saat naskah secara khusus mulai memperkenalkannya atau saat kilas balik di adegan akhir!
3. DILARANG KERAS MENGULANG FOTO ORANG/OBJEK YANG SAMA BERTURUT-TURUT!
   - Setiap adegan harus memiliki sudut pandang baru, variasi tempo, dan pergerakan kamera (cameraMotion): "zoomIn", "zoomOut", "panRight", atau "panLeft".
4. PEMILIHAN TIPE VISUAL SUTRADARA:
   - Gunakan "mediaType": "photo" HANYA jika ada foto sejarah riil yang relevan.
   - Gunakan "mediaType": "graphic" untuk adegan dramatis/abstrak/dokumen rahasia/kepanikan.
   - Pilihan "directorType" jika graphic:
     * "wall-demolition"   : Animasi aksi riil massa merobohkan Tembok Berlin, siluet orang di atas dinding mengayunkan palu godam dengan percikan api, retakan dinding beton menjalar, dan lautan massa mendorong dinding.
     * "gate-breach"       : Animasi aksi riil palang gerbang perbatasan berayun terbuka ke atas, lampu sirene merah berputar di pos jaga, dan ribuan siluet warga menerobos maju membawa senter.
     * "press-podium"      : Podium konferensi pers Schabowski, hujan kilatan blitz kamera wartawan yang menyala-nyala, jam digital berdetik 18:57, dan dokumen fatal di tangan.
     * "memo-investigation": Kertas dokumen memo rahasia di bawah sorotan lampu meja dengan kaca pembesar memindai kata fatal 'sofort' (segera) berstabilo kuning dan stempel merah deklasifikasi.
     * "domino-collapse"   : Balok domino 3D geopolitik beruntun jatuh menabrak satu sama lain dari Tembok Berlin hingga keruntuhan Uni Soviet.
     * "panic-phone"        : Pos jaga dengan telepon engkol bergetar merah tanpa perintah atasan.
     * "breaking-news"      : Monitor TV tabung vintage dengan ticker darurat.
     * "soviet-collapse"    : Peta geopolitik retak & Uni Soviet bubar jadi 15 negara.
     * "forensic-dossier"   : Berkas penyelidikan deklasifikasi dengan stempel merah TOP SECRET.
     * "tactical-map"       : Radar taktis melingkar & titik koordinat target episentrum.
     * "critical-gauge"     : Indikator tekanan bahaya dan alarm kelebihan beban.
     * "breaking-ticker"    : Siaran langsung satelit darurat internasional.
4. STRUKTUR NARRATIVE NESSIE JUDGE:
   - HOOK: "Kalian bayangin... dari [hal sepele], [dampak global masif] bisa terjadi hanya dalam satu malam?"
   - ESKALASI TEGANG (8 hingga 14 adegan berantai): Dari kelalaian kecil, kepanikan, kekacauan berantai, hingga klimaks sejarah dunia berubah.
   - CHILLING OUTRO: Pertanyaan menggantung yang memancing penonton berkomentar ("Menurutmu, apa keputusan sepele yang kamu ambil hari ini yang bakal mengubah hidupmu 5 tahun lagi?").
5. HANYA OUTPUT JSON MURNI TANPA KATA PENGANTAR DAN TANPA MARKDOWN!

FORMAT JSON WAJIB:
{
  "id": "slug-id",
  "title": "JUDUL DRAMATIS HURUF BESAR",
  "hook": {
    "narration": "Kalian bayangin... dari [hal sepele], [dampak masif] terjadi dalam satu malam?",
    "leftTitle": "Hal Sepele",
    "rightTitle": "Dampak Global",
    "leftBadge": "AWAL MULA SEPELE",
    "rightBadge": "BENCANA GLOBAL",
    "leftPrimaryText": "Teks judul dokumen awal",
    "leftStampText": "BUKTI AWAL",
    "rightImage": "butterfly/media/wall_demolition.jpg"
  },
  "nodes": [
    {
      "step": 1,
      "timeOrYear": "LOKASI / TAHUN • JAM",
      "headline": "JUDUL ADEGAN SINGKAT BESAR",
      "narration": "Naskah narasi suara 10-25 kata yang dramatis...",
      "chaosLevel": 20,
      "mediaType": "photo atau graphic",
      "directorType": "pilih salah satu dari 11 opsi jika graphic",
      "zoomDirection": "zoomIn / zoomOut / panRight / panLeft",
      "primaryText": "Teks judul spesifik di dalam elemen grafis",
      "secondaryText": "Teks subjudul / keterangan grafis",
      "stampText": "Teks stempel resmi (misal: TOP SECRET, SINKING, CRITICAL, OVERLOAD)",
      "quoteText": "Teks kutipan ucapan / pertanyaan jika ada",
      "metricLabel": "Label indikator (misal: KORBAN JIWA, TEKANAN, RADIASI)",
      "metricValue": "Nilai indikator (misal: 1,517 JIWA, 99.4%, SOS CQD)",
      "mediaUrl": "nama file foto atau nama directorType",
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

// Groq Cloud LPU Fallback (Zero 503 Spike Guarantee)
async function generateStoryboardWithGroq(topic) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error('GROQ_API_KEY tidak ditemukan di file .env');

  console.log('      [LPU Failover] Mengaktifkan Groq Cloud LPU (0% Spike, Super Cepat)...');
  const models = ['openai/gpt-oss-120b', 'qwen/qwen3.8-27b'];
  let lastErr = null;

  for (const modelName of models) {
    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: modelName,
          messages: [
            {
              role: 'system',
              content: 'You are an autonomous AI Film Director specializing in dramatic Butterfly Effect short videos. You must output pure valid JSON with NO markdown formatting and NO conversational text.',
            },
            {
              role: 'user',
              content: `${DIRECTOR_PROMPT}\n\nTopik Butterfly Effect Baru: "${topic}"`,
            },
          ],
          response_format: { type: 'json_object' },
          temperature: 0.8,
        }),
      });

      const data = await res.json();
      if (data.choices?.[0]?.message?.content) {
        console.log(`      ✓ Naskah berhasil disusun via Groq LPU (${modelName})!`);
        return data.choices[0].message.content;
      }
      if (data.error) throw new Error(data.error.message);
    } catch (err) {
      lastErr = err;
      console.warn(`      [Groq Failover] Model ${modelName} gagal: ${err.message}. Mencoba model berikutnya...`);
    }
  }
  throw lastErr || new Error('Semua model Groq gagal.');
}

// -----------------------------------------------------------------------------
// STEP 1: Direct Storyboard via Gemini / Groq with High Creativity (Temp 0.85)
// -----------------------------------------------------------------------------
async function generateStoryboard(topic) {
  console.log('[1/4] Sutradara AI sedang merancang alur cerita & kurasi visual unik...');
  console.log('      (Menganalisa topik & menyusun 8-15 adegan berantai...)');
  const t0 = Date.now();
  let result = '';

  const provider = (process.env.STORY_PROVIDER || 'auto').toLowerCase();

  if (provider === 'groq') {
    result = await generateStoryboardWithGroq(topic);
  } else {
    try {
      result = await callGeminiWithRotation(async (ai, key, keyNum) => {
        const candidateModels = [process.env.GEMINI_MODEL || 'gemini-3.5-flash', 'gemini-3.5-flash', 'gemini-3.8-flash'];
        let lastModelErr = null;
        for (const modelName of [...new Set(candidateModels)]) {
          try {
            const response = await ai.models.generateContent({
              model: modelName,
              contents: [
                {
                  role: 'user',
                  parts: [{ text: `${DIRECTOR_PROMPT}\n\nTopik Butterfly Effect Baru: "${topic}"` }],
                },
              ],
              config: {
                temperature: 0.85,
                topP: 0.95,
              },
            });
            if (response.text) return response.text;
          } catch (err) {
            lastModelErr = err;
            console.warn(`      [Model Failover] Model ${modelName} gagal: ${err.message.slice(0, 80)}. Mencoba model alternatif...`);
          }
        }
        throw lastModelErr || new Error('Gagal menghasilkan storyboard');
      });
    } catch (geminiErr) {
      console.warn(`\n[Peringatan] Server Google Gemini sedang mengalami antrean trafik (503).`);
      console.log(`[Failover Otomatis] Mengalihkan ke Groq Cloud LPU Llama/GPT-OSS...`);
      result = await generateStoryboardWithGroq(topic);
    }
  }

  console.log(`      ✓ Naskah & kurasi visual selesai dalam ${((Date.now() - t0) / 1000).toFixed(1)} detik.`);

  const cleaned = result.replace(/```json/gi, '').replace(/```/g, '').trim();
  const storyData = JSON.parse(cleaned);

  // Validate visual media to guarantee ZERO broken images and ZERO repeated photos
  const mediaDir = path.join(ROOT_DIR, 'public', 'butterfly', 'media');

  // Validate Hook images
  if (!storyData.hook.rightImage || !fs.existsSync(path.join(ROOT_DIR, 'public', storyData.hook.rightImage))) {
    storyData.hook.rightImage = 'butterfly/media/wall_demolition.jpg';
  }
  if (!storyData.hook.leftImage || !fs.existsSync(path.join(ROOT_DIR, 'public', storyData.hook.leftImage))) {
    storyData.hook.leftImage = 'butterfly/media/memo_document.jpg';
  }

  let photoCount = 0;
  let graphicCount = 0;
  const usedPhotos = new Set();

  for (let i = 0; i < storyData.nodes.length; i++) {
    const node = storyData.nodes[i];
    node.step = i + 1;
    const txt = (node.headline + ' ' + node.narration + ' ' + (node.caption || '')).toLowerCase();

    // High-impact action moments MUST be animated action sketches:
    // 1) Wall demolition (massa merobohkan tembok, palu godam, retakan beton)
    // 2) Gate breach (palang gerbang terbuka, sirene pos jaga, massa menyerbu)
    // 3) Domino collapse (balok domino geopolitik runtuh beruntun)
    // 4) Memo investigation (kaca pembesar memindai kata fatal 'sofort')
    const isWallDemolition = txt.includes('tembok') && (txt.includes('roboh') || txt.includes('palu') || txt.includes('hancur') || txt.includes('dorong') || txt.includes('beton'));
    const isGateBreach = (txt.includes('gerbang') || txt.includes('palang')) && (txt.includes('buka') || txt.includes('terobos') || txt.includes('jebol') || txt.includes('pasrah'));
    const isDominoCollapse = txt.includes('domino') || txt.includes('soviet') || txt.includes('komunis') || txt.includes('bubar') || txt.includes('kolaps') || txt.includes('tirai besi');
    const isMemoInvestigate = (txt.includes('memo') || txt.includes('draf') || txt.includes('regulasi') || txt.includes('rahasia')) && (txt.includes('sofort') || txt.includes('baca') || txt.includes('segera') || i === 0);

    // 1. Semantically match authentic historical photos from database for appropriate moments
    let candidatePhoto = null;
    if (!isWallDemolition && !isGateBreach && !isDominoCollapse && !isMemoInvestigate) {
      if (txt.includes('schabowski') || txt.includes('kacamata') || txt.includes('blunder') || txt.includes('ucapan fatal')) {
        candidatePhoto = 'butterfly/media/schabowski_flustered.jpg';
      } else if (txt.includes('massa') || txt.includes('warga') || txt.includes('kerumunan') || txt.includes('serbu') || txt.includes('padati')) {
        candidatePhoto = 'butterfly/media/berlin_crowd.jpg';
      } else if (txt.includes('wartawan') || txt.includes('konferensi') || txt.includes('pers')) {
        candidatePhoto = 'butterfly/media/schabowski_press.jpg';
      } else if (i === storyData.nodes.length - 1 || txt.includes('bebas') || txt.includes('malam') || txt.includes('sejarah') || txt.includes('peradaban')) {
        candidatePhoto = 'butterfly/media/brandenburg_night.jpg';
      }
    }

    // Alternating rhythm: balance photos vs action sketches (~50:50)
    const shouldPickPhoto = candidatePhoto && !usedPhotos.has(candidatePhoto) && (i % 2 === 1 || i === storyData.nodes.length - 1);

    if (shouldPickPhoto) {
      usedPhotos.add(candidatePhoto);
      node.mediaType = 'photo';
      node.mediaUrl = candidatePhoto;
      photoCount++;
    } else {
      // 2. Assign the EXACT action sketch matching the moment
      node.mediaType = 'graphic';
      graphicCount++;

      // Strict priority matching for graphic scenes
      if (isDominoCollapse) {
        node.directorType = 'domino-collapse';
      } else if (isWallDemolition) {
        node.directorType = 'wall-demolition';
      } else if (isGateBreach || txt.includes('pos bornholmer') || txt.includes('gerbang')) {
        node.directorType = 'gate-breach';
      } else if (txt.includes('konferensi') || txt.includes('pers') || txt.includes('wartawan') || txt.includes('podium') || txt.includes('schabowski') || txt.includes('blunder') || txt.includes('bicara')) {
        node.directorType = 'press-podium';
      } else if (isMemoInvestigate || txt.includes('kertas') || txt.includes('surat') || txt.includes('dokumen')) {
        node.directorType = 'memo-investigation';
      } else if (txt.includes('telepon') || txt.includes('panik') || txt.includes('dering') || txt.includes('pos jaga') || txt.includes('alarm')) {
        node.directorType = 'panic-phone';
      } else if (txt.includes('tv') || txt.includes('siaran') || txt.includes('breaking') || txt.includes('berita') || txt.includes('kabar')) {
        node.directorType = 'breaking-news';
      } else {
        node.directorType = 'forensic-dossier';
      }
    }

    if (!node.zoomDirection) {
      node.zoomDirection = i % 3 === 0 ? 'out' : i % 2 === 0 ? 'in' : 'panRight';
    }
  }

  console.log(`      ✓ Judul: "${storyData.title}"`);
  console.log(`      ✓ Jumlah Adegan: ${storyData.nodes.length} adegan`);
  console.log(`      ✓ Visual Kurasi: ${photoCount} Foto Arsip + ${graphicCount} Sketsa Animasi Forensik\n`);

  return storyData;
}

// -----------------------------------------------------------------------------
// STEP 2: Synthesize Voiceover via Gemini 3.8 Flash Lite TTS
// -----------------------------------------------------------------------------
async function generateVoiceover(storyData) {
  console.log('[2/4] Mensintesis narasi vokal via Gemini 3.8 Flash Lite TTS...');

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
      console.log('      (Kecepatan tinggi ~3 detik, akurasi tinggi, 0% beban CPU lokal!)');
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

  // Build clean stationary subtitle pages
  const wordTimestamps = [];
  let pageIndex = 0;

  const validWords = whisperData.allWords.map((w) => ({
    word: cleanSubtitleWord(w.word),
    startFrame: Math.round(w.start * FPS),
    endFrame: Math.round(w.end * FPS),
  })).filter((w) => w.word.length > 0);

  const chunks = partitionIntoChunks(validWords);
  for (const chunk of chunks) {
    chunk.forEach((w) => {
      wordTimestamps.push({
        ...w,
        pageIndex,
      });
    });
    pageIndex++;
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
  const hookFrames = Math.max(120, Math.round(totalFrames * hookRatio));
  storyData.hook.durationFrames = hookFrames;
  currentFrame += hookFrames;

  // Nodes frames
  for (let i = 0; i < storyData.nodes.length; i++) {
    const node = storyData.nodes[i];
    const nodeRatio = node.narration.length / totalChars;

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

  // Also save a permanent archive copy in src/data/stories/<storyId>.ts
  const storiesDir = path.join(ROOT_DIR, 'src', 'data', 'stories');
  fs.mkdirSync(storiesDir, { recursive: true });
  const archivePath = path.join(storiesDir, `${storyData.id}.ts`);
  const archiveContent = `// Automatically generated by AI Director & Sutradara Pipeline
import { ButterflyStoryData } from '../types';
export { cleanSubtitleWord } from '../../utils/textUtils';

export const CURRENT_STORY: ButterflyStoryData = ${JSON.stringify(fullStory, null, 2)};
`;
  fs.writeFileSync(archivePath, archiveContent, 'utf-8');

  console.log(`      ✓ Data cerita aktif tersimpan di : src/data/currentStory.ts`);
  console.log(`      ✓ Arsip cerita tersimpan di       : src/data/stories/${storyData.id}.ts`);
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
