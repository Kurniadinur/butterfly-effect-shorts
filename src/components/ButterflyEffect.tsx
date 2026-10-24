import React, { useMemo } from 'react';
import { Sequence, Audio, staticFile, useCurrentFrame } from 'remotion';
import { ButterflyStoryData } from '../data/types';
import { CURRENT_STORY } from '../data/currentStory';
import { HookScene } from './HookScene';
import { DocumentaryScene } from './DocumentaryScene';
import { DirectorGraphicScene } from './DirectorGraphicScene';
import { KineticSubtitle } from './KineticSubtitle';
import { OutroScene } from './OutroScene';
import { FilmEffects } from './effects/FilmEffects';
import { CameraShake } from './effects/CameraShake';

export interface ButterflyEffectProps {
  data?: ButterflyStoryData;
}

/**
 * Editorial shutter transition flash:
 * Produces a subtle, crisp 3-frame film-gate flash when a new scene cuts,
 * synchronized perfectly with the mechanical camera shutter click.
 */
const TransitionShutterFlash: React.FC<{ cutFrames: number[] }> = ({ cutFrames }) => {
  const frame = useCurrentFrame();
  const activeCut = cutFrames.find((f) => frame >= f && frame < f + 3);
  if (activeCut === undefined) return null;
  const elapsed = frame - activeCut;
  const opacity = elapsed === 0 ? 0.32 : elapsed === 1 ? 0.12 : 0.03;
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        backgroundColor: '#ffffff',
        opacity,
        mixBlendMode: 'screen',
        pointerEvents: 'none',
        zIndex: 48,
      }}
    />
  );
};

export const ButterflyEffect: React.FC<ButterflyEffectProps> = ({ data = CURRENT_STORY }) => {
  const frame = useCurrentFrame();

  // Collect all cut frames for click SFX, shutter flashes, and camera cut recoil
  const cutFrames = useMemo(() => {
    const cuts = [data.hook.durationFrames];
    data.nodes.forEach((n) => {
      if (n.startFrame > 0 && !cuts.includes(n.startFrame)) {
        cuts.push(n.startFrame);
      }
    });
    const outroStart = data.totalDurationFrames - data.outro.durationFrames;
    if (!cuts.includes(outroStart)) {
      cuts.push(outroStart);
    }
    return cuts;
  }, [data]);

  // Determine active chaos level for data-driven camera micro-shake
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
        backgroundColor: '#000000',
        overflow: 'hidden',
      }}
    >
      {/* Visual Canvas wrapped in Data-Driven Dynamic Camera Shake */}
      <CameraShake
        cutFrames={cutFrames}
        currentChaosLevel={activeChaosLevel}
        shakeThresholdChaos={data.editorialStyle?.shakeThresholdChaos ?? 65}
        sensitivity={data.editorialStyle?.shakeSensitivity ?? 'moderate'}
      >
        {/* 1. Cinematic Hook (Frames 0 -> hook.durationFrames) */}
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
      </CameraShake>

      {/* 4. Film Effects Overlay (35mm Grain, Light Leak, Vignette, Mood Tint) */}
      <FilmEffects editorialStyle={data.editorialStyle} />

      {/* 5. Creator Transition Click Sound Effects (Crisp Camera Shutter Snap on Every Cut) */}
      {cutFrames.map((cutF) => (
        <Sequence key={`sfx-cut-${cutF}`} from={cutF} durationInFrames={8}>
          <Audio src={staticFile('butterfly/sfx/camera_click.wav')} volume={0.65} />
        </Sequence>
      ))}

      {/* 6. Editorial Shutter Transition Flash Overlay */}
      <TransitionShutterFlash cutFrames={cutFrames} />

      {/* 7. Synchronized Floating Kinetic Subtitle (Stationary Phrase Paging) */}
      <KineticSubtitle wordTimestamps={data.wordTimestamps} />

      {/* 8. Voice Over Audio Track (127.96s) */}
      {data.audioUrl && (
        <Audio src={staticFile(data.audioUrl)} volume={1.0} />
      )}
    </div>
  );
};
