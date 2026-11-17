import type { Outfit } from './outfits.js';

/** A herbalist: a short-sleeved light green top, green trousers and shoes. */
export const herbalist: Outfit = {
  paint: {
    chest: 'top',
    waist: 'top',
    upperArms: 'top',
    hips: 'bottom',
    thighs: 'bottom',
    shins: 'bottom',
  },
  colors: { top: 0x9cc48a, bottom: 0x6f8f5a },
};
