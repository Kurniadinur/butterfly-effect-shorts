import React from 'react';
import { Audio, staticFile } from 'remotion';
import { ButterflyStoryData } from '../data/types';
import { CURRENT_STORY } from '../data/currentStory';
import { MinimalistStoryFlow } from './MinimalistStoryFlow';

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
        backgroundColor: '#101216',
        overflow: 'hidden',
      }}
    >
      {/* 1. Master Minimalist Typography Flow (Inspired by reference reel) */}
      <MinimalistStoryFlow data={data} />

      {/* 2. Pure Voice Over Audio Track (Calm, intimate, reflective storytelling) */}
      {data.audioUrl && (
        <Audio src={staticFile(data.audioUrl)} volume={1.0} />
      )}

      {/* 
        NO ABRASIVE SFX:
        All tension drones, MRI scanner sweeps ("ngik ngik ngik"), 
        warning pulses, and high-frequency bleeps have been removed 
        as requested by the user. 
      */}
    </div>
  );
};
