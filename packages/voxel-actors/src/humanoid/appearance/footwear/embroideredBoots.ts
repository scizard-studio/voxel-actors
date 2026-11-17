import type { Body } from '../../body.js';
import { between, mirrored, type Box, type Worn } from '../../model.js';

const BOOT_EDGE = 0.16;
const EMBROIDERY_PIXEL = 0.22;
const EMBROIDERY = ['.p.', 'ppp', '.p.', 'gg.'];

export function embroideredBoots({ proportions: { leg } }: Body): readonly Worn[] {
  const legHalf = leg.wide / 2;
  const legDepth = leg.deep / 2;
  const bootTop = -leg.shin * 0.32;
  const ankle = -leg.shin;
  const sole = ankle - leg.foot;
  const bootFront = legDepth + BOOT_EDGE;
  const boots: Box[] = [
    between([-legHalf - BOOT_EDGE, ankle, -bootFront], [legHalf + BOOT_EDGE, bootTop, bootFront], 'shoes'),
    between([-legHalf - BOOT_EDGE, sole, -bootFront], [legHalf + BOOT_EDGE, ankle, bootFront + leg.toe], 'shoes'),
  ];
  const embroideryPixel = Math.min(EMBROIDERY_PIXEL, (bootTop - ankle) / 5);
  const motifTop = (bootTop + ankle) / 2 + embroideryPixel * EMBROIDERY.length / 2;
  for (const [row, line] of EMBROIDERY.entries()) {
    for (const [column, pixel] of [...line].entries()) {
      if (pixel === '.') continue;
      const left = (column - line.length / 2) * embroideryPixel;
      const bottom = motifTop - (row + 1) * embroideryPixel;
      boots.push(between([left, bottom, bootFront], [left + embroideryPixel, bottom + embroideryPixel, bootFront + 0.04],
        pixel === 'p' ? 'bootPetal' : 'bootLeaf'));
    }
  }
  return [
    { joint: 'kneeLeft', boxes: boots },
    { joint: 'kneeRight', boxes: boots.map(mirrored) },
  ];
}
