import React, { useMemo } from 'react';
import { Sequence, Audio, staticFile, useCurrentFrame } from 'remotion';
import { ButterflyStoryData } from '../data/types';
import { CURRENT_STORY } from '../data/currentStory';
import { HookScene } from './HookScene';
import { MedicalScannerScene, detectOrganFromText } from './MedicalScannerScene';
import { KineticSubtitle } from './KineticSubtitle';
import { OutroScene } from './OutroScene';
import { FilmEffects } from './effects/FilmEffects';
import { CameraShake } from './effects/CameraShake';
import { CinematicOptics } from './effects/CinematicOptics';
import { AtmosphericBackground } from './AtmosphericBackground';

export interface ButterflyEffectProps {
  data?: ButterflyStoryData;
}

/**
 * Smooth Bioluminescent Scanner Pulse on Scene Transition:
 * Instead of a harsh white camera flash, emits a gentle cyan/medical scanner glow
 * when gliding from one organ/phase to the next.
 */
const MedicalScannerTransition: React.FC<{ cutFrames: number[] }> = ({ cutFrames }) => {
  const frame = useCurrentFrame();
  const activeCut = cutFrames.find((f) => frame >= f && frame < f + 10);
  if (activeCut === undefined) return null;
  const elapsed = frame - activeCut;
  const progress = elapsed / 10;
  const opacity = Math.sin(progress * Math.PI) * 0.22;
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: 'radial-gradient(circle at 50% 45%, rgba(56, 189, 248, 0.55) 0%, transparent 75%)',
        opacity,
        mixBlendMode: 'screen',
        pointerEvents: 'none',
        zIndex: 48,
      }}
    />
  );
};

const SKETCH_FOLEY_SFX: Record<
  string,
  {
    sfx: string;
    volume: number;
    offsetFrames: number;
    durationFrames: number;
    repeatIntervalFrames?: number;
    maxRepeats?: number;
  }
> = {
  'key-lockbox': { sfx: 'butterfly/sfx/lock_click.wav', volume: 0.22, offsetFrames: 14, durationFrames: 12 },
  'maritime-disaster': { sfx: 'butterfly/sfx/morse_code.wav', volume: 0.18, offsetFrames: 18, durationFrames: 33, repeatIntervalFrames: 45, maxRepeats: 3 },
  'courtroom-gavel': { sfx: 'butterfly/sfx/gavel_strike.wav', volume: 0.24, offsetFrames: 15, durationFrames: 16, repeatIntervalFrames: 16, maxRepeats: 3 },
  'memo-investigation': { sfx: 'butterfly/sfx/radar_ping.wav', volume: 0.20, offsetFrames: 12, durationFrames: 25, repeatIntervalFrames: 45, maxRepeats: 2 },
  'bureaucracy-draft': { sfx: 'butterfly/sfx/radar_ping.wav', volume: 0.20, offsetFrames: 12, durationFrames: 25, repeatIntervalFrames: 45, maxRepeats: 2 },
  'forensic-dossier': { sfx: 'butterfly/sfx/radar_ping.wav', volume: 0.20, offsetFrames: 14, durationFrames: 25, repeatIntervalFrames: 45, maxRepeats: 2 },
  'tactical-map': { sfx: 'butterfly/sfx/radar_ping.wav', volume: 0.20, offsetFrames: 16, durationFrames: 25, repeatIntervalFrames: 40, maxRepeats: 3 },
  'radiation-hazard': { sfx: 'butterfly/sfx/geiger_tick.wav', volume: 0.22, offsetFrames: 10, durationFrames: 30, repeatIntervalFrames: 25, maxRepeats: 5 },
  'reactor-meltdown': { sfx: 'butterfly/sfx/geiger_tick.wav', volume: 0.22, offsetFrames: 10, durationFrames: 30, repeatIntervalFrames: 25, maxRepeats: 5 },
  'clock-countdown': { sfx: 'butterfly/sfx/clock_tick.wav', volume: 0.20, offsetFrames: 10, durationFrames: 20, repeatIntervalFrames: 30, maxRepeats: 5 },
  'wall-demolition': { sfx: 'butterfly/sfx/hammer_hit.wav', volume: 0.26, offsetFrames: 14, durationFrames: 18, repeatIntervalFrames: 34, maxRepeats: 4 },
  'gate-breach': { sfx: 'butterfly/sfx/gate_creak.wav', volume: 0.22, offsetFrames: 12, durationFrames: 25, repeatIntervalFrames: 48, maxRepeats: 2 },
  'valve-failure': { sfx: 'butterfly/sfx/steam_hiss.wav', volume: 0.22, offsetFrames: 12, durationFrames: 22, repeatIntervalFrames: 38, maxRepeats: 3 },
  'critical-gauge': { sfx: 'butterfly/sfx/steam_hiss.wav', volume: 0.22, offsetFrames: 12, durationFrames: 22, repeatIntervalFrames: 38, maxRepeats: 3 },
  'telegraph-wire': { sfx: 'butterfly/sfx/morse_code.wav', volume: 0.18, offsetFrames: 15, durationFrames: 33, repeatIntervalFrames: 45, maxRepeats: 3 },
  'press-podium': { sfx: 'butterfly/sfx/radar_ping.wav', volume: 0.20, offsetFrames: 14, durationFrames: 25, repeatIntervalFrames: 36, maxRepeats: 3 },
  'press-question': { sfx: 'butterfly/sfx/radar_ping.wav', volume: 0.20, offsetFrames: 14, durationFrames: 25, repeatIntervalFrames: 36, maxRepeats: 3 },
  'panic-phone': { sfx: 'butterfly/sfx/broadcast_beeps.wav', volume: 0.22, offsetFrames: 12, durationFrames: 25, repeatIntervalFrames: 42, maxRepeats: 3 },
  'domino-collapse': { sfx: 'butterfly/sfx/domino_click.wav', volume: 0.24, offsetFrames: 10, durationFrames: 22 },
  'laboratory-discovery': { sfx: 'butterfly/sfx/beaker_clink.wav', volume: 0.24, offsetFrames: 14, durationFrames: 20, repeatIntervalFrames: 42, maxRepeats: 2 },
  'car-route': { sfx: 'butterfly/sfx/radar_ping.wav', volume: 0.20, offsetFrames: 12, durationFrames: 24 },
  'breaking-news': { sfx: 'butterfly/sfx/broadcast_beeps.wav', volume: 0.22, offsetFrames: 10, durationFrames: 26, repeatIntervalFrames: 45, maxRepeats: 2 },
  'breaking-ticker': { sfx: 'butterfly/sfx/broadcast_beeps.wav', volume: 0.22, offsetFrames: 10, durationFrames: 26, repeatIntervalFrames: 45, maxRepeats: 2 },
  'crowd-protest': { sfx: 'butterfly/sfx/alarm_siren.wav', volume: 0.18, offsetFrames: 10, durationFrames: 36, repeatIntervalFrames: 45, maxRepeats: 2 },
  'soviet-collapse': { sfx: 'butterfly/sfx/alarm_siren.wav', volume: 0.20, offsetFrames: 12, durationFrames: 36, repeatIntervalFrames: 42, maxRepeats: 3 },
};

const ARCHIVAL_FALLBACK_POOL = [
  'butterfly/media/medical_brain_xray.jpg',
  'butterfly/media/medical_heart_xray.jpg',
  'butterfly/media/medical_stomach_xray.jpg',
  'butterfly/media/medical_body_xray.jpg',
];

function resolvePhotoUrl(mediaUrl?: string, step: number = 1, storyMediaUrls: string[] = []): string {
  if (
    mediaUrl &&
    (mediaUrl.endsWith('.jpg') ||
      mediaUrl.endsWith('.png') ||
      mediaUrl.endsWith('.jpeg') ||
      mediaUrl.endsWith('.webp') ||
      mediaUrl.includes('/'))
  ) {
    return mediaUrl;
  }
  if (storyMediaUrls.length > 0) {
    return storyMediaUrls[(step - 1) % storyMediaUrls.length];
  }
  return ARCHIVAL_FALLBACK_POOL[(step - 1) % ARCHIVAL_FALLBACK_POOL.length];
}

export const ButterflyEffect: React.FC<ButterflyEffectProps> = ({ data = CURRENT_STORY }) => {
  const frame = useCurrentFrame();

  // Collect all transition frames
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

  // Extract all valid image URLs belonging strictly to this current story
  const validStoryPhotos = useMemo(() => {
    const list: string[] = [];
    if (data.hook?.rightImage && data.hook.rightImage.includes('.')) list.push(data.hook.rightImage);
    if (data.hook?.leftImage && data.hook.leftImage.includes('.')) list.push(data.hook.leftImage);
    data.nodes?.forEach((n) => {
      if (n.mediaUrl && n.mediaUrl.includes('.') && n.mediaUrl.includes('/')) {
        list.push(n.mediaUrl);
      }
    });
    return Array.from(new Set(list));
  }, [data]);

  // Determine active biological stress level for subtle tremor when critical
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
        backgroundColor: '#02060d',
        overflow: 'hidden',
      }}
    >
      <CameraShake
        cutFrames={cutFrames}
        currentChaosLevel={activeChaosLevel}
        shakeThresholdChaos={data.editorialStyle?.shakeThresholdChaos ?? 72}
        sensitivity={data.editorialStyle?.shakeSensitivity ?? 'subtle'}
      >
        <AtmosphericBackground mood={data.editorialStyle?.mood} />

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

        {/* 2. Fluid 3D Medical X-Ray & Body Scanner Scenes */}
        {data.nodes.map((node, idx) => {
          const finalPhotoUrl = resolvePhotoUrl(node.mediaUrl, node.step, validStoryPhotos);
          const prevNode = idx > 0 ? data.nodes[idx - 1] : null;
          const prevPhotoUrl = prevNode
            ? resolvePhotoUrl(prevNode.mediaUrl, prevNode.step, validStoryPhotos)
            : data.hook.rightImage || data.hook.leftImage || undefined;
          const prevOrgan = prevNode
            ? detectOrganFromText(prevNode.organTarget, prevNode.headline, prevNode.timeOrYear, prevNode.primaryText, prevNode.step).id
            : 'full-body';

          return (
            <Sequence key={node.step} from={node.startFrame} durationInFrames={node.durationFrames}>
              <MedicalScannerScene
                mediaUrl={finalPhotoUrl}
                prevMediaUrl={prevPhotoUrl}
                step={node.step}
                locationTag={node.timeOrYear}
                headline={node.headline}
                primaryText={node.primaryText}
                secondaryText={node.secondaryText}
                organTarget={node.organTarget}
                prevOrganTarget={prevOrgan}
                chaosLevel={node.chaosLevel}
                zoomDirection={
                  node.zoomDirection ||
                  (node.step % 3 === 0 ? 'out' : node.step % 2 === 0 ? 'in' : 'panRight')
                }
                durationFrames={node.durationFrames}
                mood={data.editorialStyle?.mood}
                visualSourceTag={node.visualSource || 'PEMINDAIAN 3D'}
              />
            </Sequence>
          );
        })}

        {/* 3. Medical Summary Outro Card */}
        <Sequence
          from={data.totalDurationFrames - data.outro.durationFrames}
          durationInFrames={data.outro.durationFrames}
        >
          <OutroScene question={data.outro.question} />
        </Sequence>
      </CameraShake>

      {/* 4. Film & Optical Finish */}
      <FilmEffects editorialStyle={data.editorialStyle} />
      <CinematicOptics intensity="standard" />

      {/* 5. Subtle Medical Scanner Radar Ping on Organ Transitions */}
      {cutFrames.map((cutF) => (
        <Sequence key={`sfx-cut-${cutF}`} from={cutF} durationInFrames={20}>
          <Audio src={staticFile('butterfly/sfx/radar_ping.wav')} volume={0.22} />
        </Sequence>
      ))}

      {/* 6. Smooth Bioluminescent Transition Glow */}
      <MedicalScannerTransition cutFrames={cutFrames} />

      {/* 7. Synchronized Floating Kinetic Subtitle (Protected Safe Zone y >= 1200px) */}
      <KineticSubtitle wordTimestamps={data.wordTimestamps} />

      {/* 8. Voice Over Audio Track */}
      {data.audioUrl && (
        <Audio src={staticFile(data.audioUrl)} volume={1.0} />
      )}

      {/* 9. Continuous Ambient Medical Tension Drone */}
      {Array.from({ length: Math.ceil(data.totalDurationFrames / 360) }).map((_, idx) => (
        <Sequence
          key={`sfx-drone-${idx}`}
          from={idx * 360}
          durationInFrames={Math.min(360, data.totalDurationFrames - idx * 360)}
        >
          <Audio src={staticFile('butterfly/sfx/tension_drone.wav')} volume={0.14} />
        </Sequence>
      ))}

      {/* 10. Critical Biological Phase Impact Boom (chaosLevel >= 75) */}
      {data.nodes
        .filter((n) => n.chaosLevel >= 75)
        .map((n) => (
          <Sequence key={`sfx-climax-${n.step}`} from={n.startFrame} durationInFrames={45}>
            <Audio src={staticFile('butterfly/sfx/cinematic_impact.wav')} volume={0.50} />
          </Sequence>
        ))}

      {/* 11. Subtle Action-Matched Medical Telemetry & Organ SFX */}
      {data.nodes.map((node) => {
        if (!node.directorType || !SKETCH_FOLEY_SFX[node.directorType]) return null;
        const foley = SKETCH_FOLEY_SFX[node.directorType];
        const interval = foley.repeatIntervalFrames || 0;
        const maxReps = foley.maxRepeats || 1;
        const effectiveRepeats =
          interval > 0
            ? Math.min(
                maxReps,
                Math.max(1, Math.floor((node.durationFrames - foley.offsetFrames - 6) / interval) + 1)
              )
            : 1;

        return Array.from({ length: effectiveRepeats }).map((_, repIdx) => {
          const fromFrame = node.startFrame + foley.offsetFrames + repIdx * interval;
          if (fromFrame >= node.startFrame + node.durationFrames - 4) return null;
          const volScale = repIdx === 0 ? 1.0 : repIdx === 1 ? 0.92 : 0.85;
          return (
            <Sequence
              key={`sfx-sketch-${node.step}-${repIdx}`}
              from={fromFrame}
              durationInFrames={foley.durationFrames}
            >
              <Audio src={staticFile(foley.sfx)} volume={foley.volume * volScale} />
            </Sequence>
          );
        });
      })}
    </div>
  );
};
