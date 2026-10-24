import React from 'react';
import { Img, useCurrentFrame, staticFile, interpolate } from 'remotion';

export interface HookSceneProps {
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
  leftTitle,
  rightTitle,
  leftBadge: rawLeftBadge,
  rightBadge: rawRightBadge,
  leftPrimaryText,
  leftSecondaryText,
  leftStampText: rawLeftStampText,
  leftImage: rawLeftImage,
  rightImage: rawRightImage,
  durationFrames = 257,
}) => {
  const leftBadge = rawLeftBadge || '⚡ AWAL MULA SEPELE';
  const rightBadge = rawRightBadge || '🚨 BENCANA GLOBAL';
  const leftStampText = rawLeftStampText || 'BUKTI SEPELE';
  const leftImage = rawLeftImage;
  const rightImage = rawRightImage;
  const frame = useCurrentFrame();

  // 1. Rock-steady, continuous cinematic camera drift across the ENTIRE duration
  // Zero modulo resets! Zero jerky zoom-out snaps! Zero wobble!
  const masterScale = interpolate(frame, [0, durationFrames], [1.0, 1.10], {
    extrapolateRight: 'clamp',
  });

  // 2. Cinematic transition timing: Left focus -> Midpoint sweep -> Right focus
  const switchPoint = Math.round(durationFrames * 0.48);
  const isSecondHalf = frame >= switchPoint;

  // Gentle filmic pan: drifts smoothly from left bias (-15px) to right bias (+15px)
  const panX = interpolate(frame, [0, durationFrames], [-15, 15], {
    extrapolateRight: 'clamp',
  });

  // Dynamic focus opacity between the two contrast worlds
  const leftOpacity = interpolate(
    frame,
    [0, switchPoint - 15, switchPoint, durationFrames],
    [1.0, 1.0, 0.25, 0.15],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const rightOpacity = interpolate(
    frame,
    [0, switchPoint - 10, switchPoint + 10, durationFrames],
    [0.2, 0.35, 1.0, 1.0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const docPrimaryText = leftPrimaryText || leftTitle;

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        backgroundColor: '#05070a',
        overflow: 'hidden',
      }}
    >
      {/* Container with unbroken continuous Ken Burns drift */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          transform: `scale(${masterScale}) translateX(${panX}px)`,
          transformOrigin: 'center center',
        }}
      >
        {/* ============================================================== */}
        {/* LEFT / UPPER PANEL: AWAL MULA SEPELE (The Trivial Trigger)    */}
        {/* ============================================================== */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '52%',
            overflow: 'hidden',
            opacity: leftOpacity,
            transition: 'opacity 0.2s ease-out',
          }}
        >
          {leftImage ? (
            <Img
              src={staticFile(leftImage)}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'center 35%',
                filter: 'contrast(1.12) brightness(0.88)',
              }}
            />
          ) : (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                backgroundColor: '#0a0f18',
                backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(30, 41, 59, 0.4) 0%, #070b12 100%)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '40px',
              }}
            >
              {/* Subtle forensic grid overlay */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  opacity: 0.12,
                  backgroundImage:
                    'linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)',
                  backgroundSize: '40px 40px',
                }}
              />
              <div
                style={{
                  position: 'relative',
                  zIndex: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                }}
              >
                <div
                  style={{
                    color: '#FFE600',
                    fontWeight: 900,
                    fontFamily: 'monospace',
                    fontSize: '15px',
                    letterSpacing: '3px',
                    textTransform: 'uppercase',
                    marginBottom: '10px',
                    textShadow: '0 0 10px rgba(255,230,0,0.4)',
                  }}
                >
                  ⚡ {leftStampText || 'BUKTI AWAL'}
                </div>
                <div
                  style={{
                    color: '#ffffff',
                    fontSize: '36px',
                    fontWeight: 900,
                    fontFamily: "'Space Grotesk', -apple-system, sans-serif",
                    letterSpacing: '-1px',
                    lineHeight: 1.15,
                    textTransform: 'uppercase',
                    maxWidth: '850px',
                    textShadow: '0 4px 20px rgba(0,0,0,0.8)',
                  }}
                >
                  {docPrimaryText}
                </div>
                <div
                  style={{
                    marginTop: '12px',
                    color: '#64748b',
                    fontSize: '13px',
                    fontWeight: 700,
                    fontFamily: 'monospace',
                    letterSpacing: '2px',
                  }}
                >
                  [ REKONSTRUKSI FORENSIK • FAKTA SEJARAH ]
                </div>
              </div>
            </div>
          )}

          {/* Archival dark gradient vignette */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'radial-gradient(ellipse at center, transparent 30%, rgba(5, 7, 10, 0.8) 100%)',
            }}
          />
        </div>

        {/* ============================================================== */}
        {/* RIGHT / LOWER PANEL: AKIBAT GLOBAL (The Monumental Collapse)  */}
        {/* ============================================================== */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '52%',
            overflow: 'hidden',
            opacity: rightOpacity,
            transition: 'opacity 0.2s ease-out',
          }}
        >
          {rightImage ? (
            <Img
              src={staticFile(rightImage)}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'center 40%',
                filter: 'contrast(1.15) brightness(0.85)',
              }}
            />
          ) : (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                backgroundColor: '#160505',
                backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(80, 15, 15, 0.45) 0%, #0d0202 100%)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '40px',
              }}
            >
              {/* Subtle hazard grid */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  opacity: 0.14,
                  backgroundImage:
                    'linear-gradient(rgba(239,68,68,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(239,68,68,0.2) 1px, transparent 1px)',
                  backgroundSize: '40px 40px',
                }}
              />
              <div
                style={{
                  position: 'relative',
                  zIndex: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                }}
              >
                <div
                  style={{
                    color: '#ef4444',
                    fontWeight: 900,
                    fontFamily: 'monospace',
                    fontSize: '15px',
                    letterSpacing: '3px',
                    textTransform: 'uppercase',
                    marginBottom: '10px',
                    textShadow: '0 0 10px rgba(239,68,68,0.5)',
                  }}
                >
                  🚨 {rightBadge || 'BENCANA GLOBAL'}
                </div>
                <div
                  style={{
                    color: '#ffffff',
                    fontSize: '36px',
                    fontWeight: 900,
                    fontFamily: "'Space Grotesk', -apple-system, sans-serif",
                    letterSpacing: '-1px',
                    lineHeight: 1.15,
                    textTransform: 'uppercase',
                    maxWidth: '850px',
                    textShadow: '0 4px 25px rgba(220,38,38,0.4)',
                  }}
                >
                  {rightTitle}
                </div>
                <div
                  style={{
                    marginTop: '12px',
                    color: '#f87171',
                    fontSize: '13px',
                    fontWeight: 700,
                    fontFamily: 'monospace',
                    letterSpacing: '2px',
                    opacity: 0.8,
                  }}
                >
                  [ TITIK BALIK PERADABAN DUNIA ]
                </div>
              </div>
            </div>
          )}
          {/* Red apocalyptic atmosphere gradient */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to bottom, rgba(220, 38, 38, 0.25) 0%, transparent 40%, rgba(5, 7, 10, 0.9) 100%)',
            }}
          />
        </div>
      </div>

      {/* Heavy bottom film gradient to guarantee 100% subtitle legibility */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: '520px',
          background: 'linear-gradient(to top, rgba(5, 7, 10, 0.98) 0%, rgba(5, 7, 10, 0.7) 60%, transparent 100%)',
          pointerEvents: 'none',
          zIndex: 25,
        }}
      />

      {/* Top Editorial Headline (Dynamic Clean Kicker & Headline) */}
      <div
        style={{
          position: 'absolute',
          top: '90px',
          left: '50px',
          right: '50px',
          zIndex: 35,
        }}
      >
        <div
          style={{
            fontFamily: "'Space Grotesk', -apple-system, sans-serif",
            fontSize: '15px',
            fontWeight: 800,
            color: isSecondHalf ? '#ef4444' : '#FFE600',
            letterSpacing: '2.5px',
            textTransform: 'uppercase',
            marginBottom: '8px',
            textShadow: '0 2px 10px rgba(0, 0, 0, 0.9)',
          }}
        >
          {isSecondHalf ? rightBadge : leftBadge}
        </div>

        <h1
          style={{
            fontSize: '44px',
            fontWeight: 900,
            color: '#ffffff',
            margin: 0,
            lineHeight: 1.15,
            letterSpacing: '-1px',
            fontFamily: "'Montserrat', sans-serif",
            textShadow: '0 3px 18px rgba(0, 0, 0, 0.95)',
          }}
        >
          {isSecondHalf ? rightTitle : leftTitle}
        </h1>
      </div>
    </div>
  );
};
