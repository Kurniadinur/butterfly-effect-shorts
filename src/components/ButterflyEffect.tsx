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

  const storyId = data.id;
  const editorialMood = data.editorialStyle?.mood;

  // AI-Driven Dynamic Medical SFX Soundscape (Heartbeat, Macro Whoosh, Telemetry Pulse, MRI Sweep)
  const medicalSfxEvents = useMemo(() => {
    const events: Array<{ type: 'whoosh' | 'heartbeat' | 'warning' | 'mri'; frame: number; volume: number }> = [];

    // Hook to Body Journey transition whoosh
    events.push({
      type: 'whoosh',
      frame: Math.max(0, data.hook.durationFrames - 12),
      volume: 0.28,
    });

    // Organ transitions, dynamic heartbeats & crisis alerts from AI Story Nodes
    let prevOrgan = '';
    (data.nodes || []).forEach((node) => {
      // Organ transition macro whoosh
      if (node.organTarget && node.organTarget !== prevOrgan && node.startFrame > data.hook.durationFrames) {
        events.push({
          type: 'whoosh',
          frame: Math.max(0, node.startFrame - 8),
          volume: 0.20,
        });
        prevOrgan = node.organTarget;
      }

      // Crisis warning pulse for high-chaos moments (chaos >= 75)
      if ((node.chaosLevel || 0) >= 75) {
        events.push({
          type: 'warning',
          frame: node.startFrame + 18,
          volume: 0.18,
        });
      }

      // Dynamic Heartbeat pulses synchronized to chaos level (BPM 72 -> 138)
      const chaos = node.chaosLevel || 30;
      if (chaos >= 35) {
        const frameInterval = Math.round(26 - ((chaos - 35) / 65) * 13);
        const beatVol = 0.10 + ((chaos - 35) / 65) * 0.18;
        for (let f = node.startFrame; f < node.startFrame + node.durationFrames - 8; f += Math.max(12, frameInterval)) {
          events.push({
            type: 'heartbeat',
            frame: f,
            volume: beatVol,
          });
        }
      }
    });

    // Periodic subtle MRI scan sweeps (every 160 frames, matching visual scanline)
    for (let f = data.hook.durationFrames + 20; f < data.totalDurationFrames - data.outro.durationFrames; f += 160) {
      events.push({
        type: 'mri',
        frame: f,
        volume: 0.08,
      });
    }

    return events;
  }, [data]);

  return (
    <div
      style={{
        position: 'relative',
        width: '1080px',
        height: '1920px',
        backgroundColor: '#090a0c',
        overflow: 'hidden',
      }}
    >
      <CameraShake
        cutFrames={[]}
        currentChaosLevel={activeChaosLevel}
        shakeThresholdChaos={data.editorialStyle?.shakeThresholdChaos ?? 78}
        sensitivity="subtle"
      >
        {/* 1. Dynamic Multi-Style Hook Scene with Escalating Multiplier / Action Animation */}
        <Sequence from={0} durationInFrames={data.hook.durationFrames}>
          <HookScene
            storyId={storyId}
            editorialMood={editorialMood}
            hookStyle={data.hook.hookStyle}
            archetype={data.hook.archetype}
            headline={data.hook.headline}
            kicker={data.hook.kicker}
            narration={data.hook.narration}
            leftTitle={data.hook.leftTitle}
            rightTitle={data.hook.rightTitle}
            leftBadge={data.hook.leftBadge}
            rightBadge={data.hook.rightBadge}
            leftPrimaryText={data.hook.leftPrimaryText}
            leftStampText={data.hook.leftStampText}
            leftImage={data.hook.leftImage || data.nodes?.[0]?.mediaUrl}
            rightImage={data.hook.rightImage || data.nodes?.[0]?.mediaUrl}
            hookAnimationType={data.hook.hookAnimationType}
            hookMode={data.hook.hookMode}
            hookConditionLabel={data.hook.hookConditionLabel}
            hookSymptoms={data.hook.hookSymptoms}
            hookItemEmoji={data.hook.hookItemEmoji}
            hookItemLabel={data.hook.hookItemLabel}
            hookTargetCount={data.hook.hookTargetCount}
            hookUnitLabel={data.hook.hookUnitLabel}
            characterActionPng={data.hook.characterActionPng}
            targetOrganPng={data.hook.targetOrganPng}
            meterLabel={data.hook.meterLabel}
            meterStartText={data.hook.meterStartText}
            meterEndText={data.hook.meterEndText}
            curiosityClue={data.hook.curiosityClue}
            hookMysteryQuestion={data.hook.hookMysteryQuestion}
            durationFrames={data.hook.durationFrames}
          />
        </Sequence>

        {/* 2. Continuous Unbroken 3D Volumetric Anatomical Journey (Multi-Theme Editorial UI) */}
        <Sequence
          from={data.hook.durationFrames}
          durationInFrames={Math.max(1, data.totalDurationFrames - data.hook.durationFrames)}
        >
          <ContinuousBodyJourney
            storyId={storyId}
            editorialMood={editorialMood}
            nodes={data.nodes}
            wordTimestamps={data.wordTimestamps}
            hookDurationFrames={data.hook.durationFrames}
            outroDurationFrames={data.outro.durationFrames}
            totalDurationFrames={data.totalDurationFrames}
            baseBodyMediaUrl="butterfly/media/medical_body_xray.jpg"
          />
        </Sequence>

        {/* 3. Editorial Outro Card */}
        <Sequence
          from={data.totalDurationFrames - data.outro.durationFrames}
          durationInFrames={data.outro.durationFrames}
        >
          <OutroScene
            question={data.outro.question}
            storyId={storyId}
            editorialMood={editorialMood}
            storyTitle={data.title || data.hook?.headline}
          />
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

      {/* 7. AI-Driven Dynamic Medical SFX (Heartbeat, Macro Whoosh, ICU Warning, MRI Scan) */}
      {medicalSfxEvents.map((ev, i) => {
        if (ev.type === 'whoosh') {
          return (
            <Sequence key={'sfx-whoosh-' + i} from={ev.frame} durationInFrames={25}>
              <Audio src={staticFile('butterfly/sfx/macro_whoosh.wav')} volume={ev.volume} />
            </Sequence>
          );
        }
        if (ev.type === 'warning') {
          return (
            <Sequence key={'sfx-warn-' + i} from={ev.frame} durationInFrames={18}>
              <Audio src={staticFile('butterfly/sfx/medical_warning_pulse.wav')} volume={ev.volume} />
            </Sequence>
          );
        }
        if (ev.type === 'heartbeat') {
          return (
            <Sequence key={'sfx-hb-' + i} from={ev.frame} durationInFrames={20}>
              <Audio src={staticFile('butterfly/sfx/heartbeat_pulse.wav')} volume={ev.volume} />
            </Sequence>
          );
        }
        if (ev.type === 'mri') {
          return (
            <Sequence key={'sfx-mri-' + i} from={ev.frame} durationInFrames={36}>
              <Audio src={staticFile('butterfly/sfx/mri_scan_sweep.wav')} volume={ev.volume} />
            </Sequence>
          );
        }
        return null;
      })}
    </div>
  );
};
