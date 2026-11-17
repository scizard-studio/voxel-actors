import type { Outfit } from './outfits.js';

/** A healer: pale teal long sleeves and trousers, and pale shoes. */
export const healer: Outfit = {
  paint: {
    chest: 'top',
    waist: 'top',
    upperArms: 'top',
    forearms: 'top',
    hips: 'bottom',
    thighs: 'bottom',
    shins: 'bottom',
  },
  colors: { top: 0x8cc7b8, bottom: 0x6fae9f },
};
