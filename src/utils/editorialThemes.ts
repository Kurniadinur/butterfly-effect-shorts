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
    name: 'Gaya A - Cinematic Cyan Neon (Zack D. Films)',
    bgGradient: 'radial-gradient(circle at 50% 42%, #0B1426 0%, #050B14 65%, #020408 100%)',
    bgPatternImage:
      'linear-gradient(rgba(56, 189, 248, 0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(56, 189, 248, 0.04) 1px, transparent 1px)',
    bgPatternSize: '48px 48px',
    cardBg: 'rgba(10, 18, 36, 0.75)',
    cardBorder: '1.5px solid rgba(56, 189, 248, 0.38)',
    cardRadius: '18px',
    cardShadow: '0 16px 40px rgba(0, 0, 0, 0.75), 0 0 24px rgba(56, 189, 248, 0.16)',
    inkDark: '#FFFFFF',
    inkMuted: '#94A3B8',
    paperLight: '#FFFFFF',
    primaryHighlight: '#38BDF8',
    primaryHighlightText: '#FFFFFF',
    criticalHighlight: '#EF4444',
    criticalHighlightText: '#FFFFFF',
    specimenBg: 'rgba(15, 23, 42, 0.8)',
    leaderLineColor: '#38BDF8',
    topBarVariant: 'floating-pills',
    hookLayout: 'dossier-left-body-right',
  },

  'johnny-harris-slate': {
    id: 'johnny-harris-slate',
    name: 'Gaya A - Slate Crimson Alert (Zack D. Films)',
    bgGradient: 'radial-gradient(circle at 50% 40%, #151A28 0%, #090D15 65%, #040508 100%)',
    bgPatternImage:
      'linear-gradient(rgba(239, 68, 68, 0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(239, 68, 68, 0.04) 1px, transparent 1px)',
    bgPatternSize: '48px 48px',
    cardBg: 'rgba(15, 20, 32, 0.78)',
    cardBorder: '1.5px solid rgba(239, 68, 68, 0.45)',
    cardRadius: '18px',
    cardShadow: '0 16px 40px rgba(0, 0, 0, 0.75), 0 0 24px rgba(239, 68, 68, 0.16)',
    inkDark: '#FFFFFF',
    inkMuted: '#94A3B8',
    paperLight: '#FFFFFF',
    primaryHighlight: '#EF4444',
    primaryHighlightText: '#FFFFFF',
    criticalHighlight: '#DC2626',
    criticalHighlightText: '#FFFFFF',
    specimenBg: 'rgba(15, 23, 42, 0.8)',
    leaderLineColor: '#EF4444',
    topBarVariant: 'floating-pills',
    hookLayout: 'dossier-left-body-right',
  },

  'cleo-abram-studio': {
    id: 'cleo-abram-studio',
    name: 'Gaya A - Amber Warning Kinetic (Zack D. Films)',
    bgGradient: 'radial-gradient(circle at 50% 42%, #1E1710 0%, #0E0B08 65%, #050403 100%)',
    bgPatternImage:
      'linear-gradient(rgba(245, 158, 11, 0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(245, 158, 11, 0.04) 1px, transparent 1px)',
    bgPatternSize: '48px 48px',
    cardBg: 'rgba(24, 18, 14, 0.8)',
    cardBorder: '1.5px solid rgba(245, 158, 11, 0.45)',
    cardRadius: '18px',
    cardShadow: '0 16px 40px rgba(0, 0, 0, 0.75), 0 0 24px rgba(245, 158, 11, 0.16)',
    inkDark: '#FFFFFF',
    inkMuted: '#94A3B8',
    paperLight: '#FFFFFF',
    primaryHighlight: '#F59E0B',
    primaryHighlightText: '#FFFFFF',
    criticalHighlight: '#DC2626',
    criticalHighlightText: '#FFFFFF',
    specimenBg: 'rgba(24, 18, 14, 0.8)',
    leaderLineColor: '#F59E0B',
    topBarVariant: 'floating-pills',
    hookLayout: 'dossier-left-body-right',
  },

  'anatomical-atlas': {
    id: 'anatomical-atlas',
    name: 'Gaya A - Emerald Clinical Scanner (Zack D. Films)',
    bgGradient: 'radial-gradient(circle at 50% 42%, #0A1C1A 0%, #040E0D 65%, #020605 100%)',
    bgPatternImage:
      'linear-gradient(rgba(16, 185, 129, 0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(16, 185, 129, 0.04) 1px, transparent 1px)',
    bgPatternSize: '48px 48px',
    cardBg: 'rgba(10, 26, 23, 0.8)',
    cardBorder: '1.5px solid rgba(16, 185, 129, 0.45)',
    cardRadius: '18px',
    cardShadow: '0 16px 40px rgba(0, 0, 0, 0.75), 0 0 24px rgba(16, 185, 129, 0.16)',
    inkDark: '#FFFFFF',
    inkMuted: '#94A3B8',
    paperLight: '#FFFFFF',
    primaryHighlight: '#10B981',
    primaryHighlightText: '#FFFFFF',
    criticalHighlight: '#DC2626',
    criticalHighlightText: '#FFFFFF',
    specimenBg: 'rgba(10, 26, 23, 0.8)',
    leaderLineColor: '#10B981',
    topBarVariant: 'floating-pills',
    hookLayout: 'dossier-left-body-right',
  },

  'poster-documentary': {
    id: 'poster-documentary',
    name: 'Gaya A - Royal Violet Pulse (Zack D. Films)',
    bgGradient: 'radial-gradient(circle at 50% 42%, #181128 0%, #0B0814 65%, #040308 100%)',
    bgPatternImage:
      'linear-gradient(rgba(168, 85, 247, 0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(168, 85, 247, 0.04) 1px, transparent 1px)',
    bgPatternSize: '48px 48px',
    cardBg: 'rgba(20, 14, 34, 0.8)',
    cardBorder: '1.5px solid rgba(168, 85, 247, 0.45)',
    cardRadius: '18px',
    cardShadow: '0 16px 40px rgba(0, 0, 0, 0.75), 0 0 24px rgba(168, 85, 247, 0.16)',
    inkDark: '#FFFFFF',
    inkMuted: '#94A3B8',
    paperLight: '#FFFFFF',
    primaryHighlight: '#A855F7',
    primaryHighlightText: '#FFFFFF',
    criticalHighlight: '#EF4444',
    criticalHighlightText: '#FFFFFF',
    specimenBg: 'rgba(20, 14, 34, 0.8)',
    leaderLineColor: '#A855F7',
    topBarVariant: 'floating-pills',
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
  let rawFeeling = '';
  let emoji = node.symptomEmoji || '⚡';

  if (node.humanFeeling && node.humanFeeling.trim().length > 3) {
    rawFeeling = node.humanFeeling.trim();
  } else {
    const combined = `${node.headline || ''} ${node.narration || ''} ${node.primaryText || ''} ${node.secondaryText || ''} ${node.caption || ''}`.toLowerCase();
    const organ = (node.organTarget || '').toLowerCase();

    if (/mulas|peristaltik|kontraksi usus|bab|diare/i.test(combined)) {
      emoji = '🚽';
      rawFeeling = 'PERUT MULAS & INGIN KE TOILET';
    } else if (/asam|mukosa|parietal|perih|lambung kosong|iritasi lambung|maag/i.test(combined)) {
      emoji = '😣';
      rawFeeling = 'PERUT PERIH & MELILIT';
    } else if (/kortisol|adrenal|fight or flight|cemas|stres kimiawi/i.test(combined)) {
      emoji = '😰';
      rawFeeling = 'GELISAH & CEMAS TANPA SEBAB';
    } else if (/takikardia|detak jantung|adrenalin memacu|memompa lebih keras/i.test(combined)) {
      emoji = '💓';
      rawFeeling = 'JANTUNG BERDEBAR KENCANG';
    } else if (/vasokonstriksi|pembuluh darah.*menyempit|arteri/i.test(combined)) {
      emoji = '🥶';
      rawFeeling = 'TELAPAK DINGIN & KEPALA BERAT';
    } else if (/otot|kram|ketegangan otot|asam laktat/i.test(combined)) {
      emoji = '🫨';
      rawFeeling = 'OTOT TEGANG & KRAM RINGAN';
    } else if (/adenosin.*blokir|menghentikan sinyal.*mengantuk|kewaspadaan buatan/i.test(combined)) {
      emoji = '😳';
      rawFeeling = 'MATA MELEK TAPI TUBUH LELAH';
    } else if (/dopamin|euforia|energi bersih/i.test(combined)) {
      emoji = '⚡';
      rawFeeling = 'SEGAR & FOKUS SESAAT';
    } else if (/diuretik|diuresis|urine|kencing|dehidrasi/i.test(combined)) {
      emoji = '💧';
      rawFeeling = 'MENAHAN KENCING HINGGA GELISAH';
    } else if (/crash|kelelahan mendadak|menyerbu reseptor|hutang energi/i.test(combined)) {
      emoji = '🥱';
      rawFeeling = 'BADAN LEMAS & NGANTUK BERAT';
    } else if (/halusinasi|mikrosleep|tidak tidur/i.test(combined)) {
      emoji = '😵';
      rawFeeling = 'PANDANGAN KABUR & LINGLUNG';
    } else if (/paru|oksigen|alveoli|napas/i.test(combined)) {
      emoji = '😮‍💨';
      rawFeeling = 'NAPAS PENDEK & BERAT';
    } else if (/hati|hepatosit|sitokrom|detoks/i.test(combined)) {
      emoji = '🤢';
      rawFeeling = 'BADAN BEGAH & CEPAT LELAH';
    } else if (/ginjal|kreatinin|kristal/i.test(combined)) {
      emoji = '😖';
      rawFeeling = 'PINGGANG PEGAL & NGILU';
    } else if (/saraf|mielin|refleks/i.test(combined)) {
      emoji = '🫠';
      rawFeeling = 'TUBUH LEMAS & KESEMUTAN';
    } else if (organ === 'brain') {
      emoji = '🤯';
      rawFeeling = 'SULIT FOKUS & KEPALA PENAT';
    } else if (organ === 'stomach' || organ === 'intestine') {
      emoji = '😣';
      rawFeeling = 'PERUT KEMBUNG & TIDAK NYAMAN';
    } else if (organ === 'heart' || organ === 'blood') {
      emoji = '💓';
      rawFeeling = 'DADA BERDEBAR & CEPAT LELAH';
    } else {
      emoji = '⚠️';
      rawFeeling = 'TUBUH LEMAS & TIDAK FIT';
    }
  }

  // Clean and condense to a punchy, concise single-line label (max ~32 characters)
  let feeling = rawFeeling
    .replace(/^EFEK:\s*/i, '')
    .replace(/^YANG DIRASAKAN:\s*/i, '')
    .replace(/^RASA\s+/i, '')
    .trim()
    .toUpperCase();

  // If longer than 32 chars, take first punchy clause
  if (feeling.length > 32) {
    const parts = feeling.split(/,|;|\s+DAN\s+|\s+TAPI\s+/i);
    if (parts[0] && parts[0].trim().length >= 10 && parts[0].trim().length <= 32) {
      feeling = parts[0].trim();
    } else {
      const words = feeling.split(/\s+/);
      let acc = '';
      for (const w of words) {
        if ((acc + ' ' + w).trim().length <= 30) {
          acc = (acc + ' ' + w).trim();
        } else {
          break;
        }
      }
      feeling = acc || feeling.slice(0, 30);
    }
  }

  return { feeling, emoji };
}
