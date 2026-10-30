import React, { useMemo } from 'react';
import { useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { resolveEditorialTheme } from '../utils/editorialThemes';

interface OutroSceneProps {
  question: string;
  storyId?: string | null;
  editorialMood?: string | null;
  storyTitle?: string | null;
}

export const OutroScene: React.FC<OutroSceneProps> = ({ question: rawQuestion, storyId, editorialMood, storyTitle }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Safety guard: ensure medical discussion question
  const question = useMemo(() => {
    if (!rawQuestion || /keputusan sepele|5 tahun lagi|mengubah jalan hidupmu/i.test(rawQuestion)) {
      const cleanTopic = (storyTitle || '')
        .replace(/^(APA JADINYA KALAU KAMU|APA JADINYA KALAU|APA EFEK|BAGAIMANA JIKA)\s*/i, '')
        .replace(/\?+$/, '')
        .trim();
      return cleanTopic
        ? `KALAU KAMU ${cleanTopic.toUpperCase()}, GEJALA MANA YANG PALING SERING KAMU RASAKAN DI TUBUHMU?`
        : 'GEJALA MANA YANG PALING SERING KAMU RASAKAN DI TUBUHMU SETELAH MELAKUKAN INI?';
    }
    return rawQuestion;
  }, [rawQuestion, storyTitle]);

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
        top: '320px',
        left: '56px',
        right: '56px',
        zIndex: 40,
        transform: `scale(${entrance + systolicBeat * 0.01})`,
        opacity: entrance,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
      }}
    >
      {/* Gaya A: Floating Frosted Glass Question Card */}
      <div
        style={{
          backgroundColor: 'rgba(9, 15, 28, 0.82)',
          backdropFilter: 'blur(26px)',
          borderRadius: '24px',
          padding: '44px 34px',
          border: `1.5px solid ${theme.primaryHighlight}66`,
          boxShadow: `0 24px 60px rgba(0, 0, 0, 0.85), 0 0 35px ${theme.primaryHighlight}20`,
          width: '100%',
        }}
      >
        <span
          style={{
            fontSize: '13px',
            color: theme.primaryHighlight,
            fontWeight: 900,
            fontFamily: "'Space Grotesk', monospace",
            letterSpacing: '1.5px',
            textTransform: 'uppercase',
            backgroundColor: `${theme.primaryHighlight}18`,
            border: `1px solid ${theme.primaryHighlight}55`,
            padding: '6px 20px',
            borderRadius: '999px',
            display: 'inline-block',
            marginBottom: '22px',
            boxShadow: `0 0 16px ${theme.primaryHighlight}25`,
          }}
        >
          PERTANYAAN DOKTER BUAT KAMU
        </span>

        <h2
          style={{
            fontSize: '34px',
            fontWeight: 900,
            color: '#FFFFFF',
            lineHeight: 1.3,
            margin: '0 0 28px 0',
            fontFamily: "'Montserrat', sans-serif",
            textTransform: 'uppercase',
            textShadow: '0 4px 20px rgba(0, 0, 0, 0.85)',
          }}
        >
          {question}
        </h2>

        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'rgba(245, 158, 11, 0.12)',
            border: '1.5px solid rgba(245, 158, 11, 0.45)',
            padding: '12px 28px',
            borderRadius: '999px',
            fontSize: '16px',
            fontWeight: 900,
            fontFamily: "'Space Grotesk', monospace",
            color: '#FBBF24',
            letterSpacing: '1px',
            boxShadow: '0 0 20px rgba(245, 158, 11, 0.2)',
          }}
        >
          TULIS DI KOLOM KOMENTAR 👇
        </div>
      </div>
    </div>
  );
};
