import { X, Z, type Clip } from '../pose';

// The body bobs twice a cycle, so the rope turns twice a cycle: one hop for each turn, as the rope
// passes under the feet.
export const TURNS_PER_CYCLE = 2;
// How high each hop lifts the body, in voxels: enough for the rope to pass under the feet.
export const HOP = 3;
// The hands are held low, a little out to the sides and forward, the forearms forward, turning the rope.
const ARMS_OUT = 0.3;
const ARMS_FORWARD = 0.25;
const FOREARMS_FORWARD = 1;

/**
 * Skipping rope: the hands turning the rope at the hips, the body hopping each
 * time the rope comes under the feet. `ropeAt` says where the rope is.
 */
export const ropeSkip: Clip = {
  cyclesPerSecond: 0.8,
  bob: HOP,
  swings: [
    { joint: 'shoulderLeft', axis: Z, size: 0, base: ARMS_OUT },
    { joint: 'shoulderRight', axis: Z, size: 0, base: -ARMS_OUT },
    { joint: 'shoulderLeft', axis: X, size: 0, base: -ARMS_FORWARD },
    { joint: 'shoulderRight', axis: X, size: 0, base: -ARMS_FORWARD },
    { joint: 'elbowLeft', axis: X, size: 0, base: -FOREARMS_FORWARD },
    { joint: 'elbowRight', axis: X, size: 0, base: -FOREARMS_FORWARD },
  ],
};
