import type { HeadShape } from '../body';
import type { Box } from '../model';
import { backOfHead, cap, coveredSides, fall, sideLocks, straightFringe } from './shapes';

// The hair falls this share of the head's height below the head: further than parted long hair.
const FALL = 0.5;

/** Long, with a straight fringe across the forehead, a lock down each side of the face, and a long fall down the back. */
export function longBangs(head: HeadShape): Box[] {
  return [
    ...cap(head),
    backOfHead(head, head.bevel),
    ...coveredSides(head),
    straightFringe(head),
    ...sideLocks(head),
    fall(head, FALL),
  ];
}
