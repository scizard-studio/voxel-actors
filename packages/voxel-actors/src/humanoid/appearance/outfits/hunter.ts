import type { Outfit } from './outfits.js';

/** A hunter: a long-sleeved green top, brown trousers and tall boots. */
export const hunter: Outfit = {
  paint: {
    chest: 'top',
    waist: 'top',
    upperArms: 'top',
    forearms: 'top',
    hips: 'bottom',
    thighs: 'bottom',
    shins: 'shoes',
    feet: 'shoes',
  },
  colors: { top: 0x4f7a3a, bottom: 0x6b4a2e, shoes: 0x3b2a1f },
};
