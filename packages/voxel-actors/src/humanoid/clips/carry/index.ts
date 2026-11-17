import { X, type Clip } from '../pose.js';
import { STRIDE_BOB, STRIDES_PER_SECOND, stride } from '../stride.js';

// The upper arms reach this far forward and the elbows bend the rest of a right angle, so the
// forearms are level and a load rests flat on them.
const REACH = 0.4;
const BEND = Math.PI / 2 - REACH;

/**
 * Walking with a load held out in front in both hands: the arms stay still,
 * forearms level, and the back leans a touch back against the weight.
 * `carryingRoom` says where a load goes.
 */
export const carry: Clip = {
  cyclesPerSecond: STRIDES_PER_SECOND,
  bob: STRIDE_BOB,
  swings: [
    ...stride,
    { joint: 'shoulderLeft', axis: X, size: 0, base: -REACH },
    { joint: 'shoulderRight', axis: X, size: 0, base: -REACH },
    { joint: 'elbowLeft', axis: X, size: 0, base: -BEND },
    { joint: 'elbowRight', axis: X, size: 0, base: -BEND },
    { joint: 'waist', axis: X, size: 0, base: -0.05 },
  ],
};
