import type { Corner, Turns } from '../core/model.js';
import type { PoseLayer } from '../core/layers.js';
import type { JointName } from '../humanoid/skeleton.js';
import type { EquipmentHand, EquipmentItem } from './equipment.js';

export interface EquipmentAction {
  readonly label: string;
  readonly duration: number;
  bind(hand: EquipmentHand): {
    readonly joints: readonly JointName[];
    sample(progress: number): Turns;
  };
}

export type UseResult = 'started' | 'no-action' | 'busy';
type ActiveAction = ReturnType<EquipmentAction['bind']> & { start: number; duration: number };

/** Owns equipped items and active actions for one character. Times are in seconds. */
export function createEquipmentActions() {
  const equipped = new Map<EquipmentHand, EquipmentItem>();
  const active = new Map<EquipmentHand, ActiveAction>();
  const overlaps = (a: readonly string[], b: readonly string[]) => a.some(joint => b.includes(joint));

  function discardFinished(seconds: number): void {
    for (const [hand, action] of active) {
      if (seconds >= action.start + action.duration) active.delete(hand);
    }
  }

  return {
    equip(hand: EquipmentHand, item: EquipmentItem | null): void {
      if (item && !item.hands.includes(hand)) throw new Error(`${item.label} cannot be equipped in ${hand}.`);
      if ((equipped.get(hand) ?? null) === item) return;
      if (item) equipped.set(hand, item);
      else equipped.delete(hand);
      active.delete(hand);
    },
    use(hand: EquipmentHand, seconds: number, reservedJoints: readonly string[] = []): UseResult {
      discardFinished(seconds);
      const action = equipped.get(hand)?.action;
      if (!action) return 'no-action';
      if (!(action.duration > 0 && Number.isFinite(action.duration))) throw new Error('Action duration must be positive and finite.');
      const bound = action.bind(hand);
      if (active.has(hand) || overlaps(bound.joints, reservedJoints)
        || [...active.values()].some(other => overlaps(other.joints, bound.joints))) return 'busy';
      active.set(hand, { joints: [...bound.joints], sample: progress => bound.sample(progress), start: seconds, duration: action.duration });
      return 'started';
    },
    layersAt(seconds: number, reservedJoints: readonly string[] = []): PoseLayer[] {
      discardFinished(seconds);
      const layers: PoseLayer[] = [];
      for (const [hand, action] of active) {
        if (overlaps(action.joints, reservedJoints)) {
          active.delete(hand);
          continue;
        }
        const progress = (seconds - action.start) / action.duration;
        if (progress < 0) continue;
        const weight = Math.min(1, progress / 0.2, (1 - progress) / 0.25);
        layers.push({ joints: action.joints, pose: { lift: 0, turns: action.sample(progress) }, weight });
      }
      return layers;
    },
  };
}

/** A single-arm action with evenly spaced joint poses. Right side is authored; left mirrors it. */
export function armAction(
  label: string,
  duration: number,
  frames: readonly (readonly [shoulder: Corner, elbow: Corner])[],
): EquipmentAction {
  if (frames.length === 0) throw new Error('An arm action needs at least one pose.');
  return {
    label, duration,
    bind(hand) {
      const left = hand === 'handLeft';
      const shoulder = left ? 'shoulderLeft' : 'shoulderRight';
      const elbow = left ? 'elbowLeft' : 'elbowRight';
      return {
        joints: [shoulder, elbow],
        sample(progress) {
          const position = Math.min(1, Math.max(0, progress)) * (frames.length - 1);
          const index = Math.floor(position);
          const from = frames[index];
          const to = frames[Math.min(index + 1, frames.length - 1)];
          const fraction = position - index;
          const turn = (axis: 0 | 1, component: 0 | 1 | 2) =>
            (from[axis][component] + (to[axis][component] - from[axis][component]) * fraction)
            * (left && component !== 0 ? -1 : 1);
          return {
            [shoulder]: [turn(0, 0), turn(0, 1), turn(0, 2)],
            [elbow]: [turn(1, 0), turn(1, 1), turn(1, 2)],
          };
        },
      };
    },
  };
}
