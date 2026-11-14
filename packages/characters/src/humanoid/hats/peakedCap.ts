import type { HeadShape } from '../body';
import { edges } from '../hair/shapes';
import { between, type Box } from '../model';

// The cap stands this far clear of the head all round, its band this tall, its crown this tall above
// the band, and its peak reaches this far forward over the face.
const CLEAR = 1;
const BAND_HEIGHT = 1;
const CROWN_HEIGHT = 2;
const PEAK = 2;

/** A peaked cap, as police and porters wear: a band and peak just above the face, and a flat crown. */
export function peakedCap(head: HeadShape): Box[] {
  const { side, front, back, faceTop } = edges(head);
  const out = { side: side + CLEAR, front: front + CLEAR, back: back - CLEAR };
  const bandTop = faceTop + BAND_HEIGHT;
  return [
    between([-out.side, faceTop, out.back], [out.side, bandTop, out.front], 'hatBand'),
    between([-out.side + 1, faceTop, out.front], [out.side - 1, bandTop, out.front + PEAK], 'hatBand'),
    between([-out.side, bandTop, out.back], [out.side, bandTop + CROWN_HEIGHT, out.front], 'hat'),
  ];
}
