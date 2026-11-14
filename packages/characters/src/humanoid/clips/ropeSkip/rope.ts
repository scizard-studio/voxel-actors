import type { Body } from '../../body';
import { pointsIn, posedJoints, toLocal, toWorld } from '../../../core/kinematics';
import type { Box, Worn } from '../../model';
import { poseAt } from '../clips';
import { HOP, TURNS_PER_CYCLE, ropeSkip } from './index';

type Point = readonly [number, number, number];

/**
 * A skipping rope at one moment: the points it runs through, from the left hand
 * round to the right, measured from the pelvis pivot, and how thick it is, in voxels.
 */
export interface Rope {
  readonly joint: 'pelvis';
  readonly points: readonly Point[];
  readonly thickness: number;
}

// The rope is this thick, keeps at least this far from the body and everything worn, and passes this
// high over the ground when it comes under the feet at the top of a hop.
const THICKNESS = 0.6;
const CLEARANCE = 0.3;
const GROUND_GAP = 0.1;
// Over the head it passes this much higher than it must.
const TOP_ROOM = 1;
// The far side of the rope turns round a rounded square, a superellipse of this power: fuller than an
// oval, so it can pass under the feet without swinging far out in front.
const LOOP_POWER = 4;

/** A block grown by the same amount on every side. */
function grown(box: Box, by: number): Box {
  return { ...box, at: [box.at[0] - by, box.at[1] - by, box.at[2] - by], size: [box.size[0] + 2 * by, box.size[1] + 2 * by, box.size[2] + 2 * by] };
}

/** A value kept to its sign, its size raised to `2 / LOOP_POWER`: how far round the loop's sides a turn reaches. */
function swell(value: number): number {
  return Math.sign(value) * Math.abs(value) ** (2 / LOOP_POWER);
}

/**
 * Where a skipping rope is, `seconds` into the `ropeSkip` clip, on this body
 * wearing these things: five straight stretches. From each hand it runs out to
 * the side, past everything, then along the side to its far stretch, which
 * turns round the body on a loop over the head and under the feet, under them
 * at the top of each hop. It turns forward: over the head from behind, down
 * in front, under the feet and up behind.
 */
export function ropeAt(body: Body, worn: readonly Worn[], seconds: number): Rope {
  // The body holds still while skipping, all but the hop, which lifts it whole, so one pose serves.
  const places = posedJoints(body, poseAt('ropeSkip', 0, body));
  const pelvis = places.get('pelvis');
  if (pelvis === undefined) throw new Error('The pelvis joint was not placed.');
  const inPelvis = (joint: string, point: Point): Point => {
    const place = places.get(joint as never);
    if (place === undefined) throw new Error(`${joint} was not placed.`);
    return toLocal(pelvis, toWorld(place, point));
  };
  const blocks = [...body.parts, ...worn].flatMap((piece) => piece.boxes.map((box) => ({ joint: piece.joint, box })));
  // The corners of everything, each block grown by the room the rope keeps from it.
  const corners = blocks.flatMap(({ joint, box }) => pointsIn(grown(box, CLEARANCE + THICKNESS / 2), 1).map((corner) => inPelvis(joint, corner)));
  const soles = Math.min(...blocks.flatMap(({ joint, box }) => pointsIn(box, 1).map((corner) => inPelvis(joint, corner)[1])));

  // Out to the side, past everything. Then the loop: under the feet with the ground just below it at
  // the top of a hop, over the top of everything, and as deep as it must be to pass round the rest.
  const side = Math.max(...corners.map((corner) => Math.abs(corner[0])));
  const bottom = soles - HOP + GROUND_GAP + THICKNESS / 2;
  const top = Math.max(...corners.map((corner) => corner[1])) + TOP_ROOM;
  const middle = (bottom + top) / 2;
  const tall = (top - bottom) / 2;
  const centre = (Math.max(...corners.map((corner) => corner[2])) + Math.min(...corners.map((corner) => corner[2]))) / 2;
  if (corners.some((corner) => Math.abs(corner[1] - middle) >= tall)) {
    throw new Error('The hop is too low for the rope to pass under the feet.');
  }
  const deep = Math.max(
    ...corners.map((corner) => Math.abs(corner[2] - centre) / (1 - Math.abs((corner[1] - middle) / tall) ** LOOP_POWER) ** (1 / LOOP_POWER)),
  );

  const turn = TURNS_PER_CYCLE * 2 * Math.PI * ropeSkip.cyclesPerSecond * seconds;
  const far: Point = [0, middle - tall * swell(Math.cos(turn)), centre - deep * swell(Math.sin(turn))];
  const left = inPelvis(body.sockets.handLeft.joint, body.sockets.handLeft.at);
  const right = inPelvis(body.sockets.handRight.joint, body.sockets.handRight.at);
  return {
    joint: 'pelvis',
    points: [left, [side, left[1], left[2]], [side, far[1], far[2]], [-side, far[1], far[2]], [-side, right[1], right[2]], right],
    thickness: THICKNESS,
  };
}
