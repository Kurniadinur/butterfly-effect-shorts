import React from 'react';
import { Img, useCurrentFrame, useVideoConfig, spring, staticFile, interpolate } from 'remotion';
import { ButterflyNode } from '../data/types';

interface EvidenceCardProps {
  node: ButterflyNode;
  stepNumber: number;
  totalSteps: number;
}

export const EvidenceCard: React.FC<EvidenceCardProps> = ({ node, stepNumber, totalSteps }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Gentle smooth push-in
  const entrance = spring({
    frame,
    fps,
    config: {
      damping: 18,
      mass: 0.9,
      stiffness: 90,
    },
  });

  // Slow, natural Ken Burns documentary push
  const kenBurnsScale = interpolate(frame, [0, 240], [1.0, 1.1], {
    extrapolateRight: 'clamp',
  });

  const panY = interpolate(frame, [0, 240], [0, -10], {
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        position: 'absolute',
        top: '160px',
        left: '60px',
        right: '60px',
        bottom: '360px',
        transform: `scale(${entrance})`,
        opacity: entrance,
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '16px',
        backgroundColor: '#0f141f',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 25px 60px rgba(0, 0, 0, 0.9)',
        overflow: 'hidden',
        zIndex: 20,
      }}
    >
      {/* Archival Photo Container */}
      <div
        style={{
          flex: 1,
          position: 'relative',
          overflow: 'hidden',
          backgroundColor: '#05070a',
        }}
      >
        <Img
          src={staticFile(node.mediaUrl)}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center 25%',
            transform: `scale(${kenBurnsScale}) translateY(${panY}px)`,
            filter: 'contrast(1.05) brightness(0.96)',
          }}
        />

        {/* Natural Vignette on Photo */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, rgba(15, 20, 31, 0.95) 0%, transparent 45%, rgba(0, 0, 0, 0.3) 100%)',
            pointerEvents: 'none',
          }}
        />

        {/* Small Archival Stamp in Corner */}
        <div
          style={{
            position: 'absolute',
            top: '16px',
            left: '16px',
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            color: '#cbd5e1',
            fontSize: '13px',
            fontWeight: 700,
            letterSpacing: '1px',
            padding: '4px 10px',
            borderRadius: '4px',
            textTransform: 'uppercase',
            border: '1px solid rgba(255, 255, 255, 0.15)',
          }}
        >
          BUKTI #{stepNumber} DARI {totalSteps}
        </div>
      </div>

      {/* Documentary Editorial Caption Bar */}
      <div
        style={{
          padding: '24px 28px',
          backgroundColor: '#0f141f',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <div
          style={{
            fontSize: '15px',
            color: '#94a3b8',
            fontWeight: 700,
            letterSpacing: '1px',
            textTransform: 'uppercase',
            marginBottom: '6px',
          }}
        >
          {node.timeOrYear}
        </div>

        <h2
          style={{
            fontSize: '34px',
            fontWeight: 900,
            lineHeight: 1.2,
            color: '#ffffff',
            margin: 0,
            letterSpacing: '-0.5px',
            fontFamily: "'Montserrat', sans-serif",
          }}
        >
          {node.headline}
        </h2>

        <p
          style={{
            margin: '8px 0 0 0',
            fontSize: '18px',
            color: '#cbd5e1',
            fontWeight: 500,
            lineHeight: 1.4,
          }}
        >
          {node.caption}
        </p>
      </div>
    </div>
  );
};
