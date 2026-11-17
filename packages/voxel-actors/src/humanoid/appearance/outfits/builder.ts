import type { Outfit } from './outfits.js';

/** A builder: a bright orange top, work trousers, boots and a yellow hard hat. */
export const builder: Outfit = {
  paint: { chest: 'top', waist: 'top', upperArms: 'top', hips: 'bottom', thighs: 'bottom', shins: 'bottom' },
  hat: 'hardHat',
  colors: { top: 0xf08a24, bottom: 0x4a5a6a, hat: 0xf2c230 },
};
