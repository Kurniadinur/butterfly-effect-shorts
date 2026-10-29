import React, { useMemo } from 'react';
import { Img, useCurrentFrame, useVideoConfig, staticFile, interpolate, spring } from 'remotion';
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
  bgToneTop: string;
  bgToneCenter: string;
}

export const ORGAN_CAMERA_ANCHORS: Record<string, OrganCameraAnchor> = {
  'full-body': {
    id: 'full-body',
    label: 'PEMINDAIAN ANATOMI UTUH',
    stageX: 50,
    stageY: 74,
    zoomScale: 1.05,
    color: '#38bdf8',
    bgToneTop: '#0b2545',
    bgToneCenter: '#134e6f',
  },
  brain: {
    id: 'brain',
    label: 'OTAK & SARAF PUSAT',
    stageX: 50,
    stageY: 22,
    zoomScale: 1.56,
    color: '#38bdf8',
    bgToneTop: '#0c2d57',
    bgToneCenter: '#0284c7',
  },
  nerves: {
    id: 'nerves',
    label: 'JARINGAN SARAF & NEURON',
    stageX: 50,
    stageY: 36,
    zoomScale: 1.44,
    color: '#818cf8',
    bgToneTop: '#1e1b4b',
    bgToneCenter: '#4f46e5',
  },
  lungs: {
    id: 'lungs',
    label: 'PARU-PARU & RESPIRASI',
    stageX: 50,
    stageY: 64,
    zoomScale: 1.40,
    color: '#2dd4bf',
    bgToneTop: '#063940',
    bgToneCenter: '#0d9488',
  },
  heart: {
    id: 'heart',
    label: 'JANTUNG & KARDIOVASKULAR',
    stageX: 54,
    stageY: 70,
    zoomScale: 1.54,
    color: '#f43f5e',
    bgToneTop: '#3b0a24',
    bgToneCenter: '#be123c',
  },
  blood: {
    id: 'blood',
    label: 'SIRKULASI PEMBULUH DARAH',
    stageX: 52,
    stageY: 76,
    zoomScale: 1.42,
    color: '#ef4444',
    bgToneTop: '#3b0918',
    bgToneCenter: '#b91c1c',
  },
  liver: {
    id: 'liver',
    label: 'HATI (LIVER) & DETOKSIFIKASI',
    stageX: 42,
    stageY: 87,
    zoomScale: 1.50,
    color: '#f59e0b',
    bgToneTop: '#2e1c08',
    bgToneCenter: '#b45309',
  },
  stomach: {
    id: 'stomach',
    label: 'LAMBUNG & ASAM PENCERNAAN',
    stageX: 57,
    stageY: 91,
    zoomScale: 1.52,
    color: '#fb923c',
    bgToneTop: '#361708',
    bgToneCenter: '#c2410c',
  },
  kidney: {
    id: 'kidney',
    label: 'GINJAL & FILTRASI CAIRAN',
    stageX: 50,
    stageY: 104,
    zoomScale: 1.50,
    color: '#a855f7',
    bgToneTop: '#271042',
    bgToneCenter: '#7e22ce',
  },
  intestine: {
    id: 'intestine',
    label: 'USUS & METABOLISME SEL',
    stageX: 50,
    stageY: 118,
    zoomScale: 1.44,
    color: '#eab308',
    bgToneTop: '#2a2008',
    bgToneCenter: '#a16207',
  },
  muscles: {
    id: 'muscles',
    label: 'JARINGAN OTOT & ENERGI',
    stageX: 35,
    stageY: 82,
    zoomScale: 1.36,
    color: '#fb7185',
    bgToneTop: '#331022',
    bgToneCenter: '#9f1239',
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

/**
 * Real-Time Spoken Word Organ Detector:
 * Scans the currently spoken 6-word window in `wordTimestamps` so if the narrator
 * says "jantung", "otak", "lambung", "ginjal", "paru", etc. mid-sentence,
 * the camera and biological reaction respond immediately to the exact spoken word!
 */
function detectLiveSpokenReaction(spokenWindow: string): {
  organOverride: OrganTarget | null;
  microAction: 'vasoconstrict' | 'hormone-surge' | 'acid-wave' | 'microsleep' | 'hypoxia' | 'toxin-buildup' | 'muscle-spasm' | 'normal';
} {
  const txt = spokenWindow.toLowerCase();
  let organOverride: OrganTarget | null = null;

  if (/otak|neuron|kognisi|memori|halusinasi|tidur|korteks|kepala|mata/.test(txt)) organOverride = 'brain';
  else if (/saraf|adrenalin|impuls|reseptor|sinyal/.test(txt)) organOverride = 'nerves';
  else if (/jantung|detak|kardio|nadi|tensi|pompa/.test(txt)) organOverride = 'heart';
  else if (/pembuluh|darah|arteri|sirkulasi|oksigen darah/.test(txt)) organOverride = 'blood';
  else if (/paru|napas|oksigen|alveoli|sesak|udara/.test(txt)) organOverride = 'lungs';
  else if (/lambung|asam|perut|ghrelin|lapar|mual|maag/.test(txt)) organOverride = 'stomach';
  else if (/hati|liver|empedu|racun|detoks|glikogen/.test(txt)) organOverride = 'liver';
  else if (/ginjal|urin|kencing|dehidrasi|filtrasi|cairan/.test(txt)) organOverride = 'kidney';
  else if (/usus|cerna|nutrisi|kalori|bakteri/.test(txt)) organOverride = 'intestine';
  else if (/otot|laktat|nyeri|sendi|kejang|lemas/.test(txt)) organOverride = 'muscles';

  let microAction: 'vasoconstrict' | 'hormone-surge' | 'acid-wave' | 'microsleep' | 'hypoxia' | 'toxin-buildup' | 'muscle-spasm' | 'normal' = 'normal';
  if (/menyempit|tekanan|tensi|keras|overdrive|cepat|kencang/.test(txt)) microAction = 'vasoconstrict';
  else if (/adrenalin|hormon|kortisol|dopamin|memompa|lonjakan/.test(txt)) microAction = 'hormone-surge';
  else if (/asam|lambung|lapar|kontraksi|perih|mual/.test(txt)) microAction = 'acid-wave';
  else if (/offline|kedip|microsleep|halusinasi|gelap|kantuk|adenosin/.test(txt)) microAction = 'microsleep';
  else if (/napas|oksigen|turun|sesak|alveoli|melambat/.test(txt)) microAction = 'hypoxia';
  else if (/menumpuk|racun|kritis|rusak|hancur|limbah/.test(txt)) microAction = 'toxin-buildup';
  else if (/laktat|mikrotrauma|nyeri|kejang|gemetar/.test(txt)) microAction = 'muscle-spasm';

  return { organOverride, microAction };
}

/**
 * CONTINUOUS 1-BODY JOURNEY ENGINE (Luminous Bioluminescent Teal-Cyan Edition)
 * - Zero hard cuts: continuous smooth camera glide across a living 3D anatomical rig.
 * - Real-time spoken word synchronization: reacts directly to the narrator's exact words.
 * - High-retention luminous medical studio palette (deep teal & cyan surgical light, never pitch-black).
 *
 * NOTE: Because ContinuousBodyJourney is mounted inside <Sequence from={hookDurationFrames}>,
 * `useCurrentFrame()` returns relative frames (0 at hook end). We add `hookDurationFrames`
 * to get `absoluteFrame` so `node.startFrame` and `wordTimestamps` match 100% accurately!
 */
export const ContinuousBodyJourney: React.FC<ContinuousBodyJourneyProps> = ({
  nodes,
  wordTimestamps = [],
  hookDurationFrames,
  outroDurationFrames,
  totalDurationFrames,
  baseBodyMediaUrl = 'butterfly/media/medical_body_xray.jpg',
}) => {
  const relFrame = useCurrentFrame();
  const frame = relFrame + hookDurationFrames; // Absolute timeline frame!
  const { fps } = useVideoConfig();

  // 1. Extract currently spoken words around `frame` for word-accurate biological reactions
  const spokenContext = useMemo(() => {
    if (!wordTimestamps || wordTimestamps.length === 0) return '';
    const nearby = wordTimestamps.filter(
      (w) => w.startFrame <= frame + 15 && w.endFrame >= frame - 25
    );
    return nearby.map((w) => w.word).join(' ');
  }, [frame, wordTimestamps]);

  // 2. Resolve each node's target organ anchor & narrative metadata
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
          narration: '',
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
      return {
        startFrame: n.startFrame,
        endFrame: n.startFrame + n.durationFrames,
        anchor,
        chaosLevel: n.chaosLevel ?? 35,
        headline: n.headline || '',
        timeTag: n.timeOrYear || `FASE ${idx + 1}`,
        primaryText: n.primaryText || null,
        narration: n.narration || '',
        step: n.step || idx + 1,
      };
    });
  }, [nodes, hookDurationFrames, outroDurationFrames, totalDurationFrames]);

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

  // Combine current node text + live spoken words to trigger micro-animations AND live organ lock!
  const liveReaction = useMemo(
    () => detectLiveSpokenReaction(`${spokenContext} ${activeWp.headline} ${activeWp.primaryText || ''}`),
    [spokenContext, activeWp]
  );

  // If the narrator explicitly pronounces a specific organ word right now (e.g. "kelenjar adrenal" -> kidney, "detak jantung" -> heart),
  // lock the active camera anchor directly onto that spoken organ!
  const effectiveAnchor = useMemo(() => {
    const spokenCheck = detectLiveSpokenReaction(spokenContext);
    if (spokenCheck.organOverride && ORGAN_CAMERA_ANCHORS[spokenCheck.organOverride]) {
      return ORGAN_CAMERA_ANCHORS[spokenCheck.organOverride];
    }
    return activeWp.anchor;
  }, [spokenContext, activeWp.anchor]);

  // Smooth spring progress (0 -> 1) whenever narrative shifts attention to a new organ
  const framesIntoWaypoint = Math.max(0, frame - activeWp.startFrame);
  const cameraGlide = spring({
    frame: framesIntoWaypoint,
    fps,
    config: { damping: 22, stiffness: 36, mass: 1.35 },
  });

  // Interpolated continuous camera target on the 100x185 anatomical canvas
  const camStageX = interpolate(cameraGlide, [0, 1], [prevWp.anchor.stageX, effectiveAnchor.stageX]);
  const camStageY = interpolate(cameraGlide, [0, 1], [prevWp.anchor.stageY, effectiveAnchor.stageY]);
  const camZoomBase = interpolate(cameraGlide, [0, 1], [prevWp.anchor.zoomScale, effectiveAnchor.zoomScale]);

  // Continuous chaosLevel & BPM interpolation
  const smoothChaos = interpolate(cameraGlide, [0, 1], [prevWp.chaosLevel, activeWp.chaosLevel]);
  const bpm = Math.round(68 + (Math.min(100, Math.max(5, smoothChaos)) / 100) * 98);

  // Continuous physiological heartbeat phase
  const beatPhase = (frame / fps) * (bpm / 60) * Math.PI * 2;
  const systolicBeat = Math.pow(Math.max(0, Math.sin(beatPhase)), 8);
  const diastolicBeat = Math.pow(Math.max(0, Math.sin(beatPhase - 0.65)), 12) * 0.45;
  const heartPulse = systolicBeat + diastolicBeat;

  // Continuous respiratory breathing expansion
  const breathRate = 14 + (smoothChaos / 100) * 14;
  const breathCycle = (Math.sin((frame / fps) * (breathRate / 60) * Math.PI * 2) + 1) * 0.5;

  // Subtle organic floating drift
  const floatX = Math.sin(frame * 0.028) * 14;
  const floatY = Math.cos(frame * 0.022) * 10;
  const subtleZoomBreath = Math.sin(frame * 0.018) * 0.04 + heartPulse * 0.015;

  const finalScale = camZoomBase + subtleZoomBreath;
  const offsetX = (50 - camStageX) * 6.5 + floatX;
  const offsetY = (74 - camStageY) * 6.2 + floatY;

  // Smooth color interpolation across severity & organ palette
  const targetAccent =
    smoothChaos >= 72 ? '#fb7185' : smoothChaos >= 45 ? '#fbbf24' : effectiveAnchor.color;
  const prevAccent =
    prevWp.chaosLevel >= 72 ? '#fb7185' : prevWp.chaosLevel >= 45 ? '#fbbf24' : prevWp.anchor.color;
  const accentColor = interpolateHexColor(prevAccent, targetAccent, cameraGlide);

  // Dynamic Luminous Background Palette (Bright, Vibrant Medical Studio — Never Pitch Black!)
  const bgTopColor = interpolateHexColor(prevWp.anchor.bgToneTop, effectiveAnchor.bgToneTop, cameraGlide);
  const bgCenterColor = interpolateHexColor(
    smoothChaos >= 72 ? '#881337' : prevWp.anchor.bgToneCenter,
    smoothChaos >= 72 ? '#9f1239' : effectiveAnchor.bgToneCenter,
    cameraGlide
  );

  // Continuous 24 biological bloodstream & neural particles
  const particles = useMemo(() => {
    return Array.from({ length: 24 }).map((_, idx) => {
      const s1 = ((idx * 67 + 19) % 100) / 100;
      const s2 = ((idx * 43 + 37) % 100) / 100;
      const depth = idx % 3;
      return {
        id: idx,
        baseX: 90 + s1 * 900,
        baseY: 140 + s2 * 1160,
        size: depth === 2 ? 22 + (idx % 10) : depth === 1 ? 11 + (idx % 6) : 6 + (idx % 4),
        speedY: -1.2 - s2 * 2.1,
        waveAmp: 18 + (idx % 5) * 9,
        waveFreq: 0.028 + (idx % 4) * 0.01,
        blur: depth === 2 ? 4 : depth === 1 ? 1 : 0,
        opacity: depth === 2 ? 0.36 : depth === 1 ? 0.65 : 0.42,
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

  const scanlineY = interpolate(frame % 135, [0, 135], [100, 1360]);

  const textTransition = interpolate(framesIntoWaypoint, [0, 14], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const textSlideY = interpolate(framesIntoWaypoint, [0, 14], [12, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const getOrganHighlight = (organId: OrganTarget, organX: number, organY: number) => {
    const dist = Math.hypot(camStageX - organX, camStageY - organY);
    const proximity = Math.max(0, 1 - dist / 26);
    const isDirect = activeWp.anchor.id === organId || liveReaction.organOverride === organId;
    return isDirect ? Math.max(0.88, proximity) : Math.max(0.35, proximity * 0.75);
  };

  // Specific visual micro-reaction multipliers driven by narration keywords
  const isVasoconstrict = liveReaction.microAction === 'vasoconstrict';
  const isHormoneSurge = liveReaction.microAction === 'hormone-surge';
  const isAcidWave = liveReaction.microAction === 'acid-wave';
  const isMicrosleep = liveReaction.microAction === 'microsleep';

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        // LUMINOUS MEDICAL STUDIO GRADIENT (Zack D. Films / Kurzgesagt High-Contrast Bioluminescent Teal-Blue)
        background: `radial-gradient(circle at 50% 38%, ${bgCenterColor} 0%, ${bgTopColor} 58%, #07192e 100%)`,
        overflow: 'hidden',
      }}
    >
      {/* Volumetric Surgical Spotlight Behind the 3D Body */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `
            radial-gradient(ellipse 68% 52% at 50% 40%, rgba(56, 189, 248, 0.34) 0%, rgba(14, 165, 233, 0.14) 52%, transparent 80%),
            radial-gradient(circle at 50% 25%, ${accentColor}33 0%, transparent 55%)
          `,
          pointerEvents: 'none',
        }}
      />

      {/* Crisp Medical Blueprint Grid */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            linear-gradient(to right, rgba(125, 211, 252, 0.09) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(125, 211, 252, 0.09) 1px, transparent 1px)
          `,
          backgroundSize: '54px 54px',
          pointerEvents: 'none',
        }}
      />

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
        {/* Base 3D X-Ray Body Backdrop (Screen-blended for luminous glass anatomical depth) */}
        <Img
          src={staticFile(baseBodyMediaUrl)}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center 30%',
            opacity: 0.68,
            mixBlendMode: 'screen',
            filter: 'contrast(1.25) brightness(1.18) saturate(1.35)',
          }}
        />

        {/* High-Precision Interactive Living Anatomical Rig SVG */}
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
              <stop offset="0%" stopColor="#7dd3fc" stopOpacity="1" />
              <stop offset="55%" stopColor="#0ea5e9" stopOpacity="0.65" />
              <stop offset="100%" stopColor="#0284c7" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="organGlowHeart" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fda4af" stopOpacity="1" />
              <stop offset="55%" stopColor="#f43f5e" stopOpacity="0.75" />
              <stop offset="100%" stopColor="#e11d48" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="organGlowLungs" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#5eead4" stopOpacity="0.95" />
              <stop offset="65%" stopColor="#14b8a6" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#0d9488" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="organGlowStomach" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fdba74" stopOpacity="1" />
              <stop offset="60%" stopColor="#f97316" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#ea580c" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="organGlowLiver" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fde047" stopOpacity="0.95" />
              <stop offset="60%" stopColor="#f59e0b" stopOpacity="0.55" />
              <stop offset="100%" stopColor="#d97706" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="organGlowKidney" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#e9d5ff" stopOpacity="1" />
              <stop offset="60%" stopColor="#a855f7" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#7e22ce" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Luminous 3D Glass Human Body Silhouette & Ribcage */}
          <path
            d="M50 6 C58 6 63 12 63 21 C63 28 59 33 56 36 L60 42 C72 44 80 50 82 62 L85 104 C85 108 80 109 78 105 L73 66 L68 66 L70 118 L67 178 C67 183 59 183 58 178 L54 128 L46 128 L42 178 C41 183 33 183 33 178 L30 118 L32 66 L27 66 L22 105 C20 109 15 108 15 104 L18 62 C20 50 28 44 40 42 L44 36 C41 33 37 28 37 21 C37 12 42 6 50 6 Z"
            fill="rgba(56, 189, 248, 0.12)"
            stroke="#7dd3fc"
            strokeWidth="0.65"
          />

          {/* Subtle Anatomical Ribcage Arcs for 3D Medical Realism */}
          <g stroke="rgba(186, 230, 253, 0.22)" strokeWidth="0.45" fill="none">
            <path d="M48 53 Q39 54 36 60 M52 53 Q61 54 64 60" />
            <path d="M48 58 Q38 59 35 66 M52 58 Q62 59 65 66" />
            <path d="M48 63 Q38 64 35 72 M52 63 Q62 64 65 72" />
            <path d="M48 68 Q39 69 37 77 M52 68 Q61 69 63 77" />
          </g>

          {/* Central Spinal Cord & Animated Neural Impulse Highway */}
          <line
            x1="50"
            y1="28"
            x2="50"
            y2="124"
            stroke="#a5b4fc"
            strokeWidth="0.95"
            strokeDasharray="1.5 1.5"
            strokeDashoffset={-(frame * 0.5)}
          />

          {/* Arterial & Venous Vascular Network (Reacts to Vasoconstriction / Blood Pressure!) */}
          <g
            stroke={isVasoconstrict || smoothChaos >= 65 ? '#fb7185' : '#38bdf8'}
            strokeWidth={isVasoconstrict ? 0.65 + systolicBeat * 0.35 : 0.55}
            fill="none"
            opacity="0.85"
            strokeDasharray="2 2.5"
            strokeDashoffset={-(frame * (0.55 + (smoothChaos / 100) * 0.85))}
          >
            <path d="M52 68 Q53 45 50 24" />
            <path d="M48 68 Q47 45 50 24" />
            <path d="M52 66 Q65 55 77 95" />
            <path d="M48 66 Q35 55 23 95" />
            <path d="M53 72 L50 104 L43 160" />
            <path d="M53 72 L50 104 L57 160" />
            <path d="M51 86 L42 88" />
            <path d="M52 88 L57 92" />
          </g>

          {/* Vasoconstriction / Blood Vessel Compression Rings (Active when narrator mentions pembuluh darah menyempit / tekanan darah) */}
          {(isVasoconstrict || activeWp.anchor.id === 'blood' || activeWp.anchor.id === 'heart') && (
            <g transform="translate(50, 46)">
              <ellipse
                cx="0"
                cy="0"
                rx={4.2 - systolicBeat * 1.4}
                ry="1.6"
                fill="none"
                stroke="#fda4af"
                strokeWidth="0.55"
              />
              <ellipse
                cx="0"
                cy="36"
                rx={4.5 - systolicBeat * 1.5}
                ry="1.6"
                fill="none"
                stroke="#fda4af"
                strokeWidth="0.55"
              />
            </g>
          )}

          {/* 1. BRAIN & CENTRAL NERVOUS CORTEX (Stage Y: 22) */}
          <g
            transform={`translate(50, 21) scale(${1 + Math.sin(frame * 0.08) * 0.03})`}
            opacity={0.6 + getOrganHighlight('brain', 50, 22) * 0.4}
          >
            <circle r="14" fill="url(#organGlowBrain)" opacity={0.65 + getOrganHighlight('brain', 50, 22) * 0.35} />
            <path
              d="M-0.5 -7.5 C-6.5 -7.5 -10 -3.5 -10 1 C-10 5.5 -6.5 8 -1 8 Z"
              fill="rgba(56, 189, 248, 0.55)"
              stroke="#bae6fd"
              strokeWidth="0.55"
            />
            <path
              d="M0.5 -7.5 C6.5 -7.5 10 -3.5 10 1 C10 5.5 6.5 8 1 8 Z"
              fill={isMicrosleep && frame % 30 < 12 ? 'rgba(15, 23, 42, 0.7)' : 'rgba(56, 189, 248, 0.55)'}
              stroke="#bae6fd"
              strokeWidth="0.55"
            />
            {/* Neural Gyri Folds */}
            <path
              d="M-7 -2 Q-4 -4 -2 -1 M-8 2 Q-5 0 -2 3 M7 -2 Q4 -4 2 -1 M8 2 Q5 0 2 3"
              stroke="#e0f2fe"
              strokeWidth="0.4"
              fill="none"
            />
            {/* Firing Neural Synapses & Adenosine Molecules */}
            <circle cx={Math.sin(frame * 0.17) * 5.5} cy={Math.cos(frame * 0.23) * 3.8} r="1.2" fill="#ffffff" />
            <circle cx={Math.cos(frame * 0.14) * -4.8} cy={Math.sin(frame * 0.19) * 3.2} r="1.0" fill="#7dd3fc" />
            <circle cx={Math.sin(frame * 0.11 + 2) * 4} cy={Math.cos(frame * 0.15 + 1) * -3} r="0.9" fill="#fde047" />
          </g>

          {/* 2. NERVOUS GANGLIA & ADRENAL SIGNAL SPARKS (Stage Y: 36) */}
          <g
            transform="translate(50, 36)"
            opacity={0.55 + getOrganHighlight('nerves', 50, 36) * 0.45}
          >
            <path
              d="M0 -6 L-9 2 M0 -2 L-11 6 M0 -6 L9 2 M0 -2 L11 6"
              stroke="#c7d2fe"
              strokeWidth="0.5"
              fill="none"
            />
            <circle cx={Math.sin(frame * 0.22) * 7} cy={Math.abs(Math.sin(frame * 0.22)) * 4 - 2} r="1.1" fill="#e0e7ff" />
          </g>

          {/* 3. LUNGS & BRONCHIAL TREE (Stage Y: 64 — Expands & Contracts with Breathing) */}
          <g
            transform={`translate(50, 64) scale(${1 + breathCycle * 0.05}, ${1 + breathCycle * 0.04})`}
            opacity={0.58 + getOrganHighlight('lungs', 50, 64) * 0.42}
          >
            <circle r="19" fill="url(#organGlowLungs)" opacity={0.55 + getOrganHighlight('lungs', 50, 64) * 0.45} />
            <path
              d="M-3 -11.5 C-10.5 -10.5 -15.5 -2 -15.5 9.5 C-15.5 13.5 -8 14.5 -3 10.5 Z"
              fill="rgba(45, 212, 191, 0.45)"
              stroke="#99f6e4"
              strokeWidth="0.55"
            />
            <path
              d="M3 -11.5 C10.5 -10.5 15.5 -2 15.5 9.5 C15.5 13.5 8 14.5 3 10.5 Z"
              fill="rgba(45, 212, 191, 0.45)"
              stroke="#99f6e4"
              strokeWidth="0.55"
            />
            <path
              d="M0 -15 L0 -6 M0 -6 L-7 2 M0 -6 L7 2 M-4 -1 L-9 6 M4 -1 L9 6"
              stroke="#ccfbf1"
              strokeWidth="0.5"
              fill="none"
              opacity="0.9"
            />
          </g>

          {/* 4. BEATING HEART (Stage X: 54, Y: 70 — Systolic & Diastolic Real-Time Thump) */}
          <g
            transform={`translate(54, 70) scale(${1 + heartPulse * 0.18})`}
            opacity={0.75 + getOrganHighlight('heart', 54, 70) * 0.25}
          >
            <circle r="12.5" fill="url(#organGlowHeart)" opacity={0.75 + systolicBeat * 0.25} />
            {/*Systolic Shockwave Ring when beating hard */}
            <circle
              r={5 + ((frame % 22) / 22) * 9}
              fill="none"
              stroke="#fda4af"
              strokeWidth="0.4"
              opacity={1 - (frame % 22) / 22}
            />
            <path
              d="M0 -4.5 C-2.8 -6.8 -6.5 -4.5 -6.5 -0.8 C-6.5 3.5 -1.6 6.2 0 8 C1.6 6.2 6.5 3.5 6.5 -0.8 C6.5 -4.5 2.8 -6.8 0 -4.5 Z"
              fill="#f43f5e"
              stroke="#ffe4e6"
              strokeWidth="0.55"
            />
          </g>

          {/* 5. LIVER / HEPATIC SYSTEM (Stage X: 42, Y: 87) */}
          <g
            transform="translate(43, 86)"
            opacity={0.55 + getOrganHighlight('liver', 42, 87) * 0.45}
          >
            <circle r="12.5" fill="url(#organGlowLiver)" opacity={0.5 + getOrganHighlight('liver', 42, 87) * 0.5} />
            <path
              d="M-7.5 -3.2 C0 -5.5 6.5 -3.2 8.5 2.2 C3.2 6.5 -5.5 6.5 -7.5 2.2 Z"
              fill="rgba(245, 158, 11, 0.55)"
              stroke="#fef08a"
              strokeWidth="0.55"
            />
          </g>

          {/* 6. STOMACH & GASTRIC ACID WAVE (Stage X: 57, Y: 91) */}
          <g
            transform={`translate(56, 91) scale(${1 + Math.sin(frame * (isAcidWave ? 0.14 : 0.06)) * (isAcidWave ? 0.065 : 0.03)})`}
            opacity={0.55 + getOrganHighlight('stomach', 57, 91) * 0.45}
          >
            <circle r="13" fill="url(#organGlowStomach)" opacity={0.55 + getOrganHighlight('stomach', 57, 91) * 0.45} />
            <path
              d="M-3.2 -5.2 C3.2 -6.2 7.5 -2.2 6.5 3.2 C5.5 7.5 -2.2 7.5 -5.5 4.2 C-6.5 1.2 -2.2 -1 -3.2 -5.2 Z"
              fill="rgba(249, 115, 22, 0.55)"
              stroke="#fed7aa"
              strokeWidth="0.55"
            />
            {/* Bubbling Gastric Acid Level inside Stomach */}
            <circle cx={Math.sin(frame * 0.15) * 2} cy={1.8 + Math.cos(frame * 0.2) * 1} r="0.85" fill="#fef08a" />
            <circle cx={Math.cos(frame * 0.18) * -1.5} cy={2.4 + Math.sin(frame * 0.22) * 0.8} r="0.65" fill="#ffffff" />
          </g>

          {/* 7. KIDNEYS & ADRENAL GLANDS (Stage X: 50, Y: 104) */}
          <g
            transform="translate(50, 104)"
            opacity={0.55 + getOrganHighlight('kidney', 50, 104) * 0.45}
          >
            <circle r="13.5" fill="url(#organGlowKidney)" opacity={0.5 + getOrganHighlight('kidney', 50, 104) * 0.5} />
            <ellipse cx="-6.5" cy="0" rx="3.4" ry="5" fill="rgba(168, 85, 247, 0.58)" stroke="#f3e8ff" strokeWidth="0.5" />
            <ellipse cx="6.5" cy="0" rx="3.4" ry="5" fill="rgba(168, 85, 247, 0.58)" stroke="#f3e8ff" strokeWidth="0.5" />
            {/* Adrenal Caps on top of Kidneys (Glow bright red/gold during hormone/adrenaline surge!) */}
            <polygon
              points="-8.5,-4.5 -4.5,-4.5 -6.5,-7.2"
              fill={isHormoneSurge ? '#fb7185' : '#fbbf24'}
              stroke="#ffffff"
              strokeWidth="0.3"
            />
            <polygon
              points="4.5,-4.5 8.5,-4.5 6.5,-7.2"
              fill={isHormoneSurge ? '#fb7185' : '#fbbf24'}
              stroke="#ffffff"
              strokeWidth="0.3"
            />
          </g>

          {/* 8. INTESTINES & METABOLIC TRACT (Stage X: 50, Y: 118) */}
          <g
            transform="translate(50, 117)"
            opacity={0.52 + getOrganHighlight('intestine', 50, 118) * 0.48}
          >
            <rect
              x="-9.5"
              y="-6.5"
              width="19"
              height="13"
              rx="3.5"
              fill="rgba(234, 179, 8, 0.42)"
              stroke="#fef08a"
              strokeWidth="0.5"
            />
            <path
              d="M-6 -3 Q0 -5 6 -3 Q-5 0 6 3 Q0 5 -6 3"
              stroke="#ffffff"
              strokeWidth="0.5"
              fill="none"
              opacity="0.8"
            />
          </g>

          {/* CONTINUOUS GLIDING TARGET LOCK RETICLE + IN-SITU ORGAN CALLOUT */}
          <g transform={`translate(${camStageX}, ${camStageY})`}>
            <circle
              r={8.5 + systolicBeat * 2.5}
              fill="none"
              stroke="#ffffff"
              strokeWidth="0.45"
              strokeDasharray="2 1.5"
              opacity="0.9"
            />
            <circle
              r={5.2 + systolicBeat * 1.2}
              fill="none"
              stroke={accentColor}
              strokeWidth="0.55"
              opacity="0.95"
            />
            <circle r="1.6" fill="#ffffff" />
          </g>
        </svg>
      </div>

      {/* =====================================================================
          2. SOFT LUMINOUS VIGNETTE & LASER SWEEP (Keeps Center Bright & Vibrant!)
          ===================================================================== */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(circle at 50% 42%, transparent 46%, rgba(4, 15, 32, 0.55) 82%, rgba(2, 8, 20, 0.85) 100%)',
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
          background: `linear-gradient(90deg, transparent 0%, #ffffff 50%, transparent 100%)`,
          boxShadow: `0 0 20px ${accentColor}`,
          opacity: 0.42,
          pointerEvents: 'none',
        }}
      />

      {/* =====================================================================
          3. CONTINUOUS FLOWING BIOLOGICAL PARTICLES
          ===================================================================== */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 12 }}>
        {particles.map((p) => {
          const curY = ((p.baseY + frame * p.speedY) % 1250 + 1250) % 1250 + 120;
          const curX = p.baseX + Math.sin(frame * p.waveFreq + p.id) * p.waveAmp;
          const pulseScale = 1 + systolicBeat * 0.22;
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
                background: `radial-gradient(circle at 35% 35%, #ffffff 0%, ${accentColor} 60%, transparent 100%)`,
                boxShadow: `0 0 ${p.size * 1.2}px ${accentColor}`,
                opacity: p.opacity,
                filter: p.blur > 0 ? `blur(${p.blur}px)` : undefined,
                transform: `scale(${pulseScale})`,
              }}
            />
          );
        })}
      </div>

      {/* =====================================================================
          4. SUBTITLE SAFE ZONE PROTECTIVE GRADIENT (Deep Navy-Teal, Not Pitch Black)
          ===================================================================== */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: '680px',
          background:
            'linear-gradient(to top, rgba(4, 14, 28, 0.96) 0%, rgba(6, 22, 42, 0.78) 46%, rgba(8, 28, 52, 0.22) 82%, transparent 100%)',
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
              backgroundColor: 'rgba(7, 22, 44, 0.88)',
              padding: '7px 16px',
              borderRadius: '8px',
              borderLeft: `4px solid ${accentColor}`,
              borderTop: '1px solid rgba(125, 211, 252, 0.25)',
              borderRight: '1px solid rgba(125, 211, 252, 0.15)',
              borderBottom: '1px solid rgba(125, 211, 252, 0.15)',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.45)',
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
              backgroundColor: 'rgba(7, 22, 44, 0.85)',
              padding: '6px 13px',
              borderRadius: '8px',
              border: '1px solid rgba(125, 211, 252, 0.28)',
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: '13px',
              fontWeight: 700,
              color: '#7dd3fc',
              letterSpacing: '1px',
              textTransform: 'uppercase',
            }}
          >
            {effectiveAnchor.label}
          </div>
        </div>

        {/* Smoothly Morphing Organ Status Headline */}
        {activeWp.headline && (
          <div
            style={{
              fontSize: '29px',
              fontWeight: 900,
              color: '#ffffff',
              textShadow: '0 4px 18px rgba(2, 8, 20, 0.9)',
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
            backgroundColor: 'rgba(7, 22, 44, 0.86)',
            padding: '8px 16px',
            borderRadius: '10px',
            border: '1px solid rgba(125, 211, 252, 0.22)',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
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
                color: '#bae6fd',
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
                  color: '#ffffff',
                }}
              >
                {bpm}
              </span>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#7dd3fc' }}>BPM</span>
            </div>
          </div>

          <div
            style={{
              borderLeft: '1px solid rgba(125, 211, 252, 0.22)',
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
                color: '#bae6fd',
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
                color: smoothChaos >= 70 ? '#fb7185' : smoothChaos >= 45 ? '#fde047' : '#38bdf8',
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
              backgroundColor: 'rgba(12, 34, 64, 0.9)',
              padding: '6px 14px',
              borderRadius: '6px',
              border: '1px solid rgba(125, 211, 252, 0.3)',
              width: 'fit-content',
              opacity: textTransition,
            }}
          >
            <span style={{ fontSize: '13px', fontWeight: 800, color: '#fde047' }}>⚡ REAKSI MEDIS:</span>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#ffffff' }}>{activeWp.primaryText}</span>
          </div>
        )}
      </div>

      {/* =====================================================================
          6. PERSISTENT TOP-RIGHT FULL-BODY MINI-MAP RADAR
          ===================================================================== */}
      <div
        style={{
          position: 'absolute',
          top: '68px',
          right: '40px',
          width: '175px',
          height: '330px',
          zIndex: 30,
          backgroundColor: 'rgba(7, 22, 44, 0.86)',
          borderRadius: '14px',
          border: '1.5px solid rgba(125, 211, 252, 0.42)',
          boxShadow: '0 12px 32px rgba(0, 0, 0, 0.55)',
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
            color: '#bae6fd',
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
            fill="rgba(56, 189, 248, 0.16)"
            stroke="#7dd3fc"
            strokeWidth="1.5"
          />
          <ellipse cx="50" cy="20" rx="9" ry="7.5" fill="rgba(56, 189, 248, 0.5)" />
          <path
            d="M47 54 C40 54 36 62 36 74 C36 78 42 79 47 76 Z M53 54 C60 54 64 62 64 74 C64 78 58 79 53 76 Z"
            fill="rgba(45, 212, 191, 0.45)"
          />
          <circle cx="54" cy="70" r="5.2" fill="rgba(244, 63, 94, 0.75)" />
          <path d="M37 83 C43 81 49 83 51 88 C46 92 39 92 37 88 Z" fill="rgba(245, 158, 11, 0.5)" />
          <ellipse cx="56" cy="91" rx="6.5" ry="5" fill="rgba(251, 146, 60, 0.5)" />
          <circle cx="44" cy="104" r="3.5" fill="rgba(168, 85, 247, 0.55)" />
          <circle cx="56" cy="104" r="3.5" fill="rgba(168, 85, 247, 0.55)" />
          <rect x="40" y="111" width="20" height="13" rx="4" fill="rgba(234, 179, 8, 0.45)" />

          {/* Gliding Reticle on Mini-Map */}
          <g transform={`translate(${camStageX}, ${camStageY})`}>
            <circle
              r={12 + systolicBeat * 5}
              fill="none"
              stroke={accentColor}
              strokeWidth="1.6"
              opacity={0.85}
            />
            <circle r="5.5" fill={accentColor} />
            <line x1="-15" y1="0" x2="-7" y2="0" stroke="#ffffff" strokeWidth="1.5" />
            <line x1="7" y1="0" x2="15" y2="0" stroke="#ffffff" strokeWidth="1.5" />
            <line x1="0" y1="-15" x2="0" y2="-7" stroke="#ffffff" strokeWidth="1.5" />
            <line x1="0" y1="7" x2="0" y2="15" stroke="#ffffff" strokeWidth="1.5" />
          </g>
        </svg>

        <div
          style={{
            marginTop: 'auto',
            width: '100%',
            textAlign: 'center',
            backgroundColor: 'rgba(12, 34, 64, 0.92)',
            padding: '4px 6px',
            borderRadius: '6px',
            border: '1px solid rgba(125, 211, 252, 0.3)',
          }}
        >
          <div
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: '9px',
              fontWeight: 700,
              color: '#7dd3fc',
              letterSpacing: '0.8px',
              textTransform: 'uppercase',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            ZOOM {finalScale.toFixed(1)}X • {effectiveAnchor.id.toUpperCase()}
          </div>
        </div>
      </div>
    </div>
  );
};
