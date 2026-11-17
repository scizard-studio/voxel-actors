import type { FaceArea } from '../../body.js';
import type { Box } from '../../model.js';
import { EYE_MASK, faceLayout, LAYER } from './layout.js';

export function createSmallNose(area: FaceArea): readonly Box[] {
  const { unit, center, top } = faceLayout(area);
  const step = unit * 2 / 3;
  const base = top - EYE_MASK.length * unit - step;
  return [
    { at: [center, base, area.front], size: [2 * step, step, LAYER], role: 'nose' },
    { at: [center + step, base + step, area.front], size: [step, 2 * step, LAYER], role: 'nose' },
  ];
}
