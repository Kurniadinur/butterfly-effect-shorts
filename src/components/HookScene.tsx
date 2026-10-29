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
  targetOrganName: string;
  accentColor: string;
  dangerText: string;
}

/**
 * Automatically extracts the trigger item, multiplier number (×1..×30 / 72 Jam / 7 Hari),
 * and target organ from ANY Indonesian medical hook headline or narration!
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
  let unitLabel = overrideUnit || 'HARI BERTURUT-TURUT';

  if (!overrideCount) {
    const numMatch = combined.match(/(\d+)\s*(hari|jam|minggu|bulan|tahun|bungkus|gelas|kaleng|cangkir|kali|batang)/i);
    if (numMatch) {
      targetCount = Math.max(2, Math.min(365, parseInt(numMatch[1], 10)));
      const rawUnit = numMatch[2].toUpperCase();
      unitLabel = `${rawUnit} NON-STOP`;
    } else if (/sebulan|satu bulan|setiap hari/i.test(combined)) {
      targetCount = 30;
      unitLabel = 'HARI BERTURUT-TURUT';
    } else if (/seminggu|satu minggu/i.test(combined)) {
      targetCount = 7;
      unitLabel = 'HARI NON-STOP';
    } else if (/seharian|24 jam/i.test(combined)) {
      targetCount = 24;
      unitLabel = 'JAM BERTURUT-TURUT';
    }
  }

  // 2. Detect Trigger Subject (Noodles, Sleep, Coffee, Smoking, Sugar, Water, Soda, Spicy, etc.)
  let emoji = overrideEmoji || '🍜';
  let itemLabel = overrideLabel || 'KONSUMSI BERUNTUN';
  let targetOrganPng = 'butterfly/organs/intestines.png';
  let targetOrganName = 'LAMBUNG & USUS';
  let accentColor = '#f59e0b';
  let dangerText = 'AKUMULASI ZAT ADITIF & MIKROPLASTIK';

  if (/mie|mi instan|indomie|ramen/i.test(combined)) {
    emoji = overrideEmoji || '🍜';
    itemLabel = overrideLabel || 'BUNGKUS MIE INSTAN';
    targetOrganPng = 'butterfly/organs/intestines.png';
    targetOrganName = 'LAMBUNG & USUS HALUS';
    accentColor = '#f59e0b';
    dangerText = 'LONJAKAN NATRIUM, PENGAWET & MIKROPLASTIK';
  } else if (/tidur|begadang|insomnia/i.test(combined)) {
    emoji = overrideEmoji || '🪫';
    itemLabel = overrideLabel || 'JAM TANPA TIDUR';
    if (!overrideCount && targetCount === 30) {
      targetCount = 72;
      unitLabel = 'JAM TANPA TIDUR';
    }
    targetOrganPng = 'butterfly/organs/brain.png';
    targetOrganName = 'OTAK & SARAF PUSAT';
    accentColor = '#38bdf8';
    dangerText = 'PENUMPUKAN RACun BETA-AMILOID DI OTAK';
  } else if (/rokok|merokok|vape|nikotin|asap/i.test(combined)) {
    emoji = overrideEmoji || '🚬';
    itemLabel = overrideLabel || 'PAPARAN NIKOTIN & TAR';
    targetOrganPng = 'butterfly/organs/lungs.png';
    targetOrganName = 'PARU-PARU & ALVEOLI';
    accentColor = '#fb7185';
    dangerText = 'ENDAPAN TAR & KERUSAKAN JARINGAN PARU';
  } else if (/kopi|kafein|energy drink|minuman energi/i.test(combined)) {
    emoji = overrideEmoji || '☕';
    itemLabel = overrideLabel || 'DOSIS KAFEIN BERLEBIH';
    targetOrganPng = 'butterfly/organs/heart.png';
    targetOrganName = 'JANTUNG & PEMBULUH DARAH';
    accentColor = '#f43f5e';
    dangerText = 'LONJAKAN ADRENALIN & DETAK JANTUNG EKSTREM';
  } else if (/gula|manis|boba|soda|minuman kemasan/i.test(combined)) {
    emoji = overrideEmoji || '🥤';
    itemLabel = overrideLabel || 'LONJAKAN GULA DARAH';
    targetOrganPng = 'butterfly/organs/liver.png';
    targetOrganName = 'HATI (LIVER) & PANKREAS';
    accentColor = '#ec4899';
    dangerText = 'RESISTENSI INSULIN & PERLEMAKAN HATI';
  } else if (/air putih|dehidrasi|kurang minum|haus/i.test(combined)) {
    emoji = overrideEmoji || '💧';
    itemLabel = overrideLabel || 'DEFISIT CAIRAN TUBUH';
    targetOrganPng = 'butterfly/organs/kidneys.png';
    targetOrganName = 'GINJAL & FILTRASI DARAH';
    accentColor = '#a855f7';
    dangerText = 'PENGGUMPALAN DARAH & GAGAL FILTRASI GINJAL';
  } else if (/pedas|cabai|sambal|seblak/i.test(combined)) {
    emoji = overrideEmoji || '🌶️';
    itemLabel = overrideLabel || 'SERANGAN SENYAWA CAPSAICIN';
    targetOrganPng = 'butterfly/organs/stomach.png';
    targetOrganName = 'DINDING MUKOSA LAMBUNG';
    accentColor = '#ef4444';
    dangerText = 'IRITASI AKUT & EROSI DINDING LAMBUNG';
  } else if (/alkohol|miras/i.test(combined)) {
    emoji = overrideEmoji || '🍺';
    itemLabel = overrideLabel || 'AKUMULASI ETANOL';
    targetOrganPng = 'butterfly/organs/liver.png';
    targetOrganName = 'SEL HEPATOSIT HATI';
    accentColor = '#f97316';
    dangerText = 'KERUSAKAN SEL HATI & INFLAMASI SISTEMIK';
  } else if (/tahan kencing|menahan buang air/i.test(combined)) {
    emoji = overrideEmoji || '⚠️';
    itemLabel = overrideLabel || 'TEKANAN KANDUNG KEMIH';
    targetOrganPng = 'butterfly/organs/kidneys.png';
    targetOrganName = 'GINJAL & SALURAN KEMIH';
    accentColor = '#eab308';
    dangerText = 'REFLUKS URIN & INFEKSI GINJAL AKUT';
  }

  return {
    emoji,
    itemLabel,
    targetCount,
    unitLabel,
    targetOrganPng,
    targetOrganName,
    accentColor,
    dangerText,
  };
}

export const HookScene: React.FC<HookSceneProps> = ({
  headline: rawHeadline,
  kicker: rawKicker,
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

  const kicker = rawKicker || 'EKSPERIMEN SIMULASI TUBUH 3D';
  const rawH = rawHeadline || rightTitle || leftTitle || 'BAGAIMANA KEADAAN TUBUHMU?';
  const headline = rawH.trim().endsWith('?') ? rawH.trim() : `${rawH.trim()}?`;
  const narration = rawNarration || '';

  const scenario = useMemo(
    () =>
      parseHookScenarioFromTopic(
        headline,
        narration,
        hookItemEmoji,
        hookItemLabel,
        hookTargetCount,
        hookUnitLabel
      ),
    [headline, narration, hookItemEmoji, hookItemLabel, hookTargetCount, hookUnitLabel]
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
  // Ease-out curve that starts fast (×1, ×2, ×3) and locks dramatically onto targetCount
  const curvedProgress = 1 - Math.pow(1 - rawProgress, 1.85);
  const currentCount = Math.max(1, Math.round(1 + curvedProgress * (scenario.targetCount - 1)));

  // Dynamic physiological stress & heartbeat accelerating as the multiplier climbs!
  const dynamicBpm = Math.round(72 + curvedProgress * 76);
  const beatPhase = (frame / fps) * (dynamicBpm / 60) * Math.PI * 2;
  const systolicBeat = Math.pow(Math.max(0, Math.sin(beatPhase)), 8);

  // Color shifts from cyan -> amber -> crimson red as count approaches targetCount
  const stressColor =
    curvedProgress < 0.35
      ? '#38bdf8'
      : curvedProgress < 0.72
      ? '#fbbf24'
      : '#f43f5e';

  // Generate a 30-slot visual grid (6 columns x 5 rows) of rapid-fire multiplying items!
  const totalGridSlots = Math.min(30, Math.max(12, scenario.targetCount > 30 ? 30 : scenario.targetCount));
  const activeGridSlots = Math.max(1, Math.round(curvedProgress * totalGridSlots));

  // Rapid-fire flying items streaming from the multiplier counter into the 3D human body's stomach/organ!
  const streamItems = useMemo(() => {
    return Array.from({ length: 6 }).map((_, i) => ({
      id: i,
      offset: i * 15,
      curveX: (i % 2 === 0 ? 1 : -1) * (25 + (i % 3) * 18),
    }));
  }, []);

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: 'radial-gradient(circle at 50% 42%, #162d54 0%, #091528 62%, #040a14 100%)',
        overflow: 'hidden',
        perspective: '1200px',
      }}
    >
      {/* 1. Holographic 3D Medical Grid Floor */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            linear-gradient(to right, rgba(125, 211, 252, 0.07) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(125, 211, 252, 0.07) 1px, transparent 1px)
          `,
          backgroundSize: '56px 56px',
          pointerEvents: 'none',
        }}
      />

      {/* =====================================================================
          2. TOP QUESTION HOOK BANNER (Clean & Punchy)
          ===================================================================== */}
      <div
        style={{
          position: 'absolute',
          top: '68px',
          left: '48px',
          right: '48px',
          zIndex: 35,
          transform: `translateY(${interpolate(introSpring, [0, 1], [-30, 0])}px)`,
          opacity: introSpring,
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            padding: '6px 16px',
            backgroundColor: 'rgba(7, 15, 30, 0.9)',
            border: `1.5px solid ${stressColor}`,
            borderRadius: '999px',
            marginBottom: '14px',
            boxShadow: `0 0 18px ${stressColor}44`,
          }}
        >
          <span
            style={{
              width: '9px',
              height: '9px',
              borderRadius: '50%',
              backgroundColor: stressColor,
              boxShadow: `0 0 10px ${stressColor}`,
              transform: `scale(${1 + systolicBeat * 0.45})`,
            }}
          />
          <span
            style={{
              color: '#f8fafc',
              fontSize: '13px',
              fontWeight: 800,
              fontFamily: "'Space Grotesk', sans-serif",
              letterSpacing: '1.8px',
              textTransform: 'uppercase',
            }}
          >
            {kicker} • DETAK {dynamicBpm} BPM
          </span>
        </div>

        <h1
          style={{
            fontSize: headline.length > 42 ? '38px' : '44px',
            fontWeight: 900,
            color: '#ffffff',
            lineHeight: 1.15,
            letterSpacing: '-0.8px',
            fontFamily: "'Montserrat', sans-serif",
            textTransform: 'uppercase',
            margin: 0,
            textShadow: '0 6px 24px rgba(0, 0, 0, 0.95)',
          }}
        >
          {headline}
        </h1>
      </div>

      {/* =====================================================================
          3. CENTER STAGE: 3D HUMAN ANATOMY RECEIVING RAPID-FIRE MULTIPLIER IMPACT
          Left Side: 3D Translucent Human Body + Target Organ Glowing & Reacting
          Right Side: Escalating Multiplier Counter (×1, ×2, ×3 ... ×30) + 30-Day Grid
          ===================================================================== */}
      <div
        style={{
          position: 'absolute',
          top: '310px',
          left: '36px',
          right: '36px',
          height: '870px',
          zIndex: 20,
          display: 'grid',
          gridTemplateColumns: '480px 1fr',
          gap: '20px',
          alignItems: 'center',
        }}
      >
        {/* LEFT COLUMN: 3D Translucent Human Body + Target Organ Overloaded in Real Time */}
        <div
          style={{
            position: 'relative',
            width: '480px',
            height: '850px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transform: `scale(${0.96 + curvedProgress * 0.06 + systolicBeat * 0.015})`,
          }}
        >
          {/* Glowing Warning Aura Behind 3D Body */}
          <div
            style={{
              position: 'absolute',
              width: '380px',
              height: '580px',
              borderRadius: '50%',
              background: `radial-gradient(circle, ${stressColor}38 0%, transparent 70%)`,
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
              opacity: 0.85,
              mixBlendMode: 'screen',
            }}
          />

          {/* 3D Target Organ Inside Body — Proportionally Fitted Inside the Torso & Glowing as Multiplier Climbs */}
          <div
            style={{
              position: 'absolute',
              top:
                scenario.targetOrganPng.includes('brain')
                  ? '145px'
                  : scenario.targetOrganPng.includes('lungs') || scenario.targetOrganPng.includes('heart')
                  ? '265px'
                  : '365px',
              left: '50%',
              transform: `translateX(-50%) scale(${0.86 + curvedProgress * 0.14 + systolicBeat * 0.08})`,
              width: '96px',
              height: '96px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              filter: `drop-shadow(0 0 ${10 + curvedProgress * 22}px ${stressColor}) drop-shadow(0 0 8px #fde047) saturate(${1.1 + curvedProgress * 0.45})`,
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

          {/* Rapid-Fire Ingestion Stream: Items Flying into the Mouth (x=240, y=205) -> Down Esophagus -> Organ! */}
          {streamItems.map((item) => {
            const cycle = ((frame + item.offset) % 48) / 48;
            const mouthX = 240;
            const mouthY = 205;
            const organY =
              scenario.targetOrganPng.includes('brain')
                ? 175
                : scenario.targetOrganPng.includes('lungs') || scenario.targetOrganPng.includes('heart')
                ? 305
                : 405;

            // Phase 1 (0..0.6): Flies from Right Counter Card into the 3D Character's Mouth!
            // Phase 2 (0.6..1.0): Travels down the throat/esophagus into the glowing target organ!
            const curX =
              cycle < 0.6
                ? interpolate(cycle, [0, 0.6], [450, mouthX])
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
                  fontSize: '38px',
                  transform: `translate(-50%, -50%) scale(${itemScale}) rotate(${cycle < 0.6 ? cycle * 180 : 0}deg)`,
                  opacity: itemOpacity,
                  filter: `drop-shadow(0 0 12px ${stressColor})`,
                  pointerEvents: 'none',
                }}
              >
                {scenario.emoji}
              </div>
            );
          })}

          {/* Organ Impact Status Pill under the 3D Body */}
          <div
            style={{
              position: 'absolute',
              bottom: '32px',
              left: '24px',
              right: '24px',
              backgroundColor: 'rgba(7, 16, 32, 0.92)',
              border: `1.5px solid ${stressColor}`,
              borderRadius: '14px',
              padding: '10px 14px',
              textAlign: 'center',
              boxShadow: `0 10px 28px rgba(0,0,0,0.75), 0 0 18px ${stressColor}33`,
            }}
          >
            <div
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: '11px',
                fontWeight: 800,
                color: stressColor,
                letterSpacing: '1.2px',
              }}
            >
              🎯 TARGET UTAMA: {scenario.targetOrganName}
            </div>
            <div
              style={{
                fontFamily: "'Montserrat', sans-serif",
                fontSize: '14px',
                fontWeight: 900,
                color: '#ffffff',
                marginTop: '3px',
              }}
            >
              {scenario.dangerText}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: ESCALATING ×1, ×2, ×3 ... ×30 MULTIPLIER CASCADE CARD */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            backgroundColor: 'rgba(8, 18, 36, 0.9)',
            border: `2px solid ${stressColor}`,
            borderRadius: '24px',
            padding: '22px 20px',
            boxShadow: `0 24px 60px rgba(0,0,0,0.85), 0 0 32px ${stressColor}33`,
            backdropFilter: 'blur(16px)',
          }}
        >
          {/* Giant Multiplier Badge: Emoji + ×1 -> ×30 */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: 'rgba(15, 23, 42, 0.95)',
              padding: '16px 18px',
              borderRadius: '18px',
              border: `1.5px solid ${stressColor}66`,
            }}
          >
            <div
              style={{
                fontSize: '68px',
                lineHeight: 1,
                transform: `scale(${1 + Math.sin(frame * 0.35) * 0.14}) rotate(${Math.sin(frame * 0.25) * 8}deg)`,
                filter: `drop-shadow(0 0 18px ${stressColor})`,
              }}
            >
              {scenario.emoji}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
              <span
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: '12px',
                  fontWeight: 800,
                  color: '#94a3b8',
                  letterSpacing: '1.4px',
                }}
              >
                AKUMULASI EKSPERIMEN
              </span>
              <div
                style={{
                  fontFamily: "'Montserrat', sans-serif",
                  fontSize: '64px',
                  fontWeight: 900,
                  color: stressColor,
                  lineHeight: 1.0,
                  textShadow: `0 0 24px ${stressColor}88`,
                  transform: `scale(${1 + (frame % 6 === 0 && rawProgress < 1 ? 0.08 : 0)})`,
                }}
              >
                ×{currentCount}
              </div>
              <span
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: '13px',
                  fontWeight: 800,
                  color: '#fef08a',
                  letterSpacing: '1px',
                  marginTop: '4px',
                }}
              >
                {scenario.unitLabel}
              </span>
            </div>
          </div>

          {/* 30-Slot Visual Multiplier Grid (Populates 1, 2, 3 ... 30 rapidly!) */}
          <div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '10px',
              }}
            >
              <span
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: '12px',
                  fontWeight: 800,
                  color: '#cbd5e1',
                  letterSpacing: '1px',
                }}
              >
                SIMULASI {scenario.itemLabel}
              </span>
              <span
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: '13px',
                  fontWeight: 900,
                  color: stressColor,
                }}
              >
                {currentCount} / {scenario.targetCount}
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
                      height: '58px',
                      borderRadius: '10px',
                      backgroundColor: isLit
                        ? isNewest
                          ? `${stressColor}44`
                          : 'rgba(30, 41, 59, 0.92)'
                        : 'rgba(15, 23, 42, 0.45)',
                      border: isLit
                        ? `1.5px solid ${isNewest ? '#fde047' : stressColor}`
                        : '1px solid rgba(148, 163, 184, 0.16)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transform: isNewest ? 'scale(1.12)' : isLit ? 'scale(1)' : 'scale(0.92)',
                      opacity: isLit ? 1 : 0.3,
                      boxShadow: isNewest ? `0 0 14px ${stressColor}` : 'none',
                    }}
                  >
                    <span style={{ fontSize: '24px', lineHeight: 1 }}>{scenario.emoji}</span>
                    <span
                      style={{
                        fontFamily: "'Space Grotesk', sans-serif",
                        fontSize: '10px',
                        fontWeight: 800,
                        color: isLit ? '#ffffff' : '#64748b',
                        marginTop: '2px',
                      }}
                    >
                      #{idx + 1}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Escalating Toxicity / Biological Overload Bar */}
          <div
            style={{
              backgroundColor: 'rgba(15, 23, 42, 0.9)',
              borderRadius: '14px',
              padding: '12px 14px',
              border: '1px solid rgba(148, 163, 184, 0.2)',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: '12px',
                fontWeight: 800,
                marginBottom: '8px',
              }}
            >
              <span style={{ color: '#fde047' }}>⚠️ BEBAN KERJA ORGAN</span>
              <span style={{ color: stressColor }}>{Math.round(15 + curvedProgress * 82)}% KRITIS</span>
            </div>
            <div
              style={{
                width: '100%',
                height: '12px',
                backgroundColor: 'rgba(2, 6, 23, 0.9)',
                borderRadius: '999px',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${Math.round(15 + curvedProgress * 82)}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #38bdf8 0%, #fbbf24 55%, #f43f5e 100%)',
                  boxShadow: `0 0 12px ${stressColor}`,
                  borderRadius: '999px',
                }}
              />
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
            'linear-gradient(to top, rgba(4, 12, 24, 0.96) 0%, rgba(6, 18, 36, 0.76) 46%, transparent 100%)',
          pointerEvents: 'none',
          zIndex: 18,
        }}
      />
    </div>
  );
};
