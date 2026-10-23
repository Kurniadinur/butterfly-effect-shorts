export type DirectorSceneType =
  | 'bureaucracy-draft'
  | 'memo-handoff'
  | 'press-question'
  | 'schabowski-slip'
  | 'breaking-news'
  | 'panic-phone'
  | 'soviet-collapse'
  | 'forensic-dossier'
  | 'tactical-map'
  | 'breaking-ticker'
  | 'critical-gauge';

export interface ButterflyNode {
  step: number;
  timeOrYear: string;
  headline: string;
  narration: string;
  chaosLevel: number; // 0 to 100
  mediaType: 'photo' | 'broll' | 'graphic';
  mediaUrl: string;
  directorType?: DirectorSceneType | string;
  zoomDirection?: 'in' | 'out' | 'panRight' | 'panLeft';
  primaryText?: string;
  secondaryText?: string;
  stampText?: string;
  quoteText?: string;
  metricLabel?: string;
  metricValue?: string;
  accentColor?: string;
  caption: string;
  sfxTrigger?: string;
  startFrame: number;
  durationFrames: number;
}

export interface WordTimestamp {
  word: string;
  startFrame: number;
  endFrame: number;
  pageIndex?: number;
}

export interface ButterflyStoryData {
  id: string;
  title: string;
  hook: {
    archetype: string;
    narration: string;
    leftTitle: string;
    rightTitle: string;
    leftBadge?: string;
    rightBadge?: string;
    leftPrimaryText?: string;
    leftStampText?: string;
    leftImage?: string;
    rightImage?: string;
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
