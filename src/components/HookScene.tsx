import React, { useMemo } from 'react';
import { Img, useCurrentFrame, useVideoConfig, staticFile, interpolate, spring } from 'remotion';
import { resolveEditorialTheme } from '../utils/editorialThemes';

export interface HookSceneProps {
  storyId?: string | null;
  editorialMood?: string | null;
  hookStyle?: string | null;
  archetype?: string | null;
  headline?: string | null;
  kicker?: string | null;
  narration?: string | null;
  leftTitle: string;
  rightTitle: string;
  leftBadge?: string | null;
  rightBadge?: string | null;
  leftPrimaryText?: string | null;
  leftSecondaryText?: string | null;
  leftStampText?: string | null;
  leftImage?: string | null;
  rightImage?: string | null;
  hookAnimationType?: string | null;
  hookMode?: string | null;
  hookConditionLabel?: string | null;
  hookSymptoms?: string[] | null;
  hookItemEmoji?: string | null;
  hookItemLabel?: string | null;
  hookTargetCount?: number | null;
  hookUnitLabel?: string | null;
  durationFrames?: number;
}

type HookVisualMode =
  | 'empty-stomach-alert'
  | 'time-drain-battery'
  | 'pressure-overload'
  | 'streak-calendar';

interface ParsedHookScenario {
  mode: HookVisualMode;
  emoji: string;
  itemLabel: string;
  conditionLabel: string;
  meterLabel: string;
  meterStartText: string;
  meterEndText: string;
  symptoms: Array<{ emoji: string; text: string }>;
  targetCount: number;
  unitWord: string;
  unitLabel: string;
  targetOrganPng: string;
  naturalHeadline: string;
  highlightPhrase: string;
}

/**
 * Intelligent Topic-Aware Hook Director:
 * Selects a distinct Hook Visual Mode & Human Symptom List tailored to the specific topic,
 * so "Minum Kopi Saat Perut Kosong" NEVER looks like "Makan Mie 30 Hari"!
 */
function parseHookScenarioFromTopic(
  headline: string,
  narration: string,
  overrideMode?: string | null,
  overrideCondition?: string | null,
  overrideSymptoms?: string[] | null,
  overrideEmoji?: string | null,
  overrideLabel?: string | null,
  overrideCount?: number | null,
  overrideUnit?: string | null
): ParsedHookScenario {
  const combined = `${headline} ${narration}`.toLowerCase();

  // Check if the topic is EXPLICITLY a multi-day streak challenge (e.g., "30 hari", "7 hari", "sebulan")
  const explicitDayMatch = headline.match(/(\d+)\s*(hari|minggu|bulan)/i);
  const isExplicitMultiDayStreak =
    Boolean(explicitDayMatch) || /selama sebulan|30 hari|7 hari|14 hari/i.test(headline);

  let mode: HookVisualMode = isExplicitMultiDayStreak ? 'streak-calendar' : 'empty-stomach-alert';
  let emoji = overrideEmoji || '☕';
  let itemLabel = overrideLabel || 'KONSUMSI LANGSUNG';
  let conditionLabel = overrideCondition || 'KONDISI AWAL TUBUH';
  let meterLabel = 'LONJAKAN ASAM & STRES ORGAN';
  let meterStartText = 'NORMAL';
  let meterEndText = 'TINGGI!';
  let targetCount = overrideCount || 30;
  let unitWord = 'HARI';
  let unitLabel = overrideUnit || '30 HARI NON-STOP';
  let targetOrganPng = 'butterfly/organs/stomach.png';
  let naturalHeadline = headline.toUpperCase();
  let highlightPhrase = '';
  let symptoms: Array<{ emoji: string; text: string }> = [
    { emoji: '😣', text: 'Perut Terasa Perih, Panas & Mual' },
    { emoji: '🚽', text: 'Mulas Mendadak & Ingin ke Toilet' },
    { emoji: '💓', text: 'Jantung Berdebar Kencang & Gemetar' },
    { emoji: '🥱', text: 'Siangnya Badan Lemas & Ngantuk Berat' },
  ];

  // 1. KOPI / KAFEIN (Terutama Saat Perut Kosong)
  if (/kopi|kafein|energy drink|minuman energi/i.test(combined)) {
    emoji = overrideEmoji || '☕';
    itemLabel = 'KOPI SAAT PERUT KOSONG';
    conditionLabel = 'ISI LAMBUNG: 0% KOSONG';
    meterLabel = 'LONJAKAN ASAM LAMBUNG & DETAK JANTUNG';
    meterStartText = 'TENANG';
    meterEndText = 'MELONJAK!';
    targetOrganPng = 'butterfly/organs/stomach.png';
    mode = isExplicitMultiDayStreak ? 'streak-calendar' : 'empty-stomach-alert';
    naturalHeadline = /perut kosong/i.test(combined)
      ? 'APA JADINYA KALAU KAMU MINUM KOPI SAAT PERUT KOSONG?'
      : headline.toUpperCase();
    highlightPhrase = /perut kosong/i.test(combined) ? 'SAAT PERUT KOSONG?' : 'MINUM KOPI?';
    symptoms = [
      { emoji: '😣', text: 'Perut Terasa Perih, Melilit & Mual' },
      { emoji: '🚽', text: 'Mulas Mendadak & Kebelet BAB' },
      { emoji: '💓', text: 'Jantung Berdebar (Deg-degan) & Gemetar' },
      { emoji: '🥱', text: 'Siangnya Badan Lemas & Ngantuk Berat' },
    ];
  }
  // 2. TIDAK TIDUR / BEGADANG / MAIN HP
  else if (/tidur|begadang|insomnia|melek|main hp|layar/i.test(combined)) {
    mode = 'time-drain-battery';
    emoji = /hp|layar/i.test(combined) ? '📱' : '🪫';
    const hourMatch = combined.match(/(\d+)\s*jam/i);
    targetCount = hourMatch ? parseInt(hourMatch[1], 10) : 72;
    unitWord = 'JAM';
    unitLabel = `${targetCount} JAM TANPA ISTIRAHAT`;
    itemLabel = `${targetCount} JAM NON-STOP`;
    conditionLabel = 'ENERGI OTAK & TUBUH TERKURAS';
    meterLabel = 'SISA ENERGI & FOKUS MANUSIA';
    meterStartText = '100% SEGAR';
    meterEndText = '4% KRITIS!';
    targetOrganPng = 'butterfly/organs/brain.png';
    naturalHeadline = /hp|layar/i.test(combined)
      ? `APA JADINYA MAIN HP DI TEMPAT GELAP TERLALU LAMA?`
      : `APA JADINYA KALAU KAMU TIDAK TIDUR ${targetCount} JAM NON-STOP?`;
    highlightPhrase = /hp|layar/i.test(combined) ? 'TERLALU LAMA?' : `${targetCount} JAM NON-STOP?`;
    symptoms = [
      { emoji: '😵', text: 'Mata Perih, Berat & Kepala Pusing' },
      { emoji: '😡', text: 'Emosi Mudah Meledak & Sulit Fokus' },
      { emoji: '💤', text: 'Tertidur Tiba-Tiba (Mikrosleep 3 Detik)' },
      { emoji: '👁️', text: 'Linglung & Mulai Melihat Halusinasi' },
    ];
  }
  // 3. MENAHAN KENCING / KURANG MINUM AIR PUTIH / DEHIDRASI
  else if (/tahan kencing|menahan kencing|buang air|air putih|dehidrasi|kurang minum/i.test(combined)) {
    mode = 'pressure-overload';
    emoji = /kencing/i.test(combined) ? '🚽' : '💧';
    itemLabel = /kencing/i.test(combined) ? 'MENAHAN KENCING BERJAM-JAM' : 'TUBUH KEKURANGAN AIR PUTIH';
    conditionLabel = /kencing/i.test(combined) ? 'TEKANAN KANDUNG KEMIH NAIK' : 'CADANGAN CAIRAN TUBUH MENIPIS';
    meterLabel = /kencing/i.test(combined) ? 'KAPASITAS KANDUNG KEMIH' : 'TINGKAT DEHIDRASI GINJAL';
    meterStartText = '150 ML';
    meterEndText = '800 ML PENUH!';
    targetOrganPng = 'butterfly/organs/kidneys.png';
    naturalHeadline = /kencing/i.test(combined)
      ? 'APA JADINYA KALAU KAMU MENAHAN KENCING TERLALU LAMA?'
      : 'APA JADINYA KALAU JARANG MINUM AIR PUTIH?';
    highlightPhrase = /kencing/i.test(combined) ? 'TERLALU LAMA?' : 'AIR PUTIH?';
    symptoms = /kencing/i.test(combined)
      ? [
          { emoji: '😣', text: 'Perut Bawah Terasa Penuh, Keras & Nyeri' },
          { emoji: '💦', text: 'Keringat Dingin & Gelisah Tak Tahan' },
          { emoji: '🔥', text: 'Perih Saat Buang Air (Anyang-anyangan)' },
          { emoji: '😖', text: 'Pinggang Pegal karena Urin Balik ke Ginjal' },
        ]
      : [
          { emoji: '👄', text: 'Tenggorokan Kering & Bibir Pecah-Pecah' },
          { emoji: '🤕', text: 'Kepala Pusing & Sulit Berkonsentrasi' },
          { emoji: '🚽', text: 'Urin Berwarna Kuning Pekat & Berbau Tajam' },
          { emoji: '😖', text: 'Pinggang Pegal & Risiko Batu Ginjal' },
        ];
  }
  // 4. MAKAN MIE 30 HARI (Atau tantangan jumlah hari eksplisit)
  else if (/mie|mi instan|indomie|ramen/i.test(combined)) {
    emoji = '🍜';
    targetCount = explicitDayMatch ? parseInt(explicitDayMatch[1], 10) : 30;
    unitWord = 'HARI';
    unitLabel = `${targetCount} HARI NON-STOP`;
    itemLabel = 'BUNGKUS MIE';
    targetOrganPng = 'butterfly/organs/stomach.png';
    mode = isExplicitMultiDayStreak ? 'streak-calendar' : 'empty-stomach-alert';
    naturalHeadline = `APA JADINYA KALAU KAMU MAKAN MIE ${targetCount} HARI TERUS-MENERUS?`;
    highlightPhrase = `${targetCount} HARI TERUS-MENERUS?`;
    symptoms = [
      { emoji: '🫃', text: 'Perut Begah, Kembung & Cepat Haus' },
      { emoji: '🥱', text: 'Cepat Kenyang tapi 1 Jam Kemudian Lemas' },
      { emoji: '🤕', text: 'Kepala Sering Pusing & Wajah Sembab' },
      { emoji: '💓', text: 'Tekanan Darah Naik & Mudah Lelah' },
    ];
  }
  // 5. MAKAN PEDAS / SEBLAK / CABAI
  else if (/pedas|cabai|sambal|seblak/i.test(combined)) {
    mode = isExplicitMultiDayStreak ? 'streak-calendar' : 'empty-stomach-alert';
    emoji = '🌶️';
    itemLabel = 'MAKANAN SUPER PEDAS';
    conditionLabel = 'SERANGAN CAPSAICIN DI LAMBUNG';
    meterLabel = 'TINGKAT IRITASI & PANAS LAMBUNG';
    meterStartText = 'AMAN';
    meterEndText = 'TERBAKAR!';
    targetOrganPng = 'butterfly/organs/stomach.png';
    naturalHeadline = 'APA JADINYA KALAU MAKAN PEDAS BERLEBIHAN?';
    highlightPhrase = 'PEDAS BERLEBIHAN?';
    symptoms = [
      { emoji: '🥵', text: 'Mulut Terbakar, Keringat Bercucuran & Melar' },
      { emoji: '🔥', text: 'Ulu Hati Panas & Perut Melilit Hebat' },
      { emoji: '🚽', text: 'Diare Panas & Bolak-Balik ke Toilet' },
      { emoji: '🤢', text: 'Mual, Asam Lambung Naik ke Tenggorokan' },
    ];
  }
  // 6. GULA / MINUMAN MANIS / SODA
  else if (/gula|manis|boba|soda|minuman kemasan/i.test(combined)) {
    mode = isExplicitMultiDayStreak ? 'streak-calendar' : 'empty-stomach-alert';
    emoji = /berhenti|tanpa|stop/i.test(combined) ? '🚫' : '🥤';
    itemLabel = /berhenti|tanpa|stop/i.test(combined) ? 'STOP KONSUMSI GULA' : 'LONJAKAN GULA & SODA';
    conditionLabel = /berhenti|tanpa|stop/i.test(combined) ? 'TUBUH DETOKS TANPA GULA' : 'LONJAKAN GULA DARAH EKSTREM';
    meterLabel = 'KADAR GULA & INSULIN DARAH';
    targetOrganPng = 'butterfly/organs/liver.png';
    symptoms = [
      { emoji: '⚡', text: 'Energi Naik Sesaat Lalu Langsung Ngantuk' },
      { emoji: '🍔', text: 'Cepat Lapar Lagi & Ingin Ngemil Terus' },
      { emoji: '🫃', text: 'Perut Buncit & Mudah Lelah Saat Beraktivitas' },
      { emoji: '🦷', text: 'Tenggorokan Sering Haus & Kulit Kusam' },
    ];
  }
  // 7. ROKOK / VAPE
  else if (/rokok|merokok|vape|nikotin|asap/i.test(combined)) {
    mode = isExplicitMultiDayStreak ? 'streak-calendar' : 'empty-stomach-alert';
    emoji = '🚬';
    itemLabel = 'ASAP NIKOTIN & TAR';
    conditionLabel = 'PAPARAN LANGSUNG KE PARU-PARU';
    meterLabel = 'PENURUNAN OKSIGEN & KAPASITAS PARU';
    targetOrganPng = 'butterfly/organs/lungs.png';
    symptoms = [
      { emoji: '😮‍💨', text: 'Napas Terasa Pendek & Cepat Ngos-ngosan' },
      { emoji: '🗣️', text: 'Tenggorokan Gatal, Berdahak & Batuk Pagi' },
      { emoji: '💓', text: 'Jantung Berdetak Lebih Cepat & Tangan Dingin' },
      { emoji: '🥱', text: 'Tubuh Cepat Lelah Saat Naik Tangga' },
    ];
  }

  // Override mode if explicitly passed and valid (except don't allow streak-calendar unless truly multi-day!)
  if (
    overrideMode === 'empty-stomach-alert' ||
    overrideMode === 'time-drain-battery' ||
    overrideMode === 'pressure-overload' ||
    (overrideMode === 'streak-calendar' && isExplicitMultiDayStreak)
  ) {
    mode = overrideMode;
  }

  // Override symptoms if AI Director explicitly generated topic-specific human symptoms
  if (Array.isArray(overrideSymptoms) && overrideSymptoms.length >= 3) {
    const defaultEmojis = ['😣', '🚽', '💓', '🥱'];
    symptoms = overrideSymptoms.slice(0, 4).map((s, idx) => ({
      emoji: defaultEmojis[idx % defaultEmojis.length],
      text: s.replace(/^[😣🚽💓🥱😵🔥💧⚡⚠️]+\s*/, '').trim(),
    }));
  }

  // Highlight last 2-3 words of headline if not set
  if (!highlightPhrase) {
    const words = naturalHeadline.split(/\s+/);
    highlightPhrase = words.slice(Math.max(1, words.length - 3)).join(' ');
  }

  return {
    mode,
    emoji,
    itemLabel,
    conditionLabel,
    meterLabel,
    meterStartText,
    meterEndText,
    symptoms,
    targetCount,
    unitWord,
    unitLabel,
    targetOrganPng,
    naturalHeadline,
    highlightPhrase,
  };
}

export const HookScene: React.FC<HookSceneProps> = ({
  storyId,
  editorialMood,
  headline: rawHeadline,
  narration: rawNarration,
  leftTitle,
  rightTitle,
  hookMode,
  hookConditionLabel,
  hookSymptoms,
  hookItemEmoji,
  hookItemLabel,
  hookTargetCount,
  hookUnitLabel,
  durationFrames = 250,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const rawH = rawHeadline || rightTitle || leftTitle || 'APA JADINYA KALAU KAMU MINUM KOPI SAAT PERUT KOSONG?';
  const headlineInput = rawH.trim().endsWith('?') ? rawH.trim() : `${rawH.trim()}?`;
  const narration = rawNarration || '';

  const theme = useMemo(
    () => resolveEditorialTheme(storyId, editorialMood, headlineInput),
    [storyId, editorialMood, headlineInput]
  );

  const scenario = useMemo(
    () =>
      parseHookScenarioFromTopic(
        headlineInput,
        narration,
        hookMode,
        hookConditionLabel,
        hookSymptoms,
        hookItemEmoji,
        hookItemLabel,
        hookTargetCount,
        hookUnitLabel
      ),
    [headlineInput, narration, hookMode, hookConditionLabel, hookSymptoms, hookItemEmoji, hookItemLabel, hookTargetCount, hookUnitLabel]
  );

  const introSpring = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 60, mass: 0.9 },
  });

  // Escalation progress from 0 -> 1 over the first 68% of the hook duration
  const rampEndFrame = Math.max(90, Math.round(durationFrames * 0.68));
  const rawProgress = Math.min(1, Math.max(0, frame / rampEndFrame));
  const curvedProgress = 1 - Math.pow(1 - rawProgress, 1.85);
  const currentCount = Math.max(1, Math.round(1 + curvedProgress * (scenario.targetCount - 1)));

  // Physiological pulse
  const dynamicBpm = Math.round(72 + curvedProgress * 62);
  const beatPhase = (frame / fps) * (dynamicBpm / 60) * Math.PI * 2;
  const systolicBeat = Math.pow(Math.max(0, Math.sin(beatPhase)), 8);

  // Rapid-fire flying items streaming into the 3D human body's mouth & down the esophagus
  const streamItems = useMemo(() => {
    return Array.from({ length: 6 }).map((_, i) => ({
      id: i,
      offset: i * 15,
      curveX: (i % 2 === 0 ? 1 : -1) * (25 + (i % 3) * 18),
    }));
  }, []);

  // Split headline to highlight the key phrase
  const headlineParts = useMemo(() => {
    const full = scenario.naturalHeadline.toUpperCase();
    const target = scenario.highlightPhrase.toUpperCase();
    const idx = full.indexOf(target);
    if (idx !== -1 && idx > 0) {
      return {
        before: full.slice(0, idx).trim(),
        highlighted: full.slice(idx).trim(),
      };
    }
    const words = full.split(/\s+/);
    if (words.length >= 4) {
      const splitAt = Math.max(2, words.length - 3);
      return {
        before: words.slice(0, splitAt).join(' '),
        highlighted: words.slice(splitAt).join(' '),
      };
    }
    return { before: full, highlighted: '' };
  }, [scenario.naturalHeadline, scenario.highlightPhrase]);

  const isBodyOnRight = theme.hookLayout === 'dossier-left-body-right';

  // ---------------------------------------------------------------------------
  // 3D HUMAN BODY COLUMN (With Expressive Human Reaction & Organ Glow)
  // ---------------------------------------------------------------------------
  const bodyColumn = (
    <div
      style={{
        position: 'relative',
        width: '470px',
        height: '850px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transform: `scale(${0.97 + curvedProgress * 0.05 + systolicBeat * 0.012})`,
      }}
    >
      <div
        style={{
          position: 'absolute',
          width: '360px',
          height: '560px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(244, 240, 234, 0.1) 0%, transparent 70%)',
          filter: 'blur(20px)',
        }}
      />

      {/* 3D Translucent Glass Body Shell */}
      <Img
        src={staticFile('butterfly/organs/body_3d_shell.png')}
        style={{
          width: '470px',
          height: '830px',
          objectFit: 'contain',
          opacity: 0.88,
          mixBlendMode: 'screen',
        }}
      />

      {/* 3D Organ Inside Body Glowing as Trigger Enters */}
      <div
        style={{
          position: 'absolute',
          top:
            scenario.targetOrganPng.includes('brain')
              ? '128px'
              : scenario.targetOrganPng.includes('lungs') || scenario.targetOrganPng.includes('heart')
              ? '255px'
              : '318px',
          left: scenario.targetOrganPng.includes('stomach') ? '53.5%' : '50%',
          transform: `translateX(-50%) scale(${0.88 + curvedProgress * 0.12 + systolicBeat * 0.05})`,
          width: '74px',
          height: '74px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          filter: `drop-shadow(0 0 ${8 + curvedProgress * 16}px ${theme.primaryHighlight}) saturate(${1.1 + curvedProgress * 0.35})`,
        }}
      >
        <Img
          src={staticFile(scenario.targetOrganPng)}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
          }}
        />
      </div>

      {/* Stream of Trigger Items Entering the Body */}
      {streamItems.map((item) => {
        const cycle = ((frame + item.offset) % 48) / 48;
        const mouthX = 235;
        const mouthY = 205;
        const startX = isBodyOnRight ? 25 : 445;
        const organY =
          scenario.targetOrganPng.includes('brain')
            ? 165
            : scenario.targetOrganPng.includes('lungs') || scenario.targetOrganPng.includes('heart')
            ? 295
            : 355;

        const curX =
          cycle < 0.6
            ? interpolate(cycle, [0, 0.6], [startX, mouthX])
            : mouthX + Math.sin(cycle * Math.PI * 4) * 4;
        const curY =
          cycle < 0.6
            ? interpolate(cycle, [0, 0.6], [240, mouthY]) - Math.sin((cycle / 0.6) * Math.PI) * (35 + item.curveX * 0.5)
            : interpolate(cycle, [0.6, 1], [mouthY, organY]);

        const itemScale =
          cycle < 0.6
            ? interpolate(cycle, [0, 0.2, 0.6], [0.5, 1.15, 0.72])
            : interpolate(cycle, [0.6, 1], [0.68, 0.25]);
        const itemOpacity = interpolate(cycle, [0, 0.12, 0.6, 0.92, 1], [0, 1, 0.95, 0.75, 0]);

        return (
          <div
            key={item.id}
            style={{
              position: 'absolute',
              left: `${curX}px`,
              top: `${curY}px`,
              fontSize: '40px',
              transform: `translate(-50%, -50%) scale(${itemScale}) rotate(${cycle < 0.6 ? cycle * 180 : 0}deg)`,
              opacity: itemOpacity,
              filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.65))',
              pointerEvents: 'none',
            }}
          >
            {scenario.emoji}
          </div>
        );
      })}
    </div>
  );

  // ---------------------------------------------------------------------------
  // TOPIC-SPECIFIC HOOK VISUAL CARD (4 Distinct Modes — Never One-Size-Fits-All!)
  // ---------------------------------------------------------------------------
  const renderTopicSpecificCardContent = () => {
    // MODE A: STREAK CALENDAR (ONLY for explicit "30 Hari" / "7 Hari" topics like Makan Mie 30 Hari)
    if (scenario.mode === 'streak-calendar') {
      const totalGridSlots = Math.min(30, Math.max(7, scenario.targetCount > 30 ? 30 : scenario.targetCount));
      const activeGridSlots = Math.max(1, Math.round(curvedProgress * totalGridSlots));

      return (
        <>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: theme.specimenBg,
              padding: '18px 20px',
              borderRadius: '4px',
              border: `2px solid ${theme.inkDark}`,
            }}
          >
            <div
              style={{
                fontSize: '68px',
                lineHeight: 1,
                transform: `scale(${1 + Math.sin(frame * 0.35) * 0.12}) rotate(${Math.sin(frame * 0.25) * 6}deg)`,
              }}
            >
              {scenario.emoji}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
              <div
                style={{
                  fontFamily: "'Montserrat', sans-serif",
                  fontSize: '68px',
                  fontWeight: 900,
                  color: curvedProgress >= 0.75 ? theme.criticalHighlight : theme.primaryHighlight,
                  lineHeight: 1.0,
                }}
              >
                ×{currentCount}
              </div>
              <span
                style={{
                  fontFamily: "'Space Grotesk', monospace",
                  fontSize: '13px',
                  fontWeight: 900,
                  color: '#F4F0EA',
                  letterSpacing: '1px',
                  marginTop: '6px',
                }}
              >
                {scenario.itemLabel}
              </span>
            </div>
          </div>

          <div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '12px',
                borderBottom: `2px solid ${theme.inkDark}`,
                paddingBottom: '8px',
              }}
            >
              <span style={{ fontFamily: "'Space Grotesk', monospace", fontSize: '13px', fontWeight: 900, color: theme.inkDark }}>
                {scenario.unitLabel}
              </span>
              <span
                style={{
                  fontFamily: "'Space Grotesk', monospace",
                  fontSize: '13px',
                  fontWeight: 900,
                  color: theme.primaryHighlightText,
                  backgroundColor: theme.primaryHighlight,
                  border: `1.5px solid ${theme.inkDark}`,
                  padding: '2px 10px',
                  borderRadius: '2px',
                }}
              >
                {scenario.unitWord} {currentCount}/{scenario.targetCount}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '8px' }}>
              {Array.from({ length: totalGridSlots }).map((_, idx) => {
                const isLit = idx < activeGridSlots;
                const isNewest = idx === activeGridSlots - 1;
                return (
                  <div
                    key={idx}
                    style={{
                      height: '62px',
                      borderRadius: '3px',
                      backgroundColor: isLit ? (isNewest ? theme.primaryHighlight : theme.specimenBg) : '#E5E0D5',
                      border: `2px solid ${theme.inkDark}`,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transform: isNewest ? 'scale(1.08)' : 'scale(1)',
                      opacity: isLit ? 1 : 0.45,
                    }}
                  >
                    <span style={{ fontSize: '24px', lineHeight: 1 }}>{scenario.emoji}</span>
                    <span
                      style={{
                        fontFamily: "'Space Grotesk', monospace",
                        fontSize: '11px',
                        fontWeight: 900,
                        color: isLit ? (isNewest ? theme.primaryHighlightText : '#F4F0EA') : '#71717a',
                        marginTop: '3px',
                      }}
                    >
                      #{idx + 1}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      );
    }

    // MODE B: TIME-DRAIN & BATTERY DEPLETION (For "Tidak Tidur 72 Jam" / "Main HP")
    if (scenario.mode === 'time-drain-battery') {
      const remainingBattery = Math.max(4, Math.round(100 - curvedProgress * 96));
      const activeSymptoms = Math.max(1, Math.ceil(curvedProgress * scenario.symptoms.length));

      return (
        <>
          <div
            style={{
              backgroundColor: theme.specimenBg,
              padding: '18px 20px',
              borderRadius: '4px',
              border: `2px solid ${theme.inkDark}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ fontSize: '60px', lineHeight: 1 }}>{scenario.emoji}</div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontFamily: "'Space Grotesk', monospace", fontSize: '12px', fontWeight: 800, color: '#a1a1aa' }}>
                DURASI TANPA ISTIRAHAT
              </span>
              <div
                style={{
                  fontFamily: "'Montserrat', sans-serif",
                  fontSize: '54px',
                  fontWeight: 900,
                  color: theme.primaryHighlight,
                  lineHeight: 1.05,
                }}
              >
                {currentCount} JAM
              </div>
            </div>
          </div>

          {/* Battery Drain Bar */}
          <div
            style={{
              backgroundColor: '#E5E0D5',
              padding: '12px 14px',
              borderRadius: '4px',
              border: `2px solid ${theme.inkDark}`,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontFamily: "'Space Grotesk', monospace", fontSize: '12px', fontWeight: 900, color: theme.inkDark }}>
                ENERGI & FOKUS TUBUH
              </span>
              <span style={{ fontFamily: "'Space Grotesk', monospace", fontSize: '13px', fontWeight: 900, color: theme.criticalHighlight }}>
                SISA {remainingBattery}%
              </span>
            </div>
            <div
              style={{
                width: '100%',
                height: '18px',
                backgroundColor: theme.specimenBg,
                borderRadius: '3px',
                border: `1.5px solid ${theme.inkDark}`,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${remainingBattery}%`,
                  height: '100%',
                  backgroundColor: remainingBattery < 30 ? theme.criticalHighlight : '#22c55e',
                }}
              />
            </div>
          </div>

          {/* Human Symptoms Popping In */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
            <div
              style={{
                fontFamily: "'Space Grotesk', monospace",
                fontSize: '12px',
                fontWeight: 900,
                color: theme.inkDark,
                letterSpacing: '0.8px',
                borderBottom: `2px solid ${theme.inkDark}`,
                paddingBottom: '5px',
              }}
            >
              YANG DIRASAKAN TUBUHMU:
            </div>
            {scenario.symptoms.map((sym, idx) => {
              const isVisible = idx < activeSymptoms;
              return (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '10px 12px',
                    borderRadius: '4px',
                    backgroundColor: isVisible ? theme.specimenBg : '#E5E0D5',
                    border: `2px solid ${theme.inkDark}`,
                    opacity: isVisible ? 1 : 0.35,
                    transform: isVisible ? 'scale(1)' : 'scale(0.97)',
                  }}
                >
                  <span style={{ fontSize: '26px', lineHeight: 1 }}>{sym.emoji}</span>
                  <span
                    style={{
                      fontFamily: "'Montserrat', sans-serif",
                      fontSize: '14px',
                      fontWeight: 800,
                      color: isVisible ? '#F4F0EA' : '#52525b',
                      lineHeight: 1.2,
                    }}
                  >
                    {sym.text}
                  </span>
                </div>
              );
            })}
          </div>
        </>
      );
    }

    // MODE C & D: EMPTY STOMACH ALERT / PRESSURE OVERLOAD (For "Minum Kopi Saat Perut Kosong", "Makan Pedas", "Menahan Kencing", etc.)
    const meterPercent = Math.round(18 + curvedProgress * 78);
    const activeSymptoms = Math.max(1, Math.ceil(curvedProgress * scenario.symptoms.length));

    return (
      <>
        {/* Top Status Header: Condition (e.g. ISI LAMBUNG: 0% KOSONG) + Trigger Item */}
        <div
          style={{
            backgroundColor: theme.specimenBg,
            padding: '16px 18px',
            borderRadius: '4px',
            border: `2px solid ${theme.inkDark}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
          }}
        >
          <div
            style={{
              fontSize: '60px',
              lineHeight: 1,
              transform: `scale(${1 + Math.sin(frame * 0.3) * 0.1}) rotate(${Math.sin(frame * 0.2) * 5}deg)`,
            }}
          >
            {scenario.emoji}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', textAlign: 'right' }}>
            <span
              style={{
                backgroundColor: theme.primaryHighlight,
                color: theme.primaryHighlightText,
                fontFamily: "'Space Grotesk', monospace",
                fontSize: '12px',
                fontWeight: 900,
                padding: '3px 9px',
                borderRadius: '2px',
                marginBottom: '6px',
              }}
            >
              {scenario.conditionLabel}
            </span>
            <div
              style={{
                fontFamily: "'Montserrat', sans-serif",
                fontSize: '22px',
                fontWeight: 900,
                color: '#F4F0EA',
                lineHeight: 1.15,
              }}
            >
              {scenario.itemLabel}
            </div>
          </div>
        </div>

        {/* Live Reaction / Acidity / Pressure Bar */}
        <div
          style={{
            backgroundColor: '#E5E0D5',
            padding: '12px 14px',
            borderRadius: '4px',
            border: `2px solid ${theme.inkDark}`,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ fontFamily: "'Space Grotesk', monospace", fontSize: '11px', fontWeight: 900, color: theme.inkDark }}>
              {scenario.meterLabel}
            </span>
            <span
              style={{
                fontFamily: "'Space Grotesk', monospace",
                fontSize: '12px',
                fontWeight: 900,
                color: curvedProgress > 0.5 ? theme.criticalHighlight : theme.inkDark,
              }}
            >
              {curvedProgress > 0.6 ? scenario.meterEndText : scenario.meterStartText} ({dynamicBpm} BPM)
            </span>
          </div>
          <div
            style={{
              width: '100%',
              height: '16px',
              backgroundColor: theme.specimenBg,
              borderRadius: '3px',
              border: `1.5px solid ${theme.inkDark}`,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${meterPercent}%`,
                height: '100%',
                backgroundColor: curvedProgress > 0.65 ? theme.criticalHighlight : theme.primaryHighlight,
              }}
            />
          </div>
        </div>

        {/* 4 Real Human Sensations ("YANG LANGSUNG DIRASAKAN TUBUHMU") */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: `2px solid ${theme.inkDark}`,
              paddingBottom: '6px',
            }}
          >
            <span
              style={{
                fontFamily: "'Space Grotesk', monospace",
                fontSize: '12px',
                fontWeight: 900,
                color: theme.inkDark,
                letterSpacing: '0.6px',
              }}
            >
              EFEK YANG DIRASAKAN MANUSIA:
            </span>
          </div>

          {scenario.symptoms.map((sym, idx) => {
            const isLit = idx < activeSymptoms;
            const isNewest = idx === activeSymptoms - 1;
            return (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '11px 14px',
                  borderRadius: '4px',
                  backgroundColor: isLit
                    ? isNewest
                      ? theme.primaryHighlight
                      : theme.specimenBg
                    : '#E5E0D5',
                  border: `2px solid ${theme.inkDark}`,
                  boxShadow: isNewest ? `4px 4px 0px ${theme.inkDark}` : 'none',
                  transform: isNewest ? 'scale(1.03)' : 'scale(1)',
                  opacity: isLit ? 1 : 0.4,
                }}
              >
                <span style={{ fontSize: '26px', lineHeight: 1 }}>{sym.emoji}</span>
                <span
                  style={{
                    fontFamily: "'Montserrat', sans-serif",
                    fontSize: '14px',
                    fontWeight: 900,
                    color: isLit ? (isNewest ? theme.primaryHighlightText : '#F4F0EA') : '#71717a',
                    lineHeight: 1.2,
                  }}
                >
                  {sym.text}
                </span>
              </div>
            );
          })}
        </div>
      </>
    );
  };

  const counterColumn = (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        backgroundColor: theme.cardBg,
        border: theme.cardBorder,
        borderTop: theme.cardTopAccentBar ? `8px solid ${theme.cardTopAccentBar}` : theme.cardBorder,
        borderLeft: theme.cardLeftAccentSpine ? `9px solid ${theme.cardLeftAccentSpine}` : theme.cardBorder,
        borderRadius: theme.cardRadius,
        padding: '20px 18px',
        boxShadow: theme.cardShadow,
      }}
    >
      {renderTopicSpecificCardContent()}
    </div>
  );

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: theme.bgGradient,
        overflow: 'hidden',
        perspective: '1200px',
      }}
    >
      {/* 1. Editorial Studio Texture */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: theme.bgPatternImage,
          backgroundSize: theme.bgPatternSize,
          pointerEvents: 'none',
        }}
      />

      {/* =====================================================================
          2. CLEAN HUMAN-EDITED TITLE
          ===================================================================== */}
      <div
        style={{
          position: 'absolute',
          top: '68px',
          left: '48px',
          right: '48px',
          zIndex: 35,
          transform: `translateY(${interpolate(introSpring, [0, 1], [-24, 0])}px)`,
          opacity: introSpring,
        }}
      >
        <h1
          style={{
            fontSize: '42px',
            fontWeight: 900,
            color: theme.paperLight,
            lineHeight: 1.22,
            letterSpacing: '-0.8px',
            fontFamily: "'Montserrat', sans-serif",
            textTransform: 'uppercase',
            margin: 0,
            textShadow: '0 4px 18px rgba(0, 0, 0, 0.85)',
          }}
        >
          {headlineParts.before}{' '}
          {headlineParts.highlighted && (
            <span
              style={{
                backgroundColor: theme.primaryHighlight,
                color: theme.primaryHighlightText,
                padding: '2px 12px',
                borderRadius: '3px',
                border: `2px solid ${theme.inkDark}`,
                boxShadow: `4px 4px 0px ${theme.inkDark}`,
                display: 'inline-block',
                marginTop: '6px',
              }}
            >
              {headlineParts.highlighted}
            </span>
          )}
        </h1>
      </div>

      {/* =====================================================================
          3. CENTER STAGE: 3D BODY + TOPIC-SPECIFIC HOOK VISUAL
          ===================================================================== */}
      <div
        style={{
          position: 'absolute',
          top: '290px',
          left: '36px',
          right: '36px',
          height: '870px',
          zIndex: 20,
          display: 'grid',
          gridTemplateColumns: isBodyOnRight ? '1fr 470px' : '470px 1fr',
          gap: '20px',
          alignItems: 'center',
        }}
      >
        {isBodyOnRight ? (
          <>
            {counterColumn}
            {bodyColumn}
          </>
        ) : (
          <>
            {bodyColumn}
            {counterColumn}
          </>
        )}
      </div>

      {/* =====================================================================
          4. SUBTITLE SAFE ZONE PROTECTIVE GRADIENT (Strictly protects y >= 1200px)
          ===================================================================== */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: '660px',
          background:
            'linear-gradient(to top, rgba(9, 10, 12, 0.96) 0%, rgba(14, 15, 18, 0.76) 46%, transparent 100%)',
          pointerEvents: 'none',
          zIndex: 18,
        }}
      />
    </div>
  );
};
