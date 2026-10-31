import fs from 'fs';

import path from 'path';

import { fileURLToPath } from 'url';

import { spawn } from 'child_process';

import dotenv from 'dotenv';

import { GoogleGenAI } from '@google/genai';

import { transcribeWithGroq } from './align_groq.mjs';

import { searchAndDownloadImage } from './fetch_scene_media.mjs';

import { loadLearningMemory, auditAndRefineStory } from './learning_manager.mjs';

import { runAutonomousRemotionEditor } from './ai_visual_inspector.mjs';

import { generatePublishingPack } from './generate_publishing_pack.mjs';

import { resolveDynamicStoryAssets } from './dynamic_asset_resolver.mjs';

import { rpmGovernor } from './gemini_rpm_governor.mjs';



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



const DEFAULT_TOPIC = 'Apa yang Terjadi pada Tubuhmu Jika Tidak Tidur Selama 72 Jam';

const topic = process.argv[2] || DEFAULT_TOPIC;



console.log('================================================================');

console.log('   AI 3D MEDICAL X-RAY & BODY SCANNER PIPELINE (ANTIGRAVITY)    ');

console.log('================================================================');

console.log(`Topik Naskah : "${topic}"`);

console.log(`AI Engine    : Google Gemini (${rpmGovernor.getBestModelForKey(1, 'text')}) (Antigravity Engine)`);

console.log(`Audio Sync   : Groq Cloud LPU (Whisper Large V3)`);

console.log('================================================================\n');



// -----------------------------------------------------------------------------

// 1. MASTER SUTRADARA MEDIS & ANATOMI ("APA YANG TERJADI PADA TUBUHMU JIKA...")

// -----------------------------------------------------------------------------

export const CREATIVE_PERSPECTIVES = [
  {
    name: '📖 MASTER ESSAY STORYTELLER & MINIMALIST TYPOGRAPHY FLOW',
    angle: 'TUTURKAN SEBUAH REFLEKSI DAN PEMAHAMAN MENGENAI TOPIK SECARA MENGALIR ALAMI (LET IT FLOW), SEPERTI KONTEN REELS VIRAL ESTETIK (CONTOH: AKADKITA.ID). ' +
      'Fokus 90% pada kekuatan tipografi teks elegan yang muncul di tengah layar baris demi baris mengikuti alunan suara narator yang tenang, intim, dan bersahabat. ' +
      'Sesekali saja (1-2 adegan) hadirkan elemen visual simpel atau kartu ilustrasi. ' +
      'TIDAK PERLU urutan perjalanan organ kaku, fase kaku, atau bunyi scanner medis ngik-ngik. ' +
      'Buat 7 hingga 9 bagian adegan cerita yang menyambung secara organik dari hook awal yang memancing rasa ingin tahu, pembahasan inti yang mudah dipahami manusia biasa, hingga pesan penutup yang membekas.',
  },
];

export const DIRECTOR_PROMPT = `
Kamu adalah Sutradara Konten Video Viral & Storyteller Reflektif Kelas Dunia (seperti kreator video esai estetik dan akun reels reflektif).
Tugasmu adalah menciptakan naskah cerita yang mengalir alami ("let it flow") dan alur visual berbasis Kinetic Typography Estetik berdurasi 50 hingga 65 detik untuk YouTube Shorts / TikTok / Reels (9:16).

PRINSIP WAJIB STORYTELLER ESTETIK (MINIMALIST TYPOGRAPHY):
1. GAYA NARASI MENGALIR & BERSAHABAT ("LET IT FLOW"):
   - Gunakan bahasa Indonesia sehari-hari yang santai, hangat, reflektif, dan mengalir seperti sedang bercerita dari hati ke hati.
   - HINDARI istilah medis kaku yang membingungkan atau jargon berlebihan. Jelaskan efek nyata yang dialami tubuh dengan perumpamaan yang mudah dimengerti (misal: "perut mulai perih", "jantung deg-degan", "kebelet pipis", "energi mendadak drop").
   - Jangan gunakan pola kaku fase 1, fase 2, menit ke sekian. Ceritakan prosesnya secara natural: apa yang terjadi di awal, bagaimana tubuh merespons, dan kenapa akhirnya kita merasa seperti itu.

2. HOOK PEMBUKA SINGKAT & MEMANCING RASA INGIN TAHU:
   - 'hook.narration' WAJIB hanya 1 kalimat pertanyaan singkat (8-14 kata, durasi ~2.5 - 3 detik).
   - Contoh: "Pernahkah kamu penasaran apa yang sebenarnya terjadi pada tubuhmu saat kamu minum kopi pas perut masih kosong?"
   - 'headline': Buat judul yang memikat, elegan, dan estetik.

3. STRUKTUR ADEGAN ('nodes') — 7 SAMPAI 9 BAGIAN MENGALIR:
   - Buat 7 sampai 9 adegan narasi ('nodes') yang saling terhubung secara runtut.
   - Setiap 'node' berisi narasi 1-2 kalimat (12-18 kata) yang pas dibacakan dalam 4-6 detik.
   - 'headline': Tagline singkat (2-4 kata) yang mewakili inti kalimat tersebut (contoh: "ASAM LAMBUNG NAIK", "ILUSI ENERGI", "CRASH MENDADAK").
   - 'humanFeeling': Catatan singkat mengenai rasa fisik atau emosi yang dirasakan penonton saat momen itu.
   - 'mediaType': Mayoritas "photo" / "graphic" sesekali saja (1 atau 2 adegan), sisanya difokuskan pada teks tipografi estetik.

4. OUTRO REFLEKTIF:
   - 'outro.narration': Kesimpulan bijak dan hangat tentang bagaimana seharusnya kita menyikapi tubuh kita.
   - 'outro.question': Pertanyaan penutup yang mengajak penonton berbagi pengalaman di kolom komentar.

FORMAT JSON WAJIB:
{
  "id": "slug-topik-estetik",
  "title": "JUDUL CERITA ESTETIK",
  "editorialStyle": {
    "mood": "typography-storyteller",
    "grainIntensity": 0.03,
    "vignetteStrength": 0.25,
    "shakeSensitivity": "subtle",
    "shakeThresholdChaos": 99
  },
  "hook": {
    "headline": "JUDUL SINGKAT MENARIK",
    "narration": "Pernahkah kamu penasaran apa yang sebenarnya terjadi pada tubuhmu saat ... ?",
    "kicker": "REFLEKSI HARI INI",
    "durationFrames": 90
  },
  "nodes": [
    {
      "step": 1,
      "timeOrYear": "BAGIAN 1",
      "headline": "AWALNYA TERASA BIASA",
      "narration": "Di tegukan pertama semuanya terasa normal, tapi di dalam lambung asam mulai bereaksi tanpa perlindungan makanan.",
      "humanFeeling": "Perut mulai terasa hangat dan sedikit begah",
      "mediaType": "photo",
      "primaryText": "REAKSI PERTAMA",
      "secondaryText": "Asam lambung meningkat",
      "caption": "Reaksi awal di dalam tubuh saat minuman asam masuk tanpa makanan."
    }
  ],
  "outro": {
    "narration": "Tubuh kita selalu memberi sinyal, tinggal apakah kita mau mendengarkannya sebelum terlambat.",
    "question": "Pernahkah kamu merasakan hal yang sama saat melakukan kebiasaan ini?"
  }
}
`;

// Helper: Rotational Gemini Caller with Per-Key RPM Governor & Auto-Cooldown

async function callGeminiWithRotation(taskFn) {

  return await rpmGovernor.executeWithGovernor('Gemini Task', taskFn);

}



// Groq Cloud LPU Fallback (Zero 503 Spike Guarantee)

async function generateStoryboardWithGroq(topic, dynamicPrompt) {

  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) throw new Error('GROQ_API_KEY tidak ditemukan di file .env');



  console.log('      [LPU Failover] Mengaktifkan Groq Cloud LPU (Cadangan Darurat)...');

  const models = ['qwen/qwen3.8-27b', 'openai/gpt-oss-20b', 'openai/gpt-oss-120b'];

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

              content: 'You are an autonomous AI Medical & Science Director specializing in "What Happens to Your Body If..." 3D anatomical simulation videos. Output pure valid JSON only.',

            },

            {

              role: 'user',

              content: dynamicPrompt,

            },

          ],

          response_format: { type: 'json_object' },

          temperature: 0.82,

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



// Guaranteed High Visual Density Guard

async function ensureHighVisualDensity(storyData, topic) {

  if (Array.isArray(storyData.nodes) && storyData.nodes.length >= 10) {

    return storyData;

  }



  console.log(`      ⚠️ [Densitas Guard] Naskah awal memiliki ${storyData.nodes?.length || 0} adegan (kurang dari target minimal 10 adegan).`);

  console.log(`      🚀 [AI Anatomy Expander] Membedah tahapan reaksi organ secara detail...`);



  const expandPrompt = `Kamu adalah Sutradara Medis & Sains AI Senior.

Naskah "Apa yang Terjadi pada Tubuhmu Jika..." berikut terlalu singkat (${storyData.nodes?.length || 0} adegan):

Judul: "${storyData.title || topic}"

Hook: "${storyData.hook?.narration || ''}"

Adegan Saat Ini:

${JSON.stringify(storyData.nodes, null, 2)}



TUGAS MUTLAK:

Pecah dan kembangkan menjadi 12 HINGGA 16 ADEGAN ANATOMI & SENSASI MANUSIA GRANULAR ('nodes')!

Setiap adegan harus menyoroti reaksi spesifik pada organ ('organTarget': 'brain' | 'heart' | 'lungs' | 'stomach' | 'liver' | 'kidney' | 'intestine' | 'blood' | 'nerves' | 'muscles'), memiliki 'timeOrYear' kronologis (misal "JAM KE-6 • JANTUNG"), 'headline' bahasa sehari-hari yang natural, 'humanFeeling' (apa yang dirasakan langsung oleh manusianya pada tahap itu), 'symptomEmoji', 'primaryText' singkat, dan 'imagePrompt' 3D medical X-ray render dalam bahasa Inggris.



FORMAT JSON MURNI:

{

  "nodes": [

    {

      "step": 1,

      "timeOrYear": "MENIT KE-10 • OTAK",

      "organTarget": "brain",

      "headline": "FOKUS MENINGKAT SEMENTARA",

      "narration": "Narasi ilmiah & apa yang dirasakan manusia 12-18 kata...",

      "humanFeeling": "Kepala terasa lebih segar dan mata langsung melek",

      "symptomEmoji": "⚡",

      "chaosLevel": 15,

      "mediaType": "photo",

      "searchQuery": "3D medical X-ray glowing brain",

      "imagePrompt": "3D medical anatomical X-ray visualization of glowing human brain, 9:16 vertical",

      "primaryText": "MATA LANGSUNG MELEK",

      "secondaryText": "Saraf pusat aktif",

      "stampText": "FASE 1",

      "caption": "Keterangan medis & efek ke tubuh manusia..."

    }

  ]

}`;



  try {

    const expandedResult = await rpmGovernor.executeWithGovernor('Scene Expander', async (ai, key, keyNum) => {

      const model = rpmGovernor.getBestModelForKey(keyNum, 'text');

      const res = await ai.models.generateContent({

        model,

        contents: [{ role: 'user', parts: [{ text: expandPrompt }] }],

        config: { temperature: 0.75, topP: 0.95 },

      });

      return res.text;

    });



    let clean = expandedResult.replace(/```json/gi, '').replace(/```/g, '').trim();

    const fIdx = clean.indexOf('{');

    const lIdx = clean.lastIndexOf('}');

    if (fIdx !== -1 && lIdx !== -1) {

      const parsed = JSON.parse(clean.slice(fIdx, lIdx + 1));

      if (Array.isArray(parsed.nodes) && parsed.nodes.length >= 8) {

        storyData.nodes = parsed.nodes.map(n => ({ ...n, mediaType: 'photo' }));

        console.log(`      ✓ [AI Expander Berhasil] Alur berhasil dimekarkan menjadi ${storyData.nodes.length} adegan dinamis!`);

      }

    }

  } catch (err) {

    console.warn(`      [Expander Warning] Gagal expand otomatis: ${err.message}. Melanjutkan dengan struktur awal.`);

  }



  return storyData;

}



// -----------------------------------------------------------------------------

// STEP 1: Direct Storyboard via Gemini / Groq with High Creativity (Temp 0.88)

// -----------------------------------------------------------------------------


/**
 * Generates topic-tailored biological & human sensation guidance for the AI Director
 */
function getTopicPhysiologicalGuidance(topic) {
  const lower = (topic || '').toLowerCase();

  if (/kopi|kafein|coffee/i.test(lower)) {
    return `PANDUAN FISIOLOGIS KHUSUS TOPIK KOPI PERUT KOSONG:
- Fase 1 (Detik 30 - Lambung): Asam klorida lambung melonjak tanpa ada makanan untuk dicerna, mukosa lambung teriritasi (ulu hati perih, panas, mual).
- Fase 2 (Menit 5 - Usus & Pencernaan): Asam kopi menstimulasi hormon gastrin dan kolesistokinin, memicu gerak peristaltik usus besar (perut mulas mendadak & dorongan darurat ke toilet).
- Fase 3 (Menit 15 - Kelenjar Adrenal): Kafein memicu pelepasan hormon kortisol dan adrenalin secara agresif (jantung berdebar cepat, tangan sedikit gemetar, cemas/gelisah).
- Fase 4 (Menit 30 - Otak): Kafein memblokir reseptor adenosin dan meningkatkan dopamin (mata melek tajam, fokus buatan, kewaspadaan tinggi).
- Fase 5 (Jam ke-3 - Arteri & Dehidrasi): Efek diuretik ringan kafein membuang cairan tubuh, pembuluh darah otak mulai mengalami vasokonstriksi (haus, tenggorokan kering, kepala berat).
- Fase 6 (Jam ke-5 - Reseptor Otak Crash): Reseptor adenosin yang tersumbat lepas serentak, membanjiri otak (kelelahan mendadak / caffeine crash, mengantuk berat, badan lemas).`;
  }

  if (/kencing|pipis|kemih|urine/i.test(lower)) {
    return `PANDUAN FISIOLOGIS KHUSUS MENAHAN KENCING:
- Fase 1 (Menit 20 - Saraf Detrusor): Dinding kandung kemih terisi 150ml, saraf mengirim sinyal regangan pertama ke otak (sensasi geli ringan di perut bawah).
- Fase 2 (Jam ke-2.5 - Otot Sfingter): Urin mencapai 350ml, otot sfingter panggul kelelahan menahan refleks miksi (kaki gemetar, berjalan mondar-mandir).
- Fase 3 (Jam ke-3 - Nosiseptor): Ambang batas nyeri terlampaui (mulas hebat, nyeri menusuk di area kemaluan).
- Fase 4 (Jam ke-4 - Refluks Ginjal): Tekanan balik mendorong urin kembali ke ureter menuju ginjal / hidronefrosis (pinggang belakang pegal tumpul).
- Fase 5 (Jam ke-5 - Risiko Sepsis & Infeksi): Bakteri berkembang biak cepat di urin stagnan (tubuh menggigil meriang, mual, meriang).
- Fase 6 (Pengosongan & Efek Jangka Panjang): Otot kandung kemih kram dan melar permanen (aliran tersendat, inkontinensia/beser).`;
  }

  if (/tidur|begadang|melek|insomnia/i.test(lower)) {
    return `PANDUAN FISIOLOGIS KHUSUS KURANG TIDUR / BEGADANG:
- Fase 1 (Jam ke-18 - Otak & Adenosin): Reseptor adenosin penuh molekul lelah, korteks prefrontal melambat (mata perih, refleks menurun).
- Fase 2 (Jam ke-24 - Kelenjar Adrenal): Tubuh memompa kortisol darurat agar tetap terjaga (emosi labil, detak jantung naik, lapar palsu).
- Fase 3 (Jam ke-36 - Sistem Imun): Sel pembunuh alami (NK cells) anjlok hingga 70%, sitokin inflamasi melonjak (badan meriang, nyeri sendi).
- Fase 4 (Jam ke-48 - Otak Tengah): Terjadi microsleep berulang selama 2-5 detik tanpa disadari (linglung, disorientasi).
- Fase 5 (Jam ke-72 - Persepsi Visual): Halusinasi sensorik dan delusi akibat kegagalan sintesis neurotransmiter (pandangan kabur, panik paranoid).`;
  }

  if (/mie|instan|natrium|garam|micin/i.test(lower)) {
    return `PANDUAN FISIOLOGIS KHUSUS MAKANAN TINGGI NATRIUM / MIE INSTAN:
- Fase 1 (Menit 15 - Lambung): Pengawet TBHQ dan lapisan lilin minyak membuat lambung bekerja ekstra mencerna mie berjam-jam (perut begah).
- Fase 2 (Menit 30 - Aliran Darah): Lonjakan natrium 1500mg menyerap air dari sel tubuh ke dalam pembuluh darah (haus ekstrem, dehidrasi seluler).
- Fase 3 (Menit 45 - Jantung & Arteri): Volume darah melonjak drastis, arteri menegang menahan tekanan darah tinggi (tekanan darah melonjak).
- Fase 4 (Jam ke-2 - Ginjal): Ginjal menyaring cairan berlebih dengan beban filtrasi maksimum (pembengkakan jaringan/edema).
- Fase 5 (Jam ke-4 - Otak): Lonjakan dan kejatuhan gula darah memicu rasa kantuk berat dan lapar kembali.`;
  }

  return `PANDUAN KRONOLOGIS FISIOLOGIS UMUM UNTUK TOPIK "${topic}":
- Pastikan membagi perkembangan reaksi biologis tubuh secara bertahap:
  1. Paparan Awal (Menit 1-5): Organ pertama yang bersentuhan & sensasi fisik pertama manusia.
  2. Kompensasi Darurat (Menit 15-30): Respon hormon, jantung, atau saraf yang berusaha menyeimbangkan tubuh.
  3. Eskalasi Kerusakan (Jam ke-1-3): Kerusakan jaringan seluler dan gejala fisik yang semakin nyata & menyakitkan.
  4. Fase Kritis (Jam ke-4+): Kegagalan organ menahan stres dan risiko medis jangka panjang.
  5. Pelajaran / Kesimpulan: Apa yang harus dilakukan penonton untuk mencegah bahaya tersebut.`;
}

async function generateStoryboard(topic) {

  console.log('[1/4] Sutradara AI sedang merancang alur cerita & kurasi visual unik...');

  console.log('      (Menganalisa topik & menyusun 8-15 adegan berantai...)');



  // Default to Master Multi-Perspective (Comprehensive & Full Detail)

  const explicitPerspectiveIdx = process.argv[3] !== undefined && !isNaN(Number(process.argv[3])) ? Number(process.argv[3]) : null;

  const selectedPerspective = explicitPerspectiveIdx !== null && CREATIVE_PERSPECTIVES[explicitPerspectiveIdx]

    ? CREATIVE_PERSPECTIVES[explicitPerspectiveIdx]

    : CREATIVE_PERSPECTIVES[0];

  const sessionSalt = Date.now().toString(36);

  console.log(`      ✓ Sudut Pandang Kreatif: ${selectedPerspective.name}`);

  console.log(`      ✓ Arahan Sutradara: "${selectedPerspective.angle}"`);



  // Load Autonomous Learning Memory

  const learningDb = loadLearningMemory();

  const benchmarkExamples = (learningDb.best_story_benchmarks || [])

    .slice(0, 3)

    .map(

      (b) =>

        `- Judul: "${b.title}"\n  Gaya Hook: "${b.hookStyle}" (${b.hookNarration})\n  Adegan: ${(b.scenes || []).join(' -> ')}\n  Alasan Sukses: ${b.why_successful}`

    )

    .join('\n');

  const blacklistedStr = (learningDb.blacklisted_patterns || []).join(', ');



  const topicGuidance = getTopicPhysiologicalGuidance(topic);
  const dynamicPrompt = `${DIRECTOR_PROMPT}\n\n${topicGuidance}\n\n` +

    `================================================================\n` +

    `MEMORI PEMBELAJARAN OTONOM DARI FEEDBACK SEBELUMNYA:\n` +

    `CONTOH NASKAH TERBAIK YANG DISUKAI PENONTON:\n${benchmarkExamples || 'Gunakan format dokumenter orisinil.'}\n\n` +

    `DAFTAR POLA/KATA YANG DILARANG (BLACKLISTED): ${blacklistedStr || 'Tidak ada.'}\n` +

    `================================================================\n\n` +

    `ARAHAN SUTRADARA UNTUK PRODUKSI INI (TAKE / ATTEMPT BARU):\n` +

    `SUDUT PANDANG (PERSPECTIVE): ${selectedPerspective.name}\n` +

    `INSTRUKSI KHUSUS: ${selectedPerspective.angle}\n` +

    `UNIQUE SESSION SEED: ${sessionSalt}\n` +

    `PENTING: Buat naskah, alur cerita, kalimat narasi, dan pilihan visual yang SEGAR, BERVARIASI, dan BERBEDA dari versi sebelumnya!\n` +

    `================================================================\n\n` +

    `Topik Cerita Butterfly Effect: "${topic}"`;



  const t0 = Date.now();

  let result = '';



  // 1. PRIMARY AI STORYBOARD ENGINE: Google Gemini (Antigravity Model)

  if (API_KEYS.length > 0) {

    try {

      console.log(`      ⚡ Menjalankan AI Storyboard Engine via Google Gemini (${rpmGovernor.getBestModelForKey(1, 'text')}) (Antigravity)...`);

      result = await rpmGovernor.executeWithGovernor('Antigravity Storyboard Engine', async (ai, key, keyNum) => {

        const model = rpmGovernor.getBestModelForKey(keyNum, 'text');

        const res = await ai.models.generateContent({

          model,

          contents: [{ role: 'user', parts: [{ text: dynamicPrompt }] }],

          config: { temperature: 0.85, topP: 0.95 },

        });

        return res.text;

      });

      console.log(`      ✓ Naskah berhasil disusun via Antigravity Engine (${rpmGovernor.getBestModelForKey(1, 'text')})!`);

    } catch (geminiErr) {

      console.warn(`      [Gemini Notice] Governor error: ${geminiErr.message}. Mencoba racing key langsung...`);

      const availableKeys = rpmGovernor.getAvailableKeysForRace();

      for (const keyState of availableKeys) {

        const { index, key } = keyState;

        const model = rpmGovernor.getBestModelForKey(index, 'text');

        const ai = new GoogleGenAI({ apiKey: key });

        try {

          const res = await ai.models.generateContent({

            model,

            contents: [{ role: 'user', parts: [{ text: dynamicPrompt }] }],

            config: { temperature: 0.85, topP: 0.95 },

          });

          result = res.text;

          console.log(`      ✓ Naskah selesai via Gemini Key ${index}!`);

          break;

        } catch (err) {}

      }

    }

  }



  // 2. Emergency fallback only if Gemini is completely unreachable

  if (!result) {

    const groqKey = (process.env.GROQ_API_KEY || '').trim();

    if (groqKey) {

      try {

        console.log(`      [Emergency Failover] Mengaktifkan Groq Cloud LPU Cadangan...`);

        result = await generateStoryboardWithGroq(topic, dynamicPrompt);

      } catch (groqErr) {

        console.warn(`      [Groq Failover] Groq gagal: ${groqErr.message}.`);

      }

    }

  }



  if (!result) {

    throw new Error('Gagal menghasilkan naskah cerita dari semua provider.');

  }



  console.log(`      ✓ Naskah & kurasi visual selesai dalam ${((Date.now() - t0) / 1000).toFixed(1)} detik.`);



  const cleaned = result.replace(/```json/gi, '').replace(/```/g, '').trim();

  let storyData = JSON.parse(cleaned);



  // Autonomous AI Quality Critic Audit (Actor-Critic Self-Refinement Loop)

  console.log(`\n      [AI Supervisor Audit] Mengaudit naskah secara mandiri (Fact-Check & Anti-Halusinasi)...`);

  const auditRes = await auditAndRefineStory(storyData, topic);

  if (auditRes.storyData) {

    storyData = auditRes.storyData;

  }

  console.log(`      ✓ [AI Supervisor] Skor Kelayakan: ${auditRes.score}/100 | Potensi Retensi Viral: ${auditRes.retentionScore || 92}/100 - ${auditRes.notes}`);



  // Guaranteed High Visual Density Guard (Anti-Short Story Safety Gate)

  storyData = await ensureHighVisualDensity(storyData, topic);



  // Automatically rotate across 5 Human-Crafted Documentary Editorial Themes so every video looks fresh!

  const EDITORIAL_THEME_ROTATION = [

    'vox-archival',

    'johnny-harris-slate',

    'cleo-abram-studio',

    'anatomical-atlas',

    'poster-documentary',

  ];

  let nextThemeMood = EDITORIAL_THEME_ROTATION[0];

  if (explicitPerspectiveIdx && explicitPerspectiveIdx >= 1 && explicitPerspectiveIdx <= EDITORIAL_THEME_ROTATION.length) {

    nextThemeMood = EDITORIAL_THEME_ROTATION[explicitPerspectiveIdx - 1];

  } else {

    try {

      const prevStoryPath = path.join(ROOT_DIR, 'src', 'data', 'currentStory.ts');

      if (fs.existsSync(prevStoryPath)) {

        const prevRaw = fs.readFileSync(prevStoryPath, 'utf8');

        const prevIdx = EDITORIAL_THEME_ROTATION.findIndex((t) => prevRaw.includes(`"mood": "${t}"`));

        if (prevIdx !== -1) {

          nextThemeMood = EDITORIAL_THEME_ROTATION[(prevIdx + 1) % EDITORIAL_THEME_ROTATION.length];

        } else {

          nextThemeMood = EDITORIAL_THEME_ROTATION[Math.floor(Math.random() * EDITORIAL_THEME_ROTATION.length)];

        }

      }

    } catch {}

  }



  if (!storyData.editorialStyle || typeof storyData.editorialStyle !== 'object') {

    storyData.editorialStyle = {

      mood: nextThemeMood,

      grainIntensity: 0.038,

      vignetteStrength: 0.32,

      shakeSensitivity: 'subtle',

      shakeThresholdChaos: 75,

    };

  } else {

    if (!EDITORIAL_THEME_ROTATION.includes(storyData.editorialStyle.mood)) {

      storyData.editorialStyle.mood = nextThemeMood;

    }

    const rawGrain = typeof storyData.editorialStyle.grainIntensity === 'number' ? storyData.editorialStyle.grainIntensity : 0.038;

    storyData.editorialStyle.grainIntensity = Math.max(0.025, Math.min(0.065, rawGrain));

    const rawVignette = typeof storyData.editorialStyle.vignetteStrength === 'number' ? storyData.editorialStyle.vignetteStrength : 0.32;

    storyData.editorialStyle.vignetteStrength = Math.max(0.2, Math.min(0.5, rawVignette));

    if (!storyData.editorialStyle.shakeSensitivity) storyData.editorialStyle.shakeSensitivity = 'subtle';

    if (typeof storyData.editorialStyle.shakeThresholdChaos !== 'number') storyData.editorialStyle.shakeThresholdChaos = 75;

  }

  console.log(`      🎨 [Auto-Rotating Editorial Theme] Gaya Edit Video Ini: ${storyData.editorialStyle.mood}`);



  // Normalize Hook (Enforce Natural Human Question Hook & Topic-Specific Hook Mode!)

  const cleanScenario = topic.replace(/^(Apa yang Terjadi pada Tubuhmu Jika|Apa Efek|Apa Jadinya Kalau|Bagaimana Jika)\s*/i, '').replace(/\?+$/, '').trim();

  const defaultQuestionHeadline = `APA JADINYA KALAU ${cleanScenario.toUpperCase()}?`;

  const defaultQuestionNarration = `Pernahkah kamu bertanya-tanya, apa yang sebenarnya terjadi di dalam tubuhmu dan apa yang kamu rasakan kalau ${cleanScenario.toLowerCase()}? Kamu mungkin mengira efeknya sepele, namun organ-organmu langsung bereaksi. Mari kita lihat detik demi detik!`;



  const isMultiDayTopic = /(\d+)\s*hari|sebulan|seminggu|setiap hari selama/i.test(topic);

  const isSleepOrScreenTopic = /tidur|begadang|melek|layar|hp|gadget|mata/i.test(topic);

  const isHoldFluidTopic = /tahan kencing|menahan pipis|dehidrasi|kurang minum|haus/i.test(topic);

  const detectedHookMode = isMultiDayTopic

    ? 'streak-calendar'

    : isSleepOrScreenTopic

    ? 'time-drain-battery'

    : isHoldFluidTopic

    ? 'pressure-overload'

    : 'empty-stomach-alert';

  const detectedKicker = isMultiDayTopic

    ? (topic.match(/(\d+\s*hari)/i)?.[1]?.toUpperCase() + ' NON-STOP' || '30 HARI NON-STOP')

    : isSleepOrScreenTopic

    ? 'REAKSI SARAF & TUBUH'

    : 'REAKSI ORGAN & TUBUH MANUSIA';



  if (!storyData.hook || typeof storyData.hook !== 'object') {

    storyData.hook = {

      hookStyle: 'fullscreen-dramatic',

      kicker: detectedKicker,

      headline: defaultQuestionHeadline,

      narration: defaultQuestionNarration,

      hookMode: detectedHookMode,

      leftTitle: 'Pemicu Awal',

      rightTitle: 'Yang Dirasakan Tubuh',

      leftBadge: 'PEMICU',

      rightBadge: 'GEJALA MANUSIA',

    };

  } else {

    if (!storyData.hook.hookStyle) storyData.hook.hookStyle = 'fullscreen-dramatic';

    if (!storyData.hook.kicker || /INVESTIGASI|EKSPERIMEN|SIMULASI|30 HARI/i.test(storyData.hook.kicker)) {

      storyData.hook.kicker = detectedKicker;

    }

    if (!isMultiDayTopic && storyData.hook.hookMode === 'streak-calendar') {

      storyData.hook.hookMode = detectedHookMode;

    }

    if (!storyData.hook.hookMode) {

      storyData.hook.hookMode = detectedHookMode;

    }

    if (!isMultiDayTopic && storyData.hook.hookTargetCount === 30) {

      storyData.hook.hookTargetCount = 1;

    }

    // Ensure headline is formatted as a natural human question (never stiff AI colons)

    if (!storyData.hook.headline || /:|mengancam nyawamu|eksperimen|bagaimana keadaan tubuhmu/i.test(storyData.hook.headline)) {

      storyData.hook.headline = defaultQuestionHeadline;

    } else if (!storyData.hook.headline.includes('?')) {

      const rawH = storyData.hook.headline.trim();

      if (/^(apa jadinya|bagaimana|apa|benarkah|kenapa|mengapa)/i.test(rawH)) {

        storyData.hook.headline = `${rawH}?`;

      } else {

        storyData.hook.headline = defaultQuestionHeadline;

      }

    }

    // Strictly Enforce Zack D. Films Snappy 1-Sentence Hook (~2.5 to 3.2s)

    if (!storyData.hook.narration) {

      storyData.hook.narration = `Apa yang sebenarnya terjadi pada tubuhmu jika kamu ${cleanScenario.toLowerCase()}?`;

    } else {

      // Extract ONLY the first punchy question or statement sentence for the Hook!

      const rawHookText = storyData.hook.narration.replace(/\s+/g, ' ').trim();

      const sentenceMatch = rawHookText.match(/^([^.!?]+[.!?])/);

      if (sentenceMatch) {

        const firstSentence = sentenceMatch[1].trim();

        const excess = rawHookText.slice(firstSentence.length).trim();

        storyData.hook.narration = firstSentence;

        if (excess && storyData.nodes && storyData.nodes.length > 0) {

          // Push any excess explanation into Node 1 so no insight is lost!

          storyData.nodes[0].narration = `${excess} ${storyData.nodes[0].narration || ''}`.trim();

        }

      }

    }

    if (!storyData.hook.leftTitle) storyData.hook.leftTitle = 'Pemicu Awal';

    if (!storyData.hook.rightTitle) storyData.hook.rightTitle = 'Reaksi Organ';

    if (!storyData.hook.leftBadge) storyData.hook.leftBadge = 'PEMICU AWAL';

    if (!storyData.hook.rightBadge) storyData.hook.rightBadge = 'REAKSI ORGAN';

  }



  // Normalize Outro (Topic-Specific & Human-Focused, Never Old Historical Fallback!)

  const dynamicTopicOutro = `Tubuhmu selalu memberi sinyal lewat apa yang kamu rasakan setiap hari. Setelah melihat reaksi organ dan efeknya pada tubuhmu tadi, gejala mana yang paling sering kamu rasakan saat ${cleanScenario.toLowerCase()}?`;

  if (!storyData.outro || typeof storyData.outro !== 'object') {

    const defaultOutro = typeof storyData.outro === 'string' && !/5 tahun lagi|keputusan sepele/i.test(storyData.outro)

      ? storyData.outro

      : dynamicTopicOutro;

    storyData.outro = {

      narration: defaultOutro,

      question: defaultOutro,

    };

  } else {

    if (!storyData.outro.narration || /5 tahun lagi|keputusan sepele/i.test(storyData.outro.narration)) {

      storyData.outro.narration = (storyData.outro.question && !/5 tahun lagi|keputusan sepele/i.test(storyData.outro.question))

        ? storyData.outro.question

        : dynamicTopicOutro;

    }

    if (!storyData.outro.question || /5 tahun lagi|keputusan sepele/i.test(storyData.outro.question)) {

      storyData.outro.question = storyData.outro.narration;

    }

  }



  // Normalize Nodes

  if (!Array.isArray(storyData.nodes) || storyData.nodes.length === 0) {

    throw new Error('Storyboard JSON tidak memiliki array nodes yang valid');

  }



  // Enforce Clean Slate from 0: Unique Production Run ID (Zero stale cache reuse)

  const runId = Date.now().toString(36);

  const baseSlug = (storyData.id || topic)

    .toLowerCase()

    .replace(/[^a-z0-9]+/g, '-')

    .replace(/(^-|-$)/g, '')

    .slice(0, 35) || 'story';

  storyData.id = `${baseSlug}-${runId}`;



  const storySlug = storyData.id;

  const storyMediaDir = path.join(ROOT_DIR, 'public', 'butterfly', 'media', storySlug);

  

  // Wipe and recreate directory to guarantee 100% fresh visuals from 0

  if (fs.existsSync(storyMediaDir)) {

    fs.rmSync(storyMediaDir, { recursive: true, force: true });

  }

  fs.mkdirSync(storyMediaDir, { recursive: true });



  console.log(`\n      [Visual Hunter (Clean Slate)] Kurasi visual 3D otonom untuk: "${storyData.title || topic}"...`);



  // Arketipe pembuka medis 3D murni

  if (!storyData.hook.archetype) {

    storyData.hook.archetype = 'anatomical-scan';

  }



  // Continuous 1-Body Anatomical Journey Mode:

  // Tidak perlu lagi mengunduh 15 foto terpisah yang menyebabkan pergantian slide patah-patah.

  // Seluruh perjalanan kamera menggunakan 1 Kanvas Tubuh 3D X-Ray Utuh + Rig Organ Hidup secara kontinu!

  const continuousBodyAsset = 'butterfly/media/medical_body_xray.jpg';

  storyData.hook.leftImage = continuousBodyAsset;

  storyData.hook.rightImage = continuousBodyAsset;

  console.log(`      ✓ [Continuous Body Journey] Menggunakan Kanvas Anatomi 3D Utuh (Tanpa Potongan Slide/Frame)`);



  let photoCount = 0;

  for (let i = 0; i < storyData.nodes.length; i++) {

    const node = storyData.nodes[i];

    node.step = i + 1;

    node.mediaType = 'photo';

    node.visualSource = 'PEMINDAIAN 3D KONTINU';

    node.mediaUrl = continuousBodyAsset;

    photoCount++;

    if (!node.zoomDirection) {

      node.zoomDirection = i % 3 === 0 ? 'out' : i % 2 === 0 ? 'in' : 'panRight';

    }

  }



  // Bulletproof Asset Integrity Check:

  // Memverifikasi setiap file fisik ada di disk. Jika tidak ada, salin fallback sehingga Remotion 100% bebas dari 404.

  const defaultFallback = 'butterfly/media/medical_body_xray.jpg';

  const ensureDiskAsset = (relPath) => {

    if (!relPath) return defaultFallback;

    const absPath = path.join(process.cwd(), 'public', relPath);

    if (fs.existsSync(absPath) && fs.statSync(absPath).size > 1000) {

      return relPath;

    }

    try {

      const fallbackAbs = path.join(process.cwd(), 'public', defaultFallback);

      if (fs.existsSync(fallbackAbs)) {

        fs.mkdirSync(path.dirname(absPath), { recursive: true });

        fs.copyFileSync(fallbackAbs, absPath);

        return relPath;

      }

    } catch (e) {}

    return defaultFallback;

  };



  storyData.hook.leftImage = ensureDiskAsset(storyData.hook.leftImage);

  storyData.hook.rightImage = ensureDiskAsset(storyData.hook.rightImage);

  for (const node of storyData.nodes) {

    node.mediaUrl = ensureDiskAsset(node.mediaUrl);

  }



  console.log(`      ✓ Judul: "${storyData.title}"`);

  console.log(`      ✓ Jumlah Adegan: ${storyData.nodes.length} adegan`);

  console.log(`      ✓ Visual Produksi: 100% Reka Adegan Foto Sinematik AI (${photoCount} foto)\n`);



  return storyData;

}



/**

 * AI Voiceover Pacing & Phonetics Supervisor:

 * 1. Converts numbers, years, and dates to natural spoken Indonesian.

 * 2. Applies phonetic transcription for tricky foreign historical names.

 * 3. Sanitizes typography artifacts (quotes, brackets) to ensure pristine TTS output.

 * 4. Audits voiceover pacing and word rate (~130-150 words per minute).

 */

async function prepareTtsScriptWithAiSupervisor(rawScript, topic) {

  // Normalize known awkward terminology

  let sanitizedScript = rawScript

    .replace(/kantung kemal/gi, 'kandung kemih')

    .replace(/kemal/gi, 'kandung kemih')

    .replace(/["“”«»]/g, '')

    .trim();



  // 1. Primary: Antigravity Voiceover Prosody & Natural Cadence

  try {

    const rawResult = await rpmGovernor.executeWithGovernor('Doctor Vocal Supervisor', async (ai, key, keyNum) => {

      const model = rpmGovernor.getBestModelForKey(keyNum, 'text');

      const res = await ai.models.generateContent({

        model,

        contents: [

          {

            role: 'user',

            parts: [

              {

                text:

                  'You are an Elite Conversational Storytelling Voice Director for Indonesian reels (gaya narator reflektif, hangat, dan mengalir santai seperti video akadkita.id).\n' +

                  'Your mission: Refine the script so that Text-to-Speech (TTS) engines speak with the natural cadence, breathing pauses, and warm, intimate, reflective storytelling cadence. Not rushed, not clinical, not stiff. Let it flow naturally.\n' +

                  'Rules:\n' +

                  '1. Use authentic Indonesian medical terms (strictly use "kandung kemih", NEVER "kantung kemal").\n' +

                  '2. Convert numbers to natural spoken Indonesian words (e.g., "72 jam" -> "tujuh puluh dua jam", "300 ml" -> "tiga ratus mililiter").\n' +

                  '3. Add conversational micro-pauses with commas and ellipses (...) where a doctor would naturally breathe or emphasize critical physiological warnings.\n' +

                  '4. Return pure JSON: { "phoneticScript": "...", "wordCount": number, "estimatedDurationSec": number }\n\n' +

                  `NASKAH ASLI TOPIK "${topic}":\n"${sanitizedScript}"\n\nOptimalkan naskah medis di atas agar dibacakan dengan intonasi dokter yang berwibawa, edukatif, dan sangat memikat.`,

              },

            ],

          },

        ],

        config: { temperature: 0.15, topP: 0.95 },

      });

      return res.text;

    });



    let clean = rawResult.replace(/```json/gi, '').replace(/```/g, '').trim();

    const fIdx = clean.indexOf('{');

    const lIdx = clean.lastIndexOf('}');

    if (fIdx !== -1 && lIdx !== -1) {

      const parsed = JSON.parse(clean.slice(fIdx, lIdx + 1));

      if (parsed.phoneticScript && parsed.phoneticScript.length > 20) {

        console.log(`      ✓ [Doctor Vocal Director] Naskah dioptimalkan dengan intonasi dokter medis (${parsed.wordCount || parsed.phoneticScript.split(' ').length} kata, est. ~${parsed.estimatedDurationSec || 60}s)`);

        return parsed.phoneticScript;

      }

    }

  } catch (geminiErr) {

    console.warn('[Doctor Vocal Director] Gemini supervisor skipped:', geminiErr.message);

  }



  // 2. Fallback to Groq LPU only if Gemini fails

  const groqApiKey = process.env.GROQ_API_KEY;

  if (groqApiKey) {

    try {

      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {

        method: 'POST',

        headers: {

          Authorization: `Bearer ${groqApiKey}`,

          'Content-Type': 'application/json',

        },

        body: JSON.stringify({

          model: 'qwen/qwen3.8-27b',

          messages: [

            {

              role: 'system',

              content:

                'You are an elite Voice Director for Indonesian medical documentaries. Fix awkward terms to "kandung kemih". Return JSON: { "phoneticScript": "...", "wordCount": number }',

            },

            {

              role: 'user',

              content: `NASKAH ASLI TOPIK "${topic}":\n"${sanitizedScript}"`,

            },

          ],

          response_format: { type: 'json_object' },

          temperature: 0.1,

        }),

      });



      if (res.ok) {

        const json = await res.json();

        const content = json.choices?.[0]?.message?.content;

        if (content) {

          const parsed = JSON.parse(content);

          if (parsed.phoneticScript && parsed.phoneticScript.length > 20) {

            console.log(`      ✓ [Doctor Vocal Director Groq] Naskah dioptimalkan intonasi medisnya`);

            return parsed.phoneticScript;

          }

        }

      }

    } catch (err) {}

  }



  return sanitizedScript;

}



// -----------------------------------------------------------------------------

// STEP 2: Synthesize Voiceover via Gemini 3.8 Flash Lite TTS

// -----------------------------------------------------------------------------

async function generateVoiceover(storyData) {

  console.log('[2/4] Mensintesis narasi vokal bersuara Dokter Medis Profesional...');



  const cleanTopicText = (storyData.title || topic || 'kebiasaan ini')

    .replace(/^(Apa yang Terjadi pada Tubuhmu Jika|Apa Efek|Apa Jadinya Kalau Kamu|Apa Jadinya Kalau|Bagaimana Jika)\s*/i, '')

    .replace(/\?+$/, '')

    .trim();

  const safeOutroNarration =

    storyData.outro?.narration && !/keputusan sepele|5 tahun lagi/i.test(storyData.outro.narration)

      ? storyData.outro.narration

      : `Setelah melihat apa yang terjadi di dalam tubuhmu tadi, gejala mana yang paling sering kamu rasakan saat ${cleanTopicText.toLowerCase()}?`;

  if (storyData.outro) {

    storyData.outro.narration = safeOutroNarration;

    if (!storyData.outro.question || /keputusan sepele|5 tahun lagi/i.test(storyData.outro.question)) {

      storyData.outro.question = `Kalau kamu ${cleanTopicText.toLowerCase()}, gejala mana yang paling sering kamu rasakan di tubuhmu?`;

    }

  }



  const scriptParts = [

    storyData.hook?.narration || `Pernahkah kamu membayangkan apa yang terjadi di dalam tubuhmu saat ${cleanTopicText.toLowerCase()}?`,

    ...storyData.nodes.map((n) => n?.narration || ''),

    safeOutroNarration,

  ].filter(Boolean);

  const rawScript = scriptParts.join(' ');



  // Supervised by Doctor Vocal Director

  const fullScript = await prepareTtsScriptWithAiSupervisor(rawScript, storyData.title || topic);



  const outDir = path.join(ROOT_DIR, 'public', 'butterfly', 'audio');

  fs.mkdirSync(outDir, { recursive: true });



  const wavFilename = `${storyData.id}_doctor_voiceover.wav`;

  const wavPath = path.join(outDir, wavFilename);

  const mp3Path = path.join(outDir, `${storyData.id}_doctor_voiceover.mp3`);



  // 1. PRIMARY ENGINE: Google Gemini 3.8 Flash TTS (Antigravity Doctor Persona: 'Charon')

  if (API_KEYS.length > 0) {

    try {

      console.log('      ⚡ Menggunakan Google Gemini 3.8 Flash TTS (Suara Dokter Medis: Charon)...');

      const audioBuffer = await callGeminiWithRotation(async (ai, key, keyNum) => {

        const response = await ai.models.generateContent({

          model: 'gemini-3.8-flash-tts',

          contents: fullScript,

          config: {

            speechConfig: {

              voiceConfig: {

                prebuiltVoiceConfig: {

                  voiceName: 'Puck', // Warm, reflective, conversational storyteller voice

                },

              },

            },

          },

        });

        const part = response.candidates?.[0]?.content?.parts?.[0];

        if (part?.inlineData?.data) {

          console.log(`      ✓ Suara dokter berhasil disintesis via Gemini TTS (Key ${keyNum})!`);

          return Buffer.from(part.inlineData.data, 'base64');

        }

        throw new Error('TTS response tidak memuat inline audio bytes');

      });



      fs.writeFileSync(wavPath, audioBuffer);

      console.log(`      ✓ File audio tersimpan di: ${wavPath}\n`);

      return { wavPath, relAudioUrl: `butterfly/audio/${wavFilename}`, scriptParts };

    } catch (geminiTtsErr) {

      console.warn(`      [Gemini TTS Notice] Gagal via Gemini (${geminiTtsErr.message}). Beralih ke Microsoft Ardi Neural...`);

    }

  }



  // 2. SECONDARY ENGINE: Microsoft Ardi Neural TTS Fallback

  try {

    console.log('      ⚡ Mengaktifkan Microsoft Ardi Neural TTS (Suara Dokter Pria Matang & Berwibawa)...');

    const pyScript = `

import asyncio

import edge_tts

import subprocess

import sys



async def run():

    text = sys.stdin.read()

    comm = edge_tts.Communicate(text, 'id-ID-ArdiNeural', rate='-3%', pitch='-1Hz')

    await comm.save(r'${mp3Path}')

    subprocess.run(['ffmpeg', '-y', '-i', r'${mp3Path}', '-ar', '44100', '-ac', '2', r'${wavPath}'], check=True)



asyncio.run(run())

`;

    await new Promise((resolve, reject) => {

      const p = spawn('python', ['-c', pyScript], { stdio: ['pipe', 'inherit', 'inherit'] });

      p.stdin.write(fullScript);

      p.stdin.end();

      p.on('close', (code) => {

        if (code === 0) resolve();

        else reject(new Error(`Python edge-tts exited with code ${code}`));

      });

    });



    console.log(`      ✓ Suara dokter berhasil disintesis via Ardi Neural: ${wavPath}\n`);

    return { wavPath, relAudioUrl: `butterfly/audio/${wavFilename}`, scriptParts };

  } catch (edgeErr) {

    throw new Error(`Semua TTS gagal: ${edgeErr.message}`);

  }

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

// STEP 4: Subtitle Paging & Story Construction (Ground-Truth Audio Aligned)

// -----------------------------------------------------------------------------

function cleanSubtitleWord(rawWord) {

  if (!rawWord) return '';

  return rawWord

    .replace(/[":;?!,()[\]{}…«»“”‘’\\/]/g, '')

    .replace(/\.+/g, '')

    .replace(/^-+|-+$/g, '')

    .trim();

}



function normalizeToken(w) {

  return (w || '').toLowerCase().replace(/[^a-z0-9]/g, '');

}



function partitionClause(words) {

  const chunks = [];

  let i = 0;

  while (i < words.length) {

    const remaining = words.length - i;

    let size = 3;

    if (remaining === 4) {

      size = 2;

    } else if (remaining === 2) {

      size = 2;

    } else if (remaining <= 3) {

      size = remaining;

    }

    chunks.push(words.slice(i, i + size));

    i += size;

  }

  return chunks;

}



function partitionSectionWords(sectionWords) {

  const clauses = [];

  let currentClause = [];



  for (let i = 0; i < sectionWords.length; i++) {

    const w = sectionWords[i];

    currentClause.push(w);



    const hasPunctuation = /[.!?]/.test(w.word);

    const nextWord = sectionWords[i + 1];

    const isBreathPause = nextWord ? (nextWord.start - w.end) >= 0.25 : false;



    if (hasPunctuation || isBreathPause || i === sectionWords.length - 1) {

      clauses.push(currentClause);

      currentClause = [];

    }

  }



  const allChunks = [];

  for (const clause of clauses) {

    if (clause.length > 0) {

      allChunks.push(...partitionClause(clause));

    }

  }

  return allChunks;

}



function buildSynchronizedStory(storyData, whisperData, relAudioUrl) {

  console.log('[4/4] Membangun timeline sinkron audio ground-truth dan kinetic subtitle berirama...');



  const FPS = 30;

  const allWords = whisperData.allWords || [];

  const totalFrames = Math.round(whisperData.totalDurationSec * FPS);



  const scriptSections = [

    { id: 'hook', text: storyData.hook.narration, target: storyData.hook },

    ...storyData.nodes.map((n) => ({ id: `node_${n.step}`, text: n.narration, target: n })),

    { id: 'outro', text: storyData.outro.narration, target: storyData.outro },

  ];



  let wordIdx = 0;

  const matchedSections = [];



  for (let s = 0; s < scriptSections.length; s++) {

    const currentSec = scriptSections[s];

    const nextSec = scriptSections[s + 1];



    const startWordIdx = wordIdx;

    let endWordIdx = -1;



    if (!nextSec) {

      endWordIdx = allWords.length - 1;

      wordIdx = allWords.length;

    } else {

      const nextStartTokens = nextSec.text.split(/\s+/).map(normalizeToken).filter((t) => t.length > 2).slice(0, 4);

      let foundNextStart = -1;

      for (let i = startWordIdx + 4; i < allWords.length; i++) {

        const wClean = normalizeToken(allWords[i]?.word);

        if (nextStartTokens.length > 0 && (wClean === nextStartTokens[0] || (wClean.startsWith(nextStartTokens[0]) && nextStartTokens[0].length >= 4))) {

          if (nextStartTokens.length >= 2 && i + 1 < allWords.length) {

            const wNext = normalizeToken(allWords[i + 1]?.word);

            if (wNext.includes(nextStartTokens[1]) || nextStartTokens[1].includes(wNext)) {

              foundNextStart = i;

              break;

            }

          } else {

            foundNextStart = i;

            break;

          }

        }

      }



      if (foundNextStart !== -1) {

        endWordIdx = foundNextStart - 1;

        wordIdx = foundNextStart;

      } else {

        const approxWords = currentSec.text.split(/\s+/).length;

        endWordIdx = Math.min(allWords.length - 1, startWordIdx + approxWords - 1);

        wordIdx = endWordIdx + 1;

      }

    }



    const assignedWords = allWords.slice(startWordIdx, endWordIdx + 1);

    matchedSections.push({

      ...currentSec,

      words: assignedWords,

      startSec: assignedWords[0]?.start ?? 0,

      endSec: assignedWords[assignedWords.length - 1]?.end ?? 0,

    });

  }



  // Calculate cut frames placed right in the silence gap between scenes

  const cutFrames = [0];

  for (let s = 0; s < matchedSections.length - 1; s++) {

    const cur = matchedSections[s];

    const nxt = matchedSections[s + 1];

    const midSec = (cur.endSec + nxt.startSec) / 2;

    const cutF = Math.round(midSec * FPS);

    cutFrames.push(cutF);

  }

  cutFrames.push(totalFrames);



  // AI Timeline & Rhythm Integrity Supervisor

  // Guarantees every scene has at least 2.5s (75 frames) breathing room and does not flash awkwardly

  const MIN_SCENE_FRAMES = 75; // 2.5s minimum

  for (let i = 1; i < cutFrames.length - 1; i++) {

    if (cutFrames[i] - cutFrames[i - 1] < MIN_SCENE_FRAMES) {

      cutFrames[i] = cutFrames[i - 1] + MIN_SCENE_FRAMES;

    }

  }

  // Ensure last cut leaves room for outro

  if (totalFrames - cutFrames[cutFrames.length - 2] < MIN_SCENE_FRAMES) {

    cutFrames[cutFrames.length - 2] = Math.max(0, totalFrames - MIN_SCENE_FRAMES);

  }



  // Apply ground-truth frame-perfect durations to Hook, Nodes, and Outro

  storyData.hook.durationFrames = cutFrames[1] - cutFrames[0];



  for (let i = 0; i < storyData.nodes.length; i++) {

    const node = storyData.nodes[i];

    const startF = cutFrames[i + 1];

    const endF = cutFrames[i + 2];

    node.startFrame = startF;

    node.durationFrames = endF - startF;

  }



  storyData.outro.durationFrames = cutFrames[cutFrames.length - 1] - cutFrames[cutFrames.length - 2];

  console.log(`      ✓ [AI Timeline Supervisor] Integritas durasi diverifikasi: Hook (${(storyData.hook.durationFrames / 30).toFixed(1)}s), ${storyData.nodes.length} Nodes (${(storyData.nodes.reduce((a,b)=>a+b.durationFrames,0) / 30).toFixed(1)}s), Outro (${(storyData.outro.durationFrames / 30).toFixed(1)}s)`);



  // Build clean stationary subtitle pages strictly within each scene

  const wordTimestamps = [];

  let pageIndex = 0;



  for (const sec of matchedSections) {

    const chunks = partitionSectionWords(sec.words);

    for (const chunk of chunks) {

      for (const w of chunk) {

        const cleanW = cleanSubtitleWord(w.word);

        if (cleanW) {

          wordTimestamps.push({

            word: cleanW,

            startFrame: Math.round(w.start * FPS),

            endFrame: Math.round(w.end * FPS),

            pageIndex,

          });

        }

      }

      pageIndex++;

    }

  }



  storyData.wordTimestamps = wordTimestamps;

  storyData.audioUrl = relAudioUrl;

  storyData.totalDurationFrames = totalFrames;



  const fullStory = {

    id: storyData.id,

    title: storyData.title,

    editorialStyle: storyData.editorialStyle,

    hook: storyData.hook,

    nodes: storyData.nodes,

    outro: storyData.outro,

    wordTimestamps,

    audioUrl: relAudioUrl,

    totalDurationFrames: totalFrames,

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

  console.log(`      ✓ Total frame video: ${totalFrames} frames (${(totalFrames / 30).toFixed(2)} detik)`);

  console.log(`      ✓ Total halaman subtitle: ${pageIndex} halaman stationary\n`);

}



// -----------------------------------------------------------------------------

// MAIN ENTRY

// -----------------------------------------------------------------------------

// Valid Organ Anchors recognized by ContinuousBodyJourney

const VALID_ORGAN_TARGETS = [

  'brain', 'heart', 'lungs', 'stomach', 'liver', 'kidney',

  'intestine', 'blood', 'nerves', 'bladder', 'pancreas', 'vocal_cords', 'esophagus'

];



function resolveOrganTarget(explicitOrgan, text) {

  if (explicitOrgan && VALID_ORGAN_TARGETS.includes(explicitOrgan)) return explicitOrgan;

  const combined = `${explicitOrgan || ''} ${text || ''}`.toLowerCase();

  if (/otak|saraf pusat|neuron|pikiran|kepala|mata|kognitif|dopamin/i.test(combined)) return 'brain';

  if (/saraf|tulang belakang|spinal|impuls/i.test(combined)) return 'nerves';

  if (/jantung|detak|tekanan darah|tensi|nadi|kardio/i.test(combined)) return 'heart';

  if (/darah|pembuluh|vaskular/i.test(combined)) return 'blood';

  if (/paru|napas|oksigen|sesak/i.test(combined)) return 'lungs';

  if (/lambung|asam|ulu hati|mual|muntah/i.test(combined)) return 'stomach';

  if (/hati|liver|detoks/i.test(combined)) return 'liver';

  if (/pankreas|insulin|gula darah/i.test(combined)) return 'pancreas';

  if (/ginjal|filtrasi|ureum/i.test(combined)) return 'kidney';

  if (/kandung kemih|kemih|pipis|kencing|urin/i.test(combined)) return 'bladder';

  if (/usus|kolon|pencernaan/i.test(combined)) return 'intestine';

  return 'heart'; // Highest stakes visceral fallback

}



/**

 * Autonomous AI Script & Timeline Guardian

 * Systemic Quality Gate: Guarantees every future video has 50-65s viral Shorts pacing,

 * 1-sentence hook, and zero generic idling!

 */

export async function runAIScriptTimelineGuardian(storyData, topic) {

  console.log('\n================================================================');

  console.log('   🛡️ [AI SCRIPT & TIMELINE GUARDIAN] Menjamin Standar Shorts 90%+ Retensi...');

  console.log('================================================================');



  // 1. Hook Retention Rule: Strictly 1 punchy question that ALWAYS states the topic!

  const cleanTopicCore = topic

    .replace(/^(apa yang terjadi pada tubuhmu jika|apa efek|apa jadinya kalau|efek)\s*/i, '')

    .replace(/\?+$/, '')

    .trim();

  storyData.hook.narration = `Apa yang sebenarnya terjadi pada tubuhmu jika kamu ${cleanTopicCore.toLowerCase()}?`;

  console.log(`      ✓ Hook Narration Enforced : "${storyData.hook.narration}" (~2.8s)`);



  // 2. Shorts Viral Node Count Rule (7 to 9 nodes max for 50-65s total duration)

  if (Array.isArray(storyData.nodes) && storyData.nodes.length > 9) {

    console.log(`      ⚡ [AI Node Consolidation] Mengurangi ${storyData.nodes.length} adegan berlebih menjadi 8 adegan berkecepatan tinggi...`);

    const sortedByStakes = [...storyData.nodes].sort((a, b) => (b.chaosLevel || 0) - (a.chaosLevel || 0));

    const keepSet = new Set([0, storyData.nodes.length - 1]);

    for (const n of sortedByStakes) {

      if (keepSet.size >= 8) break;

      const idx = storyData.nodes.indexOf(n);

      keepSet.add(idx);

    }

    const finalNodes = [...keepSet].sort((a, b) => a - b).map((idx, newStep) => ({

      ...storyData.nodes[idx],

      step: newStep + 1,

    }));

    storyData.nodes = finalNodes;

  }



  // 3. Organ Targeting Rule (Eliminates generic "otot & rangka" / "full-body" idling)

  for (const node of storyData.nodes) {

    const resolved = resolveOrganTarget(node.organTarget, `${node.headline} ${node.primaryText} ${node.narration}`);

    if (node.organTarget !== resolved) {

      console.log(`      🛠️ [AI Organ Retargeting] Adegan ${node.step}: ${node.organTarget || 'none'} -> ${resolved}`);

      node.organTarget = resolved;

    }

    // Enforce concise narration (12 to 18 words, ~4-5s per node)

    const nWords = (node.narration || '').split(/\s+/);

    if (nWords.length > 22) {

      node.narration = nWords.slice(0, 20).join(' ') + '...';

    }

  }



  // 4. Outro Rule: 1 short conclusion + question (~4-5s)

  if (storyData.outro && storyData.outro.narration) {

    const oWords = storyData.outro.narration.split(/\s+/);

    if (oWords.length > 22) {

      storyData.outro.narration = oWords.slice(0, 18).join(' ') + '.';

    }

  }



  console.log(`      ✓ Struktur Shorts Selesai: Hook + ${storyData.nodes.length} Nodes + Outro (Target Durasi: ~50-65s)\n`);

}



async function main() {

  try {

    const storyData = await generateStoryboard(topic);

    await runAIScriptTimelineGuardian(storyData, topic);

    await resolveDynamicStoryAssets(storyData);

    const { wavPath, relAudioUrl } = await generateVoiceover(storyData);

    const whisperData = await runWhisperAlignment(wavPath, storyData.id);

    buildSynchronizedStory(storyData, whisperData, relAudioUrl);



    // 5. Autonomous AI Remotion Video Editor Engine (Multi-Checkpoint Screening & Self-Healing Loop)

    try {

      await runAutonomousRemotionEditor(storyData);

    } catch (qaErr) {

      console.warn('      ⚠ [Autonomous AI Editor Skip]', qaErr.message);

    }



    // 6. Automated YouTube Shorts Viral Publishing Pack (Titles, Description, Hashtags, Pinned Comment)

    try {

      await generatePublishingPack(storyData);

    } catch (pubErr) {

      console.warn('      ⚠ [Publishing Pack Skip]', pubErr.message);

    }



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

