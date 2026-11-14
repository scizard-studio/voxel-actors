import { hoopAt, type Body } from '../packages/characters/src';
import type { Figure } from '../figure';
import { createPieces, type HeldProp } from './pieces';

// The hoop is drawn as this many short straight pieces round the ring, in two colours by turns.
const PIECES = 24;
const COLORS = [0xf26b9a, 0x3cc8b4];
// Each piece overlaps the next by this share of its length, so the ring has no gaps.
const OVERLAP = 1.05;

/** A hula hoop round the hips: a ring of short pieces, each turned to run along it, swinging round in time. */
export function holdHoop(figure: Figure, body: Body): HeldProp {
  const { holder, block, prop } = createPieces();
  const hoop = hoopAt(body, 0);
  const length = ((2 * Math.PI * hoop.radius) / PIECES) * OVERLAP;
  for (let index = 0; index < PIECES; index++) {
    const around = (index / PIECES) * 2 * Math.PI;
    const color = COLORS[index % COLORS.length];
    const piece = block(color, [length, hoop.thickness, hoop.thickness], [hoop.radius * Math.cos(around), 0, hoop.radius * Math.sin(around)]);
    piece.rotation.y = -(around + Math.PI / 2);
  }
  figure.attach(holder, { joint: hoop.joint, at: hoop.center });
  return prop((clipSeconds) => holder.position.set(...hoopAt(body, clipSeconds).center));
}
