import React, { useMemo } from 'react';
import { Img, useCurrentFrame, useVideoConfig, staticFile, interpolate, spring } from 'remotion';
import { OrganTarget, ZoomDirection } from '../data/types';

export interface MedicalScannerSceneProps {
  mediaUrl: string;
  prevMediaUrl?: string;
  step?: number;
  locationTag?: string;
  headline?: string;
  primaryText?: string | null;
  secondaryText?: string | null;
  organTarget?: OrganTarget | null;
  prevOrganTarget?: OrganTarget | null;
  chaosLevel?: number;
  zoomDirection?: ZoomDirection;
  durationFrames: number;
  mood?: string;
  visualSourceTag?: string;
}

interface OrganCoord {
  id: OrganTarget;
  label: string;
  x: number; // 0 to 100 within BodyMap SVG viewBox (0 0 100 200)
  y: number;
  color: string;
}

const ORGAN_MAP: Record<string, OrganCoord> = {
  brain: { id: 'brain', label: 'OTAK & SARAF PUSAT', x: 50, y: 22, color: '#38bdf8' },
  nerves: { id: 'nerves', label: 'SISTEM SARAF', x: 50, y: 34, color: '#818cf8' },
  lungs: { id: 'lungs', label: 'PARU-PARU & RESPIRASI', x: 50, y: 66, color: '#2dd4bf' },
  heart: { id: 'heart', label: 'JANTUNG & PEMBULUH', x: 54, y: 70, color: '#f43f5e' },
  liver: { id: 'liver', label: 'HATI (LIVER)', x: 42, y: 88, color: '#f59e0b' },
  stomach: { id: 'stomach', label: 'LAMBUNG & PENCERNAAN', x: 57, y: 92, color: '#fb923c' },
  kidney: { id: 'kidney', label: 'GINJAL & EKSKRESI', x: 50, y: 104, color: '#a855f7' },
  intestine: { id: 'intestine', label: 'USUS & METABOLISME', x: 50, y: 118, color: '#eab308' },
  blood: { id: 'blood', label: 'ALIRAN DARAH & SEL', x: 54, y: 76, color: '#ef4444' },
  muscles: { id: 'muscles', label: 'JARINGAN OTOT & SEL', x: 32, y: 82, color: '#fb7185' },
  'full-body': { id: 'full-body', label: 'SISTEM IMUN & TUBUH', x: 50, y: 78, color: '#38bdf8' },
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

  if (/otak|saraf|neuron|pikiran|tidur|halusinasi|kepala|mata|memori|korteks|kognitif|dopamin|adrenalin/.test(combined)) {
    return ORGAN_MAP.brain;
  }
  if (/jantung|detak|darah|pembuluh|nadi|tensi|tekanan darah|kardio|stroke|oksigen darah/.test(combined)) {
    return ORGAN_MAP.heart;
  }
  if (/paru|napas|oksigen|sesak|alveoli|bronkus|tenggorokan|udara/.test(combined)) {
    return ORGAN_MAP.lungs;
  }
  if (/lambung|asam|perut|mual|muntah|lapar|makan|minum|kopi|kafein|maag/.test(combined)) {
    return ORGAN_MAP.stomach;
  }
  if (/ginjal|kencing|urin|kandung kemih|dehidrasi|cairan|racun|ureum/.test(combined)) {
    return ORGAN_MAP.kidney;
  }
  if (/hati|liver|empedu|detoks|alkohol|glikogen/.test(combined)) {
    return ORGAN_MAP.liver;
  }
  if (/usus|cerna|bakteri|mikrobioma|nutrisi|kalori/.test(combined)) {
    return ORGAN_MAP.intestine;
  }
  if (/otot|sendi|tulang|lemas|kejang|kulit|suhu|keringat/.test(combined)) {
    return ORGAN_MAP.muscles;
  }

  const cycle: OrganCoord[] = [
    ORGAN_MAP.brain,
    ORGAN_MAP.stomach,
    ORGAN_MAP.heart,
    ORGAN_MAP.lungs,
    ORGAN_MAP.kidney,
    ORGAN_MAP.liver,
    ORGAN_MAP.blood,
    ORGAN_MAP.nerves,
  ];
  return cycle[(step - 1) % cycle.length];
}

export const MedicalScannerScene: React.FC<MedicalScannerSceneProps> = ({
  mediaUrl,
  prevMediaUrl,
  step = 1,
  locationTag,
  headline,
  primaryText,
  secondaryText,
  organTarget,
  prevOrganTarget,
  chaosLevel = 35,
  zoomDirection = 'in',
  durationFrames,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const activeOrgan = useMemo(
    () => detectOrganFromText(organTarget, headline, locationTag, primaryText, step),
    [organTarget, headline, locationTag, primaryText, step]
  );

  const prevOrgan = useMemo(
    () =>
      prevOrganTarget
        ? detectOrganFromText(prevOrganTarget, '', '', '', Math.max(1, step - 1))
        : detectOrganFromText(null, '', '', '', Math.max(1, step - 1)),
    [prevOrganTarget, step]
  );

  // 1. FLUID SPRING CAMERA MOTION (Seamless Glide + Organic Heartbeat Pulse)
  const cameraSpring = spring({
    frame,
    fps,
    config: { damping: 16, stiffness: 52, mass: 1.05 },
  });

  // Biological Heart Rate (BPM) driven by chaosLevel (Severity: 0-100)
  const bpm = Math.round(68 + (Math.min(100, Math.max(5, chaosLevel)) / 100) * 98);
  const beatPhase = (frame / fps) * (bpm / 60) * Math.PI * 2;
  // Realistic systolic lub-dub pulse curve
  const systolicBeat = Math.pow(Math.max(0, Math.sin(beatPhase)), 8);
  const diastolicBeat = Math.pow(Math.max(0, Math.sin(beatPhase - 0.65)), 12) * 0.45;
  const organicPulse = (systolicBeat + diastolicBeat) * (0.012 + (chaosLevel / 100) * 0.016);

  // Continuous 2.5D floating camera drift so image never feels static
  const driftX = Math.sin(frame * 0.042 + step * 1.7) * 16;
  const driftY = Math.cos(frame * 0.036 + step * 2.3) * 12;
  const subtleTilt = Math.sin(frame * 0.025 + step) * 0.65;

  let baseScale = 1.08;
  let camOffsetX = 0;
  let camOffsetY = 0;

  if (zoomDirection === 'out' || zoomDirection === 'zoomOut') {
    baseScale = interpolate(cameraSpring, [0, 1], [1.22, 1.08]);
    camOffsetY = interpolate(cameraSpring, [0, 1], [-22, 0]);
  } else if (zoomDirection === 'panRight') {
    baseScale = 1.15;
    camOffsetX = interpolate(cameraSpring, [0, 1], [-38, 18]);
  } else if (zoomDirection === 'panLeft') {
    baseScale = 1.15;
    camOffsetX = interpolate(cameraSpring, [0, 1], [38, -18]);
  } else {
    // Smooth zoom-in glide into the organ
    baseScale = interpolate(cameraSpring, [0, 1], [1.04, 1.18]);
    camOffsetY = interpolate(cameraSpring, [0, 1], [20, -10]);
  }

  const totalScale = baseScale + organicPulse;
  const totalX = camOffsetX + driftX;
  const totalY = camOffsetY + driftY;

  // Cross-dissolve blend from previous scene in first 14 frames for ultra-smooth transition
  const crossfadeAlpha = interpolate(frame, [0, 14], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // 2. COLOR THEME BASED ON BIOLOGICAL SEVERITY
  const isCritical = chaosLevel >= 70;
  const isWarning = chaosLevel >= 40 && chaosLevel < 70;
  const accentColor = isCritical ? '#f43f5e' : isWarning ? '#f59e0b' : activeOrgan.color;
  const secondaryGlow = isCritical ? 'rgba(244, 63, 94, 0.35)' : isWarning ? 'rgba(245, 158, 11, 0.28)' : 'rgba(56, 189, 248, 0.28)';

  // 3. SPRING RETICLE ON FULL-BODY X-RAY MAP (Glides smoothly from prevOrgan -> activeOrgan)
  const mapGlide = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 68, mass: 0.85 },
  });
  const targetX = interpolate(mapGlide, [0, 1], [prevOrgan.x, activeOrgan.x]);
  const targetY = interpolate(mapGlide, [0, 1], [prevOrgan.y, activeOrgan.y]);

  // 4. LIVING CELLULAR / BLOODSTREAM PARTICLES (16 deterministic fluid particles)
  const particles = useMemo(() => {
    return Array.from({ length: 16 }).map((_, idx) => {
      const seed1 = ((idx * 73 + step * 31) % 100) / 100;
      const seed2 = ((idx * 47 + step * 19) % 100) / 100;
      const depth = idx % 3; // 0: background, 1: midground, 2: foreground bokeh
      return {
        id: idx,
        baseX: seed1 * 1080,
        baseY: 220 + seed2 * 1020,
        size: depth === 2 ? 22 + (idx % 12) : depth === 1 ? 10 + (idx % 8) : 5 + (idx % 5),
        speedX: (seed1 - 0.5) * 2.4,
        speedY: -0.9 - seed2 * 2.1,
        waveAmp: 18 + (idx % 5) * 9,
        waveFreq: 0.03 + (idx % 4) * 0.012,
        blur: depth === 2 ? 5 : depth === 1 ? 1 : 0,
        opacity: depth === 2 ? 0.32 : depth === 1 ? 0.55 : 0.28,
      };
    });
  }, [step]);

  // 5. LIVE SCROLLING EKG WAVEFORM PATH
  const ekgPath = useMemo(() => {
    const width = 340;
    const points: string[] = [];
    const speed = 3.2 + (chaosLevel / 100) * 3.8;
    const scroll = frame * speed;
    const cycleWidth = Math.max(48, Math.round(115 - (chaosLevel / 100) * 52));

    for (let x = 0; x <= width; x += 3) {
      const pos = (x + scroll) % cycleWidth;
      const norm = pos / cycleWidth; // 0 to 1
      let y = 26;
      // P wave
      if (norm > 0.18 && norm < 0.28) {
        y -= Math.sin(((norm - 0.18) / 0.1) * Math.PI) * 5;
      }
      // Q dip
      else if (norm >= 0.34 && norm < 0.38) {
        y += 5;
      }
      // R sharp spike
      else if (norm >= 0.38 && norm < 0.45) {
        const spike = 1 - Math.abs((norm - 0.415) / 0.035);
        y -= spike * (19 + (chaosLevel / 100) * 6);
      }
      // S dip
      else if (norm >= 0.45 && norm < 0.50) {
        y += 8;
      }
      // T wave
      else if (norm >= 0.58 && norm < 0.72) {
        y -= Math.sin(((norm - 0.58) / 0.14) * Math.PI) * 7;
      }
      points.push(`${x === 0 ? 'M' : 'L'} ${x} ${y.toFixed(1)}`);
    }
    return points.join(' ');
  }, [frame, chaosLevel]);

  // 6. X-RAY SCANNER LASER LINE SWEEP
  const scanlineY = interpolate(frame % 110, [0, 110], [120, 1380]);

  // 7. HUD ENTRANCE ANIMATION
  const hudEntrance = spring({
    frame,
    fps,
    config: { damping: 15, stiffness: 80, mass: 0.7 },
  });

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        backgroundColor: '#02060d',
        overflow: 'hidden',
      }}
    >
      {/* PREVIOUS SCENE SMOOTH CROSS-DISSOLVE UNDERLAY */}
      {prevMediaUrl && frame < 16 && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            opacity: 1 - crossfadeAlpha,
            transform: 'scale(1.12)',
            filter: 'blur(6px) brightness(0.7)',
          }}
        >
          <Img
            src={staticFile(prevMediaUrl)}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center 32%',
            }}
          />
        </div>
      )}

      {/* 1. 3D MEDICAL X-RAY VISUAL CANVAS WITH SPRING GLIDE & HEARTBEAT PULSE */}
      <div
        style={{
          width: '100%',
          height: '100%',
          opacity: prevMediaUrl ? crossfadeAlpha : 1,
          transform: `scale(${totalScale}) translate(${totalX}px, ${totalY}px) rotate(${subtleTilt}deg)`,
          transformOrigin: 'center 38%',
          position: 'relative',
        }}
      >
        <Img
          src={staticFile(mediaUrl)}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center 32%',
            filter: `contrast(1.16) brightness(0.92) saturate(1.18) drop-shadow(0 0 30px ${secondaryGlow})`,
          }}
        />
      </div>

      {/* 2. MEDICAL HOLOGRAPHIC X-RAY GRID & PULSE GLOW */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            linear-gradient(to right, rgba(56, 189, 248, 0.045) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(56, 189, 248, 0.045) 1px, transparent 1px)
          `,
          backgroundSize: '54px 54px',
          pointerEvents: 'none',
          opacity: 0.65,
        }}
      />

      {/* Reactive Heartbeat Aura Vignette */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(circle at 50% 42%, transparent 32%, ${secondaryGlow} ${Math.round(78 - systolicBeat * 14)}%, rgba(2, 6, 13, 0.92) 100%)`,
          pointerEvents: 'none',
        }}
      />

      {/* Horizontal Bioluminescent X-Ray Scan Laser */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: `${scanlineY}px`,
          height: '3px',
          background: `linear-gradient(90deg, transparent 0%, ${accentColor} 50%, transparent 100%)`,
          boxShadow: `0 0 18px ${accentColor}`,
          opacity: 0.38,
          pointerEvents: 'none',
        }}
      />

      {/* 3. FLUID BIOLOGICAL PARTICLES (Blood Cells / Synapses / Enzymes) */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 12 }}>
        {particles.map((p) => {
          const curY = ((p.baseY + frame * p.speedY) % 1250 + 1250) % 1250 + 120;
          const curX = p.baseX + Math.sin(frame * p.waveFreq + p.id) * p.waveAmp + frame * p.speedX * 0.25;
          const pulseScale = 1 + systolicBeat * 0.22;
          return (
            <div
              key={p.id}
              style={{
                position: 'absolute',
                left: `${curX}px`,
                top: `${curY}px`,
                width: `${p.size}px`,
                height: `${p.size}px`,
                borderRadius: '50%',
                background: `radial-gradient(circle at 35% 35%, #ffffff 0%, ${accentColor} 55%, transparent 100%)`,
                boxShadow: `0 0 ${p.size}px ${accentColor}`,
                opacity: p.opacity,
                filter: p.blur > 0 ? `blur(${p.blur}px)` : undefined,
                transform: `scale(${pulseScale})`,
              }}
            />
          );
        })}
      </div>

      {/* 4. SUBTITLE SAFE ZONE PROTECTIVE GRADIENT (Strictly protects y >= 1200px) */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: '720px',
          background:
            'linear-gradient(to top, rgba(2, 6, 13, 0.98) 0%, rgba(2, 6, 13, 0.82) 48%, rgba(2, 6, 13, 0.3) 82%, transparent 100%)',
          pointerEvents: 'none',
          zIndex: 18,
        }}
      />

      {/* 5. TOP-LEFT BIOLOGICAL TIMELINE & ORGAN TELEMETRY HEADER */}
      <div
        style={{
          position: 'absolute',
          top: '68px',
          left: '44px',
          maxWidth: '680px',
          zIndex: 30,
          transform: `translateX(${interpolate(hudEntrance, [0, 1], [-40, 0])}px)`,
          opacity: hudEntrance,
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
        }}
      >
        {/* Stage / Time Pill */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: 'rgba(6, 12, 24, 0.88)',
              padding: '7px 16px',
              borderRadius: '8px',
              borderLeft: `4px solid ${accentColor}`,
              borderTop: '1px solid rgba(255, 255, 255, 0.12)',
              borderRight: '1px solid rgba(255, 255, 255, 0.08)',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              boxShadow: `0 6px 20px rgba(0, 0, 0, 0.65), 0 0 15px ${secondaryGlow}`,
              backdropFilter: 'blur(12px)',
            }}
          >
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: accentColor,
                boxShadow: `0 0 10px ${accentColor}`,
                transform: `scale(${1 + systolicBeat * 0.45})`,
              }}
            />
            <span
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: '15px',
                fontWeight: 700,
                color: '#f8fafc',
                letterSpacing: '1.5px',
                textTransform: 'uppercase',
              }}
            >
              {locationTag || `FASE BIOLOGIS ${step}`}
            </span>
          </div>

          <div
            style={{
              backgroundColor: 'rgba(6, 12, 24, 0.82)',
              padding: '6px 13px',
              borderRadius: '8px',
              border: `1px solid ${accentColor}55`,
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: '13px',
              fontWeight: 700,
              color: accentColor,
              letterSpacing: '1px',
              textTransform: 'uppercase',
            }}
          >
            {activeOrgan.label}
          </div>
        </div>

        {/* Main Organ Action Headline */}
        {headline && (
          <div
            style={{
              fontSize: '28px',
              fontWeight: 900,
              color: '#ffffff',
              textShadow: '0 4px 16px rgba(0, 0, 0, 0.95)',
              fontFamily: "'Montserrat', sans-serif",
              lineHeight: 1.22,
              letterSpacing: '-0.4px',
            }}
          >
            {headline}
          </div>
        )}

        {/* Live EKG Heartbeat Monitor & Biological Stress Telemetry */}
        <div
          style={{
            marginTop: '4px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '14px',
            backgroundColor: 'rgba(6, 12, 24, 0.84)',
            padding: '8px 16px',
            borderRadius: '10px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(12px)',
            width: 'fit-content',
          }}
        >
          {/* SVG Live EKG Waveform */}
          <svg width="180" height="38" viewBox="0 0 340 48" style={{ overflow: 'visible' }}>
            <path
              d={ekgPath}
              fill="none"
              stroke={accentColor}
              strokeWidth="3.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ filter: `drop-shadow(0 0 6px ${accentColor})` }}
            />
          </svg>

          {/* BPM Counter */}
          <div style={{ display: 'flex', flexDirection: 'column', minWidth: '78px' }}>
            <span
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: '10px',
                fontWeight: 700,
                color: '#94a3b8',
                letterSpacing: '1px',
              }}
            >
              DETAK JANTUNG
            </span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
              <span
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: '21px',
                  fontWeight: 800,
                  color: accentColor,
                }}
              >
                {bpm}
              </span>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#cbd5e1' }}>BPM</span>
            </div>
          </div>

          {/* Biological Stress Indicator */}
          <div
            style={{
              borderLeft: '1px solid rgba(255, 255, 255, 0.12)',
              paddingLeft: '12px',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <span
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: '10px',
                fontWeight: 700,
                color: '#94a3b8',
                letterSpacing: '1px',
              }}
            >
              STRES SEL
            </span>
            <span
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: '18px',
                fontWeight: 800,
                color: isCritical ? '#f43f5e' : isWarning ? '#fbbf24' : '#38bdf8',
              }}
            >
              {chaosLevel}%
            </span>
          </div>
        </div>

        {/* Biological Evidence Fact Callout Pill (if primaryText exists) */}
        {primaryText && (
          <div
            style={{
              marginTop: '2px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: 'rgba(15, 23, 42, 0.85)',
              padding: '6px 14px',
              borderRadius: '6px',
              border: `1px solid ${accentColor}44`,
              width: 'fit-content',
            }}
          >
            <span style={{ fontSize: '13px', fontWeight: 800, color: accentColor }}>⚡ REAKSI MEDIS:</span>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#f1f5f9' }}>{primaryText}</span>
          </div>
        )}
      </div>

      {/* 6. TOP-RIGHT INTERACTIVE 3D HOLOGRAPHIC BODY MAP SCANNER HUD */}
      <div
        style={{
          position: 'absolute',
          top: '68px',
          right: '40px',
          width: '175px',
          height: '330px',
          zIndex: 30,
          backgroundColor: 'rgba(4, 10, 22, 0.82)',
          borderRadius: '14px',
          border: `1.5px solid ${accentColor}66`,
          boxShadow: `0 12px 32px rgba(0, 0, 0, 0.8), inset 0 0 20px ${secondaryGlow}`,
          backdropFilter: 'blur(12px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '10px 8px',
          transform: `translateX(${interpolate(hudEntrance, [0, 1], [40, 0])}px)`,
          opacity: hudEntrance,
        }}
      >
        <div
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: '10px',
            fontWeight: 700,
            color: '#94a3b8',
            letterSpacing: '1.4px',
            textTransform: 'uppercase',
            marginBottom: '4px',
          }}
        >
          PEMINDAI ANATOMI
        </div>

        {/* Anatomical Human Silhouette + Internal Organs SVG */}
        <svg
          width="135"
          height="255"
          viewBox="0 0 100 200"
          style={{ overflow: 'visible' }}
        >
          {/* Outer Human Body Hologram Silhouette */}
          <path
            d="M50 6 C58 6 63 12 63 21 C63 28 59 33 56 36 L60 42 C72 44 80 50 82 62 L85 104 C85 108 80 109 78 105 L73 66 L68 66 L70 118 L67 186 C67 191 59 191 58 186 L54 128 L46 128 L42 186 C41 191 33 191 33 186 L30 118 L32 66 L27 66 L22 105 C20 109 15 108 15 104 L18 62 C20 50 28 44 40 42 L44 36 C41 33 37 28 37 21 C37 12 42 6 50 6 Z"
            fill="rgba(56, 189, 248, 0.08)"
            stroke="rgba(56, 189, 248, 0.42)"
            strokeWidth="1.4"
          />

          {/* Central Nervous Spine Line */}
          <line
            x1="50"
            y1="32"
            x2="50"
            y2="122"
            stroke="rgba(129, 140, 248, 0.35)"
            strokeWidth="1.2"
            strokeDasharray="2 2"
          />

          {/* Brain */}
          <ellipse
            cx="50"
            cy="20"
            rx="9"
            ry="7.5"
            fill={activeOrgan.id === 'brain' ? activeOrgan.color : 'rgba(56, 189, 248, 0.2)'}
            opacity={activeOrgan.id === 'brain' ? 0.9 : 0.45}
          />

          {/* Lungs */}
          <path
            d="M47 54 C40 54 36 62 36 74 C36 78 42 79 47 76 Z M53 54 C60 54 64 62 64 74 C64 78 58 79 53 76 Z"
            fill={activeOrgan.id === 'lungs' ? activeOrgan.color : 'rgba(45, 212, 191, 0.22)'}
            opacity={activeOrgan.id === 'lungs' ? 0.9 : 0.45}
          />

          {/* Heart */}
          <circle
            cx="54"
            cy="70"
            r="5.2"
            fill={activeOrgan.id === 'heart' || activeOrgan.id === 'blood' ? '#f43f5e' : 'rgba(244, 63, 94, 0.35)'}
          />

          {/* Liver */}
          <path
            d="M37 83 C43 81 49 83 51 88 C46 92 39 92 37 88 Z"
            fill={activeOrgan.id === 'liver' ? activeOrgan.color : 'rgba(245, 158, 11, 0.24)'}
          />

          {/* Stomach */}
          <ellipse
            cx="56"
            cy="91"
            rx="6.5"
            ry="5"
            fill={activeOrgan.id === 'stomach' ? activeOrgan.color : 'rgba(251, 146, 60, 0.24)'}
          />

          {/* Kidneys */}
          <circle
            cx="44"
            cy="104"
            r="3.5"
            fill={activeOrgan.id === 'kidney' ? activeOrgan.color : 'rgba(168, 85, 247, 0.28)'}
          />
          <circle
            cx="56"
            cy="104"
            r="3.5"
            fill={activeOrgan.id === 'kidney' ? activeOrgan.color : 'rgba(168, 85, 247, 0.28)'}
          />

          {/* Intestines */}
          <rect
            x="40"
            y="111"
            width="20"
            height="13"
            rx="4"
            fill={activeOrgan.id === 'intestine' ? activeOrgan.color : 'rgba(234, 179, 8, 0.22)'}
          />

          {/* SPRING-ANIMATED TARGET RETICLE GLIDING TO ACTIVE ORGAN */}
          <g transform={`translate(${targetX}, ${targetY})`}>
            {/* Outer Expanding Pulse Ring */}
            <circle
              r={12 + systolicBeat * 6}
              fill="none"
              stroke={accentColor}
              strokeWidth="1.5"
              opacity={0.75 - systolicBeat * 0.35}
            />
            {/* Inner Target Crosshair */}
            <circle
              r="6"
              fill={accentColor}
              opacity="0.92"
              style={{ filter: `drop-shadow(0 0 8px ${accentColor})` }}
            />
            <line x1="-16" y1="0" x2="-8" y2="0" stroke="#ffffff" strokeWidth="1.4" />
            <line x1="8" y1="0" x2="16" y2="0" stroke="#ffffff" strokeWidth="1.4" />
            <line x1="0" y1="-16" x2="0" y2="-8" stroke="#ffffff" strokeWidth="1.4" />
            <line x1="0" y1="8" x2="0" y2="16" stroke="#ffffff" strokeWidth="1.4" />
          </g>
        </svg>

        {/* Active Organ Status Footer inside Scanner Box */}
        <div
          style={{
            marginTop: 'auto',
            width: '100%',
            textAlign: 'center',
            backgroundColor: 'rgba(15, 23, 42, 0.9)',
            padding: '4px 6px',
            borderRadius: '6px',
            border: `1px solid ${accentColor}55`,
          }}
        >
          <div
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: '9px',
              fontWeight: 700,
              color: accentColor,
              letterSpacing: '0.8px',
              textTransform: 'uppercase',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {activeOrgan.label}
          </div>
        </div>
      </div>
    </div>
  );
};
