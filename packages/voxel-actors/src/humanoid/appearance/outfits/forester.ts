import type { Outfit } from './outfits.js';

/** A forester: a long-sleeved red top, brown trousers and tall boots. */
export const forester: Outfit = {
  paint: {
    chest: 'top',
    waist: 'top',
    upperArms: 'top',
    forearms: 'top',
    hips: 'bottom',
    thighs: 'bottom',
    shins: 'bottom',
  },
  colors: { top: 0xb03a2e, bottom: 0x6b4a2e },
};
