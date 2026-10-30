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

  curiosityClue: string;

  hookMysteryQuestion: string;

  targetCount: number;

  unitWord: string;

  unitLabel: string;

  targetOrganPng: string;

  characterActionPng: string;

  actionCalloutText: string;

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

  let characterActionPng = 'butterfly/characters/action_drinking.png';

  let actionCalloutText = '☕ MINUM SAAT PERUT KOSONG';

  let curiosityClue = 'ALIRAN CAIRAN LANGSUNG MASUK TANPA MAKANAN';

  let hookMysteryQuestion = 'APA YANG TERJADI SAAT MASUK KE TUBUHMU?';

  let naturalHeadline = headline.toUpperCase();

  let highlightPhrase = '';

  // 1. KOPI / KAFEIN / MINUMAN (Terutama Saat Perut Kosong)

  if (/kopi|kafein|energy drink|minuman energi|minum/i.test(combined)) {

    emoji = overrideEmoji || '☕';

    itemLabel = 'KOPI SAAT PERUT KOSONG';

    conditionLabel = 'KONDISI: PERUT 0% MAKANAN';

    meterLabel = 'TINGKAT STRES FISIOLOGIS AWAL';

    meterStartText = 'NORMAL';

    meterEndText = 'REAKSI TINGGI!';

    targetOrganPng = 'butterfly/organs/stomach.png';

    characterActionPng = 'butterfly/characters/action_drinking.png';

    actionCalloutText = '☕ MINUM SAAT PERUT KOSONG';

    curiosityClue = 'Cairan pekat masuk ke saluran pencernaan tanpa ada makanan pelindung sedikit pun.';

    hookMysteryQuestion = 'Bagian tubuh mana yang paling menderita akibat kebiasaan ini?';

    mode = isExplicitMultiDayStreak ? 'streak-calendar' : 'empty-stomach-alert';

    naturalHeadline = /perut kosong/i.test(combined)

      ? 'APA JADINYA KALAU KAMU MINUM KOPI SAAT PERUT KOSONG?'

      : headline.toUpperCase();

    highlightPhrase = /perut kosong/i.test(combined) ? 'SAAT PERUT KOSONG?' : 'MINUM KOPI?';

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

    conditionLabel = 'STATUS: TUBUH MELEK PAKSA';

    meterLabel = 'BATAS KETAHANAN TUBUH MANUSIA';

    meterStartText = 'SEGAR';

    meterEndText = 'AMBANG BATAS!';

    targetOrganPng = 'butterfly/organs/brain.png';

    characterActionPng = 'butterfly/characters/action_sleepy.png';

    actionCalloutText = '😴 MENGANTUK BERAT & MATA MELEK PAKSA';

    curiosityClue = 'Saraf otak dipaksa menyala tanpa henti melewati batas toleransi fisiologis manusia.';

    hookMysteryQuestion = 'Berapa jam sebenarnya tubuh manusia bisa bertahan sebelum sistem mati rasa?';

    naturalHeadline = /hp|layar/i.test(combined)

      ? `APA JADINYA MAIN HP DI TEMPAT GELAP TERLALU LAMA?`

      : `APA JADINYA KALAU KAMU TIDAK TIDUR ${targetCount} JAM NON-STOP?`;

    highlightPhrase = /hp|layar/i.test(combined) ? 'TERLALU LAMA?' : `${targetCount} JAM NON-STOP?`;

  }

  // 3. MENAHAN KENCING / KURANG MINUM AIR PUTIH / DEHIDRASI

  else if (/tahan kencing|menahan kencing|buang air|kencing|pipis|kemal|bladder|air putih|dehidrasi|kurang minum/i.test(combined)) {

    mode = 'pressure-overload';

    emoji = /kencing|pipis|kemal|bladder/i.test(combined) ? '🚽' : '💧';

    itemLabel = /kencing|pipis|kemal|bladder/i.test(combined) ? 'MENAHAN KENCING BERJAM-JAM' : 'TUBUH KEKURANGAN AIR PUTIH';

    conditionLabel = /kencing|pipis|kemal|bladder/i.test(combined) ? 'KONDISI: DITAHAN TERLALU LAMA' : 'KONDISI: KEKURANGAN CAIRAN';

    meterLabel = /kencing|pipis|kemal|bladder/i.test(combined) ? 'TINGKAT TEKANAN CAIRAN TUBUH' : 'TINGKAT DEHIDRASI SEL';

    meterStartText = 'AMAN';

    meterEndText = 'BAHAYA!';

    targetOrganPng = 'butterfly/organs/bladder.png';

    characterActionPng = 'butterfly/characters/action_holding_pee.png';

    actionCalloutText = '😣 MENAHAN KENCING HINGGA GELISAH';

    curiosityClue = 'Cairan yang seharusnya dibuang tertahan di dalam panggul dan terus bertambah setiap menit.';

    hookMysteryQuestion = 'Ke mana cairan ini akan mengalir jika kantung penampung sudah tidak muat lagi?';

    naturalHeadline = /kencing|pipis|kemal/i.test(combined)

      ? 'APA JADINYA KALAU KAMU MENAHAN KENCING TERLALU LAMA?'

      : 'APA JADINYA KALAU JARANG MINUM AIR PUTIH?';

    highlightPhrase = /kencing|pipis|kemal/i.test(combined) ? 'TERLALU LAMA?' : 'AIR PUTIH?';

  }

  // 4. MAKAN MIE 30 HARI (Atau tantangan makan mi / makanan instan)

  else if (/mie|mi instan|indomie|ramen|makan/i.test(combined)) {

    emoji = '🍜';

    targetCount = explicitDayMatch ? parseInt(explicitDayMatch[1], 10) : 30;

    unitWord = 'HARI';

    unitLabel = `${targetCount} HARI NON-STOP`;

    itemLabel = 'KONSUMSI NON-STOP';

    conditionLabel = `TANTANGAN: ${targetCount} HARI BERTURUT-TURUT`;

    meterLabel = 'TINGKAT BEBAN SISTEM TUBUH';

    meterStartText = 'HARI 1';

    meterEndText = `HARI ${targetCount}!`;

    targetOrganPng = 'butterfly/organs/stomach.png';

    characterActionPng = 'butterfly/characters/action_eating.png';

    actionCalloutText = '🍜 MAKAN MIE SETIAP HARI';

    curiosityClue = 'Zat pengawet, natrium tinggi, dan kalori instan masuk ke tubuh setiap hari tanpa jeda nutrisi.';

    hookMysteryQuestion = 'Organ apa yang pertama kali tumbang di dalam tubuhmu?';

    mode = isExplicitMultiDayStreak ? 'streak-calendar' : 'empty-stomach-alert';

    naturalHeadline = `APA JADINYA KALAU KAMU MAKAN MIE ${targetCount} HARI TERUS-MENERUS?`;

    highlightPhrase = `${targetCount} HARI TERUS-MENERUS?`;

  }

  // 5. MAKAN PEDAS / SEBLAK / CABAI

  else if (/pedas|cabai|sambal|seblak/i.test(combined)) {

    mode = isExplicitMultiDayStreak ? 'streak-calendar' : 'empty-stomach-alert';

    emoji = '🌶️';

    itemLabel = 'MAKANAN SUPER PEDAS';

    conditionLabel = 'PAPARAN CAPSAICIN EKSTREM';

    meterLabel = 'TINGKAT IRITASI & SUHU LAMBUNG';

    meterStartText = 'NORMAL';

    meterEndText = 'TERBAKAR!';

    targetOrganPng = 'butterfly/organs/stomach.png';

    characterActionPng = 'butterfly/characters/action_eating.png';

    actionCalloutText = '🌶️ KONSUMSI CABAI / PEDAS EKSTREM';

    curiosityClue = 'Senyawa capsaicin konsentrasi tinggi langsung memicu reseptor panas di saluran cerna.';

    hookMysteryQuestion = 'Bagian tubuh mana yang menerima luka bakar kimiawi pertama kali?';

    naturalHeadline = 'APA JADINYA KALAU MAKAN PEDAS BERLEBIHAN?';

    highlightPhrase = 'PEDAS BERLEBIHAN?';

  }

  // 6. GULA / MINUMAN MANIS / SODA

  else if (/gula|manis|boba|soda|minuman kemasan/i.test(combined)) {

    mode = isExplicitMultiDayStreak ? 'streak-calendar' : 'empty-stomach-alert';

    emoji = /berhenti|tanpa|stop/i.test(combined) ? '🚫' : '🥤';

    itemLabel = /berhenti|tanpa|stop/i.test(combined) ? 'STOP KONSUMSI GULA' : 'LONJAKAN GULA & SODA';

    conditionLabel = /berhenti|tanpa|stop/i.test(combined) ? 'TUBUH DETOKS TANPA GULA' : 'LONJAKAN GULA DARAH EKSTREM';

    meterLabel = 'KADAR GULA & INSULIN DARAH';

    meterStartText = 'NORMAL';

    meterEndText = 'LONJAKAN!';

    targetOrganPng = 'butterfly/organs/pancreas.png';

    characterActionPng = 'butterfly/characters/action_drinking.png';

    actionCalloutText = '🥤 KONSUMSI GULA TINGGI';

    curiosityClue = 'Glukosa murni langsung diserap ke dalam aliran darah dalam hitungan menit.';

    hookMysteryQuestion = 'Organ tubuh mana yang dipaksa bekerja lembur menetralisir lonjakan ini?';

    naturalHeadline = 'APA JADINYA KALAU BERHENTI KONSUMSI GULA?';

    highlightPhrase = 'KONSUMSI GULA?';

  }

  // 7. ROKOK / VAPE

  else if (/rokok|merokok|vape|nikotin|asap/i.test(combined)) {

    mode = isExplicitMultiDayStreak ? 'streak-calendar' : 'empty-stomach-alert';

    emoji = '🚬';

    itemLabel = 'ASAP NIKOTIN & TAR';

    conditionLabel = 'PAPARAN LANGSUNG KE SALURAN NAPAS';

    meterLabel = 'PENURUNAN OKSIGEN & KAPASITAS PARU';

    meterStartText = 'BERSIH';

    meterEndText = 'TERCEMAR!';

    targetOrganPng = 'butterfly/organs/lungs.png';

    characterActionPng = 'butterfly/characters/action_sleepy.png';

    actionCalloutText = '🚬 MENGHIRUP ASAP NIKOTIN';

    curiosityClue = 'Ribuan partikel mikroskopis masuk dan menempel pada dinding kantung udara tubuh.';

    hookMysteryQuestion = 'Berapa lama waktu yang dibutuhkan tubuh untuk membersihkan racun ini?';

    naturalHeadline = 'APA JADINYA KALAU KAMU MEROKOK SETIAP HARI?';

    highlightPhrase = 'MEROKOK SETIAP HARI?';

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

    targetCount,

    unitWord,

    unitLabel,

    targetOrganPng,

    characterActionPng,

    actionCalloutText,

    curiosityClue,

    hookMysteryQuestion,

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

  // Physiological pulse

  const dynamicBpm = Math.round(72 + curvedProgress * 62);

  const beatPhase = (frame / fps) * (dynamicBpm / 60) * Math.PI * 2;

  const systolicBeat = Math.pow(Math.max(0, Math.sin(beatPhase)), 8);

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

  // 3D HUMAN ACTION CHARACTER COLUMN (Focus on Realistic Human Action & Suspense)

  // Instead of spoiling internal organs early, shows the real human physical activity!

  // ---------------------------------------------------------------------------

  const isDrinking = /drinking|kopi|minum/.test(scenario.characterActionPng);

  const isEating = /eating|makan|mie/.test(scenario.characterActionPng);

  const isHoldingPee = /holding_pee|kencing|pipis|bladder/.test(scenario.characterActionPng);

  const isSleepy = /sleepy|tidur|begadang|layar/.test(scenario.characterActionPng);

  const characterActionColumn = (

    <div

      style={{

        position: 'relative',

        width: '470px',

        height: '850px',

        display: 'flex',

        alignItems: 'center',

        justifyContent: 'center',

        transform: `scale(${0.97 + curvedProgress * 0.04 + systolicBeat * 0.01})`,

      }}

    >

      {/* Cinematic Studio Aura */}

      <div

        style={{

          position: 'absolute',

          width: '380px',

          height: '620px',

          borderRadius: '50%',

          background: `radial-gradient(circle, ${theme.primaryHighlight}33 0%, transparent 72%)`,

          filter: 'blur(28px)',

        }}

      />

      {/* 3D Realistic Character Cutout Performing the Action */}

      <div

        style={{

          position: 'relative',

          width: '440px',

          height: '760px',

          display: 'flex',

          alignItems: 'center',

          justifyContent: 'center',

          transform: isDrinking

            ? `rotate(${Math.sin(frame * 0.12) * 2}deg) translateY(${Math.sin(frame * 0.18) * 6}px)`

            : isEating

            ? `translateY(${Math.sin(frame * 0.28) * 8}px)`

            : isHoldingPee

            ? `translateX(${Math.sin(frame * 0.45) * 5}px) rotate(${Math.sin(frame * 0.22) * 2.5}deg)`

            : `rotate(${Math.sin(frame * 0.08) * 3}deg) translateY(${Math.sin(frame * 0.1) * 8}px)`,

          filter: 'drop-shadow(0 20px 35px rgba(0,0,0,0.85))',

        }}

      >

        <Img

          src={staticFile(scenario.characterActionPng)}

          style={{

            width: '100%',

            height: '100%',

            objectFit: 'contain',

          }}

        />

        {/* Action Specific Micro-Visual Dynamics */}

        {isDrinking && (

          /* Steam Rising from Hot Cup */

          <div

            style={{

              position: 'absolute',

              top: '180px',

              left: '52%',

              transform: 'translateX(-50%)',

              pointerEvents: 'none',

            }}

          >

            {[0, 1, 2].map((sIdx) => {

              const sProg = ((frame * 1.5 + sIdx * 20) % 60) / 60;

              return (

                <div

                  key={sIdx}

                  style={{

                    position: 'absolute',

                    top: `${-sProg * 50}px`,

                    left: `${Math.sin(sProg * Math.PI * 2) * 12}px`,

                    width: `${8 + sProg * 14}px`,

                    height: `${14 + sProg * 20}px`,

                    borderRadius: '50%',

                    background: 'rgba(255, 255, 255, 0.45)',

                    filter: 'blur(5px)',

                    opacity: 1 - sProg,

                  }}

                />

              );

            })}

          </div>

        )}

        {isSleepy && (

          /* Smartphone Screen Glow & Floating Zzz */

          <div

            style={{

              position: 'absolute',

              top: '220px',

              right: '80px',

              fontFamily: "'Space Grotesk', monospace",

              fontSize: '28px',

              fontWeight: 900,

              color: '#38bdf8',

              opacity: (Math.sin(frame * 0.15) + 1) * 0.5,

              textShadow: '0 0 12px #38bdf8',

            }}

          >

            Zzz...

          </div>

        )}

        {isHoldingPee && (

          /* Nervous Agitation Pulses on Abdomen */

          <div

            style={{

              position: 'absolute',

              bottom: '220px',

              left: '50%',

              transform: 'translateX(-50%)',

              width: '120px',

              height: '120px',

              borderRadius: '50%',

              border: `2.5px solid ${theme.primaryHighlight}`,

              opacity: (Math.sin(frame * 0.35) + 1) * 0.45,

              filter: `drop-shadow(0 0 10px ${theme.primaryHighlight})`,

            }}

          />

        )}

      </div>

      {/* Floating Tactical Human Action Pill (Non-Spoiler!) */}

      <div

        style={{

          position: 'absolute',

          bottom: '24px',

          left: '50%',

          transform: 'translateX(-50%)',

          backgroundColor: theme.specimenBg,

          border: `2px solid ${theme.primaryHighlight}`,

          padding: '8px 18px',

          borderRadius: '4px',

          fontFamily: "'Space Grotesk', monospace",

          fontSize: '13px',

          fontWeight: 900,

          color: '#F4F0EA',

          letterSpacing: '0.8px',

          whiteSpace: 'nowrap',

          boxShadow: `0 8px 24px rgba(0,0,0,0.8), 4px 4px 0px ${theme.inkDark}`,

        }}

      >

        {scenario.actionCalloutText}

      </div>

    </div>

  );

  // ---------------------------------------------------------------------------

  // ---------------------------------------------------------------------------

  // TOPIC-SPECIFIC HOOK VISUAL CARD (Pembangkit Rasa Penasaran Murni ? Tanpa Bocoran Organ/Gejala!)

  // ---------------------------------------------------------------------------

  const renderTopicSpecificCardContent = () => {

    const meterPercent = Math.round(20 + curvedProgress * 76);

    return (

      <>

        {/* Top Status Header: Trigger Subject & Condition */}

        <div

          style={{

            backgroundColor: theme.specimenBg,

            padding: '18px 20px',

            borderRadius: '4px',

            border: `2px solid ${theme.inkDark}`,

            display: 'flex',

            alignItems: 'center',

            justifyContent: 'space-between',

            gap: '14px',

          }}

        >

          <div

            style={{

              fontSize: '64px',

              lineHeight: 1,

              transform: `scale(${1 + Math.sin(frame * 0.3) * 0.08}) rotate(${Math.sin(frame * 0.2) * 4}deg)`,

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

                letterSpacing: '0.5px',

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

        {/* Live Tension / Pressure Gauge (Indikator Eskalasi Bahaya Meningkat) */}

        <div

          style={{

            backgroundColor: '#E5E0D5',

            padding: '14px 16px',

            borderRadius: '4px',

            border: `2px solid ${theme.inkDark}`,

          }}

        >

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>

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

              height: '18px',

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

        {/* Curiosity Booster Box (Mengundang Rasa Penasaran Penonton Tanpa Spoiler Organ/Gejala!) */}

        <div

          style={{

            display: 'flex',

            flexDirection: 'column',

            gap: '14px',

            backgroundColor: '#E5E0D5',

            padding: '16px 18px',

            borderRadius: '4px',

            border: `2px solid ${theme.inkDark}`,

          }}

        >

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>

            <span

              style={{

                backgroundColor: theme.specimenBg,

                color: '#F4F0EA',

                fontFamily: "'Space Grotesk', monospace",

                fontSize: '11px',

                fontWeight: 900,

                padding: '3px 8px',

                borderRadius: '2px',

                letterSpacing: '1px',

              }}

            >

              INVESTIGASI TUBUH

            </span>

            <span style={{ fontFamily: "'Space Grotesk', monospace", fontSize: '12px', fontWeight: 800, color: theme.inkDark }}>

              FAKTA MEDIS AWAL

            </span>

          </div>

          <div

            style={{

              fontFamily: "'Montserrat', sans-serif",

              fontSize: '15px',

              fontWeight: 800,

              color: '#27272a',

              lineHeight: 1.35,

            }}

          >

            "{scenario.curiosityClue}"

          </div>

          <div

            style={{

              backgroundColor: theme.specimenBg,

              padding: '14px 16px',

              borderRadius: '3px',

              border: `2px solid ${theme.inkDark}`,

              display: 'flex',

              alignItems: 'center',

              gap: '12px',

              boxShadow: `4px 4px 0px ${theme.primaryHighlight}`,

            }}

          >

            <span style={{ fontSize: '28px', lineHeight: 1 }}>?</span>

            <span

              style={{

                fontFamily: "'Montserrat', sans-serif",

                fontSize: '15px',

                fontWeight: 900,

                color: theme.primaryHighlight,

                lineHeight: 1.25,

              }}

            >

              {scenario.hookMysteryQuestion}

            </span>

          </div>

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

          3. CENTER STAGE: 3D REALISTIC HUMAN ACTION + TOPIC-SPECIFIC HOOK VISUAL

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

            {characterActionColumn}

          </>

        ) : (

          <>

            {characterActionColumn}

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
