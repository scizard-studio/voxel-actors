import { X, Z, type Clip } from './pose';

// The arms ease out this far and back to rest, never in past it, where the hands would sink into the hips.
const ARM_EASE = 0.03;

/** Barely moving: breathing, arms easing out and back. */
export const idle: Clip = {
  cyclesPerSecond: 0.25,
  swings: [
    { joint: 'waist', axis: X, size: 0.02 },
    { joint: 'shoulderLeft', axis: Z, size: ARM_EASE / 2, base: ARM_EASE / 2 },
    { joint: 'shoulderRight', axis: Z, size: -ARM_EASE / 2, base: -ARM_EASE / 2 },
  ],
};
