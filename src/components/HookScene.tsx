import React from 'react';
import { Img, useCurrentFrame, useVideoConfig, staticFile, interpolate, spring } from 'remotion';

export interface HookSceneProps {
  hookStyle?: string | null;
  archetype?: string | null;
  headline?: string | null;
  kicker?: string | null;
  leftTitle: string;
  rightTitle: string;
  leftBadge?: string | null;
  rightBadge?: string | null;
  leftPrimaryText?: string | null;
  leftSecondaryText?: string | null;
  leftStampText?: string | null;
  leftImage?: string | null;
  rightImage?: string | null;
  durationFrames?: number;
}

export const HookScene: React.FC<HookSceneProps> = ({
  headline: rawHeadline,
  kicker: rawKicker,
  leftTitle,
  rightTitle,
  leftImage,
  rightImage,
  durationFrames = 250,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const kicker = rawKicker || 'PERTANYAAN ANATOMI & MEDIS';
  const rawH = rawHeadline || rightTitle || leftTitle || 'BAGAIMANA KEADAAN TUBUHMU?';
  const headline = rawH.trim().endsWith('?') ? rawH.trim() : `${rawH.trim()}?`;
  const heroImage = rightImage || leftImage || 'butterfly/media/medical_body_xray.jpg';

  // Fluid spring zoom-in + organic heartbeat thump
  const introSpring = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 55, mass: 1.0 },
  });

  const beatPhase = (frame / fps) * (88 / 60) * Math.PI * 2;
  const systolicBeat = Math.pow(Math.max(0, Math.sin(beatPhase)), 8);

  const scale = interpolate(introSpring, [0, 1], [1.18, 1.05]) + systolicBeat * 0.018;
  const driftX = Math.sin(frame * 0.04) * 14;
  const driftY = Math.cos(frame * 0.035) * 10;

  // Vertical X-Ray Laser Sweep
  const laserY = interpolate(frame % 90, [0, 90], [80, 1450]);

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: 'radial-gradient(circle at 50% 38%, #152c52 0%, #0b162c 62%, #060d1a 100%)',
        overflow: 'hidden',
      }}
    >
      {/* 1. Fullscreen 3D Medical X-Ray Hero Background with Spring Glide & Heartbeat */}
      <div
        style={{
          position: 'absolute',
          inset: -40,
          transform: `scale(${scale}) translate(${driftX}px, ${driftY}px)`,
          transformOrigin: 'center 42%',
        }}
      >
        <Img
          src={staticFile(heroImage)}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: 0.32,
            mixBlendMode: 'screen',
            filter: 'grayscale(80%) contrast(1.18) brightness(0.9)',
          }}
        />
      </div>

      {/* 2. Holographic Medical Grid Overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            linear-gradient(to right, rgba(125, 211, 252, 0.09) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(125, 211, 252, 0.09) 1px, transparent 1px)
          `,
          backgroundSize: '54px 54px',
          pointerEvents: 'none',
        }}
      />

      {/* 3. Bioluminescent X-Ray Scanner Laser */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: `${laserY}px`,
          height: '3px',
          background: 'linear-gradient(90deg, transparent 0%, #ffffff 50%, transparent 100%)',
          boxShadow: '0 0 24px #38bdf8',
          opacity: 0.55,
          pointerEvents: 'none',
        }}
      />

      {/* 4. Soft Luminous Vignette & Subtitle Safe Zone Gradient */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse at center, transparent 45%, rgba(4, 15, 32, 0.78) 100%)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: '680px',
          background:
            'linear-gradient(to top, rgba(4, 14, 28, 0.96) 0%, rgba(6, 22, 42, 0.72) 48%, transparent 100%)',
          pointerEvents: 'none',
        }}
      />

      {/* 5. Top Medical Hook Header */}
      <div
        style={{
          position: 'absolute',
          top: '96px',
          left: '54px',
          right: '54px',
          zIndex: 30,
          transform: `translateY(${interpolate(introSpring, [0, 1], [-35, 0])}px)`,
          opacity: introSpring,
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            padding: '7px 16px',
            backgroundColor: 'rgba(6, 12, 24, 0.88)',
            border: '1px solid rgba(56, 189, 248, 0.55)',
            borderLeft: '4px solid #38bdf8',
            borderRadius: '8px',
            marginBottom: '16px',
            boxShadow: '0 0 20px rgba(56, 189, 248, 0.25)',
            backdropFilter: 'blur(12px)',
          }}
        >
          <div
            style={{
              width: '9px',
              height: '9px',
              borderRadius: '50%',
              backgroundColor: '#38bdf8',
              boxShadow: '0 0 10px #38bdf8',
              transform: `scale(${1 + systolicBeat * 0.45})`,
            }}
          />
          <span
            style={{
              color: '#38bdf8',
              fontSize: '15px',
              fontWeight: 800,
              fontFamily: "'Space Grotesk', sans-serif",
              letterSpacing: '2px',
              textTransform: 'uppercase',
            }}
          >
            {kicker}
          </span>
        </div>

        <h1
          style={{
            fontSize: headline.length > 36 ? '44px' : '50px',
            fontWeight: 900,
            color: '#ffffff',
            lineHeight: 1.16,
            letterSpacing: '-1px',
            fontFamily: "'Montserrat', sans-serif",
            textTransform: 'uppercase',
            margin: 0,
            textShadow: '0 6px 28px rgba(0, 0, 0, 0.95)',
          }}
        >
          {headline}
        </h1>

        <div
          style={{
            marginTop: '18px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '12px',
            backgroundColor: 'rgba(15, 23, 42, 0.88)',
            padding: '8px 16px',
            borderRadius: '8px',
            border: '1px solid rgba(251, 191, 36, 0.45)',
            color: '#fef08a',
            fontSize: '14px',
            fontWeight: 800,
            fontFamily: "'Space Grotesk', sans-serif",
            boxShadow: '0 4px 18px rgba(0, 0, 0, 0.6)',
          }}
        >
          <span style={{ color: '#fbbf24', fontSize: '16px' }}>❓</span>
          <span>SIMAK REAKSI ORGANMU DETIK DEMI DETIK</span>
        </div>
      </div>
    </div>
  );
};
