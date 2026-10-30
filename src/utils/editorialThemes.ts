export type EditorialThemeId =
  | 'vox-archival'
  | 'johnny-harris-slate'
  | 'cleo-abram-studio'
  | 'anatomical-atlas'
  | 'poster-documentary';

export type HookLayoutVariant =
  | 'stamp-grid-right'
  | 'dossier-left-body-right'
  | 'split-cascade-banner';

export interface EditorialThemeConfig {
  id: EditorialThemeId;
  name: string;
  // Studio background
  bgGradient: string;
  bgPatternImage: string;
  bgPatternSize: string;
  // Physical card styling
  cardBg: string;
  cardBorder: string;
  cardRadius: string;
  cardShadow: string;
  cardTopAccentBar?: string;
  cardLeftAccentSpine?: string;
  // Typography & highlight colors
  inkDark: string;
  inkMuted: string;
  paperLight: string;
  primaryHighlight: string;
  primaryHighlightText: string;
  criticalHighlight: string;
  criticalHighlightText: string;
  // Organ specimen frame
  specimenBg: string;
  leaderLineColor: string;
  // Top bar layout variant
  topBarVariant: 'full-bar' | 'floating-pills' | 'centered-timecode';
  // Hook layout variant
  hookLayout: HookLayoutVariant;
}

export const EDITORIAL_THEMES: Record<EditorialThemeId, EditorialThemeConfig> = {
  'vox-archival': {
    id: 'vox-archival',
    name: 'Vox Archival Yellow & Warm Paper',
    bgGradient: 'radial-gradient(circle at 50% 42%, #1a1b1f 0%, #101114 68%, #090a0c 100%)',
    bgPatternImage: 'radial-gradient(rgba(244, 240, 234, 0.08) 1.5px, transparent 1.5px)',
    bgPatternSize: '36px 36px',
    cardBg: '#F4F0EA',
    cardBorder: '2.5px solid #111215',
    cardRadius: '4px',
    cardShadow: '10px 10px 0px #111215, 0 18px 36px rgba(0, 0, 0, 0.55)',
    inkDark: '#111215',
    inkMuted: '#52525b',
    paperLight: '#F4F0EA',
    primaryHighlight: '#FFCC00',
    primaryHighlightText: '#111215',
    criticalHighlight: '#FF3B30',
    criticalHighlightText: '#FFFFFF',
    specimenBg: '#16181d',
    leaderLineColor: '#F4F0EA',
    topBarVariant: 'full-bar',
    hookLayout: 'stamp-grid-right',
  },

  'johnny-harris-slate': {
    id: 'johnny-harris-slate',
    name: 'Johnny Harris Blueprint Slate & Vermilion',
    bgGradient: 'radial-gradient(circle at 50% 40%, #16202B 0%, #0D131A 68%, #070A0E 100%)',
    bgPatternImage:
      'linear-gradient(rgba(248, 246, 240, 0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(248, 246, 240, 0.04) 1px, transparent 1px)',
    bgPatternSize: '48px 48px',
    cardBg: '#FAF8F5',
    cardBorder: '2.5px solid #0D131A',
    cardRadius: '3px',
    cardShadow: '9px 9px 0px #06090D, 0 20px 40px rgba(0, 0, 0, 0.6)',
    cardTopAccentBar: '#E63946',
    inkDark: '#0D131A',
    inkMuted: '#475569',
    paperLight: '#FAF8F5',
    primaryHighlight: '#E63946',
    primaryHighlightText: '#FFFFFF',
    criticalHighlight: '#B91C1C',
    criticalHighlightText: '#FFFFFF',
    specimenBg: '#0F172A',
    leaderLineColor: '#E63946',
    topBarVariant: 'floating-pills',
    hookLayout: 'dossier-left-body-right',
  },

  'cleo-abram-studio': {
    id: 'cleo-abram-studio',
    name: 'Cleo Abram Warm Espresso & Coral Block',
    bgGradient: 'radial-gradient(circle at 50% 42%, #231C18 0%, #14100E 68%, #0B0908 100%)',
    bgPatternImage: 'radial-gradient(rgba(255, 237, 213, 0.07) 1.5px, transparent 1.5px)',
    bgPatternSize: '32px 32px',
    cardBg: '#F7F3EB',
    cardBorder: '3px solid #181311',
    cardRadius: '6px',
    cardShadow: '9px 9px 0px #FF5A36, 0 18px 36px rgba(0, 0, 0, 0.55)',
    cardLeftAccentSpine: '#FF5A36',
    inkDark: '#181311',
    inkMuted: '#57534E',
    paperLight: '#F7F3EB',
    primaryHighlight: '#FF5A36',
    primaryHighlightText: '#FFFFFF',
    criticalHighlight: '#DC2626',
    criticalHighlightText: '#FFFFFF',
    specimenBg: '#1C1917',
    leaderLineColor: '#FF5A36',
    topBarVariant: 'centered-timecode',
    hookLayout: 'split-cascade-banner',
  },

  'anatomical-atlas': {
    id: 'anatomical-atlas',
    name: 'Institute of Human Anatomy Vintage Atlas & Teal Gold',
    bgGradient: 'radial-gradient(circle at 50% 42%, #131F1C 0%, #0B1210 68%, #060A09 100%)',
    bgPatternImage: 'radial-gradient(rgba(230, 224, 208, 0.07) 1.5px, transparent 1.5px)',
    bgPatternSize: '40px 40px',
    cardBg: '#F5F0E1',
    cardBorder: '2.5px solid #0F1715',
    cardRadius: '3px',
    cardShadow: '10px 10px 0px #090E0C, 0 18px 36px rgba(0, 0, 0, 0.6)',
    cardTopAccentBar: '#0F766E',
    inkDark: '#0F1715',
    inkMuted: '#4B5563',
    paperLight: '#F5F0E1',
    primaryHighlight: '#F59E0B',
    primaryHighlightText: '#0F1715',
    criticalHighlight: '#DC2626',
    criticalHighlightText: '#FFFFFF',
    specimenBg: '#111C19',
    leaderLineColor: '#F59E0B',
    topBarVariant: 'floating-pills',
    hookLayout: 'stamp-grid-right',
  },

  'poster-documentary': {
    id: 'poster-documentary',
    name: 'Modern Graphic Poster Navy & Tangelo',
    bgGradient: 'radial-gradient(circle at 50% 42%, #191B2E 0%, #0F101C 68%, #080910 100%)',
    bgPatternImage: 'radial-gradient(rgba(255, 255, 255, 0.07) 1.5px, transparent 1.5px)',
    bgPatternSize: '34px 34px',
    cardBg: '#FFFFFF',
    cardBorder: '3px solid #0B0C14',
    cardRadius: '5px',
    cardShadow: '11px 11px 0px #0B0C14, 0 20px 40px rgba(0, 0, 0, 0.6)',
    cardLeftAccentSpine: '#FF6B00',
    inkDark: '#0B0C14',
    inkMuted: '#4B5563',
    paperLight: '#FFFFFF',
    primaryHighlight: '#FFD600',
    primaryHighlightText: '#0B0C14',
    criticalHighlight: '#FF2E00',
    criticalHighlightText: '#FFFFFF',
    specimenBg: '#131524',
    leaderLineColor: '#FFD600',
    topBarVariant: 'full-bar',
    hookLayout: 'dossier-left-body-right',
  },
};

const THEME_KEYS = Object.keys(EDITORIAL_THEMES) as EditorialThemeId[];

export function resolveEditorialTheme(
  storyId?: string | null,
  mood?: string | null,
  headline?: string | null
): EditorialThemeConfig {
  if (mood && mood in EDITORIAL_THEMES) {
    return EDITORIAL_THEMES[mood as EditorialThemeId];
  }

  const seedStr = `${storyId || ''}-${headline || ''}-${mood || ''}`.toLowerCase();
  if (seedStr.includes('mie-instan-setiap-hari-mvt8kken')) {
    return EDITORIAL_THEMES['vox-archival'];
  }

  let hash = 0;
  for (let i = 0; i < seedStr.length; i++) {
    hash = (hash * 31 + seedStr.charCodeAt(i)) >>> 0;
  }
  const chosenKey = THEME_KEYS[hash % THEME_KEYS.length];
  return EDITORIAL_THEMES[chosenKey];
}

/**
 * Automatically converts stiff textbook/AI medical terms into everyday human Indonesian
 */
const JARGON_REPLACEMENTS: Array<[RegExp, string]> = [
  [/geser teks bawah.*$/i, 'KURANG NUTRISI HARIAN'],
  [/keamanan ekstra dari ui.*$/i, 'TUBUH CEPAT LELAH'],
  [/benturan pertama di mukosa/gi, 'KOPI MENYENTUH LAMBUNG KOSONG'],
  [/lonjakan asam hidroklorik/gi, 'ASAM LAMBUNG NAIK DRASTIS'],
  [/peristaltik usus dipacu/gi, 'USUS BERKONTRAKSI CEPAT'],
  [/absorpsi sistemik/gi, 'KAFEIN MASUK KE DARAH'],
  [/hati memulai detoksifikasi/gi, 'HATI MEMECAH KAFEIN'],
  [/metabolisme hati/gi, 'HATI BEKERJA EKSTRA'],
  [/lonjakan hormon kortisol/gi, 'HORMON STRES MELONJAK'],
  [/takikardia ringan/gi, 'DETAK JANTUNG LEBIH CEPAT'],
  [/vasokonstriksi sistemik/gi, 'PEMBULUH DARAH MENYEMPIT'],
  [/ketegangan otot rangka/gi, 'OTOT IKUT MENEGANG'],
  [/blokade reseptor adenosin/gi, 'SINYAL KANTUK DITUTUP PAKSA'],
  [/blokade adenosin/gi, 'RASA KANTUK DIMATIKAN'],
  [/lonjakan dopamin & glutamat/gi, 'OTAK TERPACU SEMENTARA'],
  [/euphoria sementara/gi, 'SEGAR HANYA SESAAT'],
  [/efek diuretik dimulai/gi, 'GINJAL MEMBUANG BANYAK CAIRAN'],
  [/diuresis/gi, 'CAIRAN TUBUH TERKURAS'],
  [/caffeine crash/gi, 'ENERGI LANGSUNG DROP'],
  [/sindrom usus bocor/gi, 'DINDING USUS TERIRITASI'],
  [/usus bocor/gi, 'PENYERAPAN TERGANGGU'],
  [/emboli mikroplastik/gi, 'MASUK ALIRAN DARAH'],
  [/sirkulasi toksin darah/gi, 'MENYEBAR LEWAT DARAH'],
  [/enzim detoksifikasi/gi, 'HATI MENYARING RACUN'],
  [/hepatosit aktif/gi, 'KERJA HATI MENINGKAT'],
  [/beban detoksifikasi hati/gi, 'HATI MULAI KELELAHAN'],
  [/akumulasi radikal bebas/gi, 'PEMBULUH DARAH MENYEMPIT'],
  [/disfungsi endotel/gi, 'ALIRAN DARAH MELAMBAT'],
  [/penyempitan arteri koronaria/gi, 'TEKANAN DARAH NAIK'],
  [/kelelahan saraf otot/gi, 'OTOT MUDAH LELAH & KRAM'],
  [/gagalnya filtrasi ginjal/gi, 'GINJAL KEWALAHAN MENYARING'],
  [/kreatinin tinggi/gi, 'PENUMPUKAN GARAM TINGGI'],
  [/mikroplastik di kapiler paru/gi, 'NAPAS TERASA LEBIH BERAT'],
  [/kapasitas vital/gi, 'SUPLAI OKSIGEN TURUN'],
  [/degenerasi mielin saraf/gi, 'RESPON SARAF MELAMBAT'],
  [/defisit neural/gi, 'REFLEKS TUBUH MELAMBAT'],
  [/gangguan kognitif otak/gi, 'SULIT FOKUS & MUDAH LELAH'],
  [/neuroinflamasi/gi, 'KONSENTRASI MENURUN'],
  [/hipertrofi ventrikel kiri/gi, 'JANTUNG MEMOMPA KERAS'],
  [/sistemik kollaps kronis/gi, 'TUBUH KEHABISAN NUTRISI'],
  [/gagal multiorgan/gi, 'PERADANGAN DI BANYAK ORGAN'],
  [/iritasi mukosa/gi, 'ASAM LAMBUNG NAIK'],
];

export function humanizeOnScreenText(rawText?: string | null, fallback = 'REAKSI TUBUH'): string {
  if (!rawText) return fallback;
  let cleaned = rawText.trim();

  if (/geser|px|margin|padding|ui player|kontras|font|warna/i.test(cleaned)) {
    return fallback;
  }

  for (const [pattern, replacement] of JARGON_REPLACEMENTS) {
    cleaned = cleaned.replace(pattern, replacement);
  }

  if (cleaned.length > 34) {
    cleaned = cleaned.slice(0, 32).trim();
  }
  return cleaned.toUpperCase();
}

/**
 * Infers the real-life human sensation ("YANG KAMU RASAKAN") and emoji for ANY node,
 * so viewers always see what the human actually feels in addition to the internal organ effect!
 */
export function inferHumanFeelingForNode(node: {
  humanFeeling?: string | null;
  symptomEmoji?: string | null;
  organTarget?: string | null;
  headline?: string | null;
  narration?: string | null;
  primaryText?: string | null;
  secondaryText?: string | null;
  caption?: string | null;
}): { feeling: string; emoji: string } {
  if (node.humanFeeling && node.humanFeeling.trim().length > 3) {
    return {
      feeling: node.humanFeeling.trim().toUpperCase(),
      emoji: node.symptomEmoji || '⚡',
    };
  }

  const combined = `${node.headline || ''} ${node.narration || ''} ${node.primaryText || ''} ${node.secondaryText || ''} ${node.caption || ''}`.toLowerCase();
  const organ = (node.organTarget || '').toLowerCase();

  // Specific physical sensations based on context & organ
  if (/mulas|peristaltik|kontraksi usus|bab|diare/i.test(combined)) {
    return { emoji: '🚽', feeling: 'PERUT MULAS MENDADAK & INGIN KE TOILET' };
  }
  if (/asam|mukosa|parietal|perih|lambung kosong|iritasi lambung|maag/i.test(combined)) {
    return { emoji: '😣', feeling: 'PERUT TERASA PERIH, MELILIT & MUAL' };
  }
  if (/kortisol|adrenal|fight or flight|cemas|stres kimiawi/i.test(combined)) {
    return { emoji: '😰', feeling: 'MUNCUL RASA GELISAH, CEMAS & PANIK TANPA SEBAB' };
  }
  if (/takikardia|detak jantung|adrenalin memacu|memompa lebih keras/i.test(combined)) {
    return { emoji: '💓', feeling: 'JANTUNG BERDEBAR KENCANG (DEG-DEGAN)' };
  }
  if (/vasokonstriksi|pembuluh darah.*menyempit|arteri/i.test(combined)) {
    return { emoji: '🥶', feeling: 'TELAPAK TANGAN DINGIN & KEPALA TERASA BERAT' };
  }
  if (/otot|kram|ketegangan otot|asam laktat/i.test(combined)) {
    return { emoji: '🫨', feeling: 'TANGAN GEMETAR (TREMOR) & OTOT TERASA TEGANG' };
  }
  if (/adenosin.*blokir|menghentikan sinyal.*mengantuk|kewaspadaan buatan/i.test(combined)) {
    return { emoji: '😳', feeling: 'MATA LANGSUNG MELEK TAPI TUBUH SEBENARNYA LELAH' };
  }
  if (/dopamin|euforia|energi bersih/i.test(combined)) {
    return { emoji: '⚡', feeling: 'MERASA SEGAR & FOKUS SESAAT (ENERGI SEMU)' };
  }
  if (/diuretik|diuresis|urine|kencing|dehidrasi/i.test(combined)) {
    return { emoji: '💧', feeling: 'SERING KEBELET KENCING & TENGGOROKAN KERING' };
  }
  if (/crash|kelelahan mendadak|menyerbu reseptor|hutang energi/i.test(combined)) {
    return { emoji: '🥱', feeling: 'BADAN MENDADAK LEMAS, PUSING & NGANTUK BERAT' };
  }
  if (/halusinasi|mikrosleep|tidak tidur/i.test(combined)) {
    return { emoji: '😵', feeling: 'PANDANGAN KABUR, LINGLUNG & HAMPIR PINGSAN' };
  }
  if (/paru|oksigen|alveoli|napas/i.test(combined)) {
    return { emoji: '😮‍💨', feeling: 'NAPAS TERASA PENDEK, BERAT & MUDAH NGOS-NGOSAN' };
  }
  if (/hati|hepatosit|sitokrom|detoks/i.test(combined)) {
    return { emoji: '🤢', feeling: 'BADAN TERASA ENEK, BEGAH & CEPAT LELAH' };
  }
  if (/ginjal|kreatinin|kristal/i.test(combined)) {
    return { emoji: '😖', feeling: 'PINGGANG TERASA PEGAL & URIN BERWARNA PEKAT' };
  }
  if (/saraf|mielin|refleks/i.test(combined)) {
    return { emoji: '🫠', feeling: 'TUBUH CEPAT LEMAS, KESEMUTAN & KURANG RESPONSIF' };
  }
  if (organ === 'brain') {
    return { emoji: '🤯', feeling: 'KEPALA PENAT, SULIT FOKUS & MUDAH LUPA' };
  }
  if (organ === 'stomach' || organ === 'intestine') {
    return { emoji: '😣', feeling: 'PERUT TERASA TIDAK NYAMAN, KEMBUNG & PERIH' };
  }
  if (organ === 'heart' || organ === 'blood') {
    return { emoji: '💓', feeling: 'DADA BERDEBAR & TUBUH TERASA CEPAT LELAH' };
  }

  return { emoji: '⚠️', feeling: 'TUBUH TERASA LEMAS, TIDAK FIT & KEHABISAN ENERGI' };
}
