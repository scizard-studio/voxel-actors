import { createMotion as createMotionOver, type Motion as MotionOver } from '../core/motion';
import { clips } from './clips/clips';
import { workLeft } from './clips/work';

export { GLIDE_SECONDS } from '../core/motion';

/** What one person is doing, kept from moment to moment so that changes of motion glide. */
const playableClips = { ...clips, workLeft };
export type Motion = MotionOver<keyof typeof playableClips>;

/** A person's motion, starting with `clip` at `seconds`. */
export function createMotion(clip: Motion['clip'], seconds = 0): Motion {
  return createMotionOver(playableClips, clip, seconds);
}
