import React from 'react';
import { Img, useCurrentFrame, staticFile, interpolate } from 'remotion';
import { ZoomDirection } from '../data/types';

interface DocumentarySceneProps {
  mediaUrl: string;
  locationTag?: string;
  headline?: string;
  zoomDirection?: ZoomDirection;
  durationFrames: number;
  mood?: string;
  visualSourceTag?: string;
}

export const DocumentaryScene: React.FC<DocumentarySceneProps> = ({
  mediaUrl,
  locationTag,
  headline,
  zoomDirection = 'in',
  durationFrames,
  mood = 'cold-war-crisis',
  visualSourceTag = 'REKA ADEGAN',
}) => {
  const frame = useCurrentFrame();

  // Normalize zoomDirection
  let dir = zoomDirection;
  if (dir === 'zoomIn') dir = 'in';
  if (dir === 'zoomOut') dir = 'out';
  if (dir !== 'in' && dir !== 'out' && dir !== 'panRight' && dir !== 'panLeft') {
    dir = 'in';
  }

  // Smooth cinematic Ken Burns camera motion
  let scale = 1.0;
  let translateX = 0;
  let translateY = 0;

  if (dir === 'in') {
    scale = interpolate(frame, [0, durationFrames], [1.0, 1.14], { extrapolateRight: 'clamp' });
    translateY = interpolate(frame, [0, durationFrames], [0, -15], { extrapolateRight: 'clamp' });
  } else if (dir === 'out') {
    scale = interpolate(frame, [0, durationFrames], [1.14, 1.0], { extrapolateRight: 'clamp' });
    translateY = interpolate(frame, [0, durationFrames], [-15, 0], { extrapolateRight: 'clamp' });
  } else if (dir === 'panRight') {
    scale = 1.10;
    translateX = interpolate(frame, [0, durationFrames], [-25, 25], { extrapolateRight: 'clamp' });
  } else {
    scale = 1.10;
    translateX = interpolate(frame, [0, durationFrames], [25, -25], { extrapolateRight: 'clamp' });
  }

  // Smooth fade-in for editorial header in first 14 frames
  const labelOpacity = interpolate(frame, [0, 14, durationFrames - 12, durationFrames], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Dynamic subtle cinematic projector light sweep (0.05 to 0.12 opacity)
  const sweepPercent = interpolate(frame, [0, durationFrames], [20, 80], { extrapolateRight: 'clamp' });

  // Mood color grading overlay
  let moodTint = 'rgba(56, 189, 248, 0.05)'; // default cold war teal/cyan
  let moodBorder = '#dc2626'; // crimson accent
  if (mood === 'noir-forensic') {
    moodTint = 'rgba(245, 158, 11, 0.04)';
    moodBorder = '#f59e0b';
  } else if (mood === 'amber-urgent') {
    moodTint = 'rgba(234, 88, 12, 0.06)';
    moodBorder = '#ea580c';
  } else if (mood === 'clean-documentary') {
    moodTint = 'rgba(255, 255, 255, 0.02)';
    moodBorder = '#2563eb';
  }

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        backgroundColor: '#040608',
        overflow: 'hidden',
      }}
    >
      {/* 1. Full-Bleed High-Resolution Photographic Canvas */}
      <div
        style={{
          width: '100%',
          height: '100%',
          transform: `scale(${scale}) translate(${translateX}px, ${translateY}px)`,
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
            filter: 'contrast(1.12) brightness(0.92) saturate(1.05)',
          }}
        />
      </div>

      {/* 2. Volumetric Projector Light Sweep */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(ellipse at ${sweepPercent}% 30%, rgba(255, 255, 255, 0.12) 0%, transparent 65%)`,
          pointerEvents: 'none',
          mixBlendMode: 'screen',
        }}
      />

      {/* 3. Mood Color Grade Wash */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: moodTint,
          pointerEvents: 'none',
          mixBlendMode: 'color',
        }}
      />

      {/* 4. Cinematic Vignette (Heavy filmic edges) */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse at center, transparent 38%, rgba(0, 0, 0, 0.72) 100%)',
          pointerEvents: 'none',
        }}
      />

      {/* 5. Subtitle Safe Zone Protective Gradient (Dark drop-off starting at y=1200px) */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: '680px',
          background: 'linear-gradient(to top, rgba(0, 0, 0, 0.96) 0%, rgba(0, 0, 0, 0.75) 45%, rgba(0, 0, 0, 0.25) 80%, transparent 100%)',
          pointerEvents: 'none',
        }}
      />

      {/* 6. Top Editorial Header (Location & Headline Tag) */}
      {locationTag && (
        <div
          style={{
            position: 'absolute',
            top: '80px',
            left: '50px',
            zIndex: 30,
            opacity: labelOpacity,
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: 'rgba(5, 7, 10, 0.82)',
              padding: '6px 16px',
              borderRadius: '4px',
              backdropFilter: 'blur(10px)',
              borderLeft: `4px solid ${moodBorder}`,
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.6)',
            }}
          >
            <span
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: '16px',
                fontWeight: 700,
                color: '#f8fafc',
                letterSpacing: '1.2px',
                textTransform: 'uppercase',
              }}
            >
              {locationTag}
            </span>
          </div>

          {headline && (
            <div
              style={{
                fontSize: '26px',
                fontWeight: 900,
                color: '#ffffff',
                textShadow: '0 3px 12px rgba(0, 0, 0, 0.95)',
                fontFamily: "'Montserrat', sans-serif",
                maxWidth: '720px',
                lineHeight: 1.25,
                marginTop: '2px',
                letterSpacing: '-0.3px',
              }}
            >
              {headline}
            </div>
          )}
        </div>
      )}

      {/* 7. Journalistic / Ethical Disclaimer Tag (Reka Adegan / Arsip Sejarah) */}
      <div
        style={{
          position: 'absolute',
          top: '80px',
          right: '50px',
          zIndex: 30,
          opacity: labelOpacity,
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          backgroundColor: 'rgba(5, 7, 10, 0.82)',
          padding: '6px 14px',
          borderRadius: '4px',
          border: '1px solid rgba(255, 255, 255, 0.14)',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.6)',
        }}
      >
        <span
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            backgroundColor: visualSourceTag === 'ARSIP SEJARAH' ? '#38bdf8' : '#f59e0b',
            boxShadow: visualSourceTag === 'ARSIP SEJARAH' ? '0 0 8px #38bdf8' : '0 0 8px #f59e0b',
          }}
        />
        <span
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: '12px',
            fontWeight: 700,
            color: '#e2e8f0',
            letterSpacing: '1px',
            textTransform: 'uppercase',
          }}
        >
          {visualSourceTag}
        </span>
      </div>
    </div>
  );
};
