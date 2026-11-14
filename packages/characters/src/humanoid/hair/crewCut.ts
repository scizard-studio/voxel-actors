import type { HeadShape } from '../body';
import type { Box } from '../model';
import { backOfHead, block, cap, edges, tuckedSides } from './shapes';

/** Short and neat: close over the top and the back, above and behind the ears, with a straight hairline. */
export function crewCut(head: HeadShape): Box[] {
  const { side, top, front } = edges(head);
  const { bevel } = head;
  return [
    ...cap(head),
    backOfHead(head, bevel + 1),
    // The hairline, flush with the face.
    block([-side, top - bevel, front - bevel], [side, top, front]),
    ...tuckedSides(head),
  ];
}
