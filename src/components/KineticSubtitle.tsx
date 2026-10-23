import React from 'react';
import { useCurrentFrame } from 'remotion';
import { WordTimestamp } from '../data/types';

interface KineticSubtitleProps {
  wordTimestamps: WordTimestamp[];
}

export const KineticSubtitle: React.FC<KineticSubtitleProps> = ({ wordTimestamps }) => {
  const frame = useCurrentFrame();

  if (!wordTimestamps || wordTimestamps.length === 0) {
    return null;
  }

  // Find active word index
  const activeIndex = wordTimestamps.findIndex(
    (w) => frame >= w.startFrame && frame <= w.endFrame
  );

  // If no word is currently active, find the closest upcoming or previous word
  let displayIndex = activeIndex;
  if (displayIndex === -1) {
    displayIndex = wordTimestamps.findIndex((w) => frame < w.startFrame);
    if (displayIndex === -1) {
      displayIndex = wordTimestamps.length - 1;
    }
  }

  // Show a chunk of 4 words centered around displayIndex
  const CHUNK_SIZE = 4;
  const chunkStart = Math.max(0, Math.min(displayIndex - 1, wordTimestamps.length - CHUNK_SIZE));
  const currentChunk = wordTimestamps.slice(chunkStart, chunkStart + CHUNK_SIZE);

  return (
    <div
      style={{
        position: 'absolute',
        bottom: '120px',
        left: '60px',
        right: '60px',
        zIndex: 50,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          display: 'inline-flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: '12px 16px',
          padding: '16px 28px',
          backgroundColor: 'rgba(5, 8, 20, 0.88)',
          borderRadius: '18px',
          border: '1.5px solid rgba(255, 255, 255, 0.15)',
          backdropFilter: 'blur(16px)',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.8)',
          maxWidth: '920px',
        }}
      >
        {currentChunk.map((w, idx) => {
          const globalIdx = chunkStart + idx;
          const isActive = globalIdx === activeIndex;

          return (
            <span
              key={`${w.word}-${globalIdx}`}
              style={{
                fontFamily: "'Montserrat', sans-serif",
                fontSize: isActive ? '36px' : '32px',
                fontWeight: isActive ? 900 : 700,
                color: isActive ? '#facc15' : 'rgba(255, 255, 255, 0.7)',
                transform: isActive ? 'scale(1.1)' : 'scale(1)',
                textShadow: isActive
                  ? '0 0 20px rgba(250, 204, 21, 0.7), 0 2px 4px rgba(0, 0, 0, 0.9)'
                  : '0 2px 4px rgba(0, 0, 0, 0.8)',
                transition: 'transform 0.1s ease-out, color 0.1s ease-out',
                display: 'inline-block',
                letterSpacing: '-0.3px',
              }}
            >
              {w.word}
            </span>
          );
        })}
      </div>
    </div>
  );
};
