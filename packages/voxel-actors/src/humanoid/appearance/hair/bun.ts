import type { HeadShape } from '../../body.js';
import type { Box } from '../../model.js';
import { backOfHead, block, cap, edges, fringeEnds, partedFringe, sideLocks, tuckedSides } from './shapes.js';

// The bun: this many voxels across and tall, this deep out from the back of the head, its base this
// far above the base of the head. A smaller knot rounds off its back.
const BUN = { width: 5, height: 4, depth: 2, lift: 2 };
const KNOT = { width: 3, height: 2, depth: 1 };

/** Parted in the middle with the fringe framing the face, pulled back into a low bun at the back of the head. */
export function bun(head: HeadShape): Box[] {
  const { back } = edges(head);
  const bunBack = back - 1 - BUN.depth;
  const knotBottom = BUN.lift + (BUN.height - KNOT.height) / 2;
  return [
    ...cap(head),
    backOfHead(head, head.bevel + 1),
    ...partedFringe(head),
    ...fringeEnds(head),
    ...sideLocks(head),
    ...tuckedSides(head),
    block([-BUN.width / 2, BUN.lift, bunBack], [BUN.width / 2, BUN.lift + BUN.height, back - 1]),
    block([-KNOT.width / 2, knotBottom, bunBack - KNOT.depth], [KNOT.width / 2, knotBottom + KNOT.height, bunBack]),
  ];
}
