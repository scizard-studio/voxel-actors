import type { Outfit } from './outfits.js';

/** A porter: a brown vest with short sleeves, grey trousers, shoes and a peaked cap. */
export const porter: Outfit = {
  paint: {
    chest: 'top',
    waist: 'top',
    upperArms: 'top',
    hips: 'bottom',
    thighs: 'bottom',
    shins: 'bottom',
  },
  hat: 'peakedCap',
  colors: { top: 0x8a5a3b, bottom: 0x7a7a7a, hat: 0x6b4a2e, hatBand: 0x4a3a2e },
};
