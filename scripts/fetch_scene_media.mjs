import fs from 'fs';
import path from 'path';

/**
 * AI Documentary Scene Image Generator (100% Reka Adegan Sinematik 9:16):
 * Menghasilkan visual reka adegan foto sinematik vertikal (9:16) secara murni menggunakan AI
 * berdasarkan prompt dan naskah adegan. 100% bebas dari scraping arsip web atau foto tidak nyambung.
 */
export async function generateAiDocumentaryImage(promptText, destPath, seed = 42) {
  const cleanPrompt = (promptText || '')
    .replace(/[^\w\s,.-]/gi, ' ')
    .trim()
    .slice(0, 320);

  const fullPrompt = `cinematic historical documentary photograph, 9:16 vertical, ${cleanPrompt}, 35mm film grain, moody dramatic lighting, documentary realism`;
  const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(fullPrompt)}?width=720&height=1280&seed=${seed}`;

  try {
    const dir = path.dirname(destPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const res = await fetch(url, { signal: AbortSignal.timeout(20000) });
    if (res.ok) {
      const buffer = Buffer.from(await res.arrayBuffer());
      if (buffer.length > 5000) {
        fs.writeFileSync(destPath, buffer);
        return {
          success: true,
          title: cleanPrompt.slice(0, 50),
          source: 'AI Reka Adegan Sinematik',
          destPath,
          sizeBytes: buffer.length,
        };
      }
    }
  } catch (err) {
    console.warn(`      ⚠️ [AI Image Gen Timeout] ${err.message}`);
  }
  return { success: false };
}

/**
 * Antarmuka Utama Kurasi Visual:
 * Men-generate reka adegan foto sinematik 100% menggunakan AI Image Generator.
 */
export async function searchAndDownloadImage(query, fallbackQuery, destPath, context = {}) {
  const prompt = context.imagePrompt || context.headline || query || fallbackQuery || 'cinematic documentary scene';
  const seed = Math.abs(Array.from(prompt).reduce((acc, char) => acc + char.charCodeAt(0), 0)) % 10000;
  return await generateAiDocumentaryImage(prompt, destPath, seed);
}
