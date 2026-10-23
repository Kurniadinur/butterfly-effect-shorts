import React from 'react';
import { Composition } from 'remotion';
import './index.css';
import { ButterflyEffect } from './components/ButterflyEffect';
import { CURRENT_STORY } from './data/currentStory';

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
    </>
  );
};
