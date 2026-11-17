import type { HeadShape } from '../../body.js';
import type { Box } from '../../model.js';
import { backOfHead, block, cap, coveredSides, fall, sideLocks, straightFringe } from './shapes.js';

// The hair falls this share of the head's height below the head: further than parted long hair.
const FALL = 0.5;

/** Long, with a straight fringe across the forehead, a lock down each side of the face, and a long fall down the back. */
export function longBangs(head: HeadShape): Box[] {
  const backFall = fall(head, FALL);
  const [left, bottom, back] = backFall.at;
  const [width, height, depth] = backFall.size;
  return [
    ...cap(head),
    backOfHead(head, head.bevel),
    ...coveredSides(head),
    straightFringe(head),
    ...sideLocks(head),
    block([left, 0, back], [left + width, bottom + height, back + depth]),
    // Below the head, keep the hanging hair behind the torso.
    block([left, bottom, back - 0.5], [left + width, 0, back + 0.5]),
  ];
}
