import React from 'react';
import { Composition } from 'remotion';
import './index.css';
import { ButterflyEffect } from './components/ButterflyEffect';
import { BERLIN_WALL_STORY } from './data/berlinWallStory';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="ButterflyEffect-Shorts"
        component={ButterflyEffect}
        durationInFrames={BERLIN_WALL_STORY.totalDurationFrames}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          data: BERLIN_WALL_STORY,
        }}
      />
    </>
  );
};
