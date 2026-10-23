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

export interface DirectorGraphicSceneProps {
  type: DirectorSceneType;
  title: string;
  subtitle: string;
  locationTag: string;
  durationFrames: number;
  primaryText?: string | null;
  secondaryText?: string | null;
  stampText?: string | null;
  quoteText?: string | null;
  metricLabel?: string | null;
  metricValue?: string | null;
  accentColor?: string | null;
}

export const DirectorGraphicScene: React.FC<DirectorGraphicSceneProps> = ({
  type,
  title,
  subtitle,
  locationTag,
  durationFrames,
  primaryText,
  secondaryText,
  stampText,
  quoteText,
  metricLabel,
  metricValue,
  accentColor: rawAccentColor = '#ef4444',
}) => {
  const accentColor = rawAccentColor || '#ef4444';
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Rock-steady, smooth cinematic camera movement (Zero annoying jitter/shaking)
  const scale = interpolate(frame, [0, durationFrames], [1.0, 1.06], { extrapolateRight: 'clamp' });
  const panY = interpolate(frame, [0, durationFrames], [0, -10], { extrapolateRight: 'clamp' });

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
      {/* 1. Forensic Technical Grid Background */}
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
        <div>SYSTEM STATUS: ACTIVE CHRONO</div>
        <div>INCIDENT DOSSIER: #{locationTag.replace(/[^a-zA-Z0-9]/g, '-').slice(0, 15)}</div>
        <div>AI DIRECTOR ENGINE v3.0</div>
      </div>

      {/* 2. Main Animated Graphics Canvas (Confined to upper-middle zone: y: 380 to 1180) */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          transform: `scale(${scale}) translateY(${panY}px)`,
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
              <path d="M 0 0 L 10 5 L 0 10 z" fill={accentColor} />
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
          {/* SCENE A: BUREAUCRACY DRAFT (Dokumen Resmi di Meja)      */}
          {/* ======================================================== */}
          {type === 'bureaucracy-draft' && (
            <g transform="translate(140, 420)">
              <rect x="0" y="0" width="800" height="740" fill="#0f172a" stroke="#334155" strokeWidth="4" rx="14" />
              <g transform="translate(100, 40)">
                <rect x="0" y="0" width="600" height="660" fill="#1e293b" stroke="#64748b" strokeWidth="4" rx="10" />
                <path d="M 0 0 L 220 0 L 260 40 L 600 40 L 600 660 L 0 660 Z" fill="#334155" opacity="0.4" />
                <rect x="35" y="60" width="530" height="560" fill="#f8fafc" stroke="#94a3b8" strokeWidth="2" rx="6" />

                <text x="60" y="115" fill="#0f172a" fontSize="22" fontWeight="900" fontFamily="'Montserrat', sans-serif">
                  {(primaryText || title || 'DOKUMEN RESMI').slice(0, 32)}
                </text>
                <text x="60" y="145" fill="#475569" fontSize="14" fontWeight="700" fontFamily="monospace">
                  {secondaryText || subtitle || 'DRAF BIROKRASI FORMAL'}
                </text>
                <line x1="60" y1="165" x2="500" y2="165" stroke="#cbd5e1" strokeWidth="3" />

                {[200, 230, 260, 290, 320, 350, 390, 420, 450].map((y, idx) => (
                  <line
                    key={idx}
                    x1="60"
                    y1={y}
                    x2={idx % 2 === 0 ? 500 : 440}
                    y2={y}
                    stroke="#94a3b8"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                ))}

                <g transform="translate(160, 460) rotate(-8)">
                  <rect x="0" y="0" width="300" height="75" fill="rgba(220, 38, 38, 0.15)" stroke="#dc2626" strokeWidth="4" strokeDasharray="8 4" rx="6" />
                  <text x="150" y="36" fill="#dc2626" fontSize="18" fontWeight="900" fontFamily="monospace" textAnchor="middle">
                    {stampText || 'CONFIDENTIAL'}
                  </text>
                  <text x="150" y="60" fill="#dc2626" fontSize="12" fontWeight="700" fontFamily="monospace" textAnchor="middle">
                    BIROKRASI KETAT
                  </text>
                </g>
              </g>
            </g>
          )}

          {/* ======================================================== */}
          {/* SCENE B: MEMO HANDOFF (Tangan Menyelipkan Kertas/Kunci)   */}
          {/* ======================================================== */}
          {type === 'memo-handoff' && (
            <g transform="translate(0, -320)">
              <line x1="120" y1="1100" x2="960" y2="1100" stroke="#475569" strokeWidth="4" strokeDasharray="12 8" />
              <path
                d="M 100 1200 Q 250 1130 400 1070 L 450 1060 L 480 1080 L 430 1110 Q 280 1190 120 1270 Z"
                fill="rgba(30, 41, 59, 0.9)"
                stroke="#94a3b8"
                strokeWidth="5"
                strokeDasharray="800"
                strokeDashoffset={strokeProgress}
              />
              <path
                d="M 980 1210 Q 820 1140 680 1080 L 630 1070 L 610 1090 L 650 1120 Q 790 1200 960 1280 Z"
                fill="rgba(30, 41, 59, 0.9)"
                stroke="#94a3b8"
                strokeWidth="5"
                strokeDasharray="800"
                strokeDashoffset={strokeProgress}
              />

              <g transform="translate(430, 880) rotate(-6)">
                <rect x="15" y="15" width="220" height="280" fill="rgba(0,0,0,0.6)" rx="6" />
                <rect x="0" y="0" width="220" height="280" fill="#f8fafc" stroke="#ef4444" strokeWidth="4" rx="6" />
                <rect x="25" y="25" width="170" height="40" fill="rgba(239, 68, 68, 0.15)" stroke="#ef4444" strokeWidth="2" rx="4" />
                <text x="110" y="52" fill="#ef4444" fontSize="18" fontWeight="900" fontFamily="monospace" textAnchor="middle" letterSpacing="2">
                  {stampText || 'TOP SECRET'}
                </text>
                <line x1="25" y1="90" x2="195" y2="90" stroke="#334155" strokeWidth="5" strokeLinecap="round" />
                <line x1="25" y1="115" x2="185" y2="115" stroke="#334155" strokeWidth="4" strokeLinecap="round" />
                <line x1="25" y1="140" x2="190" y2="140" stroke="#334155" strokeWidth="4" strokeLinecap="round" />
                <line x1="25" y1="165" x2="140" y2="165" stroke="#334155" strokeWidth="4" strokeLinecap="round" />
              </g>

              <path d="M 330 1000 C 400 940 470 920 550 910" fill="none" stroke="#ef4444" strokeWidth="5" strokeDasharray="8 6" markerEnd="url(#dirArrow)" />
              <circle cx="540" cy="1020" r={150 + pulse * 12} fill="none" stroke="#ef4444" strokeWidth="3" strokeDasharray="14 10" />

              <g transform="translate(480, 750)">
                <rect x="0" y="0" width="480" height="75" fill="rgba(15, 23, 42, 0.96)" stroke="#ef4444" strokeWidth="3" rx="10" />
                <text x="24" y="30" fill="#ef4444" fontSize="14" fontWeight="900" fontFamily="monospace" letterSpacing="1.5">
                  [!] {primaryText || 'BUKTI FORENSIK UTAMA'}
                </text>
                <text x="24" y="58" fill="#f8fafc" fontSize="18" fontWeight="900" fontFamily="'Montserrat', sans-serif">
                  {title.length > 28 ? title.slice(0, 28) + '...' : title}
                </text>
              </g>
            </g>
          )}

          {/* ======================================================== */}
          {/* SCENE C: PRESS QUESTION (Interogasi Mikrofon)            */}
          {/* ======================================================== */}
          {type === 'press-question' && (
            <g transform="translate(0, -280)">
              <polygon points="540,650 320,1350 760,1350" fill="url(#spotlightDir)" opacity="0.25" />
              <g transform="translate(460, 850)">
                <circle cx="80" cy="50" r="42" fill="#1e293b" stroke="#e2e8f0" strokeWidth="4" />
                <path d="M 30 110 L 130 110 L 160 320 L 0 320 Z" fill="#0f172a" stroke="#94a3b8" strokeWidth="4" />
                <path d="M 120 150 Q 180 130 210 70 L 230 80 Q 190 170 140 190 Z" fill="#1e293b" stroke="#e2e8f0" strokeWidth="4" />
                <rect x="215" y="45" width="22" height="40" fill="#f59e0b" rx="5" stroke="#ffffff" strokeWidth="2" />
                <line x1="226" y1="85" x2="226" y2="120" stroke="#94a3b8" strokeWidth="4" />
                <circle cx="226" cy="65" r={25 + pulse * 20} fill="none" stroke="#f59e0b" strokeWidth="3" opacity={1 - pulse * 0.7} />
                <circle cx="226" cy="65" r={50 + pulse * 30} fill="none" stroke="#f59e0b" strokeWidth="2" strokeDasharray="6 6" opacity={0.8 - pulse * 0.7} />
              </g>

              <g transform="translate(140, 760)">
                <rect x="0" y="0" width="540" height="90" fill="rgba(15, 23, 42, 0.96)" stroke="#f59e0b" strokeWidth="3" rx="10" />
                <polygon points="370,90 400,90 415,120" fill="#f59e0b" />
                <text x="24" y="32" fill="#f59e0b" fontSize="13" fontWeight="bold" fontFamily="monospace" letterSpacing="1">
                  {locationTag || 'PERTANYAAN KRUSIAL'}
                </text>
                <text x="24" y="65" fill="#ffffff" fontSize="20" fontWeight="900" fontFamily="'Montserrat', sans-serif">
                  "{quoteText || title}"
                </text>
              </g>
            </g>
          )}

          {/* ======================================================== */}
          {/* SCENE D: SCHABOWSKI SLIP (Audio Waveform & Transkrip)   */}
          {/* Replaced weird cartoon circles with sleek forensic card */}
          {/* ======================================================== */}
          {type === 'schabowski-slip' && (
            <g transform="translate(120, 420)">
              {/* Outer Dossier Container */}
              <rect x="0" y="0" width="840" height="720" fill="#0b1120" stroke="#dc2626" strokeWidth="4" rx="16" />

              {/* Red Alert Header Strip */}
              <rect x="0" y="0" width="840" height="60" fill="#dc2626" rx="16" />
              <rect x="0" y="44" width="840" height="16" fill="#dc2626" />
              <text x="420" y="40" fill="#ffffff" fontSize="20" fontWeight="900" fontFamily="monospace" textAnchor="middle" letterSpacing="3">
                🚨 TRANSKRIP FATAL SIARAN PERS LANGSUNG (18:57)
              </text>

              {/* Real Audio Waveform Oscilloscope Display */}
              <g transform="translate(40, 90)">
                <rect x="0" y="0" width="760" height="180" fill="#020617" stroke="#334155" strokeWidth="2" rx="10" />
                <text x="20" y="30" fill="#64748b" fontSize="12" fontWeight="bold" fontFamily="monospace">
                  AUDIO FREQUENCY SPECTROGRAM • EAST BERLIN TV FEED
                </text>

                {/* 24 Dynamic Audio Bars */}
                {Array.from({ length: 24 }).map((_, i) => {
                  const h = Math.abs(Math.sin(frame * 0.2 + i * 0.45)) * 95 + 18;
                  const barX = 40 + i * 29;
                  const isPeak = h > 85;
                  return (
                    <rect
                      key={i}
                      x={barX}
                      y={150 - h}
                      width="18"
                      height={h}
                      fill={isPeak ? '#ef4444' : '#38bdf8'}
                      rx="3"
                      opacity={0.85 + Math.sin(frame * 0.3 + i) * 0.15}
                    />
                  );
                })}
              </g>

              {/* Official Quote Paper Container */}
              <g transform="translate(40, 300)">
                <rect x="0" y="0" width="760" height="260" fill="#1e293b" stroke="#475569" strokeWidth="3" rx="10" />

                <rect x="30" y="25" width="260" height="34" fill="#dc2626" rx="4" />
                <text x="160" y="48" fill="#ffffff" fontSize="13" fontWeight="900" fontFamily="monospace" textAnchor="middle" letterSpacing="1.5">
                  UCAPAN ASLI GÜNTER SCHABOWSKI
                </text>

                <text x="30" y="105" fill="#FFE600" fontSize="26" fontWeight="900" fontFamily="'Montserrat', sans-serif">
                  "Das tritt nach meiner Kenntnis..."
                </text>
                <text x="30" y="145" fill="#f8fafc" fontSize="28" fontWeight="900" fontFamily="'Montserrat', sans-serif">
                  "...ist das sofort, unverzüglich!"
                </text>

                <line x1="30" y1="175" x2="730" y2="175" stroke="#334155" strokeWidth="2" strokeDasharray="6 4" />

                <text x="30" y="215" fill="#38bdf8" fontSize="20" fontWeight="900" fontFamily="monospace">
                  ARTI: "SEGERA, TANPA PENUNDAAN!"
                </text>
              </g>

              {/* Stamp of Doom */}
              <g transform="translate(560, 560) rotate(-8)">
                <rect x="0" y="0" width="240" height="65" fill="rgba(220, 38, 38, 0.2)" stroke="#ef4444" strokeWidth="4" strokeDasharray="8 4" rx="6" />
                <text x="120" y="32" fill="#ef4444" fontSize="18" fontWeight="900" fontFamily="monospace" textAnchor="middle" letterSpacing="3">
                  SEKETIKA FATAL
                </text>
                <text x="120" y="52" fill="#ef4444" fontSize="12" fontWeight="700" fontFamily="monospace" textAnchor="middle">
                  GERBANG BUKA 4 JAM
                </text>
              </g>
            </g>
          )}

          {/* ======================================================== */}
          {/* SCENE E: BREAKING NEWS (TV Siaran Darurat)               */}
          {/* ======================================================== */}
          {type === 'breaking-news' && (
            <g transform="translate(100, 420)">
              <rect x="0" y="0" width="880" height="740" fill="#0f172a" stroke="#475569" strokeWidth="8" rx="28" />
              <rect x="30" y="30" width="820" height="680" fill="#020617" stroke="#1e293b" strokeWidth="4" rx="20" />

              <g transform="translate(440, 260)">
                <path d="M 0 -100 L -50 120 L 50 120 Z" fill="none" stroke="#38bdf8" strokeWidth="4" />
                <circle cx="0" cy="-100" r="14" fill="#ef4444" />
                <circle cx="0" cy="-100" r={35 + pulse * 50} fill="none" stroke="#ef4444" strokeWidth="4" opacity={1 - pulse * 0.8} />
                <circle cx="0" cy="-100" r={70 + pulse * 80} fill="none" stroke="#ef4444" strokeWidth="3" strokeDasharray="8 6" opacity={0.8 - pulse * 0.8} />
              </g>

              <g transform="translate(30, 520)">
                <rect x="0" y="0" width="820" height="60" fill="#dc2626" />
                <text x="30" y="38" fill="#ffffff" fontSize="22" fontWeight="900" fontFamily="monospace" letterSpacing="3">
                  🔴 {primaryText || 'BREAKING NEWS // SIARAN DARURAT'}
                </text>
                <rect x="0" y="60" width="820" height="130" fill="rgba(15, 23, 42, 0.96)" />
                <text x="30" y="105" fill="#FFE600" fontSize="26" fontWeight="900" fontFamily="'Montserrat', sans-serif">
                  {title}
                </text>
                <text x="30" y="145" fill="#f8fafc" fontSize="16" fontWeight="700" fontFamily="monospace">
                  {subtitle}
                </text>
              </g>
            </g>
          )}

          {/* ======================================================== */}
          {/* SCENE F: PANIC PHONE (Telepon Darurat Pos Penjagaan)      */}
          {/* ======================================================== */}
          {type === 'panic-phone' && (
            <g transform="translate(140, 430)">
              <rect x="0" y="0" width="800" height="720" fill="rgba(10, 15, 25, 0.95)" stroke="#475569" strokeWidth="6" rx="14" />
              <circle cx="680" cy="120" r="45" fill="#0f172a" stroke="#ef4444" strokeWidth="4" />
              <line x1="680" y1="120" x2="680" y2="90" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" />
              <line x1="680" y1="120" x2="705" y2="135" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" />
              <text x="680" y="185" fill="#ef4444" fontSize="13" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
                {primaryText || locationTag || 'ALARM'}
              </text>

              <g transform="translate(400, 360)">
                <rect x="-180" y="-120" width="360" height="240" fill="#1e293b" stroke="#dc2626" strokeWidth="5" rx="14" />
                <circle cx="0" cy="0" r={45 + pulse * 15} fill="none" stroke="#ef4444" strokeWidth="3" strokeDasharray="8 6" />
                <circle cx="0" cy="0" r="30" fill="#dc2626" />
                <text x="0" y="8" fill="#ffffff" fontSize="24" fontWeight="900" fontFamily="monospace" textAnchor="middle">
                  SOS
                </text>
              </g>

              <g transform="translate(40, 560)">
                <rect x="0" y="0" width="720" height="110" fill="#dc2626" stroke="#ffffff" strokeWidth="3" rx="8" />
                <text x="360" y="44" fill="#ffffff" fontSize="16" fontWeight="900" fontFamily="monospace" textAnchor="middle">
                  {secondaryText || 'DARURAT // TENTARA TANPA PERINTAH'}
                </text>
                <text x="360" y="85" fill="#ffffff" fontSize="22" fontWeight="900" fontFamily="'Montserrat', sans-serif" textAnchor="middle">
                  {title}
                </text>
              </g>
            </g>
          )}

          {/* ======================================================== */}
          {/* SCENE G: SOVIET COLLAPSE (Peta Geopolitik Pecah)         */}
          {/* ======================================================== */}
          {type === 'soviet-collapse' && (
            <g transform="translate(140, 420)">
              <rect x="0" y="0" width="800" height="720" fill="rgba(15, 23, 42, 0.95)" stroke="#ef4444" strokeWidth="3" strokeDasharray="10 8" rx="14" />
              <g transform="translate(80, 50)">
                {[
                  [120, 160, 'ZONE A'],
                  [160, 210, 'ZONE B'],
                  [190, 340, 'ZONE C'],
                  [320, 370, 'ZONE D'],
                  [440, 330, 'ZONE E'],
                  [500, 200, 'MOSCOW'],
                ].map(([cx, cy, label], idx) => (
                  <g key={idx} transform={`translate(${cx}, ${cy})`}>
                    <circle cx="0" cy="0" r="12" fill="#FFE600" stroke="#000" strokeWidth="2" />
                    <text x="18" y="6" fill="#f8fafc" fontSize="13" fontWeight="bold" fontFamily="monospace">
                      {label}
                    </text>
                  </g>
                ))}
              </g>

              <g transform="translate(40, 560)">
                <rect x="0" y="0" width="720" height="110" fill="rgba(15, 23, 42, 0.98)" stroke="#ef4444" strokeWidth="3" rx="10" />
                <text x="360" y="44" fill="#ef4444" fontSize="16" fontWeight="900" fontFamily="monospace" textAnchor="middle" letterSpacing="2">
                  {primaryText || 'DOMINO EFFECT // RUNTUHNYA KEKUATAN'}
                </text>
                <text x="360" y="85" fill="#ffffff" fontSize="22" fontWeight="900" fontFamily="'Montserrat', sans-serif" textAnchor="middle">
                  {title}
                </text>
              </g>
            </g>
          )}

          {/* ======================================================== */}
          {/* SCENE H: TACTICAL MAP / RADAR INCIDENT                   */}
          {/* ======================================================== */}
          {type === 'tactical-map' && (
            <g transform="translate(180, 430)">
              <circle cx="360" cy="360" r="340" fill="#09131f" stroke="#38bdf8" strokeWidth="4" />
              <circle cx="360" cy="360" r="240" fill="none" stroke="rgba(56, 189, 248, 0.4)" strokeWidth="2" strokeDasharray="6 6" />
              <circle cx="360" cy="360" r="140" fill="none" stroke="rgba(56, 189, 248, 0.5)" strokeWidth="2" />
              <circle cx="360" cy="360" r="45" fill="none" stroke="rgba(56, 189, 248, 0.7)" strokeWidth="2" />

              <line x1="20" y1="360" x2="700" y2="360" stroke="rgba(56, 189, 248, 0.3)" strokeWidth="2" />
              <line x1="360" y1="20" x2="360" y2="700" stroke="rgba(56, 189, 248, 0.3)" strokeWidth="2" />

              <line
                x1="360"
                y1="360"
                x2={360 + Math.cos(frame * 0.08) * 330}
                y2={360 + Math.sin(frame * 0.08) * 330}
                stroke="#38bdf8"
                strokeWidth="4"
                opacity="0.9"
              />

              <circle cx="440" cy="280" r={20 + pulse * 25} fill="none" stroke="#ef4444" strokeWidth="3" opacity={1 - pulse * 0.8} />
              <circle cx="440" cy="280" r="10" fill="#ef4444" />
              <text x="465" y="285" fill="#ef4444" fontSize="16" fontWeight="bold" fontFamily="monospace">
                {secondaryText || 'TARGET EPICENTER'}
              </text>
            </g>
          )}

          {/* ======================================================== */}
          {/* SCENE I: CRITICAL GAUGE / OVERLOAD HAZARD                */}
          {/* ======================================================== */}
          {type === 'critical-gauge' && (
            <g transform="translate(140, 420)">
              <rect x="0" y="0" width="800" height="740" fill="#0b0f19" stroke="#ef4444" strokeWidth="4" rx="16" />

              <rect x="10" y="10" width="780" height="40" fill="#f59e0b" />
              <text x="400" y="36" fill="#000000" fontSize="17" fontWeight="900" fontFamily="monospace" textAnchor="middle" letterSpacing="3">
                ⚠ {primaryText || 'HAZARD LEVEL CRITICAL // SYSTEM OVERLOAD'} ⚠
              </text>

              <g transform="translate(400, 390)">
                <circle cx="0" cy="0" r="200" fill="#1e293b" stroke="#64748b" strokeWidth="6" />
                <path d="M 0 -200 A 200 200 0 0 1 200 0" fill="none" stroke="#ef4444" strokeWidth="22" strokeLinecap="round" />
                <path d="M -200 0 A 200 200 0 0 1 0 -200" fill="none" stroke="#f59e0b" strokeWidth="16" />

                {(() => {
                  const needleAngle = 30 + Math.sin(frame * 0.9) * 12;
                  const rad = (needleAngle * Math.PI) / 180;
                  return (
                    <line
                      x1="0"
                      y1="0"
                      x2={Math.cos(rad) * 170}
                      y2={Math.sin(rad) * 170}
                      stroke="#ef4444"
                      strokeWidth="8"
                      strokeLinecap="round"
                    />
                  );
                })()}
                <circle cx="0" cy="0" r="16" fill="#ffffff" stroke="#000" strokeWidth="4" />
                <text x="0" y="70" fill="#ef4444" fontSize="30" fontWeight="900" fontFamily="monospace" textAnchor="middle">
                  {metricValue || '98.7%'}
                </text>
                <text x="0" y="105" fill="#94a3b8" fontSize="14" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
                  {metricLabel || 'MAX THRESHOLD EXCEEDED'}
                </text>
              </g>
            </g>
          )}

          {/* ======================================================== */}
          {/* SCENE J: BREAKING TICKER / GLOBAL BROADCAST               */}
          {/* ======================================================== */}
          {type === 'breaking-ticker' && (
            <g transform="translate(140, 420)">
              <rect x="0" y="0" width="800" height="740" fill="#0a0e17" stroke="#334155" strokeWidth="6" rx="18" />
              <rect x="30" y="30" width="740" height="540" fill="#0f172a" stroke="#1e293b" strokeWidth="3" rx="10" />

              <g transform="translate(60, 70)">
                <circle cx="12" cy="12" r="10" fill="#ef4444" />
                <text x="32" y="19" fill="#ef4444" fontSize="18" fontWeight="900" fontFamily="monospace" letterSpacing="2">
                  LIVE SATELLITE FEED // {primaryText || 'GLOBAL BROADCAST'}
                </text>
              </g>

              <path
                d={`M 60 280 Q 200 ${280 + Math.sin(frame * 0.3) * 60}, 400 280 T 740 280`}
                fill="none"
                stroke="#38bdf8"
                strokeWidth="4"
              />

              <g transform="translate(30, 590)">
                <rect x="0" y="0" width="740" height="100" fill="#dc2626" rx="8" />
                <rect x="0" y="0" width="220" height="100" fill="#991b1b" rx="8" />
                <text x="110" y="60" fill="#ffffff" fontSize="20" fontWeight="900" fontFamily="monospace" textAnchor="middle">
                  {secondaryText || 'URGENT'}
                </text>
                <text x="240" y="60" fill="#ffffff" fontSize="22" fontWeight="900" fontFamily="'Montserrat', sans-serif">
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
            <g transform="translate(140, 420)">
              <rect x="0" y="0" width="800" height="740" fill="#1e293b" stroke="#475569" strokeWidth="4" rx="14" />
              <path d="M 0 0 L 260 0 L 300 45 L 800 45 L 800 740 L 0 740 Z" fill="#334155" opacity="0.5" />

              <rect x="40" y="65" width="720" height="630" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="2" rx="8" />
              <rect x="80" y="45" width="24" height="75" fill="none" stroke="#94a3b8" strokeWidth="5" rx="10" />

              <text x="130" y="115" fill="#0f172a" fontSize="24" fontWeight="900" fontFamily="'Montserrat', sans-serif">
                {primaryText || 'DEKLASIFIKASI BERKAS PENYELIDIKAN'}
              </text>
              <text x="130" y="145" fill="#475569" fontSize="15" fontWeight="700" fontFamily="monospace">
                KASUS: {locationTag || 'EFEK DOMINO SEJARAH'}
              </text>
              <line x1="80" y1="170" x2="680" y2="170" stroke="#cbd5e1" strokeWidth="3" />

              <rect x="80" y="195" width="600" height="110" fill="#f1f5f9" stroke="#94a3b8" strokeWidth="2" rx="6" />
              <text x="110" y="245" fill="#0f172a" fontSize="22" fontWeight="900" fontFamily="'Montserrat', sans-serif">
                {title}
              </text>
              <text x="110" y="278" fill="#64748b" fontSize="14" fontWeight="700" fontFamily="monospace">
                TEMUAN FORENSIK RESMI
              </text>

              <g transform="translate(100, 340)">
                <line x1="0" y1="0" x2="600" y2="0" stroke="rgba(255, 255, 255, 0.1)" strokeWidth="1" strokeDasharray="4 4" />
                <circle cx="300" cy="110" r="55" fill="none" stroke="#FFE600" strokeWidth="2" />
                <text x="300" y="115" fill="#FFE600" fontSize="15" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
                  REKA KEJADIAN FORENSIK
                </text>
                <text x="300" y="140" fill="#94a3b8" fontSize="12" fontFamily="monospace" textAnchor="middle">
                  {subtitle || 'BUKTI MATERIL & CHRONO-TRACE'}
                </text>
              </g>

              <g transform={`translate(420, 560) rotate(-10)`} opacity={stampSpring}>
                <rect x="-15" y="-12" width="260" height="55" fill="none" stroke="#ef4444" strokeWidth="4" rx="4" />
                <text x="115" y="26" fill="#ef4444" fontSize="20" fontWeight="900" fontFamily="monospace" textAnchor="middle" letterSpacing="4">
                  {stampText || 'TOP SECRET'}
                </text>
              </g>
            </g>
          )}
        </svg>
      </div>

      {/* 3. Bottom Film Vignette & Shadow Gradient for Subtitles (Ensures 100% legibility) */}
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
