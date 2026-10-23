import React from 'react';
import { Img, useCurrentFrame, staticFile, interpolate } from 'remotion';

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

  // Switch between left (trigger) and right (climax) or show split screen
  const isSecondHalf = frame > 110;

  const currentImage = isSecondHalf ? rightImage : leftImage;
  const currentBadge = isSecondHalf ? 'AKIBAT GLOBAL' : 'AWAL MULA SEPELE';
  const currentTitle = isSecondHalf ? rightTitle : leftTitle;

  const scale = interpolate(frame % 110, [0, 110], [1.0, 1.1], { extrapolateRight: 'clamp' });

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        backgroundColor: '#000000',
        overflow: 'hidden',
      }}
    >
      {/* Full Bleed Image with Ken Burns */}
      <div
        style={{
          width: '100%',
          height: '100%',
          transform: `scale(${scale})`,
        }}
      >
        <Img
          src={staticFile(currentImage)}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center 25%',
            filter: 'contrast(1.1) brightness(0.9)',
          }}
        />
      </div>

      {/* Heavy Vignette & Bottom Gradient for Subtitles */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse at center, transparent 30%, rgba(0, 0, 0, 0.75) 100%)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: '500px',
          background: 'linear-gradient(to top, rgba(0, 0, 0, 0.95) 0%, transparent 100%)',
        }}
      />

      {/* Top Editorial Headline (Like a Netflix / Vox Special) */}
      <div
        style={{
          position: 'absolute',
          top: '90px',
          left: '50px',
          right: '50px',
          zIndex: 30,
        }}
      >
        <div
          style={{
            display: 'inline-block',
            backgroundColor: isSecondHalf ? '#dc2626' : 'rgba(255, 255, 255, 0.15)',
            color: '#ffffff',
            padding: '5px 14px',
            borderRadius: '4px',
            fontSize: '15px',
            fontWeight: 800,
            letterSpacing: '2px',
            textTransform: 'uppercase',
            marginBottom: '10px',
            backdropFilter: 'blur(6px)',
          }}
        >
          {currentBadge}
        </div>
        <h1
          style={{
            fontSize: '44px',
            fontWeight: 900,
            color: '#ffffff',
            margin: 0,
            lineHeight: 1.15,
            letterSpacing: '-1px',
            fontFamily: "'Montserrat', sans-serif",
            textShadow: '0 3px 15px rgba(0, 0, 0, 0.95)',
          }}
        >
          {currentTitle}
        </h1>
      </div>
    </div>
  );
};
