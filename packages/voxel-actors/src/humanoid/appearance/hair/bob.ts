import type { HeadShape } from '../../body.js';
import type { Box } from '../../model.js';
import { backOfHead, block, cap, coveredSides, edges, fringeEnds, sideLocks, straightFringe } from './shapes.js';

// The rounded fullness at the nape reaches this far up the back of the head.
const NAPE = 4;

/** Chin length: a straight fringe curving down at its ends, a lock down each side of the face, full at the nape. */
export function bob(head: HeadShape): Box[] {
  const { side, back } = edges(head);
  const { bevel } = head;
  return [
    ...cap(head),
    backOfHead(head, bevel),
    ...coveredSides(head),
    straightFringe(head),
    ...fringeEnds(head),
    ...sideLocks(head),
    block([-side + 1, bevel, back - 2], [side - 1, bevel + NAPE, back - 1]),
  ];
}
