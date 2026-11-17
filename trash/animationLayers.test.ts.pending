import { expect, it } from 'vitest';
import { carryArms, createBody, createMotion } from '../packages/voxel-actors/src';

it('blends both carrying arms without changing the walk cycle, waist or lift', () => {
  const body = createBody({ age: 'adult', gender: 'female' });
  const walk = createMotion('walk');
  const hold = carryArms();
  for (const time of [0.1, 0.3, 0.7]) {
    const base = walk.poseAt(time, body);
    const layered = walk.poseAt(time, body, [hold]);
    const halfway = walk.poseAt(time, body, [carryArms(0.5)]);
    expect(layered.lift).toBe(base.lift);
    for (const [joint, turn] of Object.entries(base.turns)) {
      if (hold.joints.includes(joint)) {
        expect(layered.turns[joint]).toEqual(hold.pose.turns[joint]);
        turn.forEach((angle, axis) => expect(halfway.turns[joint][axis])
          .toBeCloseTo((angle + hold.pose.turns[joint][axis]) / 2));
      } else {
        expect(layered.turns[joint]).toEqual(turn);
      }
    }
    expect(walk.poseAt(time, body, [carryArms(0)])).toEqual(base);
  }
});
