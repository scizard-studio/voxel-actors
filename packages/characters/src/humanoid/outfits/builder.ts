import type { Outfit } from './outfits';

/** A builder: a bright orange top, work trousers, boots and a yellow hard hat. */
export const builder: Outfit = {
  paint: { chest: 'top', waist: 'top', upperArms: 'top', hips: 'bottom', thighs: 'bottom', shins: 'bottom', feet: 'shoes' },
  hat: 'hardHat',
  colors: { top: 0xf08a24, bottom: 0x4a5a6a, shoes: 0x5b3a27, hat: 0xf2c230 },
};
