import type { HeadShape } from '../../body.js';
import { edges } from '../hair/shapes.js';
import { between, mirrored, type Box } from '../../model.js';

// The brim reaches this far out from the head all round, its sides curling up at the ends.
const BRIM = 3;
// The crown stands this far clear of the head and this tall above the brim, a band at its foot.
const CROWN_CLEAR = 1;
const CROWN_HEIGHT = 4;
const BAND_HEIGHT = 1;
// Its top is pinched in this far, as a cowboy hat's crown is.
const PINCH = 2;

/** A cowboy hat: a wide brim just above the face, curling up at the sides, and a tall banded crown. */
export function cowboy(head: HeadShape): Box[] {
  const { side, front, back, faceTop } = edges(head);
  const brimTop = faceTop + 1;
  const crown = { side: side + CROWN_CLEAR, front: front + CROWN_CLEAR, back: back - CROWN_CLEAR };
  const crownTop = brimTop + CROWN_HEIGHT;
  const curl = between([side + BRIM - 1, brimTop, back - BRIM], [side + BRIM, brimTop + 1, front + BRIM], 'hat');
  return [
    between([-side - BRIM, faceTop, back - BRIM], [side + BRIM, brimTop, front + BRIM], 'hat'),
    curl,
    mirrored(curl),
    between([-crown.side, brimTop, crown.back], [crown.side, brimTop + BAND_HEIGHT, crown.front], 'hatBand'),
    between([-crown.side, brimTop + BAND_HEIGHT, crown.back], [crown.side, crownTop, crown.front], 'hat'),
    between([-crown.side + PINCH, crownTop, crown.back + PINCH], [crown.side - PINCH, crownTop + 1, crown.front - PINCH], 'hat'),
  ];
}
