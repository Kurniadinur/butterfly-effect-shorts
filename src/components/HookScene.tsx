import React from 'react';
import { Img, useCurrentFrame, useVideoConfig, spring, staticFile, interpolate } from 'remotion';

interface HookSceneProps {
  leftTitle: string;
  rightTitle: string;
  leftImage: string;
  rightImage: string;
}

export const HookScene: React.FC<HookSceneProps> = ({
  leftTitle,
  rightTitle,
  leftImage,
  rightImage,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = spring({
    frame,
    fps,
    config: { damping: 16, mass: 0.8 },
  });

  const zoomEffect = interpolate(frame, [0, 180], [1.0, 1.08], {
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '150px 60px 360px 60px',
        zIndex: 30,
      }}
    >
      {/* Top Documentary Headline */}
      <div
        style={{
          textAlign: 'center',
          marginBottom: '30px',
          transform: `scale(${entrance})`,
        }}
      >
        <span
          style={{
            display: 'inline-block',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            color: '#cbd5e1',
            padding: '4px 14px',
            borderRadius: '4px',
            fontSize: '15px',
            fontWeight: 800,
            letterSpacing: '2px',
            textTransform: 'uppercase',
            marginBottom: '12px',
            border: '1px solid rgba(255, 255, 255, 0.15)',
          }}
        >
          PARADOKS SEJARAH
        </span>
        <h1
          style={{
            fontSize: '44px',
            fontWeight: 900,
            color: '#ffffff',
            margin: 0,
            lineHeight: 1.15,
            letterSpacing: '-1px',
            fontFamily: "'Montserrat', sans-serif",
          }}
        >
          DARI SALAH BACA SELEMBAR MEMO...
        </h1>
      </div>

      {/* Side-by-Side Split Cards */}
      <div
        style={{
          width: '100%',
          flex: 1,
          display: 'flex',
          gap: '16px',
          position: 'relative',
        }}
      >
        {/* Left Side: The Minute Cause */}
        <div
          style={{
            flex: 1,
            borderRadius: '14px',
            overflow: 'hidden',
            backgroundColor: '#0f141f',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.8)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
            <Img
              src={staticFile(leftImage)}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'top 20%',
                transform: `scale(${zoomEffect})`,
                filter: 'contrast(1.05) brightness(0.95)',
              }}
            />
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(to top, #0f141f 0%, transparent 50%)',
              }}
            />
          </div>
          <div style={{ padding: '16px', textAlign: 'center', backgroundColor: '#0f141f' }}>
            <span style={{ fontSize: '14px', color: '#94a3b8', fontWeight: 700, letterSpacing: '1px' }}>
              AWAL MULA
            </span>
            <div style={{ fontSize: '22px', fontWeight: 800, color: '#ffffff', marginTop: '4px' }}>
              {leftTitle}
            </div>
          </div>
        </div>

        {/* Center Minimalist Transition Badge */}
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: '#0f172a',
            color: '#f8fafc',
            fontWeight: 800,
            fontSize: '18px',
            padding: '8px 16px',
            borderRadius: '999px',
            border: '2px solid rgba(255, 255, 255, 0.25)',
            boxShadow: '0 8px 25px rgba(0, 0, 0, 0.9)',
            zIndex: 10,
            letterSpacing: '1px',
          }}
        >
          AKIBATNYA ➔
        </div>

        {/* Right Side: The Massive Outcome */}
        <div
          style={{
            flex: 1,
            borderRadius: '14px',
            overflow: 'hidden',
            backgroundColor: '#0f141f',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.8)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
            <Img
              src={staticFile(rightImage)}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transform: `scale(${zoomEffect})`,
                filter: 'contrast(1.05) brightness(0.95)',
              }}
            />
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(to top, #0f141f 0%, transparent 50%)',
              }}
            />
          </div>
          <div style={{ padding: '16px', textAlign: 'center', backgroundColor: '#0f141f' }}>
            <span style={{ fontSize: '14px', color: '#ef4444', fontWeight: 700, letterSpacing: '1px' }}>
              DAMPAK AKHIR
            </span>
            <div style={{ fontSize: '22px', fontWeight: 800, color: '#ffffff', marginTop: '4px' }}>
              {rightTitle}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
