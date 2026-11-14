import type { Outfit } from './outfits';

/** A police uniform: a long-sleeved navy jacket and trousers, black shoes, and a peaked cap. All paint, but for the cap. */
export const policeman: Outfit = {
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
  hat: 'peakedCap',
  colors: { top: 0x2b3f6b, bottom: 0x22304f, shoes: 0x1f1c1c, hat: 0x2b3f6b, hatBand: 0x1f1c1c },
};
