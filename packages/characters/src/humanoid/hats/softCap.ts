import type { HeadShape } from '../body';
import { edges } from '../hair/shapes';
import { between, type Box } from '../model';

// The cap hugs the head from just above the face, this tall, with a low crown set in this far.
const HEIGHT = 2;
const CROWN_INSET = 2;

/** A soft cloth cap, as millers and cooks wear: snug round the head, with a low crown. */
export function softCap(head: HeadShape): Box[] {
  const { side, front, back, faceTop } = edges(head);
  const top = faceTop + HEIGHT;
  return [
    between([-side, faceTop, back], [side, top, front], 'hat'),
    between([-side + CROWN_INSET, top, back + 1], [side - CROWN_INSET, top + 1, front - 1], 'hat'),
  ];
}
