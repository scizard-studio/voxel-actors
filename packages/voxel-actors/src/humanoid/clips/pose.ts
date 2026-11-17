import type { Clip as CoreClip, Swing as CoreSwing } from '../../core/pose.js';
import type { FaceState } from '../appearance/face.js';
import type { JointName } from '../skeleton.js';

export { X, Y, Z } from '../../core/pose.js';

/** One of a person's joints swinging. */
export type Swing = CoreSwing<JointName>;

/** A person's motion: joint swings, and, if it moves the face too, how. */
export type Clip = CoreClip<JointName> & {
  /** How the face moves with the clip, `seconds` into it, such as a mouth talking. `seed` keeps each face to its own beat. */
  readonly face?: (face: FaceState, seconds: number, seed: number) => FaceState;
};
