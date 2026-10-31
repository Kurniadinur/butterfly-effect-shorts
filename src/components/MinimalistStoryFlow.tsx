import React, { useMemo } from 'react';
import { useCurrentFrame, useVideoConfig, Img, staticFile, interpolate, spring } from 'remotion';
import { ButterflyStoryData, WordTimestamp } from '../data/types';
import { cleanSubtitleWord } from '../utils/textUtils';

export interface MinimalistStoryFlowProps {
  data: ButterflyStoryData;
}

export const MinimalistStoryFlow: React.FC<MinimalistStoryFlowProps> = ({ data }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const totalFrames = data.totalDurationFrames || 1800;
  const hookDuration = data.hook?.durationFrames || 90;
  const outroDuration = data.outro?.durationFrames || 120;
  const outroStart = totalFrames - outroDuration;

  // Determine current active section
  const currentSection = useMemo(() => {
    if (frame < hookDuration) {
      return {
        type: 'hook' as const,
        headline: data.hook?.headline || data.title,
        narration: data.hook?.narration || '',
        startFrame: 0,
        durationFrames: hookDuration,
        mediaUrl: data.hook?.leftImage || null,
        mediaType: 'text-only' as const,
      };
    }

    if (frame >= outroStart) {
      return {
        type: 'outro' as const,
        headline: data.outro?.headline || 'Pelajaran Penting',
        narration: data.outro?.narration || data.outro?.question || '',
        startFrame: outroStart,
        durationFrames: outroDuration,
        mediaUrl: null,
        mediaType: 'text-only' as const,
      };
    }

    const nodeIndex = (data.nodes || []).findIndex(
      (n) => frame >= n.startFrame && frame < n.startFrame + n.durationFrames
    );

    if (nodeIndex !== -1) {
      const node = data.nodes[nodeIndex];
      // Occasional visual: Only show if explicitly graphic/card or has a specific mediaUrl,
      // and limit visuals to at most 1-2 key moments across the video
      const isGraphicScene = node.mediaType === 'graphic' || (nodeIndex === 2 && Boolean(node.mediaUrl));

      return {
        type: 'node' as const,
        step: node.step,
        headline: node.headline,
        narration: node.narration,
        primaryText: node.primaryText,
        secondaryText: node.secondaryText,
        humanFeeling: node.humanFeeling,
        startFrame: node.startFrame,
        durationFrames: node.durationFrames,
        mediaUrl: isGraphicScene ? node.mediaUrl : null,
        mediaType: isGraphicScene ? ('graphic' as const) : ('text-only' as const),
      };
    }

    return {
      type: 'ambient' as const,
      headline: data.title,
      narration: '',
      startFrame: 0,
      durationFrames: totalFrames,
      mediaUrl: null,
      mediaType: 'text-only' as const,
    };
  }, [frame, hookDuration, outroStart, totalFrames, data]);

  // Words for current section
  const currentWords = useMemo<WordTimestamp[]>(() => {
    if (!data.wordTimestamps || data.wordTimestamps.length === 0) return [];
    return data.wordTimestamps.filter(
      (w) => w.startFrame >= currentSection.startFrame - 4 && w.startFrame < currentSection.startFrame + currentSection.durationFrames + 4
    );
  }, [data.wordTimestamps, currentSection]);

  // Group current words into stationary phrases of 4 to 7 words
  const phrases = useMemo(() => {
    if (currentWords.length === 0) return [];
    const chunks: WordTimestamp[][] = [];
    let i = 0;
    while (i < currentWords.length) {
      const remaining = currentWords.length - i;
      let size = 5;
      if (remaining === 6) size = 3;
      else if (remaining === 4) size = 4;
      else if (remaining <= 5) size = remaining;
      chunks.push(currentWords.slice(i, i + size));
      i += size;
    }
    return chunks;
  }, [currentWords]);

  // Find active phrase
  const activePhraseIndex = useMemo(() => {
    if (phrases.length === 0) return 0;
    const idx = phrases.findIndex((p) => {
      const start = p[0].startFrame;
      const end = p[p.length - 1].endFrame;
      return frame >= start - 4 && frame <= end + 10;
    });
    return idx === -1 ? 0 : idx;
  }, [phrases, frame]);

  const activePhrase = phrases[activePhraseIndex] || [];

  const phraseEntrance = spring({
    frame: activePhrase.length > 0 ? Math.max(0, frame - activePhrase[0].startFrame) : 10,
    fps,
    config: { damping: 22, stiffness: 140 },
  });

  // Calculate recording timecode string (e.g. 00:00:14)
  const currentSec = Math.floor(frame / fps);
  const mm = String(Math.floor(currentSec / 60)).padStart(2, '0');
  const ss = String(currentSec % 60).padStart(2, '0');
  const timecodeStr = `00:${mm}:${ss}`;

  // Theme styling (Matte Charcoal Slate with warm ivory highlights)
  const isWarmScene = currentSection.type === 'node' && currentSection.step % 3 === 2;
  const bgColor = isWarmScene ? '#F6F3EB' : '#101216';
  const primaryTextColor = isWarmScene ? '#1A1A1C' : '#F4F4F6';
  const accentGoldColor = isWarmScene ? '#B87A14' : '#E8B04C';
  const mutedTextColor = isWarmScene ? 'rgba(26, 26, 28, 0.35)' : 'rgba(244, 244, 246, 0.38)';
  const borderLightColor = isWarmScene ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.12)';

  // Overall video progress (0 to 1)
  const totalProgress = Math.min(1, Math.max(0, frame / totalFrames));

  return (
    <div
      style={{
        position: 'relative',
        width: '1080px',
        height: '1920px',
        backgroundColor: bgColor,
        overflow: 'hidden',
        fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif",
        color: primaryTextColor,
        transition: 'background-color 0.4s ease',
      }}
    >
      {/* 1. Subtle Aesthetic Vignette & Film Texture */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: isWarmScene
            ? 'radial-gradient(ellipse at 50% 40%, rgba(255, 255, 255, 0.6) 0%, rgba(220, 215, 202, 0.4) 100%)'
            : 'radial-gradient(ellipse at 50% 45%, rgba(28, 32, 40, 0.45) 0%, rgba(10, 11, 14, 0.95) 100%)',
          pointerEvents: 'none',
        }}
      />

      {/* 2. Minimalist Viewfinder Header (Inspired by reference reel) */}
      <div
        style={{
          position: 'absolute',
          top: '64px',
          left: '60px',
          right: '60px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '18px',
          fontWeight: 600,
          letterSpacing: '2px',
          textTransform: 'uppercase',
          opacity: 0.75,
          color: isWarmScene ? '#555555' : '#8E94A0',
          zIndex: 40,
        }}
      >
        {/* Left: REC Indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span
            style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: '#EF4444',
              display: 'inline-block',
              boxShadow: '0 0 10px rgba(239, 68, 68, 0.8)',
            }}
          />
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '17px' }}>
            REC {timecodeStr}
          </span>
        </div>

        {/* Center: Clean Topic Badge */}
        <div
          style={{
            padding: '6px 18px',
            borderRadius: '100px',
            backgroundColor: isWarmScene ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.08)',
            border: `1px solid ${borderLightColor}`,
            fontSize: '15px',
            letterSpacing: '2.5px',
            fontWeight: 700,
          }}
        >
          {data.title ? data.title.slice(0, 32) : 'REFLEKSI'}
        </div>

        {/* Right: Resolution tag */}
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '16px', opacity: 0.8 }}>
          4K 60FPS
        </div>
      </div>

      {/* 3. Delicate Minimalist Viewfinder Corner Brackets */}
      <div
        style={{
          position: 'absolute',
          top: '50px',
          left: '46px',
          width: '28px',
          height: '28px',
          borderTop: `2px solid ${isWarmScene ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.25)'}`,
          borderLeft: `2px solid ${isWarmScene ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.25)'}`,
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: '50px',
          right: '46px',
          width: '28px',
          height: '28px',
          borderTop: `2px solid ${isWarmScene ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.25)'}`,
          borderRight: `2px solid ${isWarmScene ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.25)'}`,
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '80px',
          left: '46px',
          width: '28px',
          height: '28px',
          borderBottom: `2px solid ${isWarmScene ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.25)'}`,
          borderLeft: `2px solid ${isWarmScene ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.25)'}`,
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '80px',
          right: '46px',
          width: '28px',
          height: '28px',
          borderBottom: `2px solid ${isWarmScene ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.25)'}`,
          borderRight: `2px solid ${isWarmScene ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.25)'}`,
          pointerEvents: 'none',
        }}
      />

      {/* 4. MAIN CONTENT AREA (Centered Kinetic Typography Flow) */}
      <div
        style={{
          position: 'absolute',
          inset: '160px 80px 180px 80px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          zIndex: 30,
        }}
      >
        {/* A. Occasional Visual Card (Only shown if current scene is flagged with a card/graphic) */}
        {currentSection.mediaType === 'graphic' && currentSection.mediaUrl && (
          <div
            style={{
              marginBottom: '56px',
              width: '680px',
              height: '420px',
              borderRadius: '28px',
              overflow: 'hidden',
              boxShadow: isWarmScene
                ? '0 24px 60px rgba(0, 0, 0, 0.12), 0 4px 16px rgba(0,0,0,0.06)'
                : '0 30px 80px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.12)',
              backgroundColor: isWarmScene ? '#FFFFFF' : '#181A20',
              transform: `scale(${interpolate(phraseEntrance, [0, 1], [0.94, 1])})`,
              opacity: phraseEntrance,
              transition: 'transform 0.2s ease-out',
            }}
          >
            <Img
              src={staticFile(currentSection.mediaUrl)}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          </div>
        )}

        {/* B. Scene Label / Step Milestone (Refined & Subtle) */}
        {currentSection.type === 'node' && (
          <div
            style={{
              fontSize: '22px',
              fontWeight: 700,
              letterSpacing: '4px',
              textTransform: 'uppercase',
              color: accentGoldColor,
              marginBottom: '28px',
              opacity: interpolate(phraseEntrance, [0, 1], [0, 0.9]),
              transform: `translateY(${interpolate(phraseEntrance, [0, 1], [15, 0])}px)`,
            }}
          >
            {currentSection.headline || `BAGIAN ${currentSection.step}`}
          </div>
        )}

        {/* C. Primary Kinetic Typography Flow (The Centerpiece of the Reel) */}
        <div
          style={{
            maxWidth: '920px',
            minHeight: '260px',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '16px 22px',
            transform: `translateY(${interpolate(phraseEntrance, [0, 1], [20, 0])}px)`,
            opacity: phraseEntrance,
          }}
        >
          {activePhrase.length > 0 ? (
            activePhrase.map((w, idx) => {
              const cleanWord = cleanSubtitleWord(w.word);
              if (!cleanWord) return null;

              const isSpoken = frame >= w.startFrame;
              const isCurrentlyActive = frame >= w.startFrame && frame < w.endFrame;

              return (
                <span
                  key={`${cleanWord}-${w.startFrame}-${idx}`}
                  style={{
                    fontFamily: "'Playfair Display', 'Cormorant Garamond', Georgia, serif",
                    fontStyle: 'italic',
                    fontSize: cleanWord.length > 10 ? '58px' : '68px',
                    fontWeight: 700,
                    lineHeight: 1.3,
                    color: isCurrentlyActive
                      ? accentGoldColor
                      : isSpoken
                      ? primaryTextColor
                      : mutedTextColor,
                    textShadow: isCurrentlyActive && !isWarmScene
                      ? '0 0 35px rgba(232, 176, 76, 0.5)'
                      : 'none',
                    transform: isCurrentlyActive ? 'scale(1.08)' : 'scale(1)',
                    transition: 'all 0.08s ease-out',
                    display: 'inline-block',
                    margin: '0 4px',
                  }}
                >
                  {cleanWord}
                </span>
              );
            })
          ) : (
            /* Fallback to clean narration text if word timestamps are pending */
            <p
              style={{
                fontFamily: "'Playfair Display', 'Cormorant Garamond', Georgia, serif",
                fontStyle: 'italic',
                fontSize: '62px',
                fontWeight: 700,
                lineHeight: 1.4,
                color: primaryTextColor,
              }}
            >
              {currentSection.narration || currentSection.headline}
            </p>
          )}
        </div>

        {/* D. Human Feeling or Secondary Note (Reflective Whisper) */}
        {currentSection.humanFeeling && (
          <div
            style={{
              marginTop: '42px',
              padding: '10px 24px',
              borderRadius: '100px',
              backgroundColor: isWarmScene ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.06)',
              border: `1px solid ${borderLightColor}`,
              fontSize: '20px',
              fontWeight: 500,
              letterSpacing: '1px',
              color: isWarmScene ? '#666666' : '#A0A6B2',
              opacity: interpolate(phraseEntrance, [0, 1], [0, 0.85]),
            }}
          >
            {currentSection.humanFeeling}
          </div>
        )}
      </div>

      {/* 5. Minimalist Hairline Progress Bar at the Bottom */}
      <div
        style={{
          position: 'absolute',
          bottom: '50px',
          left: '80px',
          right: '80px',
          height: '3px',
          backgroundColor: isWarmScene ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.12)',
          borderRadius: '4px',
          overflow: 'hidden',
          zIndex: 40,
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${totalProgress * 100}%`,
            backgroundColor: accentGoldColor,
            borderRadius: '4px',
            boxShadow: !isWarmScene ? '0 0 10px rgba(232, 176, 76, 0.7)' : 'none',
          }}
        />
      </div>
    </div>
  );
};
