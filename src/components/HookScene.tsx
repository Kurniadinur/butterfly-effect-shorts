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
  hookItemEmoji?: string | null;
  hookItemLabel?: string | null;
  hookTargetCount?: number | null;
  hookUnitLabel?: string | null;
  durationFrames?: number;
}

interface ParsedHookScenario {
  emoji: string;
  itemLabel: string;
  targetCount: number;
  unitWord: string;
  unitLabel: string;
  targetOrganPng: string;
  naturalHeadline: string;
  highlightPhrase: string;
}

/**
 * Automatically extracts the trigger item, multiplier number (×1..×30 / 72 Jam / 7 Hari),
 * target organ, and natural human Indonesian headline from ANY topic or storyboard!
 */
function parseHookScenarioFromTopic(
  headline: string,
  narration: string,
  overrideEmoji?: string | null,
  overrideLabel?: string | null,
  overrideCount?: number | null,
  overrideUnit?: string | null
): ParsedHookScenario {
  const combined = `${headline} ${narration}`.toLowerCase();

  // 1. Detect Number & Unit (e.g. "30 hari", "sebulan", "72 jam", "seminggu", "10 gelas")
  let targetCount = overrideCount || 30;
  let unitWord = 'HARI';
  let unitLabel = overrideUnit || '30 HARI NON-STOP';

  const numMatch = combined.match(/(\d+)\s*(hari|jam|minggu|bulan|tahun|bungkus|gelas|kaleng|cangkir|kali|batang|botol|porsi|piring)/i);
  if (overrideCount) {
    targetCount = overrideCount;
  } else if (numMatch) {
    targetCount = Math.max(2, Math.min(365, parseInt(numMatch[1], 10)));
    unitWord = numMatch[2].toUpperCase();
    unitLabel = `${targetCount} ${unitWord} NON-STOP`;
  } else if (/sebulan|satu bulan|setiap hari|tiap hari|terus menerus|terus-menerus/i.test(combined)) {
    targetCount = 30;
    unitWord = 'HARI';
    unitLabel = '30 HARI NON-STOP';
  } else if (/seminggu|satu minggu|7 hari/i.test(combined)) {
    targetCount = 7;
    unitWord = 'HARI';
    unitLabel = '7 HARI NON-STOP';
  } else if (/seharian|24 jam/i.test(combined)) {
    targetCount = 24;
    unitWord = 'JAM';
    unitLabel = '24 JAM NON-STOP';
  } else if (/3 hari|72 jam/i.test(combined)) {
    targetCount = 72;
    unitWord = 'JAM';
    unitLabel = '72 JAM NON-STOP';
  }

  // 2. Comprehensive Trigger Dictionary (Covers 25+ everyday Indonesian health/body topics)
  let emoji = overrideEmoji || '⚡';
  let itemLabel = overrideLabel || `${unitWord} BERUNTUN`;
  let targetOrganPng = 'butterfly/organs/stomach.png';
  let naturalHeadline = headline;
  let highlightPhrase = `${targetCount} ${unitWord}`;

  if (/mie|mi instan|indomie|ramen/i.test(combined)) {
    emoji = overrideEmoji || '🍜';
    itemLabel = overrideLabel || 'BUNGKUS MIE';
    targetOrganPng = 'butterfly/organs/stomach.png';
    naturalHeadline = `APA JADINYA KALAU KAMU MAKAN MIE ${targetCount} ${unitWord} TERUS-MENERUS?`;
    highlightPhrase = `${targetCount} ${unitWord} TERUS-MENERUS?`;
  } else if (/tidur|begadang|insomnia|melek/i.test(combined)) {
    emoji = overrideEmoji || '🪫';
    if (!overrideCount && !numMatch) {
      targetCount = 72;
      unitWord = 'JAM';
      unitLabel = '72 JAM NON-STOP';
    }
    itemLabel = overrideLabel || 'JAM BEGADANG';
    targetOrganPng = 'butterfly/organs/brain.png';
    naturalHeadline = `APA JADINYA KALAU KAMU TIDAK TIDUR ${targetCount} ${unitWord} NON-STOP?`;
    highlightPhrase = `${targetCount} ${unitWord} NON-STOP?`;
  } else if (/rokok|merokok|vape|nikotin|asap/i.test(combined)) {
    emoji = overrideEmoji || '🚬';
    itemLabel = overrideLabel || 'BATANG ROKOK';
    targetOrganPng = 'butterfly/organs/lungs.png';
    naturalHeadline = `APA JADINYA KALAU KAMU MEROKOK ${targetCount} ${unitWord} TERUS-MENERUS?`;
    highlightPhrase = `${targetCount} ${unitWord} TERUS-MENERUS?`;
  } else if (/kopi|kafein|energy drink|minuman energi/i.test(combined)) {
    emoji = overrideEmoji || '☕';
    itemLabel = overrideLabel || 'GELAS KOPI';
    targetOrganPng = /perut kosong|lambung|pagi/i.test(combined)
      ? 'butterfly/organs/stomach.png'
      : 'butterfly/organs/heart.png';
    naturalHeadline = /perut kosong/i.test(combined)
      ? `APA JADINYA MINUM KOPI SAAT PERUT KOSONG ${targetCount} ${unitWord}?`
      : `APA JADINYA KALAU MINUM KOPI ${targetCount} ${unitWord} BERTURUT-TURUT?`;
    highlightPhrase = `${targetCount} ${unitWord}`;
  } else if (/berhenti.*gula|tanpa gula|stop gula|puasa gula/i.test(combined)) {
    emoji = overrideEmoji || '🚫';
    itemLabel = overrideLabel || 'HARI TANPA GULA';
    targetOrganPng = 'butterfly/organs/liver.png';
    naturalHeadline = `APA JADINYA KALAU BERHENTI MAKAN GULA SELAMA ${targetCount} ${unitWord}?`;
    highlightPhrase = `SELAMA ${targetCount} ${unitWord}?`;
  } else if (/gula|manis|boba|soda|minuman kemasan|sirup/i.test(combined)) {
    emoji = overrideEmoji || '🥤';
    itemLabel = overrideLabel || 'MINUMAN MANIS';
    targetOrganPng = 'butterfly/organs/liver.png';
    naturalHeadline = `APA JADINYA KALAU MINUM SODA & MANIS ${targetCount} ${unitWord} NON-STOP?`;
    highlightPhrase = `${targetCount} ${unitWord} NON-STOP?`;
  } else if (/air putih|dehidrasi|kurang minum|haus/i.test(combined)) {
    emoji = overrideEmoji || '💧';
    itemLabel = overrideLabel || 'KURANG MINUM AIR';
    targetOrganPng = 'butterfly/organs/kidneys.png';
    naturalHeadline = `APA JADINYA KALAU JARANG MINUM AIR PUTIH SELAMA ${targetCount} ${unitWord}?`;
    highlightPhrase = `SELAMA ${targetCount} ${unitWord}?`;
  } else if (/pedas|cabai|sambal|seblak|level/i.test(combined)) {
    emoji = overrideEmoji || '🌶️';
    itemLabel = overrideLabel || 'PORSI PEDAS';
    targetOrganPng = 'butterfly/organs/stomach.png';
    naturalHeadline = `APA JADINYA KALAU MAKAN PEDAS ${targetCount} ${unitWord} TERUS-MENERUS?`;
    highlightPhrase = `${targetCount} ${unitWord} TERUS-MENERUS?`;
  } else if (/tahan kencing|menahan kencing|menahan buang air/i.test(combined)) {
    emoji = overrideEmoji || '🚽';
    if (!overrideCount && !numMatch) {
      targetCount = 12;
      unitWord = 'JAM';
      unitLabel = '12 JAM MENAHAN KENCING';
    }
    itemLabel = overrideLabel || 'JAM TAHAN KENCING';
    targetOrganPng = 'butterfly/organs/kidneys.png';
    naturalHeadline = `APA JADINYA KALAU MENAHAN KENCING TERLALU LAMA?`;
    highlightPhrase = `TERLALU LAMA?`;
  } else if (/gorengan|junk food|fast food|minyak|kolesterol/i.test(combined)) {
    emoji = overrideEmoji || '🍟';
    itemLabel = overrideLabel || 'PORSI GORENGAN';
    targetOrganPng = 'butterfly/organs/heart.png';
    naturalHeadline = `APA JADINYA KALAU MAKAN GORENGAN ${targetCount} ${unitWord} NON-STOP?`;
    highlightPhrase = `${targetCount} ${unitWord} NON-STOP?`;
  } else if (/alkohol|miras|bir/i.test(combined)) {
    emoji = overrideEmoji || '🍺';
    itemLabel = overrideLabel || 'GELAS ALKOHOL';
    targetOrganPng = 'butterfly/organs/liver.png';
    naturalHeadline = `APA JADINYA KALAU MINUM ALKOHOL ${targetCount} ${unitWord} BERTURUT-TURUT?`;
    highlightPhrase = `${targetCount} ${unitWord} BERTURUT-TURUT?`;
  } else if (/rebahan|malas gerak|tiduran|duduk terus/i.test(combined)) {
    emoji = overrideEmoji || '🛋️';
    itemLabel = overrideLabel || 'HARI REBAHAN';
    targetOrganPng = 'butterfly/organs/heart.png';
    naturalHeadline = `APA JADINYA KALAU REBAHAN TERUS SELAMA ${targetCount} ${unitWord}?`;
    highlightPhrase = `SELAMA ${targetCount} ${unitWord}?`;
  } else if (/hp|layar|gadget|main game|scroll/i.test(combined)) {
    emoji = overrideEmoji || '📱';
    if (!overrideCount && !numMatch) {
      targetCount = 16;
      unitWord = 'JAM';
      unitLabel = '16 JAM NON-STOP';
    }
    itemLabel = overrideLabel || 'JAM LAYAR HP';
    targetOrganPng = 'butterfly/organs/brain.png';
    naturalHeadline = `APA JADINYA MAIN HP DI TEMPAT GELAP ${targetCount} ${unitWord} TIAP HARI?`;
    highlightPhrase = `${targetCount} ${unitWord} TIAP HARI?`;
  } else if (/telur/i.test(combined)) {
    emoji = overrideEmoji || '🥚';
    itemLabel = overrideLabel || 'BUTIR TELUR';
    targetOrganPng = 'butterfly/organs/liver.png';
    naturalHeadline = `APA JADINYA KALAU MAKAN TELUR ${targetCount} ${unitWord} BERTURUT-TURUT?`;
    highlightPhrase = `${targetCount} ${unitWord} BERTURUT-TURUT?`;
  } else if (/puasa|tidak makan|berhenti makan/i.test(combined)) {
    emoji = overrideEmoji || '⏳';
    if (!overrideCount && !numMatch) {
      targetCount = 72;
      unitWord = 'JAM';
      unitLabel = '72 JAM TANPA MAKAN';
    }
    itemLabel = overrideLabel || 'JAM TANPA MAKAN';
    targetOrganPng = 'butterfly/organs/stomach.png';
    naturalHeadline = `APA JADINYA KALAU TIDAK MAKAN SELAMA ${targetCount} ${unitWord}?`;
    highlightPhrase = `SELAMA ${targetCount} ${unitWord}?`;
  } else {
    // Universal dynamic extractor for any other topic so no manual dictation is ever needed
    const cleanedRaw = headline
      .replace(/^(bagaimana keadaan tubuhmu ketika|apa yang terjadi pada tubuhmu jika|apa yang terjadi jika|bagaimana jika)\s*/i, '')
      .replace(/:.*$/, '')
      .replace(/\?+$/, '')
      .trim();
    if (cleanedRaw.length > 4) {
      naturalHeadline = `APA JADINYA KALAU ${cleanedRaw.toUpperCase()}?`;
      const words = naturalHeadline.split(/\s+/);
      highlightPhrase = words.slice(Math.max(1, words.length - 3)).join(' ');
    }
  }

  // Clean up any robotic AI headline patterns automatically
  const isStiffAiHeadline = /:|mengancam nyawamu|eksperimen|simulasi|bagaimana keadaan tubuhmu/i.test(headline);
  const finalHeadline = isStiffAiHeadline ? naturalHeadline : headline.toUpperCase();

  return {
    emoji,
    itemLabel: itemLabel.replace(/eksperimen|target utama/gi, '').trim(),
    targetCount,
    unitWord,
    unitLabel: unitLabel.replace(/eksperimen/gi, '').trim(),
    targetOrganPng,
    naturalHeadline: finalHeadline,
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
  hookItemEmoji,
  hookItemLabel,
  hookTargetCount,
  hookUnitLabel,
  durationFrames = 250,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const rawH = rawHeadline || rightTitle || leftTitle || 'APA JADINYA KALAU KAMU MAKAN MIE 30 HARI TERUS-MENERUS?';
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
        hookItemEmoji,
        hookItemLabel,
        hookTargetCount,
        hookUnitLabel
      ),
    [headlineInput, narration, hookItemEmoji, hookItemLabel, hookTargetCount, hookUnitLabel]
  );

  // Smooth spring entrance
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

  // Subtle physiological pulse
  const dynamicBpm = Math.round(72 + curvedProgress * 65);
  const beatPhase = (frame / fps) * (dynamicBpm / 60) * Math.PI * 2;
  const systolicBeat = Math.pow(Math.max(0, Math.sin(beatPhase)), 8);

  // 30-slot visual grid
  const totalGridSlots = Math.min(30, Math.max(12, scenario.targetCount > 30 ? 30 : scenario.targetCount));
  const activeGridSlots = Math.max(1, Math.round(curvedProgress * totalGridSlots));

  // Rapid-fire flying items streaming into the 3D human body's mouth & down the esophagus
  const streamItems = useMemo(() => {
    return Array.from({ length: 6 }).map((_, i) => ({
      id: i,
      offset: i * 15,
      curveX: (i % 2 === 0 ? 1 : -1) * (25 + (i % 3) * 18),
    }));
  }, []);

  // Split headline to highlight the bottom/key phrase in the active theme's highlight color
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

  // Layout variation: whether the 3D body is on the left or right so different videos feel freshly edited!
  const isBodyOnRight = theme.hookLayout === 'dossier-left-body-right';

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
      {/* Subtle Studio Spotlight Behind 3D Body */}
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

      {/* 3D Organ Inside Body Glowing Gently as Item Enters */}
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

      {/* Rapid-Fire Ingestion Stream: Items Flying into the Mouth -> Down Esophagus -> Organ! */}
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

  const counterColumn = (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '18px',
        backgroundColor: theme.cardBg,
        border: theme.cardBorder,
        borderTop: theme.cardTopAccentBar ? `8px solid ${theme.cardTopAccentBar}` : theme.cardBorder,
        borderLeft: theme.cardLeftAccentSpine ? `9px solid ${theme.cardLeftAccentSpine}` : theme.cardBorder,
        borderRadius: theme.cardRadius,
        padding: '22px 18px',
        boxShadow: theme.cardShadow,
      }}
    >
      {/* Giant Multiplier Counter: ×1, ×2, ×3 ... ×N */}
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
              transform: `scale(${1 + (frame % 6 === 0 && rawProgress < 1 ? 0.07 : 0)})`,
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

      {/* 30-Slot Stamp Grid (#1, #2, #3 ... #30) */}
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
          <span
            style={{
              fontFamily: "'Space Grotesk', monospace",
              fontSize: '13px',
              fontWeight: 900,
              color: theme.inkDark,
              letterSpacing: '0.8px',
            }}
          >
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

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(6, 1fr)',
            gap: '8px',
          }}
        >
          {Array.from({ length: totalGridSlots }).map((_, idx) => {
            const isLit = idx < activeGridSlots;
            const isNewest = idx === activeGridSlots - 1;
            return (
              <div
                key={idx}
                style={{
                  height: '62px',
                  borderRadius: '3px',
                  backgroundColor: isLit
                    ? isNewest
                      ? theme.primaryHighlight
                      : theme.specimenBg
                    : '#E5E0D5',
                  border: `2px solid ${theme.inkDark}`,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transform: isNewest ? 'scale(1.08)' : 'scale(1)',
                  opacity: isLit ? 1 : 0.45,
                  boxShadow: isNewest ? `3px 3px 0px ${theme.inkDark}` : 'none',
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
          2. CLEAN HUMAN-EDITED TITLE (Natural question, zero "EKSPERIMEN" badge)
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
          3. CENTER STAGE: DYNAMIC MULTI-LAYOUT 3D BODY + MULTIPLIER CARD
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
