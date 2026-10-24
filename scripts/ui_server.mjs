import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';
import dotenv from 'dotenv';
import { loadLearningMemory, recordFeedback } from './learning_manager.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

dotenv.config({ path: path.join(ROOT_DIR, '.env') });

const PORT = process.env.UI_PORT || 3333;

const CREATIVE_PERSPECTIVES = [
  {
    name: 'BLUNDER SEPELE & KELALAIAN MANUSIAWI',
    angle: 'Fokuskan alur cerita pada momen kelalaian manusiawi paling awal: benda kecil yang terlupakan, memo terburu-buru, salah belok, atau keputusan sepele dalam hitungan detik yang tanpa disadari memicu rangkaian bencana tak terkendali.',
  },
  {
    name: 'KETEGANGAN LAPANGAN DI TITIK KRITIS',
    angle: 'Fokuskan alur cerita pada kepanikan operator lapangan di garis depan: petugas jaga yang terisolasi, alarm darurat yang berbunyi, komunikasi radio yang terputus, dan detik-detik menegangkan saat mereka menyadari bahaya sudah terlambat dihentikan.',
  },
  {
    name: 'EFEK DOMINO SEBAB-AKIBAT SISTEMIK',
    angle: 'Fokuskan alur cerita pada eskalasi efek domino ekstrem bertahap: bagaimana 1 kesalahan mikro merusak sistem lapis pertama, merembet ke kekacauan lapis kedua, memicu kegagalan total, hingga menghancurkan seluruh struktur peradaban.',
  },
  {
    name: 'BREAKING NEWS & REAKSI KAGET DUNIA',
    angle: 'Fokuskan alur cerita pada ledakan kabar mengejutkan: transmisi darurat, kepanikan publik yang meluas, pers internasional yang menyiarkan bencana secara langsung, dan keterkejutan jutaan manusia saat menyadari sejarah berubah dalam semalam.',
  },
  {
    name: 'INVESTIGASI FORENSIK DOKUMENTER & BUKTI KUNCI',
    angle: 'Fokuskan alur cerita pada rekonstruksi forensik dingin ala Nessie Judge: analisis kronologis jam demi jam, berkas investigasi deklasifikasi, kata-kata terakhir para saksi kunci, dan pengungkapan fakta bahwa tragedi ini bisa dicegah jika satu hal kecil tidak terabaikan.',
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

// Built-in Curated Viral Butterfly Effect Topics
const CURATED_TOPICS = [
  {
    title: 'Runtuhnya Tembok Berlin Karena Salah Baca Memo',
    category: 'Sejarah Dunia',
    trivialCause: 'Juru bicara salah membaca selembar catatan memo tanpa briefing',
    globalCatastrophe: 'Tembok Berlin dijebol warga, Tirai Besi runtuh, dan Uni Soviet bubar dalam 1 malam',
    hookSnippet: '9 November 1989. Satu kesalahan membaca catatan di siaran langsung TV... menghapus negara adidaya dalam 4 jam.',
  },
  {
    title: 'Tenggelamnya Kapal Titanic Karena Kunci Teropong Tertinggal',
    category: 'Maritim & Kelalaian',
    trivialCause: 'Petugas pemegang kunci loker teropong dipindah tugas mendadak dan lupa menyerahkan kuncinya',
    globalCatastrophe: 'Pengawas tak bisa melihat gunung es di malam gelap, Titanic menabrak dan 1.500 jiwa melayang',
    hookSnippet: 'Tidak ada yang menyangka, tenggelamnya kapal termewah di dunia berawal dari kunci loker yang tertinggal di darat.',
  },
  {
    title: 'Meledaknya Reaktor Nuklir Chernobyl Akibat Uji Coba Tengah Malam',
    category: 'Bencana Sains & Nuklir',
    trivialCause: 'Penundaan jadwal uji coba turbin listrik yang dipaksakan saat pergantian shift malam tanpa persiapan',
    globalCatastrophe: 'Reaktor 4 meledak dahsyat, awan radiasi mematikan menyelimuti benua Eropa',
    hookSnippet: 'Sebuah uji coba listrik tengah malam yang dipaksakan... menyulap kota modern berpenduduk 50.000 jiwa jadi zona mati selamanya.',
  },
  {
    title: 'Pecahnya Perang Dunia I Karena Sopir Salah Belok',
    category: 'Perang & Intelijen',
    trivialCause: 'Sopir Putra Mahkota Franz Ferdinand salah mengambil jalan dan mematikan mesin di depan kafe',
    globalCatastrophe: 'Penembak Gavrilo Princip melihat kesempatan emas, memicu Perang Dunia I yang menewaskan 20 juta orang',
    hookSnippet: 'Satu belokan salah di jalan sempit Sarajevo... memicu perang besar yang menewaskan 20 juta manusia.',
  },
  {
    title: 'Penemuan Antibiotik Penisilin Karena Peneliti Lupa Cuci Piring Laboratorium',
    category: 'Penemuan Tidak Sengaja',
    trivialCause: 'Alexander Fleming pergi berlibur dan meninggalkan cawan petri berisi bakteri terbuka dekat jendela',
    globalCatastrophe: 'Jamur Penicillium liar mengkontaminasi cawan, melahirkan antibiotik yang menyelamatkan 200 juta nyawa',
    hookSnippet: 'Meninggalkan cawan laboratorium kotor sebelum berlibur... tidak sengaja melahirkan obat penyelamat 200 juta nyawa.',
  },
  {
    title: 'Kekalahan Napoleon di Pertempuran Waterloo Akibat Sakit Wasir',
    category: 'Tokoh & Sejarah',
    trivialCause: 'Napoleon Bonaparte menderita sakit wasir akut di pagi hari pertempuran',
    globalCatastrophe: 'Terlambat memerintahkan serangan meriam, pasukan koalisi tiba, imperium Prancis tumbang selamanya',
    hookSnippet: 'Rasa sakit fisik sepele di pagi hari... membuat sang kaisar penakluk Eropa kehilangan seluruh kekaisarannya.',
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

// Helper: Call AI (Gemini or Groq) to brainstorm viral topics
async function brainstormTopicsWithAI() {
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
          model: 'openai/gpt-oss-120b',
          messages: [
            {
              role: 'system',
              content: 'You are a viral YouTube Shorts / TikTok Documentary Producer. Generate 6 shocking, high-contrast Butterfly Effect story concepts. Return pure valid JSON with an array named "topics".',
            },
            {
              role: 'user',
              content: 'Hasilkan 6 ide cerita Butterfly Effect (sebab sepele vs akibat bencana/kejadian masif) yang paling viral dan mencengangkan. Format JSON: { "topics": [ { "title": "...", "category": "...", "trivialCause": "...", "globalCatastrophe": "...", "hookSnippet": "..." } ] }',
            },
          ],
          response_format: { type: 'json_object' },
          temperature: 0.9,
        }),
      });
      const data = await res.json();
      const content = data.choices?.[0]?.message?.content;
      if (content) {
        const parsed = JSON.parse(content);
        if (parsed.topics && Array.isArray(parsed.topics)) {
          // AI Causality & Viral Quality Supervisor
          // Filters out generic trivia and keeps only true high-contrast Butterfly Effect stories
          const verifiedTopics = parsed.topics.filter((t) => {
            const hasTitle = t.title && t.title.length > 5;
            const hasCause = t.trivialCause && t.trivialCause.length > 5;
            const hasCatastrophe = t.globalCatastrophe && t.globalCatastrophe.length > 5;
            return hasTitle && (hasCause || hasCatastrophe);
          });
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

      const topic = params.topic || 'Runtuhnya Tembok Berlin Karena Salah Baca Memo';
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
  if (pathname === '/api/cloud-render' && req.method === 'POST') {
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

            // Filter primary pipeline steps (1 to 7)
            const mainSteps = steps.filter((s) => s.number <= 7);
            const currentStep =
              mainSteps.find((s) => s.status === 'in_progress') ||
              (detail.status === 'completed' ? mainSteps[mainSteps.length - 1] : mainSteps[0]);

            const responseData = {
              databaseId: detail.databaseId,
              status: detail.status, // 'in_progress', 'completed', 'queued'
              conclusion: detail.conclusion, // 'success', 'failure', ''
              url: detail.url,
              displayTitle: detail.displayTitle,
              createdAt: detail.createdAt,
              currentStepName: currentStep?.name || 'Menyiapkan runner cloud...',
              currentStepNumber: currentStep?.number || 1,
              totalSteps: mainSteps.length || 7,
              steps: mainSteps.map((s) => ({
                number: s.number,
                name: s.name,
                status: s.status, // 'completed', 'in_progress', 'pending'
                conclusion: s.conclusion, // 'success', 'failure', null
                startedAt: s.startedAt,
                completedAt: s.completedAt,
              })),
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

  // 11. Serve Media Files
  if (pathname.startsWith('/media/')) {
    const filename = path.basename(pathname);
    const mediaPath = path.join(ROOT_DIR, 'public', 'butterfly', 'media', filename);
    if (fs.existsSync(mediaPath)) {
      res.writeHead(200, { 'Content-Type': 'image/jpeg' });
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
