import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';
import dotenv from 'dotenv';
import { transcribeWithGroq } from './align_groq.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

dotenv.config({ path: path.join(ROOT_DIR, '.env') });

// Clean word helper
function cleanSubtitleWord(rawWord) {
  if (!rawWord) return '';
  return rawWord
    .replace(/[":;?!,()[\]{}…«»“”‘’\\/]/g, '')
    .replace(/\.+/g, '')
    .replace(/^-+|-+$/g, '')
    .trim();
}

function normalizeToken(w) {
  return (w || '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

function partitionClause(words) {
  const chunks = [];
  let i = 0;
  while (i < words.length) {
    const remaining = words.length - i;
    let size = 3;
    if (remaining === 4) {
      size = 2;
    } else if (remaining === 2) {
      size = 2;
    } else if (remaining <= 3) {
      size = remaining;
    }
    chunks.push(words.slice(i, i + size));
    i += size;
  }
  return chunks;
}

function partitionSectionWords(sectionWords) {
  const clauses = [];
  let currentClause = [];

  for (let i = 0; i < sectionWords.length; i++) {
    const w = sectionWords[i];
    currentClause.push(w);

    const hasPunctuation = /[.!?]/.test(w.word);
    const nextWord = sectionWords[i + 1];
    const isBreathPause = nextWord ? (nextWord.start - w.end) >= 0.25 : false;

    if (hasPunctuation || isBreathPause || i === sectionWords.length - 1) {
      clauses.push(currentClause);
      currentClause = [];
    }
  }

  const allChunks = [];
  for (const clause of clauses) {
    if (clause.length > 0) {
      allChunks.push(...partitionClause(clause));
    }
  }
  return allChunks;
}

async function main() {
  console.log('================================================================');
  console.log('     DOCTOR & MEDICAL EXPERT VOICEOVER SYNCHRONIZATION PIPELINE ');
  console.log('================================================================\n');

  // 1. Load Current Story Data
  const rawStory = fs.readFileSync(path.join(ROOT_DIR, 'src', 'data', 'currentStory.ts'), 'utf8');
  const marker = 'CURRENT_STORY: ButterflyStoryData = ';
  const idx = rawStory.indexOf(marker);
  const jsonStr = rawStory.slice(rawStory.indexOf('{', idx), rawStory.lastIndexOf('}') + 1);
  const storyData = JSON.parse(jsonStr);

  console.log(`[1/4] Memperbarui naskah medis dengan persona Dokter Profesional...`);
  console.log(`      Topik: "${storyData.title}"`);

  // 2. Authentic Medical Doctor Script (Zero awkward terms, proper medical physiology)
  storyData.hook.headline = 'APA JADINYA KALAU KAMU MENAHAN KENCING TERLALU LAMA?';
  storyData.hook.narration =
    'Pernahkah kamu... sengaja menunda ke toilet hanya karena tanggung kerjaan? ' +
    'Padahal secara medis, di rongga panggulmu... kandung kemih sedang berjuang menahan tekanan cairan yang sangat ekstrem.';

  const medicalDoctorNarrations = [
    {
      step: 1,
      headline: 'KANDUNG KEMIH MULAI MEREGANG',
      narration: 'Di tahap awal, urine mulai memenuhi rongga kandung kemih, membuat dinding otot elastisnya meregang perlahan tanpa rasa sakit.',
      humanFeeling: 'Mulai terasa ada dorongan kecil untuk buang air kecil, tapi masih sangat bisa ditahan dengan santai.',
    },
    {
      step: 2,
      headline: 'SINYAL PERTAMA KE SISTEM SARAF',
      narration: 'Seiring bertambahnya volume cairan, reseptor regang di dinding kandung kemih mulai mengirimkan sinyal sensorik ke sumsum tulang belakang dan otak.',
      humanFeeling: 'Perut bagian bawah mulai terasa sedikit penuh dan konsentrasi kerja mulai sedikit terganggu.',
    },
    {
      step: 3,
      headline: 'TEKANAN INTERNAL MEMICU MULAS',
      narration: 'Saat volume melewati batas nyaman, tekanan internal mulai mendesak jaringan sekitarnya, memicu rasa mulas dan gelisah yang bikin kamu tidak bisa duduk tenang.',
      humanFeeling: 'Sensasi mulas dan begah semakin kuat di perut bawah, membuat tubuh tidak nyaman berdiam diri di kursi.',
    },
    {
      step: 4,
      headline: 'SALURAN USUS BESAR TERDESAK',
      narration: 'Kandung kemih yang membesar kini mendesak saluran usus besar di belakangnya, menciptakan sensasi kembung dan begah yang makin menyiksa.',
      humanFeeling: 'Perut terasa tertekan dan melilit ringan karena organ panggul saling berdesakan.',
    },
    {
      step: 5,
      headline: 'OTOT SFINGTER PANGGUL MENGUNCI',
      narration: 'Otot sfingter di dasar panggul terpaksa mengunci rapat saluran uretra, bekerja ekstra keras melawan dorongan cairan hingga memicu kram di selangkangan.',
      humanFeeling: 'Otot selangkangan terasa kaku dan kram karena harus terus-menerus menahan kontraksi kemih.',
    },
    {
      step: 6,
      headline: 'SINYAL DARURAT MEMBANJIRI OTAK',
      narration: 'Sinyal bahaya dari panggul kini membanjiri korteks otak, memecah konsentrasi kerjamu dan memicu kecemasan yang terus memuncak.',
      humanFeeling: 'Pikiran kacau, tidak bisa fokus bekerja sama sekali, dan seluruh perhatian tertuju ke toilet terdekat.',
    },
    {
      step: 7,
      headline: 'REFLUKS CAIRAN MENGANCAM GINJAL',
      narration: 'Inilah titik paling berbahaya. Tekanan hidrostatik yang terlampau tinggi mulai menghambat katup ureter, sehingga urine berisiko berbalik arah naik menuju ginjal.',
      humanFeeling: 'Pinggang belakang mulai terasa pegal dan nyeri tumpul akibat tekanan cairan yang tertahan.',
    },
    {
      step: 8,
      headline: 'LONJAKAN ADRENALIN & DETAK JANTUNG',
      narration: 'Rasa sakit dan ketegangan fisik memicu pelepasan hormon adrenalin, membuat detak jantungmu melonjak cepat merespons alarm bahaya tubuh.',
      humanFeeling: 'Dada terasa deg-degan kencang, napas memburu, dan telapak tangan mulai berkeringat dingin.',
    },
    {
      step: 9,
      headline: 'VASOKONSTRIKSI & TEKANAN DARAH',
      narration: 'Lonjakan hormon stres ini juga memicu vasokonstriksi pada pembuluh darah perifer, menyebabkan tekanan darah melonjak naik secara mendadak.',
      humanFeeling: 'Tubuh terasa tegang, kaku, dan rasa gelisah yang semakin tidak tertahankan.',
    },
    {
      step: 10,
      headline: 'SAKIT KEPALA TEGANG BERDENYUT',
      narration: 'Kombinasi antara lonjakan tekanan darah dan ketegangan saraf panggul kini menjalar menjadi sakit kepala tegang yang berdenyut hebat di area pelipis.',
      humanFeeling: 'Kepala berdenyut berat dan pusing karena sistem saraf tubuh berada di ambang batas toleransi.',
    },
    {
      step: 11,
      headline: 'OTOT SFINGTER MENGALAMI KELELAHAN',
      narration: 'Setelah berjam-jam menahan beban, otot sfingter kandung kemih mengalami kelelahan ekstrem, nyaris kehilangan kendali untuk menutup aliran cairan.',
      humanFeeling: 'Otot panggul bergetar gemetar dan muncul sensasi nyaris mengompol setiap kali bergerak sedikit saja.',
    },
    {
      step: 12,
      headline: 'RISIKO INFEKSI & KERUSAKAN NEFRON',
      narration: 'Batas toleransi tubuh akhirnya jebol. Bakteri berkembang biak sangat cepat, memicu risiko infeksi saluran kemih akut hingga kerusakan nefron permanen pada ginjal.',
      humanFeeling: 'Rasa nyeri tajam yang membakar di perut bawah dan tubuh menggigil lemas.',
    },
  ];

  // Apply to nodes
  for (let i = 0; i < storyData.nodes.length && i < medicalDoctorNarrations.length; i++) {
    const med = medicalDoctorNarrations[i];
    storyData.nodes[i].headline = med.headline;
    storyData.nodes[i].narration = med.narration;
    storyData.nodes[i].humanFeeling = med.humanFeeling;
    storyData.nodes[i].timeOrYear = ''; // Clean no "Menit ke-5"
  }

  storyData.outro.narration =
    'Menahan kencing bukan sekadar rasa tidak nyaman sesaat. ' +
    'Jika sering kamu lakukan, tekanan balik ini bisa merusak fungsi penyaringan ginjal dan meregangkan otot kandung kemih secara permanen. ' +
    'Kalau kamu sendiri, berapa jam biasanya paling lama tahan kencing?';
  storyData.outro.question = 'Berapa jam biasanya kamu paling lama menahan kencing saat sibuk?';

  // 3. Assemble Full Spoken Script for Voiceover
  const fullScript = [
    storyData.hook.narration,
    ...storyData.nodes.map((n) => n.narration),
    storyData.outro.narration,
  ].join(' ');

  console.log(`[2/4] Mensintesis narasi suara dokter via Microsoft Ardi Neural TTS (Medical Specialist Tone)...`);
  console.log(`      Total teks: ${fullScript.split(/\s+/).length} kata`);

  const audioDir = path.join(ROOT_DIR, 'public', 'butterfly', 'audio');
  fs.mkdirSync(audioDir, { recursive: true });

  const wavFilename = `${storyData.id}_doctor_voiceover.wav`;
  const wavPath = path.join(audioDir, wavFilename);
  const mp3Path = path.join(audioDir, `${storyData.id}_doctor_voiceover.mp3`);

  // Generate via Python edge_tts script
  const pyScript = `
import asyncio
import edge_tts
import subprocess
import sys

async def run():
    text = sys.stdin.read()
    comm = edge_tts.Communicate(text, 'id-ID-ArdiNeural', rate='-3%', pitch='-1Hz')
    await comm.save(r'${mp3Path}')
    subprocess.run(['ffmpeg', '-y', '-i', r'${mp3Path}', '-ar', '44100', '-ac', '2', r'${wavPath}'], check=True)
    print('SUCCESS')

asyncio.run(run())
`;

  await new Promise((resolve, reject) => {
    const p = spawn('python', ['-c', pyScript], { stdio: ['pipe', 'inherit', 'inherit'] });
    p.stdin.write(fullScript);
    p.stdin.end();
    p.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`Python TTS exited with code ${code}`));
    });
  });

  console.log(`      ✓ Audio suara dokter berhasil disimpan: ${wavPath}`);

  // 4. Align with Groq Whisper Large V3
  console.log(`\n[3/4] Melakukan penyelarasan kata per kata via Groq Cloud LPU (Whisper Large V3)...`);
  const whisperOutput = path.join(audioDir, `${storyData.id}_doctor_whisper.json`);
  const whisperData = await transcribeWithGroq(wavPath, whisperOutput);

  console.log(`      ✓ Durasi total narasi dokter: ${whisperData.totalDurationSec} detik`);
  console.log(`      ✓ Jumlah kata terdeteksi: ${whisperData.allWords.length} kata`);

  // 5. Build Timeline & Synchronized Story
  console.log(`\n[4/4] Membangun timeline sinkron dan kinetic subtitle presisi...`);
  const FPS = 30;
  const allWords = whisperData.allWords || [];
  const totalFrames = Math.round(whisperData.totalDurationSec * FPS);

  const scriptSections = [
    { id: 'hook', text: storyData.hook.narration, target: storyData.hook },
    ...storyData.nodes.map((n) => ({ id: `node_${n.step}`, text: n.narration, target: n })),
    { id: 'outro', text: storyData.outro.narration, target: storyData.outro },
  ];

  let wordIdx = 0;
  const matchedSections = [];

  for (let s = 0; s < scriptSections.length; s++) {
    const currentSec = scriptSections[s];
    const nextSec = scriptSections[s + 1];

    const startWordIdx = wordIdx;
    let endWordIdx = -1;

    if (!nextSec) {
      endWordIdx = allWords.length - 1;
      wordIdx = allWords.length;
    } else {
      const nextStartTokens = nextSec.text.split(/\s+/).map(normalizeToken).filter((t) => t.length > 2).slice(0, 4);
      let foundNextStart = -1;
      for (let i = startWordIdx + 4; i < allWords.length; i++) {
        const wClean = normalizeToken(allWords[i]?.word);
        if (nextStartTokens.length > 0 && (wClean === nextStartTokens[0] || (wClean.startsWith(nextStartTokens[0]) && nextStartTokens[0].length >= 4))) {
          if (nextStartTokens.length >= 2 && i + 1 < allWords.length) {
            const wNext = normalizeToken(allWords[i + 1]?.word);
            if (wNext.includes(nextStartTokens[1]) || nextStartTokens[1].includes(wNext)) {
              foundNextStart = i;
              break;
            }
          } else {
            foundNextStart = i;
            break;
          }
        }
      }

      if (foundNextStart !== -1) {
        endWordIdx = foundNextStart - 1;
        wordIdx = foundNextStart;
      } else {
        const approxWords = currentSec.text.split(/\s+/).length;
        endWordIdx = Math.min(allWords.length - 1, startWordIdx + approxWords - 1);
        wordIdx = endWordIdx + 1;
      }
    }

    const assignedWords = allWords.slice(startWordIdx, endWordIdx + 1);
    matchedSections.push({
      ...currentSec,
      words: assignedWords,
      startSec: assignedWords[0]?.start ?? 0,
      endSec: assignedWords[assignedWords.length - 1]?.end ?? 0,
    });
  }

  // Calculate cuts
  const cutFrames = [0];
  for (let s = 0; s < matchedSections.length - 1; s++) {
    const cur = matchedSections[s];
    const nxt = matchedSections[s + 1];
    const midSec = (cur.endSec + nxt.startSec) / 2;
    const cutF = Math.round(midSec * FPS);
    cutFrames.push(cutF);
  }
  cutFrames.push(totalFrames);

  const MIN_SCENE_FRAMES = 75; // 2.5s minimum
  for (let i = 1; i < cutFrames.length - 1; i++) {
    if (cutFrames[i] - cutFrames[i - 1] < MIN_SCENE_FRAMES) {
      cutFrames[i] = cutFrames[i - 1] + MIN_SCENE_FRAMES;
    }
  }
  if (totalFrames - cutFrames[cutFrames.length - 2] < MIN_SCENE_FRAMES) {
    cutFrames[cutFrames.length - 2] = Math.max(0, totalFrames - MIN_SCENE_FRAMES);
  }

  storyData.hook.durationFrames = cutFrames[1] - cutFrames[0];
  for (let i = 0; i < storyData.nodes.length; i++) {
    const node = storyData.nodes[i];
    const startF = cutFrames[i + 1];
    const endF = cutFrames[i + 2];
    node.startFrame = startF;
    node.durationFrames = endF - startF;
  }
  storyData.outro.durationFrames = cutFrames[cutFrames.length - 1] - cutFrames[cutFrames.length - 2];

  // Subtitle words
  const wordTimestamps = [];
  let pageIndex = 0;

  for (const sec of matchedSections) {
    const chunks = partitionSectionWords(sec.words);
    for (const chunk of chunks) {
      for (const w of chunk) {
        const cleanW = cleanSubtitleWord(w.word);
        if (cleanW) {
          wordTimestamps.push({
            word: cleanW,
            startFrame: Math.round(w.start * FPS),
            endFrame: Math.round(w.end * FPS),
            pageIndex,
          });
        }
      }
      pageIndex++;
    }
  }

  storyData.wordTimestamps = wordTimestamps;
  storyData.audioUrl = `butterfly/audio/${wavFilename}`;
  storyData.totalDurationFrames = totalFrames;

  const currentStoryContent = `// Automatically generated & polished by Medical Doctor AI Pipeline
import { ButterflyStoryData } from './types';
export { cleanSubtitleWord } from '../utils/textUtils';

export const CURRENT_STORY: ButterflyStoryData = ${JSON.stringify(storyData, null, 2)};
`;

  fs.writeFileSync(path.join(ROOT_DIR, 'src', 'data', 'currentStory.ts'), currentStoryContent, 'utf8');
  console.log(`      ✓ Berhasil menyimpan naskah dan sinkronisasi audio dokter ke: src/data/currentStory.ts`);
  console.log(`\n🎉 SELESAI! Voice over dokter medis siap dirender!`);
}

main().catch((err) => {
  console.error('[FATAL ERROR]', err);
  process.exit(1);
});
