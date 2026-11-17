import { createMotion as createMotionOver, type Motion as MotionOver } from '../core/motion.js';
import { clips } from './clips/clips.js';

export { GLIDE_SECONDS } from '../core/motion.js';

/** What one person is doing, kept from moment to moment so that changes of motion glide. */
export type Motion = MotionOver<keyof typeof clips>;

/** A person's motion, starting with `clip` at `seconds`. */
export function createMotion(clip: Motion['clip'], seconds = 0): Motion {
  return createMotionOver(clips, clip, seconds);
}
