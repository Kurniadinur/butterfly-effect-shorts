import React, { useMemo } from 'react';
import { Img, useCurrentFrame, useVideoConfig, staticFile, interpolate } from 'remotion';
import { ButterflyNode, OrganTarget, WordTimestamp } from '../data/types';
import { detectOrganFromText } from './MedicalScannerScene';

export interface ContinuousBodyJourneyProps {
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
    label: 'SISTEM ANATOMI TUBUH',
    stageX: 50,
    stageY: 74,
    zoomScale: 1.05,
    color: '#38bdf8',
    organMediaUrl: 'butterfly/media/medical_body_xray.jpg',
    calloutSide: 'right',
  },
  brain: {
    id: 'brain',
    label: 'OTAK & SARAF PUSAT',
    stageX: 50,
    stageY: 22,
    zoomScale: 1.48,
    color: '#38bdf8',
    organMediaUrl: 'butterfly/media/medical_brain_xray.jpg',
    calloutSide: 'right',
  },
  nerves: {
    id: 'nerves',
    label: 'JARINGAN SARAF & NEURON',
    stageX: 50,
    stageY: 36,
    zoomScale: 1.38,
    color: '#818cf8',
    organMediaUrl: 'butterfly/media/medical_brain_xray.jpg',
    calloutSide: 'left',
  },
  lungs: {
    id: 'lungs',
    label: 'PARU-PARU & RESPIRASI',
    stageX: 50,
    stageY: 63,
    zoomScale: 1.36,
    color: '#2dd4bf',
    organMediaUrl: 'butterfly/media/medical_heart_xray.jpg',
    calloutSide: 'left',
  },
  heart: {
    id: 'heart',
    label: 'JANTUNG & PEMBULUH DARAH',
    stageX: 54,
    stageY: 69,
    zoomScale: 1.46,
    color: '#f43f5e',
    organMediaUrl: 'butterfly/media/medical_heart_xray.jpg',
    calloutSide: 'right',
  },
  blood: {
    id: 'blood',
    label: 'SIRKULASI ALIRAN DARAH',
    stageX: 52,
    stageY: 74,
    zoomScale: 1.38,
    color: '#ef4444',
    organMediaUrl: 'butterfly/media/medical_heart_xray.jpg',
    calloutSide: 'left',
  },
  liver: {
    id: 'liver',
    label: 'HATI (LIVER) & DETOKS',
    stageX: 42,
    stageY: 86,
    zoomScale: 1.44,
    color: '#f59e0b',
    organMediaUrl: 'butterfly/media/medical_stomach_xray.jpg',
    calloutSide: 'left',
  },
  stomach: {
    id: 'stomach',
    label: 'LAMBUNG & ASAM PENCERNAAN',
    stageX: 57,
    stageY: 90,
    zoomScale: 1.46,
    color: '#fb923c',
    organMediaUrl: 'butterfly/media/medical_stomach_xray.jpg',
    calloutSide: 'right',
  },
  kidney: {
    id: 'kidney',
    label: 'GINJAL & KELENJAR ADRENAL',
    stageX: 50,
    stageY: 104,
    zoomScale: 1.44,
    color: '#a855f7',
    organMediaUrl: 'butterfly/media/medical_stomach_xray.jpg',
    calloutSide: 'right',
  },
  intestine: {
    id: 'intestine',
    label: 'USUS & METABOLISME SEL',
    stageX: 50,
    stageY: 118,
    zoomScale: 1.38,
    color: '#eab308',
    organMediaUrl: 'butterfly/media/medical_stomach_xray.jpg',
    calloutSide: 'left',
  },
  muscles: {
    id: 'muscles',
    label: 'JARINGAN OTOT & ENERGI',
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
  nodes,
  hookDurationFrames,
  outroDurationFrames,
  totalDurationFrames,
  baseBodyMediaUrl = 'butterfly/media/medical_body_xray.jpg',
}) => {
  const relFrame = useCurrentFrame();
  const frame = relFrame + hookDurationFrames; // Absolute timeline frame
  const { fps } = useVideoConfig();

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
          headline: 'PEMINDAIAN ANATOMI TUBUH',
          timeTag: 'SIMULASI AKTIF',
          primaryText: 'REAKSI BIOLOGIS REAL-TIME',
          secondaryText: 'Pemindaian organ dalam',
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
        headline: n.headline || anchor.label,
        timeTag: n.timeOrYear || `TAHAP ${idx + 1}`,
        primaryText: n.primaryText || 'REAKSI BIOLOGIS AKTIF',
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

  // Highlight intensity for each 3D organ based on active focus
  const getOrganGlow = (organId: OrganTarget, ox: number, oy: number) => {
    const dist = Math.hypot(camStageX - ox, camStageY - oy);
    const prox = Math.max(0, 1 - dist / 28);
    return activeWp.anchor.id === organId ? 1 : Math.max(0.32, prox * 0.75);
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
  const cardLeft = calloutOnRight ? Math.min(540, clampedTargetX + 55) : Math.max(48, clampedTargetX - 490);
  const cardTop = Math.max(280, Math.min(930, clampedTargetY - 95));

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: 'radial-gradient(circle at 50% 40%, #152a4a 0%, #0a1526 62%, #050b14 100%)',
        overflow: 'hidden',
        perspective: '1350px',
      }}
    >
      {/* Subtle 3D Medical Grid Floor & Backdrop */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            linear-gradient(to right, rgba(125, 211, 252, 0.06) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(125, 211, 252, 0.06) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
          pointerEvents: 'none',
        }}
      />

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
        {/* PLANE -80px (DEEP BACKGROUND): 3D X-Ray Skeletal & Body Depth Layer */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            transform: 'translateZ(-80px) scale(1.06)',
          }}
        >
          <Img
            src={staticFile(baseBodyMediaUrl)}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center 30%',
              opacity: 0.28,
              mixBlendMode: 'screen',
              filter: 'grayscale(75%) contrast(1.2) brightness(0.88)',
            }}
          />
        </div>

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

          {/* 3D Translucent Glass Torso Shell with Rim Lighting */}
          <path
            d="M50 6 C58 6 63 12 63 21 C63 28 59 33 56 36 L60 42 C72 44 80 50 82 62 L85 104 C85 108 80 109 78 105 L73 66 L68 66 L70 118 L67 178 C67 183 59 183 58 178 L54 128 L46 128 L42 178 C41 183 33 183 33 178 L30 118 L32 66 L27 66 L22 105 C20 109 15 108 15 104 L18 62 C20 50 28 44 40 42 L44 36 C41 33 37 28 37 21 C37 12 42 6 50 6 Z"
            fill="url(#glassBodyRim)"
            stroke="rgba(125, 211, 252, 0.45)"
            strokeWidth="0.55"
          />

          {/* 3D Ribcage & Spine Depth Structure */}
          <g stroke="rgba(186, 230, 253, 0.18)" strokeWidth="0.55" fill="none">
            <line x1="50" y1="28" x2="50" y2="124" stroke="rgba(165, 180, 252, 0.4)" strokeWidth="1.2" strokeDasharray="1.6 1.2" />
            <path d="M48 52 Q38 53 35 60 M52 52 Q62 53 65 60" />
            <path d="M48 57 Q37 58 34 66 M52 57 Q63 58 66 66" />
            <path d="M48 62 Q37 63 34 72 M52 62 Q63 63 66 72" />
            <path d="M48 67 Q38 68 36 77 M52 67 Q62 68 64 77" />
          </g>

          {/* 3D Arterial & Venous Bloodstream Highway */}
          <g fill="none" strokeLinecap="round">
            {/* Outer Vessel Tube */}
            <path
              d="M52 68 Q53 45 50 24 M48 68 Q47 45 50 24 M52 66 Q65 55 77 95 M48 66 Q35 55 23 95 M53 72 L50 104 L43 160 M53 72 L50 104 L57 160 M51 86 L42 88 M52 88 L57 92"
              stroke="rgba(244, 63, 94, 0.35)"
              strokeWidth="1.1"
            />
            {/* Flowing Blood Cells Pulse Inside Vessels */}
            <path
              d="M52 68 Q53 45 50 24 M48 68 Q47 45 50 24 M52 66 Q65 55 77 95 M48 66 Q35 55 23 95 M53 72 L50 104 L43 160 M53 72 L50 104 L57 160 M51 86 L42 88 M52 88 L57 92"
              stroke="#fda4af"
              strokeWidth="0.55"
              strokeDasharray="1.8 2.8"
              strokeDashoffset={-(frame * (0.5 + (smoothChaos / 100) * 0.7))}
            />
          </g>

          {/* 1. 3D VOLUMETRIC BRAIN (Stage Y: 22) */}
          <g
            transform={`translate(50, 21) scale(${1 + Math.sin(frame * 0.08) * 0.025})`}
            opacity={getOrganGlow('brain', 50, 22)}
          >
            {/* Left & Right 3D Cerebral Lobes */}
            <path
              d="M-0.4 -7.8 C-6.8 -7.8 -10.2 -3.8 -10.2 1.2 C-10.2 5.8 -6.5 8.2 -0.8 8.2 Z"
              fill="url(#vol3DBrain)"
              stroke="#bae6fd"
              strokeWidth="0.4"
            />
            <path
              d="M0.4 -7.8 C6.8 -7.8 10.2 -3.8 10.2 1.2 C10.2 5.8 6.5 8.2 0.8 8.2 Z"
              fill="url(#vol3DBrain)"
              stroke="#bae6fd"
              strokeWidth="0.4"
            />
            {/* 3D Cortical Sulci Highlights */}
            <path
              d="M-7.5 -2.5 Q-4.5 -4.5 -1.8 -1.2 M-8.2 2 Q-5 0 -1.8 3.2 M7.5 -2.5 Q4.5 -4.5 1.8 -1.2 M8.2 2 Q5 0 1.8 3.2"
              stroke="rgba(224, 242, 254, 0.75)"
              strokeWidth="0.45"
              fill="none"
              strokeLinecap="round"
            />
            {/* Active Neural Synapse Sparks */}
            <circle cx={Math.sin(frame * 0.16) * 5.2} cy={Math.cos(frame * 0.22) * 3.5} r="1.1" fill="#ffffff" />
            <circle cx={Math.cos(frame * 0.14) * -4.6} cy={Math.sin(frame * 0.19) * 3} r="0.95" fill="#fde047" />
          </g>

          {/* 2. 3D VOLUMETRIC LUNGS (Stage Y: 63 — Expands with Breathing) */}
          <g
            transform={`translate(50, 63) scale(${1 + breathCycle * 0.05}, ${1 + breathCycle * 0.04})`}
            opacity={getOrganGlow('lungs', 50, 63)}
          >
            {/* Trachea & Bronchial Stem */}
            <path d="M0 -16 L0 -6 M0 -6 L-6 1 M0 -6 L6 1" stroke="#ccfbf1" strokeWidth="1.2" fill="none" strokeLinecap="round" />
            {/* Right & Left 3D Shaded Lung Lobes */}
            <path
              d="M-2.8 -11.5 C-10.8 -10.5 -15.8 -2 -15.8 9.5 C-15.8 13.8 -8.2 14.5 -2.8 10.2 Z"
              fill="url(#vol3DLung)"
              stroke="#99f6e4"
              strokeWidth="0.4"
            />
            <path
              d="M2.8 -11.5 C10.8 -10.5 15.8 -2 15.8 9.5 C15.8 13.8 8.2 14.5 2.8 10.2 Z"
              fill="url(#vol3DLung)"
              stroke="#99f6e4"
              strokeWidth="0.4"
            />
            {/* Specular 3D Highlight on Lungs */}
            <ellipse cx="-8.5" cy="-2" rx="2.2" ry="4.5" fill="rgba(255,255,255,0.22)" transform="rotate(-12 -8.5 -2)" />
            <ellipse cx="7.5" cy="-2" rx="2.2" ry="4.5" fill="rgba(255,255,255,0.18)" transform="rotate(12 7.5 -2)" />
          </g>

          {/* 3. 3D VOLUMETRIC BEATING HEART (Stage X: 54, Y: 69) */}
          <g
            transform={`translate(54, 69) scale(${1 + heartPulse * 0.18})`}
            opacity={Math.max(0.85, getOrganGlow('heart', 54, 69))}
          >
            {/* Aortic Arch */}
            <path d="M-1 -4.5 C-1 -7.5 2.5 -7.5 2.5 -4.2" stroke="#f43f5e" strokeWidth="1.6" fill="none" strokeLinecap="round" />
            {/* 3D Shaded Ventricles */}
            <path
              d="M0 -4.2 C-3 -6.8 -6.8 -4.2 -6.8 -0.5 C-6.8 3.8 -1.8 6.5 0 8.4 C1.8 6.5 6.8 3.8 6.8 -0.5 C6.8 -4.2 3 -6.8 0 -4.2 Z"
              fill="url(#vol3DHeart)"
              stroke="#fecdd3"
              strokeWidth="0.45"
            />
            {/* 3D Specular Gloss on Heart */}
            <ellipse cx="-2.2" cy="-1.5" rx="1.6" ry="2.4" fill="rgba(255,255,255,0.38)" transform="rotate(-20 -2.2 -1.5)" />
          </g>

          {/* 4. 3D VOLUMETRIC LIVER (Stage X: 42, Y: 86) */}
          <g
            transform="translate(43, 86)"
            opacity={getOrganGlow('liver', 42, 86)}
          >
            <path
              d="M-8 -3.5 C0 -6 6.8 -3.5 8.8 2.2 C3.5 6.8 -5.8 6.8 -8 2.2 Z"
              fill="url(#vol3DLiver)"
              stroke="#fde68a"
              strokeWidth="0.4"
            />
            <ellipse cx="-2.5" cy="-1.2" rx="3" ry="1.3" fill="rgba(255,255,255,0.25)" transform="rotate(-10 -2.5 -1.2)" />
          </g>

          {/* 5. 3D VOLUMETRIC STOMACH (Stage X: 57, Y: 90) */}
          <g
            transform={`translate(56, 90) scale(${1 + Math.sin(frame * 0.08) * 0.035})`}
            opacity={getOrganGlow('stomach', 57, 90)}
          >
            <path
              d="M-3.2 -5.5 C3.5 -6.5 7.8 -2.2 6.8 3.5 C5.8 7.8 -2.2 7.8 -5.8 4.4 C-6.8 1.2 -2.2 -1 -3.2 -5.5 Z"
              fill="url(#vol3DStomach)"
              stroke="#fed7aa"
              strokeWidth="0.4"
            />
            <ellipse cx="1.8" cy="-1.5" rx="1.6" ry="2.8" fill="rgba(255,255,255,0.28)" transform="rotate(15 1.8 -1.5)" />
          </g>

          {/* 6. 3D VOLUMETRIC KIDNEYS & ADRENAL GLANDS (Stage X: 50, Y: 104) */}
          <g
            transform="translate(50, 104)"
            opacity={getOrganGlow('kidney', 50, 104)}
          >
            <ellipse cx="-6.5" cy="0" rx="3.5" ry="5.2" fill="url(#vol3DKidney)" stroke="#e9d5ff" strokeWidth="0.4" />
            <ellipse cx="6.5" cy="0" rx="3.5" ry="5.2" fill="url(#vol3DKidney)" stroke="#e9d5ff" strokeWidth="0.4" />
            <ellipse cx="-7.3" cy="-1.5" rx="1" ry="2" fill="rgba(255,255,255,0.3)" />
            <ellipse cx="5.7" cy="-1.5" rx="1" ry="2" fill="rgba(255,255,255,0.3)" />
            {/* Adrenal Caps */}
            <polygon points="-8.5,-4.6 -4.5,-4.6 -6.5,-7.4" fill="#fbbf24" stroke="#fef08a" strokeWidth="0.3" />
            <polygon points="4.5,-4.6 8.5,-4.6 6.5,-7.4" fill="#fbbf24" stroke="#fef08a" strokeWidth="0.3" />
          </g>

          {/* 7. 3D VOLUMETRIC INTESTINES (Stage X: 50, Y: 118) */}
          <g
            transform="translate(50, 117)"
            opacity={getOrganGlow('intestine', 50, 118)}
          >
            <rect
              x="-9.5"
              y="-6.5"
              width="19"
              height="13"
              rx="4"
              fill="url(#vol3DIntestine)"
              stroke="#fef08a"
              strokeWidth="0.4"
            />
            <path
              d="M-6 -3 Q0 -5 6 -3 Q-5 0 6 3 Q0 5 -6 3"
              stroke="rgba(255,255,255,0.55)"
              strokeWidth="0.6"
              fill="none"
              strokeLinecap="round"
            />
          </g>

          {/* Subtle Glowing Ring Around Active Organ */}
          <g transform={`translate(${camStageX}, ${camStageY})`}>
            <circle
              r={7 + systolicBeat * 2}
              fill="none"
              stroke={accentColor}
              strokeWidth="0.55"
              opacity="0.85"
            />
            <circle r="1.4" fill="#ffffff" />
          </g>
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
          3. IN-SITU 3D ORGAN CALLOUT CARD + POINTER LINE (Crystal-Clear Visual Explanation!)
          Directly connects the active organ on the body to a 3D X-Ray Magnifier + plain-Indonesian explanation
          ===================================================================== */}
      <svg
        width="1080"
        height="1920"
        style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 24 }}
      >
        <line
          x1={clampedTargetX}
          y1={clampedTargetY}
          x2={calloutOnRight ? cardLeft + 20 : cardLeft + 420}
          y2={cardTop + 85}
          stroke={accentColor}
          strokeWidth="2.5"
          strokeDasharray="6 4"
        />
        <circle cx={clampedTargetX} cy={clampedTargetY} r="7" fill={accentColor} />
        <circle cx={clampedTargetX} cy={clampedTargetY} r="14" fill="none" stroke="#ffffff" strokeWidth="2" opacity="0.8" />
      </svg>

      <div
        style={{
          position: 'absolute',
          left: `${cardLeft}px`,
          top: `${cardTop}px`,
          width: '440px',
          zIndex: 25,
          backgroundColor: 'rgba(8, 18, 36, 0.92)',
          borderRadius: '18px',
          border: `2px solid ${accentColor}`,
          boxShadow: `0 20px 50px rgba(0, 0, 0, 0.8), 0 0 28px ${accentColor}44`,
          backdropFilter: 'blur(16px)',
          padding: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          transform: `translateY(${Math.sin(frame * 0.05) * 4}px)`,
        }}
      >
        {/* 3D Organ Close-Up X-Ray Sphere Magnifier */}
        <div
          style={{
            position: 'relative',
            width: '112px',
            height: '112px',
            borderRadius: '50%',
            overflow: 'hidden',
            border: `2.5px solid ${accentColor}`,
            boxShadow: `inset 0 0 20px ${accentColor}, 0 0 18px ${accentColor}66`,
            flexShrink: 0,
            backgroundColor: '#040b16',
          }}
        >
          <Img
            src={staticFile(activeWp.anchor.organMediaUrl)}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transform: `scale(${1.18 + systolicBeat * 0.08})`,
              filter: 'contrast(1.25) saturate(1.3)',
            }}
          />
          {/* 3D Glass Sphere Highlight Overlay */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background:
                'radial-gradient(circle at 30% 25%, rgba(255,255,255,0.35) 0%, transparent 45%, rgba(0,0,0,0.55) 100%)',
            }}
          />
        </div>

        {/* Clear, Instant-Understanding Explanation Text */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', minWidth: 0 }}>
          <div
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: '12px',
              fontWeight: 800,
              color: accentColor,
              letterSpacing: '1.2px',
              textTransform: 'uppercase',
            }}
          >
            📍 {activeWp.anchor.label}
          </div>

          <div
            style={{
              fontFamily: "'Montserrat', sans-serif",
              fontSize: '21px',
              fontWeight: 900,
              color: '#ffffff',
              lineHeight: 1.18,
            }}
          >
            {activeWp.headline}
          </div>

          <div
            style={{
              marginTop: '2px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: 'rgba(15, 23, 42, 0.95)',
              padding: '4px 10px',
              borderRadius: '6px',
              border: `1px solid ${accentColor}66`,
              width: 'fit-content',
            }}
          >
            <span style={{ fontSize: '12px', fontWeight: 800, color: '#fde047' }}>⚡ EFEK:</span>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#f8fafc' }}>
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
            'linear-gradient(to top, rgba(4, 12, 24, 0.96) 0%, rgba(6, 18, 36, 0.78) 46%, transparent 100%)',
          pointerEvents: 'none',
          zIndex: 18,
        }}
      />

      {/* =====================================================================
          5. CLEAN TOP-CENTER COMPACT STATUS BAR (Chronological Time + Live EKG + BPM)
          Replaces the old cluttered multi-box HUD & duplicate mini-map!
          ===================================================================== */}
      <div
        style={{
          position: 'absolute',
          top: '64px',
          left: '48px',
          right: '48px',
          zIndex: 30,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: 'rgba(7, 18, 36, 0.88)',
          padding: '12px 22px',
          borderRadius: '16px',
          border: '1.5px solid rgba(125, 211, 252, 0.28)',
          boxShadow: '0 12px 32px rgba(0, 0, 0, 0.55)',
          backdropFilter: 'blur(14px)',
        }}
      >
        {/* Left: Chronological Time & Phase */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span
            style={{
              width: '11px',
              height: '11px',
              borderRadius: '50%',
              backgroundColor: accentColor,
              boxShadow: `0 0 12px ${accentColor}`,
              transform: `scale(${1 + systolicBeat * 0.45})`,
            }}
          />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: '11px',
                fontWeight: 700,
                color: '#94a3b8',
                letterSpacing: '1.2px',
              }}
            >
              WAKTU & ORGAN TARGET
            </span>
            <span
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: '18px',
                fontWeight: 800,
                color: '#ffffff',
                letterSpacing: '0.8px',
                textTransform: 'uppercase',
              }}
            >
              {activeWp.timeTag}
            </span>
          </div>
        </div>

        {/* Center: Live EKG Waveform */}
        <svg width="160" height="34" viewBox="0 0 220 40" style={{ overflow: 'visible' }}>
          <path
            d={ekgPath}
            fill="none"
            stroke={accentColor}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ filter: `drop-shadow(0 0 6px ${accentColor})` }}
          />
        </svg>

        {/* Right: BPM & Cell Stress */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '10px', fontWeight: 700, color: '#94a3b8' }}>
              DETAK JANTUNG
            </span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
              <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '22px', fontWeight: 800, color: '#ffffff' }}>
                {bpm}
              </span>
              <span style={{ fontSize: '11px', fontWeight: 700, color: accentColor }}>BPM</span>
            </div>
          </div>

          <div
            style={{
              borderLeft: '1px solid rgba(148, 163, 184, 0.25)',
              paddingLeft: '16px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-end',
            }}
          >
            <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '10px', fontWeight: 700, color: '#94a3b8' }}>
              STRES SEL
            </span>
            <span
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: '20px',
                fontWeight: 800,
                color: smoothChaos >= 70 ? '#fb7185' : smoothChaos >= 45 ? '#fde047' : '#38bdf8',
              }}
            >
              {Math.round(smoothChaos)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
