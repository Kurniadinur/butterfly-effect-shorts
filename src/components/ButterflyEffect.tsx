import React from 'react';
import { Sequence, Audio, staticFile } from 'remotion';
import { ButterflyStoryData } from '../data/types';
import { CURRENT_STORY } from '../data/currentStory';
import { HookScene } from './HookScene';
import { DocumentaryScene } from './DocumentaryScene';
import { DirectorGraphicScene } from './DirectorGraphicScene';
import { KineticSubtitle } from './KineticSubtitle';
import { OutroScene } from './OutroScene';

export interface ButterflyEffectProps {
  data?: ButterflyStoryData;
}

export const ButterflyEffect: React.FC<ButterflyEffectProps> = ({ data = CURRENT_STORY }) => {
  return (
    <div
      style={{
        position: 'relative',
        width: '1080px',
        height: '1920px',
        backgroundColor: '#000000',
        overflow: 'hidden',
      }}
    >
      {/* 1. Cinematic Hook (Frames 0 -> hook.durationFrames) */}
      <Sequence from={0} durationInFrames={data.hook.durationFrames}>
        <HookScene
          leftTitle={data.hook.leftTitle}
          rightTitle={data.hook.rightTitle}
          leftBadge={data.hook.leftBadge}
          rightBadge={data.hook.rightBadge}
          leftPrimaryText={data.hook.leftPrimaryText}
          leftStampText={data.hook.leftStampText}
          leftImage={data.hook.leftImage}
          rightImage={data.hook.rightImage}
          durationFrames={data.hook.durationFrames}
        />
      </Sequence>

      {/* 2. Dynamic Director-Orchestrated Scenes */}
      {data.nodes.map((node) => {
        if (node.mediaType === 'graphic' && node.directorType) {
          return (
            <Sequence key={node.step} from={node.startFrame} durationInFrames={node.durationFrames}>
              <DirectorGraphicScene
                type={node.directorType}
                title={node.headline}
                subtitle={node.caption}
                locationTag={node.timeOrYear}
                durationFrames={node.durationFrames}
                primaryText={node.primaryText}
                secondaryText={node.secondaryText}
                stampText={node.stampText}
                quoteText={node.quoteText}
                metricLabel={node.metricLabel}
                metricValue={node.metricValue}
                accentColor={node.accentColor}
              />
            </Sequence>
          );
        }

        return (
          <Sequence key={node.step} from={node.startFrame} durationInFrames={node.durationFrames}>
            <DocumentaryScene
              mediaUrl={node.mediaUrl}
              locationTag={node.timeOrYear}
              headline={node.headline}
              zoomDirection={
                node.zoomDirection ||
                (node.step % 3 === 0 ? 'out' : node.step % 2 === 0 ? 'in' : 'panRight')
              }
              durationFrames={node.durationFrames}
            />
          </Sequence>
        );
      })}

      {/* 3. Outro Debate Card */}
      <Sequence
        from={data.totalDurationFrames - data.outro.durationFrames}
        durationInFrames={data.outro.durationFrames}
      >
        <OutroScene question={data.outro.question} />
      </Sequence>

      {/* 4. Synchronized Floating Kinetic Subtitle (Stationary Phrase Paging) */}
      <KineticSubtitle wordTimestamps={data.wordTimestamps} />

      {/* 5. Voice Over Audio Track (127.96s) */}
      {data.audioUrl && (
        <Audio src={staticFile(data.audioUrl)} volume={1.0} />
      )}
    </div>
  );
};
