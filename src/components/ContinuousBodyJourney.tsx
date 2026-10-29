import React, { useMemo } from 'react';
import { Img, useCurrentFrame, useVideoConfig, staticFile, interpolate } from 'remotion';
import { ButterflyNode, OrganTarget, WordTimestamp } from '../data/types';
import { detectOrganFromText } from './MedicalScannerScene';
import { resolveEditorialTheme, humanizeOnScreenText } from '../utils/editorialThemes';

export interface ContinuousBodyJourneyProps {
  storyId?: string | null;
  editorialMood?: string | null;
  nodes: ButterflyNode[];
  wordTimestamps?: WordTimestamp[];
  hookDurationFrames: number;
  outroDurationFrames: number;
  totalDurationFrames: number;
  baseBodyMediaUrl?: string;
}

interface OrganCameraAnchor {
  id: OrganTarget;
  label: string;
  stageX: number;
  stageY: number;
  zoomScale: number;
  color: string;
  organMediaUrl: string;
  // Direction for the 3D Callout Card relative to organ center ('left' or 'right')
  calloutSide: 'left' | 'right';
}

export const ORGAN_CAMERA_ANCHORS: Record<string, OrganCameraAnchor> = {
  'full-body': {
    id: 'full-body',
    label: 'SELURUH TUBUH',
    stageX: 50,
    stageY: 74,
    zoomScale: 1.05,
    color: '#38bdf8',
    organMediaUrl: 'butterfly/media/medical_body_xray.jpg',
    calloutSide: 'right',
  },
  brain: {
    id: 'brain',
    label: 'BAGIAN OTAK',
    stageX: 50,
    stageY: 12,
    zoomScale: 1.48,
    color: '#38bdf8',
    organMediaUrl: 'butterfly/organs/brain.png',
    calloutSide: 'right',
  },
  nerves: {
    id: 'nerves',
    label: 'SISTEM SARAF',
    stageX: 50,
    stageY: 22,
    zoomScale: 1.38,
    color: '#818cf8',
    organMediaUrl: 'butterfly/organs/brain.png',
    calloutSide: 'left',
  },
  lungs: {
    id: 'lungs',
    label: 'PARU-PARU',
    stageX: 50,
    stageY: 47,
    zoomScale: 1.36,
    color: '#2dd4bf',
    organMediaUrl: 'butterfly/organs/lungs.png',
    calloutSide: 'left',
  },
  heart: {
    id: 'heart',
    label: 'JANTUNG',
    stageX: 52,
    stageY: 49,
    zoomScale: 1.46,
    color: '#f43f5e',
    organMediaUrl: 'butterfly/organs/heart.png',
    calloutSide: 'right',
  },
  blood: {
    id: 'blood',
    label: 'PEMBULUH DARAH',
    stageX: 52,
    stageY: 49,
    zoomScale: 1.38,
    color: '#ef4444',
    organMediaUrl: 'butterfly/organs/heart.png',
    calloutSide: 'left',
  },
  liver: {
    id: 'liver',
    label: 'ORGAN HATI',
    stageX: 45,
    stageY: 62,
    zoomScale: 1.44,
    color: '#f59e0b',
    organMediaUrl: 'butterfly/organs/liver.png',
    calloutSide: 'left',
  },
  stomach: {
    id: 'stomach',
    label: 'LAMBUNG',
    stageX: 55,
    stageY: 63,
    zoomScale: 1.46,
    color: '#fb923c',
    organMediaUrl: 'butterfly/organs/stomach.png',
    calloutSide: 'right',
  },
  kidney: {
    id: 'kidney',
    label: 'GINJAL',
    stageX: 50,
    stageY: 70,
    zoomScale: 1.44,
    color: '#a855f7',
    organMediaUrl: 'butterfly/organs/kidneys.png',
    calloutSide: 'right',
  },
  intestine: {
    id: 'intestine',
    label: 'USUS HALUS',
    stageX: 50,
    stageY: 79,
    zoomScale: 1.38,
    color: '#eab308',
    organMediaUrl: 'butterfly/organs/intestines.png',
    calloutSide: 'left',
  },
  muscles: {
    id: 'muscles',
    label: 'OTOT TUBUH',
    stageX: 36,
    stageY: 80,
    zoomScale: 1.32,
    color: '#fb7185',
    organMediaUrl: 'butterfly/media/medical_body_xray.jpg',
    calloutSide: 'left',
  },
};

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '');
  const num = parseInt(clean, 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

function interpolateHexColor(colorA: string, colorB: string, t: number): string {
  const [r1, g1, b1] = hexToRgb(colorA);
  const [r2, g2, b2] = hexToRgb(colorB);
  const clamped = Math.max(0, Math.min(1, t));
  const r = Math.round(r1 + (r2 - r1) * clamped);
  const g = Math.round(g1 + (g2 - g1) * clamped);
  const b = Math.round(b1 + (b2 - b1) * clamped);
  return `rgb(${r}, ${g}, ${b})`;
}

// Smooth cubic ease-in-out for continuous non-jerky camera curve
function easeInOutCubic(t: number): number {
  const c = Math.max(0, Math.min(1, t));
  return c < 0.5 ? 4 * c * c * c : 1 - Math.pow(-2 * c + 2, 3) / 2;
}

/**
 * CONTINUOUS 3D VOLUMETRIC ANATOMICAL JOURNEY
 * - Zero hard cuts, zero flashes, zero recoil shakes.
 * - Multi-plane 3D CSS perspective (`perspective: 1300px`, `rotateX`, `rotateY`, `translateZ`)
 *   with shaded 3D volumetric organ meshes AND real 3D X-Ray anatomical close-up windows.
 * - Direct in-situ 3D Organ Callout Card with pointer line directly attached to the active organ
 *   so viewers immediately understand what is happening inside the body!
 */
export const ContinuousBodyJourney: React.FC<ContinuousBodyJourneyProps> = ({
  storyId,
  editorialMood,
  nodes,
  hookDurationFrames,
  outroDurationFrames,
  totalDurationFrames,
}) => {
  const relFrame = useCurrentFrame();
  const frame = relFrame + hookDurationFrames; // Absolute timeline frame
  const { fps } = useVideoConfig();

  const theme = useMemo(
    () => resolveEditorialTheme(storyId, editorialMood, nodes?.[0]?.headline),
    [storyId, editorialMood, nodes]
  );

  // Build continuous timeline waypoints from nodes (No mid-sentence jumps!)
  const waypoints = useMemo(() => {
    if (!nodes || nodes.length === 0) {
      return [
        {
          centerFrame: hookDurationFrames + 60,
          startFrame: hookDurationFrames,
          endFrame: totalDurationFrames - outroDurationFrames,
          anchor: ORGAN_CAMERA_ANCHORS['full-body'],
          chaosLevel: 35,
          headline: 'REAKSI ORGAN TUBUH',
          timeTag: 'TAHAP 1',
          primaryText: 'REAKSI TUBUH',
          secondaryText: 'Perubahan di dalam tubuh',
          step: 1,
        },
      ];
    }

    return nodes.map((n, idx) => {
      const detected = detectOrganFromText(
        n.organTarget,
        n.headline,
        n.timeOrYear,
        `${n.primaryText || ''} ${n.narration || ''}`,
        n.step || idx + 1
      );
      const anchor = ORGAN_CAMERA_ANCHORS[detected.id] || ORGAN_CAMERA_ANCHORS['full-body'];
      const sFrame = n.startFrame;
      const eFrame = n.startFrame + n.durationFrames;
      return {
        centerFrame: sFrame + Math.min(42, n.durationFrames * 0.35),
        startFrame: sFrame,
        endFrame: eFrame,
        anchor,
        chaosLevel: n.chaosLevel ?? 35,
        headline: humanizeOnScreenText(n.headline, anchor.label),
        timeTag: (n.timeOrYear || `TAHAP ${idx + 1}`).replace(/eksperimen|simulasi/gi, '').trim(),
        primaryText: humanizeOnScreenText(n.primaryText, n.secondaryText || 'REAKSI TUBUH'),
        secondaryText: n.secondaryText || n.caption || '',
        step: n.step || idx + 1,
      };
    });
  }, [nodes, hookDurationFrames, outroDurationFrames, totalDurationFrames]);

  // Find current active waypoint index
  const currentIdx = useMemo(() => {
    const found = waypoints.findIndex((wp) => frame >= wp.startFrame && frame < wp.endFrame);
    if (found !== -1) return found;
    if (frame < waypoints[0].startFrame) return 0;
    return waypoints.length - 1;
  }, [frame, waypoints]);

  const activeWp = waypoints[currentIdx];
  const prevWp = currentIdx > 0 ? waypoints[currentIdx - 1] : {
    ...activeWp,
    anchor: ORGAN_CAMERA_ANCHORS['full-body'],
    chaosLevel: 20,
  };

  // Continuous, butter-smooth camera glide over 48 frames (1.6 seconds) using cubic easing
  // Never teleports or snaps!
  const glideRaw = (frame - activeWp.startFrame) / 48;
  const glideProgress = easeInOutCubic(glideRaw);

  const camStageX = interpolate(glideProgress, [0, 1], [prevWp.anchor.stageX, activeWp.anchor.stageX]);
  const camStageY = interpolate(glideProgress, [0, 1], [prevWp.anchor.stageY, activeWp.anchor.stageY]);
  const camZoomBase = interpolate(glideProgress, [0, 1], [prevWp.anchor.zoomScale, activeWp.anchor.zoomScale]);
  const smoothChaos = interpolate(glideProgress, [0, 1], [prevWp.chaosLevel, activeWp.chaosLevel]);

  // Physiological Heartbeat & Breathing
  const bpm = Math.round(68 + (Math.min(100, Math.max(5, smoothChaos)) / 100) * 98);
  const beatPhase = (frame / fps) * (bpm / 60) * Math.PI * 2;
  const systolicBeat = Math.pow(Math.max(0, Math.sin(beatPhase)), 8);
  const diastolicBeat = Math.pow(Math.max(0, Math.sin(beatPhase - 0.65)), 12) * 0.45;
  const heartPulse = systolicBeat + diastolicBeat;

  const breathRate = 14 + (smoothChaos / 100) * 14;
  const breathCycle = (Math.sin((frame / fps) * (breathRate / 60) * Math.PI * 2) + 1) * 0.5;

  // True 3D Parallax & Orbital Rotation Angles (Makes the anatomy feel like a 3D hologram!)
  const orbitRotateY = Math.sin(frame * 0.022) * 8 + (50 - camStageX) * 0.25;
  const orbitRotateX = Math.cos(frame * 0.018) * 4 + (74 - camStageY) * 0.08;
  const floatX = Math.sin(frame * 0.024) * 10;
  const floatY = Math.cos(frame * 0.02) * 8;

  const finalScale = camZoomBase + Math.sin(frame * 0.016) * 0.03 + heartPulse * 0.012;
  const offsetX = (50 - camStageX) * 6.2 + floatX;
  const offsetY = (74 - camStageY) * 5.8 + floatY;

  const accentColor = interpolateHexColor(prevWp.anchor.color, activeWp.anchor.color, glideProgress);

  // Smooth per-organ focus weight (0..1) so the yellow/accent glow travels smoothly from one organ to the next!
  const getOrganFocusWeight = (organId: OrganTarget) => {
    const isCurr =
      activeWp.anchor.id === organId ||
      (organId === 'brain' && activeWp.anchor.id === 'nerves') ||
      (organId === 'heart' && activeWp.anchor.id === 'blood');
    const isPrev =
      prevWp.anchor.id === organId ||
      (organId === 'brain' && prevWp.anchor.id === 'nerves') ||
      (organId === 'heart' && prevWp.anchor.id === 'blood');

    if (isCurr && isPrev) return 1;
    if (isCurr) return glideProgress;
    if (isPrev) return 1 - glideProgress;
    return 0;
  };

  // Selective X-Ray opacity for each 3D organ:
  // Active organ shines at 100%, while non-active organs become semi-transparent (0.18..0.28)
  // inside the 3D body so overlapping organs (like kidneys behind intestines or lungs behind heart)
  // never look crowded or messy!
  const getOrganGlow = (organId: OrganTarget, ox: number, oy: number) => {
    const focusW = getOrganFocusWeight(organId);
    const dist = Math.hypot(camStageX - ox, camStageY - oy);
    const prox = Math.max(0, 1 - dist / 24);
    return Math.min(1, 0.16 + focusW * 0.84 + prox * 0.16);
  };

  // Dynamic CSS filter for each 3D organ:
  // 1) Travelling golden/accent bioluminescent contour glow when active
  // 2) Subtle medical pathology/damage state when affected (e.g. inflamed/toxic darkening when chaos is elevated, without being excessive)
  const getOrganVisualFilter = (organId: OrganTarget) => {
    const focusW = getOrganFocusWeight(organId);
    const severity = Math.max(0, Math.min(1, (smoothChaos - 20) / 75));
    const pulse = 0.5 + 0.5 * Math.sin(frame * 0.14);

    if (focusW > 0.04) {
      const glowRadius = (3.2 + focusW * 5.5 + systolicBeat * 2.5).toFixed(1);
      const outerGoldRadius = (6.5 + focusW * 9.0 + pulse * 3.0).toFixed(1);
      // Subtle pathology tint depending on organ & severity (never cartoonish or overdone)
      let pathologyFilter = `brightness(${(1.06 + focusW * 0.18).toFixed(2)}) saturate(${(1.12 + severity * 0.25).toFixed(2)})`;
      if (organId === 'lungs' && severity > 0.25) {
        // Damaged/smoky/inflamed lungs: slightly darkened smoky-amber & warm inflammation
        pathologyFilter = `sepia(${(severity * 0.42).toFixed(2)}) hue-rotate(${(-18 * severity).toFixed(1)}deg) brightness(${(0.95 - severity * 0.12 + pulse * 0.08).toFixed(2)}) contrast(1.18)`;
      } else if (organId === 'liver' && severity > 0.25) {
        // Stressed/fatty/toxic liver: warm amber-reddish hepatic stress
        pathologyFilter = `sepia(${(severity * 0.35).toFixed(2)}) saturate(${(1.25 + severity * 0.35).toFixed(2)}) brightness(${(1.02 + pulse * 0.08).toFixed(2)})`;
      } else if ((organId === 'intestine' || organId === 'stomach') && severity > 0.2) {
        // Inflamed digestive tract: warm irritated glow
        pathologyFilter = `hue-rotate(${(-12 * severity).toFixed(1)}deg) saturate(${(1.22 + severity * 0.32).toFixed(2)}) brightness(${(1.08 + pulse * 0.1).toFixed(2)})`;
      } else if (organId === 'kidney' && severity > 0.25) {
        pathologyFilter = `hue-rotate(${(-15 * severity).toFixed(1)}deg) saturate(${(1.2 + severity * 0.3).toFixed(2)}) brightness(${(1.05 + pulse * 0.08).toFixed(2)})`;
      }

      return `${pathologyFilter} drop-shadow(0px 0px ${glowRadius}px #fde047) drop-shadow(0px 0px ${outerGoldRadius}px ${accentColor})`;
    }

    return 'brightness(0.78) saturate(0.88) drop-shadow(0px 4px 8px rgba(0,0,0,0.75))';
  };

  // Live EKG Path
  const ekgPath = useMemo(() => {
    const width = 220;
    const points: string[] = [];
    const speed = 3.2 + (smoothChaos / 100) * 3.4;
    const scroll = frame * speed;
    const cycleWidth = Math.max(46, Math.round(110 - (smoothChaos / 100) * 48));

    for (let x = 0; x <= width; x += 3) {
      const pos = (x + scroll) % cycleWidth;
      const norm = pos / cycleWidth;
      let y = 20;
      if (norm > 0.18 && norm < 0.28) {
        y -= Math.sin(((norm - 0.18) / 0.1) * Math.PI) * 4;
      } else if (norm >= 0.34 && norm < 0.38) {
        y += 4;
      } else if (norm >= 0.38 && norm < 0.45) {
        const spike = 1 - Math.abs((norm - 0.415) / 0.035);
        y -= spike * (15 + (smoothChaos / 100) * 5);
      } else if (norm >= 0.45 && norm < 0.50) {
        y += 6;
      } else if (norm >= 0.58 && norm < 0.72) {
        y -= Math.sin(((norm - 0.58) / 0.14) * Math.PI) * 5;
      }
      points.push(`${x === 0 ? 'M' : 'L'} ${x} ${y.toFixed(1)}`);
    }
    return points.join(' ');
  }, [frame, smoothChaos]);

  // 18 Depth-Layered 3D Particles
  const particles = useMemo(() => {
    return Array.from({ length: 18 }).map((_, idx) => {
      const s1 = ((idx * 67 + 19) % 100) / 100;
      const s2 = ((idx * 43 + 37) % 100) / 100;
      const depth = idx % 3;
      return {
        id: idx,
        baseX: 110 + s1 * 860,
        baseY: 160 + s2 * 1120,
        size: depth === 2 ? 18 + (idx % 8) : depth === 1 ? 10 + (idx % 5) : 5 + (idx % 4),
        speedY: -1.1 - s2 * 1.8,
        waveAmp: 15 + (idx % 5) * 7,
        waveFreq: 0.025 + (idx % 4) * 0.01,
        blur: depth === 2 ? 3 : 0,
        opacity: depth === 2 ? 0.32 : depth === 1 ? 0.58 : 0.38,
      };
    });
  }, []);

  // Screen pixel coordinates where the active organ sits after camera transform,
  // so our 3D Callout Card points directly to the exact center of the organ!
  const baseScreenX = activeWp.anchor.stageX * 10.8;
  const baseScreenY = activeWp.anchor.stageY * 10.38;
  const organScreenX = 540 + (baseScreenX - 540) * finalScale + offsetX;
  const organScreenY = 806.4 + (baseScreenY - 806.4) * finalScale + offsetY;
  const clampedTargetX = Math.max(240, Math.min(840, organScreenX));
  const clampedTargetY = Math.max(250, Math.min(1140, organScreenY));

  const calloutOnRight = activeWp.anchor.calloutSide === 'right';
  const cardLeft = calloutOnRight ? Math.min(604, clampedTargetX + 125) : Math.max(36, clampedTargetX - 565);
  const cardTop = Math.max(220, Math.min(840, clampedTargetY - 210));

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: theme.bgGradient,
        overflow: 'hidden',
        perspective: '1350px',
      }}
    >
      {/* Dynamic Studio Texture (Adapts per Editorial Theme) */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: theme.bgPatternImage,
          backgroundSize: theme.bgPatternSize,
          pointerEvents: 'none',
        }}
      />

      {/* Minimalist Architectural Corner Registration Marks */}
      <div
        style={{
          position: 'absolute',
          top: '36px',
          left: '36px',
          right: '36px',
          bottom: '36px',
          pointerEvents: 'none',
          zIndex: 15,
        }}
      >
        <div style={{ position: 'absolute', top: 0, left: 0, width: 16, height: 16, borderTop: '2px solid rgba(244,240,234,0.28)', borderLeft: '2px solid rgba(244,240,234,0.28)' }} />
        <div style={{ position: 'absolute', top: 0, right: 0, width: 16, height: 16, borderTop: '2px solid rgba(244,240,234,0.28)', borderRight: '2px solid rgba(244,240,234,0.28)' }} />
      </div>

      {/* =====================================================================
          1. TRUE 3D MULTI-PLANE PARALLAX ANATOMICAL RIG (rotateX + rotateY + translateZ)
          ===================================================================== */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          transformStyle: 'preserve-3d',
          transform: `translate3d(${offsetX}px, ${offsetY}px, 0px) scale(${finalScale}) rotateY(${orbitRotateY.toFixed(2)}deg) rotateX(${orbitRotateX.toFixed(2)}deg)`,
          transformOrigin: '50% 42%',
        }}
      >
        {/* PLANE -60px (DEEP AMBIENT BACKDROP): Subtle Studio Spotlight */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            transform: 'translateZ(-60px)',
            background: 'radial-gradient(circle at 50% 44%, rgba(244, 240, 234, 0.06) 0%, transparent 58%)',
          }}
        />

        {/* PLANE 0px (MIDGROUND): VOLUMETRIC 3D SHADED ANATOMICAL ORGANS SVG */}
        <svg
          width="1080"
          height="1920"
          viewBox="0 0 100 185"
          style={{
            position: 'absolute',
            inset: 0,
            overflow: 'visible',
            transform: 'translateZ(20px)',
            filter: 'drop-shadow(0 18px 28px rgba(0, 0, 0, 0.75))',
          }}
        >
          <defs>
            {/* 3D Volumetric Spherical & Cylindrical Gradients with Specular Highlights (cx=32%, cy=28%) */}
            <radialGradient id="vol3DBrain" cx="35%" cy="30%" r="65%">
              <stop offset="0%" stopColor="#e0f2fe" />
              <stop offset="28%" stopColor="#38bdf8" />
              <stop offset="72%" stopColor="#0284c7" />
              <stop offset="100%" stopColor="#082f49" />
            </radialGradient>

            <radialGradient id="vol3DLung" cx="32%" cy="28%" r="70%">
              <stop offset="0%" stopColor="#ccfbf1" />
              <stop offset="30%" stopColor="#2dd4bf" />
              <stop offset="75%" stopColor="#0f766e" />
              <stop offset="100%" stopColor="#042f2e" />
            </radialGradient>

            <radialGradient id="vol3DHeart" cx="32%" cy="28%" r="65%">
              <stop offset="0%" stopColor="#ffe4e6" />
              <stop offset="25%" stopColor="#fb7185" />
              <stop offset="68%" stopColor="#e11d48" />
              <stop offset="100%" stopColor="#4c0519" />
            </radialGradient>

            <radialGradient id="vol3DLiver" cx="32%" cy="28%" r="68%">
              <stop offset="0%" stopColor="#fef3c7" />
              <stop offset="28%" stopColor="#f59e0b" />
              <stop offset="72%" stopColor="#b45309" />
              <stop offset="100%" stopColor="#451a03" />
            </radialGradient>

            <radialGradient id="vol3DStomach" cx="34%" cy="28%" r="68%">
              <stop offset="0%" stopColor="#ffedd5" />
              <stop offset="28%" stopColor="#fb923c" />
              <stop offset="72%" stopColor="#c2410c" />
              <stop offset="100%" stopColor="#431407" />
            </radialGradient>

            <radialGradient id="vol3DKidney" cx="32%" cy="28%" r="65%">
              <stop offset="0%" stopColor="#f3e8ff" />
              <stop offset="28%" stopColor="#c084fc" />
              <stop offset="72%" stopColor="#7e22ce" />
              <stop offset="100%" stopColor="#3b0764" />
            </radialGradient>

            <radialGradient id="vol3DIntestine" cx="35%" cy="28%" r="70%">
              <stop offset="0%" stopColor="#fef9c3" />
              <stop offset="30%" stopColor="#eab308" />
              <stop offset="75%" stopColor="#a16207" />
              <stop offset="100%" stopColor="#422006" />
            </radialGradient>

            <linearGradient id="glassBodyRim" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(125, 211, 252, 0.32)" />
              <stop offset="20%" stopColor="rgba(56, 189, 248, 0.04)" />
              <stop offset="80%" stopColor="rgba(56, 189, 248, 0.04)" />
              <stop offset="100%" stopColor="rgba(125, 211, 252, 0.32)" />
            </linearGradient>
          </defs>

          {/* REAL 3D TRANSLUCENT GLASS HUMAN BODY SHELL (Back Layer) */}
          <image
            href={staticFile('butterfly/organs/body_3d_shell.png')}
            x="0"
            y="0"
            width="100"
            height="179"
            preserveAspectRatio="xMidYMin meet"
            opacity="0.76"
            style={{ mixBlendMode: 'screen' }}
          />

          {/* 1. REAL 3D ANATOMICAL BRAIN (Cranial Cavity — Stage X: 50, Y: 12) */}
          <g
            transform={`translate(50, 12) scale(${1 + Math.sin(frame * 0.08) * 0.025 + getOrganFocusWeight('brain') * 0.08})`}
            opacity={getOrganGlow('brain', 50, 12)}
            style={{ filter: getOrganVisualFilter('brain') }}
          >
            <image
              href={staticFile('butterfly/organs/brain.png')}
              x="-6.2"
              y="-6.5"
              width="12.4"
              height="13"
              preserveAspectRatio="xMidYMid meet"
            />
            {/* Active Neural Synapse Sparks */}
            <circle cx={Math.sin(frame * 0.16) * 3.2} cy={Math.cos(frame * 0.22) * 2.1} r="0.55" fill="#ffffff" />
            <circle cx={Math.cos(frame * 0.14) * -2.8} cy={Math.sin(frame * 0.19) * 1.8} r="0.48" fill="#fde047" />
          </g>

          {/* 2. REAL 3D ANATOMICAL LUNGS (Thoracic Ribcage — Stage X: 50, Y: 47) */}
          <g
            transform={`translate(50, 47) scale(${1 + breathCycle * 0.04 + getOrganFocusWeight('lungs') * 0.06}, ${1 + breathCycle * 0.035 + getOrganFocusWeight('lungs') * 0.06})`}
            opacity={getOrganGlow('lungs', 50, 47)}
            style={{ filter: getOrganVisualFilter('lungs') }}
          >
            <image
              href={staticFile('butterfly/organs/lungs.png')}
              x="-12"
              y="-12"
              width="24"
              height="24"
              preserveAspectRatio="xMidYMid meet"
            />
          </g>

          {/* 3. REAL 3D ANATOMICAL BEATING HEART (Mediastinum — Stage X: 52, Y: 49) */}
          <g
            transform={`translate(52, 49) scale(${1 + heartPulse * 0.13 + getOrganFocusWeight('heart') * 0.08})`}
            opacity={Math.max(0.45, getOrganGlow('heart', 52, 49))}
            style={{ filter: getOrganVisualFilter('heart') }}
          >
            <image
              href={staticFile('butterfly/organs/heart.png')}
              x="-5"
              y="-6.8"
              width="10"
              height="13.6"
              preserveAspectRatio="xMidYMid meet"
            />
          </g>

          {/* 6. REAL 3D ANATOMICAL KIDNEYS (Retroperitoneal Back Layer — Stage X: 50, Y: 70, rendered BEHIND Liver/Stomach/Intestines!) */}
          <g
            transform={`translate(50, 70) scale(${1 + getOrganFocusWeight('kidney') * 0.08})`}
            opacity={getOrganGlow('kidney', 50, 70)}
            style={{ filter: getOrganVisualFilter('kidney') }}
          >
            <image
              href={staticFile('butterfly/organs/kidneys.png')}
              x="-8.5"
              y="-7"
              width="17"
              height="14"
              preserveAspectRatio="xMidYMid meet"
            />
          </g>

          {/* 4. REAL 3D ANATOMICAL LIVER (Right Upper Quadrant — Stage X: 45, Y: 62) */}
          <g
            transform={`translate(45, 62) scale(${1 + getOrganFocusWeight('liver') * 0.08})`}
            opacity={getOrganGlow('liver', 45, 62)}
            style={{ filter: getOrganVisualFilter('liver') }}
          >
            <image
              href={staticFile('butterfly/organs/liver.png')}
              x="-7.5"
              y="-6"
              width="15"
              height="12"
              preserveAspectRatio="xMidYMid meet"
            />
          </g>

          {/* 5. REAL 3D ANATOMICAL STOMACH (Left Upper Quadrant — Stage X: 55, Y: 63) */}
          <g
            transform={`translate(55, 63) scale(${1 + Math.sin(frame * 0.08) * 0.025 + getOrganFocusWeight('stomach') * 0.08})`}
            opacity={getOrganGlow('stomach', 55, 63)}
            style={{ filter: getOrganVisualFilter('stomach') }}
          >
            <image
              href={staticFile('butterfly/organs/stomach.png')}
              x="-6"
              y="-7.5"
              width="12"
              height="15"
              preserveAspectRatio="xMidYMid meet"
            />
          </g>

          {/* 7. REAL 3D ANATOMICAL INTESTINES (Abdominal Cavity Above Pelvis — Stage X: 50, Y: 78) */}
          <g
            transform={`translate(50, 78) scale(${1 + getOrganFocusWeight('intestine') * 0.07})`}
            opacity={getOrganGlow('intestine', 50, 79)}
            style={{ filter: getOrganVisualFilter('intestine') }}
          >
            <image
              href={staticFile('butterfly/organs/intestines.png')}
              x="-8.2"
              y="-8"
              width="16.4"
              height="16"
              preserveAspectRatio="xMidYMid meet"
            />
          </g>

          {/* FRONT 3D GLASS RIBCAGE & BODY CONTOUR OVERLAY (Encloses organs naturally inside the 3D body!) */}
          <image
            href={staticFile('butterfly/organs/body_3d_shell.png')}
            x="0"
            y="0"
            width="100"
            height="179"
            preserveAspectRatio="xMidYMin meet"
            opacity="0.28"
            style={{ mixBlendMode: 'screen', pointerEvents: 'none' }}
          />
        </svg>
      </div>

      {/* =====================================================================
          2. FOREGROUND 3D FLOATING CELLULAR PARTICLES
          ===================================================================== */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 12 }}>
        {particles.map((p) => {
          const curY = ((p.baseY + frame * p.speedY) % 1250 + 1250) % 1250 + 120;
          const curX = p.baseX + Math.sin(frame * p.waveFreq + p.id) * p.waveAmp;
          return (
            <div
              key={p.id}
              style={{
                position: 'absolute',
                left: `${curX}px`,
                top: `${curY}px`,
                width: `${p.size}px`,
                height: `${p.size}px`,
                borderRadius: '50%',
                background: `radial-gradient(circle at 32% 32%, #ffffff 0%, ${accentColor} 65%, transparent 100%)`,
                boxShadow: `0 0 ${p.size}px ${accentColor}`,
                opacity: p.opacity,
                filter: p.blur > 0 ? `blur(${p.blur}px)` : undefined,
              }}
            />
          );
        })}
      </div>

      {/* =====================================================================
          3. MULTI-THEME EDITORIAL CALLOUT (Physical Paper Card + Leader Line + Hard Shadow)
          ===================================================================== */}
      <svg
        width="1080"
        height="1920"
        style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 24 }}
      >
        {/* Clean L-Shaped Architectural Leader Line */}
        <polyline
          points={`${clampedTargetX},${clampedTargetY} ${
            calloutOnRight ? cardLeft - 24 : cardLeft + 444
          },${cardTop + 68} ${calloutOnRight ? cardLeft : cardLeft + 420},${cardTop + 68}`}
          fill="none"
          stroke={theme.leaderLineColor}
          strokeWidth="2.5"
        />
        <rect
          x={calloutOnRight ? cardLeft - 4 : cardLeft + 416}
          y={cardTop + 62}
          width="8"
          height="12"
          fill={theme.primaryHighlight}
        />
      </svg>

      <div
        style={{
          position: 'absolute',
          left: `${cardLeft}px`,
          top: `${cardTop}px`,
          width: '420px',
          zIndex: 25,
          backgroundColor: theme.cardBg,
          borderRadius: theme.cardRadius,
          border: theme.cardBorder,
          borderTop: theme.cardTopAccentBar ? `7px solid ${theme.cardTopAccentBar}` : theme.cardBorder,
          borderLeft: theme.cardLeftAccentSpine ? `8px solid ${theme.cardLeftAccentSpine}` : theme.cardBorder,
          boxShadow: theme.cardShadow,
          padding: '14px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
        }}
      >
        {/* Editorial Specimen Frame */}
        <div
          style={{
            position: 'relative',
            width: '104px',
            height: '104px',
            borderRadius: '3px',
            overflow: 'hidden',
            border: `2px solid ${theme.inkDark}`,
            backgroundColor: theme.specimenBg,
            flexShrink: 0,
          }}
        >
          <Img
            src={staticFile(activeWp.anchor.organMediaUrl)}
            style={{
              width: '86%',
              height: '86%',
              margin: '7%',
              objectFit: 'contain',
              transform: `scale(${1.04 + systolicBeat * 0.06})`,
            }}
          />
        </div>

        {/* High-Contrast Print Typography */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', minWidth: 0 }}>
          <div
            style={{
              fontFamily: "'Space Grotesk', monospace",
              fontSize: '12px',
              fontWeight: 800,
              color: theme.inkMuted,
              letterSpacing: '1.2px',
              textTransform: 'uppercase',
              borderBottom: '1.5px solid rgba(0,0,0,0.14)',
              paddingBottom: '3px',
            }}
          >
            {activeWp.anchor.label}
          </div>

          <div
            style={{
              fontFamily: "'Montserrat', sans-serif",
              fontSize: '20px',
              fontWeight: 900,
              color: theme.inkDark,
              lineHeight: 1.15,
              letterSpacing: '-0.4px',
              textTransform: 'uppercase',
            }}
          >
            {activeWp.headline}
          </div>

          {/* Editorial Marker Highlighter Strip */}
          <div
            style={{
              marginTop: '3px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: smoothChaos >= 65 ? theme.criticalHighlight : theme.primaryHighlight,
              padding: '3px 9px',
              borderRadius: '2px',
              border: `1.5px solid ${theme.inkDark}`,
              width: 'fit-content',
            }}
          >
            <span
              style={{
                fontFamily: "'Space Grotesk', monospace",
                fontSize: '11px',
                fontWeight: 900,
                color: smoothChaos >= 65 ? theme.criticalHighlightText : theme.primaryHighlightText,
                letterSpacing: '0.6px',
                textTransform: 'uppercase',
              }}
            >
              {activeWp.primaryText}
            </span>
          </div>
        </div>
      </div>

      {/* =====================================================================
          4. SUBTITLE SAFE ZONE PROTECTIVE GRADIENT (Strictly protects y >= 1200px)
          ===================================================================== */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: '660px',
          background:
            'linear-gradient(to top, rgba(9, 10, 12, 0.96) 0%, rgba(14, 15, 18, 0.78) 46%, transparent 100%)',
          pointerEvents: 'none',
          zIndex: 18,
        }}
      />

      {/* =====================================================================
          5. DYNAMIC MULTI-VARIANT TOP TIMELINE HEADER (Changes across themes!)
          ===================================================================== */}
      {theme.topBarVariant === 'floating-pills' ? (
        /* VARIANT B: Johnny Harris / Atlas Split Floating Pills */
        <div
          style={{
            position: 'absolute',
            top: '56px',
            left: '48px',
            right: '48px',
            zIndex: 30,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '12px',
              backgroundColor: theme.cardBg,
              padding: '10px 18px',
              borderRadius: '3px',
              border: `2.5px solid ${theme.inkDark}`,
              boxShadow: `6px 6px 0px ${theme.inkDark}`,
            }}
          >
            <span
              style={{
                backgroundColor: theme.primaryHighlight,
                color: theme.primaryHighlightText,
                fontFamily: "'Space Grotesk', monospace",
                fontSize: '14px',
                fontWeight: 900,
                padding: '3px 9px',
                borderRadius: '2px',
              }}
            >
              {activeWp.step < 10 ? `0${activeWp.step}` : activeWp.step}
            </span>
            <span
              style={{
                fontFamily: "'Montserrat', sans-serif",
                fontSize: '18px',
                fontWeight: 900,
                color: theme.inkDark,
                letterSpacing: '0.4px',
                textTransform: 'uppercase',
              }}
            >
              {activeWp.timeTag}
            </span>
          </div>

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '14px',
              backgroundColor: theme.specimenBg,
              padding: '10px 18px',
              borderRadius: '3px',
              border: `2px solid ${theme.paperLight}`,
              boxShadow: '6px 6px 0px rgba(0,0,0,0.85)',
            }}
          >
            <svg width="105" height="28" viewBox="0 0 220 40" style={{ overflow: 'visible' }}>
              <path
                d={ekgPath}
                fill="none"
                stroke={theme.primaryHighlight}
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
              <span style={{ fontFamily: "'Space Grotesk', monospace", fontSize: '21px', fontWeight: 900, color: '#F4F0EA' }}>
                {bpm}
              </span>
              <span style={{ fontFamily: "'Space Grotesk', monospace", fontSize: '11px', fontWeight: 800, color: theme.primaryHighlight }}>
                BPM
              </span>
            </div>
          </div>
        </div>
      ) : theme.topBarVariant === 'centered-timecode' ? (
        /* VARIANT C: Cleo Abram Studio Centered Clapper Timecode Strip */
        <div
          style={{
            position: 'absolute',
            top: '56px',
            left: '48px',
            right: '48px',
            zIndex: 30,
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '20px',
              backgroundColor: theme.cardBg,
              padding: '12px 26px',
              borderRadius: '6px',
              border: `3px solid ${theme.inkDark}`,
              boxShadow: `7px 7px 0px ${theme.primaryHighlight}`,
            }}
          >
            <span
              style={{
                backgroundColor: theme.inkDark,
                color: '#FFFFFF',
                fontFamily: "'Space Grotesk', monospace",
                fontSize: '14px',
                fontWeight: 900,
                padding: '4px 10px',
                borderRadius: '3px',
              }}
            >
              #{activeWp.step < 10 ? `0${activeWp.step}` : activeWp.step}
            </span>
            <span
              style={{
                fontFamily: "'Montserrat', sans-serif",
                fontSize: '18px',
                fontWeight: 900,
                color: theme.inkDark,
                textTransform: 'uppercase',
              }}
            >
              {activeWp.timeTag}
            </span>
            <div
              style={{
                borderLeft: `2px solid ${theme.inkDark}`,
                paddingLeft: '16px',
                display: 'flex',
                alignItems: 'baseline',
                gap: '4px',
              }}
            >
              <span style={{ fontFamily: "'Space Grotesk', monospace", fontSize: '20px', fontWeight: 900, color: theme.primaryHighlight }}>
                {bpm}
              </span>
              <span style={{ fontFamily: "'Space Grotesk', monospace", fontSize: '12px', fontWeight: 900, color: theme.inkDark }}>
                BPM
              </span>
            </div>
          </div>
        </div>
      ) : (
        /* VARIANT A: Classic Full-Width Documentary Header Bar */
        <div
          style={{
            position: 'absolute',
            top: '58px',
            left: '48px',
            right: '48px',
            zIndex: 30,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: theme.specimenBg,
            padding: '12px 20px',
            borderRadius: '4px',
            border: `2px solid ${theme.paperLight}`,
            boxShadow: '6px 6px 0px rgba(0, 0, 0, 0.85)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                backgroundColor: theme.primaryHighlight,
                color: theme.primaryHighlightText,
                fontFamily: "'Space Grotesk', monospace",
                fontSize: '14px',
                fontWeight: 900,
                padding: '4px 10px',
                borderRadius: '2px',
                letterSpacing: '0.8px',
              }}
            >
              {activeWp.step < 10 ? `0${activeWp.step}` : activeWp.step}
            </div>
            <span
              style={{
                fontFamily: "'Montserrat', sans-serif",
                fontSize: '18px',
                fontWeight: 900,
                color: theme.paperLight,
                letterSpacing: '0.4px',
                textTransform: 'uppercase',
              }}
            >
              {activeWp.timeTag}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
            <svg width="135" height="32" viewBox="0 0 220 40" style={{ overflow: 'visible' }}>
              <path
                d={ekgPath}
                fill="none"
                stroke={theme.primaryHighlight}
                strokeWidth="2.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
              <span style={{ fontFamily: "'Space Grotesk', monospace", fontSize: '22px', fontWeight: 900, color: theme.paperLight }}>
                {bpm}
              </span>
              <span style={{ fontFamily: "'Space Grotesk', monospace", fontSize: '12px', fontWeight: 800, color: theme.primaryHighlight }}>
                BPM
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
