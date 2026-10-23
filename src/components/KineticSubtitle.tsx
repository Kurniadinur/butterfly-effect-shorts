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

  // Find currently spoken word index
  const activeIndex = wordTimestamps.findIndex(
    (w) => frame >= w.startFrame && frame <= w.endFrame
  );

  // If between words, show the closest upcoming or previous word
  let displayIndex = activeIndex;
  if (displayIndex === -1) {
    displayIndex = wordTimestamps.findIndex((w) => frame < w.startFrame);
    if (displayIndex === -1) {
      displayIndex = wordTimestamps.length - 1;
    }
  }

  // Display only 2 to 3 words at a time for maximum legibility on mobile
  const CHUNK_SIZE = 3;
  const chunkStart = Math.max(0, Math.min(displayIndex - 1, wordTimestamps.length - CHUNK_SIZE));
  const currentChunk = wordTimestamps.slice(chunkStart, chunkStart + CHUNK_SIZE);

  return (
    <div
      style={{
        position: 'absolute',
        bottom: '220px',
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
          gap: '8px 16px',
          padding: '12px 24px',
          backgroundColor: 'rgba(0, 0, 0, 0.88)',
          borderRadius: '14px',
          border: '1.5px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.9)',
          maxWidth: '850px',
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
                fontSize: '44px',
                fontWeight: 900,
                color: isActive ? '#facc15' : '#ffffff',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                textShadow: isActive
                  ? '0 0 20px rgba(250, 204, 21, 0.8), -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 2px 2px 0 #000'
                  : '-2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 2px 2px 0 #000',
                display: 'inline-block',
                transform: isActive ? 'scale(1.08)' : 'scale(1)',
                transition: 'transform 0.08s ease-out',
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
