import type { HeadShape } from '../../body.js';
import type { Box } from '../../model.js';
import { balding } from './balding.js';
import { bob } from './bob.js';
import { bun } from './bun.js';
import { crewCut } from './crewCut.js';
import { longBangs } from './longBangs.js';
import { longParted } from './longParted.js';
import { ponytail } from './ponytail.js';
import { sidePart } from './sidePart.js';

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
