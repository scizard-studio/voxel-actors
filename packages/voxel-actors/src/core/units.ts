/** Integration metadata; generation itself always uses local voxel units. */
export interface VoxelScale {
  readonly voxelsPerCell: number;
  readonly metresPerCell: number;
}

export const CHARACTER_SCALE: VoxelScale = Object.freeze({ voxelsPerCell: 64, metresPerCell: 3 });

function validate(scale: VoxelScale): void {
  if (!Number.isFinite(scale.voxelsPerCell) || scale.voxelsPerCell <= 0 || !Number.isFinite(scale.metresPerCell) || scale.metresPerCell <= 0) {
    throw new Error('Voxel scale requires positive finite voxelsPerCell and metresPerCell.');
  }
}

export function metresPerVoxel(scale: VoxelScale): number {
  validate(scale);
  return scale.metresPerCell / scale.voxelsPerCell;
}

/** Multiply source coordinates by this factor to express them in target units. */
export function voxelScaleFactor(source: VoxelScale, target: VoxelScale): number {
  return metresPerVoxel(source) / metresPerVoxel(target);
}
