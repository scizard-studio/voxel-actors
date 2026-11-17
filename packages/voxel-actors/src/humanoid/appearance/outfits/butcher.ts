import type { Outfit } from './outfits.js';

/** A butcher: a white short-sleeved top, a dark red apron down to the knees, and tall boots. */
export const butcher: Outfit = {
  paint: {
    chest: 'top',
    upperArms: 'top',
    waist: 'bottom',
    hips: 'bottom',
    thighs: 'bottom',
    shins: 'bottom',
  },
  colors: { top: 0xf2efe6, bottom: 0x8e3b3b },
};
