import type { Body } from '../../body.js';
import type { Role, Worn } from '../../model.js';
import type { Dressed } from '../outfits/outfits.js';
import { painted } from '../outfits/paint.js';
import { embroideredBoots } from './embroideredBoots.js';

export interface FootwearStyle {
  readonly build?: (body: Body) => readonly Worn[];
  readonly colors: Partial<Record<Role, number>>;
}

export const footwearStyles = {
  basicShoes: { colors: {} },
  embroideredBoots: {
    build: embroideredBoots,
    colors: { shoes: 0xfff8e9, bootPetal: 0xef7591, bootLeaf: 0x5ca96f },
  },
} satisfies Record<string, FootwearStyle>;

export type FootwearStyleName = keyof typeof footwearStyles;

/** Apply a chosen pair, or expose the feet when the choice is barefoot. */
export function applyFootwear(body: Body | Dressed, name: FootwearStyleName | null): Dressed {
  const style: FootwearStyle | undefined = name === null ? undefined : footwearStyles[name];
  return {
    ...body,
    parts: painted(body.parts, { feet: style === undefined ? 'skin' : 'shoes' }),
    colors: { ...('colors' in body ? body.colors : {}), ...style?.colors },
    worn: [...('worn' in body ? body.worn : []), ...(style?.build?.(body) ?? [])],
  };
}
