import { hoopAt, hoopFor, type Body } from '../../../packages/voxel-actors/src';
import type { Figure } from '../figure';
import { createPieces, type HeldProp } from './pieces';

/** A hula hoop round the hips: a ring of short pieces, each turned to run along it, swinging round in time. */
export function holdHoop(figure: Figure, body: Body): HeldProp {
  const { holder, block, prop } = createPieces();
  const { socket, blocks } = hoopFor(body);
  for (const piece of blocks) {
    const mesh = block(piece.color, piece.size, piece.center);
    if (piece.rotation) mesh.rotation.set(...piece.rotation);
  }
  figure.attach(holder, socket);
  return prop((clipSeconds) => holder.position.set(...hoopAt(body, clipSeconds).center));
}
