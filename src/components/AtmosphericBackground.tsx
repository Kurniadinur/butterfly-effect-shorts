import React from 'react';
import { useCurrentFrame, interpolate } from 'remotion';

interface AtmosphericBackgroundProps {
  chaosLevel: number; // 0 to 100
}

export const AtmosphericBackground: React.FC<AtmosphericBackgroundProps> = ({ chaosLevel }) => {
  const frame = useCurrentFrame();

  // Color interpolation based on chaosLevel: from cool navy (#040714) to warning crimson (#170308)
  const redComponent = Math.floor(
    interpolate(chaosLevel, [0, 100], [4, 25], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    })
  );
  const greenComponent = Math.floor(
    interpolate(chaosLevel, [0, 100], [8, 3], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    })
  );
  const blueComponent = Math.floor(
    interpolate(chaosLevel, [0, 100], [22, 10], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    })
  );
  const bgColor = `rgb(${redComponent}, ${greenComponent}, ${blueComponent})`;

  // Moving grid offset
  const gridOffsetY = (frame * 1.5) % 60;

  // Generate 16 deterministic floating particles
  const particles = Array.from({ length: 16 }).map((_, i) => {
    const seed = i * 137.5;
    const x = (seed % 1000) + 40;
    const initialY = (seed * 3) % 1920;
    const speed = 0.8 + (i % 3) * 0.5;
    const currentY = (initialY - frame * speed + 1920 * 2) % 1920;
    const opacity = 0.15 + 0.35 * Math.sin(frame * 0.05 + i);
    const size = 3 + (i % 4);
    return { id: i, x, y: currentY, opacity, size };
  });

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        backgroundColor: bgColor,
        overflow: 'hidden',
        pointerEvents: 'none',
      }}
    >
      {/* 3D Perspective Grid */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
          backgroundPosition: `0px ${gridOffsetY}px`,
          opacity: 0.8,
        }}
      />

      {/* Floating Dust / Ember Particles */}
      {particles.map((p) => (
        <div
          key={p.id}
          style={{
            position: 'absolute',
            left: `${p.x}px`,
            top: `${p.y}px`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            borderRadius: '50%',
            backgroundColor: chaosLevel > 60 ? '#ff4d4d' : '#38bdf8',
            opacity: p.opacity,
            boxShadow: `0 0 8px ${chaosLevel > 60 ? '#ff4d4d' : '#38bdf8'}`,
          }}
        />
      ))}

      {/* Cyber Scanline */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          height: '2px',
          top: `${(frame * 6) % 1920}px`,
          background: 'linear-gradient(90deg, transparent, rgba(56, 189, 248, 0.4), transparent)',
          opacity: 0.6,
        }}
      />

      {/* Heavy Cinematic Vignette */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(circle at 50% 50%, transparent 40%, rgba(0, 0, 0, 0.85) 100%)',
        }}
      />
    </div>
  );
};
