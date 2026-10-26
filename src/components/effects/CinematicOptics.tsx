import React from 'react';
import { useCurrentFrame, random } from 'remotion';

interface CinematicOpticsProps {
  intensity?: 'subtle' | 'standard' | 'heavy';
}

/**
 * CinematicOptics:
 * Eliminates the sterile "HTML/Remotion digital template look" by emulating real
 * optical film mechanics:
 * 1. 35mm Film Gate Weave (organic microscopic mechanical projector jitter)
 * 2. Optical Halation (warm photographic emulsion glow)
 * 3. Anamorphic Lens Barrel Curvature & Corner Softness
 * 4. Micro Archival Dust & Atmospheric Film Particles
 */
export const CinematicOptics: React.FC<CinematicOpticsProps> = ({ intensity = 'standard' }) => {
  const frame = useCurrentFrame();

  const mult = intensity === 'subtle' ? 0.6 : intensity === 'heavy' ? 1.4 : 1.0;

  // 1. 35mm Gate Weave (microscopic mechanical film gate drift)
  // Subtle pseudo-random oscillation (never purely periodic, mimics physical sprocket tooth tension)
  const weaveX =
    (Math.sin(frame * 0.42) * 0.35 + Math.cos(frame * 0.87) * 0.25) * mult;
  const weaveY =
    (Math.cos(frame * 0.35) * 0.4 + Math.sin(frame * 0.95) * 0.2) * mult;

  // 2. Optical Shutter Exposure Pulse (1/48s cinema exposure fluctuation: ~1.5% micro-luma flutter)
  const shutterPulse = 1.0 + (Math.sin(frame * 0.73) * 0.012 + (random(frame) * 0.008 - 0.004)) * mult;

  // 3. Floating archival dust motes (3 slow-drifting microscopic flecks)
  const dust1Y = (frame * 1.2) % 1920;
  const dust1X = 280 + Math.sin(frame * 0.03) * 40;
  const dust2Y = 1920 - ((frame * 0.8) % 1920);
  const dust2X = 820 + Math.cos(frame * 0.02) * 50;

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 49,
        overflow: 'hidden',
        transform: `translate3d(${weaveX}px, ${weaveY}px, 0)`,
      }}
    >
      {/* A. Optical Halation & Warm Emulsion Bleed */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(ellipse at 50% 35%, rgba(255, 140, 40, 0.035) 0%, rgba(200, 40, 20, 0.015) 50%, transparent 80%)',
          mixBlendMode: 'screen',
          opacity: shutterPulse,
        }}
      />

      {/* B. Anamorphic Lens Corner Falloff & Curved Vignette */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(ellipse 70% 60% at 50% 50%, transparent 55%, rgba(2, 4, 8, 0.5) 88%, rgba(1, 2, 5, 0.85) 100%)',
          mixBlendMode: 'multiply',
        }}
      />

      {/* C. 35mm Micro-Dust Particles in Projector Light Beam */}
      <div
        style={{
          position: 'absolute',
          top: `${dust1Y}px`,
          left: `${dust1X}px`,
          width: '2.5px',
          height: '2.5px',
          borderRadius: '50%',
          backgroundColor: 'rgba(255, 235, 200, 0.28)',
          boxShadow: '0 0 6px rgba(255, 220, 180, 0.4)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: `${dust2Y}px`,
          left: `${dust2X}px`,
          width: '3px',
          height: '2px',
          borderRadius: '40%',
          backgroundColor: 'rgba(255, 255, 255, 0.22)',
          transform: `rotate(${frame * 2}deg)`,
        }}
      />

      {/* D. Vintage Anamorphic Horizontal Streak (Ultra-subtle blue anamorphic flare trace) */}
      <div
        style={{
          position: 'absolute',
          top: '32%',
          left: 0,
          right: 0,
          height: '1px',
          background:
            'linear-gradient(90deg, transparent 0%, rgba(56, 189, 248, 0.08) 50%, transparent 100%)',
          filter: 'blur(1px)',
          opacity: 0.5 + Math.sin(frame * 0.08) * 0.3,
        }}
      />
    </div>
  );
};
