import type { Body } from '../../body';
import { hulaHoop } from './index';

/**
 * A hoop lying flat around the hips at one moment: the middle of the ring,
 * measured from the pelvis pivot, the radius to the middle of its tube, and
 * how thick the tube is, in voxels.
 */
export interface Hoop {
  readonly joint: 'pelvis';
  readonly center: readonly [number, number, number];
  readonly radius: number;
  readonly thickness: number;
}

// The hoop's tube is this thick, and its middle swings this far round the hips as it spins.
const THICKNESS = 1;
const SWING = 1;
// It keeps at least this far from the body, the hair and anything worn, in voxels, and is this much
// wider again, so it hangs loose round the hips.
const CLEARANCE = 0.3;
const SLACK = 1;
// It rides this share of the way up the hips: a little below their middle, clear of long hair
// falling down the back.
const RIDE = 0.4;

/**
 * Where a hula hoop is, `seconds` into the `hulaHoop` clip on this body:
 * round the hips, swinging round them once a cycle, the other way to the
 * upper body's lean, and wide enough never to touch them or the body above
 * them, even where the waist is wider than the hips.
 */
export function hoopAt(body: Body, seconds: number): Hoop {
  const hips = body.parts.find((part) => part.name === 'pelvis')?.boxes[0];
  const above = body.parts.find((part) => part.name === 'torso')?.boxes ?? [];
  if (hips === undefined) throw new Error('The body has no hips.');
  const reach = Math.max(...[hips, ...above].map((box) => Math.hypot(box.size[0] / 2, box.size[2] / 2)));
  const height = hips.size[1];
  const turn = 2 * Math.PI * hulaHoop.cyclesPerSecond * seconds;
  return {
    joint: 'pelvis',
    center: [SWING * Math.cos(turn), hips.at[1] + height * RIDE, -SWING * Math.sin(turn)],
    radius: reach + SWING + CLEARANCE + SLACK + THICKNESS / 2,
    thickness: THICKNESS,
  };
}
