import type { HeadShape } from '../body';
import type { Box } from '../model';
import { backOfHead, cap, coveredSides, fall, fringeEnds, partedFringe, sideLocks } from './shapes';

// The hair falls this share of the head's height below the head, down the back.
const FALL = 0.4;

/**
 * Long, parted in the middle: a fringe curving down at its ends, a lock down
 * each side of the face, the ears covered, and a fall down the back.
 */
export function longParted(head: HeadShape): Box[] {
  return [
    ...cap(head),
    backOfHead(head, head.bevel),
    ...coveredSides(head),
    ...partedFringe(head),
    ...fringeEnds(head),
    ...sideLocks(head),
    fall(head, FALL),
  ];
}
