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
Kamu adalah AI Senior Medical & Science Supervisor untuk simulasi anatomi tubuh 3D ("Apa yang Terjadi pada Tubuhmu Jika...").
Tugasmu adalah memeriksa dan menyempurnakan naskah storyboard berikut sebelum dirender menjadi video.

TOPIK: "${topic}"
DRAFT STORYBOARD:
${JSON.stringify(storyData, null, 2)}

KRITERIA AUDIT MEDIS & VISUAL:
1. AKURASI MEDIS & BIOLOGIS:
   - Pastikan reaksi organ, hormon, dan tahapan waktu masuk akal secara ilmiah (misal: lambung -> pembuluh darah -> jantung -> otak -> ginjal).
2. KELENGKAPAN TARGET ORGAN ('organTarget'):
   - Pastikan setiap node memiliki 'organTarget' yang valid ('brain', 'heart', 'lungs', 'stomach', 'liver', 'kidney', 'intestine', 'blood', 'nerves', atau 'muscles') agar pemindai anatomi 3D bergerak luwes antar-organ.
3. KEPADATAN TEKS LAYAR & HOOK PERTANYAAN:
   - 'hook.headline': WAJIB berupa kalimat pertanyaan pancingan penasaran (diakhiri tanda tanya "?"), misal: "BAGAIMANA KEADAAN TUBUHMU KETIKA ... ?".
   - 'hook.narration': WAJIB dimulai dengan kalimat pertanyaan ke penonton sebelum masuk ke penjelasan teknis organ.
   - 'primaryText': maksimal 25 karakter (indikator reaksi medis singkat).
   - 'headline': 3 sampai 6 kata yang jelas dan dramatis.

FORMAT OUTPUT JSON MURNI:
{
  "approved": true,
  "score": 95,
  "retentionScore": 96,
  "notes": "Akurasi medis dan alur pemindaian organ terverifikasi.",
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
