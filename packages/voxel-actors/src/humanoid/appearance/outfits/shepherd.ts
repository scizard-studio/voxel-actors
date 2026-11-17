import type { Outfit } from './outfits.js';

/** A shepherd: a short-sleeved wool top, brown trousers and shoes. */
export const shepherd: Outfit = {
  paint: {
    chest: 'top',
    waist: 'top',
    upperArms: 'top',
    hips: 'bottom',
    thighs: 'bottom',
    shins: 'bottom',
  },
  colors: { top: 0xd9c7a0, bottom: 0x8a6a48 },
};
