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
  | 'wall-demolition'
  | 'gate-breach'
  | 'domino-collapse'
  | 'press-podium'
  | 'memo-investigation'
  | 'maritime-disaster'
  | 'reactor-meltdown'
  | 'laboratory-discovery'
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
          {/* SCENE K: WALL DEMOLITION (Massa Merobohkan Tembok Berlin) */}
          {/* ======================================================== */}
          {(type === 'wall-demolition' || type === 'wall-demolition-action') && (
            <g transform="translate(100, 390)">
              <rect x="0" y="0" width="880" height="780" fill="#030712" stroke="#374151" strokeWidth="4" rx="16" />

              {/* Sweeping Night Searchlights */}
              {(() => {
                const angle1 = Math.sin(frame * 0.04) * 35;
                const angle2 = Math.cos(frame * 0.035) * 30;
                return (
                  <g>
                    <polygon
                      points={`120,740 ${440 + angle1 * 8},-100 ${560 + angle1 * 8},-100`}
                      fill="url(#spotlightDir)"
                      opacity="0.35"
                    />
                    <polygon
                      points={`760,740 ${400 + angle2 * 7},-100 ${520 + angle2 * 7},-100`}
                      fill="url(#spotlightDir)"
                      opacity="0.3"
                    />
                  </g>
                );
              })()}

              {/* Concrete Berlin Wall Structure */}
              <g transform="translate(40, 310)">
                <rect x="0" y="0" width="800" height="330" fill="#1f2937" stroke="#4b5563" strokeWidth="4" rx="4" />
                {[160, 320, 480, 640].map((x) => (
                  <line key={x} x1={x} y1="0" x2={x} y2="330" stroke="#111827" strokeWidth="5" />
                ))}

                {/* Historic Wall Graffiti */}
                <text x="180" y="160" fill="#ef4444" fontSize="42" fontWeight="900" fontFamily="'Montserrat', sans-serif" transform="rotate(-6 180 160)" opacity="0.9">
                  {(stampText || 'FREIHEIT').slice(0, 14)}
                </text>
                <text x="490" y="180" fill="#38bdf8" fontSize="36" fontWeight="900" fontFamily="monospace" transform="rotate(4 490 180)" opacity="0.9">
                  {(secondaryText || 'TOR AUF! 1989').slice(0, 16)}
                </text>
                <circle cx="380" cy="190" r="32" fill="none" stroke="#FFE600" strokeWidth="5" opacity="0.8" />
                <line x1="380" y1="158" x2="380" y2="222" stroke="#FFE600" strokeWidth="4" opacity="0.8" />
                <line x1="348" y1="190" x2="380" y2="190" stroke="#FFE600" strokeWidth="4" opacity="0.8" />
                <line x1="412" y1="190" x2="380" y2="190" stroke="#FFE600" strokeWidth="4" opacity="0.8" />

                {/* Expanding Fissures and Glowing Cracks */}
                {(() => {
                  const crackProgress = interpolate(frame, [0, 40], [400, 0], { extrapolateRight: 'clamp' });
                  return (
                    <g>
                      <path
                        d="M 320 0 L 335 70 L 310 130 L 340 190 L 325 260 L 340 330"
                        fill="none"
                        stroke="#f59e0b"
                        strokeWidth="6"
                        strokeDasharray="400"
                        strokeDashoffset={crackProgress}
                      />
                      <path
                        d="M 335 70 L 390 110 L 430 160"
                        fill="none"
                        stroke="#f59e0b"
                        strokeWidth="4"
                        strokeDasharray="200"
                        strokeDashoffset={crackProgress * 0.7}
                      />
                    </g>
                  );
                })()}

                {/* Falling Concrete Chunks */}
                {[
                  { x: 300, y: 160 + ((frame * 6) % 170), size: 14, rot: frame * 8 },
                  { x: 340, y: 130 + ((frame * 7) % 190), size: 18, rot: -frame * 6 },
                ].map((chunk, idx) => (
                  <rect
                    key={idx}
                    x={chunk.x}
                    y={chunk.y}
                    width={chunk.size}
                    height={chunk.size}
                    fill="#9ca3af"
                    stroke="#1f2937"
                    transform={`rotate(${chunk.rot} ${chunk.x + chunk.size / 2} ${chunk.y + chunk.size / 2})`}
                  />
                ))}
              </g>

              {/* People on Top of Wall Swinging Sledgehammer (Silhouette) */}
              <g transform="translate(40, 310)">
                {(() => {
                  const hammerSwing = Math.sin(frame * 0.28);
                  const hammerRot = hammerSwing * 45;
                  const isImpact = hammerSwing < -0.85;
                  return (
                    <g transform="translate(320, 0)">
                      <circle cx="0" cy="-60" r="14" fill="#000000" />
                      <path d="M -8 -46 L 8 -46 L 12 -5 L -12 -5 Z" fill="#000000" />
                      <line x1="-8" y1="-5" x2="-18" y2="25" stroke="#000000" strokeWidth="8" strokeLinecap="round" />
                      <line x1="8" y1="-5" x2="18" y2="25" stroke="#000000" strokeWidth="8" strokeLinecap="round" />

                      <g transform={`rotate(${hammerRot} 0 -35)`}>
                        <line x1="0" y1="-35" x2="35" y2="-65" stroke="#000000" strokeWidth="6" strokeLinecap="round" />
                        <line x1="25" y1="-75" x2="45" y2="-55" stroke="#ef4444" strokeWidth="12" strokeLinecap="square" />
                      </g>

                      {isImpact && (
                        <g transform="translate(10, 0)">
                          <circle cx="0" cy="0" r="18" fill="#FFE600" />
                          <line x1="-22" y1="-15" x2="22" y2="15" stroke="#ffffff" strokeWidth="4" />
                          <line x1="-15" y1="22" x2="15" y2="-22" stroke="#ffffff" strokeWidth="4" />
                        </g>
                      )}
                    </g>
                  );
                })()}

                {/* Celebrating Figures */}
                <g transform="translate(200, 0)">
                  <circle cx="0" cy="-55" r="13" fill="#000000" />
                  <path d="M -7 -42 L 7 -42 L 10 0 L -10 0 Z" fill="#000000" />
                  <path d="M -7 -35 L -25 -65 L -20 -80" fill="none" stroke="#000000" strokeWidth="6" strokeLinecap="round" />
                  <path d="M 7 -35 L 25 -65 L 20 -80" fill="none" stroke="#000000" strokeWidth="6" strokeLinecap="round" />
                </g>

                <g transform="translate(480, 0)">
                  <circle cx="0" cy="-58" r="13" fill="#000000" />
                  <path d="M -7 -45 L 7 -45 L 10 0 L -10 0 Z" fill="#000000" />
                  <path d="M -7 -38 L -30 -65" fill="none" stroke="#000000" strokeWidth="6" strokeLinecap="round" />
                  <path d="M 7 -38 L 30 -70" fill="none" stroke="#000000" strokeWidth="6" strokeLinecap="round" />
                </g>
              </g>

              {/* Crowd at Base Pushing Against the Wall */}
              <g transform="translate(40, 560)">
                <rect x="0" y="80" width="800" height="90" fill="#090d16" />
                {Array.from({ length: 18 }).map((_, i) => {
                  const px = 20 + i * 44;
                  const pushBob = Math.sin(frame * 0.15 + i) * 4;
                  return (
                    <g key={i} transform={`translate(${px}, ${pushBob})`}>
                      <circle cx="0" cy="0" r="12" fill="#05070a" />
                      <path d="M -8 12 L 8 12 L 10 80 L -10 80 Z" fill="#05070a" />
                      <line x1="0" y1="20" x2="18" y2="0" stroke="#05070a" strokeWidth="6" strokeLinecap="round" />
                    </g>
                  );
                })}
              </g>

              {/* Action Banner */}
              <g transform="translate(30, 30)">
                <rect x="0" y="0" width="820" height="55" fill="rgba(220, 38, 38, 0.95)" rx="8" />
                <text x="410" y="36" fill="#ffffff" fontSize="19" fontWeight="900" fontFamily="monospace" textAnchor="middle" letterSpacing="2">
                  {primaryText ? `⚡ REKA KEJADIAN: ${primaryText.slice(0, 36)}` : '⚡ REKA KEJADIAN: MASSA MEROBOHKAN TEMBOK BERLIN'}
                </text>
              </g>
            </g>
          )}

          {/* ======================================================== */}
          {/* SCENE L: GATE BREACH (Gerbang Dibuka & Lautan Massa Maju) */}
          {/* ======================================================== */}
          {(type === 'gate-breach' || type === 'gate-breach-crowd') && (
            <g transform="translate(100, 390)">
              <rect x="0" y="0" width="880" height="780" fill="#050811" stroke="#334155" strokeWidth="4" rx="16" />

              {/* Guard Control Booth on Left */}
              <g transform="translate(80, 260)">
                <rect x="0" y="0" width="160" height="340" fill="#1e293b" stroke="#64748b" strokeWidth="4" rx="8" />
                <rect x="25" y="40" width="110" height="100" fill="#fef08a" stroke="#475569" strokeWidth="3" rx="4" />
                <circle cx="80" cy="95" r="22" fill="#0f172a" />
                <path d="M 60 120 L 100 120 L 110 140 L 50 140 Z" fill="#0f172a" />

                <g transform="translate(80, -20)">
                  <polygon points="-25,20 25,20 18,-15 -18,-15" fill={pulse > 0.5 ? '#ef4444' : '#7f1d1d'} />
                  <circle cx="0" cy="-18" r="14" fill="#ef4444" opacity={0.7 + pulse * 0.3} />
                </g>
              </g>

              {/* The Barrier Gate Swinging UPWARD */}
              {(() => {
                const gateAngle = interpolate(frame, [0, 45], [0, -75], {
                  extrapolateLeft: 'clamp',
                  extrapolateRight: 'clamp',
                });
                return (
                  <g transform="translate(240, 480)">
                    <rect x="-15" y="-30" width="30" height="150" fill="#334155" rx="4" />
                    <circle cx="0" cy="0" r="18" fill="#e2e8f0" stroke="#0f172a" strokeWidth="4" />

                    <g transform={`rotate(${gateAngle} 0 0)`}>
                      <line x1="0" y1="0" x2="560" y2="0" stroke="#ffffff" strokeWidth="18" strokeLinecap="round" />
                      {[80, 160, 240, 320, 400, 480].map((bx) => (
                        <line key={bx} x1={bx} y1="-9" x2={bx + 35} y2="-9" stroke="#dc2626" strokeWidth="18" />
                      ))}
                      <circle cx="560" cy="0" r="12" fill="#dc2626" />
                    </g>
                  </g>
                );
              })()}

              {/* Flood of People Silhouettes Rushing Across Border */}
              <g transform="translate(60, 460)">
                <line x1="0" y1="140" x2="760" y2="140" stroke="#475569" strokeWidth="4" strokeDasharray="16 12" />

                {Array.from({ length: 20 }).map((_, i) => {
                  const runSpeed = (frame * (3 + (i % 3))) % 840;
                  const px = (runSpeed + i * 40) % 800;
                  const py = 80 + (i % 4) * 14;
                  const bob = Math.sin(frame * 0.4 + i) * 5;
                  return (
                    <g key={i} transform={`translate(${px}, ${py + bob})`}>
                      <circle cx="0" cy="-35" r="10" fill="#000000" />
                      <path d="M -6 -25 L 6 -25 L 8 15 L -8 15 Z" fill="#000000" />
                      <line x1="-4" y1="15" x2="-14" y2="38" stroke="#000000" strokeWidth="5" />
                      <line x1="4" y1="15" x2="14" y2="38" stroke="#000000" strokeWidth="5" />
                      {i % 4 === 0 && (
                        <polygon
                          points="6,-10 120,-30 120,10"
                          fill="rgba(254, 240, 138, 0.25)"
                        />
                      )}
                    </g>
                  );
                })}
              </g>

              {/* Action Banner */}
              <g transform="translate(30, 30)">
                <rect x="0" y="0" width="820" height="55" fill="rgba(2, 132, 199, 0.95)" rx="8" />
                <text x="410" y="36" fill="#ffffff" fontSize="19" fontWeight="900" fontFamily="monospace" textAnchor="middle" letterSpacing="2">
                  {primaryText ? `🚨 PERIMETER JEBOL: ${primaryText.slice(0, 36)}` : '🚨 GERBANG BORNHOLMER DIBUKA: LAUTAN MASSA MENEROBOS'}
                </text>
              </g>
            </g>
          )}

          {/* ======================================================== */}
          {/* SCENE M: PRESS PODIUM (Konferensi Pers & Hujan Blitz)    */}
          {/* ======================================================== */}
          {(type === 'press-podium' || type === 'press-conference') && (
            <g transform="translate(100, 390)">
              <rect x="0" y="0" width="880" height="780" fill="#0a0f1d" stroke="#374151" strokeWidth="4" rx="16" />

              {/* Random Camera Flashbulbs Popping */}
              {(() => {
                const flash1 = Math.sin(frame * 1.8) > 0.85;
                const flash2 = Math.cos(frame * 2.3) > 0.88;
                return (
                  <g>
                    {flash1 && <circle cx="220" cy="180" r="160" fill="#ffffff" opacity="0.8" />}
                    {flash2 && <circle cx="680" cy="220" r="140" fill="#ffffff" opacity="0.75" />}
                  </g>
                );
              })()}

              {/* The Press Conference Rostrum */}
              <g transform="translate(440, 320)">
                <polygon points="-120,380 120,380 90,140 -90,140" fill="#1e293b" stroke="#64748b" strokeWidth="4" />
                <rect x="-140" y="110" width="280" height="32" fill="#334155" stroke="#94a3b8" strokeWidth="3" rx="4" />

                <g transform="translate(0, 40)">
                  <circle cx="0" cy="-70" r="28" fill="#0f172a" />
                  <rect x="-18" y="-76" width="36" height="12" fill="none" stroke="#FFE600" strokeWidth="4" rx="3" />
                  <polygon points="-70,70 70,70 50,-30 -50,-30" fill="#0f172a" />
                  <polygon points="-8,-30 8,-30 12,30 -12,30" fill="#dc2626" />

                  <g transform={`rotate(${Math.sin(frame * 0.3) * 6} 20 20)`}>
                    <rect x="-40" y="10" width="80" height="60" fill="#f8fafc" stroke="#475569" strokeWidth="2" rx="2" />
                    <line x1="-30" y1="25" x2="30" y2="25" stroke="#94a3b8" strokeWidth="3" />
                    <line x1="-30" y1="40" x2="20" y2="40" stroke="#94a3b8" strokeWidth="3" />
                  </g>
                </g>

                {[-80, -40, 0, 40, 80].map((mx, idx) => (
                  <g key={idx} transform={`translate(${mx}, 110)`}>
                    <line x1="0" y1="0" x2={mx * 0.2} y2="-55" stroke="#cbd5e1" strokeWidth="5" />
                    <circle cx={mx * 0.2} cy="-62" r="10" fill="#38bdf8" stroke="#000" strokeWidth="2" />
                  </g>
                ))}
              </g>

              {/* Digital Clock Showing Fatal Time */}
              <g transform="translate(360, 100)">
                <rect x="0" y="0" width="160" height="48" fill="#020617" stroke="#ef4444" strokeWidth="3" rx="6" />
                <text x="80" y="33" fill="#ef4444" fontSize="22" fontWeight="900" fontFamily="monospace" textAnchor="middle">
                  {(metricValue || locationTag || '18:57:04').slice(0, 12)}
                </text>
              </g>

              {/* Action Banner */}
              <g transform="translate(30, 30)">
                <rect x="0" y="0" width="820" height="55" fill="rgba(220, 38, 38, 0.95)" rx="8" />
                <text x="410" y="36" fill="#ffffff" fontSize="19" fontWeight="900" fontFamily="monospace" textAnchor="middle" letterSpacing="2">
                  {primaryText ? `🎙️ KONFERENSI PERS: ${primaryText.slice(0, 36)}` : '🎙️ PUSAT PERS: SCHABOWSKI MEMBACA DOKUMEN SALAH'}
                </text>
              </g>
            </g>
          )}

          {/* ======================================================== */}
          {/* SCENE N: MEMO INVESTIGATION (Kertas Memo & Kaca Pembesar) */}
          {/* ======================================================== */}
          {(type === 'memo-investigation' || type === 'secret-document') && (
            <g transform="translate(100, 390)">
              <rect x="0" y="0" width="880" height="780" fill="#090d16" stroke="#374151" strokeWidth="4" rx="16" />

              <g transform="translate(140, 95)">
                <rect x="0" y="0" width="600" height="590" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="3" rx="8" />
                <rect x="40" y="35" width="240" height="32" fill="#dc2626" rx="4" />
                <text x="160" y="57" fill="#ffffff" fontSize="13" fontWeight="900" fontFamily="monospace" textAnchor="middle">
                  {(stampText || 'DOKUMEN INVESTIGASI').slice(0, 24)}
                </text>

                <text x="40" y="110" fill="#0f172a" fontSize="20" fontWeight="900" fontFamily="monospace">
                  {(secondaryText || title || 'DOKUMEN RESMI').slice(0, 32)}
                </text>

                <line x1="40" y1="130" x2="560" y2="130" stroke="#cbd5e1" strokeWidth="3" />

                {[165, 195, 225, 285, 315, 345, 405, 435].map((ly, i) => (
                  <line key={i} x1="40" y1={ly} x2={i % 2 === 0 ? 560 : 500} y2={ly} stroke="#94a3b8" strokeWidth="4" />
                ))}

                {/* Highlighted Fatal Paragraph */}
                <g transform="translate(40, 245)">
                  <rect x="-10" y="-5" width="540" height="34" fill="#fde047" opacity="0.8" rx="4" />
                  <text x="0" y="20" fill="#000000" fontSize="17" fontWeight="900" fontFamily="monospace">
                    {primaryText ? `BUKTI KATA: "${primaryText.slice(0, 30)}"` : 'PARAGRAF 4: "...sofort, unverzüglich."'}
                  </text>
                </g>

                <g transform="translate(400, 450) rotate(-12)" opacity={stampSpring}>
                  <circle cx="50" cy="50" r="50" fill="none" stroke="#dc2626" strokeWidth="5" strokeDasharray="8 4" />
                  <text x="50" y="45" fill="#dc2626" fontSize="15" fontWeight="900" fontFamily="monospace" textAnchor="middle">
                    {stampText || 'TOP SECRET'}
                  </text>
                  <text x="50" y="65" fill="#dc2626" fontSize="12" fontWeight="700" fontFamily="monospace" textAnchor="middle">
                    BUKTI MATERIL
                  </text>
                </g>

                {/* Scanning Magnifying Glass */}
                {(() => {
                  const magX = 260 + Math.sin(frame * 0.1) * 90;
                  return (
                    <g transform={`translate(${magX}, 250)`}>
                      <circle cx="0" cy="0" r="48" fill="rgba(255,255,255,0.2)" stroke="#d97706" strokeWidth="8" />
                      <line x1="34" y1="34" x2="85" y2="85" stroke="#78350f" strokeWidth="12" strokeLinecap="round" />
                      <circle cx="-15" cy="-15" r="12" fill="#ffffff" opacity="0.6" />
                    </g>
                  );
                })()}
              </g>

              {/* Action Banner */}
              <g transform="translate(30, 30)">
                <rect x="0" y="0" width="820" height="55" fill="rgba(217, 119, 6, 0.95)" rx="8" />
                <text x="410" y="36" fill="#ffffff" fontSize="19" fontWeight="900" fontFamily="monospace" textAnchor="middle" letterSpacing="2">
                  {primaryText ? `🔍 BUKTI MATERIL: ${primaryText.slice(0, 36)}` : '🔍 BUKTI MATERIL: KESALAHAN KATA "SOFORT" (SEGERA)'}
                </text>
              </g>
            </g>
          )}

          {/* ======================================================== */}
          {/* SCENE O: DOMINO COLLAPSE (Efek Domino Geopolitik Runtuh)  */}
          {/* ======================================================== */}
          {(type === 'domino-collapse' || type === 'domino-effect') && (
            <g transform="translate(100, 390)">
              <rect x="0" y="0" width="880" height="780" fill="#030712" stroke="#374151" strokeWidth="4" rx="16" />

              <g transform="translate(40, 520)">
                {[0, 40, 80, 120, 160].map((gy) => (
                  <line key={gy} x1="0" y1={gy} x2="800" y2={gy} stroke="#1f2937" strokeWidth="2" />
                ))}
              </g>

              {/* Sequential Falling Domino Slabs (Tumbling Forward Left to Right) */}
              {(() => {
                let dominoList = [
                  { name: '1. TEMBOK BERLIN', sub: '9 NOV 1989', startF: 0, color: '#ef4444' },
                  { name: '2. POLANDIA & HUNGARIA', sub: 'DES 1989', startF: 16, color: '#f59e0b' },
                  { name: '3. CEKOSLOWAKIA', sub: '1990', startF: 32, color: '#38bdf8' },
                  { name: '4. PAKTA WARSAWA', sub: '1991', startF: 48, color: '#a855f7' },
                  { name: '5. UNI SOVIET', sub: '26 DES 1991', startF: 64, color: '#dc2626' },
                ];
                if (secondaryText && secondaryText.includes(',')) {
                  const parts = secondaryText.split(',').map((s) => s.trim()).filter(Boolean);
                  if (parts.length >= 3) {
                    const colors = ['#ef4444', '#f59e0b', '#38bdf8', '#a855f7', '#dc2626'];
                    dominoList = parts.slice(0, 5).map((p, idx) => ({
                      name: `${idx + 1}. ${p.toUpperCase().slice(0, 16)}`,
                      sub: `TAHAP ${idx + 1}`,
                      startF: idx * 16,
                      color: colors[idx % colors.length],
                    }));
                  }
                }
                return dominoList.map((domino, idx) => {
                  const tilt = interpolate(frame, [domino.startF, domino.startF + 14], [0, 68], {
                    extrapolateLeft: 'clamp',
                    extrapolateRight: 'clamp',
                  });
                  const dx = 150 + idx * 130;
                  const dy = 440;
                  return (
                    <g key={idx} transform={`translate(${dx}, ${dy})`}>
                      <g transform={`rotate(${tilt} 0 160)`}>
                        <rect x="-32" y="-120" width="64" height="280" fill="#1e293b" stroke={domino.color} strokeWidth="4" rx="6" />
                        <rect x="-28" y="-115" width="56" height="270" fill={domino.color} opacity="0.2" />
                        <text
                          x="-8"
                          y="0"
                          fill="#ffffff"
                          fontSize="14"
                          fontWeight="900"
                          fontFamily="'Montserrat', sans-serif"
                          transform="rotate(90 -8 0)"
                        >
                          {domino.name}
                        </text>
                        <text
                          x="14"
                          y="30"
                          fill="#cbd5e1"
                          fontSize="11"
                          fontWeight="bold"
                          fontFamily="monospace"
                          transform="rotate(90 14 30)"
                        >
                          {domino.sub}
                        </text>
                      </g>
                    </g>
                  );
                });
              })()}

              {/* Action Banner */}
              <g transform="translate(30, 30)">
                <rect x="0" y="0" width="820" height="55" fill="rgba(220, 38, 38, 0.95)" rx="8" />
                <text x="410" y="36" fill="#ffffff" fontSize="19" fontWeight="900" fontFamily="monospace" textAnchor="middle" letterSpacing="2">
                  {primaryText ? `💥 EFEK DOMINO: ${primaryText.slice(0, 36)}` : '💥 REKA ADEGAN: EFEK DOMINO RUNTUHNYA SEJARAH'}
                </text>
              </g>
            </g>
          )}

          {/* ======================================================== */}
          {/* SCENE P: MARITIME DISASTER (Kapal, Gunung Es, SOS Laut) */}
          {/* ======================================================== */}
          {(type === 'maritime-disaster' || type === 'ship-iceberg') && (
            <g transform="translate(100, 390)">
              <rect x="0" y="0" width="880" height="780" fill="#020617" stroke="#1e293b" strokeWidth="4" rx="16" />

              {/* Night Sky & Stars */}
              {[
                { x: 120, y: 120 }, { x: 260, y: 90 }, { x: 420, y: 140 },
                { x: 600, y: 80 }, { x: 740, y: 110 }, { x: 810, y: 160 },
              ].map((s, i) => (
                <circle key={i} cx={s.x} cy={s.y} r={1.5 + (i % 2)} fill="#ffffff" opacity={0.6 + Math.sin(frame * 0.2 + i) * 0.4} />
              ))}

              {/* Jagged Iceberg on Right */}
              <g transform="translate(580, 260)">
                <polygon points="120,380 40,240 100,160 170,120 230,190 280,380" fill="#0f172a" stroke="#38bdf8" strokeWidth="3" opacity="0.9" />
                <polygon points="100,160 170,120 180,240 110,260" fill="#38bdf8" opacity="0.25" />
                <text x="170" y="105" fill="#38bdf8" fontSize="14" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
                  GUNUNG ES (ICEBERG)
                </text>
              </g>

              {/* Tilting Ocean Liner Ship Silhouette */}
              {(() => {
                const shipTilt = interpolate(frame, [0, 60], [-8, -26], { extrapolateRight: 'clamp' });
                return (
                  <g transform={`translate(280, 480) rotate(${shipTilt})`}>
                    {/* Ship Hull */}
                    <polygon points="-220,40 -180,-20 160,-20 220,10 180,50 -200,50" fill="#090d16" stroke="#475569" strokeWidth="4" />
                    <rect x="-160" y="-55" width="280" height="35" fill="#1e293b" stroke="#64748b" strokeWidth="3" rx="2" />
                    {/* Smokestacks */}
                    {[-100, -30, 40, 110].map((cx, idx) => (
                      <g key={idx} transform={`translate(${cx}, -85)`}>
                        <rect x="-10" y="0" width="20" height="32" fill="#dc2626" stroke="#000" strokeWidth="2" />
                        <rect x="-10" y="0" width="20" height="10" fill="#000" />
                        {/* Smoke puffs */}
                        <circle cx={-5 - ((frame + idx * 8) % 20)} cy={-10 - ((frame * 2 + idx * 10) % 35)} r={8} fill="#475569" opacity="0.4" />
                      </g>
                    ))}
                    {/* Radio Mast & SOS Waves */}
                    <line x1="-30" y1="-85" x2="-30" y2="-150" stroke="#cbd5e1" strokeWidth="4" />
                    <circle cx="-30" cy="-150" r={16 + (frame % 28)} fill="none" stroke="#ef4444" strokeWidth="3" opacity={1 - (frame % 28) / 28} />
                    <text x="-30" y="-175" fill="#ef4444" fontSize="18" fontWeight="900" fontFamily="monospace" textAnchor="middle">
                      SOS ... --- ... CQD
                    </text>
                  </g>
                );
              })()}

              {/* Rolling Ocean Waves at Bottom */}
              <g transform="translate(0, 560)">
                <path
                  d={`M 0 60 Q 220 ${40 + Math.sin(frame * 0.1) * 15} 440 60 T 880 60 L 880 220 L 0 220 Z`}
                  fill="#031024"
                  stroke="#1e3a8a"
                  strokeWidth="4"
                />
                <path
                  d={`M 0 90 Q 200 ${80 + Math.cos(frame * 0.12) * 12} 400 90 T 880 90 L 880 220 L 0 220 Z`}
                  fill="#020817"
                  opacity="0.8"
                />
              </g>

              {/* Action Banner */}
              <g transform="translate(30, 30)">
                <rect x="0" y="0" width="820" height="55" fill="rgba(2, 132, 199, 0.95)" rx="8" />
                <text x="410" y="36" fill="#ffffff" fontSize="19" fontWeight="900" fontFamily="monospace" textAnchor="middle" letterSpacing="2">
                  {primaryText ? `🚢 REKA KEJADIAN: ${primaryText.slice(0, 36)}` : '🚢 REKA KEJADIAN: DETIK-DETIK BENCANA MARITIM'}
                </text>
              </g>
            </g>
          )}

          {/* ======================================================== */}
          {/* SCENE Q: REACTOR MELTDOWN (Reaktor Nuklir / Korseling)   */}
          {/* ======================================================== */}
          {(type === 'reactor-meltdown' || type === 'nuclear-disaster') && (
            <g transform="translate(100, 390)">
              <rect x="0" y="0" width="880" height="780" fill="#080305" stroke="#7f1d1d" strokeWidth="4" rx="16" />

              {/* Glowing Radiation Hazard Core */}
              <g transform="translate(440, 420)">
                {/* Radiation containment vessel */}
                <circle cx="0" cy="0" r="220" fill="#180709" stroke="#dc2626" strokeWidth="6" strokeDasharray="18 10" />
                <circle cx="0" cy="0" r={160 + pulse * 20} fill="none" stroke="#ef4444" strokeWidth="3" opacity="0.6" />

                {/* Nuclear Fuel Rods */}
                {[-100, -50, 0, 50, 100].map((rx, idx) => (
                  <g key={idx} transform={`translate(${rx}, -90)`}>
                    <rect x="-12" y="0" width="24" height="180" fill="#2d0607" stroke="#ef4444" strokeWidth="3" rx="4" />
                    <rect x="-8" y={idx % 2 === 0 ? frame % 60 : (frame * 1.5) % 60} width="16" height="40" fill="#f87171" opacity="0.85" rx="3" />
                  </g>
                ))}

                {/* Radiation Warning Trefoil */}
                <circle cx="0" cy="0" r="32" fill="#FFE600" stroke="#000" strokeWidth="4" />
                <circle cx="0" cy="0" r="10" fill="#000000" />
              </g>

              {/* Warning Overheat Gauge Display */}
              <g transform="translate(240, 120)">
                <rect x="0" y="0" width="400" height="90" fill="#1c0507" stroke="#ef4444" strokeWidth="3" rx="10" />
                <text x="200" y="38" fill="#fca5a5" fontSize="15" fontWeight="900" fontFamily="monospace" textAnchor="middle">
                  [!] {metricLabel || 'SUHU INTI REAKTOR'}
                </text>
                <text x="200" y="74" fill="#ef4444" fontSize="32" fontWeight="900" fontFamily="monospace" textAnchor="middle">
                  {metricValue || '3,820°C CRITICAL'}
                </text>
              </g>

              {/* Action Banner */}
              <g transform="translate(30, 30)">
                <rect x="0" y="0" width="820" height="55" fill="rgba(220, 38, 38, 0.95)" rx="8" />
                <text x="410" y="36" fill="#ffffff" fontSize="19" fontWeight="900" fontFamily="monospace" textAnchor="middle" letterSpacing="2">
                  {primaryText ? `☢️ REKA KEJADIAN: ${primaryText.slice(0, 36)}` : '☢️ REKA KEJADIAN: LONJAKAN RADIASI INTI REAKTOR'}
                </text>
              </g>
            </g>
          )}

          {/* ======================================================== */}
          {/* SCENE R: LABORATORY DISCOVERY (Petri Dish / Mikroskop)   */}
          {/* ======================================================== */}
          {(type === 'laboratory-discovery' || type === 'medical-breakthrough') && (
            <g transform="translate(100, 390)">
              <rect x="0" y="0" width="880" height="780" fill="#030d0a" stroke="#064e3b" strokeWidth="4" rx="16" />

              {/* Circular Petri Dish Glass */}
              <g transform="translate(440, 420)">
                <circle cx="0" cy="0" r="230" fill="#061c14" stroke="#059669" strokeWidth="6" />
                <circle cx="0" cy="0" r="215" fill="#042f22" stroke="#10b981" strokeWidth="2" strokeDasharray="12 8" />

                {/* Staph Bacteria Colonies (Yellow/Orange Dots) */}
                {Array.from({ length: 28 }).map((_, i) => {
                  const angle = (i / 28) * Math.PI * 2;
                  const dist = 110 + (i % 5) * 18;
                  const bx = Math.cos(angle) * dist;
                  const by = Math.sin(angle) * dist;
                  return (
                    <circle key={i} cx={bx} cy={by} r={6 + (i % 4)} fill="#f59e0b" stroke="#78350f" strokeWidth="2" opacity="0.85" />
                  );
                })}

                {/* Accidental Penicillium Mold Center */}
                <circle cx="0" cy="0" r="75" fill="rgba(16, 185, 129, 0.15)" stroke="#10b981" strokeWidth="4" strokeDasharray="8 6" />
                <circle cx="0" cy="0" r={45 + pulse * 6} fill="#047857" stroke="#34d399" strokeWidth="4" />
                <text x="0" y="6" fill="#ffffff" fontSize="12" fontWeight="900" fontFamily="monospace" textAnchor="middle">
                  PENICILLIUM
                </text>
                <text x="0" y="115" fill="#34d399" fontSize="13" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
                  ZONA INHIBISI BAKTERI
                </text>
              </g>

              {/* Microscope Reticle Crosshairs */}
              <g transform="translate(440, 420)">
                <line x1="-240" y1="0" x2="-85" y2="0" stroke="#34d399" strokeWidth="2" opacity="0.6" />
                <line x1="85" y1="0" x2="240" y2="0" stroke="#34d399" strokeWidth="2" opacity="0.6" />
                <line x1="0" y1="-240" x2="0" y2="-85" stroke="#34d399" strokeWidth="2" opacity="0.6" />
                <line x1="0" y1="85" x2="0" y2="240" stroke="#34d399" strokeWidth="2" opacity="0.6" />
              </g>

              {/* Action Banner */}
              <g transform="translate(30, 30)">
                <rect x="0" y="0" width="820" height="55" fill="rgba(5, 150, 105, 0.95)" rx="8" />
                <text x="410" y="36" fill="#ffffff" fontSize="19" fontWeight="900" fontFamily="monospace" textAnchor="middle" letterSpacing="2">
                  {primaryText ? `🔬 BUKTI FORENSIK: ${primaryText.slice(0, 36)}` : '🔬 BUKTI FORENSIK: KONTAMINASI TIDAK SENGAJA'}
                </text>
              </g>
            </g>
          )}

          {/* ======================================================== */}
          {/* SCENE S: FORENSIC DOSSIER (Universal High-Impact Default) */}
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
              'wall-demolition',
              'gate-breach',
              'domino-collapse',
              'press-podium',
              'memo-investigation',
              'maritime-disaster',
              'reactor-meltdown',
              'laboratory-discovery',
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
