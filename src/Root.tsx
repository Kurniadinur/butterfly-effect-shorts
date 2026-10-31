import React from 'react';
import { Composition } from 'remotion';
import './index.css';
import { ButterflyEffect } from './components/ButterflyEffect';
import { EditorialInfographicJourney } from './components/EditorialInfographicJourney';
import { CURRENT_STORY } from './data/currentStory';

const QABrainWrapper: React.FC = () => (
  <EditorialInfographicJourney
    hookDurationFrames={0}
    outroDurationFrames={0}
    totalDurationFrames={120}
    nodes={[
      {
        step: 1,
        timeOrYear: 'FASE KRITIS • OTAK',
        organTarget: 'brain',
        headline: 'SARAF PUSAT KELEBIHAN BEBAN',
        primaryText: 'KORTEKS SEREBRAL',
        secondaryText: 'Sinyal darurat membanjiri neuron',
        narration: 'Sinyal darurat membanjiri neuron di otak.',
        caption: 'Korteks serebral kebanjiran impuls sinyal darurat.',
        mediaUrl: 'butterfly/organs/brain.png',
        chaosLevel: 85,
        mediaType: 'photo',
        startFrame: 0,
        durationFrames: 120,
      },
    ]}
  />
);

const QAHeartWrapper: React.FC = () => (
  <EditorialInfographicJourney
    hookDurationFrames={0}
    outroDurationFrames={0}
    totalDurationFrames={120}
    nodes={[
      {
        step: 1,
        timeOrYear: 'FASE KRITIS • JANTUNG',
        organTarget: 'heart',
        headline: 'DETAK JANTUNG BERAKSELERASI',
        primaryText: 'SIRKULASI KARDIOVASKULAR',
        secondaryText: 'Tekanan arteri meningkat tajam',
        narration: 'Detak jantung melonjak cepat memompa darah bertekanan tinggi.',
        caption: 'Sirkulasi kardiovaskular berakselerasi menahan stres akut.',
        mediaUrl: 'butterfly/organs/heart.png',
        chaosLevel: 80,
        mediaType: 'photo',
        startFrame: 0,
        durationFrames: 120,
      },
    ]}
  />
);

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="ButterflyEffect-Shorts"
        component={ButterflyEffect}
        durationInFrames={CURRENT_STORY.totalDurationFrames}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          data: CURRENT_STORY,
        }}
      />

      {/* Autonomous QA Visual Testbed: Brain Framing Verification */}
      <Composition
        id="QA-Brain-Framing"
        component={QABrainWrapper}
        durationInFrames={120}
        fps={30}
        width={1080}
        height={1920}
      />

      {/* Autonomous QA Visual Testbed: Heart Surgical Isolation Verification */}
      <Composition
        id="QA-Heart-Isolation"
        component={QAHeartWrapper}
        durationInFrames={120}
        fps={30}
        width={1080}
        height={1920}
      />
    </>
  );
};
