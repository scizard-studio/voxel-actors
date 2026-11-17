import type { HeadShape } from '../../body.js';
import type { Box } from '../../model.js';
import { backOfHead, block, cap, edges, tuckedSides } from './shapes.js';

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
