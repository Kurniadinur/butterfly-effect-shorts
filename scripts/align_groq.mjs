import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

dotenv.config({ path: path.join(ROOT_DIR, '.env') });

const GROQ_API_KEY = process.env.GROQ_API_KEY;

export async function transcribeWithGroq(audioPath, outputJsonPath) {
  if (!GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY tidak ditemukan di file .env');
  }

  console.log(`[Groq Cloud Whisper] Mengirim audio ke Groq LPU (Whisper Large V3)...`);
  console.log(`                     Audio: ${path.basename(audioPath)}`);

  const fileBuffer = fs.readFileSync(audioPath);
  const blob = new Blob([fileBuffer], { type: 'audio/wav' });
  const formData = new FormData();
  formData.append('file', blob, path.basename(audioPath));
  formData.append('model', 'whisper-large-v3');
  formData.append('response_format', 'verbose_json');
  formData.append('timestamp_granularities[]', 'word');
  formData.append('timestamp_granularities[]', 'segment');
  formData.append('language', 'id');

  const startTime = Date.now();
  const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${GROQ_API_KEY}`,
    },
    body: formData,
  });

  const elapsedSec = ((Date.now() - startTime) / 1000).toFixed(2);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Groq API Error (${response.status}): ${errorText}`);
  }

  const result = await response.json();
  console.log(`[Groq Cloud Whisper] SUKSES dalam ${elapsedSec} detik! (Model: Whisper Large V3)`);

  const totalDurationSec = Number(result.duration || (result.words?.length ? result.words[result.words.length - 1].end : 0)).toFixed(2);
  const words = (result.words || []).map((w) => ({
    word: w.word.trim(),
    start: Number(w.start.toFixed(3)),
    end: Number(w.end.toFixed(3)),
  }));

  const segments = (result.segments || []).map((s) => ({
    id: s.id,
    start: Number(s.start.toFixed(3)),
    end: Number(s.end.toFixed(3)),
    text: s.text.trim(),
    words: words.filter((w) => w.start >= s.start - 0.05 && w.end <= s.end + 0.05),
  }));

  const formattedData = {
    model: 'whisper-large-v3',
    engine: 'Groq Cloud LPU',
    totalDurationSec: parseFloat(totalDurationSec),
    allWords: words,
    segments,
    text: result.text,
  };

  if (outputJsonPath) {
    fs.mkdirSync(path.dirname(outputJsonPath), { recursive: true });
    fs.writeFileSync(outputJsonPath, JSON.stringify(formattedData, null, 2), 'utf-8');
    console.log(`[Groq Cloud Whisper] Hasil tersimpan di: ${outputJsonPath}`);
  }

  return formattedData;
}

// Standalone CLI runner
if (process.argv[1] === __filename) {
  const defaultAudio = path.join(ROOT_DIR, 'public', 'butterfly', 'audio', 'berlin_wall_voiceover.wav');
  const defaultOutput = path.join(ROOT_DIR, 'public', 'butterfly', 'audio', 'groq_whisper_timestamps.json');

  const audioPath = process.argv[2] || defaultAudio;
  const outputPath = process.argv[3] || defaultOutput;

  transcribeWithGroq(audioPath, outputPath)
    .then((data) => {
      console.log(`\nSelesai! Terdeteksi ${data.allWords.length} kata, durasi: ${data.totalDurationSec}s.`);
    })
    .catch((err) => {
      console.error('[FATAL]', err.message);
      process.exit(1);
    });
}
