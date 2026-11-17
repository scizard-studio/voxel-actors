import { between, mirrored, type Box } from '../../model.js';
import type { Outfit } from './outfits.js';

const SKIRT_TIERS = 9;
const DRAPE_TIERS = 7;
const FABRIC_EDGE = 0.24;
const THREAD_DEPTH = 0.04;
const NECKLINE_DROP = 0.65;
const WAIST_SEAM_OVERLAP = 0.18;
const WAIST_SEAM_CLEARANCE = 0.12;

export const bridalGown: Outfit = {
  paint: {},
  colors: { top: 0xf6edda, clothShade: 0xe4d7bd, cape: 0xefe4cf, trim: 0xcab68d },
  build({ proportions: { chest, waist, pelvis, leg, arm } }) {
    const legHeight = leg.upper + leg.shin + leg.foot;
    const hem = -legHeight + 0.28;
    const tierHeight = (pelvis[1] - hem) / SKIRT_TIERS;
    const skirtHalfWidth = Math.max(pelvis[0], leg.gap + 2 * leg.wide, waist[0] + 2 * WAIST_SEAM_CLEARANCE) / 2;
    const skirtHalfDepth = Math.max(pelvis[2], leg.deep + leg.toe, waist[2] + 2 * WAIST_SEAM_CLEARANCE) / 2;
    const skirt: Box[] = [];
    for (let tier = 0; tier < SKIRT_TIERS; tier++) {
      const flare = 1 - tier / (SKIRT_TIERS - 1);
      const bottom = hem + tier * tierHeight;
      const top = hem + (tier + 1) * tierHeight;
      const side = skirtHalfWidth + FABRIC_EDGE + 1.35 * flare;
      const front = skirtHalfDepth + FABRIC_EDGE + 1.8 * flare;
      // The top tier covers the bottom of the waist instead of sharing its seam plane.
      const skirtTop = tier === SKIRT_TIERS - 1 ? top + WAIST_SEAM_OVERLAP : top;
      skirt.push(between([-side, bottom, -front], [side, skirtTop, front], 'top'));

      // Two stepped wraps cross the skirt at different heights.
      const wrapStep = tier % 4;
      const wrapInner = side * (0.63 - wrapStep * 0.36);
      const wrapOuter = side - FABRIC_EDGE;
      const wrap = between([wrapInner, bottom, front], [wrapOuter, top, front + 0.34], 'clothShade');
      skirt.push(tier >= 5 ? mirrored(wrap) : wrap);
      const stitch = between([wrapOuter - 0.42, bottom + tierHeight * 0.32, front + 0.34],
        [wrapOuter - 0.22, bottom + tierHeight * 0.49, front + 0.34 + THREAD_DEPTH], 'trim');
      skirt.push(tier >= 5 ? mirrored(stitch) : stitch);
    }

    const chestSide = chest[0] / 2 + FABRIC_EDGE;
    const chestFront = chest[2] / 2 + FABRIC_EDGE;
    const shoulder = waist[1] + chest[1];
    const bodiceHeight = chest[1] - Math.min(NECKLINE_DROP, chest[1] * 0.24);
    const bodiceTop = waist[1] + bodiceHeight;
    const upper: Box[] = [
      between([-waist[0] / 2 - FABRIC_EDGE, 0, -waist[2] / 2 - FABRIC_EDGE],
        [waist[0] / 2 + FABRIC_EDGE, waist[1], waist[2] / 2 + FABRIC_EDGE], 'top'),
      between([-chestSide, waist[1], -chestFront], [chestSide, bodiceTop, chestFront], 'top'),
      between([-chestSide, waist[1], chestFront], [chestSide, waist[1] + 0.28, chestFront + 0.07], 'clothShade'),
    ];
    for (const [row, spread] of [0.46, 0.32, 0.24, 0.29, 0.4, 0.5].entries()) {
      const y = waist[1] + (bodiceHeight - 0.23) * (0.21 + row * 0.115);
      const x = chestSide * spread;
      const stitch = between([x, y, chestFront], [x + 0.24, y + 0.23, chestFront + THREAD_DEPTH], 'trim');
      upper.push(stitch, mirrored(stitch));
    }

    const drapeBottom = hem - pelvis[1] + legHeight * 0.24;
    const drapeLength = shoulder - drapeBottom;
    for (let tier = 0; tier < DRAPE_TIERS; tier++) {
      const flare = 1 - tier / (DRAPE_TIERS - 1);
      const bottom = drapeBottom + drapeLength * tier / DRAPE_TIERS;
      const top = drapeBottom + drapeLength * (tier + 1) / DRAPE_TIERS;
      const outer = chestSide + arm.thick * 0.65 + flare * 1.25;
      const inner = tier === DRAPE_TIERS - 1 ? chestSide - 0.35 : outer - 0.64;
      const back = -chestFront - 1.1 - flare * 1.55;
      const front = tier === DRAPE_TIERS - 1 ? chestFront - 0.12 : back + 0.88;
      const panel = between([inner, bottom, back], [outer, top + (tier === DRAPE_TIERS - 1 ? 0.14 : 0), front], 'cape');
      upper.push(panel, mirrored(panel));
    }
    return [{ joint: 'pelvis', boxes: skirt }, { joint: 'waist', boxes: upper }];
  },
};
