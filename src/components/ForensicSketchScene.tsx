import React from 'react';
import { useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion';

export type SketchType = 'memo-handoff' | 'press-question' | 'panic-phone';

interface ForensicSketchSceneProps {
  type: SketchType;
  title: string;
  subtitle: string;
  locationTag: string;
  durationFrames: number;
}

export const ForensicSketchScene: React.FC<ForensicSketchSceneProps> = ({
  type,
  title,
  subtitle,
  locationTag,
  durationFrames,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Slow, atmospheric camera motion across duration
  const scale = interpolate(frame, [0, durationFrames], [1.0, 1.12], { extrapolateRight: 'clamp' });
  const panY = interpolate(frame, [0, durationFrames], [0, -15], { extrapolateRight: 'clamp' });

  // Subtle hand-drawn boiling line jitter effect (2-3 frame interval)
  const jitterX = Math.sin(Math.floor(frame / 2) * 4.3) * 1.5;
  const jitterY = Math.cos(Math.floor(frame / 2) * 5.1) * 1.5;

  // Stamp entrance spring
  const stampSpring = spring({
    frame,
    fps,
    config: { damping: 14, mass: 0.6 },
  });

  // Stroke draw-in animation for SVG paths
  const strokeProgress = interpolate(frame, [0, 30], [800, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Pulse effect for radar / alerts
  const pulse = (Math.sin(frame * 0.15) + 1) / 2;

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        backgroundColor: '#070a11',
        overflow: 'hidden',
      }}
    >
      {/* 1. Forensic Blueprint & Grid Background */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            linear-gradient(rgba(255, 255, 255, 0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.04) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
          opacity: 0.7,
        }}
      />

      {/* Blueprint Coordinates Overlay */}
      <div
        style={{
          position: 'absolute',
          top: '40px',
          right: '50px',
          fontFamily: "'Courier New', monospace",
          fontSize: '13px',
          color: 'rgba(255, 255, 255, 0.35)',
          letterSpacing: '1px',
          lineHeight: 1.5,
          textAlign: 'right',
          zIndex: 10,
        }}
      >
        <div>GRID REF: 52°31'12"N 13°23'55"E</div>
        <div>ARCHIVE-CASE: #09-11-1989-BER</div>
        <div>FORENSIC RECONSTRUCTION</div>
      </div>

      {/* 2. Animated Sketch Graphics (Transform with Ken Burns & Jitter) */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          transform: `scale(${scale}) translateY(${panY}px) translate(${jitterX}px, ${jitterY}px)`,
          transformOrigin: 'center center',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <svg
          viewBox="0 0 1080 1920"
          style={{
            width: '100%',
            height: '100%',
          }}
        >
          {/* DEFINITIONS FOR FILTERS & MARKERS */}
          <defs>
            <filter id="roughPaper" x="0%" y="0%" width="100%" height="100%">
              <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="3" result="noise" />
              <feDisplacementMap in="SourceGraphic" in2="noise" scale="3" xChannelSelector="R" yChannelSelector="G" />
            </filter>
            <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#ef4444" />
            </marker>
          </defs>

          {/* ======================================================== */}
          {/* SKETCH TYPE 1: MEMO HANDOFF (Scene: Disodorkan Tanpa Dibaca) */}
          {/* ======================================================== */}
          {type === 'memo-handoff' && (
            <g>
              {/* Meeting Desk Line */}
              <line x1="120" y1="1240" x2="960" y2="1240" stroke="#475569" strokeWidth="4" strokeDasharray="12 8" />

              {/* Hand 1 (East German Official, Left) */}
              <path
                d="M 100 1350 Q 250 1280 400 1220 L 450 1210 L 480 1230 L 430 1260 Q 280 1340 120 1420 Z"
                fill="rgba(30, 41, 59, 0.9)"
                stroke="#94a3b8"
                strokeWidth="5"
                strokeDasharray="800"
                strokeDashoffset={strokeProgress}
              />

              {/* Hand 2 (Schabowski, Right, Reaching Out) */}
              <path
                d="M 980 1360 Q 820 1290 680 1230 L 630 1220 L 610 1240 L 650 1270 Q 790 1350 960 1430 Z"
                fill="rgba(30, 41, 59, 0.9)"
                stroke="#94a3b8"
                strokeWidth="5"
                strokeDasharray="800"
                strokeDashoffset={strokeProgress}
              />

              {/* The Memo (White Paper Sliding across desk) */}
              <g transform="translate(430, 1020) rotate(-6)">
                {/* Paper Shadow */}
                <rect x="15" y="15" width="220" height="290" fill="rgba(0,0,0,0.6)" rx="6" />
                {/* Paper Body */}
                <rect
                  x="0"
                  y="0"
                  width="220"
                  height="290"
                  fill="#f8fafc"
                  stroke="#ef4444"
                  strokeWidth="4"
                  rx="6"
                />

                {/* Stamped "REISEGESETZ / TOP SECRET" on Memo */}
                <rect x="25" y="30" width="170" height="42" fill="rgba(239, 68, 68, 0.15)" stroke="#ef4444" strokeWidth="2" rx="4" />
                <text x="110" y="58" fill="#ef4444" fontSize="18" fontWeight="900" fontFamily="monospace" textAnchor="middle" letterSpacing="2">
                  TOP SECRET
                </text>

                {/* Memo Text Lines (Simulated Document Lines) */}
                <line x1="25" y1="100" x2="195" y2="100" stroke="#334155" strokeWidth="5" strokeLinecap="round" />
                <line x1="25" y1="125" x2="185" y2="125" stroke="#334155" strokeWidth="4" strokeLinecap="round" />
                <line x1="25" y1="150" x2="190" y2="150" stroke="#334155" strokeWidth="4" strokeLinecap="round" />
                <line x1="25" y1="175" x2="140" y2="175" stroke="#334155" strokeWidth="4" strokeLinecap="round" />
                <line x1="25" y1="210" x2="175" y2="210" stroke="#64748b" strokeWidth="3" strokeLinecap="round" />
                <line x1="25" y1="230" x2="160" y2="230" stroke="#64748b" strokeWidth="3" strokeLinecap="round" />

                {/* Red Urgent Stamp */}
                <circle cx="170" cy="245" r="28" fill="none" stroke="#dc2626" strokeWidth="3" strokeDasharray="6 3" />
                <text x="170" y="250" fill="#dc2626" fontSize="11" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
                  SOFORT
                </text>
              </g>

              {/* Animated Motion Arrow (Hand-drawn dotted curve pushing the memo) */}
              <path
                d="M 330 1140 C 400 1080 470 1060 550 1050"
                fill="none"
                stroke="#ef4444"
                strokeWidth="5"
                strokeDasharray="8 6"
                markerEnd="url(#arrow)"
              />

              {/* Red Forensic Target Ring circling the Memo */}
              <circle
                cx="540"
                cy="1160"
                r={160 + pulse * 12}
                fill="none"
                stroke="#ef4444"
                strokeWidth="3"
                strokeDasharray="14 10"
              />

              {/* Forensic Evidence Callout Tag (Widened with plenty of breathing room, zero overflow) */}
              <g transform="translate(520, 860)">
                <rect
                  x="0"
                  y="0"
                  width="470"
                  height="82"
                  fill="rgba(15, 23, 42, 0.96)"
                  stroke="#ef4444"
                  strokeWidth="3"
                  rx="10"
                />
                <text
                  x="24"
                  y="34"
                  fill="#ef4444"
                  fontSize="14"
                  fontWeight="900"
                  fontFamily="monospace"
                  letterSpacing="1.5"
                >
                  [!] BUKTI UTAMA #01
                </text>
                <text
                  x="24"
                  y="62"
                  fill="#f8fafc"
                  fontSize="18"
                  fontWeight="900"
                  fontFamily="'Montserrat', sans-serif"
                  letterSpacing="0.5px"
                >
                  MEMO TANPA DIBACA SAMA SEKALI
                </text>
              </g>
            </g>
          )}

          {/* ======================================================== */}
          {/* SKETCH TYPE 2: PRESS QUESTION (Scene: Riccardo Ehrman) */}
          {/* ======================================================== */}
          {type === 'press-question' && (
            <g>
              {/* Press Room Rows of Reporters (Silhouettes in background) */}
              <path
                d="M 80 1480 C 140 1420 200 1440 260 1480 C 320 1420 380 1440 440 1480 C 640 1420 700 1440 760 1480 C 820 1420 900 1440 1000 1480 L 1000 1650 L 80 1650 Z"
                fill="rgba(15, 23, 42, 0.85)"
                stroke="#334155"
                strokeWidth="3"
              />

              {/* Light Cone / Spotlight beam onto standing journalist */}
              <polygon
                points="540,650 320,1580 760,1580"
                fill="url(#spotlightGrad)"
                opacity="0.25"
              />
              <defs>
                <linearGradient id="spotlightGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Standing Journalist Silhouette (Riccardo Ehrman, center-right) */}
              <g transform="translate(460, 920)">
                {/* Head */}
                <circle cx="80" cy="50" r="42" fill="#1e293b" stroke="#e2e8f0" strokeWidth="4" />
                {/* Torso & Suit */}
                <path
                  d="M 30 110 L 130 110 L 160 380 L 0 380 Z"
                  fill="#0f172a"
                  stroke="#94a3b8"
                  strokeWidth="4"
                />
                {/* Arm Holding Microphone Upwards */}
                <path
                  d="M 120 150 Q 180 130 210 70 L 230 80 Q 190 170 140 190 Z"
                  fill="#1e293b"
                  stroke="#e2e8f0"
                  strokeWidth="4"
                />
                {/* Vintage Reporter Microphone */}
                <rect x="215" y="45" width="22" height="40" fill="#f59e0b" rx="5" stroke="#ffffff" strokeWidth="2" />
                <line x1="226" y1="85" x2="226" y2="120" stroke="#94a3b8" strokeWidth="4" />

                {/* Animated Soundwave Arcs from Microphone */}
                <circle cx="226" cy="65" r={25 + pulse * 20} fill="none" stroke="#f59e0b" strokeWidth="3" opacity={1 - pulse * 0.7} />
                <circle cx="226" cy="65" r={50 + pulse * 30} fill="none" stroke="#f59e0b" strokeWidth="2" strokeDasharray="6 6" opacity={0.8 - pulse * 0.7} />
                <circle cx="226" cy="65" r={80 + pulse * 40} fill="none" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="4 6" opacity={0.6 - pulse * 0.6} />
              </g>

              {/* Question Bubble / Forensic Annotation */}
              <g transform="translate(140, 820)">
                <rect
                  x="0"
                  y="0"
                  width="430"
                  height="95"
                  fill="rgba(15, 23, 42, 0.96)"
                  stroke="#f59e0b"
                  strokeWidth="3"
                  rx="10"
                />
                <polygon points="370,95 400,95 415,130" fill="#f59e0b" />
                <text x="24" y="34" fill="#f59e0b" fontSize="13" fontWeight="bold" fontFamily="monospace" letterSpacing="1">
                  PERTANYAAN KRUSIAL • MENIT KE-57
                </text>
                <text x="24" y="68" fill="#ffffff" fontSize="21" fontWeight="900" fontFamily="'Montserrat', sans-serif">
                  "KAPAN ATURAN BERLAKU?"
                </text>
              </g>
            </g>
          )}

          {/* ======================================================== */}
          {/* SKETCH TYPE 3: PANIC PHONE (Scene: Pos Penjagaan Panik) */}
          {/* ======================================================== */}
          {type === 'panic-phone' && (
            <g>
              {/* Emergency Red Ambient Lighting Pulse */}
              <rect
                x="0"
                y="0"
                width="1080"
                height="1920"
                fill="#dc2626"
                opacity={0.06 + Math.sin(frame * 0.25) * 0.05}
              />

              {/* Guardhouse Window & Watchtower Frame */}
              <rect x="180" y="720" width="720" height="680" fill="rgba(10, 15, 25, 0.9)" stroke="#475569" strokeWidth="6" rx="12" />
              <line x1="180" y1="1060" x2="900" y2="1060" stroke="#334155" strokeWidth="3" strokeDasharray="10 8" />
              <line x1="540" y1="720" x2="540" y2="1400" stroke="#334155" strokeWidth="3" strokeDasharray="10 8" />

              {/* Wall Clock at 22:30 */}
              <circle cx="780" cy="850" r="50" fill="#0f172a" stroke="#ef4444" strokeWidth="4" />
              <line x1="780" y1="850" x2="780" y2="815" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" />
              <line x1="780" y1="850" x2="805" y2="865" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" />
              <text x="780" y="925" fill="#ef4444" fontSize="14" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
                22:30
              </text>

              {/* Soldier Silhouette Clutching Telephone Receiver */}
              <g transform="translate(320, 960)">
                {/* Head with Soviet/East German Military Cap */}
                <circle cx="100" cy="60" r="45" fill="#1e293b" stroke="#94a3b8" strokeWidth="4" />
                <path d="M 60 40 L 150 40 L 165 55 L 75 55 Z" fill="#dc2626" stroke="#ef4444" strokeWidth="2" />

                {/* Torso / Uniform */}
                <path d="M 40 130 L 160 130 L 190 380 L 10 380 Z" fill="#0f172a" stroke="#64748b" strokeWidth="4" />

                {/* Arm Up to Ear Holding Telephone */}
                <path d="M 140 160 Q 210 140 215 70 L 195 65 Q 180 130 120 180 Z" fill="#1e293b" stroke="#94a3b8" strokeWidth="4" />

                {/* Rotary Telephone Handset */}
                <path d="M 180 30 Q 215 50 205 110 L 225 110 Q 240 40 195 20 Z" fill="#f87171" stroke="#ef4444" strokeWidth="3" />

                {/* Coiled Wire Shaking with Tremble */}
                <path
                  d={`M 205 110 Q ${220 + jitterX * 3} 160 210 200 Q ${190 + jitterY * 3} 240 230 290 L 300 320`}
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="4"
                  strokeLinecap="round"
                />

                {/* Rotary Base on desk */}
                <rect x="290" y="300" width="90" height="60" fill="#1e293b" stroke="#ef4444" strokeWidth="3" rx="8" />
              </g>

              {/* Red Flashing Warning HUD */}
              <g transform="translate(230, 1440)">
                <rect x="0" y="0" width="620" height="75" fill="rgba(220, 38, 38, 0.2)" stroke="#ef4444" strokeWidth="3" rx="8" />
                <text x="310" y="32" fill="#ef4444" fontSize="15" fontWeight="900" fontFamily="monospace" textAnchor="middle" letterSpacing="2">
                  [!] STATUS: TIDAK ADA JAWABAN DARI ATASAN
                </text>
                <text x="310" y="58" fill="#f8fafc" fontSize="18" fontWeight="800" fontFamily="'Montserrat', sans-serif" textAnchor="middle">
                  TENTARA DI POS DITINGGAL SENDIRIAN
                </text>
              </g>
            </g>
          )}
        </svg>
      </div>

      {/* 3. Bottom Film Vignette & Shadow Gradient for Subtitles */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: '520px',
          background: 'linear-gradient(to top, rgba(7, 10, 17, 0.98) 0%, rgba(7, 10, 17, 0.7) 60%, transparent 100%)',
          pointerEvents: 'none',
        }}
      />

      {/* 4. Top Editorial Header (Archival Reka Kejadian Stamp) */}
      <div
        style={{
          position: 'absolute',
          top: '90px',
          left: '50px',
          right: '50px',
          zIndex: 30,
          transform: `scale(${stampSpring})`,
          transformOrigin: 'top left',
        }}
      >
        {/* Rubber Stamp Badge */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#dc2626',
            color: '#ffffff',
            padding: '6px 14px',
            borderRadius: '4px',
            fontSize: '14px',
            fontWeight: 900,
            letterSpacing: '2px',
            textTransform: 'uppercase',
            boxShadow: '0 4px 15px rgba(220, 38, 38, 0.5)',
            marginBottom: '10px',
          }}
        >
          <span>🚨 REKA KEJADIAN • SKETSA FORENSIK</span>
        </div>

        {/* Location & Time Stamp */}
        <div
          style={{
            fontFamily: "'Courier New', monospace",
            fontSize: '16px',
            color: '#cbd5e1',
            letterSpacing: '1.5px',
            textTransform: 'uppercase',
            fontWeight: 700,
            marginBottom: '6px',
          }}
        >
          {locationTag}
        </div>

        {/* Scene Title */}
        <div
          style={{
            fontFamily: "'Montserrat', sans-serif",
            fontSize: '34px',
            fontWeight: 900,
            color: '#f8fafc',
            textTransform: 'uppercase',
            letterSpacing: '-0.5px',
            lineHeight: 1.15,
            textShadow: '0 4px 20px rgba(0, 0, 0, 0.9)',
          }}
        >
          {title}
        </div>
      </div>
    </div>
  );
};
