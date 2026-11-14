import type { Outfit } from './outfits';

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
    feet: 'shoes',
  },
  colors: { top: 0x8cc7b8, bottom: 0x6fae9f, shoes: 0xb0b8b4 },
};
