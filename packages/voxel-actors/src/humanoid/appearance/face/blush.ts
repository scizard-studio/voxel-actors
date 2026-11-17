import type { FaceArea } from '../../body.js';
import type { Box } from '../../model.js';
import { EYE_MASK, FACE_SURFACE_OFFSET, faceLayout, LAYER } from './layout.js';

const BLUSH_ROW_WIDTHS = [2, 4, 2];

export function createBlush(area: FaceArea): readonly Box[] {
  const { unit, center, top, halfSpacing } = faceLayout(area);
  const blushTop = top - (EYE_MASK.length + 0.5) * unit;
  const front = area.front + FACE_SURFACE_OFFSET - LAYER;

  return [-1, 1].flatMap((side) =>
    BLUSH_ROW_WIDTHS.map((width, row): Box => ({
      at: [center + side * halfSpacing - width * unit / 2, blushTop - (row + 1) * unit, front],
      size: [width * unit, unit, LAYER],
      role: 'cheek',
    })),
  );
}
