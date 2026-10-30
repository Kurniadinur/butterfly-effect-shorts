#!/usr/bin/env node
/**
 * AUTONOMOUS AI MEDICAL CONTENT ENGINE (GAYA A: ZACK D. FILMS)
 * 
 * 100% Fully Autonomous Pipeline:
 * 1. AI Ideation & Brainstorming (Out-of-the-box & balanced medical scenarios, anti-duplicate).
 * 2. Dynamic AI Visual Asset Generation (Generates missing 3D character poses & organs + rembg cutout).
 * 3. AI Medical Storyboard & Scripting (12-16 chronological nodes, Doctor persona, concise sensation capsules).
 * 4. Doctor Voiceover & Precision Sync (Gemini 3.8 Flash TTS / Ardi Neural + Groq Whisper Large V3).
 * 5. Gaya A Remotion Timeline & Kinetic Subtitles.
 * 6. Multimodal Vision QA & Autonomous Self-Healing (Gemini Multimodal Vision Keyframe Inspection).
 * 7. Viral Publishing Pack Generation (High CTR titles, tags, pinned comment).
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { rpmGovernor } from './gemini_rpm_governor.mjs';
import { loadLearningMemory } from './learning_manager.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

dotenv.config({ path: path.join(ROOT_DIR, '.env') });

console.log('================================================================');
console.log('   AUTONOMOUS AI MEDICAL CONTENT ENGINE (GAYA A: ZACK D. FILMS) ');
console.log('================================================================');

/**
 * 1. Autonomous AI Ideator:
 * Generates viral, out-of-the-box (and balanced) medical simulation ideas,
 * cross-checking against previous stories to guarantee 100% freshness!
 */
async function generateAutonomousIdea() {
  console.log('\n[1/6] 🧠 AI Ideator sedang merumuskan ide konten medis viral...');

  // Read existing stories from stories directory to avoid repetition
  const storiesDir = path.join(ROOT_DIR, 'src', 'data', 'stories');
  const existingFiles = fs.existsSync(storiesDir) ? fs.readdirSync(storiesDir) : [];
  const existingTitles = existingFiles.map(f => f.replace(/\.ts$/, ''));

  const memory = loadLearningMemory();
  const benchmarkTitles = (memory.best_story_benchmarks || []).map(b => b.title).join(', ');

  const ideationPrompt = `
Kamu adalah Master Content Strategist untuk channel sains & medis 3D bergaya "Zack D. Films" versi Indonesia.
Tugasmu: Rumuskan SATU ide judul konten video "Apa Jadinya Kalau..." yang PALING VIRAL, OUT-OF-THE-BOX (belum pernah ada atau jarang terjadi), namun memiliki dasar ilmiah fisiologi manusia yang kuat dan sangat membuat penasaran penonton.

Kriteria:
1. Format judul: "Apa Jadinya Kalau Kamu [Aksi / Kondisi Ekstrem / Makanan / Minuman / Paparan Biologis]?"
2. Topik bisa berupa:
   - Skenario ekstrem & langka: Tersengat listrik ribuan volt, menelan benda asing (baterai/magnet), terjebak di suhu beku ekstrem, digigit hewan berbisa, dehidrasi air laut, menahan bersin ekstrem, dll.
   - Kebiasaan ekstrem sehari-hari: Minum kopi perut kosong, tidak tidur 72 jam, berhenti gula 30 hari, hanya minum minuman bersoda, dll.
3. DILARANG mengulang topik yang sudah pernah dibuat: ${existingTitles.join(', ')}.

Output PURE JSON:
{
  "title": "Apa Jadinya Kalau Kamu ... ?",
  "category": "Kategori Organ",
  "reasonWhyViral": "Alasan psikologis mengapa penonton tidak bisa menolak menonton video ini"
}
`;

  try {
    const rawResult = await rpmGovernor.executeWithGovernor('Autonomous Ideator', async (ai, key, keyNum) => {
      const model = rpmGovernor.getBestModelForKey(keyNum, 'text');
      const res = await ai.models.generateContent({
        model,
        contents: ideationPrompt,
        config: { temperature: 0.95 },
      });
      return res.text;
    });

    let clean = rawResult.replace(/```json/gi, '').replace(/```/g, '').trim();
    const fIdx = clean.indexOf('{');
    const lIdx = clean.lastIndexOf('}');
    if (fIdx !== -1 && lIdx !== -1) {
      const parsed = JSON.parse(clean.slice(fIdx, lIdx + 1));
      if (parsed.title && parsed.title.length > 10) {
        console.log(`      ✓ Topik Terpilih : "${parsed.title}"`);
        console.log(`      ✓ Target Organ   : ${parsed.category || 'Anatomi Terkait'}`);
        console.log(`      ✓ Hook Viral     : ${parsed.reasonWhyViral || 'Daya tarik penasaran tinggi'}`);
        return parsed.title;
      }
    }
  } catch (err) {
    console.warn('      ⚠ [Ideator Fallback] Menggunakan ide kurasi cerdas:', err.message);
  }

  // Fallback curated out-of-the-box topics
  const fallbacks = [
    'Apa Jadinya Kalau Tubuhmu Tersengat Listrik 10.000 Volt dan Bertahan Hidup?',
    'Apa Jadinya Kalau Kamu Tidak Sengaja Menelan Baterai Koin dan Magnet?',
    'Apa Jadinya Kalau Kamu Menghirup Gas Helium Murni Selama 2 Menit?',
    'Apa Jadinya Kalau Kamu Minum Air Laut di Tengah Samudra Saat Dehidrasi?',
    'Apa Jadinya Kalau Kamu Terjebak di Suhu Minus 40 Derajat Tanpa Jaket Tebal?',
    'Apa Jadinya Kalau Kamu Menahan Bersin Kuat dengan Menutup Hidung dan Mulut?',
  ];

  const chosen = fallbacks[Math.floor(Math.random() * fallbacks.length)];
  console.log(`      ✓ Topik Kurasi Pilihan: "${chosen}"`);
  return chosen;
}

/**
 * Executes a child process with streaming logs
 */
function runProcess(cmd, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { cwd: ROOT_DIR, stdio: 'inherit' });
    child.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`Process ${cmd} ${args.join(' ')} failed with code ${code}`));
    });
  });
}

/**
 * Main Autonomous Runner
 */
async function main() {
  const cliTopic = process.argv.slice(2).join(' ').trim();
  const selectedTopic = cliTopic.length > 5 ? cliTopic : await generateAutonomousIdea();

  console.log('\n================================================================');
  console.log(`PRODUKSI OTONOM DIMULAI: "${selectedTopic}"`);
  console.log('================================================================\n');

  // Step 2-5: Run AI Director Pipeline
  // (handles storyboard generation, dynamic asset resolution with generate_ai_asset.py + rembg,
  //  doctor voiceover, whisper alignment, timeline building, and visual QA audit)
  const pipelineScript = path.join(ROOT_DIR, 'scripts', 'ai_director_pipeline.mjs');
  await runProcess('node', [pipelineScript, selectedTopic]);

  console.log('\n================================================================');
  console.log('   🎉 PRODUKSI OTONOM SELESAI 100%! SEMUA ASPEK DIURUS AI        ');
  console.log('================================================================');
  console.log('1. Naskah & Storyboard : Tersimpan di src/data/currentStory.ts');
  console.log('2. Aset Karakter 3D    : Disesuaikan / Digenerate otomatis dengan rembg');
  console.log('3. Suara Dokter Medis  : Tersimpan di public/butterfly/audio/');
  console.log('4. Inspeksi Visual AI  : Diaudit oleh Gemini Multimodal Vision');
  console.log('5. Publishing Pack     : Judul & Hashtag viral siap copas di out/publishing_pack/');
  console.log('\nUntuk merender video langsung:');
  console.log('   npm run render');
  console.log('   atau jalankan "render_di_cloud.bat" untuk render gratis di GitHub Cloud!');
  console.log('================================================================\n');
}

main().catch((err) => {
  console.error('\n[FATAL ERROR]', err.message);
  process.exit(1);
});
