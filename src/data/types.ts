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
  | 'critical-gauge'
  | 'wall-demolition'
  | 'gate-breach'
  | 'domino-collapse'
  | 'press-podium'
  | 'memo-investigation'
  | 'maritime-disaster'
  | 'reactor-meltdown'
  | 'laboratory-discovery'
  | 'clock-countdown'
  | 'key-lockbox'
  | 'car-route'
  | 'radiation-hazard'
  | 'valve-failure'
  | 'telegraph-wire'
  | 'crowd-protest'
  | 'courtroom-gavel'
  | string;

export type ZoomDirection = 'in' | 'out' | 'panRight' | 'panLeft' | 'zoomIn' | 'zoomOut' | string;

export type EditorialMood =
  | 'cold-war-crisis'
  | 'noir-forensic'
  | 'amber-urgent'
  | 'industrial-decay'
  | 'clean-documentary'
  | string;

export interface EditorialStyle {
  mood: EditorialMood;
  tintColor?: string; // Hex or rgba color tint
  grainIntensity?: number; // 0.03 to 0.065 (strictly eye-comfortable)
  vignetteStrength?: number; // 0.2 to 0.5
  lightLeak?: {
    enabled: boolean;
    color?: string;
    position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  };
  shakeSensitivity?: 'subtle' | 'moderate' | 'dramatic' | 'high' | string;
  shakeThresholdChaos?: number; // Chaos level where camera micro-tremor activates (default 65)
}

export interface ButterflyNode {
  step: number;
  timeOrYear: string;
  headline: string;
  narration: string;
  chaosLevel: number; // 0 to 100
  mediaType: 'photo' | 'broll' | 'graphic';
  mediaUrl: string;
  directorType?: DirectorSceneType | string | null;
  searchQuery?: string | null;
  imagePrompt?: string | null;
  zoomDirection?: ZoomDirection;
  primaryText?: string | null;
  secondaryText?: string | null;
  stampText?: string | null;
  quoteText?: string | null;
  metricLabel?: string | null;
  metricValue?: string | null;
  accentColor?: string | null;
  caption: string;
  visualSource?: 'REKA ADEGAN' | 'ARSIP SEJARAH' | 'ILUSTRASI' | string;
  sfxTrigger?: string | null;
  soundEffect?: any;
  soundDesign?: any;
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
  editorialStyle?: EditorialStyle;
  hook: {
    hookStyle?: 'fullscreen-dramatic' | 'forensic-dossier' | 'breaking-transmission' | 'split-contrast' | string | null;
    archetype?: string | null;
    headline?: string | null;
    kicker?: string | null;
    narration: string;
    leftTitle: string;
    rightTitle: string;
    leftBadge?: string | null;
    rightBadge?: string | null;
    leftPrimaryText?: string | null;
    leftStampText?: string | null;
    leftSearchQuery?: string | null;
    rightSearchQuery?: string | null;
    leftImage?: string | null;
    rightImage?: string | null;
    soundEffect?: any;
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
