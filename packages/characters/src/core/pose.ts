import { groundLift } from './kinematics';
import type { Rig, Turns } from './model';

/**
 * How a creature is posed at one moment: how much each joint is turned, and
 * how far the whole body is lifted, in voxels.
 */
export interface Pose {
  readonly lift: number;
  readonly turns: Turns;
}

/**
 * One joint swinging back and forth around one axis:
 * `base + size * sin(cycle + phase)`. With `oneWay`, it swings to one side
 * and rests at `base` for the other half, as a knee bends only one way.
 */
export interface Swing<J extends string = string> {
  readonly joint: J;
  readonly axis: 0 | 1 | 2;
  readonly size: number;
  readonly base?: number;
  readonly phase?: number;
  readonly oneWay?: boolean;
}

/**
 * A motion: joints swinging together, a bob of the whole body, at a pace.
 * Only angles on named joints, so one clip moves every body with those joints.
 */
export interface Clip<J extends string = string> {
  readonly cyclesPerSecond: number;
  readonly swings: readonly Swing<J>[];
  /** How high the body bobs, in voxels. It bobs twice a cycle, once for each step. */
  readonly bob?: number;
  /** The body is lowered or raised to keep its lowest point on the ground, as when crouching or kneeling. */
  readonly grounded?: boolean;
}

// The axes a swing turns around. Around x, a positive turn swings a hanging limb backward. Around z,
// it swings it out toward +x.
export const X = 0;
export const Y = 1;
export const Z = 2;

type Writable = Record<string, [number, number, number]>;

/** The pose of a clip alone, `seconds` into it, on no body in particular. Clips loop for ever. */
export function clipPose(clip: Clip, seconds: number): Pose {
  const cycle = 2 * Math.PI * clip.cyclesPerSecond * seconds;
  const turns: Writable = {};
  for (const swing of clip.swings) {
    const wave = Math.sin(cycle + (swing.phase ?? 0));
    const amount = (swing.base ?? 0) + swing.size * (swing.oneWay ? Math.max(0, wave) : wave);
    const turn = (turns[swing.joint] ??= [0, 0, 0]);
    turn[swing.axis] += amount;
  }
  return { lift: (clip.bob ?? 0) * Math.abs(Math.cos(cycle)), turns };
}

/** A pose laid over the way a body stands at rest: the posture's turns are added to the pose's. */
export function withPosture(pose: Pose, posture: Turns): Pose {
  const turns: Writable = {};
  for (const [joint, turn] of Object.entries(posture)) turns[joint] = [...turn];
  for (const [joint, turn] of Object.entries(pose.turns)) {
    const sum = (turns[joint] ??= [0, 0, 0]);
    turn.forEach((amount, axis) => (sum[axis] += amount));
  }
  return { lift: pose.lift, turns };
}

/**
 * A pose part of the way from one pose to another: 0 is all `from`, 1 all
 * `to`. A joint turned in only one of them is taken as unturned in the other.
 */
export function blendPoses(from: Pose, to: Pose, weight: number): Pose {
  const turns: Writable = {};
  for (const joint of new Set([...Object.keys(from.turns), ...Object.keys(to.turns)])) {
    const a = from.turns[joint] ?? [0, 0, 0];
    const b = to.turns[joint] ?? [0, 0, 0];
    turns[joint] = [0, 1, 2].map((axis) => a[axis] + (b[axis] - a[axis]) * weight) as [number, number, number];
  }
  return { lift: from.lift + (to.lift - from.lift) * weight, turns };
}

/**
 * A pose laid on a rig: over the way it stands at rest, and stood on the
 * ground as far as `grounded` says, from 0 for not at all to 1 for fully.
 * Grounded at all, nothing sinks into the ground: the body is raised fully
 * where it must be, and lowered onto the ground only as far as `grounded` says,
 * so it glides down into a crouch and back up out of it.
 */
export function onRig(pose: Pose, rig: Rig, grounded: number): Pose {
  const placed = withPosture(pose, rig.posture);
  if (grounded === 0) return placed;
  const lift = groundLift(rig, placed.turns);
  return { ...placed, lift: placed.lift + (lift > 0 ? lift : grounded * lift) };
}

/**
 * The pose of a clip at a moment, `seconds` into it. Given a rig, the clip is
 * laid on it: over its own posture, and on the ground if the clip is grounded.
 */
export function poseOf(clip: Clip, seconds: number, rig?: Rig): Pose {
  const pose = clipPose(clip, seconds);
  return rig === undefined ? pose : onRig(pose, rig, clip.grounded ? 1 : 0);
}
