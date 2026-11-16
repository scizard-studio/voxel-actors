import type { FaceArea } from '../body';
import type { Box } from '../model';
import { faceLayout, LAYER } from './layout';

export function createFlatBrows(area: FaceArea): readonly Box[] {
  const { unit, center, top, halfSpacing } = faceLayout(area);
  return [-1, 1].map((side): Box => ({
    at: [center + side * halfSpacing - 2 * unit, top + 2 * unit, area.front],
    size: [4 * unit, unit, LAYER],
    role: 'brow',
  }));
}
