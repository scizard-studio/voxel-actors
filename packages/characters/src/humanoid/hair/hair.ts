import type { HeadShape } from '../body';
import type { Box } from '../model';
import { balding } from './balding';
import { bob } from './bob';
import { bun } from './bun';
import { crewCut } from './crewCut';
import { longBangs } from './longBangs';
import { longParted } from './longParted';
import { ponytail } from './ponytail';
import { sidePart } from './sidePart';

/**
 * A hairstyle: a recipe that builds its hair for any head, from the head's
 * measurements, so one style fits every body. Blocks are whole voxels in the
 * head's own space: x to the left, y up from the base of the head, z forward.
 * A new style is a new file in this folder, listed in `hairStyles`.
 */
export type HairStyle = (head: HeadShape) => Box[];

/** Hair fitted to one head. It hangs on the head joint, so it turns with the head. */
export interface Hair {
  readonly joint: 'head';
  readonly boxes: readonly Box[];
}

/** Every hairstyle, by name, in the order they are offered. */
export const hairStyles = { longParted, longBangs, bob, ponytail, bun, crewCut, sidePart, balding } satisfies Record<string, HairStyle>;

export type HairStyleName = keyof typeof hairStyles;

/** Hair of one style, fitted to one head. */
export function createHair(style: HairStyleName, head: HeadShape): Hair {
  return { joint: 'head', boxes: hairStyles[style](head) };
}
