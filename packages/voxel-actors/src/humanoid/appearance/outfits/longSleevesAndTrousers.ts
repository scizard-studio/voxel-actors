import type { Outfit } from './outfits.js';

/** A long-sleeved top, long trousers and shoes. */
export const longSleevesAndTrousers: Outfit = {
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
  colors: { top: 0x8fb3d9, bottom: 0x4a4038, shoes: 0x3a3330 },
};
