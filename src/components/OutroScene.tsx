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
    config: { damping: 12, mass: 0.8 },
  });

  return (
    <div
      style={{
        position: 'absolute',
        top: '360px',
        left: '70px',
        right: '70px',
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
          width: '90px',
          height: '90px',
          borderRadius: '50%',
          backgroundColor: '#ef4444',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          fontSize: '48px',
          fontWeight: 900,
          color: '#ffffff',
          boxShadow: '0 0 40px rgba(239, 68, 68, 0.8)',
          marginBottom: '30px',
        }}
      >
        ?
      </div>

      <div
        style={{
          backgroundColor: 'rgba(15, 23, 42, 0.9)',
          border: '2px solid rgba(239, 68, 68, 0.7)',
          borderRadius: '24px',
          padding: '40px 30px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.9)',
          backdropFilter: 'blur(20px)',
        }}
      >
        <span
          style={{
            fontSize: '20px',
            color: '#f87171',
            fontWeight: 800,
            letterSpacing: '2px',
            textTransform: 'uppercase',
          }}
        >
          EFEK KUPU-KUPU
        </span>

        <h2
          style={{
            fontSize: '40px',
            fontWeight: 900,
            color: '#ffffff',
            lineHeight: 1.3,
            marginTop: '16px',
            marginBottom: '24px',
          }}
        >
          {question}
        </h2>

        <div
          style={{
            display: 'inline-block',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            padding: '10px 24px',
            borderRadius: '999px',
            fontSize: '22px',
            fontWeight: 700,
            color: '#facc15',
            letterSpacing: '1px',
          }}
        >
          👇 TULIS DI KOLOM KOMENTAR
        </div>
      </div>
    </div>
  );
};
