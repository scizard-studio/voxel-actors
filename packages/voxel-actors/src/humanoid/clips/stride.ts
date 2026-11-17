import { X, type Swing } from './pose.js';

/** Legs striding, each knee bending as its leg comes forward: shared by every walking clip. */
export const stride: readonly Swing[] = [
  { joint: 'hipLeft', axis: X, size: -0.36 },
  { joint: 'hipRight', axis: X, size: 0.36 },
  { joint: 'kneeLeft', axis: X, size: 0.44, phase: 0.4, oneWay: true },
  { joint: 'kneeRight', axis: X, size: 0.44, phase: Math.PI + 0.4, oneWay: true },
];

/** The pace of a stride, in cycles a second, and how high the body bobs with each step, in voxels. */
export const STRIDES_PER_SECOND = 0.85;
export const STRIDE_BOB = 0.5;
