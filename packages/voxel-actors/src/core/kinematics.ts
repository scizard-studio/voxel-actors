import type { Box, Rig, Turns } from './model.js';
import type { Pose } from './pose.js';

type Vec3 = readonly [number, number, number];
/** A rotation as a 3 by 3 matrix, row by row. */
type Mat3 = readonly [number, number, number, number, number, number, number, number, number];

/** The rotation for turns around x, y and z, built the way Three.js builds it by default (its "XYZ" order). */
function rotation([x, y, z]: Vec3): Mat3 {
  const [a, b] = [Math.cos(x), Math.sin(x)];
  const [c, d] = [Math.cos(y), Math.sin(y)];
  const [e, f] = [Math.cos(z), Math.sin(z)];
  return [
    c * e, -c * f, d,
    a * f + b * e * d, a * e - b * f * d, -b * c,
    b * f - a * e * d, b * e + a * f * d, a * c,
  ];
}

function times(m: Mat3, n: Mat3): Mat3 {
  const cell = (row: number, col: number): number =>
    m[row * 3] * n[col] + m[row * 3 + 1] * n[3 + col] + m[row * 3 + 2] * n[6 + col];
  return [cell(0, 0), cell(0, 1), cell(0, 2), cell(1, 0), cell(1, 1), cell(1, 2), cell(2, 0), cell(2, 1), cell(2, 2)];
}

function apply(m: Mat3, [x, y, z]: Vec3): Vec3 {
  return [m[0] * x + m[1] * y + m[2] * z, m[3] * x + m[4] * y + m[5] * z, m[6] * x + m[7] * y + m[8] * z];
}

/** Turns a vector back: the rotation is undone by its transpose. */
function applyBack(m: Mat3, [x, y, z]: Vec3): Vec3 {
  return [m[0] * x + m[3] * y + m[6] * z, m[1] * x + m[4] * y + m[7] * z, m[2] * x + m[5] * y + m[8] * z];
}

/** Where a joint's pivot is in the world, and how the joint is turned there. */
export interface Placement {
  readonly rotation: Mat3;
  readonly position: Vec3;
}

/** Places every joint of a body in a pose, the way a figure on screen is placed. */
export function posedJoints(body: Rig, pose: Pose): Map<string, Placement> {
  const placed = new Map<string, Placement>();
  for (const joint of body.joints) {
    const local = rotation(pose.turns[joint.name] ?? [0, 0, 0]);
    if (joint.parent === null) {
      placed.set(joint.name, { rotation: local, position: [joint.at[0], joint.at[1] + pose.lift, joint.at[2]] });
      continue;
    }
    const parent = placed.get(joint.parent);
    if (parent === undefined) throw new Error(`${joint.name} comes before its parent ${joint.parent}.`);
    const [ox, oy, oz] = apply(parent.rotation, joint.at);
    const [px, py, pz] = parent.position;
    placed.set(joint.name, { rotation: times(parent.rotation, local), position: [px + ox, py + oy, pz + oz] });
  }
  return placed;
}

/** A point given in a joint's own space, in the world. */
export function toWorld(place: Placement, point: Vec3): Vec3 {
  const [x, y, z] = apply(place.rotation, point);
  return [place.position[0] + x, place.position[1] + y, place.position[2] + z];
}

/** A point in the world, in a joint's own space. */
export function toLocal(place: Placement, [x, y, z]: Vec3): Vec3 {
  return applyBack(place.rotation, [x - place.position[0], y - place.position[1], z - place.position[2]]);
}

/** Points spread through a block, corners and faces included: `steps + 1` along each side. */
export function pointsIn(box: Box, steps = 4): Vec3[] {
  const points: Vec3[] = [];
  for (let i = 0; i <= steps; i++) {
    for (let j = 0; j <= steps; j++) {
      for (let k = 0; k <= steps; k++) {
        points.push([
          box.at[0] + (box.size[0] * i) / steps,
          box.at[1] + (box.size[1] * j) / steps,
          box.at[2] + (box.size[2] * k) / steps,
        ]);
      }
    }
  }
  return points;
}

/**
 * How far to lift a body turned this way so its lowest point rests on the
 * ground: below zero to lower it, as when crouching. Any lift of the pose's own is left out.
 */
export function groundLift(body: Rig, turns: Turns): number {
  const places = posedJoints(body, { lift: 0, turns });
  let lowest = Infinity;
  for (const part of body.parts) {
    const place = places.get(part.joint);
    if (place === undefined) throw new Error(`${part.joint} was not placed.`);
    for (const box of part.boxes) for (const corner of pointsIn(box, 1)) lowest = Math.min(lowest, toWorld(place, corner)[1]);
  }
  return -lowest;
}
