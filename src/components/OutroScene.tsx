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
    config: { damping: 15, mass: 0.85 },
  });

  const beatPhase = (frame / fps) * (82 / 60) * Math.PI * 2;
  const systolicBeat = Math.pow(Math.max(0, Math.sin(beatPhase)), 8);

  return (
    <div
      style={{
        position: 'absolute',
        top: '300px',
        left: '56px',
        right: '56px',
        zIndex: 30,
        transform: `scale(${entrance + systolicBeat * 0.012})`,
        opacity: entrance,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          backgroundColor: 'rgba(6, 12, 24, 0.92)',
          borderRadius: '20px',
          padding: '42px 34px',
          border: '1.5px solid rgba(56, 189, 248, 0.4)',
          boxShadow: '0 30px 70px rgba(0, 0, 0, 0.95), 0 0 35px rgba(56, 189, 248, 0.2)',
          width: '100%',
          backdropFilter: 'blur(16px)',
        }}
      >
        <span
          style={{
            fontSize: '14px',
            color: '#38bdf8',
            fontWeight: 800,
            fontFamily: "'Space Grotesk', sans-serif",
            letterSpacing: '2px',
            textTransform: 'uppercase',
            backgroundColor: 'rgba(56, 189, 248, 0.14)',
            border: '1px solid rgba(56, 189, 248, 0.35)',
            padding: '5px 16px',
            borderRadius: '6px',
            display: 'inline-block',
            marginBottom: '16px',
          }}
        >
          ⚡ VONIS MEDIS & ANATOMI TUBUH
        </span>

        <h3
          style={{
            fontSize: '24px',
            color: '#94a3b8',
            fontWeight: 700,
            margin: '0 0 16px 0',
            letterSpacing: '-0.3px',
          }}
        >
          Tubuhmu Selalu Memberi Sinyal Peringatan
        </h3>

        <h2
          style={{
            fontSize: '36px',
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
            backgroundColor: 'rgba(56, 189, 248, 0.12)',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            padding: '11px 26px',
            borderRadius: '999px',
            fontSize: '18px',
            fontWeight: 700,
            color: '#f8fafc',
            letterSpacing: '0.5px',
          }}
        >
          💬 Pernah mengalaminya? Ceritakan di komentar!
        </div>
      </div>
    </div>
  );
};
