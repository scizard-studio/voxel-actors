import type { Outfit } from './outfits';

/** A religious leader: one deep color from neck to ankles, long sleeves, and dark shoes. It fits every religion. */
export const religiousLeader: Outfit = {
  paint: {
    chest: 'top',
    waist: 'top',
    upperArms: 'top',
    forearms: 'top',
    hips: 'top',
    thighs: 'top',
    shins: 'top',
    feet: 'shoes',
  },
  colors: { top: 0x6b2e3a, shoes: 0x2a2424 },
};
