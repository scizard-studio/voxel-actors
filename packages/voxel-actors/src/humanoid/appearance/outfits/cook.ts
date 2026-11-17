import type { Outfit } from './outfits.js';

/** A cook: a long-sleeved white jacket, black trousers, dark shoes and a black soft cap. */
export const cook: Outfit = {
  paint: {
    chest: 'top',
    waist: 'top',
    upperArms: 'top',
    forearms: 'top',
    hips: 'bottom',
    thighs: 'bottom',
    shins: 'bottom',
  },
  hat: 'softCap',
  colors: { top: 0xf6f6f2, bottom: 0x2a2a2a, hat: 0x2a2a2a },
};
