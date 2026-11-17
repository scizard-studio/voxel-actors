import type { Outfit } from './outfits.js';

/** A farmer: a red shirt under blue overalls, boots and a straw hat. */
export const farmer: Outfit = {
  paint: { chest: 'top', upperArms: 'top', waist: 'bottom', hips: 'bottom', thighs: 'bottom', shins: 'bottom' },
  hat: 'strawHat',
  colors: { top: 0xc0503a, bottom: 0x4f6f9a, hat: 0xe3c27a, hatBand: 0x8a5a2b },
};
