import { expect, it } from 'vitest';
import { createBody, dress, outfits, type Age, type Gender, type OutfitName } from '../packages/voxel-actors/src';

const ages: readonly Age[] = ['child', 'teen', 'adult', 'elder', 'aged'];
const genders: readonly Gender[] = ['female', 'male'];

// Build every outfit on every preset to catch failures on characters we did not preview.
it('builds every outfit for every age and gender preset', () => {
  const outfitNames = Object.keys(outfits) as OutfitName[];
  for (const age of ages) {
    for (const gender of genders) {
      const body = createBody({ age, gender });
      for (const outfit of outfitNames) {
        expect(() => dress(body, outfit), `${outfit} on ${age} ${gender}`).not.toThrow();
      }
    }
  }
});
