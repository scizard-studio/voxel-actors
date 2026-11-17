import type { Outfit } from './outfits.js';

/** A baker: a long-sleeved white jacket, grey trousers, dark shoes and a tall white chef hat. */
export const baker: Outfit = {
  paint: {
    chest: 'top',
    waist: 'top',
    upperArms: 'top',
    forearms: 'top',
    hips: 'bottom',
    thighs: 'bottom',
    shins: 'bottom',
  },
  hat: 'chefHat',
  colors: { top: 0xfbf8f2, bottom: 0x8c8c8c, hat: 0xfbf8f2 },
};
