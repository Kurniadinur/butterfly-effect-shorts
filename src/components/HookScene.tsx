import React from 'react';
import { Img, useCurrentFrame, staticFile, interpolate } from 'remotion';

export interface HookSceneProps {
  leftTitle: string;
  rightTitle: string;
  leftBadge?: string;
  rightBadge?: string;
  leftPrimaryText?: string;
  leftSecondaryText?: string;
  leftStampText?: string;
  leftImage?: string;
  rightImage?: string;
  durationFrames?: number;
}

export const HookScene: React.FC<HookSceneProps> = ({
  leftTitle,
  rightTitle,
  leftBadge = '⚡ AWAL MULA SEPELE',
  rightBadge = '🚨 BENCANA GLOBAL',
  leftPrimaryText,
  leftSecondaryText,
  leftStampText = 'BUKTI SEPELE',
  leftImage = 'butterfly/media/memo_document.jpg',
  rightImage = 'butterfly/media/wall_demolition.jpg',
  durationFrames = 257,
}) => {
  const frame = useCurrentFrame();

  // 1. Continuous, monotonic cinematic camera drift across the ENTIRE duration
  // Zero modulo resets! Zero jerky zoom-out snaps!
  const masterScale = interpolate(frame, [0, durationFrames], [1.0, 1.12], {
    extrapolateRight: 'clamp',
  });

  // 2. Cinematic transition timing: Left focus -> Midpoint sweep -> Right focus
  const switchPoint = Math.round(durationFrames * 0.48);
  const isSecondHalf = frame >= switchPoint;

  // Camera pan: gently drifts from left bias (-20px) to right bias (+20px)
  const panX = interpolate(frame, [0, durationFrames], [-20, 20], {
    extrapolateRight: 'clamp',
  });

  // Dynamic focus opacity between the two contrast worlds
  const leftOpacity = interpolate(
    frame,
    [0, switchPoint - 15, switchPoint, durationFrames],
    [1.0, 1.0, 0.25, 0.15],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const rightOpacity = interpolate(
    frame,
    [0, switchPoint - 10, switchPoint + 10, durationFrames],
    [0.2, 0.35, 1.0, 1.0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  // Divider pulse at the moment of escalation
  const dividerFlash = interpolate(
    frame,
    [switchPoint - 10, switchPoint, switchPoint + 10],
    [0, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const docPrimaryText = leftPrimaryText || leftTitle;
  const docSecondaryText = leftSecondaryText || 'KASUS PENYELIDIKAN // BUKTI AWAL';

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        backgroundColor: '#05070a',
        overflow: 'hidden',
      }}
    >
      {/* Container with unbroken continuous Ken Burns drift */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          transform: `scale(${masterScale}) translateX(${panX}px)`,
          transformOrigin: 'center center',
        }}
      >
        {/* ============================================================== */}
        {/* LEFT / UPPER PANEL: AWAL MULA SEPELE (The Trivial Trigger)    */}
        {/* ============================================================== */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '52%',
            overflow: 'hidden',
            borderBottom: '3px solid rgba(255, 230, 0, 0.6)',
            opacity: leftOpacity,
            transition: 'opacity 0.2s ease-out',
          }}
        >
          {/* Procedural Forensic Memo Sketch or Image */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: '#0c121e',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {/* SVG Forensic Blueprint & Confidential Memo Paper */}
            <svg
              viewBox="0 0 1080 960"
              style={{
                width: '100%',
                height: '100%',
              }}
            >
              {/* Grid background */}
              <defs>
                <pattern id="hookGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255, 255, 255, 0.04)" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="1080" height="960" fill="url(#hookGrid)" />

              {/* Manila Folder */}
              <g transform="translate(190, 180)">
                <rect x="0" y="0" width="700" height="700" fill="#1e293b" stroke="#475569" strokeWidth="4" rx="12" />
                {/* Paper */}
                <rect x="40" y="50" width="620" height="600" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="2" rx="8" />

                {/* Paperclip */}
                <rect x="80" y="25" width="22" height="75" fill="none" stroke="#94a3b8" strokeWidth="5" rx="8" />

                {/* Dynamic Document text driven by AI Director */}
                <text x="130" y="110" fill="#0f172a" fontSize="24" fontWeight="900" fontFamily="'Montserrat', sans-serif">
                  {docPrimaryText.length > 30 ? docPrimaryText.slice(0, 30) + '...' : docPrimaryText}
                </text>
                <text x="130" y="145" fill="#64748b" fontSize="16" fontWeight="700" fontFamily="monospace">
                  {docSecondaryText}
                </text>
                <line x1="80" y1="175" x2="580" y2="175" stroke="#cbd5e1" strokeWidth="3" />

                {/* Paragraph lines */}
                {[215, 255, 295, 335, 375, 415, 475, 515].map((y, idx) => (
                  <line
                    key={idx}
                    x1="80"
                    y1={y}
                    x2={idx % 2 === 0 ? 580 : 480}
                    y2={y}
                    stroke="#94a3b8"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                ))}

                {/* Dynamic Confidential Stamp */}
                <g transform="translate(380, 500) rotate(-14)">
                  <rect x="-10" y="-8" width="230" height="52" fill="none" stroke="#ef4444" strokeWidth="4" rx="4" />
                  <text x="105" y="27" fill="#ef4444" fontSize="19" fontWeight="900" fontFamily="monospace" textAnchor="middle" letterSpacing="3">
                    {leftStampText.toUpperCase()}
                  </text>
                </g>
              </g>
            </svg>
          </div>

          {/* Vignette */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'radial-gradient(ellipse at center, transparent 30%, rgba(5, 7, 10, 0.8) 100%)',
            }}
          />
        </div>

        {/* ============================================================== */}
        {/* RIGHT / LOWER PANEL: AKIBAT GLOBAL (The Monumental Collapse)  */}
        {/* ============================================================== */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '52%',
            overflow: 'hidden',
            opacity: rightOpacity,
            transition: 'opacity 0.2s ease-out',
          }}
        >
          <Img
            src={staticFile(rightImage)}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center 40%',
              filter: 'contrast(1.15) brightness(0.85)',
            }}
          />
          {/* Red apocalyptic atmosphere gradient */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to bottom, rgba(220, 38, 38, 0.25) 0%, transparent 40%, rgba(5, 7, 10, 0.9) 100%)',
            }}
          />
        </div>

        {/* ============================================================== */}
        {/* DYNAMIC LASER / DIVIDER LINE BETWEEN TWO WORLDS                */}
        {/* ============================================================== */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: 0,
            right: 0,
            height: '4px',
            backgroundColor: isSecondHalf ? '#ef4444' : '#FFE600',
            boxShadow: `0 0 25px ${isSecondHalf ? '#ef4444' : '#FFE600'}, 0 0 50px ${dividerFlash > 0 ? '#ffffff' : 'transparent'}`,
            zIndex: 20,
          }}
        />
      </div>

      {/* Heavy bottom film gradient to guarantee 100% subtitle legibility */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: '520px',
          background: 'linear-gradient(to top, rgba(5, 7, 10, 0.98) 0%, rgba(5, 7, 10, 0.7) 60%, transparent 100%)',
          pointerEvents: 'none',
          zIndex: 25,
        }}
      />

      {/* Top Editorial Headline (Dynamic Director Badge & Headline) */}
      <div
        style={{
          position: 'absolute',
          top: '90px',
          left: '50px',
          right: '50px',
          zIndex: 35,
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: isSecondHalf ? '#dc2626' : '#d97706',
            color: '#ffffff',
            padding: '6px 16px',
            borderRadius: '4px',
            fontSize: '15px',
            fontWeight: 900,
            letterSpacing: '2px',
            textTransform: 'uppercase',
            marginBottom: '12px',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.6)',
          }}
        >
          <span>{isSecondHalf ? rightBadge : leftBadge}</span>
        </div>

        <h1
          style={{
            fontSize: '44px',
            fontWeight: 900,
            color: '#ffffff',
            margin: 0,
            lineHeight: 1.15,
            letterSpacing: '-1px',
            fontFamily: "'Montserrat', sans-serif",
            textShadow: '0 3px 18px rgba(0, 0, 0, 0.95)',
          }}
        >
          {isSecondHalf ? rightTitle : leftTitle}
        </h1>
      </div>
    </div>
  );
};
