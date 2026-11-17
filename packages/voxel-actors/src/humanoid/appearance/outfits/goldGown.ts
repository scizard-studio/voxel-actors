import type { Box, Role, Worn } from '../../model.js';
import type { Outfit } from './outfits.js';

export const goldGown: Outfit = {
  paint: { feet: 'shoes' },
  colors: { top: 0xe6a01b, clothShade: 0xc78315, cape: 0x205c36, trim: 0xffdf99, shoes: 0x845329 },
  build({ proportions: { chest, waist, pelvis, leg, arm } }): readonly Worn[] {
    const skirt: Box[] = [];
    const upper: Box[] = [];
    const add = (boxes: Box[], role: Role, x: number, y: number, z: number, w: number, h: number, d: number) => {
      boxes.push({ at: [x - w / 2, y, z - d / 2], size: [w, h, d], role });
    };

    const legHeight = leg.upper + leg.shin + leg.foot;
    const bottom = -legHeight + 0.75;
    const tierHeight = (pelvis[1] - bottom) / 8;
    const skirtWidth = Math.max(pelvis[0], leg.gap + 2 * leg.wide);
    const skirtDepth = Math.max(pelvis[2], leg.deep + leg.toe);
    for (let tier = 0; tier < 8; tier++) {
      const flare = 1 - tier / 7;
      const y = bottom + tier * tierHeight;
      const width = skirtWidth + 0.5 + 2 * flare;
      const depth = skirtDepth + 0.5 + (legHeight * 0.55) * flare;
      add(skirt, 'top', 0, y, 0, width, tierHeight, depth);
      for (const x of [-width / 4, 0, width / 4]) {
        add(skirt, 'clothShade', x, y, depth / 2 + 0.04, 0.125, tierHeight, 0.08);
        if (tier === 0) {
          add(skirt, 'trim', x, y + 0.2, depth / 2 + 0.08, 0.55, 0.22, 0.08);
          add(skirt, 'trim', x, y + 0.42, depth / 2 + 0.08, 0.22, 0.3, 0.08);
        }
      }
    }

    add(upper, 'top', 0, -0.2, 0, waist[0] + 0.45, waist[1] + 0.2, waist[2] + 0.45);
    const bodiceDepth = chest[2] + 0.45;
    add(upper, 'top', 0, waist[1], 0, chest[0] + 0.45, chest[1] * 0.8, bodiceDepth);
    for (const side of [-1, 1]) {
      add(upper, 'top', side * chest[0] * 0.35, waist[1] + chest[1] * 0.8, 0,
        chest[0] * 0.13, chest[1] * 0.24, bodiceDepth);
    }
    for (const x of [-chest[0] / 4, 0, chest[0] / 4]) {
      const y = waist[1] + chest[1] * 0.36;
      add(upper, 'trim', x, y, bodiceDepth / 2 + 0.06, 0.9, 0.22, 0.12);
      add(upper, 'trim', x, y - 0.25, bodiceDepth / 2 + 0.06, 0.22, 0.72, 0.12);
    }

    const capeTop = waist[1] + chest[1];
    const capeBottom = bottom - pelvis[1];
    const capeTier = (capeTop - capeBottom) / 8;
    for (let tier = 0; tier < 8; tier++) {
      const flare = 1 - tier / 7;
      const width = chest[0] + arm.thick + 3 * flare;
      const back = -bodiceDepth / 2 - 0.45 - (legHeight * 0.4 + 1) * flare;
      const y = capeBottom + tier * capeTier;
      add(upper, 'cape', 0, y, back, width, capeTier, 1.45);
      for (const side of [-1, 1]) {
        add(upper, 'cape', side * (width / 2 - 0.35), y, back + 1, 0.7, capeTier, 2.2);
      }
    }
    // Shoulder ties and clasp sit over the top edge of the bodice.
    for (const side of [-1, 1]) {
      add(upper, 'cape', side * chest[0] * 0.32, capeTop - 0.3, 0, 0.75, 0.5, bodiceDepth + 0.65);
      add(upper, 'cape', side * chest[0] * 0.32, capeTop - 1.05, bodiceDepth / 2 + 0.15, 0.75, 0.95, 0.3);
    }
    add(upper, 'trim', 0, capeTop - 1.25, bodiceDepth / 2 + 0.14, 0.55, 0.55, 0.28);
    return [{ joint: 'pelvis', boxes: skirt }, { joint: 'waist', boxes: upper }];
  },
};
