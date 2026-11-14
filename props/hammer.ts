import type { Body } from '../packages/characters/src';
import type { Figure } from '../figure';
import { createPieces, type HeldProp } from './pieces';

const HANDLE = 0x9b6b3d;
const METAL = 0x7d848c;
// The handle sticks out this far from the fist, the head at its far end this big.
const HANDLE_LENGTH = 6;
const HEAD: readonly [number, number, number] = [2, 4, 2];

/** A hammer in the right hand, its handle pointing forward out of the fist. */
export function holdHammer(figure: Figure, body: Body): HeldProp {
  const { holder, block, prop } = createPieces();
  const handle = block(HANDLE, [1, 1, HANDLE_LENGTH], [0, 0, HANDLE_LENGTH / 2]);
  block(METAL, HEAD, [0, -HEAD[1] / 4, HANDLE_LENGTH / 2], handle);
  figure.attach(holder, body.sockets.handRight);
  return prop();
}
