import type { Body } from '../body';
import { poseOf, type Pose } from '../../core/pose';
import { carry } from './carry';
import { hulaHoop } from './hulaHoop';
import { idle } from './idle';
import { plant } from './plant';
import type { Clip } from './pose';
import { ropeSkip } from './ropeSkip';
import { talk } from './talk';
import { walk } from './walk';
import { wave } from './wave';
import { work } from './work';

/**
 * Every motion, by name, in the order they are offered. Each is a file in this
 * folder. A new motion is a new file, listed here: it is then offered in the
 * studio and checked on every body without anything else changing.
 */
export const clips = { idle, walk, wave, talk, carry, work, plant, hulaHoop, ropeSkip } satisfies Record<string, Clip>;

export type ClipName = keyof typeof clips;

/**
 * The pose of a clip at a moment, `seconds` into it. Clips loop for ever.
 * Given a body, the clip is laid on it: over its own posture, and on the
 * ground if the clip is grounded.
 */
export function poseAt(name: ClipName, seconds: number, body?: Body): Pose {
  return poseOf(clips[name], seconds, body);
}
