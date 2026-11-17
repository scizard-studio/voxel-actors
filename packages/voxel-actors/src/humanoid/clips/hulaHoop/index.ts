import { X, Z, type Clip } from '../pose.js';

// The arms are held out to the sides this far, a little below level, and the forearms raised a
// little more: clear of the hoop below and of the head above.
const ARMS_OUT = 1.25;
const FOREARMS_UP = 0.35;
// The upper body circles this far each way over the hips as they drive the hoop round.
const CIRCLE = 0.05;

/** Keeping a hula hoop going: arms out to the sides, the upper body circling over the hips. `hoopAt` says where the hoop is. */
export const hulaHoop: Clip = {
  cyclesPerSecond: 1.5,
  swings: [
    { joint: 'shoulderLeft', axis: Z, size: 0, base: ARMS_OUT },
    { joint: 'shoulderRight', axis: Z, size: 0, base: -ARMS_OUT },
    { joint: 'elbowLeft', axis: Z, size: 0, base: FOREARMS_UP },
    { joint: 'elbowRight', axis: Z, size: 0, base: -FOREARMS_UP },
    { joint: 'waist', axis: X, size: CIRCLE },
    { joint: 'waist', axis: Z, size: CIRCLE, phase: Math.PI / 2 },
  ],
};
