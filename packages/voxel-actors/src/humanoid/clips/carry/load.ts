import type { Body } from '../../body.js';
import { carryArms } from './index.js';
import { withPosture } from '../../../core/pose.js';
import { pointsIn, posedJoints, toLocal, toWorld } from '../../../core/kinematics.js';
import type { JointName } from '../../skeleton.js';

/** A space on a body that moves with one joint: its lowest corner and its size, measured from the joint's pivot, in voxels. */
export interface Room {
  readonly joint: JointName;
  readonly at: readonly [number, number, number];
  readonly size: readonly [number, number, number];
}

type Point = readonly [number, number, number];

// A carried load keeps at least this far from everything but the forearms and hands it rests on, in voxels.
const LOAD_CLEARANCE = 0.3;

/**
 * The part of a block on one side of a level: the block's corners on that side
 * and the points where its edges cross the level. The block's highest and
 * lowest points on that side are among these. `corners` are in the order
 * `pointsIn(box, 1)` gives them.
 */
function cut(corners: readonly Point[], axis: number, level: number, keep: 'above' | 'below'): Point[] {
  const kept = (point: Point): boolean => (keep === 'above' ? point[axis] >= level : point[axis] <= level);
  const crossings: Point[] = [];
  // Corners whose numbers differ in one bit share an edge.
  for (let a = 0; a < corners.length; a++) {
    for (const bit of [1, 2, 4]) {
      const b = a | bit;
      if (b === a) continue;
      const [from, to] = [corners[a], corners[b]];
      if ((from[axis] - level) * (to[axis] - level) >= 0) continue;
      const share = (level - from[axis]) / (to[axis] - from[axis]);
      crossings.push([0, 1, 2].map((each) => from[each] + (to[each] - from[each]) * share) as unknown as Point);
    }
  }
  return [...corners.filter(kept), ...crossings];
}

/**
 * The room for a load carried in both hands: a box on the waist joint
 * resting on the forearms and hands, centred
 * between them, as wide as the hands reach, from just in front of the chest to
 * the fingertips, and up to just under the chin. The arms hold still while
 * carrying, so a load put here stays in place as the base motion changes.
 */
export function carryingRoom(body: Body): Room {
  const places = posedJoints(body, withPosture(carryArms().pose, body.posture));
  const waist = places.get('waist');
  if (waist === undefined) throw new Error('The waist joint was not placed.');
  /** The corners of each block of some parts, in the waist's space. */
  const blocksOf = (wanted: (name: string) => boolean): Point[][] =>
    body.parts
      .filter((part) => wanted(part.name))
      .flatMap((part) => {
        const place = places.get(part.joint);
        if (place === undefined) throw new Error(`${part.joint} was not placed.`);
        return part.boxes.map((box) => pointsIn(box, 1).map((corner) => toLocal(waist, toWorld(place, corner))));
      });

  const hands = blocksOf((name) => name.startsWith('lowerArm')).flat();
  const bottom = Math.max(...hands.map((point) => point[1]));
  const side = Math.max(...hands.map((point) => Math.abs(point[0])));
  const front = Math.max(...hands.map((point) => point[2]));
  // Behind the load: the front of the chest and upper arms, wherever they rise above the forearms.
  const behind = blocksOf((name) => !name.startsWith('lowerArm') && name !== 'head').flatMap((corners) =>
    cut(corners, 1, bottom - LOAD_CLEARANCE, 'above'),
  );
  const back = Math.max(...behind.map((point) => point[2])) + LOAD_CLEARANCE;
  // Above it: the underside of the head, wherever it comes forward over the load.
  const over = blocksOf((name) => name === 'head').flatMap((corners) => cut(corners, 2, back - LOAD_CLEARANCE, 'above'));
  const top = Math.min(...over.map((point) => point[1])) - LOAD_CLEARANCE;
  return { joint: 'waist', at: [-side, bottom, back], size: [2 * side, top - bottom, front - back] };
}
