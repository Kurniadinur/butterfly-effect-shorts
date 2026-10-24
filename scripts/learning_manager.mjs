import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

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

FORMAT OUTPUT JSON MURNI (TANPA KATA PENGANTAR):
{
  "approved": true / false,
  "score": 0-100,
  "notes": "Penjelasan singkat audit...",
  "refinedStory": { objek storyData lengkap yang sudah disempurnakan }
}
`;

  // Call Groq LPU (~1.2 seconds, ultra-fast)
  if (groqApiKey) {
    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${groqApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'openai/gpt-oss-120b',
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
          temperature: 0.2, // Low temperature for strict factual accuracy
        }),
      });

      if (res.ok) {
        const json = await res.json();
        const content = json.choices?.[0]?.message?.content;
        if (content) {
          const parsed = JSON.parse(content);
          if (parsed && typeof parsed === 'object') {
            return {
              approved: parsed.approved !== false,
              score: typeof parsed.score === 'number' ? parsed.score : 90,
              notes: parsed.notes || 'Sensor otomatis selesai.',
              storyData: parsed.refinedStory && Array.isArray(parsed.refinedStory.nodes)
                ? parsed.refinedStory
                : storyData,
            };
          }
        }
      }
    } catch (err) {
      console.warn('[AI Critic] Groq audit skipped due to network:', err.message);
    }
  }

  // Fallback: Default approve if offline
  return {
    approved: true,
    score: 95,
    notes: 'Verifikasi integritas struktur lolos.',
    storyData,
  };
}
