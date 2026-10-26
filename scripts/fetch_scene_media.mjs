import fs from 'fs';
import path from 'path';

const THEMATIC_MAP = [
  { keywords: ['memo', 'catatan', 'draft', 'dokumen', 'surat', 'kertas', 'tulisan', 'document'], file: 'memo_document.jpg' },
  { keywords: ['press', 'konferensi', 'schabowski', 'podium', 'jurnalis', 'wartawan', 'meja', 'flustered'], file: 'schabowski_flustered.jpg' },
  { keywords: ['tembok', 'wall', 'beton', 'hancur', 'roboh', 'demolition', 'runtuh', 'sledgehammer'], file: 'wall_demolition.jpg' },
  { keywords: ['massa', 'crowd', 'warga', 'rakyat', 'demo', 'berkumpul', 'sorak', 'celebrat'], file: 'crowd_brandenburg.jpg' },
  { keywords: ['gate', 'gerbang', 'checkpoint', 'perbatasan', 'bornholmer', 'penjaga', 'border'], file: 'checkpoint_bornholmer.jpg' }
];

function selectThematicFallback(promptText) {
  const p = (promptText || '').toLowerCase();
  for (const entry of THEMATIC_MAP) {
    if (entry.keywords.some(k => p.includes(k))) {
      return entry.file;
    }
  }
  return 'brandenburg_night.jpg';
}

function applyThematicFallback(promptText, destPath) {
  const baseDir = path.join(process.cwd(), 'public', 'butterfly', 'media');
  const fallbackFileName = selectThematicFallback(promptText);
  let srcPath = path.join(baseDir, fallbackFileName);
  if (!fs.existsSync(srcPath)) {
    srcPath = path.join(baseDir, 'brandenburg_night.jpg');
  }

  const destDir = path.dirname(destPath);
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  if (fs.existsSync(srcPath)) {
    fs.copyFileSync(srcPath, destPath);
    const stat = fs.statSync(destPath);
    return {
      success: true,
      title: (promptText || '').slice(0, 50),
      source: 'Arsip Rekonstruksi Fallback',
      destPath,
      sizeBytes: stat.size,
    };
  }

  return { success: false };
}

async function generateWithHorde(promptText, destPath) {
  const cleanPrompt = (promptText || '')
    .replace(/[^\w\s,.-]/gi, ' ')
    .trim()
    .slice(0, 280);

  const fullPrompt = `${cleanPrompt}, cinematic historical documentary photograph, 9:16 vertical, dramatic noir lighting, 35mm film grain realism ### cartoon, anime, 3d, sketch, watermark, text, low quality`;

  const destDir = path.dirname(destPath);
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  try {
    const postRes = await fetch('https://stablehorde.net/api/v2/generate/async', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': '0000000000',
        'Client-Agent': 'butterfly-shorts:1.0:production'
      },
      body: JSON.stringify({
        prompt: fullPrompt,
        params: {
          width: 512,
          height: 896,
          steps: 20
        }
      }),
      signal: AbortSignal.timeout(8000)
    });

    if (!postRes.ok) return null;
    const postData = await postRes.json();
    const id = postData.id;
    if (!id) return null;

    // Poll status for up to 18 seconds (2s per check)
    const start = Date.now();
    while (Date.now() - start < 18000) {
      await new Promise(r => setTimeout(r, 2000));
      const checkRes = await fetch(`https://stablehorde.net/api/v2/generate/check/${id}`, { signal: AbortSignal.timeout(5000) });
      if (!checkRes.ok) continue;
      const checkData = await checkRes.json();
      if (checkData.done && checkData.finished > 0) {
        const statusRes = await fetch(`https://stablehorde.net/api/v2/generate/status/${id}`, { signal: AbortSignal.timeout(6000) });
        if (!statusRes.ok) break;
        const statusData = await statusRes.json();
        const imgUrl = statusData.generations?.[0]?.img;
        if (imgUrl) {
          const imgRes = await fetch(imgUrl, { signal: AbortSignal.timeout(8000) });
          if (imgRes.ok) {
            const buf = Buffer.from(await imgRes.arrayBuffer());
            if (buf.length > 5000) {
              fs.writeFileSync(destPath, buf);
              return {
                success: true,
                title: cleanPrompt.slice(0, 50),
                source: 'AI Horde Stable Diffusion (9:16 Vertikal)',
                destPath,
                sizeBytes: buf.length
              };
            }
          }
        }
        break;
      }
    }
  } catch (err) {
    // Timeout or network glitch, fall through to secondary
  }
  return null;
}

async function generateWithPollinations(promptText, destPath, seed = 42) {
  const cleanPrompt = (promptText || '')
    .replace(/[^\w\s,.-]/gi, ' ')
    .trim()
    .slice(0, 280);

  const fullPrompt = `cinematic historical documentary photograph, 9:16 vertical, ${cleanPrompt}, 35mm film grain, moody dramatic lighting, documentary realism`;
  const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(fullPrompt)}?width=720&height=1280&seed=${seed}`;

  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (res.ok) {
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.length > 5000) {
        fs.writeFileSync(destPath, buf);
        return {
          success: true,
          title: cleanPrompt.slice(0, 50),
          source: 'Pollinations AI (9:16 Vertikal)',
          destPath,
          sizeBytes: buf.length
        };
      }
    }
  } catch (err) {
    // Timeout or 402, fall through
  }
  return null;
}

/**
 * AI Documentary Scene Image Generator (Multi-Tier Resilient Pipeline):
 * Tier 1: AI Horde Stable Diffusion (Vertikal 9:16, bebas kuota 45s, ~3-6 detik)
 * Tier 2: Pollinations AI Image (Vertikal 9:16)
 * Tier 3: Guaranteed Thematic Historical Anchor (Zero 404, file disk selalu ada)
 */
export async function generateAiDocumentaryImage(promptText, destPath, seed = 42) {
  // Tier 1: Coba AI Horde
  const hordeRes = await generateWithHorde(promptText, destPath);
  if (hordeRes && hordeRes.success) {
    return hordeRes;
  }

  // Tier 2: Coba Pollinations AI
  const polliRes = await generateWithPollinations(promptText, destPath, seed);
  if (polliRes && polliRes.success) {
    return polliRes;
  }

  // Tier 3: Guaranteed Safe Anchor (Menjamin file fisik selalu tercipta dan tidak pernah 404)
  console.log(`      ⚓ [Safety Anchor] Menyalin reka visual tematik ke: ${path.basename(destPath)}`);
  return applyThematicFallback(promptText, destPath);
}

/**
 * Antarmuka Utama Kurasi Visual:
 * Menghasilkan visual reka adegan sinematik dengan jaminan 100% file fisik selalu tercipta di disk.
 */
export async function searchAndDownloadImage(query, fallbackQuery, destPath, context = {}) {
  const prompt = context.imagePrompt || context.headline || query || fallbackQuery || 'cinematic documentary scene';
  const seed = Math.abs(Array.from(prompt).reduce((acc, char) => acc + char.charCodeAt(0), 0)) % 10000;
  return await generateAiDocumentaryImage(prompt, destPath, seed);
}
