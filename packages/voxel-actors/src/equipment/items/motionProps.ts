import type { Body, Socket } from '../../humanoid/body.js';
import { carryingRoom } from '../../humanoid/clips/carry/load.js';
import { hoopAt } from '../../humanoid/clips/hulaHoop/hoop.js';
import { ropeAt } from '../../humanoid/clips/ropeSkip/rope.js';
import type { Corner, Worn } from '../../humanoid/model.js';

export interface PropBlock {
  readonly color: number;
  readonly size: Corner;
  readonly center: Corner;
  readonly rotation?: Corner;
}

export function crateFor(body: Body): { socket: Socket; blocks: readonly PropBlock[] } {
  const room = carryingRoom(body);
  const [width, height, depth] = room.size.map(Math.floor);
  const blocks: PropBlock[] = [];
  if (Math.min(width, height, depth) > 0) {
    blocks.push({ color: 0xb78b52, size: [width, height, depth], center: [0, height / 2, -depth / 2] });
    if (height > 1) blocks.push({
      color: 0x8f6634, size: [width + 0.2, 1, depth + 0.2], center: [0, height - 1.5, -depth / 2],
    });
  }
  return { socket: { joint: room.joint, at: [0, room.at[1], room.at[2] + room.size[2]] }, blocks };
}

export function hoopFor(body: Body): { socket: Socket; blocks: readonly PropBlock[] } {
  const hoop = hoopAt(body, 0);
  const pieceCount = 24;
  const colors = [0xf26b9a, 0x3cc8b4];
  const length = (2 * Math.PI * hoop.radius / pieceCount) * 1.05;
  const blocks = Array.from({ length: pieceCount }, (_, index): PropBlock => {
    const angle = index * 2 * Math.PI / pieceCount;
    return {
      color: colors[index % colors.length],
      size: [length, hoop.thickness, hoop.thickness],
      center: [hoop.radius * Math.cos(angle), 0, hoop.radius * Math.sin(angle)],
      rotation: [0, -(angle + Math.PI / 2), 0],
    };
  });
  return { socket: { joint: hoop.joint, at: hoop.center }, blocks };
}

export function skippingRopeFor(body: Body, worn: readonly Worn[], seconds: number) {
  return { ...ropeAt(body, worn, seconds), color: 0xd94a3d };
}
