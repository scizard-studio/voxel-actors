import type { FaceArea } from '../body';
import type { Box } from '../model';
import { faceLayout, LAYER } from './layout';

export function createOpenSmile(area: FaceArea): readonly Box[] {
  const { unit, center, top } = faceLayout(area);
  const step = unit * 2 / 3;
  const mouthTop = top - 13 * step;
  const widths = [4, 6, 4, 2];
  return widths.map((columns, row): Box => ({
    at: [center - columns * step / 2, mouthTop - (row + 1) * step, area.front],
    size: [columns * step, step, LAYER],
    role: row === 0 ? 'teeth' : 'mouth',
  }));
}
