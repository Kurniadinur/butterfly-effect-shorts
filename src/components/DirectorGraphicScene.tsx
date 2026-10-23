import React from 'react';
import { useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion';

export type DirectorSceneType =
  | 'bureaucracy-draft'
  | 'memo-handoff'
  | 'press-question'
  | 'schabowski-slip'
  | 'breaking-news'
  | 'panic-phone'
  | 'soviet-collapse'
  | 'forensic-dossier'
  | 'tactical-map'
  | 'breaking-ticker'
  | 'critical-gauge'
  | string;

interface DirectorGraphicSceneProps {
  type: DirectorSceneType;
  title: string;
  subtitle: string;
  locationTag: string;
  durationFrames: number;
}

export const DirectorGraphicScene: React.FC<DirectorGraphicSceneProps> = ({
  type,
  title,
  subtitle,
  locationTag,
  durationFrames,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Slow, cinematic camera movement
  const scale = interpolate(frame, [0, durationFrames], [1.0, 1.12], { extrapolateRight: 'clamp' });
  const panY = interpolate(frame, [0, durationFrames], [0, -20], { extrapolateRight: 'clamp' });

  // Subtle hand-drawn boiling line jitter
  const jitterX = Math.sin(Math.floor(frame / 2) * 4.3) * 1.5;
  const jitterY = Math.cos(Math.floor(frame / 2) * 5.1) * 1.5;

  // Stamp spring entrance
  const stampSpring = spring({
    frame,
    fps,
    config: { damping: 14, mass: 0.6 },
  });

  // Animated path drawing progress
  const strokeProgress = interpolate(frame, [0, 30], [800, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Pulse effect
  const pulse = (Math.sin(frame * 0.18) + 1) / 2;

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
          opacity: 0.75,
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
        <div>INVESTIGATION DOSSIER</div>
      </div>

      {/* 2. Main Animated Graphics Canvas */}
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
            width: '1080px',
            height: '1920px',
          }}
        >
          <defs>
            <marker id="dirArrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#ef4444" />
            </marker>
            <linearGradient id="spotlightDir" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="tvGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1e293b" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>
          </defs>

          {/* ======================================================== */}
          {/* SCENE A: BUREAUCRACY DRAFT (Markas Partai, Aturan Visa) */}
          {/* ======================================================== */}
          {type === 'bureaucracy-draft' && (
            <g>
              {/* Wooden Desk */}
              <rect x="100" y="680" width="880" height="920" fill="#0f172a" stroke="#334155" strokeWidth="4" rx="12" />

              {/* SED Politburo Folder */}
              <g transform="translate(240, 780)">
                {/* Folder Body */}
                <rect x="0" y="0" width="600" height="740" fill="#1e293b" stroke="#64748b" strokeWidth="4" rx="10" />
                <path d="M 0 0 L 220 0 L 260 40 L 600 40 L 600 740 L 0 740 Z" fill="#334155" opacity="0.4" />

                {/* White Official Document Paper */}
                <rect x="40" y="70" width="520" height="620" fill="#f8fafc" stroke="#94a3b8" strokeWidth="2" rx="6" />

                {/* Header text */}
                <text x="70" y="130" fill="#0f172a" fontSize="24" fontWeight="900" fontFamily="'Montserrat', sans-serif">
                  SOZIALISTISCHE EINHEITSPARTEI
                </text>
                <text x="70" y="165" fill="#475569" fontSize="16" fontWeight="700" fontFamily="monospace">
                  DRAF RESMI: ATURAN PERJALANAN LUAR NEGERI
                </text>
                <line x1="70" y1="185" x2="490" y2="185" stroke="#cbd5e1" strokeWidth="3" />

                {/* Simulated Document Paragraph Lines */}
                {[220, 250, 280, 310, 340, 370, 420, 450, 480].map((y, idx) => (
                  <line
                    key={idx}
                    x1="70"
                    y1={y}
                    x2={idx % 2 === 0 ? 490 : 430}
                    y2={y}
                    stroke="#94a3b8"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                ))}

                {/* Red Bureaucratic Stamp (Animates slamming down) */}
                <g transform="translate(180, 480) rotate(-8)">
                  <rect
                    x="0"
                    y="0"
                    width="320"
                    height="85"
                    fill="rgba(220, 38, 38, 0.15)"
                    stroke="#dc2626"
                    strokeWidth="4"
                    strokeDasharray="8 4"
                    rx="6"
                  />
                  <text x="160" y="38" fill="#dc2626" fontSize="19" fontWeight="900" fontFamily="monospace" textAnchor="middle">
                    BERLAKU BESOK PAGI
                  </text>
                  <text x="160" y="66" fill="#dc2626" fontSize="14" fontWeight="700" fontFamily="monospace" textAnchor="middle">
                    LEWAT BIROKRASI KETAT
                  </text>
                </g>
              </g>

              {/* Forensic Tag */}
              <g transform="translate(260, 1600)">
                <rect x="0" y="0" width="560" height="70" fill="rgba(15, 23, 42, 0.95)" stroke="#64748b" strokeWidth="2" rx="8" />
                <text x="280" y="42" fill="#cbd5e1" fontSize="16" fontWeight="800" fontFamily="'Montserrat', sans-serif" textAnchor="middle">
                  RENCANA AWAL: HANYA PELONGGARAN VISA BIASA
                </text>
              </g>
            </g>
          )}

          {/* ======================================================== */}
          {/* SCENE B: MEMO HANDOFF (Scene: Disodorkan Tanpa Dibaca) */}
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
                <rect x="15" y="15" width="220" height="290" fill="rgba(0,0,0,0.6)" rx="6" />
                <rect x="0" y="0" width="220" height="290" fill="#f8fafc" stroke="#ef4444" strokeWidth="4" rx="6" />
                <rect x="25" y="30" width="170" height="42" fill="rgba(239, 68, 68, 0.15)" stroke="#ef4444" strokeWidth="2" rx="4" />
                <text x="110" y="58" fill="#ef4444" fontSize="18" fontWeight="900" fontFamily="monospace" textAnchor="middle" letterSpacing="2">
                  TOP SECRET
                </text>
                <line x1="25" y1="100" x2="195" y2="100" stroke="#334155" strokeWidth="5" strokeLinecap="round" />
                <line x1="25" y1="125" x2="185" y2="125" stroke="#334155" strokeWidth="4" strokeLinecap="round" />
                <line x1="25" y1="150" x2="190" y2="150" stroke="#334155" strokeWidth="4" strokeLinecap="round" />
                <line x1="25" y1="175" x2="140" y2="175" stroke="#334155" strokeWidth="4" strokeLinecap="round" />
                <circle cx="170" cy="245" r="28" fill="none" stroke="#dc2626" strokeWidth="3" strokeDasharray="6 3" />
                <text x="170" y="250" fill="#dc2626" fontSize="11" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
                  SOFORT
                </text>
              </g>

              {/* Animated Motion Arrow */}
              <path
                d="M 330 1140 C 400 1080 470 1060 550 1050"
                fill="none"
                stroke="#ef4444"
                strokeWidth="5"
                strokeDasharray="8 6"
                markerEnd="url(#dirArrow)"
              />

              {/* Red Forensic Target Ring */}
              <circle cx="540" cy="1160" r={160 + pulse * 12} fill="none" stroke="#ef4444" strokeWidth="3" strokeDasharray="14 10" />

              {/* Widened Callout Box (Zero Overflow) */}
              <g transform="translate(520, 860)">
                <rect x="0" y="0" width="470" height="82" fill="rgba(15, 23, 42, 0.96)" stroke="#ef4444" strokeWidth="3" rx="10" />
                <text x="24" y="34" fill="#ef4444" fontSize="14" fontWeight="900" fontFamily="monospace" letterSpacing="1.5">
                  [!] BUKTI UTAMA #01
                </text>
                <text x="24" y="62" fill="#f8fafc" fontSize="18" fontWeight="900" fontFamily="'Montserrat', sans-serif">
                  MEMO TANPA DIBACA SAMA SEKALI
                </text>
              </g>
            </g>
          )}

          {/* ======================================================== */}
          {/* SCENE C: PRESS QUESTION (Riccardo Ehrman Standing) */}
          {/* ======================================================== */}
          {type === 'press-question' && (
            <g>
              {/* Press Room Rows of Reporters */}
              <path
                d="M 80 1480 C 140 1420 200 1440 260 1480 C 320 1420 380 1440 440 1480 C 640 1420 700 1440 760 1480 C 820 1420 900 1440 1000 1480 L 1000 1650 L 80 1650 Z"
                fill="rgba(15, 23, 42, 0.85)"
                stroke="#334155"
                strokeWidth="3"
              />

              {/* Spotlight beam */}
              <polygon points="540,650 320,1580 760,1580" fill="url(#spotlightDir)" opacity="0.25" />

              {/* Standing Journalist Silhouette */}
              <g transform="translate(460, 920)">
                <circle cx="80" cy="50" r="42" fill="#1e293b" stroke="#e2e8f0" strokeWidth="4" />
                <path d="M 30 110 L 130 110 L 160 380 L 0 380 Z" fill="#0f172a" stroke="#94a3b8" strokeWidth="4" />
                <path d="M 120 150 Q 180 130 210 70 L 230 80 Q 190 170 140 190 Z" fill="#1e293b" stroke="#e2e8f0" strokeWidth="4" />
                <rect x="215" y="45" width="22" height="40" fill="#f59e0b" rx="5" stroke="#ffffff" strokeWidth="2" />
                <line x1="226" y1="85" x2="226" y2="120" stroke="#94a3b8" strokeWidth="4" />
                <circle cx="226" cy="65" r={25 + pulse * 20} fill="none" stroke="#f59e0b" strokeWidth="3" opacity={1 - pulse * 0.7} />
                <circle cx="226" cy="65" r={50 + pulse * 30} fill="none" stroke="#f59e0b" strokeWidth="2" strokeDasharray="6 6" opacity={0.8 - pulse * 0.7} />
                <circle cx="226" cy="65" r={80 + pulse * 40} fill="none" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="4 6" opacity={0.6 - pulse * 0.6} />
              </g>

              {/* Question Bubble */}
              <g transform="translate(140, 820)">
                <rect x="0" y="0" width="430" height="95" fill="rgba(15, 23, 42, 0.96)" stroke="#f59e0b" strokeWidth="3" rx="10" />
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
          {/* SCENE D: SCHABOWSKI SLIP (Kacamata Melorot, "Segera!") */}
          {/* ======================================================== */}
          {type === 'schabowski-slip' && (
            <g>
              {/* Podium Desk & Microphones */}
              <rect x="140" y="900" width="800" height="600" fill="#0f172a" stroke="#475569" strokeWidth="5" rx="14" />

              {/* Shuffled Paper Memos on Desk */}
              <g transform="translate(260, 980) rotate(-12)">
                <rect x="0" y="0" width="200" height="260" fill="#f8fafc" stroke="#64748b" strokeWidth="2" rx="4" />
                <line x1="20" y1="40" x2="180" y2="40" stroke="#334155" strokeWidth="4" />
                <line x1="20" y1="70" x2="160" y2="70" stroke="#334155" strokeWidth="4" />
              </g>
              <g transform="translate(360, 960) rotate(8)">
                <rect x="0" y="0" width="220" height="280" fill="#ffffff" stroke="#dc2626" strokeWidth="3" rx="4" />
                <line x1="20" y1="40" x2="190" y2="40" stroke="#dc2626" strokeWidth="4" />
                <line x1="20" y1="70" x2="170" y2="70" stroke="#334155" strokeWidth="4" />
                <line x1="20" y1="100" x2="180" y2="100" stroke="#334155" strokeWidth="4" />
              </g>

              {/* Slipping Vintage Black Eyeglasses */}
              <g transform={`translate(${540 + jitterX * 2}, ${1040 + jitterY * 2}) rotate(18)`}>
                {/* Left Lens */}
                <circle cx="-65" cy="0" r="48" fill="rgba(255,255,255,0.2)" stroke="#111827" strokeWidth="10" />
                {/* Right Lens */}
                <circle cx="65" cy="0" r="48" fill="rgba(255,255,255,0.2)" stroke="#111827" strokeWidth="10" />
                {/* Bridge */}
                <path d="M -18 0 Q 0 -15 18 0" fill="none" stroke="#111827" strokeWidth="8" />
                {/* Temples */}
                <line x1="-113" y1="0" x2="-160" y2="-40" stroke="#111827" strokeWidth="7" />
                <line x1="113" y1="0" x2="160" y2="-40" stroke="#111827" strokeWidth="7" />
              </g>

              {/* Stamped Fateful Quote */}
              <g transform="translate(180, 1340)">
                <rect
                  x="0"
                  y="0"
                  width="720"
                  height="110"
                  fill="#dc2626"
                  stroke="#ffffff"
                  strokeWidth="4"
                  rx="10"
                />
                <text x="360" y="44" fill="#ffffff" fontSize="20" fontWeight="900" fontFamily="monospace" textAnchor="middle" letterSpacing="2">
                  "SOFORT, UNVERZÜGLICH"
                </text>
                <text x="360" y="85" fill="#FFE600" fontSize="30" fontWeight="900" fontFamily="'Montserrat', sans-serif" textAnchor="middle">
                  SEGERA. DETIK INI JUGA!
                </text>
              </g>

              {/* Time Indicator */}
              <g transform="translate(700, 920)">
                <rect x="0" y="0" width="180" height="46" fill="#0f172a" stroke="#f59e0b" strokeWidth="2" rx="6" />
                <text x="90" y="30" fill="#f59e0b" fontSize="17" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
                  18:57:12
                </text>
              </g>
            </g>
          )}

          {/* ======================================================== */}
          {/* SCENE E: BREAKING NEWS BROADCAST (Stasiun Berita Dunia) */}
          {/* ======================================================== */}
          {type === 'breaking-news' && (
            <g>
              {/* Retro 1989 CRT TV Frame */}
              <rect x="80" y="680" width="920" height="880" fill="#0f172a" stroke="#475569" strokeWidth="8" rx="28" />

              {/* CRT Curved Screen */}
              <rect x="120" y="720" width="840" height="800" fill="#020617" stroke="#1e293b" strokeWidth="4" rx="20" />

              {/* Satellite / Broadcast Tower Graphic */}
              <g transform="translate(540, 980)">
                {/* Tower Legs */}
                <path d="M 0 -120 L -60 140 L 60 140 Z" fill="none" stroke="#38bdf8" strokeWidth="4" />
                <line x1="-30" y1="10" x2="30" y2="10" stroke="#38bdf8" strokeWidth="3" />
                <line x1="-45" y1="80" x2="45" y2="80" stroke="#38bdf8" strokeWidth="3" />
                {/* Beacon */}
                <circle cx="0" cy="-120" r="16" fill="#ef4444" />
                {/* Broadcast Waves */}
                <circle cx="0" cy="-120" r={40 + pulse * 60} fill="none" stroke="#ef4444" strokeWidth="4" opacity={1 - pulse * 0.8} />
                <circle cx="0" cy="-120" r={80 + pulse * 90} fill="none" stroke="#ef4444" strokeWidth="3" strokeDasharray="8 6" opacity={0.8 - pulse * 0.8} />
                <circle cx="0" cy="-120" r={130 + pulse * 120} fill="none" stroke="#ef4444" strokeWidth="2" strokeDasharray="4 6" opacity={0.6 - pulse * 0.8} />
              </g>

              {/* Breaking News Lower-Third Banner */}
              <g transform="translate(120, 1260)">
                <rect x="0" y="0" width="840" height="70" fill="#dc2626" />
                <text x="30" y="44" fill="#ffffff" fontSize="24" fontWeight="900" fontFamily="monospace" letterSpacing="3">
                  🔴 EILMELDUNG / BREAKING NEWS
                </text>
                <rect x="0" y="70" width="840" height="110" fill="rgba(15, 23, 42, 0.96)" />
                <text x="30" y="118" fill="#FFE600" fontSize="30" fontWeight="900" fontFamily="'Montserrat', sans-serif">
                  PINTU TEMBOK BERLIN DIBUKA!
                </text>
                <text x="30" y="155" fill="#f8fafc" fontSize="18" fontWeight="700" fontFamily="monospace">
                  PULUHAN RIBU WARGA MULAI BERGERAK KE GERBANG
                </text>
              </g>

              {/* Retro TV Scanline Filter */}
              <line x1="120" y1="860" x2="960" y2="860" stroke="rgba(255,255,255,0.08)" strokeWidth="2" />
              <line x1="120" y1="1020" x2="960" y2="1020" stroke="rgba(255,255,255,0.08)" strokeWidth="2" />
              <line x1="120" y1="1180" x2="960" y2="1180" stroke="rgba(255,255,255,0.08)" strokeWidth="2" />
            </g>
          )}

          {/* ======================================================== */}
          {/* SCENE F: PANIC PHONE (Tentara Panik di Pos Penjagaan) */}
          {/* ======================================================== */}
          {type === 'panic-phone' && (
            <g>
              <rect x="0" y="0" width="1080" height="1920" fill="#dc2626" opacity={0.06 + Math.sin(frame * 0.25) * 0.05} />
              <rect x="180" y="720" width="720" height="680" fill="rgba(10, 15, 25, 0.9)" stroke="#475569" strokeWidth="6" rx="12" />
              <line x1="180" y1="1060" x2="900" y2="1060" stroke="#334155" strokeWidth="3" strokeDasharray="10 8" />
              <line x1="540" y1="720" x2="540" y2="1400" stroke="#334155" strokeWidth="3" strokeDasharray="10 8" />

              {/* Clock at 22:30 */}
              <circle cx="780" cy="850" r="50" fill="#0f172a" stroke="#ef4444" strokeWidth="4" />
              <line x1="780" y1="850" x2="780" y2="815" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" />
              <line x1="780" y1="850" x2="805" y2="865" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" />
              <text x="780" y="925" fill="#ef4444" fontSize="14" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
                22:30
              </text>

              {/* Soldier Silhouette Clutching Telephone */}
              <g transform="translate(320, 960)">
                <circle cx="100" cy="60" r="45" fill="#1e293b" stroke="#94a3b8" strokeWidth="4" />
                <path d="M 60 40 L 150 40 L 165 55 L 75 55 Z" fill="#dc2626" stroke="#ef4444" strokeWidth="2" />
                <path d="M 40 130 L 160 130 L 190 380 L 10 380 Z" fill="#0f172a" stroke="#64748b" strokeWidth="4" />
                <path d="M 140 160 Q 210 140 215 70 L 195 65 Q 180 130 120 180 Z" fill="#1e293b" stroke="#94a3b8" strokeWidth="4" />
                <path d="M 180 30 Q 215 50 205 110 L 225 110 Q 240 40 195 20 Z" fill="#f87171" stroke="#ef4444" strokeWidth="3" />
                <path
                  d={`M 205 110 Q ${220 + jitterX * 3} 160 210 200 Q ${190 + jitterY * 3} 240 230 290 L 300 320`}
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
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

          {/* ======================================================== */}
          {/* SCENE G: SOVIET COLLAPSE MAP (Peta Uni Soviet Runtuh) */}
          {/* ======================================================== */}
          {type === 'soviet-collapse' && (
            <g>
              {/* Map Border Frame */}
              <rect x="100" y="680" width="880" height="920" fill="#0f172a" stroke="#334155" strokeWidth="4" rx="14" />

              {/* Stylized Fracturing Eurasian Landmass */}
              <g transform="translate(180, 800)">
                {/* Russia / Core Landmass */}
                <path
                  d="M 60 200 Q 200 120 400 140 Q 600 100 680 180 Q 720 340 600 420 Q 380 460 200 400 Q 80 420 40 320 Z"
                  fill="rgba(220, 38, 38, 0.25)"
                  stroke="#ef4444"
                  strokeWidth="4"
                />

                {/* Fracturing Fault Lines (Cracks in the Empire) */}
                <path d="M 200 135 L 230 260 L 180 395" fill="none" stroke="#FFE600" strokeWidth="4" strokeDasharray="8 6" />
                <path d="M 400 140 L 380 280 L 440 430" fill="none" stroke="#FFE600" strokeWidth="4" strokeDasharray="8 6" />
                <path d="M 520 120 L 560 260 L 520 410" fill="none" stroke="#FFE600" strokeWidth="4" strokeDasharray="8 6" />

                {/* 15 Republics Node Dots */}
                {[
                  [120, 180, 'EST'],
                  [150, 220, 'LVA'],
                  [140, 270, 'LTU'],
                  [190, 310, 'BLR'],
                  [180, 370, 'UKR'],
                  [230, 420, 'MDA'],
                  [300, 390, 'GEO'],
                  [340, 420, 'ARM'],
                  [380, 410, 'AZE'],
                  [420, 350, 'KAZ'],
                  [480, 380, 'UZB'],
                  [530, 400, 'TKM'],
                  [580, 380, 'TJK'],
                  [620, 360, 'KGZ'],
                  [480, 220, 'RUS'],
                ].map(([cx, cy, label], idx) => (
                  <g key={idx} transform={`translate(${cx}, ${cy})`}>
                    <circle cx="0" cy="0" r="10" fill="#FFE600" stroke="#000" strokeWidth="2" />
                    <text x="14" y="5" fill="#f8fafc" fontSize="12" fontWeight="bold" fontFamily="monospace">
                      {label}
                    </text>
                  </g>
                ))}
              </g>

              {/* Lower Dossier Card */}
              <g transform="translate(180, 1380)">
                <rect x="0" y="0" width="720" height="95" fill="rgba(15, 23, 42, 0.96)" stroke="#ef4444" strokeWidth="3" rx="10" />
                <text x="360" y="38" fill="#ef4444" fontSize="16" fontWeight="900" fontFamily="monospace" textAnchor="middle" letterSpacing="2">
                  DOMINO EFFECT • 1989 - 1991
                </text>
                <text x="360" y="72" fill="#ffffff" fontSize="24" fontWeight="900" fontFamily="'Montserrat', sans-serif" textAnchor="middle">
                  UNI SOVIET BUBAR MENJADI 15 NEGARA
                </text>
              </g>
            </g>
          )}

          {/* ======================================================== */}
          {/* SCENE H: TACTICAL MAP / RADAR INCIDENT                   */}
          {/* ======================================================== */}
          {type === 'tactical-map' && (
            <g transform="translate(140, 720)">
              {/* Radar Outer Scope */}
              <circle cx="400" cy="400" r="360" fill="#09131f" stroke="#38bdf8" strokeWidth="4" />
              <circle cx="400" cy="400" r="260" fill="none" stroke="rgba(56, 189, 248, 0.4)" strokeWidth="2" strokeDasharray="6 6" />
              <circle cx="400" cy="400" r="150" fill="none" stroke="rgba(56, 189, 248, 0.5)" strokeWidth="2" />
              <circle cx="400" cy="400" r="50" fill="none" stroke="rgba(56, 189, 248, 0.7)" strokeWidth="2" />

              {/* Scope Axes */}
              <line x1="40" y1="400" x2="760" y2="400" stroke="rgba(56, 189, 248, 0.3)" strokeWidth="2" />
              <line x1="400" y1="40" x2="400" y2="760" stroke="rgba(56, 189, 248, 0.3)" strokeWidth="2" />

              {/* Sweeping Beam */}
              <line
                x1="400"
                y1="400"
                x2={400 + Math.cos(frame * 0.08) * 350}
                y2={400 + Math.sin(frame * 0.08) * 350}
                stroke="#38bdf8"
                strokeWidth="4"
                opacity="0.9"
              />

              {/* Pulsing Target Epicenter */}
              <circle cx="480" cy="320" r={20 + pulse * 25} fill="none" stroke="#ef4444" strokeWidth="3" opacity={1 - pulse * 0.8} />
              <circle cx="480" cy="320" r="10" fill="#ef4444" />
              <text x="505" y="325" fill="#ef4444" fontSize="16" fontWeight="bold" fontFamily="monospace">
                TARGET EPICENTER
              </text>

              {/* Waypoint Coordinates */}
              <g transform="translate(40, 800)">
                <rect x="0" y="0" width="720" height="90" fill="rgba(15, 23, 42, 0.95)" stroke="#38bdf8" strokeWidth="2" rx="8" />
                <text x="360" y="36" fill="#38bdf8" fontSize="15" fontWeight="bold" fontFamily="monospace" textAnchor="middle" letterSpacing="2">
                  TACTICAL SURVEILLANCE • LIVE VECTOR
                </text>
                <text x="360" y="68" fill="#ffffff" fontSize="20" fontWeight="900" fontFamily="'Montserrat', sans-serif" textAnchor="middle">
                  {title}
                </text>
              </g>
            </g>
          )}

          {/* ======================================================== */}
          {/* SCENE I: CRITICAL GAUGE / OVERLOAD HAZARD                */}
          {/* ======================================================== */}
          {type === 'critical-gauge' && (
            <g transform="translate(140, 720)">
              {/* Industrial Panel Backing */}
              <rect x="0" y="0" width="800" height="800" fill="#0b0f19" stroke="#ef4444" strokeWidth="4" rx="16" />

              {/* Hazard Stripes Header */}
              <rect x="10" y="10" width="780" height="40" fill="#f59e0b" />
              <text x="400" y="36" fill="#000000" fontSize="18" fontWeight="900" fontFamily="monospace" textAnchor="middle" letterSpacing="4">
                ⚠ HAZARD LEVEL CRITICAL // SYSTEM OVERLOAD ⚠
              </text>

              {/* Large Pressure Dial */}
              <g transform="translate(400, 420)">
                <circle cx="0" cy="0" r="220" fill="#1e293b" stroke="#64748b" strokeWidth="6" />
                {/* Danger Arc (Red Zone) */}
                <path d="M 0 -220 A 220 220 0 0 1 220 0" fill="none" stroke="#ef4444" strokeWidth="24" strokeLinecap="round" />
                {/* Safe / Warning Arc */}
                <path d="M -220 0 A 220 220 0 0 1 0 -220" fill="none" stroke="#f59e0b" strokeWidth="16" />

                {/* Shaking Needle into Red Zone */}
                {(() => {
                  const needleAngle = 30 + Math.sin(frame * 0.9) * 12;
                  const rad = (needleAngle * Math.PI) / 180;
                  return (
                    <line
                      x1="0"
                      y1="0"
                      x2={Math.cos(rad) * 190}
                      y2={Math.sin(rad) * 190}
                      stroke="#ef4444"
                      strokeWidth="8"
                      strokeLinecap="round"
                    />
                  );
                })()}
                <circle cx="0" cy="0" r="18" fill="#ffffff" stroke="#000" strokeWidth="4" />
                <text x="0" y="80" fill="#ef4444" fontSize="32" fontWeight="900" fontFamily="monospace" textAnchor="middle">
                  98.7%
                </text>
                <text x="0" y="115" fill="#94a3b8" fontSize="15" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
                  MAX PRESSURE THRESHOLD
                </text>
              </g>

              {/* Status Warning Box */}
              <g transform="translate(40, 710)">
                <rect x="0" y="0" width="720" height="70" fill="#dc2626" rx="8" opacity={0.85 + pulse * 0.15} />
                <text x="360" y="44" fill="#ffffff" fontSize="22" fontWeight="900" fontFamily="'Montserrat', sans-serif" textAnchor="middle">
                  FAILURE IMMINENT // IMMEDIATE ACTION REQUIRED
                </text>
              </g>
            </g>
          )}

          {/* ======================================================== */}
          {/* SCENE J: BREAKING TICKER / GLOBAL BROADCAST               */}
          {/* ======================================================== */}
          {type === 'breaking-ticker' && (
            <g transform="translate(140, 720)">
              {/* TV Monitor Outer Bezel */}
              <rect x="0" y="0" width="800" height="780" fill="#0a0e17" stroke="#334155" strokeWidth="6" rx="18" />

              {/* CRT Scanline Screen */}
              <rect x="30" y="30" width="740" height="580" fill="#0f172a" stroke="#1e293b" strokeWidth="3" rx="10" />

              {/* Satellite Live Indicator */}
              <g transform="translate(60, 70)">
                <circle cx="12" cy="12" r="10" fill="#ef4444" />
                <text x="32" y="19" fill="#ef4444" fontSize="18" fontWeight="900" fontFamily="monospace" letterSpacing="2">
                  LIVE SATELLITE FEED // EURO-VISION
                </text>
              </g>

              {/* Oscilloscope Frequency Wave */}
              <path
                d={`M 60 320 Q 200 ${320 + Math.sin(frame * 0.3) * 60}, 400 320 T 740 320`}
                fill="none"
                stroke="#38bdf8"
                strokeWidth="4"
              />

              {/* Urgent Lower Third Ticker */}
              <g transform="translate(30, 630)">
                <rect x="0" y="0" width="740" height="110" fill="#dc2626" rx="8" />
                <rect x="0" y="0" width="220" height="110" fill="#991b1b" rx="8" />
                <text x="110" y="65" fill="#ffffff" fontSize="20" fontWeight="900" fontFamily="monospace" textAnchor="middle">
                  URGENT
                </text>
                <text x="240" y="65" fill="#ffffff" fontSize="22" fontWeight="900" fontFamily="'Montserrat', sans-serif">
                  {title}
                </text>
              </g>
            </g>
          )}

          {/* ======================================================== */}
          {/* SCENE K: FORENSIC DOSSIER (Universal High-Impact Default) */}
          {/* ======================================================== */}
          {(type === 'forensic-dossier' ||
            (![
              'bureaucracy-draft',
              'memo-handoff',
              'press-question',
              'schabowski-slip',
              'breaking-news',
              'panic-phone',
              'soviet-collapse',
              'tactical-map',
              'critical-gauge',
              'breaking-ticker',
            ].includes(type))) && (
            <g transform="translate(140, 720)">
              {/* Manila Classified Dossier Folder */}
              <rect x="0" y="0" width="800" height="820" fill="#1e293b" stroke="#475569" strokeWidth="4" rx="14" />
              <path d="M 0 0 L 260 0 L 300 45 L 800 45 L 800 820 L 0 820 Z" fill="#334155" opacity="0.5" />

              {/* Archival Evidence Paper */}
              <rect x="40" y="70" width="720" height="710" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="2" rx="8" />

              {/* Metallic Paperclip */}
              <rect x="80" y="45" width="24" height="85" fill="none" stroke="#94a3b8" strokeWidth="5" rx="10" />

              {/* Official Seal / Header */}
              <text x="130" y="130" fill="#0f172a" fontSize="26" fontWeight="900" fontFamily="'Montserrat', sans-serif">
                DEKLASIFIKASI BERKAS PENYELIDIKAN
              </text>
              <text x="130" y="165" fill="#475569" fontSize="16" fontWeight="700" fontFamily="monospace">
                KASUS: EFEK DOMINO SEJARAH // KATEGORI BLUNDER
              </text>
              <line x1="80" y1="190" x2="680" y2="190" stroke="#cbd5e1" strokeWidth="3" />

              {/* Dynamic Headline in Typewriter Box */}
              <rect x="80" y="220" width="600" height="120" fill="#f1f5f9" stroke="#94a3b8" strokeWidth="2" rx="6" />
              <text x="110" y="270" fill="#0f172a" fontSize="26" fontWeight="900" fontFamily="'Montserrat', sans-serif">
                {title.length > 32 ? title.slice(0, 32) + '...' : title}
              </text>
              <text x="110" y="310" fill="#475569" fontSize="16" fontWeight="600" fontFamily="monospace">
                LOKASI: {locationTag}
              </text>

              {/* Evidence Sketch Area */}
              <g transform="translate(80, 370)">
                <rect x="0" y="0" width="600" height="280" fill="#0f172a" stroke="#334155" strokeWidth="2" rx="6" />
                <line x1="0" y1="140" x2="600" y2="140" stroke="rgba(255, 255, 255, 0.1)" strokeWidth="1" strokeDasharray="4 4" />
                <line x1="300" y1="0" x2="300" y2="280" stroke="rgba(255, 255, 255, 0.1)" strokeWidth="1" strokeDasharray="4 4" />
                <circle cx="300" cy="140" r="70" fill="none" stroke="#FFE600" strokeWidth="2" />
                <text x="300" y="145" fill="#FFE600" fontSize="16" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
                  REKA KEJADIAN FORENSIK
                </text>
                <text x="300" y="175" fill="#94a3b8" fontSize="13" fontFamily="monospace" textAnchor="middle">
                  BUKTI MATERIL & CHRONO-TRACE
                </text>
              </g>

              {/* Bold Red "CONFIDENTIAL // TOP SECRET" Stamp */}
              <g transform={`translate(420, 640) rotate(-12)`} opacity={stampSpring}>
                <rect x="-15" y="-12" width="270" height="60" fill="none" stroke="#ef4444" strokeWidth="4" rx="4" />
                <text x="120" y="30" fill="#ef4444" fontSize="24" fontWeight="900" fontFamily="monospace" textAnchor="middle" letterSpacing="4">
                  TOP SECRET
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

      {/* 4. Top Editorial Header (Archival Stamp) */}
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
