import { between, mirrored, type Box } from '../../model.js';
import type { Outfit } from './outfits.js';

const CLOTH_EDGE = 0.18;
const STITCH_SIZE = 0.2;
const BOOT_EDGE = 0.16;
const EMBROIDERY_PIXEL = 0.22;
const EMBROIDERY = ['.p.', 'ppp', '.p.', 'gg.'];

export const westernRomper: Outfit = {
  paint: { waist: 'top', hips: 'top', feet: 'shoes' },
  hat: 'cowboy',
  colors: {
    top: 0x21ad9b,
    bottom: 0xb8f2d8,
    shoes: 0xfff8e9,
    hat: 0xfff8e9,
    hatBand: 0x695043,
    trim: 0xef7591,
    cape: 0x5ca96f,
  },
  build({ proportions: { chest, waist, leg } }) {
    const halfChest = chest[0] / 2;
    const chestDepth = chest[2] / 2;
    const front = chestDepth + CLOTH_EDGE;
    const bodiceTop = waist[1] + chest[1] * 0.72;
    const strap = between([halfChest * 0.53, bodiceTop, -chestDepth - 0.12],
      [halfChest * 0.73, waist[1] + chest[1] + 0.1, chestDepth + 0.12], 'top');
    const bodice = [
      between([-halfChest - CLOTH_EDGE, waist[1], -front], [halfChest + CLOTH_EDGE, bodiceTop, front], 'top'),
      strap,
      mirrored(strap),
    ];
    const stitching: Box[] = [];
    for (const [row, y] of [0.2, 0.46, 0.68].entries()) {
      for (const x of [-0.72, -0.24, 0.24, 0.72]) {
        const left = halfChest * (x + row % 2 * 0.1);
        const bottom = waist[1] + chest[1] * y - STITCH_SIZE / 2;
        stitching.push(between([left, bottom, front], [left + STITCH_SIZE, bottom + STITCH_SIZE, front + 0.03], 'bottom'));
      }
    }

    const legHalf = leg.wide / 2;
    const legDepth = leg.deep / 2;
    const shorts = between([-legHalf - 0.08, -leg.upper * 0.54, -legDepth - CLOTH_EDGE],
      [legHalf + 0.08, 0, legDepth + CLOTH_EDGE], 'top');
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
          pixel === 'p' ? 'trim' : 'cape'));
      }
    }
    return [
      { joint: 'waist', boxes: [...bodice, ...stitching] },
      { joint: 'hipLeft', boxes: [shorts] },
      { joint: 'hipRight', boxes: [mirrored(shorts)] },
      { joint: 'kneeLeft', boxes: boots },
      { joint: 'kneeRight', boxes: boots.map(mirrored) },
    ];
  },
};
