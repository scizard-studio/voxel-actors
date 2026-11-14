import type { HeadShape } from '../body';
import type { Box } from '../model';
import { block, edges, pair } from './shapes';

// The hair stops this far below the top of the head, leaving the crown bare.
const BARE_TOP = 2;

/** Bare on top, with hair left around the sides above and behind the ears, and across the back. */
export function balding(head: HeadShape): Box[] {
  const { side, top, front, back } = edges(head);
  const { bevel, ears } = head;
  const hairTop = top - BARE_TOP;
  return [
    block([-side, bevel + 1, back - 1], [side, hairTop, back]),
    // Above the ears, thinning out before the temples.
    ...pair([side, ears.top, back - 1], [side + ears.reach, hairTop, front - 2]),
    ...pair([side, bevel + 1, back - 1], [side + ears.reach, ears.top, ears.back]),
  ];
}
