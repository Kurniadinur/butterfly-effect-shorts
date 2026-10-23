import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

function cleanSubtitleWord(rawWord) {
  if (!rawWord) return '';
  return rawWord
    .replace(/[":;?!,()[\]{}…«»“”‘’\\/]/g, '')
    .replace(/\.+/g, '')
    .replace(/^-+|-+$/g, '')
    .trim();
}

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

const groqData = JSON.parse(
  fs.readFileSync(path.join(ROOT_DIR, 'public', 'butterfly', 'audio', 'groq_whisper_timestamps.json'), 'utf8')
);

const FPS = 30;
const allWords = groqData.allWords
  .map((w) => ({
    word: cleanSubtitleWord(w.word),
    startFrame: Math.round(w.start * FPS),
    endFrame: Math.round(w.end * FPS),
  }))
  .filter((w) => w.word.length > 0);

// Ensure chronological order and non-overlapping frames
for (let i = 0; i < allWords.length - 1; i++) {
  if (allWords[i].endFrame < allWords[i].startFrame) {
    allWords[i].endFrame = allWords[i].startFrame + 5;
  }
}

const chunks = partitionIntoChunks(allWords);
let pageIndex = 0;
const wordTimestamps = [];

for (const chunk of chunks) {
  chunk.forEach((w) => {
    wordTimestamps.push({
      ...w,
      pageIndex,
    });
  });
  pageIndex++;
}

console.log(`[Groq Subtitle Builder] Extracted ${wordTimestamps.length} words across ${pageIndex} stationary pages.`);
console.log(`First word: "${wordTimestamps[0].word}" (Frames: ${wordTimestamps[0].startFrame} -> ${wordTimestamps[0].endFrame})`);
console.log(`Last word: "${wordTimestamps[wordTimestamps.length - 1].word}" (Frames: ${wordTimestamps[wordTimestamps.length - 1].startFrame} -> ${wordTimestamps[wordTimestamps.length - 1].endFrame})`);

// Write to syncedWordTimestamps.ts
const tsContent = `// Exact acoustic timestamps from Groq Cloud LPU (Whisper Large V3)
import { WordTimestamp } from './types';

export const SYNCED_WORD_TIMESTAMPS: WordTimestamp[] = ${JSON.stringify(wordTimestamps, null, 2)};
`;

fs.writeFileSync(
  path.join(ROOT_DIR, 'src', 'data', 'syncedWordTimestamps.ts'),
  tsContent
);
console.log('Saved Groq Whisper Large V3 timestamps to src/data/syncedWordTimestamps.ts!');
