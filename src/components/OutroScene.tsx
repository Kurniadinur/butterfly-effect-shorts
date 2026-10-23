import React from 'react';
import { useCurrentFrame, useVideoConfig, spring } from 'remotion';

interface OutroSceneProps {
  question: string;
}

export const OutroScene: React.FC<OutroSceneProps> = ({ question }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = spring({
    frame,
    fps,
    config: { damping: 16, mass: 0.8 },
  });

  return (
    <div
      style={{
        position: 'absolute',
        top: '320px',
        left: '60px',
        right: '60px',
        zIndex: 30,
        transform: `scale(${entrance})`,
        opacity: entrance,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          backgroundColor: '#0f141f',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          borderRadius: '18px',
          padding: '40px 32px',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.9)',
          width: '100%',
        }}
      >
        <span
          style={{
            fontSize: '15px',
            color: '#dc2626',
            fontWeight: 800,
            letterSpacing: '2px',
            textTransform: 'uppercase',
            backgroundColor: 'rgba(220, 38, 38, 0.15)',
            padding: '4px 14px',
            borderRadius: '4px',
            display: 'inline-block',
            marginBottom: '16px',
          }}
        >
          KILAS BALIK SEJARAH
        </span>

        <h3
          style={{
            fontSize: '26px',
            color: '#94a3b8',
            fontWeight: 700,
            margin: '0 0 16px 0',
            letterSpacing: '-0.3px',
          }}
        >
          Cuma gara-gara salah satu kata.
        </h3>

        <h2
          style={{
            fontSize: '38px',
            fontWeight: 900,
            color: '#ffffff',
            lineHeight: 1.3,
            margin: '0 0 28px 0',
            fontFamily: "'Montserrat', sans-serif",
          }}
        >
          {question}
        </h2>

        <div
          style={{
            display: 'inline-block',
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            padding: '10px 24px',
            borderRadius: '999px',
            fontSize: '18px',
            fontWeight: 700,
            color: '#f8fafc',
            letterSpacing: '0.5px',
          }}
        >
          💬 Tulis pendapatmu di komentar
        </div>
      </div>
    </div>
  );
};
