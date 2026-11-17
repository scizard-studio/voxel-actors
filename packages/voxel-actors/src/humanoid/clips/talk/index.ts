import { X, Y, Z, type Clip } from '../pose.js';
import { talkingMouth } from './mouth.js';

// The right hand gestures in front, the forearm lifting and falling; the left arm hangs a little out.
const GESTURE_FORWARD = 0.3;
const GESTURE_OUT = 0.1;
const GESTURE_BEND = 1;
const GESTURE = 0.3;
const ARM_OUT = 0.05;
// The head nods and the upper body turns a little with the words.
const NOD = 0.04;
const TURN = 0.04;

/** Talking: a hand gesturing, a little nod and turn, and the mouth moving with the words. */
export const talk: Clip = {
  cyclesPerSecond: 0.6,
  face: talkingMouth,
  swings: [
    { joint: 'shoulderRight', axis: X, size: 0.08, base: -GESTURE_FORWARD },
    { joint: 'shoulderRight', axis: Z, size: 0, base: -GESTURE_OUT },
    { joint: 'elbowRight', axis: X, size: GESTURE, base: -GESTURE_BEND, phase: 0.6 },
    { joint: 'shoulderLeft', axis: Z, size: 0, base: ARM_OUT },
    { joint: 'head', axis: X, size: NOD, phase: 1.2 },
    { joint: 'waist', axis: Y, size: TURN },
  ],
};
