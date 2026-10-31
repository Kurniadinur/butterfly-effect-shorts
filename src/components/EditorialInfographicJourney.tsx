import React, { useMemo } from 'react';
import { Img, useCurrentFrame, useVideoConfig, staticFile, interpolate, spring } from 'remotion';
import { ButterflyNode } from '../data/types';
import { detectOrganFromText } from '../utils/anatomyUtils';
import { inferHumanFeelingForNode } from '../utils/editorialThemes';

export interface EditorialInfographicJourneyProps {
  storyId?: string | null;
  editorialMood?: string | null;
  nodes: ButterflyNode[];
  hookDurationFrames: number;
  outroDurationFrames: number;
  totalDurationFrames: number;
  characterActionPng?: string | null;
}

// Organ signature colors & clean metadata
const ORGAN_THEMES: Record<string, { label: string; color: string; icon: string; defaultPng: string }> = {
  bladder: { label: 'KANDUNG KEMIH', color: '#38bdf8', icon: '💧', defaultPng: 'butterfly/organs/bladder.png' },
  kidney: { label: 'GINJAL & FILTRASI', color: '#a855f7', icon: '🟣', defaultPng: 'butterfly/organs/kidneys.png' },
  nerves: { label: 'SISTEM SARAF', color: '#818cf8', icon: '⚡', defaultPng: 'butterfly/organs/nerves.png' },
  brain: { label: 'OTAK & KOGNISI', color: '#38bdf8', icon: '🧠', defaultPng: 'butterfly/organs/brain.png' },
  heart: { label: 'JANTUNG & SIRKULASI', color: '#f43f5e', icon: '💓', defaultPng: 'butterfly/organs/heart.png' },
  blood: { label: 'ALIRAN DARAH', color: '#ef4444', icon: '🩸', defaultPng: 'butterfly/organs/blood_vessels.png' },
  stomach: { label: 'LAMBUNG & ASAM', color: '#fb923c', icon: '🔥', defaultPng: 'butterfly/organs/stomach.png' },
  lungs: { label: 'PARU-PARU & NAPAS', color: '#2dd4bf', icon: '🫁', defaultPng: 'butterfly/organs/lungs.png' },
  intestine: { label: 'SALURAN USUS', color: '#eab308', icon: '🌀', defaultPng: 'butterfly/organs/intestines.png' },
  pancreas: { label: 'PANKREAS & INSULIN', color: '#10b981', icon: '🟢', defaultPng: 'butterfly/organs/pancreas.png' },
  muscles: { label: 'OTOT & RANGKA', color: '#fb7185', icon: '💪', defaultPng: 'butterfly/organs/blood_vessels.png' },
  'full-body': { label: 'SELURUH TUBUH', color: '#38bdf8', icon: '🧍', defaultPng: 'butterfly/organs/bladder.png' },
};

export const EditorialInfographicJourney: React.FC<EditorialInfographicJourneyProps> = ({
  nodes,
  hookDurationFrames,
  characterActionPng,
}) => {
  const relFrame = useCurrentFrame();
  const frame = relFrame + hookDurationFrames;
  const { fps } = useVideoConfig();

  // Find currently active node
  const activeNodeIndex = useMemo(() => {
    const idx = nodes.findIndex((n) => frame >= n.startFrame && frame < n.startFrame + n.durationFrames);
    if (idx !== -1) return idx;
    if (frame < nodes[0]?.startFrame) return 0;
    return nodes.length - 1;
  }, [frame, nodes]);

  const activeNode = nodes[activeNodeIndex] || nodes[0];
  if (!activeNode) return null;

  // Frame progress within current node
  const nodeRelFrame = Math.max(0, frame - activeNode.startFrame);
  const nodeDur = Math.max(1, activeNode.durationFrames);

  // Smooth entrance spring
  const enterSpring = spring({
    frame: nodeRelFrame,
    fps,
    config: { damping: 18, stiffness: 120, mass: 0.9 },
  });

  // Crossfade at scene boundaries (8 frames)
  const fadeIn = interpolate(nodeRelFrame, [0, 8], [0, 1], { extrapolateRight: 'clamp' });
  const fadeOut = interpolate(nodeRelFrame, [nodeDur - 8, nodeDur], [1, 0], { extrapolateLeft: 'clamp' });
  const sceneOpacity = Math.min(fadeIn, fadeOut);

  // Subtle continuous Ken Burns push-in on the image card
  const cardZoom = interpolate(nodeRelFrame, [0, nodeDur], [1.0, 1.05], { extrapolateRight: 'clamp' });

  // Resolve organ target & visual theme
  const organId = (activeNode.organTarget || detectOrganFromText(activeNode.organTarget, activeNode.headline).id).toLowerCase();
  const theme = ORGAN_THEMES[organId] || ORGAN_THEMES['bladder'];

  // Resolve human feeling & emoji
  const sensation = useMemo(() => inferHumanFeelingForNode(activeNode), [activeNode]);

  // Image source: prefer organ illustration, fallback to mediaUrl or character
  let displayImage = theme.defaultPng;
  if (activeNode.mediaUrl && !activeNode.mediaUrl.includes('medical_body_xray')) {
    displayImage = activeNode.mediaUrl;
  }

  // Chaos / emergency intensity
  const chaos = activeNode.chaosLevel ?? 30;
  const isEmergency = chaos >= 60;

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        opacity: sceneOpacity,
        pointerEvents: 'none',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '0 40px',
      }}
    >
      {/* =====================================================================
          1. TOP HEADER: PHASE MILESTONE BADGE & BOLD HEADLINE
          ===================================================================== */}
      <div
        style={{
          position: 'absolute',
          top: '70px',
          left: '40px',
          right: '40px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '14px',
          transform: `translateY(${interpolate(enterSpring, [0, 1], [-20, 0])}px)`,
        }}
      >
        {/* Phase / Time Badge Pill */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            padding: '8px 24px',
            backgroundColor: 'rgba(15, 23, 42, 0.85)',
            backdropFilter: 'blur(20px)',
            borderRadius: '999px',
            border: `1.5px solid ${theme.color}88`,
            boxShadow: `0 8px 24px rgba(0, 0, 0, 0.6), 0 0 20px ${theme.color}35`,
          }}
        >
          <span style={{ fontSize: '15px' }}>{theme.icon}</span>
          <span
            style={{
              fontFamily: "'Space Grotesk', monospace",
              fontSize: '13px',
              fontWeight: 800,
              color: theme.color,
              letterSpacing: '1.2px',
              textTransform: 'uppercase',
            }}
          >
            {activeNode.timeOrYear || `FASE ${activeNode.step || activeNodeIndex + 1}`}
          </span>
        </div>

        {/* Big Bold Headline */}
        <h1
          style={{
            fontFamily: "'Montserrat', -apple-system, sans-serif",
            fontSize: '44px',
            fontWeight: 900,
            color: '#FFFFFF',
            textAlign: 'center',
            textTransform: 'uppercase',
            letterSpacing: '-0.5px',
            lineHeight: 1.15,
            margin: 0,
            maxWidth: '920px',
            textShadow: '0 4px 20px rgba(0, 0, 0, 0.9), 0 2px 4px rgba(0, 0, 0, 0.8)',
          }}
        >
          {activeNode.headline}
        </h1>
      </div>

      {/* =====================================================================
          2. CENTER STAGE: CLEAN EDITORIAL INFOGRAPHIC CARD
          ===================================================================== */}
      <div
        style={{
          position: 'absolute',
          top: '290px',
          left: '50px',
          right: '50px',
          height: '760px',
          backgroundColor: 'rgba(15, 23, 42, 0.72)',
          backdropFilter: 'blur(24px)',
          borderRadius: '32px',
          border: `2px solid ${isEmergency ? '#ef4444' : theme.color}66`,
          boxShadow: isEmergency
            ? '0 24px 60px rgba(0, 0, 0, 0.9), 0 0 35px rgba(239, 68, 68, 0.35)'
            : `0 24px 60px rgba(0, 0, 0, 0.9), 0 0 25px ${theme.color}25`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          transform: `scale(${cardZoom})`,
        }}
      >
        {/* Ambient Radial Glow inside Card */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `radial-gradient(circle at 50% 50%, ${isEmergency ? '#ef444422' : theme.color + '18'} 0%, transparent 70%)`,
            pointerEvents: 'none',
          }}
        />

        {/* Top-Left Stat / Primary Text Pill */}
        <div
          style={{
            position: 'absolute',
            top: '20px',
            left: '24px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 16px',
            borderRadius: '999px',
            backgroundColor: 'rgba(9, 13, 22, 0.82)',
            border: `1px solid ${theme.color}55`,
            backdropFilter: 'blur(12px)',
          }}
        >
          <div
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: theme.color,
              boxShadow: `0 0 8px ${theme.color}`,
            }}
          />
          <span
            style={{
              fontFamily: "'Space Grotesk', monospace",
              fontSize: '12px',
              fontWeight: 800,
              color: '#F4F0EA',
              letterSpacing: '0.8px',
              textTransform: 'uppercase',
            }}
          >
            {activeNode.primaryText || theme.label}
          </span>
        </div>

        {/* Top-Right Secondary Text / Severity Pill */}
        <div
          style={{
            position: 'absolute',
            top: '20px',
            right: '24px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 16px',
            borderRadius: '999px',
            backgroundColor: isEmergency ? 'rgba(239, 68, 68, 0.22)' : 'rgba(9, 13, 22, 0.82)',
            border: `1px solid ${isEmergency ? '#ef4444' : 'rgba(255, 255, 255, 0.15)'}`,
            backdropFilter: 'blur(12px)',
          }}
        >
          <span
            style={{
              fontFamily: "'Space Grotesk', monospace",
              fontSize: '11px',
              fontWeight: 800,
              color: isEmergency ? '#fca5a5' : '#94a3b8',
              letterSpacing: '0.8px',
              textTransform: 'uppercase',
            }}
          >
            {isEmergency ? '⚠️ STATUS: KRITIS' : activeNode.secondaryText ? activeNode.secondaryText.slice(0, 22) : 'REAKSI ORGAN'}
          </span>
        </div>

        {/* Center Visual: Large, High-Resolution Illustration / Organ Graphic */}
        <div
          style={{
            width: '560px',
            height: '520px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
          }}
        >
          <Img
            src={staticFile(displayImage)}
            style={{
              maxWidth: '100%',
              maxHeight: '100%',
              objectFit: 'contain',
              filter: isEmergency
                ? 'drop-shadow(0 0 25px rgba(239, 68, 68, 0.6)) drop-shadow(0 12px 30px rgba(0,0,0,0.8))'
                : `drop-shadow(0 0 25px ${theme.color}55) drop-shadow(0 12px 30px rgba(0,0,0,0.8))`,
              transform: `scale(${1 + Math.sin(frame * 0.08) * 0.02})`,
            }}
          />

          {/* Optional Character Mini Reaction in corner of card */}
          {characterActionPng && (
            <div
              style={{
                position: 'absolute',
                bottom: '12px',
                right: '12px',
                width: '110px',
                height: '150px',
                borderRadius: '16px',
                backgroundColor: 'rgba(9, 13, 22, 0.85)',
                border: `1.5px solid ${isEmergency ? '#ef4444' : theme.color}66`,
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.75)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                padding: '4px',
              }}
            >
              <Img
                src={staticFile(characterActionPng)}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                }}
              />
            </div>
          )}
        </div>

        {/* Bottom Detail Strip inside Card */}
        <div
          style={{
            position: 'absolute',
            bottom: '18px',
            left: '32px',
            right: '32px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <span
            style={{
              fontFamily: "'Space Grotesk', monospace",
              fontSize: '13.5px',
              fontWeight: 600,
              color: '#94a3b8',
              letterSpacing: '0.4px',
              textAlign: 'center',
              maxWidth: '780px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {activeNode.caption || 'Mekanisme biologis internal tubuh manusia'}
          </span>
        </div>
      </div>

      {/* =====================================================================
          3. HUMAN SENSATION CAPSULE (Center-Bottom, right above Subtitles)
          ===================================================================== */}
      <div
        style={{
          position: 'absolute',
          bottom: '520px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 35,
          pointerEvents: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '12px 28px',
          backgroundColor: 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(20px)',
          borderRadius: '999px',
          border: `1.5px solid ${isEmergency ? '#ef4444' : theme.color}77`,
          boxShadow: isEmergency
            ? '0 10px 30px rgba(0, 0, 0, 0.8), 0 0 20px rgba(239, 68, 68, 0.35)'
            : `0 10px 30px rgba(0, 0, 0, 0.8), 0 0 16px ${theme.color}25`,
          maxWidth: '880px',
        }}
      >
        <span style={{ fontSize: '20px' }}>{sensation.emoji}</span>
        <span
          style={{
            fontFamily: "'Montserrat', sans-serif",
            fontSize: '15px',
            fontWeight: 800,
            color: '#FFFFFF',
            letterSpacing: '0.3px',
            textTransform: 'uppercase',
            whiteSpace: 'nowrap',
          }}
        >
          {sensation.feeling}
        </span>
      </div>
    </div>
  );
};
