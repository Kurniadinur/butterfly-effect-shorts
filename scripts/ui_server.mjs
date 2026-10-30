import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';
import dotenv from 'dotenv';
import { loadLearningMemory, recordFeedback } from './learning_manager.mjs';
import { rpmGovernor } from './gemini_rpm_governor.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

dotenv.config({ path: path.join(ROOT_DIR, '.env') });

const PORT = process.env.UI_PORT || 3333;

const CREATIVE_PERSPECTIVES = [
  {
    name: '🧬 OTOMATIS: ROTASI 5 GAYA EDITORIAL DOKUMENTER (ANTI-BOSAN)',
    angle: 'Sistem secara otomatis merotasi 5 gaya edit dokumenter manusia (Vox Archival Yellow, Johnny Harris Slate & Vermilion, Cleo Abram Studio Coral, Institute of Human Anatomy Atlas, dan Poster Documentary) serta membedah reaksi organ tubuh manusia secara kronologis dengan bahasa sehari-hari yang natural.',
  },
  {
    name: '📒 GAYA 1: VOX ARCHIVAL (Kertas Krem & Stabilo Kuning)',
    angle: 'Gunakan gaya visual Vox Archival dengan kartu kertas krem hangat, stabilo kuning #FFCC00, dan alur kronologis organ dalam yang tajam.',
  },
  {
    name: '📐 GAYA 2: JOHNNY HARRIS SLATE (Blueprint Gelap & Merah Vermilion)',
    angle: 'Gunakan gaya visual Johnny Harris dengan latar belakang slate arsitektural, kartu tab merah vermilion #E63946, dan tata letak terbalik (karakter 3D di kanan, kartu hitungan di kiri).',
  },
  {
    name: '🔥 GAYA 3: CLEO ABRAM STUDIO (Espresso Hangat & Coral Block)',
    angle: 'Gunakan gaya visual Cleo Abram dengan latar studio espresso hangat, bayangan blok warna coral #FF5A36, dan timecode bar di tengah atas.',
  },
  {
    name: '🌿 GAYA 4: ANATOMICAL ATLAS (Jurnal Medis Klasik & Teal Emas)',
    angle: 'Gunakan gaya visual Institute of Human Anatomy dengan kartu perkamen gading, aksen hijau teal & emas, serta pil informasi mengambang.',
  },
];

// Active generation process tracking
let activeGenProcess = null;
let logSubscribers = [];
let executionLogs = [];

function broadcastLog(data) {
  const line = data.toString();
  executionLogs.push(line);
  if (executionLogs.length > 200) executionLogs.shift();
  for (const res of logSubscribers) {
    res.write(`data: ${JSON.stringify({ log: line })}\n\n`);
  }
}

// Built-in Curated Viral Body Scenario Topics
const CURATED_TOPICS = [
  {
    title: 'Apa yang Terjadi pada Tubuhmu Jika Tidak Tidur Selama 72 Jam',
    category: 'Otak & Saraf Pusat',
  },
  {
    title: 'Apa yang Terjadi pada Tubuhmu Jika Menahan Kencing Terlalu Lama',
    category: 'Ginjal & Ekskresi',
  },
  {
    title: 'Apa yang Terjadi pada Tubuhmu Jika Minum Kopi Saat Perut Kosong Setiap Pagi',
    category: 'Lambung & Hormon',
  },
  {
    title: 'Apa yang Terjadi pada Tubuhmu Jika Berhenti Makan Gula Selama 30 Hari',
    category: 'Metabolisme & Darah',
  },
  {
    title: 'Apa yang Terjadi pada Tubuhmu Jika Hanya Minum Soda Tanpa Air Putih',
    category: 'Ginjal & Jantung',
  },
  {
    title: 'Apa yang Terjadi pada Tubuhmu Jika Makan Makanan Super Pedas Berlebihan',
    category: 'Lambung & Reseptor Saraf',
  },
];

// Helper: Read and parse currentStory.ts
function getLatestJsonInDir(dirPath) {
  try {
    if (!fs.existsSync(dirPath)) return null;
    const files = fs.readdirSync(dirPath).filter((f) => f.endsWith('.json'));
    if (files.length === 0) return null;
    files.sort((a, b) => {
      return fs.statSync(path.join(dirPath, b)).mtimeMs - fs.statSync(path.join(dirPath, a)).mtimeMs;
    });
    return JSON.parse(fs.readFileSync(path.join(dirPath, files[0]), 'utf-8'));
  } catch (e) {
    return null;
  }
}

function getCurrentStory() {
  try {
    const filePath = path.join(ROOT_DIR, 'src', 'data', 'currentStory.ts');
    if (!fs.existsSync(filePath)) return null;
    const content = fs.readFileSync(filePath, 'utf8');
    const marker = 'CURRENT_STORY';
    const markerIdx = content.indexOf(marker);
    if (markerIdx === -1) return null;
    const startIdx = content.indexOf('{', markerIdx);
    const endIdx = content.lastIndexOf('}');
    if (startIdx !== -1 && endIdx !== -1) {
      const jsonStr = content.slice(startIdx, endIdx + 1);
      return JSON.parse(jsonStr);
    }
  } catch (err) {
    console.error('Error reading currentStory:', err.message);
  }
  return null;
}

// Helper: Call AI (Gemini Antigravity primary, Groq fallback) to brainstorm fresh viral "Apa yang Terjadi pada Tubuhmu Jika..." topics
async function brainstormTopicsWithAI() {
  const randomSeed = Math.floor(Math.random() * 100000);
  const promptText = `Hasilkan 6 ide judul konten evergreen viral "Apa yang Terjadi pada Tubuhmu Jika..." (simulasi anatomi & medis tubuh manusia, kebiasaan sehari-hari, makanan/minuman, kondisi ekstrem, atau reaksi organ) yang sangat membuat penasaran penonton Indonesia. Gunakan variasi segar (Seed: ${randomSeed}). Format JSON murni: { "topics": [ { "title": "Apa yang Terjadi pada Tubuhmu Jika ...", "category": "Nama Organ Utama" } ] }`;

  // 1. Primary via Google Gemini (Antigravity High-Credit Engine)
  try {
    const rawResult = await rpmGovernor.executeWithGovernor('Brainstorm Topics', async (ai, key, keyNum) => {
      const model = rpmGovernor.getBestModelForKey(keyNum, 'text');
      const res = await ai.models.generateContent({
        model,
        contents: promptText,
        config: { temperature: 0.95 },
      });
      return res.text;
    });
    let clean = rawResult.replace(/```json/gi, '').replace(/```/g, '').trim();
    const fIdx = clean.indexOf('{');
    const lIdx = clean.lastIndexOf('}');
    if (fIdx !== -1 && lIdx !== -1) {
      const parsed = JSON.parse(clean.slice(fIdx, lIdx + 1));
      if (parsed.topics && Array.isArray(parsed.topics)) {
        const verifiedTopics = parsed.topics.filter((t) => t.title && t.title.length > 10);
        if (verifiedTopics.length >= 3) {
          return verifiedTopics;
        }
      }
    }
  } catch (geminiErr) {
    console.warn('Gemini brainstorm failed, trying Groq fallback:', geminiErr.message);
  }

  // 2. Fallback to Groq LPU only if needed
  const apiKey = process.env.GROQ_API_KEY;
  if (apiKey) {
    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'qwen/qwen3.8-27b',
          messages: [
            {
              role: 'system',
              content: 'You are a viral Medical & Human Body Science Shorts Producer (Zack D. Films style). Return pure valid JSON with an array named "topics".',
            },
            {
              role: 'user',
              content: promptText,
            },
          ],
          response_format: { type: 'json_object' },
          temperature: 0.95,
        }),
      });
      const data = await res.json();
      const content = data.choices?.[0]?.message?.content;
      if (content) {
        const parsed = JSON.parse(content);
        if (parsed.topics && Array.isArray(parsed.topics)) {
          const verifiedTopics = parsed.topics.filter((t) => t.title && t.title.length > 10);
          if (verifiedTopics.length >= 3) {
            return verifiedTopics;
          }
        }
      }
    } catch (err) {
      console.warn('Groq brainstorm failed, falling back to curated list:', err.message);
    }
  }
  return CURATED_TOPICS;
}

// Create HTTP Server
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // 1. Serve UI Homepage
  if (pathname === '/' || pathname === '/index.html') {
    const htmlPath = path.join(ROOT_DIR, 'public', 'ui', 'index.html');
    if (fs.existsSync(htmlPath)) {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      fs.createReadStream(htmlPath).pipe(res);
      return;
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('UI file not found');
      return;
    }
  }

  // 2. API: Current Story Data
  if (pathname === '/api/story') {
    const story = getCurrentStory();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(story || { error: 'Belum ada cerita yang aktif' }));
    return;
  }

  // 3. API: Creative Perspectives List
  if (pathname === '/api/perspectives') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(CREATIVE_PERSPECTIVES));
    return;
  }

  // 4. API: Brainstorm Topics (AI or Curated)
  if (pathname === '/api/brainstorm') {
    const topics = await brainstormTopicsWithAI();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(topics));
    return;
  }

  // 4b. API: Get Autonomous Learning Memory
  if (pathname === '/api/memory') {
    const memory = loadLearningMemory();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(memory));
    return;
  }

  // 4d. API: Get Latest AI Visual QA Report
  if (pathname === '/api/qa-report') {
    const report = getLatestJsonInDir(path.join(ROOT_DIR, 'out', 'qa_audit'));
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(report || { status: 'NO_REPORT_YET', score: null }));
    return;
  }

  // 4e. API: Get Latest Viral Publishing Pack
  if (pathname === '/api/publishing-pack') {
    const pack = getLatestJsonInDir(path.join(ROOT_DIR, 'out', 'publishing_pack'));
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(pack || { status: 'NO_PACK_YET' }));
    return;
  }

  // 4f. API: Get Live Gemini RPM Status
  if (pathname === '/api/rpm-status') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      statusString: rpmGovernor.getStatusString(),
      keys: rpmGovernor.keys.map((k) => {
        rpmGovernor.cleanWindow(k);
        const now = Date.now();
        return {
          index: k.index,
          currentRpm: k.requestsInWindow.length,
          maxSafeRpm: rpmGovernor.MAX_SAFE_RPM,
          isCoolingDown: now < k.cooldownUntil,
          cooldownRemainingSec: Math.max(0, Math.round((k.cooldownUntil - now) / 1000)),
          totalSuccess: k.totalSuccess,
          total429: k.total429,
        };
      }),
    }));
    return;
  }

  // 4c. API: Submit User Feedback / Learning Instruction
  if (pathname === '/api/feedback' && req.method === 'POST') {
    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', () => {
      try {
        const payload = JSON.parse(body);
        const storyData = getCurrentStory();
        const updated = recordFeedback({
          storyId: payload.storyId || storyData?.id,
          title: payload.title || storyData?.title,
          rating: payload.rating,
          note: payload.note,
          storyData,
        });
        broadcastLog(
          `\n[AI MEMORY] Evaluasi diterima (${payload.rating.toUpperCase()}): "${payload.note || 'Tersimpan'}". Memori pembelajaran diperbarui!\n`
        );
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, updatedMemory: updated }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  // 5. API: Server-Sent Events (SSE) Live Log Stream
  if (pathname === '/api/stream-logs') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    });
    // Send history
    for (const line of executionLogs) {
      res.write(`data: ${JSON.stringify({ log: line })}\n\n`);
    }
    logSubscribers.push(res);
    req.on('close', () => {
      logSubscribers = logSubscribers.filter((s) => s !== res);
    });
    return;
  }

  // 6. API: Start AI Director Story Production
  if (pathname === '/api/generate' && req.method === 'POST') {
    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', () => {
      let params = {};
      try {
        params = JSON.parse(body);
      } catch (e) {
        params = {};
      }

      const topic = params.topic || 'Apa yang Terjadi pada Tubuhmu Jika Tidak Tidur Selama 72 Jam';
      const perspective = params.perspective !== undefined ? String(params.perspective) : '';

      if (activeGenProcess) {
        res.writeHead(409, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Produksi cerita lain sedang berjalan!' }));
        return;
      }

      executionLogs = [];
      broadcastLog(`[UI STUDIO] Memulai produksi naskah baru: "${topic}"...\n`);

      const args = [path.join(ROOT_DIR, 'scripts', 'ai_director_pipeline.mjs'), topic];
      if (perspective !== '') args.push(perspective);

      activeGenProcess = spawn('node', args, { cwd: ROOT_DIR });

      activeGenProcess.stdout.on('data', (data) => broadcastLog(data));
      activeGenProcess.stderr.on('data', (data) => broadcastLog(data));

      activeGenProcess.on('close', (code) => {
        broadcastLog(`\n[UI STUDIO] Proses selesai dengan kode keluar: ${code}\n`);
        activeGenProcess = null;
      });

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'started', topic }));
    });
    return;
  }

  // 7. API: Trigger Cloud Render in GitHub Actions
  if ((pathname === '/api/cloud-render' || pathname === '/api/trigger-cloud-render') && req.method === 'POST') {
    broadcastLog('[CLOUD] Mengirim pembaruan kode dan memicu GitHub Actions Cloud Render...\n');

    // Run git add & commit & push & gh workflow run
    const cmd = spawn('powershell.exe', [
      '-NoProfile',
      '-Command',
      'git add .; git commit -m "Trigger render from Web UI" --allow-empty; git push origin main; gh workflow run render.yml',
    ], { cwd: ROOT_DIR });

    cmd.stdout.on('data', (d) => broadcastLog(d));
    cmd.stderr.on('data', (d) => broadcastLog(d));

    cmd.on('close', (code) => {
      broadcastLog(`[CLOUD] Perintah render cloud selesai (Code: ${code})\n`);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: code === 0 ? 'triggered' : 'failed', code }));
    });
    return;
  }

  // 8. API: Check Cloud Render Status with Step-by-Step Progress
  if (pathname === '/api/cloud-status') {
    const listCmd = spawn('gh', [
      'run',
      'list',
      '--workflow=render.yml',
      '-L',
      '1',
      '--json',
      'databaseId,status,conclusion,url,createdAt,displayTitle',
    ], { cwd: ROOT_DIR });

    let listOut = '';
    listCmd.stdout.on('data', (d) => (listOut += d));
    listCmd.on('close', (code) => {
      try {
        const runs = JSON.parse(listOut);
        if (!runs || runs.length === 0) {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(null));
          return;
        }
        const runId = runs[0].databaseId;

        // Fetch detailed step-by-step progress
        const viewCmd = spawn('gh', [
          'run',
          'view',
          String(runId),
          '--json',
          'databaseId,status,conclusion,url,createdAt,jobs,displayTitle',
        ], { cwd: ROOT_DIR });

        let viewOut = '';
        viewCmd.stdout.on('data', (d) => (viewOut += d));
        viewCmd.on('close', () => {
          try {
            const detail = JSON.parse(viewOut);
            const job = detail.jobs?.[0];
            const steps = job?.steps || [];

            const mainSteps = steps.filter((s) => s.number <= 7);
            const currentStep =
              mainSteps.find((s) => s.status === 'in_progress') ||
              (detail.status === 'completed' ? mainSteps[mainSteps.length - 1] : mainSteps[0]);

            // Calculate elapsed time & dynamic ETA
            const createdMs = detail.createdAt ? new Date(detail.createdAt).getTime() : Date.now();
            const elapsedSec = Math.max(1, Math.round((Date.now() - createdMs) / 1000));
            const TYPICAL_TOTAL_SEC = 105; // ~1m 45s typical GitHub Actions render time
            const stepNum = currentStep?.number || 1;
            const totalStepsCount = Math.max(6, mainSteps.length || 6);

            let progressPct = Math.round(((stepNum - 1) / totalStepsCount) * 85);
            if (detail.status === 'completed') {
              progressPct = 100;
            } else if (stepNum >= 5) {
              // Step 5 is Remotion Render (takes ~60% of the time)
              const stepStartedMs = currentStep?.startedAt ? new Date(currentStep.startedAt).getTime() : Date.now();
              const stepElapsed = Math.max(0, (Date.now() - stepStartedMs) / 1000);
              progressPct = Math.min(96, 55 + Math.round((stepElapsed / 65) * 40));
            } else {
              progressPct = Math.min(54, Math.max(8, Math.round((elapsedSec / TYPICAL_TOTAL_SEC) * 80)));
            }

            const estRemainingSec = detail.status === 'completed'
              ? 0
              : Math.max(5, Math.round(TYPICAL_TOTAL_SEC - elapsedSec));

            const responseData = {
              databaseId: detail.databaseId,
              status: detail.status, // 'in_progress', 'completed', 'queued'
              conclusion: detail.conclusion, // 'success', 'failure', ''
              url: detail.url,
              displayTitle: detail.displayTitle,
              createdAt: detail.createdAt,
              elapsedSec,
              estRemainingSec,
              progressPct,
              currentStepName: currentStep?.name || 'Menyiapkan runner cloud...',
              currentStepNumber: stepNum,
              totalSteps: totalStepsCount,
              steps: mainSteps.map((s) => {
                const sStart = s.startedAt ? new Date(s.startedAt).getTime() : null;
                const sEnd = s.completedAt ? new Date(s.completedAt).getTime() : (s.status === 'in_progress' ? Date.now() : null);
                const durationSec = sStart && sEnd ? Math.max(1, Math.round((sEnd - sStart) / 1000)) : null;
                return {
                  number: s.number,
                  name: s.name,
                  status: s.status, // 'completed', 'in_progress', 'pending'
                  conclusion: s.conclusion, // 'success', 'failure', null
                  durationSec,
                };
              }),
            };

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(responseData));
          } catch (e) {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(runs[0]));
          }
        });
      } catch (err) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  // 9. API: Download Video MP4 from Cloud
  if (pathname === '/api/download-artifact' && req.method === 'POST') {
    broadcastLog('[DOWNLOAD] Mengunduh hasil render MP4 dari GitHub Actions ke folder out/...\n');
    const targetFile = path.join(ROOT_DIR, 'out', 'butterfly_effect_shorts.mp4');
    if (fs.existsSync(targetFile)) {
      try {
        fs.unlinkSync(targetFile);
      } catch (e) {
        broadcastLog(`[WARN] Gagal menghapus file lama: ${e.message}\n`);
      }
    }
    const cmd = spawn('gh', ['run', 'download', '--name', 'remotion-video', '--dir', 'out/'], {
      cwd: ROOT_DIR,
    });
    cmd.stdout.on('data', (d) => broadcastLog(d));
    cmd.stderr.on('data', (d) => broadcastLog(d));
    cmd.on('close', (code) => {
      broadcastLog(code === 0 ? '🎉 [DOWNLOAD SELESAI] File out/butterfly_effect_shorts.mp4 siap ditonton!\n' : `❌ [DOWNLOAD GAGAL] Kode keluar: ${code}\n`);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: code === 0 ? 'success' : 'failed', code }));
    });
    return;
  }

  // 10. Serve Audio Files
  if (pathname.startsWith('/audio/')) {
    const filename = path.basename(pathname);
    const audioPath = path.join(ROOT_DIR, 'public', 'butterfly', 'audio', filename);
    if (fs.existsSync(audioPath)) {
      res.writeHead(200, { 'Content-Type': 'audio/wav' });
      fs.createReadStream(audioPath).pipe(res);
      return;
    }
  }

  // 11. Serve Media Files & Static Butterfly Assets
  if (pathname.startsWith('/media/') || pathname.startsWith('/butterfly/')) {
    const relPath = pathname.startsWith('/butterfly/')
      ? pathname.slice(1) // 'butterfly/...'
      : path.join('butterfly', 'media', path.basename(pathname));
    const mediaPath = path.join(ROOT_DIR, 'public', relPath);
    if (fs.existsSync(mediaPath) && fs.statSync(mediaPath).isFile()) {
      const ext = path.extname(mediaPath).toLowerCase();
      const mime =
        ext === '.png' ? 'image/png' :
        ext === '.wav' ? 'audio/wav' :
        ext === '.mp4' ? 'video/mp4' : 'image/jpeg';
      res.writeHead(200, { 'Content-Type': mime });
      fs.createReadStream(mediaPath).pipe(res);
      return;
    }
  }

  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not found');
});

server.listen(PORT, () => {
  console.log('================================================================');
  console.log(`🎬 BUTTERFLY EFFECT STUDIO UI SERVER AKTIF`);
  console.log(`URL Dashboard : http://localhost:${PORT}`);
  console.log('================================================================');
});
