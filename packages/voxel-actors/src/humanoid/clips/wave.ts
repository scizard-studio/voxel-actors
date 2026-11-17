import { Z, type Clip } from './pose.js';

/**
 * The right upper arm out to the side, a little above level, and the forearm
 * up, waving from the elbow. Heads are wider than shoulders, so the arm stays
 * out beside the head, never over it. The head keeps still: tilting it would
 * lower its other side onto the resting shoulder.
 */
export const wave: Clip = {
  cyclesPerSecond: 0.8,
  swings: [
    { joint: 'shoulderRight', axis: Z, size: 0, base: -1.65 },
    { joint: 'elbowRight', axis: Z, size: 0.22, base: -0.6 },
  ],
};
