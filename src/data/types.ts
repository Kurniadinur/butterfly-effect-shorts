export interface ButterflyNode {
  step: number;
  timeOrYear: string;
  headline: string;
  narration: string;
  chaosLevel: number; // 0 to 100
  mediaType: 'photo' | 'broll' | 'graphic';
  mediaUrl: string;
  caption: string;
  sfxTrigger?: string;
  startFrame: number;
  durationFrames: number;
}

export interface WordTimestamp {
  word: string;
  startFrame: number;
  endFrame: number;
}

export interface ButterflyStoryData {
  id: string;
  title: string;
  hook: {
    archetype: string;
    narration: string;
    leftTitle: string;
    rightTitle: string;
    leftImage: string;
    rightImage: string;
    durationFrames: number;
  };
  nodes: ButterflyNode[];
  outro: {
    narration: string;
    question: string;
    durationFrames: number;
  };
  wordTimestamps: WordTimestamp[];
  audioUrl: string;
  totalDurationFrames: number;
}
