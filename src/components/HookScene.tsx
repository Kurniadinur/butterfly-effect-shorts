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

  // Entrance spring
  const scale = spring({
    frame,
    fps,
    config: { damping: 12, mass: 0.7 },
  });

  // Pulse flash at the very beginning (first 6 frames)
  const flash = interpolate(frame, [0, 4, 8], [0.8, 0.4, 0], {
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
        padding: '170px 60px 380px 60px',
        zIndex: 30,
      }}
    >
      {/* Top Shock Header */}
      <div
        style={{
          textAlign: 'center',
          marginBottom: '32px',
          transform: `scale(${scale})`,
        }}
      >
        <div
          style={{
            display: 'inline-block',
            backgroundColor: '#ef4444',
            color: '#ffffff',
            padding: '6px 20px',
            borderRadius: '999px',
            fontSize: '22px',
            fontWeight: 800,
            letterSpacing: '2px',
            textTransform: 'uppercase',
            marginBottom: '14px',
            boxShadow: '0 0 25px rgba(239, 68, 68, 0.6)',
          }}
        >
          PARADOKS SEJARAH
        </div>
        <h1
          style={{
            fontSize: '44px',
            fontWeight: 900,
            color: '#ffffff',
            margin: 0,
            lineHeight: 1.15,
            letterSpacing: '-1px',
            textShadow: '0 4px 20px rgba(0, 0, 0, 0.9)',
          }}
        >
          DARI SALAH BACA SELEMBAR MEMO...
        </h1>
      </div>

      {/* Split Comparison Cards (Left vs Right) */}
      <div
        style={{
          width: '100%',
          flex: 1,
          display: 'flex',
          gap: '24px',
          position: 'relative',
        }}
      >
        {/* Left Card: The Minuscule Trigger */}
        <div
          style={{
            flex: 1,
            borderRadius: '20px',
            overflow: 'hidden',
            backgroundColor: '#0f172a',
            border: '2px solid rgba(56, 189, 248, 0.7)',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.6)',
            position: 'relative',
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
                transform: `scale(${1.05 + frame * 0.002})`,
              }}
            />
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(to top, rgba(15, 23, 42, 0.95), transparent 60%)',
              }}
            />
          </div>
          <div
            style={{
              padding: '16px',
              backgroundColor: '#0f172a',
              textAlign: 'center',
            }}
          >
            <span style={{ fontSize: '16px', color: '#38bdf8', fontWeight: 700 }}>
              AWAL MULA SEPELE
            </span>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#ffffff', marginTop: '4px' }}>
              {leftTitle}
            </div>
          </div>
        </div>

        {/* Center Arrow / Transition Pill */}
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: '#ef4444',
            color: '#ffffff',
            fontWeight: 900,
            fontSize: '26px',
            padding: '12px 20px',
            borderRadius: '999px',
            boxShadow: '0 0 30px rgba(239, 68, 68, 0.8)',
            zIndex: 10,
            letterSpacing: '1px',
            border: '3px solid #ffffff',
          }}
        >
          ➔ AKIBATNYA
        </div>

        {/* Right Card: The Massive Disaster */}
        <div
          style={{
            flex: 1,
            borderRadius: '20px',
            overflow: 'hidden',
            backgroundColor: '#0f172a',
            border: '2px solid rgba(239, 68, 68, 0.7)',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.6)',
            position: 'relative',
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
                transform: `scale(${1.05 + frame * 0.002})`,
              }}
            />
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(to top, rgba(15, 23, 42, 0.95), transparent 60%)',
              }}
            />
          </div>
          <div
            style={{
              padding: '16px',
              backgroundColor: '#0f172a',
              textAlign: 'center',
            }}
          >
            <span style={{ fontSize: '16px', color: '#ef4444', fontWeight: 700 }}>
              DAMPAK GLOBAL
            </span>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#ffffff', marginTop: '4px' }}>
              {rightTitle}
            </div>
          </div>
        </div>
      </div>

      {/* Flash overlay on first frames */}
      {flash > 0 && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: '#ffffff',
            opacity: flash,
            pointerEvents: 'none',
          }}
        />
      )}
    </div>
  );
};
