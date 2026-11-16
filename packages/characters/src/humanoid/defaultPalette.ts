import type { Role } from './model';

export const defaultPalette: Readonly<Record<Role, number>> = Object.freeze({
  skin: 0xf6c3a0,
  skinShade: 0xe7a985,
  brow: 0xb87452,
  eye: 0x2b1712,
  eyeIris: 0x7a3f24,
  eyeShine: 0xfff6ea,
  cheek: 0xf29a8e,
  nose: 0xe7a985,
  mouth: 0xe0353d,
  mouthDark: 0x9a2a2f,
  teeth: 0xfffaf3,
  hair: 0x8e5434,
  hat: 0xc99c64,
  hatBand: 0x5b3a27,
  top: 0xe8dcc0,
  bottom: 0xe8dcc0,
  shoes: 0x6b4a36,
});
