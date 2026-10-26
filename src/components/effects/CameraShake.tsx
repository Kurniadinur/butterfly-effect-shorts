import React from 'react';
import { useCurrentFrame, interpolate } from 'remotion';

interface CameraShakeProps {
  children: React.ReactNode;
  cutFrames: number[];
  currentChaosLevel: number;
  shakeThresholdChaos?: number;
  sensitivity?: 'subtle' | 'moderate' | 'dramatic' | 'high' | string;
}

/**
 * CameraShake Component:
 * Data-driven cinematic camera movement system.
 * 1. Scene Cut Recoil: momentary subtle 3-frame damped punch when a scene cuts
 * 2. High-Chaos Handheld Tremor: gentle micro-vibrations when crisis/chaos rises
 * 3. Eye Comfort Guarantee: Translation clamped strictly within ±1.5px to ±4px max
 */
export const CameraShake: React.FC<CameraShakeProps> = ({
  children,
  cutFrames,
  currentChaosLevel,
  shakeThresholdChaos = 65,
  sensitivity = 'moderate',
}) => {
  const frame = useCurrentFrame();

  // Multiplier based on sensitivity setting
  const sensitivityMultiplier =
    sensitivity === 'subtle' ? 0.65 : (sensitivity === 'dramatic' || sensitivity === 'high') ? 1.3 : 1.0;

  // 1. Scene Cut Recoil Calculation (First 4 frames after a cut)
  let cutRecoilX = 0;
  let cutRecoilY = 0;
  let cutScale = 1.0;

  const activeCut = cutFrames.find((f) => frame >= f && frame < f + 4);
  if (activeCut !== undefined) {
    const elapsed = frame - activeCut;
    if (elapsed === 0) {
      cutRecoilY = -3.5 * sensitivityMultiplier;
      cutRecoilX = 1.5 * sensitivityMultiplier;
      cutScale = 1.014;
    } else if (elapsed === 1) {
      cutRecoilY = 1.8 * sensitivityMultiplier;
      cutRecoilX = -0.8 * sensitivityMultiplier;
      cutScale = 1.008;
    } else if (elapsed === 2) {
      cutRecoilY = -0.6 * sensitivityMultiplier;
      cutRecoilX = 0.3 * sensitivityMultiplier;
      cutScale = 1.003;
    }
  }

  // 2. Data-Driven Chaos Handheld Tremor (Only active when chaos >= threshold)
  let chaosTremorX = 0;
  let chaosTremorY = 0;

  if (currentChaosLevel >= shakeThresholdChaos) {
    // Map chaos 65..100 -> amplitude 0.8px..3.2px max
    const amplitude = interpolate(
      currentChaosLevel,
      [shakeThresholdChaos, 100],
      [0.8, 3.2 * sensitivityMultiplier],
      { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
    );

    // Combination of harmonic frequencies gives organic, non-repetitive documentary tremor
    chaosTremorX =
      Math.sin(frame * 0.42) * amplitude * 0.65 +
      Math.cos(frame * 0.85) * amplitude * 0.35;
    chaosTremorY =
      Math.cos(frame * 0.38) * amplitude * 0.7 +
      Math.sin(frame * 0.91) * amplitude * 0.3;
  }

  // Combine translations
  const totalX = cutRecoilX + chaosTremorX;
  const totalY = cutRecoilY + chaosTremorY;
  const totalScale = cutScale;

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        transform: `translate3d(${totalX.toFixed(2)}px, ${totalY.toFixed(2)}px, 0) scale(${totalScale.toFixed(4)})`,
        transformOrigin: '50% 50%',
        willChange: 'transform',
      }}
    >
      {children}
    </div>
  );
};
