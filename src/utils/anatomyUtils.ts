import { OrganTarget } from '../data/types';

export interface OrganCoord {
  id: OrganTarget;
  label: string;
  x: number;
  y: number;
  color: string;
}

export const ORGAN_MAP: Record<string, OrganCoord> = {
  brain: { id: 'brain', label: 'OTAK & SARAF PUSAT', x: 50, y: 12, color: '#38bdf8' },
  nerves: { id: 'nerves', label: 'SISTEM SARAF & TULANG BELAKANG', x: 50, y: 34, color: '#818cf8' },
  vocal_cords: { id: 'vocal_cords', label: 'PITA SUARA & LARING', x: 50, y: 30, color: '#38bdf8' },
  esophagus: { id: 'esophagus', label: 'KERONGKONGAN (ESOFAGUS)', x: 51, y: 42, color: '#fb923c' },
  lungs: { id: 'lungs', label: 'PARU-PARU & RESPIRASI', x: 50, y: 47, color: '#2dd4bf' },
  heart: { id: 'heart', label: 'JANTUNG & PEMBULUH', x: 52, y: 49, color: '#f43f5e' },
  blood: { id: 'blood', label: 'ALIRAN DARAH & VASKULAR', x: 51, y: 52, color: '#ef4444' },
  liver: { id: 'liver', label: 'HATI (LIVER)', x: 45, y: 62, color: '#f59e0b' },
  stomach: { id: 'stomach', label: 'LAMBUNG & PENCERNAAN', x: 55, y: 63, color: '#fb923c' },
  pancreas: { id: 'pancreas', label: 'PANKREAS & EMPEDU', x: 52, y: 66, color: '#10b981' },
  kidney: { id: 'kidney', label: 'GINJAL & EKSKRESI', x: 50, y: 68, color: '#a855f7' },
  intestine: { id: 'intestine', label: 'USUS & METABOLISME', x: 50, y: 74, color: '#eab308' },
  bladder: { id: 'bladder', label: 'KANDUNG KEMIH', x: 50, y: 88, color: '#38bdf8' },
  muscles: { id: 'muscles', label: 'JARINGAN OTOT & RANGKA', x: 36, y: 80, color: '#fb7185' },
  'full-body': { id: 'full-body', label: 'SELURUH TUBUH MANUSIA', x: 50, y: 74, color: '#38bdf8' },
};

export function detectOrganFromText(
  explicitOrgan?: OrganTarget | null,
  headline?: string,
  locationTag?: string,
  primaryText?: string | null,
  step: number = 1
): OrganCoord {
  if (explicitOrgan && ORGAN_MAP[explicitOrgan]) {
    return ORGAN_MAP[explicitOrgan];
  }
  const combined = `${explicitOrgan || ''} ${headline || ''} ${locationTag || ''} ${primaryText || ''}`.toLowerCase();

  if (/otak|saraf pusat|neuron|pikiran|tidur|halusinasi|kepala|mata|memori|korteks|kognitif|dopamin/.test(combined)) {
    return ORGAN_MAP.brain;
  }
  if (/saraf|tulang belakang|spinal|nyeri saraf|impuls/.test(combined)) {
    return ORGAN_MAP.nerves;
  }
  if (/pita suara|suara|laring|helium/.test(combined)) {
    return ORGAN_MAP.vocal_cords;
  }
  if (/kerongkongan|esofagus|esophagus|telan|menelan|baterai/.test(combined)) {
    return ORGAN_MAP.esophagus;
  }
  if (/jantung|detak|darah|pembuluh|nadi|tensi|tekanan darah|kardio|aritmia/.test(combined)) {
    return ORGAN_MAP.heart;
  }
  if (/paru|napas|oksigen|sesak|alveolus|bronkus|udara/.test(combined)) {
    return ORGAN_MAP.lungs;
  }
  if (/lambung|asam|perut|mual|muntah|lapar|makan|minum|kopi|kafein|maag/.test(combined)) {
    return ORGAN_MAP.stomach;
  }
  if (/kandung kemih|kemih|bladder|pipis|kencing|menahan kencing/.test(combined)) {
    return ORGAN_MAP.bladder;
  }
  if (/pankreas|pancreas|insulin|gula darah|empedu/.test(combined)) {
    return ORGAN_MAP.pancreas;
  }
  if (/ginjal|nefron|filtrasi racun|ureum|batu ginjal/.test(combined)) {
    return ORGAN_MAP.kidney;
  }
  if (/hati|liver|detoks|alkohol|glikogen/.test(combined)) {
    return ORGAN_MAP.liver;
  }
  if (/usus|kolon|pencernaan|diare|sembelit/.test(combined)) {
    return ORGAN_MAP.intestine;
  }
  return ORGAN_MAP['full-body'];
}
