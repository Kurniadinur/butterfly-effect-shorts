import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
dotenv.config();

const keys = [
  process.env.GEMINI_API_KEY,
  process.env.GEMINI_API_KEY_2,
  process.env.GEMINI_API_KEY_3,
  process.env.GEMINI_API_KEY_4,
].filter(Boolean);

console.log('Testing Parallel Multi-Key Race with JSON prompt across all 4 keys...');
const t0 = Date.now();

const prompt = 'Buat 1 naskah pendek format JSON murni: { "title": "TITANIC", "hook": { "narration": "Kunci loker yang terlupakan menenggelamkan kapal terbesar." } }';

const tasks = keys.map((key, idx) => {
  const ai = new GoogleGenAI({ apiKey: key });
  const model = idx === 0 ? 'gemini-2.5-flash' : 'gemini-3.5-flash';
  return ai.models.generateContent({
    model,
    contents: prompt,
  }).then((res) => ({
    key: idx + 1,
    model,
    text: res.text,
    durationMs: Date.now() - t0,
  }));
});

try {
  const winner = await Promise.any(tasks);
  console.log(`\n🎉 RACE WINNER: Key ${winner.key} (${winner.model}) in ${winner.durationMs} ms!`);
  console.log('Result text:', winner.text.trim());
} catch (err) {
  console.error('All keys failed:', err);
}
