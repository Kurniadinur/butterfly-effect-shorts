import React from 'react';

interface ChaosMeterProps {
  chaosLevel: number;
  timeOrYear: string;
}

export const ChaosMeter: React.FC<ChaosMeterProps> = ({ chaosLevel, timeOrYear }) => {
  return (
    <div
      style={{
        position: 'absolute',
        top: '75px',
        left: '60px',
        right: '60px',
        zIndex: 40,
        fontFamily: "'Space Grotesk', -apple-system, sans-serif",
      }}
    >
      {/* Top Editorial Row */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingBottom: '12px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
        }}
      >
        {/* Left: Declassified Archive Tag */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span
            style={{
              backgroundColor: '#dc2626',
              color: '#ffffff',
              fontSize: '15px',
              fontWeight: 800,
              padding: '3px 10px',
              borderRadius: '3px',
              letterSpacing: '1.5px',
              textTransform: 'uppercase',
            }}
          >
            ARSIP SEJARAH
          </span>
          <span
            style={{
              fontSize: '17px',
              color: 'rgba(255, 255, 255, 0.7)',
              fontWeight: 600,
              letterSpacing: '0.5px',
            }}
          >
            BERKAS NO. 1989-11
          </span>
        </div>

        {/* Right: Date & Time Stamp */}
        <div
          style={{
            fontSize: '18px',
            fontWeight: 700,
            color: '#f8fafc',
            letterSpacing: '0.5px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <span>⏱</span> {timeOrYear}
        </div>
      </div>

      {/* Minimalist Timeline Line */}
      <div
        style={{
          width: '100%',
          height: '3px',
          backgroundColor: 'rgba(255, 255, 255, 0.08)',
          position: 'relative',
        }}
      >
        <div
          style={{
            width: `${Math.min(100, Math.max(0, chaosLevel))}%`,
            height: '100%',
            backgroundColor: chaosLevel >= 75 ? '#ef4444' : '#e2e8f0',
            transition: 'width 0.3s ease-out',
          }}
        />
      </div>
    </div>
  );
};
