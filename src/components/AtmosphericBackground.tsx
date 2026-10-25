import React from 'react';
import { useCurrentFrame } from 'remotion';

export interface AtmosphericBackgroundProps {
  mood?: string;
}

export const AtmosphericBackground: React.FC<AtmosphericBackgroundProps> = ({ mood = 'cold-war-crisis' }) => {
  const frame = useCurrentFrame();

  // Slow, continuous ambient drift
  const driftY = (frame * 0.25) % 1920;

  // Mood-dependent lighting tones
  let ambientSpot = 'rgba(245, 158, 11, 0.25)'; // Amber / warm archival
  let midTone = '#1c283e';
  if (mood === 'noir-forensic') {
    ambientSpot = 'rgba(56, 189, 248, 0.22)'; // Cyan forensic
    midTone = '#131e33';
  } else if (mood === 'industrial-decay') {
    ambientSpot = 'rgba(234, 179, 8, 0.22)'; // Toxic amber
    midTone = '#1c2618';
  } else if (mood === 'amber-urgent') {
    ambientSpot = 'rgba(239, 68, 68, 0.26)'; // Crimson alert
    midTone = '#261619';
  }

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
      {/* 1. Rich Investigation Desk Base with Warm Overhead Desk Lamp Pool */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(ellipse at 50% 36%, ${ambientSpot} 0%, ${midTone} 48%, #090d16 80%, #04060a 100%)`,
        }}
      />

      {/* 2. Tactile Cartographic Coordinate Grid (Crisp Technical Blueprint) */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.16,
          backgroundImage: `
            linear-gradient(to right, rgba(255, 255, 255, 0.4) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.4) 1px, transparent 1px)
          `,
          backgroundSize: '100px 100px',
          backgroundPosition: `0px ${driftY * 0.4}px`,
        }}
      />

      {/* 3. Archival Forensic Measurement Rulers & Technical Framing on Left & Right Margins */}
      <svg
        style={{
          position: 'absolute',
          inset: 0,
          width: '1080px',
          height: '1920px',
          opacity: 0.42,
        }}
      >
        {/* Left Margin Ticks */}
        {Array.from({ length: 34 }).map((_, i) => {
          const y = 60 + i * 54;
          const isMajor = i % 4 === 0;
          return (
            <g key={`l-${i}`}>
              <line x1="18" y1={y} x2={isMajor ? "46" : "30"} y2={y} stroke="#94a3b8" strokeWidth={isMajor ? "2.5" : "1.2"} />
              {isMajor && (
                <text x="54" y={y + 4} fill="#cbd5e1" fontSize="11" fontWeight="bold" fontFamily="monospace">
                  {(i * 10).toString().padStart(3, '0')}
                </text>
              )}
            </g>
          );
        })}

        {/* Right Margin Ticks */}
        {Array.from({ length: 34 }).map((_, i) => {
          const y = 60 + i * 54;
          const isMajor = i % 4 === 0;
          return (
            <g key={`r-${i}`}>
              <line x1={isMajor ? "1034" : "1050"} y1={y} x2="1062" y2={y} stroke="#94a3b8" strokeWidth={isMajor ? "2.5" : "1.2"} />
              {isMajor && (
                <text x="1000" y={y + 4} fill="#cbd5e1" fontSize="11" fontWeight="bold" fontFamily="monospace" textAnchor="end">
                  SEC_{(i / 4 + 1).toString().padStart(2, '0')}
                </text>
              )}
            </g>
          );
        })}

        {/* Four Technical Corner Brackets */}
        <g stroke="#94a3b8" strokeWidth="2.5" fill="none" opacity="0.65">
          {/* Top-Left */}
          <path d="M 60 120 L 60 70 L 110 70" />
          {/* Top-Right */}
          <path d="M 1020 120 L 1020 70 L 970 70" />
          {/* Bottom-Left */}
          <path d="M 60 1800 L 60 1850 L 110 1850" />
          {/* Bottom-Right */}
          <path d="M 1020 1800 L 1020 1850 L 970 1850" />
        </g>

        {/* Subtle Crosshairs in Quadrants */}
        <g transform="translate(180, 290)">
          <line x1="-18" y1="0" x2="18" y2="0" stroke="#f59e0b" strokeWidth="1.8" opacity="0.6" />
          <line x1="0" y1="-18" x2="0" y2="18" stroke="#f59e0b" strokeWidth="1.8" opacity="0.6" />
          <circle cx="0" cy="0" r="10" fill="none" stroke="#f59e0b" strokeWidth="1.2" strokeDasharray="3 3" opacity="0.5" />
        </g>
        <g transform="translate(900, 290)">
          <line x1="-18" y1="0" x2="18" y2="0" stroke="#f59e0b" strokeWidth="1.8" opacity="0.6" />
          <line x1="0" y1="-18" x2="0" y2="18" stroke="#f59e0b" strokeWidth="1.8" opacity="0.6" />
          <circle cx="0" cy="0" r="10" fill="none" stroke="#f59e0b" strokeWidth="1.2" strokeDasharray="3 3" opacity="0.5" />
        </g>

        {/* Header Confidential Dossier Watermark */}
        <text x="540" y="55" fill="#64748b" fontSize="11" fontWeight="bold" fontFamily="monospace" textAnchor="middle" letterSpacing="4" opacity="0.55">
          FEDERAL ARCHIVAL INVESTIGATION // DOSSIER DECLASSIFIED
        </text>
      </svg>

      {/* 4. Film Grain / Micro Surface Texture */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.06,
          backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.5) 1px, transparent 1px)`,
          backgroundSize: '5px 5px',
          backgroundPosition: `0px ${driftY}px`,
        }}
      />

      {/* 5. Deep Cinematic Edge Falloff Vignette */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse at center, transparent 45%, rgba(2, 3, 6, 0.75) 100%)',
        }}
      />
    </div>
  );
};
