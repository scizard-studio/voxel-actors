import type { Rig } from './model.js';
import { layerPose, type PoseLayer } from './layers.js';
import { blendPoses, clipPose, onRig, type Clip, type Pose } from './pose.js';

/** A change of motion glides over this long, in seconds. */
export const GLIDE_SECONDS = 0.25;

/**
 * What one creature is doing, kept from moment to moment so that changes of
 * motion glide instead of snapping. Each creature has its own.
 */
export interface Motion<N extends string = string> {
  /** The clip being played, or being glided into. */
  readonly clip: N;
  /** Starts another clip at a moment. The body glides from wherever it is into the new clip. */
  play(clip: N, seconds: number): void;
  /** The pose at a moment, laid on the rig if one is given. Moments must not go backward. */
  poseAt(seconds: number, rig?: Rig, layers?: readonly PoseLayer[]): Pose;
  /** True while still gliding into the clip: anything held in the clip's pose is not in place yet. */
  gliding(seconds: number): boolean;
  /** How far into the clip being played, in seconds: what anything moving with the clip keeps time with. */
  elapsed(seconds: number): number;
}

/** Slow at both ends, so a glide neither starts nor stops with a jolt. */
function ease(share: number): number {
  const t = Math.min(Math.max(share, 0), 1);
  return t * t * (3 - 2 * t);
}

/**
 * A motion over a set of clips, starting with `clip` at `seconds`. A new clip
 * always begins from its own start, so a walk begins with a step. The pose
 * held at the moment of a change is glided out of, which also makes a change
 * during a glide smooth.
 */
export function createMotion<N extends string>(clips: Readonly<Record<N, Clip>>, clip: N, seconds = 0): Motion<N> {
  let current = clip;
  let startedAt = seconds;
  // The pose the body was in when the current clip was started, while still gliding out of it, and
  // how far it then stood on the ground, from 0 to 1.
  let leaving: Pose | null = null;
  let leavingGrounded = 0;

  /** How far the body stands on the ground at a moment: gliding from the old clip's way to the new one's. */
  const grounded = (at: number): number => {
    const target = clips[current].grounded ? 1 : 0;
    return leaving === null ? target : leavingGrounded + (target - leavingGrounded) * ease((at - startedAt) / GLIDE_SECONDS);
  };

  const bare = (at: number): Pose => {
    const target = clipPose(clips[current], at - startedAt);
    if (leaving === null) return target;
    const weight = ease((at - startedAt) / GLIDE_SECONDS);
    if (weight >= 1) {
      leaving = null;
      return target;
    }
    return blendPoses(leaving, target, weight);
  };

  return {
    get clip() {
      return current;
    },
    play(next, at) {
      if (next === current) return;
      leavingGrounded = grounded(at);
      leaving = bare(at);
      current = next;
      startedAt = at;
    },
    poseAt(at, rig, layers) {
      const share = grounded(at);
      const base = bare(at);
      const pose = layers?.length ? layerPose(base, layers) : base;
      return rig === undefined ? pose : onRig(pose, rig, share);
    },
    gliding(at) {
      return leaving !== null && at - startedAt < GLIDE_SECONDS;
    },
    elapsed(at) {
      return at - startedAt;
    },
  };
}
