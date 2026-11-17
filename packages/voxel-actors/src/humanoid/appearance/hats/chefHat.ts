import type { HeadShape } from '../../body.js';
import { edges } from '../hair/shapes.js';
import { between, type Box } from '../../model.js';

// A snug band this tall just above the face, then a puff this tall standing this far out from it.
const BAND_HEIGHT = 2;
const PUFF_HEIGHT = 4;
const PUFF = 1;

/** A chef hat: a snug band round the head and a tall puff above it. */
export function chefHat(head: HeadShape): Box[] {
  const { side, front, back, faceTop } = edges(head);
  const bandTop = faceTop + BAND_HEIGHT;
  return [
    between([-side, faceTop, back], [side, bandTop, front], 'hat'),
    between([-side - PUFF, bandTop, back - PUFF], [side + PUFF, bandTop + PUFF_HEIGHT, front + PUFF], 'hat'),
  ];
}
