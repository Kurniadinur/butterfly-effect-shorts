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
// -----------------------------------------------------------------------------
// 1. MASTER SUTRADARA & CREATIVE DIRECTOR PROMPT
// -----------------------------------------------------------------------------
export const CREATIVE_PERSPECTIVES = [
  {
    name: 'DRAMA BIROKRASI & BLUNDER DOKUMEN RAHASIA',
    angle: 'Fokuskan alur pada kelalaian birokrasi, draf regulasi terburu-buru, memo fatal tanpa penjelasan jam berlaku, dan kebingungan juru bicara di depan kamera dunia.',
  },
  {
    name: 'KETEGANGAN LAPANGAN & POS PENJAGA PERBATASAN',
    angle: 'Fokuskan alur pada komandan pos penjaga yang terisolasi, telepon darurat yang diabaikan atasan, ribuan warga yang menuntut dibukanya gerbang, dan keputusan pasrah menghindari pertumpahan darah.',
  },
  {
    name: 'PERAN KRUSIAL JURNALIS & KEKUATAN BREAKING NEWS',
    angle: 'Fokuskan alur pada wartawan yang melempar pertanyaan mendadak, kepanikan jawaban spontan di ruang pers, serta ledakan breaking news televisi yang menyulut jutaan warga keluar rumah.',
  },
  {
    name: 'EFEK DOMINO GEOPOLITIK GLOBAL (KOLAPS SISTEMIK)',
    angle: 'Fokuskan alur pada analogi efek domino sebab-akibat ekstrem: bagaimana kesalahan sepele 3 detik meruntuhkan perbatasan, merobohkan benteng ideologi, memicu revolusi damai, hingga membubarkan imperium adidaya.',
  },
  {
    name: 'DETIK-DETIK SPONTAN & REVOLUSI RAKYAT DI ATAS TEMBOK',
    angle: 'Fokuskan alur pada antusiasme dan keberanian rakyat jelata, palu godam yang menghantam beton pemisah, tangis reuni sanak saudara di tengah malam, dan malam paling bersejarah abad 20.',
  },
];

const DIRECTOR_PROMPT = `
Kamu adalah Creative Director & Sutradara Dokumenter Papan Atas Dunia sekaligus Storyteller bertaraf Nessie Judge (Nerror).
Tugasmu adalah menciptakan naskah dan alur visual "Butterfly Effect" (efek domino sebab-akibat ekstrem) berdurasi 60-120 detik untuk YouTube Shorts / TikTok (9:16).

PRINSIP WAJIB SUTRADARA KELAS DUNIA (VISUAL HARUS 100% MENJELASKAN MOMEN):
1. VISUAL FIDELITY MUTLAK (AI SUTRADARA MEMILIH SKETSA YANG COCOK):
   - DILARANG menampilkan visual yang abstrak atau tidak ada kaitannya dengan kalimat narasi!
   - Setiap adegan WAJIB secara gamblang memperlihatkan bukti visual dari apa yang sedang diucapkan.
   - Kamu (AI Sutradara) berkuasa penuh memilih tipe sketsa animasi (directorType) yang paling akurat untuk setiap momen cerita.
2. JANGAN PERNAH MENAMPILKAN WAJAH PELAKU / FOKUS UTAMA DI HOOK VIDEO (DETIK 0-4)!
   - Di Hook, penonton HANYA boleh merasakan KONTRAS EKSTREM antara Awal Sepele vs Bencana Global.
3. DILARANG KERAS MENGULANG FOTO / SKETSA YANG SAMA BERTURUT-TURUT!
   - Setiap adegan harus memiliki sudut pandang baru, variasi tempo, dan pergerakan kamera (cameraMotion): "zoomIn", "zoomOut", "panRight", atau "panLeft".
4. KATALOG SKETSA ANIMASI FORENSIK YANG BISA KAMU PILIH ("directorType"):
   * "wall-demolition"   : Animasi aksi massa merobohkan dinding/benteng/tembok, siluet orang mengayunkan palu godam dengan percikan api, retakan dinding beton menjalar, dan lautan massa mendorong dinding.
   * "gate-breach"       : Animasi aksi palang gerbang perbatasan/pos pemeriksaan terangkat ke atas, lampu sirene merah berputar di pos jaga, dan siluet warga menerobos maju membawa senter.
   * "domino-collapse"   : Balok domino 3D beruntun saling bertumbukan dan tumbang ke depan. (Tuliskan 5 tahap berurutan dipisahkan koma pada 'secondaryText'!).
   * "maritime-disaster" : Siluet kapal laut/samudra miring tenggelam di laut gelap bersalju, gunung es tajam, dan gelombang sinyal radio darurat SOS CQD melingkar memancar.
   * "reactor-meltdown"  : Penampang reaktor nuklir/industri dengan batang kendali membara merah berdenyut, indikator suhu/radiasi kritis, dan alarm bahaya.
   * "laboratory-discovery": Cawan petri laboratorium di bawah mikroskop, biakan bakteri dengan cincin zona inhibisi antibiotik yang tidak sengaja terbentuk.
   * "press-podium"      : Podium konferensi pers/pidato, hujan kilatan blitz kamera wartawan yang menyala-nyala acak, jam digital berdetik, dan dokumen di tangan.
   * "memo-investigation": Kertas dokumen memo rahasia di bawah sorotan lampu meja dengan kaca pembesar memindai kata fatal berstabilo kuning dan stempel merah deklasifikasi.
   * "panic-phone"       : Pos jaga dengan telepon engkol darurat bergetar merah tanpa instruksi atasan.
   * "breaking-news"     : Monitor TV tabung vintage dengan ticker darurat breaking news.
   * "soviet-collapse"   : Peta wilayah geopolitik retak & terpecah belah jadi negara-negara merdeka.
   * "tactical-map"      : Radar taktis melingkar & titik koordinat target episentrum gerakan.
   * "critical-gauge"    : Indikator meteran bahaya, tekanan overload, atau suhu kritis.
   * "forensic-dossier"  : Berkas penyelidikan deklasifikasi dengan stempel merah TOP SECRET.
   * "bureaucracy-draft" : Meja birokrasi dengan tumpukan draf regulasi formal.
   * "memo-handoff"      : Sketsa tangan menyelipkan berkas rahasia di meja gelap.
5. STRUKTUR NARRATIVE NESSIE JUDGE:
   - HOOK: "Kalian bayangin... dari [hal sepele], [dampak global masif] bisa terjadi hanya dalam satu malam?"
   - ESKALASI TEGANG (8 hingga 14 adegan berantai): Dari kelalaian kecil, kepanikan, kekacauan berantai, hingga klimaks sejarah dunia berubah.
   - CHILLING OUTRO: Pertanyaan menggantung yang memancing penonton berkomentar ("Menurutmu, apa keputusan sepele yang kamu ambil hari ini yang bakal mengubah hidupmu 5 tahun lagi?").
6. VARIASI CERITA SEGAR:
   - Setiap kali diminta membuat cerita baru (bahkan untuk topik yang sama), hasilkan alur, narasi, dan pilihan adegan visual yang SEGAR dan BERBEDA! Jangan mengulang urutan yang persis sama.
7. HANYA OUTPUT JSON MURNI TANPA KATA PENGANTAR DAN TANPA MARKDOWN!

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
    "rightImage": "butterfly/media/wall_demolition.jpg",
    "leftImage": "butterfly/media/memo_document.jpg"
  },
  "nodes": [
    {
      "step": 1,
      "timeOrYear": "LOKASI / TAHUN • JAM",
      "headline": "JUDUL ADEGAN SINGKAT BESAR",
      "narration": "Naskah narasi suara 10-25 kata yang dramatis...",
      "chaosLevel": 20,
      "mediaType": "photo atau graphic",
      "directorType": "salah satu dari 16 katalog di atas",
      "zoomDirection": "zoomIn / zoomOut / panRight / panLeft",
      "primaryText": "Teks judul spesifik di dalam elemen grafis",
      "secondaryText": "Teks subjudul / keterangan grafis (untuk domino-collapse: tuliskan 5 tahap dipisah koma)",
      "stampText": "Teks stempel resmi (misal: TOP SECRET, SINKING, CRITICAL, OVERLOAD)",
      "quoteText": "Teks kutipan ucapan / pertanyaan jika ada",
      "metricLabel": "Label indikator (misal: KORBAN JIWA, TEKANAN, RADIASI, PENONTON)",
      "metricValue": "Nilai indikator (misal: 1,517 JIWA, 99.4%, SOS CQD, 18:57:04)",
      "mediaUrl": "nama file foto jika photo, atau nama directorType jika graphic",
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
async function generateStoryboardWithGroq(topic, dynamicPrompt) {
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
              content: dynamicPrompt,
            },
          ],
          response_format: { type: 'json_object' },
          temperature: 0.88,
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
// STEP 1: Direct Storyboard via Gemini / Groq with High Creativity (Temp 0.88)
// -----------------------------------------------------------------------------
async function generateStoryboard(topic) {
  console.log('[1/4] Sutradara AI sedang merancang alur cerita & kurasi visual unik...');
  console.log('      (Menganalisa topik & menyusun 8-15 adegan berantai...)');

  // Perspective selection (explicit or random for high variance)
  const explicitPerspectiveIdx = process.argv[3] !== undefined && !isNaN(Number(process.argv[3])) ? Number(process.argv[3]) : null;
  const selectedPerspective = explicitPerspectiveIdx !== null && CREATIVE_PERSPECTIVES[explicitPerspectiveIdx]
    ? CREATIVE_PERSPECTIVES[explicitPerspectiveIdx]
    : CREATIVE_PERSPECTIVES[Math.floor(Math.random() * CREATIVE_PERSPECTIVES.length)];
  const sessionSalt = Date.now().toString(36);
  console.log(`      ✓ Sudut Pandang Kreatif: ${selectedPerspective.name}`);
  console.log(`      ✓ Arahan Sutradara: "${selectedPerspective.angle}"`);

  const dynamicPrompt = `${DIRECTOR_PROMPT}\n\n` +
    `================================================================\n` +
    `ARAHAN SUTRADARA UNTUK PRODUKSI INI (TAKE / ATTEMPT BARU):\n` +
    `SUDUT PANDANG (PERSPECTIVE): ${selectedPerspective.name}\n` +
    `INSTRUKSI KHUSUS: ${selectedPerspective.angle}\n` +
    `UNIQUE SESSION SEED: ${sessionSalt}\n` +
    `PENTING: Buat naskah, alur cerita, kalimat narasi, dan pilihan visual yang SEGAR, BERVARIASI, dan BERBEDA dari versi sebelumnya!\n` +
    `================================================================\n\n` +
    `Topik Cerita Butterfly Effect: "${topic}"`;

  const t0 = Date.now();
  let result = '';

  const provider = (process.env.STORY_PROVIDER || 'auto').toLowerCase();

  if (provider === 'groq') {
    result = await generateStoryboardWithGroq(topic, dynamicPrompt);
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
                  parts: [{ text: dynamicPrompt }],
                },
              ],
              config: {
                temperature: 0.88,
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
      result = await generateStoryboardWithGroq(topic, dynamicPrompt);
    }
  }

  console.log(`      ✓ Naskah & kurasi visual selesai dalam ${((Date.now() - t0) / 1000).toFixed(1)} detik.`);

  const cleaned = result.replace(/```json/gi, '').replace(/```/g, '').trim();
  const storyData = JSON.parse(cleaned);

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

  const VALID_DIRECTOR_TYPES = new Set([
    'wall-demolition', 'gate-breach', 'domino-collapse', 'maritime-disaster',
    'reactor-meltdown', 'laboratory-discovery', 'press-podium', 'memo-investigation',
    'panic-phone', 'breaking-news', 'soviet-collapse', 'tactical-map',
    'critical-gauge', 'forensic-dossier', 'bureaucracy-draft', 'memo-handoff',
    'breaking-ticker', 'press-question', 'schabowski-slip'
  ]);

  for (let i = 0; i < storyData.nodes.length; i++) {
    const node = storyData.nodes[i];
    node.step = i + 1;
    const txt = (node.headline + ' ' + node.narration + ' ' + (node.caption || '')).toLowerCase();

    // Check if photo actually exists locally and has valid size (> 1KB)
    let isPhotoValid = false;
    if (node.mediaType === 'photo' && node.mediaUrl) {
      const fullPath = path.join(ROOT_DIR, 'public', node.mediaUrl);
      if (fs.existsSync(fullPath) && fs.statSync(fullPath).size > 1024 && !usedPhotos.has(node.mediaUrl)) {
        isPhotoValid = true;
        usedPhotos.add(node.mediaUrl);
        photoCount++;
      }
    }

    if (!isPhotoValid) {
      node.mediaType = 'graphic';
      graphicCount++;

      // If the AI already chose a valid directorType, RESPECT AND PRESERVE THE AI'S CHOICE!
      if (node.directorType && VALID_DIRECTOR_TYPES.has(node.directorType)) {
        // AI choice is preserved!
      } else {
        // Fallback semantic matcher if directorType is missing or invalid:
        if (txt.includes('kapal') || txt.includes('tenggelam') || txt.includes('gunung es') || txt.includes('titanic') || txt.includes('samudera')) {
          node.directorType = 'maritime-disaster';
        } else if (txt.includes('reaktor') || txt.includes('nuklir') || txt.includes('chernobyl') || txt.includes('radiasi') || txt.includes('meltdown')) {
          node.directorType = 'reactor-meltdown';
        } else if (txt.includes('bakteri') || txt.includes('penisilin') || txt.includes('laboratorium') || txt.includes('cawan') || txt.includes('jamur')) {
          node.directorType = 'laboratory-discovery';
        } else if (txt.includes('domino') || txt.includes('bubar') || txt.includes('kolaps') || txt.includes('tirai besi') || txt.includes('runtuh beruntun')) {
          node.directorType = 'domino-collapse';
        } else if (txt.includes('tembok') || txt.includes('roboh') || txt.includes('palu') || txt.includes('dorong') || txt.includes('hancur') || txt.includes('beton')) {
          node.directorType = 'wall-demolition';
        } else if (txt.includes('gerbang') || txt.includes('palang') || txt.includes('pos bornholmer') || txt.includes('serbu') || txt.includes('terobos') || txt.includes('buka')) {
          node.directorType = 'gate-breach';
        } else if (txt.includes('konferensi') || txt.includes('pers') || txt.includes('wartawan') || txt.includes('podium') || txt.includes('bicara')) {
          node.directorType = 'press-podium';
        } else if (txt.includes('memo') || txt.includes('draf') || txt.includes('regulasi') || txt.includes('surat') || txt.includes('kertas') || txt.includes('sofort') || txt.includes('dokumen')) {
          node.directorType = 'memo-investigation';
        } else if (txt.includes('telepon') || txt.includes('panik') || txt.includes('dering') || txt.includes('pos jaga') || txt.includes('alarm')) {
          node.directorType = 'panic-phone';
        } else if (txt.includes('tv') || txt.includes('siaran') || txt.includes('breaking') || txt.includes('berita') || txt.includes('kabar')) {
          node.directorType = 'breaking-news';
        } else if (txt.includes('peta') || txt.includes('radar') || txt.includes('koordinat') || txt.includes('target')) {
          node.directorType = 'tactical-map';
        } else if (txt.includes('tekanan') || txt.includes('suhu') || txt.includes('daya') || txt.includes('kecepatan') || txt.includes('overload')) {
          node.directorType = 'critical-gauge';
        } else {
          node.directorType = 'forensic-dossier';
        }
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

// Only execute main when run directly as CLI script
if (process.argv[1] && path.resolve(fileURLToPath(import.meta.url)) === path.resolve(process.argv[1])) {
  main();
}
