import { between, mirrored, type Box } from '../../model.js';
import type { Outfit } from './outfits.js';

const CLOTH_EDGE = 0.18;
const STITCH_SIZE = 0.2;

export const westernRomper: Outfit = {
  paint: { waist: 'top', hips: 'top' },
  hat: 'cowboy',
  footwear: 'embroideredBoots',
  colors: {
    top: 0x21ad9b,
    bottom: 0xb8f2d8,
    hat: 0xfff8e9,
    hatBand: 0x695043,
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
    return [
      { joint: 'waist', boxes: [...bodice, ...stitching] },
      { joint: 'hipLeft', boxes: [shorts] },
      { joint: 'hipRight', boxes: [mirrored(shorts)] },
    ];
  },
};
