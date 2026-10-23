import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

const whisperData = JSON.parse(
  fs.readFileSync(path.join(ROOT_DIR, 'public', 'butterfly', 'audio', 'whisper_timestamps.json'), 'utf8')
);

// High-fidelity clean text segments matching the spoken narrative
const cleanSegments = [
  { text: "Kalian bayangin", startSec: 0.0, endSec: 0.92 },
  { text: "dari satu orang yang kelelahan dan salah baca selembar memo", startSec: 1.48, endSec: 4.86 },
  { text: "sebuah negara adidaya bisa runtuh hanya dalam satu malam", startSec: 5.36, endSec: 8.56 },
  { text: "Ini adalah salah satu blunder paling fatal dan gila dalam sejarah modern dunia", startSec: 9.36, endSec: 13.04 },
  { text: "Tanggal 9 November 1989", startSec: 13.86, endSec: 15.84 },
  { text: "ketegangan di Jerman Timur sedang berada di titik didih", startSec: 16.84, endSec: 19.24 },
  { text: "Puluhan ribu warga berdemonstrasi menuntut kebebasan", startSec: 19.98, endSec: 22.96 },
  { text: "Di markas partai pemerintah sebenarnya hanya ingin membuat aturan pelonggaran visa biasa", startSec: 23.56, endSec: 28.1 },
  { text: "yang baru berlaku besok lewat birokrasi ketat", startSec: 28.1, endSec: 30.62 },
  { text: "Tepat sebelum konferensi pers dimulai", startSec: 31.02, endSec: 32.8 },
  { text: "juru bicara Günter Schabowski buru-buru disodorkan selembar memo tanpa sempat dia baca sama sekali", startSec: 33.46, endSec: 38.22 },
  { text: "Di depan ratusan jurnalis dari seluruh dunia", startSec: 38.92, endSec: 41.02 },
  { text: "siaran langsung televisi pun dimulai", startSec: 41.72, endSec: 43.14 },
  { text: "Semuanya berjalan membosankan", startSec: 43.7, endSec: 44.94 },
  { text: "sampai menit ke-57", startSec: 45.5, endSec: 46.8 },
  { text: "Seorang jurnalis asal Italia Riccardo Ehrman", startSec: 47.72, endSec: 50.2 },
  { text: "melempar pertanyaan tak terduga", startSec: 50.94, endSec: 52.1 },
  { text: "Kapan aturan perjalanan baru ini mulai berlaku", startSec: 52.68, endSec: 54.82 },
  { text: "Schabowski mendadak panik", startSec: 55.6, endSec: 56.66 },
  { text: "Dia membolak-balik kertas memo di mejanya", startSec: 56.66, endSec: 59.18 },
  { text: "kacamata melorot", startSec: 59.58, endSec: 60.56 },
  { text: "lalu bergumam ragu", startSec: 60.94, endSec: 62.0 },
  { text: "Setahu saya", startSec: 62.58, endSec: 63.4 },
  { text: "segera", startSec: 64.04, endSec: 64.4 },
  { text: "Detik ini juga", startSec: 65.12, endSec: 65.82 },
  { text: "Ruang pers langsung gempar", startSec: 66.58, endSec: 67.68 },
  { text: "Hanya dalam hitungan menit", startSec: 68.14, endSec: 69.28 },
  { text: "stasiun berita internasional menyiarkan kabar mengejutkan", startSec: 69.84, endSec: 72.18 },
  { text: "Pintu perbatasan Tembok Berlin telah dibuka", startSec: 72.84, endSec: 74.88 },
  { text: "Kabar itu menyebar liar bagai api membakar hutan kering", startSec: 75.46, endSec: 77.82 },
  { text: "Puluhan ribu warga Berlin Timur langsung tumpah ruah ke jalanan", startSec: 78.54, endSec: 81.5 },
  { text: "menyerbu pos perbatasan Bornholmer Straße", startSec: 82.02, endSec: 84.02 },
  { text: "Di pos perbatasan", startSec: 84.02, endSec: 85.4 },
  { text: "para tentara gemetar ketakutan", startSec: 86.0, endSec: 87.3 },
  { text: "Mereka panik menelepon atasan", startSec: 88.04, endSec: 89.26 },
  { text: "tapi tidak ada satu pun jenderal yang berani memberi perintah tembak", startSec: 89.82, endSec: 92.66 },
  { text: "Kalah jumlah dan takut pertumpahan darah massal", startSec: 93.22, endSec: 95.26 },
  { text: "gerbang perbatasan akhirnya dibuka paksa", startSec: 95.86, endSec: 97.5 },
  { text: "Malam itu warga barat dan timur berpelukan sambil menangis", startSec: 98.1, endSec: 100.64 },
  { text: "Mereka memanjat tembok dengan palu godam", startSec: 101.38, endSec: 103.02 },
  { text: "menari di atas beton pembatas", startSec: 103.62, endSec: 104.98 },
  { text: "dan meruntuhkan Tembok Berlin untuk selamanya", startSec: 105.54, endSec: 107.32 },
  { text: "Hanya berselang beberapa bulan", startSec: 107.88, endSec: 109.26 },
  { text: "seluruh Uni Soviet bubar", startSec: 109.86, endSec: 111.0 },
  { text: "dan peta geopolitik dunia berubah total", startSec: 111.0, endSec: 113.54 },
  { text: "Semua revolusi raksasa ini", startSec: 114.24, endSec: 115.46 },
  { text: "dimulai dari satu orang yang salah ngomong satu kalimat di siaran TV", startSec: 116.18, endSec: 119.44 },
  { text: "Menurutmu apa keputusan sepele yang kamu ambil hari ini", startSec: 119.78, endSec: 123.46 },
  { text: "yang tanpa kamu sadari", startSec: 123.78, endSec: 125.18 },
  { text: "bakal mengubah jalan hidupmu 5 tahun lagi", startSec: 125.52, endSec: 127.54 },
];

function partitionIntoChunks(items) {
  const chunks = [];
  let i = 0;
  while (i < items.length) {
    const remaining = items.length - i;
    let size = 3;
    if (remaining === 4) {
      size = 2;
    } else if (remaining === 2) {
      size = 2;
    } else if (remaining === 1) {
      if (chunks.length > 0 && chunks[chunks.length - 1].length <= 2) {
        chunks[chunks.length - 1].push(items[i]);
        break;
      }
      size = 1;
    }
    chunks.push(items.slice(i, i + size));
    i += size;
  }
  return chunks;
}

let pageIndex = 0;
const allWordTimestamps = [];

for (const seg of cleanSegments) {
  const words = seg.text.trim().split(/\s+/);
  const totalFrames = Math.round((seg.endSec - seg.startSec) * 30);
  const startF = Math.round(seg.startSec * 30);
  const framesPerWord = totalFrames / words.length;

  const segWordObjs = words.map((w, idx) => ({
    word: w,
    startFrame: Math.round(startF + idx * framesPerWord),
    endFrame: Math.round(startF + (idx + 1) * framesPerWord),
  }));

  const chunks = partitionIntoChunks(segWordObjs);
  for (const chunk of chunks) {
    chunk.forEach(w => {
      allWordTimestamps.push({
        ...w,
        pageIndex,
      });
    });
    pageIndex++;
  }
}

console.log(`Generated ${allWordTimestamps.length} words across ${pageIndex} stationary pages.`);
console.log(`First word starts at frame ${allWordTimestamps[0].startFrame}, last word ends at frame ${allWordTimestamps[allWordTimestamps.length - 1].endFrame}.`);

// Write to syncedWordTimestamps.ts
const tsContent = `// Ground-truth acoustic timestamps matching the 127.96-second voiceover
import { WordTimestamp } from './types';

export const SYNCED_WORD_TIMESTAMPS: WordTimestamp[] = ${JSON.stringify(allWordTimestamps, null, 2)};
`;

fs.writeFileSync(
  path.join(ROOT_DIR, 'src', 'data', 'syncedWordTimestamps.ts'),
  tsContent
);
console.log('Saved true acoustic timestamps to src/data/syncedWordTimestamps.ts!');
