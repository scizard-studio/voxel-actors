import type { Outfit } from './outfits.js';

/** A tavern keeper: a short-sleeved brown top, dark trousers and shoes. */
export const tavernKeeper: Outfit = {
  paint: {
    chest: 'top',
    waist: 'top',
    upperArms: 'top',
    hips: 'bottom',
    thighs: 'bottom',
    shins: 'bottom',
  },
  colors: { top: 0x7a4a2a, bottom: 0x33302c },
};
