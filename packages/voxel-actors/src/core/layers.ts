import type { Pose } from './pose.js';

export interface PoseLayer {
  readonly pose: Pose;
  readonly joints: readonly string[];
  readonly weight: number;
}

/** Apply layers in order. Each layer replaces only its listed joint rotations. */
export function layerPose(base: Pose, layers: readonly PoseLayer[]): Pose {
  const turns = { ...base.turns };
  const neutral = [0, 0, 0] as const;
  for (const { pose, joints, weight } of layers) {
    const amount = Math.min(1, Math.max(0, weight));
    if (amount === 0) continue;
    for (const joint of joints) {
      const from = turns[joint] ?? neutral;
      const to = pose.turns[joint] ?? neutral;
      turns[joint] = amount === 1 ? to : [
        from[0] + (to[0] - from[0]) * amount,
        from[1] + (to[1] - from[1]) * amount,
        from[2] + (to[2] - from[2]) * amount,
      ];
    }
  }
  return { lift: base.lift, turns };
}
