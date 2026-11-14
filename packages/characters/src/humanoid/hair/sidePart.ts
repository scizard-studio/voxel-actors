import type { HeadShape } from '../body';
import type { Box } from '../model';
import { backOfHead, block, cap, edges, tuckedSides } from './shapes';

// The swept fringe stops this far short of the face's left edge, where the parting is.
const PARTING_IN = 4;

/** Short, parted on the left, the fringe swept across to the right and dipping over the right corner of the forehead. */
export function sidePart(head: HeadShape): Box[] {
  const { side, top, front, faceSide, faceTop } = edges(head);
  const { bevel } = head;
  return [
    ...cap(head),
    backOfHead(head, bevel + 1),
    // The hairline, flush with the face, and the fringe swept over it.
    block([-side, top - bevel, front - bevel], [side, top, front]),
    block([-side, top - bevel, front], [faceSide - PARTING_IN, top + 1, front + 1]),
    // Its end dips over the right corner of the forehead, clear of the brow.
    block([-faceSide, faceTop - 1, front], [-faceSide + 2, faceTop, front + 1]),
    block([-faceSide, faceTop - 2, front], [-faceSide + 1, faceTop - 1, front + 1]),
    ...tuckedSides(head),
  ];
}
