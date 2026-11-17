import { crateFor, type Body } from '../../../packages/voxel-actors/src';
import type { Figure } from '../figure';
import { createPieces, type HeldProp } from './pieces';

/** A crate carried in both hands: the biggest whole-voxel crate that fits the room, centred, its front at the fingertips. */
export function holdCrate(figure: Figure, body: Body): HeldProp {
  const { holder, block, prop } = createPieces();
  const { socket, blocks } = crateFor(body);
  for (const piece of blocks) block(piece.color, piece.size, piece.center);
  figure.attach(holder, socket);
  return prop();
}
