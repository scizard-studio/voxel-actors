import { carryingRoom, type Body } from '../packages/characters/src';
import type { Figure } from '../figure';
import { createPieces, type HeldProp } from './pieces';

const WOOD = 0xb78b52;
const SLAT = 0x8f6634;
// A slat runs round the crate this far below its top, standing this far proud of its sides.
const SLAT_DROP = 1;
const SLAT_PROUD = 0.2;

/** A crate carried in both hands: the biggest whole-voxel crate that fits the room, centred, its front at the fingertips. */
export function holdCrate(figure: Figure, body: Body): HeldProp {
  const { holder, block, prop } = createPieces();
  const room = carryingRoom(body);
  const [width, height, depth] = room.size.map(Math.floor);
  const crate = block(WOOD, [width, height, depth], [0, height / 2, -depth / 2]);
  if (height > SLAT_DROP) block(SLAT, [width + SLAT_PROUD, 1, depth + SLAT_PROUD], [0, height / 2 - SLAT_DROP - 0.5, 0], crate);
  figure.attach(holder, { joint: room.joint, at: [0, room.at[1], room.at[2] + room.size[2]] });
  return prop();
}
