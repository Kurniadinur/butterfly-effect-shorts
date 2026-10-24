import React from 'react';
import { useCurrentFrame, interpolate } from 'remotion';
import { EditorialStyle } from '../../data/types';

interface FilmEffectsProps {
  editorialStyle?: EditorialStyle;
}

/**
 * Editorial Color Grade Presets:
 * Tailored palettes providing distinct cinematic atmosphere per topic
 * while keeping visuals comfortable and easy on the eyes.
 */
const MOOD_PALETTES: Record<
  string,
  {
    tintColor: string;
    lightLeakColor: string;
    defaultVignette: number;
    defaultGrain: number;
  }
> = {
  'cold-war-crisis': {
    tintColor: 'rgba(14, 26, 28, 0.14)', // Cold slate-green undertone (tense espionage)
    lightLeakColor: 'rgba(100, 140, 160, 0.12)',
    defaultVignette: 0.35,
    defaultGrain: 0.048,
  },
  'noir-forensic': {
    tintColor: 'rgba(12, 18, 34, 0.16)', // Deep oceanic slate-blue (mystery, investigation)
    lightLeakColor: 'rgba(90, 120, 180, 0.10)',
    defaultVignette: 0.40,
    defaultGrain: 0.045,
  },
  'amber-urgent': {
    tintColor: 'rgba(40, 24, 8, 0.13)', // Warm amber tungsten (breaking news, fast-paced)
    lightLeakColor: 'rgba(235, 145, 45, 0.14)',
    defaultVignette: 0.32,
    defaultGrain: 0.050,
  },
  'industrial-decay': {
    tintColor: 'rgba(32, 20, 12, 0.15)', // Gritty rust-bronze / charcoal (catastrophe, hazard)
    lightLeakColor: 'rgba(210, 110, 60, 0.12)',
    defaultVignette: 0.42,
    defaultGrain: 0.055,
  },
  'clean-documentary': {
    tintColor: 'rgba(8, 14, 22, 0.08)', // Crisp neutral cinema (scientific discovery, clean)
    lightLeakColor: 'rgba(180, 210, 240, 0.08)',
    defaultVignette: 0.28,
    defaultGrain: 0.035,
  },
};

/**
 * FilmEffects Component:
 * Delivers professional 35mm cinematic film aesthetic:
 * 1. Eye-comfortable, subtle procedural film grain
 * 2. Natural soft vignette
 * 3. Drifting ambient light leak
 * 4. Topic-tailored color grade tint
 */
export const FilmEffects: React.FC<FilmEffectsProps> = ({ editorialStyle }) => {
  const frame = useCurrentFrame();

  const moodKey = editorialStyle?.mood || 'cold-war-crisis';
  const palette = MOOD_PALETTES[moodKey] || MOOD_PALETTES['cold-war-crisis'];

  // Safe eye-comfort bounds: grain strictly clamped between 0.025 and 0.065
  const rawGrain = editorialStyle?.grainIntensity ?? palette.defaultGrain;
  const grainOpacity = Math.max(0.025, Math.min(0.065, rawGrain));

  // Vignette strength (0.2 to 0.5)
  const rawVignette = editorialStyle?.vignetteStrength ?? palette.defaultVignette;
  const vignetteOpacity = Math.max(0.2, Math.min(0.5, rawVignette));

  // Dynamic slow ambient drift for light leak (360-frame cycle)
  const leakCycle = frame % 360;
  const leakOpacity = interpolate(
    leakCycle,
    [0, 90, 180, 270, 360],
    [0.08, 0.14, 0.09, 0.15, 0.08]
  );
  const leakShiftX = interpolate(leakCycle, [0, 180, 360], [-20, 30, -20]);
  const leakShiftY = interpolate(leakCycle, [0, 180, 360], [10, -25, 10]);

  // Position preference
  const leakPosition = editorialStyle?.lightLeak?.position || 'top-right';
  const leakPosStyle =
    leakPosition === 'top-left'
      ? { top: '-15%', left: '-15%' }
      : leakPosition === 'bottom-right'
      ? { bottom: '-15%', right: '-15%' }
      : leakPosition === 'bottom-left'
      ? { bottom: '-15%', left: '-15%' }
      : { top: '-15%', right: '-15%' }; // default top-right

  const leakColor = editorialStyle?.lightLeak?.color || palette.lightLeakColor;
  const tintColor = editorialStyle?.tintColor || palette.tintColor;

  // Grain seed changes every 3 frames for gentle organic motion without strobe flicker
  const grainSeed = Math.floor(frame / 3) % 100;

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 42,
        overflow: 'hidden',
      }}
    >
      {/* 1. Cinematic Color Grade Tint Overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: tintColor,
          mixBlendMode: 'color',
          opacity: 0.9,
        }}
      />

      {/* 2. Soft Ambient Light Leak (Floating Organic Corner Glow) */}
      <div
        style={{
          position: 'absolute',
          width: '900px',
          height: '900px',
          borderRadius: '50%',
          ...leakPosStyle,
          background: `radial-gradient(circle, ${leakColor} 0%, rgba(0,0,0,0) 70%)`,
          transform: `translate(${leakShiftX}px, ${leakShiftY}px)`,
          opacity: leakOpacity,
          mixBlendMode: 'screen',
        }}
      />

      {/* 3. Subtle 35mm Film Grain (SVG Procedural Turbulence) */}
      <svg
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          opacity: grainOpacity,
          mixBlendMode: 'overlay',
        }}
      >
        <filter id="cinematic-film-grain">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.75"
            numOctaves="2"
            seed={grainSeed}
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#cinematic-film-grain)" />
      </svg>

      {/* 4. Film Vignette Edge Shadow (Soft Eye-Comfort Falloff) */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 58%, rgba(0,0,0,${vignetteOpacity}) 100%)`,
          mixBlendMode: 'multiply',
        }}
      />
    </div>
  );
};
