import { expect, it } from 'vitest';
import { CHARACTER_SCALE, voxelScaleFactor } from '../packages/voxel-actors/src';

// Check the voxel conversion so characters keep their size when brought into a game world.
it('converts 32 character voxels to 4 world voxels', () => {
  const world = { voxelsPerCell: 8, metresPerCell: CHARACTER_SCALE.metresPerCell };
  const heightInCharacterVoxels = 32;
  expect(heightInCharacterVoxels * voxelScaleFactor(CHARACTER_SCALE, world)).toBe(4);
});
