import { defaultPalette, type Role } from '../../packages/voxel-actors/src';

/** One skin tone: the main color and a slightly deeper one for shaded parts. */
export interface SkinTone {
  readonly name: string;
  readonly skin: number;
  readonly skinShade: number;
}

export const skinTones: readonly SkinTone[] = [
  { name: 'Peach', skin: defaultPalette.skin, skinShade: defaultPalette.skinShade },
  { name: 'Fair', skin: 0xfbdcc4, skinShade: 0xeec3a6 },
  { name: 'Warm', skin: 0xe9ac84, skinShade: 0xd6926b },
  { name: 'Tan', skin: 0xcf9670, skinShade: 0xb97d58 },
  { name: 'Brown', skin: 0x9c6b4c, skinShade: 0x85573b },
  { name: 'Deep', skin: 0x6b4a36, skinShade: 0x583a29 },
];

/** One hair color. */
export interface HairColor {
  readonly name: string;
  readonly color: number;
}

export const hairColors: readonly HairColor[] = [
  { name: 'Brown', color: defaultPalette.hair },
  { name: 'Black', color: 0x2e2622 },
  { name: 'Blonde', color: 0xdcae5c },
  { name: 'Ginger', color: 0xc0612b },
  { name: 'Grey', color: 0xb8b2aa },
];

/** One cloth color, for the main cloth of an everyday outfit: a whole romper or jumpsuit, or a shirt. */
export interface ClothColor {
  readonly name: string;
  readonly color: number;
}

export const clothColors: readonly ClothColor[] = [
  { name: 'Pink', color: 0xf2a7b5 },
  { name: 'Purple', color: 0x7c5aa6 },
  { name: 'Blue', color: 0x5b8fd1 },
  { name: 'Green', color: 0x6fae6a },
  { name: 'Yellow', color: 0xf0c75a },
];

/**
 * The studio's color for every role, with this skin tone and hair color, and the colors of the outfit
 * worn, if any. The game will use its own palette.
 */
export function roleColors(tone: SkinTone, hair: HairColor, outfit: Partial<Record<Role, number>> = {}): Record<Role, number> {
  // The nose is just a touch darker than the skin around it.
  return { ...defaultPalette, ...outfit, skin: tone.skin, skinShade: tone.skinShade, nose: tone.skinShade, hair: hair.color };
}
