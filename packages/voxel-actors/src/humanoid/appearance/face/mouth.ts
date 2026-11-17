import type { FaceArea } from '../../body.js';
import type { Box } from '../../model.js';
import { mouthLayout, LAYER } from './layout.js';

export function createOpenSmile(area: FaceArea): readonly Box[] {
  const { step, center, top: mouthTop } = mouthLayout(area);
  const widths = [4, 6, 4, 2];
  return widths.map((columns, row): Box => ({
    at: [center - columns * step / 2, mouthTop - (row + 1) * step, area.front],
    size: [columns * step, step, LAYER],
    role: row === 0 ? 'teeth' : 'mouth',
  }));
}

export function createMouthShapes(area: FaceArea) {
  const { step, center, top } = mouthLayout(area);
  const row = (column: number, level: number, width: number, role: Box['role'] = 'mouth'): Box => ({
    at: [center + column * step, top - (level + 1) * step, area.front],
    size: [width * step, step, LAYER],
    role,
  });
  return {
    line: [row(-2, 0, 4)],
    smile: [row(-3, 0, 1), row(2, 0, 1), row(-2, 1, 4)],
    openSmile: createOpenSmile(area),
    open: [row(-2, 0, 4, 'mouthDark'), row(-1, 1, 2, 'mouthDark')],
    frown: [row(-2, 0, 4), row(-3, 1, 1), row(2, 1, 1)],
  };
}
