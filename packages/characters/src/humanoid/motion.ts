import { createMotion as createMotionOver, type Motion as MotionOver } from '../core/motion';
import { clips, type ClipName } from './clips/clips';

export { GLIDE_SECONDS } from '../core/motion';

/** What one person is doing, kept from moment to moment so that changes of motion glide. */
export type Motion = MotionOver<ClipName>;

/** A person's motion, starting with `clip` at `seconds`. */
export function createMotion(clip: ClipName, seconds = 0): Motion {
  return createMotionOver(clips, clip, seconds);
}
