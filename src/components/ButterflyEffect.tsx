import React, { useMemo } from 'react';
import { Sequence, Audio, staticFile, useCurrentFrame } from 'remotion';
import { ButterflyStoryData } from '../data/types';
import { CURRENT_STORY } from '../data/currentStory';
import { HookScene } from './HookScene';
import { ContinuousBodyJourney } from './ContinuousBodyJourney';
import { KineticSubtitle } from './KineticSubtitle';
import { OutroScene } from './OutroScene';
import { CameraShake } from './effects/CameraShake';

export interface ButterflyEffectProps {
  data?: ButterflyStoryData;
}

export const ButterflyEffect: React.FC<ButterflyEffectProps> = ({ data = CURRENT_STORY }) => {
  const frame = useCurrentFrame();

  // Determine active biological stress level for subtle tremor only when critical (Zero cut recoil!)
  const activeChaosLevel = useMemo(() => {
    if (frame < data.hook.durationFrames) return 15;
    const activeNode = data.nodes.find(
      (n) => frame >= n.startFrame && frame < n.startFrame + n.durationFrames
    );
    if (activeNode) return activeNode.chaosLevel;
    return 25;
  }, [frame, data]);

  return (
    <div
      style={{
        position: 'relative',
        width: '1080px',
        height: '1920px',
        backgroundColor: '#050b14',
        overflow: 'hidden',
      }}
    >
      <CameraShake
        cutFrames={[]}
        currentChaosLevel={activeChaosLevel}
        shakeThresholdChaos={data.editorialStyle?.shakeThresholdChaos ?? 78}
        sensitivity="subtle"
      >
        {/* 1. 3D Medical X-Ray Hook Scene */}
        <Sequence from={0} durationInFrames={data.hook.durationFrames}>
          <HookScene
            hookStyle={data.hook.hookStyle}
            archetype={data.hook.archetype}
            headline={data.hook.headline}
            kicker={data.hook.kicker}
            leftTitle={data.hook.leftTitle}
            rightTitle={data.hook.rightTitle}
            leftBadge={data.hook.leftBadge}
            rightBadge={data.hook.rightBadge}
            leftPrimaryText={data.hook.leftPrimaryText}
            leftStampText={data.hook.leftStampText}
            leftImage={data.hook.leftImage || data.nodes?.[0]?.mediaUrl}
            rightImage={data.hook.rightImage || data.nodes?.[0]?.mediaUrl}
            durationFrames={data.hook.durationFrames}
          />
        </Sequence>

        {/* 2. Continuous Unbroken 3D Volumetric Anatomical Journey (Zero Scene Cuts & Zero Flashes!) */}
        <Sequence
          from={data.hook.durationFrames}
          durationInFrames={Math.max(1, data.totalDurationFrames - data.hook.durationFrames - data.outro.durationFrames)}
        >
          <ContinuousBodyJourney
            nodes={data.nodes}
            wordTimestamps={data.wordTimestamps}
            hookDurationFrames={data.hook.durationFrames}
            outroDurationFrames={data.outro.durationFrames}
            totalDurationFrames={data.totalDurationFrames}
            baseBodyMediaUrl="butterfly/media/medical_body_xray.jpg"
          />
        </Sequence>

        {/* 3. Medical Summary Outro Card */}
        <Sequence
          from={data.totalDurationFrames - data.outro.durationFrames}
          durationInFrames={data.outro.durationFrames}
        >
          <OutroScene question={data.outro.question} />
        </Sequence>
      </CameraShake>

      {/* 4. Synchronized Floating Kinetic Subtitle (Protected Safe Zone y >= 1200px) */}
      <KineticSubtitle wordTimestamps={data.wordTimestamps} />

      {/* 5. Voice Over Audio Track */}
      {data.audioUrl && (
        <Audio src={staticFile(data.audioUrl)} volume={1.0} />
      )}

      {/* 6. Continuous Ambient Medical Tension Drone */}
      {Array.from({ length: Math.ceil(data.totalDurationFrames / 360) }).map((_, idx) => (
        <Sequence
          key={`sfx-drone-${idx}`}
          from={idx * 360}
          durationInFrames={Math.min(360, data.totalDurationFrames - idx * 360)}
        >
          <Audio src={staticFile('butterfly/sfx/tension_drone.wav')} volume={0.14} />
        </Sequence>
      ))}
    </div>
  );
};
