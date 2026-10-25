import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

dotenv.config({ path: path.join(ROOT_DIR, '.env') });

const RAW_KEYS = [
  process.env.GEMINI_API_KEY,
  process.env.GEMINI_API_KEY_2,
  process.env.GEMINI_API_KEY_3,
  process.env.GEMINI_API_KEY_4,
].filter(Boolean);

/**
 * GEMINI RPM & RATE-LIMIT GOVERNOR
 * Tracks requests per key, enforces rolling 60s windows, prevents concurrency spikes,
 * and handles 429 ResourceExhausted automatically with 60s cooldowns.
 */
class GeminiRpmGovernor {
  constructor(apiKeys) {
    this.keys = apiKeys.map((key, idx) => ({
      index: idx + 1,
      key,
      lastUsed: 0,
      requestsInWindow: [],
      cooldownUntil: 0,
      totalSuccess: 0,
      total429: 0,
    }));
    // Google AI Studio free tier is 15 RPM. We cap at 12 RPM for safety margin.
    this.MAX_SAFE_RPM = 12;
  }

  cleanWindow(keyState) {
    const now = Date.now();
    keyState.requestsInWindow = keyState.requestsInWindow.filter((t) => now - t < 60000);
  }

  isKeyReady(keyState) {
    const now = Date.now();
    if (now < keyState.cooldownUntil) return false;
    this.cleanWindow(keyState);
    return keyState.requestsInWindow.length < this.MAX_SAFE_RPM;
  }

  /**
   * Returns appropriate model name for a specific key
   */
  getBestModelForKey(keyIndex, purpose = 'text') {
    if (purpose === 'tts') {
      return 'gemini-3.8-flash-lite-tts';
    }
    if (purpose === 'vision') {
      // gemini-3.5-flash verified working for Vision on all keys 1..4
      return 'gemini-3.5-flash';
    }
    // Text: Key 1 has gemini-2.5-flash and 3.5-flash; Keys 2-4 use 3.5-flash or 3.1-flash-lite
    if (keyIndex === 1) return 'gemini-2.5-flash';
    if (keyIndex === 4) return 'gemini-3.1-flash-lite-preview';
    return 'gemini-3.5-flash';
  }

  /**
   * Selects the healthiest key using Least-Recently-Used & Lowest Current RPM
   */
  getBestKey() {
    const now = Date.now();
    const available = this.keys.filter((k) => this.isKeyReady(k));

    if (available.length === 0) {
      // Find key that exits cooldown earliest
      const sortedByCooldown = [...this.keys].sort((a, b) => a.cooldownUntil - b.cooldownUntil);
      return sortedByCooldown[0] || this.keys[0];
    }

    // Sort by lowest current RPM usage in window, then oldest lastUsed
    available.sort((a, b) => {
      this.cleanWindow(a);
      this.cleanWindow(b);
      if (a.requestsInWindow.length !== b.requestsInWindow.length) {
        return a.requestsInWindow.length - b.requestsInWindow.length;
      }
      return a.lastUsed - b.lastUsed;
    });

    return available[0];
  }

  /**
   * Returns all keys that currently have RPM capacity for anti-burst parallel racing
   */
  getAvailableKeysForRace() {
    return this.keys.filter((k) => this.isKeyReady(k));
  }

  recordRequest(keyIndex) {
    const k = this.keys.find((item) => item.index === keyIndex);
    if (!k) return;
    const now = Date.now();
    k.lastUsed = now;
    k.requestsInWindow.push(now);
    k.totalSuccess++;
  }

  penalizeKey(keyIndex, reason = '429 Rate Limit') {
    const k = this.keys.find((item) => item.index === keyIndex);
    if (!k) return;
    const now = Date.now();
    k.cooldownUntil = now + 60000; // 60-second cooldown penalty
    k.total429++;
    console.warn(`      ⚠️ [RPM Governor] Key ${keyIndex} terkena limit (${reason}). Diistirahatkan selama 60 detik.`);
  }

  /**
   * Executes a task using the best available key with automatic 429 retry
   */
  async executeWithGovernor(taskName, taskFn) {
    let lastErr = null;
    const attemptedKeys = new Set();

    for (let attempt = 0; attempt < this.keys.length; attempt++) {
      const best = this.getBestKey();
      if (attemptedKeys.has(best.index)) {
        // Find next untried key
        const untried = this.keys.find((k) => !attemptedKeys.has(k.index));
        if (!untried) break;
      }

      attemptedKeys.add(best.index);
      const ai = new GoogleGenAI({ apiKey: best.key });

      try {
        this.recordRequest(best.index);
        const result = await taskFn(ai, best.key, best.index);
        return result;
      } catch (err) {
        const msg = err.message || '';
        const isRateLimit =
          msg.includes('429') ||
          msg.includes('RESOURCE_EXHAUSTED') ||
          msg.includes('Quota exceeded') ||
          msg.includes('rate limit');

        if (isRateLimit) {
          this.penalizeKey(best.index, '429 Too Many Requests');
        } else {
          console.warn(`      [Failover ${taskName}] Key ${best.index} kendala: ${msg.slice(0, 70)}. Mencoba key lain...`);
        }
        lastErr = err;
      }
    }

    throw new Error(`Semua ${this.keys.length} Gemini Keys sibuk atau terkena limit RPM. Error: ${lastErr?.message}`);
  }

  /**
   * Diagnostic RPM status string
   */
  getStatusString() {
    const now = Date.now();
    return this.keys
      .map((k) => {
        this.cleanWindow(k);
        const isCool = now < k.cooldownUntil;
        const remaining = isCool ? Math.round((k.cooldownUntil - now) / 1000) : 0;
        return `[Key ${k.index}: ${k.requestsInWindow.length}/${this.MAX_SAFE_RPM} RPM ${isCool ? `⏳${remaining}s` : '🟢'}]`;
      })
      .join(' ');
  }
}

export const rpmGovernor = new GeminiRpmGovernor(RAW_KEYS);
