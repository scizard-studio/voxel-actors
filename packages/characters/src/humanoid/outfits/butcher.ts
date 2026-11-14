import type { Outfit } from './outfits';

/** A butcher: a white short-sleeved top, a dark red apron down to the knees, and tall boots. */
export const butcher: Outfit = {
  paint: {
    chest: 'top',
    upperArms: 'top',
    waist: 'bottom',
    hips: 'bottom',
    thighs: 'bottom',
    shins: 'shoes',
    feet: 'shoes',
  },
  colors: { top: 0xf2efe6, bottom: 0x8e3b3b, shoes: 0x2a2424 },
};
