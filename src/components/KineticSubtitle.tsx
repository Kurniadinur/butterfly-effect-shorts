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

/**
 * Editorial Master Subtitle Engine (Anti-Template Edition):
 * Replaces the generic "bouncing yellow Montserrat font" with a prestigious,
 * bespoke Forensic Archival Dossier layout:
 * - Razor-sharp Space Grotesk / Mono typography with editorial tracking
 * - Forensic transcript chassis with declassified timestamp metadata
 * - Tactile marker underline & ambient phosphor highlight (zero cartoon bounce)
 * - Cinematic letterboxed readability without cheesy thick strokes
 */
export const KineticSubtitle: React.FC<KineticSubtitleProps> = ({ wordTimestamps }) => {
  const frame = useCurrentFrame();

  // Group timestamps into discrete, stationary pages of 2-3 words
  const pages = useMemo<SubtitlePage[]>(() => {
    if (!wordTimestamps || wordTimestamps.length === 0) return [];

    const pageMap = new Map<number, WordTimestamp[]>();
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

  // Find currently active page
  const activePageIndex = pages.findIndex((page, idx) => {
    const nextStart = pages[idx + 1]?.startFrame ?? page.endFrame;
    const gap = nextStart - page.endFrame;
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

  if (activeWordIndex === -1 && frame >= activePage.endFrame) {
    activeWordIndex = activePage.words.length - 1;
  }

  // Blinking forensic recording dot (15-frame cycle)
  const isDotBlink = Math.floor(frame / 12) % 2 === 0;

  return (
    <div
      style={{
        position: 'absolute',
        bottom: '240px',
        left: '48px',
        right: '48px',
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none',
      }}
    >
      {/* 
        A. Forensic Archival Transcript Chassis
        Distinguishes our look immediately from floating generic templates
      */}
      <div
        style={{
          display: 'inline-flex',
          flexDirection: 'column',
          alignItems: 'center',
          backgroundColor: 'rgba(5, 8, 14, 0.72)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '16px',
          padding: '12px 28px 18px 28px',
          boxShadow:
            '0 20px 40px rgba(0, 0, 0, 0.75), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
          maxWidth: '920px',
          position: 'relative',
        }}
      >
        {/* Archival Metadata Header Line */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '8px',
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '13px',
            fontWeight: 700,
            letterSpacing: '1.5px',
            textTransform: 'uppercase',
            color: 'rgba(255, 255, 255, 0.55)',
          }}
        >
          <span
            style={{
              width: '7px',
              height: '7px',
              borderRadius: '50%',
              backgroundColor: isDotBlink ? '#ef4444' : '#7f1d1d',
              boxShadow: isDotBlink ? '0 0 8px #ef4444' : 'none',
              display: 'inline-block',
              transition: 'background-color 0.1s',
            }}
          />
          <span>TRANSCRIPT // EVIDENCE ARCHIVE</span>
        </div>

        {/* 
          B. Clean Stationary Words Container 
          Space Grotesk + subtle highlight marker
        */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '10px 16px',
            textAlign: 'center',
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
                  fontFamily: "'Space Grotesk', -apple-system, sans-serif",
                  fontSize: '48px',
                  fontWeight: 800,
                  color: isActive ? '#FFFFFF' : 'rgba(255, 255, 255, 0.65)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.2px',
                  lineHeight: 1.2,
                  position: 'relative',
                  display: 'inline-block',
                  padding: '2px 8px',
                  borderRadius: '6px',
                  backgroundColor: isActive ? 'rgba(245, 158, 11, 0.22)' : 'transparent',
                  borderBottom: isActive ? '3px solid #F59E0B' : '3px solid transparent',
                  boxShadow: isActive ? '0 0 20px rgba(245, 158, 11, 0.35)' : 'none',
                  textShadow: isActive
                    ? '0 0 16px rgba(255, 255, 255, 0.4), 0 2px 8px rgba(0,0,0,0.9)'
                    : '0 2px 6px rgba(0, 0, 0, 0.8)',
                  transition: 'background-color 0.08s ease, color 0.08s ease',
                }}
              >
                {cleanWord}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
};
