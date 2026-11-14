import type { Outfit } from './outfits';

/** A cook: a long-sleeved white jacket, black trousers, dark shoes and a black soft cap. */
export const cook: Outfit = {
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
  colors: { top: 0xf6f6f2, bottom: 0x2a2a2a, shoes: 0x2a2424, hat: 0x2a2a2a },
};
