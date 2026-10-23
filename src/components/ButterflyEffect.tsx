import React from 'react';
import { Sequence, Audio, staticFile, useCurrentFrame } from 'remotion';
import { ButterflyStoryData } from '../data/types';
import { BERLIN_WALL_STORY } from '../data/berlinWallStory';
import { AtmosphericBackground } from './AtmosphericBackground';
import { ChaosMeter } from './ChaosMeter';
import { HookScene } from './HookScene';
import { EvidenceCard } from './EvidenceCard';
import { KineticSubtitle } from './KineticSubtitle';
import { OutroScene } from './OutroScene';

export interface ButterflyEffectProps {
  data?: ButterflyStoryData;
}

export const ButterflyEffect: React.FC<ButterflyEffectProps> = ({ data = BERLIN_WALL_STORY }) => {
  const frame = useCurrentFrame();

  // Find active node or default to hook/outro
  let currentChaosLevel = 10;
  let currentTimeOrYear = 'AWAL MULA';

  if (frame < data.hook.durationFrames) {
    currentChaosLevel = 15;
    currentTimeOrYear = 'PARADOKS';
  } else {
    const activeNode = data.nodes.find(
      (n) => frame >= n.startFrame && frame < n.startFrame + n.durationFrames
    );
    if (activeNode) {
      currentChaosLevel = activeNode.chaosLevel;
      currentTimeOrYear = activeNode.timeOrYear;
    } else {
      currentChaosLevel = 100;
      currentTimeOrYear = 'AKHIR CERITA';
    }
  }

  const outroStartFrame =
    data.nodes.length > 0
      ? data.nodes[data.nodes.length - 1].startFrame +
        data.nodes[data.nodes.length - 1].durationFrames
      : data.hook.durationFrames;

  return (
    <div
      style={{
        position: 'relative',
        width: '1080px',
        height: '1920px',
        backgroundColor: '#05070f',
        overflow: 'hidden',
      }}
    >
      {/* 1. Living Atmospheric Background */}
      <AtmosphericBackground />

      {/* 2. Top HUD Chaos Meter */}
      <ChaosMeter chaosLevel={currentChaosLevel} timeOrYear={currentTimeOrYear} />

      {/* 3. The Hook Scene (0 - Hook Duration) */}
      <Sequence from={0} durationInFrames={data.hook.durationFrames}>
        <HookScene
          leftTitle={data.hook.leftTitle}
          rightTitle={data.hook.rightTitle}
          leftImage={data.hook.leftImage}
          rightImage={data.hook.rightImage}
        />
      </Sequence>

      {/* 4. Sequential Domino Evidence Cards */}
      {data.nodes.map((node, index) => (
        <Sequence
          key={`node-${node.step}`}
          from={node.startFrame}
          durationInFrames={node.durationFrames}
        >
          <EvidenceCard
            node={node}
            stepNumber={node.step}
            totalSteps={data.nodes.length}
          />
        </Sequence>
      ))}

      {/* 5. Outro Scene */}
      <Sequence from={outroStartFrame} durationInFrames={data.outro.durationFrames}>
        <OutroScene question={data.outro.question} />
      </Sequence>

      {/* 6. Kinetic Subtitle (Global, follows audio word-by-word) */}
      <KineticSubtitle wordTimestamps={data.wordTimestamps} />

      {/* 7. Voice Over Audio Track */}
      {data.audioUrl && (
        <Audio src={staticFile(data.audioUrl)} volume={1.0} />
      )}
    </div>
  );
};
