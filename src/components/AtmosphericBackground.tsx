import React from 'react';
import { useCurrentFrame } from 'remotion';

export const AtmosphericBackground: React.FC = () => {
  const frame = useCurrentFrame();

  // Subtle continuous camera drift
  const driftY = (frame * 0.4) % 1920;

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        backgroundColor: '#0a0d14',
        overflow: 'hidden',
        pointerEvents: 'none',
      }}
    >
      {/* Subtle organic warm dark gradient */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(circle at 50% 45%, #141824 0%, #080a0f 75%, #040508 100%)',
        }}
      />

      {/* 35mm Film Grain / Texture Simulation */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.07,
          backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.4) 1px, transparent 1px)`,
          backgroundSize: '4px 4px',
          backgroundPosition: `0px ${driftY}px`,
        }}
      />

      {/* Heavy Cinematic Vignette */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0, 0, 0, 0.85) 100%)',
        }}
      />
    </div>
  );
};
