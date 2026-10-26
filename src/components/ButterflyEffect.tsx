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
import { CinematicOptics } from './effects/CinematicOptics';
import { AtmosphericBackground } from './AtmosphericBackground';

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

/**
 * AI Audio Supervisor Map:
 * Maps each forensic vector sketch archetype to its subtle, non-distracting
 * tactile Foley sound effect with intelligent rhythmic cadence (repeated hits/rings).
 * Volumes strictly clamped between 0.20 and 0.32 so speech (volume 1.0) remains 100% crystal clear.
 */
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
  'key-lockbox': { sfx: 'butterfly/sfx/lock_click.wav', volume: 0.28, offsetFrames: 14, durationFrames: 12 },
  'maritime-disaster': { sfx: 'butterfly/sfx/morse_code.wav', volume: 0.20, offsetFrames: 18, durationFrames: 33, repeatIntervalFrames: 45, maxRepeats: 3 },
  'courtroom-gavel': { sfx: 'butterfly/sfx/gavel_strike.wav', volume: 0.30, offsetFrames: 15, durationFrames: 16, repeatIntervalFrames: 16, maxRepeats: 3 },
  'memo-investigation': { sfx: 'butterfly/sfx/paper_stamp.wav', volume: 0.26, offsetFrames: 12, durationFrames: 12, repeatIntervalFrames: 45, maxRepeats: 2 },
  'bureaucracy-draft': { sfx: 'butterfly/sfx/paper_stamp.wav', volume: 0.24, offsetFrames: 12, durationFrames: 12, repeatIntervalFrames: 45, maxRepeats: 2 },
  'forensic-dossier': { sfx: 'butterfly/sfx/paper_stamp.wav', volume: 0.26, offsetFrames: 14, durationFrames: 12, repeatIntervalFrames: 45, maxRepeats: 2 },
  'tactical-map': { sfx: 'butterfly/sfx/radar_ping.wav', volume: 0.20, offsetFrames: 16, durationFrames: 25, repeatIntervalFrames: 40, maxRepeats: 3 },
  'radiation-hazard': { sfx: 'butterfly/sfx/geiger_tick.wav', volume: 0.24, offsetFrames: 10, durationFrames: 30, repeatIntervalFrames: 25, maxRepeats: 5 },
  'reactor-meltdown': { sfx: 'butterfly/sfx/geiger_tick.wav', volume: 0.24, offsetFrames: 10, durationFrames: 30, repeatIntervalFrames: 25, maxRepeats: 5 },
  'clock-countdown': { sfx: 'butterfly/sfx/clock_tick.wav', volume: 0.20, offsetFrames: 10, durationFrames: 20, repeatIntervalFrames: 30, maxRepeats: 5 },
  'wall-demolition': { sfx: 'butterfly/sfx/hammer_hit.wav', volume: 0.32, offsetFrames: 14, durationFrames: 18, repeatIntervalFrames: 34, maxRepeats: 4 },
  'gate-breach': { sfx: 'butterfly/sfx/gate_creak.wav', volume: 0.26, offsetFrames: 12, durationFrames: 25, repeatIntervalFrames: 48, maxRepeats: 2 },
  'valve-failure': { sfx: 'butterfly/sfx/steam_hiss.wav', volume: 0.24, offsetFrames: 12, durationFrames: 22, repeatIntervalFrames: 38, maxRepeats: 3 },
  'critical-gauge': { sfx: 'butterfly/sfx/steam_hiss.wav', volume: 0.22, offsetFrames: 12, durationFrames: 22, repeatIntervalFrames: 38, maxRepeats: 3 },
  'telegraph-wire': { sfx: 'butterfly/sfx/morse_code.wav', volume: 0.20, offsetFrames: 15, durationFrames: 33, repeatIntervalFrames: 45, maxRepeats: 3 },
  'press-podium': { sfx: 'butterfly/sfx/camera_blitz.wav', volume: 0.28, offsetFrames: 14, durationFrames: 15, repeatIntervalFrames: 28, maxRepeats: 4 },
  'press-question': { sfx: 'butterfly/sfx/camera_blitz.wav', volume: 0.28, offsetFrames: 14, durationFrames: 15, repeatIntervalFrames: 26, maxRepeats: 4 },
  'panic-phone': { sfx: 'butterfly/sfx/phone_ring.wav', volume: 0.28, offsetFrames: 12, durationFrames: 25, repeatIntervalFrames: 42, maxRepeats: 3 },
  'domino-collapse': { sfx: 'butterfly/sfx/domino_click.wav', volume: 0.28, offsetFrames: 10, durationFrames: 22 },
  'laboratory-discovery': { sfx: 'butterfly/sfx/beaker_clink.wav', volume: 0.25, offsetFrames: 14, durationFrames: 20, repeatIntervalFrames: 42, maxRepeats: 2 },
  'car-route': { sfx: 'butterfly/sfx/car_skid.wav', volume: 0.26, offsetFrames: 12, durationFrames: 24 },
  'breaking-news': { sfx: 'butterfly/sfx/broadcast_beeps.wav', volume: 0.24, offsetFrames: 10, durationFrames: 26, repeatIntervalFrames: 45, maxRepeats: 2 },
  'breaking-ticker': { sfx: 'butterfly/sfx/broadcast_beeps.wav', volume: 0.24, offsetFrames: 10, durationFrames: 26, repeatIntervalFrames: 45, maxRepeats: 2 },
  'crowd-protest': { sfx: 'butterfly/sfx/crowd_cheer.wav', volume: 0.24, offsetFrames: 10, durationFrames: 42, repeatIntervalFrames: 45, maxRepeats: 3 },
  'soviet-collapse': { sfx: 'butterfly/sfx/alarm_siren.wav', volume: 0.20, offsetFrames: 12, durationFrames: 36, repeatIntervalFrames: 42, maxRepeats: 3 },
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
        {/* 0. Permanent Investigation Canvas (Rich Desk Surface, Blueprint Grid, Margin Ticks, Lamp Pool) */}
        <AtmosphericBackground mood={data.editorialStyle?.mood} />

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
                mood={data.editorialStyle?.mood}
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
      {/* 4b. Cinematic Optics (35mm Gate Weave, Optical Halation, Anamorphic Falloff) */}
      <CinematicOptics intensity="standard" />

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

      {/* 9. Continuous Ambient Tension Drone (Deep Cinematic Bed, Volume 0.14) */}
      {Array.from({ length: Math.ceil(data.totalDurationFrames / 360) }).map((_, idx) => (
        <Sequence
          key={`sfx-drone-${idx}`}
          from={idx * 360}
          durationInFrames={Math.min(360, data.totalDurationFrames - idx * 360)}
        >
          <Audio src={staticFile('butterfly/sfx/tension_drone.wav')} volume={0.14} />
        </Sequence>
      ))}

      {/* 10. Climax Sub-Bass Impact Boom (Triggered automatically when chaosLevel >= 75) */}
      {data.nodes
        .filter((n) => n.chaosLevel >= 75)
        .map((n) => (
          <Sequence key={`sfx-climax-${n.step}`} from={n.startFrame} durationInFrames={45}>
            <Audio src={staticFile('butterfly/sfx/cinematic_impact.wav')} volume={0.55} />
          </Sequence>
        ))}

      {/* 11. Subtle Action-Matched Sketch Foley SFX (Non-Distracting, Volume 0.20 - 0.30) */}
      {/* Hook Archetype Foley */}
      {data.hook.archetype && SKETCH_FOLEY_SFX[data.hook.archetype] && (
        <Sequence
          key="sfx-hook-foley"
          from={SKETCH_FOLEY_SFX[data.hook.archetype].offsetFrames}
          durationInFrames={SKETCH_FOLEY_SFX[data.hook.archetype].durationFrames}
        >
          <Audio
            src={staticFile(SKETCH_FOLEY_SFX[data.hook.archetype].sfx)}
            volume={SKETCH_FOLEY_SFX[data.hook.archetype].volume}
          />
        </Sequence>
      )}

      {/* Nodes Forensic Sketch Foley (Intelligent Rhythmic Cadence Engine) */}
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
          // Subtle natural dynamic decay on secondary strikes (0.92x, 0.85x)
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
