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
        top: '290px',
        left: '56px',
        right: '56px',
        zIndex: 30,
        transform: `scale(${entrance + systolicBeat * 0.01})`,
        opacity: entrance,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          backgroundColor: '#F4F0EA',
          borderRadius: '6px',
          padding: '44px 36px',
          border: '3px solid #111215',
          boxShadow: '14px 14px 0px #111215, 0 30px 70px rgba(0, 0, 0, 0.85)',
          width: '100%',
        }}
      >
        <span
          style={{
            fontSize: '14px',
            color: '#111215',
            fontWeight: 900,
            fontFamily: "'Space Grotesk', monospace",
            letterSpacing: '2px',
            textTransform: 'uppercase',
            backgroundColor: '#FFCC00',
            border: '2px solid #111215',
            padding: '5px 16px',
            borderRadius: '3px',
            display: 'inline-block',
            marginBottom: '18px',
            boxShadow: '4px 4px 0px #111215',
          }}
        >
          CATATAN MEDIS & ANATOMI
        </span>

        <h3
          style={{
            fontSize: '22px',
            color: '#52525b',
            fontWeight: 800,
            fontFamily: "'Space Grotesk', monospace",
            margin: '0 0 14px 0',
            letterSpacing: '0.5px',
            textTransform: 'uppercase',
          }}
        >
          Tubuhmu Selalu Memberi Sinyal Peringatan
        </h3>

        <h2
          style={{
            fontSize: '36px',
            fontWeight: 900,
            color: '#111215',
            lineHeight: 1.25,
            margin: '0 0 28px 0',
            fontFamily: "'Montserrat', sans-serif",
            textTransform: 'uppercase',
          }}
        >
          {question}
        </h2>

        <div
          style={{
            display: 'inline-block',
            backgroundColor: '#16181D',
            border: '2px solid #111215',
            padding: '12px 28px',
            borderRadius: '3px',
            fontSize: '17px',
            fontWeight: 800,
            fontFamily: "'Space Grotesk', monospace",
            color: '#F4F0EA',
            letterSpacing: '1px',
          }}
        >
          TULIS PENGALAMANMU DI KOLOM KOMENTAR 👇
        </div>
      </div>
    </div>
  );
};
