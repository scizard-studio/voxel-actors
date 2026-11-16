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

export function createWorriedBrows(area: FaceArea): readonly Box[] {
  const { unit, center, top, halfSpacing } = faceLayout(area);
  return [-1, 1].flatMap(side => [0, 1].map((inner): Box => ({
    at: [center + side * halfSpacing + (inner ? -side - 1 : side - 1) * unit,
      top + (2 + inner) * unit, area.front],
    size: [2 * unit, unit, LAYER],
    role: 'brow',
  })));
}
