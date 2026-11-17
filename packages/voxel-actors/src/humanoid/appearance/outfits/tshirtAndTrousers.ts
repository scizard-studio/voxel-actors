import type { Outfit } from './outfits.js';

/** A short-sleeved t-shirt, long trousers and shoes. */
export const tshirtAndTrousers: Outfit = {
  paint: { chest: 'top', waist: 'top', upperArms: 'top', hips: 'bottom', thighs: 'bottom', shins: 'bottom', feet: 'shoes' },
  colors: { top: 0xe8dcc0, bottom: 0x5f7a8c, shoes: 0x6b4a36 },
};
