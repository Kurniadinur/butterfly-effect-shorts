import { ButterflyStoryData } from './types';
import { BERLIN_WALL_STORY } from './berlinWallStory';

/**
 * CURRENT_STORY is the active story rendered by Remotion.
 * When scripts/ai_director_pipeline.mjs runs, it updates this file
 * with the newly synthesized narrative, audio, and synchronized timestamps.
 */
export const CURRENT_STORY: ButterflyStoryData = BERLIN_WALL_STORY;
