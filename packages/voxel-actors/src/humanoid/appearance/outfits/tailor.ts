import type { Outfit } from './outfits.js';

/** A tailor: a long-sleeved purple top, dark trousers and shoes. */
export const tailor: Outfit = {
  paint: {
    chest: 'top',
    waist: 'top',
    upperArms: 'top',
    forearms: 'top',
    hips: 'bottom',
    thighs: 'bottom',
    shins: 'bottom',
    feet: 'shoes',
  },
  colors: { top: 0x6a4c8c, bottom: 0x2e2a3a, shoes: 0x3a3330 },
};
