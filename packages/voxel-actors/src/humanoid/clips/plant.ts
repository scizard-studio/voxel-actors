import { X, type Clip } from './pose.js';

// Squatting on the toes: the thighs forward and nearly level, the knees bent so the shins slope
// back down to the feet.
const THIGHS_FORWARD = 1.5;
const KNEES_BENT = 1.9;
// Leaning in over the knees, the arms reaching down in front, the hands patting the soil by turns.
const LEAN = 0.5;
const REACH = 0.9;
const PAT = 0.15;
const ELBOWS = 0.3;

/** Planting: squatting on the toes, leaning in, the hands patting the soil by turns. It keeps to the ground. */
export const plant: Clip = {
  cyclesPerSecond: 1.2,
  grounded: true,
  swings: [
    { joint: 'hipLeft', axis: X, size: 0, base: -THIGHS_FORWARD },
    { joint: 'hipRight', axis: X, size: 0, base: -THIGHS_FORWARD },
    { joint: 'kneeLeft', axis: X, size: 0, base: KNEES_BENT },
    { joint: 'kneeRight', axis: X, size: 0, base: KNEES_BENT },
    { joint: 'waist', axis: X, size: 0, base: LEAN },
    { joint: 'shoulderLeft', axis: X, size: PAT, base: -REACH },
    { joint: 'shoulderRight', axis: X, size: -PAT, base: -REACH },
    { joint: 'elbowLeft', axis: X, size: 0, base: -ELBOWS },
    { joint: 'elbowRight', axis: X, size: 0, base: -ELBOWS },
  ],
};
