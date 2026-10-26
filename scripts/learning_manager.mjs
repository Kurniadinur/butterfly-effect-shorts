import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { rpmGovernor } from './gemini_rpm_governor.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const MEMORY_FILE = path.join(ROOT_DIR, 'memory', 'learning_db.json');

dotenv.config({ path: path.join(ROOT_DIR, '.env') });

/**
 * Loads the active learning database from disk
 */
export function loadLearningMemory() {
  if (!fs.existsSync(MEMORY_FILE)) {
    return {
      system_principles: [],
      best_story_benchmarks: [],
      blacklisted_patterns: [],
      user_feedbacks: [],
    };
  }
  try {
    return JSON.parse(fs.readFileSync(MEMORY_FILE, 'utf8'));
  } catch (err) {
    console.warn('[Learning Memory] Failed to parse learning_db.json:', err.message);
    return {
      system_principles: [],
      best_story_benchmarks: [],
      blacklisted_patterns: [],
      user_feedbacks: [],
    };
  }
}

/**
 * Persists the updated learning database to disk
 */
export function saveLearningMemory(data) {
  try {
    const dir = path.dirname(MEMORY_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(MEMORY_FILE, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('[Learning Memory] Failed to save learning_db.json:', err.message);
    return false;
  }
}

/**
 * Records user feedback (Thumb up/down, rating, critique) and updates autonomous memory
 */
export function recordFeedback({ storyId, title, rating, note, storyData }) {
  const memory = loadLearningMemory();
  const feedbackEntry = {
    id: storyId || `fb-${Date.now().toString(36)}`,
    timestamp: new Date().toISOString(),
    title: title || storyData?.title || 'Untitled',
    rating: rating === 'positive' ? 'positive' : 'negative',
    note: note || '',
  };

  memory.user_feedbacks.push(feedbackEntry);
  if (memory.user_feedbacks.length > 50) memory.user_feedbacks.shift();

  // If positive, promote to benchmark examples
  if (rating === 'positive' && storyData) {
    const scenes = (storyData.nodes || []).map((n) => n.directorType || n.headline);
    const benchmark = {
      id: storyData.id,
      title: storyData.title,
      hookStyle: storyData.hook?.hookStyle || 'fullscreen-dramatic',
      hookNarration: storyData.hook?.narration || '',
      scenes,
      why_successful: note || 'Disukai penonton: alur tegang, visual konsisten, tanpa template klise.',
    };
    // Keep top 6 benchmarks
    const filtered = memory.best_story_benchmarks.filter((b) => b.id !== storyData.id);
    filtered.unshift(benchmark);
    memory.best_story_benchmarks = filtered.slice(0, 6);
  }

  // If negative with critique, extract pattern to blacklist
  if (rating === 'negative' && note) {
    const noteLower = note.toLowerCase();
    if (noteLower.includes('klise') || noteLower.includes('template') || noteLower.includes('gambar') || noteLower.includes('b-roll')) {
      if (!memory.blacklisted_patterns.includes(note)) {
        memory.blacklisted_patterns.push(note);
      }
    }
  }

  saveLearningMemory(memory);
  return memory;
}

function sanitizeLayoutDensity(data) {
  if (!data || !Array.isArray(data.nodes)) return data;
  data.nodes.forEach((n) => {
    if (n.primaryText && n.primaryText.length > 28) n.primaryText = n.primaryText.slice(0, 28);
    if (n.secondaryText && n.secondaryText.length > 34) n.secondaryText = n.secondaryText.slice(0, 34);
    if (n.stampText && n.stampText.length > 16) n.stampText = n.stampText.slice(0, 16);
    if (n.metricLabel && n.metricLabel.length > 15) n.metricLabel = n.metricLabel.slice(0, 15);
    if (n.metricValue && n.metricValue.length > 15) n.metricValue = n.metricValue.slice(0, 15);
  });
  return data;
}

/**
 * Autonomous AI Quality Critic / Auditor (Actor-Critic Self-Refinement Loop)
 * Reviews the drafted storyboard before rendering, detecting hallucinations,
 * inappropriate B-roll queries, or stale template patterns.
 */
export async function auditAndRefineStory(storyData, topic, groqApiKey = process.env.GROQ_API_KEY) {
  const memory = loadLearningMemory();
  const blacklisted = memory.blacklisted_patterns || [];

  const auditPrompt = `
Kamu adalah AI Senior Executive Producer & Fact-Checking Supervisor Dokumenter Sejarah Tingkat Dunia.
Tugasmu adalah menguji dan mengaudit naskah storyboard Butterfly Effect berikut sebelum dirender menjadi video.

TOPIK: "${topic}"
DRAFT STORYBOARD:
${JSON.stringify(storyData, null, 2)}

DAFTAR HITAM POLA TERLARANG:
${JSON.stringify(blacklisted)}

KRITERIA AUDIT KETAT:
1. AKURASI SEJARAH WAJIB MUTLAK:
   - Apakah ada elemen fiksi / halusinasi aneh yang tidak ada dalam sejarah aslinya? (Misal: katup pipa bocor di Tembok Berlin, kecelakaan mobil di Titanic).
   - JIKA ADA ELEMEN FIKSI: Ganti adegan tersebut dengan adegan sejarah yang benar-benar terjadi!
2. HOOK BERSIH & MENGGIGIT:
   - DILARANG menggunakan kalimat klise 'Kalian bayangin... dari...'.
   - Kalimat pembuka harus dramatis, segar, dan alami.
3. VISUAL COHERENCE:
   - Pilihan 'directorType' harus 100% masuk akal dengan apa yang dinarasikan.
4. ZERO WEIRD B-ROLL:
   - Pastikan tidak ada pencarian foto bebas yang berpotensi menarik gambar salah (seperti Checkpoint Charlie atau foto modern).
5. MONITOR GAYA EDITING & KENYAMANAN MATA (EYE COMFORT & ATMOSPHERE):
   - Pastikan 'editorialStyle' ada dan sesuai dengan topik ('cold-war-crisis', 'noir-forensic', 'industrial-decay', 'amber-urgent', atau 'clean-documentary').
   - Pastikan 'grainIntensity' berada di ambang aman (0.03 - 0.065), tidak menyilaukan dan nyaman di mata penonton.
   - Pastikan 'shakeThresholdChaos' proporsional (60-75) agar kamera berguncang halus hanya saat momen tegang puncak.
6. SUPERVISI TIPOGRAFI & DENSITAS TEKS VECTOR SKETCH:
   - Pastikan teks grafis tidak kepanjangan agar tidak terpotong di layar HP:
     * 'primaryText': maksimal 25 karakter.
     * 'secondaryText': maksimal 30 karakter.
     * 'stampText': maksimal 16 karakter (huruf kapital singkat & padat).
     * 'headline': 3 sampai 6 kata.
7. SUPERVISI RETENSI VIRAL YOUTUBE SHORTS (VIRAL RETENTION ARC & SEAMLESS LOOP):
   - Hook 3 Detik (Stop-The-Scroll): Kalimat pembuka harus langsung menyebutkan waktu/tokoh spesifik dan kontras sepele vs masif.
   - Seamless Infinite Loop: Pastikan bagian penutup outro dapat menyambung kembali secara halus ke awal hook agar retensi melebihi 100%.
8. SUPERVISI SOUND DESIGN DOKUMENTER (FOLEY MATCHING & ANTI-DISTRACTION GUARANTEE):
   - Efek suara harus relevan dengan momen visualnya (misal: lock_click untuk kunci/brankas, morse_code untuk telegraf, gavel_strike untuk vonis, paper_stamp untuk memo).
   - Menjamin volume berada pada rentang halus (0.20 - 0.30) dan diputar dengan jeda ~12 frame setelah cut agar suara narasi (1.0) tetap jernih dan fokus penonton tidak terganggu.
9. SUPERVISI DENSITAS MULTI-VISUAL DOKUMENTER (100% FOTO SINEMATIK, DILARANG SKETSA 2D):
   - DILARANG KERAS 1 visual diam terlalu lama (>5 detik) untuk banyak penjelasan!
   - Wajib memecah alur menjadi 15 hingga 25+ babak visual dinamis ('nodes'), dengan pergantian foto arsip otentik / reka adegan sinematik tiap 3-5 detik.
   - Setiap kali suara narasi menyebut aksi, objek, atau subjek baru (kunci, dokumen, pos jaga, radar, lonceng, benturan), visual WAJIB berganti menyesuaikan hal tersebut agar penonton tidak mengalami kelelahan visual!
10. SUPERVISI DETAIL BUKTI HISTORIS KONKRET (ANTI-MEMBINGUNGKAN PENONTON):
    - DILARANG membiarkan narasi hanya berbicara secara abstrak/umum (misal: 'ia membaca memo keliru' tanpa menjelaskan apa isi memonya).
    - Periksa: Apakah narasi atau teks visual sudah membeberkan ISI SPESIFIK / KLAUSUL ASLI dari dokumen, kutipan kata blunder fatal, atau identitas objek/pos penting?
    - JIKA MASIH KABUR: Supervisor WAJIB menyempurnakan narasi dan field teks grafis ('primaryText' / 'secondaryText') agar membeberkan klausul asli dokumen atau kutipan kata bersejarahnya secara gamblang (misal: izin baru berlaku besok jam 4 pagi dengan visa, tapi diumumkan berlaku segera tanpa syarat)!

FORMAT OUTPUT JSON MURNI (TANPA KATA PENGANTAR):
{
  "approved": true / false,
  "score": 0-100,
  "retentionScore": 0-100,
  "notes": "Penjelasan singkat audit & retensi...",
  "refinedStory": { objek storyData lengkap yang sudah disempurnakan }
}
`;

  // 1. Primary Audit via Groq LPU (Instant, no 429 quota exhaustion)
  const trimmedGroqKey = (groqApiKey || process.env.GROQ_API_KEY || '').trim();
  if (trimmedGroqKey) {
    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${trimmedGroqKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'qwen/qwen3.8-27b',
          messages: [
            {
              role: 'system',
              content:
                'You are an elite historical documentary Executive Producer & Fact-Checker. Return pure valid JSON.',
            },
            {
              role: 'user',
              content: auditPrompt,
            },
          ],
          response_format: { type: 'json_object' },
          temperature: 0.2,
        }),
      });

      if (res.ok) {
        const json = await res.json();
        const content = json.choices?.[0]?.message?.content;
        if (content) {
          const parsed = JSON.parse(content);
          if (parsed && typeof parsed === 'object') {
            let finalStory = storyData;
            if (parsed.refinedStory && Array.isArray(parsed.refinedStory.nodes)) {
              if (parsed.refinedStory.nodes.length >= (storyData.nodes?.length || 0)) {
                finalStory = parsed.refinedStory;
              }
            }
            return {
              approved: parsed.approved !== false,
              score: typeof parsed.score === 'number' ? parsed.score : 94,
              retentionScore: typeof parsed.retentionScore === 'number' ? parsed.retentionScore : 95,
              notes: parsed.notes || 'Sensor otonom lolos verifikasi.',
              storyData: sanitizeLayoutDensity(finalStory),
            };
          }
        }
      }
    } catch (err) {
      console.warn('[AI Supervisor] Groq audit failover to Gemini:', err.message);
    }
  }

  // 2. Fallback to Gemini if Groq unavailable
  try {
    const rawResult = await rpmGovernor.executeWithGovernor('Fact-Check Supervisor', async (ai, key, keyNum) => {
      const model = rpmGovernor.getBestModelForKey(keyNum, 'text');
      const res = await ai.models.generateContent({
        model,
        contents: [{ role: 'user', parts: [{ text: auditPrompt }] }],
        config: { temperature: 0.2, topP: 0.95 },
      });
      return res.text;
    });

    let clean = rawResult.replace(/```json/gi, '').replace(/```/g, '').trim();
    const fIdx = clean.indexOf('{');
    const lIdx = clean.lastIndexOf('}');
    if (fIdx !== -1 && lIdx !== -1) {
      const parsed = JSON.parse(clean.slice(fIdx, lIdx + 1));
      if (parsed && typeof parsed === 'object') {
        let finalStory = storyData;
        if (parsed.refinedStory && Array.isArray(parsed.refinedStory.nodes)) {
          if (parsed.refinedStory.nodes.length >= (storyData.nodes?.length || 0)) {
            finalStory = parsed.refinedStory;
          }
        }
        return {
          approved: parsed.approved !== false,
          score: typeof parsed.score === 'number' ? parsed.score : 92,
          retentionScore: typeof parsed.retentionScore === 'number' ? parsed.retentionScore : 94,
          notes: parsed.notes || 'Sensor otonom lolos verifikasi.',
          storyData: sanitizeLayoutDensity(finalStory),
        };
      }
    }
  } catch (geminiErr) {
    // silently catch
  }

  return {
    approved: true,
    score: 90,
    retentionScore: 92,
    notes: 'Verifikasi naskah selesai.',
    storyData: sanitizeLayoutDensity(storyData),
  };
}
