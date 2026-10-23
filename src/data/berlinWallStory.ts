import { ButterflyStoryData, WordTimestamp } from './types';

function generateWordTimestamps(
  scriptSegments: { text: string; startFrame: number; endFrame: number }[]
): WordTimestamp[] {
  const result: WordTimestamp[] = [];

  for (const seg of scriptSegments) {
    const words = seg.text.trim().split(/\s+/);
    const totalFrames = seg.endFrame - seg.startFrame;
    const framesPerWord = totalFrames / words.length;

    words.forEach((word, idx) => {
      const start = Math.floor(seg.startFrame + idx * framesPerWord);
      const end = Math.floor(seg.startFrame + (idx + 1) * framesPerWord);
      result.push({
        word,
        startFrame: start,
        endFrame: end,
      });
    });
  }

  return result;
}

const segments = [
  {
    text: 'Kalian bayangin... dari salah baca selembar memo, sebuah negara adidaya runtuh dalam semalam?',
    startFrame: 0,
    endFrame: 222,
  },
  {
    text: 'Tahun 1989, juru bicara Jerman Timur Günter Schabowski kelelahan dan disodorkan memo aturan imigrasi tanpa sempat dibaca.',
    startFrame: 222,
    endFrame: 555,
  },
  {
    text: "Di siaran langsung televisi, saat ditanya kapan aturan berlaku, dia panik dan menjawab asal: 'Detik ini juga.'",
    startFrame: 555,
    endFrame: 819,
  },
  {
    text: 'Hanya dalam hitungan menit, berita menyebar liar! Puluhan ribu warga langsung mengepung gerbang Tembok Berlin, sementara tentara bingung tanpa instruksi atasan.',
    startFrame: 819,
    endFrame: 1179,
  },
  {
    text: 'Kalah jumlah dan takut pertumpahan darah, gerbang akhirnya dibuka. Malam itu, Tembok Berlin tumbang, dan Uni Soviet bubar selamanya!',
    startFrame: 1179,
    endFrame: 1521,
  },
  {
    text: 'Cuma gara-gara salah satu kata. Menurutmu, apa keputusan sepelemu hari ini yang bakal ngerubah hidupmu 5 tahun lagi?',
    startFrame: 1521,
    endFrame: 1820,
  },
];

export const BERLIN_WALL_STORY: ButterflyStoryData = {
  id: 'berlin-wall-1989',
  title: 'Salah Baca Memo Pemicu Tumbangnya Tembok Berlin',
  hook: {
    archetype: 'The Chilling Paradox',
    narration:
      'Kalian bayangin... dari salah baca selembar memo, sebuah negara adidaya runtuh dalam semalam?',
    leftTitle: 'Memo Salah Baca',
    rightTitle: 'Uni Soviet Bubar',
    leftImage: 'butterfly/media/schabowski_press.jpg',
    rightImage: 'butterfly/media/berlin_wall_demolition.jpg',
    durationFrames: 222,
  },
  nodes: [
    {
      step: 1,
      timeOrYear: '1989 | 18:53',
      headline: 'MEMO TANPA DIBACA',
      narration:
        'Tahun 1989, juru bicara Günter Schabowski kelelahan dan disodorkan memo aturan imigrasi tanpa sempat dibaca.',
      chaosLevel: 25,
      mediaType: 'photo',
      mediaUrl: 'butterfly/media/schabowski_press.jpg',
      caption: 'Günter Schabowski memegang dokumen sesaat sebelum konferensi pers.',
      startFrame: 222,
      durationFrames: 333,
    },
    {
      step: 2,
      timeOrYear: '1989 | 18:57',
      headline: 'JAWABAN ASAL DI SIARAN TV',
      narration:
        "Di siaran langsung, saat ditanya kapan aturan berlaku, dia panik dan menjawab asal: 'Detik ini juga.'",
      chaosLevel: 55,
      mediaType: 'photo',
      mediaUrl: 'butterfly/media/checkpoint_gate.jpg',
      caption: 'Jawaban spontan yang tidak pernah direncanakan pemerintah.',
      startFrame: 555,
      durationFrames: 264,
    },
    {
      step: 3,
      timeOrYear: '1989 | 21:00',
      headline: 'PULUHAN RIBU WARGA MENGEPUNG',
      narration:
        'Berita menyebar liar! Puluhan ribu warga langsung mengepung gerbang Tembok Berlin, sementara tentara bingung tanpa perintah.',
      chaosLevel: 80,
      mediaType: 'photo',
      mediaUrl: 'butterfly/media/berlin_crowd.jpg',
      caption: 'Massa memadati pos perbatasan Bornholmer Straße.',
      startFrame: 819,
      durationFrames: 360,
    },
    {
      step: 4,
      timeOrYear: '1989 | 23:30',
      headline: 'TEMBOK BERLIN RUNTUH',
      narration:
        'Kalah jumlah, gerbang akhirnya dibuka. Malam itu Tembok Berlin tumbang, dan Uni Soviet bubar selamanya!',
      chaosLevel: 100,
      mediaType: 'photo',
      mediaUrl: 'butterfly/media/berlin_wall_demolition.jpg',
      caption: 'Warga merayakan bersatunya Jerman setelah puluhan tahun terpisah.',
      startFrame: 1179,
      durationFrames: 342,
    },
  ],
  outro: {
    narration:
      'Menurutmu, apa keputusan sepelemu hari ini yang bakal ngerubah hidupmu 5 tahun lagi?',
    question:
      'Apa keputusan sepelemu hari ini yang kira-kira bakal ngerubah hidupmu 5 tahun lagi?',
    durationFrames: 300,
  },
  wordTimestamps: generateWordTimestamps(segments),
  audioUrl: 'butterfly/audio/berlin_wall_voiceover.mp3',
  totalDurationFrames: 1825, // ~60.8 seconds @ 30 FPS
};
