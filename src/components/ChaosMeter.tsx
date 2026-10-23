import React from 'react';
import { useCurrentFrame, interpolate } from 'remotion';

interface ChaosMeterProps {
  chaosLevel: number; // 0 to 100
  timeOrYear: string;
}

export const ChaosMeter: React.FC<ChaosMeterProps> = ({ chaosLevel, timeOrYear }) => {
  const frame = useCurrentFrame();

  // Color mapping based on chaos level
  let themeColor = '#10b981'; // emerald green
  let statusText = 'STABIL';
  if (chaosLevel >= 75) {
    themeColor = '#ef4444'; // red
    statusText = 'BENCANA GLOBAL';
  } else if (chaosLevel >= 45) {
    themeColor = '#f59e0b'; // amber/orange
    statusText = 'ESKALASI CEPAT';
  } else if (chaosLevel >= 20) {
    themeColor = '#38bdf8'; // sky blue
    statusText = 'ANOMALI TERDETEKSI';
  }

  // Blinking dot animation
  const dotOpacity = interpolate(Math.sin(frame * 0.15), [-1, 1], [0.3, 1]);

  return (
    <div
      style={{
        position: 'absolute',
        top: '70px',
        left: '60px',
        right: '60px',
        zIndex: 40,
        fontFamily: "'Space Grotesk', 'JetBrains Mono', sans-serif",
      }}
    >
      {/* Top Header Row */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '12px',
        }}
      >
        {/* Left Status Indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              backgroundColor: themeColor,
              opacity: dotOpacity,
              boxShadow: `0 0 12px ${themeColor}`,
            }}
          />
          <span
            style={{
              fontSize: '22px',
              fontWeight: 700,
              letterSpacing: '2px',
              color: themeColor,
              textTransform: 'uppercase',
            }}
          >
            CHAOS INDEX: {Math.round(chaosLevel)}%
          </span>
          <span
            style={{
              fontSize: '18px',
              color: '#94a3b8',
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              padding: '2px 8px',
              borderRadius: '4px',
              fontWeight: 600,
            }}
          >
            {statusText}
          </span>
        </div>

        {/* Right Timestamp */}
        <div
          style={{
            fontSize: '22px',
            fontWeight: 700,
            color: '#f8fafc',
            backgroundColor: 'rgba(15, 23, 42, 0.7)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            padding: '6px 14px',
            borderRadius: '6px',
            letterSpacing: '1px',
          }}
        >
          ⏱ {timeOrYear}
        </div>
      </div>

      {/* Progress Bar Track */}
      <div
        style={{
          width: '100%',
          height: '10px',
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '5px',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <div
          style={{
            width: `${Math.min(100, Math.max(0, chaosLevel))}%`,
            height: '100%',
            backgroundColor: themeColor,
            boxShadow: `0 0 16px ${themeColor}`,
            transition: 'width 0.3s ease-out',
            borderRadius: '5px',
          }}
        />
      </div>
    </div>
  );
};
