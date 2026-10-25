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
          {/* SCENE A: BUREAUCRACY DRAFT (Pejabat Birokrat Merancang Dokumen) */}
          {/* ======================================================== */}
          {type === 'bureaucracy-draft' && (
            <g transform="translate(100, 360)">
              {/* Warm Ambient Desk Lamp Cone Light */}
              <polygon points="260,180 80,720 720,720" fill="url(#spotlightDir)" opacity="0.18" />

              {/* Wooden Bureaucracy Desk Surface */}
              <g style={{ filter: 'drop-shadow(0 25px 50px rgba(0,0,0,0.95))' }}>
                <rect x="60" y="580" width="760" height="150" fill="#181311" stroke="#3e2723" strokeWidth="4" rx="8" />
                <rect x="60" y="580" width="760" height="22" fill="#2d1b15" />
                <line x1="60" y1="602" x2="820" y2="602" stroke="#d97706" strokeWidth="2" opacity="0.4" />
              </g>

              {/* Bureaucrat Official Character (Upper Body Behind Desk) */}
              <g transform="translate(440, 290)">
                {/* Torso & Charcoal Suit Vest */}
                <polygon points="-90,290 90,290 70,120 -70,120" fill="#1e293b" />
                {/* White Shirt Collar & Lapels */}
                <polygon points="-24,120 24,120 38,170 -38,170" fill="#f8fafc" />
                {/* Silk Tie */}
                <polygon points="-10,140 10,140 14,240 0,260 -14,240" fill="#dc2626" />
                <line x1="0" y1="145" x2="0" y2="250" stroke="#991b1b" strokeWidth="2" />

                {/* Head & Neck (Tilted Down in Concentration) */}
                <rect x="-18" y="90" width="36" height="35" fill="#cbd5e1" rx="4" />
                <ellipse cx="0" cy="55" rx="46" ry="52" fill="#f1f5f9" />

                {/* Parted Bureaucrat Hair */}
                <path d="M -48 40 C -45 -5, 45 -5, 48 40 C 40 15, -10 10, -48 40 Z" fill="#0f172a" />
                <path d="M -48 40 C -30 20, 0 25, 48 30 C 42 12, 10 5, -48 40 Z" fill="#1e293b" />

                {/* Horn-Rimmed Reading Glasses */}
                <rect x="-38" y="44" width="30" height="20" fill="none" stroke="#f59e0b" strokeWidth="3" rx="4" />
                <rect x="8" y="44" width="30" height="20" fill="none" stroke="#f59e0b" strokeWidth="3" rx="4" />
                <line x1="-8" y1="52" x2="8" y2="52" stroke="#f59e0b" strokeWidth="3" />
                {/* Focused Eyes Looking Down */}
                <ellipse cx="-23" cy="54" rx="4" ry="5" fill="#0f172a" />
                <ellipse cx="23" cy="54" rx="4" ry="5" fill="#0f172a" />

                {/* Left Arm Resting on Desk Holding Stack of Folders */}
                <path d="M -70 140 C -120 200, -150 240, -170 300 L -110 300 C -100 250, -75 210, -50 160 Z" fill="#1e293b" />
                <ellipse cx="-165" cy="305" rx="18" ry="12" fill="#cbd5e1" />

                {/* Right Arm & Hand Holding Drafting Pen */}
                {(() => {
                  const penWiggle = Math.sin(frame * 0.35) * 3;
                  return (
                    <g>
                      <path d="M 70 140 C 110 190, 130 230, 140 290 L 95 295 C 85 240, 70 200, 50 160 Z" fill="#1e293b" />
                      {/* Cuffed White Sleeve */}
                      <rect x="120" y="275" width="28" height="15" fill="#f8fafc" rx="2" transform="rotate(-15 130 280)" />
                      {/* Hand Gripping Fountain Pen */}
                      <g transform={`translate(${135 + penWiggle}, ${295 + penWiggle * 0.5}) rotate(25)`}>
                        <ellipse cx="0" cy="0" rx="14" ry="10" fill="#cbd5e1" />
                        {/* Fountain Pen Body & Brass Nib */}
                        <line x1="-5" y1="-30" x2="15" y2="25" stroke="#78350f" strokeWidth="6" strokeLinecap="round" />
                        <polygon points="12,20 18,32 10,28" fill="#f59e0b" />
                      </g>
                    </g>
                  );
                })()}
              </g>

              {/* Vintage Banker's Desk Lamp on Left */}
              <g transform="translate(140, 410)">
                <rect x="-25" y="190" width="50" height="15" fill="#d97706" rx="4" />
                <path d="M 0 190 C -10 110, 10 70, 40 20" fill="none" stroke="#b45309" strokeWidth="8" strokeLinecap="round" />
                {/* Emerald Green Glass Shade */}
                <ellipse cx="60" cy="20" rx="42" ry="16" fill="#047857" stroke="#065f46" strokeWidth="3" />
                <ellipse cx="60" cy="24" rx="36" ry="10" fill="#fef08a" opacity="0.9" />
              </g>

              {/* Official Typewritten Document on Desk */}
              <g transform="translate(240, 430)" style={{ filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.85))' }}>
                <rect x="0" y="0" width="460" height="280" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="2" rx="6" />

                <text x="30" y="42" fill="#0f172a" fontSize="18" fontWeight="900" fontFamily="'Montserrat', sans-serif">
                  {(primaryText || title || 'DOKUMEN RESMI').slice(0, 28)}
                </text>
                <text x="30" y="66" fill="#64748b" fontSize="12" fontWeight="700" fontFamily="monospace">
                  {secondaryText || subtitle || 'KEMENTERIAN DALAM NEGERI DDR'}
                </text>
                <line x1="30" y1="78" x2="430" y2="78" stroke="#cbd5e1" strokeWidth="2" />

                {[98, 122, 146, 206, 230, 254].map((y, idx) => (
                  <line
                    key={idx}
                    x1="30"
                    y1={y}
                    x2={idx % 2 === 0 ? 430 : 360}
                    y2={y}
                    stroke="#94a3b8"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                ))}

                {/* Highlighted Evidence / Crucial Draft Clause */}
                <g transform="translate(25, 162)">
                  <rect x="0" y="0" width="410" height="32" fill="#fde047" opacity="0.95" rx="3" />
                  <text x="12" y="21" fill="#0f172a" fontSize="13" fontWeight="900" fontFamily="monospace">
                    {`KLAUSUL DRAF: "${(secondaryText || primaryText || 'BERLAKU BESOK 04:00 PAGI').slice(0, 32)}"`}
                  </text>
                </g>

                {/* Red Confidential Ministry Stamp */}
                <g transform="translate(260, 195) rotate(-6)" opacity={stampSpring}>
                  <rect x="0" y="0" width="180" height="55" fill="rgba(220, 38, 38, 0.12)" stroke="#dc2626" strokeWidth="3" strokeDasharray="6 3" rx="4" />
                  <text x="90" y="28" fill="#dc2626" fontSize="15" fontWeight="900" fontFamily="monospace" textAnchor="middle">
                    {stampText || 'DRAF RAHASIA'}
                  </text>
                  <text x="90" y="46" fill="#dc2626" fontSize="10" fontWeight="700" fontFamily="monospace" textAnchor="middle">
                    SEGERA DIKOREKSI
                  </text>
                </g>
              </g>
            </g>
          )}

          {/* ======================================================== */}
          {/* SCENE B: MEMO HANDOFF (Dua Pejabat di Lorong Konferensi)   */}
          {/* ======================================================== */}
          {type === 'memo-handoff' && (
            <g transform="translate(100, 360)">
              {/* Perspective Government Hallway Architecture */}
              <path
                d="M 80 720 L 240 280 L 640 280 L 800 720"
                fill="none"
                stroke="#1e293b"
                strokeWidth="4"
                strokeDasharray="12 8"
                opacity="0.45"
              />
              <path
                d="M 240 280 C 240 180 640 180 640 280"
                fill="none"
                stroke="#334155"
                strokeWidth="5"
                opacity="0.6"
              />

              {/* Overhead Brass Corridor Lantern with Warm Amber Beam */}
              <g transform="translate(440, 160)">
                <line x1="0" y1="0" x2="0" y2="70" stroke="#94a3b8" strokeWidth="4" />
                <polygon points="-25,70 25,70 35,115 -35,115" fill="#f59e0b" opacity="0.85" />
                <polygon points="-35,115 35,115 160,560 -160,560" fill="url(#spotlightDir)" opacity="0.28" />
              </g>

              {/* Corridor Wall Clock at 16:00 */}
              <g transform="translate(140, 240)">
                <circle cx="0" cy="0" r="32" fill="#0f172a" stroke="#64748b" strokeWidth="3" />
                <line x1="0" y1="0" x2="0" y2="-20" stroke="#f8fafc" strokeWidth="3" strokeLinecap="round" />
                <line x1="0" y1="0" x2="16" y2="0" stroke="#f8fafc" strokeWidth="3" strokeLinecap="round" />
                <text x="0" y="48" fill="#94a3b8" fontSize="12" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
                  16:00
                </text>
              </g>

              {/* CHARACTER 1 (LEFT): Government Aide / Courier in Trench Coat & Fedora */}
              <g transform={`translate(160, ${360 + Math.sin(frame * 0.1) * 3})`}>
                {/* Body & Coat */}
                <path d="M 40 140 L 140 130 L 160 380 L 10 380 Z" fill="#0f172a" stroke="#334155" strokeWidth="4" />
                <polygon points="65,135 115,130 95,210 75,210" fill="#1e293b" />
                {/* Collar & Tie */}
                <polygon points="80,130 100,130 90,170" fill="#dc2626" />

                {/* Head in Profile with Hat */}
                <circle cx="95" cy="70" r="34" fill="#1e293b" stroke="#475569" strokeWidth="3" />
                <path d="M 50 55 L 145 50 L 135 30 L 70 32 Z" fill="#0f172a" stroke="#94a3b8" strokeWidth="3" />
                {/* Nose & Jaw in Profile facing right */}
                <path d="M 115 65 L 130 75 L 118 85 L 112 100" fill="none" stroke="#cbd5e1" strokeWidth="3" strokeLinecap="round" />

                {/* Extended Right Arm Handing Over Document */}
                <path d="M 130 160 Q 210 170 270 200 L 255 225 Q 190 205 125 195 Z" fill="#1e293b" stroke="#475569" strokeWidth="3" />
                <circle cx="270" cy="205" r="14" fill="#cbd5e1" />
              </g>

              {/* THE OFFICIAL MEMO / DOSSIER IN HANDOFF */}
              {(() => {
                const docSlide = Math.sin(frame * 0.12) * 8;
                return (
                  <g transform={`translate(${435 + docSlide}, 530) rotate(-4)`} style={{ filter: 'drop-shadow(0 20px 35px rgba(0,0,0,0.9))' }}>
                    <rect x="0" y="0" width="180" height="230" fill="#f8fafc" stroke="#dc2626" strokeWidth="3" rx="6" />
                    <rect x="15" y="15" width="150" height="30" fill="rgba(220, 38, 38, 0.15)" rx="4" />
                    <text x="90" y="36" fill="#dc2626" fontSize="13" fontWeight="900" fontFamily="monospace" textAnchor="middle" letterSpacing="1">
                      {stampText || 'REISE-MEMO'}
                    </text>
                    <line x1="20" y1="65" x2="160" y2="65" stroke="#334155" strokeWidth="4" strokeLinecap="round" />
                    <line x1="20" y1="85" x2="150" y2="85" stroke="#334155" strokeWidth="3" strokeLinecap="round" />
                    <line x1="20" y1="105" x2="155" y2="105" stroke="#334155" strokeWidth="3" strokeLinecap="round" />
                    <line x1="20" y1="125" x2="110" y2="125" stroke="#334155" strokeWidth="3" strokeLinecap="round" />
                    {/* Red Circular Politburo Wax Seal */}
                    <circle cx="135" cy="180" r="22" fill="#dc2626" />
                    <circle cx="135" cy="180" r="16" fill="none" stroke="#ffffff" strokeWidth="2" strokeDasharray="4 2" />
                  </g>
                );
              })()}

              {/* Urgency Motion Arrow */}
              <path d="M 370 560 L 510 560" fill="none" stroke="#ef4444" strokeWidth="4" strokeDasharray="8 6" markerEnd="url(#dirArrow)" />

              {/* CHARACTER 2 (RIGHT): High Official (Schabowski) in Executive Suit & Glasses */}
              <g transform={`translate(550, ${350 + Math.sin(frame * 0.12) * 4})`}>
                {/* Torso & Charcoal Suit */}
                <path d="M 60 140 L 160 145 L 180 390 L 40 390 Z" fill="#1e293b" stroke="#475569" strokeWidth="4" />
                <polygon points="75,145 110,240 145,145" fill="#f8fafc" />
                {/* Red Executive Necktie */}
                <polygon points="105,145 115,145 118,255 110,270 102,255" fill="#dc2626" />

                {/* Left Hand Holding Executive Leather Briefcase */}
                <path d="M 155 170 Q 185 240 180 310 L 160 310 Q 165 245 140 180 Z" fill="#1e293b" stroke="#475569" strokeWidth="3" />
                <g transform="translate(170, 310)">
                  <rect x="0" y="0" width="85" height="65" fill="#0f172a" stroke="#f59e0b" strokeWidth="2" rx="4" />
                  <path d="M 28 0 Q 42 -18 57 0" fill="none" stroke="#f59e0b" strokeWidth="4" />
                  <rect x="36" y="25" width="12" height="10" fill="#f59e0b" rx="2" />
                </g>

                {/* Head with Combed Hair & Thick Glasses */}
                <circle cx="110" cy="70" r="36" fill="#1e293b" stroke="#64748b" strokeWidth="3" />
                {/* Combed Back 80s Hair */}
                <path d="M 75 60 C 75 25 145 25 145 60 C 145 40 120 35 90 40 Z" fill="#0f172a" />
                {/* Nose Profile Facing Left */}
                <path d="M 85 70 L 72 80 L 84 88 L 90 102" fill="none" stroke="#cbd5e1" strokeWidth="3" strokeLinecap="round" />
                {/* Square Glasses Frame */}
                <rect x="74" y="65" width="28" height="18" fill="none" stroke="#FFE600" strokeWidth="3" rx="3" />

                {/* Right Arm Reaching Forward to Grasp Folder */}
                <path d="M 65 170 Q 0 190 -70 215 L -60 235 Q 0 215 70 200 Z" fill="#1e293b" stroke="#475569" strokeWidth="3" />
                <circle cx="-65" cy="220" r="14" fill="#cbd5e1" />
              </g>

              {/* Status Banner at Bottom */}
              <g transform="translate(120, 750)">
                <rect x="0" y="0" width="640" height="52" fill="rgba(15, 23, 42, 0.9)" stroke="#ef4444" strokeWidth="2" rx="6" />
                <circle cx="28" cy="26" r="8" fill="#ef4444" />
                <text x="48" y="32" fill="#f8fafc" fontSize="14" fontWeight="900" fontFamily="monospace">
                  STATUS: DRAF DITERIMA TANPA BRIEFING RESMI
                </text>
              </g>
            </g>
          )}

          {/* ======================================================== */}
          {/* SCENE C: PRESS QUESTION (Wartawan Riccardo Ehrman Berdiri Bertanya) */}
          {/* ======================================================== */}
          {type === 'press-question' && (
            <g transform="translate(100, 360)">
              {/* Overhead Spotlight Beam onto Press Conference */}
              <polygon points="440,0 80,720 800,720" fill="url(#spotlightDir)" opacity="0.18" />

              {/* Background Press Conference Desk with Microphones */}
              <g transform="translate(0, 180)" style={{ filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.85))' }}>
                <rect x="220" y="440" width="620" height="110" fill="#1e293b" stroke="#334155" strokeWidth="3" rx="6" />
                <rect x="220" y="440" width="620" height="16" fill="#334155" />
                {/* 3 Microphones on Stands */}
                {[-60, 0, 60].map((offset, idx) => (
                  <g key={idx} transform={`translate(${530 + offset}, 440) rotate(${offset * 0.15})`}>
                    <line x1="0" y1="0" x2="0" y2="-65" stroke="#94a3b8" strokeWidth="6" strokeLinecap="round" />
                    <circle cx="0" cy="-72" r="14" fill="#334155" stroke="#cbd5e1" strokeWidth="2.5" />
                    <circle cx="0" cy="-72" r={20 + pulse * 14} fill="none" stroke="#f59e0b" strokeWidth="1.5" opacity={1 - pulse} />
                  </g>
                ))}
              </g>

              {/* Standing Journalist Character (Riccardo Ehrman - ANSA) */}
              <g transform="translate(160, 310)">
                {/* Reporter's Trenchcoat & Torso */}
                <path d="M 0 340 L 40 180 L 120 180 L 160 340 Z" fill="#334155" />
                {/* Lapels & Collar */}
                <polygon points="60,180 100,180 110,230 50,230" fill="#f8fafc" />
                <polygon points="75,195 85,195 88,270 72,270" fill="#dc2626" />

                {/* Press Credential Badge with Lanyard */}
                <path d="M 65 190 L 80 260 L 95 190" fill="none" stroke="#dc2626" strokeWidth="3" />
                <g transform="translate(68, 255) rotate(4)">
                  <rect x="0" y="0" width="26" height="38" fill="#f8fafc" stroke="#0f172a" strokeWidth="1.5" rx="2" />
                  <rect x="0" y="0" width="26" height="10" fill="#dc2626" />
                  <line x1="4" y1="16" x2="22" y2="16" stroke="#0f172a" strokeWidth="2" />
                  <line x1="4" y1="22" x2="18" y2="22" stroke="#64748b" strokeWidth="1.5" />
                </g>

                {/* Head Leaning Forward Eagerly */}
                <rect x="68" y="145" width="24" height="40" fill="#cbd5e1" />
                <ellipse cx="80" cy="120" rx="36" ry="42" fill="#f1f5f9" />
                {/* Wavy Journalist Hair */}
                <path d="M 45 115 C 42 70, 115 65, 118 115 C 110 95, 70 85, 45 115 Z" fill="#1e293b" />
                {/* Profile Silhouette & Expressive Open Mouth */}
                <ellipse cx="94" cy="118" rx="4" ry="5" fill="#0f172a" />
                <path d="M 104 128 Q 112 135 102 142 Z" fill="#0f172a" />

                {/* Left Arm Resting on Press Chair */}
                <path d="M 40 190 C 15 240, 10 270, 5 320" fill="none" stroke="#334155" strokeWidth="22" strokeLinecap="round" />
                <ellipse cx="5" cy="325" rx="12" ry="9" fill="#cbd5e1" />

                {/* Right Arm Extended Forward Holding Reporter Notepad & Pen */}
                {(() => {
                  const armBob = Math.sin(frame * 0.2) * 4;
                  return (
                    <g transform={`translate(0, ${armBob})`}>
                      <path d="M 120 190 C 160 220, 210 225, 250 215" fill="none" stroke="#334155" strokeWidth="22" strokeLinecap="round" />
                      {/* Cuffed Sleeve */}
                      <rect x="238" y="202" width="16" height="26" fill="#f8fafc" rx="2" transform="rotate(10 246 215)" />
                      {/* Hand Gripping Notebook */}
                      <ellipse cx="258" cy="215" rx="14" ry="12" fill="#cbd5e1" />
                      {/* Spiral Reporter Notepad */}
                      <g transform="translate(262, 175) rotate(15)">
                        <rect x="0" y="0" width="36" height="55" fill="#fef08a" stroke="#ca8a04" strokeWidth="2" rx="3" />
                        <line x1="6" y1="12" x2="30" y2="12" stroke="#0f172a" strokeWidth="2" />
                        <line x1="6" y1="20" x2="26" y2="20" stroke="#0f172a" strokeWidth="2" />
                        <line x1="6" y1="28" x2="30" y2="28" stroke="#0f172a" strokeWidth="2" />
                        {/* Press Pencil */}
                        <line x1="-8" y1="18" x2="14" y2="38" stroke="#f59e0b" strokeWidth="4" strokeLinecap="round" />
                      </g>
                    </g>
                  );
                })()}
              </g>

              {/* TV Broadcast Cameraman Silhouette Beside Him */}
              <g transform="translate(560, 290)">
                {/* Cameraman Body */}
                <polygon points="80,360 160,360 140,240 90,240" fill="#0f172a" />
                <ellipse cx="115" cy="210" rx="26" ry="30" fill="#0f172a" />
                {/* TV News Broadcast Shoulder Camera */}
                <g transform="translate(70, 160)">
                  <rect x="-40" y="0" width="110" height="48" fill="#1e293b" stroke="#475569" strokeWidth="3" rx="4" />
                  <rect x="70" y="8" width="35" height="32" fill="#0f172a" stroke="#64748b" strokeWidth="2" />
                  <circle cx="105" cy="24" r="16" fill="#38bdf8" opacity="0.6" />
                  {/* Blinking Red Tally Light */}
                  <circle cx="-25" cy="12" r="6" fill={pulse > 0.4 ? '#ef4444' : '#7f1d1d'} />
                  {/* Cameraman Hands Steadying Rig */}
                  <ellipse cx="40" cy="54" rx="14" ry="10" fill="#cbd5e1" />
                </g>
              </g>

              {/* Journalist Question Callout Card */}
              <g transform="translate(100, 160)" style={{ filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.9))' }}>
                <rect x="0" y="0" width="680" height="145" fill="rgba(15, 23, 42, 0.96)" stroke="#38bdf8" strokeWidth="3" rx="10" />
                <rect x="0" y="0" width="12" height="145" fill="#38bdf8" />

                <text x="35" y="38" fill="#38bdf8" fontSize="13" fontWeight="900" fontFamily="monospace" letterSpacing="2">
                  PERTANYAAN WARTAWAN // VERBATIM:
                </text>

                <text
                  x="35"
                  y="88"
                  fill="#FFE600"
                  fontSize="26"
                  fontWeight="900"
                  fontFamily="'Montserrat', sans-serif"
                  style={{ filter: 'drop-shadow(0 2px 10px rgba(0,0,0,0.8))' }}
                >
                  "{quoteText || primaryText || 'Kapan peraturan ini mulai berlaku?'}"
                </text>

                <text x="35" y="122" fill="#94a3b8" fontSize="14" fontWeight="700" fontFamily="monospace">
                  {secondaryText || 'Riccardo Ehrman (ANSA) mencecar di tengah konferensi'}
                </text>
              </g>
            </g>
          )}

          {/* ======================================================== */}
          {/* SCENE D: SCHABOWSKI SLIP (Juru Bicara Schabowski Tergagap di Podium) */}
          {/* ======================================================== */}
          {(type === 'schabowski-slip' || type === 'audio-spectrogram') && (
            <g transform="translate(100, 360)">
              {/* Camera Flashbulbs Popping Around Podium */}
              {(() => {
                const flash1 = (frame * 3) % 29 < 3;
                const flash2 = (frame * 5 + 11) % 31 < 3;
                return (
                  <g>
                    {flash1 && <circle cx="200" cy="220" r="140" fill="#ffffff" opacity="0.8" />}
                    {flash2 && <circle cx="680" cy="250" r="160" fill="#ffffff" opacity="0.75" />}
                  </g>
                );
              })()}

              {/* Main Press Conference Table in Foreground */}
              <g style={{ filter: 'drop-shadow(0 25px 50px rgba(0,0,0,0.95))' }}>
                <rect x="60" y="520" width="760" height="180" fill="#1e293b" stroke="#334155" strokeWidth="4" rx="8" />
                <rect x="60" y="520" width="760" height="24" fill="#334155" />
                <line x1="60" y1="544" x2="820" y2="544" stroke="#f59e0b" strokeWidth="2" opacity="0.6" />
              </g>

              {/* Spokesman Günter Schabowski Behind Podium */}
              <g transform="translate(440, 270)">
                {/* Torso in Dark Formal Suit */}
                <polygon points="-110,260 110,260 85,120 -85,120" fill="#0f172a" />
                {/* White Shirt Collar */}
                <polygon points="-30,120 30,120 40,170 -40,170" fill="#f8fafc" />
                {/* Striped Tie */}
                <polygon points="-12,140 12,140 16,240 0,255 -16,240" fill="#dc2626" />
                <line x1="-6" y1="160" x2="6" y2="180" stroke="#f8fafc" strokeWidth="2" />
                <line x1="-8" y1="190" x2="8" y2="210" stroke="#f8fafc" strokeWidth="2" />

                {/* Head & Neck */}
                <rect x="-20" y="90" width="40" height="35" fill="#cbd5e1" rx="4" />
                <ellipse cx="0" cy="55" rx="52" ry="58" fill="#f1f5f9" />
                {/* Receding Grey Hair */}
                <path d="M -54 50 C -50 -10, 50 -10, 54 50 C 42 20, -42 20, -54 50 Z" fill="#64748b" />

                {/* Rectangular Reading Glasses */}
                <rect x="-42" y="46" width="34" height="22" fill="none" stroke="#0f172a" strokeWidth="3.5" rx="3" />
                <rect x="8" y="46" width="34" height="22" fill="none" stroke="#0f172a" strokeWidth="3.5" rx="3" />
                <line x1="-8" y1="56" x2="8" y2="56" stroke="#0f172a" strokeWidth="3.5" />

                {/* Bewildered Eyes & Furrowed Brow */}
                <ellipse cx="-25" cy="56" rx="5" ry="6" fill="#0f172a" />
                <ellipse cx="25" cy="56" rx="5" ry="6" fill="#0f172a" />
                <line x1="-36" y1="40" x2="-14" y2="44" stroke="#475569" strokeWidth="3" />
                <line x1="14" y1="44" x2="36" y2="40" stroke="#475569" strokeWidth="3" />

                {/* Open Mouth Hesitating / Stumbling on Words */}
                <ellipse cx="0" cy="85" rx="10" ry={7 + Math.sin(frame * 0.4) * 3} fill="#0f172a" />

                {/* Hands Shuffling Documents on Desk */}
                {(() => {
                  const shuffle = Math.sin(frame * 0.25) * 4;
                  return (
                    <g transform={`translate(0, ${shuffle})`}>
                      {/* Left Arm & Hand Holding Page */}
                      <path d="M -85 140 C -120 180, -140 220, -120 260 L -70 260" fill="none" stroke="#0f172a" strokeWidth="28" strokeLinecap="round" />
                      <ellipse cx="-70" cy="260" rx="14" ry="10" fill="#cbd5e1" />
                      {/* Right Arm & Hand Turning Page */}
                      <path d="M 85 140 C 120 180, 140 220, 120 260 L 70 260" fill="none" stroke="#0f172a" strokeWidth="28" strokeLinecap="round" />
                      <ellipse cx="70" cy="260" rx="14" ry="10" fill="#cbd5e1" />

                      {/* Official Memo Paper in Front of Him */}
                      <g transform="translate(-100, 240) rotate(-2)">
                        <rect x="0" y="0" width="200" height="70" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="2" rx="3" />
                        <line x1="15" y1="18" x2="185" y2="18" stroke="#94a3b8" strokeWidth="3" />
                        <line x1="15" y1="32" x2="160" y2="32" stroke="#94a3b8" strokeWidth="3" />
                        <rect x="15" y="44" width="170" height="16" fill="#fde047" rx="2" />
                        <line x1="20" y1="52" x2="165" y2="52" stroke="#dc2626" strokeWidth="2" />
                      </g>
                    </g>
                  );
                })()}
              </g>

              {/* Cluster of 4 Microphones in Front of Schabowski */}
              <g transform="translate(440, 520)">
                {[-70, -25, 25, 70].map((mx, idx) => (
                  <g key={idx} transform={`translate(${mx}, 0) rotate(${mx * 0.12})`}>
                    <line x1="0" y1="0" x2="0" y2="-90" stroke="#94a3b8" strokeWidth="6" strokeLinecap="round" />
                    <circle cx="0" cy="-98" r="14" fill="#1e293b" stroke="#cbd5e1" strokeWidth="2.5" />
                    <circle cx="0" cy="-98" r={22 + pulse * 14} fill="none" stroke="#ef4444" strokeWidth="2" opacity={1 - pulse} />
                  </g>
                ))}
              </g>

              {/* Verbatim Fatal Quote Transcript Card at Top */}
              <g transform="translate(100, 150)" style={{ filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.92))' }}>
                <rect x="0" y="0" width="680" height="155" fill="rgba(15, 23, 42, 0.96)" stroke="#ef4444" strokeWidth="3" rx="10" />
                <rect x="0" y="0" width="12" height="155" fill="#ef4444" />

                <text x="35" y="38" fill="#ef4444" fontSize="13" fontWeight="900" fontFamily="monospace" letterSpacing="2">
                  SLIP LIDAH FATAL // TRANSKRIP RESMI:
                </text>

                <text x="35" y="85" fill="#FFE600" fontSize="26" fontWeight="900" fontFamily="'Montserrat', sans-serif">
                  "{quoteText || primaryText || 'Das tritt nach meiner Kenntnis... ist das sofort.'}"
                </text>
                <text x="35" y="118" fill="#f8fafc" fontSize="22" fontWeight="900" fontFamily="'Montserrat', sans-serif">
                  {secondaryText || '"...unverzüglich." (Detik ini juga)'}
                </text>
                <text x="35" y="142" fill="#94a3b8" fontSize="12" fontWeight="700" fontFamily="monospace">
                  Pernyataan blunder yang memicu jutaan warga menuju perbatasan
                </text>
              </g>
            </g>
          )}

          {/* ======================================================== */}
          {/* SCENE E: BREAKING NEWS (Penyiar TV Siaran Darurat di Studio) */}
          {/* ======================================================== */}
          {type === 'breaking-news' && (
            <g transform="translate(100, 360)">
              {/* Studio Backdrop & World Map Vector */}
              <g transform="translate(40, 160)" style={{ filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.85))' }}>
                <rect x="0" y="0" width="800" height="380" fill="#091322" stroke="#1e293b" strokeWidth="4" rx="8" />
                {/* World Grid Lines */}
                {[80, 160, 240, 320].map((ly) => (
                  <line key={ly} x1="40" y1={ly} x2="760" y2={ly} stroke="#1e3a8a" strokeWidth="1.5" opacity="0.4" strokeDasharray="8 6" />
                ))}
                {/* Glowing Studio On-Air Light */}
                <g transform="translate(640, 40)">
                  <rect x="0" y="0" width="120" height="36" fill="#020617" stroke="#ef4444" strokeWidth="2" rx="4" />
                  <circle cx="20" cy="18" r="7" fill={pulse > 0.4 ? '#ef4444' : '#7f1d1d'} />
                  <text x="36" y="24" fill="#f8fafc" fontSize="13" fontWeight="900" fontFamily="monospace">
                    ON AIR
                  </text>
                </g>
              </g>

              {/* Television News Anchor Character (Center) */}
              <g transform="translate(440, 260)">
                {/* Anchor Dark Navy Suit Torso */}
                <polygon points="-110,280 110,280 90,120 -90,120" fill="#0f172a" />
                {/* White Shirt & Red Silk Tie */}
                <polygon points="-30,120 30,120 40,180 -40,180" fill="#f8fafc" />
                <polygon points="-12,140 12,140 15,260 0,275 -15,260" fill="#dc2626" />

                {/* Head & Groomed Hair */}
                <rect x="-18" y="90" width="36" height="35" fill="#cbd5e1" rx="4" />
                <ellipse cx="0" cy="55" rx="48" ry="54" fill="#f1f5f9" />
                <path d="M -50 45 C -45 -10, 45 -10, 50 45 C 35 15, -35 15, -50 45 Z" fill="#1e293b" />

                {/* Broadcast Earpiece with Coiled Wire */}
                <circle cx="48" cy="58" r="6" fill="#f59e0b" />
                <path d="M 48 64 C 55 90, 45 120, 40 140" fill="none" stroke="#f59e0b" strokeWidth="2" />

                {/* Focused Anchor Eyes & Speaking Mouth */}
                <ellipse cx="-20" cy="54" rx="4" ry="5" fill="#0f172a" />
                <ellipse cx="20" cy="54" rx="4" ry="5" fill="#0f172a" />
                <ellipse cx="0" cy="78" rx="8" ry={5 + Math.sin(frame * 0.35) * 3} fill="#0f172a" />

                {/* Arms Resting on News Desk Holding Paper Copy */}
                <path d="M -90 140 C -120 180, -140 230, -110 270 L -50 270" fill="none" stroke="#0f172a" strokeWidth="28" strokeLinecap="round" />
                <path d="M 90 140 C 120 180, 140 230, 110 270 L 50 270" fill="none" stroke="#0f172a" strokeWidth="28" strokeLinecap="round" />
                <ellipse cx="-50" cy="270" rx="14" ry="10" fill="#cbd5e1" />
                <ellipse cx="50" cy="270" rx="14" ry="10" fill="#cbd5e1" />

                {/* News Copy Script Sheets in Hands */}
                <g transform="translate(-70, 240) rotate(-6)">
                  <rect x="0" y="0" width="140" height="75" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="2" rx="3" />
                  <line x1="12" y1="16" x2="128" y2="16" stroke="#94a3b8" strokeWidth="3" />
                  <line x1="12" y1="28" x2="110" y2="28" stroke="#94a3b8" strokeWidth="3" />
                  <line x1="12" y1="40" x2="128" y2="40" stroke="#ef4444" strokeWidth="3" />
                </g>
              </g>

              {/* Curved Modern Anchor Desk in Foreground */}
              <g style={{ filter: 'drop-shadow(0 25px 45px rgba(0,0,0,0.95))' }}>
                <rect x="60" y="520" width="760" height="160" fill="#1e293b" stroke="#38bdf8" strokeWidth="3" rx="8" />
                <rect x="60" y="520" width="760" height="22" fill="#38bdf8" opacity="0.3" />
                {/* Mini Desk Microphone */}
                <g transform="translate(320, 520)">
                  <line x1="0" y1="0" x2="0" y2="-50" stroke="#94a3b8" strokeWidth="5" />
                  <circle cx="0" cy="-55" r="10" fill="#475569" stroke="#cbd5e1" strokeWidth="2" />
                </g>
              </g>

              {/* Breaking News Lower-Third Banner */}
              <g transform="translate(60, 570)" style={{ filter: 'drop-shadow(0 15px 30px rgba(0,0,0,0.9))' }}>
                <rect x="0" y="0" width="760" height="50" fill="#dc2626" rx="4" />
                <text x="25" y="33" fill="#ffffff" fontSize="22" fontWeight="900" fontFamily="monospace" letterSpacing="3">
                  🔴 {primaryText || 'BREAKING NEWS // SIARAN TELEVISI DUNIA'}
                </text>
                <text x="25" y="85" fill="#FFE600" fontSize="26" fontWeight="900" fontFamily="'Montserrat', sans-serif">
                  {title}
                </text>
              </g>
            </g>
          )}

          {/* ======================================================== */}
          {/* SCENE F: PANIC PHONE (Komandan Jaga Harald Jäger di Pos) */}
          {/* ======================================================== */}
          {type === 'panic-phone' && (
            <g transform="translate(140, 360)">
              {/* Guardhouse Observation Window overlooking Border Fence */}
              <g style={{ filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.95))' }}>
                <rect x="60" y="140" width="680" height="360" fill="#070d18" stroke="#334155" strokeWidth="4" rx="6" />
                <line x1="60" y1="320" x2="740" y2="320" stroke="#1e293b" strokeWidth="3" />
                <line x1="400" y1="140" x2="400" y2="500" stroke="#1e293b" strokeWidth="3" />

                {/* Night Searchlight Beam outside Window */}
                {(() => {
                  const searchX = 350 + Math.sin(frame * 0.05) * 140;
                  return (
                    <polygon
                      points={`680,160 ${searchX - 80},500 ${searchX + 120},500`}
                      fill="url(#spotlightDir)"
                      opacity="0.25"
                    />
                  );
                })()}

                {/* Barbed Wire Silhouettes outside */}
                <line x1="60" y1="420" x2="740" y2="420" stroke="#475569" strokeWidth="2" strokeDasharray="14 10" />
                <line x1="60" y1="460" x2="740" y2="460" stroke="#475569" strokeWidth="2" strokeDasharray="10 8" />
              </g>

              {/* Guardhouse Wall Clock at 21:00 */}
              <g transform="translate(660, 220)">
                <circle cx="0" cy="0" r="32" fill="#0f172a" stroke="#ef4444" strokeWidth="3" />
                <line x1="0" y1="0" x2="0" y2="-20" stroke="#f8fafc" strokeWidth="3" strokeLinecap="round" />
                <line x1="0" y1="0" x2="-18" y2="0" stroke="#f8fafc" strokeWidth="3" strokeLinecap="round" />
                <text x="0" y="46" fill="#ef4444" fontSize="11" fontWeight="900" fontFamily="monospace" textAnchor="middle">
                  21:00
                </text>
              </g>

              {/* Flashing Red Emergency Beacon on Wall */}
              <g transform="translate(130, 210)">
                <circle cx="0" cy="0" r={45 + pulse * 25} fill="none" stroke="#ef4444" strokeWidth="3" opacity={1 - pulse * 0.7} />
                <circle cx="0" cy="0" r="28" fill="#dc2626" style={{ filter: 'drop-shadow(0 0 25px #ef4444)' }} />
                <polygon
                  points={`0,0 -80,180 80,180`}
                  fill="rgba(239, 68, 68, 0.2)"
                  transform={`rotate(${(frame * 10) % 360})`}
                />
              </g>

              {/* Wood & Steel Command Console Desk */}
              <rect x="40" y="560" width="720" height="180" fill="#1e293b" stroke="#475569" strokeWidth="4" rx="6" />
              <line x1="40" y1="585" x2="760" y2="585" stroke="#334155" strokeWidth="3" />

              {/* BORDER COMMANDER HARALD JÄGER (FULL HUMAN FIGURE) */}
              <g transform={`translate(280, ${320 + Math.sin(frame * 0.08) * 3})`}>
                {/* Military Greatcoat Torso */}
                <path d="M 40 160 L 180 160 L 220 420 L 0 420 Z" fill="#0f172a" stroke="#334155" strokeWidth="4" />
                {/* Double-Breasted Brass Buttons */}
                {[200, 240, 280, 320].map((by) => (
                  <g key={by}>
                    <circle cx="85" cy={by} r="5" fill="#f59e0b" />
                    <circle cx="135" cy={by} r="5" fill="#f59e0b" />
                  </g>
                ))}
                {/* Red Officer Collar Tabs & Gold Epaulets */}
                <polygon points="65,160 85,160 80,195 60,195" fill="#dc2626" />
                <polygon points="135,160 155,160 160,195 140,195" fill="#dc2626" />
                <rect x="35" y="155" width="30" height="12" fill="#f59e0b" rx="2" />
                <rect x="155" y="155" width="30" height="12" fill="#f59e0b" rx="2" />

                {/* Left Arm Pressed Flat on Console Desk */}
                <path d="M 45 180 Q 0 280 -25 380 L -5 385 Q 25 290 65 200 Z" fill="#0f172a" stroke="#334155" strokeWidth="3" />
                <g transform="translate(-40, 380)">
                  {/* Flat Palm Straining on Desk */}
                  <rect x="0" y="0" width="35" height="15" fill="#cbd5e1" rx="3" />
                  <line x1="8" y1="0" x2="8" y2="-12" stroke="#cbd5e1" strokeWidth="4" strokeLinecap="round" />
                  <line x1="16" y1="0" x2="16" y2="-14" stroke="#cbd5e1" strokeWidth="4" strokeLinecap="round" />
                  <line x1="24" y1="0" x2="24" y2="-12" stroke="#cbd5e1" strokeWidth="4" strokeLinecap="round" />
                </g>

                {/* Officer Head & Face Profile */}
                <g transform="translate(110, 80)">
                  <circle cx="0" cy="0" r="42" fill="#1e293b" stroke="#475569" strokeWidth="3" />

                  {/* East German Officer Peaked Cap */}
                  <path d="M -48 -15 Q 0 -55 48 -15 L 56 -5 Q 0 -35 -48 -5 Z" fill="#0f172a" stroke="#334155" strokeWidth="3" />
                  {/* Black Visor */}
                  <path d="M 15 -10 Q 55 -5 65 12 L 40 10 Z" fill="#020617" stroke="#000" strokeWidth="2" />
                  {/* Cockade Emblem */}
                  <circle cx="0" cy="-24" r="8" fill="#dc2626" />
                  <circle cx="0" cy="-24" r="5" fill="#f59e0b" />

                  {/* Face Features: Intense Eye, Nose, Tense Open Mouth */}
                  <path d="M 32 -5 L 48 5 L 34 15 L 36 28 L 22 36" fill="none" stroke="#cbd5e1" strokeWidth="3" strokeLinecap="round" />
                  <circle cx="28" cy="2" r="3" fill="#f8fafc" />
                  <line x1="20" y1="-8" x2="35" y2="-3" stroke="#f8fafc" strokeWidth="3" strokeLinecap="round" />

                  {/* Sweat Droplets on Forehead under Emergency Pressure */}
                  <path d="M 24 -14 C 22 -10 22 -6 24 -4 C 26 -6 26 -10 24 -14" fill="#38bdf8" />
                  <path d="M 34 -8 C 32 -4 32 0 34 2 C 36 0 36 -4 34 -8" fill="#38bdf8" />
                </g>

                {/* Right Arm Raised Holding Telephone Handset to Ear */}
                <path d="M 160 180 Q 230 190 225 110 L 205 105 Q 200 170 145 195 Z" fill="#0f172a" stroke="#334155" strokeWidth="3" />

                {/* Telephone Handset at Ear */}
                <g transform="translate(195, 75) rotate(-15)">
                  <rect x="-12" y="-35" width="24" height="70" fill="#0f172a" stroke="#ef4444" strokeWidth="2" rx="8" />
                  <circle cx="0" cy="-30" r="16" fill="#1e293b" stroke="#ef4444" strokeWidth="2" />
                  <circle cx="0" cy="30" r="16" fill="#1e293b" stroke="#ef4444" strokeWidth="2" />
                  {/* Hand Clamping Receiver */}
                  <circle cx="0" cy="0" r="14" fill="#cbd5e1" />
                </g>

                {/* Coiled Telephone Cord with Dynamic Hand Tremor */}
                {(() => {
                  const shake = Math.sin(frame * 0.4) * 3;
                  return (
                    <path
                      d={`M 200 115 Q ${230 + shake} 180 215 260 Q ${190 - shake} 330 230 400 L 250 430`}
                      fill="none"
                      stroke="#ef4444"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                    />
                  );
                })()}
              </g>

              {/* Rotary Phone Base on Console Desk */}
              <g transform="translate(530, 600)">
                <rect x="0" y="0" width="130" height="90" fill="#0f172a" stroke="#64748b" strokeWidth="3" rx="8" />
                <circle cx="65" cy="45" r="28" fill="#1e293b" stroke="#94a3b8" strokeWidth="2" />
                <circle cx="65" cy="45" r="10" fill="#dc2626" />
                {/* Telephone Cradle Latch */}
                <path d="M 35 0 L 35 -15 L 45 -15 M 85 -15 L 95 -15 L 95 0" fill="none" stroke="#64748b" strokeWidth="3" />
              </g>

              {/* Checkpoint Dossier / Maps on Desk */}
              <g transform="translate(80, 610) rotate(-4)">
                <rect x="0" y="0" width="150" height="85" fill="#f8fafc" stroke="#94a3b8" strokeWidth="2" rx="3" />
                <text x="75" y="24" fill="#dc2626" fontSize="10" fontWeight="900" fontFamily="monospace" textAnchor="middle">
                  POS BORNHOLMER
                </text>
                <line x1="20" y1="36" x2="130" y2="36" stroke="#334155" strokeWidth="2" />
                <line x1="20" y1="48" x2="110" y2="48" stroke="#334155" strokeWidth="2" />
                <line x1="20" y1="60" x2="120" y2="60" stroke="#334155" strokeWidth="2" />
              </g>

              {/* High-Impact Status Telemetry HUD Bar */}
              <g transform="translate(40, 750)">
                <rect x="0" y="0" width="720" height="52" fill="rgba(15, 23, 42, 0.95)" stroke="#ef4444" strokeWidth="2" rx="6" />
                <circle cx="28" cy="26" r="8" fill="#ef4444" style={{ filter: 'drop-shadow(0 0 10px #ef4444)' }} />
                <text x="48" y="32" fill="#f8fafc" fontSize="14" fontWeight="900" fontFamily="monospace">
                  KOMANDAN JAGA HARALD JÄGER: TELEPON MARKAS BESAR TERBUNGKAM
                </text>
              </g>
            </g>
          )}

          {/* ======================================================== */}
          {/* SCENE G: GEOPOLITICAL COLLAPSE (Prajurit Menurunkan Bendera di Pos) */}
          {/* ======================================================== */}
          {(type === 'soviet-collapse' || type === 'systemic-collapse') && (
            <g transform="translate(100, 360)">
              {/* Cold War Twilight Sky Gradient */}
              <rect x="40" y="140" width="800" height="420" fill="#090f1d" stroke="#1e293b" strokeWidth="4" rx="8" />

              {/* Striped Border Boundary Post */}
              <g transform="translate(160, 240)">
                <rect x="-16" y="0" width="32" height="340" fill="#f8fafc" stroke="#0f172a" strokeWidth="2" />
                {[0, 60, 120, 180, 240, 300].map((by) => (
                  <polygon key={by} points={`-16,${by} 16,${by + 25} 16,${by + 50} -16,${by + 25}`} fill="#dc2626" />
                ))}
                {/* State Cockade Crest on Post */}
                <circle cx="0" cy="-15" r="16" fill="#dc2626" stroke="#FFE600" strokeWidth="3" />
                <circle cx="0" cy="-15" r="8" fill="#FFE600" />
              </g>

              {/* Tall Steel Flagpole */}
              <line x1="560" y1="140" x2="560" y2="580" stroke="#94a3b8" strokeWidth="8" strokeLinecap="round" />
              <circle cx="560" cy="140" r="12" fill="#f59e0b" />

              {/* Descending State Flag Fluttering in Wind */}
              {(() => {
                const flagDrop = interpolate(frame, [0, 60], [170, 310], { extrapolateRight: 'clamp' });
                const wave1 = Math.sin(frame * 0.25) * 8;
                const wave2 = Math.cos(frame * 0.28) * 10;
                return (
                  <g transform={`translate(560, ${flagDrop})`}>
                    <path
                      d={`M 0 0 Q 70 ${wave1} 140 0 Q 210 ${-wave1} 240 ${wave2} L 240 ${80 + wave2} Q 210 ${80 - wave1} 140 80 Q 70 ${80 + wave1} 0 80 Z`}
                      fill="#dc2626"
                      stroke="#991b1b"
                      strokeWidth="2"
                    />
                    {/* Gold Hammer & Sickle Emblem */}
                    <circle cx="50" cy="35" r="14" fill="none" stroke="#FFE600" strokeWidth="3" />
                    <line x1="42" y1="28" x2="58" y2="42" stroke="#FFE600" strokeWidth="3" />
                    <line x1="58" y1="28" x2="42" y2="42" stroke="#FFE600" strokeWidth="3" />
                  </g>
                );
              })()}

              {/* Soldier 1: Untying Flag Lanyard at Flagpole */}
              <g transform="translate(500, 310)">
                {/* Soviet Greatcoat Torso */}
                <polygon points="10,270 90,270 75,120 25,120" fill="#1e293b" />
                {/* Leather Belt & Buckle */}
                <rect x="18" y="210" width="64" height="18" fill="#78350f" stroke="#0f172a" strokeWidth="2" />
                <rect x="42" y="210" width="16" height="18" fill="#f59e0b" />

                {/* Head & Ushanka Fur Cap */}
                <rect x="42" y="90" width="16" height="30" fill="#cbd5e1" />
                <ellipse cx="50" cy="65" rx="30" ry="34" fill="#f1f5f9" />
                {/* Ushanka Cap with Flaps */}
                <path d="M 20 65 C 18 20, 82 20, 80 65 L 85 75 L 15 75 Z" fill="#334155" />
                <circle cx="50" cy="50" r="7" fill="#dc2626" stroke="#FFE600" strokeWidth="1.5" />

                {/* Arms Raised Pulling Lanyard Rope */}
                {(() => {
                  const pull = Math.sin(frame * 0.3) * 6;
                  return (
                    <g transform={`translate(0, ${pull})`}>
                      <path d="M 30 135 C 50 160, 65 140, 70 120" fill="none" stroke="#1e293b" strokeWidth="18" strokeLinecap="round" />
                      <ellipse cx="70" cy="115" rx="10" ry="8" fill="#cbd5e1" />
                      <line x1="70" y1="115" x2="60" y2="240" stroke="#f8fafc" strokeWidth="3" strokeDasharray="6 4" />
                    </g>
                  );
                })()}
              </g>

              {/* Soldier 2: Standing at Rigid Attention at Left */}
              <g transform="translate(260, 310)">
                {/* Soviet Greatcoat Torso */}
                <polygon points="-40,270 40,270 32,120 -32,120" fill="#1e293b" />
                {/* Epaulettes on Shoulders */}
                <rect x="-35" y="120" width="18" height="8" fill="#dc2626" rx="2" />
                <rect x="17" y="120" width="18" height="8" fill="#dc2626" rx="2" />
                {/* Belt */}
                <rect x="-30" y="210" width="60" height="18" fill="#78350f" stroke="#0f172a" strokeWidth="2" />
                <rect x="-8" y="210" width="16" height="18" fill="#f59e0b" />

                {/* Head & Peaked Visor Cap */}
                <rect x="-8" y="90" width="16" height="30" fill="#cbd5e1" />
                <ellipse cx="0" cy="65" rx="28" ry="32" fill="#f1f5f9" />
                {/* Peaked Military Cap */}
                <polygon points="-35,50 35,50 25,25 -25,25" fill="#1e293b" />
                <ellipse cx="0" cy="52" rx="36" ry="6" fill="#0f172a" />
                <circle cx="0" cy="38" r="6" fill="#dc2626" stroke="#FFE600" strokeWidth="1.5" />

                {/* Slung Rifle Across Shoulder */}
                <line x1="-28" y1="70" x2="-28" y2="260" stroke="#475569" strokeWidth="6" strokeLinecap="round" />
                <polygon points="-32,60 -24,60 -26,30 -30,30" fill="#94a3b8" />
              </g>

              {/* Status Telemetry Banner */}
              <g transform="translate(60, 580)" style={{ filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.92))' }}>
                <rect x="0" y="0" width="760" height="60" fill="rgba(15, 23, 42, 0.96)" stroke="#ef4444" strokeWidth="3" rx="8" />
                <rect x="0" y="0" width="10" height="60" fill="#ef4444" />
                <text x="30" y="26" fill="#ef4444" fontSize="12" fontWeight="900" fontFamily="monospace" letterSpacing="2">
                  DEKLASIFIKASI // RUNTUHNYA SEKTOR GEOPOLITIK:
                </text>
                <text x="30" y="48" fill="#FFE600" fontSize="18" fontWeight="900" fontFamily="'Montserrat', sans-serif">
                  {primaryText || secondaryText || 'TITIK BALIK SEJARAH DUNIA'}
                </text>
              </g>
            </g>
          )}

          {/* ======================================================== */}
          {/* SCENE H: TACTICAL MAP (Dua Jenderal di Meja Strategi Perang) */}
          {/* ======================================================== */}
          {type === 'tactical-map' && (
            <g transform="translate(100, 360)">
              {/* Hanging Industrial War Room Lamp */}
              <polygon points="440,80 120,680 760,680" fill="url(#spotlightDir)" opacity="0.16" />
              <line x1="440" y1="0" x2="440" y2="80" stroke="#64748b" strokeWidth="4" />
              <ellipse cx="440" cy="80" rx="35" ry="12" fill="#1e293b" stroke="#cbd5e1" strokeWidth="2" />

              {/* Large Strategic Situation Map Table in Center */}
              <g transform="translate(80, 360)" style={{ filter: 'drop-shadow(0 25px 50px rgba(0,0,0,0.95))' }}>
                {/* Perspective Table Surface */}
                <polygon points="60,0 660,0 720,240 0,240" fill="#091829" stroke="#38bdf8" strokeWidth="4" />
                {/* Glowing Tactical Grid Lines */}
                {[50, 100, 150, 190].map((gy) => (
                  <line key={gy} x1={40 + gy * 0.15} y1={gy} x2={680 - gy * 0.15} y2={gy} stroke="#1e3a8a" strokeWidth="1.5" strokeDasharray="8 6" />
                ))}
                {/* Radar Concentric Rings in Map Center */}
                <ellipse cx="360" cy="120" rx="140" ry="70" fill="none" stroke="#38bdf8" strokeWidth="2" opacity="0.6" />
                <ellipse cx="360" cy="120" rx="80" ry="40" fill="none" stroke="#38bdf8" strokeWidth="2" strokeDasharray="6 4" opacity="0.7" />
                {/* Blinking Critical Target Epicenter */}
                <circle cx="410" cy="115" r={10 + pulse * 14} fill="none" stroke="#ef4444" strokeWidth="3" opacity={1 - pulse * 0.7} />
                <circle cx="410" cy="115" r="7" fill="#ef4444" />
              </g>

              {/* General 1 (Left - Senior Officer Leaning on Table) */}
              <g transform="translate(180, 260)">
                {/* Officer Uniform Torso */}
                <polygon points="-60,260 60,260 45,110 -45,110" fill="#1e293b" />
                {/* Gold Epaulettes & Collar */}
                <rect x="-48" y="110" width="22" height="10" fill="#f59e0b" rx="2" />
                <rect x="26" y="110" width="22" height="10" fill="#f59e0b" rx="2" />
                <polygon points="-15,110 15,110 20,150 -20,150" fill="#f8fafc" />
                <polygon points="-6,130 6,130 8,220 -8,220" fill="#dc2626" />

                {/* Head with Reading Glasses Tilted Down at Map */}
                <rect x="-12" y="80" width="24" height="30" fill="#cbd5e1" />
                <ellipse cx="0" cy="55" rx="36" ry="40" fill="#f1f5f9" />
                <path d="M -38 45 C -35 5, 35 5, 38 45 C 28 20, -28 20, -38 45 Z" fill="#0f172a" />
                {/* Glasses */}
                <rect x="-26" y="48" width="22" height="15" fill="none" stroke="#f59e0b" strokeWidth="2.5" rx="2" />
                <rect x="4" y="48" width="22" height="15" fill="none" stroke="#f59e0b" strokeWidth="2.5" rx="2" />
                <line x1="-4" y1="55" x2="4" y2="55" stroke="#f59e0b" strokeWidth="2.5" />

                {/* Arms Leaning Firmly on Table Edge */}
                <path d="M -45 125 C -70 170, -60 220, -40 260" fill="none" stroke="#1e293b" strokeWidth="22" strokeLinecap="round" />
                <path d="M 45 125 C 70 170, 75 220, 60 260" fill="none" stroke="#1e293b" strokeWidth="22" strokeLinecap="round" />
                <ellipse cx="-40" cy="265" rx="14" ry="10" fill="#cbd5e1" />
                <ellipse cx="60" cy="265" rx="14" ry="10" fill="#cbd5e1" />
              </g>

              {/* General 2 (Right - Commander Pointing with Tactical Baton) */}
              <g transform="translate(680, 260)">
                {/* Officer Uniform Torso */}
                <polygon points="-55,260 55,260 40,110 -40,110" fill="#0f172a" />
                {/* Gold Epaulettes */}
                <rect x="-44" y="110" width="20" height="10" fill="#f59e0b" rx="2" />
                <rect x="24" y="110" width="20" height="10" fill="#f59e0b" rx="2" />

                {/* Head & Service Cap */}
                <rect x="-10" y="80" width="20" height="30" fill="#cbd5e1" />
                <ellipse cx="0" cy="55" rx="34" ry="38" fill="#f1f5f9" />
                <polygon points="-40,40 40,40 30,15 -30,15" fill="#1e293b" />
                <ellipse cx="0" cy="42" rx="44" ry="7" fill="#0f172a" />

                {/* Left Arm at Side */}
                <path d="M 40 120 C 60 170, 50 220, 45 260" fill="none" stroke="#0f172a" strokeWidth="20" strokeLinecap="round" />

                {/* Right Arm Extended Forward Pointing Baton at Table Target */}
                {(() => {
                  const batonTilt = Math.sin(frame * 0.2) * 5;
                  return (
                    <g transform={`rotate(${batonTilt} -35 125)`}>
                      <path d="M -35 125 C -75 160, -120 180, -160 190" fill="none" stroke="#0f172a" strokeWidth="22" strokeLinecap="round" />
                      <ellipse cx="-165" cy="190" rx="12" ry="10" fill="#cbd5e1" />
                      {/* Wooden Tactical Pointer Baton */}
                      <line x1="-165" y1="190" x2="-260" y2="215" stroke="#d97706" strokeWidth="6" strokeLinecap="round" />
                      <circle cx="-260" cy="215" r="5" fill="#fef08a" />
                    </g>
                  );
                })()}
              </g>

              {/* Situation Telemetry Header */}
              <g transform="translate(100, 160)" style={{ filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.9))' }}>
                <rect x="0" y="0" width="680" height="85" fill="rgba(15, 23, 42, 0.95)" stroke="#38bdf8" strokeWidth="3" rx="8" />
                <text x="30" y="32" fill="#38bdf8" fontSize="13" fontWeight="900" fontFamily="monospace" letterSpacing="2">
                  WAR ROOM // RUANG STRATEGI MILITER:
                </text>
                <text x="30" y="62" fill="#FFE600" fontSize="20" fontWeight="900" fontFamily="'Montserrat', sans-serif">
                  {primaryText || secondaryText || title}
                </text>
              </g>
            </g>
          )}

          {/* ======================================================== */}
          {/* SCENE I: CRITICAL GAUGE (Teknisi Memutar Katup Darurat)  */}
          {/* ======================================================== */}
          {type === 'critical-gauge' && (
            <g transform="translate(100, 360)">
              {/* Emergency Red Flashing Bulkhead Ambient */}
              <rect x="40" y="140" width="800" height="420" fill="#140607" stroke="#dc2626" strokeWidth="3" rx="8" />

              {/* Heavy Steam Pipe Lines */}
              <rect x="80" y="440" width="720" height="70" fill="#1e293b" stroke="#334155" strokeWidth="4" rx="4" />
              <rect x="460" y="200" width="60" height="310" fill="#1e293b" stroke="#334155" strokeWidth="4" rx="4" />

              {/* Escaping High Pressure Steam Jets */}
              {Array.from({ length: 10 }).map((_, i) => {
                const sDist = ((frame * 12 + i * 22) % 150) + 20;
                const sAngle = -65 + (i % 5) * 25;
                const sx = 460 + Math.cos((sAngle * Math.PI) / 180) * sDist;
                const sy = 410 + Math.sin((sAngle * Math.PI) / 180) * sDist;
                return (
                  <circle
                    key={i}
                    cx={sx}
                    cy={sy}
                    r={12 + (i % 4) * 4}
                    fill="#f8fafc"
                    opacity={Math.max(0, 0.85 - sDist / 170)}
                  />
                );
              })}

              {/* Massive Industrial Overload Gauge on Bulkhead */}
              <g transform="translate(240, 270)" style={{ filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.95))' }}>
                <circle cx="0" cy="0" r="110" fill="#0f172a" stroke="#dc2626" strokeWidth="6" />
                <path d="M 0 -110 A 110 110 0 0 1 110 0" fill="none" stroke="#dc2626" strokeWidth="16" />
                <path d="M -110 0 A 110 110 0 0 1 0 -110" fill="none" stroke="#f59e0b" strokeWidth="12" />

                {/* Shaking Needle in Critical Zone */}
                {(() => {
                  const needleShake = 35 + Math.sin(frame * 0.9) * 12;
                  const rad = (needleShake * Math.PI) / 180;
                  return (
                    <line
                      x1="0"
                      y1="0"
                      x2={Math.cos(rad) * 95}
                      y2={Math.sin(rad) * 95}
                      stroke="#ef4444"
                      strokeWidth="6"
                      strokeLinecap="round"
                    />
                  );
                })()}
                <circle cx="0" cy="0" r="12" fill="#f8fafc" stroke="#000" strokeWidth="3" />
                <text x="0" y="42" fill="#ef4444" fontSize="24" fontWeight="900" fontFamily="monospace" textAnchor="middle">
                  {metricValue || '98.7%'}
                </text>
                <text x="0" y="65" fill="#fca5a5" fontSize="11" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
                  CRITICAL OVERLOAD
                </text>
              </g>

              {/* Technician Character Straining with Both Arms to Turn Valve */}
              <g transform="translate(560, 270)">
                {/* Heavy Work Boiler Suit Torso */}
                <polygon points="-50,280 50,280 40,120 -40,120" fill="#c2410c" stroke="#7c2d12" strokeWidth="3" />
                {/* Safety Harness Straps */}
                <line x1="-20" y1="120" x2="-25" y2="280" stroke="#1e293b" strokeWidth="8" />
                <line x1="20" y1="120" x2="25" y2="280" stroke="#1e293b" strokeWidth="8" />

                {/* Head with Hard Hat & Safety Goggles */}
                <rect x="-12" y="85" width="24" height="35" fill="#cbd5e1" />
                <ellipse cx="0" cy="65" rx="32" ry="36" fill="#f1f5f9" />
                {/* Yellow Hard Hat */}
                <ellipse cx="0" cy="50" rx="42" ry="14" fill="#FFE600" stroke="#b45309" strokeWidth="2" />
                <path d="M -35 50 C -30 15, 30 15, 35 50 Z" fill="#FFE600" />
                {/* Safety Goggles */}
                <rect x="-26" y="58" width="52" height="16" fill="#0f172a" rx="4" />
                <rect x="-22" y="60" width="20" height="12" fill="#38bdf8" opacity="0.6" rx="2" />
                <rect x="2" y="60" width="20" height="12" fill="#38bdf8" opacity="0.6" rx="2" />

                {/* Strained Muscular Arms Gripping Valve Handwheel */}
                {(() => {
                  const strain = Math.sin(frame * 0.4) * 4;
                  return (
                    <g transform={`translate(${strain}, 0)`}>
                      <path d="M -35 130 C -70 160, -90 190, -95 210" fill="none" stroke="#c2410c" strokeWidth="24" strokeLinecap="round" />
                      <path d="M 35 130 C 5 150, -40 170, -70 190" fill="none" stroke="#c2410c" strokeWidth="24" strokeLinecap="round" />
                      {/* Heavy Leather Work Gloves */}
                      <ellipse cx="-95" cy="210" rx="14" ry="12" fill="#78350f" />
                      <ellipse cx="-70" cy="190" rx="14" ry="12" fill="#78350f" />

                      {/* Cast Iron Red Valve Handwheel */}
                      <g transform="translate(-85, 200) rotate(20)">
                        <circle cx="0" cy="0" r="42" fill="none" stroke="#dc2626" strokeWidth="10" />
                        <line x1="-42" y1="0" x2="42" y2="0" stroke="#dc2626" strokeWidth="8" />
                        <line x1="0" y1="-42" x2="0" y2="42" stroke="#dc2626" strokeWidth="8" />
                        <circle cx="0" cy="0" r="14" fill="#0f172a" />
                      </g>
                    </g>
                  );
                })()}
              </g>

              {/* Crisis Telemetry Banner */}
              <g transform="translate(60, 580)" style={{ filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.92))' }}>
                <rect x="0" y="0" width="760" height="60" fill="rgba(15, 23, 42, 0.96)" stroke="#ef4444" strokeWidth="3" rx="8" />
                <rect x="0" y="0" width="10" height="60" fill="#ef4444" />
                <text x="30" y="26" fill="#ef4444" fontSize="12" fontWeight="900" fontFamily="monospace" letterSpacing="2">
                  KEGAGALAN SISTEM // AMBANG BATAS KRITIS:
                </text>
                <text x="30" y="48" fill="#FFE600" fontSize="18" fontWeight="900" fontFamily="'Montserrat', sans-serif">
                  {primaryText || 'TEKANAN MELEWATI TITIK AMAN'}
                </text>
              </g>
            </g>
          )}

          {/* ======================================================== */}
          {/* SCENE J: BREAKING TICKER (Redaktur Berita Membaca Kawat Flash) */}
          {/* ======================================================== */}
          {type === 'breaking-ticker' && (
            <g transform="translate(100, 360)">
              {/* Studio Backdrop & Teletype Terminal Desk */}
              <g style={{ filter: 'drop-shadow(0 25px 45px rgba(0,0,0,0.95))' }}>
                <rect x="60" y="520" width="760" height="160" fill="#1e293b" stroke="#334155" strokeWidth="4" rx="8" />
                <rect x="60" y="520" width="760" height="22" fill="#334155" />
              </g>

              {/* Newsroom Editor Character Behind Desk */}
              <g transform="translate(440, 270)">
                {/* White Shirt with Rolled Sleeves & Suspenders */}
                <polygon points="-85,250 85,250 70,120 -70,120" fill="#f8fafc" />
                {/* Black Suspenders */}
                <line x1="-35" y1="120" x2="-45" y2="250" stroke="#0f172a" strokeWidth="8" />
                <line x1="35" y1="120" x2="45" y2="250" stroke="#0f172a" strokeWidth="8" />
                {/* Loosened Tie */}
                <polygon points="-10,130 10,130 14,230 0,245 -14,230" fill="#dc2626" />

                {/* Head Looking Wide-Eyed at Urgent Wire */}
                <rect x="-16" y="90" width="32" height="35" fill="#cbd5e1" />
                <ellipse cx="0" cy="55" rx="46" ry="50" fill="#f1f5f9" />
                <path d="M -48 45 C -45 -5, 45 -5, 48 45 C 35 15, -35 15, -48 45 Z" fill="#1e293b" />
                {/* Wide Shocked Eyes */}
                <ellipse cx="-20" cy="54" rx="6" ry="7" fill="#0f172a" />
                <ellipse cx="20" cy="54" rx="6" ry="7" fill="#0f172a" />
                <circle cx="-18" cy="52" r="2" fill="#ffffff" />
                <circle cx="22" cy="52" r="2" fill="#ffffff" />

                {/* Hands Holding Long Scrolling Yellow Teletype Paper Tape */}
                {(() => {
                  const tapeWiggle = Math.sin(frame * 0.35) * 4;
                  return (
                    <g transform={`translate(0, ${tapeWiggle})`}>
                      <path d="M -70 140 C -110 180, -130 220, -110 260 L -60 260" fill="none" stroke="#f8fafc" strokeWidth="24" strokeLinecap="round" />
                      <path d="M 70 140 C 110 180, 130 220, 110 260 L 60 260" fill="none" stroke="#f8fafc" strokeWidth="24" strokeLinecap="round" />
                      <ellipse cx="-60" cy="260" rx="14" ry="10" fill="#cbd5e1" />
                      <ellipse cx="60" cy="260" rx="14" ry="10" fill="#cbd5e1" />

                      {/* Continuous Teletype Wire Paper Tape */}
                      <g transform="translate(-140, 230)">
                        <rect x="0" y="0" width="280" height="50" fill="#fef08a" stroke="#ca8a04" strokeWidth="2" rx="3" />
                        <text x="140" y="28" fill="#0f172a" fontSize="13" fontWeight="900" fontFamily="monospace" textAnchor="middle">
                          URGENT FLASH // SEMUA PERBATASAN DIBUKA
                        </text>
                        <text x="140" y="42" fill="#dc2626" fontSize="10" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
                          DDR TELEPRINTER LINE #01 // VERIFIED
                        </text>
                      </g>
                    </g>
                  );
                })()}
              </g>

              {/* Breaking News Ticker Banner Across Bottom */}
              <g transform="translate(60, 560)" style={{ filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.92))' }}>
                <rect x="0" y="0" width="760" height="60" fill="#dc2626" rx="6" />
                <text x="30" y="38" fill="#ffffff" fontSize="22" fontWeight="900" fontFamily="monospace" letterSpacing="2">
                  🔴 KAWAT BERITA GLOBAL: {primaryText || title}
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

                {/* Concrete Texture & Graffiti Stencil on Wall */}
                <g transform="translate(60, 40)">
                  <rect x="0" y="0" width="160" height="40" fill="rgba(239, 68, 68, 0.15)" stroke="#ef4444" strokeWidth="2" strokeDasharray="4 2" rx="4" />
                  <text x="80" y="26" fill="#ef4444" fontSize="16" fontWeight="900" fontFamily="monospace" textAnchor="middle">
                    {stampText || 'RUNTUH'}
                  </text>
                </g>

                {/* Status Telemetry Badge on Right */}
                <g transform="translate(480, 40)">
                  <rect x="0" y="0" width="260" height="40" fill="rgba(15, 23, 42, 0.85)" stroke="#38bdf8" strokeWidth="2" rx="4" />
                  <text x="130" y="26" fill="#38bdf8" fontSize="15" fontWeight="900" fontFamily="monospace" textAnchor="middle">
                    {(primaryText || title || 'STRUKTUR JEBOL').slice(0, 24)}
                  </text>
                </g>

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

              {/* Mauerspecht Character 1: Young Man on Wall Swinging Heavy Sledgehammer */}
              <g transform="translate(320, 160)">
                {(() => {
                  const swing = Math.sin(frame * 0.28);
                  const isImpact = swing < -0.85;
                  const torsoRot = swing * 16;
                  const hammerRot = swing * 65;

                  return (
                    <g>
                      {/* Legs Standing Firmly on Top of Concrete Wall */}
                      <polygon points="-30,180 -10,180 -15,100 -35,100" fill="#1e3a8a" />
                      <polygon points="10,180 30,180 25,100 5,100" fill="#1e3a8a" />
                      {/* Heavy Work Boots */}
                      <rect x="-38" y="175" width="26" height="15" fill="#78350f" rx="3" />
                      <rect x="10" y="175" width="26" height="15" fill="#78350f" rx="3" />

                      {/* Torso & Head Twisting Dynamically */}
                      <g transform={`rotate(${torsoRot} 0 100)`}>
                        {/* Denim Jacket Torso */}
                        <polygon points="-40,105 40,105 32,15 -32,15" fill="#2563eb" />
                        <line x1="0" y1="20" x2="0" y2="105" stroke="#1d4ed8" strokeWidth="3" />

                        {/* Head & Flying Hair */}
                        <rect x="-10" y="-8" width="20" height="24" fill="#cbd5e1" />
                        <ellipse cx="0" cy="-25" rx="26" ry="30" fill="#f1f5f9" />
                        <path d="M -30 -25 C -25 -65, 30 -60, 32 -25 C 20 -40, -10 -45, -30 -25 Z" fill="#475569" />

                        {/* Arms Gripping Two-Handed Sledgehammer */}
                        <g transform={`rotate(${hammerRot} 0 25)`}>
                          {/* Left & Right Arm */}
                          <path d="M -25 25 C -15 -10, 5 -40, 25 -65" fill="none" stroke="#2563eb" strokeWidth="20" strokeLinecap="round" />
                          <path d="M 25 25 C 20 -5, 20 -35, 30 -65" fill="none" stroke="#2563eb" strokeWidth="20" strokeLinecap="round" />
                          <ellipse cx="28" cy="-65" rx="12" ry="10" fill="#cbd5e1" />

                          {/* Hickory Wooden Sledgehammer Handle */}
                          <line x1="28" y1="-50" x2="35" y2="-190" stroke="#b45309" strokeWidth="9" strokeLinecap="round" />
                          <line x1="30" y1="-45" x2="36" y2="-180" stroke="#fef3c7" strokeWidth="2" opacity="0.6" />
                          {/* Forged Steel Hammer Head */}
                          <rect x="15" y="-210" width="42" height="26" fill="#475569" stroke="#cbd5e1" strokeWidth="3" rx="3" />
                          <rect x="12" y="-208" width="8" height="22" fill="#ef4444" rx="2" />
                        </g>
                      </g>

                      {/* Explosive Seismic Shockwave & Sparks on Impact */}
                      {isImpact && (
                        <g transform="translate(60, 180)">
                          <circle cx="0" cy="0" r={45 + pulse * 25} fill="none" stroke="#FFE600" strokeWidth="5" opacity={0.9} />
                          <circle cx="0" cy="0" r={75 + pulse * 35} fill="none" stroke="#ef4444" strokeWidth="3" strokeDasharray="8 6" opacity={0.7} />
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
                    </g>
                  );
                })()}
              </g>

              {/* Comrade Character 2: Kneeling on Wall Cheering with Raised Arm */}
              <g transform="translate(560, 240)">
                {/* Kneeling Jeans & Boots */}
                <polygon points="-25,100 25,100 15,35 -20,35" fill="#1e3a8a" />
                <rect x="-30" y="95" width="25" height="15" fill="#78350f" rx="3" />

                {/* Torso in Brown Leather Jacket */}
                <polygon points="-30,40 30,40 24,-30 -24,-30" fill="#78350f" />
                <ellipse cx="0" cy="-55" rx="24" ry="28" fill="#f1f5f9" />
                <path d="M -26 -55 C -20 -85, 24 -85, 26 -55 Z" fill="#0f172a" />

                {/* Left Hand Gripping Wall Lip */}
                <path d="M -20 -20 C -40 10, -50 30, -45 50" fill="none" stroke="#78350f" strokeWidth="18" strokeLinecap="round" />
                <ellipse cx="-45" cy="50" rx="10" ry="8" fill="#cbd5e1" />

                {/* Right Arm Pumped High in Victory Fist */}
                {(() => {
                  const cheerBob = Math.sin(frame * 0.3) * 6;
                  return (
                    <g transform={`translate(0, ${cheerBob})`}>
                      <path d="M 20 -20 C 35 -60, 45 -80, 50 -105" fill="none" stroke="#78350f" strokeWidth="18" strokeLinecap="round" />
                      <ellipse cx="50" cy="-108" rx="12" ry="12" fill="#cbd5e1" />
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
          {/* SCENE L: GATE BREACH (Penjaga Mengangkat Palang & Warga Menerobos) */}
          {/* ======================================================== */}
          {(type === 'gate-breach' || type === 'gate-breach-crowd') && (
            <g transform="translate(100, 360)">
              {/* Checkpoint Guardhouse on Left */}
              <g transform="translate(40, 220)" style={{ filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.85))' }}>
                <rect x="0" y="0" width="180" height="380" fill="#1e293b" rx="8" />
                <rect x="25" y="40" width="130" height="110" fill="#fef08a" stroke="#475569" strokeWidth="2" rx="4" />
                {/* Guardhouse Spotlight */}
                <polygon points="90,150 120,450 350,450" fill="url(#spotlightDir)" opacity="0.25" />
              </g>

              {/* East German Border Guard Raising Barrier Arm */}
              <g transform="translate(190, 270)">
                {/* Winter Military Greatcoat */}
                <polygon points="-40,290 40,290 32,120 -32,120" fill="#1e293b" />
                <rect x="-35" y="210" width="70" height="18" fill="#78350f" />
                {/* Peaked Service Visor Cap */}
                <rect x="-10" y="85" width="20" height="35" fill="#cbd5e1" />
                <ellipse cx="0" cy="60" rx="30" ry="34" fill="#f1f5f9" />
                <polygon points="-36,45 36,45 28,20 -28,20" fill="#1e293b" />
                <ellipse cx="0" cy="48" rx="40" ry="7" fill="#0f172a" />
                <circle cx="0" cy="35" r="6" fill="#dc2626" />

                {/* Arms Pushing Manual Lever Upward */}
                <path d="M 30 130 C 55 150, 70 140, 80 110" fill="none" stroke="#1e293b" strokeWidth="22" strokeLinecap="round" />
                <ellipse cx="80" cy="105" rx="12" ry="10" fill="#cbd5e1" />
              </g>

              {/* The Barrier Gate Swinging UPWARD */}
              {(() => {
                const gateAngle = interpolate(frame, [0, 45], [0, -75], {
                  extrapolateLeft: 'clamp',
                  extrapolateRight: 'clamp',
                });
                return (
                  <g transform="translate(270, 430)">
                    <rect x="-15" y="-30" width="30" height="170" fill="#334155" rx="4" />
                    <circle cx="0" cy="0" r="20" fill="#e2e8f0" stroke="#0f172a" strokeWidth="4" />

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

              {/* Recognizable Human Citizens Joyfully Striding Across Border Line */}
              <g transform="translate(340, 240)">
                {/* Border White Line on Ground */}
                <line x1="-80" y1="360" x2="480" y2="360" stroke="#ffffff" strokeWidth="6" strokeDasharray="16 10" />

                {/* Citizen 1: Man in Long Overcoat & Scarf Taking Huge Stride */}
                {(() => {
                  const runCycle = Math.sin(frame * 0.4);
                  return (
                    <g transform="translate(60, 40)">
                      {/* Legs Striding */}
                      <polygon points={`-25,310 -5,310 ${10 + runCycle * 30},200 ${-10 + runCycle * 30},200`} fill="#0f172a" />
                      <polygon points={`15,310 35,310 ${-10 - runCycle * 30},200 ${-30 - runCycle * 30},200`} fill="#0f172a" />

                      {/* Coat Torso */}
                      <polygon points="-45,210 45,210 35,80 -35,80" fill="#334155" />
                      {/* Fluttering Red Scarf */}
                      <path d="M 0 85 Q -40 70 -70 95 Q -95 110 -115 100" fill="none" stroke="#dc2626" strokeWidth="10" strokeLinecap="round" />

                      {/* Head & Joyful Expression */}
                      <rect x="-10" y="55" width="20" height="25" fill="#cbd5e1" />
                      <ellipse cx="0" cy="35" rx="26" ry="30" fill="#f1f5f9" />
                      <path d="M -26 30 C -20 0, 24 0, 26 30 Z" fill="#1e293b" />
                      <ellipse cx="14" cy="32" rx="4" ry="5" fill="#0f172a" />
                      <path d="M 16 42 Q 24 50 16 54 Z" fill="#0f172a" />

                      {/* Raised Victory Arms */}
                      <path d="M -30 90 C -60 50, -70 20, -75 -15" fill="none" stroke="#334155" strokeWidth="20" strokeLinecap="round" />
                      <path d="M 30 90 C 60 50, 70 20, 75 -15" fill="none" stroke="#334155" strokeWidth="20" strokeLinecap="round" />
                      <ellipse cx="-75" cy="-18" rx="12" ry="10" fill="#cbd5e1" />
                      <ellipse cx="75" cy="-18" rx="12" ry="10" fill="#cbd5e1" />
                    </g>
                  );
                })()}

                {/* Citizen 2: Woman in Winter Coat & Beanie Waving Flower */}
                <g transform="translate(230, 70)">
                  {/* Coat */}
                  <polygon points="-35,280 35,280 25,100 -25,100" fill="#0284c7" />
                  {/* Beanie & Long Hair */}
                  <rect x="-8" y="75" width="16" height="25" fill="#cbd5e1" />
                  <ellipse cx="0" cy="55" rx="24" ry="28" fill="#f1f5f9" />
                  <ellipse cx="0" cy="42" rx="26" ry="16" fill="#f59e0b" />
                  <path d="M -24 60 C -28 90, -15 110, -10 120" fill="none" stroke="#78350f" strokeWidth="8" />

                  {/* Left Arm Waving */}
                  {(() => {
                    const wave = Math.sin(frame * 0.5) * 12;
                    return (
                      <g transform={`translate(${wave}, 0)`}>
                        <path d="M 25 110 C 50 80, 60 50, 65 15" fill="none" stroke="#0284c7" strokeWidth="18" strokeLinecap="round" />
                        <ellipse cx="65" cy="12" rx="10" ry="10" fill="#cbd5e1" />
                        {/* Little Yellow Flower in Hand */}
                        <circle cx="65" cy="0" r="10" fill="#FFE600" />
                        <line x1="65" y1="12" x2="65" y2="2" stroke="#16a34a" strokeWidth="3" />
                      </g>
                    );
                  })()}
                </g>
              </g>

              {/* Status Telemetry Banner */}
              <g transform="translate(60, 600)" style={{ filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.92))' }}>
                <rect x="0" y="0" width="760" height="60" fill="rgba(15, 23, 42, 0.96)" stroke="#38bdf8" strokeWidth="3" rx="8" />
                <rect x="0" y="0" width="10" height="60" fill="#38bdf8" />
                <text x="30" y="26" fill="#38bdf8" fontSize="12" fontWeight="900" fontFamily="monospace" letterSpacing="2">
                  POS PERBATASAN BORNHOLMER STRASSE // JEBOL TOTAL:
                </text>
                <text x="30" y="48" fill="#FFE600" fontSize="18" fontWeight="900" fontFamily="'Montserrat', sans-serif">
                  {primaryText || 'PULAUAN RIBU WARGA MELINTAS DENGAN AIR MATA HARU'}
                </text>
              </g>
            </g>
          )}

          {/* ======================================================== */}
          {/* SCENE M: PRESS PODIUM (Juru Bicara Schabowski di Podium Pers) */}
          {/* ======================================================== */}
          {(type === 'press-podium' || type === 'press-conference') && (
            <g transform="translate(100, 360)">
              {/* Intense Camera Flashbulbs Popping */}
              {(() => {
                const flash1 = (frame * 3) % 25 < 3;
                const flash2 = (frame * 4 + 7) % 29 < 3;
                return (
                  <g>
                    {flash1 && <circle cx="220" cy="180" r="160" fill="#ffffff" opacity="0.8" />}
                    {flash2 && <circle cx="680" cy="220" r="140" fill="#ffffff" opacity="0.75" />}
                  </g>
                );
              })()}

              {/* Press Conference Podium Table */}
              <g style={{ filter: 'drop-shadow(0 25px 45px rgba(0,0,0,0.95))' }}>
                <rect x="60" y="520" width="760" height="180" fill="#1e293b" stroke="#334155" strokeWidth="4" rx="8" />
                <rect x="60" y="520" width="760" height="24" fill="#334155" />
                <line x1="60" y1="544" x2="820" y2="544" stroke="#f59e0b" strokeWidth="2" opacity="0.6" />
              </g>

              {/* Spokesman Character Behind Podium */}
              <g transform="translate(440, 270)">
                {/* Suit Torso */}
                <polygon points="-110,260 110,260 85,120 -85,120" fill="#0f172a" />
                <polygon points="-30,120 30,120 40,170 -40,170" fill="#f8fafc" />
                <polygon points="-12,140 12,140 16,240 0,255 -16,240" fill="#dc2626" />

                {/* Head & Glasses */}
                <rect x="-20" y="90" width="40" height="35" fill="#cbd5e1" rx="4" />
                <ellipse cx="0" cy="55" rx="52" ry="58" fill="#f1f5f9" />
                <path d="M -54 50 C -50 -10, 50 -10, 54 50 C 42 20, -42 20, -54 50 Z" fill="#64748b" />
                <rect x="-42" y="46" width="34" height="22" fill="none" stroke="#0f172a" strokeWidth="3.5" rx="3" />
                <rect x="8" y="46" width="34" height="22" fill="none" stroke="#0f172a" strokeWidth="3.5" rx="3" />
                <line x1="-8" y1="56" x2="8" y2="56" stroke="#0f172a" strokeWidth="3.5" />

                {/* Bewildered Eyes & Mouth */}
                <ellipse cx="-25" cy="56" rx="5" ry="6" fill="#0f172a" />
                <ellipse cx="25" cy="56" rx="5" ry="6" fill="#0f172a" />
                <ellipse cx="0" cy="85" rx="10" ry={6 + Math.sin(frame * 0.4) * 3} fill="#0f172a" />

                {/* Hands Shuffling Documents */}
                <path d="M -85 140 C -120 180, -140 220, -120 260 L -70 260" fill="none" stroke="#0f172a" strokeWidth="28" strokeLinecap="round" />
                <path d="M 85 140 C 120 180, 140 220, 120 260 L 70 260" fill="none" stroke="#0f172a" strokeWidth="28" strokeLinecap="round" />
                <ellipse cx="-70" cy="260" rx="14" ry="10" fill="#cbd5e1" />
                <ellipse cx="70" cy="260" rx="14" ry="10" fill="#cbd5e1" />

                {/* Official Press Memo on Podium */}
                <g transform="translate(-90, 240) rotate(-2)">
                  <rect x="0" y="0" width="180" height="65" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="2" rx="3" />
                  <line x1="15" y1="18" x2="165" y2="18" stroke="#94a3b8" strokeWidth="3" />
                  <line x1="15" y1="32" x2="140" y2="32" stroke="#94a3b8" strokeWidth="3" />
                  <rect x="15" y="42" width="150" height="15" fill="#fde047" rx="2" />
                </g>
              </g>

              {/* Live Microphones Cluster */}
              <g transform="translate(440, 520)">
                {[-70, -25, 25, 70].map((mx, idx) => (
                  <g key={idx} transform={`translate(${mx}, 0) rotate(${mx * 0.12})`}>
                    <line x1="0" y1="0" x2="0" y2="-90" stroke="#94a3b8" strokeWidth="6" strokeLinecap="round" />
                    <circle cx="0" cy="-98" r="14" fill="#1e293b" stroke="#cbd5e1" strokeWidth="2.5" />
                    <circle cx="0" cy="-98" r={22 + pulse * 14} fill="none" stroke="#ef4444" strokeWidth="2" opacity={1 - pulse} />
                  </g>
                ))}
              </g>

              {/* Digital Clock Showing Fatal Time */}
              <g transform="translate(360, 120)">
                <rect x="0" y="0" width="160" height="48" fill="#020617" stroke="#ef4444" strokeWidth="3" rx="6" />
                <text x="80" y="33" fill="#ef4444" fontSize="22" fontWeight="900" fontFamily="monospace" textAnchor="middle">
                  {(metricValue || locationTag || '18:57:04').slice(0, 12)}
                </text>
              </g>
            </g>
          )}

          {/* ======================================================== */}
          {/* SCENE N: MEMO INVESTIGATION (Detektif Forensik Meneliti Dokumen) */}
          {/* ======================================================== */}
          {(type === 'memo-investigation' || type === 'secret-document') && (
            <g transform="translate(100, 360)">
              {/* Warm Overhead Desk Lamp Cone */}
              <polygon points="440,120 100,700 780,700" fill="url(#spotlightDir)" opacity="0.2" />

              {/* Wooden Investigation Desk Surface */}
              <g style={{ filter: 'drop-shadow(0 25px 45px rgba(0,0,0,0.95))' }}>
                <rect x="60" y="520" width="760" height="180" fill="#181311" stroke="#3e2723" strokeWidth="4" rx="8" />
                <rect x="60" y="520" width="760" height="22" fill="#2d1b15" />
              </g>

              {/* Forensic Investigator Character Leaning Over Desk */}
              <g transform="translate(440, 260)">
                {/* Dark Coat Torso */}
                <polygon points="-100,260 100,260 80,120 -80,120" fill="#1e293b" />
                <polygon points="-25,120 25,120 35,170 -35,170" fill="#f8fafc" />
                <polygon points="-10,135 10,135 12,230 0,245 -12,230" fill="#dc2626" />

                {/* Head Leaning Forward in Scrutiny */}
                <rect x="-18" y="85" width="36" height="35" fill="#cbd5e1" rx="4" />
                <ellipse cx="0" cy="55" rx="46" ry="50" fill="#f1f5f9" />
                <path d="M -48 45 C -45 -5, 45 -5, 48 45 C 35 15, -35 15, -48 45 Z" fill="#0f172a" />
                {/* Focused Eyes Looking Down at Document */}
                <ellipse cx="-20" cy="56" rx="4" ry="5" fill="#0f172a" />
                <ellipse cx="20" cy="56" rx="4" ry="5" fill="#0f172a" />

                {/* Left Arm Holding Evidence Ledger */}
                <path d="M -80 140 C -120 180, -140 220, -115 260 L -60 260" fill="none" stroke="#1e293b" strokeWidth="24" strokeLinecap="round" />
                <ellipse cx="-60" cy="260" rx="14" ry="10" fill="#cbd5e1" />

                {/* Right Arm Holding Magnifying Glass Directly Over Memo */}
                {(() => {
                  const magSway = Math.sin(frame * 0.15) * 15;
                  return (
                    <g transform={`translate(${magSway}, 0)`}>
                      <path d="M 80 140 C 110 180, 100 230, 60 260 L 15 265" fill="none" stroke="#1e293b" strokeWidth="24" strokeLinecap="round" />
                      <ellipse cx="15" cy="265" rx="14" ry="10" fill="#cbd5e1" />

                      {/* Brass Magnifying Glass */}
                      <g transform="translate(10, 260) rotate(-25)">
                        <line x1="0" y1="0" x2="-45" y2="-45" stroke="#78350f" strokeWidth="10" strokeLinecap="round" />
                        <circle cx="-55" cy="-55" r="42" fill="rgba(255,255,255,0.25)" stroke="#d97706" strokeWidth="7" />
                        <circle cx="-68" cy="-68" r="10" fill="#ffffff" opacity="0.6" />
                      </g>
                    </g>
                  );
                })()}
              </g>

              {/* The Official Typewritten Memo Dossier Under Inspection */}
              <g transform="translate(180, 440)" style={{ filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.85))' }}>
                <rect x="0" y="0" width="520" height="230" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="2" rx="6" />

                <rect x="25" y="20" width="180" height="26" fill="#dc2626" rx="3" />
                <text x="115" y="38" fill="#ffffff" fontSize="12" fontWeight="900" fontFamily="monospace" textAnchor="middle">
                  {(stampText || 'BUKTI FORENSIK').slice(0, 20)}
                </text>

                <text x="25" y="75" fill="#0f172a" fontSize="16" fontWeight="900" fontFamily="monospace">
                  {(secondaryText || title || 'DOKUMEN RESMI').slice(0, 28)}
                </text>

                {[95, 115, 175, 195].map((ly, i) => (
                  <line key={i} x1="25" y1={ly} x2={i % 2 === 0 ? 490 : 420} y2={ly} stroke="#94a3b8" strokeWidth="3" />
                ))}

                {/* Fatal Paragraph Highlighted in Bright Yellow */}
                <g transform="translate(20, 130)">
                  <rect x="0" y="0" width="480" height="32" fill="#fde047" opacity="0.95" rx="3" />
                  <text x="12" y="21" fill="#000000" fontSize="13" fontWeight="900" fontFamily="monospace">
                    {primaryText ? `KLAUSUL: "${primaryText.slice(0, 32)}"` : 'PARAGRAF 4: "...sofort, unverzüglich."'}
                  </text>
                </g>
              </g>
            </g>
          )}

          {/* ======================================================== */}
          {/* SCENE O: DOMINO COLLAPSE (Rantai Karakter & Efek Domino) */}
          {/* ======================================================== */}
          {(type === 'domino-collapse' || type === 'domino-effect') && (
            <g transform="translate(100, 360)">
              {/* Sequential Human Characters Above Falling Dominoes */}
              <g transform="translate(40, 160)">
                {/* Character 1: Official at desk signing blindly */}
                <g transform="translate(120, 110)">
                  <rect x="-30" y="30" width="60" height="15" fill="#334155" rx="2" />
                  <ellipse cx="0" cy="-10" rx="16" ry="18" fill="#cbd5e1" />
                  <polygon points="-18,28 18,28 12,5 -12,5" fill="#1e293b" />
                  <line x1="5" y1="18" x2="22" y2="30" stroke="#f59e0b" strokeWidth="3" />
                  <text x="0" y="60" fill="#94a3b8" fontSize="10" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
                    1. BIROKRAT
                  </text>
                </g>

                {/* Character 2: Messenger running in haste with folder */}
                <g transform="translate(250, 110)">
                  <ellipse cx="0" cy="-10" rx="16" ry="18" fill="#cbd5e1" />
                  <polygon points="-16,28 16,28 12,5 -12,5" fill="#2563eb" />
                  <rect x="8" y="10" width="18" height="22" fill="#fef08a" stroke="#ca8a04" strokeWidth="1.5" rx="2" />
                  <text x="0" y="60" fill="#94a3b8" fontSize="10" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
                    2. KURIR
                  </text>
                </g>

                {/* Character 3: Spokesman at microphone stammering */}
                <g transform="translate(380, 110)">
                  <ellipse cx="0" cy="-10" rx="16" ry="18" fill="#cbd5e1" />
                  <polygon points="-18,28 18,28 14,5 -14,5" fill="#0f172a" />
                  <line x1="12" y1="28" x2="12" y2="5" stroke="#94a3b8" strokeWidth="3" />
                  <circle cx="12" cy="0" r="5" fill="#ef4444" />
                  <text x="0" y="60" fill="#94a3b8" fontSize="10" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
                    3. JURU BICARA
                  </text>
                </g>

                {/* Character 4: Border commander raising barrier */}
                <g transform="translate(510, 110)">
                  <ellipse cx="0" cy="-10" rx="16" ry="18" fill="#cbd5e1" />
                  <polygon points="-18,28 18,28 14,5 -14,5" fill="#1e293b" />
                  <line x1="10" y1="20" x2="25" y2="-5" stroke="#ef4444" strokeWidth="4" />
                  <text x="0" y="60" fill="#94a3b8" fontSize="10" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
                    4. KOMANDAN
                  </text>
                </g>
              </g>

              {/* Connecting Domino Flow Lines */}
              <g transform="translate(40, 520)">
                {[0, 40, 80, 120, 160].map((gy) => (
                  <line key={gy} x1="0" y1={gy} x2="800" y2={gy} stroke="#1f2937" strokeWidth="2" opacity="0.6" />
                ))}
              </g>

              {/* Sequential Falling Domino Slabs */}
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
          {/* SCENE P: MARITIME DISASTER (Petugas Pengawas di Crow's Nest) */}
          {/* ======================================================== */}
          {(type === 'maritime-disaster' || type === 'ship-iceberg') && (
            <g transform="translate(100, 360)">
              {/* Cold Foggy Atlantic Night Ambient */}
              <rect x="40" y="140" width="800" height="420" fill="#040c1a" stroke="#1e293b" strokeWidth="4" rx="8" />

              {/* Looming Giant Iceberg Emerging from Fog on Right */}
              <g transform="translate(560, 180)" style={{ filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.9))' }}>
                <polygon points="120,380 30,220 90,140 160,100 230,170 280,380" fill="#0b172a" stroke="#38bdf8" strokeWidth="3" opacity="0.9" />
                <polygon points="90,140 160,100 170,220 100,240" fill="#38bdf8" opacity="0.25" />
                <text x="160" y="85" fill="#38bdf8" fontSize="13" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
                  GUNUNG ES (ICEBERG)
                </text>
              </g>

              {/* Titanic Crow's Nest Observation Platform on Mast */}
              <g transform="translate(240, 260)">
                {/* Ship Steel Mast & Cables */}
                <line x1="80" y1="-80" x2="80" y2="340" stroke="#475569" strokeWidth="12" />
                <line x1="80" y1="-40" x2="-20" y2="340" stroke="#64748b" strokeWidth="3" opacity="0.6" />
                <line x1="80" y1="-40" x2="180" y2="340" stroke="#64748b" strokeWidth="3" opacity="0.6" />

                {/* Crow's Nest Cylindrical Basket */}
                <path d="M 0 160 L 160 160 L 140 250 L 20 250 Z" fill="#1e293b" stroke="#64748b" strokeWidth="4" />
                <line x1="0" y1="160" x2="160" y2="160" stroke="#94a3b8" strokeWidth="6" />

                {/* Heavy Brass Ship's Bell on Left */}
                <g transform="translate(15, 110)">
                  <polygon points="0,0 24,0 28,35 -4,35" fill="#d97706" stroke="#fef08a" strokeWidth="2" />
                  <circle cx="12" cy="40" r="5" fill="#d97706" />
                  {/* Clapper Rope */}
                  <line x1="12" y1="42" x2="18" y2="70" stroke="#f8fafc" strokeWidth="3" strokeDasharray="4 2" />
                </g>

                {/* Lookout 1: Frantically Ringing the Bell 3 Times */}
                <g transform="translate(50, 40)">
                  {/* Heavy Wool Peacoat */}
                  <polygon points="-30,120 30,120 25,20 -25,20" fill="#0f172a" />
                  {/* Head & Sailor Watch Cap */}
                  <rect x="-8" y="0" width="16" height="22" fill="#cbd5e1" />
                  <ellipse cx="0" cy="-15" rx="20" ry="24" fill="#f1f5f9" />
                  <ellipse cx="0" cy="-22" rx="22" ry="12" fill="#1e293b" />
                  {/* Arm Pulling Bell Rope */}
                  {(() => {
                    const bellPull = Math.sin(frame * 0.4) * 8;
                    return (
                      <g transform={`translate(0, ${bellPull})`}>
                        <path d="M -20 25 C -35 45, -30 65, -20 70" fill="none" stroke="#0f172a" strokeWidth="16" strokeLinecap="round" />
                        <ellipse cx="-20" cy="72" rx="8" ry="7" fill="#cbd5e1" />
                      </g>
                    );
                  })()}
                </g>

                {/* Lookout 2: Pointing at Iceberg & Shouting into Phone Handset */}
                <g transform="translate(120, 30)">
                  {/* Peacoat Torso */}
                  <polygon points="-30,130 30,130 25,20 -25,20" fill="#0f172a" />
                  {/* Head & Watch Cap with Terrified Expression */}
                  <rect x="-8" y="0" width="16" height="22" fill="#cbd5e1" />
                  <ellipse cx="0" cy="-15" rx="22" ry="26" fill="#f1f5f9" />
                  <ellipse cx="0" cy="-24" rx="24" ry="12" fill="#1e293b" />
                  {/* Wide Terrified Eye & Shouting Mouth */}
                  <ellipse cx="8" cy="-16" rx="4" ry="5" fill="#0f172a" />
                  <path d="M 10 -6 Q 16 2 8 4 Z" fill="#0f172a" />

                  {/* Left Hand Holding Phone Transmitter */}
                  <path d="M -15 25 C -25 45, -20 55, -8 30" fill="none" stroke="#0f172a" strokeWidth="14" strokeLinecap="round" />
                  <ellipse cx="-8" cy="25" rx="8" ry="7" fill="#cbd5e1" />
                  <rect x="-14" y="10" width="12" height="24" fill="#d97706" rx="3" />

                  {/* Right Arm Pointing Directly at Approaching Iceberg */}
                  <path d="M 20 25 C 50 20, 80 15, 120 10" fill="none" stroke="#0f172a" strokeWidth="18" strokeLinecap="round" />
                  <ellipse cx="125" cy="10" rx="10" ry="8" fill="#cbd5e1" />
                </g>
              </g>

              {/* Distant Titanic Ship Silhouette in Fog */}
              <g transform="translate(60, 480)">
                <polygon points="0,30 220,10 260,35 220,45 0,45" fill="#090d16" opacity="0.6" />
                <rect x="60" y="-10" width="14" height="20" fill="#dc2626" opacity="0.6" />
                <rect x="100" y="-10" width="14" height="20" fill="#dc2626" opacity="0.6" />
                <rect x="140" y="-10" width="14" height="20" fill="#dc2626" opacity="0.6" />
              </g>

              {/* Telemetry Banner */}
              <g transform="translate(60, 580)" style={{ filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.92))' }}>
                <rect x="0" y="0" width="760" height="60" fill="rgba(15, 23, 42, 0.96)" stroke="#ef4444" strokeWidth="3" rx="8" />
                <rect x="0" y="0" width="10" height="60" fill="#ef4444" />
                <text x="30" y="26" fill="#ef4444" fontSize="12" fontWeight="900" fontFamily="monospace" letterSpacing="2">
                  TELEPON DARURAT ANJUNGAN // POS PANTAU CROW'S NEST:
                </text>
                <text x="30" y="48" fill="#FFE600" fontSize="18" fontWeight="900" fontFamily="'Montserrat', sans-serif">
                  "ICEBERG, RIGHT AHEAD!" (GUNUNG ES DI DEPAN KITA!)
                </text>
              </g>
            </g>
          )}

          {/* ======================================================== */}
          {/* SCENE Q: REACTOR MELTDOWN (Operator di Ruang Kendali AZ-5) */}
          {/* ======================================================== */}
          {(type === 'reactor-meltdown' || type === 'nuclear-disaster') && (
            <g transform="translate(100, 360)">
              {/* Crimson Emergency Strobe Ambient */}
              <rect x="40" y="140" width="800" height="420" fill="#180507" stroke="#dc2626" strokeWidth="4" rx="8" />

              {/* Overhead Rotating Emergency Alarm Beacon */}
              <g transform="translate(440, 160)">
                <ellipse cx="0" cy="0" rx="35" ry="12" fill="#7f1d1d" stroke="#ef4444" strokeWidth="2" />
                <circle cx="0" cy="-10" r="16" fill="#ef4444" opacity={0.8 + pulse * 0.2} />
                {/* Rotating Light Sweep */}
                {(() => {
                  const beamAngle = (frame * 6) % 360;
                  const rad = (beamAngle * Math.PI) / 180;
                  return (
                    <polygon
                      points={`0,-10 ${Math.cos(rad) * 400 + 440},${Math.sin(rad) * 200 + 300} ${Math.cos(rad + 0.3) * 400 + 440},${Math.sin(rad + 0.3) * 200 + 300}`}
                      fill="#ef4444"
                      opacity="0.25"
                    />
                  );
                })()}
              </g>

              {/* Master Reactor Console Desk in Foreground */}
              <g style={{ filter: 'drop-shadow(0 25px 45px rgba(0,0,0,0.95))' }}>
                <rect x="60" y="500" width="760" height="180" fill="#1c1917" stroke="#dc2626" strokeWidth="4" rx="8" />
                <rect x="60" y="500" width="760" height="24" fill="#292524" />

                {/* Overheat Meter Gauges on Console */}
                {[-180, -90, 0, 90, 180].map((mx, idx) => (
                  <g key={idx} transform={`translate(${440 + mx}, 570)`}>
                    <circle cx="0" cy="0" r="24" fill="#0c0a09" stroke="#ef4444" strokeWidth="2" />
                    <line x1="0" y1="0" x2="14" y2="-14" stroke="#ef4444" strokeWidth="3" />
                  </g>
                ))}
              </g>

              {/* Nuclear Plant Chief Operator Character in Panic */}
              <g transform="translate(440, 260)">
                {/* White Lab Smock / Uniform Torso */}
                <polygon points="-90,250 90,250 75,120 -75,120" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="2" />
                <polygon points="-12,120 12,120 15,200 -15,200" fill="#dc2626" />

                {/* Operator Head & White Cap */}
                <rect x="-16" y="90" width="32" height="30" fill="#cbd5e1" />
                <ellipse cx="0" cy="65" rx="42" ry="46" fill="#f1f5f9" />
                {/* White Soft Skullcap */}
                <ellipse cx="0" cy="50" rx="46" ry="16" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="2" />

                {/* Terrified Eyes & Open Mouth */}
                <ellipse cx="-18" cy="64" rx="5" ry="6" fill="#0f172a" />
                <ellipse cx="18" cy="64" rx="5" ry="6" fill="#0f172a" />
                <ellipse cx="0" cy="88" rx="12" ry={8 + Math.sin(frame * 0.4) * 4} fill="#0f172a" />

                {/* Left Hand Clutching Head in Horror */}
                <path d="M -75 130 C -110 160, -115 110, -70 70 L -45 65" fill="none" stroke="#f8fafc" strokeWidth="22" strokeLinecap="round" />
                <ellipse cx="-45" cy="65" rx="12" ry="10" fill="#cbd5e1" />

                {/* Right Arm Slamming Down on Red Emergency AZ-5 Button */}
                {(() => {
                  const slam = Math.sin(frame * 0.4) * 6;
                  return (
                    <g transform={`translate(0, ${slam})`}>
                      <path d="M 75 130 C 110 170, 100 220, 70 250 L 50 250" fill="none" stroke="#f8fafc" strokeWidth="22" strokeLinecap="round" />
                      <ellipse cx="50" cy="250" rx="14" ry="12" fill="#cbd5e1" />

                      {/* Emergency AZ-5 Button on Console */}
                      <g transform="translate(50, 245)">
                        <rect x="-25" y="0" width="50" height="20" fill="#44403c" stroke="#dc2626" strokeWidth="2" rx="4" />
                        <rect x="-18" y="-8" width="36" height="14" fill="#dc2626" rx="3" />
                        <text x="0" y="-14" fill="#ef4444" fontSize="11" fontWeight="900" fontFamily="monospace" textAnchor="middle">
                          AZ-5
                        </text>
                      </g>
                    </g>
                  );
                })()}
              </g>

              {/* Overheat Alert Banner */}
              <g transform="translate(60, 580)" style={{ filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.92))' }}>
                <rect x="0" y="0" width="760" height="60" fill="rgba(15, 23, 42, 0.96)" stroke="#ef4444" strokeWidth="3" rx="8" />
                <rect x="0" y="0" width="10" height="60" fill="#ef4444" />
                <text x="30" y="26" fill="#ef4444" fontSize="12" fontWeight="900" fontFamily="monospace" letterSpacing="2">
                  [!] DARURAT NUKLIR // TOMBOL PENGHENTIAN AZ-5 DITEKAN:
                </text>
                <text x="30" y="48" fill="#FFE600" fontSize="18" fontWeight="900" fontFamily="'Montserrat', sans-serif">
                  {metricValue || 'REAKSI TAK TERKENDALI • SUHU INTI 3,820°C'}
                </text>
              </g>
            </g>
          )}

          {/* ======================================================== */}
          {/* SCENE R: LABORATORY DISCOVERY (Ilmuwan Fleming di Meja Lab) */}
          {/* ======================================================== */}
          {(type === 'laboratory-discovery' || type === 'medical-breakthrough') && (
            <g transform="translate(100, 360)">
              {/* Warm Ambient Laboratory Daylight */}
              <rect x="40" y="140" width="800" height="420" fill="#061c14" stroke="#059669" strokeWidth="4" rx="8" />

              {/* Wooden Lab Workbench Surface */}
              <g style={{ filter: 'drop-shadow(0 25px 45px rgba(0,0,0,0.95))' }}>
                <rect x="60" y="520" width="760" height="180" fill="#181311" stroke="#3e2723" strokeWidth="4" rx="8" />
                <rect x="60" y="520" width="760" height="22" fill="#2d1b15" />
              </g>

              {/* Vintage Brass Microscope on Table (Left) */}
              <g transform="translate(220, 360)">
                <rect x="-30" y="150" width="60" height="15" fill="#d97706" rx="4" />
                <line x1="0" y1="150" x2="0" y2="40" stroke="#b45309" strokeWidth="12" />
                <rect x="-15" y="-10" width="30" height="90" fill="#d97706" stroke="#fef08a" strokeWidth="2" rx="4" transform="rotate(-15 0 35)" />
                <circle cx="15" cy="80" r="12" fill="#f59e0b" />
              </g>

              {/* Scientist Alexander Fleming Character (Center) */}
              <g transform="translate(480, 270)">
                {/* Lab Coat over Wool Vest */}
                <polygon points="-85,250 85,250 70,120 -70,120" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="2" />
                <polygon points="-25,120 25,120 30,190 -30,190" fill="#334155" />
                <polygon points="-8,135 8,135 10,230 -10,230" fill="#047857" />

                {/* Head & Round Spectacles */}
                <rect x="-16" y="85" width="32" height="35" fill="#cbd5e1" />
                <ellipse cx="0" cy="55" rx="46" ry="50" fill="#f1f5f9" />
                <path d="M -48 45 C -45 -5, 45 -5, 48 45 C 35 15, -35 15, -48 45 Z" fill="#64748b" />
                {/* Round Wire Spectacles */}
                <circle cx="-20" cy="55" r="15" fill="none" stroke="#d97706" strokeWidth="3" />
                <circle cx="20" cy="55" r="15" fill="none" stroke="#d97706" strokeWidth="3" />
                <line x1="-5" y1="55" x2="5" y2="55" stroke="#d97706" strokeWidth="3" />

                {/* Left Hand Adjusting Microscope Focus */}
                <path d="M -70 140 C -110 180, -140 220, -180 240" fill="none" stroke="#f8fafc" strokeWidth="22" strokeLinecap="round" />
                <ellipse cx="-185" cy="240" rx="12" ry="10" fill="#cbd5e1" />

                {/* Right Arm Holding Glass Petri Dish Up to Light */}
                {(() => {
                  const dishBob = Math.sin(frame * 0.2) * 5;
                  return (
                    <g transform={`translate(0, ${dishBob})`}>
                      <path d="M 70 140 C 110 160, 130 180, 140 190" fill="none" stroke="#f8fafc" strokeWidth="22" strokeLinecap="round" />
                      <ellipse cx="140" cy="190" rx="12" ry="10" fill="#cbd5e1" />

                      {/* Glass Petri Dish with Penicillin Halo */}
                      <g transform="translate(180, 160)">
                        <circle cx="0" cy="0" r="55" fill="rgba(16, 185, 129, 0.2)" stroke="#10b981" strokeWidth="4" />
                        <circle cx="0" cy="0" r="45" fill="none" stroke="#34d399" strokeWidth="1.5" strokeDasharray="6 4" />
                        {/* Staph bacteria dots around perimeter */}
                        {Array.from({ length: 12 }).map((_, i) => {
                          const ang = (i / 12) * Math.PI * 2;
                          return (
                            <circle key={i} cx={Math.cos(ang) * 35} cy={Math.sin(ang) * 35} r="4" fill="#f59e0b" />
                          );
                        })}
                        {/* Clear Ring of Inhibition */}
                        <circle cx="0" cy="0" r="22" fill="#047857" opacity="0.8" />
                        <circle cx="0" cy="0" r={10 + pulse * 3} fill="#a7f3d0" />
                      </g>
                    </g>
                  );
                })()}
              </g>

              {/* Discovery Telemetry Banner */}
              <g transform="translate(60, 580)" style={{ filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.92))' }}>
                <rect x="0" y="0" width="760" height="60" fill="rgba(6, 78, 59, 0.96)" stroke="#10b981" strokeWidth="3" rx="8" />
                <rect x="0" y="0" width="10" height="60" fill="#10b981" />
                <text x="30" y="26" fill="#34d399" fontSize="12" fontWeight="900" fontFamily="monospace" letterSpacing="2">
                  PENEMUAN LABORATORIUM // SERENDIPITY MEDIS:
                </text>
                <text x="30" y="48" fill="#ffffff" fontSize="18" fontWeight="900" fontFamily="'Montserrat', sans-serif">
                  {primaryText || 'ZONA INHIBISI: JAMUR PENISILIN MEMBUNUH BAKTERI'}
                </text>
              </g>
            </g>
          )}

          {/* ======================================================== */}
          {/* SCENE T: CLOCK COUNTDOWN (Petugas Melihat Jam Saku Kritis) */}
          {/* ======================================================== */}
          {(type === 'clock-countdown' || type === 'fatal-clock' || type === 'time-pressure') && (
            <g transform="translate(100, 360)">
              {/* Giant Station Clock in Background */}
              <g transform="translate(440, 240)" style={{ filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.85))' }}>
                <circle cx="0" cy="0" r="160" fill="#09101d" stroke="#334155" strokeWidth="6" />
                <circle cx="0" cy="0" r="135" fill="none" stroke="rgba(239, 68, 68, 0.25)" strokeWidth="2" />
                {Array.from({ length: 12 }).map((_, i) => {
                  const rad = (i * 30 * Math.PI) / 180;
                  return (
                    <line
                      key={i}
                      x1={Math.sin(rad) * 115}
                      y1={-Math.cos(rad) * 115}
                      x2={Math.sin(rad) * 130}
                      y2={-Math.cos(rad) * 130}
                      stroke={i % 3 === 0 ? '#ef4444' : '#64748b'}
                      strokeWidth={i % 3 === 0 ? 5 : 2}
                    />
                  );
                })}
                {/* Sweeping Clock Hands */}
                {(() => {
                  const secAngle = (frame * 12) % 360;
                  const minAngle = (frame * 1.5) % 360;
                  return (
                    <g>
                      <line x1="0" y1="0" x2={Math.sin((minAngle * Math.PI) / 180) * 80} y2={-Math.cos((minAngle * Math.PI) / 180) * 80} stroke="#f8fafc" strokeWidth="6" strokeLinecap="round" />
                      <line x1="0" y1="0" x2={Math.sin((secAngle * Math.PI) / 180) * 110} y2={-Math.cos((secAngle * Math.PI) / 180) * 110} stroke="#ef4444" strokeWidth="3.5" strokeLinecap="round" />
                      <circle cx="0" cy="0" r="8" fill="#ef4444" />
                    </g>
                  );
                })()}
              </g>

              {/* Station Officer Character with Vintage Pocket Watch */}
              <g transform="translate(440, 290)">
                {/* Officer Uniform Coat */}
                <polygon points="-80,240 80,240 65,110 -65,110" fill="#1e293b" />
                <polygon points="-10,110 10,110 14,200 -14,200" fill="#dc2626" />

                {/* Head & Service Visor Cap */}
                <rect x="-14" y="80" width="28" height="30" fill="#cbd5e1" />
                <ellipse cx="0" cy="55" rx="38" ry="42" fill="#f1f5f9" />
                <polygon points="-36,40 36,40 28,15 -28,15" fill="#1e293b" />
                <ellipse cx="0" cy="42" rx="42" ry="7" fill="#0f172a" />
                <ellipse cx="-16" cy="54" rx="4" ry="5" fill="#0f172a" />
                <ellipse cx="16" cy="54" rx="4" ry="5" fill="#0f172a" />

                {/* Left Hand Holding Open Golden Pocket Watch */}
                <path d="M -65 125 C -90 160, -85 200, -50 220" fill="none" stroke="#1e293b" strokeWidth="22" strokeLinecap="round" />
                <ellipse cx="-45" cy="220" rx="14" ry="10" fill="#cbd5e1" />

                {/* Vintage Gold Pocket Watch in Palm */}
                <g transform="translate(-45, 205)">
                  <circle cx="0" cy="0" r="28" fill="#d97706" stroke="#fef08a" strokeWidth="3" />
                  <circle cx="0" cy="0" r="23" fill="#f8fafc" />
                  <line x1="0" y1="0" x2="8" y2="-12" stroke="#0f172a" strokeWidth="2" />
                  <line x1="0" y1="0" x2="-10" y2="6" stroke="#ef4444" strokeWidth="1.5" />
                  {/* Watch Chain to Vest */}
                  <path d="M 0 -28 C -15 -45, 10 -60, 20 -80" fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeDasharray="4 2" />
                </g>
              </g>

              {/* Digital Countdown HUD Banner */}
              <g transform="translate(60, 560)" style={{ filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.92))' }}>
                <rect x="0" y="0" width="760" height="60" fill="rgba(15, 23, 42, 0.96)" stroke="#ef4444" strokeWidth="3" rx="8" />
                <text x="30" y="38" fill="#ef4444" fontSize="24" fontWeight="900" fontFamily="monospace" letterSpacing="3">
                  DETIK KRITIS: {metricValue || '00:03.45'} • {primaryText || 'DEADLINE FATAL'}
                </text>
              </g>
            </g>
          )}

          {/* ======================================================== */}
          {/* SCENE U: KEY LOCKBOX (Perwira Mencoba Kunci Teropong Titanic) */}
          {/* ======================================================== */}
          {(type === 'key-lockbox' || type === 'forgotten-key' || type === 'missing-key') && (
            <g transform="translate(100, 360)">
              {/* Steel Locker in Ship Locker Room */}
              <g transform="translate(120, 160)" style={{ filter: 'drop-shadow(0 25px 45px rgba(0,0,0,0.95))' }}>
                <rect x="0" y="0" width="340" height="420" fill="#1e293b" stroke="#475569" strokeWidth="6" rx="8" />
                <line x1="170" y1="0" x2="170" y2="420" stroke="#0f172a" strokeWidth="4" />
                <rect x="15" y="25" width="310" height="35" fill="#0f172a" rx="4" />
                <text x="170" y="48" fill="#FFE600" fontSize="13" fontWeight="900" fontFamily="monospace" textAnchor="middle">
                  LOCKER: LOOKOUT BINOCULARS
                </text>

                {/* Brass Keyhole on Locker Door */}
                <circle cx="150" cy="220" r="22" fill="#d97706" stroke="#fef08a" strokeWidth="3" />
                <circle cx="150" cy="216" r="6" fill="#0f172a" />
                <polygon points="147,218 153,218 152,230 148,230" fill="#0f172a" />
              </g>

              {/* Naval Officer Character Standing at Locker Trying Keys */}
              <g transform="translate(560, 260)">
                {/* Double-Breasted Navy Blue Uniform */}
                <polygon points="-65,270 65,270 50,110 -50,110" fill="#0a192f" />
                {/* Gold Officer Buttons */}
                {[-20, 20].map((bx) => (
                  <g key={bx}>
                    <circle cx={bx} cy="150" r="5" fill="#f59e0b" />
                    <circle cx={bx} cy="180" r="5" fill="#f59e0b" />
                    <circle cx={bx} cy="210" r="5" fill="#f59e0b" />
                  </g>
                ))}
                {/* Gold Sleeve Lace Rings */}
                <line x1="35" y1="230" x2="60" y2="230" stroke="#f59e0b" strokeWidth="3" />
                <line x1="35" y1="236" x2="60" y2="236" stroke="#f59e0b" strokeWidth="3" />

                {/* Head & White Officer Naval Cap */}
                <rect x="-12" y="80" width="24" height="30" fill="#cbd5e1" />
                <ellipse cx="0" cy="55" rx="34" ry="38" fill="#f1f5f9" />
                <polygon points="-36,40 36,40 28,10 -28,10" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="2" />
                <ellipse cx="0" cy="42" rx="42" ry="7" fill="#0a192f" />
                <circle cx="0" cy="30" r="6" fill="#f59e0b" />

                {/* Sweating Panicked Expression */}
                <ellipse cx="-16" cy="54" rx="4" ry="5" fill="#0f172a" />
                <ellipse cx="16" cy="54" rx="4" ry="5" fill="#0f172a" />
                {/* Sweat Drop */}
                <circle cx="28" cy="48" r="3" fill="#38bdf8" />

                {/* Arm Extended Holding Ring of Wrong Brass Keys */}
                {(() => {
                  const keyTremble = Math.sin(frame * 0.5) * 4;
                  return (
                    <g transform={`translate(${keyTremble}, 0)`}>
                      <path d="M -45 125 C -80 150, -110 170, -130 180" fill="none" stroke="#0a192f" strokeWidth="22" strokeLinecap="round" />
                      <ellipse cx="-135" cy="180" rx="12" ry="10" fill="#cbd5e1" />

                      {/* Brass Key Ring with Multiple Keys */}
                      <g transform="translate(-145, 180) rotate(-15)">
                        <circle cx="0" cy="0" r="14" fill="none" stroke="#f59e0b" strokeWidth="3" />
                        <line x1="0" y1="12" x2="-25" y2="30" stroke="#f59e0b" strokeWidth="4" />
                        <line x1="0" y1="12" x2="-10" y2="35" stroke="#f59e0b" strokeWidth="4" />
                        <line x1="0" y1="12" x2="10" y2="32" stroke="#f59e0b" strokeWidth="4" />
                      </g>
                    </g>
                  );
                })()}
              </g>

              {/* Telemetry Banner */}
              <g transform="translate(60, 580)" style={{ filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.92))' }}>
                <rect x="0" y="0" width="760" height="60" fill="rgba(15, 23, 42, 0.96)" stroke="#ef4444" strokeWidth="3" rx="8" />
                <rect x="0" y="0" width="10" height="60" fill="#ef4444" />
                <text x="30" y="26" fill="#ef4444" fontSize="12" fontWeight="900" fontFamily="monospace" letterSpacing="2">
                  KUNCI TERBAWA // PETUGAS PENGAWAS TANPA TEROPONG:
                </text>
                <text x="30" y="48" fill="#FFE600" fontSize="18" fontWeight="900" fontFamily="'Montserrat', sans-serif">
                  {primaryText || 'KUNCI LOKER TERBAWA KE INGGRIS • TEROPONG TERKUNCI'}
                </text>
              </g>
            </g>
          )}

          {/* ======================================================== */}
          {/* SCENE V: CAR ROUTE (Konvoi Archduke & Pembunuh Princip) */}
          {/* ======================================================== */}
          {(type === 'car-route' || type === 'wrong-turn' || type === 'transit-blunder') && (
            <g transform="translate(100, 360)">
              {/* Sarajevo Street Corner Backdrop */}
              <rect x="40" y="140" width="800" height="420" fill="#181412" stroke="#332925" strokeWidth="4" rx="8" />
              {/* Street Sign */}
              <g transform="translate(80, 160)">
                <rect x="0" y="0" width="220" height="30" fill="#0f172a" stroke="#f8fafc" strokeWidth="2" rx="3" />
                <text x="110" y="20" fill="#f8fafc" fontSize="11" fontWeight="900" fontFamily="serif" textAnchor="middle">
                  FRANZ JOSEF STRASSE (SALAH BELOK)
                </text>
              </g>

              {/* Vintage Royal Phaeton Open-Top Car */}
              <g transform="translate(240, 360)" style={{ filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.9))' }}>
                {/* Car Body */}
                <path d="M -80 60 L -60 -10 L 160 -10 L 220 30 L 200 80 L -80 80 Z" fill="#78350f" stroke="#451a03" strokeWidth="3" />
                <circle cx="-30" cy="80" r="25" fill="#0f172a" stroke="#cbd5e1" strokeWidth="4" />
                <circle cx="150" cy="80" r="25" fill="#0f172a" stroke="#cbd5e1" strokeWidth="4" />

                {/* Chauffeur in Front Gripping Steering Wheel in Panic */}
                <g transform="translate(110, -50)">
                  <polygon points="-15,40 15,40 10,0 -10,0" fill="#1e293b" />
                  <ellipse cx="0" cy="-15" rx="14" ry="16" fill="#cbd5e1" />
                  <ellipse cx="0" cy="-22" rx="16" ry="6" fill="#0f172a" />
                  {/* Hands on Steering Wheel */}
                  <line x1="10" y1="15" x2="25" y2="5" stroke="#1e293b" strokeWidth="8" />
                  <ellipse cx="25" cy="5" rx="14" ry="5" fill="none" stroke="#d97706" strokeWidth="4" />
                </g>

                {/* Archduke Franz Ferdinand in Back with Feathered Helmet */}
                <g transform="translate(10, -60)">
                  {/* Pale Blue Military Tunic */}
                  <polygon points="-20,50 20,50 15,0 -15,0" fill="#38bdf8" />
                  <ellipse cx="0" cy="-15" rx="16" ry="18" fill="#f1f5f9" />
                  {/* Plumed Green Ostrich Feather Bicorn Hat */}
                  <polygon points="-24,-20 24,-20 18,-35 -18,-35" fill="#1e293b" />
                  <path d="M -15 -35 Q -30 -60 10 -55 Q 35 -50 20 -35" fill="#16a34a" />
                </g>
              </g>

              {/* Assassin Gavrilo Princip Stepping off Curb Raising Pistol */}
              <g transform="translate(680, 280)">
                {/* Dark Overcoat Torso */}
                <polygon points="-30,190 30,190 25,60 -25,60" fill="#0f172a" />
                {/* Head & Fedora Hat */}
                <rect x="-8" y="35" width="16" height="25" fill="#cbd5e1" />
                <ellipse cx="0" cy="15" rx="20" ry="24" fill="#f1f5f9" />
                <ellipse cx="0" cy="5" rx="28" ry="6" fill="#0f172a" />
                <path d="M -18 5 C -15 -18, 15 -18, 18 5 Z" fill="#1e293b" />

                {/* Left Arm at Side */}
                <path d="M 20 65 L 25 150" stroke="#0f172a" strokeWidth="16" strokeLinecap="round" />

                {/* Right Arm Extended Forward Leveling Pistol at Motorcade */}
                <path d="M -20 65 C -60 60, -90 55, -130 50" fill="none" stroke="#0f172a" strokeWidth="18" strokeLinecap="round" />
                <ellipse cx="-135" cy="50" rx="8" ry="7" fill="#cbd5e1" />
                {/* FN Model 1910 Pistol */}
                <rect x="-165" y="44" width="30" height="12" fill="#334155" stroke="#000" strokeWidth="2" rx="2" />
                <rect x="-140" y="52" width="10" height="16" fill="#78350f" rx="1" />
              </g>

              {/* Status Telemetry Banner */}
              <g transform="translate(60, 580)" style={{ filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.92))' }}>
                <rect x="0" y="0" width="760" height="60" fill="rgba(15, 23, 42, 0.96)" stroke="#ef4444" strokeWidth="3" rx="8" />
                <rect x="0" y="0" width="10" height="60" fill="#ef4444" />
                <text x="30" y="26" fill="#ef4444" fontSize="12" fontWeight="900" fontFamily="monospace" letterSpacing="2">
                  SALAH BELOK FATAL // TITIK AWAL PERANG DUNIA I:
                </text>
                <text x="30" y="48" fill="#FFE600" fontSize="18" fontWeight="900" fontFamily="'Montserrat', sans-serif">
                  {primaryText || 'SOPIR SALAH JALAN • BERHENTI TEPAT DI DEPAN PRINCIP'}
                </text>
              </g>
            </g>
          )}

          {/* ======================================================== */}
          {/* SCENE W: RADIATION HAZARD (Inspektur Hazmat Mengukur Radiasi) */}
          {/* ======================================================== */}
          {(type === 'radiation-hazard' || type === 'toxic-cloud' || type === 'hazard-spread') && (
            <g transform="translate(100, 360)">
              {/* Toxic Radiation Fog Ambient */}
              <rect x="40" y="140" width="800" height="420" fill="#140f06" stroke="#f59e0b" strokeWidth="4" rx="8" />

              {/* Radiating Hazard Rings */}
              <g transform="translate(440, 320)">
                {[100, 180, 260].map((r, i) => {
                  const ringScale = (r + frame * 3) % 280;
                  return (
                    <circle
                      key={i}
                      cx="0"
                      cy="0"
                      r={ringScale}
                      fill="none"
                      stroke="#f59e0b"
                      strokeWidth="2.5"
                      opacity={Math.max(0, 1 - ringScale / 280)}
                      strokeDasharray="8 6"
                    />
                  );
                })}
              </g>

              {/* Hazmat Scientist Character with Geiger Counter */}
              <g transform="translate(440, 270)">
                {/* Yellow Hazmat Suit Torso */}
                <polygon points="-75,250 75,250 60,110 -60,110" fill="#eab308" stroke="#ca8a04" strokeWidth="3" />
                {/* Full Face Gas Mask Respirator */}
                <ellipse cx="0" cy="55" rx="38" ry="44" fill="#ca8a04" />
                <circle cx="-16" cy="50" r="14" fill="#0f172a" stroke="#cbd5e1" strokeWidth="2" />
                <circle cx="16" cy="50" r="14" fill="#0f172a" stroke="#cbd5e1" strokeWidth="2" />
                <circle cx="0" cy="78" r="16" fill="#334155" stroke="#000" strokeWidth="3" />

                {/* Right Arm Holding Geiger Counter Probe */}
                <path d="M 60 120 C 100 150, 120 180, 130 200" fill="none" stroke="#eab308" strokeWidth="22" strokeLinecap="round" />
                <rect x="125" y="190" width="16" height="40" fill="#334155" rx="3" transform="rotate(-30 133 210)" />
              </g>

              {/* Toxic Overload Banner */}
              <g transform="translate(60, 580)" style={{ filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.92))' }}>
                <rect x="0" y="0" width="760" height="60" fill="rgba(15, 23, 42, 0.96)" stroke="#f59e0b" strokeWidth="3" rx="8" />
                <text x="30" y="38" fill="#f59e0b" fontSize="22" fontWeight="900" fontFamily="monospace" letterSpacing="2">
                  RADIASI MEMATIKAN: {metricValue || '15,000 ROENTGEN/JAM'} • EVAKUASI TOTAL
                </text>
              </g>
            </g>
          )}

          {/* ======================================================== */}
          {/* SCENE X: VALVE FAILURE (Teknisi Berjuang di Katup Bocor)  */}
          {/* ======================================================== */}
          {(type === 'valve-failure' || type === 'pipeline-breach' || type === 'pressure-burst') && (
            <g transform="translate(100, 360)">
              {/* Industrial Pipeline Ambient */}
              <rect x="40" y="140" width="800" height="420" fill="#0f172a" stroke="#ef4444" strokeWidth="4" rx="8" />

              {/* Heavy Steam Pipe Lines */}
              <rect x="80" y="440" width="720" height="70" fill="#1e293b" stroke="#334155" strokeWidth="4" rx="4" />
              <rect x="460" y="200" width="60" height="310" fill="#1e293b" stroke="#334155" strokeWidth="4" rx="4" />

              {/* Escaping High Pressure Steam Jets */}
              {Array.from({ length: 12 }).map((_, i) => {
                const sDist = ((frame * 12 + i * 22) % 150) + 20;
                const sAngle = -65 + (i % 5) * 25;
                const sx = 460 + Math.cos((sAngle * Math.PI) / 180) * sDist;
                const sy = 410 + Math.sin((sAngle * Math.PI) / 180) * sDist;
                return (
                  <circle
                    key={i}
                    cx={sx}
                    cy={sy}
                    r={12 + (i % 4) * 4}
                    fill="#f8fafc"
                    opacity={Math.max(0, 0.85 - sDist / 170)}
                  />
                );
              })}

              {/* Technician Straining at Heavy Valve */}
              <g transform="translate(560, 270)">
                <polygon points="-50,280 50,280 40,120 -40,120" fill="#c2410c" stroke="#7c2d12" strokeWidth="3" />
                <ellipse cx="0" cy="50" rx="42" ry="14" fill="#FFE600" stroke="#b45309" strokeWidth="2" />
                <path d="M -35 50 C -30 15, 30 15, 35 50 Z" fill="#FFE600" />

                {/* Arms on Valve */}
                <path d="M -35 130 C -70 160, -90 190, -95 210" fill="none" stroke="#c2410c" strokeWidth="24" strokeLinecap="round" />
                <path d="M 35 130 C 5 150, -40 170, -70 190" fill="none" stroke="#c2410c" strokeWidth="24" strokeLinecap="round" />
                {/* Red Valve Handwheel */}
                <g transform="translate(-85, 200) rotate(20)">
                  <circle cx="0" cy="0" r="42" fill="none" stroke="#dc2626" strokeWidth="10" />
                  <line x1="-42" y1="0" x2="42" y2="0" stroke="#dc2626" strokeWidth="8" />
                  <line x1="0" y1="-42" x2="0" y2="42" stroke="#dc2626" strokeWidth="8" />
                </g>
              </g>

              {/* Telemetry Banner */}
              <g transform="translate(60, 580)" style={{ filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.92))' }}>
                <rect x="0" y="0" width="760" height="60" fill="rgba(15, 23, 42, 0.96)" stroke="#ef4444" strokeWidth="3" rx="8" />
                <text x="30" y="38" fill="#ef4444" fontSize="22" fontWeight="900" fontFamily="monospace" letterSpacing="2">
                  KEGAGALAN KATUP TEKANAN // KEBOCORAN PIPA SISTEM
                </text>
              </g>
            </g>
          )}

          {/* ======================================================== */}
          {/* SCENE Y: TELEGRAPH WIRE (Operator Nirkabel Mengirim SOS) */}
          {/* ======================================================== */}
          {(type === 'telegraph-wire' || type === 'morse-signal' || type === 'emergency-signal') && (
            <g transform="translate(100, 360)">
              {/* Radio Shack Ambient & Expanding Radio Wavefronts */}
              <rect x="40" y="140" width="800" height="420" fill="#080e1b" stroke="#38bdf8" strokeWidth="4" rx="8" />

              {/* Antenna Mast Radiating Rings */}
              <g transform="translate(200, 240)">
                {[40, 90, 150, 220].map((r, i) => {
                  const ringR = (r + frame * 3) % 240;
                  return (
                    <circle
                      key={i}
                      cx="0"
                      cy="0"
                      r={ringR}
                      fill="none"
                      stroke="#38bdf8"
                      strokeWidth="2.5"
                      opacity={Math.max(0, 1 - ringR / 240)}
                    />
                  );
                })}
              </g>

              {/* Wireless Operator Jack Phillips at Radio Desk */}
              <g transform="translate(480, 270)">
                {/* White Shirt with Suspenders */}
                <polygon points="-75,250 75,250 60,110 -60,110" fill="#f8fafc" />
                <line x1="-30" y1="110" x2="-40" y2="250" stroke="#0f172a" strokeWidth="8" />
                <line x1="30" y1="110" x2="40" y2="250" stroke="#0f172a" strokeWidth="8" />

                {/* Head with Vintage Double-Cup Headband Earphones */}
                <rect x="-14" y="80" width="28" height="30" fill="#cbd5e1" />
                <ellipse cx="0" cy="55" rx="38" ry="42" fill="#f1f5f9" />
                {/* Earphone Headband & Cups */}
                <path d="M -42 55 C -45 10, 45 10, 42 55" fill="none" stroke="#94a3b8" strokeWidth="5" />
                <rect x="-48" y="42" width="12" height="26" fill="#1e293b" rx="4" />
                <rect x="36" y="42" width="12" height="26" fill="#1e293b" rx="4" />

                {/* Left Hand Holding Logbook */}
                <path d="M -60 120 C -90 150, -100 190, -80 230" fill="none" stroke="#f8fafc" strokeWidth="20" strokeLinecap="round" />
                <ellipse cx="-80" cy="235" rx="12" ry="10" fill="#cbd5e1" />

                {/* Right Hand Tapping Brass Morse Key with Sparks */}
                {(() => {
                  const tap = Math.sin(frame * 0.8) * 3;
                  return (
                    <g transform={`translate(0, ${tap})`}>
                      <path d="M 60 120 C 90 150, 80 200, 40 235 L 20 240" fill="none" stroke="#f8fafc" strokeWidth="20" strokeLinecap="round" />
                      <ellipse cx="20" cy="240" rx="12" ry="10" fill="#cbd5e1" />

                      {/* Brass Morse Telegraph Key on Desk */}
                      <g transform="translate(15, 235)">
                        <rect x="-10" y="10" width="40" height="15" fill="#78350f" rx="3" />
                        <line x1="-5" y1="10" x2="25" y2="5" stroke="#f59e0b" strokeWidth="5" />
                        <circle cx="25" cy="5" r="5" fill="#0f172a" />
                        {/* Electric Blue Morse Sparks */}
                        <circle cx="5" cy="10" r={8 + pulse * 6} fill="none" stroke="#38bdf8" strokeWidth="2" />
                      </g>
                    </g>
                  );
                })()}
              </g>

              {/* Distress Telegram Banner */}
              <g transform="translate(60, 580)" style={{ filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.92))' }}>
                <rect x="0" y="0" width="760" height="60" fill="rgba(15, 23, 42, 0.96)" stroke="#38bdf8" strokeWidth="3" rx="8" />
                <text x="30" y="26" fill="#38bdf8" fontSize="12" fontWeight="900" fontFamily="monospace" letterSpacing="2">
                  TRANSMISI NIRKABEL MARCONI // DISTRESS CALL:
                </text>
                <text x="30" y="48" fill="#FFE600" fontSize="18" fontWeight="900" fontFamily="monospace">
                  {quoteText || 'CQD SOS DE MGY (TITANIC) • • • — — — • • •'}
                </text>
              </g>
            </g>
          )}

          {/* ======================================================== */}
          {/* SCENE Z: CROWD PROTEST (Pemimpin Demonstrasi & Pawai Lilin) */}
          {/* ======================================================== */}
          {(type === 'crowd-protest' || type === 'mass-revolt' || type === 'revolution-action') && (
            <g transform="translate(100, 360)">
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

              {/* Protest Leader Hoisted on Comrades' Shoulders with Megaphone */}
              <g transform="translate(440, 240)">
                {/* Comrades' Shoulders Supporting Him */}
                <ellipse cx="-40" cy="190" rx="35" ry="25" fill="#0f172a" />
                <ellipse cx="40" cy="190" rx="35" ry="25" fill="#0f172a" />

                {/* Leader Torso in Heavy Winter Coat */}
                <polygon points="-45,180 45,180 35,60 -35,60" fill="#2563eb" />
                {/* Red Scarf Fluttering */}
                <path d="M 0 65 Q 25 50 45 70 Q 60 80 75 75" fill="none" stroke="#dc2626" strokeWidth="8" strokeLinecap="round" />

                {/* Head & Shouting Mouth */}
                <rect x="-10" y="35" width="20" height="28" fill="#cbd5e1" />
                <ellipse cx="0" cy="15" rx="26" ry="30" fill="#f1f5f9" />
                <path d="M -26 12 C -20 -18, 20 -18, 26 12 Z" fill="#0f172a" />
                {/* Wide Shouting Mouth */}
                <ellipse cx="0" cy="24" rx="8" ry={6 + Math.sin(frame * 0.4) * 3} fill="#0f172a" />

                {/* Left Arm Pumped High in Fist */}
                {(() => {
                  const fistBob = Math.sin(frame * 0.3) * 6;
                  return (
                    <g transform={`translate(0, ${fistBob})`}>
                      <path d="M -35 70 C -60 40, -75 0, -80 -25" fill="none" stroke="#2563eb" strokeWidth="18" strokeLinecap="round" />
                      <ellipse cx="-80" cy="-28" rx="12" ry="12" fill="#cbd5e1" />
                    </g>
                  );
                })()}

                {/* Right Arm Holding Handheld Megaphone to Mouth */}
                <path d="M 35 70 C 60 55, 75 40, 65 25 L 30 25" fill="none" stroke="#2563eb" strokeWidth="18" strokeLinecap="round" />
                <ellipse cx="30" cy="25" rx="10" ry="8" fill="#cbd5e1" />

                {/* Red Bullhorn Megaphone */}
                <g transform="translate(35, 15) rotate(15)">
                  <polygon points="0,10 65,-15 65,35" fill="#ef4444" stroke="#f8fafc" strokeWidth="2" />
                  <rect x="-15" y="2" width="16" height="16" fill="#1e293b" rx="2" />
                  {/* Concentric Acoustic Waves */}
                  <circle cx="65" cy="10" r={20 + pulse * 20} fill="none" stroke="#FFE600" strokeWidth="2.5" opacity={1 - pulse * 0.7} />
                  <circle cx="65" cy="10" r={40 + pulse * 28} fill="none" stroke="#f59e0b" strokeWidth="2" strokeDasharray="6 4" opacity={0.8 - pulse * 0.6} />
                </g>
              </g>

              {/* Peaceful Demonstrators Holding Glowing Candles */}
              <g transform="translate(180, 360)">
                <ellipse cx="0" cy="60" rx="30" ry="35" fill="#0f172a" />
                <ellipse cx="0" cy="10" rx="18" ry="22" fill="#cbd5e1" />
                {/* Cupped Hands Sheltering Glowing Candle */}
                <ellipse cx="0" cy="45" rx="16" ry="12" fill="#cbd5e1" />
                <rect x="-3" y="32" width="6" height="15" fill="#f8fafc" rx="1" />
                <circle cx="0" cy="28" r={8 + pulse * 4} fill="#FFE600" opacity={0.9} style={{ filter: 'drop-shadow(0 0 10px #f59e0b)' }} />
              </g>
              <g transform="translate(700, 360)">
                <ellipse cx="0" cy="60" rx="30" ry="35" fill="#0f172a" />
                <ellipse cx="0" cy="10" rx="18" ry="22" fill="#cbd5e1" />
                <ellipse cx="0" cy="45" rx="16" ry="12" fill="#cbd5e1" />
                <rect x="-3" y="32" width="6" height="15" fill="#f8fafc" rx="1" />
                <circle cx="0" cy="28" r={8 + pulse * 4} fill="#FFE600" opacity={0.9} style={{ filter: 'drop-shadow(0 0 10px #f59e0b)' }} />
              </g>

              {/* Authentic Historical Placards Held High */}
              <g transform="translate(40, 420)">
                {[
                  { x: 140, label: 'WIR SIND DAS VOLK', rot: -5 },
                  { x: 380, label: stampText || 'KEBEBASAN', rot: 3 },
                  { x: 620, label: 'TOR AUF! (BUKA GERBANG)', rot: -2 },
                ].map((banner, bIdx) => {
                  const bBob = Math.sin(frame * 0.12 + bIdx * 2) * 6;
                  return (
                    <g key={bIdx} transform={`translate(${banner.x}, ${40 + bBob}) rotate(${banner.rot})`}>
                      <line x1="0" y1="50" x2="0" y2="0" stroke="#050811" strokeWidth="5" />
                      <rect x="-85" y="-38" width="170" height="38" fill="#f8fafc" stroke="#0f172a" strokeWidth="3" rx="3" />
                      <line x1="-80" y1="-5" x2="80" y2="-5" stroke="#dc2626" strokeWidth="2" />
                      <text x="0" y="-14" fill="#0f172a" fontSize="12" fontWeight="900" fontFamily="'Montserrat', sans-serif" textAnchor="middle">
                        {banner.label}
                      </text>
                    </g>
                  );
                })}

                {/* Forefront Dense Crowd Horizon */}
                <path
                  d="M 0 160 Q 35 120 70 150 Q 115 115 160 145 Q 210 110 260 145 Q 310 120 360 150 Q 410 115 460 145 Q 510 110 560 145 Q 610 120 660 150 Q 710 115 755 145 Q 785 130 800 160 L 800 280 L 0 280 Z"
                  fill="#03050a"
                />
              </g>

              {/* Telemetry Banner */}
              <g transform="translate(60, 580)" style={{ filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.92))' }}>
                <rect x="0" y="0" width="760" height="60" fill="rgba(15, 23, 42, 0.96)" stroke="#ef4444" strokeWidth="3" rx="8" />
                <rect x="0" y="0" width="10" height="60" fill="#ef4444" />
                <text x="30" y="26" fill="#ef4444" fontSize="12" fontWeight="900" fontFamily="monospace" letterSpacing="2">
                  ESKALASI MASSA // TAK TERBENDUNG:
                </text>
                <text x="30" y="48" fill="#FFE600" fontSize="18" fontWeight="900" fontFamily="'Montserrat', sans-serif">
                  {primaryText || 'PULUHAN RIBU WARGA MEMADATI JALANAN TANPA KEKERASAN'}
                </text>
              </g>
            </g>
          )}

          {/* ======================================================== */}
          {/* SCENE AA: COURTROOM GAVEL (Hakim Mengetuk Palu Sidang)   */}
          {/* ======================================================== */}
          {(type === 'courtroom-gavel' || type === 'inquiry-tribunal' || type === 'verdict-ruling') && (
            <g transform="translate(100, 360)">
              {/* Elevated Mahogany Judicial Bench */}
              <g style={{ filter: 'drop-shadow(0 25px 45px rgba(0,0,0,0.95))' }}>
                <rect x="60" y="480" width="760" height="200" fill="#2d1b15" stroke="#181311" strokeWidth="4" rx="8" />
                <rect x="60" y="480" width="760" height="24" fill="#3e2723" />
                {/* Round Hardwood Sound Block on Bench */}
                <ellipse cx="440" cy="500" rx="55" ry="18" fill="#181311" stroke="#b45309" strokeWidth="3" />
              </g>

              {/* Official Judge Character in Judicial Robe */}
              <g transform="translate(440, 240)">
                {/* Black Formal Judicial Robe */}
                <polygon points="-100,260 100,260 85,110 -85,110" fill="#0f172a" />
                {/* White Neck Bands / Collar */}
                <polygon points="-24,110 24,110 28,170 -28,170" fill="#f8fafc" />
                <rect x="-10" y="130" width="8" height="40" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1" />
                <rect x="2" y="130" width="8" height="40" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1" />

                {/* Head & Formal Expression */}
                <rect x="-18" y="75" width="36" height="35" fill="#cbd5e1" />
                <ellipse cx="0" cy="50" rx="42" ry="46" fill="#f1f5f9" />
                <path d="M -48 40 C -45 -10, 45 -10, 48 40 C 35 15, -35 15, -48 40 Z" fill="#475569" />

                {/* Left Hand Resting Solemnly on Bench */}
                <path d="M -85 125 C -120 160, -130 200, -100 240 L -60 240" fill="none" stroke="#0f172a" strokeWidth="24" strokeLinecap="round" />
                <ellipse cx="-60" cy="240" rx="14" ry="10" fill="#cbd5e1" />

                {/* Right Arm Raised Striking Heavy Wooden Gavel */}
                {(() => {
                  const strikeProg = Math.sin(frame * 0.25);
                  const rot = strikeProg > 0 ? strikeProg * 35 : strikeProg * 8;
                  const isImpact = strikeProg < -0.8;
                  return (
                    <g transform="translate(85, 125)">
                      <g transform={`rotate(${-rot} 0 0)`}>
                        <path d="M 0 0 C 30 30, 40 70, 20 110 L -10 115" fill="none" stroke="#0f172a" strokeWidth="24" strokeLinecap="round" />
                        <ellipse cx="-10" cy="115" rx="14" ry="10" fill="#cbd5e1" />

                        {/* Heavy Turned Wood Gavel Handle & Head */}
                        <g transform="translate(-10, 115) rotate(25)">
                          <line x1="0" y1="0" x2="-25" y2="90" stroke="#b45309" strokeWidth="9" strokeLinecap="round" />
                          <rect x="-45" y="75" width="40" height="22" fill="#78350f" stroke="#fef08a" strokeWidth="2" rx="3" />
                        </g>
                      </g>

                      {/* Explosive Sound Block Shockwave on Impact */}
                      {isImpact && (
                        <g transform="translate(-85, 260)">
                          <circle cx="0" cy="0" r={40 + pulse * 20} fill="none" stroke="#FFE600" strokeWidth="4" opacity={0.9} />
                          <circle cx="0" cy="0" r={70 + pulse * 30} fill="none" stroke="#ef4444" strokeWidth="2" strokeDasharray="6 4" opacity={0.7} />
                        </g>
                      )}
                    </g>
                  );
                })()}
              </g>

              {/* Court Inquiry Telemetry Banner */}
              <g transform="translate(60, 580)" style={{ filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.92))' }}>
                <rect x="0" y="0" width="760" height="60" fill="rgba(15, 23, 42, 0.96)" stroke="#ef4444" strokeWidth="3" rx="8" />
                <rect x="0" y="0" width="10" height="60" fill="#ef4444" />
                <text x="30" y="26" fill="#ef4444" fontSize="12" fontWeight="900" fontFamily="monospace" letterSpacing="2">
                  SIDANG TRIBUNAL RESMI // VONIS SEJARAH:
                </text>
                <text x="30" y="48" fill="#FFE600" fontSize="18" fontWeight="900" fontFamily="'Montserrat', sans-serif">
                  {primaryText || stampText || 'INVESTIGASI MATERIL & PUTUSAN AKHIR'}
                </text>
              </g>
            </g>
          )}

          {/* ======================================================== */}
          {/* SCENE S: FORENSIC DOSSIER (Detektif di Meja Bukti Deklasifikasi) */}
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
            <g transform="translate(100, 360)">
              {/* Archive Desk Lamp Cone */}
              <polygon points="440,120 100,700 780,700" fill="url(#spotlightDir)" opacity="0.18" />

              {/* Wooden Forensic Evidence Table */}
              <g style={{ filter: 'drop-shadow(0 25px 45px rgba(0,0,0,0.95))' }}>
                <rect x="60" y="520" width="760" height="180" fill="#181311" stroke="#3e2723" strokeWidth="4" rx="8" />
                <rect x="60" y="520" width="760" height="22" fill="#2d1b15" />
              </g>

              {/* Forensic Analyst Character Leaning Over Dossier */}
              <g transform="translate(440, 260)">
                <polygon points="-90,260 90,260 75,120 -75,120" fill="#1e293b" />
                <polygon points="-24,120 24,120 32,170 -32,170" fill="#f8fafc" />
                <polygon points="-10,135 10,135 12,230 0,245 -12,230" fill="#dc2626" />

                <rect x="-16" y="85" width="32" height="35" fill="#cbd5e1" />
                <ellipse cx="0" cy="55" rx="44" ry="48" fill="#f1f5f9" />
                <path d="M -46 45 C -42 -5, 42 -5, 46 45 C 35 15, -35 15, -46 45 Z" fill="#0f172a" />
                <ellipse cx="-18" cy="56" rx="4" ry="5" fill="#0f172a" />
                <ellipse cx="18" cy="56" rx="4" ry="5" fill="#0f172a" />

                {/* Left Hand Holding Red Evidence Marker */}
                <path d="M -75 140 C -110 180, -130 220, -110 260 L -60 260" fill="none" stroke="#1e293b" strokeWidth="22" strokeLinecap="round" />
                <ellipse cx="-60" cy="260" rx="14" ry="10" fill="#cbd5e1" />

                {/* Right Hand Holding Magnifier Scanning File */}
                {(() => {
                  const scan = Math.sin(frame * 0.18) * 12;
                  return (
                    <g transform={`translate(${scan}, 0)`}>
                      <path d="M 75 140 C 105 180, 95 230, 60 260 L 20 265" fill="none" stroke="#1e293b" strokeWidth="22" strokeLinecap="round" />
                      <ellipse cx="20" cy="265" rx="14" ry="10" fill="#cbd5e1" />
                      <g transform="translate(15, 260) rotate(-25)">
                        <line x1="0" y1="0" x2="-40" y2="-40" stroke="#78350f" strokeWidth="8" strokeLinecap="round" />
                        <circle cx="-50" cy="-50" r="38" fill="rgba(255,255,255,0.25)" stroke="#d97706" strokeWidth="6" />
                      </g>
                    </g>
                  );
                })()}
              </g>

              {/* Declassified Dossier on Table */}
              <g transform="translate(180, 440)" style={{ filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.85))' }}>
                <rect x="0" y="0" width="520" height="230" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="2" rx="6" />
                <rect x="25" y="20" width="220" height="26" fill="#dc2626" rx="3" />
                <text x="135" y="38" fill="#ffffff" fontSize="12" fontWeight="900" fontFamily="monospace" textAnchor="middle">
                  DEKLASIFIKASI FORENSIK
                </text>
                <text x="25" y="75" fill="#0f172a" fontSize="18" fontWeight="900" fontFamily="'Montserrat', sans-serif">
                  {(title || 'BERKAS PENYELIDIKAN RESMI').slice(0, 30)}
                </text>
                <line x1="25" y1="90" x2="495" y2="90" stroke="#cbd5e1" strokeWidth="2" />
                {[110, 130, 150, 170].map((ly, i) => (
                  <line key={i} x1="25" y1={ly} x2={i % 2 === 0 ? 490 : 410} y2={ly} stroke="#94a3b8" strokeWidth="3" />
                ))}

                {/* Red Classified Stamp */}
                <g transform="translate(320, 150) rotate(-8)" opacity={stampSpring}>
                  <rect x="0" y="0" width="160" height="48" fill="none" stroke="#dc2626" strokeWidth="3.5" strokeDasharray="6 3" rx="4" />
                  <text x="80" y="30" fill="#dc2626" fontSize="16" fontWeight="900" fontFamily="monospace" textAnchor="middle">
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
