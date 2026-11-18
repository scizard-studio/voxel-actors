import { expect, it } from 'vitest';
import { bodyRegions, createBody, type Age, type Gender } from '../packages/voxel-actors/src';

const ages: readonly Age[] = ['child', 'teen', 'adult', 'elder', 'aged'];
const genders: readonly Gender[] = ['female', 'male'];

// Check region names and box sizes so outfits and Anatomy can use every body preset.
it('builds every body preset with known regions and valid box sizes', () => {
  const expectedRegions = new Set(Object.keys(bodyRegions));
  for (const age of ages) {
    for (const gender of genders) {
      const boxes = createBody({ age, gender }).parts.flatMap(part => part.boxes);
      const preset = `${age} ${gender}`;
      expect(new Set(boxes.map(box => box.region)), preset).toEqual(expectedRegions);
      for (const box of boxes) {
        expect(box.size.every(size => Number.isFinite(size) && size > 0), `${preset}: ${box.region}`).toBe(true);
      }
    }
  }
});

// Reject a negative leg length before it can create broken body geometry.
it('rejects a negative upper leg length', () => {
  expect(() => createBody({
    age: 'adult',
    gender: 'female',
    proportions: { leg: { upper: -1 } },
  })).toThrow(/leg\.upper must be an integer of at least 1 voxels/);
});
