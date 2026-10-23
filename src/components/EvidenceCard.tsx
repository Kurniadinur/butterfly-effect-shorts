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

  // Entrance spring animation
  const entrance = spring({
    frame,
    fps,
    config: {
      damping: 14,
      mass: 0.8,
      stiffness: 100,
    },
  });

  // Continuous subtle Ken Burns push-in
  const kenBurnsScale = interpolate(frame, [0, 180], [1.0, 1.15], {
    extrapolateRight: 'clamp',
  });

  // Pan offset
  const panY = interpolate(frame, [0, 180], [0, -15], {
    extrapolateRight: 'clamp',
  });

  // Color theme by chaos level
  const isCritical = node.chaosLevel >= 75;
  const borderColor = isCritical ? 'rgba(239, 68, 68, 0.8)' : 'rgba(56, 189, 248, 0.6)';
  const glowColor = isCritical ? 'rgba(239, 68, 68, 0.3)' : 'rgba(56, 189, 248, 0.2)';

  // Screen shake on extreme chaos
  let shakeX = 0;
  let shakeY = 0;
  if (node.chaosLevel >= 85 && frame < 30) {
    shakeX = Math.sin(frame * 1.5) * 8 * (1 - frame / 30);
    shakeY = Math.cos(frame * 1.5) * 6 * (1 - frame / 30);
  }

  return (
    <div
      style={{
        position: 'absolute',
        top: '200px',
        left: '60px',
        right: '60px',
        bottom: '440px',
        transform: `translate(${shakeX}px, ${shakeY}px) scale(${entrance})`,
        opacity: entrance,
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '24px',
        backgroundColor: 'rgba(10, 15, 30, 0.85)',
        border: `2px solid ${borderColor}`,
        boxShadow: `0 20px 50px rgba(0, 0, 0, 0.8), 0 0 30px ${glowColor}`,
        overflow: 'hidden',
        backdropFilter: 'blur(16px)',
        zIndex: 20,
      }}
    >
      {/* Forensic Card Header */}
      <div
        style={{
          padding: '18px 24px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'linear-gradient(90deg, rgba(255, 255, 255, 0.06), transparent)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span
            style={{
              backgroundColor: isCritical ? '#ef4444' : '#0284c7',
              color: '#ffffff',
              fontSize: '18px',
              fontWeight: 800,
              padding: '4px 12px',
              borderRadius: '6px',
              letterSpacing: '1px',
            }}
          >
            NODE {stepNumber} / {totalSteps}
          </span>
          <span
            style={{
              fontSize: '20px',
              fontWeight: 600,
              color: '#cbd5e1',
              letterSpacing: '0.5px',
            }}
          >
            BERKAS FORENSIK: {node.timeOrYear}
          </span>
        </div>

        <div
          style={{
            fontSize: '16px',
            color: '#94a3b8',
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          EVENT_ID: #{1089 + stepNumber * 14}
        </div>
      </div>

      {/* Media Window with Ken Burns Zoom */}
      <div
        style={{
          flex: 1,
          position: 'relative',
          overflow: 'hidden',
          backgroundColor: '#000000',
        }}
      >
        <Img
          src={staticFile(node.mediaUrl)}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transform: `scale(${kenBurnsScale}) translateY(${panY}px)`,
            filter: 'contrast(1.08) brightness(0.95)',
          }}
        />

        {/* Vintage Film Texture Overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, rgba(10, 15, 30, 0.95) 0%, transparent 40%, rgba(0, 0, 0, 0.4) 100%)',
            pointerEvents: 'none',
          }}
        />

        {/* Tactical Crosshair Overlay in Corners */}
        <div
          style={{
            position: 'absolute',
            top: '20px',
            left: '20px',
            fontSize: '24px',
            color: borderColor,
            lineHeight: 1,
            fontWeight: 300,
          }}
        >
          ┌
        </div>
        <div
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            fontSize: '24px',
            color: borderColor,
            lineHeight: 1,
            fontWeight: 300,
          }}
        >
          ┐
        </div>
        <div
          style={{
            position: 'absolute',
            bottom: '20px',
            left: '20px',
            fontSize: '24px',
            color: borderColor,
            lineHeight: 1,
            fontWeight: 300,
          }}
        >
          └
        </div>
        <div
          style={{
            position: 'absolute',
            bottom: '20px',
            right: '20px',
            fontSize: '24px',
            color: borderColor,
            lineHeight: 1,
            fontWeight: 300,
          }}
        >
          ┘
        </div>
      </div>

      {/* Card Headline Banner */}
      <div
        style={{
          padding: '24px 30px',
          background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.9), rgba(8, 12, 24, 0.98))',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <h2
          style={{
            fontSize: '36px',
            fontWeight: 900,
            lineHeight: 1.25,
            color: '#ffffff',
            margin: 0,
            letterSpacing: '-0.5px',
            textShadow: '0 2px 10px rgba(0, 0, 0, 0.7)',
          }}
        >
          {node.headline}
        </h2>
        <div
          style={{
            marginTop: '8px',
            fontSize: '20px',
            color: '#94a3b8',
            fontWeight: 500,
          }}
        >
          {node.caption}
        </div>
      </div>
    </div>
  );
};
