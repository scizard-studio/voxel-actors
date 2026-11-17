import type { Outfit } from './outfits.js';

/** A miller: dusted white with flour, top to toe, long sleeves, and a soft cap. */
export const miller: Outfit = {
  paint: {
    chest: 'top',
    waist: 'top',
    upperArms: 'top',
    forearms: 'top',
    hips: 'bottom',
    thighs: 'bottom',
    shins: 'bottom',
  },
  hat: 'softCap',
  colors: { top: 0xece6d8, bottom: 0xd8cfbd, hat: 0xf4f0e6 },
};
