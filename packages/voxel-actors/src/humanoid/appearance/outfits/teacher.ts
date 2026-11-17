import type { Outfit } from './outfits.js';

/** A teacher: a long-sleeved blue top, dark trousers and shoes. */
export const teacher: Outfit = {
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
  colors: { top: 0x3f6aa8, bottom: 0x3a3a44, shoes: 0x2a2424 },
};
