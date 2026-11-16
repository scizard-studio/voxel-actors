import type { Box, Corner } from './model';

type Solid = Pick<Box, 'at' | 'size'>;

export interface SolidMeasurements {
  readonly boxCount: number;
  readonly min: Corner;
  readonly max: Corner;
  readonly size: Corner;
  readonly center: Corner;
  /** Union volume in unit-voxel cubes, not box count or bounding-box volume. */
  readonly voxelVolume: number;
}

/** Exact axis-aligned union. Overlapping boxes contribute occupied volume once. */
export function measureSolids(boxes: readonly Solid[]): SolidMeasurements {
  for (const box of boxes) {
    if (box.at.length !== 3 || box.size.length !== 3 || !box.at.every(Number.isFinite) || !box.size.every(value => Number.isFinite(value) && value > 0)) {
      throw new Error('Solid coordinates must be finite and dimensions must be positive.');
    }
  }
  if (!boxes.length) return { boxCount: 0, min: [0, 0, 0], max: [0, 0, 0], size: [0, 0, 0], center: [0, 0, 0], voxelVolume: 0 };
  const cuts = (items: readonly Solid[], axis: number): number[] => [...new Set(items.flatMap(box => [box.at[axis], box.at[axis] + box.size[axis]]))].sort((a, b) => a - b);
  const xs = cuts(boxes, 0);
  let volume = 0;
  for (let x = 0; x < xs.length - 1; x++) {
    const slice = boxes.filter(box => box.at[0] < xs[x + 1] && box.at[0] + box.size[0] > xs[x]);
    const ys = cuts(slice, 1);
    let area = 0;
    for (let y = 0; y < ys.length - 1; y++) {
      const intervals = slice.filter(box => box.at[1] < ys[y + 1] && box.at[1] + box.size[1] > ys[y])
        .map(box => [box.at[2], box.at[2] + box.size[2]]).sort((a, b) => a[0] - b[0]);
      let length = 0;
      let end = -Infinity;
      for (const [start, next] of intervals) {
        length += Math.max(0, next - Math.max(start, end));
        end = Math.max(end, next);
      }
      area += length * (ys[y + 1] - ys[y]);
    }
    volume += area * (xs[x + 1] - xs[x]);
  }
  const min = [0, 1, 2].map(axis => Math.min(...boxes.map(box => box.at[axis]))) as unknown as Corner;
  const max = [0, 1, 2].map(axis => Math.max(...boxes.map(box => box.at[axis] + box.size[axis]))) as unknown as Corner;
  return {
    boxCount: boxes.length, min, max,
    size: [max[0] - min[0], max[1] - min[1], max[2] - min[2]],
    center: [(max[0] + min[0]) / 2, (max[1] + min[1]) / 2, (max[2] + min[2]) / 2],
    voxelVolume: volume,
  };
}
