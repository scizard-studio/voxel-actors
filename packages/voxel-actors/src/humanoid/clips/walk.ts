import { X, Y, Z, type Clip } from './pose.js';
import { STRIDE_BOB, STRIDES_PER_SECOND, stride } from './stride.js';

// The arms hang this far out from the sides, so the twist of the waist never pushes a hand into a hip.
const ARMS_OUT = 0.05;

/** Legs and arms swing opposite each other. Each knee bends as its leg comes forward. */
export const walk: Clip = {
  cyclesPerSecond: STRIDES_PER_SECOND,
  bob: STRIDE_BOB,
  swings: [
    ...stride,
    { joint: 'shoulderLeft', axis: X, size: 0.33 },
    { joint: 'shoulderRight', axis: X, size: -0.33 },
    { joint: 'elbowLeft', axis: X, size: 0, base: -0.09 },
    { joint: 'elbowRight', axis: X, size: 0, base: -0.09 },
    { joint: 'shoulderLeft', axis: Z, size: 0, base: ARMS_OUT },
    { joint: 'shoulderRight', axis: Z, size: 0, base: -ARMS_OUT },
    { joint: 'waist', axis: Y, size: 0.045 },
  ],
};
