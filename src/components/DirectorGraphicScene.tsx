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
  | 'clock-countdown'
  | 'key-lockbox'
  | 'car-route'
  | 'radiation-hazard'
  | 'valve-failure'
  | 'telegraph-wire'
  | 'crowd-protest'
  | 'courtroom-gavel'
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
        backgroundColor: 'transparent',
        overflow: 'hidden',
      }}
    >
      {/* 1. Deep Cinematic Vignette & Atmospheric Radial Lighting (Blends with AtmosphericBackground) */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse at 50% 45%, rgba(15, 23, 42, 0.2) 0%, rgba(7, 10, 19, 0.45) 60%, rgba(2, 4, 8, 0.75) 100%)',
          opacity: 0.35,
        }}
      />

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
            <g transform="translate(190, 430)">
              {/* Organic Document Paper on Desk with Realistic Drop Shadow */}
              <g style={{ filter: 'drop-shadow(0 20px 35px rgba(0,0,0,0.85))' }}>
                <rect x="0" y="0" width="700" height="720" fill="#f8fafc" rx="8" />

                <text x="50" y="70" fill="#0f172a" fontSize="24" fontWeight="900" fontFamily="'Montserrat', sans-serif">
                  {(primaryText || title || 'DOKUMEN RESMI').slice(0, 32)}
                </text>
                <text x="50" y="105" fill="#475569" fontSize="15" fontWeight="700" fontFamily="monospace">
                  {secondaryText || subtitle || 'DRAF BIROKRASI FORMAL'}
                </text>
                <line x1="50" y1="125" x2="650" y2="125" stroke="#cbd5e1" strokeWidth="3" />

                {[165, 205, 245, 285, 325, 365, 415, 455, 495, 535].map((y, idx) => (
                  <line
                    key={idx}
                    x1="50"
                    y1={y}
                    x2={idx % 2 === 0 ? 650 : 560}
                    y2={y}
                    stroke="#94a3b8"
                    strokeWidth="5"
                    strokeLinecap="round"
                  />
                ))}

                <g transform="translate(340, 560) rotate(-8)">
                  <rect x="0" y="0" width="310" height="80" fill="rgba(220, 38, 38, 0.15)" stroke="#dc2626" strokeWidth="4" strokeDasharray="8 4" rx="6" />
                  <text x="155" y="40" fill="#dc2626" fontSize="20" fontWeight="900" fontFamily="monospace" textAnchor="middle">
                    {stampText || 'CONFIDENTIAL'}
                  </text>
                  <text x="155" y="65" fill="#dc2626" fontSize="13" fontWeight="700" fontFamily="monospace" textAnchor="middle">
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
              <line x1="120" y1="1100" x2="960" y2="1100" stroke="#475569" strokeWidth="4" strokeDasharray="12 8" opacity="0.5" />
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

              <g transform="translate(430, 880) rotate(-6)" style={{ filter: 'drop-shadow(0 15px 30px rgba(0,0,0,0.8))' }}>
                <rect x="0" y="0" width="220" height="280" fill="#f8fafc" rx="6" />
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
            </g>
          )}

          {/* ======================================================== */}
          {/* SCENE C: PRESS QUESTION (Interogasi Mikrofon Forensik)   */}
          {/* ======================================================== */}
          {type === 'press-question' && (
            <g transform="translate(100, 360)">
              {/* Overhead Spotlight Beam onto Press Table */}
              <polygon points="440,0 120,680 760,680" fill="url(#spotlightDir)" opacity="0.22" />

              {/* Main Press Conference Podium / Desk */}
              <g style={{ filter: 'drop-shadow(0 25px 50px rgba(0,0,0,0.85))' }}>
                {/* Woodgrain & Steel Conference Table Edge */}
                <rect x="40" y="580" width="800" height="140" fill="#1e293b" stroke="#334155" strokeWidth="4" rx="8" />
                <rect x="40" y="580" width="800" height="20" fill="#334155" />
                <line x1="40" y1="600" x2="840" y2="600" stroke="#f59e0b" strokeWidth="3" opacity="0.8" />

                {/* Live Microphone Stand 1 (Left - German Rundfunk Style) */}
                <g transform="translate(260, 520) rotate(-16)">
                  <line x1="0" y1="80" x2="0" y2="-80" stroke="#64748b" strokeWidth="8" strokeLinecap="round" />
                  <rect x="-18" y="-120" width="36" height="55" fill="#475569" stroke="#cbd5e1" strokeWidth="3" rx="8" />
                  <line x1="-12" y1="-105" x2="12" y2="-105" stroke="#94a3b8" strokeWidth="2" />
                  <line x1="-12" y1="-95" x2="12" y2="-95" stroke="#94a3b8" strokeWidth="2" />
                  <line x1="-12" y1="-85" x2="12" y2="-85" stroke="#94a3b8" strokeWidth="2" />
                  <rect x="-8" y="-65" width="16" height="12" fill="#ef4444" rx="2" />
                </g>

                {/* Live Microphone Stand 2 (Center - Broadcast Cardioid Mic) */}
                <g transform="translate(440, 480)">
                  <line x1="0" y1="120" x2="0" y2="-90" stroke="#94a3b8" strokeWidth="10" strokeLinecap="round" />
                  <circle cx="0" cy="110" r="30" fill="#0f172a" stroke="#475569" strokeWidth="4" />
                  <circle cx="0" cy="-110" r="28" fill="#1e293b" stroke="#f8fafc" strokeWidth="3" />
                  <circle cx="0" cy="-110" r="22" fill="#334155" stroke="#94a3b8" strokeWidth="2" strokeDasharray="4 2" />
                  {/* Concentric Audio Pulse Waves */}
                  <circle cx="0" cy="-110" r={40 + pulse * 28} fill="none" stroke="#f59e0b" strokeWidth="2.5" opacity={1 - pulse * 0.8} />
                  <circle cx="0" cy="-110" r={70 + pulse * 38} fill="none" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="6 4" opacity={0.7 - pulse * 0.6} />
                </g>

                {/* Live Microphone Stand 3 (Right - Italian ANSA Reporter Style) */}
                <g transform="translate(620, 520) rotate(16)">
                  <line x1="0" y1="80" x2="0" y2="-80" stroke="#64748b" strokeWidth="8" strokeLinecap="round" />
                  <rect x="-18" y="-120" width="36" height="55" fill="#475569" stroke="#cbd5e1" strokeWidth="3" rx="8" />
                  <line x1="-12" y1="-105" x2="12" y2="-105" stroke="#94a3b8" strokeWidth="2" />
                  <line x1="-12" y1="-95" x2="12" y2="-95" stroke="#94a3b8" strokeWidth="2" />
                  <line x1="-12" y1="-85" x2="12" y2="-85" stroke="#94a3b8" strokeWidth="2" />
                  <rect x="-8" y="-65" width="16" height="12" fill="#38bdf8" rx="2" />
                </g>

                {/* Reporter Accreditation Badge on Table */}
                <g transform="translate(100, 620) rotate(-4)">
                  <rect x="0" y="0" width="180" height="70" fill="#f8fafc" stroke="#94a3b8" strokeWidth="2" rx="4" />
                  <rect x="0" y="0" width="180" height="16" fill="#dc2626" />
                  <text x="90" y="12" fill="#ffffff" fontSize="9" fontWeight="900" fontFamily="monospace" textAnchor="middle">
                    PRESS CORPS // ACCREDITED
                  </text>
                  <text x="90" y="42" fill="#0f172a" fontSize="13" fontWeight="900" fontFamily="monospace" textAnchor="middle">
                    P. BRUSCHINI (ANSA)
                  </text>
                  <line x1="20" y1="54" x2="160" y2="54" stroke="#cbd5e1" strokeWidth="2" />
                </g>

                {/* Audio Oscilloscope / Frequency VU Bars on Desk */}
                <g transform="translate(340, 625)">
                  {Array.from({ length: 16 }).map((_, i) => {
                    const barH = Math.abs(Math.sin(frame * 0.25 + i * 0.4)) * 38 + 8;
                    return (
                      <rect
                        key={i}
                        x={i * 16}
                        y={50 - barH}
                        width="11"
                        height={barH}
                        fill={barH > 35 ? '#ef4444' : barH > 22 ? '#f59e0b' : '#38bdf8'}
                        rx="2"
                      />
                    );
                  })}
                </g>

                {/* Live Transmission Status Badge */}
                <g transform="translate(640, 630)">
                  <rect x="0" y="0" width="160" height="42" fill="#020617" stroke="#ef4444" strokeWidth="2" rx="4" />
                  <circle cx="22" cy="21" r="7" fill={pulse > 0.4 ? '#ef4444' : '#7f1d1d'} />
                  <text x="40" y="26" fill="#f8fafc" fontSize="12" fontWeight="900" fontFamily="monospace">
                    LIVE ON AIR
                  </text>
                </g>
              </g>

              {/* Journalist Question Callout Card */}
              <g transform="translate(100, 180)" style={{ filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.9))' }}>
                <rect x="0" y="0" width="680" height="150" fill="rgba(15, 23, 42, 0.96)" stroke="#38bdf8" strokeWidth="3" rx="10" />
                <rect x="0" y="0" width="12" height="150" fill="#38bdf8" />

                <text x="35" y="42" fill="#38bdf8" fontSize="14" fontWeight="900" fontFamily="monospace" letterSpacing="2">
                  PERTANYAAN WARTAWAN // VERBATIM:
                </text>

                <text
                  x="35"
                  y="95"
                  fill="#FFE600"
                  fontSize="27"
                  fontWeight="900"
                  fontFamily="'Montserrat', sans-serif"
                  style={{ filter: 'drop-shadow(0 2px 10px rgba(0,0,0,0.8))' }}
                >
                  "{quoteText || primaryText || 'Kapan peraturan ini mulai berlaku?'}"
                </text>

                <text x="35" y="130" fill="#94a3b8" fontSize="14" fontWeight="700" fontFamily="monospace">
                  {secondaryText || 'Pertanyaan mendadak tanpa jawaban di naskah'}
                </text>
              </g>
            </g>
          )}

          {/* ======================================================== */}
          {/* SCENE D: AUDIO SPECTRUM & TRANSCRIPT (Kutipan Suara Asli) */}
          {/* ======================================================== */}
          {(type === 'schabowski-slip' || type === 'audio-spectrogram') && (
            <g transform="translate(120, 420)">
              {/* Real Audio Waveform Oscilloscope Display */}
              <g transform="translate(40, 60)">
                <text x="20" y="30" fill="#94a3b8" fontSize="14" fontWeight="bold" fontFamily="monospace" letterSpacing="1">
                  AUDIO FREQUENCY SPECTROGRAM • {locationTag || 'TRANSMISSION FEED'}
                </text>

                {/* 24 Dynamic Audio Bars */}
                {Array.from({ length: 24 }).map((_, i) => {
                  const h = Math.abs(Math.sin(frame * 0.2 + i * 0.45)) * 110 + 20;
                  const barX = 40 + i * 29;
                  const isPeak = h > 95;
                  return (
                    <rect
                      key={i}
                      x={barX}
                      y={180 - h}
                      width="18"
                      height={h}
                      fill={isPeak ? '#ef4444' : '#38bdf8'}
                      rx="3"
                      opacity={0.85 + Math.sin(frame * 0.3 + i) * 0.15}
                    />
                  );
                })}
              </g>

              {/* Official Quote Paper Container with Realistic Shadow */}
              <g transform="translate(40, 300)" style={{ filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.85))' }}>
                <rect x="0" y="0" width="760" height="260" fill="#1e293b" rx="10" />

                <text x="30" y="55" fill="#ef4444" fontSize="15" fontWeight="900" fontFamily="monospace" letterSpacing="2">
                  TRANSKRIP REKAMAN FORENSIK:
                </text>

                <text x="30" y="110" fill="#FFE600" fontSize="28" fontWeight="900" fontFamily="'Montserrat', sans-serif">
                  {quoteText || primaryText || 'PERNYATAAN RESMI SAKSI KUNCI'}
                </text>
                <text x="30" y="155" fill="#f8fafc" fontSize="26" fontWeight="900" fontFamily="'Montserrat', sans-serif">
                  {secondaryText || 'Diverifikasi Tanpa Penundaan'}
                </text>

                <line x1="30" y1="185" x2="730" y2="185" stroke="#334155" strokeWidth="2" strokeDasharray="6 4" />

                <text x="30" y="225" fill="#38bdf8" fontSize="20" fontWeight="900" fontFamily="monospace">
                  STATUS: {stampText || 'VERIFIED RECORDING'} • {metricValue || '100% MATCH'}
                </text>
              </g>
            </g>
          )}

          {/* ======================================================== */}
          {/* SCENE E: BREAKING NEWS (TV Siaran Darurat)               */}
          {/* ======================================================== */}
          {type === 'breaking-news' && (
            <g transform="translate(140, 440)">
              {/* Broadcast Tower & Signal Pulses */}
              <g transform="translate(400, 220)">
                <path d="M 0 -120 L -60 140 L 60 140 Z" fill="none" stroke="#38bdf8" strokeWidth="5" />
                <circle cx="0" cy="-120" r="16" fill="#ef4444" />
                <circle cx="0" cy="-120" r={40 + pulse * 60} fill="none" stroke="#ef4444" strokeWidth="4" opacity={1 - pulse * 0.8} />
                <circle cx="0" cy="-120" r={80 + pulse * 100} fill="none" stroke="#ef4444" strokeWidth="3" strokeDasharray="8 6" opacity={0.8 - pulse * 0.8} />
              </g>

              {/* Clean Lower-Third Broadcast Strap */}
              <g transform="translate(0, 520)" style={{ filter: 'drop-shadow(0 15px 30px rgba(0,0,0,0.8))' }}>
                <rect x="0" y="0" width="800" height="50" fill="#dc2626" rx="4" />
                <text x="25" y="33" fill="#ffffff" fontSize="22" fontWeight="900" fontFamily="monospace" letterSpacing="3">
                  🔴 {primaryText || 'BREAKING NEWS // SIARAN TELEVISI DUNIA'}
                </text>
                <text x="25" y="95" fill="#FFE600" fontSize="28" fontWeight="900" fontFamily="'Montserrat', sans-serif">
                  {title}
                </text>
              </g>
            </g>
          )}

          {/* ======================================================== */}
          {/* SCENE F: PANIC PHONE (Telepon Darurat Pos Penjagaan)      */}
          {/* ======================================================== */}
          {type === 'panic-phone' && (
            <g transform="translate(140, 430)">
              {/* Flashing Emergency Alarm Beacon */}
              <circle cx="400" cy="180" r={60 + pulse * 35} fill="none" stroke="#ef4444" strokeWidth="4" opacity={1 - pulse * 0.7} />
              <circle cx="400" cy="180" r="40" fill="#ef4444" style={{ filter: 'drop-shadow(0 0 25px #ef4444)' }} />

              {/* Rotary Phone Base with Soundwaves */}
              <g transform="translate(400, 420)">
                <rect x="-160" y="-100" width="320" height="200" fill="#1e293b" rx="14" style={{ filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.8))' }} />
                <circle cx="0" cy="0" r="45" fill="#0f172a" />
                <circle cx="0" cy="0" r="30" fill="#dc2626" />
                <text x="0" y="8" fill="#ffffff" fontSize="22" fontWeight="900" fontFamily="monospace" textAnchor="middle">
                  SOS
                </text>

                {/* Ringing Soundwaves */}
                {[-1, 1].map((dir) => (
                  <path
                    key={dir}
                    d={`M ${dir * 180} -50 Q ${dir * (220 + pulse * 20)} 0 ${dir * 180} 50`}
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth="5"
                    strokeLinecap="round"
                  />
                ))}
              </g>
            </g>
          )}

          {/* ======================================================== */}
          {/* SCENE G: GEOPOLITICAL COLLAPSE (Peta Wilayah Terpecah)   */}
          {/* ======================================================== */}
          {(type === 'soviet-collapse' || type === 'systemic-collapse') && (
            <g transform="translate(140, 420)">
              <g transform="translate(80, 80)">
                {(() => {
                  let points = [
                    [120, 160, 'SEKTOR 1'],
                    [190, 240, 'SEKTOR 2'],
                    [260, 320, 'SEKTOR 3'],
                    [390, 340, 'SEKTOR 4'],
                    [500, 200, 'EPISENTRUM'],
                  ];
                  if (secondaryText && secondaryText.includes(',')) {
                    const parts = secondaryText.split(',').map((s) => s.trim().toUpperCase());
                    points = parts.slice(0, 5).map((label, idx) => {
                      const baseCoords = [
                        [120, 160],
                        [190, 240],
                        [260, 320],
                        [390, 340],
                        [500, 200],
                      ];
                      return [baseCoords[idx][0], baseCoords[idx][1], label.slice(0, 14)];
                    });
                  }
                  return points.map(([cx, cy, label], idx) => (
                    <g key={idx} transform={`translate(${cx}, ${cy})`}>
                      <circle cx="0" cy="0" r="14" fill="#FFE600" stroke="#000" strokeWidth="3" />
                      <circle cx="0" cy="0" r={24 + pulse * 12} fill="none" stroke="#FFE600" strokeWidth="2" opacity={1 - pulse * 0.7} />
                      <text x="24" y="6" fill="#f8fafc" fontSize="16" fontWeight="900" fontFamily="monospace">
                        {label}
                      </text>
                    </g>
                  ));
                })()}

                {/* Fracturing Geopolitical Cracks */}
                <path
                  d="M 120 160 L 190 240 L 260 320 L 390 340 L 500 200"
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="5"
                  strokeDasharray="12 8"
                />
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
              <g transform="translate(400, 390)" style={{ filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.8))' }}>
                <circle cx="0" cy="0" r="210" fill="#1e293b" stroke="#64748b" strokeWidth="4" />
                <path d="M 0 -210 A 210 210 0 0 1 210 0" fill="none" stroke="#ef4444" strokeWidth="22" strokeLinecap="round" />
                <path d="M -210 0 A 210 210 0 0 1 0 -210" fill="none" stroke="#f59e0b" strokeWidth="16" />

                {(() => {
                  const needleAngle = 30 + Math.sin(frame * 0.9) * 12;
                  const rad = (needleAngle * Math.PI) / 180;
                  return (
                    <line
                      x1="0"
                      y1="0"
                      x2={Math.cos(rad) * 180}
                      y2={Math.sin(rad) * 180}
                      stroke="#ef4444"
                      strokeWidth="8"
                      strokeLinecap="round"
                    />
                  );
                })()}
                <circle cx="0" cy="0" r="16" fill="#ffffff" stroke="#000" strokeWidth="4" />
                <text x="0" y="70" fill="#ef4444" fontSize="32" fontWeight="900" fontFamily="monospace" textAnchor="middle">
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
              <g transform="translate(60, 100)">
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

              <g transform="translate(30, 520)" style={{ filter: 'drop-shadow(0 15px 30px rgba(0,0,0,0.8))' }}>
                <rect x="0" y="0" width="740" height="50" fill="#dc2626" rx="4" />
                <text x="25" y="33" fill="#ffffff" fontSize="20" fontWeight="900" fontFamily="monospace">
                  {secondaryText || 'URGENT BROADCAST'}
                </text>
                <text x="25" y="95" fill="#FFE600" fontSize="26" fontWeight="900" fontFamily="'Montserrat', sans-serif">
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

              {/* Heavy Concrete Barrier / Wall Structure */}
              <g transform="translate(40, 310)" style={{ filter: 'drop-shadow(0 25px 45px rgba(0,0,0,0.9))' }}>
                <rect x="0" y="0" width="800" height="330" fill="#1f2937" rx="4" />
                {[160, 320, 480, 640].map((x) => (
                  <line key={x} x1={x} y1="0" x2={x} y2="330" stroke="#111827" strokeWidth="5" />
                ))}

                {/* Dramatic Action Typography on Barrier */}
                <text x="180" y="160" fill="#ef4444" fontSize="38" fontWeight="900" fontFamily="'Montserrat', sans-serif" transform="rotate(-6 180 160)" opacity="0.9">
                  {stampText || 'COLLAPSE'}
                </text>
                {(() => {
                  const barrierText = secondaryText || title || 'SYSTEM BREACH';
                  const fontSize = barrierText.length > 20 ? 22 : barrierText.length > 14 ? 26 : 32;
                  return (
                    <text x="560" y="180" textAnchor="middle" fill="#38bdf8" fontSize={fontSize} fontWeight="900" fontFamily="monospace" transform="rotate(4 560 180)" opacity="0.9">
                      {barrierText}
                    </text>
                  );
                })()}
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

              {/* Industrial Heavy Sledgehammer Striking the Wall Epicenter */}
              <g transform="translate(40, 310)">
                {(() => {
                  const hammerSwing = Math.sin(frame * 0.28);
                  const hammerRot = hammerSwing * 50;
                  const isImpact = hammerSwing < -0.85;
                  return (
                    <g transform="translate(380, 190)">
                      {/* Heavy Steel Sledgehammer */}
                      <g transform={`rotate(${hammerRot} 0 -80)`}>
                        {/* Hickory Handle */}
                        <line x1="0" y1="-80" x2="55" y2="-170" stroke="#b45309" strokeWidth="9" strokeLinecap="round" />
                        <line x1="5" y1="-75" x2="55" y2="-160" stroke="#fef3c7" strokeWidth="2" opacity="0.6" />
                        {/* Forged Steel Hammer Head */}
                        <rect x="40" y="-190" width="36" height="26" fill="#475569" stroke="#cbd5e1" strokeWidth="3" rx="3" />
                        <rect x="36" y="-188" width="8" height="22" fill="#ef4444" rx="2" />
                      </g>

                      {/* Explosive Seismic Shockwave & Sparks on Impact */}
                      {isImpact && (
                        <g>
                          <circle cx="0" cy="0" r={45 + pulse * 25} fill="none" stroke="#FFE600" strokeWidth="5" opacity={0.9} />
                          <circle cx="0" cy="0" r={75 + pulse * 35} fill="none" stroke="#ef4444" strokeWidth="3" strokeDasharray="8 6" opacity={0.7} />
                          {/* Radiating Spark Rays */}
                          {[-45, -20, 0, 25, 50, 80].map((deg, sIdx) => (
                            <line
                              key={sIdx}
                              x1="0"
                              y1="0"
                              x2={Math.cos((deg * Math.PI) / 180) * 60}
                              y2={Math.sin((deg * Math.PI) / 180) * 60}
                              stroke="#ffffff"
                              strokeWidth="4"
                              strokeLinecap="round"
                            />
                          ))}
                        </g>
                      )}

                      {/* Exposed Twisted Steel Rebar Jutting from Breach */}
                      <path d="M -30 20 Q -50 45 -40 85" fill="none" stroke="#94a3b8" strokeWidth="5" strokeLinecap="round" />
                      <path d="M 25 15 Q 45 40 35 75" fill="none" stroke="#94a3b8" strokeWidth="5" strokeLinecap="round" />
                    </g>
                  );
                })()}
              </g>

              {/* Organic Multi-Layer Crowd Horizon at Base (Zero Stick Figures) */}
              <g transform="translate(40, 520)">
                {/* Secondary Deep Crowd Silhouette Layer */}
                <path
                  d="M 0 90 Q 30 65 60 85 Q 90 55 130 80 Q 170 50 210 75 Q 250 55 290 85 Q 330 60 370 80 Q 410 50 450 75 Q 490 55 530 80 Q 570 60 610 85 Q 650 50 690 75 Q 730 60 760 85 Q 780 70 800 90 L 800 160 L 0 160 Z"
                  fill="#0f172a"
                  opacity="0.85"
                />

                {/* Primary Forefront Dense Crowd Horizon with Raised Arms & Chisels */}
                <path
                  d="M 0 120 Q 25 85 50 110 Q 80 75 115 105 Q 150 70 185 100 Q 220 75 255 115 Q 295 70 335 100 Q 375 75 415 105 Q 455 65 495 100 Q 535 80 575 110 Q 615 70 655 100 Q 695 75 735 105 Q 765 85 800 120 L 800 200 L 0 200 Z"
                  fill="#050811"
                />

                {/* Raised Chisels, Hammers, and Outstretched Hands */}
                {[90, 165, 230, 310, 435, 520, 610, 690, 755].map((x, idx) => {
                  const armBob = Math.sin(frame * 0.18 + idx) * 8;
                  const isChisel = idx % 2 === 0;
                  return (
                    <g key={idx} transform={`translate(${x}, ${95 + armBob})`}>
                      <line x1="0" y1="20" x2={isChisel ? "12" : "-10"} y2="-20" stroke="#050811" strokeWidth="7" strokeLinecap="round" />
                      {isChisel ? (
                        <rect x="10" y="-32" width="6" height="15" fill="#94a3b8" rx="1" />
                      ) : (
                        <circle cx="-10" cy="-22" r="5" fill="#f59e0b" />
                      )}
                    </g>
                  );
                })}

                {/* Dynamic Camera Flashes in the Crowd */}
                {Array.from({ length: 4 }).map((_, fIdx) => {
                  const flashX = 120 + fIdx * 180 + ((frame * 23) % 80);
                  const isFlashing = (frame + fIdx * 9) % 24 < 3;
                  if (!isFlashing) return null;
                  return (
                    <g key={`flash-${fIdx}`} transform={`translate(${flashX}, 100)`}>
                      <circle cx="0" cy="0" r="16" fill="#ffffff" opacity="0.9" />
                      <line x1="-25" y1="0" x2="25" y2="0" stroke="#ffffff" strokeWidth="3" />
                      <line x1="0" y1="-25" x2="0" y2="25" stroke="#ffffff" strokeWidth="3" />
                    </g>
                  );
                })}
              </g>
            </g>
          )}

          {/* ======================================================== */}
          {/* SCENE L: GATE BREACH (Gerbang Dibuka & Lautan Massa Maju) */}
          {/* ======================================================== */}
          {(type === 'gate-breach' || type === 'gate-breach-crowd') && (
            <g transform="translate(100, 390)">
              {/* Guard Control Booth on Left */}
              <g transform="translate(80, 260)" style={{ filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.85))' }}>
                <rect x="0" y="0" width="160" height="340" fill="#1e293b" rx="8" />
                <rect x="25" y="40" width="110" height="100" fill="#fef08a" stroke="#475569" strokeWidth="2" rx="4" />
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
                <line x1="0" y1="140" x2="760" y2="140" stroke="#475569" strokeWidth="3" strokeDasharray="16 12" opacity="0.6" />

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
            </g>
          )}

          {/* ======================================================== */}
          {/* SCENE M: PRESS PODIUM (Konferensi Pers & Hujan Blitz)    */}
          {/* ======================================================== */}
          {(type === 'press-podium' || type === 'press-conference') && (
            <g transform="translate(100, 390)">
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
              <g transform="translate(440, 320)" style={{ filter: 'drop-shadow(0 25px 45px rgba(0,0,0,0.85))' }}>
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
            </g>
          )}

          {/* ======================================================== */}
          {/* SCENE N: MEMO INVESTIGATION (Kertas Memo & Kaca Pembesar) */}
          {/* ======================================================== */}
          {(type === 'memo-investigation' || type === 'secret-document') && (
            <g transform="translate(100, 390)">
              <g transform="translate(140, 95)" style={{ filter: 'drop-shadow(0 25px 45px rgba(0,0,0,0.85))' }}>
                <rect x="0" y="0" width="600" height="590" fill="#f8fafc" rx="8" />
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
            </g>
          )}

          {/* ======================================================== */}
          {/* SCENE O: DOMINO COLLAPSE (Efek Domino Geopolitik Runtuh)  */}
          {/* ======================================================== */}
          {(type === 'domino-collapse' || type === 'domino-effect') && (
            <g transform="translate(100, 390)">
              <g transform="translate(40, 520)">
                {[0, 40, 80, 120, 160].map((gy) => (
                  <line key={gy} x1="0" y1={gy} x2="800" y2={gy} stroke="#1f2937" strokeWidth="2" opacity="0.6" />
                ))}
              </g>

              {/* Sequential Falling Domino Slabs (Tumbling Forward Left to Right) */}
              {(() => {
                let dominoList = [
                  { name: '1. KELALAIAN SEPELE', sub: 'PEMICU AWAL', startF: 0, color: '#ef4444' },
                  { name: '2. ESKALASI REAKSI', sub: 'MULAI TIDAK TERKENDALI', startF: 16, color: '#f59e0b' },
                  { name: '3. KEKACAUAN SISTEM', sub: 'PANIK MELUAS', startF: 32, color: '#38bdf8' },
                  { name: '4. KEGAGALAN FATAL', sub: 'TITIK TANPA KEMBALI', startF: 48, color: '#a855f7' },
                  { name: '5. DAMPAK GLOBAL', sub: 'BENCANA SEJARAH', startF: 64, color: '#dc2626' },
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
                      <g transform={`rotate(${tilt} 0 160)`} style={{ filter: 'drop-shadow(0 15px 30px rgba(0,0,0,0.8))' }}>
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
            </g>
          )}

          {/* ======================================================== */}
          {/* SCENE P: MARITIME DISASTER (Kapal, Gunung Es, SOS Laut) */}
          {/* ======================================================== */}
          {(type === 'maritime-disaster' || type === 'ship-iceberg') && (
            <g transform="translate(100, 390)">
              {/* Night Sky & Stars */}
              {[
                { x: 120, y: 120 }, { x: 260, y: 90 }, { x: 420, y: 140 },
                { x: 600, y: 80 }, { x: 740, y: 110 }, { x: 810, y: 160 },
              ].map((s, i) => (
                <circle key={i} cx={s.x} cy={s.y} r={1.5 + (i % 2)} fill="#ffffff" opacity={0.6 + Math.sin(frame * 0.2 + i) * 0.4} />
              ))}

              {/* Jagged Iceberg on Right */}
              <g transform="translate(580, 260)" style={{ filter: 'drop-shadow(0 15px 30px rgba(0,0,0,0.8))' }}>
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
                  <g transform={`translate(280, 480) rotate(${shipTilt})`} style={{ filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.9))' }}>
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
            </g>
          )}

          {/* ======================================================== */}
          {/* SCENE Q: REACTOR MELTDOWN (Reaktor Nuklir / Korseling)   */}
          {/* ======================================================== */}
          {(type === 'reactor-meltdown' || type === 'nuclear-disaster') && (
            <g transform="translate(100, 390)">
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
            </g>
          )}

          {/* ======================================================== */}
          {/* SCENE R: LABORATORY DISCOVERY (Petri Dish / Mikroskop)   */}
          {/* ======================================================== */}
          {(type === 'laboratory-discovery' || type === 'medical-breakthrough') && (
            <g transform="translate(100, 390)">
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
            </g>
          )}

          {/* ======================================================== */}
          {/* SCENE T: CLOCK COUNTDOWN / TIME PRESSURE                */}
          {/* ======================================================== */}
          {(type === 'clock-countdown' || type === 'fatal-clock' || type === 'time-pressure') && (
            <g transform="translate(180, 410)">
              <g transform="translate(360, 360)">
                <circle cx="0" cy="0" r="280" fill="#09101d" stroke="#334155" strokeWidth="8" />
                <circle cx="0" cy="0" r="240" fill="none" stroke="rgba(239, 68, 68, 0.25)" strokeWidth="3" />

                {Array.from({ length: 12 }).map((_, i) => {
                  const rad = (i * 30 * Math.PI) / 180;
                  const x1 = Math.sin(rad) * 220;
                  const y1 = -Math.cos(rad) * 220;
                  const x2 = Math.sin(rad) * 255;
                  const y2 = -Math.cos(rad) * 255;
                  return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={i % 3 === 0 ? '#ef4444' : '#64748b'} strokeWidth={i % 3 === 0 ? 6 : 2} />;
                })}

                {(() => {
                  const secAngle = (frame * 12) % 360;
                  const minAngle = (frame * 1.5) % 360;
                  return (
                    <g>
                      <line x1="0" y1="0" x2={Math.sin((minAngle * Math.PI) / 180) * 160} y2={-Math.cos((minAngle * Math.PI) / 180) * 160} stroke="#f8fafc" strokeWidth="8" strokeLinecap="round" />
                      <line x1="0" y1="0" x2={Math.sin((secAngle * Math.PI) / 180) * 220} y2={-Math.cos((secAngle * Math.PI) / 180) * 220} stroke="#ef4444" strokeWidth="4" strokeLinecap="round" />
                      <circle cx="0" cy="0" r="14" fill="#ef4444" stroke="#000" strokeWidth="3" />
                    </g>
                  );
                })()}

                <rect x="-170" y="80" width="340" height="70" fill="#030712" stroke="#ef4444" strokeWidth="2" rx="8" />
                <text x="0" y="128" fill="#ef4444" fontSize="34" fontWeight="900" fontFamily="monospace" textAnchor="middle" letterSpacing="4">
                  {metricValue || '00:03.45'}
                </text>
                <text x="0" y="65" fill="#94a3b8" fontSize="13" fontWeight="bold" fontFamily="monospace" textAnchor="middle" letterSpacing="2">
                  {primaryText || 'DETIK MENJELANG BENCANA'}
                </text>
              </g>
            </g>
          )}

          {/* ======================================================== */}
          {/* SCENE U: KEY LOCKBOX / FORGOTTEN KEY                     */}
          {/* ======================================================== */}
          {(type === 'key-lockbox' || type === 'forgotten-key' || type === 'missing-key') && (
            <g transform="translate(180, 410)">
              <g transform="translate(60, 80)" style={{ filter: 'drop-shadow(0 25px 50px rgba(0,0,0,0.9))' }}>
                <rect x="0" y="0" width="600" height="520" fill="#1e293b" stroke="#475569" strokeWidth="6" rx="16" />
                <rect x="20" y="20" width="560" height="480" fill="#0f172a" rx="10" />

                <circle cx="300" cy="220" r="110" fill="#1e293b" stroke="#ef4444" strokeWidth="6" />
                <circle cx="300" cy="220" r="85" fill="none" stroke="#f59e0b" strokeWidth="3" strokeDasharray="10 8" />

                <path d="M 292 190 A 18 18 0 1 1 308 190 L 314 245 L 286 245 Z" fill="#ef4444" opacity={0.8 + pulse * 0.2} />

                <g transform="translate(130, 370)">
                  <rect x="0" y="0" width="340" height="65" fill="#7f1d1d" stroke="#ef4444" strokeWidth="3" rx="6" />
                  <text x="170" y="42" fill="#ffffff" fontSize="20" fontWeight="900" fontFamily="monospace" textAnchor="middle" letterSpacing="2">
                    {stampText || 'KUNCI TIDAK DITEMUKAN'}
                  </text>
                </g>

                <g transform={`translate(${480 + Math.sin(frame * 0.1) * 8}, ${110 + Math.cos(frame * 0.1) * 8})`}>
                  <circle cx="0" cy="0" r="42" fill="#030712" stroke="#FFE600" strokeWidth="4" />
                  <text x="0" y="16" fill="#FFE600" fontSize="48" fontWeight="900" fontFamily="'Montserrat', sans-serif" textAnchor="middle">
                    ?
                  </text>
                  <text x="0" y="62" fill="#f8fafc" fontSize="13" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
                    {metricLabel || primaryText || 'AKSES KRITIS'}
                  </text>
                </g>
              </g>
            </g>
          )}

          {/* ======================================================== */}
          {/* SCENE V: CAR ROUTE / WRONG TURN                          */}
          {/* ======================================================== */}
          {(type === 'car-route' || type === 'wrong-turn' || type === 'transit-blunder') && (
            <g transform="translate(150, 420)">
              <g transform="translate(40, 50)">
                <rect x="40" y="240" width="620" height="120" fill="#1e293b" />
                <rect x="360" y="40" width="120" height="520" fill="#1e293b" />

                <line x1="40" y1="300" x2="360" y2="300" stroke="#f8fafc" strokeWidth="4" strokeDasharray="20 15" opacity="0.6" />
                <line x1="420" y1="40" x2="420" y2="560" stroke="#f8fafc" strokeWidth="4" strokeDasharray="20 15" opacity="0.6" />

                <path d="M 60 300 L 420 300 L 420 80" fill="none" stroke="#38bdf8" strokeWidth="6" opacity="0.4" strokeDasharray="10 8" />
                <path d="M 60 300 L 420 300 L 420 480" fill="none" stroke="#ef4444" strokeWidth="8" strokeDasharray="300" strokeDashoffset={strokeProgress * 0.4} />

                {(() => {
                  const carProgress = interpolate(frame, [0, durationFrames], [0, 1], { extrapolateRight: 'clamp' });
                  const carX = carProgress < 0.6 ? interpolate(carProgress, [0, 0.6], [80, 420]) : 420;
                  const carY = carProgress < 0.6 ? 300 : interpolate(carProgress, [0.6, 1], [300, 460]);
                  const carRot = carProgress < 0.6 ? 0 : 90;
                  return (
                    <g transform={`translate(${carX}, ${carY}) rotate(${carRot})`}>
                      <rect x="-35" y="-18" width="70" height="36" fill="#f59e0b" stroke="#000" strokeWidth="3" rx="8" />
                      <rect x="-15" y="-12" width="30" height="24" fill="#0f172a" rx="4" />
                      <circle cx="-20" cy="-18" r="6" fill="#000" />
                      <circle cx="20" cy="-18" r="6" fill="#000" />
                      <circle cx="-20" cy="18" r="6" fill="#000" />
                      <circle cx="20" cy="18" r="6" fill="#000" />
                    </g>
                  );
                })()}

                <g transform="translate(420, 500)">
                  <circle cx="0" cy="0" r="32" fill="#ef4444" />
                  <line x1="-16" y1="-16" x2="16" y2="16" stroke="#ffffff" strokeWidth="6" strokeLinecap="round" />
                  <line x1="16" y1="-16" x2="-16" y2="16" stroke="#ffffff" strokeWidth="6" strokeLinecap="round" />
                  <text x="45" y="8" fill="#ef4444" fontSize="18" fontWeight="900" fontFamily="monospace">
                    {stampText || 'SALAH BELOK'}
                  </text>
                </g>
              </g>
            </g>
          )}

          {/* ======================================================== */}
          {/* SCENE W: RADIATION HAZARD / TOXIC CLOUD                  */}
          {/* ======================================================== */}
          {(type === 'radiation-hazard' || type === 'toxic-cloud' || type === 'hazard-spread') && (
            <g transform="translate(180, 410)">
              <g transform="translate(360, 360)">
                {[120, 200, 270, 330].map((r, i) => {
                  const waveScale = (frame * 1.5 + i * 40) % 320;
                  return (
                    <circle
                      key={i}
                      cx="0"
                      cy="0"
                      r={waveScale}
                      fill="none"
                      stroke="#f59e0b"
                      strokeWidth="3"
                      opacity={Math.max(0, 1 - waveScale / 320)}
                      strokeDasharray="8 6"
                    />
                  );
                })}

                <g transform={`rotate(${frame * 0.4})`}>
                  <circle cx="0" cy="0" r="140" fill="#0f172a" stroke="#FFE600" strokeWidth="8" />
                  {[0, 120, 240].map((ang) => (
                    <path
                      key={ang}
                      d="M 0 0 L -35 -125 A 130 130 0 0 1 35 -125 Z"
                      fill="#FFE600"
                      transform={`rotate(${ang})`}
                    />
                  ))}
                  <circle cx="0" cy="0" r="45" fill="#0f172a" />
                  <circle cx="0" cy="0" r="28" fill="#FFE600" />
                </g>

                <g transform="translate(-180, 190)">
                  <rect x="0" y="0" width="360" height="75" fill="#030712" stroke="#ef4444" strokeWidth="3" rx="8" />
                  <text x="180" y="35" fill="#ef4444" fontSize="28" fontWeight="900" fontFamily="monospace" textAnchor="middle">
                    {metricValue || '15,000 ROENTGEN'}
                  </text>
                  <text x="180" y="60" fill="#f59e0b" fontSize="13" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
                    STATUS: {stampText || 'LETHAL OVERLOAD'}
                  </text>
                </g>
              </g>
            </g>
          )}

          {/* ======================================================== */}
          {/* SCENE X: VALVE FAILURE / PIPELINE BREACH                 */}
          {/* ======================================================== */}
          {(type === 'valve-failure' || type === 'pipeline-breach' || type === 'pressure-burst') && (
            <g transform="translate(160, 420)">
              <g transform="translate(60, 80)">
                <rect x="60" y="240" width="580" height="100" fill="#334155" stroke="#1e293b" strokeWidth="6" rx="6" />
                <rect x="300" y="60" width="100" height="420" fill="#334155" stroke="#1e293b" strokeWidth="6" rx="6" />

                <g transform={`translate(350, 60) rotate(${frame * 4})`}>
                  <circle cx="0" cy="0" r="65" fill="#ef4444" stroke="#7f1d1d" strokeWidth="6" />
                  <line x1="-65" y1="0" x2="65" y2="0" stroke="#ffffff" strokeWidth="8" />
                  <line x1="0" y1="-65" x2="0" y2="65" stroke="#ffffff" strokeWidth="8" />
                  <circle cx="0" cy="0" r="20" fill="#000000" />
                </g>

                {Array.from({ length: 12 }).map((_, i) => {
                  const jetDist = ((frame * 12 + i * 25) % 180) + 30;
                  const jetAngle = -45 + (i % 5) * 22;
                  const jx = 350 + Math.cos((jetAngle * Math.PI) / 180) * jetDist;
                  const jy = 240 + Math.sin((jetAngle * Math.PI) / 180) * jetDist;
                  return (
                    <circle
                      key={i}
                      cx={jx}
                      cy={jy}
                      r={10 + (i % 6) * 3}
                      fill="#ffffff"
                      opacity={Math.max(0, 0.9 - jetDist / 200)}
                    />
                  );
                })}

                <g transform="translate(140, 400)">
                  <rect x="0" y="0" width="380" height="70" fill="#7f1d1d" stroke="#ef4444" strokeWidth="3" rx="8" />
                  <text x="190" y="42" fill="#ffffff" fontSize="24" fontWeight="900" fontFamily="monospace" textAnchor="middle">
                    {primaryText || 'KEGAGALAN KATUP TEKANAN'}
                  </text>
                </g>
              </g>
            </g>
          )}

          {/* ======================================================== */}
          {/* SCENE Y: TELEGRAPH WIRE / MORSE SIGNAL                   */}
          {/* ======================================================== */}
          {(type === 'telegraph-wire' || type === 'morse-signal' || type === 'emergency-signal') && (
            <g transform="translate(160, 420)">
              <g transform="translate(60, 80)">
                <line x1="350" y1="120" x2="350" y2="380" stroke="#94a3b8" strokeWidth="8" />
                <line x1="280" y1="180" x2="420" y2="180" stroke="#94a3b8" strokeWidth="5" />
                <line x1="300" y1="240" x2="400" y2="240" stroke="#94a3b8" strokeWidth="5" />
                <line x1="350" y1="380" x2="240" y2="520" stroke="#64748b" strokeWidth="6" />
                <line x1="350" y1="380" x2="460" y2="520" stroke="#64748b" strokeWidth="6" />

                {[40, 90, 150, 220].map((r, i) => {
                  const ringR = (r + frame * 3) % 240;
                  return (
                    <circle
                      key={i}
                      cx="350"
                      cy="120"
                      r={ringR}
                      fill="none"
                      stroke="#38bdf8"
                      strokeWidth="3"
                      opacity={Math.max(0, 1 - ringR / 240)}
                    />
                  );
                })}
                <circle cx="350" cy="120" r="18" fill="#ef4444" stroke="#ffffff" strokeWidth="4" />

                <g transform="translate(60, 390)" style={{ filter: 'drop-shadow(0 15px 30px rgba(0,0,0,0.8))' }}>
                  <rect x="0" y="0" width="560" height="90" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="3" rx="8" />
                  <text x="30" y="42" fill="#0f172a" fontSize="24" fontWeight="900" fontFamily="monospace">
                    {quoteText || 'CQD SOS • DISTRESS SIGNAL'}
                  </text>
                  <text x="30" y="70" fill="#ef4444" fontSize="16" fontWeight="bold" fontFamily="monospace">
                    {metricValue || '• • • — — — • • •'}
                  </text>
                </g>
              </g>
            </g>
          )}

          {/* ======================================================== */}
          {/* SCENE Z: CROWD PROTEST / MASS REVOLT (Siluet Organik)    */}
          {/* ======================================================== */}
          {(type === 'crowd-protest' || type === 'mass-revolt' || type === 'revolution-action') && (
            <g transform="translate(100, 370)">
              {/* Dynamic Criss-Crossing Searchlights in the Night Sky */}
              {(() => {
                const sAngle1 = Math.sin(frame * 0.035) * 40;
                const sAngle2 = Math.cos(frame * 0.04) * 35;
                return (
                  <g>
                    <polygon
                      points={`80,720 ${350 + sAngle1 * 6},-80 ${480 + sAngle1 * 6},-80`}
                      fill="url(#spotlightDir)"
                      opacity="0.25"
                    />
                    <polygon
                      points={`800,720 ${420 + sAngle2 * 6},-80 ${550 + sAngle2 * 6},-80`}
                      fill="url(#spotlightDir)"
                      opacity="0.22"
                    />
                  </g>
                );
              })()}

              {/* Broadcaster / Protest Megaphone with Acoustic Wavefronts */}
              <g transform="translate(120, 240)" style={{ filter: 'drop-shadow(0 15px 30px rgba(0,0,0,0.9))' }}>
                <g transform="rotate(-15)">
                  {/* Tripod Stand */}
                  <line x1="0" y1="40" x2="-25" y2="120" stroke="#475569" strokeWidth="6" strokeLinecap="round" />
                  <line x1="0" y1="40" x2="25" y2="120" stroke="#475569" strokeWidth="6" strokeLinecap="round" />
                  {/* Megaphone Cone */}
                  <polygon points="0,20 120,-30 120,70" fill="#ef4444" stroke="#f8fafc" strokeWidth="3" />
                  <rect x="-30" y="5" width="30" height="30" fill="#1e293b" rx="4" />
                  {/* Concentric Acoustic Wavefronts */}
                  <circle cx="120" cy="20" r={30 + pulse * 25} fill="none" stroke="#FFE600" strokeWidth="3" opacity={1 - pulse * 0.7} />
                  <circle cx="120" cy="20" r={55 + pulse * 35} fill="none" stroke="#f59e0b" strokeWidth="2" strokeDasharray="6 4" opacity={0.8 - pulse * 0.6} />
                  <circle cx="120" cy="20" r={85 + pulse * 45} fill="none" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="4 4" opacity={0.6 - pulse * 0.5} />
                </g>
              </g>

              {/* Multi-Tier Organic Crowd Silhouettes (Zero Stick Figures) */}
              <g transform="translate(40, 420)">
                {/* Layer 1: Distant Background Masses */}
                <path
                  d="M 0 100 Q 40 75 80 95 Q 130 65 180 90 Q 230 60 280 85 Q 330 70 380 90 Q 430 60 480 85 Q 530 65 580 90 Q 630 60 680 85 Q 730 70 770 90 Q 790 75 800 95 L 800 240 L 0 240 Z"
                  fill="#0e1726"
                  opacity="0.8"
                />

                {/* Layer 2: Mid-Ground Masses with Banners & Placards */}
                <path
                  d="M 0 140 Q 30 105 60 130 Q 100 95 145 125 Q 190 90 235 120 Q 280 100 325 130 Q 370 95 415 125 Q 460 100 505 130 Q 550 90 595 125 Q 640 100 685 130 Q 730 95 770 125 Q 790 110 800 135 L 800 260 L 0 260 Z"
                  fill="#080d1a"
                />

                {/* Authentic Historical Placards Held High */}
                {[
                  { x: 140, label: 'WIR SIND DAS VOLK', rot: -5 },
                  { x: 380, label: stampText || 'KEBEBASAN', rot: 3 },
                  { x: 620, label: 'TOR AUF! (BUKA GERBANG)', rot: -2 },
                ].map((banner, bIdx) => {
                  const bBob = Math.sin(frame * 0.12 + bIdx * 2) * 6;
                  return (
                    <g key={bIdx} transform={`translate(${banner.x}, ${80 + bBob}) rotate(${banner.rot})`}>
                      <line x1="0" y1="50" x2="0" y2="0" stroke="#050811" strokeWidth="5" />
                      <rect x="-80" y="-38" width="160" height="38" fill="#f8fafc" stroke="#0f172a" strokeWidth="3" rx="3" />
                      <line x1="-75" y1="-5" x2="75" y2="-5" stroke="#dc2626" strokeWidth="2" />
                      <text x="0" y="-14" fill="#0f172a" fontSize="12" fontWeight="900" fontFamily="'Montserrat', sans-serif" textAnchor="middle">
                        {banner.label}
                      </text>
                    </g>
                  );
                })}

                {/* Layer 3: Forefront High-Contrast Silhouettes with Raised Fists */}
                <path
                  d="M 0 180 Q 35 140 70 170 Q 115 135 160 165 Q 210 130 260 165 Q 310 140 360 170 Q 410 135 460 165 Q 510 130 560 165 Q 610 140 660 170 Q 710 135 755 165 Q 785 150 800 180 L 800 280 L 0 280 Z"
                  fill="#03050a"
                />

                {/* Raised Hands & Fists */}
                {[90, 230, 340, 480, 580, 710].map((hx, idx) => {
                  const hBob = Math.sin(frame * 0.2 + idx) * 7;
                  return (
                    <g key={idx} transform={`translate(${hx}, ${150 + hBob})`}>
                      <line x1="0" y1="25" x2="0" y2="-15" stroke="#03050a" strokeWidth="8" strokeLinecap="round" />
                      <circle cx="0" cy="-18" r="6" fill="#03050a" />
                    </g>
                  );
                })}
              </g>

              {/* Urgent Situation Telemetry Badge */}
              <g transform="translate(420, 220)" style={{ filter: 'drop-shadow(0 15px 30px rgba(0,0,0,0.9))' }}>
                <rect x="0" y="0" width="360" height="70" fill="rgba(15, 23, 42, 0.95)" stroke="#ef4444" strokeWidth="2.5" rx="6" />
                <rect x="0" y="0" width="8" height="70" fill="#ef4444" />
                <text x="24" y="28" fill="#ef4444" fontSize="11" fontWeight="900" fontFamily="monospace" letterSpacing="1.5">
                  ESKALASI MASSA // TAK TERBENDUNG
                </text>
                <text x="24" y="52" fill="#f8fafc" fontSize="16" fontWeight="900" fontFamily="'Montserrat', sans-serif">
                  {primaryText || 'PULUHAN RIBU WARGA DI JALANAN'}
                </text>
              </g>
            </g>
          )}

          {/* ======================================================== */}
          {/* SCENE AA: COURTROOM GAVEL / INQUIRY TRIBUNAL             */}
          {/* ======================================================== */}
          {(type === 'courtroom-gavel' || type === 'inquiry-tribunal' || type === 'verdict-ruling') && (
            <g transform="translate(180, 420)">
              <g transform="translate(60, 80)">
                <rect x="220" y="340" width="180" height="40" fill="#78350f" stroke="#451a03" strokeWidth="4" rx="6" />

                {(() => {
                  const strikeProg = Math.sin(frame * 0.25);
                  const rot = strikeProg > 0 ? strikeProg * 35 : strikeProg * 8;
                  const isImpact = strikeProg < -0.8;
                  return (
                    <g transform="translate(310, 335)">
                      <g transform={`rotate(${rot} 0 0)`}>
                        <line x1="0" y1="0" x2="130" y2="-120" stroke="#92400e" strokeWidth="12" strokeLinecap="round" />
                        <rect x="-35" y="-30" width="70" height="36" fill="#78350f" stroke="#451a03" strokeWidth="4" rx="6" />
                      </g>
                      {isImpact && (
                        <g>
                          <circle cx="0" cy="5" r={24 + pulse * 15} fill="none" stroke="#FFE600" strokeWidth="4" />
                          <line x1="-30" y1="5" x2="30" y2="5" stroke="#ffffff" strokeWidth="4" />
                        </g>
                      )}
                    </g>
                  );
                })()}

                <g transform="translate(130, 430)">
                  <rect x="0" y="0" width="360" height="65" fill="#7f1d1d" stroke="#ef4444" strokeWidth="3" rx="8" />
                  <text x="180" y="42" fill="#ffffff" fontSize="22" fontWeight="900" fontFamily="monospace" textAnchor="middle" letterSpacing="3">
                    {stampText || 'INVESTIGASI RESMI'}
                  </text>
                </g>
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
              'clock-countdown',
              'key-lockbox',
              'car-route',
              'radiation-hazard',
              'valve-failure',
              'telegraph-wire',
              'crowd-protest',
              'courtroom-gavel',
            ].includes(type))) && (
            <g transform="translate(140, 420)">
              <g style={{ filter: 'drop-shadow(0 25px 45px rgba(0,0,0,0.85))' }}>
                <rect x="40" y="65" width="720" height="630" fill="#f8fafc" rx="8" />
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
          height: '360px',
          background: 'linear-gradient(to top, rgba(5, 7, 12, 0.72) 0%, rgba(5, 7, 12, 0.22) 60%, transparent 100%)',
          pointerEvents: 'none',
        }}
      />

      {/* 4. Top Editorial Header (Clean Documentarian Typography - Zero Template Badges) */}
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
        {locationTag && (
          <div
            style={{
              display: 'inline-block',
              fontFamily: "'Space Grotesk', -apple-system, sans-serif",
              fontSize: '14px',
              fontWeight: 800,
              color: accentColor || '#fbbf24',
              backgroundColor: 'rgba(15, 23, 42, 0.85)',
              border: `1px solid ${accentColor || '#fbbf24'}66`,
              padding: '4px 14px',
              borderRadius: '4px',
              letterSpacing: '2.5px',
              textTransform: 'uppercase',
              marginBottom: '10px',
              textShadow: '0 2px 10px rgba(0, 0, 0, 0.9)',
              backdropFilter: 'blur(4px)',
            }}
          >
            {locationTag}
          </div>
        )}

        <h2
          style={{
            fontFamily: "'Montserrat', sans-serif",
            fontSize: '38px',
            fontWeight: 900,
            color: '#f8fafc',
            textTransform: 'uppercase',
            letterSpacing: '-0.5px',
            lineHeight: 1.15,
            margin: 0,
            textShadow: '0 4px 25px rgba(0, 0, 0, 0.95)',
            maxWidth: '920px',
          }}
        >
          {title}
        </h2>

        {subtitle && (
          <p
            style={{
              fontFamily: "'Space Grotesk', -apple-system, sans-serif",
              fontSize: '18px',
              fontWeight: 600,
              color: '#cbd5e1',
              margin: '8px 0 0 0',
              textShadow: '0 2px 12px rgba(0, 0, 0, 0.95)',
              maxWidth: '920px',
            }}
          >
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
};
