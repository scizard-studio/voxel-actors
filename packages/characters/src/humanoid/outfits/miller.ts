import type { Outfit } from './outfits';

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
    feet: 'shoes',
  },
  hat: 'softCap',
  colors: { top: 0xece6d8, bottom: 0xd8cfbd, shoes: 0x7a6a5a, hat: 0xf4f0e6 },
};
