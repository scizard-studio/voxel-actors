import type { FaceArea } from '../body';
import type { Box } from '../model';
import { EYE_MASK, faceLayout } from './layout';

/** Rounded eyes fitted to the face plane, using the study's proportions. */
export function createRoundedEyes(area: FaceArea, lashes: boolean): readonly Box[] {
  const { unit, center, top, halfSpacing } = faceLayout(area);
  const depth = 0.25;
  const boxes: Box[] = [];
  for (const side of [-1, 1]) {
    const left = center + side * halfSpacing - EYE_MASK[0].length * unit / 2;
    for (const [row, line] of EYE_MASK.entries()) {
      for (const [column, pixel] of [...line].entries()) {
        const outerCorner = row === 0 && column === (side < 0 ? 0 : line.length - 1);
        if (pixel === '.' && !(lashes && outerCorner)) continue;
        boxes.push({
          at: [left + column * unit, top - (row + 1) * unit, area.front + 0.01 - depth],
          size: [unit, unit, depth],
          role: pixel === 'R' ? 'eyeIris' : 'eye',
        });
      }
    }
  }
  return boxes;
}
