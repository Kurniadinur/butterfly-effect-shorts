import React, { useMemo } from 'react';
import { Img, useCurrentFrame, useVideoConfig, staticFile, interpolate, spring } from 'remotion';

export interface HookSceneProps {
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
  unitLabel: string;
  targetOrganPng: string;
  naturalHeadline: string;
  highlightPhrase: string;
}

/**
 * Extracts the trigger item, multiplier number (×1..×30 / 72 Jam / 7 Hari),
 * and generates a natural, human-written title (never stiff AI phrasing).
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

  // 1. Detect Number & Unit (e.g. "30 hari", "sebulan", "72 jam", "seminggu")
  let targetCount = overrideCount || 30;
  let unitLabel = overrideUnit || '30 HARI NON-STOP';

  if (!overrideCount) {
    const numMatch = combined.match(/(\d+)\s*(hari|jam|minggu|bulan|tahun|bungkus|gelas|kaleng|cangkir|kali|batang)/i);
    if (numMatch) {
      targetCount = Math.max(2, Math.min(365, parseInt(numMatch[1], 10)));
      const rawUnit = numMatch[2].toUpperCase();
      unitLabel = `${targetCount} ${rawUnit} NON-STOP`;
    } else if (/sebulan|satu bulan|setiap hari/i.test(combined)) {
      targetCount = 30;
      unitLabel = '30 HARI NON-STOP';
    } else if (/seminggu|satu minggu/i.test(combined)) {
      targetCount = 7;
      unitLabel = '7 HARI NON-STOP';
    } else if (/seharian|24 jam/i.test(combined)) {
      targetCount = 24;
      unitLabel = '24 JAM NON-STOP';
    }
  }

  // 2. Detect Trigger Subject with natural everyday Indonesian labels
  let emoji = overrideEmoji || '🍜';
  let itemLabel = overrideLabel || 'BUNGKUS MIE';
  let targetOrganPng = 'butterfly/organs/stomach.png';
  let naturalHeadline = headline;
  let highlightPhrase = `${targetCount} HARI`;

  if (/mie|mi instan|indomie|ramen/i.test(combined)) {
    emoji = overrideEmoji || '🍜';
    itemLabel = overrideLabel || 'BUNGKUS MIE';
    targetOrganPng = 'butterfly/organs/stomach.png';
    naturalHeadline = `APA JADINYA KALAU KAMU MAKAN MIE ${targetCount} HARI TERUS-MENERUS?`;
    highlightPhrase = `${targetCount} HARI TERUS-MENERUS?`;
  } else if (/tidur|begadang|insomnia/i.test(combined)) {
    emoji = overrideEmoji || '🪫';
    if (!overrideCount && targetCount === 30) {
      targetCount = 72;
      unitLabel = '72 JAM NON-STOP';
    }
    itemLabel = overrideLabel || 'JAM BEGADANG';
    targetOrganPng = 'butterfly/organs/brain.png';
    naturalHeadline = `APA JADINYA KALAU KAMU TIDAK TIDUR ${targetCount} JAM NON-STOP?`;
    highlightPhrase = `${targetCount} JAM NON-STOP?`;
  } else if (/rokok|merokok|vape|nikotin|asap/i.test(combined)) {
    emoji = overrideEmoji || '🚬';
    itemLabel = overrideLabel || 'BATANG ROKOK';
    targetOrganPng = 'butterfly/organs/lungs.png';
    naturalHeadline = `APA JADINYA KALAU KAMU MEROKOK ${targetCount} HARI TERUS-MENERUS?`;
    highlightPhrase = `${targetCount} HARI TERUS-MENERUS?`;
  } else if (/kopi|kafein|energy drink|minuman energi/i.test(combined)) {
    emoji = overrideEmoji || '☕';
    itemLabel = overrideLabel || 'GELAS KOPI';
    targetOrganPng = 'butterfly/organs/heart.png';
    naturalHeadline = `APA JADINYA KALAU KAMU MINUM KOPI ${targetCount} HARI BERTURUT-TURUT?`;
    highlightPhrase = `${targetCount} HARI BERTURUT-TURUT?`;
  } else if (/gula|manis|boba|soda|minuman kemasan/i.test(combined)) {
    emoji = overrideEmoji || '🥤';
    itemLabel = overrideLabel || 'MINUMAN MANIS';
    targetOrganPng = 'butterfly/organs/liver.png';
    naturalHeadline = `APA JADINYA KALAU MINUM MANIS ${targetCount} HARI TERUS-MENERUS?`;
    highlightPhrase = `${targetCount} HARI TERUS-MENERUS?`;
  } else if (/air putih|dehidrasi|kurang minum|haus/i.test(combined)) {
    emoji = overrideEmoji || '💧';
    itemLabel = overrideLabel || 'HARI KURANG MINUM';
    targetOrganPng = 'butterfly/organs/kidneys.png';
    naturalHeadline = `APA JADINYA KALAU JARANG MINUM AIR PUTIH SELAMA ${targetCount} HARI?`;
    highlightPhrase = `SELAMA ${targetCount} HARI?`;
  } else if (/pedas|cabai|sambal|seblak/i.test(combined)) {
    emoji = overrideEmoji || '🌶️';
    itemLabel = overrideLabel || 'PORSI PEDAS';
    targetOrganPng = 'butterfly/organs/stomach.png';
    naturalHeadline = `APA JADINYA KALAU MAKAN PEDAS ${targetCount} HARI TERUS-MENERUS?`;
    highlightPhrase = `${targetCount} HARI TERUS-MENERUS?`;
  }

  // If the provided headline already uses natural phrasing ("APA JADINYA...") without stiff AI colons ("SETIAP HARI: APAKAH..."), keep it
  const isStiffAiHeadline = /:|mengancam nyawamu|eksperimen|setiap hari/i.test(headline);
  const finalHeadline = isStiffAiHeadline ? naturalHeadline : headline;

  return {
    emoji,
    itemLabel,
    targetCount,
    unitLabel,
    targetOrganPng,
    naturalHeadline: finalHeadline,
    highlightPhrase,
  };
}

export const HookScene: React.FC<HookSceneProps> = ({
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
  // so viewers watch the multiplier climb ×1, ×2, ×3 ... up to ×30!
  const rampEndFrame = Math.max(90, Math.round(durationFrames * 0.68));
  const rawProgress = Math.min(1, Math.max(0, frame / rampEndFrame));
  const curvedProgress = 1 - Math.pow(1 - rawProgress, 1.85);
  const currentCount = Math.max(1, Math.round(1 + curvedProgress * (scenario.targetCount - 1)));

  // Subtle physiological pulse as the multiplier climbs
  const dynamicBpm = Math.round(72 + curvedProgress * 65);
  const beatPhase = (frame / fps) * (dynamicBpm / 60) * Math.PI * 2;
  const systolicBeat = Math.pow(Math.max(0, Math.sin(beatPhase)), 8);

  // Generate a 30-slot visual grid (5 columns x 6 rows) of rapid-fire multiplying items!
  const totalGridSlots = Math.min(30, Math.max(12, scenario.targetCount > 30 ? 30 : scenario.targetCount));
  const activeGridSlots = Math.max(1, Math.round(curvedProgress * totalGridSlots));

  // Rapid-fire flying items streaming into the 3D human body's mouth & down the esophagus!
  const streamItems = useMemo(() => {
    return Array.from({ length: 6 }).map((_, i) => ({
      id: i,
      offset: i * 15,
      curveX: (i % 2 === 0 ? 1 : -1) * (25 + (i % 3) * 18),
    }));
  }, []);

  // Split headline to highlight the bottom/key phrase in Vox Yellow
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
    return { before: full, highlighted: '' };
  }, [scenario.naturalHeadline, scenario.highlightPhrase]);

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: 'radial-gradient(circle at 50% 42%, #1a1b1f 0%, #101114 68%, #090a0c 100%)',
        overflow: 'hidden',
        perspective: '1200px',
      }}
    >
      {/* 1. Editorial Dot-Matrix Texture */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'radial-gradient(rgba(244, 240, 234, 0.08) 1.5px, transparent 1.5px)',
          backgroundSize: '36px 36px',
          pointerEvents: 'none',
        }}
      />

      {/* =====================================================================
          2. CLEAN HUMAN-EDITED TITLE (No "EKSPERIMEN" badge, natural question!)
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
            color: '#F4F0EA',
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
                backgroundColor: '#FFCC00',
                color: '#111215',
                padding: '2px 12px',
                borderRadius: '3px',
                border: '2px solid #111215',
                boxShadow: '4px 4px 0px #111215',
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
          3. CENTER STAGE: 3D HUMAN EATING NOODLES + ×1..×30 MULTIPLIER CARD
             (Zero spoilers about organs/diseases — pure Hook animation!)
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
          gridTemplateColumns: '470px 1fr',
          gap: '20px',
          alignItems: 'center',
        }}
      >
        {/* LEFT COLUMN: Clean 3D Translucent Human Body Eating the Item (No spoiler text box!) */}
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

          {/* 3D Organ Inside Body Glowing Gently as Food Enters */}
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
              filter: `drop-shadow(0 0 ${8 + curvedProgress * 16}px #FFCC00) saturate(${1.1 + curvedProgress * 0.35})`,
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

          {/* Rapid-Fire Ingestion Stream: Items Flying into the Mouth -> Down Esophagus -> Stomach! */}
          {streamItems.map((item) => {
            const cycle = ((frame + item.offset) % 48) / 48;
            const mouthX = 235;
            const mouthY = 205;
            const organY =
              scenario.targetOrganPng.includes('brain')
                ? 175
                : scenario.targetOrganPng.includes('lungs') || scenario.targetOrganPng.includes('heart')
                ? 305
                : 395;

            const curX =
              cycle < 0.6
                ? interpolate(cycle, [0, 0.6], [445, mouthX])
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

        {/* RIGHT COLUMN: CLEAN ×1 TO ×30 COUNTER & 30-DAY CALENDAR GRID */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '18px',
            backgroundColor: '#F4F0EA',
            border: '3px solid #111215',
            borderRadius: '6px',
            padding: '22px 18px',
            boxShadow: '12px 12px 0px #111215, 0 24px 50px rgba(0,0,0,0.65)',
          }}
        >
          {/* Giant Multiplier Counter: ×1, ×2, ×3 ... ×30 */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: '#16181D',
              padding: '18px 20px',
              borderRadius: '4px',
              border: '2px solid #111215',
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
                  color: curvedProgress >= 0.75 ? '#FF3B30' : '#FFCC00',
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
                borderBottom: '2px solid #111215',
                paddingBottom: '8px',
              }}
            >
              <span
                style={{
                  fontFamily: "'Space Grotesk', monospace",
                  fontSize: '13px',
                  fontWeight: 900,
                  color: '#111215',
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
                  color: '#111215',
                  backgroundColor: '#FFCC00',
                  border: '1.5px solid #111215',
                  padding: '2px 10px',
                  borderRadius: '2px',
                }}
              >
                HARI {currentCount}/{scenario.targetCount}
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
                          ? '#FFCC00'
                          : '#16181D'
                        : '#E5E0D5',
                      border: '2px solid #111215',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transform: isNewest ? 'scale(1.08)' : 'scale(1)',
                      opacity: isLit ? 1 : 0.45,
                      boxShadow: isNewest ? '3px 3px 0px #111215' : 'none',
                    }}
                  >
                    <span style={{ fontSize: '24px', lineHeight: 1 }}>{scenario.emoji}</span>
                    <span
                      style={{
                        fontFamily: "'Space Grotesk', monospace",
                        fontSize: '11px',
                        fontWeight: 900,
                        color: isLit ? (isNewest ? '#111215' : '#F4F0EA') : '#71717a',
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
