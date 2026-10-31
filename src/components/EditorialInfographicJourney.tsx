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

/**
 * Resolves a contextually matching 3D character action illustration
 * based on the physical human symptom of each node.
 */
export function resolveCharacterActionForNode(node: ButterflyNode, fallbackPng?: string | null): string {
  const combined = `${node.headline || ''} ${node.humanFeeling || ''} ${node.narration || ''} ${node.caption || ''} ${node.primaryText || ''} ${node.secondaryText || ''}`.toLowerCase();

  if (/gemetar|goyang.*kaki|tarian kencing|kaki|fidget|tremor|menggoyangkan/i.test(combined)) {
    return 'butterfly/characters/action_shaking_legs.png';
  }
  if (/pegal|pinggang|ginjal|flank|punggung belakang|ngilu/i.test(combined)) {
    return 'butterfly/characters/action_back_pain.png';
  }
  if (/geli|perut bawah|sensasi awal|sinyal pertama|150ml/i.test(combined)) {
    return 'butterfly/characters/action_belly_tingle.png';
  }
  if (/menggigil|meriang|demam|dingin|sepsis|chills/i.test(combined)) {
    return 'butterfly/characters/action_shivering.png';
  }
  if (/batuk|tersedak/i.test(combined)) {
    return 'butterfly/characters/action_coughing.png';
  }
  if (/mengantuk|sleepy|lemas|tidur/i.test(combined)) {
    return 'butterfly/characters/action_sleepy.png';
  }

  return fallbackPng || 'butterfly/characters/action_holding_pee.png';
}

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

  // Dynamic character symptom action image matching this node's feeling
  const nodeActionImage = useMemo(
    () => resolveCharacterActionForNode(activeNode, characterActionPng),
    [activeNode, characterActionPng]
  );

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

          {/* Dynamic Character Mini Reaction in corner of card */}
          {nodeActionImage && (
            <div
              style={{
                position: 'absolute',
                bottom: '12px',
                right: '12px',
                width: '120px',
                height: '160px',
                borderRadius: '18px',
                backgroundColor: 'rgba(9, 13, 22, 0.88)',
                border: `1.5px solid ${isEmergency ? '#ef4444' : theme.color}77`,
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.8)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'flex-end',
                overflow: 'hidden',
                padding: '6px',
              }}
            >
              {/* Mini Label */}
              <div
                style={{
                  position: 'absolute',
                  top: '6px',
                  left: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  zIndex: 2,
                }}
              >
                <span
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: isEmergency ? '#ef4444' : theme.color,
                    boxShadow: `0 0 6px ${isEmergency ? '#ef4444' : theme.color}`,
                  }}
                />
                <span
                  style={{
                    fontFamily: "'Space Grotesk', monospace",
                    fontSize: '9px',
                    fontWeight: 800,
                    color: '#cbd5e1',
                    letterSpacing: '0.6px',
                  }}
                >
                  REAKSI
                </span>
              </div>

              <Img
                src={staticFile(nodeActionImage)}
                style={{
                  width: '100%',
                  height: '90%',
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
          bottom: '515px',
          left: '50%',
          transform: `translateX(-50%) scale(${1 + Math.sin(frame * 0.08) * 0.012})`,
          zIndex: 35,
          pointerEvents: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          padding: '10px 26px 10px 14px',
          backgroundColor: 'rgba(15, 23, 42, 0.94)',
          backdropFilter: 'blur(20px)',
          borderRadius: '999px',
          border: `1.5px solid ${isEmergency ? '#ef4444' : theme.color}99`,
          boxShadow: isEmergency
            ? '0 12px 35px rgba(0, 0, 0, 0.85), 0 0 24px rgba(239, 68, 68, 0.45)'
            : `0 12px 35px rgba(0, 0, 0, 0.85), 0 0 20px ${theme.color}40`,
          maxWidth: '880px',
        }}
      >
        {/* Symptom Character Thumbnail Avatar */}
        {nodeActionImage && (
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              overflow: 'hidden',
              backgroundColor: 'rgba(9, 13, 22, 0.95)',
              border: `2px solid ${isEmergency ? '#ef4444' : theme.color}`,
              boxShadow: `0 0 16px ${isEmergency ? '#ef4444' : theme.color}88`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Img
              src={staticFile(nodeActionImage)}
              style={{
                width: '92%',
                height: '92%',
                objectFit: 'contain',
                transform: nodeActionImage.includes('shaking_legs')
                  ? 'scale(1.55) translateY(-2px)'
                  : 'scale(1.25)',
              }}
            />
          </div>
        )}

        {/* Symptom Text Details */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            gap: '2px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span style={{ fontSize: '13px' }}>{sensation.emoji}</span>
            <span
              style={{
                fontFamily: "'Space Grotesk', monospace",
                fontSize: '11px',
                fontWeight: 800,
                color: isEmergency ? '#fca5a5' : theme.color,
                letterSpacing: '0.8px',
                textTransform: 'uppercase',
              }}
            >
              GEJALA YANG DIRASAKAN
            </span>
          </div>

          <span
            style={{
              fontFamily: "'Montserrat', sans-serif",
              fontSize: '15px',
              fontWeight: 900,
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
    </div>
  );
};
