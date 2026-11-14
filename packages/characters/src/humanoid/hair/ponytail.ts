import type { HeadShape } from '../body';
import type { Box } from '../model';
import { backOfHead, block, cap, edges, straightFringe, tuckedSides } from './shapes';

// The tail is this many voxels across. The band that ties it sits this far below the top of the head.
const TAIL_WIDTH = 3;
const TIE_BELOW_TOP = 1;
const TIE_HEIGHT = 3;

/** Pulled back from a straight fringe, the ears showing, tied high at the back with the tail hanging down behind the head. */
export function ponytail(head: HeadShape): Box[] {
  const { top, back } = edges(head);
  const { bevel } = head;
  const half = TAIL_WIDTH / 2;
  const tieTop = top - TIE_BELOW_TOP;
  return [
    ...cap(head),
    backOfHead(head, bevel + 1),
    straightFringe(head),
    ...tuckedSides(head),
    // The tie, standing out from the back of the head, and the tail hanging from it.
    block([-half, tieTop - TIE_HEIGHT, back - 2], [half, tieTop, back - 1]),
    block([-half, bevel + 1, back - 3], [half, tieTop - 1, back - 2]),
  ];
}
