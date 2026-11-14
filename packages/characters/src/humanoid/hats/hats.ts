import type { HeadShape } from '../body';
import type { Hair } from '../hair/hair';
import type { Box } from '../model';
import { chefHat } from './chefHat';
import { cowboy } from './cowboy';
import { hardHat } from './hardHat';
import { peakedCap } from './peakedCap';
import { softCap } from './softCap';
import { strawHat } from './strawHat';

/**
 * A hat: a recipe that builds the hat for any head, from the head's
 * measurements, so one hat fits every body. Blocks are whole voxels in the
 * head's own space. A new hat is a new file in this folder, listed in `hatStyles`.
 */
export type HatStyle = (head: HeadShape) => Box[];

/** A hat fitted to one head. It hangs on the head joint, so it turns with the head. */
export interface Hat {
  readonly joint: 'head';
  readonly boxes: readonly Box[];
  /** Hair stops at this height under the hat: the hat's lowest edge. */
  readonly hairLine: number;
}

/** Every hat, by name, in the order they are offered. */
export const hatStyles = { cowboy, peakedCap, hardHat, strawHat, chefHat, softCap } satisfies Record<string, HatStyle>;

export type HatStyleName = keyof typeof hatStyles;

/** A hat of one style, fitted to one head. */
export function createHat(style: HatStyleName, head: HeadShape): Hat {
  const boxes = hatStyles[style](head);
  return { joint: 'head', boxes, hairLine: Math.min(...boxes.map((box) => box.at[1])) };
}

/** Hair as it is under a hat: cut off at the hat's hair line, so no style needs a version for hats. */
export function hairUnder(hair: Hair, hat: Hat): Hair {
  const boxes = hair.boxes.flatMap((box): Box[] => {
    const height = Math.min(box.size[1], hat.hairLine - box.at[1]);
    return height > 0 ? [{ ...box, size: [box.size[0], height, box.size[2]] }] : [];
  });
  return { ...hair, boxes };
}
