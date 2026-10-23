import React from 'react';
import { Img, useCurrentFrame, staticFile, interpolate } from 'remotion';
import { ZoomDirection } from '../data/types';

interface DocumentarySceneProps {
  mediaUrl: string;
  locationTag?: string;
  headline?: string;
  zoomDirection?: ZoomDirection;
  durationFrames: number;
}

export const DocumentaryScene: React.FC<DocumentarySceneProps> = ({
  mediaUrl,
  locationTag,
  headline,
  zoomDirection = 'in',
  durationFrames,
}) => {
  const frame = useCurrentFrame();

  // Normalize zoomDirection
  let dir = zoomDirection;
  if (dir === 'zoomIn') dir = 'in';
  if (dir === 'zoomOut') dir = 'out';
  if (dir !== 'in' && dir !== 'out' && dir !== 'panRight' && dir !== 'panLeft') {
    dir = 'in';
  }

  // Natural slow Ken Burns motion across the duration
  let scale = 1.0;
  let translateX = 0;
  let translateY = 0;

  if (dir === 'in') {
    scale = interpolate(frame, [0, durationFrames], [1.0, 1.12], { extrapolateRight: 'clamp' });
  } else if (dir === 'out') {
    scale = interpolate(frame, [0, durationFrames], [1.12, 1.0], { extrapolateRight: 'clamp' });
  } else if (dir === 'panRight') {
    scale = 1.08;
    translateX = interpolate(frame, [0, durationFrames], [-20, 20], { extrapolateRight: 'clamp' });
  } else {
    scale = 1.08;
    translateX = interpolate(frame, [0, durationFrames], [20, -20], { extrapolateRight: 'clamp' });
  }

  // Smooth fade-in for editorial label in first 15 frames
  const labelOpacity = interpolate(frame, [0, 15, durationFrames - 15, durationFrames], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        backgroundColor: '#05070a',
        overflow: 'hidden',
      }}
    >
      {/* Full-Bleed Archival Photo / Footage */}
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
            objectPosition: 'center 30%',
            filter: 'contrast(1.08) brightness(0.92)',
          }}
        />
      </div>

      {/* Cinematic Film Vignette & Atmosphere Gradient */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse at center, transparent 35%, rgba(0, 0, 0, 0.7) 100%)',
          pointerEvents: 'none',
        }}
      />

      {/* Dark gradient at the bottom to guarantee subtitle legibility */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: '550px',
          background: 'linear-gradient(to top, rgba(0, 0, 0, 0.95) 0%, rgba(0, 0, 0, 0.6) 50%, transparent 100%)',
          pointerEvents: 'none',
        }}
      />

      {/* Top Subtle Film Header (Clean Editorial Location / Date Tag) */}
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
            gap: '6px',
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: 'rgba(0, 0, 0, 0.65)',
              padding: '6px 14px',
              borderRadius: '4px',
              backdropFilter: 'blur(8px)',
              borderLeft: '3px solid #dc2626',
            }}
          >
            <span
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: '16px',
                fontWeight: 700,
                color: '#f8fafc',
                letterSpacing: '1px',
                textTransform: 'uppercase',
              }}
            >
              {locationTag}
            </span>
          </div>

          {headline && (
            <div
              style={{
                fontSize: '24px',
                fontWeight: 900,
                color: '#ffffff',
                textShadow: '0 2px 8px rgba(0, 0, 0, 0.9)',
                fontFamily: "'Montserrat', sans-serif",
                maxWidth: '700px',
                lineHeight: 1.2,
                marginTop: '4px',
              }}
            >
              {headline}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
