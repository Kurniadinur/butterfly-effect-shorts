import fs from 'fs';
import path from 'path';

const THEMATIC_MAP = [
  { keywords: ['otak', 'saraf', 'brain', 'neuron', 'tidur', 'kepala', 'pikiran', 'halusinasi', 'mata'], file: 'medical_brain_xray.jpg' },
  { keywords: ['jantung', 'darah', 'heart', 'blood', 'detak', 'pembuluh', 'nadi', 'paru', 'oksigen', 'lungs'], file: 'medical_heart_xray.jpg' },
  { keywords: ['lambung', 'perut', 'stomach', 'makan', 'kopi', 'asam', 'usus', 'ginjal', 'urin', 'kencing', 'hati', 'liver'], file: 'medical_stomach_xray.jpg' },
];

function selectThematicFallback(promptText) {
  const p = (promptText || '').toLowerCase();
  for (const entry of THEMATIC_MAP) {
    if (entry.keywords.some(k => p.includes(k))) {
      return entry.file;
    }
  }
  return 'medical_body_xray.jpg';
}

function applyThematicFallback(promptText, destPath) {
  const baseDir = path.join(process.cwd(), 'public', 'butterfly', 'media');
  const fallbackFileName = selectThematicFallback(promptText);
  let srcPath = path.join(baseDir, fallbackFileName);
  if (!fs.existsSync(srcPath)) {
    srcPath = path.join(baseDir, 'medical_body_xray.jpg');
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
      source: 'Visual Anatomi 3D Fallback',
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
    .slice(0, 260);

  const fullPrompt = `3D medical anatomical X-ray render, glowing bioluminescent human internal organ visualization, ${cleanPrompt}, Zack D Films style 3D medical illustration, glowing cells and blood vessels, dark clinical background, 9:16 vertical, hyper-detailed ### cartoon, anime, text, watermark, blurry, deformed`;

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
        'Client-Agent': 'body-scanner-shorts:2.0:production'
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
                source: 'AI 3D Medical X-Ray (9:16 Vertikal)',
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
    .slice(0, 260);

  const fullPrompt = `3D medical anatomical X-ray visualization, glowing bioluminescent internal human organ, ${cleanPrompt}, Zack D Films style 3D medical render, glowing cells, dark background, 9:16 vertical`;
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
          source: 'Pollinations 3D Medical X-Ray',
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
 * AI 3D Medical X-Ray & Anatomy Image Generator:
 * Tier 1: AI Horde Stable Diffusion (Vertikal 9:16, 3D Medical X-Ray Render)
 * Tier 2: Pollinations AI 3D Medical Render
 * Tier 3: Guaranteed Thematic Anchor (Zero 404, file fisik selalu ada)
 */
export async function generateAiDocumentaryImage(promptText, destPath, seed = 42) {
  const hordeRes = await generateWithHorde(promptText, destPath);
  if (hordeRes && hordeRes.success) {
    return hordeRes;
  }

  const polliRes = await generateWithPollinations(promptText, destPath, seed);
  if (polliRes && polliRes.success) {
    return polliRes;
  }

  console.log(`      ⚓ [Safety Anchor] Menyalin visual anatomi cadangan ke: ${path.basename(destPath)}`);
  return applyThematicFallback(promptText, destPath);
}

export async function searchAndDownloadImage(query, fallbackQuery, destPath, context = {}) {
  const prompt = context.imagePrompt || context.searchQuery || context.headline || query || fallbackQuery || '3D human anatomy glowing brain and heart X-ray';
  const seed = Math.abs(Array.from(prompt).reduce((acc, char) => acc + char.charCodeAt(0), 0)) % 10000;
  return await generateAiDocumentaryImage(prompt, destPath, seed);
}
