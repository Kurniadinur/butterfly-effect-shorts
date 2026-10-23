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
  primaryText?: string;
  secondaryText?: string;
  stampText?: string;
  quoteText?: string;
  metricLabel?: string;
  metricValue?: string;
  accentColor?: string;
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
  accentColor = '#ef4444',
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
        <div>SYSTEM STATUS: ACTIVE CHRONO</div>
        <div>INCIDENT DOSSIER: #{locationTag.replace(/[^a-zA-Z0-9]/g, '-').slice(0, 15)}</div>
        <div>AI DIRECTOR ENGINE v3.0</div>
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
            <g>
              <rect x="100" y="680" width="880" height="920" fill="#0f172a" stroke="#334155" strokeWidth="4" rx="12" />
              <g transform="translate(240, 780)">
                <rect x="0" y="0" width="600" height="740" fill="#1e293b" stroke="#64748b" strokeWidth="4" rx="10" />
                <path d="M 0 0 L 220 0 L 260 40 L 600 40 L 600 740 L 0 740 Z" fill="#334155" opacity="0.4" />
                <rect x="40" y="70" width="520" height="620" fill="#f8fafc" stroke="#94a3b8" strokeWidth="2" rx="6" />

                <text x="70" y="130" fill="#0f172a" fontSize="22" fontWeight="900" fontFamily="'Montserrat', sans-serif">
                  {(primaryText || title || 'DOKUMEN RESMI').slice(0, 32)}
                </text>
                <text x="70" y="165" fill="#475569" fontSize="15" fontWeight="700" fontFamily="monospace">
                  {secondaryText || subtitle || 'DRAF BIROKRASI FORMAL'}
                </text>
                <line x1="70" y1="185" x2="490" y2="185" stroke="#cbd5e1" strokeWidth="3" />

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

                <g transform="translate(180, 480) rotate(-8)">
                  <rect x="0" y="0" width="320" height="85" fill="rgba(220, 38, 38, 0.15)" stroke="#dc2626" strokeWidth="4" strokeDasharray="8 4" rx="6" />
                  <text x="160" y="40" fill="#dc2626" fontSize="18" fontWeight="900" fontFamily="monospace" textAnchor="middle">
                    {stampText || 'CONFIDENTIAL'}
                  </text>
                  <text x="160" y="66" fill="#dc2626" fontSize="13" fontWeight="700" fontFamily="monospace" textAnchor="middle">
                    BIROKRASI KETAT
                  </text>
                </g>
              </g>

              <g transform="translate(260, 1600)">
                <rect x="0" y="0" width="560" height="70" fill="rgba(15, 23, 42, 0.95)" stroke="#64748b" strokeWidth="2" rx="8" />
                <text x="280" y="42" fill="#cbd5e1" fontSize="16" fontWeight="800" fontFamily="'Montserrat', sans-serif" textAnchor="middle">
                  {subtitle || 'DRAF KEPUTUSAN FORMAL'}
                </text>
              </g>
            </g>
          )}

          {/* ======================================================== */}
          {/* SCENE B: MEMO HANDOFF (Tangan Menyelipkan Kertas/Kunci)   */}
          {/* ======================================================== */}
          {type === 'memo-handoff' && (
            <g>
              <line x1="120" y1="1240" x2="960" y2="1240" stroke="#475569" strokeWidth="4" strokeDasharray="12 8" />
              <path
                d="M 100 1350 Q 250 1280 400 1220 L 450 1210 L 480 1230 L 430 1260 Q 280 1340 120 1420 Z"
                fill="rgba(30, 41, 59, 0.9)"
                stroke="#94a3b8"
                strokeWidth="5"
                strokeDasharray="800"
                strokeDashoffset={strokeProgress}
              />
              <path
                d="M 980 1360 Q 820 1290 680 1230 L 630 1220 L 610 1240 L 650 1270 Q 790 1350 960 1430 Z"
                fill="rgba(30, 41, 59, 0.9)"
                stroke="#94a3b8"
                strokeWidth="5"
                strokeDasharray="800"
                strokeDashoffset={strokeProgress}
              />

              <g transform="translate(430, 1020) rotate(-6)">
                <rect x="15" y="15" width="220" height="290" fill="rgba(0,0,0,0.6)" rx="6" />
                <rect x="0" y="0" width="220" height="290" fill="#f8fafc" stroke="#ef4444" strokeWidth="4" rx="6" />
                <rect x="25" y="30" width="170" height="42" fill="rgba(239, 68, 68, 0.15)" stroke="#ef4444" strokeWidth="2" rx="4" />
                <text x="110" y="58" fill="#ef4444" fontSize="18" fontWeight="900" fontFamily="monospace" textAnchor="middle" letterSpacing="2">
                  {stampText || 'TOP SECRET'}
                </text>
                <line x1="25" y1="100" x2="195" y2="100" stroke="#334155" strokeWidth="5" strokeLinecap="round" />
                <line x1="25" y1="125" x2="185" y2="125" stroke="#334155" strokeWidth="4" strokeLinecap="round" />
                <line x1="25" y1="150" x2="190" y2="150" stroke="#334155" strokeWidth="4" strokeLinecap="round" />
                <line x1="25" y1="175" x2="140" y2="175" stroke="#334155" strokeWidth="4" strokeLinecap="round" />
              </g>

              <path d="M 330 1140 C 400 1080 470 1060 550 1050" fill="none" stroke="#ef4444" strokeWidth="5" strokeDasharray="8 6" markerEnd="url(#dirArrow)" />
              <circle cx="540" cy="1160" r={160 + pulse * 12} fill="none" stroke="#ef4444" strokeWidth="3" strokeDasharray="14 10" />

              <g transform="translate(480, 860)">
                <rect x="0" y="0" width="510" height="85" fill="rgba(15, 23, 42, 0.96)" stroke="#ef4444" strokeWidth="3" rx="10" />
                <text x="24" y="34" fill="#ef4444" fontSize="14" fontWeight="900" fontFamily="monospace" letterSpacing="1.5">
                  [!] {primaryText || 'BUKTI FORENSIK UTAMA'}
                </text>
                <text x="24" y="64" fill="#f8fafc" fontSize="19" fontWeight="900" fontFamily="'Montserrat', sans-serif">
                  {title.length > 30 ? title.slice(0, 30) + '...' : title}
                </text>
              </g>
            </g>
          )}

          {/* ======================================================== */}
          {/* SCENE C: PRESS QUESTION (Interogasi Mikrofon)            */}
          {/* ======================================================== */}
          {type === 'press-question' && (
            <g>
              <polygon points="540,650 320,1580 760,1580" fill="url(#spotlightDir)" opacity="0.25" />
              <g transform="translate(460, 920)">
                <circle cx="80" cy="50" r="42" fill="#1e293b" stroke="#e2e8f0" strokeWidth="4" />
                <path d="M 30 110 L 130 110 L 160 380 L 0 380 Z" fill="#0f172a" stroke="#94a3b8" strokeWidth="4" />
                <path d="M 120 150 Q 180 130 210 70 L 230 80 Q 190 170 140 190 Z" fill="#1e293b" stroke="#e2e8f0" strokeWidth="4" />
                <rect x="215" y="45" width="22" height="40" fill="#f59e0b" rx="5" stroke="#ffffff" strokeWidth="2" />
                <line x1="226" y1="85" x2="226" y2="120" stroke="#94a3b8" strokeWidth="4" />
                <circle cx="226" cy="65" r={25 + pulse * 20} fill="none" stroke="#f59e0b" strokeWidth="3" opacity={1 - pulse * 0.7} />
                <circle cx="226" cy="65" r={50 + pulse * 30} fill="none" stroke="#f59e0b" strokeWidth="2" strokeDasharray="6 6" opacity={0.8 - pulse * 0.7} />
              </g>

              <g transform="translate(140, 820)">
                <rect x="0" y="0" width="540" height="95" fill="rgba(15, 23, 42, 0.96)" stroke="#f59e0b" strokeWidth="3" rx="10" />
                <polygon points="370,95 400,95 415,130" fill="#f59e0b" />
                <text x="24" y="34" fill="#f59e0b" fontSize="13" fontWeight="bold" fontFamily="monospace" letterSpacing="1">
                  {locationTag || 'PERTANYAAN KRUSIAL'}
                </text>
                <text x="24" y="68" fill="#ffffff" fontSize="21" fontWeight="900" fontFamily="'Montserrat', sans-serif">
                  "{quoteText || title}"
                </text>
              </g>
            </g>
          )}

          {/* ======================================================== */}
          {/* SCENE D: SCHABOWSKI SLIP (Kepanikan & Ucapan Fatal)      */}
          {/* ======================================================== */}
          {type === 'schabowski-slip' && (
            <g>
              <rect x="140" y="900" width="800" height="600" fill="#0f172a" stroke="#475569" strokeWidth="5" rx="14" />
              <g transform={`translate(${540 + jitterX * 2}, ${1040 + jitterY * 2}) rotate(18)`}>
                <circle cx="-65" cy="0" r="48" fill="rgba(255,255,255,0.2)" stroke="#111827" strokeWidth="10" />
                <circle cx="65" cy="0" r="48" fill="rgba(255,255,255,0.2)" stroke="#111827" strokeWidth="10" />
                <path d="M -18 0 Q 0 -15 18 0" fill="none" stroke="#111827" strokeWidth="8" />
                <line x1="-113" y1="0" x2="-160" y2="-40" stroke="#111827" strokeWidth="7" />
                <line x1="113" y1="0" x2="160" y2="-40" stroke="#111827" strokeWidth="7" />
              </g>

              <g transform="translate(180, 1340)">
                <rect x="0" y="0" width="720" height="110" fill="#dc2626" stroke="#ffffff" strokeWidth="4" rx="10" />
                <text x="360" y="44" fill="#ffffff" fontSize="18" fontWeight="900" fontFamily="monospace" textAnchor="middle" letterSpacing="2">
                  "{secondaryText || 'UCAPAN FATAL PENENTU SEJARAH'}"
                </text>
                <text x="360" y="85" fill="#FFE600" fontSize="28" fontWeight="900" fontFamily="'Montserrat', sans-serif" textAnchor="middle">
                  {quoteText || title}
                </text>
              </g>

              <g transform="translate(700, 920)">
                <rect x="0" y="0" width="220" height="46" fill="#0f172a" stroke="#f59e0b" strokeWidth="2" rx="6" />
                <text x="110" y="30" fill="#f59e0b" fontSize="15" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
                  {primaryText || locationTag || 'DETIK PALING FATAL'}
                </text>
              </g>
            </g>
          )}

          {/* ======================================================== */}
          {/* SCENE E: BREAKING NEWS (TV Siaran Darurat)               */}
          {/* ======================================================== */}
          {type === 'breaking-news' && (
            <g>
              <rect x="80" y="680" width="920" height="880" fill="#0f172a" stroke="#475569" strokeWidth="8" rx="28" />
              <rect x="120" y="720" width="840" height="800" fill="#020617" stroke="#1e293b" strokeWidth="4" rx="20" />

              <g transform="translate(540, 980)">
                <path d="M 0 -120 L -60 140 L 60 140 Z" fill="none" stroke="#38bdf8" strokeWidth="4" />
                <circle cx="0" cy="-120" r="16" fill="#ef4444" />
                <circle cx="0" cy="-120" r={40 + pulse * 60} fill="none" stroke="#ef4444" strokeWidth="4" opacity={1 - pulse * 0.8} />
                <circle cx="0" cy="-120" r={80 + pulse * 90} fill="none" stroke="#ef4444" strokeWidth="3" strokeDasharray="8 6" opacity={0.8 - pulse * 0.8} />
              </g>

              <g transform="translate(120, 1260)">
                <rect x="0" y="0" width="840" height="70" fill="#dc2626" />
                <text x="30" y="44" fill="#ffffff" fontSize="24" fontWeight="900" fontFamily="monospace" letterSpacing="3">
                  🔴 {primaryText || 'BREAKING NEWS // SIARAN DARURAT'}
                </text>
                <rect x="0" y="70" width="840" height="110" fill="rgba(15, 23, 42, 0.96)" />
                <text x="30" y="118" fill="#FFE600" fontSize="28" fontWeight="900" fontFamily="'Montserrat', sans-serif">
                  {title}
                </text>
                <text x="30" y="155" fill="#f8fafc" fontSize="17" fontWeight="700" fontFamily="monospace">
                  {subtitle}
                </text>
              </g>
            </g>
          )}

          {/* ======================================================== */}
          {/* SCENE F: PANIC PHONE (Telepon Darurat Pos Penjagaan)      */}
          {/* ======================================================== */}
          {type === 'panic-phone' && (
            <g>
              <rect x="180" y="720" width="720" height="680" fill="rgba(10, 15, 25, 0.9)" stroke="#475569" strokeWidth="6" rx="12" />
              <circle cx="780" cy="850" r="50" fill="#0f172a" stroke="#ef4444" strokeWidth="4" />
              <line x1="780" y1="850" x2="780" y2="815" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" />
              <line x1="780" y1="850" x2="805" y2="865" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" />
              <text x="780" y="925" fill="#ef4444" fontSize="14" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
                {primaryText || locationTag || 'ALARM'}
              </text>

              <g transform={`translate(${540 + jitterX * 2}, ${1080 + jitterY * 2})`}>
                <rect x="-180" y="-120" width="360" height="240" fill="#1e293b" stroke="#dc2626" strokeWidth="5" rx="14" />
                <circle cx="0" cy="0" r={45 + pulse * 15} fill="none" stroke="#ef4444" strokeWidth="3" strokeDasharray="8 6" />
                <circle cx="0" cy="0" r="30" fill="#dc2626" />
                <text x="0" y="8" fill="#ffffff" fontSize="24" fontWeight="900" fontFamily="monospace" textAnchor="middle">
                  SOS
                </text>
              </g>

              <g transform="translate(180, 1340)">
                <rect x="0" y="0" width="720" height="90" fill="#dc2626" stroke="#ffffff" strokeWidth="3" rx="8" />
                <text x="360" y="38" fill="#ffffff" fontSize="16" fontWeight="900" fontFamily="monospace" textAnchor="middle">
                  {secondaryText || 'DARURAT // TENTARA TANPA PERINTAH'}
                </text>
                <text x="360" y="70" fill="#ffffff" fontSize="22" fontWeight="900" fontFamily="'Montserrat', sans-serif" textAnchor="middle">
                  {title}
                </text>
              </g>
            </g>
          )}

          {/* ======================================================== */}
          {/* SCENE G: SOVIET COLLAPSE (Peta Geopolitik Pecah)         */}
          {/* ======================================================== */}
          {type === 'soviet-collapse' && (
            <g>
              <g transform="translate(200, 780)">
                <rect x="0" y="0" width="680" height="540" fill="rgba(15, 23, 42, 0.9)" stroke="#ef4444" strokeWidth="3" strokeDasharray="10 8" rx="12" />
                {[
                  [120, 180, 'ZONE A'],
                  [150, 220, 'ZONE B'],
                  [180, 370, 'ZONE C'],
                  [300, 390, 'ZONE D'],
                  [420, 350, 'ZONE E'],
                  [480, 220, 'CENTER'],
                ].map(([cx, cy, label], idx) => (
                  <g key={idx} transform={`translate(${cx}, ${cy})`}>
                    <circle cx="0" cy="0" r="10" fill="#FFE600" stroke="#000" strokeWidth="2" />
                    <text x="14" y="5" fill="#f8fafc" fontSize="12" fontWeight="bold" fontFamily="monospace">
                      {label}
                    </text>
                  </g>
                ))}
              </g>

              <g transform="translate(180, 1380)">
                <rect x="0" y="0" width="720" height="95" fill="rgba(15, 23, 42, 0.96)" stroke="#ef4444" strokeWidth="3" rx="10" />
                <text x="360" y="38" fill="#ef4444" fontSize="16" fontWeight="900" fontFamily="monospace" textAnchor="middle" letterSpacing="2">
                  {primaryText || 'DOMINO EFFECT // RUNTUHNYA KEKUATAN'}
                </text>
                <text x="360" y="72" fill="#ffffff" fontSize="24" fontWeight="900" fontFamily="'Montserrat', sans-serif" textAnchor="middle">
                  {title}
                </text>
              </g>
            </g>
          )}

          {/* ======================================================== */}
          {/* SCENE H: TACTICAL MAP / RADAR INCIDENT                   */}
          {/* ======================================================== */}
          {type === 'tactical-map' && (
            <g transform="translate(140, 720)">
              <circle cx="400" cy="400" r="360" fill="#09131f" stroke="#38bdf8" strokeWidth="4" />
              <circle cx="400" cy="400" r="260" fill="none" stroke="rgba(56, 189, 248, 0.4)" strokeWidth="2" strokeDasharray="6 6" />
              <circle cx="400" cy="400" r="150" fill="none" stroke="rgba(56, 189, 248, 0.5)" strokeWidth="2" />
              <circle cx="400" cy="400" r="50" fill="none" stroke="rgba(56, 189, 248, 0.7)" strokeWidth="2" />

              <line x1="40" y1="400" x2="760" y2="400" stroke="rgba(56, 189, 248, 0.3)" strokeWidth="2" />
              <line x1="400" y1="40" x2="400" y2="760" stroke="rgba(56, 189, 248, 0.3)" strokeWidth="2" />

              <line
                x1="400"
                y1="400"
                x2={400 + Math.cos(frame * 0.08) * 350}
                y2={400 + Math.sin(frame * 0.08) * 350}
                stroke="#38bdf8"
                strokeWidth="4"
                opacity="0.9"
              />

              <circle cx="480" cy="320" r={20 + pulse * 25} fill="none" stroke="#ef4444" strokeWidth="3" opacity={1 - pulse * 0.8} />
              <circle cx="480" cy="320" r="10" fill="#ef4444" />
              <text x="505" y="325" fill="#ef4444" fontSize="16" fontWeight="bold" fontFamily="monospace">
                {secondaryText || 'TARGET EPICENTER'}
              </text>

              <g transform="translate(40, 800)">
                <rect x="0" y="0" width="720" height="90" fill="rgba(15, 23, 42, 0.95)" stroke="#38bdf8" strokeWidth="2" rx="8" />
                <text x="360" y="36" fill="#38bdf8" fontSize="15" fontWeight="bold" fontFamily="monospace" textAnchor="middle" letterSpacing="2">
                  {primaryText || 'TACTICAL SURVEILLANCE • LIVE VECTOR'}
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
              <rect x="0" y="0" width="800" height="800" fill="#0b0f19" stroke="#ef4444" strokeWidth="4" rx="16" />

              <rect x="10" y="10" width="780" height="40" fill="#f59e0b" />
              <text x="400" y="36" fill="#000000" fontSize="17" fontWeight="900" fontFamily="monospace" textAnchor="middle" letterSpacing="3">
                ⚠ {primaryText || 'HAZARD LEVEL CRITICAL // SYSTEM OVERLOAD'} ⚠
              </text>

              <g transform="translate(400, 420)">
                <circle cx="0" cy="0" r="220" fill="#1e293b" stroke="#64748b" strokeWidth="6" />
                <path d="M 0 -220 A 220 220 0 0 1 220 0" fill="none" stroke="#ef4444" strokeWidth="24" strokeLinecap="round" />
                <path d="M -220 0 A 220 220 0 0 1 0 -220" fill="none" stroke="#f59e0b" strokeWidth="16" />

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
                  {metricValue || '98.7%'}
                </text>
                <text x="0" y="115" fill="#94a3b8" fontSize="15" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
                  {metricLabel || 'MAX THRESHOLD EXCEEDED'}
                </text>
              </g>

              <g transform="translate(40, 710)">
                <rect x="0" y="0" width="720" height="70" fill="#dc2626" rx="8" opacity={0.85 + pulse * 0.15} />
                <text x="360" y="44" fill="#ffffff" fontSize="21" fontWeight="900" fontFamily="'Montserrat', sans-serif" textAnchor="middle">
                  {title}
                </text>
              </g>
            </g>
          )}

          {/* ======================================================== */}
          {/* SCENE J: BREAKING TICKER / GLOBAL BROADCAST               */}
          {/* ======================================================== */}
          {type === 'breaking-ticker' && (
            <g transform="translate(140, 720)">
              <rect x="0" y="0" width="800" height="780" fill="#0a0e17" stroke="#334155" strokeWidth="6" rx="18" />
              <rect x="30" y="30" width="740" height="580" fill="#0f172a" stroke="#1e293b" strokeWidth="3" rx="10" />

              <g transform="translate(60, 70)">
                <circle cx="12" cy="12" r="10" fill="#ef4444" />
                <text x="32" y="19" fill="#ef4444" fontSize="18" fontWeight="900" fontFamily="monospace" letterSpacing="2">
                  LIVE SATELLITE FEED // {primaryText || 'GLOBAL BROADCAST'}
                </text>
              </g>

              <path
                d={`M 60 320 Q 200 ${320 + Math.sin(frame * 0.3) * 60}, 400 320 T 740 320`}
                fill="none"
                stroke="#38bdf8"
                strokeWidth="4"
              />

              <g transform="translate(30, 630)">
                <rect x="0" y="0" width="740" height="110" fill="#dc2626" rx="8" />
                <rect x="0" y="0" width="220" height="110" fill="#991b1b" rx="8" />
                <text x="110" y="65" fill="#ffffff" fontSize="20" fontWeight="900" fontFamily="monospace" textAnchor="middle">
                  {secondaryText || 'URGENT'}
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
              <rect x="0" y="0" width="800" height="820" fill="#1e293b" stroke="#475569" strokeWidth="4" rx="14" />
              <path d="M 0 0 L 260 0 L 300 45 L 800 45 L 800 820 L 0 820 Z" fill="#334155" opacity="0.5" />

              <rect x="40" y="70" width="720" height="710" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="2" rx="8" />
              <rect x="80" y="45" width="24" height="85" fill="none" stroke="#94a3b8" strokeWidth="5" rx="10" />

              <text x="130" y="130" fill="#0f172a" fontSize="26" fontWeight="900" fontFamily="'Montserrat', sans-serif">
                {primaryText || 'DEKLASIFIKASI BERKAS PENYELIDIKAN'}
              </text>
              <text x="130" y="165" fill="#475569" fontSize="16" fontWeight="700" fontFamily="monospace">
                KASUS: {locationTag || 'EFEK DOMINO SEJARAH'}
              </text>
              <line x1="80" y1="190" x2="680" y2="190" stroke="#cbd5e1" strokeWidth="3" />

              <rect x="80" y="220" width="600" height="120" fill="#f1f5f9" stroke="#94a3b8" strokeWidth="2" rx="6" />
              <text x="110" y="270" fill="#0f172a" fontSize="24" fontWeight="900" fontFamily="'Montserrat', sans-serif">
                {title.length > 32 ? title.slice(0, 32) + '...' : title}
              </text>
              <text x="110" y="310" fill="#475569" fontSize="16" fontWeight="600" fontFamily="monospace">
                LOKASI: {locationTag}
              </text>

              <g transform="translate(80, 370)">
                <rect x="0" y="0" width="600" height="280" fill="#0f172a" stroke="#334155" strokeWidth="2" rx="6" />
                <line x1="0" y1="140" x2="600" y2="140" stroke="rgba(255, 255, 255, 0.1)" strokeWidth="1" strokeDasharray="4 4" />
                <line x1="300" y1="0" x2="300" y2="280" stroke="rgba(255, 255, 255, 0.1)" strokeWidth="1" strokeDasharray="4 4" />
                <circle cx="300" cy="140" r="70" fill="none" stroke="#FFE600" strokeWidth="2" />
                <text x="300" y="145" fill="#FFE600" fontSize="16" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
                  REKA KEJADIAN FORENSIK
                </text>
                <text x="300" y="175" fill="#94a3b8" fontSize="13" fontFamily="monospace" textAnchor="middle">
                  {subtitle || 'BUKTI MATERIL & CHRONO-TRACE'}
                </text>
              </g>

              <g transform={`translate(420, 640) rotate(-12)`} opacity={stampSpring}>
                <rect x="-15" y="-12" width="270" height="60" fill="none" stroke="#ef4444" strokeWidth="4" rx="4" />
                <text x="120" y="30" fill="#ef4444" fontSize="22" fontWeight="900" fontFamily="monospace" textAnchor="middle" letterSpacing="4">
                  {stampText || 'TOP SECRET'}
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
