import type { Outfit } from './outfits';

/** A shepherd: a short-sleeved wool top, brown trousers and shoes. */
export const shepherd: Outfit = {
  paint: {
    chest: 'top',
    waist: 'top',
    upperArms: 'top',
    hips: 'bottom',
    thighs: 'bottom',
    shins: 'bottom',
    feet: 'shoes',
  },
  colors: { top: 0xd9c7a0, bottom: 0x8a6a48, shoes: 0x5b3a27 },
};
