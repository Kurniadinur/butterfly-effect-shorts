import React, { useMemo } from 'react';
import { useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { resolveEditorialTheme } from '../utils/editorialThemes';

interface OutroSceneProps {
  question: string;
  storyId?: string | null;
  editorialMood?: string | null;
}

export const OutroScene: React.FC<OutroSceneProps> = ({ question, storyId, editorialMood }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const theme = useMemo(
    () => resolveEditorialTheme(storyId, editorialMood, question),
    [storyId, editorialMood, question]
  );

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
        top: '310px',
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
          backgroundColor: theme.cardBg,
          borderRadius: theme.cardRadius,
          padding: '44px 36px',
          border: theme.cardBorder,
          borderTop: theme.cardTopAccentBar ? `8px solid ${theme.cardTopAccentBar}` : theme.cardBorder,
          borderLeft: theme.cardLeftAccentSpine ? `9px solid ${theme.cardLeftAccentSpine}` : theme.cardBorder,
          boxShadow: theme.cardShadow,
          width: '100%',
        }}
      >
        <span
          style={{
            fontSize: '14px',
            color: theme.primaryHighlightText,
            fontWeight: 900,
            fontFamily: "'Space Grotesk', monospace",
            letterSpacing: '1.5px',
            textTransform: 'uppercase',
            backgroundColor: theme.primaryHighlight,
            border: `2px solid ${theme.inkDark}`,
            padding: '5px 16px',
            borderRadius: '3px',
            display: 'inline-block',
            marginBottom: '22px',
            boxShadow: `4px 4px 0px ${theme.inkDark}`,
          }}
        >
          PERTANYAAN BUAT KAMU
        </span>

        <h2
          style={{
            fontSize: '36px',
            fontWeight: 900,
            color: theme.inkDark,
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
            backgroundColor: theme.specimenBg,
            border: `2px solid ${theme.inkDark}`,
            padding: '12px 28px',
            borderRadius: '3px',
            fontSize: '17px',
            fontWeight: 800,
            fontFamily: "'Space Grotesk', monospace",
            color: '#F4F0EA',
            letterSpacing: '1px',
          }}
        >
          TULIS DI KOLOM KOMENTAR 👇
        </div>
      </div>
    </div>
  );
};
