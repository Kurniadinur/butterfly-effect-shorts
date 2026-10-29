import React, { useMemo } from 'react';
import { Img, useCurrentFrame, useVideoConfig, staticFile, interpolate, spring } from 'remotion';
import { ButterflyNode, OrganTarget } from '../data/types';
import { detectOrganFromText } from './MedicalScannerScene';

export interface ContinuousBodyJourneyProps {
  nodes: ButterflyNode[];
  hookDurationFrames: number;
  outroDurationFrames: number;
  totalDurationFrames: number;
  baseBodyMediaUrl?: string;
}

interface OrganCameraAnchor {
  id: OrganTarget;
  label: string;
  // Coordinates within the 100x200 Full-Body Anatomical Stage
  stageX: number;
  stageY: number;
  // Camera zoom scale when focusing on this organ (1.0 = full body, 2.3 = deep organ close-up)
  zoomScale: number;
  color: string;
}

export const ORGAN_CAMERA_ANCHORS: Record<string, OrganCameraAnchor> = {
  'full-body': { id: 'full-body', label: 'PEMINDAIAN ANATOMI UTUH', stageX: 50, stageY: 78, zoomScale: 1.05, color: '#38bdf8' },
  brain: { id: 'brain', label: 'OTAK & SARAF PUSAT', stageX: 50, stageY: 22, zoomScale: 1.55, color: '#38bdf8' },
  nerves: { id: 'nerves', label: 'JARINGAN SARAF & NEURON', stageX: 50, stageY: 36, zoomScale: 1.42, color: '#818cf8' },
  lungs: { id: 'lungs', label: 'PARU-PARU & RESPIRASI', stageX: 50, stageY: 64, zoomScale: 1.38, color: '#2dd4bf' },
  heart: { id: 'heart', label: 'JANTUNG & KARDIOVASKULAR', stageX: 54, stageY: 70, zoomScale: 1.52, color: '#f43f5e' },
  blood: { id: 'blood', label: 'SIRKULASI PEMBULUH DARAH', stageX: 52, stageY: 76, zoomScale: 1.40, color: '#ef4444' },
  liver: { id: 'liver', label: 'HATI (LIVER) & DETOKSIFIKASI', stageX: 42, stageY: 87, zoomScale: 1.48, color: '#f59e0b' },
  stomach: { id: 'stomach', label: 'LAMBUNG & ASAM PENCERNAAN', stageX: 57, stageY: 91, zoomScale: 1.50, color: '#fb923c' },
  kidney: { id: 'kidney', label: 'GINJAL & FILTRASI CAIRAN', stageX: 50, stageY: 104, zoomScale: 1.48, color: '#a855f7' },
  intestine: { id: 'intestine', label: 'USUS & METABOLISME SEL', stageX: 50, stageY: 118, zoomScale: 1.42, color: '#eab308' },
  muscles: { id: 'muscles', label: 'JARINGAN OTOT & ENERGI', stageX: 35, stageY: 82, zoomScale: 1.35, color: '#fb7185' },
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

/**
 * CONTINUOUS 1-BODY JOURNEY ENGINE (Zero Hard Cuts!)
 * A single unbroken 3D X-Ray anatomical body rig where the virtual camera smoothly
 * pans, zooms in/out, and glides from organ to organ across the entire video duration.
 */
export const ContinuousBodyJourney: React.FC<ContinuousBodyJourneyProps> = ({
  nodes,
  hookDurationFrames,
  outroDurationFrames,
  totalDurationFrames,
  baseBodyMediaUrl = 'butterfly/media/medical_body_xray.jpg',
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Resolve each node's target organ anchor
  const resolvedWaypoints = useMemo(() => {
    if (!nodes || nodes.length === 0) {
      return [
        {
          startFrame: hookDurationFrames,
          endFrame: totalDurationFrames - outroDurationFrames,
          anchor: ORGAN_CAMERA_ANCHORS['full-body'],
          chaosLevel: 35,
          headline: 'PEMINDAIAN SISTEM TUBUH MANUSIA',
          timeTag: 'FASE AKTIF',
          primaryText: 'PEMINDAIAN REAL-TIME',
          step: 1,
        },
      ];
    }

    return nodes.map((n, idx) => {
      const detected = detectOrganFromText(
        n.organTarget,
        n.headline,
        n.timeOrYear,
        n.primaryText,
        n.step || idx + 1
      );
      const anchor = ORGAN_CAMERA_ANCHORS[detected.id] || ORGAN_CAMERA_ANCHORS['full-body'];
      return {
        startFrame: n.startFrame,
        endFrame: n.startFrame + n.durationFrames,
        anchor,
        chaosLevel: n.chaosLevel ?? 35,
        headline: n.headline || '',
        timeTag: n.timeOrYear || `FASE ${idx + 1}`,
        primaryText: n.primaryText || null,
        step: n.step || idx + 1,
      };
    });
  }, [nodes, hookDurationFrames, outroDurationFrames, totalDurationFrames]);

  // Determine current and previous waypoint for continuous spring camera interpolation
  const currentIdx = useMemo(() => {
    const found = resolvedWaypoints.findIndex(
      (wp) => frame >= wp.startFrame && frame < wp.endFrame
    );
    if (found !== -1) return found;
    if (frame < resolvedWaypoints[0].startFrame) return 0;
    return resolvedWaypoints.length - 1;
  }, [frame, resolvedWaypoints]);

  const activeWp = resolvedWaypoints[currentIdx];
  const prevWp = currentIdx > 0 ? resolvedWaypoints[currentIdx - 1] : {
    ...activeWp,
    anchor: ORGAN_CAMERA_ANCHORS['full-body'],
    chaosLevel: 20,
  };

  // Smooth spring progress (0 -> 1) whenever narrative shifts attention to a new organ
  const framesIntoWaypoint = Math.max(0, frame - activeWp.startFrame);
  const cameraGlide = spring({
    frame: framesIntoWaypoint,
    fps,
    config: { damping: 22, stiffness: 36, mass: 1.35 }, // Ultra-smooth, cinematic documentary camera glide
  });

  // Interpolated continuous camera target on the 100x200 anatomical canvas
  const camStageX = interpolate(cameraGlide, [0, 1], [prevWp.anchor.stageX, activeWp.anchor.stageX]);
  const camStageY = interpolate(cameraGlide, [0, 1], [prevWp.anchor.stageY, activeWp.anchor.stageY]);
  const camZoomBase = interpolate(cameraGlide, [0, 1], [prevWp.anchor.zoomScale, activeWp.anchor.zoomScale]);

  // Continuous chaosLevel & BPM interpolation (never jumps abruptly)
  const smoothChaos = interpolate(cameraGlide, [0, 1], [prevWp.chaosLevel, activeWp.chaosLevel]);
  const bpm = Math.round(68 + (Math.min(100, Math.max(5, smoothChaos)) / 100) * 98);

  // Continuous physiological heartbeat phase
  const beatPhase = (frame / fps) * (bpm / 60) * Math.PI * 2;
  const systolicBeat = Math.pow(Math.max(0, Math.sin(beatPhase)), 8);
  const diastolicBeat = Math.pow(Math.max(0, Math.sin(beatPhase - 0.65)), 12) * 0.45;
  const heartPulse = systolicBeat + diastolicBeat;

  // Continuous respiratory breathing expansion (14–26 breaths per minute)
  const breathRate = 14 + (smoothChaos / 100) * 14;
  const breathCycle = (Math.sin((frame / fps) * (breathRate / 60) * Math.PI * 2) + 1) * 0.5;

  // Subtle organic handheld/floating drift so the camera feels alive at every millisecond
  const floatX = Math.sin(frame * 0.028) * 14;
  const floatY = Math.cos(frame * 0.022) * 10;
  const subtleZoomBreath = Math.sin(frame * 0.018) * 0.04 + heartPulse * 0.015;

  const finalScale = camZoomBase + subtleZoomBreath;

  // Convert (camStageX, camStageY) in [0..100, 0..185] to pixel translation on 1080x1920 stage
  // Stage center is (50, 74). Moving camera to (stageX, stageY) shifts the rig inversely:
  const offsetX = (50 - camStageX) * 6.5 + floatX;
  const offsetY = (74 - camStageY) * 6.2 + floatY;

  // Smooth color interpolation across severity & organ palette
  const targetAccent =
    smoothChaos >= 72 ? '#f43f5e' : smoothChaos >= 45 ? '#f59e0b' : activeWp.anchor.color;
  const prevAccent =
    prevWp.chaosLevel >= 72 ? '#f43f5e' : prevWp.chaosLevel >= 45 ? '#f59e0b' : prevWp.anchor.color;
  const accentColor = interpolateHexColor(prevAccent, targetAccent, cameraGlide);

  // Continuous 20 biological bloodstream & neural particles
  const particles = useMemo(() => {
    return Array.from({ length: 20 }).map((_, idx) => {
      const s1 = ((idx * 67 + 19) % 100) / 100;
      const s2 = ((idx * 43 + 37) % 100) / 100;
      const depth = idx % 3;
      return {
        id: idx,
        baseX: 120 + s1 * 840,
        baseY: 160 + s2 * 1100,
        size: depth === 2 ? 20 + (idx % 10) : depth === 1 ? 10 + (idx % 6) : 5 + (idx % 4),
        speedY: -1.1 - s2 * 1.9,
        waveAmp: 16 + (idx % 5) * 8,
        waveFreq: 0.025 + (idx % 4) * 0.01,
        blur: depth === 2 ? 4 : depth === 1 ? 1 : 0,
        opacity: depth === 2 ? 0.28 : depth === 1 ? 0.52 : 0.30,
      };
    });
  }, []);

  // Continuous live scrolling EKG waveform
  const ekgPath = useMemo(() => {
    const width = 340;
    const points: string[] = [];
    const speed = 3.2 + (smoothChaos / 100) * 3.6;
    const scroll = frame * speed;
    const cycleWidth = Math.max(48, Math.round(115 - (smoothChaos / 100) * 50));

    for (let x = 0; x <= width; x += 3) {
      const pos = (x + scroll) % cycleWidth;
      const norm = pos / cycleWidth;
      let y = 26;
      if (norm > 0.18 && norm < 0.28) {
        y -= Math.sin(((norm - 0.18) / 0.1) * Math.PI) * 5;
      } else if (norm >= 0.34 && norm < 0.38) {
        y += 5;
      } else if (norm >= 0.38 && norm < 0.45) {
        const spike = 1 - Math.abs((norm - 0.415) / 0.035);
        y -= spike * (19 + (smoothChaos / 100) * 6);
      } else if (norm >= 0.45 && norm < 0.50) {
        y += 8;
      } else if (norm >= 0.58 && norm < 0.72) {
        y -= Math.sin(((norm - 0.58) / 0.14) * Math.PI) * 7;
      }
      points.push(`${x === 0 ? 'M' : 'L'} ${x} ${y.toFixed(1)}`);
    }
    return points.join(' ');
  }, [frame, smoothChaos]);

  // Continuous vertical X-ray scan beam
  const scanlineY = interpolate(frame % 135, [0, 135], [100, 1360]);

  // Smooth text transition opacity when narration moves to a new milestone
  const textTransition = interpolate(framesIntoWaypoint, [0, 14], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const textSlideY = interpolate(framesIntoWaypoint, [0, 14], [12, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Organ highlight intensities (0..1) based on camera proximity to each organ
  const getOrganHighlight = (organId: OrganTarget, organX: number, organY: number) => {
    const dist = Math.hypot(camStageX - organX, camStageY - organY);
    const proximity = Math.max(0, 1 - dist / 24);
    return activeWp.anchor.id === organId ? Math.max(0.75, proximity) : proximity * 0.65;
  };

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        backgroundColor: '#02060d',
        overflow: 'hidden',
      }}
    >
      {/* =====================================================================
          1. UNBROKEN CONTINUOUS 3D ANATOMICAL BODY STAGE (Pan & Zoom Camera Rig)
          ===================================================================== */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          transform: `translate(${offsetX}px, ${offsetY}px) scale(${finalScale})`,
          transformOrigin: '50% 42%',
          willChange: 'transform',
        }}
      >
        {/* Base 3D X-Ray Body Backdrop */}
        <Img
          src={staticFile(baseBodyMediaUrl)}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center 30%',
            opacity: 0.42,
            filter: 'contrast(1.22) brightness(0.85) saturate(1.2)',
          }}
        />

        {/* High-Precision Interactive Living Anatomical Rig SVG (1080x1920 aligned to 100x200 coords) */}
        <svg
          width="1080"
          height="1920"
          viewBox="0 0 100 185"
          style={{
            position: 'absolute',
            inset: 0,
            overflow: 'visible',
          }}
        >
          <defs>
            <radialGradient id="organGlowBrain" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.95" />
              <stop offset="65%" stopColor="#0284c7" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#0284c7" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="organGlowHeart" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fb7185" stopOpacity="1" />
              <stop offset="60%" stopColor="#e11d48" stopOpacity="0.55" />
              <stop offset="100%" stopColor="#e11d48" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="organGlowLungs" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#2dd4bf" stopOpacity="0.85" />
              <stop offset="70%" stopColor="#0d9488" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#0d9488" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="organGlowStomach" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fb923c" stopOpacity="0.9" />
              <stop offset="65%" stopColor="#ea580c" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#ea580c" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="organGlowLiver" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.9" />
              <stop offset="65%" stopColor="#d97706" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#d97706" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="organGlowKidney" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#c084fc" stopOpacity="0.92" />
              <stop offset="65%" stopColor="#7e22ce" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#7e22ce" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Translucent 3D X-Ray Human Body Contour & Skeletal Ribcage */}
          <path
            d="M50 6 C58 6 63 12 63 21 C63 28 59 33 56 36 L60 42 C72 44 80 50 82 62 L85 104 C85 108 80 109 78 105 L73 66 L68 66 L70 118 L67 178 C67 183 59 183 58 178 L54 128 L46 128 L42 178 C41 183 33 183 33 178 L30 118 L32 66 L27 66 L22 105 C20 109 15 108 15 104 L18 62 C20 50 28 44 40 42 L44 36 C41 33 37 28 37 21 C37 12 42 6 50 6 Z"
            fill="rgba(14, 165, 233, 0.05)"
            stroke="rgba(56, 189, 248, 0.35)"
            strokeWidth="0.45"
          />

          {/* Central Spinal Cord & Animated Neural Impulse Highway */}
          <line
            x1="50"
            y1="28"
            x2="50"
            y2="124"
            stroke="rgba(129, 140, 248, 0.4)"
            strokeWidth="0.8"
            strokeDasharray="1.5 1.5"
          />

          {/* Arterial & Venous Vascular Network (Flowing Animated Dashes) */}
          <g
            stroke={smoothChaos >= 70 ? '#f43f5e' : '#38bdf8'}
            strokeWidth="0.45"
            fill="none"
            opacity="0.55"
            strokeDasharray="2 3"
            strokeDashoffset={-(frame * (0.4 + (smoothChaos / 100) * 0.6))}
          >
            {/* Carotid to Brain */}
            <path d="M52 68 Q53 45 50 24" />
            <path d="M48 68 Q47 45 50 24" />
            {/* Brachial Arteries to Arms */}
            <path d="M52 66 Q65 55 77 95" />
            <path d="M48 66 Q35 55 23 95" />
            {/* Descending Aorta to Liver, Stomach, Kidneys & Legs */}
            <path d="M53 72 L50 104 L43 160" />
            <path d="M53 72 L50 104 L57 160" />
            <path d="M51 86 L42 88" />
            <path d="M52 88 L57 92" />
          </g>

          {/* 1. BRAIN & CENTRAL NERVOUS CORTEX (Stage Y: 22) */}
          <g
            transform={`translate(50, 21) scale(${1 + Math.sin(frame * 0.08) * 0.025})`}
            opacity={0.45 + getOrganHighlight('brain', 50, 22) * 0.55}
          >
            <circle r="13" fill="url(#organGlowBrain)" opacity={0.5 + getOrganHighlight('brain', 50, 22) * 0.5} />
            {/* Left & Right Cerebral Hemispheres */}
            <path
              d="M-0.5 -7 C-6 -7 -9.5 -3.5 -9.5 1 C-9.5 5 -6 7.5 -1 7.5 Z"
              fill="rgba(56, 189, 248, 0.35)"
              stroke="#7dd3fc"
              strokeWidth="0.45"
            />
            <path
              d="M0.5 -7 C6 -7 9.5 -3.5 9.5 1 C9.5 5 6 7.5 1 7.5 Z"
              fill="rgba(56, 189, 248, 0.35)"
              stroke="#7dd3fc"
              strokeWidth="0.45"
            />
            {/* Firing Neural Synapses inside Brain */}
            <circle
              cx={Math.sin(frame * 0.17) * 5}
              cy={Math.cos(frame * 0.23) * 3.5}
              r="1.1"
              fill="#ffffff"
            />
            <circle
              cx={Math.cos(frame * 0.14) * -4.5}
              cy={Math.sin(frame * 0.19) * 3}
              r="0.9"
              fill="#38bdf8"
            />
          </g>

          {/* 2. LUNGS & BRONCHIAL TREE (Stage Y: 64 — Expands & Contracts with Breathing) */}
          <g
            transform={`translate(50, 64) scale(${1 + breathCycle * 0.045}, ${1 + breathCycle * 0.035})`}
            opacity={0.45 + getOrganHighlight('lungs', 50, 64) * 0.55}
          >
            <circle r="18" fill="url(#organGlowLungs)" opacity={0.4 + getOrganHighlight('lungs', 50, 64) * 0.5} />
            {/* Right & Left Lung Lobes */}
            <path
              d="M-3 -11 C-10 -10 -15 -2 -15 9 C-15 13 -8 14 -3 10 Z"
              fill="rgba(45, 212, 191, 0.28)"
              stroke="#5eead4"
              strokeWidth="0.45"
            />
            <path
              d="M3 -11 C10 -10 15 -2 15 9 C15 13 8 14 3 10 Z"
              fill="rgba(45, 212, 191, 0.28)"
              stroke="#5eead4"
              strokeWidth="0.45"
            />
            {/* Bronchioles */}
            <path
              d="M0 -15 L0 -6 M0 -6 L-7 2 M0 -6 L7 2 M-4 -1 L-9 6 M4 -1 L9 6"
              stroke="#99f6e4"
              strokeWidth="0.4"
              fill="none"
              opacity="0.7"
            />
          </g>

          {/* 3. BEATING HEART (Stage X: 54, Y: 70 — Systolic & Diastolic Real-Time Thump) */}
          <g
            transform={`translate(54, 70) scale(${1 + heartPulse * 0.16})`}
            opacity={0.6 + getOrganHighlight('heart', 54, 70) * 0.4}
          >
            <circle r="11" fill="url(#organGlowHeart)" opacity={0.65 + systolicBeat * 0.35} />
            <path
              d="M0 -4.2 C-2.5 -6.5 -6 -4.2 -6 -0.8 C-6 3.2 -1.5 5.8 0 7.5 C1.5 5.8 6 3.2 6 -0.8 C6 -4.2 2.5 -6.5 0 -4.2 Z"
              fill="#f43f5e"
              stroke="#fda4af"
              strokeWidth="0.45"
            />
          </g>

          {/* 4. LIVER / HEPATIC SYSTEM (Stage X: 42, Y: 87) */}
          <g
            transform="translate(43, 86)"
            opacity={0.42 + getOrganHighlight('liver', 42, 87) * 0.58}
          >
            <circle r="12" fill="url(#organGlowLiver)" opacity={getOrganHighlight('liver', 42, 87) * 0.75} />
            <path
              d="M-7 -3 C0 -5 6 -3 8 2 C3 6 -5 6 -7 2 Z"
              fill="rgba(245, 158, 11, 0.35)"
              stroke="#fcd34d"
              strokeWidth="0.45"
            />
          </g>

          {/* 5. STOMACH & GASTRIC ACID (Stage X: 57, Y: 91) */}
          <g
            transform={`translate(56, 91) scale(${1 + Math.sin(frame * 0.06) * 0.03})`}
            opacity={0.42 + getOrganHighlight('stomach', 57, 91) * 0.58}
          >
            <circle r="12" fill="url(#organGlowStomach)" opacity={getOrganHighlight('stomach', 57, 91) * 0.75} />
            <path
              d="M-3 -5 C3 -6 7 -2 6 3 C5 7 -2 7 -5 4 C-6 1 -2 -1 -3 -5 Z"
              fill="rgba(251, 146, 60, 0.36)"
              stroke="#fdba74"
              strokeWidth="0.45"
            />
          </g>

          {/* 6. KIDNEYS & RENAL FILTRATION (Stage X: 50, Y: 104) */}
          <g
            transform="translate(50, 104)"
            opacity={0.42 + getOrganHighlight('kidney', 50, 104) * 0.58}
          >
            <circle r="13" fill="url(#organGlowKidney)" opacity={getOrganHighlight('kidney', 50, 104) * 0.75} />
            <ellipse cx="-6.5" cy="0" rx="3.2" ry="4.8" fill="rgba(168, 85, 247, 0.38)" stroke="#d8b4fe" strokeWidth="0.4" />
            <ellipse cx="6.5" cy="0" rx="3.2" ry="4.8" fill="rgba(168, 85, 247, 0.38)" stroke="#d8b4fe" strokeWidth="0.4" />
          </g>

          {/* 7. INTESTINES & METABOLIC TRACT (Stage X: 50, Y: 118) */}
          <g
            transform="translate(50, 117)"
            opacity={0.38 + getOrganHighlight('intestine', 50, 118) * 0.62}
          >
            <rect
              x="-9.5"
              y="-6.5"
              width="19"
              height="13"
              rx="3.5"
              fill="rgba(234, 179, 8, 0.24)"
              stroke="#fde047"
              strokeWidth="0.4"
            />
            <path
              d="M-6 -3 Q0 -5 6 -3 Q-5 0 6 3 Q0 5 -6 3"
              stroke="#fef08a"
              strokeWidth="0.45"
              fill="none"
            />
          </g>

          {/* CONTINUOUS GLIDING TARGET LOCK RETICLE ON THE 3D BODY */}
          <g transform={`translate(${camStageX}, ${camStageY})`}>
            <circle
              r={7.5 + systolicBeat * 2.5}
              fill="none"
              stroke={accentColor}
              strokeWidth="0.4"
              strokeDasharray="2 1.5"
              opacity="0.85"
            />
            <circle
              r="1.8"
              fill="#ffffff"
              opacity="0.9"
            />
          </g>
        </svg>
      </div>

      {/* =====================================================================
          2. HOLOGRAPHIC SCANNER GRID, HEARTBEAT VIGNETTE & LASER SWEEP
          ===================================================================== */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            linear-gradient(to right, rgba(56, 189, 248, 0.04) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(56, 189, 248, 0.04) 1px, transparent 1px)
          `,
          backgroundSize: '54px 54px',
          pointerEvents: 'none',
          opacity: 0.6,
        }}
      />

      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(circle at 50% 42%, transparent 30%, rgba(2, 6, 13, 0.88) 100%)`,
          pointerEvents: 'none',
        }}
      />

      {/* Horizontal Bioluminescent X-Ray Scan Laser */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: `${scanlineY}px`,
          height: '2.5px',
          background: `linear-gradient(90deg, transparent 0%, ${accentColor} 50%, transparent 100%)`,
          boxShadow: `0 0 16px ${accentColor}`,
          opacity: 0.35,
          pointerEvents: 'none',
        }}
      />

      {/* =====================================================================
          3. CONTINUOUS FLOWING BIOLOGICAL PARTICLES (Never resets!)
          ===================================================================== */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 12 }}>
        {particles.map((p) => {
          const curY = ((p.baseY + frame * p.speedY) % 1250 + 1250) % 1250 + 120;
          const curX = p.baseX + Math.sin(frame * p.waveFreq + p.id) * p.waveAmp;
          const pulseScale = 1 + systolicBeat * 0.2;
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
                background: `radial-gradient(circle at 35% 35%, #ffffff 0%, ${accentColor} 55%, transparent 100%)`,
                boxShadow: `0 0 ${p.size}px ${accentColor}`,
                opacity: p.opacity,
                filter: p.blur > 0 ? `blur(${p.blur}px)` : undefined,
                transform: `scale(${pulseScale})`,
              }}
            />
          );
        })}
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
          height: '720px',
          background:
            'linear-gradient(to top, rgba(2, 6, 13, 0.98) 0%, rgba(2, 6, 13, 0.82) 48%, rgba(2, 6, 13, 0.3) 82%, transparent 100%)',
          pointerEvents: 'none',
          zIndex: 18,
        }}
      />

      {/* =====================================================================
          5. PERSISTENT TOP-LEFT MEDICAL TELEMETRY & LIVE EKG MONITOR
          ===================================================================== */}
      <div
        style={{
          position: 'absolute',
          top: '68px',
          left: '44px',
          maxWidth: '680px',
          zIndex: 30,
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: 'rgba(6, 12, 24, 0.88)',
              padding: '7px 16px',
              borderRadius: '8px',
              borderLeft: `4px solid ${accentColor}`,
              borderTop: '1px solid rgba(255, 255, 255, 0.12)',
              borderRight: '1px solid rgba(255, 255, 255, 0.08)',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              backdropFilter: 'blur(12px)',
            }}
          >
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: accentColor,
                boxShadow: `0 0 10px ${accentColor}`,
                transform: `scale(${1 + systolicBeat * 0.45})`,
              }}
            />
            <span
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: '15px',
                fontWeight: 700,
                color: '#f8fafc',
                letterSpacing: '1.5px',
                textTransform: 'uppercase',
              }}
            >
              {activeWp.timeTag}
            </span>
          </div>

          <div
            style={{
              backgroundColor: 'rgba(6, 12, 24, 0.82)',
              padding: '6px 13px',
              borderRadius: '8px',
              border: `1px solid rgba(255, 255, 255, 0.15)`,
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: '13px',
              fontWeight: 700,
              color: accentColor,
              letterSpacing: '1px',
              textTransform: 'uppercase',
            }}
          >
            {activeWp.anchor.label}
          </div>
        </div>

        {/* Smoothly Morphing Organ Status Headline */}
        {activeWp.headline && (
          <div
            style={{
              fontSize: '28px',
              fontWeight: 900,
              color: '#ffffff',
              textShadow: '0 4px 16px rgba(0, 0, 0, 0.95)',
              fontFamily: "'Montserrat', sans-serif",
              lineHeight: 1.22,
              letterSpacing: '-0.4px',
              opacity: textTransition,
              transform: `translateY(${textSlideY}px)`,
            }}
          >
            {activeWp.headline}
          </div>
        )}

        {/* Persistent Live EKG Heartbeat Monitor */}
        <div
          style={{
            marginTop: '4px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '14px',
            backgroundColor: 'rgba(6, 12, 24, 0.84)',
            padding: '8px 16px',
            borderRadius: '10px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(12px)',
            width: 'fit-content',
          }}
        >
          <svg width="180" height="38" viewBox="0 0 340 48" style={{ overflow: 'visible' }}>
            <path
              d={ekgPath}
              fill="none"
              stroke={accentColor}
              strokeWidth="3.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ filter: `drop-shadow(0 0 6px ${accentColor})` }}
            />
          </svg>

          <div style={{ display: 'flex', flexDirection: 'column', minWidth: '78px' }}>
            <span
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: '10px',
                fontWeight: 700,
                color: '#94a3b8',
                letterSpacing: '1px',
              }}
            >
              DETAK JANTUNG
            </span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
              <span
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: '21px',
                  fontWeight: 800,
                  color: accentColor,
                }}
              >
                {bpm}
              </span>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#cbd5e1' }}>BPM</span>
            </div>
          </div>

          <div
            style={{
              borderLeft: '1px solid rgba(255, 255, 255, 0.12)',
              paddingLeft: '12px',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <span
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: '10px',
                fontWeight: 700,
                color: '#94a3b8',
                letterSpacing: '1px',
              }}
            >
              STRES SEL
            </span>
            <span
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: '18px',
                fontWeight: 800,
                color: smoothChaos >= 70 ? '#f43f5e' : smoothChaos >= 45 ? '#fbbf24' : '#38bdf8',
              }}
            >
              {Math.round(smoothChaos)}%
            </span>
          </div>
        </div>

        {/* Biological Evidence Fact Callout Pill */}
        {activeWp.primaryText && (
          <div
            style={{
              marginTop: '2px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: 'rgba(15, 23, 42, 0.85)',
              padding: '6px 14px',
              borderRadius: '6px',
              border: '1px solid rgba(255, 255, 255, 0.14)',
              width: 'fit-content',
              opacity: textTransition,
            }}
          >
            <span style={{ fontSize: '13px', fontWeight: 800, color: accentColor }}>⚡ REAKSI MEDIS:</span>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#f1f5f9' }}>{activeWp.primaryText}</span>
          </div>
        )}
      </div>

      {/* =====================================================================
          6. PERSISTENT TOP-RIGHT FULL-BODY MINI-MAP RADAR (Shows Camera Position)
          ===================================================================== */}
      <div
        style={{
          position: 'absolute',
          top: '68px',
          right: '40px',
          width: '175px',
          height: '330px',
          zIndex: 30,
          backgroundColor: 'rgba(4, 10, 22, 0.84)',
          borderRadius: '14px',
          border: '1.5px solid rgba(56, 189, 248, 0.35)',
          boxShadow: '0 12px 32px rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(12px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '10px 8px',
        }}
      >
        <div
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: '10px',
            fontWeight: 700,
            color: '#94a3b8',
            letterSpacing: '1.4px',
            textTransform: 'uppercase',
            marginBottom: '4px',
          }}
        >
          KAMERA ANATOMI
        </div>

        <svg width="135" height="255" viewBox="0 0 100 200" style={{ overflow: 'visible' }}>
          <path
            d="M50 6 C58 6 63 12 63 21 C63 28 59 33 56 36 L60 42 C72 44 80 50 82 62 L85 104 C85 108 80 109 78 105 L73 66 L68 66 L70 118 L67 186 C67 191 59 191 58 186 L54 128 L46 128 L42 186 C41 191 33 191 33 186 L30 118 L32 66 L27 66 L22 105 C20 109 15 108 15 104 L18 62 C20 50 28 44 40 42 L44 36 C41 33 37 28 37 21 C37 12 42 6 50 6 Z"
            fill="rgba(56, 189, 248, 0.08)"
            stroke="rgba(56, 189, 248, 0.42)"
            strokeWidth="1.4"
          />
          <ellipse cx="50" cy="20" rx="9" ry="7.5" fill="rgba(56, 189, 248, 0.35)" />
          <path
            d="M47 54 C40 54 36 62 36 74 C36 78 42 79 47 76 Z M53 54 C60 54 64 62 64 74 C64 78 58 79 53 76 Z"
            fill="rgba(45, 212, 191, 0.3)"
          />
          <circle cx="54" cy="70" r="5.2" fill="rgba(244, 63, 94, 0.55)" />
          <path d="M37 83 C43 81 49 83 51 88 C46 92 39 92 37 88 Z" fill="rgba(245, 158, 11, 0.35)" />
          <ellipse cx="56" cy="91" rx="6.5" ry="5" fill="rgba(251, 146, 60, 0.35)" />
          <circle cx="44" cy="104" r="3.5" fill="rgba(168, 85, 247, 0.38)" />
          <circle cx="56" cy="104" r="3.5" fill="rgba(168, 85, 247, 0.38)" />
          <rect x="40" y="111" width="20" height="13" rx="4" fill="rgba(234, 179, 8, 0.3)" />

          {/* Gliding Reticle on Mini-Map */}
          <g transform={`translate(${camStageX}, ${camStageY})`}>
            <circle
              r={12 + systolicBeat * 5}
              fill="none"
              stroke={accentColor}
              strokeWidth="1.5"
              opacity={0.75}
            />
            <circle r="5.5" fill={accentColor} />
            <line x1="-15" y1="0" x2="-7" y2="0" stroke="#ffffff" strokeWidth="1.4" />
            <line x1="7" y1="0" x2="15" y2="0" stroke="#ffffff" strokeWidth="1.4" />
            <line x1="0" y1="-15" x2="0" y2="-7" stroke="#ffffff" strokeWidth="1.4" />
            <line x1="0" y1="7" x2="0" y2="15" stroke="#ffffff" strokeWidth="1.4" />
          </g>
        </svg>

        <div
          style={{
            marginTop: 'auto',
            width: '100%',
            textAlign: 'center',
            backgroundColor: 'rgba(15, 23, 42, 0.9)',
            padding: '4px 6px',
            borderRadius: '6px',
            border: '1px solid rgba(255, 255, 255, 0.15)',
          }}
        >
          <div
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: '9px',
              fontWeight: 700,
              color: accentColor,
              letterSpacing: '0.8px',
              textTransform: 'uppercase',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            ZOOM {finalScale.toFixed(1)}X • {activeWp.anchor.id.toUpperCase()}
          </div>
        </div>
      </div>
    </div>
  );
};
