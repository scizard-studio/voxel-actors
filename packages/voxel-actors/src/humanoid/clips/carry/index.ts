import { X } from '../pose.js';
import { clipPose } from '../../../core/pose.js';
import type { PoseLayer } from '../../../core/layers.js';

// The upper arms reach this far forward and the elbows bend the rest of a right angle, so the
// forearms are level and a load rests flat on them.
const REACH = 0.4;
const BEND = Math.PI / 2 - REACH;
const arms = [
  { joint: 'shoulderLeft', axis: X, size: 0, base: -REACH },
  { joint: 'shoulderRight', axis: X, size: 0, base: -REACH },
  { joint: 'elbowLeft', axis: X, size: 0, base: -BEND },
  { joint: 'elbowRight', axis: X, size: 0, base: -BEND },
] as const;

export function carryArms(weight = 1): PoseLayer {
  return {
    pose: clipPose({ cyclesPerSecond: 0, swings: arms }, 0),
    joints: arms.map(swing => swing.joint),
    weight,
  };
}

