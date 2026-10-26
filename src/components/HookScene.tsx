import React from 'react';
import { Img, useCurrentFrame, staticFile, interpolate } from 'remotion';

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
  hookStyle = 'fullscreen-dramatic',
  archetype,
  headline: rawHeadline,
  kicker: rawKicker,
  leftTitle,
  rightTitle,
  leftBadge: rawLeftBadge,
  rightBadge: rawRightBadge,
  leftPrimaryText,
  leftStampText: rawLeftStampText,
  leftImage,
  rightImage,
  durationFrames = 250,
}) => {
  const frame = useCurrentFrame();
  const leftBadge = rawLeftBadge || 'AWAL MULA SEPELE';
  const rightBadge = rawRightBadge || 'BENCANA GLOBAL';
  const leftStampText = rawLeftStampText || 'BUKTI AWAL';
  const kicker = rawKicker || 'DOKUMENTER SEJARAH';
  const headline = rawHeadline || rightTitle || leftTitle || 'TRAGEDI BESAR DUNIA';
  const heroImage = rightImage || leftImage;

  // Unbroken continuous Ken Burns motion drift
  const masterScale = interpolate(frame, [0, durationFrames], [1.02, 1.15], {
    extrapolateRight: 'clamp',
  });
  const panY = interpolate(frame, [0, durationFrames], [0, -25], {
    extrapolateRight: 'clamp',
  });

  // =========================================================================
  // STYLE 1: FULLSCREEN DRAMATIC (Default Modern YouTube Shorts / TikTok style)
  // Single, full-canvas 1080x1920 cinematic immersion (NO split screen boxes!)
  // =========================================================================
  if (hookStyle === 'fullscreen-dramatic' || !hookStyle) {
    return (
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: 'transparent',
          overflow: 'hidden',
        }}
      >
        {/* Fullscreen Hero Background */}
        <div
          style={{
            position: 'absolute',
            inset: -40,
            transform: `scale(${masterScale}) translateY(${panY}px)`,
            transformOrigin: 'center 40%',
          }}
        >
          {heroImage ? (
            <Img
              src={staticFile(heroImage)}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                filter: 'contrast(1.18) brightness(0.72) saturate(0.9)',
              }}
            />
          ) : (
            // Fullscreen High-Resolution Cinematic Ambient Background
            <Img
              src={staticFile('butterfly/media/brandenburg_night.jpg')}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                filter: 'contrast(1.18) brightness(0.65) saturate(0.8)',
              }}
            />
          )}
        </div>

        {/* Cinematic Film Vignette & Heavy Bottom Gradient for Subtitles */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(ellipse at center, transparent 35%, rgba(3, 5, 8, 0.85) 100%)',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            height: '380px',
            background:
              'linear-gradient(to top, rgba(3, 5, 8, 0.75) 0%, rgba(3, 5, 8, 0.25) 55%, transparent 100%)',
            pointerEvents: 'none',
          }}
        />

        {/* Top Editorial Kicker & Dynamic Documentary Headline */}
        <div
          style={{
            position: 'absolute',
            top: '120px',
            left: '60px',
            right: '60px',
            zIndex: 30,
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 14px',
              backgroundColor: 'rgba(239, 68, 68, 0.25)',
              border: '1px solid rgba(239, 68, 68, 0.5)',
              borderRadius: '4px',
              marginBottom: '14px',
            }}
          >
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ef4444' }} />
            <span
              style={{
                color: '#fca5a5',
                fontSize: '15px',
                fontWeight: 900,
                fontFamily: 'monospace',
                letterSpacing: '2.5px',
                textTransform: 'uppercase',
              }}
            >
              {kicker}
            </span>
          </div>

          <h1
            style={{
              fontSize: '52px',
              fontWeight: 900,
              color: '#ffffff',
              lineHeight: 1.1,
              letterSpacing: '-1.5px',
              fontFamily: "'Space Grotesk', -apple-system, sans-serif",
              textTransform: 'uppercase',
              margin: 0,
              textShadow: '0 4px 24px rgba(0,0,0,0.9)',
            }}
          >
            {headline}
          </h1>

          <div
            style={{
              marginTop: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              color: '#94a3b8',
              fontSize: '14px',
              fontWeight: 700,
              fontFamily: 'monospace',
            }}
          >
            <span style={{ color: '#FFE600' }}>[ KASUS #{Math.abs(durationFrames % 99) + 1} ]</span>
            <span>REKONSTRUKSI FAKTA DEKLASIFIKASI</span>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // STYLE 2: FORENSIC DOSSIER (Investigative True Crime & Documentary Archive style)
  // =========================================================================
  if (hookStyle === 'forensic-dossier') {
    return (
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: '#05070c',
          overflow: 'hidden',
        }}
      >
        {/* Soft Warm Desk-Lamp Spotlight (Cinematic Documentary Lighting - Zero Sci-Fi Grids) */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(ellipse 80% 60% at 50% 38%, rgba(245, 158, 11, 0.08) 0%, rgba(15, 23, 42, 0.4) 50%, #030508 100%)',
          }}
        />

        {/* Central Archival Dossier Folder with Organic Physical Drop Shadow */}
        <div
          style={{
            position: 'absolute',
            top: '200px',
            left: '50px',
            right: '50px',
            bottom: '450px',
            backgroundColor: '#0f141f',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '12px',
            padding: '50px 42px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxShadow: '0 30px 70px rgba(0, 0, 0, 0.9), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
          }}
        >
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#dc2626', fontWeight: 900, fontFamily: "'Montserrat', sans-serif", fontSize: '16px', letterSpacing: '3px' }}>
                CONFIDENTIAL // TOP SECRET
              </span>
              <span style={{ color: '#94a3b8', fontFamily: "'Space Grotesk', sans-serif", fontSize: '13px', fontWeight: 700 }}>
                {kicker || 'BERKAS DOKUMENTER'}
              </span>
            </div>

            <h1
              style={{
                color: '#ffffff',
                fontSize: '48px',
                fontWeight: 900,
                fontFamily: "'Montserrat', -apple-system, sans-serif",
                lineHeight: 1.15,
                marginTop: '30px',
                textTransform: 'uppercase',
                textShadow: '0 4px 16px rgba(0,0,0,0.8)',
              }}
            >
              {headline}
            </h1>

            <div
              style={{
                marginTop: '25px',
                padding: '20px 24px',
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                borderLeft: '4px solid #FFE600',
                color: '#e2e8f0',
                fontSize: '20px',
                fontWeight: 700,
                lineHeight: 1.45,
                fontFamily: "'Space Grotesk', sans-serif",
              }}
            >
              {leftPrimaryText || leftTitle}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div style={{ color: '#94a3b8', fontSize: '13px', fontFamily: 'monospace' }}>
              STATUS: DEKLASIFIKASI DOKUMENTER
            </div>
            {/* Red Forensic Stamp */}
            <div
              style={{
                border: '4px solid #ef4444',
                color: '#ef4444',
                padding: '8px 16px',
                fontSize: '28px',
                fontWeight: 900,
                fontFamily: 'monospace',
                letterSpacing: '4px',
                transform: 'rotate(-8deg)',
                opacity: 0.9,
              }}
            >
              {leftStampText || 'VERIFIED'}
            </div>
          </div>
        </div>

        {/* Bottom Subtitle Shadow */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            height: '480px',
            background: 'linear-gradient(to top, rgba(3, 5, 8, 0.98) 0%, transparent 100%)',
            pointerEvents: 'none',
          }}
        />
      </div>
    );
  }

  // =========================================================================
  // STYLE 3: BREAKING TRANSMISSION (Emergency TV Broadcast Glitch style)
  // =========================================================================
  if (hookStyle === 'breaking-transmission') {
    return (
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: '#0a0a0f',
          overflow: 'hidden',
        }}
      >
        {/* Analog Scanlines */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.5) 0px, rgba(0,0,0,0.5) 2px, transparent 2px, transparent 4px)',
            pointerEvents: 'none',
            zIndex: 15,
            opacity: 0.6,
          }}
        />

        {/* Background Image or Static Noise */}
        {heroImage && (
          <Img
            src={staticFile(heroImage)}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              filter: 'contrast(1.3) brightness(0.65) grayscale(0.2)',
              transform: `scale(${masterScale})`,
            }}
          />
        )}

        {/* Emergency Alert Header Banner */}
        <div
          style={{
            position: 'absolute',
            top: '80px',
            left: 0,
            right: 0,
            backgroundColor: '#dc2626',
            color: '#ffffff',
            padding: '12px 30px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontWeight: 900,
            fontFamily: 'monospace',
            letterSpacing: '3px',
            fontSize: '18px',
            zIndex: 25,
            boxShadow: '0 4px 20px rgba(220, 38, 38, 0.5)',
          }}
        >
          <span>🚨 SPECIAL BULLETIN // TRANSMISI DARURAT</span>
          <span style={{ backgroundColor: '#ffffff', color: '#dc2626', padding: '2px 8px', borderRadius: '2px' }}>LIVE</span>
        </div>

        {/* Headline */}
        <div
          style={{
            position: 'absolute',
            top: '180px',
            left: '60px',
            right: '60px',
            zIndex: 25,
          }}
        >
          <h1
            style={{
              fontSize: '56px',
              fontWeight: 900,
              color: '#ffffff',
              lineHeight: 1.1,
              letterSpacing: '-2px',
              textTransform: 'uppercase',
              fontFamily: "'Space Grotesk', sans-serif",
              textShadow: '0 4px 25px rgba(0,0,0,0.9)',
            }}
          >
            {headline}
          </h1>
        </div>

        {/* Bottom Subtitle Shadow */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            height: '480px',
            background: 'linear-gradient(to top, rgba(5, 7, 10, 0.98) 0%, transparent 100%)',
            pointerEvents: 'none',
          }}
        />
      </div>
    );
  }

  // =========================================================================
  // STYLE 4: SPLIT CONTRAST (Classic Upper/Lower Contrast when chosen)
  // =========================================================================
  const switchPoint = Math.round(durationFrames * 0.48);
  const isSecondHalf = frame >= switchPoint;
  const panX = interpolate(frame, [0, durationFrames], [-15, 15], { extrapolateRight: 'clamp' });
  const leftOpacity = interpolate(frame, [0, switchPoint - 15, switchPoint, durationFrames], [1.0, 1.0, 0.25, 0.15], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const rightOpacity = interpolate(frame, [0, switchPoint - 10, switchPoint + 10, durationFrames], [0.2, 0.35, 1.0, 1.0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <div style={{ position: 'absolute', inset: 0, backgroundColor: '#05070a', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, transform: `scale(${masterScale}) translateX(${panX}px)`, transformOrigin: 'center center' }}>
        {/* Upper Panel */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '52%', overflow: 'hidden', opacity: leftOpacity, transition: 'opacity 0.2s ease-out' }}>
          {leftImage ? (
            <Img src={staticFile(leftImage)} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'contrast(1.15) brightness(0.85)' }} />
          ) : (
            <div style={{ position: 'absolute', inset: 0, backgroundColor: '#0a0f18', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
              <div style={{ color: '#FFE600', fontWeight: 900, fontFamily: 'monospace', fontSize: '15px', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '10px' }}>
                ⚡ {leftStampText}
              </div>
              <div style={{ color: '#ffffff', fontSize: '36px', fontWeight: 900, fontFamily: "'Space Grotesk', sans-serif", letterSpacing: '-1px', lineHeight: 1.15, textTransform: 'uppercase', textAlign: 'center' }}>
                {leftPrimaryText || leftTitle}
              </div>
            </div>
          )}
        </div>

        {/* Lower Panel */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '52%', overflow: 'hidden', opacity: rightOpacity, transition: 'opacity 0.2s ease-out' }}>
          {rightImage ? (
            <Img src={staticFile(rightImage)} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'contrast(1.15) brightness(0.85)' }} />
          ) : (
            <div style={{ position: 'absolute', inset: 0, backgroundColor: '#160505', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
              <div style={{ color: '#ef4444', fontWeight: 900, fontFamily: 'monospace', fontSize: '15px', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '10px' }}>
                🚨 {rightBadge}
              </div>
              <div style={{ color: '#ffffff', fontSize: '36px', fontWeight: 900, fontFamily: "'Space Grotesk', sans-serif", letterSpacing: '-1px', lineHeight: 1.15, textTransform: 'uppercase', textAlign: 'center' }}>
                {rightTitle}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Top Editorial Headline */}
      <div style={{ position: 'absolute', top: '90px', left: '50px', right: '50px', zIndex: 35 }}>
        <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '15px', fontWeight: 800, color: isSecondHalf ? '#ef4444' : '#FFE600', letterSpacing: '2.5px', textTransform: 'uppercase', marginBottom: '8px' }}>
          {isSecondHalf ? rightBadge : leftBadge}
        </div>
        <h1 style={{ fontSize: '44px', fontWeight: 900, color: '#ffffff', margin: 0, lineHeight: 1.15, textTransform: 'uppercase' }}>
          {isSecondHalf ? rightTitle : leftTitle}
        </h1>
      </div>

      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: '520px', background: 'linear-gradient(to top, rgba(5, 7, 10, 0.98) 0%, rgba(5, 7, 10, 0.7) 60%, transparent 100%)', pointerEvents: 'none', zIndex: 25 }} />
    </div>
  );
};
