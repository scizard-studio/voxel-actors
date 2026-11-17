import { between, mirrored } from '../../model.js';
import type { Outfit } from './outfits.js';

const BODICE_OVERHANG = 0.22;
const SLEEVE_GAP = 0.03;

export const frock: Outfit = {
  paint: { waist: 'top', hips: 'top', feet: 'shoes', handLeft: 'top', handRight: 'top' },
  hat: 'roseCrown',
  colors: { top: 0xc91c24, clothShade: 0x991721, shoes: 0xad1620 },
  build({ proportions: { arm, chest, waist, pelvis, leg } }) {
    const bodiceTop = waist[1] + chest[1] * 0.76;
    const halfChest = chest[0] / 2;
    const chestFront = chest[2] / 2;
    const strap = between([halfChest * 0.6, bodiceTop, -chestFront - 0.17],
      [halfChest + BODICE_OVERHANG, waist[1] + chest[1] + 0.12, chestFront + 0.17], 'top');
    const bodice = [
      between([-halfChest - BODICE_OVERHANG, waist[1], -chestFront - BODICE_OVERHANG],
        [halfChest + BODICE_OVERHANG, bodiceTop, chestFront + BODICE_OVERHANG], 'top'),
      strap,
      mirrored(strap),
    ];

    const hem = -leg.upper * 0.83;
    const skirt = [];
    const tierCount = 3;
    const tierHeight = (pelvis[1] - hem) / tierCount;
    for (let tier = 0; tier < tierCount; tier++) {
      const flare = 1 - tier / (tierCount - 1);
      const halfWidth = Math.max(pelvis[0], leg.gap + 2 * leg.wide) / 2 + 0.25 + flare;
      const halfDepth = Math.max(pelvis[2], leg.deep) / 2 + 0.25 + 0.85 * flare;
      const bottom = hem + tier * tierHeight;
      const top = bottom + tierHeight;
      skirt.push(between([-halfWidth, bottom, -halfDepth], [halfWidth, top, halfDepth], 'top'));
      for (const x of [-halfWidth / 2, 0, halfWidth / 2]) {
        skirt.push(between([x - 0.07, bottom, halfDepth], [x + 0.07, top, halfDepth + 0.06], 'clothShade'));
      }
    }

    const armHalf = arm.thick / 2;
    const sleeve = between([-armHalf + BODICE_OVERHANG + SLEEVE_GAP, armHalf - arm.upper * 0.43, -armHalf - 0.2],
      [armHalf + 0.15, armHalf + 0.18, armHalf + 0.2], 'top');
    return [
      { joint: 'waist', boxes: bodice },
      { joint: 'pelvis', boxes: skirt },
      { joint: 'shoulderLeft', boxes: [sleeve] },
      { joint: 'shoulderRight', boxes: [mirrored(sleeve)] },
    ];
  },
};
