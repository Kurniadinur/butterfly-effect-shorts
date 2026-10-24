import React, { useMemo } from 'react';
import { useCurrentFrame } from 'remotion';
import { WordTimestamp } from '../data/types';
import { cleanSubtitleWord } from '../utils/textUtils';

interface KineticSubtitleProps {
  wordTimestamps: WordTimestamp[];
}

interface SubtitlePage {
  pageIndex: number;
  words: WordTimestamp[];
  startFrame: number;
  endFrame: number;
}

export const KineticSubtitle: React.FC<KineticSubtitleProps> = ({ wordTimestamps }) => {
  const frame = useCurrentFrame();

  // Group timestamps into discrete, stationary pages of 2-3 words
  const pages = useMemo<SubtitlePage[]>(() => {
    if (!wordTimestamps || wordTimestamps.length === 0) return [];

    const pageMap = new Map<number, WordTimestamp[]>();

    // If words already have pageIndex assigned, group by pageIndex
    const hasPageIndex = wordTimestamps.some((w) => w.pageIndex !== undefined);

    if (hasPageIndex) {
      wordTimestamps.forEach((w, idx) => {
        const pIdx = w.pageIndex ?? Math.floor(idx / 3);
        if (!pageMap.has(pIdx)) {
          pageMap.set(pIdx, []);
        }
        pageMap.get(pIdx)!.push(w);
      });
    } else {
      // Fallback: partition every 2 to 3 words
      let i = 0;
      let pIdx = 0;
      while (i < wordTimestamps.length) {
        const remaining = wordTimestamps.length - i;
        const size = remaining === 4 ? 2 : remaining <= 3 ? remaining : 3;
        pageMap.set(pIdx, wordTimestamps.slice(i, i + size));
        i += size;
        pIdx++;
      }
    }

    const result: SubtitlePage[] = [];
    pageMap.forEach((words, pIdx) => {
      if (words.length > 0) {
        result.push({
          pageIndex: pIdx,
          words,
          startFrame: words[0].startFrame,
          endFrame: words[words.length - 1].endFrame,
        });
      }
    });

    return result.sort((a, b) => a.startFrame - b.startFrame);
  }, [wordTimestamps]);

  if (pages.length === 0) {
    return null;
  }

  // Find currently active page:
  // Subtitles only stay visible while words are actively spoken or during microscopic word transitions (<= 6 frames).
  // During natural breath pauses or scene cuts, subtitles cleanly disappear so visuals can breathe!
  const activePageIndex = pages.findIndex((page, idx) => {
    const nextStart = pages[idx + 1]?.startFrame ?? page.endFrame;
    const gap = nextStart - page.endFrame;
    // If the gap to the next page is small (<= 6 frames / 0.2s), hold smoothly.
    // If there is a breath pause (> 6 frames) or silence, strictly cut off at page.endFrame!
    const holdUntil = gap <= 6 ? nextStart : page.endFrame;
    return frame >= page.startFrame && frame < holdUntil;
  });

  if (activePageIndex === -1) {
    return null;
  }

  const activePage = pages[activePageIndex];

  // Determine active word within this page
  let activeWordIndex = activePage.words.findIndex(
    (w) => frame >= w.startFrame && frame < w.endFrame
  );

  // If between adjacent words on the same page, keep the last spoken word active
  if (activeWordIndex === -1 && frame >= activePage.endFrame) {
    activeWordIndex = activePage.words.length - 1;
  }

  return (
    <div
      style={{
        position: 'absolute',
        bottom: '260px',
        left: '40px',
        right: '40px',
        zIndex: 50,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        pointerEvents: 'none',
        textAlign: 'center',
      }}
    >
      {/* 
        Stationary phrase container:
        The words remain firmly in place across the entire page duration.
        Zero horizontal drift, zero eye fatigue.
      */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '12px 20px',
          maxWidth: '960px',
        }}
      >
        {activePage.words.map((w, idx) => {
          const cleanWord = cleanSubtitleWord(w.word);
          if (!cleanWord) return null;

          const isActive = idx === activeWordIndex;

          return (
            <span
              key={`${cleanWord}-${w.startFrame}-${idx}`}
              style={{
                fontFamily: "'Montserrat', -apple-system, sans-serif",
                fontSize: '54px',
                fontWeight: 900,
                color: isActive ? '#FFE600' : '#FFFFFF',
                textTransform: 'uppercase',
                letterSpacing: '-0.5px',
                lineHeight: 1.15,
                // Bold multi-directional stroke & shadow for effortless legibility on any background
                textShadow: isActive
                  ? '0 0 25px rgba(255, 230, 0, 0.9), -3px -3px 0 #000, 3px -3px 0 #000, -3px 3px 0 #000, 3px 3px 0 #000, 0 6px 15px rgba(0, 0, 0, 0.95)'
                  : '-3px -3px 0 #000, 3px -3px 0 #000, -3px 3px 0 #000, 3px 3px 0 #000, 0 6px 15px rgba(0, 0, 0, 0.95)',
                display: 'inline-block',
                transform: isActive ? 'scale(1.08)' : 'scale(1)',
                transformOrigin: 'center center',
                transition: 'transform 0.06s ease-out, color 0.06s ease-out',
              }}
            >
              {cleanWord}
            </span>
          );
        })}
      </div>
    </div>
  );
};
