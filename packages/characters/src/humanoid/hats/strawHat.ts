import type { HeadShape } from '../body';
import { edges } from '../hair/shapes';
import { between, type Box } from '../model';

// The flat brim reaches this far out from the head all round, to shade the face in the fields.
const BRIM = 2;
// A band at the crown's foot, and the crown above it, this tall and set in this far.
const BAND_HEIGHT = 1;
const CROWN_HEIGHT = 2;
const CROWN_INSET = 1;

/** A straw hat: a wide flat brim just above the face, a band, and a low crown. */
export function strawHat(head: HeadShape): Box[] {
  const { side, front, back, faceTop } = edges(head);
  const brimTop = faceTop + 1;
  const bandTop = brimTop + BAND_HEIGHT;
  return [
    between([-side - BRIM, faceTop, back - BRIM], [side + BRIM, brimTop, front + BRIM], 'hat'),
    between([-side, brimTop, back], [side, bandTop, front], 'hatBand'),
    between([-side + CROWN_INSET, bandTop, back + CROWN_INSET], [side - CROWN_INSET, bandTop + CROWN_HEIGHT, front - CROWN_INSET], 'hat'),
  ];
}
