import type { Outfit } from './outfits.js';

/** A storekeeper: a long-sleeved white shirt, dark trousers and shoes. */
export const storekeeper: Outfit = {
  paint: {
    chest: 'top',
    waist: 'top',
    upperArms: 'top',
    forearms: 'top',
    hips: 'bottom',
    thighs: 'bottom',
    shins: 'bottom',
  },
  colors: { top: 0xf2efe6, bottom: 0x2e3440 },
};
